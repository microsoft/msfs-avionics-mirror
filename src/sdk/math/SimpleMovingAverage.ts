/**
 * A utitlity class for calculating a numerical average of a selected number of samples.
 */
export class SimpleMovingAverage {

  private _values: number[] = [];
  private _lastAverage = 0;
  /**
   * Class to return a numerical average from a specified number of inputs.
   * @param samples is the number of samples.
   */
  constructor(private samples: number) { }

  /**
   * Returns a numerical average of the inputs.
   * @param newestValue is the input number.
   * @returns The numerical average.
   */
  public getAverage(newestValue: number): number {
    if (this._values.length === 0) {
      this._values = Array(this.samples).fill(newestValue);
      this._lastAverage = newestValue;
    }
    const oldestValue = this._values.splice(0, 1)[0];
    this._values.push(newestValue);
    this._lastAverage += ((newestValue - oldestValue) / this._values.length);
    return this._lastAverage;
  }

  /**
   * Resets the average.
   */
  public reset(): void {
    this._values = [];
  }
}
