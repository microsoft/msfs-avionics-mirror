import { MathUtils } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';
import { GarminGlideslopeDeviationAlert } from './GarminGlideslopeDeviationTypes';
import { GlidepathServiceLevel } from '../../../autopilot/vnav/GarminVNavTypes';

/**
 * Configuration options for {@link GarminGlideslopeDeviationModule}.
 */
export type GarminGlideslopeDeviationModuleOptions = {
  /**
   * Whether alerting should function as a GPWS alert. If `true`, then radar altimeter data (up to 2500 feet AGL) will
   * be used to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.GpwsFailed`
   * status is active. If `false`, then GPS altitude in conjunction with terrain database ground elevation will be used
   * to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.TawsFailed` or
   * `GarminTawsStatus.TawsNotAvailable` statuses are active. Defaults to `false`.
   */
  functionAsGpws?: boolean;

  /**
   * The consecutive amount of time, in milliseconds, that the conditions for one of the module's alerts must be met
   * before the alert is triggered. Defaults to `2000`.
   */
  triggerDebounce?: number;

  /**
   * The consecutive amount of time, in milliseconds, that the conditions for one of the module's alerts must not be
   * met before the alert is untriggered. Defaults to `2000`.
   */
  untriggerDebounce?: number;

  /**
   * The amount of time, in milliseconds, after an alert becomes triggered before it can be untriggered. Defaults to
   * `5000`.
   */
  triggerHysteresis?: number;

  /**
   * The amount of time, in milliseconds, after an alert becomes untriggered before it can be triggered. Defaults to
   * `0`.
   */
  untriggerHysteresis?: number;

  /**
   * The inhibit flags that should inhibit glideslope alerting. If not defined, then no flags will inhibit glideslope
   * alerting.
   */
  glideslopeInhibitFlags?: Iterable<string>;

  /**
   * The inhibit flags that should inhibit glidepath alerting. If not defined, then no flags will inhibit glidepath
   * alerting.
   */
  glidepathInhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles glideslope/glidepath deviation (GSD) alerts.
 */
export class GarminGlideslopeDeviationModule implements TerrainSystemModule {

  private readonly functionAsGpws: boolean;

  private readonly triggerDebounce: number;
  private readonly untriggerDebounce: number;

  private readonly triggerHysteresis: number;
  private readonly untriggerHysteresis: number;

  private readonly glideslopeInhibitFlags: string[];
  private readonly glidepathInhibitFlags: string[];

  private isReset = true;
  private isGlideslopeInhibited = false;
  private isGlidepathInhibited = false;

  private triggeredAlert: GarminGlideslopeDeviationAlert | null = null;

  private triggerDebounceTimer = 0;
  private untriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminGlideslopeDeviationModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminGlideslopeDeviationModuleOptions>) {
    this.functionAsGpws = options?.functionAsGpws ?? false;
    this.triggerDebounce = options?.triggerDebounce ?? 2000;
    this.untriggerDebounce = options?.untriggerDebounce ?? 2000;
    this.triggerHysteresis = options?.triggerHysteresis ?? 5000;
    this.untriggerHysteresis = options?.untriggerHysteresis ?? 0;
    this.glideslopeInhibitFlags = options?.glideslopeInhibitFlags ? Array.from(options.glideslopeInhibitFlags) : [];
    this.glidepathInhibitFlags = options?.glidepathInhibitFlags ? Array.from(options.glidepathInhibitFlags) : [];
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(
    operatingMode: TerrainSystemOperatingMode,
    statuses: ReadonlySet<string>,
    inhibits: ReadonlySet<string>,
    data: Readonly<TerrainSystemData>,
    alertController: TerrainSystemAlertController
  ): void {
    const dt = this.lastUpdateTime === undefined ? 0 : MathUtils.clamp((data.realTime - this.lastUpdateTime) * data.simRate, 0, 10000);
    this.lastUpdateTime = data.realTime;

    this.updateInhibits(inhibits, alertController);

    if (
      operatingMode !== TerrainSystemOperatingMode.Operating
      || (
        this.functionAsGpws
          ? statuses.has(GarminTawsStatus.GpwsFailed)
          : statuses.has(GarminTawsStatus.TawsFailed) || statuses.has(GarminTawsStatus.TawsNotAvailable)
      )
      || data.isOnGround
      || !data.flightPhase.isApproachActive
      || (data.approachDetails.type !== ApproachType.APPROACH_TYPE_ILS && data.approachDetails.type !== ApproachType.APPROACH_TYPE_RNAV)
      || data.gearPosition[0] * data.gearPosition[1] * data.gearPosition[2] < 1 // Not all gear are down and locked.
      || isNaN(data.gsGpDeviation)
    ) {
      this.reset(dt, alertController);
      return;
    }

    // If an RNAV approach is active, alerting is only supported if the service level is LPV, LP+V, or LNAV/VNAV.
    if (data.approachDetails.type === ApproachType.APPROACH_TYPE_RNAV) {
      switch (data.gpServiceLevel) {
        case GlidepathServiceLevel.Lpv:
        case GlidepathServiceLevel.LpPlusV:
        case GlidepathServiceLevel.LNavVNav:
          break;
        default:
          this.reset(dt, alertController);
          return;
      }
    }

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;
        this.updateAlerts(dt, data.approachDetails.type, data.radarAltitude, data.gsGpDeviation, alertController);
      } else {
        this.reset(dt, alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        this.updateAlerts(dt, data.approachDetails.type, data.gpsAgl, data.gsGpDeviation, alertController);
      } else {
        this.reset(dt, alertController);
      }
    }
  }

  /**
   * Updates whether this module's alerts are inhibited.
   * @param inhibits The parent system's currently active inhibits.
   * @param alertController A controller for alerts issued by the parent system.
   */
  private updateInhibits(inhibits: ReadonlySet<string>, alertController: TerrainSystemAlertController): void {
    let isGlideslopeInhibited = false;
    for (let i = 0; !isGlideslopeInhibited && i < this.glideslopeInhibitFlags.length; i++) {
      isGlideslopeInhibited = inhibits.has(this.glideslopeInhibitFlags[i]);
    }

    let isGlidepathInhibited = false;
    for (let i = 0; !isGlidepathInhibited && i < this.glidepathInhibitFlags.length; i++) {
      isGlidepathInhibited = inhibits.has(this.glidepathInhibitFlags[i]);
    }

    if (this.isGlideslopeInhibited !== isGlideslopeInhibited) {
      this.isGlideslopeInhibited = isGlideslopeInhibited;

      if (isGlideslopeInhibited) {
        alertController.inhibitAlert(GarminTawsAlert.GsdGlideslopeCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.GsdGlideslopeCaution);
      }
    }

    if (this.isGlidepathInhibited !== isGlidepathInhibited) {
      this.isGlidepathInhibited = isGlidepathInhibited;

      if (isGlidepathInhibited) {
        alertController.inhibitAlert(GarminTawsAlert.GsdGlidepathCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.GsdGlidepathCaution);
      }
    }
  }

  /**
   * Updates whether to issue an excessive descent rate alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param approachType The active approach type.
   * @param agl The airplane's current height above ground level, in feet.
   * @param gsGpDeviation The airplane's current glideslope/glidepath deviation, scaled such that ±1 represents
   * full-scale deviation. Positive deviation indicates the airplane is below the glideslope/glidepath.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(
    dt: number,
    approachType: ApproachType.APPROACH_TYPE_ILS | ApproachType.APPROACH_TYPE_RNAV,
    agl: number,
    gsGpDeviation: number,
    alertController: TerrainSystemAlertController
  ): void {
    const alertToTrigger = approachType === ApproachType.APPROACH_TYPE_ILS
      ? GarminTawsAlert.GsdGlideslopeCaution
      : GarminTawsAlert.GsdGlidepathCaution;

    if (this.triggeredAlert !== null && this.triggeredAlert !== alertToTrigger) {
      const alertToUntrigger = this.triggeredAlert;
      this.triggerDebounceTimer = 0;
      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerDebounceTimer = 0;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;
      this.triggeredAlert = null;
      alertController.untriggerAlert(alertToUntrigger);
    }

    const triggeredAlert = this.resolveTriggeredAlert(dt, GarminGlideslopeDeviationModule.isAlert(agl, gsGpDeviation) ? alertToTrigger : null);

    if (triggeredAlert !== this.triggeredAlert) {
      this.triggerDebounceTimer = 0;
      this.untriggerDebounceTimer = 0;

      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;

      triggeredAlert !== null && alertController.triggerAlert(triggeredAlert);
      this.triggeredAlert !== null && alertController.untriggerAlert(this.triggeredAlert);

      this.triggeredAlert = triggeredAlert;
    } else {
      if (this.triggeredAlert) {
        this.triggerHysteresisTimer = Math.max(this.triggerHysteresisTimer - dt, 0);
      } else {
        this.untriggerHysteresisTimer = Math.max(this.untriggerHysteresisTimer - dt, 0);
      }
    }
  }

  /**
   * Resolves a desired triggered alert to an alert to trigger.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param desiredTriggeredAlert The desired triggered alert, or `null` if all alerts are desired to be untriggered.
   * @returns The alert to trigger, or `null` if no alert should be triggered.
   */
  private resolveTriggeredAlert(dt: number, desiredTriggeredAlert: GarminGlideslopeDeviationAlert | null): GarminGlideslopeDeviationAlert | null {
    let triggeredAlert: GarminGlideslopeDeviationAlert | null = null;

    if (desiredTriggeredAlert !== null) {
      // The conditions for triggering the alert have been met, so reset the untrigger debounce timer.
      this.untriggerDebounceTimer = 0;

      if (this.triggeredAlert !== desiredTriggeredAlert) {
        if (this.triggerDebounceTimer >= this.triggerDebounce) {
          // The trigger debounce timer has expired. Check if untrigger hysteresis is still active. If so, then we can
          // trigger the alert.
          if (this.untriggerHysteresisTimer <= 0) {
            triggeredAlert = desiredTriggeredAlert;
          }
        } else {
          // The trigger debounce timer has not yet expired. Increment the timer.
          this.triggerDebounceTimer += dt;
        }
      } else {
        // If the alert is already triggered, then keep it triggered.
        triggeredAlert = desiredTriggeredAlert;
      }
    } else {
      // The conditions for triggering the alert have not been met, so reset the trigger debounce timer.
      this.triggerDebounceTimer = 0;

      if (this.triggeredAlert === desiredTriggeredAlert) {
        if (this.untriggerDebounceTimer < this.untriggerDebounce) {
          // The untrigger debounce timer has not yet expired. Increment the timer and keep the alert triggered.
          this.untriggerDebounceTimer += dt;
          triggeredAlert = this.triggeredAlert;
        } else if (this.triggerHysteresisTimer > 0) {
          // The untrigger debounce timer has expired, but trigger hysteresis is still active, so we need to keep the
          // alert triggered.
          triggeredAlert = this.triggeredAlert;
        }
      }
    }

    return triggeredAlert;
  }

  /**
   * Untriggers all of this module's alerts.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(dt: number, alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      this.untriggerHysteresisTimer = Math.max(this.untriggerHysteresisTimer - dt, 0);
      return;
    }

    this.triggerDebounceTimer = 0;
    this.untriggerDebounceTimer = 0;

    this.triggerHysteresisTimer = this.triggerHysteresis;
    this.untriggerHysteresisTimer = this.untriggerHysteresis;

    this.triggeredAlert = null;
    alertController.untriggerAlert(GarminTawsAlert.GsdGlideslopeCaution);
    alertController.untriggerAlert(GarminTawsAlert.GsdGlidepathCaution);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  /**
   * Checks whether a glideslope/glidepath deviation meets the threshold for a glideslope/glidepath deviation alert for
   * a given height above ground level.
   * @param agl The height above ground level, in feet.
   * @param gsGpDeviation The glideslope/glidepath deviation, scaled such that ±1 represents full-scale deviation.
   * Positive deviation indicates the airplane is below the glideslope/glidepath.
   * @returns Whether the specified deviation meets the threshold for a glideslope/glidepath deviation alert.
   */
  private static isAlert(agl: number, gsGpDeviation: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 150) {
      threshold = MathUtils.lerp(agl, 50, 150, 1.36, 0.635);
    } else if (agl <= 1000) {
      threshold = 0.635;
    } else {
      threshold = Infinity;
    }

    return gsGpDeviation >= threshold;
  }
}
