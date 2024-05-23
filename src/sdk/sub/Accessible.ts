/**
 * An item which allows others to access its state.
 */
export interface Accessible<T> {
  /**
   * Gets this item's state.
   * @returns This item's state.
   */
  get(): T;
}

/**
 * An accessible item that can accept inputs to change its state. The state of the item may be derived from the inputs
 * directly or from transformed versions of the inputs.
 */
export interface MutableAccessible<T, I = T> extends Accessible<T> {
  /**
   * Sets the state of this item.
   * @param value The input used to change the state.
   */
  set(value: I): void;
}

/**
 * Utility type to retrieve the value type of a {@link Accessible}.
 */
export type AccessibleType<A> = A extends Accessible<infer T> ? T : never;

/**
 * Utility type to retrieve the input value of a {@link MutableAccessible}.
 */
export type MutableAccessibleInputType<A> = A extends MutableAccessible<any, infer I> ? I : never;