import { ChildProcess, spawn } from 'child_process';

export interface ISpawnProcessOptions {
  listen: boolean;
}

const defaultOptions: ISpawnProcessOptions = {
  listen: true,   // Whether the output from the child process should be logged to console
};

/**
 *  Spawn a child process and optionally listen to its output.
 *
 *  @param fullCommand  A full shell command e.g. "grep hello"
 *  @param options Options object (see `defaultOptions` for information)
 *  @returns ChildProcess instance (see https://nodejs.org/api/child_process.html#child_process_class_childprocess)
 */
export default function spawnProcess(fullCommand: string, options: ISpawnProcessOptions = defaultOptions): ChildProcess {
  // Split up args by space
  let [shellCommand, ...args] = fullCommand.split(/\s/);

  // Create process
  let childProcess: ChildProcess = spawn(shellCommand, args);

  // Subscribe to stdout, stderr if listen = true
  if (options.listen) {
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  }

  return childProcess;
}