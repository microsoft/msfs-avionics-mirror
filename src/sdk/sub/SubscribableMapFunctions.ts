import { Subscribable } from './Subscribable';
import { SubscribableUtils } from './SubscribableUtils';

/**
 * Utility class for generating common functions for mapping subscribables.
 */
export class SubscribableMapFunctions {
  /**
   * Generates a function which maps an input to itself.
   * @returns A function which maps an input to itself.
   */
  public static identity<T>(): (input: T) => T {
    return (input: T): T => input;
  }

  /**
   * Generates a function which maps an input boolean to its negation.
   * @returns A function which maps an input boolean to its negation.
   */
  public static not<T extends boolean>(): (input: T, currentVal?: T) => boolean {
    return (input: T): boolean => !input;
  }

  /**
   * Generates a function which maps an input boolean tuple to `true` if at least one tuple member is `true` and to
   * `false` otherwise. A zero-length tuple is mapped to `false`.
   * @returns A function which maps an input boolean tuple to `true` if at least one tuple member is `true` and to
   * `false` otherwise.
   */
  public static or(): (input: readonly boolean[], currentVal?: boolean) => boolean {
    return (input: readonly boolean[]): boolean => input.length > 0 && input.includes(true);
  }

  /**
   * Generates a function which maps an input boolean tuple to `true` if no tuple member is `true` and to
   * `false` otherwise. A zero-length tuple is mapped to `true`.
   * @returns A function which maps an input boolean tuple to `true` if no tuple member is `true` or there are no
   * tuple members, and to `false` otherwise.
   */
  public static nor(): (input: readonly boolean[], currentVal?: boolean) => boolean {
    return (input: readonly boolean[]): boolean => !input.includes(true);
  }

  /**
   * Generates a function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
   * otherwise. A zero-length tuple is mapped to `false`.
   * @returns A function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
   * otherwise.
   */
  public static and(): (input: readonly boolean[], currentVal?: boolean) => boolean {
    return (input: readonly boolean[]): boolean => input.length > 0 && !input.includes(false);
  }

  /**
   * Generates a function which maps an input boolean tuple to `false` if all tuple members are `true` and to `false`
   * otherwise. A zero-length tuple is mapped to `true`.
   * @returns A function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
   * otherwise.
   */
  public static nand(): (input: readonly boolean[], currentVal?: boolean) => boolean {
    return (input: readonly boolean[]): boolean => input.length < 1 || input.includes(false);
  }

  /**
   * Generates a function which maps an input number to its negation.
   * @returns A function which maps an input number to its negation.
   */
  public static negate<T extends number>(): (input: T, currentVal?: T) => number {
    return (input: T): number => -input;
  }

  /**
   * Generates a function which maps an input number to its absolute value.
   * @returns A function which maps an input number to its absolute value.
   */
  public static abs<T extends number>(): (input: T, currentVal?: T) => number {
    return Math.abs;
  }

  /**
   * Generates a function which maps an input number tuple to the minimum numeric value contained in the tuple.
   * A zero-length tuple is mapped to Infinity.
   * @returns A function which maps an input number tuple to the minimum numeric value contained in the tuple.
   */
  public static min(): (input: readonly number[], currentVal?: number) => number {
    return (input: readonly number[]): number => Math.min(...input);
  }

  /**
   * Generates a function which maps an input number tuple to the maximum numeric value contained in the tuple.
   * A zero-length tuple is mapped to -Infinity.
   * @returns A function which maps an input number tuple to the maximum numeric value contained in the tuple.
   */
  public static max(): (input: readonly number[], currentVal?: number) => number {
    return (input: readonly number[]): number => Math.max(...input);
  }

  /**
   * Generates a function which maps an input tuple to a count of the number of items in the tuple that satisfy a
   * given condition.
   * @param predicate A function which evaluates whether an item should be counted.
   * @returns A function which maps an input tuple to a count of the number of items in the tuple that satisfy the
   * condition specified by the predicate.
   */
  public static count<T>(predicate: (value: T) => boolean): (input: readonly T[], currentVal?: number) => number {
    const reduceFunc = (sum: number, curr: T): number => {
      if (predicate(curr)) {
        return sum + 1;
      } else {
        return sum;
      }
    };

    return SubscribableMapFunctions.reduce(reduceFunc, 0);
  }

  /**
   * Generates a function which maps an input tuple to an arbitrary accumulated value by calling a specified function
   * for each input in the tuple in order. The return value of the callback function is the accumulated value and is
   * provided as an argument in the next call to the callback function. The accumulated value provided as an argument
   * to the first call to the callback function is equal to the first input in the tuple. The value returned by the
   * last invocation of the callback function is the final mapped value.
   * @param callbackFn A callback function that returns an accumulated value after being called for each input.
   * @returns A function which maps an input tuple to an arbitrary accumulated value by calling the specified function
   * for each input in the tuple in order.
   */
  public static reduce<T>(
    callbackFn: (previousValue: T, currentInput: T, currentIndex: number, inputs: readonly T[]) => T,
    initialValue?: T
  ): (input: readonly T[], currentVal?: T) => T;
  /**
   * Generates a function which maps an input tuple to an arbitrary accumulated value by calling a specified function
   * for each input in the tuple in order. The return value of the callback function is the accumulated value and is
   * provided as an argument in the next call to the callback function. The value returned by the last invocation of
   * the callback function is the final mapped value.
   * @param callbackFn A callback function that returns an accumulated value after being called for each input.
   * @param initialValue The initial accumulated value to provide as an argument to the first call to the callback
   * function.
   * @returns A function which maps an input tuple to an arbitrary accumulated value by calling the specified function
   * for each input in the tuple in order.
   */
  public static reduce<T, U>(
    callbackFn: (previousValue: U, currentInput: T, currentIndex: number, inputs: readonly T[]) => U,
    initialValue: U
  ): (input: readonly T[], currentVal?: U) => U;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static reduce<T>(
    callbackFn: (previousValue: any, currentInput: T, currentIndex: number, inputs: readonly T[]) => any,
    initialValue?: any
  ): (input: readonly T[], currentVal?: any) => any {
    return (input: readonly T[]): any => input.reduce(callbackFn, initialValue);
  }

  /**
   * Generates a function which maps an input number to a rounded version of itself at a certain precision.
   * @param precision The precision to which to round the input.
   * @returns A function which maps an input number to a rounded version of itself at the specified precision.
   */
  public static withPrecision<T extends number>(precision: number | Subscribable<number>): (input: T, currentVal?: T) => number {
    return SubscribableUtils.isSubscribable(precision)
      ? (input: T): number => {
        const precisionVal = precision.get();
        return Math.round(input / precisionVal) * precisionVal;
      }
      : (input: T): number => {
        return Math.round(input / precision) * precision;
      };
  }

  /**
   * Generates a function which maps an input number to itself if and only if it differs from the previous mapped value
   * by a certain amount, and to the previous mapped value otherwise.
   * @param threshold The minimum difference between the input and the previous mapped value required to map the input
   * to itself.
   * @returns A function which maps an input number to itself if and only if it differs from the previous mapped value
   * by the specified amount, and to the previous mapped value otherwise.
   */
  public static changedBy<T extends number>(threshold: number | Subscribable<number>): (input: T, currentVal?: T) => number {
    return SubscribableUtils.isSubscribable(threshold)
      ? (input: T, currentVal?: T): number => currentVal === undefined || Math.abs(input - currentVal) >= threshold.get() ? input : currentVal
      : (input: T, currentVal?: T): number => currentVal === undefined || Math.abs(input - currentVal) >= threshold ? input : currentVal;
  }

  /**
   * Generates a function which maps an input number to itself up to a maximum frequency, and to the previous mapped
   * value otherwise. In other words, the mapping function will not pass through changes in the input value if not
   * enough time has elapsed since the last change that was passed through.
   * 
   * **Caution**: The mapping function can only pass through the input value when the input value changes. This means
   * that if the mapping function rejects a change in the input value due to the maximum frequency being exceeded, it
   * is possible that particular input value will never be reflected in the mapped value, even after the frequency
   * cutoff has expired. For example, if the input value changes from `a` to `b` but is rejected by the mapping
   * function and subsequently remains `b` forever, then the mapped value will remain `a` forever.
   * @param freq The maximum frequency at which to map the input to itself, in hertz.
   * @param timeFunc A function which gets the current time in milliseconds. Defaults to `Date.now()`.
   * @returns A function which maps an input number to itself up to the specified maximum frequency, and to the
   * previous mapped value otherwise.
   */
  public static atFrequency<T>(freq: number | Subscribable<number>, timeFunc: () => number = Date.now): (input: T, currentVal?: T) => T {
    let t0: number;
    let timeRemaining = 0;

    if (SubscribableUtils.isSubscribable(freq)) {
      return (input: T, currentVal?: T): T => {
        let returnValue = currentVal ?? input;

        const currentTime = timeFunc();
        const dt = currentTime - (t0 ??= currentTime);
        t0 = currentTime;

        timeRemaining -= dt;

        if (timeRemaining <= 0) {
          const period = 1000 / freq.get();
          timeRemaining = period + timeRemaining % period;
          returnValue = input;
        }

        return returnValue;
      };
    } else {
      const period = 1000 / freq;

      return (input: T, currentVal?: T): T => {
        let returnValue = currentVal ?? input;

        const currentTime = timeFunc();
        const dt = currentTime - (t0 ??= currentTime);
        t0 = currentTime;

        timeRemaining -= dt;

        if (timeRemaining <= 0) {
          timeRemaining = period + timeRemaining % period;
          returnValue = input;
        }

        return returnValue;
      };
    }
  }
}
