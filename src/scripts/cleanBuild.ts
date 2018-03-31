import rimraf from 'rimraf';
import { promisify } from 'util';

const rimrafAsync = promisify(rimraf);

/**
 * Remove a set of folders/files from disk
 */
export default async function cleanBuild(foldersToClean: string[]) {
  await Promise.all(foldersToClean.map((folder) => rimrafAsync(folder)));
}