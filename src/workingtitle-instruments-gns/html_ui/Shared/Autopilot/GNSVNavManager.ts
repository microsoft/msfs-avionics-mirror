import {
  VNavManager, VNavState, Subject, VNavPathMode, GeoPoint, GlidePathCalculator, TodBodDetails, ObjectSubject,
  VNavAltCaptureType, ConsumerSubject, EventBus, FlightPlanner, APValues, LNavEvents, AdcEvents, GNSSEvents, UnitType,
  VNavEvents, VNavVars, SimVarValueType, VNavUtils, FlightPlan, MathUtils, AltitudeConstraintDetails,
  AltitudeRestrictionType, RnavTypeFlags, GPSSystemState, Subscribable, FlightPlannerEvents
} from '@microsoft/msfs-sdk';

import {
  ApproachDetails, FmsEvents, FmsUtils, GarminVNavFlightPhase, GlidepathServiceLevel,
  GlidepathServiceLevelCalculator, VNavDataEvents
} from '@microsoft/msfs-garminsdk';

/**
 * Guidance options for the Garmin VNAV Manager.
 */
export interface GarminVNavGuidanceOptions {

  /** Whether or not to allow +V approach service levels when no SBAS is present. */
  allowPlusVWithoutSbas: boolean;

  /** Whether or not to allow approach service levels requiring baro VNAV. */
  allowApproachBaroVNav: boolean;

  /** Whether or not to enable Garmin advanced VNAV. */
  enableAdvancedVNav: boolean;

  /** The current GPS system state. */
  gpsSystemState: Subscribable<GPSSystemState>;
}

/**
 * A GNS Simplified VNav Manager.
 */
export class GNSVNavManager implements VNavManager {

  private readonly publisher = this.bus.getPublisher<VNavEvents & VNavDataEvents>();

  public state = VNavState.Disabled;

  private planChanged = false;
  private fafIndex: number | undefined = undefined;
  private mapIndex: number | undefined = undefined;

  private readonly pathMode = Subject.create<VNavPathMode>(VNavPathMode.None);

  private readonly planePos = new GeoPoint(0, 0);

  private currentAltitude = 0;
  private currentGpsAltitude = 0;

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

  public options: GarminVNavGuidanceOptions = {
    allowPlusVWithoutSbas: true,
    allowApproachBaroVNav: false,
    enableAdvancedVNav: false,
    gpsSystemState: Subject.create(GPSSystemState.DiffSolutionAcquired)
  };

  /** A callback called when the manager is enabled. */
  public onEnable?: () => void;

  /** A callback called when the manager is disabled. */
  public onDisable?: () => void;

  public onActivate?: () => void;

  public onDeactivate?: () => void;

  /** A callback called by the autopilot to arm the supplied vertical mode. */
  public armMode?: (mode: number) => void;

  /** A callback called by the autopilot to activate the supplied vertical mode. */
  public activateMode?: (mode: number) => void;

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
  private readonly targetAltitude = Subject.create<number | null>(null);
  private readonly fpa = Subject.create<number | null>(null);
  private readonly verticalDeviation = Subject.create<number | null>(null);
  private readonly requiredVS = Subject.create<number | null>(null);
  private readonly captureType = Subject.create<VNavAltCaptureType>(VNavAltCaptureType.None);
  private readonly gpVerticalDeviation = Subject.create<number | null>(null);
  private readonly gpDistance = Subject.create<number | null>(null);
  private readonly gpFpa = Subject.create<number | null>(null);
  private readonly gpServiceLevel = Subject.create<GlidepathServiceLevel>(GlidepathServiceLevel.None);
  private readonly vnavNextLegTargetAltitude = Subject.create<number | null>(null);
  private readonly cruiseAltitude = Subject.create(0);
  private readonly vnavFlightPhase = Subject.create(GarminVNavFlightPhase.None);

  private readonly currentAltitudeConstraintDetails = Subject.create<AltitudeConstraintDetails>(
    { type: AltitudeRestrictionType.Unused, altitude: 0 },
    VNavUtils.altitudeConstraintDetailsEquals
  );

  // LNAV Consumer Subjects
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavLegDistanceAlong: ConsumerSubject<number>;

  private readonly gpSupported: ConsumerSubject<boolean>;

  private readonly glidepathServiceLevelCalculator: GlidepathServiceLevelCalculator;

  /**
   * Creates an instance of the Garmin VNAV Manager.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param apValues are the autopilot ap values.
   * @param primaryPlanIndex The index of the flightplan to follow vertical guidance from.
   * @param options The options to apply to this VNAV manager.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly apValues: APValues,
    private readonly primaryPlanIndex: number,
    options: Partial<GarminVNavGuidanceOptions>
  ) {
    Object.assign(this.options, options);
    this.glidepathServiceLevelCalculator = new GlidepathServiceLevelCalculator(
      this.options.allowPlusVWithoutSbas,
      this.options.allowApproachBaroVNav,
      false,
      this.options.gpsSystemState,
      this.approachDetails
    );

    const lnav = this.bus.getSubscriber<LNavEvents>();
    this.lnavLegIndex = ConsumerSubject.create(lnav.on('lnav_tracked_leg_index'), 0);
    this.lnavLegDistanceAlong = ConsumerSubject.create(lnav.on('lnav_leg_distance_along'), 0);

    this.bus.getSubscriber<AdcEvents>().on('indicated_alt').handle(alt => this.currentAltitude = alt);

    const gnss = this.bus.getSubscriber<GNSSEvents>();
    gnss.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
      this.currentGpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    });

    const fpl = this.bus.getSubscriber<FlightPlannerEvents>();
    fpl.on('fplLegChange').handle(e => this.onPlanChanged(e.planIndex));
    fpl.on('fplSegmentChange').handle(e => this.onPlanChanged(e.planIndex));

    this.approachDetails.setConsumer(bus.getSubscriber<FmsEvents>().on('fms_approach_details'));
    this.gpSupported = ConsumerSubject.create(this.bus.getSubscriber<VNavDataEvents>().on('approach_supports_gp'), false);

    this.apValues.approachHasGP.sub(v => {
      this.bus.getPublisher<VNavDataEvents>().pub('gp_available', v, true);
    });

    this.monitorVars();

    this.setState(VNavState.Disabled);
  }

  /** @inheritdoc */
  public setState(vnavState: VNavState): void {
    this.state = vnavState;
  }

  /** @inheritdoc */
  public tryActivate(): void {
    // noop
  }

  /** @inheritdoc */
  public tryDeactivate(): void {
    // noop
  }

  /** @inheritdoc */
  public canVerticalModeActivate(): boolean {
    return true;
  }

  /** @inheritdoc */
  public onPathDirectorDeactivated(): void {
    // noop
  }

  /**
   * Method to call when VNAV Encounters a failed state.
   */
  private failed(): void {
    this.resetGpVars();
    this.resetVNavVars();
  }

  /**
   * Sets planChanged to true to flag that a plan change has been received over the bus.
   * @param planIndex The Plan Index that changed.
   */
  private onPlanChanged(planIndex: number): void {
    if (planIndex === this.primaryPlanIndex) {
      this.planChanged = true;
    }
  }

  /**
   * Updates the VNAV director.
   */
  public update(): void {

    if (!this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      return;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);

    const lateralLegIndex = this.lnavLegIndex.get();

    const alongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    if (lateralPlan.length > 0 && lateralLegIndex < lateralPlan.length) {

      if (this.planChanged) {
        this.fafIndex = VNavUtils.getFafIndex(lateralPlan);
        if (this.fafIndex !== undefined) {
          this.mapIndex = VNavUtils.getMissedApproachLegIndex(lateralPlan);
          if (this.mapIndex <= this.fafIndex) {
            this.fafIndex = undefined;
            this.mapIndex = undefined;
          }
        }
        this.planChanged = false;
      }

      this.apValues.approachHasGP.set(this.manageGP(lateralPlan, alongLegDistance));

    } else {
      this.failed();
    }

    if (this.apValues.approachHasGP.get() === false) {
      this.resetGpVars();
    }
  }

  /**
   * Method to monitor VNavVars.
   */
  private monitorVars(): void {
    // init vnav vars
    this.initVars();

    this.pathMode.sub(mode => {
      SimVar.SetSimVarValue(VNavVars.PathMode, SimVarValueType.Number, mode);
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
    this.gpServiceLevel.sub(gpServiceLevel => SimVar.SetSimVarValue(VNavVars.GPServiceLevel, SimVarValueType.Number, gpServiceLevel));
    this.vnavNextLegTargetAltitude.sub(v => {
      this.publisher.pub('vnav_active_leg_alt', v ?? 0, true, true);
    }, true);
    this.currentAltitudeConstraintDetails.sub(v => {
      this.publisher.pub('vnav_altitude_constraint_details', v, true, true);
    }, true);
    this.cruiseAltitude.sub(v => {
      this.publisher.pub('vnav_cruise_altitude', v, true, true);
    }, true);
    this.vnavFlightPhase.sub(v => {
      this.publisher.pub('vnav_flight_phase', v, true, true);
    }, true);
  }

  /**
   * Method to reset VNAV Vars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(VNavVars.VNAVState, SimVarValueType.Number, VNavState.Disabled);
    SimVar.SetSimVarValue(VNavVars.PathMode, SimVarValueType.Number, VNavPathMode.None);
    SimVar.SetSimVarValue(VNavVars.PathAvailable, SimVarValueType.Bool, false);

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
   * Resets the path-related VNavVars
   */
  private resetVNavVars(): void {
    this.pathAvailable.set(false);
    this.currentConstraintAltitude.set(null);
    this.nextConstraintAltitude.set(null);
    this.currentAltitudeConstraintDetails.set({ type: AltitudeRestrictionType.Unused, altitude: 0 });
    this.targetAltitude.set(null);
    this.fpa.set(null);
    this.verticalDeviation.set(null);
    this.requiredVS.set(null);
    this.captureType.set(VNavAltCaptureType.None);
    this.vnavFlightPhase.set(GarminVNavFlightPhase.None);
  }

  /**
   * Resets the gp-related VNavVars
   */
  private resetGpVars(): void {
    this.gpServiceLevel.set(GlidepathServiceLevel.None);
    this.gpVerticalDeviation.set(null);
    this.gpDistance.set(null);
    this.gpFpa.set(null);
  }

  /**
   * Manages the GP State and sets required data for GP guidance, returns whether there is a GP.
   * @param lateralPlan The FlightPlan.
   * @param alongLegDistance The Along Leg Distance
   * @returns Whether there is a GP.
   */
  private manageGP(lateralPlan: FlightPlan | undefined, alongLegDistance: number): boolean {
    if (lateralPlan && this.gpSupported.get()) {

      const activeLateralLeg = this.lnavLegIndex.get();

      if (this.fafIndex !== undefined && this.mapIndex !== undefined && activeLateralLeg >= this.fafIndex && activeLateralLeg <= this.mapIndex) {
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
    }

    this.resetGpVars();
    return false;
  }
}