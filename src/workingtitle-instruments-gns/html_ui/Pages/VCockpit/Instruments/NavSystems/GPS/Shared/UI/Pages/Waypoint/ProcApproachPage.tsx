import {
  AirportFacility, ApproachProcedure, FacilitySearchType, FacilityType, FlightPathAirplaneSpeedMode, FlightPathCalculator, FSComponent, GeoPoint,
  ICAO, IntersectionFacility, MapSystemKeys, Subject, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, DirectToState, FmsUtils, MapFlightPlanFocusCalculator, ProcedureType } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSMapBuilder } from '../Map/GNSMapBuilder';
import { GNSMapController } from '../Map/GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from '../Map/GNSMapSystem';
import { ViewService } from '../Pages';
import { LoadActivateButton } from './LoadActivateButton';
import { ProcApproachPageMenu } from './ProcApproachPageMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointPageSelector } from './WaypointPageSelector';
import { GnsApproachMap, GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';

import './ProcApproachPage.css';

/**
 * Props on the ProcApproachPage page.
 */
interface ProcApproachPageProps extends WaypointPageProps {
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
 * The approach proc page.
 */
export class ProcApproachPage extends WaypointPage<ProcApproachPageProps> {
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

  protected readonly menu = new ProcApproachPageMenu(this.props.bus, this.props.fms, this.noProcedureSelected, (facility: string | undefined): void => {
    facility && this.waypointSelection.instance.setIdent(ICAO.getIdent(facility));
  }, (activate: boolean): Promise<void> => {
    return this.insertApproach(activate);
  });

  private readonly approaches = FSComponent.createRef<WaypointPageSelector>();
  private readonly transitions = FSComponent.createRef<WaypointPageSelector>();
  private readonly loadActivate = FSComponent.createRef<LoadActivateButton>();

  private settingExistingData = false;
  private openedFromProcPage = false;

  private readonly selectedFacility = this.props.selectedAirport.sub(this.onAirportSelected.bind(this)).pause();

  private gnsValidApproaches: GnsApproachMap[] = [];
  private selectedApproach?: number;
  private selectedTransition?: number;

  private previewOpId = 0;

  private readonly selectedFlag = Subject.create<string>('');
  private readonly selectedFlagRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.noProcedureSelected.sub(v => {
      if (v) {
        this.gnsValidApproaches.length = 0;
      }
    });

    this.onSuspend();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    this.previewMap.ref.instance.sleep();
    this.selectedFacility.pause();
    this.approaches.instance.closePopout();
    this.transitions.instance.closePopout();

    this.openedFromProcPage = false;
    this.setLoadOrActivateState();

    super.onSuspend();
  }

  /** @inheritdoc */
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
      if (this.approaches.instance.listLength > 0) {
        this.approaches.instance.openPopout();
      }
    });
    this.setLoadOrActivateState();
  }

  /**
   * Sets the Approach List Items, or clears the list if no valid facility or no valid appraoches.
   * @param airport The Airport Facility if any.
   * @returns whether approach items were set.
   */
  private setApproachItems(airport?: AirportFacility): boolean {
    this.gnsValidApproaches.length = 0;

    if (airport) {

      if (airport.approaches.length > 0) {
        this.gnsValidApproaches = GnsFmsUtils.getValidApproaches(airport);
      }

      if (this.gnsValidApproaches.length > 0) {
        this.approaches.instance.setItems(this.gnsValidApproaches.map(approach => this.buildApproachName(approach.approachProcedure)));
        this.approaches.instance.setSelectedItem(0, false);
        return true;
      }
    }

    this.approaches.instance.setItems([]);
    return false;
  }

  /**
   * Displays the current approach data on the page.
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
      if (plan.procedureDetails.approachIndex > -1 && plan.procedureDetails.approachFacilityIcao) {

        if (plan.procedureDetails.approachFacilityIcao !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the approachFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.approachFacilityIcao);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }

        this.setApproachItems(facility);

        if (!facility) {
          return;
        }

        this.selectedApproach = plan.procedureDetails.approachIndex;
        this.selectedTransition = plan.procedureDetails.approachTransitionIndex;

        const selectedApproachListIndex = this.gnsValidApproaches.findIndex(map => map.index === this.selectedApproach);

        this.approaches.instance.setSelectedItem(selectedApproachListIndex, false);
        this.transitions.instance.setItems(['VECTORS', ...facility.approaches[plan.procedureDetails.approachIndex].transitions.map(t => t.name)]);
        this.transitions.instance.setSelectedItem(plan.procedureDetails.approachTransitionIndex + 1, false);

        this.approaches.instance.openPopout(plan.procedureDetails.approachIndex);
      } else if (plan.destinationAirport) {
        //Check if there is a destination airport specified.

        if (plan.destinationAirport !== this.props.selectedAirport.get()?.icao) {
          // Only bother with the facLoader and the async method if the selectedAirport is NOT already the approachFacility
          facility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
          this.props.selectedAirport.set(facility);
        } else {
          facility = this.props.selectedAirport.get();
          this.onAirportSelected(facility);
        }

        this.selectedApproach = undefined;
        this.selectedTransition = undefined;
      }

      this.updatePreviewMap();
      this.setLoadOrActivateState();
    }
    this.settingExistingData = false;
  }

  /**
   * Sets the state of the load or activate buttons.
   * 'load' | 'loadAndActivate' | 'activate'
   */
  private setLoadOrActivateState(): void {


    if (this.openedFromProcPage && this.checkIfApproachesExist()) {

      const canLoad = this.props.fms.canApproachLoad();
      const canActivate = true;
      if (canActivate || canLoad) {

        this.loadActivate.instance.setDisabled(false);
        this.loadActivate.instance.setState(
          canActivate && canLoad ? 'loadAndActivate' :
            'activate'
        );
      } else {
        this.loadActivate.instance.setDisabled(true);
      }
    } else {
      this.loadActivate.instance.setDisabled(true);
    }
  }

  /**
   * Checks whether the selected facility has at least one approach.
   * @returns Whether the selected facility has at least one approach.
   */
  private checkIfApproachesExist(): boolean {
    if (this.openedFromProcPage) {
      const airport = this.props.selectedAirport.get();
      if (airport !== undefined && airport.approaches.length > 0 && this.gnsValidApproaches.length > 0) {
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
    this.noProcedureSelected.set(airport === undefined || airport.approaches.length < 1);

    if (airport !== undefined) {
      this.waypointSelection.instance.setFacility(airport, false);

      this.selectedApproach = undefined;
      this.selectedTransition = undefined;

      if (this.setApproachItems(airport)) {
        const transitions = this.gnsValidApproaches[0].approachProcedure.transitions;
        if (transitions.length > 0) {
          this.transitions.instance.setItems(['VECTORS', ...transitions.map(trans => trans.name)]);
          this.transitions.instance.setSelectedItem(0, false);
        } else {
          this.transitions.instance.setItems([]);
        }

        this.previewMap.context.getController(GNSMapKeys.Controller).unfocusAirport();
        this.updatePreviewMap();

      } else {
        this.setApproachItems();
        this.transitions.instance.setItems([]);
        this.previewMap.context.getController(GNSMapKeys.Controller).focusAirport(new AirportWaypoint(airport, this.props.bus), -1);
      }


    } else {
      this.setApproachItems();
      this.transitions.instance.setItems([]);
      this.previewMap.context.getController(GNSMapKeys.Controller).unfocusAirport();
    }

    this.setLoadOrActivateState();
  }

  /**
   * Handles when an approach has been selected for an airport.
   * @param index The index of the approach from the list of gnsValidApproaches.
   */
  private onApproachSelected(index: number): void {

    if (index < 0) {
      this.transitions.instance.setItems([]);
      this.selectedTransition = undefined;

      this.setLoadOrActivateState();
      return;
    }

    const facilityApproachIndex = this.gnsValidApproaches[index].index;

    const airport = this.props.selectedAirport.get();

    if (airport !== undefined && !this.settingExistingData) {
      const approach = this.gnsValidApproaches[index].approachProcedure;

      if (approach !== undefined && this.selectedApproach !== facilityApproachIndex) {
        this.selectedApproach = facilityApproachIndex;

        const transitions = approach.transitions;

        if (approach.transitions.length > 0) {

          this.transitions.instance.setItems(['VECTORS', ...transitions.map(t => t.name)]);
          this.transitions.instance.setSelectedItem(0, false);
        } else if (approach.transitions.length === 0) {

          if (approach.transitions.length === 0 && approach.finalLegs.length > 0) {
            this.transitions.instance.setItems(['VECTORS', ICAO.getIdent(approach.finalLegs[0].fixIcao)]);
          }
          this.transitions.instance.setSelectedItem(0, false);
          this.selectedTransition = undefined;
        }

        const parts = FmsUtils.getApproachNameAsParts(approach);
        this.renderRNAV(parts.flags);
        this.scrollToNext();
        this.updatePreviewMap();
      }
    }
  }

  /**
   * Handles when the transition has been selected.
   * @param index The index of the transition.
   */
  private onTransitionSelected(index: number): void {
    const adjustedIndex = index - 1;

    const airport = this.props.selectedAirport.get();
    if (airport !== undefined && this.selectedApproach !== undefined && !this.settingExistingData) {
      const approach = airport.approaches[this.selectedApproach];

      if (approach !== undefined) {
        const transition = approach.transitions[adjustedIndex];
        if ((transition === undefined && adjustedIndex === 0) || transition !== undefined || adjustedIndex === -1) {
          this.selectedTransition = adjustedIndex;
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
    if (this.approaches.instance.isFocused) {
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
      if (this.gnsValidApproaches.length > 0) {
        this.approaches.instance.openPopout();
      } else {
        this.root.instance.scroll('forward');
      }
    }
  }

  /**
   * Builds a text based approach name for selection display.
   * @param approach The approach to build the name for.
   * @returns The approach name.
   */
  private buildApproachName(approach: ApproachProcedure): string {
    const parts = FmsUtils.getApproachNameAsParts(approach);
    let name = parts.type;

    if (name === 'RNAV') {
      name += 'É';
    }

    parts.suffix && (name += `${parts.runway ? ' ' : '–'}${parts.suffix}`);
    parts.runway && (name += ` ${parts.runway}`);
    return name;
  }

  /**
   * Inserts the approach into the flight plan.
   * @param activate Whether or not to activate the approach.
   */
  private async insertApproach(activate: boolean): Promise<void> {
    const airport = this.props.selectedAirport.get();

    if (airport !== undefined && this.selectedApproach !== undefined && this.selectedTransition !== undefined) {
      const approachToInsert = airport.approaches[this.selectedApproach];
      let canInsert = true;
      if (!FmsUtils.isGpsApproach(approachToInsert)) {
        canInsert = await ViewService.confirm('NOT APPROVED FOR GPS', `GPS guidance is for monitoring only.\r\n${activate ? 'Activate' : 'Load'} approach?`);
      }

      if (canInsert) {
        await this.props.fms.insertApproach(airport, this.selectedApproach, this.selectedTransition, undefined, undefined, undefined, activate);

        ViewService.back();
        ViewService.open('FPL', false, 0);
      }
    }
  }

  /**
   * Builds the page's procedure preview plan.
   */
  private async updatePreviewMap(): Promise<void> {
    this.previewOpId++;
    const currentOpId = this.previewOpId;

    const airport = this.props.selectedAirport.get();
    const approachIndex = this.selectedApproach ?? this.gnsValidApproaches[0].index;
    const transitionIndex = this.selectedTransition ?? -1;

    if (airport !== undefined && airport.approaches.length > 0 && approachIndex !== undefined && transitionIndex !== undefined) {
      const procTask = this.props.fms.buildProcedurePreviewPlan(this.flightPathCalculator, airport, ProcedureType.APPROACH, approachIndex, transitionIndex);
      const transTask = this.props.fms.buildProcedureTransitionPreviewPlan(this.flightPathCalculator, airport, ProcedureType.APPROACH, approachIndex, transitionIndex);

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

  /**
   * Renders the RNAV box that overlaps on the map.
   * @param flag rnav type
   */
  private renderRNAV(flag?: string): void {
    if (this.props.gnsType === 'wt430') {
      //dont do anything on the 430
    } else {

      if (flag === 'LPV') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('LPV');

      } else if (flag === 'LP') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('LP');

      } else if (flag === 'LP+V') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('LP+V');

      } else if (flag === 'L/VNAV') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('L/VNAV');

      } else if (flag === 'LNAV+V') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('LNAV+V');

      } else if (flag === 'LNAV') {
        this.selectedFlagRef.instance.classList.remove('hide-element');
        this.selectedFlag.set('LNAV');

      } else {
        this.selectedFlagRef.instance.classList.add('hide-element');
        this.selectedFlag.set('');

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
            <div class='rnav-type-box hide-element' ref={this.selectedFlagRef}>{this.selectedFlag}</div>
            <div id="proc-approach-selectors" class='waypoint-page-selectors'>
              <WaypointPageSelector class='approach' label={this.props.gnsType === 'wt530' ? 'APPROACH' : 'APR'} onSelected={this.onApproachSelected.bind(this)} ref={this.approaches} />
              <WaypointPageSelector class='transition' label='TRANS' onSelected={this.onTransitionSelected.bind(this)} ref={this.transitions} />
              <LoadActivateButton class={'load-or-activate-button-approach'} ref={this.loadActivate} gnsType={this.props.gnsType} onLoad={this.insertApproach.bind(this, false)} onActivate={this.insertApproach.bind(this, true)} />
            </div>
          </div>
        </GNSUiControl>
      </div>
    );
  }
}
