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

  private readonly inhibitFlags: string[];

  private isReset = true;

  private activeAlert: GarminExcessiveClosureRateAlert | null = null;

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
    const dt = this.lastUpdateTime === undefined ? 0 : Math.max(data.realTime - this.lastUpdateTime, 0) * data.simRate;
    this.lastUpdateTime = data.realTime;

    if (
      operatingMode !== TerrainSystemOperatingMode.Operating
      || (
        this.functionAsGpws
          ? statuses.has(GarminTawsStatus.GpwsFailed)
          : statuses.has(GarminTawsStatus.TawsFailed) || statuses.has(GarminTawsStatus.TawsNotAvailable)
      )
      || data.isOnGround
    ) {
      this.reset(alertController);
      return;
    }

    // Check if one of our inhibit flags is active.
    for (let i = 0; i < this.inhibitFlags.length; i++) {
      if (inhibits.has(this.inhibitFlags[i])) {
        this.reset(alertController);
        return;
      }
    }

    const noFlta = this.forceNoFlta || statuses.has(GarminTawsStatus.TawsFailed) || statuses.has(GarminTawsStatus.TawsNotAvailable);

    // Alerting is disabled when the distance to the nearest airport is less than or equal to 5 nautical miles and
    // FLTA alerting is available.
    if (!noFlta && data.nearestAirport) {
      this.reset(alertController);
      return;
    }

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;
        this.updateAlerts(data, noFlta, data.radarAltitude, dt, alertController);
      } else {
        this.reset(alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        this.updateAlerts(data, noFlta, data.gpsAgl, dt, alertController);
      } else {
        this.reset(alertController);
      }
    }
  }

  /**
   * Updates whether to issue an excessive closure rate alert.
   * @param data Terrain system data.
   * @param noFlta Whether FLTA is not available.
   * @param agl The airplane's current height above ground level, in feet.
   * @param dt The elapsed simulation time, in milliseconds, since the last update cycle.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(data: Readonly<TerrainSystemData>, noFlta: boolean, agl: number, dt: number, alertController: TerrainSystemAlertController): void {
    let activeAlert: GarminExcessiveClosureRateAlert | null = null;

    if (this.lastAgl === undefined) {
      this.closureRateSmoother.reset();
    } else {
      const closureRate = this.closureRateSmoother.next((this.lastAgl - agl) / dt * 60000, dt);

      const isGearDown = data.gearPosition[0] > 0 || data.gearPosition[1] > 0 || data.gearPosition[2] > 0;
      const isFlapsLanding = data.flapsAngle[0] >= this.flapsLandingAngle[0] && data.flapsAngle[0] <= this.flapsLandingAngle[1]
        && data.flapsAngle[1] >= this.flapsLandingAngle[0] && data.flapsAngle[1] <= this.flapsLandingAngle[1];

      // Set up hysteresis offsets.
      const warningThresholdOffset = this.activeAlert === GarminTawsAlert.EcrWarning ? -100 : 0;
      const cautionThresholdOffset = this.activeAlert === GarminTawsAlert.EcrCaution ? -100 : 0;

      if (GarminExcessiveClosureRateModule.isWarning(agl, closureRate, noFlta, isFlapsLanding, isGearDown, warningThresholdOffset)) {
        activeAlert = GarminTawsAlert.EcrWarning;
      } else if (GarminExcessiveClosureRateModule.isCaution(agl, closureRate, noFlta, isFlapsLanding, isGearDown, cautionThresholdOffset)) {
        activeAlert = GarminTawsAlert.EcrCaution;
      }
    }

    if (activeAlert !== this.activeAlert) {
      activeAlert !== null && alertController.activateAlert(activeAlert);
      this.activeAlert !== null && alertController.deactivateAlert(this.activeAlert);

      this.activeAlert = activeAlert;
    }

    this.lastAgl = agl;
  }

  /**
   * Deactivates all excessive closure rate alerts.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    this.lastAgl = undefined;

    this.activeAlert = null;
    alertController.deactivateAlert(GarminTawsAlert.EcrWarning);
    alertController.deactivateAlert(GarminTawsAlert.EcrCaution);

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
   * @param thresholdOffset An offset to apply to the closure rate threshold for alerting, in feet per minute.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate warning alert.
   */
  private static isWarning(
    agl: number,
    closureRate: number,
    noFlta: boolean,
    isFlapsLanding: boolean,
    isGearDown: boolean,
    thresholdOffset: number
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

    return GarminExcessiveClosureRateModule.isAlert(breakpoints, agl, closureRate, thresholdOffset);
  }

  /**
   * Checks whether a closure rate meets the threshold for an excessive closure rate caution alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param closureRate The closure rate, in feet per minute.
   * @param noFlta Whether FLTA is not available.
   * @param isFlapsLanding Whether flaps are in the landing configuration.
   * @param isGearDown Whether landing gear are extended.
   * @param thresholdOffset An offset to apply to the closure rate threshold for alerting, in feet per minute.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate caution alert.
   */
  private static isCaution(
    agl: number,
    closureRate: number,
    noFlta: boolean,
    isFlapsLanding: boolean,
    isGearDown: boolean,
    thresholdOffset: number
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

    return GarminExcessiveClosureRateModule.isAlert(breakpoints, agl, closureRate, thresholdOffset);
  }

  /**
   * Checks whether a closure rate meets the threshold for an excessive closure rate alert for a given height above
   * ground level.
   * @param breakpoints The closure rate threshold vs. height above ground level breakpoints to use.
   * @param agl The height above ground level, in feet.
   * @param closureRate The closure rate, in feet per minute.
   * @param thresholdOffset An offset to apply to the closure rate threshold for alerting, in feet per minute.
   * @returns Whether the specified closure rate meets the threshold for an excessive closure rate caution alert.
   */
  private static isAlert(
    breakpoints: readonly (readonly [number, number])[],
    agl: number,
    closureRate: number,
    thresholdOffset: number
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

    return closureRate >= threshold + thresholdOffset;
  }
}
