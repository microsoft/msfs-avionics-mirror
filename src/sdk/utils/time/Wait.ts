import { Consumer } from '../../data';
import { ReadonlySubEvent, Subscribable } from '../../sub';

/**
 * A utility class for generating Promises that wait for certain conditions before they are fulfilled.
 */
export class Wait {
  /**
   * Waits for a set amount of time.
   * @param delay The amount of time to wait in milliseconds.
   * @returns a Promise which is fulfilled after the delay.
   */
  public static awaitDelay(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), delay));
  }

  /**
   * Waits for a condition to be satisfied.
   * @param predicate A function which evaluates whether the condition is satisfied.
   * @param interval The interval, in milliseconds, at which to evaluate the condition. A zero or negative value
   * causes the condition to be evaluated every frame. Defaults to 0.
   * @param timeout The amount of time, in milliseconds, before the returned Promise is rejected if the condition is
   * not satisfied. A zero or negative value causes the Promise to never be rejected and the condition to be
   * continually evaluated until it is satisfied. Defaults to 0.
   * @returns a Promise which is fulfilled when the condition is satisfied.
   */
  public static awaitCondition(predicate: () => boolean, interval = 0, timeout = 0): Promise<void> {
    const t0 = Date.now();
    if (interval <= 0) {
      const loopFunc = (resolve: () => void, reject: (reason?: any) => void): void => {
        if (timeout > 0 && Date.now() - t0 >= timeout) {
          reject('Await condition timed out.');
        } else {
          predicate() ? resolve() : requestAnimationFrame(loopFunc.bind(undefined, resolve, reject));
        }
      };
      return new Promise((resolve, reject) => { loopFunc(resolve, reject); });
    } else {
      return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
          if (timeout > 0 && Date.now() - t0 > timeout) {
            clearInterval(timer);
            reject('Await condition timed out.');
          } else if (predicate()) {
            clearInterval(timer);
            resolve();
          }
        }, interval);
      });
    }
  }

  /**
   * Waits for a notification from a {@link Subscribable}, with an optional condition to end the wait based on the value
   * of the subscribable.
   * @param subscribable The subscribable to wait for.
   * @param predicate A function which evaluates whether the value of the subscribable satisfies the condition for the
   * wait to end. If not defined, any value is considered satisfactory.
   * @param initialCheck Whether to immediately receive a notification from the subscribable at the start of the wait.
   * Defaults to `false`.
   * @param timeout The amount of time, in milliseconds, before the returned Promise is rejected if the condition is
   * not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0.
   * @returns A Promise which is fulfilled with the value of the subscribable when a notification is received with a
   * value that satisfies the condition for the wait to end.
   */
  public static awaitSubscribable<T>(subscribable: Subscribable<T>, predicate?: (value: T) => boolean, initialCheck = false, timeout = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const sub = subscribable.sub(val => {
        if (predicate === undefined || predicate(val)) {
          sub.destroy();
          resolve(val);
        }
      }, false, true);
      sub.resume(initialCheck);

      if (timeout > 0) {
        setTimeout(() => {
          if (sub.isAlive) {
            sub.destroy();
            reject('Await condition timed out.');
          }
        }, timeout);
      }
    });
  }

  /**
   * Waits for an event from a {@link Consumer}, with an optional condition to end the wait based on the value of the
   * consumed event.
   * @param consumer The event consumer to wait for.
   * @param predicate A function which evaluates whether the value of the consumed event satisfies the condition for
   * the wait to end. If not defined, any value is considered satisfactory.
   * @param initialCheck Whether to immediately receive an event from the event consumer at the start of the wait.
   * Defaults to `false`.
   * @param timeout The amount of time, in milliseconds, before the returned Promise is rejected if the condition is
   * not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0.
   * @returns A Promise which is fulfilled with the value of the consumed event when an event is received with a
   * value that satisfies the condition for the wait to end.
   */
  public static awaitConsumer<T>(consumer: Consumer<T>, predicate?: (value: T) => boolean, initialCheck = false, timeout = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const sub = consumer.handle(val => {
        if (predicate === undefined || predicate(val)) {
          sub.destroy();
          resolve(val);
        }
      }, true);
      sub.resume(initialCheck);

      if (timeout > 0) {
        setTimeout(() => {
          if (sub.isAlive) {
            sub.destroy();
            reject('Await condition timed out.');
          }
        }, timeout);
      }
    });
  }

  /**
   * Waits for an event from a {@link ReadonlySubEvent}, with an optional condition to end the wait based on the sender
   * and data of the event.
   * @param event The event to wait for.
   * @param predicate A function which evaluates whether the sender and data of the event satisfy the condition for
   * the wait to end. If not defined, any sender/data is considered satisfactory.
   * @param timeout The amount of time, in milliseconds, before the returned Promise is rejected if the condition is
   * not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0.
   * @returns A Promise which is fulfilled with the data of the event when an event is received with a sender and data
   * that satisfy the condition for the wait to end.
   */
  public static awaitSubEvent<SenderType, DataType>(
    event: ReadonlySubEvent<SenderType, DataType>,
    predicate?: (data: DataType, sender: SenderType) => boolean,
    timeout = 0
  ): Promise<DataType> {
    return new Promise((resolve, reject) => {
      const sub = event.on((sender, data) => {
        if (predicate === undefined || predicate(data, sender)) {
          sub.destroy();
          resolve(data);
        }
      }, true);
      sub.resume();

      if (timeout > 0) {
        setTimeout(() => {
          if (sub.isAlive) {
            sub.destroy();
            reject('Await condition timed out.');
          }
        }, timeout);
      }
    });
  }
}