/* eslint-disable max-len */
import {
  ComponentProps, DisplayComponent, VNode, FSComponent, Waypoint,
  ComputedSubject, Facility, ICAO, FacilityType, Subject, Subscription,
  StringUtils, LegType, UnitType, NumberFormatter,
} from '@microsoft/msfs-sdk';

import { Fms, FmsUtils, GarminFacilityWaypointCache, NumberUnitDisplay, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { FlightPlanLegListData, G3000FilePaths, LegNameDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcWaypointIcon } from '../../Components/GtcWaypointIcon/GtcWaypointIcon';
import { GtcService } from '../../GtcService/GtcService';

import './FlightPlanLegDisplay.css';

/** The props for {@link FlightPlanLegDisplay}. */
export interface FlightPlanLegDisplayProps extends ComponentProps {
  /** The leg list item data. */
  legListData: FlightPlanLegListData;
  /** The FMS. */
  fms: Fms;
  /** The waypoint cache to use. */
  waypointCache: GarminFacilityWaypointCache;
  /** The GtcService. */
  gtcService: GtcService;
}

const DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1 });

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanLegDisplay extends DisplayComponent<FlightPlanLegDisplayProps> {
  private readonly waypointIconRef = FSComponent.createRef<GtcWaypointIcon>();
  private readonly numberUnitDisplayRef = FSComponent.createRef<NumberUnitDisplay<any>>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly waypoint = ComputedSubject.create<Facility | undefined, Waypoint | null>(undefined, fac => {
    return fac === undefined ? null : this.props.waypointCache.get(fac);
  });
  private readonly superLabelBefore = ComputedSubject.create('', label => StringUtils.useZeroSlash(label));
  private readonly superLabelAfter = ComputedSubject.create('', label => StringUtils.useZeroSlash(label));
  private readonly subLabel = Subject.create('');

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public override async onAfterRender(): Promise<void> {
    this.updateSuperLabel();
    await this.updateSubLabel();
  }

  /** Updates the super label. */
  private updateSuperLabel(): void {
    const { legListData } = this.props;
    const { legData } = legListData;
    const { leg } = legData;

    if (legData.isHeadingLeg) {
      this.subs.push(legData.isBehindActiveLeg.sub(isBehind => {
        if (isBehind) {
          this.superLabelBefore.set('HDG ___°');
        } else {
          this.superLabelBefore.set(`HDG ${legData.courseRounded.toFixed(0).padStart(3, '0')}°`);
        }
      }, true));
    } else if (legData.isHoldLeg) {
      if (leg.leg.distanceMinutes) {
        const seconds = Math.round(leg.leg.distance * 60);

        const minutesPart = Math.floor(seconds / 60);
        const secondsPart = seconds - minutesPart * 60;

        // TODO Should count up when in the hold
        this.superLabelBefore.set(`HOLD ${minutesPart.toFixed(0).padStart(2, '0')}:${secondsPart.toFixed(0).padStart(2, '0')}`);
      } else {
        this.superLabelBefore.set('HOLD ');
      }
    } else if (leg.leg.type === LegType.AF) {
      // The other part is in the render method
      this.superLabelAfter.set(' Arc ' + ICAO.getIdent(leg.leg.originIcao));
    }
  }

  /** Updates the sub label. */
  private async updateSubLabel(): Promise<void> {
    const { legListData, fms } = this.props;
    const leg = legListData.legData.leg;

    if (leg.name === 'MANSEQ') { return; }

    let subLabel = FmsUtils.getSequenceLegFixTypeSuffix(leg, false);

    if (leg.leg.fixIcao.trim().length > 0) {
      const facility = await fms.facLoader.getFacility(
        ICAO.getFacilityType(leg.leg.fixIcao), leg.leg.fixIcao);

      this.waypoint.set(facility);

      if (!subLabel) {
        subLabel = this.getFacilityString(facility);
      }
    }

    this.subLabel.set(subLabel);
  }

  /**
   * Get the facility string for the facility item.
   * @param facility The facility.
   * @returns The facility string for the facility.
   */
  private getFacilityString(facility: Facility): string {
    const facilityType = ICAO.getFacilityType(facility.icao);

    if ([FacilityType.RWY, FacilityType.Intersection].includes(facilityType)) {
      return '';
    }

    // See getFacilityString func in other places if we need to add city/region/coords

    const name = Utils.Translate(facility.name);

    if (name) {
      return name;
    }

    return '';
  }

  /** @inheritdoc */
  public override render(): VNode {
    const { legListData: { legData: { leg } } } = this.props;
    const isArcToFix = leg.leg.type === LegType.AF;
    const isManualTermination = leg.leg.type === LegType.FM || leg.leg.type === LegType.VM;
    const isFlyOver = leg.leg.flyOver;
    const isProcTurn = leg.leg.type === LegType.PI;
    const useWaypointIcon = !isManualTermination && !isFlyOver && !isProcTurn;
    const distanceMeters = isArcToFix
      ? leg.leg.rho
      : (this.props.legListData.legData.isHoldLeg && leg.leg.distanceMinutes !== true)
        ? leg.leg.distance
        : undefined;
    const distance = distanceMeters !== undefined ? UnitType.METER.createNumber(distanceMeters) : undefined;

    return (
      <div class="flight-plan-leg-display">
        <div class="leg-name large-font">
          <LegNameDisplay
            leg={leg}
            gtcOrientation={this.props.gtcService.orientation}
          />
        </div>
        <div class="leg-super-label">
          {this.superLabelBefore}
          {distance !== undefined &&
            <NumberUnitDisplay
              ref={this.numberUnitDisplayRef}
              displayUnit={this.unitsSettingManager.distanceUnitsLarge}
              formatter={DISTANCE_FORMATTER}
              value={distance}
            />
          }
          {this.superLabelAfter}
        </div>
        <div class="leg-sub-label">{this.subLabel}</div>
        {/* // TODO Use flyover waypoint symbol when appropriate ("icon_fly_over_wpt.png") */}
        {useWaypointIcon && <GtcWaypointIcon ref={this.waypointIconRef} class="leg-icon" waypoint={this.waypoint} />}
        {isFlyOver && <img class="leg-icon" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_fly_over_wpt.png`} />}
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.waypointIconRef.getOrDefault()?.destroy();
    this.numberUnitDisplayRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => sub.destroy());
  }
}
