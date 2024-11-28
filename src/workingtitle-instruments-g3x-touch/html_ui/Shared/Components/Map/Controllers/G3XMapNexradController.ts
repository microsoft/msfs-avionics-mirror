import {
  MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, Subscribable,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapNexradModule } from '@microsoft/msfs-garminsdk';

import { G3XMapUserSettingTypes } from '../../../Settings/MapUserSettings';

/**
 * G3X Touch user settings controlling the display of NEXRAD.
 */
export type G3XMapNexradUserSettings = Pick<G3XMapUserSettingTypes, 'mapWeatherShow' | 'mapNexradShow'>;

/**
 * Modules required by {@link G3XMapNexradController}.
 */
export interface G3XMapNexradControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Range module. */
  [GarminMapKeys.Nexrad]: MapNexradModule;
}

/**
 * Controls the display of NEXRAD based on user settings and the nominal range of the map.
 */
export class G3XMapNexradController extends MapSystemController<G3XMapNexradControllerModules> {
  private readonly nexradModule = this.context.model.getModule(GarminMapKeys.Nexrad);

  private readonly rangeIndex = this.context.model.getModule(GarminMapKeys.Range).nominalRangeIndex;

  private readonly showWeatherSetting?: Subscribable<boolean>;
  private readonly showNexradSetting?: Subscribable<boolean>;

  private show?: MappedSubscribable<boolean>;

  /**
   * Creates a new instance of G3XMapNexradController.
   * @param context This controller's map context.
   * @param minRangeIndex The minimum range range index, inclusive, at which NEXRAD is visible.
   * @param settingManager A setting manager containing the user settings controlling the display of NEXRAD. If not
   * defined, then the display of NEXRAD will not be bound to user settings.
   */
  public constructor(
    context: MapSystemContext<G3XMapNexradControllerModules, any, any, any>,
    private readonly minRangeIndex: number,
    settingManager?: UserSettingManager<Partial<G3XMapNexradUserSettings>>
  ) {
    super(context);

    if (settingManager) {
      this.showWeatherSetting = settingManager.tryGetSetting('mapWeatherShow');
      this.showNexradSetting = settingManager.tryGetSetting('mapNexradShow');
    }
  }

  /** @inheritDoc */
  public onAfterMapRender(): void {
    if (this.showWeatherSetting && this.showNexradSetting) {
      this.show = MappedSubject.create(
        ([showWeatherSetting, showNexradSetting, rangeIndex]): boolean => {
          return showWeatherSetting && showNexradSetting && rangeIndex >= this.minRangeIndex;
        },
        this.showWeatherSetting,
        this.showNexradSetting,
        this.rangeIndex,
      );
    } else {
      this.show = this.rangeIndex.map(rangeIndex => rangeIndex >= this.minRangeIndex);
    }

    this.show.pipe(this.nexradModule.showNexrad);
  }

  /** @inheritDoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.show?.destroy();
  }
}
