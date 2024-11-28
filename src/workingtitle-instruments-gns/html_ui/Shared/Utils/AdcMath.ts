import { NavMath, UnitType } from '@microsoft/msfs-sdk';

/**
 * Air Data Computer Math Utility Class.
 */
export class AdcMath {

  /** ISA temp at Sea Level in Kelvin  */
  private static readonly slIsaTemp = 288.15;

  /** ISA pressure at Sea Level in Pascals  */
  private static readonly slIsaPres = 101325;

  /** Specific heat ratio for air  */
  private static readonly gamma = 1.4;

  /** Constant: gamma over gamma minus 1 */
  private static readonly gammaOverGammaMinus1 = AdcMath.gamma / (AdcMath.gamma - 1);

  /** Constant: gamma minus 1 over gamma */
  private static readonly gammaMinus1OverGamma = (AdcMath.gamma - 1) / AdcMath.gamma;

  /** Specific gas constant  */
  private static readonly gas = 287.05;

  /** Specific heat ratio for air times gas constant.  */
  private static readonly gammaGas = AdcMath.gamma * AdcMath.gas;

  /** Specific heat ratio for air times gas constant divided per cubic ft.  */
  private static readonly gammaGasVolume = AdcMath.gammaGas / Math.pow(UnitType.FOOT.convertTo(1, UnitType.METER), 2);

  /** Constant: gammaGas * slIsaTemp */
  private static readonly gammaGasSl = AdcMath.gammaGas * AdcMath.slIsaTemp;

  /** Constant: sqrt gammaGasSl * nm */
  private static readonly sqrtGammaGasSlNm = Math.sqrt(AdcMath.gammaGasSl) * UnitType.METER.convertTo(3600.0, UnitType.NMILE);

  /** Constant: 5 * sqrtGammaGasSlNm squared  */
  private static readonly sqrtGammaGasSlNmSqd5 = 5.0 * AdcMath.sqrtGammaGasSlNm * AdcMath.sqrtGammaGasSlNm;

  /** Atmospheric Lapse Rate Constant (Kelvin per foot)  */
  private static readonly lapseFt = 0.0019812;

  /** Fluid density of Air in kg/m^3.  */
  private static readonly airDensity = 1.225;


  /**
   * Gets the ISA Standard Temp and Press from Altitude.
   * @param altitude The altitude in feet.
   * @returns an array of [temp K, pressure PA]
   */
  public static calcIsaFromAltitude(altitude: number): number[] {
    let temp = 0.0;
    let pressure = 0.0;

    if (altitude <= 36089) {
      // 36089 is the altitude of the top of the troposphere
      temp = AdcMath.slIsaTemp + (-AdcMath.lapseFt * altitude);
      pressure = AdcMath.slIsaPres * Math.pow((AdcMath.slIsaTemp / temp), (0.034163203 / -0.0065));
    } else if (altitude <= 65616) {
      // 65616 is the altitude of the tropopause
      // 22632.06 is the pressure at the base of the tropopause in PA
      const tropoPres = 22632.06;
      const tropoTemp = 216.65;
      temp = tropoTemp;
      pressure = tropoPres * Math.exp((0.010412944 / 216.65) * (65616 - altitude));
    } else {
      temp = NaN;
      pressure = NaN;
    }

    return [temp, pressure];
  }

  /**
   * Calculate the pressure altitude from Indicated Altitude and Sea Level Pressure.
   * @param indicatedAltitude The indicated altitude.
   * @param baroSettingInHg The altimeter setting in inHg.
   * @returns The Pressure Altitude.
   */
  public static calcPressureAltitude(indicatedAltitude: number, baroSettingInHg: number): number {
    return indicatedAltitude + (1000 * (29.92 - baroSettingInHg));
  }

  /**
   * Calculate the static pre
   * @param indicatedAltitude The indicated altitude.
   * @param baroSettingInHg The altimeter setting in inHg.
   * @returns The Static Pressure in inHg.
   */
  public static calcStaticPressure(indicatedAltitude: number, baroSettingInHg: number): number {
    return AdcMath.calcIsaFromAltitude(AdcMath.calcPressureAltitude(indicatedAltitude, baroSettingInHg))[1];
  }

  /**
   * Calculate the Impact Pressure.
   * @param cas Calibrated Airspeed in knots.
   * @returns the Impact Pressure in Pa.
   */
  public static calcImpactPressure(cas: number): number {
    return AdcMath.airDensity * Math.pow(UnitType.KNOT.convertTo(cas, UnitType.MPS), 2) / 2;
  }

  /**
   * Calculate the Mach number from airspeed, altitude and pressure.
   * @param cas Calibrated Airspeed in knots.
   * @param indicatedAltitude Indicated Altitude in Feet.
   * @param baroSettingInHg The local altimeter setting in inHg.
   * @returns The current Mach Number.
   */
  public static calcMachFromSpeedAltitudePressure(cas: number, indicatedAltitude: number, baroSettingInHg: number): number {
    const impactPressure = AdcMath.calcImpactPressure(cas);
    const staticPressure = AdcMath.calcStaticPressure(indicatedAltitude, baroSettingInHg);
    return Math.sqrt(5 * (Math.pow((impactPressure / staticPressure) + 1, 2 / 7) - 1));
  }

  /**
   * Calculate static air temperature (SAT, also OAT), from total air temperature (TAT) and Mach.
   * @param tat Total Air Temp in degrees C.
   * @param mach Mach number.
   * @returns The Static Air Temperature in degrees C.
   */
  public static calcSatFromTatAndMach(tat: number, mach: number): number {
    // Gamma minus 1 / 2 = 0.2
    return UnitType.KELVIN.convertTo(UnitType.CELSIUS.convertTo(tat, UnitType.KELVIN) / (1 + (Math.pow(mach, 2) * 0.2)), UnitType.CELSIUS);
  }

  /**
   * Calculate the True Airspeed from Altitude, Temperature and Calibrated Airspeed.
   * @param altitude Altitude in Feet.
   * @param tat Total Air Temp in degrees C.
   * @param cas Calibrated Airspeed in KT.
   * @param baroSettingInHg The altimeter setting in inHg.
   * @returns True Airspeed in KT.
   */
  public static calcTasfromCas(altitude: number, tat: number, cas: number, baroSettingInHg: number): number {

    const pressureAltitude = AdcMath.calcPressureAltitude(altitude, baroSettingInHg);
    const isa = AdcMath.calcIsaFromAltitude(pressureAltitude);
    const isaPres = isa[1];
    const mach = AdcMath.calcMachFromSpeedAltitudePressure(cas, altitude, baroSettingInHg);
    const temp = UnitType.CELSIUS.convertTo(AdcMath.calcSatFromTatAndMach(tat, mach), UnitType.KELVIN);

    const alpha = Math.sqrt(AdcMath.gammaGasVolume * temp);

    const tas = Math.sqrt(5) * alpha * Math.sqrt(Math.pow(((AdcMath.slIsaPres / isaPres) *
      (Math.pow((cas * cas / AdcMath.sqrtGammaGasSlNmSqd5) + 1, AdcMath.gammaOverGammaMinus1) - 1) + 1), AdcMath.gammaMinus1OverGamma) - 1);

    return UnitType.FPS.convertTo(tas, UnitType.KNOT);
  }

  /**
   * Calculate density altitude from indicated altitude, barometer setting and static air temperature.
   * @param indicatedAltitude indicated altitude in feet (ft)
   * @param baroSettingInHg barometer setting in inches of mercury (inHg)
   * @param sat static air temperature in degrees celsius (°C)
   * @returns density altitude in feet (ft)
   */
  public static calcDensityAltitude(indicatedAltitude: number, baroSettingInHg: number, sat: number): number {

    const stationPressurePa = AdcMath.calcStaticPressure(indicatedAltitude, baroSettingInHg);
    const stationPressureinHg = UnitType.HPA.convertTo(stationPressurePa / 100, UnitType.IN_HG);
    const tempR = 459.67 + UnitType.CELSIUS.convertTo(sat, UnitType.FAHRENHEIT);

    // NWS Calculation for ASOS/AWOS
    return 145422.16 * (1 - Math.pow(17.326 * stationPressureinHg / tempR, 0.235));
  }

  /**
   * Calculate observed wind from true airspeed, ground speed, magnetic heading and magnetic track.
   * @param tas The true airspeed in KT.
   * @param gs The ground speed in KT.
   * @param heading The current magnetic heading in degrees.
   * @param track The current magnetic ground track in degrees.
   * @returns Array of [wind direction degrees mag, wind speed kt].
   */
  public static calcWind(tas: number, gs: number, heading: number, track: number): number[] {

    const headingRad = UnitType.DEGREE.convertTo(heading, UnitType.RADIAN);
    const trackRad = UnitType.DEGREE.convertTo(track, UnitType.RADIAN);

    const windComponentNorth = gs * Math.cos(trackRad) - tas * Math.cos(headingRad);
    const windComponentEast = gs * Math.sin(trackRad) - tas * Math.sin(headingRad);

    const windDirection = NavMath.normalizeHeading(90 - Math.round(UnitType.RADIAN.convertTo(Math.atan2(-windComponentNorth, -windComponentEast), UnitType.DEGREE)));
    const windSpeed = Math.sqrt(Math.pow(windComponentNorth, 2) + Math.pow(windComponentEast, 2));

    return [windDirection, windSpeed];
  }

  /**
   * Calculate headwind and crosswind components from the current ground track, wind speed and wind direction.
   * @param track Current magnetic ground track.
   * @param windSpeed Current wind speed in kt.
   * @param windDirection Current wind direction in degrees magnetic.
   * @returns Array of [headwind component in kt (+ is headwind, - is tailwind),
   * crosswind component in kt (+ is Left crosswind, - is Right crosswind)].
   */
  public static calcRelativeWindComponents(track: number, windSpeed: number, windDirection: number): number[] {

    const trackRad = UnitType.DEGREE.convertTo(track, UnitType.RADIAN);
    const windDirectionRad = UnitType.DEGREE.convertTo(windDirection, UnitType.RADIAN);

    return [
      Math.round(windSpeed * (Math.cos(trackRad - windDirectionRad))),
      Math.round(windSpeed * (Math.sin(trackRad - windDirectionRad)))
    ];
  }
}