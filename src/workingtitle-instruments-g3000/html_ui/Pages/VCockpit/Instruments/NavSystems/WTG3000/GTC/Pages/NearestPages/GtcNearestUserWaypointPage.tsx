import { FacilityType, FacilityWaypoint, FSComponent, NearestSubscription, UserFacility, VNode } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType, NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';

import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNearestWaypointOptionsPopup } from './GtcNearestWaypointOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage } from './GtcNearestWaypointPage';

/**
 * GTC view keys for popups owned by nearest user waypoint pages.
 */
enum GtcNearestUserWaypointPagePopupKeys {
  Options = 'NearestUserWaypointOptions'
}

/**
 * A GTC nearest user waypoint page.
 */
export class GtcNearestUserWaypointPage extends GtcNearestWaypointPage<FacilityType.USR> {
  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestUserWaypointPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.User;

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<UserFacility> {
    return context.usrs;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      this.optionsPopupKey,
      this.props.controlMode,
      this.renderOptionsPopup.bind(this),
      this.props.displayPaneIndex
    );

    this._title.set('Nearest User');
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-user-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'User Waypoint';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return null;
  }

  /** @inheritdoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<UserFacility>>): VNode {
    return (
      <GtcNearestWaypointPageListItem
        gtcService={this.props.gtcService}
        optionsPopupKey={this.optionsPopupKey}
        entry={data}
        selectedWaypoint={this.selectedWaypoint}
        unitsSettingManager={this.unitsSettingManager}
        paddedListItem
      />
    );
  }

  /**
   * Renders this page's options popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's options popup, as a VNode.
   */
  protected renderOptionsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcNearestWaypointOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Nearest User'
        waypointTypeText={'User Waypoint\n'}
        waypointInfoViewKey={GtcViewKeys.UserWaypointInfo}
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }
}