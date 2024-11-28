import { MathUtils } from '@microsoft/msfs-sdk';

/**
 * A utility class for working with G3000 weight and balance calculations.
 */
export class G3000WeightBalanceUtils {

  /**
   * Gets the minimum moment arm, in inches, of an envelope for a given weight.
   * @param breakpoints The breakpoints defining the envelope's minimum moment arm limits. Each breakpoint should be
   * expressed as `[arm (inches), weight (pounds)]`, and the breakpoints should be ordered such that weight is
   * monotonically increasing. The first breakpoint should be at the envelope's minimum weight, and the last breakpoint
   * should be at the envelope's maximum weight.
   * @param weight The weight, in pounds, for which to get the minimum moment arm.
   * @returns The minimum moment arm, in inches, for the specified weight, or `NaN` if the weight is below the minimum
   * envelope weight or above the maximum envelope weight.
   */
  public static getEnvelopeMinArm(breakpoints: readonly (readonly [number, number])[], weight: number): number {
    return G3000WeightBalanceUtils.getEnvelopeArm(breakpoints, weight, false);
  }

  /**
   * Gets the maximum moment arm, in inches, of an envelope for a given weight.
   * @param breakpoints The breakpoints defining the envelope's maximum moment arm limits. Each breakpoint should be
   * expressed as `[arm (inches), weight (pounds)]`, and the breakpoints should be ordered such that weight is
   * monotonically increasing. The first breakpoint should be at the envelope's minimum weight, and the last breakpoint
   * should be at the envelope's maximum weight.
   * @param weight The weight, in pounds, for which to get the maximum moment arm.
   * @returns The maximum moment arm, in inches, for the specified weight, or `NaN` if the weight is below the minimum
   * envelope weight or above the maximum envelope weight.
   */
  public static getEnvelopeMaxArm(breakpoints: readonly (readonly [number, number])[], weight: number): number {
    return G3000WeightBalanceUtils.getEnvelopeArm(breakpoints, weight, true);
  }

  /**
   * Gets the minimum or maximum moment arm, in inches, of an envelope for a given weight.
   * @param breakpoints The breakpoints defining the envelope's maximum moment arm limits. Each breakpoint should be
   * expressed as `[arm (inches), weight (pounds)]`, and the breakpoints should be ordered such that weight is
   * monotonically increasing. The first breakpoint should be at the envelope's minimum weight, and the last breakpoint
   * should be at the envelope's maximum weight.
   * @param weight The weight, in pounds, for which to get the minimum or maximum moment arm.
   * @param isMax `true` to return the maximum moment arm; `false` to return the minimum moment arm.
   * @returns The minimum or maximum moment arm, in inches, for the specified weight, or `NaN` if the weight is below
   * the minimum envelope weight or above the maximum envelope weight.
   */
  private static getEnvelopeArm(breakpoints: readonly (readonly [number, number])[], weight: number, isMax: boolean): number {
    for (let i = 0; i < breakpoints.length; i++) {
      const [currentArm, currentWeight] = breakpoints[i];

      if (weight < currentWeight) {
        if (i === 0) {
          // Query weight is less than the minimum envelope weight.
          return NaN;
        } else {
          // Query weight is between the weight of the current breakpoint and the weight of the previous breakpoint.
          const [prevArm, prevWeight] = breakpoints[i - 1];
          return MathUtils.lerp(weight, prevWeight, currentWeight, prevArm, currentArm);
        }
      } else if (weight === currentWeight) {
        // Query weight is equal to the current breakpoint. Because multiple breakpoints at the same weight are
        // allowed, we must find all breakpoints with weight equal to the query weight and retrieve the minimum or
        // maximum arm among these breakpoints. Because breakpoints are ordered by weight and we are iterating through
        // them in the forward direction, we are guaranteed that any additional breakpoints of equal weight (if they
        // exist) follow the current breakpoint consecutively.
        let result = currentArm;
        const selectFunc = isMax ? Math.max : Math.min;
        for (let j = i + 1; j < breakpoints.length; j++) {
          const [nextArm, nextWeight] = breakpoints[j];
          if (weight === nextWeight) {
            result = selectFunc(result, nextArm);
          } else {
            break;
          }
        }
        return result;
      }
    }

    // Query weight is greater than the maximum envelope weight.
    return NaN;
  }
}
