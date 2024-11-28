import { MathUtils, MultiExpSmoother } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';
import { GarminExcessiveClosureRateAlert } from './GarminExcessiveClosureRateTypes';

/**
 * Parameters for exponential smoothers used by {@link GarminExcessiveClosureRateModule}.
 */
export type GarminExcessiveClosureRateModuleSmootherParams = {
  /**
   * The smoothing time constant, in milliseconds. The larger the constant, the greater the smoothing effect. A value
   * less than or equal to 0 is equivalent to no smoothing. Defaults to `1000 / Math.LN2`.
   */
  tau?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated velocity of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated velocity. A value less than or equal to 0 is
   * equivalent to no smoothing. If not defined, then estimated velocity will not be used to calculate the final
   * smoothed value.
   */
  tauVelocity?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated acceleration of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated acceleration. A value less than or equal to 0
   * is equivalent to no smoothing. If this value or `tauVelocity` is not defined, then estimated acceleration will not
   * be used to calculate the final smoothed value.
   */
  tauAccel?: number;

  /**
   * The elapsed time threshold, in milliseconds, above which smoothing will not be applied to a new input value.
   * Defaults to 10000.
   */
  dtThreshold?: number;
};

/**
 * Configuration options for {@link GarminExcessiveClosureRateModule}.
 */
export type GarminExcessiveClosureRateModuleOptions = {
  /**
   * Whether alerting should function as a GPWS alert. If `true`, then radar altimeter data (up to 2500 feet AGL) will
   * be used to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.GpwsFailed`
   * status is active. If `false`, then GPS altitude in conjunction with terrain database ground elevation will be used
   * to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.TawsFailed` or
   * `GarminTawsStatus.TawsNotAvailable` statuses are active. Defaults to `false`.
   */
  functionAsGpws?: boolean;

  /**
   * Whether to force the module to always consider FLTA as not available. If `false`, then FLTA will be considered not
   * available if and only if either the `GarminTawsStatus.TawsFailed` or `GarminTawsStatus.TawsNotAvailable` status
   * flag is active. Defaults to `false`.
   */
  forceNoFlta?: boolean;

  /**
   * The flaps extension angle range, as `[min, max]` in degrees, that defines the landing flaps configuration. If not
   * defined, then flaps will never be considered to be in the landing configuration.
   */
  flapsLandingAngle?: readonly [number, number];

  /** Parameters for smoothing applied to terrain closure rate. */
  closureRateSmootherParams?: Readonly<GarminExcessiveClosureRateModuleSmootherParams>;

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
 * A Garmin terrain alerting system module that handles excessive closure rate (ECR) alerts.
 */
export class GarminExcessiveClosureRateModule implements TerrainSystemModule {

  private readonly functionAsGpws: boolean;
  private readonly forceNoFlta: boolean;

  private readonly flapsLandingAngle: readonly [number, number];

  private readonly triggerDebounce: number;
  private readonly untriggerDebounce: number;

  private readonly triggerHysteresis: number;
  private readonly untriggerHysteresis: number;

  private readonly inhibitFlags: string[];

  private isReset = true;
  private isInhibited = false;

  private triggeredAlert: GarminExcessiveClosureRateAlert | null = null;

  private warningTriggerDebounceTimer = 0;
  private cautionTriggerDebounceTimer = 0;
  private warningUntriggerDebounceTimer = 0;
  private cautionUntriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private readonly closureRateSmoother: MultiExpSmoother;
  private lastAgl: number | undefined = undefined;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminExcessiveClosureRateModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminExcessiveClosureRateModuleOptions>) {
    this.functionAsGpws = options?.functionAsGpws ?? false;
    this.forceNoFlta = options?.forceNoFlta ?? false;
    this.flapsLandingAngle = options?.flapsLandingAngle ?? [Infinity, Infinity];
    this.triggerDebounce = options?.triggerDebounce ?? 2000;
    this.untriggerDebounce = options?.untriggerDebounce ?? 2000;
    this.triggerHysteresis = options?.triggerHysteresis ?? 5000;
    this.untriggerHysteresis = options?.untriggerHysteresis ?? 0;
    this.inhibitFlags = options?.inhibitFlags ? Array.from(options.inhibitFlags) : [];

    this.closureRateSmoother = new MultiExpSmoother(
      options?.closureRateSmootherParams?.tau ?? 1000 / Math.LN2,
      options?.closureRateSmootherParams?.tauVelocity,
      options?.closureRateSmootherParams?.tauAccel,
      null, null, null,
      options?.closureRateSmootherParams?.dtThreshold ?? 10000
    );
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

    const noFlta = this.forceNoFlta || statuses.has(GarminTawsStatus.TawsFailed) || statuses.has(GarminTawsStatus.TawsNotAvailable);

    // Alerting is disabled when the distance to the nearest airport is less than or equal to 5 nautical miles and
    // FLTA alerting is available.
    if (!noFlta && data.nearestAirport) {
      this.reset(dt, alertController);
      return;
    }

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;
        this.updateAlerts(dt, data, noFlta, data.radarAltitude, alertController);
      } else {
        this.reset(dt, alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        this.updateAlerts(dt, data, noFlta, data.gpsAgl, alertController);
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
        alertController.inhibitAlert(GarminTawsAlert.EcrWarning);
        alertController.inhibitAlert(GarminTawsAlert.EcrCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.EcrWarning);
        alertController.uninhibitAlert(GarminTawsAlert.EcrCaution);
      }
    }
  }

  /**
   * Updates whether to issue an excessive closure rate alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param data Terrain system data.
   * @param noFlta Whether FLTA is not available.
   * @param agl The airplane's current height above ground level, in feet.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(dt: number, data: Readonly<TerrainSystemData>, noFlta: boolean, agl: number, alertController: TerrainSystemAlertController): void {
    let triggeredAlert: GarminExcessiveClosureRateAlert | null = null;

    if (this.lastAgl === undefined || dt === 0) {
      this.closureRateSmoother.reset();
    } else {
      const closureRate = this.closureRateSmoother.next((this.lastAgl - agl) / dt * 60000, dt);

      const isGearDown = data.gearPosition[0] > 0 || data.gearPosition[1] > 0 || data.gearPosition[2] > 0;
      const isFlapsLanding = data.flapsAngle[0] >= this.flapsLandingAngle[0] && data.flapsAngle[0] <= this.flapsLandingAngle[1]
        && data.flapsAngle[1] >= this.flapsLandingAngle[0] && data.flapsAngle[1] <= this.flapsLandingAngle[1];

      if (GarminExcessiveClosureRateModule.isWarning(agl, closureRate, noFlta, isFlapsLanding, isGearDown)) {
        triggeredAlert = GarminTawsAlert.EcrWarning;
      } else if (GarminExcessiveClosureRateModule.isCaution(agl, closureRate, noFlta, isFlapsLanding, isGearDown)) {
        triggeredAlert = GarminTawsAlert.EcrCaution;
      }
    }

    triggeredAlert = this.resolveTriggeredAlert(dt, triggeredAlert);

    if (triggeredAlert !== this.triggeredAlert) {
      // Don't reset the warning trigger debounce timer if we are upgrading from no alert -> caution.
      if (!(triggeredAlert === GarminTawsAlert.EcrCaution && this.triggeredAlert === null)) {
        this.warningTriggerDebounceTimer = 0;
      }

      this.cautionTriggerDebounceTimer = 0;
      this.warningUntriggerDebounceTimer = 0;

      // Don't reset the caution untrigger debounce timer if we are downgrading from warning -> caution.
      if (!(triggeredAlert === GarminTawsAlert.EcrCaution && this.triggeredAlert === GarminTawsAlert.EcrWarning)) {
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

    this.lastAgl = agl;
  }

  /**
   * Resolves a desired triggered alert to an alert to trigger.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param desiredTriggeredAlert The desired triggered alert, or `null` if all alerts are desired to be untriggered.
   * @returns The alert to trigger, or `null` if no alert should be triggered.
   */
  private resolveTriggeredAlert(dt: number, desiredTriggeredAlert: GarminExcessiveClosureRateAlert | null): GarminExcessiveClosureRateAlert | null {
    if (this.triggeredAlert === desiredTriggeredAlert) {
      switch (desiredTriggeredAlert) {
        case GarminTawsAlert.EcrWarning:
          this.warningUntriggerDebounceTimer = 0;
          this.cautionUntriggerDebounceTimer = 0;
          break;
        case GarminTawsAlert.EcrCaution:
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

    if (this.triggeredAlert === null || desiredTriggeredAlert === GarminTawsAlert.EcrWarning) {
      this.warningUntriggerDebounceTimer = 0;
      this.cautionUntriggerDebounceTimer = 0;
      return this.resolveTriggeredAlertUpgrade(dt, desiredTriggeredAlert as GarminExcessiveClosureRateAlert);
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
  private resolveTriggeredAlertUpgrade(dt: number, desiredTriggeredAlert: GarminExcessiveClosureRateAlert): GarminExcessiveClosureRateAlert | null {
    let triggeredAlert: GarminExcessiveClosureRateAlert | null = desiredTriggeredAlert;

    let triggerDebounceTimerProp: 'warningTriggerDebounceTimer' | 'cautionTriggerDebounceTimer';
    if (desiredTriggeredAlert === GarminTawsAlert.EcrWarning) {
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
      if (this.triggeredAlert === null && desiredTriggeredAlert === GarminTawsAlert.EcrWarning) {
        // If we are trying to upgrade from no alert -> warning but can't because of debounce, then check if we could
        // upgrade to caution instead.
        return this.resolveTriggeredAlertUpgrade(dt, GarminTawsAlert.EcrCaution);
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
  private resolveTriggeredAlertDowngrade(dt: number, desiredTriggeredAlert: GarminTawsAlert.EcrCaution | null): GarminExcessiveClosureRateAlert | null {
    let triggeredAlert: GarminExcessiveClosureRateAlert | null = desiredTriggeredAlert;

    let untriggerDebounceTimerProp: 'warningUntriggerDebounceTimer' | 'cautionUntriggerDebounceTimer';
    if (this.triggeredAlert === GarminTawsAlert.EcrWarning) {
      untriggerDebounceTimerProp = 'warningUntriggerDebounceTimer';
    } else {
      untriggerDebounceTimerProp = 'cautionUntriggerDebounceTimer';
    }

    if (desiredTriggeredAlert === GarminTawsAlert.EcrCaution) {
      // If the desired alert is caution, then reset the caution untrigger debounce timer, since the conditions for
      // triggering the caution alert are still met.
      this.cautionUntriggerDebounceTimer = 0;
    } else if (desiredTriggeredAlert === null && this.triggeredAlert === GarminTawsAlert.EcrWarning) {
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
   * Deactivates all excessive closure rate alerts.
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

    this.lastAgl = undefined;

    this.triggeredAlert = null;
    alertController.untriggerAlert(GarminTawsAlert.EcrWarning);
    alertController.untriggerAlert(GarminTawsAlert.EcrCaution);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  private static readonly WARNING_NO_FLTA_BREAKPOINTS: [number, number][] = [
    [50, 2060],
    [75, 2100],
    [1500, 3900],
    [1800, 6000]
  ];
  private static readonly CAUTION_NO_FLTA_BREAKPOINTS: [number, number][] = [
    [50, 2060],
    [100, 2100],
    [1875, 3900],
    [2250, 6000]
  ];

  private static readonly WARNING_GEAR_UP_BREAKPOINTS: [number, number][] = [
    [50, 2550],
    [975, 4000]
  ];
  private static readonly CAUTION_GEAR_UP_BREAKPOINTS: [number, number][] = [
    [50, 2550],
    [1220, 4000]
  ];

  private static readonly WARNING_GEAR_DOWN_BREAKPOINTS: [number, number][] = [
    [50, 2910],
    [650, 4000]
  ];
  private static readonly CAUTION_GEAR_DOWN_BREAKPOINTS: [number, number][] = [
    [50, 2890],
    [815, 4000]
  ];

  private static readonly WARNING_FLAPS_LANDING_BREAKPOINTS: [number, number][] = [
    [220, 2705],
    [650, 3250]
  ];
  private static readonly CAUTION_FLAPS_LANDING_BREAKPOINTS: [number, number][] = [
    [220, 2666.666666666666],
    [275, 2700],
    [810, 3250]
  ];

  private static readonly WARNING_FLAPS_LANDING_NO_FLTA_BREAKPOINTS: [number, number][] = [
    [220, 2250],
    [795, 3000]
  ];
  private static readonly CAUTION_FLAPS_LANDING_NO_FLTA_BREAKPOINTS: [number, number][] = [
    [220, 2210],
    [270, 2250],
    [990, 3000]
  ];

  /**
   * Checks whether a closure rate meets the threshold for an excessive closure rate warning alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param closureRate The closure rate, in feet per minute.
   * @param noFlta Whether FLTA is not available.
   * @param isFlapsLanding Whether flaps are in the landing configuration.
   * @param isGearDown Whether landing gear are extended.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate warning alert.
   */
  private static isWarning(
    agl: number,
    closureRate: number,
    noFlta: boolean,
    isFlapsLanding: boolean,
    isGearDown: boolean
  ): boolean {
    let breakpoints: [number, number][];

    if (isFlapsLanding) {
      breakpoints = noFlta
        ? GarminExcessiveClosureRateModule.WARNING_FLAPS_LANDING_NO_FLTA_BREAKPOINTS
        : GarminExcessiveClosureRateModule.WARNING_FLAPS_LANDING_BREAKPOINTS;
    } else {
      breakpoints = noFlta
        ? GarminExcessiveClosureRateModule.WARNING_NO_FLTA_BREAKPOINTS
        : isGearDown
          ? GarminExcessiveClosureRateModule.WARNING_GEAR_DOWN_BREAKPOINTS
          : GarminExcessiveClosureRateModule.WARNING_GEAR_UP_BREAKPOINTS;
    }

    return GarminExcessiveClosureRateModule.isAlert(breakpoints, agl, closureRate);
  }

  /**
   * Checks whether a closure rate meets the threshold for an excessive closure rate caution alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param closureRate The closure rate, in feet per minute.
   * @param noFlta Whether FLTA is not available.
   * @param isFlapsLanding Whether flaps are in the landing configuration.
   * @param isGearDown Whether landing gear are extended.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate caution alert.
   */
  private static isCaution(
    agl: number,
    closureRate: number,
    noFlta: boolean,
    isFlapsLanding: boolean,
    isGearDown: boolean
  ): boolean {
    let breakpoints: [number, number][];

    if (isFlapsLanding) {
      breakpoints = noFlta
        ? GarminExcessiveClosureRateModule.CAUTION_FLAPS_LANDING_NO_FLTA_BREAKPOINTS
        : GarminExcessiveClosureRateModule.CAUTION_FLAPS_LANDING_BREAKPOINTS;
    } else {
      breakpoints = noFlta
        ? GarminExcessiveClosureRateModule.CAUTION_NO_FLTA_BREAKPOINTS
        : isGearDown
          ? GarminExcessiveClosureRateModule.CAUTION_GEAR_DOWN_BREAKPOINTS
          : GarminExcessiveClosureRateModule.CAUTION_GEAR_UP_BREAKPOINTS;
    }

    return GarminExcessiveClosureRateModule.isAlert(breakpoints, agl, closureRate);
  }

  /**
   * Checks whether a closure rate meets the threshold for an excessive closure rate alert for a given height above
   * ground level.
   * @param breakpoints The closure rate threshold vs. height above ground level breakpoints to use.
   * @param agl The height above ground level, in feet.
   * @param closureRate The closure rate, in feet per minute.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate caution alert.
   */
  private static isAlert(
    breakpoints: readonly (readonly [number, number])[],
    agl: number,
    closureRate: number
  ): boolean {
    let threshold = Infinity;

    if (agl >= breakpoints[0][0]) {
      for (let i = 1; i < breakpoints.length; i++) {
        const prevBreakpoint = breakpoints[i - 1];
        const breakpoint = breakpoints[i];
        if (agl <= breakpoint[0]) {
          threshold = MathUtils.lerp(agl, prevBreakpoint[0], breakpoint[0], prevBreakpoint[1], breakpoint[1], true, true);
        }
      }
    }

    return closureRate >= threshold;
  }
}
