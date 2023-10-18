import { AbstractMapTextLabel, AltitudeRestrictionType, BitFlags, FlightPathWaypoint, MapCullableLocationTextLabel, MapLocationTextLabelOptions, MapProjection, Subscription, UserSetting, VerticalData } from '@microsoft/msfs-sdk';
import { WT21FmsUtils } from '../FlightPlan/WT21FmsUtils';
import { WT21_PFD_MFD_Colors } from '../WT21_Colors';
import { MapWaypointsDisplay } from './MapUserSettings';
import { WT21MapWaypointIconPriority } from './MapSystemCommon';

/**
 * An map flightplan waypoint label for the WT21.
 * Capable of showing speed and altitude restrictions.
 */
export class FlightPathWaypointLabel extends MapCullableLocationTextLabel {
  private isDisplayed = true;

  private showAltRestrictions = false;
  private showSpeedRestrictions = false;
  private readonly displaySettingSub: Subscription | undefined;

  /**
   * Ctor
   * @param waypoint The map waypoint object to display.
   * @param displaySetting The map display settings object.
   * @param options The label options.
   */
  constructor(private readonly waypoint: FlightPathWaypoint, displaySetting?: UserSetting<number>, options?: MapLocationTextLabelOptions) {
    super(waypoint.ident, WT21MapWaypointIconPriority.FlightPlan, waypoint.location, true, options);

    if (displaySetting) {
      this.displaySettingSub = displaySetting.sub((v: number) => {
        this.showAltRestrictions = BitFlags.isAll(v, MapWaypointsDisplay.Altitude);
        this.showSpeedRestrictions = BitFlags.isAll(v, MapWaypointsDisplay.Speed);
      }, true);
    }
  }

  /** @inheritdoc */
  public destroy(): void {
    this.displaySettingSub?.destroy();
    super.destroy();
  }

  /**
   * Sets whether or not the label is displayed.
   * @param isDisplayed Whether or not the label is displayed.
   */
  public setDisplayed(isDisplayed: boolean): void {
    this.isDisplayed = isDisplayed;
  }

  /** @inheritdoc */
  public draw(context: CanvasRenderingContext2D, mapProjection: MapProjection): void {
    if (this.isDisplayed) {
      this.setTextStyle(context);
      context.textAlign = 'left';

      this.getPosition(mapProjection, AbstractMapTextLabel.tempVec2);
      AbstractMapTextLabel.tempVec2[0] += 20;
      AbstractMapTextLabel.tempVec2[1] += 3;

      this.drawText(context, AbstractMapTextLabel.tempVec2[0], AbstractMapTextLabel.tempVec2[1]);
    }
  }

  /** @inheritdoc */
  protected drawText(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    const identText = this.text.get(); // this will be the ident
    context.fillStyle = this.fontColor.get();
    context.fillText(identText, centerX, centerY);

    if (this.showAltRestrictions === true || this.showSpeedRestrictions === true) {
      if (this.waypoint.leg.leg.fixIcao[0] !== 'R') {
        const constraintText = FlightPathWaypointLabel.formatAltitudeConstraint(this.waypoint.leg.verticalData, 18000, this.showSpeedRestrictions, this.showAltRestrictions);
        context.fillStyle = WT21_PFD_MFD_Colors.green;
        context.fillText(constraintText, centerX, centerY + 22);
      }
    }
  }

  /**
   * Formats an altitude constraint for display on a waypoint label.
   * @param constraint A VerticalData object container altitude and speed constraints.
   * @param transitionAltitude The transition altitude, in feet.
   * @param showSpeed Whether the text should include speed restrictions.
   * @param showAlt Whether the text should include altitude constraints.
   * @returns A formatted altitude constraint text.
   */
  private static formatAltitudeConstraint(constraint: VerticalData, transitionAltitude: number, showSpeed: boolean, showAlt: boolean): string {
    let altText = '';
    if (showAlt) {
      switch (constraint.altDesc) {
        case AltitudeRestrictionType.At:
          altText = WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude);
          break;
        case AltitudeRestrictionType.AtOrAbove:
          altText = `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}A`;
          break;
        case AltitudeRestrictionType.AtOrBelow:
          altText = `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}B`;
          break;
        case AltitudeRestrictionType.Between:
          altText = `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude2, transitionAltitude)}A${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}B`;
          break;
        default:
          return altText;
      }
    } else if (showSpeed && constraint.speed === 0) {
      return '';
    }

    const speedText = (showSpeed && constraint.speed && constraint.speed > 0) ? constraint.speed : '';

    return `${speedText}/${altText.replace(/\s/g, '')}`;
  }
}