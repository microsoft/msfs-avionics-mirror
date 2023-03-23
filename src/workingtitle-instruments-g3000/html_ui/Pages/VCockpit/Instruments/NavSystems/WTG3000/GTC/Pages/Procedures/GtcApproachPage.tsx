import {
  AirportFacility, ApproachUtils, ArraySubject, FacilityType, FlightPlan, FlightPlanSegmentType, FlightPlanUtils,
  FSComponent, ICAO, LegDefinition, MappedSubject, RnavTypeFlags, RunwayUtils, SetSubject, StringUtils, Subject,
  VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { ApproachListItem, FmsUtils, MinimumsDataProvider, ProcedureType, TouchButton, TransitionListItem, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { ApproachNameDisplay, ControllableDisplayPaneIndex, G3000FmsUtils } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List';
import { GtcMinimumsTouchButton } from '../../Components/Minimums/GtcMinimumsTouchButton';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { ListDialogItemDefinition } from '../../Dialog/GtcListDialog';
import { GtcLoadFrequencyDialog } from '../../Dialog/GtcLoadFrequencyDialog';
import { GtcMessageDialog } from '../../Dialog/GtcMessageDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcFlightPlanDialogs } from '../FlightPlanPage/GtcFlightPlanDialogs';
import { GtcFlightPlanPage } from '../FlightPlanPage';
import { GtcApproachMinimumsPopup } from './GtcApproachMinimumsPopup';
import { GtcProcedureSelectionPage, GtcProcedureSelectionPageProps } from './GtcProcedureSelectionPage';

import './GtcProcedureSelectionPage.css';

/**
 * The properties for the GtcDeparturePage component.
 */
export interface GtcApproachPageProps extends GtcProcedureSelectionPageProps {
  /** Whether RNP (AR) approaches should be selectable. */
  allowRnpAr: boolean;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * GTC view keys for popups owned by the approach page.
 */
enum GtcApproachPagePopupKeys {
  Minimums = 'ApproachMinimums'
}

/**
 * Allows user to configure and load an approach into the flight plan.
 */
export class GtcApproachPage extends GtcProcedureSelectionPage<GtcApproachPageProps> {
  private readonly approachButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly transitionButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly minimumsButtonRef = FSComponent.createRef<GtcMinimumsTouchButton>();
  private readonly primaryFrequencyButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly sequenceListRef = FSComponent.createRef<GtcList<any>>();

  private readonly approachButtonCssClass = SetSubject.create(['approach', 'procedure', 'proc-page-big-button']);

  private readonly selectedApproachItem = Subject.create<ApproachListItem | undefined>(undefined);
  private readonly selectedTransition = Subject.create<TransitionListItem | undefined>(undefined);
  private readonly selectedTransitionIndex = this.selectedTransition.map(x => x?.transitionIndex ?? -1);

  private readonly approaches = this.props.allowRnpAr
    ? this.selectedAirport.map(x => FmsUtils.getApproaches(x).sort(G3000FmsUtils.sortApproachItem))
    : this.selectedAirport.map(x => FmsUtils.getApproaches(x).filter(approach => !FmsUtils.isApproachRnpAr(approach.approach)).sort(G3000FmsUtils.sortApproachItem));

  private readonly transitions = this.selectedApproachItem.map(approach => {
    return FmsUtils.getApproachTransitions(approach);
  });

  private readonly selectedApproach = this.selectedApproachItem.map(item => item?.approach);

  private readonly needSmallApproachText = this.selectedApproach.map(approach => {
    if (!approach) {
      return false;
    }

    // RNAV approaches with a letter suffix and LNAV/VNAV minima require small text
    // (e.g. 'RNAV_GPS Z 36 LNAV/VNAV').
    return approach.runway !== ''
      && approach.approachType === ApproachType.APPROACH_TYPE_RNAV
      && approach.approachSuffix !== ''
      && FmsUtils.getBestRnavType(approach.rnavTypeFlags) === RnavTypeFlags.LNAVVNAV;
  });

  private readonly skipCourseReversal = Subject.create(false);

  private readonly doSelectionsMatchFlightPlan = MappedSubject.create(([
    selectedAirport, selectedApproach, selectedTransitionIndex, skipCourseReversal,
    planDestinationFacility, planApproach, planTransitionIndex,
    planHasApproachLoaded, visualApproachOneWayRunwayDesignation, planSkipCourseReversal,
  ]) => {
    if (selectedAirport !== planDestinationFacility) { return false; }
    if (planHasApproachLoaded) {
      if (!selectedApproach) { return false; }
      if (selectedApproach.isVisualApproach) {
        if (!visualApproachOneWayRunwayDesignation) { return false; }
        if (selectedApproach.approach.runway !== visualApproachOneWayRunwayDesignation) { return false; }
      } else {
        if (visualApproachOneWayRunwayDesignation) { return false; }
        if (selectedApproach.approach !== planApproach) { return false; }
      }
      if (skipCourseReversal !== planSkipCourseReversal) { return false; }
    } else {
      if (selectedApproach) { return false; }
    }
    if (selectedTransitionIndex !== planTransitionIndex) { return false; }
    return true;
  }, this.selectedAirport, this.selectedApproachItem, this.selectedTransitionIndex, this.skipCourseReversal,
    this.store.destinationFacility, this.store.approachProcedure, this.store.approachTransitionIndex,
    this.store.isApproachLoaded, this.store.visualApproachOneWayRunwayDesignation, this.store.skipCourseReversal);

  private readonly canActivate = MappedSubject.create(([selectedAirport, selectedApproach]) => {
    if (selectedAirport && selectedApproach) { return true; }
    return false;
  }, this.selectedAirport, this.selectedApproachItem);

  private readonly canLoadOnly = MappedSubject.create(([doSelectionsMatchFlightPlan, canActivate]) => {
    if (!doSelectionsMatchFlightPlan && canActivate) { return true; }
    return false;
  }, this.doSelectionsMatchFlightPlan, this.canActivate);

  private readonly previewPlan = Subject.create<FlightPlan | null>(null);

  private readonly sequence = ArraySubject.create<LegDefinition>();
  private legs = [] as LegDefinition[];

  private readonly approachReferenceFacility = Subject.create<VorFacility | null>(null);
  private readonly primaryFrequencyIdent = this.approachReferenceFacility.map(x => x ? ICAO.getIdent(x.icao) : '');
  private readonly primaryFrequencyMHz = this.approachReferenceFacility.map(x => x?.freqMHz);
  private readonly primaryFrequencyString = this.primaryFrequencyMHz.map(v => v?.toFixed(2) ?? '');

  private readonly showPrimaryFrequencyButton = this.primaryFrequencyMHz.map(x => !!x);

  private updateFromSelectedOpId = 0;
  private buildSequenceOpId = 0;

  /** @inheritdoc */
  public override onAfterRender(): void {
    super.onAfterRender();

    this._title.set('Approach Selection');

    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcApproachPagePopupKeys.Minimums, 'MFD', this.renderMinimumsPopup.bind(this), this.props.displayPaneIndex);

    this._activeComponent.set(this.sequenceListRef.instance);

    this.selectedAirport.sub(airport => {
      if (airport !== undefined) {
        this.skipCourseReversal.set(false);
      }
    });

    this.doSelectionsMatchFlightPlan.sub(doSelectionsMatchFlightPlan => {
      this._sidebarState.slot1.set(!doSelectionsMatchFlightPlan ? 'cancel' : null);
    });

    this.needSmallApproachText.sub(needSmall => {
      this.approachButtonCssClass.toggle('button-value-small-text', needSmall);
    }, true);
  }

  /**
   * Initializes this page's approach selection.
   * @param facility The airport facility to select. If not defined, an initial airport will automatically be selected.
   * @param approach The approach item to select. Ignored if `facility` is not defined. If not defined, an initial
   * approach will automatically be selected.
   */
  public async initSelection(facility?: AirportFacility, approach?: ApproachListItem): Promise<void> {
    this.skipCourseReversal.set(false);

    if (facility === undefined) {
      await this.loadAirport();
    } else {
      this.selectedAirport.set(facility);
    }

    if (facility === undefined || approach === undefined) {
      if (this.selectedAirport.get()) {
        this.loadApproach();
        this.loadTransition();
      } else {
        this.selectedApproachItem.set(undefined);
        this.selectedTransition.set(undefined);
      }
    } else {
      this.selectedApproachItem.set(approach);
      this.selectedTransition.set(this.transitions.get()[0]);
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
     * precedence for approach airport is:
     * - existing destination facility
     * - last airport found in the flight plan
     * - origin airport
     * - nearest airport
     * - most recent airport
     */
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

  /** Loads the approach. */
  private loadApproach(): void {
    this.selectedApproachItem.set(this.getApproach());
  }

  /**
   * Choose the appropriate approach to use.
   * @returns The approach to use.
   */
  private getApproach(): ApproachListItem | undefined {
    const planDestinationFacility = this.store.destinationFacility.get();
    const planHasApproachLoaded = this.store.isApproachLoaded.get();
    const planApproachIndex = this.store.approachIndex.get();
    const planVisualApproachOneWayRunwayDesignation = this.store.visualApproachOneWayRunwayDesignation.get();
    const planDestinationRunway = this.store.destinationRunway.get();
    const selectedAirport = this.selectedAirport.get();
    const approaches = this.approaches.get();

    // 1. If selected airport matches plan approach facility, and plan has an approach, use that
    if (selectedAirport === planDestinationFacility) {
      let approach: ApproachListItem | undefined = undefined;
      if (planHasApproachLoaded) {
        if (planVisualApproachOneWayRunwayDesignation) {
          approach = approaches.find(appr => appr.isVisualApproach === true && appr.approach.runway === planVisualApproachOneWayRunwayDesignation);
        } else {
          approach = approaches.find(appr => appr.isVisualApproach === false && appr.index === planApproachIndex);
        }
      } else if (planDestinationRunway) {
        approach = approaches.find(appr => {
          return appr.approach.runwayNumber === planDestinationRunway.direction && appr.approach.runwayDesignator === planDestinationRunway.runwayDesignator;
        });
      }
      if (approach) {
        return approach;
      }
    }

    // 2. Use first approach from selected airport
    if (selectedAirport) {
      return approaches[0];
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
  private getTransition(): TransitionListItem | undefined {
    const planDestinationFacility = this.store.destinationFacility.get();
    const isApproachLoaded = this.store.isApproachLoaded.get();
    const planTransitionIndex = this.store.approachTransitionIndex.get();
    const selectedAirport = this.selectedAirport.get();
    const selectedApproach = this.selectedApproachItem.get();

    // 1. If selected airport matches plan approach facility, and plan has a transition, use that
    if (selectedAirport === planDestinationFacility && isApproachLoaded) {
      return this.transitions.get()[planTransitionIndex + 1];
    }

    // 2. Use first transition from selected approach
    if (selectedApproach) {
      return this.transitions.get()[0];
    }

    return undefined;
  }

  /**
   * Creates a procedure preview plan with the current selections.
   * @returns Whether the sequence was built or not.
   */
  private async buildSequence(): Promise<boolean> {
    const selectedAirport = this.selectedAirport.get();
    const selectedApproach = this.selectedApproachItem.get();
    const selectedTransition = this.selectedTransition.get();

    if (!selectedAirport || !selectedApproach) {
      this.previewPlan.set(null);
      this.sequence.clear();
      this.buildSequenceOpId++;
      return false;
    }

    const opId = ++this.buildSequenceOpId;

    let plan: FlightPlan | undefined = undefined;

    if (selectedApproach.isVisualApproach) {
      plan = await this.fms.buildProcedurePreviewPlan(
        this.props.calculator,
        selectedAirport,
        ProcedureType.VISUALAPPROACH,
        -1,
        -1,
        undefined,
        undefined,
        selectedApproach.approach.runwayNumber,
        selectedApproach.approach.runwayDesignator,
      );
    } else {
      const transIndex = selectedTransition?.transitionIndex ?? -1;
      plan = await this.fms.buildProcedurePreviewPlan(
        this.props.calculator,
        selectedAirport,
        ProcedureType.APPROACH,
        selectedApproach.index,
        transIndex,
      );
    }

    if (opId === this.buildSequenceOpId) {
      this.previewPlan.set(plan);
      const sequence: LegDefinition[] = [];
      this.legs = [];
      plan.getSegment(0).legs.forEach((leg) => {
        this.legs.push(leg);
        if (!FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)) {
          sequence.push(leg);
        }
      });
      this.sequence.set(sequence);
      return true;
    } else {
      return false;
    }
  }

  /** Handles the airport being selected, showing the next list dialog if necessary. */
  private readonly onAirportSelected = async (): Promise<void> => {
    /*
     * Changing any of the selected options triggers a chain reaction
     * which prompts the user to select the other options.
     *
     *   apt > appr > trans
     */

    this.selectedApproachItem.set(this.approaches.get()[0]);
    this.selectedTransition.set(this.transitions.get()[0]);

    await this.updateFromSelectedProcedure();

    if (this.approaches.get().length <= 1) {
      this.onApproachSelected();
    } else {
      this.approachButtonRef.instance.simulatePressed();
    }
  };

  /**
   * Handles the approach being selected, showing the next list dialog if necessary.
   * @param selectionChanged Whether the new value matched the old value.
   */
  private async onApproachSelected(selectionChanged = false): Promise<void> {
    if (selectionChanged) {
      this.selectedTransition.set(this.transitions.get()[0]);

      await this.updateFromSelectedProcedure();
    }

    if (!this.selectedApproachItem.get()) { return; }

    if (this.transitions.get().length <= 1) {
      this.onTransitionSelected();
    } else {
      this.transitionButtonRef.instance.simulatePressed();
    }
  }

  /**
   * Handles the transition being selected, showing the next list dialog if necessary.
   */
  private async onTransitionSelected(): Promise<void> {
    const isPreviewBuilt = await this.updateFromSelectedProcedure();

    if (!isPreviewBuilt) {
      return;
    }

    this.skipCourseReversal.set(false);

    if (FmsUtils.checkForCourseReversal(this.legs, this.fms.ppos)) {
      const icao = this.legs[1]?.leg.fixIcao;
      const result = await this.gtcService
        .openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
        .ref.request({
          message: `Fly Course Reversal at ${ICAO.getIdent(icao ?? '')}?`,
          showRejectButton: true,
          acceptButtonLabel: 'Yes',
          rejectButtonLabel: 'No',
        });
      if (!result.wasCancelled) {
        this.skipCourseReversal.set(!result.payload);
        if (this.skipCourseReversal.get()) {
          this.sequence.removeAt(1);
          this.removeCourseReversalFromPreviewPlan();
        }
      }
    }
  }

  /** Removes a course reversal from the preview plan. */
  private async removeCourseReversalFromPreviewPlan(): Promise<void> {
    const previewPlan = this.previewPlan.get();
    if (previewPlan) {
      previewPlan.removeLeg(0, 1);
      await previewPlan.calculate();

      // Prevent race condition if the preview plan was updated while the old one was calculating
      if (this.previewPlan.get() === previewPlan) {
        this.previewPlan.notify();
      }
    }
  }

  private readonly handleLoadButtonPressed = async (activate: boolean): Promise<void> => {
    const facility = this.selectedAirport.get();
    const approach = this.selectedApproachItem.get();
    const transition = this.selectedTransition.get();

    if (!facility || !approach || !transition) { return; }

    const arrivalFacilityIcao = this.store.arrivalFacilityIcao.get();

    if (arrivalFacilityIcao && facility.icao !== arrivalFacilityIcao) {
      const approachFacIdent = ICAO.getIdent(facility.icao);
      const arrivalFacIdent = ICAO.getIdent(arrivalFacilityIcao);
      const message = `The selected approach airport\n(${approachFacIdent}) is different from the\narrival airport (${arrivalFacIdent}).\nLoad Approach?`;
      const accepted = await GtcDialogs.openMessageDialog(this.gtcService, message);
      if (accepted !== true) {
        return;
      }
    }

    // TODO Need to show dialog to confirm minimums in certain conditions

    const trueApproachIndex = approach.index;
    const transIndex = transition.transitionIndex;

    let success: boolean;

    if (!approach.isVisualApproach) {
      const procedure = approach.approach;

      if (!FmsUtils.isGpsApproach(procedure)) {
        const accepted = await GtcDialogs.openMessageDialog(this.gtcService,
          '- NOT APPROVED FOR GPS -\nGPS guidance is for monitoring only.\nLoad approach?');
        if (accepted !== true) {
          return;
        }
      }

      success = await this.fms.insertApproach(
        facility,
        trueApproachIndex,
        transIndex,
        undefined,
        undefined,
        this.skipCourseReversal.get(),
        activate
      );
    } else {
      const accepted = await GtcDialogs.openMessageDialog(this.gtcService,
        'Obstacle clearance is not provided for visual approaches.');

      if (accepted !== true) {
        return;
      }

      const runwayNumber = approach.approach.runwayNumber;
      const runwayDesignator = approach.approach.runwayDesignator;
      success = await this.fms.insertApproach(
        facility,
        -1,
        transIndex,
        runwayNumber,
        runwayDesignator,
        undefined,
        activate
      );
    }

    if (success) {
      this.gtcService.goBackToHomePage();
      this.gtcService.changePageTo<GtcFlightPlanPage>(GtcViewKeys.FlightPlan).ref.scrollTo(FlightPlanSegmentType.Approach);
    }
  };

  /**
   * Updates the sequence list and preview data from the currently selected procedure.
   * @returns A Promise which is fulfilled with whether the sequence list was successfully updated.
   */
  private async updateFromSelectedProcedure(): Promise<boolean> {
    const opId = ++this.updateFromSelectedOpId;

    const airport = this.selectedAirport.get();
    const approachItem = this.selectedApproachItem.get();

    if (airport === undefined || approachItem === undefined) {
      this.approachReferenceFacility.set(null);
      this.previewData.set(null);
    } else {
      // Update approach reference facility.

      let referenceFacility: VorFacility | null = null;
      if (FmsUtils.approachHasNavFrequency(approachItem.approach)) {
        referenceFacility = (await ApproachUtils.getReferenceFacility(approachItem.approach, this.props.fms.facLoader) as VorFacility | undefined) ?? null;

        if (opId !== this.updateFromSelectedOpId) {
          return false;
        }
      }

      this.approachReferenceFacility.set(referenceFacility);

      // Set preview on map data.
      this.previewData.set({
        type: approachItem.isVisualApproach ? ProcedureType.VISUALAPPROACH : ProcedureType.APPROACH,
        airportIcao: airport.icao,
        procedureIndex: approachItem.index,
        transitionIndex: this.selectedTransition.get()?.transitionIndex ?? -1,
        runwayTransitionIndex: -1,
        runwayDesignation: RunwayUtils.getRunwayNameString(approachItem.approach.runwayNumber, approachItem.approach.runwayDesignator)
      });
    }

    return this.buildSequence();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-procedure-selection-page gtc-approach-page">
        <div class="top-row">
          {this.renderAirportButton(this.onAirportSelected)}
          <GtcListSelectTouchButton
            ref={this.approachButtonRef}
            label="Approach"
            class={this.approachButtonCssClass}
            occlusionType="hide"
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.selectedApproachItem}
            isEnabled={this.approaches.map(x => x?.length !== 0)}
            renderValue={<ApproachNameDisplay approach={this.selectedApproach} nullText="–––––" useZeroWithSlash={true} />}
            listParams={selectedApproach => {
              const inputData = this.approaches.get().map<ListDialogItemDefinition<ApproachListItem>>(appr => ({
                value: appr,
                labelRenderer: () => <ApproachNameDisplay approach={appr.approach} useZeroWithSlash={true} />,
              }));
              inputData.push({
                value: {} as ApproachListItem,
                labelRenderer: () => 'Select by SBAS Channel',
                isEnabled: false,
              });
              return {
                title: 'Select Approach',
                inputData: inputData as ListDialogItemDefinition<ApproachListItem | undefined>[],
                selectedValue: selectedApproach.get() ?? this.approaches.get()[0],
                ...this.listParams,
              };
            }}
            onSelected={(value, state) => {
              const changed = value !== state.get();
              state.set(value);
              this.onApproachSelected(changed);
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
              inputData: this.transitions.get().map(trans => ({
                value: trans,
                labelRenderer: () => StringUtils.useZeroSlash(trans.name),
              })),
              selectedValue: selectedTransition.get() ?? this.transitions.get()[0],
              ...this.listParams,
            })}
            onSelected={(value, state) => {
              state.set(value);
              this.onTransitionSelected();
            }}
          />
        </div>
        <div class="second-row">
          <GtcMinimumsTouchButton
            ref={this.minimumsButtonRef}
            isEnabled={this.selectedApproachItem.map(x => !!x)}
            minimumsMode={this.props.minimumsDataProvider.mode}
            minimumsValue={this.props.minimumsDataProvider.minimums}
            displayUnit={UnitsUserSettings.getManager(this.bus).altitudeUnits}
            onPressed={() => { this.props.gtcService.openPopup(GtcApproachPagePopupKeys.Minimums, 'normal', 'hide'); }}
            class='approach-page-minimums-button'
          />
          <TouchButton
            ref={this.primaryFrequencyButtonRef}
            class="sbas proc-page-big-button"
            isEnabled={false}
            isVisible={this.showPrimaryFrequencyButton.map(x => !x)}
          >
            <div class="top-label">SBAS</div>
            <div class="mid-label">
              <div class="channel">CH</div>
              <div class="id">ID</div>
            </div>
            <div class="bottom-label double-bottom-label">
              <div class="channel cyan">_____</div>
              <div class="id cyan">____</div>
            </div>
          </TouchButton>
          <TouchButton
            ref={this.primaryFrequencyButtonRef}
            class="frequency proc-page-big-button"
            isVisible={this.showPrimaryFrequencyButton}
            onPressed={() => {
              const frequency = this.primaryFrequencyMHz.get();
              if (!frequency) { return; }
              this.gtcService.openPopup<GtcLoadFrequencyDialog>(GtcViewKeys.LoadFrequencyDialog).ref.request({
                type: 'NAV',
                frequency,
                label: this.primaryFrequencyIdent.get(),
              });
            }}
          >
            <div class="top-label">Primary<br />Frequency</div>
            <div class="bottom-label double-bottom-label">
              <div class="ident">{this.primaryFrequencyIdent.map(x => x ?? '----')}</div>
              <div class="frequency">{this.primaryFrequencyString.map(x => x ?? '---.--')}</div>
            </div>
          </TouchButton>
        </div>
        <div class="options-box gtc-panel">
          <div class="gtc-panel-title">
            Approach Options
          </div>
          <div class="options-buttons">
            {this.renderPreviewButton()}
            <TouchButton
              label="Remove"
              isEnabled={this.store.isApproachLoaded}
              onPressed={() => GtcFlightPlanDialogs.removeApproach(this.gtcService, this.store, this.fms)}
            />
            <TouchButton
              label="Load"
              isEnabled={this.canLoadOnly}
              onPressed={() => this.handleLoadButtonPressed(false)}
            />
            <TouchButton
              class="touch-button-special"
              label={this.doSelectionsMatchFlightPlan.map(x => x ? 'Activate' : 'Load &\nActivate')}
              isEnabled={this.canActivate}
              onPressed={() => this.handleLoadButtonPressed(true)}
            />
          </div>
        </div>
        {this.renderSequenceBox(this.sequenceListRef, this._sidebarState, this.sequence)}
      </div>
    );
  }

  /**
   * Renders this page's minimums popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's minimums popup, as a VNode.
   */
  private renderMinimumsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcApproachMinimumsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        minimumsDataProvider={this.props.minimumsDataProvider}
      />
    );
  }
}