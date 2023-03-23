import { FacilityType, FacilityWaypoint, FSComponent, NdbFacility, NearestSubscription, RadioFrequencyFormatter, VNode } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType, NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';

import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNearestWaypointOptionsPopup } from './GtcNearestWaypointOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage } from './GtcNearestWaypointPage';

import './GtcNearestNdbPage.css';

/**
 * GTC view keys for popups owned by nearest NDB pages.
 */
enum GtcNearestNdbPagePopupKeys {
  Options = 'NearestNdbOptions'
}

/**
 * A GTC nearest NDB page.
 */
export class GtcNearestNdbPage extends GtcNearestWaypointPage<FacilityType.NDB> {
  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createAdf();

  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestNdbPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.Ndb;

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<NdbFacility> {
    return context.ndbs;
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

    this._title.set('Nearest NDB');
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-ndb-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'NDB';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return (
      <div class='nearest-page-header-freq'>Frequency</div>
    );
  }

  /** @inheritdoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<NdbFacility>>): VNode {
    return (
      <GtcNearestWaypointPageListItem
        gtcService={this.props.gtcService}
        optionsPopupKey={this.optionsPopupKey}
        entry={data}
        selectedWaypoint={this.selectedWaypoint}
        unitsSettingManager={this.unitsSettingManager}
        paddedListItem
      >
        {/* Even though the property is called freqMHz, for NDBs the frequency is reported in kHz */}
        <div class='nearest-page-list-item-freq'>{GtcNearestNdbPage.FREQ_FORMATTER(data.waypoint.facility.get().freqMHz * 1e3)}</div>
      </GtcNearestWaypointPageListItem>
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
        title='Nearest NDB'
        waypointTypeText='NDB'
        waypointInfoViewKey={GtcViewKeys.NdbInfo}
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }
}