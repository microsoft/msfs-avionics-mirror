import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { NavMath } from '../../geo/NavMath';
import { UnitType } from '../../math/NumberUnit';
import { Facility, LegType } from '../../navigation/Facilities';
import { FacilityClient } from '../../navigation/FacilityClient';
import { IcaoValue } from '../../navigation/Icao';
import { ICAO } from '../../navigation/IcaoUtils';
import { LerpLookupTable } from '../../utils/datastructures/LerpLookupTable';
import { LegCalculations, LegDefinition } from '../FlightPlanning';
import { FlightPlanUtils } from '../FlightPlanUtils';
import { FlightPathCalculatorControlEvents } from './FlightPathCalculatorControlEvents';
import { FlightPathLegCalculationOptions, FlightPathLegCalculator } from './FlightPathLegCalculator';
import { FlightPathLegToLegCalculator } from './FlightPathLegToLegCalculator';
import { FlightPathState } from './FlightPathState';
import { FlightPathUtils } from './FlightPathUtils';
import {
  ArcToFixLegCalculator, CourseToAltitudeLegCalculator, CourseToFixLegCalculator, DirectToFixLegCalculator,
  DiscontinuityLegCalculator, DmeInterceptLegCalculator, FixToAltitudeLegCalculator, FixToDmeLegCalculator,
  FixToManualLegCalculator, HeadingToAltitudeLegCalculator, HeadingToManualLegCalculator, HoldLegCalculator,
  LegInterceptLegCalculator, NoPathLegCalculator, ProcedureTurnLegCalculator, RadialInterceptLegCalculator,
  RadiusToFixLegCalculator, TrackFromFixLegCalculator, TrackToFixLegCalculator
} from './legcalculators';

/**
 * An array of breakpoints defining a lookup table for bank angle, in degrees, versus airplane speed, in knots.
 */
export type FlightPathBankAngleBreakpoints = readonly (readonly [bankAngle: number, speed: number])[];

/**
 * Modes for calculating airplane speed for use in flight path calculations.
 */
export enum FlightPathAirplaneSpeedMode {
  /** The default airplane speed is always used. */
  Default = 'Default',

  /** Ground speed is used. */
  GroundSpeed = 'GroundSpeed',

  /** True airspeed is used. */
  TrueAirspeed = 'TrueAirspeed',

  /** True airspeed plus wind speed is used. */
  TrueAirspeedPlusWind = 'TrueAirspeedPlusWind',

  /** A custom-defined speed is used. **Not yet supported.** */
  Custom = 'Custom',
}

/**
 * Modes for obtaining wind data for use in flight path calculations.
 */
export enum FlightPathAirplaneWindMode {
  /** No wind data are used. */
  None = 'None',

  /** Wind data from the sim are used. */
  Automatic = 'Automatic',

  /** Custom-defined wind data are used. **Not yet supported.** */
  Custom = 'Custom',
}

/**
 * Options for a {@link FlightPathCalculator}.
 */
export interface FlightPathCalculatorOptions {
  /** The default climb rate, in feet per minute, if the plane is not yet at flying speed. */
  defaultClimbRate: number;

  /**
   * The default airplane speed, in knots. This speed is used if the airplane speed mode is `Default` or if the
   * airplane speed calculated through other means is slower than this speed. It is also used as the airplane's true
   * airspeed if the true airspeed obtained through other means is slower than this speed.
   */
  defaultSpeed: number;

  /**
   * The bank angle, in degrees, with which to calculate general turns, or breakpoints defining a linearly-interpolated
   * lookup table for bank angle versus airplane speed, in knots.
   */
  bankAngle: number | FlightPathBankAngleBreakpoints;

  /**
   * The bank angle, in degrees, with which to calculate turns in holds, or breakpoints defining a
   * linearly-interpolated lookup table for bank angle versus airplane speed, in knots. If `null`, the general turn
   * bank angle will be used for holds.
   */
  holdBankAngle: number | FlightPathBankAngleBreakpoints | null;

  /**
   * The bank angle, in degrees, with which to calculate turns in course reversals (incl. procedure turns), or
   * breakpoints defining a linearly-interpolated lookup table for bank angle versus airplane speed, in knots. If
   * `null`, the general turn bank angle will be used for course reversals.
   */
  courseReversalBankAngle: number | FlightPathBankAngleBreakpoints | null;

  /**
   * The bank angle, in degrees, with which to calculate turn anticipation, or breakpoints defining a
   * linearly-interpolated lookup table for bank angle versus airplane speed, in knots. If `null`, the general turn
   * bank angle will be used for turn anticipation.
   */
  turnAnticipationBankAngle: number | FlightPathBankAngleBreakpoints | null;

  /** The maximum bank angle, in degrees, to use to calculate all turns. */
  maxBankAngle: number;

  /** The mode to use to calculate airplane speed. */
  airplaneSpeedMode: FlightPathAirplaneSpeedMode;

  /** The mode to use to obtain airplane wind data. */
  airplaneWindMode: FlightPathAirplaneWindMode;
}

/**
 * Options for a {@link FlightPathCalculator} that cannot be changed after initialization.
 */
export interface FlightPathCalculatorStaticOptions {
  /**
   * Whether to calculate flight path vectors to span discontinuities in the flight path. If `true`, then the
   * calculated discontinuity vectors will have the `Discontinuity` flag applied to them.
   */
  calculateDiscontinuityVectors: boolean;
}

/**
 * Options with which to initialize a {@link FlightPathCalculator}.
 */
export type FlightPathCalculatorInitOptions = FlightPathCalculatorOptions & {
  /** The ID of the flight path calculator. Defaults to the empty string (`''`). */
  id?: string;

  /**
   * The calculator's initialization sync role. Upon instantiation, a `primary` calculator will broadcast an
   * initialization sync event through the event bus which allows existing `replica` calculators with the same ID to
   * sync their state with the primary. Upon instantiation, replica calculators will attempt to sync their state with
   * any existing primary calculators with the same ID. A calculators with a sync role of `none` will neither try to
   * broadcast its state to replica calculators nor try to sync its state with primary calculators. Defaults to `none`.
   */
  initSyncRole?: 'none' | 'primary' | 'replica';

  /**
   * Whether to calculate flight path vectors to span discontinuities in the flight path. If `true`, then the
   * calculated discontinuity vectors will have the `Discontinuity` flag applied to them. Defaults to `false`.
   */
  calculateDiscontinuityVectors?: boolean;
};

/**
 * Initialization data for a primary {@link FlightPathCalculator} instance.
 */
type FlightPathCalculatorInitData = {
  /** The static options with which the instance was initialized. */
  staticOptions: Readonly<FlightPathCalculatorStaticOptions>;

  /** The options with which the instance was initialized. */
  options: Readonly<FlightPathCalculatorOptions>;
};

/**
 * Response data for an options sync request.
 */
type FlightPathCalculatorOptionsResponse = {
  /** The UID of the request for which this response was generated. */
  uid: number;

  /** The static options with which the instance was initialized. */
  staticOptions: Readonly<FlightPathCalculatorStaticOptions>;

  /** The options of the flight path calculator instance that responded to the request. */
  options: Readonly<FlightPathCalculatorOptions>;
};

/**
 * Events used to sync data between flight path calculators, keyed by base topic names.
 */
interface BaseFlightPathCalculatorSyncEvents {
  /** A primary flight path calculator instance has finished initializing. */
  flightpath_sync_init: Readonly<FlightPathCalculatorInitData>;

  /** A flight path calculator is requesting options sync. */
  flightpath_sync_options_request: number;

  /** A flight path calculator is responding to an options sync request. */
  flightpath_sync_options_response: Readonly<FlightPathCalculatorOptionsResponse>;
}

/**
 * The event topic suffix used to sync data between flight path calculators with a specific ID.
 */
type FlightPathCalculatorSyncEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events used to sync data between flight path calculators with a specific ID.
 */
type FlightPathCalculatorSyncEventsForId<ID extends string> = {
  [P in keyof BaseFlightPathCalculatorSyncEvents as `${P}${FlightPathCalculatorSyncEventSuffix<ID>}`]: BaseFlightPathCalculatorSyncEvents[P];
};

/**
 * All events used to sync data between flight path calculators.
 */
interface FlightPathCalculatorSyncEvents
  extends BaseFlightPathCalculatorSyncEvents, FlightPathCalculatorSyncEventsForId<string> { }

/**
 * Calculates the flight path vectors for a given set of legs.
 */
export class FlightPathCalculator {

  private readonly id: string;

  private readonly facilityCache = new Map<string, Facility>();
  private readonly legCalculatorMap = this.createLegCalculatorMap();
  private readonly turnCalculator = new FlightPathLegToLegCalculator();

  private bankAngleTable!: LerpLookupTable;
  private holdBankAngleTable?: LerpLookupTable;
  private courseReversalBankAngleTable?: LerpLookupTable;
  private turnAnticipationBankAngleTable?: LerpLookupTable;

  private readonly state = new FlightPathStateClass();

  private readonly staticOptions: FlightPathCalculatorStaticOptions;
  private readonly options: FlightPathCalculatorOptions;

  private readonly legCalcOptions: FlightPathLegCalculationOptions = {
    calculateDiscontinuityVectors: false
  };

  private readonly calculateQueue: (() => void)[] = [];
  private isBusy = false;

  /**
   * Creates an instance of the FlightPathCalculator.
   * @param facilityClient The facility loader to use with this instance.
   * @param options The options to use with this flight path calculator.
   * @param bus An instance of the EventBus.
   */
  public constructor(
    private readonly facilityClient: FacilityClient,
    options: Readonly<FlightPathCalculatorInitOptions>,
    private readonly bus: EventBus
  ) {
    this.id = options?.id ?? '';

    this.options = {
      defaultClimbRate: 0,
      defaultSpeed: 0,
      bankAngle: 0,
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: null,
      maxBankAngle: 0,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.Default,
      airplaneWindMode: FlightPathAirplaneWindMode.None
    };
    this.setOptions(options);

    this.staticOptions = {
      calculateDiscontinuityVectors: options.calculateDiscontinuityVectors ?? false
    };

    this.legCalcOptions.calculateDiscontinuityVectors = this.staticOptions.calculateDiscontinuityVectors;

    this.initSyncSubscriptions(options.initSyncRole ?? 'none');
  }

  /**
   * Initializes this calculator's sync subscriptions.
   * @param initialSyncRole This calculator's initial sync role.
   */
  private initSyncSubscriptions(initialSyncRole: 'none' | 'primary' | 'replica'): void {
    const eventBusTopicSuffix = this.id === '' ? '' : `_${this.id}` as const;

    const publisher = this.bus.getPublisher<FlightPathCalculatorSyncEvents>();
    const sub = this.bus.getSubscriber<FlightPathCalculatorSyncEvents & FlightPathCalculatorControlEvents>();

    if (initialSyncRole === 'primary') {
      publisher.pub(`flightpath_sync_init${eventBusTopicSuffix}`, { options: this.options, staticOptions: this.staticOptions }, true, false);

      sub.on(`flightpath_sync_options_request${eventBusTopicSuffix}`).handle(uid => {
        publisher.pub(`flightpath_sync_options_response${eventBusTopicSuffix}`, { uid, options: this.options, staticOptions: this.staticOptions }, true, false);
      });
    } else if (initialSyncRole === 'replica') {
      const requestUid = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER);
      sub.on(`flightpath_sync_options_response${eventBusTopicSuffix}`).handle(data => {
        if (data.uid === requestUid) {
          this.setStaticOptions(data.staticOptions);
          this.setOptions(data.options);
        }
      });
      publisher.pub(`flightpath_sync_options_request${eventBusTopicSuffix}`, requestUid, true, false);

      sub.on(`flightpath_sync_init${eventBusTopicSuffix}`).handle(data => {
        this.setStaticOptions(data.staticOptions);
        this.setOptions(data.options);
      });
    }

    sub.on(`flightpath_set_options${eventBusTopicSuffix}`).handle(this.setOptions.bind(this));
  }

  /**
   * Sets this calculator's static options.
   * @param options The options to set.
   */
  private setStaticOptions(options: Readonly<FlightPathCalculatorStaticOptions>): void {
    this.staticOptions.calculateDiscontinuityVectors = options.calculateDiscontinuityVectors;
  }

  /**
   * Sets this calculator's options.
   * @param newOptions The new options to set.
   */
  private setOptions(newOptions: Partial<Readonly<FlightPathCalculatorOptions>>): void {
    for (const key in this.options) {
      const option = newOptions[key as keyof FlightPathCalculatorOptions];
      if (option !== undefined) {
        switch (key as keyof FlightPathCalculatorOptions) {
          case 'bankAngle':
            this.options.bankAngle = this.processBankAngleOption(option as FlightPathCalculatorOptions['bankAngle']);
            this.bankAngleTable = this.buildBankAngleTable(this.options.bankAngle);
            break;
          case 'holdBankAngle':
            this.options.holdBankAngle = this.processBankAngleOption(option as FlightPathCalculatorOptions['holdBankAngle']);
            this.holdBankAngleTable = this.options.holdBankAngle === null ? undefined : this.buildBankAngleTable(this.options.holdBankAngle);
            break;
          case 'courseReversalBankAngle':
            this.options.courseReversalBankAngle = this.processBankAngleOption(option as FlightPathCalculatorOptions['courseReversalBankAngle']);
            this.courseReversalBankAngleTable = this.options.courseReversalBankAngle === null ? undefined : this.buildBankAngleTable(this.options.courseReversalBankAngle);
            break;
          case 'turnAnticipationBankAngle':
            this.options.turnAnticipationBankAngle = this.processBankAngleOption(option as FlightPathCalculatorOptions['turnAnticipationBankAngle']);
            this.turnAnticipationBankAngleTable = this.options.turnAnticipationBankAngle === null ? undefined : this.buildBankAngleTable(this.options.turnAnticipationBankAngle);
            break;
          default:
            (this.options as any)[key] = option;
        }
      }
    }
  }

  /**
   * Processes a bank angle option to a form that is safe to store in this calculator's options record.
   * @param option The option to process.
   * @returns The processed option.
   */
  private processBankAngleOption<T extends number | FlightPathBankAngleBreakpoints | null>(option: T): T {
    if (Array.isArray(option)) {
      const copy: [number, number][] = [];
      for (let i = 0; i < option.length; i++) {
        copy.push(Array.from(option[i]) as [number, number]);
      }
      return copy as unknown as T;
    } else {
      return option;
    }
  }

  /**
   * Builds a bank angle lookup table.
   * @param angle A constant bank angle, in degrees, or an array of bank angle (degrees) versus airplane speed (knots)
   * breakpoints.
   * @returns A bank angle lookup table.
   */
  private buildBankAngleTable(angle: number | FlightPathBankAngleBreakpoints): LerpLookupTable {
    if (typeof angle === 'number') {
      return new LerpLookupTable([[angle, 0]]);
    } else {
      return new LerpLookupTable(angle);
    }
  }

  /**
   * Creates a map from leg types to leg calculators.
   * @returns A map from leg types to leg calculators.
   */
  private createLegCalculatorMap(): Record<LegType, FlightPathLegCalculator> {
    let calc;
    return {
      [LegType.IF]: calc = new TrackToFixLegCalculator(this.facilityCache),
      [LegType.TF]: calc,

      [LegType.AF]: new ArcToFixLegCalculator(this.facilityCache),

      [LegType.CD]: new DmeInterceptLegCalculator(this.facilityCache, false),
      [LegType.VD]: new DmeInterceptLegCalculator(this.facilityCache, true),

      [LegType.CF]: new CourseToFixLegCalculator(this.facilityCache),

      [LegType.CR]: new RadialInterceptLegCalculator(this.facilityCache, false),
      [LegType.VR]: new RadialInterceptLegCalculator(this.facilityCache, true),

      [LegType.FC]: new TrackFromFixLegCalculator(this.facilityCache),

      [LegType.FD]: new FixToDmeLegCalculator(this.facilityCache),

      [LegType.RF]: new RadiusToFixLegCalculator(this.facilityCache),

      [LegType.DF]: new DirectToFixLegCalculator(this.facilityCache),

      [LegType.FA]: new FixToAltitudeLegCalculator(this.facilityCache),
      [LegType.CA]: new CourseToAltitudeLegCalculator(this.facilityCache),
      [LegType.VA]: new HeadingToAltitudeLegCalculator(this.facilityCache),

      [LegType.FM]: new FixToManualLegCalculator(this.facilityCache),
      [LegType.VM]: new HeadingToManualLegCalculator(this.facilityCache),

      [LegType.CI]: new LegInterceptLegCalculator(this.facilityCache, false),
      [LegType.VI]: new LegInterceptLegCalculator(this.facilityCache, true),

      [LegType.PI]: new ProcedureTurnLegCalculator(this.facilityCache),

      [LegType.HA]: calc = new HoldLegCalculator(this.facilityCache),
      [LegType.HM]: calc,
      [LegType.HF]: calc,

      [LegType.Discontinuity]: calc = new DiscontinuityLegCalculator(this.facilityCache),
      [LegType.ThruDiscontinuity]: calc,

      [LegType.Unknown]: new NoPathLegCalculator(this.facilityCache),
    };
  }

  /**
   * Calculates a flight path for a given set of flight plan legs.
   * @param legs The legs of the flight plan to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param initialIndex The index of the leg at which to start the calculation.
   * @param count The number of legs to calculate.
   * @returns A Promise which is fulfilled when the calculation is finished.
   */
  public calculateFlightPath(legs: LegDefinition[], activeLegIndex: number, initialIndex = 0, count = Number.POSITIVE_INFINITY): Promise<void> {
    if (this.isBusy || this.calculateQueue.length > 0) {
      return new Promise((resolve, reject) => {
        this.calculateQueue.push(() => { this.doCalculate(resolve, reject, legs, activeLegIndex, initialIndex, count); });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.doCalculate(resolve, reject, legs, activeLegIndex, initialIndex, count);
      });
    }
  }

  /**
   * Executes a calculate operation. When the operation is finished, the next operation in the queue, if one exists,
   * will be started.
   * @param resolve The Promise resolve function to invoke when the calculation is finished.
   * @param reject The Promise reject function to invoke when an error occurs during calculation.
   * @param legs The legs of the flight plan to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param initialIndex The index of the leg at which to start the calculation.
   * @param count The number of legs to calculate.
   * @returns A Promise which is fulfilled when the calculate operation is finished, or rejected if an error occurs
   * during calculation.
   */
  private async doCalculate(
    resolve: () => void,
    reject: (reason?: any) => void,
    legs: LegDefinition[],
    activeLegIndex: number,
    initialIndex = 0,
    count = Number.POSITIVE_INFINITY
  ): Promise<void> {
    this.isBusy = true;

    try {
      initialIndex = Math.max(0, initialIndex);
      count = Math.max(0, Math.min(legs.length - initialIndex, count));

      this.state.updatePlaneState(
        this.options,
        this.bankAngleTable,
        this.holdBankAngleTable,
        this.courseReversalBankAngleTable,
        this.turnAnticipationBankAngleTable
      );

      // Because some facilities can be mutated, we always want to get the most up-to-date version from the facility loader
      this.facilityCache.clear();
      await this.loadFacilities(legs, initialIndex, count);

      this.initState(legs, initialIndex);

      this.calculateLegPaths(legs, activeLegIndex, initialIndex, count);

      this.turnCalculator.calculate(
        legs,
        initialIndex,
        count,
        this.state
      );

      this.finishLegCalculations(legs, initialIndex, count);

      this.isBusy = false;
      resolve();
    } catch (e) {
      this.isBusy = false;
      reject(e);
    }

    const nextInQueue = this.calculateQueue.shift();
    if (nextInQueue !== undefined) {
      nextInQueue();
    }
  }

  /**
   * Loads facilities required for flight path calculations from the flight plan.
   * @param legs The legs of the flight plan to calculate.
   * @param initialIndex The index of the first leg to calculate.
   * @param count The number of legs to calculate.
   */
  private async loadFacilities(legs: LegDefinition[], initialIndex: number, count: number): Promise<void> {
    const facilitiesToLoad: IcaoValue[] = [];

    for (let i = initialIndex; i < initialIndex + count; i++) {
      const leg = legs[i].leg;
      ICAO.isValueFacility(leg.fixIcaoStruct) && facilitiesToLoad.push(leg.fixIcaoStruct);
      ICAO.isValueFacility(leg.originIcaoStruct) && facilitiesToLoad.push(leg.originIcaoStruct);
      ICAO.isValueFacility(leg.arcCenterFixIcaoStruct) && facilitiesToLoad.push(leg.arcCenterFixIcaoStruct);
    }

    if (facilitiesToLoad.length > 0) {
      const facs = await this.facilityClient.getFacilities(facilitiesToLoad, 0);
      for (const loadedFac of facs) {
        if (!loadedFac) {
          continue;
        }

        // TODO we should refactor facilityCache to use `ICAO.getUid()` as the key
        this.facilityCache.set(loadedFac.icao, loadedFac);
      }
    }
  }

  /**
   * Initializes the current flight path state.
   * @param legs The legs of the flight plan to calculate.
   * @param initialIndex The index of the first leg to calculate.
   */
  private initState(legs: LegDefinition[], initialIndex: number): void {
    this.state.currentPosition.set(NaN, NaN);
    this.state.currentCourse = undefined;

    let index = Math.min(initialIndex, legs.length);

    this.state.isFallback = legs[index - 1]?.calculated?.endsInFallback ?? false;

    let isDiscontinuity: boolean | undefined;

    while (
      --index >= 0
      && (!this.state.currentPosition.isValid() || this.state.currentCourse === undefined)
    ) {
      const leg = legs[index];
      const legCalc = leg.calculated;
      if (legCalc) {
        isDiscontinuity ??= legCalc.endsInDiscontinuity;

        if (!this.state.currentPosition.isValid() && legCalc && legCalc.endLat !== undefined && legCalc.endLon !== undefined) {
          this.state.currentPosition.set(legCalc.endLat, legCalc.endLon);
        }

        if (this.state.currentCourse === undefined && legCalc && legCalc.flightPath.length > 0) {
          this.state.currentCourse = FlightPathUtils.getLegFinalCourse(legCalc);
        }
      } else {
        isDiscontinuity ??= FlightPlanUtils.isDiscontinuityLeg(leg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(leg.leg.type);
      }
    }

    this.state.isDiscontinuity = isDiscontinuity ?? false;
  }

  /**
   * Calculates flight paths for a sequence of flight plan legs.
   * @param legs A sequence of flight plan legs.
   * @param activeLegIndex The index of the active leg.
   * @param initialIndex The index of the first leg to calculate.
   * @param count The number of legs to calculate.
   */
  private calculateLegPaths(legs: LegDefinition[], activeLegIndex: number, initialIndex: number, count: number): void {
    const end = initialIndex + count;
    for (let calculateIndex = initialIndex; calculateIndex < end; calculateIndex++) {
      const definition = legs[calculateIndex];
      this.legCalculatorMap[definition.leg.type].calculate(legs, calculateIndex, activeLegIndex, this.state, this.legCalcOptions);
    }
  }

  /**
   * Resolves the ingress to egress vectors and calculates leg distances for a set of flight plan legs.
   * @param legs A sequence of flight plan legs.
   * @param initialIndex The index of the first leg to calculate.
   * @param count The number of legs to calculate.
   */
  private finishLegCalculations(legs: LegDefinition[], initialIndex: number, count: number): void {
    const end = initialIndex + count;
    let prevLegCalc: LegCalculations | undefined;
    for (let i = 0; i < end; i++) {
      const legCalc = legs[i].calculated;

      if (!legCalc) {
        continue;
      }

      if (i >= initialIndex) {
        FlightPathUtils.resolveIngressToEgress(legCalc);

        // Calculate distance without transitions.

        legCalc.distance = 0;
        const len = legCalc.flightPath.length;
        for (let j = 0; j < len; j++) {
          legCalc.distance += legCalc.flightPath[j].distance;
        }

        // Calculate distance with transitions.

        legCalc.distanceWithTransitions = 0;
        const ingressLen = legCalc.ingress.length;
        for (let j = 0; j < ingressLen; j++) {
          legCalc.distanceWithTransitions += legCalc.ingress[j].distance;
        }
        const ingressToEgressLen = legCalc.ingressToEgress.length;
        for (let j = 0; j < ingressToEgressLen; j++) {
          legCalc.distanceWithTransitions += legCalc.ingressToEgress[j].distance;
        }
        const egressLen = legCalc.egress.length;
        for (let j = 0; j < egressLen; j++) {
          legCalc.distanceWithTransitions += legCalc.egress[j].distance;
        }

        // Calculate cumulative distances.

        legCalc.cumulativeDistance = legCalc.distance;
        legCalc.cumulativeDistanceWithTransitions = legCalc.distanceWithTransitions;
        if (prevLegCalc) {
          legCalc.cumulativeDistance += prevLegCalc.cumulativeDistance;
          legCalc.cumulativeDistanceWithTransitions += prevLegCalc.cumulativeDistanceWithTransitions;
        }
      }

      prevLegCalc = legCalc;
    }
  }
}

/**
 * An implementation of {@link FlightPathState}
 */
class FlightPathStateClass implements FlightPathState {
  /** @inheritDoc */
  public readonly currentPosition = new GeoPoint(NaN, NaN);

  /** @inheritDoc */
  public currentCourse: number | undefined;

  /** @inheritDoc */
  public isDiscontinuity = false;

  /** @inheritDoc */
  public isFallback = false;

  private _planePosition = new GeoPoint(0, 0);
  /** @inheritDoc */
  public readonly planePosition = this._planePosition.readonly;

  private _planeHeading = 0;
  /** @inheritDoc */
  public get planeHeading(): number {
    return this._planeHeading;
  }

  private _planeAltitude = UnitType.FOOT.createNumber(0);
  /** @inheritDoc */
  public readonly planeAltitude = this._planeAltitude.readonly;

  private _planeSpeed = UnitType.KNOT.createNumber(0);
  /** @inheritDoc */
  public readonly planeSpeed = this._planeSpeed.readonly;

  private _planeClimbRate = UnitType.FPM.createNumber(0);
  /** @inheritDoc */
  public readonly planeClimbRate = this._planeClimbRate.readonly;

  private _planeTrueAirspeed = UnitType.KNOT.createNumber(0);
  /** @inheritDoc */
  public readonly planeTrueAirspeed = this._planeTrueAirspeed.readonly;

  private _planeWindDirection = 0;
  /** @inheritDoc */
  public get planeWindDirection(): number {
    return this._planeWindDirection;
  }

  private _planeWindSpeed = UnitType.KNOT.createNumber(0);
  /** @inheritDoc */
  public readonly planeWindSpeed = this._planeWindSpeed.readonly;

  private _desiredTurnRadius = UnitType.METER.createNumber(0);
  /** @inheritDoc */
  public readonly desiredTurnRadius = this._desiredTurnRadius.readonly;

  private _desiredHoldTurnRadius = UnitType.METER.createNumber(0);
  /** @inheritDoc */
  public readonly desiredHoldTurnRadius = this._desiredHoldTurnRadius.readonly;

  private _desiredCourseReversalTurnRadius = UnitType.METER.createNumber(0);
  /** @inheritDoc */
  public readonly desiredCourseReversalTurnRadius = this._desiredCourseReversalTurnRadius.readonly;

  private _desiredTurnAnticipationTurnRadius = UnitType.METER.createNumber(0);
  /** @inheritDoc */
  public readonly desiredTurnAnticipationTurnRadius = this._desiredTurnAnticipationTurnRadius.readonly;

  /**
   * Updates this state with the latest information on the airplane.
   * @param options Flight path calculator options.
   * @param bankAngleTable A lookup table for general turn bank angle, in degrees, versus airplane speed.
   * @param holdBankAngleTable A lookup table for hold turn bank angle, in degrees, versus airplane speed, in knots.
   * If not defined, the general turn bank angle table will be used instead.
   * @param courseReversalBankAngleTable A lookup table for course reversal turn bank angle, in degrees, versus
   * airplane speed, in knots. If not defined, the general turn bank angle table will be used instead.
   * @param turnAnticipationBankAngleTable A lookup table for turn anticipation bank angle, in degrees, versus airplane
   * speed, in knots. If not defined, the general turn bank angle table will be used instead.
   */
  public updatePlaneState(
    options: Readonly<FlightPathCalculatorOptions>,
    bankAngleTable: LerpLookupTable,
    holdBankAngleTable: LerpLookupTable | undefined,
    courseReversalBankAngleTable: LerpLookupTable | undefined,
    turnAnticipationBankAngleTable: LerpLookupTable | undefined
  ): void {
    this._planePosition.set(
      SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
      SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
    );
    this._planeAltitude.set(SimVar.GetSimVarValue('INDICATED ALTITUDE', 'feet'));
    this._planeHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', 'degree');

    const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots);
    this._planeTrueAirspeed.set(Math.max(tas, options.defaultSpeed));

    switch (options.airplaneWindMode) {
      case FlightPathAirplaneWindMode.Automatic:
        this._planeWindDirection = SimVar.GetSimVarValue('AMBIENT WIND DIRECTION', SimVarValueType.Degree);
        this._planeWindSpeed.set(SimVar.GetSimVarValue('AMBIENT WIND VELOCITY', SimVarValueType.Knots));
        break;
      default:
        this._planeWindDirection = 0;
        this._planeWindSpeed.set(0);
    }

    switch (options.airplaneSpeedMode) {
      case FlightPathAirplaneSpeedMode.GroundSpeed:
        this._planeSpeed.set(Math.max(SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots), options.defaultSpeed));
        break;
      case FlightPathAirplaneSpeedMode.TrueAirspeed:
      case FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind: {
        const windSpeed = options.airplaneSpeedMode === FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind
          ? this._planeWindSpeed.number
          : 0;

        this._planeSpeed.set(Math.max(tas + windSpeed, options.defaultSpeed));
        break;
      }
      default:
        this._planeSpeed.set(options.defaultSpeed);
    }

    this._planeClimbRate.set(Math.max(SimVar.GetSimVarValue('VERTICAL SPEED', 'feet per minute'), options.defaultClimbRate));

    const planeSpeedKnots = this._planeSpeed.asUnit(UnitType.KNOT);
    this._desiredTurnRadius.set(NavMath.turnRadius(planeSpeedKnots, Math.min(bankAngleTable.get(planeSpeedKnots), options.maxBankAngle)));

    if (holdBankAngleTable) {
      this._desiredHoldTurnRadius.set(NavMath.turnRadius(planeSpeedKnots, Math.min(holdBankAngleTable.get(planeSpeedKnots), options.maxBankAngle)));
    } else {
      this._desiredHoldTurnRadius.set(this._desiredTurnRadius);
    }

    if (courseReversalBankAngleTable) {
      this._desiredCourseReversalTurnRadius.set(NavMath.turnRadius(planeSpeedKnots, Math.min(courseReversalBankAngleTable.get(planeSpeedKnots), options.maxBankAngle)));
    } else {
      this._desiredCourseReversalTurnRadius.set(this._desiredTurnRadius);
    }

    if (turnAnticipationBankAngleTable) {
      this._desiredTurnAnticipationTurnRadius.set(NavMath.turnRadius(planeSpeedKnots, Math.min(turnAnticipationBankAngleTable.get(planeSpeedKnots), options.maxBankAngle)));
    } else {
      this._desiredTurnAnticipationTurnRadius.set(this._desiredTurnRadius);
    }
  }
}
