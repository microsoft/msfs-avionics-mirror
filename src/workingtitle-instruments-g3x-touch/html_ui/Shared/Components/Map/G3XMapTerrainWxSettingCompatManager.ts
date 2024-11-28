import { Subscription, UserSetting, UserSettingManager } from '@microsoft/msfs-sdk';

import { MapTerrainSettingMode } from '@microsoft/msfs-garminsdk';

import { G3XMapUserSettingTypes } from '../../Settings/MapUserSettings';

/**
 * G3X Touch user settings controlling the display of map terrain and weather overlays.
 */
export type G3XMapTerrainWxUserSettings = Pick<
  G3XMapUserSettingTypes,
  'mapTerrainMode' | 'mapWeatherShow'
>;

/**
 * Manages settings controlling the display of map relative terrain and weather overlays such that the two are never
 * active at the same time.
 */
export class G3XMapTerrainWxSettingCompatManager {
  private readonly terrainModeSetting?: UserSetting<MapTerrainSettingMode>;
  private readonly weatherShowSetting?: UserSetting<boolean>;

  private isInit = false;
  private isAlive = true;

  private terrainModeSub?: Subscription;
  private weatherShowSub?: Subscription;

  /**
   * Constructor.
   * @param settingManager A setting manager containing the user settings controlling the display of relative terrain
   * and weather overlays for this manager to manage.
   */
  constructor(
    settingManager: UserSettingManager<Partial<G3XMapTerrainWxUserSettings>>
  ) {
    this.terrainModeSetting = settingManager?.tryGetSetting('mapTerrainMode');
    this.weatherShowSetting = settingManager?.tryGetSetting('mapWeatherShow');
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically control its managed settings such that
   * the relative terrain and weather overlays are never active at the same time.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('G3XMapTerrainWxSettingCompatManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (!this.terrainModeSetting || !this.weatherShowSetting) {
      return;
    }

    this.terrainModeSub = this.terrainModeSetting.sub(mode => {
      if (mode === MapTerrainSettingMode.Relative) {
        this.weatherShowSetting!.value = false;
      }
    }, true);

    this.weatherShowSub = this.weatherShowSetting.sub(show => {
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
    this.weatherShowSub?.destroy();
  }
}