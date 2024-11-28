import {
  APEvents, EventBus, FlightPathUtils, FlightPlanner, GeoCircle, GeoPoint, GeoPointSubject, LNavAircraftState,
  LNavControlEvents, LNavEventBusTopicPublisherRecord, LNavEvents, LNavInterceptFunc, LNavObsControlEvents,
  LNavObsEvents, LNavOverrideModule, LNavState, LNavSteerCommand, LNavTransitionMode, LNavUtils, LegDefinition, MagVar,
  MathUtils, NavEvents, NavMath, SimVarValueType, UnitType, Vec3Math
} from '@microsoft/msfs-sdk';

/**
 * Options for {@link GarminObsLNavModule}.
 */
export type GarminObsLNavModuleOptions = {
  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, then a function that
   * computes intercept angles tuned for slow GA aircraft will be used.
   */
  intercept?: LNavInterceptFunc;

  /**
   * Whether to use the sim's native OBS state. If `true`, then the sim's OBS state as exposed through the event bus
   * topics defined in `NavEvents` will be used, and standard sim OBS key events will be used to control the state. If
   * `false`, then the OBS state exposed through the event bus topics defined in `LNavObsEvents` will be used, and
   * control events defined in `LNavObsControlEvents` will be used to control the state. Defaults to `true`.
   */
  useSimObsState?: boolean;
};

/**
 * An LNAV computer module that calculates lateral navigation for an OBS course to the active flight plan waypoint.
 */
export class GarminObsLNavModule implements LNavOverrideModule {
  private readonly geoPointCache = [new GeoPoint(0, 0)];
  private readonly geoCircleCache = [new GeoCircle(Vec3Math.create(), 0)];

  private readonly publisher = this.bus.getPublisher<LNavEvents & LNavObsControlEvents>();

  private readonly useSimObsState: boolean;
  private readonly setActiveTopic: `lnav_obs_set_active${'' | `_${number}`}`;
  private readonly setCourseTopic: `lnav_obs_set_course${'' | `_${number}`}`;

  private isObsActive = false;
  private obsCourse = 0;

  private legIndex = 0;
  private leg: LegDefinition | null = null;

  private readonly obsFix = GeoPointSubject.create(new GeoPoint(0, 0));
  private readonly obsMagVar = this.obsFix.map(fix => MagVar.get(fix));

  private dtk: number | undefined = undefined;
  private xtk: number | undefined = undefined;
  private distanceRemaining = 0;
  private alongTrackSpeed = 0;
  private courseToSteer = 0;

  private readonly steerCommand: LNavSteerCommand = {
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  };

  private readonly interceptFunc?: LNavInterceptFunc;

  private _isActive = false;

  /**
   * Creates a new instance of GarminObsLNavModule.
   * @param index The index of this module's parent computer.
   * @param bus The event bus.
   * @param flightPlanner The flight planner from which to source the active flight plan.
   * @param options Options with which to configure the new module.
   */
  public constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    options?: Readonly<GarminObsLNavModuleOptions>
  ) {
    if (!LNavUtils.isValidLNavIndex(index)) {
      throw new Error(`GarminObsLNavModule: invalid index (${index}) specified (must be a non-negative integer).`);
    }

    this.useSimObsState = options?.useSimObsState ?? true;

    const eventBusTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.index);

    this.setActiveTopic = `lnav_obs_set_active${eventBusTopicSuffix}`;
    this.setCourseTopic = `lnav_obs_set_course${eventBusTopicSuffix}`;

    const sub = bus.getSubscriber<NavEvents & LNavEvents & APEvents & LNavControlEvents & LNavObsEvents>();

    this.interceptFunc = options?.intercept;

    sub.on(this.useSimObsState ? 'gps_obs_active' : `lnav_obs_active${eventBusTopicSuffix}`).whenChanged().handle(isActive => {
      this.isObsActive = isActive;
      if (this.isObsActive) {
        const calc = this.leg?.calculated;
        let courseMag: number | undefined = undefined;

        if (calc && calc.endLat !== undefined && calc.endLon !== undefined) {
          this.obsFix.set(calc.endLat, calc.endLon);
          const courseTrue = FlightPathUtils.getLegFinalCourse(calc);
          if (courseTrue !== undefined) {
            courseMag = MagVar.trueToMagnetic(courseTrue, this.obsMagVar.get());
          }
        }

        if (courseMag !== undefined) {
          this.obsCourse = courseMag;
        } else if (this.obsCourse < 0 || this.obsCourse > 360) {
          this.obsCourse = 0;
        }
        this.setObsCourse(this.obsCourse);
      }
    });

    sub.on(this.useSimObsState ? 'gps_obs_value' : `lnav_obs_course${eventBusTopicSuffix}`).whenChanged().handle((value) => {
      this.obsCourse = value;
    });

    sub.on(`suspend_sequencing${eventBusTopicSuffix}`).handle(suspend => {
      if (this.isObsActive && !suspend) {
        this.setObsActive(false);
      }
    });
  }

  /** @inheritDoc */
  public getSteerCommand(): Readonly<LNavSteerCommand> {
    return this.steerCommand;
  }

  /** @inheritDoc */
  public isActive(): boolean {
    return this._isActive;
  }

  /** @inheritDoc */
  public canActivate(): boolean {
    return this.isObsActive && this.leg !== null;
  }

  /** @inheritDoc */
  public activate(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>, eventBusTopicRecord: LNavEventBusTopicPublisherRecord): void {
    if (this._isActive) {
      return;
    }

    this._isActive = true;

    lnavState.isSuspended = true;
    lnavState.inhibitedSuspendLegIndex = lnavState.globalLegIndex;

    eventBusTopicRecord['lnav_is_suspended'].publish(true);
    eventBusTopicRecord['lnav_tracked_vector_index'].publish(0);
    eventBusTopicRecord['lnav_transition_mode'].publish(LNavTransitionMode.None);
    eventBusTopicRecord['lnav_leg_distance_along'].publish(0);
    eventBusTopicRecord['lnav_vector_distance_along'].publish(0);
    eventBusTopicRecord['lnav_vector_anticipation_distance'].publish(0);
  }

  /** @inheritDoc */
  public deactivate(lnavState: LNavState): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;

    lnavState.isSuspended = false;
  }

  /** @inheritDoc */
  public update(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>, eventBusTopicRecord?: LNavEventBusTopicPublisherRecord): void {
    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

    this.legIndex = lnavState.globalLegIndex;
    this.leg = flightPlan ? flightPlan.tryGetLeg(lnavState.globalLegIndex) : null;

    if (!this._isActive) {
      return;
    }

    eventBusTopicRecord!['lnav_tracked_leg_index'].publish(this.legIndex);

    this.calculateTracking(aircraftState);

    const isTracking = this.dtk !== undefined && this.xtk !== undefined;
    const dtk = this.dtk ?? 0;
    const xtk = this.xtk ?? 0;

    eventBusTopicRecord!['lnav_is_tracking'].publish(isTracking);

    const trackingStatePublisher = eventBusTopicRecord!['lnav_tracking_state'];
    const trackingState = trackingStatePublisher.value;
    if (trackingState.isTracking !== isTracking || trackingState.globalLegIndex !== this.legIndex) {
      trackingStatePublisher.publish({
        isTracking: isTracking,
        globalLegIndex: this.legIndex,
        transitionMode: LNavTransitionMode.None,
        vectorIndex: 0,
        isSuspended: true
      });
    }

    eventBusTopicRecord!['lnav_dtk'].publish(dtk);
    eventBusTopicRecord!['lnav_xtk'].publish(xtk);
    eventBusTopicRecord!['lnav_leg_distance_remaining'].publish(this.distanceRemaining);
    eventBusTopicRecord!['lnav_vector_distance_remaining'].publish(this.distanceRemaining);
    eventBusTopicRecord!['lnav_along_track_speed'].publish(this.alongTrackSpeed);

    if (this.dtk === undefined || this.xtk === undefined) {
      this.setObsActive(false);
    }

    this.updateSteerCommand(aircraftState);

    eventBusTopicRecord!['lnav_course_to_steer'].publish(this.courseToSteer);
  }

  /**
   * Calculates tracking data for this module's current OBS course.
   * @param aircraftState The current state of the airplane.
   */
  private calculateTracking(aircraftState: Readonly<LNavAircraftState>): void {
    this.distanceRemaining = 0;

    // Note: this method can only be called when this module is active, and this module can only be active when the
    // plane position, ground speed, and ground track are valid and not null.

    if (
      this.leg?.calculated
      && this.leg.calculated.endLat !== undefined
      && this.leg.calculated.endLon !== undefined
    ) {
      const end = this.geoPointCache[0].set(this.leg.calculated.endLat, this.leg.calculated.endLon);
      this.obsFix.set(end);

      const obsTrue = MagVar.magneticToTrue(this.obsCourse, this.obsMagVar.get());
      const path = this.geoCircleCache[0].setAsGreatCircle(end, obsTrue);

      this.dtk = path.bearingAt(aircraftState.planePos, Math.PI);
      this.xtk = UnitType.GA_RADIAN.convertTo(path.distance(aircraftState.planePos), UnitType.NMILE);

      const angleRemaining = (path.angleAlong(aircraftState.planePos, end, Math.PI) + Math.PI) % MathUtils.TWO_PI - Math.PI;
      this.distanceRemaining = UnitType.GA_RADIAN.convertTo(angleRemaining, UnitType.NMILE);

      const alongTrackSpeed = FlightPathUtils.projectVelocityToCircle(aircraftState.gs!, aircraftState.planePos, aircraftState.track!, path);
      this.alongTrackSpeed = isNaN(alongTrackSpeed) ? aircraftState.gs! : alongTrackSpeed;
    } else {
      this.dtk = undefined;
      this.xtk = undefined;
      this.alongTrackSpeed = 0;
    }
  }

  /**
   * Updates this module's steering command using guidance generated from this module's currently tracked OBS course.
   * @param aircraftState The current state of the airplane.
   */
  private updateSteerCommand(aircraftState: Readonly<LNavAircraftState>): void {
    if (this.xtk === undefined || this.dtk === undefined) {
      this.steerCommand.isValid = false;
      this.steerCommand.courseToSteer = 0;
      this.steerCommand.trackRadius = 0;
      this.steerCommand.dtk = 0;
      this.steerCommand.xtk = 0;
      this.steerCommand.tae = 0;
      this.courseToSteer = 0;
      return;
    }

    // Note: if XTK and DTK are both defined, then this guarantees that aircraftState.track and aircraftState.gs is not
    // null, because calculateTracking() would have set XTK and DTK to undefined if track is null.

    let absInterceptAngle: number | undefined = undefined;

    if (this.interceptFunc !== undefined) {
      absInterceptAngle = this.interceptFunc(this.dtk, this.xtk, aircraftState.tas ?? aircraftState.gs!);
    } else {
      absInterceptAngle = Math.min(Math.pow(Math.abs(this.xtk) * 20, 1.35) + (Math.abs(this.xtk) * 50), 45);
      if (absInterceptAngle <= 2.5) {
        absInterceptAngle = MathUtils.clamp(Math.abs(this.xtk * 150), 0, 2.5);
      }
    }

    if (absInterceptAngle === undefined) {
      this.steerCommand.isValid = false;
      this.steerCommand.courseToSteer = 0;
      this.steerCommand.trackRadius = 0;
      this.steerCommand.dtk = 0;
      this.steerCommand.xtk = 0;
      this.steerCommand.tae = 0;
      this.courseToSteer = 0;
      return;
    }

    const interceptAngle = this.xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
    this.courseToSteer = NavMath.normalizeHeading(this.dtk + interceptAngle);

    this.steerCommand.isValid = true;
    this.steerCommand.courseToSteer = this.courseToSteer;
    this.steerCommand.trackRadius = MathUtils.HALF_PI;
    this.steerCommand.dtk = this.dtk;
    this.steerCommand.xtk = this.xtk;
    this.steerCommand.tae = (MathUtils.angularDistanceDeg(this.dtk, aircraftState.track!, 1) + 180) % 360 - 180;
  }

  /**
   * Sets whether OBS is active.
   * @param active Whether OBS should be set to active.
   */
  private setObsActive(active: boolean): void {
    if (this.useSimObsState) {
      SimVar.SetSimVarValue(active ? 'K:GPS_OBS_ON' : 'K:GPS_OBS_OFF', SimVarValueType.Number, 0);
    } else {
      this.publisher.pub(this.setActiveTopic, active, true, false);
    }
  }

  /**
   * Sets the OBS course.
   * @param course The course to set, in degrees.
   */
  private setObsCourse(course: number): void {
    if (this.useSimObsState) {
      SimVar.SetSimVarValue('K:GPS_OBS_SET', SimVarValueType.Degree, course);
    } else {
      this.publisher.pub(this.setCourseTopic, course, true, false);
    }
  }
}
