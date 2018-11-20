import _ from "lodash";

// Symbols
export const constructorSymbol = Symbol("constructor");
export const isBuilderSymbol = Symbol("isBuilder");

// Types
// DeepPartial is the same as partial except its properties may ALSO be Builder objects
//  which are in-turn DeepPartial instances
export type DeepPartial<T> = {
  [K in keyof T]?: Builder<T[K]> | T[K];
};
// Builder is a DeepPartial but also it has a constructor function
//  and a property (always true) that says it is a Builder Instance
//  for telling at runtime what is a builder instance
export type Builder<T> = DeepPartial<NonNullable<T>> & {
  [constructorSymbol]: (source: Builder<T>) => T;
  [isBuilderSymbol]: boolean; // @TODO can this be type "true"
};

type NonNullable<T> = T extends (null | undefined) ? never : T;


/**
 * Class for constructing objects in a JavaScript-y but typesafe manner.
 * Build up an object piece-by-piece and spit out a fully type-sure object at the end,
 * without sacrificing Type safety while constructing it.
 * Lets you have non-optional properties on an object but create it in stages.
 *
 * @example
 *
 * class MyThing {
 *   name: string;
 *   value: number;
 *
 *   // Constructor must take a Builder<T> instance
 *   constructor(source: Builder<MyThing>) {
 *     this.name = ValidateAs.Required(source, 'name');
 *     this.value = ValidateAs.Required(source, 'value');
 *   }
 * }
 *
 * // Create empty builder object
 * let myThingBuilder = ObjectBuilder.create(MyThing);
 * // Builder object only has properties of MyThing but they are nullable
 * myThingBuilder.name = "Hello";
 * myThingBuilder.value = 20;
 *
 * // Create instance of MyThing
 * let myThing = ObjectBuilder.assemble(myThingBuilder);
 *
 * // myThing now has `name` and `value` properties that are not optional
 */

export default class ObjectBuilder {
  public static create<T>(constructorFunction: (source: Builder<T>) => T, defaultValues: DeepPartial<NonNullable<T>> = {}): Builder<T> {
    let builder: Builder<T> = _.assign({
      [constructorSymbol]: constructorFunction,
      [isBuilderSymbol]: true,
    }, defaultValues);
    return builder;
  }

  /**
   * Test whether an object is a Builder object that needs assembling.
   * @param object The object to test
   * @template T
   * @returns Whether `object` is an instance of `Builder<T>`
   */
  public static needsAssembling<T>(object?: Builder<T> | DeepPartial<T> | T): object is Builder<T> {
    if (_.isNil(object)) {
      return false;
    } else {
      return object.hasOwnProperty(isBuilderSymbol);
    }
  }

  /**
   * Assemble a Builder object into it's real type.
   * @param source Builder object to assemble
   * @template T
   * @returns Real instance of type `T`
   */
  public static assemble<T>(source: Builder<T>): T {
    return source[constructorSymbol](source);
  }
}
