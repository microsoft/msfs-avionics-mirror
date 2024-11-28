import {
  AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, MapSystemContext, MapSystemController, MapSystemKeys,
  Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import {
  AdcSystemEvents, AhrsSystemEvents, FmsPositionMode, FmsPositionSystemEvents, MapGarminDataIntegrityModule
} from '@microsoft/msfs-garminsdk';

import { GduUserSettingTypes } from '../../../Settings/GduUserSettings';

/**
 * Modules required for MapDataIntegrityController.
 */
export interface MapDataIntegrityControllerModules {
  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapGarminDataIntegrityModule;
}

/**
 * Controls the map's position, heading, attitude, and air data signal validity states.
 */
export class MapDataIntegrityController extends MapSystemController<MapDataIntegrityControllerModules> {
  private readonly dataIntegrityModule = this.context.model.getModule(MapSystemKeys.DataIntegrity);

  private readonly ahrsHeadingDataValid = ConsumerSubject.create(null, false);
  private readonly ahrsAttitudeDataValid = ConsumerSubject.create(null, false);
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent | null>(null, null);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private ahrsIndexSub?: Subscription;
  private adcIndexSub?: Subscription;

  /**
   * Creates a new instance of MapDataIntegrityController.
   * @param context This controller's map context.
   * @param gduIndex The index of the GDU from which the map sources data.
   * @param gduSettingManager A manager for GDU user settings.
   */
  public constructor(
    context: MapSystemContext<MapDataIntegrityControllerModules, any, any, any>,
    private readonly gduIndex: number,
    private readonly gduSettingManager: UserSettingManager<GduUserSettingTypes>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<AhrsSystemEvents & AdcSystemEvents & FmsPositionSystemEvents>();

    this.ahrsIndexSub = this.gduSettingManager.getSetting('gduAhrsIndex').sub(ahrsIndex => {
      this.ahrsHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${ahrsIndex}`));
      this.ahrsAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${ahrsIndex}`));
    }, true);

    this.adcIndexSub = this.gduSettingManager.getSetting('gduAdcIndex').sub(adcIndex => {
      this.adcSystemState.setConsumer(sub.on(`adc_state_${adcIndex}`));
    }, true);

    this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${this.gduIndex}`));

    this.ahrsHeadingDataValid.pipe(this.dataIntegrityModule.headingSignalValid);
    this.ahrsAttitudeDataValid.pipe(this.dataIntegrityModule.attitudeSignalValid);
    this.adcSystemState.pipe(this.dataIntegrityModule.adcSignalValid, state => state !== null && (state.current === undefined || state.current === AvionicsSystemState.On));
    this.fmsPosMode.pipe(this.dataIntegrityModule.gpsSignalValid, mode => mode !== FmsPositionMode.None);
    this.fmsPosMode.pipe(this.dataIntegrityModule.isDeadReckoning, mode => mode === FmsPositionMode.DeadReckoning || mode === FmsPositionMode.DeadReckoningExpired);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ahrsIndexSub?.destroy();
    this.adcIndexSub?.destroy();

    this.ahrsHeadingDataValid.destroy();
    this.ahrsAttitudeDataValid.destroy();
    this.adcSystemState.destroy();
    this.fmsPosMode.destroy();

    super.destroy();
  }
}