import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { Easing } from './Easing';

/**
 * An easing function used by {@link Animator}.
 */
export type AnimatorEasingFunc = (start: number, stop: number, progress: number) => number;

/**
 * An animator.
 */
export class Animator {
  private static readonly DEFAULT_EASE_FUNC = Easing.withEndpointParams(Easing.linear());

  private readonly _value = Subject.create(0);
  // eslint-disable-next-line jsdoc/require-returns
  /** This animator's current value. */
  public get value(): Subscribable<number> {
    return this._value;
  }

  private _isAnimating = false;

  private isAnimationLoopActive = false;
  private animationEaseFunc = Animator.DEFAULT_EASE_FUNC;
  private animationStart = 0;
  private animationStop = 0;
  private animationStartTime = 0;
  private animationDuration = 0;

  /**
   * Checks whether this animator has an animation in progress.
   * @returns Whether this animator has an animation in progress.
   */
  public isAnimating(): boolean {
    return this._isAnimating;
  }

  /**
   * Starts an animation. The animation will proceed from this animator's current value to the target value over the
   * specified duration. If another animation is currently active, it will immediately be stopped and replaced by the
   * new animation.
   * @param target The target value.
   * @param duration The duration of the animation, in milliseconds.
   * @param easeFunc The easing function to apply to the animation. Defaults to a linear easing function.
   */
  public start(target: number, duration: number, easeFunc?: AnimatorEasingFunc): void {
    if (duration <= 0) {
      this.set(target);
      return;
    }

    this._isAnimating = true;
    this.animationStart = this._value.get();
    this.animationStop = target;
    this.animationStartTime = Date.now();
    this.animationDuration = duration;
    this.animationEaseFunc = easeFunc ?? Animator.DEFAULT_EASE_FUNC;

    if (!this.isAnimationLoopActive) {
      this.isAnimationLoopActive = true;
      requestAnimationFrame(this.animationLoop);
    }
  }

  private readonly animationLoop = (): void => {
    if (!this._isAnimating) {
      this.isAnimationLoopActive = false;
      return;
    }

    const progress = (Date.now() - this.animationStartTime) / this.animationDuration;

    if (progress < 1) {
      this._value.set(this.animationEaseFunc(this.animationStart, this.animationStop, progress));

      requestAnimationFrame(this.animationLoop);
    } else {
      this._isAnimating = false;
      this.isAnimationLoopActive = false;
      this._value.set(this.animationStop);
    }
  };

  /**
   * Immediately sets this animator's value. This will stop any animation currently in progress.
   * @param value The rotation to set, in degrees.
   */
  public set(value: number): void {
    this._isAnimating = false;
    this._value.set(value);
  }

  /**
   * Stops this animator's current in-progress animation, if any, and optionally sets this animator's value to the
   * animation's target value.
   * @param setAnimationTarget Whether to set this animator's value to the animation target value after stopping the
   * animation. Defaults to `false`.
   */
  public stop(setAnimationTarget = false): void {
    if (!this._isAnimating) {
      return;
    }

    this._isAnimating = false;

    if (setAnimationTarget) {
      this._value.set(this.animationStop);
    }
  }
}