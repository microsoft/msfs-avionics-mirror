import {
  AdcEvents, AirportFacility, AnnunciationType, AvionicsSystemState, AvionicsSystemStateEvent, CasAlertDefinition, CasAlertTransporter, CasRegistrationManager,
  ClockEvents, ConsumerSubject, ConsumerValue, EventBus, FacilityLoader, GeoPoint, GeoPointInterface, GNSSEvents, MappedSubject, MultiExpSmoother,
  NearestAirportSubscription, ObjectSubject, OneWayRunway, RunwaySurfaceType, RunwayUtils, SimVarValueType, Subject, Subscribable, SubscribableUtils,
  Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApVerticalMode } from '../Instruments';
import { FmsPositionMode, FmsPositionSystemEvents } from '../Systems/FmsPositionSystem';
import { RASystemEvents } from '../Systems/RASystem';
import { GpwsControlEvents, GpwsEvents } from './GpwsEvents';
import { GpwsData, GpwsModule } from './GpwsModule';
import { GpwsOperatingMode } from './GpwsTypes';

/**
 * A GPWS system.
 */
export class Gpws {
  private static readonly STEEP_APPROACH_CAS_ANNUNCIATION: CasAlertDefinition = { uuid: 'taws-steep-appr-active', message: 'STEEP APR Active' };
  private static readonly TERR_INHIBIT_CAS_ANNUNCATION: CasAlertDefinition = { uuid: 'taws-terr-inhibit-active', message: 'TERR INHIB Active' };
  private static readonly GS_INHIBIT_CAS_ANNUNCATION: CasAlertDefinition = { uuid: 'taws-gs-inhibit-active', message: 'GS INHIB Active' };
  private static readonly FLAP_OVERRIDE_CAS_ANNUNCATION: CasAlertDefinition = { uuid: 'taws-flap-override-active', message: 'FLAP OVRD Active' };

  private static readonly NEAREST_AIRPORT_UPDATE_INTERVAL = 5000; // milliseconds
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

  private static readonly LOW_GO_AROUND_HEIGHT = 245;
  private static readonly LOW_GO_AROUND_APPROACH_VS = -400;
  private static readonly LOW_GO_AROUND_TAKEOFF_VS = 500;

  private static readonly NEAREST_RUNWAY_REFRESH_INTERVAL = 5000; // milliseconds

  private readonly publisher = this.bus.getPublisher<GpwsEvents>();
  private readonly casRegistrationManager = new CasRegistrationManager(this.bus);

  private readonly modules: GpwsModule[] = [];

  private readonly operatingMode = Subject.create(GpwsOperatingMode.Off);

  private readonly steepApproachModeActive = ConsumerSubject.create<boolean>(null, false);

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly simRate = ConsumerValue.create(null, 1);

  private readonly isOnGround = ConsumerValue.create(null, false);

  private readonly _hasGpsPos = Subject.create(false);
  private readonly gpsPos = new GeoPoint(0, 0);

  private readonly radarAltimeterState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly radarAltitudeSource = ConsumerValue.create(null, 0);
  private readonly radarAltitudeSmoother = new MultiExpSmoother(2000 / Math.LN2, 1000 / Math.LN2, undefined, null, null, null, 10000);

  private readonly verticalSpeedTakeoffSmoother = new MultiExpSmoother(5 / Math.LN2, undefined, undefined, null, null, null, 10000);

  private readonly data: GpwsData = {
    isOnGround: false,
    isTakeoff: false,
    isPosValid: false,
    gpsPos: this.gpsPos.readonly,
    geoAltitude: 0,
    geoVerticalSpeed: 0,
    isRadarAltitudeValid: false,
    radarAltitude: 0,
    isGsGpActive: false,
    nearestRunwayAltitude: null,
    isSteepApproachActive: false,
    inhibits: {
      flaps: false,
      glideslope: false,
      terrain: false,
    }
  };

  private readonly publishedData = ObjectSubject.create({
    gpws_operating_mode: GpwsOperatingMode.Off,
    gpws_is_pos_valid: false,
    gpws_geo_altitude: 0,
    gpws_geo_vertical_speed: 0,
    gpws_nearest_runway_altitude: null as number | null
  });

  private readonly _isPowered = Subject.create(true);
  private readonly operatingModeState = MappedSubject.create(this._isPowered);

  private readonly nearestSubscription: NearestAirportSubscription;
  private lastNearestSubscriptionUpdateTime: number | undefined = undefined;

  private nearestAirport: AirportFacility | undefined = undefined;
  private nearestAirportRunways: OneWayRunway[] | undefined = undefined;
  private lastNearestRunwayRefreshTime: number | undefined = undefined;

  private lastUpdateRealTime: number | undefined = undefined;

  private isAlive = true;
  private isInit = false;

  private fmsPosIndexSub?: Subscription;
  private fmsPosModeSub?: Subscription;
  private gpsPosSub?: Subscription;
  private inertialVsSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Creates a new instance of Gpws.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system from which to source data.
   * @param facLoader The facility loader.
   * @param apDataProvider The autopilot data provider.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>,
    facLoader: FacilityLoader,
    private readonly apDataProvider: AutopilotDataProvider
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    this.operatingModeState.pipe(this.operatingMode, ([isPowered]) => {
      if (isPowered) {
        return GpwsOperatingMode.Normal;
      } else {
        return GpwsOperatingMode.Off;
      }
    });

    this.nearestSubscription = new NearestAirportSubscription(facLoader);
    this.nearestSubscription.setExtendedFilters(Gpws.RUNWAY_NO_WATER_MASK, ~0, ~0, 0);
    this.nearestSubscription.start();

    this.operatingMode.sub(this.publishedData.set.bind(this.publishedData, 'gpws_operating_mode'), true);

    this.publishedData.sub(this.onPublishedDataChanged.bind(this), true);

    this.casRegistrationManager.register(Gpws.STEEP_APPROACH_CAS_ANNUNCIATION);
    this.casRegistrationManager.register(Gpws.TERR_INHIBIT_CAS_ANNUNCATION);
    this.casRegistrationManager.register(Gpws.GS_INHIBIT_CAS_ANNUNCATION);
    this.casRegistrationManager.register(Gpws.FLAP_OVERRIDE_CAS_ANNUNCATION);
  }

  /**
   * Adds a module to this system.
   * @param module The module to add.
   * @returns This system, after the module has been added.
   */
  public addModule(module: GpwsModule): this {
    this.modules.push(module);

    if (this.isInit) {
      module.onInit();
    }

    return this;
  }

  /**
   * Initializes this system. Once this system is initialized, it will begin collecting data and updating its modules.
   * @throws Error if this system has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('Gpws: cannot initialize a dead system');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & FmsPositionSystemEvents & RASystemEvents & AdcEvents & GNSSEvents & GpwsEvents & GpwsControlEvents>();

    this.simRate.setConsumer(sub.on('simRate'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.radarAltimeterState.setConsumer(sub.on('ra_state_1'));
    this.radarAltitudeSource.setConsumer(sub.on('ra_radio_alt_1'));

    this.steepApproachModeActive.setConsumer(sub.on('gpws_steep_approach_mode'));

    const updateFmsPosMode = (mode: FmsPositionMode): void => {
      this._hasGpsPos.set(mode !== FmsPositionMode.None && mode !== FmsPositionMode.DeadReckoning && mode !== FmsPositionMode.DeadReckoningExpired);
      this.data.isPosValid = this._hasGpsPos.get();
      this.publishedData.set('gpws_is_pos_valid', this.data.isPosValid);
    };

    const updateGpsPos = (lla: LatLongAlt): void => {
      this.gpsPos.set(lla.lat, lla.long);
      this.data.geoAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
      this.publishedData.set('gpws_geo_altitude', this.data.geoAltitude);
    };

    const updateVerticalSpeed = (vs: number): void => {
      this.data.geoVerticalSpeed = vs;
      this.publishedData.set('gpws_geo_vertical_speed', vs);
    };

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.fmsPosModeSub?.destroy();
      this.gpsPosSub?.destroy();
      this.inertialVsSub?.destroy();

      if (index <= 0) {
        this._hasGpsPos.set(false);
        this.data.isPosValid = false;
        this.publishedData.set('gpws_is_pos_valid', false);

        this.fmsPosIndexSub = undefined;
        this.gpsPosSub = undefined;
        this.inertialVsSub = undefined;
      } else {
        this.fmsPosModeSub = sub.on(`fms_pos_mode_${index}`).handle(updateFmsPosMode);
        this.gpsPosSub = sub.on(`fms_pos_gps-position_${index}`).handle(updateGpsPos);
        this.inertialVsSub = sub.on('inertial_vertical_speed').handle(updateVerticalSpeed);
      }
    }, true);

    this.radarAltimeterState.sub(state => {
      this.data.isRadarAltitudeValid = state !== undefined && (state.current === undefined || state.current === AvionicsSystemState.On);
    }, true);

    this.apDataProvider.verticalActive.sub(mode => {
      this.data.isGsGpActive = mode === Epic2ApVerticalMode.GlideSlope || mode === Epic2ApVerticalMode.VnavGlidePath;
    }, true);

    this.steepApproachModeActive.sub((v) => {
      this.data.isSteepApproachActive = v;
      SimVar.SetSimVarValue('L:WT_Epic2_GPWS_Steep_Approach_Mode', SimVarValueType.Bool, v);
    }, true);

    CasAlertTransporter.create(this.bus, { uuid: Gpws.STEEP_APPROACH_CAS_ANNUNCIATION.uuid, priority: AnnunciationType.Advisory }).bind(this.steepApproachModeActive, (x) => x);
    const terrInhibCas = CasAlertTransporter.create(this.bus, { uuid: Gpws.TERR_INHIBIT_CAS_ANNUNCATION.uuid, priority: AnnunciationType.Advisory });
    const gsInhibCas = CasAlertTransporter.create(this.bus, { uuid: Gpws.GS_INHIBIT_CAS_ANNUNCATION.uuid, priority: AnnunciationType.Advisory });
    const flapOvrdCas = CasAlertTransporter.create(this.bus, { uuid: Gpws.FLAP_OVERRIDE_CAS_ANNUNCATION.uuid, priority: AnnunciationType.Advisory });

    sub.on('terrain_inhibit_active').handle((v) => { this.data.inhibits.terrain = v; terrInhibCas.set(v); });
    sub.on('gs_inhibit_active').handle((v) => { this.data.inhibits.glideslope = v; gsInhibCas.set(v); });
    sub.on('flap_override_active').handle((v) => { this.data.inhibits.flaps = v; flapOvrdCas.set(v); });

    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onInit();
    }

    this.updateSub = sub.on('simTime').whenChanged().handle(this.update.bind(this));
  }

  /**
   * Checks if this system is powered.
   * @returns Whether this is system is powered.
   */
  public isPowered(): boolean {
    return this._isPowered.get();
  }

  /**
   * Sets whether this system is powered.
   * @param isPowered Whether this system is powered.
   */
  public setPowered(isPowered: boolean): void {
    this._isPowered.set(isPowered);
  }

  /**
   * Responds when a data value to be published changes.
   * @param data An object containing all published data values.
   * @param topic The topic to publish.
   * @param value The data value to publish.
   */
  private onPublishedDataChanged(data: any, topic: keyof GpwsEvents, value: any): void {
    this.publisher.pub(topic, value, true, true);
  }

  /**
   * Updates this system.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  private update(simTime: number): void {
    const realTime = Date.now();
    const simRate = this.simRate.get();
    const dt = Math.min(realTime - (this.lastUpdateRealTime ?? realTime), 1000) * simRate;

    this.data.isOnGround = this.isOnGround.get();
    this.data.radarAltitude = this.radarAltitudeSmoother.next(this.radarAltitudeSource.get(), dt);

    const operatingMode = this.operatingMode.get();

    this.updateTakeoffState(dt);
    this.updateNearestAirportSubscription(realTime, this.data.gpsPos);
    this.updateNearestAirport(realTime);

    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onUpdate(operatingMode, this.data, realTime, simTime, simRate);
    }

    this.lastUpdateRealTime = realTime;
  }

  /**
   * Updates the GPWS takeoff (or low go-around) state
   * @param dt The change in time since the last update
   */
  private updateTakeoffState(dt: number): void {
    const smoothedVs = this.verticalSpeedTakeoffSmoother.next(this.data.geoVerticalSpeed, dt / 1000);

    if (this.isOnGround.get() === true) {
      this.data.isTakeoff = true;
      return;
    }

    const radarAlt = this.data.radarAltitude;
    if (!this.data.isRadarAltitudeValid || radarAlt > 1500) {
      // If radar altitude is above 1500ft then we assume the aircraft to have left the takeoff region
      this.data.isTakeoff = false;
    } else if (
      this.data.isTakeoff === false && radarAlt < Gpws.LOW_GO_AROUND_HEIGHT &&
      smoothedVs < Gpws.LOW_GO_AROUND_APPROACH_VS && this.data.geoVerticalSpeed > Gpws.LOW_GO_AROUND_TAKEOFF_VS
    ) {
      // We also need to account for low go-arounds, we do this by comparing a smoothed vertical speed (with ~5s of delay)
      // against the current vertical speed
      this.data.isTakeoff = true;
    }
  }

  /**
   * Updates this system's nearest airport subscription, if necessary.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @param position The current position of the airplane.
   */
  private updateNearestAirportSubscription(realTime: number, position: GeoPointInterface): void {
    if (
      this.lastNearestSubscriptionUpdateTime === undefined
      || realTime - this.lastNearestSubscriptionUpdateTime >= Gpws.NEAREST_AIRPORT_UPDATE_INTERVAL
    ) {
      this.nearestSubscription.update(position.lat, position.lon, Gpws.NEAREST_AIRPORT_RADIUS_METERS, 1);
      this.lastNearestSubscriptionUpdateTime = realTime;
    }
  }

  /**
   * Updates the nearest airport (and if necessary, the nearest runway) to the airplane.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  private updateNearestAirport(realTime: number): void {
    if (this.data.isPosValid) {
      // Refresh nearest airport
      const nearestAirport = this.nearestSubscription.tryGet(0);
      // Sometimes the nearest search retains airports that are outside the search radius, so we need to check the
      // distance to the airport ourselves.
      if (nearestAirport && this.data.gpsPos.distance(nearestAirport) <= Gpws.NEAREST_AIRPORT_RADIUS_GAR) {
        this.updateNearestRunway(realTime, nearestAirport);
      } else {
        this.nearestAirport = undefined;
        this.nearestAirportRunways = undefined;
        this.data.nearestRunwayAltitude = null;
      }
    } else {
      this.data.nearestRunwayAltitude = null;
    }

    this.publishedData.set('gpws_nearest_runway_altitude', this.data.nearestRunwayAltitude);
  }

  /**
   * Updates the nearest runway to the airplane.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @param nearestAirport The nearest airport to the airplane.
   */
  private updateNearestRunway(realTime: number, nearestAirport: AirportFacility): void {
    if (nearestAirport.icao !== this.nearestAirport?.icao) {
      this.nearestAirport = nearestAirport;
      this.nearestAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(nearestAirport);
      this.lastNearestRunwayRefreshTime = undefined;
    }

    if (this.lastNearestRunwayRefreshTime === undefined || realTime - this.lastNearestRunwayRefreshTime >= Gpws.NEAREST_RUNWAY_REFRESH_INTERVAL) {
      this.lastNearestRunwayRefreshTime = realTime;

      let nearestDistance = Infinity;
      let nearestRunway: OneWayRunway | undefined = undefined;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runways = this.nearestAirportRunways!;
      for (let i = 0; i < runways.length; i++) {
        const runway = runways[i];
        const distance = this.data.gpsPos.distance(runway.latitude, runway.longitude);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestRunway = runway;
        }
      }

      if (nearestRunway) {
        this.data.nearestRunwayAltitude = UnitType.METER.convertTo(nearestRunway.elevation, UnitType.FOOT);
      } else {
        this.data.nearestRunwayAltitude = null;
      }
    }
  }

  /**
   * Destroys this system.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();

    this.radarAltimeterState.destroy();
    this.radarAltitudeSource.destroy();

    this.fmsPosIndexSub?.destroy();
    this.fmsPosModeSub?.destroy();
    this.gpsPosSub?.destroy();
    this.updateSub?.destroy();

    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onDestroy();
    }
  }
}
