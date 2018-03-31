import { build } from '@app/scripts';
import { getBaseBuildConstants } from '@app/scripts/util';

(async () => {
  const buildConstants = getBaseBuildConstants();
  await build(buildConstants);
})();