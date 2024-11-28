import { AirportFacility, OneWayRunway, RunwayUtils, UnitType } from '@microsoft/msfs-sdk';

import { TerrainSystemModule } from '../../TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from '../../TerrainSystemTypes';
import { GarminVoiceCalloutAlert } from './GarminVoiceCalloutTypes';
import { GarminTawsAlert } from '../../GarminTawsTypes';

/**
 * Configuration options for {@link GarminVoiceCalloutModule}.
 */
export type GarminVoiceCalloutModuleOptions = {
  /** Whether to inhibit the 500-feet callout when the autopilot's GS or GP mode is active. Defaults to `false`. */
  inhibit500WhenGsGpActive?: boolean;

  /** The interval at which the module's nearest runway data should be updated, in milliseconds. Defaults to 3000. */
  nearestRunwayUpdateInterval?: number;
};

/**
 * An entry for a touchdown voice callout.
 */
type VoiceCalloutEntry = {
  /** The altitude at which the callout is activated if armed, in feet. */
  activateAltitude: number;

  /** The altitude at which the callout is armed, in feet. */
  armAltitude: number;

  /** Whether the callout is armed. */
  isArmed: boolean;

  /** Whether the callout has been activated. */
  isActivated: boolean;

  /** The alert associated with the callout. */
  alert: GarminVoiceCalloutAlert;
};

/**
 * A Garmin terrain alerting system module that handles touchdown voice callouts.
 */
export class GarminVoiceCalloutModule implements TerrainSystemModule {
  private readonly entries: VoiceCalloutEntry[];

  private readonly nearestRunwayRefreshInterval: number;
  private nearestAirport: AirportFacility | undefined = undefined;
  private nearestAirportRunways: OneWayRunway[] | undefined = undefined;
  private nearestRunwayAltitude: number | undefined = undefined;
  private lastNearestRunwayRefreshTime: number | undefined = undefined;

  private readonly inhibit500WhenGsGpActive: boolean;

  private isReset = true;

  /**
   * Creates a new instance of GarminVoiceCalloutModule.
   * @param options Options with which to configure the module.
   */
  public constructor(
    options?: Readonly<GarminVoiceCalloutModuleOptions>
  ) {
    this.inhibit500WhenGsGpActive = options?.inhibit500WhenGsGpActive ?? false;
    this.nearestRunwayRefreshInterval = options?.nearestRunwayUpdateInterval ?? 3000;

    this.entries = Array.from([500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 40, 30, 20, 10] as const, altitude => {
      return {
        activateAltitude: altitude,
        armAltitude: Math.max(altitude * 1.1, altitude + 10),
        isArmed: false,
        isActivated: false,
        alert: GarminTawsAlert[`Vco${altitude}`]
      };
    });
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
    if (operatingMode !== TerrainSystemOperatingMode.Operating || data.isOnGround) {
      this.reset(alertController);
      return;
    }

    this.isReset = false;

    if (data.isGpsPosValid) {
      if (data.nearestAirport) {
        this.updateNearestRunway(data.nearestAirport, data);
      } else {
        this.nearestAirport = undefined;
        this.nearestAirportRunways = undefined;
        this.nearestRunwayAltitude = undefined;
      }
    }

    if (data.isGpsPosValid && this.nearestRunwayAltitude !== undefined) {
      this.updateCallouts(data.gpsAltitude - this.nearestRunwayAltitude, data.isGsGpActive, alertController);
    } else if (data.isRadarAltitudeValid) {
      this.updateCallouts(data.radarAltitude, data.isGsGpActive, alertController);
    }
  }

  /**
   * Updates the nearest runway to the airplane.
   * @param nearestAirport The nearest airport to the airplane.
   * @param data The current terrain system data.
   */
  private updateNearestRunway(nearestAirport: AirportFacility, data: TerrainSystemData): void {
    if (nearestAirport.icao !== this.nearestAirport?.icao) {
      this.nearestAirport = nearestAirport;
      this.nearestAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(nearestAirport);
      this.lastNearestRunwayRefreshTime = undefined;
    }

    if (this.lastNearestRunwayRefreshTime === undefined || data.realTime - this.lastNearestRunwayRefreshTime >= this.nearestRunwayRefreshInterval) {
      this.nearestRunwayAltitude = undefined;

      this.lastNearestRunwayRefreshTime = data.realTime;

      let nearestDistance = Infinity;
      let nearestRunway: OneWayRunway | undefined = undefined;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runways = this.nearestAirportRunways!;
      for (let i = 0; i < runways.length; i++) {
        const runway = runways[i];
        const distance = data.gpsPos.distance(runway.latitude, runway.longitude);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestRunway = runway;
        }
      }

      if (nearestRunway) {
        this.nearestRunwayAltitude = UnitType.METER.convertTo(nearestRunway.elevation, UnitType.FOOT);
      }
    } else if (data.realTime < this.lastNearestRunwayRefreshTime) {
      this.lastNearestRunwayRefreshTime = data.realTime;
    }
  }

  /**
   * Updates the state of all callout alerts.
   * @param altitudeAbove The current altitude, in feet, of the airplane above the reference (either the nearest runway
   * threshold or the ground).
   * @param isGsGpActive Whether the autopilot's GS or GP mode is active.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private updateCallouts(altitudeAbove: number, isGsGpActive: boolean, alertController: TerrainSystemAlertController): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];

      if (entry.isArmed) {
        if (altitudeAbove <= entry.activateAltitude) {
          entry.isArmed = false;

          if (entry.activateAltitude !== 500 || !this.inhibit500WhenGsGpActive || !isGsGpActive) {
            entry.isActivated = true;
            alertController.triggerAlert(entry.alert);
          }
        }
      } else if (altitudeAbove >= entry.armAltitude) {
        entry.isArmed = true;

        if (entry.isActivated) {
          entry.isActivated = false;
          alertController.untriggerAlert(entry.alert);
        }
      }
    }
  }

  /**
   * Disarms and deactivates all touchdown callout alerts.
   * @param alertController A controller for alerts tracked by this module's parent system.
   */
  private reset(alertController: TerrainSystemAlertController): void {
    if (this.isReset) {
      return;
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      entry.isArmed = false;
      if (entry.isActivated) {
        entry.isActivated = false;
        alertController.untriggerAlert(entry.alert);
      }
    }

    this.isReset = true;
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }
}
