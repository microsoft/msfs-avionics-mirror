import { FacilityType, FacilityWaypoint, FSComponent, ICAO, MathUtils, NearestSubscription, RadioFrequencyFormatter, VNode, VorFacility } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType, NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLoadFrequencyDialog } from '../../Dialog/GtcLoadFrequencyDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNearestWaypointOptionsPopup } from './GtcNearestWaypointOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage } from './GtcNearestWaypointPage';

import './GtcNearestVorPage.css';

/**
 * GTC view keys for popups owned by nearest VOR pages.
 */
enum GtcNearestVorPagePopupKeys {
  Options = 'NearestVorOptions'
}

/**
 * A GTC nearest VOR page.
 */
export class GtcNearestVorPage extends GtcNearestWaypointPage<FacilityType.VOR> {
  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createNav();

  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestVorPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.Vor;

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<VorFacility> {
    return context.vors;
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

    this._title.set('Nearest VOR');
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-vor-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'VOR';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return (
      <div class='nearest-page-header-freq'>Frequency</div>
    );
  }

  /** @inheritdoc */
  protected renderListItem(data: NearestWaypointEntry<FacilityWaypoint<VorFacility>>): VNode {
    const facility = data.waypoint.facility.get();
    const ident = ICAO.getIdent(facility.icao);
    const freqMhz = MathUtils.round(facility.freqMHz, 0.01);

    return (
      <GtcNearestWaypointPageListItem
        gtcService={this.props.gtcService}
        optionsPopupKey={this.optionsPopupKey}
        entry={data}
        selectedWaypoint={this.selectedWaypoint}
        unitsSettingManager={this.unitsSettingManager}
        paddedListItem
      >
        <GtcTouchButton
          label={GtcNearestVorPage.FREQ_FORMATTER(freqMhz * 1e6)}
          onPressed={() => {
            this.props.gtcService.openPopup<GtcLoadFrequencyDialog>(GtcViewKeys.LoadFrequencyDialog)
              .ref.request({
                type: 'NAV',
                frequency: freqMhz,
                label: `${ident} VOR`
              });
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
          class='nearest-page-list-item-freq'
        />
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
        title='Nearest VOR'
        waypointTypeText='VOR'
        waypointInfoViewKey={GtcViewKeys.VorInfo}
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }
}