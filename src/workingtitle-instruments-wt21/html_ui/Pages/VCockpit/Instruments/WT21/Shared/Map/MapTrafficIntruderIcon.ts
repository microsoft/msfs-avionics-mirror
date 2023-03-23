import { AbstractMapTrafficIntruderIcon, MapProjection, MathUtils, ReadonlyFloat64Array, TcasAlertLevel, UnitType, Vec2Math } from '@microsoft/msfs-sdk';

import { WT21_PFD_MFD_Colors as WT21_PFD_MFD_Colors } from '../WT21_Colors';

/**
 * A traffic intruder icon for the WT21. The icon includes a symbol that is chosen based on the intruder's alert
 * level, an altitude label displaying either the intruder's relative or absolute altitude to the nearest hundreds of
 * feet, and a vertical speed direction arrow which is only visible when the magnitude of the intruder's vertical speed
 * is greater than 500 FPM.
 */
export class MapTrafficIntruderIcon extends AbstractMapTrafficIntruderIcon {
  private static readonly VERTICAL_SPEED_THRESHOLD = UnitType.FPM.createNumber(500);

  private static readonly ICON_SIZE = 20;

  private static readonly PA_OTHER_COLOR = WT21_PFD_MFD_Colors.cyan;
  private static readonly TA_COLOR = WT21_PFD_MFD_Colors.yellow;
  private static readonly RA_COLOR = WT21_PFD_MFD_Colors.red;

  private static readonly vec2Cache = [new Float64Array(2)];

  /** @inheritdoc */
  protected drawIcon(
    projection: MapProjection,
    context: CanvasRenderingContext2D,
    projectedPos: ReadonlyFloat64Array,
    isOffScale: boolean
  ): void {
    const alertLevel = this.intruder.alertLevel.get();

    if (!projection.isInProjectedBounds(projectedPos)) {
      return;
    }

    if (alertLevel !== TcasAlertLevel.ResolutionAdvisory && alertLevel !== TcasAlertLevel.TrafficAdvisory) {
      if (isOffScale) {
        return;
      }

      const altitudeMeters = this.intruder.relativePositionVec[2];

      if (
        altitudeMeters > this.trafficModule.altitudeRestrictionAbove.get().asUnit(UnitType.METER)
        || altitudeMeters < -this.trafficModule.altitudeRestrictionBelow.get().asUnit(UnitType.METER)
      ) {
        return;
      }
    }

    context.translate(projectedPos[0], projectedPos[1]);

    this.drawIconVSArrow(context, alertLevel);
    this.drawIconAltitudeLabel(context, alertLevel);
    this.drawIconSymbol(context, projection, projectedPos, alertLevel, isOffScale);

    context.resetTransform();
  }

  /**
   * Draws this icon's symbol.
   * @param context The canvas rendering context to which to draw the icon.
   * @param projection The map projection.
   * @param projectedPos The projected position of this icon's intruder.
   * @param alertLevel The alert level assigned to this icon's intruder.
   * @param isOffScale Whether this icon's intruder is off-scale.
   */
  private drawIconSymbol(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    projectedPos: ReadonlyFloat64Array,
    alertLevel: TcasAlertLevel,
    isOffScale: boolean
  ): void {
    let needRestoreContextState = false;

    if (isOffScale) {
      context.save();
      needRestoreContextState = true;

      const projectedAngle = Vec2Math.theta(Vec2Math.sub(projectedPos, projection.getTargetProjected(), MapTrafficIntruderIcon.vec2Cache[0]));

      context.beginPath();
      context.arc(0, 0, 0.5 * MapTrafficIntruderIcon.ICON_SIZE, projectedAngle - MathUtils.HALF_PI, projectedAngle + MathUtils.HALF_PI);
      context.closePath();

      context.clip();
    }

    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.beginPath();
        context.moveTo(0, -0.4 * MapTrafficIntruderIcon.ICON_SIZE);
        context.lineTo(0.4 * MapTrafficIntruderIcon.ICON_SIZE, 0);
        context.lineTo(0, 0.4 * MapTrafficIntruderIcon.ICON_SIZE);
        context.lineTo(-0.4 * MapTrafficIntruderIcon.ICON_SIZE, 0);
        context.closePath();

        context.lineWidth = 0.1 * MapTrafficIntruderIcon.ICON_SIZE;
        context.strokeStyle = MapTrafficIntruderIcon.PA_OTHER_COLOR;
        context.stroke();

        if (alertLevel === TcasAlertLevel.ProximityAdvisory) {
          context.fillStyle = MapTrafficIntruderIcon.PA_OTHER_COLOR;
          context.fill();
        }
        break;
      case TcasAlertLevel.TrafficAdvisory:
        context.beginPath();
        context.moveTo(0.5 * MapTrafficIntruderIcon.ICON_SIZE, 0);
        context.arc(0, 0, 0.5 * MapTrafficIntruderIcon.ICON_SIZE, 0, MathUtils.TWO_PI);

        context.fillStyle = MapTrafficIntruderIcon.TA_COLOR;
        context.fill();
        break;
      case TcasAlertLevel.ResolutionAdvisory: {
        const size = MapTrafficIntruderIcon.ICON_SIZE * Math.SQRT1_2;
        context.fillStyle = MapTrafficIntruderIcon.RA_COLOR;
        context.fillRect(-0.5 * size, -0.5 * size, size, size);
        break;
      }
    }

    if (needRestoreContextState) {
      context.restore();
    }
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
    context.moveTo(0.75 * MapTrafficIntruderIcon.ICON_SIZE, -0.35 * MapTrafficIntruderIcon.ICON_SIZE * vsSign);
    context.lineTo(0.75 * MapTrafficIntruderIcon.ICON_SIZE, 0.40 * MapTrafficIntruderIcon.ICON_SIZE * vsSign);
    context.moveTo(0.55 * MapTrafficIntruderIcon.ICON_SIZE, -0.05 * MapTrafficIntruderIcon.ICON_SIZE * vsSign);
    context.lineTo(0.75 * MapTrafficIntruderIcon.ICON_SIZE, -0.40 * MapTrafficIntruderIcon.ICON_SIZE * vsSign);
    context.lineTo(0.95 * MapTrafficIntruderIcon.ICON_SIZE, -0.05 * MapTrafficIntruderIcon.ICON_SIZE * vsSign);

    context.lineWidth = Math.max(1, MapTrafficIntruderIcon.ICON_SIZE * 0.1);
    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.strokeStyle = MapTrafficIntruderIcon.PA_OTHER_COLOR;
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

    const altitudeRounded = Utils.Clamp(Math.round(altitudeFeet / 100), isRelative ? -99 : -Infinity, isRelative ? 99 : 999);
    const altitudeAbs = Math.abs(altitudeRounded);
    const prefix = isRelative
      ? altitudeRounded < 0 ? '-' : '+'
      : '';

    const altitudeText = !isRelative && altitudeRounded < 0 ? 'XXX' : `${prefix}${altitudeAbs.toFixed(0).padStart(isRelative ? 2 : 3, '0')}`;

    switch (alertLevel) {
      case TcasAlertLevel.None:
      case TcasAlertLevel.ProximityAdvisory:
        context.fillStyle = MapTrafficIntruderIcon.PA_OTHER_COLOR;
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
      context.fillText(altitudeText, 0, -0.5 * MapTrafficIntruderIcon.ICON_SIZE);
    } else {
      context.textBaseline = 'top';
      context.fillText(altitudeText, 0, 0.5 * MapTrafficIntruderIcon.ICON_SIZE);
    }
  }
}