import {
  MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, Subject, Subscribable, UserSettingManager
} from '@microsoft/msfs-sdk';

import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapDeclutterMode, MapDeclutterModule } from '../modules/MapDeclutterModule';
import { MapNexradModule } from '../modules/MapNexradModule';

/**
 * User settings controlling the display of NEXRAD.
 */
export type MapNexradUserSettings = Pick<MapUserSettingTypes, 'mapNexradShow' | 'mapNexradRangeIndex'>;

/**
 * Modules required by MapNexradController.
 */
export interface MapNexradControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Range module. */
  [GarminMapKeys.Nexrad]: MapNexradModule;

  /** Declutter module. */
  [GarminMapKeys.Declutter]?: MapDeclutterModule;
}

/**
 * Controls the display of NEXRAD based on user settings.
 */
export class MapNexradController extends MapSystemController<MapNexradControllerModules> {
  private readonly nexradModule = this.context.model.getModule(GarminMapKeys.Nexrad);

  private readonly rangeIndex = this.context.model.getModule(GarminMapKeys.Range).nominalRangeIndex;
  private readonly declutterMode = this.context.model.getModule(GarminMapKeys.Declutter)?.mode ?? Subject.create(MapDeclutterMode.All);

  private readonly showSetting?: Subscribable<boolean>;
  private readonly rangeIndexSetting: Subscribable<number>;

  private show?: MappedSubscribable<boolean>;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param minRangeIndex The minimum range range index, inclusive, at which NEXRAD is visible.
   * @param settingManager A setting manager containing the user settings controlling the display of terrain. If not
   * defined, the display of NEXRAD will not be bound to user settings.
   * @param maxDeclutterMode The highest global declutter mode, inclusive, at which NEXRAD is visible. Defaults to
   * `MapDeclutterMode.Level2`. Ignored if `settingManager` is not defined.
   */
  constructor(
    context: MapSystemContext<MapNexradControllerModules, any, any, any>,
    private readonly minRangeIndex: number,
    settingManager?: UserSettingManager<Partial<MapNexradUserSettings>>,
    private readonly maxDeclutterMode = MapDeclutterMode.Level2
  ) {
    super(context);

    this.showSetting = settingManager?.tryGetSetting('mapNexradShow');
    this.rangeIndexSetting = settingManager?.tryGetSetting('mapNexradRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    if (this.showSetting) {
      this.show = MappedSubject.create(
        ([showSetting, rangeIndexSetting, declutterMode, rangeIndex]): boolean => {
          return showSetting && declutterMode <= this.maxDeclutterMode && rangeIndex >= this.minRangeIndex && rangeIndex <= rangeIndexSetting;
        },
        this.showSetting,
        this.rangeIndexSetting,
        this.declutterMode,
        this.rangeIndex,
      );

      this.show.pipe(this.nexradModule.showNexrad);
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.show?.destroy();
  }
}