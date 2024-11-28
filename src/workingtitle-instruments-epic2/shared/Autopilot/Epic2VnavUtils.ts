import { FlightPlan, PluginSystem, TocBocDetails, UnitType, VerticalFlightPlan, VNavConstraint, VNavUtils } from '@microsoft/msfs-sdk';

import { Epic2AvionicsPlugin, Epic2PluginBinder } from '../Epic2AvionicsPlugin';

/** An interface for the Epic 2 Vertical Predictions which are aircraft specific */
export interface Epic2VerticalPredictionFunctions {
  /**
   * A function which when given altitude in feet and weight in pounds will return the predicted climb rate based on ISA + 0C conditions
   */
  getClimbRate: (alt: number, weight: number) => number
}

/** Utilities for Epic 2 VNAV */
export class Epic2VnavUtils {
  /**
   * Gets an interface which defines the various vnav prediction functions
   * @param pluginSystem The upper MFD plugin system
   * @returns An interface of aircraft specific vertical predictions
   */
  public static getVerticalPredictionFunctions(pluginSystem: PluginSystem<Epic2AvionicsPlugin, Epic2PluginBinder>): Epic2VerticalPredictionFunctions {
    return {
      getClimbRate: Epic2VnavUtils.getClimbRateFunction(pluginSystem)
    };
  }

  /**
   * Gets a function which will get the predicted climb rate at a given altitude
   * @param pluginSystem The plugin system
   * @returns A function which when given altitude in ft and weight in pounds will return the climb rate
   */
  private static getClimbRateFunction(pluginSystem: PluginSystem<Epic2AvionicsPlugin, Epic2PluginBinder>): (alt: number, weight: number) => number {
    return (alt: number, weight: number) => {
      let climbRate: number | undefined;
      pluginSystem.callPlugins((p: any) => {
        if (p.getClimbRate !== undefined) {
          const c = p.getClimbRate(alt, weight);
          if (c !== undefined && climbRate !== undefined) {
            throw new Error('Epic2VnavUtils: Multiple plugins tried to provide getClimbRate!');
          }
          climbRate = c;
        }
      });

      return climbRate ?? 800;
    };
  }

  /**
   * Gets the average climb rate between two altitudes
   * @param predictionFunctions The aircraft specific vertical prediction functions
   * @param currentAlt The current altitude
   * @param desiredAlt The desired altitude
   * @param weight The aircraft weight
   * @param verticalSpeed The current vertical speed
   * @returns Climb rate in feet per minute
   */
  private static getClimbRateFromCurrentAlt(
    predictionFunctions: Epic2VerticalPredictionFunctions,
    currentAlt: number,
    desiredAlt: number,
    weight: number,
    verticalSpeed: number
  ): number {
    const rate1 = Math.max(predictionFunctions.getClimbRate(UnitType.FOOT.convertFrom(currentAlt, UnitType.METER), weight), verticalSpeed);
    const rate2 = predictionFunctions.getClimbRate(UnitType.FOOT.convertFrom(desiredAlt, UnitType.METER), weight);

    return (rate1 + rate2) / 2;
  }

  /**
   * Calculates the cruise TOC
   * @param predictionFunctions The aircraft specific vertical prediction functions
   * @param lateralPlan The lateral flight plan.
   * @param verticalPlan The vertical flight plan.
   * @param activeLegIndex The current active leg index.
   * @param distanceAlongLeg The distance the plane is along the current leg in meters.
   * @param currentGroundSpeed The current ground speed, in knots.
   * @param currentAltitude The current indicated altitude in meters.
   * @param currentWeight The current weight in pounds
   * @param cruiseAltitude The cruise altitude, in meters.
   * @param currentVS The current VS in feet
   * @param out The object to which to write the TOC/BOC details.
   * @returns The VNAV TOC/BOC to cruise altitude details.
   */
  public static calculateCruiseToc(
    predictionFunctions: Epic2VerticalPredictionFunctions,
    lateralPlan: FlightPlan,
    verticalPlan: VerticalFlightPlan,
    activeLegIndex: number,
    distanceAlongLeg: number,
    currentGroundSpeed: number,
    currentAltitude: number,
    currentWeight: number,
    cruiseAltitude: number,
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

    const predictedVS = UnitType.METER.convertFrom(this.getClimbRateFromCurrentAlt(predictionFunctions, currentAltitude, cruiseAltitude, currentWeight, currentVS), UnitType.FOOT);
    const deltaAltitude = cruiseAltitude - currentAltitude;
    const timeToTocMin = deltaAltitude / Math.max(0, predictedVS);
    let distanceRemaining = currentGroundSpeed === 0 ? 0 : timeToTocMin * UnitType.KNOT.convertTo(currentGroundSpeed, UnitType.MPM);

    // Find the leg on which the TOC lies. The TOC is restricted to legs prior to the first descent constraint.

    let tocLegIndex: number | undefined;

    const lastLegIndex = firstDescentConstraint?.index ?? lateralPlan.length - 1;

    if (timeToTocMin < 2/60 || deltaAltitude <= 0) {
      return out;
    }

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

    {
    if (tocLegIndex === undefined) {
          // If we still haven't found the TOC yet, set it to the end of the last viable leg.
          out.tocLegIndex = lastLegIndex;
          out.tocLegDistance = 0;
        } else {
          out.tocLegIndex = tocLegIndex;
          out.tocLegDistance = -distanceRemaining;
        }
    }

    out.tocAltitude = cruiseAltitude;

    return out;
  }
}
