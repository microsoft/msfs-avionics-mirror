import {
  FSComponent, FacilityType, FacilityUtils, FacilityWaypoint, NdbFacility, NearestSubscription, NumberFormatter, ReadonlyFloat64Array, VNode
} from '@microsoft/msfs-sdk';

import { EisLayouts } from '../../../../Shared/CommonTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../../Shared/Graphics/Text/G3XSpecialChar';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { AbstractMfdNrstFacilityPage } from '../../AbstractMfdNrstFacilityPage';

import './MfdNrstNdbPage.css';

/**
 * An MFD nearest NDBs page.
 */
export class MfdNrstNdbPage extends AbstractMfdNrstFacilityPage<FacilityType.NDB> {
  private static readonly FREQ_FORMATTER = NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false });

  // TODO: support GDU470 (portrait)
  private readonly compactBrgDis = this.props.uiService.gdu460EisLayout.map(eisLayout => {
    return eisLayout !== EisLayouts.None;
  }).pause();

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.rootCssClass.add('mfd-nrst-ndb-page');

    this._title.set('NDBs');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_ndb.png`);
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
  protected getNearestSubscription(context: G3XNearestContext): NearestSubscription<NdbFacility> {
    return context.ndbs;
  }

  /** @inheritDoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<NdbFacility>>): VNode {
    const freqText = data.store.facility.map(facility => {
      if (facility && FacilityUtils.isFacilityType(facility, FacilityType.NDB)) {
        return MfdNrstNdbPage.FREQ_FORMATTER(facility.freqMHz);
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
        onDestroy={() => { freqText.destroy(); }}
        class='nearest-ndb-list-item'
      >
        <div class='nearest-wpt-list-item-divider' />
        <div class='nearest-ndb-list-item-freq'>
          {freqText}{G3XSpecialChar.Kilohertz}
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