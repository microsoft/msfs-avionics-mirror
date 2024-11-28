import {
  AirportFacility, ArraySubject, DepartureProcedure, EnrouteTransition, EventBus, FacilitySearchType, FacilityType, FlightPlan, FlightPlanCopiedEvent,
  FlightPlanIndicationEvent, FlightPlanModBatchEvent, FlightPlannerEvents, FlightPlanProcedureDetailsEvent, FmcPagingEvents, FmcRenderTemplate, ICAO,
  MappedSubject, OneWayRunway, PageLinkField, RunwayUtils, Subject, Subscription
} from '@microsoft/msfs-sdk';

import { UnsFlightPlans, UnsFms } from '../../Fms';
import { UnsFocusableField } from '../Components/UnsFocusableField';
import { PickListData, UnsPickList } from '../Components/UnsPickList';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

enum UnsDeparturePageState {
  PickRunway,
  PickDeparture,
  PickDepartureTransition,
  Standby,
}

/**
 * Store for {@link UnsDeparturePage}
 */
class UnsDeparturePageStore {
  public readonly targetPlanIndex = UnsFlightPlans.Active;

  public readonly state = Subject.create(UnsDeparturePageState.Standby);

  public readonly pickListData = Subject.create<PickListData>({ title: '', data: [], itemsPerPage: 8 });

  public readonly availableRunways = ArraySubject.create<OneWayRunway>([]);

  public readonly availableDepartures = ArraySubject.create<DepartureProcedure>([]);

  public readonly availableDepartureTransitions = ArraySubject.create<EnrouteTransition>([]);

  public readonly airportIcao = Subject.create<string | undefined>(undefined);

  public readonly pickedRunway = Subject.create<OneWayRunway | null>(null);

  public readonly pickedDeparture = Subject.create<DepartureProcedure | null>(null);

  public readonly pickedDepartureTransition = Subject.create<EnrouteTransition | null>(null);
}

/**
 * Controller for {@link UnsDeparturePage}
 */
class UnsDeparturePageController {
  private pendingBatchUpdateUuid: string | undefined;

  /**
   * Ctor
   *
   * @param page the departure page
   * @param store the store
   * @param fms the fms
   */
  constructor(
    private readonly page: UnsDeparturePage,
    private readonly store: UnsDeparturePageStore,
    private readonly fms: UnsFms,
  ) {
    this.updateStoreFromFlightPlan(this.fms.getFlightPlan(this.store.targetPlanIndex));

    if (this.store.pickedRunway.get()) {
      this.store.state.set(UnsDeparturePageState.Standby);
    } else {
      this.store.state.set(UnsDeparturePageState.PickRunway);
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
      this.store.state.sub(this.handlePageStateChange, true),
      fplSub.on('fplCreated').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplLoaded').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplProcDetailsChanged').handle(this.handleInitializeFlightPlan),
      fplSub.on('fplCopied').handle(this.handleCopyFlightPlan),
      fplSub.on('fplBatchOpened').handle(this.handleFplBatchOpened),
      fplSub.on('fplBatchClosed').handle(this.handleFplBatchClosed),
    ];
  }

  private readonly handlePageStateChange = (newState: UnsDeparturePageState): void => {
    switch (newState) {
      case UnsDeparturePageState.PickRunway: {
        this.store.pickListData.set({
          title: 'SEL RUNWAY[cyan]',
          data: this.store.availableRunways.getArray().map((it) => RunwayUtils.getRunwayNameString(it.direction, it.runwayDesignator)),
          itemsPerPage: 8,
        });
        break;
      }
      case UnsDeparturePageState.PickDeparture: {
        this.store.pickListData.set({
          title: 'SEL SID[cyan]',
          data: this.store.availableDepartures.getArray().map((it) => it.name),
          itemsPerPage: 8,
        });
        break;
      }
      case UnsDeparturePageState.PickDepartureTransition: {
        this.store.pickListData.set({
          title: 'SEL TRANSITION[cyan]',
          data: this.store.availableDepartureTransitions.getArray().map((it) => it.name),
          itemsPerPage: 8,
        });
        break;
      }
      case UnsDeparturePageState.Standby: {
        this.store.pickListData.set({
          title: '',
          data: [],
          itemsPerPage: 8,
        });
        break;
      }
    }
  };

  private readonly handleModifyFlightPlan = async (): Promise<void> => {
    const airportIcao = this.store.airportIcao.get();

    if (!airportIcao) {
      return;
    }

    const airport = await this.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);

    const runway = this.store.pickedRunway.get();

    const departureProc = this.store.pickedDeparture.get();
    const departureProcIndex = departureProc ? airport.departures.indexOf(departureProc) : -1;

    const departureRunwayIndex = (runway && departureProc) ? departureProc.runwayTransitions.findIndex((trans) => {
      const transitionRunway = RunwayUtils.matchOneWayRunway(airport, trans.runwayNumber, trans.runwayDesignation);

      if (!transitionRunway) {
        return false;
      }

      return transitionRunway.direction === runway.direction
        && transitionRunway.runwayDesignator === runway.runwayDesignator;
    }) : -1;

    const enrouteTransition = this.store.pickedDepartureTransition.get();
    const enrouteTransitionIndex = (departureProc && enrouteTransition) ? departureProc.enRouteTransitions.findIndex((it) => it.name === enrouteTransition.name) : -1;

    const plan = this.fms.getFlightPlan(this.store.targetPlanIndex);
    const batch = plan.openBatch('uns1.cdu.departure.handleModifyFlightPlan');

    if (runway && departureProc) {
      this.fms.insertDeparture(
        airport,
        departureProcIndex,
        departureRunwayIndex,
        enrouteTransitionIndex,
        runway ?? undefined,
      );
    } else if (runway) {
      this.fms.setOrigin(airport, runway);
    } else {
      this.fms.setOrigin(airport);
    }

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
   * @throws if flight plan originAirport and FMS facilityinfo are out of sync
   */
  private updateStoreFromFlightPlan(plan: FlightPlan): void {
    const airportIcao = plan.originAirport;

    if (airportIcao === undefined || airportIcao === ICAO.emptyIcao) {
      this.store.airportIcao.set(undefined);
      this.store.availableRunways.set([]);
      this.store.availableDepartures.set([]);
      this.store.availableDepartureTransitions.set([]);
      return;
    }

    const airportFacility = this.fms.facilityInfo.originFacility;

    if (!airportFacility || airportIcao !== airportFacility.icao) {
      throw new Error('FlightPlan originAirport and FMS facilityinfo out of sync!');
    }

    this.store.airportIcao.set(airportIcao);

    const runway = plan.procedureDetails.originRunway ?? null;
    this.store.pickedRunway.set(runway);

    const departure = plan.procedureDetails.departureIndex !== -1 ? airportFacility.departures[plan.procedureDetails.departureIndex]: null;
    this.store.pickedDeparture.set(departure);

    const departureEnrouteTransition = (plan.procedureDetails.departureTransitionIndex !== -1 && departure)
      ? departure.enRouteTransitions[plan.procedureDetails.departureTransitionIndex]
      : null;
    this.store.pickedDepartureTransition.set(departureEnrouteTransition);

    this.store.availableRunways.set(this.availableRunwaysFromAirport(airportFacility));
    runway && this.store.availableDepartures.set(this.availableDeparturesFromRunway(airportFacility, runway));
    departure && this.store.availableDepartureTransitions.set(this.availableDepartureEnrouteTransitionsFromDeparture(departure));
  }

  /**
   * Picks an origin airport
   *
   * @param airport the airport
   */
  public pickOriginAirport(airport: AirportFacility): void {
    this.store.airportIcao.set(airport.icao);

    this.store.pickedRunway.set(null);
    this.store.pickedDeparture.set(null);
    this.store.pickedDepartureTransition.set(null);

    this.handleModifyFlightPlan();

    this.store.availableRunways.set(this.availableRunwaysFromAirport(airport));
    this.store.availableDepartures.set([]);
    this.store.availableDepartureTransitions.set([]);

    this.store.state.set(UnsDeparturePageState.PickRunway);
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

    this.store.pickedDeparture.set(null);
    this.store.pickedDepartureTransition.set(null);

    await this.handleModifyFlightPlan();

    this.store.availableDepartures.set(this.availableDeparturesFromRunway(airport, runway));
    this.store.availableDepartureTransitions.set([]);

    this.store.state.set(UnsDeparturePageState.PickDeparture);
  }

  /**
   * Picks a departure
   *
   * @param departure the departure
   */
  public pickDeparture(departure: DepartureProcedure): void {
    this.store.pickedDeparture.set(departure);

    this.store.pickedDepartureTransition.set(null);

    this.handleModifyFlightPlan();

    this.store.availableDepartureTransitions.set(this.availableDepartureEnrouteTransitionsFromDeparture(departure));

    this.store.state.set(UnsDeparturePageState.PickDepartureTransition);
  }

  /**
   * Picks a departure enroute transition
   *
   * @param transition the transition
   */
  public pickDepartureEnrouteTransition(transition: EnrouteTransition): void {
    this.store.pickedDepartureTransition.set(transition);

    this.handleModifyFlightPlan();

    this.store.state.set(UnsDeparturePageState.Standby);
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
   * Returns an array of available departures for a given runway
   *
   * @param airport the airport facility
   * @param runway the runway
   *
   * @returns an array of departures
   */
  private availableDeparturesFromRunway(airport: AirportFacility, runway: OneWayRunway): readonly DepartureProcedure[] {
    const departuresForRunway = airport.departures.filter((it) => it.runwayTransitions.some((trans) => {
      const transitionRunway = RunwayUtils.matchOneWayRunway(airport, trans.runwayNumber, trans.runwayDesignation);

      if (!transitionRunway) {
        return false;
      }

      return transitionRunway.direction === runway.direction
        && transitionRunway.runwayDesignator === runway.runwayDesignator;
    }));

    return departuresForRunway;
  }

  /**
   * Returns an array of enroute transitions for a given departure
   *
   * @param departure the departure
   *
   * @returns an array of enroute transitions
   */
  private availableDepartureEnrouteTransitionsFromDeparture(departure: DepartureProcedure): readonly EnrouteTransition[] {
    return departure.enRouteTransitions;
  }
}

/**
 *
 */
export class UnsDeparturePage extends UnsFmcPage {
  private readonly store = new UnsDeparturePageStore();

  private readonly controller = new UnsDeparturePageController(this, this.store, this.fms);

  private readonly PickList = new UnsPickList(this, this.store.pickListData, undefined);

  private readonly AirportField = new UnsTextInputField<string | undefined, AirportFacility>(this, {
    maxInputCharacterCount: 4,
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
      this.screen.toggleFieldFocused(this.AirportField);

      return true;
    },

    onModified: async (airport) => {
      this.controller.pickOriginAirport(airport);

      return true;
    },
  }).bindWrappedData(this.store.airportIcao);

  private readonly RunwayField = new UnsTextInputField<OneWayRunway | null, OneWayRunway>(this, {
    maxInputCharacterCount: 2,
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
          textToShow = '---';
        }

        return `${prefix}${textToShow}[${color}]`;
      },

      /** @inheritDoc */
      parse: (input): OneWayRunway | null  =>{
        const int = parseInt(input);

        if (!Number.isFinite(int)) {
          return null;
        }

        if (int < 1 || (int - 1) >= this.store.availableRunways.length) {
          return null;
        }

        return this.store.availableRunways.get(int - 1);
      },
    },

    onSelected: async () => {
      this.store.state.set(
        this.screen.toggleFieldFocused(this.RunwayField)
          ? UnsDeparturePageState.PickRunway
          : UnsDeparturePageState.Standby
      );
      return true;
    },

    onModified: async (runway) => {
      await this.controller.pickRunway(runway);

      return true;
    },
  }).bindWrappedData(this.store.pickedRunway);

  private readonly DepartureField = new UnsTextInputField<readonly [DepartureProcedure | null, EnrouteTransition | null, UnsDeparturePageState], void>(this, {
    maxInputCharacterCount: 2,
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format([[departure, transition, state], isHighlighted, typedText]): string {
        let departureString = '-------.[white]';
        if (isHighlighted && state === UnsDeparturePageState.PickDeparture) {
          departureString = `#[cyan] [white]${typedText.padStart(2, ' ')}[r-white]`;
        } else if (departure) {
          departureString = `${departure.name}.[white]`;
        }

        let transitionString = '-----';
        if (isHighlighted && state === UnsDeparturePageState.PickDepartureTransition) {
          transitionString = ` #[cyan] [white]${typedText.padStart(2, ' ')}[r-white]`;
        } else if (state === UnsDeparturePageState.PickDeparture) {
          transitionString = '';
        } else if (transition) {
          transitionString = `${transition.name}[white]`;
        }

        return `${departureString}${transitionString}`;
      },

      /** @inheritDoc */
      parse: (input): void | null => {
        const int = parseInt(input);

        if (!Number.isFinite(int)) {
          return null;
        }

        const settingDeparture = !this.store.pickedDeparture.get();

        if (settingDeparture) {
          const departure = this.store.availableDepartures.get(int - 1);

          if (!departure) {
            return null;
          }

          this.controller.pickDeparture(departure);
          return;
        } else {
          const transition = this.store.availableDepartureTransitions.get(int - 1);

          if (!transition) {
            return null;
          }

          this.controller.pickDepartureEnrouteTransition(transition);
          return;
        }
      },
    },

    onSelected: async () => {
      if (this.screen.toggleFieldFocused(this.DepartureField)) {
        this.store.state.set(
          this.store.pickedDeparture.get()
            ? UnsDeparturePageState.PickDepartureTransition
            : UnsDeparturePageState.PickDeparture,
        );
      } else {
        this.store.state.set(UnsDeparturePageState.Standby);
      }

      return true;
    },
  }).bindWrappedData(
    MappedSubject.create(this.store.pickedDeparture, this.store.pickedDepartureTransition, this.store.state),
  );

  private readonly FplLink = PageLinkField.createLink(this, `FPL${UnsChars.ArrowRight}`, '/fpl');

  /**
   * Callback for when the initial state of the page is determined
   *
   * @param state the new page state
   */
  public onInitialStateComputed(state: UnsDeparturePageState): void {
    if (state === UnsDeparturePageState.PickRunway) {
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

  /** @inheritDoc */
  protected override onResume(): void {
    const planHasOriginAirport = this.fms.getPrimaryFlightPlan().originAirport !== undefined;

    if (!planHasOriginAirport) {
      this.screen.tryFocusField(this.AirportField);
      this.store.state.set(UnsDeparturePageState.Standby);
      return;
    }

    const planHasDepartureRunway = this.fms.getPrimaryFlightPlan().procedureDetails.departureRunwayIndex !== -1;

    if (!planHasDepartureRunway) {
      this.screen.tryFocusField(this.RunwayField);
      this.store.state.set(UnsDeparturePageState.PickRunway);
      return;
    }

    this.store.state.set(UnsDeparturePageState.Standby);
  }

  public override cursorPath: UnsCduCursorPath = {
    initialPosition: null,
    rules: new Map<UnsFocusableField<any>, UnsFocusableField<any>>([
      [this.AirportField, this.RunwayField],
      [this.RunwayField, this.DepartureField],
      [this.DepartureField, this.DepartureField],
    ] ),
  };

  protected pageTitle = 'DEPARTURE';

  protected displayedSubPagePadding = 2;

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [this.PickList, 'DEPART[cyan]'],
        ['', this.AirportField],
        ['', 'RUNWAY[cyan]'],
        ['', this.RunwayField],
        ['', 'SID[cyan]'],
        ['', this.DepartureField],
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
