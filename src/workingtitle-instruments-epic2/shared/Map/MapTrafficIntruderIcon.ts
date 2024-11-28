/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AbstractMapTrafficIntruderIcon, MapOwnAirplanePropsModule, MapProjection, MathUtils, NumberUnitSubject, ReadonlyFloat64Array, TcasAlertLevel, UnitType,
  Vec2Math
} from '@microsoft/msfs-sdk';

import { Epic2Colors } from '../Misc/Epic2Colors';
import { Epic2TcasIntruder } from '../Traffic';
import { EpicMapCommon } from './EpicMapCommon';
import { Epic2MapTrafficModule } from './Modules/Epic2MapTrafficModule';
import { MapStyles } from './Modules/MapStylesModule';

/**
 * A view representation of a TCAS intruder for MapTrafficIntruderLayer.
 */
export class MapTrafficIntruderIcon extends AbstractMapTrafficIntruderIcon {
  private static readonly VERTICAL_SPEED_THRESHOLD = UnitType.FPM.createNumber(500);

  private static readonly DEFAULT_COLOR = Epic2Colors.cyan;
  private static readonly TA_COLOR = Epic2Colors.amber;
  private static readonly RA_COLOR = Epic2Colors.red;
  private static readonly VECTOR_STROKE_WIDTH = 2;
  private static readonly EMPTY_LINE_DASH = [];
  private static readonly vec2Cache = [Vec2Math.create()];
  private static readonly VECTOR_PREDICTION_TIME = NumberUnitSubject.createFromNumberUnit(UnitType.SECOND.createNumber(30));
  private static readonly ALTITUDE_LABEL_FONT_SIZE = 16;

  private readonly iconSize = 28;

  private lastDrawnAltitudeValue?: number;
  private lastDrawnAltitudePrefix?: string;
  private altitudeText = '';
  private epic2TrafficModule: Epic2MapTrafficModule;

  /**
   * Constructor.
   * @param intruder This view's associated intruder.
   * @param trafficModule The traffic module for this icon's parent map.
   * @param ownshipModule The own airplane properties module for this icon's parent map.
   * @param styles The map styles.
   */
  constructor(
    public readonly intruder: Epic2TcasIntruder,
    protected readonly trafficModule: Epic2MapTrafficModule,
    protected readonly ownshipModule: MapOwnAirplanePropsModule,
    private readonly styles: MapStyles,
  ) {
    super(intruder, trafficModule, ownshipModule);
    this.epic2TrafficModule = trafficModule;
  }

  /** @inheritdoc */
  protected drawIcon(
    projection: MapProjection,
    context: CanvasRenderingContext2D,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean
  ): void {
    if (!projection.isInProjectedBounds(projectedPos)) {
      return;
    }

    const alertLevel = this.intruder.alertLevel.get();
    const isTARA = alertLevel === TcasAlertLevel.TrafficAdvisory || alertLevel === TcasAlertLevel.ResolutionAdvisory;

    if (isOffScale) {
      return;
    }

    if (!isTARA) {
      const altitudeMeters = this.intruder.relativePositionVec[2];

      if (
        altitudeMeters > this.trafficModule.altitudeRestrictionAbove.get().asUnit(UnitType.METER)
        || altitudeMeters < -this.trafficModule.altitudeRestrictionBelow.get().asUnit(UnitType.METER)
      ) {
        return;
      }
    }

    context.translate(projectedPos[0], projectedPos[1]);

    this.drawIconAltitudeLabel(context, alertLevel);
    this.drawIconVSArrow(context, alertLevel);

    if (this.epic2TrafficModule.motionVectorVisible.get() && this.intruder.isBearingDisplayDataValid) {
      this.drawAdsbMotionVector(context, projection);
    }

    this.drawTrafficIcon(context, projection, alertLevel);

    context.resetTransform();
  }


  /**
   * Draws the traffic icon.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawTrafficIcon(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    alertLevel: TcasAlertLevel
  ): void {
    this.drawArrowIconBackground(context, alertLevel);

    if (this.intruder.isBearingDisplayDataValid) {
      this.drawIconArrow(context, projection, alertLevel);
    } else {
      this.drawIconSquare(context, projection, alertLevel);
    }
  }

  /**
   * Draws the icon's background when it has a directional arrow display.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawArrowIconBackground(
    context: CanvasRenderingContext2D,
    alertLevel: TcasAlertLevel
  ): void {
    if (alertLevel === TcasAlertLevel.None || alertLevel === TcasAlertLevel.ProximityAdvisory) {
      return;
    }

    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.strokeStyle = '#1a1d21';
    context.lineWidth = Math.max(1, 0.05 * this.iconSize);
    context.fillStyle = alertLevel === TcasAlertLevel.ResolutionAdvisory ? MapTrafficIntruderIcon.RA_COLOR : MapTrafficIntruderIcon.TA_COLOR;

    context.beginPath();

    const size = 0.33 * this.iconSize;

    if (alertLevel === TcasAlertLevel.ResolutionAdvisory) {
      // RA
      context.rect(-size, -size, size * 2, size * 2);
    } else {
      // TA;
      context.arc(0, 0, size, 0, MathUtils.TWO_PI);
    }
    context.fill();
  }

  /**
   * Draws the icon's non-directional square.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconSquare(context: CanvasRenderingContext2D, projection: MapProjection, alertLevel: TcasAlertLevel): void {
    context.save();

    if (alertLevel === TcasAlertLevel.None || alertLevel === TcasAlertLevel.ProximityAdvisory) {
      context.lineCap = 'round';
      context.lineJoin = 'round';

      context.beginPath();
      context.moveTo(0.00 * this.iconSize, -0.33 * this.iconSize);
      context.lineTo(0.33 * this.iconSize, 0.00 * this.iconSize);
      context.lineTo(0.00 * this.iconSize, 0.33 * this.iconSize);
      context.lineTo(-0.33 * this.iconSize, 0.00 * this.iconSize);
      context.closePath();

      // Outline
      context.lineWidth = this.styles.strokeWidth + this.styles.outlineWidth;
      context.strokeStyle = 'black';
      context.stroke();

      switch (alertLevel) {
        case TcasAlertLevel.None:
          context.strokeStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
          context.lineWidth = this.styles.strokeWidth / 2;
          break;
        case TcasAlertLevel.ProximityAdvisory:
          context.strokeStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
          context.fillStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
          context.lineWidth = this.styles.strokeWidth / 2;
          break;
      }

      if (alertLevel === TcasAlertLevel.ProximityAdvisory) {
        context.fill();
      }


      context.stroke();

    }

    context.restore();
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
    this.drawIconArrowOutline(context, alertLevel);
    context.restore();
  }

  /**
   * Draws the icon's directional arrow outline.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconArrowOutline(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(0, -0.3 * this.iconSize);
    context.lineTo(0.212 * this.iconSize, 0.212 * this.iconSize);
    context.lineTo(0, 0.1 * this.iconSize);
    context.lineTo(-0.212 * this.iconSize, 0.212 * this.iconSize);
    context.closePath();


    if (alertLevel === TcasAlertLevel.None || alertLevel === TcasAlertLevel.ProximityAdvisory) {
      // Outline
      context.lineWidth = this.styles.strokeWidth + this.styles.outlineWidth;
      context.strokeStyle = 'black';
      context.stroke();
    }

    switch (alertLevel) {
      case TcasAlertLevel.None:
        context.strokeStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
        context.lineWidth = this.styles.strokeWidth / 2;
        break;
      case TcasAlertLevel.ProximityAdvisory:
        context.strokeStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
        context.fillStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
        context.lineWidth = this.styles.strokeWidth / 2;
        break;
      case TcasAlertLevel.TrafficAdvisory:
      case TcasAlertLevel.ResolutionAdvisory:
        context.strokeStyle = 'black';
        break;
    }

    if (alertLevel === TcasAlertLevel.ProximityAdvisory) {
      context.fill();
    }


    context.stroke();
  }

  /**
   * Draws the icon's vertical speed indicator arrow.
   * @param context The canvas rendering context to which to draw the icon.
   * @param alertLevel The alert level assigned to this view's intruder.
   */
  private drawIconVSArrow(context: CanvasRenderingContext2D, alertLevel: TcasAlertLevel): void {
    const showArrow = MapTrafficIntruderIcon.VERTICAL_SPEED_THRESHOLD.compare(Math.abs(this.intruder.velocityVec[2]), UnitType.MPS) <= 0;
    const isAltitudeAbove = this.intruder.relativePositionVec[2] >= 0;

    if (!showArrow) {
      return;
    }

    const vsSign = Math.sign(this.intruder.velocityVec[2]);

    context.lineCap = 'round';
    context.lineJoin = 'round';

    let yOffset = this.iconSize * 0.68;
    if (isAltitudeAbove) {
      yOffset *= -1;
    }

    context.beginPath();
    context.moveTo(0.67 * this.iconSize, -0.16 * this.iconSize * vsSign + yOffset);
    context.lineTo(0.67 * this.iconSize, 0.16 * this.iconSize * vsSign + yOffset);
    context.moveTo(0.55 * this.iconSize, -0.04 * this.iconSize * vsSign + yOffset);
    context.lineTo(0.67 * this.iconSize, -0.18 * this.iconSize * vsSign + yOffset);
    context.lineTo(0.79 * this.iconSize, -0.04 * this.iconSize * vsSign + yOffset);

    context.lineWidth = Math.max(1, this.iconSize * 0.125);
    context.strokeStyle = 'black';
    context.stroke();

    context.lineWidth = Math.max(1, this.iconSize * 0.075);
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.strokeStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
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
    const prefix = altitudeRounded < 0
      ? '-'
      : isRelative
        ? '+'
        : '';

    if (altitudeAbs !== this.lastDrawnAltitudeValue || prefix !== this.lastDrawnAltitudePrefix) {
      this.lastDrawnAltitudeValue = altitudeAbs;
      this.lastDrawnAltitudePrefix = prefix;
      this.altitudeText = `${prefix}${altitudeAbs}`;
    }

    context.font = MapTrafficIntruderIcon.ALTITUDE_LABEL_FONT_SIZE + 'px ' + EpicMapCommon.font;


    // black outline
    context.lineWidth = this.styles.fontOutlineWidth * 2;
    context.strokeStyle = 'black';

    if (isAltitudeAbove) {
      context.textBaseline = 'bottom';
      context.strokeText(this.altitudeText, 0, -0.3 * this.iconSize);
    } else {
      context.textBaseline = 'top';
      context.strokeText(this.altitudeText, 0, 0.42 * this.iconSize);
    }

    // draw text
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.DEFAULT_COLOR;
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
      context.fillText(this.altitudeText, 0, -0.3 * this.iconSize);
    } else {
      context.textBaseline = 'top';
      context.fillText(this.altitudeText, 0, 0.42 * this.iconSize);
    }
  }

  /**
   * Draws an ADS-B motion vector for this icon.
   * @param context The canvas rendering context to which to draw the vector.
   * @param projection The map projection.
   */
  private drawAdsbMotionVector(context: CanvasRenderingContext2D, projection: MapProjection): void {

    const alertLevel = this.intruder.alertLevel.get();

    let color;
    if (alertLevel === TcasAlertLevel.ResolutionAdvisory) {
      color = MapTrafficIntruderIcon.RA_COLOR;
    } else if (alertLevel === TcasAlertLevel.TrafficAdvisory) {
      color = MapTrafficIntruderIcon.TA_COLOR;
    } else {
      color = MapTrafficIntruderIcon.DEFAULT_COLOR;
    }

    this.drawLookaheadVector(
      projection,
      context,
      color,
      this.intruder.velocityVec,
      MapTrafficIntruderIcon.VECTOR_PREDICTION_TIME.get().asUnit(UnitType.SECOND)
    );
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
    context.setLineDash(MapTrafficIntruderIcon.EMPTY_LINE_DASH);
    const distance = Vec2Math.abs(vector) * lookaheadTime;
    const distanceView = distance / UnitType.GA_RADIAN.convertTo(projection.getProjectedResolution(), UnitType.METER);
    const startOffset = 0.3 * this.iconSize;
    if (startOffset >= distanceView) {
      return;
    }

    const track = -Vec2Math.theta(vector);
    const angle = track + projection.getRotation();
    const unitVector = Vec2Math.setFromPolar(1, angle, MapTrafficIntruderIcon.vec2Cache[0]);

    context.beginPath();
    context.moveTo(unitVector[0] * startOffset, unitVector[1] * startOffset);
    context.lineTo(unitVector[0] * distanceView, unitVector[1] * distanceView);

    context.lineWidth = MapTrafficIntruderIcon.VECTOR_STROKE_WIDTH * 1.5;
    context.strokeStyle = 'black';
    context.stroke();

    context.lineWidth = MapTrafficIntruderIcon.VECTOR_STROKE_WIDTH;
    context.strokeStyle = color;
    context.stroke();
  }

}
