import {
  AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, MapSystemContext, MapSystemController, MapSystemKeys,
  Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents, AhrsSystemEvents, FmsPositionMode, FmsPositionSystemEvents, MapGarminDataIntegrityModule } from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../../../CommonTypes';
import { PfdSensorsUserSettingManager } from '../../../Settings/PfdSensorsUserSettings';

/**
 * Modules required for MapDataIntegrityController.
 */
export interface MapDataIntegrityControllerModules {
  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapGarminDataIntegrityModule;
}

/**
 * Controls the map's GPS and heading signal validity states.
 */
export class MapDataIntegrityController extends MapSystemController<MapDataIntegrityControllerModules> {
  private readonly dataIntegrityModule = this.context.model.getModule(MapSystemKeys.DataIntegrity);

  private readonly pfdIndex: Subscribable<PfdIndex>;

  private readonly ahrsHeadingDataValid = ConsumerSubject.create(null, false);
  private readonly ahrsAttitudeDataValid = ConsumerSubject.create(null, false);
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent | null>(null, null);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private iauIndexSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private adcIndexSub?: Subscription;

  /**
   * Creates a new instance of MapDataIntegrityController.
   * @param context This controller's map context.
   * @param pfdIndex The index of the PFD used by the map to obtain heading and GPS data.
   * @param pfdSensorsSettingManager A manager for all PFD sensors user settings.
   */
  public constructor(
    context: MapSystemContext<MapDataIntegrityControllerModules, any, any, any>,
    pfdIndex: PfdIndex | Subscribable<PfdIndex>,
    private readonly pfdSensorsSettingManager: PfdSensorsUserSettingManager
  ) {
    super(context);

    this.pfdIndex = SubscribableUtils.toSubscribable(pfdIndex, true);
  }

  /** @inheritDoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<AhrsSystemEvents & AdcSystemEvents & FmsPositionSystemEvents>();

    this.pfdIndex.sub(pfdIndex => {
      this.ahrsIndexSub?.destroy();
      this.ahrsIndexSub = this.pfdSensorsSettingManager.getAliasedManager(pfdIndex).getSetting('pfdAhrsIndex').sub(ahrsIndex => {
        this.ahrsHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${ahrsIndex}`));
        this.ahrsAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${ahrsIndex}`));
      }, true);

      this.adcIndexSub?.destroy();
      this.adcIndexSub = this.pfdSensorsSettingManager.getAliasedManager(pfdIndex).getSetting('pfdAdcIndex').sub(adcIndex => {
        this.adcSystemState.setConsumer(sub.on(`adc_state_${adcIndex}`));
      }, true);

      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${pfdIndex}`));
    }, true);

    this.ahrsHeadingDataValid.pipe(this.dataIntegrityModule.headingSignalValid);
    this.ahrsAttitudeDataValid.pipe(this.dataIntegrityModule.attitudeSignalValid);
    this.adcSystemState.pipe(this.dataIntegrityModule.adcSignalValid, state => state !== null && (state.current === undefined || state.current === AvionicsSystemState.On));
    this.fmsPosMode.pipe(this.dataIntegrityModule.gpsSignalValid, mode => mode !== FmsPositionMode.None);
    this.fmsPosMode.pipe(this.dataIntegrityModule.isDeadReckoning, mode => mode === FmsPositionMode.DeadReckoning || mode === FmsPositionMode.DeadReckoningExpired);
  }

  /** @inheritDoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iauIndexSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.adcIndexSub?.destroy();

    this.ahrsHeadingDataValid.destroy();
    this.ahrsAttitudeDataValid.destroy();
    this.adcSystemState.destroy();
    this.fmsPosMode.destroy();

    super.destroy();
  }
}
