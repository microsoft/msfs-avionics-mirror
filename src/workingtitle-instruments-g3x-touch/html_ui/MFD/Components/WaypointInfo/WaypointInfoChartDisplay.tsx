import {
  BitFlags, ComponentProps, DisplayComponent, FilteredMapSubject, FSComponent, MappedSubject, MutableSubscribable,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableMap, Subscription, UserSettingManager, Vec2Math,
  Vec2Subject, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminChartAirplaneIconLayer, GarminChartAirplaneIconStatus, GarminChartDisplay, GarminChartDisplayChartStatus,
  GarminChartDisplaySelection, TouchButton, TouchButtonOnTouchedAction, TouchPad
} from '@microsoft/msfs-garminsdk';

import { G3XChartsConfig } from '../../../Shared/Charts/G3XChartsConfig';
import { G3XChartsDisplayColorMode } from '../../../Shared/Charts/G3XChartsTypes';
import { G3XLoadingIcon } from '../../../Shared/Components/Common/G3XLoadingIcon';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { UiInteractionEvent, UiInteractionHandler } from '../../../Shared/UiSystem/UiInteraction';
import { UiInteractionUtils } from '../../../Shared/UiSystem/UiInteractionUtils';
import { UiKnobId, UiKnobRequestedLabelState } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { WaypointInfoChartDisplayDataProvider } from './WaypointInfoChartDisplayDataProvider';

import './WaypointInfoChartDisplay.css';

/**
 * Component props for {@link WaypointInfoChartDisplay}.
 */
export interface WaypointInfoChartDisplayProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** The IDs of the valid bezel rotary knobs that can be used to control the display. */
  validKnobIds: Iterable<UiKnobId>;

  /** A provider of chart data for the display. */
  dataProvider: WaypointInfoChartDisplayDataProvider;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A configuration object defining options for electronic charts. */
  chartsConfig: G3XChartsConfig;

  /** A mutable subscribable to which to write whether the display is in expanded mode. */
  isExpanded?: MutableSubscribable<any, boolean>;
}

/**
 * A display for a terminal procedure chart in a waypoint information component.
 */
export class WaypointInfoChartDisplay extends DisplayComponent<WaypointInfoChartDisplayProps> implements UiInteractionHandler {
  private static readonly KNOB_LABEL_STATE: [UiKnobId, string][] = [
    [UiKnobId.SingleInner, 'Zoom Chart'],
    [UiKnobId.SingleOuter, 'Zoom Chart'],
    [UiKnobId.LeftInner, 'Zoom Chart'],
    [UiKnobId.LeftOuter, 'Zoom Chart'],
    [UiKnobId.RightInner, 'Zoom Chart'],
    [UiKnobId.RightOuter, 'Zoom Chart']
  ];

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly chartDisplayRef = FSComponent.createRef<GarminChartDisplay>();
  private readonly chartDisplaySize = Vec2Subject.create(Vec2Math.create());
  private readonly chartDisplayOverscroll = VecNSubject.create(VecNMath.create(4));
  private readonly chartDisplaySelection = Subject.create<Readonly<GarminChartDisplaySelection> | null>(null);

  private readonly isExpanded = Subject.create(false);

  private readonly isChartSelected = this.props.dataProvider.chartPageSelection.map(selection => selection !== null);
  private readonly chartStatus = Subject.create(GarminChartDisplayChartStatus.NoSelection);
  private readonly loadingIconHidden = MappedSubject.create(
    ([isLoadingAirportData, chartStatus]) => !isLoadingAirportData && chartStatus !== GarminChartDisplayChartStatus.Loading,
    this.props.dataProvider.isLoadingAirportData,
    this.chartStatus
  );
  private readonly failureBannerText = MappedSubject.create(
    ([isLoadingAirportData, isChartSelected, chartStatus]) => {
      if (isLoadingAirportData) {
        return '';
      } else if (
        isChartSelected
        && (
          chartStatus === GarminChartDisplayChartStatus.Loading
          || chartStatus === GarminChartDisplayChartStatus.Displayed
        )
      ) {
        return '';
      } else {
        return 'Chart Not Available';
      }
    },
    this.props.dataProvider.isLoadingAirportData,
    this.isChartSelected,
    this.chartStatus
  );

  private readonly chartSourceText = this.props.dataProvider.chartsSources.size > 1
    ? this.props.dataProvider.chartPageSelection.map(selection => {
      return selection
        ? this.props.dataProvider.chartsSources.get(selection.source)?.name ?? ''
        : '';
    })
    : undefined;

  private readonly airplaneIconStatus = Subject.create(0);
  private readonly noAirplaneIconHidden = MappedSubject.create(
    ([isLoadingAirportData, isChartSelected, chartStatus, airplaneIconStatus]) => {
      return isLoadingAirportData
        || !isChartSelected
        || chartStatus !== GarminChartDisplayChartStatus.Displayed
        || BitFlags.isAny(airplaneIconStatus, GarminChartAirplaneIconStatus.Visible);
    },
    this.props.dataProvider.isLoadingAirportData,
    this.isChartSelected,
    this.chartStatus,
    this.airplaneIconStatus
  );

  private readonly dragDelta = Vec2Math.create();

  private readonly validKnobIds = new Set(this.props.validKnobIds);

  private readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.validKnobIds);
  /** The bezel rotary knob label state requested by this component. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private needUpdateDisplayedChart = false;

  private isPaused = true;

  private readonly subscriptions: Subscription[] = [
    this.isChartSelected,
    this.loadingIconHidden,
    this.failureBannerText,
    this.noAirplaneIconHidden,
  ];

  private isExpandedSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    // Allow overscroll on each edge equal to the length of the display along the same axis.
    this.chartDisplaySize.sub(size => { this.chartDisplayOverscroll.set(size[0], size[1], size[0], size[1]); }, true);

    const scheduleUpdateDisplayedChart = (): void => { this.needUpdateDisplayedChart = true; };

    this.subscriptions.push(
      this.props.dataProvider.chartPageSelection.sub(scheduleUpdateDisplayedChart),
      this.props.dataProvider.isLoadingAirportData.sub(scheduleUpdateDisplayedChart)
    );

    scheduleUpdateDisplayedChart();

    this.isExpandedSub = this.isExpanded.sub(this.onIsExpandedChanged.bind(this), false, true);

    if (this.props.isExpanded) {
      this.subscriptions.push(
        this.isExpanded.pipe(this.props.isExpanded)
      );
    }
  }

  /**
   * Resumes this display.
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isExpandedSub!.resume(true);
  }

  /**
   * Pauses this display.
   */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isExpandedSub!.pause();
    this.isExpanded.set(false);
    this._knobLabelState.clear();
  }

  /**
   * Sets the size of this display.
   * @param width The new width, in pixels.
   * @param height The new height, in pixels.
   */
  public setSize(width: number, height: number): void {
    this.chartDisplaySize.set(width, height);

    if (this.rootRef.getOrDefault()) {
      this.rootRef.instance.style.width = `${width}px`;
      this.rootRef.instance.style.height = `${height}px`;
    }
  }

  /**
   * Updates this display. Has no effect if this display is paused.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public update(time: number): void {
    if (this.isPaused) {
      return;
    }

    if (this.needUpdateDisplayedChart) {
      this.updateDisplayedChart();
      this.needUpdateDisplayedChart = false;
    }

    if (this.dragDelta[0] !== 0 || this.dragDelta[1] !== 0) {
      this.chartDisplayRef.instance.changeChartPan(this.dragDelta[0], this.dragDelta[1], true);
      Vec2Math.set(0, 0, this.dragDelta);
    }

    this.chartDisplayRef.instance.update(time);
  }

  /**
   * Updates this pane's displayed chart.
   */
  private updateDisplayedChart(): void {
    let displaySelection: GarminChartDisplaySelection | null = null;

    if (!this.props.dataProvider.isLoadingAirportData.get()) {
      const pageSelection = this.props.dataProvider.chartPageSelection.get();

      const chartsSource = pageSelection ? this.props.dataProvider.chartsSources.get(pageSelection.source) : undefined;

      if (pageSelection && chartsSource) {
        const lightModeUrl = chartsSource.getDayModeUrl(pageSelection.pageData);
        const nightModeUrl = chartsSource.supportsNightMode
          ? chartsSource.getNightModeUrl(pageSelection.pageData)
          : lightModeUrl;

        displaySelection = {
          page: pageSelection.pageData.page,
          urls: {
            [G3XChartsDisplayColorMode.Day]: lightModeUrl,
            [G3XChartsDisplayColorMode.Night]: nightModeUrl,
          },
          area: null,
          geoReferencedArea: chartsSource.getGeoReferencedArea(pageSelection.pageData) ?? null
        };
      }
    }

    this.chartDisplaySelection.set(displaySelection);

    if (!displaySelection) {
      this.isExpanded.set(false);
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event]) && this.isExpanded.get()) {
          this.changeChartZoom(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').get() ? -1 : 1);
          return true;
        }
        break;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event]) && this.isExpanded.get()) {
          this.changeChartZoom(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').get() ? 1 : -1);
          return true;
        }
        break;
      case UiInteractionEvent.BackPress:
        if (this.isExpanded.get()) {
          this.isExpanded.set(false);
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Changes this display's chart zoom level.
   * @param direction The direction in which to change the zoom level: +1 for zoom increase and -1 for zoom decrease.
   */
  private changeChartZoom(direction: 1 | -1): void {
    this.chartDisplayRef.instance.changeChartZoom(direction, 0.5);
  }

  /**
   * Responds to when whether this display is in expanded mode changes.
   * @param isExpanded Whether this display is in expanded mode.
   */
  private onIsExpandedChanged(isExpanded: boolean): void {
    if (isExpanded) {
      this._knobLabelState.set(WaypointInfoChartDisplay.KNOB_LABEL_STATE);
    } else {
      this._knobLabelState.clear();
    }
  }

  /**
   * Responds to when this display's expand button is pressed.
   */
  private onExpandButtonPressed(): void {
    this.isExpanded.set(!this.isExpanded.get());
  }

  /**
   * Responds to when a drag motion starts on this display's chart.
   */
  private onDragStarted(): void {
    this.chartDisplayRef.instance.setOverscrollSnapbackInhibit(true);
  }

  /**
   * Responds to when the mouse moves while dragging over this display's chart.
   * @param position The new position of the mouse.
   * @param prevPosition The position of the mouse at the previous update.
   */
  private onDragMoved(position: ReadonlyFloat64Array, prevPosition: ReadonlyFloat64Array): void {
    // Accumulate dragging deltas so that they can be applied at the next update cycle.
    this.dragDelta[0] += position[0] - prevPosition[0];
    this.dragDelta[1] += position[1] - prevPosition[1];
  }

  /**
   * Responds to when a drag motion ends on this display's chart.
   */
  private onDragEnded(): void {
    this.chartDisplayRef.instance.setOverscrollSnapbackInhibit(false);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        ref={this.rootRef}
        class={{ 'waypoint-info-chart': true, 'waypoint-info-chart-expanded': this.isExpanded }}
      >
        <TouchPad
          bus={this.props.uiService.bus}
          onDragStarted={this.onDragStarted.bind(this)}
          onDragMoved={this.onDragMoved.bind(this)}
          onDragEnded={this.onDragEnded.bind(this)}
          class='waypoint-info-chart-touch-pad'
        >
          <GarminChartDisplay
            ref={this.chartDisplayRef}
            size={this.chartDisplaySize}
            selectedChart={this.chartDisplaySelection}
            displayMode={this.props.dataProvider.colorMode}
            maxZoomLevel={2}
            panOverscroll={this.chartDisplayOverscroll}
            // Disable the compositing layer in order to avoid a Coherent issue where the chart img element is rendered
            // incorrectly (with very low resolution).
            disableChartCompositingLayer
            chartStatus={this.chartStatus}
          >
            <GarminChartAirplaneIconLayer
              planePosition={this.props.dataProvider.planePosition}
              planeHeading={this.props.dataProvider.planeHeading}
              imgSrc={this.props.chartsConfig.ownAirplaneIconSrc}
              iconAnchor={Vec2Math.create(0.5, 0.5)}
              status={this.airplaneIconStatus}
            />
            {this.renderRangeControls()}
            {this.renderExpandControls()}
            {this.renderBottomRightIndicators()}
            {this.renderSourceBanner()}
            {this.renderLoadingIcon()}
          </GarminChartDisplay>
        </TouchPad>
        <div
          class={{
            'waypoint-info-chart-banner': true,
            'waypoint-info-chart-failure-banner': true,
            'hidden': this.failureBannerText.map(text => !text)
          }}
        >
          {this.failureBannerText}
        </div>
        <div class='ui-layered-darken' />
      </div>
    );
  }

  /**
   * Renders this display's range controls.
   * @returns This display's range controls, as a VNode.
   */
  private renderRangeControls(): VNode {
    return (
      <div
        class={{
          'map-range-target-control': true,
          'hidden': this.chartStatus.map(status => status !== GarminChartDisplayChartStatus.Displayed)
        }}
      >
        <TouchButton
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.changeChartZoom.bind(this, -1)}
          focusOnDrag
          class='map-range-target-control-button map-range-target-control-range-button'
        >
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_minus.png`} class='map-range-target-control-range-button-img' />
        </TouchButton>
        <TouchButton
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.changeChartZoom.bind(this, 1)}
          focusOnDrag
          class='map-range-target-control-button map-range-target-control-range-button'
        >
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_plus.png`} class='map-range-target-control-range-button-img' />
        </TouchButton>
      </div>
    );
  }

  /**
   * Renders this display's expanded mode controls.
   * @returns This display's expanded mode, as a VNode.
   */
  private renderExpandControls(): VNode {
    const expandSrc = `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_expand.png`;
    const collapseSrc = `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_collapse.png`;

    return (
      <div
        class={{
          'waypoint-info-chart-expand-control': true,
          'hidden': this.chartStatus.map(status => status !== GarminChartDisplayChartStatus.Displayed)
        }}
      >
        <TouchButton
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.onExpandButtonPressed.bind(this)}
          focusOnDrag
          class='waypoint-info-chart-expand-control-button'
        >
          <img
            src={this.isExpanded.map(isExpanded => isExpanded ? collapseSrc : expandSrc)}
            class='waypoint-info-chart-expand-control-button-img'
          />
        </TouchButton>
      </div>
    );
  }

  /**
   * Renders this display's bottom-right indicators.
   * @returns This display's bottom-right indicators, as a VNode.
   */
  private renderBottomRightIndicators(): VNode {
    return (
      <div class='waypoint-info-chart-bottom-right'>
        <div
          class={{
            'waypoint-info-chart-no-airplane-icon': true,
            'hidden': this.noAirplaneIconHidden
          }}
        >
          <img src={this.props.chartsConfig.ownAirplaneIconSrc} class='waypoint-info-chart-no-airplane-icon-img' />
          <svg viewBox='0 0 22 22' class='waypoint-info-chart-no-airplane-icon-cross'>
            <path d='M 3 3 l 16 16 m 0 -16 l -16 16' />
          </svg>
        </div>
      </div>
    );
  }

  /**
   * Renders this display's charts source banner.
   * @returns This display's charts source banner, as a VNode.
   */
  private renderSourceBanner(): VNode | null {
    if (!this.chartSourceText) {
      return null;
    }

    return (
      <div
        class={{
          'waypoint-info-chart-banner': true,
          'waypoint-info-chart-source-banner': true,
          'hidden': MappedSubject.create(
            ([chartStatus, text]) => {
              return chartStatus === GarminChartDisplayChartStatus.NoSelection
                || chartStatus === GarminChartDisplayChartStatus.NoChart
                || text === '';
            },
            this.chartStatus,
            this.chartSourceText
          )
        }}
      >
        {this.chartSourceText}
      </div>
    );
  }

  /**
   * Renders this display's loading icon.
   * @returns This display's loading icon, as a VNode.
   */
  private renderLoadingIcon(): VNode | null {
    return (
      <G3XLoadingIcon
        class={{
          'waypoint-info-chart-loading-icon': true,
          'hidden': this.loadingIconHidden
        }}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
