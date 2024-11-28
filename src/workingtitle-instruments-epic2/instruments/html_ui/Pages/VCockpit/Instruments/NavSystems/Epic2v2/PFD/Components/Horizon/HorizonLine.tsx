import {
  AffineTransformPathStream, BitFlags, ClippedPathStream, ComponentProps, HorizonProjection, HorizonProjectionChangeType, HorizonSharedCanvasSubLayer, MagVar,
  MathUtils, NullPathStream, ReadonlyFloat64Array, Subscribable, SubscribableArray, SubscribableUtils, Subscription, Transform2D, Vec2Math, VecNMath,
  VecNSubject
} from '@microsoft/msfs-sdk';

import { ArtificialHorizon } from './ArtificialHorizon';
import { HorizonOcclusionArea } from './HorizonOcclusionArea';

// FIXME horizon line should be occluded by speed, altitude tapes, and VSI

/**
 * Options for {@link HorizonLine}.
 */
export type HorizonLineOptions = {
  /** The width of the horizon line stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The color of the horizon line stroke. Defaults to `'white'`. */
  strokeColor?: string;

  /** The width of the horizon line outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The color of the horizon line outline. Defaults to `'black'`. */
  outlineColor?: string;

  /** The width of the heading reference pointer, in pixels. Defaults to 1 pixel. */
  headingPointerWidth?: number;

  /** The color of the heading reference pointer. Defaults to `'white'`. */
  headingPointerColor?: string;

  /** The heading pointer vertical offset in pixels. Defaults to 0. */
  headingPointerOffsetY?: number;

  /** The minimum size of the heading/track pointers as `[width, height]` in pixels. */
  headingPointerMinSize: ReadonlyFloat64Array;

  /** The maximum size of the heading/track pointers as `[width, height]` in pixels. */
  headingPointerMaxSize: ReadonlyFloat64Array;
};

/**
 * Component props for HorizonLine.
 */
export interface HorizonLineProps extends ComponentProps {
  /** Whether to show the horizon line. */
  show: Subscribable<boolean>;

  /** Whether to approximate pitch scale based on FOV instead of performing a full projection. */
  approximate: boolean | Subscribable<boolean>;

  /** Whether to show magnetic heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** True heading in degrees. */
  trueHeading: Subscribable<number | null>;

  /** Scalar of [0, 1] between the min and max heading pointer size. */
  headingPointerSize: Subscribable<number>;

  /** The occlusion areas to apply to the horizon heading ticks and labels. */
  occlusions: SubscribableArray<HorizonOcclusionArea>;

  /** Options for the horizon line. */
  options: Readonly<HorizonLineOptions>;

  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/**
 * A PFD horizon line with optional heading reference pointer, optional heading tick marks every 10 degrees, and
 * optional heading labels every 30 degrees.
 */
export class HorizonLine extends HorizonSharedCanvasSubLayer<HorizonLineProps> {
  private static readonly TICK_INCREMENT = 10; // degrees per tick
  private static readonly TICK_COUNT = 360 / HorizonLine.TICK_INCREMENT;
  private static readonly LABEL_FACTOR = 3; // number of ticks per label

  private static readonly BOUNDS_BUFFER = 20; // pixels

  private static readonly DEFAULT_LINE_STROKE_WIDTH = 2; // pixels
  private static readonly DEFAULT_LINE_STROKE_COLOR = 'white';
  private static readonly DEFAULT_LINE_OUTLINE_WIDTH = 1; // pixels
  private static readonly DEFAULT_LINE_OUTLINE_COLOR = 'black';
  private static readonly DEFAULT_HEADING_POINTER_WIDTH = 1; // pixels
  private static readonly DEFAULT_HEADING_POINTER_COLOR = 'white';
  private static readonly DEFAULT_HEADING_POINTER_OFFSET_Y = 0;

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly lineStrokeWidth = this.props.options.strokeWidth ?? HorizonLine.DEFAULT_LINE_STROKE_WIDTH;
  private readonly lineStrokeColor = this.props.options.strokeColor ?? HorizonLine.DEFAULT_LINE_STROKE_COLOR;
  private readonly lineOutlineWidth = this.props.options.outlineWidth ?? HorizonLine.DEFAULT_LINE_OUTLINE_WIDTH;
  private readonly lineOutlineColor = this.props.options.outlineColor ?? HorizonLine.DEFAULT_LINE_OUTLINE_COLOR;
  private readonly headingPointerWidth = this.props.options.headingPointerWidth ?? HorizonLine.DEFAULT_HEADING_POINTER_WIDTH;
  private readonly headingPointerColor = this.props.options.headingPointerColor ?? HorizonLine.DEFAULT_HEADING_POINTER_COLOR;
  private readonly headingPointerOffsetY = this.props.options.headingPointerOffsetY ?? HorizonLine.DEFAULT_HEADING_POINTER_OFFSET_Y;

  private readonly approximate = SubscribableUtils.toSubscribable(this.props.approximate, true);

  private readonly bounds = VecNSubject.create(
    VecNMath.create(4, -HorizonLine.BOUNDS_BUFFER, -HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER)
  );

  private readonly headingPointerSize = Vec2Math.create(this.props.options.headingPointerMinSize[0], this.props.options.headingPointerMinSize[1]);

  private readonly clipPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.bounds);
  private readonly transformPathStream = new AffineTransformPathStream(this.clipPathStream);

  private readonly nodes = Array.from({ length: HorizonLine.TICK_COUNT }, (v, index) => {
    const heading = index * HorizonLine.TICK_INCREMENT;
    return {
      heading,
      labelText: index % HorizonLine.LABEL_FACTOR === 0 ? (heading === 0 ? 360 : heading).toFixed(0).padStart(3, '0') : undefined,
      projected: Vec2Math.create(),
      drawTick: false,
      tickEndProjected: Vec2Math.create(),
      drawLabel: false,
      labelFontSize: 0,
    };
  });

  private readonly approximateTransform = new Transform2D();

  private needUpdate = false;
  private drawDashed = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.updateBounds();

    this.clipPathStream.setConsumer(this.display.context);

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    this.subscriptions.push(
      this.props.show.sub(scheduleUpdate),
      this.approximate.sub(scheduleUpdate),
      this.props.useMagneticHeading.sub(scheduleUpdate),
      this.props.occlusions.sub(scheduleUpdate),
      this.props.headingPointerSize.sub(scheduleUpdate),
    );

    this.props.headingPointerSize.sub((v) => {
      Vec2Math.sub(this.props.options.headingPointerMaxSize, this.props.options.headingPointerMinSize, this.headingPointerSize);
      Vec2Math.multScalar(this.headingPointerSize, v, this.headingPointerSize);
      Vec2Math.add(this.headingPointerSize, this.props.options.headingPointerMinSize, this.headingPointerSize);
    }, true);

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.ProjectedSize)) {
      this.updateBounds();
    }

    this.needUpdate = true;
  }

  /**
   * Updates this layer's drawing bounds.
   */
  private updateBounds(): void {
    const projectedSize = this.projection.getProjectedSize();
    this.bounds.set(
      -HorizonLine.BOUNDS_BUFFER,
      -HorizonLine.BOUNDS_BUFFER,
      projectedSize[0] + HorizonLine.BOUNDS_BUFFER,
      projectedSize[1] + HorizonLine.BOUNDS_BUFFER
    );
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needUpdate && this.isVisible();
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.display.isInvalidated || !this.isVisible()) {
      return;
    }

    if (this.props.show.get()) {
      const context = this.display.context;

      const projection = this.projection;

      const position = projection.getPosition();
      const useMagnetic = this.props.useMagneticHeading.get();
      const headingOffset = useMagnetic ? MagVar.get(position.lat, position.lon) : 0;
      const approximate = this.approximate.get();

      if (approximate) {
        const center = projection.getOffsetCenterProjected();
        const pitchResolution = projection.getScaleFactor() / projection.getFov();

        this.approximateTransform
          .toTranslation(0, pitchResolution * MathUtils.clamp(projection.getPitch(), ArtificialHorizon.CLAMP_PITCH_MIN, ArtificialHorizon.CLAMP_PITCH_MAX))
          .addRotation(-projection.getRoll() * Avionics.Utils.DEG2RAD)
          .addTranslation(center[0], center[1]);

        this.approximateNodes(projection, headingOffset);
      } else {
        this.projectNodes(projection, headingOffset);
      }

      const occlusionsApplied = this.applyOcclusionClipPath(context, this.props.occlusions.getArray());
      if (occlusionsApplied) {
        context.save();
      }

      this.drawDashed = approximate && (projection.getPitch() < ArtificialHorizon.CLAMP_PITCH_MIN || projection.getPitch() > ArtificialHorizon.CLAMP_PITCH_MAX);

      this.drawLine(context);

      if (!this.props.declutter.get()) {
        this.drawHeadingPointer(context, this.projection);
        this.drawTrackPointer(context, this.projection);
      }

      if (occlusionsApplied) {
        context.restore();
      }
    }

    this.needUpdate = false;
  }

  /**
   * Applies a clip path based on this layer's occlusion areas. If there are no occlusion areas, then a clip path will
   * not be applied.
   * @param context The canvas rendering context to which to apply the clip path.
   * @param occlusions The occlusion areas to apply.
   * @returns Whether a clip path was applied.
   */
  private applyOcclusionClipPath(context: CanvasRenderingContext2D, occlusions: readonly HorizonOcclusionArea[]): boolean {
    if (occlusions.length === 0) {
      return false;
    }

    const size = this.projection.getProjectedSize();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(size[0], 0);
    context.lineTo(size[0], size[1]);
    context.lineTo(0, size[1]);
    context.lineTo(0, 0);

    for (let i = 0; i < occlusions.length; i++) {
      occlusions[i].path(context);
    }

    context.clip('evenodd');

    return true;
  }

  /**
   * Recalculates the positions of this horizon line's nodes using projection.
   * @param projection The horizon projection.
   * @param headingOffset The offset, in degrees, of the heading ticks with respect to true heading.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private projectNodes(projection: HorizonProjection, headingOffset: number): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const nominalHeading = node.heading + headingOffset;
      projection.projectCameraRelativeEuclidean(nominalHeading, 1, 0, node.projected);
    }
  }

  /**
   * Recalculates the positions of this horizon line's nodes using an approximated pitch scale based on FOV.
   * @param projection The horizon projection.
   * @param headingOffset The offset, in degrees, of the heading ticks with respect to true heading.
   */
  private approximateNodes(projection: HorizonProjection, headingOffset: number): void {
    // Approximate the position of the horizon line and heading ticks as follows: assume the plane is at 0 pitch and 0
    // roll and project the line and ticks via a perspective transform. Then, approximate translation due to pitch
    // using a constant pitch resolution (pixels per degree of pitch) derived from the projection's current field of
    // view. Finally, apply the rotation transformation due to roll. The error of this approximation increases with
    // the absolute deviation of the pitch and roll angles from 0 degrees.

    const scaleFactor = projection.getScaleFactor();
    const headingRad = projection.getHeading() * Avionics.Utils.DEG2RAD;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      const angle = (MathUtils.diffAngle(headingRad, (node.heading + headingOffset) * Avionics.Utils.DEG2RAD) + Math.PI) % MathUtils.TWO_PI - Math.PI;
      if (Math.abs(angle) < MathUtils.HALF_PI) {
        const offset = Vec2Math.setFromPolar(1, angle, HorizonLine.vec2Cache[0]);
        const z = offset[0];
        const ratio = 1 / z;

        const projectedX = offset[1] * ratio * scaleFactor;

        this.approximateTransform.apply(Vec2Math.set(projectedX, 0, HorizonLine.vec2Cache[0]), node.projected);
      } else {
        Vec2Math.set(NaN, NaN, node.projected);
      }

      node.drawTick = false;
      node.drawLabel = false;
    }
  }

  /**
   * Draws the horizon line on a canvas.
   * @param context The canvas rendering context to which to draw the line.
   */
  private drawLine(context: CanvasRenderingContext2D): void {
    this.clipPathStream.beginPath();

    let needMoveTo = true;

    for (let i = 0; i < this.nodes.length; i++) {
      const projected = this.nodes[i].projected;

      if (Vec2Math.isFinite(projected)) {
        if (needMoveTo) {
          this.clipPathStream.moveTo(projected[0], projected[1]);
          needMoveTo = false;
        } else {
          this.clipPathStream.lineTo(projected[0], projected[1]);
        }
      } else {
        needMoveTo = true;
      }
    }

    const first = this.nodes[0].projected;

    if (!needMoveTo && Vec2Math.isFinite(first)) {
      this.clipPathStream.lineTo(first[0], first[1]);
    }

    this.strokePath(context, this.lineStrokeWidth, this.lineStrokeColor, this.lineOutlineWidth, this.lineOutlineColor, this.drawDashed);
  }

  /**
   * Draws this horizon line's heading reference pointer.
   * @param context The canvas rendering context to which to draw the pointer.
   * @param projection The horizon projection.
   */
  private drawHeadingPointer(context: CanvasRenderingContext2D, projection: HorizonProjection): void {
    const size = this.headingPointerSize;

    const currentHeading = this.props.trueHeading.get();

    if (currentHeading === null) {
      return;
    }

    // TODO park on the side in dashed stroke when greater than 9 degrees

    const currentHeadingProjected = HorizonLine.vec2Cache[0];
    if (this.approximate.get()) {
      projection.projectRelativeSpherical(currentHeading, 1, 0, currentHeadingProjected);
    } else {
      projection.projectCameraRelativeAngular(1, currentHeading, 0, currentHeadingProjected);
    }

    if (!projection.isInProjectedBounds(currentHeadingProjected, this.bounds.get())) {
      return;
    }

    const halfWidth = size[0] / 2;
    const pitchResolution = projection.getScaleFactor() / projection.getFov();

    this.transformPathStream
      .resetTransform()
      .addTranslation(0, this.headingPointerOffsetY)
      .addTranslation(0, pitchResolution * (MathUtils.clamp(projection.getPitch(), ArtificialHorizon.CLAMP_PITCH_MIN, ArtificialHorizon.CLAMP_PITCH_MAX) - projection.getPitch()))
      .addRotation(-projection.getRoll() * Avionics.Utils.DEG2RAD)
      .addTranslation(currentHeadingProjected[0], currentHeadingProjected[1]);

    this.transformPathStream.beginPath();
    this.transformPathStream.moveTo(-halfWidth, -size[1]);
    this.transformPathStream.lineTo(0, 0);
    this.transformPathStream.lineTo(halfWidth, -size[1]);

    this.strokePath(context, this.headingPointerWidth, this.headingPointerColor, this.lineOutlineWidth, this.lineOutlineColor);
  }

  /**
   * Draws this horizon line's heading reference pointer.
   * @param context The canvas rendering context to which to draw the pointer.
   * @param projection The horizon projection.
   */
  private drawTrackPointer(context: CanvasRenderingContext2D, projection: HorizonProjection): void {
    const size = this.headingPointerSize;

    // the projection heading is actually track
    const currentTrack = projection.getHeading();

    const currentTrackProjected = HorizonLine.vec2Cache[0];
    if (this.approximate.get()) {
      projection.projectRelativeSpherical(currentTrack, 1, 0, currentTrackProjected);
    } else {
      projection.projectCameraRelativeAngular(1, currentTrack, 0, currentTrackProjected);
    }

    if (!projection.isInProjectedBounds(currentTrackProjected, this.bounds.get())) {
      return;
    }

    const halfWidth = size[0] / 2;
    const pitchResolution = projection.getScaleFactor() / projection.getFov();

    this.transformPathStream
      .resetTransform()
      .addTranslation(0, this.headingPointerOffsetY)
      .addTranslation(0, pitchResolution * (MathUtils.clamp(projection.getPitch(), ArtificialHorizon.CLAMP_PITCH_MIN, ArtificialHorizon.CLAMP_PITCH_MAX) - projection.getPitch()))
      .addRotation(-projection.getRoll() * Avionics.Utils.DEG2RAD)
      .addTranslation(currentTrackProjected[0], currentTrackProjected[1]);

    this.transformPathStream.beginPath();
    this.transformPathStream.moveTo(0, 0);
    this.transformPathStream.lineTo(0, -size[1]);
    this.transformPathStream.lineTo(-halfWidth, -size[1]);
    this.transformPathStream.lineTo(halfWidth, -size[1]);

    this.strokePath(context, this.headingPointerWidth, this.headingPointerColor, this.lineOutlineWidth, this.lineOutlineColor);
  }

  /**
   * Strokes a path on a canvas.
   * @param context The canvas rendering context with which to stroke the path.
   * @param strokeWidth The width of the stroke.
   * @param strokeStyle The style of the stroke.
   * @param outlineWidth The outline width of the stroke. Defaults to `0`.
   * @param outlineStyle The outline style of the stroke. Required to draw an outline.
   * @param drawDashed Whether to draw the stroke dashed
   */
  private strokePath(
    context: CanvasRenderingContext2D,
    strokeWidth: number,
    strokeStyle: string,
    outlineWidth = 0,
    outlineStyle?: string,
    drawDashed = false
  ): void {
    context.setLineDash(drawDashed ? [8, 8] : []);
    context.lineCap = drawDashed ? 'butt' : 'round';
    context.lineJoin = 'round';

    if (outlineWidth > 0 && outlineStyle !== undefined) {
      context.lineWidth = strokeWidth + 2 * outlineWidth;
      context.strokeStyle = outlineStyle;
      context.stroke();
    }

    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.setLineDash([]);
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
