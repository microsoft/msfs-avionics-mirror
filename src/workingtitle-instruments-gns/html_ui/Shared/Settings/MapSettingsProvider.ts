import { DefaultUserSettingManager, EventBus, MapRotation, NumberUnit, SimpleUnit, UnitFamily, UnitType, UserSettingRecord } from '@microsoft/msfs-sdk';

import { MapTrafficUserSettings } from '@microsoft/msfs-garminsdk';

export enum MapSettingsRanges {
  Off,
  FiveHundredFt,
  OneThousandFt,
  FifteenHundredFt,
  TwoThousandFt,
  ThiryFiveHundredFt,
  OneNm,
  OnePointFiveNm,
  TwoNm,
  ThreePointFiveNm,
  FiveNm,
  TenNm,
  FifteenNm,
  TwentyNm,
  ThirtyFiveNm,
  FiftyNm,
  OneHundredNm,
  OneHundredFiftyNm,
  TwoHundredNm,
  ThreeHundredFiftyNm,
  FiveHundredNm,
  OneThousandNm,
  FifteenHundredNm,
  TwoThousandNm
}

export const MapSettingsRangeArrayNM: [MapSettingsRanges, NumberUnit<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>][] = [
  [MapSettingsRanges.Off, UnitType.FOOT.createNumber(0)],
  [MapSettingsRanges.FiveHundredFt, UnitType.FOOT.createNumber(500)],
  [MapSettingsRanges.OneThousandFt, UnitType.FOOT.createNumber(1000)],
  [MapSettingsRanges.FifteenHundredFt, UnitType.FOOT.createNumber(1500)],
  [MapSettingsRanges.TwoThousandFt, UnitType.FOOT.createNumber(2000)],
  [MapSettingsRanges.ThiryFiveHundredFt, UnitType.FOOT.createNumber(3500)],
  [MapSettingsRanges.OneNm, UnitType.NMILE.createNumber(1)],
  [MapSettingsRanges.OnePointFiveNm, UnitType.NMILE.createNumber(1.5)],
  [MapSettingsRanges.TwoNm, UnitType.NMILE.createNumber(2)],
  [MapSettingsRanges.ThreePointFiveNm, UnitType.NMILE.createNumber(3.5)],
  [MapSettingsRanges.FiveNm, UnitType.NMILE.createNumber(5)],
  [MapSettingsRanges.TenNm, UnitType.NMILE.createNumber(10)],
  [MapSettingsRanges.FifteenNm, UnitType.NMILE.createNumber(15)],
  [MapSettingsRanges.TwentyNm, UnitType.NMILE.createNumber(20)],
  [MapSettingsRanges.ThirtyFiveNm, UnitType.NMILE.createNumber(35)],
  [MapSettingsRanges.FiftyNm, UnitType.NMILE.createNumber(50)],
  [MapSettingsRanges.OneHundredNm, UnitType.NMILE.createNumber(100)],
  [MapSettingsRanges.OneHundredFiftyNm, UnitType.NMILE.createNumber(150)],
  [MapSettingsRanges.TwoHundredNm, UnitType.NMILE.createNumber(200)],
  [MapSettingsRanges.ThreeHundredFiftyNm, UnitType.NMILE.createNumber(350)],
  [MapSettingsRanges.FiveHundredNm, UnitType.NMILE.createNumber(500)],
  [MapSettingsRanges.OneThousandNm, UnitType.NMILE.createNumber(1000)],
  [MapSettingsRanges.FifteenHundredNm, UnitType.NMILE.createNumber(1500)],
  [MapSettingsRanges.TwoThousandNm, UnitType.NMILE.createNumber(2000)]
];

export const MapSettingsRangeArrayKM: [MapSettingsRanges, NumberUnit<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>][] = [
  [MapSettingsRanges.Off, UnitType.FOOT.createNumber(0)],
  [MapSettingsRanges.FiveHundredFt, UnitType.METER.createNumber(150)],
  [MapSettingsRanges.OneThousandFt, UnitType.METER.createNumber(200)],
  [MapSettingsRanges.FifteenHundredFt, UnitType.METER.createNumber(350)],
  [MapSettingsRanges.TwoThousandFt, UnitType.METER.createNumber(500)],
  [MapSettingsRanges.ThiryFiveHundredFt, UnitType.KILOMETER.createNumber(1)],
  [MapSettingsRanges.OneNm, UnitType.KILOMETER.createNumber(1.5)],
  [MapSettingsRanges.OnePointFiveNm, UnitType.KILOMETER.createNumber(2)],
  [MapSettingsRanges.TwoNm, UnitType.KILOMETER.createNumber(3.5)],
  [MapSettingsRanges.ThreePointFiveNm, UnitType.KILOMETER.createNumber(5)],
  [MapSettingsRanges.FiveNm, UnitType.KILOMETER.createNumber(10)],
  [MapSettingsRanges.TenNm, UnitType.KILOMETER.createNumber(15)],
  [MapSettingsRanges.FifteenNm, UnitType.KILOMETER.createNumber(20)],
  [MapSettingsRanges.TwentyNm, UnitType.KILOMETER.createNumber(35)],
  [MapSettingsRanges.ThirtyFiveNm, UnitType.KILOMETER.createNumber(50)],
  [MapSettingsRanges.FiftyNm, UnitType.KILOMETER.createNumber(100)],
  [MapSettingsRanges.OneHundredNm, UnitType.KILOMETER.createNumber(150)],
  [MapSettingsRanges.OneHundredFiftyNm, UnitType.KILOMETER.createNumber(200)],
  [MapSettingsRanges.TwoHundredNm, UnitType.KILOMETER.createNumber(350)],
  [MapSettingsRanges.ThreeHundredFiftyNm, UnitType.KILOMETER.createNumber(500)],
  [MapSettingsRanges.FiveHundredNm, UnitType.KILOMETER.createNumber(1000)],
  [MapSettingsRanges.OneThousandNm, UnitType.KILOMETER.createNumber(1500)],
  [MapSettingsRanges.FifteenHundredNm, UnitType.KILOMETER.createNumber(2000)],
  [MapSettingsRanges.TwoThousandNm, UnitType.KILOMETER.createNumber(3500)]
];

export const MapSettingsRangesMapNM = new Map<MapSettingsRanges, NumberUnit<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>>(MapSettingsRangeArrayNM);

export const MapSettingsRangesMapKM = new Map<MapSettingsRanges, NumberUnit<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>>(MapSettingsRangeArrayKM);

/**
 * Possible waypoint display sizes for the map.
 */
export enum MapSettingsWaypointSizes {
  Off,
  Small,
  Med,
  Large
}

export enum MapTrafficMode {
  All = 'All',
  TAAndProximity = 'TAAndProximity',
  TAOnly = 'TAOnly'
}

export enum MapDeclutterLevel {
  None = 'None',
  One = 'One',
  Two = 'Two',
  Three = 'Three'
}

/**
 * Settings available on the map of the GNS units.
 */
export interface MapSettings extends UserSettingRecord {
  /** The current set map rotation. */
  'map_orientation': MapRotation;

  /** The current map autozoom setting. */
  'map_autozoom': boolean;

  /** The current arc nav map declutter level. */
  'map_arc_declutter_level': MapDeclutterLevel;

  /** The current standard map declutter level. */
  'map_std_declutter_level': MapDeclutterLevel;

  /** The current map land data display setting. */
  'map_land_data': boolean;

  /** The current map aviation data display setting.*/
  'map_aviation_data': boolean;

  /** The terrain map aviation data display setting. */
  'map_terr_aviation_data': boolean;

  /** Whether the terrain map is in 120 degree arc mode. */
  'map_terr_arc_view_enabled': boolean;

  /** Whether NEXRAD is enabled on the arc nav map. */
  'map_arc_nexrad_enabled': boolean;

  /** Whether NEXRAD is enabled on the standard nav map. */
  'map_std_nexrad_enabled': boolean;

  /** The current map traffic display filter mode. */
  'map_traffic_mode': MapTrafficMode;

  /** The range at which map traffic symbols will appear. */
  'map_traffic_symbol_range': MapSettingsRanges;

  /** The range at which map traffic labels will appear. */
  'map_traffic_label_range': MapSettingsRanges;

  /** The current map wind vector display setting. */
  'map_wind_vector': boolean;

  /** The current flight plan waypoint display range. */
  'wpt_fpl_range': MapSettingsRanges;

  /** The current flight plan waypoint display size. */
  'wpt_fpl_size': MapSettingsWaypointSizes;

  /** The current large airport waypoint display range. */
  'wpt_large_apt_range': MapSettingsRanges;

  /** The current large airport waypoint display size. */
  'wpt_large_apt_size': MapSettingsWaypointSizes;

  /** The current medium airport waypoint display range. */
  'wpt_medium_apt_range': MapSettingsRanges;

  /** The current medium airport waypoint display size. */
  'wpt_medium_apt_size': MapSettingsWaypointSizes;

  /** The current small airport waypoint display range. */
  'wpt_small_apt_range': MapSettingsRanges;

  /** The current small airport waypoint display size. */
  'wpt_small_apt_size': MapSettingsWaypointSizes;

  /** The current intersection waypoint display range. */
  'wpt_int_range': MapSettingsRanges;

  /** The current intersection waypoint display size. */
  'wpt_int_size': MapSettingsWaypointSizes;

  /** The current NDB waypoint display range. */
  'wpt_ndb_range': MapSettingsRanges;

  /** The current NDB waypoint display size. */
  'wpt_ndb_size': MapSettingsWaypointSizes;

  /** The current VOR waypoint display range. */
  'wpt_vor_range': MapSettingsRanges;

  /** The current VOR waypoint display size. */
  'wpt_vor_size': MapSettingsWaypointSizes;

  /** The current user waypoint display range. */
  'wpt_user_range': MapSettingsRanges;

  /** The current user waypoint display size. */
  'wpt_user_size': MapSettingsWaypointSizes;

  /** The current class B airspace display range. */
  'airspace_classb_range': MapSettingsRanges;

  /** The current class C airspace display range. */
  'airspace_classc_range': MapSettingsRanges;

  /** The current class D airspace display range. */
  'airspace_classd_range': MapSettingsRanges;

  /** The current restricted airspace display range. */
  'airspace_restricted_range': MapSettingsRanges;

  /** The current MOA airspace display range. */
  'airspace_moa_range': MapSettingsRanges;

  /** The current other airspace display range. */
  'airspace_other_range': MapSettingsRanges;
}

/**
 * A settings provider for GNS map settings.
 */
export class MapSettingsProvider extends DefaultUserSettingManager<MapSettings & MapTrafficUserSettings> {

  /**
   * Creates an instance of the MapSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(bus, [
      { name: 'map_orientation', defaultValue: MapRotation.NorthUp },
      { name: 'map_autozoom', defaultValue: true },
      { name: 'map_arc_declutter_level', defaultValue: MapDeclutterLevel.None },
      { name: 'map_std_declutter_level', defaultValue: MapDeclutterLevel.None },
      { name: 'map_land_data', defaultValue: true },
      { name: 'map_aviation_data', defaultValue: true },
      { name: 'map_terr_aviation_data', defaultValue: true },
      { name: 'map_terr_arc_view_enabled', defaultValue: false },
      { name: 'map_wind_vector', defaultValue: true },
      { name: 'map_arc_nexrad_enabled', defaultValue: false },
      { name: 'map_std_nexrad_enabled', defaultValue: false },
      { name: 'map_traffic_mode', defaultValue: MapTrafficMode.All },
      { name: 'map_traffic_symbol_range', defaultValue: MapSettingsRanges.FiftyNm },
      { name: 'map_traffic_label_range', defaultValue: MapSettingsRanges.TwentyNm },
      { name: 'wpt_fpl_range', defaultValue: MapSettingsRanges.TwoThousandNm },
      { name: 'wpt_large_apt_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm },
      { name: 'wpt_medium_apt_range', defaultValue: MapSettingsRanges.FiftyNm },
      { name: 'wpt_small_apt_range', defaultValue: MapSettingsRanges.TwentyNm },
      { name: 'wpt_int_range', defaultValue: MapSettingsRanges.TenNm },
      { name: 'wpt_ndb_range', defaultValue: MapSettingsRanges.TenNm },
      { name: 'wpt_vor_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm },
      { name: 'wpt_user_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm },
      { name: 'wpt_fpl_size', defaultValue: MapSettingsWaypointSizes.Med },
      { name: 'wpt_large_apt_size', defaultValue: MapSettingsWaypointSizes.Med },
      { name: 'wpt_medium_apt_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'wpt_small_apt_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'wpt_int_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'wpt_ndb_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'wpt_vor_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'wpt_user_size', defaultValue: MapSettingsWaypointSizes.Small },
      { name: 'airspace_classb_range', defaultValue: MapSettingsRanges.OneHundredNm },
      { name: 'airspace_classc_range', defaultValue: MapSettingsRanges.OneHundredNm },
      { name: 'airspace_classd_range', defaultValue: MapSettingsRanges.TwentyNm },
      { name: 'airspace_restricted_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm },
      { name: 'airspace_moa_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm },
      { name: 'airspace_other_range', defaultValue: MapSettingsRanges.OneHundredFiftyNm }
    ],
      true);
  }
}