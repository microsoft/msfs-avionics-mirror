import {
  AirportFacility, ApproachProcedure, ApproachTransition, ArrivalProcedure, EnrouteTransition, EventBus, FacilitySearchType, FacilityType, FlightPlan,
  FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanModBatchEvent, FlightPlannerEvents, FlightPlanProcedureDetailsEvent, FmcPagingEvents,
  FmcRenderTemplate, ICAO, MappedSubject, OneWayRunway, PageLinkField, RunwayUtils, Subject, Subscription
} from '@microsoft/msfs-sdk';

import { UnsFlightPlans, UnsFms, UnsFmsUtils } from '../../Fms';
import { PickListData, UnsPickList } from '../Components/UnsPickList';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsFmcPage } from '../UnsFmcPage';

enum UnsArrivalPageState {
  PickRunway,
  PickArrival,
  PickArrivalEnrouteTransition,
  PickApproach,
  PickApproachTransition,
  Standby,
}

const PICKLIST_TITLE_MAP = {
  [UnsArrivalPageState.PickRunway]: 'SEL RUNWAY',
  [UnsArrivalPageState.PickArrival]: 'SEL STAR',
  [UnsArrivalPageState.PickArrivalEnrouteTransition]: 'SEL TRANSITION',
  [UnsArrivalPageState.PickApproach]: 'SEL APPROACH',
  [UnsArrivalPageState.PickApproachTransition]: 'SEL TRANSITION',
  [UnsArrivalPageState.Standby]: '',
};

/**
 * Store for {@link UnsArrivalPage}
 */
class UnsArrivalPageStore {
  public readonly targetPlanIndex = UnsFlightPlans.Active;

  public readonly state = Subject.create(UnsArrivalPageState.Standby);

  public readonly pickListData = Subject.create<PickListData>({ title: '', data: [], itemsPerPage: 8 });

  public readonly availableRunways = Subject.create<readonly OneWayRunway[]>([]);

  public readonly availableArrivals = Subject.create<readonly ArrivalProcedure[]>([]);

  public readonly availableArrivalEnrouteTransitions = Subject.create<readonly EnrouteTransition[]>([]);

  public readonly availableApproaches = Subject.create<readonly ApproachProcedure[]>([]);

  public readonly availableApproachesTransitions = Subject.create<readonly ApproachTransition[]>([]);

  public readonly airportIcao = Subject.create<string | undefined>(undefined);

  public readonly pickedRunway = Subject.create<OneWayRunway | null>(null);

  public readonly pickedArrival = Subject.create<ArrivalProcedure | null>(null);

  public readonly pickedArrivalEnrouteTransition = Subject.create<EnrouteTransition | null>(null);

  public readonly pickedApproach = Subject.create<ApproachProcedure | null>(null);

  public readonly pickedApproachTransition = Subject.create<ApproachTransition | null>(null);
}


/**
 * Controller for {@link UnsArrivalPage}
 */
class UnsArrivalPageController {
  private pendingBatchUpdateUuid: string | undefined;

  /**
   * Ctor
   *
   * @param page the arrival page
   * @param store the store
   * @param fms the fms
   */
  constructor(
    private readonly page: UnsArrivalPage,
    private readonly store: UnsArrivalPageStore,
    private readonly fms: UnsFms,
  ) {
    this.updateStoreFromFlightPlan(this.fms.getFlightPlan(this.store.targetPlanIndex));
    this.handlePicklistData();

    if (this.store.pickedRunway.get()) {
      this.store.state.set(UnsArrivalPageState.Standby);
    } else {
      this.store.state.set(UnsArrivalPageState.PickRunway);
    }

    this.page.onInitialStateComputed(this.store.state.get());
  }

  /**
   * Creates the bindings for this controller
   *
   * @param bus the event bus
   *
   * @returns an array of subscriptions
   */
  public createBindings(bus: EventBus): Subscription[] {
    const fplSub = bus.getSubscriber<FlightPlannerEvents>();

    return [
      fplSub.on('fplCreated').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplLoaded').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplProcDetailsChanged').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplCopied').handle(this.handleCopyFlightPlan),
      fplSub.on('fplBatchOpened').handle(this.handleFplBatchOpened),
      fplSub.on('fplBatchClosed').handle(this.handleFplBatchClosed),
    ];
  }

  /**
   * Handles and sets the pick list data
   */
  private handlePicklistData(): void {
    MappedSubject.create(
      ([state, runways, arrivals, arrivalTransitions, approaches, approachTransitions]): boolean => {
        let data: string[] = [];
        switch (state) {
          case UnsArrivalPageState.PickRunway:
            data = runways.map((it) => RunwayUtils.getRunwayNameString(it.direction, it.runwayDesignator));
            break;
          case UnsArrivalPageState.PickArrival:
            data = arrivals.map((it) => it.name);
            break;
          case UnsArrivalPageState.PickArrivalEnrouteTransition:
            data = arrivalTransitions.map((it) => it.name);
            break;
          case UnsArrivalPageState.PickApproach:
            data = approaches.map((it) => UnsFmsUtils.getApproachNameAsString(it));
            break;
          case UnsArrivalPageState.PickApproachTransition:
            data = approachTransitions.map((it) => it.name);
            break;
        }

        if (data.length === 0 && state !== UnsArrivalPageState.Standby) {
          data = ['NONE AVAILABLE'];
        }

        this.store.pickListData.set({
          title: PICKLIST_TITLE_MAP[state],
          titleStyle: 'cyan s-text',
          itemsPerPage: 8,
          padIndexTo: state === UnsArrivalPageState.PickApproach ? 3 : undefined,
          targetWidth: state === UnsArrivalPageState.PickApproach ? 17 : undefined,
          data
        });

        return true;
      },
      this.store.state,
      this.store.availableRunways,
      this.store.availableArrivals,
      this.store.availableArrivalEnrouteTransitions,
      this.store.availableApproaches,
      this.store.availableApproachesTransitions
    );
  }


  private readonly handleModifyFlightPlan = async (): Promise<void> => {
    const airportIcao = this.store.airportIcao.get();

    if (!airportIcao) {
      return;
    }

    const airport = await this.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);

    const runway = this.store.pickedRunway.get();

    const arrivalProc = this.store.pickedArrival.get();
    const arrivalProcIndex = arrivalProc ? airport.arrivals.indexOf(arrivalProc) : -1;

    const arrivalRunwayIndex = (runway && arrivalProc) ? arrivalProc.runwayTransitions.findIndex((trans) => {
      const transitionRunway = RunwayUtils.matchOneWayRunway(airport, trans.runwayNumber, trans.runwayDesignation);

      if (!transitionRunway) {
        return false;
      }

      return transitionRunway.direction === runway.direction
        && transitionRunway.runwayDesignator === runway.runwayDesignator;
    }) : -1;

    const enrouteTransition = this.store.pickedArrivalEnrouteTransition.get();
    const enrouteTransitionIndex = (arrivalProc && enrouteTransition) ? arrivalProc.enRouteTransitions.findIndex((it) => it.name === enrouteTransition.name) : -1;

    const plan = this.fms.getFlightPlan(this.store.targetPlanIndex);
    const batch = plan.openBatch('uns1.cdu.arrival.handleModifyFlightPlan');

    if (runway && arrivalProc) {
      this.fms.insertArrival(
        airport,
        arrivalProcIndex,
        arrivalRunwayIndex,
        enrouteTransitionIndex,
        runway ?? undefined,
      );
    } else if (runway) {
      this.fms.removeArrival();
      this.fms.setDestination(airport, runway);
    } else {
      this.fms.removeArrival();
      this.fms.setDestination(airport);
    }

    const approachProc = this.store.pickedApproach.get();
    const approachProcIndex = approachProc ? airport.approaches.indexOf(approachProc) : -1;

    const approachTransition = this.store.pickedApproachTransition.get();
    const approachTransitionIndex = (approachProc && approachTransition) ? approachProc.transitions.indexOf(approachTransition) : -1;

    await this.fms.insertApproach({
      facility: airport,
      approachIndex: approachProcIndex,
      approachTransitionIndex,
      visualRunwayNumber: undefined,
      visualRunwayDesignator: undefined,
      visualRunwayOffset: undefined,
      vfrVerticalPathAngle: undefined,
      transStartIndex: undefined,
    });
    plan.closeBatch(batch);
  };

  private readonly handleInitializeFlightPlan = (event: FlightPlanIndicationEvent | FlightPlanProcedureDetailsEvent): void => {
    if (event.planIndex !== this.store.targetPlanIndex) {
      return;
    }

    if ('batch' in event && event.batch?.find((it) => it.name?.startsWith('uns1'))) {
      return;
    }

    this.updateStoreFromFlightPlan(this.fms.getFlightPlan(event.planIndex));
  };

  private readonly handleCopyFlightPlan = (event: FlightPlanCopiedEvent): void => {
    if (event.targetPlanIndex !== this.store.targetPlanIndex) {
      return;
    }

    this.updateStoreFromFlightPlan(this.fms.getFlightPlan(event.targetPlanIndex));
  };

  private readonly handleFplBatchOpened = (event: FlightPlanModBatchEvent): void => {
    if (!event.batch.name?.startsWith('uns1') || this.pendingBatchUpdateUuid !== undefined) {
      return;
    }

    this.pendingBatchUpdateUuid = event.batch.uuid;
  };

  private readonly handleFplBatchClosed = (event: FlightPlanModBatchEvent): void => {
    if (!event.batch.name?.startsWith('uns1')) {
      return;
    }

    if (event.batch.uuid === this.pendingBatchUpdateUuid) {
      this.updateStoreFromFlightPlan(this.fms.getFlightPlan(event.planIndex));
      this.pendingBatchUpdateUuid = undefined;
    }
  };

  /**
   * Updates store data from a flight plan
   *
   * @param plan the flight plan
   *
   * @throws if flight plan destinationAirport and FMS facilityinfo are out of sync
   */
  private updateStoreFromFlightPlan(plan: FlightPlan): void {
    const airportIcao = plan.destinationAirport;

    if (airportIcao === undefined || airportIcao === ICAO.emptyIcao) {
      this.store.airportIcao.set(undefined);
      this.store.availableRunways.set([]);
      this.store.availableArrivals.set([]);
      this.store.availableArrivalEnrouteTransitions.set([]);
      this.store.availableApproaches.set([]);
      this.store.availableApproachesTransitions.set([]);
      return;
    }

    const airportFacility = this.fms.facilityInfo.destinationFacility;

    if (!airportFacility || airportIcao !== airportFacility.icao) {
      throw new Error('FlightPlan destinationAirport and FMS facilityinfo out of sync!');
    }

    this.store.airportIcao.set(airportIcao);

    const runway = plan.procedureDetails.destinationRunway ?? null;
    this.store.pickedRunway.set(runway);

    const arrival = plan.procedureDetails.arrivalIndex !== -1 ? airportFacility.arrivals[plan.procedureDetails.arrivalIndex] : null;
    this.store.pickedArrival.set(arrival);

    const arrivalEnrouteTransition = (plan.procedureDetails.arrivalTransitionIndex !== -1 && arrival)
      ? arrival.enRouteTransitions[plan.procedureDetails.arrivalTransitionIndex]
      : null;
    this.store.pickedArrivalEnrouteTransition.set(arrivalEnrouteTransition);

    const approach = plan.procedureDetails.approachIndex !== -1 ? airportFacility.approaches[plan.procedureDetails.approachIndex] : null;
    this.store.pickedApproach.set(approach);

    const approachTransition = plan.procedureDetails.approachTransitionIndex !== -1 && approach
      ? approach.transitions[plan.procedureDetails.approachTransitionIndex]
      : null;
    this.store.pickedApproachTransition.set(approachTransition);

    this.store.availableRunways.set(this.availableRunwaysFromAirport(airportFacility));
    runway && this.store.availableArrivals.set(this.availableArrivalsFromRunway(airportFacility, runway));
    arrival && this.store.availableArrivalEnrouteTransitions.set(this.availableArrivalEnrouteTransitionsFromArrival(arrival));
    runway && this.store.availableApproaches.set(this.availableApproachesFromRunway(airportFacility, runway));
    approach && this.store.availableApproachesTransitions.set(this.availableApproachTransitionsFromApproach(approach));
  }

  /**
   * Picks a destination airport
   *
   * @param airport the airport
   */
  public async pickDestinationAirport(airport: AirportFacility): Promise<void> {
    this.store.airportIcao.set(airport.icao);

    this.store.pickedRunway.set(null);
    this.store.pickedArrival.set(null);
    this.store.pickedArrivalEnrouteTransition.set(null);
    this.store.pickedApproach.set(null);
    this.store.pickedApproachTransition.set(null);

    await this.handleModifyFlightPlan();

    this.store.availableRunways.set(this.availableRunwaysFromAirport(airport));
    this.store.availableArrivals.set([]);
    this.store.availableArrivalEnrouteTransitions.set([]);
    this.store.availableApproaches.set([]);
    this.store.availableApproachesTransitions.set([]);

    this.store.state.set(UnsArrivalPageState.PickRunway);
  }

  /**
   * Picks a runway
   *
   * @param runway the runway
   */
  public async pickRunway(runway: OneWayRunway): Promise<void> {
    const airportIcao = this.store.airportIcao.get();

    if (!airportIcao) {
      return;
    }

    const airport = await this.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);

    this.store.pickedRunway.set(runway);

    this.store.pickedArrival.set(null);
    this.store.pickedArrivalEnrouteTransition.set(null);

    await this.handleModifyFlightPlan();

    this.store.availableArrivals.set(this.availableArrivalsFromRunway(airport, runway));
    this.store.availableArrivalEnrouteTransitions.set([]);
    this.store.availableApproaches.set(this.availableApproachesFromRunway(airport, runway));

    this.store.state.set(UnsArrivalPageState.PickArrival);
  }

  /**
   * Picks an arrival
   *
   * @param arrival the arrival
   */
  public pickArrival(arrival: ArrivalProcedure | null): void {
    this.store.pickedArrival.set(arrival);
    this.store.pickedArrivalEnrouteTransition.set(null);

    this.handleModifyFlightPlan();

    this.store.availableArrivalEnrouteTransitions.set(arrival ? this.availableArrivalEnrouteTransitionsFromArrival(arrival) : []);

    this.store.state.set(UnsArrivalPageState.PickArrivalEnrouteTransition);
  }

  /**
   * Picks an arrival enroute transition
   *
   * @param transition the transition
   */
  public pickArrivalEnrouteTransition(transition: EnrouteTransition | null): void {
    this.store.pickedArrivalEnrouteTransition.set(transition);

    this.handleModifyFlightPlan();

    this.store.state.set(UnsArrivalPageState.PickApproach);
  }

  /**
   * Picks an approach
   *
   * @param approach the approach
   */
  public pickApproach(approach: ApproachProcedure | null): void {
    this.store.pickedApproach.set(approach);
    this.store.pickedApproachTransition.set(null);

    this.store.availableApproachesTransitions.set(approach ? this.availableApproachTransitionsFromApproach(approach) : []);

    this.handleModifyFlightPlan();

    this.store.state.set(UnsArrivalPageState.PickApproachTransition);
  }

  /**
   * Picks an approach transition
   *
   * @param transition the approach transition
   */
  public pickApproachTransition(transition: ApproachTransition | null): void {
    this.store.pickedApproachTransition.set(transition);

    this.handleModifyFlightPlan();

    this.store.state.set(UnsArrivalPageState.Standby);
  }

  /**
   * Returns an array of available runways for a given airport
   *
   * @param airport the airport
   *
   * @returns an array of one way runways
   */
  private availableRunwaysFromAirport(airport: AirportFacility): readonly OneWayRunway[] {
    return RunwayUtils.getOneWayRunwaysFromAirport(airport);
  }

  /**
   * Returns an array of available arrivals for a given runway
   *
   * @param airport the airport facility
   * @param runway the runway
   *
   * @returns an array of arrivals
   */
  private availableArrivalsFromRunway(airport: AirportFacility, runway: OneWayRunway): readonly ArrivalProcedure[] {
    const arrivalsForRunway = airport.arrivals.filter((it) => it.runwayTransitions.length === 0 || it.runwayTransitions.some((trans) => {
      const transitionRunway = RunwayUtils.matchOneWayRunway(airport, trans.runwayNumber, trans.runwayDesignation);

      if (!transitionRunway) {
        return false;
      }

      return transitionRunway.direction === runway.direction
        && transitionRunway.runwayDesignator === runway.runwayDesignator;
    }));

    return arrivalsForRunway;
  }

  /**
   * Returns an array of enroute transitions for a given arrival
   *
   * @param arrival the arrival
   *
   * @returns an array of enroute transitions
   */
  private availableArrivalEnrouteTransitionsFromArrival(arrival: ArrivalProcedure): readonly EnrouteTransition[] {
    return arrival.enRouteTransitions;
  }

  /**
   * Returns an array of available approaches for a given runway
   *
   * @param airport the airport facility
   * @param runway the runway
   *
   * @returns an array of approaches
   */
  private availableApproachesFromRunway(airport: AirportFacility, runway: OneWayRunway): readonly ApproachProcedure[] {
    const runwayApproaches = [];

    for (const approach of airport.approaches) {
      if (approach.runwayNumber === runway.direction && approach.runwayDesignator === runway.runwayDesignator) {
        runwayApproaches.push(approach);
      }
    }

    return [...runwayApproaches];
  }

  /**
   * Returns an array of available approach transitions for a given approach
   *
   * @param approach the approach
   *
   * @returns an array of approach transitions
   */
  private availableApproachTransitionsFromApproach(approach: ApproachProcedure): readonly ApproachTransition[] {
    return approach.transitions;
  }
}

/**
 * UNS Arrival page
 */
export class UnsArrivalPage extends UnsFmcPage {
  private readonly store = new UnsArrivalPageStore();

  private readonly controller = new UnsArrivalPageController(this, this.store, this.fms);

  private readonly PickList = new UnsPickList(this, this.store.pickListData, undefined);

  private readonly AirportField = new UnsTextInputField<string | undefined, AirportFacility>(this, {
    maxInputCharacterCount: 4,
    takeCursorControl: true,
    formatter: {
      /** @inheritDoc */
      format([airportIcao, isHighlighted, typedText]): string {
        if (isHighlighted) {
          return `${typedText.padEnd(4, ' ')}[r-white]`;
        }

        return airportIcao ? ICAO.getIdent(airportIcao) : '----';
      },

      /** @inheritDoc */
      parse: async (input: string): Promise<AirportFacility | null> => {
        const airport = await this.screen.searchFacilityByIdent(
          input,
          this.fms.pposSub.get(),
          FacilitySearchType.Airport,
        );

        if (!airport) {
          return null;
        }

        return airport;
      },
    },

    onSelected: async () => {
      if (this.screen.toggleFieldFocused(this.AirportField)) {
        this.store.state.set(UnsArrivalPageState.Standby);
      }

      return true;
    },

    onModified: async (airport) => {
      this.controller.pickDestinationAirport(airport).then(() => {
        this.screen.tryFocusField(this.RunwayField);
      });

      return true;
    },
  }).bindWrappedData(this.store.airportIcao);

  private readonly RunwayField = new UnsTextInputField<OneWayRunway | null, OneWayRunway>(this, {
    maxInputCharacterCount: 2,
    takeCursorControl: true,
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format([runway, isHighlighted, typedText]): string {
        const prefix = isHighlighted ? '#[cyan] [white]' : '';
        const color = isHighlighted ? 'r-white' : 'white';

        let textToShow: string;
        if (isHighlighted) {
          textToShow = typedText.padStart(2, ' ');
        } else if (runway) {
          textToShow = RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator);
        } else {
          textToShow = '';
        }

        return `${prefix}${textToShow}[${color}]`;
      },

      /** @inheritDoc */
      parse: (input): OneWayRunway | null  =>{
        const int = parseInt(input);

        if (!Number.isFinite(int)) {
          return null;
        }

        if (int < 1 || (int - 1) >= this.store.availableRunways.get().length) {
          return null;
        }

        return this.store.availableRunways.get()[int - 1];
      },
    },

    onSelected: async () => {
      if (this.screen.toggleFieldFocused(this.RunwayField)) {
        this.store.state.set(UnsArrivalPageState.PickRunway);
      } else {
        this.store.state.set(UnsArrivalPageState.Standby);
      }

      return true;
    },

    onModified: async (runway) => {
      await this.controller.pickRunway(runway);

      this.screen.tryFocusField(this.ArrivalField);
      return true;
    },
  }).bindWrappedData(this.store.pickedRunway);

  private readonly ArrivalField = new UnsTextInputField<readonly [ArrivalProcedure | null, EnrouteTransition | null, UnsArrivalPageState], void>(this, {
    maxInputCharacterCount: 2,
    acceptEmptyInput: true,
    takeCursorControl: true,
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format: ([[arrival, transition, state], isHighlighted, typedText]): string => {
        let transitionString = '-----.[white]';
        if (isHighlighted && state === UnsArrivalPageState.PickArrivalEnrouteTransition) {
          transitionString = ` #[cyan] [white]${typedText.padStart(2, ' ')}[r-white].[white]`;
        } else if (state === UnsArrivalPageState.PickArrival || state ===UnsArrivalPageState.PickApproach) {
          transitionString = '';
        } else if (transition) {
          transitionString = `${transition.name}.[white]`;
        }

        let arrivalString = '------';
        if (isHighlighted && state === UnsArrivalPageState.PickArrival) {
          arrivalString = `#[cyan] [white]${typedText.padStart(2, ' ')}[r-white]`;
        } else if (arrival) {
          arrivalString = `${arrival.name}`;
        }

        return `${transitionString}${arrivalString}`;
      },

      /** @inheritDoc */
      parse: async (input): Promise<void | null> => {
        const state = this.store.state.get();
        if (input.trim() === '') {
          switch (state) {
            case UnsArrivalPageState.PickArrival:
              this.controller.pickArrival(null);
              return;
            case UnsArrivalPageState.PickArrivalEnrouteTransition:
              this.controller.pickArrivalEnrouteTransition(null);
              this.screen.tryFocusField(this.ApproachField);
              return;
          }
        }

        const int = parseInt(input);

        if (!Number.isFinite(int)) {
          return null;
        }

        if (state === UnsArrivalPageState.PickArrival) {
          const arrival = this.store.availableArrivals.get()[int - 1];

          if (!arrival) {
            return null;
          }

          // We set the transition to null as the user may have previously set a transition for another arrival
          this.controller.pickArrivalEnrouteTransition(null);
          this.controller.pickArrival(arrival);

          this.screen.tryFocusField(this.ArrivalField);
          return;
        } else if (state === UnsArrivalPageState.PickArrivalEnrouteTransition) {
          const transition = this.store.availableArrivalEnrouteTransitions.get()[int - 1];

          if (!transition) {
            return null;
          }

          this.controller.pickArrivalEnrouteTransition(transition);
          this.screen.tryFocusField(this.ApproachField);
          return;
        }
      },
    },

    onSelected: async () => {
      if (this.screen.toggleFieldFocused(this.ArrivalField)) {
        this.store.state.set(UnsArrivalPageState.PickArrival);
      } else {
        this.store.state.set(UnsArrivalPageState.Standby);
      }

      return true;
    },
  }).bindWrappedData(MappedSubject.create(this.store.pickedArrival, this.store.pickedArrivalEnrouteTransition, this.store.state));

  private readonly ApproachField = new UnsTextInputField<readonly [ApproachProcedure | null, ApproachTransition | null], void>(this, {
    maxInputCharacterCount: 2,
    acceptEmptyInput: true,
    takeCursorControl: true,
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format: ([[approach, transition], isHighlighted, typedText]): string => {
        let transitionString = '-----.[white]';
        if (isHighlighted && this.store.state.get() === UnsArrivalPageState.PickApproachTransition) {
          transitionString = ` #[cyan] [white]${typedText.padStart(2, ' ')}[r-white].[white]`;
        } else if (this.store.state.get() === UnsArrivalPageState.PickApproach) {
          transitionString = '';
        } else if (transition) {
          transitionString = `${transition.name}.[white]`;
        }

        let approachString = '-------';
        if (isHighlighted && this.store.state.get() === UnsArrivalPageState.PickApproach) {
          approachString = `#[cyan] [white]${typedText.padStart(2, ' ')}[r-white]`;
        } else if (approach) {
          approachString = UnsFmsUtils.getApproachNameAsString(approach);
        }

        return `${transitionString}${approachString}`;
      },

      /** @inheritDoc */
      parse: (input): void | null => {
        const pageState = this.store.state.get();

        if (input.trim() === '') {
          switch (pageState) {
            case UnsArrivalPageState.PickApproach: this.controller.pickApproach(null); return;
            case UnsArrivalPageState.PickApproachTransition: this.controller.pickApproachTransition(null); return;
          }
        }

        const int = parseInt(input);

        if (!Number.isFinite(int)) {
          return null;
        }

        if (pageState === UnsArrivalPageState.PickApproach) {
          const approach = this.store.availableApproaches.get()[int - 1];

          if (!approach) {
            return null;
          }

          this.controller.pickApproach(approach);

          this.screen.tryFocusField(this.ApproachField);
          return;
        } else {
          const transition = this.store.availableApproachesTransitions.get()[int - 1];

          if (!transition) {
            return null;
          }

          this.controller.pickApproachTransition(transition);

          this.screen.interruptCursorPath();
          return;
        }
      },
    },

    onSelected: async () => {
      if (this.screen.toggleFieldFocused(this.ApproachField)) {
        this.store.state.set(UnsArrivalPageState.PickApproach);
      } else {
        this.store.state.set(UnsArrivalPageState.Standby);
      }

      return true;
    },

    onEnterPressed: async () => {
      const state = this.store.state.get();

      // When this is called, the pilot pressed ENTER while already on the field, and pickApproachTransition was called, setting
      // the page state to Standby. So we navigate to the FPL link.
      if (state === UnsArrivalPageState.Standby) {
        return true;
      }

      return false;
    },
  }).bindWrappedData(MappedSubject.create(this.store.pickedApproach, this.store.pickedApproachTransition));

  private readonly FplLink = PageLinkField.createLink(this, `FPL${UnsChars.ArrowRight}`, '/fpl');

  /**
   * Callback for when the initial state of the page is determined
   *
   * @param state the new page state
   */
  public onInitialStateComputed(state: UnsArrivalPageState): void {
    if (state === UnsArrivalPageState.PickRunway) {
      this.screen.tryFocusField(this.RunwayField);
    } else {
      this.screen.tryFocusField(null);
    }
  }

  /** @inheritDoc */
  protected override onInit(): void {
    for (const binding of this.controller.createBindings(this.bus)) {
      this.addBinding(binding);
    }

    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.PickList.subPageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.PickList.subPageCount.pipe(this.displayedSubPageCount));
  }

  /** @inheritdoc */
  protected override onResume(): void {
    this.screen.tryFocusField(this.store.pickedRunway.get() ? null : this.RunwayField);
    this.store.state.set(this.store.pickedRunway.get() ? UnsArrivalPageState.Standby : UnsArrivalPageState.PickRunway);
  }

  protected pageTitle = '   ARRIVAL';

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [this.PickList, 'ARRIVE[cyan]'],
        ['', this.AirportField],
        ['', 'RUNWAY[cyan]'],
        ['', this.RunwayField],
        ['', 'STAR[cyan]'],
        ['', this.ArrivalField],
        ['', 'APPR[cyan]'],
        ['', this.ApproachField],
        [''],
        ['', this.FplLink],
      ],
    ];
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': this.PickList.prevSubpage(); return true;
      case 'pageRight': this.PickList.nextSubpage(); return true;
    }

    return super.onHandleScrolling(event);
  }
}
