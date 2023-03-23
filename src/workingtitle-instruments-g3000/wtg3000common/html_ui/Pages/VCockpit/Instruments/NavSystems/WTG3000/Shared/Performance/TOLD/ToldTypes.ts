import { NumberUnitInterface, UnitFamily } from '@microsoft/msfs-sdk';

/**
 * Runway surface conditions for TOLD (takeoff/landing) performance calculations.
 */
export enum ToldRunwaySurfaceCondition {
  Dry = 'Dry',
  Wet = 'Wet'
}

/**
 * A calculated TOLD (takeoff/landing) V-speed value.
 */
export type ToldVSpeed = {
  /** The name of this V-speed. */
  readonly name: string;

  /** The value of this V-speed, in knots. A negative value indicates that the speed could not be calculated. */
  value: number;
}

/**
 * Weather parameters for TOLD (takeoff/landing) performance calculations.
 */
interface WeatherParameters {
  /** The runway surface condition. */
  runwaySurface: ToldRunwaySurfaceCondition;

  /** The wind direction, in degrees true. */
  windDirection: number;

  /** The wind speed. */
  windSpeed: NumberUnitInterface<UnitFamily.Speed>;

  /** The temperature. */
  temperature: NumberUnitInterface<UnitFamily.Temperature>;

  /** The pressure (QNH) at the runway. */
  pressure: NumberUnitInterface<UnitFamily.Pressure>;
}

/**
 * Runway parameters for TOLD (takeoff/landing) performance calculations.
 */
interface RunwayParameters {
  /** The available runway length. */
  runwayLength: NumberUnitInterface<UnitFamily.Distance>;

  /** The runway elevation above sea level. */
  runwayElevation: NumberUnitInterface<UnitFamily.Distance>;

  /** The runway heading, in degrees true. */
  runwayHeading: number;

  /** The runway gradient, in percent. Positive values indicate an upward slope. */
  runwayGradient: number;
}

/**
 * Parameters for takeoff performance calculations.
 */
export interface ToldTakeoffParameters extends WeatherParameters, RunwayParameters {
  /** The takeoff weight. */
  weight: NumberUnitInterface<UnitFamily.Weight>;

  /** The pressure altitude at the takeoff runway. */
  pressureAltitude: NumberUnitInterface<UnitFamily.Distance>;

  /** The takeoff flaps configuration. */
  flaps: string | undefined;

  /** Whether anti-ice is on for takeoff. */
  antiIceOn: boolean | undefined;

  /** Whether to take credit for thrust reversers. */
  thrustReversers: boolean | undefined;

  /** The takeoff factor. */
  factor: number;

  /** Whether the takeoff is a rolling takeoff. */
  rolling: boolean | undefined;

  /** The runway line-up configuration. */
  lineUp: string | undefined;
}

/**
 * Parameters for landing performance calculations.
 */
export interface ToldLandingParameters extends WeatherParameters, RunwayParameters {
  /** The landing weight. */
  weight: NumberUnitInterface<UnitFamily.Weight>;

  /** The pressure altitude at the landing runway. */
  pressureAltitude: NumberUnitInterface<UnitFamily.Distance>;

  /** The landing flaps configuration. */
  flaps: string | undefined;

  /** Whether anti-ice is on for landing. */
  antiIceOn: boolean | undefined;

  /** Whether to take credit for thrust reversers. */
  thrustReversers: boolean | undefined;

  /** The landing factor. */
  factor: number;

  /** Whether autothrottle is on for landing. */
  autothrottleOn: boolean | undefined;
}

/**
 * TOLD (takeoff/landing) limit exceedance flags.
 */
export enum ToldLimitExceedance {
  FieldLength = 1 << 0,
  Weight = 1 << 1,
  PressureAltitudeLow = 1 << 2,
  PressureAltitudeHigh = 1 << 3,
  TemperatureLow = 1 << 4,
  TemperatureHigh = 1 << 5,
  Headwind = 1 << 6,
  Tailwind = 1 << 7,
  Crosswind = 1 << 8,
}

/**
 * Takeoff performance values.
 */
export type ToldTakeoffPerformanceResult = {
  /** The available runway length, in feet, used in the calculation of this result. */
  runwayLengthAvailable: number | undefined;

  /** The takeoff weight, in pounds, used in the calculation of this result. */
  weight: number | undefined;

  /** The pressure, in hectopascals, used in the calculation of this result. */
  pressure: number | undefined;

  /** The pressure altitude, in feet, used in the calculation of this result. */
  pressureAltitude: number | undefined;

  /** The temperature, in degrees Celsius, used in the calculation of this result. */
  temperature: number | undefined;

  /** The headwind component, in knots, used in the calculation of the result. */
  headwind: number | undefined;

  /**
   * The crosswind component, in knots, used in the calculation of this result. Positive values indicate wind direction
   * from the left of the runway (i.e. wind blowing to the right across the runway).
   */
  crosswind: number | undefined;

  /**
   * The name of the flaps setting used in the calculation of this result, or `undefined` if flaps configuration was
   * not used in the calculation.
   */
  flaps: string | undefined;

  /** The runway length required, in feet. A negative value indicates that the length could not be calculated. */
  runwayLengthRequired: number;

  /**
   * The maximum allowed takeoff weight for the available runway length. A negative value indicates that the weight
   * could not be calculated.
   */
  maxRunwayWeight: number;

  /** The maximum allowed takeoff weight, in pounds. */
  maxWeight: number;

  /** The minimum allowed takeoff pressure altitude, in feet. */
  minPressureAltitude: number | undefined;

  /** The maximum allowed takeoff pressure altitude, in feet. */
  maxPressureAltitude: number | undefined;

  /** The minimum allowed takeoff temperature, in degrees Celsius. */
  minTemperature: number | undefined;

  /** The maximum allowed takeoff temperature, in degrees Celsius. */
  maxTemperature: number | undefined;

  /** The maximum allowed headwind component, in knots. */
  maxHeadwind: number | undefined;

  /** The maximum allowed tailwind component, in knots. */
  maxTailwind: number | undefined;

  /** The maximum allowed crosswind component, in knots. */
  maxCrosswind: number | undefined;

  /** The takeoff limits exceeded, as bitflags. */
  limitsExceeded: number;

  /** V-speeds. */
  readonly vSpeeds: readonly ToldVSpeed[];
}

/**
 * Landing performance values.
 */
export type ToldLandingPerformanceResult = {
  /** The available runway length, in feet, used in the calculation of this result. */
  runwayLengthAvailable: number | undefined;

  /** The landing weight, in pounds, used in the calculation of this result. */
  weight: number | undefined;

  /** The pressure, in hectopascals, used in the calculation of this result. */
  pressure: number | undefined;

  /** The pressure altitude, in feet, used in the calculation of this result. */
  pressureAltitude: number | undefined;

  /** The temperature, in degrees Celsius, used in the calculation of this result. */
  temperature: number | undefined;

  /** The headwind component, in knots, used in the calculation of the result. */
  headwind: number | undefined;

  /**
   * The crosswind component, in knots, used in the calculation of this result. Positive values indicate wind direction
   * from the left of the runway (i.e. wind blowing to the right across the runway).
   */
  crosswind: number | undefined;

  /**
   * The name of the flaps setting used in the calculation of this result, or `undefined` if flaps configuration was
   * not used in the calculation.
   */
  flaps: string | undefined;

  /**
   * The runway length required, in feet, for a landing at Vref. A negative value indicates that the length could not
   * be calculated.
   */
  runwayLengthRequiredRef: number;

  /**
   * The runway length required, in feet, for a landing at Vref+10. Only defined for contaminated runway surface
   * conditions. A negative value indicates that the length could not be calculated.
   */
  runwayLengthRequiredRef10: number | undefined;

  /**
   * The maximum allowed landing weight for the available runway length. A negative value indicates that the weight
   * could not be calculated. This weight is based on runway length required for a landing at Vref.
   */
  maxRunwayWeight: number;

  /** The maximum allowed landing weight, in pounds. */
  maxWeight: number;

  /** The minimum allowed landing pressure altitude, in feet. */
  minPressureAltitude: number | undefined;

  /** The maximum allowed landing pressure altitude, in feet. */
  maxPressureAltitude: number | undefined;

  /** The minimum allowed landing temperature, in degrees Celsius. */
  minTemperature: number | undefined;

  /** The maximum allowed landing temperature, in degrees Celsius. */
  maxTemperature: number | undefined;

  /** The maximum allowed headwind component, in knots. */
  maxHeadwind: number | undefined;

  /** The maximum allowed tailwind component, in knots. */
  maxTailwind: number | undefined;

  /** The maximum allowed crosswind component, in knots. */
  maxCrosswind: number | undefined;

  /** The landing limits exceeded, as bitflags. */
  limitsExceeded: number;

  /** V-speeds. */
  readonly vSpeeds: readonly ToldVSpeed[];
}