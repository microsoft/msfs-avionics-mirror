import { AbstractSubscribable } from './AbstractSubscribable';
import { HandlerSubscription } from './HandlerSubscription';
import { MappedSubject } from './MappedSubject';
import { MutableSubscribable } from './Subscribable';
import { SubscribablePipe } from './SubscribablePipe';
import { Subscription } from './Subscription';

/**
 * A function which handles changes in an {@link ObjectSubject}'s state.
 */
export type ObjectSubjectHandler<T extends Record<string, any>> = (v: Readonly<T>, key: keyof T, newValue: T[keyof T], oldValue: T[keyof T]) => void;

/**
 * A object-valued subscribable subject which supports setting individual properties on the object and notifying
 * subscribers of any changes to those properties.
 */
export class ObjectSubject<T extends Record<string, any>> implements MutableSubscribable<Readonly<T>, Partial<Readonly<T>>> {
  public readonly isSubscribable = true;
  public readonly isMutableSubscribable = true;

  private singletonSub?: HandlerSubscription<ObjectSubjectHandler<T>>;
  private subs: HandlerSubscription<ObjectSubjectHandler<T>>[] = [];
  private notifyDepth = 0;

  private readonly initialNotifyFunc = this.initialNotify.bind(this);
  private readonly onSubDestroyedFunc = this.onSubDestroyed.bind(this);

  /**
   * Constructs an observable object Subject.
   * @param obj The initial object.
   */
  private constructor(
    private readonly obj: T,
  ) {
  }

  /**
   * Creates and returns a new ObjectSubject.
   * @param v The initial value of the subject.
   * @returns An ObjectSubject instance.
   */
  public static create<T extends Record<string, any>>(v: T): ObjectSubject<T> {
    return new ObjectSubject(v);
  }

  /**
   * Gets this subject's object.
   * @returns This subject's object.
   */
  public get(): Readonly<T> {
    return this.obj;
  }

  /** @inheritdoc */
  public sub(handler: ObjectSubjectHandler<T>, initialNotify = false, paused = false): Subscription {
    const sub = new HandlerSubscription<ObjectSubjectHandler<T>>(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);

    this.addSubscription(sub);

    if (paused) {
      sub.pause();
    } else if (initialNotify) {
      sub.initialNotify();
    }

    return sub;
  }

  /**
   * Adds a subscription to this subscribable.
   * @param sub The subscription to add.
   */
  private addSubscription(sub: HandlerSubscription<ObjectSubjectHandler<T>>): void {
    if (this.subs) {
      this.subs.push(sub);
    } else if (this.singletonSub) {
      this.subs = [this.singletonSub, sub];
      delete this.singletonSub;
    } else {
      this.singletonSub = sub;
    }
  }

  /**
   * Sets the values of a subset of the properties of this subject's object and notifies subscribers if any of the
   * values changed.
   * @param value An object defining the values of the properties to set.
   */
  public set(value: Partial<Readonly<T>>): void;
  /**
   * Sets the value of one of the properties of this subject's object and notifies subscribers if the value changed.
   * @param key The property to set.
   * @param value The new value.
   */
  public set<K extends keyof T>(key: K, value: T[K]): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public set<K extends keyof T>(arg1: Partial<Readonly<T>> | K, value?: T[K]): void {
    if (typeof arg1 === 'object') {
      for (const prop in arg1) {
        if (prop in this.obj) {
          this.set(prop, arg1[prop] as T[keyof T]);
        }
      }
    } else {
      const oldValue = this.obj[arg1];
      if (value !== oldValue) {
        this.obj[arg1] = value as T[K];
        this.notify(arg1, oldValue);
      }
    }
  }

  /**
   * Notifies subscriptions that one of the properties of this subject's object has changed.
   * @param key The property of the object that changed.
   * @param oldValue The old value of the property that changed.
   */
  private notify(key: keyof T, oldValue: T[keyof T]): void {
    const canCleanUpSubs = this.notifyDepth === 0;
    let needCleanUpSubs = false;
    this.notifyDepth++;

    if (this.singletonSub) {
      try {
        if (this.singletonSub.isAlive && !this.singletonSub.isPaused) {
          this.singletonSub.handler(this.obj, key, this.obj[key], oldValue);
        }
      } catch (error) {
        console.error(`ObjectSubject: error in handler: ${error}`);
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
          if (!sub.isPaused) {
            sub.handler(this.obj, key, this.obj[key], oldValue);
          }

          needCleanUpSubs ||= canCleanUpSubs && !sub.isAlive;
        } catch (error) {
          console.error(`ObjectSubject: error in handler: ${error}`);
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
   * Notifies a subscription of this subject's current state.
   * @param sub The subscription to notify.
   */
  private initialNotify(sub: HandlerSubscription<ObjectSubjectHandler<T>>): void {
    for (const key in this.obj) {
      const v = this.obj[key];
      sub.handler(this.obj, key, v, v);
    }
  }

  /**
   * Responds to when a subscription to this subscribable is destroyed.
   * @param sub The destroyed subscription.
   */
  private onSubDestroyed(sub: HandlerSubscription<ObjectSubjectHandler<T>>): void {
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
   * Maps this subject to a new subscribable.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values. Defaults to the strict
   * equality comparison (`===`).
   * @returns The mapped subscribable.
   */
  public map<M>(fn: (input: T, previousVal?: M) => M, equalityFunc?: ((a: M, b: M) => boolean)): MappedSubject<[T], M>;
  /**
   * Maps this subject to a new subscribable with a persistent, cached value which is mutated when it changes.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values.
   * @param mutateFunc The function to use to change the value of the mapped subscribable.
   * @param initialVal The initial value of the mapped subscribable.
   * @returns The mapped subscribable.
   */
  public map<M>(
    fn: (input: Readonly<T>, previousVal?: M) => M,
    equalityFunc: ((a: M, b: M) => boolean),
    mutateFunc: ((oldVal: M, newVal: M) => void),
    initialVal: M
  ): MappedSubject<[Readonly<T>], M>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public map<M>(
    fn: (input: Readonly<T>, previousVal?: M) => M,
    equalityFunc?: ((a: M, b: M) => boolean),
    mutateFunc?: ((oldVal: M, newVal: M) => void),
    initialVal?: M
  ): MappedSubject<[Readonly<T>], M> {
    const mapFunc = (inputs: readonly [Readonly<T>], previousVal?: M): M => fn(inputs[0], previousVal);
    return mutateFunc
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? MappedSubject.create(mapFunc, equalityFunc!, mutateFunc, initialVal!, this)
      : MappedSubject.create(mapFunc, equalityFunc ?? AbstractSubscribable.DEFAULT_EQUALITY_FUNC, this);
  }

  /**
   * Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this
   * subscribable's state is received through the subscription, it will be used as an input to change the other
   * subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe(to: MutableSubscribable<any, T>, paused?: boolean): Subscription;
  /**
   * Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update
   * of this subscribable's state is received through the subscription, it will be transformed by the specified mapping
   * function, and the transformed state will be used as an input to change the other subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
   * @param map The function to use to transform inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe<M>(to: MutableSubscribable<any, M>, map: (fromVal: T, toVal: M) => M, paused?: boolean): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public pipe<M>(to: MutableSubscribable<any, T> | MutableSubscribable<any, M>, arg2?: ((fromVal: T, toVal: M) => M) | boolean, arg3?: boolean): Subscription {
    let sub;
    let paused;
    if (typeof arg2 === 'function') {
      sub = new SubscribablePipe(this, to as MutableSubscribable<any, M>, arg2, this.onSubDestroyedFunc);
      paused = arg3 ?? false;
    } else {
      sub = new SubscribablePipe(this, to as MutableSubscribable<any, T>, this.onSubDestroyedFunc);
      paused = arg2 ?? false;
    }

    this.subs.push(sub);

    if (paused) {
      sub.pause();
    } else {
      sub.initialNotify();
    }

    return sub;
  }
}
