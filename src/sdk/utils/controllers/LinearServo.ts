/** A class that linearly drives a SimVar value towards a given set point. */
export class LinearServo {

  /** The current time. */
  private currentTime?: number;

  /**
   * Creates an instance of a LinearServo.
   * @param rate The default rate to drive this servo, in units per second.
   */
  constructor(public rate: number) { }

  /**
   * Drives this servo towards the set point.
   * @param currentValue The current value.
   * @param setValue The value to drive towards.
   * @param time The current timestamp, in milliseconds. Defaults to the current operating system time, as a Javascript
   * timestamp.
   * @param rate The rate to use to drive this servo, in units per second. Defaults to this servo's default rate.
   * @returns The output value.
   */
  public drive(currentValue: number, setValue: number, time = Date.now(), rate = this.rate): number {
    if (this.currentTime === undefined) {
      this.currentTime = time;
      return currentValue;
    }

    const currentTime = time;
    const deltaTime = currentTime - this.currentTime;
    this.currentTime = currentTime;

    const deltaValue = setValue - currentValue;

    const maximumDrive = rate * (deltaTime / 1000);
    const output = Math.abs(deltaValue) > maximumDrive
      ? currentValue + (Math.sign(deltaValue) * maximumDrive)
      : setValue;

    return output;
  }

  /**
   * Resets the servo to initial state
   */
  public reset(): void {
    this.currentTime = undefined;
  }
}