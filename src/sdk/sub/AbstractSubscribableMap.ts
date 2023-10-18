import { AbstractSubscribable } from './AbstractSubscribable';
import { HandlerSubscription } from './HandlerSubscription';
import { MappedSubject } from './MappedSubject';
import { MutableSubscribable, Subscribable } from './Subscribable';
import { MutableSubscribableMap, SubscribableMap, SubscribableMapEventType, SubscribableMapHandler } from './SubscribableMap';
import { SubscribableMapPipe } from './SubscribableMapPipe';
import { SubscribablePipe } from './SubscribablePipe';
import { Subscription } from './Subscription';

/**
 * An abstract implementation of a subscribable set which allows adding, removing, and notifying subscribers.
 */
export abstract class AbstractSubscribableMap<K, V> implements SubscribableMap<K, V>, Subscribable<ReadonlyMap<K, V>> {
  public readonly isSubscribable = true;
  public readonly isSubscribableMap = true;

  /** @inheritdoc */
  public get size(): number {
    return this.get().size;
  }

  protected singletonSub?: HandlerSubscription<SubscribableMapHandler<K, V>>;

  protected subs?: HandlerSubscription<SubscribableMapHandler<K, V>>[];
  protected notifyDepth = 0;

  /** A function which sends initial notifications to subscriptions. */
  protected readonly initialNotifyFunc = this.initialNotify.bind(this);

  /** A function which responds to when a subscription to this subscribable is destroyed. */
  protected readonly onSubDestroyedFunc = this.onSubDestroyed.bind(this);

  /**
   * Adds a subscription to this map.
   * @param sub The subscription to add.
   */
  protected addSubscription(sub: HandlerSubscription<SubscribableMapHandler<K, V>>): void {
    if (this.subs) {
      this.subs.push(sub);
    } else if (this.singletonSub) {
      this.subs = [this.singletonSub, sub];
      delete this.singletonSub;
    } else {
      this.singletonSub = sub;
    }
  }

  /** @inheritdoc */
  public abstract get(): ReadonlyMap<K, V>;

  /** @inheritdoc */
  public has(key: K): boolean {
    return this.get().has(key);
  }

  /** @inheritdoc */
  public getValue(key: K): V | undefined {
    return this.get().get(key);
  }

  /** @inheritdoc */
  public sub(handler: SubscribableMapHandler<K, V>, initialNotify = false, paused = false): Subscription {
    const sub = new HandlerSubscription(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);

    this.addSubscription(sub);

    if (paused) {
      sub.pause();
    } else if (initialNotify) {
      sub.initialNotify();
    }

    return sub;
  }

  /** @inheritdoc */
  public unsub(handler: SubscribableMapHandler<K, V>): void {
    let toDestroy: HandlerSubscription<SubscribableMapHandler<K, V>> | undefined = undefined;

    if (this.singletonSub && this.singletonSub.handler === handler) {
      toDestroy = this.singletonSub;
    } else if (this.subs) {
      toDestroy = this.subs.find(sub => sub.handler === handler);
    }

    toDestroy?.destroy();
  }

  /**
   * Notifies subscriptions of a change in this map.
   * @param type The type of change.
   * @param key The key related to the change.
   * @param value The value related to the change.
   */
  protected notify(type: SubscribableMapEventType, key: K, value: V): void {
    const map = this.get();

    const canCleanUpSubs = this.notifyDepth === 0;
    let needCleanUpSubs = false;
    this.notifyDepth++;

    if (this.singletonSub) {
      try {
        if (this.singletonSub.isAlive && !this.singletonSub.isPaused) {
          this.singletonSub.handler(map, type, key, value);
        }
      } catch (error) {
        console.error(`AbstractSubscribableMap: error in handler: ${error}`);
        if (error instanceof Error) {
          console.error(error.stack);
        }
      }

      if (canCleanUpSubs) {
        // If subscriptions were added during the notification, then singletonSub would be deleted and replaced with
        // the subs array.
        if (this.singletonSub) {
          needCleanUpSubs = !this.singletonSub.isAlive;
        } else if (this.subs) {
          for (let i = 0; i < this.subs.length; i++) {
            if (!this.subs[i].isAlive) {
              needCleanUpSubs = true;
              break;
            }
          }
        }
      }
    } else if (this.subs) {
      const subLen = this.subs.length;
      for (let i = 0; i < subLen; i++) {
        try {
          const sub = this.subs[i];
          if (sub.isAlive && !sub.isPaused) {
            sub.handler(map, type, key, value);
          }

          needCleanUpSubs ||= !sub.isAlive;
        } catch (error) {
          console.error(`AbstractSubscribableMap: error in handler: ${error}`);
          if (error instanceof Error) {
            console.error(error.stack);
          }
        }
      }

      // If subscriptions were added during the notification and a cleanup operation is not already pending, then we
      // need to check if any of the new subscriptions are already dead and if so, pend a cleanup operation.
      if (canCleanUpSubs && !needCleanUpSubs) {
        for (let i = subLen; i < this.subs.length; i++) {
          if (!this.subs[i].isAlive) {
            needCleanUpSubs = true;
            break;
          }
        }
      }
    }

    this.notifyDepth--;

    if (needCleanUpSubs) {
      if (this.singletonSub) {
        delete this.singletonSub;
      } else if (this.subs) {
        this.subs = this.subs.filter(sub => sub.isAlive);
      }
    }
  }

  /**
   * Notifies a subscription of this map's current state.
   * @param sub The subscription to notify.
   */
  protected initialNotify(sub: HandlerSubscription<SubscribableMapHandler<K, V>>): void {
    const map = this.get();
    for (const [key, value] of map) {
      sub.handler(map, SubscribableMapEventType.Added, key, value);
    }
  }

  /**
   * Responds to when a subscription to this map is destroyed.
   * @param sub The destroyed subscription.
   */
  protected onSubDestroyed(sub: HandlerSubscription<SubscribableMapHandler<K, V>>): void {
    // If we are not in the middle of a notify operation, remove the subscription.
    // Otherwise, do nothing and let the post-notify clean-up code handle it.
    if (this.notifyDepth === 0) {
      if (this.singletonSub === sub) {
        delete this.singletonSub;
      } else if (this.subs) {
        const index = this.subs.indexOf(sub);
        if (index >= 0) {
          this.subs.splice(index, 1);
        }
      }
    }
  }

  /**
   * Maps this subscribable to a new subscribable.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values. Defaults to the strict
   * equality comparison (`===`).
   * @returns The mapped subscribable.
   */
  public map<M>(fn: (input: ReadonlyMap<K, V>, previousVal?: M) => M, equalityFunc?: ((a: M, b: M) => boolean)): MappedSubject<[ReadonlyMap<K, V>], M>;
  /**
   * Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values.
   * @param mutateFunc The function to use to change the value of the mapped subscribable.
   * @param initialVal The initial value of the mapped subscribable.
   * @returns The mapped subscribable.
   */
  public map<M>(
    fn: (input: ReadonlyMap<K, V>, previousVal?: M) => M,
    equalityFunc: ((a: M, b: M) => boolean),
    mutateFunc: ((oldVal: M, newVal: M) => void),
    initialVal: M
  ): MappedSubject<[ReadonlyMap<K, V>], M>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public map<M>(
    fn: (input: ReadonlyMap<K, V>, previousVal?: M) => M,
    equalityFunc?: ((a: M, b: M) => boolean),
    mutateFunc?: ((oldVal: M, newVal: M) => void),
    initialVal?: M
  ): MappedSubject<[ReadonlyMap<K, V>], M> {
    const mapFunc = (inputs: readonly [ReadonlyMap<K, V>], previousVal?: M): M => fn(inputs[0], previousVal);
    return mutateFunc
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? MappedSubject.create<[ReadonlyMap<K, V>], M>(mapFunc, equalityFunc!, mutateFunc, initialVal!, this)
      : MappedSubject.create<[ReadonlyMap<K, V>], M>(mapFunc, equalityFunc ?? AbstractSubscribable.DEFAULT_EQUALITY_FUNC, this);
  }

  /**
   * Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this
   * subscribable's state is received through the subscription, it will be used as an input to change the other
   * subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe(to: MutableSubscribable<any, ReadonlyMap<K, V>>, paused?: boolean): Subscription;
  /**
   * Subscribes to and pipes mapped inputs from another subscribable. Whenever an update of the other subscribable's
   * state is received through the subscription, it will be transformed by the specified mapping function, and the
   * transformed state will be used as an input to change this subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
   * @param map The function to use to transform inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe<M>(to: MutableSubscribable<any, M>, map: (fromVal: ReadonlyMap<K, V>, toVal: M) => M, paused?: boolean): Subscription;
  /**
   * Subscribes to and pipes this map's state to a mutable subscribable map. Whenever a key-value pair added, changed,
   * or removed event is received through the subscription, the same key-value pair will be added to, changed, or
   * removed from the other map.
   * @param to The mutable subscribable map to which to pipe this map's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe(to: MutableSubscribableMap<K, V>, paused?: boolean): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public pipe<M>(
    to: MutableSubscribable<any, ReadonlyMap<K, V>> | MutableSubscribable<any, M> | MutableSubscribableMap<K, V>,
    arg2?: ((fromVal: ReadonlyMap<K, V>, toVal: M) => M) | boolean,
    arg3?: boolean
  ): Subscription {
    let sub;
    let paused;
    if (typeof arg2 === 'function') {
      sub = new SubscribablePipe(this, to as MutableSubscribable<any, M>, arg2 as (fromVal: ReadonlyMap<K, V>, toVal: M) => M, this.onSubDestroyedFunc);
      paused = arg3 ?? false;
    } else {
      if ('isSubscribableMap' in to) {
        sub = new SubscribableMapPipe(this, to as MutableSubscribableMap<K, V>, this.onSubDestroyedFunc);
      } else {
        sub = new SubscribablePipe(this, to as MutableSubscribable<any, ReadonlyMap<K, V>>, this.onSubDestroyedFunc);
      }

      paused = arg2 ?? false;
    }

    this.addSubscription(sub);

    if (paused) {
      sub.pause();
    } else {
      sub.initialNotify();
    }

    return sub;
  }
}