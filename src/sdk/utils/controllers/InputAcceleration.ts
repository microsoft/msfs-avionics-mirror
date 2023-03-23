// TODO: move to SDK?

import { MathUtils } from '../../math/MathUtils';


/** An interface the acceleration settings of a knob. */
export interface InputAccelerationSettings {
  /** The default increment value. */
  increment: number;
  /** The big increment value (default is increment*10) */
  bigIncrement: number;
}

/** A class to simulate knob acceleration on value inputs */
export class InputAcceleration {
  private acceleration = 0;
  private isPaused = false;
  private readonly maxAcceleration = 15;
  private readonly accelDampeningPeriod = 50;
  public readonly options: InputAccelerationSettings;

  /**
   * Ctor
   * @param options the knob acceleration settings
   * @param initiallyPaused whether the knob acceleration is initially paused
   */
  constructor(options: Partial<InputAccelerationSettings> = {}, initiallyPaused = false) {
    this.options = Object.assign({
      increment: 1,
      bigIncrement: (options.increment ?? 1) * 10,
    }, options);
    this.isPaused = initiallyPaused;
    if (!initiallyPaused) {
      this.resume();
    }
  }

  /** Updates the acceleration. */
  private update(): void {
    // dampen acceleration
    if (this.acceleration > 0) {
      this.acceleration = MathUtils.clamp(this.acceleration - 1, 0, this.maxAcceleration);
      if (!this.isPaused) {
        setTimeout(() => { this.update(); }, this.accelDampeningPeriod);
      }
    }
  }

  /**
   * Does a step and returns the increment value.
   * @returns the increment value
   */
  public doStep(): number {
    this.acceleration += 2;
    const increment = (this.acceleration > 8 ? this.options.bigIncrement : this.options.increment);
    if (this.acceleration <= 2) {
      this.update();
    }
    return increment;
  }

  /** Pauses the update loop */
  public pause(): void {
    this.isPaused = true;
  }

  /** Resumes the update loop */
  public resume(): void {
    this.isPaused = false;
    this.acceleration = 0;
  }
}