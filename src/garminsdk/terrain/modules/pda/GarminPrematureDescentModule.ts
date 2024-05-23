import { UnitType } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, GarminTawsStatus } from '../../GarminTawsTypes';
import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';

/**
 * Configuration options for {@link GarminPrematureDescentModule}.
 */
export type GarminPrematureDescentModuleOptions = {
  /** The inhibit flags that should inhibit alerting. If not defined, then no flags will inhibit alerting. */
  inhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles premature descent (PDA) alerts.
 */
export class GarminPrematureDescentModule implements TerrainSystemModule {
  private static readonly MAX_DISTANCE_FROM_RUNWAY = UnitType.NMILE.convertTo(15, UnitType.GA_RADIAN);
  private static readonly MIN_DISTANCE_FROM_RUNWAY = UnitType.NMILE.convertTo(0.5, UnitType.GA_RADIAN);

  private readonly inhibitFlags: string[];

  private isReset = true;

  private isAlertActive = false;

  /**
   * Creates a new instance of GarminPrematureDescentModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminPrematureDescentModuleOptions>) {
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
    if (
      operatingMode !== TerrainSystemOperatingMode.Operating
      || statuses.has(GarminTawsStatus.TawsFailed)
      || statuses.has(GarminTawsStatus.TawsNotAvailable)
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

    let distanceToRunway: number;

    if (
      !data.destinationRunway
      || !data.isHeadingValid
      || (distanceToRunway = data.gpsPos.distance(data.destinationRunway.latitude, data.destinationRunway.longitude)) > GarminPrematureDescentModule.MAX_DISTANCE_FROM_RUNWAY
      || distanceToRunway <= GarminPrematureDescentModule.MIN_DISTANCE_FROM_RUNWAY
    ) {
      this.reset(alertController);
      return;
    }

    if (data.isGpsPosValid) {
      this.isReset = false;
      const agl = data.gpsAltitude - UnitType.METER.convertTo(data.destinationRunway.elevation, UnitType.FOOT);
      this.updateAlerts(UnitType.GA_RADIAN.convertTo(distanceToRunway, UnitType.NMILE), agl, alertController);
    } else {
      this.reset(alertController);
    }
  }

  /**
   * Updates whether to issue a premature descent alert.
   * @param distanceToRunway The airplane's current distance from the destination runway, in nautical miles.
   * @param agl The airplane's current height above destination, in feet.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(distanceToRunway: number, agl: number, alertController: TerrainSystemAlertController): void {
    // Set up hysteresis offset.
    const thresholdOffset = this.isAlertActive ? -20 : 0;

    const isAlertActive = GarminPrematureDescentModule.isAlert(distanceToRunway, agl, thresholdOffset);

    if (isAlertActive !== this.isAlertActive) {
      isAlertActive
        ? alertController.activateAlert(GarminTawsAlert.PdaCaution)
        : alertController.deactivateAlert(GarminTawsAlert.PdaCaution);

      this.isAlertActive = isAlertActive;
    }
  }

  /**
   * Deactivates all premature descent alerts.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    this.isAlertActive = false;
    alertController.deactivateAlert(GarminTawsAlert.PdaCaution);

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
   * @param thresholdOffset An offset to apply to the height above destination threshold for alerting, in feet.
   * @returns Whether the specified height above destination meets the threshold for a premature descent alert.
   */
  private static isAlert(distanceToRunway: number, agl: number, thresholdOffset: number): boolean {
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

    return agl <= Math.max(threshold + thresholdOffset, 0);
  }
}
