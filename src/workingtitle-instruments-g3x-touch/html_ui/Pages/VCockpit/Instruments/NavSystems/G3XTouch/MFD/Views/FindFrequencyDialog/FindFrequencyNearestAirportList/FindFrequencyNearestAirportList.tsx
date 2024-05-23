import {
  AirportFacility, ArraySubject, ComponentProps, DisplayComponent, FacilityType, FSComponent, GeoPoint,
  GeoPointSubject, NearestSubscription, NodeReference, RadioUtils, Subject, Subscribable, SubscribableUtils,
  Subscription, VNode,
} from '@microsoft/msfs-sdk';
import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { PositionHeadingDataProvider } from '../../../../Shared/Navigation/PositionHeadingDataProvider';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { UiList } from '../../../../Shared/Components/List/UiList';
import { UiNearestWaypointList } from '../../../../Shared/Components/Nearest/UiNearestWaypointList';
import { FindFrequencyListConfiguration } from '../AbstractFindFrequencyDialog';
import { FindFrequencyNearestAirportListItem } from './FindFrequencyNearestAirportListItem';
import { G3XUnitsUserSettingManager } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { NearestFacilityWaypointArray } from '../../../../Shared/Nearest/NearestWaypointArray';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { BasicNearestWaypointEntry } from '../../../../Shared/Nearest/BasicNearestWaypointEntry';


/** Component props for {@link FindFrequencyNearestAirportList}. */
export interface FindFrequencyNearestAirportListProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;
  /** The type of the find frequency dialog */
  radioType: 'com25' | 'com833' | 'nav';
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;
  /** The reference to the UiList component. */
  listRef: NodeReference<UiList<any>>;
  /** The configuration for the list. */
  listConfig: FindFrequencyListConfiguration;
  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;
  /** A subject which indicates whether the list has elements. */
  listHasElements: Subject<boolean>;
  /** A function which is called when the list item is selected. */
  onFrequencySelected: (frequency: number, name?: string) => void;
}

/**
 * A list of nearby airports for a find frequency dialog.
 */
export class FindFrequencyNearestAirportList extends DisplayComponent<FindFrequencyNearestAirportListProps> {
  protected static readonly UPDATE_INTERVAL = 1000; // milliseconds
  private static readonly GPS_FAIL_CLEAR_LIST_DELAY = 10000;

  /** The position of the airplane. */
  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  /** The true heading of the airplane, in degrees, or `NaN` if heading data is invalid. */
  private readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly rawAirportsArray = new NearestFacilityWaypointArray<FacilityType.Airport>(
    this.props.uiService.bus,
    this.createWaypointEntry.bind(this),
    this.props.posHeadingDataProvider.isGpsDataFailed,
    FindFrequencyNearestAirportList.GPS_FAIL_CLEAR_LIST_DELAY,
  );

  private filteredAirportsArray = ArraySubject.create<NearestWaypointEntry<AirportWaypoint>>();

  private nearestContext?: G3XNearestContext;
  private nearestSubscription?: NearestSubscription<AirportFacility>;
  private nearestFacilitiesUpdateSub?: Subscription;
  private airportsFilterSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;

  private lastUpdateTime?: number;

  private isPaused = true;

  /** @inheritDoc */
  public constructor(props: FindFrequencyNearestAirportListProps) {
    super(props);

    this.initNearestSearch();
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.updateAirplaneData();

        this.props.listRef.instance.updateOrder();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, this.isPaused);
  }

  /** Pauses subscriptions in the {@link FindFrequencyNearestAirportList}. */
  public pause(): void {
    this.isPaused = true;
    this.rawAirportsArray.pause();
    this.nearestFacilitiesUpdateSub?.pause();
    this.airportsFilterSub?.pause();
    this.isGpsDataFailedSub?.pause();
  }

  /** Resumes subscriptions in the {@link FindFrequencyNearestAirportList}. */
  public resume(): void {
    this.isPaused = false;
    this.isGpsDataFailedSub?.resume(true);
    this.nearestFacilitiesUpdateSub?.resume(true);
    this.rawAirportsArray.resume();
    this.airportsFilterSub?.resume(true);
  }

  /**
   * Updates the {@link FindFrequencyNearestAirportList} if the required time has passed in the sim and the list is not paused.
   * @param time The current sim timestamp.
   */
  public update(time: number): void {
    if (this.isPaused) {
      return;
    }

    if (this.lastUpdateTime !== undefined && time < this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }

    if (this.lastUpdateTime === undefined || time - this.lastUpdateTime >= FindFrequencyNearestAirportList.UPDATE_INTERVAL) {
      this.doUpdate(time);

      this.lastUpdateTime = time;
    }
  }

  /**
   * Initializes the nearest search.
   * @returns A promise that resolves when the nearest search is initialized.
   */
  private async initNearestSearch(): Promise<void> {
    this.nearestContext = await G3XNearestContext.getInstance();
    this.nearestSubscription = this.nearestContext.airports;

    this.rawAirportsArray.init(this.nearestSubscription, this.isPaused);

    this.nearestFacilitiesUpdateSub = this.nearestContext.updateEvent.on(() => {
      const list = this.props.listRef.getOrDefault();
      if (list) {
        list.updateOrder();
      }
    }, this.isPaused);

    this.airportsFilterSub = this.rawAirportsArray.sub((index, type, item, array) => {
      this.filterAirports(array);
      this.props.listRef.instance.focusRecent();
    }, true, this.isPaused);
  }

  /**
   * Filters the nearest waypoints to only include those that are valid for the current find frequency dialog type.
   * @param array The array of nearest waypoints to filter.
   */
  private filterAirports(array: readonly NearestWaypointEntry<AirportWaypoint>[]): void {
    let filteredArray: NearestWaypointEntry<AirportWaypoint>[];
    if (this.props.radioType === 'nav') {
      filteredArray = array.filter(item => {
        return item.waypoint.facility.get().frequencies.some(f => RadioUtils.isNavFrequency(f.freqMHz));
      });
    } else if (this.props.radioType === 'com833') {
      filteredArray = array.filter(item => {
        return item.waypoint.facility.get().frequencies.some(f => RadioUtils.isCom25Frequency(f.freqMHz) || RadioUtils.isCom833Frequency(f.freqMHz));
      });
    } else {
      filteredArray = array.filter(item => {
        return item.waypoint.facility.get().frequencies.some(f => RadioUtils.isCom25Frequency(f.freqMHz));
      });
    }
    this.filteredAirportsArray.set(filteredArray);
    this.props.listHasElements.set(filteredArray.length > 0);
  }

  /**
   * Updates this list.
   * @param time The current timestamp in the sim.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private doUpdate(time: number): void {
    this.updateAirplaneData();
  }

  /**
   * Updates this page's airplane data.
   */
  private updateAirplaneData(): void {
    this.ppos.set(this.props.posHeadingDataProvider.pposWithFailure.get());
    this.planeHeadingTrue.set(this.props.posHeadingDataProvider.headingTrueWithFailure.get());
  }

  /**
   * Creates a waypoint entry for a nearest facility search result.
   * @param waypoint A nearest facility search result, as a Waypoint.
   * @returns A waypoint entry for the specified nearest facility search result.
   */
  private createWaypointEntry(waypoint: AirportWaypoint): NearestWaypointEntry<AirportWaypoint> {
    return new BasicNearestWaypointEntry(waypoint, this.ppos, this.planeHeadingTrue) as unknown as NearestWaypointEntry<AirportWaypoint>;
  }

  /**
   * Gets the text to show when no nearest waypoints are available to display.
   * @returns The text to show when no nearest waypoints are available to display.
   */
  private getNoResultsText(): string | Subscribable<string> {
    return 'None Within Range';
  }

  /**
   * Renders a list item for a nearest waypoint.
   * @param data The data for the list item.
   * @returns A list item VNode for a nearest waypoint.
   */
  private renderListItem(data: NearestWaypointEntry<AirportWaypoint>): VNode {
    return <FindFrequencyNearestAirportListItem
      uiService={this.props.uiService}
      airportData={data}
      radioType={this.props.radioType}
      unitsSettingManager={this.props.unitsSettingManager}
      onFrequencySelected={this.props.onFrequencySelected}
    />;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <UiNearestWaypointList
        ref={this.props.listRef}
        validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
        bus={this.props.uiService.bus}
        data={this.filteredAirportsArray}
        renderItem={this.renderListItem.bind(this)}
        listItemLengthPx={this.props.listConfig.itemHeightPx}
        listItemSpacingPx={this.props.listConfig.itemSpacingPx}
        itemsPerPage={this.props.listConfig.itemsPerPage}
        lengthPx={this.props.listConfig.listHeightPx}
        noResultsText={this.getNoResultsText()}
        class="find-freq-nrst-airport-list"
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.isPaused = false;
    this.rawAirportsArray.destroy();
    this.nearestFacilitiesUpdateSub?.destroy();
    this.airportsFilterSub?.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.props.listRef.instance.destroy();
  }
}
