import { BingComponent, NumberUnitReadOnly, UnitFamily, UnitType, Vec2Math } from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '../../settings/UnitsUserSettings';
import { MapTerrainColorsDefinition } from './controllers/MapTerrainColorsController';

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
    ],
    [UnitsDistanceSettingMode.Statute]: []
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

  private static readonly NO_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#000084', [
      {
        elev: 0,
        color: '#000000'
      }
    ], 0, 0, 1),

    elevationRange: Vec2Math.create(0, 30000)
  };

  private static readonly ABSOLUTE_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#000084', [
      {
        elev: -1400,
        color: '#39737b'
      },
      {
        elev: -1300,
        color: '#397b7b'
      },
      {
        elev: -1200,
        color: '#397b84'
      },
      {
        elev: -1100,
        color: '#427b84'
      },
      {
        elev: -1000,
        color: '#428484'
      },
      {
        elev: -900,
        color: '#428c8c'
      },
      {
        elev: -800,
        color: '#4a8c8c'
      },
      {
        elev: -700,
        color: '#4a948c'
      },
      {
        elev: -600,
        color: '#4a9494'
      },
      {
        elev: -500,
        color: '#4a9c94'
      },
      {
        elev: -400,
        color: '#4a9484'
      },
      {
        elev: -300,
        color: '#4a8c6b'
      },
      {
        elev: -200,
        color: '#4a8c63'
      },
      {
        elev: -100,
        color: '#4a845a'
      },
      {
        elev: 0,
        color: '#427238'
      },
      {
        elev: 100,
        color: '#427b42'
      },
      {
        elev: 200,
        color: '#427331'
      },
      {
        elev: 300,
        color: '#427329'
      },
      {
        elev: 400,
        color: '#426b18'
      },
      {
        elev: 500,
        color: '#426b08'
      },
      {
        elev: 600,
        color: '#4a6b10'
      },
      {
        elev: 700,
        color: '#527310'
      },
      {
        elev: 800,
        color: '#5a7318'
      },
      {
        elev: 900,
        color: '#637b18'
      },
      {
        elev: 1000,
        color: '#6b8421'
      },
      {
        elev: 1100,
        color: '#738421'
      },
      {
        elev: 1200,
        color: '#848c29'
      },
      {
        elev: 1300,
        color: '#8c8c29'
      },
      {
        elev: 1400,
        color: '#949431'
      },
      {
        elev: 1500,
        color: '#9c9c31'
      },
      {
        elev: 1600,
        color: '#a59c31'
      },
      {
        elev: 1700,
        color: '#ada539'
      },
      {
        elev: 1800,
        color: '#b5ad39'
      },
      {
        elev: 2000,
        color: '#ceb542'
      },
      {
        elev: 2500,
        color: '#c6a542'
      },
      {
        elev: 3000,
        color: '#c69439'
      },
      {
        elev: 6000,
        color: '#946321'
      },
      {
        elev: 7000,
        color: '#945218'
      },
      {
        elev: 8000,
        color: '#8c4810'
      },
      {
        elev: 9000,
        color: '#8c4208'
      },
      {
        elev: 10000,
        color: '#8c3908'
      },
      {
        elev: 16000,
        color: '#8c5a31'
      },
      {
        elev: 17000,
        color: '#8c6339'
      },
      {
        elev: 18000,
        color: '#946342'
      },
      {
        elev: 20000,
        color: '#94735a'
      },
      {
        elev: 22000,
        color: '#947b6b'
      },
      {
        elev: 24000,
        color: '#94847b'
      },
      {
        elev: 26000,
        color: '#94948c'
      },
      {
        elev: 27000,
        color: '#939393'
      },
      {
        elev: 28000,
        color: '#adadad'
      },
      {
        elev: 29000,
        color: '#b5b5b5'
      }
    ], -1400, 29000, 305),

    elevationRange: Vec2Math.create(-1400, 29000)
  };

  private static readonly RELATIVE_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#000084', [
      {
        elev: 0,
        color: '#7f0000'
      },
      {
        elev: 99,
        color: '#7f0000'
      },
      {
        elev: 100,
        color: '#a0a000'
      },
      {
        elev: 999,
        color: '#a0a000'
      },
      {
        elev: 1000,
        color: '#007a00'
      },
      {
        elev: 1999,
        color: '#007a00'
      },
      {
        elev: 2000,
        color: '#000000'
      }
    ], -400, 2000, 25),

    elevationRange: Vec2Math.create(-400, 2000)
  };

  private static readonly GROUND_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#000084', [
      {
        elev: -400,
        color: '#7f0000'
      },
      {
        elev: -399,
        color: '#000000'
      },
      {
        elev: 0,
        color: '#000000'
      }
    ], -400, 2000, 25),

    elevationRange: Vec2Math.create(-400, 2000)
  };

  /**
   * Gets the earth colors definition for no terrain colors.
   * @returns The earth colors definition for no terrain colors.
   */
  public static noTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return MapUtils.NO_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for absolute terrain colors.
   * @returns The earth colors definition for absolute terrain colors.
   */
  public static absoluteTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return MapUtils.ABSOLUTE_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for relative terrain colors.
   * @returns The earth colors definition for relative terrain colors.
   */
  public static relativeTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return MapUtils.RELATIVE_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for on ground relative terrain colors.
   * @returns The earth colors definition for on ground relative terrain colors.
   */
  public static groundTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return MapUtils.GROUND_TERRAIN_EARTH_COLORS;
  }

  private static readonly CONNEXT_PRECIP_RADAR_COLORS: readonly (readonly [number, number])[] = [
    [BingComponent.hexaToRGBAColor('#00000000'), 0.03],
    [BingComponent.hexaToRGBAColor('#04d404ff'), 0.25],
    [BingComponent.hexaToRGBAColor('#04ab04ff'), 2.5],
    [BingComponent.hexaToRGBAColor('#ffff00ff'), 11.5],
    [BingComponent.hexaToRGBAColor('#fbe304ff'), 23.4],
    [BingComponent.hexaToRGBAColor('#fbab04ff'), 48],
    [BingComponent.hexaToRGBAColor('#fb6b04ff'), 100],
    [BingComponent.hexaToRGBAColor('#fb0404ff'), 100]
  ];

  /**
   * Gets the weather color array for the Connext precipitation radar overlay.
   * @returns The weather color array for the Connext precipitation radar overlay.
   */
  public static connextPrecipRadarColors(): readonly (readonly [number, number])[] {
    return MapUtils.CONNEXT_PRECIP_RADAR_COLORS;
  }
}