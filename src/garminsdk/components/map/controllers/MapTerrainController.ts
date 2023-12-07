import {
  MapDataIntegrityModule, MapIndexedRangeModule, MapOwnAirplanePropsModule, MappedSubject, MappedSubscribable, MapSystemContext,
  MapSystemController, MapSystemKeys, Subject, Subscribable, SubscribableUtils, Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

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

  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]?: MapDataIntegrityModule;
}

/**
 * Configuration options for {@link MapTerrainController}.
 */
export type MapTerrainControllerOptions = {
  /** Whether to allow relative terrain mode. Ignored if a user setting manager is not provided. Defaults to `true`. */
  allowRelative?: boolean;

  /**
   * The default terrain mode to which to revert if the desired terrain mode defined by user settings cannot be engaged.
   * Ignored if a user setting manager is not provided. Defaults to `MapTerrainMode.None`.
   */
  defaultMode?: MapTerrainMode | Subscribable<MapTerrainMode>;
};

/**
 * Controls the display of terrain based on user settings.
 */
export class MapTerrainController extends MapSystemController<MapTerrainControllerModules> {
  private readonly terrainModule = this.context.model.getModule(GarminMapKeys.Terrain);

  private readonly rangeIndex = this.context.model.getModule(GarminMapKeys.Range).nominalRangeIndex;
  private readonly isOnGround = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps)?.isOnGround ?? Subject.create(false);
  private readonly isGpsDataValid = this.context.model.getModule(MapSystemKeys.DataIntegrity)?.gpsSignalValid ?? Subject.create(true);

  private readonly modeSetting?: Subscribable<MapTerrainSettingMode>;
  private readonly rangeIndexSetting: Subscribable<number>;
  private readonly showScaleSetting?: Subscribable<boolean>;

  private readonly allowRelative: boolean;
  private readonly defaultTerrainMode: Subscribable<MapTerrainMode>;

  private terrainModeState?: MappedSubscribable<readonly [MapTerrainMode, MapTerrainSettingMode, number, number, boolean, boolean]>;
  private showScalePipe?: Subscription;

  /**
   * Creates a new instance of MapTerrainController.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling the display of terrain. If not
   * defined, the display of terrain will not be bound to user settings.
   * @param allowRelative Whether to allow relative terrain mode. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  constructor(
    context: MapSystemContext<MapTerrainControllerModules, any, any, any>,
    settingManager?: UserSettingManager<Partial<MapTerrainUserSettings>>,
    allowRelative?: boolean
  );
  /**
   * Creates a new instance of MapTerrainController.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling the display of terrain. If not
   * defined, the display of terrain will not be bound to user settings.
   * @param options Options with which to configure the controller.
   */
  constructor(
    context: MapSystemContext<MapTerrainControllerModules, any, any, any>,
    settingManager?: UserSettingManager<Partial<MapTerrainUserSettings>>,
    options?: Readonly<MapTerrainControllerOptions>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(
    context: MapSystemContext<MapTerrainControllerModules, any, any, any>,
    settingManager?: UserSettingManager<Partial<MapTerrainUserSettings>>,
    arg3?: boolean | Readonly<MapTerrainControllerOptions>
  ) {
    super(context);

    const options = arg3 === undefined ? undefined : typeof arg3 === 'object' ? arg3 : { allowRelative: arg3 };

    this.allowRelative = options?.allowRelative ?? true;
    this.defaultTerrainMode = SubscribableUtils.toSubscribable(options?.defaultMode ?? MapTerrainMode.None, true);

    this.modeSetting = settingManager?.tryGetSetting('mapTerrainMode');
    this.rangeIndexSetting = settingManager?.tryGetSetting('mapTerrainRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    this.showScaleSetting = settingManager?.tryGetSetting('mapTerrainScaleShow');
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    if (this.modeSetting !== undefined) {
      this.terrainModeState = MappedSubject.create(
        this.defaultTerrainMode,
        this.modeSetting,
        this.rangeIndexSetting,
        this.rangeIndex,
        this.isOnGround,
        this.isGpsDataValid
      );

      this.terrainModeState.sub(([defaultMode, modeSetting, rangeIndexSetting, rangeIndex, isOnGround, isGpsDataValid]): void => {
        let mode = MapTerrainMode.None;
        let isRelativeFailed = false;

        if (rangeIndex <= rangeIndexSetting) {
          switch (modeSetting) {
            case MapTerrainSettingMode.Absolute:
              mode = MapTerrainMode.Absolute;
              break;
            case MapTerrainSettingMode.Relative:
              if (this.allowRelative) {
                if (isGpsDataValid) {
                  mode = isOnGround ? MapTerrainMode.Ground : MapTerrainMode.Relative;
                } else {
                  mode = defaultMode;
                  isRelativeFailed = true;
                }
              }
              break;
          }
        }

        this.terrainModule.terrainMode.set(mode);
        this.terrainModule.isRelativeModeFailed.set(isRelativeFailed);
      }, true);
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

    this.terrainModeState?.destroy();
    this.showScalePipe?.destroy();
  }
}