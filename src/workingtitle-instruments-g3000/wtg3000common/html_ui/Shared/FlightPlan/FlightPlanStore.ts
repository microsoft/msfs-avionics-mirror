/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  APEvents, ActiveLegType, AdcEvents, AirportFacility, AltitudeRestrictionType, ApproachProcedure, ApproachTransition,
  BasicNavAngleSubject, BasicNavAngleUnit, ClockEvents, ConsumerSubject, DirectToData, EngineEvents, EnrouteTransition,
  EventBus, FacilityType, FlightPlan, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanDirectToDataEvent,
  FlightPlanIndicationEvent, FlightPlanLegEvent, FlightPlanOriginDestEvent, FlightPlanPredictorUtils,
  FlightPlanProcedureDetailsEvent, FlightPlanSegment, FlightPlanSegmentEvent, FlightPlanSegmentType,
  FlightPlanUserDataEvent, FlightPlanUtils, GNSSEvents, ICAO, LNavDataEvents, LegDefinition, LegEventType, MagVar,
  MappedSubject, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, NumberUnitSubject, OneWayRunway,
  OriginDestChangeType, Procedure, ReadonlySubEvent, RunwayTransition, RunwayUtils, SegmentEventType, SimVarValueType,
  SimpleUnit, SpeedRestrictionType, StringUtils, SubEvent, Subject, Subscribable, UnitFamily, UnitType, VNavLeg,
  VNavPathCalculator, VNavUtils, VerticalFlightPhase,
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms, FmsUtils, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { FlightPlanLegData, FlightPlanLegListData } from './FlightPlanLegListData';
import { FlightPlanSegmentData } from './FlightPlanSegmentListData';

const UNUSABLE_FUEL_QUANTITY_GALLONS = SimVar.GetSimVarValue('UNUSABLE FUEL TOTAL QUANTITY', SimVarValueType.GAL) as number;

/** Listens for flight plan events, and stores data as subjects to be used by the gtc flight plan page. */
export class FlightPlanStore {
  // public readonly flightPlanListManager: FlightPlanListManager;

  private readonly _segmentMap = new Map<FlightPlanSegment, FlightPlanSegmentData>();
  /** Unordered map of FlightPlanSegments to segment list data items.
   * Segments are added/removed to/from this map to match the flight plan. */
  public readonly segmentMap = this._segmentMap as ReadonlyMap<FlightPlanSegment, FlightPlanSegmentData>;

  private readonly _legMap = new Map<LegDefinition, FlightPlanLegData>();
  /** Unordered map of leg definitions to leg list data items.
   * Legs are added/removed to/from this map to match the flight plan. */
  public readonly legMap = this._legMap as ReadonlyMap<LegDefinition, FlightPlanLegData>;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly _activePlanIndex = Subject.create<undefined | number>(undefined);
  public readonly activePlanIndex = this._activePlanIndex as Subscribable<undefined | number>;

  private readonly _flightPlanName = Subject.create<string | undefined>(undefined);
  public readonly flightPlanName = this._flightPlanName as Subscribable<string | undefined>;

  // Events
  private readonly _flightPlanLegsChanged = new SubEvent<void, FlightPlan>();
  /** An event which fires when legs are added to or removed from this store's flight plan. */
  public readonly flightPlanLegsChanged = this._flightPlanLegsChanged as ReadonlySubEvent<void, FlightPlan>;

  // Origin
  private readonly _originIdent = Subject.create<string | undefined>(undefined);
  public readonly originIdent = this._originIdent as Subscribable<string | undefined>;
  private readonly _originFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly originFacility = this._originFacility as Subscribable<AirportFacility | undefined>;
  private readonly _originRunway = Subject.create<OneWayRunway | undefined>(undefined);
  public readonly originRunway = this._originRunway as Subscribable<OneWayRunway | undefined>;
  public readonly originRunwayName = this._originRunway.map(x => x?.designation);

  // Departure
  private readonly _departureProcedure = Subject.create<Procedure | undefined>(undefined);
  public readonly departureProcedure = this._departureProcedure as Subscribable<Procedure | undefined>;
  private readonly _departureTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  public readonly departureTransition = this._departureTransition as Subscribable<EnrouteTransition | undefined>;
  public readonly departureTransitionName = this._departureTransition.map(x => x?.name);
  private readonly _departureTransitionIndex = Subject.create(-1);
  public readonly departureTransitionIndex = this._departureTransitionIndex as Subscribable<number>;
  private readonly _departureRunwayTransitionIndex = Subject.create(-1);
  public readonly departureRunwayTransitionIndex = this._departureRunwayTransitionIndex as Subscribable<number>;
  public readonly departureString = MappedSubject.create(([origin, departure, transitionIndex, runway]) => {
    if (origin && departure) {
      return StringUtils.useZeroSlash(FmsUtils.getDepartureNameAsString(origin, departure, transitionIndex, runway));
    } else {
      return '';
    }
  }, this._originFacility, this._departureProcedure, this._departureTransitionIndex, this._originRunway);
  public readonly departureText1 = MappedSubject.create(([originIdent, departure, originRunwayName]) => {
    if (originIdent === undefined) {
      return '';
    } else if (originRunwayName === undefined) {
      return StringUtils.useZeroSlash(`Origin – ${originIdent}`);
    } else if (departure === undefined) {
      return StringUtils.useZeroSlash(`Origin – ${originIdent} – RW${originRunwayName}`);
    } else {
      return 'Departure –';
    }
  }, this._originIdent, this._departureProcedure, this.originRunwayName);
  public readonly departureText2 = MappedSubject.create(([originIdent, departure, originRunwayName, departureString]) => {
    if (originIdent === undefined) {
      return '';
    } else if (originRunwayName === undefined) {
      return '';
    } else if (departure === undefined) {
      return '';
    } else {
      return departureString ?? '';
    }
  }, this._originIdent, this._departureProcedure, this.originRunwayName, this.departureString);
  public readonly departureTextOneLine = MappedSubject.create(([departureText1, departureText2]) => {
    return `${departureText1} ${departureText2}`.trim();
  }, this.departureText1, this.departureText2);
  private readonly _departureSegmentData = Subject.create<FlightPlanSegmentData | undefined>(undefined);
  public readonly departureSegmentData = this._departureSegmentData as Subscribable<FlightPlanSegmentData | undefined>;

  // Destination
  private readonly _destinationIdent = Subject.create<string | undefined>(undefined);
  public readonly destinationIdent = this._destinationIdent as Subscribable<string | undefined>;
  private readonly _destinationFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly destinationFacility = this._destinationFacility as Subscribable<AirportFacility | undefined>;
  private readonly _destinationRunway = Subject.create<OneWayRunway | undefined>(undefined);
  public readonly destinationRunway = this._destinationRunway as Subscribable<OneWayRunway | undefined>;
  public readonly destinationRunwayName = this._destinationRunway.map(x => x?.designation);
  public readonly destinationString = MappedSubject.create(([destination, runway]) => {
    if (!destination) {
      return '';
    } else if (!runway) {
      return StringUtils.useZeroSlash(`Destination – ${destination}`);
    } else {
      return StringUtils.useZeroSlash(`Destination – ${destination} – RW${runway}`);
    }
  }, this.destinationIdent, this.destinationRunwayName);

  // Arrival
  private readonly _arrivalIndex = Subject.create(-1);
  public readonly arrivalIndex = this._arrivalIndex as Subscribable<number>;
  private readonly _arrivalProcedure = Subject.create<Procedure | undefined>(undefined);
  public readonly arrivalProcedure = this._arrivalProcedure as Subscribable<Procedure | undefined>;
  private readonly _arrivalTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  public readonly arrivalTransition = this._arrivalTransition as Subscribable<EnrouteTransition | undefined>;
  private readonly _arrivalTransitionIndex = Subject.create(-1);
  public readonly arrivalTransitionIndex = this._arrivalTransitionIndex as Subscribable<number>;
  private readonly _arrivalRunwayTransition = Subject.create<RunwayTransition | undefined>(undefined);
  public readonly arrivalRunwayTransition = this._arrivalRunwayTransition as Subscribable<RunwayTransition | undefined>;
  private readonly _arrivalRunway = Subject.create<OneWayRunway | undefined>(undefined);
  public readonly arrivalRunway = this._arrivalRunway as Subscribable<OneWayRunway | undefined>;
  private readonly _arrivalFacilityIcao = Subject.create<string | undefined>(undefined);
  public readonly arrivalFacilityIcao = this._arrivalFacilityIcao as Subscribable<string | undefined>;
  private readonly _arrivalFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly arrivalFacility = this._arrivalFacility as Subscribable<AirportFacility | undefined>;
  private readonly _arrivalRunwayTransitionIndex = Subject.create(-1);
  public readonly arrivalRunwayTransitionIndex = this._arrivalRunwayTransitionIndex as Subscribable<number>;
  public readonly arrivalString = MappedSubject.create(([arrivalFacility, arrival, transitionIndex, arrivalRunway]) => {
    if (arrivalFacility && arrival) {
      return StringUtils.useZeroSlash(FmsUtils.getArrivalNameAsString(arrivalFacility, arrival, transitionIndex, arrivalRunway));
    } else {
      return '';
    }
  }, this.arrivalFacility, this._arrivalProcedure, this._arrivalTransitionIndex, this.arrivalRunway);
  public readonly arrivalStringFull = this.arrivalString.map(x => `Arrival – ${x}`);
  private readonly _arrivalSegmentData = Subject.create<FlightPlanSegmentData | undefined>(undefined);
  public readonly arrivalSegmentData = this._arrivalSegmentData as Subscribable<FlightPlanSegmentData | undefined>;

  // Approach
  private readonly _visualApproachOneWayRunwayDesignation = Subject.create<string | undefined>(undefined);
  public readonly visualApproachOneWayRunwayDesignation = this._visualApproachOneWayRunwayDesignation as Subscribable<string | undefined>;
  private readonly _skipCourseReversal = Subject.create<boolean | undefined>(undefined);
  public readonly skipCourseReversal = this._skipCourseReversal as Subscribable<boolean | undefined>;
  private readonly _isApproachLoaded = Subject.create(false);
  public readonly isApproachLoaded = this._isApproachLoaded as Subscribable<boolean>;
  private readonly _approachProcedure = Subject.create<ApproachProcedure | undefined>(undefined);
  public readonly approachProcedure = this._approachProcedure as Subscribable<ApproachProcedure | undefined>;
  private readonly _approachForDisplay = MappedSubject.create(([destination, visual, approach]) => {
    if (approach) {
      return approach;
    }

    if (destination && visual) {
      const runway = RunwayUtils.matchOneWayRunwayFromDesignation(destination, visual);
      return runway ? FmsUtils.buildEmptyVisualApproach(runway) : undefined;
    }

    return undefined;
  }, this.destinationFacility, this.visualApproachOneWayRunwayDesignation, this.approachProcedure);
  public readonly approachForDisplay = this._approachForDisplay as Subscribable<ApproachProcedure | undefined>;
  private readonly _approachIndex = Subject.create(-1);
  public readonly approachIndex = this._approachIndex as Subscribable<number>;
  public readonly approachName = this._approachProcedure.map(x => x?.name);
  private readonly _approachTransition = Subject.create<ApproachTransition | undefined>(undefined);
  public readonly approachTransition = this._approachTransition as Subscribable<ApproachTransition | undefined>;
  private readonly _approachTransitionIndex = Subject.create(-1);
  public readonly approachTransitionIndex = this._approachTransitionIndex as Subscribable<number>;
  public readonly approachStringPrefix = this.approachTransitionIndex.map(index => {
    return index === -1
      ? 'VTF Apr – '
      : 'Approach – ';
  });
  private readonly _approachSegmentData = Subject.create<FlightPlanSegmentData | undefined>(undefined);
  public readonly approachSegmentData = this._approachSegmentData as Subscribable<FlightPlanSegmentData | undefined>;

  // Other
  private readonly _isThereAtLeastOneLeg = Subject.create(false);
  public readonly isThereAtLeastOneLeg = this._isThereAtLeastOneLeg as Subscribable<boolean>;
  // TODO Needs to sync between the other pages on this GTC
  public readonly addEnrouteWaypointButtonIsVisible = Subject.create(true);

  // Active leg data
  private readonly _activeLegGlobalIndex = Subject.create<number | undefined>(undefined);
  public readonly activeLegGlobalIndex = this._activeLegGlobalIndex as Subscribable<number | undefined>;
  private readonly _activeLegDtkMag = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  public readonly activeLegDtkMag = this._activeLegDtkMag as Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;
  private readonly _activeLegDtkTrue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  public readonly activeLegDtkTrue = this._activeLegDtkTrue as Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;
  private readonly _activeLegDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  public readonly activeLegDistance = this._activeLegDistance as Subscribable<NumberUnitInterface<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>>;
  private readonly _activeLeg = Subject.create<LegDefinition | undefined>(undefined);
  public readonly activeLeg = this._activeLeg as Subscribable<LegDefinition | undefined>;
  private readonly _activeLegListData = Subject.create<FlightPlanLegData | undefined>(undefined);
  public readonly activeLegListData = this._activeLegListData as Subscribable<FlightPlanLegData | undefined>;
  private readonly _activeLegSegmentIndex = Subject.create<number | undefined>(undefined);
  public readonly activeLegSegmentIndex = this._activeLegSegmentIndex as Subscribable<number | undefined>;

  // Direct to
  private readonly _directToData = Subject.create<DirectToData>({ segmentIndex: -1, segmentLegIndex: -1 });
  public readonly directToData = this._directToData as Subscribable<DirectToData>;
  public readonly directToState = MappedSubject.create(() => this.fms.getDirectToState(), this.activePlanIndex, this.directToData, this.activeLeg);
  public readonly isDirectToRandomActive = this.directToState.map(x => x === DirectToState.TORANDOM);
  public readonly isDirectToExistingActive = this.directToState.map(x => x === DirectToState.TOEXISTING);

  private readonly _directToRandomLegData = Subject.create<FlightPlanLegData | undefined>(undefined);
  public readonly directToRandomLegData = this._directToRandomLegData as Subscribable<FlightPlanLegData | undefined>;
  public readonly directToRandomLegListData = this.directToRandomLegData.map(x =>
    x === undefined ? undefined : new FlightPlanLegListData(x, undefined, this, this.unitsSettingManager));

  private readonly _directToRandomHoldLegData = Subject.create<FlightPlanLegData | undefined>(undefined);
  public readonly directToRandomHoldLegData = this._directToRandomHoldLegData as Subscribable<FlightPlanLegData | undefined>;
  public readonly directToRandomHoldLegListData = this.directToRandomHoldLegData.map(x =>
    x === undefined ? undefined : new FlightPlanLegListData(x, undefined, this, this.unitsSettingManager));

  public readonly directToExistingLeg = MappedSubject.create(([directToData, directToState]) => {
    if (directToState !== DirectToState.TOEXISTING || directToData.segmentIndex === -1 || directToData.segmentLegIndex === -1) { return undefined; }
    const plan = this.fms.getFlightPlan(this.planIndex);
    return plan.tryGetLeg(directToData.segmentIndex, directToData.segmentLegIndex);
  }, this.directToData, this.directToState);
  public readonly isDirectToRandomActiveWithHold = MappedSubject.create(([isDirectToRandomActive, directToRandomLegListData, directToRandomHoldLegListData]) => {
    if (isDirectToRandomActive && directToRandomLegListData) {
      if (directToRandomHoldLegListData) {
        return 'with-hold';
      } else {
        return 'no-hold';
      }
    }
    return false;
  }, this.isDirectToRandomActive, this.directToRandomLegListData, this.directToRandomHoldLegListData);
  private readonly _isDirectToRandomHoldLegActive = Subject.create(false);
  public readonly isDirectToRandomHoldLegActive = this._isDirectToRandomHoldLegActive as Subscribable<boolean>;

  // From leg
  private readonly _fromLeg = Subject.create<LegDefinition | undefined>(undefined);
  public readonly fromLeg = this._fromLeg as Subscribable<LegDefinition | undefined>;
  public readonly fromLegSegment = this.fromLeg.map(fromLeg => {
    if (fromLeg === undefined) { return undefined; }

    const plan = this.fms.getFlightPlan(this.planIndex);
    return plan.getSegmentFromLeg(fromLeg);
  });

  // To leg
  public readonly toLeg = MappedSubject.create(([activeLeg, directToExistingLeg, isDirectToRandomActive]) => {
    if (isDirectToRandomActive) { return undefined; }

    const toLeg = directToExistingLeg ?? activeLeg;

    if (!toLeg) { return undefined; }

    const plan = this.fms.getFlightPlan(this.planIndex);
    const indexes = FmsUtils.getLegIndexes(plan, toLeg);

    if (!indexes) { return undefined; }

    const segment = plan.getSegment(indexes.segmentIndex);

    return this.legMap.get(segment.legs[indexes.segmentLegIndex]);
  }, this.activeLeg, this.directToExistingLeg, this.isDirectToRandomActive);
  public readonly toLegSegment = this.toLeg.map(toLeg => toLeg?.segment);

  // Predictions
  private readonly fuelTotalGal = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_usable_total'), 0);
  private readonly fuelFlowTotalGph = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_flow_total'), 0);
  private readonly groundSpeedKnots = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed'), 0);
  private readonly unixSimTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);

  // Events
  public readonly beforeFlightPlanLoaded = new SubEvent<void, FlightPlan>();
  public readonly segmentAdded = new SubEvent<void, FlightPlanSegmentData>();
  public readonly segmentInserted = new SubEvent<void, FlightPlanSegmentData>();
  public readonly segmentRemoved = new SubEvent<void, [FlightPlanSegmentData, number]>();
  public readonly segmentChanged = new SubEvent<void, [FlightPlanSegmentData, number]>();
  public readonly legAdded = new SubEvent<void, [FlightPlanLegData, number, number]>();
  public readonly legRemoved = new SubEvent<void, FlightPlanLegData>();

  private currentAltitude = 0;
  private selectedAltitude = 0;

  private lastProcDetailsEvent?: FlightPlanProcedureDetailsEvent;

  private isInitialized = false;

  /**
   * Creates a new FlightPlanStore.
   * @param bus The EventBus.
   * @param fms The Fms.
   * @param planIndex Which flight plan index to listen to.
   * @param isAdvancedVnav Whether to use advanced VNAV or not.
   */
  public constructor(
    public readonly bus: EventBus,
    public readonly fms: Fms<G3000FlightPlannerId>,
    public readonly planIndex: number,
    public readonly isAdvancedVnav: boolean,
  ) { }

  /**
   * Tells the store to subscribe to the event bus.
   * @throws Error if already initialized.
   */
  public init(): void {
    if (this.isInitialized) {
      throw new Error('flight plan store is already initialized.');
    } else {
      this.isInitialized = true;
    }

    this.fms.flightPlanner.onEvent('fplSegmentChange').handle(this.handleSegmentChange);
    this.fms.flightPlanner.onEvent('fplLegChange').handle(this.handleLegChange);
    this.fms.flightPlanner.onEvent('fplActiveLegChange').handle(this.handleActiveLegChange);
    this.fms.flightPlanner.onEvent('fplOriginDestChanged').handle(this.handleOriginDestChanged);
    this.fms.flightPlanner.onEvent('fplProcDetailsChanged').handle(this.handleProcDetailsChanged);
    this.fms.flightPlanner.onEvent('fplLoaded').handle(e => {
      if (e.planIndex === this.planIndex) {
        this.handleFlightPlanLoaded();
      }
    });
    this.fms.flightPlanner.onEvent('fplCopied').handle(e => {
      if (e.targetPlanIndex === this.planIndex) {
        this.handleFlightPlanLoaded();
      }
    });
    this.fms.flightPlanner.onEvent('fplUserDataSet').handle(this.handleUserDataSet);
    this.fms.flightPlanner.onEvent('fplUserDataDelete').handle(this.handleUserDataDelete);
    this.fms.flightPlanner.onEvent('fplCalculated').handle(this.handleFlightPlanCalculated);
    this.fms.flightPlanner.onEvent('fplIndexChanged').handle(this.handleFlightPlannerActiveIndexChanged);
    this.fms.flightPlanner.onEvent('fplDirectToDataChanged').handle(this.handleDirectToDataChanged);
    this.fms.verticalPathCalculator!.vnavCalculated.on(this.handleVnavPathCalculated);

    // We do this in case fplProcDetailsChanged is received before the facloader has returned our origin/dest facilities
    this._originFacility.sub(() => this.handleProcDetailsChanged());
    this._destinationFacility.sub(() => this.handleProcDetailsChanged());

    const lnav = this.bus.getSubscriber<LNavDataEvents>();

    lnav.on('lnavdata_dtk_mag').handle(x => this._activeLegDtkMag.set(x));
    lnav.on('lnavdata_dtk_true').handle(x => this._activeLegDtkTrue.set(x));
    lnav.on('lnavdata_waypoint_distance').handle(x => this._activeLegDistance.set(x));

    // We are using the same indicated_alt event that the vnav manager is using
    this.bus.getSubscriber<AdcEvents>().on('indicated_alt').atFrequency(1).handle(alt => this.currentAltitude = alt);

    this.bus.getSubscriber<APEvents>().on('ap_altitude_selected').withPrecision(0).handle(sAlt => this.selectedAltitude = sAlt);

    this.directToState.sub(() => this.updateFromLeg());

    this.activeLegGlobalIndex.sub(() => {
      this.updateActiveLeg();
      this.updateActiveLegListItems();
    });

    // this.flightPlanTextUpdateClock.handle(() => {
    //   this.flightPlanTextUpdater!.update();
    // });
  }

  /**
   * Gets the current altitude.
   * @returns The current altitude.
   */
  public getCurrentAltitude(): number {
    return this.currentAltitude;
  }

  /**
   * Gets the selected altitude.
   * @returns The selected altitude.
   */
  public getSelectedAltitude(): number {
    return this.selectedAltitude;
  }

  /**
   * Gets the leg list data items in forward order.
   * @param startIndex The global leg index of the leg with which to start. Defaults to 0.
   * @yields The leg list data items in forward order.
   */
  public *legItems(startIndex?: number): Generator<FlightPlanLegData, void> {
    const plan = this.fms.getFlightPlan(this.planIndex);
    const legs = plan.legs(false, startIndex);

    let next = legs.next();

    while (!next.done) {
      const legItem = this.legMap.get(next.value);
      if (legItem) {
        yield legItem;
      }
      next = legs.next();
    }
  }

  /**
   * A callback fired when a new plan is loaded.
   */
  private handleFlightPlanLoaded(): void {
    for (const [segment, segItem] of this.segmentMap) {
      this.removeSegmentData(segItem, segment.segmentIndex);
    }
    this._segmentMap.clear();

    for (const [, legData] of this.legMap) {
      this.removeLegData(legData);
    }
    this._legMap.clear();

    const plan = this.fms.flightPlanner.getFlightPlan(this.planIndex);

    this.beforeFlightPlanLoaded.notify(undefined, plan);

    this._flightPlanName.set(plan.getUserData('name'));

    if (plan.originAirport !== undefined) {
      this.handleOriginDestChanged({ planIndex: this.planIndex, airport: plan.originAirport, type: OriginDestChangeType.OriginAdded });
    }

    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      this.handleSegmentChange({ planIndex: this.planIndex, segmentIndex: i, segment: segment, type: SegmentEventType.Added }, true);
      for (let l = 0; l < segment.legs.length; l++) {
        this.handleLegChange({
          planIndex: this.planIndex,
          segmentIndex: i, legIndex: l, leg: segment.legs[l], type: LegEventType.Added,
        }, true);
      }
    }

    this.doUpdates();

    this.handleProcDetailsChanged({ planIndex: this.planIndex, details: plan.procedureDetails });

    if (plan.destinationAirport !== undefined) {
      this.handleOriginDestChanged({ planIndex: this.planIndex, airport: plan.destinationAirport, type: OriginDestChangeType.DestinationAdded });
    }

    this.handleActiveLegChange({
      index: plan.activeLateralLeg,
      legIndex: plan.getSegmentLegIndex(plan.activeLateralLeg),
      planIndex: this.planIndex,
      previousLegIndex: -1,
      previousSegmentIndex: -1,
      segmentIndex: plan.getSegmentIndex(plan.activeLateralLeg),
      type: ActiveLegType.Lateral,
    });
  }

  /**
   * Handles the fplUserDataSet event.
   * @param event The FlightPlanUserDataEvent.
   */
  private readonly handleUserDataSet = (event: FlightPlanUserDataEvent): void => {
    if (event.planIndex !== this.planIndex) { return; }

    if (event.key === 'name') {
      this._flightPlanName.set(event.data);
    }
    if (event.key === 'visual_approach') {
      this._visualApproachOneWayRunwayDesignation.set(event.data);
    }
    if (event.key === 'skipCourseReversal') {
      this._skipCourseReversal.set(event.data);
    }
  };

  /**
   * Handles the fplUserDataDelete event.
   * @param event The FlightPlanUserDataEvent.
   */
  private readonly handleUserDataDelete = (event: FlightPlanUserDataEvent): void => {
    if (event.planIndex !== this.planIndex) { return; }

    if (event.key === 'name') {
      this._flightPlanName.set(undefined);
    }
    if (event.key === 'visual_approach') {
      this._visualApproachOneWayRunwayDesignation.set(undefined);
    }
    if (event.key === 'skipCourseReversal') {
      this._skipCourseReversal.set(undefined);
    }
  };

  private readonly handleOriginDestChanged = async (event: FlightPlanOriginDestEvent): Promise<void> => {
    if (event.planIndex !== this.planIndex) { return; }

    switch (event.type) {
      case OriginDestChangeType.OriginAdded: {
        this._originIdent.set(ICAO.getIdent(event.airport!));
        const fac = await this.fms.facLoader.getFacility(FacilityType.Airport, event.airport!);
        this._originFacility.set(fac);
        break;
      }
      case OriginDestChangeType.OriginRemoved:
        this._originIdent.set(undefined);
        this._originFacility.set(undefined);
        break;
      case OriginDestChangeType.DestinationAdded: {
        this._destinationIdent.set(ICAO.getIdent(event.airport!));
        const fac = await this.fms.facLoader.getFacility(FacilityType.Airport, event.airport!);
        this._destinationFacility.set(fac);
        break;
      }
      case OriginDestChangeType.DestinationRemoved:
        this._destinationIdent.set(undefined);
        this._destinationFacility.set(undefined);
        break;
    }
  };

  private readonly handleProcDetailsChanged = (event?: FlightPlanProcedureDetailsEvent): void => {
    if (!event) {
      event = this.lastProcDetailsEvent;
    }
    if (!event) { return; }
    if (event.planIndex !== this.planIndex) { return; }
    this.lastProcDetailsEvent = event;

    const plan = this.fms.flightPlanner.getFlightPlan(event.planIndex);

    this._originRunway.set(event.details.originRunway);

    const originFac = this.originFacility.get();

    const departureProcedure = originFac?.departures[event.details.departureIndex] as Procedure | undefined;
    this._departureProcedure.set(departureProcedure);
    this._departureTransitionIndex.set(event.details.departureTransitionIndex);
    this._departureTransition.set(departureProcedure?.enRouteTransitions[event.details.departureTransitionIndex]);
    this._departureRunwayTransitionIndex.set(event.details.departureRunwayIndex);

    this._destinationRunway.set(event.details.destinationRunway);

    this._arrivalIndex.set(event.details.arrivalIndex);
    this._arrivalTransitionIndex.set(event.details.arrivalTransitionIndex);
    this._arrivalRunwayTransitionIndex.set(event.details.arrivalRunwayTransitionIndex);
    this._arrivalRunway.set(event.details.arrivalRunway);
    this._arrivalFacilityIcao.set(event.details.arrivalFacilityIcao);

    if (event.details.arrivalFacilityIcao) {
      this.fms.facLoader.getFacility(FacilityType.Airport, event.details.arrivalFacilityIcao)
        .then(arrivalFacility => {
          this._arrivalFacility.set(arrivalFacility);
          const arrivalProcedure = arrivalFacility?.arrivals[this._arrivalIndex.get()] as Procedure | undefined;
          this._arrivalProcedure.set(arrivalProcedure);
          this._arrivalTransition.set(arrivalProcedure?.enRouteTransitions[this._arrivalTransitionIndex.get()]);
          this._arrivalRunwayTransition.set(arrivalProcedure?.runwayTransitions[this._arrivalRunwayTransitionIndex.get()]);
        });
    } else {
      this._arrivalFacility.set(undefined);
      this._arrivalProcedure.set(undefined);
      this._arrivalTransition.set(undefined);
      this._arrivalRunwayTransition.set(undefined);
    }

    const destinationFac = this.destinationFacility.get();

    let approachProcedure = undefined;
    if (destinationFac && destinationFac.icao === event.details.approachFacilityIcao) {
      if (event.details.approachIndex >= 0) {
        approachProcedure = destinationFac.approaches[event.details.approachIndex];
      } else if (event.details.destinationRunway) {
        approachProcedure = FmsUtils.buildEmptyVisualApproach(event.details.destinationRunway);
      }
    }

    this._approachProcedure.set(approachProcedure);
    this._approachIndex.set(event.details.approachIndex);
    this._approachTransition.set(approachProcedure?.transitions[this._approachTransitionIndex.get()]);
    this._approachTransitionIndex.set(event.details.approachTransitionIndex);
    this._isApproachLoaded.set(FmsUtils.isApproachLoaded(plan));
  };

  /**
   * Handles the segment event.
   * @param segEvent The segment event.
   * @param noUpdates When true, it will not call the extra update functions.
   * @throws Error when received an unexpected event.
   */
  private readonly handleSegmentChange = (segEvent: FlightPlanSegmentEvent, noUpdates = false): void => {
    if (segEvent.planIndex !== this.planIndex) { return; }

    switch (segEvent.type) {
      case SegmentEventType.Added: this.handleSegmentAdded(segEvent); break;
      case SegmentEventType.Inserted: this.handleSegmentInserted(segEvent); break;
      case SegmentEventType.Removed: this.handleSegmentRemoved(segEvent); break;
      case SegmentEventType.Changed: this.handleSegmentChanged(segEvent); break;
    }

    this.updateSegmentIndexes();

    if (noUpdates) { return; }

    this.doUpdates();
  };

  /**
   * Handles the segment added event.
   * @param segEvent The segment event.
   * @throws Error when the segment being added already exists.
   */
  private handleSegmentAdded(segEvent: FlightPlanSegmentEvent): void {
    // In theory, added means append to end of flight plan
    // Is only used when intializing the flight plan, or recreating it after deleting it

    const segment = segEvent.segment!;

    const newSegListItem = new FlightPlanSegmentData(segment, this.planIndex, this, this.fms.getFlightPlan(this.planIndex));

    this.handleNewSegment(newSegListItem);

    this._segmentMap.set(segment, newSegListItem);

    this.segmentAdded.notify(undefined, newSegListItem);
  }

  /**
   * Handles the segment inserted event.
   * @param segEvent The segment event.
   */
  private handleSegmentInserted(segEvent: FlightPlanSegmentEvent): void {
    const segment = segEvent.segment!;

    const newSegListItem = new FlightPlanSegmentData(segment, this.planIndex, this, this.fms.getFlightPlan(this.planIndex));

    this.handleNewSegment(newSegListItem);

    this._segmentMap.set(segment, newSegListItem);

    this.segmentInserted.notify(undefined, newSegListItem);
  }

  /**
   * Handles the segment removed event.
   * @param segEvent The segment event.
   * @throws Error when the segment being removed does not exist.
   */
  private handleSegmentRemoved(segEvent: FlightPlanSegmentEvent): void {
    const segmentListItem = this.segmentMap.get(segEvent.segment!)!;
    this.removeSegmentData(segmentListItem, segEvent.segmentIndex);
  }

  /**
   * Removes a segment data and destroys it.
   * @param segmentData The segment data.
   * @param segmentIndex The index of the segment begin removed.
   */
  private removeSegmentData(segmentData: FlightPlanSegmentData, segmentIndex: number): void {
    this._segmentMap.delete(segmentData.segment);

    this.segmentRemoved.notify(undefined, [segmentData, segmentIndex]);

    segmentData.destroy();

    switch (segmentData.segment.segmentType) {
      case FlightPlanSegmentType.Departure:
        this._departureSegmentData.set(undefined);
        break;
      case FlightPlanSegmentType.Arrival:
        this._arrivalSegmentData.set(undefined);
        break;
      case FlightPlanSegmentType.Approach:
        this._approachSegmentData.set(undefined);
        break;
    }
  }

  /**
   * Handles the segment changed event.
   * @param segEvent The segment event.
   * @throws Error when the segment being changed does not exist.
   */
  private handleSegmentChanged(segEvent: FlightPlanSegmentEvent): void {
    const segmentData = this.segmentMap.get(segEvent.segment!)!;
    segmentData.onAirwayChanged(segEvent.segment?.airway);

    this.segmentChanged.notify(undefined, [segmentData, segEvent.segmentIndex]);
  }

  /**
   * Updates fields that track certain segment types.
   * @param newSegListData The new segment list data.
   */
  private handleNewSegment(newSegListData: FlightPlanSegmentData): void {
    switch (newSegListData.segment.segmentType) {
      case FlightPlanSegmentType.Departure:
        this._departureSegmentData.set(newSegListData);
        break;
      case FlightPlanSegmentType.Arrival:
        this._arrivalSegmentData.set(newSegListData);
        break;
      case FlightPlanSegmentType.Approach:
        this._approachSegmentData.set(newSegListData);
        break;
    }
  }

  /** Iterates through the segments and updates their segment indexes. */
  private updateSegmentIndexes(): void {
    for (const [segment, segmentListData] of this.segmentMap) {
      segmentListData.updateSegmentIndex(segment.segmentIndex);
    }
  }

  /**
   * Handles the leg event.
   * @param legEvent The leg event.
   * @param noUpdates When true, it will not call the extra update functions.
   * @throws Error when received an unexpected event.
   */
  private readonly handleLegChange = (legEvent: FlightPlanLegEvent, noUpdates = false): void => {
    if (legEvent.planIndex === Fms.DTO_RANDOM_PLAN_INDEX) {
      this.handleDirectToRandomLegChange(legEvent);
      return;
    }

    if (legEvent.planIndex !== this.planIndex) { return; }

    switch (legEvent.type) {
      case LegEventType.Added: this.handleLegAdded(legEvent); break;
      case LegEventType.Removed: this.handleLegRemoved(legEvent); break;
      case LegEventType.Changed: this.handleLegChanged(legEvent); break;
    }

    if (noUpdates) { return; }

    this.doUpdates();
  };

  /**
   * Handles the leg added event.
   * @param legEvent The leg event.
   */
  private handleLegAdded(legEvent: FlightPlanLegEvent): void {
    const { leg, segmentIndex, legIndex } = legEvent;

    const plan = this.fms.getFlightPlan(this.planIndex);
    const globalLegIndex = FmsUtils.getGlobalLegIndex(plan, segmentIndex, legIndex);
    const segment = plan.getSegment(segmentIndex);
    const segmentListData = this.segmentMap.get(segment)!;

    const newLegData = new FlightPlanLegData(leg, segment, segmentListData, this.planIndex, this.isAdvancedVnav, this, plan, globalLegIndex);

    this._legMap.set(leg, newLegData);

    this.legAdded.notify(undefined, [newLegData, segmentIndex, legIndex]);
  }

  /**
   * Handles the leg removed event.
   * @param legEvent The leg event.
   */
  private handleLegRemoved(legEvent: FlightPlanLegEvent): void {
    const legListItem = this.legMap.get(legEvent.leg)!;

    this.removeLegData(legListItem);
  }

  /**
   * Removes a leg data and destroys it.
   * @param legData The leg data.
   */
  private removeLegData(legData: FlightPlanLegData): void {
    this._legMap.delete(legData.leg);

    this.legRemoved.notify(undefined, legData);

    legData.destroy();
  }

  /**
   * Handles the leg changed event. Effectively when the vertical data object on the leg was modified.
   * @param legEvent The leg event.
   */
  private handleLegChanged(legEvent: FlightPlanLegEvent): void {
    const legListData = this.legMap.get(legEvent.leg)!;

    legListData.handleLegChanged(legEvent.leg!);
  }

  /**
   * Handles a leg change in the direct to random plan.
   * @param legEvent The event.
   */
  private handleDirectToRandomLegChange(legEvent: FlightPlanLegEvent): void {
    if (legEvent.type === LegEventType.Changed && legEvent.legIndex === 2) {
      const leg = legEvent.leg;
      const legData = this.directToRandomLegData.get();

      if (!legData) { return; }

      // Altitude constraint
      legData.updateLegListDataAltitudeStuffFromVerticalData();

      // FPA
      // TODO Use vnav profile instead of hardcoding 3
      legData.fpa.set(leg.verticalData.fpa ?? 3);
      legData.isFpaEdited.set(leg.verticalData.fpa !== undefined);

      // Speed constraint
      legData.speedDesc.set(leg.verticalData.speedDesc);
      legData.speed.set(leg.verticalData.speed <= 0 ? NaN : leg.verticalData.speed);
      legData.speedUnit.set(leg.verticalData.speedUnit);
      legData.isSpeedEdited.set(leg.verticalData.speedDesc !== SpeedRestrictionType.Unused);
    } else if (legEvent.type === LegEventType.Added) {
      const isHoldLeg = legEvent.segmentIndex === 0 && legEvent.legIndex === 3 && FlightPlanUtils.isHoldLeg(legEvent.leg.leg.type);
      if (isHoldLeg) {
        const holdLegGlobalIndex = 3;
        const holdLeg = legEvent.leg;
        const plan = this.fms.getDirectToFlightPlan();
        const segment = plan.getSegment(0);

        const holdLegData = new FlightPlanLegData(holdLeg, segment, undefined, Fms.DTO_RANDOM_PLAN_INDEX, this.isAdvancedVnav, this, plan, holdLegGlobalIndex, true);
        holdLegData.isActiveLeg.set(false);
        this._directToRandomHoldLegData.get()?.destroy();
        this._directToRandomHoldLegData.set(holdLegData);
      }
    }
  }

  /**
   * Handles the active leg event.
   * @param activeLegEvent The event.
   */
  private readonly handleActiveLegChange = (activeLegEvent: FlightPlanActiveLegEvent): void => {
    if (activeLegEvent.planIndex === Fms.DTO_RANDOM_PLAN_INDEX) {
      this._isDirectToRandomHoldLegActive.set(activeLegEvent.legIndex === 3);
      if (activeLegEvent.legIndex === 2) {
        this.handleNewDirectToRandom();
      } else {
        this.directToRandomLegData.get()?.isActiveLeg.set(activeLegEvent.legIndex === 2);
        this.directToRandomHoldLegData.get()?.isActiveLeg.set(activeLegEvent.legIndex === 3);
      }
      return;
    }
    if (activeLegEvent.planIndex !== this.planIndex) { return; }
    if (activeLegEvent.type !== ActiveLegType.Lateral) { return; }


    // We can't use the segment and leg index because the can become out of date
    // TODO Fix active leg change event to send update if seg or leg index changes when global index doesn't
    this._activeLegGlobalIndex.set(activeLegEvent.legIndex < 0 ? undefined : activeLegEvent.index);
    this.updateFromLeg();
  };

  private readonly updateLegCount = (): void => {
    for (const leg of this.fms.getFlightPlan(this.planIndex).legs()) {
      if (leg) {
        this._isThereAtLeastOneLeg.set(true);
        return;
      }
    }
    this._isThereAtLeastOneLeg.set(false);
  };

  /** Updates flight plan things when segments or legs change. */
  private doUpdates(): void {
    this.updateActiveLeg();
    this.updateActiveLegListItems();
    this.updateLegs();
    this.updateLegCount();
    this.updateFromLeg();

    this._flightPlanLegsChanged.notify(undefined, this.fms.getFlightPlan(this.planIndex));
  }

  /** Updates the current from leg. */
  private updateFromLeg(): void {
    const plan = this.fms.getFlightPlan(this.planIndex);
    const activeLegGlobalIndex = this.activeLegGlobalIndex.get();

    if (activeLegGlobalIndex === undefined || this.directToState.get() !== DirectToState.NONE) {
      this._fromLeg.set(undefined);
      return;
    }

    const fromLeg = FmsUtils.getFromLegForArrowDisplay(plan, activeLegGlobalIndex);

    // Only set it if we are tracking the leg in our legMap
    // If we don't have it, it's probably during a fpl loaded event and it will get added eventually
    if (fromLeg && this.legMap.has(fromLeg)) {
      this._fromLeg.set(fromLeg);
    } else {
      this._fromLeg.set(undefined);
    }
  }

  /**
   * Handles the flight plan calculated event.
   * @param event The event.
   */
  private readonly handleFlightPlanCalculated = (event: FlightPlanCalculatedEvent): void => {
    if (event.planIndex !== this.planIndex) { return; }

    // TODO need to add up ETE as well
    let currentSegmentData: FlightPlanSegmentData | undefined;
    let segmentDistanceMeters = 0;
    const usableFuelGal = this.fuelTotalGal.get() - UNUSABLE_FUEL_QUANTITY_GALLONS;
    const fuelFlowTotalGph = this.fuelFlowTotalGph.get();
    // Standard minimum ground speed for predictions for Garmin
    const minimumPredictionsGroundSpeed = 30;
    const currentGsKnots = this.groundSpeedKnots.get() < minimumPredictionsGroundSpeed ? NaN : this.groundSpeedKnots.get();
    const unixSimTimeMs = this.unixSimTime.get();
    const unixSimTimeSeconds = UnitType.MILLISECOND.convertTo(unixSimTimeMs, UnitType.SECOND);
    const utcSeconds = unixSimTimeSeconds % (3600 * 24);
    const toLeg = this.toLeg.get();

    let fuelRemainingGal = usableFuelGal;
    let lastEtaUtcSeconds = utcSeconds;
    let foundActiveLeg = false;
    let cumulativeDistanceMeters = 0;
    let cumulativeTimeEnrouteSeconds = 0;

    // When handling the flight plan calculated event,
    // it's important to not iterate on the plan segments/legs,
    // but to instead keep track of leg reference and just grab from leg.calculated.
    // This is because in rare cases, when getting the calc event,
    // the plan might not match what legs we are tracking.
    for (const item of this.legItems()) {
      if (item.segmentData !== currentSegmentData) {
        if (currentSegmentData) {
          currentSegmentData.distance.set(segmentDistanceMeters, UnitType.METER);
          const segmentEte = FlightPlanPredictorUtils.predictTime(currentGsKnots, UnitType.METER.convertTo(segmentDistanceMeters, UnitType.NMILE));
          currentSegmentData.estimatedTimeEnroute.set(segmentEte, UnitType.SECOND);
          segmentDistanceMeters = 0;
        }
        currentSegmentData = item.segmentData;
      }

      const leg = item.leg;
      const isActiveLeg = item === toLeg;
      if (isActiveLeg) {
        foundActiveLeg = true;
      }

      // Initial DTK
      if (leg.calculated?.startLat !== undefined && leg.calculated?.startLon !== undefined) {
        item.initialDtk.set(leg.calculated.initialDtk ?? NaN, MagVar.get(leg.calculated.startLat, leg.calculated.startLon));
      } else {
        item.initialDtk.set(NaN);
      }

      // Distance
      // If behind active leg, set to NaN, which will cause ete, eta, and fuel to be NaN, which is what we want
      const legDistanceMeters = isActiveLeg
        ? this.activeLegDistance.get().asUnit(UnitType.METER)
        : !foundActiveLeg
          ? NaN
          : leg.calculated?.distance ?? NaN;
      const legDistanceNm = UnitType.METER.convertTo(legDistanceMeters, UnitType.NMILE);
      item.distance.set(legDistanceMeters);

      const cumulativeDistanceLegMeters = cumulativeDistanceMeters + legDistanceMeters;
      if (!isNaN(legDistanceMeters)) {
        cumulativeDistanceMeters += legDistanceMeters;
      }
      item.distanceCumulative.set(UnitType.METER.createNumber(cumulativeDistanceLegMeters));

      // ETE
      const estimatedTimeEnrouteSeconds = FlightPlanPredictorUtils.predictTime(currentGsKnots, legDistanceNm);
      item.estimatedTimeEnroute.set(UnitType.SECOND.createNumber(estimatedTimeEnrouteSeconds));

      const cumulativeTimeLegSeconds = cumulativeTimeEnrouteSeconds + estimatedTimeEnrouteSeconds;
      if (!isNaN(estimatedTimeEnrouteSeconds)) {
        cumulativeTimeEnrouteSeconds += estimatedTimeEnrouteSeconds;
      }
      item.estimatedTimeEnrouteCumulative.set(UnitType.SECOND.createNumber(cumulativeTimeLegSeconds));

      // ETA
      const timeToDistanceSeconds = FlightPlanPredictorUtils.predictTime(currentGsKnots, legDistanceNm);
      const etaSeconds = lastEtaUtcSeconds + timeToDistanceSeconds;
      if (!isNaN(etaSeconds)) {
        lastEtaUtcSeconds = etaSeconds;
      }
      const estimatedTimeOfArrival = UnitType.SECOND.convertTo(etaSeconds, UnitType.MILLISECOND);
      item.estimatedTimeOfArrival.set(estimatedTimeOfArrival);

      // Fuel REM
      const fuelUsedForLeg = fuelFlowTotalGph * (estimatedTimeEnrouteSeconds / 60 / 60);
      const newFuelRemainingGal = fuelRemainingGal - fuelUsedForLeg;
      if (!isNaN(newFuelRemainingGal)) {
        fuelRemainingGal = newFuelRemainingGal;
      }
      item.fuelRemaining.set(UnitType.GALLON_FUEL.createNumber(newFuelRemainingGal));

      segmentDistanceMeters += leg.calculated?.distance ?? 0;
    }

    // Set the segment distance for the last segment
    currentSegmentData?.distance.set(segmentDistanceMeters, UnitType.METER);
    const segmentEte = FlightPlanPredictorUtils.predictTime(currentGsKnots, UnitType.METER.convertTo(segmentDistanceMeters, UnitType.NMILE));
    currentSegmentData?.estimatedTimeEnroute.set(segmentEte, UnitType.SECOND);
  };

  /**
   * Handles the vnav path calculated event.
   * @param verticalPathCalculator VNavPathCalculator.
   * @param verticalPlanIndex The vertical plan index.
   */
  private readonly handleVnavPathCalculated = (verticalPathCalculator: VNavPathCalculator, verticalPlanIndex: number): void => {
    if (verticalPlanIndex !== this.planIndex) { return; }

    const lateralPlan = this.fms.getFlightPlan(this.planIndex);
    const verticalPlan = verticalPathCalculator.getVerticalFlightPlan(this.planIndex);
    const verticalSegments = VNavUtils.getVerticalSegmentsFromPlan(verticalPlan);

    let maxAltitudeMeters = UnitType.FOOT.convertTo(Math.max(this.getSelectedAltitude(), Math.round(this.getCurrentAltitude() / 100) * 100), UnitType.METER);
    let minAltitudeMeters = verticalPathCalculator.getFirstDescentConstraintAltitude(this.planIndex);

    for (const item of this.legItems()) {
      const indexes = FmsUtils.getLegIndexes(lateralPlan, item.leg);
      if (!indexes) { return; }

      const vnavLeg = verticalSegments[indexes.segmentIndex].legs[indexes.segmentLegIndex];

      if (item.leg === this.directToExistingLeg.get()) {
        const hiddenDirectToVnavLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, lateralPlan.activeLateralLeg);
        this.updateLegVnavData(item, vnavLeg, minAltitudeMeters, maxAltitudeMeters, hiddenDirectToVnavLeg);
      } else {
        this.updateLegVnavData(item, vnavLeg, minAltitudeMeters, maxAltitudeMeters);
      }

      if (!vnavLeg.isAdvisory) {
        maxAltitudeMeters = vnavLeg.altitude;
        minAltitudeMeters = 0;
      }
    }
  };

  /**
   * Updates leg list item vnav related fields.
   * @param item The leg list item.
   * @param vnavLeg The vnav leg.
   * @param minAltitude The min altitude.
   * @param maxAltitude The max altitude.
   * @param directToVnavLeg The direct to vnav leg, if applicable.
   */
  private updateLegVnavData(
    item: FlightPlanLegData,
    vnavLeg: VNavLeg,
    minAltitude: number | undefined,
    maxAltitude: number,
    directToVnavLeg?: VNavLeg,
  ): void {
    // Default advisory altitude to the vnav leg altitude
    let advisoryAltitude = directToVnavLeg?.altitude ?? vnavLeg.altitude;
    const isAdvisory = directToVnavLeg?.isAdvisory ?? vnavLeg.isAdvisory;

    // If advisory, applies the min and max altitudes
    if (advisoryAltitude !== 0 && isAdvisory && advisoryAltitude > maxAltitude) {
      advisoryAltitude = minAltitude !== undefined ? Math.max(minAltitude, maxAltitude) : maxAltitude;
    }

    // Advisory altitude
    if (!item.isAltitudeDesignated.get() && isAdvisory && advisoryAltitude > 0 && item.vnavPhase.get() === VerticalFlightPhase.Descent) {
      item.altDesc.set(AltitudeRestrictionType.Unused);
      item.altitude1.set(advisoryAltitude, UnitType.METER);
      item.altitude2.set(NaN, UnitType.METER);
      item.displayAltitude1AsFlightLevel.set(FmsUtils.displayAltitudeAsFlightLevel(advisoryAltitude));
      item.displayAltitude2AsFlightLevel.set(false);
      item.isAltitudeEdited.set(false);
    } else {
      item.updateLegListDataAltitudeStuffFromVerticalData();
    }

    // FPA
    if (item.isAltitudeDesignated.get() && item.leg.verticalData.fpa === undefined) {
      item.fpa.set(directToVnavLeg?.fpa ?? vnavLeg.fpa);
    }

    // Altitude constraint invalid
    // We don't care about the directToVnavLeg here because invalid only applies to designated constraints
    item.isAltitudeInvalid.set(vnavLeg.invalidConstraintAltitude !== undefined);
  }

  /**
   * Handles the fplIndexChanged event.
   * @param event FlightPlanIndicationEvent.
   */
  private readonly handleFlightPlannerActiveIndexChanged = (event: FlightPlanIndicationEvent): void => {
    this._activePlanIndex.set(event.planIndex);

    if (event.planIndex !== Fms.DTO_RANDOM_PLAN_INDEX) {
      this.cleanDirectToRandomData();
    }
  };

  /** Handles a new direct to random being created. */
  private readonly handleNewDirectToRandom = (): void => {
    this.cleanDirectToRandomData();

    this._activeLegGlobalIndex.set(undefined);
    const plan = this.fms.getDirectToFlightPlan();
    const segment = plan.getSegment(0);
    const globalLegIndex = 2;
    const leg = segment.legs[globalLegIndex];
    const legData = new FlightPlanLegData(leg, segment, undefined, Fms.DTO_RANDOM_PLAN_INDEX, this.isAdvancedVnav, this, plan, globalLegIndex, true);
    legData.isActiveLeg.set(true);
    this._directToRandomLegData.set(legData);
  };

  /** Destroys direct to random leg data. */
  private cleanDirectToRandomData(): void {
    this._directToRandomLegData.get()?.destroy();
    this._directToRandomHoldLegData.get()?.destroy();
    this._directToRandomLegData.set(undefined);
    this._directToRandomHoldLegData.set(undefined);
  }

  /**
   * Handles the fplDirectToDataChanged event.
   * @param event FlightPlanDirectToDataEvent.
   */
  private readonly handleDirectToDataChanged = (event: FlightPlanDirectToDataEvent): void => {
    if (event.planIndex !== this.planIndex) { return; }

    this._directToData.set({ ...event.directToData });
  };

  /** Updates the active leg subject. */
  private updateActiveLeg(): void {
    const activeLegGlobalIndex = this.activeLegGlobalIndex.get();

    if (activeLegGlobalIndex === undefined || activeLegGlobalIndex < 0) {
      this._activeLeg.set(undefined);
      this._activeLegListData.set(undefined);
      this._activeLegSegmentIndex.set(undefined);
      return;
    }

    const plan = this.fms.getFlightPlan(this.planIndex);
    const activeLeg = plan.tryGetLeg(activeLegGlobalIndex);


    this._activeLeg.set(activeLeg ?? undefined);
    this._activeLegListData.set(activeLeg ? this.legMap.get(activeLeg) : undefined);
    this._activeLegSegmentIndex.set(activeLeg ? plan.getSegmentIndex(activeLegGlobalIndex) : undefined);
  }

  /**
   * Iterates through the legs in the list, updating their active leg subjects.
   * @throws Error when segment or leg cannot be found, or if something else went wrong.
   */
  private updateActiveLegListItems(): void {
    const toLeg = this.toLeg.get()?.leg;
    const plan = this.fms.getFlightPlan(this.planIndex);
    const indexes = toLeg && FmsUtils.getLegIndexes(plan, toLeg);

    if (toLeg === undefined || indexes === undefined) {
      for (const item of this.legItems()) {
        item.isActiveLeg.set(false);
        item.isBehindActiveLeg.set(false);
      }
      return;
    }

    const activeLegSegmentIndex = indexes.segmentIndex;
    const activeLegSegmentLegIndex = indexes.segmentLegIndex;

    for (const item of this.legItems()) {
      // We don't care about legs that will never be visible
      if (item.isVisibleLegType === false) { continue; }

      const isActiveLeg = item.leg === toLeg;
      item.isActiveLeg.set(isActiveLeg);

      const segmentIndex = item.segment.segmentIndex;
      const segmentLegIndex = item.segment.legs.indexOf(item.leg);

      const isBehindActiveLeg = segmentIndex < activeLegSegmentIndex
        ? true
        : segmentIndex === activeLegSegmentIndex
          ? segmentLegIndex < activeLegSegmentLegIndex
            ? true
            : false
          : false;

      item.isBehindActiveLeg.set(!isActiveLeg && isBehindActiveLeg);
    }
  }

  /** Updates leg data. */
  private updateLegs(): void {
    const plan = this.fms.getFlightPlan(this.planIndex);

    for (const item of this.legItems()) {
      const globalLegIndex = plan.getLegIndexFromLeg(item.leg);
      item.updateLegPosition(globalLegIndex);
    }
  }
}