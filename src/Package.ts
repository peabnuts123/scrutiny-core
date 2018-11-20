import _ from 'lodash';

import { Builder, ValidateAs } from '@app/util';

export interface IPackageDetails {
  publishDate: Date | null;
  publishAuthor: string | null;
  version: string;
  isVersionDataMissing: boolean;
  name: string;
  repositoryUrl: string;
  homepage: string;
  license: string;
}

export function AssemblePackageDetails(source: Builder<IPackageDetails>): IPackageDetails {
  return {
    publishDate: ValidateAs.Optional(source, 'publishDate'),
    publishAuthor: ValidateAs.Optional(source, 'publishAuthor'),
    version: ValidateAs.Required(source, 'version'),
    isVersionDataMissing: ValidateAs.Required(source, 'isVersionDataMissing'),
    name: ValidateAs.Required(source, 'name'),
    repositoryUrl: ValidateAs.Optional(source, 'repositoryUrl', ''),
    homepage: ValidateAs.Optional(source, 'homepage', ''),
    license: ValidateAs.Optional(source, 'license', ''),
  };
}

export default class Package {
  public name: string;
  public version: string;
  public hasError: boolean = false;
  public error: any;
  public details: IPackageDetails | null;

  constructor(source: Builder<Package>) {
    this.name = ValidateAs.Required(source, 'name');
    this.version = ValidateAs.Required(source, 'version');
    this.hasError = _.defaultTo(source.hasError, false);
    this.error = source.error;
    this.details = ValidateAs.RequiredOnCondition(source, 'details', () => this.didSucceed());
  }

  public didSucceed(): this is ISuccessfulPackage {
    return !this.hasError;
  }

  public didFail(): this is IFailedPackage {
    return !this.didSucceed();
  }

  // @TODO This may need to be a bit more sophisticated
  public get PackageSpecifier(): string {
    return `${this.name}@${this.version}`;
  }

  public static Assemble(source: Builder<Package>): Package {
    return new Package(source);
  }
}

/**
 * Interfaces for packages that installed successfully / failed to install.
 * Useful for dealing with collections of Packages that ALL succeeded/failed to avoid
 * having to wrap every reference in a call to `didSucceed()/didFail()`
 */
export interface ISuccessfulPackage extends Package {
  hasError: false;
  details: IPackageDetails;
}
export interface IFailedPackage extends Package {
  hasError: true;
  details: null;
}
