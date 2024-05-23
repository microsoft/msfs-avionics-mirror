import { MutableAccessible } from './Accessible';

/**
 * An accessible value whose state can be freely manipulated.
 */
export class Value<T> implements MutableAccessible<T> {
  private value: T;

  /**
   * Creates a new instance of Value.
   * @param initialValue The initial value of the Value.
   */
  private constructor(initialValue: T) {
    this.value = initialValue;
  }

  /**
   * Creates and returns a new Value.
   * @param initialValue The initial value of the Value.
   * @returns A new Value with the specified initial value.
   */
  public static create<T>(initialValue: T): Value<T> {
    return new Value(initialValue);
  }

  /** @inheritDoc */
  public get(): T {
    return this.value;
  }

  /** @inheritDoc */
  public set(value: T): void {
    this.value = value;
  }
}
