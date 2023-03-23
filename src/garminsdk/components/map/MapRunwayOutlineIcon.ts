import { MapProjection, MapWaypointIcon, Subscribable, SubscribableUtils, Transform2D, UnitType, Vec2Math } from '@microsoft/msfs-sdk';
import { MapRunwayDesignationImageCache } from './MapRunwayDesignationImageCache';
import { MapRunwayOutlineWaypoint } from './MapRunwayOutlineWaypoint';

/**
 * Styling options for {@link MapRunwayOutlineIcon}.
 */
export type MapRunwayOutlineIconOptions = {
  /** The fill style of the runway. Defaults to `'#afafaf'`. */
  fillStyle?: string | CanvasGradient | CanvasPattern | Subscribable<string | CanvasGradient | CanvasPattern>;

  /** The width of the runway outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number | Subscribable<number>;

  /** The outline style of the runway. Defaults to `'white'`. */
  outlineStyle?: string | CanvasGradient | CanvasPattern | Subscribable<string | CanvasGradient | CanvasPattern>;

  /** The color of the runway markings. Defaults to `'white'`. */
  markingColor?: string | Subscribable<string>;

  /** Whether to draw centerline markings. Defaults to `true`. */
  drawCenterLine?: boolean | Subscribable<boolean>;

  /** Whether to draw threshold markings. Defaults to `true`. */
  drawThreshold?: boolean | Subscribable<boolean>;

  /** Whether to draw designation markings. Defaults to `true`. */
  drawDesignation?: boolean | Subscribable<boolean>;

  /** Whether to draw displaced threshold markings. Defaults to `true`. */
  drawDisplacedThreshold?: boolean | Subscribable<boolean>;
};

/**
 * An icon which depicts a schematic outline of a runway.
 */
export class MapRunwayOutlineIcon implements MapWaypointIcon<MapRunwayOutlineWaypoint> {
  private static readonly CENTER_LINE_LENGTH = UnitType.FOOT.convertTo(120, UnitType.METER);
  private static readonly CENTER_LINE_GAP = UnitType.FOOT.convertTo(80, UnitType.METER);
  private static readonly CENTER_LINE_WIDTH_FACTOR = 0.1; // relative to runway width
  private static readonly CENTER_LINE_DASH_ARRAY = [MapRunwayOutlineIcon.CENTER_LINE_LENGTH, MapRunwayOutlineIcon.CENTER_LINE_GAP];

  private static readonly THRESHOLD_BAR_LENGTH = 3; // meters

  private static readonly THRESHOLD_STRIPE_COUNT = 8;
  private static readonly THRESHOLD_STRIPE_WIDTH_FACTOR = 0.06; // relative to runway width
  private static readonly THRESHOLD_STRIPE_LENGTH_FACTOR = 0.7; // relative to runway width
  private static readonly THRESHOLD_STRIPE_CENTER_GAP_FACTOR = 0.15; // relative to runway width
  private static readonly THRESHOLD_STRIPE_SIDE_MARGIN_FACTOR = 0.1; // relative to runway width
  private static readonly THRESHOLD_STRIPE_END_MARGIN_FACTOR = 0.1; // relative to runway width

  private static readonly DESIGNATION_WIDTH_FACTOR = 0.9; // relative to runway width
  private static readonly DESIGNATION_LENGTH_FACTOR = 0.6; // relative to runway width
  private static readonly DESIGNATION_GAP_FACTOR = 0.15; // relative to runway width

  private static readonly DISP_THRESHOLD_ARROW_STROKE_WIDTH_FACTOR = 0.05; // relative to runway width
  private static readonly DISP_THRESHOLD_ARROW_WIDTH_FACTOR = 0.25; // relative to runway width
  private static readonly DISP_THRESHOLD_ARROW_LENGTH_FACTOR = 0.1; // relative to runway width
  private static readonly DISP_THRESHOLD_ARROW_STEM_LENGTH_FACTOR = 0.33; // relative to runway width
  private static readonly DISP_THRESHOLD_ARROW_END_MARGIN_FACTOR = 0.05; // relative to runway width

  private static readonly DEFAULT_FILL_STYLE = '#afafaf';
  private static readonly DEFAULT_OUTLINE_WIDTH = 1;
  private static readonly DEFAULT_OUTLINE_STYLE = 'white';
  private static readonly DEFAULT_MARKING_COLOR = 'white';

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create(), Vec2Math.create(), Vec2Math.create(), Vec2Math.create()];

  public readonly priority: Subscribable<number>;

  private readonly fillStyle: Subscribable<string | CanvasGradient | CanvasPattern>;
  private readonly outlineWidth: Subscribable<number>;
  private readonly outlineStyle: Subscribable<string | CanvasGradient | CanvasPattern>;
  private readonly markingColor: Subscribable<string>;

  private readonly drawCenterLine: Subscribable<boolean>;
  private readonly drawThreshold: Subscribable<boolean>;
  private readonly drawDesignation: Subscribable<boolean>;
  private readonly drawDisplacedThreshold: Subscribable<boolean>;

  private readonly hasSecondary = this.waypoint.secondaryNumber !== undefined;
  private readonly hasDesignatorChar = this.waypoint.runway.designatorCharPrimary !== RunwayDesignator.RUNWAY_DESIGNATOR_NONE;
  private readonly usableLength = this.waypoint.runway.length - this.waypoint.runway.primaryThresholdLength - this.waypoint.runway.secondaryThresholdLength;

  private readonly centerLineWidth = this.waypoint.runway.width * MapRunwayOutlineIcon.CENTER_LINE_WIDTH_FACTOR;

  private readonly thresholdBarLength = Math.min(MapRunwayOutlineIcon.THRESHOLD_BAR_LENGTH, this.usableLength);

  private readonly thresholdStripeWidth = this.waypoint.runway.width * MapRunwayOutlineIcon.THRESHOLD_STRIPE_WIDTH_FACTOR;
  private readonly thresholdStripeCenterGap = this.waypoint.runway.width * MapRunwayOutlineIcon.THRESHOLD_STRIPE_CENTER_GAP_FACTOR;
  private readonly thresholdStripeSideMargin = this.waypoint.runway.width * MapRunwayOutlineIcon.THRESHOLD_STRIPE_SIDE_MARGIN_FACTOR;
  private readonly thresholdStripeGap
    = (this.waypoint.runway.width - this.thresholdStripeWidth * MapRunwayOutlineIcon.THRESHOLD_STRIPE_COUNT - this.thresholdStripeSideMargin * 2 - this.thresholdStripeCenterGap)
    / ((MapRunwayOutlineIcon.THRESHOLD_STRIPE_COUNT / 2 - 1) * 2);
  private readonly thresholdStripeEndMargin = this.waypoint.runway.width * MapRunwayOutlineIcon.THRESHOLD_STRIPE_END_MARGIN_FACTOR;
  private readonly thresholdStripeStart = MapRunwayOutlineIcon.THRESHOLD_BAR_LENGTH + this.thresholdStripeEndMargin;
  private readonly thresholdStripeLength = Math.min(
    this.waypoint.runway.width * MapRunwayOutlineIcon.THRESHOLD_STRIPE_LENGTH_FACTOR,
    Math.max((this.usableLength / 2) - this.thresholdStripeStart, 0)
  );

  private readonly designationWidth = this.waypoint.runway.width * MapRunwayOutlineIcon.DESIGNATION_WIDTH_FACTOR;
  private readonly designationGap = this.waypoint.runway.width * MapRunwayOutlineIcon.DESIGNATION_GAP_FACTOR;
  private readonly designationStart = this.thresholdStripeStart + this.thresholdStripeLength + this.designationGap;
  private readonly desiredDesignationLength = this.waypoint.runway.width * MapRunwayOutlineIcon.DESIGNATION_LENGTH_FACTOR;
  private readonly desiredTotalDesignationLength = this.desiredDesignationLength + (this.hasDesignatorChar ? this.desiredDesignationLength + this.designationGap : 0);
  private readonly trueTotalDesignationLength = this.designationStart + this.desiredDesignationLength <= this.usableLength / 2 ? this.desiredTotalDesignationLength : 0;

  private readonly primaryDesignationNumberImg?: HTMLImageElement;
  private readonly primaryDesignationDesignatorImg?: HTMLImageElement;

  private readonly secondaryDesignationNumberImg?: HTMLImageElement;
  private readonly secondaryDesignationDesignatorImg?: HTMLImageElement;

  private readonly centerLineStart = Math.min(
    this.designationStart + this.trueTotalDesignationLength + MapRunwayOutlineIcon.CENTER_LINE_GAP / 2,
    this.usableLength / 2
  );

  private readonly dispThresholdArrowStrokeWidth = this.waypoint.runway.width * MapRunwayOutlineIcon.DISP_THRESHOLD_ARROW_STROKE_WIDTH_FACTOR;
  private readonly dispThresholdArrowWidth = this.waypoint.runway.width * MapRunwayOutlineIcon.DISP_THRESHOLD_ARROW_WIDTH_FACTOR;
  private readonly dispThresholdArrowLength = this.waypoint.runway.width * MapRunwayOutlineIcon.DISP_THRESHOLD_ARROW_LENGTH_FACTOR;
  private readonly dispThresholdArrowStemLength = this.waypoint.runway.width * MapRunwayOutlineIcon.DISP_THRESHOLD_ARROW_STEM_LENGTH_FACTOR;
  private readonly dispThresholdArrowGapLength = this.dispThresholdArrowLength + this.dispThresholdArrowStemLength;
  private readonly dispThresholdArrowEndMargin = this.waypoint.runway.width * MapRunwayOutlineIcon.DISP_THRESHOLD_ARROW_END_MARGIN_FACTOR;

  private readonly transform = new Transform2D();

  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon, or a subscribable which provides it. Icons with higher
   * priorities should be rendered above those with lower priorities.
   * @param options Styling options.
   * @param designationImgCache The cache from which this icon retrieves runway designation images. If not defined,
   * this icon will not render runway designations.
   */
  constructor(
    public readonly waypoint: MapRunwayOutlineWaypoint,
    priority: number | Subscribable<number>,
    options?: Readonly<MapRunwayOutlineIconOptions>,
    designationImgCache?: MapRunwayDesignationImageCache
  ) {
    this.priority = SubscribableUtils.toSubscribable(priority, true);

    this.fillStyle = SubscribableUtils.toSubscribable(options?.fillStyle ?? MapRunwayOutlineIcon.DEFAULT_FILL_STYLE, true);
    this.outlineWidth = SubscribableUtils.toSubscribable(options?.outlineWidth ?? MapRunwayOutlineIcon.DEFAULT_OUTLINE_WIDTH, true);
    this.outlineStyle = SubscribableUtils.toSubscribable(options?.outlineStyle ?? MapRunwayOutlineIcon.DEFAULT_OUTLINE_STYLE, true);
    this.markingColor = SubscribableUtils.toSubscribable(options?.markingColor ?? MapRunwayOutlineIcon.DEFAULT_MARKING_COLOR, true);

    this.drawCenterLine = SubscribableUtils.toSubscribable(options?.drawCenterLine ?? true, true);
    this.drawThreshold = SubscribableUtils.toSubscribable(options?.drawThreshold ?? true, true);
    this.drawDesignation = SubscribableUtils.toSubscribable(options?.drawDesignation ?? true, true);
    this.drawDisplacedThreshold = SubscribableUtils.toSubscribable(options?.drawDisplacedThreshold ?? true, true);

    this.primaryDesignationNumberImg = designationImgCache?.getNumber(waypoint.primaryNumber);
    this.primaryDesignationDesignatorImg = this.hasDesignatorChar ? designationImgCache?.getDesignator(waypoint.runway.designatorCharPrimary) : undefined;

    if (waypoint.secondaryNumber !== undefined) {
      this.secondaryDesignationNumberImg = designationImgCache?.getNumber(waypoint.secondaryNumber);
      this.secondaryDesignationDesignatorImg = this.hasDesignatorChar ? designationImgCache?.getDesignator(waypoint.runway.designatorCharSecondary) : undefined;
    }
  }

  /** @inheritdoc */
  public draw(context: CanvasRenderingContext2D, mapProjection: MapProjection): void {
    const projectedCenter = mapProjection.project(this.waypoint.location.get(), MapRunwayOutlineIcon.vec2Cache[0]);

    const resolution = UnitType.GA_RADIAN.convertTo(mapProjection.getProjectedResolution(), UnitType.METER);
    const projectedWidth = this.waypoint.runway.width / resolution;
    const projectedLength = this.waypoint.runway.length / resolution;

    // LODs based on the projected width of the runway:
    // >= 15 px -> LOD 0: outlined runway with markings
    // >= 10 px -> LOD 1: outlined runway without markings
    // >= 0.5 px -> LOD 2: solid line
    // < 0.5 px -> not rendered

    if (projectedWidth < 0.5) {
      return;
    }

    // Bounding box check

    this.transform
      .toTranslation(-projectedLength / 2, -projectedWidth / 2)
      .addRotation((this.waypoint.runway.direction - 90) * Avionics.Utils.DEG2RAD + mapProjection.getRotation())
      .addTranslation(projectedCenter[0], projectedCenter[1]);

    const topLeft = Vec2Math.set(0, 0, MapRunwayOutlineIcon.vec2Cache[1]);
    const topRight = Vec2Math.set(projectedLength, 0, MapRunwayOutlineIcon.vec2Cache[2]);
    const bottomRight = Vec2Math.set(projectedLength, projectedWidth, MapRunwayOutlineIcon.vec2Cache[3]);
    const bottomLeft = Vec2Math.set(0, projectedWidth, MapRunwayOutlineIcon.vec2Cache[4]);

    this.transform.apply(topLeft, topLeft);
    this.transform.apply(topRight, topRight);
    this.transform.apply(bottomRight, bottomRight);
    this.transform.apply(bottomLeft, bottomLeft);

    const minX = Math.min(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
    const maxX = Math.max(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
    const minY = Math.min(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);
    const maxY = Math.max(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);

    const [windowWidth, windowHeight] = mapProjection.getProjectedSize();

    if (maxX <= 0 || maxY <= 0 || minX >= windowWidth || minY >= windowHeight) {
      return;
    }

    const width = this.waypoint.runway.width;
    const length = this.waypoint.runway.length;

    const halfWidth = width / 2;
    const halfLength = length / 2;

    const scalingFactor = 1 / resolution;

    // Transform the context such that the center of the runway is at the origin and the direction of the runway
    // runs along the y-axis, and apply a scaling factor based on the map projection.

    const transformParams = this.transform.getParameters();

    this.transform
      .toScale(scalingFactor, scalingFactor)
      .addRotation(this.waypoint.runway.direction * Avionics.Utils.DEG2RAD + mapProjection.getRotation())
      .addTranslation(projectedCenter[0], projectedCenter[1]);

    context.setTransform(transformParams[0], transformParams[3], transformParams[1], transformParams[4], transformParams[2], transformParams[5]);

    // Draw the runway fill.

    context.fillStyle = this.fillStyle.get();
    context.fillRect(-halfWidth, -halfLength, width, length);

    if (projectedWidth < 10) {
      context.resetTransform();
      return;
    }

    // Draw the runway outline.

    context.lineWidth = this.outlineWidth.get() * resolution;
    context.strokeStyle = this.outlineStyle.get();
    context.strokeRect(-halfWidth, -halfLength, width, length);

    if (projectedWidth < 15) {
      context.resetTransform();
      return;
    }

    context.fillStyle = this.markingColor.get();
    context.strokeStyle = this.markingColor.get();

    const primaryDisplacedThresholdLength = this.waypoint.runway.primaryThresholdLength;
    const secondaryDisplacedThresholdLength = this.waypoint.runway.secondaryThresholdLength;

    const primaryThresholdY = halfLength - primaryDisplacedThresholdLength;
    const secondaryThresholdY = -halfLength + secondaryDisplacedThresholdLength;

    if (this.drawCenterLine.get()) {
      context.beginPath();
      context.moveTo(0, primaryThresholdY - this.centerLineStart);
      context.lineTo(0, secondaryThresholdY + this.centerLineStart);

      context.lineWidth = this.centerLineWidth;
      context.setLineDash(MapRunwayOutlineIcon.CENTER_LINE_DASH_ARRAY);

      context.stroke();
    }

    // Transform the context such that the start of the primary runway lies at the origin and the direction of the
    // primary runway points in the negative y direction, then draw end markings.

    this.transform
      .toTranslation(0, halfLength)
      .addScale(scalingFactor, scalingFactor)
      .addRotation(this.waypoint.runway.direction * Avionics.Utils.DEG2RAD + mapProjection.getRotation())
      .addTranslation(projectedCenter[0], projectedCenter[1]);

    context.setTransform(transformParams[0], transformParams[3], transformParams[1], transformParams[4], transformParams[2], transformParams[5]);

    this.drawEndMarkings(context, width, halfWidth, primaryDisplacedThresholdLength, this.primaryDesignationNumberImg, this.primaryDesignationDesignatorImg);

    if (this.hasSecondary) {
      // Transform the context such that the start of the secondary runway lies at the origin and the direction of the
      // secondary runway points in the negative y direction, then draw end markings.

      this.transform
        .toTranslation(0, halfLength)
        .addScale(scalingFactor, scalingFactor)
        .addRotation((this.waypoint.runway.direction + 180) * Avionics.Utils.DEG2RAD + mapProjection.getRotation())
        .addTranslation(projectedCenter[0], projectedCenter[1]);

      context.setTransform(transformParams[0], transformParams[3], transformParams[1], transformParams[4], transformParams[2], transformParams[5]);

      this.drawEndMarkings(context, width, halfWidth, secondaryDisplacedThresholdLength, this.secondaryDesignationNumberImg, this.secondaryDesignationDesignatorImg);
    }

    context.resetTransform();
  }

  /**
   * Draws threshold and displaced threshold markings for a directional runway.
   * @param context The canvas 2D rendering context to which to render. The context should be transformed such that
   * the end of the runway lies at the origin and the direction of the runway points in the positive x direction, and
   * the scaling factor equals the local scaling factor of the map projection.
   * @param runwayWidth The width of the runway, in meters.
   * @param runwayHalfWidth The width of the runway divided by two, in meters.
   * @param displacedThresholdLength The length of the runway's displaced threshold, in meters.
   * @param numberImg The runway number image.
   * @param designatorImg The runway designator image.
   */
  private drawEndMarkings(
    context: CanvasRenderingContext2D,
    runwayWidth: number,
    runwayHalfWidth: number,
    displacedThresholdLength: number,
    numberImg: HTMLImageElement | undefined,
    designatorImg: HTMLImageElement | undefined
  ): void {
    const thresholdY = -displacedThresholdLength;

    if (this.drawThreshold.get()) {
      // Draw threshold bars

      context.fillRect(-runwayHalfWidth, thresholdY - this.thresholdBarLength, runwayWidth, this.thresholdBarLength);

      // Draw threshold stripes

      if (this.thresholdStripeLength > 0) {
        const y = thresholdY - this.thresholdStripeStart - this.thresholdStripeLength;

        let x = this.thresholdStripeSideMargin - runwayHalfWidth;
        for (let i = 0; i < MapRunwayOutlineIcon.THRESHOLD_STRIPE_COUNT / 2; i++) {
          context.fillRect(x, y, this.thresholdStripeWidth, this.thresholdStripeLength);
          x += this.thresholdStripeWidth + this.thresholdStripeGap;
        }

        x = runwayHalfWidth - this.thresholdStripeSideMargin - this.thresholdStripeWidth;
        for (let i = 0; i < MapRunwayOutlineIcon.THRESHOLD_STRIPE_COUNT / 2; i++) {
          context.fillRect(x, y, this.thresholdStripeWidth, this.thresholdStripeLength);
          x -= this.thresholdStripeWidth + this.thresholdStripeGap;
        }
      }
    }

    if (this.drawDesignation.get() && this.trueTotalDesignationLength > 0) {
      // Draw designation

      const x = -this.designationWidth / 2;
      let y = thresholdY - this.designationStart - this.desiredDesignationLength;

      if (designatorImg !== undefined) {
        context.drawImage(designatorImg, x, y, this.designationWidth, this.desiredDesignationLength);
        y -= this.designationGap + this.desiredDesignationLength;
      }

      if (numberImg !== undefined) {
        context.drawImage(numberImg, x, y, this.designationWidth, this.desiredDesignationLength);
      }
    }

    if (this.drawDisplacedThreshold.get()) {
      if (displacedThresholdLength < this.dispThresholdArrowEndMargin + this.dispThresholdArrowLength) {
        return;
      }

      context.lineWidth = this.dispThresholdArrowStrokeWidth;
      context.beginPath();

      // Draw end arrows

      const endArrowY = thresholdY + this.dispThresholdArrowEndMargin;

      let endArrowX = runwayWidth / 6 - runwayHalfWidth;
      for (let i = 0; i < 3; i++) {
        this.drawDisplacedThresholdArrowEndPattern(context, endArrowX, endArrowY);
        endArrowX += runwayWidth / 3;
      }

      const centerLineStop = endArrowY + this.dispThresholdArrowLength + this.dispThresholdArrowEndMargin;
      const patternLength = this.dispThresholdArrowGapLength * 2;
      if (patternLength <= 0 || -centerLineStop < patternLength) {
        context.stroke();
        return;
      }

      // Draw center line arrows

      const patternCount = Math.floor(-centerLineStop / patternLength);
      const start = (centerLineStop + patternLength * patternCount) / 2;

      let centerArrowY = start;
      for (let i = 0; i < patternCount; i++) {
        this.drawDisplacedThresholdArrowCenterPattern(context, centerArrowY);
        centerArrowY -= patternLength;
      }

      context.stroke();
    }
  }

  /**
   * Draws a single unit of a displaced threshold end arrow pattern.
   * @param context The canvas 2D rendering context to which to render.
   * @param x The x coordinate of the top of the arrow, in meters.
   * @param y The y coordinate of the center of the arrow, in meters.
   */
  private drawDisplacedThresholdArrowEndPattern(context: CanvasRenderingContext2D, x: number, y: number): void {
    context.moveTo(x - this.dispThresholdArrowWidth / 2, y + this.dispThresholdArrowLength);
    context.lineTo(x, y);
    context.lineTo(x + this.dispThresholdArrowWidth / 2, y + this.dispThresholdArrowLength);
  }

  /**
   * Draws a single unit of a displaced threshold centerline arrow pattern.
   * @param context The canvas 2D rendering context to which to render.
   * @param y The y coordinate of the start of the pattern unit, in meters.
   */
  private drawDisplacedThresholdArrowCenterPattern(context: CanvasRenderingContext2D, y: number): void {
    const stemStartY = y - this.dispThresholdArrowGapLength * 0.5;
    const stemEndY = stemStartY - this.dispThresholdArrowStemLength;
    const arrowEndY = stemEndY - this.dispThresholdArrowLength;

    context.moveTo(0, stemStartY);
    context.lineTo(0, stemEndY);
    context.moveTo(-this.dispThresholdArrowWidth / 2, stemEndY);
    context.lineTo(0, arrowEndY);
    context.lineTo(this.dispThresholdArrowWidth / 2, stemEndY);
  }
}