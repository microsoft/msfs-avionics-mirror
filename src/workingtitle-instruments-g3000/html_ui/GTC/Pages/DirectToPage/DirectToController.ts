/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BasicNavAngleUnit, Facility, FacilityUtils, FacilityWaypoint, FacilityWaypointUtils, FlightPlan, FlightPlanUtils, ICAO,
  LegDefinition, LegTurnDirection, MagVar, Subject, UnitType, Waypoint
} from '@microsoft/msfs-sdk';
import { DirectToState, Fms, FmsUtils, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';
import { DirectToExistingData, DirectToStore } from './DirectToStore';
import { HoldController } from '../HoldPage/HoldController';
import { HoldCourseDirection, HoldLegMode } from '../HoldPage/HoldStore';

/**
 * Data describing a direct-to target. The target can be a specific flight plan leg (defining an on-route direct-to),
 * an arbitrary waypoint, or undefined.
 */
export interface DirectToInputData {
  /**
   * The index of the flight plan segment containing the leg to which to target an on-route direct-to. Required to
   * define an on-route direct-to target.
   */
  segmentIndex?: number;

  /**
   * The index of the flight plan leg to which to target an on-route direct-to in its containing segment. Required to
   * define an on-route direct-to target.
   */
  segmentLegIndex?: number;

  /**
   * The waypoint facility to which to target a direct-to. Ignored if `segmentIndex` and `segmentLegIndex` are defined.
   */
  facility?: Facility;
}

/** The controller for the Direct To page. */
export class DirectToController {
  public readonly canActivate = Subject.create(false);

  private initializeIcao: string | null = null;

  private initializeTargetOpId = 0;

  /**
   * Creates an instance of direct to controller.
   * @param store This controller's associated direct to menu store.
   * @param fms The flight management system.
   * @param waypointCache The cache from which to retrieve facility waypoints.
   */
  constructor(
    private readonly store: DirectToStore,
    private readonly fms: Fms,
    private readonly waypointCache: GarminFacilityWaypointCache
  ) {
    this.store.waypoint.sub(this.onWaypointChanged.bind(this), true);
  }

  /**
   * Initializes the direct-to target based on input data. If the input data does not define a target, an attempt will
   * be made to set the target to the following, in order:
   * * The current active direct-to target.
   * * The current active flight plan leg.
   * * The next leg in the primary flight plan, following the active leg, that is a valid direct-to target.
   * * The previous leg in the primary flight plan, before the active leg, that is a valid direct-to target.
   * @param dtoData The input data.
   */
  public async initializeTarget(dtoData: DirectToInputData): Promise<void> {
    const opId = ++this.initializeTargetOpId;

    this.store.userCourseMagnetic.set(undefined);
    this.store.holdInfo.set(undefined);
    this.store.directToExistingData.set(null);

    const primaryPlan = this.fms.hasPrimaryFlightPlan() && this.fms.getPrimaryFlightPlan();
    let targetIcao: string | null = null;

    let leg: LegDefinition | undefined | null;
    let nextLeg: LegDefinition | undefined | null;

    if (primaryPlan && dtoData.segmentLegIndex !== undefined && dtoData.segmentIndex !== undefined) {
      // Input defines an on-route DTO target

      try {
        if (this.fms.canDirectTo(dtoData.segmentIndex, dtoData.segmentLegIndex)) {
          this.store.directToExistingData.set(DirectToController.createDtoExistingData(primaryPlan, dtoData.segmentIndex, dtoData.segmentLegIndex));
          leg = primaryPlan.tryGetLeg(dtoData.segmentIndex, dtoData.segmentLegIndex);
        } else {
          const searchResult = this.searchForValidDtoExistingLeg(dtoData.segmentIndex, dtoData.segmentLegIndex);
          this.store.directToExistingData.set(searchResult);
          if (searchResult) {
            leg = primaryPlan.tryGetLeg(searchResult.segmentIndex, searchResult.segmentLegIndex);
          }
        }
      } catch {
        // noop
      }
    } else {
      // Input does not define an on-route DTO target. If a target ICAO is provided, then try to match the ICAO with
      // the current DTO target or any leg in the primary flight plan. If a target ICAO is not provided, then simply
      // initialize to the current DTO target, or search for any valid on-route DTO target.

      const icao = dtoData.facility?.icao;
      targetIcao = icao ?? null;

      const dtoState = this.fms.getDirectToState();

      if (dtoState === DirectToState.TOEXISTING && primaryPlan) {
        const dtoLeg = primaryPlan.getLeg(primaryPlan.activeLateralLeg);
        if (!targetIcao || dtoLeg.leg.fixIcao === targetIcao) {
          leg = dtoLeg;
          this.store.directToExistingData.set({
            icao: leg.leg.fixIcao,
            segmentIndex: primaryPlan.directToData.segmentIndex,
            segmentLegIndex: primaryPlan.directToData.segmentLegIndex
          });
        }
      } else if (dtoState === DirectToState.TORANDOM) {
        const dtoPlan = this.fms.getDirectToFlightPlan();
        const dtoLeg = dtoPlan.getLeg(dtoPlan.activeLateralLeg);
        if (!targetIcao || dtoLeg.leg.fixIcao === targetIcao) {
          leg = dtoLeg;
          targetIcao = leg.leg.fixIcao;
          nextLeg = dtoPlan.tryGetLeg(dtoPlan.activeLateralLeg + 1);
        }
      }

      if (!leg && primaryPlan && primaryPlan.length > 0) {
        this.store.directToExistingData.set(this.searchForValidDtoExistingLeg(Math.min(primaryPlan.activeLateralLeg, primaryPlan.length - 1), icao));
      }
    }

    const dtoExistingData = this.store.directToExistingData.get();

    // If we are initialized to an on-route DTO target, attempt to get the leg after the DTO target.
    if (primaryPlan && dtoExistingData) {
      let nextLegOffset = 1;
      if (primaryPlan.directToData.segmentIndex === dtoExistingData.segmentIndex && primaryPlan.directToData.segmentLegIndex === dtoExistingData.segmentLegIndex) {
        nextLegOffset += FmsUtils.DTO_LEG_OFFSET;
      }

      nextLeg = primaryPlan.tryGetLeg(dtoExistingData.segmentIndex, dtoExistingData.segmentLegIndex + nextLegOffset);
    }

    // Load hold info if there is an existing hold leg for the current direct to
    if (nextLeg && FlightPlanUtils.isHoldLeg(nextLeg.leg.type) && leg?.leg.fixIcao === nextLeg.leg.fixIcao) {
      const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(nextLeg.leg.fixIcao), nextLeg.leg.fixIcao);

      if (opId !== this.initializeTargetOpId) {
        return;
      }

      const magVar = FacilityUtils.getMagVar(facility);

      this.store.holdInfo.set({
        course: BasicNavAngleUnit.create(true, magVar).createNumber(nextLeg.leg.course),
        legDistance: UnitType.METER.createNumber(nextLeg.leg.distanceMinutes ? NaN : nextLeg.leg.distance),
        legTime: UnitType.MINUTE.createNumber(nextLeg.leg.distanceMinutes ? nextLeg.leg.distance : NaN),
        // No way to tell if inbound or outbound, so default to inbound,
        holdCourseDirection: HoldCourseDirection.Inbound,
        legMode: nextLeg.leg.distanceMinutes ? HoldLegMode.Time : HoldLegMode.Distance,
        turnDirection: nextLeg.leg.turnDirection === LegTurnDirection.Left ? LegTurnDirection.Left : LegTurnDirection.Right,
        existingHoldLeg: nextLeg,
      });
    }

    if (dtoExistingData) {
      targetIcao = dtoExistingData.icao;
    }

    let waypoint: FacilityWaypoint | null = null;

    if (targetIcao !== null) {
      if (targetIcao === dtoData.facility?.icao) {
        waypoint = this.waypointCache.get(dtoData.facility);
      } else {
        const fac = await this.fms.facLoader.getFacility(ICAO.getFacilityType(targetIcao), targetIcao);

        if (opId !== this.initializeTargetOpId) {
          return;
        }

        waypoint = this.waypointCache.get(fac);
      }
    }

    this.initializeIcao = targetIcao;
    this.store.waypoint.set(waypoint);

    if (this.store.waypoint.get() !== waypoint) {
      return;
    }

    this.syncAutoCourseValue();

    this.canActivate.set(!!waypoint);
  }

  /**
   * Searches for a valid Direct To Existing target in the primary flight plan that matches an optional ICAO, starting
   * from a specified flight plan leg. The search begins with the specified leg, then proceeds forwards in the plan. If
   * no valid leg is found, the search then returns to the leg immediately prior to the specified leg and proceeds
   * backwards in the plan.
   * @param segmentIndex The index of the segment that contains the starting leg.
   * @param segmentLegIndex The index of the starting leg in its segment.
   * @param targetIcao The ICAO of the desired Direct To target fix. If not defined, the chosen target fix does not
   * have to match any particular ICAO.
   * @returns A Direct To Existing data object describing the chosen target, or `null` if a valid target could not be
   * found.
   */
  private searchForValidDtoExistingLeg(segmentIndex: number, segmentLegIndex: number, targetIcao?: string): DirectToExistingData | null;
  /**
   * Searches for a valid Direct To Existing target in the primary flight plan, starting from a specified flight plan
   * leg. The search begins with the specified leg, then proceeds forwards in the plan. If no valid leg is found, the
   * search then returns to the leg immediately prior to the specified leg and proceeds backwards in the plan.
   * @param legIndex The global index of the starting leg.
   * @param targetIcao The ICAO of the desired Direct To target fix. If not defined, the chosen target fix does not
   * have to match any particular ICAO.
   * @returns A Direct To Existing data object describing the chosen target, or `null` if a valid target could not be
   * found.
   */
  private searchForValidDtoExistingLeg(legIndex: number, targetIcao?: string): DirectToExistingData | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  private searchForValidDtoExistingLeg(arg1: number, arg2?: number | string, arg3?: string): DirectToExistingData | null {
    const plan = this.fms.getPrimaryFlightPlan();
    const legIndex = typeof arg2 === 'number'
      ? plan.getSegment(arg1).offset + arg2
      : arg1;

    const targetIcao = typeof arg2 === 'number' ? arg3 : arg2;

    // search forwards in plan
    const len = plan.length;
    for (let i = legIndex; i < len; i++) {
      const currSegmentIndex = plan.getSegmentIndex(i);
      const currSegment = plan.getSegment(currSegmentIndex);
      const currSegmentLegIndex = i - currSegment.offset;
      if ((!targetIcao || targetIcao === currSegment.legs[currSegmentLegIndex].leg.fixIcao) && this.fms.canDirectTo(currSegmentIndex, currSegmentLegIndex)) {
        return DirectToController.createDtoExistingData(plan, currSegmentIndex, currSegmentLegIndex);
      }
    }

    // search backwards in plan
    for (let i = legIndex - 1; i >= 0; i--) {
      const currSegmentIndex = plan.getSegmentIndex(i);
      const currSegment = plan.getSegment(currSegmentIndex);
      const currSegmentLegIndex = i - currSegment.offset;
      if ((!targetIcao || targetIcao === currSegment.legs[currSegmentLegIndex].leg.fixIcao) && this.fms.canDirectTo(currSegmentIndex, currSegmentLegIndex)) {
        return DirectToController.createDtoExistingData(plan, currSegmentIndex, currSegmentLegIndex);
      }
    }

    return null;
  }

  /**
   * Responds to changes in the waypoint input's selected waypoint.
   * @param waypoint The selected waypoint.
   */
  private onWaypointChanged(waypoint: Waypoint | null): void {
    const facility = waypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(waypoint) ? waypoint.facility.get() : null;

    if ((this.initializeIcao === null && facility === null) || this.initializeIcao === facility?.icao) {
      return;
    }

    if (!facility) {
      this.initializeIcao = null;
      this.store.userCourseMagnetic.set(undefined);
      this.store.holdInfo.set(undefined);
      this.store.directToExistingData.set(null);

      this.syncAutoCourseValue();

      this.canActivate.set(false);
    } else if (facility.icao !== this.store.directToExistingData.get()?.icao) {
      this.initializeTarget({ facility: (waypoint as FacilityWaypoint).facility.get() });
    }
  }

  /**
   * Syncs this controller's store's automatically calculated course value with the bearing to the selected target
   * waypoint.
   */
  private syncAutoCourseValue(): void {
    const waypoint = this.store.waypoint.get();

    if (waypoint) {
      let magVar = 0;

      if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        magVar = FacilityUtils.getMagVar(waypoint.facility.get());
      } else {
        magVar = MagVar.get(waypoint.location.get());
      }

      let trueCourse = waypoint.location.get().bearingFrom(this.store.planePos.get());
      if (isNaN(trueCourse)) {
        trueCourse = 0;
      }

      this.store.autoCourseValue.set(MagVar.trueToMagnetic(trueCourse, magVar), magVar);
    } else {
      this.store.autoCourseValue.set(NaN, 0);
    }
  }

  /**
   * Creates and activates a direct-to to this controller's store's selected target waypoint.
   */
  public activateSelected(): void {
    const selectedWaypoint = this.store.waypoint.get();
    const facility = selectedWaypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(selectedWaypoint) ? selectedWaypoint.facility.get() : null;
    const course = this.store.userCourseMagnetic.get();
    if (facility) {
      const directToExistingData = this.store.directToExistingData.get();
      const holdInfo = this.store.holdInfo.get();
      if (directToExistingData) {
        const { segmentIndex, segmentLegIndex } = directToExistingData;
        const plan = this.fms.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const leg = plan.getLeg(segmentIndex, segmentLegIndex);
        this.fms.createDirectToExisting(segmentIndex, segmentLegIndex, course);
        // Creating a direct to will delete an existing direct to, so the leg index might change
        const newSegmentLegIndex = segment.legs.indexOf(leg);
        if (holdInfo) {
          HoldController.createAndInsertHold(this.fms, Fms.PRIMARY_PLAN_INDEX, holdInfo, facility.icaoStruct, segmentIndex, newSegmentLegIndex + 3);
        } else {
          // Delete hold leg if one exists
          // We delete it when holdInfo is empty, because if there is a hold leg, and holdInfo is empty,
          // then that means the user cancelled the hold in the hold page
          // 3 because it's a direct to original leg, then + 1 to get next leg
          const nextLegIndex = newSegmentLegIndex + 3 + 1;
          const nextLeg = plan.tryGetLeg(segmentIndex, nextLegIndex);
          if (nextLeg && FlightPlanUtils.isHoldLeg(nextLeg.leg.type) && nextLeg.leg.fixIcao === leg.leg.fixIcao) {
            this.fms.removeWaypoint(segmentIndex, nextLegIndex);
          }
        }
      } else {
        this.fms.createDirectToRandom(facility, course);
        if (holdInfo) {
          HoldController.createAndInsertHold(this.fms, Fms.DTO_RANDOM_PLAN_INDEX, holdInfo, facility.icaoStruct, 0, 2);
        }
      }
    }
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
      segmentLegIndex,
    };
  }
}