/* eslint-disable jsdoc/check-indentation */

import {
  AirportFacility, ArraySubject, ArrayUtils, ComponentProps, ConsumerSubject, DebounceTimer, DisplayComponent,
  FacilitySearchType, FacilityType, FSComponent, ICAO, IcaoValue, MappedSubject, Subject, Subscribable,
  SubscribableArray, SubscribableMapFunctions, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, DynamicListData, Fms, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys, FlightPlanStore,
  G3000ChartsAirportSelectionData, G3000ChartsControlEvents, G3000ChartsEvents, G3000ChartsPageData,
  G3000ChartsPageSelectionData, G3000ChartsSource, G3000NearestContext, GtcViewKeys
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcWaypointSelectButton } from '../../Components/TouchButton/GtcWaypointSelectButton';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';

import './GtcChartsPage.css';

/**
 * Component props for {@link GtcChartsPage}.
 */
export interface GtcChartsPageProps extends GtcViewProps {
  /** The FMS. */
  fms: Fms;

  /** The flight plan store to use. */
  flightPlanStore: FlightPlanStore;

  /** A provider of airplane position data. */
  positionDataProvider: GtcPositionHeadingDataProvider;

  /** All available charts sources. */
  chartsSources: Iterable<G3000ChartsSource>;
}

/**
 * A GTC electronic charts page.
 */
export class GtcChartsPage extends GtcView<GtcChartsPageProps> {
  private thisNode?: VNode;

  private readonly publisher = this.props.gtcService.bus.getPublisher<G3000ChartsControlEvents>();

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();
  private readonly tabRefs = ArrayUtils.create(4, () => FSComponent.createRef<ChartsTab>());

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;

  private readonly chartSources = new Map(Array.from(this.props.chartsSources, source => [source.uid, source]));

  private readonly airportSelection = ConsumerSubject.create<G3000ChartsAirportSelectionData | null>(null, null).pause();
  private airportSelectionOpId = 0;
  private loadedAirportSelection: G3000ChartsAirportSelectionData | null = null;

  private initAirportSelectionOpId = 0;

  private readonly pageSelection = ConsumerSubject.create<G3000ChartsPageSelectionData | null>(null, null).pause();
  private readonly localPageSelection = Subject.create<G3000ChartsPageSelectionData | null>(null);

  private readonly isLoading = Subject.create(false);

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);
  private readonly selectedWaypoint = Subject.create<AirportWaypoint | null>(null);

  private readonly infoListData = ArraySubject.create<G3000ChartsPageSelectionData & DynamicListData>();
  private readonly departureListData = ArraySubject.create<G3000ChartsPageSelectionData & DynamicListData>();
  private readonly arrivalListData = ArraySubject.create<G3000ChartsPageSelectionData & DynamicListData>();
  private readonly approachListData = ArraySubject.create<G3000ChartsPageSelectionData & DynamicListData>();

  private readonly goToHomePageDebounce = new DebounceTimer();

  private displayPaneViewSub?: Subscription;

  /**
   * Creates a new instance of GtcChartsPage.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcChartsPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcChartsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Charts');

    const sub = this.props.gtcService.bus.getSubscriber<G3000ChartsEvents>();

    this.airportSelection.setConsumer(sub.on(`charts_airport_selection_${this.displayPaneIndex}`));
    this.airportSelection.sub(this.onAirportSelectionChanged.bind(this));

    this.pageSelection.setConsumer(sub.on(`charts_page_selection_${this.displayPaneIndex}`));
    this.pageSelection.sub(this.onPageSelectionChanged.bind(this));

    this.displayPaneViewSub = this.displayPaneSettingManager.getSetting('displayPaneView').sub(this.onDisplayPaneViewChanged.bind(this), false, true);
  }

  /**
   * Initializes this page's airport selection.
   * @param airport The airport facility to select, or its ICAO. If not defined, then an airport will be automatically
   * selected based on the active flight plan and/or the nearest airport to the airplane's current position.
   */
  public async initAirportSelection(airport?: AirportFacility | IcaoValue): Promise<void> {
    if (!airport) {
      await this.autoInitAirportSelection();
      return;
    }

    const opId = ++this.initAirportSelectionOpId;

    const facility = ICAO.isValue(airport)
      ? await this.props.fms.facLoader.tryGetFacility(FacilityType.Airport, airport)
      : airport;

    if (opId !== this.initAirportSelectionOpId) {
      return;
    }

    if (facility) {
      this.onAirportSelected(this.waypointCache.get(facility) as AirportWaypoint, this.selectedWaypoint);
    }
  }

  /**
   * Automatically initializes this page's airport selection. The selected airport is chosen from the following
   * options, in order of decreasing priority:
   * * If a direct-to (either on-route or off-route) to an airport is active or the primary flight plan is not empty:
   *   * The departure airport loaded in the primary flight plan, if the airplane is within 30 nautical miles of it
   * **and** the airplane is not closer to the destination airport (see below) than to the departure airport.
   *   * The destination airport (either the airport that is the target of the active direct-to or the destination
   * airport loaded in the primary flight plan).
   * * The nearest airport.
   * 
   * If a selected airport cannot be chosen, then no airport selection will be made.
   */
  private async autoInitAirportSelection(): Promise<void> {
    const opId = ++this.initAirportSelectionOpId;

    let selectedAirport: AirportFacility | undefined;

    let departureAirport: AirportFacility | undefined = undefined;
    let destinationAirport: AirportFacility | undefined = undefined;

    const directToTargetIcao = this.props.fms.getDirectToTargetIcaoValue();
    const primaryFlightPlan = this.props.fms.hasPrimaryFlightPlan() ? this.props.fms.getPrimaryFlightPlan() : undefined;

    if (directToTargetIcao && ICAO.isValueFacility(directToTargetIcao, FacilityType.Airport)) {
      // We are flying direct-to an airport.
      departureAirport = this.props.flightPlanStore.originFacility.get();
      destinationAirport = await this.props.fms.facLoader.tryGetFacility(FacilityType.Airport, directToTargetIcao) ?? undefined;

      if (opId !== this.initAirportSelectionOpId) {
        return;
      }
    } else if (primaryFlightPlan && primaryFlightPlan.length > 0) {
      departureAirport = this.props.flightPlanStore.originFacility.get();
      destinationAirport = this.props.flightPlanStore.destinationFacility.get();
    }

    if (departureAirport && destinationAirport) {
      // Both the departure and destination airport are defined. We will select the destination airport if and only if
      // the airplane is more than 30 nautical miles from the departure airport or the airplane is closer to the
      // destination airport than the departure airport. If position data are not available, then select the departure
      // airport.

      const ppos = this.props.positionDataProvider.pposWithFailure.get();

      if (ppos.isValid()) {
        const distanceToDeparture = ppos.distance(departureAirport);
        if (
          UnitType.GA_RADIAN.convertTo(distanceToDeparture, UnitType.NMILE) > 30
          || distanceToDeparture > ppos.distance(destinationAirport)
        ) {
          selectedAirport = destinationAirport;
        } else {
          selectedAirport = departureAirport;
        }
      } else {
        selectedAirport = departureAirport;
      }
    } else if (departureAirport) {
      selectedAirport = departureAirport;
    } else if (destinationAirport) {
      selectedAirport = destinationAirport;
    } else {
      // Neither the departure nor destination airport is defined. We will attempt to select the nearest airport.
      selectedAirport = (await G3000NearestContext.getInstance()).getNearest(FacilityType.Airport);

      if (opId !== this.initAirportSelectionOpId) {
        return;
      }
    }

    if (selectedAirport) {
      this.onAirportSelected(this.waypointCache.get(selectedAirport) as AirportWaypoint, this.selectedWaypoint);
    }
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.displayPaneSettingManager.getSetting('displayPaneDesignatedView').value = DisplayPaneViewKeys.Charts;
    this.displayPaneSettingManager.getSetting('displayPaneView').value = DisplayPaneViewKeys.Charts;
  }

  /** @inheritDoc */
  public onResume(): void {
    // If the selected display pane view is not the charts view (this can happen if this GTC selects another pane,
    // another GTC changes the pane view, and this GTC re-selects the pane), then go back to the home page.
    if (this.displayPaneSettingManager.getSetting('displayPaneView').get() !== DisplayPaneViewKeys.Charts) {
      // Trying to manipulate the view stack in onResume() causes problems, so we will defer the operation by a frame.
      this.goToHomePageDebounce.schedule(this.props.gtcService.goBackToHomePage.bind(this.props.gtcService), 0);
    }

    this.displayPaneViewSub!.resume();

    this.airportSelection.resume();
    this.pageSelection.resume();

    this.tabContainerRef.instance.resume();

    // If an airport is not already selected, then attempt to automatically select an airport.
    if (!this.airportSelection.get()) {
      this.autoInitAirportSelection();
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    this.goToHomePageDebounce.clear();

    this.displayPaneViewSub!.pause();

    this.airportSelection.pause();
    this.pageSelection.pause();

    this.tabContainerRef.instance.pause();
  }

  /**
   * Responds to when the display pane associated with this page changes views.
   * @param viewKey The key of the new display pane view.
   */
  private onDisplayPaneViewChanged(viewKey: string): void {
    if (viewKey !== DisplayPaneViewKeys.Checklist && !this.goToHomePageDebounce.isPending()) {
      this.props.gtcService.goBackToHomePage();
    }
  }

  /**
   * Responds to when the charts airport selection for this page's display pane changes.
   * @param selection Data describing the new charts airport selection, or `null` if there is no selected airport.
   */
  private async onAirportSelectionChanged(selection: G3000ChartsAirportSelectionData | null): Promise<void> {
    const opId = ++this.airportSelectionOpId;

    if (!selection || !ICAO.isValueFacility(selection.icao, FacilityType.Airport)) {
      this.clearAirportSelection();
      return;
    }

    // Check if the currently selected airport on this page matches the chart airport selection. If so, then we don't
    // need to do anything else.
    if (
      this.loadedAirportSelection
      && ICAO.valueEquals(this.loadedAirportSelection.icao, selection.icao)
      && this.loadedAirportSelection.source === selection.source
    ) {
      this.isLoading.set(false);
      return;
    }

    const source = selection.source === null ? undefined : this.chartSources.get(selection.source);

    const airport = await this.props.fms.facLoader.tryGetFacility(FacilityType.Airport, selection.icao);

    if (opId !== this.airportSelectionOpId) {
      return;
    }

    if (!airport) {
      this.clearAirportSelection();
      return;
    }

    this.loadedAirportSelection = selection;

    if (source) {
      this.selectedWaypoint.set(this.waypointCache.get(airport) as AirportWaypoint);

      const pageDataToPageSelectionData = (pageData: G3000ChartsPageData): G3000ChartsPageSelectionData => {
        return {
          source: source.uid,
          pageData,
        };
      };

      this.infoListData.set(selection.infoPages.map(pageDataToPageSelectionData));
      this.departureListData.set(selection.departurePages.map(pageDataToPageSelectionData));
      this.arrivalListData.set(selection.arrivalPages.map(pageDataToPageSelectionData));
      this.approachListData.set(selection.approachPages.map(pageDataToPageSelectionData));

      this.showSelectedPageItem();
    } else {
      this.selectedWaypoint.set(this.waypointCache.get(airport) as AirportWaypoint);

      this.infoListData.clear();
      this.departureListData.clear();
      this.arrivalListData.clear();
      this.approachListData.clear();

      this.tabContainerRef.instance.selectTab(1);
    }

    this.isLoading.set(false);
  }

  /**
   * Clears this page's charts airport selection data.
   */
  private clearAirportSelection(): void {
    this.loadedAirportSelection = null;

    this.selectedWaypoint.set(null);
    this.infoListData.clear();
    this.departureListData.clear();
    this.arrivalListData.clear();
    this.approachListData.clear();

    this.isLoading.set(false);

    this.tabContainerRef.instance.selectTab(1);
  }

  /**
   * Responds to when the charts page selection for this page's display pane changes.
   * @param selection Data describing the new charts page selection, or `null` if there is no selected page.
   */
  private onPageSelectionChanged(selection: G3000ChartsPageSelectionData | null): void {
    const localPageSelection = this.localPageSelection.get();

    if (
      (selection === null && localPageSelection === null)
      || (
        selection
        && localPageSelection
        && selection.source === localPageSelection.source
        && selection.pageData.metadata.guid === localPageSelection.pageData.metadata.guid
        && selection.pageData.pageIndex === localPageSelection.pageData.pageIndex
      )
    ) {
      return;
    }

    this.localPageSelection.set(selection);

    this.showSelectedPageItem();
  }

  /**
   * Changes this page's selected tab to the one containing the currently selected charts page and scrolls the tab's
   * charts page list so that the selected page is visible.
   */
  private showSelectedPageItem(): void {
    if (this.localPageSelection.get()) {
      for (let i = 0; i < this.tabRefs.length; i++) {
        const tabRef = this.tabRefs[i];
        if (tabRef.instance.scrollToSelectedItem()) {
          this.tabContainerRef.instance.selectTab(i + 1);
          break;
        }
      }
    }
  }

  /**
   * Responds to when the user selects an airport using this page's airport selection button.
   * @param airport The airport waypoint that was selected.
   * @param state The state bound to the airport selection button.
   */
  private onAirportSelected(airport: AirportWaypoint, state: Subject<AirportWaypoint | null>): void {
    state.set(airport);

    if (!this.loadedAirportSelection || !ICAO.valueEquals(this.loadedAirportSelection.icao, airport.facility.get().icaoStruct)) {
      this.tabContainerRef.instance.selectTab(1);
      this.isLoading.set(true);
    }

    this.publisher.pub(`charts_select_airport_${this.displayPaneIndex}`, airport.facility.get().icaoStruct, true, false);
  }

  /**
   * Responds to when this page's Sync POF button is pressed.
   */
  private onSyncPofPressed(): void {
    this.publisher.pub(`charts_sync_pof_${this.displayPaneIndex}`, undefined, true, false);
  }

  /**
   * Responds to when this page's options button is pressed.
   */
  private onOptionsPressed(): void {
    this.props.gtcService.openPopup(GtcViewKeys.ChartsOptions);
  }

  /**
   * Responds to when the user selects a charts page from one of this page's tabs.
   * @param pageSelectionData Data describing the charts page selection that was made.
   */
  private onPageSelected(pageSelectionData: G3000ChartsPageSelectionData): void {
    this.localPageSelection.set(pageSelectionData);
    this.publisher.pub(`charts_select_page_${this.displayPaneIndex}`, pageSelectionData, true, false);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='charts-page'>
        <div class='charts-page-header'>
          <GtcWaypointSelectButton
            gtcService={this.props.gtcService}
            type={FacilitySearchType.Airport}
            waypoint={this.selectedWaypoint}
            waypointCache={this.waypointCache}
            nullIdent='––––––'
            onSelected={this.onAirportSelected.bind(this)}
            class='charts-page-select-button'
          />
          <GtcTouchButton
            label='SYNC POF'
            onPressed={this.onSyncPofPressed.bind(this)}
            class='charts-page-sync-button'
          />
          <GtcTouchButton
            label={'Charts\nOptions'}
            onPressed={this.onOptionsPressed.bind(this)}
            class='charts-page-options-button'
          />
        </div>

        <TabbedContainer
          ref={this.tabContainerRef}
          configuration={TabConfiguration.Left4}
          class='charts-page-tab-container'
        >
          {this.renderTab(1, 'Info', this.infoListData)}
          {this.renderTab(2, 'Departure', this.departureListData)}
          {this.renderTab(3, 'Arrival', this.arrivalListData)}
          {this.renderTab(4, 'Approach', this.approachListData)}
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders a tab for a charts page group.
   * @param position The position of the tab.
   * @param label The label text to display for the group.
   * @param listData The array containing the charts page data for the group.
   * @returns A tab for the specified charts page group, as a VNode.
   */
  private renderTab(position: number, label: string, listData: SubscribableArray<G3000ChartsPageSelectionData & DynamicListData>): VNode {
    const contentRef = this.tabRefs[position - 1];

    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={() => {
          this._activeComponent.set(null);
          sidebarState.set(null);
        }}
        onResume={() => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
        }}
      >
        <ChartsTab
          ref={contentRef}
          gtcService={this.props.gtcService}
          displayPaneIndex={this.displayPaneIndex}
          chartsSources={this.chartSources}
          listData={listData}
          pageSelection={this.localPageSelection}
          isLoading={this.isLoading}
          sidebarState={sidebarState}
          onPageSelected={this.onPageSelected.bind(this)}
        />
      </TabbedContent>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    // Increment airport selection operation IDs in order to force any in-progress operations to abort.
    ++this.initAirportSelectionOpId;
    ++this.airportSelectionOpId;

    this.goToHomePageDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.airportSelection.destroy();
    this.pageSelection.destroy();

    this.displayPaneViewSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChartsTab}.
 */
interface ChartsTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The index of the display pane associated with the tab's parent view. */
  displayPaneIndex: ControllableDisplayPaneIndex;

  /** A map from the IDs of all available charts sources to the sources. */
  chartsSources: ReadonlyMap<string, G3000ChartsSource>;

  /** An array containing the charts page data for the tab. */
  listData: SubscribableArray<G3000ChartsPageSelectionData & DynamicListData>;

  /** The current charts page selection. */
  pageSelection: Subscribable<G3000ChartsPageSelectionData | null>;

  /** Whether the charts page data for the tab is currently being loaded. */
  isLoading: Subscribable<boolean>;

  /** The SidebarState to use. */
  sidebarState: Subscribable<SidebarState | null>;

  /**
   * A function that is called when a charts page from the tab is selected by the user.
   * @param pageSelectionData Data describing the charts page selection that was made.
   */
  onPageSelected: (pageSelectionData: G3000ChartsPageSelectionData) => void;
}

/**
 * A tab for {@link GtcChartsPage}.
 */
class ChartsTab extends DisplayComponent<ChartsTabProps> implements GtcInteractionHandler {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();
  private readonly listSidebarState = MappedSubject.create(
    ([isLoading, sidebarState]) => isLoading ? null : sidebarState,
    this.props.isLoading,
    this.props.sidebarState
  );

  private readonly loadingBannerHidden = this.props.isLoading.map(SubscribableMapFunctions.not());

  private readonly pageCount = Subject.create(0);
  private readonly noChartsBannerHidden = MappedSubject.create(
    ([isLoading, pageCount]) => isLoading || pageCount > 0,
    this.props.isLoading,
    this.pageCount
  );

  private readonly subscriptions: Subscription[] = [
    this.listSidebarState,
    this.loadingBannerHidden,
    this.noChartsBannerHidden,
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.listData.sub((index, type, item, array) => {
        this.pageCount.set(array.length);
      }, true)
    );
  }

  /**
   * Scrolls this tab's list so that the currently selected charts page is in view. If the list does not contain the
   * currently selected charts page or if there is no selected charts page, then this method does nothing.
   * @returns Whether the list was successfully scrolled.
   */
  public scrollToSelectedItem(): boolean {
    const selection = this.props.pageSelection.get();

    if (!selection) {
      return false;
    }

    const items = this.props.listData.getArray();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        item.source === selection.source
        && item.pageData.metadata.guid === selection.pageData.metadata.guid
        && item.pageData.pageIndex === selection.pageData.pageIndex
      ) {
        this.listRef.instance.scrollToIndex(i, -1, false, true);
        return true;
      }
    }

    return false;
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return !this.props.isLoading.get() && this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Responds to when a button in this tab's list is pressed.
   * @param data The data associated with the button that was pressed.
   */
  private onButtonPressed(data: G3000ChartsPageSelectionData): void {
    this.props.onPageSelected(data);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='charts-page-tab'>
        <div class='charts-page-tab-list-box gtc-panel'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.props.listData}
            renderItem={this.renderItem.bind(this)}
            itemsPerPage={4}
            listItemHeightPx={this.props.gtcService.isHorizontal ? 132 : 70}
            listItemSpacingPx={this.props.gtcService.isHorizontal ? 2 : 0}
            maxRenderedItemCount={20}
            sidebarState={this.listSidebarState}
            class={{ 'charts-page-tab-list': true, 'hidden': this.props.isLoading }}
          />
          <div
            class={{
              'charts-page-tab-banner': true,
              'charts-page-tab-loading-banner': true,
              'hidden': this.loadingBannerHidden
            }}
          >
            Loading...
          </div>
          <div
            class={{
              'charts-page-tab-banner': true,
              'charts-page-tab-no-charts-banner': true,
              'hidden': this.noChartsBannerHidden
            }}
          >
            No Available Charts
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders a list item for a chart page selection.
   * @param data The chart page selection.
   * @returns A list item for the specified chart page selection, as a VNode.
   */
  private renderItem(data: G3000ChartsPageSelectionData): VNode {
    const isHighlighted = this.props.pageSelection.map(selection => {
      if (!selection) {
        return false;
      }

      return selection.source === data.source
        && selection.pageData.metadata.guid === data.pageData.metadata.guid
        && selection.pageData.pageIndex === data.pageData.pageIndex;
    });

    const chartName = this.props.chartsSources.get(data.source)?.getChartName(data.pageData)
      ?? data.pageData.metadata.name;

    return (
      <GtcListButton
        label={chartName}
        fullSizeButton
        onPressed={this.onButtonPressed.bind(this, data)}
        isHighlighted={isHighlighted}
        gtcOrientation={this.props.gtcService.orientation}
        onDestroy={() => { isHighlighted.destroy(); }}
        touchButtonClasses='charts-page-tab-list-button'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
