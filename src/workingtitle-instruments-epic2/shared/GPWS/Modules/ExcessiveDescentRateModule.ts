/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventBus, LerpLookupTable, SoundPacket, SoundServerController } from '@microsoft/msfs-sdk';

import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * A GPWS module which handles Mode 1 Excessive Descent Rate callouts.
 */
export class ExcessiveDescentRateModule implements GpwsModule {
  private static readonly PULL_UP_ALERT_ID = 'edr-pull-up';
  private static readonly SINKRATE_ALERT_ID = 'edr-sinkrate';

  protected static readonly SINKRATE_WARNING_REGION = new LerpLookupTable([[-1031, 0], [-5007, 2450], [-Infinity, 2451]]);
  protected static readonly PULL_UP_WARNING_REGION = new LerpLookupTable([[-1500, 0], [-1765, 346], [-10000, 1958], [-Infinity, 1959]]);
  protected static readonly SINKRATE_WARNING_STEEP_APPR_BIAS = 300;
  protected static readonly PULL_UP_WARNING_STEEP_APPR_BIAS = 200;

  protected static readonly PULL_UP_SOUND_PACKET: SoundPacket = { key: 'edr-pull-up', sequence: ['aural_pull_up'], continuous: true };
  protected static readonly SINK_RATE_SOUND_PACKET: SoundPacket = { key: 'edr-sinkrate', sequence: ['aural_sink_rate', 'aural_sink_rate'], continuous: false };

  private static readonly PULL_UP_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.PullUp,
    auralAlert: ExcessiveDescentRateModule.PULL_UP_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode1PullUp
  };
  private static readonly SINKRATE_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: ExcessiveDescentRateModule.SINK_RATE_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode1Sinkrate
  };

  private lastSinkrateTimeToImpact: number | null = null;

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
    this.alertController.registerAlert(ExcessiveDescentRateModule.PULL_UP_ALERT_ID, ExcessiveDescentRateModule.PULL_UP_ALERT_DEFINITION);
    this.alertController.registerAlert(ExcessiveDescentRateModule.SINKRATE_ALERT_ID, ExcessiveDescentRateModule.SINKRATE_ALERT_DEFINITION);
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround || data.radarAltitude > 2500) {
      return;
    }

    if (data.isRadarAltitudeValid) {
      const sinkrateBias = data.isSteepApproachActive ? ExcessiveDescentRateModule.SINKRATE_WARNING_STEEP_APPR_BIAS : 0;
      const pullUpBias = data.isSteepApproachActive ? ExcessiveDescentRateModule.PULL_UP_WARNING_STEEP_APPR_BIAS : 0;

      const sinkrateActive = this.getWarningActive(ExcessiveDescentRateModule.SINKRATE_WARNING_REGION, data, sinkrateBias);
      const pullUpActive = this.getWarningActive(ExcessiveDescentRateModule.PULL_UP_WARNING_REGION, data, pullUpBias);

      if (pullUpActive) {
        this.alertController.triggerAlert(ExcessiveDescentRateModule.PULL_UP_ALERT_ID);
      } else {
        this.alertController.untriggerAlert(ExcessiveDescentRateModule.PULL_UP_ALERT_ID);

        if (sinkrateActive) {
          const timeToImpact = Math.abs(data.radarAltitude / data.geoVerticalSpeed);
          if (this.lastSinkrateTimeToImpact === null || timeToImpact < 0.8 * this.lastSinkrateTimeToImpact) {
            if (this.lastSinkrateTimeToImpact === null) {
              this.alertController.triggerAlert(ExcessiveDescentRateModule.SINKRATE_ALERT_ID);
            } else {
              this.alertController.triggerAuralAlert(ExcessiveDescentRateModule.SINKRATE_ALERT_ID);
            }

            this.lastSinkrateTimeToImpact = timeToImpact;
          }
        } else {
          this.alertController.untriggerAlert(ExcessiveDescentRateModule.SINKRATE_ALERT_ID);
        }
      }
    }
  }

  /**
   * Determines if a warning should be active
   * @param warningRegion The region in which the warning is activated
   * @param data The GPWS data
   * @param fpmBias Any FPM bias to apply to the warning. Defaults to 0.
   * @returns True if the warning is active
   */
  private getWarningActive(warningRegion: LerpLookupTable, data: Readonly<GpwsData>, fpmBias = 0): boolean {
    const sinkrateFpm = warningRegion.get(data.radarAltitude);

    return data.geoVerticalSpeed < (sinkrateFpm + fpmBias);
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
