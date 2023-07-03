import { AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, MapSystemContext, MapSystemController, MapSystemKeys, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';
import { AdcSystemEvents, AhrsSystemEvents, FmsPositionMode, FmsPositionSystemEvents, MapGarminDataIntegrityModule } from '@microsoft/msfs-garminsdk';
import { IauUserSettingManager } from '../../../Settings/IauUserSettings';

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

  private readonly iauIndex: Subscribable<number>;

  private readonly ahrsHeadingDataValid = ConsumerSubject.create(null, false);
  private readonly ahrsAttitudeDataValid = ConsumerSubject.create(null, false);
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent | null>(null, null);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private iauIndexSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private adcIndexSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param iauIndex The index of the IAU (integrated avionics unit) used by the map to obtain heading and GPS data.
   * @param iauSettingManager A manager for all IAU user settings.
   */
  public constructor(
    context: MapSystemContext<MapDataIntegrityControllerModules, any, any, any>,
    iauIndex: number | Subscribable<number>,
    private readonly iauSettingManager: IauUserSettingManager
  ) {
    super(context);

    this.iauIndex = SubscribableUtils.toSubscribable(iauIndex, true);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<AhrsSystemEvents & AdcSystemEvents & FmsPositionSystemEvents>();

    this.iauIndex.sub(iauIndex => {
      this.ahrsIndexSub?.destroy();
      this.ahrsIndexSub = this.iauSettingManager.getAliasedManager(iauIndex).getSetting('iauAhrsIndex').sub(ahrsIndex => {
        this.ahrsHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${ahrsIndex}`));
        this.ahrsAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${ahrsIndex}`));
      }, true);

      this.adcIndexSub?.destroy();
      this.adcIndexSub = this.iauSettingManager.getAliasedManager(iauIndex).getSetting('iauAdcIndex').sub(adcIndex => {
        this.adcSystemState.setConsumer(sub.on(`adc_state_${adcIndex}`));
      }, true);

      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${iauIndex}`));
    }, true);

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