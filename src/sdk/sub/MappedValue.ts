import { Accessible } from './Accessible';

/**
 * A type which contains the `length` property of a tuple.
 */
// eslint-disable-next-line jsdoc/require-jsdoc
type TupleLength<T extends readonly any[]> = { length: T['length'] };

/**
 * A type which maps a tuple of input types to a tuple of accessibles that provide the input types.
 */
export type MappedValueInputs<Types extends readonly any[]> = {
  [Index in keyof Types]: Accessible<Types[Index]>
} & TupleLength<Types>;

/**
 * An accessible value that is mapped from one or more input accessibles.
 */
export class MappedValue<I extends any[], T> implements Accessible<T> {
  private static readonly IDENTITY_MAP = <Inputs>(inputs: Inputs): Inputs => inputs;

  private readonly inputs: MappedValueInputs<I>;
  private readonly inputValues: I;

  /**
   * Creates a new MappedValue.
   * @param mapFunc The function that maps this accessible's input values.
   * @param inputs The accessibles that provide the inputs to the new mapped accessible.
   */
  private constructor(
    private readonly mapFunc: (inputs: Readonly<I>) => T,
    ...inputs: MappedValueInputs<I>
  ) {
    this.inputs = inputs;
    this.inputValues = inputs.map(input => input.get()) as I;
  }

  /**
   * Creates a new mapped accessible value whose state is a combined tuple of an arbitrary number of input accessibles.
   * @param inputs The accessibles that provide the inputs to the new mapped accessible.
   * @returns A new mapped accessible value whose state is a combined tuple of the specified input accessibles.
   */
  public static create<I extends any[]>(
    ...inputs: MappedValueInputs<I>
  ): MappedValue<I, Readonly<I>>;
  /**
   * Creates a new mapped accessible value.
   * @param mapFunc The function to use to map inputs to the new accessible value.
   * @param inputs The accessibles that provide the inputs to the new mapped accessible.
   */
  public static create<I extends any[], T>(
    mapFunc: (inputs: Readonly<I>) => T,
    ...inputs: MappedValueInputs<I>
  ): MappedValue<I, T>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create<I extends any[], T>(
    ...args: any
  ): MappedValue<I, T> {
    let mapFunc: (inputs: Readonly<I>) => T;

    if (typeof args[0] === 'function') {
      // Mapping function was supplied.
      mapFunc = args.shift() as (inputs: Readonly<I>) => T;
    } else {
      mapFunc = MappedValue.IDENTITY_MAP as unknown as (inputs: Readonly<I>) => T;
    }

    return new MappedValue<I, T>(mapFunc, ...args as any);
  }

  /** @inheritDoc */
  public get(): T {
    for (let i = 0; i < this.inputValues.length; i++) {
      this.inputValues[i] = this.inputs[i].get();
    }
    return this.mapFunc(this.inputValues);
  }
}