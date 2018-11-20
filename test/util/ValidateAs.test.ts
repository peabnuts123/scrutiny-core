import { Builder, ObjectBuilder, ValidateAs } from '@app/util';
import { expect } from 'chai';

// Constants
const PROPERTY_KEY = 'property';

// Types
interface IPropertyHolder {
  [PROPERTY_KEY]: any;
}
function AssemblePropertyHolder(source: Builder<IPropertyHolder>): IPropertyHolder {
  return source as IPropertyHolder;
}
class DummyClass {
  public name: string;
  public value: number;

  constructor(sourceBuilder: Builder<DummyClass>) {
    this.name = sourceBuilder.name as string;
    this.value = sourceBuilder.value as number;
  }

  public static Assemble(source: Builder<DummyClass>): DummyClass {
    return new DummyClass(source);
  }
}
interface IDummyObject {
  name: string;
  value: number;
}


describe('ValidateAs', () => {
  describe('Required', () => {
    it('returns the value of a primitive property', () => {
      // Setup
      let propertyValue = 'primitive';
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.Required(source, PROPERTY_KEY);

      // Assert
      expect(value).to.equal(propertyValue);
    });
    it('returns the value of an interface property', () => {
      // Setup
      let propertyValue: IDummyObject = {
        name: "Hello",
        value: 20,
      };
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.Required(source, PROPERTY_KEY);

      // Assert
      expect(value).to.equal(propertyValue);
    });
    it('returns the value of a nested Builder instance property', () => {
      // Setup
      let propertyValue = ObjectBuilder.create(DummyClass.Assemble, {
        name: "Hello",
        value: 20,
      });
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.Required(source, PROPERTY_KEY) as DummyClass;

      // Assert
      expect(value).to.be.an.instanceOf(DummyClass);
      expect(value.name).to.equal(propertyValue.name);
      expect(value.value).to.equal(propertyValue.value);
    });
    it('throws an error when requested property is null', () => {
      // Setup
      let propertyValue = null;
      let source = createDummyObject(propertyValue);

      // Test
      let testFunc = () => {
        ValidateAs.Required(source, PROPERTY_KEY);
      };

      // Assert
      expect(testFunc).to.throw();
    });
    it('throws an error when requested property is undefined', () => {
      // Setup
      // tslint:disable-next-line:no-unnecessary-initializer
      let propertyValue = undefined;
      let source = createDummyObject(propertyValue);

      // Test
      let testFunc = () => {
        ValidateAs.Required(source, PROPERTY_KEY);
      };

      // Assert
      expect(testFunc).to.throw();
    });
  });
  describe('RequiredOnCondition', () => {
    it('returns the value of a primitive property when isRequired returns true', () => {
      // Setup
      let propertyValue = 'property';
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => true);

      // Assert
      expect(value).to.equal(propertyValue);
    });
    it('throws an error when requested property is null and isRequired returns true', () => {
      // Setup
      let propertyValue = null;
      let source = createDummyObject(propertyValue);

      // Test
      let testFunc = () => {
        ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => true);
      };

      // Assert
      expect(testFunc).to.throw();
    });
    it('returns the value of a primitive property when not required', () => {
      // Setup
      let propertyValue = 'primitive';
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => false);

      // Assert
      expect(value).to.equal(propertyValue);
    });
    it('returns the value of an interface property when not required', () => {
      // Setup
      let propertyValue: IDummyObject = {
        name: "Hello",
        value: 20,
      };
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => false);

      // Assert
      expect(value).to.equal(propertyValue);
    });
    it('returns the value of a nested Builder instance property when not required', () => {
      // Setup
      let propertyValue = ObjectBuilder.create(DummyClass.Assemble, {
        name: "Hello",
        value: 20,
      });
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => false) as DummyClass;

      // Assert
      expect(value).to.be.an.instanceOf(DummyClass);
      expect(value.name).to.equal(propertyValue.name);
      expect(value.value).to.equal(propertyValue.value);
    });
    it('returns null when property does not contain a value and not required', () => {
      // Setup
      // tslint:disable-next-line:no-unnecessary-initializer
      let propertyValue = undefined;
      let source = createDummyObject(propertyValue);

      // Test
      let value = ValidateAs.RequiredOnCondition(source, PROPERTY_KEY, () => false);

      // Assert
      expect(value).to.equal(null);
    });
  });
});

function createDummyObject(propertyValue: any) {
  return ObjectBuilder.create(AssemblePropertyHolder, {
    [PROPERTY_KEY]: propertyValue,
  });
}