import { MappedSubject, MappedSubscribable, MutableSubscribable, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { DataInterface } from '../Framework/FmcDataBinding';

/**
 * A performance variable
 */
export class ReadonlyPerformanceVariable<T> implements Subscribable<T> {
  public readonly isSubscribable = true;

  public data: DataInterface<T>;

  /**
   * Ctor
   *
   * @param input a subject
   */
  protected constructor(
    public input: Subscribable<T>,
  ) {
    this.data = new DataInterface(input, () => { });
  }

  /** @inheritDoc */
  get(): T {
    return this.input.get();
  }

  /** @inheritDoc */
  sub(fn: (value: T) => void, initialNotify = false, paused = false): Subscription {
    return this.input.sub(fn, initialNotify, paused);
  }

  /**
   * Maps this subscribable to a new subscribable.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values. Defaults to the strict
   * equality comparison (`===`).
   * @returns The mapped subscribable.
   */
  map<M>(fn: (input: T, previousVal?: M) => M, equalityFunc?: ((a: M, b: M) => boolean)): MappedSubscribable<M>;
  /**
   * Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values.
   * @param mutateFunc The function to use to change the value of the mapped subscribable.
   * @param initialVal The initial value of the mapped subscribable.
   * @returns The mapped subscribable.
   */
  map<M>(
    fn: (input: T, previousVal?: M) => M,
    equalityFunc: ((a: M, b: M) => boolean),
    mutateFunc: ((oldVal: M, newVal: M) => void),
    initialVal: M
  ): MappedSubscribable<M>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  map<M>(
    fn: (input: T, previousVal?: M) => M,
    equalityFunc?: ((a: M, b: M) => boolean),
    mutateFunc?: ((oldVal: M, newVal: M) => void),
    initialVal?: M
  ): MappedSubscribable<M> {
    return mutateFunc
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? this.input.map(fn, equalityFunc!, mutateFunc, initialVal!)
      : this.input.map(fn, equalityFunc);
  }

  /**
   * Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this
   * subscribable's state is received through the subscription, it will be used as an input to change the other
   * subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  pipe(to: MutableSubscribable<any, T>, paused?: boolean): Subscription;
  /**
   * Subscribes to and accepts mapped inputs from another subscribable. Whenever an update of the other subscribable's
   * state is received through the subscription, it will be transformed by the specified mapping function, and the
   * transformed state will be used as an input to change this subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
   * @param map The function to use to transform inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  pipe<M>(to: MutableSubscribable<any, M>, map: (fromVal: T, toVal: M) => M, paused?: boolean): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  pipe<M>(to: MutableSubscribable<any, T> | MutableSubscribable<any, M>, arg2?: ((fromVal: T, toVal: M) => M) | boolean, arg3?: boolean): Subscription {
    if (typeof arg2 === 'function') {
      return this.input.pipe(to as MutableSubscribable<any, M>, arg2, arg3);
    } else {
      return this.input.pipe(to as MutableSubscribable<any, T>, arg2);
    }
  }
}

/**
 * A performance variable, modifiable by the pilot
 */
export class PerformanceVariable<T> extends ReadonlyPerformanceVariable<T> {

  public data: DataInterface<T>;

  /**
   * Ctor
   *
   * @param input a subject
   */
  private constructor(
    input: Subject<T>,
  ) {
    super(input);
    this.data = DataInterface.fromMutSubscribable(input);
  }

  /**
   * Creates a new {@link PerformanceVariable} from a `Subject<T>`
   *
   * @param subject the subject to use
   *
   * @returns the performance variable
   */
  static fromSubject<T, R extends boolean>(subject: Subject<T>): R extends true ? ReadonlyPerformanceVariable<T> : PerformanceVariable<T> {
    return new PerformanceVariable<T>(subject);
  }

  /**
   * Creates a new {@link PerformanceVariable} with a default value set to `null`
   *
   * @returns the performance variable
   */
  static withDefaultNullValue<T>(): PerformanceVariable<T | null> {
    return new PerformanceVariable<T | null>(Subject.create<T | null>(null));
  }

  /**
   * Creates a new {@link PerformanceVariable} with a default value
   *
   * @param value the default value
   *
   * @returns the performance variable
   */
  static withDefaultValue<T>(value: T): PerformanceVariable<T> {
    return new PerformanceVariable<T>(Subject.create(value));
  }

  /**
   * Creates a new {@link PerformanceVariable} mapped from other variables
   *
   * @param mapFunc function to map inputs to the output
   * @param inputs  input performance variables
   *
   * @returns computed performance variable
   */
  static computedFrom<T, I extends [...any[]]>(mapFunc: (inputs: I) => T, ...inputs: MappedPerformanceVariableTypes<I>): ReadonlyPerformanceVariable<T> {
    const mappedSubject = MappedSubject.create<I, T>(mapFunc, ...inputs.map((input) => input.input) as any);

    return new ReadonlyPerformanceVariable<T>(mappedSubject);
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
type TupleLength<T extends [...any[]]> = { length: T['length'] };

// eslint-disable-next-line jsdoc/require-jsdoc
export type MappedPerformanceVariableTypes<Types extends [...any[]]> = {
  [Index in keyof Types]: ReadonlyPerformanceVariable<Types[Index]>
} & TupleLength<Types>;
