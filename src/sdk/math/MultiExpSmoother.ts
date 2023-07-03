/**
 * Applies time-weighted exponential smoothing (i.e. an exponential moving average) to a sequence of raw values and
 * optionally uses smoothed estimates of velocity and acceleration to adjust the smooth value to compensate for trends
 * in the raw input values.
 *
 * When a new raw value is added to the sequence, it and the last smoothed value, with optional adjustments derived
 * from estimated velocity and acceleration, are weighted according to the time elapsed since the last smoothed value
 * was calculated (i.e. since the last raw value was added) and averaged. The calculation of the weighting is such that
 * the weight of each raw value in the sequence decays exponentially with the "age" (i.e. time elapsed between when
 * that value was added to the sequence and when the latest value was added to the sequence) of the value. Estimates of
 * velocity and acceleration are also smoothed in the same manner.
 */
export class MultiExpSmoother {
  private lastValue: number | null;
  private lastVel: number | null;
  private lastAccel: number | null;

  private lastRawValue: number | null;
  private lastRawVel: number | null;

  /**
   * Creates a new instance of MultiExpSmoother.
   * @param tau This smoother's time constant. The larger the constant, the greater the smoothing effect. A value less
   * than or equal to 0 is equivalent to no smoothing.
   * @param tauVelocity This smoother's time constant for estimated velocity. The larger the constant, the greater the
   * smoothing effect applied to the estimated velocity. A value less than or equal to 0 is equivalent to no smoothing.
   * If not defined, then this smoother will not estimate velocity.
   * @param tauAccel This smoother's time constant for estimated acceleration. The larger the constant, the greater the
   * smoothing effect applied to the estimated acceleration. A value less than or equal to 0 is equivalent to no
   * smoothing. If this value or {@linkcode tauVelocity} is not defined, then this smoother will not estimate
   * acceleration.
   * @param initial The initial smoothed value of the smoother. Defaults to `null`.
   * @param initialVelocity The initial smoothed velocity estimate of the smoother. Ignored if {@linkcode tauVelocity}
   * is not defined. Defaults to `null`.
   * @param initialAccel The initial smoothed acceleration estimate of the smoother. Ignored if {@linkcode tauVelocity}
   * or {@linkcode tauAccel} is not defined. Defaults to `null`.
   * @param dtThreshold The elapsed time threshold, in seconds, above which this smoother will not smooth a new raw
   * value. Defaults to infinity.
   */
  constructor(
    public readonly tau: number,
    public readonly tauVelocity?: number,
    public readonly tauAccel?: number,
    initial: number | null = null,
    initialVelocity: number | null = null,
    initialAccel: number | null = null,
    public readonly dtThreshold = Infinity,
  ) {
    this.lastValue = this.lastRawValue = initial;
    this.lastVel = this.lastRawVel = initialVelocity;
    this.lastAccel = initialAccel;
  }

  /**
   * Gets the last smoothed value.
   * @returns The last smoothed value, or `null` if none exists.
   */
  public last(): number | null {
    return this.lastValue;
  }

  /**
   * Gets the last smoothed velocity.
   * @returns The last smoothed velocity, or `null` if none exists.
   */
  public lastVelocity(): number | null {
    return this.lastVel;
  }

  /**
   * Gets the last smoothed acceleration.
   * @returns The last smoothed acceleration, or `null` if none exists.
   */
  public lastAcceleration(): number | null {
    return this.lastAccel;
  }

  /**
   * Adds a new raw value and gets the next smoothed value. If the new raw value is the first to be added since this
   * smoother was created or reset with no initial smoothed value, the returned smoothed value will be equal to the
   * raw value.
   * @param raw The new raw value.
   * @param dt The elapsed time since the last raw value was added.
   * @returns The next smoothed value.
   */
  public next(raw: number, dt: number): number {
    if (this.tau > 0 && this.lastValue !== null && this.lastRawValue !== null && dt <= this.dtThreshold) {
      const alpha = Math.exp(-dt / this.tau);

      const next = MultiExpSmoother.smooth(
        raw,
        this.lastValue + (this.lastVel === null ? 0 : this.lastVel * dt) + (this.lastAccel === null ? 0 : this.lastAccel * 0.5 * dt * dt),
        alpha
      );

      if (dt !== 0 && this.tauVelocity !== undefined) {
        let nextVelocity: number;

        const velocity = (raw - this.lastRawValue) / dt;

        if (this.tauVelocity > 0 && this.lastVel !== null && this.lastRawVel !== null) {
          const beta = Math.exp(-dt / this.tauVelocity);

          nextVelocity = MultiExpSmoother.smooth(
            velocity,
            this.lastVel + (this.lastAccel === null ? 0 : this.lastAccel * dt),
            beta
          );

          if (this.tauAccel !== undefined) {
            const acceleration = (velocity - this.lastRawVel) / dt;

            if (this.tauAccel > 0 && this.lastAccel !== null) {
              const gamma = Math.exp(-dt / this.tauAccel);

              this.lastAccel = MultiExpSmoother.smooth(
                acceleration,
                this.lastAccel,
                gamma
              );
            } else {
              this.lastAccel = acceleration;
            }
          }
        } else {
          nextVelocity = velocity;
        }

        this.lastRawVel = velocity;
        this.lastVel = nextVelocity;
      }

      this.lastRawValue = raw;
      this.lastValue = next;
      return next;
    } else {
      return this.reset(raw);
    }
  }

  /**
   * Resets the "history" of this smoother and sets the initial smoothed value, velocity, and acceleration to null.
   * @returns The reset smoothed value.
   */
  public reset(): null;
  /**
   * Resets the "history" of this smoother, sets the initial smoothed value, and optionally sets the initial smoothed
   * velocity and acceleration.
   * @param value The new initial smoothed value.
   * @param velocity The new initial smoothed velocity estimate. Defaults to `null`.
   * @param accel The new initial smoothed acceleration estimate. Defaults to `null`.
   * @returns The reset smoothed value.
   */
  public reset<T extends number | null>(value: T, velocity?: number | null, accel?: number | null): T;
  /**
   * Resets the "history" of this smoother and optionally sets the initial smoothed value, velocity, and acceleration.
   * @param value The new initial smoothed value. Defaults to `null`.
   * @param velocity The new initial smoothed velocity estimate. Defaults to `null`.
   * @param accel The new initial smoothed acceleration estimate. Defaults to `null`.
   * @returns The reset smoothed value.
   */
  public reset(value?: number | null, velocity?: number | null, accel?: number | null): number | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public reset(value: number | null = null, velocity: number | null = null, accel: number | null = null): number | null {
    this.lastVel = this.lastRawVel = velocity;
    this.lastAccel = accel;
    return this.lastValue = this.lastRawValue = value;
  }

  /**
   * Forecasts the smoothed value into the future based on the most recently calculated smoothed parameters (value,
   * velocity, and acceleration). If velocity or acceleration has not been calculated (or is not part of this
   * smoother's internal model), each will be treated as zero.
   * @param t The time in the future (relative to the last calculated smoothed value) at which to get the
   * forecasted value.
   * @returns The forecast smoothed value at the specified time, or `null` if a smoothed value has not yet been
   * calculated.
   */
  public forecast(t: number): number | null {
    if (this.lastValue === null) {
      return null;
    } else {
      return this.lastValue + (this.lastVel === null ? 0 : this.lastVel * t) + (this.lastAccel === null ? 0 : this.lastAccel * 0.5 * t * t);
    }
  }

  /**
   * Applies exponential smoothing.
   * @param value The value to smooth.
   * @param last The last smoothed value.
   * @param factor The smoothing factor.
   * @returns A smoothed value.
   */
  private static smooth(value: number, last: number, factor: number): number {
    return value * (1 - factor) + last * factor;
  }
}