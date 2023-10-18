import { MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, Subject, UserSettingManager } from '@microsoft/msfs-sdk';

import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapPointerModule } from '../modules/MapPointerModule';
import { MapWindVectorModule } from '../modules/MapWindVectorModule';

/**
 * User settings controlling the display of the wind vector.
 */
export type MapWindVectorUserSettings = Pick<MapUserSettingTypes, 'mapWindVectorShow'>;

/**
 * Modules required by {@link MapWindVectorController}.
 */
export interface MapWindVectorControllerModules {
  /** Wind vector module. */
  [GarminMapKeys.WindVector]: MapWindVectorModule;

  /** Pointer module. */
  [GarminMapKeys.Pointer]?: MapPointerModule;
}

/**
 * Controls the display of the wind vector based on user settings.
 *
 * The controller displays the wind vector if and only if user settings are set to show the vector and the map pointer
 * is not active.
 */
export class MapWindVectorController extends MapSystemController<MapWindVectorControllerModules> {
  private readonly windVectorModule = this.context.model.getModule(GarminMapKeys.WindVector);
  private readonly pointerModule = this.context.model.getModule(GarminMapKeys.Pointer);

  private readonly show?: MappedSubscribable<boolean>;

  /**
   * Creates a new instance of MapWindVectorController.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling the display of the wind vector.
   */
  constructor(
    context: MapSystemContext<MapWindVectorControllerModules, any, any, any>,
    settingManager: UserSettingManager<Partial<MapWindVectorUserSettings>>
  ) {
    super(context);

    const showSetting = settingManager.tryGetSetting('mapWindVectorShow');

    if (showSetting) {
      this.show = MappedSubject.create(
        ([show, isPointerActive]): boolean => {
          return show && !isPointerActive;
        },
        showSetting,
        this.pointerModule?.isActive ?? Subject.create(false)
      ).pause();
    }
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.show?.resume().pipe(this.windVectorModule.show);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.show?.destroy();

    super.destroy();
  }
}