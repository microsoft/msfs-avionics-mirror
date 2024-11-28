import {
  ArrayUtils, DisplayComponent, FacilityWaypoint, FSComponent, MutableSubscribable, Subscribable, UserFacility,
  VNode
} from '@microsoft/msfs-sdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcViewKeys } from '../../GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcUserWaypointDialog } from '../../Dialog/GtcUserWaypointDialog';
import { GtcUserWaypointEditController, UserWaypointFlightPlanStatus } from '../../Navigation/GtcUserWaypointEditController';
import { GtcDirectToPage } from '../DirectToPage/GtcDirectToPage';

import './GtcUserWaypointInfoOptionsPopup.css';

/**
 * Component props for GtcUserWaypointInfoOptionsPopup.
 */
export interface GtcUserWaypointInfoOptionsPopupProps extends GtcViewProps {
  /** A controller for editing user waypoints. */
  controller: GtcUserWaypointEditController;

  /** The selected waypoint. */
  selectedWaypoint: Subscribable<FacilityWaypoint<UserFacility> | null>;

  /** A function which initializes the selected waypoint of the popup's parent page. */
  initSelection: (facility: UserFacility) => void;

  /** Whether to show the waypoint information pane. */
  showOnMap: MutableSubscribable<boolean>;
}

/**
 * A GTC user waypoint information page options popup.
 */
export class GtcUserWaypointInfoOptionsPopup extends GtcView<GtcUserWaypointInfoOptionsPopupProps> {
  private readonly buttonRefs = ArrayUtils.create(6, () => FSComponent.createRef<DisplayComponent<any>>());

  private readonly isWaypointSelected = this.props.selectedWaypoint.map(waypoint => waypoint !== null);

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('User Waypoint Information');
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
   * Responds to when the Edit button is pressed.
   */
  private async onEditButtonPressed(): Promise<void> {
    const waypoint = this.props.selectedWaypoint.get();
    if (waypoint !== null) {
      this.props.gtcService.goBack();
      const result = await this.props.gtcService.changePageTo<GtcUserWaypointDialog>(GtcViewKeys.UserWaypointDialog)
        .ref.request({ editFacility: waypoint.facility.get() });

      if (!result.wasCancelled) {
        this.props.initSelection(result.payload);
      }
    }
  }

  /**
   * Responds to when the Delete button is pressed.
   */
  private async onDeleteButtonPressed(): Promise<void> {
    const waypoint = this.props.selectedWaypoint.get();
    if (waypoint !== null) {
      const icao = waypoint.facility.get().icaoStruct;

      const result = await GtcDialogs.openMessageDialog(this.props.gtcService, `Would you like to delete the user waypoint ${icao.ident}?`);

      if (result) {
        if (this.props.controller.getWaypointFlightPlanStatus(icao) !== UserWaypointFlightPlanStatus.None) {
          await GtcDialogs.openMessageDialog(this.props.gtcService, `The user waypoint ${icao.ident} is a flight plan waypoint and cannot be deleted.`, false);
        } else {
          this.props.controller.removeUserFacility(icao);
        }
      }

      this.props.gtcService.goBack();
    }
  }

  /**
   * Responds to when the Delete All button is pressed.
   */
  private async onDeleteAllButtonPressed(): Promise<void> {
    const result = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Would you like to delete all user waypoints?');

    if (result) {
      const inFlightPlan = this.props.controller.removeAllUserFacilities();
      if (inFlightPlan) {
        await GtcDialogs.openMessageDialog(this.props.gtcService, 'Not all user waypoints deleted due to use in flight plan or direct to.', false);
      }
    }

    this.props.gtcService.goBack();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='user-wpt-info-options-popup'>
        <div class='user-wpt-info-options-popup-title'>Waypoint Options</div>
        <div class='user-wpt-info-options-popup-grid'>
          <GtcImgTouchButton
            ref={this.buttonRefs[0]}
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_direct_to.png`}
            isEnabled={this.isWaypointSelected}
            onPressed={this.onDirectToButtonPressed.bind(this)}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-dto'
          />
          <GtcTouchButton
            ref={this.buttonRefs[1]}
            label='Insert in<br>Flight Plan'
            isEnabled={false}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-fpl'
          />
          <GtcTouchButton
            ref={this.buttonRefs[2]}
            label='Edit'
            isEnabled={this.isWaypointSelected}
            onPressed={this.onEditButtonPressed.bind(this)}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-edit'
          />
          <GtcTouchButton
            ref={this.buttonRefs[3]}
            label='Delete'
            isEnabled={this.isWaypointSelected}
            onPressed={this.onDeleteButtonPressed.bind(this)}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-delete'
          />
          <GtcTouchButton
            ref={this.buttonRefs[4]}
            label='Delete All'
            onPressed={this.onDeleteAllButtonPressed.bind(this)}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-deleteall'
          />
          <GtcToggleTouchButton
            ref={this.buttonRefs[5]}
            state={this.props.showOnMap}
            label={'Show On\nMap'}
            class='user-wpt-info-options-popup-button user-wpt-info-options-popup-showmap'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.isWaypointSelected.destroy();

    super.destroy();
  }
}
