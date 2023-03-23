import {
  AdditionalApproachType, AirportFacility, ExtendedApproachType, FacilityType, FSComponent, NearestSubscription, NumberFormatter, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, FmsUtils } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType, NearestWaypointEntry, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcNearestAirportOptionsPopup } from './GtcNearestAirportOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage, GtcNearestWaypointPageProps } from './GtcNearestWaypointPage';

import './GtcNearestAirportPage.css';

/**
 * Component props for GtcNearestAirportPage.
 */
export interface GtcNearestAirportPageProps extends GtcNearestWaypointPageProps {
  /** Whether RNP (AR) approaches should be considered when displaying the best approach. */
  allowRnpAr: boolean;
}

/**
 * GTC view keys for popups owned by nearest airport pages.
 */
enum GtcNearestAirportPagePopupKeys {
  Options = 'NearestAirportOptions'
}

/**
 * A GTC nearest airport page.
 */
export class GtcNearestAirportPage extends GtcNearestWaypointPage<FacilityType.Airport, NearestWaypointEntry<AirportWaypoint>, GtcNearestAirportPageProps> {
  private static readonly APPROACH_TYPE_TEXT: Record<ExtendedApproachType, string> = {
    [ApproachType.APPROACH_TYPE_UNKNOWN]: 'UNK',
    [AdditionalApproachType.APPROACH_TYPE_VISUAL]: 'VFR',
    [ApproachType.APPROACH_TYPE_NDB]: 'NDB',
    [ApproachType.APPROACH_TYPE_NDBDME]: 'NDB',
    [ApproachType.APPROACH_TYPE_VOR]: 'VOR',
    [ApproachType.APPROACH_TYPE_VORDME]: 'VOR',
    [ApproachType.APPROACH_TYPE_GPS]: 'GPS',
    [ApproachType.APPROACH_TYPE_RNAV]: 'RNA',
    [ApproachType.APPROACH_TYPE_SDF]: 'SDF',
    [ApproachType.APPROACH_TYPE_LDA]: 'LDA',
    [ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE]: 'LOC',
    [ApproachType.APPROACH_TYPE_LOCALIZER]: 'LOC',
    [ApproachType.APPROACH_TYPE_ILS]: 'ILS'
  };

  private static readonly RUNWAY_LENGTH_FORMATTER = NumberFormatter.create({ precision: 1 });

  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestAirportPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.Airport;

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<AirportFacility> {
    return context.airports;
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

    this._title.set('Nearest Airport');
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-airport-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'Airport';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return (
      <div class='nearest-page-header-appr-rwy'>APPR/RWY</div>
    );
  }

  /** @inheritdoc */
  protected renderListItem(data: NearestWaypointEntry<AirportWaypoint>): VNode {
    const runwayLength = data.waypoint.longestRunway?.length;

    return (
      <GtcNearestWaypointPageListItem
        gtcService={this.props.gtcService}
        optionsPopupKey={this.optionsPopupKey}
        entry={data}
        selectedWaypoint={this.selectedWaypoint}
        unitsSettingManager={this.unitsSettingManager}
        paddedListItem
      >
        <div class='nearest-page-list-item-appr-rwy'>
          <div>{GtcNearestAirportPage.APPROACH_TYPE_TEXT[FmsUtils.getBestApproachType(data.waypoint.facility.get(), true, this.props.allowRnpAr)]}</div>
          {
            runwayLength === undefined
              ? (<div> </div>)
              : (
                <NumberUnitDisplay
                  value={UnitType.METER.createNumber(runwayLength)}
                  displayUnit={UnitType.FOOT}
                  formatter={GtcNearestAirportPage.RUNWAY_LENGTH_FORMATTER}
                />
              )
          }
        </div>
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
      <GtcNearestAirportOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Nearest Airport'
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }
}