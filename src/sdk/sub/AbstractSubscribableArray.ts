import { HandlerSubscription } from './HandlerSubscription';
import { SubscribableArray, SubscribableArrayEventType, SubscribableArrayHandler } from './SubscribableArray';
import { Subscription } from './Subscription';

/**
 * An array-like class to observe changes in a list of objects.
 * @class ArraySubject
 * @template T
 */
export abstract class AbstractSubscribableArray<T> implements SubscribableArray<T> {
  /** @inheritdoc */
  public abstract readonly length: number;

  protected singletonSub?: HandlerSubscription<SubscribableArrayHandler<T>>;

  protected subs?: HandlerSubscription<SubscribableArrayHandler<T>>[];
  protected notifyDepth = 0;

  /** A function which sends initial notifications to subscriptions. */
  protected readonly initialNotifyFunc = this.initialNotify.bind(this);

  /** A function which responds to when a subscription to this subscribable is destroyed. */
  protected readonly onSubDestroyedFunc = this.onSubDestroyed.bind(this);

  /**
   * Adds a subscription to this array.
   * @param sub The subscription to add.
   */
  protected addSubscription(sub: HandlerSubscription<SubscribableArrayHandler<T>>): void {
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
  public sub(handler: SubscribableArrayHandler<T>, initialNotify = false, paused = false): Subscription {
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
  public unsub(handler: SubscribableArrayHandler<T>): void {
    let toDestroy: HandlerSubscription<SubscribableArrayHandler<T>> | undefined = undefined;

    if (this.singletonSub && this.singletonSub.handler === handler) {
      toDestroy = this.singletonSub;
    } else if (this.subs) {
      toDestroy = this.subs.find(sub => sub.handler === handler);
    }

    toDestroy?.destroy();
  }

  /** @inheritdoc */
  public abstract getArray(): readonly T[];

  /**
   * Gets an item from the array.
   * @param index Thex index of the item to get.
   * @returns An item.
   * @throws
   */
  public get(index: number): T {
    const array = this.getArray();
    if (index > array.length - 1) {
      throw new Error('Index out of range');
    }
    return array[index];
  }

  /**
   * Tries to get the value from the array.
   * @param index The index of the item to get.
   * @returns The value or undefined if not found.
   */
  public tryGet(index: number): T | undefined {
    return this.getArray()[index];
  }

  /**
   * Notifies subscriptions of a change in the array.
   * @param index The index that was changed.
   * @param type The type of subject event.
   * @param modifiedItem The item modified by the operation.
   */
  protected notify(index: number, type: SubscribableArrayEventType, modifiedItem?: T | readonly T[]): void {
    const canCleanUpSubs = this.notifyDepth === 0;
    let needCleanUpSubs = false;
    this.notifyDepth++;

    if (this.singletonSub) {
      try {
        if (this.singletonSub.isAlive && !this.singletonSub.isPaused) {
          this.singletonSub.handler(index, type, modifiedItem, this.getArray());
        }
      } catch (error) {
        console.error(`AbstractSubscribableArray: error in handler: ${error}`);
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
            sub.handler(index, type, modifiedItem, this.getArray());
          }

          needCleanUpSubs ||= !sub.isAlive;
        } catch (error) {
          console.error(`AbstractSubscribableArray: error in handler: ${error}`);
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
   * Notifies a subscription of this array's current state.
   * @param sub The subscription to notify.
   */
  protected initialNotify(sub: HandlerSubscription<SubscribableArrayHandler<T>>): void {
    const array = this.getArray();
    sub.handler(0, SubscribableArrayEventType.Added, array, array);
  }

  /**
   * Responds to when a subscription to this array is destroyed.
   * @param sub The destroyed subscription.
   */
  protected onSubDestroyed(sub: HandlerSubscription<SubscribableArrayHandler<T>>): void {
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
}