import {
  AffineTransformPathStream,
  BitFlags, ClippedPathStream, ComponentProps, HorizonProjection, HorizonProjectionChangeType,
  HorizonSharedCanvasSubLayer, MagVar, MathUtils, NullPathStream, ReadonlyFloat64Array, Subscribable,
  SubscribableArray, SubscribableUtils, Subscription, Transform2D, Vec2Math, VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { HorizonOcclusionArea } from './HorizonOcclusionArea';

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

  /** The size of the heading reference pointer. as `[width, height]` in pixels. */
  headingPointerSize: ReadonlyFloat64Array;

  /** The length of a heading tick, in pixels, when the tick is projected to the center of the projection. */
  headingTickLength: number;

  /** The width of each heading tick, in pixels. Defaults to 1 pixel. */
  headingTickWidth?: number;

  /** The color of each heading tick. Defaults to `'white'`. */
  headingTickColor?: string;

  /** The name of the heading label font. */
  font: string;

  /** The size of the heading label font, in pixels, when the label is projected to the center of the projection. */
  fontSize: number;

  /** The color of the heading label font. Defaults to `'white'`. */
  fontColor?: string;

  /** The width of the heading label font outline, in pixels. Defaults to 1 pixel. */
  fontOutlineWidth?: number;

  /** The color of the heading label font outline. Defaults to `'black'`. */
  fontOutlineColor?: string;

  /**
   * The offset of the heading label from its tick, in pixels. Positive offsets shift the label away from the tick.
   * Defaults to 0 pixels.
   */
  labelOffset?: number;
};

/**
 * Component props for HorizonLine.
 */
export interface HorizonLineProps extends ComponentProps {
  /** Whether to show the horizon line. */
  show: Subscribable<boolean>;

  /** Whether to show heading labels. */
  showHeadingLabels: boolean | Subscribable<boolean>;

  /** Whether to approximate pitch scale based on FOV instead of performing a full projection. */
  approximate: boolean | Subscribable<boolean>;

  /** Whether to show magnetic heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** The occlusion areas to apply to the horizon heading ticks and labels. */
  occlusions: SubscribableArray<HorizonOcclusionArea>;

  /** Options for the horizon line. */
  options: Readonly<HorizonLineOptions>;
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

  private static readonly DEFAULT_TICK_STROKE_WIDTH = 1; // pixels
  private static readonly DEFAULT_TICK_STROKE_COLOR = 'white';

  private static readonly DEFAULT_FONT_COLOR = 'white';
  private static readonly DEFAULT_FONT_OUTLINE_WIDTH = 1;
  private static readonly DEFAULT_FONT_OUTLINE_COLOR = 'black';

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly lineStrokeWidth = this.props.options.strokeWidth ?? HorizonLine.DEFAULT_LINE_STROKE_WIDTH;
  private readonly lineStrokeColor = this.props.options.strokeColor ?? HorizonLine.DEFAULT_LINE_STROKE_COLOR;
  private readonly lineOutlineWidth = this.props.options.outlineWidth ?? HorizonLine.DEFAULT_LINE_OUTLINE_WIDTH;
  private readonly lineOutlineColor = this.props.options.outlineColor ?? HorizonLine.DEFAULT_LINE_OUTLINE_COLOR;

  private readonly tickStrokeWidth = this.props.options.headingTickWidth ?? HorizonLine.DEFAULT_TICK_STROKE_WIDTH;
  private readonly tickStrokeColor = this.props.options.headingTickColor ?? HorizonLine.DEFAULT_TICK_STROKE_COLOR;

  private readonly font = `${this.props.options.fontSize}px ${this.props.options.font}`;
  private readonly fontColor = this.props.options.fontColor ?? HorizonLine.DEFAULT_FONT_COLOR;
  private readonly fontOutlineWidth = this.props.options.fontOutlineWidth ?? HorizonLine.DEFAULT_FONT_OUTLINE_WIDTH;
  private readonly fontOutlineColor = this.props.options.fontOutlineColor ?? HorizonLine.DEFAULT_FONT_OUTLINE_COLOR;

  private readonly labelOffset = this.props.options.labelOffset ?? 0;

  private readonly approximate = SubscribableUtils.toSubscribable(this.props.approximate, true);

  private readonly showHeadingLabels = SubscribableUtils.toSubscribable(this.props.showHeadingLabels, true);

  private readonly bounds = VecNSubject.create(
    VecNMath.create(4, -HorizonLine.BOUNDS_BUFFER, -HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER)
  );

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
      labelFontSize: 0
    };
  });

  private readonly approximateTransform = new Transform2D();

  private needUpdate = false;

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
      this.showHeadingLabels.sub(scheduleUpdate),
      this.props.useMagneticHeading.sub(scheduleUpdate),
      this.props.occlusions.sub(scheduleUpdate)
    );

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
      context.font = this.font;
      context.textAlign = 'center';
      context.fillStyle = this.fontColor;

      const projection = this.projection;

      const position = projection.getPosition();
      const useMagnetic = this.props.useMagneticHeading.get();
      const headingOffset = useMagnetic ? MagVar.get(position.lat, position.lon) : 0;
      const approximate = this.approximate.get();

      if (approximate) {
        const center = projection.getOffsetCenterProjected();
        const pitchResolution = projection.getScaleFactor() / projection.getFov();

        this.approximateTransform
          .toTranslation(0, pitchResolution * projection.getPitch())
          .addRotation(-projection.getRoll() * Avionics.Utils.DEG2RAD)
          .addTranslation(center[0], center[1]);

        this.approximateNodes(projection, headingOffset);
      } else {
        this.projectNodes(projection, headingOffset);
      }

      this.drawLine(context);

      if (this.showHeadingLabels.get()) {
        const occlusionsApplied = this.applyOcclusionClipPath(context, this.props.occlusions.getArray());
        if (occlusionsApplied) {
          context.save();
        }

        this.drawTicks(context, projection);

        if (occlusionsApplied) {
          context.restore();
        }

        this.drawHeadingPointer(context, projection);
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
  private projectNodes(projection: HorizonProjection, headingOffset: number): void {
    // Model the horizon line and ticks as a virtual ring of arbitrary radius (the exact value of the radius does not
    // matter because it gets factored out with the perspective projection) within the zero-pitch/zero-roll plane
    // centered on the projection camera.

    const drawLabels = this.showHeadingLabels.get();

    // Compute the virtual tick length and label font size required to achieve the desired projected tick lengths and
    // font sizes, respectively.
    const scaledFocalLength = projection.getScaleFactor() * projection.getFocalLength();
    const virtualTickLength = this.props.options.headingTickLength / scaledFocalLength;
    const virtualFontSize = this.props.options.fontSize / scaledFocalLength;

    for (let i = 0; i < this.nodes.length; i++) {
      const drawLabel = i % HorizonLine.LABEL_FACTOR === 0 && drawLabels;

      const node = this.nodes[i];
      const nominalHeading = node.heading + headingOffset;

      projection.projectCameraRelativeEuclidean(nominalHeading, 1, 0, node.projected);
      const isInBounds = projection.isInProjectedBounds(node.projected, this.bounds.get());

      if (isInBounds && drawLabels) {
        node.drawTick = true;

        projection.projectCameraRelativeEuclidean(
          nominalHeading,
          1,
          virtualTickLength,
          node.tickEndProjected
        );
      } else {
        node.drawTick = false;
      }

      if (isInBounds && drawLabel) {
        node.drawLabel = true;

        const labelOriginProjected = projection.projectCameraRelativeEuclidean(
          nominalHeading,
          1,
          virtualTickLength,
          HorizonLine.vec2Cache[0]
        );
        const labelTopProjected = projection.projectCameraRelativeEuclidean(
          nominalHeading,
          1,
          virtualTickLength + virtualFontSize,
          HorizonLine.vec2Cache[1]
        );
        const delta = Vec2Math.sub(labelTopProjected, labelOriginProjected, HorizonLine.vec2Cache[1]);

        node.labelFontSize = Vec2Math.abs(delta);
      } else {
        node.drawLabel = false;
      }
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

    const drawLabels = this.showHeadingLabels.get();

    const scaleFactor = projection.getScaleFactor();
    const headingRad = projection.getHeading() * Avionics.Utils.DEG2RAD;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const drawLabel = drawLabels && node.labelText !== undefined;

      const angle = (MathUtils.diffAngle(headingRad, (node.heading + headingOffset) * Avionics.Utils.DEG2RAD) + Math.PI) % MathUtils.TWO_PI - Math.PI;
      if (Math.abs(angle) < MathUtils.HALF_PI) {
        const offset = Vec2Math.setFromPolar(1, angle, HorizonLine.vec2Cache[0]);
        const z = offset[0];
        const ratio = 1 / z;

        const projectedX = offset[1] * ratio * scaleFactor;

        this.approximateTransform.apply(Vec2Math.set(projectedX, 0, HorizonLine.vec2Cache[0]), node.projected);
        const isInBounds = projection.isInProjectedBounds(node.projected, this.bounds.get());

        if (isInBounds && drawLabels) {
          node.drawTick = true;

          const tickLength = this.props.options.headingTickLength * ratio;
          this.approximateTransform.apply(Vec2Math.set(projectedX, -tickLength, HorizonLine.vec2Cache[0]), node.tickEndProjected);
        } else {
          node.drawTick = false;
        }

        if (isInBounds && drawLabel) {
          node.drawLabel = true;
          node.labelFontSize = this.props.options.fontSize * ratio;
        } else {
          node.drawLabel = false;
        }
      } else {
        Vec2Math.set(NaN, NaN, node.projected);
        node.drawTick = false;
        node.drawLabel = false;
      }
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

    this.strokePath(context, this.lineStrokeWidth, this.lineStrokeColor, this.lineOutlineWidth, this.lineOutlineColor);
  }

  /**
   * Draws this horizon line's heading reference pointer.
   * @param context The canvas rendering context to which to draw the pointer.
   * @param projection The horizon projection.
   */
  private drawHeadingPointer(context: CanvasRenderingContext2D, projection: HorizonProjection): void {
    const size = this.props.options.headingPointerSize;

    const currentHeading = projection.getHeading();

    const currentHeadingProjected = HorizonLine.vec2Cache[0];
    if (this.approximate.get()) {
      this.approximateTransform.apply(Vec2Math.set(0, 0, currentHeadingProjected), currentHeadingProjected);
    } else {
      projection.projectCameraRelativeAngular(1, currentHeading, 0, currentHeadingProjected);
    }

    if (!projection.isInProjectedBounds(currentHeadingProjected, this.bounds.get())) {
      return;
    }

    const halfWidth = size[0] / 2;

    this.transformPathStream
      .resetTransform()
      .addTranslation(0, -(this.lineStrokeWidth / 2 + this.lineOutlineWidth))
      .addRotation(-projection.getRoll() * Avionics.Utils.DEG2RAD)
      .addTranslation(currentHeadingProjected[0], currentHeadingProjected[1]);

    this.transformPathStream.beginPath();
    this.transformPathStream.moveTo(0, 0);
    this.transformPathStream.lineTo(-halfWidth, -size[1]);
    this.transformPathStream.lineTo(halfWidth, -size[1]);
    this.transformPathStream.closePath();

    context.fillStyle = this.lineStrokeColor;
    context.fill();
    this.strokePath(context, this.lineOutlineWidth, this.lineOutlineColor);
  }

  /**
   * Draws this horizon line's heading ticks on a canvas.
   * @param context The canvas rendering context to which to draw the ticks.
   * @param projection The horizon projection.
   */
  private drawTicks(context: CanvasRenderingContext2D, projection: HorizonProjection): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.drawTick(
        context,
        projection,
        node.projected,
        node.tickEndProjected,
        node.drawTick ? this.tickStrokeWidth : 0,
        node.labelText,
        node.drawLabel ? node.labelFontSize : undefined,
        this.labelOffset
      );
    }
  }

  /**
   * Draws a heading tick on a canvas.
   * @param context The canvas rendering context to which to draw the tick.
   * @param projection The horizon projection.
   * @param startProjected The projected position of the start of the tick.
   * @param endProjected The projected position of the end of the tick.
   * @param tickStrokeWidth The stroke width of the tick, in pixels.
   * @param labelText The text to render for the tick's heading label, or `undefined` if there is no label.
   * @param fontSize The virtual font size of the tick's heading label, or `undefined` if there is no label.
   * @param labelOffset The virtual offset of the tick's heading label, or `undefined` if there is no label.
   */
  private drawTick(
    context: CanvasRenderingContext2D,
    projection: HorizonProjection,
    startProjected: ReadonlyFloat64Array,
    endProjected: ReadonlyFloat64Array,
    tickStrokeWidth: number,
    labelText?: string,
    fontSize?: number,
    labelOffset?: number
  ): void {
    if (tickStrokeWidth > 0) {
      context.beginPath();
      context.moveTo(startProjected[0], startProjected[1]);
      context.lineTo(endProjected[0], endProjected[1]);

      this.strokePath(context, tickStrokeWidth, this.tickStrokeColor);
    }

    if (labelText !== undefined && fontSize !== undefined && labelOffset !== undefined) {
      const delta = Vec2Math.normalize(Vec2Math.sub(endProjected, startProjected, HorizonLine.vec2Cache[1]), HorizonLine.vec2Cache[1]);

      const labelOriginX = endProjected[0] + delta[0] * labelOffset;
      const labelOriginY = endProjected[1] + delta[1] * labelOffset;
      const fontSizeScale = fontSize / this.props.options.fontSize;

      context.translate(labelOriginX, labelOriginY);
      context.scale(fontSizeScale, fontSizeScale);
      context.rotate(-projection.getRoll() * Avionics.Utils.DEG2RAD);

      if (this.fontOutlineWidth > 0) {
        context.lineWidth = this.fontOutlineWidth * 2;
        context.strokeStyle = this.fontOutlineColor;
        context.strokeText(labelText, 0, 0);
      }
      context.fillText(labelText, 0, 0);

      context.resetTransform();
    }
  }

  /**
   * Strokes a path on a canvas.
   * @param context The canvas rendering context with which to stroke the path.
   * @param strokeWidth The width of the stroke.
   * @param strokeStyle The style of the stroke.
   * @param outlineWidth The outline width of the stroke. Defaults to `0`.
   * @param outlineStyle The outline style of the stroke. Required to draw an outline.
   */
  private strokePath(
    context: CanvasRenderingContext2D,
    strokeWidth: number,
    strokeStyle: string,
    outlineWidth = 0,
    outlineStyle?: string
  ): void {
    if (outlineWidth > 0 && outlineStyle !== undefined) {
      context.lineWidth = strokeWidth + 2 * outlineWidth;
      context.strokeStyle = outlineStyle;
      context.stroke();
    }

    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}