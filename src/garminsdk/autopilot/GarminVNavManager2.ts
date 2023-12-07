import {
  AdcEvents, AltitudeConstraintDetails, AltitudeRestrictionType, APEvents, APLateralModes, APValues, APVerticalModes,
  BitFlags, ClockEvents, ConsumerSubject, ConsumerValue, ControlEvents, EventBus, FlightPlan, FlightPlanner, FlightPlannerEvents,
  FlightPlanSegmentType, GeoPoint, GlidePathCalculator, GNSSEvents, GPSSystemState, LegDefinitionFlags, LNavDataEvents,
  LNavEvents, MathUtils, NavMath, ObjectSubject, RnavTypeFlags, SimVarValueType, SpeedConstraint, SpeedRestrictionType,
  SpeedUnit, Subject, Subscribable, TocBocDetails, UnitType, VerticalFlightPhase, VerticalFlightPlan, VNavAltCaptureType,
  VNavAvailability, VNavConstraint, VNavControlEvents, VNavEvents, VNavLeg, VNavManager, VNavPathCalculator,
  VNavPathMode, VNavState, VNavUtils, VNavVars
} from '@microsoft/msfs-sdk';

import { ApproachDetails, FmsEvents, FmsUtils } from '../flightplan';
import { GarminVNavFlightPhase, GarminVNavTrackingPhase, VNavDataEvents } from './data/VNavDataEvents';
import { GarminTodBodDetails, GlidepathServiceLevel } from './GarminVerticalNavigation';
import { GarminVNavUtils } from './GarminVNavUtils';
import { GlidepathServiceLevelCalculator } from './GlidepathServiceLevelCalculator';

/**
 * Guidance options for the Garmin VNAV Manager.
 */
export interface GarminVNavGuidanceOptions {

  /** Whether to allow +V approach service levels when no SBAS is present. */
  allowPlusVWithoutSbas: boolean;

  /** Whether to allow approach service levels requiring baro VNAV. */
  allowApproachBaroVNav: boolean;

  /** Whether to allow RNP (AR) approach service levels. */
  allowRnpAr: boolean;

  /** Whether to enable Garmin advanced VNAV. */
  enableAdvancedVNav: boolean;

  /** The current GPS system state. */
  gpsSystemState: Subscribable<GPSSystemState>;
}

/**
 * A new Garmin VNav Manager.
 */
export class GarminVNavManager2 implements VNavManager {
  private static readonly EMPTY_SPEED_CONSTRAINT: SpeedConstraint = { speedDesc: SpeedRestrictionType.Unused, speed: 0, speedUnit: SpeedUnit.IAS };

  /** The distance, in meters, from the first TOD in the flight plan the airplane must reach in order to enter descent phase. */
  private static readonly DESCENT_PHASE_TOD_DISTANCE = UnitType.NMILE.convertTo(10, UnitType.METER);
  /** The vertical distance, in feet, below the cruise altitude the airplane must reach in order to enter cruise phase. */
  private static readonly CRUISE_PHASE_ALTITUDE_THRESHOLD = 500;

  /**
   * The vertical distance, in meters, above the TOC altitude which defines the BOC suppression threshold. If the
   * airplane's indicated altitude is above this threshold, any existing BOC will be suppressed.
   */
  private static readonly BOC_SUPPRESS_ALTITUDE_THRESHOLD = UnitType.FOOT.convertTo(250, UnitType.METER);
  /**
   * The vertical distance, in meters, below the TOC altitude which defines the TOC suppression threshold. If the
   * airplane's indicated altitude is above this threshold, any existing TOC will be suppressed.
   */
  private static readonly TOC_SUPPRESS_ALTITUDE_THRESHOLD = UnitType.FOOT.convertTo(250, UnitType.METER);

  /**
   * The time to TOD threshold, in seconds, below which the descent path on which the TOD lies becomes the active
   * descent path and can be captured by VPATH.
   */
  private static readonly ACTIVE_PATH_TOD_TIME_THRESHOLD = 60;

  /**
   * The amount of hysteresis applied to the time to TOD threshold, in seconds, after a descent path has become active.
   */
  private static readonly ACTIVE_PATH_TOD_TIME_HYSTERESIS = 30;

  private readonly publisher = this.bus.getPublisher<VNavEvents & VNavDataEvents>();

  private _realTime = 0;

  public state = VNavState.Disabled;

  private _isActive = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether VNAV is active. */
  public get isActive(): boolean {
    return this._isActive;
  }

  private readonly pathMode = Subject.create<VNavPathMode>(VNavPathMode.None);

  private readonly planePos = new GeoPoint(0, 0);

  private currentAltitude = 0;
  private currentGpsAltitude = 0;
  private preselectedAltitude = 0;
  private currentGroundSpeed = 0;
  private currentVS = 0;
  private trueTrack = 0;

  private readonly approachDetails = ConsumerSubject.create<Readonly<ApproachDetails>>(this.bus.getSubscriber<FmsEvents>().on('fms_approach_details'), {
    isLoaded: false,
    type: ApproachType.APPROACH_TYPE_UNKNOWN,
    isRnpAr: false,
    bestRnavType: RnavTypeFlags.None,
    rnavTypeFlags: RnavTypeFlags.None,
    isCircling: false,
    isVtf: false,
    referenceFacility: null,
    runway: null
  }, FmsUtils.approachDetailsEquals);
  private readonly isApproachLoc = this.approachDetails.map(details => {
    switch (details.type) {
      case ApproachType.APPROACH_TYPE_ILS:
      case ApproachType.APPROACH_TYPE_LDA:
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
      case ApproachType.APPROACH_TYPE_SDF:
        return true;
      default:
        return false;
    }
  });

  public readonly options: Readonly<GarminVNavGuidanceOptions>;

  private readonly isVNavUnavailable = Subject.create<boolean>(false);

  /** A callback called when the manager is enabled. */
  public onEnable?: () => void;

  /** A callback called when the manager is disabled. */
  public onDisable?: () => void;

  public onActivate?: () => void;

  public onDeactivate?: () => void;

  /** A callback called by the autopilot to arm the supplied vertical mode. */
  public armMode?: (mode: APVerticalModes) => void;

  /** A callback called by the autopilot to activate the supplied vertical mode. */
  public activateMode?: (mode: APVerticalModes) => void;

  public capturedAltitude = 0;

  private isAltCaptured = false;
  // private awaitingAltCap = -1;
  // private awaitingRearm = -1;
  private blendingDeviationTargetLegIndex: number | null = null;
  private blendedDeviationTotalDistance: number | null = null;

  private isClimbArmed = false;
  private awaitingPathRearm = false;
  private pathRearmIndex = -1;

  private pilotPathIntervention = false;

  private lateralPlanChanged = false;
  private lateralPlanChangedTimer = 0;

  /** The highest VNAV constraint altitude that appears in the primary flight plan. */
  private highestConstraintAltitude = 0;
  /** The global index of the last leg in the last non-missed approach climb constraint in the primary flight plan. */
  private lastClimbConstraintLegIndex = -1;
  /** The global index of the last leg in the first descent constraint in the primary flight plan. */
  private firstDescentConstraintLegIndex = -1;

  private activePathConstraintIndex = -1;

  public readonly glidepathCalculator = new GlidePathCalculator(this.bus, this.flightPlanner, this.primaryPlanIndex);

  private readonly todBodDetails: GarminTodBodDetails = {
    todLegIndex: -1,
    bodLegIndex: -1,
    todLegDistance: 0,
    distanceFromTod: 0,
    distanceFromBod: 0,
    bodConstraintIndex: -1,
    todConstraintIndex: -1
  };

  private readonly tocBocDetails: TocBocDetails = {
    tocLegIndex: -1,
    bocLegIndex: -1,
    tocLegDistance: 0,
    distanceFromToc: 0,
    distanceFromBoc: 0,
    tocConstraintIndex: -1,
    tocAltitude: -1
  };

  private readonly todBodDetailsSubject = ObjectSubject.create<GarminTodBodDetails>(Object.assign({}, this.todBodDetails));
  private readonly tocBocDetailsSubject = ObjectSubject.create<TocBocDetails>(Object.assign({}, this.tocBocDetails));

  // Subjects for each vnav var to be set
  private readonly vnavState = Subject.create<VNavState>(VNavState.Enabled_Inactive);
  private readonly pathAvailable = Subject.create<boolean>(false);
  private readonly currentConstraintLegIndex = Subject.create(-1);
  private readonly vnavActiveConstraintLegIndex = Subject.create(-1);
  private readonly targetAltitude = Subject.create<number | null>(null);
  private readonly fpa = Subject.create<number | null>(null);
  private readonly verticalDeviation = Subject.create<number | null>(null);
  private readonly requiredVS = Subject.create<number | null>(null);
  private readonly captureType = Subject.create<VNavAltCaptureType>(VNavAltCaptureType.None);
  private readonly gpVerticalDeviation = Subject.create<number | null>(null);
  private readonly gpDistance = Subject.create<number | null>(null);
  private readonly gpFpa = Subject.create<number | null>(null);
  private readonly gpServiceLevel = Subject.create<GlidepathServiceLevel>(GlidepathServiceLevel.None);
  private readonly cruiseAltitude = Subject.create(0);
  private readonly vnavFlightPhase = Subject.create(GarminVNavFlightPhase.None);
  private readonly vnavTrackingPhase = Subject.create(GarminVNavTrackingPhase.None);

  private readonly currentAltitudeConstraintDetailsWorking: AltitudeConstraintDetails = {
    type: AltitudeRestrictionType.Unused,
    altitude: 0
  };

  private readonly currentAltitudeConstraintDetails = Subject.create<Readonly<AltitudeConstraintDetails>>(
    { type: AltitudeRestrictionType.Unused, altitude: 0 },
    VNavUtils.altitudeConstraintDetailsEquals
  );

  // LNAV Consumer Subjects
  private readonly lnavLegIndex: ConsumerValue<number>;
  private readonly lnavLegDistanceAlong: ConsumerValue<number>;
  private readonly lnavLegDistanceRemaining: ConsumerValue<number>;
  private readonly lnavXtk: ConsumerValue<number>;
  private readonly lnavDtk: ConsumerValue<number>;
  private readonly lnavDataCdiScale: ConsumerValue<number>;

  private readonly gpSupported: ConsumerValue<boolean>;

  private readonly activateMaprState: ConsumerValue<boolean>;

  private readonly noVNavTae = Subject.create<boolean>(false);
  private readonly noVNavXtk = Subject.create<boolean>(false);

  // PATH Error Subjects
  public readonly pathArmedError = Subject.create<boolean>(false);

  private readonly pathBelowAircraft = Subject.create<boolean>(false);
  private readonly noPathThisLeg = Subject.create<boolean>(false);
  private readonly noPathPilotCmd = Subject.create<boolean>(false);
  private readonly noPathConditionPlanChanged = Subject.create<boolean>(false);
  private readonly noPathConditionDisco = Subject.create<boolean>(false);
  private readonly noPathVectors = Subject.create<boolean>(false);
  private readonly checkAltSel = Subject.create<boolean>(false);
  private readonly withinOneMinuteTod = Subject.create<boolean>(false);
  private readonly withinFiveSecondsTod = Subject.create<boolean>(false);
  private readonly checkFplnAlt = Subject.create<boolean>(false);

  private readonly glidepathServiceLevelCalculator: GlidepathServiceLevelCalculator;

  /**
   * Creates an instance of the Garmin VNAV Manager.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param calculator The VNAV path calculator to use with this instance.
   * @param apValues are the autopilot ap values.
   * @param primaryPlanIndex The index of the flightplan to follow vertical guidance from.
   * @param options The options to apply to this VNAV manager.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    public readonly calculator: VNavPathCalculator,
    private readonly apValues: APValues,
    private readonly primaryPlanIndex: number,
    options?: Partial<Readonly<GarminVNavGuidanceOptions>>
  ) {
    this.options = {
      allowPlusVWithoutSbas: options?.allowPlusVWithoutSbas ?? true,
      allowApproachBaroVNav: options?.allowApproachBaroVNav ?? false,
      allowRnpAr: options?.allowRnpAr ?? false,
      enableAdvancedVNav: options?.enableAdvancedVNav ?? false,
      gpsSystemState: options?.gpsSystemState ?? Subject.create(GPSSystemState.DiffSolutionAcquired)
    };

    this.glidepathServiceLevelCalculator = new GlidepathServiceLevelCalculator(
      this.options.allowPlusVWithoutSbas,
      this.options.allowApproachBaroVNav,
      this.options.allowRnpAr,
      this.options.gpsSystemState,
      this.approachDetails
    );

    const sub = this.bus.getSubscriber<
      LNavEvents & LNavDataEvents & APEvents & AdcEvents & GNSSEvents & ClockEvents & FlightPlannerEvents
      & FmsEvents & VNavDataEvents & VNavControlEvents & ControlEvents
    >();

    this.lnavLegIndex = ConsumerValue.create(sub.on('lnav_tracked_leg_index'), 0);
    this.lnavLegDistanceAlong = ConsumerValue.create(sub.on('lnav_leg_distance_along'), 0);
    this.lnavLegDistanceRemaining = ConsumerValue.create(sub.on('lnav_leg_distance_remaining'), 0);
    this.lnavXtk = ConsumerValue.create(sub.on('lnav_xtk'), 0);
    this.lnavDtk = ConsumerValue.create(sub.on('lnav_dtk'), 0);

    this.lnavDataCdiScale = ConsumerValue.create(sub.on('lnavdata_cdi_scale'), 4);

    sub.on('ap_altitude_selected').handle(selected => this.preselectedAltitude = selected);
    sub.on('indicated_alt').handle(alt => this.currentAltitude = alt);
    sub.on('vertical_speed').whenChangedBy(1).handle(vs => this.currentVS = vs);
    sub.on('track_deg_true').whenChangedBy(1).handle(trueTrack => this.trueTrack = trueTrack);
    sub.on('realTime').whenChangedBy(100).handle(t => this._realTime = t);

    // Proxy for executing a plan change
    sub.on('fplCopied').handle(e => {
      if (this.pathMode.get() === VNavPathMode.PathActive && e.targetPlanIndex === 0 && !this.lateralPlanChanged) {
        this.lateralPlanChanged = true;
        this.lateralPlanChangedTimer = Date.now();
      }
    });

    sub.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
      this.currentGpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    });
    sub.on('ground_speed').handle(gs => this.currentGroundSpeed = gs);

    this.approachDetails.setConsumer(sub.on('fms_approach_details'));
    this.gpSupported = ConsumerValue.create(sub.on('approach_supports_gp'), false);

    this.activateMaprState = ConsumerValue.create(sub.on('activate_missed_approach'), false);

    this.apValues.approachHasGP.sub(v => {
      this.bus.getPublisher<VNavDataEvents>().pub('gp_available', v, true);
    });

    sub.on('vnav_set_state').handle(d => {
      if (d) {
        this.setState(VNavState.Enabled_Inactive);
      } else {
        this.setState(VNavState.Disabled);
      }
    });

    // Update the highest constraint altitude in the flight plan (excluding the missed approach)
    this.calculator.planBuilt.on((sender, planIndex) => {
      if (planIndex === this.primaryPlanIndex) {
        const verticalPlan = this.calculator.getVerticalFlightPlan(planIndex);
        const missedApproachStartIndex = verticalPlan.missedApproachStartIndex ?? Infinity;
        this.highestConstraintAltitude = verticalPlan.constraints.reduce((highestAlt, constraint) => {
          if (constraint.index >= missedApproachStartIndex) {
            return highestAlt;
          }

          return Math.max(
            highestAlt,
            isFinite(constraint.minAltitude) ? constraint.minAltitude : 0,
            isFinite(constraint.maxAltitude) ? constraint.maxAltitude : 0,
          );
        }, 0);
      }
    });

    // Update last climb/first descent constraint indexes
    this.calculator.vnavCalculated.on((sender, planIndex) => {
      const verticalPlan = this.calculator.getVerticalFlightPlan(planIndex);
      const missedApproachStartIndex = verticalPlan.missedApproachStartIndex ?? Infinity;
      const verticalPlanConstraints = verticalPlan.constraints;

      this.lastClimbConstraintLegIndex = -1;
      let lastClimbConstraintIndex = -1;
      for (let i = 0; i < verticalPlanConstraints.length; i++) {
        const constraint = verticalPlanConstraints[i];
        if (constraint.index < missedApproachStartIndex && constraint.type === 'climb') {
          this.lastClimbConstraintLegIndex = constraint.index;
          lastClimbConstraintIndex = i;
          break;
        }
      }

      this.firstDescentConstraintLegIndex = -1;
      for (let i = (lastClimbConstraintIndex < 0 ? verticalPlanConstraints.length : lastClimbConstraintIndex) - 1; i >= 0; i--) {
        const constraint = verticalPlanConstraints[i];
        if ((constraint.type === 'descent' || constraint.type === 'manual' || constraint.type === 'direct') && constraint.fpa > 0) {
          this.firstDescentConstraintLegIndex = constraint.index;
          break;
        }
      }
    });

    this.apValues.verticalActive.sub(mode => {
      if (mode === APVerticalModes.ALT && this.isClimbArmed) {
        this.armMode && this.armMode(APVerticalModes.FLC);
      }

      if (this.awaitingPathRearm && mode !== APVerticalModes.ALT && mode !== APVerticalModes.CAP) {
        this.awaitingPathRearm = false;
        this.pathRearmIndex = -1;
      }

      if (mode === APVerticalModes.FLC && this.isClimbArmed) {
        this.isClimbArmed = false;
      }

      if ((this.noPathConditionDisco.get() || this.noPathConditionPlanChanged.get()) && mode !== APVerticalModes.PITCH) {
        this.noPathConditionDisco.set(false);
        this.noPathConditionPlanChanged.set(false);
      }
    });

    this.apValues.lateralActive.sub(mode => {
      if (mode === APLateralModes.LOC && this.pathMode.get() === VNavPathMode.PathArmed) {
        this.tryDeactivate();
      }
    });

    // Publish TOD/BOD and BOC/TOC details.
    this.todBodDetailsSubject.sub(this.publishTodBodDetails.bind(this), true);
    this.tocBocDetailsSubject.sub(this.publishBocTocDetails.bind(this), true);

    this.isVNavUnavailable.sub(v => {
      this.publisher.pub('vnav_availability', v ? VNavAvailability.InvalidLegs : VNavAvailability.Available, true, true);
    }, true);

    this.monitorVars();

    this.monitorMessages();

    this.setState(VNavState.Enabled_Active);
  }

  /** @inheritdoc */
  public setState(vnavState: VNavState): void {
    if (vnavState !== this.state) {

      this.state = vnavState;

      switch (this.state) {
        case VNavState.Disabled:
          this.disarmPath();
          this.disarmClimb();
          this.isAltCaptured = false;
          this.awaitingPathRearm = false;
          this.pathRearmIndex = -1;
          this.pilotPathIntervention = false;
          this.lateralPlanChanged = false;
          this.lateralPlanChangedTimer = 0;
          this.clearAllMessages();
          SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool', false);
          break;
        case VNavState.Enabled_Active:
          this.tryActivate();
          break;
        case VNavState.Enabled_Inactive:
          this.tryDeactivate();
          break;
      }

      SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, this.state);
    }
  }

  /** @inheritdoc */
  public tryActivate(): void {
    if (this.state !== VNavState.Disabled) {
      if (this.options.enableAdvancedVNav || this.calculator.getFlightPhase(this.primaryPlanIndex) === VerticalFlightPhase.Descent) {
        this.state = VNavState.Enabled_Active;
        SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, this.state);
        this.pathMode.set(VNavPathMode.None);
      }
    }
  }

  /** @inheritdoc */
  public tryDeactivate(newMode?: APVerticalModes): void {
    if (this.state !== VNavState.Disabled) {

      if (this.state !== VNavState.Enabled_Inactive) {
        this.state = VNavState.Enabled_Inactive;
        SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, this.state);
        this.disarmPath(newMode);
        this.disarmClimb();
        this.isAltCaptured = false;
        this.awaitingPathRearm = false;
        this.pathRearmIndex = -1;
        this.pilotPathIntervention = false;
        this.lateralPlanChanged = false;
        this.lateralPlanChangedTimer = 0;
        this.clearAllMessages();
        SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool', false);
      }
    }
  }

  /** @inheritdoc */
  public canVerticalModeActivate(mode: APVerticalModes): boolean {

    if (this.isClimbArmed && (mode === APVerticalModes.FLC || mode === APVerticalModes.VS)) {
      return false;
    }

    if (this.pathMode.get() === VNavPathMode.PathActive && this.apValues.verticalActive.get() === APVerticalModes.PATH) {
      this.pilotPathIntervention = true;
    }

    return true;
  }

  /** @inheritdoc */
  public onPathDirectorDeactivated(): void {
    const verticalActive = this.apValues.verticalActive.get();
    if (verticalActive === APVerticalModes.GP || verticalActive === APVerticalModes.GS) {
      this.pathMode.set(VNavPathMode.None);
      this.tryDeactivate();
    } else if (this.pathMode.get() === VNavPathMode.PathActive || this.pathMode.get() === VNavPathMode.PathArmed) {
      this.pathMode.set(VNavPathMode.None);
      this.isAltCaptured = false;
      this.checkAltSel.set(false);
    }
  }

  /**
   * Method to call when VNAV Encounters a failed state.
   */
  private failed(): void {
    this._isActive = false;
    if (this.pathMode.get() === VNavPathMode.PathActive && !this.isAltCaptured) {
      this.tryDeactivate(APVerticalModes.PITCH);
    }
    this.disarmClimb();
    this.resetGpVars();
    this.resetVNavTrackingVars();
    this.resetTodBodVars();
    this.resetTocBocVars();

    this.activePathConstraintIndex = -1;
    this.awaitingPathRearm = false;
    this.pathRearmIndex = -1;
  }

  /**
   * Method called to delegate altitude capture to the Alt Cap Director.
   * @param altitude The altitude to capture.
   * @param flightPhase The flightphase to rearm for, or undefined if no re-arm is desired.
   * @param pathRearmIndex The global leg index at which we want to rearm path, otherwise the next leg index.
   */
  private delegateAltCap(altitude: number, flightPhase?: VerticalFlightPhase, pathRearmIndex?: number): void {
    this.isAltCaptured = true;
    this.capturedAltitude = Math.round(altitude);
    this.apValues.capturedAltitude.set(this.capturedAltitude);
    if (flightPhase !== undefined) {
      switch (flightPhase) {
        case VerticalFlightPhase.Climb:
          this.isClimbArmed = true;
          break;
        case VerticalFlightPhase.Descent:
          this.awaitingPathRearm = true;
          this.pathRearmIndex = pathRearmIndex ?? this.lnavLegIndex.get() + 1;
          break;
      }
    }
    this.activateMode && this.activateMode(APVerticalModes.CAP);
  }

  /**
   * Disarms climb (FLC) mode.
   */
  private disarmClimb(): void {
    if (!this.isClimbArmed) {
      return;
    }

    this.isClimbArmed = false;
    if (this.apValues.verticalArmed.get() === APVerticalModes.FLC) {
      this.armMode && this.armMode(APVerticalModes.NONE);
    }
  }

  /**
   * Arms PATH mode.
   */
  private armPath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathArmed) {
      this.pathMode.set(VNavPathMode.PathArmed);
    }
    this.isAltCaptured = false;
    this.awaitingPathRearm = false;
    this.pathRearmIndex = -1;
    this.armMode && this.armMode(APVerticalModes.PATH);
  }

  /**
   * Activates PATH mode.
   */
  private activatePath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathActive) {
      this.pathMode.set(VNavPathMode.PathActive);
    }
    this.awaitingPathRearm = false;
    this.pathRearmIndex = -1;
    this.activateMode && this.activateMode(APVerticalModes.PATH);
  }

  /**
   * Deactivates and disarms PATH mode.
   * @param newMode The vertical autopilot mode to activate if PATH must be deactivated.
   */
  private disarmPath(newMode = APVerticalModes.PITCH): void {
    if (this.pathMode.get() !== VNavPathMode.None) {

      if (this.pathMode.get() === VNavPathMode.PathActive) {
        this.activateMode && this.activateMode(newMode);
      }

      if (this.pathMode.get() === VNavPathMode.PathArmed) {
        this.armMode && this.armMode(APVerticalModes.NONE);
      }

      this.pathMode.set(VNavPathMode.None);
      this.isAltCaptured = false;
      this.checkAltSel.set(false);
    }
  }

  /**
   * Updates the VNAV director.
   */
  public update(): void {
    if (this.lateralPlanChanged && this._realTime - this.lateralPlanChangedTimer > 1500) {
      this.lateralPlanChanged = false;
      this.lateralPlanChangedTimer = 0;
    }

    // Update cruise altitude
    this.cruiseAltitude.set(MathUtils.round(Math.max(this.currentAltitude, this.preselectedAltitude, this.highestConstraintAltitude), 10));

    if (!this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      this.failed();
      this.resetVNavPhase();
      this.resetVNavConstraintVars();
      return;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
    const verticalPlan = this.calculator.getVerticalFlightPlan(this.primaryPlanIndex);

    const alongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const lateralLegIndex = this.lnavLegIndex.get();

    if (
      lateralPlan.length > 0
      && lateralLegIndex < lateralPlan.length
      && VNavUtils.verticalPlanHasLeg(verticalPlan, lateralLegIndex)
    ) {

      const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, lateralLegIndex);
      const currentConstraint = verticalPlan.constraints[currentConstraintIndex] as VNavConstraint | undefined;

      const firstDescentConstraintIndex = this.firstDescentConstraintLegIndex < 0
        ? -1
        : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, this.firstDescentConstraintLegIndex);

      const isInDeparture = lateralPlan.getSegment(lateralPlan.getSegmentIndex(lateralLegIndex)).segmentType === FlightPlanSegmentType.Departure;
      const isInMapr = this.activateMaprState.get() || BitFlags.isAll(lateralPlan.getLeg(lateralLegIndex).flags, LegDefinitionFlags.MissedApproach);

      if (this.currentGroundSpeed >= 30) {
        this.updateTrackErrorState();

        const trackError = this.noVNavTae.get() || this.noVNavXtk.get();

        // If there is no active constraint (meaning we've passed the last constraint in the flight plan or there are no
        // constraints in the flight plan), then switch to FLC mode if it is armed.
        if (
          !currentConstraint
          && this.isClimbArmed
          && this.apValues.selectedAltitude.get() > this.capturedAltitude
        ) {
          this.capturedAltitude = Number.POSITIVE_INFINITY;
          this.isAltCaptured = false;
          this.isClimbArmed = false;
          this.activateMode && this.activateMode(APVerticalModes.FLC);
        }

        if (this.state === VNavState.Disabled || !currentConstraint) {
          this._isActive = false;
          this.disarmClimb();
          this.disarmPath();
          this.resetVNavConstraintVars();
          this.resetVNavTrackingVars();
          this.resetTodBodVars();
          this.resetTocBocVars();
          this.activePathConstraintIndex = -1;
          this.awaitingPathRearm = false;
          this.pathRearmIndex = -1;

          // Need to handle phase logic if VNAV is not disabled
          if (this.state !== VNavState.Disabled) {
            const hasClimbConstraint = this.lastClimbConstraintLegIndex >= 0;
            const hasDescentConstraint = this.firstDescentConstraintLegIndex >= 0;

            if (!hasClimbConstraint && !hasDescentConstraint) {
              // There are no constraints in the flight plan.
              this.resetVNavPhase();
            } else {
              if (isInDeparture) {
                // We are in the departure (SID).
                this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
                this.vnavTrackingPhase.set(hasDescentConstraint ? GarminVNavTrackingPhase.Descent : GarminVNavTrackingPhase.Climb);
              } else if (hasDescentConstraint) {
                // There is at least one descent constraint in the flight plan and we must be past it.
                this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
                this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Descent);
              } else {
                // There are no descent constraints in the flight plan but at least one climb constraint and we must be past it.
                if (this.currentAltitude >= this.cruiseAltitude.get() - GarminVNavManager2.CRUISE_PHASE_ALTITUDE_THRESHOLD) {
                  this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
                  this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Cruise);
                } else {
                  this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
                  this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Climb);
                }
              }
            }
          } else {
            this.resetVNavPhase();
          }
        } else {
          const currentAltitudeMetric = UnitType.FOOT.convertTo(this.currentAltitude, UnitType.METER);
          const currentVSMetric = UnitType.FPM.convertTo(this.currentVS, UnitType.MPM);

          // Compute TOD/BOD and (if supported) TOC/BOC details.

          const todBodDetails = GarminVNavUtils.getTodBodDetails(
            verticalPlan, currentConstraintIndex, lateralLegIndex, alongLegDistance, currentAltitudeMetric, currentVSMetric, this.todBodDetails
          );

          // Update VNAV flight and tracking phases.

          const isPastTod = this.firstDescentConstraintLegIndex >= 0 && firstDescentConstraintIndex >= 0 // There is at least one descent constraint and...
            && (
              // ... we are past the first descent constraint...
              lateralLegIndex > this.firstDescentConstraintLegIndex
              // ... or we are within threshold distance of TOD
              || (todBodDetails.todLegIndex >= 0 && todBodDetails.distanceFromTod <= GarminVNavManager2.DESCENT_PHASE_TOD_DISTANCE)
              // ... or we are within threshold distance of the first descent constraint
              || (
                GarminVNavUtils.getDistanceToConstraint(
                  verticalPlan,
                  firstDescentConstraintIndex,
                  lateralLegIndex,
                  alongLegDistance
                ) <= GarminVNavManager2.DESCENT_PHASE_TOD_DISTANCE
              )
            );
          const isInCruise = lateralLegIndex > this.lastClimbConstraintLegIndex // We have sequenced all climb constraints and...
            // ... we are within threshold vertical distance of the cruise altitude
            && this.currentAltitude >= this.cruiseAltitude.get() - GarminVNavManager2.CRUISE_PHASE_ALTITUDE_THRESHOLD;

          // VNAV flight phase:
          // Climb: in departure segment or airplane has not yet sequenced all climb constraints (excluding the ones in
          //        the missed approach) or airplane is more than 500 feet below the cruise altitude.
          // Cruise: airplane is not in the departure segment and has sequenced all climb constraints (excluding the ones
          //         in the missed approach) and the airplane is higher than 500 feet below the cruise altitude.
          // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan.

          if (isInDeparture) {
            this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
          } else if (isPastTod) {
            this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
          } else if (isInCruise) {
            this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
          } else {
            this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
          }

          // VNAV tracking phase (determines whether VNAV will track climb or descent):

          if (this.options.enableAdvancedVNav) {
            // Climb: airplane is not past 10 NM to go to the first TOD in the flight plan and has not sequenced all
            //        climb constraints or is lower than 500 feet below the cruise altitude.
            // Cruise: airplane has sequenced all climb constraints (excluding the ones in the missed approach) and the
            //         airplane is higher than 500 feet below the cruise altitude.
            // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan and is not in the missed
            //          approach.
            // Missed approach: airplane is in the missed approach.

            if (isInMapr) {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.MissedApproach);
            } else if (isPastTod) {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
            } else if (isInCruise) {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
            } else {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Climb);
            }
          } else {
            // Cruise: default phase.
            // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan.

            if (isPastTod) {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
            } else {
              this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
            }
          }

          const vnavTrackingPhase = this.vnavTrackingPhase.get();
          const inClimb = vnavTrackingPhase === GarminVNavTrackingPhase.Climb || vnavTrackingPhase === GarminVNavTrackingPhase.MissedApproach;

          this.currentConstraintLegIndex.set(currentConstraint.index);

          // Find the constraint matching the current tracking phase that applies to the active flight plan leg.
          let currentPhaseConstraintIndex: number;
          if (isInMapr) {
            currentPhaseConstraintIndex = currentConstraint.type === 'missed'
              ? currentConstraintIndex
              : VNavUtils.getNextMaprConstraintIndex(verticalPlan, lateralLegIndex);
          } else if (inClimb) {
            currentPhaseConstraintIndex = currentConstraint.type === 'climb'
              ? currentConstraintIndex
              : VNavUtils.getNextClimbConstraintIndex(verticalPlan, lateralLegIndex);
          } else {
            currentPhaseConstraintIndex = currentConstraint.type !== 'climb' && currentConstraint.type !== 'missed'
              ? currentConstraintIndex
              : VNavUtils.getNextDescentConstraintIndex(verticalPlan, lateralLegIndex);
          }
          const currentPhaseConstraint = verticalPlan.constraints[currentPhaseConstraintIndex] as VNavConstraint | undefined;

          if (trackError) {
            // If one or more LNAV track error limits have been exceeded, reset all vertical tracking data but still
            // publish constraint data (current + active constraint and FPA).

            this._isActive = false;
            this.disarmClimb();
            this.disarmPath();
            this.resetVNavTrackingVars();
            this.resetTodBodVars();
            this.resetTocBocVars();

            if (inClimb) {
              // The active constraint is the current phase constraint.

              this.vnavActiveConstraintLegIndex.set(currentPhaseConstraint === undefined ? -1 : currentPhaseConstraint.index);
              this.fpa.set(null);
            } else {
              // The active constraint and FPA are based on the last known active path constraint, if one exists and does
              // not precede (in flight plan order) the current constraint (the constraint containing the active flight
              // plan leg). Otherwise, they are based on the current phase constraint.

              const activeConstraintIndex = this.activePathConstraintIndex < 0 || this.activePathConstraintIndex > currentConstraintIndex
                ? currentPhaseConstraintIndex
                : this.activePathConstraintIndex;

              const activeConstraint = verticalPlan.constraints[activeConstraintIndex] as VNavConstraint | undefined;
              if (activeConstraint) {
                this.vnavActiveConstraintLegIndex.set(activeConstraint.index);
                this.fpa.set(activeConstraint.fpa);
              } else {
                this.vnavActiveConstraintLegIndex.set(-1);
                this.fpa.set(null);
              }
            }
          } else {

            // If we are in the climb or missed approach tracking phases and advanced VNAV is supported, calculate
            // TOC/BOC details. Otherwise blank the TOC/BOC details.

            const tocBocDetails = this.tocBocDetails;
            if (inClimb && this.options.enableAdvancedVNav) {
              GarminVNavUtils.getTocBocDetails(
                verticalPlan,
                currentConstraintIndex,
                lateralLegIndex, alongLegDistance,
                this.currentGroundSpeed, currentAltitudeMetric, currentVSMetric,
                isInMapr,
                this.tocBocDetails
              );

              // If TOC and BOC are defined, check if the airplane's current altitude is above the BOC suppression threshold
              // and suppress the BOC as appropriate.
              if (
                tocBocDetails.tocLegIndex >= 0
                && tocBocDetails.bocLegIndex >= 0
                && currentAltitudeMetric > tocBocDetails.tocAltitude + GarminVNavManager2.BOC_SUPPRESS_ALTITUDE_THRESHOLD
              ) {
                tocBocDetails.bocLegIndex = -1;
                tocBocDetails.distanceFromBoc = 0;
              }

              // If TOC is defined, check if the airplane's current altitude is above the TOC suppression threshold and
              // suppress the TOC as appropriate.
              if (
                tocBocDetails.tocLegIndex >= 0
                && currentAltitudeMetric >= tocBocDetails.tocAltitude - GarminVNavManager2.TOC_SUPPRESS_ALTITUDE_THRESHOLD
              ) {
                tocBocDetails.tocLegIndex = -1;
                tocBocDetails.distanceFromToc = 0;
                tocBocDetails.tocLegDistance = 0;
                tocBocDetails.tocConstraintIndex = -1;
                tocBocDetails.tocAltitude = -1;
              }
            } else {
              GarminVNavUtils.getTocBocDetails(
                verticalPlan,
                -1,
                lateralLegIndex, alongLegDistance,
                this.currentGroundSpeed, currentAltitudeMetric, currentVSMetric,
                isInMapr,
                this.tocBocDetails
              );
            }

            // Publish TOD/BOD and TOC/BOC data.
            this.manageTodBodTocBocDetails(lateralLegIndex, todBodDetails, tocBocDetails);

            let activeConstraintIndex = -1;
            let activePathConstraintIndex = -1;
            let timeToTodSeconds: number | undefined;

            // If we are in a descent and have a valid TOD (i.e. there exists a valid descent path that is capturable by
            // V PATH), then we need to designate the active path constraint. If we are within 1 min of the TOD or past
            // the TOD, then the active path constraint is the constraint defining the descent path that the TOD lies on.
            // Otherwise, the active path constraint is the current constraint (the constraint containing the active
            // flight plan leg).
            if (!inClimb && todBodDetails.todConstraintIndex >= 0) {
              timeToTodSeconds = UnitType.METER.convertTo(todBodDetails.distanceFromTod, UnitType.NMILE) / this.currentGroundSpeed * 3600;

              if (currentConstraintIndex <= todBodDetails.todConstraintIndex) {
                activePathConstraintIndex = currentConstraintIndex;
              } else {
                const activePathTodTimeThreshold = GarminVNavManager2.ACTIVE_PATH_TOD_TIME_THRESHOLD
                  + (this.activePathConstraintIndex === todBodDetails.todConstraintIndex ? GarminVNavManager2.ACTIVE_PATH_TOD_TIME_HYSTERESIS : 0);

                if (timeToTodSeconds <= activePathTodTimeThreshold) {
                  activePathConstraintIndex = todBodDetails.todConstraintIndex;
                }
              }
            }

            this.activePathConstraintIndex = activePathConstraintIndex;

            // If we are tracking a climb or there is no active path constraint, the current phase constraint is the active
            // constraint; otherwise the active path constraint is the active constraint.
            if (inClimb || activePathConstraintIndex < 0) {
              if (currentPhaseConstraint) {
                activeConstraintIndex = currentPhaseConstraintIndex;
                this.vnavActiveConstraintLegIndex.set(currentPhaseConstraint.index);
              } else {
                activeConstraintIndex = -1;
                this.vnavActiveConstraintLegIndex.set(-1);
              }
            } else {
              activeConstraintIndex = activePathConstraintIndex;
              this.vnavActiveConstraintLegIndex.set(verticalPlan.constraints[activePathConstraintIndex].index);
            }

            if (activePathConstraintIndex >= 0) {
              this.disarmClimb();
            }

            this._isActive = this.state === VNavState.Enabled_Active;

            if (!inClimb && !this.isClimbArmed) {
              const activeConstraint = verticalPlan.constraints[activeConstraintIndex];
              this.fpa.set(activeConstraint === undefined ? null : activeConstraint.fpa);
              this.setCurrentConstraintDetails(verticalPlan, activeConstraintIndex, lateralLegIndex);
              this.pathAvailable.set(true);
              this.trackDescent(verticalPlan, lateralPlan, todBodDetails, activeConstraintIndex, activePathConstraintIndex);
            } else if (this.options.enableAdvancedVNav && (inClimb || this.isClimbArmed)) {
              if (this._isActive) {
                this.disarmPath();
              }

              this.fpa.set(null);
              this.setCurrentConstraintDetails(verticalPlan, activeConstraintIndex, lateralLegIndex);
              this.pathAvailable.set(false);
              this.trackClimb(verticalPlan, lateralPlan, tocBocDetails, activeConstraintIndex);
            } else {
              if (this._isActive) {
                this.disarmPath();
              }

              this.fpa.set(null);
              this.resetVNavTrackingVars();
            }
          }
        }

        this.apValues.approachHasGP.set(this.manageGP(lateralPlan, alongLegDistance));
      } else {
        // Ground speed is less than 30 knots. In this case we will fail VNAV, but still publish phase data and
        // current/active constraint data.

        this.failed();

        const isPastTod = this.firstDescentConstraintLegIndex >= 0 && firstDescentConstraintIndex >= 0 // There is at least one descent constraint and...
          && (
            // ... we are past the first descent constraint...
            lateralLegIndex > this.firstDescentConstraintLegIndex
            // ... or we are within threshold distance of the first descent constraint
            || (
              GarminVNavUtils.getDistanceToConstraint(
                verticalPlan,
                firstDescentConstraintIndex,
                lateralLegIndex,
                alongLegDistance
              ) <= GarminVNavManager2.DESCENT_PHASE_TOD_DISTANCE
            )
          );

        const isCurrentConstraintClimb = currentConstraint && (currentConstraint.type === 'climb' || currentConstraint.type === 'missed');

        // VNAV flight phase:
        // Climb: in departure segment or the current constraint is a climb constraint.
        // Cruise: airplane is not in the departure segment and the current constraint is not a climb constraint.
        // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan or is in the
        //          missed approach.

        if (isInDeparture) {
          this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
        } else if (isPastTod || isInMapr) {
          this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
        } else if (isCurrentConstraintClimb) {
          this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
        } else {
          this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
        }

        // VNAV tracking phase:

        if (this.options.enableAdvancedVNav) {
          // Climb: airplane is not past 10 NM to go to the first descent constraint and the current constraint
          //        constraint is a climb constraint.
          // Cruise: airplane is not past 10 NM to go to the first descent constraint and the current constraint is a
          //         climb constraint.
          // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan and is not
          //          in the missed approach.
          // Missed approach: airplane is in the missed approach.

          if (isInMapr) {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.MissedApproach);
          } else if (isPastTod) {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
          } else if (isCurrentConstraintClimb) {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Climb);
          } else {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
          }
        } else {
          // Cruise: default phase.
          // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan.

          if (isPastTod) {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
          } else {
            this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
          }
        }

        if (currentConstraint) {
          this.currentConstraintLegIndex.set(currentConstraint.index);
          // The active constraint is the current constraint unless we are not in the missed approach and the current
          // constraint is a missed approach constraint.
          this.vnavActiveConstraintLegIndex.set((!isInMapr && currentConstraint.type === 'missed') ? -1 : currentConstraint.index);
          this.fpa.set(isCurrentConstraintClimb ? null : currentConstraint.fpa);
        } else {
          this.resetVNavConstraintVars();
        }
      }
    } else {
      this.failed();
      this.resetVNavPhase();
      this.resetVNavConstraintVars();
    }

    if (this.apValues.approachHasGP.get() === false) {
      this.resetGpVars();
    }

    // evaluate tod time remaining for annunciation
    const todDistanceNM = UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE);
    const timeRemainingSecs = UnitType.HOUR.convertTo(todDistanceNM / this.currentGroundSpeed, UnitType.SECOND);
    this.withinOneMinuteTod.set(this.todBodDetails.distanceFromTod > 100 && timeRemainingSecs <= 60
      && this.state === VNavState.Enabled_Active && this.pathMode.get() !== VNavPathMode.PathActive);
    this.withinFiveSecondsTod.set(this.withinOneMinuteTod.get() && timeRemainingSecs <= 10);
  }

  /**
   * Updates vertical tracking for climb.
   * @param verticalPlan The vertical flight plan.
   * @param lateralPlan The lateral flight plan.
   * @param tocBocDetails The computed TOC/BOC details.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg, or `-1` if
   * there is no such constraint.
   */
  private trackClimb(
    verticalPlan: VerticalFlightPlan,
    lateralPlan: FlightPlan,
    tocBocDetails: TocBocDetails,
    activeConstraintIndex: number
  ): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    this.requiredVS.set(activeConstraintIndex < 0
      ? null
      : this.getClimbRequiredVs(verticalPlan, activeConstraintIndex, lateralLegIndex, currentAlongLegDistance)
    );

    const isMapr = BitFlags.isAll(lateralPlan.getLeg(lateralLegIndex).flags, LegDefinitionFlags.MissedApproach);

    const currentClimbConstraint = isMapr
      ? VNavUtils.getNextMaprTargetConstraint(verticalPlan, lateralLegIndex)
      : VNavUtils.getNextClimbTargetConstraint(verticalPlan, lateralLegIndex);
    const selectedAltitude = this.apValues.selectedAltitude.get();
    const constraintAltitudeFeet = currentClimbConstraint !== undefined ? UnitType.METER.convertTo(currentClimbConstraint.maxAltitude, UnitType.FOOT)
      : Number.POSITIVE_INFINITY;

    this.targetAltitude.set(currentClimbConstraint !== undefined ? constraintAltitudeFeet : null);

    this.checkAltSel.set(
      this._isActive
      && currentClimbConstraint !== undefined
      && this.isClimbArmed
      && lateralLegIndex === currentClimbConstraint.index
      && UnitType.METER.convertTo(tocBocDetails.distanceFromBoc, UnitType.NMILE) / (this.currentGroundSpeed / 60) < 0.75
      && selectedAltitude <= this.capturedAltitude
    );

    // If VNAV is not active, we are done here since the rest of this method deals exclusively with AP mode change and
    // altitude capture logic.
    if (!this._isActive) {
      this.captureType.set(VNavAltCaptureType.None);
      return;
    }

    if (
      this.isClimbArmed
      && (currentClimbConstraint === undefined || Math.round(constraintAltitudeFeet) > this.capturedAltitude)
      && selectedAltitude > this.capturedAltitude
    ) {
      this.capturedAltitude = Number.POSITIVE_INFINITY;
      this.isAltCaptured = false;
      this.isClimbArmed = false;
      this.activateMode && this.activateMode(APVerticalModes.FLC);
      return;
    }

    if (currentClimbConstraint === undefined || this.isAltCaptured) {
      this.captureType.set(VNavAltCaptureType.None);
      return;
    }

    let canArmAltV: boolean;

    const constraintAltitudeDelta = constraintAltitudeFeet - this.currentAltitude;
    const constraintAltitudeDeltaSign = Math.sign(constraintAltitudeDelta);
    const verticalActiveMode = this.apValues.verticalActive.get();
    switch (verticalActiveMode) {
      case APVerticalModes.PITCH:
      case APVerticalModes.TO:
      case APVerticalModes.GA:
        // ALTV can arm if current vertical speed is toward the constraint altitude.
        canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.currentVS) >= 0;
        break;
      case APVerticalModes.VS:
        // ALTV can arm if selected vertical speed is toward the constraint altitude.
        canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.apValues.selectedVerticalSpeed.get()) >= 0;
        break;
      case APVerticalModes.FLC:
        // ALTV can arm if preselected altitude is toward the constraint altitude.
        canArmAltV = constraintAltitudeDeltaSign * Math.sign(selectedAltitude - this.currentAltitude) >= 0;
        break;
      default:
        canArmAltV = false;
    }

    if (canArmAltV) {
      // If ALTV can be armed, we need to make sure that we will not capture the preselected altitude first (if the
      // constraint and preselected altitudes are the same, preselected altitude takes precedence).

      const selectedAltitudeDelta = selectedAltitude - this.currentAltitude;
      if (constraintAltitudeDeltaSign < 0) {
        canArmAltV = selectedAltitudeDelta > 0 || selectedAltitudeDelta < constraintAltitudeDelta;
      } else if (constraintAltitudeDeltaSign > 0) {
        canArmAltV = selectedAltitudeDelta < 0 || selectedAltitudeDelta > constraintAltitudeDelta;
      }
    }

    if (canArmAltV) {
      this.captureType.set(VNavAltCaptureType.VNAV);

      const captureRange = Math.abs(this.currentVS / 6);

      if (Math.abs(constraintAltitudeDelta) <= captureRange) {
        this.delegateAltCap(constraintAltitudeFeet, VerticalFlightPhase.Climb);
      }
    } else {
      this.captureType.set(VNavAltCaptureType.None);
    }
  }

  /**
   * Gets the next altitude constraint to be sequenced that defines an altitude to be met for required vertical speed
   * calculations.
   * @param verticalPlan The vertical flight plan.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg.
   * @param globalLegIndex The index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the the
   * airplane's position, in meters.
   * @returns The next altitude constraint to be sequenced that defines an altitude to be met for required vertical
   * speed calculations, or `undefined` if there is no such constraint.
   */
  private getClimbRequiredVs(verticalPlan: VerticalFlightPlan, activeConstraintIndex: number, globalLegIndex: number, distanceAlongLeg: number): number | null {
    let constraintIndex = -1;

    // In climb phase, VSR is defined by the next climb constraint with a minimum altitude.
    for (let i = activeConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];
      if (constraint.type === 'climb' || constraint.type === 'missed') {
        if (constraint.minAltitude > Number.NEGATIVE_INFINITY) {
          constraintIndex = i;
          break;
        }
      } else {
        return null;
      }
    }

    if (constraintIndex < 0) {
      return null;
    }

    const constraint = verticalPlan.constraints[constraintIndex];
    const altitude = constraint.minAltitude;
    const distance = GarminVNavUtils.getDistanceToConstraint(verticalPlan, constraintIndex, globalLegIndex, distanceAlongLeg);

    const requiredVs = this.getRequiredVs(UnitType.METER.convertTo(distance, UnitType.NMILE), UnitType.METER.convertTo(altitude, UnitType.FOOT));
    if (requiredVs >= 100) {
      return requiredVs;
    } else {
      return null;
    }
  }

  /**
   * Updates vertical tracking for descent.
   * @param verticalPlan The vertical flight Plan.
   * @param lateralPlan The lateral flight Plan.
   * @param todBodDetails The computed TOD/BOD details.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg, or `-1` if
   * there is no such constraint.
   * @param activePathConstraintIndex The index of the constraint defining the active descent path, or `-1` if there is
   * no active descent path.
   */
  private trackDescent(
    verticalPlan: VerticalFlightPlan,
    lateralPlan: FlightPlan,
    todBodDetails: GarminTodBodDetails,
    activeConstraintIndex: number,
    activePathConstraintIndex: number
  ): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const selectedAltitude = this.apValues.selectedAltitude.get();
    const currentConstraint = verticalPlan.constraints[activeConstraintIndex];
    const currentVerticalLeg = currentConstraint?.legs[currentConstraint.index - lateralLegIndex] as VNavLeg | undefined;
    const isPastDest = verticalPlan.destLegIndex !== undefined && lateralLegIndex > verticalPlan.destLegIndex;

    let altitudeToCaptureInPath: number | null = null;
    let activePathConstraint: VNavConstraint | undefined;
    let verticalDeviation: number | null = null;
    let deviationFromAltitudeToCaptureInPath = Infinity;
    let distanceToActivePathConstraint = 0;

    if (activePathConstraintIndex < 0 || isPastDest) {
      this.targetAltitude.set(null);
      this.requiredVS.set(null);
      this.verticalDeviation.set(null);

      if (this._isActive) {
        if (this.pathMode.get() == VNavPathMode.PathActive) {
          this.disarmPath();
        }

        if (!isPastDest) {
          this.updatePathArmState();
        }
      }

      if (isPastDest || currentConstraint === undefined) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }
    } else {
      activePathConstraint = verticalPlan.constraints[activePathConstraintIndex];
      distanceToActivePathConstraint = GarminVNavUtils.getDistanceToConstraint(
        verticalPlan,
        activePathConstraintIndex,
        lateralLegIndex,
        currentAlongLegDistance
      );

      const vnavTargetAltitude = verticalPlan.constraints[todBodDetails.bodConstraintIndex].targetAltitude;

      const vnavTargetAltitudeFeet = Math.round(UnitType.METER.convertTo(vnavTargetAltitude, UnitType.FOOT));

      this.requiredVS.set(this.getDescentRequiredVs(verticalPlan, activePathConstraintIndex, lateralLegIndex, currentAlongLegDistance));

      const pathFpa = activePathConstraint.fpa;

      const desiredAltitude = GarminVNavUtils.getPathDesiredAltitude(verticalPlan, activePathConstraintIndex, distanceToActivePathConstraint);

      verticalDeviation = UnitType.METER.convertTo(desiredAltitude, UnitType.FOOT) - this.currentAltitude;

      if (this._isActive) {
        this.updatePathArmState();
      }

      if (!this.checkPathValidity(lateralPlan, activePathConstraint, verticalDeviation) && this.pathMode.get() === VNavPathMode.PathActive) {
        this.verticalDeviation.set(verticalDeviation);
        this._isActive && this.disarmPath();
        return;
      }

      altitudeToCaptureInPath = selectedAltitude > this.currentAltitude
        ? vnavTargetAltitudeFeet
        : Math.max(vnavTargetAltitudeFeet, selectedAltitude);
      deviationFromAltitudeToCaptureInPath = this.currentAltitude - altitudeToCaptureInPath;

      this._isActive && this.canPathActivate(pathFpa, verticalDeviation, deviationFromAltitudeToCaptureInPath) && this.activatePath();
    }

    this.verticalDeviation.set(verticalDeviation);

    const pathActive = this.pathMode.get() == VNavPathMode.PathActive;

    const captureRange = Math.abs(this.currentVS / 6);

    const verticalActiveMode = this.apValues.verticalActive.get();

    if (pathActive) {
      // If PATH is active, then it is our responsibility to capture the next altitude, whether it is a VNAV constraint
      // altitude or a preselected altitude.

      // This should technically never happen since we disarm path above if there is no active path constraint.
      if (activePathConstraint === undefined || altitudeToCaptureInPath === null) {
        this.targetAltitude.set(null);
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      this.targetAltitude.set(altitudeToCaptureInPath);

      // VNAV should always be active if PATH is active, but just in case...
      if (!this._isActive) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      const altitudeToCaptureIsSelectedAltitude = selectedAltitude === altitudeToCaptureInPath;

      this.captureType.set(altitudeToCaptureIsSelectedAltitude ? VNavAltCaptureType.Selected : VNavAltCaptureType.VNAV);

      // If we are not yet within capture range of the target altitude, we are done and do not need to perform any
      // altitude capture operations.
      if (Math.abs(deviationFromAltitudeToCaptureInPath) > captureRange) {
        return;
      }

      const isPathEnd = activePathConstraint.isPathEnd;
      const nextLeg = !isPathEnd ? VNavUtils.getVerticalLegFromPlan(verticalPlan, activePathConstraint.index + 1) : undefined;

      if (altitudeToCaptureIsSelectedAltitude || nextLeg === undefined || nextLeg.fpa === 0) {
        this.delegateAltCap(
          altitudeToCaptureInPath,
          !isPathEnd ? VerticalFlightPhase.Descent : undefined,
          !altitudeToCaptureIsSelectedAltitude && currentVerticalLeg?.isBod ? lateralLegIndex + 1 : lateralLegIndex
        );

        isPathEnd && this.tryDeactivate(APVerticalModes.NONE);
        return;
      }

      // Now we know path is active, we are approaching a BOD and the next leg is valid and has a non-zero FPA.
      // If the TOD for the next leg is close to the BOD, we will skip altitude capture because we might fly past the
      // TOD by the time PATH rearms. If we skip capture, then PATH will stay active and pick up the deviation from
      // the next leg once the current leg is sequenced. The new deviation should be small and is guaranteed to be such
      // that the airplane is under the path, so the PATH director should have no problem re-establishing.

      const nextLegTodDistance = VNavUtils.distanceForAltitude(nextLeg.fpa, UnitType.FOOT.convertTo(altitudeToCaptureInPath, UnitType.METER) - nextLeg.altitude);
      const distanceToNextTod = distanceToActivePathConstraint + nextLeg.distance - nextLegTodDistance;

      if (distanceToNextTod > 1900) {
        this.delegateAltCap(altitudeToCaptureInPath, VerticalFlightPhase.Descent);
      }
    } else {
      // If we are in a non-PATH vertical mode, ALTV should capture the minimum altitude of the current constraint
      // (VNAV ineligible legs and discontinuities don't matter here since we aren't tracking a path).

      let canArmAltV: boolean;

      const constraintAltitudeFeet = Math.round(UnitType.METER.convertTo(currentConstraint.minAltitude, UnitType.FOOT));
      const constraintAltitudeDelta = constraintAltitudeFeet - this.currentAltitude;
      const constraintAltitudeDeltaSign = Math.sign(constraintAltitudeDelta);

      switch (verticalActiveMode) {
        case APVerticalModes.PITCH:
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          // ALTV can arm if current vertical speed is toward the constraint altitude.
          canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.currentVS) >= 0;
          break;
        case APVerticalModes.VS:
          // ALTV can arm if selected vertical speed is toward the constraint altitude.
          canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.apValues.selectedVerticalSpeed.get()) >= 0;
          break;
        case APVerticalModes.FLC:
          // ALTV can arm if preselected altitude is toward the constraint altitude.
          canArmAltV = constraintAltitudeDeltaSign * Math.sign(selectedAltitude - this.currentAltitude) >= 0;
          break;
        default:
          canArmAltV = false;
      }

      if (canArmAltV) {
        // If ALTV can be armed, we need to make sure that we will not capture the preselected altitude first (if the
        // constraint and preselected altitudes are the same, preselected altitude takes precedence).

        const selectedAltitudeDelta = selectedAltitude - this.currentAltitude;
        if (constraintAltitudeDeltaSign < 0) {
          canArmAltV = selectedAltitudeDelta > 0 || selectedAltitudeDelta < constraintAltitudeDelta;
        } else if (constraintAltitudeDeltaSign > 0) {
          canArmAltV = selectedAltitudeDelta < 0 || selectedAltitudeDelta > constraintAltitudeDelta;
        }
      }

      this.targetAltitude.set(canArmAltV ? constraintAltitudeFeet : null);

      // If VNAV is not active, we are done here since everything that comes after deals exclusively with altitude capture.
      if (!this._isActive) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      if (canArmAltV) {
        this.captureType.set(VNavAltCaptureType.VNAV);

        if (Math.abs(constraintAltitudeDelta) <= captureRange) {
          this.delegateAltCap(
            constraintAltitudeFeet,
            activePathConstraint?.isPathEnd ? VerticalFlightPhase.Descent : undefined,
            currentVerticalLeg?.isBod ? lateralLegIndex + 1 : lateralLegIndex
          );
        }
      } else {
        this.captureType.set(VNavAltCaptureType.None);
      }
    }
  }

  /**
   * Gets the next altitude constraint to be sequenced that defines an altitude to be met for required vertical speed
   * calculations.
   * @param verticalPlan The vertical flight plan.
   * @param pathConstraintIndex The current vertical flight phase.
   * @param globalLegIndex The index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the the
   * airplane's position, in meters.
   * @returns The next altitude constraint to be sequenced that defines an altitude to be met for required vertical
   * speed calculations, or `undefined` if there is no such constraint.
   */
  private getDescentRequiredVs(verticalPlan: VerticalFlightPlan, pathConstraintIndex: number, globalLegIndex: number, distanceAlongLeg: number): number | null {
    let constraintIndex = -1;

    // In descent phase, VSR is defined by the next descent constraint that has a maximum altitude or that ends in a
    // level-off or FPA change (or the last descent constraint, which is treated as a level-off).
    for (let i = pathConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];
      const nextConstraint = verticalPlan.constraints[i - 1];
      if ((constraint.type === 'descent' || constraint.type === 'direct' || constraint.type === 'manual')) {
        if (
          constraint.maxAltitude < Number.POSITIVE_INFINITY
          || (constraint.targetAltitude > 0 && (
            constraint.isTarget
            || (nextConstraint === undefined || (nextConstraint.type !== 'descent' && nextConstraint.type !== 'manual'))
            || nextConstraint.fpa !== constraint.fpa
          ))
        ) {
          constraintIndex = i;
          break;
        }
      } else {
        return null;
      }
    }

    if (constraintIndex < 0) {
      return null;
    }

    const constraint = verticalPlan.constraints[constraintIndex];
    const altitude = constraint.maxAltitude < Number.POSITIVE_INFINITY ? constraint.maxAltitude : constraint.targetAltitude;
    const distance = GarminVNavUtils.getDistanceToConstraint(verticalPlan, constraintIndex, globalLegIndex, distanceAlongLeg);

    const requiredVs = this.getRequiredVs(UnitType.METER.convertTo(distance, UnitType.NMILE), UnitType.METER.convertTo(altitude, UnitType.FOOT));
    if (requiredVs <= -100) {
      return requiredVs;
    } else {
      return null;
    }
  }

  /**
   * Checks whether the VNav Path can arm.
   * @returns Whether Path can arm.
   */
  private canPathArm(): boolean {
    return this.apValues.verticalActive.get() !== APVerticalModes.CAP
      && !this.awaitingPathRearm
      && this.preselectedAltitude + 75 < this.currentAltitude;
  }

  /**
   * Checks whether V PATH can be activated from an armed state.
   * @param pathFpa The flight path angle of the active descent path, in degrees.
   * @param verticalDeviation The vertical deviation from the active descent path, in feet.
   * @param deviationFromTarget The deviation from the target altitude of the descent path, in feet.
   * @returns Whether V PATH can be activated from an armed state.
   */
  private canPathActivate(pathFpa: number, verticalDeviation: number, deviationFromTarget: number): boolean {
    if (this.pathMode.get() === VNavPathMode.PathArmed && pathFpa !== 0 && !this.pathArmedError.get()) {
      if (verticalDeviation <= VNavUtils.getPathErrorDistance(this.currentGroundSpeed) && verticalDeviation >= -15) {
        if (deviationFromTarget > 75 && (!this.isAltCaptured && pathFpa !== 0)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Arms PATH if it is not already armed and can be armed, and disarms PATH if it is already armed and current
   * conditions do not allow it to be armed.
   */
  private updatePathArmState(): void {
    const currentPathMode = this.pathMode.get();

    // Checks if PATH is waiting to be re-armed and the conditions for re-arm have been met, and if so clears the
    // awaiting re-arm state so that PATH can be armed again.
    if (this.awaitingPathRearm && this.lnavLegIndex.get() >= this.pathRearmIndex && this.apValues.verticalArmed.get() !== APVerticalModes.ALT) {
      this.awaitingPathRearm = false;
      this.pathRearmIndex = -1;
    }

    const canPathArm = this.canPathArm();
    if (currentPathMode === VNavPathMode.None) {
      if (canPathArm) {
        this.armPath();
      } else {
        // TODO: Check if Garmin even has a check alt sel message.
        // Enable check alt sel message if preselector is not at least 75 feet below current altitude, we have not
        // yet reached TOD, and we are within 45 seconds of TOD.
        this.checkAltSel.set(
          this.preselectedAltitude + 75 >= this.currentAltitude
          && this.todBodDetails.distanceFromTod > 0
          && UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE) / (this.currentGroundSpeed / 60) < 0.75
        );
      }
    } else if (currentPathMode === VNavPathMode.PathArmed && !canPathArm) {
      this.disarmPath();
    }
  }

  /**
   * Updates this manager's track error states - whether LNAV track angle error or cross-track error have exceeded
   * the allowed limits for VNAV to provide vertical tracking.
   */
  private updateTrackErrorState(): void {
    // NO_VNAV_TAE: Track angle error exceeds an acceptable threshold

    this.noVNavTae.set(this.isTaeOutsideLimits());

    // NO_VNAV_XTK: Cross track deviation exceeds an acceptable threshold

    this.noVNavXtk.set(this.isXtkOutsideLimits());
  }

  /**
   * Method to check the validity of the path.
   * @param lateralPlan The Lateral Flight Plan.
   * @param constraint The current vnav constraint.
   * @param verticalDeviation The current vertical deviation value.
   * @returns Whether the path is currently valid.
   */
  private checkPathValidity(lateralPlan: FlightPlan, constraint: VNavConstraint, verticalDeviation: number): boolean {

    // TODO: Clean up most of this method to use Garmin and not WT21 logic.

    this.noPathPilotCmd.set(this.checkPathPilotCmd(verticalDeviation));

    // const pathArmed = this.pathMode.get() === VNavPathMode.PathArmed;
    const pathActive = this.pathMode.get() === VNavPathMode.PathActive;
    // const pathArmedOrActive = pathArmed || pathActive;

    // Deal with Path Below Aircraft Message

    // if (this.pathBelowAircraft.get() === true && (!pathArmed || verticalDeviation > -10)) {
    //   this.pathBelowAircraft.set(false);
    // }
    // if (pathArmed && this.checkPathBelowAircraft(verticalDeviation)) {
    //   this.pathBelowAircraft.set(true);
    // }

    // const lateralLegIndex = this.lnavLegIndex.get();
    // const ineligibleLeg = this.getIneligibleLeg(lateralPlan, constraint, lateralLegIndex);

    // // NO_VPATH_CONDITION: manually terminated leg between the TOD and the
    // // altitude constraint waypoint or other FPL edit moved the vertical path.

    if (pathActive && this.lateralPlanChanged) {
      if (Math.abs(verticalDeviation) > 100) {
        this.noPathConditionPlanChanged.set(true);
      }
    }

    // this.noPathConditionDisco.set(pathArmedOrActive && ineligibleLeg !== undefined && this.isLegDiscontinuity(ineligibleLeg));

    // // NO_VPATH_VECTORS: Shows when VPATH mode has automatically reverted to VPITCH mode because there is a heading leg in the
    // // FMS flight plan. Message also clears after the aircraft passes the heading leg

    // this.noPathVectors.set(pathArmedOrActive && ineligibleLeg !== undefined && this.isLegVectors(ineligibleLeg));

    // // NO_VPATH_THIS_LEG: Active leg is hold or procedure turn
    // const activeLeg = lateralPlan.tryGetLeg(lateralLegIndex);

    // if (activeLeg !== null) {
    //   this.noPathThisLeg.set(VNavUtils.isLegTypeHoldOrProcedureTurn(activeLeg));
    // } else {
    //   this.noPathThisLeg.set(false);
    // }

    this.pathArmedError.set(
      this.noVNavTae.get()
      || this.noVNavXtk.get()
      // || this.pathBelowAircraft.get()
      // || this.noPathThisLeg.get()
      // || this.noPathConditionDisco.get()
      || this.noPathConditionPlanChanged.get()
      // || this.noPathVectors.get()
      || this.pilotPathIntervention
    );


    return !this.pathArmedError.get();
  }

  /**
   * Checks if the path is below the aircraft;
   * @param verticalDeviation The current deviation.
   * @returns True if the path is below the aircraft.
   */
  private checkPathBelowAircraft(verticalDeviation: number): boolean {
    // PATH_BELOW_AC: Path is below the aircraft
    return verticalDeviation < -50;
  }

  /**
   * Checks the pilot path command state.
   * @param verticalDeviation The current vertical deviation.
   * @returns whether the pilot has intervened in the path.
   */
  private checkPathPilotCmd(verticalDeviation: number): boolean {
    // NO_VPATH_PILOT_CMD: Pilot selected another mode while path is active
    // and vnav remains on (track deviation > one dot / vnav recycled)

    const oneDotDeviation = 100;

    if (Math.abs(verticalDeviation) > oneDotDeviation && this.pilotPathIntervention) {
      this.pilotPathIntervention = false;
    }

    return this.pilotPathIntervention;
  }

  /**
   * Checks whether the XTK is out of limits for vnav.
   * @returns if the XTK is out of limits.
   */
  private isXtkOutsideLimits(): boolean {
    return Math.abs(this.lnavXtk.get()) > this.lnavDataCdiScale.get();
  }

  /**
   * Chekcs if the TAE is out of limits for vnav.
   * @returns if TAE is out of limits.
   */
  private isTaeOutsideLimits(): boolean {

    const tae = Math.abs(NavMath.diffAngle(this.lnavDtk.get(), this.trueTrack));
    const taeErrorLimit = 75;

    return tae > taeErrorLimit;
  }

  /**
   * Method to reset all error messages.
   */
  private clearAllMessages(): void {
    this.pathBelowAircraft.set(false);
    this.checkAltSel.set(false);

    this.noVNavTae.set(false);
    this.noVNavXtk.set(false);
    this.noPathThisLeg.set(false);
    this.noPathPilotCmd.set(false);
    this.noPathConditionPlanChanged.set(false);
    this.noPathConditionDisco.set(false);
    this.noPathVectors.set(false);
    this.checkFplnAlt.set(false);
  }

  /**
   * Method to monitor message state.
   */
  private monitorMessages(): void {
    // init messages
    this.clearAllMessages();

    // monitor messages
    // this.withinOneMinuteTod.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.TOD, undefined, () => this.withinFiveSecondsTod.get());
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.TOD);
    //   }
    // });

    // this.pathBelowAircraft.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.PATH_BELOW_AC);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.PATH_BELOW_AC);
    //   }
    // });

    // this.noPathTae.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_TAE);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_TAE);
    //   }
    // });

    // this.noPathXtk.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_XTK);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_XTK);
    //   }
    // });

    // this.noPathThisLeg.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
    //   }
    // });

    // this.noPathPilotCmd.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
    //   }
    // });

    // this.noPathConditionDisco.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   } else if (!this.noPathConditionPlanChanged.get()) {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   }
    // });

    // this.noPathConditionPlanChanged.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   } else if (!this.noPathConditionDisco.get()) {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   }
    // });

    // this.noPathVectors.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
    //   }
    // });

    // this.checkAltSel.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.CHK_ALT_SEL);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.CHK_ALT_SEL);
    //   }
    // });

    // this.checkFplnAlt.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
    //   }
    // });

  }

  /**
   * Method to monitor VNavVars.
   */
  private monitorVars(): void {
    // init vnav vars
    this.initVars();

    this.pathMode.sub(mode => {
      SimVar.SetSimVarValue(VNavVars.PathMode, SimVarValueType.Number, mode);
      if (mode === VNavPathMode.PathArmed || mode === VNavPathMode.PathActive) {
        this.checkAltSel.set(false);
      }
    });
    this.vnavState.sub(state => SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, state));
    this.pathAvailable.sub(v => SimVar.SetSimVarValue(VNavVars.PathAvailable, SimVarValueType.Bool, v));
    this.currentConstraintLegIndex.sub(index => SimVar.SetSimVarValue(VNavVars.CurrentConstraintLegIndex, SimVarValueType.Number, index));
    this.targetAltitude.sub(alt => SimVar.SetSimVarValue(VNavVars.TargetAltitude, SimVarValueType.Feet, alt ?? -1));
    this.fpa.sub(fpa => SimVar.SetSimVarValue(VNavVars.FPA, SimVarValueType.Degree, fpa ?? 0));
    this.verticalDeviation.sub(dev => SimVar.SetSimVarValue(VNavVars.VerticalDeviation, SimVarValueType.Feet, dev ?? Number.MAX_SAFE_INTEGER));
    this.requiredVS.sub(vs => SimVar.SetSimVarValue(VNavVars.RequiredVS, SimVarValueType.FPM, vs ?? 0));
    this.captureType.sub(type => SimVar.SetSimVarValue(VNavVars.CaptureType, SimVarValueType.Number, type));
    this.gpVerticalDeviation.sub(dev => SimVar.SetSimVarValue(VNavVars.GPVerticalDeviation, SimVarValueType.Feet, dev ?? -1001));
    this.gpDistance.sub(dis => SimVar.SetSimVarValue(VNavVars.GPDistance, SimVarValueType.Meters, dis ?? -1));
    this.gpFpa.sub(fpa => SimVar.SetSimVarValue(VNavVars.GPFpa, SimVarValueType.Degree, fpa ?? 0));
    this.gpServiceLevel.sub(gpServiceLevel => SimVar.SetSimVarValue(VNavVars.GPServiceLevel, SimVarValueType.Number, gpServiceLevel));
    this.currentAltitudeConstraintDetails.sub(v => {
      this.publisher.pub('vnav_altitude_constraint_details', v, true, true);
    }, true);
    this.cruiseAltitude.sub(v => {
      this.publisher.pub('vnav_cruise_altitude', v, true, true);
    }, true);
    this.vnavFlightPhase.sub(v => {
      this.publisher.pub('vnav_flight_phase', v, true, true);
    }, true);
    this.vnavTrackingPhase.sub(v => {
      this.publisher.pub('vnav_tracking_phase', v, true, true);
    }, true);
    this.vnavActiveConstraintLegIndex.sub(v => {
      this.publisher.pub('vnav_active_constraint_global_leg_index', v, true, true);
    }, true);
  }

  /**
   * Method to reset VNAV Vars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, VNavState.Enabled_Inactive);
    SimVar.SetSimVarValue(VNavVars.PathMode, SimVarValueType.Number, VNavPathMode.None);
    SimVar.SetSimVarValue(VNavVars.PathAvailable, SimVarValueType.Bool, false);

    SimVar.SetSimVarValue(VNavVars.CurrentConstraintLegIndex, SimVarValueType.Number, -1);
    SimVar.SetSimVarValue(VNavVars.CurrentConstraintAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.NextConstraintAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.TargetAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.FPA, SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(VNavVars.VerticalDeviation, SimVarValueType.Feet, Number.MAX_SAFE_INTEGER);
    SimVar.SetSimVarValue(VNavVars.RequiredVS, SimVarValueType.FPM, 0);
    SimVar.SetSimVarValue(VNavVars.CaptureType, SimVarValueType.Number, VNavAltCaptureType.None);

    SimVar.SetSimVarValue(VNavVars.GPServiceLevel, SimVarValueType.Number, GlidepathServiceLevel.None);
    SimVar.SetSimVarValue(VNavVars.GPVerticalDeviation, SimVarValueType.Feet, -1001);
    SimVar.SetSimVarValue(VNavVars.GPDistance, SimVarValueType.Meters, -1);
    SimVar.SetSimVarValue(VNavVars.GPFpa, SimVarValueType.Degree, 0);
  }

  /**
   * Resets the VNAV constraint simvars.
   */
  private resetVNavConstraintVars(): void {
    this.currentConstraintLegIndex.set(-1);
    this.vnavActiveConstraintLegIndex.set(-1);
    this.fpa.set(null);
  }

  /**
   * Resets the VNAV flight and tracking phases.
   */
  private resetVNavPhase(): void {
    this.vnavFlightPhase.set(GarminVNavFlightPhase.None);
    this.vnavTrackingPhase.set(GarminVNavTrackingPhase.None);
  }

  /**
   * Resets the VNAV tracking simvars.
   */
  private resetVNavTrackingVars(): void {
    this.pathAvailable.set(false);
    this.currentAltitudeConstraintDetails.set({ type: AltitudeRestrictionType.Unused, altitude: 0 });
    this.targetAltitude.set(null);
    this.verticalDeviation.set(null);
    this.requiredVS.set(null);
    this.captureType.set(VNavAltCaptureType.None);
  }

  /**
   * Resets the glidepath-related simvars.
   */
  private resetGpVars(): void {
    this.gpServiceLevel.set(GlidepathServiceLevel.None);
    this.gpVerticalDeviation.set(null);
    this.gpDistance.set(null);
    this.gpFpa.set(null);
  }

  /**
   * Resets the TOD/BOD simvars.
   */
  private resetTodBodVars(): void {
    this.todBodDetailsSubject.set('bodLegIndex', -1);
    this.todBodDetailsSubject.set('todLegIndex', -1);
    this.todBodDetailsSubject.set('todLegDistance', 0);
    this.todBodDetailsSubject.set('distanceFromBod', 0);
    this.todBodDetailsSubject.set('distanceFromTod', 0);
  }

  /**
   * Resets the TOC/BOC simvars.
   */
  private resetTocBocVars(): void {
    this.tocBocDetailsSubject.set('bocLegIndex', -1);
    this.tocBocDetailsSubject.set('tocLegIndex', -1);
    this.tocBocDetailsSubject.set('tocLegDistance', 0);
    this.tocBocDetailsSubject.set('distanceFromBoc', 0);
    this.tocBocDetailsSubject.set('distanceFromToc', 0);
  }

  /**
   * Manages the TOD/BOD and BOC/TOC details simvars.
   * @param activeLateralLegIndex The index of the active lateral flight plan leg.
   * @param todBodDetails The computed TOD/BOD details.
   * @param bocTocDetails The computed BOC/TOC details.
   */
  private manageTodBodTocBocDetails(activeLateralLegIndex: number, todBodDetails: GarminTodBodDetails, bocTocDetails: TocBocDetails): void {
    // TODO: Support missed approach

    if (activeLateralLegIndex > this.lastClimbConstraintLegIndex) {
      this.todBodDetailsSubject.set('bodLegIndex', todBodDetails.bodLegIndex);
      this.todBodDetailsSubject.set('todLegIndex', todBodDetails.todLegIndex);
      this.todBodDetailsSubject.set('todLegDistance', todBodDetails.todLegDistance);
      this.todBodDetailsSubject.set('distanceFromBod', todBodDetails.distanceFromBod);
      this.todBodDetailsSubject.set('distanceFromTod', todBodDetails.distanceFromTod);

      this.resetTocBocVars();
    } else {
      this.resetTodBodVars();

      this.tocBocDetailsSubject.set('bocLegIndex', bocTocDetails.bocLegIndex);
      this.tocBocDetailsSubject.set('tocLegIndex', bocTocDetails.tocLegIndex);
      this.tocBocDetailsSubject.set('tocLegDistance', bocTocDetails.tocLegDistance);
      this.tocBocDetailsSubject.set('distanceFromBoc', bocTocDetails.distanceFromBoc);
      this.tocBocDetailsSubject.set('distanceFromToc', bocTocDetails.distanceFromToc);
    }
  }

  /**
   * Manages the GP State and sets required data for GP guidance, returns whether there is a GP.
   * @param lateralPlan The FlightPlan.
   * @param alongLegDistance The Along Leg Distance
   * @returns Whether there is a GP.
   */
  private manageGP(lateralPlan: FlightPlan | undefined, alongLegDistance: number): boolean {
    if (lateralPlan && this.gpSupported.get()) {
      const gpServiceLevel = this.glidepathServiceLevelCalculator.getServiceLevel();

      // Note: because the GP available flag is true, we don't have to check for circling approaches
      this.gpServiceLevel.set(gpServiceLevel);

      const gpDistance = this.glidepathCalculator.getGlidepathDistance(this.lnavLegIndex.get(), alongLegDistance);
      this.gpDistance.set(gpDistance);

      const currentAlt = this.glidepathServiceLevelCalculator.isBaroServiceLevel(gpServiceLevel) ? this.currentAltitude : this.currentGpsAltitude;
      const desiredGPAltitudeFeet = UnitType.METER.convertTo(this.glidepathCalculator.getDesiredGlidepathAltitude(gpDistance), UnitType.FOOT);

      this.gpVerticalDeviation.set(MathUtils.clamp(desiredGPAltitudeFeet - currentAlt, -1000, 1000));
      this.gpFpa.set(this.glidepathCalculator.glidepathFpa);

      return gpServiceLevel !== GlidepathServiceLevel.None;
    }

    this.resetGpVars();
    return false;
  }

  /**
   * Sets the current constraint details.
   * @param verticalPlan The vertical plan.
   * @param constraintIndex The index of the current constraint.
   * @param activeLegIndex The global index of the active flight plan leg.
   */
  private setCurrentConstraintDetails(verticalPlan: VerticalFlightPlan, constraintIndex: number, activeLegIndex: number): void {
    this.currentAltitudeConstraintDetailsWorking.type = AltitudeRestrictionType.Unused;
    this.currentAltitudeConstraintDetailsWorking.altitude = 0;

    const constraint = verticalPlan.constraints[constraintIndex];

    if (constraint !== undefined) {
      if (
        constraint.type !== 'climb' && constraint.type !== 'missed'
        && constraint.nextVnavEligibleLegIndex !== undefined
        && activeLegIndex < constraint.nextVnavEligibleLegIndex
      ) {
        const priorConstraint = verticalPlan.constraints[constraintIndex + 1];
        if (priorConstraint) {
          VNavUtils.getConstraintDetails(priorConstraint, this.currentAltitudeConstraintDetailsWorking);
        }
      } else {
        VNavUtils.getConstraintDetails(constraint, this.currentAltitudeConstraintDetailsWorking);
      }
    }

    if (!VNavUtils.altitudeConstraintDetailsEquals(this.currentAltitudeConstraintDetails.get(), this.currentAltitudeConstraintDetailsWorking)) {
      this.currentAltitudeConstraintDetails.set(Object.assign({}, this.currentAltitudeConstraintDetailsWorking));
    }
  }

  /**
   * Gets the required vertical speed to meet an altitude constraint.
   * @param distance The distance to the constraint, in nautical miles.
   * @param targetAltitude The target altitude for the constraint, in feet.
   * @param currentAltitude The current altitude, in feet. Defaults to the airplane's current indicated altitude.
   * @returns The required vertical speed, in feet per minute, to meet the altitude constraint.
   */
  private getRequiredVs(distance: number, targetAltitude: number, currentAltitude = this.currentAltitude): number {
    if (targetAltitude > 0) {
      return VNavUtils.getRequiredVs(distance, targetAltitude, currentAltitude, this.currentGroundSpeed);
    }
    return 0;
  }

  /**
   * Publishes TOD/BOD details to simvars.
   * @param details The TOD/BOD details object.
   * @param key The key to publish.
   * @param value The value to publish.
   */
  private publishTodBodDetails(details: GarminTodBodDetails, key: keyof GarminTodBodDetails, value: number): void {
    switch (key) {
      case 'bodLegIndex':
        SimVar.SetSimVarValue(VNavVars.BODLegIndex, SimVarValueType.Number, value);
        break;
      case 'todLegIndex':
        SimVar.SetSimVarValue(VNavVars.TODLegIndex, SimVarValueType.Number, value);
        break;
      case 'todLegDistance':
        SimVar.SetSimVarValue(VNavVars.TODDistanceInLeg, SimVarValueType.Meters, value);
        break;
      case 'distanceFromBod':
        SimVar.SetSimVarValue(VNavVars.BODDistance, SimVarValueType.Meters, value);
        break;
      case 'distanceFromTod':
        SimVar.SetSimVarValue(VNavVars.TODDistance, SimVarValueType.Meters, value);
        break;
    }
  }

  /**
   * Publishes BOC/TOC details to simvars.
   * @param details The BOC/TOC details object.
   * @param key The key to publish.
   * @param value The value to publish.
   */
  private publishBocTocDetails(details: TocBocDetails, key: keyof TocBocDetails, value: number): void {
    switch (key) {
      case 'bocLegIndex':
        SimVar.SetSimVarValue(VNavVars.BOCLegIndex, SimVarValueType.Number, value);
        break;
      case 'tocLegIndex':
        SimVar.SetSimVarValue(VNavVars.TOCLegIndex, SimVarValueType.Number, value);
        break;
      case 'tocLegDistance':
        SimVar.SetSimVarValue(VNavVars.TOCDistanceInLeg, SimVarValueType.Meters, value);
        break;
      case 'distanceFromBoc':
        SimVar.SetSimVarValue(VNavVars.BOCDistance, SimVarValueType.Meters, value);
        break;
      case 'distanceFromToc':
        SimVar.SetSimVarValue(VNavVars.TOCDistance, SimVarValueType.Meters, value);
        break;
    }
  }
}