/**
 * Utilities for WT21 VNAV Computations
 */
import { FlightPlan, ObjectSubject, UnitType, VNavUtils } from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '../Systems/FMS/WT21FmsUtils';

/**
 * Contains information related to the location of a DES advisory point
 */
export interface DesAdvisoryDetails {
  /**
   * Global leg index on which the DES advisory sits
   */
  desAdvisoryLegIndex: number,

  /**
   * Distance from the end of the DES advisory leg to the DES advisory point, in metres
   */
  desAdvisoryLegDistance: number,

  /**
   * Distance from the current position to the DES advisory point, in metres
   */
  distanceFromDesAdvisory: number,
}

/**
 * Utils for WT21 VNAV
 */
export class WT21VnavUtils {

  /**
   * Calculates the distance from the airport at which to show the DES ADVISORY, given a vpa
   *
   * @param startingAltitude             the starting altitude of the aircraft (cruise alt) in Feet
   * @param destinationAirfieldElevation elevation of the destination airfield in Feet
   * @param vpa                          the vertical path angle of the descent (TODO check if this is actually used here)
   *
   * @returns DES advisory distance in metres
   */
  public static calculateDescentAdvisoryDistance(startingAltitude: number, destinationAirfieldElevation: number, vpa: number): number {
    const altitudeToLose = startingAltitude - (destinationAirfieldElevation + 1_500);

    const distance = VNavUtils.distanceForAltitude(vpa, UnitType.FOOT.convertTo(altitudeToLose, UnitType.METER));

    return UnitType.NMILE.convertTo(10, UnitType.METER) + distance;
  }

  /**
   * Edits a {@link DesAdvisoryDetails} object to contain up-to-date information about a DES advisory point
   *
   * @param details                    {@link ObjectSubject} for a {@link DesAdvisoryDetails}
   * @param lateralPlan                lateral flight plan to use for calculations
   * @param lnavTrackingLegIndex       LNAV tracking leg index
   * @param lnavLegDistanceAlong       LNAV distance along tracked leg, in metres
   * @param lnavLegDistanceRemaining   LNAV distance remaining along tracked leg, in metres
   * @param desAdvisoryDistanceFromEnd DES advisory distance from destination, in metres
   */
  public static updateDesAdvisoryDetails(
    details: ObjectSubject<DesAdvisoryDetails>,
    lateralPlan: FlightPlan,
    lnavTrackingLegIndex: number,
    lnavLegDistanceAlong: number,
    lnavLegDistanceRemaining: number,
    desAdvisoryDistanceFromEnd: number
  ): void {
    let legIndex = WT21FmsUtils.getLastNonMissedApproachLeg(lateralPlan);

    if (legIndex !== -1) {
      let legDistance = 0;

      let accumulator = 0;
      while (accumulator < desAdvisoryDistanceFromEnd) {
        const leg = lateralPlan.getLeg(legIndex);

        if (WT21FmsUtils.isDiscontinuityLeg(leg.leg.type)) {
          const prevLeg = lateralPlan.tryGetLeg(legIndex - 1);
          const nextLeg = lateralPlan.tryGetLeg(legIndex + 1);

          if (prevLeg && nextLeg) {
            legDistance = WT21FmsUtils.distanceBetweenDiscontinuedLegs(prevLeg, nextLeg);
          } else {
            legDistance = 0;
          }
        } else {
          if (leg.calculated?.distanceWithTransitions) {
            legDistance = leg.calculated.distanceWithTransitions;
          } else {
            legDistance = 0;
          }
        }

        accumulator += legDistance;

        if (accumulator < desAdvisoryDistanceFromEnd) {
          legIndex--;
        }

        if (legIndex < 0) {
          break;
        }
      }

      const finalLeg = lateralPlan.tryGetLeg(legIndex);

      if (finalLeg === null || WT21FmsUtils.isDiscontinuityLeg(finalLeg.leg.type)) {
        // The DES advisory ends up in a discontinuity - discard it
        details.set('desAdvisoryLegIndex', -1);
        details.set('distanceFromDesAdvisory', -1);
        details.set('desAdvisoryLegDistance', -1);
        return;
      }

      // Figure out the distance to the DES advisory
      if (accumulator >= desAdvisoryDistanceFromEnd) {
        const distanceFromEndOfLeg = desAdvisoryDistanceFromEnd - (accumulator - legDistance);

        let remainingDistance;
        if (lnavTrackingLegIndex === legIndex) {
          const leg = lateralPlan.getLeg(legIndex);

          if (leg.calculated?.distanceWithTransitions) {
            legDistance = leg.calculated.distanceWithTransitions;
          } else {
            legDistance = 0;
          }

          remainingDistance = (legDistance - distanceFromEndOfLeg) - lnavLegDistanceAlong;
        } else {
          let remainingDistanceAcc = lnavLegDistanceRemaining;
          for (let i = lnavTrackingLegIndex + 1; i <= legIndex; i++) {
            const leg = lateralPlan.getLeg(i);

            if (WT21FmsUtils.isDiscontinuityLeg(leg.leg.type)) {
              const prevLeg = lateralPlan.tryGetLeg(legIndex - 1);
              const nextLeg = lateralPlan.tryGetLeg(legIndex + 1);

              if (prevLeg && nextLeg) {
                legDistance = WT21FmsUtils.distanceBetweenDiscontinuedLegs(prevLeg, nextLeg);
              } else {
                legDistance = 0;
              }
            } else if (leg.calculated?.distanceWithTransitions) {
              legDistance = leg.calculated.distanceWithTransitions;
            } else {
              legDistance = 0;
            }

            if (i === legIndex) {
              const distanceFromStart = legDistance - distanceFromEndOfLeg;

              remainingDistanceAcc += distanceFromStart;

              break;
            } else {
              remainingDistanceAcc += legDistance;
            }
          }

          remainingDistance = remainingDistanceAcc;
        }

        details.set('desAdvisoryLegIndex', legIndex);
        details.set('distanceFromDesAdvisory', remainingDistance);
        details.set('desAdvisoryLegDistance', distanceFromEndOfLeg);
      } else {
        // The DES advisory ends up before the start of the plan - discard it
        details.set('desAdvisoryLegIndex', -1);
        details.set('distanceFromDesAdvisory', -1);
        details.set('desAdvisoryLegDistance', -1);
      }
    }
  }

}
