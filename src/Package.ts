import _ from 'lodash';

import { Builder } from '@app/util';
import { ValidateAs } from '@app/util';

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
    this.details = ValidateAs.RequiredOnCondition(source, 'details', () => !this.hasError);
  }

  // @TODO This may need to be a bit more sophisticated
  public get PackageSpecifier(): string {
    return `${this.name}@${this.version}`;
  }
}