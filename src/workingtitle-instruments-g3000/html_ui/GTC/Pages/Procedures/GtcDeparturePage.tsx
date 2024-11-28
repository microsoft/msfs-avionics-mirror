
import {
  AirportFacility, ArraySubject, DepartureProcedure, EnrouteTransition, FSComponent, FacilityType, FlightPlan,
  FlightPlanLeg, FlightPlanSegmentType, LegDefinition, MappedSubject, OneWayRunway, Procedure, RunwayUtils,
  StringUtils, Subject, VNode,
} from '@microsoft/msfs-sdk';

import { FmsUtils, ProcedureType, TouchButton } from '@microsoft/msfs-garminsdk';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcViewEntry } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcFlightPlanPage } from '../FlightPlanPage/GtcFlightPlanPage';

import { GtcFlightPlanDialogs } from '../FlightPlanPage/GtcFlightPlanDialogs';
import { GtcProcedureSelectionPage } from './GtcProcedureSelectionPage';

import './GtcProcedureSelectionPage.css';

/**
 * Allows user to configure and load a departure into the flight plan.
 */
export class GtcDeparturePage extends GtcProcedureSelectionPage {
  public override title = Subject.create('Departure Selection');

  private readonly departureButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly transitionButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly runwayButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly sequenceListRef = FSComponent.createRef<GtcList<any>>();

  private readonly selectedDeparture = Subject.create<Procedure | undefined>(undefined);
  private readonly selectedDepartureIndex = this.selectedDeparture.map(x => (x ? this.selectedAirport.get()?.departures.indexOf(x) : x) ?? -1);
  private readonly selectedTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  private readonly selectedTransitionIndex = this.selectedTransition.map(x => (x ? this.selectedDeparture.get()?.enRouteTransitions.indexOf(x) : x) ?? -1);
  private readonly selectedRunway = Subject.create<OneWayRunway | undefined>(undefined);
  private readonly selectedRunwayTransitionIndex = MappedSubject.create(([runway, departure]) => {
    return (departure?.runwayTransitions.findIndex(trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation)) ?? -1;
  }, this.selectedRunway, this.selectedDeparture);

  private readonly filterBy = Subject.create<'Runway' | 'Departure'>('Departure');

  private readonly departures = MappedSubject.create(([airport, runway, filter]) => {
    if (!airport) { return []; }
    if (filter === 'Runway') {
      return airport.departures.filter(x => x.runwayTransitions.some(
        trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation));
    } else {
      return airport.departures;
    }
  }, this.selectedAirport, this.selectedRunway, this.filterBy);

  private readonly allOneWayRunways = this.selectedAirport.map(x => x ? RunwayUtils.getOneWayRunwaysFromAirport(x) : []);

  private readonly runways = MappedSubject.create(([allOneWayRunways, departure, filter]) => {
    if (filter === 'Departure') {
      if (departure?.runwayTransitions.length === 0) {
        return allOneWayRunways;
      }
      return allOneWayRunways.filter(runway => departure?.runwayTransitions.some(
        trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation));
    } else {
      return allOneWayRunways;
    }
  }, this.allOneWayRunways, this.selectedDeparture, this.filterBy);

  private readonly enrouteTransitions = MappedSubject.create(([departure, filter]) => {
    if (departure) {
      let runwayTransitionIndex = -1;

      if (filter === 'Runway') {
        runwayTransitionIndex = this.selectedRunwayTransitionIndex.get();
      } else if (departure.runwayTransitions.length === 1) {
        runwayTransitionIndex = 0;
      } else if (departure.runwayTransitions.length > 1) {
        const lastLeg = departure.runwayTransitions[0].legs[0] as FlightPlanLeg | undefined;
        if (lastLeg?.fixIcao) {
          const isMismatch = departure.runwayTransitions.some(rwyTrans => rwyTrans.legs[0]?.fixIcao !== lastLeg?.fixIcao);
          if (!isMismatch) {
            runwayTransitionIndex = 0;
          }
        }
      }

      const defaultTransition: EnrouteTransition = {
        name: FmsUtils.getDepartureEnrouteTransitionName(departure, -1, runwayTransitionIndex) || 'NONE',
        legs: [],
      };
      return [defaultTransition, ...departure.enRouteTransitions];
    } else {
      return [];
    }
  }, this.selectedDeparture, this.filterBy);

  private readonly doSelectionsMatchFlightPlan = MappedSubject.create(([
    selectedAirport, selectedDeparture, selectedTransitionIndex, selectedRunwayTransIndex,
    planAirport, planDeparture, planTransitionIndex, planRunwayTransIndex,
  ]) => {
    if (selectedAirport !== planAirport) { return false; }
    if (selectedDeparture !== planDeparture) { return false; }
    if (selectedTransitionIndex !== planTransitionIndex) { return false; }
    if (selectedRunwayTransIndex !== planRunwayTransIndex) { return false; }
    return true;
  }, this.selectedAirport, this.selectedDeparture, this.selectedTransitionIndex, this.selectedRunwayTransitionIndex,
    this.store.originFacility, this.store.departureProcedure,
    this.store.departureTransitionIndex, this.store.departureRunwayTransitionIndex);

  private readonly isLoadButtonEnabled = MappedSubject.create(([doSelectionsMatchFlightPlan, selectedAirport, selectedDeparture]) => {
    if (!doSelectionsMatchFlightPlan && selectedAirport && selectedDeparture) { return true; }
    return false;
  }, this.doSelectionsMatchFlightPlan, this.selectedAirport, this.selectedDeparture);

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
   * Initializes this page's departure selection.
   * @param facility The airport facility to select. If not defined, an initial airport will automatically be selected.
   * @param departure The departure to select. Ignored if `facility` is not defined. If not defined, an initial
   * departure will automatically be selected.
   */
  public async initSelection(facility?: AirportFacility, departure?: DepartureProcedure): Promise<void> {
    this.filterBy.set('Departure');

    if (facility === undefined) {
      await this.loadAirport();
    } else {
      this.selectedAirport.set(facility);
    }

    if (facility === undefined || departure === undefined) {
      if (this.selectedAirport.get()) {
        this.loadDeparture();
        this.loadTransition();
        this.loadRunway();
      } else {
        this.selectedDeparture.set(undefined);
        this.selectedTransition.set(undefined);
        this.selectedRunway.set(undefined);
      }
    } else {
      this.selectedDeparture.set(departure);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      this.selectedRunway.set(this.runways.get()[0]);
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
     * precedence for departure airport is:
     * - existing origin airport
     * - first airport waypoint found in the flight plan (in any segment)
     * - destination airport
     * - nearest airport
     * - most recent airport
     */
    const originAirport = this.store.originFacility.get();
    if (originAirport) {
      return originAirport;
    }

    const firstAirportIcao = FmsUtils.getFirstAirportFromPlan(this.fms.getFlightPlan(this.props.planIndex));
    if (firstAirportIcao) {
      const firstAirportFacility = await this.fms.facLoader.getFacility(FacilityType.Airport, firstAirportIcao);
      if (firstAirportFacility) {
        return firstAirportFacility;
      }
    }

    const destinationFacility = this.store.destinationFacility.get();
    if (destinationFacility) {
      return destinationFacility;
    }

    if (this.nearestContext !== undefined) {
      return this.nearestContext.getNearest(FacilityType.Airport);
    }

    // TODO Use most recent airport
  }

  /** Loads the departure. */
  private loadDeparture(): void {
    this.selectedDeparture.set(this.getDeparture());
  }

  /**
   * Choose the appropriate departure to use.
   * @returns The departure to use.
   */
  private getDeparture(): Procedure | undefined {
    const planOrigin = this.store.originFacility.get();
    const planDeparture = this.store.departureProcedure.get();
    const selectedAirport = this.selectedAirport.get();

    // 1. If selected airport matches plan origin, and plan has a departure, use that
    if (selectedAirport === planOrigin && planDeparture) {
      return planDeparture;
    }

    // 2. Use first departure from selected airport
    if (selectedAirport) {
      return selectedAirport.departures[0];
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
    const planOrigin = this.store.originFacility.get();
    const planTransition = this.store.departureTransition.get();
    const selectedAirport = this.selectedAirport.get();
    const selectedDeparture = this.selectedDeparture.get();

    // 1. If selected airport matches plan origin, and plan has a transition, use that
    if (selectedAirport === planOrigin && planTransition) {
      return planTransition;
    }

    // 2. Use first transition from selected departure
    if (selectedDeparture) {
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
    const planOrigin = this.store.originFacility.get();
    const planRunway = this.store.originRunway.get();
    const selectedAirport = this.selectedAirport.get();

    // 1. If selected airport matches plan origin, and plan has a runway, use that
    if (selectedAirport === planOrigin && planRunway) {
      return planRunway;
    }

    // 2. Use first runway from selected departure
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
    const selectedDepartureIndex = this.selectedDepartureIndex.get();
    const selectedTransitionIndex = this.selectedTransitionIndex.get();

    if (!selectedAirport || selectedDepartureIndex === -1) {
      this.previewPlan.set(null);
      this.sequence.clear();
      this.buildSequenceOpId++;
      return;
    }

    const opId = ++this.buildSequenceOpId;

    const legs: LegDefinition[] = [];

    const plan = await this.fms.buildProcedurePreviewPlan(
      this.props.calculator,
      selectedAirport,
      ProcedureType.DEPARTURE,
      selectedDepartureIndex,
      selectedTransitionIndex,
      this.selectedRunway.get(),
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
     * filter by departure:
     *   apt > dep > trans > rwy
     * filter by runway:
     *   apr > rwy > dep > trans
     */

    if (this.filterBy.get() === 'Departure') {
      this.selectedDeparture.set(this.departures.get()[0]);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      this.selectedRunway.set(this.runways.get()[0]);

      this.updateFromSelectedProcedure();

      if (this.departures.get().length <= 1) {
        this.onDepartureSelected();
      } else {
        this.departureButtonRef.instance.simulatePressed();
      }
    } else {
      this.selectedRunway.set(this.runways.get()[0]);
      this.selectedDeparture.set(this.departures.get()[0]);
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
   * Handles the departure being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private onDepartureSelected(selectionChanged = false): void {
    if (selectionChanged) {
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);
      if (this.filterBy.get() === 'Departure') {
        this.selectedRunway.set(this.runways.get()[0]);
      }

      this.updateFromSelectedProcedure();
    }

    if (!this.selectedDeparture.get()) { return; }

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
      this.selectedRunway.set(this.runways.get()[0]);

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
    if (this.filterBy.get() === 'Departure') {
      if (selectionChanged) {
        this.updateFromSelectedProcedure();
      }
      return;
    }

    if (selectionChanged) {
      this.selectedDeparture.set(this.departures.get()[0]);
      this.selectedTransition.set(this.enrouteTransitions.get()[0]);

      this.updateFromSelectedProcedure();
    }

    if (this.departures.get().length <= 1) {
      this.onDepartureSelected();
    } else {
      this.departureButtonRef.instance.simulatePressed();
    }
  }

  /**
   * Handles the filter being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private onFilterBySelected(selectionChanged: boolean): void {
    if (!selectionChanged) { return; }

    if (this.filterBy.get() === 'Departure') {
      if (this.selectedDeparture.get() === undefined) {
        this.startSelectionChain();
      }
    } else {
      if (this.selectedRunway.get() === undefined) {
        this.startSelectionChain();
      }
    }
  }

  /**
   * Updates the sequence list and preview data from the currently selected procedure.
   */
  private updateFromSelectedProcedure(): void {
    const airport = this.selectedAirport.get();
    const procedureIndex = this.selectedDepartureIndex.get();

    this.buildSequence();

    if (airport === undefined || procedureIndex < 0) {
      this.previewData.set(null);
    } else {
      this.previewData.set({
        type: ProcedureType.DEPARTURE,
        airportIcao: airport.icaoStruct,
        procedureIndex,
        transitionIndex: this.selectedTransitionIndex.get(),
        runwayTransitionIndex: this.selectedRunwayTransitionIndex.get(),
        runwayDesignation: this.selectedRunway.get()?.designation ?? ''
      });
    }
  }

  /**
   * Responds to when this page's Load button is pressed.
   */
  private onLoadButtonPressed(): void {
    const selectedFacility = this.selectedAirport.get();
    const selectedProc = this.selectedDeparture.get();

    if (!selectedFacility || !selectedProc) {
      return;
    }

    const rwyTransIndex = this.selectedRunwayTransitionIndex.get();

    this.fms.insertDeparture(
      selectedFacility,
      this.selectedDepartureIndex.get(),
      rwyTransIndex,
      this.selectedTransitionIndex.get(),
      this.selectedRunway.get(),
    );

    // Attempt to go back to the Flight Plan page. If the Flight Plan page is not open in a previous history state,
    // then go back to the home page and open the Flight Plan page.
    let activeViewEntry = this.gtcService.goBackToItem((steps, stackPeeker) => stackPeeker(0)?.viewEntry.key === GtcViewKeys.FlightPlan);
    if (activeViewEntry.key !== GtcViewKeys.FlightPlan) {
      this.gtcService.goBackToHomePage();
      activeViewEntry = this.gtcService.changePageTo<GtcFlightPlanPage>(GtcViewKeys.FlightPlan);
    }
    (activeViewEntry as GtcViewEntry<GtcFlightPlanPage>).ref.scrollTo(FlightPlanSegmentType.Departure);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="gtc-procedure-selection-page gtc-departure-page">
        <div class="top-row">
          {this.renderAirportButton(this.onAirportSelected)}
          <GtcListSelectTouchButton
            ref={this.departureButtonRef}
            label="Departure"
            class="departure procedure proc-page-big-button"
            occlusionType="hide"
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.selectedDeparture}
            isEnabled={this.departures.map(x => x?.length !== 0)}
            renderValue={value => value ? StringUtils.useZeroSlash(value.name) : '–––––'}
            listParams={(selectedDeparture): any => ({
              title: 'Select Departure',
              inputData: this.departures.get().map(dep => ({
                value: dep,
                labelRenderer: () => StringUtils.useZeroSlash(dep.name),
              })),
              selectedValue: selectedDeparture.get() ?? this.departures.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state) => {
              const changed = value !== state.get();
              state.set(value);
              this.onDepartureSelected(changed);
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
              selectedValue: this.enrouteTransitions.get().find(x => x.name === selectedTransition.get()?.name) ?? this.enrouteTransitions.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state) => {
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
            isEnabled={this.selectedRunway.map(x => !!x)}
            renderValue={value => value?.designation ? `RW${StringUtils.useZeroSlash(value.designation)}` : '–––––'}
            listParams={(selectedRunway): any => ({
              title: 'Select Runway',
              inputData: this.runways.get().map(runway => ({
                value: runway,
                labelRenderer: () => 'RW' + StringUtils.useZeroSlash(runway.designation),
              })),
              selectedValue: selectedRunway.get() ? this.runways.get().find(x => x.designation === selectedRunway.get()?.designation) : this.runways.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state) => {
              const changed = value !== state.get();
              state.set(value);
              this.onRunwaySelected(changed);
            }}
          />
        </div>
        <div class="options-box gtc-panel">
          <div class="gtc-panel-title">
            Departure Options
          </div>
          <div class="options-buttons">
            {this.renderPreviewButton()}
            <GtcListSelectTouchButton
              label="Filter by"
              occlusionType="hide"
              gtcService={this.props.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              state={this.filterBy}
              isEnabled={this.allOneWayRunways.map(x => x.length > 0)}
              renderValue={value => value}
              listParams={{
                title: 'Select Filter',
                inputData: [{
                  value: 'Runway',
                  labelRenderer: () => 'Runway',
                }, {
                  value: 'Departure',
                  labelRenderer: () => 'Departure',
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
              isEnabled={this.store.departureProcedure.map(x => !!x)}
              onPressed={() => GtcFlightPlanDialogs.removeDeparture(this.gtcService, this.store, this.fms)}
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
