import { ReadonlyFloat64Array } from '@microsoft/msfs-sdk';
import { WT21MapStyles } from './WT21MapStylesModule';

/**
 * Priorities for map waypoint icons on WT21 maps.
 * Higher numbers are rendered oin top of lower numbers if drawn on same canvas.
 */
export enum WT21MapWaypointIconPriority {
  TopOfDescent = 9999,
  FlightPlan = 999,
  AirportsRunways = 10,
  Bottom = 0,
}

/** Collection of common data used by the map system. */
export class MapSystemCommon {
  public static readonly canvasScale = /*XBOX() ? 0.5 :*/ 1 as number;

  public static readonly labelFontSize = 24 * this.canvasScale as number;
  public static readonly fontOutlineWidth = 1 * this.canvasScale as number;
  public static readonly labelLineHeight = 25 * this.canvasScale as number;

  public static readonly strokeWidth = 2 * this.canvasScale as number;
  public static readonly arrowStrokeWidth = 2 * this.canvasScale as number;
  public static readonly outlineWidth = 1 * this.canvasScale as number;

  public static readonly smallLabelOffsetPx = 11 * this.canvasScale as number;
  public static readonly smallLabelOffset = new Float64Array([this.smallLabelOffsetPx, this.smallLabelOffsetPx]) as ReadonlyFloat64Array;

  public static readonly bigLabelOffsetPx = 18 * this.canvasScale as number;
  public static readonly bigLabelOffset = new Float64Array([this.bigLabelOffsetPx, this.bigLabelOffsetPx]) as ReadonlyFloat64Array;

  public static readonly mapIconSize = 50 * this.canvasScale as number;

  public static readonly mapStyles: WT21MapStyles = {
    canvasScale: MapSystemCommon.canvasScale,
    labelFontSize: MapSystemCommon.labelFontSize,
    fontOutlineWidth: MapSystemCommon.fontOutlineWidth,
    labelLineHeight: MapSystemCommon.labelLineHeight,
    strokeWidth: MapSystemCommon.strokeWidth,
    arrowStrokeWidth: MapSystemCommon.arrowStrokeWidth,
    outlineWidth: MapSystemCommon.outlineWidth,
    smallLabelOffsetPx: MapSystemCommon.smallLabelOffsetPx,
    smallLabelOffset: MapSystemCommon.smallLabelOffset,
    bigLabelOffsetPx: MapSystemCommon.bigLabelOffsetPx,
    bigLabelOffset: MapSystemCommon.bigLabelOffset,
    mapIconSize: MapSystemCommon.mapIconSize,
  };
}
