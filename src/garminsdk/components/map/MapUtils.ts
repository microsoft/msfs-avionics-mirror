import { BingComponent, NumberUnitReadOnly, UnitFamily, UnitType } from 'msfssdk';

import { UnitsDistanceSettingMode } from '../../settings/UnitsUserSettings';

/**
 * Provides utility functions for working with Garmin maps.
 */
export class MapUtils {
  private static readonly NEXT_GEN_MAP_RANGES = {
    [UnitsDistanceSettingMode.Nautical]: [
      ...[
        250,
        400,
        500,
        750,
        1000,
        1500,
        2500
      ].map(value => UnitType.FOOT.createNumber(value).readonly),
      ...[
        0.5,
        0.75,
        1,
        1.5,
        2.5,
        4,
        5,
        7.5,
        10,
        15,
        25,
        40,
        50,
        75,
        100,
        150,
        250,
        400,
        500,
        750,
        1000
      ].map(value => UnitType.NMILE.createNumber(value).readonly)
    ],
    [UnitsDistanceSettingMode.Metric]: [
      ...[
        75,
        100,
        150,
        250,
        400,
        500,
        750
      ].map(value => UnitType.METER.createNumber(value).readonly),
      ...[
        1,
        1.5,
        2.5,
        4,
        5,
        8,
        10,
        15,
        20,
        40,
        50,
        75,
        100,
        150,
        250,
        350,
        500,
        800,
        1000,
        1500,
        2000
      ].map(value => UnitType.KILOMETER.createNumber(value).readonly)
    ]
  };

  private static readonly NEXT_GEN_TRAFFIC_MAP_RANGES = [
    ...[
      500,
      500,
      500,
      1000,
      1000,
      1000,
      2000,
      2000
    ].map(value => UnitType.FOOT.createNumber(value).readonly),
    ...[
      1,
      1,
      2,
      2,
      6,
      6,
      12,
      12,
      24,
      24,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40
    ].map(value => UnitType.NMILE.createNumber(value).readonly)
  ];

  /**
   * Gets the standard map range array for next-generation (NXi, G3000, etc) avionics units.
   * @param units The distance units mode for which to get the array.
   * @returns The standard map range array for next-generation (NXi, G3000, etc) avionics units.
   */
  public static nextGenMapRanges(units: UnitsDistanceSettingMode): readonly NumberUnitReadOnly<UnitFamily.Distance>[] {
    return MapUtils.NEXT_GEN_MAP_RANGES[units];
  }

  /**
   * Gets the standard traffic map range array for next-generation (NXi, G3000, etc) avionics units.
   * @returns The standard traffic map range array for next-generation (NXi, G3000, etc) avionics units.
   */
  public static nextGenTrafficMapRanges(): readonly NumberUnitReadOnly<UnitFamily.Distance>[] {
    return MapUtils.NEXT_GEN_TRAFFIC_MAP_RANGES;
  }

  private static readonly NO_TERRAIN_EARTH_COLORS = BingComponent.createEarthColorsArray('#000049', [
    {
      elev: 0,
      color: '#000000'
    },
    {
      elev: 60000,
      color: '#000000'
    }
  ]);

  private static readonly ABSOLUTE_TERRAIN_EARTH_COLORS = BingComponent.createEarthColorsArray('#000049', [
    {
      elev: 0,
      color: '#427238'
    },
    {
      elev: 500,
      color: '#456821'
    },
    {
      elev: 2000,
      color: '#d0aa43'
    },
    {
      elev: 3000,
      color: '#c58f45'
    },
    {
      elev: 6000,
      color: '#9d6434'
    },
    {
      elev: 8000,
      color: '#904f25'
    },
    {
      elev: 10500,
      color: '#904522'
    },
    {
      elev: 27000,
      color: '#939393'
    },
    {
      elev: 29000,
      color: '#c8c8c8'
    }
  ]);

  private static readonly RELATIVE_TERRAIN_EARTH_COLORS = BingComponent.createEarthColorsArray('#000049', [
    {
      elev: 0,
      color: '#ff0000'
    },
    {
      elev: 99,
      color: '#ff0000'
    },
    {
      elev: 100,
      color: '#ffff00'
    },
    {
      elev: 999,
      color: '#ffff00'
    },
    {
      elev: 1000,
      color: '#00ff00'
    },
    {
      elev: 1999,
      color: '#00ff00'
    },
    {
      elev: 2000,
      color: '#000000'
    }
  ]);

  /**
   * Gets the full Bing component earth color array for no terrain colors.
   * @returns The full Bing component earth color array for no terrain colors.
   */
  public static noTerrainEarthColors(): readonly number[] {
    return MapUtils.NO_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the full Bing component earth color array for absolute terrain colors.
   * @returns The full Bing component earth color array for absolute terrain colors.
   */
  public static absoluteTerrainEarthColors(): readonly number[] {
    return MapUtils.ABSOLUTE_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the full Bing component earth color array for relative terrain colors.
   * @returns The full Bing component earth color array for relative terrain colors.
   */
  public static relativeTerrainEarthColors(): readonly number[] {
    return MapUtils.RELATIVE_TERRAIN_EARTH_COLORS;
  }
}