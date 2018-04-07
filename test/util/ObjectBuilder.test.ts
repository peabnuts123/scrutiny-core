import { Builder, ObjectBuilder, ValidateAs } from "@app/util";
import { expect } from "chai";

// Mock interface for testing
interface IDummyInterface {
  name: string;
  value: number;
}

// Mock class for testing
class DummyClass {
  public name: string;
  public value: number;

  constructor(source: Builder<DummyClass>) {
    this.name = ValidateAs.Required(source, 'name');
    this.value = ValidateAs.Required(source, 'value');
  }
}
// tslint:disable-next-line
class NestedInterface {
  public name: string;
  public dummyInterface: IDummyInterface;

  constructor(source: Builder<NestedInterface>) {
    this.name = ValidateAs.Required(source, 'name');
    this.dummyInterface = ValidateAs.Required(source, 'dummyInterface');
  }
}
// tslint:disable-next-line
class NestedClass {
  public name: string;
  public dummyClass: DummyClass;

  constructor(source: Builder<NestedClass>) {
    this.name = ValidateAs.Required(source, 'name');
    this.dummyClass = ValidateAs.Required(source, 'dummyClass');
  }
}

describe('ObjectBuilder', () => {
  it('can create an interface-type builder with no default values', () => {
    // Test
    let dummyInterfaceBuilder = ObjectBuilder.create<IDummyInterface>();
    dummyInterfaceBuilder.name = "Hello";
    dummyInterfaceBuilder.value = 20;

    // Assert
    // If we've made it this far then we're good.
    expect(dummyInterfaceBuilder).to.not.be.null;
  });
  it('can create an interface-type builder with default values', () => {
    // Test
    let dummyInterfaceBuilder = ObjectBuilder.create<IDummyInterface>({
      name: "Hello",
      value: 20,
    });

    // Assert
    // If we've made it this far then we're good.
    expect(dummyInterfaceBuilder).to.not.be.null;
  });
  it('can create a class-type builder with no default values', () => {
    // Test
    let dummyClassBuilder = ObjectBuilder.create(DummyClass);
    dummyClassBuilder.name = "Hello";
    dummyClassBuilder.value = 20;

    // Assert
    // If we've made it this far then we're good.
    expect(dummyClassBuilder).to.not.be.null;
  });
  it('can create a class-type builder with default values', () => {
    // Test
    let dummyClassBuilder = ObjectBuilder.create(DummyClass, {
      name: "Hello",
      value: 20,
    });

    // Assert
    // If we've made it this far then we're good.
    expect(dummyClassBuilder).to.not.be.null;
  });
  it('can re-assemble a valid interface-type builder', () => {
    // Setup
    let dummyInterfaceBuilder = ObjectBuilder.create<IDummyInterface>({
      name: "Hello",
      value: 20,
    });

    // Test
    let dummyInterface = ObjectBuilder.assemble(dummyInterfaceBuilder);

    // Assert
    // If we've made it this far then we're good.
    expect(dummyInterface).to.not.be.null;
  });
  it('can re-assemble a valid class-type builder', () => {
    // Setup
    let dummyClassBuilder = ObjectBuilder.create(DummyClass, {
      name: "Hello",
      value: 20,
    });

    // Test
    let dummyClass = ObjectBuilder.assemble(dummyClassBuilder);

    // Assert
    // If we've made it this far then we're good.
    expect(dummyClass).to.be.an.instanceOf(DummyClass);
  });
  it('fails to re-assemble an invalid interface-type builder', () => {
    // Setup
    let dummyInterfaceBuilder = ObjectBuilder.create<IDummyInterface>();

    // Test
    let testFunc = () => {
      ObjectBuilder.assemble(dummyInterfaceBuilder);
    };

    // Assert
    expect(testFunc).to.throw;
  });
  it('fails to re-assemble an invalid class-type builder', () => {
    // Setup
    let dummyClassBuilder = ObjectBuilder.create(DummyClass);

    // Test
    let testFunc = () => {
      ObjectBuilder.assemble(dummyClassBuilder);
    };

    // Assert
    expect(testFunc).to.throw;
  });
  describe('needsAssembling', () => {
    it('returns true for a class-type Builder instance', () => {
      // Setup
      let dummyClassBuilder = ObjectBuilder.create(DummyClass);

      // Test
      let needsAssembling = ObjectBuilder.needsAssembling(dummyClassBuilder);

      // Assert
      expect(needsAssembling).to.be.true;
    });
    it('returns true for an interface-type Builder instance', () => {
      // Setup
      let dummyInterfaceBuilder = ObjectBuilder.create<IDummyInterface>();

      // Test
      let needsAssembling = ObjectBuilder.needsAssembling(dummyInterfaceBuilder);

      // Assert
      expect(needsAssembling).to.be.true;
    });
    it('returns false for non-builder instance', () => {
      // Setup
      let dummyObject: IDummyInterface = {
        name: "Hello",
        value: 20,
      };

      // Test
      let needsAssembling = ObjectBuilder.needsAssembling(dummyObject);

      // Assert
      expect(needsAssembling).to.be.false;
    });
    it('returns false for a null or undefined object', () => {
      // Test
      let nullNeedsAssembling = ObjectBuilder.needsAssembling(null);
      let undefinedNeedsAssembling = ObjectBuilder.needsAssembling(undefined);

      // Assert
      expect(nullNeedsAssembling).to.be.false;
      expect(undefinedNeedsAssembling).to.be.false;
    });
  });
  it('can re-assemble a valid interface nested within a valid class', () => {
    // Setup
    let nestedInterfaceBuilder = ObjectBuilder.create(NestedInterface, {
      name: "Hello",
      dummyInterface: {
        name: "Hello",
        value: 20,
      },
    });

    // Test
    let nestedInterface = ObjectBuilder.assemble(nestedInterfaceBuilder);

    // Assert
    expect(nestedInterface).to.be.an.instanceOf(NestedInterface);
  });
  it('can re-assemble a valid class nested within a valid class', () => {
    // Setup
    let nestedClassBuilder = ObjectBuilder.create(NestedClass, {
      name: "Hello",
      dummyClass: {
        name: "Hello",
        value: 20,
      },
    });

    // Test
    let nestedClass = ObjectBuilder.assemble(nestedClassBuilder);

    // Assert
    expect(nestedClass).to.be.an.instanceOf(NestedClass);
  });
  it('can re-assemble an interface-type builder nested within a valid class', () => {
    // Setup
    let nestedInterfaceBuilder = ObjectBuilder.create(NestedInterface, {
      name: "Hello",
      dummyInterface: ObjectBuilder.create<IDummyInterface>({
        name: "Hello",
        value: 20,
      }),
    });

    // Test
    let nestedInterface = ObjectBuilder.assemble(nestedInterfaceBuilder);

    // Assert
    expect(nestedInterface).to.be.an.instanceOf(NestedInterface);
  });
  it('can re-assemble a class-type builder nested within a valid class', () => {
    // Setup
    let nestedClassBuilder = ObjectBuilder.create(NestedClass, {
      name: "Hello",
      dummyClass: ObjectBuilder.create(DummyClass, {
        name: "Hello",
        value: 20,
      }),
    });

    // Test
    let nestedClass = ObjectBuilder.assemble(nestedClassBuilder);

    // Assert
    expect(nestedClass).to.be.an.instanceOf(NestedClass);
  });
});