import { deploy } from '@app/scripts';
import { getBaseBuildConstants } from '@app/scripts/util';
import { execAsync } from '@app/util';

const ERROR_CODES = {
  COPY_TYPES_FAILED: 210,
};

(async () => {
  let buildConstants = getBaseBuildConstants();

  await deploy(buildConstants, {
    additionalStepWork: {
      async step05() {
        try {
          // Copy types into build directory
          await execAsync(`cp -r ../src/types ./types`);
        } catch (e) {
          console.error(e);
          console.error("Failed to copy types into output directory");
          // @FAILURE
          process.exit(ERROR_CODES.COPY_TYPES_FAILED);
        }
      },
    },
  });
})();