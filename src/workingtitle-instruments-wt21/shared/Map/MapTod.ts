import {
  AbstractMapWaypointIcon, AbstractMapWaypointIconOptions, BasicFacilityWaypoint, ClippedPathStream, EventBus, Facility, GeoPoint, ImageCache,
  MapCullableLocationTextLabel, MapCullableTextLabel, MapProjection, MapWaypointIcon, MapWaypointImageIcon, MapWaypointRendererIconFactory,
  MapWaypointRendererLabelFactory, ReadonlyFloat64Array, UnitType, Vec2Math, VNavWaypoint, Waypoint
} from '@microsoft/msfs-sdk';

import { WT21FixInfoWaypoint } from '../Systems/FixInfo/WT21FixInfoData';
import { WT21_PFD_MFD_Colors } from '../WT21_Colors';
import { WT21MapWaypointIconPriority } from './MapSystemCommon';
import { WT21MapStyles } from './WT21MapStylesModule';

/**
 * A waypoint icon factory for VNAV waypoints.
 */
export class MapTodIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  private static readonly ICON_SIZE = Vec2Math.create(24, 24);

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    return new MapTodIcon(
      waypoint as any, WT21MapWaypointIconPriority.TopOfDescent, MapTodIconFactory.ICON_SIZE,
      { offset: new Float64Array([0, 0.5]) }
    ) as unknown as MapWaypointIcon<T>;
  }
}

/**
 * A waypoint label factory for VNAV waypoints.
 */
export class MapTodLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {

  /** @inheritdoc */
  public getLabel(role: number, waypoint: Waypoint): MapCullableTextLabel {
    return new MapCullableLocationTextLabel('TOD', WT21MapWaypointIconPriority.TopOfDescent, waypoint.location, true, { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.green, font: 'WT21', anchor: new Float64Array([-0.35, 0.4]), offset: new Float64Array([5, 0]) });
  }
}

/**
 * A waypoint label factory for VNAV waypoints.
 */
export class MapDesAdvisoryLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {

  /** @inheritdoc */
  public getLabel(role: number, waypoint: Waypoint): MapCullableTextLabel {
    return new MapCullableLocationTextLabel('DES', WT21MapWaypointIconPriority.TopOfDescent, waypoint.location, true, { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.green, font: 'WT21', anchor: new Float64Array([-0.35, 0.4]), offset: new Float64Array([5, 0]) });
  }
}

/**
 * A VNAV waypoint icon.
 */
export class MapTodIcon extends MapWaypointImageIcon<VNavWaypoint> {
  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param size The size of this icon, as `[width, height]` in pixels.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    waypoint: VNavWaypoint,
    priority: number,
    size: ReadonlyFloat64Array,
    options?: AbstractMapWaypointIconOptions
  ) {
    super(waypoint, priority, ImageCache.get('TOD'), size, options);
  }
}

/** A waypoint icon factory for fix info waypoints. */
export class MapFixInfoIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  /**
   * Creates a new MapTocLabelFactory.
   * @param mapStyles The map styles.
   * @param clipPathStream The clip path stream.
   */
  public constructor(private readonly mapStyles: WT21MapStyles, private readonly clipPathStream: ClippedPathStream) { }

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    return new MapFixInfoWaypointIcon(waypoint, this.mapStyles, this.clipPathStream) as unknown as MapWaypointIcon<T>;
  }
}

/**
 * Initialization options for a MapFixInfoWaypointIcon.
 */
export type MapFixInfoWaypointIconOptions = {
  /** The width of the stroke for the ring, in pixels. */
  strokeWidth: number;

  /** The color of the stroke for the ring. */
  strokeColor: string;

  /** The width of the outline for the ring, in pixels. */
  outlineWidth: number;

  /** The color of the outline for the ring. */
  outlineColor: string;
}

// TODO? Don't use MapWaypointIcon for this, there's no need for it
/**
 * An icon for a fix info waypoint.
 */
export class MapFixInfoWaypointIcon<T extends Waypoint> extends AbstractMapWaypointIcon<T> {
  // Icon size is 1 because we don't use it, because our anchor is (0, 0)
  private static readonly ICON_SIZE = Vec2Math.create(1, 1);

  private static readonly noLineDash = [] as readonly number[];

  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2)];
  private static readonly geoPointCache = [new GeoPoint(NaN, NaN), new GeoPoint(NaN, NaN)];
  private static readonly anchor00 = new Float64Array([0, 0]);
  private static readonly rightVector = new Float64Array([1, 0]);

  private readonly distanceCircleDash = [
    10 * this.mapStyles.canvasScale,
    10 * this.mapStyles.canvasScale
  ] as readonly number[];

  private readonly solidCircleDiameterPixels = 48 * this.mapStyles.canvasScale;

  private readonly intersectionCircleDiameterPixels = 12 * this.mapStyles.canvasScale;

  private readonly fixInfo: WT21FixInfoWaypoint;

  /**
   * Constructor.
   * @param waypoint The waypoint.
   * @param mapStyles The map styles.
   * @param clipPathStream The path stream to draw to.
   */
  constructor(waypoint: T, private readonly mapStyles: WT21MapStyles, private readonly clipPathStream: ClippedPathStream) {
    super(waypoint, WT21MapWaypointIconPriority.TopOfDescent, MapFixInfoWaypointIcon.ICON_SIZE, { anchor: MapFixInfoWaypointIcon.anchor00 });

    if (waypoint instanceof FixInfoFacilityWaypoint) {
      this.fixInfo = waypoint.fixInfo;
    } else {
      throw new Error('only FixInfoFacilityWaypoint should be used with MapFixInfoWaypointIcon');
    }
  }

  /** @inheritdoc */
  protected drawIconAt(context: CanvasRenderingContext2D, mapProjection: MapProjection, x: number, y: number): void {
    context.lineCap = 'round';
    context.setLineDash(this.distanceCircleDash);
    this.drawDistanceCircles(context, x, y, mapProjection);
    this.drawRadials(context, mapProjection, x, y);
    this.drawAbeams(context, mapProjection, x, y);
    context.setLineDash(MapFixInfoWaypointIcon.noLineDash);
    this.drawSolidCircle(context, x, y);
    this.drawIntersections(context, mapProjection);
  }

  /**
   * Draws the radials, if required.
   * @param context The context to draw to.
   * @param mapProjection The map projection to use.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   */
  private drawRadials(context: CanvasRenderingContext2D, mapProjection: MapProjection, x: number, y: number): void {
    if (this.fixInfo.bearings.length > 0) {
      this.clipPathStream.beginPath();

      for (let i = 0; i < this.fixInfo.bearings.length; i++) {
        let point = Vec2Math.set(x, y, MapFixInfoWaypointIcon.vec2Cache[1]);
        this.clipPathStream.moveTo(point[0], point[1]);

        const bearing = UnitType.DEGREE.convertTo(this.fixInfo.bearings[i], UnitType.RADIAN) + mapProjection.getRotation() - (0.5 * Math.PI);
        const rot = Vec2Math.setFromPolar(mapProjection.getScaleFactor(), bearing, MapFixInfoWaypointIcon.vec2Cache[0]);
        point = Vec2Math.add(rot, point, point);
        this.clipPathStream.lineTo(point[0], point[1]);
      }

      this.applyStrokes(context);
    }
  }

  /**
   * Draws the abeam lines, if required.
   * @param context The context to draw to.
   * @param mapProjection The map projection to use.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   */
  private drawAbeams(context: CanvasRenderingContext2D, mapProjection: MapProjection, x: number, y: number): void {
    if (this.fixInfo.abeamIntersections.length > 0) {
      this.clipPathStream.beginPath();

      for (let i = 0; i < this.fixInfo.abeamIntersections.length; i++) {
        let point = Vec2Math.set(x, y, MapFixInfoWaypointIcon.vec2Cache[1]);
        this.clipPathStream.moveTo(point[0], point[1]);

        point = mapProjection.project(this.fixInfo.abeamIntersections[i], point);
        this.clipPathStream.lineTo(point[0], point[1]);
      }

      this.applyStrokes(context);
    }
  }

  /**
   * Draws the flight path intersection circles, if required.
   * @param context The context to draw to.
   * @param mapProjection The map projection to use.
   */
  private drawIntersections(context: CanvasRenderingContext2D, mapProjection: MapProjection): void {
    if (this.fixInfo.intersections.length > 0) {
      this.clipPathStream.beginPath();

      for (const intersection of this.fixInfo.intersections) {
        const point = mapProjection.project(intersection, MapFixInfoWaypointIcon.vec2Cache[1]);
        this.clipPathStream.moveTo(point[0], point[1]);

        this.drawIntersectionCircle(context, point[0], point[1]);
      }

      this.applyStrokes(context, WT21_PFD_MFD_Colors.white);
    }
  }

  /**
   * Draws a ring for this fix.
   * @param context  A canvas rendering context.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   */
  private drawSolidCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ): void {
    this.clipPathStream.beginPath();
    this.clipPathStream.arc(x, y, this.solidCircleDiameterPixels / 2, 0, (2 * Math.PI) - 0.001);

    this.applyStrokes(context);
  }

  /**
   * Draws a white intersection circle.
   * @param context  A canvas rendering context.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   */
  private drawIntersectionCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ): void {
    this.clipPathStream.arc(x, y, this.intersectionCircleDiameterPixels / 2, 0, (2 * Math.PI) - 0.001);
  }

  /**
   * Draws the rings for this fix.
   * @param context  A canvas rendering context.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   * @param mapProjection The map projection.
   */
  private drawDistanceCircles(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    mapProjection: MapProjection,
  ): void {
    this.clipPathStream.beginPath();

    // For each BRG/DIS group, draw distance rings and bearing lines
    this.fixInfo.circleRadii.forEach(circle => this.drawDistanceCircle(context, circle, x, y, mapProjection));

    this.applyStrokes(context);
  }

  /**
   * Draws a ring for this fix.
   * @param context  A canvas rendering context.
   * @param radiusMeters The circle radius in meters.
   * @param x The x position in pixels.
   * @param y The y position in pixels.
   * @param mapProjection The map projection.
   */
  private drawDistanceCircle(
    context: CanvasRenderingContext2D,
    radiusMeters: number,
    x: number,
    y: number,
    mapProjection: MapProjection,
  ): void {
    const gaRadians = UnitType.METER.convertTo(radiusMeters, UnitType.GA_RADIAN);

    // The technique here is to project a point on the radius and figure out it's distance in pixels.
    // If we project toward the centre of the map, the point closest to the centre of the map will be in the correct position
    // which will look good most of the time. Without a method to draw an ellipse that's the best we can do with Mercator
    // map projection.
    const fixPoint = Vec2Math.set(x, y, MapFixInfoWaypointIcon.vec2Cache[1]);
    const bearingToCentre = this.fixInfo.location.bearingTo(mapProjection.getCenter());
    const radiusGeoPoint = this.fixInfo.location.offset(bearingToCentre, gaRadians, MapFixInfoWaypointIcon.geoPointCache[0]);
    const radiusPoint = mapProjection.project(radiusGeoPoint, MapFixInfoWaypointIcon.vec2Cache[2]);
    const radiusPixels = Vec2Math.abs(Vec2Math.sub(radiusPoint, fixPoint, radiusPoint));

    this.clipPathStream.moveTo(x + radiusPixels, y);
    this.clipPathStream.arc(x, y, radiusPixels, 0, 2 * Math.PI);
  }

  /**
   * Applies outline and main stroke to a canvas rendering context.
   * @param context A canvas rendering context.
   * @param normalStyle The normal style when not drawing a shadow/outline.
   */
  private applyStrokes(context: CanvasRenderingContext2D, normalStyle: string | CanvasGradient | CanvasPattern = WT21_PFD_MFD_Colors.green): void {
    if (this.mapStyles.outlineWidth > 0) {
      this.applyStroke(context, (this.mapStyles.strokeWidth + 2 * this.mapStyles.outlineWidth), WT21_PFD_MFD_Colors.black);
    }
    this.applyStroke(context, this.mapStyles.strokeWidth, normalStyle);
  }

  /**
   * Applies a stroke to a canvas rendering context.
   * @param context A canvas rendering context.
   * @param lineWidth The width of the stroke.
   * @param strokeStyle The style of the stroke.
   */
  private applyStroke(context: CanvasRenderingContext2D, lineWidth: number, strokeStyle: string | CanvasGradient | CanvasPattern): void {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
  }
}

/**
 * A basic implementation of {@link FacilityWaypoint}.
 */
export class FixInfoFacilityWaypoint<T extends Facility = Facility> extends BasicFacilityWaypoint<T> {
  /**
   * Constructor.
   * @param facility The facility associated with this waypoint.
   * @param bus The event bus.
   * @param fixInfo The fix info.
   */
  constructor(facility: T, bus: EventBus, public readonly fixInfo: Readonly<WT21FixInfoWaypoint>) {
    super(facility, bus);
  }

  /** @inheritdoc */
  public get uid(): string {
    return this.facility.get().icao + '-fix-info';
  }
}
