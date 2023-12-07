import {
  MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, ResourceConsumer, ResourceModerator, Subject, Subscription,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { MapOrientationSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapPointerModule } from '../modules';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapOrientationController.
 * @deprecated
 */
export interface MapOrientationControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Pointer module. */
  [GarminMapKeys.Pointer]?: MapPointerModule;
}

/**
 * Context properties required by MapOrientationController.
 * @deprecated
 */
export interface MapOrientationControllerContext {
  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]: ResourceModerator;
}

/**
 * User settings required by MapOrientationController.
 * @deprecated
 */
export type MapOrientationControllerSettings = Pick<MapUserSettingTypes, 'mapOrientation' | 'mapAutoNorthUpActive' | 'mapAutoNorthUpRangeIndex'>;

/**
 * Controls the orientation of a map based on user settings.
 * @deprecated New, preferred logic for controlling map orientation based on user settings is available using
 * `MapOrientationSettingsController`.
 */
export class MapOrientationController extends MapSystemController<MapOrientationControllerModules, any, any, MapOrientationControllerContext> {
  private static readonly MODE_MAP: Partial<Record<MapOrientationSettingMode, MapOrientation>> = {
    [MapOrientationSettingMode.NorthUp]: MapOrientation.NorthUp,
    [MapOrientationSettingMode.HeadingUp]: MapOrientation.HeadingUp,
    [MapOrientationSettingMode.TrackUp]: MapOrientation.TrackUp,
    [MapOrientationSettingMode.DtkUp]: MapOrientation.DtkUp
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
    context: MapSystemContext<MapOrientationControllerModules, any, any, MapOrientationControllerContext>,
    private readonly settingManager: UserSettingManager<Partial<MapOrientationControllerSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const orientationSetting = this.settingManager.tryGetSetting('mapOrientation');

    if (orientationSetting !== undefined) {
      this.orientation = MappedSubject.create(
        ([orientation, isAutoNorthUpActive, autoNorthUpRangeIndex, rangeIndex]): MapOrientation => {
          return isAutoNorthUpActive && rangeIndex > autoNorthUpRangeIndex
            ? MapOrientation.NorthUp
            : MapOrientationController.MODE_MAP[orientation] ?? MapOrientation.NorthUp;
        },
        orientationSetting,
        this.settingManager.tryGetSetting('mapAutoNorthUpActive') ?? Subject.create(false),
        this.settingManager.tryGetSetting('mapAutoNorthUpRangeIndex') ?? Subject.create(0),
        this.rangeModule.nominalRangeIndex
      );

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