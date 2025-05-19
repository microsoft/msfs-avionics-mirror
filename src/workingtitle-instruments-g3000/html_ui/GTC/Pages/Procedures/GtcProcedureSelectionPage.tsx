import {
  AirportFacility, ChartIndex, ChartsClient, ConsumerValue, FacilityType, FlightPathCalculator, FlightPlanUtils,
  FSComponent, ICAO, LegDefinition, MappedSubject, MappedSubscribable, NodeReference, StringUtils, Subject,
  SubscribableArray, SubscribableMapFunctions, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Fms, FmsUtils, GarminFacilityWaypointCache, ProcedureType, TouchButton } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings, DisplayPanesUserSettings,
  DisplayPaneViewKeys, FlightPlanStore, G3000ChartsAirportSelectionData, G3000ChartsControlEvents, G3000ChartsEvents,
  G3000ChartsPageSelectionData, G3000ChartsSource, G3000ChartsUserSettings, G3000ChartsUtils, G3000NearestContext,
  ProcedurePreviewPaneProcData, ProcedurePreviewPaneViewEventTypes
} from '@microsoft/msfs-wtg3000-common';

import { GtcWaypointIcon } from '../../Components/GtcWaypointIcon/GtcWaypointIcon';
import { GtcList, GtcListItem } from '../../Components/List';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcListDialogParams } from '../../Dialog/GtcListDialog';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcFlightPlanDialogs } from '../FlightPlanPage/GtcFlightPlanDialogs';
import { GtcProcedurePreviewMode } from './GtcProcedurePreviewMode';

/**
 * The properties for the GtcDeparturePage component.
 */
export interface GtcProcedureSelectionPageProps extends GtcViewProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The calculator to use for generating previews. */
  calculator: FlightPathCalculator;

  /** All available charts sources. */
  chartsSources: Iterable<G3000ChartsSource>;
}

/** Base class for the 3 procedure selection pages. */
export abstract class GtcProcedureSelectionPage<P extends GtcProcedureSelectionPageProps = GtcProcedureSelectionPageProps> extends GtcView<P> {
  protected static readonly PREVIEW_MODE_TEXT = {
    [GtcProcedurePreviewMode.Off]: 'Off',
    [GtcProcedurePreviewMode.Map]: 'Show On Map',
    [GtcProcedurePreviewMode.Chart]: 'Show Chart'
  };

  protected readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<ProcedurePreviewPaneViewEventTypes>>();
  protected readonly chartPublisher = this.bus.getPublisher<G3000ChartsControlEvents>();

  protected readonly displayPaneIndex: ControllableDisplayPaneIndex;
  protected readonly displayPaneSettings: UserSettingManager<DisplayPaneSettings>;

  protected readonly fms = this.props.fms;
  protected readonly store = this.props.store;

  protected readonly selectedAirport = Subject.create<AirportFacility | undefined>(undefined);

  protected readonly canControlDisplayPane = MappedSubject.create(
    ([controlMode, displayPane]) => controlMode === this.props.controlMode && displayPane === this.displayPaneIndex,
    this.props.gtcService.activeControlMode,
    this.props.gtcService.selectedDisplayPane,
  ).pause();

  protected readonly previewMode = Subject.create(GtcProcedurePreviewMode.Off);

  protected readonly previewData = Subject.create<ProcedurePreviewPaneProcData | null>(null, (a, b) => {
    if (a === null && b === null) {
      return true;
    }

    if (a === null || b === null) {
      return false;
    }

    return a.type === b.type
      && ICAO.valueEquals(a.airportIcao, b.airportIcao)
      && a.procedureIndex === b.procedureIndex
      && a.transitionIndex === b.transitionIndex
      && a.runwayTransitionIndex === b.runwayTransitionIndex
      && a.runwayDesignation === b.runwayDesignation;
  });
  protected readonly canPreview = this.previewData.map(data => {
    if (data === null) {
      return false;
    }

    return ICAO.isValueFacility(data.airportIcao, FacilityType.Airport)
      && (data.procedureIndex >= 0 || (data.type === ProcedureType.VISUALAPPROACH && data.runwayDesignation !== ''));
  });

  protected readonly chartsSources = new Map(Array.from(this.props.chartsSources, source => [source.uid, source]));
  protected readonly selectedChartsSource: MappedSubscribable<G3000ChartsSource | undefined>;

  protected airportChartData: G3000ChartsAirportSelectionData | null = null;
  private refreshAirportChartDataOpId = 0;

  protected readonly selectedChartsPage = ConsumerValue.create<G3000ChartsPageSelectionData | null>(null, null);

  protected readonly chartPreviewData = Subject.create<G3000ChartsPageSelectionData | null>(null);
  protected readonly canPreviewChart = this.chartPreviewData.map(data => !!data);

  protected readonly listParams: Partial<GtcListDialogParams<any>> = {
    class: 'gtc-proc-pages-list-dialog',
    listItemHeightPx: this.gtcService.isHorizontal ? 132 : 71,
    listItemSpacingPx: this.gtcService.isHorizontal ? 6 : 3,
  };

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  protected nearestContext?: G3000NearestContext;

  private previewDataSub?: Subscription;
  private canPreviewSub?: Subscription;

  private chartPreviewDataSub?: Subscription;
  private canPreviewChartSub?: Subscription;

  private previewModeSub?: Subscription;

  private canControlDisplayPaneSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: P) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcProcedureSelectionPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.selectedChartsSource = G3000ChartsUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex)
      .getSetting('chartsPreferredSource')
      .map(uid => this.chartsSources.get(uid));

    G3000NearestContext.getInstance().then(instance => { this.nearestContext = instance; });
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    const refreshChartsAirportData = this.refreshAirportChartData.bind(this);
    this.selectedAirport.sub(refreshChartsAirportData);
    this.selectedChartsSource.sub(refreshChartsAirportData);

    refreshChartsAirportData();

    const sub = this.props.gtcService.bus.getSubscriber<G3000ChartsEvents>();

    this.selectedChartsPage.setConsumer(sub.on(`charts_proc_preview_page_selection_${this.displayPaneIndex}`));

    this.previewDataSub = this.previewData.sub(this.onMapPreviewDataChanged.bind(this), false, true);
    this.canPreviewSub = this.canPreview.sub(this.onCanPreviewMapChanged.bind(this), false, true);

    this.chartPreviewDataSub = this.chartPreviewData.sub(this.onChartPreviewDataChanged.bind(this), false, true);
    this.canPreviewChartSub = this.canPreviewChart.sub(this.onCanPreviewChartChanged.bind(this), false, true);

    this.previewModeSub = this.previewMode.sub(this.onPreviewModeChanged.bind(this), false, true);

    this.canControlDisplayPaneSub = this.canControlDisplayPane.sub(this.onCanControlDisplayPaneChanged.bind(this), false, true);
  }

  /** @inheritDoc */
  public onResume(): void {
    switch (this.previewMode.get()) {
      case GtcProcedurePreviewMode.Map:
        this.reconcileMapPreviewState();
        break;
      case GtcProcedurePreviewMode.Chart:
        this.reconcileChartPreviewState();
        break;
    }
  }

  /**
   * Reconciles the map preview state of this page's display pane with this page's preview state.
   */
  private reconcileMapPreviewState(): void {
    if (this.displayPaneSettings.getSetting('displayPaneView').get() !== DisplayPaneViewKeys.ProcedurePreview) {
      this.previewMode.set(GtcProcedurePreviewMode.Off);
    }
  }

  /**
   * Reconciles the chart preview state of this page's display pane with this page's preview state.
   */
  private reconcileChartPreviewState(): void {
    if (this.displayPaneSettings.getSetting('displayPaneView').get() === DisplayPaneViewKeys.ProcedurePreviewCharts) {
      const selectedChartsPageData = this.selectedChartsPage.get();
      const chartPreviewData = this.chartPreviewData.get();
      if (
        chartPreviewData
        && (!selectedChartsPageData || !G3000ChartsUtils.pageSelectionEquals(chartPreviewData, selectedChartsPageData))
      ) {
        this.sendProcedurePreviewChartData(chartPreviewData);
      }
    } else {
      this.previewMode.set(GtcProcedurePreviewMode.Off);
    }
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.canControlDisplayPane.resume();
    this.canControlDisplayPaneSub!.resume(true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.canControlDisplayPane.pause();

    this.previewMode.set(GtcProcedurePreviewMode.Off);
    this.canControlDisplayPaneSub!.pause();
    this.previewModeSub!.pause();
  }

  /**
   * Responds to when whether this page can control its display pane changes.
   * @param canControl Whether this page can control its display pane.
   */
  private onCanControlDisplayPaneChanged(canControl: boolean): void {
    if (canControl) {
      this.previewModeSub!.resume(true);
    } else {
      this.previewModeSub!.pause();
      this.canPreviewSub!.pause();
      this.previewDataSub!.pause();
      this.canPreviewChartSub!.pause();
      this.chartPreviewDataSub!.pause();
    }
  }

  /**
   * Responds to when this page's preview mode changes.
   * @param mode The new preview mode.
   */
  private onPreviewModeChanged(mode: GtcProcedurePreviewMode): void {
    const viewSetting = this.displayPaneSettings.getSetting('displayPaneView');

    switch (mode) {
      case GtcProcedurePreviewMode.Map:
        this.canPreviewChartSub!.pause();
        this.chartPreviewDataSub!.pause();
        viewSetting.set(DisplayPaneViewKeys.ProcedurePreview);
        this.canPreviewSub!.resume(true);
        break;
      case GtcProcedurePreviewMode.Chart:
        this.canPreviewSub!.pause();
        this.previewDataSub!.pause();
        viewSetting.set(DisplayPaneViewKeys.ProcedurePreviewCharts);
        this.canPreviewChartSub!.resume(true);
        break;
      default:
        this.canPreviewSub!.pause();
        this.previewDataSub!.pause();
        this.canPreviewChartSub!.pause();
        this.chartPreviewDataSub!.pause();
        viewSetting.set(this.displayPaneSettings.getSetting('displayPaneDesignatedView').get());
    }
  }

  /**
   * Responds to when whether map preview is available changes.
   * @param canPreview Whether map preview is available.
   */
  private onCanPreviewMapChanged(canPreview: boolean): void {
    if (canPreview) {
      this.previewDataSub!.resume(true);
    } else {
      this.previewDataSub!.pause();

      // This callback can only run when the preview mode is Map, so if we can't preview, then we need to revert the
      // mode back to Off.
      this.previewMode.set(GtcProcedurePreviewMode.Off);
    }
  }

  /**
   * Responds to when this page's map preview data changes.
   * @param data The new map preview data.
   */
  private onMapPreviewDataChanged(data: ProcedurePreviewPaneProcData | null): void {
    if (data !== null) {
      this.sendProcedurePreviewData(data);
    }
  }

  /**
   * Responds to when whether chart preview is available changes.
   * @param canPreview Whether chart preview is available.
   */
  private onCanPreviewChartChanged(canPreview: boolean): void {
    if (canPreview) {
      this.chartPreviewDataSub!.resume(true);
    } else {
      this.chartPreviewDataSub!.pause();

      // This callback can only run when the preview mode is Chart, so if we can't preview, then we need to revert the
      // mode back to Off.
      this.previewMode.set(GtcProcedurePreviewMode.Off);
    }
  }

  /**
   * Responds to when this page's chart preview data changes.
   * @param data The new chart preview data.
   */
  private onChartPreviewDataChanged(data: G3000ChartsPageSelectionData | null): void {
    if (data !== null) {
      this.sendProcedurePreviewChartData(data);
    }
  }

  /**
   * Sends procedure preview data to the display pane controlled by this page.
   * @param data The data to send.
   */
  protected sendProcedurePreviewData(data: ProcedurePreviewPaneProcData): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_procedure_preview_set',
      eventData: data
    }, true, false);
  }

  /**
   * Sends a command to select a procedure preview chart page.
   * @param data Data describing the chart page to select.
   */
  protected sendProcedurePreviewChartData(data: G3000ChartsPageSelectionData): void {
    this.chartPublisher.pub(`charts_proc_preview_select_page_${this.displayPaneIndex}`, data, true, false);
  }

  /**
   * Refreshes this page's airport chart data.
   */
  private async refreshAirportChartData(): Promise<void> {
    const opId = ++this.refreshAirportChartDataOpId;

    const selectedAirport = this.selectedAirport.get();
    const chartsSource = this.selectedChartsSource.get();

    if (!selectedAirport || !chartsSource) {
      if (this.airportChartData !== null) {
        this.airportChartData = null;
        this.onAirportChartDataRefreshed(this.airportChartData);
      }
      return;
    }

    try {
      if (
        !this.airportChartData
        || this.airportChartData.source !== chartsSource.uid
        || !ICAO.valueEquals(this.airportChartData.icao, selectedAirport.icaoStruct)
      ) {
        const chartIndex = await ChartsClient.getIndexForAirport(selectedAirport.icaoStruct, chartsSource.provider);

        if (opId !== this.refreshAirportChartDataOpId) {
          return;
        }

        const data = await this.createAirportChartData(selectedAirport, chartsSource, chartIndex);

        if (opId !== this.refreshAirportChartDataOpId) {
          return;
        }

        this.airportChartData = data;
        this.onAirportChartDataRefreshed(this.airportChartData);
      }
    } catch {
      if (opId !== this.refreshAirportChartDataOpId) {
        return;
      }

      if (this.airportChartData !== null) {
        this.airportChartData = null;
        this.onAirportChartDataRefreshed(this.airportChartData);
      }
    }
  }

  /**
   * Creates an airport chart data object for this page.
   * @param selectedAirport The selected airport.
   * @param chartsSource The charts source to use to retrieve chart data.
   * @param chartIndex The chart index for the selected airport.
   */
  protected abstract createAirportChartData(
    selectedAirport: AirportFacility,
    chartsSource: G3000ChartsSource,
    chartIndex: ChartIndex<string>
  ): Promise<G3000ChartsAirportSelectionData>;

  /**
   * Responds to when this page's airport chart data are refreshed.
   * @param data The new airport chart data.
   */
  protected abstract onAirportChartDataRefreshed(data: G3000ChartsAirportSelectionData | null): void;

  /**
   * Renders the airport select button.
   * @param onAirportSelected Airport selected handler.
   * @returns The airport button.
   */
  protected renderAirportButton(onAirportSelected: () => void): VNode {
    return (
      <TouchButton
        class="airport proc-page-big-button"
        onPressed={async (): Promise<void> => {
          const airport = this.selectedAirport.get();
          const result = await GtcFlightPlanDialogs.openAirportDialog(this.gtcService, airport);
          if (!result.wasCancelled) {
            this.selectedAirport.set(result.payload);
            onAirportSelected();
          }
        }}
      >
        <div class="top-label">Airport</div>
        <div class="mid-label">{this.selectedAirport.map(x => x?.icao ? StringUtils.useZeroSlash(ICAO.getIdent(x.icao)) : '–––––')}</div>
        {/* // TODO Bottom label changes size depending on how long the text is */}
        <div class="bottom-label">{this.selectedAirport.map(x => x ? Utils.Translate(x.name) : '–––––')}</div>
        <GtcWaypointIcon class="label-icon" waypoint={this.selectedAirport.map(x => x ? this.waypointCache.get(x) : null)} />
      </TouchButton>
    );
  }

  /**
   * Renders the preview button.
   * @returns The preview button.
   */
  protected renderPreviewButton(): VNode {
    return (
      <GtcListSelectTouchButton
        label="Preview"
        class="preview-button"
        occlusionType="hide"
        gtcService={this.props.gtcService}
        listDialogKey={GtcViewKeys.ListDialog1}
        state={this.previewMode}
        isEnabled={MappedSubject.create(
          SubscribableMapFunctions.or(),
          this.canPreview,
          this.canPreviewChart
        )}
        renderValue={value => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[value]}
        listParams={this.generatePreviewModeListParams.bind(this)}
      />
    );
  }

  /**
   * Generates list parameters for a preview mode selection dialog based on this page's current preview state.
   * @returns List parameters for a preview mode selection dialog based on this page's current preview state.
   */
  private generatePreviewModeListParams(): GtcListDialogParams<GtcProcedurePreviewMode> {
    const inputData = [
      {
        value: GtcProcedurePreviewMode.Off,
        labelRenderer: () => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[GtcProcedurePreviewMode.Off],
      }
    ];

    if (this.canPreview.get()) {
      inputData.push(
        {
          value: GtcProcedurePreviewMode.Map,
          labelRenderer: () => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[GtcProcedurePreviewMode.Map],
        }
      );
    }

    if (this.canPreviewChart.get()) {
      inputData.push(
        {
          value: GtcProcedurePreviewMode.Chart,
          labelRenderer: () => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[GtcProcedurePreviewMode.Chart],
        }
      );
    }

    return {
      title: 'Select Preview',
      inputData,
      selectedValue: this.previewMode,
      ...this.listParams,
    };
  }

  /**
   * Renders the sequence box.
   * @param listRef The list ref.
   * @param sidebarState The sidebar state for the view.
   * @param sequence The sequence.
   * @returns The rendered sequence box.
   */
  protected renderSequenceBox(
    listRef: NodeReference<GtcList<any>>,
    sidebarState: SidebarState,
    sequence: SubscribableArray<LegDefinition>,
  ): VNode {
    return (
      <div class="sequence-box gtc-panel">
        <div class="gtc-panel-title">
          Sequence
        </div>
        <GtcList<any>
          ref={listRef}
          bus={this.gtcService.bus}
          sidebarState={sidebarState}
          itemsPerPage={10}
          listItemHeightPx={this.gtcService.isHorizontal ? 43 : 23}
          listItemSpacingPx={this.gtcService.isHorizontal ? 1 : 1}
          data={sequence}
          renderItem={this.renderLeg}
        />
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
        <GtcListItem hideBorder class='sequence-item'>
          {legName?.replace(/FT/, '')}<span style="font-size: 0.75em;">FT</span>
        </GtcListItem>
      );
    } else {
      return (
        <GtcListItem hideBorder class='sequence-item'>
          {legName} {FmsUtils.getSequenceLegFixTypeSuffix(leg, false)}
        </GtcListItem>
      );
    }
  };
}
