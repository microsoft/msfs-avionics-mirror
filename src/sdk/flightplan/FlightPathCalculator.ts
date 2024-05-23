/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { GeoPoint, MagVar, NavMath } from '../geo';
import { UnitType } from '../math';
import { Facility, ICAO, LegType } from '../navigation/Facilities';
import { FacilityLoader } from '../navigation/FacilityLoader';
import { LerpLookupTable } from '../utils/datastructures/LerpLookupTable';
import { FlightPathCalculatorControlEvents } from './FlightPathCalculatorControlEvents';
import {
  ArcToFixLegCalculator, CourseToAltitudeLegCalculator, CourseToDmeLegCalculator, CourseToFixLegCalculator,
  CourseToInterceptLegCalculator as CourseToInterceptLegCalculator, CourseToManualLegCalculator, CourseToRadialLegCalculator, DirectToFixLegCalculator,
  NoPathLegCalculator, FixToDmeLegCalculator, FlightPathLegCalculator, HoldLegCalculator, ProcedureTurnLegCalculator,
  RadiusToFixLegCalculator, TrackFromFixLegCalculator, TrackToFixLegCalculator
} from './FlightPathLegCalculator';
import { FlightPathState } from './FlightPathState';
import { FlightPathTurnCalculator } from './FlightPathTurnCalculator';
import { FlightPathUtils } from './FlightPathUtils';
import { LegDefinition } from './FlightPlanning';
import { FlightPlanUtils } from './FlightPlanUtils';

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
  TrueAirspeedPlusWind = 'TrueAirspeedPlusWind'
}

/**
 * Options for a {@link FlightPathCalculator}.
 */
export interface FlightPathCalculatorOptions {
  /** The default climb rate, in feet per minute, if the plane is not yet at flying speed. */
  defaultClimbRate: number;

  /**
   * The default airplane speed, in knots. This speed is used if the airplane speed mode is `Default` or if the
   * airplane speed calculated through other means is slower than this speed.
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
};

/**
 * Initialization data for a primary {@link FlightPathCalculator} instance.
 */
type FlightPathCalculatorInitData = {
  /** The options with which the instance was initialized. */
  options: Readonly<FlightPathCalculatorOptions>;
};

/**
 * Response data for an options sync request.
 */
type FlightPathCalculatorOptionsResponse = {
  /** The UID of the request for which this response was generated. */
  uid: number;

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
  private readonly turnCalculator = new FlightPathTurnCalculator();

  private bankAngleTable: LerpLookupTable;
  private holdBankAngleTable?: LerpLookupTable;
  private courseReversalBankAngleTable?: LerpLookupTable;
  private turnAnticipationBankAngleTable?: LerpLookupTable;

  private readonly state = new FlightPathStateClass();
  private readonly options: FlightPathCalculatorOptions;

  private readonly calculateQueue: (() => void)[] = [];
  private isBusy = false;

  /**
   * Creates an instance of the FlightPathCalculator.
   * @param facilityLoader The facility loader to use with this instance.
   * @param options The options to use with this flight path calculator.
   * @param bus An instance of the EventBus.
   */
  public constructor(
    private readonly facilityLoader: FacilityLoader,
    options: Readonly<FlightPathCalculatorInitOptions>,
    private readonly bus: EventBus
  ) {
    this.id = options?.id ?? '';

    const optionsCopy = { ...options };
    delete optionsCopy.id;
    this.options = optionsCopy;

    this.bankAngleTable = this.buildBankAngleTable(this.options.bankAngle);
    this.holdBankAngleTable = this.options.holdBankAngle === null ? undefined : this.buildBankAngleTable(this.options.holdBankAngle);
    this.courseReversalBankAngleTable = this.options.courseReversalBankAngle === null ? undefined : this.buildBankAngleTable(this.options.courseReversalBankAngle);
    this.turnAnticipationBankAngleTable = this.options.turnAnticipationBankAngle === null ? undefined : this.buildBankAngleTable(this.options.turnAnticipationBankAngle);

    const eventBusTopicSuffix = this.id === '' ? '' : `_${this.id}` as const;

    const publisher = this.bus.getPublisher<FlightPathCalculatorSyncEvents>();
    const sub = this.bus.getSubscriber<FlightPathCalculatorSyncEvents & FlightPathCalculatorControlEvents>();

    const initialSyncRole = options.initSyncRole ?? 'none';

    if (initialSyncRole === 'primary') {
      publisher.pub(`flightpath_sync_init${eventBusTopicSuffix}`, { options: this.options }, true, false);

      sub.on(`flightpath_sync_options_request${eventBusTopicSuffix}`).handle(uid => {
        publisher.pub(`flightpath_sync_options_response${eventBusTopicSuffix}`, { uid, options: this.options }, true, false);
      });
    } else if (initialSyncRole === 'replica') {
      const requestUid = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER);
      sub.on(`flightpath_sync_options_response${eventBusTopicSuffix}`).handle(data => {
        if (data.uid === requestUid) {
          this.setOptions(data.options);
        }
      });
      publisher.pub(`flightpath_sync_options_request${eventBusTopicSuffix}`, requestUid, true, false);

      sub.on(`flightpath_sync_init${eventBusTopicSuffix}`).handle(data => { this.setOptions(data.options); });
    }

    sub.on(`flightpath_set_options${eventBusTopicSuffix}`).handle(this.setOptions.bind(this));
  }

  /**
   * Method to update this calculator's options.
   * @param newOptions A Partial FlightPathCalculatorOptions object.
   */
  private setOptions(newOptions: Partial<FlightPathCalculatorOptions>): void {
    for (const key in newOptions) {
      const option = newOptions[key as keyof FlightPathCalculatorOptions];
      if (option !== undefined) {
        (this.options as any)[key as keyof FlightPathCalculatorOptions] = option;

        switch (key) {
          case 'bankAngle':
            this.bankAngleTable = this.buildBankAngleTable(this.options.bankAngle);
            break;
          case 'holdBankAngle':
            this.holdBankAngleTable = this.options.holdBankAngle === null ? undefined : this.buildBankAngleTable(this.options.holdBankAngle);
            break;
          case 'courseReversalBankAngle':
            this.courseReversalBankAngleTable = this.options.courseReversalBankAngle === null ? undefined : this.buildBankAngleTable(this.options.courseReversalBankAngle);
            break;
          case 'turnAnticipationBankAngle':
            this.turnAnticipationBankAngleTable = this.options.turnAnticipationBankAngle === null ? undefined : this.buildBankAngleTable(this.options.turnAnticipationBankAngle);
            break;
        }
      }
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
  protected createLegCalculatorMap(): Record<LegType, FlightPathLegCalculator> {
    let calc;
    return {
      [LegType.Unknown]: calc = new TrackToFixLegCalculator(this.facilityCache),
      [LegType.IF]: calc,
      [LegType.TF]: calc,

      [LegType.AF]: new ArcToFixLegCalculator(this.facilityCache),

      [LegType.CD]: calc = new CourseToDmeLegCalculator(this.facilityCache),
      [LegType.VD]: calc,

      [LegType.CF]: new CourseToFixLegCalculator(this.facilityCache),

      [LegType.CR]: calc = new CourseToRadialLegCalculator(this.facilityCache),
      [LegType.VR]: calc,

      [LegType.FC]: new TrackFromFixLegCalculator(this.facilityCache),

      [LegType.FD]: new FixToDmeLegCalculator(this.facilityCache),

      [LegType.RF]: new RadiusToFixLegCalculator(this.facilityCache),

      [LegType.DF]: new DirectToFixLegCalculator(this.facilityCache),

      [LegType.FA]: calc = new CourseToAltitudeLegCalculator(this.facilityCache),
      [LegType.CA]: calc,
      [LegType.VA]: calc,

      [LegType.FM]: calc = new CourseToManualLegCalculator(this.facilityCache),
      [LegType.VM]: calc,

      [LegType.CI]: calc = new CourseToInterceptLegCalculator(this.facilityCache),
      [LegType.VI]: calc,

      [LegType.PI]: new ProcedureTurnLegCalculator(this.facilityCache),

      [LegType.HA]: calc = new HoldLegCalculator(this.facilityCache),
      [LegType.HM]: calc,
      [LegType.HF]: calc,

      [LegType.Discontinuity]: calc = new NoPathLegCalculator(this.facilityCache),
      [LegType.ThruDiscontinuity]: calc
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

      this.initCurrentLatLon(legs, initialIndex);
      this.initCurrentCourse(legs, initialIndex);
      this.initIsFallback(legs, initialIndex);

      this.calculateLegPaths(legs, activeLegIndex, initialIndex, count);
      this.turnCalculator.computeTurns(
        legs,
        initialIndex,
        count,
        this.state.desiredTurnRadius.asUnit(UnitType.METER),
        this.state.desiredCourseReversalTurnRadius.asUnit(UnitType.METER),
        this.state.desiredTurnAnticipationTurnRadius.asUnit(UnitType.METER)
      );
      this.resolveLegsIngressToEgress(legs, initialIndex, count);

      this.updateLegDistances(legs, initialIndex, count);

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
    const facilityPromises: Promise<boolean>[] = [];

    for (let i = initialIndex; i < initialIndex + count; i++) {
      this.stageFacilityLoad(legs[i].leg.fixIcao, facilityPromises);
      this.stageFacilityLoad(legs[i].leg.originIcao, facilityPromises);
      this.stageFacilityLoad(legs[i].leg.arcCenterFixIcao, facilityPromises);
    }

    if (facilityPromises.length > 0) {
      await Promise.all(facilityPromises);
    }
  }

  /**
   * Stages a facility to be loaded.
   * @param icao The ICAO of the facility.
   * @param facilityPromises The array of facility load promises to push to.
   */
  private stageFacilityLoad(icao: string, facilityPromises: Promise<boolean>[]): void {
    if (ICAO.isFacility(icao)) {
      facilityPromises.push(this.facilityLoader.getFacility(ICAO.getFacilityType(icao), icao)
        .then(facility => {
          this.facilityCache.set(icao, facility);
          return true;
        })
        .catch(() => false)
      );
    }
  }

  /**
   * Initializes the current lat/lon.
   * @param legs The legs of the flight plan to calculate.
   * @param initialIndex The index of the first leg to calculate.
   */
  private initCurrentLatLon(legs: LegDefinition[], initialIndex: number): void {
    let index = Math.min(initialIndex, legs.length);
    while (--index >= 0) {
      const leg = legs[index];
      if (FlightPlanUtils.isDiscontinuityLeg(leg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(leg.leg.type)) {
        break;
      }

      const calc = leg.calculated;
      if (calc && calc.endLat !== undefined && calc.endLon !== undefined) {
        (this.state.currentPosition ??= new GeoPoint(0, 0)).set(calc.endLat, calc.endLon);
        return;
      }
    }

    this.state.currentPosition = undefined;
  }

  /**
   * Initializes the current course.
   * @param legs The legs of the flight plan to calculate.
   * @param initialIndex The index of the first leg to calculate.
   */
  private initCurrentCourse(legs: LegDefinition[], initialIndex: number): void {
    let index = Math.min(initialIndex, legs.length);
    while (--index >= 0) {
      const leg = legs[index];
      if (leg.leg.type === LegType.Discontinuity || leg.leg.type === LegType.ThruDiscontinuity) {
        return;
      }

      const legCalc = leg.calculated;
      if (legCalc && legCalc.flightPath.length > 0) {
        this.state.currentCourse = FlightPathUtils.getLegFinalCourse(legCalc);
        if (this.state.currentCourse !== undefined) {
          return;
        }
      }
    }

    this.state.currentCourse = undefined;
  }

  /**
   * Initializes the fallback state.
   * @param legs The legs of the flight plan to calculate.
   * @param initialIndex The index of the first leg to calculate.
   */
  private initIsFallback(legs: LegDefinition[], initialIndex: number): void {
    this.state.isFallback = legs[Math.min(initialIndex, legs.length) - 1]?.calculated?.endsInFallback ?? false;
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
    for (let i = initialIndex; i < end; i++) {
      this.calculateLegPath(legs, i, activeLegIndex);
    }
  }

  /**
   * Calculates a flight path for a leg in a sequence of legs.
   * @param legs A sequence of flight plan legs.
   * @param calculateIndex The index of the leg to calculate.
   * @param activeLegIndex The index of the active leg.
   */
  private calculateLegPath(legs: LegDefinition[], calculateIndex: number, activeLegIndex: number): void {
    const definition = legs[calculateIndex];

    const calcs = this.legCalculatorMap[definition.leg.type].calculate(legs, calculateIndex, activeLegIndex, this.state, false);

    const start = calcs.flightPath[0];
    const end = calcs.flightPath[calcs.flightPath.length - 1];

    calcs.initialDtk = undefined;
    if (start !== undefined) {
      const trueDtk = FlightPathUtils.getVectorInitialCourse(start);
      if (!isNaN(trueDtk)) {
        calcs.initialDtk = MagVar.trueToMagnetic(trueDtk, start.startLat, start.startLon);
      }
    }

    calcs.startLat = start?.startLat;
    calcs.startLon = start?.startLon;
    calcs.endLat = end?.endLat;
    calcs.endLon = end?.endLon;

    if (!end && this.state.currentPosition) {
      calcs.endLat = this.state.currentPosition.lat;
      calcs.endLon = this.state.currentPosition.lon;
    }
  }

  /**
   * Resolves the ingress to egress vectors for a set of flight plan legs.
   * @param legs A sequence of flight plan legs.
   * @param initialIndex The index of the first leg to resolve.
   * @param count The number of legs to resolve.
   */
  private resolveLegsIngressToEgress(legs: LegDefinition[], initialIndex: number, count: number): void {
    const end = initialIndex + count;
    for (let i = initialIndex; i < end; i++) {
      const legCalc = legs[i].calculated;
      legCalc && FlightPathUtils.resolveIngressToEgress(legCalc);
    }
  }

  /**
   * Updates leg distances with turn anticipation.
   * @param legs A sequence of flight plan legs.
   * @param initialIndex The index of the first leg to update.
   * @param count The number of legs to update.
   */
  private updateLegDistances(legs: LegDefinition[], initialIndex: number, count: number): void {
    const end = initialIndex + count;
    for (let i = initialIndex; i < end; i++) {
      const leg = legs[i];
      const calc = leg.calculated!;

      // Calculate distance without transitions

      calc.distance = 0;
      const len = calc.flightPath.length;
      for (let j = 0; j < len; j++) {
        calc.distance += calc.flightPath[j].distance;
      }
      calc.cumulativeDistance = calc.distance + (legs[i - 1]?.calculated?.cumulativeDistance ?? 0);

      // Calculate distance with transitions

      calc.distanceWithTransitions = 0;
      const ingressLen = calc.ingress.length;
      for (let j = 0; j < ingressLen; j++) {
        calc.distanceWithTransitions += calc.ingress[j].distance;
      }
      const ingressToEgressLen = calc.ingressToEgress.length;
      for (let j = 0; j < ingressToEgressLen; j++) {
        calc.distanceWithTransitions += calc.ingressToEgress[j].distance;
      }
      const egressLen = calc.egress.length;
      for (let j = 0; j < egressLen; j++) {
        calc.distanceWithTransitions += calc.egress[j].distance;
      }
      calc.cumulativeDistanceWithTransitions = calc.distanceWithTransitions + (legs[i - 1]?.calculated?.cumulativeDistanceWithTransitions ?? 0);
    }
  }
}

/**
 * An implementation of {@link FlightPathState}
 */
class FlightPathStateClass implements FlightPathState {
  public currentPosition: GeoPoint | undefined;

  public currentCourse: number | undefined;

  public isFallback = false;

  private _planePosition = new GeoPoint(0, 0);
  public readonly planePosition = this._planePosition.readonly;

  private _planeHeading = 0;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public get planeHeading(): number {
    return this._planeHeading;
  }

  private _planeAltitude = UnitType.FOOT.createNumber(0);
  public readonly planeAltitude = this._planeAltitude.readonly;

  private _planeSpeed = UnitType.KNOT.createNumber(0);
  public readonly planeSpeed = this._planeSpeed.readonly;

  private _planeClimbRate = UnitType.FPM.createNumber(0);
  public readonly planeClimbRate = this._planeClimbRate.readonly;

  private _desiredTurnRadius = UnitType.METER.createNumber(0);
  public readonly desiredTurnRadius = this._desiredTurnRadius.readonly;

  private _desiredHoldTurnRadius = UnitType.METER.createNumber(0);
  public readonly desiredHoldTurnRadius = this._desiredHoldTurnRadius.readonly;

  private _desiredCourseReversalTurnRadius = UnitType.METER.createNumber(0);
  public readonly desiredCourseReversalTurnRadius = this._desiredCourseReversalTurnRadius.readonly;

  private _desiredTurnAnticipationTurnRadius = UnitType.METER.createNumber(0);
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
    options: FlightPathCalculatorOptions,
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

    switch (options.airplaneSpeedMode) {
      case FlightPathAirplaneSpeedMode.GroundSpeed:
        this._planeSpeed.set(Math.max(SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots), options.defaultSpeed));
        break;
      case FlightPathAirplaneSpeedMode.TrueAirspeed:
      case FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind: {
        const trueAirspeed = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots);
        const windSpeed = options.airplaneSpeedMode === FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind
          ? SimVar.GetSimVarValue('AMBIENT WIND VELOCITY', SimVarValueType.Knots)
          : 0;

        this._planeSpeed.set(Math.max(trueAirspeed + windSpeed, options.defaultSpeed));
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