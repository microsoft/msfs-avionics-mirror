import { Subject } from '@microsoft/msfs-sdk';

/**
 * An animator driven by requestAnimationFrame designed for navigation indicators.
 */
export class NavIndicatorAnimator {
  /** The animated value. */
  public readonly output = Subject.create(0);
  private previousTimestamp = window.performance.now();
  private animationFrameId = 0;
  private targetValue = 0;
  private started = false;

  /** Creates a new NavIndicatorAnimator.
   * @param speed Higher is faster, but it gets faster fast, try incerements of 0.5.
   */
  public constructor(public readonly speed = 4) { }

  /** Sets the value that the output will be gradually animated towards.
   * @param value The value to animate towards. If null or undefined, the target value will not change.
   */
  public readonly setTargetValue = (value?: number | null): void => {
    if (value === undefined || value === null) {
      return;
    }
    this.targetValue = value;
  };

  /** Starts the requestAnimationFrame loop. */
  public readonly start = (): void => {
    if (!this.started) {
      this.started = true;
      this.previousTimestamp = window.performance.now();
      this.animationFrameId = window.requestAnimationFrame(this.update);
    }
  };

  /** Stops the requestAnimationFrame loop. */
  public readonly stop = (): void => {
    this.started = false;
    window.cancelAnimationFrame(this.animationFrameId);
  };

  private readonly update = (timestamp: DOMHighResTimeStamp): void => {
    const deltaTime = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;
    const currentValue = this.output.get();
    const delta = ((this.targetValue - currentValue + 540) % 360) - 180;
    // This makes it so it's not updating every frame after the value has settled
    if (Math.abs(delta) > 0.01) {
      const deltaToApply = Math.min(delta / 10, delta * (this.speed * (deltaTime / 1000)));
      const newValue = currentValue + deltaToApply;
      this.output.set(newValue);
    } else {
      this.output.set(this.targetValue);
    }
    this.animationFrameId = window.requestAnimationFrame(this.update);
  };
}
