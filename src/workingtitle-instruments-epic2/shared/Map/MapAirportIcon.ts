import { AbstractMapWaypointIcon, AbstractMapWaypointIconOptions, AirportRunway, FacilityILSFrequency, GeoPoint, MapProjection, NavMath, ReadonlyFloat64Array, Subscribable, UnitType } from '@microsoft/msfs-sdk';
import { AirportSize, AirportWaypoint } from './AirportWaypoint';
import { Epic2Colors } from '../Misc';

/**
 * A icon for airports on the Epic2.
 * With support for showing a different icons and localizer beams based on the map range setting.
 */
export class MapAirportIcon<T extends AirportWaypoint> extends AbstractMapWaypointIcon<T> {
  private static readonly airportMaxRange = new Map<AirportSize, number>([
    [AirportSize.Small, 5],
    [AirportSize.Medium, 50],
    [AirportSize.Large, 50],
  ]);

  private readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2)];
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];

  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param img This icon's image.
   * @param dot_img This icon's image for the dot.
   * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
   * @param currentRange The current range setting of the map.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    waypoint: T,
    priority: number | Subscribable<number>,
    protected readonly img: HTMLImageElement,
    protected readonly dot_img: HTMLImageElement,
    size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    protected readonly currentRange: Subscribable<number>,
    options?: AbstractMapWaypointIconOptions
  ) {
    super(waypoint, priority, size, options);
  }

  /** @inheritdoc */
  protected drawIconAt(context: CanvasRenderingContext2D, mapProjection: MapProjection, left: number, top: number): void {
    const size = this.size.get();
    const currentRange = this.currentRange.get();
    const maxRange = MapAirportIcon.airportMaxRange.get(this.waypoint.size)!;

    if (this.waypoint.size === AirportSize.Small || currentRange > 25) {
      this.drawIconBasedOnRange(context, left, top, size, currentRange, maxRange);
    } else {
      const runways = this.waypoint.facility.get().runways;

      for (let i = 0; i < runways.length; i++) {
        const runway = runways[i];
        if (runway === null || runway.length === 0) {
          continue;
        }

        // draw the runway
        this.drawRunway(runway, mapProjection, context);

        // draw localizer beams
        // Not sure if beams should be drawn at AMM ranges, but it seems reasonable to cut off below 4nm
        if (this.currentRange.get() >= 4) {
          if (runway.primaryILSFrequency.freqBCD16 !== 0) {
            this.drawLocalizerBeam(runway, runway.primaryILSFrequency, mapProjection, context);
          }

          if (runway.secondaryILSFrequency.freqBCD16 !== 0) {
            this.drawLocalizerBeam(runway, runway.secondaryILSFrequency, mapProjection, context);
          }
        }
      }
    }
  }

  /**
   * Draws an airport image icon based on the current range.
   * @param context The canvas rendering context.
   * @param left The left position of the icon.
   * @param top The top position of the icon.
   * @param size The size of the icon.
   * @param currentRange The current range setting of the map.
   * @param maxRange The maximum range of the icon.
   */
  private drawIconBasedOnRange(context: CanvasRenderingContext2D, left: number, top: number, size: ReadonlyFloat64Array, currentRange: number, maxRange: number): void {
    if (currentRange <= maxRange) {
      context.drawImage(this.img, left, top, size[0], size[1]);
    } else {
      context.drawImage(this.dot_img, left, top, size[0], size[1]);
    }
  }

  /**
   * Draws a runway.
   * @param runway The runway to draw.
   * @param mapProjection The map projection.
   * @param context The canvas rendering context.
   */
  private drawRunway(runway: AirportRunway, mapProjection: MapProjection, context: CanvasRenderingContext2D): void {
    const rwyCenterGeoPos = this.geoPointCache[0].set(runway.latitude, runway.longitude);
    mapProjection.project(rwyCenterGeoPos, this.vec2Cache[0]);

    const forwardLength = UnitType.METER.convertTo(runway.length - runway.primaryThresholdLength, UnitType.GA_RADIAN);
    const backwardLength = UnitType.METER.convertTo(runway.length - runway.secondaryThresholdLength, UnitType.GA_RADIAN);

    const forwardBound = rwyCenterGeoPos.offset(NavMath.normalizeHeading(runway.direction), forwardLength / 2, this.geoPointCache[1]);
    const backwardBound = rwyCenterGeoPos.offset(NavMath.reciprocateHeading(runway.direction), backwardLength / 2, this.geoPointCache[2]);

    const rwyStartPoint = mapProjection.project(forwardBound, this.vec2Cache[1]);
    const rwyEndPoint = mapProjection.project(backwardBound, this.vec2Cache[2]);

    context.beginPath();
    context.moveTo(rwyStartPoint[0], rwyStartPoint[1]);
    context.lineTo(rwyEndPoint[0], rwyEndPoint[1]);
    context.strokeStyle = Epic2Colors.lightCyan;
    context.lineWidth = this.currentRange.get() > 2 ? 2 : 5;
    context.stroke();
  }

  /**
   * Draws a localizer beam for a runway.
   * @param runway The runway.
   * @param ilsFreq The localizer frequency object.
   * @param mapProjection The map projection.
   * @param context The canvas rendering context.
   */
  private drawLocalizerBeam(runway: AirportRunway, ilsFreq: FacilityILSFrequency, mapProjection: MapProjection, context: CanvasRenderingContext2D): void {
    const rwyCenterGeoPos = this.geoPointCache[0].set(runway.latitude, runway.longitude);

    const beamRangeRad = UnitType.NMILE.convertTo(4, UnitType.GA_RADIAN);
    const negRad = UnitType.NMILE.convertTo(0.2, UnitType.GA_RADIAN);

    const inverseLocCourse = NavMath.normalizeHeading(ilsFreq.localizerCourse + ilsFreq.magvar + 180);
    const halfRwyLength = UnitType.METER.convertTo((runway.length / 2) - 800, UnitType.GA_RADIAN);
    const beamStartGeoPos = rwyCenterGeoPos.offset(inverseLocCourse, halfRwyLength, this.geoPointCache[1]);
    const edge1GeoPos = rwyCenterGeoPos.offset(inverseLocCourse - 2, beamRangeRad, this.geoPointCache[2]);
    const edge2GeoPos = rwyCenterGeoPos.offset(inverseLocCourse, beamRangeRad - negRad, this.geoPointCache[3]);
    const edge3GeoPos = rwyCenterGeoPos.offset(inverseLocCourse + 2, beamRangeRad, this.geoPointCache[4]);
    const beamStart = mapProjection.project(beamStartGeoPos, this.vec2Cache[0]);
    const edge1 = mapProjection.project(edge1GeoPos, this.vec2Cache[1]);
    const edge2 = mapProjection.project(edge2GeoPos, this.vec2Cache[2]);
    const edge3 = mapProjection.project(edge3GeoPos, this.vec2Cache[3]);

    context.beginPath();
    context.moveTo(beamStart[0], beamStart[1]);
    context.lineTo(edge1[0], edge1[1]);
    context.lineTo(edge2[0], edge2[1]);
    context.closePath();
    context.fillStyle = Epic2Colors.white;
    context.fill();

    context.beginPath();
    context.moveTo(beamStart[0], beamStart[1]);
    context.lineTo(edge3[0], edge3[1]);
    context.lineTo(edge2[0], edge2[1]);
    context.closePath();
    context.strokeStyle = Epic2Colors.white;
    context.lineWidth = 2;
    context.stroke();
  }
}
