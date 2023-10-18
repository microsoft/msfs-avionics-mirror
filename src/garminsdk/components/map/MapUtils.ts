import { BingComponent, NumberUnitReadOnly, UnitFamily, UnitType, Vec2Math } from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '../../settings/UnitsUserSettings';
import type { MapTerrainColorsDefinition } from './controllers/MapTerrainColorsController';

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
        elev: 1900,
        color: '#c5ad42'
      },
      {
        elev: 2000,
        color: '#c5b542'
      },
      {
        elev: 2100,
        color: '#c5ad42'
      },
      {
        elev: 2299,
        color: '#c5ad42'
      },
      {
        elev: 2300,
        color: '#c5a442'
      },
      {
        elev: 2599,
        color: '#c5a442'
      },
      {
        elev: 2600,
        color: '#c59c42'
      },
      {
        elev: 2899,
        color: '#c59c42'
      },
      {
        elev: 2900,
        color: '#c59442'
      },
      {
        elev: 3000,
        color: '#c59439'
      },
      {
        elev: 3100,
        color: '#c58c39'
      },
      {
        elev: 3200,
        color: '#bd8c3a'
      },
      {
        elev: 3699,
        color: '#bd8c3a'
      },
      {
        elev: 3700,
        color: '#bd8339'
      },
      {
        elev: 3800,
        color: '#b58339'
      },
      {
        elev: 3900,
        color: '#b58331'
      },
      {
        elev: 4199,
        color: '#b58331'
      },
      {
        elev: 4200,
        color: '#b57b31'
      },
      {
        elev: 4300,
        color: '#ad7b31'
      },
      {
        elev: 4699,
        color: '#ad7b31'
      },
      {
        elev: 4700,
        color: '#ad7329'
      },
      {
        elev: 4800,
        color: '#a47329'
      },
      {
        elev: 5199,
        color: '#a47329'
      },
      {
        elev: 5200,
        color: '#a46b29'
      },
      {
        elev: 5399,
        color: '#a46b29'
      },
      {
        elev: 5400,
        color: '#9c6b29'
      },
      {
        elev: 5599,
        color: '#9c6b29'
      },
      {
        elev: 5600,
        color: '#9c6b21'
      },
      {
        elev: 5700,
        color: '#9c6321'
      },
      {
        elev: 5899,
        color: '#9c6321'
      },
      {
        elev: 5900,
        color: '#946321'
      },
      {
        elev: 6299,
        color: '#946321'
      },
      {
        elev: 6300,
        color: '#945a21'
      },
      {
        elev: 6599,
        color: '#945a21'
      },
      {
        elev: 6600,
        color: '#945a19'
      },
      {
        elev: 6899,
        color: '#945a19'
      },
      {
        elev: 6900,
        color: '#945219'
      },
      {
        elev: 7299,
        color: '#945219'
      },
      {
        elev: 7300,
        color: '#8c5218'
      },
      {
        elev: 7599,
        color: '#8c5218'
      },
      {
        elev: 7600,
        color: '#8c4a19'
      },
      {
        elev: 7700,
        color: '#8c4a10'
      },
      {
        elev: 8499,
        color: '#8c4a10'
      },
      {
        elev: 8500,
        color: '#8c4210'
      },
      {
        elev: 8999,
        color: '#8c4210'
      },
      {
        elev: 9000,
        color: '#8c4208'
      },
      {
        elev: 9799,
        color: '#8c4208'
      },
      {
        elev: 9800,
        color: '#8c3a08'
      },
      {
        elev: 9999,
        color: '#8c3a08'
      },
      {
        elev: 10000,
        color: '#8c3a00'
      },
      {
        elev: 10899,
        color: '#8c3a00'
      },
      {
        elev: 10900,
        color: '#8c3a08'
      },
      {
        elev: 11199,
        color: '#8c3a08'
      },
      {
        elev: 11200,
        color: '#8c4208'
      },
      {
        elev: 11799,
        color: '#8c4208'
      },
      {
        elev: 11800,
        color: '#8c4210'
      },
      {
        elev: 12699,
        color: '#8c4210'
      },
      {
        elev: 12700,
        color: '#8c4a19'
      },
      {
        elev: 13599,
        color: '#8c4a19'
      },
      {
        elev: 13600,
        color: '#8c4a21'
      },
      {
        elev: 14099,
        color: '#8c4a21'
      },
      {
        elev: 14100,
        color: '#8c5221'
      },
      {
        elev: 14499,
        color: '#8c5221'
      },
      {
        elev: 14500,
        color: '#8c5229'
      },
      {
        elev: 15399,
        color: '#8c5229'
      },
      {
        elev: 15400,
        color: '#8c5231'
      },
      {
        elev: 15599,
        color: '#8c5231'
      },
      {
        elev: 15600,
        color: '#8c5a31'
      },
      {
        elev: 16299,
        color: '#8c5a31'
      },
      {
        elev: 16300,
        color: '#8c5a39'
      },
      {
        elev: 16300,
        color: '#8c5a39'
      },
      {
        elev: 16999,
        color: '#8b5a39'
      },
      {
        elev: 17000,
        color: '#8c6339'
      },
      {
        elev: 17199,
        color: '#8c6339'
      },
      {
        elev: 17200,
        color: '#8c6342'
      },
      {
        elev: 17399,
        color: '#8c6342'
      },
      {
        elev: 17400,
        color: '#946342'
      },
      {
        elev: 18099,
        color: '#946342'
      },
      {
        elev: 18100,
        color: '#94634a'
      },
      {
        elev: 18499,
        color: '#94634a'
      },
      {
        elev: 18500,
        color: '#946b4a'
      },
      {
        elev: 18999,
        color: '#946b4a'
      },
      {
        elev: 19000,
        color: '#946b52'
      },
      {
        elev: 19899,
        color: '#946b52'
      },
      {
        elev: 19900,
        color: '#946b5b'
      },
      {
        elev: 20000,
        color: '#94735a'
      },
      {
        elev: 20999,
        color: '#94735a'
      },
      {
        elev: 21000,
        color: '#947363'
      },
      {
        elev: 21499,
        color: '#947363'
      },
      {
        elev: 21500,
        color: '#947b63'
      },
      {
        elev: 21699,
        color: '#947b63'
      },
      {
        elev: 21700,
        color: '#947b6b'
      },
      {
        elev: 22499,
        color: '#947b6b'
      },
      {
        elev: 22500,
        color: '#947b73'
      },
      {
        elev: 22699,
        color: '#947b73'
      },
      {
        elev: 22700,
        color: '#948473'
      },
      {
        elev: 23499,
        color: '#948473'
      },
      {
        elev: 23500,
        color: '#94847b'
      },
      {
        elev: 24299,
        color: '#94847b'
      },
      {
        elev: 24300,
        color: '#948c7b'
      },
      {
        elev: 24400,
        color: '#948c83'
      },
      {
        elev: 25399,
        color: '#948c83'
      },
      {
        elev: 25400,
        color: '#948c8c'
      },
      {
        elev: 25699,
        color: '#948c8c'
      },
      {
        elev: 25700,
        color: '#94948c'
      },
      {
        elev: 26299,
        color: '#94948c'
      },
      {
        elev: 26300,
        color: '#949494'
      },
      {
        elev: 26999,
        color: '#949494'
      },
      {
        elev: 27000,
        color: '#9c9c9c'
      },
      {
        elev: 27499,
        color: '#9c9c9c'
      },
      {
        elev: 27500,
        color: '#a4a4a4'
      },
      {
        elev: 27999,
        color: '#a4a4a4'
      },
      {
        elev: 28000,
        color: '#adadad'
      },
      {
        elev: 28499,
        color: '#adadad'
      },
      {
        elev: 28500,
        color: '#b5b5b5'
      }
    ], -1400, 28500, 300),

    elevationRange: Vec2Math.create(-1400, 28500)
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