import { Subscription } from './Subscription';

/**
 * Types of changes made to {@link SubscribableMap}.
 */
export enum SubscribableMapEventType {
  /** A key was added. */
  Added = 'Added',

  /** A key's entry was changed. */
  Changed = 'Changed',

  /** A key was deleted. */
  Deleted = 'Deleted'
}

/**
 * A function which handles changes in a {@link SubscribableMap}'s state.
 */
export type SubscribableMapHandler<K, V> = (map: ReadonlyMap<K, V>, type: SubscribableMapEventType, key: K, value: V) => void;

/**
 * A map which allows others to subscribe to be notified of changes in its state.
 */
export interface SubscribableMap<K, V> {
  /** Flags this object as a SubscribableMap. */
  readonly isSubscribableMap: true;

  /** The number of elements contained in this map. */
  readonly size: number;

  /**
   * Gets a read-only version of this map.
   * @returns A read-only version of this map.
   */
  get(): ReadonlyMap<K, V>;

  /**
   * Checks whether this map contains a key.
   * @param key The key to check.
   * @returns Whether this map contains the specified key.
   */
  has(key: K): boolean;

  /**
   * Gets the value stored under a given key in this map.
   * @param key The key under which the value to get is stored.
   * @returns The value stored under the specified key in this map, or `undefined` if this map does not contain the
   * specified key.
   */
  getValue(key: K): V | undefined;

  /**
   * Subscribes to changes in this map's state.
   * @param handler A function which is called when this map's state changes.
   * @param initialNotify Whether to immediately invoke the callback function with this map's current state.
   * Defaults to `false`. This argument is ignored if the subscription is initialized as paused.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  sub(handler: SubscribableMapHandler<K, V>, initialNotify?: boolean, paused?: boolean): Subscription;

  /**
   * Subscribes to and pipes this map's state to a mutable subscribable map. Whenever a key-value pair added, changed,
   * or removed event is received through the subscription, the same key-value pair will be added to, changed, or
   * removed from the other map.
   * @param to The mutable subscribable map to which to pipe this map's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  pipe(to: MutableSubscribableMap<K, V>, paused?: boolean): Subscription;
}

/**
 * A subscribable map which can accept inputs to add or remove key-value pairs.
 */
export interface MutableSubscribableMap<K, V> extends SubscribableMap<K, V> {
  /** Flags this object as a MutableSubscribableMap. */
  readonly isMutableSubscribableMap: true;

  /**
   * Adds a key-value pair to this map. If this map already contains the specified key, then the existing value stored
   * under the key will be replaced with the new value.
   * @param key The key to add.
   * @param value The value to add.
   * @returns This map, after the key-value pair has been added.
   */
  setValue(key: K, value: V): this;

  /**
   * Removes a key-value pair from this map.
   * @param key The key to remove.
   * @returns Whether the key-value pair was removed.
   */
  delete(key: K): boolean;

  /**
   * Removes all key-value pairs from this map.
   */
  clear(): void;
}