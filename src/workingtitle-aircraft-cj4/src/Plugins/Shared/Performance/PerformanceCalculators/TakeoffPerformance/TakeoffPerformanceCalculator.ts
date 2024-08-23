import { TakeoffPerformanceCalculatorResults } from '@microsoft/msfs-wt21-shared';

/**
 * The Takeoff performance calculator
 */
export class TakeoffPerformanceCalculator {


  /**
   * Adjusts takeoff distance for runway slope
   *
   * @param distance pre-slope distance
   * @param slope    slope in percent
   *
   * @returns factor
   */
  private static takeoffSlopeAdjustment(distance: number, slope: number): number {
    if (slope > 0) {
      const constFactor = 0.0045;
      const expFactor = 0.00044;

      return distance + (((constFactor * Math.exp(expFactor * distance)) * slope) * distance * 10);
    } else if (slope < 0) {
      const stdDev = 0.4;
      const meanVal = 1;

      return (((3 * (distance / 100)) * (1 / (stdDev * Math.sqrt(6.283185))) * Math.exp(-0.5 * Math.pow((((-1 * slope) - meanVal) / stdDev), 2))) + distance)
        - Math.min(-1 * slope, 1) * ((Math.max(3200, distance) - 3200) / 8);
    } else {
      return distance;
    }
  }

  /**
   * Calculates takeoff performance figures
   *
   * @param tow                 takeoff weight in lbs
   * @param takeoffFlaps        takeoff flaps, 0 or 15 degrees
   * @param takeoffOat          takeoff outside air temperature, degrees celsius
   * @param takeoffPressAlt     takeoff pressure altitude
   * @param depRunwayDirection  runway heading
   * @param depRunwaySlope      runway slope in %
   * @param depRunwayCondition  runway condition
   * @param depWindDir          takeoff wind direction
   * @param depWindSpeed        takeoff wind speed
   * @param takeoffAntiIce      whether anti-tce is active
   *
   * @returns calculation results {@link TakeoffPerformanceCalculatorResults}
   */
  static calculate(
    tow: number,
    takeoffFlaps: 0 | 1,
    takeoffOat: number,
    takeoffPressAlt: number,
    depRunwayDirection: number | null,
    depRunwaySlope: number,
    depRunwayCondition: number,
    depWindDir: number | null,
    depWindSpeed: number | null,
    takeoffAntiIce: 0 | 1,
  ): TakeoffPerformanceCalculatorResults {
    let endTakeoffDist;

    // Finds the sea level distance based on weight
    const seaLevelDist = (tow - 11000) * .1512 + 1568;

    // Finds the distance you would travel further than the sea level value for a given pressure altitude.
    // That value is then added to the previous line number to get the distance for a given weight and given altitude
    endTakeoffDist = ((tow - 11000) * .0000126 + .05775) * takeoffPressAlt + seaLevelDist;

    // Amount of feet per degree based on weight
    const takeoffWeightTempFactor = ((tow - 11000) * .000556) + 5.22;
    // Amount of feet per degree based on altitude which is then added to the weight factor
    const takeoffTempFactor = (((tow - 11000) * .0001702) + 1.04) + takeoffWeightTempFactor;

    // This line is for the exception where you are hot, high, and heavy,
    // the OAT effects really make a big difference hence the 120 feet per degree factor
    if (tow > 15000 && takeoffOat > 5 && takeoffPressAlt > 4000) {
      endTakeoffDist = endTakeoffDist + (takeoffOat * 50);
    } else {
      if (takeoffOat > 0) { //Takeoff distance change by temp above 0
        endTakeoffDist = endTakeoffDist + (takeoffOat * takeoffTempFactor);
      }
      if (takeoffOat < 0) { //Takeoff distance change by temp below 0
        endTakeoffDist = endTakeoffDist - (takeoffOat * takeoffTempFactor);
      }
    }

    // Sea level V Speeds at 0C for a given weight
    let v1 = ((tow - 11000) * .00229) + 85;
    let vr = ((tow - 11000) * .00147) + 92;
    let v2 = ((tow - 11000) * .0009819) + 109;

    // Vspeed change based on weight
    v1 = v1 + ((tow - 11000) * .00229);
    vr = vr + ((tow - 11000) * .00147);
    v2 = v2 + ((tow - 11000) * .000818);

    // Vspeed changed for pressure altitude
    v1 = v1 - (takeoffPressAlt * .000375);
    vr = vr - (takeoffPressAlt * .000375);
    v2 = v2 - (takeoffPressAlt * .000625);

    // Changes in V Speeds by temp by weight.  Below 0 degrees, the change is negligible so it's not included
    const v1WeightFactorAbove = .055 + ((tow - 11000) * .00002733);
    const vRWeightFactorAbove = .203 - ((tow - 11000) * .00001816);
    const v2WeightFactorAbove = .314 - ((tow - 11000) * .00005139);

    // V speed adjustment based on temperature above zero
    if (takeoffOat > 0) {
      v1 = v1 - (takeoffOat * v1WeightFactorAbove);
      vr = vr - (takeoffOat * vRWeightFactorAbove);
      v2 = v2 - (takeoffOat * v2WeightFactorAbove);
    }

    // If takeoff flaps are set to 0
    if (takeoffFlaps == 0) {
      endTakeoffDist = endTakeoffDist * 1.33;
      v1 = v1 + 9;
      vr = vr + 14;
      v2 = v2 + 14;
    }

    // Ensures VR is never less than V1
    if (vr < v1) {
      vr = v1;
    }

    // If the runway is wet
    if (depRunwayCondition == 1) {
      endTakeoffDist = endTakeoffDist * 1.1;
    }

    // If anti-ice is turned on
    if (takeoffAntiIce === 1) {
      endTakeoffDist = endTakeoffDist * 1.03;
    }

    // Number of feet per 1 kt of tailwind to add based on weight and altitude
    const tailWindFactor = (((tow - 11000) * .00000159) + .00275) * takeoffPressAlt + ((tow - 11000) * .0065 + 60);

    if (depWindDir && depWindSpeed && depRunwayDirection) {
      const headwind = Math.trunc(depWindSpeed * (Math.cos((depRunwayDirection * Math.PI / 180) - (depWindDir * Math.PI / 180))));

      if (headwind > 0) {
        endTakeoffDist = endTakeoffDist - (headwind * 23);
      } else {
        endTakeoffDist = endTakeoffDist - (headwind * tailWindFactor);
      }
    }

    // Slope
    if (depRunwaySlope != 0) {
      endTakeoffDist = TakeoffPerformanceCalculator.takeoffSlopeAdjustment(endTakeoffDist, depRunwaySlope);
    }

    return {
      v1, vr, v2,
      takeoffLength: endTakeoffDist
    };
  }

}
