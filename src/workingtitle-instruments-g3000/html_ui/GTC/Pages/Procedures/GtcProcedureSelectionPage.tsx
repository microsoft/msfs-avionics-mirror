import {
  AirportFacility, FacilityType, FlightPathCalculator, FlightPlanUtils, FSComponent, ICAO, LegDefinition, NodeReference, StringUtils, Subject,
  SubscribableArray, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Fms, FmsUtils, GarminFacilityWaypointCache, ProcedureType, TouchButton } from '@microsoft/msfs-garminsdk';
import {
  ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings, DisplayPanesUserSettings,
  DisplayPaneViewKeys, G3000NearestContext, FlightPlanStore,
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
}

/** Base class for the 3 procedure selection pages. */
export abstract class GtcProcedureSelectionPage<P extends GtcProcedureSelectionPageProps = GtcProcedureSelectionPageProps> extends GtcView<P> {
  protected static readonly PREVIEW_MODE_TEXT = {
    [GtcProcedurePreviewMode.Off]: 'Off',
    [GtcProcedurePreviewMode.Map]: 'Show On Map',
    [GtcProcedurePreviewMode.Chart]: 'Show On Chart'
  };

  protected readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<ProcedurePreviewPaneViewEventTypes>>();

  protected readonly displayPaneIndex: ControllableDisplayPaneIndex;
  protected readonly displayPaneSettings: UserSettingManager<DisplayPaneSettings>;

  protected readonly fms = this.props.fms;
  protected readonly store = this.props.store;

  protected readonly selectedAirport = Subject.create<AirportFacility | undefined>(undefined);

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

  protected readonly listParams: Partial<GtcListDialogParams<any>> = {
    class: 'gtc-proc-pages-list-dialog',
    listItemHeightPx: this.gtcService.isHorizontal ? 132 : 71,
    listItemSpacingPx: this.gtcService.isHorizontal ? 6 : 3,
  };

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  protected nearestContext?: G3000NearestContext;

  private previewModeSub?: Subscription;

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

    G3000NearestContext.getInstance().then(instance => { this.nearestContext = instance; });
  }

  /** @inheritdoc */
  public override onAfterRender(): void {
    const previewDataSub = this.previewData.sub(data => {
      if (data !== null) {
        this.sendProcedurePreviewData(data);
      }
    }, false, true);

    const canPreviewSub = this.canPreview.sub(canPreview => {
      if (canPreview) {
        previewDataSub.resume(true);
      } else {
        previewDataSub.pause();
        this.previewMode.set(GtcProcedurePreviewMode.Off);
      }
    }, false, true);

    this.previewModeSub = this.previewMode.sub(mode => {
      const viewSetting = this.displayPaneSettings.getSetting('displayPaneView');

      switch (mode) {
        case GtcProcedurePreviewMode.Map:
          viewSetting.value = DisplayPaneViewKeys.ProcedurePreview;
          canPreviewSub.resume(true);
          break;
        default:
          canPreviewSub.pause();
          previewDataSub.pause();
          viewSetting.value = this.displayPaneSettings.getSetting('displayPaneDesignatedView').value;
      }
    }, false, true);
  }

  /** @inheritdoc */
  public override onOpen(): void {
    this.previewModeSub?.resume(true);
  }

  /** @inheritdoc */
  public override onClose(): void {
    this.previewMode.set(GtcProcedurePreviewMode.Off);
    this.previewModeSub?.pause();
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
        isEnabled={this.canPreview}
        renderValue={value => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[value]}
        listParams={{
          title: 'Select Preview',
          inputData: [{
            value: GtcProcedurePreviewMode.Off,
            labelRenderer: () => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[GtcProcedurePreviewMode.Off],
          }, {
            value: GtcProcedurePreviewMode.Map,
            labelRenderer: () => GtcProcedureSelectionPage.PREVIEW_MODE_TEXT[GtcProcedurePreviewMode.Map],
          }],
          selectedValue: this.previewMode,
          ...this.listParams,
        }}
      />
    );
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
