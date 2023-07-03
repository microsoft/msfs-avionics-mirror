/**
 * A definition of an area in which certain horizon display elements should be occluded.
 */
export interface HorizonOcclusionArea {
  /**
   * Paths this occlusion area to a canvas rendering context.
   * @param context A canvas rendering context.
   */
  path(context: CanvasRenderingContext2D): void;
}