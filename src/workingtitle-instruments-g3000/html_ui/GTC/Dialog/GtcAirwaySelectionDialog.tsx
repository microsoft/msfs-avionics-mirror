/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
import {
  AirwayData, AirwaySegment, ArraySubject, FacilityType, FlightPathCalculator, FlightPlanUtils, FSComponent, ICAO,
  IntersectionFacility,
  LegDefinition, MappedSubject, StringUtils, Subject, VNode, Wait,
} from '@microsoft/msfs-sdk';
import { Fms, FmsUtils, GarminFacilityWaypointCache, TouchButton } from '@microsoft/msfs-garminsdk';
import { FlightPlanListManager, FlightPlanStore } from '@microsoft/msfs-wtg3000-common';

import { GtcListSelectTouchButton } from '../Components/TouchButton/GtcListSelectTouchButton';
import { GtcList } from '../Components/List';
import { GtcValueTouchButton } from '../Components/TouchButton/GtcValueTouchButton';
import { GtcToggleTouchButton } from '../Components/TouchButton/GtcToggleTouchButton';
import { GtcWaypointDisplay } from '../Components/Waypoint/GtcWaypointDisplay';
import { GtcViewEntry } from '../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcListDialog, GtcListDialogParams, ListDialogItemDefinition } from './GtcListDialog';
import './GtcAirwaySelectionDialog.css';

/**
 * A request input for {@link GtcAirwaySelectionDialog}.
 */
export interface GtcAirwaySelectionDialogInput {
  /** The leg to use as the airway entry. Required when inserting a new airway. */
  leg?: LegDefinition;
  /** The flight plan index to use. */
  planIndex: number;
  /** For editing an airway, the airway segment index to edit. */
  editAirwaySegmentIndex?: number;
  /** The flight plan list manager. */
  listManager: FlightPlanListManager;
}

/**
 * A request result returned by {@link GtcAirwaySelectionDialog}.
 */
export interface GtcAirwaySelectionDialogOutput {
  /** The selected airway. */
  airway: AirwayData;

  /** The selected airway entry. */
  entry: IntersectionFacility;

  /** The selected airway exit. */
  exit: IntersectionFacility;

  /** The index of the flight plan segment containing the airway entry leg. */
  segmentIndex: number;

  /** The index of the airway entry leg in its flight plan segment. */
  segmentLegIndex: number;

  /** The index of the airway segment selected for editing, or `undefined` if there is no airway selected for editing. */
  editSegmentIndex?: number;

  /**
   * Whether the airway segment selected for editing is currently collapsed, or `undefined` if there is no airway
   * selected for editing.
   */
  isEditedAirwayCollapsed?: boolean;
}

/**
 * The properties for the {@link GtcAirwaySelectionDialog} component.
 */
export interface GtcAirwaySelectionDialogProps extends GtcViewProps {
  /** An instance of the Fms. */
  fms: Fms;
  /** The flight plan store. */
  store: FlightPlanStore;
  /** The calculator to use for generating previews. */
  calculator: FlightPathCalculator;
}

/**
 * A dialog which allows the user to select and load an airway sequence into a flight plan.
 */
export class GtcAirwaySelectionDialog extends GtcView<GtcAirwaySelectionDialogProps> implements GtcDialogView<GtcAirwaySelectionDialogInput, GtcAirwaySelectionDialogOutput> {
  private thisNode?: VNode;

  private readonly fms = this.props.fms;

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  private readonly entryButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly sequenceListRef = FSComponent.createRef<GtcList<any>>();

  private readonly selectedEntry = Subject.create<IntersectionFacility | undefined>(undefined);
  private readonly selectedAirwayRoute = Subject.create<AirwaySegment | undefined>(undefined);
  private readonly selectedAirway = Subject.create<AirwayData | undefined>(undefined);
  private readonly selectedExit = Subject.create<IntersectionFacility | undefined>(undefined);

  private readonly sortAZ = this.gtcService.gtcSettings.getSetting('airwaySelectionSortAZ');

  private readonly airways = MappedSubject.create(([selectedEntry]) => {
    if (selectedEntry !== undefined && selectedEntry.routes.length > 0) {
      const airways = [] as AirwaySegment[];
      selectedEntry.routes.forEach(route => {
        // Ignore duplicate airways
        if (!airways.some(x => x.name === route.name)) {
          airways.push(route);
        }
      });
      return airways;
    }
    return [];
  }, this.selectedEntry);

  private readonly exits = MappedSubject.create(([selectedAirway, sortAZ]) => {
    if (selectedAirway !== undefined && selectedAirway.waypoints.length > 1) {
      if (sortAZ) {
        return selectedAirway.waypoints.slice().sort((a, b) => ICAO.getIdent(a.icao).localeCompare(ICAO.getIdent(b.icao)));
      } else {
        return selectedAirway.waypoints.slice();
      }
    }
    return [];
  }, this.selectedAirway, this.sortAZ);

  private readonly isLoadButtonEnabled = MappedSubject.create(([selectedEntry, selectedAirway, selectedExit]) => {
    if (!selectedEntry || !selectedAirway || !selectedExit) {
      return false;
    }
    return true;
  }, this.selectedEntry, this.selectedAirway, this.selectedExit);

  private readonly sequence = ArraySubject.create<LegDefinition>();

  private readonly isAirwayListOpen = Subject.create(false);
  private readonly isExitListOpen = Subject.create(false);

  private readonly listParams: Partial<GtcListDialogParams<any>> = {
    class: 'gtc-airway-selection-list-dialog',
    listItemHeightPx: this.gtcService.isHorizontal ? 132 : 71,
    listItemSpacingPx: this.gtcService.isHorizontal ? 2 : 1,
  };

  private readonly goBackToDialogSelector = (steps: number, stackPeeker: (depth: number) => GtcViewEntry | undefined): boolean => {
    return stackPeeker(0)?.ref === this;
  };

  private initSelectionOpId = 0;
  private loadSelectedAirwayOpId = 0;
  private airwayPressedOpId = 0;
  private exitPressedOpId = 0;

  private input!: GtcAirwaySelectionDialogInput;

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<GtcAirwaySelectionDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritdoc */
  public override onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Airway Selection');
    this._activeComponent.set(this.sequenceListRef.instance);
  }

  /** @inheritdoc */
  public async request(input: GtcAirwaySelectionDialogInput): Promise<GtcDialogResult<GtcAirwaySelectionDialogOutput>> {
    this.cleanupRequest();

    return new Promise<GtcDialogResult<GtcAirwaySelectionDialogOutput>>((resolve) => {
      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.input = input;

      this.sequence.set([]);
      this.selectedEntry.set(undefined);
      this.selectedAirwayRoute.set(undefined);
      this.selectedAirway.set(undefined);
      this.selectedExit.set(undefined);

      this.initSelection();
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** Initializes this page's airway selection. */
  private async initSelection(): Promise<void> {
    const opId = ++this.initSelectionOpId;

    await this.initEntry(opId);

    if (opId !== this.initSelectionOpId) {
      return;
    }

    await this.initAirway(opId);

    if (opId !== this.initSelectionOpId) {
      return;
    }

    this.initExit();

    this.buildSequence();

    if (this.airways.get().length === 0) {
      return;
    } else if (this.airways.get().length === 1) {
      this.selectedAirwayRoute.set(this.airways.get()[0]);
      this.onAirwaySelected();
    } else {
      this.onAirwayButtonPressed();
    }
  }

  /**
   * Initializes the selected entry waypoint.
   * @param opId The ID for the current initialization operation.
   */
  private async initEntry(opId: number): Promise<void> {
    const entry = await this.getEntry();

    if (opId !== this.initSelectionOpId) {
      return;
    } else {
      this.selectedEntry.set(entry);
    }
  }

  /**
   * Choose the appropriate entry to use.
   * @returns The entry to use.
   */
  private async getEntry(): Promise<IntersectionFacility | undefined> {
    const plan = this.fms.getFlightPlan(this.input.planIndex);

    if (this.input.leg) {
      const indexes = FmsUtils.getLegIndexes(plan, this.input.leg);

      if (indexes && indexes.segmentIndex !== undefined && indexes.segmentLegIndex !== undefined) {
        const segment = plan.getSegment(indexes.segmentIndex);
        const fixIcao = segment.legs[indexes.segmentLegIndex].leg.fixIcao;
        return this.fms.facLoader.getFacility(FacilityType.Intersection, fixIcao);
      }
    } else if (this.input.editAirwaySegmentIndex !== undefined) {
      const segment = plan.getSegment(this.input.editAirwaySegmentIndex - 1);
      const fixIcao = segment.legs[segment.legs.length - 1].leg.fixIcao;
      return this.fms.facLoader.getFacility(FacilityType.Intersection, fixIcao);
    } else {
      throw new Error('Either leg or editAirwaySegmentIndex inputs are required, but none were passed in');
    }
  }

  /**
   * Initializes the selected airway.
   * @param opId The ID for the current initialization operation.
   * @returns A promise that resolves when the airway is initialized.
   */
  private async initAirway(opId: number): Promise<void> {
    if (this.input.editAirwaySegmentIndex !== undefined) {
      const plan = this.props.fms.getFlightPlan(this.input.planIndex);
      const segment = plan.getSegment(this.input.editAirwaySegmentIndex);
      const airwayName = segment.airway;
      const entry = this.selectedEntry.get();

      if (!entry || !airwayName || !segment.airway) { return undefined; }

      const route = entry.routes.find(rt => segment.airway!.startsWith(rt.name));
      if (!route) { return undefined; }

      const airway = await this.props.fms.facLoader.getAirway(route.name, route.type, entry.icao);

      if (opId !== this.initSelectionOpId) {
        return;
      }

      this.selectedAirway.set(airway);
      this.selectedAirwayRoute.set(route);
    } else {
      this.selectedAirway.set(undefined);
    }
  }

  /**
   * Initializes the selected exit waypoint.
   */
  private initExit(): void {
    this.selectedExit.set(this.getExit());
  }

  /**
   * Choose the appropriate exit to use.
   * @returns The exit to use.
   */
  private getExit(): IntersectionFacility | undefined {
    if (this.input.editAirwaySegmentIndex !== undefined) {
      const plan = this.props.fms.getFlightPlan(this.input.planIndex);
      const segment = plan.getSegment(this.input.editAirwaySegmentIndex);
      const exitLeg = segment.legs[segment.legs.length - 1];
      const airway = this.selectedAirway.get();
      if (!airway) { return undefined; }
      const exitWaypoint = airway.waypoints.find(waypoint => waypoint.icao === exitLeg.leg.fixIcao);
      return exitWaypoint;
    }
    return undefined;
  }

  /**
   * Responds to when the airway button is pressed.
   */
  private async onAirwayButtonPressed(): Promise<void> {
    // If the airway selection list is already open, close it.
    if (this.isAirwayListOpen.get()) {
      this.gtcService.goBack();
      return;
    }

    // Close all open popups on top of this dialog.
    this.gtcService.goBackTo(this.goBackToDialogSelector);

    // If this dialog is not the active view, abort.
    if (this.gtcService.activeView.get()?.ref !== this) {
      return;
    }

    const opId = ++this.airwayPressedOpId;

    this.isAirwayListOpen.set(true);

    const result = await this.gtcService.openPopup<GtcListDialog>(GtcViewKeys.ListDialog1, undefined, 'none')
      .ref.request({
        title: 'Select Airway',
        inputData: this.airways.get().map((airway): ListDialogItemDefinition<AirwaySegment> => ({
          value: airway,
          labelRenderer: () => airway.name,
        })),
        selectedValue: this.selectedAirwayRoute.get(),
        ...this.listParams,
      });

    if (opId !== this.airwayPressedOpId) {
      return;
    }

    this.isAirwayListOpen.set(false);

    if (!result.wasCancelled) {
      this.selectedAirwayRoute.set(result.payload);
      this.onAirwaySelected();
    }
  }

  /**
   * Handles the airway being selected, showing the next list dialog if necessary.
   */
  private async onAirwaySelected(): Promise<void> {
    const selectedEntry = this.selectedEntry.get();
    const selectedAirwayRoute = this.selectedAirwayRoute.get();

    if (!selectedEntry || !selectedAirwayRoute) { return; }

    const opId = ++this.loadSelectedAirwayOpId;

    const airway = await this.fms.facLoader.getAirway(selectedAirwayRoute.name, selectedAirwayRoute.type, selectedEntry.icao);

    // If a more recent airway was selected or this dialog is not the active view, abort.
    if (opId !== this.loadSelectedAirwayOpId || this.gtcService.activeView.get()?.ref !== this) {
      return;
    }

    this.selectedAirway.set(airway);

    const exit = this.selectedExit.get();

    if (exit && !this.exits.get().includes(exit)) {
      this.selectedExit.set(undefined);
    }

    this.buildSequence();

    if (this.exits.get().length === 0) {
      return;
    } else if (this.exits.get().length === 1) {
      this.selectedExit.set(this.exits.get()[0]);
      this.onExitSelected();
    } else {
      this.onExitButtonPressed();
    }
  }

  /**
   * Responds to when the exit button is pressed.
   */
  private async onExitButtonPressed(): Promise<void> {
    // If the exit selection list is already open, close it.
    if (this.isExitListOpen.get()) {
      this.gtcService.goBack();
      return;
    }

    // Close all open popups on top of this dialog.
    this.gtcService.goBackTo(this.goBackToDialogSelector);

    // If this dialog is not the active view, abort.
    if (this.gtcService.activeView.get()?.ref !== this) {
      return;
    }

    const opId = ++this.exitPressedOpId;

    this.isExitListOpen.set(true);

    const result = await this.gtcService.openPopup<GtcListDialog>(GtcViewKeys.ListDialog1, undefined, 'none')
      .ref.request({
        title: `Select Exit – ${this.selectedAirwayRoute.get()?.name}`,
        inputData: this.exits.get().map((exit): ListDialogItemDefinition<IntersectionFacility> => ({
          value: exit,
          labelRenderer: () => (
            <GtcWaypointDisplay
              waypoint={this.waypointCache.get(exit)}
            />
          ),
          isEnabled: exit !== this.selectedEntry.get(),
        })),
        selectedValue: this.selectedExit.get(),
        scrollToValue: this.sortAZ.get() ? undefined : (this.selectedExit.get() ?? this.selectedEntry.get()),
        ...this.listParams,
      });

    if (opId !== this.exitPressedOpId) {
      return;
    }

    this.isExitListOpen.set(false);

    if (!result.wasCancelled) {
      this.selectedExit.set(result.payload);
      this.onExitSelected();
    }
  }

  /**
   * Handles the exit waypoint being selected.
   */
  private onExitSelected(): void {
    this.buildSequence();
  }

  /**
   * Responds to when the sort button is pressed.
   */
  private async onSortButtonPressed(): Promise<void> {
    let needOpenExitList = false;

    // If the exit list is open, then we need to close it, then re-open it after toggling the sort setting.
    if (this.isExitListOpen.get()) {
      this.gtcService.goBackTo(this.goBackToDialogSelector);

      needOpenExitList = true;
    }

    this.sortAZ.set(!this.sortAZ.get());

    if (needOpenExitList) {
      // We need to wait one frame before trying to open the exit selection list again because it takes one frame for
      // the isExitListOpen subject to update after the list is closed.
      await Wait.awaitDelay(0);

      // If this dialog is not the active view or there are no exits, abort.
      if (this.gtcService.activeView.get()?.ref !== this || this.exits.get().length === 0) {
        return;
      }

      this.onExitButtonPressed();
    }
  }

  /**
   * Creates a procedure preview plan with the current selections.
   */
  private async buildSequence(): Promise<void> {
    const selectedEntry = this.selectedEntry.get();
    const selectedAirway = this.selectedAirway.get();
    const selectedExit = this.selectedExit.get();

    if (selectedEntry !== undefined && selectedAirway !== undefined && selectedExit !== undefined) {
      const previewPlanIndex = this.fms.buildAirwayPreviewSegment(selectedAirway, selectedEntry, selectedExit);
      const previewPlan = this.fms.getFlightPlan(previewPlanIndex);
      this.sequence.set(previewPlan.getSegment(0).legs);
    } else {
      this.sequence.set([]);
    }
  }

  /**
   * Responds to when the load button is pressed.
   */
  private onLoadButtonPressed(): void {
    const selectedEntry = this.selectedEntry.get();
    const selectedAirway = this.selectedAirway.get();
    const selectedExit = this.selectedExit.get();
    const plan = this.fms.getFlightPlan(this.input.planIndex);

    if (selectedEntry === undefined || selectedAirway === undefined || selectedExit === undefined) {
      return;
    }

    let entrySegmentIndex: number;
    let entrySegmentLegIndex: number;
    let isEditedAirwayCollapsed: boolean | undefined = undefined;

    if (this.input.editAirwaySegmentIndex !== undefined) {
      // Entry leg is last leg of previous segment
      const airwaySegment = plan.getSegment(this.input.editAirwaySegmentIndex);
      isEditedAirwayCollapsed = this.input.listManager.collapsedAirwaySegments.has(airwaySegment);
      entrySegmentIndex = this.input.editAirwaySegmentIndex - 1;
      entrySegmentLegIndex = plan.getSegment(entrySegmentIndex).legs.length - 1;
    } else {
      const indexes = FmsUtils.getLegIndexes(plan, this.input.leg!);
      if (!indexes) {
        return;
      }
      entrySegmentIndex = indexes.segmentIndex;
      entrySegmentLegIndex = indexes.segmentLegIndex;
    }

    this.resultObject = {
      wasCancelled: false,
      payload: {
        airway: selectedAirway,
        entry: selectedEntry,
        exit: selectedExit,
        segmentIndex: entrySegmentIndex,
        segmentLegIndex: entrySegmentLegIndex,
        editSegmentIndex: this.input.editAirwaySegmentIndex,
        isEditedAirwayCollapsed: isEditedAirwayCollapsed
      },
    };

    // Close all open popups on top of this dialog.
    this.gtcService.goBackTo(this.goBackToDialogSelector);

    // If this dialog is not the active view, we are in an unknown state, so abort instead of going back one more time.
    if (this.gtcService.activeView.get()?.ref !== this) {
      return;
    }

    this.props.gtcService.goBack();
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-airway-selection-dialog gtc-popup-panel">
        <div class="main-column">
          <GtcValueTouchButton
            ref={this.entryButtonRef}
            label="Entry"
            class="entry"
            state={this.selectedEntry}
            isEnabled={false}
            renderValue={value => value ? ICAO.getIdent(value.icao) : '–––––'}
          />
          <GtcValueTouchButton
            state={this.selectedAirwayRoute}
            label="Airway"
            renderValue={value => value?.name ?? '–––––'}
            isEnabled={this.airways.map(x => x.length > 0)}
            isHighlighted={this.isAirwayListOpen}
            onPressed={this.onAirwayButtonPressed.bind(this)}
            class="airway"
          />
          <GtcValueTouchButton
            state={this.selectedExit}
            label="Exit"
            renderValue={value => value ? ICAO.getIdent(value.icao) : '–––––'}
            isEnabled={this.exits.map(x => x.length > 0)}
            isHighlighted={this.isExitListOpen}
            onPressed={this.onExitButtonPressed.bind(this)}
            class="exit"
          />
        </div>
        <div class="bottom-row">
          <GtcToggleTouchButton
            label="Sort A→Z"
            class="sort-button"
            state={this.sortAZ}
            onPressed={this.onSortButtonPressed.bind(this)}
          />
          <TouchButton
            label={'Load\nAirway'}
            class="load-button"
            isEnabled={this.isLoadButtonEnabled}
            onPressed={this.onLoadButtonPressed.bind(this)}
          />
        </div>
        <div class="sequence-box gtc-panel">
          <div class="gtc-panel-title">
            Sequence
          </div>
          <GtcList<any>
            ref={this.sequenceListRef}
            bus={this.gtcService.bus}
            sidebarState={this._sidebarState}
            itemsPerPage={12}
            listItemHeightPx={this.gtcService.isHorizontal ? 56 : 30}
            heightPx={this.gtcService.isHorizontal ? 682 : 364}
            listItemSpacingPx={0}
            data={this.sequence}
            renderItem={this.renderLeg}
          />
        </div>
      </div>
    );
  }

  /**
   * Renders a leg for the sequence box.
   * @param leg The leg.
   * @returns The leg VNode.
   */
  private readonly renderLeg = (leg: LegDefinition): VNode => {
    const legName = leg.name && StringUtils.useZeroSlash(leg.name);
    if (FlightPlanUtils.isAltitudeLeg(leg.leg.type)) {
      return (
        <div class="sequence-item">
          {legName?.replace(/FT/, '')}<span style="font-size: 0.75em;">FT</span>
        </div>
      );
    } else {
      return (
        <div class="sequence-item">
          {legName} {FmsUtils.getSequenceLegFixTypeSuffix(leg, false)}
        </div>
      );
    }
  };

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
