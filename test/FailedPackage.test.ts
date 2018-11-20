import _ from 'lodash';

import Package, { IFailedPackage, IPackageDetails } from '@app/Package';
import { Builder, ObjectBuilder } from "@app/util";
import { expect } from 'chai';

describe('IFailedPackage', () => {
  it("Can be assigned from a failed package", () => {
    // Setup
    let pkg: Package = CreatePackage({
      details: null,
      hasError: true,
      error: "Forced error - Testing",
    });

    // Test
    let testFunc = () => {
      if (pkg.didFail()) {
        pkg as IFailedPackage;
      } else {
        throw new Error("Test broke.");
      }
    };

    // Assert
    expect(testFunc).not.to.throw();
  });
});

function CreatePackage(overrides: Partial<Package> = {}, detailsOverrides: Partial<IPackageDetails> = {}): Package {
  let packageBuilder: Builder<Package> = ObjectBuilder.create(Package.Assemble, {
    details: {
      homepage: "https://github.com/peabnuts123/mock-package",
      isVersionDataMissing: false,
      license: "UNLICENSED",
      name: "mock-package",
      publishAuthor: "peabnuts123",
      publishDate: new Date(2018, 3, 18),
      repositoryUrl: "https://github.com/peabnuts123/mock-package.git",
      version: "0.1.0",
    },
    hasError: false,
    name: "mock-package",
    version: "0.1.0",
  });

  _.assign(packageBuilder.details, detailsOverrides);
  _.assign(packageBuilder, overrides);

  return ObjectBuilder.assemble(packageBuilder);
}