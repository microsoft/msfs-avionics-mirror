import {
  AdcEvents, APEvents, APVerticalModes, BitFlags, ClockEvents, ConsumerSubject, ControlSurfacesEvents, EventBus, ExpSmoother, FacilityLoader, FlightPlan,
  FlightPlanner, GeoPoint, GNSSEvents, InstrumentEvents, KeyEventManager, KeyEvents, LegDefinitionFlags, LNavEvents, MathUtils, SimVarValueType,
  SubscribableMapFunctions, SubscribableUtils, Subscription, UnitType, VerticalFlightPhase, VNavDataEvents, VNavEvents, VNavState
} from '@microsoft/msfs-sdk';

import {
  AvionicsConfig, Epic2ApPanelEvents, Epic2FmaData, Epic2FmaEvents, Epic2FmsEvents, Epic2SpeedPredictions, Epic2VerticalFlightPhase, FmsSpeedEvents,
  FmsSpeedTargetSource, SpeedConstraintReturnRecord, SpeedLimitEvents
} from '@microsoft/msfs-epic2-shared';

/**
 * Information on a set of computed FMS speeds.
 */
type FmsComputedSpeedInfo = {
  /** The computed maximum indicated airspeed, in knots. A negative value indicates a value was not able to be computed. */
  maxIas: number;

  /** The source of the computed maximum indicated airspeed. */
  maxIasSource: FmsSpeedTargetSource;

  /** The computed maximum mach number. A negative value indicates a value was not able to be computed. */
  maxMach: number;

  /** The source of the computed maximum mach number. */
  maxMachSource: FmsSpeedTargetSource;

  /** Whether the computed maximum speed is a mach number. */
  maxIsMach: boolean;

  /** The computed target indicated airspeed, in knots. A negative value indicates a value was not able to be computed. */
  targetIas: number;

  /** The source of the computed target indicated airspeed. */
  targetIasSource: FmsSpeedTargetSource;

  /** The computed target mach number. A negative value indicates a value was not able to be computed. */
  targetMach: number;

  /** The source of the computed target mach number. */
  targetMachSource: FmsSpeedTargetSource;

  /** Whether the computed target speed is a mach number. */
  targetIsMach: boolean;
}

const MIN_MANUAL_SPEED_TARGET_IAS = 80;
/**
 * FMS altitude speed limit state.
 */
enum FmsAltitudeLimitState {
  /** The altitude speed limit is already in effect. */
  InEffect = 'InEffect',

  /** The altitude speed limit is not in effect, and anticipation is required. */
  AnticipationNeeded = 'AnticipationNeeded',

  /** The altitude speed limit is not in effect, and anticipation is not required. */
  AnticipationNotNeeded = 'AnticipationNotNeeded'
}

/**
 * A manager which computes FMS speed targets and syncs those targets with the autopilot when in FMS-managed speed
 * mode.
 */
export class Epic2FmsSpeedManager {
  private static readonly KEY_INTERCEPTS = [
    // 'AP_SPD_VAR_SET',
    // 'AP_SPD_VAR_SET_EX1',
    // 'AP_SPD_VAR_DEC',

    // 'AP_MACH_VAR_SET',
    // 'AP_MACH_VAR_SET_EX1',
    // 'AP_MACH_VAR_DEC',

    'AP_MANAGED_SPEED_IN_MACH_OFF',
    'AP_MANAGED_SPEED_IN_MACH_ON',
    'AP_MANAGED_SPEED_IN_MACH_SET',
    'AP_MANAGED_SPEED_IN_MACH_TOGGLE'
  ];

  private static readonly SOURCE_PRIORITY = {
    [FmsSpeedTargetSource.None]: 0,
    [FmsSpeedTargetSource.ClimbSchedule]: 1,
    [FmsSpeedTargetSource.CruiseSchedule]: 1,
    [FmsSpeedTargetSource.DescentSchedule]: 1,
    [FmsSpeedTargetSource.Constraint]: 2,
    [FmsSpeedTargetSource.Altitude]: 3,
    [FmsSpeedTargetSource.Departure]: 4,
    [FmsSpeedTargetSource.Arrival]: 5,
    [FmsSpeedTargetSource.Configuration]: 6
  };

  private static readonly MACH_TO_KIAS_SMOOTHING_TAU = 5000 / Math.LN2;
  private static readonly IAS_MACH_CONVERSION_HYSTERESIS = 1; // knots

  /**
   * The minimum amount of time, in seconds, to anticipate a speed constraint when it potentially reduces the computed
   * target speed.
   */
  private static readonly SPEED_REDUCTION_ANTICIPATION_BASE = 10;
  /**
   * The amount of extra time, in seconds, to anticipate a speed constraint when it potentially reduces the computed
   * target speed for each knot of reduction in speed.
   */
  private static readonly SPEED_REDUCTION_ANTICIPATION_FACTOR = 2;
  private static readonly SPEED_REDUCTION_ANTICIPATION_HYSTERESIS = Infinity; // seconds

  private readonly publisher = this.bus.getPublisher<FmsSpeedEvents>();

  private keyEventManager?: KeyEventManager;
  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private readonly apSelectedAltitude = ConsumerSubject.create(null, 0);
  private readonly apFmaData = ConsumerSubject.create<Epic2FmaData | null>(null, null);

  private readonly apSelectedIas = ConsumerSubject.create(null, 0);
  private readonly apSelectedMach = ConsumerSubject.create(null, 0);
  private readonly apSelectedSpeedIsMach = ConsumerSubject.create(null, false);
  private readonly apSelectedSpeedIsManual = ConsumerSubject.create(null, true);

  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly ppos = new GeoPoint(0, 0);
  private readonly indicatedAltitude = ConsumerSubject.create(null, 0);
  private readonly pressureAltitude = ConsumerSubject.create(null, 0);
  private readonly verticalSpeed = ConsumerSubject.create(null, 0);

  private readonly lnavIsTracking = ConsumerSubject.create(null, false);
  private readonly lnavLegIndex = ConsumerSubject.create(null, 0);
  private readonly lnavLegDistanceRemaining = ConsumerSubject.create(null, 0);
  private readonly lnavAlongTrackSpeed = ConsumerSubject.create(null, 0);

  private readonly machToKiasSmoother = new ExpSmoother(Epic2FmsSpeedManager.MACH_TO_KIAS_SMOOTHING_TAU);
  private lastMachToKiasTime = 0;
  private machToKias = 1;

  private readonly vnavState = ConsumerSubject.create(null, VNavState.Disabled);
  private readonly vnavFlightPhase = ConsumerSubject.create(null, Epic2VerticalFlightPhase.None);
  private readonly vnavTargetAltitude = ConsumerSubject.create(null, 0);

  private readonly flapsLeftAngle = ConsumerSubject.create(null, 0);
  private readonly flapsRightAngle = ConsumerSubject.create(null, 0);

  private readonly gearNosePosition = ConsumerSubject.create(null, 0);
  private readonly gearLeftPosition = ConsumerSubject.create(null, 0);
  private readonly gearRightPosition = ConsumerSubject.create(null, 0);

  private readonly airframeMaxIas = ConsumerSubject.create(this.bus.getSubscriber<SpeedLimitEvents>().on('speedlimit_max_ias').whenChangedBy(1).withPrecision(0), 0);
  private readonly airframeMaxMach = SubscribableUtils.toSubscribable(this.config.airframe.mmo ?? 1, true)
    .map(SubscribableMapFunctions.withPrecision(0.001));

  private readonly computedSpeedInfo: FmsComputedSpeedInfo = {
    maxIas: -1,
    maxIasSource: FmsSpeedTargetSource.None,
    maxMach: -1,
    maxMachSource: FmsSpeedTargetSource.None,
    maxIsMach: false,
    targetIas: -1,
    targetIasSource: FmsSpeedTargetSource.None,
    targetMach: -1,
    targetMachSource: FmsSpeedTargetSource.None,
    targetIsMach: false
  };
  private readonly computedSpeedInfoWithAltitudeLimit: FmsComputedSpeedInfo = {
    maxIas: -1,
    maxIasSource: FmsSpeedTargetSource.None,
    maxMach: -1,
    maxMachSource: FmsSpeedTargetSource.None,
    maxIsMach: false,
    targetIas: -1,
    targetIasSource: FmsSpeedTargetSource.None,
    targetMach: -1,
    targetMachSource: FmsSpeedTargetSource.None,
    targetIsMach: false
  };
  private readonly computedSpeedInfoWithNextConstraint: FmsComputedSpeedInfo = {
    maxIas: -1,
    maxIasSource: FmsSpeedTargetSource.None,
    maxMach: -1,
    maxMachSource: FmsSpeedTargetSource.None,
    maxIsMach: false,
    targetIas: -1,
    targetIasSource: FmsSpeedTargetSource.None,
    targetMach: -1,
    targetMachSource: FmsSpeedTargetSource.None,
    targetIsMach: false
  };

  private armedAnticipatedConstraint: Readonly<SpeedConstraintReturnRecord> | undefined = undefined;
  private anticipatedConstraint: Readonly<SpeedConstraintReturnRecord> | undefined = undefined;

  private isAnticipatedAltitudeLimitArmed = false;
  private isAnticipatedAltitudeLimitActive = false;

  private maxIas = 0;
  private maxIasSource = FmsSpeedTargetSource.None;
  private maxMach = 0;
  private maxMachSource = FmsSpeedTargetSource.None;
  private maxIsMach = false;

  private publishedMaxIas?: number;
  private publishedMaxMach?: number;
  private publishedMaxIsMach?: boolean;
  private publishedMaxSource?: FmsSpeedTargetSource;

  private targetIas = -1;
  private targetIasSource = FmsSpeedTargetSource.None;
  private targetMach = -1;
  private targetMachSource = FmsSpeedTargetSource.None;
  private targetIsMach = false;

  private publishedTargetIas?: number;
  private publishedTargetMach?: number;
  private publishedTargetIsMach?: boolean;
  private publishedTargetSource?: FmsSpeedTargetSource;

  private activeIas = -1;
  private activeMach = -1;
  private activeIsMach = false;

  private publishedActiveIas?: number;
  private publishedActiveMach?: number;
  private publishedActiveIsMach?: boolean;

  private isAlive = true;
  private isInit = false;

  private keySub?: Subscription;
  private clockSub?: Subscription;
  private adcIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;
  private machToKiasSub?: Subscription;
  private pposSub?: Subscription;

  private readonly fplSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param facLoader A facility loader instance.
   * @param flightPlanner The flight planner.
   * @param speedPredictions The aircraft flight plan speed predictions
   * @param config A configuration object defining aircraft options
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly facLoader: FacilityLoader,
    private readonly flightPlanner: FlightPlanner,
    private readonly speedPredictions: Epic2SpeedPredictions,
    private readonly config: AvionicsConfig,
  ) {
    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this manager's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this manager's key event manager is ready, or rejected if this
   * manager is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this manager.
   * @returns A Promise which will be fulfilled when this manager is fully initialized, or rejected if this manager is
   * destroyed before then.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('Epic2FmsSpeedManager: cannot initialize a dead manager');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // Set up AP selected speed key intercepts
    const keyEventManager = this.keyEventManager as KeyEventManager;
    Epic2FmsSpeedManager.KEY_INTERCEPTS.forEach(key => { keyEventManager.interceptKey(key, false); });

    const sub = this.bus.getSubscriber<
      ClockEvents & APEvents & Epic2FmaEvents & AdcEvents & LNavEvents & VNavEvents & VNavDataEvents & ControlSurfacesEvents
      & AdcEvents & GNSSEvents & KeyEvents & Epic2FmsEvents & Epic2ApPanelEvents & InstrumentEvents
    >();

    // Pass through key events when not in FMS speed mode
    this.keySub = sub.on('key_intercept').handle(data => {
      if (!Epic2FmsSpeedManager.KEY_INTERCEPTS.includes(data.key)) {
        return;
      }

      if (this.apSelectedSpeedIsManual.get()) {
        keyEventManager.triggerKey(data.key, true, data.value0, data.value1, data.value2);
      }
    });

    this.apSelectedIas.setConsumer(sub.on('ap_ias_selected'));
    this.apSelectedMach.setConsumer(sub.on('ap_mach_selected'));
    this.apSelectedSpeedIsMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this.apSelectedSpeedIsManual.setConsumer(sub.on('epic2_ap_fms_man_selector'));

    this.apSelectedAltitude.setConsumer(sub.on('ap_altitude_selected'));
    this.apFmaData.setConsumer(sub.on('epic2_fma_data'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.lnavIsTracking.setConsumer(sub.on('lnav_is_tracking'));
    this.lnavLegIndex.setConsumer(sub.on('lnav_tracked_leg_index'));
    this.lnavLegDistanceRemaining.setConsumer(sub.on('lnav_leg_distance_remaining'));
    this.lnavAlongTrackSpeed.setConsumer(sub.on('lnav_along_track_speed'));

    this.indicatedAltitude.setConsumer(sub.on('indicated_alt'));
    this.pressureAltitude.setConsumer(sub.on('pressure_alt'));
    this.verticalSpeed.setConsumer(sub.on('vertical_speed'));
    this.machToKiasSub = sub.on('mach_to_kias_factor').whenChangedBy(0.001).handle(machToKias => {
      const time = Date.now();
      this.machToKias = this.machToKiasSmoother.next(machToKias, time - this.lastMachToKiasTime);
      this.lastMachToKiasTime = time;
    });
    this.pposSub = sub.on('gps-position').handle(lla => { this.ppos.set(lla.lat, lla.long); });

    this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
    this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));

    this.gearNosePosition.setConsumer(sub.on('gear_position_0'));
    this.gearLeftPosition.setConsumer(sub.on('gear_position_1'));
    this.gearRightPosition.setConsumer(sub.on('gear_position_2'));

    this.vnavState.setConsumer(sub.on('vnav_state'));
    this.vnavFlightPhase.setConsumer(sub.on('epic2_fms_vertical_flight_phase'));
    this.vnavTargetAltitude.setConsumer(sub.on('vnav_target_altitude'));

    this.clockSub = sub.on('realTime').handle(this.update.bind(this));

    this.apSelectedSpeedIsManual.sub((man) => {
      if (man && this.targetIsMach === true) {
        SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_SET', SimVarValueType.Bool, true);
        SimVar.SetSimVarValue('K:AP_MACH_VAR_SET', SimVarValueType.Mach, this.targetMach * 100);
      } else if (man) {
        SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Knots, this.targetIas);
        SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_SET', SimVarValueType.Bool, false);
      }
    });

    this.apSelectedIas.sub(() => this.handleManualSpeedLimits());

    sub.on('vc_powered').whenChanged().handle((powered) => {
      if (powered && this.apSelectedSpeedIsManual.get()) {
        SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Knots, this.targetIas);
      }
    });
  }

  /**
   * Handles the limits for the manual speed target
   */
  private handleManualSpeedLimits(): void {
    if (this.apSelectedSpeedIsManual.get()) {
      const ias = this.apSelectedIas.get();
      const vmo = this.config.airframe.vmo ?? 500;

      if (ias < MIN_MANUAL_SPEED_TARGET_IAS) {
        SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Knots, MIN_MANUAL_SPEED_TARGET_IAS);
      } else if (ias > vmo) {
        SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Knots, vmo);
      }
    }
  }

  /**
   * Updates this manager.
   */
  private update(): void {
    let speedConstraintFlightPhase: VerticalFlightPhase | undefined;
    let fmsScheduleSource: FmsSpeedTargetSource.ClimbSchedule | FmsSpeedTargetSource.CruiseSchedule | FmsSpeedTargetSource.DescentSchedule;

    const vnavFlightPhase = this.vnavFlightPhase.get();
    switch (vnavFlightPhase) {
      case Epic2VerticalFlightPhase.Climb:
        fmsScheduleSource = FmsSpeedTargetSource.ClimbSchedule;
        break;
      case Epic2VerticalFlightPhase.Descent:
        fmsScheduleSource = FmsSpeedTargetSource.DescentSchedule;
        break;
      default:
        fmsScheduleSource = FmsSpeedTargetSource.CruiseSchedule;
    }

    if (this.flightPlanner.hasActiveFlightPlan() && this.lnavIsTracking.get()) {
      const plan = this.flightPlanner.getActiveFlightPlan();
      const activeLeg = plan.tryGetLeg(this.lnavLegIndex.get());
      if (activeLeg) {
        if (BitFlags.isAll(activeLeg.flags, LegDefinitionFlags.MissedApproach)) {
          // If the active leg is in the missed approach, then the speed constraint flight phase is always climb.
          speedConstraintFlightPhase = VerticalFlightPhase.Climb;
        } else {
          speedConstraintFlightPhase = vnavFlightPhase === Epic2VerticalFlightPhase.Climb ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent;
        }
      }
    }

    let scheduledIas: number;
    let scheduledMach: number;

    /*  eslint-disable no-case-declarations */
    switch (fmsScheduleSource) {
      case FmsSpeedTargetSource.ClimbSchedule:
        this.speedPredictions.climbSchedule.update(this.pressureAltitude.get(), this.ppos);
        scheduledIas = !this.speedPredictions.climbSchedule.isMachInUse ? this.speedPredictions.climbSchedule.scheduledIas : -1;
        scheduledMach = this.speedPredictions.climbSchedule.isMachInUse ? this.speedPredictions.climbSchedule.scheduledMach : -1;
        break;
      case FmsSpeedTargetSource.CruiseSchedule:
        this.speedPredictions.cruiseSchedule.update(this.pressureAltitude.get());
        scheduledIas = !this.speedPredictions.cruiseSchedule.isMachInUse ? this.speedPredictions.cruiseSchedule.scheduledIas : -1;
        scheduledMach = this.speedPredictions.cruiseSchedule.isMachInUse ? this.speedPredictions.cruiseSchedule.scheduledMach : -1;
        break;
      case FmsSpeedTargetSource.DescentSchedule:
        this.speedPredictions.descentSchedule.update(this.pressureAltitude.get(), this.ppos);
        scheduledIas = !this.speedPredictions.descentSchedule.isMachInUse ? this.speedPredictions.descentSchedule.scheduledIas : -1;
        scheduledMach = this.speedPredictions.descentSchedule.isMachInUse ? this.speedPredictions.descentSchedule.scheduledMach : -1;
        break;
    }
    /*  eslint-enable no-case-declarations */

    switch (vnavFlightPhase) {
      case Epic2VerticalFlightPhase.Climb:
        this.computeTarget(
          speedConstraintFlightPhase,
          fmsScheduleSource,
          scheduledIas,
          scheduledMach,
          10000,
          250
        );
        break;
      case Epic2VerticalFlightPhase.Descent:
      default:
        this.computeTarget(
          speedConstraintFlightPhase,
          fmsScheduleSource,
          scheduledIas,
          scheduledMach,
          10000,
          250
        );
        break;
    }

    this.reconcileActiveTarget();
    this.publishTargetData();

    if (!this.apSelectedSpeedIsManual.get()) {
      this.setApValues();
    }
  }

  /**
   * Computes a target speed for a given flight phase.
   * @param speedConstraintFlightPhase The current flight phase to use for determining how to follow flight plan speed
   * constraints, or `undefined` if it is unknown.
   * @param scheduleSource The source to use for speeds derived from the active performance schedule.
   * @param scheduledIas The indicated airspeed, in knots, defined by the active performance schedule.
   * @param scheduledMach The mach number defined by the active performance schedule.
   * @param altitudeCeiling The altitude ceiling, in feet, for the current flight phase's altitude speed limit.
   * @param altitudeIasLimit The altitude speed limit, in knots, for the current flight phase.
   */
  private computeTarget(
    speedConstraintFlightPhase: VerticalFlightPhase | undefined,
    scheduleSource: FmsSpeedTargetSource,
    scheduledIas: number,
    scheduledMach: number,
    altitudeCeiling: number,
    altitudeIasLimit: number
  ): void {
    const activeLegIndex = this.lnavLegIndex.get();
    const alongTrackSpeed = this.lnavAlongTrackSpeed.get();

    const lateralPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

    const currentConstraint = speedConstraintFlightPhase === undefined || lateralPlan === undefined
      ? undefined
      : this.speedPredictions.getSpeedConstraint(activeLegIndex);

    const nextConstraint = speedConstraintFlightPhase === undefined || alongTrackSpeed <= 0 || lateralPlan === undefined
      ? undefined
      : this.speedPredictions.getNextSpeedConstraint(activeLegIndex);

    const altitudeLimitState = this.getAltitudeLimitState(altitudeCeiling);

    // If the previously anticipated flight plan speed constraint is not the same as the next flight plan speed
    // constraint, then this means we have sequenced the anticipated constraint or the flight plan has changed.
    // Either way, we reset the anticipated constraint state.
    if (this.armedAnticipatedConstraint !== nextConstraint) {
      this.armedAnticipatedConstraint = undefined;
    }
    if (this.anticipatedConstraint !== nextConstraint) {
      this.anticipatedConstraint = undefined;
    }

    // Resolve altitude speed limit and flight plan constraint anticipation

    let altitudeLimitAnticipationTime: number | undefined = undefined; // seconds
    let constraintAnticipationTime: number | undefined = undefined; // seconds

    if (altitudeLimitState === FmsAltitudeLimitState.AnticipationNeeded) {
      const vs = this.verticalSpeed.get();
      altitudeLimitAnticipationTime = vs >= 0
        ? undefined
        : (altitudeCeiling - this.indicatedAltitude.get()) / vs * 60;
    }

    if (nextConstraint !== undefined && lateralPlan !== undefined) {
      constraintAnticipationTime = this.getSecondsToNextConstraint(lateralPlan, nextConstraint, alongTrackSpeed);
    }

    let altitudeIasLimitToUse = altitudeLimitState === FmsAltitudeLimitState.InEffect ? altitudeIasLimit : undefined;
    let constraintToUse = currentConstraint ? currentConstraint : undefined;
    let isAnticipatedAltitudeLimitArmed = false;
    let isAnticipatedAltitudeLimitActive = false;
    let armedAnticipatedConstraint: Readonly<SpeedConstraintReturnRecord> | undefined = undefined;
    let anticipatedConstraint: Readonly<SpeedConstraintReturnRecord> | undefined = undefined;

    // Compute speed targets with no anticipation.
    let targetSpeedInfo = this.computeSpeedsWithConstraint(
      scheduleSource,
      scheduledIas,
      scheduledMach,
      altitudeIasLimitToUse,
      constraintToUse?.speed,
      this.computedSpeedInfo
    );

    if (altitudeLimitAnticipationTime !== undefined && constraintAnticipationTime !== undefined) {
      // If we potentially need to anticipate both the altitude speed limit and the next flight plan speed constraint,
      // first anticipate the one that is closer in terms of time remaining, with ties going to the altitude speed
      // limit.

      if (altitudeLimitAnticipationTime <= constraintAnticipationTime) {
        const altitudeLimitTargetSpeedInfo = this.computeSpeedsWithConstraint(
          scheduleSource,
          scheduledIas,
          scheduledMach,
          altitudeIasLimit,
          constraintToUse?.speed,
          this.computedSpeedInfoWithAltitudeLimit
        );

        if (this.shouldUseAnticipatedSpeed(targetSpeedInfo, altitudeLimitTargetSpeedInfo, altitudeLimitAnticipationTime, this.isAnticipatedAltitudeLimitActive)) {
          // Arm altitude limit anticipation for one update cycle.
          if (this.isAnticipatedAltitudeLimitActive || this.isAnticipatedAltitudeLimitArmed) {
            targetSpeedInfo = altitudeLimitTargetSpeedInfo;
            altitudeIasLimitToUse = altitudeIasLimit;
            isAnticipatedAltitudeLimitActive = true;
          } else {
            isAnticipatedAltitudeLimitArmed = true;
          }
        } else {
          // Set the anticipation time to undefined so that we don't repeat the anticipation check below.
          altitudeLimitAnticipationTime = undefined;
        }
      } else {
        const nextConstraintTargetSpeedInfo = this.computeSpeedsWithConstraint(
          scheduleSource,
          scheduledIas,
          scheduledMach,
          altitudeIasLimitToUse,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          nextConstraint!.speed,
          this.computedSpeedInfoWithNextConstraint
        );

        if (this.shouldUseAnticipatedSpeed(targetSpeedInfo, nextConstraintTargetSpeedInfo, constraintAnticipationTime, this.anticipatedConstraint !== undefined)) {
          // Arm speed constraint anticipation for one update cycle.
          if (this.anticipatedConstraint !== undefined || this.armedAnticipatedConstraint !== undefined) {
            targetSpeedInfo = nextConstraintTargetSpeedInfo;
            constraintToUse = nextConstraint;
            anticipatedConstraint = nextConstraint;
          } else {
            armedAnticipatedConstraint = nextConstraint;
          }
        } else {
          // Set the anticipation time to undefined so that we don't repeat the anticipation check below.
          constraintAnticipationTime = undefined;
        }
      }
    }

    // At this point, only one of altitude speed limit or next flight plan speed constraint potentially needs to be
    // anticipated.

    if (altitudeLimitAnticipationTime !== undefined) {
      const altitudeLimitTargetSpeedInfo = this.computeSpeedsWithConstraint(
        scheduleSource,
        scheduledIas,
        scheduledMach,
        altitudeIasLimit,
        constraintToUse?.speed,
        this.computedSpeedInfoWithAltitudeLimit
      );

      if (this.shouldUseAnticipatedSpeed(targetSpeedInfo, altitudeLimitTargetSpeedInfo, altitudeLimitAnticipationTime, this.isAnticipatedAltitudeLimitActive)) {
        // Arm altitude limit anticipation for one update cycle.
        if (this.isAnticipatedAltitudeLimitActive || this.isAnticipatedAltitudeLimitArmed) {
          targetSpeedInfo = altitudeLimitTargetSpeedInfo;
          isAnticipatedAltitudeLimitActive = true;
        } else {
          isAnticipatedAltitudeLimitArmed = true;
        }
      }
    } else if (constraintAnticipationTime !== undefined) {
      const nextConstraintTargetSpeedInfo = this.computeSpeedsWithConstraint(
        scheduleSource,
        scheduledIas,
        scheduledMach,
        altitudeIasLimitToUse,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextConstraint!.speed,
        this.computedSpeedInfoWithNextConstraint
      );

      if (this.shouldUseAnticipatedSpeed(targetSpeedInfo, nextConstraintTargetSpeedInfo, constraintAnticipationTime, this.anticipatedConstraint !== undefined)) {
        // Arm speed constraint anticipation for one update cycle.
        if (this.anticipatedConstraint !== undefined || this.armedAnticipatedConstraint !== undefined) {
          targetSpeedInfo = nextConstraintTargetSpeedInfo;
          anticipatedConstraint = nextConstraint;
        } else {
          armedAnticipatedConstraint = nextConstraint;
        }
      }
    }

    this.isAnticipatedAltitudeLimitArmed = isAnticipatedAltitudeLimitArmed;
    this.isAnticipatedAltitudeLimitActive = isAnticipatedAltitudeLimitActive;

    this.armedAnticipatedConstraint = armedAnticipatedConstraint;
    this.anticipatedConstraint = anticipatedConstraint;

    // Save computed speeds

    this.maxIas = targetSpeedInfo.maxIas;
    this.maxIasSource = targetSpeedInfo.maxIasSource;
    this.maxMach = targetSpeedInfo.maxMach;
    this.maxMachSource = targetSpeedInfo.maxMachSource;
    this.maxIsMach = targetSpeedInfo.maxIsMach;

    this.targetIas = targetSpeedInfo.targetIas;
    this.targetIasSource = targetSpeedInfo.targetIasSource;
    this.targetMach = targetSpeedInfo.targetMach;
    this.targetMachSource = targetSpeedInfo.targetMachSource;
    this.targetIsMach = targetSpeedInfo.targetIsMach;
  }

  /**
   * Gets the current state of the altitude speed limit.
   * @param altitudeCeiling The altitude ceiling, in feet, for the current altitude speed limit.
   * @returns The current state of the altitude speed limit.
   */
  private getAltitudeLimitState(altitudeCeiling: number): FmsAltitudeLimitState {
    let anticipationNeeded: boolean;

    const indicatedAltitude = this.indicatedAltitude.get();

    if (!this.isOnGround.get()) {
      const fmaData = this.apFmaData.get();

      switch (fmaData?.verticalActive) {
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          // If AP is in TOGA mode, then the airplane will be expected to always be climbing.
          anticipationNeeded = false;
          break;
        case APVerticalModes.GS:
        case APVerticalModes.GP:
          // If AP is in glideslope/glidepath mode, then the airplane will descend through any selected altitude or VNAV
          // target altitude, so anticipation is needed as long as the airplane is above the altitude limit ceiling.
          anticipationNeeded = true;
          break;
        case APVerticalModes.PITCH:
        case APVerticalModes.VS:
        case APVerticalModes.FLC:
        case APVerticalModes.PATH:
          // If the AP is in PITCH, VS, or FLC, then anticipation is needed only if the airplane is descending and if the
          // selected altitude is less than the altitude limit ceiling (otherwise the airplane would be guaranteed to
          // level off before crossing the ceiling).
          if (this.apSelectedAltitude.get() < altitudeCeiling) {
            if (this.vnavState.get() === VNavState.Enabled_Active) {
              // If VNAV is enabled and active, then AP will capture the VNAV target altitude if one exists and is higher
              // than the selected altitude. So anticipation is needed if and only if the VNAV target altitude is less than
              // the altitude limit ceiling (if there is no target altitude, the published value is -1, so the check still
              // works).
              anticipationNeeded = this.vnavTargetAltitude.get() < altitudeCeiling;
            } else {
              anticipationNeeded = true;
            }
          } else {
            anticipationNeeded = false;
          }
          break;
        case APVerticalModes.ALT:
        case APVerticalModes.CAP:
          // If the AP is in an altitude capture or hold mode, then anticipation is never needed since the airplane is
          // expected to hold a constant altitude. We also use the captured altitude instead of indicated altitude to
          // determine if the speed limit is in effect.
          return fmaData.altitideCaptureValue < altitudeCeiling ? FmsAltitudeLimitState.InEffect : FmsAltitudeLimitState.AnticipationNotNeeded;
        default:
          anticipationNeeded = false;
      }
    } else {
      anticipationNeeded = false;
    }

    return indicatedAltitude < altitudeCeiling
      ? FmsAltitudeLimitState.InEffect
      : anticipationNeeded ? FmsAltitudeLimitState.AnticipationNeeded : FmsAltitudeLimitState.AnticipationNotNeeded;
  }

  /**
   * Computes maximum and target speeds using a given speed constraint.
   * @param scheduleSource The source to use for speeds derived from the active performance schedule.
   * @param scheduledIas The indicated airspeed, in knots, defined by the active performance schedule.
   * @param scheduledMach The mach number defined by the active performance schedule.
   * @param altitudeIasLimit The altitude speed limit, in knots, for the current flight phase, or `undefined` if the
   * altitude speed limit is to be ignored.
   * @param speedConstraint The speed constraint to use.
   * @param out The object to which to write the results.
   * @returns Computed maximum and target speeds using the specified speed constraint.
   */
  private computeSpeedsWithConstraint(
    scheduleSource: FmsSpeedTargetSource,
    scheduledIas: number,
    scheduledMach: number,
    altitudeIasLimit: number | undefined,
    speedConstraint: number | undefined,
    out: FmsComputedSpeedInfo
  ): FmsComputedSpeedInfo {
    scheduledIas = Math.round(scheduledIas);
    scheduledMach = MathUtils.round(scheduledMach, 0.001);
    altitudeIasLimit = altitudeIasLimit === undefined ? undefined : Math.round(altitudeIasLimit);

    // const indicatedAltitude = this.indicatedAltitude.get();

    let minIasTarget = -Infinity;
    let minIasTargetSource = FmsSpeedTargetSource.None;
    let maxIasTarget = Infinity;
    let maxIasTargetSource = FmsSpeedTargetSource.None;
    let minMachTarget = -Infinity;
    let minMachTargetSource = FmsSpeedTargetSource.None;
    let maxMachTarget = Infinity;
    let maxMachTargetSource = FmsSpeedTargetSource.None;

    // ---- Flight Plan Speed Constraints ----
    // The epic2 treats all speed constraints as At or Below constraints

    if (speedConstraint && speedConstraint >= 1) {
      maxIasTarget = Math.round(speedConstraint);
      maxIasTargetSource = FmsSpeedTargetSource.Constraint;
    } else if (speedConstraint) {
      maxMachTarget = MathUtils.round(speedConstraint, 0.001);
      maxMachTargetSource = FmsSpeedTargetSource.Constraint;
    }

    // ---- Altitude Limit ----

    if (altitudeIasLimit !== undefined) {
      if (altitudeIasLimit < minIasTarget) {
        minIasTarget = altitudeIasLimit;
        minIasTargetSource = FmsSpeedTargetSource.Altitude;
      }
      if (altitudeIasLimit < maxIasTarget) {
        maxIasTarget = altitudeIasLimit;
        maxIasTargetSource = FmsSpeedTargetSource.Altitude;
      }
    }

    // ---- Airframe limits ----

    const airframeMaxIas = this.airframeMaxIas.get();
    if (airframeMaxIas < minIasTarget) {
      minIasTarget = airframeMaxIas;
      minIasTargetSource = FmsSpeedTargetSource.Configuration;
    }
    if (airframeMaxIas < maxIasTarget) {
      maxIasTarget = airframeMaxIas;
      maxIasTargetSource = FmsSpeedTargetSource.Configuration;
    }

    const airframeMaxMach = Math.min(this.airframeMaxMach.get(), airframeMaxIas / this.machToKias);
    if (airframeMaxMach < minMachTarget) {
      minMachTarget = airframeMaxMach;
      minMachTargetSource = FmsSpeedTargetSource.Configuration;
    }
    if (airframeMaxMach < maxMachTarget) {
      maxMachTarget = airframeMaxMach;
      maxMachTargetSource = FmsSpeedTargetSource.Configuration;
    }

    // Save computed maximum speeds

    out.maxIas = maxIasTarget;
    out.maxIasSource = maxIasTargetSource;
    out.maxMach = maxMachTarget;
    out.maxMachSource = maxMachTargetSource;

    const maxSpeedHysteresis = this.maxIsMach ? Epic2FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;
    const maxMachIas = out.maxMach * this.machToKias;

    out.maxIsMach = maxMachIas - maxSpeedHysteresis < out.maxIas;

    // ---- Schedule ----

    if (scheduledIas < 0 && scheduledMach < 0) {
      // Schedule is not targeting speed.

      out.targetIas = -1;
      out.targetIasSource = FmsSpeedTargetSource.None;
      out.targetMach = -1;
      out.targetMachSource = FmsSpeedTargetSource.None;
      out.targetIsMach = false;

      return out;
    }

    if (scheduledIas >= minIasTarget && scheduledIas <= maxIasTarget) {
      minIasTarget = maxIasTarget = scheduledIas;
      minIasTargetSource = maxIasTargetSource = scheduleSource;
    }
    if (scheduledMach >= minMachTarget && scheduledMach <= maxMachTarget) {
      minMachTarget = maxMachTarget = scheduledMach;
      minMachTargetSource = maxMachTargetSource = scheduleSource;
    }

    const targetSpeedHysteresis = this.targetIsMach ? Epic2FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;

    const minMachTargetIas = minMachTarget * this.machToKias;
    const maxMachTargetIas = maxMachTarget * this.machToKias;

    const minIasPriority = Epic2FmsSpeedManager.SOURCE_PRIORITY[minIasTargetSource];
    const maxIasPriority = Epic2FmsSpeedManager.SOURCE_PRIORITY[maxIasTargetSource];
    const minMachPriority = Epic2FmsSpeedManager.SOURCE_PRIORITY[minMachTargetSource];
    const maxMachPriority = Epic2FmsSpeedManager.SOURCE_PRIORITY[maxMachTargetSource];

    // Initialize the target IAS and mach values to the highest possible values.
    out.targetIas = maxIasTarget;
    out.targetIasSource = maxIasTargetSource;
    out.targetMach = maxMachTarget;
    out.targetMachSource = maxMachTargetSource;

    if (maxIasPriority > maxMachPriority) {
      out.targetIsMach = false;
    } else if (maxIasPriority < maxMachPriority) {
      out.targetIsMach = true;
    } else {
      out.targetIsMach = (scheduledIas < 0 && scheduledMach > 0) || (maxMachTarget > 0 && (maxMachTargetIas - targetSpeedHysteresis < maxIasTarget));
    }

    if (out.targetIsMach) {
      // We have chosen the maximum mach value over the maximum IAS value -> the only potentially remaining conflicting
      // speed is the minimum IAS value (the minimum mach value is guaranteed to be less than or equal to the maximum
      // mach value). Therefore, we will choose the minimum IAS value if it is greater and has greater priority and the
      // maximum mach value otherwise.

      if (minIasTarget > maxMachTargetIas - targetSpeedHysteresis && minIasPriority > maxMachPriority) {
        out.targetIas = minIasTarget;
        out.targetIasSource = minIasTargetSource;
        out.targetIsMach = false;
      } else {
        out.targetIsMach = true;
      }

    } else if (maxIasPriority < maxMachPriority) {
      // We have chosen the maximum IAS value over the maximum mach value -> the only potentially remaining conflicting
      // speed is the minimum mach value (the minimum IAS value is guaranteed to be less than or equal to the maximum
      // IAS value). Therefore, we will choose the minimum mach value if it is greater and has greater priority and the
      // maximum IAS value otherwise.

      if (minMachTargetIas + targetSpeedHysteresis > maxIasTarget && minMachPriority > maxIasPriority) {
        out.targetMach = minMachTarget;
        out.targetMachSource = minMachTargetSource;
        out.targetIsMach = true;
      } else {
        out.targetIsMach = false;
      }
    }

    return out;
  }

  /**
   * Checks whether this manager should use the speeds computed for an anticipated limit instead of the ones computed
   * for the non-anticipated limit.
   * @param currentTargetSpeedInfo The computed speeds for the non-anticipated limit.
   * @param anticipatedTargetSpeedInfo The computed speeds for the anticipated limit.
   * @param anticipationTime The time remaining, in seconds, until the anticipated limit becomes active.
   * @param isUsingAnticipated Whether the anticipated limit is currently being used.
   * @returns Whether this manager should use the speeds computed for an anticipated limit instead of the ones computed
   * for the non-anticipated limit.
   */
  private shouldUseAnticipatedSpeed(
    currentTargetSpeedInfo: FmsComputedSpeedInfo,
    anticipatedTargetSpeedInfo: FmsComputedSpeedInfo,
    anticipationTime: number,
    isUsingAnticipated: boolean
  ): boolean {
    const currentHasTarget = (currentTargetSpeedInfo.targetIsMach ? currentTargetSpeedInfo.targetMach : currentTargetSpeedInfo.targetIas) >= 0;
    const currentHasMax = (currentTargetSpeedInfo.maxIsMach ? currentTargetSpeedInfo.maxMach : currentTargetSpeedInfo.maxIas) >= 0;

    const anticipatedHasTarget = (anticipatedTargetSpeedInfo.targetIsMach ? anticipatedTargetSpeedInfo.targetMach : anticipatedTargetSpeedInfo.targetIas) >= 0;
    const anticipatedHasMax = (anticipatedTargetSpeedInfo.maxIsMach ? anticipatedTargetSpeedInfo.maxMach : anticipatedTargetSpeedInfo.maxIas) >= 0;

    if ((!anticipatedHasTarget && !anticipatedHasMax) || (currentHasTarget && !anticipatedHasTarget) || (currentHasMax && !anticipatedHasMax && !anticipatedHasTarget)) {
      return false;
    } else if ((anticipatedHasTarget && !currentHasTarget) || (anticipatedHasMax && !currentHasMax)) {
      return true;
    }

    // At this point, both current and anticipated limit are guaranteed to have at least one of max speed or target speed defined.

    let currentIas: number, currentMach: number, currentIsMach: boolean;
    if (currentHasTarget) {
      currentIas = currentTargetSpeedInfo.targetIas;
      currentMach = currentTargetSpeedInfo.targetMach;
      currentIsMach = currentTargetSpeedInfo.targetIsMach;
    } else {
      currentIas = currentTargetSpeedInfo.maxIas;
      currentMach = currentTargetSpeedInfo.maxMach;
      currentIsMach = currentTargetSpeedInfo.maxIsMach;
    }

    let anticipatedIas: number, anticipatedMach: number, anticipatedIsMach: boolean;
    if (anticipatedHasTarget) {
      anticipatedIas = anticipatedTargetSpeedInfo.targetIas;
      anticipatedMach = anticipatedTargetSpeedInfo.targetMach;
      anticipatedIsMach = anticipatedTargetSpeedInfo.targetIsMach;
    } else {
      anticipatedIas = anticipatedTargetSpeedInfo.maxIas;
      anticipatedMach = anticipatedTargetSpeedInfo.maxMach;
      anticipatedIsMach = anticipatedTargetSpeedInfo.maxIsMach;
    }

    const currentSpeedIas = currentIsMach
      ? currentMach * this.machToKias
      : currentIas;

    const limitSpeedIas = anticipatedIsMach
      ? anticipatedMach * this.machToKias
      : anticipatedIas;

    const speedDelta = currentSpeedIas - limitSpeedIas;

    if (speedDelta <= 0) {
      return false;
    }

    const anticipationThreshold = Epic2FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_BASE + Epic2FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_FACTOR * speedDelta
      + (isUsingAnticipated ? Epic2FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_HYSTERESIS : 0);

    return anticipationTime <= anticipationThreshold;
  }

  /**
   * Calculates the time remaining, in seconds, to sequence an upcoming speed constraint.
   * @param plan The active flight plan.
   * @param nextConstraint The upcoming speed constraint to query.
   * @param alongTrackSpeed The current along-track speed of the airplane, in knots.
   * @returns The time remaining, in seconds, to sequence the upcoming speed constraint.
   */
  private getSecondsToNextConstraint(plan: FlightPlan, nextConstraint: SpeedConstraintReturnRecord, alongTrackSpeed: number): number | undefined {
    const distanceToNext = Epic2FmsSpeedManager.getDistanceToConstraint(
      plan,
      this.lnavLegIndex.get(),
      this.lnavLegDistanceRemaining.get(),
      nextConstraint.globalLegIndex
    );

    if (distanceToNext === undefined) {
      return undefined;
    }

    return distanceToNext / alongTrackSpeed * 3600;
  }

  /**
   * Reconciles this manager's active target speed from the computed target and any existing user overrides.
   */
  private reconcileActiveTarget(): void {
    if (this.apSelectedSpeedIsManual.get()) {
      const activeIas = this.apSelectedIas.get();
      const activeMach = this.apSelectedMach.get();
      const activeIsMach = this.apSelectedSpeedIsMach.get();

      if (activeIsMach) {
        this.activeMach = activeMach;
      } else {
        this.activeIas = activeIas;
      }

      this.activeIsMach = activeIsMach;
    } else {
      this.activeIas = this.targetIas;
      this.activeMach = this.targetMach;
      this.activeIsMach = this.targetIsMach;
    }
  }

  /**
   * Publishes this manager's current target speed data to the event bus.
   */
  private publishTargetData(): void {
    if (this.maxIas !== this.publishedMaxIas) {
      this.publishedMaxIas = this.maxIas;
      this.publisher.pub('fms_speed_computed_max_ias', this.maxIas, true, true);
    }

    if (this.maxMach !== this.publishedMaxMach) {
      this.publishedMaxMach = this.maxMach;
      this.publisher.pub('fms_speed_computed_max_mach', this.maxMach, true, true);
    }

    const maxSource = this.maxIsMach ? this.maxMachSource : this.maxIasSource;
    if (maxSource !== this.publishedMaxSource) {
      this.publishedMaxSource = maxSource;
      this.publisher.pub('fms_speed_computed_max_source', maxSource, true, true);
    }

    if (this.maxIsMach !== this.publishedMaxIsMach) {
      this.publishedMaxIsMach = this.maxIsMach;
      this.publisher.pub('fms_speed_computed_max_is_mach', this.maxIsMach, true, true);
    }

    if (this.targetIas !== this.publishedTargetIas) {
      this.publishedTargetIas = this.targetIas;
      this.publisher.pub('fms_speed_computed_target_ias', this.targetIas, true, true);
    }

    if (this.targetMach !== this.publishedTargetMach) {
      this.publishedTargetMach = this.targetMach;
      this.publisher.pub('fms_speed_computed_target_mach', this.targetMach, true, true);
    }

    const targetSource = this.targetIsMach ? this.targetMachSource : this.targetIasSource;
    if (targetSource !== this.publishedTargetSource) {
      this.publishedTargetSource = targetSource;
      this.publisher.pub('fms_speed_computed_target_source', targetSource, true, true);
    }

    if (this.targetIsMach !== this.publishedTargetIsMach) {
      this.publishedTargetIsMach = this.targetIsMach;
      this.publisher.pub('fms_speed_computed_target_is_mach', this.targetIsMach, true, true);
    }

    if (this.activeIas !== this.publishedActiveIas) {
      this.publishedActiveIas = this.activeIas;
      this.publisher.pub('fms_speed_autopilot_target_ias', this.activeIas, true, true);
    }

    if (this.activeMach !== this.publishedActiveMach) {
      this.publishedActiveMach = this.activeMach;
      this.publisher.pub('fms_speed_autopilot_target_mach', this.activeMach, true, true);
    }

    if (this.activeIsMach !== this.publishedActiveIsMach) {
      this.publishedActiveIsMach = this.activeIsMach;
      this.publisher.pub('fms_speed_autopilot_target_is_mach', this.activeIsMach, true, true);
    }
  }

  /**
   * Syncs this manager's active target speed to the sim's autopilot simvars.
   */
  private setApValues(): void {
    const keyEventManager = this.keyEventManager as KeyEventManager;

    if (this.apSelectedSpeedIsMach.get() !== this.activeIsMach) {
      keyEventManager.triggerKey(this.activeIsMach ? 'AP_MANAGED_SPEED_IN_MACH_ON' : 'AP_MANAGED_SPEED_IN_MACH_OFF', true);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('Epic2FmsSpeedManager: manager was destroyed'); });

    this.apSelectedIas.destroy();
    this.apSelectedMach.destroy();
    this.apSelectedSpeedIsMach.destroy();
    this.apSelectedSpeedIsManual.destroy();
    this.apSelectedAltitude.destroy();

    this.isOnGround.destroy();

    this.indicatedAltitude.destroy();
    this.pressureAltitude.destroy();
    this.verticalSpeed.destroy();

    this.lnavIsTracking.destroy();
    this.lnavLegIndex.destroy();
    this.lnavLegDistanceRemaining.destroy();
    this.lnavAlongTrackSpeed.destroy();

    this.vnavState.destroy();
    this.vnavFlightPhase.destroy();
    this.vnavTargetAltitude.destroy();

    this.flapsLeftAngle.destroy();
    this.flapsRightAngle.destroy();

    this.gearNosePosition.destroy();
    this.gearLeftPosition.destroy();
    this.gearRightPosition.destroy();

    this.keySub?.destroy();
    this.clockSub?.destroy();
    this.adcIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();
    this.machToKiasSub?.destroy();
    this.pposSub?.destroy();

    this.fplSubs.forEach(sub => { sub.destroy(); });
  }

  /**
   * Gets the distance remaining to a constraint, in meters.
   * @param plan The active flight plan.
   * @param activeLegIndex The index of the active leg.
   * @param activeLegDistanceRemaining The distance remaining to the end of the active leg, in nautical miles.
   * @param constraintLegIndex The index of the constraint's leg.
   * @returns The distance remaining to the specified constraint, in nautical miles.
   */
  private static getDistanceToConstraint(plan: FlightPlan, activeLegIndex: number, activeLegDistanceRemaining: number, constraintLegIndex: number): number | undefined {
    const activeLegCalc = plan.tryGetLeg(activeLegIndex)?.calculated;
    const constraintLegCalc = plan.tryGetLeg(constraintLegIndex)?.calculated;

    if (activeLegCalc === undefined || constraintLegCalc === undefined) {
      return undefined;
    }

    return UnitType.METER.convertTo(constraintLegCalc.cumulativeDistanceWithTransitions - activeLegCalc.cumulativeDistanceWithTransitions, UnitType.NMILE)
      + activeLegDistanceRemaining;
  }
}
