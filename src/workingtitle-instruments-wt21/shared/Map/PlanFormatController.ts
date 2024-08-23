import {
  BitFlags, FlightPlan, FlightPlanner, FlightPlannerEvents, GeoPoint, LegDefinition, LegType, MapSystemContext, MapSystemController, MapSystemKeys, MathUtils,
  ResourceConsumer, ResourceModerator, UserSettingManager, VNavUtils
} from '@microsoft/msfs-sdk';

import { WT21NavigationUserSettings } from '../Navigation/WT21NavigationUserSettings';
import { WT21FmsUtils } from '../Systems/FMS/WT21FmsUtils';
import { MapFacilitySelectModule } from './MapFacilitySelectModule';
import { PlanMapEvents } from './MapSystemConfig';
import { HSIFormat, MapSettingsMfdAliased, MapSettingsPfdAliased, MapUserSettings, MapWaypointsDisplay, PfdOrMfd } from './MapUserSettings';
import { WT21MapKeys } from './WT21MapKeys';

/** A type for setting the search direction. */
type SearchDirectionVector = 0 | 1 | -1;

/**
 * Modules required by PlanFormatController.
 */
export interface PlanFormatControllerContext {
  /** Resource moderator for control of setting the map's target. */
  [MapSystemKeys.TargetControl]: ResourceModerator;
}

/**
 * Modules required by PlanFormatController.
 */
export interface PlanFormatControllerModules {
  /** The facility select module. */
  [WT21MapKeys.CtrWpt]: MapFacilitySelectModule;
}

/**
 * A controller that handles map range settings.
 */
export class PlanFormatController extends MapSystemController<PlanFormatControllerModules, any, any, PlanFormatControllerContext> {
  private readonly targetControlModerator = this.context[MapSystemKeys.TargetControl];
  private readonly facilitySelectModule = this.context.model.getModule(WT21MapKeys.CtrWpt);

  private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
  private readonly fmsPosSetting;

  private currentFmsPos = new LatLongAlt(0, 0);
  private currentFormat: HSIFormat = 'PPOS';
  private currentFocusIndex = 0;

  private isDisconnected = false;
  private readonly location = new GeoPoint(0, 0);

  private hasPlanChanged = true;
  private focusedLeg: LegDefinition | undefined;
  private prevFocusIndex = -1;
  private prevMaxIndex = -1;
  private trackingActiveLeg = true;

  private readonly targetParam = {
    target: new GeoPoint(0, 0)
  };

  private planHasTargetControl = false;

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: 10,

    onAcquired: () => {
      this.planHasTargetControl = true;
      // force location reset
      this.hasPlanChanged = true;
      this.updateMapPosition();
    },

    onCeded: () => {
      this.planHasTargetControl = false;
    }
  };

  /**
   * Creates an instance of the PlanFormatController.
   * @param context The map system context to use with this controller.
   * @param pfdOrMfd Whether or not the map is on the PFD or MFD.
   * @param displayIndex The index of the display, 1 or 2.
   * @param flightPlanner The flight planner to use with this controller.
   */
  constructor(
    context: MapSystemContext<any, any, any, PlanFormatControllerContext>,
    private readonly pfdOrMfd: PfdOrMfd,
    private readonly displayIndex: 1 | 2,
    private readonly flightPlanner: FlightPlanner,
  ) {
    super(context);

    this.settings = MapUserSettings.getAliasedManager(this.context.bus, pfdOrMfd);
    this.fmsPosSetting = WT21NavigationUserSettings.getManager(this.context.bus).getSetting('lastFmsPos');
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    if (this.pfdOrMfd === 'MFD') {
      this.wireSettings();
    }
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    this.settings.whenSettingChanged('hsiFormat').handle(v => this.handleFormatChanged(v));
    this.settings.whenSettingChanged('mapWaypointsDisplay').handle(this.updateMapPosition.bind(this));

    const subscriber = this.context.bus.getSubscriber<FlightPlannerEvents & PlanMapEvents>();
    subscriber.on('fplCopied').handle((e) => { if (e.targetPlanIndex == 0) { this.hasPlanChanged = true; } });
    subscriber.on('fplCalculated').handle((e) => {
      if (e.planIndex == 0) {
        if (this.trackingActiveLeg && this.hasValidFlightPlan()) {
          this.isDisconnected = false;
          this.currentFocusIndex = this.flightPlanner.getFlightPlan(0).activeLateralLeg;
        }

        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_next').handle(i => {
      if (i === this.displayIndex && this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = false;
        this.facilitySelectModule.facilityIcao.set(null);
        this.currentFocusIndex++;
        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_prev').handle(i => {
      if (i === this.displayIndex && this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = false;
        this.facilitySelectModule.facilityIcao.set(null);
        this.currentFocusIndex--;
        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_to').handle(i => {
      if (i === this.displayIndex && this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = true;
        this.facilitySelectModule.facilityIcao.set(null);
        this.currentFocusIndex = this.flightPlanner.getFlightPlan(0).activeLateralLeg;
        this.updateMapPosition();
      } else {
        this.enableTrackFmsPos();
      }
    });

    subscriber.on('plan_map_ctr_wpt').handle(i => {
      if (i.index === this.displayIndex) {
        this.isDisconnected = true;
        this.trackingActiveLeg = false;
        this.facilitySelectModule.facilityIcao.set(i.icao);
        if (i.icao === null) {
          this.isDisconnected = false;
          this.trackingActiveLeg = true;
        } else if (i.position !== null) {
          this.location.set(i.position);
          this.updateMapPosition();
        }
      }
    });

    this.fmsPosSetting.sub((v: string) => {
      if (this.trackingActiveLeg && !this.hasValidFlightPlan()) {
        this.currentFmsPos = LatLong.fromStringFloat(v) as LatLongAlt;
        this.enableTrackFmsPos();
        this.updateMapPosition();
      }
    }, true);
  }

  /**
   * Enables tracking the FMS position.
   */
  private enableTrackFmsPos(): void {
    this.isDisconnected = true;
    // HINT: keep this on, so it will switch when a flightplan shows up
    this.trackingActiveLeg = true;
    this.location.set(new GeoPoint(this.currentFmsPos.lat, this.currentFmsPos.long));
  }

  /**
   * Handles when the range or format changes.
   * @param format The format of the map.
   */
  private handleFormatChanged(format: HSIFormat): void {
    if (format === 'PLAN') {
      this.targetControlModerator.claim(this.targetControlConsumer);
    } else {
      this.targetControlModerator.forfeit(this.targetControlConsumer);
    }

    this.currentFormat = format;
  }

  /**
   * Checks if there is a valid flightplan to display.
   * @returns True if there is a valid flightplan, false otherwise.
   */
  private hasValidFlightPlan(): boolean {
    return (this.flightPlanner.hasActiveFlightPlan() && this.flightPlanner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX).length > 0);
  }

  /**
   * Updates the current plan map position.
   */
  private updateMapPosition(): void {
    if (this.planHasTargetControl) {
      if (this.isDisconnected) {
        this.targetParam.target.set(this.location);
        this.context.projection.setQueued(this.targetParam);
        this.prevFocusIndex = -1;
      } else if (
        this.flightPlanner.hasFlightPlan(0)
        && this.flightPlanner.getFlightPlan(0).length > 0
        && (this.hasPlanChanged || this.currentFocusIndex !== this.prevFocusIndex)
      ) {
        this.hasPlanChanged = false;

        const plan = this.flightPlanner.getFlightPlan(0);
        const showMissedAppr = BitFlags.isAll(this.settings.getSetting('mapWaypointsDisplay').value, MapWaypointsDisplay.MissedApproach);
        const mapIndex = VNavUtils.getMissedApproachLegIndex(plan);
        // If missed approach is hidden, you shouldn't be able to sequence to it in the PLAN map
        const maxIndex = showMissedAppr ? (plan.length - 1) : mapIndex;

        if (this.currentFocusIndex === this.prevFocusIndex && maxIndex !== this.prevMaxIndex && this.focusedLeg) {
          // Try to find our previously focused leg in the modified plan
          const newLegIndex = this.getLegIndexByIcao(this.focusedLeg.leg.fixIcao, plan, plan.activeLateralLeg);
          this.currentFocusIndex = newLegIndex > -1 ? newLegIndex : plan.activeLateralLeg;
        }

        this.focusedLeg = this.findFocusableLeg(plan, maxIndex, MathUtils.clamp(this.currentFocusIndex - this.prevFocusIndex, -1, 1) as SearchDirectionVector);
        this.prevFocusIndex = this.currentFocusIndex;
        this.prevMaxIndex = maxIndex;
        if (this.focusedLeg.calculated !== undefined && this.focusedLeg.calculated.endLat !== undefined && this.focusedLeg.calculated.endLon !== undefined) {
          this.targetParam.target.set(this.focusedLeg.calculated.endLat, this.focusedLeg.calculated.endLon);
          this.context.projection.setQueued(this.targetParam);
        }
      }
    }
  }

  /**
   * Tries to find a valid leg to focus based on the given search direction and proposed focus index.
   * @param plan The plan to search.
   * @param maxIndex The maximum index to search.
   * @param direction The search direction.
   * @returns The leg to focus.
   */
  findFocusableLeg(plan: FlightPlan, maxIndex: number, direction: SearchDirectionVector): LegDefinition {
    this.currentFocusIndex = MathUtils.clamp(this.currentFocusIndex, plan.activeLateralLeg, maxIndex);
    const leg = plan.getLeg(this.currentFocusIndex);
    if (leg.leg.type === LegType.Discontinuity && this.currentFocusIndex > plan.activeLateralLeg && this.currentFocusIndex < maxIndex) {
      this.currentFocusIndex += direction;
      return this.findFocusableLeg(plan, maxIndex, direction);
    }
    return leg;
  }

  /**
   * Tries to find the index of a leg in the plan by ICAO
   * HINT: We can't use `getLegIndexFromLeg` because of the fpl copying on modification.
   * @param icao The ICAO of the leg to find.
   * @param plan The plan to search in.
   * @param startIndex The index of the leg to start the search from.
   * @returns The index of the leg, or -1 if not found.
   */
  private getLegIndexByIcao(icao: string, plan: FlightPlan, startIndex: number): number {
    for (let i = startIndex; i < plan.length; i++) {
      const leg = plan.getLeg(i);
      if (leg.leg.fixIcao === icao) {
        return i;
      }
    }
    return -1;
  }

}
