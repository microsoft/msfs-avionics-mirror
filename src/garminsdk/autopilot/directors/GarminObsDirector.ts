import {
  AdcEvents, APValues, CdiEvents, CdiUtils, DirectorState, EventBus, FlightPathUtils, GeoCircle, GeoPoint, GeoPointSubject, GNSSEvents, HEvent, LegDefinition,
  LNavDirectorInterceptFunc, LNavEvents, LNavTrackingState, LNavTransitionMode, LNavVars, MagVar, MathUtils, NavEvents, NavMath, NavSourceType,
  ObjectSubject, ObsDirector, SimVarValueType, SubscribableType, UnitType
} from '@microsoft/msfs-sdk';

/**
 * Options for {@link GarminObsDirector}.
 */
export type GarminObsDirectorOptions = {
  /**
   * The maximum bank angle, in degrees, supported by the director, or a function which returns it. If not defined,
   * the director will use the maximum bank angle defined by its parent autopilot (via `apValues`).
   */
  maxBankAngle?: number | (() => number) | undefined;

  /**
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not undefined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: LNavDirectorInterceptFunc;
};

/**
 * A director that handles OBS Lateral Navigation.
 * @deprecated
 */
export class GarminObsDirector implements ObsDirector {
  private readonly geoPointCache = [new GeoPoint(0, 0)];
  private readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly publisher = this.bus.getPublisher<LNavEvents>();

  public state: DirectorState;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onDeactivate?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private obsSetting = 0;
  public obsActive = false;
  private dtk: number | undefined = undefined;
  private xtk: number | undefined = undefined;
  private distanceRemaining = 0;

  private legIndex = 0;
  private leg: LegDefinition | null = null;

  private planePos = new GeoPoint(0, 0);
  private groundTrack = 0;
  private tas = 0;

  private readonly obsFix = GeoPointSubject.create(new GeoPoint(0, 0));
  private readonly obsMagVar = this.obsFix.map(fix => MagVar.get(fix));

  private isTracking = false;
  private needSubLNavData = false;

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

  private readonly lnavDataHandler = (
    obj: SubscribableType<typeof this.lnavData>,
    key: keyof SubscribableType<typeof this.lnavData>,
    value: SubscribableType<typeof this.lnavData>[keyof SubscribableType<typeof this.lnavData>]
  ): void => {
    switch (key) {
      case 'dtk': SimVar.SetSimVarValue(LNavVars.DTK, SimVarValueType.Degree, value); break;
      case 'xtk': SimVar.SetSimVarValue(LNavVars.XTK, SimVarValueType.NM, value); break;
      case 'isTracking': SimVar.SetSimVarValue(LNavVars.IsTracking, SimVarValueType.Bool, value); break;
      case 'legIndex': SimVar.SetSimVarValue(LNavVars.TrackedLegIndex, SimVarValueType.Number, value); break;
      case 'transitionMode': SimVar.SetSimVarValue(LNavVars.TransitionMode, SimVarValueType.Number, value); break;
      case 'vectorIndex': SimVar.SetSimVarValue(LNavVars.TrackedVectorIndex, SimVarValueType.Number, value); break;
      case 'courseToSteer': SimVar.SetSimVarValue(LNavVars.CourseToSteer, SimVarValueType.Degree, value); break;
      case 'isSuspended': SimVar.SetSimVarValue(LNavVars.IsSuspended, SimVarValueType.Bool, value); break;
      case 'alongLegDistance': SimVar.SetSimVarValue(LNavVars.LegDistanceAlong, SimVarValueType.NM, value); break;
      case 'legDistanceRemaining': SimVar.SetSimVarValue(LNavVars.LegDistanceRemaining, SimVarValueType.NM, value); break;
      case 'alongVectorDistance': SimVar.SetSimVarValue(LNavVars.VectorDistanceAlong, SimVarValueType.NM, value); break;
      case 'vectorDistanceRemaining': SimVar.SetSimVarValue(LNavVars.VectorDistanceRemaining, SimVarValueType.NM, value); break;
      case 'trackingState': this.publisher.pub('lnav_tracking_state', value as LNavTrackingState, true, true); break;
    }
  };

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;
  private readonly lateralInterceptCurve?: LNavDirectorInterceptFunc;

  /**
   * Creates an instance of the GPS OBS Director.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<GarminObsDirectorOptions>
  ) {
    const maxBankAngleOpt = options?.maxBankAngle ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxBankAngleFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxBankAngleFunc = maxBankAngleOpt;
        break;
      default:
        this.maxBankAngleFunc = this.apValues.maxBankAngle.get.bind(this.apValues.maxBankAngle);
    }

    const bankRateOpt = options?.bankRate;
    switch (typeof bankRateOpt) {
      case 'number':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt * this.apValues.simRate.get());
          }
        };
        break;
      case 'function':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt() * this.apValues.simRate.get());
          }
        };
        break;
      default:
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank);
          }
        };
    }

    this.lateralInterceptCurve = options?.lateralInterceptCurve;

    const sub = bus.getSubscriber<HEvent & NavEvents & CdiEvents & LNavEvents & GNSSEvents & AdcEvents>();

    const adjustCourseSub = sub.on('hEvent').handle((e: string) => {
      if (e === 'AS1000_PFD_CRS_INC' || e === 'AS1000_MFD_CRS_INC') {
        this.incrementObs(true);
      } else if (e === 'AS1000_PFD_CRS_DEC' || e === 'AS1000_MFD_CRS_DEC') {
        this.incrementObs(false);
      }
    }, true);

    sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.apValues.cdiId)}`).handle(source => {
      if (source.type === NavSourceType.Gps) {
        adjustCourseSub.resume();
      } else {
        adjustCourseSub.pause();
      }
    });

    sub.on('gps_obs_active').whenChanged().handle((state) => {
      this.obsActive = state;
      if (this.obsActive) {
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
          this.obsSetting = courseMag;
        } else if (this.obsSetting < 0 || this.obsSetting > 360) {
          this.obsSetting = 0;
        }
        SimVar.SetSimVarValue('K:GPS_OBS_SET', SimVarValueType.Degree, this.obsSetting);
      } else {
        this.deactivate();
      }
    });

    sub.on('lnav_is_suspended').whenChanged().handle(isSuspended => {
      if (this.obsActive && !isSuspended) {
        SimVar.SetSimVarValue('K:GPS_OBS_OFF', 'number', 0);
      }
    });

    sub.on('gps_obs_value').whenChanged().handle((value) => {
      this.obsSetting = value;
    });

    sub.on('track_deg_true').whenChanged().handle((v) => {
      this.groundTrack = v;
    });
    sub.on('tas').whenChanged().handle((v) => {
      this.tas = v;
    });
    sub.on('gps-position').whenChanged().handle((v) => {
      this.planePos.set(v.lat, v.long);
    });

    this.state = DirectorState.Inactive;
  }

  /** @inheritdoc */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /** @inheritdoc */
  public arm(): void {
    this.state = DirectorState.Armed;
    if (this.onArm !== undefined) {
      this.onArm();
    }
  }

  /** @inheritdoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    if (this.onDeactivate !== undefined) {
      this.onDeactivate();
    }
  }

  /** @inheritdoc */
  public setLeg(index: number, leg: LegDefinition | null): void {
    this.legIndex = index;
    this.leg = leg;
  }

  /** @inheritdoc */
  public startTracking(): void {
    if (this.isTracking) {
      return;
    }

    this.needSubLNavData = true;
    this.isTracking = true;
  }

  /** @inheritdoc */
  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    this.lnavData.unsub(this.lnavDataHandler);

    this.needSubLNavData = false;
    this.isTracking = false;

    SimVar.SetSimVarValue('K:GPS_OBS_OFF', SimVarValueType.Number, 0);
  }

  /**
   * Increments or Decrements the OBS Setting for GPS if in GPS OBS MODE.
   * @param increment is whether to increment (or decrement) the value.
   */
  private incrementObs(increment: boolean): void {
    if (this.obsActive) {
      if (increment) {
        SimVar.SetSimVarValue('K:GPS_OBS_INC', SimVarValueType.Number, 0);
      } else {
        SimVar.SetSimVarValue('K:GPS_OBS_DEC', SimVarValueType.Number, 0);
      }
    }
  }

  /**
   * Updates the lateral director.
   */
  public update(): void {
    this.lnavData.set('legIndex', this.legIndex);

    if (this.isTracking) {
      this.calculateTracking();
    }

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
      SimVar.SetSimVarValue('K:GPS_OBS_OFF', SimVarValueType.Number, 0);
    }

    if (this.state === DirectorState.Active) {
      this.navigateFlightPath();
    }

    if (this.needSubLNavData) {
      this.lnavData.sub(this.lnavDataHandler, true);
      this.needSubLNavData = false;
    }
  }

  /**
   * Gets the current obs xtk.
   */
  private calculateTracking(): void {
    this.distanceRemaining = 0;

    if (this.leg?.calculated?.endLat !== undefined && this.leg?.calculated?.endLon !== undefined) {
      const end = this.geoPointCache[0].set(this.leg.calculated.endLat, this.leg.calculated.endLon);
      this.obsFix.set(end);

      const obsTrue = MagVar.magneticToTrue(this.obsSetting, this.obsMagVar.get());
      const path = this.geoCircleCache[0].setAsGreatCircle(end, obsTrue);

      this.dtk = path.bearingAt(this.planePos, Math.PI);
      this.xtk = UnitType.GA_RADIAN.convertTo(path.distance(this.planePos), UnitType.NMILE);

      const angleRemaining = (path.angleAlong(this.planePos, end, Math.PI) + Math.PI) % MathUtils.TWO_PI - Math.PI;
      this.distanceRemaining = UnitType.GA_RADIAN.convertTo(angleRemaining, UnitType.NMILE);
    } else {
      this.dtk = undefined;
      this.xtk = undefined;
    }
  }

  /**
   * Navigates the provided leg flight path.
   */
  private navigateFlightPath(): void {
    if (this.xtk === undefined || this.dtk === undefined) {
      return;
    }

    let absInterceptAngle: number;

    if (this.lateralInterceptCurve !== undefined) {
      absInterceptAngle = this.lateralInterceptCurve(this.dtk, this.xtk, this.tas);
    } else {
      absInterceptAngle = Math.min(Math.pow(Math.abs(this.xtk) * 20, 1.35) + (Math.abs(this.xtk) * 50), 45);
      if (absInterceptAngle <= 2.5) {
        absInterceptAngle = NavMath.clamp(Math.abs(this.xtk * 150), 0, 2.5);
      }
    }

    const interceptAngle = this.xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
    const courseToSteer = NavMath.normalizeHeading(this.dtk + interceptAngle);
    const bankAngle = this.desiredBank(courseToSteer);

    if (this.state === DirectorState.Active) {
      this.driveBankFunc(bankAngle);
    }

    this.lnavData.set('courseToSteer', courseToSteer);
  }

  /**
   * Tries to activate when armed.
   * @returns whether OBS can activate
   */
  public canActivate(): boolean {
    if (this.xtk !== undefined && Math.abs(this.xtk) < 1) {
      return true;
    }
    return false;
  }

  /**
   * Gets a desired bank from a desired track.
   * @param desiredTrack The desired track.
   * @returns The desired bank angle.
   */
  private desiredBank(desiredTrack: number): number {
    const turnDirection = NavMath.getTurnDirection(this.groundTrack, desiredTrack);
    const headingDiff = Math.abs(NavMath.diffAngle(this.groundTrack, desiredTrack));

    let baseBank = Math.min(1.25 * headingDiff, this.maxBankAngleFunc());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }
}