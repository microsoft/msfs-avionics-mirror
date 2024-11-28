import { BingComponent, NumberUnitReadOnly, UnitFamily, UnitType, Vec2Math } from '@microsoft/msfs-sdk';

import { MapTerrainColorsDefinition, MapUtils, UnitsDistanceSettingMode, WaypointHighlightLineOptions } from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../CommonTypes';

/**
 * A utility class for working with G3X Touch maps.
 */
export class G3XMapUtils {
  private static readonly MAP_RANGES = {
    [UnitsDistanceSettingMode.Nautical]: [
      ...[
        200,
        300,
        500,
        800
      ].map(value => UnitType.FOOT.createNumber(value).readonly),
      ...[
        0.2,
        0.3,
        0.5,
        0.8,
        1.2,
        2,
        3,
        5,
        8,
        12,
        20,
        30,
        50,
        80,
        120,
        200,
        // The real unit supports the map ranges below, but the sim's Bing map texture isn't drawn correctly once you
        // zoom out too far, so we will limit the maximum map range.
        // 300,
        // 500,
        // 800
      ].map(value => UnitType.NMILE.createNumber(value).readonly)
    ],
    [UnitsDistanceSettingMode.Metric]: [],
    [UnitsDistanceSettingMode.Statute]: []
  };

  private static readonly TRAFFIC_MAP_RANGES = [
    ...[
      0.5,
      1,
      2,
      6,
      12,
      24,
      40,
    ].map(value => UnitType.NMILE.createNumber(value).readonly)
  ];

  /** The default minimum nominal range index at which the NEXRAD overlay can be displayed. */
  public static readonly DEFAULT_NEXRAD_MIN_RANGE_INDEX = 8;

  /**
   * Gets the standard map range array.
   * @param units The distance units mode for which to get the array.
   * @returns The standard map range array.
   */
  public static mapRanges(units: UnitsDistanceSettingMode): readonly NumberUnitReadOnly<UnitFamily.Distance>[] {
    return G3XMapUtils.MAP_RANGES[units];
  }

  /**
   * Gets the standard traffic map range array.
   * @returns The standard traffic map range array.
   */
  public static trafficMapRanges(): readonly NumberUnitReadOnly<UnitFamily.Distance>[] {
    return G3XMapUtils.TRAFFIC_MAP_RANGES;
  }

  private static readonly NO_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#0000a0', [
      {
        elev: 0,
        color: '#000000'
      }
    ], 0, 0, 1),

    elevationRange: Vec2Math.create(0, 30000)
  };

  private static readonly ABSOLUTE_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = G3XMapUtils.createAbsoluteTerrainEarthColors();

  /**
   * Creates a terrain colors definition for absolute terrain colors.
   * @returns A terrain colors definition for absolute terrain colors.
   */
  private static createAbsoluteTerrainEarthColors(): MapTerrainColorsDefinition {
    const def = MapUtils.absoluteTerrainEarthColors();

    // Replace water color.
    const colors = def.colors.slice();
    colors[0] = BingComponent.hexaToRGBColor('#0000a0');

    return {
      colors,
      elevationRange: def.elevationRange
    };
  }

  private static readonly RELATIVE_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#0000a0', [
      {
        elev: 0,
        color: '#f00000'
      },
      {
        elev: 99,
        color: '#f00000'
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
        color: '#000000'
      }
    ], -400, 1000, 15),

    elevationRange: Vec2Math.create(-400, 1000)
  };

  private static readonly GROUND_TERRAIN_EARTH_COLORS: MapTerrainColorsDefinition = {
    colors: BingComponent.createEarthColorsArray('#0000a0', [
      {
        elev: -400,
        color: '#f00000'
      },
      {
        elev: -399,
        color: '#000000'
      },
      {
        elev: 0,
        color: '#000000'
      }
    ], -400, 1000, 15),

    elevationRange: Vec2Math.create(-400, 1000)
  };

  /**
   * Gets the earth colors definition for no terrain colors.
   * @returns The earth colors definition for no terrain colors.
   */
  public static noTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return G3XMapUtils.NO_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for absolute terrain colors.
   * @returns The earth colors definition for absolute terrain colors.
   */
  public static absoluteTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return G3XMapUtils.ABSOLUTE_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for relative terrain colors.
   * @returns The earth colors definition for relative terrain colors.
   */
  public static relativeTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return G3XMapUtils.RELATIVE_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the earth colors definition for on ground relative terrain colors.
   * @returns The earth colors definition for on ground relative terrain colors.
   */
  public static groundTerrainEarthColors(): Readonly<MapTerrainColorsDefinition> {
    return G3XMapUtils.GROUND_TERRAIN_EARTH_COLORS;
  }

  /**
   * Gets the size of the own airplane icon, in pixels, for a given GDU format.
   * @param gduFormat The GDU format for which to get the own airplane icon size.
   * @returns The size of the own airplane icon, in pixels, for the specified GDU format.
   */
  public static ownAirplaneIconSize(gduFormat: GduFormat): number {
    // TODO: fix GDU 470 (portrait) values.
    return gduFormat === '460' ? 50 : 26;
  }

  /**
   * Gets waypoint highlight line options for a given GDU format.
   * @param gduFormat The GDU format for which to get the options.
   * @returns Waypoint highlight line options for the specified GDU format.
   */
  public static waypointHighlightLineOptions(gduFormat: GduFormat): WaypointHighlightLineOptions {
    // TODO: fix GDU 470 (portrait) values.
    return gduFormat === '460'
      ? {
        strokeWidth: 3,
        strokeStyle: 'white',
        strokeDash: [4, 4],
        outlineWidth: 0.01,
        outlineStyle: 'black'
      }
      : {
        strokeWidth: 3,
        strokeStyle: 'white',
        strokeDash: [4, 4],
        outlineWidth: 0.01,
        outlineStyle: 'black'
      };
  }
}