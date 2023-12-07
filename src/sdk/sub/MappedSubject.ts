import { AbstractSubscribable } from './AbstractSubscribable';
import { MappedSubscribable, Subscribable } from './Subscribable';
import { SubscribableMapFunctions } from './SubscribableMapFunctions';
import { Subscription } from './Subscription';

/**
 * A type which contains the `length` property of a tuple.
 */
// eslint-disable-next-line jsdoc/require-jsdoc
type TupleLength<T extends readonly any[]> = { length: T['length'] };

/**
 * A type which maps a tuple of input types to a tuple of subscribables that provide the input types.
 */
export type MappedSubscribableInputs<Types extends readonly any[]> = {
  [Index in keyof Types]: Subscribable<Types[Index]>
} & TupleLength<Types>;

/**
 * A subscribable subject that is a mapped stream from one or more input subscribables.
 */
export class MappedSubject<I extends any[], T> extends AbstractSubscribable<T> implements MappedSubscribable<T> {
  private static readonly IDENTITY_MAP = SubscribableMapFunctions.identity();
  private static readonly NEVER_EQUALS = (): boolean => false;

  /** @inheritdoc */
  public readonly canInitialNotify = true;

  private readonly inputs: MappedSubscribableInputs<I>;
  private readonly inputValues: I;
  private readonly inputSubs: Subscription[];

  private readonly mutateFunc: (newVal: T) => void;

  private value: T;

  private _isAlive = true;
  /** @inheritdoc */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  private _isPaused = false;
  /** @inheritdoc */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Creates a new MappedSubject.
   * @param mapFunc The function which maps this subject's inputs to a value.
   * @param equalityFunc The function which this subject uses to check for equality between values.
   * @param mutateFunc The function which this subject uses to change its value.
   * @param initialVal The initial value of this subject.
   * @param inputs The subscribables which provide the inputs to this subject.
   */
  private constructor(
    private readonly mapFunc: (inputs: Readonly<I>, previousVal?: T) => T,
    private readonly equalityFunc: (a: T, b: T) => boolean,
    mutateFunc?: (oldVal: T, newVal: T) => void,
    initialVal?: T,
    ...inputs: MappedSubscribableInputs<I>
  ) {
    super();

    this.inputs = inputs;
    this.inputValues = inputs.map(input => input.get()) as I;

    if (initialVal && mutateFunc) {
      this.value = initialVal;
      mutateFunc(this.value, this.mapFunc(this.inputValues, undefined));
      this.mutateFunc = (newVal: T): void => { mutateFunc(this.value, newVal); };
    } else {
      this.value = this.mapFunc(this.inputValues, undefined);
      this.mutateFunc = (newVal: T): void => { this.value = newVal; };
    }

    this.inputSubs = this.inputs.map((input, index) => input.sub(inputValue => {
      this.inputValues[index] = inputValue;
      this.updateValue();
    }));
  }

  /**
   * Creates a new mapped subject whose state is a combined tuple of an arbitrary number of input values.
   * @param inputs The subscribables which provide the inputs to the new subject.
   * @returns A new subject whose state is a combined tuple of the specified input values.
   */
  public static create<I extends any[]>(
    ...inputs: MappedSubscribableInputs<I>
  ): MappedSubject<I, Readonly<I>>;
  /**
   * Creates a new mapped subject. Values are compared for equality using the strict equality comparison (`===`).
   * @param mapFunc The function to use to map inputs to the new subject value.
   * @param inputs The subscribables which provide the inputs to the new subject.
   */
  public static create<I extends any[], T>(
    mapFunc: (inputs: Readonly<I>, previousVal?: T) => T,
    ...inputs: MappedSubscribableInputs<I>
  ): MappedSubject<I, T>;
  /**
   * Creates a new mapped subject. Values are compared for equality using a custom function.
   * @param mapFunc The function to use to map inputs to the new subject value.
   * @param equalityFunc The function which the new subject uses to check for equality between values.
   * @param inputs The subscribables which provide the inputs to the new subject.
   */
  public static create<I extends any[], T>(
    mapFunc: (inputs: Readonly<I>, previousVal?: T) => T,
    equalityFunc: (a: T, b: T) => boolean,
    ...inputs: MappedSubscribableInputs<I>
  ): MappedSubject<I, T>;
  /**
   * Creates a new mapped subject with a persistent, cached value which is mutated when it changes. Values are
   * compared for equality using a custom function.
   * @param mapFunc The function to use to map inputs to the new subject value.
   * @param equalityFunc The function which the new subject uses to check for equality between values.
   * @param mutateFunc The function to use to change the value of the new subject.
   * @param initialVal The initial value of the new subject.
   * @param inputs The subscribables which provide the inputs to the new subject.
   */
  public static create<I extends any[], T>(
    mapFunc: (inputs: Readonly<I>, previousVal?: T) => T,
    equalityFunc: (a: T, b: T) => boolean,
    mutateFunc: (oldVal: T, newVal: T) => void,
    initialVal: T,
    ...inputs: MappedSubscribableInputs<I>
  ): MappedSubject<I, T>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create<I extends any[], T>(
    ...args: any
  ): MappedSubject<I, T> {
    let mapFunc, equalityFunc, mutateFunc, initialVal;

    if (typeof args[0] === 'function') {
      // Mapping function was supplied.

      mapFunc = args.shift() as (inputs: Readonly<I>, previousVal?: T) => T;

      if (typeof args[0] === 'function') {
        equalityFunc = args.shift() as (a: T, b: T) => boolean;
      } else {
        equalityFunc = AbstractSubscribable.DEFAULT_EQUALITY_FUNC;
      }

      if (typeof args[0] === 'function') {
        mutateFunc = args.shift() as ((oldVal: T, newVal: T) => void);
        initialVal = args.shift() as T;
      }
    } else {
      mapFunc = MappedSubject.IDENTITY_MAP as unknown as (inputs: Readonly<I>, previousVal?: T) => T;
      equalityFunc = MappedSubject.NEVER_EQUALS;
    }

    return new MappedSubject<I, T>(mapFunc, equalityFunc, mutateFunc, initialVal, ...args as any);
  }

  /**
   * Re-maps this subject's value from its input, and notifies subscribers if this results in a change to the mapped
   * value according to this subject's equality function.
   */
  private updateValue(): void {
    const value = this.mapFunc(this.inputValues, this.value);
    if (!this.equalityFunc(this.value, value)) {
      this.mutateFunc(value);
      this.notify();
    }
  }

  /** @inheritdoc */
  public get(): T {
    return this.value;
  }

  /** @inheritdoc */
  public pause(): this {
    if (!this._isAlive) {
      throw new Error('MappedSubject: cannot pause a dead subject');
    }

    if (this._isPaused) {
      return this;
    }

    for (let i = 0; i < this.inputSubs.length; i++) {
      this.inputSubs[i].pause();
    }

    this._isPaused = true;

    return this;
  }

  /** @inheritdoc */
  public resume(): this {
    if (!this._isAlive) {
      throw new Error('MappedSubject: cannot resume a dead subject');
    }

    if (!this._isPaused) {
      return this;
    }

    this._isPaused = false;

    for (let i = 0; i < this.inputSubs.length; i++) {
      this.inputValues[i] = this.inputs[i].get();
      this.inputSubs[i].resume();
    }

    this.updateValue();

    return this;
  }

  /** @inheritdoc */
  public destroy(): void {
    this._isAlive = false;

    for (let i = 0; i < this.inputSubs.length; i++) {
      this.inputSubs[i].destroy();
    }
  }
}