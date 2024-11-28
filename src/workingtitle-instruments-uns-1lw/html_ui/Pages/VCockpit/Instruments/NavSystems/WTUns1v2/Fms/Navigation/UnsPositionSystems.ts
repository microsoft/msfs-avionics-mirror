import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ClockEvents, ConsumerSubject, EventBus, GeoPoint, GNSSEvents, GPSSatComputer,
  LatLongInterface, LatLonInterface, MathUtils, SBASGroupName, Subject, SystemPowerKey, UnitType, VorFacility
} from '@microsoft/msfs-sdk';

import { UnsNavigationSensors } from '../../Config/SensorsConfigBuilder';
import { UnsRadioNavaidManager } from './UnsRadioNavaidManager';

/**
 * FMS Position system modes
 */
export enum UnsPositionMode {
  /** No position data is available */
  NoSensor = 'NONE',

  /** Valid GPS, with more than 1 DME and DMEPOS variance less than 0.5nm */
  GpsDme = 'GPS/DME',

  /** Valid GPS */
  Gps = 'GPS',

  /** More than one DME station received, and DMEPOS variance less than 2.2nm */
  DmeDme = 'DME/DME',

  /** 1 DME and TACAN received, and DMEPOS variance less than 2.2nm */
  DmeTacan = 'DME/TAC',

  /** TACAN received and valid, with no other data above valid */
  Tacan = 'TAC',

  /** 1 DME and VOR received, and DPMEPOS variance less than 2.2nm */
  DmeVor = 'DME/VOR',

  /** Only 1 DME received, and DPMEPOS variance less than 2.2nm */
  Dme = 'DME',

  /** IRS inputs valid */
  Irs = 'IRS',

  /** TAS and HDG are only valid sensor inputs */
  DeadReckoning = 'DR',
}

/**
 * GPS system events
 */
interface UnsGpsEvents {
  /** State of the GPS system */
  [uns_gps_state_: `uns_gps_state_${number}`]: AvionicsSystemStateEvent;

  /** Active GPS system */
  uns_active_gps: number;

  /** Position of the GPS systems */
  [uns_gps_position_: `uns_gps_position_${number}`]: LatLongInterface;
}

/**
 * IRS system events
 */
interface UnsIrsEvents {
  /** State of the ADC system */
  [uns_irs_state_: `uns_irs_state_${number}`]: AvionicsSystemStateEvent;

  /** Position of the IRS systems */
  [uns_irs_position_: `uns_irs_position_${number}`]: LatLongInterface;
}

/**
 * Radio Navigation system events
 */
interface UnsRadNavEvents {
  /** State of the DME system */
  uns_dme_state: AvionicsSystemStateEvent;

  /** Actual navigation performance of the DME system */
  uns_dme_anp: number;

  /** State of the VOR system */
  uns_vor_state: AvionicsSystemStateEvent;

  /** Actual navigation performance of the VOR system */
  uns_vor_anp: number;
}

/**
 * Events fired by the UNS positioning system.
 */
export interface UnsPositionSystemEvents extends UnsGpsEvents, UnsIrsEvents, UnsRadNavEvents {
  /** State of the UNS positioning system */
  uns_position_state: AvionicsSystemStateEvent;

  /** The current positioning mode used by the geo-positioning system. */
  uns_position_mode: UnsPositionMode;

  /** Best computed position (sim gps position) */
  uns_position: LatLongInterface;

  /** Overall actual navigation performance */
  uns_anp: number;

  /** State of the ADC system */
  uns_adc_state: AvionicsSystemStateEvent;
}



/**
 * Linear interpolation
 * @param a a
 * @param b b
 * @param alpha alpha
 * @returns Interpolated number
 */
function lerp(a: number, b: number, alpha: number): number {
  return a + alpha * (b - a);
}

/**
 * Gets a random number between -1 and 1 as math.random returns from 0 to 1
 * @returns Random number
 */
function getRandomNegative(): number {
  return Math.random() * 2 - 1;
}

/**
 * Simulation of an IRS nav system
 */
class IrsNavSystem extends BasicAvionicsSystem<UnsIrsEvents> {
  /**
   * Average drift rate of the IRS, in NM/sec
   * Sourced from https://www.icao.int/WACAF/Documents/Meetings/2014/OPS-Approval/14%20October%202014/01%20-%20Introduction%20to%20RNAV.pdf
   */
  static IRS_DRIFT_RATE = 2 / 60 / 60;
  static IRS_DRIFT_SPEED_MULTIPLIER = 0.25; // Drift multiplier for each 100 knots of speed
  static IRS_DRIFT_MULTIPLIER_EQUATOR = 0.3;
  static IRS_DRIFT_MULTIPLIER_POLE = 2;

  position: Subject<GeoPoint>;
  private driftAmount = new GeoPoint(0, 0);
  lastPositionTime: number;

  /**
   * Constructs the IRS nav sensor
   * @param index Index of the sensor
   * @param bus Event bus
   * @param gpsPos Current GPS position used to initialize the IRS
   * @param initializationTime Timestamp at which the IRS nav sensor is constructed
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(index: number, bus: EventBus, gpsPos: GeoPoint, initializationTime: number, powerSource?: SystemPowerKey | CompositeLogicXMLElement) {
    super(index, bus, `uns_irs_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.lastPositionTime = initializationTime;
    this.position = Subject.create(gpsPos);
  }

  /**
   * Determines the drift of the IRS since the last call
   *
   * @param deltaTime Time since last call
   * @param distanceChange Change in distance
   * @returns Distance drifted by the IRS sensor
   */
  private getDrift(deltaTime: number, distanceChange: number): number {
    const currentPosition = this.position.get();
    const driftRateMultiplier = IrsNavSystem.IRS_DRIFT_MULTIPLIER_EQUATOR + Math.sin(Math.abs(currentPosition.lat)) * IrsNavSystem.IRS_DRIFT_MULTIPLIER_POLE;
    const speedMultiplier = (IrsNavSystem.IRS_DRIFT_SPEED_MULTIPLIER * 1_000_000 * distanceChange);
    const drift = Math.abs(IrsNavSystem.IRS_DRIFT_RATE * driftRateMultiplier * deltaTime * speedMultiplier);

    return drift;
  }

  /**
   * Calculates the IRS position
   * @param actualPosition Actual aircraft position
   * @param distanceChange Distance travelled since last call in nautical miles
   * @param heading Heading of aircraft
   * @param simTime Current sim time
   */
  public calculatePosition(actualPosition: LatLonInterface, distanceChange: number, heading: number, simTime: number): void {
    if (this.state === AvionicsSystemState.On || this.state === undefined) {
      const deltaTime = UnitType.SECOND.convertFrom(MathUtils.clamp(simTime - this.lastPositionTime, 0, 200), UnitType.MILLISECOND);
      const drift = UnitType.GA_RADIAN.convertFrom(this.getDrift(deltaTime, distanceChange), UnitType.NMILE);
      this.lastPositionTime = simTime;

      this.driftAmount.offset(heading, drift);
      const newPosition = new GeoPoint(actualPosition.lat + this.driftAmount.lat, actualPosition.lon + this.driftAmount.lon);

      this.position.set(newPosition);
    }
  }
}

/**
 * Interface for a radio nav system, which is extended by VOR/DME/TACAN
 */
class RadioNavSystem extends BasicAvionicsSystem<UnsRadNavEvents> {
  private static RANDOM_SMOOTHNESS = 0.01;

  protected radioNavaidManager: UnsRadioNavaidManager;
  private positionMultiplierLat = 0;
  private positionMultiplierLong = 0;
  public position = Subject.create(new LatLong(0, 0));
  public positionVariance = 0;
  public anp = 0;

  /** @inheritdoc */
  constructor(sensorType: 'dme' | 'vor', bus: EventBus, radioNavaidManager: UnsRadioNavaidManager, powerSource?: SystemPowerKey | CompositeLogicXMLElement) {
    super(1, bus, `uns_${sensorType}_state` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.radioNavaidManager = radioNavaidManager;
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState !== AvionicsSystemState.On) {
      this.anp = NaN;
      this.position.set(new LatLong(NaN, NaN));
    }
  }

  /** Calculates the ANP as the circle radius where the airplane position is estimated to be within 95% of the time.
   * Uses the statistic formula of estimating a 95% confidence interval with a (hypothetical) sample size of 1.
   * @param numberSignals The number of signals being used by the position system
   * @returns The estimated ANP.
   */
  protected calculateAnp(numberSignals: number): number {
    /** Used for calculating the ANP. Source: https://www.calculator.net/confidence-interval-calculator.html */
    const Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL = 1.96;

    const anpMeter = Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL * Math.sqrt(UnitType.METER.convertFrom(this.positionVariance, UnitType.NMILE)) / Math.sqrt(numberSignals);
    return anpMeter;
  }

  /**
   * Updates the nav system's positioning
   * @param fmsPosition Aircraft FMS position
   */
  public updatePosition(fmsPosition: GeoPoint): void {
    this.positionMultiplierLat = lerp(this.positionMultiplierLat, getRandomNegative(), RadioNavSystem.RANDOM_SMOOTHNESS);
    this.positionMultiplierLong = lerp(this.positionMultiplierLong, getRandomNegative(), RadioNavSystem.RANDOM_SMOOTHNESS);

    const newPos = fmsPosition
      .offset(90, UnitType.GA_RADIAN.convertFrom(this.positionVariance * this.positionMultiplierLat, UnitType.NMILE))
      .offset(0, UnitType.GA_RADIAN.convertFrom(this.positionVariance * this.positionMultiplierLong, UnitType.NMILE));

    this.position.set(new LatLong(newPos.lat, newPos.lon));
  }
}

/**
 * Interface for a DME nav system
 */
class DmeNavSystem extends RadioNavSystem {
  /** @inheritdoc */
  constructor(bus: EventBus, radioNavaidManager: UnsRadioNavaidManager, powerSource?: SystemPowerKey | CompositeLogicXMLElement) {
    super('dme', bus, radioNavaidManager, powerSource);
  }

  /**
   * Calculates the DME position variance of a single DME
   * Taken from https://www.icao.int/SAM/Documents/2005/APATM11/apatm11NE07.pdf
   * @param distance Distance from the DME signal
   * @returns DMEPOS variance
   */
  private singleDmePosVariance(distance: number): number {
    const airError = (0.0125 * distance) ^ 2;
    return 0.05 ^ 2 + Math.max(0.085 ^ 2, airError);
  }

  /**
   * Computes the mean average DME position variance
   * @param dmes List of the available DMEs
   * @param aircraftPos Actual aircraft position
   */
  private calculatePosVariance(dmes: readonly VorFacility[], aircraftPos: GeoPoint): void {
    let totalDMEVariance = 0;
    dmes.forEach((dmeFacility) => {
      const dmeDistance = UnitType.GA_RADIAN.convertTo(aircraftPos.distance(dmeFacility.lat, dmeFacility.lon), UnitType.NMILE);
      totalDMEVariance += this.singleDmePosVariance(dmeDistance);
    });

    this.positionVariance = totalDMEVariance;
    this.anp = this.calculateAnp(dmes.length);
  }

  /**
   * Computes a DME sensor position from the mean variance of the present DMEs
   * @param fmsPosition Actual aircraft position
   */
  public updatePosition(fmsPosition: GeoPoint): void {
    if (this.state == AvionicsSystemState.On) {
      this.radioNavaidManager.filterDMEs();
      const dmes = this.radioNavaidManager.dmes.getArray();

      if (dmes.length > 2) {
        this.calculatePosVariance(dmes, fmsPosition);
        super.updatePosition(fmsPosition);
      } else {
        this.anp = NaN;
        this.position.set(new LatLong(NaN, NaN));
      }
    }
  }
}

/**
 * Interface for a VOR nav system
 */
class VorNavSystem extends RadioNavSystem {
  private static readonly VARIANCE_MULTIPLIER = 10;

  /** @inheritdoc */
  constructor(bus: EventBus, radioNavaidManager: UnsRadioNavaidManager, powerSource?: SystemPowerKey | CompositeLogicXMLElement) {
    super('vor', bus, radioNavaidManager, powerSource);
  }

  /**
   * Calculates the VORPOS variance
   * Taken from https://www.icao.int/SAM/Documents/2005/APATM11/apatm11NE07.pdf
   * @param distance Distance from the VOR signal
   * @returns VORPOS variance
   */
  private calculatePosVariance(distance: number): number {
    const airError = (0.0125 * distance) ^ 2;
    return (0.0122 * distance) ^ 2 + (0.0175 * distance) ^ 2 + 0.05 ^ 2 + Math.max(0.085 ^ 2, airError);
  }

  /**
   * Computes a DME sensor position from the mean variance of the present DMEs
   * @param fmsPosition Actual aircraft position
   */
  public updatePosition(fmsPosition: GeoPoint): void {
    if (this.state == AvionicsSystemState.On) {
      this.radioNavaidManager.filterVORs();
      const vors = this.radioNavaidManager.vors.getArray();
      const nearestVor = vors[0];

      if (nearestVor) {
        const vorDistance = UnitType.GA_RADIAN.convertTo(fmsPosition.distance(nearestVor.lat, nearestVor.lon), UnitType.NMILE);

        this.positionVariance = this.calculatePosVariance(vorDistance) * VorNavSystem.VARIANCE_MULTIPLIER;
        this.anp = this.calculateAnp(1);
        super.updatePosition(fmsPosition);
      } else {
        this.anp = NaN;
        this.position.set(new LatLong(NaN, NaN));
      }
    }
  }
}

/**
 * Interface for the GPS systems
 */
class GpsNavSystem extends BasicAvionicsSystem<UnsGpsEvents> {
  private static RANDOM_SMOOTHNESS = 0.04;
  private static ANP_MULTIPLIER = 1 / 0.95;

  public anp = 0;
  public satComputer: GPSSatComputer;

  private positionMultiplierLat = 0;
  private positionMultiplierLong = 0;
  public position = Subject.create(new LatLong(0, 0));

  /** Calculates the ANP as the circle radius where the airplane position is estimated to be within 95% of the time.
   * Uses the statistic formula of estimating a 95% confidence interval with a (hypothetical) sample size of 1.
   * @param pdop The geometric dilution of precision computation (GDOP).
   * @returns The estimated ANP.
   */
  private static readonly ANPmeters = (pdop: number): number => {
    /** In meters. Used for calculating the ANP. Sets at 222 under the assumption that airplane cruises at 800 km/h,
     * hence if gps position is updated every second, the deviation would be 222 m/s.
     * Source: https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System */
    const STANDARD_DEVIATION_OF_USER_EQUIVALENT_RANGE_ERROR = 222;

    /** In meters. Used for calculating the ANP. Source: https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System */
    const ESTIMATED_NUMERICAL_ERROR = 200;

    /** Used for calculating the ANP. Source: https://www.calculator.net/confidence-interval-calculator.html */
    const Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL = 1.96;

    /** Used for calculating the ANP. Source: https://www.calculator.net/confidence-interval-calculator.html */
    const HYPOTHETICAL_SAMPLE_SIZE = 1;

    const STANDARD_DEVIATION_OF_ERROR_IN_ESTIMATED_RECEIVER_POS = (): number => {
      return Math.sqrt((pdop * STANDARD_DEVIATION_OF_USER_EQUIVALENT_RANGE_ERROR) ^ 2 + ESTIMATED_NUMERICAL_ERROR ^ 2);
    };

    const anpMeter = Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL * STANDARD_DEVIATION_OF_ERROR_IN_ESTIMATED_RECEIVER_POS() / Math.sqrt(HYPOTHETICAL_SAMPLE_SIZE);
    return anpMeter;
  };

  /**
   * Constructs new GPS nav system
   * @param index GPS index
   * @param bus Event bus
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(index: number, bus: EventBus, powerSource?: SystemPowerKey | CompositeLogicXMLElement) {
    super(index, bus, `uns_gps_state_${index}` as const);

    this.satComputer = new GPSSatComputer(
      index,
      bus,
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTUns1v2/Assets/Data/gps_ephemeris.json',
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTUns1v2/Assets/Data/gps_sbas.json',
      5000,
      Object.values(SBASGroupName)
    );
    this.satComputer.init();

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    } else {
      // If our power source is undefined, then the system is always considered to be in the on state. Therefore we
      // will force the GPS to immediately acquire and use all the satellites it can since a system that is always on
      // never needs to initialize.
      this.satComputer.acquireAndUseSatellites();
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (previousState === undefined && this.satComputer.syncRole !== 'replica') {
      if (currentState === AvionicsSystemState.On) {
        // If this is the first time we are setting our state and the state is on, then we assume that the system was on at
        // flight load, in which case we will force the GPS to immediately acquire and use all the satellites it can so
        // that we don't force people to wait for satellite acquisition when loading onto the runway/in the air.
        this.satComputer.acquireAndUseSatellites();
      } else {
        // If this is the first time we are setting our state and the state is not on and this system is configured for
        // warm starts on initial power-on, then sync the GPS's last known position with the plane's current position
        // and force a download of the almanac.
        this.satComputer.syncLastKnownPosition();
        this.satComputer.downloadAlamanac();
      }
    }

    // Reset the GPS sat computer if the system is not operating and its receiver is not a replica (a replica receiver
    // will get the reset command from its primary).
    if ((currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) && this.satComputer.syncRole !== 'replica') {
      this.satComputer.reset();
    }
  }

  /**
   * Updates the nav system's positioning
   * @param fmsPosition Aircraft FMS position
   */
  public updateGPS(fmsPosition: GeoPoint): void {
    if (this.state === AvionicsSystemState.On || this.state === undefined) {
      this.satComputer.onUpdate();

      const pdop = Math.max(this.satComputer.pdop, 0);
      const anp = GpsNavSystem.ANPmeters(pdop) * GpsNavSystem.ANP_MULTIPLIER;

      this.positionMultiplierLat = lerp(this.positionMultiplierLat, getRandomNegative(), GpsNavSystem.RANDOM_SMOOTHNESS);
      this.positionMultiplierLong = lerp(this.positionMultiplierLong, getRandomNegative(), GpsNavSystem.RANDOM_SMOOTHNESS);

      const newPos = fmsPosition
        .offset(90, UnitType.GA_RADIAN.convertFrom(anp * this.positionMultiplierLat, UnitType.METER))
        .offset(0, UnitType.GA_RADIAN.convertFrom(anp * this.positionMultiplierLong, UnitType.METER));

      this.position.set(new LatLong(newPos.lat, newPos.lon));
      this.anp = UnitType.NMILE.convertFrom(GpsNavSystem.ANPmeters(pdop), UnitType.METER);
    }
  }
}

/**
 * Interface for the array of present nav systems
 */
interface AvailableNavSystems {
  /** Available IRS systems */
  irsSystems: IrsNavSystem[],
  /** Available GPS systems */
  gpsSystems: GpsNavSystem[],
  /** Available DME navigation system */
  dmeSystem: DmeNavSystem,
  /** Available VOR navigation system */
  vorSystem: VorNavSystem,
}

/**
 * Class responsible for handling of the various positioning systems available and utilized including IRS, AHRS and DME/DME modes
 */
export class UnsPositionSystem extends BasicAvionicsSystem<UnsPositionSystemEvents> {
  private static ANP_PLACEHOLDER_NUM = 50;
  private static VALID_GPS_DME_ANP_MAX = UnitType.NMILE.convertTo(0.5, UnitType.METER);
  private static VALID_DME_ANP_MAX = UnitType.NMILE.convertTo(2.2, UnitType.METER);

  private readonly gpsEvents = this.bus.getSubscriber<GNSSEvents>();
  private readonly adcEvents = this.bus.getSubscriber<AdcEvents>();
  private readonly clock = this.bus.getSubscriber<ClockEvents>();
  public readonly onGround = ConsumerSubject.create(this.adcEvents.on('on_ground').atFrequency(1), false);
  private readonly gpsPosition = Subject.create<GeoPoint>(new GeoPoint(0, 0));
  private readonly gpsHeading = ConsumerSubject.create(this.gpsEvents.on('track_deg_true').atFrequency(5), 0);
  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), Date.now());

  private lastGpsPosition = new LatLong(0, 0);
  private firstGpsChange = false;
  private navSystems: AvailableNavSystems;
  private anp = UnsPositionSystem.ANP_PLACEHOLDER_NUM;

  /**
   * Creates the FMS positioning system
   * @param bus Event bus
   * @param navSensorConfig Navigation sensor config
   * @param radioNavaidManager The handler for radio navaids
   */
  constructor(bus: EventBus, navSensorConfig: UnsNavigationSensors, radioNavaidManager: UnsRadioNavaidManager) {
    super(1, bus, 'uns_position_state');

    this.navSystems = {
      irsSystems: [],
      gpsSystems: [],
      dmeSystem: new DmeNavSystem(bus, radioNavaidManager, navSensorConfig.dmeSensorCircuit),
      vorSystem: new VorNavSystem(bus, radioNavaidManager, navSensorConfig.vorSensorCircuit),
    };

    for (let i = 0; i < navSensorConfig.irsSensorCount; i++) {
      this.navSystems.irsSystems.push(new IrsNavSystem(i + 1, this.bus, this.gpsPosition.get(), this.simTime.get(), navSensorConfig.irsSensorCircuit));
    }
    for (let i = 0; i < navSensorConfig.waasSensorCount; i++) {
      const navSystem = new GpsNavSystem(i + 1, this.bus, navSensorConfig.waasSensorCircuit);
      this.navSystems.gpsSystems.push(navSystem);

      navSystem.position.sub((gpsPosition) => this.publisher.pub(`uns_gps_position_${i + 1}`, gpsPosition));
    }

    this.gpsEvents.on('gps-position').atFrequency(5).handle((position) => {
      const gpsPosition = new GeoPoint(position.lat, position.long);
      this.gpsPosition.set(gpsPosition);
      this.anp = UnsPositionSystem.ANP_PLACEHOLDER_NUM;

      if (!this.firstGpsChange) {
        this.navSystems.irsSystems.forEach((irs: IrsNavSystem) => irs.position.set(gpsPosition));
        this.firstGpsChange = true;
        this.lastGpsPosition = position.toLatLong();
      }

      this.handleIrsPositioning();
      this.handleGPSSystems();
      this.publisher.pub('uns_position', position.toLatLong());
      this.publisher.pub('uns_anp', this.anp);

      this.lastGpsPosition = position.toLatLong();
    });

    this.clock.on('simTime').atFrequency(0.25).handle(() => this.handleRadioNavSystems());
  }

  /**
   * Handles the DME and VOR nav systems
   */
  private handleRadioNavSystems(): void {
    const dmeSystem = this.navSystems.dmeSystem;
    const vorSystem = this.navSystems.vorSystem;

    dmeSystem.onUpdate();
    vorSystem.onUpdate();
    dmeSystem.updatePosition(this.gpsPosition.get());
    vorSystem.updatePosition(this.gpsPosition.get());
    this.publisher.pub('uns_dme_anp', UnitType.NMILE.convertFrom(dmeSystem.anp, UnitType.METER));
    this.publisher.pub('uns_vor_anp', UnitType.NMILE.convertFrom(vorSystem.anp, UnitType.METER));

    this.selectNavMode();
  }

  /**
   * Handles the GPS systems
   */
  private handleGPSSystems(): void {
    let lowestGpsAnp = UnsPositionSystem.ANP_PLACEHOLDER_NUM;
    let activeGps = 1;
    this.navSystems.gpsSystems.forEach((gpsSystem, index) => {
      gpsSystem.onUpdate();
      gpsSystem.updateGPS(this.gpsPosition.get());
      this.anp = Math.min(this.anp, gpsSystem.anp);

      if (gpsSystem.anp < lowestGpsAnp) {
        lowestGpsAnp = gpsSystem.anp;
        activeGps = index + 1;
      }
    });

    this.publisher.pub('uns_active_gps', activeGps + 1);
  }

  /**
   * Passes data to the IRS nav sensors used to determine their position
   */
  private handleIrsPositioning(): void {
    const gpsPositionChange = this.gpsPosition.get().distance(this.lastGpsPosition.lat, this.lastGpsPosition.long);

    this.navSystems.irsSystems.forEach((irsSystem, index) => {
      irsSystem.onUpdate();
      irsSystem.calculatePosition(this.gpsPosition.get(), gpsPositionChange, this.gpsHeading.get(), this.simTime.get());
      const irsPosition = new LatLong(irsSystem.position.get().lat, irsSystem.position.get().lon);
      this.publisher.pub(`uns_irs_position_${index + 1}`, irsPosition);
    });
  }

  /**
   * Function responsible for selecting the current nav mode
   */
  private selectNavMode(): void {
    let positionMode = UnsPositionMode.NoSensor;

    const navSystems = this.navSystems;
    const gpsActive = navSystems.gpsSystems.find(gpsSystem => gpsSystem.satComputer.pdop != -1) !== undefined;
    const irsActive = navSystems.irsSystems.length !== 0;
    const dmeSensorActive = !isNaN(navSystems.dmeSystem.anp) && !this.onGround.get();
    const vorSensorActive = !isNaN(navSystems.vorSystem.anp) && !this.onGround.get();
    const deadreckoningPossible = !this.onGround.get();

    if (gpsActive && dmeSensorActive && navSystems.dmeSystem.anp < UnsPositionSystem.VALID_GPS_DME_ANP_MAX) {
      positionMode = UnsPositionMode.GpsDme;
    } else if (gpsActive) {
      positionMode = UnsPositionMode.Gps;
    } else if (dmeSensorActive && navSystems.dmeSystem.anp < UnsPositionSystem.VALID_DME_ANP_MAX) {
      positionMode = UnsPositionMode.DmeDme;
    } else if (vorSensorActive && navSystems.vorSystem.anp < UnsPositionSystem.VALID_DME_ANP_MAX) {
      positionMode = UnsPositionMode.DmeVor;
    } else if (irsActive) {
      positionMode = UnsPositionMode.Irs;
    } else if (deadreckoningPossible) {
      positionMode = UnsPositionMode.DeadReckoning;
    }

    this.publisher.pub('uns_position_mode', positionMode);
  }
}
