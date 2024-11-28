import { MapOwnAirplaneIconOrientation, MapRotation } from '@microsoft/msfs-sdk';
import { EpicMapKeys } from './EpicMapKeys';

/** Bitflags that describe which map waypoint types should be displayed. */
export enum MapWaypointsDisplay {
  None = 0,
  NearestAirports = 1 << 0,
  HiNavaids = 1 << 1,
  LoNavaids = 1 << 2,
  Intersections = 1 << 3,
  TerminalWaypoints = 1 << 4,
  ETA = 1 << 5,
  Speed = 1 << 6,
  Altitude = 1 << 7,
  Airports = 1 << 8,
  NDBs = 1 << 9,
  MissedApproach = 1 << 10,
}

/**
 * Priorities for map labels on Epic2 maps.
 * Higher numbers are rendered oin top of lower numbers if drawn on same canvas.
 */
export enum Epic2MapLabelPriority {
  TopOfDescent = 9999,
  FlightPlan = 999,
  AirportsRunways = 10,
  Bottom = 0,
}

/**
 * Priorities for map waypoint icons on Boeings maps.
 * Higher numbers are rendered oin top of lower numbers if drawn on same canvas.
 */
export enum Epic2MapWaypointIconPriority {
  TopOfDescent = 9999,
  FlightPlan = 999,
  AirportsRunways = 10,
  Bottom = 0,
}

/** nav aid state */
export type NavAidState = 'VOR' | 'OFF' | 'ADF';

/** terr wx state */
export type TerrWxState = 'OFF' | 'TERR' | 'WX';

/** Type of map compass layout. */
export type MapCompassType = 'arc' | 'center';

/** Features that a map format can support. */
export enum MapFormatFeatures {
  None = 0,
  NexradWeather = 1 << 0,
  RadarWeather = 1 << 1,
  Terrain = 1 << 2,
  AltitudeArc = 1 << 3,
  PositionTrendVector = 1 << 4,
  Traffic = 1 << 5,
  FlightPlan = 1 << 6,
}

/** Config for a boeing map format. */
export interface MapFormatConfig {
  /** The compass type. */
  readonly compassType: MapCompassType,
  /** The Y component of the target projected offset in pixels. */
  readonly targetProjectedOffsetY: number,
  /** The compass radius in pixels. */
  readonly compassRadius: number,
  /** The map system's height in pixels. */
  readonly mapHeight: number,
  /** Array of the keys for the layers used for this map format. These layers will be made visible when this format is active. */
  readonly layerKeys: readonly string[],
  /** The rotation type this format uses. */
  readonly rotationType: MapRotation;
  /** The own airplane icon rotation type this format uses. */
  readonly ownAirplaneIconRotationType: MapOwnAirplaneIconOrientation;
  /** Which features this format supports. */
  readonly features: MapFormatFeatures;
}

/** Info and function common across Boeing maps. */
export class EpicMapCommon {
  public static readonly HDG_TRK_UP_FORMAT_COMMON_LAYER_KEYS = [
    EpicMapKeys.OwnShipTriLayer,
    EpicMapKeys.OwnShipXtkErrorLayer,
  ];
  public static readonly NORTH_UP_FORMAT_COMMON_LAYER_KEYS = [
    EpicMapKeys.OwnShipTriLayer,
  ];

  public static readonly HDG_TRK_UP_DEFAULT_CONFIG: Pick<MapFormatConfig, 'features' | 'ownAirplaneIconRotationType'> = {
    ownAirplaneIconRotationType: MapOwnAirplaneIconOrientation.MapUp,
    features: MapFormatFeatures.Traffic | MapFormatFeatures.Terrain | MapFormatFeatures.NexradWeather | MapFormatFeatures.RadarWeather
      | MapFormatFeatures.AltitudeArc | MapFormatFeatures.PositionTrendVector | MapFormatFeatures.FlightPlan,
  };

  public static readonly NORTH_UP_DEFAULT_CONFIG: Pick<MapFormatConfig, 'features' | 'ownAirplaneIconRotationType'> = {
    ownAirplaneIconRotationType: MapOwnAirplaneIconOrientation.HeadingUp,
    features: MapFormatFeatures.Traffic | MapFormatFeatures.Terrain | MapFormatFeatures.NexradWeather
      | MapFormatFeatures.AltitudeArc | MapFormatFeatures.PositionTrendVector | MapFormatFeatures.FlightPlan,
  };

  public static readonly tunedVorRole = 'tunedVorRole';

  public static readonly font = 'epic';
}
