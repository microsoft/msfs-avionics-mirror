import {
  MapSystemContext, MapSystemController, MappedSubject, Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import { MapOrientationSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { WeatherMapOrientationSettingMode, WeatherMapUserSettingTypes } from '../../../settings/WeatherMapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for WeatherMapOrientationSettingsController.
 */
export interface WeatherMapOrientationSettingsControllerModules {
  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;
}

/**
 * User settings required by WeatherMapOrientationSettingsController.
 */
export type WeatherMapOrientationSettingsControllerSettings = Pick<
  MapUserSettingTypes & WeatherMapUserSettingTypes,
  'weatherMapOrientation' | 'mapOrientation' | 'mapAutoNorthUpActive' | 'mapAutoNorthUpRangeIndex'
>;

/**
 * Controls the orientation of a weather map based on user settings.
 */
export class WeatherMapOrientationSettingsController extends MapSystemController<WeatherMapOrientationSettingsControllerModules> {
  private static readonly MODE_MAP: Partial<Record<MapOrientationSettingMode, MapOrientation>> = {
    [MapOrientationSettingMode.NorthUp]: MapOrientation.NorthUp,
    [MapOrientationSettingMode.HeadingUp]: MapOrientation.HeadingUp,
    [MapOrientationSettingMode.TrackUp]: MapOrientation.TrackUp,
    [MapOrientationSettingMode.DtkUp]: MapOrientation.DtkUp
  };
  private static readonly WEATHER_MODE_MAP: Partial<Record<WeatherMapOrientationSettingMode, MapOrientation>> = {
    [WeatherMapOrientationSettingMode.NorthUp]: MapOrientation.NorthUp,
    [WeatherMapOrientationSettingMode.HeadingUp]: MapOrientation.HeadingUp,
    [WeatherMapOrientationSettingMode.TrackUp]: MapOrientation.TrackUp,
    [WeatherMapOrientationSettingMode.DtkUp]: MapOrientation.DtkUp
  };

  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  private readonly subs: Subscription[] = [];

  /**
   * Creates a new instance of WeatherMapOrientationSettingsController.
   * @param context This controller's map context.
   * @param settingManager The setting manager used by this controller.
   */
  public constructor(
    context: MapSystemContext<WeatherMapOrientationSettingsControllerModules>,
    private readonly settingManager: UserSettingManager<Partial<WeatherMapOrientationSettingsControllerSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const weatherMapOrientationSetting = this.settingManager.tryGetSetting('weatherMapOrientation');

    if (weatherMapOrientationSetting) {
      const orientationSetting = this.settingManager.tryGetSetting('mapOrientation');

      if (orientationSetting) {
        const desiredOrientation = MappedSubject.create(
          ([weatherOrientation, orientation]): MapOrientation => {
            return weatherOrientation === WeatherMapOrientationSettingMode.SyncToNavMap
              ? WeatherMapOrientationSettingsController.MODE_MAP[orientation] ?? MapOrientation.NorthUp
              : WeatherMapOrientationSettingsController.WEATHER_MODE_MAP[weatherOrientation] ?? MapOrientation.NorthUp;
          },
          weatherMapOrientationSetting,
          orientationSetting,
        );

        this.subs.push(
          desiredOrientation,
          desiredOrientation.pipe(this.orientationModule.commandedOrientation)
        );
      } else {
        this.subs.push(weatherMapOrientationSetting.pipe(this.orientationModule.commandedOrientation, setting => {
          return WeatherMapOrientationSettingsController.WEATHER_MODE_MAP[setting] ?? MapOrientation.NorthUp;
        }));
      }

      const northUpAboveActiveSetting = this.settingManager.tryGetSetting('mapAutoNorthUpActive');
      if (northUpAboveActiveSetting) {
        const weatherNorthUpAboveActive = MappedSubject.create(
          ([weatherOrientation, northUpAboveActive]) => {
            return weatherOrientation === WeatherMapOrientationSettingMode.SyncToNavMap
              ? northUpAboveActive === true
              : false;
          },
          weatherMapOrientationSetting,
          northUpAboveActiveSetting,
        );

        this.subs.push(
          weatherNorthUpAboveActive,
          weatherNorthUpAboveActive.pipe(this.orientationModule.northUpAboveActive)
        );
      }

      const northUpAboveRangeIndexSetting = this.settingManager.tryGetSetting('mapAutoNorthUpRangeIndex');
      if (northUpAboveRangeIndexSetting) {
        const weatherNorthUpAboveRangeIndex = MappedSubject.create(
          ([weatherOrientation, northUpAboveRangeIndex]) => {
            return weatherOrientation === WeatherMapOrientationSettingMode.SyncToNavMap && typeof northUpAboveRangeIndex === 'number'
              ? northUpAboveRangeIndex
              : Infinity;
          },
          weatherMapOrientationSetting,
          northUpAboveRangeIndexSetting,
        );

        this.subs.push(
          weatherNorthUpAboveRangeIndex,
          weatherNorthUpAboveRangeIndex.pipe(this.orientationModule.northUpAboveRangeIndex)
        );
      }
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