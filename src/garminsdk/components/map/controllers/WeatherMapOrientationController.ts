import {
  MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, ResourceConsumer, ResourceModerator, Subject, Subscription,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { MapOrientationSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { WeatherMapOrientationSettingMode, WeatherMapUserSettingTypes } from '../../../settings/WeatherMapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapPointerModule } from '../modules';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for WeatherMapOrientationController.
 * @deprecated
 */
export interface WeatherMapOrientationControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Pointer module. */
  [GarminMapKeys.Pointer]?: MapPointerModule;
}

/**
 * Context properties required by WeatherMapOrientationController.
 * @deprecated
 */
export interface WeatherMapOrientationControllerContext {
  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]: ResourceModerator;
}

/**
 * User settings required by WeatherMapOrientationController.
 * @deprecated
 */
export type WeatherMapOrientationControllerSettings = Pick<
  MapUserSettingTypes & WeatherMapUserSettingTypes,
  'weatherMapOrientation' | 'mapOrientation' | 'mapAutoNorthUpActive' | 'mapAutoNorthUpRangeIndex'
>;

/**
 * Controls the orientation of a weather map based on user settings.
 * @deprecated New, preferred logic for controlling weather map orientation based on user settings is available using
 * `WeatherMapOrientationSettingsController`.
 */
export class WeatherMapOrientationController extends MapSystemController<WeatherMapOrientationControllerModules, any, any, WeatherMapOrientationControllerContext> {
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

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly pointerModule = this.context.model.getModule(GarminMapKeys.Pointer);

  private readonly orientationControl = this.context[GarminMapKeys.OrientationControl];

  private readonly orientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.ORIENTATION,

    onAcquired: () => {
      // If pointer is active, preserve the initial orientation mode when we regain control, but pass through any
      // further changes in the orientation setting to the model. This ensures that if some other controller was
      // manually setting the orientation mode but forfeited control, we don't force a change in orientation as control
      // passes back to us
      this.orientationSub?.resume(this.pointerModule === undefined || !this.pointerModule.isActive.get());
    },

    onCeded: () => {
      this.orientationSub?.pause();
    }
  };

  private orientation?: MappedSubscribable<MapOrientation>;

  private orientationSub?: Subscription;
  private isPointerActiveSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param settingManager The setting manager used by this controller.
   */
  constructor(
    context: MapSystemContext<WeatherMapOrientationControllerModules, any, any, WeatherMapOrientationControllerContext>,
    private readonly settingManager: UserSettingManager<Partial<WeatherMapOrientationControllerSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const weatherMapOrientationSetting = this.settingManager.tryGetSetting('weatherMapOrientation');

    if (weatherMapOrientationSetting !== undefined) {
      const orientationSetting = this.settingManager.tryGetSetting('mapOrientation');

      if (orientationSetting === undefined) {
        this.orientation = weatherMapOrientationSetting.map(weatherOrientation => WeatherMapOrientationController.WEATHER_MODE_MAP[weatherOrientation] ?? MapOrientation.HeadingUp);
      } else {
        this.orientation = MappedSubject.create(
          ([weatherOrientation, orientation, isAutoNorthUpActive, autoNorthUpRangeIndex, rangeIndex]): MapOrientation => {
            return weatherOrientation === WeatherMapOrientationSettingMode.SyncToNavMap
              ? isAutoNorthUpActive && rangeIndex > autoNorthUpRangeIndex
                ? MapOrientation.NorthUp
                : WeatherMapOrientationController.MODE_MAP[orientation] ?? MapOrientation.NorthUp
              : WeatherMapOrientationController.WEATHER_MODE_MAP[weatherOrientation] ?? MapOrientation.HeadingUp;
          },
          weatherMapOrientationSetting,
          orientationSetting,
          this.settingManager.tryGetSetting('mapAutoNorthUpActive') ?? Subject.create(false),
          this.settingManager.tryGetSetting('mapAutoNorthUpRangeIndex') ?? Subject.create(0),
          this.rangeModule.nominalRangeIndex
        );
      }

      const orientationSub = this.orientationSub = this.orientation.sub(orientation => { this.orientationModule.orientation.set(orientation); }, false, true);

      this.isPointerActiveSub = this.pointerModule?.isActive.sub(isActive => {
        if (!isActive && !orientationSub.isPaused) {
          // If pointer deactivates while we have control, sync orientation with setting in case we inhibited
          // the sync when control passed to us.
          orientationSub.pause();
          orientationSub.resume(true);
        }
      });

      this.orientationControl.claim(this.orientationControlConsumer);
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.orientationControl.forfeit(this.orientationControlConsumer);

    this.orientation?.destroy();
    this.orientationSub?.destroy();
    this.isPointerActiveSub?.destroy();
  }
}