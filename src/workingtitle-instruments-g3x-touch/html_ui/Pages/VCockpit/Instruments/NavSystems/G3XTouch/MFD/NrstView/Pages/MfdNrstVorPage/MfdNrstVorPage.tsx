import {
  FSComponent, FacilityType, FacilityUtils, FacilityWaypoint, NearestSubscription, RadioFrequencyFormatter, ReadonlyFloat64Array, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { EisLayouts } from '../../../../Shared/CommonTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../../Shared/Graphics/Text/G3XSpecialChar';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { AbstractMfdNrstFacilityPage } from '../../AbstractMfdNrstFacilityPage';

import './MfdNrstVorPage.css';

/**
 * An MFD nearest VORs page.
 */
export class MfdNrstVorPage extends AbstractMfdNrstFacilityPage<FacilityType.VOR> {
  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createNav();

  // TODO: support GDU470 (portrait)
  private readonly compactBrgDis = this.props.uiService.gdu460EisLayout.map(eisLayout => {
    return eisLayout !== EisLayouts.None;
  }).pause();

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.rootCssClass.add('mfd-nrst-vor-page');

    this._title.set('VORs');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_vor.png`);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    super.onOpen(sizeMode, dimensions);

    this.compactBrgDis.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    super.onClose();

    this.compactBrgDis.pause();
  }

  /** @inheritDoc */
  protected getNearestSubscription(context: G3XNearestContext): NearestSubscription<VorFacility> {
    return context.vors;
  }

  /** @inheritDoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<VorFacility>>): VNode {
    const freqText = data.store.facility.map(facility => {
      if (facility && FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
        return MfdNrstVorPage.FREQ_FORMATTER(facility.freqMHz * 1e6);
      } else {
        return '–––';
      }
    });

    return (
      <UiNearestWaypointListItem
        entry={data}
        compactBrgDis={this.compactBrgDis}
        unitsSettingManager={this.unitsSettingManager}
        gduFormat={this.props.uiService.gduFormat}
        onFocusGained={entry => { this._selectedWaypoint.set(entry.waypoint); }}
        onButtonPressed={entry => { this.openWaypointInfoPopup(entry.waypoint); }}
        class='nearest-vor-list-item'
      >
        <div class='nearest-wpt-list-item-divider' />
        <div class='nearest-vor-list-item-freq'>
          {freqText}{G3XSpecialChar.Megahertz}
        </div>
      </UiNearestWaypointListItem>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.compactBrgDis.destroy();

    super.destroy();
  }
}