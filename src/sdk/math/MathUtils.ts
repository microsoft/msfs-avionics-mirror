/**
 * Rounding behaviors.
 */
export enum Rounding {
  Down = -1,
  Nearest = 0,
  Up = 1
}

/**
 * A utitlity class for basic math.
 */
export class MathUtils {
  /** Twice the value of pi. */
  public static readonly TWO_PI = Math.PI * 2;

  /** Half the value of pi. */
  public static readonly HALF_PI = Math.PI / 2;

  /** Square root of 3. */
  public static readonly SQRT3 = Math.sqrt(3);

  /** Square root of 1/3. */
  public static readonly SQRT1_3 = 1 / Math.sqrt(3);

  /**
   * Clamps a numerical value to the min/max range.
   * @param value The value to be clamped.
   * @param min The minimum.
   * @param max The maximum.
   *
   * @returns The clamped numerical value..
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Rounds a number.
   * @param value The number to round.
   * @param precision The precision with which to round. Defaults to `1`.
   * @returns The rounded number.
   */
  public static round(value: number, precision = 1): number {
    return Math.round(value / precision) * precision;
  }

  /**
   * Ceils a number.
   * @param value The number to ceil.
   * @param precision The precision with which to ceil. Defaults to `1`.
   * @returns The ceiled number.
   */
  public static ceil(value: number, precision = 1): number {
    return Math.ceil(value / precision) * precision;
  }

  /**
   * Floors a number.
   * @param value The number to floor.
   * @param precision The precision with which to floor. Defaults to `1`.
   * @returns The floored number.
   */
  public static floor(value: number, precision = 1): number {
    return Math.floor(value / precision) * precision;
  }

  /**
   * Normalizes an angle in radians.
   * @param radians The angle to normalize, in radians.
   * @param lowerBound The lower bound of the normalized angle, in radians. The normalized angle will fall in the
   * range `[lowerBound, lowerBound + 2 * pi)`. Defaults to `0`.
   * @returns The specified angle after normalization, in radians.
   */
  public static normalizeAngle(radians: number, lowerBound = 0): number {
    return (((radians - lowerBound) % MathUtils.TWO_PI) + MathUtils.TWO_PI) % MathUtils.TWO_PI + lowerBound;
  }

  /**
   * Normalizes an angle in degrees.
   * @param degrees The angle to normalize, in degrees.
   * @param lowerBound The lower bound of the normalized angle, in degrees. The normalized angle will fall in the
   * range `[lowerBound, lowerBound + 360)`. Defaults to `0`.
   * @returns The specified angle after normalization, in degrees.
   */
  public static normalizeAngleDeg(degrees: number, lowerBound = 0): number {
    return (((degrees - lowerBound) % 360) + 360) % 360 + lowerBound;
  }

  /**
   * Gets the angular distance, in radians, swept from an starting angle to an ending angle.
   * @param startRadians The starting angle, in radians.
   * @param endRadians The ending angle, in radians.
   * @param direction The direction to sweep from start to end. A positive value indicates sweeping in the direction
   * of increasing angle. A negative value indicates sweeping in the direction of decreasing angle. A value of zero
   * indicates that the direction should be chosen to produce the smallest angular distance.
   * @returns The angular distance, in radians, swept from the specified starting angle to the ending angle in the
   * specified direction.
   */
  public static angularDistance(startRadians: number, endRadians: number, direction: number): number {
    const sign = direction < 0 ? -1 : 1;
    const diff = MathUtils.normalizeAngle((endRadians - startRadians) * sign);
    return direction === 0 ? Math.min(diff, MathUtils.TWO_PI - diff) : diff;
  }

  /**
   * Gets the angular distance, in degrees, swept from an starting angle to an ending angle.
   * @param startDegrees The starting angle, in degrees.
   * @param endDegrees The ending angle, in degrees.
   * @param direction The direction to sweep from start to end. A positive value indicates sweeping in the direction
   * of increasing angle. A negative value indicates sweeping in the direction of decreasing angle. A value of zero
   * indicates that the direction should be chosen to produce the smallest angular distance.
   * @returns The angular distance, in degrees, swept from the specified starting angle to the ending angle in the
   * specified direction.
   */
  public static angularDistanceDeg(startDegrees: number, endDegrees: number, direction: number): number {
    const sign = direction < 0 ? -1 : 1;
    const diff = MathUtils.normalizeAngleDeg((endDegrees - startDegrees) * sign);
    return direction === 0 ? Math.min(diff, 360 - diff) : diff;
  }

  /**
   * Calculates the angular difference between two angles in the range `[0, 2 * pi)`. The calculation supports both
   * directional and non-directional differences. The directional difference is the angle swept from the start angle
   * to the end angle proceeding in the direction of increasing angle. The non-directional difference is the smaller
   * of the two angles swept from the start angle to the end angle proceeding in either direction.
   * @param start The starting angle, in radians.
   * @param end The ending angle, in radians.
   * @param directional Whether to calculate the directional difference. Defaults to `true`.
   * @returns The angular difference between the two angles, in radians, in the range `[0, 2 * pi)`.
   */
  public static diffAngle(start: number, end: number, directional = true): number {
    return MathUtils.angularDistance(start, end, directional ? 1 : 0);
  }

  /**
   * Calculates the angular difference between two angles in the range `[0, 360)`. The calculation supports both
   * directional and non-directional differences. The directional difference is the angle swept from the start angle
   * to the end angle proceeding in the direction of increasing angle. The non-directional difference is the smaller
   * of the two angles swept from the start angle to the end angle proceeding in either direction.
   * @param start The starting angle, in degrees.
   * @param end The ending angle, in degrees.
   * @param directional Whether to calculate the directional difference. Defaults to `true`.
   * @returns The angular difference between the two angles, in degrees, in the range `[0, 360)`.
   */
  public static diffAngleDeg(start: number, end: number, directional = true): number {
    return MathUtils.angularDistanceDeg(start, end, directional ? 1 : 0);
  }

  /**
   * Linearly interpolates a keyed value along one dimension.
   * @param x The key of the value to interpolate.
   * @param x0 The key of the first known value.
   * @param x1 The key of the second known value.
   * @param y0 The first known value.
   * @param y1 The second known value.
   * @param clampStart Whether to clamp the interpolated value to the first known value. Defaults to false.
   * @param clampEnd Whether to clamp the interpolated value to the second known value. Defaults to false.
   * @returns The interpolated value corresponding to the specified key.
   */
  public static lerp(x: number, x0: number, x1: number, y0: number, y1: number, clampStart = false, clampEnd = false): number {
    if (x0 !== x1 && y0 !== y1) {
      const fraction = MathUtils.clamp((x - x0) / (x1 - x0), clampStart ? 0 : -Infinity, clampEnd ? 1 : Infinity);
      return fraction * (y1 - y0) + y0;
    } else {
      return y0;
    }
  }

  /**
   * Linearly interpolates a keyed vector along one dimension. If the known vectors and the result vector have unequal
   * lengths, then only the components shared by all vectors are interpolated in the result.
   * @param out The object to which to write the result.
   * @param x The key of the vector to interpolate.
   * @param x0 The key of the first known vector.
   * @param x1 The key of the second known vector.
   * @param y0 The first known vector.
   * @param y1 The second known vector.
   * @param clampStart Whether to clamp the components of the interpolated vector to those of the first known vector.
   * Defaults to false.
   * @param clampEnd Whether to clamp the components of the interpolated vector to those of the second known vector.
   * Defaults to false.
   * @returns The interpolated vector corresponding to the specified key.
   */
  public static lerpVector(out: Float64Array, x: number, x0: number, x1: number, y0: ArrayLike<number>, y1: ArrayLike<number>, clampStart = false, clampEnd = false): Float64Array {
    const length = Math.min(y0.length, y1.length, out.length);

    for (let i = 0; i < length; i++) {
      out[i] = MathUtils.lerp(x, x0, x1, y0[i], y1[i], clampStart, clampEnd);
    }

    return out;
  }

  /**
   * Gets the sign of a number, including 0.
   * @param n The number to get the sign of.
   * @returns 1.0 if the number is positive, +0 or Infinity;
    -1.0 if the number is negative, -0 or -Infinity;
    NaN if the number is NaN
   */
  public static hardSign(n: number): 1 | -1 | typeof NaN {
    return isNaN(n) ? NaN : (n < 0 || Object.is(n, -0) ? -1 : 1);
  }

  /**
   * Drives an initial value toward a target value linearly over a period of time.
   * @param initialValue The initial value.
   * @param targetValue The target value.
   * @param rate The rate at which to drive the value, in the same units as `dt`.
   * @param dt The amount of time over which to drive the value.
   * @param clampStart Whether to clamp the driven value such that it cannot be driven in the opposite direction from
   * the target value. Defaults to `true`.
   * @param clampEnd Whether to clamp the driven value such that it cannot be driven past the target value. Defaults to
   * `true`.
   * @returns The final driven value after the specified amount of time has elapsed.
   */
  public static driveLinear(initialValue: number, targetValue: number, rate: number, dt: number, clampStart = true, clampEnd = true): number {
    if (isNaN(initialValue) || isNaN(targetValue) || isNaN(rate) || isNaN(dt)) {
      return NaN;
    }

    if (rate === 0 || dt === 0 || initialValue === targetValue) {
      return initialValue;
    }

    if (targetValue - initialValue < 0) {
      return MathUtils.clamp(initialValue - rate * dt, clampEnd ? targetValue : -Infinity, clampStart ? initialValue : Infinity);
    } else {
      return MathUtils.clamp(initialValue + rate * dt, clampStart ? initialValue : -Infinity, clampEnd ? targetValue : Infinity);
    }
  }

  /**
   * Drives an initial value toward a target value via an exponential decay curve over a period of time.
   * @param initialValue The initial value.
   * @param targetValue The target value.
   * @param timeConstant The exponential decay time constant, in the same units as `dt`. Must be a positive number.
   * @param dt The amount of time over which to drive the value.
   * @returns The final driven value after the specified amount of time has elapsed.
   */
  public static driveExp(initialValue: number, targetValue: number, timeConstant: number, dt: number): number {
    return targetValue + (initialValue - targetValue) * Math.exp(-dt / timeConstant);
  }
}
