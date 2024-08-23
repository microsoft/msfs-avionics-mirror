import {
  ArrayUtils, BingComponent, ConsumerSubject, ConsumerValue, ControlSurfacesEvents, MappedSubject, MapSystemController, MapSystemKeys, MapTerrainColorsModule,
  MathUtils, Vec2Math
} from '@microsoft/msfs-sdk';

import { GpwsEvents } from '../Systems/gpws/GpwsEvents';
import { GpwsOperatingMode } from '../Systems/gpws/GpwsTypes';
import { MapTerrainStateModule } from './MapTerrainWeatherStateModule';
import { WT21MapKeys } from './WT21MapKeys';

/**
 * Modules required for MapTerrainColorsController.
 */
export interface MapTerrainColorsControllerModules {
  /** Terrain/weather state module. */
  [WT21MapKeys.TerrainModeState]: MapTerrainStateModule;

  /** Terrain colors module. */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;
}

/**
 * Controls the display of terrain colors based on GPWS data.
 */
export class MapTerrainColorsController extends MapSystemController<MapTerrainColorsControllerModules> {
  private static readonly BLANK_TERRAIN_COLORS = BingComponent.createEarthColorsArray('#0000FF', [
    { elev: -1400, color: '#000000' }
  ], -1400, 29000, 1);

  private static readonly TERRAIN_ELEV_RANGE = Vec2Math.create(-1400, 29000);

  private static readonly ACTIVE_TERRAIN_COLORS_GEAR_UP = BingComponent.createEarthColorsArray('#0000FF', [
    { elev: -2000, color: '#005700' },
    { elev: -1001, color: '#005700' },
    { elev: -1000, color: '#00ff00' },
    { elev: -501, color: '#00ff00' },
    { elev: -500, color: '#e4a000' },
    { elev: 999, color: '#e4a000' },
    { elev: 1000, color: '#ffcc33' },
    { elev: 1999, color: '#ffcc33' },
    { elev: 2000, color: '#fc0000' }
  ], -2000, 2000, 41);

  private static readonly ACTIVE_TERRAIN_COLORS_GEAR_DOWN = BingComponent.createEarthColorsArray('#0000FF', [
    { elev: -2000, color: '#005700' },
    { elev: -1001, color: '#005700' },
    { elev: -1000, color: '#00ff00' },
    { elev: -301, color: '#00ff00' },
    // Technically the following breakpoint should be -250 feet, but doing 50-foot steps would double the active colors
    // array length to 611.
    { elev: -300, color: '#e4a000' },
    { elev: 999, color: '#e4a000' },
    { elev: 1000, color: '#ffcc33' },
    { elev: 1999, color: '#ffcc33' },
    { elev: 2000, color: '#fc0000' }
  ], -2000, 2000, 41);

  private static readonly UPDATE_PERIOD = 5000;

  private readonly terrainWeatherStateModule = this.context.model.getModule(WT21MapKeys.TerrainModeState);
  private readonly terrainColorsModule = this.context.model.getModule(MapSystemKeys.TerrainColors);

  private readonly noseGearPosition = ConsumerValue.create(null, 0);
  private readonly leftGearPosition = ConsumerValue.create(null, 0);
  private readonly rightGearPosition = ConsumerValue.create(null, 0);

  private readonly gpwsOperatingMode = ConsumerSubject.create(null, GpwsOperatingMode.Off);
  private readonly gpwsIsPosValid = ConsumerSubject.create(null, false);
  private readonly gpwsGeoAltitude = ConsumerValue.create(null, 0);
  private readonly gpwsGeoVs = ConsumerValue.create(null, 0);
  private readonly gpwsNearestRunwayAltitude = ConsumerValue.create<number | null>(null, null);

  private readonly isActive = MappedSubject.create(
    ([displayTerrain, gpwsOperatingMode, gpwsIsPosValid]) => displayTerrain === true && gpwsOperatingMode === GpwsOperatingMode.Normal && gpwsIsPosValid,
    this.terrainWeatherStateModule.displayTerrain,
    this.gpwsOperatingMode,
    this.gpwsIsPosValid
  ).pause();

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

    this.isActive.resume();

    this.isActive.sub(isActive => {
      if (!isActive) {
        this.resetUpdateHistory();
        this.terrainColorsModule.colors.set(MapTerrainColorsController.BLANK_TERRAIN_COLORS);
      }
    }, true);
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

  /** @inheritdoc */
  public onAfterUpdated(time: number): void {
    if (!this.isActive.get()) {
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

    const colors = isGearUp ? MapTerrainColorsController.ACTIVE_TERRAIN_COLORS_GEAR_UP : MapTerrainColorsController.ACTIVE_TERRAIN_COLORS_GEAR_DOWN;

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
}