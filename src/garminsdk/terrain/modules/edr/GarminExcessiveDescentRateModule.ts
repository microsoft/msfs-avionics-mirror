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

  /** The inhibit flags that should inhibit alerting. If not defined, then no flags will inhibit alerting. */
  inhibitFlags?: Iterable<string>;
};

/**
 * A Garmin terrain alerting system module that handles excessive descent rate (EDR) alerts.
 */
export class GarminExcessiveDescentRateModule implements TerrainSystemModule {

  private readonly functionAsGpws: boolean;

  private readonly inhibitFlags: string[];

  private isReset = true;

  private activeAlert: GarminExcessiveDescentRateAlert | null = null;

  /**
   * Creates a new instance of GarminExcessiveDescentRateModule.
   * @param options Options with which to configure the module.
   */
  public constructor(options?: Readonly<GarminExcessiveDescentRateModuleOptions>) {
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

    if (this.functionAsGpws) {
      if (data.isRadarAltitudeValid && (data.isGpsPosValid || data.isBaroAltitudeValid) && data.radarAltitude <= 2500) {
        this.isReset = false;
        this.updateAlerts(data.radarAltitude, data.isGpsPosValid ? data.gpsVerticalSpeed : data.baroVerticalSpeed, alertController);
      } else {
        this.reset(alertController);
      }
    } else {
      if (data.isGpsPosValid) {
        this.isReset = false;
        this.updateAlerts(data.gpsAgl, data.gpsVerticalSpeed, alertController);
      } else {
        this.reset(alertController);
      }
    }
  }

  /**
   * Updates whether to issue an excessive descent rate alert.
   * @param agl The airplane's current height above ground level, in feet.
   * @param verticalSpeed The airplane's current vertical speed, in feet per minute.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateAlerts(agl: number, verticalSpeed: number, alertController: TerrainSystemAlertController): void {
    // Set up hysteresis offsets.
    const warningThresholdOffset = this.activeAlert === GarminTawsAlert.EdrWarning ? -100 : 0;
    const cautionThresholdOffset = this.activeAlert === GarminTawsAlert.EdrCaution ? -100 : 0;

    let activeAlert: GarminExcessiveDescentRateAlert | null = null;
    if (GarminExcessiveDescentRateModule.isWarning(agl, -verticalSpeed, warningThresholdOffset)) {
      activeAlert = GarminTawsAlert.EdrWarning;
    } else if (GarminExcessiveDescentRateModule.isCaution(agl, -verticalSpeed, cautionThresholdOffset)) {
      activeAlert = GarminTawsAlert.EdrCaution;
    }

    if (activeAlert !== this.activeAlert) {
      activeAlert !== null && alertController.activateAlert(activeAlert);
      this.activeAlert !== null && alertController.deactivateAlert(this.activeAlert);

      this.activeAlert = activeAlert;
    }
  }

  /**
   * Deactivates all excessive descent rate alerts.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    this.activeAlert = null;
    alertController.deactivateAlert(GarminTawsAlert.EdrWarning);
    alertController.deactivateAlert(GarminTawsAlert.EdrCaution);

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
   * @param thresholdOffset An offset to apply to the descent rate threshold for alerting, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for an excessive descent rate warning alert.
   */
  private static isWarning(agl: number, descentRate: number, thresholdOffset: number): boolean {
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

    return descentRate >= threshold + thresholdOffset;
  }

  /**
   * Checks whether a descent rate meets the threshold for an excessive descent rate caution alert for a given height
   * above ground level.
   * @param agl The height above ground level, in feet.
   * @param descentRate The descent rate, in feet per minute.
   * @param thresholdOffset An offset to apply to the descent rate threshold for alerting, in feet per minute.
   * @returns Whether the specified descent rate meets the threshold for an excessive descent rate caution alert.
   */
  private static isCaution(agl: number, descentRate: number, thresholdOffset: number): boolean {
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

    return descentRate >= threshold + thresholdOffset;
  }
}
