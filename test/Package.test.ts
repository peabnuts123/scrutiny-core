import { expect } from 'chai';
import _ from 'lodash';

import { IPackageDetails, Package } from '@app/index';
import { Builder, ObjectBuilder } from '@app/util';

describe("Package", () => {
  describe("construction", () => {
    it("is successful given correct data", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder();

      // Test
      let pkg = ObjectBuilder.assemble(packageBuilder);
      expect(pkg).to.be.an.instanceOf(Package);
    });
    it("fails when missing `name` parameter", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({
        name: undefined,
      });

      // Test
      let testFunc = () => {
        ObjectBuilder.assemble(packageBuilder);
      };

      // Assert
      expect(testFunc).to.throw();
    });
    it("fails when missing `version` parameter", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({
        version: undefined,
      });

      // Test
      let testFunc = () => {
        ObjectBuilder.assemble(packageBuilder);
      };

      // Assert
      expect(testFunc).to.throw();
    });
    it("fails when missing `details` parameter", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({
        details: undefined,
      });

      // Test
      let testFunc = () => {
        ObjectBuilder.assemble(packageBuilder);
      };

      // Assert
      expect(testFunc).to.throw();
    });
    it("without hasError parameter defaults to false", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({
        hasError: undefined,
      });

      // Test
      let pkg = ObjectBuilder.assemble(packageBuilder);

      // Assert
      expect(pkg.hasError).to.be.false;
    });
    it("with an error is allowed to have no `details` property", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({
        details: undefined,
        error: "MOCK ERROR",
        hasError: true,
      });

      // Test
      let pkg = ObjectBuilder.assemble(packageBuilder);

      // Assert
      expect(pkg).to.be.an.instanceOf(Package);
    });
    it("fails without all required details properties", () => {
      // Setup
      let packageBuilder = CreateMockPackageBuilder({}, {
        publishAuthor: undefined,
      });

      // Test
      let testFunc = () => {
        ObjectBuilder.assemble(packageBuilder);
      };

      // Assert
      expect(testFunc).to.throw;
    });
  });
});

function CreateMockPackageBuilder(overrides: Partial<Package> = {}, detailsOverrides: Partial<IPackageDetails> = {}): Builder<Package> {
  let packageBuilder: Builder<Package> = ObjectBuilder.create(Package, {
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

  return _.assign(packageBuilder, overrides);
}