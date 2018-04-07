import _ from "lodash";

// Symbols
export const constructorSymbol = Symbol("constructor");
export const isBuilderSymbol = Symbol("isBuilder");

// Types
// DeepPartial is the same as partial except its properties may ALSO be Builder objects
//  which are in-turn DeepPartial instances
export type DeepPartial<T> = {
  [K in keyof T]?: Builder<T[K]> | DeepPartial<T[K]> | T[K];
};
// Builder is a DeepPartial but also it has a constructor function
//  and a property (always true) that says it is a Builder Instance
//  for telling at runtime what is a builder instance
export type Builder<T> = DeepPartial<T> & {
  [constructorSymbol]: () => T;
  [isBuilderSymbol]: boolean;
};
export type BuilderConstructor<T> = new (source: Builder<T>) => T;

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
  /**
   * Create an empty, non-class-based Builder object.
   * This is used for interfaces or other non-class types.
   * @template T Type being constructed
   * @returns Builder object for type `T`
   */
  public static create<T>(): Builder<T>;
  /**
   * Create an empty, class-based Builder object.
   * This is used for building classes.
   * @param ctor Constructor for type `T`
   * @template T Type being constructed
   * @returns Builder object for type `T`
   */
  public static create<T>(ctor: BuilderConstructor<T>): Builder<T>;
  /**
   * Create a non-class-based Builder object with some default values.
   * This is used for interfaces or other non-class types.
   * @param defaultValues Default values for Builder object
   * @template T Type being constructed
   * @returns Builder object for type `T`
   */
  public static create<T>(defaultValues: DeepPartial<T>): Builder<T>;
  /**
   * Create a class-based Builder object with some default values.
   * This is used for building classes.
   * @param ctor Constructor for type `T`
   * @param defaultValues Default values for Builder object
   * @template T Type being constructed
   * @returns Builder object for type `T`
   */
  public static create<T>(ctor: BuilderConstructor<T>, defaultValues: DeepPartial<T>): Builder<T>;
  public static create<T>(defaultValuesOrCtor?: DeepPartial<T> | (new (source: Builder<T>) => T), defaultValues?: DeepPartial<T>): Builder<T> {
    let defaultValuesObject: DeepPartial<T> | undefined;
    if (typeof defaultValuesOrCtor === 'object') {
      defaultValuesObject = defaultValuesOrCtor;
    } else {
      defaultValuesObject = defaultValues;
    }

    let builder: Builder<T> = _.assign({
      [constructorSymbol]() {
        if (typeof defaultValuesOrCtor === 'function') {
          return new defaultValuesOrCtor(builder);
        } else {
          return builder as DeepPartial<T> as T;
        }
      },
      [isBuilderSymbol]: true,
    }, defaultValuesObject);
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
    return source[constructorSymbol]();
  }
}
