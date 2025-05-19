import { LNavDataEvents } from '../../autopilot/lnav/LNavDataEvents';
import { LNavEvents } from '../../autopilot/lnav/LNavEvents';
import { ConsumerSubject } from '../../data/ConsumerSubject';
import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { AdcEvents } from '../../instruments/Adc';
import { AeroMath } from '../../math/AeroMath';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { FixTypeFlags } from '../../navigation/Facilities';
import { LegDefinition } from '../FlightPlanning';
import { FlightPathAnticipatedData, FlightPathAnticipatedDataCalculator, FlightPathAnticipatedDataContext } from './FlightPathAnticipatedDataCalculator';

/**
 * Options for an anticipated data calculator.
 */
export interface DefaultFlightPathAnticipatedDataCalculatorOptions {

  /** Descent speed profile: MACH */
  // TODO : enable mach descentSpeedProfileMach: number;

  /** Descent speed profile: Knots above 100000 ft */
  descentSpeedProfileKtsAbove10k: number;

  /** Descent speed profile: Knots below 100000 ft */
  descentSpeedProfileKtsBelow10k: number;

  /** Typical indicated speed during final approach (VREF), in knots */
  typicalVRef: number;
}


/**
 * Calculates the anticipated speeds for given legs.
 */
export class DefaultFlightPathAnticipatedDataCalculator implements FlightPathAnticipatedDataCalculator {

  private useActualSpeedsOnly = false;
  private readonly lnavDistanceToDestNm = ConsumerValue.create(null, 0);
  private readonly lnavActiveGlobalLegIndex = ConsumerSubject.create(null, 0);
  private readonly alt = ConsumerValue.create(null, 0);
  private lastLnavActiveIdx = 0; // To detect flight plan changes that require a reset of the calculator.

  /** Creates  *
   * @param bus event bus
   * @param aircraftData aircraft specific data
   */
  constructor(
    private readonly bus: EventBus,
    private readonly aircraftData: DefaultFlightPathAnticipatedDataCalculatorOptions) {
    const sub = this.bus.getSubscriber<LNavDataEvents & LNavEvents & AdcEvents>();
    this.lnavDistanceToDestNm.setConsumer(sub.on('lnavdata_destination_distance'));
    this.lnavActiveGlobalLegIndex.setConsumer(sub.on('lnav_tracked_leg_index'));
    this.alt.setConsumer(sub.on('indicated_alt'));

    this.aircraftData.descentSpeedProfileKtsAbove10k ??= 290;
    this.aircraftData.descentSpeedProfileKtsBelow10k ??= 240;
    this.aircraftData.typicalVRef ??= 140;

    this.lnavActiveGlobalLegIndex.sub((newIdx) => {
      if (newIdx < this.lastLnavActiveIdx) {
        // Reset state:
        this.useActualSpeedsOnly = false;
      }
      this.lastLnavActiveIdx = newIdx;
    });
  }

  /**
   * Calculates anticipated speed and wind data.
   * For this calculator, we always cover all the legs and ignore the start- and end-index.
   * @param legs fp legs
   * @param startIndex first index to calculate
   * @param endIndex last index to calculate
   * @param dataContext data for the calculation
   * @param out input and output array
   * @returns the array which was provided as out param
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getAnticipatedData(legs: LegDefinition[], startIndex: number, endIndex: number, dataContext: FlightPathAnticipatedDataContext,
    out: readonly FlightPathAnticipatedData[]): readonly FlightPathAnticipatedData[] {

    if (!this.useActualSpeedsOnly && legs.length > 3) {
      // All the speed forecast considerations are based on the MAP waypoint:
      const mapLegIndex = legs.findIndex(leg => leg.leg.fixTypeFlags === FixTypeFlags.MAP);
      const mapLeg = legs[mapLegIndex];
      const totalFlightDistanceMt = mapLeg?.calculated?.cumulativeDistance;
      const finalAltitudeMt = mapLeg?.leg.altitude1;
      const currentToDestDistanceMt = UnitType.NMILE.convertTo(this.lnavDistanceToDestNm.get(), UnitType.METER);
      const blendOverThresholdMt = 5000;

      // Variables to maintain state beyond and inside the leg-loop:
      let tasKnots = 200; // Default to be used for the missed approach legs
      let actSpdConstraint: number | undefined;
      let actSpdConstraintIndex = mapLegIndex;
      const fafAltMt = finalAltitudeMt + 2000 * Avionics.Utils.FEET2METER; // FAF is simply set as MAP alt + 2000 ft approximately

      // Continue, if the required LNAV data could be retrieved:
      if (totalFlightDistanceMt && finalAltitudeMt) {
        // We iterate and determine forecasted radii for each waypoint along the flightplan in reverse direction
        // until the forecasted 3° slope is busting the 10k alt limit. Above 10k we stick to the current aircraft speed.
        for (let calculatedIndex = legs.length - 1; calculatedIndex >= 0; calculatedIndex--) {
          if (calculatedIndex >= mapLegIndex) {
            // For the missed approach legs, we blend over separately based on the distance to the destination. Determine a blend over
            // factor based on the remaining distance to the destination.
            // Between 5000m + blendOverThresholdMt and 5000m, we blend over from the anticipated speed to the actual speed
            // (becoming 0 when 5000m remain to the landing):
            if (currentToDestDistanceMt < blendOverThresholdMt + 5000) {
              const spdBlendOverFactor = currentToDestDistanceMt > 0 ? MathUtils.clamp((currentToDestDistanceMt - 5000) / blendOverThresholdMt, 0.0, 1.0) : 1.0;
              if (spdBlendOverFactor === 0.0) {
                this.useActualSpeedsOnly = true;
              }
              tasKnots = tasKnots * spdBlendOverFactor + dataContext.planeSpeed * (1.0 - spdBlendOverFactor);
            }
            out[calculatedIndex].tas = tasKnots;
          } else {
            // For the regular approach legs, we assume a 3° descent to the airport and generate altitudes and anticipated speeds
            // based on that:
            const leg = legs[calculatedIndex];

            // We only anticipate speeds for the descent, so break from the loop when earlier phases are reached:
            if (leg.verticalData.phase !== 'Descent') {
              break;
            }

            // From any waypoint, we watch out for earlier waypoints, which impose a speed constraint. This speed is used as anticipated
            // ias, if it is lower than the speed determined by the altitude based calculation:
            if (calculatedIndex < actSpdConstraintIndex) {
              for (let constraintIndex = calculatedIndex; constraintIndex > 0; constraintIndex--) {
                actSpdConstraint = this.extractUpperSpeedRestriction(legs, constraintIndex);
                if (actSpdConstraint) {
                  actSpdConstraintIndex = constraintIndex;
                  break;
                }
                // Leave actSpdConstraint as undefined, if looking ahead (actually backwards) beyond the descent phase.
                if (legs[constraintIndex].verticalData.phase !== 'Descent') {
                  actSpdConstraintIndex = constraintIndex;
                  break;
                }
              }
            }

            // For the approach waypoints, we base the anticipated speed on the assumed altitude on a 3° slope from the MAP:
            const distanceToLegMt = leg.calculated?.cumulativeDistance;
            if (distanceToLegMt) {
              // First we determine an anticipated ias, based on the anticipated altitude that follows from the distance of the waypoint
              // to the MAP point:
              let anticipatedIasKts: number;
              const legToDestDistanceMt = totalFlightDistanceMt - distanceToLegMt;
              const anticipatedAltitudeMt = legToDestDistanceMt * Math.tan(3 * Avionics.Utils.DEG2RAD) + finalAltitudeMt;
              if (anticipatedAltitudeMt < fafAltMt) {
                // Below FAF alt (during final approach), we assume a constant speed of 160 knots:
                anticipatedIasKts = Math.min(actSpdConstraint ?? Infinity, this.aircraftData.typicalVRef);
              } else if (anticipatedAltitudeMt < 10000 * Avionics.Utils.FEET2METER) {
                // Above FAF alt (but below 10k), we assume a steadily increasing speed up to the 240 limit, which is typical below 10kft:
                anticipatedIasKts = Math.min(actSpdConstraint ?? Infinity, MathUtils.lerp(anticipatedAltitudeMt, fafAltMt, 10000 * Avionics.Utils.FEET2METER,
                  this.aircraftData.typicalVRef, this.aircraftData.descentSpeedProfileKtsBelow10k));
              } else if ((anticipatedAltitudeMt < 25000 * Avionics.Utils.FEET2METER) || (anticipatedAltitudeMt < this.alt.get() * Avionics.Utils.FEET2METER)) {
                // The descent path with the anticipated slope is higher than 10k ft now, so we either use an existing previous
                // speed constraint or the typical descent speed >10kft for the aircraft:
                if (actSpdConstraint) {
                  anticipatedIasKts = actSpdConstraint;
                } else {
                  anticipatedIasKts = this.aircraftData.descentSpeedProfileKtsAbove10k;
                }
              } else {
                // Above 25k ft or when the anticipated leg alt is higher than current alt we simply break:
                break;
              }

              tasKnots = UnitType.MPS.convertTo(AeroMath.casToTasIsa(UnitType.KNOT.convertTo(anticipatedIasKts, UnitType.MPS), anticipatedAltitudeMt), UnitType.KNOT);
              tasKnots = Math.round(tasKnots / 10.0) * 10.0; // Round radius to 10 knots to get stable paths
              const currentToLegDistanceMt = currentToDestDistanceMt - legToDestDistanceMt;
              if (currentToLegDistanceMt < blendOverThresholdMt) {
                // Determine a blend over factor between anticipated speed (if blendOverThresholdMt or more away from the leg) and
                // actual speed (becoming 0 when the leg is reached):
                const spdBlendOverFactor = currentToDestDistanceMt > 0 ? MathUtils.clamp(currentToLegDistanceMt / blendOverThresholdMt, 0.0, 1.0) : 1.0;
                tasKnots = tasKnots * spdBlendOverFactor + dataContext.planeSpeed * (1.0 - spdBlendOverFactor);
              }
              out[calculatedIndex].tas = tasKnots;
            }
          }
        }
      } else {
        // In early, uninitialized states, the MAP leg and the cumulative distance might not yet be defined.
        // In these cases, we simply set a reasonable default airspeed for the second half of the flight plan.
        // This is crucial to draw the approach procedures correctly from the first time, so the initial distance calculation
        // delivers reasonable and not far off results (e.g. when loading a flight in air and current speed is high from the
        // beginning):
        for (let i = legs.length - 1; i > legs.length / 2; i--) {
          out[i].tas = 200.0;
        }
      }
    }

    return out;
  }

  /**
   * Extracts an upper speed constraint from a leg if available. The spd restrictions types considered are At or AtOrBelow
   * (Between is not used).
   * @param legs legs array
   * @param constraintIndex index of the leg to check
   * @returns speed in knots or undefined
   */
  private extractUpperSpeedRestriction(legs: LegDefinition[], constraintIndex: number): number | undefined {
    if (legs[constraintIndex].leg.speedRestrictionDesc === 1 || legs[constraintIndex].leg.speedRestrictionDesc === 3) {
      return legs[constraintIndex].leg.speedRestriction;
    }
    return undefined;
  }

}
