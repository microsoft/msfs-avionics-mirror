import { EventBus } from '../data/EventBus';
import { GeoPoint } from '../geo/GeoPoint';
import { GeoKdTree, GeoKdTreeSearchFilter, GeoKdTreeSearchVisitor } from '../utils/datastructures';
import { Facility, FacilityType, FacilityUtils, ICAO } from './Facilities';

/**
 * Topics published by {@link FacilityRepository} on the event bus.
 */
export interface FacilityRepositoryEvents {
  /** A facility was added. */
  facility_added: Facility;

  /** A facility was changed. */
  facility_changed: Facility;

  /** A facility was changed. The suffix of the topic specifies the ICAO of the changed facility. */
  [facility_changed: `facility_changed_${string}`]: Facility;

  /** A facility was removed. */
  facility_removed: Facility;

  /** A facility was removed. The suffix of the topic specifies the ICAO of the removed facility. */
  [facility_removed: `facility_removed_${string}`]: Facility;
}

/**
 * Types of facility repository sync events.
 */
enum FacilityRepositorySyncType {
  Add = 'Add',
  Remove = 'Remove',
  DumpRequest = 'DumpRequest',
  DumpResponse = 'DumpResponse'
}

/**
 * A facility repository sync event describing the addition of a facility.
 */
type FacilityRepositoryAdd = {
  /** The type of this event. */
  type: FacilityRepositorySyncType.Add;

  /** The facilities that were added. */
  facs: Facility[];
}

/**
 * A facility repository sync event describing the removal of a facility.
 */
type FacilityRepositoryRemove = {
  /** The type of this event. */
  type: FacilityRepositorySyncType.Remove;

  /** The ICAOs of the facilities that were removed. */
  facs: string[];
}

/**
 * A request for a dump of all facilities registered with the facility repository.
 */
type FacilityRepositoryDumpRequest = {
  /** The type of this event. */
  type: FacilityRepositorySyncType.DumpRequest;

  /** The unique ID associated with this event. */
  uid: number;
}

/**
 * A response to a facility repository dump request.
 */
type FacilityRepositoryDumpResponse = {
  /** The type of this event. */
  type: FacilityRepositorySyncType.DumpResponse;

  /** The unique ID associated with the dump request that this event is responding to. */
  uid: number;

  /** All facilities registered with the repository that sent the response. */
  facs: Facility[];
}

/**
 * Data provided by a sync event.
 */
type FacilityRepositorySyncData = FacilityRepositoryAdd | FacilityRepositoryRemove | FacilityRepositoryDumpRequest | FacilityRepositoryDumpResponse;

/**
 * Events related to data sync between facility repository instances.
 */
interface FacilityRepositorySyncEvents {
  /** A facility repository sync event. */
  facilityrepo_sync: FacilityRepositorySyncData;
}

/** Facility types for which {@link FacilityRepository} supports spatial searches. */
export type SearchableFacilityTypes = FacilityType.USR | FacilityType.VIS;

/**
 * A repository of facilities.
 */
export class FacilityRepository {
  private static readonly SYNC_TOPIC = 'facilityrepo_sync';

  private static readonly treeKeyFunc = (fac: Facility, out: Float64Array): Float64Array => {
    return GeoPoint.sphericalToCartesian(fac, out);
  };

  private static INSTANCE: FacilityRepository | undefined;

  private readonly publisher = this.bus.getPublisher<FacilityRepositoryEvents & FacilityRepositorySyncEvents>();

  private readonly repos = new Map<FacilityType, Map<string, Facility>>();
  private readonly trees: Record<SearchableFacilityTypes, GeoKdTree<Facility>> = {
    [FacilityType.USR]: new GeoKdTree(FacilityRepository.treeKeyFunc),
    [FacilityType.VIS]: new GeoKdTree(FacilityRepository.treeKeyFunc),
  };

  private ignoreSync = false;
  private lastDumpRequestUid?: number;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  private constructor(private readonly bus: EventBus) {
    bus.getSubscriber<any>().on(FacilityRepository.SYNC_TOPIC).handle(this.onSyncEvent.bind(this));

    // Request a dump from any existing instances on other instruments to initialize the repository.
    this.pubSyncEvent({
      type: FacilityRepositorySyncType.DumpRequest, uid: this.lastDumpRequestUid = Math.random() * Number.MAX_SAFE_INTEGER
    });
  }

  /**
   * Gets the number of facilities stored in this repository.
   * @param types The types of facilities to count. Defaults to all facility types.
   * @returns The number of facilities stored in this repository.
   */
  public size(types?: readonly FacilityType[]): number {
    let size = 0;

    if (types === undefined) {
      for (const repo of this.repos.values()) {
        size += repo.size;
      }
    } else {
      for (let i = 0; i < types.length; i++) {
        size += this.repos.get(types[i])?.size ?? 0;
      }
    }

    return size;
  }

  /**
   * Retrieves a facility from this repository.
   * @param icao The ICAO of the facility to retrieve.
   * @returns The requested user facility, or undefined if it was not found in this repository.
   */
  public get(icao: string): Facility | undefined {
    if (!ICAO.isFacility(icao)) {
      return undefined;
    }

    return this.repos.get(ICAO.getFacilityType(icao))?.get(icao);
  }

  /**
   * Searches for facilities around a point. Only supported for USR and VIS facilities.
   * @param type The type of facility for which to search.
   * @param lat The latitude of the query point, in degrees.
   * @param lon The longitude of the query point, in degrees.
   * @param radius The radius of the search, in great-arc radians.
   * @param visitor A visitor function. This function will be called once per element found within the search radius.
   * If the visitor returns `true`, then the search will continue; if the visitor returns `false`, the search will
   * immediately halt.
   * @throws Error if spatial searches are not supported for the specified facility type.
   */
  public search(type: SearchableFacilityTypes, lat: number, lon: number, radius: number, visitor: GeoKdTreeSearchVisitor<Facility>): void;
  /**
   * Searches for facilities around a point. Only supported for USR and VIS facilities.
   * @param type The type of facility for which to search.
   * @param lat The latitude of the query point, in degrees.
   * @param lon The longitude of the query point, in degrees.
   * @param radius The radius of the search, in great-arc radians.
   * @param maxResultCount The maximum number of search results to return.
   * @param out An array in which to store the search results.
   * @param filter A function to filter the search results.
   * @throws Error if spatial searches are not supported for the specified facility type.
   */
  public search(
    type: SearchableFacilityTypes,
    lat: number,
    lon: number,
    radius: number,
    maxResultCount: number,
    out: Facility[],
    filter?: GeoKdTreeSearchFilter<Facility>
  ): Facility[]
  // eslint-disable-next-line jsdoc/require-jsdoc
  public search(
    type: SearchableFacilityTypes,
    lat: number,
    lon: number,
    radius: number,
    arg5: GeoKdTreeSearchVisitor<Facility> | number,
    out?: Facility[],
    filter?: GeoKdTreeSearchFilter<Facility>
  ): void | Facility[] {
    if (type !== FacilityType.USR && type !== FacilityType.VIS) {
      throw new Error(`FacilityRepository: spatial searches are not supported for facility type ${type}`);
    }

    if (typeof arg5 === 'number') {
      return this.trees[type].search(lat, lon, radius, arg5, out as Facility[], filter);
    } else {
      this.trees[type].search(lat, lon, radius, arg5);
    }
  }

  /**
   * Adds a facility to this repository and all other repositories synced with this one. If this repository already
   * contains a facility with the same ICAO as the facility to add, the existing facility will be replaced with the
   * new one.
   * @param fac The facility to add.
   * @throws Error if the facility has an invalid ICAO.
   */
  public add(fac: Facility): void {
    if (!ICAO.isFacility(fac.icao)) {
      throw new Error(`FacilityRepository: invalid facility ICAO ${fac.icao}`);
    }

    this.addToRepo(fac);
    this.pubSyncEvent({ type: FacilityRepositorySyncType.Add, facs: [fac] });
  }

  /**
   * Adds multiple facilities from this repository and all other repositories synced with this one. For each added
   * facility, if this repository already contains a facility with the same ICAO, the existing facility will be
   * replaced with the new one.
   * @param facs The facilities to add.
   */
  public addMultiple(facs: readonly Facility[]): void {
    this.addMultipleToRepo(facs);
    this.pubSyncEvent({ type: FacilityRepositorySyncType.Add, facs: Array.from(facs) });
  }

  /**
   * Removes a facility from this repository and all other repositories synced with this one.
   * @param fac The facility to remove, or the ICAO of the facility to remove.
   * @throws Error if the facility has an invalid ICAO.
   */
  public remove(fac: Facility | string): void {
    const icao = typeof fac === 'string' ? fac : fac.icao;
    if (!ICAO.isFacility(icao)) {
      throw new Error(`FacilityRepository: invalid facility ICAO ${icao}`);
    }

    this.removeFromRepo(icao);
    this.pubSyncEvent({ type: FacilityRepositorySyncType.Remove, facs: [icao] });
  }

  /**
   * Removes multiple facilities from this repository and all other repositories synced with this one.
   * @param facs The facilities to remove, or the ICAOs of the facilties to remove.
   */
  public removeMultiple(facs: readonly (Facility | string)[]): void {
    this.removeMultipleFromRepo(facs);
    this.pubSyncEvent({ type: FacilityRepositorySyncType.Remove, facs: facs.map(fac => typeof fac === 'object' ? fac.icao : fac) });
  }

  /**
   * Iterates over every facility in this respository with a visitor function.
   * @param fn A visitor function.
   * @param types The types of facilities over which to iterate. Defaults to all facility types.
   */
  public forEach(fn: (fac: Facility) => void, types?: readonly FacilityType[]): void {
    if (types === undefined) {
      for (const repo of this.repos.values()) {
        repo.forEach(fn);
      }
    } else {
      for (let i = 0; i < types.length; i++) {
        this.repos.get(types[i])?.forEach(fn);
      }
    }
  }

  /**
   * Adds a facility to this repository.
   * @param fac The facility to add.
   */
  private addToRepo(fac: Facility): void {
    const facilityType = ICAO.getFacilityType(fac.icao);

    let repo = this.repos.get(facilityType);
    if (repo === undefined) {
      this.repos.set(facilityType, repo = new Map<string, Facility>());
    }

    const existing = repo.get(fac.icao);

    repo.set(fac.icao, fac);

    if (facilityType === FacilityType.USR || facilityType === FacilityType.VIS) {
      if (existing === undefined) {
        this.trees[facilityType].insert(fac);
      } else {
        this.trees[facilityType].removeAndInsert([existing], [fac]);
      }
    }

    if (existing === undefined) {
      this.publisher.pub('facility_added', fac, false, false);
    } else {
      this.publisher.pub(`facility_changed_${fac.icao}`, fac, false, false);
      this.publisher.pub('facility_changed', fac, false, false);
    }
  }

  /**
   * Adds multiple facilities to this repository.
   * @param facs The facilities to add.
   */
  private addMultipleToRepo(facs: readonly Facility[]): void {
    if (facs.length === 0) {
      return;
    }

    const addedFacilities: Facility[] = [];
    const changedFacilitiesRemoved: Facility[] = [];
    const changedFacilitiesAdded: Facility[] = [];

    for (let i = 0; i < facs.length; i++) {
      const fac = facs[i];
      const facilityType = ICAO.getFacilityType(fac.icao);

      let repo = this.repos.get(facilityType);
      if (repo === undefined) {
        this.repos.set(facilityType, repo = new Map<string, Facility>());
      }

      const existing = repo.get(fac.icao);

      repo.set(fac.icao, fac);

      if (existing === undefined) {
        addedFacilities.push(fac);
      } else {
        changedFacilitiesRemoved.push(existing);
        changedFacilitiesAdded.push(fac);
      }
    }

    const addedUserFacilities = facs.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.USR));
    if (addedUserFacilities.length > 0) {
      const removedUserFacilities = changedFacilitiesRemoved.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.USR));
      this.trees[FacilityType.USR].removeAndInsert(removedUserFacilities, addedUserFacilities);
    }

    const addedVisFacilities = facs.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.VIS));
    if (addedVisFacilities.length > 0) {
      const removedVisFacilities = changedFacilitiesRemoved.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.VIS));
      this.trees[FacilityType.VIS].removeAndInsert(removedVisFacilities, addedVisFacilities);
    }

    for (let i = 0; i < addedFacilities.length; i++) {
      const fac = addedFacilities[i];
      this.publisher.pub('facility_added', fac, false, false);
    }
    for (let i = 0; i < changedFacilitiesAdded.length; i++) {
      const fac = changedFacilitiesAdded[i];
      this.publisher.pub(`facility_changed_${fac.icao}`, fac, false, false);
      this.publisher.pub('facility_changed', fac, false, false);
    }
  }

  /**
   * Removes a facility from this repository.
   * @param fac The facility to remove, or the ICAO of the facility to remove.
   */
  private removeFromRepo(fac: Facility | string): void {
    const icao = typeof fac === 'string' ? fac : fac.icao;
    const facilityType = ICAO.getFacilityType(icao);
    const repo = this.repos.get(ICAO.getFacilityType(icao));

    if (repo === undefined) {
      return;
    }

    const facilityInRepo = repo.get(icao);

    if (facilityInRepo === undefined) {
      return;
    }

    repo.delete(icao);

    if (facilityType === FacilityType.USR || facilityType === FacilityType.VIS) {
      this.trees[facilityType].remove(facilityInRepo);
    }

    this.publisher.pub(`facility_removed_${icao}`, facilityInRepo, false, false);
    this.publisher.pub('facility_removed', facilityInRepo, false, false);
  }

  /**
   * Removes multiple facilities from this repository.
   * @param facs The facilities to remove, or the ICAOs of the facilities to remove.
   */
  private removeMultipleFromRepo(facs: readonly (Facility | string)[]): void {
    if (facs.length === 0) {
      return;
    }

    const removedFacilities: Facility[] = [];

    for (let i = 0; i < facs.length; i++) {
      const fac = facs[i];
      const icao = typeof fac === 'string' ? fac : fac.icao;
      const repo = this.repos.get(ICAO.getFacilityType(icao));

      if (repo === undefined) {
        continue;
      }

      const facilityInRepo = repo.get(icao);

      if (facilityInRepo === undefined) {
        continue;
      }

      repo.delete(icao);

      removedFacilities.push(facilityInRepo);
    }

    const removedUserFacilities = removedFacilities.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.USR));
    if (removedUserFacilities.length > 0) {
      this.trees[FacilityType.USR].removeAll(removedUserFacilities);
    }

    const removedVisFacilities = removedFacilities.filter(fac => FacilityUtils.isFacilityType(fac, FacilityType.VIS));
    if (removedVisFacilities.length > 0) {
      this.trees[FacilityType.VIS].removeAll(removedVisFacilities);
    }

    for (let i = 0; i < removedFacilities.length; i++) {
      const removedFac = removedFacilities[i];
      this.publisher.pub(`facility_removed_${removedFac.icao}`, removedFac, false, false);
      this.publisher.pub('facility_removed', removedFac, false, false);
    }
  }

  /**
   * Publishes a facility added or removed sync event over the event bus.
   * @param data The event data.
   */
  private pubSyncEvent(data: FacilityRepositorySyncData): void {
    this.ignoreSync = true;
    this.publisher.pub(FacilityRepository.SYNC_TOPIC, data, true, false);
    this.ignoreSync = false;
  }

  /**
   * A callback which is called when a sync event occurs.
   * @param data The event data.
   */
  private onSyncEvent(data: FacilityRepositorySyncData): void {
    if (this.ignoreSync) {
      return;
    }

    switch (data.type) {
      case FacilityRepositorySyncType.DumpResponse:
        // Only accept responses to your own dump requests.
        if (data.uid !== this.lastDumpRequestUid) {
          break;
        } else {
          this.lastDumpRequestUid = undefined;
        }
      // eslint-disable-next-line no-fallthrough
      case FacilityRepositorySyncType.Add:
        if (data.facs.length === 1) {
          this.addToRepo(data.facs[0]);
        } else {
          this.addMultipleToRepo(data.facs);
        }
        break;
      case FacilityRepositorySyncType.Remove:
        if (data.facs.length === 1) {
          this.removeFromRepo(data.facs[0]);
        } else {
          this.removeMultipleFromRepo(data.facs);
        }
        break;
      case FacilityRepositorySyncType.DumpRequest:
        // Don't respond to your own dump requests.
        if (data.uid !== this.lastDumpRequestUid) {
          const facs: Facility[] = [];
          this.forEach(fac => facs.push(fac));
          this.pubSyncEvent({ type: FacilityRepositorySyncType.DumpResponse, uid: data.uid, facs });
        }
        break;
    }
  }

  /**
   * Gets an instance of FacilityRepository.
   * @param bus The event bus.
   * @returns an instance of FacilityRepository.
   */
  public static getRepository(bus: EventBus): FacilityRepository {
    return FacilityRepository.INSTANCE ??= new FacilityRepository(bus);
  }
}