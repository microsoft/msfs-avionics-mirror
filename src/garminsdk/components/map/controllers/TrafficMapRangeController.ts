import {
  MapIndexedRangeModule, MapSystemContext, MapSystemController, MathUtils, NumberUnitInterface, Subject, Subscribable, Subscription, UnitFamily, UserSetting,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '../../../settings/UnitsUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapGarminTrafficModule } from '../modules/MapGarminTrafficModule';
import { MapUnitsModule } from '../modules/MapUnitsModule';

/**
 * Modules required for MapTrafficRangeController.
 */
export interface TrafficMapRangeControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Garmin traffic module. */
  [GarminMapKeys.Traffic]: MapGarminTrafficModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * User settings required by MapTrafficRangeController.
 */
export type TrafficMapRangeControllerSettings = {
  /** The range setting. */
  mapRangeIndex: number;
};

/**
 * Controls traffic map range.
 */
export class TrafficMapRangeController extends MapSystemController<TrafficMapRangeControllerModules> {
  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly trafficModule = this.context.model.getModule(GarminMapKeys.Traffic);

  private readonly distanceUnitsMode = this.context.model.getModule(GarminMapKeys.Units)?.distanceMode ?? Subject.create(UnitsDistanceSettingMode.Nautical);

  private readonly rangeSetting?: UserSetting<number>;

  private distanceModeSub?: Subscription;
  private indexSub?: Subscription;
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
    context: MapSystemContext<TrafficMapRangeControllerModules, any, any, any>,
    private readonly nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    private readonly metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    settingManager?: UserSettingManager<TrafficMapRangeControllerSettings>,
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

    this.indexSub = this.rangeModule.nominalRangeIndex.sub(index => {
      this.trafficModule.outerRangeIndex.set(index);

      const ranges = this.rangeModule.nominalRanges.get();
      const outerRange = ranges[index];
      let innerRangeIndex = index;
      while (--innerRangeIndex >= 0) {
        if (ranges[innerRangeIndex].compare(outerRange) < 0) {
          break;
        }
      }

      this.trafficModule.innerRangeIndex.set(innerRangeIndex);
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
   * @returns The index that was set.
   */
  public setRangeIndex(index: number): number {
    index = MathUtils.clamp(index, 0, this.rangeModule.nominalRanges.get().length - 1);

    if (this.rangeSetting !== undefined && (this.useSetting?.get() ?? true)) {
      this.rangeSetting.value = index;
    } else {
      this.rangeModule.setNominalRangeIndex(index);
    }

    return index;
  }

  /**
   * Changes the range index by a given number of steps. Each step changes the range index to the next or previous
   * index that holds a range different from the current range.
   * @param delta The number of steps by which to change the range.
   * @returns The final index that was set.
   */
  public changeRangeIndex(delta: number): number {
    const currentIndex = this.rangeModule.nominalRangeIndex.get();

    if (delta === 0) {
      return currentIndex;
    }

    const ranges = this.rangeModule.nominalRanges.get();
    const currentRange = ranges[currentIndex];

    let index = currentIndex;
    let stepsToGo = Math.abs(delta);
    if (delta > 0) {
      while (++index < ranges.length) {
        if (!ranges[index].equals(currentRange)) {
          stepsToGo--;
        }

        if (stepsToGo === 0) {
          break;
        }
      }
    } else {
      while (--index >= 0) {
        if (!ranges[index].equals(currentRange)) {
          stepsToGo--;
        }

        if (stepsToGo === 0) {
          break;
        }
      }
    }

    index = MathUtils.clamp(index, 0, ranges.length - 1);

    if (currentRange.compare(ranges[index]) === 0) {
      return currentIndex;
    }

    return this.setRangeIndex(index);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.distanceModeSub?.destroy();
    this.indexSub?.destroy();
    this.settingSub?.destroy();
    this.useSettingSub?.destroy();
  }
}