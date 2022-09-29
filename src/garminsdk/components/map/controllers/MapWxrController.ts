import { MapSystemController, MapSystemKeys, MapWxrModule, Subscription } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapNexradModule } from '../modules/MapNexradModule';

/**
 * Modules required for MapWxrController.
 */
export interface MapWxrControllerModules {
  /** NEXRAD module. */
  [GarminMapKeys.Nexrad]: MapNexradModule;

  /** Weather module. */
  [MapSystemKeys.Weather]: MapWxrModule;
}

/**
 * Controls the display of weather based on the show NEXRAD value in {@link MapNexradModule}.
 */
export class MapWxrController extends MapSystemController<MapWxrControllerModules> {
  private readonly nexradModule = this.context.model.getModule(GarminMapKeys.Nexrad);
  private readonly weatherModule = this.context.model.getModule(MapSystemKeys.Weather);

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.showSub = this.nexradModule.showNexrad.sub(show => {
      if (show) {
        this.weatherModule.weatherRadarMode.set(EWeatherRadar.TOPVIEW);
      }
      this.weatherModule.isEnabled.set(show);
    }, true);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
  }
}