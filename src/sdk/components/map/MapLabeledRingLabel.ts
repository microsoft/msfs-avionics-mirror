import { ReadonlyFloat64Array } from '../../math/VecMath';
import { DisplayComponent } from '../FSComponent';

/**
 * Valid content types for map ring labels.
 */
export type MapLabeledRingLabelContent = string | number | HTMLElement | DisplayComponent<any> | SVGElement;

/**
 * A map ring label.
 */
export interface MapLabeledRingLabel<T extends MapLabeledRingLabelContent> {
  /** The content of this label. */
  readonly content: T;

  /**
   * Gets this label's anchor point. The anchor point is expressed relative to the label's width and height, such that
   * (0, 0) is located at the top-left corner and (1, 1) is located at the bottom-right corner.
   * @returns this label's anchor point.
   */
  getAnchor(): ReadonlyFloat64Array;

  /**
   * Gets the angle of the radial on which this label is positioned, in radians. Radial 0 is in the positive x
   * direction.
   * @returns the angle of the radial on which this label is positioned.
   */
  getRadialAngle(): number;

  /**
   * Gets the radial offset of this label from its parent ring, in pixels. Positive values denote displacement away
   * from the center of the ring.
   * @returns the radial offset of this label from its parent ring, in pixels.
   */
  getRadialOffset(): number;

  /**
   * Sets this label's anchor point. The anchor point is expressed relative to the label's width and height, such that
   * (0, 0) is located at the top-left corner and (1, 1) is located at the bottom-right corner.
   * @param anchor The new anchor point.
   */
  setAnchor(anchor: ReadonlyFloat64Array): void;

  /**
   * Sets the angle of the radial on which this label is positioned, in radians. Radial 0 is in the positive x
   * direction.
   * @param angle The new radial angle.
   */
  setRadialAngle(angle: number): void;

  /**
   * Sets the radial offset of this label from its parent ring, in pixels. Positive values denote displacement away
   * from the center of the ring.
   * @param offset The new radial offset.
   */
  setRadialOffset(offset: number): void;
}