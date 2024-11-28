import { MathUtils, UnitType } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';

/**
 * Configuration options for {@link GarminNegativeClimbRateModule}.
 */
export type GarminNegativeClimbRateModuleOptions = {
  /**
   * Whether alerting should function as a GPWS alert. If `true`, then radar altimeter data (up to 2500 feet AGL) will
   * be used to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.GpwsFailed`
   * status is active. If `false`, then GPS altitude in conjunction with runway threshold elevation data will be used
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
 * A Garmin terrain alerting system module that handles negative climb rate after takeoff (NCR) alerts.
 */
export class GarminNegativeClimbRateModule implements TerrainSystemModule {
  private static readonly MAX_DISTANCE_FROM_AIRPORT = UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN);

  private readonly functionAsGpws: boolean;

  private readonly triggerDebounce: number;
  private readonly untriggerDebounce: number;

  private readonly triggerHysteresis: number;
  private readonly untriggerHysteresis: number;

  private readonly inhibitFlags: string[];

  private isReset = true;
  private isInhibited = false;

  private altitudeLossReference: number | undefined = undefined;

  private isAlertTriggered = false;

  private triggerDebounceTimer = 0;
  private untriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminNegativeClimbRateModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminNegativeClimbRateModuleOptions>) {
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

    if (
      !data.departureAirport
      || !data.departureRunway
      || !data.isHeadingValid
      || MathUtils.diffAngleDeg(data.departureRunway.course, data.headingTrue, false) > 110
      || data.gpsPos.distance(data.departureAirport) > GarminNegativeClimbRateModule.MAX_DISTANCE_FROM_AIRPORT
    ) {
      this.reset(dt, alertController);
      return;
    }

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;

        let altitude: number;
        let verticalSpeed: number;

        if (data.isGpsPosValid) {
          altitude = data.gpsAltitude;
          verticalSpeed = data.gpsVerticalSpeed;
        } else {
          altitude = data.baroAltitude;
          verticalSpeed = data.baroVerticalSpeed;
        }

        this.updateAlerts(dt, data.radarAltitude, altitude, verticalSpeed, alertController);
      } else {
        this.reset(dt, alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        const agl = data.gpsAltitude - UnitType.METER.convertTo(data.departureRunway.elevationEnd, UnitType.FOOT);
        this.updateAlerts(dt, agl, data.gpsAltitude, data.gpsVerticalSpeed, alertController);
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
        alertController.inhibitAlert(GarminTawsAlert.NcrCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.NcrCaution);
      }
    }
  }

  /**
   * Updates whether to issue a negative climb rate after takeoff alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param agl The airplane's current height above ground level, in feet.
   * @param altitude The airplane's current altitude, in feet.
   * @param verticalSpeed The airplane's current vertical speed, in feet per minute.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(dt: number, agl: number, altitude: number, verticalSpeed: number, alertController: TerrainSystemAlertController): void {
    if (agl > 700) {
      this.reset(dt, alertController);
      return;
    }

    let altitudeLoss = 0;

    if (this.altitudeLossReference === undefined || altitude > this.altitudeLossReference) {
      this.altitudeLossReference = altitude;
    } else {
      altitudeLoss = this.altitudeLossReference - altitude;
    }

    const isAltitudeLossAlertTriggered = GarminNegativeClimbRateModule.isAltitudeLoss(agl, altitudeLoss);
    const isSinkRateAlertTriggered = GarminNegativeClimbRateModule.isSinkRate(agl, -verticalSpeed);
    const isAlertTriggered = this.resolveAlertTriggerState(dt, isAltitudeLossAlertTriggered || isSinkRateAlertTriggered);

    if (isAlertTriggered !== this.isAlertTriggered) {
      this.triggerDebounceTimer = 0;
      this.untriggerDebounceTimer = 0;
      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;

      isAlertTriggered
        ? alertController.triggerAlert(GarminTawsAlert.NcrCaution)
        : alertController.untriggerAlert(GarminTawsAlert.NcrCaution);

      this.isAlertTriggered = isAlertTriggered;
    } else {
      if (this.isAlertTriggered) {
        this.triggerHysteresisTimer = Math.max(this.triggerHysteresisTimer - dt, 0);
      } else {
        this.untriggerHysteresisTimer = Math.max(this.untriggerHysteresisTimer - dt, 0);
      }
    }
  }

  /**
   * Resolves a desired alert trigger state to a trigger state to set.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param isTriggerDesired Whether the desired alert trigger state is to trigger the alert.
   * @returns The trigger state to set.
   */
  private resolveAlertTriggerState(dt: number, isTriggerDesired: boolean): boolean {
    if (isTriggerDesired) {
      // The conditions for triggering the alert have been met, so reset the untrigger debounce timer.
      this.untriggerDebounceTimer = 0;

      if (!this.isAlertTriggered) {
        if (this.triggerDebounceTimer >= this.triggerDebounce) {
          // The trigger debounce timer has expired. Check if untrigger hysteresis is still active. If so, then we can
          // trigger the alert.
          if (this.untriggerHysteresisTimer <= 0) {
            return true;
          }
        } else {
          // The trigger debounce timer has not yet expired. Increment the timer.
          this.triggerDebounceTimer += dt;
        }
      } else {
        // If the alert is already triggered, then keep it triggered.
        return true;
      }
    } else {
      // The conditions for triggering the alert have not been met, so reset the trigger debounce timer.
      this.triggerDebounceTimer = 0;

      if (this.isAlertTriggered) {
        if (this.untriggerDebounceTimer < this.untriggerDebounce) {
          // The untrigger debounce timer has not yet expired. Increment the timer and keep the alert triggered.
          this.untriggerDebounceTimer += dt;
          return true;
        } else if (this.triggerHysteresisTimer > 0) {
          // The untrigger debounce timer has expired, but trigger hysteresis is still active, so we need to keep the
          // alert triggered.
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Deactivates all negative climb rate after takeoff alerts.
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

    this.altitudeLossReference = undefined;
    this.isAlertTriggered = false;
    alertController.untriggerAlert(GarminTawsAlert.NcrCaution);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  /**
   * Checks whether a descent rate meets the threshold for an altitude loss alert for a given height above ground
   * level.
   * @param agl The height above ground level, in feet.
   * @param altitudeLoss The altitude loss, in feet.
   * @returns Whether the specified descent rate meets the threshold for an altitude loss alert.
   */
  private static isAltitudeLoss(agl: number, altitudeLoss: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 700) {
      threshold = MathUtils.lerp(agl, 50, 700, 10, 70);
    } else {
      threshold = Infinity;
    }

    return altitudeLoss >= threshold;
  }

  /**
   * Checks whether a descent rate meets the threshold for a sink rate alert for a given height above ground level.
   * @param agl The height above ground level, in feet.
   * @param descentRate The descent rate, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for a sink rate alert.
   */
  private static isSinkRate(agl: number, descentRate: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 700) {
      threshold = MathUtils.lerp(agl, 50, 700, 66.66666666666666, 500);
    } else {
      threshold = Infinity;
    }

    return descentRate >= threshold;
  }
}
