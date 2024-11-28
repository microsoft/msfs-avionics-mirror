/**
 * A METAR.
 */
export interface Metar {
  /** The ident of this METAR's airport. */
  readonly icao: string;

  /** The day of observation, in UTC time. */
  readonly day: number;

  /** The hour of observation, in UTC time. */
  readonly hour: number;

  /** The minute of observation, in UTC time. */
  readonly min: number;

  /** The flight category. */
  readonly flightCategory: MetarFlightCategory;

  /** The max wind direction, in degrees relative to true north. */
  readonly maxWindDir?: number;

  /** The min wind direction, in degrees relative to true north. */
  readonly minWindDir?: number;

  /** The wind direction, in degrees relative to true north. */
  readonly windDir?: number;

  /** The wind speed, expressed in units defined by `windSpeedUnits`. */
  readonly windSpeed?: number;

  /** The wind gust, expressed in units defined by `windSpeedUnits`. */
  readonly gust?: number;

  /** The units in which this METAR's wind speeds are reported. */
  readonly windSpeedUnits: MetarWindSpeedUnits;

  /** Whether winds are variable. */
  readonly vrb: boolean;

  /** Whether ceiling and visibility are OK. */
  readonly cavok: boolean;

  /** The visibility, expressed in units defined by `visUnits`. */
  readonly vis?: number;

  /** The units in which this METAR's visibility is reported. */
  readonly visUnits: MetarVisibilityUnits;

  /** Whether the observed visibility is less than the reported visibility. */
  readonly visLt: boolean;

  /** Cloud layers. */
  readonly layers: readonly MetarCloudLayer[];

  /** The vertical visibility, in hundreds of feet. */
  readonly vertVis?: number;

  /** The temperature, in degrees Celsius. */
  readonly temp?: number;

  /** The dew point, in degrees Celsius. */
  readonly dew?: number;

  /** The altimeter setting, in inHg. */
  readonly altimeterA?: number;

  /** The altimeter setting, in hPa. */
  readonly altimeterQ?: number;

  /** The estimated sea-level pressure, in hPa. */
  readonly slp?: number;

  /** Significant weather phenomena. */
  readonly phenomena: readonly MetarPhenomenon[];

  /** Whether this METAR contains remarks. */
  readonly rmk: boolean;

  /** A formatted string representation of this METAR. */
  readonly metarString: string;
}

/**
 * Wind speed units used by METAR.
 */
export enum MetarWindSpeedUnits {
  Undefined = -1,
  Knot,
  MeterPerSecond,
  KilometerPerHour
}

/** Visibility distance units used by METAR. */
export enum MetarVisibilityUnits {
  Undefined = -1,
  Meter,
  StatuteMile
}

/**
 * A METAR cloud layer description.
 */
export interface MetarCloudLayer {
  /** The altitude of this layer, in hundreds of feet. */
  readonly alt: number;

  /** The coverage of this layer. */
  readonly cover: MetarCloudLayerCoverage;

  /** The significant cloud type found in this layer. */
  readonly type: MetarCloudLayerType;
}

/**
 * METAR cloud layer coverage/sky condition.
 */
export enum MetarCloudLayerCoverage {
  SkyClear,
  Clear,
  NoSignificant,
  Few,
  Scattered,
  Broken,
  Overcast
}

/**
 * METAR significant cloud types.
 */
export enum MetarCloudLayerType {
  Unspecified = -1,
  ToweringCumulus,
  Cumulonimbus,
  AltocumulusCastellanus
}

/**
 * A METAR weather phenomenon.
 */
export interface MetarPhenomenon {
  /** The type of this phenomenon. */
  readonly phenom: MetarPhenomenonType;

  /**
   * The intensity of this phenomenon.
   */
  readonly intensity: MetarPhenomenonIntensity;

  /** Whether this phenomenon has the blowing modifier. */
  readonly blowing: boolean;

  /** Whether this phenomenon has the freezing modifier. */
  readonly freezing: boolean;

  /** Whether this phenomenon has the drifting modifier. */
  readonly drifting: boolean;

  /** Whether this phenomenon has the vicinity modifier. */
  readonly vicinity: boolean;

  /** Whether this phenomenon has the partial modifier. */
  readonly partial: boolean;

  /** Whether this phenomenon has the shallow modifier. */
  readonly shallow: boolean;

  /** Whether this phenomenon has the patches modifier. */
  readonly patches: boolean;

  /** Whether this phenomenon has the temporary modifier. */
  readonly tempo: boolean;

  /** Whether this phenomenon has the thunderstorm modifier. */
  readonly ts: boolean;
}

/** METAR phenomenon types. */
export enum MetarPhenomenonType {
  None,
  Mist,
  Duststorm,
  Dust,
  Drizzle,
  FunnelCloud,
  Fog,
  Smoke,
  Hail,
  SmallHail,
  Haze,
  IceCrystals,
  IcePellets,
  DustSandWhorls,
  Spray,
  Rain,
  Sand,
  SnowGrains,
  Shower,
  Snow,
  Squalls,
  Sandstorm,
  UnknownPrecip,
  VolcanicAsh
}

/** METAR phenomenon intensities. */
export enum MetarPhenomenonIntensity {
  Light = -1,
  Normal,
  Heavy
}

/** METAR flight category */
export enum MetarFlightCategory {
  Undefined = -1,
  LIFR,
  IFR,
  MVFR,
  VFR
}

/**
 * A TAF (terminal area forecast).
 */
export interface Taf {
  /** The ident of this TAF's airport. */
  readonly icao: string;

  /** The time of observation, in UTC time. */
  readonly observationTime: TafTime;

  /** The period of time during which the observation is valid, in UTC time. */
  readonly validPeriod: TafValidPeriod;

  /** The flight category. */
  readonly flightCategory: MetarFlightCategory;

  /** The wind direction, in degrees relative to true north. */
  readonly windDir?: number;

  /** The min wind direction, in degrees relative to true north. */
  readonly minWindDir?: number;

  /** The max wind direction, in degrees relative to true north. */
  readonly maxWindDir?: number;

  /** The wind speed, expressed in units defined by `windSpeedUnits`. */
  readonly windSpeed?: number;

  /** The wind gust, expressed in units defined by `windSpeedUnits`. */
  readonly gust?: number;

  /** The units in which this METAR's wind speeds are reported. */
  readonly windSpeedUnits: MetarWindSpeedUnits;

  /** Whether winds are variable. */
  readonly vrb: boolean;

  /** Whether ceiling and visibility are OK. */
  readonly cavok: boolean;

  /** The visibility, expressed in units defined by `visUnits`. */
  readonly vis?: number;

  /** The units in which this METAR's visibility is reported. */
  readonly visUnits: MetarVisibilityUnits;

  /** Whether the observed visibility is less than the reported visibility. */
  readonly visLt: boolean;

  /** The minimum forecast temperature and the predicted time when it will be reached. */
  readonly minTemperature?: TafTemperatureThreshold;

  /** The maximum forecast temperature and the predicted time when it will be reached. */
  readonly maxTemperature?: TafTemperatureThreshold;

  /** Cloud layers. */
  readonly layers: readonly MetarCloudLayer[];

  /** Condition change roups. */
  readonly conditionChangeGroups: readonly TafConditionChangeGroup[];

  /** The vertical visibility, in hundreds of feet. */
  readonly vertVis?: number;

  /** Significant weather phenomena. */
  readonly phenomena: readonly MetarPhenomenon[];

  /** A formatted string representation of this TAF. */
  readonly tafString: string;
}

/**
 * A description of a point in time used by TAF objects.
 */
export interface TafTime {
  /** The day of the month. `1` is the first day, `2` is the second day, etc. */
  readonly day: number;

  /** The hour of the day, from `0` to `23`. */
  readonly hour: number;

  /** The minute of the hour, from `0` to `59`. */
  readonly min: number;
}

/**
 * A period of time during which a TAF observation is considered valid.
 */
export interface TafValidPeriod {
  /** The time at which the period begins. */
  readonly startDate: TafTime;

  /** The time at which the period ends. */
  readonly endDate: TafTime;
}

/** A TAF temperature threshold happening at a specific date */
export interface TafTemperatureThreshold {
  /** the temperature. in Celsius */
  readonly temperature: number;

  /** the occuring time of the threshold reach */
  readonly occurenceTime: TafTime;
}

/**
 * A TAF condition change group.
 */
export interface TafConditionChangeGroup {
  /** the group terminology */
  readonly terminology: TafConditionChangeGroupTerminology;

  /** Probability of occurrence, in percent. */
  readonly probability: number;

  /** The period of time during which this change group is valid, in UTC time. */
  readonly validPeriod: TafValidPeriod;

  /** The wind speed, expressed in units defined by `windSpeedUnits`. */
  readonly windSpeed?: number;

  /** The wind direction, in degrees relative to true north. */
  readonly windDir?: number;

  /** The units in which this METAR's wind speeds are reported. */
  readonly windSpeedUnits: MetarWindSpeedUnits;

  /** The wind gust, expressed in units defined by `windSpeedUnits`. */
  readonly gust?: number;

  /** Whether winds are variable. */
  readonly vrb: boolean;

  /** The visibility, expressed in units defined by `visUnits`. */
  readonly vis?: number;

  /** The vertical visibility, in hundreds of feet. */
  readonly vertVis?: number;

  /** The units in which this METAR's visibility is reported. */
  readonly visUnits: MetarVisibilityUnits;

  /** Cloud layers. */
  readonly layers: readonly MetarCloudLayer[];

  /** Significant weather phenomena. */
  readonly phenomena: readonly MetarPhenomenon[];
}

/**
 * TAF condition change group terminologies.
 */
export enum TafConditionChangeGroupTerminology {
  Undefined = -1,
  FM,
  TEMPO,
  PROB,
  BECMG,
  RMK,
}
