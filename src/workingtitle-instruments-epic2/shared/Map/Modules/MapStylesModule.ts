import { ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

/** Styles used across a Boeing map. */
export interface MapStyles {
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

  /** The default label anchor. */
  readonly labelAnchor: ReadonlyFloat64Array;

  /** The offset to use labels as a float 64 array.
   * Already scaled with map canvas scale. */
  readonly labelOffset: ReadonlyFloat64Array;

  /** The X offset to use for labels in pixels.
   * Already scaled with map canvas scale. */
  readonly labelOffsetPxX: number;

  /** The Y offset to use for labels in pixels.
   * Already scaled with map canvas scale. */
  readonly labelOffsetPxY: number;

  /** Size of map icons.
   * Already scaled with map canvas scale. */
  readonly mapIconSize: number;
}

/** A module that contains the map styles. */
export class MapStylesModule {
  /**
   * Creates a new MapStylesModule.
   * @param styles The styles.
   */
  public constructor(
    public readonly styles: MapStyles,
  ) { }
}
