import { Builder, DeepPartial,  ObjectBuilder } from "@app/util";
import _ from "lodash";

// @TODO this and ObjectBuilder can probably be an entirely separate package

const ValidateAs = {
  /**
   * Get the real value of a property, expecting it to have a value.
   * Any attempts to get the value of something nil will throw an error
   *
   * @param sourceBuilder Builder object to get property from
   * @param propertyName Name of property to read from builder object
   * @returns Real value of property
   * @throws Error if property is nil
   */
  Required<T, K extends keyof T>(sourceBuilder: Builder<T>, propertyName: K): T[K] {
    let source = sourceBuilder as DeepPartial<T>;

    if (_.isNil(source[propertyName])) {
      throw new Error(`Property '${propertyName}' is undefined, but marked as required`);
    } else {
      return resolveValue(source, propertyName);
    }
  },

  /**
   * Get the real value of a property, expecting it to have a value if `isRequired` returns true.
   * If `isRequired` does not return true, the value returned from `RequiredOnCondition` may be null.
   * Any attempts to get the value of something that is nil when `isRequired` returns true will throw an error.
   * @param sourceBuilder Builder object to get property from
   * @param propertyName Name of property to read from builder object
   * @param isRequired function that returns true or false to indicate whether `sourceBuilder[propertyName]` is required to have a value or not
   * @returns Real value of property, may be null
   * @throws Error if `sourceBuilder[propertyName]` is nil and `isRequired` returns true
   */
  RequiredOnCondition<T, K extends keyof T>(sourceBuilder: Builder<T>, propertyName: K, isRequired: () => boolean): T[K] | null {
    let source = sourceBuilder as DeepPartial<T>;

    // If dependent property is not nil, validate as required
    if (isRequired()) {
      return ValidateAs.Required(sourceBuilder, propertyName);
    } else {
      // Otherwise, not required, but may still have a value
      return resolveValue(source, propertyName);
    }
  },
};

function resolveValue<T, K extends keyof T>(source: DeepPartial<T>, propertyName: K): T[K] {
  let propertyValue: Builder<T[K]> | DeepPartial<T[K]> | T[K] | undefined = source[propertyName];

  // If property is another builder, assemble it
  if (ObjectBuilder.needsAssembling(propertyValue)) {
    return ObjectBuilder.assemble(propertyValue as Builder<T[K]>);
  } else {
    // If property is a plain value, just cast it
    return propertyValue as T[K];
  }
}

export default ValidateAs;