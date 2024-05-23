import {
  FSComponent, FacilityType, GeoPoint, GeoPointSubject, ICAO, NumberFormatter, Subject, SubscribableUtils,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { WaypointInfoPopup } from '../../../../../../MFD/Views/WaypointInfoPopup/WaypointInfoPopup';
import { G3XBearingDisplay } from '../../../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiListButton } from '../../../../../../Shared/Components/List/UiListButton';
import { UiNearestWaypointList } from '../../../../../../Shared/Components/Nearest/UiNearestWaypointList';
import { UiWaypointIcon } from '../../../../../../Shared/Components/Waypoint/UiWaypointIcon';
import { PositionHeadingDataProvider } from '../../../../../../Shared/Navigation/PositionHeadingDataProvider';
import { BasicNearestWaypointEntry } from '../../../../../../Shared/Nearest/BasicNearestWaypointEntry';
import { G3XNearestContext } from '../../../../../../Shared/Nearest/G3XNearestContext';
import { NearestFacilityWaypointArray } from '../../../../../../Shared/Nearest/NearestWaypointArray';
import { NearestWaypointEntry } from '../../../../../../Shared/Nearest/NearestWaypointEntry';
import { G3XUnitsUserSettings } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../../../Shared/UiSystem/UiViewTypes';
import { AbstractPfdInset } from '../../AbstractPfdInset';
import { PfdInsetProps } from '../../PfdInset';

import './PfdNearestAirportsInset.css';

/**
 * Component props for {@link PfdNearestAirportsInset}.
 */
export interface PfdNearestAirportsInsetProps extends PfdInsetProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;
}

/**
 * A PFD nearest airports inset.
 */
export class PfdNearestAirportsInset extends AbstractPfdInset<PfdNearestAirportsInsetProps> {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private static readonly UPDATE_INTERVAL = 1000; // milliseconds
  private static readonly GPS_FAIL_CLEAR_LIST_DELAY = 10000; // milliseconds

  private readonly listRef = FSComponent.createRef<UiNearestWaypointList<NearestWaypointEntry<AirportWaypoint>>>();

  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private nearestContext?: G3XNearestContext;

  private readonly waypointArray = new NearestFacilityWaypointArray<FacilityType.Airport>(
    this.props.uiService.bus,
    waypoint => new BasicNearestWaypointEntry(waypoint, this.ppos, this.planeHeadingTrue),
    this.props.posHeadingDataProvider.isGpsDataFailed,
    PfdNearestAirportsInset.GPS_FAIL_CLEAR_LIST_DELAY
  );

  private nearestFacilitiesUpdateSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;

  private isOpen = false;

  private lastUpdateTime?: number;

  /**
   * Creates a new instance of PfdNearestAirportsInset.
   * @param props This component's props.
   */
  public constructor(props: PfdNearestAirportsInsetProps) {
    super(props);

    this.initNearestSearch();
  }

  /**
   * Initializes this inset's nearest waypoints search.
   */
  private async initNearestSearch(): Promise<void> {
    this.nearestContext = await G3XNearestContext.getInstance();

    this.waypointArray.init(this.nearestContext.airports, !this.isOpen);

    this.nearestFacilitiesUpdateSub = this.nearestContext.updateEvent.on(() => {
      this.listRef.getOrDefault()?.updateOrder();
    }, !this.isOpen);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.updateAirplaneData();

        this.listRef.instance.updateOrder();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isOpen = true;

    this.waypointArray.resume();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.resume(true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;
    this.lastUpdateTime = undefined;

    this.waypointArray.pause();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.pause();
    this.nearestFacilitiesUpdateSub?.pause();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastUpdateTime !== undefined && time < this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }

    if (this.lastUpdateTime === undefined || time - this.lastUpdateTime >= PfdNearestAirportsInset.UPDATE_INTERVAL) {
      this.updateAirplaneData();

      this.lastUpdateTime = time;
    }
  }

  /**
   * Updates this inset's airplane data.
   */
  private updateAirplaneData(): void {
    this.ppos.set(this.props.posHeadingDataProvider.pposWithFailure.get());
    this.planeHeadingTrue.set(this.props.posHeadingDataProvider.headingTrueWithFailure.get());
  }

  /**
   * Opens a waypoint information popup and sets it to display a waypoint.
   * @param waypoint The waypoint for the popup to display.
   */
  private openWaypointInfoPopup(waypoint: AirportWaypoint): void {
    this.props.uiService
      .openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, true, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide'
      })
      .ref.setWaypoint(waypoint);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pfd-nearest-airports-inset'>
        <div class='pfd-nearest-airports-inset-header'>
          <div class='pfd-nearest-airports-inset-header-apts'>NRST Apts</div>
          <div class='pfd-nearest-airports-inset-header-brg'>BRG</div>
          <div class='pfd-nearest-airports-inset-header-dis'>DIST</div>
        </div>
        <UiNearestWaypointList<NearestWaypointEntry<AirportWaypoint>>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.waypointArray}
          renderItem={this.renderListItem.bind(this)}
          listItemLengthPx={43}
          listItemSpacingPx={5}
          itemsPerPage={5}
          noResultsText='None Within 200nm'
          class='pfd-nearest-airports-inset-list'
        />
      </div>
    );
  }

  /**
   * Renders one of this inset's nearest airport list items.
   * @param entry The nearest waypoint entry describing the list item's airport.
   * @returns A nearest airport list item for the specified entry, as a VNode.
   */
  private renderListItem(entry: NearestWaypointEntry<AirportWaypoint>): VNode {
    const identText = entry.store.facility.map(facility => facility ? ICAO.getIdent(facility.icao) : '');

    return (
      <UiListButton
        fullSize
        canBeFocused={false}
        onPressed={this.openWaypointInfoPopup.bind(this, entry.waypoint)}
        onDestroy={() => { identText.destroy(); }}
        class='pfd-nearest-airports-inset-list-item-button'
      >
        <UiWaypointIcon waypoint={entry.store.waypoint} class='pfd-nearest-airports-inset-list-item-icon' />
        <div class='pfd-nearest-airports-inset-list-item-main'>
          <div class='pfd-nearest-airports-inset-list-item-ident'>{identText}</div>
          <G3XBearingDisplay
            value={entry.store.bearing}
            displayUnit={this.unitsSettingManager.navAngleUnits}
            formatter={PfdNearestAirportsInset.BEARING_FORMATTER}
            class='pfd-nearest-airports-inset-list-item-brg'
          />
          <G3XNumberUnitDisplay
            value={entry.store.distance}
            displayUnit={this.unitsSettingManager.distanceUnitsLarge}
            formatter={PfdNearestAirportsInset.DISTANCE_FORMATTER}
            class='pfd-nearest-airports-inset-list-item-dis'
          />
        </div>
      </UiListButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.waypointArray.destroy();

    this.isGpsDataFailedSub?.destroy();

    super.destroy();
  }
}