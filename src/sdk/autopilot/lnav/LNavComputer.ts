import { ConsumerSubject } from '../../data/ConsumerSubject';
import { EventBus, Publisher } from '../../data/EventBus';
import { FlightPathUtils } from '../../flightplan/flightpath/FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags } from '../../flightplan/flightpath/FlightPathVector';
import { ActiveLegType, FlightPlan } from '../../flightplan/FlightPlan';
import { FlightPlanner } from '../../flightplan/FlightPlanner';
import { LegDefinition, LegDefinitionFlags } from '../../flightplan/FlightPlanning';
import { GeoCircle } from '../../geo/GeoCircle';
import { LatLonInterface } from '../../geo/GeoInterfaces';
import { GeoPoint } from '../../geo/GeoPoint';
import { MagVar } from '../../geo/MagVar';
import { NavMath } from '../../geo/NavMath';
import { APEvents } from '../../instruments/APPublisher';
import { BitFlags } from '../../math/BitFlags';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Vec3Math } from '../../math/VecMath';
import { FixTypeFlags, LegType } from '../../navigation/Facilities';
import { Accessible } from '../../sub/Accessible';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { DefaultLNavComputerDataProvider } from './DefaultLNavComputerDataProvider';
import { LNavControlEvents } from './LNavControlEvents';
import { BaseLNavEvents, LNavEvents } from './LNavEvents';
import { LNavEventBusTopicPublisher, LNavOverrideModule } from './LNavOverrideModule';
import { LNavState, LNavSteerCommand, LNavTransitionMode } from './LNavTypes';
import { LNavUtils } from './LNavUtils';

/**
 * A provider of data for {@link LNavComputer}.
 */
export interface LNavComputerDataProvider {
  /** The airplane's position. If data is not available, then `NaN` is written to one or both lat/lon properties. */
  readonly planePos: Accessible<Readonly<LatLonInterface>>;

  /** The airplane's ground speed, in knots, or `null` if data is not available. */
  readonly gs: Accessible<number | null>;

  /** The airplane's true ground track, in degrees, or `null` if data is not available. */
  readonly track: Accessible<number | null>;

  /** The airplane's true heading, in degrees, or `null` if data is not available. */
  readonly heading: Accessible<number | null>;

  /** The magnetic variation at the airplane's position, in degrees east, or `null` if data is not available. */
  readonly magVar: Accessible<number | null>;

  /** The airplane's true airspeed, in knots, or `null` if data is not available. */
  readonly tas: Accessible<number | null>;
}

/**
 * Calculates an intercept angle, in degrees, to capture the desired GPS track for {@link LNavComputer}.
 * @param dtk The desired track, in degrees true.
 * @param xtk The cross-track error, in nautical miles. Positive values indicate that the plane is to the right of the
 * desired track.
 * @param tas The true airspeed of the plane, in knots.
 * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
 */
export type LNavInterceptFunc = (dtk: number, xtk: number, tas: number) => number;

/**
 * Options for {@link LNavComputer}.
 */
export type LNavComputerOptions = {
  /**
   * The provider from which to source data. If not defined, then an instance of {@link DefaultLNavComputerDataProvider}
   * that always provides valid data will be used.
   */
  dataProvider?: LNavComputerDataProvider;

  /**
   * The maximum bank angle, in degrees, supported by the computer, or a function which returns it. If not defined,
   * then the computer will use the value published to the event bus for the autopilot's maximum bank angle. Defaults
   * to `undefined`.
   */
  maxBankAngle?: number | (() => number) | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, then a function that
   * computes intercept angles tuned for slow GA aircraft will be used.
   */
  intercept?: LNavInterceptFunc;

  /**
   * Whether the computer supports vector anticipation. If `true`, the computer will begin tracking the next flight
   * path vector in advance based on the predicted amount of time required to transition to the new bank angle required
   * to track the upcoming vector. Defaults to `false`.
   */
  hasVectorAnticipation?: boolean;

  /**
   * The bank rate used to determine the vector anticipation distance, in degrees per second. Ignored if
   * `hasVectorAnticipation` is `false`. Defaults to `5`.
   */
  vectorAnticipationBankRate?: number;

  /**
   * Whether to disable auto-suspend at the missed approach point. If `true`, the computer will not suspend sequencing
   * once the missed approach point is the active leg. Defaults to `false`.
   */
  disableAutoSuspendAtMissedApproachPoint?: boolean;
};

/**
 * Data used by {@link LNavComputer}.
 */
type LNavComputerData = {
  /** The airplane's position. If data is not available, then `planePos.isValid()` will return false. */
  readonly planePos: GeoPoint;

  /** The airplane's ground speed, in knots, or `null` if data is not available. */
  gs: number | null;

  /** The airplane's true ground track, in degrees, or `null` if data is not available. */
  track: number | null;

  /** The airplane's true heading, in degrees, or `null` if data is not available. */
  heading: number | null;

  /** The magnetic variation at the airplane's position, in degrees east, or `null` if data is not available. */
  magVar: number | null;

  /** The airplane's true airspeed, in knots, or `null` if data is not available. */
  tas: number | null;
};

/**
 * Data used by {@link LNavComputer} that has valid data required for LNAV tracking.
 */
type LNavComputerDataTrackingValid = Omit<LNavComputerData, 'planePos' | 'gs' | 'track'> & {
  /** The airplane's position. */
  readonly planePos: GeoPoint;

  /** The airplane's ground speed, in knots. */
  gs: number;

  /** The airplane's true ground track, in degrees. */
  track: number;
};

/**
 * An implementation of {@link LNavEventBusTopicPublisher}.
 */
class LNavTopicPublisher<T extends keyof BaseLNavEvents> implements LNavEventBusTopicPublisher<T> {
  /** @inheritDoc */
  public readonly topic: T | `${T}_${number}`;

  /** @inheritDoc */
  public readonly value: BaseLNavEvents[T];

  /**
   * Creates a new instance of LNavTopicPublisher.
   * @param publisher The publisher to use to publish this entry's topic.
   * @param topic The topic name.
   * @param initialValue The topic's initial value.
   */
  public constructor(private readonly publisher: Publisher<LNavEvents>, topic: T | `${T}_${number}`, initialValue: BaseLNavEvents[T]) {
    this.topic = topic;
    this.value = initialValue;
  }

  /** @inheritDoc */
  public publish(value?: BaseLNavEvents[T]): void {
    if (value !== this.value) {
      if (value !== undefined) {
        (this.value as BaseLNavEvents[T]) = value;
      }

      this.publisher.pub(this.topic, this.value as any, true, true);
    }
  }
}

/**
 * A computer that calculates lateral navigation guidance for an active flight plan.
 */
export class LNavComputer {
  private static readonly ANGULAR_TOLERANCE = GeoCircle.ANGULAR_TOLERANCE;
  private static readonly ANGULAR_TOLERANCE_METERS = UnitType.GA_RADIAN.convertTo(GeoCircle.ANGULAR_TOLERANCE, UnitType.METER);

  private readonly vec3Cache = [Vec3Math.create(), Vec3Math.create()];
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private readonly geoCircleCache = [new GeoCircle(Vec3Math.create(), 0)];

  private readonly publisher = this.bus.getPublisher<LNavEvents>();

  private readonly defaultDataProvider?: DefaultLNavComputerDataProvider;
  private readonly dataProvider: LNavComputerDataProvider;

  private readonly data: LNavComputerData = {
    planePos: new GeoPoint(NaN, NaN),
    gs: null,
    track: null,
    heading: null,
    magVar: null,
    tas: 0
  };

  private currentLeg: LegDefinition | undefined = undefined;
  private currentVector: FlightPathVector | undefined = undefined;

  private dtk = 0;
  private xtk = 0;
  private courseToSteer: number | null = null;
  private isSteerHeading = false;
  private alongVectorDistance = 0;
  private vectorDistanceRemaining = 0;
  private vectorAnticipationDistance = 0;
  private alongTrackSpeed = 0;

  private anticipationVector: FlightPathVector | undefined = undefined;

  private anticipationDtk = 0;
  private anticipationXtk = 0;

  private inhibitNextSequence = false;

  private trackedHeadingVector: FlightPathVector | undefined = undefined;

  private readonly currentState: LNavState = {
    globalLegIndex: 0,
    transitionMode: LNavTransitionMode.None,
    vectorIndex: 0,
    isSuspended: false,
    inhibitedSuspendLegIndex: -1,
    resetVectorsOnSuspendEnd: false,
    isMissedApproachActive: false
  };

  private readonly anticipationState: LNavState = {
    globalLegIndex: 0,
    transitionMode: LNavTransitionMode.None,
    vectorIndex: 0,
    isSuspended: false,
    inhibitedSuspendLegIndex: -1,
    resetVectorsOnSuspendEnd: false,
    isMissedApproachActive: false
  };

  private awaitCalculateId = 0;
  private isAwaitingCalculate = false;

  private readonly eventBusTopicPublishers: {
    [P in keyof BaseLNavEvents]: LNavTopicPublisher<P>;
  };

  private readonly maxBankAngleFunc: () => number;
  private readonly interceptFunc?: LNavInterceptFunc;
  private readonly hasVectorAnticipation: boolean;
  private readonly vectorAnticipationBankRate: number;
  private readonly disableAutoSuspendAtMissedApproachPoint: boolean;

  private readonly steerCommandBuffer: [LNavSteerCommand, LNavSteerCommand] = [
    { isValid: false, isHeading: false, courseToSteer: 0, trackRadius: 0, dtk: 0, xtk: 0, tae: 0 },
    { isValid: false, isHeading: false, courseToSteer: 0, trackRadius: 0, dtk: 0, xtk: 0, tae: 0 }
  ];

  private readonly _steerCommand = Subject.create(
    this.steerCommandBuffer[0],
    (a, b) => {
      if (!a.isValid && !b.isValid) {
        return true;
      }

      return a.isValid === b.isValid
        && a.isHeading === b.isHeading
        && a.courseToSteer === b.courseToSteer
        && a.trackRadius === b.trackRadius
        && a.dtk === b.dtk
        && a.xtk === b.xtk
        && a.tae === b.tae;
    }
  );
  /** The current steering command calculated by this computer. */
  public readonly steerCommand = this._steerCommand as Subscribable<Readonly<LNavSteerCommand>>;

  /**
   * Creates a new instance of LNavComputer.
   * @param index The index of this computer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner from which to source the active flight plan.
   * @param overrideModule A module that can optionally override this computer's tracking behavior.
   * @param options Options with which to configure the new computer.
   * @throws Error if `index` is not a non-negative integer.
   */
  public constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly overrideModule?: LNavOverrideModule,
    options?: Readonly<LNavComputerOptions>
  ) {
    if (!LNavUtils.isValidLNavIndex(index)) {
      throw new Error(`LNavComputer: invalid index (${index}) specified (must be a non-negative integer)`);
    }

    this.dataProvider = options?.dataProvider ?? (this.defaultDataProvider = new DefaultLNavComputerDataProvider());

    const eventBusTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.index);
    this.eventBusTopicPublishers = {
      'lnav_dtk': new LNavTopicPublisher<'lnav_dtk'>(this.publisher, `lnav_dtk${eventBusTopicSuffix}`, 0),
      'lnav_xtk': new LNavTopicPublisher<'lnav_xtk'>(this.publisher, `lnav_xtk${eventBusTopicSuffix}`, 0),
      'lnav_is_tracking': new LNavTopicPublisher<'lnav_is_tracking'>(this.publisher, `lnav_is_tracking${eventBusTopicSuffix}`, false),
      'lnav_tracked_leg_index': new LNavTopicPublisher<'lnav_tracked_leg_index'>(this.publisher, `lnav_tracked_leg_index${eventBusTopicSuffix}`, 0),
      'lnav_transition_mode': new LNavTopicPublisher<'lnav_transition_mode'>(this.publisher, `lnav_transition_mode${eventBusTopicSuffix}`, LNavTransitionMode.None),
      'lnav_tracked_vector_index': new LNavTopicPublisher<'lnav_tracked_vector_index'>(this.publisher, `lnav_tracked_vector_index${eventBusTopicSuffix}`, 0),
      'lnav_course_to_steer': new LNavTopicPublisher<'lnav_course_to_steer'>(this.publisher, `lnav_course_to_steer${eventBusTopicSuffix}`, null),
      'lnav_is_steer_heading': new LNavTopicPublisher<'lnav_is_steer_heading'>(this.publisher, `lnav_is_steer_heading${eventBusTopicSuffix}`, false),
      'lnav_is_suspended': new LNavTopicPublisher<'lnav_is_suspended'>(this.publisher, `lnav_is_suspended${eventBusTopicSuffix}`, false),
      'lnav_leg_distance_along': new LNavTopicPublisher<'lnav_leg_distance_along'>(this.publisher, `lnav_leg_distance_along${eventBusTopicSuffix}`, 0),
      'lnav_leg_distance_remaining': new LNavTopicPublisher<'lnav_leg_distance_remaining'>(this.publisher, `lnav_leg_distance_remaining${eventBusTopicSuffix}`, 0),
      'lnav_vector_distance_along': new LNavTopicPublisher<'lnav_vector_distance_along'>(this.publisher, `lnav_vector_distance_along${eventBusTopicSuffix}`, 0),
      'lnav_vector_distance_remaining': new LNavTopicPublisher<'lnav_vector_distance_remaining'>(this.publisher, `lnav_vector_distance_remaining${eventBusTopicSuffix}`, 0),
      'lnav_vector_anticipation_distance': new LNavTopicPublisher<'lnav_vector_anticipation_distance'>(this.publisher, `lnav_vector_anticipation_distance${eventBusTopicSuffix}`, 0),
      'lnav_along_track_speed': new LNavTopicPublisher<'lnav_along_track_speed'>(this.publisher, `lnav_along_track_speed${eventBusTopicSuffix}`, 0),
      'lnav_tracking_state': new LNavTopicPublisher<'lnav_tracking_state'>(this.publisher, `lnav_tracking_state${eventBusTopicSuffix}`, {
        isTracking: false,
        globalLegIndex: 0,
        transitionMode: LNavTransitionMode.None,
        vectorIndex: 0,
        isSuspended: false
      }),
      'lnav_is_awaiting_calc': new LNavTopicPublisher<'lnav_is_awaiting_calc'>(this.publisher, `lnav_is_awaiting_calc${eventBusTopicSuffix}`, false),
    };

    const sub = bus.getSubscriber<APEvents & LNavControlEvents>();

    this.hasVectorAnticipation = options?.hasVectorAnticipation ?? false;
    this.disableAutoSuspendAtMissedApproachPoint = options?.disableAutoSuspendAtMissedApproachPoint ?? false;
    this.vectorAnticipationBankRate = options?.vectorAnticipationBankRate ?? 5;

    const maxBankAngleOpt = options?.maxBankAngle ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxBankAngleFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxBankAngleFunc = maxBankAngleOpt;
        break;
      default: {
        const maxBankAngle = ConsumerSubject.create(sub.on('ap_max_bank_value'), 0);
        this.maxBankAngleFunc = maxBankAngle.get.bind(maxBankAngle);
      }
    }

    this.interceptFunc = options?.intercept;

    sub.on(`suspend_sequencing${eventBusTopicSuffix}`).handle(suspend => {
      const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

      if (flightPlan) {
        // We are receiving an explicit command to suspend, so clear any suspend inhibits.
        if (suspend) {
          this.currentState.inhibitedSuspendLegIndex = -1;
        }

        this.trySetSuspended(flightPlan, this.currentState, suspend, this.currentState, false, false);
      }
    });

    sub.on(`activate_missed_approach${eventBusTopicSuffix}`).handle((v) => {
      this.currentState.isMissedApproachActive = v;
    });

    sub.on(`lnav_inhibit_next_sequence${eventBusTopicSuffix}`).handle(inhibit => {
      this.inhibitNextSequence = inhibit;
      if (inhibit) {
        this.currentState.inhibitedSuspendLegIndex = -1;
      }
    });

    this.flightPlanner.onEvent('fplActiveLegChange').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex && e.type === ActiveLegType.Lateral) {
        this.currentState.inhibitedSuspendLegIndex = -1;
        this.resetVectors();
      }
    });

    this.flightPlanner.onEvent('fplIndexChanged').handle(() => {
      this.resetVectors();
    });

    this.flightPlanner.onEvent('fplCopied').handle((e) => {
      if (e.targetPlanIndex === this.flightPlanner.activePlanIndex) {
        this.resetVectors();
      }
    });

    this.republishEventBusTopics();
  }

  /**
   * Resets the current vectors and transition mode.
   */
  private resetVectors(): void {
    this.currentState.vectorIndex = 0;
    this.currentState.transitionMode = LNavTransitionMode.Ingress;
    this.inhibitNextSequence = false;
    this.trackedHeadingVector = undefined;
    this.awaitCalculate();
  }

  /**
   * Checks whether a flight path vector can be tracked.
   * @param vector The flight path vector to check.
   * @returns Whether the specified flight path vector can be tracked.
   */
  private canTrackVector(vector: FlightPathVector): boolean {
    return !BitFlags.isAny(vector.flags, FlightPathVectorFlags.Discontinuity)
      && vector.radius > LNavComputer.ANGULAR_TOLERANCE
      && vector.distance > LNavComputer.ANGULAR_TOLERANCE_METERS;
  }

  /**
   * Updates this computer.
   */
  public update(): void {
    this.updateData();

    this.eventBusTopicPublishers['lnav_is_awaiting_calc'].publish(this.isAwaitingCalculate);

    let clearInhibitNextSequence = false;

    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
    this.currentState.globalLegIndex = flightPlan ? flightPlan.activeLateralLeg : 0;

    let isTracking
      = !!flightPlan
      && this.currentState.globalLegIndex <= flightPlan.length - 1
      && this.isTrackingDataValid();

    let didUpdateSteerCommand = false;

    if (flightPlan && isTracking) {
      if (this.isAwaitingCalculate) {
        return;
      }

      const dataTrackingValid = this.data as LNavComputerDataTrackingValid;

      this.currentLeg = flightPlan.getLeg(this.currentState.globalLegIndex);

      // We don't want to clear the inhibit next sequence flag until the active leg has been calculated
      // since we never sequence through non-calculated legs.
      clearInhibitNextSequence = !!this.currentLeg.calculated;

      this.calculateTracking(dataTrackingValid, flightPlan);

      if (this.isAwaitingCalculate) {
        return;
      }

      if (this.hasVectorAnticipation) {
        this.updateVectorAnticipation(dataTrackingValid, flightPlan);
      }

      isTracking = this.currentState.globalLegIndex < flightPlan.length
        && this.currentVector !== undefined
        && this.canTrackVector(this.currentVector);

      if (isTracking) {
        const calcs = this.currentLeg.calculated;

        if (this.overrideModule) {
          if (this.overrideModule.canActivate(this.currentState, this.data)) {
            if (!this.overrideModule.isActive()) {
              this.overrideModule.activate(this.currentState, this.data, this.eventBusTopicPublishers);
            }

            this.overrideModule.update(this.currentState, this.data, this.eventBusTopicPublishers);

            // Delegate steering command to the override module.
            const steerCommand = this.overrideModule.getSteerCommand();
            this.setSteerCommand(
              steerCommand.isValid,
              steerCommand.isHeading,
              steerCommand.courseToSteer,
              steerCommand.trackRadius,
              steerCommand.dtk,
              steerCommand.xtk,
              steerCommand.tae
            );
            return;
          }
        }

        isTracking = calcs !== undefined;

        this.updateSteerCommand(dataTrackingValid);
        didUpdateSteerCommand = true;
      }

      if (this.overrideModule) {
        // If we have reached this point, then it means that the override module should be deactivated.
        if (this.overrideModule.isActive()) {
          this.overrideModule.deactivate(this.currentState);
        }

        this.overrideModule.update(this.currentState, this.data);
      }
    } else {
      if (this.overrideModule) {
        if (this.overrideModule.isActive()) {
          this.overrideModule.deactivate(this.currentState);
        }

        this.overrideModule.update(this.currentState, this.data);
      }

      // We can't be suspended if we are not tracking a flight plan.
      this.currentState.isSuspended = false;
      clearInhibitNextSequence = true;
    }

    if (!didUpdateSteerCommand) {
      this.courseToSteer = null;
      this.isSteerHeading = false;
      this.setSteerCommand(false, false, 0, 0, 0, 0, 0);
    }

    this.eventBusTopicPublishers['lnav_is_tracking'].publish(isTracking);
    this.eventBusTopicPublishers['lnav_is_suspended'].publish(this.currentState.isSuspended);

    if (isTracking) {
      const trackingStatePublisher = this.eventBusTopicPublishers['lnav_tracking_state'];
      const trackingState = trackingStatePublisher.value;
      if (
        trackingState.isTracking !== isTracking
        || trackingState.globalLegIndex !== this.currentState.globalLegIndex
        || trackingState.transitionMode !== this.currentState.transitionMode
        || trackingState.vectorIndex !== this.currentState.vectorIndex
        || trackingState.isSuspended !== this.currentState.isSuspended
      ) {
        trackingStatePublisher.publish({
          isTracking: isTracking,
          globalLegIndex: this.currentState.globalLegIndex,
          transitionMode: this.currentState.transitionMode,
          vectorIndex: this.currentState.vectorIndex,
          isSuspended: this.currentState.isSuspended
        });
      }

      this.eventBusTopicPublishers['lnav_dtk'].publish(this.dtk);
      this.eventBusTopicPublishers['lnav_xtk'].publish(this.xtk);
      this.eventBusTopicPublishers['lnav_tracked_leg_index'].publish(this.currentState.globalLegIndex);
      this.eventBusTopicPublishers['lnav_tracked_vector_index'].publish(this.currentState.vectorIndex);
      this.eventBusTopicPublishers['lnav_transition_mode'].publish(this.currentState.transitionMode);
      this.eventBusTopicPublishers['lnav_course_to_steer'].publish(this.courseToSteer);
      this.eventBusTopicPublishers['lnav_is_steer_heading'].publish(this.isSteerHeading);
      this.eventBusTopicPublishers['lnav_vector_distance_along'].publish(this.alongVectorDistance);
      this.eventBusTopicPublishers['lnav_vector_distance_remaining'].publish(this.vectorDistanceRemaining);
      this.eventBusTopicPublishers['lnav_vector_anticipation_distance'].publish(this.vectorAnticipationDistance);
      this.eventBusTopicPublishers['lnav_along_track_speed'].publish(this.alongTrackSpeed);

      this.eventBusTopicPublishers['lnav_leg_distance_along'].publish(
        this.getAlongLegDistance(flightPlan as FlightPlan, this.currentState, this.alongVectorDistance)
      );
      this.eventBusTopicPublishers['lnav_leg_distance_remaining'].publish(
        this.getLegDistanceRemaining(flightPlan as FlightPlan, this.currentState, this.vectorDistanceRemaining)
      );
    } else {
      this.currentLeg = undefined;
      this.currentVector = undefined;

      const trackingStatePublisher = this.eventBusTopicPublishers['lnav_tracking_state'];
      const trackingState = trackingStatePublisher.value;
      if (
        trackingState.isTracking
        || trackingState.globalLegIndex !== 0
        || trackingState.transitionMode !== LNavTransitionMode.None
        || trackingState.vectorIndex !== 0
        || trackingState.isSuspended !== this.currentState.isSuspended
      ) {
        trackingStatePublisher.publish({
          isTracking: false,
          globalLegIndex: 0,
          transitionMode: LNavTransitionMode.None,
          vectorIndex: 0,
          isSuspended: this.currentState.isSuspended
        });
      }

      this.eventBusTopicPublishers['lnav_dtk'].publish(0);
      this.eventBusTopicPublishers['lnav_xtk'].publish(0);
      this.eventBusTopicPublishers['lnav_tracked_leg_index'].publish(0);
      this.eventBusTopicPublishers['lnav_tracked_vector_index'].publish(0);
      this.eventBusTopicPublishers['lnav_transition_mode'].publish(LNavTransitionMode.None);
      this.eventBusTopicPublishers['lnav_course_to_steer'].publish(null);
      this.eventBusTopicPublishers['lnav_is_steer_heading'].publish(false);
      this.eventBusTopicPublishers['lnav_vector_distance_along'].publish(0);
      this.eventBusTopicPublishers['lnav_vector_distance_remaining'].publish(0);
      this.eventBusTopicPublishers['lnav_vector_anticipation_distance'].publish(0);
      this.eventBusTopicPublishers['lnav_along_track_speed'].publish(0);

      this.eventBusTopicPublishers['lnav_leg_distance_along'].publish(0);
      this.eventBusTopicPublishers['lnav_leg_distance_remaining'].publish(0);
    }

    this.inhibitNextSequence &&= !clearInhibitNextSequence;
  }

  /**
   * Immediately republishes all event bus topics with their current values.
   */
  private republishEventBusTopics(): void {
    for (const topic in this.eventBusTopicPublishers) {
      this.eventBusTopicPublishers[topic as keyof BaseLNavEvents].publish();
    }
  }

  /**
   * Updates this computer's data.
   */
  private updateData(): void {
    this.defaultDataProvider?.update();
    this.data.planePos.set(this.dataProvider.planePos.get());
    this.data.gs = this.dataProvider.gs.get();
    this.data.track = this.dataProvider.track.get();
    this.data.heading = this.dataProvider.heading.get();
    this.data.magVar = this.dataProvider.magVar.get();
    this.data.tas = this.dataProvider.tas.get();
  }

  /**
   * Checks whether the current LNAV data contains valid tracking data.
   * @returns Whether the current LNAV data contains valid tracking data.
   */
  private isTrackingDataValid(): boolean {
    return this.data.planePos.isValid()
      && this.data.gs !== null
      && this.data.track !== null;
  }

  /**
   * Updates this computer's steering command using guidance generated from this computer's currently tracked flight
   * path vector.
   * @param data The current LNAV data with valid tracking data.
   */
  private updateSteerCommand(data: LNavComputerDataTrackingValid): void {
    let vector: FlightPathVector | undefined = undefined;
    let trackRadius = 0;
    let dtk = 0;
    let xtk = 0;
    let tae = 0;

    if (
      this.anticipationVector
      && this.vectorAnticipationDistance > 0
      && this.vectorDistanceRemaining <= this.vectorAnticipationDistance
      // Do not fly the anticipated vector if our current-vector crosstrack error is greater than the anticipated
      // vector's radius. This keeps us from flying the wrong "side" of an anticipated vector.
      && Math.abs(this.xtk) < UnitType.GA_RADIAN.convertTo(FlightPathUtils.getVectorTurnRadius(this.anticipationVector), UnitType.NMILE)
    ) {
      vector = this.anticipationVector;
      dtk = this.anticipationDtk;
      xtk = this.anticipationXtk;
      trackRadius = this.anticipationVector.radius;
    } else if (
      this.currentVector
      && this.canTrackVector(this.currentVector)
    ) {
      vector = this.currentVector;
      dtk = this.dtk;
      xtk = this.xtk;
      trackRadius = this.currentVector.radius;
    }

    if (vector) {
      this.isSteerHeading = vector.heading !== null && BitFlags.isAll(vector.flags, FlightPathVectorFlags.ConstantHeading);
      if (this.isSteerHeading) {
        if (data.heading !== null) {
          this.courseToSteer = this.getCourseToSteerHeading(data, vector);
          trackRadius = 0;
          dtk = 0;
          xtk = 0;
          tae = (MathUtils.angularDistanceDeg(this.courseToSteer, data.heading, 1) + 180) % 360 - 180;
        } else {
          this.courseToSteer = null;
          this.isSteerHeading = false;
        }
      } else {
        this.courseToSteer = this.getCourseToSteerTrack(data, dtk, xtk);
        tae = (MathUtils.angularDistanceDeg(dtk, data.track, 1) + 180) % 360 - 180;
      }
    } else {
      this.courseToSteer = null;
      this.isSteerHeading = false;
    }

    if (this.courseToSteer === null) {
      this.setSteerCommand(false, false, 0, 0, 0, 0, 0);
    } else {
      this.setSteerCommand(true, this.isSteerHeading, this.courseToSteer, trackRadius, dtk, xtk, tae);
    }
  }

  /**
   * Gets a true course to steer to follow a track, in degrees.
   * @param data The current LNAV data with valid tracking data.
   * @param dtk The desired true track, in degrees.
   * @param xtk The cross-track error, in nautical miles.
   * @returns The true course to steer to follow the specified track, in degrees.
   */
  private getCourseToSteerTrack(
    data: LNavComputerDataTrackingValid,
    dtk: number,
    xtk: number
  ): number {
    let absInterceptAngle: number;

    if (this.interceptFunc !== undefined) {
      absInterceptAngle = this.interceptFunc(dtk, xtk, data.tas ?? data.gs);
    } else {
      absInterceptAngle = Math.min(Math.pow(Math.abs(xtk) * 20, 1.35) + (Math.abs(xtk) * 50), 45);
      if (absInterceptAngle <= 2.5) {
        absInterceptAngle = NavMath.clamp(Math.abs(xtk * 150), 0, 2.5);
      }
    }

    const interceptAngle = xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
    return MathUtils.normalizeAngleDeg(dtk + interceptAngle);
  }

  /**
   * Gets a true course to steer to follow a heading, in degrees.
   * @param data The current LNAV data with valid tracking data.
   * @param vector The flight path vector that defines the heading to follow.
   * @returns The true course to steer to follow the specified heading, in degrees.
   */
  private getCourseToSteerHeading(
    data: LNavComputerDataTrackingValid,
    vector: Readonly<FlightPathVector>
  ): number {
    return vector.isHeadingTrue || data.magVar === null
      ? vector.heading!
      : MagVar.magneticToTrue(vector.heading!, data.magVar);
  }

  /**
   * Sets this computer's steering command.
   * @param isValid Whether the steering command is valid.
   * @param isHeading Whether the command is attempting to steer toward a heading instead of a track.
   * @param courseToSteer The true course to steer, in degrees.
   * @param trackRadius The radius of the track toward which the command is attempting to steer, in great-arc radians.
   * A radius of `pi / 2` indicates the track is a great circle. A radius less than `pi / 2` indicates the track turns
   * to the left. A radius greater than `pi / 2` indicates the track turns to the right.
   * @param dtk The current desired true track, in degrees.
   * @param xtk The current cross-track error, in nautical miles. Positive values indicate that the plane is to the
   * right of the desired track.
   * @param tae The current track angle error, in degrees in the range `[-180, 180)`.
   */
  private setSteerCommand(
    isValid: boolean,
    isHeading: boolean,
    courseToSteer: number,
    trackRadius: number,
    dtk: number,
    xtk: number,
    tae: number
  ): void {
    const steerCommandBufferActiveIndex = this._steerCommand.get() === this.steerCommandBuffer[0] ? 0 : 1;
    const command = this.steerCommandBuffer[(steerCommandBufferActiveIndex + 1) % 2];

    command.isValid = isValid;
    command.isHeading = isHeading;
    command.courseToSteer = courseToSteer;
    command.trackRadius = trackRadius;
    command.dtk = dtk;
    command.xtk = xtk;
    command.tae = tae;

    this._steerCommand.set(command);
  }

  /**
   * Calculates the tracking from the current leg.
   * @param data The current LNAV data with valid tracking data.
   * @param plan The active flight plan.
   */
  private calculateTracking(data: LNavComputerDataTrackingValid, plan: FlightPlan): void {
    let didAdvance: boolean;

    do {
      didAdvance = false;

      if (!this.currentLeg) {
        break;
      }

      // Don't really need to fly the intial leg?
      if (this.currentLeg.leg.type === LegType.IF && this.currentState.globalLegIndex === 0 && plan.length > 1) {
        this.currentLeg = plan.getLeg(++this.currentState.globalLegIndex);

        plan.setCalculatingLeg(this.currentState.globalLegIndex);
        plan.setLateralLeg(this.currentState.globalLegIndex);

        this.trackedHeadingVector = undefined;

        continue;
      }

      const transitionMode = this.currentState.transitionMode;
      const legIndex = this.currentState.globalLegIndex;
      const vectorIndex = this.currentState.vectorIndex;
      const isSuspended = this.currentState.isSuspended;

      const calcs = this.currentLeg.calculated;

      if (calcs) {
        // Heading legs can be recalculated while they are active. When that happens, we want to reset the tracked
        // vector index to the first vector so that we don't "skip" over any recalculated vectors.
        if (
          this.trackedHeadingVector
          && (
            this.currentState.transitionMode === LNavTransitionMode.Egress
            || this.currentState.vectorIndex > 0
          )
        ) {
          const vectors = LNavUtils.getVectorsForTransitionMode(calcs, this.currentState.transitionMode, this.currentState.isSuspended);
          const vector = vectors[this.currentState.vectorIndex];
          if (
            !vector
            || vector.startLat !== this.trackedHeadingVector.startLat
            || vector.startLon !== this.trackedHeadingVector.startLon
            || vector.centerX !== this.trackedHeadingVector.centerX
            || vector.centerY !== this.trackedHeadingVector.centerY
            || vector.centerZ !== this.trackedHeadingVector.centerZ
            || vector.radius !== this.trackedHeadingVector.radius
          ) {
            // Heading legs don't have ingress transitions.
            this.currentState.transitionMode = LNavTransitionMode.None;
            this.currentState.vectorIndex = 0;
          }
        }

        const vectors = LNavUtils.getVectorsForTransitionMode(calcs, this.currentState.transitionMode, this.currentState.isSuspended);
        const vector = vectors[this.currentState.vectorIndex];
        const isVectorValid = vector && this.canTrackVector(vector);
        const isUnsuspendInvalid = this.currentState.transitionMode === LNavTransitionMode.Unsuspend
          && (calcs.ingress.length === 0 || calcs.flightPath[calcs.ingressJoinIndex] === undefined);

        if (isVectorValid && !isUnsuspendInvalid) {
          const planePos = data.planePos;

          const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
          const start = GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, this.vec3Cache[0]);
          let endLat: number, endLon: number;
          let end: Float64Array;
          let vectorDistanceNM: number;

          // If we are in unsuspend mode and tracking the vector at which the ingress transition joins the base flight
          // path, then we treat the point at which the ingress joins the vector as the de-facto end of the vector,
          // because at that point we want to sequence into the ingress-to-egress vector array. In all other cases,
          // we use the entire length of the tracked vector.
          if (transitionMode === LNavTransitionMode.Unsuspend && vectorIndex === calcs.ingressJoinIndex && calcs.ingress.length > 0) {
            const lastIngressVector = calcs.ingress[calcs.ingress.length - 1];
            endLat = lastIngressVector.endLat;
            endLon = lastIngressVector.endLon;
            end = GeoPoint.sphericalToCartesian(endLat, endLon, this.vec3Cache[1]);
            vectorDistanceNM = UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end, Math.PI), UnitType.NMILE);
          } else {
            endLat = vector.endLat;
            endLon = vector.endLon;
            end = GeoPoint.sphericalToCartesian(endLat, endLon, this.vec3Cache[1]);
            vectorDistanceNM = UnitType.METER.convertTo(vector.distance, UnitType.NMILE);
          }

          this.xtk = UnitType.GA_RADIAN.convertTo(circle.distance(planePos), UnitType.NMILE);
          this.dtk = circle.bearingAt(planePos, Math.PI);

          const alongTrackSpeed = FlightPathUtils.projectVelocityToCircle(data.gs, planePos, data.track, circle);
          this.alongTrackSpeed = isNaN(alongTrackSpeed) ? data.gs : alongTrackSpeed;

          const normDist = FlightPathUtils.getAlongArcNormalizedDistance(circle, start, end, planePos);

          this.alongVectorDistance = normDist * vectorDistanceNM;
          this.vectorDistanceRemaining = (1 - normDist) * vectorDistanceNM;

          if (normDist > 1) {
            this.advanceToNextVector(plan, this.currentState, true, this.currentState);
          }
        } else {
          this.alongVectorDistance = 0;
          this.vectorDistanceRemaining = 0;
          this.vectorAnticipationDistance = 0;
          this.advanceToNextVector(plan, this.currentState, true, this.currentState);
        }

        didAdvance = transitionMode !== this.currentState.transitionMode
          || legIndex !== this.currentState.globalLegIndex
          || vectorIndex !== this.currentState.vectorIndex
          || isSuspended !== this.currentState.isSuspended;

        if (legIndex !== this.currentState.globalLegIndex) {
          this.currentLeg = plan.tryGetLeg(this.currentState.globalLegIndex) ?? undefined;

          plan.setCalculatingLeg(this.currentState.globalLegIndex);
          plan.setLateralLeg(this.currentState.globalLegIndex);
        }
      }
    } while (!this.isAwaitingCalculate && didAdvance && this.currentState.globalLegIndex <= plan.length - 1);

    if (
      this.currentState.transitionMode === LNavTransitionMode.Egress
      && this.currentState.globalLegIndex + 1 < plan.length
      && plan.activeCalculatingLeg !== this.currentState.globalLegIndex + 1
    ) {
      plan.setCalculatingLeg(this.currentState.globalLegIndex + 1);
    }

    this.currentVector = this.currentLeg?.calculated
      ? LNavUtils.getVectorsForTransitionMode(this.currentLeg.calculated, this.currentState.transitionMode, this.currentState.isSuspended)[this.currentState.vectorIndex]
      : undefined;

    this.trackedHeadingVector = this.currentVector !== undefined && this.currentVector.heading !== null ? this.currentVector : undefined;
  }

  /**
   * Updates this director's vector anticipation data, including the anticipation distance, DTK and XTK for the
   * anticipated vector, and bearing from the airplane to the end of the anticipated vector.
   * @param data The current LNAV data with valid tracking data.
   * @param plan The active flight plan.
   */
  private updateVectorAnticipation(data: LNavComputerDataTrackingValid, plan: FlightPlan): void {
    this.anticipationVector = undefined;
    this.vectorAnticipationDistance = 0;
    this.anticipationDtk = 0;
    this.anticipationXtk = 0;

    if (!this.currentVector || !this.canTrackVector(this.currentVector)) {
      return;
    }

    // Find the vector that will be tracked after we sequence past the current one.
    this.advanceToNextVector(plan, this.currentState, false, this.anticipationState);

    const anticipationCalcs = plan.tryGetLeg(this.anticipationState.globalLegIndex)?.calculated;

    if (!anticipationCalcs) {
      return;
    }

    const anticipationVectors = LNavUtils.getVectorsForTransitionMode(anticipationCalcs, this.anticipationState.transitionMode, this.anticipationState.isSuspended);
    this.anticipationVector = anticipationVectors[this.anticipationState.vectorIndex];

    if (
      !this.anticipationVector
      || this.anticipationVector === this.currentVector
      || !this.canTrackVector(this.anticipationVector)
    ) {
      this.anticipationVector = undefined;
      return;
    }

    const circle = FlightPathUtils.setGeoCircleFromVector(this.anticipationVector, this.geoCircleCache[0]);

    this.anticipationXtk = UnitType.GA_RADIAN.convertTo(circle.distance(data.planePos), UnitType.NMILE);
    this.anticipationDtk = circle.bearingAt(data.planePos, Math.PI);

    // Find the bank angles that are required to keep the airplane following the current and anticipated vectors
    // assuming zero XTK error and wind. Then approximate how long it will take the airplane to roll from one to the
    // other -> this will be the anticipation time. Finally, convert the anticipation time to a distance by multiplying
    // by along-track speed.

    const maxBankAngle = this.maxBankAngleFunc();
    const currentVectorIdealBankAngle = MathUtils.clamp(LNavComputer.getVectorIdealBankAngle(this.currentVector, data.gs), -maxBankAngle, maxBankAngle);
    const anticipationIdealBankAngle = MathUtils.clamp(LNavComputer.getVectorIdealBankAngle(this.anticipationVector, data.gs), -maxBankAngle, maxBankAngle);

    const deltaBank = Math.abs(currentVectorIdealBankAngle - anticipationIdealBankAngle);
    const rollTimeSeconds = deltaBank / this.vectorAnticipationBankRate;
    this.vectorAnticipationDistance = Math.min(
      rollTimeSeconds / 3600 * this.alongTrackSpeed,
      // Limit vector anticipation to the radius of the anticipated vector so that we don't start flying anticipated
      // arc/turn vectors too early with a large XTK error and veer off in the wrong direction.
      UnitType.GA_RADIAN.convertTo(FlightPathUtils.getVectorTurnRadius(this.anticipationVector), UnitType.NMILE)
    );
  }

  /**
   * Applies suspends that apply at the end of a leg.
   * @param plan The active flight plan.
   * @param state The current LNAV state.
   * @param out The LNAV state to which to write.
   * @returns The LNAV state after applying end-of-leg suspends.
   */
  private applyEndOfLegSuspends(plan: FlightPlan, state: Readonly<LNavState>, out: LNavState): LNavState {
    if (state !== out) {
      LNavComputer.copyStateInfo(state, out);
    }

    const leg = plan.tryGetLeg(state.globalLegIndex);

    if (!leg) {
      return out;
    }

    // Do not allow suspend on thru discontinuities.
    const inhibitNextSequence = this.inhibitNextSequence
      && leg.leg.type !== LegType.ThruDiscontinuity;

    if (leg.leg.type === LegType.FM || leg.leg.type === LegType.VM || leg.leg.type === LegType.Discontinuity) {
      return this.trySetSuspended(plan, state, true, out, true, false);
    } else if (inhibitNextSequence) {
      return this.trySetSuspended(plan, state, true, out, false, true);
    } else if (state.globalLegIndex < plan.length - 1) {
      const nextLeg = plan.getLeg(state.globalLegIndex + 1);
      if (
        !this.disableAutoSuspendAtMissedApproachPoint
        && !state.isMissedApproachActive
        && (
          leg.leg.fixTypeFlags === FixTypeFlags.MAP
          || (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach) && BitFlags.isAll(nextLeg.flags, LegDefinitionFlags.MissedApproach))
        )
      ) {
        return this.trySetSuspended(plan, state, true, out, true, false);
      }
    }

    return out;
  }

  /**
   * Applies suspends that apply at the beginning of a leg.
   * @param plan The active flight plan.
   * @param state The current LNAV state.
   * @param out The LNAV state to which to write.
   * @returns The LNAV state after applying start-of-leg suspends.
   */
  private applyStartOfLegSuspends(plan: FlightPlan, state: Readonly<LNavState>, out: LNavState): LNavState {
    if (state !== out) {
      LNavComputer.copyStateInfo(state, out);
    }

    const leg = plan.getLeg(state.globalLegIndex);

    if (!leg) {
      return out;
    }

    if (leg.leg.type === LegType.HM || state.globalLegIndex === plan.length - 1) {
      return this.trySetSuspended(plan, state, true, out, false, false);
    }

    return out;
  }

  /**
   * Advances an LNAV state to the next trackable vector.
   * @param plan The active flight plan.
   * @param state The state from which to advance.
   * @param awaitCalculateOnNextLeg Whether to await leg calculations when advancing to the next leg. If `true`, the
   * state will only advance as far as the first vector of the next leg.
   * @param out The state to which to write the results.
   * @returns The LNAV state after advancing to the next trackable vector.
   */
  private advanceToNextVector(
    plan: FlightPlan,
    state: Readonly<LNavState>,
    awaitCalculateOnNextLeg: boolean,
    out: LNavState
  ): LNavState {
    if (state !== out) {
      LNavComputer.copyStateInfo(state, out);
    }

    let leg = plan.tryGetLeg(state.globalLegIndex);

    if (!leg) {
      return out;
    }

    let legIndex = state.globalLegIndex;
    let transitionMode = state.transitionMode;
    let isSuspended = state.isSuspended;
    let vectors = leg.calculated ? LNavUtils.getVectorsForTransitionMode(leg.calculated, transitionMode, isSuspended) : undefined;
    let vectorIndex = state.vectorIndex + 1;
    let vectorEndIndex = vectors?.length ?? 0;
    let didAdvance = false;
    let isDone = false;

    // If we are in unsuspended mode, we are tracking the base flight path vector array, and we want to switch to the
    // ingress-to-egress array when we reach the vector at which the ingress transition joins the base flight path.
    if (transitionMode === LNavTransitionMode.Unsuspend && leg.calculated) {
      if (leg.calculated.ingressJoinIndex < 0) {
        vectorEndIndex = 0;
      } else {
        const ingress = leg.calculated.ingress;
        const ingressJoinVector = leg.calculated.flightPath[leg.calculated.ingressJoinIndex];
        // If the ingress joins the base flight path at the beginning of the joined vector, then we want to switch to
        // the ingress-to-egress array once we reach the joined vector. Otherwise, we want to switch when we pass the
        // joined vector.
        if (
          ingress.length > 0
          && ingressJoinVector
          && GeoPoint.equals(
            ingress[ingress.length - 1].endLat,
            ingress[ingress.length - 1].endLon,
            ingressJoinVector.startLat,
            ingressJoinVector.startLon
          )
        ) {
          vectorEndIndex = leg.calculated.ingressJoinIndex;
        } else {
          vectorEndIndex = leg.calculated.ingressJoinIndex + 1;
        }
      }
    }

    // Continue advancing until we reach a trackable vector.
    while (!vectors || vectorIndex >= vectorEndIndex || !this.canTrackVector(vectors[vectorIndex])) {
      switch (transitionMode) {
        case LNavTransitionMode.Ingress:
          transitionMode = LNavTransitionMode.None;
          vectors = leg.calculated ? LNavUtils.getVectorsForTransitionMode(leg.calculated, transitionMode, isSuspended) : undefined;
          vectorIndex = Math.max(0, isSuspended ? leg.calculated?.ingressJoinIndex ?? 0 : 0);
          didAdvance = true;
          break;
        case LNavTransitionMode.Unsuspend:
          transitionMode = LNavTransitionMode.None;
          vectors = leg.calculated?.ingressToEgress;
          vectorIndex = 0;
          didAdvance = true;
          break;
        case LNavTransitionMode.None:
          if (!isSuspended) {
            transitionMode = LNavTransitionMode.Egress;
            vectors = leg.calculated ? LNavUtils.getVectorsForTransitionMode(leg.calculated, transitionMode, isSuspended) : undefined;
            vectorIndex = 0;
            didAdvance = true;
          } else if (leg.leg.type === LegType.HM) {
            vectors = leg.calculated?.flightPath;
            vectorIndex = 0;
            didAdvance = true;
          } else {
            if (!didAdvance && vectors) {
              vectorIndex = Math.max(0, vectors.length - 1);
            }
            isDone = true;
          }
          break;
        case LNavTransitionMode.Egress:
          out.globalLegIndex = legIndex;
          out.transitionMode = transitionMode;
          out.vectorIndex = vectorIndex;
          out.isSuspended = isSuspended;

          this.advanceToNextLeg(plan, out, out);

          // If we are awaiting calculate when advancing to the next leg or if we can't advance to the next leg,
          // we are done since either way we cannot advance any farther.
          if (awaitCalculateOnNextLeg || out.globalLegIndex === legIndex) {
            return out;
          }

          leg = plan.tryGetLeg(out.globalLegIndex);

          if (!leg?.calculated) {
            // If the next leg is not calculated yet, we can't advance any farther because we don't know what the
            // vectors will be when the leg is calculated.
            return out;
          } else {
            legIndex = out.globalLegIndex;
            transitionMode = out.transitionMode;
            vectors = LNavUtils.getVectorsForTransitionMode(leg.calculated, out.transitionMode, out.isSuspended);
            vectorIndex = out.vectorIndex;
            isSuspended = out.isSuspended;
            didAdvance = false;
          }
      }

      if (isDone) {
        break;
      }

      vectorEndIndex = vectors?.length ?? 0;
    }

    out.globalLegIndex = legIndex;
    out.transitionMode = transitionMode;
    out.vectorIndex = vectorIndex;
    out.isSuspended = isSuspended;

    return out;
  }

  /**
   * Advances an LNAV state to the next leg.
   * @param plan The active flight plan.
   * @param state The state from which to advance.
   * @param out The state to which to write the results.
   * @returns The LNAV state after advancing to the next leg.
   */
  private advanceToNextLeg(plan: FlightPlan, state: Readonly<LNavState>, out: LNavState): LNavState {
    this.applyEndOfLegSuspends(plan, state, out);

    if (!out.isSuspended) {
      if (out.globalLegIndex + 1 >= plan.length) {
        out.transitionMode = LNavTransitionMode.None;
        out.vectorIndex = Math.max(0, (plan.tryGetLeg(out.globalLegIndex)?.calculated?.flightPath.length ?? 0) - 1);
        return out;
      }

      out.globalLegIndex++;
      out.transitionMode = LNavTransitionMode.Ingress;
      out.vectorIndex = 0;
      out.inhibitedSuspendLegIndex = -1;

      this.applyStartOfLegSuspends(plan, out, out);
    }

    return out;
  }

  /**
   * Attempts to activate/deactivate suspend on an LNAV state.
   * @param plan The active flight plan.
   * @param state The state for which to set suspended.
   * @param suspend The suspended state to set.
   * @param out The state to which to write the results.
   * @param inhibitResuspend Whether to inhibit resuspend of the suspended leg once suspend ends on that leg. Ignored
   * if `suspend` is `false`. Defaults to `false`.
   * @param resetVectorsOnSuspendEnd Whether to reset the tracked vector to the beginning of the suspended leg once
   * suspend ends on that leg. Ignored if `suspend` is `false`. Defaults to `false`.
   * @returns The LNAV state after the suspend state has been set.
   */
  private trySetSuspended(
    plan: FlightPlan,
    state: Readonly<LNavState>,
    suspend: boolean,
    out: LNavState,
    inhibitResuspend = false,
    resetVectorsOnSuspendEnd = false
  ): LNavState {
    if (state !== out) {
      LNavComputer.copyStateInfo(state, out);
    }

    if (suspend && state.globalLegIndex === state.inhibitedSuspendLegIndex) {
      return out;
    }

    if (suspend) {
      out.inhibitedSuspendLegIndex = inhibitResuspend ? state.globalLegIndex : -1;
      out.resetVectorsOnSuspendEnd = resetVectorsOnSuspendEnd;
    }

    if (state.isSuspended !== suspend) {
      out.isSuspended = suspend;

      if (!suspend && state.resetVectorsOnSuspendEnd) {
        out.transitionMode = LNavTransitionMode.None;
        out.vectorIndex = 0;
        out.resetVectorsOnSuspendEnd = false;
      } else {
        const leg = plan.tryGetLeg(state.globalLegIndex);
        const legCalc = leg?.calculated;
        const ingressJoinVector = legCalc?.flightPath[legCalc.ingressJoinIndex];
        if (
          legCalc
          && state.transitionMode === LNavTransitionMode.None
          && legCalc.ingressJoinIndex >= 0
          && ingressJoinVector
          && legCalc.ingress.length > 0
        ) {
          // Because we are switching between tracking the base flight path vector array and the ingress-to-egress
          // array, we need to reconcile the vector index.

          const lastIngressVector = legCalc.ingress[legCalc.ingress.length - 1];
          let vectors: FlightPathVector[];
          let offset: number;

          if (suspend) {
            // Unsuspended -> Suspended.
            vectors = legCalc.flightPath;
            if (GeoPoint.equals(lastIngressVector.endLat, lastIngressVector.endLon, ingressJoinVector.endLat, ingressJoinVector.endLon)) {
              offset = legCalc.ingressJoinIndex + 1;
            } else {
              offset = legCalc.ingressJoinIndex;
            }
          } else {
            // Suspended -> Unsuspended.
            let pastIngressJoin = state.vectorIndex > legCalc.ingressJoinIndex;

            if (
              !pastIngressJoin
              && state.vectorIndex === legCalc.ingressJoinIndex
              && legCalc.flightPath[legCalc.ingressJoinIndex]
              && this.data.planePos.isValid()
            ) {
              const vector = legCalc.flightPath[legCalc.ingressJoinIndex];
              const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
              const start = GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, this.vec3Cache[0]);
              const end = GeoPoint.sphericalToCartesian(ingressJoinVector.endLat, ingressJoinVector.endLon, this.vec3Cache[1]);
              pastIngressJoin = FlightPathUtils.getAlongArcNormalizedDistance(circle, start, end, this.data.planePos) >= 1;
            }

            if (pastIngressJoin) {
              vectors = legCalc.ingressToEgress;
              if (GeoPoint.equals(lastIngressVector.endLat, lastIngressVector.endLon, ingressJoinVector.endLat, ingressJoinVector.endLon)) {
                offset = -(legCalc.ingressJoinIndex + 1);
              } else {
                offset = -legCalc.ingressJoinIndex;
              }
            } else {
              vectors = legCalc.flightPath;
              offset = 0;
              out.transitionMode = LNavTransitionMode.Unsuspend;
            }
          }

          // Not using Utils.Clamp() because I need it to clamp to >=0 last.
          out.vectorIndex = Math.max(0, Math.min(state.vectorIndex + offset, vectors.length - 1));
        }

        // If we are in unsuspend mode and have become suspended again, change the transition mode back to none. Vector
        // index stays the same because we are tracking the base flight path vector array both before and after.
        if (suspend && state.transitionMode === LNavTransitionMode.Unsuspend) {
          out.transitionMode = LNavTransitionMode.None;
        }

        if (suspend && state.transitionMode === LNavTransitionMode.Egress) {
          out.transitionMode = LNavTransitionMode.None;
          out.vectorIndex = Math.max(0, (legCalc?.flightPath.length ?? 1) - 1);
        }
      }
    }

    return out;
  }

  /**
   * Awaits a flight plan calculation. Starts a calculation of the active flight plan and suspends all tracking and
   * sequencing until the calculation is finished. If this method is called while a previous execution is still
   * awaiting, the new await takes precedence.
   */
  private async awaitCalculate(): Promise<void> {
    if (!this.flightPlanner.hasActiveFlightPlan()) {
      return;
    }

    this.isAwaitingCalculate = true;
    const id = ++this.awaitCalculateId;

    const plan = this.flightPlanner.getActiveFlightPlan();
    try {
      await plan.calculate();
    } catch { /* continue */ }

    if (id !== this.awaitCalculateId) {
      return;
    }

    this.isAwaitingCalculate = false;
  }

  /**
   * Gets an along-track distance from the start of a tracked flight plan leg given a distance along a tracked vector.
   * @param plan The active flight plan.
   * @param state The LNAV state.
   * @param alongVectorDistance The along-track distance from the start of the tracked vector, in nautical miles.
   * @returns The along-track distance, in nautical miles, from the start of the specified flight plan leg given the
   * specified state and along-vector distance.
   */
  private getAlongLegDistance(plan: FlightPlan, state: Readonly<LNavState>, alongVectorDistance: number): number {
    const calcs = plan.tryGetLeg(state.globalLegIndex)?.calculated;

    if (!calcs) {
      return 0;
    }

    let vectors = LNavUtils.getVectorsForTransitionMode(calcs, state.transitionMode, false);
    const vector = vectors[state.vectorIndex];

    if (!vector) {
      return 0;
    }

    let distanceAlong = 0;
    for (let i = state.vectorIndex - 1; i >= 0; i--) {
      distanceAlong += vectors[i].distance;
    }

    switch (state.transitionMode) {
      case LNavTransitionMode.Egress:
        vectors = calcs.ingressToEgress;
        for (let i = vectors.length - 1; i >= 0; i--) {
          distanceAlong += vectors[i].distance;
        }
      // eslint-disable-next-line no-fallthrough
      case LNavTransitionMode.None:
      case LNavTransitionMode.Unsuspend:
        vectors = calcs.ingress;
        for (let i = vectors.length - 1; i >= 0; i--) {
          distanceAlong += vectors[i].distance;
        }
    }

    if (state.transitionMode === LNavTransitionMode.Unsuspend) {
      const lastIngressVector = calcs.ingress[calcs.ingress.length - 1];
      const ingressJoinVector = calcs.flightPath[calcs.ingressJoinIndex];

      if (ingressJoinVector && lastIngressVector) {
        // If we are in unsuspend mode and a valid ingress transition exists, then we need to subtract the distance
        // from the start of the current vector to where the ingress transition joins the base flight path.

        for (let i = state.vectorIndex; i < calcs.ingressJoinIndex; i++) {
          distanceAlong -= vectors[i].distance;
        }

        // If the current vector is before or equal to the vector at which the ingress joins the base flight path, we
        // need to subtract the distance from the start of the joined vector to where the ingress joins.
        if (state.vectorIndex <= calcs.ingressJoinIndex) {
          const circle = FlightPathUtils.setGeoCircleFromVector(ingressJoinVector, this.geoCircleCache[0]);
          const start = GeoPoint.sphericalToCartesian(ingressJoinVector.startLat, ingressJoinVector.startLon, this.vec3Cache[0]);
          const end = GeoPoint.sphericalToCartesian(lastIngressVector.endLat, lastIngressVector.endLon, this.vec3Cache[1]);
          distanceAlong -= UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end, Math.PI), UnitType.METER);
        }
      }
    }

    return UnitType.METER.convertTo(distanceAlong, UnitType.NMILE) + alongVectorDistance;
  }

  /**
   * Gets an along-track distance from the end of a tracked flight plan leg given a distance remaining along a tracked
   * vector.
   * @param plan The active flight plan.
   * @param state The LNAV state.
   * @param vectorDistanceRemaining The along-track distance from the end of the tracked vector, in nautical miles.
   * @returns The along-track distance, in nautical miles, from the end of the specified flight plan leg given the
   * specified state and along-vector distance.
   */
  private getLegDistanceRemaining(plan: FlightPlan, state: Readonly<LNavState>, vectorDistanceRemaining: number): number {
    const calcs = plan.tryGetLeg(state.globalLegIndex)?.calculated;

    if (!calcs) {
      return 0;
    }

    let vectors = LNavUtils.getVectorsForTransitionMode(calcs, state.transitionMode, state.isSuspended);
    const vector = vectors[state.vectorIndex];

    if (!vector) {
      return 0;
    }

    let vectorIndex = state.vectorIndex;
    let distanceRemaining = 0;

    if (state.transitionMode === LNavTransitionMode.Unsuspend) {
      const lastIngressVector = calcs.ingress[calcs.ingress.length - 1];
      const ingressJoinVector = calcs.flightPath[calcs.ingressJoinIndex];

      if (ingressJoinVector && lastIngressVector) {
        // If we are in unsuspend mode and a valid ingress transition exists, then we need to add the distance from
        // the end of the current vector to where the ingress transition joins the base flight path.

        for (let i = state.vectorIndex + 1; i < calcs.ingressJoinIndex; i++) {
          distanceRemaining += vectors[i].distance;
        }

        // If the current vector is before the vector at which the ingress joins the base flight path, we need to
        // add the distance from the start of the joined vector to where the ingress joins.
        if (state.vectorIndex < calcs.ingressJoinIndex) {
          const circle = FlightPathUtils.setGeoCircleFromVector(ingressJoinVector, this.geoCircleCache[0]);
          const start = GeoPoint.sphericalToCartesian(ingressJoinVector.startLat, ingressJoinVector.startLon, this.vec3Cache[0]);
          const end = GeoPoint.sphericalToCartesian(lastIngressVector.endLat, lastIngressVector.endLon, this.vec3Cache[1]);
          distanceRemaining += UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end, Math.PI), UnitType.METER);
        }

        // Reset the vector index to -1 so that we add the distance of all the ingress-to-egress vectors (it will be
        // incremented to 0 below).
        vectorIndex = -1;
      }

      vectors = calcs.ingressToEgress;
    }

    for (let i = vectorIndex + 1; i < vectors.length; i++) {
      distanceRemaining += vectors[i].distance;
    }

    switch (state.transitionMode) {
      case LNavTransitionMode.Ingress:
        vectors = LNavUtils.getVectorsForTransitionMode(calcs, LNavTransitionMode.None, state.isSuspended);
        for (let i = Math.max(0, state.isSuspended ? calcs.ingressJoinIndex : 0); i < vectors.length; i++) {
          const currentVector = vectors[i];

          if (state.isSuspended && i === calcs.ingressJoinIndex) {
            const lastIngressVector = calcs.ingress[calcs.ingress.length - 1];
            if (lastIngressVector) {
              const circle = FlightPathUtils.setGeoCircleFromVector(currentVector, this.geoCircleCache[0]);
              distanceRemaining += UnitType.GA_RADIAN.convertTo(circle.distanceAlong(
                this.geoPointCache[0].set(lastIngressVector.endLat, lastIngressVector.endLon),
                this.geoPointCache[1].set(currentVector.endLat, currentVector.endLon),
                Math.PI
              ), UnitType.METER);
              continue;
            }
          }

          distanceRemaining += currentVector.distance;
        }
      // eslint-disable-next-line no-fallthrough
      case LNavTransitionMode.None:
      case LNavTransitionMode.Unsuspend:
        if (!state.isSuspended) {
          vectors = calcs.egress;
          for (let i = 0; i < vectors.length; i++) {
            distanceRemaining += vectors[i].distance;
          }
        }
    }

    return UnitType.METER.convertTo(distanceRemaining, UnitType.NMILE) + vectorDistanceRemaining;
  }

  /**
   * Copies one LNAV state object to another.
   * @param source The LNAV state from which to copy.
   * @param target The LNAV state to which to copy.
   * @returns The target LNAV state of the copy operation.
   */
  private static copyStateInfo(source: Readonly<LNavState>, target: LNavState): LNavState {
    target.globalLegIndex = source.globalLegIndex;
    target.transitionMode = source.transitionMode;
    target.vectorIndex = source.vectorIndex;
    target.isSuspended = source.isSuspended;
    target.inhibitedSuspendLegIndex = source.inhibitedSuspendLegIndex;
    target.resetVectorsOnSuspendEnd = source.resetVectorsOnSuspendEnd;
    target.isMissedApproachActive = source.isMissedApproachActive;

    return target;
  }

  /**
   * Gets the ideal bank angle, in degrees, to follow a flight path vector under conditions of no cross-track error
   * and no wind, at a given ground speed.
   * @param vector The flight path vector to follow.
   * @param groundSpeed Ground speed, in knots.
   * @returns The ideal bank angle, in degrees, to follow the specified flight path vector at the specified ground
   * speed.
   */
  private static getVectorIdealBankAngle(vector: Readonly<FlightPathVector>, groundSpeed: number): number {
    if (FlightPathUtils.isVectorGreatCircle(vector)) {
      return 0;
    }

    if (vector.radius < MathUtils.HALF_PI) {
      // left turn
      return NavMath.bankAngle(groundSpeed, UnitType.GA_RADIAN.convertTo(vector.radius, UnitType.METER));
    } else {
      // right turn
      return -NavMath.bankAngle(groundSpeed, UnitType.GA_RADIAN.convertTo(Math.PI - vector.radius, UnitType.METER));
    }
  }
}
