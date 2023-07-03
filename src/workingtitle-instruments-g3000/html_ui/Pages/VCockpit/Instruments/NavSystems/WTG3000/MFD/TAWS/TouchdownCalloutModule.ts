import {
  AirportFacility, AuralAlertControlEvents, AuralAlertRegistrationManager, EventBus, FacilityLoader,
  GeoPointInterface, NearestAirportSubscription, OneWayRunway, RunwaySurfaceType, RunwayUtils, UnitType, UserSetting
} from '@microsoft/msfs-sdk';
import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, G3000AuralAlertIds, G3000AuralAlertUtils, TawsOperatingMode,
  TouchdownCalloutUserSettings
} from '@microsoft/msfs-wtg3000-common';
import { TawsData, TawsModule } from './TawsModule';

/**
 * An entry for a touchdown callout.
 */
type TouchdownCalloutEntry = {
  /** The altitude at which the callout is triggered if armed, in feet. */
  triggerAltitude: number;

  /** The altitude at which the callout is armed, in feet. */
  armAltitude: number;

  /** Whether the callout is armed. */
  isArmed: boolean;

  /** The user setting controlling whether the callout is enabled. */
  enabled: UserSetting<boolean>;

  /** The aural alert alias used by the callout. */
  alertAlias: string;

  /** The aural alert sound atom sequence used by the callout. */
  alertSequence: Record<AuralAlertVoiceSetting, string>;
};

/**
 * A TAWS module which handles touchdown callouts.
 */
export class TouchdownCalloutModule implements TawsModule {
  private static readonly NEAREST_AIRPORT_UPDATE_INTERVAL = 3000; // milliseconds
  private static readonly NEAREST_AIRPORT_RADIUS_METERS = UnitType.NMILE.convertTo(5, UnitType.METER);
  private static readonly NEAREST_AIRPORT_RADIUS_GAR = UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN);
  private static readonly RUNWAY_NO_WATER_MASK = ~(
    1 << RunwaySurfaceType.WaterFSX
    | 1 << RunwaySurfaceType.Lake
    | 1 << RunwaySurfaceType.Ocean
    | 1 << RunwaySurfaceType.Pond
    | 1 << RunwaySurfaceType.River
    | 1 << RunwaySurfaceType.WasteWater
    | 1 << RunwaySurfaceType.Water
  );

  private static readonly NEAREST_RUNWAY_REFRESH_INTERVAL = 3000; // milliseconds

  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly registrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly nearestSubscription: NearestAirportSubscription;
  private lastNearestSubscriptionUpdateTime: number | undefined = undefined;

  private readonly masterEnabledSetting: UserSetting<boolean>;
  private readonly auralAlertVoice = AuralAlertUserSettings.getManager(this.bus).voice;

  private readonly entries: TouchdownCalloutEntry[];

  private nearestAirport: AirportFacility | undefined = undefined;
  private nearestAirportRunways: OneWayRunway[] | undefined = undefined;
  private nearestRunwayAltitude: number | undefined = undefined;
  private lastNearestRunwayRefreshTime: number | undefined = undefined;

  private isReset = true;

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param facLoader The facility loader.
   */
  constructor(private readonly bus: EventBus, facLoader: FacilityLoader) {

    const settingManager = TouchdownCalloutUserSettings.getManager(bus);

    this.masterEnabledSetting = settingManager.getSetting('touchdownCalloutMasterEnabled');

    this.entries = Array.from([500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 40, 30, 20, 10] as const, altitude => {
      return {
        triggerAltitude: altitude,
        armAltitude: Math.max(altitude * 1.1, altitude + 10),
        isArmed: false,
        enabled: settingManager.getEnabledSetting(altitude),
        alertAlias: `${G3000AuralAlertIds.TouchdownCallout}-${altitude}`,
        alertSequence: {
          [AuralAlertVoiceSetting.Male]: `aural_${altitude}_m`,
          [AuralAlertVoiceSetting.Female]: `aural_${altitude}_f`,
        }
      };
    });

    this.nearestSubscription = new NearestAirportSubscription(facLoader);
    this.nearestSubscription.setExtendedFilters(TouchdownCalloutModule.RUNWAY_NO_WATER_MASK, ~0, ~0, 0);
    this.nearestSubscription.start();

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TouchdownCallout,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TouchdownCallout],
      sequence: 'aural_500_f',
      continuous: false,
      repeat: false,
      timeout: 3000
    });
  }

  /** @inheritdoc */
  public onInit(): void {
    // noop
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: TawsOperatingMode, data: Readonly<TawsData>, realTime: number): void {
    this.updateNearestAirportSubscription(realTime, data.gpsPos);

    if (operatingMode !== TawsOperatingMode.Normal || data.isOnGround) {
      this.reset();
      return;
    }

    if (data.isGpsPosValid) {
      // Refresh nearest airport
      const nearestAirport = this.nearestSubscription.tryGet(0);
      // Sometimes the nearest search retains airports that are outside the search radius, so we need to check the
      // distance to the airport ourselves.
      if (nearestAirport && data.gpsPos.distance(nearestAirport) <= TouchdownCalloutModule.NEAREST_AIRPORT_RADIUS_GAR) {
        this.updateNearestRunway(realTime, nearestAirport, data);
      } else {
        this.nearestAirport = undefined;
        this.nearestAirportRunways = undefined;
        this.nearestRunwayAltitude = undefined;
      }
    }

    if (data.isGpsPosValid && this.nearestRunwayAltitude !== undefined) {
      this.updateCallouts(data.gpsAltitude - this.nearestRunwayAltitude, data);
    } else if (data.isRadarAltitudeValid) {
      this.updateCallouts(data.radarAltitude, data);
    }
  }

  /**
   * Updates this module's nearest airport subscription, if necessary.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @param position The current position of the airplane.
   */
  private updateNearestAirportSubscription(realTime: number, position: GeoPointInterface): void {
    if (
      this.lastNearestSubscriptionUpdateTime === undefined
      || realTime - this.lastNearestSubscriptionUpdateTime >= TouchdownCalloutModule.NEAREST_AIRPORT_UPDATE_INTERVAL
    ) {
      this.nearestSubscription.update(position.lat, position.lon, TouchdownCalloutModule.NEAREST_AIRPORT_RADIUS_METERS, 1);
      this.lastNearestSubscriptionUpdateTime = realTime;
    }
  }

  /**
   * Updates the nearest runway to the airplane.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @param nearestAirport The nearest airport to the airplane.
   * @param data The current TAWS data.
   */
  private updateNearestRunway(realTime: number, nearestAirport: AirportFacility, data: Readonly<TawsData>): void {
    if (nearestAirport.icao !== this.nearestAirport?.icao) {
      this.nearestAirport = nearestAirport;
      this.nearestAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(nearestAirport);
      this.lastNearestRunwayRefreshTime = undefined;
    }

    if (this.lastNearestRunwayRefreshTime === undefined || realTime - this.lastNearestRunwayRefreshTime >= TouchdownCalloutModule.NEAREST_RUNWAY_REFRESH_INTERVAL) {
      this.nearestRunwayAltitude = undefined;

      this.lastNearestRunwayRefreshTime = realTime;

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
    }
  }

  /**
   * Updates the state of all callout alerts.
   * @param altitudeAbove The current altitude, in feet, of the airplane above the reference (either the nearest runway
   * threshold or the ground).
   * @param data The current TAWS data.
   */
  private updateCallouts(altitudeAbove: number, data: Readonly<TawsData>): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];

      if (entry.isArmed) {
        if (altitudeAbove <= entry.triggerAltitude) {
          if (this.masterEnabledSetting.value && entry.enabled.value && (entry.triggerAltitude !== 500 || !data.isGsGpActive)) {
            this.publisher.pub('aural_alert_trigger', {
              uuid: G3000AuralAlertIds.TouchdownCallout,
              alias: entry.alertAlias,
              sequence: entry.alertSequence[this.auralAlertVoice.get()]
            }, true, false);
          }

          entry.isArmed = false;
        }
      } else if (altitudeAbove >= entry.armAltitude) {
        entry.isArmed = true;

        this.publisher.pub('aural_alert_untrigger', entry.alertAlias, true, false);
      }
    }
  }

  /**
   * Disarms all touchdown callout alerts.
   */
  private reset(): void {
    if (this.isReset) {
      return;
    }

    for (let i = 0; i < this.entries.length; i++) {
      this.entries[i].isArmed = false;
    }

    this.isReset = true;
  }

  /** @inheritdoc */
  public onDestroy(): void {
    this.registrationManager.destroy();
  }
}