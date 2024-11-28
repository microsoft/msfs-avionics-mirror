import { ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

import { MapStyles } from './Modules/MapStylesModule';

/** Collection of common data used by the map system. */
export class MapSystemCommon {
  public static readonly labelFontSize = 20 as number;
  public static readonly fontOutlineWidth = 0.5 as number;
  public static readonly labelLineHeight = 25 as number;

  public static readonly strokeWidth = 3 as number;
  public static readonly arrowStrokeWidth = 3 as number;
  public static readonly outlineWidth = 0.5 as number;

  public static readonly labelAnchorTopLeft = new Float64Array([1, 1]) as ReadonlyFloat64Array;
  public static readonly labelAnchorBottomLeft = new Float64Array([1, -1]) as ReadonlyFloat64Array;
  public static readonly labelAnchorTopRight = new Float64Array([0, 1]) as ReadonlyFloat64Array;
  public static readonly labelAnchorBottomRight = new Float64Array([0, -1]) as ReadonlyFloat64Array;

  public static readonly labelAnchor = this.labelAnchorTopRight;

  public static readonly labelOffsetPxX = 10 as number;
  public static readonly labelOffsetPxY = 4 as number;
  public static readonly labelOffset = new Float64Array([this.labelOffsetPxX, -this.labelOffsetPxY]) as ReadonlyFloat64Array;

  public static readonly labelOffsetAnchorTopLeft = new Float64Array([-this.labelOffsetPxX, -this.labelOffsetPxY]) as ReadonlyFloat64Array;
  public static readonly labelOffsetBottomRight = new Float64Array([this.labelOffsetPxX, -8]) as ReadonlyFloat64Array;
  public static readonly labelOffsetBottomLeft = new Float64Array([-this.labelOffsetPxX, -8]) as ReadonlyFloat64Array;

  public static readonly mapIconSize = 25 as number;

  public static readonly mapStyles: MapStyles = {
    labelFontSize: MapSystemCommon.labelFontSize,
    fontOutlineWidth: MapSystemCommon.fontOutlineWidth,
    labelLineHeight: MapSystemCommon.labelLineHeight,
    strokeWidth: MapSystemCommon.strokeWidth,
    arrowStrokeWidth: MapSystemCommon.arrowStrokeWidth,
    outlineWidth: MapSystemCommon.outlineWidth,
    labelAnchor: MapSystemCommon.labelAnchor,
    labelOffset: MapSystemCommon.labelOffset,
    labelOffsetPxX: MapSystemCommon.labelOffsetPxX,
    labelOffsetPxY: MapSystemCommon.labelOffsetPxY,
    mapIconSize: MapSystemCommon.mapIconSize,
  };

  public static readonly mapCompassMaskHeight = 340;
  public static readonly hsiCompassMaskHeight = 170;

  public static readonly rangeTickWidth = 20;

  public static readonly minimapHeightUnscaled = 505;

  public static readonly northUpCompassRadius = 238;
  public static readonly hdgTrkUpCompassRadius = MapSystemCommon.northUpCompassRadius;
  public static readonly hsiCompassRadius = 228;
  public static readonly hdgTrkUpOffsetY = 184;
  public static readonly hsiOffsetY = 100;

  public static readonly hsiMapWidth = 500;
  // Keep in sync with Map.css
  public static readonly hsiMapHeight = 334;
}
