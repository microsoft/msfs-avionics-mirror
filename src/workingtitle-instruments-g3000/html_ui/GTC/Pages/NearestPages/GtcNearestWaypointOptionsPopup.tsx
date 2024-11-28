import { DisplayComponent, FSComponent, MutableSubscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { G3000FilePaths, NearestWaypointFacilityType, NearestWaypointTypeMap } from '@microsoft/msfs-wtg3000-common';

import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage/GtcDirectToPage';
import { GtcWaypointInfoPage } from '../WaypointInfoPages/GtcWaypointInfoPage';

import './GtcNearestWaypointOptionsPopup.css';

/**
 * Component props for GtcNearestWaypointOptionsPopup.
 */
export interface GtcNearestWaypointOptionsPopupProps<T extends NearestWaypointFacilityType> extends GtcViewProps {
  /** The GTC view title to display while the popup is active. */
  title?: string;

  /** The text to display for the waypoint type associated with this popup. */
  waypointTypeText: string;

  /** The view key of the waypoint information page opened by the popup's Info button. */
  waypointInfoViewKey: string;

  /** The selected waypoint for this popup's parent nearest waypoint page. */
  selectedWaypoint: MutableSubscribable<NearestWaypointTypeMap[T] | null>;

  /** Whether to show the nearest waypoint pane. */
  showOnMap: MutableSubscribable<boolean>;

  /** CSS class(es) to apply to the popup's root element. */
  class?: string;
}

/**
 * A GTC nearest waypoint page options popup.
 */
export class GtcNearestWaypointOptionsPopup<T extends NearestWaypointFacilityType> extends GtcView<GtcNearestWaypointOptionsPopupProps<T>> {
  private readonly buttonRefs = Array.from({ length: 4 }, () => FSComponent.createRef<DisplayComponent<any>>());

  private selectedWaypointSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set(this.props.title);

    this.selectedWaypointSub = this.props.selectedWaypoint.sub(selected => {
      if (selected === null) {
        this.props.gtcService.goBack();
      }
    });
  }

  /** @inheritdoc */
  public onClose(): void {
    this.props.selectedWaypoint.set(null);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.selectedWaypointSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.selectedWaypointSub?.pause();
  }

  /**
   * Responds to when the Direct-To button is pressed.
   */
  private onDirectToButtonPressed(): void {
    const waypoint = this.props.selectedWaypoint.get();
    if (waypoint !== null) {
      this.props.gtcService.goBack();
      this.props.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo)
        .ref.setWaypoint({ facility: waypoint.facility.get() });
    }
  }

  /**
   * Responds to when the Waypoint Info button is pressed.
   */
  private onInfoButtonPressed(): void {
    const selected = this.props.selectedWaypoint.get();

    if (selected !== null) {
      this.props.gtcService.goBack();
      this.props.gtcService.changePageTo<GtcWaypointInfoPage<any>>(this.props.waypointInfoViewKey)
        .ref.initSelection(selected.facility.get());
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`nearest-wpt-options-popup ${this.props.class ?? ''}`}>
        <div class='nearest-wpt-options-popup-title'>Waypoint Options</div>
        <GtcImgTouchButton
          ref={this.buttonRefs[0]}
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_direct_to.png`}
          onPressed={this.onDirectToButtonPressed.bind(this)}
          class='nearest-wpt-options-popup-button nearest-wpt-options-popup-dto'
        />
        <GtcTouchButton
          ref={this.buttonRefs[1]}
          label='Insert in<br>Flight Plan'
          isEnabled={false}
          class='nearest-wpt-options-popup-button nearest-wpt-options-popup-fpl'
        />
        <GtcTouchButton
          ref={this.buttonRefs[2]}
          label={`${this.props.waypointTypeText} Info`}
          onPressed={this.onInfoButtonPressed.bind(this)}
          class='nearest-wpt-options-popup-button nearest-wpt-options-popup-fpl'
        />
        <GtcToggleTouchButton
          ref={this.buttonRefs[3]}
          state={this.props.showOnMap}
          label='Show On Map'
          class='nearest-wpt-options-popup-button nearest-wpt-options-popup-showmap'
        />
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.selectedWaypointSub?.destroy();

    super.destroy();
  }
}
