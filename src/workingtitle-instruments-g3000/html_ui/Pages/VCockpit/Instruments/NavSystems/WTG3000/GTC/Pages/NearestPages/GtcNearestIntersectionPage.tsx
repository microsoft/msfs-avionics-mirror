import { FacilityType, FacilityWaypoint, FSComponent, IntersectionFacility, NearestSubscription, VNode } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType, NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';

import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNearestWaypointOptionsPopup } from './GtcNearestWaypointOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage } from './GtcNearestWaypointPage';

/**
 * GTC view keys for popups owned by nearest intersection pages.
 */
enum GtcNearestIntersectionPagePopupKeys {
  Options = 'NearestIntersectionOptions'
}

/**
 * A GTC nearest intersection page.
 */
export class GtcNearestIntersectionPage extends GtcNearestWaypointPage<FacilityType.Intersection> {
  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestIntersectionPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.Intersection;

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<IntersectionFacility> {
    return context.intersections;
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

    this._title.set('Nearest Intersection');
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-intersection-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'Intersection';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return null;
  }

  /** @inheritdoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<IntersectionFacility>>): VNode {
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
        title='Nearest Intersection'
        waypointTypeText='Intersection'
        waypointInfoViewKey={GtcViewKeys.IntersectionInfo}
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }
}