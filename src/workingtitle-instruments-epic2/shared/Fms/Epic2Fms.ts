import {
  ActiveLegType, AdcEvents, AdditionalApproachType, AirportFacility, AirportUtils, AirwayData, AltitudeRestrictionType, ApproachProcedure, ApproachUtils,
  BitFlags, ConsumerSubject, ConsumerValue, ControlEvents, EventBus, ExtendedApproachType, Facility, FacilityFrequency, FacilityLoader, FacilityRepository,
  FacilityType, FacilityUtils, FixTypeFlags, FlightPlan, FlightPlanCalculatedEvent, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanLeg,
  FlightPlanner, FlightPlannerEvents, FlightPlanOriginDestEvent, FlightPlanSegment, FlightPlanSegmentType, FlightPlanUtils, GeoCircle, GeoPoint,
  GeoPointInterface, GNSSEvents, ICAO, IcaoType, IcaoValue, IntersectionFacility, LatLonInterface, LegDefinition, LegDefinitionFlags, LegTurnDirection, LegType,
  LNavEvents, MagVar, NavEvents, NavMath, NavSourceId, NavSourceType, OneWayRunway, PerformancePlanRepository, RnavTypeFlags, RunwayUtils,
  SmoothingPathCalculator, SpeedRestrictionType, SpeedUnit, Subject, UnitType, UserFacility, UserFacilityUtils, VerticalData, VerticalFlightPhase,
  VerticalFlightPlan, VisualFacility, VNavDataEvents, VNavUtils, VorFacility, VorType
} from '@microsoft/msfs-sdk';

import { Epic2FlightArea } from '../Autopilot/Epic2FlightAreaComputer';
import { AvionicsConfig } from '../AvionicsConfig';
import { AirGroundDataProvider, AirspeedDataProvider, InertialDataProvider } from '../Instruments';
import { FmcSimVarEvents, FmcSimVars } from '../Misc/FmcSimVars';
import { Epic2LNavDataEvents } from '../Navigation/Epic2LNavDataEvents';
import { Epic2PerformancePlan, getEpic2PerformanceDefinitions } from '../Performance';
import { Epic2FlightLogger } from './Epic2FlightLogger';
import { Epic2FmsEvents } from './Epic2FmsEvents';
import {
  AirwayLegType, ApproachDetails, ApproachProcedureDescription, DirectToState, Epic2ExtraLegDefinitionFlags, Epic2FlightPlans, Epic2UserDataKeys, FacilityInfo,
  InsertProcedureObject, InsertProcedureObjectLeg, RnavMinima
} from './Epic2FmsTypes';
import { Epic2FmsUtils } from './Epic2FmsUtils';

/** An EPIC 2 FMS. */
export class Epic2Fms {

  /** Set to true by FMC pages when the plan on this FMS instance is in modification and awaiting a cancel or exec. */
  public readonly planInMod = Subject.create<boolean>(false);

  /** Set to true when an event is received from the bus indicating that another instrument is in MOD on the plan. */
  public remotePlanInMod = false;

  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  public readonly ppos = new GeoPoint(0, 0);

  public readonly flightLogger = new Epic2FlightLogger(
    this.bus,
    this.inertialDataProvider,
    this.airspeedDataProvider,
    this.airGroundDataProvider
  );

  private readonly facRepo = FacilityRepository.getRepository(this.bus);
  public readonly facLoader = new FacilityLoader(this.facRepo);

  /** Information on our origin, arrival and destination facilities to save lookups.
   * When in MOD, this will reflect the current origin and destination in the MOD plan. */
  public facilityInfo: FacilityInfo = {
    originFacility: undefined,
    destinationFacility: undefined
  };

  public approachDetails: ApproachDetails = {
    approachLoaded: false,
    approachType: ApproachType.APPROACH_TYPE_UNKNOWN,
    approachRnavType: RnavTypeFlags.None,
    approachIsActive: false,
    approachIsCircling: false,
    approachName: '',
    approachRunway: '',
    missedApproachFacility: null,
    referenceFacility: null,
    finalApproachCourse: -1,
    selectedRnavMinima: RnavMinima.None
  };

  private readonly aircraftTrueTrack = ConsumerValue.create(null, 0);
  private readonly aircraftAltitudeFeet = ConsumerValue.create(null, 0);
  private readonly cdiSource = ConsumerValue.create<NavSourceId>(null, { type: NavSourceType.Gps, index: 1 });

  private approachFrequency = Subject.create<FacilityFrequency | undefined>(undefined);

  private missedApproachActive = false;

  /** Set to true when a leg is activated,
   * meaning that sequencing should be resumed once EXEC is pressed.
   * Should be reset whenever leaving MOD. */
  private legWasActivatedInModPlan = false;

  /** Set to true when a new DTO is created,
   * meaning its origin should be regularly updated while in MOD and when hitting EXEC.
   * Should be reset whenever leaving MOD. */
  public dtoWasCreatedInModPlan = Subject.create<boolean>(false);

  /** Set to true when a new vertical DTO is created,
   * meaning its origin should be regularly updated while in MOD and when hitting EXEC.
   * Should be reset whenever leaving MOD. */
  public verticalDtoWasCreatedInModPlan = false;


  /**
   * Set to true when the vertical DTO in the mod flight plan was automatic
   */
  public verticalDtoWasCreatedInModPlanWasAutomatic = false;

  private readonly lnavLegDistanceRemaining: ConsumerValue<number>;

  private readonly flightArea: ConsumerSubject<Epic2FlightArea>;

  // public readonly performancePlanRepository = new PerformancePlanRepository(this.flightPlanner, this.bus);
  public readonly performancePlanRepository = new PerformancePlanRepository('wt.epic2.perf', this.bus, this.flightPlanner, getEpic2PerformanceDefinitions(this.avionicsConfig));

  /**
   * Proxy to the currently relevant performance plan. This allows subbing to subscribables that always point to the right value,
   * whether we are in ACT or MOD, without worrying about switching around subscriptions.
   */
  public readonly performancePlanProxy = this.performancePlanRepository.createPerformancePlanProxy({
    onBeforeEdit: (property) => {
      if (property.differentiateBetweenFlightPlans) {
        this.getModFlightPlan();
      }
    },
    onAfterEdit: (property, newValue) => {
      if (!property.differentiateBetweenFlightPlans) {
        this.performancePlanRepository.triggerSync(Epic2FlightPlans.Active);

        const modPerfPlan = this.performancePlanRepository.forFlightPlanIndex(Epic2FlightPlans.Pending);
        modPerfPlan[property.key].set(newValue);

        this.performancePlanRepository.triggerSync(Epic2FlightPlans.Pending);
      }
    }
  });

  /**
   * Returns the active performance plan
   *
   * @returns the performance plan for the active flight plan index
   */
  public get activePerformancePlan(): Epic2PerformancePlan {
    return this.performancePlanRepository.getActivePlan();
  }

  /**
   * Syncs the primary flight plan data to the relevant performance plan values
   */
  private syncFlightPlanToPerformancePlan(): void {
    if (this.hasPrimaryModFlightPlan()) {
      const plan = this.getPrimaryFlightPlan();

      this.performancePlanProxy.takeoffAirportIcao.set(plan.originAirport ?? null);
      this.performancePlanProxy.takeoffRunway.set(plan.procedureDetails.originRunway ?? null);

      this.performancePlanProxy.approachAirportIcao.set(plan.destinationAirport ?? null);
      this.performancePlanProxy.approachRunway.set(plan.procedureDetails.destinationRunway ?? null);
    }
  }

  /**
   * Obtain the performance plan for FMC render
   * @returns the plan
   */
  private getPerformancePlanForFmcRender(): Epic2PerformancePlan {
    return this.performancePlanRepository.forFlightPlanIndex(this.getPlanIndexForFmcPage());
  }

  /**
   * Gets the performance plan for the ACT flight plan.
   * @returns the performance plan
   */
  public getActivePerformancePlan(): Epic2PerformancePlan {
    return this.performancePlanRepository.forFlightPlanIndex(Epic2FlightPlans.Active);
  }

  /**
   * Switches the performance proxy to use the FMC render plan
   */
  public switchPerformanceProxyToRenderPlan(): void {
    this.performancePlanProxy.switchToPlan(this.getPerformancePlanForFmcRender(), false);
  }

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param flightPlanner The flight planner.
   * @param verticalPathCalculator is the VNAV Path Calculator.
   * @param isPrimaryFms If this is the primary FMS instance.
   * @param avionicsConfig The avionics config.
   * @param inertialDataProvider The inertial data provider.
   * @param airspeedDataProvider The airspeed data provider.
   * @param airGroundDataProvider The air ground data provider.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly flightPlanner: FlightPlanner,
    protected readonly verticalPathCalculator: SmoothingPathCalculator,
    protected readonly isPrimaryFms: boolean,
    public readonly avionicsConfig: AvionicsConfig,
    public readonly inertialDataProvider: InertialDataProvider,
    public readonly airspeedDataProvider: AirspeedDataProvider,
    public readonly airGroundDataProvider: AirGroundDataProvider,
  ) {
    const sub = this.bus.getSubscriber<GNSSEvents & AdcEvents & NavEvents & FlightPlannerEvents & Epic2FmsEvents & Epic2LNavDataEvents>();

    this.lnavLegDistanceRemaining = ConsumerValue.create(this.bus.getSubscriber<LNavEvents>().on('lnav_leg_distance_remaining'), 0);

    this.flightArea = ConsumerSubject.create(sub.on('lnavdata_flight_area'), Epic2FlightArea.EnRoute);
    this.flightArea.sub(this.onFlightAreaChange, true);

    sub.on('gps-position').atFrequency(1).handle(pos => this.ppos.set(pos.lat, pos.long));

    this.aircraftTrueTrack.setConsumer(sub.on('track_deg_true'));
    this.aircraftAltitudeFeet.setConsumer(sub.on('indicated_alt'));
    this.cdiSource.setConsumer(sub.on('cdi_select'));

    sub.on('fplActiveLegChange').handle(data => this.onActiveLegChanged(data.type, data.planIndex));
    sub.on('fplLoaded').handle(this.onPlanLoaded);
    sub.on('fplCalculated').handle(this.onPlanCalculated);
    sub.on('fplCopied').handle(this.onPlanCopied);
    sub.on('fplCreated').handle(this.onPlanCreated);
    sub.on('fplOriginDestChanged').handle(this.onOriginDestinationChanged);

    // this.bus.getSubscriber<FmcBtnEvents>().on('fmcExecEvent').handle(this.onExecButtonPressed);
    this.performancePlanProxy.switchToPlan(this.activePerformancePlan, true);

    this.planInMod.sub(this.onPlanInMod);

    this.bus.getSubscriber<FmcSimVarEvents>().on('fmcExecActive').whenChanged().handle((v) => {
      const state = v === 1;
      this.remotePlanInMod = state;
    });

    sub.on('epic2_fms_approach_details_set').handle(this.onApproachDetailsSet);

  }

  private onFlightAreaChange = (cdiScale: Epic2FlightArea): void => {
    const canApproachActivate = this.canApproachActivate(cdiScale);
    if (canApproachActivate !== this.approachDetails.approachIsActive) {
      this.setApproachDetails(undefined, undefined, undefined, canApproachActivate);
    }
  };

  private onPlanInMod = (inMod: boolean): void => {
    this.switchPerformanceProxyToRenderPlan();

    if (!inMod) {
      // Need to update facility info on CANCEL MOD
      this.setFacilityInfo();
    }

    SimVar.SetSimVarValue(FmcSimVars.FmcExecActive, 'number', inMod ? 1 : 0);
  };

  private onPlanCreated = (ev: FlightPlanIndicationEvent): void => {
    this.applyCreationToPerformancePlans(ev);
  };

  private onPlanCalculated = (e: FlightPlanCalculatedEvent): void => {
    if (e.planIndex === Epic2FlightPlans.Active && this.planInMod.get()) {
      const plan = this.getModFlightPlan();

      if (this.verticalDtoWasCreatedInModPlan) {
        this.updateVerticalDtoOrigin(plan);
      }

      if (this.getDirectToState(Epic2FlightPlans.Pending)) {
        this.updateDtoOrigin(plan);
      }

      this.tryUpdatePposHoldPosition(plan);
    }
  };

  private onPlanLoaded = (): void => {
    this.checkApproachState().then();

    this.switchPerformanceProxyToRenderPlan();
    this.syncFlightPlanToPerformancePlan();
  };

  private onPlanCopied = (ev: FlightPlanCopiedEvent): void => {
    this.setFacilityInfo();
    this.ensureActiveHMSuspended();
    this.applyCopyToPerformancePlans(ev);

    if (ev.targetPlanIndex === Epic2FlightPlans.Active) {
      this.tryUnsuspend();
      this.syncFlightPlanToPerformancePlan();
    }

    const elevation = this.facilityInfo.destinationFacility && AirportUtils.getElevation(this.facilityInfo.destinationFacility);
    // Send destination ident and elevation through bus
    this.bus.getPublisher<Epic2FmsEvents>().pub('epic2_fms_landing_field_info',
      {
        ident: this.facilityInfo.destinationFacility?.icao ? ICAO.getIdent(this.facilityInfo.destinationFacility?.icao) : '',
        elevation: elevation ? Math.round(UnitType.METER.convertTo(elevation, UnitType.FOOT)) : -1
      }, true, true);
  };

  /** Initialises the flight plans on the primary instrument. */
  public async initFlightPlans(): Promise<void> {
    if (this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active)) {
      // Plan was synced
      return;
    }

    this.flightPlanner.createFlightPlan(Epic2FlightPlans.Active);
    this.flightPlanner.createFlightPlan(Epic2FlightPlans.Pending);
    this.flightPlanner.createFlightPlan(Epic2FlightPlans.Alternate);
    this.flightPlanner.createFlightPlan(Epic2FlightPlans.Secondary);

    this.emptyFlightPlan(Epic2FlightPlans.Active);
    this.emptyFlightPlan(Epic2FlightPlans.Pending);
    this.emptyFlightPlan(Epic2FlightPlans.Alternate);
    this.emptyFlightPlan(Epic2FlightPlans.Secondary);

    // TODO const simPlaneLoaded = await FlightPlanAsoboSync.loadFromGame(this);
    const simPlaneLoaded = false;

    if (simPlaneLoaded) {
      this.activatePlan();
    }
  }

  /**
   * Empties a specified flight plan.
   * @param planIndex The plan index to empty. Defaults to the active plan index.
   */
  public emptyFlightPlan(planIndex = Epic2FlightPlans.Active): void {
    if (!this.flightPlanner.hasFlightPlan(planIndex)) {
      return;
    }

    const plan = this.flightPlanner.getFlightPlan(planIndex);

    for (let i = plan.segmentCount - 1; i >= 0; i--) {
      plan.removeSegment(i);
    }

    plan.addSegment(0, FlightPlanSegmentType.Departure);
    plan.addSegment(1, FlightPlanSegmentType.Enroute);

    plan.removeOriginAirport();
    plan.removeDestinationAirport();

    plan.setDirectToData(-1);

    if (planIndex === Epic2FlightPlans.Active) {
      this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false, false, '', '', null, null, -1);
    }

    plan.setCalculatingLeg(0);
    plan.setLateralLeg(0);
    plan.setVerticalLeg(0);

    plan.deleteUserData(Epic2UserDataKeys.USER_DATA_KEY_ALTN);

    // since we don't delete the flight plan, we need to manually clear the wind plan
    // this.windPlanner.clearPlan(planIndex);
  }

  /**
   * Activates the pending or secondary plan (copies to active).
   * @param planIndex The plan to activate, defaults to pending plan.
   * @param emptySourcePlan Whether to empty the source plan after activating. Defaults to true.
   * @throws When an attempt is made to activate the active plan.
   */
  public activatePlan(planIndex = Epic2FlightPlans.Pending, emptySourcePlan = true): void {
    if (planIndex === Epic2FlightPlans.Active) {
      throw new Error('Cannot activate active flight plan!');
    }

    if (!this.flightPlanner.hasFlightPlan(planIndex)) {
      console.error('Tried to activate a flight plan that doesn\'t exist!', planIndex);
      return;
    }

    // FIXME update DTO and VDTO origin one final time

    this.flightPlanner.copyFlightPlan(planIndex, Epic2FlightPlans.Active, true);
    this.getPrimaryFlightPlan().calculate(0);
    if (emptySourcePlan) {
      this.emptyFlightPlan(planIndex);
      if (planIndex === Epic2FlightPlans.Pending) {
        this.planInMod.set(false);
      }
    }

    this.syncFlightPlanToPerformancePlan();
    this.performancePlanRepository.triggerSync(Epic2FlightPlans.Active);

    if (this.legWasActivatedInModPlan) {
      this.legWasActivatedInModPlan = false;
      this.resumeSequencing();
    }

    this.dtoWasCreatedInModPlan.set(false);
    this.checkApproachState();

    // TODO FlightPlanAsoboSync.SaveToGame(this);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private getCdiSource(): NavSourceId {
    return this.cdiSource.get();
  }

  /**
   * Checks whether an indexed flight plan exists.
   * @param index A flight plan index.
   * @returns Whether a flight plan at the specified index exists.
   */
  private hasFlightPlan(index: number): boolean {
    return this.flightPlanner.hasFlightPlan(index);
  }

  /**
   * Gets a specified flightplan, or by default the primary flight plan.
   * @param index The index of the flight plan.
   * @returns the requested flight plan
   * @throws Error if no flight plan exists at the specified index.
   */
  public getFlightPlan(index = Epic2FlightPlans.Active): FlightPlan {
    return this.flightPlanner.getFlightPlan(index);
  }

  /**
   * Checks whether the primary flight plan exists.
   * @returns Whether the primary flight plan exists.
   */
  public hasPrimaryFlightPlan(): boolean {
    return this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active);
  }

  /**
   * Gets the primary lateral flight plan.
   * @returns The primary flight plan.
   * @throws Error if the primary flight plan does not exist.
   */
  public getPrimaryFlightPlan(): FlightPlan {
    return this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active);
  }

  /**
   * Gets the primary vertical flight plan.
   * @returns the primary vertical flight plan.
   */
  private getPrimaryVerticalFlightPlan(): VerticalFlightPlan {
    return this.verticalPathCalculator.getVerticalFlightPlan(Epic2FlightPlans.Active);
  }

  /**
   * Checks whether the Primary Mod Flight Plan Exists - when modifications to the plan are being made.
   * @returns Whether the Primary Mod Flight Plan Exists flight plan exists.
   */
  private hasPrimaryModFlightPlan(): boolean {
    return this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Pending);
  }

  /**
   * Gets the Primary Mod Flight Plan Exists - when modifications to the plan are being made.
   * @returns The Primary Mod Flight Plan.
   * @throws Error if the Primary Mod Flight Plan flight plan does not exist.
   */
  private getPrimaryModFlightPlan(): FlightPlan {
    return this.flightPlanner.getFlightPlan(Epic2FlightPlans.Pending);
  }

  /**
   * Gets the primary mod vertical flight plan.
   * @returns the primary mod vertical flight plan.
   */
  private getPrimaryModVerticalFlightPlan(): VerticalFlightPlan {
    return this.verticalPathCalculator.getVerticalFlightPlan(Epic2FlightPlans.Pending);
  }

  /**
   * Handles when a modification is being made to the plan to ensure the plan is in MOD mode
   * @returns The Flight Plan to modify
   */
  public getModFlightPlan(): FlightPlan {
    if (!this.planInMod.get()) {
      this.flightPlanner.copyFlightPlan(Epic2FlightPlans.Active, Epic2FlightPlans.Pending, true);
      this.getPrimaryModFlightPlan().calculate(0);
      this.planInMod.set(true);
    }
    return this.getPrimaryModFlightPlan();
  }

  /**
   * Gets the plan index FMC pages should use to monitor events.
   * @returns A Flight Plan Index
   */
  public getPlanIndexForFmcPage(): number {
    if (this.planInMod.get()) {
      return Epic2FlightPlans.Pending;
    }
    return Epic2FlightPlans.Active;
  }

  /**
   * Gets the current lateral flight plan for the FMC pages based on whether the plan is in MOD or ACT.
   * @returns A Lateral Flight Plan
   */
  public getPlanForFmcRender(): FlightPlan {
    if (this.planInMod.get()) {
      return this.getPrimaryModFlightPlan();
    } else {
      return this.getPrimaryFlightPlan();
    }
  }

  /**
   * Gets the current vertical flight plan for the FMC pages based on whether the plan is in MOD or ACT.
   * @returns A Vertical Flight Plan
   */
  public getVerticalPlanForFmcRender(): VerticalFlightPlan {
    if (this.planInMod.get()) {
      return this.getPrimaryModVerticalFlightPlan();
    } else {
      return this.getPrimaryVerticalFlightPlan();
    }
  }

  /**
   * Checks whether the plan can go into MOD/be edited on this instance of WT21Fms.
   * @returns Whether to allow plan edits or not
   */
  public canEditPlan(): boolean {
    if (this.remotePlanInMod && !this.planInMod.get()) {
      return false;
    }

    return true;
  }

  private onOriginDestinationChanged = (e: FlightPlanOriginDestEvent): void => {
    if (e.planIndex === this.getPlanIndexForFmcPage()) {
      this.setFacilityInfo();
    }
  };

  /**
   * Sets the Facility Info cache in the Fms.
   */
  public async setFacilityInfo(): Promise<void> {
    const plan = this.getPlanForFmcRender();
    if (this.facilityInfo.originFacility?.icao !== plan.originAirport) {
      if (plan.originAirport) {
        const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.originAirport);
        this.facilityInfo.originFacility = facility ?? undefined;
      } else {
        this.facilityInfo.originFacility = undefined;
      }
    }
    if (this.facilityInfo.destinationFacility?.icao !== plan.destinationAirport) {
      if (plan.destinationAirport) {
        const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
        this.facilityInfo.destinationFacility = facility ?? undefined;
      } else {
        this.facilityInfo.destinationFacility = undefined;
      }
    }
  }

  /**
   * Gets the ALTN airport of a flight plan
   *
   * @param planIndex the flight plan index
   *
   * @returns the ALTN airport FS ICAO, or undefined
   */
  public getFlightPlanAlternate(planIndex?: number): string | undefined {
    const plan = this.getFlightPlan(planIndex);

    return plan.getUserData(Epic2UserDataKeys.USER_DATA_KEY_ALTN);
  }

  /**
   * Sets the ALTN airport of a flight plan
   *
   * @param facility the ALTN airport facility, or undefined
   */
  public setFlightPlanAlternate(facility: AirportFacility | undefined): void {
    const plan = this.getModFlightPlan();

    plan.setUserData(Epic2UserDataKeys.USER_DATA_KEY_ALTN, facility?.icao ?? undefined);
  }

  /**
   * After a plan copy, ensure that a now active HM causes a suspend
   */
  private ensureActiveHMSuspended(): void {
    const activeLegIndex = this.getPlanForFmcRender().activeLateralLeg;
    const activeLeg = this.getPlanForFmcRender().tryGetLeg(activeLegIndex === 0 ? 1 : activeLegIndex);

    // TODO considerations for hold exit
    if (activeLeg?.leg.type === LegType.HM) {
      this.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', true, true);
    }
  }

  /**
   * After a plan copy, ensure that we unsuspend if necessary
   */
  private tryUnsuspend(): void {
    if (this.isPrimaryFms) {
      const activeLegIndex = this.getPrimaryFlightPlan().activeLateralLeg;

      if (activeLegIndex >= 0) {
        const activeLeg = this.getPrimaryFlightPlan().tryGetLeg(activeLegIndex);

        if (activeLeg && Epic2FmsUtils.canLegBeAutoUnsuspended(activeLeg.leg.type)) {
          this.resumeSequencing();
        }
      }
    }
  }

  /** Resumes flight plan sequencing. */
  private resumeSequencing(): void {
    this.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', false, true);
  }

  /**
   * Handles when the CANCEL MOD button is pressed.
   */
  public cancelMod(): void {
    if (this.planInMod.get()) {
      this.legWasActivatedInModPlan = false;
      this.dtoWasCreatedInModPlan.set(false);
      this.emptyFlightPlan(Epic2FlightPlans.Pending);
      this.planInMod.set(false);
    }
  }

  /**
   * Applies flight plan copy events to the performance plan repository
   * @param ev plan copied event
   */
  private applyCopyToPerformancePlans(ev: FlightPlanCopiedEvent): void {
    if (!this.performancePlanRepository.has(ev.planIndex)) {
      this.performancePlanRepository.create(ev.planIndex);
    }

    this.performancePlanRepository.copy(ev.planIndex, ev.targetPlanIndex);
  }

  /**
   * Applies flight plan copy events to the performance plan repository
   * @param ev plan copied event
   */
  private applyCreationToPerformancePlans(ev: FlightPlanIndicationEvent): void {
    if (!this.performancePlanRepository.hasAnyPlan()) {
      this.performancePlanRepository.forFlightPlanIndex(ev.planIndex);
    }
  }

  /**
   * Handles when a flight plan active leg changes.
   * @param legType The type of flight plan active leg change.
   * @param planIndex The index of the plan whose active leg changed.
   */
  private onActiveLegChanged(legType: ActiveLegType, planIndex: number): void {
    if (legType === ActiveLegType.Lateral && planIndex === 0) {
      const activePlan = this.flightPlanner.getActiveFlightPlan();
      if (activePlan.length < 1 || this.missedApproachActive) {
        this.setApproachDetails(undefined, undefined, undefined, false);
      }
    }
  }

  /**
   * A method to check the current approach state.
   */
  private async checkApproachState(): Promise<void> {
    const plan = this.getFlightPlan();
    let approachLoaded = false;
    let approachIsActive = false;
    let approachType: ExtendedApproachType | undefined;
    let approachRnavType: RnavTypeFlags | undefined;
    let approachIsCircling = false;
    let approachName = '';
    let approachRunway = '';
    let missedApproachFacility = null;
    let referenceFacility = null;
    let finalApproachCourse = -1;
    if (plan.destinationAirport && (plan.procedureDetails.approachIndex > -1 || this.getFlightPlanVisualApproach(plan.planIndex) !== undefined)) {
      approachLoaded = true;
      if (plan.length > 0 && plan.activeLateralLeg < plan.length && plan.activeLateralLeg > 0) {
        const segment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
        approachIsActive = segment.segmentType === FlightPlanSegmentType.Approach;
      }
      if (plan.procedureDetails.approachIndex > -1) {
        const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
        const approach = facility.approaches[plan.procedureDetails.approachIndex];
        if (approach) {
          approachType = approach.approachType;
          approachRnavType = Epic2FmsUtils.getBestRnavType(approach.rnavTypeFlags);
          approachIsCircling = !approach.runway;
          approachName = Epic2FmsUtils.getApproachNameAsEfisString(approach);
          approachRunway = RunwayUtils.getRunwayNameString(approach.runwayNumber, approach.runwayDesignator, true, 'RW');
          if (Epic2FmsUtils.approachHasNavFrequency(approach)) {
            referenceFacility = (await ApproachUtils.getReferenceFacility(approach, this.facLoader) as VorFacility | undefined) ?? null;
          }
          finalApproachCourse = await this.getFinalApproachCourse(facility, approach);

          const mapIndex = VNavUtils.getMissedApproachLegIndex(plan);
          const mapLeg = mapIndex >= 0 ? plan.tryGetLeg(mapIndex) : null;
          missedApproachFacility = mapLeg && mapLeg.leg.fixIcao && mapLeg.leg.fixIcao !== ICAO.emptyIcao
            ? await this.facLoader.getFacility(ICAO.getFacilityType(mapLeg.leg.fixIcao), mapLeg.leg.fixIcao)
            : null;
        }
      } else {
        approachType = AdditionalApproachType.APPROACH_TYPE_VISUAL;
        approachRnavType = RnavTypeFlags.None;
      }

    }
    this.setApproachDetails(
      approachLoaded,
      approachType,
      approachRnavType,
      approachIsActive,
      approachIsCircling,
      approachName,
      approachRunway,
      missedApproachFacility,
      referenceFacility,
      finalApproachCourse,
    );
  }

  /**
   * Will run direct to recovery, restoring any legs removed by the direct to.
   * @throws if the active leg is not the target of a dto
   */
  public directToRecovery(): void {
    const plan = this.getModFlightPlan();
    const activeLegGlobalIndex = plan.activeLateralLeg - 3;
    const activeLegSegment = plan.getSegmentIndex(activeLegGlobalIndex);
    const activeLegIndex = plan.getSegmentLegIndex(activeLegGlobalIndex);

    if (plan.directToData.segmentIndex !== activeLegSegment && plan.directToData.segmentLegIndex !== activeLegIndex) {
      throw Error('[DTO Recovery] was called when the active leg was not the target of a DTO');
    }

    const dtoOriginalLeg = plan.getUserData<number>(Epic2UserDataKeys.USER_DATA_KEY_DIRECT_TO_ORIGIN);
    this.removeDirectToExisting(Epic2FlightPlans.Pending, dtoOriginalLeg, true, true);
  }

  /**
   * Removes the direct to existing legs from the primary flight plan. If a direct to existing is currently active,
   * this will effectively cancel it.
   * @param planIndex The flight plan index.
   * @param lateralLegIndex The index of the leg to set as the active lateral leg after the removal operation. Defaults
   * to the index of the current active primary flight plan leg.
   * @param calculate Whether to calculate the flight plan
   * @param resetOrigin Whether to reset the dto origin variable
   */
  public removeDirectToExisting(planIndex = Epic2FlightPlans.Pending, lateralLegIndex?: number, calculate = true, resetOrigin = false): void {
    const plan = this.getFlightPlan(planIndex);
    const directToData = plan.directToData;
    if (directToData && directToData.segmentIndex > -1) {
      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);

      const activateIndex = lateralLegIndex ?? plan.activeLateralLeg;
      const adjustedActivateIndex = activateIndex - Utils.Clamp(activateIndex - (plan.getSegment(directToData.segmentIndex).offset + directToData.segmentLegIndex), 0, 3);

      plan.setDirectToData(-1, true);
      plan.setCalculatingLeg(adjustedActivateIndex);
      plan.setLateralLeg(adjustedActivateIndex);

      if (calculate) {
        plan.calculate(0);
      }

      if (resetOrigin) {
        plan.setUserData(Epic2UserDataKeys.USER_DATA_KEY_DIRECT_TO_ORIGIN, undefined);
      }
    }
  }

  /**
   * Method to cleanup any legs in segments that exist after the Approach/Arrival Segments.
   * @param plan The Mod Flight Plan.
   */
  private cleanupLegsAfterApproach(plan: FlightPlan): void {
    if (plan.procedureDetails.arrivalIndex > -1 || plan.procedureDetails.approachIndex > -1 || plan.getUserData('visual_approach') !== undefined) {

      while (plan.getSegment(plan.segmentCount - 1).segmentType === FlightPlanSegmentType.Enroute) {
        this.planRemoveSegment(plan.segmentCount - 1);
      }
    }
  }

  /**
   * Gets the current Direct To State.
   * @param planIndex The Plan Index to check.
   * @returns the DirectToState.
   */
  public getDirectToState(planIndex = Epic2FlightPlans.Active): DirectToState {
    if (!this.hasFlightPlan(planIndex)) {
      return DirectToState.NONE;
    }

    const plan = this.getFlightPlan(planIndex);
    const directDataExists = plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1;
    if (!directDataExists) {
      return DirectToState.NONE;
    }

    // Guarding against rare cases where the segment with the dto has been removed and the dt odata hasn't been updated yet.
    const isDtoSegmentInPlan = plan.segmentCount >= plan.directToData.segmentIndex;
    if (!isDtoSegmentInPlan) {
      return DirectToState.NONE;
    }

    const dtoLegGlobalIndex = plan.getLegIndexFromLeg(plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex]);
    // We subtract 3 to get the index of the original DTO target leg
    const doesDtoLegMatchActiveLeg = dtoLegGlobalIndex === plan.activeLateralLeg - 3;
    // TODO This seems to be returning false positives when in MOD in certain scenarios,
    // TODO like after passing the TO leg of a DTO, then trying to add a new DTO
    if (doesDtoLegMatchActiveLeg) {
      return DirectToState.TOEXISTING;
    } else {
      return DirectToState.NONE;
    }
  }

  /**
   * Gets the ICAO string of the current Direct To target.
   * @returns The ICAO string of the current Direct To target, or undefined if Direct To is not active.
   */
  public getDirectToTargetIcao(): string | undefined {
    return this.getDirectToLeg()?.fixIcao;
  }

  /**
   * Gets the current DTO Target Flight Plan Leg.
   * @returns the FlightPlanLeg.
   */
  private getDirectToLeg(): FlightPlanLeg | undefined {
    switch (this.getDirectToState()) {
      case DirectToState.TOEXISTING: {
        const plan = this.getFlightPlan();
        return plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + 3].leg;
      }
    }
    return undefined;
  }

  /**
   * Checks if a segment is the first enroute segment that is not an airway.
   * @param segmentIndex is the segment index of the segment to check
   * @returns whether or not the segment is the first enroute segment that is not an airway.
   */
  public isFirstEnrouteSegment(segmentIndex: number): boolean {
    const plan = this.getFlightPlan();
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      if (segment.segmentType === FlightPlanSegmentType.Enroute && !segment.airway) {
        return i === segmentIndex;
      }
    }
    return false;
  }

  /**
   * Adds a user facility.
   * @param userFacility the facility to add.
   */
  public addUserFacility(userFacility: UserFacility): void {
    this.facRepo.add(userFacility);
  }

  /**
   * Removes a user facility.
   * @param userFacility the facility to remove.
   */
  public removeUserFacility(userFacility: UserFacility): void {
    this.facRepo.remove(userFacility);
  }

  /**
   * Gets all user facilities.
   *
   * @returns an array of user facilities
   */
  public getUserFacilities(): UserFacility[] {
    const ret: UserFacility[] = [];

    // FIXME no.
    this.facRepo.forEach((fac) => {
      if (FacilityUtils.isFacilityType(fac, FacilityType.USR)) {
        ret.push(fac);
      }
    });

    return ret;
  }

  /**
   * Adds a visual or runway facility from the FlightPlanLeg.
   * @param leg the leg to build the facility from.
   * @param visualRunwayDesignation is the visual runway this facility belongs to.
   */
  private addVisualFacilityFromLeg(leg: FlightPlanLeg, visualRunwayDesignation: string): void {
    const fac: VisualFacility = {
      icao: leg.fixIcao,
      icaoStruct: ICAO.copyValue(leg.fixIcaoStruct),
      lat: leg.lat !== undefined ? leg.lat : 0,
      lon: leg.lon !== undefined ? leg.lon : 0,
      approach: `VISUAL ${visualRunwayDesignation}`,
      city: '',
      name: `${visualRunwayDesignation} - ${ICAO.getIdent(leg.fixIcao)}`,
      region: '',
    };
    this.facRepo.add(fac);
  }

  /**
   * Method to insert a waypoint to the flightplan.
   * @param facility is the new facility to add a leg to.
   * @param segmentIndex is index of the segment to add the waypoint to
   * @param legIndex is the index to insert the waypoint (if none, append)
   * @param addDisco whether to insert a discontinuity after it
   * @returns whether the waypoint was successfully inserted.
   */
  public insertWaypoint(facility: Facility, segmentIndex?: number, legIndex?: number, addDisco = true): boolean {
    const leg = FlightPlan.createLeg({
      type: LegType.TF,
      fixIcaoStruct: facility.icaoStruct,
    });

    let plan = this.getPlanForFmcRender();
    let createdModPlan = false;

    if (segmentIndex === undefined) {
      const lastSegment = plan.segmentCount > 0 ? plan.getSegment(plan.segmentCount - 1) : undefined;

      if (lastSegment) {
        if (lastSegment.segmentType !== FlightPlanSegmentType.Enroute) {
          segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, lastSegment.segmentIndex + 1);

          if (plan.planIndex !== Epic2FlightPlans.Pending) {
            createdModPlan = true;
          }

          plan = this.getModFlightPlan();

        } else {
          segmentIndex = lastSegment.segmentIndex;
        }
      } else {
        return false;
      }
    }

    const segment = plan.getSegment(segmentIndex);
    const prevLeg = plan.getPrevLeg(segmentIndex, legIndex ?? Infinity);
    const nextLeg = plan.getNextLeg(segmentIndex, legIndex === undefined ? Infinity : legIndex - 1);

    // Make sure we are not inserting a duplicate leg
    if ((prevLeg && this.isDuplicateLeg(prevLeg.leg, leg)) || (nextLeg && this.isDuplicateLeg(leg, nextLeg.leg))) {
      if (createdModPlan) {
        this.cancelMod();
      }
      return false;
    }

    // Make sure we are not inserting a leg into a direct to sequence
    if (prevLeg) {
      const isInDirectTo = BitFlags.isAll(prevLeg?.flags, LegDefinitionFlags.DirectTo);
      const isDirectToTarget = BitFlags.isAll(prevLeg?.flags, Epic2ExtraLegDefinitionFlags.DirectToTarget);

      if (isInDirectTo && !isDirectToTarget) {
        if (createdModPlan) {
          this.cancelMod();
        }
        return false;
      }
    }

    plan = this.getModFlightPlan();

    // Deal with whether this insert is in an airway segment
    if (segment.airway) {

      //check to see if this insert will leave more than 1 airway leg
      if (!legIndex || segment.legs.length - legIndex < 3) {
        // we don't need another airway segment,
        // we just need to add the inserted segment, the remaining airway segments into the next enroute segment

        if (legIndex === 0) {
          // if we're inserting to the first index in an airway segment, we can just stick it at the end of the previous segment
          const prevSegment = plan.getSegment(segmentIndex - 1);
          if (prevSegment.airway || prevSegment.segmentType !== FlightPlanSegmentType.Enroute) {
            //the prev segment is an airway, departure, arrival, approach or destination, so we need to add an enroute segment
            this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex - 1);
          }
          //now we can add the new leg into the next enroute segment
          this.planAddLeg(segmentIndex - 1, leg);
        } else {
          const nextSegment = plan.getSegment(segmentIndex + 1);
          if (nextSegment.airway || nextSegment.segmentType !== FlightPlanSegmentType.Enroute) {
            //the next segment is an airway, arrival, approach or destination, so we need to add an enroute segment
            this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
          }
          //now we can add the new leg into the next enroute segment
          this.planAddLeg(segmentIndex + 1, leg, 0);

          //get the legs after the insert index from the first airway segment, if any, and move them to the second airway segment
          legIndex = legIndex ? legIndex : segment.legs.length - 1;
          const legsToMove: FlightPlanLeg[] = [];
          const legsLength = segment.legs.length;
          for (let i = legIndex; i < legsLength; i++) {
            legsToMove.push(segment.legs[i].leg);
          }
          for (let j = legsLength - 1; j >= legIndex; j--) {
            this.planRemoveLeg(segmentIndex, j, true, true);
          }
          for (let k = 0; k < legsToMove.length; k++) {
            this.planAddLeg(segmentIndex + 1, legsToMove[k], k + 1);
          }
        }
      } else {
        //we need to create a new airway segment

        //split the segment into three
        this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
        this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
        const newAirwaySegment = plan.getSegment(segmentIndex + 2);

        //add the leg to the new enroute segment (between the old and new airway segments)
        this.planAddLeg(segmentIndex + 1, leg);

        //get the legs after the insert index from the first airway segment, if any, and move them to the second airway segment
        legIndex = legIndex ? legIndex : segment.legs.length - 1;
        const legsToMove: FlightPlanLeg[] = [];
        const legsLength = segment.legs.length;
        for (let i = legIndex; i < legsLength; i++) {
          legsToMove.push(segment.legs[i].leg);
        }
        for (let j = legsLength - 1; j >= legIndex; j--) {
          this.planRemoveLeg(segmentIndex, j, true, true);
        }
        this.planAddLeg(segmentIndex + 1, legsToMove[0]);
        for (let k = 1; k < legsToMove.length; k++) {
          this.planAddLeg(segmentIndex + 2, legsToMove[k]);
        }
        const airway = segment.airway?.split('.');
        segment.airway = airway && airway[0] ? airway[0] + '.' + segment.legs[legIndex - 1].name : segment.airway;
        plan.setAirway(segmentIndex, segment.airway);
        newAirwaySegment.airway = airway && airway[0] ? airway[0] + '.' + newAirwaySegment.legs[newAirwaySegment.legs.length - 1].name : segment.airway;
        plan.setAirway(segmentIndex + 2, newAirwaySegment.airway);
      }
      return true;
    } else {
      // WT21 Addition; manage where legs are added from the legs page
      // TODO this maybe needs to go before the airway section
      switch (segment.segmentType) {
        case FlightPlanSegmentType.Arrival:
          if (legIndex === 0) {
            segmentIndex -= 1;
            legIndex = undefined;
          } else if (!legIndex) {
            if (segmentIndex === plan.segmentCount - 1 || plan.getSegment(segmentIndex + 1).segmentType !== FlightPlanSegmentType.Enroute) {
              segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
            } else {
              segmentIndex += 1;
            }
            legIndex = 0;
          }
          break;
        case FlightPlanSegmentType.Approach:
          if (legIndex === 0) {
            if (plan.procedureDetails.arrivalIndex > -1 && plan.getSegment(segmentIndex - 1).segmentType !== FlightPlanSegmentType.Enroute) {
              segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex);
              legIndex = undefined;
            } else {
              segmentIndex -= 1;
              legIndex = undefined;
            }
          } else if (!legIndex) {
            if (segmentIndex === plan.segmentCount - 1) {
              segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute);
            }
          }
          break;
      }

      const addedLeg = this.planAddLeg(segmentIndex, leg, legIndex);

      const addedLegGlobalIndex = plan.getLegIndexFromLeg(addedLeg);
      const addedLegSegment = plan.getSegmentFromLeg(addedLeg);

      if (addedLegSegment && addDisco) {
        const addedLegLocalIndex = plan.getSegmentLegIndex(addedLegGlobalIndex);

        const legAfter = plan.getNextLeg(addedLegSegment?.segmentIndex, addedLegLocalIndex);

        if (legAfter && !Epic2FmsUtils.isDiscontinuityLeg(legAfter.leg.type)) {
          this.planAddLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), addedLegLocalIndex + 1);
        }
      }

      return true;
    }
  }

  /**
   * Removes a leg to a waypoint from the primary flight plan.
   * @param segmentIndex The index of the segment containing the leg to remove.
   * @param segmentLegIndex The index of the leg to remove in its segment.
   * @param skipFafMapCheck Whether to force deletion regardless of FAF/MAP flags
   * @param skipHoldDelete Whether to skip deleting holds associated with this leg
   * @returns Whether the waypoint was successfully removed.
   */
  public removeWaypoint(segmentIndex: number, segmentLegIndex: number, skipFafMapCheck = false, skipHoldDelete = false): boolean {
    let plan = this.getPlanForFmcRender();

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg) {
      return false;
    }

    const legGlobalIndex = plan.getLegIndexFromLeg(leg);

    if (!skipFafMapCheck && (!leg || BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.FAF | FixTypeFlags.MAP))) {
      return false;
    }

    const legDeleted = this.planRemoveLeg(segmentIndex, segmentLegIndex);

    if (legDeleted) {
      plan = this.getModFlightPlan();

      const prevLeg = plan.tryGetLeg(legGlobalIndex - 1);
      let nextLeg = plan.tryGetLeg(legGlobalIndex);

      if (!skipHoldDelete && legDeleted && nextLeg && Epic2FmsUtils.isHoldAtLeg(nextLeg.leg.type)) {
        if (plan.tryGetLeg(segmentIndex, segmentLegIndex)) {
          this.planRemoveLeg(segmentIndex, segmentLegIndex, true, true, true);
        }

        nextLeg = plan.tryGetLeg(legGlobalIndex);
      }

      const alreadyDisco = (prevLeg && Epic2FmsUtils.isDiscontinuityLeg(prevLeg.leg.type)) || (nextLeg && Epic2FmsUtils.isDiscontinuityLeg(nextLeg.leg.type));

      if (!Epic2FmsUtils.isDiscontinuityLeg(leg.leg.type) && !alreadyDisco) {
        this.planAddLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), segmentLegIndex);
      }
    }

    return legDeleted;
  }

  /**
   * Sets the speed and altitude constraints for a flight plan leg.
   * @param globalLegIndex The global index of the leg to modify.
   * @param verticalData The vertical data to set on the leg. Will be merged with existing data.
   * @returns Whether the data was set.
   */
  public setUserConstraint(globalLegIndex: number, verticalData: Omit<VerticalData, 'phase'>): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getModFlightPlan();
    if (!plan) {
      return false;
    }

    const segment = plan.tryGetSegment(plan.getSegmentIndex(globalLegIndex));
    const leg = segment?.legs[globalLegIndex - segment.offset];

    if (segment === null || leg === undefined) {
      return false;
    }

    const isDeparture = segment.segmentType === FlightPlanSegmentType.Departure || segment.segmentType === FlightPlanSegmentType.Origin;
    const isMapr = BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach);

    plan.setLegVerticalData(
      globalLegIndex,
      { phase: isDeparture || isMapr ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent, ...verticalData },
      true
    );

    plan.calculate(plan.activeLateralLeg - 1);
    return true;
  }

  /**
   * Gets the airway leg type of a flight plan leg.
   * @param plan The flight plan containing the query leg.
   * @param segmentIndex The index of the flight plan segment containing the query leg.
   * @param segmentLegIndex The index of the query leg in its segment.
   * @returns The airway leg type of the query leg.
   */
  private getAirwayLegType(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): AirwayLegType {
    const segment = plan.getSegment(segmentIndex);
    const segmentIsAirway = segment.airway !== undefined;
    const nextSegmentIsAirway = segmentIndex + 1 < plan.segmentCount && plan.getSegment(segmentIndex + 1).airway !== undefined;
    const legIsLast = segmentLegIndex == segment.legs.length - 1;
    if ((segmentIsAirway && legIsLast && nextSegmentIsAirway)) {
      return AirwayLegType.EXIT_ENTRY;
    }
    if ((legIsLast && nextSegmentIsAirway)) {
      return AirwayLegType.ENTRY;
    }
    if (segmentIsAirway) {
      if (legIsLast) {
        return AirwayLegType.EXIT;
      }
      return AirwayLegType.ONROUTE;
    }
    return AirwayLegType.NONE;
  }

  /**
   * Method to add a new origin airport and runway to the flight plan.
   * @param airport is the facility of the origin airport.
   * @param runway is the onewayrunway
   */
  public setOrigin(airport: AirportFacility | undefined, runway?: OneWayRunway): void {
    const plan = this.getModFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

    if (airport) {
      if (plan.originAirport !== airport.icao) {
        plan.removeOriginAirport();
        plan.setOriginAirport(airport.icao);
      }
      plan.setOriginRunway(runway);
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
      this.planAddOriginDestinationLeg(true, segmentIndex, airport, runway);

      const prevLeg = plan.getPrevLeg(segmentIndex, 1);
      const nextLeg = plan.getNextLeg(segmentIndex, 0);
      if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
        this.planRemoveDuplicateLeg(prevLeg, nextLeg);
      }
    } else {
      plan.removeOriginAirport();
      this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false, false, '', '', null, null, -1);
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
    }

    this.facilityInfo.originFacility = airport;

    plan.calculate(0);
  }

  /**
   * Method to add a new destination airport and runway to the flight plan.
   * @param airport is the facility of the destination airport.
   * @param runway is the selected runway at the destination facility.
   */
  public setDestination(airport: AirportFacility | undefined, runway?: OneWayRunway): void {
    const plan = this.getModFlightPlan();
    const destSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);

    plan.setProcedureDetails({
      arrivalIndex: -1,
      arrivalRunway: undefined,
      arrivalTransitionIndex: -1,
      arrivalRunwayTransitionIndex: -1,
      approachIndex: -1,
      approachTransitionIndex: -1,
    });
    this.bus.getPublisher<Epic2FmsEvents>().pub('epic2_fms_approach_details_set', this.approachDetails, true);
    if (airport) {
      plan.setDestinationAirport(airport.icao);
      plan.setDestinationRunway(runway);

      this.planClearSegment(destSegmentIndex, FlightPlanSegmentType.Destination);

      const hasArrival = plan.procedureDetails.arrivalIndex > -1;
      const hasApproach = plan.procedureDetails.approachIndex > -1;

      if (!hasArrival && !hasApproach) {
        this.planAddOriginDestinationLeg(false, destSegmentIndex, airport, runway);
      }
    } else {
      plan.removeDestinationAirport();
    }

    this.facilityInfo.destinationFacility = airport;

    plan.calculate(0);
  }

  /**
   * Method to ensure only one segment of a specific type exists in the flight plan and optionally insert it if needed.
   * @param segmentType is the segment type we want to evaluate.
   * @param insert is whether to insert the segment if missing
   * @returns segmentIndex of the only segment of this type in the flight plan, -1 if insert is false and and the segment does not exist.
   */
  private ensureOnlyOneSegmentOfType(segmentType: FlightPlanSegmentType, insert = true): number {
    const plan = this.getModFlightPlan();
    let segmentIndex: number;

    const selectedSegments = plan.segmentsOfType(segmentType);
    const segmentIndexArray: number[] = [];

    for (const element of selectedSegments) {
      segmentIndexArray.push(element.segmentIndex);
    }

    if (segmentIndexArray.length === 0) {
      if (insert) {
        segmentIndex = this.planInsertSegmentOfType(segmentType);
      } else {
        segmentIndex = -1;
      }
    } else if (segmentIndexArray.length > 1) {
      for (let i = 0; i < segmentIndexArray.length; i++) {
        this.planRemoveSegment(segmentIndexArray[i]);
      }
      segmentIndex = this.planInsertSegmentOfType(segmentType);
    } else {
      segmentIndex = segmentIndexArray[0];
    }
    return segmentIndex;
  }

  /**
   * Gets an array of legs in a flight plan segment ending with the active leg that are to be displaced if the segment
   * is deleted.
   * @param plan The flight plan containing the segment for which to get the array.
   * @param segmentIndex The index of the segment for which to get the array.
   * @returns An array of legs in the specified flight plan segment ending with the active leg that are to be
   * displaced if the segment is deleted, or `undefined` if the segment does not contain the active leg.
   */
  private getSegmentActiveLegsToDisplace(plan: FlightPlan, segmentIndex: number): LegDefinition[] | undefined {
    const segment = plan.getSegment(segmentIndex);
    const activeLeg = segment.legs[plan.activeLateralLeg - segment.offset] as LegDefinition | undefined;

    // If active leg is not in the segment to be deleted, then nothing needs to be displaced
    if (!activeLeg) {
      return undefined;
    }

    if (BitFlags.isAll(activeLeg.flags, LegDefinitionFlags.DirectTo)) {
      // Active leg is part of a direct-to.

      if (plan.directToData.segmentIndex !== segmentIndex || plan.directToData.segmentLegIndex + Epic2FmsUtils.DTO_LEG_OFFSET >= segment.legs.length) {
        // If the plan's direct to data does not match what we would expect given the active leg, then something has
        // gone wrong with the flight plan's state and we will just bail.
        return undefined;
      }

      return segment.legs.slice(0, plan.directToData.segmentLegIndex + Epic2FmsUtils.DTO_LEG_OFFSET + 1);
    } else {
      // Active leg is not part of a direct-to. In this case we return every leg in the active segment prior to and
      // including the active leg.

      return segment.legs.slice(0, plan.activeLateralLeg - segment.offset + 1);
    }
  }

  /**
   * Displaces a sequence of flight plan legs contained in a now-removed segment ending with the active leg into a new
   * flight plan segment. If the displaced active leg was a direct-to leg, then a new direct-to will be created to the
   * displaced target leg. Otherwise, the active leg is set to the displaced active leg.
   * @param plan The flight plan into which to displace the legs.
   * @param segmentIndex The index of the flight plan segment into which to displace the legs.
   * @param activeLegArray The sequence of flight plan legs to displace. The sequence should contain all of the legs
   * contained in the former active segment up to and including the active leg.
   * @param insertAtEnd Whether to insert the displaced legs at the end of the segment instead of the beginning.
   */
  private displaceActiveLegsIntoSegment(plan: FlightPlan, segmentIndex: number, activeLegArray: LegDefinition[], insertAtEnd: boolean): void {
    Epic2FmsUtils.removeDisplacedActiveLegs(plan);

    const segment = plan.getSegment(segmentIndex);

    const insertAtIndex = insertAtEnd ? segment.legs.length : 0;

    if (insertAtEnd) {
      plan.addLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), insertAtIndex, Epic2ExtraLegDefinitionFlags.DisplacedActiveLeg);
    } else {
      const segmentFirstLeg = segment.legs[0];

      // We don't want to insert duplicate discontinuities if there is already one at the start of the segment
      const discontinuityAlreadyPresent = segmentFirstLeg && Epic2FmsUtils.isDiscontinuityLeg(segmentFirstLeg.leg.type);

      if (!discontinuityAlreadyPresent) {
        plan.addLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), insertAtIndex, Epic2ExtraLegDefinitionFlags.DisplacedActiveLeg);
      }
    }

    // The active leg is guaranteed to be the last leg in the array.
    const activeLeg = activeLegArray[activeLegArray.length - 1];
    const isActiveLegDto = BitFlags.isAll(activeLeg.flags, LegDefinitionFlags.DirectTo);
    const dtoTargetLegIndex = isActiveLegDto ? activeLegArray.length - 1 - Epic2FmsUtils.DTO_LEG_OFFSET : undefined;
    const dtoTargetLeg = dtoTargetLegIndex !== undefined ? activeLegArray[dtoTargetLegIndex] : undefined;

    let displacedDtoTargetLegIndex = undefined;

    // Add all displaced legs to the segment, skipping any active direct-to legs.
    for (let i = dtoTargetLegIndex ?? activeLegArray.length - 1; i >= 0; i--) {
      const leg = activeLegArray[i];

      const newLeg = FlightPlan.createLeg(leg.leg);

      // Displaced legs aren't a part of a procedure anymore, so we clear the fix type flags
      newLeg.fixTypeFlags = 0;

      plan.addLeg(segmentIndex, newLeg, insertAtIndex, Epic2ExtraLegDefinitionFlags.DisplacedActiveLeg);

      // Preserve altitude and speed restrictions on the active leg or direct-to target leg only.
      if (leg === activeLeg || leg === dtoTargetLeg) {
        plan.setLegVerticalData(segmentIndex, insertAtIndex, leg.verticalData);
      }

      // Check if we are displacing an inactive direct-to leg. If so, mark the index of the corresponding displaced
      // direct-to target leg so we can deal with it below.
      if (displacedDtoTargetLegIndex === undefined && BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo)) {
        displacedDtoTargetLegIndex = i - Epic2FmsUtils.DTO_LEG_OFFSET + insertAtIndex;
      }
    }

    // If we displaced an inactive direct-to sequence, then we need to update the plan's direct-to data to match the
    // indexes of the now displaced direct-to target leg.
    if (displacedDtoTargetLegIndex !== undefined) {
      plan.setDirectToData(segmentIndex, displacedDtoTargetLegIndex);
    }

    if (dtoTargetLegIndex !== undefined) {
      const course = activeLeg.leg.type === LegType.CF ? activeLeg.leg.course : undefined;
      this.createDirectTo(segmentIndex, dtoTargetLegIndex + insertAtIndex, undefined, course, undefined);
    } else {
      const newActiveLegIndex = segment.offset + insertAtIndex + activeLegArray.length - 1;
      plan.setCalculatingLeg(newActiveLegIndex);
      plan.setLateralLeg(newActiveLegIndex);
    }
  }

  /**
   * Method to add or replace a departure procedure in the flight plan.
   * @param facility is the facility that contains the procedure to add.
   * @param departureIndex is the index of the departure
   * @param departureRunwayIndex is the index of the runway transition
   * @param enrouteTransitionIndex is the index of the enroute transition
   * @param oneWayRunway is the one way runway to set as the origin leg.
   */
  public insertDeparture(
    facility: AirportFacility,
    departureIndex: number,
    departureRunwayIndex: number,
    enrouteTransitionIndex: number,
    oneWayRunway?: OneWayRunway | undefined
  ): void {
    const plan = this.getModFlightPlan();
    plan.setDeparture(facility.icao, departureIndex, enrouteTransitionIndex, departureRunwayIndex);
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

    // Grabbing the active legs (if there are any) in the existing departure semgent,
    // so that we can put them somewhere after clearing the segment.
    const activeLegArray = !Simplane.getIsGrounded() && plan.activeLateralLeg > 0 ? this.getSegmentActiveLegsToDisplace(plan, segmentIndex) : undefined;

    this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);

    const insertProcedureObject: InsertProcedureObject = this.buildDepartureLegs(facility, departureIndex, enrouteTransitionIndex, departureRunwayIndex, oneWayRunway);

    if (plan.originAirport !== facility.icao) {
      plan.setOriginAirport(facility.icao);
    }
    plan.setOriginRunway(oneWayRunway);

    insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(segmentIndex, l, undefined, Epic2ExtraLegDefinitionFlags.ProcedureLeg));

    const nextLeg = plan.getNextLeg(segmentIndex, Infinity);
    const depSegment = plan.getSegment(segmentIndex);
    const lastDepLeg = depSegment.legs[depSegment.legs.length - 1];

    if (nextLeg && lastDepLeg && this.isDuplicateLeg(lastDepLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(lastDepLeg, nextLeg);
    }

    this.generateSegmentVerticalData(plan, segmentIndex);

    if (activeLegArray) {
      this.displaceActiveLegsIntoSegment(plan, segmentIndex, activeLegArray, false);
    }

    plan.calculate(0);
  }

  /**
   * Method to insert the arrival legs.
   * @param facility is the facility to build legs from.
   * @param procedureIndex is the procedure index to build legs from.
   * @param enrouteTransitionIndex is the enroute transition index to build legs from.
   * @param runwayTransitionIndex is the runway transition index to build legs from.
   * @param oneWayRunway is the one way runway, if one is specified in the procedure.
   * @returns InsertProcedureObject to insert into the flight plan.
   */
  private buildDepartureLegs(facility: AirportFacility,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number,
    oneWayRunway?: OneWayRunway): InsertProcedureObject {

    const departure = facility.departures[procedureIndex];
    const enRouteTransition = departure.enRouteTransitions[enrouteTransitionIndex];
    const runwayTransition = departure.runwayTransitions[runwayTransitionIndex];
    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    if (runwayTransition !== undefined && runwayTransition.legs.length > 0) {
      for (const leg of runwayTransition.legs) {
        insertProcedureObject.procedureLegs.push(FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(leg)));
      }
    }

    // If the procedure did not start with a runway leg, we must insert an origin leg at the start of the procedure legs.
    if (insertProcedureObject.procedureLegs[0]?.fixIcaoStruct.type !== IcaoType.Runway) {
      if (oneWayRunway) {
        insertProcedureObject.procedureLegs.unshift(Epic2FmsUtils.buildRunwayLeg(facility, oneWayRunway, true));
      } else {
        insertProcedureObject.procedureLegs.unshift(FlightPlan.createLeg({
          lat: facility.lat,
          lon: facility.lon,
          type: LegType.IF,
          fixIcaoStruct: facility.icaoStruct,
        }));
      }

      // if there was no runway transition or no runway, then we should insert a disconinuity after the origin leg
      if (insertProcedureObject.procedureLegs.length === 1 || !oneWayRunway) {
        insertProcedureObject.procedureLegs.push(FlightPlan.createLeg({ type: LegType.Discontinuity }));
      }
    }

    for (let i = 0; i < departure.commonLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(departure.commonLegs[i]));
      if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
        this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
          this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
        continue;
      }

      insertProcedureObject.procedureLegs.push(leg);
    }

    if (enRouteTransition) {
      for (let i = 0; i < enRouteTransition.legs.length; i++) {
        const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(enRouteTransition.legs[i]));
        if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
          this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
          insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
            this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
          continue;
        }

        insertProcedureObject.procedureLegs.push(enRouteTransition.legs[i]);
      }
    }

    return insertProcedureObject;
  }

  /**
   * Method to add or replace an arrival procedure in the flight plan.
   * @param facility is the facility that contains the procedure to add.
   * @param arrivalIndex is the index of the arrival procedure.
   * @param arrivalRunwayTransitionIndex is the index of the arrival runway transition.
   * @param enrouteTransitionIndex is the index of the enroute transition.
   * @param oneWayRunway is the one way runway to set as the destination leg.
   */
  public insertArrival(
    facility: AirportFacility,
    arrivalIndex: number,
    arrivalRunwayTransitionIndex: number,
    enrouteTransitionIndex: number,
    oneWayRunway?: OneWayRunway | undefined
  ): void {
    const plan = this.getModFlightPlan();
    const activeSegment = Epic2FmsUtils.getActiveSegment(plan);

    if (plan.procedureDetails.approachIndex < 0) {
      if (plan.destinationAirport !== facility.icao) {
        plan.setDestinationAirport(facility.icao);
      }
      plan.setDestinationRunway(oneWayRunway);
    }

    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);

    const activeLegArray = this.getSegmentActiveLegsToDisplace(plan, segmentIndex);

    let arrivalActiveLegIcao: undefined | string;

    if (arrivalIndex > -1 && arrivalIndex === plan.procedureDetails.arrivalIndex && activeSegment !== undefined && activeLegArray !== undefined) {
      arrivalActiveLegIcao = plan.tryGetLeg(plan.activeLateralLeg)?.leg?.fixIcao;
    }

    plan.setArrival(facility.icao, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex);

    if (plan.getSegment(segmentIndex).legs.length > 0) {
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Arrival);
    }

    const insertProcedureObject: InsertProcedureObject = this.buildArrivalLegs(facility, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex, oneWayRunway);

    let directTargetLeg: FlightPlanLeg | undefined;
    let handleDirectToDestination = false;
    const directToState = this.getDirectToState(Epic2FlightPlans.Pending);

    if (directToState === DirectToState.TOEXISTING) {
      directTargetLeg = this.getDirectToLeg();
      if (directTargetLeg?.fixIcao === plan.destinationAirport &&
        directTargetLeg?.fixIcao === insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1].fixIcao) {
        handleDirectToDestination = true;
      }
    }

    if (!handleDirectToDestination) {
      this.tryMoveDestinationLeg(plan);
    }

    insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(segmentIndex, l, undefined, Epic2ExtraLegDefinitionFlags.ProcedureLeg));

    const arrSegment = plan.getSegment(segmentIndex);
    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const firstArrLeg = arrSegment.legs[0];

    let deduplicatedEnrouteLeg: LegDefinition | null = null;

    if (prevLeg && firstArrLeg && this.isDuplicateLeg(prevLeg.leg, firstArrLeg.leg)) {
      deduplicatedEnrouteLeg = this.planRemoveDuplicateLeg(prevLeg, firstArrLeg);
    }

    const nextLeg = plan.getNextLeg(segmentIndex, Infinity);
    const lastArrLeg = arrSegment.legs[arrSegment.legs.length - 1];
    if (nextLeg && lastArrLeg && this.isDuplicateLeg(lastArrLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(lastArrLeg, nextLeg);
    }

    if (handleDirectToDestination) {
      this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Arrival, segmentIndex);
      this.activateLeg(segmentIndex, arrSegment.legs.length - 1);
    }

    // If we didn't remove a duplicate, insert a discontinuity at the start of the arrival
    if (!deduplicatedEnrouteLeg && (!prevLeg || !Epic2FmsUtils.isVectorsLeg(prevLeg.leg.type))) {
      this.tryInsertDiscontinuity(plan, segmentIndex);
    }

    this.generateSegmentVerticalData(plan, segmentIndex);

    const matchingActiveProcedureLegIndex = Epic2FmsUtils.findIcaoInSegment(arrSegment, arrivalActiveLegIcao);

    if (activeLegArray && matchingActiveProcedureLegIndex === undefined) {
      this.displaceActiveLegsIntoSegment(plan, segmentIndex, activeLegArray, false);
    } else if (matchingActiveProcedureLegIndex !== undefined) {
      plan.setLateralLeg(arrSegment.offset + matchingActiveProcedureLegIndex);
    }

    this.cleanupLegsAfterApproach(plan);

    this.tryConnectProcedures(plan);

    plan.calculate(0);
  }

  /**
   * Method to insert the arrival legs.
   * @param facility is the facility to build legs from.
   * @param procedureIndex is the procedure index to build legs from.
   * @param enrouteTransitionIndex is the enroute transition index to build legs from.
   * @param runwayTransitionIndex is the runway transition index to build legs from.
   * @param oneWayRunway is the one way runway, if one is specified in the procedure.
   * @returns InsertProcedureObject to insert into the flight plan.
   */
  private buildArrivalLegs(facility: AirportFacility,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    oneWayRunway?: OneWayRunway): InsertProcedureObject {

    const arrival = facility.arrivals[procedureIndex];
    const enRouteTransition = arrival.enRouteTransitions[enrouteTransitionIndex];
    const runwayTransition = arrival.runwayTransitions[runwayTransitionIndex];
    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    if (enRouteTransition !== undefined && enRouteTransition.legs.length > 0) {
      for (const leg of enRouteTransition.legs) {
        insertProcedureObject.procedureLegs.push(FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(leg)));
      }
    }

    for (let i = 0; i < arrival.commonLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(arrival.commonLegs[i]));
      if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
        this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
          this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
        continue;
      }

      insertProcedureObject.procedureLegs.push(leg);
    }

    if (runwayTransition) {
      for (let i = 0; i < runwayTransition.legs.length; i++) {
        const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(runwayTransition.legs[i]));
        if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
          this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
          insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
            this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
          continue;
        }

        insertProcedureObject.procedureLegs.push(leg);
      }
    }

    this.tryInsertIFLeg(insertProcedureObject);

    return insertProcedureObject;
  }

  /**
   * Method to move a direct to destination to a specified target segment.
   * @param plan is the primary flight plan.
   * @param targetSegmentType is the target segment type.
   * @param arrivalSegmentIndex is the arrival segment index
   * @returns whether a direct to destination was moved.
   */
  private moveDirectToDestinationLeg(plan: FlightPlan, targetSegmentType: FlightPlanSegmentType, arrivalSegmentIndex?: number): boolean {
    const directTargetSegmentIndex = targetSegmentType === FlightPlanSegmentType.Arrival ? arrivalSegmentIndex : this.findLastEnrouteSegmentIndex(plan);

    if (directTargetSegmentIndex !== undefined && directTargetSegmentIndex > 0 && plan.getLeg(plan.activeLateralLeg).leg.fixIcao === plan.destinationAirport) {
      const destinationLeg = Object.assign({}, plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex].leg);
      const directTargetLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg).leg);
      const directOriginLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 1).leg);
      const discoLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 2).leg);

      const newDirectLegIndex = plan.getSegment(directTargetSegmentIndex).legs.length;

      plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
      plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
      plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
      plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);

      plan.setDirectToData(directTargetSegmentIndex, newDirectLegIndex);

      plan.addLeg(directTargetSegmentIndex, destinationLeg);
      plan.addLeg(directTargetSegmentIndex, discoLeg, undefined, LegDefinitionFlags.DirectTo);
      plan.addLeg(directTargetSegmentIndex, directOriginLeg, undefined, LegDefinitionFlags.DirectTo);
      const newActiveLeg = plan.addLeg(directTargetSegmentIndex, directTargetLeg, undefined, LegDefinitionFlags.DirectTo | Epic2ExtraLegDefinitionFlags.DirectToTarget);
      const newActiveLegIndex = plan.getLegIndexFromLeg(newActiveLeg);

      plan.setCalculatingLeg(newActiveLegIndex);
      plan.setLateralLeg(newActiveLegIndex);
      plan.planIndex !== Epic2FlightPlans.Active && plan.calculate(newActiveLegIndex);
      return true;
    }

    return false;
  }

  private insertApproachOpId = 0;

  /**
   * Method to add or replace an approach procedure in the flight plan.
   * @param description the approach procedure description
   * @returns A Promise which is fulfilled with whether the approach was inserted.
   */
  public async insertApproach(description: ApproachProcedureDescription): Promise<boolean> {
    const plan = this.getModFlightPlan();

    if (plan.length > 0 && plan.procedureDetails.approachIndex < 0) {
      const lastLeg = plan.tryGetLeg(plan.length - 1);

      if (lastLeg?.leg.fixIcao === plan.destinationAirport) {
        plan.removeLeg(plan.getSegmentIndex(plan.length - 1));
      }
    }

    let visualRunway: OneWayRunway | undefined;

    if (description.visualRunwayNumber !== undefined && description.visualRunwayDesignator !== undefined) {
      visualRunway = RunwayUtils.matchOneWayRunway(description.facility, description.visualRunwayNumber, description.visualRunwayDesignator);

      if (!visualRunway) {
        return false;
      }
    }

    let approach: ApproachProcedure;
    if (visualRunway) {
      approach = Epic2FmsUtils.buildVisualApproach(
        this.facRepo,
        description.facility,
        visualRunway,
        description.visualRunwayOffset ?? 5,
        description.vfrVerticalPathAngle,
      );
    } else {
      approach = description.facility.approaches[description.approachIndex];
    }

    const opId = ++this.insertApproachOpId;
    const insertProcedureObject = await this.buildApproachLegs(description, approach, visualRunway);

    if (visualRunway) {
      this.setFlightPlanVisualApproach(plan.planIndex, visualRunway.designation);
      this.setFlightPlanVisualApproachVfrVpa(plan.planIndex, description.vfrVerticalPathAngle);
    } else if (this.getFlightPlanVisualApproach(plan.planIndex) !== undefined) {
      this.setFlightPlanVisualApproach(plan.planIndex, undefined);
      this.setFlightPlanVisualApproachVfrVpa(plan.planIndex, undefined);
    }

    plan.setApproach(description.facility.icao, description.approachIndex, description.approachTransitionIndex);

    const directToState = this.getDirectToState(Epic2FlightPlans.Pending);

    let skipDestinationLegCheck = false;
    if (directToState === DirectToState.TOEXISTING) {
      if (this.getDirectToLeg()?.fixIcao === plan.destinationAirport) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        skipDestinationLegCheck = true;
      }
    }

    if (directToState === DirectToState.TOEXISTING && plan.procedureDetails.arrivalIndex < 0 && !skipDestinationLegCheck) {
      this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute);
    }

    if (plan.destinationAirport !== description.facility.icao) {
      plan.setDestinationAirport(description.facility.icao);
    }

    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);

    const activeLegArray = this.getSegmentActiveLegsToDisplace(plan, segmentIndex);

    let apprSegment = plan.getSegment(segmentIndex);

    if (apprSegment.legs.length > 0) {
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Approach);

      const newSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);

      apprSegment = plan.getSegment(newSegmentIndex);
    }

    if (opId !== this.insertApproachOpId) {
      return false;
    }

    if (insertProcedureObject.runway) {
      plan.setDestinationRunway(insertProcedureObject.runway);
    } else {
      plan.setDestinationRunway(undefined);
    }

    let haveAddedMap = false;
    insertProcedureObject.procedureLegs.forEach((l) => {
      let isMissedLeg = false;
      if (visualRunway !== undefined) {
        this.addVisualFacilityFromLeg(l, visualRunway.designation);
        if (haveAddedMap) {
          isMissedLeg = true;
        }
        if (l.fixTypeFlags & FixTypeFlags.MAP) {
          haveAddedMap = true;
        }
      }

      let flags = l.flags ?? LegDefinitionFlags.None;
      flags |= Epic2ExtraLegDefinitionFlags.ProcedureLeg;
      if (isMissedLeg) {
        flags |= LegDefinitionFlags.MissedApproach;
      }

      this.planAddLeg(segmentIndex, l, undefined, flags);
    });

    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const firstAppLeg = apprSegment.legs[0];

    let deduplicatedArrivalLeg: LegDefinition | null = null;

    if (prevLeg && firstAppLeg && this.isDuplicateLeg(prevLeg.leg, firstAppLeg.leg)) {
      deduplicatedArrivalLeg = this.planRemoveDuplicateLeg(prevLeg, firstAppLeg);
    }

    // Adds missed approach legs
    if (!visualRunway && insertProcedureObject.procedureLegs.length > 0) {
      const missedLegs = description.facility.approaches[description.approachIndex].missedLegs ?? [];

      if (missedLegs.length > 0) {
        let maphIndex = -1;
        for (let m = missedLegs.length - 1; m >= 0; m--) {
          switch (missedLegs[m].type) {
            case LegType.HA:
            case LegType.HF:
            case LegType.HM:
              maphIndex = m - 1;
              break;
          }
        }

        let flags = LegDefinitionFlags.MissedApproach;
        flags |= Epic2ExtraLegDefinitionFlags.ProcedureLeg;

        for (let n = 0; n < missedLegs.length; n++) {
          const newLeg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(missedLegs[n]));
          if (maphIndex >= 0 && n === maphIndex) {
            newLeg.fixTypeFlags |= FixTypeFlags.MAHP;
            this.planAddLeg(segmentIndex, newLeg, undefined, flags);
          } else {
            this.planAddLeg(segmentIndex, newLeg, undefined, flags);
          }
        }
      }
    }

    const rnavTypeFlag = Epic2FmsUtils.getBestRnavType(approach.rnavTypeFlags);
    const approachIsCircling = !visualRunway && !approach?.runway;
    const approachName = Epic2FmsUtils.getApproachNameAsEfisString(approach);

    const approachRunway = RunwayUtils.getRunwayNameString(approach.runwayNumber, approach.runwayDesignator, true, 'RW');

    const mapIndex = VNavUtils.getMissedApproachLegIndex(plan);
    const mapLeg = mapIndex >= 0 ? plan.tryGetLeg(mapIndex) : null;
    const missedApproachFacility = mapLeg && mapLeg.leg.fixIcao && mapLeg.leg.fixIcao !== ICAO.emptyIcao
      ? await this.facLoader.getFacility(ICAO.getFacilityType(mapLeg.leg.fixIcao), mapLeg.leg.fixIcao)
      : null;

    let referenceFacility = null;
    if (approach && Epic2FmsUtils.approachHasNavFrequency(approach)) {
      referenceFacility = (await ApproachUtils.getReferenceFacility(approach, this.facLoader) as VorFacility | undefined) ?? null;
    }

    const finalApproachCourse = await this.getFinalApproachCourse(description.facility, approach);

    this.setApproachDetails(
      true,
      approach.approachType,
      rnavTypeFlag,
      false,
      approachIsCircling,
      approachName,
      approachRunway,
      missedApproachFacility,
      referenceFacility,
      finalApproachCourse,
    );

    // If we didn't remove a duplicate, insert a discontinuity at the start of the approach
    if (!deduplicatedArrivalLeg && (!prevLeg || !Epic2FmsUtils.isVectorsLeg(prevLeg.leg.type))) {
      this.tryInsertDiscontinuity(plan, segmentIndex);
    }

    this.generateSegmentVerticalData(plan, segmentIndex);

    if (activeLegArray) {
      this.displaceActiveLegsIntoSegment(plan, segmentIndex, activeLegArray, false);
    }

    this.cleanupLegsAfterApproach(plan);

    this.tryConnectProcedures(plan);

    plan.calculate(0);

    return true;
  }

  /**
   * Method to build the approach legs.
   * @param description the approach procedure description
   * @param resolvedApproach the resolved approach procedure
   * @param resolvedVisualRunway the resolved visual runway, if applicable
   * @returns A Promise which is fulfilled with an `InsertProcedureObject` containing the flight plan legs to insert
   * into the flight plan.
   */
  private async buildApproachLegs(
    description: ApproachProcedureDescription,
    resolvedApproach: ApproachProcedure,
    resolvedVisualRunway: OneWayRunway | undefined,
  ): Promise<InsertProcedureObject> {
    const isVisual = resolvedApproach.approachType === AdditionalApproachType.APPROACH_TYPE_VISUAL;
    const transition = resolvedApproach.transitions[description.approachTransitionIndex];
    const isVtf = description.approachTransitionIndex < 0;

    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    if (transition !== undefined && transition.legs.length > 0) {
      const startIndex = description.transStartIndex !== undefined ? description.transStartIndex : 0;

      for (let t = startIndex; t < transition.legs.length; t++) {
        insertProcedureObject.procedureLegs.push(FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(transition.legs[t])));
      }
    }

    const lastTransitionLeg = insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1];

    const finalLegs = resolvedApproach.finalLegs;
    for (let i = 0; i < finalLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(finalLegs[i]));

      if (i === 0 && lastTransitionLeg && this.isDuplicateIFLeg(lastTransitionLeg, leg)) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] = this.mergeDuplicateLegData(lastTransitionLeg, leg);
        continue;
      }

      if (!isVisual && leg.fixIcao[0] === 'R') {
        const approachRunway = RunwayUtils.matchOneWayRunway(description.facility, resolvedApproach.runwayNumber, resolvedApproach.runwayDesignator);

        if (approachRunway) {
          insertProcedureObject.runway = approachRunway;

          const runwayLeg = Epic2FmsUtils.buildRunwayLeg(description.facility, approachRunway, false);
          runwayLeg.verticalAngle = leg.verticalAngle;

          insertProcedureObject.procedureLegs.push(runwayLeg);
        }
      } else if (isVisual && i === finalLegs.length - 1) {
        insertProcedureObject.runway = resolvedVisualRunway;
        insertProcedureObject.procedureLegs.push(leg);

        if (resolvedApproach.missedLegs.length > 0) {
          insertProcedureObject.procedureLegs.push(resolvedApproach.missedLegs[0]);
        }
      } else {

        if (isVtf && BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.FAF)) {
          // If this is a VTF approach, replace the faf leg with a VTF leg
          const discoLeg: InsertProcedureObjectLeg = FlightPlan.createLeg({ type: LegType.ThruDiscontinuity });
          discoLeg.flags = BitFlags.union(discoLeg.flags ?? 0, LegDefinitionFlags.VectorsToFinal);
          insertProcedureObject.procedureLegs.push(discoLeg);
          await this.insertVtfLeg(insertProcedureObject, leg, finalLegs[i - 1], finalLegs[i + 1]);
        } else {
          insertProcedureObject.procedureLegs.push(leg);
        }
      }
    }

    if (!isVisual) {
      this.tryInsertIFLeg(insertProcedureObject);
      this.tryReconcileIAFLeg(insertProcedureObject);
      this.manageFafAltitudeRestriction(insertProcedureObject);
      this.tryCleanupHold(insertProcedureObject);
      this.tryInsertMap(insertProcedureObject);

      if (!insertProcedureObject.runway && resolvedApproach.runway) {
        insertProcedureObject.runway = RunwayUtils.matchOneWayRunway(description.facility, resolvedApproach.runwayNumber, resolvedApproach.runwayDesignator);
      }

      return insertProcedureObject;
    }

    return insertProcedureObject;
  }

  /**
   * Manages the altitude constraints in a segment when adding a procedure by creating a VerticalData object for each leg.
   * @param plan The Flight Plan.
   * @param segmentIndex The segment index for the inserted procedure.
   */
  private generateSegmentVerticalData(plan: FlightPlan, segmentIndex: number): void {
    const segment = plan.getSegment(segmentIndex);

    for (let l = 0; l < segment.legs.length; l++) {
      this.generateLegVerticalData(plan, segmentIndex, l);
    }
  }

  /**
   * Manages the altitude constraints for a leg when adding a procedure by creating a VerticalData object for the leg.
   * @param plan The Flight Plan.
   * @param segmentIndex The segment index.
   * @param localLegIndex The local leg index.
   * @param forceVerticalFlightPhase The vertical flight phase to force on the vertical data. Otherwise, determined by the leg segment type.
   */
  private generateLegVerticalData(plan: FlightPlan, segmentIndex: number, localLegIndex: number, forceVerticalFlightPhase?: VerticalFlightPhase): void {
    const segment = plan.getSegment(segmentIndex);
    const leg = segment.legs[localLegIndex];

    const altitude1 = leg.leg.altitude1;
    const altitude2 = leg.leg.altitude2;
    const altDesc = (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP) && altitude1 !== 0) ? AltitudeRestrictionType.At : leg.leg.altDesc;
    const speedRestriction = leg.leg.speedRestriction;

    const verticalData: Partial<VerticalData> = {
      phase: forceVerticalFlightPhase ?? (segment.segmentType === FlightPlanSegmentType.Departure || BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)
        ? VerticalFlightPhase.Climb
        : VerticalFlightPhase.Descent),
      altDesc: altDesc,
      altitude1: altitude1,
      altitude2: altitude2,
      speed: speedRestriction <= 0 ? 0 : speedRestriction,
      speedDesc: speedRestriction <= 0 ? SpeedRestrictionType.Unused : SpeedRestrictionType.AtOrBelow,
      speedUnit: SpeedUnit.IAS
    };

    plan.setLegVerticalData(segmentIndex, localLegIndex, verticalData);
  }

  /**
   * Manages the altitude constraints for FAF legs where vertical angle info is also provided.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private manageFafAltitudeRestriction(proc: InsertProcedureObject): InsertProcedureObject {
    proc.procedureLegs.forEach(leg => {
      if (leg.fixTypeFlags === FixTypeFlags.FAF && leg.altitude2 > 0) {
        const alt = leg.altitude1 <= leg.altitude2 ? leg.altitude1 : leg.altitude2;
        leg.altDesc = AltitudeRestrictionType.At;
        leg.altitude1 = alt;
        leg.altitude2 = alt;
      } else if (leg.fixTypeFlags === FixTypeFlags.FAF) {
        leg.altDesc = AltitudeRestrictionType.At;
        leg.altitude2 = leg.altitude1;
      }
    });
    return proc;
  }


  /**
   * Inserts an IF leg at the beginning of a procedure if it begins with a leg type which defines a fixed origin.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryInsertIFLeg(proc: InsertProcedureObject): InsertProcedureObject {
    const firstLeg = proc.procedureLegs[0];
    let icao: IcaoValue | undefined;
    switch (firstLeg?.type) {
      case LegType.HA:
      case LegType.HF:
      case LegType.HM:
      case LegType.PI:
      case LegType.FD:
      case LegType.FC:
        icao = firstLeg.fixIcaoStruct;
        break;
      case LegType.FM:
      case LegType.VM:
        icao = firstLeg.originIcaoStruct;
        break;
    }

    if (icao && !ICAO.isValueEmpty(icao)) {
      proc.procedureLegs.unshift(FlightPlan.createLeg({
        type: LegType.IF,
        fixIcaoStruct: icao,
        fixTypeFlags: firstLeg.fixTypeFlags & (FixTypeFlags.IF | FixTypeFlags.IAF)
      }));

      if (firstLeg?.type === LegType.HF || firstLeg?.type === LegType.PI) {
        proc.procedureLegs[0].altDesc = firstLeg.altDesc;
        proc.procedureLegs[0].altitude1 = firstLeg.altitude1;
        proc.procedureLegs[0].altitude2 = firstLeg.altitude2;
      }

      // need to remove IF/IAF flags from the original first leg (now the second leg)
      const replacementLeg = FlightPlan.createLeg(proc.procedureLegs[1]);
      replacementLeg.fixTypeFlags = replacementLeg.fixTypeFlags & ~(FixTypeFlags.IF | FixTypeFlags.IAF);
      proc.procedureLegs[1] = replacementLeg;
    }

    return proc;
  }

  /**
   * Checks the approach legs for an IAF fix type flag, and if one exists, amend the approach to ensure that
   * the IAF is not on a hold/pt leg and that we do not add legs prior to the IAF except in cases where we needed to add
   * an IF leg type.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryReconcileIAFLeg(proc: InsertProcedureObject): InsertProcedureObject {
    let iafIndex = -1;
    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.fixTypeFlags === FixTypeFlags.IAF) {
        iafIndex = i;
        switch (leg.type) {
          case LegType.HA:
          case LegType.HF:
          case LegType.HM:
          case LegType.PI:
          case LegType.FD:
          case LegType.FC:
            if (iafIndex > 0) {
              leg.fixTypeFlags &= ~FixTypeFlags.IAF;
              proc.procedureLegs[iafIndex - 1].fixTypeFlags |= FixTypeFlags.IAF;
              iafIndex--;
            }
        }
        break;
      }
    }
    return proc;
  }

  /**
   * Inserts a MAP fix type flag if none exists on the approach.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryInsertMap(proc: InsertProcedureObject): InsertProcedureObject {
    let addMap = true;
    let runwayIndex = -1;

    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.fixTypeFlags === FixTypeFlags.MAP) {
        addMap = false;
        break;
      }
      if (leg.fixIcao.search('R') === 0) {
        runwayIndex = i;
        break;
      }
    }

    if (addMap && runwayIndex > -1) {
      proc.procedureLegs[runwayIndex].fixTypeFlags = FixTypeFlags.MAP;
    }

    return proc;
  }

  /**
   * Method to remove the duplicate leg after the hold leg.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryCleanupHold(proc: InsertProcedureObject): InsertProcedureObject {
    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.type === LegType.HF) {
        const next = proc.procedureLegs[i + 1];
        if (leg.fixIcao === next.fixIcao && next.type === LegType.IF) {
          proc.procedureLegs.splice(i + 1, 1);
        }
      }
    }
    return proc;
  }

  /**
   * Method to remove the departure from the flight plan.
   */
  public async removeDeparture(): Promise<void> {
    const plan = this.getModFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

    plan.setDeparture();

    this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);

    // Remove constraints from first enroute leg
    this.clearFirstEnrouteLegVerticalData(plan);

    if (plan.originAirport) {
      const airport = await this.facLoader.getFacility(FacilityType.Airport, plan.originAirport);
      const updatedSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

      this.planAddOriginDestinationLeg(true, updatedSegmentIndex, airport, plan.procedureDetails.originRunway);

      const prevLeg = plan.getPrevLeg(updatedSegmentIndex, 1);
      const nextLeg = plan.getNextLeg(updatedSegmentIndex, 0);

      if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
        this.planRemoveDuplicateLeg(prevLeg, nextLeg);
      }
    }

    plan.calculate(0);
  }

  /**
   * Method to remove the arrival from the flight plan.
   */
  public async removeArrival(): Promise<void> {
    const plan = this.getModFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);

    plan.setArrival();

    const activeLegArray = this.getSegmentActiveLegsToDisplace(plan, segmentIndex);

    this.cleanupLegsAfterApproach(plan);

    this.planRemoveSegment(segmentIndex);

    // Remove constraints from last enroute leg
    this.clearLastEnrouteLegVerticalData(plan);

    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const nextLeg = plan.getNextLeg(segmentIndex, -1);
    if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    if (activeLegArray) {
      this.displaceActiveLegsToEnroute(plan, activeLegArray);
    }

    plan.calculate(0);
  }

  /**
   * Method to remove the approach from the flight plan.
   */
  public async removeApproach(): Promise<void> {
    const plan = this.getModFlightPlan();

    if (this.getFlightPlanVisualApproach(plan.planIndex) !== undefined) {
      this.deleteFlightPlanVisualApproach(plan.planIndex);
    }

    this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false, false, '', '', null, null, -1);

    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);

    const activeLegArray = this.getSegmentActiveLegsToDisplace(plan, segmentIndex);

    plan.procedureDetails.arrivalRunwayTransitionIndex = -1;
    plan.setDestinationRunway(undefined, false);
    plan.setApproach();

    this.cleanupLegsAfterApproach(plan);

    this.planRemoveSegment(segmentIndex);

    // Remove constraints from last enroute leg if there wasn't an arrival
    if (plan.procedureDetails.arrivalIndex === -1) {
      this.clearLastEnrouteLegVerticalData(plan);
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const nextLeg = plan.getNextLeg(segmentIndex, -1);
    if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    if (activeLegArray) {
      this.displaceActiveLegsToEnroute(plan, activeLegArray, true);
    }

    plan.calculate(0);
  }

  /**
   * Clears the vertical data of the last enroute leg, if applicable
   *
   * @param plan the lateral flight plan
   */
  private clearFirstEnrouteLegVerticalData(plan: FlightPlan): void {
    let firstEnrouteSegment: FlightPlanSegment | undefined;
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);

      if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.legs.length > 0) {
        firstEnrouteSegment = segment;
        break;
      }
    }

    if (firstEnrouteSegment) {
      plan.setLegVerticalData(firstEnrouteSegment.offset, { altDesc: AltitudeRestrictionType.Unused, speedDesc: SpeedRestrictionType.Unused });
    }
  }

  /**
   * Clears the vertical data of the last enroute leg, if applicable
   * @param plan the lateral flight plan
   */
  private clearLastEnrouteLegVerticalData(plan: FlightPlan): void {
    let lastEnrouteSegment: FlightPlanSegment | undefined;
    for (let i = plan.segmentCount - 1; i >= 0; i--) {
      const segment = plan.getSegment(i);

      if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.legs.length > 0) {
        lastEnrouteSegment = segment;
        break;
      }
    }

    if (lastEnrouteSegment) {
      plan.setLegVerticalData(
        lastEnrouteSegment.offset + (lastEnrouteSegment.legs.length - 1),
        { altDesc: AltitudeRestrictionType.Unused, speedDesc: SpeedRestrictionType.Unused },
      );
    }
  }

  /**
   * Displaces a sequence of flight plan legs contained in a now-removed segment ending with the active leg into the
   * end of the last enroute flight plan segment. If the displaced active leg was a direct-to leg, then a new direct-to
   * will be created to the displaced target leg. Otherwise, the active leg is set to the displaced active leg.
   * @param plan The flight plan into which to displace the legs.
   * @param activeLegArray The sequence of flight plan legs to displace. The sequence should contain all of the legs
   * contained in the former active segment up to and including the active leg.
   * @param checkForArrivalSegment Whether to check first for an arrival segment to add the legs to.
   */
  private displaceActiveLegsToEnroute(plan: FlightPlan, activeLegArray: LegDefinition[], checkForArrivalSegment = false): void {
    let segmentIndex = this.findLastEnrouteSegmentIndex(plan);
    if (checkForArrivalSegment && plan.procedureDetails.arrivalIndex > -1) {
      const arrivalSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival, false);
      if (arrivalSegmentIndex > -1) {
        segmentIndex = arrivalSegmentIndex;
      }
    }

    this.displaceActiveLegsIntoSegment(plan, segmentIndex, activeLegArray, true);
  }

  /**
   * Method to activate a leg in the flight plan.
   * @param segmentIndex is the index of the segment containing the leg to activate.
   * @param legIndex is the index of the leg in the selected segment activate.
   * @param removeExistingDTO Whether to check for and remove the existing direct to legs.
   * @param useModPlan Whether to activate from the mod plan, defaults to true
   */
  public activateLeg(segmentIndex: number, legIndex: number, removeExistingDTO = true, useModPlan = true): void {
    const plan = useModPlan ? this.getModFlightPlan() : this.getPrimaryFlightPlan();
    const indexInFlightplan = plan.getSegment(segmentIndex).offset + legIndex;

    if (removeExistingDTO && this.getDirectToState(plan.planIndex) === DirectToState.TOEXISTING) {
      this.removeDirectToExisting(plan.planIndex, indexInFlightplan);
      // The call above handles setting the active leg
    } else {
      plan.setCalculatingLeg(indexInFlightplan);
      plan.setLateralLeg(indexInFlightplan);
      plan.calculate(Math.max(0, indexInFlightplan - 1));
    }

    this.legWasActivatedInModPlan = true;
  }

  /**
   * Inserts a vector-to-final (VTF) leg into a procedure insertion object. A VTF leg is a CF leg to the final approach
   * fix with the {@link LegDefinitionFlags.VectorsToFinalFaf} flag applied to it.
   *
   * The course of the VTF leg is defined as follows:
   * * If the leg to the faf is a CF leg, the VTF course is equal to the CF leg course.
   * * If the leg to the faf is not an IF leg, the VTF course is defined by the great-circle path from the fix
   * immediately prior to the faf to the faf.
   * * If the leg to the faf is an IF leg, the VTF course is defined by the great-circle path from the faf to the fix
   * immediately following it.
   *
   * If a VTF course cannot be defined, then the normal faf leg is inserted instead of the VTF leg.
   * @param insertProcedureObject The procedure insertion object into which to insert the leg.
   * @param fafLeg The leg to the final approach fix.
   * @param prevLeg The leg before the faf leg.
   * @param nextLeg The leg after the faf leg.
   */
  private async insertVtfLeg(insertProcedureObject: InsertProcedureObject, fafLeg: FlightPlanLeg, prevLeg?: FlightPlanLeg, nextLeg?: FlightPlanLeg): Promise<void> {
    switch (fafLeg.type) {
      case LegType.CF:
      case LegType.TF:
      case LegType.IF:
      case LegType.DF:
        break;
      default:
        insertProcedureObject.procedureLegs.push(fafLeg);
        return;
    }

    try {
      const fafFacility: LatLonInterface = ICAO.isFacility(fafLeg.fixIcao, FacilityType.VIS)
        // If the faf fix is a visual facility, we can't retrieve it from facility loader because it is not guaranteed
        // to exist yet. However, because we are dealing with a visual approach, the leg should define the fix's
        // lat/lon coordinates.
        ? { lat: fafLeg.lat ?? 0, lon: fafLeg.lon ?? 0 }
        : await this.facLoader.getFacility(ICAO.getFacilityType(fafLeg.fixIcao), fafLeg.fixIcao);

      let course: number | undefined;
      let trueDegrees: boolean;

      if (fafLeg.type === LegType.CF) {
        course = fafLeg.course;
        trueDegrees = fafLeg.trueDegrees;
      } else {
        const fafPoint = Epic2Fms.geoPointCache[0].set(fafFacility);

        if (fafLeg.type === LegType.IF) {
          // faf leg is an IF, meaning it is the first leg in the approach -> get the course from the next leg.

          let nextLegFixIcao = '';
          switch (nextLeg?.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA:
              nextLegFixIcao = nextLeg.fixIcao;
          }

          if (ICAO.isFacility(nextLegFixIcao)) {
            const nextLegFacility = await this.facLoader.getFacility(ICAO.getFacilityType(nextLegFixIcao), nextLegFixIcao);
            course = fafPoint.bearingTo(nextLegFacility);
          }
        } else {
          // faf leg is not the first leg in the approach -> get the course from the previous leg.

          let prevLegFixIcao = '';
          switch (prevLeg?.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA:
              prevLegFixIcao = prevLeg.fixIcao;
          }

          if (ICAO.isFacility(prevLegFixIcao)) {
            const prevLegFacility = await this.facLoader.getFacility(ICAO.getFacilityType(prevLegFixIcao), prevLegFixIcao);
            course = fafPoint.bearingFrom(prevLegFacility);
          }
        }

        trueDegrees = true;
      }

      if (course === undefined) {
        insertProcedureObject.procedureLegs.push(fafLeg);
        return;
      }

      const vtfFafLeg: InsertProcedureObjectLeg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg({
        type: LegType.CF,
        lat: fafFacility.lat,
        lon: fafFacility.lon,
        fixIcaoStruct: fafLeg.fixIcaoStruct,
        course,
        trueDegrees,
        originIcaoStruct: fafLeg.originIcaoStruct,
        fixTypeFlags: fafLeg.fixTypeFlags,
        altDesc: fafLeg.altDesc,
        altitude1: fafLeg.altitude1,
        altitude2: fafLeg.altitude2,
        speedRestriction: fafLeg.speedRestriction
      }));

      vtfFafLeg.flags = LegDefinitionFlags.VectorsToFinalFaf;

      insertProcedureObject.procedureLegs.push(vtfFafLeg);
    } catch (e) {
      console.warn(`Fms: could not insert VTF legs due to error... ${e}`);
      if (e instanceof Error) {
        console.error(e.stack);
      }

      insertProcedureObject.procedureLegs.push(fafLeg);
    }
  }

  /**
   * Activates vectors-to-final. Activating vectors-to-final activates the primary flight plan's vectors-to-final leg.
   * If the primary flight plan has no or VTF approach loaded, this method has no effect.
   */
  public async activateVtf(): Promise<void> {
    const plan = this.getPrimaryFlightPlan();

    if (!Epic2FmsUtils.isVtfApproachLoaded(plan)) {
      return;
    }

    // this.cancelObs(false);

    // const approachType: ExtendedApproachType = ApproachType.APPROACH_TYPE_UNKNOWN;

    const approachSegment = Epic2FmsUtils.getApproachSegment(plan);

    if (approachSegment === undefined) {
      // This should never happen.
      return;
    }

    const legToActivate = Epic2FmsUtils.getApproachVtfLeg(plan);

    if (legToActivate === undefined) {
      console.warn('Fms: failed to activate VTF approach');
      return;
    }

    let legToActivateSegmentLegIndex = approachSegment.legs.indexOf(legToActivate);

    // If we are activating a VTF leg, check to see if it is preceded by a discontinuity leg. If it is not, then
    // we need to add one.
    if (
      BitFlags.isAll(legToActivate.flags, LegDefinitionFlags.VectorsToFinalFaf)
      && !BitFlags.isAll(approachSegment.legs[legToActivateSegmentLegIndex - 1]?.flags, LegDefinitionFlags.VectorsToFinal)
    ) {
      plan.addLeg(approachSegment.segmentIndex, FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }), legToActivateSegmentLegIndex, LegDefinitionFlags.VectorsToFinal);
      legToActivateSegmentLegIndex++;
    }

    this.activateLeg(approachSegment.segmentIndex, legToActivateSegmentLegIndex, true, false);
    // this.setLocFrequency(1);
    // this.setLocFrequency(2);
    // this.publisher.pub(this.fmsTopicMap['fms_approach_activate'], undefined, true, false);

    // switch (approachType) {
    //   case ApproachType.APPROACH_TYPE_ILS:
    //   case ApproachType.APPROACH_TYPE_LDA:
    //   case ApproachType.APPROACH_TYPE_LOCALIZER:
    //   case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
    //   case ApproachType.APPROACH_TYPE_SDF:
    //   case ApproachType.APPROACH_TYPE_VOR:
    //   case ApproachType.APPROACH_TYPE_VORDME:
    //     this.bus.getPublisher<ControlEvents>().pub('cdi_src_set', { type: NavSourceType.Nav, index: 1 }, true);
    //     break;
    // }
  }

  /**
   * Method to create a direct to in the plan. This method will also then call activateLeg.
   * A DTO consists of 4 legs:
   * 1. The original leg that was used to create the DTO.
   * a. We preserve this leg so that we will have a vlid FROM leg in case the DTO needs to be removed.
   * 2. A DISCO leg, because a DTO is not connected to any legs that came before it.
   * 3. The FROM leg, initializes to the present position (PPOS).
   * 4. The TO leg.
   * @param segmentIndex is the index of the segment containing the leg to activate as direct to.
   * @param segmentLegIndex is the index of the leg in the specified segment to activate as direct to.
   * @param isNewDTO whether to treat this as a new directo to or not.
   * @param course is the course for this direct to in degrees magnetic, if specified.
   * @param facility is the new facility to add to the plan and then create a direct to for, for the case of a direct to random.
   */
  public createDirectTo(segmentIndex?: number, segmentLegIndex?: number, isNewDTO = true, course?: number, facility?: Facility): void {
    const plan = this.getModFlightPlan();
    let newLeg: FlightPlanLeg | undefined;

    if (isNewDTO) {
      this.dtoWasCreatedInModPlan.set(true);

      if (facility !== undefined) {
        newLeg = FlightPlan.createLeg({
          type: LegType.TF,
          fixIcaoStruct: facility.icaoStruct,
        });
      }
    }

    if (segmentIndex === undefined) {
      const lastSegment = plan.segmentCount > 0 ? plan.getSegment(plan.segmentCount - 1) : undefined;
      if (lastSegment) {
        if (lastSegment.segmentType !== FlightPlanSegmentType.Enroute) {
          segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, lastSegment.segmentIndex + 1);
        } else {
          segmentIndex = lastSegment.segmentIndex;
        }
      } else {
        return;
      }
    }

    const segment = plan.getSegment(segmentIndex);

    if (segmentLegIndex === undefined) {
      segmentLegIndex = Math.max(0, segment.legs.length - 1);
    }

    let modLegVerticalData: VerticalData | undefined;

    if (!isNewDTO && this.dtoWasCreatedInModPlan.get()) {
      const existingModDtoTargetLeg = segment.legs[segmentLegIndex + 3];
      if (existingModDtoTargetLeg !== undefined) {
        modLegVerticalData = existingModDtoTargetLeg.verticalData;
        if (existingModDtoTargetLeg.leg.type === LegType.CF) {
          if (existingModDtoTargetLeg.leg.trueDegrees) {
            // FIXME we give up if no magvar available from calculations
            course = MagVar.trueToMagnetic(existingModDtoTargetLeg.leg.course, existingModDtoTargetLeg.calculated?.courseMagVar ?? 0);
          } else {
            course = existingModDtoTargetLeg.leg.course;
          }
        }
      }
    }

    let legIndexDelta = 0;

    if (plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1) {
      legIndexDelta -= plan.directToData.segmentIndex === segmentIndex && segmentLegIndex > plan.directToData.segmentLegIndex ? 3 : 0;

      if (this.getDirectToState(Epic2FlightPlans.Pending) === DirectToState.TOEXISTING) {
        this.removeDirectToExisting(Epic2FlightPlans.Pending, undefined, false);
      } else {
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);

        const originalLeg = plan.tryGetLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
        if (originalLeg && BitFlags.isAny(originalLeg.flags, Epic2ExtraLegDefinitionFlags.DirectToTarget) && !BitFlags.isAny(originalLeg.flags, LegDefinitionFlags.DirectTo)) {
          this.planRemoveLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
        }
      }
    }

    if (isNewDTO) { plan.setUserData(Epic2UserDataKeys.USER_DATA_KEY_DIRECT_TO_ORIGIN, plan.activeLateralLeg); }

    if (newLeg !== undefined) {
      this.planAddLeg(segmentIndex, newLeg, segmentLegIndex + legIndexDelta, Epic2ExtraLegDefinitionFlags.DirectToTarget);
    }

    const leg = segment.legs[segmentLegIndex + legIndexDelta];

    if (!newLeg && isNewDTO && segmentIndex > 1 && Epic2FmsUtils.isFirstLegInSegment(plan, segmentIndex, segmentLegIndex)) {
      const dtoSegmentIndex = this.planInsertSegmentOfType(plan.getSegment(segmentIndex - 1).segmentType, segmentIndex);
      for (let i = 0; i <= segmentLegIndex; i++) {
        // Need to account for discontinuities in the plan which may appear earlier than the original leg
        const removedLeg = plan.tryGetLeg(segmentIndex + 1, 0);
        if (!removedLeg) { continue; }

        plan.removeLeg(segmentIndex + 1, 0);
        plan.addLeg(dtoSegmentIndex, removedLeg?.leg, undefined, removedLeg.flags | Epic2ExtraLegDefinitionFlags.DirectToOrigin);
      }

      segmentIndex = dtoSegmentIndex;
    }

    plan.setDirectToData(segmentIndex, segmentLegIndex + legIndexDelta);

    if (segment && leg) {
      let originPos = this.ppos;
      if (course) {
        originPos = this.ppos.offset(NavMath.normalizeHeading(course + 180), UnitType.NMILE.convertTo(50, UnitType.GA_RADIAN), new GeoPoint(0, 0));
      }

      const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
      const dtoOriginLeg = this.createDTOOriginLeg(originPos);
      const dtoTargetLeg = this.createDTODirectLeg(leg.leg.fixIcaoStruct, leg.leg, course);

      // We do a +1,2,3 here so that the original TO leg is preserved, in case the DTO gets removed
      plan.addLeg(segmentIndex, discoLeg, segmentLegIndex + legIndexDelta + 1,
        LegDefinitionFlags.DirectTo);
      plan.addLeg(segmentIndex, dtoOriginLeg, segmentLegIndex + legIndexDelta + 2,
        LegDefinitionFlags.DirectTo);
      const directToTargetLegDefinition = plan.addLeg(segmentIndex, dtoTargetLeg, segmentLegIndex + legIndexDelta + 3,
        (leg.flags & LegDefinitionFlags.MissedApproach) | LegDefinitionFlags.DirectTo | Epic2ExtraLegDefinitionFlags.DirectToTarget);

      const newVerticalData = modLegVerticalData ?? leg.verticalData;

      plan.setLegVerticalData(segmentIndex, segmentLegIndex + legIndexDelta + 3, newVerticalData);

      if (isNewDTO) {
        if (directToTargetLegDefinition.verticalData.altDesc !== AltitudeRestrictionType.Unused) {
          const globalLegIndex = segment.offset + segmentLegIndex + legIndexDelta + 3;

          // We need to calculate the direct to leg before we can find out its length (we are in MOD at this point)
          plan.calculate(globalLegIndex - 2).then(() => {
            const finalAltitude = newVerticalData.altitude1;

            this.createVerticalDirectTo(plan, globalLegIndex, finalAltitude, true);
          });
        }
      }

      this.activateLeg(segmentIndex, segmentLegIndex + legIndexDelta + 3, false);
    }
  }

  /**
   * Method to create a direct to in the flight plan to an arbitrary airport.
   *
   * This:
   *
   * - empties out the flight plan;
   * - sets the destination as the provided airport facility;
   * - creates a direct-to sequence to that facility.
   *
   * @param airportFacility the airport facility to go direct to
   */
  public createDirectToAirport(airportFacility: AirportFacility): void {
    const plan = this.getModFlightPlan();

    const segmentCount = plan.segmentCount;

    for (let i = segmentCount - 1; i >= 0; i--) {
      plan.removeSegment(i, true);
    }

    plan.addSegment(0, FlightPlanSegmentType.Departure, undefined, true);
    plan.addSegment(1, FlightPlanSegmentType.Enroute, undefined, true);

    Epic2FmsUtils.reconcileDirectToData(plan);

    this.setDestination(airportFacility);
    this.createDirectTo(undefined, undefined, true, undefined, airportFacility);
  }

  /**
   * Method to create a direct to in the flight plan to an arbitrary airport+runway using a visual approach.
   *
   * This:
   *
   * - empties out the flight plan;
   * - sets the destination as the provided airport facility;
   * - inserts a visual approach to the provided runway;
   * - creates a direct-to sequence to the FAF of that approach.
   *
   * @param airportFacility the airport facility to go direct to
   * @param runway the one way runway to insert a visual approach for
   */
  public async createDirectToRunwayVisualApproach(airportFacility: AirportFacility, runway: OneWayRunway): Promise<void> {
    const plan = this.getModFlightPlan();

    const segmentCount = plan.segmentCount;

    for (let i = segmentCount - 1; i >= 0; i--) {
      plan.removeSegment(i, true);
    }

    plan.addSegment(0, FlightPlanSegmentType.Departure, undefined, true);
    plan.addSegment(1, FlightPlanSegmentType.Enroute, undefined, true);

    Epic2FmsUtils.reconcileDirectToData(plan);

    await this.insertApproach({
      facility: airportFacility,
      approachIndex: -1,
      approachTransitionIndex: -1,
      visualRunwayNumber: runway.direction,
      visualRunwayDesignator: runway.runwayDesignator,
    });

    const approachSegment: FlightPlanSegment = Array.from(plan.segmentsOfType(FlightPlanSegmentType.Approach))[0];

    if (approachSegment) {
      let activateIndex = -1;
      for (let i = 0; i < approachSegment.legs.length; i++) {
        activateIndex = i;

        const leg = approachSegment.legs[i];
        const isFaf = BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF);

        if (isFaf) {
          break;
        }
      }

      if (activateIndex !== -1) {
        this.createDirectTo(approachSegment.segmentIndex, activateIndex, true, undefined);
      }
    }
  }

  /**
   * Creates a Direct-To origin IF leg.
   * @param ppos The current plane position.
   * @returns a Direct-To origin IF leg.
   */
  private createDTOOriginLeg(ppos: GeoPointInterface): FlightPlanLeg {
    return FlightPlan.createLeg({
      type: LegType.IF,
      lat: ppos.lat,
      lon: ppos.lon
    });
  }

  /**
   * Creates a Direct-To target leg.
   * @param icao is the icao.
   * @param leg The FlightPlanLeg.
   * @param course The magnetic course for the Direct To.
   * @returns a Direct-To leg.
   */
  private createDTODirectLeg(icao: IcaoValue, leg?: FlightPlanLeg, course?: number): FlightPlanLeg {

    let legType: LegType;
    if (course === undefined) {
      legType = LegType.DF;
      const planeHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', 'degrees');
      course = planeHeading === 0 ? 360 : planeHeading;
    } else {
      legType = LegType.CF;
    }

    if (leg) {
      const directLeg = Object.assign({}, leg);
      directLeg.type = legType;
      directLeg.course = course as number;
      directLeg.trueDegrees = false;
      directLeg.turnDirection = LegTurnDirection.None;
      return directLeg;
    } else {
      return FlightPlan.createLeg({
        type: legType,
        fixIcaoStruct: icao,
        course,
        trueDegrees: false
      });
    }
  }

  /**
   * Updates the DTO Origin Leg Lat/Lon with the PPOS.
   * @param plan The Flight Plan.
   */
  private updateDtoOrigin(plan: FlightPlan): void {
    // We only want to update the DTO origin if the DTO was created in this current MOD plan
    if (!this.dtoWasCreatedInModPlan.get()) {
      return;
    }
    const pposLeg = plan.tryGetLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 2);
    // Making sure that we are in a DTO
    if (!pposLeg) {
      return;
    }
    // We need to recreate the DTO so that the proper events get sent and legs get recreated and what not
    // We do not mark it as pending, because that is the decision of whatever created the original DTO
    this.createDirectTo(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex, false);
  }

  /**
   * Creates a vertical direct-to to a leg. This creates a manual constraint with an fpa that reaches
   * the desired altitude using a continuous descent from the present position and altitude.
   *
   * **NOTE:** This will not delete any constraints - it is the responsibility of the caller to do so.
   *
   * @param plan the plan to use
   * @param globalIndex the global leg index to apply the constraint to
   * @param finalAltitude the altitude to target, in metres.
   * @param isAutomatic whether this was an automatic VDTO (created with a lateral DTO)
   *
   * @returns whether the vdto was successfully created
   */
  public createVerticalDirectTo(
    plan: FlightPlan,
    globalIndex: number,
    finalAltitude: number,
    isAutomatic = false,
  ): boolean {
    const distanceToConstraint = isAutomatic
      ? plan.getLeg(globalIndex).calculated?.distanceWithTransitions
      : Epic2FmsUtils.getDistanceFromPposToLegEnd(plan, globalIndex, this.lnavLegDistanceRemaining.get());

    if (distanceToConstraint === undefined) {
      return false;
    }

    const currentAltitude = this.aircraftAltitudeFeet.get();

    if (currentAltitude === undefined) {
      return false;
    }

    const currentAltitudeMetres = UnitType.METER.convertFrom(currentAltitude, UnitType.FOOT);

    const fpa = VNavUtils.getFpa(distanceToConstraint, 75 + currentAltitudeMetres - finalAltitude);

    const isFpaValid = fpa > 1 && fpa <= 6;

    if (!isFpaValid) {
      return false;
    }

    plan.setLegVerticalData(globalIndex, {
      phase: VerticalFlightPhase.Descent,
      altDesc: AltitudeRestrictionType.At,
      altitude1: finalAltitude,
      altitude2: 0,
      fpa: isAutomatic ? Math.max(3, fpa) : fpa,
    });

    this.verticalPathCalculator.requestPathCompute(Epic2FlightPlans.Pending);

    this.verticalDtoWasCreatedInModPlan = true;
    this.verticalDtoWasCreatedInModPlanWasAutomatic = isAutomatic;

    return true;
  }

  /**
   * Updates the vertical DTO origin with the current altitude and distance to constraint.
   * @param plan The Flight Plan.
   * @returns whether the vertical DTO is still valid
   */
  private updateVerticalDtoOrigin(plan: FlightPlan): boolean {
    const constraintIndex = VNavUtils.getConstraintIndexFromLegIndex(this.getVerticalPlanForFmcRender(), plan.activeLateralLeg);

    if (constraintIndex === -1) {
      return false;
    }

    const constraint = this.getVerticalPlanForFmcRender().constraints[constraintIndex];

    return this.createVerticalDirectTo(plan, constraint.index, constraint.targetAltitude, this.verticalDtoWasCreatedInModPlanWasAutomatic);
  }

  /**
   * Creates a direct to existing to the next valid leg in the plan after the input global leg index.
   * @param globalLegIndex The global leg index.
   * @returns Whether a direct to existing was created.
   */
  public createDirectToExistingNextValidLeg(globalLegIndex: number): boolean {
    const modPlan = this.getPrimaryModFlightPlan();

    for (let l = globalLegIndex + 1; l < modPlan.length; l++) {
      const leg = modPlan.tryGetLeg(l);
      if (leg?.leg.type !== LegType.Discontinuity && leg?.leg.type !== LegType.ThruDiscontinuity) {
        const targetSegmentIndex = modPlan.getSegmentIndex(l);
        const targetSegment = modPlan.getSegment(targetSegmentIndex);
        const targetSegmentLegIndex = l - targetSegment.offset;
        this.createDirectTo(targetSegmentIndex, targetSegmentLegIndex, true);
        return true;
      }
    }
    return false;
  }

  /**
   * Inserts a hold-at-waypoint leg to the flight plan. The hold leg will be inserted immediately after the
   * specified parent leg. The hold leg must have the same fix as the parent leg.
   * @param segmentIndex The index of the segment that contains the hold's parent leg.
   * @param legIndex The index of the hold's parent leg in its segment.
   * @param holdLeg The hold leg to add.
   * @returns Whether the hold-at-waypoint leg was successfully inserted.
   */
  public insertHold(segmentIndex: number, legIndex: number, holdLeg: FlightPlanLeg): boolean {
    const plan = this.getModFlightPlan();

    const prevLeg = plan.getPrevLeg(segmentIndex, legIndex + 1);
    if (prevLeg?.leg.fixIcao !== holdLeg.fixIcao) {
      return false;
    }

    const nextLeg = plan.getNextLeg(segmentIndex, legIndex);

    // If we are editing a hold, delete the old leg.
    if (nextLeg && Epic2FmsUtils.isHoldAtLeg(nextLeg.leg.type) && nextLeg.leg.fixIcao === holdLeg.fixIcao) {
      const segment = plan.getSegmentFromLeg(nextLeg);
      segment && this.removeWaypoint(segment.segmentIndex, segment.legs.indexOf(nextLeg));
    }

    this.planAddLeg(segmentIndex, holdLeg, legIndex + 1);
    return true;
  }

  /**
   * Inserts a PPOS hold as the active leg
   *
   * @param partial an object to modify the PPOS hold leg with, if applicable
   *
   * @returns whether the leg was inserted
   */
  public insertPposHold(partial?: Partial<FlightPlanLeg>): boolean {
    const activeLegIndex = this.getPlanForFmcRender().activeLateralLeg;
    const activeLeg = this.getPlanForFmcRender().tryGetLeg(activeLegIndex);
    let activeSegmentIndex = this.getPlanForFmcRender().getSegmentIndex(activeLegIndex);

    const plan = this.getModFlightPlan();

    if (activeSegmentIndex === -1) {
      plan.addSegment(0, FlightPlanSegmentType.Enroute);
      activeSegmentIndex = 0;
    }

    const { lon, lat } = this.ppos;
    const magVar = MagVar.get(lat, lon);

    const insertAfterActive = activeLegIndex === 0;
    const activeLegSegment = plan.getSegment(activeSegmentIndex);

    let insertIndex: number | undefined = activeLegIndex - activeLegSegment.offset + (insertAfterActive ? 1 : 0);

    const parentLeg = FlightPlan.createLeg({ type: LegType.IF, fixIcaoStruct: ICAO.value(IcaoType.Waypoint, '', '', 'PPOS'), lat, lon });

    if (!activeLeg) {
      plan.addLeg(activeSegmentIndex, parentLeg);

      // There was no active leg, meaning an empty plan - we want to add at the end of the newly created segment
      insertIndex = undefined;
    } else {
      if (activeLeg.leg.type === LegType.HM && activeLeg.leg.fixIcao === ICAO.emptyIcao) {
        activeLegSegment && this.removeWaypoint(activeLegSegment.segmentIndex, activeLegIndex - activeLegSegment.offset);
      } else {
        plan.addLeg(activeSegmentIndex, parentLeg, insertIndex);
        insertIndex++;
      }
    }

    const pposHold = FlightPlan.createLeg({
      type: LegType.HM,
      turnDirection: LegTurnDirection.Right,
      distanceMinutes: true,
      distance: 1,
      course: this.aircraftTrueTrack.get() ? this.aircraftTrueTrack.get() - magVar : 100, // I think the leg path builder adds magvar
      lat,
      lon,
      ...partial ?? {},
    });

    let insertHoldLeg: LegDefinition;
    try {
      // If the active leg is 0 (only airport or runway in the flight plan), we want to insert the hold after the active leg
      insertHoldLeg = plan.addLeg(activeSegmentIndex, pposHold, insertIndex);
    } catch (e) {
      console.error(e);
      return false;
    }

    plan.setLateralLeg(plan.getLegIndexFromLeg(insertHoldLeg));

    return true;
  }

  /**
   * Updates an existing PPOS hold if it exists and is in the MOD flight plan
   *
   * @param plan the plan
   */
  private tryUpdatePposHoldPosition(plan: FlightPlan): void {
    const modPlan = this.getPrimaryModFlightPlan();
    const activePlan = this.getPrimaryFlightPlan();

    const modActiveLeg = modPlan.tryGetLeg(modPlan.activeLateralLeg);
    const activeActiveLeg = activePlan.tryGetLeg(activePlan.activeLateralLeg);

    // We don't wanna update any PPOS hold in the mod flight plan if that hold is already confirmed (in the active flight plan)
    const pposHoldInActive = activeActiveLeg && activeActiveLeg.leg.type === LegType.HM && activeActiveLeg.leg.fixIcao === ICAO.emptyIcao;
    const notPposHold = modActiveLeg && (modActiveLeg.leg.type !== LegType.HM || modActiveLeg.leg.fixIcao !== ICAO.emptyIcao);

    if (plan.planIndex !== Epic2FlightPlans.Pending || pposHoldInActive || !modActiveLeg || notPposHold) {
      // Not in MOD or no PPOS hold at FROM leg
      return;
    }

    this.insertPposHold();
  }

  /**
   * Intercepts the chosen leg with that course
   * @param segmentIndex The index of the segment which contains the leg being intercepted
   * @param legIndex The index of the leg within the segment that is being intercepted
   * @param course The course with which to intercept the leg
   */
  public interceptLeg(segmentIndex: number, legIndex: number, course: number): void {
    const plan = this.getModFlightPlan();
    const leg = plan.tryGetLeg(segmentIndex, legIndex);

    if (leg) {
      const { endLat, endLon } = leg.calculated ?? {};

      plan.removeLeg(segmentIndex, legIndex);
      plan.addLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), legIndex, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg);

      let newLegIndex = legIndex + 1;
      if (endLat && endLon) {
        const endGeo = new GeoPoint(endLat, endLon);
        const bearing = MagVar.magneticToTrue(NavMath.reciprocateHeading(course), endLat, endLon);
        const { lat, lon } = endGeo.offset(bearing, this.ppos.distance(endLat, endLon));

        const initialLeg = FlightPlan.createLeg({
          type: LegType.IF,
          lat,
          lon
        });

        plan.addLeg(segmentIndex, initialLeg, newLegIndex, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg);
        newLegIndex++;
      }

      const interceptLeg = FlightPlan.createLeg({
        fixIcaoStruct: leg.leg.fixIcaoStruct,
        course,
        type: LegType.CF
      });
      const newLeg = plan.addLeg(segmentIndex, interceptLeg, newLegIndex, leg.flags);
      const interceptLegIndex = plan.getLegIndexFromLeg(newLeg);

      plan.setLegVerticalData(interceptLegIndex, leg.verticalData);

      this.activateLeg(segmentIndex, legIndex + 1);
    }

  }

  /**
   * Adds an airway and airway segment to the flight plan.
   * @param airway The airway object.
   * @param entry The entry intersection facility.
   * @param exit The exit intersection facility.
   * @param segmentIndex Is the segment index for the entry leg.
   * @param legIndex Is the leg index of the entry leg in the segment.
   * @returns The index of the airway segment that was added to the plan.
   */
  public insertAirwaySegment(airway: AirwayData, entry: IntersectionFacility, exit: IntersectionFacility, segmentIndex: number, legIndex: number): number {
    const plan = this.getModFlightPlan();
    const airwaySegmentIndex = this.prepareAirwaySegment(`${airway.name}`, segmentIndex, legIndex);
    const airwayLegObject = this.buildAirwayLegs(airway, entry, exit);
    const airwayLegs = airwayLegObject.procedureLegs;

    for (let i = 1; i < airwayLegs.length; i++) {
      this.planAddLeg(airwaySegmentIndex, airwayLegs[i]);
    }

    // handle duplicates TODO add discontinuities
    const airwaySegment = plan.getSegment(airwaySegmentIndex);
    const lastLeg = airwaySegment.legs[airwaySegment.legs.length - 1];
    const nextLeg = plan.getNextLeg(airwaySegmentIndex + 1, -1);
    if (lastLeg && nextLeg && this.isDuplicateLeg(lastLeg.leg, nextLeg.leg)) {
      const nextLegIndex = plan.getLegIndexFromLeg(nextLeg);
      const nextLegSegmentIndex = plan.getSegmentIndex(nextLegIndex);
      const nextLegSegment = plan.getSegment(nextLegSegmentIndex);
      if (this.getAirwayLegType(plan, nextLegSegmentIndex, nextLegIndex - nextLegSegment.offset) === AirwayLegType.ENTRY) {
        // the duplicated leg is an airway entry -> remove the segment containing it (the segment is guaranteed to
        // contain just the one leg)
        this.planRemoveSegment(nextLegSegmentIndex);
      } else {
        this.planRemoveDuplicateLeg(lastLeg, nextLeg);
      }
    }

    plan.calculate(0, true);

    return airwaySegmentIndex;
  }

  /**
   * Prepares a new, empty airway segment in the primary flight plan which is ready to accept airway legs. Also
   * modifies the segment containing the entry leg, if necessary, either splitting it following the entry leg if it is
   * a non-airway enroute segment, or removing all legs following the entry leg if it is an airway segment. If the
   * entry leg is the last leg in its segment, a new non-airway enroute segment will be inserted after the entry leg
   * segment if the entry leg segment is the last segment in the flight plan or if the following segment is not an
   * enroute segment. If the entry leg is the entry for an existing airway segment, the existing airway segment will be
   * removed.
   * @param airwayName The name of the airway.
   * @param entrySegmentIndex The index of the segment containing the airway entry leg.
   * @param entrySegmentLegIndex The index of the airway entry leg in its segment.
   * @returns The index of the new airway segment.
   */
  private prepareAirwaySegment(airwayName: string, entrySegmentIndex: number, entrySegmentLegIndex: number): number {
    const plan = this.getModFlightPlan();

    if (
      entrySegmentIndex < plan.directToData.segmentIndex
      || (entrySegmentIndex === plan.directToData.segmentIndex && entrySegmentLegIndex < plan.directToData.segmentLegIndex)
    ) {
      this.removeDirectToExisting();
    }

    const entrySegment = plan.getSegment(entrySegmentIndex);
    const nextSegment = entrySegmentIndex + 1 < plan.segmentCount ? plan.getSegment(entrySegmentIndex + 1) : undefined;
    let airwaySegmentIndex = entrySegmentIndex + 1;

    let removeLegsSegmentIndex = -1;
    let removeLegsFromIndex = -1;

    if (entrySegment.airway !== undefined) {
      // the entry leg is within an existing airway segment -> remove all legs in the same segment after the entry leg
      removeLegsSegmentIndex = entrySegmentIndex;
      removeLegsFromIndex = entrySegmentLegIndex + 1;
    } else if (entrySegmentLegIndex === entrySegment.legs.length - 1 && nextSegment?.airway !== undefined) {
      // the entry leg is the entry leg for an existing airway segment -> remove all legs from the existing airway segment
      removeLegsSegmentIndex = entrySegmentIndex + 1;
      removeLegsFromIndex = 0;
    }

    // remove legs as required
    if (removeLegsSegmentIndex >= 0) {
      const removeLegsSegment = plan.getSegment(removeLegsSegmentIndex);

      if (this.getAirwayLegType(plan, removeLegsSegmentIndex, removeLegsSegment.legs.length - 1) === AirwayLegType.EXIT_ENTRY) {
        // preserve the airway entry leg
        const lastLeg = removeLegsSegment.legs[removeLegsSegment.legs.length - 1];
        this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, removeLegsSegmentIndex + 1);
        this.planAddLeg(removeLegsSegmentIndex + 1, lastLeg.leg, 0);
      }

      if (removeLegsFromIndex > 0) {
        while (removeLegsSegment.legs.length > removeLegsFromIndex) {
          this.planRemoveLeg(removeLegsSegmentIndex, removeLegsSegment.legs.length - 1, true, true);
        }
      } else {
        this.planRemoveSegment(removeLegsSegmentIndex);
      }
    }

    if (entrySegment.legs.length - 1 > entrySegmentLegIndex) {
      // entry leg is not the last leg in its segment -> split the segment after the entry leg
      airwaySegmentIndex = this.splitSegment(plan, entrySegmentIndex, entrySegmentLegIndex);
    } else if (
      plan.getSegment(entrySegmentIndex).segmentType === FlightPlanSegmentType.Enroute
      && (nextSegment?.segmentType !== FlightPlanSegmentType.Enroute)
    ) {
      // entry leg is the last leg in its segment and the following segment doesn't exist or is not an enroute segment
      plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute);
    }

    plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute, airwayName);
    return airwaySegmentIndex;
  }

  /**
   * Splits a segment into two segments if type is enroute; if departure, remove legs after the legIndex, else do nothing.
   * @param plan is the flight plan to edit.
   * @param segmentIndex Is the segment index for the entry leg.
   * @param legIndex Is the leg index of the entry leg in the segment of the
   * @returns the segment number of the new airway segment if one was created, else the current segment or if no action was taken.
   * @throws If it is called for a segment that is not part of the departure or enroute segments
   */
  private splitSegment(plan: FlightPlan, segmentIndex: number, legIndex: number): number {
    const segment = plan.getSegment(segmentIndex);
    if (segment.segmentType === FlightPlanSegmentType.Enroute) {
      const nextSegmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
      // Move legs after leg index to new segment
      // It's funky without the i++, but it works correctly because the length of the segment is changing
      for (let i = legIndex + 1; i < segment.legs.length;) {
        const leg = segment.legs[i].leg;
        this.planAddLeg(nextSegmentIndex, leg);
        this.planRemoveLeg(segmentIndex, i);
      }
      return nextSegmentIndex;
    } else if (segment.segmentType === FlightPlanSegmentType.Departure) {
      // Remove legs after leg index
      // It's funky without the i++, but it works correctly because the length of the segment is changing
      for (let i = legIndex + 1; i < segment.legs.length;) {
        this.planRemoveLeg(segmentIndex, i);
      }

      return segmentIndex + 1;
    }
    throw Error('Attempted to call split segment with a segment that is not on the enroute or departure portions of the flight plan');
  }

  /**
   * Builds a legs for an airway.
   * @param airway The airway object.
   * @param entry The entry intersection facility.
   * @param exit The exit intersection facility.
   * @returns the InsertProcedureObject.
   */
  private buildAirwayLegs(airway: AirwayData, entry: IntersectionFacility, exit: IntersectionFacility): InsertProcedureObject {
    const insertAirwayObject: InsertProcedureObject = { procedureLegs: [] };
    const waypoints = airway.waypoints;
    const entryIndex = waypoints.findIndex((w) => w.icao === entry.icao);
    const exitIndex = waypoints.findIndex((w) => w.icao === exit.icao);
    const ascending = exitIndex > entryIndex;
    if (ascending) {
      for (let i = entryIndex; i <= exitIndex; i++) {
        const leg = FlightPlan.createLeg({
          fixIcaoStruct: waypoints[i].icaoStruct,
          type: i === entryIndex ? LegType.IF : LegType.TF
        });
        insertAirwayObject.procedureLegs.push(leg);
      }
    } else {
      for (let i = entryIndex; i >= exitIndex; i--) {
        const leg = FlightPlan.createLeg({
          fixIcaoStruct: waypoints[i].icaoStruct,
          type: i === entryIndex ? LegType.IF : LegType.TF
        });
        insertAirwayObject.procedureLegs.push(leg);
      }
    }
    return insertAirwayObject;
  }

  /**
   * Method to remove an airway from the flight plan.
   * @param segmentIndex is the segment index of the airway to remove.
   */
  public removeAirway(segmentIndex: number): void {
    const plan = this.getModFlightPlan();
    let combineSegments = false;
    const segment = plan.getSegment(segmentIndex);
    const exitLeg = segment.legs[segment.legs.length - 1].leg;

    if (segmentIndex > 0) {
      const priorSegmentEnrouteNonAirway = plan.getSegment(segmentIndex - 1).segmentType === FlightPlanSegmentType.Enroute
        && plan.getSegment(segmentIndex - 1).airway === undefined;
      const nextSegmentEnrouteNonAirway = plan.getSegment(segmentIndex + 1).segmentType === FlightPlanSegmentType.Enroute
        && plan.getSegment(segmentIndex + 1).airway === undefined;

      if (priorSegmentEnrouteNonAirway && nextSegmentEnrouteNonAirway) {
        combineSegments = true;
      }

      // Add the exit leg as a direct in the prior segment if it is enroute and not an airway.
      if (priorSegmentEnrouteNonAirway) {
        this.planAddLeg(segmentIndex - 1, exitLeg);
      }

      // Remove the airway segment
      this.planRemoveSegment(segmentIndex);

      // If we have two adjacent enroute non-airway segments, merge them.
      if (combineSegments) {
        this.mergeSegments(plan, segmentIndex - 1);
      }

      // If we need to add a non-airway enroute segment
      if (!priorSegmentEnrouteNonAirway) {
        if (!nextSegmentEnrouteNonAirway) {
          segmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex);
        }
        this.planAddLeg(segmentIndex, exitLeg);
      }
    }

    plan.calculate(0, true);
  }

  /**
   * Merges the legs of two consecutive segments into a single segment. All legs in the second segment are moved to the
   * first, and the second segment is removed from the flight plan.
   * @param plan The flight plan to modify.
   * @param segmentIndex The index of the first segment to merge.
   */
  private mergeSegments(plan: FlightPlan, segmentIndex: number): void {
    const segmentToGrow = plan.getSegment(segmentIndex);
    const segmentToRemove = plan.getSegment(segmentIndex + 1);

    const segmentToGrowOrigLength = segmentToGrow.legs.length;

    segmentToRemove.legs.forEach((l) => {
      plan.addLeg(segmentIndex, l.leg, undefined, l.flags);
    });

    if (plan.directToData.segmentIndex === segmentIndex + 1) {
      plan.setDirectToData(segmentIndex, segmentToGrowOrigLength + plan.directToData.segmentLegIndex);
    }

    this.planRemoveSegment(segmentIndex + 1);
  }










  /**
   * Method to find the last enroute segment of the supplied flight plan.
   * @param plan is the flight plan to find the last enroute segment in.
   * @returns a segment index.
   */
  public findLastEnrouteSegmentIndex(plan: FlightPlan): number {
    let enrouteSegmentFound = 0;
    for (let i = 1; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);

      if (segment.segmentType === FlightPlanSegmentType.Enroute) {
        enrouteSegmentFound = i;
      }
    }
    return enrouteSegmentFound;
  }

  /**
   * Method to check whether an approach can load, or only activate.
   * @returns true if the approach can be loaded and not activated, otherwise the approach can only be immediatly activated.
   */
  public canApproachLoad(): boolean {
    const plan = this.getFlightPlan();
    if (plan.length > 0) {
      const activeSegment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
      if (activeSegment.segmentType !== FlightPlanSegmentType.Approach && plan.length > 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the last leg in the last enroute segment is the destination airport and, if so, moves it into the approach segment.
   * @param plan The lateral flight plan.
   */
  private tryMoveDestinationLeg(plan: FlightPlan): void {
    const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
    const lastEnrouteSegment = plan.getSegment(lastEnrouteSegmentIndex);
    if (lastEnrouteSegment !== undefined && lastEnrouteSegment.legs.length > 0 &&
      lastEnrouteSegment.legs[lastEnrouteSegment.legs.length - 1].leg.fixIcao === plan.destinationAirport) {
      const approachSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach, true);
      const approachSegment = plan.getSegment(approachSegmentIndex);
      if (approachSegment.legs.length < 1) {
        const destinationLeg = Object.assign({}, lastEnrouteSegment.legs[lastEnrouteSegment.legs.length - 1].leg);
        plan.removeLeg(lastEnrouteSegmentIndex);
        plan.addLeg(approachSegmentIndex, destinationLeg);
      }
    }
  }

  /**
   * Tries to add a discontinuity when needed at the start of a procedure.
   * @param plan The Flight Plan
   * @param segmentIndex The procedure segment index.
   */
  private tryInsertDiscontinuity(plan: FlightPlan, segmentIndex: number): void {
    const segment = plan.getSegment(segmentIndex);

    if (segment.legs.length > 0) {
      switch (segment.segmentType) {
        case FlightPlanSegmentType.Arrival:
        case FlightPlanSegmentType.Approach:
          this.insertDiscontinuity(plan, segmentIndex, 0);
      }
    }
  }

  /**
   * Method to connect an arrival and approach when the approach begins at a leg that exists in the arrival.
   * @param plan The Lateral Flight Plan.
   */
  private tryConnectProcedures(plan: FlightPlan): void {
    if (plan.procedureDetails.approachIndex > -1 && plan.procedureDetails.arrivalIndex > -1) {
      // find the first leg in the approach
      let firstApproachLeg: LegDefinition | undefined;
      let firstApproachSegmentLegIndex: number | undefined;
      let matchedArrivalLegSegmentLegIndex: number | undefined;

      const approachSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach, false);
      const arrivalSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival, false);

      if (approachSegmentIndex > -1 && arrivalSegmentIndex > -1) {
        const approachSegment = plan.getSegment(approachSegmentIndex);
        const arrivalSegment = plan.getSegment(arrivalSegmentIndex);

        for (let l = 0; l < approachSegment.legs.length; l++) {
          const approachLeg = approachSegment.legs[l];
          if (approachLeg.leg.type !== LegType.Discontinuity && approachLeg.leg.type !== LegType.ThruDiscontinuity) {
            firstApproachLeg = approachLeg;
            firstApproachSegmentLegIndex = l;
            break;
          }
        }

        for (let i = arrivalSegment.legs.length - 1; i > 0; i--) {
          const arrivalLeg = arrivalSegment.legs[i];
          if (arrivalLeg?.name && firstApproachLeg?.name && arrivalLeg.name === firstApproachLeg.name) {
            matchedArrivalLegSegmentLegIndex = i;
            break;
          }
        }

        if (firstApproachSegmentLegIndex !== undefined && matchedArrivalLegSegmentLegIndex !== undefined) {
          while (arrivalSegment.legs.length > matchedArrivalLegSegmentLegIndex) {
            plan.removeLeg(arrivalSegmentIndex, matchedArrivalLegSegmentLegIndex);
          }

          for (let j = 0; j < firstApproachSegmentLegIndex; j++) {
            plan.removeLeg(approachSegmentIndex, j);
          }
        }
      }
    }
  }

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param array The source array to search in
   * @param predicate find calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param defaultReturn is the default value
   * @returns either the index or the default if the predicate criteria is not met
   */
  private findLastSegmentIndex(array: Array<FlightPlanSegment>, predicate:
    (value: FlightPlanSegment, index: number, obj: FlightPlanSegment[]) => boolean, defaultReturn = -1): number {
    let l = array.length;
    while (l--) {
      if (predicate(array[l], l, array)) {
        return array[l].segmentIndex;
      }
    }
    return defaultReturn;
  }

  /**
   * Method to insert a discontinuity in a provided plan at a specified position.
   * @param plan The FlightPlan to modify.
   * @param segmentIndex The segment index to insert the disco in.
   * @param segmentLegIndex The leg index to insert the disco at.
   */
  private insertDiscontinuity(plan: FlightPlan, segmentIndex: number, segmentLegIndex?: number): void {
    const segment = plan.getSegment(segmentIndex);
    if (segmentLegIndex === undefined) {
      segmentLegIndex = Math.max(0, segment.legs.length - 1);
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, segmentLegIndex);
    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if ((prevLeg && prevLeg.leg.type === LegType.Discontinuity) || (leg && leg.leg.type === LegType.Discontinuity)) {
      return;
    }

    this.planAddLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.Discontinuity }), segmentLegIndex);
  }

  /**
   * Adds a leg to the flight plan.
   * @param segmentIndex The segment to add the leg to.
   * @param leg The leg to add to the plan.
   * @param index The index of the leg in the segment to insert. Will add to the end of the segment if ommitted.
   * @param flags Leg definition flags to apply to the new leg. Defaults to `None` (0).
   * @param notify Whether or not to send notifications after the operation.
   * @returns the {@link LegDefinition} that was added to the plan
   */
  private planAddLeg(segmentIndex: number, leg: FlightPlanLeg, index?: number, flags = 0, notify = true): LegDefinition {
    const plan = this.getModFlightPlan();

    const dtoLegIndex = plan.directToData.segmentLegIndex;
    const dtoSegmentIndex = plan.directToData.segmentIndex;

    if (
      dtoSegmentIndex >= 0
      && (segmentIndex === dtoSegmentIndex && index !== undefined && index <= dtoLegIndex)
    ) {
      this.removeDirectToExisting(plan.planIndex);
    }

    const segment = plan.getSegment(segmentIndex);
    const addIndex = index !== undefined ? index : Math.max(segment.legs.length - 1, 0);
    if (
      segment.segmentType === FlightPlanSegmentType.Approach
      && addIndex > 0
      && BitFlags.isAll(segment.legs[addIndex - 1].flags, LegDefinitionFlags.MissedApproach)
    ) {
      flags |= LegDefinitionFlags.MissedApproach;
    }

    const legDefinition = plan.addLeg(segmentIndex, leg, index, flags, notify);
    plan.calculate(plan.activeLateralLeg - 1);
    const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
    if (activeSegmentIndex !== -1) {
      const activeLegIndex = plan.activeLateralLeg - plan.getSegment(activeSegmentIndex).offset;
      if (segmentIndex < activeSegmentIndex || (index && segmentIndex == activeSegmentIndex && index < activeLegIndex)) {
        const newActiveLegIndex = plan.activeLateralLeg + 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    } else {
      console.error('planAddLeg: activeSegmentIndex was -1');
    }

    return legDefinition;
  }

  /**
   * Removes a leg from the flight plan.
   * @param segmentIndex The segment to add the leg to.
   * @param segmentLegIndex The index of the leg in the segment to remove.
   * @param notify Whether or not to send notifications after the operation. True by default.
   * @param skipDupCheck Whether to skip checking for duplicates. False by default.
   * @param skipCancelDirectTo Whether to skip canceling a direct to existing if the removed leg is equal to or is
   * located before the direct to target. False by default.
   * @returns whether a leg was removed.
   */
  private planRemoveLeg(segmentIndex: number, segmentLegIndex: number, notify = true, skipDupCheck = false, skipCancelDirectTo = false): boolean {
    let plan = this.getPlanForFmcRender();

    if (segmentIndex < 0 || segmentIndex >= plan.segmentCount) {
      return false;
    }

    const toRemoveLeg = plan.getSegment(segmentIndex).legs[segmentLegIndex];
    if (!toRemoveLeg) {
      return false;
    }

    const removeLegGlobalIndex = plan.getSegment(segmentIndex).offset + segmentLegIndex;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isDirectToExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;

    plan = this.getModFlightPlan();

    let removed = false;
    const airwayLegType = this.getAirwayLegType(plan, segmentIndex, segmentLegIndex);

    if (airwayLegType !== AirwayLegType.NONE) {
      removed = this.removeLegAirwayHandler(plan, airwayLegType, segmentIndex, segmentLegIndex);
    } else {
      removed = plan.removeLeg(segmentIndex, segmentLegIndex, notify) !== null;

      if (!removed) {
        return false;
      }

      const dtoLegIndex = plan.directToData.segmentLegIndex;
      const dtoSegmentIndex = plan.directToData.segmentIndex;
      if (
        !skipCancelDirectTo
        && dtoSegmentIndex >= 0
        && (
          segmentIndex < dtoSegmentIndex
          || (segmentIndex === dtoSegmentIndex && segmentLegIndex <= dtoLegIndex)
        )
      ) {
        // Need to adjust direct to data to compensate for removed leg.
        if (segmentIndex === dtoSegmentIndex) {
          plan.directToData.segmentLegIndex--;
        }

        // if (isDirectToExistingActive && segmentIndex === dtoSegmentIndex && segmentLegIndex === dtoLegIndex) {
        // Create a DTO random to replace the canceled DTO existing if we are directly removing the target leg of the DTO existing.
        //   const directIcao = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + 3].leg.fixIcao;
        //   this.createDirectToRandom(directIcao);
        // }

        this.removeDirectToExisting(plan.planIndex, plan.activeLateralLeg - 1);
      } else if (removeLegGlobalIndex < plan.activeLateralLeg || plan.activeLateralLeg >= plan.length) {
        const newActiveLegIndex = plan.activeLateralLeg - 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    }

    const prevLeg = removeLegGlobalIndex - 1 >= 0 ? plan.getLeg(removeLegGlobalIndex - 1) : null;
    const nextLeg = removeLegGlobalIndex < plan.length ? plan.getLeg(removeLegGlobalIndex) : null;

    // Detect if we have created consecutive duplicate legs. If we have, we need to delete one of them.
    if (!skipDupCheck && prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    if (!skipDupCheck) {
      this.checkAndRemoveEmptySegment(plan, segmentIndex);
    }

    plan.calculate(plan.activeLateralLeg - 1);
    return true;
  }

  /**
   * Method to handle a remove leg request t.
   * @param plan is the flight plan.
   * @param airwayLegType is the airwayLegType returned from the checkIfAirwayLeg method.
   * @param segmentIndex The segment we are removing from.
   * @param segmentLegIndex is the leg index in the segment we are removing.
   * @returns whether this handler processed the remove request.
   */
  private removeLegAirwayHandler(plan: FlightPlan, airwayLegType: AirwayLegType, segmentIndex: number, segmentLegIndex: number): boolean {
    const removeLegGlobalIndex = plan.getSegment(segmentIndex).offset + segmentLegIndex;

    let removed = false;
    let needReconcileDto = plan.directToData.segmentIndex >= 0;

    if (
      segmentIndex < plan.directToData.segmentIndex
      || (segmentIndex === plan.directToData.segmentIndex && segmentLegIndex <= plan.directToData.segmentLegIndex)
    ) {

      this.removeDirectToExisting();

      needReconcileDto = false;
    }

    switch (airwayLegType) {
      case AirwayLegType.ONROUTE: {
        const segment = plan.getSegment(segmentIndex);
        plan.removeLeg(segmentIndex, segmentLegIndex);

        if (segmentLegIndex > 0) {
          // Need to rename the airway segment with the new exit (if we removed the first leg after the entry, the
          // airway segment will be deleted so no need to bother)

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          plan.setAirway(segmentIndex, segment.airway!.replace(/\..*/, `.${segment.legs[segmentLegIndex - 1].name}`));
        }

        // We need to move the leg immediately after the removed leg to the next enroute segment
        // (if the next enroute segment does not exist we will create one)

        if (plan.segmentCount <= segmentIndex + 1 || plan.getSegment(segmentIndex + 1).segmentType !== FlightPlanSegmentType.Enroute) {
          plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);
        }

        const legAfterRemoved = segment.legs[segmentLegIndex].leg;
        plan.addLeg(segmentIndex + 1, legAfterRemoved, 0);
        plan.removeLeg(segmentIndex, segmentLegIndex);

        if (segmentLegIndex < segment.legs.length) {
          // There is at least one more leg in the original airway segment after the one we moved to the next enroute
          // segment -> move these remaining legs into a new airway segment

          const newEntrySegment = plan.getSegment(segmentIndex + 1);
          let newAirwaySegmentIndex = segmentIndex + 2;
          if (newEntrySegment.legs.length > 1) {
            // need to split the segment containing the entry leg of the new airway segment
            newAirwaySegmentIndex = this.splitSegment(plan, segmentIndex + 1, 0);
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const airwayName = segment.airway!.replace(/\..*/, `.${segment.legs[segment.legs.length - 1].name}`);
          plan.insertSegment(newAirwaySegmentIndex, FlightPlanSegmentType.Enroute, airwayName);

          while (segment.legs.length > segmentLegIndex) {
            const leg = segment.legs[segmentLegIndex].leg;
            plan.removeLeg(segmentIndex, segmentLegIndex);
            plan.addLeg(newAirwaySegmentIndex, leg);
          }

          // If the newly added airway segment is the last enroute segment, we need to insert an empty enroute segment
          // after it to ensure that the last enroute segment in the plan is not an airway segment
          if (newAirwaySegmentIndex >= plan.segmentCount - 1 || plan.getSegment(newAirwaySegmentIndex + 1).segmentType !== FlightPlanSegmentType.Enroute) {
            plan.insertSegment(newAirwaySegmentIndex + 1, FlightPlanSegmentType.Enroute);
          }
        }

        removed = true;
        break;
      }
      case AirwayLegType.ENTRY: {
        if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Enroute) {
          // We need to remove the entry leg, then move the first leg in the airway segment out of the airway segment
          // and into the previous enroute segment to serve as the new entry leg.

          const segment = plan.getSegment(segmentIndex + 1);
          const leg = segment.legs[0].leg;
          plan.removeLeg(segmentIndex + 1, 0);
          this.checkAndRemoveEmptySegment(plan, segmentIndex + 1);

          this.planAddLeg(segmentIndex, leg);
        } else if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Departure) {
          // We need to remove the entry leg, then move the first leg in the airway segment out of the airway segment
          // and into a newly created enroute segment placed before the airway segment to serve as the new entry leg.

          this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
          const segment = plan.getSegment(segmentIndex + 2);
          const leg = segment.legs[0].leg;
          plan.removeLeg(segmentIndex + 2, 0);
          this.checkAndRemoveEmptySegment(plan, segmentIndex + 2);

          this.planAddLeg(segmentIndex + 1, leg, 0);
        }
        removed = plan.removeLeg(segmentIndex, segmentLegIndex) !== null;
        break;
      }
      case AirwayLegType.EXIT: {
        if (segmentLegIndex < 1) {
          // We are removing the only leg in the airway segment, so just delete the segment.

          this.removeAirway(segmentIndex);
          return true;
        } else {
          // Remove the leg, then change the name of the airway segment to reflect the new exit waypoint.

          const segment = plan.getSegment(segmentIndex);
          const airway = segment.airway?.split('.');
          segment.airway = airway && airway[0] ? airway[0] + '.' + segment.legs[segmentLegIndex - 1].name : segment.airway;
          plan.setAirway(segmentIndex, segment.airway);
          removed = plan.removeLeg(segmentIndex, segmentLegIndex) !== null;
        }
        break;
      }
      case AirwayLegType.EXIT_ENTRY: {
        // We need to move the first leg in the next airway segment out of that segment and into an enroute segment
        // before the next airway segment.

        const segment = plan.getSegment(segmentIndex + 1);
        const leg = segment.legs[0].leg;
        plan.removeLeg(segmentIndex + 1, 0);
        if (segmentLegIndex < 1) {
          // We are removing the only leg in the first airway segment, so just remove the segment.
          plan.removeSegment(segmentIndex);

          let prevSegmentIndex = segmentIndex - 1;
          const prevSegment = plan.getSegment(prevSegmentIndex);
          if (prevSegment.segmentType !== FlightPlanSegmentType.Enroute || prevSegment.airway !== undefined) {
            plan.insertSegment(segmentIndex, FlightPlanSegmentType.Enroute);
            prevSegmentIndex = segmentIndex;
          }

          plan.addLeg(prevSegmentIndex, leg);
        } else {
          // Remove the leg from the first airway segment, then change the name of the airway segment to reflect the
          // new exit waypoint.

          plan.removeLeg(segmentIndex, segmentLegIndex);
          plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);
          plan.addLeg(segmentIndex + 1, leg);

          const firstAirwaySegment = plan.getSegment(segmentIndex);
          const airway = firstAirwaySegment.airway?.split('.');
          firstAirwaySegment.airway = airway && airway[0] ? airway[0] + '.' + firstAirwaySegment.legs[segmentLegIndex - 1].name : firstAirwaySegment.airway;
          plan.setAirway(segmentIndex, firstAirwaySegment.airway);
        }
        removed = true;
      }
    }

    if (removed) {
      if (needReconcileDto) {
        Epic2FmsUtils.reconcileDirectToData(plan);
      }

      if (removeLegGlobalIndex <= plan.activeLateralLeg || plan.activeLateralLeg >= plan.length) {
        const newActiveLegIndex = plan.activeLateralLeg - 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    }

    return removed;
  }

  /**
   * Checks if a flight plan segment is empty, and removes the segment if it is eligible to be removed. Only Enroute
   * segments that are followed by another Enroute segment are eligible to be removed if empty.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment to check.
   * @returns Whether the segment was removed.
   */
  private checkAndRemoveEmptySegment(plan: FlightPlan, segmentIndex: number): boolean {
    if (this.checkIfRemoveLeftEmptySegmentToDelete(plan, segmentIndex)) {
      this.planRemoveSegment(segmentIndex);

      const prevSegmentIndex = segmentIndex - 1;
      const nextSegmentIndex = segmentIndex;
      const prevSegment = prevSegmentIndex >= 0 ? plan.getSegment(prevSegmentIndex) : undefined;
      const nextSegment = nextSegmentIndex < plan.segmentCount ? plan.getSegment(nextSegmentIndex) : undefined;
      if (
        prevSegment?.segmentType === FlightPlanSegmentType.Enroute
        && prevSegment.airway === undefined
        && nextSegment?.segmentType === FlightPlanSegmentType.Enroute
        && nextSegment.airway === undefined
      ) {
        // We are left with two consecutive non-airway enroute segments -> merge the two
        this.mergeSegments(plan, prevSegmentIndex);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if a remove left an empty segment that also needs to be removed.
   * @param plan is the flight plan
   * @param segmentIndex The segment to add the leg to.
   * @returns whether to remove the segment.
   */
  private checkIfRemoveLeftEmptySegmentToDelete(plan: FlightPlan, segmentIndex: number): boolean {
    const segment = plan.getSegment(segmentIndex);
    let nextSegment: FlightPlanSegment | undefined;
    if (segmentIndex < plan.segmentCount - 1) {
      nextSegment = plan.getSegment(segmentIndex + 1);
    }
    if (segment.legs.length < 1) {
      switch (segment.segmentType) {
        case FlightPlanSegmentType.Enroute: {
          if (nextSegment && nextSegment.segmentType === FlightPlanSegmentType.Enroute) {
            return true;
          }
          const priorSegment = plan.getSegment(segmentIndex - 1);
          if (priorSegment.segmentType === FlightPlanSegmentType.Approach || priorSegment.segmentType === FlightPlanSegmentType.Arrival) {
            return true;
          }
        }
          break;
        //TODO: Add more cases as appropriate
      }
    }
    return false;
  }


  /**
   * Adds an appropriate origin or destination leg (either an airport or runway fix) to the primary flight plan. Origin
   * legs are added to the beginning of the specified segment. Destination legs are added to the end of the specified
   * segment.
   * @param isOrigin Whether to add an origin leg.
   * @param segmentIndex The index of the segment to which to add the leg.
   * @param airport The origin airport.
   * @param runway The origin runway.
   */
  private planAddOriginDestinationLeg(isOrigin: boolean, segmentIndex: number, airport: AirportFacility, runway?: OneWayRunway): void {
    let leg;
    if (runway) {
      leg = Epic2FmsUtils.buildRunwayLeg(airport, runway, isOrigin);
    } else {
      leg = FlightPlan.createLeg({
        lat: airport.lat,
        lon: airport.lon,
        type: isOrigin ? LegType.IF : LegType.TF,
        fixIcaoStruct: airport.icaoStruct,
        altitude1: airport.altitude + UnitType.FOOT.convertTo(50, UnitType.METER)
      });
    }

    if (leg) {
      this.planAddLeg(segmentIndex, leg, isOrigin ? 0 : undefined);
      if (!isOrigin) {
        const plan = this.getModFlightPlan();
        const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
        const lastEnrouteSegment = plan.getSegment(lastEnrouteSegmentIndex);
        for (let i = lastEnrouteSegment.legs.length - 1; i >= 0; i--) {
          if (lastEnrouteSegment.legs[i].leg.fixIcao === airport.icao) {
            this.planRemoveLeg(lastEnrouteSegmentIndex, i, true, true);
          }
        }
      }
    }
  }

  /**
   * Method to add a segment to the flightplan.
   * @param segmentType is the FlightPlanSegmentType.
   * @param index is the optional segment index to insert the segment.
   * @returns the segment index of the inserted segment.
   */
  private planInsertSegmentOfType(segmentType: FlightPlanSegmentType, index?: number): number {
    const plan = this.getModFlightPlan();
    let segmentIndex = -1;

    if (index) {
      segmentIndex = index - 1;
    } else {
      const segments: FlightPlanSegment[] = [];
      for (const segment of plan.segments()) {
        segments.push(segment);
      }

      switch (segmentType) {
        case FlightPlanSegmentType.Origin:
          break;
        case FlightPlanSegmentType.Departure:
          segmentIndex = 0;
          break;
        case FlightPlanSegmentType.Arrival:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute;
          }, 2);
          break;
        case FlightPlanSegmentType.Approach:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival;
          }, 2);
          break;
        case FlightPlanSegmentType.MissedApproach:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Approach;
          }, 2);
          break;
        case FlightPlanSegmentType.Destination:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
              || v.segmentType === FlightPlanSegmentType.Approach;
          }, 5);
          break;
        default:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
              || v.segmentType === FlightPlanSegmentType.Approach || v.segmentType === FlightPlanSegmentType.Destination;
          }, 1);
          segmentIndex--;
          break;
      }
    }
    return this.planInsertSegment(segmentIndex + 1, segmentType).segmentIndex;
  }

  /**
   * Method to remove all legs from a segment.
   * @param segmentIndex is the index of the segment to delete all legs from.
   * @param segmentType is the type if segment to delete all legs from, if known.
   */
  private planClearSegment(segmentIndex: number, segmentType?: FlightPlanSegmentType): void {
    this.planRemoveSegment(segmentIndex);
    this.planInsertSegment(segmentIndex, segmentType);
  }

  /**
   * Inserts a segment into the flight plan at the specified index and
   * reflows the subsequent segments.
   * @param segmentIndex The index to insert the flight plan segment.
   * @param segmentType The type of segment this will be.
   * @param airway The airway this segment is made up of, if any
   * @param notify Whether or not to send notifications after the operation.
   * @returns The new flight plan segment.
   */
  private planInsertSegment(segmentIndex: number, segmentType: FlightPlanSegmentType = FlightPlanSegmentType.Enroute, airway?: string, notify = true): FlightPlanSegment {
    const plan = this.getModFlightPlan();

    const segment = plan.insertSegment(segmentIndex, segmentType, airway, notify);
    plan.calculate(plan.activeLateralLeg - 1);

    if (plan.directToData.segmentIndex >= 0 && segmentIndex <= plan.directToData.segmentIndex) {
      plan.setDirectToData(plan.directToData.segmentIndex + 1, plan.directToData.segmentLegIndex);
    }

    return segment;
  }

  /**
   * Removes a segment from the flight plan and reflows the segments following
   * the removed segment, not leaving an empty segment at the specified index.
   * @param segmentIndex The index of the segment to remove.
   * @param notify Whether or not to send notifications after the operation.
   */
  private planRemoveSegment(segmentIndex: number, notify = true): void {
    const plan = this.getModFlightPlan();

    const segment = plan.getSegment(segmentIndex);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);

    if (plan.directToData.segmentIndex >= 0) {
      if (segmentIndex < plan.directToData.segmentIndex) {
        plan.setDirectToData(plan.directToData.segmentIndex - 1, plan.directToData.segmentLegIndex);
      } else if (segmentIndex === plan.directToData.segmentIndex) {
        plan.setDirectToData(-1);
      }
    }

    // If the segment we are trying to delete is the active one,
    // then we need to do something to preserve the active legs so they aren't deleted.
    // We only need to do this for the Enroute segment, because if other segments are getting deleted,
    // their functions are already handling this.
    if (activeSegmentIndex === segmentIndex && !Simplane.getIsGrounded() && plan.length > 1 && segment.segmentType === FlightPlanSegmentType.Enroute) {
      // I think this block of code is only supposed to run when called from the cleanupLegsAfterApproach() function
      const currentToLeg = plan.getLeg(plan.activeLateralLeg);
      const currentFromLeg = plan.getLeg(plan.activeLateralLeg - 1);

      const newToLeg = Object.assign({}, currentToLeg.leg);
      const newFromLeg = Object.assign({}, currentFromLeg.leg);
      const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);

      if (BitFlags.isAll(currentToLeg.flags, LegDefinitionFlags.DirectTo)) {
        const discoLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 2).leg);

        plan.addLeg(lastEnrouteSegmentIndex, discoLeg, undefined, LegDefinitionFlags.DirectTo);
        plan.addLeg(lastEnrouteSegmentIndex, newFromLeg, undefined, LegDefinitionFlags.DirectTo);
        plan.addLeg(lastEnrouteSegmentIndex, newToLeg, undefined, LegDefinitionFlags.DirectTo | Epic2ExtraLegDefinitionFlags.DirectToTarget);

      } else {
        plan.addLeg(lastEnrouteSegmentIndex, newFromLeg, undefined);
        plan.addLeg(lastEnrouteSegmentIndex, newToLeg, undefined);
      }

      const newSegment = plan.getSegment(lastEnrouteSegmentIndex);

      const newActiveLegIndex = newSegment.offset + newSegment.legs.length - 1;
      plan.setCalculatingLeg(newActiveLegIndex - 2);
      plan.setLateralLeg(newActiveLegIndex);
    } else {
      const newActiveLegIndex = plan.activeLateralLeg - Utils.Clamp(plan.activeLateralLeg - segment.offset, 0, segment.legs.length);
      plan.setCalculatingLeg(newActiveLegIndex);
      plan.setLateralLeg(newActiveLegIndex);
    }

    plan.removeSegment(segmentIndex, notify);
    plan.calculate(plan.activeLateralLeg - 1);
  }

  /**
   * Checks whether of two consecutive flight plan legs, the second is a duplicate of the first. The second leg is
   * considered a duplicate if and only if it is an IF, TF, or DF leg with the same terminator fix as the first leg,
   * which is also an IF, TF, or DF leg.
   * @param leg1 The first leg.
   * @param leg2 The second leg.
   * @returns whether the second leg is a duplicate of the first.
   */
  private isDuplicateLeg(leg1: FlightPlanLeg, leg2: FlightPlanLeg): boolean {
    if (leg1.type === LegType.Discontinuity && leg2.type === LegType.Discontinuity) {
      return true;
    }

    if (
      leg2.type !== LegType.IF
      && leg2.type !== LegType.DF
      && leg2.type !== LegType.TF
      && leg2.type !== LegType.CF
    ) {
      return false;
    }

    return (leg1.type === LegType.IF
      || leg1.type === LegType.TF
      || leg1.type === LegType.DF
      || leg1.type === LegType.CF)
      && ICAO.getRegionCode(leg1.fixIcao) === ICAO.getRegionCode(leg2.fixIcao)
      && ICAO.getIdent(leg1.fixIcao) === ICAO.getIdent(leg2.fixIcao)
      && ICAO.getFacilityType(leg1.fixIcao) === ICAO.getFacilityType(leg2.fixIcao);
  }

  /**
   * Checks whether of two consecutive flight plan legs, the second is an IF leg and is a duplicate of the first. The
   * IF leg is considered a duplicate if and only if its fix is the same as the fix at which the first leg terminates.
   * @param leg1 The first leg.
   * @param leg2 The second leg.
   * @returns whether the second leg is an duplicate IF leg of the first.
   */
  private isDuplicateIFLeg(leg1: FlightPlanLeg, leg2: FlightPlanLeg): boolean {
    if (leg2.type !== LegType.IF) {
      return false;
    }
    if (
      leg1.type !== LegType.TF
      && leg1.type !== LegType.DF
      && leg1.type !== LegType.RF
      && leg1.type !== LegType.CF
      && leg1.type !== LegType.AF
      && leg1.type !== LegType.IF
    ) {
      return false;
    }

    return ICAO.getRegionCode(leg1.fixIcao) === ICAO.getRegionCode(leg2.fixIcao)
      && ICAO.getIdent(leg1.fixIcao) === ICAO.getIdent(leg2.fixIcao)
      && ICAO.getFacilityType(leg1.fixIcao) === ICAO.getFacilityType(leg2.fixIcao);
  }

  /**
   * Merges two duplicate legs such that the new merged leg contains the fix type and altitude data from the source leg
   * and all other data is derived from the target leg.
   * @param target The target leg.
   * @param source The source leg.
   * @returns the merged leg.
   */
  private mergeDuplicateLegData(target: FlightPlanLeg, source: FlightPlanLeg): FlightPlanLeg {
    const merged = FlightPlan.createLeg(target);
    merged.fixTypeFlags |= source.fixTypeFlags;
    merged.altDesc = source.altDesc;
    merged.altitude1 = source.altitude1;
    merged.altitude2 = source.altitude2;
    merged.speedRestriction = source.speedRestriction;
    return merged;
  }

  /**
   * Deletes one of two consecutive duplicate legs. If one leg is in a procedure and the other is not, the leg that is
   * a procedure will be deleted. If the legs are in different procedures, the earlier leg will be deleted.
   * Otherwise, the later leg will be deleted. If the deleted leg is the target leg of a direct to, the legs in the
   * direct to sequence will be copied and moved to immediately follow the duplicate leg that was not deleted.
   * @param leg1 The first duplicate leg.
   * @param leg2 The second duplicate leg.
   * @returns the leg that was deleted, or null if neither leg was deleted.
   * @throws Error if direct to legs could not be updated.
   */
  private planRemoveDuplicateLeg(leg1: LegDefinition, leg2: LegDefinition): LegDefinition | null {
    const plan = this.getModFlightPlan();

    const leg1Segment = plan.getSegmentFromLeg(leg1);
    const leg2Segment = plan.getSegmentFromLeg(leg2);
    const leg1GlobalIndex = plan.getLegIndexFromLeg(leg1);
    const leg2GlobalIndex = plan.getLegIndexFromLeg(leg2);

    if (!leg1Segment || !leg2Segment) {
      return null;
    }

    const isLeg1DirectToLeg = BitFlags.isAll(leg1.flags, LegDefinitionFlags.DirectTo);
    const isLeg2DirectToLeg = BitFlags.isAll(leg2.flags, LegDefinitionFlags.DirectTo);
    const dupDirectToLeg = isLeg1DirectToLeg ? leg1
      : isLeg2DirectToLeg ? leg2
        : null;

    if (dupDirectToLeg) {
      if (dupDirectToLeg.leg.type === LegType.IF) {
        // Technically this should never happen.
        return null;
      } else {
        // If one of the duplicates is the second leg in a direct to sequence, then the true duplicated leg is the
        // target leg of the DTO. In this case, we call this method with the DTO target leg replacing the DTO leg.
        const dtoTargetLeg = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
        return isLeg1DirectToLeg ? this.planRemoveDuplicateLeg(dtoTargetLeg, leg2) : this.planRemoveDuplicateLeg(leg1, dtoTargetLeg);
      }
    }

    const isLeg1InProc = leg1Segment.segmentType !== FlightPlanSegmentType.Enroute;
    const isLeg2InProc = leg2Segment.segmentType !== FlightPlanSegmentType.Enroute;

    let toDeleteSegment;
    let toDeleteIndex;
    let toDeleteLeg;

    // TODO Probably shouldn't modify the LegDefinition like this,
    // TODO because events won't fire and things won't know that it changed.

    // If leg1 is in a procedure, and leg2 not, we want to delete leg1 because when reloading that procedure, it will
    // come back - unlike leg2, which is in the enroute, and would not be reloaded.
    // The opposite is true if leg1 is not, and leg2 is in a procedure.

    if (isLeg1InProc && !isLeg2InProc) {
      // Leg1 in proc + Leg2 not in proc - take data from Leg1
      toDeleteSegment = leg1Segment;
      toDeleteIndex = leg1GlobalIndex - leg1Segment.offset;
      leg2.leg = this.mergeDuplicateLegData(leg2.leg, leg1.leg);
      toDeleteLeg = leg1;
    } else if (isLeg1InProc && isLeg2InProc) {
      // Leg1 in proc + Leg2 in proc - leave Leg2 alone
      toDeleteSegment = leg1Segment;
      toDeleteIndex = leg1GlobalIndex - leg1Segment.offset;
      toDeleteLeg = leg1;
    } else {
      // Leg1 not in proc + Leg2 in proc - take data from Leg2
      toDeleteSegment = leg2Segment;
      toDeleteIndex = leg2GlobalIndex - leg2Segment.offset;
      leg1.leg = this.mergeDuplicateLegData(leg1.leg, leg2.leg);
      toDeleteLeg = leg2;
    }

    // If the kept leg is not in a procedure, we need to manually generate the leg vertical data, as we won't get to it when doing it for
    // the procedure segments later
    if (isLeg1InProc !== isLeg2InProc) {
      const keptLeg = toDeleteLeg === leg1 ? leg2 : leg1;
      const keptLegSegment = toDeleteLeg === leg1 ? leg2Segment : leg1Segment;

      const forceVerticalFlightPhase = (toDeleteSegment.segmentType === FlightPlanSegmentType.Departure || BitFlags.isAll(keptLeg.flags, LegDefinitionFlags.MissedApproach))
        ? VerticalFlightPhase.Climb
        : VerticalFlightPhase.Descent;

      this.generateLegVerticalData(plan, keptLegSegment.segmentIndex, (toDeleteLeg === leg1 ? leg2GlobalIndex : leg1GlobalIndex) - keptLegSegment.offset, forceVerticalFlightPhase);
    }

    if (toDeleteIndex >= 0) {
      const dtoTargetLeg = plan.directToData.segmentIndex < 0 ? null : plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
      const needMoveDtoLegs = toDeleteLeg === dtoTargetLeg;

      if (needMoveDtoLegs) {
        const isDtoExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;

        // If the removed leg was the target leg of a DTO existing, we need to shift the DTO legs to target the leg
        // that was not removed.

        const oldDiscoLeg = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        const oldDtoLeg1 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        const oldDtoLeg2 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);

        if (!oldDtoLeg1 || !oldDtoLeg2 || !oldDiscoLeg) {
          throw new Error(`Fms: Could not remove direct to legs starting at segment index ${plan.directToData.segmentIndex}, leg index ${plan.directToData.segmentLegIndex} during duplicate leg resolution.`);
        }

        const preservedLeg = toDeleteLeg === leg1 ? leg2 : leg1;
        const preservedLegIndex = plan.getLegIndexFromLeg(preservedLeg);

        const newTargetSegmentIndex = plan.getSegmentIndex(preservedLegIndex);
        const newTargetSegmentLegIndex = preservedLegIndex - plan.getSegment(newTargetSegmentIndex).offset;

        plan.setDirectToData(newTargetSegmentIndex, newTargetSegmentLegIndex);

        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDiscoLeg.leg), newTargetSegmentLegIndex + 1,
          LegDefinitionFlags.DirectTo);
        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg1.leg), newTargetSegmentLegIndex + 2,
          LegDefinitionFlags.DirectTo);
        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg2.leg), newTargetSegmentLegIndex + 3,
          LegDefinitionFlags.DirectTo | Epic2ExtraLegDefinitionFlags.DirectToTarget);

        if (isDtoExistingActive) {
          plan.setLateralLeg(preservedLegIndex + 3);
        }
      }

      const success = this.planRemoveLeg(toDeleteSegment.segmentIndex, toDeleteIndex, true, false, needMoveDtoLegs);

      if (success) {
        return toDeleteLeg;
      }
    }

    return null;
  }

  /**
   * Sets the approach details for the loaded approach and sends an event across the bus.
   * @param approachLoaded Whether an approach is loaded.
   * @param approachType The approach type.
   * @param approachRnavType The approach RNAV type.
   * @param approachIsActive Whether the approach is active.
   * @param approachIsCircling Whether the approach is a circling approach.
   * @param approachName The name of the approach.
   * @param approachRunway The runway associated with the approach
   * @param missedApproachFacility Missed Approach Point facility for the approach
   * @param referenceFacility The reference navaid for the approach
   * @param finalApproachCourse The final approach course (-1 is invalid)
   * @param selectedRnavMinima The selected RNAV minima for the approach
   * @todo This data is currently set with any flightplan approach edits and isn't aware of mod plan, secondary plan etc.
   * If an edit is cancelled it will retain the previously edited data. It **does not** reflect the active flightplan state.
   */
  private setApproachDetails(
    approachLoaded?: boolean,
    approachType?: ExtendedApproachType,
    approachRnavType?: RnavTypeFlags,
    approachIsActive?: boolean,
    approachIsCircling?: boolean,
    approachName?: string,
    approachRunway?: string,
    missedApproachFacility?: Facility | null,
    referenceFacility?: VorFacility | null,
    finalApproachCourse?: number,
    selectedRnavMinima?: RnavMinima,
  ): void {
    // reduce the MAP facility down to the basic facility fields for syncing on the bus
    const baseMissedApproachFacility = missedApproachFacility ? Epic2FmsUtils.getBaseFacility(missedApproachFacility) : missedApproachFacility;

    const approachDetails: ApproachDetails = {
      approachLoaded: approachLoaded !== undefined ? approachLoaded : this.approachDetails.approachLoaded,
      approachType: approachType !== undefined ? approachType : this.approachDetails.approachType,
      approachRnavType: approachRnavType !== undefined ? approachRnavType : this.approachDetails.approachRnavType,
      approachIsActive: approachIsActive !== undefined ? approachIsActive : this.approachDetails.approachIsActive,
      approachIsCircling: approachIsCircling !== undefined ? approachIsCircling : this.approachDetails.approachIsCircling,
      approachName: approachName !== undefined ? approachName : this.approachDetails.approachName,
      approachRunway: approachRunway !== undefined ? approachRunway : this.approachDetails.approachRunway,
      missedApproachFacility: baseMissedApproachFacility !== undefined ? baseMissedApproachFacility : this.approachDetails.missedApproachFacility,
      referenceFacility: referenceFacility !== undefined ? referenceFacility : this.approachDetails.referenceFacility,
      finalApproachCourse: finalApproachCourse !== undefined ? finalApproachCourse : this.approachDetails.finalApproachCourse,
      selectedRnavMinima: selectedRnavMinima !== undefined ? selectedRnavMinima :
        (approachRnavType ? Epic2FmsUtils.getHighestRnavMinimaFromRnavType(approachRnavType) : this.approachDetails.selectedRnavMinima)
    };
    if (approachDetails.approachIsActive && !approachDetails.approachLoaded) {
      this.checkApproachState();
      return;
    }

    if (approachDetails !== this.approachDetails) {
      this.approachDetails = approachDetails;
      this.bus.getPublisher<Epic2FmsEvents>().pub('epic2_fms_approach_details_set', this.approachDetails, true);
      this.bus.getPublisher<Epic2FmsEvents>().pub('epic2_fms_approach_available', approachDetails.approachIsActive && approachDetails.approachLoaded, true);
      this.bus.getPublisher<VNavDataEvents>().pub('approach_supports_gp', Epic2FmsUtils.doesApproachSupportGp(this.approachDetails), true);
      this.bus.getPublisher<ControlEvents>().pub('approach_available', approachDetails.approachIsActive && approachDetails.approachLoaded, true);
    }
  }

  /**
   * Sets the RNAV minima in the FMS approach details
   * @param minima The RNAV minima to set
   */
  public setRnavMinima(minima: RnavMinima): void {
    this.setApproachDetails(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, minima);
  }

  /**
   * Checks if an RNAV approach can be activated in the AP.
   * @param cdiScaling The current CDI Scaling Label
   * @returns Whether approach can activate.
   */
  private canApproachActivate(cdiScaling = this.flightArea.get()): boolean {
    const apprModeAvailable = cdiScaling === Epic2FlightArea.Arrival || cdiScaling === Epic2FlightArea.Approach;
    return this.approachDetails.approachLoaded && apprModeAvailable;
  }

  /**
   * Sets the approach details when an approach_details_set event is received from the bus.
   * @param approachDetails The approachDetails received from the bus.
   */
  private onApproachDetailsSet = (approachDetails: ApproachDetails): void => {
    if (approachDetails !== this.approachDetails) {
      this.approachDetails = approachDetails;
    }
    const canApproachActivate = this.canApproachActivate();
    if (!canApproachActivate && this.approachDetails.approachIsActive) {
      this.setApproachDetails(undefined, undefined, undefined, canApproachActivate);
    }
  };

  /**
   * Get the true course for the final approach
   * @param facility Destination airport facility
   * @param approach The approach
   * @returns the true course for the final approach.
   */
  public async getFinalApproachTrueCourse(facility: AirportFacility, approach: ApproachProcedure): Promise<number> {
    // the final leg is guaranteed to be CF, TF, or RF
    // the default navdata doesn't code a course on TFs (navigraph does)
    const finalLeg = approach.finalLegs[approach.finalLegs.length - 1];
    if (finalLeg.type === LegType.CF && finalLeg.trueDegrees) {
      return finalLeg.course;
    }

    let trueCourse = MagVar.magneticToTrue(finalLeg.course, facility.lat, facility.lon);
    if (finalLeg.type === LegType.TF) {
      const finalFacility = await this.facLoader.getFacility(ICAO.getFacilityType(finalLeg.fixIcao), finalLeg.fixIcao);
      const penultimateLeg = approach.finalLegs[approach.finalLegs.length - 2];
      if (!finalFacility || !penultimateLeg) {
        return -1;
      }
      // guaranteed to be XF
      const penultimateFacility = await this.facLoader.getFacility(ICAO.getFacilityType(penultimateLeg.fixIcao), penultimateLeg.fixIcao);
      if (!penultimateFacility) {
        return -1;
      }
      const penultimatePoint = Epic2Fms.geoPointCache[0].set(penultimateFacility);
      trueCourse = penultimatePoint.bearingTo(finalFacility);
    } else if (finalLeg.type === LegType.RF) {
      // for exactly one airport in the world... but it is legal
      const finalFacility = await this.facLoader.getFacility(ICAO.getFacilityType(finalLeg.fixIcao), finalLeg.fixIcao);
      const centreFacility = await this.facLoader.getFacility(ICAO.getFacilityType(finalLeg.arcCenterFixIcao), finalLeg.arcCenterFixIcao);
      if (!finalFacility || !centreFacility) {
        return -1;
      }
      const finalPoint = Epic2Fms.geoPointCache[0].set(finalFacility);
      trueCourse = NavMath.normalizeHeading(finalPoint.bearingTo(centreFacility) + (finalLeg.turnDirection === LegTurnDirection.Left ? 90 : -90));
    }

    return trueCourse;
  }

  /**
   * Get the magnetic course for the final approach
   * @param facility Destination airport facility
   * @param approach The approach
   * @param trueCourse The true course if already calculated, else it will be calculated
   * @returns the magnetic course for the final approach.
   */
  private async getFinalApproachCourse(facility: AirportFacility, approach: ApproachProcedure, trueCourse?: number): Promise<number> {
    if (trueCourse === undefined) {
      trueCourse = await this.getFinalApproachTrueCourse(facility, approach);
    }

    // the final leg is guaranteed to be CF, TF, or RF
    // the default navdata doesn't code a course on TFs (navigraph does)
    const finalLeg = approach.finalLegs[approach.finalLegs.length - 1];

    // use the published airport magvar for terminal legs, except VHF navaids which use station declination
    let magVar = MagVar.get(facility.lat, facility.lon);
    if (finalLeg.originIcao !== ICAO.emptyIcao && ICAO.getFacilityType(finalLeg.originIcao) === FacilityType.VOR && finalLeg.type !== LegType.TF) {
      const originFacility = await this.facLoader.getFacility(ICAO.getFacilityType(finalLeg.originIcao), finalLeg.originIcao) as VorFacility;
      // ILS approach must use the ILS declination
      if (originFacility && originFacility.type === VorType.ILS) {
        magVar = -originFacility.magneticVariation;
      }
    } else if (finalLeg.fixIcao !== ICAO.emptyIcao && ICAO.getFacilityType(finalLeg.fixIcao) === FacilityType.VOR && finalLeg.type !== LegType.TF) {
      const fixFacility = await this.facLoader.getFacility(ICAO.getFacilityType(finalLeg.originIcao), finalLeg.originIcao) as VorFacility;
      if (fixFacility) {
        magVar = -fixFacility.magneticVariation;
      }
    }

    return MagVar.trueToMagnetic(trueCourse, magVar);
  }

  /**
   * Returns a flight plan's visual approach, as the runway designator of the approach
   *
   * @param planIndex the plan index
   *
   * @returns a string
   */
  public getFlightPlanVisualApproach(planIndex: number): string | undefined {
    return this.getFlightPlan(planIndex).getUserData<string | undefined>(Epic2UserDataKeys.USER_DATA_KEY_VISUAL_APPROACH);
  }

  /**
   * Returns a flight plan's visual approach, as the runway designator of the approach
   *
   * @param planIndex the plan index
   * @param runwayDesignator the visual approach's runway designator
   */
  public setFlightPlanVisualApproach(planIndex: number, runwayDesignator: string | undefined): void {
    this.getFlightPlan(planIndex).setUserData<string | undefined>(Epic2UserDataKeys.USER_DATA_KEY_VISUAL_APPROACH, runwayDesignator);
  }

  /**
   * Deletes a flight plan's visual approach
   *
   * @param planIndex the plan index
   */
  public deleteFlightPlanVisualApproach(planIndex: number): void {
    this.getFlightPlan(planIndex).deleteUserData(Epic2UserDataKeys.USER_DATA_KEY_VISUAL_APPROACH);
  }

  /**
   * Returns a flight plan's visual approach VFR vertical path angle
   *
   * @param planIndex the plan index
   *
   * @returns a number, in degrees
   */
  public getFlightPlanVisualApproachVfrVpa(planIndex: number): number | undefined {
    return this.getFlightPlan(planIndex).getUserData<number | undefined>(Epic2UserDataKeys.USER_DATA_KEY_VISUAL_APPROACH_VFR_VPA);
  }

  /**
   * Sets a flight plan's visual approach VFR vertical path angle
   *
   * @param planIndex the plan index
   * @param vpa the visual approach's VFR vertical path angle, in degrees
   */
  public setFlightPlanVisualApproachVfrVpa(planIndex: number, vpa: number | undefined): void {
    this.getFlightPlan(planIndex).setUserData<number | undefined>(Epic2UserDataKeys.USER_DATA_KEY_VISUAL_APPROACH_VFR_VPA, vpa);
  }

  /**
   * Creates a lat long waypoint
   * @param latLong The geopoint representing the lat long
   * @returns The created LL user facility
   * @throws If there are more than 99 user waypoints
   */
  public createLLWaypoint(latLong: GeoPointInterface): UserFacility {
    const userFacilities = this.getUserFacilities();
    if (userFacilities.length >= 100) {
      throw Error('PILOT WPT LIST FULL');
    }
    const facilities = userFacilities.filter((facility) => facility.icao.includes('LL'));
    const lastLL = facilities.length > 0 ? facilities[facilities.length - 1] : { icao: '00' };
    const ident = 'LL' + (Number(lastLL.icao.trim().slice(-2)) + 1).toString().padStart(2, '0');
    const icao = `U      ${ident.substring(0, 4)}`;
    const userFacility = UserFacilityUtils.createFromLatLon(icao, latLong.lat, latLong.lon);

    this.addUserFacility(userFacility);

    return userFacility;
  }

  /**
   * Creates a place bearing distance waypoint
   * @param facility The place
   * @param bearing The bearing
   * @param distance The distance
   * @returns The created PBD user facility
   * @throws If there are more than 99 user waypoints
   */
  public createPBDWaypoint(facility: Facility, bearing: number, distance: number): UserFacility {
    const inPoint = new GeoPoint(facility.lat, facility.lon);
    const outPoint = new GeoPoint(0, 0);

    const magvar = Facilities.getMagVar(facility.lat, facility.lon);
    const actualBearing = bearing + magvar;

    inPoint.offset(actualBearing, UnitType.GA_RADIAN.convertFrom(distance, UnitType.NMILE), outPoint);

    const userFacilities = this.getUserFacilities();
    if (userFacilities.length >= 100) {
      throw Error('PILOT WPT LIST FULL');
    }
    const pbdFacilities = userFacilities.filter((pbdFacility) => pbdFacility.icao.includes('LL'));
    const lastPbd = pbdFacilities.length > 0 ? pbdFacilities[pbdFacilities.length - 1] : { icao: '00' };
    const ident = 'LL' + (Number(lastPbd.icao.trim().slice(-2)) + 1).toString().padStart(2, '0');
    const icao = `U      ${ident.substring(0, 5)}`;
    const userFacility = UserFacilityUtils.createFromLatLon(icao, outPoint.lat, outPoint.lon);

    this.addUserFacility(userFacility);

    return userFacility;
  }

  /**
   * Creates a place bearing distance waypoint
   * @param facilityA Place 1
   * @param bearingA Bearing 1
   * @param facilityB Place 2
   * @param bearingB Bearing 2
   * @returns The created PBPB user facility
   * @throws If there are more than 99 user waypoints
   */
  public createPBPBWaypoint(facilityA: Facility, bearingA: number, facilityB: Facility, bearingB: number): null | UserFacility {
    const inPointA = new GeoPoint(facilityA.lat, facilityA.lon);
    const circleA = GeoCircle.createGreatCircleFromPointBearing(inPointA, bearingA);
    const inPointB = new GeoPoint(facilityB.lat, facilityB.lon);
    const circleB = GeoCircle.createGreatCircleFromPointBearing(inPointB, bearingB);

    const out: GeoPoint[] = [];
    const outPoint = new GeoPoint(0, 0);
    const numIntersections = circleA.intersectionGeoPoint(circleB, out);

    if (numIntersections !== 2) {
      return null;
    }

    const intersection1 = out[0];
    const intersection2 = out[1];

    const distance1 = intersection1.distance(inPointA);
    const distance2 = intersection2.distance(inPointA);

    if (distance1 < distance2) {
      outPoint.set(intersection1);
    } else {
      outPoint.set(intersection2);
    }

    const userFacilities = this.getUserFacilities();
    if (userFacilities.length >= 100) {
      throw Error('PILOT WPT LIST FULL');
    }
    const facilities = userFacilities.filter((facility) => facility.icao.includes('RR'));
    const lastPbd = facilities.length > 0 ? facilities[facilities.length - 1] : { icao: '00' };
    const ident = 'RR' + (Number(lastPbd.icao.trim().slice(-2)) + 1).toString().padStart(2, '0');
    const icao = `U      ${ident.substring(0, 4)}`;
    const userFacility = UserFacilityUtils.createFromLatLon(icao, outPoint.lat, outPoint.lon);

    this.addUserFacility(userFacility);

    return userFacility;
  }
}
