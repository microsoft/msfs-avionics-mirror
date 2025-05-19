import { FacilityType, FSComponent, MutableSubscribable, VNode } from '@microsoft/msfs-sdk';

import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcChartsPage } from '../ChartsPage/GtcChartsPage';
import { GtcNearestWaypointOptionsPopup } from './GtcNearestWaypointOptionsPopup';

import './GtcNearestAirportOptionsPopup.css';

/**
 * Component props for GtcNearestAirportOptionsPopup.
 */
export interface GtcNearestAirportOptionsPopupProps extends GtcViewProps {
  /** The GTC view title to display while the popup is active. */
  title?: string;

  /** The selected waypoint for this popup's parent nearest airport page. */
  selectedWaypoint: MutableSubscribable<AirportWaypoint | null>;

  /** Whether to show the nearest waypoint pane. */
  showOnMap: MutableSubscribable<boolean>;
}

/**
 * A GTC nearest airport page options popup.
 */
export class GtcNearestAirportOptionsPopup extends GtcView<GtcNearestAirportOptionsPopupProps> {
  private readonly ref = FSComponent.createRef<GtcNearestWaypointOptionsPopup<FacilityType.Airport>>();
  private readonly chartButtonRef = FSComponent.createRef<GtcTouchButton>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set(this.props.title);
  }

  /** @inheritdoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    this.ref.instance.onOpen(wasPreviouslyOpened);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.ref.instance.onClose();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.ref.instance.onResume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.ref.instance.onPause();
  }

  /**
   * Responds to when this popup's Airport Chart button is pressed.
   */
  private onChartButtonPressed(): void {
    const waypoint = this.props.selectedWaypoint.get();

    if (!waypoint) {
      return;
    }

    this.props.gtcService.changePageTo<GtcChartsPage>(GtcViewKeys.Charts)
      .ref.initAirportSelection(waypoint.facility.get());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcNearestWaypointOptionsPopup
        ref={this.ref}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        waypointTypeText='Airport'
        waypointInfoViewKey={GtcViewKeys.AirportInfo}
        selectedWaypoint={this.props.selectedWaypoint}
        showOnMap={this.props.showOnMap}
        class='nearest-airport-options-popup'
      >
        <GtcTouchButton
          ref={this.chartButtonRef}
          label='Airport Chart'
          onPressed={this.onChartButtonPressed.bind(this)}
          class='nearest-wpt-options-popup-button nearest-wpt-options-popup-chart'
        />
      </GtcNearestWaypointOptionsPopup>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();
    this.chartButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
