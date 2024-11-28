import { BitFlags, FacilityType, FlightPlan, ICAO, LegDefinitionFlags, LegType } from '@microsoft/msfs-sdk';
import { GnsVnavRefLegOption } from './GnsVnavEvents';
import { GnsVnavRefMode, GnsVnavTargetAltitudeMode } from './GnsVnavSettings';

const VALID_LEG_TYPES = [
  LegType.AF,
  LegType.CF,
  LegType.DF,
  LegType.IF,
  LegType.RF,
  LegType.TF,
];

/**
 * Utils for GNS VNAV
 */
export class GnsVnavUtils {
  /**
   * Returns an array of leg valid as references for GNS VNAV
   *
   * @param plan the flight plan
   *
   * @returns array of {@link GnsVnavRefLegOption} objects
   */
  public static getAvailableRefLegs(plan: FlightPlan): GnsVnavRefLegOption[] {
    const legs = [];

    const fromIndex = Math.max(0, plan.activeLateralLeg - 1);

    for (let i = fromIndex; i < plan.length; i++) {
      const leg = plan.tryGetLeg(i);

      if (!leg) {
        continue;
      }

      const isLegValid = this.isLegValidAsVnavTarget(i, null, plan);

      if (isLegValid) {
        legs.push({ index: i, ident: leg.name ?? '' });
      }
    }

    return legs;
  }

  /**
   * Returns if a leg at an index along a flight plan is a valid target leg for VNAV
   *
   * @param legIndex           the leg index
   * @param targetAltitudeMode the target altitude mode being used
   * @param plan               the flight plan
   *
   * @returns boolean
   *
   * @throws if the leg is null
   */
  public static isLegValidAsVnavTarget(legIndex: number, targetAltitudeMode: GnsVnavTargetAltitudeMode | null, plan: FlightPlan): boolean {
    const leg = plan.tryGetLeg(legIndex);

    if (!leg) {
      throw new Error('GNS VNAV: Leg was null');
    }

    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
      return false;
    }

    const type = leg.leg.type;

    const validType = VALID_LEG_TYPES.includes(type);

    if (!validType) {
      return false;
    }

    if (!leg.leg.fixIcao || leg.leg.fixIcao === ICAO.emptyIcao) {
      return false;
    }

    if (targetAltitudeMode !== GnsVnavTargetAltitudeMode.Agl || targetAltitudeMode === null) {
      return true;
    }

    const isAirport = this.isLegFixAirport(legIndex, plan);

    if (!isAirport) {
      return false;
    }

    return true;
  }

  /**
   * Returns whether a leg at an index along a flight plan has an airport on its `fixIcao`
   *
   * @param legIndex the leg index
   * @param plan     the flight plan
   *
   * @returns a boolean
   *
   * @throws if the leg is null
   */
  public static isLegFixAirport(legIndex: number, plan: FlightPlan): boolean {
    const leg = plan.tryGetLeg(legIndex);

    if (!leg) {
      throw new Error('GNS VNAV: Leg was null');
    }

    if (!leg.leg.fixIcao || leg.leg.fixIcao === ICAO.emptyIcao) {
      return false;
    }

    return ICAO.getFacilityType(leg.leg.fixIcao) === FacilityType.Airport;
  }

  /**
   * Gets the constraint on ref mode for a particular leg index
   *
   * @param legIndex the leg index
   * @param plan     the flight plan
   *
   * @returns a ref mode is it is constrained, `null` otherwise
   */
  public static getLegRefModeConstraint(legIndex: number, plan: FlightPlan): GnsVnavRefMode | null {
    if (legIndex === 0) {
      return GnsVnavRefMode.After;
    }

    if (legIndex === plan.length - 1) {
      return GnsVnavRefMode.Before;
    }

    return null;
  }

  /**
   * Returns the cumulative distance of a leg at an index along a flight plan
   *
   * @param legIndex the leg index
   * @param plan     the flight plan
   *
   * @returns distance in metres
   *
   * @throws if the leg or leg calculated is null
   */
  public static getLegWaypointCumulativeDistance(legIndex: number, plan: FlightPlan): number {
    const leg = plan.tryGetLeg(legIndex);

    if (!leg || !leg.calculated) {
      throw new Error('GNS VNAV: Leg or leg calculated was null');
    }

    return leg.calculated?.cumulativeDistanceWithTransitions;
  }

  /**
   * Returns the distance of a leg at an index along a flight plan
   *
   * @param legIndex the leg index
   * @param plan     the flight plan
   *
   * @returns distance in metres
   *
   * @throws if the leg or leg calculated is null
   */
  public static getLegWaypointDistance(legIndex: number, plan: FlightPlan): number {
    const leg = plan.tryGetLeg(legIndex);

    if (!leg || !leg.calculated) {
      throw new Error('GNS VNAV: Leg or leg calculated was null');
    }

    return leg.calculated?.distanceWithTransitions;
  }
}