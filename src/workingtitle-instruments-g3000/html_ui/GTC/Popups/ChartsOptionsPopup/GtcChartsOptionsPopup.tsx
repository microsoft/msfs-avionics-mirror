import {
  ConsumerSubject, DebounceTimer, FSComponent, MappedSubject, MappedSubscribable, Subject, Subscription,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  ChartsPaneViewEventTypes, ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings,
  DisplayPanesUserSettings, DisplayPaneViewKeys, G3000ChartsControlEvents, G3000ChartsEvents,
  G3000ChartsLightModeSettingMode, G3000ChartsPageSelectionData, G3000ChartsSource,
  G3000ChartsSourcePageSectionDefinition, G3000ChartsSourceStatus, G3000ChartsUserSettings,
  G3000ChartsUserSettingTypes, G3000FilePaths, GtcViewKeys
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcChartsAutoLightThresholdPopup } from './GtcChartsAutoLightThresholdPopup';

import './GtcChartsOptionsPopup.css';

/**
 * Component props for {@link GtcChartsOptionsPopup}.
 */
export interface GtcChartsOptionsPopupProps extends GtcViewProps {
  /** All available charts sources. */
  chartsSources: Iterable<G3000ChartsSource>;
}

/**
 * GTC view keys for popups owned by the electronic charts options popup.
 */
enum GtcChartsOptionsPopupPopupKeys {
  AutoLightThreshold = 'ChartsOptionsAutoLightThreshold'
}

/**
 * A GTC electronic charts options popup.
 */
export class GtcChartsOptionsPopup extends GtcView<GtcChartsOptionsPopupProps> {
  private thisNode?: VNode;

  private readonly chartsPublisher = this.props.gtcService.bus.getPublisher<G3000ChartsControlEvents>();
  private readonly displayPanePublisher = this.props.gtcService.bus.getPublisher<DisplayPaneControlEvents<ChartsPaneViewEventTypes>>();

  private readonly chartsSources = new Map(Array.from(this.props.chartsSources, source => [source.uid, source]));

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;

  private readonly chartsSettingManager: UserSettingManager<G3000ChartsUserSettingTypes>;
  private readonly selectedChartsSource: MappedSubscribable<G3000ChartsSource | undefined>;

  private readonly isNightModeSupported: MappedSubscribable<boolean>;
  private readonly lightModeState = Subject.create(G3000ChartsLightModeSettingMode.Day);
  private readonly lightThresholdState: MappedSubscribable<number>;

  private readonly pageSelection = ConsumerSubject.create<G3000ChartsPageSelectionData | null>(null, null).pause();
  private readonly pageSection = ConsumerSubject.create(null, '').pause();

  private readonly pageSectionButtonsContainerRef = FSComponent.createRef<HTMLDivElement>();
  private pageSectionButtonsNode?: VNode;

  private readonly showSections: MappedSubscribable<boolean>;

  private readonly chartsSourcesListRef = FSComponent.createRef<GtcList<any>>();

  private readonly goBackDebounce = new DebounceTimer();

  private readonly subscriptions: Subscription[] = [
    this.pageSelection,
    this.pageSection,
  ];

  private displayPaneViewSub?: Subscription;
  private selectedChartsSourceSub?: Subscription;
  private lightModeSettingPipe?: Subscription;
  private isNightModeSupportedSub?: Subscription;

  /**
   * Creates a new instance of GtcChartsOptionsPopup.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcChartsOptionsPopupProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcChartsOptionsPopup: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.chartsSettingManager = G3000ChartsUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
    this.selectedChartsSource = this.chartsSettingManager.getSetting('chartsPreferredSource')
      .map(uid => this.chartsSources.get(uid))
      .pause();

    this.isNightModeSupported = this.selectedChartsSource.map(source => !!source && source.supportsNightMode);
    this.lightThresholdState = MappedSubject.create(
      ([isNightModeSupported, threshold]) => isNightModeSupported ? threshold : 100,
      this.isNightModeSupported,
      this.chartsSettingManager.getSetting('chartsLightThreshold')
    ).pause();

    this.showSections = this.selectedChartsSource.map(source => !!source && source.pageSectionDefinitions.length > 0);

    this.subscriptions.push(
      this.selectedChartsSource,
      this.lightThresholdState
    );
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Charts Options');

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcChartsOptionsPopupPopupKeys.AutoLightThreshold,
      this.props.controlMode,
      this.renderAutoLightThresholdPopup.bind(this),
      this.props.displayPaneIndex
    );

    this.displayPaneViewSub = this.displayPaneSettingManager.getSetting('displayPaneView').sub(this.onDisplayPaneViewChanged.bind(this), false, true);

    this.isNightModeSupportedSub = this.isNightModeSupported.sub(this.onIsNightModeSupportedChanged.bind(this), false, true);

    this.subscriptions.push(
      this.selectedChartsSourceSub = this.selectedChartsSource.sub(this.onSelectedChartsSourceChanged.bind(this), false, true),
      this.lightModeSettingPipe = this.chartsSettingManager.getSetting('chartsLightMode').pipe(this.lightModeState, true)
    );
  }

  /** @inheritDoc */
  public onResume(): void {
    // If the selected display pane view is not a charts view (this can happen if this GTC selects another pane,
    // another GTC changes the pane view, and this GTC re-selects the pane), then close this popup.
    const displayPaneViewKey = this.displayPaneSettingManager.getSetting('displayPaneView').get();
    if (
      displayPaneViewKey !== DisplayPaneViewKeys.Charts
      && displayPaneViewKey !== DisplayPaneViewKeys.ProcedurePreviewCharts
    ) {
      // Trying to manipulate the view stack in onResume() causes problems, so we will defer the operation by a frame.
      this.goBackDebounce.schedule(this.props.gtcService.goBack.bind(this.props.gtcService), 0);
    }

    this.selectedChartsSource.resume();
    this.lightThresholdState.resume();
    this.pageSelection.resume();
    this.pageSection.resume();

    this.displayPaneViewSub!.resume(true);
    this.selectedChartsSourceSub!.resume(true);
    this.isNightModeSupportedSub!.resume(true);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.goBackDebounce.clear();

    this.selectedChartsSource.pause();
    this.lightThresholdState.pause();
    this.pageSelection.pause();
    this.pageSection.pause();

    this.displayPaneViewSub!.pause();
    this.selectedChartsSourceSub!.pause();
    this.isNightModeSupportedSub!.pause();
    this.lightModeSettingPipe!.pause();
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.chartsSourcesListRef.getOrDefault()?.scrollToIndex(0, 0, false);
  }

  /**
   * Responds to when the active display pane view on this popup's display pane changes.
   * @param viewKey The key of the new active display pane view.
   */
  private onDisplayPaneViewChanged(viewKey: string): void {
    const sub = this.props.gtcService.bus.getSubscriber<G3000ChartsEvents>();

    switch (viewKey) {
      case DisplayPaneViewKeys.Charts:
        this.pageSelection.setConsumer(sub.on(`charts_page_selection_${this.displayPaneIndex}`));
        this.pageSection.setConsumer(sub.on(`charts_page_section_${this.displayPaneIndex}`));
        break;
      case DisplayPaneViewKeys.ProcedurePreviewCharts:
        this.pageSelection.setConsumer(sub.on(`charts_proc_preview_page_selection_${this.displayPaneIndex}`));
        this.pageSection.setConsumer(sub.on(`charts_proc_preview_page_section_${this.displayPaneIndex}`));
        break;
      default:
        this.pageSelection.reset(null);
        this.pageSection.reset('');
    }
  }

  /**
   * Responds to when the selected charts source changes.
   * @param source The new charts source, or `undefined` if no charts source is selected.
   */
  private onSelectedChartsSourceChanged(source: G3000ChartsSource | undefined): void {
    // Remove and destroy all existing buttons.
    this.pageSectionButtonsNode && FSComponent.shallowDestroy(this.pageSectionButtonsNode);
    this.pageSectionButtonsContainerRef.instance.innerHTML = '';

    if (source && source.pageSectionDefinitions.length > 0) {
      this.pageSectionButtonsNode = (
        <>
          {source.pageSectionDefinitions.slice(0, 4).map(this.renderPageSectionButton.bind(this, source))}
        </>
      );

      FSComponent.render(this.pageSectionButtonsNode as VNode, this.pageSectionButtonsContainerRef.instance);
    } else {
      this.pageSectionButtonsNode = undefined;
    }
  }

  /**
   * Responds to when whether the currently selected charts source supports night mode charts changes.
   * @param isSupported Whether the currently selected charts source supports night mode charts.
   */
  private onIsNightModeSupportedChanged(isSupported: boolean): void {
    if (isSupported) {
      this.lightModeSettingPipe!.resume(true);
    } else {
      this.lightModeSettingPipe!.pause();
      this.lightModeState.set(G3000ChartsLightModeSettingMode.Day);
    }
  }

  /**
   * Renders a charts page section button.
   * @param source The charts source that defines the section associated with the button.
   * @param definition The definition describing the section associated with the button.
   * @returns A charts page section button, as a VNode.
   */
  private renderPageSectionButton(source: G3000ChartsSource, definition: G3000ChartsSourcePageSectionDefinition): VNode {
    const state = this.pageSection.map(section => section === definition.uid);
    const isEnabled = this.pageSelection.map(selection => {
      return selection !== null
        && selection.source === source.uid
        && definition.getArea(selection.pageData) !== undefined;
    });

    return (
      <GtcToggleTouchButton
        state={state}
        label={definition.name}
        isEnabled={isEnabled}
        onPressed={this.onSectionButtonPressed.bind(this, definition.uid)}
        onDestroy={() => {
          isEnabled.destroy();
          state.destroy();
        }}
      />
    );
  }

  /**
   * Responds to when one of this popup's section buttons is pressed.
   * @param section The ID of the section associated with the button that was pressed, or the empty string for the
   * 'All' button.
   */
  private onSectionButtonPressed(section: string): void {
    switch (this.displayPaneSettingManager.getSetting('displayPaneView').get()) {
      case DisplayPaneViewKeys.Charts:
        this.chartsPublisher.pub(`charts_set_page_section_${this.displayPaneIndex}`, section, true, false);
        break;
      case DisplayPaneViewKeys.ProcedurePreviewCharts:
        this.chartsPublisher.pub(`charts_proc_preview_set_page_section_${this.displayPaneIndex}`, section, true, false);
        break;
    }
  }

  /**
   * Responds to when this popup's Fit Width button is pressed.
   */
  private onFitWidthButtonPressed(): void {
    this.displayPanePublisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_charts_fit_width',
      eventData: undefined
    }, true, false);
  }

  /**
   * Responds to when a user selects a light mode setting value.
   * @param mode The selected light mode setting value.
   */
  private onLightModeSelected(mode: G3000ChartsLightModeSettingMode): void {
    this.chartsSettingManager.getSetting('chartsLightMode').set(mode);
  }

  /**
   * Responds to when this popup's Light Threshold button is pressed.
   */
  private onThresholdButtonPressed(): void {
    this.props.gtcService.openPopup(GtcChartsOptionsPopupPopupKeys.AutoLightThreshold);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{
          'charts-options-popup': true,
          'gtc-popup-panel': true,
          'charts-options-popup-show-sections': this.showSections,
        }}
      >
        <div class='charts-options-popup-top'>
          <div class='charts-options-popup-top-left'>
            <GtcTouchButton
              label='Fit Width'
              onPressed={this.onFitWidthButtonPressed.bind(this)}
              class='charts-options-popup-fit-width-button'
            />
            <GtcListSelectTouchButton
              gtcService={this.props.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              isEnabled={this.isNightModeSupported}
              state={this.lightModeState}
              label='Light Mode'
              renderValue={value => {
                switch (value) {
                  case G3000ChartsLightModeSettingMode.Night:
                    return 'Night';
                  case G3000ChartsLightModeSettingMode.Day:
                    return 'Day';
                  case G3000ChartsLightModeSettingMode.Auto:
                    return 'Auto';
                  default:
                    return '';
                }
              }}
              listParams={{
                inputData: [
                  {
                    value: G3000ChartsLightModeSettingMode.Night,
                    labelRenderer: () => 'Night'
                  },
                  {
                    value: G3000ChartsLightModeSettingMode.Day,
                    labelRenderer: () => 'Day'
                  },
                  {
                    value: G3000ChartsLightModeSettingMode.Auto,
                    labelRenderer: () => 'Auto'
                  },
                ],
                selectedValue: this.chartsSettingManager.getSetting('chartsLightMode')
              }}
              onSelected={this.onLightModeSelected.bind(this)}
            />
            <GtcValueTouchButton
              isEnabled={this.lightModeState.map(mode => mode === G3000ChartsLightModeSettingMode.Auto)}
              state={this.lightThresholdState}
              label='Threshold'
              renderValue={value => `${value.toFixed(0)}%`}
              onPressed={this.onThresholdButtonPressed.bind(this)}
            />
          </div>
          <div class='charts-options-popup-top-sections gtc-panel'>
            <div class='charts-options-popup-top-sections-title'>Sections</div>
            <GtcToggleTouchButton
              state={this.pageSection.map(section => section === '')}
              label='All'
              onPressed={this.onSectionButtonPressed.bind(this, '')}
            />
            <div ref={this.pageSectionButtonsContainerRef} class='charts-options-popup-top-sections-buttons-container'>
            </div>
          </div>
        </div>
        {this.chartsSources.size > 0 && (
          <div class='charts-options-popup-sources-box gtc-panel'>
            <GtcListSelectTouchButton
              gtcService={this.props.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              state={this.chartsSettingManager.getSetting('chartsPreferredSource')}
              label={'Preferred\nSource'}
              renderValue={value => this.chartsSources.get(value)?.name ?? 'None'}
              listParams={{
                title: 'Select Preferred Chart Feature',
                inputData: Array.from(this.props.chartsSources, source => {
                  return {
                    value: source.uid,
                    labelRenderer: () => source.name
                  };
                }),
                selectedValue: this.chartsSettingManager.getSetting('chartsPreferredSource')
              }}
              class='charts-options-popup-preferred-source-button'
            />
            <div class='charts-options-popup-sources-status'>
              <div class='charts-options-popup-sources-status-title'>Charts Status</div>
              <GtcList
                ref={this.chartsSourcesListRef}
                bus={this.props.gtcService.bus}
                itemsPerPage={2}
                listItemHeightPx={this.props.gtcService.isHorizontal ? 50 : 30}
                listItemSpacingPx={this.props.gtcService.isHorizontal ? 2 : 1}
                maxRenderedItemCount={10}
                class='charts-options-popup-sources-list'
              >
                {Array.from(this.props.chartsSources, this.renderChartsSourceListItem.bind(this))}
              </GtcList>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Renders a list item for a charts source.
   * @param source The charts source for which to render the item.
   * @returns A list item for the specified charts source, as a VNode.
   */
  private renderChartsSourceListItem(source: G3000ChartsSource): VNode {
    const iconSrc = source.status.map(GtcChartsOptionsPopup.sourceStatusToIconSrc);

    this.subscriptions.push(iconSrc);

    return (
      <div class='charts-options-popup-sources-list-item'>
        <div class='charts-options-popup-sources-list-item-title'>{source.name}</div>
        <img src={iconSrc} class='charts-options-popup-sources-list-item-icon' />
      </div>
    );
  }

  /**
   * Renders this popup's auto light mode threshold popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This popup's auto light mode threshold popup, as a VNode.
   */
  private renderAutoLightThresholdPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: number): VNode {
    return (
      <GtcChartsAutoLightThresholdPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.goBackDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    this.pageSectionButtonsNode && FSComponent.shallowDestroy(this.pageSectionButtonsNode);

    super.destroy();
  }

  /**
   * Maps a charts source status to an icon image asset path.
   * @param status The charts source status to map.
   * @returns The image asset path of the icon associated with the specified charts source.
   */
  private static sourceStatusToIconSrc(status: G3000ChartsSourceStatus): string {
    switch (status) {
      case G3000ChartsSourceStatus.Ready:
        return `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_lru_status_ok.png`;
      case G3000ChartsSourceStatus.Expired:
        return `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_status_yellow_check_small.png`;
      case G3000ChartsSourceStatus.Failed:
        return `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_lru_status_fail.png`;
      case G3000ChartsSourceStatus.Unavailable:
        return `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_lru_status_off.png`;
      default:
        return `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_lru_status_unknown.png`;
    }
  }
}
