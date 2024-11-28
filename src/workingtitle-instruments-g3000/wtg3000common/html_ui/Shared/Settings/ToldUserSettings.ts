import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';
import { ToldLandingPerformanceResult, ToldRunwaySurfaceCondition, ToldTakeoffPerformanceResult } from '../Performance/TOLD/ToldTypes';

/**
 * TOLD (takeoff/landing) performance calculation user settings.
 */
export type ToldUserSettingTypes = {
  /** The version of the TOLD database. An empty string indicates no TOLD database is available. */
  toldDatabaseVersion: string;

  /** Whether TOLD performance calculations are enabled. */
  toldEnabled: boolean;

  // ------------ Takeoff ------------

  /** The ICAO string (V2) of the takeoff origin (either an airport or a runway). */
  toldOriginIcao: string;

  /** The takeoff distance required, in feet. A negative value indicates an uninitialized state. */
  toldTakeoffDistanceRequired: number;

  /** The takeoff weight, in pounds. A negative value indicates an uninitialized state. */
  toldTakeoffWeight: number;

  /** The takeoff runway surface condition. */
  toldTakeoffRunwaySurface: ToldRunwaySurfaceCondition;

  /** The takeoff wind direction, in degrees true. A negative value indicates an uninitialized state. */
  toldTakeoffWindDirection: number;

  /** The takeoff wind speed, in knots. A negative value indicates an uninitialized state. */
  toldTakeoffWindSpeed: number;

  /**
   * The takeoff temperature, in degrees Celsius. A value less than or equal to {@link Number.MIN_SAFE_INTEGER}
   * indicates an uninitialized state.
   */
  toldTakeoffTemperature: number;

  /** Whether it is possible to use ram air temperature for takeoff temperature. */
  toldTakeoffCanUseRat: boolean;

  /** Whether to use ram air temperature for takeoff temperature. */
  toldTakeoffUseRat: boolean;

  /**
   * The pressure setting at the takeoff runway (QNH), in hectopascals. A negative value indicates an uninitialized
   * state.
   */
  toldTakeoffPressure: number;

  /** The takeoff runway length, in feet. A negative value indicates an uninitialized state. */
  toldTakeoffRunwayLength: number;

  /**
   * The takeoff runway elevation, in feet above MSL. A value less than or equal to {@link Number.MIN_SAFE_INTEGER}
   * indicates an uninitialized state.
   */
  toldTakeoffRunwayElevation: number;

  /** The takeoff runway heading, in degrees true. A negative value indicates an uninitialized state. */
  toldTakeoffRunwayHeading: number;

  /**
   * The takeoff runway gradient, in hundredths of percent. Positive values indicate an upward slope. A value less than
   * or equal to {@link Number.MIN_SAFE_INTEGER} indicates an uninitialized state.
   */
  toldTakeoffRunwayGradient: number;

  /** The calculated pressure altitude at the takeoff runway, in feet. */
  toldTakeoffPressureAltitude: number;

  /** The index of the takeoff flaps setting. */
  toldTakeoffFlapsIndex: number;

  /** The index of the default takeoff flaps setting. A negative value indicates an unintialized state. */
  toldTakeoffFlapsIndexDefault: number;

  /** Whether anti-ice is on for takeoff. */
  toldTakeoffAntiIceOn: boolean;

  /** Whether to take credit for thrust reversers for takeoff performance calculations. */
  toldTakeoffThrustReversers: boolean;

  /** The takeoff factor, in percent. */
  toldTakeoffFactor: number;

  /** Whether takeoff is a rolling takeoff. */
  toldTakeoffRolling: boolean;

  /** The default rolling takeoff option. 0 = false and 1 = true. A negative value indicates an uninitialized state. */
  toldTakeoffRollingDefault: number;

  /**
   * The most recent takeoff performance calculation results, as a stringified JSON. An empty string indicates there
   * is no result.
   */
  toldTakeoffCalcResult: string;

  /** Whether the calculated takeoff V-speeds have been accepted. */
  toldTakeoffVSpeedsAccepted: boolean;

  // ------------ Landing ------------

  /** Whether the default destination has been applied since the last power cycle. */
  toldDestinationDefaultApplied: boolean;

  /** The ICAO string (V2) of the landing destination (either an airport or a runway). */
  toldDestinationIcao: string;

  /** The landing distance required, in feet. A negative value indicates an uninitialized state. */
  toldLandingDistanceRequired: number;

  /** Whether predicted weight can be used for the landing weight. */
  toldLandingCanUsePredictedWeight: boolean;

  /** Whether to use predicted weight instead of current weight for the landing weight. */
  toldLandingUsePredictedWeight: boolean;

  /** The landing weight, in pounds. A negative value indicates an uninitialized state. */
  toldLandingWeight: number;

  /** The landing runway surface condition. */
  toldLandingRunwaySurface: ToldRunwaySurfaceCondition;

  /** The landing wind direction, in degrees true. A negative value indicates an uninitialized state. */
  toldLandingWindDirection: number;

  /** The landing wind speed, in knots. A negative value indicates an uninitialized state. */
  toldLandingWindSpeed: number;

  /**
   * The landing temperature, in degrees Celsius. A value less than or equal to {@link Number.MIN_SAFE_INTEGER}
   * indicates an uninitialized state.
   */
  toldLandingTemperature: number;

  /**
   * The pressure setting at the landing runway (QNH), in hectopascals. A negative value indicated an uninitialized
   * state.
   */
  toldLandingPressure: number;

  /** The landing runway length, in feet. A negative value indicates an uninitialized state. */
  toldLandingRunwayLength: number;

  /**
   * The landing runway elevation, in feet above MSL. A value less than or equal to {@link Number.MIN_SAFE_INTEGER}
   * indicates an uninitialized state.
   */
  toldLandingRunwayElevation: number;

  /** The landing runway heading, in degrees true. A negative value indicates an uninitialized state. */
  toldLandingRunwayHeading: number;

  /**
   * The landing runway gradient, in hundredths of percent. Positive values indicate an upward slope. A value less than
   * or equal to {@link Number.MIN_SAFE_INTEGER} indicates an uninitialized state.
   */
  toldLandingRunwayGradient: number;

  /** The calculated pressure altitude at the landing runway, in feet. */
  toldLandingPressureAltitude: number;

  /** The index of the landing flaps setting. */
  toldLandingFlapsIndex: number;

  /** The index of the default landing flaps setting. A negative value indicates an unintialized state. */
  toldLandingFlapsIndexDefault: number;

  /** Whether anti-ice is on for landing. */
  toldLandingAntiIceOn: boolean;

  /** Whether to take credit for thrust reversers for landing performance calculations. */
  toldLandingThrustReversers: boolean;

  /** The landing factor, in percent. */
  toldLandingFactor: number;

  /** The default landing factor, in percent. A negative value indicates an uninitialized state. */
  toldLandingFactorDefault: number;

  /** Whether autothrottle is on for landing. */
  toldLandingAutothrottleOn: boolean;

  /**
   * The most recent landing performance calculation results, as a stringified JSON. An empty string indicates there
   * is no result.
   */
  toldLandingCalcResult: string;

  /** Whether the calculated landing V-speeds have been accepted. */
  toldLandingVSpeedsAccepted: boolean;
}

/**
 * Utility class for retrieving and working with TOLD (takeoff/landing) performance calculation user settings managers.
 */
export class ToldUserSettings extends DefaultUserSettingManager<ToldUserSettingTypes> {
  private static INSTANCE: DefaultUserSettingManager<ToldUserSettingTypes> | undefined;

  /**
   * Gets an instance of the TOLD (takeoff/landing) performance calculation user settings manager.
   * @param bus The event bus.
   * @returns An instance of the TOLD (takeoff/landing) performance calculation user settings manager.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<ToldUserSettingTypes> {
    return ToldUserSettings.INSTANCE ??= new ToldUserSettings(bus, [
      {
        name: 'toldDatabaseVersion',
        defaultValue: ''
      },
      {
        name: 'toldEnabled',
        defaultValue: false
      },

      // ---- Takeoff ----

      {
        name: 'toldOriginIcao',
        defaultValue: ''
      },
      {
        name: 'toldTakeoffDistanceRequired',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffWeight',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffRunwaySurface',
        defaultValue: ToldRunwaySurfaceCondition.Dry
      },
      {
        name: 'toldTakeoffWindDirection',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffWindSpeed',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffTemperature',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldTakeoffCanUseRat',
        defaultValue: false
      },
      {
        name: 'toldTakeoffUseRat',
        defaultValue: false
      },
      {
        name: 'toldTakeoffPressure',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffRunwayLength',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffRunwayElevation',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldTakeoffRunwayHeading',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffRunwayGradient',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldTakeoffPressureAltitude',
        defaultValue: 0
      },
      {
        name: 'toldTakeoffFlapsIndex',
        defaultValue: 0
      },
      {
        name: 'toldTakeoffFlapsIndexDefault',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffAntiIceOn',
        defaultValue: false
      },
      {
        name: 'toldTakeoffThrustReversers',
        defaultValue: false
      },
      {
        name: 'toldTakeoffFactor',
        defaultValue: 100
      },
      {
        name: 'toldTakeoffRolling',
        defaultValue: false
      },
      {
        name: 'toldTakeoffRollingDefault',
        defaultValue: -1
      },
      {
        name: 'toldTakeoffCalcResult',
        defaultValue: ''
      },
      {
        name: 'toldTakeoffVSpeedsAccepted',
        defaultValue: false
      },

      // ---- Landing ----

      {
        name: 'toldDestinationDefaultApplied',
        defaultValue: false
      },
      {
        name: 'toldDestinationIcao',
        defaultValue: ''
      },
      {
        name: 'toldLandingDistanceRequired',
        defaultValue: -1
      },
      {
        name: 'toldLandingCanUsePredictedWeight',
        defaultValue: false
      },
      {
        name: 'toldLandingUsePredictedWeight',
        defaultValue: false
      },
      {
        name: 'toldLandingWeight',
        defaultValue: -1
      },
      {
        name: 'toldLandingRunwaySurface',
        defaultValue: ToldRunwaySurfaceCondition.Dry
      },
      {
        name: 'toldLandingWindDirection',
        defaultValue: -1
      },
      {
        name: 'toldLandingWindSpeed',
        defaultValue: -1
      },
      {
        name: 'toldLandingTemperature',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldLandingPressure',
        defaultValue: -1
      },
      {
        name: 'toldLandingRunwayLength',
        defaultValue: -1
      },
      {
        name: 'toldLandingRunwayElevation',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldLandingRunwayHeading',
        defaultValue: -1
      },
      {
        name: 'toldLandingRunwayGradient',
        defaultValue: Number.MIN_SAFE_INTEGER
      },
      {
        name: 'toldLandingPressureAltitude',
        defaultValue: 0
      },
      {
        name: 'toldLandingFlapsIndex',
        defaultValue: 0
      },
      {
        name: 'toldLandingFlapsIndexDefault',
        defaultValue: -1
      },
      {
        name: 'toldLandingAntiIceOn',
        defaultValue: false
      },
      {
        name: 'toldLandingThrustReversers',
        defaultValue: false
      },
      {
        name: 'toldLandingFactor',
        defaultValue: 100
      },
      {
        name: 'toldLandingFactorDefault',
        defaultValue: -1
      },
      {
        name: 'toldLandingAutothrottleOn',
        defaultValue: false
      },
      {
        name: 'toldLandingCalcResult',
        defaultValue: ''
      },
      {
        name: 'toldLandingVSpeedsAccepted',
        defaultValue: false
      }
    ]);
  }

  /**
   * Parses a takeoff performance result object from a string.
   * @param resultString The stringified result object.
   * @returns The takeoff performance result object parsed from the specified string, or `undefined` if the string
   * does not define such an object.
   */
  public static parseTakeoffResultString(resultString: string): ToldTakeoffPerformanceResult | undefined {
    if (resultString === '') {
      return undefined;
    }

    try {
      const result = JSON.parse(resultString);

      if (typeof result !== 'object') {
        return undefined;
      }

      if (
        typeof result.runwayLengthAvailable === 'number'
        && typeof result.runwayLengthRequired === 'number'
        && typeof result.maxRunwayWeight === 'number'
        && typeof result.maxWeight === 'number'
        && typeof result.limitsExceeded === 'number'
        && Array.isArray(result.vSpeeds)
        && (result.vSpeeds as any[]).every(el => typeof el === 'object' && typeof el.name === 'string' && typeof el.value === 'number')
      ) {
        return result;
      }
    } catch {
      // noop
    }

    return undefined;
  }

  /**
   * Parses a landing performance result object from a string.
   * @param resultString The stringified result object.
   * @returns The landing performance result object parsed from the specified string, or `undefined` if the string
   * does not define such an object.
   */
  public static parseLandingResultString(resultString: string): ToldLandingPerformanceResult | undefined {
    if (resultString === '') {
      return undefined;
    }

    try {
      const result = JSON.parse(resultString);

      if (typeof result !== 'object') {
        return undefined;
      }

      if (
        typeof result.runwayLengthAvailable === 'number'
        && typeof result.runwayLengthRequiredRef === 'number'
        && typeof result.maxRunwayWeight === 'number'
        && typeof result.maxWeight === 'number'
        && typeof result.limitsExceeded === 'number'
        && Array.isArray(result.vSpeeds)
        && (result.vSpeeds as any[]).every(el => typeof el === 'object' && typeof el.name === 'string' && typeof el.value === 'number')
      ) {
        return result;
      }
    } catch {
      // noop
    }

    return undefined;
  }
}