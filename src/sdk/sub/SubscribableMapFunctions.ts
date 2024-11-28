import { MathUtils, Rounding } from '../math/MathUtils';
import { Accessible } from './Accessible';
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
   * Generates a function which maps an input tuple to the sum of the numeric items contained in the tuple.
   * @returns A function which maps an input tuple to the sum of the numeric items contained in the tuple.
   */
  public static sum(): (input: readonly number[], currentVal?: number) => number {
    const reduceFunc = (sum: number, curr: number): number => sum + curr;

    return SubscribableMapFunctions.reduce(reduceFunc, 0);
  }

  /**
   * Generates a function which maps an input number tuple to the average numeric value contained in the tuple.
   * A zero-length tuple is mapped to NaN.
   * @returns A function which maps an input number tuple to the average numeric value contained in the tuple.
   */
  public static average(): (inputs: readonly number[], currentVal?: number) => number {
    return (inputs: readonly number[]): number => {
      const inputLength = inputs.length;
      let sum = 0;
      for (let i = 0; i < inputLength; i++) {
        sum += inputs[i];
      }

      return sum / inputLength;
    };
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
   * @param precision The precision to which to round the input. If the precision is defined as an `Accessible`, then
   * changes in the precision value will not be reflected in the mapped output until the next time the value of the
   * input number changes.
   * @param round The rounding behavior to use. Defaults to `Rounding.Nearest`.
   * @returns A function which maps an input number to a rounded version of itself at the specified precision.
   */
  public static withPrecision<T extends number>(
    precision: number | Accessible<number>,
    round = Rounding.Nearest
  ): (input: T, currentVal?: T) => number {
    const roundFunc = round > 0 ? MathUtils.ceil : round < 0 ? MathUtils.floor : MathUtils.round;

    return typeof precision === 'object'
      ? (input: T): number => {
        const precisionVal = precision.get();
        return roundFunc(input, precisionVal);
      }
      : (input: T): number => {
        return roundFunc(input, precision);
      };
  }

  /**
   * Generates a function which maps an input number to a rounded version of itself at a certain precision with
   * hysteresis applied.
   *
   * When a previously mapped value exists, any new input value (`x`) is compared to the previously mapped value
   * (`y0`). Define `x1` as the least input value that can be rounded to `y0` and `x2` as the greatest input value that
   * can be rounded to `y0`. Then `x` is mapped to a new rounded output value if and only if `x < x1 - h1` or
   * `x > x2 + h2`, where `h1` and `h2` are the lower and upper hysteresis values, respectively. Otherwise, `x` is
   * mapped to `y0`.
   * @param precision The precision to which to round the input.
   * @param hysteresis The hysteresis to apply to the mapping function. If defined as a `[number, number]` tuple, then
   * the first number in the tuple is taken as the lower hysteresis and second number as the upper hysteresis. If
   * defined as a single number, then that is taken as both the lower and upper hysteresis. Negative values are clamped
   * to zero.
   * @param round The rounding behavior to use. Defaults to `Rounding.Nearest`.
   * @returns A function which maps an input number to a rounded version of itself at the specified precision and with
   * the specified hysteresis.
   */
  public static withPrecisionHysteresis<T extends number>(
    precision: number,
    hysteresis: number | readonly [number, number],
    round = Rounding.Nearest
  ): (input: T, currentVal?: T) => number {
    let hysteresisLower: number;
    let hysteresisUpper: number;

    if (typeof hysteresis === 'number') {
      hysteresisLower = hysteresisUpper = Math.max(0, hysteresis);
    } else {
      hysteresisLower = Math.max(0, hysteresis[0]);
      hysteresisUpper = Math.max(0, hysteresis[1]);
    }

    let roundFunc: (value: number, precision: number) => number;
    let lowerOffset: number;
    let upperOffset: number;

    if (round > 0) {
      roundFunc = MathUtils.ceil;
      lowerOffset = -(precision + hysteresisLower);
      upperOffset = hysteresisUpper;
    } else if (round < 0) {
      roundFunc = MathUtils.floor;
      lowerOffset = -hysteresisLower;
      upperOffset = precision + hysteresisUpper;
    } else {
      roundFunc = MathUtils.round;
      lowerOffset = -(precision * 0.5 + hysteresisLower);
      upperOffset = precision * 0.5 + hysteresisUpper;
    }

    // Use a helper function to generate the mapping function so that the generated closure doesn't capture extraneous
    // variables and prevent them from being GC'd.
    return SubscribableMapFunctions.withPrecisionHysteresisHelper(precision, roundFunc, lowerOffset, upperOffset, round <= 0);
  }

  /**
   * Generates a function which maps an input number to a rounded version of itself at a certain precision with
   * hysteresis applied.
   * @param precision The precision to which to round the input.
   * @param roundFunc The function to use to round the input.
   * @param lowerOffset The offset from the previously mapped value to the lower boundary of the range in which a new
   * input number should not be mapped to a new output value.
   * @param upperOffset The offset from the previously mapped value to the upper boundary of the range in which a new
   * input number should not be mapped to a new output value.
   * @param isRangeOpenLower Whether the boundaries of the range in which a new input number should not be mapped to a
   * new output value is open at the lower end and closed at the upper end instead of closed at the lower end and open
   * at the upper end.
   * @returns A function which maps an input number to a rounded version of itself at the specified precision and with
   * the specified hysteresis.
   */
  private static withPrecisionHysteresisHelper<T extends number>(
    precision: number,
    roundFunc: (value: number, precision: number) => number,
    lowerOffset: number,
    upperOffset: number,
    isRangeOpenLower: boolean,
  ): (input: T, currentVal?: T) => number {
    if (isRangeOpenLower) {
      return (input: T, currentVal?: T): number => {
        if (currentVal === undefined || !isFinite(input)) {
          return roundFunc(input, precision);
        } else {
          if (input < currentVal + lowerOffset || input >= currentVal + upperOffset) {
            return roundFunc(input, precision);
          } else {
            return currentVal;
          }
        }
      };
    } else {
      return (input: T, currentVal?: T): number => {
        if (currentVal === undefined || !isFinite(input)) {
          return roundFunc(input, precision);
        } else {
          if (input <= currentVal + lowerOffset || input > currentVal + upperOffset) {
            return roundFunc(input, precision);
          } else {
            return currentVal;
          }
        }
      };
    }
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
}
