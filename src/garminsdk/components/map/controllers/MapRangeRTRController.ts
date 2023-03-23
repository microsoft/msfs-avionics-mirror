import { MapIndexedRangeModule, MapSystemController, Subscription, UnitType } from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';

/**
 * Modules required for MapRangeRTRController.
 */
export interface MapRangeRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;
}

/**
 * Controls map projection range based on the range module's nominal range value.
 */
export class MapRangeRTRController extends MapSystemController<MapRangeRTRControllerModules> {
  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);

  private readonly rangeParam = {
    range: 0
  };

  private needUpdateRange = false;

  private rangeSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.rangeSub = this.rangeModule.nominalRange.sub(() => {
      this.needUpdateRange = true;
    }, true);
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (this.needUpdateRange) {
      const range = this.rangeModule.nominalRange.get();
      this.rangeParam.range = range.asUnit(UnitType.GA_RADIAN);
      this.context.projection.setQueued(this.rangeParam);
      this.needUpdateRange = false;
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.rangeSub?.destroy();
  }
}