import { MapDataIntegrityModule, MapSystemController, MapSystemKeys, Subscription } from '@microsoft/msfs-sdk';

import { ADCSystemEvents } from '../../Systems/ADCAvionicsSystem';
import { AHRSSystemEvents } from '../../Systems/AHRSSystem';
import { AvionicsComputerSystemEvents } from '../../Systems/AvionicsComputerSystem';
import { AvionicsSystemState } from '../../Systems/G1000AvionicsSystem';

/**
 * Modules required for MapDataIntegrityRTRController.
 */
export interface MapDataIntegrityControllerModules {
  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule;
}

/**
 * Controls the map's projected target, orientation mode, and player airplane icon based on heading and GPS signal validity.
 */
export class MapDataIntegrityController extends MapSystemController<MapDataIntegrityControllerModules> {
  private readonly dataIntegrityModule = this.context.model.getModule(MapSystemKeys.DataIntegrity);

  private avionicsStateSub?: Subscription;
  private ahrsStateSub?: Subscription;
  private adcStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<AvionicsComputerSystemEvents & AHRSSystemEvents & ADCSystemEvents>();

    this.avionicsStateSub = sub.on('avionicscomputer_state_1').handle(state => {
      if (state.current === AvionicsSystemState.On) {
        this.dataIntegrityModule.gpsSignalValid.set(true);
      } else {
        this.dataIntegrityModule.gpsSignalValid.set(false);
      }
    });

    this.ahrsStateSub = sub.on('ahrs_state').handle(state => {
      if (state.current === AvionicsSystemState.On) {
        this.dataIntegrityModule.headingSignalValid.set(true);
        this.dataIntegrityModule.attitudeSignalValid.set(true);
      } else {
        this.dataIntegrityModule.headingSignalValid.set(false);
        this.dataIntegrityModule.attitudeSignalValid.set(false);
      }
    });

    this.adcStateSub = sub.on('adc_state').handle(state => {
      if (state.current === AvionicsSystemState.On) {
        this.dataIntegrityModule.adcSignalValid.set(true);
      } else {
        this.dataIntegrityModule.adcSignalValid.set(false);
      }
    });
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.avionicsStateSub?.destroy();
    this.ahrsStateSub?.destroy();
    this.adcStateSub?.destroy();
  }
}