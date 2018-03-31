import { exec } from 'child_process';



export default async function execAsync(shellCommand: string, logCommand: boolean = false): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (logCommand) {
      console.log(`Invoking shell command '${shellCommand}'`);
    }
    exec(shellCommand, (error: Error | null, stdout: string) => {
      if (error) {
        reject(stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}
