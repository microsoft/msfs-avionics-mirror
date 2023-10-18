import { AbstractSubscribableMap } from './AbstractSubscribableMap';
import { SetSubject } from './SetSubject';
import { MutableSubscribable, Subscribable } from './Subscribable';
import { MutableSubscribableMap, SubscribableMapEventType } from './SubscribableMap';
import { SubscribableSet, SubscribableSetEventType } from './SubscribableSet';
import { Subscription } from './Subscription';

/**
 * A subscribable map whose key-value pairs can be freely added and removed for a set of allowed keys.
 */
export class FilteredMapSubject<K, V> extends AbstractSubscribableMap<K, V>
  implements MutableSubscribable<ReadonlyMap<K, V>, Iterable<readonly [K, V]>>, MutableSubscribableMap<K, V> {

  public readonly isMutableSubscribable = true;
  public readonly isMutableSubscribableMap = true;

  private readonly allowedKeys: SetSubject<K>;
  private readonly backingMap: Map<K, V>;

  private keysSub?: Subscription;

  /**
   * Constructor.
   * @param allowedKeys The allowed keys for the new map. If an allowed key is removed after the map is created, then that
   * key will be removed from the map.
   * @param initialEntries The key-value pairs initially contained in the new map. If not defined, then the new map
   * will initially be empty.
   */
  private constructor(allowedKeys: Iterable<K> | SubscribableSet<K> | Subscribable<Iterable<K>>, initialEntries?: Iterable<readonly [K, V]>) {
    super();

    this.allowedKeys = SetSubject.create();

    if ('isSubscribableSet' in allowedKeys && allowedKeys.isSubscribableSet === true) {
      this.keysSub = allowedKeys.pipe(this.allowedKeys);
    } else if ('isSubscribable' in allowedKeys && allowedKeys.isSubscribable === true) {
      this.keysSub = allowedKeys.pipe(this.allowedKeys);
    } else {
      this.allowedKeys.set(allowedKeys as Iterable<K>);
    }

    this.backingMap = new Map(
      initialEntries === undefined ? undefined : Array.from(initialEntries).filter(([key]) => this.allowedKeys.has(key)) as any
    );

    this.allowedKeys.sub(this.onAllowedKeysChanged.bind(this));
  }

  /**
   * Creates and returns a new FilteredMapSubject.
   * @param allowedKeys The allowed keys for the new map. If an allowed key is removed after the map is created, then that
   * key will be removed from the map.
   * @param initialEntries The key-value pairs initially contained in the new map. If not defined, then the new map
   * will initially be empty.
   * @returns A new FilteredMapSubject instance.
   */
  public static create<K, V>(allowedKeys: Iterable<K> | SubscribableSet<K> | Subscribable<Iterable<K>>, initialEntries?: Iterable<[K, V]>): FilteredMapSubject<K, V> {
    return new FilteredMapSubject(allowedKeys, initialEntries);
  }

  /** @inheritdoc */
  public get(): ReadonlyMap<K, V> {
    return this.backingMap;
  }

  /**
   * Sets the key-value pairs contained in this map.
   * @param entries The key-value pairs to set.
   */
  public set(entries: Iterable<[K, V]>): void {
    const toAdd = entries instanceof Map ? entries : new Map(entries);

    for (const key of this.backingMap.keys()) {
      if (!toAdd.has(key)) {
        this.delete(key);
      }
    }

    for (const key of toAdd.keys()) {
      this.setValue(key, toAdd.get(key) as V);
    }
  }

  /** @inheritdoc */
  public setValue(key: K, value: V): this {
    if (!this.allowedKeys.has(key)) {
      return this;
    }

    const hasKey = this.backingMap.has(key);
    const shouldNotify = !hasKey || this.backingMap.get(key) !== value;

    this.backingMap.set(key, value);

    if (shouldNotify) {
      this.notify(hasKey ? SubscribableMapEventType.Changed : SubscribableMapEventType.Added, key, value);
    }

    return this;
  }

  /** @inheritdoc */
  public delete(key: K): boolean {
    const value = this.backingMap.get(key);
    const wasDeleted = this.backingMap.delete(key);

    if (wasDeleted) {
      this.notify(SubscribableMapEventType.Deleted, key, value as V);
    }

    return wasDeleted;
  }

  /** @inheritdoc */
  public clear(): void {
    for (const [key, value] of this.backingMap) {
      this.backingMap.delete(key);
      this.notify(SubscribableMapEventType.Deleted, key, value);
    }
  }

  /**
   * Responds to when one of this map's allowed keys is added or removed.
   * @param keys The set of this map's allowed keys.
   * @param type The type of change.
   * @param key The key that was added or removed.
   */
  private onAllowedKeysChanged(keys: ReadonlySet<K>, type: SubscribableSetEventType, key: K): void {
    if (type === SubscribableSetEventType.Deleted) {
      this.delete(key);
    }
  }

  /**
   * Destroys this map.
   */
  public destroy(): void {
    this.keysSub?.destroy();
  }
}