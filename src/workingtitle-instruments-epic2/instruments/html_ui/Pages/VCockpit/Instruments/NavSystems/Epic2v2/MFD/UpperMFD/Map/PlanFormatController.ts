import {
  BitFlags, FlightPlan, FlightPlanner, FlightPlannerEvents, GeoPoint, LegDefinition, LegType, MapSystemContext, MapSystemController, MapSystemKeys, MathUtils,
  ResourceConsumer, ResourceModerator, UserSettingManager, VNavUtils
} from '@microsoft/msfs-sdk';

import { Epic2FlightPlans, MapWaypointsDisplay, MfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

/**
 * Events on the bus that control the plan map display position.
 */
export interface PlanMapEvents {

  /** A request was made to move the plan map to the next waypoint*/
  plan_map_next: undefined;

  /** A request was made to move the plan map to the previous waypoint*/
  plan_map_prev: undefined;

  /** A request was made to move the plan map to active waypoint*/
  plan_map_to: undefined;

  /** A request was made to move the plan map to center the aircraft*/
  plan_map_center_ac: undefined;

  /**
   * The plan map was requested to move to a specific geographic location, with the data
   * indicating the FMC unit index, 1 or 2.
   */
  plan_map_ctr_wpt: PlanMapCenterRequest;
}

/**
 * A request to move the plan map to a specific geographic location.
 */
export interface PlanMapCenterRequest {
  /** Position index */
  legIndex: number;
}

/**
 * A set of latitude and longitude coordinates
 */
export interface LatLonInterface {
  /** The latitude, in degrees. */
  lat: number;

  /** The longitude, in degrees. */
  lon: number;
}

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
 * A controller that handles map range settings.
 */
export class PlanFormatController extends MapSystemController<any, any, any, PlanFormatControllerContext> {
  private readonly targetControlModerator = this.context[MapSystemKeys.TargetControl];
  private currentFmsPos = new LatLongAlt(0, 0);
  private currentFocusIndex = 0;
  private isDisconnected = false;
  private readonly location = new GeoPoint(0, 0);
  private hasPlanChanged = true;
  private focusedLeg: LegDefinition | undefined;
  private prevFocusIndex = -1;
  private prevMaxIndex = -1;
  private trackingActiveLeg = false;

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
      this.resetTargetIndexes();
    }
  };

  /**
   * Creates an instance of the PlanFormatController.
   * @param context The map system context to use with this controller.
   * @param flightPlanner The flight planner to use with this controller.
   * @param settings The user settings manager to use with this controller.
   */
  constructor(
    context: MapSystemContext<any, any, any, PlanFormatControllerContext>,
    private readonly flightPlanner: FlightPlanner,
    private readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>
  ) {
    super(context);

    // this.fmsPosSetting = FmcUserSettings.getManager(this.context.bus).getSetting('lastFmsPos');
  }

  /**
   * Resets the target indexes.
   */
  private resetTargetIndexes(): void {
    this.currentFocusIndex = 0;
    this.prevFocusIndex = -1;
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    // this.settings.whenSettingChanged('hsiFormat').handle(v => this.handleFormatChanged(v));
    // this.settings.whenSettingChanged('mapWaypointsDisplay').handle(this.updateMapPosition.bind(this));

    const subscriber = this.context.bus.getSubscriber<FlightPlannerEvents & PlanMapEvents>();
    subscriber.on('fplCopied').handle((e) => { if (e.targetPlanIndex == Epic2FlightPlans.Active) { this.hasPlanChanged = true; } });
    subscriber.on('fplCalculated').handle((e) => {
      if (e.planIndex == Epic2FlightPlans.Active) {
        if (this.hasValidFlightPlan() && this.trackingActiveLeg) {
          this.isDisconnected = false;
          this.currentFocusIndex = this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).activeLateralLeg;
        }

        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_center_ac').handle(() => {
      this.isDisconnected = false;
      this.trackingActiveLeg = false;
      this.targetControlModerator.forfeit(this.targetControlConsumer);
    });

    subscriber.on('plan_map_next').handle(() => {
      if (this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = false;
        this.currentFocusIndex++;
        this.targetControlModerator.claim(this.targetControlConsumer);
        // this.facilitySelectModule.facilityIcao.set(null);
        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_prev').handle(() => {
      if (this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = false;

        // if pressed for the first time
        if (this.planHasTargetControl === false) {
          this.currentFocusIndex = this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).activeLateralLeg;
        } else {
          this.currentFocusIndex--;
        }

        this.targetControlModerator.claim(this.targetControlConsumer);
        // this.facilitySelectModule.facilityIcao.set(null);

        this.updateMapPosition();
      }
    });

    subscriber.on('plan_map_to').handle(() => {
      if (this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = true;
        this.currentFocusIndex = this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).activeLateralLeg;
        this.targetControlModerator.claim(this.targetControlConsumer);
        // this.facilitySelectModule.facilityIcao.set(null);
        this.updateMapPosition();
      } else {
        this.enableTrackFmsPos();
      }
    });

    subscriber.on('plan_map_ctr_wpt').handle(({ legIndex }) => {
      if (this.hasValidFlightPlan()) {
        this.isDisconnected = false;
        this.trackingActiveLeg = false;
        this.currentFocusIndex = legIndex;
        this.targetControlModerator.claim(this.targetControlConsumer);
        this.updateMapPosition();
      }
    });

    // this.fmsPosSetting.sub((v: string) => {
    //   if (this.trackingActiveLeg && !this.hasValidFlightPlan()) {
    //     this.currentFmsPos = LatLong.fromStringFloat(v) as LatLongAlt;
    //     this.enableTrackFmsPos();
    //     this.updateMapPosition();
    //   }
    // }, true);
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
  // private handleFormatChanged(format: HSIFormat): void {
  //   if (format === 'PLAN') {
  //     this.targetControlModerator.claim(this.targetControlConsumer);
  //   } else {
  //     this.targetControlModerator.forfeit(this.targetControlConsumer);
  //   }

  //   this.currentFormat = format;
  // }

  /**
   * Checks if there is a valid flightplan to display.
   * @returns True if there is a valid flightplan, false otherwise.
   */
  private hasValidFlightPlan(): boolean {
    return (this.flightPlanner.hasActiveFlightPlan() && this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).length > 0);
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
        this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active)
        && this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).length > 0
        && (this.hasPlanChanged || this.currentFocusIndex !== this.prevFocusIndex)
      ) {
        this.hasPlanChanged = false;
        const plan = this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active);
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
  private findFocusableLeg(plan: FlightPlan, maxIndex: number, direction: SearchDirectionVector): LegDefinition {
    const minIndex = plan.activeLateralLeg - 1; // FROM leg
    if (this.currentFocusIndex > maxIndex) {
      this.currentFocusIndex = minIndex;
    } else if (this.currentFocusIndex < minIndex) {
      this.currentFocusIndex = maxIndex;
    }

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
