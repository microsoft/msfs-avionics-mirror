import { AbstractSubscribableMap } from './AbstractSubscribableMap';
import { MutableSubscribable } from './Subscribable';
import { MutableSubscribableMap, SubscribableMapEventType } from './SubscribableMap';

/**
 * A subscribable map whose key-value pairs can be freely added and removed.
 */
export class MapSubject<K, V> extends AbstractSubscribableMap<K, V> implements MutableSubscribable<ReadonlyMap<K, V>, Iterable<readonly [K, V]>>, MutableSubscribableMap<K, V> {
  public readonly isMutableSubscribable = true;
  public readonly isMutableSubscribableMap = true;

  private readonly backingMap: Map<K, V>;

  /**
   * Constructor.
   * @param initialEntries The key-value pairs initially contained in the new map. If not defined, then the new map
   * will initially be empty.
   */
  private constructor(initialEntries?: Iterable<readonly [K, V]>) {
    super();

    this.backingMap = new Map(initialEntries as any);
  }

  /**
   * Creates and returns a new MapSubject.
   * @param initialEntries The key-value pairs initially contained in the new map. If not defined, then the new map
   * will initially be empty.
   * @returns A new MapSubject instance.
   */
  public static create<K, V>(initialEntries?: Iterable<[K, V]>): MapSubject<K, V> {
    return new MapSubject(initialEntries);
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
}