import { GeoPoint } from '../geo/GeoPoint';
import { BitFlags } from '../math';
import { AbstractSubscribableArray } from '../sub/AbstractSubscribableArray';
import { Subscribable } from '../sub/Subscribable';
import { SubscribableArray, SubscribableArrayEventType } from '../sub/SubscribableArray';
import { SubscribableUtils } from '../sub/SubscribableUtils';
import { GeoKdTreeSearchFilter } from '../utils/datastructures/GeoKdTree';
import {
  AirportFacility, AirportFacilityDataFlags, Facility, FacilitySearchType, FacilityType, IntersectionFacility,
  NdbFacility, NearestSearchResults, UserFacility, VorFacility
} from './Facilities';
import { FacilityClient, NearestIcaoSearchSessionDataType, NearestSearchSession } from './FacilityClient';
import {
  FacilityLoader, NearestAirportSearchSession, NearestIntersectionSearchSession, NearestRepoFacilitySearchSession,
  NearestVorSearchSession
} from './FacilityLoader';
import { IntersectionFacilityUtils } from './FacilityUtils';
import { IcaoValue } from './Icao';
import { ICAO } from './IcaoUtils';

/**
 * A type map of search type to concrete facility loader query type.
 */
const facilitySearchTypeMap = new Map([
  [FacilitySearchType.Airport, FacilityType.Airport],
  [FacilitySearchType.Intersection, FacilityType.Intersection],
  [FacilitySearchType.Vor, FacilityType.VOR],
  [FacilitySearchType.Ndb, FacilityType.NDB],
  [FacilitySearchType.User, FacilityType.USR]
]);

/**
 * Gets the facility type returned by a nearest subscription.
 */
export type NearestSubscriptionFacilityType<S extends NearestSubscription<any>> = S extends NearestSubscription<infer T> ? T : never;

/**
 * A nearest search which provides its search results as an array of facilities. The contents of the array are
 * automatically updated when the search is updated.
 */
export interface NearestSubscription<T extends Facility> extends SubscribableArray<T> {
  /** Whether this search has started. */
  readonly started: boolean;

  /** Waits until this search has started. */
  awaitStart(): Promise<void>;

  /** Starts this search. */
  start(): Promise<void>;

  /**
   * Updates this search with new parameters. If an update is already in progress, this method will wait until the
   * existing update is finished and then fulfill its returned Promise immediately.
   * @param lat The latitude, in degrees, of the center of the search.
   * @param lon The longitude, in degrees, of the center of the search.
   * @param radius The radius of the search, in meters.
   * @param maxItems The maximum number of items to return from the search.
   * @returns A Promise which will be fulfilled when the update is complete.
   */
  update(lat: number, lon: number, radius: number, maxItems: number): Promise<void>;
}

/**
 * A class for tracking a nearest facility session and making it available as a
 * subscribable array of facilities.
 */
export abstract class AbstractNearestSubscription<T extends Facility, TAdded, TRemoved>
  extends AbstractSubscribableArray<T> implements NearestSubscription<T> {

  protected readonly facilities: T[] = [];
  protected readonly facilityIndex = new Map<string, T>();

  protected session: NearestSearchSession<TAdded, TRemoved> | undefined;

  protected readonly startPromiseResolves: (() => void)[] = [];
  protected readonly updatePromiseResolves: (() => void)[] = [];

  private hasRequestedSession = false;

  private searchInProgress = false;

  /**
   * Creates a new instance of AbstractNearestSubscription.
   * @param facilityClient The client from which to retrieve facilities.
   * @param type The type of facility to search for.
   */
  public constructor(
    protected readonly facilityClient: FacilityClient,
    protected readonly type: Exclude<FacilitySearchType, FacilitySearchType.Boundary>
  ) {
    super();
  }

  /** @inheritdoc */
  public get length(): number {
    return this.facilities.length;
  }

  /**
   * Whether or not this subscription has been started.
   * @returns True if started, false otherwise.
   */
  public get started(): boolean {
    return this.session !== undefined;
  }

  /** @inheritdoc */
  public getArray(): readonly T[] {
    return this.facilities;
  }

  /** @inheritdoc */
  public awaitStart(): Promise<void> {
    if (this.session !== undefined) {
      return Promise.resolve();
    }

    return new Promise(resolve => { this.startPromiseResolves.push(resolve); });
  }

  /** @inheritdoc */
  public start(): Promise<void> {
    if (this.session !== undefined) {
      return Promise.resolve();
    }

    if (this.hasRequestedSession) {
      return this.awaitStart();
    }

    return new Promise(resolve => {
      this.hasRequestedSession = true;

      this.startPromiseResolves.push(resolve);

      this.startSearchSession().then(session => {
        this.session = session as NearestSearchSession<TAdded, TRemoved>;
        this.startPromiseResolves.forEach(queuedResolve => { queuedResolve(); });
        this.startPromiseResolves.length = 0;
      });
    });
  }

  /**
   * Starts this subscription's nearest search session.
   * @returns A Promise which will be fulfilled with this subscription's nearest search session once it has been
   * started.
   */
  protected abstract startSearchSession(): Promise<NearestSearchSession<TAdded, TRemoved>>;

  /** @inheritdoc */
  public update(lat: number, lon: number, radius: number, maxItems: number): Promise<void> {
    return new Promise(resolve => {
      this.updatePromiseResolves.push(resolve);

      if (this.searchInProgress) {
        return;
      }

      this.doUpdate(lat, lon, radius, maxItems);
    });
  }

  /**
   * Executes an update of the nearest search subscription.
   * @param lat The latitude of the current search position.
   * @param lon The longitude of the current search position.
   * @param radius The radius of the search, in meters.
   * @param maxItems The maximum number of items to return in the search.
   */
  protected async doUpdate(lat: number, lon: number, radius: number, maxItems: number): Promise<void> {
    this.searchInProgress = true;

    if (!this.started) {
      await this.start();
    }

    const results = await this.session!.searchNearest(lat, lon, radius, maxItems);
    await this.onResults(results);

    this.searchInProgress = false;

    this.updatePromiseResolves.forEach(resolve => { resolve(); });
    this.updatePromiseResolves.length = 0;
  }

  /**
   * A callback called when results are received.
   * @param results The results that were received.
   */
  protected abstract onResults(results: NearestSearchResults<TAdded, TRemoved>): Promise<void>;

  /**
   * Adds a facility to the collection.
   * @param facility The facility to add.
   * @param key The key to track this facility by.
   */
  protected addFacility(facility: T, key: string): void {
    if (this.facilityIndex.has(key)) {
      console.warn(`Facility ${key} is already in the collection.`);
    }

    this.facilities.push(facility);
    this.facilityIndex.set(key, facility);

    this.notify(this.facilities.length - 1, SubscribableArrayEventType.Added, facility);
  }

  /**
   * Removes a facility from the collection.
   * @param key The key of the facility to remove.
   */
  protected removeFacility(key: string): void {
    const facility = this.facilityIndex.get(key);

    if (facility !== undefined) {
      const index = this.facilities.indexOf(facility);
      this.facilities.splice(index, 1);
      this.facilityIndex.delete(key);

      this.notify(index, SubscribableArrayEventType.Removed, facility);
    }
  }
}

/**
 * A nearest search subscription for waypoint facilites, including logic for further filtering
 * of results beyond what the sim search API gives us.
 */
abstract class NearestWaypointSubscription<T extends Facility> extends AbstractNearestSubscription<T, IcaoValue, IcaoValue> {

  protected readonly facilityType = facilitySearchTypeMap.get(this.type);

  protected readonly icaos = new Map<string, IcaoValue>();

  protected filterCb?: (facility: T) => boolean;
  protected readonly facilityCache = new Map<string, T>();

  /**
   * Creates a new instance of NearestWaypointSubscription.
   * @param facilityLoader An instance of the facility loader to search with.
   * @param type The type of facility to search for.
   * @param filterCb A function which filters results after they have been returned by this subscription's search
   * session. If not defined, no post-search session filtering will be performed.
   */
  public constructor(
    facilityLoader: FacilityLoader,
    type: Exclude<FacilitySearchType, FacilitySearchType.Boundary>,
    filterCb?: (facility: T) => boolean
  ) {
    super(facilityLoader, type);
    this.filterCb = filterCb;
  }

  /**
   * Sets this subscription's post-search session filter and refilters this subscription's latest results using the new
   * filter.
   * @param filter A function which filters results after they have been returned by this subscription's search
   * session, or `undefined` if no post-search session filtering is to be performed.
   */
  public setFilterCb(filter: ((facility: T) => boolean) | undefined): void {
    this.filterCb = filter;
    this.refilter();
  }

  /**
   * Refilters the latest search results returned from this subscription's nearest search session.
   */
  protected refilter(): void {
    // Start the refresh of our data by iterating over the current entries and
    // removing any that no longer match the filter.
    if (this.filterCb) {
      for (const [uid, fac] of this.facilityIndex) {
        if (!this.filterCb(fac)) {
          this.removeFacility(uid);
        }
      }
    }

    // Next go through our facility cache and add any existing entries that
    // hadn't previously matched but now do.
    for (const [uid, fac] of this.facilityCache) {
      if ((this.filterCb === undefined || this.filterCb(fac))) {
        this.addFacility(fac, uid);
      }
    }
  }

  /** @inheritDoc */
  protected startSearchSession(): Promise<NearestSearchSession<IcaoValue, IcaoValue>> {
    return this.facilityClient.startNearestSearchSessionWithIcaoStructs(this.type);
  }

  /** @inheritDoc */
  protected async onResults(
    results: NearestSearchResults<IcaoValue, IcaoValue>
  ): Promise<void> {
    if (this.facilityType !== undefined) {
      const addedFacs = await this.getFacilities(results.added);

      for (let i = 0; i < results.removed.length; i++) {
        const uid = ICAO.getUid(results.removed[i]);
        this.icaos.delete(uid);
        this.facilityCache.delete(uid);
        this.removeFacility(uid);
      }

      for (let i = 0; i < results.added.length; i++) {
        const icao = results.added[i];
        const uid = ICAO.getUid(icao);
        this.icaos.set(uid, icao);
        const fac = addedFacs[i];
        if (fac) {
          this.facilityCache.set(uid, fac);
          if (this.filterCb === undefined || this.filterCb(fac)) {
            this.addFacility(fac, uid);
          }
        }
      }
    }
  }

  /**
   * Retrieves facilities for an array of ICAOs.
   * @param icaos The ICAOs for which to get facilities.
   * @returns A Promise which will be fulfilled with an array of facilities corresponding to the specified ICAOs. Each
   * position in the facilities array will contain either the facility for the ICAO at the corresponding position in
   * the ICAO array, or `null` if a facility for that ICAO could not be retrieved.
   */
  protected getFacilities(icaos: readonly IcaoValue[]): Promise<(T | null)[]> {
    if (this.facilityType === undefined) {
      return Promise.resolve([]);
    }

    return this.facilityClient.getFacilitiesOfType(this.facilityType, icaos) as Promise<(T | null)[]>;
  }
}

/**
 * A nearest search subscription for airport facilites.
 */
export class NearestAirportSubscription extends NearestWaypointSubscription<AirportFacility> {
  protected dataFlags = AirportFacilityDataFlags.All;
  protected pendingDataFlags = this.dataFlags;

  /**
   * Creates a new instance of NearestAirportSubscription.
   * @param facilityLoader The facility loader to use with this instance.
   * @param filterCb A function which filters results after they have been returned by this subscription's search
   * session. If not defined, no post-search session filtering will be performed.
   */
  public constructor(facilityLoader: FacilityLoader, filterCb?: (facility: AirportFacility) => boolean) {
    super(facilityLoader, FacilitySearchType.Airport, filterCb);
  }

  /**
   * Sets the airport search filter.
   * @param showClosed Whether or not to return closed airports in the search.
   * @param classMask A bitmask representing the classes of airports to show.
   */
  public setFilter(showClosed: boolean, classMask: number): void {
    if (this.session !== undefined) {
      (this.session as NearestAirportSearchSession<NearestIcaoSearchSessionDataType.Struct>).setAirportFilter(showClosed, classMask);
    }
  }

  /**
   * Sets the extended airport filters for the airport nearest search.
   * @param surfaceTypeMask A bitmask of allowable runway surface types.
   * @param approachTypeMask A bitmask of allowable approach types.
   * @param toweredMask A bitmask of untowered (1) or towered (2) bits.
   * @param minRunwayLength The minimum allowable runway length, in meters.
   */
  public setExtendedFilters(surfaceTypeMask: number, approachTypeMask: number, toweredMask: number, minRunwayLength: number): void {
    if (this.session !== undefined) {
      (this.session as NearestAirportSearchSession<NearestIcaoSearchSessionDataType.Struct>)
        .setExtendedAirportFilters(surfaceTypeMask, approachTypeMask, toweredMask, minRunwayLength);
    }
  }

  /**
   * Sets the bitflags describing the data to be loaded in the airport facilities provided by this subscription. All
   * airport facilities in this subscription's array are guaranteed to have *at least* as much loaded data as defined
   * by the bitflags. Changes to the bitflags will take effect the next time this subscription's search is updated.
   * @param flags The bitflags to set.
   */
  public setDataFlags(flags: number): void {
    this.pendingDataFlags = flags;
  }

  /** @inheritDoc */
  protected async onResults(
    results: NearestSearchResults<IcaoValue, IcaoValue>
  ): Promise<void> {
    if (!BitFlags.isAll(this.dataFlags, this.pendingDataFlags)) {
      // The pending data flags are not a subset of the existing data flags. Therefore, we need to refresh all
      // facilities that are currently in the array and that are cached in order to ensure they have the required data.

      this.dataFlags = this.pendingDataFlags;

      for (let i = 0; i < results.removed.length; i++) {
        this.icaos.delete(ICAO.getUid(results.removed[i]));
      }

      const icaos = Array.from(this.icaos.values());
      icaos.push(...results.added);
      const facs = await this.getFacilities(icaos);

      this.facilityCache.clear();
      this.facilityIndex.clear();
      this.facilities.length = 0;
      this.notify(0, SubscribableArrayEventType.Cleared);

      for (let i = 0; i < icaos.length; i++) {
        const icao = icaos[i];
        const uid = ICAO.getUid(icao);
        this.icaos.set(uid, icao);
        const fac = facs[i];
        if (fac) {
          this.facilityCache.set(uid, fac);
          if (this.filterCb === undefined || this.filterCb(fac)) {
            this.addFacility(fac, uid);
          }
        }
      }
    } else {
      this.dataFlags = this.pendingDataFlags;
      super.onResults(results);
    }
  }

  /** @inheritDoc */
  protected getFacilities(icaos: readonly IcaoValue[]): Promise<(AirportFacility | null)[]> {
    return this.facilityClient.getFacilities(icaos, this.dataFlags) as Promise<(AirportFacility | null)[]>;
  }
}

/**
 * A nearest search subscription for intersection facilites.
 */
export class NearestIntersectionSubscription extends NearestWaypointSubscription<IntersectionFacility> {

  protected readonly nonTerminalIcaoUidsToFilter = new Set<string>();

  protected filterDupTerminal: boolean;

  /**
   * Creates a new instance of NearestIntersectionSubscription.
   * @param facilityLoader The facility loader to use with this instance.
   * @param filterCb A function which filters results after they have been returned by this subscription's search
   * session. If not defined, no post-search session filtering will be performed.
   * @param filterDupTerminal Whether to filter out terminal intersections if their non-terminal counterparts are
   * also present in the subscription's results. Defaults to `false`.
   */
  public constructor(
    facilityLoader: FacilityLoader,
    filterCb?: (facility: IntersectionFacility) => boolean,
    filterDupTerminal = false
  ) {
    super(facilityLoader, FacilitySearchType.Intersection, filterCb);

    this.filterDupTerminal = filterDupTerminal;
  }

  /**
   * Sets the intersection search filter.
   * @param typeMask A bitmask representing the types of intersections to include in the search.
   * @param showTerminalWaypoints Whether to include terminal intersections in the search.
   */
  public setFilter(typeMask: number, showTerminalWaypoints = true): void {
    if (this.session !== undefined) {
      (this.session as NearestIntersectionSearchSession<NearestIcaoSearchSessionDataType.Struct>).setIntersectionFilter(typeMask, showTerminalWaypoints);
    }
  }

  /**
   * Sets whether to filter out terminal intersections if their non-terminal counterparts are also present in this
   * subscription's results and refilters this subscription's latest results accordingly.
   * @param filter Whether to filter out terminal intersections if their non-terminal counterparts are also present in
   * this subscription's results.
   */
  public setFilterDupTerminal(filter: boolean): void {
    if (filter === this.filterDupTerminal) {
      return;
    }

    this.filterDupTerminal = filter;
    this.refilter();
  }

  /** @inheritdoc */
  protected refilter(): void {
    // Rebuild non-terminal key set
    this.nonTerminalIcaoUidsToFilter.clear();
    if (this.filterDupTerminal) {
      for (const [uid, fac] of this.facilityCache) {
        if (
          ICAO.isValueFacility(fac.icaoStruct, FacilityType.Intersection)
          && !IntersectionFacilityUtils.isTerminal(fac.icaoStruct)
          && (this.filterCb === undefined || this.filterCb(fac))
        ) {
          this.nonTerminalIcaoUidsToFilter.add(uid);
        }
      }
    }

    // Start the refresh of our data by iterating over the current entries and
    // removing any that no longer match the filter.
    if (this.filterCb || this.filterDupTerminal) {
      for (const [uid, fac] of this.facilityIndex) {
        if (
          (this.filterCb && !this.filterCb(fac))
          || (
            this.filterDupTerminal
            && ICAO.isValueFacility(fac.icaoStruct, FacilityType.Intersection)
            && IntersectionFacilityUtils.isTerminal(fac.icaoStruct)
            && this.nonTerminalIcaoUidsToFilter.has(ICAO.getUid(IntersectionFacilityUtils.getNonTerminalIcaoValue(fac.icaoStruct)))
          )
        ) {
          this.removeFacility(uid);
        }
      }
    }

    // Next go through our facility cache and add any existing entries that
    // hadn't previously matched but now do.
    for (const [uid, fac] of this.facilityCache) {
      if (!this.facilityIndex.get(uid)) {
        if (
          (this.filterCb === undefined || this.filterCb(fac))
          && (
            !this.filterDupTerminal
            || !ICAO.isValueFacility(fac.icaoStruct, FacilityType.Intersection)
            || !IntersectionFacilityUtils.isTerminal(fac.icaoStruct)
            || !this.nonTerminalIcaoUidsToFilter.has(ICAO.getUid(IntersectionFacilityUtils.getNonTerminalIcaoValue(fac.icaoStruct)))
          )
        ) {
          this.addFacility(fac, uid);
        }
      }
    }
  }

  /** @inheritDoc */
  protected async onResults(
    results: NearestSearchResults<IcaoValue, IcaoValue>
  ): Promise<void> {
    const facilityType = facilitySearchTypeMap.get(this.type);
    if (facilityType !== undefined) {
      const added = (await this.facilityClient.getFacilities(results.added)) as (IntersectionFacility | null)[];

      for (let i = 0; i < results.removed.length; i++) {
        const uid = ICAO.getUid(results.removed[i]);
        this.nonTerminalIcaoUidsToFilter.delete(uid);
        this.facilityCache.delete(uid);
        this.removeFacility(uid);
      }

      for (let i = 0; i < added.length; i++) {
        const fac = added[i];
        if (fac) {
          const uid = ICAO.getUid(fac.icaoStruct);
          this.facilityCache.set(uid, fac);
          if (
            this.filterDupTerminal
            && ICAO.isValueFacility(fac.icaoStruct, FacilityType.Intersection)
            && !IntersectionFacilityUtils.isTerminal(fac)
            && (this.filterCb === undefined || this.filterCb(fac))
          ) {
            this.nonTerminalIcaoUidsToFilter.add(uid);
          }
        }
      }

      for (let i = 0; i < added.length; i++) {
        const fac = added[i];
        if (fac) {
          const uid = ICAO.getUid(fac.icaoStruct);
          if (
            (this.filterCb === undefined || this.filterCb(fac))
            && (
              !this.filterDupTerminal
              || !ICAO.isValueFacility(fac.icaoStruct, FacilityType.Intersection)
              || !IntersectionFacilityUtils.isTerminal(fac)
              || !this.nonTerminalIcaoUidsToFilter.has(ICAO.getUid(IntersectionFacilityUtils.getNonTerminalIcaoValue(fac.icaoStruct)))
            )
          ) {
            this.addFacility(fac, uid);
          }
        }
      }
    }
  }
}

/**
 * A nearest search subscription for VOR facilites.
 */
export class NearestVorSubscription extends NearestWaypointSubscription<VorFacility> {
  /**
   * Creates a new instance of NearestVorSubscription.
   * @param facilityLoader The facility loader to use with this instance.
   */
  public constructor(facilityLoader: FacilityLoader) {
    super(facilityLoader, FacilitySearchType.Vor);
  }

  /**
   * Sets the VOR search filter.
   * @param classMask A bitmask to determine which JS VOR classes to show.
   * @param typeMask A bitmask to determine which JS VOR types to show.
   */
  public setVorFilter(classMask: number, typeMask: number): void {
    if (this.session !== undefined) {
      (this.session as NearestVorSearchSession<NearestIcaoSearchSessionDataType.Struct>).setVorFilter(classMask, typeMask);
    }
  }
}

/**
 * A nearest search subscription for NDB facilites.
 */
export class NearestNdbSubscription extends NearestWaypointSubscription<NdbFacility> {
  /**
   * Creates a new instance of NearestNdbSubscription.
   * @param facilityLoader The facility loader to use with this instance.
   */
  public constructor(facilityLoader: FacilityLoader) {
    super(facilityLoader, FacilitySearchType.Ndb);
  }
}

/**
 * A nearest search subscription for USR facilites.
 */
export class NearestUsrSubscription extends NearestWaypointSubscription<UserFacility> {
  /**
   * Creates a new NearestUsrSubscription.
   * @param facilityLoader The facility loader to use with this instance.
   */
  constructor(facilityLoader: FacilityLoader) {
    super(facilityLoader, FacilitySearchType.User);
  }

  /**
   * Sets the facility search filter.
   * @param filter A function to filter the search results.
   */
  public setFacilityFilter(filter?: GeoKdTreeSearchFilter<UserFacility>): void {
    if (this.session !== undefined) {
      (this.session as NearestRepoFacilitySearchSession<FacilityType.USR, NearestIcaoSearchSessionDataType.Struct>).setFacilityFilter(filter);
    }
  }
}

/**
 * A wrapper for a {@link NearestSearchSession} that automatically adjusts the number of
 * search results requested from the sim to minimize search load while still attempting to
 * provide the total number of results needed by the user.
 */
export class AdaptiveNearestSubscription<InnerType extends NearestSubscription<any>>
  extends AbstractSubscribableArray<NearestSubscriptionFacilityType<InnerType>>
  implements NearestSubscription<NearestSubscriptionFacilityType<InnerType>> {

  private static readonly RAMP_UP_FACTOR = 1.33;
  private static readonly RAMP_DOWN_FACTOR = 0.1;

  private static readonly EMPTY_ARRAY = [];

  private readonly sortFunc = (a: NearestSubscriptionFacilityType<InnerType>, b: NearestSubscriptionFacilityType<InnerType>): number => this.pos.distance(a) - this.pos.distance(b);

  /** The array that holds the results of our latest search. */
  private readonly facilities: NearestSubscriptionFacilityType<InnerType>[] = [];

  private readonly absoluteMaxItems: Subscribable<number>;

  /** The number of items we are requesting from the inner search to meet current demands. */
  private derivedMaxItems = 0;

  /** Whether we have a search in progress already. */
  private searchInProgress = false;

  /** A reusable GeoPoint for sorting by distance. */
  private readonly pos = new GeoPoint(0, 0);

  private readonly diffMap = new Map<string, NearestSubscriptionFacilityType<InnerType>>();

  private readonly updatePromiseResolves: (() => void)[] = [];

  /**
   * Creates an instance of AdaptiveNearestSubscription.
   * @param innerSubscription A {@link NearestSubscription} to use as our inner search.
   * @param absoluteMaxItems The maximum number of results to request in any search.
   */
  constructor(public readonly innerSubscription: InnerType, absoluteMaxItems: number | Subscribable<number>) {
    super();

    this.absoluteMaxItems = SubscribableUtils.toSubscribable(absoluteMaxItems, true);
  }

  /** @inheritdoc */
  public get length(): number {
    return this.facilities.length;
  }

  /** @inheritdoc */
  public getArray(): readonly NearestSubscriptionFacilityType<InnerType>[] {
    return this.facilities;
  }

  /** @inheritdoc */
  public get started(): boolean {
    return this.innerSubscription.started;
  }

  /** @inheritdoc */
  public awaitStart(): Promise<void> {
    return this.innerSubscription.awaitStart();
  }

  /** @inheritdoc */
  public start(): Promise<void> {
    return this.innerSubscription.start();
  }

  /** @inheritdoc */
  public update(lat: number, lon: number, radius: number, maxItems: number): Promise<void> {
    return new Promise(resolve => {
      this.updatePromiseResolves.push(resolve);

      if (this.searchInProgress) {
        return;
      }

      this.doUpdate(lat, lon, radius, maxItems);
    });
  }

  /**
   * Executes an update of the nearest search subscription.
   * @param lat The latitude of the current search position.
   * @param lon The longitude of the current search position.
   * @param radius The radius of the search, in meters.
   * @param maxItems The maximum number of items to return in the search.
   */
  private async doUpdate(lat: number, lon: number, radius: number, maxItems: number): Promise<void> {
    this.searchInProgress = true;
    this.pos.set(lat, lon);

    maxItems = Math.max(0, maxItems);

    if (maxItems > this.derivedMaxItems) {
      this.derivedMaxItems = maxItems;
    }

    // When the subscription updates, any changes from airports added or removed cause
    // onSourceChanged below to trigger.   That will update our facilites store, because
    // it means the airport is no longer in the raw search data.
    await this.innerSubscription.update(lat, lon, radius, this.derivedMaxItems);

    if (this.innerSubscription.length > maxItems) {
      // We have more returned facilities in our search than the user has asked for.
      // Begin a ramp-down of our search size. Ramp down is less aggressive than
      // ramp up to avoid flapping between the two states.

      this.derivedMaxItems = Math.max(
        Math.round(
          this.derivedMaxItems - (this.derivedMaxItems * AdaptiveNearestSubscription.RAMP_DOWN_FACTOR)
        ),
        maxItems
      );
    } else {
      // We have either exactly enough or too few facilities.  If we have too few, ramp
      // up our search size until we either have enough or hit the maximum allowed search
      // quantity.

      const absoluteMaxItems = this.absoluteMaxItems.get();
      while (this.innerSubscription.length < maxItems && this.derivedMaxItems < absoluteMaxItems) {
        this.derivedMaxItems = Math.min(
          Math.round(this.derivedMaxItems * AdaptiveNearestSubscription.RAMP_UP_FACTOR),
          absoluteMaxItems
        );
        await this.innerSubscription.update(lat, lon, radius, this.derivedMaxItems);
      }
    }

    if (this.innerSubscription.length > maxItems) {
      if (maxItems > 1) {
        // Filter out the farthest results until we have exactly as many results as the user has asked for.

        const sorted = Array.from(this.innerSubscription.getArray()).sort(this.sortFunc);
        sorted.length = maxItems;

        this.diffAndNotify(sorted);
      } else if (maxItems === 1) {
        this.diffAndNotify([this.findNearest(this.innerSubscription.getArray())]);
      } else {
        this.diffAndNotify(AdaptiveNearestSubscription.EMPTY_ARRAY);
      }
    } else {
      this.diffAndNotify(this.innerSubscription.getArray());
    }

    this.searchInProgress = false;

    this.updatePromiseResolves.forEach(resolve => { resolve(); });
    this.updatePromiseResolves.length = 0;
  }

  /**
   * Finds the nearest facility in an array.
   * @param array A non-empty array of facilities.
   * @returns The nearest facility in the specified array.
   */
  private findNearest(array: readonly NearestSubscriptionFacilityType<InnerType>[]): NearestSubscriptionFacilityType<InnerType> {
    let nearest = array[0];
    let nearestDistance = this.pos.distance(nearest);

    for (let i = 1; i < array.length; i++) {
      const fac = array[i];
      const distance = this.pos.distance(fac);

      if (distance < nearestDistance) {
        nearest = fac;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Diffs a new facility array against this subscription's current facility array, makes the necessary changes to
   * the current facility array so that it contains the same facilities as the new one, and notifies subscribers of the
   * changes.
   * @param newArray A new facility array.
   */
  private diffAndNotify(newArray: readonly NearestSubscriptionFacilityType<InnerType>[]): void {
    if (this.facilities.length === 0 && newArray.length === 0) {
      // Old and new arrays are both empty. Nothing to do.
      return;
    }

    if (newArray.length === 0) {
      // New array is empty. Clear the old array.

      this.facilities.length = 0;
      this.notify(0, SubscribableArrayEventType.Cleared);
      return;
    }

    if (this.facilities.length === 0) {
      // Old array is empty. Add every item from the new array in order.

      for (let i = 0; i < newArray.length; i++) {
        this.facilities[i] = newArray[i];
      }
      this.facilities.length = newArray.length;
      this.notify(0, SubscribableArrayEventType.Added, this.facilities);
      return;
    }

    // Remove every item from the old array that is not in the new array.

    for (let i = 0; i < newArray.length; i++) {
      this.diffMap.set(newArray[i].icao, newArray[i]);
    }

    for (let i = this.facilities.length - 1; i >= 0; i--) {
      const old = this.facilities[i];
      if (this.diffMap.has(old.icao)) {
        this.diffMap.delete(old.icao);
      } else {
        this.facilities.splice(i, 1);
        this.notify(i, SubscribableArrayEventType.Removed, old);
      }
    }

    // Add every item from the new array that is not in the old array (these items are now contained in diffMap).

    for (const toAdd of this.diffMap.values()) {
      this.facilities.push(toAdd);
      this.notify(this.facilities.length - 1, SubscribableArrayEventType.Added, toAdd);
    }

    this.diffMap.clear();
  }
}
