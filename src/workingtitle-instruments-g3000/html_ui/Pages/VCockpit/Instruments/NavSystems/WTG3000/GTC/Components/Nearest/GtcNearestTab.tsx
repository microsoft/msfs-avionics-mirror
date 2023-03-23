import {
  AbstractSubscribableArray, ArraySubject, DisplayComponent, EventBus, FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent,
  GeoPoint, GeoPointInterface, GeoPointSubject, MutableSubscribable, SetSubject, Subject, Subscribable, SubscribableArray,
  SubscribableArrayEventType, SubscribableUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';
import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import {
  BasicNearestWaypointEntry, DynamicListData, G3000NearestContext, G3000WaypointSearchType, NearestWaypointArray, NearestWaypointEntry,
} from '@microsoft/msfs-wtg3000-common';
import { BtnImagePath } from '../../ButtonBackgroundImagePaths';
import { GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcList } from '../List/GtcList';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';
import { GtcListSelectTouchButton } from '../TouchButton/GtcListSelectTouchButton';
import { GtcNearestWaypointListItem } from './GtcNearestWaypointListItem';
import { GtcNearestWaypointList } from './GtcNearestWaypointList';

import './GtcNearestTab.css';

const GPS_FAIL_CLEAR_LIST_DELAY = 10000; // milliseconds
const DEFAULT_NEAREST_WAYPOINT_FILTER = FacilitySearchType.Airport;

/** An array containing the nearest combination of waypoints for use in a {@link GtcNearestTab}. */
class NearestCombinedWaypointArray<EntryType extends NearestWaypointEntry<FacilityWaypoint>>
  extends AbstractSubscribableArray<EntryType> {
  private readonly workingArray: EntryType[] = [];
  private readonly backingArray: EntryType[] = [];
  private readonly source: SubscribableArray<EntryType>[];

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(private readonly maxLength: number, ...source: SubscribableArray<EntryType>[]) {
    super();
    this.source = source;
  }

  /**
   * Sorts this list's nearest waypoint entries in order of increasing distance from the airplane's current position.
   * @param a The first entry.
   * @param b The second entry.
   * @returns A negative number if the first entry's waypoint is closer to the airplane than the second's waypoint,
   * a positive number if the opposite is true, or zero if both are equidistant to the airplane or one or both
   * distances are unknown.
   */
  private static sortListItems(a: NearestWaypointEntry<any>, b: NearestWaypointEntry<any>): number {
    const compare = a.store.distance.get().compare(b.store.distance.get());
    return isNaN(compare) ? 0 : compare;
  }

  /** Recompute the array. */
  public update(): void {
    // Flatten, sort, and truncate the source arrays into the working array.
    this.workingArray.length = 0;
    this.source.forEach((arr: SubscribableArray<EntryType>) =>
      arr.getArray().forEach((entry: EntryType) => this.workingArray.push(entry)));
    this.workingArray.sort(NearestCombinedWaypointArray.sortListItems);
    this.workingArray.length = Math.min(this.workingArray.length, this.maxLength);

    // Modify the backing array to match the working array.
    for (let i = 0; i < this.backingArray.length; i++) {
      const elem: EntryType = this.backingArray[i];
      if (!this.workingArray.includes(elem)) {
        this.backingArray.splice(i, 1);
        this.notify(i, SubscribableArrayEventType.Removed, elem);
        i--;
      }
    }

    for (let i = 0; i < this.workingArray.length; i++) {
      const elem: EntryType = this.workingArray[i];
      if (!this.backingArray.includes(elem)) {
        this.backingArray.push(elem);
        this.notify(this.backingArray.length - 1, SubscribableArrayEventType.Added, elem);
      }
    }
  }

  /** @inheritDoc */
  get length(): number {
    return this.backingArray.length;
  }

  /** @inheritDoc */
  getArray(): readonly EntryType[] {
    return this.backingArray;
  }
}

/** Returns {@link NearestWaypointArray}s for use in the {@link GtcFindDialog}. */
class NearestWaypointArrayManager {
  private type?: G3000WaypointSearchType;

  /**
   * Creates a waypoint entry for a nearest facility search result.
   * @param waypoint A nearest facility search result, as a Waypoint.
   * @returns A waypoint entry for the specified nearest facility search result.
   */
  private createWaypointEntry = (waypoint: FacilityWaypoint): BasicNearestWaypointEntry<FacilityWaypoint> =>
    new BasicNearestWaypointEntry(waypoint, this.ppos, this.planeHeadingTrue);

  private nearestWaypointArrayFactory = (): NearestWaypointArray<any, any> => new NearestWaypointArray(
    this.bus,
    this.createWaypointEntry,
    this.isGpsDataFailed,
    GPS_FAIL_CLEAR_LIST_DELAY
  );

  private readonly waypointArrayAirports: NearestWaypointArray<FacilityType.Airport> = this.nearestWaypointArrayFactory();
  private readonly waypointArrayIntersections: NearestWaypointArray<FacilityType.Intersection> = this.nearestWaypointArrayFactory();
  private readonly waypointArrayVors: NearestWaypointArray<FacilityType.VOR> = this.nearestWaypointArrayFactory();
  private readonly waypointArrayNdbs: NearestWaypointArray<FacilityType.NDB> = this.nearestWaypointArrayFactory();
  private readonly waypointArrayUser: NearestWaypointArray<FacilityType.USR> = this.nearestWaypointArrayFactory();
  private readonly waypointArrayAll = new NearestCombinedWaypointArray<NearestWaypointEntry<FacilityWaypoint>>(25,
    this.waypointArrayAirports,
    this.waypointArrayIntersections,
    this.waypointArrayVors,
    this.waypointArrayNdbs,
    this.waypointArrayUser,
  );

  private arraySubHandler = (index: number, type: SubscribableArrayEventType,
    item: NearestWaypointEntry<FacilityWaypoint> | readonly NearestWaypointEntry<FacilityWaypoint>[] | undefined
  ): void => {
    switch (type) {
      case SubscribableArrayEventType.Added:
        if (item !== undefined) {
          Array.isArray(item) ?
            this._targetWptArray.insertRange(index, item) :
            this._targetWptArray.insert(item as NearestWaypointEntry<FacilityWaypoint>, index);
        }
        break;
      case SubscribableArrayEventType.Removed:
        this._targetWptArray.removeAt(index);
        break;
      case SubscribableArrayEventType.Cleared:
        this._targetWptArray.clear();
        break;
    }
  };

  private waypointArrayAllSub: Subscription = this.waypointArrayAll.sub(this.arraySubHandler, false, true);
  private waypointArrayAirportsSub: Subscription = this.waypointArrayAirports.sub(this.arraySubHandler, false, true);
  private waypointArrayIntersectionsSub: Subscription = this.waypointArrayIntersections.sub(this.arraySubHandler, false, true);
  private waypointArrayVorsSub: Subscription = this.waypointArrayVors.sub(this.arraySubHandler, false, true);
  private waypointArrayNdbsSub: Subscription = this.waypointArrayNdbs.sub(this.arraySubHandler, false, true);
  private waypointArrayUserSub: Subscription = this.waypointArrayUser.sub(this.arraySubHandler, false, true);

  private readonly _targetWptArray: ArraySubject<NearestWaypointEntry<FacilityWaypoint>> = ArraySubject.create();
  public readonly waypointArray: SubscribableArray<NearestWaypointEntry<FacilityWaypoint>> = this._targetWptArray;

  private isPaused = true;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param ppos The present position of the airplane.
   * @param planeHeadingTrue The true heading of the airplane, in degrees.
   * @param isGpsDataFailed Whether GPS location data is in a failed state.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly ppos: Subscribable<GeoPointInterface>,
    private readonly planeHeadingTrue: Subscribable<number>,
    private readonly isGpsDataFailed: Subscribable<boolean>
  ) {

  }

  /**
   * Returns the appropriate {@link NearestWaypointArray} for a given {@link G3000WaypointSearchType}.
   * @param facilitySearchType The facility type to search.
   * @returns The appropriate {@link NearestWaypointArray} for a given {@link G3000WaypointSearchType}.
   * @throws If an unhandled {@link G3000WaypointSearchType} is passed.
   */
  private getWaypointArray(facilitySearchType: G3000WaypointSearchType | undefined): NearestWaypointArray<any> | undefined {
    switch (facilitySearchType) {
      case FacilitySearchType.Airport: return this.waypointArrayAirports;
      case FacilitySearchType.Intersection: return this.waypointArrayIntersections;
      case FacilitySearchType.Vor: return this.waypointArrayVors;
      case FacilitySearchType.Ndb: return this.waypointArrayNdbs;
      case FacilitySearchType.User: return this.waypointArrayUser;
      default: return undefined;
    }
  }

  /**
   * Returns the appropriate {@link NearestWaypointArray} {@link Subscription} for a given {@link G3000WaypointSearchType}.
   * @param facilitySearchType The facility type to search.
   * @returns The appropriate {@link Subscription} for a given {@link G3000WaypointSearchType}.
   * @throws If an unhandled {@link G3000WaypointSearchType} is passed.
   */
  private getWaypointArraySub(facilitySearchType: G3000WaypointSearchType | undefined): Subscription | undefined {
    switch (facilitySearchType) {
      case FacilitySearchType.AllExceptVisual: return this.waypointArrayAllSub;
      case FacilitySearchType.Airport: return this.waypointArrayAirportsSub;
      case FacilitySearchType.Intersection: return this.waypointArrayIntersectionsSub;
      case FacilitySearchType.Vor: return this.waypointArrayVorsSub;
      case FacilitySearchType.Ndb: return this.waypointArrayNdbsSub;
      case FacilitySearchType.User: return this.waypointArrayUserSub;
      default: return undefined;
    }
  }

  /**
   * Initializes the {@link NearestWaypointArray}s.
   * @param nearestContext A {@link G3000NearestContext}.
   * @param isPaused Whether to initialize the {@link NearestWaypointArray} as paused.
   * */
  public init(nearestContext: G3000NearestContext, isPaused: boolean): void {
    this.isPaused = isPaused;

    this.waypointArrayAirports.init(nearestContext.airports, isPaused);
    this.waypointArrayIntersections.init(nearestContext.intersections, isPaused);
    this.waypointArrayVors.init(nearestContext.vors, isPaused);
    this.waypointArrayNdbs.init(nearestContext.ndbs, isPaused);
    this.waypointArrayUser.init(nearestContext.usrs, isPaused);
  }

  /**
   * Changes the waypoint type.
   * @param type The waypoint type to change to.
   * */
  public changeWaypointType(type: G3000WaypointSearchType): void {
    if (this.type === type) { return; }

    if (this.type === FacilitySearchType.AllExceptVisual) {
      this.waypointArrayAirports.pause();
      this.waypointArrayIntersections.pause();
      this.waypointArrayVors.pause();
      this.waypointArrayNdbs.pause();
      this.waypointArrayUser.pause();

      this.waypointArrayAllSub.pause();
    } else {
      this.getWaypointArray(this.type)?.pause();
      this.getWaypointArraySub(this.type)?.pause();
    }

    this._targetWptArray.clear();
    this.type = type;

    if (type === FacilitySearchType.AllExceptVisual) {
      if (!this.isPaused) {
        this.waypointArrayAirports.resume();
        this.waypointArrayIntersections.resume();
        this.waypointArrayVors.resume();
        this.waypointArrayNdbs.resume();
        this.waypointArrayUser.resume();

        this.waypointArrayAll.update();
      }

      this.waypointArrayAllSub.resume(true);
    } else {
      if (!this.isPaused) {
        this.getWaypointArray(type)?.resume();
      }

      this.getWaypointArraySub(type)?.resume(true);
    }
  }

  /** The Resume lifecycle function. */
  public resume(): void {
    this.isPaused = false;

    if (this.type === FacilitySearchType.AllExceptVisual) {
      this.waypointArrayAirports.resume();
      this.waypointArrayIntersections.resume();
      this.waypointArrayVors.resume();
      this.waypointArrayNdbs.resume();
      this.waypointArrayUser.resume();

      this.waypointArrayAll.update();
    } else {
      this.getWaypointArray(this.type)?.resume();
    }
  }

  /** The Pause lifecycle function. */
  public pause(): void {
    this.isPaused = true;

    if (this.type === FacilitySearchType.AllExceptVisual) {
      this.waypointArrayAirports.pause();
      this.waypointArrayIntersections.pause();
      this.waypointArrayVors.pause();
      this.waypointArrayNdbs.pause();
      this.waypointArrayUser.pause();
    } else {
      this.getWaypointArray(this.type)?.pause();
    }
  }

  /** Update the {@link NearestCombinedWaypointArray} if the search type is "any". */
  public update(): void {
    this.type === FacilitySearchType.AllExceptVisual && this.waypointArrayAll.update();
  }
}

/** {@link GtcNearestTab} props. */
export interface GtcNearestTabProps extends GtcViewProps {
  /** An event bus. */
  bus: EventBus;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;

  /** A function to execute when a waypoint is selected. */
  onSelected: (waypoint: FacilityWaypoint) => void;

  /** Type of facility to search. */
  facilitySearchType: G3000WaypointSearchType | Subscribable<G3000WaypointSearchType>;

  /** A reference to the parent {@link GtcView}'s `_activeComponent`. */
  activeComponent?: MutableSubscribable<GtcInteractionHandler | null>;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A GTC tab which allows the user to select from a list of nearest waypoints.
 */
export class GtcNearestTab extends DisplayComponent<GtcNearestTabProps> {
  private readonly listRef = FSComponent.createRef<GtcList<NearestWaypointEntry<any> & DynamicListData>>();
  private readonly filterButtonRef = FSComponent.createRef<GtcListSelectTouchButton<any>>();

  private readonly rootCssClass = SetSubject.create(['gtc-nearest-tab']);

  private readonly nearestWptFilterClasses = SetSubject.create(['nearest-wpt-filter']);
  private readonly nearestWptFilterAllClasses = SetSubject.create(['nearest-wpt-filter-icon', 'nearest-wpt-filter-icon-all', 'hidden']);
  private readonly nearestWptFilterAirportClasses = SetSubject.create(['nearest-wpt-filter-icon', 'hidden']);
  private readonly nearestWptFilterIntersectionClasses = SetSubject.create(['nearest-wpt-filter-icon', 'hidden']);
  private readonly nearestWptFilterNdbClasses = SetSubject.create(['nearest-wpt-filter-icon', 'hidden']);
  private readonly nearestWptFilterVorClasses = SetSubject.create(['nearest-wpt-filter-icon', 'hidden']);
  private readonly nearestWptFilterUserClasses = SetSubject.create(['nearest-wpt-filter-icon', 'hidden']);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);

  /** The position of the airplane. */
  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  /** The true heading of the airplane, in degrees, or `NaN` if heading data is invalid. */
  private readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly wptArrayManager = new NearestWaypointArrayManager(
    this.props.bus,
    this.ppos,
    this.planeHeadingTrue,
    this.props.posHeadingDataProvider.isGpsDataFailed
  );

  private readonly nearestWaypointFilter = Subject.create<G3000WaypointSearchType>(FacilitySearchType.Airport);

  private readonly itemsPerPage = Subject.create(4);

  private isPaused = true;

  private pposPipe?: Subscription;
  private headingPipe?: Subscription;
  private nearestWaypointFilterSub?: Subscription;
  private nearestFacilitiesUpdateSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;
  private facilitySearchTypeSub?: Subscription;
  private isGpsDrSub?: Subscription;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(props: GtcNearestTabProps) {
    super(props);
    this.initNearestSearch();
  }

  /** Initializes this page's nearest waypoints search. */
  private async initNearestSearch(): Promise<void> {
    const nearestContext: G3000NearestContext = await G3000NearestContext.getInstance();
    this.wptArrayManager.init(nearestContext, this.isPaused);
    this.nearestFacilitiesUpdateSub = nearestContext.updateEvent
      .on(() => {
        this.wptArrayManager.update();
        this.listRef.getOrDefault()?.updateOrder();
      }, this.isPaused);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);
    this.headingPipe = this.props.posHeadingDataProvider.headingTrueWithFailure.pipe(this.planeHeadingTrue, true);

    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.wptArrayManager.update();
        this.listRef.instance.updateOrder();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, true);

    this.nearestWaypointFilterSub = this.nearestWaypointFilter.sub(facilityType => {
      this.wptArrayManager.changeWaypointType(facilityType);

      this.nearestWptFilterAllClasses.toggle('hidden', facilityType !== FacilitySearchType.AllExceptVisual);
      this.nearestWptFilterAirportClasses.toggle('hidden', facilityType !== FacilitySearchType.Airport);
      this.nearestWptFilterIntersectionClasses.toggle('hidden', facilityType !== FacilitySearchType.Intersection);
      this.nearestWptFilterNdbClasses.toggle('hidden', facilityType !== FacilitySearchType.Ndb);
      this.nearestWptFilterVorClasses.toggle('hidden', facilityType !== FacilitySearchType.Vor);
      this.nearestWptFilterUserClasses.toggle('hidden', facilityType !== FacilitySearchType.User);
    }, false, true);

    if (SubscribableUtils.isSubscribable(this.props.facilitySearchType)) {
      this.facilitySearchTypeSub = this.props.facilitySearchType.sub((facilityType: G3000WaypointSearchType): void => {
        const isAll: boolean = facilityType === FacilitySearchType.AllExceptVisual;
        this.itemsPerPage.set(isAll ? 4 : 5);
        this.nearestWaypointFilter.set(isAll ? DEFAULT_NEAREST_WAYPOINT_FILTER : facilityType);
        this.nearestWptFilterClasses.toggle('hidden', !isAll);
      }, true);
    } else {
      const isAll: boolean = this.props.facilitySearchType === FacilitySearchType.AllExceptVisual;
      this.itemsPerPage.set(isAll ? 4 : 5);
      this.nearestWaypointFilter.set(isAll ? DEFAULT_NEAREST_WAYPOINT_FILTER : this.props.facilitySearchType);
      this.nearestWptFilterClasses.toggle('hidden', !isAll);
    }

    this.isGpsDrSub = this.props.posHeadingDataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, true);
  }

  /** Resume lifecycle method. */
  public onResume(): void {
    this.isPaused = false;

    this.props.activeComponent?.set(this.listRef.instance);

    this.pposPipe?.resume(true);
    this.headingPipe?.resume(true);

    this.nearestWaypointFilterSub?.resume(true);
    this.wptArrayManager.resume();
    this.isGpsDataFailedSub?.resume(true);

    this.listRef.instance.scrollToIndex(0, 0, false);
  }

  /** Pause lifecycle method. */
  public onPause(): void {
    this.isPaused = true;

    this.props.activeComponent?.set(null);

    this.pposPipe?.pause();
    this.headingPipe?.pause();

    this.isGpsDataFailedSub?.pause();
    this.nearestFacilitiesUpdateSub?.pause();
    this.nearestWaypointFilterSub?.pause();
    this.wptArrayManager.pause();
  }

  /** Reset the nearest waypoint filter to its default value. */
  public resetNearestWaypointFilter(): void {
    this.nearestWaypointFilter.set(DEFAULT_NEAREST_WAYPOINT_FILTER);
  }

  private getFacilityTypeName = (type: G3000WaypointSearchType, list = false): string | VNode => {
    switch (type) {
      case FacilitySearchType.AllExceptVisual: return list ? 'All' : 'ALL';
      case FacilitySearchType.Airport: return 'Airport';
      case FacilitySearchType.Intersection: return 'Intersection';
      case FacilitySearchType.Ndb: return 'NDB';
      case FacilitySearchType.Vor: return 'VOR';
      case FacilitySearchType.User: return list ? 'User' : 'USER';
      default: throw new Error('Unsupported FacilitySearchType');
    }
  };

  private renderListItem = (data: NearestWaypointEntry<FacilityWaypoint>): VNode => {
    return (
      <GtcNearestWaypointListItem
        gtcService={this.props.gtcService}
        entry={data}
        unitsSettingManager={this.unitsSettingManager}
        onButtonPressed={entry => { this.props.onSelected(entry.waypoint); }}
      />
    );
  };

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class={this.nearestWptFilterClasses}>
          <GtcListSelectTouchButton
            ref={this.filterButtonRef}
            label='Nearest Waypoint Filter'
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            renderValue={this.getFacilityTypeName}
            occlusionType='hide'
            state={this.nearestWaypointFilter}
            listParams={{
              title: 'Select Nearest List',
              class: 'gtc-list-dialog-wide',
              selectedValue: this.nearestWaypointFilter,
              inputData: [
                {
                  value: FacilitySearchType.AllExceptVisual,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.AllExceptVisual, true),
                },
                {
                  value: FacilitySearchType.Airport,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.Airport, true),
                },
                {
                  value: FacilitySearchType.Intersection,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.Intersection, true),
                },
                {
                  value: FacilitySearchType.Ndb,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.Ndb, true),
                },
                {
                  value: FacilitySearchType.Vor,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.Vor, true),
                },
                {
                  value: FacilitySearchType.User,
                  labelRenderer: () => this.getFacilityTypeName(FacilitySearchType.User, true),
                },
              ],
            }}
          >
            <img class={this.nearestWptFilterAllClasses} src={BtnImagePath.WaypointFilterAll}></img>
            <img class={this.nearestWptFilterAirportClasses} src={BtnImagePath.WaypointFilterAirport}></img>
            <img class={this.nearestWptFilterIntersectionClasses} src={BtnImagePath.WaypointFilterIntersection}></img>
            <img class={this.nearestWptFilterNdbClasses} src={BtnImagePath.WaypointFilterNdb}></img>
            <img class={this.nearestWptFilterVorClasses} src={BtnImagePath.WaypointFilterVor}></img>
            <img class={this.nearestWptFilterUserClasses} src={BtnImagePath.WaypointFilterUser}></img>
          </GtcListSelectTouchButton>
          <div class='divider' />
        </div>
        <GtcNearestWaypointList
          ref={this.listRef}
          bus={this.props.bus}
          data={this.wptArrayManager.waypointArray}
          renderItem={this.renderListItem}
          listItemHeightPx={this.props.gtcService.isHorizontal ? 133 : 72}
          listItemSpacingPx={this.props.gtcService.isHorizontal ? 2 : 1}
          itemsPerPage={this.itemsPerPage}
          sidebarState={this.props.sidebarState}
          noResultsText='No waypoints within 200NM'// TODO Change this prop to accept a VNode so that NM can be displayed in small caps
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.filterButtonRef.getOrDefault()?.destroy();
    this.listRef.getOrDefault()?.destroy();

    this.pposPipe?.destroy();
    this.headingPipe?.destroy();
    this.nearestFacilitiesUpdateSub?.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.facilitySearchTypeSub?.destroy();
    this.isGpsDrSub?.destroy();

    super.destroy();
  }
}