import {
  FacilityType, FSComponent, ICAO, IcaoValue, NodeReference, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { G3XChartsSelectionManager } from '../../../Shared/Charts/G3XChartsSelectionManager';
import { G3XChartsAirportSelectionData, G3XChartsPageSelectionData } from '../../../Shared/Charts/G3XChartsTypes';
import { G3XChartsUtils } from '../../../Shared/Charts/G3XChartsUtils';
import { AbstractTabbedContent } from '../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../Shared/Components/TabbedContainer/TabbedContent';
import { UiFocusController } from '../../../Shared/UiSystem/UiFocusController';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';
import { UiListSelectTouchButton } from '../TouchButton/UiListSelectTouchButton';

import './AirportChartsTab.css';

/**
 * Component props for {@link AirportChartsTab}.
 */
export interface AirportChartsTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** A reference to the root element of the container of the tab's parent UI view. */
  containerRef: NodeReference<HTMLElement>;

  /** Information on the waypoint to display. */
  waypointInfo: WaypointInfoStore;

  /** A provider of airplane position and heading data. */
  chartsSelectionManager: G3XChartsSelectionManager;

  /** A function which is called when the tab is selected to be displayed in its parent container. */
  onSelect?: () => void;

  /** A function which is called when the tab is deselected. */
  onDeselect?: () => void;
}

/**
 * An airport terminal procedures charts tab.
 */
export class AirportChartsTab extends AbstractTabbedContent<AirportChartsTabProps> {
  private readonly buttonRef = FSComponent.createRef<UiListSelectTouchButton<any>>();

  private readonly displayedAirportIcao = this.props.waypointInfo.facility.map(facility => {
    if (facility && ICAO.isValueFacility(facility.icaoStruct, FacilityType.Airport)) {
      return facility.icaoStruct;
    } else {
      return ICAO.emptyValue();
    }
  }, ICAO.valueEquals).pause();

  private readonly chartsPageListData = Subject.create<readonly G3XChartsPageSelectionData[]>([]);
  private readonly hasCharts = this.chartsPageListData.map(data => data.length > 0);

  private readonly selectListItemHeightPx = this.props.uiService.gduFormat === '460' ? 70 : 35;
  private readonly selectListItemSpacingPx = this.props.uiService.gduFormat === '460' ? 4 : 2;

  private readonly selectedChartsPageData = Subject.create<G3XChartsPageSelectionData | null>(null);

  private readonly focusController = new UiFocusController();

  private readonly subscriptions: Subscription[] = [
    this.displayedAirportIcao
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.focusController.setActive(true);

    this.displayedAirportIcao.sub(this.onDisplayedAirportIcaoChanged.bind(this), true);

    this.subscriptions.push(
      this.props.chartsSelectionManager.selectedAirportData.sub(this.onSelectedAirportChanged.bind(this), false, true),
      this.props.chartsSelectionManager.selectedPageData.pipe(this.selectedChartsPageData, true)
    );
  }

  /** @inheritDoc */
  public onSelect(): void {
    this.props.onSelect && this.props.onSelect();
  }

  /** @inheritDoc */
  public onDeselect(): void {
    this.props.onDeselect && this.props.onDeselect();
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }

    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when the ICAO of the displayed airport changes.
   * @param icao The ICAO of the new displayed airport.
   */
  private onDisplayedAirportIcaoChanged(icao: IcaoValue): void {
    if (!ICAO.isValueFacility(icao, FacilityType.Airport)) {
      this.props.chartsSelectionManager.reset();
    } else {
      this.props.chartsSelectionManager.selectAirport(icao, true);
    }
  }

  /**
   * Responds to when the charts airport selection changes.
   * @param selection The new airport selection.
   */
  private onSelectedAirportChanged(selection: G3XChartsAirportSelectionData | null): void {
    let pageListData: G3XChartsPageSelectionData[];

    if (selection && selection.source !== null) {
      pageListData = [
        ...selection.airportDiagramPages,
        ...selection.approachPages,
        ...selection.arrivalPages,
        ...selection.departurePages,
        ...selection.infoPages,
      ].map(pageData => {
        return {
          source: selection.source!,
          pageData
        };
      });
    } else {
      pageListData = [];
    }

    this.chartsPageListData.set(pageListData);

    if (pageListData.length > 0) {
      this._knobLabelState.setValue(UiKnobId.SingleInnerPush, 'Chart');
      this._knobLabelState.setValue(UiKnobId.LeftInnerPush, 'Chart');
      this._knobLabelState.setValue(UiKnobId.RightInnerPush, 'Chart');

      this.focusController.setFocusIndex(0);
    } else {
      this._knobLabelState.delete(UiKnobId.SingleInnerPush);
      this._knobLabelState.delete(UiKnobId.LeftInnerPush);
      this._knobLabelState.delete(UiKnobId.RightInnerPush);

      this.focusController.removeFocus();
    }
  }

  /**
   * Responds to when a user selects a charts page.
   * @param selection The selected charts page.
   */
  private onChartsPageSelected(selection: G3XChartsPageSelectionData | null): void {
    if (!selection) {
      return;
    }

    this.props.chartsSelectionManager.selectPage(selection);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='airport-charts-tab'>
        <UiListSelectTouchButton
          ref={this.buttonRef}
          uiService={this.props.uiService}
          listDialogLayer={UiViewStackLayer.Overlay}
          listDialogKey={UiViewKeys.ListDialog1}
          containerRef={this.props.containerRef}
          openDialogAsPositioned
          isEnabled={this.hasCharts}
          state={this.selectedChartsPageData}
          renderValue={this.renderChartPageLabel.bind(this)}
          listParams={this.generatePageListParams.bind(this)}
          onSelected={this.onChartsPageSelected.bind(this)}
          focusController={this.focusController}
          class='airport-charts-tab-chart-select-button'
        />
      </div>
    );
  }

  /**
   * Renders label text for a selected chart page.
   * @param selection The selected chart page for which to render label text.
   * @returns The label text of the specified selected chart page.
   */
  private renderChartPageLabel(selection: G3XChartsPageSelectionData | null): string {
    if (!selection) {
      return 'NONE';
    }

    const source = this.props.chartsSelectionManager.chartsSources.get(selection.source);

    if (source) {
      return source.getChartName(selection.pageData);
    } else {
      return selection.pageData.metadata.name;
    }
  }

  /**
   * Generates a set of selection list dialog parameters for the user to select a chart page for the currently
   * displayed airport.
   * @param state The state bound to the chart selection button.
   * @param button The chart selection button.
   * @returns A set of selection list dialog parameters for the user to select a chart page for the currently displayed
   * airport.
   */
  private generatePageListParams(
    state: Subject<G3XChartsPageSelectionData | null>,
    button: UiListSelectTouchButton<Subject<G3XChartsPageSelectionData | null>>
  ): UiListDialogParams<G3XChartsPageSelectionData | null> {
    const pageListData = this.chartsPageListData.get();

    if (pageListData.length === 0) {
      return {
        inputData: []
      };
    }

    const selectedPageData = this.selectedChartsPageData.get();
    const selectedValue = selectedPageData
      ? pageListData.find(value => G3XChartsUtils.pageSelectionEquals(value, selectedPageData))
      : undefined;

    return {
      selectedValue,
      inputData: pageListData.map(pageData => {
        return {
          value: pageData,
          labelRenderer: this.renderChartPageLabel.bind(this, pageData)
        };
      }),
      dialogWidth: button.getRootElement().offsetWidth,
      listItemHeightPx: this.selectListItemHeightPx,
      listItemSpacingPx: this.selectListItemSpacingPx,
      itemsPerPage: Math.min(7, pageListData.length),
      autoDisableOverscroll: true,
      class: 'airport-charts-tab-select-dialog'
    };
  }

  /** @inheritDoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
