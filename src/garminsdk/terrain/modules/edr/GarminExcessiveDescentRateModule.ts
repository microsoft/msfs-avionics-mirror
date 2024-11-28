import { MathUtils } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';
import { GarminExcessiveDescentRateAlert } from './GarminExcessiveDescentRateTypes';

/**
 * Configuration options for {@link GarminExcessiveDescentRateModule}.
 */
export type GarminExcessiveDescentRateModuleOptions = {
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

  /** The inhibit flags that should inhibit alerting. If not defined, then no flags will inhibit alerting. */
  inhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles excessive descent rate (EDR) alerts.
 */
export class GarminExcessiveDescentRateModule implements TerrainSystemModule {

  private readonly functionAsGpws: boolean;

  private readonly triggerDebounce: number;
  private readonly untriggerDebounce: number;

  private readonly triggerHysteresis: number;
  private readonly untriggerHysteresis: number;

  private readonly inhibitFlags: string[];

  private isReset = true;
  private isInhibited = false;

  private triggeredAlert: GarminExcessiveDescentRateAlert | null = null;

  private warningTriggerDebounceTimer = 0;
  private cautionTriggerDebounceTimer = 0;
  private warningUntriggerDebounceTimer = 0;
  private cautionUntriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminExcessiveDescentRateModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminExcessiveDescentRateModuleOptions>) {
    this.functionAsGpws = options?.functionAsGpws ?? false;
    this.triggerDebounce = options?.triggerDebounce ?? 2000;
    this.untriggerDebounce = options?.untriggerDebounce ?? 2000;
    this.triggerHysteresis = options?.triggerHysteresis ?? 5000;
    this.untriggerHysteresis = options?.untriggerHysteresis ?? 0;
    this.inhibitFlags = options?.inhibitFlags ? Array.from(options.inhibitFlags) : [];
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
    ) {
      this.reset(dt, alertController);
      return;
    }

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;
        this.updateAlerts(dt, data.radarAltitude, data.isGpsPosValid ? data.gpsVerticalSpeed : data.baroVerticalSpeed, alertController);
      } else {
        this.reset(dt, alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        this.updateAlerts(dt, data.gpsAgl, data.gpsVerticalSpeed, alertController);
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
    let isInhibited = false;
    for (let i = 0; !isInhibited && i < this.inhibitFlags.length; i++) {
      isInhibited = inhibits.has(this.inhibitFlags[i]);
    }

    if (this.isInhibited !== isInhibited) {
      this.isInhibited = isInhibited;

      if (isInhibited) {
        alertController.inhibitAlert(GarminTawsAlert.EdrWarning);
        alertController.inhibitAlert(GarminTawsAlert.EdrCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.EdrWarning);
        alertController.uninhibitAlert(GarminTawsAlert.EdrCaution);
      }
    }
  }

  /**
   * Updates whether to issue an excessive descent rate alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param agl The airplane's current height above ground level, in feet.
   * @param verticalSpeed The airplane's current vertical speed, in feet per minute.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(dt: number, agl: number, verticalSpeed: number, alertController: TerrainSystemAlertController): void {
    let triggeredAlert: GarminExcessiveDescentRateAlert | null = null;

    if (GarminExcessiveDescentRateModule.isWarning(agl, -verticalSpeed)) {
      triggeredAlert = GarminTawsAlert.EdrWarning;
    } else if (GarminExcessiveDescentRateModule.isCaution(agl, -verticalSpeed)) {
      triggeredAlert = GarminTawsAlert.EdrCaution;
    }

    triggeredAlert = this.resolveTriggeredAlert(dt, triggeredAlert);

    if (triggeredAlert !== this.triggeredAlert) {
      // Don't reset the warning trigger debounce timer if we are upgrading from no alert -> caution.
      if (!(triggeredAlert === GarminTawsAlert.EdrCaution && this.triggeredAlert === null)) {
        this.warningTriggerDebounceTimer = 0;
      }

      this.cautionTriggerDebounceTimer = 0;
      this.warningUntriggerDebounceTimer = 0;

      // Don't reset the caution untrigger debounce timer if we are downgrading from warning -> caution.
      if (!(triggeredAlert === GarminTawsAlert.EdrCaution && this.triggeredAlert === GarminTawsAlert.EdrWarning)) {
        this.cautionUntriggerDebounceTimer = 0;
      }

      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;

      triggeredAlert !== null && alertController.triggerAlert(triggeredAlert);
      this.triggeredAlert !== null && alertController.untriggerAlert(this.triggeredAlert);

      this.triggeredAlert = triggeredAlert;
    } else {
      if (this.triggeredAlert !== null) {
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
  private resolveTriggeredAlert(dt: number, desiredTriggeredAlert: GarminExcessiveDescentRateAlert | null): GarminExcessiveDescentRateAlert | null {
    if (this.triggeredAlert === desiredTriggeredAlert) {
      switch (desiredTriggeredAlert) {
        case GarminTawsAlert.EdrWarning:
          this.warningUntriggerDebounceTimer = 0;
          this.cautionUntriggerDebounceTimer = 0;
          break;
        case GarminTawsAlert.EdrCaution:
          this.warningTriggerDebounceTimer = 0;
          this.cautionUntriggerDebounceTimer = 0;
          break;
        case null:
          this.warningTriggerDebounceTimer = 0;
          this.cautionTriggerDebounceTimer = 0;
          break;
      }

      return desiredTriggeredAlert;
    }

    if (this.triggeredAlert === null || desiredTriggeredAlert === GarminTawsAlert.EdrWarning) {
      this.warningUntriggerDebounceTimer = 0;
      this.cautionUntriggerDebounceTimer = 0;
      return this.resolveTriggeredAlertUpgrade(dt, desiredTriggeredAlert as GarminExcessiveDescentRateAlert);
    } else {
      this.warningTriggerDebounceTimer = 0;
      this.cautionTriggerDebounceTimer = 0;
      return this.resolveTriggeredAlertDowngrade(dt, desiredTriggeredAlert);
    }
  }

  /**
   * Resolves a desired triggered alert that is of higher severity than this module's existing triggered alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param desiredTriggeredAlert The desired triggered alert.
   * @returns The alert to trigger, or `null` if no alert should be triggered.
   */
  private resolveTriggeredAlertUpgrade(dt: number, desiredTriggeredAlert: GarminExcessiveDescentRateAlert): GarminExcessiveDescentRateAlert | null {
    let triggeredAlert: GarminExcessiveDescentRateAlert | null = desiredTriggeredAlert;

    let triggerDebounceTimerProp: 'warningTriggerDebounceTimer' | 'cautionTriggerDebounceTimer';
    if (desiredTriggeredAlert === GarminTawsAlert.EdrWarning) {
      triggerDebounceTimerProp = 'warningTriggerDebounceTimer';
    } else {
      triggerDebounceTimerProp = 'cautionTriggerDebounceTimer';

      // If the desired alert is caution, then reset the warning trigger debounce timer, since the conditions for
      // triggering the warning alert have not been met.
      this.warningTriggerDebounceTimer = 0;
    }

    if (this[triggerDebounceTimerProp] >= this.triggerDebounce) {
      // The trigger debounce timer for the desired alert has expired. Check if untrigger hysteresis is still active.
      // If so, then we need to abort the alert upgrade.
      if (this.triggeredAlert === null && this.untriggerHysteresisTimer > 0) {
        triggeredAlert = this.triggeredAlert;
      }
    } else {
      // The trigger debounce timer for the desired alert has not yet expired. Increment the timer.
      this[triggerDebounceTimerProp] += dt;
      if (this.triggeredAlert === null && desiredTriggeredAlert === GarminTawsAlert.EdrWarning) {
        // If we are trying to upgrade from no alert -> warning but can't because of debounce, then check if we could
        // upgrade to caution instead.
        return this.resolveTriggeredAlertUpgrade(dt, GarminTawsAlert.EdrCaution);
      }
      triggeredAlert = this.triggeredAlert;
    }

    return triggeredAlert;
  }

  /**
   * Resolves a desired triggered alert that is of lower severity than this module's existing triggered alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param desiredTriggeredAlert The desired triggered alert, or `null` if all alerts are desired to be untriggered.
   * @returns The alert to trigger, or `null` if no alert should be triggered.
   */
  private resolveTriggeredAlertDowngrade(dt: number, desiredTriggeredAlert: GarminTawsAlert.EdrCaution | null): GarminExcessiveDescentRateAlert | null {
    let triggeredAlert: GarminExcessiveDescentRateAlert | null = desiredTriggeredAlert;

    let untriggerDebounceTimerProp: 'warningUntriggerDebounceTimer' | 'cautionUntriggerDebounceTimer';
    if (this.triggeredAlert === GarminTawsAlert.EdrWarning) {
      untriggerDebounceTimerProp = 'warningUntriggerDebounceTimer';
    } else {
      untriggerDebounceTimerProp = 'cautionUntriggerDebounceTimer';
    }

    if (desiredTriggeredAlert === GarminTawsAlert.EdrCaution) {
      // If the desired alert is caution, then reset the caution untrigger debounce timer, since the conditions for
      // triggering the caution alert are still met.
      this.cautionUntriggerDebounceTimer = 0;
    } else if (desiredTriggeredAlert === null && this.triggeredAlert === GarminTawsAlert.EdrWarning) {
      // If we are trying to downgrade from warning -> no alert, then we need to increment the caution untrigger
      // debounce timer, since the conditions for triggering the caution alert are not met and we won't increment the
      // timer below.
      if (this.cautionTriggerDebounceTimer < this.untriggerDebounce) {
        this.cautionUntriggerDebounceTimer += dt;
      }
    }

    if (this[untriggerDebounceTimerProp] < this.untriggerDebounce) {
      // The untrigger debounce timer for the existing triggered alert has not yet expired. Increment the timer and
      // abort the alert downgrade.
      this[untriggerDebounceTimerProp] += dt;
      triggeredAlert = this.triggeredAlert;
    } else if (this.triggerHysteresisTimer > 0) {
      // The untrigger debounce timer for the desired alert has expired, but trigger hysteresis is still active, so we
      // need to abort the alert downgrade.
      triggeredAlert = this.triggeredAlert;
    }

    return triggeredAlert;
  }

  /**
   * Deactivates all excessive descent rate alerts.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(dt: number, alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      this.untriggerHysteresisTimer = Math.max(this.untriggerHysteresisTimer - dt, 0);
      return;
    }

    this.warningTriggerDebounceTimer = 0;
    this.cautionTriggerDebounceTimer = 0;
    this.warningUntriggerDebounceTimer = 0;
    this.cautionUntriggerDebounceTimer = 0;
    this.triggerHysteresisTimer = this.triggerHysteresis;
    this.untriggerHysteresisTimer = this.untriggerHysteresis;

    this.triggeredAlert = null;
    alertController.untriggerAlert(GarminTawsAlert.EdrWarning);
    alertController.untriggerAlert(GarminTawsAlert.EdrCaution);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  /**
   * Checks whether a descent rate meets the threshold for an excessive descent rate warning alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param descentRate The descent rate, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for an excessive descent rate warning alert.
   */
  private static isWarning(agl: number, descentRate: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 100) {
      threshold = MathUtils.lerp(agl, 50, 100, 1300, 1400);
    } else if (agl <= 1100) {
      threshold = MathUtils.lerp(agl, 100, 1100, 1400, 2275);
    } else if (agl <= 1200) {
      threshold = MathUtils.lerp(agl, 1100, 1200, 2275, 2400);
    } else if (agl <= 2450) {
      threshold = MathUtils.lerp(agl, 1200, 2450, 2400, 4900);
    } else {
      threshold = MathUtils.lerp(agl, 2450, 4400, 4900, 12000);
    }

    return descentRate >= threshold;
  }

  /**
   * Checks whether a descent rate meets the threshold for an excessive descent rate caution alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param descentRate The descent rate, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for an excessive descent rate caution alert.
   */
  private static isCaution(agl: number, descentRate: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 150) {
      threshold = MathUtils.lerp(agl, 50, 150, 1300, 1400);
    } else if (agl <= 1400) {
      threshold = MathUtils.lerp(agl, 150, 1400, 1400, 2275);
    } else if (agl <= 1500) {
      threshold = MathUtils.lerp(agl, 1400, 1500, 2275, 2400);
    } else if (agl <= 3075) {
      threshold = MathUtils.lerp(agl, 1500, 3075, 2400, 4900);
    } else {
      threshold = MathUtils.lerp(agl, 3075, 5500, 4900, 12000);
    }

    return descentRate >= threshold;
  }
}
