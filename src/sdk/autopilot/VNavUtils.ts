import { FlightPlan, FlightPlanLegIterator, FlightPlanUtils, LegDefinition, SpeedConstraint } from '../flightplan';
import { BitFlags, UnitType } from '../math';
import { AltitudeRestrictionType, FixTypeFlags, LegType } from '../navigation';
import { TodBodDetails, VerticalFlightPlan, VNavConstraint, VNavLeg, VNavPlanSegment, AltitudeConstraintDetails, SpeedConstraintDetails, TocBocDetails } from './VerticalNavigation';

/**
 * A Utility Class for VNAV
 */
export class VNavUtils {

  /**
   * Checks if a constraint is a user-created constraint.
   * @param lateralLeg The Lateral Flight Plan Leg.
   * @returns If this constraint is a user-created constraint.
   */
  public static isUserConstraint(lateralLeg: LegDefinition): boolean {
    if (lateralLeg.verticalData.altDesc !== lateralLeg.leg.altDesc
      || lateralLeg.verticalData.altitude1 !== lateralLeg.leg.altitude1
      || lateralLeg.verticalData.altitude2 !== lateralLeg.leg.altitude2) {
      return true;
    }
    return false;
  }

  /**
   * Gets the required vertical speed to meet an altitude constraint.
   * @param distance The distance to the constraint, in nautical miles.
   * @param targetAltitude The target altitude for the constraint, in feet.
   * @param currentAltitude The current altitude, in feet.
   * @param groundSpeed The current groundspeed, in knots.
   * @returns The required vertical speed, in feet per minute, to meet the altitude constraint.
   */
  public static getRequiredVs(distance: number, targetAltitude: number, currentAltitude: number, groundSpeed: number): number {
    const delta = targetAltitude - currentAltitude;
    const minutesToConstraint = distance / groundSpeed * 60;
    return delta / minutesToConstraint;
  }

  /**
   * Gets the vertical speed required to maintain a given flight path angle and groundspeed.
   * @param fpa The flight path angle, in degrees. Positive angles represent an ascending flight path.
   * @param groundspeed The groundspeed, in knots.
   * @returns The vertical speed required to maintain the specified flight path angle and groundspeed.
   */
  public static getVerticalSpeedFromFpa(fpa: number, groundspeed: number): number {
    return UnitType.NMILE.convertTo(groundspeed / 60, UnitType.FOOT) * Math.tan(fpa * Avionics.Utils.DEG2RAD);
  }

  /**
   * Gets the equivalent flight path angle for a given vertical speed and groundspeed. For this calculation, positive
   * flight path angles represent an ascending flight path.
   * @param vs The vertical speed, in feet per minute.
   * @param groundspeed The groundspeed, in knots.
   * @returns The flight path angle equivalent to the specified vertical speed and ground speed.
   */
  public static getFpaFromVerticalSpeed(vs: number, groundspeed: number): number {
    return this.getFpa(UnitType.NMILE.convertTo(groundspeed / 60, UnitType.FOOT), vs);
  }

  /**
   * Gets the flight path angle for a given distance and altitude. Positive flight path angles represent an ascending
   * flight path.
   * @param distance The distance to get the angle for, in the same unit as `altitude`.
   * @param altitude The altitude to get the angle for, in the same unit as `distance`.
   * @returns The required flight path angle, in degrees.
   */
  public static getFpa(distance: number, altitude: number): number {
    return UnitType.RADIAN.convertTo(Math.atan(altitude / distance), UnitType.DEGREE);
  }

  /**
   * Gets the change in altitude along a flight path angle for a given lateral distance covered.
   * @param fpa The flight path angle, in degrees. Positive values represent an ascending flight path.
   * @param distance The lateral distance covered.
   * @returns The change in altitude along the specified flight path angle for the specified lateral distance covered,
   * expressed in the same units as `distance`.
   */
  public static altitudeForDistance(fpa: number, distance: number): number {
    return Math.tan(UnitType.DEGREE.convertTo(fpa, UnitType.RADIAN)) * distance;
  }

  /**
   * Gets the lateral distance covered along a flight path angle for a given change in altitude.
   * @param fpa The flight path angle, in degrees. Positive values represent an ascending flight path.
   * @param altitude The change in the altitude.
   * @returns The lateral distance covered along the specified flight path angle for the specified change in altitude,
   * expressed in the same units as `altitude`.
   */
  public static distanceForAltitude(fpa: number, altitude: number): number {
    return altitude / Math.tan(UnitType.DEGREE.convertTo(fpa, UnitType.RADIAN));
  }

  /**
   * Gets the missed approach leg index.
   * @param plan The flight plan.
   * @returns The Destination leg global leg index.
   */
  public static getMissedApproachLegIndex(plan: FlightPlan): number {
    if (plan.length > 0) {
      for (let l = plan.length - 1; l > 0; l--) {
        const planLeg = plan.tryGetLeg(l);
        if (planLeg && BitFlags.isAll(planLeg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
          return l;
        }
      }
    }
    return Math.max(0, plan.length - 1);
  }

  /**
   * Gets the FAF index in the plan.
   * @param plan The flight plan.
   * @returns The FAF index in the plan.
   */
  public static getFafIndex(plan: FlightPlan): number | undefined {

    if (plan.length > 0) {
      for (let l = plan.length - 1; l > 0; l--) {
        const planLeg = plan.tryGetLeg(l);
        if (planLeg && BitFlags.isAll(planLeg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
          return l;
        }
      }
    }
    return undefined;
  }

  /**
   * Finds and returns the FAF index in the plan.
   * @param lateralPlan The lateral flight plan.
   * @param iterator The FlightPlanLegIterator instance.
   * @returns The FAF index in the lateral flight plan.
   */
  public static getFafIndexReverse(lateralPlan: FlightPlan, iterator: FlightPlanLegIterator): number {
    let fafIndex = -1;

    iterator.iterateReverse(lateralPlan, cursor => {
      if (fafIndex === -1 && cursor.legDefinition && (cursor.legDefinition.leg.fixTypeFlags & FixTypeFlags.FAF)) {
        fafIndex = cursor.legIndex + cursor.segment.offset;
      }
    });

    fafIndex = fafIndex > -1 ? fafIndex : fafIndex = Math.max(0, lateralPlan.length - 1);

    return fafIndex;
  }

  /**
   * Gets the index of the VNAV constraint that contains a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index of the flight plan leg.
   * @returns The index of the VNAV constraint that contains the specified flight plan leg, or `-1` if one could not
   * be found.
   */
  public static getConstraintIndexFromLegIndex(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number {
    for (let c = verticalPlan.constraints.length - 1; c >= 0; c--) {
      if (verticalPlan.constraints[c].index >= globalLegIndex) {
        return c;
      }
    }
    return -1;
  }

  /**
   * Gets the VNAV constraint that contains a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index of the flight plan leg.
   * @returns The VNAV constraint that contains the specified flight plan leg, or `undefined` if one could not be
   * found.
   */
  public static getConstraintFromLegIndex(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavConstraint | undefined {
    return verticalPlan.constraints[VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex)];
  }

  /**
   * Gets the index of the VNAV constraint immediately prior to the constraint that contains a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index of the flight plan leg.
   * @returns The index of the VNAV constraint immediately prior to the constraint that contains the specified flight
   * plan leg, or `-1` if one could nto be found.
   */
  public static getPriorConstraintIndexFromLegIndex(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number {
    for (let c = 0; c < verticalPlan.constraints.length; c++) {
      if (verticalPlan.constraints[c].index < globalLegIndex) {
        return c;
      }
    }
    return -1;
  }

  /**
   * Gets the VNAV constraint immediately prior to the constraint that contains a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index of the flight plan leg.
   * @returns The VNAV constraint immediately prior to the constraint that contains the specified flight plan leg, or
   * `undefined` if one could nto be found.
   */
  public static getPriorConstraintFromLegIndex(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavConstraint | undefined {
    return verticalPlan.constraints[VNavUtils.getPriorConstraintIndexFromLegIndex(verticalPlan, globalLegIndex)];
  }

  /**
   * Gets and returns whether the input leg index is a path end.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex is the global leg index to check.
   * @returns whether the input leg index is a path end.
   */
  public static getIsPathEnd(verticalPlan: VerticalFlightPlan, globalLegIndex: number): boolean {
    const constraintIndex = verticalPlan.constraints.findIndex(c => c.index === globalLegIndex);
    if (constraintIndex > -1 && verticalPlan.constraints[constraintIndex].isPathEnd) {
      return true;
    }
    return false;
  }

  /**
   * Gets the global leg index for the constraint containing an indexed leg.
   * @param verticalPlan The vertical plan.
   * @param globalLegIndex A global leg index.
   * @returns The global leg index for the constraint containing the leg at the specified global index, or -1 if one
   * could not be found.
   */
  public static getConstraintLegIndexFromLegIndex(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number {
    return this.getConstraintFromLegIndex(verticalPlan, globalLegIndex)?.index ?? -1;
  }

  /**
   * Gets a constraint segment distance from the constraint legs.
   * @param constraint The constraint to calculate a distance for.
   * @returns The constraint distance, in meters.
   */
  public static getConstraintDistanceFromConstraint(constraint: VNavConstraint): number {
    let distance = 0;

    for (let legIndex = 0; legIndex < constraint.legs.length; legIndex++) {
      distance += constraint.legs[legIndex].distance;
    }

    return distance;
  }

  /**
   * Gets a constraint segment distance from the Vertical Plan legs.
   * @param constraint The constraint to calculate a distance for.
   * @param previousConstraint The constraint that preceds the constraint we are calculating the distance for.
   * @param verticalPlan The Vertical Flight Plan.
   * @returns The constraint distance, in meters.
   */
  public static getConstraintDistanceFromLegs(constraint: VNavConstraint, previousConstraint: VNavConstraint | undefined, verticalPlan: VerticalFlightPlan): number {
    let distance = 0;

    const startGlobalIndex = previousConstraint !== undefined ? previousConstraint.index + 1 : 0;

    for (let i = startGlobalIndex; i <= constraint.index; i++) {
      const verticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, i);
      distance += verticalLeg.distance;
    }

    return distance;
  }

  /**
   * Gets the distance from the current location in the plan to the constraint.
   * @param constraint The vnav constraint to calculate the distance to.
   * @param lateralPlan The lateral flight plan.
   * @param activeLegIndex The current active leg index.
   * @param distanceAlongLeg The current distance along leg.
   * @returns the distance to the constraint, or positive infinity if a discontinuity exists between the ppos and the constraint.
   */
  public static getDistanceToConstraint(constraint: VNavConstraint, lateralPlan: FlightPlan, activeLegIndex: number, distanceAlongLeg: number): number {
    if (activeLegIndex > constraint.index) {
      return 0;
    }

    let distance = 0;

    let index = activeLegIndex;
    for (const leg of lateralPlan.legs(false, activeLegIndex)) {
      if (FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)) {
        return Number.POSITIVE_INFINITY;
      } else if (leg.calculated !== undefined) {
        distance += leg.calculated.distanceWithTransitions;
      }

      if (++index > constraint.index) {
        break;
      }
    }

    distance -= distanceAlongLeg;

    return distance;
  }

  /**
   * Gets VNAV Constraint Details from a constraint.
   * @param constraint The constraint to get details from.
   * @param out The object to which write the results.
   * @returns The VNav Constraint Details.
   */
  public static getConstraintDetails(constraint: VNavConstraint, out: AltitudeConstraintDetails): AltitudeConstraintDetails {

    if (constraint.maxAltitude === constraint.minAltitude) {
      out.type = AltitudeRestrictionType.At;
      out.altitude = Math.round(UnitType.METER.convertTo(constraint.minAltitude, UnitType.FOOT));
    } else if (constraint.maxAltitude < Number.POSITIVE_INFINITY || constraint.minAltitude > Number.NEGATIVE_INFINITY) {

      switch (constraint.type) {
        case 'climb':
        case 'missed':
          if (constraint.maxAltitude < Number.POSITIVE_INFINITY) {
            out.type = AltitudeRestrictionType.AtOrBelow;
            out.altitude = Math.round(UnitType.METER.convertTo(constraint.maxAltitude, UnitType.FOOT));
          } else {
            out.type = AltitudeRestrictionType.AtOrAbove;
            out.altitude = Math.round(UnitType.METER.convertTo(constraint.minAltitude, UnitType.FOOT));
          }
          break;
        default:
          if (constraint.minAltitude > Number.NEGATIVE_INFINITY) {
            out.type = AltitudeRestrictionType.AtOrAbove;
            out.altitude = Math.round(UnitType.METER.convertTo(constraint.minAltitude, UnitType.FOOT));
          } else {
            out.type = AltitudeRestrictionType.AtOrBelow;
            out.altitude = Math.round(UnitType.METER.convertTo(constraint.maxAltitude, UnitType.FOOT));
          }
      }

    } else {
      out.type = AltitudeRestrictionType.At;
      out.altitude = Math.round(UnitType.METER.convertTo(constraint.minAltitude, UnitType.FOOT));
    }

    return out;
  }

  /**
   * Gets and returns the vertical direct constraint based on an input index.
   * @param verticalPlan The vertical flight plan.
   * @param selectedGlobalLegIndex The global leg index selected for vertical direct.
   * @param activeLegIndex The active leg index.
   * @returns The Vnav Constraint for the vertical direct or undefined.
   */
  public static getVerticalDirectConstraintFromIndex(verticalPlan: VerticalFlightPlan, selectedGlobalLegIndex: number, activeLegIndex: number): VNavConstraint | undefined {

    if (verticalPlan.constraints.length > 0) {
      if (selectedGlobalLegIndex < activeLegIndex) {
        return VNavUtils.getConstraintFromLegIndex(verticalPlan, activeLegIndex);
      }
      for (let c = verticalPlan.constraints.length - 1; c >= 0; c--) {
        const constraint = verticalPlan.constraints[c];
        if (constraint.index === selectedGlobalLegIndex || (c === verticalPlan.constraints.length - 1 && selectedGlobalLegIndex < constraint.index)) {
          return constraint;
        } else if (c < verticalPlan.constraints.length - 1 && constraint.index > selectedGlobalLegIndex) {
          return verticalPlan.constraints[c + 1];
        }
      }
    }
    return undefined;
  }

  /**
   * Gets the next descent constraint with a defined minimum altitude at or after a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next descent constraint with a defined minimum altitude at or after the specified flight
   * plan leg, or `undefined` if no such constraint exists.
   */
  public static getNextDescentTargetConstraint(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavConstraint | undefined {
    const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
    for (let c = currentConstraintIndex; c >= 0; c--) {
      const constraint = verticalPlan.constraints[c];
      if ((constraint.type === 'descent' || constraint.type === 'direct' || constraint.type === 'manual') && constraint.minAltitude > Number.NEGATIVE_INFINITY) {
        return constraint;
      }
    }

    return undefined;
  }

  /**
   * Gets the next descent constraint minimum altitude at or after a flight plan leg, or undefined if none exists.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next descent constraint defined minimum altitude in meters at or after the specified flight plan leg, or
   * `undefined` if no such constraint exists.
   */
  public static getNextDescentTargetAltitude(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number | undefined {
    const constraint = VNavUtils.getNextDescentTargetConstraint(verticalPlan, globalLegIndex);
    return constraint !== undefined ? constraint.minAltitude : undefined;
  }

  /**
   * Gets the next climb constraint with a defined maximum altitude at or after a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next climb constraint with a defined maximum altitude at or after the specified flight plan leg, or
   * `undefined` if no such constraint exists.
   */
  public static getNextClimbTargetConstraint(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavConstraint | undefined {
    const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);
    if (currentConstraint) {
      if (currentConstraint.type === 'climb' && currentConstraint.maxAltitude < Number.POSITIVE_INFINITY) {
        return currentConstraint;
      } else if (currentConstraint.type === 'climb' && currentConstraint.maxAltitude === Number.POSITIVE_INFINITY) {
        const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
        const lastIndexToCheck = verticalPlan.firstDescentConstraintLegIndex !== undefined ?
          VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, verticalPlan.firstDescentConstraintLegIndex) : 0;
        for (let c = currentConstraintIndex - 1; c >= lastIndexToCheck; c--) {
          const constraint = verticalPlan.constraints[c];
          if (constraint.type === 'climb' && constraint.maxAltitude < Number.POSITIVE_INFINITY) {
            return constraint;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Gets the next climb constraint maximum altitude at or after a flight plan leg, or undefined if none exists.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next climb constraint defined maximum altitude in meters at or after the specified flight plan leg, or
   * `undefined` if no such constraint exists.
   */
  public static getNextClimbTargetAltitude(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number | undefined {
    const constraint = VNavUtils.getNextClimbTargetConstraint(verticalPlan, globalLegIndex);
    return constraint !== undefined ? constraint.maxAltitude : undefined;
  }

  /**
   * Gets the next missed approach constraint with a defined maximum altitude at or after a flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next missed approach constraint with a defined maximum altitude at or after the specified flight
   * plan leg, or `undefined` if no such constraint exists.
   */
  public static getNextMaprTargetConstraint(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavConstraint | undefined {
    const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
    for (let c = currentConstraintIndex; c >= 0; c--) {
      const constraint = verticalPlan.constraints[c];
      if (constraint.type === 'missed' && constraint.maxAltitude < Number.POSITIVE_INFINITY) {
        return constraint;
      }
    }

    return undefined;
  }

  /**
   * Gets the next missed approach constraint maximum altitude at or after a flight plan leg, or undefined if none exists.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the flight plan leg to find the constraint for.
   * @returns The next missed approach constraint defined maximum altitude in meters at or after the specified flight plan leg, or
   * `undefined` if no such constraint exists.
   */
  public static getNextMaprTargetAltitude(verticalPlan: VerticalFlightPlan, globalLegIndex: number): number | undefined {
    const constraint = VNavUtils.getNextMaprTargetConstraint(verticalPlan, globalLegIndex);
    return constraint !== undefined ? constraint.maxAltitude : undefined;
  }

  /**
   * Gets the VNAV desired altitude.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index to get the target for.
   * @param distanceAlongLeg The distance along the leg the aircraft is presently.
   * @returns The current VNAV desired altitude.
   */
  public static getDesiredAltitude(verticalPlan: VerticalFlightPlan, globalLegIndex: number, distanceAlongLeg: number): number {
    const priorConstraint = VNavUtils.getPriorConstraintFromLegIndex(verticalPlan, globalLegIndex);

    if (priorConstraint && priorConstraint.nextVnavEligibleLegIndex && globalLegIndex < priorConstraint.nextVnavEligibleLegIndex) {
      return priorConstraint.targetAltitude;
    }
    const leg = VNavUtils.getVerticalLegFromPlan(verticalPlan, globalLegIndex);

    return leg.altitude + VNavUtils.altitudeForDistance(leg.fpa, leg.distance - distanceAlongLeg);
  }

  /**
   * Gets and returns the FAF altitude.
   * @param verticalPlan The vertical flight plan.
   * @returns the FAF constraint altitude.
   */
  public static getFafAltitude(verticalPlan: VerticalFlightPlan): number | undefined {

    if (verticalPlan.fafLegIndex !== undefined) {
      return VNavUtils.getVerticalLegFromPlan(verticalPlan, verticalPlan.fafLegIndex).altitude;
    }

    return undefined;
  }

  /**
   * Gets the VNAV TOD/BOD details for a vertical flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param activeLegIndex The current active leg index.
   * @param distanceAlongLeg The distance the plane is along the current leg in meters.
   * @param currentAltitude The current indicated altitude in meters.
   * @param currentVS The current vertical speed in meters per minute.
   * @param out The object to which to write the TOD/BOD details.
   * @returns The VNAV TOD/BOD details.
   */
  public static getTodBodDetails(
    verticalPlan: VerticalFlightPlan,
    activeLegIndex: number,
    distanceAlongLeg: number,
    currentAltitude: number,
    currentVS: number,
    out: TodBodDetails
  ): TodBodDetails {

    out.todLegIndex = -1;
    out.bodLegIndex = -1;
    out.todLegDistance = 0;
    out.distanceFromTod = 0;
    out.distanceFromBod = 0;
    out.currentConstraintLegIndex = -1;

    const activeConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, activeLegIndex);
    const activeConstraint = verticalPlan.constraints[activeConstraintIndex];

    // There is no TOD/BOD if...
    if (
      // ... there is no active VNAV constraint.
      !activeConstraint
      // ... the active constraint contains a VNAV-ineligible leg after the active leg.
      || (activeConstraint?.nextVnavEligibleLegIndex !== undefined && activeConstraint.nextVnavEligibleLegIndex > activeLegIndex)
    ) {
      return out;
    }

    out.currentConstraintLegIndex = activeConstraint.index;

    // Find the next BOD, which will be at the end of the earliest non-flat descent constraint subsequent to and
    // including the active constraint that ends in a level-off at a lower altitude than the aircraft's current
    // altitude. Note that we are guaranteed to not go through a VNAV discontinuity, since all constraints that end in
    // a discontinuity also end in a level-off.

    // lag altitude by ~3 seconds so that we aren't continuously pushing TOD in front of the plane while descending.
    const altitude = currentAltitude - currentVS / 20;

    let bodConstraintIndex, bodConstraint;
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

    out.bodLegIndex = bodConstraint.index;

    // Find the TOD associated with the BOD. To do this, we need to first find the earliest non-flat descent constraint
    // between the active constraint and the BOD constraint (inclusive) that is connected to the BOD constraint with no
    // intervening flat constraints or VNAV path discontinuities and whose target altitude less than the aircraft's
    // current altitude.

    let todConstraintIndex = bodConstraintIndex as number;

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
   * Gets the VNAV TOC/BOC details for a vertical flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param activeLegIndex The current active leg index.
   * @param distanceAlongLeg The distance the plane is along the current leg in meters.
   * @param currentGroundSpeed The current ground speed, in knots.
   * @param currentAltitude The current indicated altitude in meters.
   * @param currentVS The current vertical speed in meters per minute.
   * @param out The object to which to write the TOC/BOC details.
   * @returns The VNAV TOC/BOC details.
   */
  public static getTocBocDetails(
    verticalPlan: VerticalFlightPlan,
    activeLegIndex: number,
    distanceAlongLeg: number,
    currentGroundSpeed: number,
    currentAltitude: number,
    currentVS: number,
    out: TocBocDetails
  ): TocBocDetails {

    out.bocLegIndex = -1;
    out.tocLegIndex = -1;
    out.tocLegDistance = 0;
    out.distanceFromBoc = 0;
    out.distanceFromToc = 0;
    out.tocConstraintIndex = -1;
    out.tocAltitude = -1;

    const activeConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, activeLegIndex);
    const activeConstraint = verticalPlan.constraints[activeConstraintIndex];

    // There is no BOC/TOC if...
    if (
      // ... there is no active VNAV constraint.
      !activeConstraint
      // ... the active VNAV constraint is not a climb-type constraint.
      || (activeConstraint.type !== 'climb' && activeConstraint.type !== 'missed')
    ) {
      return out;
    }

    // Find the TOC. To do this, we need to first find the earliest climb constraint subsequent to and including the
    // active constraint that has a maximum altitude (i.e. is an AT, AT OR BELOW, or BETWEEN constraint). Additionally,
    // the TOC must not be separated from the active constraint by a descent-type constraint.

    let tocConstraintIndex: number | undefined, tocConstraint: VNavConstraint | undefined;

    for (let i = activeConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];

      // If we encounter a descent constraint, immediately terminate the search.
      if (constraint.type !== 'climb' && constraint.type !== 'missed') {
        break;
      }

      if (isFinite(constraint.maxAltitude)) {
        tocConstraintIndex = i;
        tocConstraint = constraint;
        break;
      }
    }

    // If there is no next TOC, there also can be no next BOC since the next BOC must follow the next TOC.
    if (!tocConstraint) {
      return out;
    }

    out.tocConstraintIndex = tocConstraintIndex as number;
    out.tocAltitude = tocConstraint.maxAltitude;

    // Calculate distance to TOC.

    const deltaAltitude = tocConstraint.maxAltitude - currentAltitude;
    const timeToTocMin = deltaAltitude / Math.max(0, currentVS);
    let distanceRemaining = currentGroundSpeed === 0 ? 0 : timeToTocMin * UnitType.KNOT.convertTo(currentGroundSpeed, UnitType.MPM);

    // Find the leg on which the TOC lies.

    const activeLeg = activeConstraint.legs[activeConstraint.index - activeLegIndex] as VNavLeg | undefined;

    let tocLegIndex: number | undefined;

    let currentConstraintIndex = activeConstraintIndex;
    let currentConstraint: VNavConstraint;
    let currentConstraintLegIndex = activeConstraint.index - activeLegIndex;
    let currentLeg = activeLeg;

    const activeLegDistanceRemaining = (activeLeg?.distance ?? 0) - distanceAlongLeg;
    if (distanceRemaining > activeLegDistanceRemaining) {
      distanceRemaining -= activeLegDistanceRemaining;

      if (currentConstraintLegIndex <= 0) {
        --currentConstraintIndex;
      } else {
        currentLeg = activeConstraint.legs[--currentConstraintLegIndex];
      }

      while (currentConstraintIndex >= (tocConstraintIndex as number)) {
        currentConstraint = verticalPlan.constraints[currentConstraintIndex];
        currentLeg = currentConstraint.legs[currentConstraintLegIndex];

        if (currentLeg !== undefined) {
          if (distanceRemaining > currentLeg.distance) {
            out.distanceFromToc += currentLeg.distance;
            distanceRemaining -= currentLeg.distance;
          } else {
            out.distanceFromToc += distanceRemaining;
            tocLegIndex = currentConstraint.index - currentConstraintLegIndex;
            distanceRemaining -= currentLeg.distance;
            break;
          }
        }

        if (currentConstraintLegIndex <= 0) {
          --currentConstraintIndex;
        } else {
          currentLeg = currentConstraint.legs[--currentConstraintLegIndex];
        }
      }
    } else {
      out.distanceFromToc = distanceRemaining;
      tocLegIndex = activeLegIndex;
      distanceRemaining -= activeLegDistanceRemaining;
    }

    if (tocLegIndex === undefined) {
      // If we still haven't found the TOC yet, set it to the end of the last leg of the TOC constraint.
      out.tocLegIndex = tocConstraint.index;
      out.tocLegDistance = 0;
    } else {
      out.tocLegIndex = tocLegIndex;
      out.tocLegDistance = -distanceRemaining;
    }

    // Find the next BOC, which is located at the beginning of the earliest climb constraint subsequent to (and not
    // including) the TOC constraint with a maximum altitude greater than the TOC constraint. Additionally, the BOC
    // must not be separated from the TOC constraint by a descent-type constraint.

    let lastClimbConstraintIndex = tocConstraintIndex as number;

    let bocConstraintIndex: number | undefined, bocConstraint: VNavConstraint | undefined;
    for (let i = (tocConstraintIndex as number) - 1; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];

      // If we encounter a descent constraint, immediately terminate the search.
      if (constraint.type !== 'climb' && constraint.type !== 'missed') {
        break;
      }

      if (constraint.maxAltitude > tocConstraint.maxAltitude) {
        bocConstraintIndex = i;
        bocConstraint = constraint;
        break;
      }

      lastClimbConstraintIndex = i;
    }

    let bocDistanceStopConstraintIndex: number | undefined = undefined;

    if (bocConstraint) {
      out.bocLegIndex = bocConstraint.index - (bocConstraint.legs.length - 1);
      bocDistanceStopConstraintIndex = bocConstraintIndex;
    } else {
      // If we did not find a climb constraint subsequent to the TOC constraint with a maximum altitude greater than the
      // the TOC constraint, then the BOC will be located at the last climb constraint.

      const lastClimbConstraint = verticalPlan.constraints[lastClimbConstraintIndex];
      if (lastClimbConstraint && lastClimbConstraint.index + 1 < verticalPlan.length) {
        out.bocLegIndex = lastClimbConstraint.index + 1;
        bocDistanceStopConstraintIndex = lastClimbConstraintIndex - 1;
      }
    }

    // Calculate distance to BOC
    if (bocDistanceStopConstraintIndex !== undefined) {
      let distanceToEndOfActiveConstraint = (activeLeg?.distance ?? 0) - distanceAlongLeg;

      for (let i = Math.min(activeConstraint.index - activeLegIndex, activeConstraint.legs.length) - 1; i >= 0; i--) {
        distanceToEndOfActiveConstraint += activeConstraint.legs[i].distance;
      }

      out.distanceFromBoc = distanceToEndOfActiveConstraint;
      for (let i = activeConstraintIndex - 1; i > bocDistanceStopConstraintIndex; i--) {
        out.distanceFromBoc += verticalPlan.constraints[i].distance;
      }
    }

    return out;
  }

  /**
   * Gets the VNAV TOC/BOC to cruise altitude details for a vertical flight plan.
   * @param lateralPlan The lateral flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param activeLegIndex The current active leg index.
   * @param distanceAlongLeg The distance the plane is along the current leg in meters.
   * @param currentGroundSpeed The current ground speed, in knots.
   * @param currentAltitude The current indicated altitude in meters.
   * @param currentVS The current vertical speed in meters per minute.
   * @param cruiseAltitude The cruise altitude, in meters.
   * @param out The object to which to write the TOC/BOC details.
   * @returns The VNAV TOC/BOC to cruise altitude details.
   */
  public static getCruiseTocBocDetails(
    lateralPlan: FlightPlan,
    verticalPlan: VerticalFlightPlan,
    activeLegIndex: number,
    distanceAlongLeg: number,
    currentGroundSpeed: number,
    currentAltitude: number,
    currentVS: number,
    cruiseAltitude: number,
    out: TocBocDetails
  ): TocBocDetails {

    out.bocLegIndex = -1;
    out.tocLegIndex = -1;
    out.tocLegDistance = 0;
    out.distanceFromBoc = 0;
    out.distanceFromToc = 0;
    out.tocConstraintIndex = -1;
    out.tocAltitude = -1;

    // Find the last climb constraint
    const lastClimbConstraintIndex = VNavUtils.getLastClimbConstraintIndex(verticalPlan);
    const lastClimbConstraint = verticalPlan.constraints[lastClimbConstraintIndex] as VNavConstraint | undefined;

    const firstDescentConstraintIndex = VNavUtils.getFirstDescentConstraintIndex(verticalPlan);
    const firstDescentConstraint = verticalPlan.constraints[firstDescentConstraintIndex] as VNavConstraint | undefined;

    // If the active leg is past the first descent constraint, both cruise BOC and cruise TOC are undefined.
    if (firstDescentConstraint && activeLegIndex > firstDescentConstraint.index) {
      return out;
    }

    const activeLeg = lateralPlan.tryGetLeg(activeLegIndex);
    const activeLegDistanceRemaining = (activeLeg?.calculated?.distanceWithTransitions ?? 0) - distanceAlongLeg;

    // Cruise BOC will always be located at the beginning of the first leg after the last climb constraint. If there
    // are no climb constraints in the plan, then cruise BOC is undefined.

    if (lastClimbConstraint && lastClimbConstraint.index < lateralPlan.length - 1 && activeLegIndex <= lastClimbConstraint.index) {
      const lastClimbConstraintLeg = lateralPlan.tryGetLeg(lastClimbConstraint.index);

      out.bocLegIndex = lastClimbConstraint.index + 1;
      out.distanceFromBoc = activeLegDistanceRemaining
        + (lastClimbConstraintLeg?.calculated?.cumulativeDistanceWithTransitions ?? 0) - (activeLeg?.calculated?.cumulativeDistanceWithTransitions ?? 0);
    }

    // Calculate distance to TOC.

    const deltaAltitude = cruiseAltitude - currentAltitude;
    const timeToTocMin = deltaAltitude / Math.max(0, currentVS);
    let distanceRemaining = currentGroundSpeed === 0 ? 0 : timeToTocMin * UnitType.KNOT.convertTo(currentGroundSpeed, UnitType.MPM);

    // Find the leg on which the TOC lies. The TOC is restricted to legs prior to the first descent constraint.

    let tocLegIndex: number | undefined;

    const lastLegIndex = firstDescentConstraint?.index ?? lateralPlan.length - 1;

    if (distanceRemaining > activeLegDistanceRemaining) {
      let legIndex = activeLegIndex + 1;
      for (const leg of lateralPlan.legs(false, legIndex, lastLegIndex + 1)) {
        const legDistance = leg.calculated?.distanceWithTransitions ?? 0;

        if (distanceRemaining > legDistance) {
          out.distanceFromToc += legDistance;
          distanceRemaining -= legDistance;
        } else {
          out.distanceFromToc += distanceRemaining;
          tocLegIndex = legIndex;
          distanceRemaining -= legDistance;
          break;
        }

        legIndex++;
      }
    } else {
      out.distanceFromToc = distanceRemaining;
      tocLegIndex = activeLegIndex;
      distanceRemaining -= activeLegDistanceRemaining;
    }

    if (tocLegIndex === undefined) {
      // If we still haven't found the TOC yet, set it to the end of the last viable leg.
      out.tocLegIndex = lastLegIndex;
      out.tocLegDistance = 0;
    } else {
      out.tocLegIndex = tocLegIndex;
      out.tocLegDistance = -distanceRemaining;
    }

    out.tocAltitude = cruiseAltitude;

    return out;
  }

  /**
   * Checks whether or not the vertical plan has a leg at a given globalLegIndex.
   * @param verticalPlan The Vertical Flight Plan.
   * @param globalLegIndex The global leg index to check.
   * @returns True if the leg exists.
   */
  public static verticalPlanHasLeg(verticalPlan: VerticalFlightPlan, globalLegIndex: number): boolean {
    for (let i = 0; i < verticalPlan.segments.length; i++) {
      const segment = verticalPlan.segments[i];
      if (segment !== undefined && globalLegIndex >= segment.offset && globalLegIndex < segment.offset + segment.legs.length) {
        return segment.legs[globalLegIndex - segment.offset] !== undefined;
      }
    }
    return false;
  }

  /**
   * Gets a VNAV leg from a vertical flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global leg index of the leg to get.
   * @returns The requested VNAV leg.
   * @throws Not found if the index is not valid.
   */
  public static getVerticalLegFromPlan(verticalPlan: VerticalFlightPlan, globalLegIndex: number): VNavLeg {
    for (let i = 0; i < verticalPlan.segments.length; i++) {
      const segment = verticalPlan.segments[i];
      if (segment !== undefined && globalLegIndex >= segment.offset && globalLegIndex < segment.offset + segment.legs.length) {
        return segment.legs[globalLegIndex - segment.offset];
      }
    }

    throw new Error(`Leg with index ${globalLegIndex} not found`);
  }

  /**
   * Gets a VNAV leg from the plan from a specified segment.
   * @param verticalPlan The vertical flight plan.
   * @param segmentIndex The segment index of the leg to get.
   * @param legIndex The index of the leg to get within the specified segment.
   * @returns The requested VNAV leg.
   * @throws Not found if the index is not valid.
   */
  public static getVerticalLegFromSegmentInPlan(verticalPlan: VerticalFlightPlan, segmentIndex: number, legIndex: number): VNavLeg {
    const segment = verticalPlan.segments[segmentIndex];
    const leg = segment.legs[legIndex];
    if (segment && leg) {
      return leg;
    } else {
      throw new Error(`Leg from vertical plan ${verticalPlan.planIndex} segment ${segmentIndex} index ${legIndex} not found`);
    }
  }

  /**
   * Gets the constraint for a vertical direct based on an input global leg index.
   * @param verticalPlan The vertical flight plan.
   * @param activeGlobalLegIndex The current active global leg index.
   * @param selectedGlobalLegIndex The input global leg index selected.
   * @returns The constraint, or undefined if none exists.
   */
  public static getConstraintForVerticalDirect(verticalPlan: VerticalFlightPlan, activeGlobalLegIndex: number, selectedGlobalLegIndex: number): VNavConstraint | undefined {
    return VNavUtils.getVerticalDirectConstraintFromIndex(verticalPlan, selectedGlobalLegIndex, activeGlobalLegIndex);
  }

  /**
   * Gets the VNAV segments from the calculated VNAV plan.
   * @param verticalPlan The vertical flight plan.
   * @returns The vnav segments.
   * @throws Not found if the index is not valid.
   */
  public static getVerticalSegmentsFromPlan(verticalPlan: VerticalFlightPlan): VNavPlanSegment[] {
    return verticalPlan.segments;
  }

  /**
   * Gets whether a lateral plan leg is a hold or procedure turn.
   * @param lateralLeg The Lateral Leg in the flight plan (LegDefinition).
   * @returns Whether the leg is a hold or procedure turn.
   */
  public static isLegTypeHoldOrProcedureTurn(lateralLeg: LegDefinition): boolean {
    if (lateralLeg.leg !== undefined) {
      switch (lateralLeg.leg.type) {
        case LegType.HA:
        case LegType.HF:
        case LegType.HM:
        case LegType.PI:
          return true;
      }
    }
    return false;
  }

  /**
   * Creates a new empty vertical flight plan constraint.
   * @param index The leg index of the constraint.
   * @param minAltitude The bottom altitude of the constraint.
   * @param maxAltitude THe top altitude of the constraint.
   * @param name The name of the leg for the constraint.
   * @param type The type of constraint.
   * @returns A new empty constraint.
   */
  public static createConstraint(index: number, minAltitude: number, maxAltitude: number, name: string, type: 'climb' | 'descent' | 'direct' | 'missed' | 'manual' = 'descent'): VNavConstraint {
    return {
      index,
      minAltitude,
      maxAltitude,
      targetAltitude: 0,
      name,
      isTarget: false,
      isPathEnd: false,
      distance: 0,
      fpa: 0,
      legs: [],
      type,
      isBeyondFaf: false
    };
  }

  /**
   * Creates a new vertical flight plan leg.
   * @param segmentIndex The segment index for the leg.
   * @param legIndex The index of the leg within the segment.
   * @param name The name of the leg.
   * @param distance The leg distance.
   * @returns A new VNAV plan leg.
   */
  public static createLeg(segmentIndex: number, legIndex: number, name: string, distance = 0): VNavLeg {
    return {
      segmentIndex,
      legIndex,
      fpa: 0,
      altitude: 0,
      isUserDefined: false,
      isDirectToTarget: false,
      distance: distance,
      isEligible: true,
      isBod: false,
      isAdvisory: true,
      name
    };
  }

  /**
   * Finds the index of the first climb constraint in a vertical plan.
   * @param verticalPlan A vertical flight plan.
   * @returns The index of the first climb constraint in the specified vertical plan, or `-1` if the plan has no
   * climb constraints.
   */
  public static getFirstClimbConstraintIndex(verticalPlan: VerticalFlightPlan): number {
    for (let i = verticalPlan.constraints.length - 1; i >= 0; i--) {
      if (verticalPlan.constraints[i].type === 'climb') {
        return i;
      }
    }

    return -1;
  }

  /**
   * Finds the index of the last climb constraint in a vertical plan.
   * @param verticalPlan A vertical flight plan.
   * @returns The index of the last climb constraint in the specified vertical plan, or `-1` if the plan has no
   * climb constraints.
   */
  public static getLastClimbConstraintIndex(verticalPlan: VerticalFlightPlan): number {
    for (let i = 0; i < verticalPlan.constraints.length; i++) {
      if (verticalPlan.constraints[i].type === 'climb') {
        return i;
      }
    }

    return -1;
  }

  /**
   * Finds the index of the first descent constraint in a vertical plan.
   * @param verticalPlan A vertical flight plan.
   * @returns The index of the first descent constraint in the specified vertical plan, or `-1` if the plan has no
   * descent constraints.
   */
  public static getFirstDescentConstraintIndex(verticalPlan: VerticalFlightPlan): number {
    let index = -1;

    for (let c = 0; c < verticalPlan.constraints.length; c++) {
      const type = verticalPlan.constraints[c].type;
      if (type === 'descent' || type === 'manual') {
        index = c;
      }
      if (type === 'direct') {
        return c;
      }
    }
    return index;
  }

  /**
   * Finds the index of the last descent constraint in a vertical plan.
   * @param verticalPlan A vertical flight plan.
   * @returns The index of the last descent constraint in the specified vertical plan, or `-1` if the plan has no
   * descent constraints.
   */
  public static getLastDescentConstraintIndex(verticalPlan: VerticalFlightPlan): number {
    for (let i = 0; i < verticalPlan.constraints.length; i++) {
      const type = verticalPlan.constraints[i].type;
      if (type === 'descent' || type === 'direct' || type === 'manual') {
        return i;
      }
    }
    return -1;
  }

  /**
   * Checks whether two speed constraints are equal.
   * @param a The first speed constraint.
   * @param b The second speed constraint.
   * @returns Whether the two speed constraints are equal.
   */
  public static speedConstraintEquals(a: SpeedConstraint, b: SpeedConstraint): boolean {
    return a.speedDesc === b.speedDesc && a.speed === b.speed && a.speedUnit === b.speedUnit;
  }

  /**
   * Checks whether two altitude constraint details are equal.
   * @param a The first altitude constraint details.
   * @param b The second altitude constraint details.
   * @returns Whether the two altitude constraint details are equal.
   */
  public static altitudeConstraintDetailsEquals(a: AltitudeConstraintDetails, b: AltitudeConstraintDetails): boolean {
    return a.type === b.type && a.altitude === b.altitude;
  }

  /**
   * Checks whether two speed constraint details are equal.
   * @param a The first speed constraint details.
   * @param b The second speed constraint details.
   * @returns Whether the two speed constraint details are equal.
   */
  public static speedConstraintDetailsEquals(a: SpeedConstraintDetails, b: SpeedConstraintDetails): boolean {
    return a.distanceToNextSpeedConstraint === b.distanceToNextSpeedConstraint
      && VNavUtils.speedConstraintEquals(a.currentSpeedConstraint, b.currentSpeedConstraint)
      && VNavUtils.speedConstraintEquals(a.nextSpeedConstraint, b.nextSpeedConstraint);
  }

  /**
   * Computes the path error distance that should be used given the groundspeed.
   * @param groundSpeed The current groundspeed, in knots.
   * @returns The path error distance to use.
   */
  public static getPathErrorDistance(groundSpeed: number): number {
    if (groundSpeed <= 190) {
      return 100;
    } else if (groundSpeed >= 210) {
      return 250;
    } else {
      return 100 + (((groundSpeed - 190) / 20) * 150);
    }
  }
}