import {
  AdcEvents, APEvents, APLateralModes, APValues, APVerticalModes, BitFlags, ClockEvents, ConsumerSubject, EventBus, FlightPlan, FlightPlanner,
  FlightPlannerEvents, GeoPoint, GlidePathCalculator, GNSSEvents, LegDefinition, LegDefinitionFlags, LegType, LNavEvents, MathUtils, NavMath, ObjectSubject,
  RnavTypeFlags, SimVarValueType, SmoothingPathCalculator, Subject, TodBodDetails, UnitType, VerticalFlightPhase, VerticalFlightPlan,
  VNavAltCaptureType, VNavAvailability, VNavConstraint, VNavControlEvents, VNavDataEvents, VNavEvents, VNavManager, VNavPathCalculator,
  VNavPathMode, VNavState, VNavUtils, VNavVars, Wait,
} from '@microsoft/msfs-sdk';

import { CDIScaleLabel, WT21LNavDataEvents } from '../../FMC/Autopilot/WT21LNavDataEvents';
import { FMS_MESSAGE_ID } from '../MessageSystem/MessageDefinitions';
import { MessageService } from '../MessageSystem/MessageService';
import { WT21ControlEvents } from '../WT21ControlEvents';
import { PerformancePlan } from '../Performance/PerformancePlan';
import { ApproachDetails } from '../FlightPlan/WT21Fms';

/**
 * A WT21 VNav Manager.
 */
export class WT21VNavManager implements VNavManager {

  private _realTime = 0;

  public state = VNavState.Disabled;

  private readonly pathMode = Subject.create<VNavPathMode>(VNavPathMode.None);

  private readonly planePos = new GeoPoint(0, 0);

  private currentAltitude = 0;
  private currentGpsAltitude = 0;
  private preselectedAltitude = 0;
  private currentGroundSpeed = 0;
  private currentVS = 0;
  private trueTrack = 0;

  private readonly approachDetails = ConsumerSubject.create<Readonly<ApproachDetails>>(this.bus.getSubscriber<WT21ControlEvents>().on('approach_details_set'), {
    approachLoaded: false,
    approachType: ApproachType.APPROACH_TYPE_UNKNOWN,
    approachRnavType: RnavTypeFlags.None,
    approachIsCircling: false,
    approachIsActive: false,
    referenceFacility: null,
  });

  private readonly isApproachLoc = this.approachDetails.map(details => {
    switch (details.approachType) {
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
  private blendingDeviationTargetLegIndex: number | null = null;
  private blendedDeviationTotalDistance: number | null = null;

  private awaitingClimbRearm = false;
  private awaitingPathRearm = false;
  private pathRearmIndex = -1;

  private pilotPathIntervention = false;
  private activeLegChangedWhilePathActive = false;


  private lateralPlanChangedTimer = 0;
  private lateralPlanChangedCheckDeviation = false;

  private cruiseAltitude = 0;
  private needCalculateTodDisplayDistance = false;

  // 96200 meters is 50nm.
  private todDisplayDistanceMeters = 96200;
  private todCalculatedTimer = 0;

  public readonly glidepathCalculator = new GlidePathCalculator(this.bus, this.flightPlanner, this.primaryPlanIndex);

  private readonly todBodDetails: TodBodDetails = {
    todLegIndex: -1,
    bodLegIndex: -1,
    todLegDistance: 0,
    distanceFromTod: 0,
    distanceFromBod: 0,
    currentConstraintLegIndex: -1
  };

  private readonly todBodDetailsSub = ObjectSubject.create<TodBodDetails>(Object.assign({}, this.todBodDetails));

  // Subjects for each vnav var to be set
  private readonly vnavState = Subject.create<VNavState>(VNavState.Enabled_Inactive);
  private readonly pathAvailable = Subject.create<boolean>(false);
  private readonly currentConstraintAltitude = Subject.create<number | null>(null);
  private readonly nextConstraintAltitude = Subject.create<number | null>(null);
  private readonly nextConstraintDetails = Subject.create<VNavConstraint | null>(null);
  private readonly targetAltitude = Subject.create<number | null>(null);
  private readonly fpa = Subject.create<number | null>(null);
  private readonly verticalDeviation = Subject.create<number | null>(null);
  private readonly requiredVS = Subject.create<number | null>(null);
  private readonly captureType = Subject.create<VNavAltCaptureType>(VNavAltCaptureType.None);
  private readonly gpVerticalDeviation = Subject.create<number | null>(null);
  private readonly gpDistance = Subject.create<number | null>(null);
  private readonly gpFpa = Subject.create<number | null>(null);
  private readonly vnavNextLegTargetAltitude = Subject.create<number | null>(null);

  // LNAV Consumer Subjects
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavLegDistanceAlong: ConsumerSubject<number>;
  private readonly lnavLegDistanceRemaining: ConsumerSubject<number>;
  private readonly lnavXtk: ConsumerSubject<number>;
  private readonly lnavDtk: ConsumerSubject<number>;
  private readonly lnavDataCdiScaleLabel: ConsumerSubject<number>;
  private readonly lnavDataDestinationDistanceDirect: ConsumerSubject<number>;
  private readonly lnavDataDistanceToFaf: ConsumerSubject<number>;

  private readonly gpSupported: ConsumerSubject<boolean>;

  // VNAV Error Subjects
  public readonly pathArmedError = Subject.create<boolean>(false);

  private readonly pathBelowAircraft = Subject.create<boolean>(false);
  private readonly noPathTae = Subject.create<boolean>(false);
  private readonly noPathXtk = Subject.create<boolean>(false);
  private readonly noPathThisLeg = Subject.create<boolean>(false);
  private readonly noPathPilotCmd = Subject.create<boolean>(false);
  private readonly noPathConditionPlanChanged = Subject.create<boolean>(false);
  private readonly noPathConditionDisco = Subject.create<boolean>(false);
  private readonly noPathVectors = Subject.create<boolean>(false);
  private readonly checkAltSel = Subject.create<boolean>(false);
  private readonly withinOneMinuteTod = Subject.create<boolean>(false);
  private readonly withinFiveSecondsTod = Subject.create<boolean>(false);
  private readonly checkFplnAlt = Subject.create<boolean>(false);
  private readonly unableNextAlt = Subject.create<boolean>(false);
  private readonly unableNextAltTimer = Subject.create<number>(-1);

  /**
   * Creates an instance of the VNAV director.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param calculator The VNAV path calculator to use with this instance.
   * @param performancePlan a performance plan
   * @param messageService The WT21 Message Service.
   * @param apValues are the autopilot ap values.
   * @param primaryPlanIndex The index of the flightplan to follow vertical guidance from.
   */
  constructor(private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    public readonly calculator: VNavPathCalculator,
    private readonly performancePlan: PerformancePlan,
    private readonly messageService: MessageService,
    private readonly apValues: APValues,
    private readonly primaryPlanIndex: number,
  ) {

    const lnav = this.bus.getSubscriber<LNavEvents>();
    this.lnavLegIndex = ConsumerSubject.create(lnav.on('lnav_tracked_leg_index'), 0);
    this.lnavLegDistanceAlong = ConsumerSubject.create(lnav.on('lnav_leg_distance_along'), 0);
    this.lnavLegDistanceRemaining = ConsumerSubject.create(lnav.on('lnav_leg_distance_remaining'), 0);
    this.lnavXtk = ConsumerSubject.create(lnav.on('lnav_xtk'), 0);
    this.lnavDtk = ConsumerSubject.create(lnav.on('lnav_dtk'), 0);

    const lnavData = this.bus.getSubscriber<WT21LNavDataEvents>();
    this.lnavDataCdiScaleLabel = ConsumerSubject.create(lnavData.on('lnavdata_cdi_scale_label'), 4);
    this.lnavDataDestinationDistanceDirect = ConsumerSubject.create(lnavData.on('lnavdata_destination_distance_direct'), Number.MAX_SAFE_INTEGER);
    this.lnavDataDistanceToFaf = ConsumerSubject.create(lnavData.on('lnavdata_distance_to_faf'), Number.MAX_SAFE_INTEGER);

    this.bus.getSubscriber<APEvents>().on('ap_altitude_selected').handle(selected => this.preselectedAltitude = selected);
    this.bus.getSubscriber<AdcEvents>().on('indicated_alt').handle(alt => this.currentAltitude = alt);
    this.bus.getSubscriber<AdcEvents>().on('vertical_speed').whenChangedBy(1).handle(vs => this.currentVS = vs);
    this.bus.getSubscriber<GNSSEvents>().on('track_deg_true').whenChangedBy(1).handle(trueTrack => this.trueTrack = trueTrack);
    this.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(100).handle(t => this._realTime = t);

    // Proxy for executing a plan change
    this.bus.getSubscriber<FlightPlannerEvents>().on('fplCopied').handle(e => {
      if (e.targetPlanIndex === this.primaryPlanIndex) {
        this.onLateralPlanChanged();
      }
    });

    const gnss = this.bus.getSubscriber<GNSSEvents>();
    gnss.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
      this.currentGpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    });
    gnss.on('ground_speed').handle(gs => this.currentGroundSpeed = gs);

    this.gpSupported = ConsumerSubject.create(this.bus.getSubscriber<VNavDataEvents>().on('approach_supports_gp'), false);

    this.apValues.approachHasGP.sub(v => {
      this.bus.getPublisher<VNavDataEvents>().pub('gp_available', v, true);
    });

    this.bus.getSubscriber<VNavControlEvents>().on('vnav_set_state').handle(d => {
      if (d) {
        this.setState(VNavState.Enabled_Inactive);
      } else {
        this.setState(VNavState.Disabled);
      }
    });

    this.apValues.verticalActive.sub(mode => {
      if (mode === APVerticalModes.ALT && this.awaitingClimbRearm) {
        this.armMode && this.armMode(APVerticalModes.FLC);
      }

      if (this.awaitingPathRearm && mode !== APVerticalModes.ALT && mode !== APVerticalModes.CAP) {
        this.awaitingPathRearm = false;
        this.pathRearmIndex = -1;
      }

      if (mode === APVerticalModes.FLC && this.awaitingClimbRearm) {
        this.awaitingClimbRearm = false;
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

    // Publish ToD/BoD details
    this.todBodDetailsSub.sub(this.publishTODBODDetails.bind(this), true);

    this.isVNavUnavailable.sub(v => {
      if (v) {
        this.bus.getPublisher<VNavEvents>().pub('vnav_availability', VNavAvailability.InvalidLegs, true, false);
      } else {
        this.bus.getPublisher<VNavEvents>().pub('vnav_availability', VNavAvailability.Available, true, false);
      }
    });

    this.performancePlan.cruiseAltitude.sub(v => this.cruiseAltitude = v ?? 0);

    this.lnavLegIndex.sub(() => {
      if (this.pathMode.get() === VNavPathMode.PathActive) {
        this.activeLegChangedWhilePathActive = true;
      }
    });

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
          this.pathMode.set(VNavPathMode.None);
          this.isAltCaptured = false;
          this.awaitingClimbRearm = false;
          this.awaitingPathRearm = false;
          this.pathRearmIndex = -1;
          this.pilotPathIntervention = false;
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
      this.state = VNavState.Enabled_Active;
      SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, this.state);
      this.pathMode.set(VNavPathMode.None);
    }
  }

  /** @inheritdoc */
  public tryDeactivate(newMode?: APVerticalModes): void {
    if (this.state !== VNavState.Disabled) {

      if (this.state !== VNavState.Enabled_Inactive) {
        this.state = VNavState.Enabled_Inactive;
        SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, this.state);
        if (this.pathMode.get() !== VNavPathMode.None) {
          this.disarmPath(newMode);
        }
        this.isAltCaptured = false;
        this.awaitingClimbRearm = false;
        this.awaitingPathRearm = false;
        this.pathRearmIndex = -1;
        this.pilotPathIntervention = false;
        this.lateralPlanChangedTimer = 0;
        this.activeLegChangedWhilePathActive = false;
        this.clearAllMessages();
        SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool', false);
      }
    }
  }

  /** @inheritdoc */
  public canVerticalModeActivate(mode: APVerticalModes): boolean {

    if (this.awaitingClimbRearm && (mode === APVerticalModes.FLC || mode === APVerticalModes.VS)) {
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
    if (this.pathMode.get() === VNavPathMode.PathActive && !this.isAltCaptured) {
      this.tryDeactivate(APVerticalModes.PITCH);
    }
    this.resetGpVars();
    this.resetVNavVars();
    this.resetTodBodVars();
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
          this.awaitingClimbRearm = true;
          break;
        case VerticalFlightPhase.Descent:
          this.awaitingPathRearm = true;
          this.pathRearmIndex = pathRearmIndex ?? this.lnavLegIndex.get() + 1;
          break;
      }
    }
    this.activateMode && this.activateMode(APVerticalModes.CAP);
  }

  /** Method called to arm Path Mode. */
  private armPath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathArmed) {
      this.pathMode.set(VNavPathMode.PathArmed);
    }
    this.isAltCaptured = false;
    this.awaitingPathRearm = false;
    this.pathRearmIndex = -1;
    this.armMode && this.armMode(APVerticalModes.PATH);
  }

  /** Method called to activate Path Mode. */
  private activatePath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathActive) {
      this.pathMode.set(VNavPathMode.PathActive);
    }
    this.awaitingPathRearm = false;
    this.pathRearmIndex = -1;
    this.activateMode && this.activateMode(APVerticalModes.PATH);
  }

  /**
   * Method to call when VNAV needs to disarm the path, without deactivating VNAV entirely.
   * @param newMode is the vertical mode to set the Autopilot to if Path is currently active.
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
   * Method called when the lateral plan changes via an EXEC press.
   */
  private onLateralPlanChanged(): void {
    this.lateralPlanChangedTimer = Date.now();

    if (this.pathMode.get() === VNavPathMode.PathActive) {
      this.lateralPlanChangedCheckDeviation = true;
    }

    Wait.awaitDelay(1000).then(() => {
      this.needCalculateTodDisplayDistance = true;
    });
  }

  /**
   * Method to check the class flags related to a lateral plan change.
   */
  private checkLateralPlanChangedFlags(): void {
    if (this.lateralPlanChangedTimer > 0 && this._realTime - this.lateralPlanChangedTimer > 1500) {
      this.lateralPlanChangedTimer = 0;
      if (this.lateralPlanChangedCheckDeviation) {
        this.lateralPlanChangedCheckDeviation = false;
      }
    }
  }

  /**
   * Updates the VNAV director.
   */
  public update(): void {
    let pathAvailable = false;

    this.checkLateralPlanChangedFlags();

    if (!this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      this.failed();
      return;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
    const verticalPlan = this.calculator.getVerticalFlightPlan(this.primaryPlanIndex);

    let requiredVs = 0;

    const alongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const flightPhase = this.calculator.getFlightPhase(this.primaryPlanIndex);

    const lateralLegIndex = this.lnavLegIndex.get();

    if (lateralPlan.length > 0 && lateralLegIndex < lateralPlan.length && VNavUtils.verticalPlanHasLeg(verticalPlan, lateralLegIndex)) {

      if (this.needCalculateTodDisplayDistance) {
        this.calculateTodDisplayDistance(lateralPlan, verticalPlan);
      }

      const currentAltitudeMetric = UnitType.FOOT.convertTo(this.currentAltitude, UnitType.METER);
      const currentVSMetric = UnitType.FPM.convertTo(this.currentVS, UnitType.MPM);

      const todBodDetails = this.manageTodBodDetails(
        verticalPlan, lateralLegIndex, alongLegDistance, currentAltitudeMetric, currentVSMetric);

      const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, lateralLegIndex);

      // The vnavNextConstraintAltitude is used by the PFD to display, in magenta, what the next constraint is in the current flight phase
      // In climbs, this returns the next single altitude constraint, or in the case of an above/below, the below altitude
      // In descent, this returns the next single altitude constraint, or in the case of an above/below, the above altitude

      const inClimb = flightPhase === VerticalFlightPhase.Climb;
      const currentConstraintIsFirstDescentConstraint = currentConstraint?.index === verticalPlan.firstDescentConstraintLegIndex;
      const distanceFromTodGreaterThan2Mins = todBodDetails.todLegIndex === -1
        || todBodDetails.distanceFromTod > UnitType.NMILE.convertTo(this.currentGroundSpeed / 30, UnitType.METER);
      const altitudeBelowCurrentConstraint = currentConstraint !== undefined && currentConstraint.minAltitude > 0 && this.currentAltitude < currentConstraint.targetAltitude;
      const distanceToCurrentConstrantGreaterThan2Mins = altitudeBelowCurrentConstraint && currentConstraint !== undefined &&
        VNavUtils.getDistanceToConstraint(currentConstraint, lateralPlan, lateralLegIndex, alongLegDistance) >
        UnitType.NMILE.convertTo(this.currentGroundSpeed / 30, UnitType.METER);

      const tooFarFromDescent = inClimb ||
        (currentConstraintIsFirstDescentConstraint &&
          (distanceFromTodGreaterThan2Mins || (altitudeBelowCurrentConstraint && distanceToCurrentConstrantGreaterThan2Mins)));
      if (currentConstraint?.type === 'descent' || currentConstraint?.type === 'direct' || currentConstraint?.type === 'manual') {
        if (!tooFarFromDescent && todBodDetails.distanceFromTod < UnitType.NMILE.convertTo(this.currentGroundSpeed / 60, UnitType.METER)
          && (currentConstraint?.nextVnavEligibleLegIndex === undefined || currentConstraint.nextVnavEligibleLegIndex <= lateralLegIndex)) {
          pathAvailable = true;
          this.awaitingClimbRearm = false;
          this.pathAvailable.set(pathAvailable);
        }
      }

      if (currentConstraint !== undefined && currentConstraint.type !== 'climb' && tooFarFromDescent) {
        this.nextConstraintAltitude.set(null);
      } else {
        const nextConstraintDetails = this.calculator.getTargetConstraint(this.primaryPlanIndex, lateralLegIndex);
        const nextConstraintAltitudeMeters = this.calculator.getNextConstraintAltitude(this.primaryPlanIndex, lateralLegIndex);

        this.nextConstraintDetails.set(nextConstraintDetails ?? null);
        this.nextConstraintAltitude.set(nextConstraintAltitudeMeters !== undefined ? UnitType.METER.convertTo(nextConstraintAltitudeMeters, UnitType.FOOT) : null);
      }

      const currentConstraintAltitude = this.calculator.getCurrentConstraintAltitude(this.primaryPlanIndex, lateralLegIndex);
      this.currentConstraintAltitude.set(currentConstraintAltitude !== undefined ? UnitType.METER.convertTo(currentConstraintAltitude, UnitType.FOOT) : null);

      this.checkFplnAlt.set(currentConstraint !== undefined && !currentConstraint.isBeyondFaf && (
        (inClimb && this.currentAltitude > Math.round(UnitType.METER.convertTo(currentConstraint.maxAltitude, UnitType.FOOT))) ||
        (!inClimb && !tooFarFromDescent && this.currentAltitude < Math.round(UnitType.METER.convertTo(currentConstraint.minAltitude, UnitType.FOOT))))
      );

      const fafLegIndex = verticalPlan.fafLegIndex;

      requiredVs = this.getVerticalSpeedAdvisoryPointerValue(lateralPlan, alongLegDistance, lateralLegIndex, flightPhase);

      this.apValues.approachHasGP.set(this.manageGP(lateralPlan, alongLegDistance));
      const gpDistance = this.gpDistance.get();

      if (
        gpDistance !== null
        && (
          this.apValues.verticalActive.get() === APVerticalModes.GP
          || (
            fafLegIndex !== undefined &&
            this.apValues.approachHasGP.get() &&
            this.state !== VNavState.Enabled_Active &&
            lateralLegIndex >= fafLegIndex
          )
        )
      ) {
        requiredVs = this.getRequiredVs(
          UnitType.METER.convertTo(gpDistance, UnitType.NMILE),
          UnitType.METER.convertTo(this.glidepathCalculator.getRunwayAltitude(), UnitType.FOOT),
          this.currentGpsAltitude
        );
      }

      this.requiredVS.set(requiredVs);

      if (this.state === VNavState.Enabled_Active) {
        if (flightPhase === VerticalFlightPhase.Descent && !this.awaitingClimbRearm) {
          this.trackDescentPath(verticalPlan, lateralPlan);
          this.manageAltCaptureType();
        } else if (flightPhase === VerticalFlightPhase.Climb || this.awaitingClimbRearm) {
          this.trackClimb(verticalPlan, lateralPlan);
          this.manageAltCaptureType(VerticalFlightPhase.Climb);
        } else {
          this.captureType.set(VNavAltCaptureType.None);
          this.setAdvisoryValues(verticalPlan);
        }
      } else {
        this.captureType.set(VNavAltCaptureType.None);
        this.setAdvisoryValues(verticalPlan);
      }

    } else {
      this.failed();
    }

    if (this.apValues.approachHasGP.get() === false) {
      this.resetGpVars();
    }

    this.pathAvailable.set(pathAvailable);
    this.evaluateTodAnnunciation();
  }

  /**
   * Evaluates TOD time remaining for annunciation.
   */
  private evaluateTodAnnunciation(): void {
    const todDistanceNM = UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE);
    const timeRemainingSecs = UnitType.HOUR.convertTo(todDistanceNM / this.currentGroundSpeed, UnitType.SECOND);
    this.withinOneMinuteTod.set(this.todBodDetails.distanceFromTod > 100 && timeRemainingSecs <= 60
      && this.state === VNavState.Enabled_Active && this.pathMode.get() !== VNavPathMode.PathActive);
    this.withinFiveSecondsTod.set(this.withinOneMinuteTod.get() && timeRemainingSecs <= 10);
  }

  /**
   * Tracks the vnav climb plan.
   * @param verticalPlan The Vertical Flight Plan.
   * @param lateralPlan The Lateral Flight Plan.
   */
  private trackClimb(verticalPlan: VerticalFlightPlan, lateralPlan: FlightPlan): void {

    this.fpa.set(null);
    this.vnavNextLegTargetAltitude.set(null);

    const lateralLegIndex = this.lnavLegIndex.get();
    const activeLateralLeg = lateralPlan.tryGetLeg(lateralLegIndex);
    if (activeLateralLeg === null || activeLateralLeg.calculated === undefined) {
      return;
    }

    const currentClimbConstraint = VNavUtils.getNextClimbTargetConstraint(verticalPlan, lateralLegIndex);
    const selectedAltitude = this.apValues.selectedAltitude.get();
    const constraintAltitudeFeet = currentClimbConstraint !== undefined ? UnitType.METER.convertTo(currentClimbConstraint.maxAltitude, UnitType.FOOT)
      : Number.POSITIVE_INFINITY;

    this.targetAltitude.set(currentClimbConstraint !== undefined ? constraintAltitudeFeet : null);

    if (this.awaitingClimbRearm &&
      (currentClimbConstraint === undefined || Math.round(constraintAltitudeFeet) > this.capturedAltitude) && selectedAltitude > this.capturedAltitude) {
      this.capturedAltitude = Number.POSITIVE_INFINITY;
      this.isAltCaptured = false;
      this.awaitingClimbRearm = false;
      this.activateMode && this.activateMode(APVerticalModes.FLC);
      return;
    }

    if (currentClimbConstraint === undefined || activeLateralLeg === null || activeLateralLeg.calculated === undefined) {
      return;
    }

    const distanceToBoc = UnitType.METER.convertTo(activeLateralLeg.calculated.distanceWithTransitions, UnitType.NMILE) - this.lnavLegDistanceAlong.get();

    this.checkAltSel.set(this.awaitingClimbRearm &&
      lateralLegIndex === currentClimbConstraint.index &&
      distanceToBoc / (this.currentGroundSpeed / 60) < 0.75 &&
      selectedAltitude <= this.capturedAltitude);

    if (!this.isAltCaptured && this.apValues.verticalActive.get() !== APVerticalModes.ALT) {
      const nonPathDeviation = constraintAltitudeFeet - this.currentAltitude;
      const captureRange = Math.abs(this.currentVS / 10);

      if (Math.abs(nonPathDeviation) <= captureRange) {
        this.delegateAltCap(constraintAltitudeFeet, VerticalFlightPhase.Climb);
      }
    }
  }

  /**
   * Tracks the vertical descent path.
   * @param verticalPlan The Vertical Flight Plan.
   * @param lateralPlan The Lateral Flight Plan.
   */
  private trackDescentPath(verticalPlan: VerticalFlightPlan, lateralPlan: FlightPlan): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = this.lnavLegDistanceAlong.get();

    const vnavTargetAltitude = this.calculator.getTargetAltitude(this.primaryPlanIndex, lateralLegIndex);
    const constraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, lateralLegIndex);

    if (constraint === undefined || vnavTargetAltitude === undefined || (verticalPlan.destLegIndex !== undefined && lateralLegIndex > verticalPlan.destLegIndex)) {
      this.targetAltitude.set(null);
      this.verticalDeviation.set(null);
      this.vnavNextLegTargetAltitude.set(null);
      this.fpa.set(null);
      this.disarmPath();
      return;
    }

    const vnavTargetAltitudeFeet = Math.round(UnitType.METER.convertTo(vnavTargetAltitude, UnitType.FOOT));
    this.targetAltitude.set(vnavTargetAltitudeFeet);

    const currentVerticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, lateralLegIndex);
    const currentLegFpa = currentVerticalLeg.fpa;
    this.vnavNextLegTargetAltitude.set(currentVerticalLeg.altitude > 0 ? Math.round(currentVerticalLeg.altitude) : null);

    this.fpa.set(currentLegFpa);

    const currentLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, lateralLegIndex, UnitType.NMILE.convertTo(currentAlongLegDistance, UnitType.METER));
    const currentLegDeviation = UnitType.METER.convertTo(currentLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;

    this.canPathArm() && this.armPath();

    if (!this.checkPathValidity(lateralPlan, constraint, currentLegDeviation) && this.pathMode.get() == VNavPathMode.PathActive) {
      this.verticalDeviation.set(currentLegDeviation);
      this.disarmPath();
      return;
    }

    const targetIsSelectedAltitude = this.preselectedAltitude > vnavTargetAltitudeFeet;
    const targetAltitude = Math.max(vnavTargetAltitudeFeet, this.preselectedAltitude);
    const deviationFromTarget = targetAltitude - this.currentAltitude;

    this.canPathActivate(currentLegFpa, currentLegDeviation, deviationFromTarget) && this.activatePath();

    const pathActive = this.pathMode.get() == VNavPathMode.PathActive;

    const rearm = !VNavUtils.getIsPathEnd(verticalPlan, lateralLegIndex);

    const captureRange = Math.abs(this.currentVS / 10);

    if (this.activeLegChangedWhilePathActive) {
      this.activeLegChangedWhilePathActive = false;
      if (pathActive && lateralLegIndex > 0 && (currentLegFpa === 0 || currentLegDeviation > 100 || currentLegDeviation < -15)) {
        const prevVerticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, lateralLegIndex - 1);
        if (prevVerticalLeg.isBod) {
          const prevTargetAltitude = this.calculator.getTargetAltitude(this.primaryPlanIndex, lateralLegIndex - 1);
          if (prevTargetAltitude !== undefined) {
            const prevTargetAltitudeFeet = Math.round(UnitType.METER.convertTo(prevTargetAltitude, UnitType.FOOT));
            this.delegateAltCap(prevTargetAltitudeFeet, rearm ? VerticalFlightPhase.Descent : undefined, lateralLegIndex);
            return;
          }
        }
      }
    }
    if (this.blendDeviation(verticalPlan)) {
      return;
    }

    const verticalActiveMode = this.apValues.verticalActive.get();

    if (!pathActive && constraint && verticalActiveMode !== APVerticalModes.ALT && verticalActiveMode !== APVerticalModes.CAP) {
      const constraintAltitudeFeet = Math.round(UnitType.METER.convertTo(constraint.minAltitude, UnitType.FOOT));
      const nonPathTargetAlt = constraintAltitudeFeet;
      const nonPathDeviation = nonPathTargetAlt - this.currentAltitude;

      if (this.preselectedAltitude < nonPathTargetAlt && Math.abs(nonPathDeviation) <= captureRange) {
        const shouldRearm = !VNavUtils.getIsPathEnd(verticalPlan, lateralLegIndex);
        this.delegateAltCap(nonPathTargetAlt, shouldRearm ? VerticalFlightPhase.Descent : undefined,
          currentVerticalLeg.isBod ? lateralLegIndex + 1 : lateralLegIndex);
      }
    }

    const isPathEnd =
      VNavUtils.getIsPathEnd(verticalPlan, lateralLegIndex)
      || (this.isApproachLoc.get() && lateralLegIndex === verticalPlan.fafLegIndex);
    const nextLeg = !isPathEnd ? VNavUtils.getVerticalLegFromPlan(verticalPlan, lateralLegIndex + 1) : undefined;

    let nextLegDeviation;

    if (!isPathEnd && nextLeg) {
      const legDistanceRemainingMeters = UnitType.NMILE.convertTo(this.lnavLegDistanceRemaining.get(), UnitType.METER);
      const desiredAltitudeForNextLeg = VNavUtils.getDesiredAltitude(verticalPlan, lateralLegIndex + 1, -legDistanceRemainingMeters);
      nextLegDeviation = UnitType.METER.convertTo(desiredAltitudeForNextLeg, UnitType.FOOT) - this.currentAltitude;
    }

    if (!pathActive || Math.abs(deviationFromTarget) > captureRange) {

      // If we're armed and in a FPA 0 leg and the next leg is not FPA 0, set deviation to the next leg's deviation.
      if (!pathActive && currentLegFpa === 0 && nextLeg !== undefined && nextLeg.fpa > 0 && nextLegDeviation !== undefined) {
        this.verticalDeviation.set(nextLegDeviation);
      } else {
        this.verticalDeviation.set(currentLegDeviation);
      }

      return;
    } else if (!currentVerticalLeg.isBod && !targetIsSelectedAltitude && nextLegDeviation !== undefined) {
      this.verticalDeviation.set(nextLegDeviation);
      return;
    }

    if (nextLeg === undefined || targetIsSelectedAltitude || isPathEnd || nextLeg.fpa === 0) {
      this.verticalDeviation.set(currentLegDeviation);
      // this.delegateAltCap(targetAltitude);

      this.delegateAltCap(targetAltitude, !isPathEnd ? VerticalFlightPhase.Descent : undefined,
        currentVerticalLeg.isBod ? lateralLegIndex + 1 : lateralLegIndex);



      isPathEnd && this.tryDeactivate(APVerticalModes.NONE);
      return;
    }

    // Now we know path is active, we are approaching a BOD and the next leg is valid and has a non-zero FPA
    // We want to blend the two deviations if the next TOD is less than 1NM from the BOD.

    const nextLegTodDistance = VNavUtils.distanceForAltitude(nextLeg.fpa, UnitType.FOOT.convertTo(targetAltitude, UnitType.METER) - nextLeg.altitude);
    const nextLegTodDistanceFromCurrentLegEnd = nextLeg.distance - nextLegTodDistance;

    if (nextLegTodDistanceFromCurrentLegEnd < 1900) {
      this.blendingDeviationTargetLegIndex = lateralLegIndex + 1;
      this.blendedDeviationTotalDistance = null;
      this.blendDeviation(verticalPlan);
      return;
    }

    this.delegateAltCap(targetAltitude, VerticalFlightPhase.Descent);
  }

  /**
   * Sets the advisory VNAV values when VNAV is disabled, but advisory vnav is on.
   * @param verticalPlan The Vertical Flight Plan.
   */
  private setAdvisoryValues(verticalPlan: VerticalFlightPlan): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = this.lnavLegDistanceAlong.get();

    const vnavTargetAltitude = this.calculator.getTargetAltitude(this.primaryPlanIndex, lateralLegIndex);
    const constraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, lateralLegIndex);

    if (constraint === undefined ||
      vnavTargetAltitude === undefined ||
      (verticalPlan.destLegIndex !== undefined && lateralLegIndex > verticalPlan.destLegIndex) ||
      (constraint.nextVnavEligibleLegIndex !== undefined && lateralLegIndex < constraint.nextVnavEligibleLegIndex)) {
      this.targetAltitude.set(null);
      this.verticalDeviation.set(null);
      this.fpa.set(null);
      return;
    }

    const vnavTargetAltitudeFeet = Math.round(UnitType.METER.convertTo(vnavTargetAltitude, UnitType.FOOT));
    this.targetAltitude.set(vnavTargetAltitudeFeet);

    const currentVerticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, lateralLegIndex);
    const currentLegFpa = currentVerticalLeg.fpa;

    this.fpa.set(currentLegFpa);

    const currentLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, lateralLegIndex, UnitType.NMILE.convertTo(currentAlongLegDistance, UnitType.METER));
    const currentLegDeviation = UnitType.METER.convertTo(currentLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;

    this.verticalDeviation.set(currentLegDeviation);
  }

  /**
   * Method to blend deviation between two vnav legs with an FPA > 0 and
   * the distance between the first leg end and the next TOD is less than 1NM.
   * @param verticalPlan The Vertical Flight Plan.
   * @returns whether the deviation was blended.
   */
  private blendDeviation(verticalPlan: VerticalFlightPlan): boolean {
    if (this.blendingDeviationTargetLegIndex !== null) {
      const activeLegIndex = this.lnavLegIndex.get();
      const fromLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, this.blendingDeviationTargetLegIndex - 1);
      const toLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, this.blendingDeviationTargetLegIndex);
      const toLegTodDistance = VNavUtils.distanceForAltitude(toLeg.fpa, fromLeg.altitude - toLeg.altitude);
      const distanceBetweenFromLegAndTod = toLeg.distance - toLegTodDistance;

      const alongLegDistanceMeters = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);
      const remainingLegDistanceMeters = UnitType.NMILE.convertTo(this.lnavLegDistanceRemaining.get(), UnitType.METER);

      if (this.blendedDeviationTotalDistance === null) {
        this.blendedDeviationTotalDistance = distanceBetweenFromLegAndTod + remainingLegDistanceMeters;
      }

      let blendedDeviationPercentage = 0;
      let distanceToTod = 0;
      let fromLegDesiredAltitude = 0;
      let fromLegDeviation = 0;
      let toLegDesiredAltitude = 0;
      let toLegDeviation = 0;

      if (activeLegIndex === this.blendingDeviationTargetLegIndex - 1) {
        distanceToTod = remainingLegDistanceMeters + distanceBetweenFromLegAndTod;
        fromLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, this.blendingDeviationTargetLegIndex - 1, alongLegDistanceMeters);
        fromLegDeviation = UnitType.METER.convertTo(fromLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;
        toLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, this.blendingDeviationTargetLegIndex, -remainingLegDistanceMeters);
        toLegDeviation = UnitType.METER.convertTo(toLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;

      } else if (activeLegIndex === this.blendingDeviationTargetLegIndex) {
        distanceToTod = distanceBetweenFromLegAndTod - alongLegDistanceMeters;
        fromLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, this.blendingDeviationTargetLegIndex - 1, fromLeg.distance + alongLegDistanceMeters);
        fromLegDeviation = UnitType.METER.convertTo(fromLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;
        toLegDesiredAltitude = VNavUtils.getDesiredAltitude(verticalPlan, this.blendingDeviationTargetLegIndex, alongLegDistanceMeters);
        toLegDeviation = UnitType.METER.convertTo(toLegDesiredAltitude, UnitType.FOOT) - this.currentAltitude;
      } else {
        this.blendedDeviationTotalDistance = null;
        this.blendingDeviationTargetLegIndex = null;
        return false;
      }

      blendedDeviationPercentage = (this.blendedDeviationTotalDistance - distanceToTod) / this.blendedDeviationTotalDistance;
      if (blendedDeviationPercentage > 1 || blendedDeviationPercentage < 0) {
        this.blendedDeviationTotalDistance = null;
        this.blendingDeviationTargetLegIndex = null;
        return false;
      }

      const blendedDeviation = (blendedDeviationPercentage * toLegDeviation) + ((1 - blendedDeviationPercentage) * fromLegDeviation);
      this.verticalDeviation.set(blendedDeviation);
      return true;
    }
    this.blendedDeviationTotalDistance = null;
    return false;
  }

  /**
   * Checks whether the VNav Path can go from an armed state to activated state.
   * @param currentLegFpa The current leg FPA.
   * @param currentLegDeviation The current leg Deviation.
   * @param deviationFromTarget The deviation from the target altitude.
   * @returns Whether Path Can Activate.
   */
  private canPathActivate(currentLegFpa: number, currentLegDeviation: number, deviationFromTarget: number): boolean {
    if (this.pathMode.get() === VNavPathMode.PathArmed && currentLegFpa !== 0 && !this.pathArmedError.get()) {
      if (currentLegDeviation <= VNavUtils.getPathErrorDistance(this.currentGroundSpeed) && currentLegDeviation >= -15) {
        if (Math.abs(deviationFromTarget) > 75 && (!this.isAltCaptured && currentLegFpa !== 0)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks whether the VNav Path can arm.
   * @returns Whether Path can arm.
   */
  private canPathArm(): boolean {
    if (this.apValues.verticalActive.get() === APVerticalModes.CAP) {
      return false;
    }

    if (this.awaitingPathRearm && this.lnavLegIndex.get() === this.pathRearmIndex && this.apValues.verticalArmed.get() !== APVerticalModes.ALT) {
      this.awaitingPathRearm = false;
    }

    if (this.pathMode.get() === VNavPathMode.None && !this.awaitingPathRearm) {
      if (this.preselectedAltitude + 75 < this.currentAltitude) {
        return true;
      } else if (this.todBodDetails.distanceFromTod > 0 && UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE) / (this.currentGroundSpeed / 60) < 0.75) {
        this.checkAltSel.set(true);
      }
    }
    return false;
  }

  /**
   * Method to check the validity of the path.
   * @param lateralPlan The Lateral Flight Plan.
   * @param constraint The current vnav constraint.
   * @param verticalDeviation The current vertical deviation value.
   * @returns Whether the path is currently valid.
   */
  private checkPathValidity(lateralPlan: FlightPlan, constraint: VNavConstraint, verticalDeviation: number): boolean {

    this.noPathPilotCmd.set(this.checkPathPilotCmd(verticalDeviation));

    const pathArmed = this.pathMode.get() === VNavPathMode.PathArmed;
    const pathActive = this.pathMode.get() === VNavPathMode.PathActive;
    const pathArmedOrActive = pathArmed || pathActive;
    const notInAltHold = this.apValues.verticalActive.get() !== APVerticalModes.ALT;

    // Deal with Path Below Aircraft Message

    if (this.pathBelowAircraft.get() === true && (!pathArmed || verticalDeviation > -10)) {
      this.pathBelowAircraft.set(false);
    }
    if (pathArmed && this.checkPathBelowAircraft(verticalDeviation)) {
      this.pathBelowAircraft.set(true);
    }

    const lateralLegIndex = this.lnavLegIndex.get();
    const ineligibleLeg = this.getIneligibleLeg(lateralPlan, constraint, lateralLegIndex);

    // NO_VPATH_CONDITION: manually terminated leg between the TOD and the
    // altitude constraint waypoint or other FPL edit moved the vertical path.

    if (pathActive && this.lateralPlanChangedCheckDeviation) {
      if (Math.abs(verticalDeviation) > 100) {
        this.noPathConditionPlanChanged.set(true);
      }
    }

    this.noPathConditionDisco.set(pathArmedOrActive && ineligibleLeg !== undefined && this.isLegDiscontinuity(ineligibleLeg));

    // NO_VPATH_VECTORS: Shows when VPATH mode has automatically reverted to VPITCH mode because there is a heading leg in the
    // FMS flight plan. Message also clears after the aircraft passes the heading leg

    this.noPathVectors.set(pathArmedOrActive && ineligibleLeg !== undefined && this.isLegVectors(ineligibleLeg));

    // NO_VPATH_THIS_LEG: Active leg is hold or procedure turn
    const activeLeg = lateralPlan.tryGetLeg(lateralLegIndex);

    if (activeLeg !== null) {
      this.noPathThisLeg.set(VNavUtils.isLegTypeHoldOrProcedureTurn(activeLeg));
    } else {
      this.noPathThisLeg.set(false);
    }

    // NO_VPATH_TAE: Track angle error exceeds an acceptable threshold

    this.noPathTae.set(pathArmedOrActive && this.isTaeOutsideLimits());

    // NO_VPATH_XTK: Cross track deviation exceeds an acceptable threshold

    this.noPathXtk.set(pathArmedOrActive && this.isXtkOutsideLimits());

    // UNABLE_NEXT_ALT: current fpa insufficient OR (in vertical dto) Required FPA on path exceeds limits

    const unableNextAltCondition = notInAltHold && this.isRequiredFpaOutsideLimits();

    if (unableNextAltCondition) {
      const unableNextAltTimer = this.unableNextAltTimer.get();

      if (unableNextAltTimer === -1) {
        this.unableNextAltTimer.set(Date.now());
      } else if (Date.now() - unableNextAltTimer > (1_000 * 60)) {
        this.unableNextAlt.set(true);
      }
    } else {
      this.unableNextAlt.set(false);
      this.unableNextAltTimer.set(-1);
    }

    this.pathArmedError.set(this.pathBelowAircraft.get() ||
      this.noPathTae.get() ||
      this.noPathXtk.get() ||
      this.noPathThisLeg.get() ||
      this.noPathConditionDisco.get() ||
      this.noPathConditionPlanChanged.get() ||
      this.noPathVectors.get() ||
      this.pilotPathIntervention
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
   * Gets the VPath ineligible leg if one exists.
   * @param lateralPlan The Lateral Flight Plan.
   * @param constraint The constraint.
   * @param legIndex The current active leg index.
   * @returns the Leg or undefined.
   */
  private getIneligibleLeg(lateralPlan: FlightPlan, constraint: VNavConstraint, legIndex: number): LegDefinition | undefined {
    const lateralLegIndex = this.lnavLegIndex.get();

    if (constraint.nextVnavEligibleLegIndex !== undefined && lateralLegIndex < constraint.nextVnavEligibleLegIndex) {

      for (let l = constraint.nextVnavEligibleLegIndex - 1; l > legIndex; l--) {
        const leg = lateralPlan.tryGetLeg(l);
        if (leg !== null) {
          const legIsEligible = SmoothingPathCalculator.isLegVnavEligible(leg);

          if (!legIsEligible) {
            return leg;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Checks if a leg is a vectors leg.
   * @param leg The Leg.
   * @returns Whether the leg is vectors.
   */
  private isLegVectors(leg: LegDefinition): boolean {
    switch (leg.leg.type) {
      case LegType.FM:
      case LegType.VM:
        return true;
    }
    return false;
  }

  /**
   * Checks if a leg is a discontinuity.
   * @param leg The Leg.
   * @returns Whether the leg is a disco.
   */
  private isLegDiscontinuity(leg: LegDefinition): boolean {
    switch (leg.leg.type) {
      case LegType.Discontinuity:
      case LegType.ThruDiscontinuity:
        return true;
    }
    return false;
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
   * Checks whether the XTK is out of limits for VPATH.
   * @returns if the XTK is out of limits.
   */
  private isXtkOutsideLimits(): boolean {

    let xtkErrorLimit = 10;
    const distanceToDestinationArp = this.lnavDataDestinationDistanceDirect.get();

    switch (this.lnavDataCdiScaleLabel.get()) {
      case CDIScaleLabel.Terminal:
      case CDIScaleLabel.TerminalArrival:
      case CDIScaleLabel.TerminalDeparture: {
        const minimumTerminalXtkError = 1.1;
        const minimumTerminalDistance = 5;
        const maximumTerminalXtkError = 10;
        const maximumTerminalDistance = 31;

        const terminalErrorPercentage = (distanceToDestinationArp - minimumTerminalDistance) / (maximumTerminalDistance - minimumTerminalDistance);
        const terminalErrorRaw = (maximumTerminalXtkError - minimumTerminalXtkError) * terminalErrorPercentage;

        xtkErrorLimit = MathUtils.clamp(terminalErrorRaw, minimumTerminalXtkError, maximumTerminalXtkError);
      }
        break;
      case CDIScaleLabel.Approach:
        {
          const distanceToFaf = this.lnavDataDistanceToFaf.get();
          const minimumApproachXtkError = 0.3;
          const maximumApproachXtkError = 1;
          const maximumApproachDistance = 2;

          const approachErrorPercentage = (distanceToFaf) / (maximumApproachDistance);
          const approachErrorRaw = (maximumApproachXtkError - minimumApproachXtkError) * approachErrorPercentage;

          xtkErrorLimit = MathUtils.clamp(approachErrorRaw, minimumApproachXtkError, maximumApproachXtkError);
        }
        break;
      default:
    }

    return Math.abs(this.lnavXtk.get()) > xtkErrorLimit;
  }

  /**
   * Checks if the TAE is out of limits for VPATH.
   * @returns if TAE is out of limits.
   */
  private isTaeOutsideLimits(): boolean {

    const tae = Math.abs(NavMath.diffAngle(this.lnavDtk.get(), this.trueTrack));
    let taeErrorLimit = 75;

    switch (this.lnavDataCdiScaleLabel.get()) {
      case CDIScaleLabel.Approach:
        taeErrorLimit = 30;
        break;
      default:
    }

    return tae > taeErrorLimit;
  }

  /**
   * Checks if the required FPA is out of limits.
   * @returns if the required FPA is out of limits.
   */
  private isRequiredFpaOutsideLimits(): boolean {
    const currentVs = this.currentVS;
    const requiredVs = this.requiredVS.get();

    // In the WT21, we use manual constraints for VDTOs
    const inVerticalDto = this.nextConstraintDetails.get()?.type === 'manual';

    let requiredFpa = null;
    if (inVerticalDto) {
      const constraint = this.nextConstraintDetails.get();

      // We calculate our own FPA here, since `SmoothingPathCalculator` clamps the fpa to the maximum allowed fpa.
      // Also, in a vdto it seems the fpa is not constantly updated.
      if (constraint) {
        const constraintDistanceNM = UnitType.NMILE.convertFrom(constraint.distance, UnitType.METER);
        const currentAlongLegDistance = this.lnavLegDistanceAlong.get();
        const distanceToConstraint = constraintDistanceNM - currentAlongLegDistance;
        const distanceToConstraintMetres = UnitType.METER.convertFrom(distanceToConstraint, UnitType.NMILE);

        const currentAltitudeMetres = UnitType.METER.convertFrom(this.currentAltitude, UnitType.FOOT);

        const heightToConstraint = currentAltitudeMetres - constraint.targetAltitude;

        requiredFpa = VNavUtils.getFpa(distanceToConstraintMetres, heightToConstraint);
      }
    }

    const vsCondition = requiredVs !== null && Math.abs(currentVs) < (Math.abs(requiredVs) - 50); // We can be up to 50 fpm below
    const vdtoFpaCondition = inVerticalDto && requiredFpa !== null && requiredFpa > 6.0;

    return vsCondition || vdtoFpaCondition;
  }

  /**
   * Method to reset all error messages.
   */
  private clearAllMessages(): void {
    this.pathBelowAircraft.set(false);
    this.checkAltSel.set(false);

    this.noPathTae.set(false);
    this.noPathXtk.set(false);
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
    this.withinOneMinuteTod.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.TOD, undefined, () => this.withinFiveSecondsTod.get());
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.TOD);
      }
    });

    this.pathBelowAircraft.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.PATH_BELOW_AC);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.PATH_BELOW_AC);
      }
    });

    this.noPathTae.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_TAE);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_TAE);
      }
    });

    this.noPathXtk.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_XTK);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_XTK);
      }
    });

    this.noPathThisLeg.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
      }
    });

    this.noPathPilotCmd.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
      }
    });

    this.noPathConditionDisco.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
      } else if (!this.noPathConditionPlanChanged.get()) {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
      }
    });

    this.noPathConditionPlanChanged.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
      } else if (!this.noPathConditionDisco.get()) {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
      }
    });

    this.noPathVectors.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
      }
    });

    this.checkAltSel.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.CHK_ALT_SEL);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.CHK_ALT_SEL);
      }
    });

    this.checkFplnAlt.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
      }
    });

    this.unableNextAlt.sub(v => {
      if (v) {
        this.messageService.post(FMS_MESSAGE_ID.UNABLE_NEXT_ALT);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.UNABLE_NEXT_ALT);
      }
    });
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
    this.currentConstraintAltitude.sub(alt => SimVar.SetSimVarValue(VNavVars.CurrentConstraintAltitude, SimVarValueType.Feet, alt ?? -1));
    this.nextConstraintAltitude.sub(alt => SimVar.SetSimVarValue(VNavVars.NextConstraintAltitude, SimVarValueType.Feet, alt ?? -1));
    this.targetAltitude.sub(alt => SimVar.SetSimVarValue(VNavVars.TargetAltitude, SimVarValueType.Feet, alt ?? -1));
    this.fpa.sub(fpa => SimVar.SetSimVarValue(VNavVars.FPA, SimVarValueType.Degree, fpa ?? 0));
    this.verticalDeviation.sub(dev => SimVar.SetSimVarValue(VNavVars.VerticalDeviation, SimVarValueType.Feet, dev ?? Number.MAX_SAFE_INTEGER));
    this.requiredVS.sub(vs => SimVar.SetSimVarValue(VNavVars.RequiredVS, SimVarValueType.FPM, vs ?? 0));
    this.captureType.sub(type => SimVar.SetSimVarValue(VNavVars.CaptureType, SimVarValueType.Number, type));
    this.gpVerticalDeviation.sub(dev => SimVar.SetSimVarValue(VNavVars.GPVerticalDeviation, SimVarValueType.Feet, dev ?? -1001));
    this.gpDistance.sub(dis => SimVar.SetSimVarValue(VNavVars.GPDistance, SimVarValueType.Meters, dis ?? -1));
    this.gpFpa.sub(fpa => SimVar.SetSimVarValue(VNavVars.GPFpa, SimVarValueType.Degree, fpa ?? 0));
    this.vnavNextLegTargetAltitude.sub(v => {
      this.bus.getPublisher<VNavDataEvents>().pub('vnav_active_leg_alt', v ?? 0, true, false);
    });
  }

  /**
   * Method to reset VNAV Vars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, VNavState.Enabled_Inactive);
    SimVar.SetSimVarValue(VNavVars.PathMode, SimVarValueType.Number, VNavPathMode.None);
    SimVar.SetSimVarValue(VNavVars.PathAvailable, SimVarValueType.Bool, false);

    SimVar.SetSimVarValue(VNavVars.CurrentConstraintAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.NextConstraintAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.TargetAltitude, SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(VNavVars.FPA, SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(VNavVars.VerticalDeviation, SimVarValueType.Feet, Number.MAX_SAFE_INTEGER);
    SimVar.SetSimVarValue(VNavVars.RequiredVS, SimVarValueType.FPM, 0);
    SimVar.SetSimVarValue(VNavVars.CaptureType, SimVarValueType.Number, VNavAltCaptureType.None);

    SimVar.SetSimVarValue(VNavVars.GPVerticalDeviation, SimVarValueType.Feet, -1001);
    SimVar.SetSimVarValue(VNavVars.GPDistance, SimVarValueType.Meters, -1);
    SimVar.SetSimVarValue(VNavVars.GPFpa, SimVarValueType.Degree, 0);
  }

  /**
   * Resets the path-related VNavVars
   */
  private resetVNavVars(): void {
    this.pathAvailable.set(false);
    this.currentConstraintAltitude.set(null);
    this.nextConstraintAltitude.set(null);
    this.targetAltitude.set(null);
    this.fpa.set(null);
    this.verticalDeviation.set(null);
    this.requiredVS.set(null);
    this.captureType.set(VNavAltCaptureType.None);
  }

  /**
   * Resets the gp-related VNavVars
   */
  private resetGpVars(): void {
    this.gpVerticalDeviation.set(null);
    this.gpDistance.set(null);
    this.gpFpa.set(null);
  }

  /**
   * Resets the TOD BOD Values
   */
  private resetTodBodVars(): void {
    this.todBodDetailsSub.set('bodLegIndex', -1);
    this.todBodDetailsSub.set('todLegIndex', -1);
    this.todBodDetailsSub.set('todLegDistance', 0);
    this.todBodDetailsSub.set('distanceFromBod', 0);
    this.todBodDetailsSub.set('distanceFromTod', 0);
    this.todBodDetailsSub.set('currentConstraintLegIndex', -1);
  }

  /**
   * Manages The Altitude Capture Type for the FMA.
   * @param flightPhase The current vertical flight phase (defaults to descent).
   */
  private manageAltCaptureType(flightPhase = VerticalFlightPhase.Descent): void {
    const targetAltFeet = this.targetAltitude.get();
    if (targetAltFeet !== null) {
      if (flightPhase === VerticalFlightPhase.Descent) {
        this.captureType.set(this.preselectedAltitude >= targetAltFeet ? VNavAltCaptureType.Selected : VNavAltCaptureType.VNAV);
      } else {
        this.captureType.set(this.preselectedAltitude <= targetAltFeet ? VNavAltCaptureType.Selected : VNavAltCaptureType.VNAV);
      }
    } else {
      this.captureType.set(VNavAltCaptureType.None);
    }
  }

  /**
   * Manages the GP State and sets required data for GP guidance, returns whether there is a GP.
   * @param lateralPlan The FlightPlan.
   * @param alongLegDistance The Along Leg Distance
   * @returns Whether there is a GP.
   */
  private manageGP(lateralPlan: FlightPlan | undefined, alongLegDistance: number): boolean {
    const approachIsActive = this.approachDetails.get().approachIsActive;
    const activeLeg = lateralPlan?.tryGetLeg(this.lnavLegIndex.get());
    const activeLegIsNotMissed = activeLeg && !BitFlags.isAll(LegDefinitionFlags.MissedApproach, activeLeg.flags);
    if (lateralPlan && this.gpSupported.get() && approachIsActive && activeLegIsNotMissed) {
      const gpDistance = this.glidepathCalculator.getGlidepathDistance(this.lnavLegIndex.get(), alongLegDistance);
      this.gpDistance.set(gpDistance);
      const desiredGPAltitudeFeet = UnitType.METER.convertTo(this.glidepathCalculator.getDesiredGlidepathAltitude(gpDistance), UnitType.FOOT);
      this.gpVerticalDeviation.set(MathUtils.clamp(desiredGPAltitudeFeet - this.currentGpsAltitude, -1000, 1000));
      this.gpFpa.set(this.glidepathCalculator.glidepathFpa);
      return true;
    }
    this.resetGpVars();
    return false;
  }

  /**
   * Manages the TOD BOD Details based on any set cruise altitude and FMS 3000 logic for display.
   * @param verticalPlan The vertical flight plan.
   * @param lateralLegIndex The current lateral leg index.
   * @param alongLegDistance The current along leg distance.
   * @param currentAltitudeMetric The current metric altitude.
   * @param currentVSMetric The current metric vertical speed.
   * @returns TodBodDetails.
   */
  private manageTodBodDetails(
    verticalPlan: VerticalFlightPlan,
    lateralLegIndex: number,
    alongLegDistance: number,
    currentAltitudeMetric: number,
    currentVSMetric: number
  ): TodBodDetails {

    const calculate = (this.todBodDetails.todLegIndex === -1 && this.todBodDetails.todLegIndex === -1) || this._realTime - this.todCalculatedTimer > 1000;

    if (calculate) {
      let todBodDetails = VNavUtils.getTodBodDetails(verticalPlan, lateralLegIndex, alongLegDistance, currentAltitudeMetric, currentVSMetric, this.todBodDetails);

      if (
        this.cruiseAltitude > 0
        && todBodDetails.distanceFromTod > this.todDisplayDistanceMeters
        && verticalPlan.firstDescentConstraintLegIndex !== undefined
        && todBodDetails.currentConstraintLegIndex <= verticalPlan.firstDescentConstraintLegIndex
      ) {

        todBodDetails = VNavUtils.getTodBodDetails(verticalPlan, lateralLegIndex, alongLegDistance,
          UnitType.FOOT.convertTo(this.cruiseAltitude, UnitType.METER), 0, this.todBodDetails);
      } else if (todBodDetails.distanceFromTod > this.todDisplayDistanceMeters) {
        todBodDetails.todLegIndex = -1;
      }

      this.todBodDetailsSub.set('bodLegIndex', todBodDetails.bodLegIndex);
      this.todBodDetailsSub.set('todLegIndex', todBodDetails.todLegIndex);
      this.todBodDetailsSub.set('todLegDistance', todBodDetails.todLegDistance);
      this.todBodDetailsSub.set('distanceFromBod', todBodDetails.distanceFromBod);
      this.todBodDetailsSub.set('distanceFromTod', todBodDetails.distanceFromTod);
      this.todBodDetailsSub.set('currentConstraintLegIndex', todBodDetails.currentConstraintLegIndex);

      this.todCalculatedTimer = Date.now();

      return todBodDetails;
    }
    return this.todBodDetails;
  }

  /**
   * Calculates the TOD Display Distance in meters.
   * @param lateralPlan The Lateral Flight Plan.
   * @param verticalPlan The Vertical Flight Plan.
   */
  private calculateTodDisplayDistance(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {
    const twentyPercentMeters = 0.2 * (lateralPlan.getLeg(verticalPlan.missedApproachStartIndex ?? lateralPlan.length - 1).calculated?.cumulativeDistance ?? 0);
    this.todDisplayDistanceMeters = MathUtils.clamp(Math.min(twentyPercentMeters, 92600), 11112, 92600);
    this.needCalculateTodDisplayDistance = false;
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
   * Gets the Vertical Speed Advisory Pointer Value for a given constraint and vertical flight phase.
   * @param lateralPlan The flight lateralPlan.
   * @param alongLegDistance The current alongLegDistance.
   * @param activeLateralLeg The Current Active Lateral Leg in the flight lateralPlan.
   * @param flightPhase The current VerticalFlightPhase.
   * @returns The Vertical Speed Required, in feet per minute, or 0 if it does not exist/the required value is < 100 fpm.
   */
  private getVerticalSpeedAdvisoryPointerValue(lateralPlan: FlightPlan, alongLegDistance: number, activeLateralLeg: number, flightPhase: VerticalFlightPhase): number {
    const constraint = this.calculator.getNextRestrictionForFlightPhase(this.primaryPlanIndex, activeLateralLeg);
    if (constraint) {
      const altitude = flightPhase === VerticalFlightPhase.Climb ? constraint.minAltitude : constraint.maxAltitude;
      let distance = -alongLegDistance;
      for (let l = activeLateralLeg; l <= constraint.index; l++) {
        const leg = lateralPlan.tryGetLeg(l);
        if (leg) {
          distance += leg.calculated?.distanceWithTransitions ?? 0;
        }
      }
      const requiredVs = this.getRequiredVs(UnitType.METER.convertTo(distance, UnitType.NMILE), UnitType.METER.convertTo(altitude, UnitType.FOOT));
      if ((flightPhase === VerticalFlightPhase.Climb && requiredVs >= 100) || (flightPhase === VerticalFlightPhase.Descent && requiredVs <= -100)) {
        return requiredVs;
      }
    }
    return 0;
  }

  /**
   * Publishes TOD/BOD details to simvars.
   * @param details The TOD/BOD details object.
   * @param key The key to publish.
   * @param value The value to publish.
   */
  private publishTODBODDetails(details: TodBodDetails, key: keyof TodBodDetails, value: number): void {
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
      case 'currentConstraintLegIndex':
        SimVar.SetSimVarValue(VNavVars.CurrentConstraintLegIndex, SimVarValueType.Number, value);
        break;
    }
  }
}