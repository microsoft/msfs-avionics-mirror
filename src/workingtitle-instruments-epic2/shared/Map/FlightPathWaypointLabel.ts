import {
  AbstractMapTextLabel, AltitudeRestrictionType, BitFlags, FlightPathWaypoint, MapCullableLocationTextLabel, MapLocationTextLabelOptions, MapProjection,
  PerformancePlanRepository, Subscribable, Subscription, UnitType, VerticalFlightPhase
} from '@microsoft/msfs-sdk';

import { Epic2PerformancePlan } from '../Performance';
import { Epic2MapLabelPriority, MapWaypointsDisplay } from './EpicMapCommon';
import { MapSystemCommon } from './MapSystemCommon';
import { MapUtils } from './MapUtils';
import { VNavDataModule } from './Modules/VNavDataModule';

const whiteSpaceRegex = /\s/g;

const FL = 'FL';
const MULTI_LINE_COEFF = 0.4;

/**
 * A map flightplan waypoint label for Epic2.
 * Capable of showing speed and altitude restrictions.
 */
export class FlightPathWaypointLabel extends MapCullableLocationTextLabel {
  private static readonly OUTLINE_COLOR = 'black';
  private static readonly BAR_WIDTH = 2;
  private static readonly CHAR_WIDTH = 9;

  private readonly displaySettingSub: Subscription | undefined;

  private altDesc = AltitudeRestrictionType.Unused;
  private altitude1 = -1;
  private altitude2 = -1;
  private phase = VerticalFlightPhase.Climb;
  private transitionAltitude = -1;
  private transitionLevel = -1;
  private altitudeText: string[] = [];

  private isDisplayed = true;

  private showAltRestrictions = false;

  /**
   * Ctor
   * @param waypoint The map waypoint object to display.
   * @param displaySetting The map display settings object.
   * @param options The label options.
   * @param lineHeight The amount of pixels to offset each line by vertically.
   * @param vnavDataModule The vnav data module.
   * @param perfPlanRepository The perfPlanRepository.
   */
  constructor(
    private readonly waypoint: FlightPathWaypoint,
    displaySetting: Subscribable<MapWaypointsDisplay> | undefined,
    options: MapLocationTextLabelOptions,
    private readonly lineHeight: number,
    private readonly vnavDataModule?: VNavDataModule,
    private readonly perfPlanRepository?: PerformancePlanRepository<Epic2PerformancePlan>,
  ) {
    super(waypoint.ident.replace(whiteSpaceRegex, ''), Epic2MapLabelPriority.FlightPlan, waypoint.location, true, options);

    if (displaySetting) {
      this.displaySettingSub = displaySetting.sub(v => {
        this.showAltRestrictions = BitFlags.isAll(v, MapWaypointsDisplay.Altitude);
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
      context.textBaseline = 'bottom';
      context.textAlign = 'left';

      const pos = this.getPosition(mapProjection, AbstractMapTextLabel.tempVec2);
      const centerX = pos[0];
      const centerY = pos[1];

      this.drawText(context, centerX, centerY);
    }
  }

  /** @inheritdoc */
  protected drawText(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // IDENT
    this.renderText(context, centerX, centerY, this.text.get());

    // ALTITUDE
    const isNextConstraint = this.vnavDataModule
      ? this.waypoint.leg === this.vnavDataModule.nextConstraintLegDefForMap.get()
      : false;

    const renderAltitudeLabel = (isNextConstraint || this.showAltRestrictions === true) && MapUtils.showAltitudeForLeg(this.waypoint.leg);
    if (renderAltitudeLabel) {
      this.renderAltitudeConstraints(context, centerX, centerY);
    }
  }

  /**
   * Renders text for the label
   * @param context the context
   * @param centerX the center x position
   * @param centerY the center y position
   * @param text the text to render
   * @param align the text alignment
   */
  protected renderText(context: CanvasRenderingContext2D, centerX: number, centerY: number, text: string, align: CanvasTextAlign = 'left'): void {
    const fontOutlineWidth = this.fontOutlineWidth.get();
    context.textAlign = align;

    if (fontOutlineWidth > 0) {
      context.lineWidth = fontOutlineWidth * 2;
      context.strokeStyle = this.fontOutlineColor.get();
      context.strokeText(text, centerX, centerY);
    }

    context.fillStyle = this.fontColor.get();
    context.fillText(text, centerX, centerY);
  }

  /** Updates the altitude data if anything changed. */
  private updateAltitudeData(): void {
    const legVerticalData = this.waypoint.leg.verticalData;
    const activePerfPlan = this.perfPlanRepository?.getActivePlan();

    if (!activePerfPlan) {
      return;
    }

    let needsUpdate = false;

    if (legVerticalData.altDesc !== this.altDesc) {
      this.altDesc = legVerticalData.altDesc;
      needsUpdate = true;
    }

    if (legVerticalData.altitude1 !== this.altitude1) {
      this.altitude1 = legVerticalData.altitude1;
      needsUpdate = true;
    }

    if (legVerticalData.altitude2 !== this.altitude2) {
      this.altitude2 = legVerticalData.altitude2;
      needsUpdate = true;
    }

    if (legVerticalData.phase !== this.phase) {
      this.phase = legVerticalData.phase;
      needsUpdate = true;
    }

    if (activePerfPlan.transitionAltitude.get() !== this.transitionAltitude) {
      this.transitionAltitude = activePerfPlan.transitionAltitude.get();
      needsUpdate = true;
    }

    if (activePerfPlan.transitionLevel.get() !== this.transitionLevel) {
      this.transitionLevel = activePerfPlan.transitionLevel.get();
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.altitudeText = this.getAltitudeConstraints();
    }
  }

  /**
   * Formats an altitude constraints for display on a waypoint label.
   * @returns List of formatted altitude constraints.
   */
  private getAltitudeConstraints(): string[] {
    const transAltMetres = UnitType.METER.convertFrom(this.phase === VerticalFlightPhase.Climb ? this.transitionAltitude : this.transitionLevel, UnitType.FOOT);

    switch (this.altDesc) {
      case AltitudeRestrictionType.Between:
        return this.phase === VerticalFlightPhase.Climb
          ? [this.formatAltitude(this.altitude2, transAltMetres), this.formatAltitude(this.altitude1, transAltMetres)]
          : [this.formatAltitude(this.altitude1, transAltMetres), this.formatAltitude(this.altitude2, transAltMetres)];
      case AltitudeRestrictionType.Unused:
        return [];
      default:
        return [this.formatAltitude(this.altitude1, transAltMetres)];
    }
  }

  /**
   * Formats an altitude as either an altitude in feet, or a flight level (with FL prefix), depending on the transition altitude.
   * @param altitude The altitude in metres.
   * @param transitionAlt The transition altitude or level in metres.
   * @returns the formatted altitude.
   */
  private formatAltitude(altitude: number, transitionAlt: number): string {
    const isFl = altitude > transitionAlt;
    const altitudeFeet = UnitType.FOOT.convertFrom(altitude, UnitType.METER);
    return `${isFl ? FL : ''}${(altitudeFeet / (isFl ? 100 : 1)).toFixed(0)}`;
  }

  /**
   * Renders Altitude constraints on the left side of the waypoint icon
   * @param context The context.
   * @param centerX The x position.
   * @param centerY The y position.
   */
  private renderAltitudeConstraints(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    this.updateAltitudeData();

    if (this.altDesc === AltitudeRestrictionType.Unused) {
      return;
    }

    const [offsetX] = this.offset.get();

    if (this.altDesc === AltitudeRestrictionType.Between) {
      // There are two constraints to be rendered in two lines. Take the length of the longer one.
      const maxTextLength = Math.max(this.altitudeText[0].length, this.altitudeText[1].length);
      // Increase offset because we render two lines of text
      const x = centerX - 3 * offsetX;
      // Keep text lines tight vertically
      const lineOffset = MULTI_LINE_COEFF * this.lineHeight;
      this.renderText(context, x, centerY - lineOffset, this.altitudeText[1], 'right');
      this.renderText(context, x, centerY + lineOffset, this.altitudeText[0], 'right');
      this.drawConstraintBar(context, x, centerY, maxTextLength * FlightPathWaypointLabel.CHAR_WIDTH);
    } else {
      // There is only one altitude constraint text to be rendered.
      const x = centerX - 2 * offsetX;
      this.renderText(context, x, centerY, this.altitudeText[0], 'right');
      this.drawConstraintBar(context, x, centerY, this.altitudeText[0].length * FlightPathWaypointLabel.CHAR_WIDTH);
    }
  }

  /**
   * Draws an altitude constraint
   * @param ctx The context.
   * @param x The x position.
   * @param y The y position.
   * @param width Width of the bar.
   */
  private drawConstraintBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
    // apply negative offset to keep bars closer to the text
    const bottomBarOffset = -2;
    const topBarOffset = -1;
    switch (this.altDesc) {
      case AltitudeRestrictionType.AtOrAbove:
        this.drawBar(ctx, x, y + bottomBarOffset, -width);
        break;
      case AltitudeRestrictionType.AtOrBelow:
        this.drawBar(ctx, x, y - this.lineHeight - topBarOffset, -width);
        break;
      case AltitudeRestrictionType.At:
        this.drawBar(ctx, x, y - this.lineHeight - topBarOffset, -width);
        this.drawBar(ctx, x, y + bottomBarOffset, -width);
        break;
      case AltitudeRestrictionType.Between:
        this.drawBar(ctx, x, y - (1 + MULTI_LINE_COEFF) * this.lineHeight - topBarOffset, -width);
        this.drawBar(ctx, x, y + MULTI_LINE_COEFF * this.lineHeight + bottomBarOffset, -width);
        break;
    }
  }

  /**
   * Draws a horizontal bar
   * @param ctx The context.
   * @param x The x position.
   * @param y The y position.
   * @param width Width of the bar.
   */
  private drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.strokeStyle = FlightPathWaypointLabel.OUTLINE_COLOR;
    ctx.lineWidth = FlightPathWaypointLabel.BAR_WIDTH + 2 * MapSystemCommon.outlineWidth;
    ctx.stroke();
    ctx.strokeStyle = this.fontColor.get();
    ctx.lineWidth = FlightPathWaypointLabel.BAR_WIDTH;
    ctx.stroke();
  }
}
