import { BitFlags, FlightPlan, FlightPlanSegment, FlightPlanUtils, LegDefinition, LegDefinitionFlags, LegType, MathUtils, VerticalFlightPlan, VNavConstraint, VNavUtils } from '@microsoft/msfs-sdk';
import { FmsUtils } from '../flightplan/FmsUtils';
import { GarminTodBodDetails } from './GarminVerticalNavigation';

/**
 * A utility class for working with Garmin VNAV.
 */
export class GarminVNavUtils {
  /**
   * Checks if a lateral flight plan leg is eligible for VNAV.
   * @param lateralLeg A lateral flight plan leg.
   * @returns Whether the specified leg is eligible for VNAV.
   */
  public static isLegVNavEligible(lateralLeg: LegDefinition): boolean {
    switch (lateralLeg.leg.type) {
      case LegType.HA:
      case LegType.HF:
      case LegType.HM:
      case LegType.PI:
      case LegType.VM:
      case LegType.FM:
      case LegType.Discontinuity:
      case LegType.ThruDiscontinuity:
        return false;
      default:
        return true;
    }
  }

  /**
   * Checks whether an altitude constraint defined for a lateral flight plan leg should be used for VNAV.
   * @param lateralPlan The lateral flight plan that hosts the altitude constraint.
   * @param lateralLeg The lateral flight plan leg that hosts the altitude constraint.
   * @param globalLegIndex The global index of the lateral flight plan leg that hosts the altitude constraint.
   * @param segment The lateral flight plan segment containing the flight plan leg that hosts the altitude constraint.
   * @param segmentLegIndex The index of the lateral flight plan leg that hosts the altitude constraint in its
   * containing segment.
   * @returns Whether the altitude constraint defined for the specified lateral flight plan leg should be used for
   * VNAV.
   */
  public static shouldUseConstraint(lateralPlan: FlightPlan, lateralLeg: LegDefinition, globalLegIndex: number, segment: FlightPlanSegment, segmentLegIndex: number): boolean {
    // Never use the constraint from the first flight plan leg.
    if (globalLegIndex === 0) {
      return false;
    }

    // Never use constraints from legs prior to an on-route direct-to.
    if (
      segment.segmentIndex < lateralPlan.directToData.segmentIndex
      || (segment.segmentIndex === lateralPlan.directToData.segmentIndex && segmentLegIndex < lateralPlan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET)
    ) {
      return false;
    }

    // Always use the constraint on an on-route direct-to leg.
    if (
      BitFlags.isAll(lateralLeg.flags, LegDefinitionFlags.DirectTo)
      && lateralPlan.directToData.segmentIndex === segment.segmentIndex
      && lateralPlan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET === segmentLegIndex) {
      return true;
    }

    // Always use the constraint on a VTF faf leg.
    if (BitFlags.isAll(lateralLeg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      return true;
    }

    // Never use constraints from legs that immediately follow a discontinuity.
    const prevLeg = lateralPlan.getLeg(globalLegIndex - 1);
    if (FlightPlanUtils.isDiscontinuityLeg(prevLeg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(prevLeg.leg.type)) {
      return false;
    }

    return true;
  }

  /**
   * A function which checks whether a climb constraint should be invalidated.
   * @param constraint A descent constraint.
   * @param index The index of the constraint to check if it is already in the vertical flight plan. If the constraint
   * is not already in the vertical flight plan (i.e. the constraint has been previously invalidated), then this value
   * equals `-(index + 1)` where `index` is the index at which the constraint would appear in the vertical flight plan
   * if it were included.
   * @param constraints The array of VNAV constraints currently in the vertical flight plan.
   * @param firstDescentConstraintIndex The index of the first descent constraint in the vertical flight plan, if one
   * exists.
   * @param priorMinAltitude The most recent minimum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * constraints of the same category (climb or missed approach) are included.
   * @param priorMaxAltitude The most recent maximum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * constraints of the same category (climb or missed approach) are included.
   * @returns Whether the specified climb constraint should be invalidated.
   */
  public static invalidateClimbConstraint(
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    firstDescentConstraintIndex: number,
    priorMinAltitude: number,
    priorMaxAltitude: number
  ): boolean {
    if (constraint.type === 'climb' && firstDescentConstraintIndex >= 0 && index < firstDescentConstraintIndex) {
      return true;
    }

    if (isFinite(constraint.minAltitude) &&
      isFinite(priorMinAltitude) && MathUtils.round(constraint.minAltitude, 10) < MathUtils.round(priorMinAltitude, 10)
    ) {
      return true;
    }

    if (isFinite(constraint.maxAltitude) && (
      (isFinite(priorMinAltitude) && MathUtils.round(constraint.maxAltitude, 10) < MathUtils.round(priorMinAltitude, 10))
      || (isFinite(priorMaxAltitude) && MathUtils.round(constraint.maxAltitude, 10) < MathUtils.round(priorMaxAltitude, 10))
    )) {
      return true;
    }

    return false;
  }

  /**
   * A function which checks whether a descent constraint should be invalidated.
   * @param constraint A descent constraint.
   * @param index The index of the constraint to check if it is already in the vertical flight plan. If the constraint
   * is not already in the vertical flight plan, then this value equals `-(index + 1)`
   * if it is not, where `index`.
   * @param constraints The array of VNAV constraints currently in the vertical flight plan.
   * @param priorMinAltitude The most recent minimum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param priorMaxAltitude The most recent maximum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param requiredFpa The minimum flight path angle, in degrees, required to meet the maximum altitude of the
   * constraint to check, assuming a descent starting from the constraint defining the most recent prior minimum
   * altitude. Positive values indicate a descending path. If there is no required FPA because there is no defined
   * prior minimum altitude or maximum altitude for the constraint to check, or if the constraint to check is higher
   * than the prior minimum altitude, then this value will equal zero.
   * @param maxFpa The maximum allowed flight path angle, in degrees. Positive values indicate a descending path.
   * @returns Whether the specified descent constraint should be invalidated.
   */
  public static invalidateDescentConstraint(
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    priorMinAltitude: number,
    priorMaxAltitude: number,
    requiredFpa: number,
    maxFpa: number
  ): boolean {
    if (isFinite(constraint.minAltitude) && (
      (isFinite(priorMinAltitude) && MathUtils.round(constraint.minAltitude, 10) > MathUtils.round(priorMinAltitude, 10))
      || (isFinite(priorMaxAltitude) && MathUtils.round(constraint.minAltitude, 10) > MathUtils.round(priorMaxAltitude, 10))
    )) {
      return true;
    }

    if (isFinite(constraint.maxAltitude) &&
      isFinite(priorMaxAltitude) && MathUtils.round(constraint.maxAltitude, 10) > MathUtils.round(priorMaxAltitude, 10)
    ) {
      return true;
    }

    return requiredFpa > maxFpa;
  }

  /**
   * Gets the VNAV TOD/BOD details for a vertical flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the airplane's
   * position, in meters.
   * @param currentAltitude The current indicated altitude in meters.
   * @param currentVS The current vertical speed in meters per minute.
   * @param out The object to which to write the TOD/BOD details.
   * @returns The VNAV TOD/BOD details.
   */
  public static getTodBodDetails(
    verticalPlan: VerticalFlightPlan,
    activeConstraintIndex: number,
    activeLegIndex: number,
    distanceAlongLeg: number,
    currentAltitude: number,
    currentVS: number,
    out: GarminTodBodDetails
  ): GarminTodBodDetails {

    out.todLegIndex = -1;
    out.bodLegIndex = -1;
    out.todLegDistance = 0;
    out.distanceFromTod = 0;
    out.distanceFromBod = 0;
    out.bodConstraintIndex = -1;
    out.todConstraintIndex = -1;

    const activeConstraint = verticalPlan.constraints[activeConstraintIndex] as VNavConstraint | undefined;

    // There is no TOD/BOD if...
    if (
      // ... there is no active VNAV constraint.
      !activeConstraint
      // ... the active constraint contains a VNAV-ineligible leg after the active leg.
      || (activeConstraint?.nextVnavEligibleLegIndex !== undefined && activeConstraint.nextVnavEligibleLegIndex > activeLegIndex)
    ) {
      return out;
    }

    // Find the next BOD, which will be at the end of the earliest non-flat descent constraint subsequent to and
    // including the active constraint that ends in a level-off at a lower altitude than the aircraft's current
    // altitude. Note that we are guaranteed to not go through a VNAV discontinuity, since all constraints that end in
    // a discontinuity also end in a level-off.

    // lag altitude by ~3 seconds so that we aren't continuously pushing TOD in front of the plane while descending.
    const altitude = currentAltitude - currentVS / 20;

    let bodConstraintIndex = -1;
    let bodConstraint: VNavConstraint | undefined;
    for (let i = activeConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];

      // If we encounter a climb constraint, skip it.
      if (constraint.type === 'climb' || constraint.type === 'missed') {
        continue;
      }

      if (constraint.fpa > 0 && constraint.legs[0]?.isBod && constraint.targetAltitude <= altitude) {
        bodConstraintIndex = i;
        bodConstraint = constraint;
        break;
      }
    }

    if (!bodConstraint) {
      return out;
    }

    out.bodConstraintIndex = bodConstraintIndex;
    out.bodLegIndex = bodConstraint.index;

    // Find the TOD associated with the BOD. To do this, we need to first find the earliest non-flat descent constraint
    // between the active constraint and the BOD constraint (inclusive) that is connected to the BOD constraint with no
    // intervening flat constraints or VNAV path discontinuities and whose target altitude is less than the aircraft's
    // current altitude.

    let todConstraintIndex = bodConstraintIndex;

    for (let i = todConstraintIndex; i < verticalPlan.constraints.length; i++) {
      const prevConstraint = verticalPlan.constraints[i + 1];
      if (
        !prevConstraint
        || prevConstraint.index < activeLegIndex
        || prevConstraint.type === 'climb'
        || prevConstraint.type === 'missed'
        || prevConstraint.targetAltitude > altitude
        || prevConstraint.fpa <= 0
        || prevConstraint.isPathEnd
      ) {
        todConstraintIndex = i;
        break;
      }
    }

    out.todConstraintIndex = todConstraintIndex;
    const todConstraint = verticalPlan.constraints[todConstraintIndex];

    // Now that we have found the TOD constraint, we need to find the TOD leg: the leg on which the TOD actually lies.
    // To do this, we calculate the along-track distance from the end of the TOD constraint to the TOD, then iterate
    // through the legs in the constraint backwards while keeping track of the total along-track distance covered by
    // each leg.

    let distance = VNavUtils.distanceForAltitude(todConstraint.fpa, altitude - todConstraint.targetAltitude);
    let constraintIndex = todConstraintIndex;
    let todLegIndex = todConstraint.index;
    let todLegDistance = 0;
    let todLeg = todConstraint.legs[0];
    while (distance > 0 && constraintIndex < verticalPlan.constraints.length) {
      const constraint = verticalPlan.constraints[constraintIndex];

      // Remember that flight plan legs in a VNAV constraint appear in reverse order relative to how they are ordered
      // in the flight plan.
      for (let i = 0; i < constraint.legs.length; i++) {
        if (!constraint.legs[i].isEligible) {
          // We've encounted a VNAV-ineligible leg. Since we cannot calculate a vertical path through this leg, we have
          // to stop iterating now so that the TOD gets set to the most recent VNAV-eligible leg.
          constraintIndex = verticalPlan.constraints.length;
          break;
        }

        todLeg = constraint.legs[i];
        distance -= todLeg.distance;
        if (distance <= 0) {
          todLegIndex = constraint.index - i;
          todLegDistance = todLeg.distance + distance;
          break;
        }
      }

      constraintIndex++;
    }

    if (distance > 0) {
      // If we still haven't found the TOD yet, set it to the beginning of the earliest VNAV leg that was iterated.
      todLegIndex = verticalPlan.segments[todLeg.segmentIndex].offset + todLeg.legIndex;
      todLegDistance = todLeg.distance;
    }

    out.todLegIndex = todLegIndex;
    out.todLegDistance = todLegDistance;

    // calculate distance to TOD/BOD

    let globalLegIndex = bodConstraint.index;
    let distanceToBOD = 0, distanceToTOD = 0;
    let hasReachedTOD = false;
    let isDone = false;
    for (let i = bodConstraintIndex as number; i < verticalPlan.constraints.length; i++) {
      const constraint = verticalPlan.constraints[i];
      for (let j = 0; j < constraint.legs.length; j++) {
        const leg = constraint.legs[j];

        if (globalLegIndex === todLegIndex) {
          distanceToTOD -= todLegDistance;
          hasReachedTOD = true;
        }

        if (globalLegIndex > activeLegIndex) {
          distanceToBOD += leg.distance;
          if (hasReachedTOD) {
            distanceToTOD += leg.distance;
          }
        } else if (globalLegIndex === activeLegIndex) {
          distanceToBOD += leg.distance - distanceAlongLeg;

          if (hasReachedTOD) {
            distanceToTOD += leg.distance - distanceAlongLeg;
            isDone = true;
          } else {
            distanceToTOD -= distanceAlongLeg;
          }
        } else {
          if (hasReachedTOD) {
            isDone = true;
          } else {
            distanceToTOD -= leg.distance;
          }
        }

        if (isDone) {
          break;
        } else {
          globalLegIndex--;
        }
      }

      if (isDone) {
        break;
      }
    }

    out.distanceFromBod = distanceToBOD;
    out.distanceFromTod = distanceToTOD;

    return out;
  }

  /**
   * Gets the along-track distance, in meters, from a point along the flight plan to the end of a VNAV constraint.
   * @param verticalPlan The vertical flight plan.
   * @param constraintIndex The index of the VNAV constraint to calculate the distance to.
   * @param globalLegIndex The global index of the flight plan leg along which the point to check lies.
   * @param distanceAlongLeg The distance, in meters, from the start of the flight plan leg to the point to check.
   * @returns The along-track distance, in meters, from the specified point to the end of the VNAV constraint.
   */
  public static getDistanceToConstraint(verticalPlan: VerticalFlightPlan, constraintIndex: number, globalLegIndex: number, distanceAlongLeg: number): number {
    const currentConstraintIndex = constraintIndex;
    const currentConstraint = verticalPlan.constraints[currentConstraintIndex];

    if (currentConstraint === undefined) {
      return 0;
    }

    const constraintLegIndex = currentConstraint.index;

    const startIndex = Math.min(constraintLegIndex + 1, globalLegIndex);
    const endIndex = Math.max(constraintLegIndex, globalLegIndex - 1) + 1;

    let distance = 0;
    for (let i = 0; i < verticalPlan.segments.length; i++) {
      const segment = verticalPlan.segments[i];
      const end = Math.min(segment.legs.length, endIndex - segment.offset);
      for (let j = Math.max(0, startIndex - segment.offset); j < end; j++) {
        const leg = segment.legs[j];

        distance += leg.distance * (segment.offset + j < globalLegIndex ? -1 : 1);
      }
    }

    distance -= distanceAlongLeg;

    return distance;
  }

  /**
   * Gets the desired altitude, in meters, along a descent path at a specific point.
   * @param verticalPlan The vertical flight plan.
   * @param pathConstraintIndex The index of the VNAV constraint defining the descent path.
   * @param distance The distance, in meters, from the point to check to the end of the VNAV constraint defining the
   * descent path.
   */
  public static getPathDesiredAltitude(
    verticalPlan: VerticalFlightPlan,
    pathConstraintIndex: number,
    distance: number
  ): number;
  /**
   * Gets the desired altitude, in meters, along a descent path at a specific point.
   * @param verticalPlan The vertical flight plan.
   * @param pathConstraintIndex The index of the VNAV constraint defining the descent path.
   * @param globalLegIndex The global index of the flight plan leg along which the point to check lies.
   * @param distanceAlongLeg The distance, in meters, from the start of the flight plan leg to the point to check.
   * @returns The desired altitude, in meters, along the descent path at the specified point.
   */
  public static getPathDesiredAltitude(
    verticalPlan: VerticalFlightPlan,
    pathConstraintIndex: number,
    globalLegIndex: number,
    distanceAlongLeg: number
  ): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getPathDesiredAltitude(
    verticalPlan: VerticalFlightPlan,
    pathConstraintIndex: number,
    arg3: number,
    arg4?: number
  ): number {
    const pathConstraint = verticalPlan.constraints[pathConstraintIndex];
    const distance = arg4 === undefined
      ? arg3
      : GarminVNavUtils.getDistanceToConstraint(verticalPlan, pathConstraintIndex, arg3, arg4);

    return pathConstraint.targetAltitude
      + VNavUtils.altitudeForDistance(pathConstraint.fpa, distance);
  }
}