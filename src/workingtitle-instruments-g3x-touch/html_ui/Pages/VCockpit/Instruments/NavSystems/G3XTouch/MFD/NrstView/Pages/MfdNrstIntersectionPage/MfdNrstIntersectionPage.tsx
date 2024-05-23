import {
  FSComponent, FacilityType, FacilityWaypoint, IntersectionFacility, NearestSubscription, VNode
} from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { AbstractMfdNrstFacilityPage } from '../../AbstractMfdNrstFacilityPage';

/**
 * An MFD nearest intersections page.
 */
export class MfdNrstIntersectionPage extends AbstractMfdNrstFacilityPage<FacilityType.Intersection> {
  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.rootCssClass.add('mfd-nrst-int-page');

    this._title.set('Intersections');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_intersection.png`);
  }

  /** @inheritDoc */
  protected getNearestSubscription(context: G3XNearestContext): NearestSubscription<IntersectionFacility> {
    return context.intersections;
  }

  /** @inheritDoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<IntersectionFacility>>): VNode {
    return (
      <UiNearestWaypointListItem
        entry={data}
        unitsSettingManager={this.unitsSettingManager}
        gduFormat={this.props.uiService.gduFormat}
        onFocusGained={entry => { this._selectedWaypoint.set(entry.waypoint); }}
        onButtonPressed={entry => { this.openWaypointInfoPopup(entry.waypoint); }}
        class='nearest-int-list-item'
      />
    );
  }
}