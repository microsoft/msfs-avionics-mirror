/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AbstractMapTrafficIntruderIcon, AdsbOperatingMode, MapFollowAirplaneModule, MapOwnAirplanePropsModule, MapProjection, MapTrafficModule, MathUtils,
  ReadonlyFloat64Array, TcasAlertLevel, TcasIntruder, TcasTcaPrediction, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { TrafficSystemType } from '../../traffic/TrafficSystemType';
import { MapGarminTrafficModule, MapTrafficMotionVectorMode } from './modules/MapGarminTrafficModule';

/**
 * Configuration options for MapTrafficIntruderIcon.
 */
export type MapTrafficIntruderIconOptions = {
  /** The size of the icon, in pixels. */
  iconSize: number;

  /** The size of the icon font, in pixels. */
  fontSize: number;

  /** Whether to draw the icon if the intruder is off-scale. */
  drawOffScale: boolean;

  /** Whether to support the display of ADS-B motion vectors. */
  supportAdsbVector: boolean;

  /** Whether or not to force drawing of the non-arrow icons. */
  forceDrawNoArrow?: boolean;

  /** Whether or not to force TA and RA vectors to be drawn as normal motion vectors. */
  drawTARAVectorAsNormalVector?: boolean;

  /** Forces the motion vector length to a set pixel length. */
  vectorLength?: number;
};

/**
 * A view representation of a TCAS intruder for MapTrafficIntruderLayer.
 */
export class MapTrafficIntruderIcon extends AbstractMapTrafficIntruderIcon {
  private static readonly VERTICAL_SPEED_THRESHOLD = UnitType.FPM.createNumber(500);

  private static readonly TA_COLOR = '#ffff00';
  private static readonly TA_OFFSCALE_COLOR = '#454500';
  private static readonly RA_COLOR = 'red';
  private static readonly RA_OFFSCALE_COLOR = '#450000';

  private static readonly TIS_VECTOR_DIR_PRECISION = 45 * Avionics.Utils.DEG2RAD;
  private static readonly TIS_VECTOR_LOOKAHEAD = 60; // seconds

  private static readonly VECTOR_STROKE_WIDTH = 2;
  private static readonly VECTOR_ABS_COLOR = 'white';
  private static readonly VECTOR_REL_COLOR = '#4ecc3d';
  private static readonly VECTOR_LINE_DASH = [5, 5];
  private static readonly EMPTY_LINE_DASH = [];

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly supportTisVector = this.garminTrafficModule.trafficSystem.type === TrafficSystemType.Tis;

  private lastDrawnAltitudeValue?: number;
  private lastDrawnAltitudePrefix?: string;
  private altitudeText = '';

  /**
   * Constructor.
   * @param intruder This view's associated intruder.
   * @param trafficModule The traffic module for this icon's parent map.
   * @param ownshipModule The own airplane properties module for this icon's parent map.
   * @param garminTrafficModule The Garmin traffic module for this icon's parent map.
   * @param followAirplaneModule The follow airplane module for this icon's parent map.
   * @param options Configuration options for this icon.
   */
  constructor(
    intruder: TcasIntruder,
    trafficModule: MapTrafficModule,
    ownshipModule: MapOwnAirplanePropsModule,
    private readonly garminTrafficModule: MapGarminTrafficModule,
    private readonly followAirplaneModule: MapFollowAirplaneModule,
    private readonly options: MapTrafficIntruderIconOptions
  ) {
    super(intruder, trafficModule, ownshipModule);
  }

  /** @inheritdoc */
  protected drawIcon(
    projection: MapProjection,
    context: CanvasRenderingContext2D,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean
  ): void {
    const alertLevel = this.intruder.alertLevel.get();
    const isTARA = alertLevel === TcasAlertLevel.TrafficAdvisory || alertLevel === TcasAlertLevel.ResolutionAdvisory;

    if (isOffScale && (!this.options.drawOffScale || !isTARA)) {
      return;
    }

    if (
      !isTARA
      && (
        this.intruder.relativePositionVec[2] > this.trafficModule.altitudeRestrictionAbove.get().asUnit(UnitType.METER)
        || this.intruder.relativePositionVec[2] < -this.trafficModule.altitudeRestrictionBelow.get().asUnit(UnitType.METER)
      )
    ) {
      return;
    }

    context.translate(projectedPos[0], projectedPos[1]);

    if (this.garminTrafficModule.showIntruderLabel.get()) {
      this.drawIconVSArrow(context, alertLevel);
      this.drawIconAltitudeLabel(context, alertLevel);
    }

    const isAdsbActive = this.garminTrafficModule.adsbOperatingMode.get() !== AdsbOperatingMode.Standby;

    if (this.options.supportAdsbVector && isAdsbActive) {
      this.drawAdsbMotionVector(context, projection);
    } else if (this.supportTisVector) {
      this.drawTisMotionVector(context, projection);
    }

    if (isAdsbActive && !this.options.forceDrawNoArrow) {
      this.drawArrowIcon(context, projection, projectedPos, isOffScale, alertLevel);
    } else {
      this.drawNoArrowIcon(context, projection, projectedPos, isOffScale, alertLevel);
    }

    context.resetTransform();
  }

  /**
   * Draws the icon without a directional arrow display.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of the intruder.
   * @param isOffScale Whether the intruder is off-scale.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawNoArrowIcon(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean,
    alertLevel: TcasAlertLevel
  ): void {
    context.setLineDash(MapTrafficIntruderIcon.EMPTY_LINE_DASH);

    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        this.drawDiamondIcon(context, alertLevel === TcasAlertLevel.ProximityAdvisory);
        break;
      case TcasAlertLevel.TrafficAdvisory:
        this.drawCircleIcon(context, projection, projectedPos, isOffScale);
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        this.drawSquareIcon(context, projection, projectedPos, isOffScale);
        break;
    }
  }

  /**
   * Draws a diamond icon.
   * @param context The canvas rendering context to which to draw the icon.
   * @param isFilled Whether the diamond should be filled.
   */
  private drawDiamondIcon(context: CanvasRenderingContext2D, isFilled: boolean): void {
    const size = 0.35 * this.options.iconSize;

    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size, 0);
    context.lineTo(0, size);
    context.lineTo(-size, 0);
    context.closePath();

    context.strokeStyle = 'black';
    context.lineWidth = Math.max(1, 0.05 * this.options.iconSize);
    context.fillStyle = 'white';

    context.fill();
    context.stroke();

    if (!isFilled) {
      context.beginPath();
      context.moveTo(0, -size * 0.6);
      context.lineTo(size * 0.6, 0);
      context.lineTo(0, size * 0.6);
      context.lineTo(-size * 0.6, 0);
      context.closePath();

      context.fillStyle = 'black';
      context.fill();
    }
  }

  /**
   * Draws a circle icon for TAs.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of the intruder.
   * @param isOffScale Whether the intruder is off-scale.
   */
  private drawCircleIcon(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean
  ): void {
    context.beginPath();
    context.arc(0, 0, 0.35 * this.options.iconSize, 0, MathUtils.TWO_PI);

    context.strokeStyle = 'black';
    context.lineWidth = Math.max(1, 0.05 * this.options.iconSize);
    context.fillStyle = MapTrafficIntruderIcon.TA_COLOR;

    context.fill();
    context.stroke();

    if (isOffScale) {
      const projectedAngle = Vec2Math.theta(Vec2Math.sub(projectedPos, projection.getTargetProjected(), MapTrafficIntruderIcon.vec2Cache[0]));

      context.beginPath();
      context.arc(0, 0, 0.35 * this.options.iconSize, projectedAngle - MathUtils.HALF_PI, projectedAngle + MathUtils.HALF_PI);
      context.closePath();

      context.fillStyle = MapTrafficIntruderIcon.TA_OFFSCALE_COLOR;
      context.fill();
      context.stroke();
    }
  }

  /**
   * Draws a square icon for RAs.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of the intruder.
   * @param isOffScale Whether the intruder is off-scale.
   */
  private drawSquareIcon(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean
  ): void {
    const size = 0.35 * this.options.iconSize;

    context.beginPath();
    context.moveTo(-size, -size);
    context.lineTo(size, -size);
    context.lineTo(size, size);
    context.lineTo(-size, size);
    context.closePath();

    context.strokeStyle = 'black';
    context.lineWidth = Math.max(1, 0.05 * this.options.iconSize);
    context.fillStyle = MapTrafficIntruderIcon.RA_COLOR;

    context.fill();
    context.stroke();

    if (isOffScale) {
      context.save();

      context.clip();

      const projectedAngle = Vec2Math.theta(Vec2Math.sub(projectedPos, projection.getTargetProjected(), MapTrafficIntruderIcon.vec2Cache[0]));

      context.beginPath();
      context.arc(0, 0, this.options.iconSize, projectedAngle - MathUtils.HALF_PI, projectedAngle + MathUtils.HALF_PI);
      context.closePath();

      context.fillStyle = MapTrafficIntruderIcon.RA_OFFSCALE_COLOR;
      context.fill();
      context.stroke();

      context.restore();
    }
  }

  /**
   * Draws the icon with a directional arrow display.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of the intruder.
   * @param isOffScale Whether the intruder is off-scale.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawArrowIcon(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean,
    alertLevel: TcasAlertLevel
  ): void {
    context.setLineDash(MapTrafficIntruderIcon.EMPTY_LINE_DASH);

    this.drawArrowIconBackground(context, projection, projectedPos, isOffScale, alertLevel);
    this.drawIconArrow(context, projection, alertLevel);
  }

  /**
   * Draws the icon's background when it has a directional arrow display.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of the intruder.
   * @param isOffScale Whether the intruder is off-scale.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawArrowIconBackground(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean,
    alertLevel: TcasAlertLevel
  ): void {
    if (alertLevel === TcasAlertLevel.None || alertLevel === TcasAlertLevel.ProximityAdvisory) {
      return;
    }

    context.strokeStyle = '#1a1d21';
    context.lineWidth = Math.max(1, 0.05 * this.options.iconSize);
    context.fillStyle = alertLevel === TcasAlertLevel.ResolutionAdvisory ? MapTrafficIntruderIcon.RA_COLOR : MapTrafficIntruderIcon.TA_COLOR;

    context.beginPath();
    context.arc(0, 0, 0.45 * this.options.iconSize, 0, MathUtils.TWO_PI);
    context.fill();
    context.stroke();

    if (isOffScale) {
      const projectedAngle = Vec2Math.theta(Vec2Math.sub(projectedPos, projection.getTargetProjected(), MapTrafficIntruderIcon.vec2Cache[0]));

      context.beginPath();
      context.arc(0, 0, 0.45 * this.options.iconSize, projectedAngle - MathUtils.HALF_PI, projectedAngle + MathUtils.HALF_PI);

      context.fillStyle = 'black';
      context.fill();
    }
  }

  /**
   * Draws the icon's directional arrow.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconArrow(context: CanvasRenderingContext2D, projection: MapProjection, alertLevel: TcasAlertLevel): void {
    context.save();
    context.rotate(this.intruder.groundTrack * Avionics.Utils.DEG2RAD + projection.getRotation());
    this.drawIconArrowBackground(context, alertLevel);
    this.drawIconArrowOutline(context, alertLevel);
    context.restore();
  }

  /**
   * Draws the icon's directional arrow background.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconArrowBackground(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.fillStyle = 'black';
        break;
      case TcasAlertLevel.TrafficAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.TA_COLOR;
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.RA_COLOR;
        break;
    }

    context.beginPath();
    context.moveTo(0, -0.3 * this.options.iconSize * 1.4);
    context.lineTo(0.212 * this.options.iconSize * 1.4, 0.212 * this.options.iconSize * 1.4);
    context.lineTo(0, 0.1 * this.options.iconSize * 1.4);
    context.lineTo(-0.212 * this.options.iconSize * 1.4, 0.212 * this.options.iconSize * 1.4);
    context.closePath();

    context.fill();
  }

  /**
   * Draws the icon's directional arrow outline.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconArrowOutline(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    context.lineWidth = Math.max(1, this.options.iconSize * 0.05);

    switch (alertLevel) {
      case TcasAlertLevel.None:
        context.strokeStyle = 'white';
        context.fillStyle = 'black';
        break;
      case TcasAlertLevel.ProximityAdvisory:
        context.strokeStyle = 'transparent';
        context.fillStyle = 'white';
        break;
      case TcasAlertLevel.TrafficAdvisory:
        context.strokeStyle = 'black';
        context.fillStyle = MapTrafficIntruderIcon.TA_COLOR;
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        context.strokeStyle = 'black';
        context.fillStyle = MapTrafficIntruderIcon.RA_COLOR;
        break;
    }

    context.beginPath();
    context.moveTo(0, -0.3 * this.options.iconSize);
    context.lineTo(0.212 * this.options.iconSize, 0.212 * this.options.iconSize);
    context.lineTo(0, 0.1 * this.options.iconSize);
    context.lineTo(-0.212 * this.options.iconSize, 0.212 * this.options.iconSize);
    context.closePath();

    context.fill();
    context.stroke();
  }

  /**
   * Draws the icon's vertical speed indicator arrow.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconVSArrow(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    const showArrow = MapTrafficIntruderIcon.VERTICAL_SPEED_THRESHOLD.compare(Math.abs(this.intruder.velocityVec[2]), UnitType.MPS) <= 0;

    if (!showArrow) {
      return;
    }

    const vsSign = Math.sign(this.intruder.velocityVec[2]);

    context.beginPath();
    context.moveTo(0.67 * this.options.iconSize, -0.16 * this.options.iconSize * vsSign);
    context.lineTo(0.67 * this.options.iconSize, 0.16 * this.options.iconSize * vsSign);
    context.moveTo(0.55 * this.options.iconSize, -0.04 * this.options.iconSize * vsSign);
    context.lineTo(0.67 * this.options.iconSize, -0.18 * this.options.iconSize * vsSign);
    context.lineTo(0.79 * this.options.iconSize, -0.04 * this.options.iconSize * vsSign);

    context.lineWidth = Math.max(1, this.options.iconSize * 0.125);
    context.strokeStyle = 'black';
    context.stroke();

    context.lineWidth = Math.max(1, this.options.iconSize * 0.075);
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.strokeStyle = 'white';
        break;
      case TcasAlertLevel.TrafficAdvisory:
        context.strokeStyle = MapTrafficIntruderIcon.TA_COLOR;
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        context.strokeStyle = MapTrafficIntruderIcon.RA_COLOR;
        break;
    }
    context.stroke();
  }

  /**
   * Draws the icon's altitude label.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconAltitudeLabel(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    const isRelative = this.trafficModule.isAltitudeRelative.get();
    const isAltitudeAbove = this.intruder.relativePositionVec[2] >= 0;
    const altitudeFeet = this.trafficModule.isAltitudeRelative.get()
      ? UnitType.METER.convertTo(this.intruder.relativePositionVec[2], UnitType.FOOT)
      : this.intruder.altitude.asUnit(UnitType.FOOT);

    const altitudeRounded = Math.round(altitudeFeet / 100);
    const altitudeAbs = Math.abs(altitudeRounded);
    const prefix = altitudeRounded < 0 ? '−'
      : isRelative ? '+' : '';

    if (altitudeAbs !== this.lastDrawnAltitudeValue || prefix !== this.lastDrawnAltitudePrefix) {
      this.lastDrawnAltitudeValue = altitudeAbs;
      this.lastDrawnAltitudePrefix = prefix;
      this.altitudeText = `${prefix}${altitudeAbs}`;
    }

    const textWidth = context.measureText(this.altitudeText).width;
    const textHeight = this.options.fontSize;

    // draw background

    context.fillStyle = 'black';
    if (isAltitudeAbove) {
      context.fillRect(-textWidth / 2 - 2, -0.5 * this.options.iconSize - textHeight - 2, textWidth + 4, textHeight + 2);
    } else {
      context.fillRect(-textWidth / 2 - 2, 0.5 * this.options.iconSize, textWidth + 4, textHeight + 2);
    }

    // draw text

    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.fillStyle = 'white';
        break;
      case TcasAlertLevel.TrafficAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.TA_COLOR;
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.RA_COLOR;
        break;
    }

    if (isAltitudeAbove) {
      context.textBaseline = 'bottom';
      context.fillText(this.altitudeText, 0, -0.5 * this.options.iconSize);
    } else {
      context.textBaseline = 'top';
      context.fillText(this.altitudeText, 0, 0.5 * this.options.iconSize);
    }
  }

  /**
   * Draws a TIS motion vector for this icon.
   * @param context The canvas rendering context to which to draw the vector.
   * @param projection The map projection.
   */
  private drawTisMotionVector(context: CanvasRenderingContext2D, projection: MapProjection): void {
    let color: string;

    const alertLevel = this.intruder.alertLevel.get();
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        color = MapTrafficIntruderIcon.VECTOR_ABS_COLOR;
        break;
      case TcasAlertLevel.TrafficAdvisory:
        color = MapTrafficIntruderIcon.TA_COLOR;
        break;
      case TcasAlertLevel.ResolutionAdvisory:
        color = MapTrafficIntruderIcon.RA_COLOR;
        break;
    }

    const vector = this.intruder.velocityVec;
    const vectorDir = Vec2Math.theta(vector);
    const vectorMag = this.options.vectorLength !== undefined ? this.options.vectorLength : Vec2Math.abs(vector);

    const roundedVector = Vec2Math.setFromPolar(
      vectorMag,
      Math.round(vectorDir / MapTrafficIntruderIcon.TIS_VECTOR_DIR_PRECISION) * MapTrafficIntruderIcon.TIS_VECTOR_DIR_PRECISION,
      MapTrafficIntruderIcon.vec2Cache[0]
    );

    this.drawLookaheadVector(projection, context, color, roundedVector, MapTrafficIntruderIcon.TIS_VECTOR_LOOKAHEAD);
  }

  /**
   * Draws an ADS-B motion vector for this icon.
   * @param context The canvas rendering context to which to draw the vector.
   * @param projection The map projection.
   */
  private drawAdsbMotionVector(context: CanvasRenderingContext2D, projection: MapProjection): void {
    const vectorMode = this.garminTrafficModule.motionVectorMode.get();
    if (vectorMode === MapTrafficMotionVectorMode.Off) {
      return;
    }

    const vector = vectorMode === MapTrafficMotionVectorMode.Absolute || !this.followAirplaneModule.isFollowing.get()
      ? this.intruder.velocityVec
      : this.intruder.relativeVelocityVec;

    const alertLevel = this.intruder.alertLevel.get();
    if ((alertLevel === TcasAlertLevel.None || alertLevel === TcasAlertLevel.ProximityAdvisory) || this.options.drawTARAVectorAsNormalVector) {
      let color;
      if (alertLevel === TcasAlertLevel.ResolutionAdvisory) {
        color = MapTrafficIntruderIcon.RA_COLOR;
      } else if (alertLevel === TcasAlertLevel.TrafficAdvisory) {
        color = MapTrafficIntruderIcon.TA_COLOR;
      } else {
        color = vectorMode === MapTrafficMotionVectorMode.Absolute
          ? MapTrafficIntruderIcon.VECTOR_ABS_COLOR
          : MapTrafficIntruderIcon.VECTOR_REL_COLOR;
      }

      this.drawLookaheadVector(
        projection,
        context,
        color,
        vector,
        this.garminTrafficModule.motionVectorLookahead.get().asUnit(UnitType.SECOND)
      );
    } else {
      let prediction, color;
      if (alertLevel === TcasAlertLevel.ResolutionAdvisory) {
        prediction = this.intruder.tcaRA;
        color = MapTrafficIntruderIcon.RA_COLOR;
      } else {
        prediction = this.intruder.tcaTA;
        color = MapTrafficIntruderIcon.TA_COLOR;
      }
      this.drawCPAVector(projection, context, prediction, color, vector);
    }
  }

  /**
   * Draws a motion vector projected to a certain lookahead time.
   * @param projection The map projection.
   * @param context The canvas rendering context to which to draw the vector.
   * @param color The color of the vector.
   * @param vector The vector to draw.
   * @param lookaheadTime The lookahead time, in seconds.
   */
  private drawLookaheadVector(
    projection: MapProjection,
    context: CanvasRenderingContext2D,
    color: string,
    vector: ReadonlyFloat64Array,
    lookaheadTime: number
  ): void {
    context.lineWidth = MapTrafficIntruderIcon.VECTOR_STROKE_WIDTH;
    context.strokeStyle = color;
    context.setLineDash(MapTrafficIntruderIcon.EMPTY_LINE_DASH);
    context.beginPath();

    const distance = Vec2Math.abs(vector) * lookaheadTime;
    const distanceView = this.options.vectorLength !== undefined
      ? this.options.vectorLength
      : distance / UnitType.GA_RADIAN.convertTo(projection.getProjectedResolution(), UnitType.METER);

    const track = -Vec2Math.theta(vector);
    const angle = track + projection.getRotation();
    const end = Vec2Math.setFromPolar(distanceView, angle, MapTrafficIntruderIcon.vec2Cache[1]);
    context.moveTo(0, 0);
    context.lineTo(end[0], end[1]);

    context.stroke();
  }

  /**
   * Draws a motion vector projected to the point of closest horizontal approach (CPA).
   * @param projection The map projection.
   * @param context The canvas rendering context to which to draw the vector.
   * @param prediction The time of closest approach prediction to use.
   * @param color The color of the vector.
   * @param vector The vector to draw.
   */
  private drawCPAVector(
    projection: MapProjection,
    context: CanvasRenderingContext2D,
    prediction: TcasTcaPrediction,
    color: string,
    vector: ReadonlyFloat64Array
  ): void {
    const distanceToEnd = Vec2Math.abs(projection.getProjectedSize());
    if (distanceToEnd > 0) {
      context.lineWidth = MapTrafficIntruderIcon.VECTOR_STROKE_WIDTH;
      context.strokeStyle = color;

      context.setLineDash(MapTrafficIntruderIcon.VECTOR_LINE_DASH);
      context.beginPath();

      const track = -Vec2Math.theta(vector);
      const angle = track + projection.getRotation();
      const end = Vec2Math.setFromPolar(distanceToEnd, angle, MapTrafficIntruderIcon.vec2Cache[1]);
      context.moveTo(0, 0);
      context.lineTo(end[0], end[1]);

      context.stroke();

      context.setLineDash(MapTrafficIntruderIcon.EMPTY_LINE_DASH);

      const distanceToCPA = Vec2Math.abs(vector) * prediction.tcpa.asUnit(UnitType.SECOND);
      const distanceToCPAProjected = distanceToCPA / UnitType.GA_RADIAN.convertTo(projection.getProjectedResolution(), UnitType.METER);
      if (distanceToCPAProjected > 0) {
        context.beginPath();

        const cpa = Vec2Math.setFromPolar(distanceToCPAProjected, angle, MapTrafficIntruderIcon.vec2Cache[1]);
        context.moveTo(0, 0);
        context.lineTo(cpa[0], cpa[1]);

        context.stroke();
      }
    }
  }
}