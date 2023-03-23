import { ExpSmoother } from '../../math';
import { PidController } from '../../utils/controllers';

/**
 * A bank angle controller that maintains a constant radius turn.
 */
export class ArcTurnController {
  private readonly bankController = new PidController(1.5, 0, 0, 15, -15);

  private readonly precessionController = new PidController(0.025, 0, 0, 300, -300);

  private previousTime?: number;

  private previousRadiusError?: number;

  private readonly filter = new ExpSmoother(500);

  /**
   * Gets the bank angle output for a given radius error.
   * @param radiusError The radius error.
   * @returns The bank angle output.
   */
  public getOutput(radiusError: number): number {
    const currentTime = (new Date() as any).appTime();

    let bankAngle = 0;
    if (this.previousRadiusError !== undefined && this.previousTime !== undefined) {
      const dTime = currentTime - this.previousTime;
      const input = ((radiusError - this.previousRadiusError) / dTime) * 1000;
      const precessionRate = isNaN(this.filter.last() ?? NaN)
        ? this.filter.reset(input)
        : this.filter.next(input, dTime);

      const targetPrecessionRate = -this.precessionController.getOutput(dTime, radiusError);
      const precessionError = targetPrecessionRate - precessionRate;

      bankAngle = this.bankController.getOutput(dTime, precessionError);
    }

    this.previousTime = currentTime;
    this.previousRadiusError = radiusError;

    return -bankAngle;
  }

  /**
   * Resets the controller.
   */
  public reset(): void {
    this.previousTime = undefined;
    this.previousRadiusError = undefined;

    this.precessionController.reset();
    this.bankController.reset();
    this.filter.reset();
  }
}