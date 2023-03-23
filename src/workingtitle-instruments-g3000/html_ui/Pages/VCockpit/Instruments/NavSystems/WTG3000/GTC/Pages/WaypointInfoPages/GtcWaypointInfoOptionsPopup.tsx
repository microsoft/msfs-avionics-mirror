import { DisplayComponent, FacilityWaypoint, FSComponent, MutableSubscribable, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage/GtcDirectToPage';

import './GtcWaypointInfoOptionsPopup.css';

/**
 * Component props for GtcWaypointInfoOptionsPopup.
 */
export interface GtcWaypointInfoOptionsPopupProps extends GtcViewProps {
  /** The GTC view title to display while the popup is active. */
  title: Subscribable<string | undefined>;

  /** The selected waypoint. */
  selectedWaypoint: Subscribable<FacilityWaypoint | null>;

  /** Whether to show the waypoint information pane. */
  showOnMap: MutableSubscribable<boolean>;
}

/**
 * A GTC waypoint information page options popup.
 */
export class GtcWaypointInfoOptionsPopup extends GtcView<GtcWaypointInfoOptionsPopupProps> {
  private readonly buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

  private readonly isWaypointSelected = this.props.selectedWaypoint.map(waypoint => waypoint !== null);

  private titlePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.titlePipe = this.props.title.pipe(this._title);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wpt-info-options-popup'>
        <div class='wpt-info-options-popup-title'>Waypoint Options</div>
        <GtcImgTouchButton
          ref={this.buttonRefs[0]}
          imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_direct_to.png'
          isEnabled={this.isWaypointSelected}
          onPressed={this.onDirectToButtonPressed.bind(this)}
          class='wpt-info-options-popup-button wpt-info-options-popup-dto'
        />
        <GtcTouchButton
          ref={this.buttonRefs[1]}
          label='Insert in<br>Flight Plan'
          isEnabled={false}
          class='wpt-info-options-popup-button wpt-info-options-popup-fpl'
        />
        <GtcToggleTouchButton
          ref={this.buttonRefs[2]}
          state={this.props.showOnMap}
          label='Show On Map'
          class='wpt-info-options-popup-button wpt-info-options-popup-showmap'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.isWaypointSelected.destroy();

    this.titlePipe?.destroy();

    super.destroy();
  }
}