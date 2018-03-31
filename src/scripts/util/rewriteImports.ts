import fs from 'fs';
import _ from 'lodash';
import path from 'path';

import { IBuildConstantsBase } from '@app/scripts/util';

// Regex for imports in .ts files
const importStatementRegex = /(from\s+['"])([^'"]+)(['"])/g;
// Regex for imports in .js files
const requireStatementRegex = /(require\s*\(\s*['"])([^'"]+)(['"]\s*\))/g;

// @TODO move out into a TsConfig.d.ts at some point
interface IConfigPaths {
  [key: string]: string[];
}

interface IRewriteRule {
  matchRegex: RegExp;
  replacement: string;
}

export default async function rewriteImports(relativeDirectoryPath: string, buildConstants: IBuildConstantsBase) {
  let baseUrl: string = buildConstants.tsConfig.compilerOptions.baseUrl;
  let pathsRaw: IConfigPaths = buildConstants.tsConfig.compilerOptions.paths;

  // Build up a dictionary of rewrite rules from tsconfig
  let rewriteRules: IRewriteRule[] = [];

  // For each key in paths e.g. '@app/*'
  for (let rewriteOutput in pathsRaw) {
    // Construct key into a regex e.g. /^app/(.*)$/
    let rewriteOutputRegex: RegExp = new RegExp('^' + rewriteOutput.replace('*', '(.*)') + '$');

    // Validate our paths are an array of length 1
    let allRewriteInputs: string[] = pathsRaw[rewriteOutput];
    if (allRewriteInputs.length > 1) {
      throw new Error("Cannot convert tsconfig paths. Value must be an array of length 1");
    } else {
      // Convert path value into replacement regex e.g. src/* -> $baseUrl/src/$1
      let replacement: string = path.join(baseUrl, allRewriteInputs[0].replace('*', '$1'));

      // Store these in array
      rewriteRules.push({
        matchRegex: rewriteOutputRegex,
        replacement,
      });
    }
  }

  // Get all files with extensions .js, .ts
  let allFiles: string[] = getAllFilesWithExtensions(relativeDirectoryPath, ['.js', '.ts']);

  allFiles.forEach((filePath: string) => {
    // Read contents of file
    let fileContents: string = fs.readFileSync(filePath, { encoding: 'utf8' });

    // Choose a regex based on file extension
    let regex: RegExp;
    if (path.extname(filePath) === '.ts') {
      regex = importStatementRegex;
    } else if (path.extname(filePath) === '.js') {
      regex = requireStatementRegex;
    } else {
      throw new Error(`Cannot rewrite imports for file with extension: ${path.extname(filePath)}`);
    }

    // Rewrite imports
    fileContents = fileContents.replace(regex, (_match, $1, $2, $3) => {
      return $1 + reversePathAliasing(filePath, $2, rewriteRules) + $3;
    });

    // Write file back out to disk
    fs.writeFileSync(filePath, fileContents);
  });
}

function reversePathAliasing(file: string, inputPath: string, rewriteRules: IRewriteRule[]): string {
  let replacedPath: string | null = null;

  for (let rewriteRule of rewriteRules) {
    // Test each rewrite rule against aliasedPath
    if (rewriteRule.matchRegex.test(inputPath)) {
      // If test succeeds, replace with rewrite rule replacement
      replacedPath = inputPath.replace(rewriteRule.matchRegex, rewriteRule.replacement);
      break;
    }
  }

  // path matched no rewrite rules, return original path (e.g. npm package import)
  if (replacedPath === null) {
    return inputPath;
  }

  // Prepend `./` so that paths are ALWAYS relative
  return `.${path.sep}${path.relative(path.dirname(file), replacedPath)}`;
}

function getAllFilesWithExtensions(folder: string, extensions: string[]): string[] {
  let allFiles: string[] = [];

  // Read contents of directory
  fs.readdirSync(folder).forEach((fsNode: string) => {
    let fsNodePath: string = path.join(folder, fsNode);
    let fsNodeStats = fs.statSync(fsNodePath);

    if (fsNodeStats.isFile()) {
      // If file has correct extension
      if (_.includes(extensions, path.extname(fsNodePath).toLowerCase())) {
        allFiles.push(fsNodePath);
      } // else do nothing (wrong extension)
    } else if (fsNodeStats.isDirectory()) {
      // Get all files from child folder
      allFiles = allFiles.concat(getAllFilesWithExtensions(fsNodePath, extensions));
    }
  });

  return allFiles;
}
