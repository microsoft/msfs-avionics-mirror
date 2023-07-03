/**
 * Options for {@link PidController}.
 */
export type PidOptions = {
  /** kP  */
  kP: number,
  /** kP  */
  kI: number,
  /** kP  */
  kD: number,
  /** maxOut */
  maxOut: number,
  /** minOut */
  minOut: number,
  /** maxI (optional) */
  maxI?: number,
  /** minI (optional) */
  minI?: number
};


/** A PID controller. */
export class PidController {

  /** The previously sampled error. */
  private previousError: number | undefined = undefined;

  /** The previously generated output. */
  private previousOutput: number | undefined = undefined;

  /** The currently accumulated integral. */
  private integral = 0;

  /**
   * Creates a new PidController.
   * @param kP The proportional gain of the controller.
   * @param kI The integral gain of the controller.
   * @param kD The differential gain of the controller.
   * @param maxOut The maximum output of the controller.
   * @param minOut The minumum output of the controller.
   * @param maxI The maximum integral gain.
   * @param minI The minimum integral gain.
   */
  constructor(private kP: number, private kI: number, private kD: number, private maxOut: number, private minOut: number,
    private maxI: number = Number.MAX_SAFE_INTEGER, private minI: number = Number.MIN_SAFE_INTEGER) {
  }

  /**
   * Gets this controller's most recent error input since it was created or reset.
   * @returns This controller's most recent error input since it was created or reset.
   */
  public getPreviousError(): number | undefined {
    return this.previousError;
  }

  /**
   * Gets the output of the PID controller at a given time.
   * @param deltaTime The difference in time between the previous sample and this sample.
   * @param error The amount of error seen between the desired output and the current output.
   * @returns The PID output.
   */
  public getOutput(deltaTime: number, error: number): number {
    const p = this.kP * error;

    if (this.previousError !== undefined && Math.sign(error) === Math.sign(this.previousError)) {
      this.integral += ((error * deltaTime) + ((deltaTime * (error - this.previousError)) / 2)) * this.kI;
      this.integral = PidController.clamp(this.integral, this.maxI, this.minI);
    } else {
      this.integral = 0;
    }

    const i = this.integral;
    const d = deltaTime === 0 ? 0 : this.kD * ((error - (this.previousError ?? error)) / deltaTime);

    const output = PidController.clamp(p + i + d, this.maxOut, this.minOut);
    this.previousError = error;
    this.previousOutput = output;

    return output;
  }

  /** Resets the controller. */
  public reset(): void {
    this.previousError = undefined;
    this.previousOutput = undefined;
    this.integral = 0;
  }

  /**
   * Clamps a number to maximum and minimum values.
   * @param value The value to clamp.
   * @param max The maximum value.
   * @param min The minumum value.
   * @returns The clamped value.
   */
  public static clamp(value: number, max: number, min: number): number {
    return Math.min(Math.max(value, min), max);
  }
}