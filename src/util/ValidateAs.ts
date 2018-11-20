import { Builder, DeepPartial, ObjectBuilder } from "@app/util";
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
  Required<T, K extends keyof T>(sourceBuilder: DeepPartial<T>, propertyName: K): T[K] {
    let propertyValue: Builder<T[K]> | T[K] | undefined = sourceBuilder[propertyName];

    if (_.isNil(propertyValue)) {
      throw new Error(`Property '${propertyName}' is undefined, but marked as required`);
    } else {
      return resolveValue(propertyValue);
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
  RequiredOnCondition<T, K extends keyof T>(sourceBuilder: DeepPartial<T>, propertyName: K, isRequired: () => boolean): T[K] | null {
    // If dependent function returns true, validate as required
    if (isRequired()) {
      return ValidateAs.Required(sourceBuilder, propertyName);
    } else {
      // Otherwise, not required, validate as Optional
      return ValidateAs.Optional(sourceBuilder, propertyName);
    }
  },

  // Definition below to allow for method overloads
  Optional,
};

/**
 * Attempt to resolve the value of a property, but default to null if it is nil
 * @param sourceBuilder Builder object to get property from
 * @param propertyName Name of property to read from builder object
 * @returns Either the resolved value or null
 */
function Optional<T, K extends keyof T>(sourceBuilder: DeepPartial<T>, propertyName: K): T[K] | null;
/**
 * Attempt to resolve the value of a property, but default to `defaultValue` if it is nil
 * @param sourceBuilder Builder object to get property from
 * @param propertyName Name of property to read from builder object
 * @param defaultValue Default value to return if `sourceBuilder[propertyName]` is nil
 * @returns Either resolved value of `sourceBuilder[propertyName]` or `defaultValue`
 */
function Optional<T, K extends keyof T, TDefault extends T[K]>(sourceBuilder: DeepPartial<T>, propertyName: K, defaultValue: TDefault): T[K];
function Optional<T, K extends keyof T, TDefault extends T[K]>(sourceBuilder: DeepPartial<T>, propertyName: K, defaultValue: TDefault | null = null) {
  // let source = sourceBuilder as DeepPartial<T>;
  let propertyValue: Builder<T[K]> | T[K] | undefined = sourceBuilder[propertyName];

  // If source has a value for this property
  if (!_.isNil(propertyValue)) {
    return resolveValue(propertyValue);
  } else {
    return defaultValue;
  }
}

function resolveValue<T, K extends keyof T>(propertyValue: Builder<T[K]> | T[K]): T[K] {
  // If property is another builder, assemble it
  if (ObjectBuilder.needsAssembling(propertyValue)) {
    return ObjectBuilder.assemble(propertyValue);
  } else {
    // If property is a plain value, just return it
    return propertyValue;
  }
}

export default ValidateAs;