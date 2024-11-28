import { FacilityRepository, FacilityType, FacilityWaypoint, ICAO, IcaoValue, SubscribableArray, UserFacility } from '@microsoft/msfs-sdk';

import { Fms, FmsUtils } from '@microsoft/msfs-garminsdk';

/**
 * Flight plan inclusion status of a user waypoint.
 */
export enum UserWaypointFlightPlanStatus {
  /** The user waypoint is not in any flight plan. */
  None = 'None',

  /** The user waypoint is in at least one flight plan. */
  InFlightPlan = 'InFlightPlan',

  /** The user waypoint is part of the active leg or the nominal from leg of the active leg. */
  ActiveLeg = 'ActiveLeg'
}

/**
 * A controller for editing user waypoints.
 */
export class GtcUserWaypointEditController {

  /** The maximum number of user waypoints allowed to exist at once. */
  public static readonly MAX_WAYPOINT_COUNT = 1000;

  /**
   * Creates a new instance of GtcUserWaypointEditController.
   * @param facRepo The facility repository.
   * @param fms The FMS.
   * @param existingWaypointsArray An array that contains all existing user waypoints.
   */
  public constructor(
    private readonly facRepo: FacilityRepository,
    private readonly fms: Fms,
    private readonly existingWaypointsArray: SubscribableArray<FacilityWaypoint<UserFacility>>
  ) {
  }

  /**
   * Gets the number of existing user waypoints.
   * @returns The number of existing user waypoints.
   */
  public getUserWaypointCount(): number {
    return this.existingWaypointsArray.length;
  }

  /**
   * Checks whether the number of existing user waypoints is at or above the allowed limit.
   * @returns Whether the number of existing user waypoints is at or above the allowed limit.
   */
  public isUserWaypointCountAtLimit(): boolean {
    return this.getUserWaypointCount() >= GtcUserWaypointEditController.MAX_WAYPOINT_COUNT;
  }

  /**
   * Checks whether a user waypoint with a given ICAO exists.
   * @param icao The ICAO to check.
   * @returns Whether a user waypoint with the specified ICAO exists.
   */
  public doesUserWaypointExist(icao: IcaoValue): boolean {
    if (!ICAO.isValueFacility(icao, FacilityType.USR)) {
      return false;
    }

    return this.facRepo.get(icao) !== undefined;
  }

  /**
   * Gets the flight plan inclusion status of a waypoint: whether it is not in any flight plan, in at least one flight
   * plan, or is part of the active leg.
   * @param icao The ICAO to check.
   * @returns The flight plan inclusion status of the waypoint with the specified ICAO.
   */
  public getWaypointFlightPlanStatus(icao: IcaoValue): UserWaypointFlightPlanStatus {
    if (ICAO.isValueEmpty(icao)) {
      return UserWaypointFlightPlanStatus.None;
    }

    const dtoIcao = this.fms.getDirectToTargetIcaoValue();
    if (dtoIcao && ICAO.valueEquals(dtoIcao, icao)) {
      return UserWaypointFlightPlanStatus.ActiveLeg;
    }

    if (this.fms.hasPrimaryFlightPlan()) {
      // Note that because user waypoints can only be part of legs added by the user (which can only be TF or DF),
      // we only need to check the fixIcao property of the leg and not originIcao.

      const plan = this.fms.getPrimaryFlightPlan();
      const activeLeg = plan.tryGetLeg(plan.activeLateralLeg);

      if (activeLeg !== null) {
        if (ICAO.valueEquals(activeLeg.leg.fixIcaoStruct, icao)) {
          return UserWaypointFlightPlanStatus.ActiveLeg;
        }

        const activeLegSegment = plan.getSegmentFromLeg(activeLeg);

        if (activeLegSegment !== null) {
          const fromLeg = FmsUtils.getNominalFromLeg(plan, activeLegSegment.segmentIndex, activeLegSegment.legs.indexOf(activeLeg));
          if (fromLeg && ICAO.valueEquals(fromLeg.leg.fixIcaoStruct, icao)) {
            return UserWaypointFlightPlanStatus.ActiveLeg;
          }
        }
      }

      for (const leg of plan.legs()) {
        if (ICAO.valueEquals(leg.leg.fixIcaoStruct, icao)) {
          return UserWaypointFlightPlanStatus.InFlightPlan;
        }
      }
    }

    return UserWaypointFlightPlanStatus.None;
  }

  /**
   * Adds a new user waypoint facility. If a facility with the same ICAO as the new one already exists, it will be
   * replaced by the new facility.
   * @param facility The facility to add.
   */
  public addUserFacility(facility: UserFacility): void {
    this.facRepo.add(facility);
  }

  /**
   * Edits an existing user waypoint facility. If facility to edit does not exist, then this method does nothing. If
   * the edit involves changing the ICAO of the facility, the old facility will be removed and a new facility will be
   * added with the new ICAO. Otherwise, the new facility will replace the old facility.
   * @param icao The ICAO of the existing facility to edit.
   * @param facility A facility to edit the existing one to.
   * @returns Whether the existing facility was successfully edited.
   */
  public editUserFacility(icao: IcaoValue, facility: UserFacility): boolean {
    const editedFacility = this.facRepo.get(icao);

    if (editedFacility === undefined) {
      return false;
    }

    if (!ICAO.valueEquals(editedFacility.icaoStruct, facility.icaoStruct)) {
      this.facRepo.remove(icao);
    }

    this.facRepo.add(facility);

    return true;
  }

  /**
   * Removes an existing user waypoint facility.
   * @param icao The ICAO of the facility to remove.
   */
  public removeUserFacility(icao: IcaoValue): void {
    this.facRepo.remove(icao);
  }

  /**
   * Removes all existing user waypoint facilities.
   * @param includeInFlightPlan Whether to remove user waypoint facilities that are in flight plans. Defaults to
   * `false`.
   * @returns Whether at least one user waypoint facility was not removed because it was in a flight plan.
   */
  public removeAllUserFacilities(includeInFlightPlan = false): boolean {
    const flightPlanIcaos = new Set<string>();

    if (!includeInFlightPlan) {
      const dtoTargetIcao = this.fms.getDirectToTargetIcaoValue();
      if (dtoTargetIcao !== undefined && ICAO.isValueFacility(dtoTargetIcao, FacilityType.USR)) {
        flightPlanIcaos.add(ICAO.getUid(dtoTargetIcao));
      }

      if (this.fms.hasPrimaryFlightPlan()) {
        for (const leg of this.fms.getPrimaryFlightPlan().legs()) {
          if (ICAO.isValueFacility(leg.leg.fixIcaoStruct, FacilityType.USR)) {
            flightPlanIcaos.add(ICAO.getUid(leg.leg.fixIcaoStruct));
          }
        }
      }
    }

    let skipped = false;

    const toRemove: IcaoValue[] = [];
    for (const waypoint of this.existingWaypointsArray.getArray()) {
      const icao = waypoint.facility.get().icaoStruct;
      if (flightPlanIcaos.has(ICAO.getUid(icao))) {
        skipped ||= true;
      } else {
        toRemove.push(icao);
      }
    }

    this.facRepo.removeMultiple(toRemove);

    return skipped;
  }
}
