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

  /** The inhibit flags that should inhibit alerting. If not defined, then no flags will inhibit alerting. */
  inhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles negative climb rate after takeoff (NCR) alerts.
 */
export class GarminNegativeClimbRateModule implements TerrainSystemModule {
  private static readonly MAX_DISTANCE_FROM_AIRPORT = UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN);

  private readonly functionAsGpws: boolean;

  private readonly inhibitFlags: string[];

  private isReset = true;

  private altitudeLossReference: number | undefined = undefined;

  private isAltitudeLossAlertActive = false;
  private isSinkRateAlertActive = false;

  /**
   * Creates a new instance of GarminNegativeClimbRateModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminNegativeClimbRateModuleOptions>) {
    this.functionAsGpws = options?.functionAsGpws ?? false;
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

    if (
      !data.departureAirport
      || !data.departureRunway
      || !data.isHeadingValid
      || MathUtils.diffAngleDeg(data.departureRunway.course, data.headingTrue, false) > 110
      || data.gpsPos.distance(data.departureAirport) > GarminNegativeClimbRateModule.MAX_DISTANCE_FROM_AIRPORT
    ) {
      this.reset(alertController);
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

        this.updateAlerts(data.radarAltitude, altitude, verticalSpeed, alertController);
      } else {
        this.reset(alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        const agl = data.gpsAltitude - UnitType.METER.convertTo(data.departureRunway.elevationEnd, UnitType.FOOT);
        this.updateAlerts(agl, data.gpsAltitude, data.gpsVerticalSpeed, alertController);
      } else {
        this.reset(alertController);
      }
    }
  }

  /**
   * Updates whether to issue a negative climb rate after takeoff alert.
   * @param agl The airplane's current height above ground level, in feet.
   * @param altitude The airplane's current altitude, in feet.
   * @param verticalSpeed The airplane's current vertical speed, in feet per minute.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(agl: number, altitude: number, verticalSpeed: number, alertController: TerrainSystemAlertController): void {
    if (agl > 700) {
      this.reset(alertController);
      return;
    }

    let altitudeLoss = 0;

    if (this.altitudeLossReference === undefined || altitude > this.altitudeLossReference) {
      this.altitudeLossReference = altitude;
    } else {
      altitudeLoss = this.altitudeLossReference - altitude;
    }

    // Set up hysteresis offsets.
    const altitudeLossThresholdOffset = this.isAltitudeLossAlertActive ? -5 : 0;
    const sinkRateThresholdOffset = this.isSinkRateAlertActive ? -50 : 0;

    const isAltitudeLossAlertActive = GarminNegativeClimbRateModule.isAltitudeLoss(agl, altitudeLoss, altitudeLossThresholdOffset);
    const isSinkRateAlertActive = GarminNegativeClimbRateModule.isSinkRate(agl, -verticalSpeed, sinkRateThresholdOffset);
    const isAlertActive = isAltitudeLossAlertActive || isSinkRateAlertActive;

    if (isAlertActive !== (this.isAltitudeLossAlertActive || this.isSinkRateAlertActive)) {
      isAlertActive
        ? alertController.activateAlert(GarminTawsAlert.NcrCaution)
        : alertController.deactivateAlert(GarminTawsAlert.NcrCaution);
    }

    this.isAltitudeLossAlertActive = isAltitudeLossAlertActive;
    this.isSinkRateAlertActive = isSinkRateAlertActive;
  }

  /**
   * Deactivates all negative climb rate after takeoff alerts.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    this.altitudeLossReference = undefined;
    this.isAltitudeLossAlertActive = false;
    this.isSinkRateAlertActive = false;
    alertController.deactivateAlert(GarminTawsAlert.NcrCaution);

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
   * @param thresholdOffset An offset to apply to the altitude loss threshold for alerting, in feet.
   * @returns Whether the specified descent rate meets the threshold for an altitude loss alert.
   */
  private static isAltitudeLoss(agl: number, altitudeLoss: number, thresholdOffset: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 700) {
      threshold = MathUtils.lerp(agl, 50, 700, 10, 70);
    } else {
      threshold = Infinity;
    }

    return altitudeLoss >= threshold + thresholdOffset;
  }

  /**
   * Checks whether a descent rate meets the threshold for a sink rate alert for a given height above ground level.
   * @param agl The height above ground level, in feet.
   * @param descentRate The descent rate, in feet per minute.
   * @param thresholdOffset An offset to apply to the descent rate threshold for alerting, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for a sink rate alert.
   */
  private static isSinkRate(agl: number, descentRate: number, thresholdOffset: number): boolean {
    let threshold: number;

    if (agl <= 50) {
      threshold = Infinity;
    } else if (agl <= 700) {
      threshold = MathUtils.lerp(agl, 50, 700, 66.66666666666666, 500);
    } else {
      threshold = Infinity;
    }

    return descentRate >= threshold + thresholdOffset;
  }
}
