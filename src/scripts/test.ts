import { execAsync } from '@app/util';

export default async function test() {
  // Run mocha
  try {
    console.log(await execAsync(`mocha -r ts-node/register -r tsconfig-paths/register "test/**/*.test.ts"`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}