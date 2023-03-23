/**
 * A utitlity class for calculating a numerical average of a selected number of samples.
 */
export class SimpleMovingAverage {

  private _values: number[] = [];
  /**
   * Class to return a numerical average from a specified number of inputs.
   * @param samples is the number of samples.
   */
  constructor(private samples: number) { }

  /**
   * Returns a numerical average of the inputs.
   * @param input is the input number.
   * @returns The numerical average.
   */
  public getAverage(input: number): number {
    if (this._values.length === this.samples) {
      this._values.splice(0, 1);
    }
    this._values.push(input);
    let sum = 0;
    this._values.forEach((v) => {
      sum += v;
    });
    return sum / this._values.length;
  }

  /**
   * Resets the average.
   */
  public reset(): void {
    this._values = [];
  }
}