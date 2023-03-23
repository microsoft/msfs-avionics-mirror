import { Animator, Easing, NavMath } from '@microsoft/msfs-sdk';

/**
 * An animator for HSI needle rotations.
 */
export class NeedleAnimator {
  private static readonly easeInOut = Easing.withEndpointParams(Easing.bezier(0.5, 0.1, 0, 1, true));
  private static readonly easeOut = Easing.withEndpointParams(Easing.bezier(0.5, 0.5, 0, 1, true));

  /** The minimum change in rotation, in degrees, required to trigger an animation. */
  private readonly animationThreshold = this.turnRate * (1 / 15);

  private readonly animator = new Animator();

  /** This animator's current rotation, in degrees. */
  public readonly rotation = this.animator.value;

  /**
   * Constructor.
   * @param turnRate The turn rate, in degrees per second, used by this animator.
   */
  public constructor(private readonly turnRate: number) {
  }

  /**
   * Animates a rotation. This animator's rotation will be animated to rotate toward a target rotation with easing at
   * the start and end. If another animation is currently active, it will be immediately stopped and replaced by the
   * new animation, and the ease in will be skipped.
   * @param target The target rotation, in degrees.
   */
  public animateRotation(target: number): void {
    const currentRotation = NavMath.normalizeHeading(this.animator.value.get());
    const diff = Math.abs(NavMath.diffAngle(currentRotation, target));

    if (diff >= this.animationThreshold) {
      // Make sure the current rotation is normalized before starting the animation.
      this.setRotation(currentRotation);

      const sign = NavMath.getTurnDirection(currentRotation, target) === 'left' ? -1 : 1;

      this.animator.start(
        currentRotation + diff * sign,
        diff / this.turnRate * 1000,
        this.animator.isAnimating() ? NeedleAnimator.easeOut : NeedleAnimator.easeInOut
      );
    } else {
      this.setRotation(target);
    }
  }

  /**
   * Immediately sets this animator's rotation to a given value and cancels any animation in progress.
   * @param rotation The rotation to set, in degrees.
   */
  public setRotation(rotation: number): void {
    this.animator.set(NavMath.normalizeHeading(rotation));
  }

  /**
   * Stops the current animation in progress, if any, and optionally sets this animator's rotation to the animation
   * target.
   * @param setAnimationTarget Whether to set this animator's rotation to the animation target. Defaults to `false`.
   */
  public stopAnimation(setAnimationTarget = false): void {
    this.animator.stop(setAnimationTarget);
  }
}