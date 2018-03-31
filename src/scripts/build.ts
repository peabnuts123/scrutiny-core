import { IBuildConstantsBase, rewriteImports } from '@app/scripts/util';
import { execAsync } from '@app/util';

export default async function build(buildConstants: IBuildConstantsBase) {
  // Subscribe to SIGINT for this process
  process.on('SIGINT', cleanUp);
  process.on('exit', cleanUp);

  try {
  // Clean previous build before building
  console.log(await execAsync(`npm run build--clean`));

  // Compile typescript
  console.log(await execAsync(`tsc --project .`, true));

  // Enter build folder
  process.chdir(buildConstants.tsBuildFolder);

  console.log("Rewriting import statements");
  rewriteImports('src', buildConstants);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }

  function cleanUp() {
    // Exit
    process.exit();
  }
}