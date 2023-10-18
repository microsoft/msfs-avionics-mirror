/**
 * A utility class for working with common aeronautical constants and calculations.
 */
export class AeroMath {
  /** The ideal gas constant, in units of joules per mole per kelvin. */
  public static readonly R = 8.314462618153;

  /** The specific gas constant of dry air, in units of joules per kilogram per kelvin. */
  public static readonly R_AIR = 287.057;

  /** Approximate value of the adiabatic index of air near room temperature. */
  public static readonly GAMMA_AIR = 1.4;

  /** The speed of sound in air at sea level under ISA conditions, in meters per second. */
  public static readonly SOUND_SPEED_SEA_LEVEL_ISA = 340.2964;

  /** The density of air at sea level under ISA conditions, in kilograms per cubic meter. */
  public static readonly DENSITY_SEA_LEVEL_ISA = AeroMath.isaDensity(0);

  // ---- Ideal gas law relationships for air ----

  /**
   * Gets the static pressure of air, in hectopascals, given temperature and density.
   * @param temperature The temperature, in degrees Celsius.
   * @param density The density, in kilograms per cubic meter.
   * @returns The static pressure of air, in hectopascals, with the specified temperature and density.
   */
  public static pressureAir(temperature: number, density: number): number {
    return density * AeroMath.R_AIR * (temperature + 273.15) / 100;
  }

  /**
   * Gets the density of air, in kilograms per cubic meter, given static pressure and temperature.
   * @param pressure The static pressure, in hectopascals.
   * @param temperature The temperature, in degrees Celsius.
   * @returns The density of air, in kilograms per cubic meter, with the specified static pressure and temperature.
   */
  public static densityAir(pressure: number, temperature: number): number {
    return pressure * 100 / (AeroMath.R_AIR * (temperature + 273.15));
  }

  /**
   * Gets the temperature of air, in degrees Celsius, given static pressure and density.
   * @param pressure The static pressure, in hectopascals.
   * @param density The density, in kilograms per cubic meter.
   * @returns The temperature of air, in degrees Celsius, with the specified static pressure and temperature.
   */
  public static temperatureAir(pressure: number, density: number): number {
    return pressure * 100 / (AeroMath.R_AIR * density) - 273.15;
  }

  // ---- Other properties of air ----.

  /**
   * Gets the speed of sound in air, in meters per second, for a given temperature.
   * @param temperature The temperature, in degrees Celsius.
   * @returns The speed of sound in air, in meters per second, for the given temperature.
   */
  public static soundSpeedAir(temperature: number): number {
    // speed of sound = sqrt(gamma * R * T)
    // gamma = 1.4
    // R = specific gas constant of dry air
    return Math.sqrt(401.8798068394 * (temperature + 273.15));
  }

  // ---- Pressure ratios ----

  /**
   * Gets the ratio of total pressure to static pressure for a given mach number in a subsonic compressible airflow.
   * @param mach The mach number.
   * @returns The ratio of total pressure to static pressure for the specific mach number.
   */
  public static totalPressureRatioAir(mach: number): number {
    return Math.pow(1 + 0.2 * mach * mach, 3.5);
  }

  // ---- Temperature ratios ----

  /**
   * Gets the ratio of total air temperature to static air temperature for a given mach number.
   * @param mach The mach number.
   * @param recovery The recovery factor. This is a value in the range `[0, 1]` representing the fraction of the
   * kinetic energy of the airflow that is converted to heat. Defaults to 1.
   * @returns The ratio of total air temperature to static air temperature for the specified mach number.
   */
  public static totalTemperatureRatioAir(mach: number, recovery = 1): number {
    return 1 + 0.2 * recovery * mach * mach;
  }

  // ---- ISA modeling ----

  /**
   * Gets the ISA temperature, in degrees Celsius, at a given pressure altitude. The supported pressure altitude range
   * is from -610 to 80000 meters above MSL. This method will return the temperature at -610 meters for all altitudes
   * below this range, and the temperature at 80000 meters for all altitudes above this range.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The ISA temperature, in degrees Celsius, for the specified pressure altitude.
   */
  public static isaTemperature(altitude: number): number {
    // We don't use lookup table for perf reasons.
    if (altitude < 11000) {
      return 15 + Math.max(altitude, -610) * -0.0065;
    } else if (altitude < 20000) {
      return -56.5;
    } else if (altitude < 32000) {
      return -56.5 + (altitude - 20000) * 0.001;
    } else if (altitude < 47000) {
      return -44.5 + (altitude - 32000) * 0.0028;
    } else if (altitude < 51000) {
      return -2.5;
    } else if (altitude < 71000) {
      return -2.5 + (altitude - 51000) * -0.0028;
    } else {
      return -58.5 + (Math.min(altitude, 80000) - 71000) * -0.002;
    }
  }

  /**
   * Gets the ISA pressure, in hectopascals, at a given pressure altitude. The supported pressure altitude range is
   * from -610 to 80000 meters above MSL. This method will return the pressure at -610 meters for all altitudes below
   * this range, and the pressure at 80000 meters for all altitudes above this range.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The ISA pressure, in hectopascals, for the specified pressure altitude.
   */
  public static isaPressure(altitude: number): number {
    // ISA pressure modeling uses the following equation:
    // dP/dh = -density/g

    // Using the ideal gas law to substitute density with temperature and solving the above DE generates two
    // different equations depending on whether temperature is constant with respect to altitude:

    // Temperature varies with altitude:
    // P(h) = P(h0) * (1 + dT/dh / T(h0) * (h - h0)) ^ (-g / (R * dT/dh))

    // Temperature constant with altitude:
    // P(h) = P(h0) * e^(-g / (R * T) * (h - h0))

    // g = gravitational acceleration
    // R = specific gas constant of dry air

    if (altitude < -610) {
      // Modeling stops at -610 meters, so return the pressure for -610 meters for any altitude below this.
      return 1088.707021458965;
    } else if (altitude <= 11000) {
      // Troposphere
      // dT/dh = -0.0065 kelvin per meter
      return 1013.25 * Math.pow(1 - 2.25577e-5 * altitude, 5.25580);
    } else if (altitude <= 20000) {
      // Tropopause
      // dT/dh = 0
      return 226.32547681422847 * Math.exp(-1.57686e-4 * (altitude - 11000));
    } else if (altitude <= 32000) {
      // Lower stratosphere
      // dT/dh = 0.001 kelvin per meter
      return 54.7512459834976 * Math.pow(1 + 4.61574e-6 * (altitude - 20000), -34.1627);
    } else if (altitude <= 47000) {
      // Upper stratosphere
      // dT/dh = 0.0028 kelvin per meter
      return 8.68079131804552 * Math.pow(1 + 1.22458e-5 * (altitude - 32000), -12.2010);
    } else if (altitude <= 51000) {
      // Stratopause
      // dT/dh = 0
      return 1.1091650294132658 * Math.exp(-1.26225e-4 * (altitude - 47000));
    } else if (altitude <= 71000) {
      // Lower mesosphere
      // dT/dh = -0.0028 kelvin per meter
      return 0.6694542213945832 * Math.pow(1 - 1.03455e-5 * (altitude - 51000), 12.2010);
    } else if (altitude <= 80000) {
      // Upper mesosphere
      // dT/dh = -0.002 kelvin per meter
      return 0.03956893750841349 * Math.pow(1 - 9.31749e-6 * (altitude - 71000), 17.0814);
    } else {
      // Modeling stops at 80000 meters, so return the pressure for 80000 meters for any altitude above this.
      return 0.008864013902895545;
    }
  }

  /**
   * Gets the pressure altitude, in meters above MSL, corresponding to a given ISA pressure. The supported pressure
   * altitude range is from -610 to 80000 meters above MSL. This method will return -610 meters for all pressures above
   * the pressure at -610 meters, and 80000 meters for all pressures below the pressure at 80000 meters.
   * @param pressure The ISA pressure for which to get the altitude, in hectopascals.
   * @returns The pressure altitude, in meters above MSL, corresponding to the specified ISA pressure.
   */
  public static isaAltitude(pressure: number): number {
    // ISA pressure modeling uses the following equation:
    // dP/dh = -density/g

    // Using the ideal gas law to substitute density with temperature and solving the above DE generates two
    // different equations depending on whether temperature is constant with respect to altitude:

    // Temperature varies with altitude:
    // h(P) = T(h0) / dT/dh * ((P / P(h0)) ^ (-(R * dT/dh) / g) - 1) + h0

    // Temperature constant with altitude:
    // h(P) = -(R * T) / g * ln(P / P(h0)) + h0

    // g = gravitational acceleration
    // R = specific gas constant of dry air

    if (pressure > 1088.707021458965) {
      // Modeling stops at -610 meters, so return -610 meters for any pressure above the pressure at this altitude.
      return -610;
    } else if (pressure > 226.32547681422847) {
      // Troposphere
      // dT/dh = -0.0065 kelvin per meter
      return -44330.76067152236 * (Math.pow(pressure / 1013.25, 0.1902659918566155) - 1);
    } else if (pressure > 54.7512459834976) {
      // Tropopause
      // dT/dh = 0
      return -6341.717083317479 * Math.log(pressure / 226.32547681422847) + 11000;
    } else if (pressure > 8.68079131804552) {
      // Lower stratosphere
      // dT/dh = 0.001 kelvin per meter
      return 216649.984617851092 * (Math.pow(pressure / 54.7512459834976, -0.02927169105486393) - 1) + 20000;
    } else if (pressure > 1.1091650294132658) {
      // Upper stratosphere
      // dT/dh = 0.0028 kelvin per meter
      return 81660.6509987098 * (Math.pow(pressure / 8.68079131804552, -0.08196049504139005) - 1) + 32000;
    } else if (pressure > 0.6694542213945832) {
      // Stratopause
      // dT/dh = 0
      return -7922.360863537334 * Math.log(pressure / 1.1091650294132658) + 47000;
    } else if (pressure > 0.03956893750841349) {
      // Lower mesosphere
      // dT/dh = -0.0028 kelvin per meter
      return -96660.38374172345 * (Math.pow(pressure / 0.6694542213945832, 0.08196049504139005) - 1) + 51000;
    } else if (pressure > 0.008864013902895545) {
      // Upper mesosphere
      // dT/dh = -0.002 kelvin per meter
      return -107325.0414006347 * (Math.pow(pressure / 0.03956893750841349, 0.05854321074385004) - 1) + 71000;
    } else {
      // Modeling stops at 80000 meters, so return 80000 meters for any pressure below the pressure at this altitude.
      return 80000;
    }
  }

  /**
   * Gets the ISA density, in kilograms per cubic meter, at a given pressure altitude. The supported pressure altitude
   * range is from -610 to 80000 meters above MSL. This method will return the density at -610 meters for all altitudes
   * below this range, and the density at 80000 meters for all altitudes above this range.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The ISA density, in kilograms per cubic meter, for the specified pressure altitude.
   */
  public static isaDensity(altitude: number, deltaIsa = 0): number {
    return AeroMath.densityAir(AeroMath.isaPressure(altitude), AeroMath.isaTemperature(altitude) + deltaIsa);
  }

  /**
   * Gets the speed of sound, in meters per second, at a given pressure altitude under ISA conditions.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The speed of sound, in meters per second, at the specified pressure altitude under ISA conditions.
   */
  public static soundSpeedIsa(altitude: number, deltaIsa = 0): number {
    return this.soundSpeedAir(AeroMath.isaTemperature(altitude) + deltaIsa);
  }

  /**
   * Gets the offset to apply to pressure altitude, in meters, to obtain indicated altitude for a given barometric setting.
   * @param baro The barometic setting for which to get the offset, in hectopascals.
   * @returns The offset to apply to pressure altitude, in meters, to obtain indicated altitude for the specified barometric setting.
   */
  public static baroPressureAltitudeOffset(baro: number): number {
    return 44307.694 * (Math.pow(baro / 1013.25, 0.190284) - 1);
  }


  // ---- Speed conversions ----

  // The following section contains methods for converting between different speeds: CAS, TAS, EAS, and mach.
  // All conversions are based on the following:

  // Constants:
  // gamma (adiabatic index of air) = 1.4
  // pressure_sea_level_isa = 1013.25 hPa
  // sound_speed_sea_level_isa = 340.2964 m/s
  // density_sea_level_isa = 1.22498 kg/m^3

  // Relationship between mach and impact pressure (only valid for subsonic flow):
  // mach = sqrt(5 * ((impact_pressure / static_pressure + 1) ^ ((gamma - 1) / gamma)) - 1)
  // impact_pressure = static_pressure * ((1 + 0.2 * mach ^ 2) ^ (gamma / (gamma - 1)) - 1)

  // Relationship between mach and airspeed:
  // mach = airspeed / sound_speed
  // airspeed = mach * sound_speed

  // Relationship between EAS and TAS:
  // eas = tas * sqrt(density / density_sea_level_isa)

  /**
   * Converts true airspeed (TAS) to mach number.
   * @param tas The true airspeed to convert, in the same units as `soundSpeed`.
   * @param soundSpeed The speed of sound, in the same units as `tas`.
   * @returns The mach number equivalent of the specified true airspeed.
   */
  public static tasToMach(tas: number, soundSpeed: number): number {
    return tas / soundSpeed;
  }

  /**
   * Converts true airspeed (TAS) to mach number under ISA conditions.
   * @param tas The true airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The mach number equivalent of the specified true airspeed at the specified pressure altitude under ISA
   * conditions.
   */
  public static tasToMachIsa(tas: number, altitude: number, deltaIsa = 0): number {
    return tas / AeroMath.soundSpeedIsa(altitude, deltaIsa);
  }

  /**
   * Converts mach number to true airspeed (TAS).
   * @param mach The mach number to convert.
   * @param soundSpeed The speed of sound.
   * @returns The true airspeed equivalent of the specified mach number, in the same units as `soundSpeed`.
   */
  public static machToTas(mach: number, soundSpeed: number): number {
    return mach * soundSpeed;
  }

  /**
   * Converts mach number to true airspeed (TAS), in meters per second, under ISA conditions.
   * @param mach The mach number to convert.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The true airspeed equivalent, in meters per second, of the specified mach number at the specified
   * pressure altitude under ISA conditions.
   */
  public static machToTasIsa(mach: number, altitude: number, deltaIsa = 0): number {
    return mach * AeroMath.soundSpeedIsa(altitude, deltaIsa);
  }

  /**
   * Converts calibrated airspeed (CAS) to mach number. The conversion is only valid for subsonic speeds.
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The mach number equivalent of the specified calibrated airspeed at the specified static pressure.
   */
  public static casToMach(cas: number, pressure: number): number {
    // Calibrated airspeed is effectively the airspeed at sea level under ISA conditions that would produce the same
    // impact pressure as the airplane's observed impact pressure. Therefore, we can calculate mach from CAS by
    // calculating the impact pressure using sea level ISA conditions, then using that impact pressure to calculate
    // mach using ambient static pressure.

    const mach0 = cas / AeroMath.SOUND_SPEED_SEA_LEVEL_ISA;
    const impactPressure = 1013.25 * (Math.pow(1 + (0.2 * mach0 * mach0), 3.5) - 1);
    return Math.sqrt(5 * (Math.pow(impactPressure / pressure + 1, 2 / 7) - 1));
  }

  /**
   * Converts calibrated airspeed (CAS) to mach number under ISA conditions. The conversion is only valid for subsonic
   * speeds.
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The mach number equivalent of the specified calibrated airspeed at the specified pressure altitude under
   * ISA conditions.
   */
  public static casToMachIsa(cas: number, altitude: number): number {
    return AeroMath.casToMach(cas, AeroMath.isaPressure(altitude));
  }

  /**
   * Converts mach number to calibrated airspeed (CAS). The conversion is only valid for subsonic speeds.
   * @param mach The mach number to convert.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The calibrated airspeed equivalent in meters per second of the specified mach number at the specified
   * static pressure.
   */
  public static machToCas(mach: number, pressure: number): number {
    // Calibrated airspeed is effectively the airspeed at sea level under ISA conditions that would produce the same
    // impact pressure as the airplane's observed impact pressure. Therefore, we can calculate CAS from mach by
    // calculating the impact pressure using ambient static pressure, then using that impact pressure to calculate
    // CAS using sea level ISA conditions.

    const impactPressure = pressure * (Math.pow(1 + 0.2 * mach * mach, 3.5) - 1);
    return AeroMath.SOUND_SPEED_SEA_LEVEL_ISA * Math.sqrt(5 * (Math.pow(impactPressure / 1013.25 + 1, 2 / 7) - 1));
  }

  /**
   * Converts mach number to calibrated airspeed (CAS) under ISA conditions. The conversion is only valid for subsonic
   * speeds.
   * @param mach The mach number to convert.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The calibrated airspeed equivalent in meters per second of the specified mach number  at the specified
   * pressure altitude under ISA conditions.
   */
  public static machToCasIsa(mach: number, altitude: number): number {
    return AeroMath.machToCas(mach, AeroMath.isaPressure(altitude));
  }

  /**
   * Converts calibrated airspeed (CAS) to true airspeed (TAS).
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @param temperature The ambient static temperature, in degrees Celsius.
   * @returns The true airspeed equivalent, in meters per second, of the specified calibrated airspeed at the specified
   * ambient pressure and temperature.
   */
  public static casToTas(cas: number, pressure: number, temperature: number): number {
    return AeroMath.casToMach(cas, pressure) * AeroMath.soundSpeedAir(temperature);
  }

  /**
   * Converts calibrated airspeed (CAS) to true airspeed (TAS) under ISA conditions.
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The true airspeed equivalent, in meters per second, of the specified calibrated airspeed at the specified
   * pressure altitude under ISA conditions.
   */
  public static casToTasIsa(cas: number, altitude: number, deltaIsa = 0): number {
    return AeroMath.casToMachIsa(cas, altitude) * AeroMath.soundSpeedIsa(altitude, deltaIsa);
  }

  /**
   * Converts true airspeed (TAS) to calibrated airspeed (CAS).
   * @param tas The true airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @param temperature The ambient static temperature, in degrees Celsius.
   * @returns The calibrated airspeed equivalent, in meters per second, of the specified true airspeed at the specified
   * ambient pressure and temperature.
   */
  public static tasToCas(tas: number, pressure: number, temperature: number): number {
    return AeroMath.machToCas(tas / AeroMath.soundSpeedAir(temperature), pressure);
  }

  /**
   * Converts true airspeed (TAS) to calibrated airspeed (CAS) under ISA conditions.
   * @param tas The true airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The calibrated airspeed equivalent, in meters per second, of the specified true airspeed at the specified
   * pressure altitude under ISA conditions.
   */
  public static tasToCasIsa(tas: number, altitude: number, deltaIsa = 0): number {
    return AeroMath.machToCasIsa(tas / AeroMath.soundSpeedIsa(altitude, deltaIsa), altitude);
  }

  /**
   * Converts true airspeed (TAS) to equivalent airspeed (EAS).
   * @param tas The true airspeed to convert.
   * @param density The ambient density, in kilograms per cubic meter.
   * @returns The equivalent airspeed corresponding to the specified true airspeed at the specified ambient density.
   * The equivalent airspeed is expressed in the same units as the true airspeed.
   */
  public static tasToEas(tas: number, density: number): number {
    return tas * Math.sqrt(density / AeroMath.DENSITY_SEA_LEVEL_ISA);
  }

  /**
   * Converts true airspeed (TAS) to equivalent airspeed (EAS) under ISA conditions.
   * @param tas The true airspeed to convert.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The equivalent airspeed corresponding to the specified true airspeed at the specified pressure altitude
   * under ISA conditions. The equivalent airspeed is expressed in the same units as the true airspeed.
   */
  public static tasToEasIsa(tas: number, altitude: number, deltaIsa = 0): number {
    return AeroMath.tasToEas(tas, AeroMath.isaDensity(altitude, deltaIsa));
  }

  /**
   * Converts equivalent airspeed (EAS) to true airspeed (TAS).
   * @param eas The equivalent airspeed to convert.
   * @param density The ambient density, in kilograms per cubic meter.
   * @returns The true airspeed corresponding to the specified equivalent airspeed at the specified ambient density.
   * The true airspeed is expressed in the same units as the equivalent airspeed.
   */
  public static easToTas(eas: number, density: number): number {
    return eas * Math.sqrt(AeroMath.DENSITY_SEA_LEVEL_ISA / density);
  }

  /**
   * Converts equivalent airspeed (EAS) to true airspeed (TAS) under ISA conditions.
   * @param eas The equivalent airspeed to convert.
   * @param altitude The pressure altitude, in meters above MSL.
   * @param deltaIsa The deviation from ISA temperature, in degrees Celsius. Defaults to `0`.
   * @returns The true airspeed corresponding to the specified equivalent airspeed at the specified pressure altitude
   * under ISA conditions. The true airspeed is expressed in the same units as the equivalent airspeed.
   */
  public static easToTasIsa(eas: number, altitude: number, deltaIsa = 0): number {
    return AeroMath.easToTas(eas, AeroMath.isaDensity(altitude, deltaIsa));
  }

  /**
   * Converts mach number to equivalent airspeed (EAS).
   * @param mach The mach number to convert.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The equivalent airspeed, in meters per second, corresponding to the specified mach number at the
   * specified ambient static pressure.
   */
  public static machToEas(mach: number, pressure: number): number {
    return AeroMath.SOUND_SPEED_SEA_LEVEL_ISA * mach * Math.sqrt(pressure / 1013.25);
  }

  /**
   * Converts mach number to equivalent airspeed (EAS) under ISA conditions.
   * @param mach The mach number to convert.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The equivalent airspeed, in meters per second, corresponding to the specified mach number at the
   * specified pressure altitude under ISA conditions.
   */
  public static machToEasIsa(mach: number, altitude: number): number {
    return AeroMath.machToEas(mach, AeroMath.isaPressure(altitude));
  }

  /**
   * Converts equivalent airspeed (EAS) to mach number.
   * @param eas The equivalent airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The mach number corresponding to the specified equivalent airspeed at the specified ambient static
   * pressure.
   */
  public static easToMach(eas: number, pressure: number): number {
    return eas * Math.sqrt(1013.25 / pressure) / AeroMath.SOUND_SPEED_SEA_LEVEL_ISA;
  }

  /**
   * Converts equivalent airspeed (EAS) to mach number under ISA conditions.
   * @param eas The equivalent airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The mach number corresponding to the specified equivalent airspeed at the specified pressure altitude
   * under ISA conditions.
   */
  public static easToMachIsa(eas: number, altitude: number): number {
    return AeroMath.easToMach(eas, AeroMath.isaPressure(altitude));
  }

  /**
   * Converts calibrated airspeed (CAS) to equivalent airspeed (EAS). The conversion is only valid for subsonic speeds.
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The equivalent airspeed, in meters per second, corresponding to the specified calibrated airspeed at the
   * specified ambient static pressure.
   */
  public static casToEas(cas: number, pressure: number): number {
    // The below is a slightly optimized concatenation of the CAS-to-mach and mach-to-EAS conversions.

    const mach0 = cas / AeroMath.SOUND_SPEED_SEA_LEVEL_ISA;
    const impactPressure = 1013.25 * (Math.pow(1 + (0.2 * mach0 * mach0), 3.5) - 1);
    return AeroMath.SOUND_SPEED_SEA_LEVEL_ISA * Math.sqrt(5 * pressure / 1013.25 * (Math.pow(impactPressure / pressure + 1, 2 / 7) - 1));
  }

  /**
   * Converts calibrated airspeed (CAS) to equivalent airspeed (EAS) under ISA conditions. The conversion is only valid
   * for subsonic speeds.
   * @param cas The calibrated airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The equivalent airspeed, in meters per second, corresponding to the specified calibrated airspeed at the
   * specified pressure altitude under ISA conditions.
   */
  public static casToEasIsa(cas: number, altitude: number): number {
    return AeroMath.casToEas(cas, AeroMath.isaPressure(altitude));
  }

  /**
   * Converts equivalent airspeed (EAS) to calibrated airspeed (CAS). The conversion is only valid for subsonic speeds.
   * @param eas The equivalent airspeed to convert, in meters per second.
   * @param pressure The ambient static pressure, in hectopascals.
   * @returns The calibrated airspeed, in meters per second, corresponding to the specified equivalent airspeed at the
   * specified ambient static pressure.
   */
  public static easToCas(eas: number, pressure: number): number {
    return AeroMath.machToCas(AeroMath.easToMach(eas, pressure), pressure);
  }

  /**
   * Converts equivalent airspeed (EAS) to calibrated airspeed (CAS) under ISA conditions. The conversion is only valid
   * for subsonic speeds.
   * @param eas The equivalent airspeed to convert, in meters per second.
   * @param altitude The pressure altitude, in meters above MSL.
   * @returns The calibrated airspeed, in meters per second, corresponding to the specified equivalent airspeed at the
   * specified pressure altitude under ISA conditions.
   */
  public static easToCasIsa(eas: number, altitude: number): number {
    return AeroMath.easToCas(eas, AeroMath.isaPressure(altitude));
  }

  // ---- Lift and drag equations ----

  // force_coefficient = force / (dynamic_pressure * area)
  // dynamic_pressure = 0.5 * density * speed ^ 2

  /**
   * Calculates a fluid flow force coefficient given a force and flow parameters.
   * @param force The flow force, in newtons.
   * @param area The reference area, in meters squared.
   * @param arg3 The flow dynamic pressure, in hectopascals, if `arg4` is not defined; otherwise the flow density, in
   * kilograms per cubic meter.
   * @param arg4 The flow speed, in meters per second.
   * @returns The fluid flow force coefficient given the specified force and flow parameters.
   */
  private static flowCoefFromForce(force: number, area: number, arg3: number, arg4?: number): number {
    const dynamicPressure = arg4 === undefined ? arg3 * 100 : 0.5 * arg3 * arg4 * arg4;
    return force / (dynamicPressure * area);
  }

  /**
   * Calculates a fluid flow force given a coefficient and flow parameters.
   * @param coef The flow force coefficient.
   * @param area The reference area, in meters squared.
   * @param arg3 The flow dynamic pressure, in hectopascals, if `arg4` is not defined; otherwise the flow density, in
   * kilograms per cubic meter.
   * @param arg4 The flow speed, in meters per second.
   * @returns The fluid flow force given the specified coefficient and flow parameters.
   */
  private static flowForceFromCoef(coef: number, area: number, arg3: number, arg4?: number): number {
    const dynamicPressure = arg4 === undefined ? arg3 * 100 : 0.5 * arg3 * arg4 * arg4;
    return coef * dynamicPressure * area;
  }

  public static liftCoefficient: {
    /**
     * Calculates the lift coefficient given certain parameters.
     * @param lift The lift force, in newtons.
     * @param area The wing area, in meters squared.
     * @param density The flow density, in kilograms per cubic meter.
     * @param flowSpeed The flow speed, in meters per second.
     * @returns The lift coefficient given the specified parameters.
     */
    (lift: number, area: number, density: number, flowSpeed: number): number;
    /**
     * Calculates the lift coefficient given certain parameters.
     * @param lift The lift force, in newtons.
     * @param area The wing area, in meters squared.
     * @param dynamicPressure The flow dynamic pressure, in hectopascals.
     * @returns The lift coefficient given the specified parameters.
     */
    (lift: number, area: number, dynamicPressure: number): number;
  } = AeroMath.flowCoefFromForce;

  public static lift: {
    /**
     * Calculates lift force, in newtons, given certain parameters.
     * @param cl The lift coefficient.
     * @param area The wing area, in meters squared.
     * @param density The flow density, in kilograms per cubic meter.
     * @param flowSpeed The flow speed, in meters per second.
     * @returns The lift force, in newtons, given the specified parameters.
     */
    (cl: number, area: number, density: number, flowSpeed: number): number;
    /**
     * Calculates lift force, in newtons, given certain parameters.
     * @param cl The lift coefficient.
     * @param area The wing area, in meters squared.
     * @param dynamicPressure The flow dynamic pressure, in hectopascals.
     * @returns The lift force, in newtons, given the specified parameters.
     */
    (cl: number, area: number, dynamicPressure: number): number;
  } = AeroMath.flowForceFromCoef;

  public static dragCoefficient: {
    /**
     * Calculates the drag coefficient given certain parameters.
     * @param lift The drag force, in newtons.
     * @param area The wing area, in meters squared.
     * @param density The flow density, in kilograms per cubic meter.
     * @param flowSpeed The flow speed, in meters per second.
     * @returns The drag coefficient given the specified parameters.
     */
    (drag: number, area: number, density: number, flowSpeed: number): number;
    /**
     * Calculates the drag coefficient given certain parameters.
     * @param drag The drag force, in newtons.
     * @param area The wing area, in meters squared.
     * @param dynamicPressure The flow dynamic pressure, in hectopascals.
     * @returns The drag coefficient given the specified parameters.
     */
    (drag: number, area: number, dynamicPressure: number): number;
  } = AeroMath.flowCoefFromForce;

  public static drag: {
    /**
     * Calculates drag force, in newtons, given certain parameters.
     * @param cd The drag coefficient.
     * @param area The wing area, in meters squared.
     * @param density The flow density, in kilograms per cubic meter.
     * @param flowSpeed The flow speed, in meters per second.
     * @returns The drag force, in newtons, given the specified parameters.
     */
    (cd: number, area: number, density: number, flowSpeed: number): number;
    /**
     * Calculates drag force, in newtons, given certain parameters.
     * @param cd The drag coefficient.
     * @param area The wing area, in meters squared.
     * @param dynamicPressure The flow dynamic pressure, in hectopascals.
     * @returns The drag force, in newtons, given the specified parameters.
     */
    (cd: number, area: number, dynamicPressure: number): number;
  } = AeroMath.flowForceFromCoef;
}