import {
  ApproachProcedure, EventBus, FlightPlannerEvents, FlightPlanOriginDestEvent, FlightPlanProcedureDetailsEvent, ICAO, OneWayRunway, SimVarValueType, Subject,
  UnitType
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { TransitionListItem } from '../../Shared/FlightPlan/WT21FmsUtils';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { TextInputField } from '../Framework/Components/TextInputField';
import { NumberAndUnitFormat, RawFormatter } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate, FmcRenderTemplateColumn, FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { DepArrPageStore, ProcedureListItem } from './DepArrPageStore';

/** Departure Arrival View Enum */
export enum DepArrView {
  INDEX,
  DEP,
  ARR
}

/**
 * Dep Arr Page Controller
 */
export class DepArrPageController {

  public readonly currentView = Subject.create(DepArrView.INDEX);
  public readonly pageCount = Subject.create(1);
  public readonly currentPage = Subject.create(1);

  // public departureList: FmcTwoColumnPageableList<ProcedureListItem, OneWayRunway>;

  private readonly departuresConsumer = this.store.departures;
  private readonly departureTransitions = this.store.departureTransitions;
  private readonly departureRunwaysConsumer = this.store.departureRunways;
  private readonly arrivalsConsumer = this.store.arrivals;
  private readonly arrivalTransitionsConsumer = this.store.arrivalTransitions;
  private readonly approachesConsumer = this.store.approaches;
  private readonly approachTransitionsConsumer = this.store.approachTransitions;

  private readonly selectedDepartureConsumer = this.store.selectedDeparture;
  private readonly selectedDepartureTransitionConsumer = this.store.selectedDepartureTransition;
  private readonly selectedDepartureRunwayConsumer = this.store.selectedDepartureRunway;
  private readonly selectedArrivalConsumer = this.store.selectedArrival;
  private readonly selectedArrivalTransitionConsumer = this.store.selectedArrivalTransition;
  private readonly selectedApproachConsumer = this.store.selectedApproach;
  private readonly selectedApproachTransitionConsumer = this.store.selectedApproachTransition;

  private readonly procedureDetailsConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplProcDetailsChanged');
  private readonly originDestinationConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplOriginDestChanged');

  private readonly legsLink = PageLinkField.createLink(this.page, 'LEGS>', '/legs');

  private loadingCurrentProcedures = false;


  /**
   * Creates the Controller.
   * @param eventBus The event bus
   * @param fms The Fms
   * @param store The DepArr Store
   * @param page The DepArr FMC Page
   */
  public constructor(
    private readonly eventBus: EventBus,
    private readonly fms: WT21Fms,
    private readonly store: DepArrPageStore,
    private readonly page: FmcPage,
  ) { }

  /**
   * Initializes the Controller
   */
  public init(): void {
    this.procedureDetailsConsumer.handle(this.handleProcedureDetailsChanged);

    this.departuresConsumer.sub(this.handleOnSelectionsUpdate);
    this.departureTransitions.sub(this.handleOnSelectionsUpdate);
    this.departureRunwaysConsumer.sub(this.handleOnSelectionsUpdate);
    this.arrivalsConsumer.sub(this.handleOnSelectionsUpdate);
    this.arrivalTransitionsConsumer.sub(this.handleOnSelectionsUpdate);
    this.approachesConsumer.sub(this.handleOnSelectionsUpdate);
    this.approachTransitionsConsumer.sub(this.handleOnSelectionsUpdate);

    this.selectedDepartureConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedDepartureTransitionConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedDepartureRunwayConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedArrivalConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedArrivalTransitionConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedApproachConsumer.sub(this.handleOnSelectionsUpdate);
    this.selectedApproachTransitionConsumer.sub(this.handleOnSelectionsUpdate);

    this.fms.planInMod.sub(this.handleOnModExec);

    this.currentPage.sub(this.handleCurrentPageChange);

    this.originDestinationConsumer.handle(this.handleOriginDestinationChanged);

    this.refreshOriginDestination();

    this.loadStartingView();
  }

  /**
   * Destroys the Controller.
   */
  public destroy(): void {
    this.procedureDetailsConsumer.off(this.handleProcedureDetailsChanged);

    this.departuresConsumer.unsub(this.handleOnSelectionsUpdate);
    this.departureTransitions.unsub(this.handleOnSelectionsUpdate);
    this.departureRunwaysConsumer.unsub(this.handleOnSelectionsUpdate);
    this.arrivalsConsumer.unsub(this.handleOnSelectionsUpdate);
    this.arrivalTransitionsConsumer.unsub(this.handleOnSelectionsUpdate);
    this.approachesConsumer.unsub(this.handleOnSelectionsUpdate);
    this.approachTransitionsConsumer.unsub(this.handleOnSelectionsUpdate);

    this.selectedDepartureConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedDepartureTransitionConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedDepartureRunwayConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedArrivalConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedArrivalTransitionConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedApproachConsumer.unsub(this.handleOnSelectionsUpdate);
    this.selectedApproachTransitionConsumer.unsub(this.handleOnSelectionsUpdate);

    this.fms.planInMod.unsub(this.handleOnModExec);

    this.currentPage.unsub(this.handleCurrentPageChange);

    this.originDestinationConsumer.off(this.handleOriginDestinationChanged);
  }

  private readonly handleOnModExec = (inMod: boolean): void => {
    if (!inMod) {
      this.loadingCurrentProcedures = true;
      this.store.loadCurrentProcedureData(this.fms, this.currentView.get());
      this.loadingCurrentProcedures = false;
    }
    this.refreshOriginDestination();
    this.invalidate();
  };

  private readonly handleOnSelectionsUpdate = (): void => {
    this.invalidate();
  };

  private readonly handleProcedureDetailsChanged = (e: FlightPlanProcedureDetailsEvent): void => {
    if (e.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.loadingCurrentProcedures = true;
      this.store.loadCurrentProcedureData(this.fms, this.currentView.get());
      this.loadingCurrentProcedures = false;
      this.invalidate();
    }
  };

  private readonly handleOriginDestinationChanged = (e: FlightPlanOriginDestEvent): void => {
    if (e.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.refreshOriginDestination();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly handleCurrentPageChange = (page: number): void => {
    this.page.invalidate();
  };

  /**
   * Local invalidate method
   */
  private invalidate(): void {
    if (!this.loadingCurrentProcedures) {
      this.currentPage.set(1);
      this.page.invalidate();
    }
  }

  /**
   * Refreshes the origin and destination values for the page
   */
  private refreshOriginDestination(): void {
    const plan = this.fms.getPlanForFmcRender();
    this.store.origin.set(plan.originAirport ?? '');
    this.store.destination.set(plan.destinationAirport ?? '');
  }

  /** Sets the current view on resume based on certain criteria from the manual. */
  private loadStartingView(): void {
    const isAircraftOnGround = !!SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool);
    const isAirborne = !isAircraftOnGround;
    const originFac = this.fms.facilityInfo.originFacility;
    const destFac = this.fms.facilityInfo.destinationFacility;

    if (originFac === undefined) {
      this.currentView.set(DepArrView.INDEX);
      return;
    }

    if (destFac === undefined) {
      this.displayDeparture();
      return;
    }

    const ppos = this.fms.ppos;
    const distanceFromOriginNM = originFac && UnitType.GA_RADIAN.convertTo(ppos.distance(originFac), UnitType.NMILE);
    const distanceToDestinationNM = destFac && UnitType.GA_RADIAN.convertTo(ppos.distance(destFac), UnitType.NMILE);
    const isLessThan50NMFromOrigin = distanceFromOriginNM < 50;
    const isLessThanHalfwayToDestination = distanceToDestinationNM > distanceFromOriginNM;
    const isMoreThanHalfwayToDestination = !isLessThanHalfwayToDestination;

    if (isAirborne && isMoreThanHalfwayToDestination) {
      this.displayArrival();
      return;
    }

    if (isAircraftOnGround || isLessThan50NMFromOrigin || isLessThanHalfwayToDestination) {
      this.displayDeparture();
      return;
    }

    this.currentView.set(DepArrView.INDEX);
  }

  /**
   * Returns the Page Header
   * @returns The Page Header as FmcRenderTemplateRow
   */
  private getPageHeader(): FmcRenderTemplateRow {
    const planInMod = this.fms.planInMod.get();
    const currentPage = this.currentView.get();
    const selectedFacility = this.store.selectedFacility.get();
    let title = planInMod ? ' MOD[white] ' : ' ACT ';
    title += selectedFacility ? ICAO.getIdent(selectedFacility.icao) : 'XXXX';
    title += currentPage === DepArrView.DEP ? ' DEPART[blue]' : currentPage === DepArrView.ARR ? ' ARRIVAL[blue]' : '';
    const page = `${this.currentPage.get()}/${this.pageCount.get()} [blue]`;
    return [title, page];

  }

  /**
   * Renders the Departures Page Template.
   * @returns The FmcRenderTemplate for the Departures Page.
   */
  public renderDepArrTemplate(): FmcRenderTemplate {
    const currentPage = this.currentPage.get();
    const currentView = this.currentView.get();
    const rows = [];

    this.pageCount.set(this.getPageCount());

    const pageHeader = this.getPageHeader();
    const rowsHeader = currentView === DepArrView.DEP ? [' DEPARTURES[blue]', 'RUNWAYS [blue]'] : [' STARS[blue]', 'APPROACHES [blue]'];
    rows.push(pageHeader);
    rows.push(rowsHeader);

    const leftColumnRows = this.buildLeftColumnSelectedRows(currentView, currentPage);
    const rightColumnRows = this.buildRightColumnSelectedRows(currentView, currentPage);

    for (let i = 0; i < 9; i++) {
      const row = [leftColumnRows[i] ?? '', rightColumnRows[i] ?? ''];
      rows.push(row);
    }

    const planInMod = this.fms.planInMod.get();
    const lskL6 = new DisplayField(this.page, {
      formatter: RawFormatter,
      onSelected: this.onLskL6.bind(this),
    });
    lskL6.takeValue(planInMod ? '<CANCEL MOD' : '<DEP/ARR IDX');

    const footer = [['------------------------[blue]'], [lskL6, this.legsLink]];
    footer.forEach(row => rows.push(row));

    return rows;
  }

  /**
   * Gets the page count for the procedure display.
   * @returns the number of pages
   */
  private getPageCount(): number {
    let leftRows = 1;
    let rightRows = 1;
    switch (this.currentView.get()) {
      case DepArrView.DEP:
        leftRows = this.store.selectedDeparture.get() !== undefined ? 1 : this.store.departures.length;
        if (this.store.selectedDeparture.get() !== undefined) {
          leftRows += this.store.selectedDepartureTransition.get() !== undefined ? 1 : this.store.departureTransitions.length;
        }
        rightRows = this.store.selectedDepartureRunway.get() !== undefined ? 1 : this.store.departureRunways.length;
        break;
      case DepArrView.ARR:
        leftRows = this.store.selectedArrival.get() !== undefined ? 1 : this.store.arrivals.length;
        if (this.store.selectedArrival.get() !== undefined) {
          leftRows += this.store.selectedArrivalTransition.get() !== undefined ? 1 : this.store.arrivalTransitions.length;
        }
        rightRows = this.store.selectedApproach.get() !== undefined ? 1 : this.store.approaches.length;
        if (this.store.selectedApproach.get() !== undefined) {
          const selectedTransition = this.store.selectedApproachTransition.get();
          const isVectorsTransitionSelected = selectedTransition?.transitionIndex === -1;
          // VECTORS transition is always selected by default, so if it is selected,
          // then we need to display all the other transitions as well
          rightRows += isVectorsTransitionSelected ? this.store.approachTransitions.length : 1;
        }
        break;
    }
    return Math.ceil(Math.max(leftRows, rightRows) / 5);
  }

  /**
   * Builds the Left Column for the render (the Departures/Arrivals column)
   * @param currentView The current view
   * @param currentPage The current page
   * @returns an array of FmcRenderTemplateColumn
   */
  private buildLeftColumnSelectedRows(currentView: DepArrView, currentPage: number): FmcRenderTemplateColumn[] {
    const columnRows = [];
    const selectedProcedureData = currentView === DepArrView.DEP ? this.store.selectedDeparture.get() : this.store.selectedArrival.get();
    const selectedTransitionData = currentView === DepArrView.DEP ? this.store.selectedDepartureTransition.get() : this.store.selectedArrivalTransition.get();
    let selectedTransition;

    if (selectedTransitionData !== undefined && currentPage === 1) {
      selectedTransition = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: this.onProcedureTransitionDeselected.bind(this),
        style: '[green]',
      });
      selectedTransition.takeValue(`${selectedTransitionData?.name}`);
    }

    if (selectedProcedureData !== undefined) {
      if (currentPage === 1) {
        const selectedProcedure = new DisplayField(this.page, {
          formatter: RawFormatter,
          onSelected: this.onProcedureDeselected.bind(this),
          style: '[green]',
        });
        selectedProcedure.takeValue(`${selectedProcedureData?.procedure.name}`);

        columnRows.push(selectedProcedure ?? '');
        columnRows.push(' TRANS[blue]');
      }

      if (selectedTransition) {
        columnRows.push(selectedTransition);
        columnRows.push('');
      } else {
        const startIndex = currentPage === 1 ? 0 : 4 + ((currentPage - 2) * 5);
        const itemsPerPage = currentPage === 1 ? 4 : 5;

        const availableTransitionCount = currentView === DepArrView.DEP ? this.store.departureTransitions.length : this.store.arrivalTransitions.length;

        if (availableTransitionCount > 0) {
          for (let i = startIndex; i < startIndex + itemsPerPage; i++) {
            const data = currentView === DepArrView.DEP ? this.store.departureTransitions.tryGet(i) : this.store.arrivalTransitions.tryGet(i);
            const renderItem = data ? new DisplayField(this.page, {
              formatter: RawFormatter,
              onSelected: () => this.onProcedureTransitionSelected(data),
              style: '[s-text]',
            }) : '';
            data && renderItem && renderItem.takeValue(data.name);
            columnRows.push(renderItem);
            columnRows.push('');
          }
        } else {
          columnRows.push('  NONE');
          columnRows.push('');
        }
      }

    } else {
      const startIndex = (currentPage - 1) * 5;
      for (let i = startIndex; i < startIndex + 5; i++) {
        const data = currentView === DepArrView.DEP ? this.store.departures.tryGet(i) : this.store.arrivals.tryGet(i);
        if (currentPage === 1 && i === 0 && !data) {
          columnRows.push('  NONE');
          columnRows.push('');
          break;
        } else {
          const renderItem = data ? new DisplayField(this.page, {
            formatter: RawFormatter,
            onSelected: () => this.onProcedureSelected(data),
            style: '[s-text]',
          }) : '';
          data && renderItem && renderItem.takeValue(data.procedure.name);
          columnRows.push(renderItem);
          columnRows.push('');
        }
      }
    }
    columnRows.pop();
    return columnRows;
  }

  /**
   * Builds the Right Column for the render (the Runway/Approaches column)
   * @param currentView The current view
   * @param currentPage The current page
   * @returns an array of FmcRenderTemplateColumn
   */
  private buildRightColumnSelectedRows(currentView: DepArrView, currentPage: number): FmcRenderTemplateColumn[] {
    switch (currentView) {
      case DepArrView.INDEX: return this.buildRightColumnRowsForIndex(currentPage);
      case DepArrView.DEP: return this.buildRightColumnRowsForDeparture(currentPage);
      case DepArrView.ARR: return this.buildRightColumnRowsForArrival(currentPage);
    }
  }

  /** Builds the column rows for the right side of the INDEX page.
   * @param currentPage Current page number.
   * @returns The column rows for the right side of the INDEX page. */
  private buildRightColumnRowsForIndex(currentPage: number): FmcRenderTemplateColumn[] {
    const columnRows = [];

    const startIndex = (currentPage - 1) * 5;
    for (let i = startIndex; i < startIndex + 5; i++) {
      columnRows.push('');
      columnRows.push('');
    }

    columnRows.pop();
    return columnRows;
  }

  /** Builds the column rows for the right side of the DEPART page.
   * @param currentPage Current page number.
   * @returns The column rows for the right side of the DEPART page. */
  private buildRightColumnRowsForDeparture(currentPage: number): FmcRenderTemplateColumn[] {
    const columnRows = [];
    const selectedRunway = this.store.selectedDepartureRunway.get();

    if (selectedRunway) {
      if (currentPage === 1) {
        const selectedRunwayField = new DisplayField(this.page, {
          formatter: RawFormatter,
          onSelected: this.onDepartureRunwayDeselected.bind(this),
          style: '[green]',
        });
        selectedRunwayField.takeValue(`RW${selectedRunway.designation.padEnd(3, ' ')}`);
        columnRows.push(selectedRunwayField);
        columnRows.push('');
      } else {
        columnRows.push('');
        columnRows.push('');
      }
    } else {
      const startIndex = (currentPage - 1) * 5;
      for (let i = startIndex; i < startIndex + 5; i++) {
        const runway = this.store.departureRunways.tryGet(i);
        const renderItem = runway ? new DisplayField(this.page, {
          formatter: RawFormatter,
          onSelected: () => this.onDepartureRunwaySelected(runway),
          style: '[s-text]',
        }) : '';
        runway && renderItem && renderItem.takeValue(`RW${runway.designation.padEnd(3, ' ')}`);
        columnRows.push(renderItem);
        columnRows.push('');
      }
    }

    columnRows.pop();
    return columnRows;
  }

  /** Builds the column rows for the right side of the ARRIVAL page.
   * @param currentPage Current page number.
   * @returns The column rows for the right side of the ARRIVAL page. */
  private buildRightColumnRowsForArrival(currentPage: number): FmcRenderTemplateColumn[] {
    const columnRows = [];
    const selectedApproach = this.store.selectedApproach.get();

    if (selectedApproach) {
      if (currentPage === 1) {
        const selectedApproachField = new DisplayField(this.page, {
          formatter: RawFormatter,
          onSelected: this.onApproachDeselected.bind(this),
          style: '[green]',
        });
        selectedApproachField.takeValue(formatApproachName(selectedApproach.procedure.name));
        columnRows.push(selectedApproachField);
      }
      if (selectedApproach.isVisualApproach) {
        currentPage === 1 && columnRows.push(' VIS RWY EXT[blue]');

        const visualApprOffset = this.store.visualApproachOffset.get();
        const renderItem = visualApprOffset ? new TextInputField<number | null>(this.page, {
          formatter: new NumberAndUnitFormat('NM', { minValue: 0, maxValue: 25, precision: 1 }),
          deleteAllowed: false,
          onModified: async (visualOffset: number | null) => { this.onVisualOffsetSet(visualOffset ?? 5); this.page.clearScratchpad(); return true; }
        }) : '';
        visualApprOffset && renderItem && renderItem.takeValue(visualApprOffset);
        columnRows.push(renderItem);
        columnRows.push('');

        // columnRows.push(`${this.store.visualApproachOffset.get()}[white d-text]NM[green s-text] `);
      } else {
        currentPage === 1 && selectedApproach && columnRows.push('TRANS[blue] ');

        const selectedTransition = this.store.selectedApproachTransition.get();
        let selectedTransitionField;
        if (selectedTransition && currentPage === 1) {
          selectedTransitionField = new DisplayField(this.page, {
            formatter: RawFormatter,
            onSelected: this.onApproachTransitionDeselected,
            style: '[green]',
          });
          selectedTransitionField.takeValue(`${selectedTransition?.name}`);
        }

        const isVectorsTransitionSelected = selectedTransition?.transitionIndex === -1;
        if (selectedTransitionField && !isVectorsTransitionSelected) {
          columnRows.push(selectedTransitionField);
          columnRows.push('');
        } else {
          const startIndex = currentPage === 1 ? 0 : 4 + ((currentPage - 2) * 5);
          const itemsPerPage = currentPage === 1 ? 4 : 5;
          for (let i = startIndex; i < startIndex + itemsPerPage; i++) {
            const transition = this.store.approachTransitions.tryGet(i);
            const renderItem = transition ? new DisplayField(this.page, {
              formatter: RawFormatter,
              onSelected: () => this.onApproachTransitionSelected(transition),
              style: (transition.transitionIndex === -1 ? '[green]' : '[s-text]'),
            }) : '';
            transition && renderItem && renderItem.takeValue(transition.name.padEnd(5, ' '));
            columnRows.push(renderItem);
            columnRows.push('');
          }
        }
      }
    } else if (!selectedApproach) {
      const startIndex = (currentPage - 1) * 5;
      for (let i = startIndex; i < startIndex + 5; i++) {
        const approach = this.store.approaches.tryGet(i);
        const renderItem = approach ? new DisplayField(this.page, {
          formatter: RawFormatter,
          onSelected: () => this.onApproachSelected(approach),
          style: '[s-text]',
        }) : '';
        approach && renderItem && renderItem.takeValue(formatApproachName(approach.procedure.name));
        columnRows.push(renderItem);
        columnRows.push('');
      }
    }

    columnRows.pop();
    return columnRows;
  }

  private onLskL6 = async (): Promise<boolean> => {
    const planInMod = this.fms.planInMod.get();
    if (planInMod) {
      this.fms.cancelMod();
    } else {
      this.currentView.set(DepArrView.INDEX);
    }
    return true;
  };

  private onVisualOffsetSet = async (offset: number): Promise<string | boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    const newValue = Math.round(10 * offset) / 10;
    if (newValue !== this.store.visualApproachOffset.get()) {
      this.store.visualApproachOffset.set(newValue);
      this.setPlanApproach();
    }
    return true;
  };

  /**
   * Callback when a procedure is selected via LSK
   * @param data The ProcedureListItem selected.
   * @returns If the selection was completed.
   */
  private onProcedureSelected = async (data: ProcedureListItem): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.DEP:
        this.store.selectedDeparture.set(data);
        this.setPlanDeparture();
        return true;
      case DepArrView.ARR:
        this.store.selectedArrival.set(data);
        this.setPlanArrival();
        return true;
    }
    return false;
  };

  /**
   * Callback when a procedure is deselected via LSK
   * @returns If the selection was completed.
   */
  private onProcedureDeselected = async (): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.DEP:
        this.store.selectedDeparture.set(undefined);
        this.unsetPlanDeparture();
        return true;
      case DepArrView.ARR:
        this.store.selectedArrival.set(undefined);
        this.unsetPlanArrival();
        return true;
    }
    return false;
  };

  /**
   * Callback when a departure runway is selected via LSK
   * @param data The OneWayRunway selected.
   * @returns If the selection was completed.
   */
  private onDepartureRunwaySelected = async (data: OneWayRunway): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    this.store.selectedDepartureRunway.set(data);
    this.setPlanDeparture();
    return true;
  };

  /**
   * Callback when a departure runway is deselected via LSK
   * @returns If the selection was completed.
   */
  private onDepartureRunwayDeselected = async (): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    this.store.selectedDepartureRunway.set(undefined);
    this.store.selectedDepartureRunwayTransitionIndex.set(-1);
    this.setPlanDeparture();
    return true;
  };

  /**
   * Callback when a procedure transition is selected via LSK
   * @param data The TransitionListItem selected.
   * @returns If the selection was completed.
   */
  private onProcedureTransitionSelected = async (data: TransitionListItem): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.DEP:
        this.store.selectedDepartureTransition.set(data);
        this.setPlanDeparture();
        return true;
      case DepArrView.ARR:
        this.store.selectedArrivalTransition.set(data);
        this.setPlanArrival();
        return true;
    }
    return false;
  };

  /**
   * Callback when a procedure transition is deselected via LSK
   * @returns If the selection was completed.
   */
  private onProcedureTransitionDeselected = async (): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.DEP:
        this.store.selectedDepartureTransition.set(undefined);
        this.setPlanDeparture();
        return true;
      case DepArrView.ARR:
        this.store.selectedArrivalTransition.set(undefined);
        this.setPlanArrival();
        return true;
    }
    return false;
  };

  /**
   * Callback when a approach procedure is selected via LSK
   * @param data The ProcedureListItem selected.
   * @returns If the selection was completed.
   */
  private onApproachSelected = async (data: ProcedureListItem): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.ARR:
        this.store.selectedApproach.set(data);
        // Default to the VECTORS transition
        this.store.selectedApproachTransition.set(this.store.approachTransitions.getArray().find((it => it.transitionIndex === -1)));
        this.setPlanApproach();
        return true;
    }
    return false;
  };

  /**
   * Callback when an approach procedure is deselected via LSK
   * @returns If the selection was completed.
   */
  private onApproachDeselected = async (): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.ARR:
        this.store.selectedApproach.set(undefined);
        this.unsetPlanApproach();
        this.store.selectedArrivalRunwayTransitionIndex.set(-1);
        this.setPlanArrival();
        return true;
    }
    return false;
  };

  /**
   * Callback when a approach transition is selected via LSK
   * @param data The TransitionListItem selected.
   * @returns If the selection was completed.
   */
  private onApproachTransitionSelected = async (data: TransitionListItem): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.ARR:
        this.store.selectedApproachTransition.set(data);
        this.setPlanApproach();
        return true;
    }
    return false;
  };

  /**
   * Callback when an approach transition is deselected via LSK
   * @returns If the selection was completed.
   */
  private onApproachTransitionDeselected = async (): Promise<boolean> => {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    switch (this.currentView.get()) {
      case DepArrView.ARR:
        // Set back to the VECTORS transition
        this.store.selectedApproachTransition.set(this.store.approachTransitions.getArray().find((it => it.transitionIndex === -1)));
        return true;
    }
    return false;
  };


  /**
   * Sets the currently selected departure procedure in the plan.
   */
  private setPlanDeparture(): void {
    const departure = this.store.selectedDeparture.get();
    const facility = this.store.selectedFacility.get();
    const runway = this.store.selectedDepartureRunway.get();
    if (facility && departure) {
      const transition = this.store.selectedDepartureTransition.get();

      this.fms.insertDeparture(facility, departure.index,
        this.store.selectedDepartureRunwayTransitionIndex.get(),
        transition ? transition.transitionIndex : -1,
        runway);
    } else if (facility && runway) {
      this.fms.setOrigin(facility, runway);
    } else if (facility && !runway) {
      this.fms.setOrigin(facility);
    }
  }

  /**
   * Removes the departure procedure from the plan.
   */
  private unsetPlanDeparture(): void {
    this.fms.removeDeparture();
  }

  /**
   * Sets the currently selected arrival procedure in the plan.
   */
  private setPlanArrival(): void {
    const arrival = this.store.selectedArrival.get();
    const facility = this.store.selectedFacility.get();
    if (facility && arrival) {
      const transition = this.store.selectedArrivalTransition.get();
      this.fms.insertArrival(facility, arrival.index,
        this.store.selectedArrivalRunwayTransitionIndex.get(),
        transition ? transition.transitionIndex : -1);
    }
  }

  /**
   * Removes the arrival procedure from the plan.
   */
  private unsetPlanArrival(): void {
    this.fms.removeArrival();
  }

  /**
   * Sets the currently selected approach procedure in the plan.
   */
  private async setPlanApproach(): Promise<void> {
    const approach = this.store.selectedApproach.get();
    const facility = this.store.selectedFacility.get();
    if (facility && approach) {
      const transition = this.store.selectedApproachTransition.get();
      const proc = approach.procedure as ApproachProcedure;
      this.setPlanArrival();
      await this.fms.insertApproach(facility, approach.index,
        transition ? transition.transitionIndex : -1,
        approach.isVisualApproach ? proc.runwayNumber : undefined,
        approach.isVisualApproach ? proc.runwayDesignator : undefined,
        transition?.startIndex, undefined, this.store.visualApproachOffset.get());
    }
  }

  /**
   * Removes the approach procedure from the plan.
   */
  private unsetPlanApproach(): void {
    this.fms.removeApproach();
    this.setPlanArrival();
  }

  /** Sets the Selected Facility for the Arrival */
  public displayArrival(): void {
    this.store.selectedFacility.set(this.fms.facilityInfo.destinationFacility);
    this.store.loadCurrentProcedureData(this.fms, this.currentView.get());
    this.currentView.set(DepArrView.ARR);
  }

  /** Sets the Selected Facility for the Departure */
  public displayDeparture(): void {
    this.store.selectedFacility.set(this.fms.facilityInfo.originFacility);
    this.store.loadCurrentProcedureData(this.fms, this.currentView.get());
    this.currentView.set(DepArrView.DEP);
  }
}

/** Formats the name of an approach for display on the right side of the ARRIVAL page.
 * @param name The approach procedure name.
 * @returns The formatted name. */
function formatApproachName(name: string): string {
  // Example approach formatting results:
  // ILS 8L    -> ILS   08L
  // RNAV 19 Z -> RNV Z 19
  // RNAV 4    -> RNV   04
  // VOR 7     -> VOR   07
  // NDB       -> NDB

  // eslint-disable-next-line prefer-const
  let [type, rwy = ' ', alt = ' '] = name.split(' ');

  if (rwy.match(/^\d[A-Z]?$/)) {
    rwy = '0' + rwy;
  }

  rwy = rwy.padEnd(3, ' ');

  // Uncomment these as needed
  // These either don't need any adjustment (like ILS)
  // Or I couldn't find an approach in sim to test with
  // type = type.replace(/ILS/, 'ILS');
  // type = type.replace(/LOC/, 'LOC');
  // type = type.replace(/B\/C/, 'B/C');
  // type = type.replace(/LDA/, 'LDA');
  // type = type.replace(/SDF/, 'SDF');
  // type = type.replace(/GPS/, 'GPS');
  // type = type.replace(/VOR/, 'VOR');
  // type = type.replace(/NDB/, 'NDB');
  // type = type.replace(/IGS/, 'IGS');
  // type = type.replace(/VOR\/DME/, 'V/D');
  // type = type.replace(/VORTAC/, 'VOR');
  // type = type.replace(/NDB\/DME/, 'N/D');
  // type = type.replace(/TACAN/, 'TCN');
  type = type.replace(/RNAV/, 'RNV');
  if (type === 'VISUAL') {
    type = type.replace(/VISUAL/, 'RW');
    return `${type}${rwy}`;
  }

  type = type.padEnd(3, ' ');

  return `${type} ${alt} ${rwy}`;
}