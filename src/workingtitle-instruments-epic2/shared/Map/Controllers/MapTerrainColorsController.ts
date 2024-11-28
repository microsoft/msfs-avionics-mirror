import {
  ArrayUtils,
  BingComponent, ColorUtils, ConsumerSubject, ConsumerValue, ControlSurfacesEvents, MapSystemController,
  MapSystemKeys, MapTerrainColorsModule, MathUtils, ReadonlyFloat64Array,
  Vec2Math
} from '@microsoft/msfs-sdk';

import { GpwsEvents } from '../../GPWS/GpwsEvents';
import { GpwsOperatingMode } from '../../GPWS/GpwsTypes';
import { EpicMapKeys } from '../EpicMapKeys';
import { MapTerrainWeatherStateModule, TERRAIN_MODE } from '../Modules/MapTerrainWeatherStateModule';

/**
 * A map terrain colors definition.
 */
export type MapTerrainColorsDefinition = {
  /**
   * The earth colors array. Index 0 defines the water color, and indexes 1 to the end of the array define the terrain
   * colors.
   */
  colors: readonly number[];

  /** The elevation range over which the terrain colors are applied, as `[minimum, maximum]` in feet. */
  elevationRange: ReadonlyFloat64Array;
};

/**
 * Modules required for MapTerrainColorsController.
 */
export interface MapTerrainColorsControllerModules {
  /** Terrain/weather state module. */
  [EpicMapKeys.TerrainWeatherState]: MapTerrainWeatherStateModule;

  /** Terrain colors module. */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;
}

/**
 * Controls the display of terrain colors based on GPWS data.
 */
export class MapTerrainColorsController extends MapSystemController<MapTerrainColorsControllerModules> {
  private static readonly TERRAIN_ELEV_RANGE = Vec2Math.create(-1500, 30000);

  public static readonly BLANK_TERRAIN_COLORS = BingComponent.createEarthColorsArray('#000000', [
    { elev: -1500, color: '#000000' }
  ], MapTerrainColorsController.TERRAIN_ELEV_RANGE[0], MapTerrainColorsController.TERRAIN_ELEV_RANGE[1], 1);

  private static _colorCache = new Float64Array(3);
  public static readonly GEO_TERRAIN_COLLORS = BingComponent.createEarthColorsArray('#000084', [
    { elev: -1400, color: '#9b9f92' },
    { elev: 1500, color: '#627352' },
    { elev: 3000, color: '#8e8c69' },
    { elev: 4000, color: '#a5996b' },
    { elev: 4500, color: '#746246' },
    { elev: 10000, color: '#8c7252' },
    { elev: 20000, color: '#483a1d' },
    { elev: 30000, color: '#000000' },
  ], MapTerrainColorsController.TERRAIN_ELEV_RANGE[0], MapTerrainColorsController.TERRAIN_ELEV_RANGE[1], 56).map(
    color => {
      const hsl = ColorUtils.hexToHsl(color, MapTerrainColorsController._colorCache, true);
      // hsl[1] *= 3.0;
      hsl[2] *= 0.9;

      return ColorUtils.hslToHex(hsl, true);
    });

  private static readonly SA_TERRAIN_COLORS = BingComponent.createEarthColorsArray('#000000', [
    { elev: -2000, color: '#005700' },
    { elev: -1001, color: '#005700' },
    { elev: -1000, color: '#00ff00' },
    { elev: -501, color: '#00ff00' },
    { elev: -500, color: '#e4a000' },
    { elev: 999, color: '#e4a000' },
    { elev: 1000, color: '#ffcc33' },
    { elev: 1999, color: '#ffcc33' },
    { elev: 2000, color: '#fc0000' }
  ], -2000, 2000, 41).slice(1); // Remove water color entry.

  private static readonly UPDATE_PERIOD = 5000;

  private readonly terrainColorsModule = this.context.model.getModule(MapSystemKeys.TerrainColors);
  private readonly terrainWeatherStateModule = this.context.model.getModule(EpicMapKeys.TerrainWeatherState);

  private readonly noseGearPosition = ConsumerValue.create(null, 0);
  private readonly leftGearPosition = ConsumerValue.create(null, 0);
  private readonly rightGearPosition = ConsumerValue.create(null, 0);

  private readonly gpwsOperatingMode = ConsumerSubject.create(null, GpwsOperatingMode.Off);
  private readonly gpwsIsPosValid = ConsumerSubject.create(null, false);
  private readonly gpwsGeoAltitude = ConsumerValue.create(null, 0);
  private readonly gpwsGeoVs = ConsumerValue.create(null, 0);
  private readonly gpwsNearestRunwayAltitude = ConsumerValue.create<number | null>(null, null);

  // 100-foot steps from -1400 to 29000 feet (inclusive) = 305 terrain colors + 1 water color
  private readonly activeColorsArray = ArrayUtils.create(306, () => 0);

  private isAltitudeLookaheadActive = false;

  private lastUpdateTime: number | undefined = undefined;
  private lastUpdateAltitude: number | undefined = undefined;
  private lastUpdateNearestRunwayAltitude: number | undefined = undefined;
  private lastUpdateGearUp: boolean | undefined = undefined;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<ControlSurfacesEvents & GpwsEvents>();

    this.noseGearPosition.setConsumer(sub.on('gear_position_0'));
    this.leftGearPosition.setConsumer(sub.on('gear_position_1'));
    this.rightGearPosition.setConsumer(sub.on('gear_position_2'));

    this.gpwsOperatingMode.setConsumer(sub.on('gpws_operating_mode'));
    this.gpwsIsPosValid.setConsumer(sub.on('gpws_is_pos_valid'));
    this.gpwsGeoAltitude.setConsumer(sub.on('gpws_geo_altitude'));
    this.gpwsGeoVs.setConsumer(sub.on('gpws_geo_vertical_speed'));
    this.gpwsNearestRunwayAltitude.setConsumer(sub.on('gpws_nearest_runway_altitude'));

    this.terrainColorsModule.colorsElevationRange.set(MapTerrainColorsController.TERRAIN_ELEV_RANGE);
    this.terrainColorsModule.colors.set(MapTerrainColorsController.BLANK_TERRAIN_COLORS);

    this.terrainWeatherStateModule.terrainMode.sub((v) => {
      switch (v) {
        case TERRAIN_MODE.OFF:
          this.terrainColorsModule.colors.set(MapTerrainColorsController.BLANK_TERRAIN_COLORS);
          break;
        case TERRAIN_MODE.GEO:
          this.terrainColorsModule.colors.set(MapTerrainColorsController.GEO_TERRAIN_COLLORS);
          break;
      }
      this.resetUpdateHistory();
    }, true);
  }

  /** @inheritdoc */
  public onAfterUpdated(time: number): void {
    if (this.terrainWeatherStateModule.terrainMode.get() !== TERRAIN_MODE.SA || !this.isSaTerrainFunctional()) {
      return;
    }

    if (this.lastUpdateTime !== undefined && this.lastUpdateTime > time) {
      this.lastUpdateTime = time;
    }

    if (this.lastUpdateTime !== undefined && time - this.lastUpdateTime < MapTerrainColorsController.UPDATE_PERIOD) {
      return;
    }

    this.lastUpdateTime = time;

    const altitude = this.gpwsGeoAltitude.get();
    const vs = this.gpwsGeoVs.get();
    const nearestRunwayAltitude = this.gpwsNearestRunwayAltitude.get() ?? -10000;
    const isGearUp = this.noseGearPosition.get() < 1 || this.leftGearPosition.get() < 1 || this.rightGearPosition.get() < 1;

    // When descending at more than 1000 feet per minute, a 30-second altitude lookahead is activated.
    this.isAltitudeLookaheadActive = vs < (this.isAltitudeLookaheadActive ? -800 : -1000);
    const effectiveAltitude = this.isAltitudeLookaheadActive ? altitude + vs * 0.5 : altitude;

    // We can skip the update if...
    if (
      this.lastUpdateAltitude !== undefined
      && this.lastUpdateNearestRunwayAltitude !== undefined
      // ... the current gear state is the same as the last updated gear state and ...
      && isGearUp === this.lastUpdateGearUp
      // ... the current effective altitude is within 50 feet of the last updated effective altitude and...
      && Math.abs(effectiveAltitude - this.lastUpdateAltitude) < 50
      && (
        // ... the current nearest runway altitude is within 50 feet of the last updated nearest runway altitude...
        Math.abs(nearestRunwayAltitude - this.lastUpdateNearestRunwayAltitude) < 50
        || (
          // ... OR both the current and last updated nearest runway altitude were more than 2500 feet below their
          // respective effective altitudes (i.e. there does not exist any displayed terrain that is inhibited by the
          // nearest runway in this or the last update).
          nearestRunwayAltitude < effectiveAltitude - 2500
          && this.lastUpdateNearestRunwayAltitude < this.lastUpdateAltitude - 2500
        )
      )
    ) {
      return;
    }

    this.lastUpdateAltitude = effectiveAltitude;
    this.lastUpdateNearestRunwayAltitude = nearestRunwayAltitude;
    this.lastUpdateGearUp = isGearUp;

    const colors = MapTerrainColorsController.SA_TERRAIN_COLORS;

    // Find the closest elevation step to the elevation at which terrain is colored (2000 feet below the airplane's
    // effective altitude).
    const terrainColorStartIndex = MathUtils.round(MathUtils.lerp(
      effectiveAltitude - 2000,
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[0],
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[1],
      1, // terrain colors start at index 1
      this.activeColorsArray.length - 1
    ));

    // Find the closest elevation steps to +/-400 feet relative to the nearest runway elevation.
    const terrainColorNearestRunwayElevationBelowIndex = Math.ceil(MathUtils.lerp(
      nearestRunwayAltitude - 400,
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[0],
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[1],
      1, // terrain colors start at index 1
      this.activeColorsArray.length - 1
    ));
    const terrainColorNearestRunwayElevationAboveIndex = Math.floor(MathUtils.lerp(
      nearestRunwayAltitude + 400,
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[0],
      MapTerrainColorsController.TERRAIN_ELEV_RANGE[1],
      1, // terrain colors start at index 1
      this.activeColorsArray.length - 1
    ));

    // Update the active terrain colors array.

    const startIndex = Math.max(terrainColorStartIndex, 1);

    // Terrain more than 2000 feet below the airplane is not displayed.
    this.activeColorsArray.fill(0, 1, startIndex);

    for (let i = startIndex; i < this.activeColorsArray.length; i++) {
      if (i >= terrainColorNearestRunwayElevationBelowIndex && i <= terrainColorNearestRunwayElevationAboveIndex) {
        // Inhibit display of terrain within 400 feet of nearest runway elevation.
        this.activeColorsArray[i] = 0;
      } else {
        this.activeColorsArray[i] = colors[Math.min(i - terrainColorStartIndex, colors.length - 1)];
      }
    }

    this.terrainColorsModule.colors.set(this.activeColorsArray);
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.resetUpdateHistory();
  }

  /**
   * Resets this controller's active terrain color update history.
   */
  private resetUpdateHistory(): void {
    this.isAltitudeLookaheadActive = false;
    this.lastUpdateTime = undefined;
    this.lastUpdateAltitude = undefined;
    this.lastUpdateNearestRunwayAltitude = undefined;
    this.lastUpdateGearUp = undefined;
  }

  /**
   * Returns whether the SA terrain is functional.
   * @returns A boolean indicating whether the SA terrain is functional.
   */
  private isSaTerrainFunctional(): boolean {
    return (this.gpwsOperatingMode.get() === GpwsOperatingMode.Normal && this.gpwsIsPosValid.get());
  }
}
