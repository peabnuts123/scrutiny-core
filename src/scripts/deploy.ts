import _ from 'lodash';
import Registry from 'npm-registry';
import semver from 'semver';
import { promisify } from 'util';
// import { argv } from 'yargs';

import { IBuildConstantsBase } from '@app/scripts/util';
import { execAsync, getJson } from '@app/util';

// Error codes for determining the cause of failures
const ERROR_CODES = {
  REGISTRY_INFO_FAILED: 100,
  LOCAL_VERSION_NOT_GREATER_THAN_REGISTRY: 101,
  LINT_FAILED: 102,
  TEST_FAILED: 103,
  BUILD_FAILED: 104,
  COPY_PACKAGE_JSON_FAILED: 105,
  NPM_ACCESS_TOKEN_EMPTY: 106,
  CREATING_NPMRC_FAILED: 107,
  PUBLISH_FAILED: 108,
  REMOVE_BUILT_TESTS_FAILED: 109,
  COPY_PROJECT_TO_PUBLISH_DIRECTORY_FAILED: 111,
};

export enum Steps {
  step01,
  step02,
  step03,
  step04,
  step05,
  step06,
  step07,
}

export type AdditionalStepWorkCallbacks = {
  [key in keyof typeof Steps]?: () => void
};

export interface IDeployOptions {
  additionalStepWork?: AdditionalStepWorkCallbacks;
  skippedSteps?: Array<Steps>;
}

// Execution takes place in async function
export default async function deploy(buildConstants: IBuildConstantsBase, options?: IDeployOptions) {
  // Option defaults
  options = _.defaultTo(options, {});
  options.additionalStepWork = _.defaultTo(options.additionalStepWork, {});
  options.skippedSteps = _.defaultTo(options.skippedSteps, []);

  // ------------------------------------------------------------

  let isStep01Skipped = isStepSkipped(Steps.step01, options.skippedSteps);
  console.log(`-- STEP 01 ${isStep01Skipped ? '(SKIPPED)' : ''} --`);
  console.log(`-- Compare latest version of package with current version`);
  console.log(`-- Fail the build if semver has not increased since last release`);

  if (!isStep01Skipped) {
    // Get package.json details
    const localPackageInfo = getJson('./package.json');

    // Create Registry object
    const npm = new Registry({
      registry: 'https://registry.npmjs.org',
    });

    try {
      // Get first package from list
      const [registryPackageInfo] = await promisify(npm.packages.get.bind(npm.packages))(localPackageInfo.name);

      if (!semver.gt(localPackageInfo.version, registryPackageInfo.version)) {
        // @FAILURE
        console.error(`Local version of '${localPackageInfo.name}' (${localPackageInfo.version}) is not greater than registry version: '${registryPackageInfo.version}'`);
        process.exit(ERROR_CODES.LOCAL_VERSION_NOT_GREATER_THAN_REGISTRY);
      } else {
        console.log(`Success! Local version of '${localPackageInfo.name}@${localPackageInfo.version}' is greater than remote '${registryPackageInfo.name}@${registryPackageInfo.version}'.`);
      }

    } catch (e) {
      // Do not stop execution if error is because of 404
      if (e.message === 'Invalid status code: 404' && e.statusCode === 404) {
        console.log(`Package '${localPackageInfo.name}' not found on npm registry. Presumably this is because this is the first deployment. Publish shall continue…`);
      } else {
        // Any other error occurred
        console.error(e);
        console.error(`Failed getting registry details for '${localPackageInfo.name}'`);
        // @FAILURE
        process.exit(ERROR_CODES.REGISTRY_INFO_FAILED);
      }
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step01);
  }

  // ------------------------------------------------------------

  let isStep02Skipped = isStepSkipped(Steps.step02, options.skippedSteps);
  console.log(`-- STEP 02 ${isStep02Skipped ? '(SKIPPED)' : ''} --`);
  console.log(`-- Ensure the linter returns no issues`);

  if (!isStep02Skipped) {
    try {
      // Invoke lint command
      console.log(await execAsync('npm run lint'));

      console.log("Success! Linting returned no errors.");
    } catch (e) {
      console.error(e);
      console.error("Linting failed.");
      // @FAILURE
      process.exit(ERROR_CODES.LINT_FAILED);
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step02);
  }

  // ------------------------------------------------------------

  let isStep03Skipped = isStepSkipped(Steps.step03, options.skippedSteps);
  console.log(`-- STEP 03 ${isStep03Skipped ? '(SKIPPED)' : ''} -- `);
  console.log(`-- Ensure all tests pass`);

  if (!isStep03Skipped) {
    try {
      // Invoke test command
      console.log(await execAsync('npm test'));

      console.log("Success! All tests executed without error.");
    } catch (e) {
      console.error(e);
      console.error("Testing failed.");
      // @FAILURE
      process.exit(ERROR_CODES.TEST_FAILED);
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step03);
  }

  // ------------------------------------------------------------

  let isStep04Skipped = isStepSkipped(Steps.step04, options.skippedSteps);
  console.log(`-- STEP 04 ${isStep04Skipped ? '(SKIPPED)' : ''} -- `);
  console.log(`-- Build the project. Fail the build if this does not succeed`);

  if (!isStep04Skipped) {
    try {
      // Invoke build command
      console.log(await execAsync('npm run build'));

      console.log("Success! Built project without error.");
    } catch (e) {
      console.error(e);
      console.error("Build failed.");
      // @FAILURE
      process.exit(ERROR_CODES.BUILD_FAILED);
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step04);
  }

  // ------------------------------------------------------------

  let isStep05Skipped = isStepSkipped(Steps.step05, options.skippedSteps);
  console.log(`-- STEP 05 ${isStep05Skipped ? '(SKIPPED)' : ''} --`);
  console.log(`-- Copy project, package.json, and cd into the build directory`);

  if (!isStep05Skipped) {
    try {
      // Copy project to publish directory
      await execAsync(`cp -r ${buildConstants.tsBuildFolder}/src ${buildConstants.publishDirectory}`);
    } catch (e) {
      console.error(e);
      console.error("Failed to copy project to publish directory");
      // @FAILURE
      process.exit(ERROR_CODES.COPY_PROJECT_TO_PUBLISH_DIRECTORY_FAILED);
    }

    try {
      // Copy package.json into build directory
      await execAsync(`cp package.json ${buildConstants.publishDirectory}`);
    } catch (e) {
      console.error(e);
      console.error("Failed to copy package.json into output directory");
      // @FAILURE
      process.exit(ERROR_CODES.COPY_PACKAGE_JSON_FAILED);
    }

    // cd into build directory
    process.chdir(buildConstants.publishDirectory);

    console.log(`Success! Copied package.json and entered build directory '${buildConstants.publishDirectory}'.`);

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step05);
  }

  // ------------------------------------------------------------

  let isStep06Skipped = isStepSkipped(Steps.step06, options.skippedSteps);
  console.log(`-- STEP 06 ${isStep06Skipped ? '(SKIPPED)' : ''} --`);
  console.log(`-- Set up environment for publishing to npm`);

  if (!isStep06Skipped) {
    try {
      // Get npm access token for deployment
      const NPM_ACCESS_TOKEN = process.env.NPM_ACCESS_TOKEN;

      // Ensure access token is not empty
      if (_.isEmpty(NPM_ACCESS_TOKEN)) {
        console.error("npm access token is empty");
        // @FAILURE
        process.exit(ERROR_CODES.NPM_ACCESS_TOKEN_EMPTY);
      }

      // Create .npmrc
      await execAsync(`echo '//registry.npmjs.org/:_authToken=${NPM_ACCESS_TOKEN}' > .npmrc`);

      console.log("Success! Created .npmrc file with npm access token.");
    } catch (e) {
      console.error(e);
      console.error("Failed to create .npmrc file");
      // @FAILURE
      process.exit(ERROR_CODES.CREATING_NPMRC_FAILED);
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step06);
  }

  // ------------------------------------------------------------

  // @TODO re-enable
  const isDryRun = true; // argv['dry-run'];
  let isStep07Skipped = isStepSkipped(Steps.step07, options.skippedSteps) || isDryRun;
  console.log(`-- STEP 07 ${isStep07Skipped ? '(SKIPPED)' : ''} --`);
  console.log(`-- Publish to npm`);

  // Don't deploy if --dry-run`
  if (!isStep07Skipped) {
    try {
      // Publish package to npm
      console.log(await execAsync('npm publish'));

      console.log("Success! Published to npm.");
    } catch (e) {
      console.error(e);
      console.error("Failed to publish package to npm");
      // @FAILURE
      process.exit(ERROR_CODES.PUBLISH_FAILED);
    }

    // Call additional work
    await maybeCallAdditionalStepFunction(options.additionalStepWork.step07);
  }
}

function isStepSkipped(step: Steps, skippedSteps: Array<Steps>): boolean {
  return _.includes(skippedSteps, step);
}

async function maybeCallAdditionalStepFunction(func?: () => void): Promise<void> {
  if (func) {
    await func();
  }
}