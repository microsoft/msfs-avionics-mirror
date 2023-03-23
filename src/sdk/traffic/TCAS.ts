import { ConsumerSubject, EventSubscriber } from '../data';
import { Consumer } from '../data/Consumer';
import { EventBus, Publisher } from '../data/EventBus';
import { GeoPoint, GeoPointInterface, GeoPointReadOnly } from '../geo/GeoPoint';
import { GeoPointSubject } from '../geo/GeoPointSubject';
import { AdcEvents } from '../instruments/Adc';
import { ClockEvents } from '../instruments/Clock';
import { GNSSEvents } from '../instruments/GNSS';
import { TrafficContact, TrafficEvents, TrafficInstrument } from '../instruments/Traffic';
import { BitFlags } from '../math/BitFlags';
import { MathUtils } from '../math/MathUtils';
import { NumberUnit, NumberUnitInterface, NumberUnitReadOnly, UnitFamily, UnitType } from '../math/NumberUnit';
import { NumberUnitSubject } from '../math/NumberUnitSubject';
import { ReadonlyFloat64Array, Vec2Math, Vec3Math } from '../math/VecMath';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { Subscription } from '../sub/Subscription';

/**
 * TCAS operating modes.
 */
export enum TcasOperatingMode {
  Off = 'Off',
  Standby = 'Standby',
  TAOnly = 'TAOnly',
  TA_RA = 'TA/RA',
  Test = 'Test',
  Failed = 'Failed'
}

/**
 * TCAS alert level.
 */
export enum TcasAlertLevel {
  None,
  ProximityAdvisory,
  TrafficAdvisory,
  ResolutionAdvisory
}

/**
 * A time-of-closest-approach prediction made by TCAS.
 */
export interface TcasTcaPrediction {
  /** Whether this prediction is valid. */
  readonly isValid: boolean;

  /** The time at which this prediction was most recently updated, as a UNIX timestamp in milliseconds. */
  readonly time: number;

  /** The predicted time to closest horizontal approach. */
  readonly tcpa: NumberUnitReadOnly<UnitFamily.Duration>;

  /** The predicted time to co-altitude. */
  readonly tcoa: NumberUnitReadOnly<UnitFamily.Duration>;

  /** Whether this prediction's intruder violates the protected volume and should be considered a threat. */
  readonly isThreat: boolean;

  /**
   * The predicted 3D displacement vector from own airplane to this prediction's intruder at time of closest horizontal
   * approach. Each component is expressed in units of meters.
   */
  readonly cpaDisplacement: ReadonlyFloat64Array;

  /**
   * The predicted horizontal separation between this prediction's intruder and own airplane at time of closest
   * horizontal approach.
   */
  readonly cpaHorizontalSep: NumberUnitReadOnly<UnitFamily.Distance>;

  /**
   * The predicted vertical separation between this prediction's intruder and own airplane at time of closest
   * horizontal approach.
   */
  readonly cpaVerticalSep: NumberUnitReadOnly<UnitFamily.Distance>;

  /**
   * The cylindrical norm of the predicted displacement vector between this prediction's intruder and own airplane at
   * time of closest horizontal approach. A value less than or equal to 1 indicates the intruder will be inside the
   * protected zone. Larger values correspond to greater separation.
   */
  readonly cpaNorm: number;
}

/**
 * An intruder tracked by TCAS.
 */
export interface TcasIntruder {
  /** The traffic contact associated with this intruder. */
  readonly contact: TrafficContact;

  /** A subscribable which provides the alert level assigned to this intruder. */
  readonly alertLevel: Subscribable<TcasAlertLevel>;

  /** The position of this intruder at the time of the most recent update. */
  readonly position: GeoPointReadOnly;

  /** The altitude of this intruder at the time of the most recent update. */
  readonly altitude: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The true ground track of this intruder at the time of the most recent update. */
  readonly groundTrack: number;

  /** The ground speed of this intruder at the time of the most recent update. */
  readonly groundSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The vertical speed of this intruder at the time of the most recent update. */
  readonly verticalSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /**
   * The 3D position vector of this intruder at the time of the last update. Each component is expressed in units of
   * meters. The coordinate system is an Euclidean approximation of the geodetic space around the own airplane such
   * that the z-coordinate represents orthometric height and the x- and y-coordinates represent an east-
   * counterclockwise equirectangular projection of latitude and longitude, with the origin at the location of the own
   * airplane.
   */
  readonly positionVec: ReadonlyFloat64Array;

  /**
   * The 3D velocity vector of this intruder at the time of the last update. Each component is expressed in units of
   * meters per second. The coordinate system is defined the same as for position vectors.
   */
  readonly velocityVec: ReadonlyFloat64Array;

  /** The 3D position vector of this intruder relative to own airplane. */
  readonly relativePositionVec: ReadonlyFloat64Array;

  /** The 3D velocity vector of this intruder relative to own airplane. */
  readonly relativeVelocityVec: ReadonlyFloat64Array;

  /** Whether there is a valid prediction for this intruder's position and velocity. */
  readonly isPredictionValid: boolean;

  /** A time-of-closest-approach prediction for this intruder using sensitivity settings for traffic advisories. */
  readonly tcaTA: TcasTcaPrediction;

  /** A time-of-closest-approach prediction for this intruder using sensitivity settings for resolution advisories. */
  readonly tcaRA: TcasTcaPrediction;

  /**
   * Calculates the predicted 3D displacement vector from own airplane to this intruder at a specified time based on
   * the most recent available data. If insufficient data is available to calculate the prediction, NaN will be written
   * to the result.
   * @param simTime The sim time at which to calculate the separation, as a UNIX timestamp in milliseconds.
   * @param out A Float64Array object to which to write the result.
   * @returns The predicted displacement vector from own airplane to this intruder at the specified time.
   */
  predictDisplacement(simTime: number, out: Float64Array): Float64Array;

  /**
   * Calculates the predicted separation between this intruder and own airplane at a specified time based on the most
   * recent available data and stores the results in the supplied WT_NumberUnit objects. If insufficient data is
   * available to calculate the prediction, NaN will be written to the results.
   * @param simTime The sim time at which to calculate the separation, as a UNIX timestamp in milliseconds.
   * @param horizontalOut A NumberUnit object to which to write the horizontal separation.
   * @param verticalOut A NumberUnit object to which to write the vertical separation.
   */
  predictSeparation(simTime: number, horizontalOut: NumberUnit<UnitFamily.Distance>, verticalOut: NumberUnit<UnitFamily.Distance>): void;
}

/**
 * TCAS parameters for advisories defining the protected zone around the own airplane.
 */
export interface TcasAdvisoryParameters {
  /** The radius of the own airplane's protected volume. */
  readonly protectedRadius: NumberUnitInterface<UnitFamily.Distance>;

  /** The half-height of the own airplane's protected volume. */
  readonly protectedHeight: NumberUnitInterface<UnitFamily.Distance>;
}

/**
 * TCAS parameters for time-of-closest-approach calculations.
 */
export interface TcasTcaParameters extends TcasAdvisoryParameters {
  /** The maximum lookahead time to closest horizontal approach or co-altitude. */
  readonly tau: NumberUnitInterface<UnitFamily.Duration>;

  /** The horizontal miss distance filter threshold. If not defined, an HMD filter will not be applied. */
  readonly hmd?: NumberUnitInterface<UnitFamily.Distance>;
}

/**
 * A full set of TCAS sensitivity parameters.
 */
export type TcasSensitivityParameters = {
  /**
   * Protected zone parameters for proximity advisories. If any parameters have a value of `NaN`, proximity advisories
   * will not be issued.
   */
  readonly parametersPA: TcasAdvisoryParameters;

  /**
   * Parameters for time-of-closest-approach calculations for traffic advisories. If any parameters have a value of
   * `NaN`, traffic advisories will not be issued.
   */
  readonly parametersTA: TcasTcaParameters;

  /**
   * Parameters for time-of-closest-approach calculations for resolution advisories. If any parameters have a value of
   * `NaN`, resolution advisories will not be issued.
   */
  readonly parametersRA: TcasTcaParameters;
};

/**
 * Sensitivity settings for TCAS.
 */
export interface TcasSensitivity<I extends TcasIntruder = TcasIntruder> {
  /**
   * Selects sensitivity parameters for an intruder.
   * @param intruder An intruder.
   * @returns Sensitivity parameters for the specified intruder.
   */
  selectParameters(intruder: I): TcasSensitivityParameters;

  /**
   * Selects an ALIM for a resolution advisory.
   * @param intruders The intruders involved in the resolution advisory.
   * @returns An ALIM for a resolution advisory involving the specified intruders.
   */
  selectRAAlim(intruders: ReadonlySet<I>): NumberUnitInterface<UnitFamily.Distance>;
}

/**
 * Bit flags describing TCAS resolution advisories.
 */
export enum TcasResolutionAdvisoryFlags {
  /** A corrective resolution advisory. Requires a change in the own airplane's vertical speed. */
  Corrective = 1 << 0,

  /** An upward sense resolution advisory. Commands a vertical speed above a certain value. */
  UpSense = 1 << 1,

  /** A downward sense resolution advisory. Commands a vertical speed below a certain value. */
  DownSense = 1 << 2,

  /** A resolution advisory which crosses an intruder's altitude. */
  Crossing = 1 << 3,

  /** A CLIMB resolution advisory. Commands a positive vertical speed above 1500 FPM. */
  Climb = 1 << 4,

  /** A DESCEND resolution advisory. Commands a negative vertical speed below -1500 FPM. */
  Descend = 1 << 5,

  /** An INCREASE CLIMB or INCREASE DESCENT resolution advisory. Commands a vertical speed above 2500 FPM or below -2500 FPM. */
  Increase = 1 << 6,

  /** A CLIMB or DESCEND resolution advisory that reverses sense. Commands a vertical speed above 1500 FPM or below -1500 FPM. */
  Reversal = 1 << 7,

  /** A corrective REDUCE CLIMB resolution advisory. Commands a vertical speed of 0 FPM or less. */
  ReduceClimb = 1 << 8,

  /** A corrective REDUCE DESCENT resolution advisory. Commands a vertical speed of 0 FPM or more. */
  ReduceDescent = 1 << 9,

  /** A preventative DO NOT CLIMB resolution advisory. Commands a non-positive vertical speed. */
  DoNotClimb = 1 << 10,

  /** A preventative DO NOT DESCEND resolution advisory. Commands a non-negative vertical speed. */
  DoNotDescend = 1 << 11
}

/**
 * Types of TCAS resolution advisories.
 */
export enum TcasResolutionAdvisoryType {
  /** Upward sense, positive, corrective, required vertical speed 1500 to 2000 fpm. */
  Climb = 'Climb',

  /** Upward sense, positive, corrective, crosses intruder altitude, required vertical speed 1500 to 2000 fpm. */
  CrossingClimb = 'CrossingClimb',

  /** Upward sense, positive, corrective, required vertical speed 1500 to 4400 fpm. */
  MaintainClimb = 'MaintainClimb',

  /** Upward sense, positive, corrective, crosses intruder altitude, required vertical speed 1500 to 2000 fpm. */
  CrossingMaintainClimb = 'CrossingMaintainClimb',

  /** Upward sense, positive, corrective, required vertical speed 2500 to 3000 fpm. */
  IncreaseClimb = 'IncreaseClimb',

  /** Upward sense, positive, corrective, transition from downward sense, required vertical speed 1500 to 2000 fpm. */
  ReversalClimb = 'ReversalClimb',

  /** Upward sense, negative, corrective, required vertical speed >= 0 fpm. */
  ReduceDescent = 'ReduceDescent',

  /** Upward sense, negative, preventative, required vertical speed >= 0 fpm. */
  DoNotDescend0 = 'DoNotDescend0',

  /** Upward sense, negative, preventative, required vertical speed >= -500 fpm. */
  DoNotDescend500 = 'DoNotDescend500',

  /** Upward sense, negative, preventative, required vertical speed >= -1000 fpm. */
  DoNotDescend1000 = 'DoNotDescend1000',

  /** Upward sense, negative, preventative, required vertical speed >= -1500 fpm. */
  DoNotDescend1500 = 'DoNotDescend1500',

  /** Upward sense, negative, preventative, required vertical speed >= -2000 fpm. */
  DoNotDescend2000 = 'DoNotDescend2000',

  /** Downward sense, positive, corrective, required vertical speed -1500 to -2000 fpm. */
  Descend = 'Descend',

  /** Downward sense, positive, corrective, crosses intruder altitude, required vertical speed -1500 to -2000 fpm. */
  CrossingDescend = 'CrossingDescend',

  /** Downward sense, positive, corrective, required vertical speed -1500 to -4400 fpm. */
  MaintainDescend = 'MaintainDescend',

  /** Downward sense, positive, corrective, crosses intruder altitude, required vertical speed -1500 to -4400 fpm. */
  CrossingMaintainDescend = 'CrossingMaintainDescend',

  /** Downward sense, positive, corrective, required vertical speed -2500 to -3000 fpm. */
  IncreaseDescend = 'IncreaseDescend',

  /** Downward sense, positive, corrective, transition from upward sense, required vertical speed -1500 to -2000 fpm. */
  ReversalDescend = 'ReversalDescend',

  /** Downward sense, negative, corrective, required vertical speed <= 0 fpm. */
  ReduceClimb = 'ReduceClimb',

  /** Downward sense, negative, preventative, required vertical speed <= 0 fpm. */
  DoNotClimb0 = 'DoNotClimb0',

  /** Downward sense, negative, preventative, required vertical speed <= 500 fpm. */
  DoNotClimb500 = 'DoNotClimb500',

  /** Downward sense, negative, preventative, required vertical speed <= 1000 fpm. */
  DoNotClimb1000 = 'DoNotClimb1000',

  /** Downward sense, negative, preventative, required vertical speed <= 1500 fpm. */
  DoNotClimb1500 = 'DoNotClimb1500',

  /** Downward sense, negative, preventative, required vertical speed <= 2000 fpm. */
  DoNotClimb2000 = 'DoNotClimb2000',

  /** Clear of conflict. */
  Clear = 'Clear'
}

/**
 * A host for information on the active TCAS resolution advisory.
 */
export interface TcasResolutionAdvisoryHost {
  /** The resolution advisory's active intruders, sorted in order of increasing time to closest approach. */
  readonly intruderArray: readonly TcasIntruder[];

  /** The upper vertical speed limit set by the resolution advisory. A value of `NaN` indicates no limit. */
  readonly maxVerticalSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The lower vertical speed limit set by the resolution advisory. A value of `NaN` indicates no limit. */
  readonly minVerticalSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The resolution advisory's primary type. */
  readonly primaryType: TcasResolutionAdvisoryType;

  /**
   * The resolution advisory's secondary type, if any. A secondary type can only exist if there are multiple
   * intruders. If a secondary type exists, it can only be a negative type.
   */
  readonly secondaryType: TcasResolutionAdvisoryType | null;

  /** A combination of {@link TcasResolutionAdvisoryFlags} entries describing the resolution advisory's primary type. */
  readonly primaryFlags: number;

  /**
   * A combination of {@link TcasResolutionAdvisoryFlags} entries describing the resolution advisory's secondary type.
   * If this resolution advisory does not have a secondary type, this value will be equal to zero.
   */
  readonly secondaryFlags: number;
}

/**
 * TCAS events.
 */
export interface TcasEvents {
  /** The TCAS operating mode changed. */
  tcas_operating_mode: TcasOperatingMode;

  /** A new intruder was created. */
  tcas_intruder_added: TcasIntruder;

  /** The alert level of an intruder was changed. */
  tcas_intruder_alert_changed: TcasIntruder;

  /** An intruder was removed. */
  tcas_intruder_removed: TcasIntruder;

  /** The number of intruders associated with active traffic advisories. */
  tcas_ta_intruder_count: number;

  /** The number of intruders associated with an active resolution advisory. */
  tcas_ra_intruder_count: number;

  /** An initial resolution advisory has been issued. */
  tcas_ra_issued: TcasResolutionAdvisoryHost;

  /** An active resolution advisory has been updated. */
  tcas_ra_updated: TcasResolutionAdvisoryHost;

  /** A resolution advisory has been canceled. */
  tcas_ra_canceled: void;
}

/**
 * Options to adjust how resolution advisories are calculated by TCAS.
 */
export type TcasResolutionAdvisoryOptions = {
  /** The assumed response time of the own airplane following an initial resolution advisory. */
  readonly initialResponseTime: NumberUnitInterface<UnitFamily.Duration>;

  /** The assumed acceleration of the own airplane following an initial resolution advisory. */
  readonly initialAcceleration: NumberUnitInterface<UnitFamily.Acceleration>;

  /** The assumed response time of the own airplane following an updated resolution advisory. */
  readonly subsequentResponseTime: NumberUnitInterface<UnitFamily.Duration>;

  /** The assumed acceleration of the own airplane following an updated resolution advisory. */
  readonly subsequentAcceleration: NumberUnitInterface<UnitFamily.Acceleration>;

  /** A function which determines whether to allow a CLIMB resolution advisory. */
  allowClimb: (simTime: number) => boolean;

  /** A function which determines whether to allow an INCREASE CLIMB resolution advisory. */
  allowIncreaseClimb: (simTime: number) => boolean;

  /** A function which determines whether to allow a DESCEND resolution advisory. */
  allowDescend: (simTime: number) => boolean;

  /** A function which determines whether to allow an INCREASE DESCENT resolution advisory. */
  allowIncreaseDescent: (simTime: number) => boolean;
};

/**
 * A TCAS-II-like system.
 */
export abstract class Tcas<I extends AbstractTcasIntruder = AbstractTcasIntruder, S extends TcasSensitivity = TcasSensitivity> {
  private static readonly DEFAULT_RA_OPTIONS = {
    initialResponseTime: UnitType.SECOND.createNumber(5),
    initialAcceleration: UnitType.G_ACCEL.createNumber(0.25),
    subsequentResponseTime: UnitType.SECOND.createNumber(2.5),
    subsequentAcceleration: UnitType.G_ACCEL.createNumber(0.35)
  };

  protected readonly operatingModeSub = Subject.create(TcasOperatingMode.Standby);

  protected readonly sensitivity: S;

  protected readonly ownAirplane: OwnAirplane;

  protected readonly intrudersSorted: I[] = [];
  protected intrudersFiltered: I[] = [];

  protected readonly intrudersRA = new Set<I>();
  protected readonly resolutionAdvisoryHost: TcasResolutionAdvisoryHostClass;

  private contactCreatedConsumer: Consumer<number> | undefined;
  private contactRemovedConsumer: Consumer<number> | undefined;

  private readonly contactCreatedHandler = this.onContactAdded.bind(this);
  private readonly contactRemovedHandler = this.onContactRemoved.bind(this);

  protected readonly ownAirplaneSubs = {
    position: GeoPointSubject.create(new GeoPoint(0, 0)),
    altitude: NumberUnitSubject.create(UnitType.FOOT.createNumber(0)),
    groundTrack: ConsumerSubject.create(null, 0),
    groundSpeed: NumberUnitSubject.create(UnitType.KNOT.createNumber(0)),
    verticalSpeed: NumberUnitSubject.create(UnitType.FPM.createNumber(0)),
    radarAltitude: NumberUnitSubject.create(UnitType.FOOT.createNumber(0)),
    isOnGround: ConsumerSubject.create(null, false)
  };

  protected readonly simTime = ConsumerSubject.create(null, 0);

  protected lastUpdateSimTime = 0;
  protected lastUpdateRealTime = 0;

  private readonly alertLevelSubs = new Map<I, Subscription>();

  private readonly eventPublisher = this.bus.getPublisher<TcasEvents>();
  private readonly eventSubscriber = this.bus.getSubscriber<TcasEvents>();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tfcInstrument The traffic instrument which provides traffic contacts for this TCAS.
   * @param maxIntruderCount The maximum number of intruders tracked at any one time by this TCAS.
   * @param realTimeUpdateFreq The maximum update frequency (Hz) in real time.
   * @param simTimeUpdateFreq The maximum update frequency (Hz) in sim time.
   * @param raOptions Options to adjust how resolution advisories are calculated.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly tfcInstrument: TrafficInstrument,
    protected readonly maxIntruderCount: number,
    protected readonly realTimeUpdateFreq: number,
    protected readonly simTimeUpdateFreq: number,
    raOptions?: Partial<TcasResolutionAdvisoryOptions>
  ) {
    this.sensitivity = this.createSensitivity();
    this.ownAirplane = new OwnAirplane(this.ownAirplaneSubs);

    const fullRAOptions: TcasResolutionAdvisoryOptions = {
      initialResponseTime: (raOptions?.initialResponseTime ?? Tcas.DEFAULT_RA_OPTIONS.initialResponseTime).copy(),
      initialAcceleration: (raOptions?.initialAcceleration ?? Tcas.DEFAULT_RA_OPTIONS.initialAcceleration).copy(),
      subsequentResponseTime: (raOptions?.subsequentResponseTime ?? Tcas.DEFAULT_RA_OPTIONS.subsequentResponseTime).copy(),
      subsequentAcceleration: (raOptions?.subsequentAcceleration ?? Tcas.DEFAULT_RA_OPTIONS.subsequentAcceleration).copy(),

      allowClimb: raOptions?.allowClimb ?? ((): boolean => true),
      allowIncreaseClimb: raOptions?.allowIncreaseClimb ?? ((): boolean => true),
      allowDescend: raOptions?.allowDescend ?? (
        (): boolean => this.ownAirplaneSubs.radarAltitude.get().asUnit(UnitType.FOOT) >= 1100
      ),
      allowIncreaseDescent: raOptions?.allowIncreaseDescent ?? (
        (): boolean => this.ownAirplaneSubs.radarAltitude.get().asUnit(UnitType.FOOT) >= 1450
      )
    };

    this.resolutionAdvisoryHost = new TcasResolutionAdvisoryHostClass(bus, fullRAOptions, this.ownAirplane);
  }

  /**
   * Creates a TCAS sensitivity object.
   * @returns A TCAS sensitivity object.
   */
  protected abstract createSensitivity(): S;

  /**
   * Gets this system's operating mode.
   * @returns This system's operating mode.
   */
  public getOperatingMode(): TcasOperatingMode {
    return this.operatingModeSub.get();
  }

  /**
   * Sets this system's operating mode.
   * @param mode The new operating mode.
   */
  public setOperatingMode(mode: TcasOperatingMode): void {
    this.operatingModeSub.set(mode);
  }

  /**
   * Gets an array of all currently tracked intruders. The intruders are sorted in order of decreasing threat.
   * @returns an array of all currently tracked intruders.
   */
  public getIntruders(): readonly TcasIntruder[] {
    return this.intrudersFiltered;
  }

  /**
   * Gets this system's resolution advisory host.
   * @returns This system's resolution advisory host.
   */
  public getResolutionAdvisoryHost(): TcasResolutionAdvisoryHost {
    return this.resolutionAdvisoryHost;
  }

  /**
   * Gets an event bus subscriber for TCAS events.
   * @returns an event bus subscriber for TCAS events..
   */
  public getEventSubscriber(): EventSubscriber<TcasEvents> {
    return this.eventSubscriber;
  }

  /**
   * Initializes this system.
   */
  public init(): void {
    // init contact listeners
    const sub = this.bus.getSubscriber<TrafficEvents & GNSSEvents & AdcEvents & ClockEvents>();
    this.contactCreatedConsumer = sub.on('traffic_contact_added');
    this.contactRemovedConsumer = sub.on('traffic_contact_removed');

    this.contactCreatedConsumer.handle(this.contactCreatedHandler);
    this.contactRemovedConsumer.handle(this.contactRemovedHandler);

    // add all existing contacts
    this.tfcInstrument.forEachContact(contact => { this.onContactAdded(contact.uid); });

    // init own airplane subjects
    sub.on('gps-position').atFrequency(this.realTimeUpdateFreq).handle(lla => {
      this.ownAirplaneSubs.position.set(lla.lat, lla.long);
      this.ownAirplaneSubs.altitude.set(lla.alt, UnitType.METER);
    });
    sub.on('ground_speed').whenChanged().atFrequency(this.realTimeUpdateFreq).handle(gs => { this.ownAirplaneSubs.groundSpeed.set(gs); });
    sub.on('vertical_speed').whenChanged().atFrequency(this.realTimeUpdateFreq).handle(vs => { this.ownAirplaneSubs.verticalSpeed.set(vs); });
    sub.on('radio_alt').whenChanged().atFrequency(this.realTimeUpdateFreq).handle(alt => { this.ownAirplaneSubs.radarAltitude.set(alt); });
    this.ownAirplaneSubs.groundTrack.setConsumer(sub.on('track_deg_true'));
    this.ownAirplaneSubs.isOnGround.setConsumer(sub.on('on_ground'));

    // init sim time subject
    this.simTime.setConsumer(sub.on('simTime'));

    // init operating mode notifier
    this.operatingModeSub.sub(this.onOperatingModeChanged.bind(this), true);

    // init update loop
    sub.on('simTime').whenChanged().handle(this.onSimTimeChanged.bind(this));
  }

  /**
   * Responds to changes in this TCAS's operating mode.
   * @param mode The current operating mode.
   */
  protected onOperatingModeChanged(mode: TcasOperatingMode): void {
    this.bus.pub('tcas_operating_mode', mode, false, true);

    if (mode !== TcasOperatingMode.TAOnly && mode !== TcasOperatingMode.TA_RA) {
      // We are in a mode where TCAS is not operating normally.

      // Cancel any active resolution advisories.
      this.resolutionAdvisoryHost.cancel(this.simTime.get());

      // Clean up all intruders.
      for (let i = 0; i < this.intrudersFiltered.length; i++) {
        this.cleanUpIntruder(this.intrudersFiltered[i]);
      }
      this.intrudersFiltered = [];
    }
  }

  /**
   * Sorts two intruders.
   * @param a The first intruder.
   * @param b The second intruder.
   * @returns A negative number if `a` is to be sorted before `b`, a positive number if `b` is to be sorted before `a`,
   * and zero if the two are equal.
   */
  protected intruderComparator(a: I, b: I): number {
    // always sort intruders with valid predictions first
    if (a.isPredictionValid && !b.isPredictionValid) {
      return -1;
    } else if (!a.isPredictionValid && b.isPredictionValid) {
      return 1;
    } else if (a.isPredictionValid) {
      let tcaPredictionA: TcasTcaPrediction | undefined, tcaPredictionB: TcasTcaPrediction | undefined;

      // Always sort intruders predicted to violate RA protected volume first (or for whom an RA has been issued), then
      // TA protected volume (or for whom a TA has been issued)

      const aRA = a.alertLevel.get() === TcasAlertLevel.ResolutionAdvisory || (a.tcaRA.isValid && a.tcaRA.isThreat);
      const bRA = b.alertLevel.get() === TcasAlertLevel.ResolutionAdvisory || (b.tcaRA.isValid && b.tcaRA.isThreat);

      if (aRA && !bRA) {
        return -1;
      } else if (!aRA && bRA) {
        return 1;
      } else if (aRA && bRA) {
        tcaPredictionA = a.tcaRA;
        tcaPredictionB = b.tcaRA;
      }

      if (!tcaPredictionA || !tcaPredictionB) {
        const aTA = a.alertLevel.get() === TcasAlertLevel.TrafficAdvisory || (a.tcaTA.isValid && a.tcaTA.isThreat);
        const bTA = b.alertLevel.get() === TcasAlertLevel.TrafficAdvisory || (b.tcaTA.isValid && b.tcaTA.isThreat);

        if (aTA && !bTA) {
          return -1;
        } else if (!aTA && bTA) {
          return 1;
        } else if (aTA && bTA) {
          tcaPredictionA = a.tcaTA;
          tcaPredictionB = b.tcaTA;
        }
      }

      if (!tcaPredictionA || !tcaPredictionB) {
        if ((a.tcaRA.isValid || a.tcaTA.isValid) && !b.tcaRA.isValid && !b.tcaTA.isValid) {
          return -1;
        } else if ((b.tcaRA.isValid || b.tcaTA.isValid) && !a.tcaRA.isValid && !a.tcaTA.isValid) {
          return 1;
        } else {
          return 0;
        }
      }

      // If both are predicted to violate the RA or TA protected volume, sort by time to CPA.
      // Otherwise sort by how close they approach the protected volume at CPA.
      const tcaComparison = tcaPredictionA.tcpa.compare(tcaPredictionB.tcpa);
      const normComparison = tcaPredictionA.cpaNorm - tcaPredictionB.cpaNorm;
      let firstComparison;
      let secondComparison;
      if (tcaPredictionA.isThreat) {
        firstComparison = tcaComparison;
        secondComparison = normComparison;
      } else {
        firstComparison = normComparison;
        secondComparison = tcaComparison;
      }
      if (firstComparison === 0) {
        return secondComparison;
      } else {
        return firstComparison;
      }
    } else {
      return 0;
    }
  }

  /**
   * Creates a TCAS intruder entry from a traffic contact.
   * @param contact A traffic contact.
   */
  protected abstract createIntruderEntry(contact: TrafficContact): I;

  /**
   * A callback which is called when a new traffic contact is added by this system's traffic instrument.
   * @param uid The ID number of the new contact.
   */
  private onContactAdded(uid: number): void {
    const contact = this.tfcInstrument.getContact(uid) as TrafficContact;
    const intruder = this.createIntruderEntry(contact);
    this.intrudersSorted.push(intruder);
  }

  /**
   * A callback which is called when a traffic contact is removed by this system's traffic instrument.
   * @param uid The ID number of the removed contact.
   */
  private onContactRemoved(uid: number): void {
    const sortedIndex = this.intrudersSorted.findIndex(intruder => intruder.contact.uid === uid);
    const culledIndex = this.intrudersFiltered.findIndex(intruder => intruder.contact.uid === uid);
    if (sortedIndex >= 0) {
      this.intrudersSorted.splice(sortedIndex, 1);
    }
    if (culledIndex >= 0) {
      const removed = this.intrudersFiltered[culledIndex];
      this.intrudersFiltered.splice(culledIndex, 1);
      this.cleanUpIntruder(removed);
    }
  }

  /**
   * A callback which is called when the sim time changes.
   * @param simTime The current sim time.
   */
  private onSimTimeChanged(simTime: number): void {
    switch (this.operatingModeSub.get()) {
      case TcasOperatingMode.Off:
      case TcasOperatingMode.Standby:
      case TcasOperatingMode.Failed:
      case TcasOperatingMode.Test: // TODO: support TEST mode
        return;
    }

    const realTime = Date.now();
    if (
      Math.abs(simTime - this.lastUpdateSimTime) < 1000 / this.simTimeUpdateFreq
      || Math.abs(realTime - this.lastUpdateRealTime) < 1000 / this.realTimeUpdateFreq) {
      return;
    }

    this.doUpdate(simTime);
    this.lastUpdateSimTime = simTime;
    this.lastUpdateRealTime = realTime;
  }

  /**
   * Executes an update.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  protected doUpdate(simTime: number): void {
    this.updateSensitivity();
    this.updateIntruderPredictions(simTime);
    this.updateIntruderArrays();
    this.updateFilteredIntruderAlertLevels(simTime);
    this.updateResolutionAdvisory(simTime);
  }

  protected abstract updateSensitivity(): void;

  /**
   * Updates the TCA predictions for all intruders tracked by this system.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  protected updateIntruderPredictions(simTime: number): void {
    this.ownAirplane.update(simTime);

    const len = this.intrudersSorted.length;
    for (let i = 0; i < len; i++) {
      const intruder = this.intrudersSorted[i];
      const sensitivity = this.sensitivity.selectParameters(intruder);

      intruder.updatePrediction(simTime, this.ownAirplane, sensitivity);
    }
  }

  /**
   * Updates the arrays of intruders tracked by this system.
   */
  protected updateIntruderArrays(): void {
    this.intrudersSorted.sort(this.intruderComparator.bind(this));
    const oldCulled = this.intrudersFiltered;

    this.intrudersFiltered = [];
    const len = this.intrudersSorted.length;
    for (let i = 0; i < len && this.intrudersFiltered.length < this.maxIntruderCount; i++) {
      const intruder = this.intrudersSorted[i];
      if (intruder.isPredictionValid && this.filterIntruder(intruder)) {
        this.intrudersFiltered.push(intruder);
        if (!oldCulled.includes(intruder)) {
          this.initIntruder(intruder);
        }
      } else {
        if (oldCulled.includes(intruder)) {
          this.cleanUpIntruder(intruder);
        }
      }
    }
  }

  /**
   * Filters an intruder.
   * @param intruder An intruder.
   * @returns Whether the intruder should be tracked by this TCAS.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected filterIntruder(intruder: I): boolean {
    return true;
  }

  /**
   * Updates the alert levels for all intruders tracked by this system that have not been filtered out.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  protected updateFilteredIntruderAlertLevels(simTime: number): void {
    let taCount = 0, raCount = 0;

    const len = this.intrudersFiltered.length;
    for (let i = 0; i < len; i++) {
      const intruder = this.intrudersFiltered[i];
      this.updateIntruderAlertLevel(simTime, intruder);

      switch (intruder.alertLevel.get()) {
        case TcasAlertLevel.TrafficAdvisory:
          taCount++;
          break;
        case TcasAlertLevel.ResolutionAdvisory:
          raCount++;
          break;
      }
    }

    this.eventPublisher.pub('tcas_ta_intruder_count', taCount, false, true);
    this.eventPublisher.pub('tcas_ra_intruder_count', raCount, false, true);
  }

  protected readonly paSeparationCache = {
    horizontal: UnitType.NMILE.createNumber(0),
    vertical: UnitType.FOOT.createNumber(0)
  };

  /**
   * Updates an intruder's alert level.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   */
  protected updateIntruderAlertLevel(simTime: number, intruder: I): void {
    const currentAlertLevel = intruder.alertLevel.get();

    if (intruder.tcaRA.isValid && intruder.tcaRA.isThreat) {
      if (this.canIssueResolutionAdvisory(simTime, intruder)) {
        intruder.alertLevel.set(TcasAlertLevel.ResolutionAdvisory);
        return;
      } else if (currentAlertLevel === TcasAlertLevel.ResolutionAdvisory && !this.canCancelResolutionAdvisory(simTime, intruder)) {
        return;
      }
    }

    if (
      currentAlertLevel === TcasAlertLevel.ResolutionAdvisory
      && (!intruder.tcaRA.isValid || !intruder.tcaRA.isThreat)
      && !this.canCancelResolutionAdvisory(simTime, intruder)
    ) {
      return;
    }

    if (intruder.tcaTA.isValid && intruder.tcaTA.isThreat) {
      if (this.canIssueTrafficAdvisory(simTime, intruder)) {
        intruder.alertLevel.set(TcasAlertLevel.TrafficAdvisory);
        return;
      } else if (currentAlertLevel === TcasAlertLevel.TrafficAdvisory && !this.canCancelTrafficAdvisory(simTime, intruder)) {
        return;
      }
    }

    if (
      currentAlertLevel === TcasAlertLevel.TrafficAdvisory
      && (!intruder.tcaTA.isValid || !intruder.tcaTA.isThreat)
      && !this.canCancelTrafficAdvisory(simTime, intruder)
    ) {
      return;
    }

    if (intruder.isPredictionValid) {
      const parametersPA = this.sensitivity.selectParameters(intruder).parametersPA;
      const radius = parametersPA.protectedRadius;
      const height = parametersPA.protectedHeight;

      if (!radius.isNaN() && !height.isNaN() && this.canIssueProximityAdvisory(simTime, intruder)) {
        intruder.predictSeparation(simTime, this.paSeparationCache.horizontal, this.paSeparationCache.vertical);
        if (
          this.paSeparationCache.horizontal.compare(parametersPA.protectedRadius) <= 0
          && this.paSeparationCache.vertical.compare(parametersPA.protectedHeight) <= 0
        ) {
          intruder.alertLevel.set(TcasAlertLevel.ProximityAdvisory);
          return;
        }
      }
    }

    if (currentAlertLevel === TcasAlertLevel.ProximityAdvisory && !this.canCancelProximityAdvisory(simTime, intruder)) {
      return;
    }

    intruder.alertLevel.set(TcasAlertLevel.None);
  }

  /**
   * Checks whether a resolution advisory can be issued for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a resolution advisory can be issued for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canIssueResolutionAdvisory(simTime: number, intruder: I): boolean {
    return this.operatingModeSub.get() === TcasOperatingMode.TA_RA
      && intruder.tcaRA.isValid
      && intruder.tcaRA.tcpa.number > 0
      && this.resolutionAdvisoryHost.canIssueResolutionAdvisory(simTime, intruder);
  }

  /**
   * Checks whether a resolution advisory can be canceled for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a resolution advisory can be issued for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canCancelResolutionAdvisory(simTime: number, intruder: I): boolean {
    return this.operatingModeSub.get() !== TcasOperatingMode.TA_RA
      || this.resolutionAdvisoryHost.canCancelResolutionAdvisory(simTime);
  }

  /**
   * Checks whether a traffic advisory can be issued for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a traffic advisory can be issued for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canIssueTrafficAdvisory(simTime: number, intruder: I): boolean {
    return true;
  }

  /**
   * Checks whether a traffic advisory can be canceled for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a traffic advisory can be canceled for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canCancelTrafficAdvisory(simTime: number, intruder: I): boolean {
    return true;
  }

  /**
   * Checks whether a proximity advisory can be issued for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a proximity advisory can be issued for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canIssueProximityAdvisory(simTime: number, intruder: I): boolean {
    return true;
  }

  /**
   * Checks whether a proximity advisory can be canceled for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder An intruder.
   * @returns Whether a proximity advisory can be canceled for the intruder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canCancelProximityAdvisory(simTime: number, intruder: I): boolean {
    return true;
  }

  /**
   * Updates this TCAS's resolution advisory.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  protected updateResolutionAdvisory(simTime: number): void {
    if (this.operatingModeSub.get() === TcasOperatingMode.TA_RA) {
      this.resolutionAdvisoryHost.update(simTime, this.sensitivity.selectRAAlim(this.intrudersRA), this.intrudersRA);
    } else {
      this.resolutionAdvisoryHost.cancel(simTime);
    }
  }

  /**
   * Executes initialization code when an intruder is added.
   * @param intruder The newly added intruder.
   */
  private initIntruder(intruder: I): void {
    this.alertLevelSubs.set(intruder, intruder.alertLevel.sub(this.onAlertLevelChanged.bind(this, intruder)));
    this.eventPublisher.pub('tcas_intruder_added', intruder, false, false);
  }

  /**
   * Executes cleanup code when an intruder is removed.
   * @param intruder The intruder that was removed.
   */
  private cleanUpIntruder(intruder: I): void {
    if (intruder.alertLevel.get() === TcasAlertLevel.ResolutionAdvisory) {
      this.intrudersRA.delete(intruder);
    }

    this.alertLevelSubs.get(intruder)?.destroy();
    this.eventPublisher.pub('tcas_intruder_removed', intruder, false, false);
  }

  /**
   * A callback which is called when an intruder's alert level changes.
   * @param intruder The intruder whose alert level changed.
   */
  private onAlertLevelChanged(intruder: I): void {
    if (intruder.alertLevel.get() === TcasAlertLevel.ResolutionAdvisory) {
      this.intrudersRA.add(intruder);
    } else {
      this.intrudersRA.delete(intruder);
    }

    this.eventPublisher.pub('tcas_intruder_alert_changed', intruder, false, false);
  }
}

/**
 * Subscribables which provide data related to the own airplane.
 */
type TcasOwnAirplaneSubs = {
  /** A subscribable which provides the own airplane's position. */
  position: Subscribable<GeoPointInterface>;

  /** A subscribable which provides the own airplane's altitude. */
  altitude: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** A subscribable which provides the own airplane's ground track. */
  groundTrack: Subscribable<number>;

  /** A subscribable which provides the own airplane's ground speed. */
  groundSpeed: Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** A subscribable which provides the own airplane's vertical speed. */
  verticalSpeed: Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** A subscribable which provides the own airplane's radar altitude. */
  radarAltitude: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** A subscribable which provides whether the own airplane is on the ground. */
  isOnGround: Subscribable<boolean>;
};

/**
 * An airplane managed by TCAS.
 */
abstract class TcasAirplane {
  protected readonly _position = new GeoPoint(0, 0);
  /** The position of this airplane at the time of the most recent update. */
  public readonly position = this._position.readonly;

  /** The altitude of this airplane at the time of the most recent update. */
  protected readonly _altitude = UnitType.FOOT.createNumber(0);
  public readonly altitude = this._altitude.readonly;

  protected _groundTrack = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /** The true ground track of this airplane at the time of the most recent update. */
  public get groundTrack(): number {
    return this._groundTrack;
  }

  /** The ground speed of this airplane at the time of the most recent update. */
  protected readonly _groundSpeed = UnitType.KNOT.createNumber(0);
  public readonly groundSpeed = this._groundSpeed.readonly;

  /** The vertical speed of this airplane at the time of the most recent update. */
  protected readonly _verticalSpeed = UnitType.FPM.createNumber(0);
  public readonly verticalSpeed = this._verticalSpeed.readonly;

  /**
   * The 3D position vector of this airplane at the time of the last update. Each component is expressed in units of
   * meters. The coordinate system is an Euclidean approximation of the geodetic space around the own airplane such
   * that the z-coordinate represents orthometric height and the x- and y-coordinates represent an east-
   * counterclockwise equirectangular projection of latitude and longitude, with the origin at the location of the own
   * airplane.
   */
  public readonly positionVec = new Float64Array(3);

  /**
   * The 3D velocity vector of this airplane at the time of the last update. Each component is expressed in units of
   * meters per second. The coordinate system is defined the same as for position vectors.
   */
  public readonly velocityVec = new Float64Array(3);

  protected lastUpdateTime = 0;
}

/**
 * The own airplane managed by TCAS.
 */
class OwnAirplane extends TcasAirplane {
  /** The radar altitude of this airplane at the time of the most recent update. */
  protected readonly _radarAltitude = UnitType.FOOT.createNumber(0);
  public readonly radarAltitude = this._radarAltitude.readonly;

  private _isOnGround = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this airplane is on the ground. */
  public get isOnGround(): boolean {
    return this._isOnGround;
  }

  /**
   * Constructor.
   * @param subs Subscribables which provide data related to this airplane.
   */
  constructor(private readonly subs: TcasOwnAirplaneSubs) {
    super();
  }

  /**
   * Calculates the predicted 3D position vector of this airplane at a specified time based on the most recent
   * available data. Each component of the vector is expressed in units of meters, and the origin lies at the most
   * recent updated position of this airplane.
   * @param simTime The sim time at which to calculate the position, as a UNIX timestamp in milliseconds.
   * @param out A Float64Array object to which to write the result.
   * @returns The predicted position vector of this airplane at the specified time.
   */
  public predictPosition(simTime: number, out: Float64Array): Float64Array {
    const dt = (simTime - this.lastUpdateTime) / 1000;
    return Vec3Math.add(this.positionVec, Vec3Math.multScalar(this.velocityVec, dt, out), out);
  }

  /**
   * Updates this airplane's position and velocity data.
   * @param simTime The current sim time, as a UNIX millisecond timestamp.
   */
  public update(simTime: number): void {
    this.updateParameters();
    this.updateVectors();
    this.lastUpdateTime = simTime;
  }

  /**
   * Updates this airplane's position, altitude, ground track, ground speed, vertical speed, and whether it is on the ground.
   */
  private updateParameters(): void {
    this._position.set(this.subs.position.get());
    this._altitude.set(this.subs.altitude.get());
    this._groundTrack = this.subs.groundTrack.get();
    this._groundSpeed.set(this.subs.groundSpeed.get());
    this._verticalSpeed.set(this.subs.verticalSpeed.get());
    this._radarAltitude.set(this.subs.radarAltitude.get());
    this._isOnGround = this.subs.isOnGround.get();
  }

  /**
   * Updates this airplane's position and velocity vectors.
   */
  private updateVectors(): void {
    Vec2Math.setFromPolar(this._groundSpeed.asUnit(UnitType.MPS), (90 - this._groundTrack) * Avionics.Utils.DEG2RAD, this.velocityVec);
    const verticalVelocity = this._verticalSpeed.asUnit(UnitType.MPS);
    this.velocityVec[2] = verticalVelocity;
  }
}

/**
 * An abstract implementation of {@link TcasIntruder}.
 */
export abstract class AbstractTcasIntruder extends TcasAirplane implements TcasIntruder {
  private static readonly MIN_GROUND_SPEED = UnitType.KNOT.createNumber(30);

  private static readonly vec3Cache = [new Float64Array(3), new Float64Array(3)];

  public readonly alertLevel = Subject.create(TcasAlertLevel.None);

  /** The 3D position vector of this intruder relative to own airplane. */
  public readonly relativePositionVec = new Float64Array(3);

  /** The 3D velocity vector of this intruder relative to own airplane. */
  public readonly relativeVelocityVec = new Float64Array(3);

  private _isPredictionValid = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether there is a valid prediction for time of closest approach between this intruder and own airplane. */
  public get isPredictionValid(): boolean {
    return this._isPredictionValid;
  }

  /** @inheritdoc */
  public readonly tcaTA: TcasTcaPredictionClass = new TcasTcaPredictionClass(this);

  /** @inheritdoc */
  public readonly tcaRA: TcasTcaPredictionClass = new TcasTcaPredictionClass(this);

  /**
   * Constructor.
   * @param contact The traffic contact associated with this intruder.
   */
  constructor(public readonly contact: TrafficContact) {
    super();
  }

  /** @inheritdoc */
  public predictDisplacement(simTime: number, out: Float64Array): Float64Array {
    if (!this._isPredictionValid) {
      return Vec3Math.set(NaN, NaN, NaN, out);
    }

    const dt = (simTime - this.contact.lastContactTime) / 1000;
    return Vec3Math.add(this.relativePositionVec, Vec3Math.multScalar(this.relativeVelocityVec, dt, out), out);
  }

  /** @inheritdoc */
  public predictSeparation(simTime: number, horizontalOut: NumberUnit<UnitFamily.Distance>, verticalOut: NumberUnit<UnitFamily.Distance>): void {
    if (!this._isPredictionValid) {
      horizontalOut.set(NaN);
      verticalOut.set(NaN);
      return;
    }

    const displacement = this.predictDisplacement(simTime, AbstractTcasIntruder.vec3Cache[0]);
    AbstractTcasIntruder.displacementToHorizontalSeparation(displacement, horizontalOut);
    AbstractTcasIntruder.displacementToVerticalSeparation(displacement, verticalOut);
  }

  /**
   * Updates this intruder's predicted TCA and related data.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplane Own airplane.
   * @param sensitivity The TCAS sensitivity parameters to use when calculating predictions.
   */
  public updatePrediction(
    simTime: number,
    ownAirplane: OwnAirplane,
    sensitivity: TcasSensitivityParameters
  ): void {
    this.updateParameters(simTime, ownAirplane);

    if (this.isPredictionValid) {
      const taParams = sensitivity.parametersTA;
      const raParams = sensitivity.parametersRA;
      this.tcaTA.update(simTime, taParams.tau, taParams.protectedRadius, taParams.protectedHeight, taParams.hmd);
      this.tcaRA.update(simTime, raParams.tau, raParams.protectedRadius, raParams.protectedHeight, raParams.hmd);
    } else {
      this.invalidatePredictions();
    }

    this.lastUpdateTime = simTime;
  }

  /**
   * Updates this intruder's position and velocity data.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplane The own airplane.
   */
  private updateParameters(simTime: number, ownAirplane: OwnAirplane): void {
    if (isNaN(this.contact.groundTrack) || this.contact.groundSpeed.compare(AbstractTcasIntruder.MIN_GROUND_SPEED) < 0) {
      this._isPredictionValid = false;
      this._position.set(NaN, NaN);
      this._altitude.set(NaN);
      this._groundTrack = NaN;
      this._groundSpeed.set(NaN);
      this._verticalSpeed.set(NaN);
      Vec3Math.set(NaN, NaN, NaN, this.positionVec);
      Vec3Math.set(NaN, NaN, NaN, this.velocityVec);
      Vec3Math.set(NaN, NaN, NaN, this.relativePositionVec);
      Vec3Math.set(NaN, NaN, NaN, this.relativeVelocityVec);
    } else {
      this.updatePosition(simTime, ownAirplane);
      this.updateVelocity(ownAirplane);
      this._groundSpeed.set(this.contact.groundSpeed);
      this._verticalSpeed.set(this.contact.verticalSpeed);
      this._isPredictionValid = true;
    }
  }

  /**
   * Updates this intruder's position.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplane The own airplane.
   */
  private updatePosition(simTime: number, ownAirplane: OwnAirplane): void {
    this.contact.predict(simTime, this._position, this._altitude);
    this._groundTrack = this._position.equals(this.contact.lastPosition) ? this.contact.groundTrack : this._position.bearingFrom(this.contact.lastPosition);

    const distance = UnitType.GA_RADIAN.convertTo(this._position.distance(ownAirplane.position), UnitType.METER);
    const bearing = ownAirplane.position.bearingTo(this._position);
    Vec2Math.setFromPolar(distance, (90 - bearing) * Avionics.Utils.DEG2RAD, this.positionVec);
    const verticalPosition = this._altitude.asUnit(UnitType.METER) - ownAirplane.altitude.asUnit(UnitType.METER);
    this.positionVec[2] = verticalPosition;

    Vec3Math.sub(this.positionVec, ownAirplane.positionVec, this.relativePositionVec);
  }

  /**
   * Updates this intruder's velocity.
   * @param ownAirplane The own airplane.
   */
  private updateVelocity(ownAirplane: OwnAirplane): void {
    Vec2Math.setFromPolar(this.contact.groundSpeed.asUnit(UnitType.MPS), (90 - this.contact.groundTrack) * Avionics.Utils.DEG2RAD, this.velocityVec);
    const verticalVelocity = this.contact.verticalSpeed.asUnit(UnitType.MPS);
    this.velocityVec[2] = verticalVelocity;

    Vec3Math.sub(this.velocityVec, ownAirplane.velocityVec, this.relativeVelocityVec);
  }

  /**
   * Invalidates this intruder's predicted TCA and related data.
   */
  private invalidatePredictions(): void {
    this.tcaTA.invalidate();
    this.tcaRA.invalidate();
  }

  /**
   * Converts a 3D displacement vector to a horizontal separation distance.
   * @param displacement A displacement vector, in meters.
   * @param out A NumberUnit object to which to write the result.
   * @returns The horizontal separation distance corresponding to the displacement vector.
   */
  public static displacementToHorizontalSeparation(displacement: Float64Array, out: NumberUnit<UnitFamily.Distance>): NumberUnit<UnitFamily.Distance> {
    return out.set(Math.hypot(displacement[0], displacement[1]), UnitType.METER);
  }

  /**
   * Converts a 3D displacement vector to a vertical separation distance.
   * @param displacement A displacement vector, in meters.
   * @param out A NumberUnit object to which to write the result.
   * @returns The vertical separation distance corresponding to the displacement vector.
   */
  public static displacementToVerticalSeparation(displacement: Float64Array, out: NumberUnit<UnitFamily.Distance>): NumberUnit<UnitFamily.Distance> {
    return out.set(Math.abs(displacement[2]), UnitType.METER);
  }
}

/**
 * An default implementation of {@link TcasIntruder}.
 */
export class DefaultTcasIntruder extends AbstractTcasIntruder {
}

/**
 * A time-of-closest-approach prediction made by TCAS.
 */
class TcasTcaPredictionClass implements TcasTcaPrediction {
  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2)];

  private _isValid = false;
  /** @inheritdoc */
  public get isValid(): boolean {
    return this._isValid;
  }

  private _time = NaN;
  /** @inheritdoc */
  public get time(): number {
    return this._time;
  }

  private readonly _tcpa = UnitType.SECOND.createNumber(NaN);
  /** @inheritdoc */
  public readonly tcpa = this._tcpa.readonly;

  private readonly _tcoa = UnitType.SECOND.createNumber(NaN);
  /** @inheritdoc */
  public readonly tcoa = this._tcoa.readonly;

  private _isThreat = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** @inheritdoc */
  public get isThreat(): boolean {
    return this._isThreat;
  }

  /** @inheritdoc */
  public readonly cpaDisplacement = new Float64Array(3);

  private readonly _cpaHorizontalSep = UnitType.NMILE.createNumber(0);
  /** @inheritdoc */
  public readonly cpaHorizontalSep = this._cpaHorizontalSep.readonly;

  private readonly _cpaVerticalSep = UnitType.FOOT.createNumber(0);
  /** @inheritdoc */
  public readonly cpaVerticalSep = this._cpaVerticalSep.readonly;

  private _cpaNorm = NaN;
  // eslint-disable-next-line jsdoc/require-returns
  /** @inheritdoc */
  public get cpaNorm(): number {
    return this._cpaNorm;
  }

  /**
   * Constructor.
   * @param intruder The intruder associated with this prediction.
   */
  constructor(private readonly intruder: TcasIntruder) {
  }

  /**
   * Updates the time-to-closest-approach (TCA) and related data of this intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param tau The maximum lookahead time.
   * @param dmod The radius of the own airplane's protected volume.
   * @param zthr The half-height of the own airplane's protected volume.
   * @param hmd The distance threshold for the horizontal miss distance filter. If not defined, the HMD filter will
   * not be applied.
   */
  public update(
    simTime: number,
    tau: NumberUnitInterface<UnitFamily.Duration>,
    dmod: NumberUnitInterface<UnitFamily.Distance>,
    zthr: NumberUnitInterface<UnitFamily.Distance>,
    hmd?: NumberUnitInterface<UnitFamily.Distance>
  ): void {
    this._time = simTime;

    if (tau.isNaN() || dmod.isNaN() || zthr.isNaN() || (hmd?.isNaN() ?? false)) {
      this.invalidate();
      return;
    }

    // Source: Munoz, CA and Narkawicz, AJ. "A TCAS-II Resolution Advisory Detection Algorithm."
    // https://ntrs.nasa.gov/api/citations/20140002736/downloads/20140002736.pdf

    const tauSeconds = tau.asUnit(UnitType.SECOND);
    const s = this.intruder.relativePositionVec;
    const v = this.intruder.relativeVelocityVec;
    const sHoriz = Vec2Math.set(s[0], s[1], TcasTcaPredictionClass.vec2Cache[0]);
    const vHoriz = Vec2Math.set(v[0], v[1], TcasTcaPredictionClass.vec2Cache[1]);
    const h = zthr.asUnit(UnitType.METER);
    const r = dmod.asUnit(UnitType.METER);

    const vHorizSquared = Vec2Math.dot(vHoriz, vHoriz);
    const sHorizSquared = Vec2Math.dot(sHoriz, sHoriz);
    const dotSHorizVHoriz = Vec2Math.dot(vHoriz, sHoriz);

    const rSquared = r * r;

    // Time to closest horizontal approach
    const tcpa = vHorizSquared === 0 ? 0 : -dotSHorizVHoriz / vHorizSquared;

    // Modified tau
    const tauMod = dotSHorizVHoriz >= 0 ? Infinity : (rSquared - sHorizSquared) / dotSHorizVHoriz;

    // Time to co-altitude
    const tcoa = -s[2] / v[2];

    const isHorizontalThreat = sHorizSquared <= rSquared || tauMod <= tauSeconds;
    const isVerticalThreat = Math.abs(s[2]) <= h || (tcoa >= 0 && tcoa <= tauSeconds);

    let passHmdFilter = true;
    if (hmd !== undefined && isHorizontalThreat && isVerticalThreat) {
      const d = hmd.asUnit(UnitType.METER);
      const dSquared = d * d;

      if (vHorizSquared === 0) {
        passHmdFilter = sHorizSquared <= dSquared;
      } else {
        const delta = dSquared * vHorizSquared - Vec2Math.dot(sHoriz, Vec2Math.normal(vHoriz, TcasTcaPredictionClass.vec2Cache[1]));
        if (delta < 0) {
          passHmdFilter = false;
        } else {
          const a = vHorizSquared;
          const b = 2 * dotSHorizVHoriz;
          const c = sHorizSquared - dSquared;
          const discriminant = b * b - 4 * a * c;

          if (discriminant < 0) {
            passHmdFilter = false;
          } else {
            passHmdFilter = (-b + Math.sqrt(discriminant)) / (2 * a) >= 0;
          }
        }
      }
    }

    this._isThreat = isHorizontalThreat && isVerticalThreat && passHmdFilter;
    this._tcpa.set(tcpa);
    this._tcoa.set(tcoa);

    TcasTcaPredictionClass.calculateDisplacementVector(s, v, tcpa, this.cpaDisplacement);
    AbstractTcasIntruder.displacementToHorizontalSeparation(this.cpaDisplacement, this._cpaHorizontalSep);
    AbstractTcasIntruder.displacementToVerticalSeparation(this.cpaDisplacement, this._cpaVerticalSep);

    this._cpaNorm = TcasTcaPredictionClass.calculateCylindricalNorm(this.cpaDisplacement, r, h);

    this._isValid = true;
  }

  /**
   * Invalidates this intruder's predicted TCA and related data.
   */
  public invalidate(): void {
    this._isValid = false;
    this._isThreat = false;
    this._tcpa.set(NaN);
    this._tcoa.set(NaN);
    Vec3Math.set(NaN, NaN, NaN, this.cpaDisplacement);
    this._cpaHorizontalSep.set(NaN);
    this._cpaVerticalSep.set(NaN);
    this._cpaNorm = NaN;
  }

  /**
   * Calculates a time-offset displacement vector given an initial displacement, a velocity vector, and elapsed time.
   * @param initial The initial displacement vector.
   * @param velocity A velocity vector.
   * @param elapsedTime The elapsed time.
   * @param out A Float64Array object to which to write the result.
   * @returns The time-offset displacement vector.
   */
  private static calculateDisplacementVector(initial: ReadonlyFloat64Array, velocity: ReadonlyFloat64Array, elapsedTime: number, out: Float64Array): Float64Array {
    return Vec3Math.add(initial, Vec3Math.multScalar(velocity, elapsedTime, out), out);
  }

  /**
   * Calculates a cylindrical norm.
   * @param vector A displacement vector.
   * @param radius The radius of the protected zone.
   * @param halfHeight The half-height of the protected zone.
   * @returns A cylindrical norm.
   */
  private static calculateCylindricalNorm(vector: ReadonlyFloat64Array, radius: number, halfHeight: number): number {
    const horizLength = Math.hypot(vector[0], vector[1]);
    return Math.max(Math.abs(vector[2]) / halfHeight, horizLength / radius);
  }
}

/**
 * Vertical speed constraints for a resolution advisory intruder calculated by a resolution advisory host.
 */
type VerticalSpeedConstraint = {
  /**
   * The required minimum vertical speed, in meters per second, for the own airplane to achieve vertical separation
   * above the intruder exactly equal to ALIM at time of closest approach. The speed is calculated assuming vertical
   * acceleration was initiated in response to the last issued resolution advisory, or a hypothetical resolution
   * advisory issued at the present time if there is no existing resolution advisory.
   */
  above: number;

  /**
   * The required maximum vertical speed, in meters per second, for the own airplane to achieve vertical separation
   * below the intruder exactly equal to ALIM at time of closest approach. The speed is calculated assuming vertical
   * acceleration was initiated in response to the last issued resolution advisory, or a hypothetical resolution
   * advisory issued at the present time if there is no existing resolution advisory.
   */
  below: number;
}

/**
 * A description of a resolution advisory type.
 */
type ResolutionAdvisoryTypeDefinition = {
  /** The flags associated with the type. */
  flags: number;

  /** The type's minimum vertical speed, in feet per minute. */
  minVerticalSpeed: number;

  /** The type's maximum vertical speed, in feet per minute. */
  maxVerticalSpeed: number;
};

/**
 * An implementation of {@link TcasResolutionAdvisoryHost}.
 */
class TcasResolutionAdvisoryHostClass implements TcasResolutionAdvisoryHost {
  /** The base amount of delay between state changes, in milliseconds, before predicted response time is taken into account. */
  private static readonly STATE_CHANGE_DELAY_BASE = 5000;

  private static readonly CLIMB_DESC_VS_MPS = UnitType.FPM.convertTo(1500, UnitType.MPS);
  private static readonly INC_CLIMB_DESC_VS_MPS = UnitType.FPM.convertTo(2500, UnitType.MPS);

  private static readonly INTRUDER_SORT_FUNC = (a: TcasIntruder, b: TcasIntruder): number => {
    const tcpaComparison = a.tcaRA.tcpa.compare(b.tcaRA.tcpa);
    if (tcpaComparison < 0) {
      return -1;
    } else if (tcpaComparison > 0) {
      return 1;
    } else if (a.tcaRA.cpaNorm < b.tcaRA.cpaNorm) {
      return -1;
    } else if (a.tcaRA.cpaNorm > b.tcaRA.cpaNorm) {
      return 1;
    } else {
      return 0;
    }
  };

  private static readonly TYPE_DEFS: Record<TcasResolutionAdvisoryType, ResolutionAdvisoryTypeDefinition> = {
    [TcasResolutionAdvisoryType.Clear]: {
      flags: 0,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: Infinity
    },

    [TcasResolutionAdvisoryType.Climb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: 1500,
      maxVerticalSpeed: 2000
    },
    [TcasResolutionAdvisoryType.MaintainClimb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb,
      minVerticalSpeed: 1500,
      maxVerticalSpeed: 4400
    },
    [TcasResolutionAdvisoryType.CrossingClimb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Crossing | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: 1500,
      maxVerticalSpeed: 2000
    },
    [TcasResolutionAdvisoryType.CrossingMaintainClimb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Crossing,
      minVerticalSpeed: 1500,
      maxVerticalSpeed: 4400
    },
    [TcasResolutionAdvisoryType.IncreaseClimb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Increase | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: 2500,
      maxVerticalSpeed: 3000
    },
    [TcasResolutionAdvisoryType.ReversalClimb]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Reversal | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: 1500,
      maxVerticalSpeed: 2000
    },
    [TcasResolutionAdvisoryType.ReduceDescent]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.ReduceDescent | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: 0,
      maxVerticalSpeed: Infinity
    },
    [TcasResolutionAdvisoryType.DoNotDescend0]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.DoNotDescend,
      minVerticalSpeed: 0,
      maxVerticalSpeed: Infinity
    },
    [TcasResolutionAdvisoryType.DoNotDescend500]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.DoNotDescend,
      minVerticalSpeed: -500,
      maxVerticalSpeed: Infinity
    },
    [TcasResolutionAdvisoryType.DoNotDescend1000]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.DoNotDescend,
      minVerticalSpeed: -1000,
      maxVerticalSpeed: Infinity
    },
    [TcasResolutionAdvisoryType.DoNotDescend1500]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.DoNotDescend,
      minVerticalSpeed: -1500,
      maxVerticalSpeed: Infinity
    },
    [TcasResolutionAdvisoryType.DoNotDescend2000]: {
      flags: TcasResolutionAdvisoryFlags.UpSense | TcasResolutionAdvisoryFlags.DoNotDescend,
      minVerticalSpeed: -2000,
      maxVerticalSpeed: Infinity
    },

    [TcasResolutionAdvisoryType.Descend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: -2000,
      maxVerticalSpeed: -1500
    },
    [TcasResolutionAdvisoryType.MaintainDescend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend,
      minVerticalSpeed: -4400,
      maxVerticalSpeed: -1500
    },
    [TcasResolutionAdvisoryType.CrossingDescend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend | TcasResolutionAdvisoryFlags.Crossing | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: -2000,
      maxVerticalSpeed: -1500
    },
    [TcasResolutionAdvisoryType.CrossingMaintainDescend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend | TcasResolutionAdvisoryFlags.Crossing,
      minVerticalSpeed: -4400,
      maxVerticalSpeed: -1500
    },
    [TcasResolutionAdvisoryType.IncreaseDescend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend | TcasResolutionAdvisoryFlags.Increase | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: -3000,
      maxVerticalSpeed: -2500
    },
    [TcasResolutionAdvisoryType.ReversalDescend]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.Descend | TcasResolutionAdvisoryFlags.Reversal | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: -2000,
      maxVerticalSpeed: -1500
    },
    [TcasResolutionAdvisoryType.ReduceClimb]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.ReduceClimb | TcasResolutionAdvisoryFlags.Corrective,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 0
    },
    [TcasResolutionAdvisoryType.DoNotClimb0]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.DoNotClimb,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 0
    },
    [TcasResolutionAdvisoryType.DoNotClimb500]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.DoNotClimb,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 500
    },
    [TcasResolutionAdvisoryType.DoNotClimb1000]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.DoNotClimb,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 1000
    },
    [TcasResolutionAdvisoryType.DoNotClimb1500]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.DoNotClimb,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 1500
    },
    [TcasResolutionAdvisoryType.DoNotClimb2000]: {
      flags: TcasResolutionAdvisoryFlags.DownSense | TcasResolutionAdvisoryFlags.DoNotClimb,
      minVerticalSpeed: -Infinity,
      maxVerticalSpeed: 2000
    },
  };

  private static readonly vec3Cache = [new Float64Array(3)];

  private readonly initialResponseTimeSeconds = this.options.initialResponseTime.asUnit(UnitType.SECOND);
  private readonly initialAccelMps = this.options.initialAcceleration.asUnit(UnitType.MPS_PER_SEC);

  private readonly subsequentResponseTimeSeconds = this.options.subsequentResponseTime.asUnit(UnitType.SECOND);
  private readonly subsequentAccelMps = this.options.subsequentAcceleration.asUnit(UnitType.MPS_PER_SEC);

  private readonly intruders = new Set<TcasIntruder>();
  public readonly intruderArray: TcasIntruder[] = [];

  private readonly _maxVerticalSpeed = UnitType.FPM.createNumber(NaN);
  /** @inheritdoc */
  public readonly maxVerticalSpeed = this._maxVerticalSpeed.readonly;

  private readonly _minVerticalSpeed = UnitType.FPM.createNumber(NaN);
  /** @inheritdoc */
  public readonly minVerticalSpeed = this._minVerticalSpeed.readonly;

  private _flags = 0;
  /** @inheritdoc */
  public get flags(): number {
    return this._flags;
  }

  private _primaryType = TcasResolutionAdvisoryType.Clear;
  /** @inheritdoc */
  public get primaryType(): TcasResolutionAdvisoryType {
    return this._primaryType;
  }

  private _secondaryType: TcasResolutionAdvisoryType | null = null;
  /** @inheritdoc */
  public get secondaryType(): TcasResolutionAdvisoryType | null {
    return this._secondaryType;
  }

  private _primaryFlags = 0;
  /** @inheritdoc */
  public get primaryFlags(): number {
    return this._primaryFlags;
  }

  private _secondaryFlags = 0;
  /** @inheritdoc */
  public get secondaryFlags(): number {
    return this._secondaryFlags;
  }

  private readonly vsConstraints: VerticalSpeedConstraint[] = [];

  private lastStateChangeTime = 0;
  private stateChangeDelay = 0;

  private isInitial = true;

  private senseReversalCount = 0;

  private readonly publisher: Publisher<TcasEvents>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param options Options to adjust how the host should calculate resolution advisories.
   * @param ownAirplane The own airplane.
   */
  constructor(bus: EventBus, private readonly options: TcasResolutionAdvisoryOptions, private readonly ownAirplane: OwnAirplane) {
    this.publisher = bus.getPublisher<TcasEvents>();
  }

  /**
   * Checks whether this host can issue a resolution advisory for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param intruder The query intruder.
   * @returns Whether this host can issue a resolution advisory for an intruder.
   */
  public canIssueResolutionAdvisory(simTime: number, intruder: TcasIntruder): boolean {
    // Inhibit resolution advisories for intruders whose time to closest horizontal approach is less than or equal to
    // zero (indicating the closest point of approach has already been passed) and whose horizontal separation from the
    // own airplane is increasing.
    if (intruder.tcaRA.tcpa.number <= 0 && Vec2Math.dot(intruder.relativeVelocityVec, intruder.relativePositionVec) > 0) {
      return false;
    }

    if (this._primaryType !== TcasResolutionAdvisoryType.Clear) {
      return true;
    }

    const lastStateChangeTime = Math.min(simTime, this.lastStateChangeTime);
    return simTime - lastStateChangeTime >= this.stateChangeDelay;
  }

  /**
   * Checks whether this host can cancel a resolution advisory for an intruder.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @returns Whether this host can cancel a resolution advisory for an intruder.
   */
  public canCancelResolutionAdvisory(simTime: number): boolean {
    if (this._primaryType === TcasResolutionAdvisoryType.Clear) {
      return true;
    }

    const lastStateChangeTime = Math.min(simTime, this.lastStateChangeTime);
    return simTime - lastStateChangeTime >= this.stateChangeDelay;
  }

  /**
   * Updates this host's resolution advisory.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param alim The required vertical separation between own airplane and intruders.
   * @param intruders The set of active intruders to be tracked by the resolution advisory.
   */
  public update(simTime: number, alim: NumberUnitInterface<UnitFamily.Distance>, intruders: ReadonlySet<TcasIntruder>): void {
    if (this.intruderArray.length === 0 && intruders.size === 0) {
      return;
    }

    if (simTime < this.lastStateChangeTime) {
      this.lastStateChangeTime = simTime;
    }

    if (simTime - this.lastStateChangeTime < this.stateChangeDelay) {
      return;
    }

    if (intruders.size === 0) {
      this.cancel(simTime);
    } else {
      const isInitial = this._primaryType === TcasResolutionAdvisoryType.Clear;
      const ownAirplaneVsMps = this.ownAirplane.verticalSpeed.asUnit(UnitType.MPS);
      const alimMeters = alim.asUnit(UnitType.METER);
      const responseTimeSeconds = this.isInitial ? this.initialResponseTimeSeconds : this.subsequentResponseTimeSeconds;
      const responseTimeSecondsRemaining = isInitial
        ? responseTimeSeconds
        : MathUtils.clamp(responseTimeSeconds - (simTime - this.lastStateChangeTime) / 1000, 0, responseTimeSeconds);
      const accelMps = this.isInitial ? this.initialAccelMps : this.subsequentAccelMps;

      this.updateIntruders(intruders);
      this.updateVsConstraints(alimMeters, responseTimeSecondsRemaining, accelMps);

      if (isInitial) {
        this.selectInitialState(simTime, ownAirplaneVsMps);
      } else {
        if (BitFlags.isAny(this._primaryFlags, TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Descend)) {
          this.updatePositive(simTime);
        } else if (this._secondaryType === null) {
          this.updateNegative(simTime, ownAirplaneVsMps);
        } else {
          this.updateComposite(simTime, ownAirplaneVsMps);
        }
      }
    }
  }

  /**
   * Updates this host's resolution advisory's array of active intruders.
   * @param intruders The set of active intruders to be tracked by the resolution advisory.
   */
  private updateIntruders(intruders: ReadonlySet<TcasIntruder>): void {
    // Remove one sense reversal used for every intruder that was removed from the RA.
    for (let i = 0; i < this.intruderArray.length; i++) {
      if (!intruders.has(this.intruderArray[i])) {
        this.senseReversalCount = Math.max(this.senseReversalCount - 1, 0);
      }
    }

    this.intruders.clear();
    this.intruderArray.length = 0;

    for (const intruder of intruders) {
      this.intruders.add(intruder);
      this.intruderArray.push(intruder);
    }

    this.intruderArray.sort(TcasResolutionAdvisoryHostClass.INTRUDER_SORT_FUNC);
  }

  /**
   * Updates the vertical speed constraints associated with the intruders participating in this host's current
   * resolution advisory.
   * @param alimMeters The value of ALIM (the minimum desired vertical separation between the own airplane and an
   * intruder at time of closest approach), in meters.
   * @param responseTimeSeconds The predicted amount of time, in seconds, for the own airplane to respond to the most
   * recently issued resolution advisory, relative to the present.
   * @param accelMps The predicted vertical acceleration, in meters per second squared, of the own airplane when
   * responding to the most recently issued resolution advisory.
   */
  private updateVsConstraints(
    alimMeters: number,
    responseTimeSeconds: number,
    accelMps: number
  ): void {
    const ownAirplaneVsMps = this.ownAirplane.verticalSpeed.asUnit(UnitType.MPS);

    for (let i = 0; i < this.intruderArray.length; i++) {
      const intruder = this.intruderArray[i];

      let above = -Infinity;
      let below = Infinity;

      if (intruder.tcaRA.isValid) {
        const t0 = intruder.tcaRA.time;
        const tcpaSeconds = intruder.tcaRA.tcpa.asUnit(UnitType.SECOND);
        const tcpaTime = intruder.tcaRA.time + tcpaSeconds * 1000;

        const ownAirplaneAltMeters = this.ownAirplane.predictPosition(t0, TcasResolutionAdvisoryHostClass.vec3Cache[0])[2];

        const intruderTcaAltMeters = ownAirplaneAltMeters + tcpaSeconds * ownAirplaneVsMps + intruder.tcaRA.cpaDisplacement[2];
        const ownAirplaneAltTcaMeters = this.ownAirplane.predictPosition(tcpaTime, TcasResolutionAdvisoryHostClass.vec3Cache[0])[2];

        // The altitude own airplane needs to be above in order to pass above the intruder with ALIM vertical separation at CPA.
        const aboveAltTargetMeters = intruderTcaAltMeters + alimMeters;
        // The altitude own airplane needs to be below in order to pass below the intruder with ALIM vertical separation at CPA.
        const belowAltTargetMeters = intruderTcaAltMeters - alimMeters;

        const aboveAlimSense = Math.sign(aboveAltTargetMeters - ownAirplaneAltTcaMeters);
        const belowAlimSense = Math.sign(belowAltTargetMeters - ownAirplaneAltTcaMeters);

        if (aboveAlimSense === 1) {
          // Own airplane needs to adjust vertical speed in the positive direction in order to pass above the intruder with
          // ALIM vertical separation at CPA.
          above = responseTimeSeconds < tcpaSeconds
            ? TcasResolutionAdvisoryHostClass.calculateVSToTargetAlt(tcpaSeconds, ownAirplaneAltMeters, ownAirplaneVsMps, responseTimeSeconds, accelMps, aboveAltTargetMeters)
            : NaN;

          if (isNaN(above)) {
            above = Infinity;
          }
        } else {
          // Own airplane is already on track to pass above the intruder with ALIM vertical separation at CPA.
          above = tcpaSeconds > 0
            ? (aboveAltTargetMeters - ownAirplaneAltMeters) / tcpaSeconds
            : -Infinity;
        }

        if (belowAlimSense === -1) {
          // Own airplane needs to adjust vertical speed in the negative direction in order to pass below the intruder with
          // ALIM vertical separation at CPA
          below = responseTimeSeconds < tcpaSeconds
            ? TcasResolutionAdvisoryHostClass.calculateVSToTargetAlt(tcpaSeconds, ownAirplaneAltMeters, ownAirplaneVsMps, responseTimeSeconds, accelMps, belowAltTargetMeters)
            : NaN;

          if (isNaN(below)) {
            below = -Infinity;
          }
        } else {
          // Own airplane is already on track to pass below the intruder with ALIM vertical separation at CPA.
          below = tcpaSeconds > 0
            ? (belowAltTargetMeters - ownAirplaneAltMeters) / tcpaSeconds
            : Infinity;
        }
      }

      const constraint = this.vsConstraints[i] ??= { above: 0, below: 0 };

      constraint.above = above;
      constraint.below = below;
    }

    this.vsConstraints.length = this.intruderArray.length;
  }

  /**
   * Selects an initial state for a new resolution advisory.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplaneVsMps The current vertical speed of the own airplane, in meters per second.
   */
  private selectInitialState(simTime: number, ownAirplaneVsMps: number): void {
    // We need to first select either upward or downward sense.

    // The minimum vertical speed own airplane can target while still achieving ALIM separation ABOVE all intruders
    let minUpSenseVsMps = this.getUpSenseRequiredMinVs();
    // The maximum vertical speed own airplane can target while still achieving ALIM separation BELOW all intruders
    let maxDownSenseVsMps = this.getDownSenseRequiredMaxVs();

    // The strongest initial upward and downward sense RAs are CLIMB and DESCEND, respectively (or their crossing/maintain
    // variants, but all have the same vertical speed target).
    let doesUpSenseAchieveAlim = minUpSenseVsMps <= TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS;
    let doesDownSenseAchieveAlim = maxDownSenseVsMps >= -TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS;

    const doesUpSenseRequireClimb = minUpSenseVsMps > 0;
    const doesDownSenseRequireDescend = maxDownSenseVsMps < 0;

    const canClimb = this.options.allowClimb(simTime);
    const canDescend = this.options.allowDescend(simTime);

    const isUpSenseInhibited = doesUpSenseRequireClimb && !canClimb;
    const isDownSenseInhibited = doesDownSenseRequireDescend && !canDescend;

    minUpSenseVsMps = isUpSenseInhibited ? 0 : minUpSenseVsMps;
    maxDownSenseVsMps = isDownSenseInhibited ? 0 : maxDownSenseVsMps;

    let sense: 1 | 0 | -1;
    let senseIsCrossing = false;
    let doesSenseAchieveAlim = false;
    let senseRequiredVs = 0;

    // If one sense RA achieves ALIM separation and the other does not, choose the one that achieves ALIM separation.
    if (doesUpSenseAchieveAlim && !doesDownSenseAchieveAlim) {
      sense = 1;
    } else if (!doesUpSenseAchieveAlim && doesDownSenseAchieveAlim) {
      sense = -1;
    } else {
      // If both or neither sense RA achieves ALIM separation, choose the non-crossing sense. Only the closest intruder
      // is evaluated, since in a multi-intruder RA there is the opportunity to reverse sense with each intruder.

      const closestIntruder = this.intruderArray[0];
      const t0 = closestIntruder.tcaRA.time;
      const tcpaSeconds = closestIntruder.tcaRA.tcpa.asUnit(UnitType.SECOND);

      const ownAirplaneAltMeters = this.ownAirplane.predictPosition(t0, TcasResolutionAdvisoryHostClass.vec3Cache[0])[2];
      const intruderTcpaAltMeters = ownAirplaneAltMeters + tcpaSeconds * ownAirplaneVsMps + closestIntruder.tcaRA.cpaDisplacement[2];

      const crossingSense = Math.sign(intruderTcpaAltMeters - ownAirplaneAltMeters);

      if (crossingSense === -1 && !isUpSenseInhibited) {
        sense = 1;
      } else if (crossingSense === 1 && !isDownSenseInhibited) {
        sense = -1;
      } else {
        // If neither sense is crossing or the non-crossing sense is inhibited, choose the one that is not inhibited.

        if (!isUpSenseInhibited && isDownSenseInhibited) {
          sense = 1;
        } else if (isUpSenseInhibited && !isDownSenseInhibited) {
          sense = -1;
        } else {
          // If neither or both senses are inhibited, choose the one that gives the greatest potential separation at
          // CPA (i.e. the one that requires the least change in vertical speed). Again, only the closest intruder is evaluated.

          if (Math.abs(minUpSenseVsMps - ownAirplaneVsMps) < Math.abs(maxDownSenseVsMps - ownAirplaneVsMps)) {
            sense = 1;
          } else {
            sense = -1;
          }
        }

        senseIsCrossing = sense === crossingSense;
      }
    }

    doesUpSenseAchieveAlim = isUpSenseInhibited ? false : doesUpSenseAchieveAlim;
    doesDownSenseAchieveAlim = isDownSenseInhibited ? false : doesDownSenseAchieveAlim;
    doesSenseAchieveAlim = sense === 1 ? doesUpSenseAchieveAlim : doesDownSenseAchieveAlim;

    senseRequiredVs = sense === 1 ? minUpSenseVsMps : maxDownSenseVsMps;

    // For multi-intruder RAs, there is the option to choose an initial composite RA which combines two negative RAs of
    // opposite senses.
    if (this.intruderArray.length > 1) {
      // Because the composite RA always includes a vertical speed of 0 within its vertical speed target range, it
      // achieves ALIM separation from all intruders if and only if a vertical speed of 0 does.

      const doesCompositeAchieveAlim = this.vsConstraints.every(constraint => constraint.above <= 0 || constraint.below >= 0);

      // If the composite RA achieves ALIM separation from all intruders and the selected up/down sense RA does not,
      // choose the composite RA.
      if (doesCompositeAchieveAlim && !doesSenseAchieveAlim) {
        sense = 0;
        doesSenseAchieveAlim = doesCompositeAchieveAlim;
      } else if (doesCompositeAchieveAlim === doesSenseAchieveAlim) {
        // If both or neither the composite RA or the selected up/down sense RA achieves ALIM separation from all
        // intruders, choose the composite RA if the up/down sense RA is crossing.

        if (senseIsCrossing) {
          sense = 0;
          doesSenseAchieveAlim = doesCompositeAchieveAlim;
        } else {
          // If both or neither the composite RA or the selected up/down sense RA is crossing, choose the one that
          // provides the greatest potential vertical separation at CPA. Again, only the closest intruder is
          // evaluated.

          if (Math.abs(ownAirplaneVsMps) < Math.abs(senseRequiredVs - ownAirplaneVsMps)) {
            sense = 0;
            doesSenseAchieveAlim = doesCompositeAchieveAlim;
          }
        }
      }
    }

    // Now that we have selected the sense, we need to choose the appropriate initial RA type.

    let primaryType: TcasResolutionAdvisoryType;
    let secondaryType: TcasResolutionAdvisoryType | null = null;

    switch (sense) {
      case 0: // Composite RA
        if (doesSenseAchieveAlim) {
          // Find the vertical speed limits required to achieve ALIM separation.
          const maxVsMps = this.getCompositeRequiredMaxVs();
          const minVsMps = this.getCompositeRequiredMinVs();

          if (ownAirplaneVsMps > maxVsMps) {
            // Downward sense, corrective
            primaryType = TcasResolutionAdvisoryType.ReduceClimb;
            secondaryType = TcasResolutionAdvisoryHostClass.getDoNotDescendType(minVsMps);
          } else if (ownAirplaneVsMps < minVsMps) {
            // Upward sense, corrective
            primaryType = TcasResolutionAdvisoryType.ReduceDescent;
            secondaryType = TcasResolutionAdvisoryHostClass.getDoNotClimbType(maxVsMps);
          } else {
            // Preventative
            primaryType = TcasResolutionAdvisoryHostClass.getDoNotDescendType(minVsMps);
            secondaryType = TcasResolutionAdvisoryHostClass.getDoNotClimbType(maxVsMps);
          }
        } else {
          primaryType = TcasResolutionAdvisoryType.ReduceDescent;
          secondaryType = TcasResolutionAdvisoryType.DoNotClimb0;
        }
        break;
      case 1: // Upward sense single RA
        if (ownAirplaneVsMps < minUpSenseVsMps) {
          // Corrective
          if (minUpSenseVsMps > 0) {
            // Positive
            primaryType = senseIsCrossing ? TcasResolutionAdvisoryType.CrossingClimb : TcasResolutionAdvisoryType.Climb;
          } else {
            // Negative
            primaryType = TcasResolutionAdvisoryType.ReduceDescent;
          }
        } else {
          // Preventative
          if (minUpSenseVsMps > 0) {
            // Positive
            primaryType = senseIsCrossing ? TcasResolutionAdvisoryType.CrossingMaintainClimb : TcasResolutionAdvisoryType.MaintainClimb;
          } else {
            // Negative
            primaryType = TcasResolutionAdvisoryHostClass.getDoNotDescendType(minUpSenseVsMps);
          }
        }
        break;
      case -1: // Downward sense single RA
        if (ownAirplaneVsMps > maxDownSenseVsMps) {
          // Corrective
          if (maxDownSenseVsMps < 0) {
            // Positive
            primaryType = senseIsCrossing ? TcasResolutionAdvisoryType.CrossingDescend : TcasResolutionAdvisoryType.Descend;
          } else {
            // Negative
            primaryType = TcasResolutionAdvisoryType.ReduceClimb;
          }
        } else {
          // Preventative
          if (maxDownSenseVsMps < 0) {
            // Positive
            primaryType = senseIsCrossing ? TcasResolutionAdvisoryType.CrossingMaintainDescend : TcasResolutionAdvisoryType.MaintainDescend;
          } else {
            // Negative
            primaryType = TcasResolutionAdvisoryHostClass.getDoNotClimbType(maxDownSenseVsMps);
          }
        }
        break;
    }

    this.setState(simTime, primaryType, secondaryType, true);
  }

  /**
   * Updates an existing positive resolution advisory. Positive resolution advisories include the CLIMB and DESCEND and
   * related types (CROSSING, MAINTAIN, INCREASE, REVERSAL).
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  private updatePositive(simTime: number): void {
    const sense = BitFlags.isAll(this._primaryFlags, TcasResolutionAdvisoryFlags.UpSense) ? 1 : -1;
    const isIncrease = BitFlags.isAll(this._primaryFlags, TcasResolutionAdvisoryFlags.Increase);

    // Check if we are inhibited, if so -> convert the current RA to its negative preventative counterpart.
    const isInhibited = sense === 1 ? !this.options.allowClimb(simTime) : !this.options.allowDescend(simTime);
    if (isInhibited) {
      this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.DoNotDescend0 : TcasResolutionAdvisoryType.DoNotClimb0, null);
      return;
    }

    // Check if we are currently on track to achieve ALIM separation from all intruders. If we are, attempt to
    // weaken the RA. If we are not, attempt to strengthen the RA or trigger a sense reversal.

    const currentTargetVsMps = sense === 1 ? this._minVerticalSpeed.asUnit(UnitType.MPS) : this._maxVerticalSpeed.asUnit(UnitType.MPS);

    const requiredVsMps = sense === 1 ? this.getUpSenseRequiredMinVs() : this.getDownSenseRequiredMaxVs();
    const willAchieveAlim = (currentTargetVsMps - requiredVsMps) * sense >= 0;

    if (willAchieveAlim) {
      // If weakening to a REDUCE CLIMB/DESCENT RA would still provide ALIM separation, do so.
      if (requiredVsMps * sense <= 0) {
        this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.ReduceDescent : TcasResolutionAdvisoryType.ReduceClimb, null);
      }
    } else {
      // Check if strengthening to an INCREASE CLIMB/DESCENT RA would provide ALIM separation

      const isStrengthenInhibited = sense === 1 ? !this.options.allowIncreaseClimb(simTime) : !this.options.allowIncreaseDescent(simTime);

      let strengthen = !isIncrease && !isStrengthenInhibited && (TcasResolutionAdvisoryHostClass.INC_CLIMB_DESC_VS_MPS * sense - requiredVsMps) * sense >= 0;
      let reverseSense = false;

      if (!strengthen && this.senseReversalCount < this.intruderArray.length) {
        // Check if a sense reversal would provide ALIM separation
        const reversalRequiredVsMps = sense === 1 ? this.getDownSenseRequiredMaxVs() : this.getUpSenseRequiredMinVs();
        reverseSense = (TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS * sense + reversalRequiredVsMps) * sense >= 0;
      }

      strengthen = !isIncrease && !isStrengthenInhibited && !reverseSense;

      if (strengthen) {
        this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.IncreaseClimb : TcasResolutionAdvisoryType.IncreaseDescend, null);
      } else if (reverseSense) {
        this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.ReversalDescend : TcasResolutionAdvisoryType.ReversalClimb, null);
      }
    }
  }

  /**
   * Updates an existing negative resolution advisory. Negative resolution advisories include the REDUCE CLIMB/DESCENT
   * and DO NOT CLIMB/DESCEND types.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplaneVsMps The current vertical speed of the own airplane, in meters per second.
   */
  private updateNegative(simTime: number, ownAirplaneVsMps: number): void {
    const sense = BitFlags.isAll(this._primaryFlags, TcasResolutionAdvisoryFlags.UpSense) ? 1 : -1;

    // Check if we are currently on track to achieve ALIM separation from all intruders. If we are, we do nothing since
    // negative RAs cannot be weakened. If we are not, attempt to strengthen the RA or trigger a sense reversal.

    const currentTargetVsMps = sense === 1 ? this._minVerticalSpeed.asUnit(UnitType.MPS) : this._maxVerticalSpeed.asUnit(UnitType.MPS);

    const requiredVsMps = sense === 1 ? this.getUpSenseRequiredMinVs() : this.getDownSenseRequiredMaxVs();
    const willAchieveAlim = (currentTargetVsMps - requiredVsMps) * sense >= 0;

    if (willAchieveAlim) {
      return;
    }

    const requirePositive = requiredVsMps * sense > 0;

    if (requirePositive) {
      // We need to strengthen to a positive RA in order to achieve ALIM separation from all intruders.

      const isStrengthenInhibited = sense === 1 ? !this.options.allowClimb(simTime) : !this.options.allowDescend(simTime);

      let strengthen = !isStrengthenInhibited && (TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS * sense - requiredVsMps) * sense >= 0;
      let reverseSense = false;

      if (
        !strengthen
        && this.senseReversalCount < this.intruderArray.length
        && (sense === 1 ? this.options.allowDescend(simTime) : this.options.allowClimb(simTime))
      ) {
        // Check if a sense reversal would provide ALIM separation
        const reversalRequiredVsMps = sense === 1 ? this.getDownSenseRequiredMaxVs() : this.getUpSenseRequiredMinVs();
        reverseSense = (TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS * sense + reversalRequiredVsMps) * sense >= 0;
      }

      strengthen = !isStrengthenInhibited && !reverseSense;

      if (strengthen) {
        this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.Climb : TcasResolutionAdvisoryType.Descend, null);
        return;
      } else if (reverseSense) {
        this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.ReversalDescend : TcasResolutionAdvisoryType.ReversalClimb, null);
        return;
      }

      // If we can't strengthen to a positive RA or issue a sense reversal, fall back to issuing the most restrictive
      // negative RA we can.
    }

    if ((ownAirplaneVsMps - requiredVsMps) * sense < 0) {
      // We need to issue a corrective negative RA.
      this.setState(simTime, sense === 1 ? TcasResolutionAdvisoryType.ReduceDescent : TcasResolutionAdvisoryType.ReduceClimb, null);
    } else {
      // We can strengthen to a more restrictive preventative negative RA.
      this.setState(
        simTime,
        sense === 1
          ? TcasResolutionAdvisoryHostClass.getDoNotDescendType(requiredVsMps)
          : TcasResolutionAdvisoryHostClass.getDoNotClimbType(requiredVsMps),
        null
      );
    }
  }

  /**
   * Updates an existing composite resolution advisory. Composite resolution advisories consist of a (corrective or
   * preventative) negative resolution advisory combined with a negative preventative resolution advisory of the
   * opposite sense.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplaneVsMps The current vertical speed of the own airplane, in meters per second.
   * @throws Error if a composite resolution advisory is not active.
   */
  private updateComposite(simTime: number, ownAirplaneVsMps: number): void {
    if (this._secondaryType === null) {
      throw new Error('TcasResolutionAdvisoryClass: attempted to update a composite RA when one was not active');
    }
    const currentMinVsMps = this._minVerticalSpeed.asUnit(UnitType.MPS);
    const currentMaxVsMps = this._maxVerticalSpeed.asUnit(UnitType.MPS);

    const requiredMinVsMps = this.getCompositeRequiredMinVs();
    const requiredMaxVsMps = this.getCompositeRequiredMaxVs();

    const primarySense = BitFlags.isAll(this._primaryFlags, TcasResolutionAdvisoryFlags.UpSense) ? 1 : -1;

    let primaryCurrentVsMps: number, primaryRequiredVsMps: number, secondaryCurrentVsMps: number, secondaryRequiredVsMps: number;

    if (primarySense === 1) {
      primaryCurrentVsMps = currentMinVsMps;
      primaryRequiredVsMps = requiredMinVsMps;
      secondaryCurrentVsMps = currentMaxVsMps;
      secondaryRequiredVsMps = requiredMaxVsMps;
    } else {
      primaryCurrentVsMps = currentMaxVsMps;
      primaryRequiredVsMps = requiredMaxVsMps;
      secondaryCurrentVsMps = currentMinVsMps;
      secondaryRequiredVsMps = requiredMinVsMps;
    }

    const willPrimaryAchieveAlim = (primaryCurrentVsMps - primaryRequiredVsMps) * primarySense >= 0;
    const willSecondaryAchieveAlim = (secondaryCurrentVsMps - secondaryRequiredVsMps) * -primarySense >= 0;

    const requirePositive = !willPrimaryAchieveAlim && primaryRequiredVsMps * primarySense > 0
      || !willSecondaryAchieveAlim && secondaryRequiredVsMps * -primarySense > 0;

    if (requirePositive) {
      // We need to strengthen to a positive RA in order to achieve ALIM separation from all intruders.

      const isStrengthenInhibited = primarySense === 1 ? !this.options.allowClimb(simTime) : !this.options.allowDescend(simTime);

      const positiveRequiredVsMps = primarySense === 1 ? this.getUpSenseRequiredMinVs() : this.getDownSenseRequiredMaxVs();
      let strengthen = !isStrengthenInhibited && (TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS * primarySense - positiveRequiredVsMps) * primarySense >= 0;
      let reverseSense = false;

      if (
        !strengthen
        && this.senseReversalCount < this.intruderArray.length
        && (primarySense === 1 ? this.options.allowDescend(simTime) : this.options.allowClimb(simTime))
      ) {
        // Check if a sense reversal would provide ALIM separation
        const reversalRequiredVsMps = primarySense === 1 ? this.getDownSenseRequiredMaxVs() : this.getUpSenseRequiredMinVs();
        reverseSense = (TcasResolutionAdvisoryHostClass.CLIMB_DESC_VS_MPS * primarySense + reversalRequiredVsMps) * primarySense >= 0;
      }

      strengthen = !isStrengthenInhibited && !reverseSense;

      if (strengthen) {
        this.setState(simTime, primarySense === 1 ? TcasResolutionAdvisoryType.Climb : TcasResolutionAdvisoryType.Descend, null);
        return;
      } else if (reverseSense) {
        this.setState(simTime, primarySense === 1 ? TcasResolutionAdvisoryType.ReversalDescend : TcasResolutionAdvisoryType.ReversalClimb, null);
        return;
      }

      // If we can't strengthen to a positive RA or issue a sense reversal, fall back to issuing the most restrictive
      // pair of negative RAs we can.
    }

    let primaryType: TcasResolutionAdvisoryType;
    if ((ownAirplaneVsMps - primaryRequiredVsMps) * primarySense < 0) {
      // We need to issue a corrective negative RA.
      primaryType = primarySense === 1 ? TcasResolutionAdvisoryType.ReduceDescent : TcasResolutionAdvisoryType.ReduceClimb;
    } else {
      // We can strengthen to a more restrictive preventative negative RA.
      primaryType = primarySense === 1
        ? TcasResolutionAdvisoryHostClass.getDoNotDescendType(primaryRequiredVsMps)
        : TcasResolutionAdvisoryHostClass.getDoNotClimbType(primaryRequiredVsMps);
    }

    const secondaryType = primarySense === 1
      ? TcasResolutionAdvisoryHostClass.getDoNotClimbType(secondaryRequiredVsMps)
      : TcasResolutionAdvisoryHostClass.getDoNotDescendType(secondaryRequiredVsMps);

    this.setState(simTime, primaryType, secondaryType);
  }

  /**
   * Sets the state of this host's current resolution advisory. If the specified state is equal to the current state
   * of the resolution advisory, this method does nothing. If the state is successfully set, the `tcas_ra_issued`
   * event will be published if `isInitial` is `true`, or the `tcas_ra_updated` event if `isInitial` is `false`.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param primaryType The primary type of the resolution advisory.
   * @param secondaryType The secondary type of the resolution advisory.
   * @param isInitial Whether the state to set is for an initial resolution advisory.
   */
  private setState(simTime: number, primaryType: TcasResolutionAdvisoryType, secondaryType: TcasResolutionAdvisoryType | null, isInitial = false): void {
    if (primaryType === this._primaryType && secondaryType === this._secondaryType) {
      return;
    }

    let minSpeed: number, maxSpeed: number;

    const primaryTypeDef = TcasResolutionAdvisoryHostClass.TYPE_DEFS[primaryType];

    this._primaryType = primaryType;
    this._primaryFlags = primaryTypeDef.flags;

    this._secondaryType = secondaryType;
    if (secondaryType !== null) {
      const secondaryTypeDef = TcasResolutionAdvisoryHostClass.TYPE_DEFS[secondaryType];

      this._secondaryFlags = secondaryTypeDef.flags;
      minSpeed = Math.max(primaryTypeDef.minVerticalSpeed, secondaryTypeDef.minVerticalSpeed);
      maxSpeed = Math.min(primaryTypeDef.maxVerticalSpeed, secondaryTypeDef.maxVerticalSpeed);
    } else {
      this._secondaryFlags = 0;
      minSpeed = primaryTypeDef.minVerticalSpeed;
      maxSpeed = primaryTypeDef.maxVerticalSpeed;
    }

    this._minVerticalSpeed.set(isFinite(minSpeed) ? minSpeed : NaN);
    this._maxVerticalSpeed.set(isFinite(maxSpeed) ? maxSpeed : NaN);

    this.isInitial = isInitial;

    this.lastStateChangeTime = simTime;
    this.stateChangeDelay = TcasResolutionAdvisoryHostClass.STATE_CHANGE_DELAY_BASE
      + (isInitial ? this.initialResponseTimeSeconds : this.subsequentResponseTimeSeconds) * 1000;

    if (BitFlags.isAll(this._primaryFlags, TcasResolutionAdvisoryFlags.Reversal)) {
      this.senseReversalCount++;
    }

    if (isInitial) {
      this.publisher.pub('tcas_ra_issued', this, false, false);
    } else {
      this.publisher.pub('tcas_ra_updated', this, false, false);
    }
  }

  /**
   * Cancels this host's current resolution advisory. If there is no currently active resolution advisory, this
   * method does nothing. If the resolution advisory is successfully cancelled, the `tcas_ra_canceled` event will be
   * published.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  public cancel(simTime: number): void {
    if (this._primaryType === TcasResolutionAdvisoryType.Clear && this._secondaryType === null) {
      return;
    }

    this.intruders.clear();
    this.intruderArray.length = 0;

    this._maxVerticalSpeed.set(NaN);
    this._minVerticalSpeed.set(NaN);

    this._primaryType = TcasResolutionAdvisoryType.Clear;
    this._primaryFlags = 0;

    this._secondaryType = null;
    this._secondaryFlags = 0;

    this.lastStateChangeTime = simTime;
    this.stateChangeDelay = TcasResolutionAdvisoryHostClass.STATE_CHANGE_DELAY_BASE;

    this.isInitial = true;
    this.senseReversalCount = 0;

    this.publisher.pub('tcas_ra_canceled', undefined, false, false);
  }

  /**
   * Gets the required minimum vertical speed, in meters per second, for the own airplane to achieve ALIM separation
   * above all current RA intruders.
   * @returns The required minimum vertical speed, in meters per second, for the own airplane to achieve ALIM
   * separation above all current RA intruders.
   */
  private getUpSenseRequiredMinVs(): number {
    return this.vsConstraints.reduce((min, constraint) => Math.max(min, constraint.above), -Infinity);
  }

  /**
   * Gets the required maximum vertical speed, in meters per second, for the own airplane to achieve ALIM separation
   * below all current RA intruders.
   * @returns The required maximum vertical speed, in meters per second, for the own airplane to achieve ALIM
   * separation below all current RA intruders.
   */
  private getDownSenseRequiredMaxVs(): number {
    return this.vsConstraints.reduce((max, constraint) => Math.min(max, constraint.below), Infinity);
  }

  /**
   * Gets the required minimum vertical speed, in meters per second, for the own airplane to achieve ALIM separation
   * from all current RA intruders during a composite advisory.
   * @returns The required minimum vertical speed, in meters per second, for the own airplane to achieve ALIM
   * separation from all current RA intruders during a composite advisory.
   */
  private getCompositeRequiredMinVs(): number {
    return this.vsConstraints.reduce((min, constraint) => constraint.above <= 0 ? Math.max(min, constraint.above) : min, -Infinity);
  }

  /**
   * Gets the required maximum vertical speed, in meters per second, for the own airplane to achieve ALIM separation
   * from all current RA intruders during a composite advisory.
   * @returns The required maximum vertical speed, in meters per second, for the own airplane to achieve ALIM
   * separation from all current RA intruders during a composite advisory.
   */
  private getCompositeRequiredMaxVs(): number {
    return this.vsConstraints.reduce((max, constraint) => constraint.below >= 0 ? Math.min(max, constraint.below) : max, Infinity);
  }

  /**
   * Calculates the vertical speed required to achieve a desired altitude target at time of closest approach.
   * @param tcpa The time to closest approach from the present, in seconds.
   * @param currentAlt The current altitude of the own airplane, in meters.
   * @param vs The current vertical speed of the own airplane, in meters per second.
   * @param responseTime The response time of the own airplane, in seconds.
   * @param accel The acceleration of the own airplane, in meters per second squared.
   * @param targetAlt The target altitude of the own airplane at time of closest approach, in meters.
   * @returns The vertical speed, in meters per second, required to achieve a desired altitude target at time of
   * closest approach. A value of `NaN` indicates the altitude target cannot be reached with the specified parameters.
   */
  private static calculateVSToTargetAlt(
    tcpa: number,
    currentAlt: number,
    vs: number,
    responseTime: number,
    accel: number,
    targetAlt: number
  ): number {
    const signedAccel = accel * Math.sign(targetAlt - (currentAlt + vs * tcpa));

    if (signedAccel === 0) {
      return vs;
    }

    const y0 = currentAlt + vs * responseTime;
    const tc = tcpa - responseTime;

    const a = signedAccel / 2;
    const b = -signedAccel * tc;
    const c = targetAlt - y0 - vs * tc;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return NaN;
    }

    const sqrtDiscr = Math.sqrt(discriminant);
    const t1 = (-b + sqrtDiscr) / (2 * a);
    const t2 = (-b - sqrtDiscr) / (2 * a);

    if (t1 <= tc && t1 >= 0) {
      return vs + signedAccel * t1;
    }
    if (t2 <= tc && t2 >= 0) {
      return vs + signedAccel * t2;
    }

    return NaN;
  }

  /**
   * Gets the least restrictive DO NOT DESCEND resolution advisory type appropriate to issue for a given minimum
   * vertical speed requirement.
   * @param minVsMps A minimum vertical speed requirement, in meters per second.
   * @returns The least restrictive DO NOT DESCEND resolution advisory type appropriate to issue for the specified
   * minimum vertical speed requirement.
   */
  private static getDoNotDescendType(minVsMps: number): TcasResolutionAdvisoryType {
    if (minVsMps > -500) {
      return TcasResolutionAdvisoryType.DoNotDescend0;
    } else if (minVsMps > -1000) {
      return TcasResolutionAdvisoryType.DoNotDescend500;
    } else if (minVsMps > -1500) {
      return TcasResolutionAdvisoryType.DoNotDescend1000;
    } else if (minVsMps > -2000) {
      return TcasResolutionAdvisoryType.DoNotDescend1500;
    } else {
      return TcasResolutionAdvisoryType.DoNotDescend2000;
    }
  }

  /**
   * Gets the least restrictive DO NOT CLIMB resolution advisory type appropriate to issue for a given maximum
   * vertical speed requirement.
   * @param maxVsMps A maximum vertical speed requirement, in meters per second.
   * @returns The least restrictive DO NOT CLIMB resolution advisory type appropriate to issue for the specified
   * maximum vertical speed requirement.
   */
  private static getDoNotClimbType(maxVsMps: number): TcasResolutionAdvisoryType {
    if (maxVsMps < 500) {
      return TcasResolutionAdvisoryType.DoNotClimb0;
    } else if (maxVsMps < 1000) {
      return TcasResolutionAdvisoryType.DoNotClimb500;
    } else if (maxVsMps < 1500) {
      return TcasResolutionAdvisoryType.DoNotClimb1000;
    } else if (maxVsMps < 2000) {
      return TcasResolutionAdvisoryType.DoNotClimb1500;
    } else {
      return TcasResolutionAdvisoryType.DoNotClimb2000;
    }
  }
}