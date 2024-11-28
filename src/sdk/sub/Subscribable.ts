import { Accessible, MutableAccessible } from './Accessible';
import { Subscription } from './Subscription';

/**
 * An item which allows others to subscribe to be notified of changes in its state.
 */
export interface Subscribable<T> extends Accessible<T> {
  /** Flags this object as a Subscribable. */
  readonly isSubscribable: true;

  /**
   * Subscribes to changes in this subscribable's state.
   * @param handler A function which is called when this subscribable's state changes.
   * @param initialNotify Whether to immediately invoke the callback function with this subscribable's current state.
   * Defaults to `false`. This argument is ignored if the subscription is initialized as paused.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  sub(handler: (value: T) => void, initialNotify?: boolean, paused?: boolean): Subscription;

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
   * Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update
   * of this subscribable's state is received through the subscription, it will be transformed by the specified mapping
   * function, and the transformed state will be used as an input to change the other subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
   * @param map The function to use to transform inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  pipe<M>(to: MutableSubscribable<any, M>, map: (fromVal: T, toVal: M) => M, paused?: boolean): Subscription;
}

/**
 * A subscribable which is mapped from another subscribable.
 */
export interface MappedSubscribable<T> extends Subscribable<T>, Subscription {
  /**
   * Whether the subscription to the parent subscribable is alive. While alive, this subscribable will update its state
   * based on its parent's state, unless it is paused. Once dead, this subscribable will no longer update its state,
   * and cannot be resumed again.
   */
  readonly isAlive: boolean;

  /**
   * Whether the subscription to the parent subscribable is paused. While paused, this subscribable will not update its
   * state until it is resumed.
   */
  readonly isPaused: boolean;

  /**
   * Pauses the subscription to the parent subscribable. Once paused, this subscribable will not update its state until
   * it is resumed.
   * @returns This subscribable, after it has been paused.
   * @throws Error if the subscription to the parent subscribable is not alive.
   */
  pause(): this;

  /**
   * Resumes the subscription to the parent subscribable. Once resumed, this subscribable will immediately begin to
   * update its state based its parent's state.
   *
   * Any `initialNotify` argument passed to this method is ignored. This subscribable is always immediately notified of
   * its parent's state when resumed.
   * @returns This subscribable, after it has been resumed.
   * @throws Error if the subscription to the parent subscribable is not alive.
   */
  resume(): this;

  /**
   * Destroys the subscription to the parent subscribable.
   */
  destroy(): void;
}

/**
 * A subscribable that can accept inputs to change its state. The state of the subscribable may be derived from the
 * inputs directly or from transformed versions of the inputs.
 */
export interface MutableSubscribable<T, I = T> extends Subscribable<T>, MutableAccessible<T, I> {
  /** Flags this object as a MutableSubscribable. */
  readonly isMutableSubscribable: true;
}

/**
 * Utility type to retrieve the value type of a {@link Subscribable}.
 */
export type SubscribableType<S> = S extends Subscribable<infer T> ? T : never;

/**
 * Utility type to convert a type of Subject into a {@link Subscribable}.
 */
export type ToSubscribable<S> = S extends Subscribable<infer T> ? Subscribable<T> : never;

/**
 * Utility type to retrieve the input value of a {@link MutableSubscribable}.
 */
export type MutableSubscribableInputType<S> = S extends MutableSubscribable<any, infer I> ? I : never;
