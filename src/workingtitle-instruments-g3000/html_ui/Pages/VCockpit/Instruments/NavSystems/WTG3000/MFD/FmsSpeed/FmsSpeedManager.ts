import {
  AdcEvents, AirportFacility, AirportUtils, APEvents, APVerticalModes, BitFlags, ClockEvents, ConsumerSubject, ControlSurfacesEvents, EventBus, ExpSmoother,
  FacilityLoader, FacilityType, FlightPlan, FlightPlanner, FlightPlanSegment, FlightPlanSegmentType, GeoPoint, ICAO, KeyEventManager,
  KeyEvents, LegDefinitionFlags, LNavEvents, MathUtils, OriginDestChangeType, SpeedConstraint, SpeedRestrictionType, SpeedUnit, Subscribable,
  SubscribableMapFunctions, SubscribableUtils, Subscription, UnitType, UserSetting, VerticalFlightPhase, VNavEvents, VNavState
} from '@microsoft/msfs-sdk';

import {
  AdcSystemEvents, FmaData, FmaDataEvents, Fms, FmsPositionSystemEvents, GarminSpeedConstraintStore, GarminVNavFlightPhase,
  SpeedConstraintListItem, VNavDataEvents
} from '@microsoft/msfs-garminsdk';

import {
  FmsAirframeSpeedLimitContext, FmsSpeedEvents, FmsSpeedsConfig, FmsSpeedTargetSource, FmsSpeedUserSettingManager, G3000FlightPlannerId
} from '@microsoft/msfs-wtg3000-common';

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
export class FmsSpeedManager {
  private static readonly KEY_INTERCEPTS = [
    'AP_SPD_VAR_SET',
    'AP_SPD_VAR_SET_EX1',
    'AP_SPD_VAR_DEC',

    'AP_MACH_VAR_SET',
    'AP_MACH_VAR_SET_EX1',
    'AP_MACH_VAR_DEC',

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

  private readonly userTargetIas = this.settingManager.getSetting('fmsSpeedUserTargetIas');
  private readonly userTargetMach = this.settingManager.getSetting('fmsSpeedUserTargetMach');
  private readonly userTargetIsMach = this.settingManager.getSetting('fmsSpeedUserTargetIsMach');

  private readonly climbScheduleIndex = this.settingManager.getSetting('fmsSpeedClimbScheduleIndex');
  private readonly climbIas = this.settingManager.getSetting('fmsSpeedClimbIas');
  private readonly climbMach = this.settingManager.getSetting('fmsSpeedClimbMach');
  private readonly climbAltitudeCeiling = this.settingManager.getSetting('fmsSpeedClimbAltitudeCeiling');
  private readonly climbAltitudeIasLimit = this.settingManager.getSetting('fmsSpeedClimbAltitudeLimit');

  private readonly cruiseScheduleIndex = this.settingManager.getSetting('fmsSpeedCruiseScheduleIndex');
  private readonly cruiseIas = this.settingManager.getSetting('fmsSpeedCruiseIas');
  private readonly cruiseMach = this.settingManager.getSetting('fmsSpeedCruiseMach');

  private readonly descentScheduleIndex = this.settingManager.getSetting('fmsSpeedDescentScheduleIndex');
  private readonly descentIas = this.settingManager.getSetting('fmsSpeedDescentIas');
  private readonly descentMach = this.settingManager.getSetting('fmsSpeedDescentMach');
  private readonly descentAltitudeCeiling = this.settingManager.getSetting('fmsSpeedDescentAltitudeCeiling');
  private readonly descentAltitudeIasLimit = this.settingManager.getSetting('fmsSpeedDescentAltitudeLimit');

  private readonly departureIasLimit = this.settingManager.getSetting('fmsSpeedDepartureLimit');
  private readonly departureAgl = this.settingManager.getSetting('fmsSpeedDepartureCeiling');
  private readonly departureRadius = this.settingManager.getSetting('fmsSpeedDepartureRadius');
  private departureIcao = '';
  private departureFacility: AirportFacility | null = null;
  private departureElevation = 0;

  private readonly arrivalIasLimit = this.settingManager.getSetting('fmsSpeedArrivalLimit');
  private readonly arrivalAgl = this.settingManager.getSetting('fmsSpeedArrivalCeiling');
  private readonly arrivalRadius = this.settingManager.getSetting('fmsSpeedArrivalRadius');
  private arrivalIcao = '';
  private arrivalFacility: AirportFacility | null = null;
  private arrivalElevation = 0;

  private readonly configurationLimitSettings: UserSetting<number>[];

  private readonly apSelectedAltitude = ConsumerSubject.create(null, 0);
  private readonly apFmaData = ConsumerSubject.create<FmaData | null>(null, null);

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

  private readonly machToKiasSmoother = new ExpSmoother(FmsSpeedManager.MACH_TO_KIAS_SMOOTHING_TAU);
  private lastMachToKiasTime = 0;
  private machToKias = 1;

  private readonly cruiseAltitude = ConsumerSubject.create(null, 0);
  private readonly vnavState = ConsumerSubject.create(null, VNavState.Disabled);
  private readonly vnavFlightPhase = ConsumerSubject.create(null, GarminVNavFlightPhase.None);
  private readonly vnavTargetAltitude = ConsumerSubject.create(null, 0);

  private readonly flapsLeftAngle = ConsumerSubject.create(null, 0);
  private readonly flapsRightAngle = ConsumerSubject.create(null, 0);

  private readonly gearNosePosition = ConsumerSubject.create(null, 0);
  private readonly gearLeftPosition = ConsumerSubject.create(null, 0);
  private readonly gearRightPosition = ConsumerSubject.create(null, 0);

  private readonly adcIndex: Subscribable<number>;
  private readonly fmsPosIndex: Subscribable<number>;

  private readonly airframeContext: FmsAirframeSpeedLimitContext = {
    pressureAlt: this.pressureAltitude
  };
  private readonly airframeMaxIas = SubscribableUtils.toSubscribable(this.config.airframeLimits.ias.resolve()(this.airframeContext), true)
    .map(SubscribableMapFunctions.withPrecision(1));
  private readonly airframeMaxMach = SubscribableUtils.toSubscribable(this.config.airframeLimits.mach.resolve()(this.airframeContext), true)
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

  private armedAnticipatedConstraint: Readonly<SpeedConstraintListItem> | undefined = undefined;
  private anticipatedConstraint: Readonly<SpeedConstraintListItem> | undefined = undefined;

  private isAnticipatedAltitudeLimitArmed = false;
  private isAnticipatedAltitudeLimitActive = false;

  private currentSchedule = '';
  private maxIas = 0;
  private maxIasSource = FmsSpeedTargetSource.None;
  private maxMach = 0;
  private maxMachSource = FmsSpeedTargetSource.None;
  private maxIsMach = false;

  private publishedCurrentSchedule?: string;
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
   * @param speedConstraintStore The speed constraint store.
   * @param config A configuration object defining options related to FMS speeds.
   * @param settingManager A manager of FMS speed user settings.
   * @param adcIndex The index of the ADC used by this manager.
   * @param fmsPosIndex The index of the FMS positioning system used by this manager.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly facLoader: FacilityLoader,
    private readonly flightPlanner: FlightPlanner<G3000FlightPlannerId>,
    private readonly speedConstraintStore: GarminSpeedConstraintStore,
    private readonly config: FmsSpeedsConfig,
    private readonly settingManager: FmsSpeedUserSettingManager,
    adcIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    this.configurationLimitSettings = settingManager.configurationSpeedDefinitions.map((def, index) => {
      return settingManager.getSetting(`fmsSpeedConfigurationLimit_${index}`);
    });

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
      throw new Error('FmsSpeedManager: cannot initialize a dead manager');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // Set up AP selected speed key intercepts
    const keyEventManager = this.keyEventManager as KeyEventManager;
    FmsSpeedManager.KEY_INTERCEPTS.forEach(key => { keyEventManager.interceptKey(key, false); });

    const sub = this.bus.getSubscriber<
      ClockEvents & APEvents & FmaDataEvents & AdcEvents & LNavEvents & VNavEvents & VNavDataEvents & ControlSurfacesEvents
      & AdcSystemEvents & FmsPositionSystemEvents & KeyEvents
    >();

    // Pass through key events when not in FMS speed mode
    this.keySub = sub.on('key_intercept').handle(data => {
      if (!FmsSpeedManager.KEY_INTERCEPTS.includes(data.key)) {
        return;
      }

      if (this.apSelectedSpeedIsManual.get()) {
        keyEventManager.triggerKey(data.key, true, data.value0, data.value1, data.value2);
      }
    });

    this.fplSubs.push(this.flightPlanner.onEvent('fplOriginDestChanged').handle(e => {
      if (e.planIndex !== Fms.PRIMARY_PLAN_INDEX) {
        return;
      }

      switch (e.type) {
        case OriginDestChangeType.OriginAdded:
          this.fetchDepartureFacility(e.airport ?? '');
          break;
        case OriginDestChangeType.OriginRemoved:
          this.fetchDepartureFacility('');
          break;
        case OriginDestChangeType.DestinationAdded:
          this.fetchArrivalFacility(e.airport ?? '');
          break;
        // eslint-disable-next-line no-fallthrough
        case OriginDestChangeType.DestinationRemoved:
          this.fetchArrivalFacility('');
          break;
      }
    }));

    const updateFacilitiesFromPlan = (): void => {
      const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      this.fetchDepartureFacility(plan.originAirport ?? '');
      this.fetchArrivalFacility(plan.destinationAirport ?? '');
    };

    this.fplSubs.push(this.flightPlanner.onEvent('fplCopied').handle(e => {
      if (e.targetPlanIndex === Fms.PRIMARY_PLAN_INDEX) {
        updateFacilitiesFromPlan();
      }
    }));

    this.fplSubs.push(this.flightPlanner.onEvent('fplLoaded').handle(e => {
      if (e.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        updateFacilitiesFromPlan();
      }
    }));

    if (this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
      updateFacilitiesFromPlan();
    }

    this.apSelectedIas.setConsumer(sub.on('ap_ias_selected'));
    this.apSelectedMach.setConsumer(sub.on('ap_mach_selected'));
    this.apSelectedSpeedIsMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this.apSelectedSpeedIsManual.setConsumer(sub.on('ap_selected_speed_is_manual'));

    this.apSelectedAltitude.setConsumer(sub.on('ap_altitude_selected'));
    this.apFmaData.setConsumer(sub.on('fma_data'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.lnavIsTracking.setConsumer(sub.on('lnav_is_tracking'));
    this.lnavLegIndex.setConsumer(sub.on('lnav_tracked_leg_index'));
    this.lnavLegDistanceRemaining.setConsumer(sub.on('lnav_leg_distance_remaining'));
    this.lnavAlongTrackSpeed.setConsumer(sub.on('lnav_along_track_speed'));

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.indicatedAltitude.setConsumer(sub.on(`adc_indicated_alt_${index}`));
      this.pressureAltitude.setConsumer(sub.on(`adc_pressure_alt_${index}`));
      this.verticalSpeed.setConsumer(sub.on(`adc_vertical_speed_${index}`));

      this.machToKiasSub?.destroy();
      this.machToKiasSub = sub.on(`adc_mach_to_kias_factor_${index}`).handle(machToKias => {
        const time = Date.now();
        this.machToKias = this.machToKiasSmoother.next(machToKias, time - this.lastMachToKiasTime);
        this.lastMachToKiasTime = time;
      });
    }, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.pposSub?.destroy();
      this.pposSub = sub.on(`fms_pos_gps-position_${index}`).handle(lla => { this.ppos.set(lla.lat, lla.long); });
    }, true);

    this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
    this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));

    this.gearNosePosition.setConsumer(sub.on('gear_position_0'));
    this.gearLeftPosition.setConsumer(sub.on('gear_position_1'));
    this.gearRightPosition.setConsumer(sub.on('gear_position_2'));

    this.cruiseAltitude.setConsumer(sub.on('vnav_cruise_altitude'));
    this.vnavState.setConsumer(sub.on('vnav_state'));
    this.vnavFlightPhase.setConsumer(sub.on('vnav_flight_phase'));
    this.vnavTargetAltitude.setConsumer(sub.on('vnav_target_altitude'));

    this.clockSub = sub.on('realTime').handle(this.update.bind(this));
  }

  /**
   * Resets the user-defined speed override.
   */
  public resetUserOverride(): void {
    this.userTargetIas.resetToDefault();
    this.userTargetMach.resetToDefault();
    this.userTargetIsMach.resetToDefault();
  }

  /**
   * Fetches and sets this manager's departure facility from a given ICAO string.
   * @param icao The ICAO of the departure facility to fetch.
   */
  private async fetchDepartureFacility(icao: string): Promise<void> {
    if (this.departureIcao === icao) {
      return;
    }

    this.departureIcao = icao;

    if (!ICAO.isFacility(icao, FacilityType.Airport)) {
      this.departureFacility = null;
      this.departureElevation = 0;
      return;
    }

    try {
      const facility = await this.facLoader.getFacility(FacilityType.Airport, icao);

      if (this.departureIcao !== icao) {
        return;
      }

      this.departureFacility = facility;
      this.departureElevation = UnitType.METER.convertTo(AirportUtils.getElevation(facility) ?? 0, UnitType.FOOT);
    } catch (e) {
      console.warn(`FmsSpeedManager: could not retrieve airport for icao ${icao}`);
      this.departureIcao = '';
      this.departureFacility = null;
      this.departureElevation = 0;
    }
  }

  /**
   * Fetches and sets this manager's arrival facility from a given ICAO string.
   * @param icao The ICAO of the arrival facility to fetch.
   */
  private async fetchArrivalFacility(icao: string): Promise<void> {
    if (this.arrivalIcao === icao) {
      return;
    }

    this.arrivalIcao = icao;

    if (!ICAO.isFacility(icao, FacilityType.Airport)) {
      this.arrivalFacility = null;
      this.arrivalElevation = 0;
      return;
    }

    try {
      const facility = await this.facLoader.getFacility(FacilityType.Airport, icao);

      if (this.arrivalIcao !== icao) {
        return;
      }

      this.arrivalFacility = facility;
      this.arrivalElevation = UnitType.METER.convertTo(AirportUtils.getElevation(facility) ?? 0, UnitType.FOOT);
    } catch (e) {
      console.warn(`FmsSpeedManager: could not retrieve airport for icao ${icao}`);
      this.arrivalIcao = '';
      this.arrivalFacility = null;
      this.arrivalElevation = 0;
    }
  }

  /**
   * Updates this manager.
   */
  private update(): void {
    const configurationLimit = this.getConfigurationLimit();

    let vnavFlightPhase: GarminVNavFlightPhase;
    let speedConstraintFlightPhase: VerticalFlightPhase | undefined;
    let fmsScheduleSource: FmsSpeedTargetSource.ClimbSchedule | FmsSpeedTargetSource.CruiseSchedule | FmsSpeedTargetSource.DescentSchedule;

    // Set VNAV flight phase and FMS speed schedule to use based on the selected AP vertical mode.

    if (!this.isOnGround.get()) {
      const fmaData = this.apFmaData.get();

      switch (fmaData?.verticalActive) {
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          vnavFlightPhase = GarminVNavFlightPhase.Climb;
          fmsScheduleSource = FmsSpeedTargetSource.ClimbSchedule;
          break;
        case APVerticalModes.GS:
        case APVerticalModes.GP:
        case APVerticalModes.PATH:
          vnavFlightPhase = GarminVNavFlightPhase.Descent;
          fmsScheduleSource = FmsSpeedTargetSource.DescentSchedule;
          break;
        case APVerticalModes.PITCH:
        case APVerticalModes.VS:
        case APVerticalModes.FLC:
          if (this.apSelectedAltitude.get() >= this.indicatedAltitude.get()) {
            vnavFlightPhase = GarminVNavFlightPhase.Climb;
            fmsScheduleSource = FmsSpeedTargetSource.ClimbSchedule;
          } else {
            vnavFlightPhase = GarminVNavFlightPhase.Descent;
            fmsScheduleSource = FmsSpeedTargetSource.DescentSchedule;
          }
          break;
        default:
          vnavFlightPhase = GarminVNavFlightPhase.Cruise;
          fmsScheduleSource = FmsSpeedTargetSource.CruiseSchedule;
      }
    } else {
      vnavFlightPhase = GarminVNavFlightPhase.Climb;
      fmsScheduleSource = FmsSpeedTargetSource.ClimbSchedule;
    }

    if (this.flightPlanner.hasActiveFlightPlan() && this.lnavIsTracking.get()) {
      // If VNAV is tracking, then use the flight phase published by VNAV.
      const publishedVNavFlightPhase = this.vnavFlightPhase.get();
      if (publishedVNavFlightPhase !== GarminVNavFlightPhase.None) {
        vnavFlightPhase = publishedVNavFlightPhase;
      }

      const plan = this.flightPlanner.getActiveFlightPlan();
      const activeLeg = plan.tryGetLeg(this.lnavLegIndex.get());
      if (activeLeg) {
        if (BitFlags.isAll(activeLeg.flags, LegDefinitionFlags.MissedApproach)) {
          // If the active leg is in the missed approach, then the speed constraint flight phase is always climb.
          speedConstraintFlightPhase = VerticalFlightPhase.Climb;
        } else {
          // If the active leg is not in the missed approach, then the speed constraint flight phase is based on the
          // published VNAV flight phase if VNAV is tracking, or on whether the active leg is in the departure if VNAV
          // is not tracking.
          if (publishedVNavFlightPhase === GarminVNavFlightPhase.None) {
            const activeSegment = plan.getSegmentFromLeg(activeLeg) as FlightPlanSegment;
            speedConstraintFlightPhase = activeSegment.segmentType === FlightPlanSegmentType.Departure ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent;
          } else {
            speedConstraintFlightPhase = vnavFlightPhase === GarminVNavFlightPhase.Climb ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent;
          }
        }
      }
    }

    let scheduleName: string;
    let scheduledIas: number;
    let scheduledMach: number;

    switch (fmsScheduleSource) {
      case FmsSpeedTargetSource.ClimbSchedule:
        scheduleName = this.settingManager.climbSchedules[this.climbScheduleIndex.get()]?.name ?? '';
        scheduledIas = this.climbIas.get();
        scheduledMach = this.climbMach.get();
        break;
      case FmsSpeedTargetSource.CruiseSchedule:
        scheduleName = this.settingManager.cruiseSchedules[this.cruiseScheduleIndex.get()]?.name ?? '';
        scheduledIas = this.cruiseIas.get();
        scheduledMach = this.cruiseMach.get();
        break;
      case FmsSpeedTargetSource.DescentSchedule:
        scheduleName = this.settingManager.descentSchedules[this.descentScheduleIndex.get()]?.name ?? '';
        scheduledIas = this.descentIas.get();
        scheduledMach = this.descentMach.get();
        break;
    }

    switch (vnavFlightPhase) {
      case GarminVNavFlightPhase.Climb: {
        this.computeTarget(
          speedConstraintFlightPhase,
          fmsScheduleSource,
          scheduleName,
          scheduledIas,
          scheduledMach,
          this.climbAltitudeCeiling.get(),
          this.climbAltitudeIasLimit.get(),
          configurationLimit
        );
        break;
      }
      case GarminVNavFlightPhase.Descent: {
        this.computeTarget(
          speedConstraintFlightPhase,
          fmsScheduleSource,
          scheduleName,
          scheduledIas,
          scheduledMach,
          this.descentAltitudeCeiling.get(),
          this.descentAltitudeIasLimit.get(),
          configurationLimit
        );
        break;
      }
      default: {
        this.computeTarget(
          speedConstraintFlightPhase,
          fmsScheduleSource,
          scheduleName,
          scheduledIas,
          scheduledMach,
          this.descentAltitudeCeiling.get(),
          this.descentAltitudeIasLimit.get(),
          configurationLimit
        );
        break;
      }
    }

    this.reconcileActiveTarget(configurationLimit);
    this.publishTargetData();

    if (!this.apSelectedSpeedIsManual.get()) {
      this.setApValues();
    }
  }

  /**
   * Gets the speed limit, in knots, imposed by the aircraft's current flaps/gear configuration.
   * @returns The speed limit, in knots, imposed by the aircraft's current flaps/gear configuration. A negative value
   * indicates there is no such limit.
   */
  private getConfigurationLimit(): number {
    const flapsExtension = Math.max(this.flapsLeftAngle.get(), this.flapsRightAngle.get());
    const gearExtension = Math.max(this.gearNosePosition.get(), this.gearLeftPosition.get(), this.gearRightPosition.get()) * 100;

    for (let i = this.configurationLimitSettings.length - 1; i >= 0; i--) {
      const def = this.settingManager.configurationSpeedDefinitions[i];

      if (def.type === 'flaps') {
        if (flapsExtension >= def.extension) {
          return Math.round(this.configurationLimitSettings[i].value);
        }
      } else {
        if (gearExtension >= def.extension) {
          return Math.round(this.configurationLimitSettings[i].value);
        }
      }
    }

    return -1;
  }

  /**
   * Computes a target speed for a given flight phase.
   * @param speedConstraintFlightPhase The current flight phase to use for determining how to follow flight plan speed
   * constraints, or `undefined` if it is unknown.
   * @param scheduleSource The source to use for speeds derived from the active performance schedule.
   * @param scheduleName The name of the currently active performance schedule.
   * @param scheduledIas The indicated airspeed, in knots, defined by the active performance schedule.
   * @param scheduledMach The mach number defined by the active performance schedule.
   * @param altitudeCeiling The altitude ceiling, in feet, for the current flight phase's altitude speed limit.
   * @param altitudeIasLimit The altitude speed limit, in knots, for the current flight phase.
   * @param configurationIasLimit The speed limit, in knots, imposed by the aircraft's current flaps/gear
   * configuration. A negative value indicates there is no such limit.
   */
  private computeTarget(
    speedConstraintFlightPhase: VerticalFlightPhase | undefined,
    scheduleSource: FmsSpeedTargetSource,
    scheduleName: string,
    scheduledIas: number,
    scheduledMach: number,
    altitudeCeiling: number,
    altitudeIasLimit: number,
    configurationIasLimit: number
  ): void {
    const activeLegIndex = this.lnavLegIndex.get();
    const alongTrackSpeed = this.lnavAlongTrackSpeed.get();

    const lateralPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

    const currentConstraint = speedConstraintFlightPhase === undefined || lateralPlan === undefined
      ? undefined
      : this.speedConstraintStore.getCurrentSpeedConstraint(activeLegIndex, speedConstraintFlightPhase);

    const nextConstraint = speedConstraintFlightPhase === undefined || alongTrackSpeed <= 0 || lateralPlan === undefined
      ? undefined
      : this.speedConstraintStore.getNextSpeedConstraint(activeLegIndex, speedConstraintFlightPhase);

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
    let constraintToUse = currentConstraint;
    let isAnticipatedAltitudeLimitArmed = false;
    let isAnticipatedAltitudeLimitActive = false;
    let armedAnticipatedConstraint: Readonly<SpeedConstraintListItem> | undefined = undefined;
    let anticipatedConstraint: Readonly<SpeedConstraintListItem> | undefined = undefined;

    // Compute speed targets with no anticipation.
    let targetSpeedInfo = this.computeSpeedsWithConstraint(
      scheduleSource,
      scheduledIas,
      scheduledMach,
      altitudeIasLimitToUse,
      configurationIasLimit,
      constraintToUse?.speedConstraint,
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
          configurationIasLimit,
          constraintToUse?.speedConstraint,
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
          configurationIasLimit,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          nextConstraint!.speedConstraint,
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
        configurationIasLimit,
        constraintToUse?.speedConstraint,
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
        configurationIasLimit,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextConstraint!.speedConstraint,
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

    // ---- Save Schedule ----

    this.currentSchedule = scheduleName;

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
   * @param configurationIasLimit The speed limit, in knots, imposed by the aircraft's current flaps/gear
   * configuration. A negative value indicates there is no such limit.
   * @param speedConstraint The speed constraint to use.
   * @param out The object to which to write the results.
   * @returns Computed maximum and target speeds using the specified speed constraint.
   */
  private computeSpeedsWithConstraint(
    scheduleSource: FmsSpeedTargetSource,
    scheduledIas: number,
    scheduledMach: number,
    altitudeIasLimit: number | undefined,
    configurationIasLimit: number,
    speedConstraint: Readonly<SpeedConstraint> | undefined,
    out: FmsComputedSpeedInfo
  ): FmsComputedSpeedInfo {
    scheduledIas = Math.round(scheduledIas);
    scheduledMach = MathUtils.round(scheduledMach, 0.001);
    altitudeIasLimit = altitudeIasLimit === undefined ? undefined : Math.round(altitudeIasLimit);

    const indicatedAltitude = this.indicatedAltitude.get();

    let minIasTarget = -Infinity;
    let minIasTargetSource = FmsSpeedTargetSource.None;
    let maxIasTarget = Infinity;
    let maxIasTargetSource = FmsSpeedTargetSource.None;
    let minMachTarget = -Infinity;
    let minMachTargetSource = FmsSpeedTargetSource.None;
    let maxMachTarget = Infinity;
    let maxMachTargetSource = FmsSpeedTargetSource.None;

    // ---- Flight Plan Speed Constraints ----

    switch (speedConstraint?.speedDesc) {
      case SpeedRestrictionType.AtOrAbove:
        if (speedConstraint.speedUnit === SpeedUnit.IAS) {
          minIasTarget = Math.round(speedConstraint.speed);
          minIasTargetSource = FmsSpeedTargetSource.Constraint;
        } else {
          minMachTarget = MathUtils.round(speedConstraint.speed, 0.001);
          minMachTargetSource = FmsSpeedTargetSource.Constraint;
        }
        break;
      case SpeedRestrictionType.AtOrBelow:
        if (speedConstraint.speedUnit === SpeedUnit.IAS) {
          maxIasTarget = Math.round(speedConstraint.speed);
          maxIasTargetSource = FmsSpeedTargetSource.Constraint;
        } else {
          maxMachTarget = MathUtils.round(speedConstraint.speed, 0.001);
          maxMachTargetSource = FmsSpeedTargetSource.Constraint;
        }
        break;
      case SpeedRestrictionType.At:
      case SpeedRestrictionType.Between:
        if (speedConstraint.speedUnit === SpeedUnit.IAS) {
          minIasTarget = maxIasTarget = Math.round(speedConstraint.speed);
          minIasTargetSource = maxIasTargetSource = FmsSpeedTargetSource.Constraint;
        } else {
          minMachTarget = maxMachTarget = MathUtils.round(speedConstraint.speed, 0.001);
          minMachTargetSource = maxMachTargetSource = FmsSpeedTargetSource.Constraint;
        }
        break;
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

    // ---- Departure Terminal Limit ----

    if (this.departureFacility !== null) {
      const agl = this.departureAgl.get();
      const radius = this.departureRadius.get();
      if (agl > 0 && radius > 0 && indicatedAltitude <= this.departureElevation + agl) {
        if (this.ppos.distance(this.departureFacility) <= UnitType.NMILE.convertTo(radius, UnitType.GA_RADIAN)) {
          const terminalLimit = Math.round(this.departureIasLimit.get());
          if (terminalLimit < minIasTarget) {
            minIasTarget = terminalLimit;
            minIasTargetSource = FmsSpeedTargetSource.Departure;
          }
          if (terminalLimit < maxIasTarget) {
            maxIasTarget = terminalLimit;
            maxIasTargetSource = FmsSpeedTargetSource.Departure;
          }
        }
      }
    }

    // ---- Arrival Terminal Limit ----

    if (this.arrivalFacility !== null) {
      const agl = this.arrivalAgl.get();
      const radius = this.arrivalRadius.get();
      if (agl > 0 && radius > 0 && indicatedAltitude <= this.arrivalElevation + agl) {
        if (this.ppos.distance(this.arrivalFacility) <= UnitType.NMILE.convertTo(radius, UnitType.GA_RADIAN)) {
          const terminalLimit = Math.round(this.arrivalIasLimit.get());
          if (terminalLimit < minIasTarget) {
            minIasTarget = terminalLimit;
            minIasTargetSource = FmsSpeedTargetSource.Arrival;
          }
          if (terminalLimit < maxIasTarget) {
            maxIasTarget = terminalLimit;
            maxIasTargetSource = FmsSpeedTargetSource.Arrival;
          }
        }
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

    const airframeMaxMach = this.airframeMaxMach.get();
    if (airframeMaxMach < minMachTarget) {
      minMachTarget = airframeMaxMach;
      minMachTargetSource = FmsSpeedTargetSource.Configuration;
    }
    if (airframeMaxMach < maxMachTarget) {
      maxMachTarget = airframeMaxMach;
      maxMachTargetSource = FmsSpeedTargetSource.Configuration;
    }

    // ---- Aircraft configuration ----

    if (configurationIasLimit >= 0) {
      if (configurationIasLimit < minIasTarget) {
        minIasTarget = configurationIasLimit;
        minIasTargetSource = FmsSpeedTargetSource.Configuration;
      }
      if (configurationIasLimit < maxIasTarget) {
        maxIasTarget = configurationIasLimit;
        maxIasTargetSource = FmsSpeedTargetSource.Configuration;
      }
    }

    // Save computed maximum speeds

    out.maxIas = maxIasTarget;
    out.maxIasSource = maxIasTargetSource;
    out.maxMach = maxMachTarget;
    out.maxMachSource = maxMachTargetSource;

    const maxSpeedHysteresis = this.maxIsMach ? FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;
    const maxMachIas = out.maxMach * this.machToKias;

    out.maxIsMach = maxMachIas - maxSpeedHysteresis < out.maxIas;

    // ---- Schedule ----

    if (scheduledIas < 0 || scheduledMach < 0) {
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

    const targetSpeedHysteresis = this.targetIsMach ? FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;

    const minMachTargetIas = minMachTarget * this.machToKias;
    const maxMachTargetIas = maxMachTarget * this.machToKias;

    const minIasPriority = FmsSpeedManager.SOURCE_PRIORITY[minIasTargetSource];
    const maxIasPriority = FmsSpeedManager.SOURCE_PRIORITY[maxIasTargetSource];
    const minMachPriority = FmsSpeedManager.SOURCE_PRIORITY[minMachTargetSource];
    const maxMachPriority = FmsSpeedManager.SOURCE_PRIORITY[maxMachTargetSource];

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
      out.targetIsMach = maxMachTargetIas - targetSpeedHysteresis < maxIasTarget;
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

    const anticipationThreshold = FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_BASE + FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_FACTOR * speedDelta
      + (isUsingAnticipated ? FmsSpeedManager.SPEED_REDUCTION_ANTICIPATION_HYSTERESIS : 0);

    return anticipationTime <= anticipationThreshold;
  }

  /**
   * Calculates the time remaining, in seconds, to sequence an upcoming speed constraint.
   * @param plan The active flight plan.
   * @param nextConstraint The upcoming speed constraint to query.
   * @param alongTrackSpeed The current along-track speed of the airplane, in knots.
   * @returns The time remaining, in seconds, to sequence the upcoming speed constraint.
   */
  private getSecondsToNextConstraint(plan: FlightPlan, nextConstraint: Readonly<SpeedConstraintListItem>, alongTrackSpeed: number): number | undefined {
    const distanceToNext = FmsSpeedManager.getDistanceToConstraint(
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
   * @param configurationIasLimit The speed limit, in knots, imposed by the aircraft's current flaps/gear
   * configuration. A negative value indicates there is no such limit.
   */
  private reconcileActiveTarget(configurationIasLimit: number): void {
    if (this.targetIas < 0 || this.targetMach < 0) {
      // If there is no computed target speed, it means the selected performance schedule is not targeting airspeed.
      // In this case we do not allow user speed overrides and just set the active target speeds to -1 to signal they
      // are undefined. We also reset the user speed overrides.

      this.userTargetIas.value = -1;
      this.userTargetMach.value = -1;
      this.userTargetIsMach.value = false;

      this.activeIas = -1;
      this.activeMach = -1;
      this.activeIsMach = false;

      return;
    }

    const userTargetIas = Math.round(this.userTargetIas.get());
    const userTargetMach = MathUtils.round(this.userTargetMach.get(), 0.001);
    const userTargetIsMach = this.userTargetIsMach.get();

    const userTargetIsSet = (userTargetIsMach ? userTargetMach : userTargetIas) >= 0;
    if (userTargetIsSet) {
      let activeIas = userTargetIas;
      let activeMach = userTargetMach;
      let activeIsMach = userTargetIsMach;

      // User overrides must still respect airframe and aircraft configuration limits.

      const airframeMaxIas = this.airframeMaxIas.get();
      const airframeMaxMach = this.airframeMaxMach.get();

      if (airframeMaxIas <= airframeMaxMach * this.machToKias) {
        // Airframe maximum IAS is limiting.

        let iasToCompare = activeIas;
        if (activeIsMach) {
          const hysteresis = this.activeIsMach ? FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;
          iasToCompare = activeMach * this.machToKias - hysteresis;
        }

        if (airframeMaxIas < iasToCompare) {
          activeIas = airframeMaxIas;
          activeIsMach = false;
        }
      } else {
        // Airframe maximum mach is limiting.

        let machToCompare = activeMach;
        if (!activeIsMach) {
          const hysteresis = this.activeIsMach ? FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;
          machToCompare = (activeIas + hysteresis) / this.machToKias;
        }

        if (airframeMaxMach < machToCompare) {
          activeMach = airframeMaxMach;
          activeIsMach = true;
        }
      }

      if (configurationIasLimit >= 0) {
        let iasToCompare = activeIas;
        if (activeIsMach) {
          const hysteresis = this.activeIsMach ? FmsSpeedManager.IAS_MACH_CONVERSION_HYSTERESIS : 0;
          iasToCompare = activeMach * this.machToKias - hysteresis;
        }

        if (configurationIasLimit < iasToCompare) {
          activeIas = configurationIasLimit;
          activeIsMach = false;
        }
      }

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
    if (this.currentSchedule !== this.publishedCurrentSchedule) {
      this.publishedCurrentSchedule = this.currentSchedule;
      this.publisher.pub('fms_speed_computed_schedule', this.currentSchedule, true, true);
    }

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
      this.publisher.pub('fms_speed_active_target_ias', this.activeIas, true, true);
    }

    if (this.activeMach !== this.publishedActiveMach) {
      this.publishedActiveMach = this.activeMach;
      this.publisher.pub('fms_speed_active_target_mach', this.activeMach, true, true);
    }

    if (this.activeIsMach !== this.publishedActiveIsMach) {
      this.publishedActiveIsMach = this.activeIsMach;
      this.publisher.pub('fms_speed_active_target_is_mach', this.activeIsMach, true, true);
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

    if (this.activeIsMach) {
      if (this.apSelectedMach.get() !== this.activeMach) {
        // Round mach to nearest 0.001.
        keyEventManager.triggerKey('AP_MACH_VAR_SET_EX1', true, (Math.max(0, Math.round(this.activeMach * 1e3) * 1e3)));
      }
    } else {
      if (this.apSelectedIas.get() !== this.activeIas) {
        // Round IAS to nearest knot.
        keyEventManager.triggerKey('AP_SPD_VAR_SET', true, Math.max(0, Math.round(this.activeIas)));
      }
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('FmsSpeedManager: manager was destroyed'); });

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

    this.cruiseAltitude.destroy();
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