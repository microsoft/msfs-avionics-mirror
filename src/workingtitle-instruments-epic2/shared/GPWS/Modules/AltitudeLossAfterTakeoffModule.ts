/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventBus, LerpLookupTable, Lookahead, MultiExpSmoother, SimpleMovingAverage, SoundPacket, SoundServerController } from '@microsoft/msfs-sdk';

import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * A GPWS module which handles Mode 3 Altitude Loss after Takeoff alerts.
 */
export class AltitudeLossAfterTakeoffModule implements GpwsModule {
  private static readonly DONT_SINK_ALERT_ID = 'alat-dont-sink';

  protected static readonly GO_AROUND_MAX_HEIGHT = 250;
  protected static readonly GO_AROUND_MAXIMUM_APPROACH_VS = -400;
  protected static readonly GO_AROUND_MINIMUM_TAKEOFF_VS = 500;

  /** (Altitude Loss (ft), Peak Radio Altitude (ft)) */
  protected static readonly ALTITUDE_LOSS_REGION = new LerpLookupTable([[8, 30], [143, 1500]]);

  protected static readonly DONT_SINK_SOUND_PACKET: SoundPacket = { key: 'alat-dont-sink', sequence: ['aural_dont_sink', 'aural_dont_sink'], continuous: false };

  private static readonly DONT_SINK_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: AltitudeLossAfterTakeoffModule.DONT_SINK_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode3DontSink
  };

  private isModeActive = false;
  private altitudeReference: number | null = null;
  private peakAltitude: number | null = null;

  private lastWarningAltitude: number | null = null;
  private prevTakeoffState = false;

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param alertController The alert controller
   */
  constructor(
    private readonly bus: EventBus,
    private readonly alertController: GpwsAlertController
  ) {
  }

  /** @inheritdoc */
  public onInit(): void {
    this.alertController.registerAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID, AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_DEFINITION);
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    if (data.isOnGround || (data.isTakeoff && this.prevTakeoffState !== data.isTakeoff)) {
      this.altitudeReference = data.geoAltitude;
      this.isModeActive = true;
    }

    this.prevTakeoffState = data.isTakeoff;
    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround || data.radarAltitude > 2500) {
      this.alertController.untriggerAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID);
      return;
    }

    if (data.isRadarAltitudeValid && data.radarAltitude > 30) {
      if (this.peakAltitude && this.peakAltitude > 1500) {
        this.isModeActive = false;
        this.peakAltitude = null;
        this.altitudeReference = null;

        this.alertController.untriggerAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID);
        return;
      }

      if (this.isModeActive) {
        const altitude = data.geoAltitude - (this.altitudeReference ?? 0);
        this.peakAltitude = Math.max(altitude, this.peakAltitude ?? 0);

        const allowableAltLoss = AltitudeLossAfterTakeoffModule.ALTITUDE_LOSS_REGION.get(this.peakAltitude);
        const dontSinkActive = this.peakAltitude - altitude > allowableAltLoss;

        if (dontSinkActive) {
          if (!this.lastWarningAltitude) {
            this.alertController.triggerAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID);
            this.lastWarningAltitude = altitude;
          } else if (altitude < this.lastWarningAltitude * 0.8) {
            this.alertController.triggerAuralAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID);
            this.lastWarningAltitude = altitude;
          }
        } else {
          this.alertController.untriggerAlert(AltitudeLossAfterTakeoffModule.DONT_SINK_ALERT_ID);
        }
      }
    }
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
