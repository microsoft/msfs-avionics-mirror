import { MathUtils, UnitType } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';

/**
 * Configuration options for {@link GarminPrematureDescentModule}.
 */
export type GarminPrematureDescentModuleOptions = {
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
 * A Garmin terrain alerting system module that handles premature descent (PDA) alerts.
 */
export class GarminPrematureDescentModule implements TerrainSystemModule {
  private static readonly MAX_DISTANCE_FROM_RUNWAY = UnitType.NMILE.convertTo(15, UnitType.GA_RADIAN);
  private static readonly MIN_DISTANCE_FROM_RUNWAY = UnitType.NMILE.convertTo(0.5, UnitType.GA_RADIAN);

  private readonly triggerDebounce: number;
  private readonly untriggerDebounce: number;

  private readonly triggerHysteresis: number;
  private readonly untriggerHysteresis: number;

  private readonly inhibitFlags: string[];

  private isReset = true;
  private isInhibited = false;

  private isAlertTriggered = false;

  private triggerDebounceTimer = 0;
  private untriggerDebounceTimer = 0;

  private triggerHysteresisTimer = 0;
  private untriggerHysteresisTimer = 0;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminPrematureDescentModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminPrematureDescentModuleOptions>) {
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
      || statuses.has(GarminTawsStatus.TawsFailed)
      || statuses.has(GarminTawsStatus.TawsNotAvailable)
      || data.isOnGround
    ) {
      this.reset(dt, alertController);
      return;
    }

    let distanceToRunway: number;

    if (
      !data.destinationRunway
      || !data.isHeadingValid
      || (distanceToRunway = data.gpsPos.distance(data.destinationRunway.latitude, data.destinationRunway.longitude)) > GarminPrematureDescentModule.MAX_DISTANCE_FROM_RUNWAY
      || distanceToRunway <= GarminPrematureDescentModule.MIN_DISTANCE_FROM_RUNWAY
    ) {
      this.reset(dt, alertController);
      return;
    }

    if (data.isGpsPosValid) {
      this.isReset = false;
      const agl = data.gpsAltitude - UnitType.METER.convertTo(data.destinationRunway.elevation, UnitType.FOOT);
      this.updateAlerts(dt, UnitType.GA_RADIAN.convertTo(distanceToRunway, UnitType.NMILE), agl, alertController);
    } else {
      this.reset(dt, alertController);
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
        alertController.inhibitAlert(GarminTawsAlert.PdaCaution);
      } else {
        alertController.uninhibitAlert(GarminTawsAlert.PdaCaution);
      }
    }
  }

  /**
   * Updates whether to issue a premature descent alert.
   * @param dt The amount of simulation time elapsed since the last update, in milliseconds.
   * @param distanceToRunway The airplane's current distance from the destination runway, in nautical miles.
   * @param agl The airplane's current height above destination, in feet.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(dt: number, distanceToRunway: number, agl: number, alertController: TerrainSystemAlertController): void {
    const isAlertTriggered = this.resolveAlertTriggerState(dt, GarminPrematureDescentModule.isAlert(distanceToRunway, agl));

    if (isAlertTriggered !== this.isAlertTriggered) {
      this.triggerDebounceTimer = 0;
      this.untriggerDebounceTimer = 0;
      this.triggerHysteresisTimer = this.triggerHysteresis;
      this.untriggerHysteresisTimer = this.untriggerHysteresis;

      isAlertTriggered
        ? alertController.triggerAlert(GarminTawsAlert.PdaCaution)
        : alertController.untriggerAlert(GarminTawsAlert.PdaCaution);

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
   * Deactivates all premature descent alerts.
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

    this.isAlertTriggered = false;
    alertController.untriggerAlert(GarminTawsAlert.PdaCaution);

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }

  /**
   * Checks whether a height above destination meets the threshold for a premature descent alert for a given distance
   * to the destination runway.
   * @param distanceToRunway The distance to the destination runway, in nautical miles.
   * @param agl The height above destination, in feet.
   * @returns Whether the specified height above destination meets the threshold for a premature descent alert.
   */
  private static isAlert(distanceToRunway: number, agl: number): boolean {
    let threshold: number;

    if (distanceToRunway <= 0.5) {
      threshold = -Infinity;
    } else if (distanceToRunway <= 5) {
      threshold = Math.sqrt(27222.22222222222 * (distanceToRunway - 0.5));
    } else if (distanceToRunway <= 15) {
      threshold = 700 - Math.pow(4287500 * (15 - distanceToRunway), 1 / 3);
    } else {
      threshold = -Infinity;
    }

    return agl <= Math.max(threshold, 0);
  }
}
