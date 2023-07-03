import { AbstractSubscribableSet } from './AbstractSubscribableSet';
import { MutableSubscribable } from './Subscribable';
import { MutableSubscribableSet, SubscribableSetEventType } from './SubscribableSet';

/**
 * A subscribable set whose keys can be freely added and removed.
 */
export class SetSubject<T> extends AbstractSubscribableSet<T> implements MutableSubscribable<ReadonlySet<T>, Iterable<T>>, MutableSubscribableSet<T> {
  public readonly isMutableSubscribable = true;
  public readonly isMutableSubscribableSet = true;

  private readonly backingSet: Set<T>;

  /**
   * Constructor.
   * @param initialKeys The keys initially contained in the new set. If not defined, then the new set will be
   * initialized to the empty set.
   */
  private constructor(initialKeys?: Iterable<T>) {
    super();

    this.backingSet = new Set(initialKeys);
  }

  /**
   * Creates and returns a new SetSubject.
   * @param initialKeys The keys initially contained in the new set. If not defined, then the new set will be
   * initialized to the empty set.
   * @returns A new SetSubject instance.
   */
  public static create<T>(initialKeys?: Iterable<T>): SetSubject<T> {
    return new SetSubject(initialKeys);
  }

  /** @inheritdoc */
  public get(): ReadonlySet<T> {
    return this.backingSet;
  }

  /**
   * Sets the keys contained in this set.
   * @param keys The keys to set.
   */
  public set(keys: Iterable<T>): void {
    const toAdd = new Set(keys);

    for (const key of this.backingSet) {
      if (!toAdd.delete(key)) {
        this.delete(key);
      }
    }

    for (const key of toAdd) {
      this.add(key);
    }
  }

  /** @inheritdoc */
  public add(key: T): this {
    const oldSize = this.backingSet.size;

    this.backingSet.add(key);

    if (oldSize !== this.backingSet.size) {
      this.notify(SubscribableSetEventType.Added, key);
    }

    return this;
  }

  /** @inheritdoc */
  public delete(key: T): boolean {
    const wasDeleted = this.backingSet.delete(key);

    if (wasDeleted) {
      this.notify(SubscribableSetEventType.Deleted, key);
    }

    return wasDeleted;
  }

  /**
   * Toggles the presence of a key in this set.
   * @param key The key to toggle.
   * @returns Whether the key is present in this set after the toggle operation.
   */
  public toggle(key: T): boolean;
  /**
   * Toggles the presence of a key in this set.
   * @param key The key to toggle.
   * @param force The state of the key to force. If `true`, the key will be added to this set. If `false`, the key will
   * be removed from this set.
   * @returns Whether the key is present in this set after the toggle operation.
   */
  public toggle(key: T, force: boolean): boolean;
  /**
   * Toggles the presence of a key in this set.
   * @param key The key to toggle.
   * @param force The state of the key to force. If `true`, the key will be added to this set. If `false`, the key will
   * be removed from this set. If not defined, the key will be added to this set if it is not already present and
   * removed if it is already present.
   * @returns Whether the key is present in this set after the toggle operation.
   */
  public toggle(key: T, force?: boolean): boolean {
    const shouldAdd = force ?? !this.backingSet.has(key);

    if (shouldAdd) {
      this.add(key);
    } else {
      this.delete(key);
    }

    // Explicitly query the set again instead of just returning shouldAdd in case the key was manipulated in a handler
    // triggered by its addition/removal
    return this.backingSet.has(key);
  }

  /**
   * Removes all keys from this set.
   */
  public clear(): void {
    for (const key of this.backingSet) {
      this.backingSet.delete(key);
      this.notify(SubscribableSetEventType.Deleted, key);
    }
  }
}