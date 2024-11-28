import {
  FSComponent, FacilityType, FacilityWaypoint, NearestSubscription, UserFacility, VNode
} from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { AbstractMfdNrstFacilityPage } from '../../AbstractMfdNrstFacilityPage';

/**
 * An MFD nearest user waypoints page.
 */
export class MfdNrstUserWaypointPage extends AbstractMfdNrstFacilityPage<FacilityType.USR> {
  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.rootCssClass.add('mfd-nrst-user-page');

    this._title.set('User WPTs');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_user.png`);
  }

  /** @inheritDoc */
  protected getNearestSubscription(context: G3XNearestContext): NearestSubscription<UserFacility> {
    return context.usrs;
  }

  /** @inheritDoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<UserFacility>>): VNode {
    return (
      <UiNearestWaypointListItem
        entry={data}
        unitsSettingManager={this.unitsSettingManager}
        gduFormat={this.props.uiService.gduFormat}
        onFocusGained={entry => { this._selectedWaypoint.set(entry.waypoint); }}
        onButtonPressed={entry => { this.openWaypointInfoPopup(entry.waypoint); }}
        class='nearest-user-list-item'
      >
      </UiNearestWaypointListItem>
    );
  }
}