declare type NpmInstallAction = "add" | "remove" | "update" | "move";

declare interface NpmInstallPackage {
  action: NpmInstallAction,
  name: string,
  version: string,
  path: string,
}

declare interface NpmInstallOutput {
  added: NpmInstallPackage[],
  // @TODO confirm these are correct, I don't quite know / care
  removed: NpmInstallPackage[],
  updated: NpmInstallPackage[],
  moved: NpmInstallPackage[],
  // @TODO find an example of "failed"
  failed: any,
  warnings: string[],
  elapsed: number
}
