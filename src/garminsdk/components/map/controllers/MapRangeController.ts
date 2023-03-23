import {
  MapIndexedRangeModule, MapSystemContext, MapSystemController, MathUtils, NumberUnitInterface, Subject, Subscribable, Subscription, UnitFamily, UserSetting,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '../../../settings/UnitsUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapUnitsModule } from '../modules/MapUnitsModule';

/**
 * Modules required for MapRangeController.
 */
export interface MapRangeControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * User settings required by MapRangeController.
 */
export type MapRangeControllerSettings = {
  /** The range setting. */
  mapRangeIndex?: number;
};

/**
 * Controls map range.
 */
export class MapRangeController extends MapSystemController<MapRangeControllerModules> {
  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);

  private readonly distanceUnitsMode = this.context.model.getModule(GarminMapKeys.Units)?.distanceMode ?? Subject.create(UnitsDistanceSettingMode.Nautical);

  private readonly rangeSetting?: UserSetting<number>;

  private distanceModeSub?: Subscription;
  private settingSub?: Subscription;
  private useSettingSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param nauticalRangeArray The map range array this controller sets for nautical distance mode. If not defined,
   * this controller will not change the range array when entering nautical distance mode.
   * @param metricRangeArray The map range array this controller sets for metric distance mode. If not defined, this
   * controller will not change the range array when entering metric distance mode.
   * @param settingManager A setting manager containing the map range index setting. If not defined, map range will
   * be set directly through the map model.
   * @param useSetting A subscribable which provides whether to control map range via the user setting. If not defined,
   * map range will always be controlled via the user setting. Ignored if `settingManager` is undefined.
   */
  constructor(
    context: MapSystemContext<MapRangeControllerModules, any, any, any>,
    private readonly nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    private readonly metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    settingManager?: UserSettingManager<MapRangeControllerSettings>,
    private readonly useSetting?: Subscribable<boolean>
  ) {
    super(context);

    this.rangeSetting = settingManager?.getSetting('mapRangeIndex');
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.distanceModeSub = this.distanceUnitsMode.sub(mode => {
      if (mode === UnitsDistanceSettingMode.Nautical) {
        if (this.nauticalRangeArray !== undefined) {
          this.rangeModule.nominalRanges.set(this.nauticalRangeArray);
        }
      } else {
        if (this.metricRangeArray) {
          this.rangeModule.nominalRanges.set(this.metricRangeArray);
        }
      }
    }, true);

    this.settingSub = this.rangeSetting?.sub(setting => {
      this.rangeModule.setNominalRangeIndex(setting);
    }, false, true);

    if (this.settingSub) {
      if (this.useSetting) {
        this.useSettingSub = this.useSetting.sub(useSetting => {
          if (useSetting) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.settingSub!.resume(true);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.settingSub!.pause();
          }
        }, true);
      } else {
        this.settingSub.resume(true);
      }
    }
  }

  /**
   * Sets the map range index. If the index is out of bounds, it will be clamped before being set.
   * @param index The index to set.
   * @param bypassUserSetting Whether to bypass the map range index user setting, if one is defined for
   * this controller, and set the range index directly on the map range module. Defaults to `false`.
   * @returns The index that was set.
   */
  public setRangeIndex(index: number, bypassUserSetting = false): number {
    index = MathUtils.clamp(index, 0, this.rangeModule.nominalRanges.get().length - 1);

    if (!bypassUserSetting && this.rangeSetting !== undefined && (this.useSetting?.get() ?? true)) {
      this.rangeSetting.value = index;
    } else {
      this.rangeModule.setNominalRangeIndex(index);
    }

    return index;
  }

  /**
   * Changes the map range index by a given amount. If the change results in an index that is out of bounds, it will
   * be clamped before being set.
   * @param delta The change to apply to the index.
   * @param bypassUserSetting Whether to bypass the map range index user setting, if one is defined for
   * this controller, and change the range index directly on the map range module. Defaults to `false`.
   * @returns The final index that was set.
   */
  public changeRangeIndex(delta: number, bypassUserSetting = false): number {
    return this.setRangeIndex(this.rangeModule.nominalRangeIndex.get() + delta, bypassUserSetting);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.distanceModeSub?.destroy();
    this.settingSub?.destroy();
    this.useSettingSub?.destroy();
  }
}