import {
  AirportFacility, ArrivalProcedure, FacilitySearchType, FacilityType, FlightPathAirplaneSpeedMode, FlightPathCalculator,
  FSComponent, GeoPoint, ICAO, IntersectionFacility, MapSystemKeys, RunwayUtils, Subject, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, DirectToState, MapFlightPlanFocusCalculator, ProcedureType } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSMapBuilder } from '../Map/GNSMapBuilder';
import { GNSMapController } from '../Map/GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from '../Map/GNSMapSystem';
import { ViewService } from '../Pages';
import { LoadActivateButton } from './LoadActivateButton';
import { ProcArrivalPageMenu } from './ProcArrivalPageMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointPageSelector } from './WaypointPageSelector';

import './ProcArrivalPage.css';

/**
 * Props on the ProcArrivalPage page.
 */
interface ProcArrivalPageProps extends WaypointPageProps {
  /** The airport that is currently selected on the waypoint pages. */
  selectedAirport: Subject<AirportFacility | undefined>;

  /** The settings provider to get GNS settings from. */
  settingsProvider: GNSSettingsProvider;
}

/** A type describing the arc map controllers. */
type GNSStandardMapControllers = GNSMapControllers & {

  /** The root map controller instance. */
  [GNSMapKeys.Controller]: GNSMapController;
}

/**
 * The Arrival proc page.
 */
export class ProcArrivalPage extends WaypointPage<ProcArrivalPageProps> {
  private readonly previewMap = GNSMapBuilder
    .withProcedurePreviewMap(this.props.bus, this.props.settingsProvider, this.props.gnsType, this.props.instrumentIndex)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms.flightPlanner))
    .build<GNSMapModules, GNSMapLayers, GNSStandardMapControllers, GNSMapContextProps>('waypoint-page-map');

  private readonly planModule = this.previewMap.context.model.getModule(MapSystemKeys.FlightPlan);
  private readonly rangeModule = this.previewMap.context.model.getModule(GNSMapKeys.Range);
  private readonly flightPathCalculator = new FlightPathCalculator(this.props.fms.facLoader, {
    defaultClimbRate: 1000,
    defaultSpeed: 120,
    bankAngle: 20,
    holdBankAngle: null,
    courseReversalBankAngle: null,
    turnAnticipationBankAngle: null,
    maxBankAngle: 20,
    airplaneSpeedMode: FlightPathAirplaneSpeedMode.GroundSpeed
  }, this.props.bus);

  private readonly noProcedureSelected = Subject.create<boolean>(true);

  protected readonly menu = new ProcArrivalPageMenu(this.props.bus, this.props.fms, this.noProcedureSelected, (facility: string | undefined): void => {
    facility && this.waypointSelection.instance.setIdent(ICAO.getIdent(facility));
  }, (): Promise<void> => {
    return this.insertArrival();
  });

  private readonly arrival = FSComponent.createRef<WaypointPageSelector>();
  private readonly transitions = FSComponent.createRef<WaypointPageSelector>();
  private readonly runways = FSComponent.createRef<WaypointPageSelector>();
  private readonly loadActivate = FSComponent.createRef<LoadActivateButton>();

  private settingExistingData = false;
  private openedFromProcPage = false;

  private readonly selectedFacility = this.props.selectedAirport.sub(this.onAirportSelected.bind(this)).pause();

  private selectedArrival?: number;
  private selectedTransition?: number;
  private selectedRunway?: number;

  private previewOpId = 0;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.onSuspend();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    this.previewMap.ref.instance.sleep();
    this.selectedFacility.pause();
    this.arrival.instance.closePopout();
    this.runways.instance.closePopout();
    this.transitions.instance.closePopout();

    this.openedFromProcPage = false;
    this.setLoadOrActivateState();

    super.onSuspend();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();
    this.selectedFacility.resume();
    this.previewMap.ref.instance.wake();
    const airport = this.props.selectedAirport.get();
    if (airport) {
      this.onAirportSelected(airport);
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RangeIncrease) {
      this.previewMap.context.getController(GNSMapKeys.Controller).increaseRange();
      return true;
    } else if (evt === InteractionEvent.RangeDecrease) {
      this.previewMap.context.getController(GNSMapKeys.Controller).decreaseRange();
      return true;
    }

    let handled = false;
    if (this.root.instance.isFocused) {
      handled = this.root.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Method called when this page is opened from the PROC page,
   * indicating that the LOAD/ACTIVATE interface should be available.
   */
  public openFromProcMenu(): void {
    this.openedFromProcPage = true;
    this.setExistingProcedureData().then(() => {
      if (this.arrival.instance.listLength > 0) {
        this.arrival.instance.openPopout();
      }
    });
    this.setLoadOrActivateState();
  }

  /**
   * Displays the current arrival data on the page.
   */
  private async setExistingProcedureData(): Promise<void> {
    let facility;
    this.settingExistingData = true;
    if (this.props.fms.getDirectToState() !== DirectToState.NONE && this.props.fms.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.props.fms.flightPlanner.getActiveFlightPlan();
      const activeLeg = plan.tryGetLeg(plan.activeLateralLeg);
      if (activeLeg !== null && ICAO.getFacilityType(activeLeg.leg.fixIcao) === FacilityType.Airport) {
        facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, activeLeg.leg.fixIcao);
        this.props.selectedAirport.set(facility);
      }
      this.updatePreviewMap();
      this.setLoadOrActivateState();

    } else if (this.props.fms.hasPrimaryFlightPlan()) {
      const plan = this.props.fms.getPrimaryFlightPlan();

      //Check if a procedure is already loaded
      if (plan.procedureDetails.arrivalIndex > -1 && plan.procedureDetails.arrivalFacilityIcao) {

        if (plan.procedureDetails.arrivalFacilityIcao !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the arrivalFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.arrivalFacilityIcao);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }

        const arrival = facility?.arrivals[plan.procedureDetails.arrivalIndex];
        this.arrival.instance.setSelectedItem(plan.procedureDetails.arrivalIndex);

        if (arrival !== undefined) {
          this.selectedArrival = plan.procedureDetails.departureIndex;
          const transitions = arrival.enRouteTransitions;
          const runwayTransitions = arrival.runwayTransitions;

          if (transitions.length > 0) {
            this.transitions.instance.setItems(arrival.enRouteTransitions.map(item => item.name));

            if (plan.procedureDetails.arrivalTransitionIndex >= 0) {
              this.selectedTransition = plan.procedureDetails.arrivalTransitionIndex;
              this.transitions.instance.setSelectedItem(this.selectedTransition, false);
            } else {
              this.transitions.instance.setSelectedItem(0, false);
              this.selectedTransition = undefined;
            }
          } else {
            this.transitions.instance.setItems([]);
            this.selectedTransition = undefined;
          }

          if (runwayTransitions.length > 0) {
            this.runways.instance.setItems(arrival.runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));

            if (plan.procedureDetails.arrivalRunwayTransitionIndex >= 0) {
              this.selectedRunway = plan.procedureDetails.arrivalRunwayTransitionIndex;
              this.runways.instance.setSelectedItem(this.selectedRunway, false);
            } else {
              this.runways.instance.setSelectedItem(0, false);
              this.selectedRunway = undefined;
            }
          } else {
            this.runways.instance.setItems([]);
            this.selectedRunway = undefined;
          }
        }

      } else if (plan.destinationAirport) {

        //Check if there is an origin airport specified.
        if (plan.originAirport !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the departureFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }
        this.selectedArrival = undefined;
        this.selectedTransition = undefined;
        this.selectedRunway = undefined;
      }

      this.updatePreviewMap();
      this.setLoadOrActivateState();
    }
    this.settingExistingData = false;
  }

  /**
   * Sets the state of the load or activate buttons.
   */
  private setLoadOrActivateState(): void {
    if (this.openedFromProcPage && this.canProcedureLoad()) {
      this.loadActivate.instance.setDisabled(false);
      this.loadActivate.instance.setState('load');
    } else {
      this.loadActivate.instance.setDisabled(true);
    }
  }

  /**
   * Checks whether the procedure can load.
   * @returns whether the procedure can load.
   */
  private canProcedureLoad(): boolean {
    if (this.openedFromProcPage) {
      const airport = this.props.selectedAirport.get();
      if (airport !== undefined && airport.arrivals.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const airport = e.facility as (AirportFacility | undefined);
    this.props.selectedAirport.set(airport);
  }

  /**
   * Handles when a new airport is selected in the page group.
   * @param airport The airport that was selected.
   */
  private onAirportSelected(airport: AirportFacility | undefined): void {
    this.noProcedureSelected.set(airport === undefined || airport.arrivals.length < 1);

    if (airport !== undefined) {
      this.waypointSelection.instance.setFacility(airport, false);

      this.selectedArrival = undefined;
      this.selectedTransition = undefined;
      this.selectedRunway = undefined;

      if (airport.arrivals.length > 0) {
        this.arrival.instance.setItems(airport.arrivals.map(arrival => this.buildArrivalName(arrival)));
        this.arrival.instance.setSelectedItem(0, false);

        const transitions = airport.arrivals[0].enRouteTransitions;
        const runwayTransitions = airport.arrivals[0].runwayTransitions;

        if (transitions.length > 0) {
          this.transitions.instance.setItems(airport.arrivals[0].enRouteTransitions.map(item => item.name));
          this.transitions.instance.setSelectedItem(0, false);
        } else {
          this.transitions.instance.setItems([]);
        }

        if (runwayTransitions.length > 0) {
          this.runways.instance.setItems(airport.arrivals[0].runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));
          this.runways.instance.setSelectedItem(0, false);
        } else {
          this.runways.instance.setItems([]);
        }

        this.previewMap.context.getController(GNSMapKeys.Controller).unfocusAirport();
        this.updatePreviewMap();
      } else {
        this.arrival.instance.setItems([]);
        this.transitions.instance.setItems([]);
        this.runways.instance.setItems([]);

        this.previewMap.context.getController(GNSMapKeys.Controller).focusAirport(new AirportWaypoint(airport, this.props.bus), -1);
      }
    }

    this.setLoadOrActivateState();
  }

  /**
   * Handles when an Arrival has been selected for an airport.
   * @param index The index of the Arrival.
   */
  private onArrivalSelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && !this.settingExistingData) {
      const arrival = airport.arrivals[index];

      if (arrival !== undefined && this.selectedArrival !== index) {
        this.selectedArrival = index;

        const transitions = arrival.enRouteTransitions;
        const runwayTransitions = arrival.runwayTransitions;

        if (transitions.length > 0) {
          this.transitions.instance.setItems(arrival.enRouteTransitions.map(item => item.name));
          this.transitions.instance.setSelectedItem(0, false);
        } else {
          this.transitions.instance.setItems([]);
          this.selectedTransition = undefined;
        }

        if (runwayTransitions.length > 0) {
          this.runways.instance.setItems(arrival.runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));
          this.runways.instance.setSelectedItem(0, false);
        } else {
          this.runways.instance.setItems([]);
          this.selectedRunway = undefined;
        }

      }
      this.scrollToNext();
      this.updatePreviewMap();
    }
  }

  /**
   * Handles when a transition has been selected for an airport.
   * @param index The index of the transition.
   */
  private onTransitionSelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && this.selectedArrival !== undefined && !this.settingExistingData) {
      const arrival = airport.arrivals[this.selectedArrival];

      if (arrival !== undefined) {
        const transition = arrival.enRouteTransitions[index];
        if (transition !== undefined) {
          this.selectedTransition = index;
        } else {
          this.selectedTransition = undefined;
        }
        this.scrollToNext();
      }

      this.updatePreviewMap();
    }
  }

  /**
   * Handles when the runway selection has changed.
   * @param index The index of the runway transition.
   */
  private onRunwaySelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && this.selectedArrival !== undefined && !this.settingExistingData) {
      const arrival = airport.arrivals[this.selectedArrival];

      if (arrival !== undefined) {
        const runwayTransition = arrival.runwayTransitions[index];
        if (runwayTransition !== undefined) {
          this.selectedRunway = index;
        } else {
          this.selectedRunway = undefined;
        }
        this.scrollToNext();
      }

      this.updatePreviewMap();
    }
  }

  /**
   * Activate the next selection.
   */
  private scrollToNext(): void {
    if (this.arrival.instance.isFocused) {
      if (this.transitions.instance.listLength > 0) {
        this.transitions.instance.openPopout();
      } else if (this.runways.instance.listLength > 0) {
        this.root.instance.scroll('forward');
        this.runways.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    } else if (this.transitions.instance.isFocused) {
      if (this.runways.instance.listLength > 0) {
        this.runways.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    } else if (this.runways.instance.isFocused) {
      this.root.instance.scroll('forward');
    }
  }


  /**
   * Handles when waypoint input is finalized.
   */
  private onWaypointFinalized(): void {
    this.waypointSelection.instance.focusSelf();

    const airport = this.props.selectedAirport.get();
    if (airport !== undefined) {
      if (airport.arrivals.length > 0) {
        this.arrival.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    }
  }

  /**
   * Builds a text based arrival name for selection display.
   * @param arrival The arrival to build the name for.
   * @returns The arrival name.
   */
  private buildArrivalName(arrival: ArrivalProcedure): string {
    return arrival.name;
  }

  /**
   * Inserts the arrival into the flight plan.
   */
  private async insertArrival(): Promise<void> {
    const airport = this.props.selectedAirport.get();

    if (airport !== undefined && this.selectedArrival !== undefined) {
      this.props.fms.insertArrival(airport, this.selectedArrival, this.selectedRunway ?? -1, this.selectedTransition ?? -1);

      ViewService.back();
      ViewService.open('FPL', false, 0);
    }
  }

  /**
   * Builds the page's procedure preview plan.
   */
  private async updatePreviewMap(): Promise<void> {
    this.previewOpId++;
    const currentOpId = this.previewOpId;

    const airport = this.props.selectedAirport.get();
    const arrivalIndex = this.selectedArrival ?? 0;
    const transitionIndex = this.selectedTransition ?? 0;
    const runwayIndex = this.selectedRunway ?? 0;

    if (airport !== undefined && airport.approaches.length > 0 && arrivalIndex !== undefined && transitionIndex !== undefined) {
      const procTask = this.props.fms.buildProcedurePreviewPlan(this.flightPathCalculator, airport, ProcedureType.ARRIVAL, arrivalIndex, transitionIndex, undefined, runwayIndex);
      const transTask = this.props.fms.buildProcedureTransitionPreviewPlan(this.flightPathCalculator, airport, ProcedureType.ARRIVAL, arrivalIndex, transitionIndex, runwayIndex);

      const previewPlans = await Promise.all([procTask, transTask]);
      if (currentOpId === this.previewOpId) {
        previewPlans[1].planIndex = 1;

        this.planModule.getPlanSubjects(0).flightPlan.set(previewPlans[0]);
        this.planModule.getPlanSubjects(1).flightPlan.set(previewPlans[1]);

        const focusCalc = new MapFlightPlanFocusCalculator(this.previewMap.context.projection);
        const result = { range: 0, target: new GeoPoint(0, 0) };

        focusCalc.calculateRangeTarget([...previewPlans[0].legs()], new Float64Array([6, 6, 6, 6]), new GeoPoint(0, 0), result);
        const ranges = this.rangeModule.nominalRanges.get();
        for (let i = 0; i < ranges.length; i++) {
          const nominalRange = ranges[i].asUnit(UnitType.GA_RADIAN);
          if (nominalRange >= result.range) {
            this.rangeModule.setNominalRangeIndex(i);
            break;
          }
        }

        this.previewMap.context.projection.set({ target: result.target });
      }
    }
  }

  /** @inheritDoc */
  protected onDirectPressed(): boolean {
    const facility = this.props.selectedAirport.get();
    if (facility !== undefined) {
      ViewService.directToDialogWithIcao(facility.icao);
      return true;
    } else {
      return false;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page waypoint-page' ref={this.el}>
        <GNSUiControl ref={this.root} isolateScroll>
          <WaypointPageIdentInput
            selectedFacility={this.props.selectedAirport as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={4}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'APT'}
            ref={this.waypointSelection}
            gnsType={this.props.gnsType}
            filter={FacilitySearchType.Airport}
          />
          <div class='waypoint-page-body'>
            {this.previewMap.map}
            <div class='waypoint-arrival-page-selectors'>
              <WaypointPageSelector class='arrival' label='ARRIVAL' onSelected={this.onArrivalSelected.bind(this)} ref={this.arrival} />
              <WaypointPageSelector class='arrival-transition' label='TRANS' onSelected={this.onTransitionSelected.bind(this)} ref={this.transitions} />
              <WaypointPageSelector class='arrival-runway' label='RUNWAY' onSelected={this.onRunwaySelected.bind(this)} ref={this.runways} />
              <LoadActivateButton
                class='load-or-activate-button-arrival'
                ref={this.loadActivate}
                showActivate={this.props.gnsType === 'wt530'}
                gnsType={this.props.gnsType}
                onLoad={this.insertArrival.bind(this, false)}
                onActivate={this.insertArrival.bind(this, true)} />
            </div>
          </div>
        </GNSUiControl>
      </div>
    );
  }
}
