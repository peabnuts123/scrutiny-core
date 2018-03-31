import { cleanBuild } from "@app/scripts";
import { getBaseBuildConstants } from "@app/scripts/util";

const buildConstants = getBaseBuildConstants();

const foldersToClean: string[] = [
  buildConstants.publishDirectory,
  buildConstants.tsBuildFolder,
  'processing-package',
];

(async () => {
  await cleanBuild(foldersToClean);
})();