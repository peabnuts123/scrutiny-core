import { exec } from 'child_process';


export default async function execAsync(shellCommand: string, logCommand: boolean = false): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (logCommand) {
      console.log(`Invoking shell command '${shellCommand}'`);
    }
    exec(shellCommand, (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        // @NOTE: most things print their errors to stdout because reasons
        reject(stderr || stdout || "(EMPTY) Empty error - execAsync returned nothing");
      } else {
        resolve(stdout);
      }
    });
  });
}
