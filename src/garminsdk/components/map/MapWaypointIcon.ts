/// <reference types="msfstypes/JS/Avionics" />

import {
  AbstractMapWaypointIcon, AbstractMapWaypointIconOptions, MapProjection, MapWaypointSpriteIcon, NavMath, ReadonlyFloat64Array, Subscribable, SubscribableUtils,
  Waypoint
} from 'msfssdk';

import { AirportWaypoint } from '../../navigation/AirportWaypoint';

/**
 * An airport icon.
 */
export class MapAirportIcon<T extends AirportWaypoint<any>> extends MapWaypointSpriteIcon<T> {
  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param img The image to use for the icon.
   * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    waypoint: T,
    priority: number | Subscribable<number>,
    img: HTMLImageElement,
    size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    options?: AbstractMapWaypointIconOptions
  ) {
    super(waypoint, priority, img, 32, 32, size, options);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected getSpriteFrame(mapProjection: MapProjection): number {
    if (!this.waypoint.longestRunway) {
      return 0;
    }

    const mapRotationDeg = mapProjection.getRotation() * Avionics.Utils.RAD2DEG;
    return Math.round(NavMath.normalizeHeading((this.waypoint.longestRunway.direction + mapRotationDeg)) / 22.5) % 8;
  }
}

/**
 * Initialization options for a MapWaypointHighlightIcon.
 */
export type MapWaypointHighlightIconOptions = {
  /** The buffer of the ring around the base icon, in pixels. */
  ringRadiusBuffer?: number | Subscribable<number>;

  /** The width of the stroke for the ring, in pixels. */
  strokeWidth?: number | Subscribable<number>;

  /** The color of the stroke for the ring. */
  strokeColor?: string | Subscribable<string>;

  /** The width of the outline for the ring, in pixels. */
  outlineWidth?: number | Subscribable<number>;

  /** The color of the outline for the ring. */
  outlineColor?: string | Subscribable<string>;

  /** The color of the ring background. */
  bgColor?: string | Subscribable<string>;
}

/**
 * An icon for a highlighted waypoint. This icon embellishes a pre-existing ("base") icon with a surrounding ring and
 * background.
 */
export class MapWaypointHighlightIcon<T extends Waypoint> extends AbstractMapWaypointIcon<T> {
  /** The buffer of the ring around this icon's base icon, in pixels. */
  public readonly ringRadiusBuffer: Subscribable<number>;

  /** The width of the stroke for this icon's ring, in pixels. */
  public readonly strokeWidth: Subscribable<number>;

  /** The color of the stroke for this icon's ring. */
  public readonly strokeColor: Subscribable<string>;

  /** The width of the outline for this icon's ring, in pixels. */
  public readonly outlineWidth: Subscribable<number>;

  /** The color of the outline for this icon's ring. */
  public readonly outlineColor: Subscribable<string>;

  /** The color of this icon's ring background. */
  public readonly bgColor: Subscribable<string>;

  /**
   * Constructor.
   * @param baseIcon This icon's base waypoint icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    private readonly baseIcon: AbstractMapWaypointIcon<T>,
    priority: number | Subscribable<number>,
    options?: MapWaypointHighlightIconOptions
  ) {
    super(baseIcon.waypoint, priority, baseIcon.size, { offset: baseIcon.offset, anchor: baseIcon.anchor });

    this.ringRadiusBuffer = SubscribableUtils.toSubscribable(options?.ringRadiusBuffer ?? 0, true);
    this.strokeWidth = SubscribableUtils.toSubscribable(options?.strokeWidth ?? 2, true);
    this.strokeColor = SubscribableUtils.toSubscribable(options?.strokeColor ?? 'white', true);
    this.outlineWidth = SubscribableUtils.toSubscribable(options?.outlineWidth ?? 0, true);
    this.outlineColor = SubscribableUtils.toSubscribable(options?.outlineColor ?? 'black', true);
    this.bgColor = SubscribableUtils.toSubscribable(options?.bgColor ?? '#3c3c3c', true);
  }

  /** @inheritdoc */
  protected drawIconAt(context: CanvasRenderingContext2D, mapProjection: MapProjection, left: number, top: number): void {
    const size = this.baseIcon.size.get();
    const radius = Math.hypot(size[0], size[1]) / 2 + this.ringRadiusBuffer.get();

    const x = left + size[0] / 2;
    const y = top + size[1] / 2;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);

    this.drawRingBackground(context);
    this.baseIcon.draw(context, mapProjection);
    this.drawRing(context);
  }

  /**
   * Draws the ring background for this icon.
   * @param context  A canvas rendering context.
   */
  private drawRingBackground(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.bgColor.get();
    context.fill();
  }

  /**
   * Draws the ring for this icon.
   * @param context  A canvas rendering context.
   */
  private drawRing(context: CanvasRenderingContext2D): void {
    const outlineWidth = this.outlineWidth.get();
    const strokeWidth = this.strokeWidth.get();

    if (outlineWidth > 0) {
      this.applyStroke(context, (strokeWidth + 2 * outlineWidth), this.outlineColor.get());
    }
    this.applyStroke(context, strokeWidth, this.strokeColor.get());
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