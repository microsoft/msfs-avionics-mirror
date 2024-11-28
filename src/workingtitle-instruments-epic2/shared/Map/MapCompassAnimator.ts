import { Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

/** An animator driven by requestAnimationFrame designed for ND elements. */
export class MapCompassAnimator {
  /** The animated value. */
  private readonly _output = Subject.create(0);
  public readonly output = this._output as Subscribable<number>;

  private previousTimestamp = window.performance.now();
  private animationFrameId = 0;
  private targetValue = 0;
  private started = false;
  private subs = [] as (Subscription | undefined)[];

  /** Creates a new NdAnimator.
   * @param speed Higher is faster, but it gets faster fast, try incerements of 0.5.
   * @param isRunning A subscribable boolean to control whether the animator is running.
   * @param inputValue A subscribable number to control the target value with.
   */
  public constructor(
    public readonly speed = 5,
    isRunning: Subscribable<boolean> | undefined = undefined,
    inputValue: Subscribable<number> | undefined = undefined,
  ) {
    this.subs = [
      isRunning?.sub(this.toggle.bind(this), true),
      inputValue?.sub(this.setTargetValue.bind(this), true),
    ];
  }

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
    if (this.started) {
      this.started = false;
      window.cancelAnimationFrame(this.animationFrameId);
    }
  };

  /**
   * Starts or stops the animaton based on a boolean.
   * @param force If true, will start animation if not already running, else will stop animation.
   */
  public readonly toggle = (force: boolean): void => {
    if (force) {
      this.start();
    } else {
      this.stop();
    }
  };

  private readonly update = (timestamp: DOMHighResTimeStamp): void => {
    const deltaTime = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;
    const currentValue = this.output.get();
    const delta = ((this.targetValue - currentValue + 540) % 360) - 180;
    // This makes it so it's not updating every frame after the value has settled
    if (Math.abs(delta) > 0.01) {
      const deltaToApply = Math.min(delta / 5, delta * (this.speed * (deltaTime / 1000)));
      const newValue = currentValue + deltaToApply;
      this._output.set(newValue);
    } else {
      this._output.set(this.targetValue);
    }
    this.animationFrameId = window.requestAnimationFrame(this.update);
  };

  /** Cleans up the component. */
  public destroy(): void {
    this.stop();
    this.subs.forEach(sub => sub?.destroy());
  }
}
