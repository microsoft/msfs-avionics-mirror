import {
  MapSystemContext, MapSystemController, Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import { MapOrientationSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapOrientationSettingsController.
 */
export interface MapOrientationSettingsControllerModules {
  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;
}

/**
 * User settings required by MapOrientationSettingsController.
 */
export type MapOrientationSettingsControllerSettings = Pick<MapUserSettingTypes, 'mapOrientation' | 'mapAutoNorthUpActive' | 'mapAutoNorthUpRangeIndex' | 'mapGroundNorthUpActive'>;

/**
 * Controls the orientation of a map based on user settings.
 */
export class MapOrientationSettingsController extends MapSystemController<MapOrientationSettingsControllerModules> {
  private static readonly MODE_MAP: Partial<Record<MapOrientationSettingMode, MapOrientation>> = {
    [MapOrientationSettingMode.NorthUp]: MapOrientation.NorthUp,
    [MapOrientationSettingMode.HeadingUp]: MapOrientation.HeadingUp,
    [MapOrientationSettingMode.TrackUp]: MapOrientation.TrackUp,
    [MapOrientationSettingMode.DtkUp]: MapOrientation.DtkUp
  };

  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  private readonly subs: Subscription[] = [];

  /**
   * Creates a new instance of MapOrientationSettingsController.
   * @param context This controller's map context.
   * @param settingManager The setting manager used by this controller.
   */
  public constructor(
    context: MapSystemContext<MapOrientationSettingsControllerModules>,
    private readonly settingManager: UserSettingManager<Partial<MapOrientationSettingsControllerSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const orientationSetting = this.settingManager.tryGetSetting('mapOrientation');
    if (orientationSetting) {
      this.subs.push(orientationSetting.pipe(this.orientationModule.commandedOrientation, setting => {
        return MapOrientationSettingsController.MODE_MAP[setting] ?? MapOrientation.NorthUp;
      }));
    }

    const northUpAboveActiveSetting = this.settingManager.tryGetSetting('mapAutoNorthUpActive');
    if (northUpAboveActiveSetting) {
      this.subs.push(northUpAboveActiveSetting.pipe(this.orientationModule.northUpAboveActive, setting => {
        return setting === true;
      }));
    }

    const northUpAboveRangeIndexSetting = this.settingManager.tryGetSetting('mapAutoNorthUpRangeIndex');
    if (northUpAboveRangeIndexSetting) {
      this.subs.push(northUpAboveRangeIndexSetting.pipe(this.orientationModule.northUpAboveRangeIndex, setting => {
        return typeof setting === 'number' ? setting : Infinity;
      }));
    }

    const northUpOnGroundActiveSetting = this.settingManager.tryGetSetting('mapGroundNorthUpActive');
    if (northUpOnGroundActiveSetting) {
      this.subs.push(northUpOnGroundActiveSetting.pipe(this.orientationModule.northUpOnGroundActive, setting => {
        return setting === true;
      }));
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subs) {
      sub.destroy();
    }

    super.destroy();
  }
}