import { DisplayComponent, HorizonProjection, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

/**
 * Parameters describing a roll indicator scale.
 */
export type RollIndicatorScaleParameters = {
  /** The radius of the roll scale, in pixels. */
  radius: number;

  /** Whether the roll arc is rendered. */
  showArc: boolean;

  /**
   * Whether the roll scale is rendered with a ground pointer or a sky pointer. With a ground pointer, the roll scale
   * rotates as the airplane banks to keep the zero-roll reference pointer pointed toward the ground while the roll
   * pointer remains fixed. With a sky pointer, the roll pointer rotates as the airplane banks to keep itself pointed
   * toward the sky while the roll scale remains fixed.
   */
  pointerStyle: 'ground' | 'sky';

  /** The length of the major roll scale ticks, in pixels. */
  majorTickLength: number;

  /** The length of the minor roll scale ticks, in pixels. */
  minorTickLength: number;

  /** The size of the zero-roll reference pointer, as `[width, height]` in pixels. */
  referencePointerSize: ReadonlyFloat64Array;

  /**
   * The offset of the tip of the zero-roll reference pointer from the roll scale, in pixels. Positive values displace
   * the pointer away from the center of the circle circumscribed by the roll scale.
   */
  referencePointerOffset: number;
};

/**
 * A component that is displayed on a PFD roll indicator scale.
 */
export interface RollIndicatorScaleComponent extends DisplayComponent<any> {
  /** Flags this object as a `RollIndicatorScaleComponent`. */
  readonly isRollIndicatorScaleComponent: true;

  /**
   * This method is called when this component's parent roll indicator is attached to its parent horizon component.
   */
  onScaleAttached(): void;

  /**
   * This method is called when this component's parent roll indicator's visibility changes. This method is guaranteed
   * to be called only after `onScaleAttached()` is called. The parent roll indicator is always initially considered to
   * be visible (i.e. if this method is never called, then it is safe to assume the roll indicator is always visible).
   * @param isVisible Whether the parent roll indicator is now visible.
   */
  onScaleVisibilityChanged(isVisible: boolean): void;

  /**
   * This method is called when this component's horizon projection changes.
   * @param projection This component's horizon projection.
   * @param changeFlags The types of changes made to the projection.
   */
  onProjectionChanged(projection: HorizonProjection, changeFlags: number): void;

  /**
   * This method is called once every update cycle.
   * @param time The current time, as a Javascript timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  onUpdated(time: number, elapsed: number): void;

  /**
   * This method is called when this component's parent roll indicator is detached from its parent horizon component.
   */
  onScaleDetached(): void;
}
