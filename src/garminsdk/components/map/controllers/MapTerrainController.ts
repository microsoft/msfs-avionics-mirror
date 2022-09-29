import {
  MapIndexedRangeModule, MapOwnAirplanePropsModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, MapSystemKeys, Subject,
  Subscribable, Subscription, UserSettingManager
} from 'msfssdk';

import { MapTerrainSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapTerrainMode, MapTerrainModule } from '../modules/MapTerrainModule';

/**
 * User settings controlling the display of terrain.
 */
export type MapTerrainUserSettings = Pick<
  MapUserSettingTypes,
  'mapTerrainMode'
  | 'mapTerrainRangeIndex'
  | 'mapTerrainScaleShow'
>;

/**
 * Modules required by MapTerrainController.
 */
export interface MapTerrainControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Range module. */
  [GarminMapKeys.Terrain]: MapTerrainModule;

  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]?: MapOwnAirplanePropsModule;
}

/**
 * Controls the display of terrain based on user settings.
 */
export class MapTerrainController extends MapSystemController<MapTerrainControllerModules> {
  private readonly terrainModule = this.context.model.getModule(GarminMapKeys.Terrain);

  private readonly rangeIndex = this.context.model.getModule(GarminMapKeys.Range).nominalRangeIndex;
  private readonly isOnGround = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps)?.isOnGround ?? Subject.create(false);

  private readonly modeSetting?: Subscribable<MapTerrainSettingMode>;
  private readonly rangeIndexSetting: Subscribable<number>;
  private readonly showScaleSetting?: Subscribable<boolean>;

  private terrainMode?: MappedSubscribable<MapTerrainMode>;
  private showScalePipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling the display of terrain. If not
   * defined, the display of terrain will not be bound to user settings.
   * @param allowRelative Whether to allow relative terrain mode. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  constructor(
    context: MapSystemContext<MapTerrainControllerModules, any, any, any>,
    settingManager?: UserSettingManager<Partial<MapTerrainUserSettings>>,
    private readonly allowRelative = true
  ) {
    super(context);

    this.modeSetting = settingManager?.tryGetSetting('mapTerrainMode');
    this.rangeIndexSetting = settingManager?.tryGetSetting('mapTerrainRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    this.showScaleSetting = settingManager?.tryGetSetting('mapTerrainScaleShow');
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    if (this.modeSetting !== undefined) {
      this.terrainMode = MappedSubject.create(
        ([modeSetting, rangeIndexSetting, rangeIndex, isOnGround]): MapTerrainMode => {
          let mode = MapTerrainMode.None;
          if (rangeIndex <= rangeIndexSetting) {
            switch (modeSetting) {
              case MapTerrainSettingMode.Absolute:
                mode = MapTerrainMode.Absolute;
                break;
              case MapTerrainSettingMode.Relative:
                if (this.allowRelative && !isOnGround) {
                  mode = MapTerrainMode.Relative;
                }
                break;
            }
          }

          return mode;
        },
        this.modeSetting,
        this.rangeIndexSetting,
        this.rangeIndex,
        this.isOnGround
      );

      this.terrainMode.pipe(this.terrainModule.terrainMode);
    }

    this.showScalePipe = this.showScaleSetting?.pipe(this.terrainModule.showScale);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.terrainMode?.destroy();
    this.showScalePipe?.destroy();
  }
}