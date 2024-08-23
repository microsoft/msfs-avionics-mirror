import {
  AdditionalApproachType, AirportFacility, ApproachProcedure, ArraySubject, ArrivalProcedure, DepartureProcedure, ICAO, OneWayRunway, RnavTypeFlags,
  RunwayUtils, Subject, SubscribableArray
} from '@microsoft/msfs-sdk';

import { TransitionListItem } from '@microsoft/msfs-wt21-shared';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { DepArrView } from './DepArrPageController';

/**
 * Dep Arr Page Store
 */
export class DepArrPageStore {

  public readonly selectedFacility = Subject.create<AirportFacility | undefined>(undefined);

  private readonly _departureRunways = ArraySubject.create<OneWayRunway>();
  public readonly departureRunways = this._departureRunways as SubscribableArray<OneWayRunway>;
  public readonly selectedDepartureRunway = Subject.create<OneWayRunway | undefined>(undefined);
  public readonly selectedDepartureRunwayTransitionIndex = Subject.create(-1);

  private readonly _departures = ArraySubject.create<ProcedureListItem>();
  public readonly departures = this._departures as SubscribableArray<ProcedureListItem>;
  public readonly selectedDeparture = Subject.create<ProcedureListItem | undefined>(undefined);

  private readonly _departureTransitions = ArraySubject.create<TransitionListItem>();
  public readonly departureTransitions = this._departureTransitions as SubscribableArray<TransitionListItem>;
  public readonly selectedDepartureTransition = Subject.create<TransitionListItem | undefined>(undefined);

  private readonly _arrivals = ArraySubject.create<ProcedureListItem>();
  public readonly arrivals = this._arrivals as SubscribableArray<ProcedureListItem>;
  public readonly selectedArrival = Subject.create<ProcedureListItem | undefined>(undefined);
  public readonly selectedArrivalRunwayTransitionIndex = Subject.create(-1);

  private readonly _arrivalTransitions = ArraySubject.create<TransitionListItem>();
  public readonly arrivalTransitions = this._arrivalTransitions as SubscribableArray<TransitionListItem>;
  public readonly selectedArrivalTransition = Subject.create<TransitionListItem | undefined>(undefined);

  private readonly _approaches = ArraySubject.create<ProcedureListItem>();
  public readonly approaches = this._approaches as SubscribableArray<ProcedureListItem>;
  public readonly selectedApproach = Subject.create<ProcedureListItem | undefined>(undefined);

  private readonly _approachTransitions = ArraySubject.create<TransitionListItem>();
  public readonly approachTransitions = this._approachTransitions as SubscribableArray<TransitionListItem>;
  public readonly selectedApproachTransition = Subject.create<TransitionListItem | undefined>(undefined);

  public readonly visualApproachOffset = Subject.create<number>(5);

  public readonly origin = Subject.create<string>('');
  public readonly destination = Subject.create<string>('');


  /**
   * Creates the store.
   */
  constructor() {
    this.selectedFacility.sub(this.onSelectedFacilityChanged.bind(this));
    this.selectedDepartureRunway.sub(this.onSelectedDepartureRunwayChanged.bind(this));
    this.selectedDeparture.sub(this.onSelectedDepartureChanged.bind(this));
    this.selectedArrival.sub(this.onSelectedArrivalChanged.bind(this));
    this.selectedApproach.sub(this.onSelectedApproachChanged.bind(this));
  }

  /**
   * Destroys this store.
   */
  public destroy(): void {
    this.selectedFacility.unsub(this.onSelectedFacilityChanged.bind(this));
    this.selectedDepartureRunway.unsub(this.onSelectedDepartureRunwayChanged.bind(this));
    this.selectedDeparture.unsub(this.onSelectedDepartureChanged.bind(this));
    this.selectedArrival.unsub(this.onSelectedArrivalChanged.bind(this));
    this.selectedApproach.unsub(this.onSelectedApproachChanged.bind(this));
  }

  /**
   * Responds to changes in the selected airport facility.
   * @param facility The selected airport facility.
   */
  private onSelectedFacilityChanged(facility: AirportFacility | undefined): void {
    this.resetStore();
    this._departures.set(this.getDepartures(facility));
    this._arrivals.set(this.getArrivals(facility));
    this._approaches.set(this.getApproaches(facility));
    this._departureRunways.set(this.getDepartureRunways(facility));
  }

  /**
   * Responds to changes in the selected departure.
   * @param proc The selected departure.
   */
  private onSelectedDepartureChanged(proc: ProcedureListItem | undefined): void {
    this._departureTransitions.set(proc ? this.getDepArrTransitions(proc.procedure as DepartureProcedure) : []);
    this._departureRunways.set(this.getDepartureRunways(this.selectedFacility.get(), proc ? proc.procedure as DepartureProcedure : undefined));
    this.trySetDepartureRunwayTransitionIndex();
  }

  /**
   * Responds to changes in the selected departure.
   * @param runway The selected one way runway.
   */
  private onSelectedDepartureRunwayChanged(runway: OneWayRunway | undefined): void {
    this._departures.set(this.getDepartures(this.selectedFacility.get(), runway));
    this.trySetDepartureRunwayTransitionIndex();
  }

  /**
   * Responds to changes in the selected arrival.
   * @param proc The selected arrival.
   */
  private onSelectedArrivalChanged(proc: ProcedureListItem | undefined): void {
    this._arrivalTransitions.set(proc ? this.getDepArrTransitions(proc.procedure as ArrivalProcedure) : []);
    this._approaches.set(this.getApproaches(this.selectedFacility.get(), proc ? proc.procedure as ArrivalProcedure : undefined));
    this.trySetArrivalRunwayTransitionIndex();
  }

  /**
   * Responds to changes in the selected approach.
   * @param proc The selected approach.
   */
  private onSelectedApproachChanged(proc: ProcedureListItem | undefined): void {
    this._approachTransitions.set(proc ? this.getApproachTransitions(proc) : []);
    this._arrivals.set(this.getArrivals(this.selectedFacility.get(), proc ? proc.procedure as ApproachProcedure : undefined));
    this.trySetArrivalRunwayTransitionIndex();
  }

  /**
   * Gets the departures array from an airport.
   * @param airport An airport facility.
   * @param runway A one way runway, if selected.  (optional)
   * @returns The departures array from the specified airport.
   */
  private getDepartures(airport: AirportFacility | undefined, runway?: OneWayRunway): readonly ProcedureListItem[] {
    const departures: ProcedureListItem[] = [];
    if (airport !== undefined) {
      airport.departures.forEach((proc, index) => {
        if (!runway || this.checkIfProcedureHasRunway(proc, runway.direction, runway.runwayDesignator)) {
          departures.push({
            procedure: proc,
            index,
            isVisualApproach: false,
          });
        }
      });
    }
    return departures;
  }

  /**
   * Gets the arrivals array from an airport.
   * @param airport An airport facility.
   * @param approach An approach procedure to choose arrivals for (optional)
   * @returns The arrivals array from the specified airport.
   */
  private getArrivals(airport: AirportFacility | undefined, approach?: ApproachProcedure): readonly ProcedureListItem[] {
    const arrivals: ProcedureListItem[] = [];
    if (airport !== undefined) {
      airport.arrivals.forEach((arrival, index) => {
        if (!approach || this.checkIfProcedureHasRunway(arrival, approach.runwayNumber, approach.runwayDesignator)) {
          arrivals.push({
            procedure: arrival,
            index,
            isVisualApproach: false
          });
        }
      });
    }
    return arrivals;
  }

  /**
   * Gets an array of approaches from an airport.
   * @param airport An airport.
   * @param arrival An arrival procedure to find approaches for (optional).
   * @returns An array of approaches.
   */
  private getApproaches(airport: AirportFacility | undefined, arrival?: ArrivalProcedure): readonly ProcedureListItem[] {
    if (airport !== undefined) {
      const ilsFound = new Set();
      for (const approach of airport.approaches) {
        if (approach.approachType == ApproachType.APPROACH_TYPE_ILS) {
          ilsFound.add(approach.runway);
        }
      }

      const approaches: ProcedureListItem[] = [];
      airport.approaches.forEach((approach, index) => {
        if (approach.approachType !== ApproachType.APPROACH_TYPE_LOCALIZER || !ilsFound.has(approach.runway)) {
          if (!arrival || this.checkIfProcedureHasRunway(arrival, approach.runwayNumber, approach.runwayDesignator)) {
            approaches.push({
              procedure: approach,
              index,
              isVisualApproach: false
            });
          }
        }
      });
      this.getVisualApproaches(airport).forEach(va => {
        if (!arrival || this.checkIfProcedureHasRunway(arrival, va.runwayNumber, va.runwayDesignator)) {
          approaches.push({
            procedure: va,
            index: -1,
            isVisualApproach: true
          });
        }
      });
      return sortApproaches(approaches);
    }
    return [];
  }

  /**
   * Gets the visual approaches for the facility.
   * @param facility is the facility.
   * @returns The Approach Procedures.
   */
  private getVisualApproaches(facility: AirportFacility): ApproachProcedure[] {
    const runways: OneWayRunway[] = [];
    for (let i = 0; i < facility.runways.length; i++) {
      RunwayUtils.getOneWayRunways(facility.runways[i], i).forEach(rw => { runways.push(rw); });
    }
    const approaches: ApproachProcedure[] = [];
    runways.forEach(r => {
      approaches.push({
        name: `VISUAL ${r.designation}`,
        runway: r.designation,
        icaos: [],
        transitions: [{ name: 'STRAIGHT', legs: [] }],
        finalLegs: [],
        missedLegs: [],
        approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
        approachSuffix: '',
        runwayDesignator: r.runwayDesignator,
        runwayNumber: r.direction,
        rnavTypeFlags: RnavTypeFlags.None
      });
    });
    return approaches;
  }

  /**
   * Gets the one way runways of an airport facility.
   * @param airport The airport facility.
   * @param proc The departure procedure to collect one way runways for (optional)
   * @returns The one way runways of the airport facility.
   */
  private getDepartureRunways(airport: AirportFacility | undefined, proc?: DepartureProcedure): readonly OneWayRunway[] {
    const runways: OneWayRunway[] = [];
    // If the proc.runwayTransitions is empty, that means it supports all runways
    if ((!proc || proc.runwayTransitions.length === 0) && airport !== undefined) {
      airport.runways.forEach((rw, index) => RunwayUtils.getOneWayRunways(rw, index).forEach(owr => runways.push(owr)));
    } else if (proc && airport !== undefined) {
      proc.runwayTransitions.forEach(trans => {
        const oneWayRunway = RunwayUtils.matchOneWayRunway(airport, trans.runwayNumber, trans.runwayDesignation);
        oneWayRunway && runways.push(oneWayRunway);
      });
    }
    return sortRunways(runways);
  }

  /**
   * Gets the enroute transitions of a departure or arrival procedure.
   * @param procedure A procedure.
   * @returns The enroute transitions of the procedure.
   */
  private getDepArrTransitions(procedure: DepartureProcedure | ArrivalProcedure): TransitionListItem[] {
    const transitions: TransitionListItem[] = [];

    for (let i = 0; i < procedure.enRouteTransitions.length; i++) {
      const transition = procedure.enRouteTransitions[i];
      transitions.push({
        name: transition.name,
        transitionIndex: i
      });
    }

    return transitions;
  }

  /**
   * Gets the transitions of a selected approach.
   * @param approachListItem The Approach procedure list item.
   * @returns The transitions of the procedure.
   */
  private getApproachTransitions(approachListItem: ProcedureListItem | undefined): TransitionListItem[] {
    const transitions: TransitionListItem[] = [];

    const approach = approachListItem?.procedure as ApproachProcedure;

    if (approachListItem && approach) {
      for (let i = 0; i < approach.transitions.length; i++) {
        const transition = approach.transitions[i];
        const firstLeg = transition.legs[0];
        const name = transition.name ?? (firstLeg ? ICAO.getIdent(firstLeg.fixIcao) : '');
        // const suffix = BitFlags.isAll(firstLeg?.fixTypeFlags ?? 0, FixTypeFlags.IAF) ? ' iaf' : '';
        transitions.push({
          name: name,
          transitionIndex: i
        });
      }

      transitions.unshift({ name: 'VECTORS', transitionIndex: -1 });

      // If approach has no transitions in the nav data, create a default one beginning at the start of finalLegs
      if (!approachListItem.isVisualApproach && approach.transitions.length === 0 && approach.finalLegs.length > 0) {
        transitions.push({
          name: ICAO.getIdent(approach.finalLegs[0].fixIcao),
          transitionIndex: 0
        });
      }
    }
    return transitions;
  }

  /**
   * Checks a procedure's runway transitions for a match to a one way runway.
   * @param proc The Departure or Arrival Procedure
   * @param runwayNumber The runway number.
   * @param runwayDesignator The runway designator.
   * @returns Whether the procedure has a runway transition for the specified runway.
   */
  private checkIfProcedureHasRunway(proc: DepartureProcedure | ArrivalProcedure, runwayNumber?: number, runwayDesignator?: RunwayDesignator): boolean {
    let found = false;
    // If the proc.runwayTransitions is empty, that means it supports all runways
    if (proc.runwayTransitions.length < 1) {
      return true;
    }
    proc.runwayTransitions.forEach(trans => {
      if (trans.runwayNumber === runwayNumber && trans.runwayDesignation === runwayDesignator) {
        found = true;
        return;
      }
    });
    return found;
  }

  /**
   * Tries to set the departure runway transition index subject, or sets it to -1;
   */
  private trySetDepartureRunwayTransitionIndex(): void {
    const procedure = this.selectedDeparture.get()?.procedure as DepartureProcedure;
    const runway = this.selectedDepartureRunway.get();
    if (procedure !== undefined && runway !== undefined) {
      const index = procedure.runwayTransitions.findIndex(trans =>
        trans.runwayNumber === runway.direction && trans.runwayDesignation === runway.runwayDesignator
      );
      this.selectedDepartureRunwayTransitionIndex.set(index);
    } else {
      this.selectedDepartureRunwayTransitionIndex.set(-1);
    }
  }

  /**
   * Tries to set the arrival runway transition index subject, or sets it to -1;
   */
  private trySetArrivalRunwayTransitionIndex(): void {
    const procedure = this.selectedArrival.get()?.procedure as ArrivalProcedure;
    const approach = this.selectedApproach.get()?.procedure as ApproachProcedure;
    if (procedure !== undefined && approach !== undefined) {
      const index = procedure.runwayTransitions.findIndex(trans =>
        trans.runwayNumber === approach.runwayNumber && trans.runwayDesignation === approach.runwayDesignator
      );
      this.selectedArrivalRunwayTransitionIndex.set(index);
    } else {
      this.selectedArrivalRunwayTransitionIndex.set(-1);
    }
  }

  /**
   * Gets the procedure from an index
   * @param procedures is the list of procedures
   * @param index the procedure index to match
   * @returns a procedure list item, or undefined
   */
  private getProcedureFromIndex(procedures: readonly ProcedureListItem[], index: number): ProcedureListItem | undefined {
    return procedures.find(val => val.index === index);
  }

  /**
   * Gets the transition from an index
   * @param transitions is the list of transitions
   * @param index the transition index to match
   * @returns a transition list item or undefined
   */
  private getTransitionFromIndex(transitions: readonly TransitionListItem[], index: number): TransitionListItem | undefined {
    return transitions.find(val => val.transitionIndex === index);
  }

  /**
   * Loads the current flight plan procedure data into the store.
   * @param fms The Fms
   * @param view The Current Dep/Arr View
   */
  public loadCurrentProcedureData(fms: WT21Fms, view: DepArrView): void {
    const plan = fms.getPlanForFmcRender();
    const procedureDetails = plan.procedureDetails;
    if (view === DepArrView.DEP) {
      this.selectedDeparture.set(this.getProcedureFromIndex(this.departures.getArray(), procedureDetails.departureIndex));

      this.selectedDepartureTransition.set(this.departureTransitions.tryGet(procedureDetails.departureTransitionIndex));
      this.selectedDepartureRunwayTransitionIndex.set(procedureDetails.departureRunwayIndex);
      this.selectedDepartureRunway.set(procedureDetails.originRunway);
    } else if (view === DepArrView.ARR) {
      this.selectedArrival.set(this.getProcedureFromIndex(this.arrivals.getArray(), procedureDetails.arrivalIndex));

      this.selectedArrivalTransition.set(this.arrivalTransitions.tryGet(procedureDetails.arrivalTransitionIndex));
      this.selectedArrivalRunwayTransitionIndex.set(procedureDetails.arrivalRunwayTransitionIndex);
      if (procedureDetails.approachIndex >= 0) {
        this.selectedApproach.set(this.getProcedureFromIndex(this.approaches.getArray(), procedureDetails.approachIndex));

        this.selectedApproachTransition.set(this.getTransitionFromIndex(this.approachTransitions.getArray(), procedureDetails.approachTransitionIndex));

      } else if (plan.getUserData('visual_approach') !== undefined) {
        const visualDesignation = plan.getUserData('visual_approach');
        const approaches = this._approaches.getArray();
        approaches.forEach(vis => {
          if (vis.isVisualApproach) {
            const proc = vis.procedure as ApproachProcedure;
            if (proc.runway === visualDesignation) {
              this.selectedApproach.set(vis);
              this.selectedApproachTransition.set(undefined);
            }
          }
        });
      } else {
        this.selectedApproach.set(undefined);
        this.selectedApproachTransition.set(undefined);
      }
    }
  }

  /**
   * Resets the Store Values
   */
  private resetStore(): void {
    this.selectedApproach.set(undefined);
    this.selectedApproachTransition.set(undefined);

    this.selectedArrival.set(undefined);
    this.selectedArrivalTransition.set(undefined);

    this.selectedDeparture.set(undefined);
    this.selectedDepartureRunway.set(undefined);
    this.selectedDepartureTransition.set(undefined);
  }
}

/**
 * A procedure paired with its index in the facility info.
 */
export type ProcedureListItem = {
  /** The approach procedure. */
  procedure: ApproachProcedure | ArrivalProcedure | DepartureProcedure;
  /** The index in the facility info the procedure. */
  index: number;
  /** If the procedure is an approach and it is a visual approach. */
  isVisualApproach: boolean;
}

/** Sorts an array of runways by their designations.
 * @param runways The runways to sort, will be sorted in place.
 * @returns A reference to the array that was passed in. */
function sortRunways(runways: OneWayRunway[]): OneWayRunway[] {
  return runways.sort(compareRunways);
}

/** Compares two runways using their designations.
 * @param a First runway.
 * @param b Second runway.
 * @returns A number saying which one should be sorted before or after the other. */
function compareRunways(a: OneWayRunway, b: OneWayRunway): number {
  if (a.designation < b.designation) {
    return -1;
  }
  if (a.designation > b.designation) {
    return 1;
  }
  return 0;
}

/** Sorts an array of approaches by their procedure name.
 * @param approaches The approaches to sort, will be sorted in place.
 * @returns A reference to the array that was passed in. */
function sortApproaches(approaches: ProcedureListItem[]): ProcedureListItem[] {
  return approaches.sort(compareApproaches);
}

/** Compares two approaches using their procedure name.
 * @param a First approach.
 * @param b Second approach.
 * @returns A number saying which one should be sorted before or after the other. */
function compareApproaches(a: ProcedureListItem, b: ProcedureListItem): number {
  // Add the 0 before the runway number if needed.
  const nameA = a.procedure.name.replace(/ (\d[\D ]*)$/, ' 0$1');
  const nameB = b.procedure.name.replace(/ (\d[\D ]*)$/, ' 0$1');

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}
