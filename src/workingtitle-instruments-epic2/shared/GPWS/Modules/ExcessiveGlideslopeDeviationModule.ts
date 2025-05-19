/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConsumerValue, ControlSurfacesEvents, EventBus, LerpLookupTable, Lookahead, MultiExpSmoother, SimpleMovingAverage, SoundPacket, SoundServerController
} from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode, VerticalDeviationDataProvider } from '../../Instruments';
import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * A GPWS module which handles Mode 5 Excessive Deviation Below Glideslope alerts.
 */
export class ExcessiveGlideslopeDeviationModule implements GpwsModule {
  private static readonly SOFT_GLIDESLOPE_ALERT_ID = 'egd-soft-glideslope';
  protected static readonly SOFT_GLIDESLOPE_SOUND_PACKET: SoundPacket = { key: ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID, sequence: ['aural_glideslope_soft'], continuous: false };
  private static readonly HARD_GLIDESLOPE_ALERT_ID = 'egd-hard-glideslope';
  protected static readonly HARD_GLIDESLOPE_SOUND_PACKET: SoundPacket = { key: ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_ID, sequence: ['aural_glideslope'], continuous: true };


  private static readonly SOFT_GLIDESLOPE_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.None,
    auralAlert: ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode5Glideslope
  };
  private static readonly HARD_GLIDESLOPE_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.None,
    auralAlert: ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode5Glideslope
  };

  /** Glideslope deviation below beam (dots), height AGL (ft) */
  private static readonly SOFT_GLIDESLOPE_REGION = new LerpLookupTable([[-1.3, 1000], [-1.3, 150], [-2.98, 30]]);
  private static readonly HARD_GLIDESLOPE_REGION = new LerpLookupTable([[-2, 3000], [-2, 150], [-3.68, 30]]);

  private static readonly AGL_BOUNDARY_ABOVE_500FPM = 500;
  private static readonly AGL_BOUNDARY_BELOW_500FPM = 1000;

  private readonly gearPosition = ConsumerValue.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('gear_position_2'), 0);

  private lastSoftWarnGlideslopeDeviation: number | null = null;

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param alertController The alert controller
   * @param verticalDeviationDataProvider The vertical deviation data provider
   * @param autopilotDataProvider The aircraft autopilot data provider
   */
  constructor(
    private readonly bus: EventBus,
    private readonly alertController: GpwsAlertController,
    private readonly verticalDeviationDataProvider: VerticalDeviationDataProvider,
    private readonly autopilotDataProvider: AutopilotDataProvider
  ) {
  }

  /** @inheritdoc */
  public onInit(): void {
    this.alertController.registerAlert(ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID, ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_DEFINITION);
    this.alertController.registerAlert(ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_ID, ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_DEFINITION);
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    const isGearDown = this.gearPosition.get() === 1;
    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround || !data.isRadarAltitudeValid || data.radarAltitude > 1000 || !isGearDown) {
      this.alertController.untriggerAlert(ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_ID);
      this.alertController.untriggerAlert(ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID);
      return;
    }

    const isGsInhibit = false;

    const isGpsApproach = this.verticalDeviationDataProvider.gpApproachPointerActive.get();
    const isLocActive = this.autopilotDataProvider.lateralActive.get() === Epic2ApLateralMode.Localiser;
    if (data.isGsGpActive && !isGsInhibit && (isGpsApproach || (!isGpsApproach && isLocActive))) {
      const upperBoundary =
        data.geoVerticalSpeed > -500 ? ExcessiveGlideslopeDeviationModule.AGL_BOUNDARY_ABOVE_500FPM : ExcessiveGlideslopeDeviationModule.AGL_BOUNDARY_BELOW_500FPM;

      const gsDeviation = this.verticalDeviationDataProvider.gsApproachPointerActive.get() ?
        this.verticalDeviationDataProvider.gsApproachPointerDeviation.get() : this.verticalDeviationDataProvider.gpApproachPointerDeviation.get();

      if (data.radarAltitude < upperBoundary && gsDeviation && gsDeviation < 0) {
        const gsDeviationDots = gsDeviation * 2;

        const isHardDeviation = gsDeviationDots < ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_REGION.get(data.radarAltitude);
        const isSoftDeviation = gsDeviationDots < ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_REGION.get(data.radarAltitude);

        if (isHardDeviation) {
          return this.alertController.triggerAlert(ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_ID);
        } else if (isSoftDeviation) {
          if (!this.lastSoftWarnGlideslopeDeviation) {
            this.alertController.triggerAlert(ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID);
            this.lastSoftWarnGlideslopeDeviation = gsDeviationDots;
          } else if (gsDeviationDots < this.lastSoftWarnGlideslopeDeviation * 1.2) {
            this.alertController.triggerAuralAlert(ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID);
            this.lastSoftWarnGlideslopeDeviation = gsDeviationDots;
          }
          return;
        }
      }

      // If this function hasnt returned before now then we can untrigger any warnings
      this.alertController.untriggerAlert(ExcessiveGlideslopeDeviationModule.HARD_GLIDESLOPE_ALERT_ID);
      this.alertController.untriggerAlert(ExcessiveGlideslopeDeviationModule.SOFT_GLIDESLOPE_ALERT_ID);
    }
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
