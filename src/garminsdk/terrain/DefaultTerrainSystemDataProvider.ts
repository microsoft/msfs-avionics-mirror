import {
  AdcEvents, AirportFacility, APVerticalModes, AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents,
  ConsumerSubject, ConsumerValue, ControlSurfacesEvents, EventBus, FacilityType, GeoPoint, GeoPointInterface,
  GNSSEvents, ICAO, MathUtils, MultiExpSmoother, NavSourceType, NearestAirportSubscription, RunwaySurfaceType, Subscribable,
  SubscribableUtils, Subscription, UnitType, VNavEvents, VNavUtils
} from '@microsoft/msfs-sdk';

import { FmaData, FmaDataEvents } from '../autopilot/FmaData';
import { GlidepathServiceLevel } from '../autopilot/vnav/GarminVNavTypes';
import { Fms } from '../flightplan/Fms';
import { FmsUtils } from '../flightplan/FmsUtils';
import { NavReferenceIndicator } from '../navreference/indicator/NavReferenceIndicator';
import { AdcSystemEvents } from '../system/AdcSystem';
import { AhrsSystemEvents } from '../system/AhrsSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../system/FmsPositionSystem';
import { RadarAltimeterSystemEvents } from '../system/RadarAltimeterSystem';
import { TerrainSystemDataProvider } from './TerrainSystemDataProvider';
import { TerrainSystemData } from './TerrainSystemTypes';

/**
 * Parameters for exponential smoothers used by {@link DefaultTerrainSystemDataProvider}.
 */
export type DefaultTerrainSystemDataProviderSmootherParams = {
  /**
   * The smoothing time constant, in milliseconds. The larger the constant, the greater the smoothing effect. A value
   * less than or equal to 0 is equivalent to no smoothing.
   */
  tau?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated velocity of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated velocity. A value less than or equal to 0 is
   * equivalent to no smoothing. If not defined, then estimated velocity will not be used to calculate the final
   * smoothed value.
   */
  tauVelocity?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated acceleration of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated acceleration. A value less than or equal to 0
   * is equivalent to no smoothing. If this value or `tauVelocity` is not defined, then estimated acceleration will not
   * be used to calculate the final smoothed value.
   */
  tauAccel?: number;

  /**
   * The elapsed time threshold, in milliseconds, above which smoothing will not be applied to a new input value.
   * Defaults to 10000.
   */
  dtThreshold?: number;
};

/**
 * Configuration options for {@link DefaultTerrainSystemDataProvider}.
 */
export type DefaultTerrainSystemDataProviderOptions = {
  /** The index of the FMS geo-positioning system from which to source data. */
  fmsPosIndex: number | Subscribable<number>;

  /** The index of the radar altimeter from which to source data. */
  radarAltIndex: number | Subscribable<number>;

  /** The index of the ADC from which to source data. */
  adcIndex: number | Subscribable<number>;

  /** The index of the AHRS from which to source data. */
  ahrsIndex: number | Subscribable<number>;

  /**
   * Parameters for smoothing applied to GPS vertical speed. `tau` defaults to `1000 / Math.LN2`, `tauVelocity` and
   * `tauAccel` default to `undefined.
   */
  gpsVerticalSpeedSmootherParams?: Readonly<DefaultTerrainSystemDataProviderSmootherParams>;

  /**
   * Parameters for smoothing applied to GPS above ground height. `tau` defaults to `2000 / Math.LN2`, `tauVelocity`
   * defaults to `1000 / Math.LN2`, and `tauAccel` defaults to `undefined.
   */
  gpsAglSmootherParams?: Readonly<DefaultTerrainSystemDataProviderSmootherParams>;

  /**
   * Parameters for smoothing applied to radar altitude. `tau` defaults to `2000 / Math.LN2`, `tauVelocity` defaults to
   * `1000 / Math.LN2`, and `tauAccel` defaults to `undefined.
   */
  radarAltitudeSmootherParams?: Readonly<DefaultTerrainSystemDataProviderSmootherParams>;

  /** The interval at which the module's nearest airport data should be updated, in milliseconds. Defaults to 3000. */
  nearestAirportUpdateInterval?: number;
};

/**
 * A mutable version of `TerrainSystemData`.
 */
type MutableTerrainSystemData = TerrainSystemData & {
  /**
   * The positions of the airplane's gear, as `[nose, leftMain, rightMain]`. A value of `0` indicates fully retracted,
   * and a value of `1` indicates fully extended.
   */
  gearPosition: [number, number, number];

  /** The extension angles, in degrees, of the airplane's trailing edge flaps, as `[left, right]`. */
  flapsAngle: [number, number];
};

/**
 * A default provider of Garmin terrain alerting system data which sources data from FMS geo-positioning, radar
 * altimeter, ADC, and AHRS systems.
 */
export class DefaultTerrainSystemDataProvider implements TerrainSystemDataProvider {
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

  private readonly fmsPosIndex: Subscribable<number>;
  private readonly radarAltIndex: Subscribable<number>;
  private readonly adcIndex: Subscribable<number>;
  private readonly ahrsIndex: Subscribable<number>;

  private readonly simTime = ConsumerValue.create(null, 0);
  private readonly simRate = ConsumerValue.create(null, 1);

  private readonly isOnGround = ConsumerValue.create(null, false);

  private readonly gearPosition = [
    ConsumerValue.create(null, 0),
    ConsumerValue.create(null, 0),
    ConsumerValue.create(null, 0)
  ];

  private readonly flapsAngle = [
    ConsumerValue.create(null, 0),
    ConsumerValue.create(null, 0)
  ];

  private isFmsPosIndexValid = false;
  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None);
  private readonly gpsPosSource = ConsumerValue.create(null, new LatLongAlt(0, 0));
  private readonly gpsVerticalSpeedSource = ConsumerValue.create(null, 0);
  private readonly gpsGroundSpeed = ConsumerValue.create(null, 0);
  private readonly groundElevationSource = ConsumerValue.create(null, 0);
  private readonly gpsAglSource = ConsumerValue.create(null, 0);
  private readonly gpsPos = new GeoPoint(NaN, NaN);
  private readonly gpsVerticalSpeedSmoother: MultiExpSmoother;
  private readonly gpsAglSmoother: MultiExpSmoother;

  private isRadarAltIndexValid = false;
  private readonly radarAltimeterState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly radarAltitudeSource = ConsumerValue.create(null, 0);
  private readonly radarAltitudeSmoother: MultiExpSmoother;

  private isAdcIndexValid = false;
  private readonly isAltitudeDataValid = ConsumerValue.create(null, false);
  private readonly baroAltitude = ConsumerValue.create(null, 0);
  private readonly baroVerticalSpeed = ConsumerValue.create(null, 0);
  private readonly baroAglSmoother: MultiExpSmoother;

  private isAhrsIndexValid = false;
  private readonly isAttitudeDataValid = ConsumerValue.create(null, false);
  private readonly isHeadingDataValid = ConsumerValue.create(null, false);
  private readonly headingTrue = ConsumerValue.create(null, 0);

  private readonly fmaData = ConsumerValue.create<FmaData | undefined>(null, undefined);

  private readonly nearestSubscription: NearestAirportSubscription;
  private readonly nearestSubscriptionUpdateInterval: number;
  private lastNearestSubscriptionUpdateTime: number | undefined = undefined;

  private departureAirportIcao: string | null = null;
  private departureAirport: AirportFacility | null = null;

  private destinationAirportIcao: string | null = null;
  private destinationAirport: AirportFacility | null = null;

  private readonly approachDetails = ConsumerValue.create(null, FmsUtils.createEmptyApproachDetails());
  private readonly flightPhase = ConsumerValue.create(null, FmsUtils.createEmptyFlightPhase());

  private readonly gpServiceLevel = ConsumerValue.create(null, GlidepathServiceLevel.None);

  private readonly _data: MutableTerrainSystemData = {
    realTime: 0,
    simTime: 0,
    simRate: 0,
    isOnGround: false,
    gearPosition: [0, 0, 0],
    flapsAngle: [0, 0],
    isGpsPosValid: false,
    gpsPos: this.gpsPos.readonly,
    gpsAltitude: NaN,
    gpsVerticalSpeed: NaN,
    gpsGroundSpeed: NaN,
    groundElevation: NaN,
    gpsAgl: NaN,
    isRadarAltitudeValid: false,
    radarAltitude: NaN,
    isBaroAltitudeValid: false,
    baroAltitude: NaN,
    baroVerticalSpeed: NaN,
    baroAgl: NaN,
    isAttitudeValid: false,
    isHeadingValid: false,
    headingTrue: NaN,
    isGsGpActive: false,
    departureAirport: null,
    departureRunway: null,
    destinationAirport: null,
    destinationRunway: null,
    approachDetails: this.approachDetails.get(),
    flightPhase: this.flightPhase.get(),
    gpServiceLevel: GlidepathServiceLevel.None,
    gsGpDeviation: NaN,
    nearestAirport: null
  };
  /** @inheritDoc */
  public readonly data = this._data as Readonly<TerrainSystemData>;

  private lastUpdateRealTime: number | undefined = undefined;

  private isAlive = true;
  private isInit = false;

  private readonly subscriptions: Subscription[] = [
    this.simTime,
    this.simRate,
    this.isOnGround,
    ...this.gearPosition,
    ...this.flapsAngle,
    this.fmsPosMode,
    this.gpsPosSource,
    this.gpsVerticalSpeedSource,
    this.gpsGroundSpeed,
    this.groundElevationSource,
    this.gpsAglSource,
    this.radarAltimeterState,
    this.radarAltitudeSource,
    this.isAltitudeDataValid,
    this.baroAltitude,
    this.baroVerticalSpeed,
    this.fmaData,
    this.approachDetails,
    this.flightPhase,
    this.gpServiceLevel
  ];

  /**
   * Creates a new instance of DefaultTerrainSystemDataProvider.
   * @param bus The event bus.
   * @param fms The FMS instance.
   * @param activeNavReferenceIndicator The navigation reference indicator for the active navigation source.
   * @param options Options with which to configure the data provider.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    private readonly activeNavReferenceIndicator: NavReferenceIndicator<string>,
    options: Readonly<DefaultTerrainSystemDataProviderOptions>
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(options.fmsPosIndex, true);
    this.radarAltIndex = SubscribableUtils.toSubscribable(options.radarAltIndex, true);
    this.adcIndex = SubscribableUtils.toSubscribable(options.adcIndex, true);
    this.ahrsIndex = SubscribableUtils.toSubscribable(options.ahrsIndex, true);

    this.gpsVerticalSpeedSmoother = new MultiExpSmoother(
      options.gpsVerticalSpeedSmootherParams?.tau ?? 1000 / Math.LN2,
      options.gpsVerticalSpeedSmootherParams?.tauVelocity,
      options.gpsVerticalSpeedSmootherParams?.tauAccel,
      null, null, null,
      options.gpsVerticalSpeedSmootherParams?.dtThreshold ?? 10000
    );
    this.gpsAglSmoother = new MultiExpSmoother(
      options.gpsAglSmootherParams?.tau ?? 2000 / Math.LN2,
      options.gpsAglSmootherParams?.tauVelocity ?? 1000 / Math.LN2,
      options.gpsAglSmootherParams?.tauAccel,
      null, null, null,
      options.gpsAglSmootherParams?.dtThreshold ?? 10000
    );
    this.radarAltitudeSmoother = new MultiExpSmoother(
      options.radarAltitudeSmootherParams?.tau ?? 2000 / Math.LN2,
      options.radarAltitudeSmootherParams?.tauVelocity ?? 1000 / Math.LN2,
      options.radarAltitudeSmootherParams?.tauAccel,
      null, null, null,
      options.radarAltitudeSmootherParams?.dtThreshold ?? 10000
    );
    this.baroAglSmoother = new MultiExpSmoother(
      options.radarAltitudeSmootherParams?.tau ?? 2000 / Math.LN2,
      options.radarAltitudeSmootherParams?.tauVelocity ?? 1000 / Math.LN2,
      options.radarAltitudeSmootherParams?.tauAccel,
      null, null, null,
      options.radarAltitudeSmootherParams?.dtThreshold ?? 10000
    );

    this.nearestSubscriptionUpdateInterval = options?.nearestAirportUpdateInterval ?? 3000;
    this.nearestSubscription = new NearestAirportSubscription(this.fms.facLoader);
    this.nearestSubscription.setExtendedFilters(DefaultTerrainSystemDataProvider.RUNWAY_NO_WATER_MASK, ~0, ~0, 0);
    this.nearestSubscription.start();
  }

  /**
   * Initializes this system. Once this system is initialized, it will begin collecting data and updating its modules.
   * @throws Error if this data provider has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTerrainSystemDataProvider: cannot initialize a dead data provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<
      ClockEvents & AdcEvents & GNSSEvents & ControlSurfacesEvents & FmsPositionSystemEvents & RadarAltimeterSystemEvents
      & AdcSystemEvents & AhrsSystemEvents & FmaDataEvents & VNavEvents
    >();

    this.simTime.setConsumer(sub.on('simTime'));
    this.simRate.setConsumer(sub.on('simRate'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.gearPosition[0].setConsumer(sub.on('gear_position_0'));
    this.gearPosition[1].setConsumer(sub.on('gear_position_1'));
    this.gearPosition[2].setConsumer(sub.on('gear_position_2'));

    this.flapsAngle[0].setConsumer(sub.on('flaps_left_angle'));
    this.flapsAngle[1].setConsumer(sub.on('flaps_right_angle'));

    this.gpsVerticalSpeedSource.setConsumer(sub.on('inertial_vertical_speed'));
    this.groundElevationSource.setConsumer(sub.on('ground_altitude'));
    this.gpsAglSource.setConsumer(sub.on('above_ground_height'));

    this.fmaData.setConsumer(sub.on('fma_data'));

    this.subscriptions.push(
      this.fmsPosIndex.sub(index => {
        if (index <= 0) {
          this.isFmsPosIndexValid = false;
          this.fmsPosMode.setConsumer(null);
          this.gpsPosSource.setConsumer(null);
          this.gpsGroundSpeed.setConsumer(null);
        } else {
          this.isFmsPosIndexValid = true;
          this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
          this.gpsPosSource.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
          this.gpsGroundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
        }
      }, true),

      this.radarAltIndex.sub(index => {
        if (index <= 0) {
          this.isRadarAltIndexValid = false;
          this.radarAltimeterState.setConsumer(null);
          this.radarAltitudeSource.setConsumer(null);
        } else {
          this.isRadarAltIndexValid = true;
          this.radarAltimeterState.setConsumer(sub.on(`radaralt_state_${index}`));
          this.radarAltitudeSource.setConsumer(sub.on(`radaralt_radio_alt_${index}`));
        }
      }, true),

      this.adcIndex.sub(index => {
        if (index <= 0) {
          this.isAdcIndexValid = false;
          this.isAltitudeDataValid.setConsumer(null);
          this.baroAltitude.setConsumer(null);
          this.baroVerticalSpeed.setConsumer(null);
        } else {
          this.isAdcIndexValid = true;
          this.isAltitudeDataValid.setConsumer(sub.on(`adc_altitude_data_valid_${index}`));
          this.baroAltitude.setConsumer(sub.on(`adc_indicated_alt_${index}`));
          this.baroVerticalSpeed.setConsumer(sub.on(`adc_vertical_speed_${index}`));
        }
      }, true),

      this.ahrsIndex.sub(index => {
        if (index <= 0) {
          this.isAhrsIndexValid = false;
          this.isAttitudeDataValid.setConsumer(null);
          this.isHeadingDataValid.setConsumer(null);
          this.headingTrue.setConsumer(null);
        } else {
          this.isAhrsIndexValid = true;
          this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
          this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
          this.headingTrue.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
        }
      }, true)
    );

    this.radarAltimeterState.sub(state => {
      this._data.isRadarAltitudeValid = state !== undefined && (state.current === undefined || state.current === AvionicsSystemState.On);
    }, true);

    this.approachDetails.setConsumer(this.fms.onEvent('fms_approach_details'));
    this.flightPhase.setConsumer(this.fms.onEvent('fms_flight_phase'));

    this.gpServiceLevel.setConsumer(sub.on(`gp_service_level${VNavUtils.getEventBusTopicSuffix(this.fms.vnavIndex)}`));
  }

  /**
   * Updates this data provider.
   * @param realTime The current real (operating system) time, as a Javascript timestamp.
   * @throws Error if this data provider has been destroyed.
   */
  public update(realTime: number): void {
    if (!this.isAlive) {
      throw new Error('DefaultTerrainSystemDataProvider: cannot update a dead data provider');
    }

    if (!this.isInit) {
      return;
    }

    const simRate = this.simRate.get();
    const dt = this.lastUpdateRealTime === undefined
      ? 0
      : MathUtils.clamp(realTime - this.lastUpdateRealTime, 0, 1000) * simRate;

    this._data.realTime = realTime;
    this._data.simTime = this.simTime.get();
    this._data.simRate = simRate;

    this._data.isOnGround = this.isOnGround.get();

    this.updateControlSurfaces();
    this.updateGps(realTime, dt);
    this.updateRadarAltitude(dt);
    this.updateBaroAltitude(dt);
    this.updateAttitudeHeading();
    this.updateAutopilot();
    this.updateFlightPlan();
    this.updateGlideslopeGlidepath();

    this.lastUpdateRealTime = realTime;
  }

  /**
   * Updates this provider's airplane control surfaces data.
   */
  private updateControlSurfaces(): void {
    this._data.gearPosition[0] = this.gearPosition[0].get();
    this._data.gearPosition[1] = this.gearPosition[1].get();
    this._data.gearPosition[2] = this.gearPosition[2].get();

    this._data.flapsAngle[0] = this.flapsAngle[0].get();
    this._data.flapsAngle[1] = this.flapsAngle[1].get();
  }

  /**
   * Updates this provider's GPS data.
   * @param realTime The current real (operating system) time, as a Javascript timestamp.
   * @param dt The elapsed time, in milliseconds, since the last update.
   */
  private updateGps(realTime: number, dt: number): void {
    if (this.isFmsPosIndexValid) {
      const fmsPosMode = this.fmsPosMode.get();
      this._data.isGpsPosValid = fmsPosMode !== FmsPositionMode.None
        && fmsPosMode !== FmsPositionMode.DeadReckoning
        && fmsPosMode !== FmsPositionMode.DeadReckoningExpired;
    } else {
      this._data.isGpsPosValid = false;
    }

    if (this._data.isGpsPosValid) {
      const lla = this.gpsPosSource.get();
      this.gpsPos.set(lla.lat, lla.long);
      this._data.gpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
      this._data.gpsVerticalSpeed = this.gpsVerticalSpeedSmoother.next(this.gpsVerticalSpeedSource.get(), dt);
      this._data.gpsGroundSpeed = this.gpsGroundSpeed.get();
      this._data.groundElevation = this.groundElevationSource.get();
      this._data.gpsAgl = this.gpsAglSmoother.next(this._data.gpsAltitude - this._data.groundElevation, dt);

      this.updateNearestAirportSubscription(realTime, this._data.gpsPos);

      const nearestAirport = this.nearestSubscription.tryGet(0);
      // Sometimes the nearest search retains airports that are outside the search radius, so we need to check the
      // distance to the airport ourselves.
      if (nearestAirport && this._data.gpsPos.distance(nearestAirport) <= DefaultTerrainSystemDataProvider.NEAREST_AIRPORT_RADIUS_GAR) {
        this._data.nearestAirport = nearestAirport;
      } else {
        this._data.nearestAirport = null;
      }
    } else {
      this.gpsPos.set(NaN, NaN);
      this._data.gpsAltitude = NaN;
      this._data.gpsVerticalSpeed = NaN;
      this._data.groundElevation = NaN;
      this._data.gpsAgl = NaN;
      this._data.nearestAirport = null;
      this.gpsVerticalSpeedSmoother.reset();
      this.gpsAglSmoother.reset();
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
      || realTime - this.lastNearestSubscriptionUpdateTime >= this.nearestSubscriptionUpdateInterval
    ) {
      this.nearestSubscription.update(position.lat, position.lon, DefaultTerrainSystemDataProvider.NEAREST_AIRPORT_RADIUS_METERS, 1);
      this.lastNearestSubscriptionUpdateTime = realTime;
    } else if (realTime < this.lastNearestSubscriptionUpdateTime) {
      this.lastNearestSubscriptionUpdateTime = realTime;
    }
  }

  /**
   * Updates this provider's radar altimeter data.
   * @param dt dt The elapsed time, in milliseconds, since the last update.
   */
  private updateRadarAltitude(dt: number): void {
    if (this.isRadarAltIndexValid) {
      const radarAltState = this.radarAltimeterState.get();
      this._data.isRadarAltitudeValid = radarAltState !== undefined && (radarAltState.current === undefined || radarAltState.current === AvionicsSystemState.On);
    } else {
      this._data.isRadarAltitudeValid = false;
    }

    if (this._data.isRadarAltitudeValid) {
      this._data.radarAltitude = this.radarAltitudeSmoother.next(this.radarAltitudeSource.get(), dt);
    } else {
      this._data.radarAltitude = NaN;
      this.radarAltitudeSmoother.reset();
    }
  }

  /**
   * Updates this provider's barometric altitude data.
   * @param dt dt The elapsed time, in milliseconds, since the last update.
   */
  private updateBaroAltitude(dt: number): void {
    if (this.isAdcIndexValid) {
      this._data.isBaroAltitudeValid = this.isAltitudeDataValid.get();
    } else {
      this._data.isRadarAltitudeValid = false;
    }

    if (this._data.isBaroAltitudeValid) {
      this._data.baroVerticalSpeed = this.baroVerticalSpeed.get();
      this._data.baroAltitude = this.baroAltitude.get();

    } else {
      this._data.baroAltitude = NaN;
      this._data.baroVerticalSpeed = NaN;
    }

    if (!isNaN(this._data.baroAltitude) && !isNaN(this._data.groundElevation)) {
      this._data.baroAgl = this.baroAglSmoother.next(this._data.baroAltitude - this._data.groundElevation, dt);
    } else {
      this._data.baroAgl = NaN;
      this.baroAglSmoother.reset();
    }
  }

  /**
   * Updates this provider's attitude and heading data.
   */
  private updateAttitudeHeading(): void {
    if (this.isAhrsIndexValid) {
      this._data.isAttitudeValid = this.isAttitudeDataValid.get();
      this._data.isHeadingValid = this.isHeadingDataValid.get();
    } else {
      this._data.isAttitudeValid = false;
      this._data.isHeadingValid = false;
    }

    if (this._data.isHeadingValid) {
      this._data.headingTrue = this.headingTrue.get();
    } else {
      this._data.headingTrue = NaN;
    }
  }

  /**
   * Updates this provider's autopilot data.
   */
  private updateAutopilot(): void {
    const fmaData = this.fmaData.get();
    this._data.isGsGpActive = fmaData !== undefined && (fmaData.verticalActive === APVerticalModes.GS || fmaData.verticalActive === APVerticalModes.GP);
  }

  /**
   * Updates this provider's flight plan data.
   */
  private updateFlightPlan(): void {
    if (this.fms.hasPrimaryFlightPlan()) {
      const flightPlan = this.fms.getPrimaryFlightPlan();

      const departureAirportIcao = flightPlan.originAirport ?? null;
      if (departureAirportIcao !== this.departureAirportIcao) {
        this._data.departureAirport = null;
        this._data.departureRunway = null;

        this.departureAirportIcao = departureAirportIcao;
        departureAirportIcao !== null && this.retrieveDepartureAirport(departureAirportIcao);
      } else {
        this._data.departureAirport = this.departureAirport;

        if (this.departureAirport !== null) {
          this._data.departureRunway = flightPlan.procedureDetails.originRunway ?? null;
        } else {
          this._data.departureRunway = null;
        }
      }

      const destinationAirportIcao = flightPlan.destinationAirport ?? null;
      if (destinationAirportIcao !== this.destinationAirportIcao) {
        this._data.destinationAirport = null;
        this._data.destinationRunway = null;

        this.destinationAirportIcao = destinationAirportIcao;
        destinationAirportIcao !== null && this.retrieveDestinationAirport(destinationAirportIcao);
      } else {
        this._data.destinationAirport = this.destinationAirport;

        if (this.destinationAirport !== null) {
          this._data.destinationRunway = flightPlan.procedureDetails.destinationRunway ?? null;
        } else {
          this._data.destinationRunway = null;
        }
      }
    } else {
      this._data.departureAirport = null;
      this._data.departureRunway = null;
      this._data.destinationAirport = null;
      this._data.destinationRunway = null;
    }

    this._data.approachDetails = this.approachDetails.get();
    this._data.flightPhase = this.flightPhase.get();
  }

  /**
   * Retrieves a departure airport.
   * @param icao The ICAO of the airport to retrieve.
   */
  private async retrieveDepartureAirport(icao: string): Promise<void> {
    let airport: AirportFacility | null = null;

    try {
      airport = await this.fms.facLoader.getFacility(FacilityType.Airport, icao);
    } catch {
      // noop
    }

    if (icao === this.departureAirportIcao) {
      this.departureAirport = airport;
    }
  }

  /**
   * Retrieves a destination airport.
   * @param icao The ICAO of the airport to retrieve.
   */
  private async retrieveDestinationAirport(icao: string): Promise<void> {
    let airport: AirportFacility | null = null;

    try {
      airport = await this.fms.facLoader.getFacility(FacilityType.Airport, icao);
    } catch {
      // noop
    }

    if (icao === this.destinationAirportIcao) {
      this.destinationAirport = airport;
    }
  }

  /**
   * Updates this provider's glideslope/glidepath data.
   */
  private updateGlideslopeGlidepath(): void {
    this._data.gpServiceLevel = this.gpServiceLevel.get();

    let gsGpDeviation = this.activeNavReferenceIndicator.verticalDeviation.get();
    if (gsGpDeviation !== null) {
      if (this.flightPhase.get().isApproachActive) {
        const approachDetails = this.approachDetails.get();
        if (approachDetails.type === ApproachType.APPROACH_TYPE_ILS || approachDetails.type === ApproachType.APPROACH_TYPE_LDA) {
          if (
            this.activeNavReferenceIndicator.source.get()?.getType() !== NavSourceType.Nav
            || approachDetails.referenceFacility === null
            || this.activeNavReferenceIndicator.ident.get() !== ICAO.getIdent(approachDetails.referenceFacility.icao)
          ) {
            gsGpDeviation = null;
          }
        } else if (approachDetails.type === ApproachType.APPROACH_TYPE_RNAV) {
          if (this.activeNavReferenceIndicator.source.get()?.getType() !== NavSourceType.Gps) {
            gsGpDeviation = null;
          }
        }
      } else {
        gsGpDeviation = null;
      }
    }

    this._data.gsGpDeviation = gsGpDeviation ?? NaN;
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
