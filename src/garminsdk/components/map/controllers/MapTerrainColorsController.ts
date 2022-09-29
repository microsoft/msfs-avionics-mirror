import { MapSystemContext, MapSystemController, MapSystemKeys, MapTerrainColorsModule, Subscription } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapUtils } from '../MapUtils';
import { MapTerrainMode, MapTerrainModule } from '../modules/MapTerrainModule';

/**
 * Modules required for MapTerrainColorsController.
 */
export interface MapTerrainColorsControllerModules {
  /** Terrain module. */
  [GarminMapKeys.Terrain]: MapTerrainModule;

  /** Terrain colors module. */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;
}

/**
 * Controls the display of terrain colors based on the terrain mode value in {@link MapTerrainModule}.
 */
export class MapTerrainColorsController extends MapSystemController<MapTerrainColorsControllerModules> {
  private static readonly DEFAULT_COLORS = MapUtils.noTerrainEarthColors();

  private static readonly MODE_MAP = {
    [MapTerrainMode.None]: EBingReference.SEA,
    [MapTerrainMode.Absolute]: EBingReference.SEA,
    [MapTerrainMode.Relative]: EBingReference.PLANE,
    [MapTerrainMode.Ground]: EBingReference.SEA
  };

  private readonly terrainModule = this.context.model.getModule(GarminMapKeys.Terrain);
  private readonly terrainColorsModule = this.context.model.getModule(MapSystemKeys.TerrainColors);

  private modeSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param colors The terrain colors array to use for each terrain mode. A default colors array will be used for any
   * mode which does not have a defined array.
   */
  constructor(
    context: MapSystemContext<MapTerrainColorsControllerModules>,
    private readonly colors: Partial<Record<MapTerrainMode, readonly number[]>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.modeSub = this.terrainModule.terrainMode.sub(mode => {
      this.terrainColorsModule.reference.set(MapTerrainColorsController.MODE_MAP[mode]);
      this.terrainColorsModule.colors.set(this.colors[mode] ?? MapTerrainColorsController.DEFAULT_COLORS);
    }, true);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.modeSub?.destroy();
  }
}