import {
  BitFlags, FSComponent, MappedSubject, Subject, Vec2Math, Vec2Subject, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminChartAirplaneIconLayer, GarminChartAirplaneIconStatus, GarminChartDisplay, GarminChartDisplayChartStatus,
  GarminChartDisplaySelection, GarminChartScaleBarLayer
} from '@microsoft/msfs-garminsdk';

import { G3000ChartsConfig } from '../../Charts/G3000ChartsConfig';
import { G3000ChartsSource } from '../../Charts/G3000ChartsSource';
import { G3000ChartsDisplayLightMode } from '../../Charts/G3000ChartsTypes';
import { PfdControllerJoystickEventMapHandler } from '../../Input/PfdControllerJoystickEventMapHandler';
import { DisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { ChartsPaneViewDataProvider } from './ChartsPaneViewDataProvider';
import { ChartsPaneViewEventTypes } from './ChartsPaneViewEvents';

import './ChartsPaneView.css';

/**
 * Component props for {@link ChartsPaneView}.
 */
export interface ChartsPaneViewProps extends DisplayPaneViewProps {
  /**
   * A function that creates a data provider for the pane view.
   * @returns A new data provider for the pane view.
   */
  dataProviderFactory: () => ChartsPaneViewDataProvider;

  /** A configuration object defining options for electronic charts. */
  chartsConfig: G3000ChartsConfig;
}

/**
 * A display pane view which displays electronic charts.
 */
export class ChartsPaneView extends DisplayPaneView<ChartsPaneViewProps, DisplayPaneViewEvent<ChartsPaneViewEventTypes>> {

  private readonly dataProvider = this.props.dataProviderFactory();

  private readonly chartsSources = new Map(Array.from(this.dataProvider.chartsSources, source => [source.uid, source]));

  private readonly chartDisplayRef = FSComponent.createRef<GarminChartDisplay>();
  private readonly chartDisplaySize = Vec2Subject.create(Vec2Math.create());
  private readonly chartDisplayOverscroll = VecNSubject.create(VecNMath.create(4));
  private readonly chartDisplaySelection = Subject.create<Readonly<GarminChartDisplaySelection> | null>(null);

  private readonly isChartSelected = this.dataProvider.chartPageSelection.map(selection => selection !== null);
  private readonly chartStatus = Subject.create(GarminChartDisplayChartStatus.NoSelection);
  private readonly bannerText = MappedSubject.create(
    ([isChartSelected, chartStatus]) => {
      if (isChartSelected) {
        if (chartStatus === GarminChartDisplayChartStatus.NoSelection || chartStatus === GarminChartDisplayChartStatus.NoChart) {
          return 'Unable To Display Chart';
        } else {
          return '';
        }
      } else {
        return 'No Available Charts';
      }
    },
    this.isChartSelected,
    this.chartStatus
  );

  private readonly chartSourceText = this.chartsSources.size > 1
    ? this.dataProvider.chartPageSelection.map(selection => {
      return selection
        ? this.chartsSources.get(selection.source)?.name ?? ''
        : '';
    })
    : undefined;

  private readonly airplaneIconStatus = Subject.create(0);
  private readonly noAirplaneIconHidden = this.airplaneIconStatus.map(status => {
    return BitFlags.isAny(status, GarminChartAirplaneIconStatus.Visible | GarminChartAirplaneIconStatus.NoProjection);
  });

  private readonly pfdControllerJoystickEventHandler = this.props.index === DisplayPaneIndex.LeftPfd || this.props.index === DisplayPaneIndex.RightPfd
    ? new PfdControllerJoystickEventMapHandler({
      onPointerMove: this.onJoystickPointerMove.bind(this),
      onRangeChange: this.onJoystickRangeChange.bind(this),
    })
    : undefined;

  private needUpdateDisplayedChart = false;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Charts');

    // Allow overscroll on each edge equal to the length of the display along the same axis.
    this.chartDisplaySize.sub(size => { this.chartDisplayOverscroll.set(size[0], size[1], size[0], size[1]); }, true);

    const scheduleDisplayUpdate = (): void => { this.needUpdateDisplayedChart = true; };

    this.dataProvider.chartPageSelection.sub(scheduleDisplayUpdate);
    this.dataProvider.chartPageSection.sub(scheduleDisplayUpdate);

    scheduleDisplayUpdate();
  }

  /** @inheritDoc */
  public onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.chartDisplaySize.set(width, height);

    this.dataProvider.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.dataProvider.pause();

    this.chartDisplayRef.instance.setOverscrollSnapbackInhibit(false);
  }

  /** @inheritDoc */
  public onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.chartDisplaySize.set(width, height);
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    if (this.needUpdateDisplayedChart) {
      this.updateDisplayedChart();
      this.needUpdateDisplayedChart = false;
    }

    this.chartDisplayRef.instance.update(time);
  }

  /**
   * Updates this pane's displayed chart.
   */
  private updateDisplayedChart(): void {
    const pageSelection = this.dataProvider.chartPageSelection.get();
    const pageSectionUid = this.dataProvider.chartPageSection.get();

    let chartsSource: G3000ChartsSource | undefined;

    if (pageSelection) {
      chartsSource = this.chartsSources.get(pageSelection.source);

      if (chartsSource) {
        this._title.set(`${pageSelection.pageData.metadata.airportIcao.ident}-${chartsSource.getChartName(pageSelection.pageData)}`);
      } else {
        this._title.set('Charts');
      }
    } else {
      this._title.set('Charts');
    }

    let displaySelection: GarminChartDisplaySelection | null = null;

    if (pageSelection && chartsSource) {
      const lightModeUrl = chartsSource.getDayModeUrl(pageSelection.pageData);
      const nightModeUrl = chartsSource.supportsNightMode
        ? chartsSource.getNightModeUrl(pageSelection.pageData)
        : lightModeUrl;

      const pageSectionDef = pageSectionUid === ''
        ? undefined
        : chartsSource.pageSectionDefinitions.find(def => def.uid === pageSectionUid);

      const area = pageSectionDef?.getArea(pageSelection.pageData) ?? null;

      displaySelection = {
        page: pageSelection.pageData.page,
        urls: {
          [G3000ChartsDisplayLightMode.Day]: lightModeUrl,
          [G3000ChartsDisplayLightMode.Night]: nightModeUrl,
        },
        area,
        geoReferencedArea: chartsSource.getGeoReferencedArea(pageSelection.pageData, area) ?? null
      };
    }

    this.chartDisplaySelection.set(displaySelection);
  }

  /** @inheritDoc */
  public onEvent(event: DisplayPaneViewEvent<ChartsPaneViewEventTypes>): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.changeChartZoom(-1);
        break;
      case 'display_pane_map_range_dec':
        this.changeChartZoom(1);
        break;
      case 'display_pane_charts_rotate':
        this.rotateChart(event.eventData as 1 | -1);
        break;
      case 'display_pane_charts_change_pan': {
        const eventData = event.eventData as [number, number];
        this.panChart(eventData[0], eventData[1], false);
        break;
      }
      case 'display_pane_charts_change_pan_with_overscroll': {
        const eventData = event.eventData as [number, number];
        this.panChart(eventData[0], eventData[1], true);
        break;
      }
      case 'display_pane_charts_set_overscroll_snapback_inhibit': {
        this.chartDisplayRef.instance.setOverscrollSnapbackInhibit(event.eventData as boolean);
        break;
      }
      case 'display_pane_charts_fit_width':
        this.chartDisplayRef.instance.setFitWidth();
        break;
    }
  }

  /** @inheritDoc */
  public onInteractionEvent(event: string): boolean {
    if (this.pfdControllerJoystickEventHandler) {
      return this.pfdControllerJoystickEventHandler.onInteractionEvent(event);
    }

    return false;
  }

  /**
   * Responds to when a pointer move event is commanded by the PFD controller joystick.
   * @param dx The horizontal displacement, in pixels.
   * @param dy The vertical displacement, in pixels.
   * @returns Whether the event was handled.
   */
  private onJoystickPointerMove(dx: number, dy: number): boolean {
    this.panChart(dx, dy, false);
    return true;
  }

  /**
   * Responds to when a range change event is commanded by the PFD controller joystick.
   * @param direction The direction in which to change the range.
   * @returns Whether the event was handled.
   */
  private onJoystickRangeChange(direction: 1 | -1): boolean {
    this.changeChartZoom(-direction as 1 | -1);
    return true;
  }

  /**
   * Changes this pane's chart zoom level.
   * @param direction The direction in which to change the zoom level.
   */
  private changeChartZoom(direction: 1 | -1): void {
    this.chartDisplayRef.instance.changeChartZoom(direction, 0.5);
  }

  /**
   * Rotates this pane's displayed chart by 90 degrees.
   * @param direction The direction in which to rotate the chart.
   */
  private rotateChart(direction: 1 | -1): void {
    this.chartDisplayRef.instance.changeChartRotation(direction * 90);
  }

  /**
   * Pans this pane's displayed chart.
   * @param dx The amount to pan the chart along the x axis, in pixels.
   * @param dy The amount to pan the chart along the y axis, in pixels.
   * @param allowOverscroll Whether to allow overscroll when panning.
   */
  private panChart(dx: number, dy: number, allowOverscroll: boolean): void {
    this.chartDisplayRef.instance.changeChartPan(dx, dy, allowOverscroll);
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class='chart-pane'>
        <GarminChartDisplay
          ref={this.chartDisplayRef}
          size={this.chartDisplaySize}
          selectedChart={this.chartDisplaySelection}
          displayMode={this.dataProvider.lightMode}
          panOverscroll={this.chartDisplayOverscroll}
          chartStatus={this.chartStatus}
        >
          <GarminChartAirplaneIconLayer
            planePosition={this.dataProvider.planePosition}
            planeHeading={this.dataProvider.planeHeading}
            imgSrc={this.props.chartsConfig.ownAirplaneIconSrc}
            iconAnchor={Vec2Math.create(0.5, 0)}
            status={this.airplaneIconStatus}
          />
          <div class='chart-pane-display-bottom-right'>
            <GarminChartScaleBarLayer
              displayUnitsMode={this.dataProvider.unitsDistanceMode}
              scaleBarLengthBounds={Vec2Math.create(50, 125)}
            />
            <div
              class={{
                'chart-pane-display-no-airplane-icon': true,
                'hidden': this.noAirplaneIconHidden
              }}
            >
              <img src={this.props.chartsConfig.ownAirplaneIconSrc} class='chart-pane-display-no-airplane-icon-img' />
              <svg viewBox='0 0 22 22' class='chart-pane-display-no-airplane-icon-cross'>
                <path d='M 4 4 l 14 14 m 0 -14 l -14 14' />
              </svg>
            </div>
          </div>
          {this.chartSourceText !== undefined && (
            <div
              class={{
                'chart-pane-banner': true,
                'chart-pane-source-banner': true,
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
          )}
        </GarminChartDisplay>
        <div
          class={{
            'chart-pane-banner': true,
            'chart-pane-failure-banner': true,
            'hidden': this.bannerText.map(text => !text)
          }}
        >
          {this.bannerText}
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.chartDisplayRef.getOrDefault()?.destroy();

    this.dataProvider.destroy();

    super.destroy();
  }
}
