import { getJson } from '@app/util';

export interface IBuildConstantsBase {
  tsConfig: any;
  tsBuildFolder: string;
  publishDirectory: string;
}

export default function getBaseBuildConstants(): IBuildConstantsBase {
  // Build folder constants
  // @TODO make /find a type declaration for tsconfig
  const tsConfig = getJson('./tsconfig.json');

  return {
    tsConfig,                                                   // Instance of tsConfig
    tsBuildFolder: tsConfig.compilerOptions.outDir,        // Folder tsconfig is set to build into
    publishDirectory: '_publish',
  };
}