import {
  AirportFacility, DepartureProcedure, FacilitySearchType, FacilityType, FlightPathAirplaneSpeedMode, FlightPathCalculator, FSComponent, GeoPoint, ICAO,
  IntersectionFacility, MapSystemKeys, OneWayRunway, RunwayUtils, Subject, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, MapFlightPlanFocusCalculator, ProcedureType } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSMapBuilder } from '../Map/GNSMapBuilder';
import { GNSMapController } from '../Map/GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from '../Map/GNSMapSystem';
import { ViewService } from '../Pages';
import { LoadActivateButton } from './LoadActivateButton';
import { ProcDepartureMenu } from './ProcDeparturePageMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointPageSelector } from './WaypointPageSelector';

import './ProcDeparturePage.css';

/**
 * Props on the ProcDeaparturePage page.
 */
interface ProcDeparturePageProps extends WaypointPageProps {
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
 * The Proc departure props page
 */
export class ProcDeparturePage extends WaypointPage<ProcDeparturePageProps> {
  private readonly previewMap = GNSMapBuilder
    .withProcedurePreviewMap(this.props.bus, this.props.settingsProvider, this.props.gnsType, this.props.instrumentIndex)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms))
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

  protected readonly menu = new ProcDepartureMenu(this.props.bus, this.props.fms, this.noProcedureSelected, (facility: string | undefined): void => {
    facility && this.waypointSelection.instance.setIdent(ICAO.getIdent(facility));
  }, (): Promise<void> => {
    return this.insertDeparture();
  });

  private readonly departure = FSComponent.createRef<WaypointPageSelector>();
  private readonly transitions = FSComponent.createRef<WaypointPageSelector>();
  private readonly runways = FSComponent.createRef<WaypointPageSelector>();
  private readonly loadActivate = FSComponent.createRef<LoadActivateButton>();

  private settingExistingData = false;
  private openedFromProcPage = false;

  private readonly selectedFacility = this.props.selectedAirport.sub(this.onAirportSelected.bind(this)).pause();

  private selectedDeparture?: number;
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
    this.departure.instance.closePopout();
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
      if (this.departure.instance.listLength > 0) {
        this.departure.instance.openPopout();
      }
    });
    this.setLoadOrActivateState();
  }

  /**
   * Displays the current departure data on the page.
   */
  private async setExistingProcedureData(): Promise<void> {
    this.settingExistingData = true;

    if (this.props.fms.hasPrimaryFlightPlan()) {
      const plan = this.props.fms.getPrimaryFlightPlan();

      //Check if a procedure is already loaded
      if (plan.procedureDetails.departureIndex > -1 && plan.procedureDetails.departureFacilityIcao) {

        let facility;

        if (plan.procedureDetails.departureFacilityIcao !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the departureFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.departureFacilityIcao);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }

        const departure = facility?.departures[plan.procedureDetails.departureIndex];
        this.departure.instance.setSelectedItem(plan.procedureDetails.departureIndex);

        if (departure !== undefined) {
          this.selectedDeparture = plan.procedureDetails.departureIndex;
          const transitions = departure.enRouteTransitions;
          const runwayTransitions = departure.runwayTransitions;

          if (transitions.length > 0) {
            this.transitions.instance.setItems(departure.enRouteTransitions.map(item => item.name));

            if (plan.procedureDetails.departureTransitionIndex >= 0) {
              this.selectedTransition = plan.procedureDetails.departureTransitionIndex;
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
            this.runways.instance.setItems(departure.runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));

            if (plan.procedureDetails.departureRunwayIndex >= 0) {
              this.selectedRunway = plan.procedureDetails.departureRunwayIndex;
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

      } else if (plan.originAirport) {
        //Check if there is an origin airport specified.

        let facility;

        if (plan.originAirport !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the departureFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.originAirport);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }
        this.selectedDeparture = undefined;
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
      if (airport !== undefined && airport.departures.length > 0) {
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
    this.noProcedureSelected.set(airport === undefined || airport.departures.length < 1);

    if (airport !== undefined) {
      this.waypointSelection.instance.setFacility(airport, false);

      this.selectedDeparture = undefined;
      this.selectedTransition = undefined;
      this.selectedRunway = undefined;

      if (airport.departures.length > 0) {
        this.departure.instance.setItems(airport.departures.map(departure => this.buildDepartureName(departure)));
        this.departure.instance.setSelectedItem(0, false);

        const transitions = airport.departures[0].enRouteTransitions;
        const runwayTransitions = airport.departures[0].runwayTransitions;

        if (transitions.length > 0) {
          this.transitions.instance.setItems(transitions.map(item => item.name));
          this.transitions.instance.setSelectedItem(0, false);
        } else {
          this.transitions.instance.setItems([]);
        }

        if (runwayTransitions.length > 0) {
          this.runways.instance.setItems(runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));
          this.runways.instance.setSelectedItem(0, false);
        } else {
          this.runways.instance.setItems([]);
        }

        this.previewMap.context.getController(GNSMapKeys.Controller).unfocusAirport();
        this.updatePreviewMap();
      } else {
        this.departure.instance.setItems([]);
        this.transitions.instance.setItems([]);
        this.runways.instance.setItems([]);

        this.previewMap.context.getController(GNSMapKeys.Controller).focusAirport(new AirportWaypoint(airport, this.props.bus), -1);
      }
    }

    this.setLoadOrActivateState();
  }

  /**
   * Handles when an deaparture has been selected for an airport.
   * @param index The index of the deaparture.
   */
  private onDepartureSelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && !this.settingExistingData) {
      const departure = airport.departures[index];

      if (departure !== undefined && this.selectedDeparture !== index) {
        this.selectedDeparture = index;

        const transitions = departure.enRouteTransitions;
        const runwayTransitions = departure.runwayTransitions;

        if (runwayTransitions.length > 0) {
          this.runways.instance.setItems(departure.runwayTransitions.map(item => RunwayUtils.getRunwayNameString(item.runwayNumber, item.runwayDesignation, true, 'RW')));
          this.runways.instance.setSelectedItem(0, false);
        } else {
          this.runways.instance.setItems([]);
          this.selectedRunway = undefined;
        }

        if (transitions.length > 0) {
          this.transitions.instance.setItems(departure.enRouteTransitions.map(item => item.name));
          this.transitions.instance.setSelectedItem(0, false);
        } else {
          this.transitions.instance.setItems([]);
          this.selectedTransition = undefined;
        }

      }
      this.scrollToNext();
      this.updatePreviewMap();
    }
  }

  /**
   * Handles when a runway has been selected for an airport.
   * @param index The index of the runway.
   */
  private onRunwaySelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && this.selectedDeparture !== undefined && !this.settingExistingData) {
      const departure = airport.departures[this.selectedDeparture];

      if (departure !== undefined) {
        const runwayTransition = departure.runwayTransitions[index];
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
   * Handles when a transition has been selected for an airport.
   * @param index The index of the transition.
   */
  private onTransitionSelected(index: number): void {
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && this.selectedDeparture !== undefined && !this.settingExistingData) {
      const departure = airport.departures[this.selectedDeparture];

      if (departure !== undefined) {
        const transition = departure.enRouteTransitions[index];
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
   * Activate the next selection.
   */
  private scrollToNext(): void {
    if (this.departure.instance.isFocused) {
      if (this.runways.instance.listLength > 0) {
        this.runways.instance.openPopout();
      } else if (this.transitions.instance.listLength > 0) {
        this.root.instance.scroll('forward');
        this.transitions.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    } else if (this.runways.instance.isFocused) {
      if (this.transitions.instance.listLength > 0) {
        this.transitions.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    } else if (this.transitions.instance.isFocused) {
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
      if (airport.departures.length > 0) {
        this.departure.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    }
  }

  /**
   * Builds a text based departure name for selection display.
   * @param departure The departure to build the name for.
   * @returns The departure name.
   */
  private buildDepartureName(departure: DepartureProcedure): string {
    return departure.name;
  }

  /**
   * Inserts the deaparture into the flight plan.
   */
  private async insertDeparture(): Promise<void> {
    const airport = this.props.selectedAirport.get();

    if (airport !== undefined && this.selectedDeparture !== undefined) {
      let oneWayRunway: OneWayRunway | undefined = undefined;
      if (this.selectedRunway !== undefined) {
        const departure = airport.departures[this.selectedDeparture];
        if (departure !== undefined) {
          const runwayTransition = departure.runwayTransitions[this.selectedRunway];

          if (runwayTransition !== undefined) {
            oneWayRunway = RunwayUtils.matchOneWayRunway(airport, runwayTransition.runwayNumber, runwayTransition.runwayDesignation);
          }
        }

      }

      this.props.fms.insertDeparture(airport, this.selectedDeparture, this.selectedRunway ?? -1, this.selectedTransition ?? -1, oneWayRunway);

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
    const departureIndex = this.selectedDeparture ?? 0;
    const transitionIndex = this.selectedTransition ?? 0;
    const runwayIndex = this.selectedRunway ?? 0;

    if (airport !== undefined && airport.approaches.length > 0 && departureIndex !== undefined && transitionIndex !== undefined) {
      const procTask = this.props.fms.buildProcedurePreviewPlan(this.flightPathCalculator, airport, ProcedureType.DEPARTURE,
        departureIndex, transitionIndex, undefined, runwayIndex);
      const transTask = this.props.fms.buildProcedureTransitionPreviewPlan(this.flightPathCalculator, airport, ProcedureType.DEPARTURE,
        departureIndex, transitionIndex, runwayIndex);

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
            <div class='waypoint-departure-page-selectors'>
              <WaypointPageSelector class='departure' label='DEP' onSelected={this.onDepartureSelected.bind(this)} ref={this.departure} />
              <WaypointPageSelector class='departure-runway' label='RUNWAY' onSelected={this.onRunwaySelected.bind(this)} ref={this.runways} />
              <WaypointPageSelector class='departure-transition' label='TRANS' onSelected={this.onTransitionSelected.bind(this)} ref={this.transitions} />
              <LoadActivateButton
                class={'load-or-activate-button-departure'}
                ref={this.loadActivate}
                showActivate={this.props.gnsType === 'wt530'}
                gnsType={this.props.gnsType}
                onLoad={this.insertDeparture.bind(this)}
                onActivate={this.insertDeparture.bind(this)} />
            </div>
          </div>
        </GNSUiControl>
      </div>
    );
  }
}
