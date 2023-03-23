import {
  BitFlags, CircleVector, ClockEvents, ConsumerSubject, EventBus, FlightPathUtils, FlightPathVector, FlightPathVectorFlags, FlightPlanner, GeoCircle, GeoPoint, GNSSEvents,
  LegCalculations, LegDefinition, LegType, LNavEvents, LNavTrackingState, LNavTransitionMode, LNavUtils, MagVar, NavMath, NumberUnitSubject, SubEvent, Subject,
  Subscribable, UnitType, VectorTurnDirection
} from '@microsoft/msfs-sdk';

import { LNavDataEvents } from './LNavDataEvents';

/**
 * A enumeration of waypoint alerting states.
 */
export enum WaypointAlertingState {
  None = 'None',
  ArrivingAtWaypoint = 'ArrivingAtWaypoint',
  CourseInSeconds = 'DtKinSeconds',
  CourseNow = 'DtkNow',
  HoldDirect = 'HoldDirect',
  HoldParallel = 'HoldParallel',
  HoldTeardrop = 'HoldTeardrop',
  LeftTurnInSeconds = 'LeftTurnInSeconds',
  LeftTurnNow = 'LeftTurnNow',
  ParallelTrackEnd = 'ParallelTrackEnd',
  RightTurnInSeconds = 'RightTurnInSeconds',
  RightTurnNow = 'RightTurnNow'
}

/**
 * The type of course guidance in a waypoint alerting state, if any.
 */
export enum WaypointAlertCourseType {
  DesiredTrack = 'DesiredTrack',
  Heading = 'Heading'
}

/**
 * A waypoint alert state event with a defined course.
 */
export interface WaypointAlertStateEvent {
  /** The previous alerting state. */
  previousState: WaypointAlertingState;

  /** The new alerting state. */
  newState: WaypointAlertingState;

  /** The new course, in degrees true. */
  course?: number;

  /** The new course, in degrees magnetic. */
  courseMag?: number;

  /** The type of course to follow. */
  courseType?: WaypointAlertCourseType;
}

/**
 * A class that computes the current waypoint alert state for consumers to use for waypoint alert displays.
 */
export class WaypointAlertComputer {
  private static readonly DEFAULT_NOW_ALERT_TIME = 5;
  private static readonly HOLD_ALERT_TIME = 10;

  private readonly sub = this.bus.getSubscriber<GNSSEvents & LNavDataEvents & LNavEvents & ClockEvents>();
  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime'), 0);
  private readonly groundSpeed = ConsumerSubject.create(this.sub.on('ground_speed'), 0);
  private readonly ppos = new GeoPoint(NaN, NaN);

  private readonly alongTrackSpeed = ConsumerSubject.create(this.sub.on('lnav_along_track_speed'), 0);
  private readonly distanceRemaining = ConsumerSubject.create(this.sub.on('lnavdata_egress_distance'), 0);
  private readonly currentDtk = ConsumerSubject.create(this.sub.on('lnavdata_dtk_true'), 0);
  private readonly nextDtk = ConsumerSubject.create(this.sub.on('lnavdata_next_dtk_true'), 0);
  private readonly nextDtkMag = ConsumerSubject.create(this.sub.on('lnavdata_next_dtk_mag'), 0);
  private readonly nextDtkVector = ConsumerSubject.create(this.sub.on('lnavdata_next_dtk_vector'), { globalLegIndex: -1, vectorIndex: -1 });

  private readonly lnavTrackingState = ConsumerSubject.create(this.sub.on('lnav_tracking_state'), {
    isTracking: false,
    globalLegIndex: 0,
    transitionMode: LNavTransitionMode.None,
    vectorIndex: 0,
    isSuspended: false
  }, LNavUtils.lnavTrackingStateEquals);

  private readonly _state = Subject.create<Readonly<WaypointAlertStateEvent>>({
    previousState: WaypointAlertingState.None,
    newState: WaypointAlertingState.None,
    course: undefined,
    courseType: undefined
  }, (a, b) => {
    return a.previousState === b.previousState
      && a.newState === b.newState
      && a.course === b.course
      && a.courseType === b.courseType;
  });
  /** The current alert state. */
  public readonly state = this._state as Subscribable<Readonly<WaypointAlertStateEvent>>;
  /** An event which fires every time the alert state changes. */
  public readonly onStateChanged = new SubEvent<this, Readonly<WaypointAlertStateEvent>>();
  /** The time remaining for the current alert state, or `NaN` if an alert is not active. */
  public readonly timeRemaining = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  private previousState = WaypointAlertingState.None;
  private currentState = WaypointAlertingState.None;

  private armedNowState = WaypointAlertingState.None;
  private armedNowLegIndex = -1;
  private armedNowVectorIndex = -1;
  private armedNowCourse = NaN;
  private armedNowCourseMag = NaN;
  private armedNowCourseType = WaypointAlertCourseType.DesiredTrack;
  private nowStateTimeStamp = 0;

  private stateSub = Subject.create(WaypointAlertingState.None);

  private currentCourse = NaN;
  private currentCourseMag = NaN;
  private currentCourseType = WaypointAlertCourseType.DesiredTrack;

  private readonly geoCircleCache = [new GeoCircle(new Float64Array([0, 0]), 1), new GeoCircle(new Float64Array([0, 0]), 1)];
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];

  /**
   * Creates an instance of the WaypointAlertComputer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param alertLookaheadTime The amount of time from the waypoint or target turn, in seconds, to begin alerting.
   * @param nowAlertTime The amount of time, in seconds, to keep "...NOW" alerts active after they have been triggered.
   * Defaults to five seconds.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly alertLookaheadTime: number,
    private readonly nowAlertTime = WaypointAlertComputer.DEFAULT_NOW_ALERT_TIME
  ) {
    this.stateSub.sub(this.handleStateChanged.bind(this));
    this.lnavTrackingState.sub(this.handleTrackedIndicesChanged.bind(this));

    this.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(pos => this.ppos.set(pos.lat, pos.long));
  }

  /**
   * Handles when the internal state has changed.
   * @param state The new alerting state.
   */
  private handleStateChanged(state: WaypointAlertingState): void {
    this.previousState = this.currentState;
    this.currentState = state;

    let stateEvent: WaypointAlertStateEvent;

    switch (state) {
      case WaypointAlertingState.None:
      case WaypointAlertingState.ArrivingAtWaypoint:
      case WaypointAlertingState.HoldDirect:
      case WaypointAlertingState.HoldParallel:
      case WaypointAlertingState.HoldTeardrop:
      case WaypointAlertingState.ParallelTrackEnd:
        stateEvent = { previousState: this.previousState, newState: state };
        break;
      default:
        stateEvent = { previousState: this.previousState, newState: state, course: this.currentCourse, courseMag: this.currentCourseMag, courseType: this.currentCourseType };
        break;
    }

    this._state.set(stateEvent);
    this.onStateChanged.notify(this, stateEvent);
  }

  /**
   * Handles when the LNAV tracking state changes.
   * @param state The new LNAV tracking state.
   */
  private handleTrackedIndicesChanged(state: LNavTrackingState): void {
    if (this.armedNowState !== WaypointAlertingState.None
      && this.armedNowVectorIndex === state.vectorIndex
      && this.armedNowLegIndex === state.globalLegIndex) {

      this.currentCourse = this.armedNowCourse;
      this.currentCourseMag = this.armedNowCourseMag;
      this.currentCourseType = this.armedNowCourseType;

      this.stateSub.set(this.armedNowState);
      this.nowStateTimeStamp = this.simTime.get();
      this.armedNowState = WaypointAlertingState.None;
      this.armedNowCourse = NaN;
      this.armedNowCourseType = WaypointAlertCourseType.DesiredTrack;

      this.armedNowVectorIndex = -1;
      this.armedNowLegIndex = -1;
    }
  }

  /**
   * Updates the WaypointAlertComputer.
   */
  public update(): void {
    const trackingState = this.lnavTrackingState.get();

    if (this.flightPlanner.hasActiveFlightPlan() && trackingState.isTracking && this.groundSpeed.get() >= 30) {
      const plan = this.flightPlanner.getActiveFlightPlan();

      // LNAV tracking indexes can lag behind flight plan updates, so we need to be careful when getting the tracked
      // leg because it could have been removed from the flight plan.
      const currentLegDef = plan.tryGetLeg(trackingState.globalLegIndex);
      const nextLegDef = plan.tryGetLeg(trackingState.globalLegIndex + 1);

      if (currentLegDef) {
        if (this.isInNowState()) {
          const secondsRemaining = ((this.nowStateTimeStamp + (this.nowAlertTime * 1000)) - this.simTime.get()) / 1000;
          if (secondsRemaining <= 0 || secondsRemaining > this.nowAlertTime) {
            this.stateSub.set(WaypointAlertingState.None);
            this.timeRemaining.set(NaN);
          } else {
            this.timeRemaining.set(secondsRemaining);
            return;
          }
        }
        switch (currentLegDef.leg.type) {
          case LegType.HA:
          case LegType.HF:
          case LegType.HM:
          case LegType.PI:
            this.handleHoldAndPILegs(currentLegDef, nextLegDef);
            break;
          default:
            this.handleDefaultLegs(currentLegDef, nextLegDef);
            break;
        }

        return;
      }
    }

    this.stateSub.set(WaypointAlertingState.None);
    this.timeRemaining.set(NaN);

    this.armedNowState = WaypointAlertingState.None;
    this.nowStateTimeStamp = 0;
    this.armedNowVectorIndex = -1;
  }

  /**
   * Handles the default legs cases.
   * @param currentLegDef The definition of the current leg.
   * @param nextLegDef The next leg definition.
   */
  private handleDefaultLegs(currentLegDef: LegDefinition, nextLegDef: LegDefinition | null): void {
    const alongTrackSpeed = this.alongTrackSpeed.get();
    const distanceRemaining = this.distanceRemaining.get();

    const secondsRemaining = alongTrackSpeed !== 0 ? (distanceRemaining / alongTrackSpeed) * 3600 : Infinity;

    if (this.nextDtkVector.get().globalLegIndex === -1) {
      this.handleArrivingAtWaypoint(secondsRemaining);
    } else {
      const enteredHold = this.tryEnterHoldState(nextLegDef, secondsRemaining);
      if (!enteredHold && nextLegDef !== null && nextLegDef.calculated !== undefined && currentLegDef.calculated !== undefined) {
        const withinAlertDistance = secondsRemaining >= 0 && secondsRemaining <= this.alertLookaheadTime;

        let nextDtk = this.nextDtk.get();
        let nextDtkMag = this.nextDtkMag.get();
        if (nextLegDef.calculated !== undefined && this.legIsHold(nextLegDef)) {
          nextDtk = this.getInitialHoldDtk(nextLegDef.calculated);
          // use magvar at the hold fix (which is always located at the end of the hold leg)
          nextDtkMag = nextLegDef.calculated.endLat !== undefined && nextLegDef.calculated.endLon !== undefined
            ? MagVar.trueToMagnetic(nextDtk, nextLegDef.calculated.endLat, nextLegDef.calculated.endLon)
            : nextDtk;
        } else if (nextLegDef.calculated !== undefined && nextLegDef.leg.type === LegType.PI) {
          nextDtk = this.getInitialPIDtk(nextLegDef.calculated);
          // use magvar at the leg origin
          nextDtkMag = nextLegDef.calculated.startLat !== undefined && nextLegDef.calculated.startLon !== undefined
            ? MagVar.trueToMagnetic(nextDtk, nextLegDef.calculated.startLat, nextLegDef.calculated.startLon)
            : nextDtk;
        }

        const egressVector = currentLegDef.calculated.egress[0];
        let turnDirection: VectorTurnDirection | undefined = undefined;
        if (egressVector !== undefined) {
          turnDirection = FlightPathUtils.getTurnDirectionFromCircle(FlightPathUtils.setGeoCircleFromVector(currentLegDef.calculated.egress[0], this.geoCircleCache[0]));
        }

        const isNextLegHeading = nextLegDef.leg.type === LegType.VA || nextLegDef.leg.type === LegType.VD
          || nextLegDef.leg.type === LegType.VI || nextLegDef.leg.type === LegType.VR;

        this.currentCourse = nextDtk;
        this.currentCourseMag = nextDtkMag;
        this.currentCourseType = isNextLegHeading ? WaypointAlertCourseType.Heading : WaypointAlertCourseType.DesiredTrack;

        if (withinAlertDistance) {
          const currentLegSupportsTurn = this.doesLegTypeSupportTurn(currentLegDef.leg.type, false);
          const nextLegSupportsTurn = this.doesLegTypeSupportTurn(nextLegDef.leg.type, true);
          const turnIsLargerThan10Degrees = currentLegSupportsTurn && nextLegSupportsTurn && Math.abs(NavMath.diffAngle(nextDtk, this.currentDtk.get())) >= 10;

          if (turnDirection !== undefined && currentLegSupportsTurn && nextLegSupportsTurn && turnIsLargerThan10Degrees) {
            this.stateSub.set(turnDirection === 'left' ? WaypointAlertingState.LeftTurnInSeconds : WaypointAlertingState.RightTurnInSeconds);
            this.armedNowState = turnDirection === 'left' ? WaypointAlertingState.LeftTurnNow : WaypointAlertingState.RightTurnNow;
          } else {
            this.stateSub.set(WaypointAlertingState.CourseInSeconds);
            this.armedNowState = WaypointAlertingState.CourseNow;
          }

          this.armedNowCourse = this.currentCourse;
          this.armedNowCourseMag = this.currentCourseMag;
          this.armedNowCourseType = this.currentCourseType;
          this.armedNowVectorIndex = 0;

          const trackingState = this.lnavTrackingState.get();
          if (currentLegDef.calculated.egress.length > 0) {
            this.armedNowLegIndex = trackingState.globalLegIndex;
          } else {
            this.armedNowLegIndex = trackingState.globalLegIndex + 1;
          }
          this.timeRemaining.set(secondsRemaining);
        } else if (!this.isInNowState()) {
          this.stateSub.set(WaypointAlertingState.None);
          this.timeRemaining.set(NaN);
        }
      }
    }
  }

  /**
   * Checks whether the provided leg type can support a WaypointAlertingState.LeftTurnNow/RightTurnNow
   * instead of a WaypointAlertingState.Course message.
   * @param legType The leg type.
   * @param isNextLeg Whether this leg type is the next leg (true) or the current leg (false).
   * @returns Whether or not the leg supports a LeftTurn/RightTurn WaypointAlertingState.
   */
  private doesLegTypeSupportTurn(legType: LegType, isNextLeg: boolean): boolean {
    switch (legType) {
      case LegType.FM:
      case LegType.VM:
      case LegType.CA:
      case LegType.FA:
      case LegType.VA:
      case LegType.FC:
      case LegType.CD:
      case LegType.FD:
      case LegType.VD:
      case LegType.CR:
      case LegType.VR:
      case LegType.CI:
      case LegType.VI:
      case LegType.PI:
        return isNextLeg ? true : false;
      case LegType.HA:
      case LegType.HF:
      case LegType.HM:
        return false;
      default:
        return true;
    }
  }

  /**
   * Checks whether or not the current state is a now type state.
   * @returns True if in a now type state, false otherwise.
   */
  private isInNowState(): boolean {
    const currentState = this.stateSub.get();
    return currentState === WaypointAlertingState.CourseNow || currentState === WaypointAlertingState.LeftTurnNow || currentState === WaypointAlertingState.RightTurnNow;
  }

  /**
   * Gets the initial DTK for a hold leg.
   * @param nextLegCalcs The next leg in the flight plan.
   * @returns The DTK in degrees true, or undefined if one could not be determined.
   */
  private getInitialHoldDtk(nextLegCalcs: LegCalculations): number {
    const firstVector = nextLegCalcs.ingress[0] as FlightPathVector | undefined;

    const entryFlags = BitFlags.union(FlightPathVectorFlags.HoldParallelEntry, FlightPathVectorFlags.HoldTeardropEntry);
    const isParallelOrTeardrop = firstVector && BitFlags.isAny(firstVector.flags, entryFlags);

    if (isParallelOrTeardrop) {
      if (FlightPathUtils.isVectorGreatCircle(firstVector)) {
        return FlightPathUtils.getVectorInitialCourse(firstVector);
      } else {
        //Since start is exclusive, use -1 instead of 0 here
        const turnEndVector = this.getNextTurnIndex(-1, nextLegCalcs.ingress, true);
        return FlightPathUtils.getVectorFinalCourse(nextLegCalcs.ingress[turnEndVector]);
      }
    } else {
      return FlightPathUtils.getVectorInitialCourse(nextLegCalcs.flightPath[1]);
    }
  }

  /**
   * Gets the initial DTK for a PI leg.
   * @param nextLegCalcs The leg calculations for the next leg in the flight plan.
   * @returns The DTK in degrees true.
   */
  private getInitialPIDtk(nextLegCalcs: LegCalculations): number {
    return FlightPathUtils.getVectorFinalCourse(nextLegCalcs.flightPath[0]);
  }

  /**
   * Handles alerting while on hold and procedure turn legs.
   * @param currentLegDef The definition of the current leg.
   * @param nextLegDef The definition of the next leg.
   */
  private handleHoldAndPILegs(currentLegDef: LegDefinition, nextLegDef: LegDefinition | null): void {
    const trackingState = this.lnavTrackingState.get();
    const transitionMode = trackingState.transitionMode;
    const flightPath = transitionMode === LNavTransitionMode.Ingress ? currentLegDef.calculated?.ingress : currentLegDef.calculated?.flightPath;
    const alongTrackSpeed = this.alongTrackSpeed.get();

    let turnVectorIndex = -1;
    if (flightPath !== undefined && !FlightPathUtils.isVectorGreatCircle(flightPath[trackingState.vectorIndex])) {
      const currentTurnEnd = this.getNextTurnIndex(trackingState.vectorIndex - 1, flightPath, true);
      if (currentTurnEnd !== -1) {
        turnVectorIndex = this.getNextTurnIndex(currentTurnEnd, flightPath, false);
      }
    } else {
      turnVectorIndex = this.getNextTurnIndex(trackingState.vectorIndex, flightPath, false);
    }

    if (this.legIsHold(currentLegDef) && turnVectorIndex === -1 && currentLegDef.calculated !== undefined && transitionMode === LNavTransitionMode.None) {
      if (trackingState.isSuspended) {
        turnVectorIndex = currentLegDef.calculated.flightPath.length - 4;
      } else {
        this.handleDefaultLegs(currentLegDef, nextLegDef);
        return;
      }
    }

    const vector = flightPath !== undefined ? flightPath[turnVectorIndex] : undefined;
    if (turnVectorIndex !== -1 && vector !== undefined) {
      const distanceRemaining = this.getSegmentDistanceRemaining(trackingState.vectorIndex, turnVectorIndex, flightPath);
      const secondsRemaining = alongTrackSpeed !== 0 ? (distanceRemaining / alongTrackSpeed) * 3600 : Infinity;

      const withinAlertDistance = secondsRemaining >= 0 && secondsRemaining <= this.alertLookaheadTime;

      const turnEndVectorIndex = this.getNextTurnIndex(trackingState.vectorIndex, flightPath, true);
      let turnEndVector = flightPath !== undefined ? flightPath[turnEndVectorIndex] : undefined;

      let nextDtk = FlightPathUtils.getVectorFinalCourse(vector);
      let nextDtkMag = MagVar.trueToMagnetic(nextDtk, vector.endLat, vector.endLon);

      //If we're at the end of a hold entry, the real DTK is the end course of the first racetrack leg
      if (flightPath !== undefined && turnEndVectorIndex === flightPath.length - 1 && transitionMode === LNavTransitionMode.Ingress) {
        turnEndVector = currentLegDef.calculated?.flightPath[0];
      }

      if (turnEndVector !== undefined) {
        nextDtk = FlightPathUtils.getVectorFinalCourse(turnEndVector);
        nextDtkMag = MagVar.trueToMagnetic(nextDtk, turnEndVector.endLat, turnEndVector.endLon);
      }

      this.currentCourse = nextDtk;
      this.currentCourseMag = nextDtkMag;
      this.currentCourseType = WaypointAlertCourseType.DesiredTrack;

      const turnDirection = FlightPathUtils.getTurnDirectionFromCircle(FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]));

      if (withinAlertDistance) {
        this.stateSub.set(turnDirection === 'left' ? WaypointAlertingState.LeftTurnInSeconds : WaypointAlertingState.RightTurnInSeconds);
        this.armedNowState = turnDirection === 'left' ? WaypointAlertingState.LeftTurnNow : WaypointAlertingState.RightTurnNow;
        this.armedNowVectorIndex = turnVectorIndex;
        this.armedNowLegIndex = trackingState.globalLegIndex;

        this.armedNowCourse = this.currentCourse;
        this.armedNowCourseMag = this.currentCourseMag;
        this.armedNowCourseType = this.currentCourseType;

        this.timeRemaining.set(secondsRemaining);
      } else if (!this.isInNowState()) {
        this.stateSub.set(WaypointAlertingState.None);
        this.timeRemaining.set(NaN);
      }
    } else if (!this.isInNowState()) {
      this.stateSub.set(WaypointAlertingState.None);
      this.timeRemaining.set(NaN);
    }
  }

  /**
   * Determines if a leg is a hold leg.
   * @param legDef The leg definition to check.
   * @returns True if a hold, false otherwise.
   */
  private legIsHold(legDef: LegDefinition): boolean {
    return legDef.leg.type === LegType.HA || legDef.leg.type === LegType.HF || legDef.leg.type === LegType.HM;
  }

  /**
   * Gets the next turn vector index in a set of leg calculations.
   * @param startIndex The index, non-inclusive, to start searching at.
   * @param flightPath The set of leg vectors to pull from.
   * @param includeContinuous Whether or not to include turns that are continous to the next turn.
   * @returns The next turn vector index, or -1 if none found.
   */
  private getNextTurnIndex(startIndex: number, flightPath: CircleVector[] | undefined, includeContinuous: boolean): number {
    let foundVectorIndex = -1;

    if (flightPath !== undefined) {
      let currentVector: CircleVector | undefined = undefined;

      for (let i = startIndex + 1; i < flightPath.length; i++) {
        if (currentVector !== undefined) {
          if (this.areTurnsContinuous(currentVector, flightPath[i])) {
            currentVector = flightPath[i];
            foundVectorIndex = i;
          } else {
            return foundVectorIndex;
          }
        }

        if (!FlightPathUtils.isVectorGreatCircle(flightPath[i])) {
          currentVector = flightPath[i];
          foundVectorIndex = i;

          if (!includeContinuous) {
            return foundVectorIndex;
          }
        }
      }
    }

    return foundVectorIndex;
  }

  /**
   * Checks to see if two turn vectors are effectively continous (a continuation of the same circle).
   * @param a The first vector.
   * @param b The second vector.
   * @returns Whether or not the two vectors are continuous.
   */
  private areTurnsContinuous(a: CircleVector, b: CircleVector): boolean {
    //If we're on a turn already, then we only need to check radii
    if (Math.abs(a.radius - b.radius) <= GeoCircle.ANGULAR_TOLERANCE) {
      return true;
    }

    return false;
  }

  /**
   * Gets the amount of distance, in nautical miles, remaining before the end of a portion of a leg.
   * @param startIndex The start vector index, inclusive.
   * @param endIndex The end vector index, exclusive.
   * @param flightPath The set of leg vectors to pull from.
   * @returns The amount of distance remaining.
   */
  private getSegmentDistanceRemaining(startIndex: number, endIndex: number, flightPath: CircleVector[] | undefined): number {
    if (flightPath !== undefined) {
      let distance = 0;

      //For holds, our end index outbound turn is vector 0, so fake this in order to
      //at least count the one inbound vector's remaining distance
      if (endIndex < startIndex) {
        endIndex = flightPath.length;
      }

      for (let i = startIndex; i < endIndex; i++) {
        const vector = flightPath[i];

        if (i === startIndex) {
          const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
          const start = this.geoPointCache[0].set(vector.startLat, vector.startLon);
          const end = this.geoPointCache[1].set(vector.endLat, vector.endLon);

          const arcDistance = FlightPathUtils.getAlongArcSignedDistance(circle, start, end, this.ppos);
          distance += UnitType.METER.convertTo(vector.distance, UnitType.NMILE) - UnitType.GA_RADIAN.convertTo(arcDistance, UnitType.NMILE);
        } else {
          distance += UnitType.METER.convertTo(vector.distance, UnitType.NMILE);
        }
      }

      return distance;
    }

    return NaN;
  }

  /**
   * Attempts to enter the hold state if applicable.
   * @param nextLegDef The next leg in the plan.
   * @param secondsRemaining The number of seconds remaining before the waypoint.
   * @returns True if entered a hold state, false otherwise.
   */
  private tryEnterHoldState(nextLegDef: LegDefinition | null, secondsRemaining: number): boolean {
    const isNextLegHold = nextLegDef !== null && this.legIsHold(nextLegDef);

    if (isNextLegHold && nextLegDef.calculated !== undefined && secondsRemaining >= 0) {
      let holdState = WaypointAlertingState.HoldDirect;

      if (nextLegDef.calculated.ingress.length > 0) {
        if (BitFlags.isAny(nextLegDef.calculated.ingress[0].flags, FlightPathVectorFlags.HoldParallelEntry)) {
          holdState = WaypointAlertingState.HoldParallel;
        } else if (BitFlags.isAny(nextLegDef.calculated.ingress[0].flags, FlightPathVectorFlags.HoldTeardropEntry)) {
          holdState = WaypointAlertingState.HoldTeardrop;
        }
      }

      const holdAlertMinimum = this.alertLookaheadTime;
      const holdAlertMaximum = holdAlertMinimum + WaypointAlertComputer.HOLD_ALERT_TIME;

      const withinAlertDistance = secondsRemaining <= holdAlertMaximum && secondsRemaining > holdAlertMinimum;
      if (withinAlertDistance) {
        this.stateSub.set(holdState);
        this.timeRemaining.set(secondsRemaining - this.alertLookaheadTime);

        return true;
      }
    }

    return false;
  }

  /**
   * Handles when the computer is potentially in the ArrivingAtWaypoint state.
   * @param secondsRemaining The number of seconds remaining until the waypoint.
   */
  private handleArrivingAtWaypoint(secondsRemaining: number): void {
    if (secondsRemaining < 0) {
      this.stateSub.set(WaypointAlertingState.None);
      this.timeRemaining.set(NaN);
    } else {
      const withinAlertDistance = secondsRemaining <= this.alertLookaheadTime;
      this.stateSub.set(withinAlertDistance ? WaypointAlertingState.ArrivingAtWaypoint : WaypointAlertingState.None);
      this.timeRemaining.set(withinAlertDistance ? secondsRemaining : NaN);
    }
  }
}