import { ExpSmoother } from './ExpSmoother';

/**
 * A calculator for lookahead values based on past trends. The calculator accepts a series of input values separated
 * by discrete time intervals, computes a rate of change at each time step, and uses this rate of change to predict
 * what the input value will be at some arbitrary length of time in the future assuming the rate of change remains
 * constant.
 */
export class Lookahead {
  private readonly valueSmoother: ExpSmoother;
  private readonly trendSmoother: ExpSmoother;

  private lastSmoothedValue: number | null = null;
  private lastTrendValue = 0;
  private lastLookaheadValue: number | null = null;
  private lastSmoothedLookaheadValue: number | null = null;

  /**
   * Constructor.
   * @param lookahead This calculator's lookahead time.
   * @param valueSmoothingTau The smoothing time constant to apply to the calculator's input values before rate of
   * change is computed. A value of `0` is equivalent to no smoothing. Defaults to `0`.
   * @param trendSmoothingTau The smoothing time constant to apply to the calculator's computed trend values. A value
   * of `0` is equivalent to no smoothing. Defaults to `0`.
   */
  public constructor(public lookahead: number, valueSmoothingTau = 0, trendSmoothingTau = 0) {
    this.valueSmoother = new ExpSmoother(valueSmoothingTau);
    this.trendSmoother = new ExpSmoother(trendSmoothingTau);
  }

  /**
   * Gets this calculator's last computed lookahead value. The lookahead value is the predicted value of this
   * calculator's input when projected into the future by an amount equal to the lookahead time assuming the current
   * rate of change of the input remains constant.
   * @param smoothed Whether to retrieve the lookahead value computed using the last smoothed input value instead of
   * the raw input value as the present (`t = 0`) value. Defaults to `false`.
   * @returns This calculator's last computed lookahead value.
   */
  public last(smoothed = false): number | null {
    return smoothed ? this.lastSmoothedLookaheadValue : this.lastLookaheadValue;
  }

  /**
   * Gets this calculator's last computed trend value. The trend value is the equal to the rate of change of this
   * calculator's input values multiplied by the lookahead time.
   * @returns This calculator's last computed trend value.
   */
  public lastTrend(): number {
    return this.lastTrendValue;
  }

  /**
   * Adds a new input value and gets the next lookahead value. The lookahead value is the predicted value of this
   * calculator's input when projected into the future by an amount equal to the lookahead time assuming the current
   * rate of change of the input remains constant.
   * @param value The new input value.
   * @param dt The elapsed time since the last input value was added.
   * @param smoothed Whether to return the lookahead value computed using the smoothed input value instead of the raw
   * input value as the present (`t = 0`) value. Note that this argument does not determine whether smoothing is
   * applied for the purposes of calculating rate of change (smoothing is always applied for this purpose if a positive
   * time constant is defined). Defaults to `false`.
   * @returns The next lookahead value.
   */
  public next(value: number, dt: number, smoothed = false): number {
    const oldSmoothedValue = this.lastSmoothedValue;

    let trend: number;

    if (dt < 0) {
      return this.reset(value);
    } else if (dt > 0) {
      this.lastSmoothedValue = this.valueSmoother.next(value, dt);

      if (oldSmoothedValue === null) {
        this.trendSmoother.reset();
        trend = 0;
      } else {
        trend = this.trendSmoother.next((this.lastSmoothedValue - oldSmoothedValue) / dt * this.lookahead, dt);
      }
    } else {
      trend = this.lastTrendValue;
      this.lastSmoothedValue = this.valueSmoother.next(value, dt);
    }

    this.lastTrendValue = trend;
    this.lastLookaheadValue = value + trend;
    this.lastSmoothedLookaheadValue = this.lastSmoothedValue + trend;

    return smoothed ? this.lastSmoothedLookaheadValue : this.lastLookaheadValue;
  }

  /**
   * Adds a new input value and gets the next trend value. The trend value is the equal to the rate of change of this
   * calculator's input values multiplied by the lookahead time.
   * @param value The new input value.
   * @param dt The elapsed time since the last input value was added.
   * @returns The next trend value.
   */
  public nextTrend(value: number, dt: number): number {
    this.next(value, dt);
    return this.lastTrendValue;
  }

  /**
   * Resets the "history" of this calculator and sets the initial input value to null.
   */
  public reset(): null;
  /**
   * Resets the "history" of this calculator and sets the initial input value.
   * @param value The new initial input value.
   * @returns The reset lookahead value, which will be equal to the initial input value.
   */
  public reset<T extends number | null>(value: T): T;
  /**
   * Resets the "history" of this calculator and optionally sets the initial input value.
   * @param value The new initial input value. Defaults to null.
   * @returns The reset lookahead value, which will be equal to the initial input value.
   */
  public reset(value?: number | null): number | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public reset(value?: number | null): number | null {
    this.lastSmoothedValue = this.valueSmoother.reset(value);
    this.trendSmoother.reset();
    this.lastTrendValue = 0;
    this.lastLookaheadValue = this.lastSmoothedValue;
    this.lastSmoothedLookaheadValue = this.lastSmoothedValue;

    return this.lastLookaheadValue;
  }
}