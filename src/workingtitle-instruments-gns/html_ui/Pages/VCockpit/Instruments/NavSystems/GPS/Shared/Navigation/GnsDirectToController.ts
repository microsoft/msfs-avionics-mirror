import {
  BasicNavAngleUnit, ConsumerValue, ControlEvents, Facility, FacilityWaypoint, FacilityWaypointUtils, FlightPlan,
  ICAO, LegDefinition, NavEvents, Subject, Waypoint
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms, FmsUtils, ObsSuspModes } from '@microsoft/msfs-garminsdk';
import { GnsDirectToStore } from './GnsDirectToStore';
import { ViewService } from '../UI/Pages/Pages';
import { GnsObsEvents } from './GnsObsEvents';

/**
 * The properties for Direct To Input Data.
 */
export interface DirectToInputData {
  /** The selected segment index for the direct to existing. */
  segmentIndex?: number;
  /** The selected leg index for the direct to existing. */
  legIndex?: number;
  /** The icao of the fix */
  icao: string;
}

/**
 * Data on a direct to existing target leg.
 */
export interface DirectToExistingData {
  /** The index of the segment in which the target leg resides. */
  segmentIndex: number;

  /** The index of the target leg in its segment. */
  segmentLegIndex: number;

  /** The ICAO of the target leg fix. */
  icao: string;
}

/** The controller for the DTO view */
export class GnsDirectToController {
  private static readonly BEARING_MAGNETIC = BasicNavAngleUnit.create(true);

  public readonly inputIcao = Subject.create('');
  public readonly canActivate = Subject.create(false);

  public readonly matchedWaypointsChangedHandler = this.onMatchedWaypointsChanged.bind(this);
  public readonly waypointChangedHandler = this.onWaypointChanged.bind(this);
  public readonly inputEnterPressedHandler = this.onInputEnterPressed.bind(this);

  private directToExistingData: DirectToExistingData | null = null;

  public directToExistingLegDefinition: LegDefinition | null = null;

  private obsState = ConsumerValue.create(this.fms.bus.getSubscriber<GnsObsEvents>().on('obs_susp_mode'), ObsSuspModes.NONE);

  private goToActivateOnWaypoint = false;

  /**
   * Creates an instance of direct to controller.
   * @param store This controller's associated direct to menu store.
   * @param fms The flight management system.
   * @param viewService The view service used by this controller.
   * @param goToActivateFunc A function which focuses the Activate button of this controller's associated view.
   */
  constructor(
    private readonly store: GnsDirectToStore,
    private readonly fms: Fms,
    private readonly viewService: ViewService,
    private readonly goToActivateFunc: () => void
  ) {
  }

  /**
   * Initializes the direct to target based on input data. If the input data is defined, the target will be set to that
   * defined by the input data. If the input data is undefined, an attempt will be made to set the target to the
   * following, in order:
   * * The current active direct to target.
   * * The current active flight plan leg.
   * * The next leg in the primary flight plan, following the active leg, that is a valid direct to target.
   * * The previous leg in the primary flight plan, before the active leg, that is a valid direct to target.
   * @param dtoData The input data.
   */
  public initializeTarget(dtoData: DirectToInputData | undefined): void {
    const primaryPlan = this.fms.hasPrimaryFlightPlan() && this.fms.getPrimaryFlightPlan();
    this.directToExistingData = null;
    let targetIcao = '';

    if (primaryPlan && dtoData?.legIndex !== undefined && dtoData?.segmentIndex !== undefined) {
      // Input defines a DTO existing target

      try {
        if (this.fms.canDirectTo(dtoData.segmentIndex, dtoData.legIndex)) {
          this.directToExistingData = GnsDirectToController.createDtoExistingData(primaryPlan, dtoData.segmentIndex, dtoData.legIndex);
        } else {
          this.directToExistingData = this.searchForValidDtoExistingLeg(dtoData.segmentIndex, dtoData.legIndex);
        }
      } catch {
        // noop
      }
    } else if (dtoData !== undefined) {
      // Input defines a DTO random target

      targetIcao = dtoData.icao;
    } else {
      // No input -> initialize to current DTO target, or search for a valid DTO existing target starting with the
      // active leg

      const dtoState = this.fms.getDirectToState();
      if (dtoState === DirectToState.TOEXISTING && primaryPlan) {
        this.directToExistingData = {
          icao: primaryPlan.getLeg(primaryPlan.activeLateralLeg).leg.fixIcao,
          segmentIndex: primaryPlan.directToData.segmentIndex,
          segmentLegIndex: primaryPlan.directToData.segmentLegIndex
        };
      } else if (dtoState === DirectToState.TORANDOM) {
        const dtoPlan = this.fms.getDirectToFlightPlan();
        targetIcao = dtoPlan.getLeg(dtoPlan.activeLateralLeg).leg.fixIcao;
      } else if (primaryPlan && primaryPlan.length > 0) {
        this.directToExistingData = this.searchForValidDtoExistingLeg(Math.min(primaryPlan.activeLateralLeg, primaryPlan.length - 1));
      }
    }

    if (this.directToExistingData) {
      targetIcao = this.directToExistingData.icao;
    }

    if (this.inputIcao.get() === targetIcao) {
      this.syncCourseInput();
    } else {
      this.inputIcao.set(targetIcao);
    }
  }

  /**
   * Searches for a valid Direct To Existing target in the primary flight plan, starting from a specified flight plan
   * leg. The search begins with the specified leg, then proceeds forwards in the plan. If no valid leg is found, the
   * search then returns to the leg immediately prior to the specified leg and proceeds backwards in the plan.
   * @param segmentIndex The index of the segment that contains the starting leg.
   * @param segmentLegIndex The index of the starting leg in its segment.
   */
  private searchForValidDtoExistingLeg(segmentIndex: number, segmentLegIndex: number): DirectToExistingData | null;
  /**
   * Searches for a valid Direct To Existing target in the primary flight plan, starting from a specified flight plan
   * leg. The search begins with the specified leg, then proceeds forwards in the plan. If no valid leg is found, the
   * search then returns to the leg immediately prior to the specified leg and proceeds backwards in the plan.
   * @param legIndex The global index of the starting leg.
   */
  private searchForValidDtoExistingLeg(legIndex: number): DirectToExistingData | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  private searchForValidDtoExistingLeg(arg1: number, arg2?: number): DirectToExistingData | null {
    const plan = this.fms.getPrimaryFlightPlan();
    const legIndex = arg2 === undefined
      ? arg1
      : plan.getSegment(arg1).offset + arg2;

    let dtoExisting = null;

    // search forwards in plan
    const len = plan.length;
    for (let i = legIndex; i < len; i++) {
      const currSegmentIndex = plan.getSegmentIndex(i);
      const currSegmentLegIndex = i - plan.getSegment(currSegmentIndex).offset;
      if (this.fms.canDirectTo(currSegmentIndex, currSegmentLegIndex)) {
        dtoExisting = GnsDirectToController.createDtoExistingData(plan, currSegmentIndex, currSegmentLegIndex);
        break;
      }
    }

    if (!dtoExisting) {
      // search backwards in plan
      for (let i = legIndex - 1; i >= 0; i--) {
        const currSegmentIndex = plan.getSegmentIndex(i);
        const currSegmentLegIndex = i - plan.getSegment(currSegmentIndex).offset;
        if (this.fms.canDirectTo(currSegmentIndex, currSegmentLegIndex)) {
          dtoExisting = GnsDirectToController.createDtoExistingData(plan, currSegmentIndex, currSegmentLegIndex);
          break;
        }
      }
    }

    return dtoExisting;
  }

  /**
   * Responds to changes in the waypoint input's matched waypoints list.
   * @param waypoints The matched waypoints.
   */
  private onMatchedWaypointsChanged(waypoints: readonly FacilityWaypoint<Facility>[]): void {
    this.store.setMatchedWaypoints(waypoints);
  }

  /**
   * Responds to changes in the waypoint input's selected waypoint.
   * @param waypoint The selected waypoint.
   */
  private async onWaypointChanged(waypoint: Waypoint | null): Promise<void> {
    const facility = waypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(waypoint) ? waypoint.facility.get() : null;

    if (facility?.icao !== this.directToExistingData?.icao) {
      this.directToExistingData = null;
      const plan = this.fms.hasPrimaryFlightPlan() && this.fms.getPrimaryFlightPlan();

      if (plan && facility) {

        if (this.directToExistingLegDefinition !== null) {
          const indexes = FmsUtils.getLegIndexes(plan, this.directToExistingLegDefinition);
          if (indexes && this.directToExistingLegDefinition.leg.fixIcao === facility.icao && this.fms.canDirectTo(indexes.segmentIndex, indexes.segmentLegIndex)) {
            this.directToExistingData = {
              segmentIndex: indexes.segmentIndex,
              segmentLegIndex: indexes.segmentLegIndex,
              icao: facility.icao
            };
          }
        }
        if (this.directToExistingData === null) {
          for (let i = 0; i < plan.length; i++) {
            const segmentIndex = plan.getSegmentIndex(i);
            const segment = plan.getSegment(segmentIndex);
            const segmentLegIndex = i - segment.offset;
            const leg = segment.legs[segmentLegIndex];
            if (leg.leg.fixIcao === facility.icao && this.fms.canDirectTo(segmentIndex, segmentLegIndex)) {
              this.directToExistingData = {
                segmentIndex,
                segmentLegIndex,
                icao: facility.icao
              };
            }
          }
        }
      }
    }
    this.directToExistingLegDefinition = null;
    this.store.waypoint.set(waypoint);
    this.syncCourseInput();

    const canActivate = !!facility;
    this.canActivate.set(canActivate);

    if (canActivate && this.goToActivateOnWaypoint) {
      this.goToActivateFunc();
    }

    this.goToActivateOnWaypoint = false;
  }

  /**
   * Syncs the course input value with the bearing to the selected waypoint.
   */
  private syncCourseInput(): void {
    const bearing = this.store.waypointInfoStore.bearing.get().asUnit(GnsDirectToController.BEARING_MAGNETIC);
    let input = 0;

    if (!isNaN(bearing)) {
      input = 360 - (360 - Math.round(bearing) % 360) % 360;
    }

    this.store.courseInputValue.set(input);
    this.store.course.set(undefined);
  }

  /**
   * Responds to Enter button press events from the waypoint input.
   */
  private onInputEnterPressed(): void {
    const matchedWaypoints = this.store.matchedWaypoints;

    if (matchedWaypoints.length > 1) {
      const matchedIcaos = this.store.matchedIcaos;

      ViewService.resolveDups(ICAO.getIdent(matchedIcaos[0]).trim(), matchedIcaos).then((facility) => {
        this.onWptDupDialogAccept(facility);
      });
    } else {
      this.goToActivateFunc();
    }
  }

  /**
   * Responds to accept events from the waypoint duplicate dialog.
   * @param facility The facility returned by the waypoint duplicate dialog.
   */
  private onWptDupDialogAccept(facility: Facility | null): void {
    if (!facility) {
      return;
    }

    if (this.inputIcao.get() === facility.icao) {
      // If the selected waypoint is equal to the disambiguated waypoint, force notify the waypoint input control
      // (otherwise it will not think disambiguation has occurred) then manually select the activate button since
      // the onWaypointChanged callback won't be called.
      this.inputIcao.notify();
    } else {
      this.inputIcao.set(facility.icao);
    }

    this.goToActivateFunc();
  }

  /**
   * Activates a Direct To to the selected waypoint.
   */
  public activateSelected(): void {
    const selectedWaypoint = this.store.waypoint.get();
    const facility = selectedWaypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(selectedWaypoint) ? selectedWaypoint.facility.get() : null;
    const course = this.store.course.get();
    const segmentIndex = this.directToExistingData?.segmentIndex;
    const segmentLegIndex = this.directToExistingData?.segmentLegIndex;

    const activate = (): void => {
      if (segmentIndex !== undefined && segmentLegIndex !== undefined) {
        this.fms.createDirectToExisting(segmentIndex, segmentLegIndex, course);
      } else {
        facility !== null && this.fms.createDirectToRandom(facility, course);
      }
    };

    if (this.obsState.get() === ObsSuspModes.OBS) {
      this.awaitObsCancel().then(() => {
        activate();
      });
    } else {
      activate();
    }
  }

  /**
   * Awaits the cancellation of OBS to activate a direct to.
   * @returns A promise when the obs has been deactivated.
   */
  private async awaitObsCancel(): Promise<void> {
    SimVar.SetSimVarValue('K:GPS_OBS_OFF', 'number', 0);
    this.fms.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', false);
    return new Promise(resolve => {
      const sub = this.fms.bus.getSubscriber<NavEvents>().on('gps_obs_active').whenChanged().handle(isActive => {
        if (!isActive) {
          sub.destroy();
          resolve();
        }
      }, true);
      sub.resume(true);
    });
  }

  /**
   * Creates a direct to existing data object for a flight plan leg.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns A direct to existing data object.
   */
  protected static createDtoExistingData(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): DirectToExistingData {
    return {
      icao: plan.getSegment(segmentIndex).legs[segmentLegIndex].leg.fixIcao,
      segmentIndex,
      segmentLegIndex
    };
  }
}