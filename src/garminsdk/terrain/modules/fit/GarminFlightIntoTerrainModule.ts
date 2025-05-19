import { MathUtils, ObjectUtils } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';
import { GarminFlightIntoTerrainAlert } from './GarminFlightIntoTerrainTypes';

/**
 * Configuration options for {@link GarminFlightIntoTerrainModule}.
 */
export type GarminFlightIntoTerrainModuleOptions = {
  /**
   * Whether alerting should function as a GPWS alert. If `true`, then radar altimeter data (up to 2500 feet AGL) will
   * be used to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.GpwsFailed`
   * status is active. If `false`, then GPS altitude in conjunction with runway threshold elevation data will be used
   * to measure height above terrain, and alerting will be inhibited when the `GarminTawsStatus.TawsFailed` or
   * `GarminTawsStatus.TawsNotAvailable` statuses are active. Defaults to `false`.
   */
  functionAsGpws?: boolean;

  /** The flaps extension angle range, as `[min, max]` in degrees, that defines the landing flaps configuration. */
  flapsLandingAngle: readonly [number, number];

  /** The maximum allowed indicated airspeed with flaps extended to landing configuration, in knots. */
  vfeLanding: number;

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

  /**
   * The inhibit flags that should inhibit alerting based on flap position. If not defined, then no flags will inhibit
   * alerting based on flap position.
   */
  flapsInhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles flight into terrain (FIT) alerts.
 */
export class GarminFlightIntoTerrainModule implements TerrainSystemModule {
  private readonly functionAsGpws: boolean;

  private readonly flapsLandingAngle: readonly [number, number];
  private readonly vfeLanding: number;

  private readonly inhibitFlags: string[];
  private readonly flapsInhibitFlags: string[];

  private readonly alerts: Record<GarminFlightIntoTerrainAlert, FitAlert>;

  private isReset = true;
  private isInhibited = false;
  private isFlapsInhibited = false;

  private isTakeoffPhase = true;

  private altitudeLossReference: number | undefined = undefined;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminFlightIntoTerrainModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options: Readonly<GarminFlightIntoTerrainModuleOptions>) {
    this.functionAsGpws = options.functionAsGpws ?? false;

    this.flapsLandingAngle = options.flapsLandingAngle;
    this.vfeLanding = options.vfeLanding;

    this.inhibitFlags = options.inhibitFlags ? Array.from(options.inhibitFlags) : [];
    this.flapsInhibitFlags = options.flapsInhibitFlags ? Array.from(options.flapsInhibitFlags) : [];

    const triggerDebounce = options?.triggerDebounce ?? 2000;
    const untriggerDebounce = options?.untriggerDebounce ?? 2000;
    const triggerHysteresis = options?.triggerHysteresis ?? 5000;
    const untriggerHysteresis = options?.untriggerHysteresis ?? 0;

    this.alerts = ObjectUtils.fromEntries(
      ([
        GarminTawsAlert.FitTerrainCaution,
        GarminTawsAlert.FitTerrainGearCaution,
        GarminTawsAlert.FitTerrainFlapsCaution,
        GarminTawsAlert.FitGearCaution,
        GarminTawsAlert.FitFlapsCaution,
        GarminTawsAlert.FitTakeoffCaution,
      ] as const)
        .map(alert => [alert, new FitAlert(alert, triggerDebounce, untriggerDebounce, triggerHysteresis, untriggerHysteresis)])
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

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        const verticalSpeed = data.isGpsPosValid ? data.gpsVerticalSpeed : data.baroVerticalSpeed;
        this.updateAlerts(dt, data, data.radarAltitude, verticalSpeed, data.gpsGroundSpeed, alertController);
      } else {
        this.reset(dt, alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.updateAlerts(dt, data, data.gpsAgl, data.gpsVerticalSpeed, data.gpsGroundSpeed, alertController);
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

    let isFlapInhibited = isInhibited;
    if (!isFlapInhibited) {
      for (let i = 0; !isFlapInhibited && i < this.flapsInhibitFlags.length; i++) {
        isFlapInhibited = inhibits.has(this.flapsInhibitFlags[i]);
      }
    }

    if (this.isInhibited !== isInhibited) {
      this.isInhibited = isInhibited;

      if (isInhibited) {
        alertController.inhibitAlert(GarminTawsAlert.FitTerrainCaution);
        alertController.inhibitAlert(GarminTawsAlert.FitGearCaution);
        alertController.inhibitAlert(GarminTawsAlert.FitTakeoffCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.FitTerrainCaution);
        alertController.uninhibitAlert(GarminTawsAlert.FitGearCaution);
        alertController.uninhibitAlert(GarminTawsAlert.FitTakeoffCaution);
      }
    }

    if (this.isFlapsInhibited !== isFlapInhibited) {
      this.isFlapsInhibited = isFlapInhibited;

      if (isFlapInhibited) {
        alertController.inhibitAlert(GarminTawsAlert.FitTerrainFlapsCaution);
        alertController.inhibitAlert(GarminTawsAlert.FitFlapsCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.FitTerrainFlapsCaution);
        alertController.uninhibitAlert(GarminTawsAlert.FitFlapsCaution);
      }
    }
  }

  /**
   * Updates whether to issue a flight into terrain alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param data Terrain system data.
   * @param agl The airplane's current height above ground level, in feet.
   * @param verticalSpeed The airplane's current vertical speed, in feet per minute.
   * @param groundSpeed The airplane's current ground speed, in knots.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(
    dt: number,
    data: Readonly<TerrainSystemData>,
    agl: number,
    verticalSpeed: number,
    groundSpeed: number,
    alertController: TerrainSystemAlertController
  ): void {
    this.isReset = false;

    if (this.isTakeoffPhase) {
      if (agl > 700) {
        this.isTakeoffPhase = false;
      }
    } else {
      if (agl < 50) {
        this.isTakeoffPhase = true;
      }
    }

    let desiredTerrainTriggerState = false;
    let desiredTerrainGearTriggerState = false;
    let desiredTerrainFlapsTriggerState = false;
    let desiredGearTriggerState = false;
    let desiredFlapsTriggerState = false;
    let desiredTakeoffTriggerState = false;

    if (this.isTakeoffPhase) {
      let altitudeLoss = 0;

      if (this.altitudeLossReference === undefined || agl > this.altitudeLossReference) {
        this.altitudeLossReference = agl;
      } else {
        altitudeLoss = this.altitudeLossReference - agl;
      }

      if (agl <= 300) {
        desiredTakeoffTriggerState = GarminFlightIntoTerrainModule.isAltitudeLoss(agl, altitudeLoss);
      }
    } else {
      this.altitudeLossReference = undefined;

      if (agl <= 500) {
        const isGearUp = data.gearPosition[0] <= 0 && data.gearPosition[1] <= 0 && data.gearPosition[2] <= 0;
        const isFlapsNotLanding = data.flapsAngle[0] < this.flapsLandingAngle[0] || data.flapsAngle[0] > this.flapsLandingAngle[1]
          || data.flapsAngle[1] < this.flapsLandingAngle[0] || data.flapsAngle[1] > this.flapsLandingAngle[1];

        const alertLevel = GarminFlightIntoTerrainModule.getLandingAlertLevel(agl, verticalSpeed);
        if (alertLevel === 1) {
          if (isGearUp) {
            const isBelowVfe = groundSpeed <= this.vfeLanding;
            if (isBelowVfe) {
              desiredGearTriggerState = true;
            } else {
              desiredTerrainTriggerState = true;
            }
          }
        } else if (alertLevel === 2) {
          desiredGearTriggerState = isGearUp;

          if (!isGearUp && isFlapsNotLanding) {
            desiredFlapsTriggerState = true;
          } else if (groundSpeed > this.vfeLanding) {
            desiredTerrainGearTriggerState = isGearUp;
            desiredTerrainFlapsTriggerState = isFlapsNotLanding;
          }
        }
      }
    }

    this.alerts[GarminTawsAlert.FitTerrainCaution].update(dt, desiredTerrainTriggerState, alertController);
    this.alerts[GarminTawsAlert.FitTerrainGearCaution].update(dt, desiredTerrainGearTriggerState, alertController);
    this.alerts[GarminTawsAlert.FitTerrainFlapsCaution].update(dt, desiredTerrainFlapsTriggerState, alertController);
    this.alerts[GarminTawsAlert.FitGearCaution].update(dt, desiredGearTriggerState, alertController);
    this.alerts[GarminTawsAlert.FitFlapsCaution].update(dt, desiredFlapsTriggerState, alertController);
    this.alerts[GarminTawsAlert.FitTakeoffCaution].update(dt, desiredTakeoffTriggerState, alertController);
  }

  /**
   * Deactivates all flight into terrain alerts.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(dt: number, alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    this.isTakeoffPhase = true;

    this.altitudeLossReference = undefined;

    this.alerts[GarminTawsAlert.FitTerrainCaution].reset(dt, alertController);
    this.alerts[GarminTawsAlert.FitTerrainGearCaution].reset(dt, alertController);
    this.alerts[GarminTawsAlert.FitTerrainFlapsCaution].reset(dt, alertController);
    this.alerts[GarminTawsAlert.FitGearCaution].reset(dt, alertController);
    this.alerts[GarminTawsAlert.FitFlapsCaution].reset(dt, alertController);
    this.alerts[GarminTawsAlert.FitTakeoffCaution].reset(dt, alertController);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  /**
   * Checks whether an altitude loss amount meets the threshold for an altitude loss alert for a given height above
   * ground level.
   * @param agl The height above ground level, in feet.
   * @param altitudeLoss The altitude loss, in feet.
   * @returns Whether the specified altitude loss amount meets the threshold for an altitude loss alert.
   */
  private static isAltitudeLoss(agl: number, altitudeLoss: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 150) {
      threshold = MathUtils.lerp(agl, 50, 150, 49, 50);
    } else if (agl <= 300) {
      threshold = MathUtils.lerp(agl, 150, 300, 50, 100);
    } else {
      threshold = Infinity;
    }

    return altitudeLoss >= threshold;
  }

  /**
   * Gets the landing alert level for a given combination of height above ground level and vertical speed.
   * @param agl The height above ground level, in feet.
   * @param verticalSpeed The vertical speed, in feet per minute.
   * @returns The landing alert level for the specified height above ground level and vertical speed.
   */
  private static getLandingAlertLevel(agl: number, verticalSpeed: number): 0 | 1 | 2 {
    if (agl <= 50) {
      return 0;
    } else if (agl <= 200) {
      return 2;
    } else if (agl <= 500) {
      const threshold = MathUtils.lerp(agl, 200, 500, -600, -1450);
      return verticalSpeed <= threshold ? 2 : 1;
    } else {
      return 0;
    }
  }
}

/**
 * A flight into terrain alert.
 */
class FitAlert {
  private isAlertTriggered = false;

  private triggerDebounceTimer = 0;
  private untriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private isReset = true;

  /**
   * Creates a new instance of FitAlert.
   * @param alert The identity of this alert.
   * @param triggerDebounce The consecutive amount of time, in milliseconds, that the conditions for this alert must be
   * met before the alert is triggered.
   * @param untriggerDebounce The consecutive amount of time, in milliseconds, that the conditions for this alert must
   * not be met before the alert is untriggered.
   * @param triggerHysteresis The amount of time, in milliseconds, after an alert becomes triggered before it can be
   * untriggered.
   * @param untriggerHysteresis The amount of time, in milliseconds, after an alert becomes untriggered before it can
   * be triggered.
   */
  public constructor(
    private readonly alert: GarminFlightIntoTerrainAlert,
    private readonly triggerDebounce: number,
    private readonly untriggerDebounce: number,
    private readonly triggerHysteresis: number,
    private readonly untriggerHysteresis: number
  ) {
  }

  /**
   * Updates whether to issue this alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param desiredTriggeredState The desired trigger state for this alert.
   * @param alertController A controller for alerts tracked by this alert's parent system.
   */
  public update(dt: number, desiredTriggeredState: boolean, alertController: TerrainSystemAlertController): void {
    this.isReset = false;

    const isAlertTriggered = this.resolveAlertTriggerState(dt, desiredTriggeredState);

    if (isAlertTriggered !== this.isAlertTriggered) {
      this.triggerDebounceTimer = 0;
      this.untriggerDebounceTimer = 0;
      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;

      isAlertTriggered
        ? alertController.triggerAlert(this.alert)
        : alertController.untriggerAlert(this.alert);

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
   * Deactivates this alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param alertController A controller for alerts tracked by this alert's parent system.
   */
  public reset(dt: number, alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      this.untriggerHysteresisTimer = Math.max(this.untriggerHysteresisTimer - dt, 0);
      return;
    }

    this.triggerDebounceTimer = 0;
    this.untriggerDebounceTimer = 0;
    this.triggerHysteresisTimer = this.triggerHysteresis;
    this.untriggerHysteresisTimer = this.untriggerHysteresis;

    this.isAlertTriggered = false;
    alertController.untriggerAlert(this.alert);

    this.isReset = true;
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
}
