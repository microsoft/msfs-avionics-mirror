import {
  APEvents, BaseLNavEvents, BaseLNavSimVarEvents, ConsumerSubject, EventBus, FlightPathUtils, FlightPlanner, GeoCircle,
  GeoPoint, GeoPointSubject, LNavAircraftState, LNavControlEvents, LNavEvents, LNavInterceptFunc, LNavObsControlEvents,
  LNavObsEvents, LNavOverrideModule, LNavState, LNavSteerCommand, LNavTrackingState, LNavTransitionMode, LNavUtils,
  LNavVars, LegDefinition, MagVar, MathUtils, NavEvents, NavMath, ObjectSubject, SimVarValueType, UnitType, Vec3Math
} from '@microsoft/msfs-sdk';

/**
 * Options for {@link GarminObsLNavModule}.
 */
export type GarminObsLNavModuleOptions = {
  /**
   * The maximum bank angle, in degrees, supported by the module, or a function which returns it. If not defined, then
   * the module will use the value published to the event bus for the autopilot's maximum bank angle. Defaults to
   * `undefined`.
   */
  maxBankAngle?: number | (() => number) | undefined;

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

  private readonly lnavData = ObjectSubject.create({
    dtk: 0,
    xtk: 0,
    trackingState: {
      isTracking: false,
      globalLegIndex: 0,
      transitionMode: LNavTransitionMode.None,
      vectorIndex: 0,
      isSuspended: true
    } as LNavTrackingState,
    isTracking: false,
    legIndex: 0,
    transitionMode: LNavTransitionMode.None,
    vectorIndex: 0,
    courseToSteer: 0,
    isSuspended: true,
    alongLegDistance: 0,
    legDistanceRemaining: 0,
    alongVectorDistance: 0,
    vectorDistanceRemaining: 0
  });

  private readonly simVarMap: Record<LNavVars, string>;
  private readonly eventBusTopicMap: {
    [P in Exclude<keyof BaseLNavEvents, keyof BaseLNavSimVarEvents>]: P | `${P}_${number}`
  };

  private readonly lnavDataSub = this.lnavData.sub((obj, key, value): void => {
    switch (key) {
      case 'dtk': SimVar.SetSimVarValue(this.simVarMap[LNavVars.DTK], SimVarValueType.Degree, value); break;
      case 'xtk': SimVar.SetSimVarValue(this.simVarMap[LNavVars.XTK], SimVarValueType.NM, value); break;
      case 'isTracking': SimVar.SetSimVarValue(this.simVarMap[LNavVars.IsTracking], SimVarValueType.Bool, value); break;
      case 'legIndex': SimVar.SetSimVarValue(this.simVarMap[LNavVars.TrackedLegIndex], SimVarValueType.Number, value); break;
      case 'transitionMode': SimVar.SetSimVarValue(this.simVarMap[LNavVars.TransitionMode], SimVarValueType.Number, value); break;
      case 'vectorIndex': SimVar.SetSimVarValue(this.simVarMap[LNavVars.TrackedVectorIndex], SimVarValueType.Number, value); break;
      case 'courseToSteer': SimVar.SetSimVarValue(this.simVarMap[LNavVars.CourseToSteer], SimVarValueType.Degree, value); break;
      case 'isSuspended': SimVar.SetSimVarValue(this.simVarMap[LNavVars.IsSuspended], SimVarValueType.Bool, value); break;
      case 'alongLegDistance': SimVar.SetSimVarValue(this.simVarMap[LNavVars.LegDistanceAlong], SimVarValueType.NM, value); break;
      case 'legDistanceRemaining': SimVar.SetSimVarValue(this.simVarMap[LNavVars.LegDistanceRemaining], SimVarValueType.NM, value); break;
      case 'alongVectorDistance': SimVar.SetSimVarValue(this.simVarMap[LNavVars.VectorDistanceAlong], SimVarValueType.NM, value); break;
      case 'vectorDistanceRemaining': SimVar.SetSimVarValue(this.simVarMap[LNavVars.VectorDistanceRemaining], SimVarValueType.NM, value); break;
      case 'trackingState': this.publisher.pub(this.eventBusTopicMap['lnav_tracking_state'], value as LNavTrackingState, true, true); break;
    }
  }, false, true);

  private readonly steerCommand: LNavSteerCommand = {
    isValid: false,
    desiredBankAngle: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  };

  private readonly maxBankAngleFunc: () => number;
  private readonly interceptFunc?: LNavInterceptFunc;

  private _isActive = false;
  private needSubLNavData = false;

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

    const simVarSuffix = this.index === 0 ? '' : `:${this.index}`;
    this.simVarMap = {} as Record<LNavVars, string>;
    for (const simVar of Object.values(LNavVars)) {
      this.simVarMap[simVar] = `${simVar}${simVarSuffix}`;
    }

    const eventBusTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.index);
    this.eventBusTopicMap = {
      'lnav_tracking_state': `lnav_tracking_state${eventBusTopicSuffix}`,
      'lnav_is_awaiting_calc': `lnav_is_awaiting_calc${eventBusTopicSuffix}`
    };

    this.setActiveTopic = `lnav_obs_set_active${eventBusTopicSuffix}`;
    this.setCourseTopic = `lnav_obs_set_course${eventBusTopicSuffix}`;

    const sub = bus.getSubscriber<NavEvents & LNavEvents & APEvents & LNavControlEvents & LNavObsEvents>();

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
  public activate(lnavState: LNavState): void {
    if (this._isActive) {
      return;
    }

    this._isActive = true;

    lnavState.isSuspended = true;
    lnavState.inhibitedSuspendLegIndex = lnavState.globalLegIndex;

    this.needSubLNavData = true;
  }

  /** @inheritDoc */
  public deactivate(lnavState: LNavState): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;

    lnavState.isSuspended = false;

    this.lnavDataSub.pause();
    this.needSubLNavData = false;
  }

  /** @inheritDoc */
  public update(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>): void {
    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

    this.legIndex = lnavState.globalLegIndex;
    this.leg = flightPlan ? flightPlan.tryGetLeg(lnavState.globalLegIndex) : null;

    if (!this._isActive) {
      return;
    }

    this.lnavData.set('legIndex', this.legIndex);

    this.calculateTracking(aircraftState);

    const isTracking = this.dtk !== undefined && this.xtk !== undefined;
    const dtk = this.dtk ?? 0;
    const xtk = this.xtk ?? 0;

    this.lnavData.set('isTracking', isTracking);
    this.lnavData.set('dtk', dtk);
    this.lnavData.set('xtk', xtk);
    this.lnavData.set('legDistanceRemaining', this.distanceRemaining);
    this.lnavData.set('vectorDistanceRemaining', this.distanceRemaining);

    const trackingState = this.lnavData.get().trackingState;
    if (trackingState.isTracking !== isTracking || trackingState.globalLegIndex !== this.legIndex) {
      this.lnavData.set('trackingState', {
        isTracking: isTracking,
        globalLegIndex: this.legIndex,
        transitionMode: LNavTransitionMode.None,
        vectorIndex: 0,
        isSuspended: true
      });
    }

    if (this.dtk === undefined || this.xtk === undefined) {
      this.setObsActive(false);
    }

    this.updateSteerCommand(aircraftState);

    if (this.needSubLNavData) {
      this.lnavDataSub.resume(true);
      this.needSubLNavData = false;
    }
  }

  /**
   * Calculates tracking data for this module's current OBS course.
   * @param aircraftState The current state of the airplane.
   */
  private calculateTracking(aircraftState: Readonly<LNavAircraftState>): void {
    this.distanceRemaining = 0;

    if (this.leg?.calculated && this.leg.calculated.endLat !== undefined && this.leg.calculated.endLon !== undefined) {
      const end = this.geoPointCache[0].set(this.leg.calculated.endLat, this.leg.calculated.endLon);
      this.obsFix.set(end);

      const obsTrue = MagVar.magneticToTrue(this.obsCourse, this.obsMagVar.get());
      const path = this.geoCircleCache[0].setAsGreatCircle(end, obsTrue);

      this.dtk = path.bearingAt(aircraftState.planePos, Math.PI);
      this.xtk = UnitType.GA_RADIAN.convertTo(path.distance(aircraftState.planePos), UnitType.NMILE);

      const angleRemaining = (path.angleAlong(aircraftState.planePos, end, Math.PI) + Math.PI) % MathUtils.TWO_PI - Math.PI;
      this.distanceRemaining = UnitType.GA_RADIAN.convertTo(angleRemaining, UnitType.NMILE);
    } else {
      this.dtk = undefined;
      this.xtk = undefined;
    }
  }

  /**
   * Updates this module's steering command using guidance generated from this module's currently tracked OBS course.
   * @param aircraftState The current state of the airplane.
   */
  private updateSteerCommand(aircraftState: Readonly<LNavAircraftState>): void {
    if (this.xtk === undefined || this.dtk === undefined) {
      this.steerCommand.isValid = false;
      this.steerCommand.desiredBankAngle = 0;
      this.steerCommand.dtk = 0;
      this.steerCommand.xtk = 0;
      this.steerCommand.tae = 0;
      return;
    }

    let absInterceptAngle: number;

    if (this.interceptFunc !== undefined) {
      absInterceptAngle = this.interceptFunc(this.dtk, this.xtk, aircraftState.tas);
    } else {
      absInterceptAngle = Math.min(Math.pow(Math.abs(this.xtk) * 20, 1.35) + (Math.abs(this.xtk) * 50), 45);
      if (absInterceptAngle <= 2.5) {
        absInterceptAngle = NavMath.clamp(Math.abs(this.xtk * 150), 0, 2.5);
      }
    }

    const interceptAngle = this.xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
    const courseToSteer = NavMath.normalizeHeading(this.dtk + interceptAngle);
    const bankAngle = this.desiredBank(courseToSteer, aircraftState.track);

    this.steerCommand.isValid = true;
    this.steerCommand.desiredBankAngle = bankAngle;
    this.steerCommand.dtk = this.dtk;
    this.steerCommand.xtk = this.xtk;
    this.steerCommand.tae = (MathUtils.diffAngleDeg(this.dtk, aircraftState.track) + 180) % 360 - 180;

    this.lnavData.set('courseToSteer', courseToSteer);
  }

  /**
   * Calculates a desired bank from a desired track and actual ground track.
   * @param desiredTrack The desired track, in degrees.
   * @param actualTrack The airplane's actual ground track, in degrees.
   * @returns The desired bank angle, in degrees. Positive values represent left bank.
   */
  private desiredBank(desiredTrack: number, actualTrack: number): number {
    const turnDirection = NavMath.getTurnDirection(actualTrack, desiredTrack);
    const headingDiff = Math.abs(NavMath.diffAngle(actualTrack, desiredTrack));

    let baseBank = Math.min(1.25 * headingDiff, this.maxBankAngleFunc());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
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