import {
  AirportFacility, ArraySubject, ArrivalProcedure, EnrouteTransition, FSComponent, FacilityType, FlightPlan,
  FlightPlanSegmentType, ICAO, LegDefinition, MappedSubject, OneWayRunway, Procedure, RunwayUtils, StringUtils,
  Subject, VNode,
} from '@microsoft/msfs-sdk';

import { FmsUtils, ProcedureType, TouchButton } from '@microsoft/msfs-garminsdk';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcViewEntry } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcFlightPlanDialogs } from '../FlightPlanPage/GtcFlightPlanDialogs';
import { GtcFlightPlanPage } from '../FlightPlanPage/GtcFlightPlanPage';
import { GtcProcedureSelectionPage } from './GtcProcedureSelectionPage';

import './GtcProcedureSelectionPage.css';

/**
 * Allows user to configure and load an arrival into the flight plan.
 */
export class GtcArrivalPage extends GtcProcedureSelectionPage {
  public override title = Subject.create('Arrival Selection');

  private readonly arrivalButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly transitionButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly runwayButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly sequenceListRef = FSComponent.createRef<GtcList<any>>();

  private readonly selectedArrival = Subject.create<Procedure | undefined>(undefined);
  private readonly selectedArrivalIndex = this.selectedArrival.map(x => (x ? this.selectedAirport.get()?.arrivals.indexOf(x) : x) ?? -1);
  private readonly selectedTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  private readonly selectedTransitionIndex = this.selectedTransition.map(x => (x ? this.selectedArrival.get()?.enRouteTransitions.indexOf(x) : x) ?? -1);
  /** -1 is for NONE, undefined is when there are no runways, and it shows `----`. */
  private readonly selectedRunway = Subject.create<OneWayRunway | -1 | undefined>(undefined);
  private readonly selectedRunwayTransitionIndex = MappedSubject.create(([runway, arrival]) => {
    if (runway === -1) { return -1; }
    return (arrival?.runwayTransitions.findIndex(trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation)) ?? -1;
  }, this.selectedRunway, this.selectedArrival);

  private readonly filterBy = Subject.create<'Runway' | 'Arrival'>('Arrival');

  private readonly arrivals = MappedSubject.create(([airport, runway, filter]) => {
    if (!airport) { return []; }
    if (runway !== -1 && filter === 'Runway') {
      return airport.arrivals.filter(arrival => {
        if (arrival.runwayTransitions.length === 0) { return arrival; }
        return arrival.runwayTransitions.some(trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation);
      });
    } else {
      return airport.arrivals;
    }
  }, this.selectedAirport, this.selectedRunway, this.filterBy);

  private readonly allOneWayRunways = this.selectedAirport.map(x => x ? RunwayUtils.getOneWayRunwaysFromAirport(x) : []);

  private readonly runways = MappedSubject.create(([allOneWayRunways, arrival, filter]) => {
    if (filter === 'Arrival') {
      if (arrival?.runwayTransitions.length === 0) {
        return allOneWayRunways;
      }
      return allOneWayRunways.filter(runway => arrival?.runwayTransitions.some(
        trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation));
    } else {
      return allOneWayRunways;
    }
  }, this.allOneWayRunways, this.selectedArrival, this.filterBy);

  private readonly enrouteTransitions = this.selectedArrival.map(arrival => {
    if (arrival) {
      const defaultTransition: EnrouteTransition = {
        name: FmsUtils.getArrivalEnrouteTransitionName(arrival, -1, -1) || 'NONE',
        legs: [],
      };
      return [defaultTransition, ...arrival.enRouteTransitions];
    } else {
      return [];
    }
  });

  private readonly doSelectionsMatchFlightPlan = MappedSubject.create(([
    selectedAirport, selectedArrival, selectedTransitionIndex, selectedRunway,
    planArrivalFacility, planArrival, planTransitionIndex, planRunway,
  ]) => {
    if (selectedAirport !== planArrivalFacility) { return false; }
    if (selectedArrival !== planArrival) { return false; }
    if (selectedTransitionIndex !== planTransitionIndex) { return false; }
    const selectedRunwayName = selectedRunway !== -1 ? selectedRunway?.designation : '';
    if (selectedRunwayName !== planRunway?.designation) { return false; }
    return true;
  }, this.selectedAirport, this.selectedArrival, this.selectedTransitionIndex, this.selectedRunway,
    this.store.arrivalFacility, this.store.arrivalProcedure,
    this.store.arrivalTransitionIndex, this.store.arrivalRunway);

  private readonly isLoadButtonEnabled = MappedSubject.create(([doSelectionsMatchFlightPlan, selectedAirport, selectedArrival]) => {
    if (!doSelectionsMatchFlightPlan && selectedAirport && selectedArrival) { return true; }
    return false;
  }, this.doSelectionsMatchFlightPlan, this.selectedAirport, this.selectedArrival);

  private readonly previewPlan = Subject.create<FlightPlan | null>(null);

  private readonly sequence = ArraySubject.create<LegDefinition>();

  private buildSequenceOpId = 0;

  /** @inheritDoc */
  public override onAfterRender(): void {
    super.onAfterRender();

    this._activeComponent.set(this.sequenceListRef.instance);

    this.isLoadButtonEnabled.sub(isLoadButtonEnabled => {
      this._sidebarState.slot1.set(isLoadButtonEnabled ? 'cancel' : null);
    });
  }

  /**
   * Initializes this page's arrival selection.
   * @param facility The airport facility to select. If not defined, an initial airport will automatically be selected.
   * @param arrival The arrival to select. Ignored if `facility` is not defined. If not defined, an initial arrival
   * will automatically be selected.
   */
  public async initSelection(facility?: AirportFacility, arrival?: ArrivalProcedure): Promise<void> {
    this.filterBy.set('Arrival');

    if (facility === undefined) {
      await this.loadAirport();
    } else {
      this.selectedAirport.set(facility);
    }

    if (facility === undefined || arrival === undefined) {
      if (this.selectedAirport.get()) {
        this.loadArrival();
        this.loadTransition();
        this.loadRunway();
      } else {
        this.selectedArrival.set(undefined);
        this.selectedTransition.set(undefined);
        this.selectedRunway.set(undefined);
      }
    } else {
      this.selectedArrival.set(arrival);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      this.selectedRunway.set(-1);
    }

    this.updateFromSelectedProcedure();
  }

  /** Loads the appropriate airport for the airport field. */
  private async loadAirport(): Promise<void> {
    this.selectedAirport.set(await this.getAirport());
  }

  /**
   * Choose the appropriate airport to use.
   * @returns The airport to use.
   */
  private async getAirport(): Promise<AirportFacility | undefined> {
    /*
     * precedence for arrival airport is:
     * - existing arrival facility
     * - destination airport
     * - last airport found in the flight plan
     * - origin airport
     * - nearest airport
     * - most recent airport
     */
    const arrivalFacility = this.store.arrivalFacility.get();
    if (arrivalFacility) {
      return arrivalFacility;
    }

    const destinationFacility = this.store.destinationFacility.get();
    if (destinationFacility) {
      return destinationFacility;
    }

    const lastAirportIcao = FmsUtils.getLastAirportFromPlan(this.fms.getFlightPlan(this.props.planIndex));
    if (lastAirportIcao) {
      const lastAirportFacility = await this.fms.facLoader.getFacility(FacilityType.Airport, lastAirportIcao);
      if (lastAirportFacility) {
        return lastAirportFacility;
      }
    }

    const originFacility = this.store.originFacility.get();
    if (originFacility) {
      return originFacility;
    }

    if (this.nearestContext !== undefined) {
      return this.nearestContext.getNearest(FacilityType.Airport);
    }

    // TODO Use most recent airport
  }

  /** Loads the arrival. */
  private loadArrival(): void {
    this.selectedArrival.set(this.getArrival());
  }

  /**
   * Choose the appropriate arrival to use.
   * @returns The arrival to use.
   */
  private getArrival(): Procedure | undefined {
    const planArrivalFacility = this.store.arrivalFacility.get();
    const planArrival = this.store.arrivalProcedure.get();
    const selectedAirport = this.selectedAirport.get();

    // 1. If selected airport matches plan arrival facility, and plan has an arrival, use that
    if (selectedAirport === planArrivalFacility && planArrival) {
      return planArrival;
    }

    // 2. Use first arrival from selected airport
    if (selectedAirport) {
      return selectedAirport.arrivals[0];
    }

    return undefined;
  }

  /** Loads the transition. */
  private loadTransition(): void {
    this.selectedTransition.set(this.getTransition());
  }

  /**
   * Choose the appropriate transition to use.
   * @returns The transition to use.
   */
  private getTransition(): EnrouteTransition | undefined {
    const planArrivalFacility = this.store.arrivalFacility.get();
    const planTransition = this.store.arrivalTransition.get();
    const selectedAirport = this.selectedAirport.get();
    const selectedArrival = this.selectedArrival.get();

    // 1. If selected airport matches plan arrival facility, and plan has a transition, use that
    if (selectedAirport === planArrivalFacility && planTransition) {
      return planTransition;
    }

    // 2. Use first transition from selected arrival
    if (selectedArrival) {
      return this.enrouteTransitions.get()[0];
    }

    return undefined;
  }

  /** Loads the runway. */
  private loadRunway(): void {
    this.selectedRunway.set(this.getRunway());
  }

  /**
   * Choose the appropriate runway to use.
   * @returns The runway to use.
   */
  private getRunway(): OneWayRunway | undefined {
    const planArrivalFacility = this.store.arrivalFacility.get();
    const planArrivalRunway = this.store.arrivalRunway.get();
    const planDestinationFacility = this.store.destinationFacility.get();
    const planDestinationRunway = this.store.destinationRunway.get();
    const selectedAirport = this.selectedAirport.get();

    // 1.1 If selected airport matches plan arrival facility, and arrival has a runway, use that
    if (selectedAirport === planArrivalFacility && planArrivalRunway) {
      return planArrivalRunway;
    }

    // 1.2 If selected airport matches plan destination facility, and plan has a runway, use that
    if (selectedAirport === planDestinationFacility && planDestinationRunway) {
      // We filter by arival by default, so make sure the runway is supported by the arrival.
      if (this.selectedArrival.get()?.runwayTransitions.length === 0 ||
        this.selectedArrival.get()?.runwayTransitions.some(x => RunwayUtils.getRunwayNameString(x.runwayNumber, x.runwayDesignation) === planDestinationRunway.designation)) {
        return planDestinationRunway;
      }
    }

    // 2. Use first runway from selected arrival
    if (selectedAirport) {
      return this.runways.get()[0];
    }

    return undefined;
  }

  /**
   * Creates a procedure preview plan with the current selections.
   */
  private async buildSequence(): Promise<void> {
    const selectedAirport = this.selectedAirport.get();
    const selectedArrivalIndex = this.selectedArrivalIndex.get();
    const selectedTransitionIndex = this.selectedTransitionIndex.get();

    if (!selectedAirport || selectedArrivalIndex === -1) {
      this.previewPlan.set(null);
      this.sequence.clear();
      this.buildSequenceOpId++;
      return;
    }

    const opId = ++this.buildSequenceOpId;

    const legs: LegDefinition[] = [];
    const runway = this.selectedRunway.get();

    const plan = await this.fms.buildProcedurePreviewPlan(
      this.props.calculator,
      selectedAirport,
      ProcedureType.ARRIVAL,
      selectedArrivalIndex,
      selectedTransitionIndex,
      runway === -1 ? undefined : runway,
      this.selectedRunwayTransitionIndex.get(),
    );

    if (opId === this.buildSequenceOpId) {
      this.previewPlan.set(plan);
      plan.getSegment(0).legs.forEach((l) => {
        legs.push(l);
      });
      this.sequence.set(legs);
    }
  }

  /** Handles the airport being selected, showing the next list dialog if necessary. */
  private readonly onAirportSelected = (): void => {
    this.startSelectionChain();
  };

  /**
   * Starts this page's procedure selection chain.
   */
  private startSelectionChain(): void {
    /*
     * Changing any of the selected options triggers a chain reaction
     * which prompts the user to select the other options.
     *
     * filter by arrival:
     *   apt > arr > trans > rwy
     * filter by runway:
     *   apr > rwy > arr > trans
     */

    if (this.filterBy.get() === 'Arrival') {
      this.selectedArrival.set(this.arrivals.get()[0]);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      this.selectedRunway.set(-1);

      this.updateFromSelectedProcedure();

      if (this.arrivals.get().length <= 1) {
        this.onArrivalSelected();
      } else {
        this.arrivalButtonRef.instance.simulatePressed();
      }
    } else {
      this.selectedRunway.set(this.runways.get()[0]);
      this.selectedArrival.set(this.arrivals.get()[0]);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);

      this.updateFromSelectedProcedure();

      if (this.runways.get().length <= 1) {
        this.onRunwaySelected();
      } else {
        this.runwayButtonRef.instance.simulatePressed();
      }
    }
  }

  /**
   * Handles the arrival being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   * */
  private onArrivalSelected(selectionChanged = false): void {
    if (selectionChanged) {
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      if (this.filterBy.get() === 'Arrival') {
        this.selectedRunway.set(-1);
      }

      this.updateFromSelectedProcedure();
    }

    if (!this.selectedArrival.get()) { return; }

    if (this.enrouteTransitions.get().length <= 1) {
      this.onTransitionSelected();
    } else {
      this.transitionButtonRef.instance.simulatePressed();
    }
  }

  /**
   * Handles the transition being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private onTransitionSelected(selectionChanged = false): void {
    if (this.filterBy.get() === 'Runway') {
      if (selectionChanged) {
        this.updateFromSelectedProcedure();
      }
      return;
    }

    if (selectionChanged) {
      this.selectedRunway.set(-1);

      this.updateFromSelectedProcedure();
    }

    if (this.runways.get().length <= 1) {
      this.onRunwaySelected();
    } else {
      this.runwayButtonRef.instance.simulatePressed();
    }
  }

  /**
   * Handles the runway being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private onRunwaySelected(selectionChanged = false): void {
    if (this.filterBy.get() === 'Arrival') {
      if (selectionChanged) {
        this.updateFromSelectedProcedure();
      }
      return;
    }

    if (selectionChanged) {
      this.selectedArrival.set(this.arrivals.get()[0]);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);

      this.updateFromSelectedProcedure();
    }

    if (this.arrivals.get().length <= 1) {
      this.onArrivalSelected();
    } else {
      this.arrivalButtonRef.instance.simulatePressed();
    }
  }

  /**
   * Handles the filter being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private onFilterBySelected(selectionChanged: boolean): void {
    if (!selectionChanged) { return; }
    if (this.filterBy.get() === 'Arrival') {
      if (this.selectedArrival.get() === undefined) {
        this.startSelectionChain();
      }
    } else {
      if (this.selectedRunway.get() === -1) {
        this.startSelectionChain();
      }
    }
  }

  /**
   * Updates the sequence list and preview data from the currently selected procedure.
   */
  private updateFromSelectedProcedure(): void {
    const airport = this.selectedAirport.get();
    const procedureIndex = this.selectedArrivalIndex.get();

    this.buildSequence();

    if (airport === undefined || procedureIndex < 0) {
      this.previewData.set(null);
    } else {
      const runway = this.selectedRunway.get();

      this.previewData.set({
        type: ProcedureType.ARRIVAL,
        airportIcao: airport.icaoStruct,
        procedureIndex,
        transitionIndex: this.selectedTransitionIndex.get(),
        runwayTransitionIndex: this.selectedRunwayTransitionIndex.get(),
        runwayDesignation: runway === -1 || runway === undefined ? '' : runway.designation
      });
    }
  }

  /**
   * Responds to when this page's Load button is pressed.
   */
  private async onLoadButtonPressed(): Promise<void> {
    const selectedFacility = this.selectedAirport.get();
    const selectedProc = this.selectedArrival.get();

    if (!selectedFacility || !selectedProc) {
      return;
    }

    const destinationFacility = this.store.destinationFacility.get();

    if (destinationFacility && selectedFacility.icao !== destinationFacility.icao) {
      const arrivalFacIdent = ICAO.getIdent(selectedFacility.icao);
      const destinationFacIdent = ICAO.getIdent(destinationFacility.icao);
      const message = `The selected arrival airport\n(${arrivalFacIdent}) is different from the\napproach airport (${destinationFacIdent}).\nLoad Arrival?`;
      const accepted = await GtcDialogs.openMessageDialog(this.gtcService, message);
      if (!accepted) {
        return;
      }
    }

    const rwyTransIndex = this.selectedRunwayTransitionIndex.get();
    const runway = this.selectedRunway.get();

    this.fms.insertArrival(
      selectedFacility,
      this.selectedArrivalIndex.get(),
      rwyTransIndex,
      this.selectedTransitionIndex.get(),
      runway === -1 ? undefined : runway,
    );

    // Attempt to go back to the Flight Plan page. If the Flight Plan page is not open in a previous history state,
    // then go back to the home page and open the Flight Plan page.
    let activeViewEntry = this.gtcService.goBackToItem((steps, stackPeeker) => stackPeeker(0)?.viewEntry.key === GtcViewKeys.FlightPlan);
    if (activeViewEntry.key !== GtcViewKeys.FlightPlan) {
      this.gtcService.goBackToHomePage();
      activeViewEntry = this.gtcService.changePageTo<GtcFlightPlanPage>(GtcViewKeys.FlightPlan);
    }
    (activeViewEntry as GtcViewEntry<GtcFlightPlanPage>).ref.scrollTo(FlightPlanSegmentType.Arrival);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="gtc-procedure-selection-page gtc-arrival-page">
        <div class="top-row">
          {this.renderAirportButton(this.onAirportSelected)}
          <GtcListSelectTouchButton
            ref={this.arrivalButtonRef}
            label="Arrival"
            class="arrival procedure proc-page-big-button"
            occlusionType="hide"
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.selectedArrival}
            isEnabled={this.arrivals.map(x => x?.length !== 0)}
            renderValue={value => value ? StringUtils.useZeroSlash(value.name) : '–––––'}
            listParams={(selectedArrival): any => ({
              title: 'Select Arrival',
              inputData: this.arrivals.get().map(arr => ({
                value: arr,
                labelRenderer: () => StringUtils.useZeroSlash(arr.name),
              })),
              selectedValue: selectedArrival.get() ?? this.arrivals.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state): void => {
              const changed = value !== state.get();
              state.set(value);
              this.onArrivalSelected(changed);
            }}
          />
          <GtcListSelectTouchButton
            ref={this.transitionButtonRef}
            label="Transition"
            class="transition proc-page-big-button"
            occlusionType="hide"
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.selectedTransition}
            isEnabled={this.selectedTransition.map(x => !!x)}
            renderValue={value => value ? StringUtils.useZeroSlash(value.name) : '–––––'}
            listParams={(selectedTransition): any => ({
              title: 'Select Transition',
              inputData: this.enrouteTransitions.get().map(trans => ({
                value: trans,
                labelRenderer: () => StringUtils.useZeroSlash(trans.name),
              })),
              selectedValue: selectedTransition.get() ?? this.enrouteTransitions.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state): void => {
              const changed = value !== state.get();
              state.set(value);
              this.onTransitionSelected(changed);
            }}
          />
        </div>
        <div class="second-row">
          <GtcListSelectTouchButton
            ref={this.runwayButtonRef}
            label="Runway"
            class="runway proc-page-big-button"
            occlusionType="hide"
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.selectedRunway}
            isEnabled={this.runways.map(x => x.length > 0)}
            renderValue={value => value === -1 ? 'NONE' : value?.designation ? `RW${StringUtils.useZeroSlash(value.designation)}` : '–––––'}
            listParams={state => {
              const selectedRunway = state.get();

              const inputData = this.runways.get().map(runway => ({
                value: runway as OneWayRunway | -1,
                labelRenderer: () => 'RW' + StringUtils.useZeroSlash(runway.designation),
              }));

              if (this.filterBy.get() === 'Arrival') {
                inputData.unshift({
                  value: -1,
                  labelRenderer: () => 'NONE',
                });
              }

              const selectedValue = selectedRunway === -1
                ? -1 as -1
                : this.filterBy.get() === 'Arrival' && selectedRunway === undefined
                  ? -1 as -1
                  : this.runways.get().find(x => x.designation === selectedRunway?.designation) ?? this.runways.get()[0];

              return ({
                title: 'Select Runway',
                inputData,
                selectedValue,
                ...this.listParams,
              });
            }}
            onSelected={(value, state) => {
              const changed = value !== state.get();
              state.set(value);
              this.onRunwaySelected(changed);
            }}
          />
        </div>
        <div class="options-box gtc-panel">
          <div class="gtc-panel-title">
            Arrival Options
          </div>
          <div class="options-buttons">
            {this.renderPreviewButton()}
            <GtcListSelectTouchButton
              label="Filter by"
              occlusionType="hide"
              gtcService={this.props.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              state={this.filterBy}
              isEnabled={this.selectedArrival.map(x => !!x)}
              renderValue={(value) => value}
              listParams={{
                title: 'Select Filter',
                inputData: [{
                  value: 'Runway',
                  labelRenderer: () => 'Runway',
                }, {
                  value: 'Arrival',
                  labelRenderer: () => 'Arrival',
                }],
                selectedValue: this.filterBy,
                ...this.listParams,
              }}
              onSelected={(value, state) => {
                const changed = value !== state.get();
                state.set(value);
                this.onFilterBySelected(changed);
              }}
            />
            <TouchButton
              label="Remove"
              isEnabled={this.store.arrivalProcedure.map(x => !!x)}
              onPressed={() => GtcFlightPlanDialogs.removeArrival(this.gtcService, this.store, this.fms)}
            />
            <TouchButton
              label="Load"
              class="touch-button-special"
              isEnabled={this.isLoadButtonEnabled}
              onPressed={this.onLoadButtonPressed.bind(this)}
            />
          </div>
        </div>
        {this.renderSequenceBox(this.sequenceListRef, this._sidebarState, this.sequence)}
      </div>
    );
  }
}
