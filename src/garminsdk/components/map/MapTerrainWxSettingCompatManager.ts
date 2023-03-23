/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Subscription, UserSetting, UserSettingManager } from '@microsoft/msfs-sdk';
import { MapTerrainSettingMode, MapUserSettingTypes } from '../../settings/MapUserSettings';

/**
 * User settings controlling the display of map terrain and weather overlays.
 */
export type MapTerrainWxUserSettings = Pick<
  MapUserSettingTypes,
  'mapTerrainMode' | 'mapNexradShow'
>;

/**
 * Manages settings controlling the display of map relative terrain and weather (datalink and/or weather radar)
 * overlays such that the two are never active at the same time.
 */
export class MapTerrainWxSettingCompatManager {
  private readonly terrainModeSetting?: UserSetting<MapTerrainSettingMode>;
  private readonly nexradShowSetting?: UserSetting<boolean>;

  private isInit = false;
  private isAlive = true;

  private terrainModeSub?: Subscription;
  private nexradShowSub?: Subscription;

  /**
   * Constructor.
   * @param settingManager A setting manager containing the user settings controlling the display of relative terrain
   * and weather overlays for this manager to manage.
   */
  constructor(
    settingManager: UserSettingManager<Partial<MapTerrainWxUserSettings>>
  ) {
    this.terrainModeSetting = settingManager?.tryGetSetting('mapTerrainMode');
    this.nexradShowSetting = settingManager?.tryGetSetting('mapNexradShow');
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically control its managed settings such that
   * the relative terrain and weather overlays are never active at the same time.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('MapTerrainWxSettingCompatManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (!this.terrainModeSetting || !this.nexradShowSetting) {
      return;
    }

    this.terrainModeSub = this.terrainModeSetting.sub(mode => {
      if (mode === MapTerrainSettingMode.Relative) {
        this.nexradShowSetting!.value = false;
      }
    }, true);

    this.nexradShowSub = this.nexradShowSetting.sub(show => {
      if (show && this.terrainModeSetting!.value === MapTerrainSettingMode.Relative) {
        this.terrainModeSetting!.value = MapTerrainSettingMode.None;
      }
    }, true);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.terrainModeSub?.destroy();
    this.nexradShowSub?.destroy();
  }
}