import { EventBus } from '@microsoft/msfs-sdk';

import { AbstractTerrainSystem } from './AbstractTerrainSystem';
import { GarminTawsAlert, GarminTawsInhibit, GarminTawsStatus } from './GarminTawsTypes';
import { TerrainSystemDataProvider } from './TerrainSystemDataProvider';
import { TerrainSystemOperatingMode } from './TerrainSystemTypes';

/**
 * Configuration options for {@link GarminTaws}.
 */
export type GarminTawsOptions = {
  /** Whether to include support for the GPWS failure status flag. */
  supportGpwsFailStatus?: boolean;

  /** The duration of the system's self-test, in milliseconds. Defaults to 15000. */
  testDuration?: number;

  /**
   * A function that selects a prioritized alert from an iterable of active alerts each time the set of active alerts
   * changes. If not defined, then a default prioritization scheme based on TSO-151c will be used.
   */
  prioritizedAlertSelector?: (alerts: Iterable<string>) => string | null;
};

/**
 * A Garmin TAWS-A/B terrain alerting system.
 */
export class GarminTaws<ID extends string> extends AbstractTerrainSystem<ID> {
  private readonly supportGpwsFailStatus: boolean;
  private readonly testDuration: number;

  private testTimeRemaining = 0;

  private lastUpdateSimTime: number | undefined = undefined;

  /**
   * Creates a new instance of GarminTaws.
   * @param id This terrain system's ID.
   * @param type This terrain system's type.
   * @param bus The event bus.
   * @param dataProvider A provider of terrain system data.
   * @param options Options with which to configure the system.
   */
  public constructor(
    id: ID,
    type: string,
    bus: EventBus,
    dataProvider: TerrainSystemDataProvider,
    options?: Readonly<GarminTawsOptions>
  ) {
    super(id, type, bus, dataProvider, options?.prioritizedAlertSelector ?? GarminTaws.selectDefaultPrioritizedAlert);

    this.supportGpwsFailStatus = options?.supportGpwsFailStatus ?? false;
    this.testDuration = options?.testDuration ?? 15000;
  }

  /** @inheritDoc */
  protected onTurnOn(): void {
    if (this.operatingMode.get() !== TerrainSystemOperatingMode.Off) {
      return;
    }

    this.operatingMode.set(TerrainSystemOperatingMode.Operating);
  }

  /** @inheritDoc */
  protected onTurnOff(): void {
    this.operatingMode.set(TerrainSystemOperatingMode.Off);
  }

  /** @inheritDoc */
  protected onStartTest(): void {
    if (this.operatingMode.get() !== TerrainSystemOperatingMode.Operating) {
      return;
    }

    this.operatingMode.set(TerrainSystemOperatingMode.Test);
    this.testTimeRemaining = this.testDuration;
  }

  /** @inheritDoc */
  protected untriggerAlert(alert: string): void {
    super.untriggerAlert(alert);

    // Remove GS/GP inhibits if the corresponding alert was untriggered.
    if (alert === GarminTawsAlert.GsdGlideslopeCaution) {
      this.removeInhibit(GarminTawsInhibit.GsdGlideslope);
    }
    if (alert === GarminTawsAlert.GsdGlidepathCaution) {
      this.removeInhibit(GarminTawsInhibit.GsdGlidepath);
    }
  }

  /** @inheritDoc */
  protected onUpdate(): void {
    const operatingMode = this.operatingMode.get();
    const data = this.dataProvider.data;

    if (operatingMode !== TerrainSystemOperatingMode.Off) {
      this.statuses.toggle(GarminTawsStatus.TawsNotAvailable, !data.isGpsPosValid);

      if (this.supportGpwsFailStatus) {
        this.statuses.toggle(GarminTawsStatus.GpwsFailed, !data.isRadarAltitudeValid || (!data.isBaroAltitudeValid && !data.isGpsPosValid));
      }

      if (operatingMode === TerrainSystemOperatingMode.Test) {
        if (
          !this.statuses.has(GarminTawsStatus.TawsFailed)
          && !this.statuses.has(GarminTawsStatus.TawsNotAvailable)
          && !this.statuses.has(GarminTawsStatus.GpwsFailed)
        ) {
          this.testTimeRemaining -= this.lastUpdateSimTime === undefined ? 0 : Math.max(0, data.simTime - this.lastUpdateSimTime);
        }

        if (this.testTimeRemaining <= 0) {
          this.operatingMode.set(TerrainSystemOperatingMode.Operating);
        }
      }
    }

    this.updateModules();

    this.lastUpdateSimTime = data.simTime;
  }

  private static readonly DEFAULT_ALERT_PRIORITIES: Partial<Record<string, number>> = {
    [GarminTawsAlert.EdrWarning]: 13,
    [GarminTawsAlert.EcrWarning]: 12,
    [GarminTawsAlert.RtcWarning]: 11,
    [GarminTawsAlert.ItiWarning]: 10,
    [GarminTawsAlert.RocWarning]: 10,
    [GarminTawsAlert.IoiWarning]: 10,
    [GarminTawsAlert.RtcCaution]: 9,
    [GarminTawsAlert.ItiCaution]: 8,
    [GarminTawsAlert.RocCaution]: 8,
    [GarminTawsAlert.IoiCaution]: 8,
    [GarminTawsAlert.EcrCaution]: 7,
    [GarminTawsAlert.FitTerrainCaution]: 6,
    [GarminTawsAlert.FitTakeoffCaution]: 6,
    [GarminTawsAlert.PdaCaution]: 5,
    [GarminTawsAlert.FitGearCaution]: 4,
    [GarminTawsAlert.FitFlapsCaution]: 3,
    [GarminTawsAlert.EdrCaution]: 2,
    [GarminTawsAlert.NcrCaution]: 1,
    [GarminTawsAlert.GsdGlideslopeCaution]: 0,
    [GarminTawsAlert.GsdGlidepathCaution]: 0
  };

  /**
   * Selects a prioritized alert from an iterable of active alerts based on the criteria published in TSO-151c.
   * @param alerts An iterable of active alerts.
   * @returns The prioritized alert from the specified set of active alerts, or `null` if a prioritized alert could not
   * be selected.
   */
  private static selectDefaultPrioritizedAlert(alerts: Iterable<string>): string | null {
    let bestPriority = -1;
    let bestAlert: string | null = null;

    for (const alert of alerts) {
      const priority = GarminTaws.DEFAULT_ALERT_PRIORITIES[alert] ?? -1;
      if (priority > bestPriority) {
        bestPriority = priority;
        bestAlert = alert;
      }
    }

    return bestAlert;
  }
}