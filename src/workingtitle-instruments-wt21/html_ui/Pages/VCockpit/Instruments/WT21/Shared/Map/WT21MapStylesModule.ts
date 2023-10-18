import { ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

/** Styles used across a WT21 map. */
export interface WT21MapStyles {
  /** Should really only be 1 or 0.5. */
  readonly canvasScale: number;

  /** The default label font size in pixels.
   * Already scaled with map canvas scale. */
  readonly labelFontSize: number;
  /** The default font outline width in pixels.
   * Already scaled with map canvas scale. */
  readonly fontOutlineWidth: number;
  /** The number of pixels to vertically offset labels from eachother by.
   * Already scaled with map canvas scale. */
  readonly labelLineHeight: number;

  /** The default stroke width in pixels.
   * Already scaled with map canvas scale. */
  readonly strokeWidth: number;
  /** The default stroke width for svg arrows in pixels.
   * Already scaled with map canvas scale. */
  readonly arrowStrokeWidth: number;
  /** The default outline width in pixels.
   * Already scaled with map canvas scale. */
  readonly outlineWidth: number;

  /** The offset to use for small offset labels in pixels.
   * Already scaled with map canvas scale. */
  readonly smallLabelOffsetPx: number;
  /** The offset to use for small offset labels as a float 64 array.
   * Already scaled with map canvas scale. */
  readonly smallLabelOffset: ReadonlyFloat64Array;

  /** The offset to use for big offset labels in pixels.
   * Already scaled with map canvas scale. */
  readonly bigLabelOffsetPx: number;
  /** The offset to use for big offset labels as a float 64 array.
   * Already scaled with map canvas scale. */
  readonly bigLabelOffset: ReadonlyFloat64Array;

  /** Size of map icons.
   * Already scaled with map canvas scale. */
  readonly mapIconSize: number;
}

/** A module that contains the map styles. */
export class WT21MapStylesModule {
  /**
   * Creates a new WT21MapStylesModule.
   * @param styles The styles.
   */
  public constructor(
    public readonly styles: WT21MapStyles,
  ) { }
}
