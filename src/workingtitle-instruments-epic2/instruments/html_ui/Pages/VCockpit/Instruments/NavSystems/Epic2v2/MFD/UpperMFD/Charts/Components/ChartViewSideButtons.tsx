import { ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, MappedSubject, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { Epic2BezelButtonEvents, MfdAliasedUserSettingTypes, ModalKey, ModalService, TouchButton, UpperMfdDisplayPage } from '@microsoft/msfs-epic2-shared';

import { NearestFunctionModal } from '../../Map/NearestFunctionModal';
import { ChartViewer } from './ChartViewer';

import './ChartViewSideButtons.css';

/** Props for ChartViewSideButtons. */
interface ChartViewSideButtonProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus,
  /** The settings. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The modal service */
  readonly modalService: ModalService
  /** The chart viewer being controlled */
  readonly viewer: ChartViewer;
}

/** The Map Side Buttons component. */
export class ChartViewSideButtons extends DisplayComponent<ChartViewSideButtonProps> {
  private hEventSubscription: Subscription | undefined;
  private readonly hEventSubscriber = this.props.bus.getSubscriber<HEvent>();
  private readonly lskNameStrings: Epic2BezelButtonEvents[] = [
    Epic2BezelButtonEvents.LSK_R1,
    Epic2BezelButtonEvents.LSK_R2,
    Epic2BezelButtonEvents.LSK_R3,
    Epic2BezelButtonEvents.LSK_R4,
    Epic2BezelButtonEvents.LSK_R5,
    Epic2BezelButtonEvents.LSK_R6,
    Epic2BezelButtonEvents.LSK_R7,
    Epic2BezelButtonEvents.LSK_R8,
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.hEventSubscription = this.hEventSubscriber.on('hEvent').handle(this.handleLskHEvent.bind(this));
  }

  /**
   * Connects LSK HEvents to their corresponding MFD side soft keys.
   * @param event The HEvent string.
   */
  private handleLskHEvent(event: string): void {
    // Only accept bezel button events if the chart view is currently being displayed
    if (this.props.settings.getSetting('upperMfdDisplayPage').get() === UpperMfdDisplayPage.Charts) {
      switch (event) {
        case this.lskNameStrings[1]:
          this.props.viewer.nextPage();
          break;
        case this.lskNameStrings[2]:
          this.props.viewer.increaseZoom();
          break;
        case this.lskNameStrings[3]:
          this.props.viewer.centerAircraft();
          break;
        case this.lskNameStrings[4]:
          this.props.viewer.centerChart();
          break;
        case this.lskNameStrings[5]:
          this.props.viewer.fitToViewArea();
          break;
        case this.lskNameStrings[6]:
          this.onNrstButtonPressed();
          break;
        case this.lskNameStrings[7]:
          this.onMapButtonPressed();
          break;
        default:
          break;
      }
    }
  }

  /** Callback when Nearest Waypoint button is pressed. */
  private onNrstButtonPressed(): void {
    this.props.settings.getSetting('upperMfdDisplayPage').set(UpperMfdDisplayPage.Inav);
    this.props.modalService.open<NearestFunctionModal>(ModalKey.NearestAirports);
  }

  /** Callback when Map button is pressed. */
  private onMapButtonPressed(): void {
    this.props.settings.getSetting('upperMfdDisplayPage').set(UpperMfdDisplayPage.Inav);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="chart-view-side-buttons">
        <div class="chart-view-side-button-upper">
          <TouchButton
            label={
              <div>
                <div class="touch-button-label-boxed">{MappedSubject.create(([pageIndex, pages]) => {
                  return `${pageIndex + 1}/${pages.length}`;
                }, this.props.viewer.pageIndex, this.props.viewer.pages)}</div>
                <div>Page</div>
              </div>
            }
            variant="base"
            isEnabled={this.props.viewer.pages.map((pages) => pages.length > 1)}
            onPressed={() => this.props.viewer.nextPage()}
          />
          <TouchButton
            label={
              <div>
                <div class="touch-button-label-boxed">{this.props.viewer.chartZoomLevel.map((v) => `${ChartViewer.ZOOM_STEPS[v]}x`)}</div>
                <div>Zoom</div>
              </div>
            }
            variant="base"
            onPressed={() => this.props.viewer.increaseZoom()}
          />
          <TouchButton
            label="Center<br/>A/C"
            variant="base"
            onPressed={() => this.props.viewer.centerAircraft()}
            isEnabled={this.props.viewer.ownshipVisible}
          />
          <TouchButton
            label="Center<br/>Chart"
            variant="base"
            onPressed={() => this.props.viewer.centerChart()}
          />
          <TouchButton
            label="Fit<br/>Chart"
            variant="base"
            onPressed={() => this.props.viewer.fitToViewArea()}
          />
        </div>
        <TouchButton label="Nrst" variant="base" onPressed={() => this.onNrstButtonPressed()} />
        <TouchButton label="Map" variant="base" onPressed={() => this.onMapButtonPressed()} />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.hEventSubscription?.destroy();
    super.destroy();
  }
}
