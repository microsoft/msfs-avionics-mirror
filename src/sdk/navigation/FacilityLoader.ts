/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/simplane" />

import { SimVarValueType } from '../data/SimVars';
import { GeoPoint } from '../geo/GeoPoint';
import { BitFlags } from '../math/BitFlags';
import { UnitType } from '../math/NumberUnit';
import { GeoKdTreeSearchFilter } from '../utils/datastructures/GeoKdTree';
import { AiracCycle, AiracUtils } from './AiracUtils';
import {
  AirportClass, AirportFacility, AirportFacilityDataFlags, AirwaySegment, BoundaryFacility, Facility,
  FacilitySearchType, FacilityType, FacilityTypeMap, IntersectionFacility, IntersectionType, NearestSearchResults,
  VorClass, VorType
} from './Facilities';
import {
  AirwayData, FacilityClient, FacilitySearchTypeLatLon, NearestAirportFilteredSearchSession,
  NearestBoundaryFilteredSearchSession, NearestCustomFilteredSearchSession, NearestIcaoSearchSession,
  NearestIcaoSearchSessionDataType, NearestIcaoSearchSessionDataTypeMap, NearestIntersectionFilteredSearchSession,
  NearestSearchSession, NearestSearchSessionTypeMap, NearestVorFilteredSearchSession, SearchTypeMap
} from './FacilityClient';
import { FacilityRepository, FacilityRepositorySearchableTypes } from './FacilityRepository';
import { FacilityUtils } from './FacilityUtils';
import { Metar, Taf } from './FacilityWeather';
import { IcaoType, IcaoValue } from './Icao';
import { ICAO } from './IcaoUtils';
import { RunwayUtils } from './RunwayUtils';

/**
 * An airway.
 */
export class AirwayObject implements AirwayData {
  private _name: string;
  private _type: number;
  private _waypoints: IntersectionFacility[] = [];

  /** Builds a Airway
   * @param name - the name of the new airway.
   * @param type - the type of the new airway.
   */
  constructor(name: string, type: number) {
    this._name = name;
    this._type = type;
  }

  /** @inheritDoc */
  get name(): string {
    return this._name;
  }

  /** @inheritDoc */
  get type(): number {
    return this._type;
  }

  /** @inheritDoc */
  get waypoints(): IntersectionFacility[] {
    return this._waypoints;
  }

  /**
   * Sets the waypoints of this airway.
   * @param waypoints is the array of waypoints.
   */
  set waypoints(waypoints: IntersectionFacility[]) {
    this._waypoints = waypoints;
  }
}

/**
 * A type map of search type to concrete search session type.
 */
type NearestSessionTypeMap<IcaoDataType extends NearestIcaoSearchSessionDataType> = {
  /** All facilities search session. */
  [FacilitySearchType.All]: NearestIcaoSearchSession<IcaoDataType>;

  /** Airport search session. */
  [FacilitySearchType.Airport]: NearestAirportSearchSession<IcaoDataType>;

  /** Intersection search session. */
  [FacilitySearchType.Intersection]: NearestIntersectionSearchSession<IcaoDataType>;

  /** VOR search session. */
  [FacilitySearchType.Vor]: NearestVorSearchSession<IcaoDataType>;

  /** NDB search session. */
  [FacilitySearchType.Ndb]: NearestIcaoSearchSession<IcaoDataType>;

  /** Boundary search session. */
  [FacilitySearchType.Boundary]: NearestBoundarySearchSession;

  /** Nearest user facility search session. */
  [FacilitySearchType.User]: NearestRepoFacilitySearchSession<FacilityType.USR, IcaoDataType>;

  /** Nearest visual facility search session. */
  [FacilitySearchType.Visual]: NearestRepoFacilitySearchSession<FacilityType.VIS, IcaoDataType>;

  /** All facilities search session. */
  [FacilitySearchType.AllExceptVisual]: NearestIcaoSearchSession<IcaoDataType>;
}

/**
 * A type map of facility type to facility search type.
 */
export const FacilityTypeSearchType = {
  /** Airport facility type. */
  [FacilityType.Airport]: FacilitySearchType.Airport,

  /** Intersection facility type. */
  [FacilityType.Intersection]: FacilitySearchType.Intersection,

  /** NDB facility type. */
  [FacilityType.NDB]: FacilitySearchType.Ndb,

  /** VOR facility type. */
  [FacilityType.VOR]: FacilitySearchType.Vor,

  /** USR facility type. */
  [FacilityType.USR]: FacilitySearchType.User,

  /** Visual facility type. */
  [FacilityType.VIS]: FacilitySearchType.Visual
} as const;

/**
 * Facility search types supported by sim-side searches.
 */
type CoherentSearchType
  = FacilitySearchType.Airport
  | FacilitySearchType.Vor
  | FacilitySearchType.Ndb
  | FacilitySearchType.Intersection
  | FacilitySearchType.Boundary
  | FacilitySearchType.All;

/**
 * Facility search types supported by {@link FacilityRepository} searches.
 */
type RepoSearchType = FacilitySearchType.User | FacilitySearchType.Visual;

/**
 * A facility loader request for the request queue.
 */
type FacilityRequest = {
  /** The promise for the request. */
  promise: Promise<Facility | null>;

  /** The time of this request. */
  timeStamp: number;

  /** Whether the ICAO of the request has been confirmed to be valid. */
  isIcaoConfirmedValid: boolean;

  /** The promise resolution function to call when the request is finished. */
  resolve: (facility: Facility | null) => void;

  /**
   * Bitflags describing the airport facility data to load for this request. Can be safely ignored if this request is
   * not for an airport facility.
   */
  airportDataFlags: number;
}

/**
 * A Promise resolve function for a nearest facilities search request.
 */
type SearchRequestResolve<TAdded, TRemoved> = (results: NearestSearchResults<TAdded, TRemoved>) => void;

/** Facility database cycle information. */
export interface FacilityDatabaseCycles {
  /** The AIRAC cycle immediately prior to the facility database cycle. */
  previous: AiracCycle;
  /** The AIRAC cycle of the facility database. */
  current: AiracCycle;
  /** The AIRAC cycle immediately after the facility database cycle. */
  next: AiracCycle;
}

/**
 * A class that handles loading facility data from the simulator.
 */
export class FacilityLoader implements FacilityClient {
  private static readonly MAX_FACILITY_CACHE_ITEMS = 1000;
  private static readonly MAX_AIRWAY_CACHE_ITEMS = 1000;

  private static facilityListener: ViewListener.ViewListener;

  private static readonly coherentLoadFacilityCalls: Partial<Record<FacilityType, string>> = {
    [FacilityType.Airport]: 'LOAD_AIRPORT_FROM_STRUCT',
    [FacilityType.VOR]: 'LOAD_VOR_FROM_STRUCT',
    [FacilityType.NDB]: 'LOAD_NDB_FROM_STRUCT',
    [FacilityType.Intersection]: 'LOAD_INTERSECTION_FROM_STRUCT',
  };

  private static readonly requestQueue = new Map<string, FacilityRequest>();
  private static readonly mismatchRequestQueue = new Map<string, FacilityRequest>();

  private static readonly facCache = new Map<string, Facility>();
  private static readonly typeMismatchFacCache = new Map<string, Facility>();
  private static readonly airwayCache = new Map<string, AirwayObject>();
  private static databaseCycleCache?: FacilityDatabaseCycles;

  private static readonly searchSessions = new Map<number, NearestSearchSession<any, any>>();

  private static readonly facRepositorySearchTypes: Partial<Record<FacilitySearchType, FacilityType[]>> = {
    [FacilitySearchType.All]: [FacilityType.USR, FacilityType.VIS],
    [FacilitySearchType.User]: [FacilityType.USR],
    [FacilitySearchType.Visual]: [FacilityType.VIS],
    [FacilitySearchType.AllExceptVisual]: [FacilityType.USR]
  };

  private static repoSearchSessionId = -1;

  private static isInitialized = false;
  private static readonly initPromiseResolveQueue: (() => void)[] = [];

  /**
   * Creates an instance of the FacilityLoader.
   * @param facilityRepo A local facility repository.
   * @param onInitialized A callback to call when the facility loader has completed initialization.
   */
  constructor(
    private readonly facilityRepo: FacilityRepository,
    public readonly onInitialized = (): void => { }
  ) {
    if (FacilityLoader.facilityListener === undefined) {
      FacilityLoader.facilityListener = RegisterViewListener('JS_LISTENER_FACILITY', () => {
        FacilityLoader.facilityListener.on('SendAirport', FacilityLoader.onFacilityReceived);
        FacilityLoader.facilityListener.on('SendIntersection', FacilityLoader.onFacilityReceived);
        FacilityLoader.facilityListener.on('SendVor', FacilityLoader.onFacilityReceived);
        FacilityLoader.facilityListener.on('SendNdb', FacilityLoader.onFacilityReceived);
        FacilityLoader.facilityListener.on('NearestSearchCompleted', FacilityLoader.onNearestSearchCompleted);
        FacilityLoader.facilityListener.on('NearestSearchCompletedWithStruct', FacilityLoader.onNearestSearchCompleted);

        setTimeout(() => FacilityLoader.init(), 2000);
      }, true);
    }

    this.awaitInitialization().then(() => this.onInitialized());
  }

  /**
   * Initializes this facility loader.
   */
  private static init(): void {
    FacilityLoader.isInitialized = true;

    for (const resolve of this.initPromiseResolveQueue) {
      resolve();
    }

    this.initPromiseResolveQueue.length = 0;
  }

  /** @inheritDoc */
  public awaitInitialization(): Promise<void> {
    if (FacilityLoader.isInitialized) {
      return Promise.resolve();
    } else {
      return new Promise(resolve => {
        FacilityLoader.initPromiseResolveQueue.push(resolve);
      });
    }
  }

  /** @inheritDoc */
  public tryGetFacility<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags?: number): Promise<FacilityTypeMap[T] | null> {
    return this._tryGetFacility(type, icao, airportDataFlags);
  }

  /** @inheritDoc */
  public async getFacility<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags?: number): Promise<FacilityTypeMap[T]>;
  /** @inheritDoc */
  public async getFacility<T extends FacilityType>(type: T, icao: string): Promise<FacilityTypeMap[T]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public async getFacility<T extends FacilityType>(type: T, icao: IcaoValue | string, airportDataFlags?: number): Promise<FacilityTypeMap[T]> {
    if (typeof icao === 'string') {
      icao = ICAO.stringV1ToValue(icao);
    }

    const result = await this._tryGetFacility(type, icao, airportDataFlags);
    if (result === null) {
      throw new Error(`FacilityLoader: facility could not be retrieved for ICAO ${ICAO.tryValueToStringV2(icao)}`);
    } else {
      return result;
    }
  }

  /** @inheritDoc */
  public getFacilities(icaos: readonly IcaoValue[], airportDataFlags?: number): Promise<(Facility | null)[]> {
    return Promise.all(
      icaos.map((icao) => {
        if (!ICAO.isValueFacility(icao)) {
          return null;
        }

        return this._tryGetFacility(ICAO.getFacilityTypeFromValue(icao), icao, airportDataFlags);
      },
      ),
    );
  }

  /** @inheritDoc */
  public getFacilitiesOfType<T extends FacilityType>(type: T, icaos: readonly IcaoValue[]): Promise<(FacilityTypeMap[T] | null)[]>;
  /** @inheritDoc */
  public getFacilitiesOfType(type: FacilityType.Airport, icaos: readonly IcaoValue[], airportDataFlags?: number): Promise<(AirportFacility | null)[]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public getFacilitiesOfType<T extends FacilityType>(type: T, icaos: readonly IcaoValue[], airportDataFlags?: number): Promise<(FacilityTypeMap[T] | null)[]> {
    return Promise.all(
      icaos.map((icao) => {
        if (!ICAO.isValueFacility(icao)) {
          return null;
        }

        return this._tryGetFacility(type, icao, airportDataFlags);
      },
      ),
    );
  }

  /**
   * Attempts to retrieve a facility.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facility to retrieve.
   * The retrieved facility (if any) is guaranteed to have *at least* as much data loaded as requested. Ignored if the
   * type of facility to retrieve is not `FacilityType.Airport`. Defaults to `AirportFacilityDataFlags.All`.
   * @returns A Promise which will be fulfilled with the requested facility, or `null` if the facility could not be
   * retrieved.
   */
  private async _tryGetFacility<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags?: number): Promise<FacilityTypeMap[T] | null> {
    switch (type) {
      case FacilityType.USR:
      case FacilityType.RWY:
      case FacilityType.VIS:
        return this.getFacilityFromRepo(type, icao);
      case FacilityType.Airport:
        return this.getFacilityFromCoherent(type, icao, airportDataFlags ?? AirportFacilityDataFlags.All);
      case FacilityType.VOR:
      case FacilityType.NDB:
      case FacilityType.Intersection:
        return this.getFacilityFromCoherent(type, icao);
      default:
        console.warn(`FacilityLoader: facility request for facility type ${type} is unsupported.`);
        return null;
    }
  }

  /**
   * Retrieves a facility from the local facility repository.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @returns A Promise which will be fulfilled with the requested facility, or `null` if the facility could not be
   * retrieved.
   */
  private async getFacilityFromRepo<T extends FacilityType>(type: T, icao: IcaoValue): Promise<FacilityTypeMap[T] | null> {
    const fac = this.facilityRepo.get(icao);
    if (fac) {
      return fac as FacilityTypeMap[T];
    } else if (type === FacilityType.RWY) {
      try {
        const airport = await this.getFacility(FacilityType.Airport, ICAO.value(IcaoType.Airport, '', '', icao.airport));
        const runway = RunwayUtils.matchOneWayRunwayFromIdent(airport, icao.ident);
        if (runway) {
          const runwayFac = RunwayUtils.createRunwayFacility(airport, runway);
          this.facilityRepo.add(runwayFac);
          return runwayFac as FacilityTypeMap[T];
        }
      } catch (e) {
        // noop
      }
    }

    console.warn(`FacilityLoader: facility ${ICAO.tryValueToStringV2(icao)} could not be found.`);
    return null;
  }

  /**
   * Retrieves a facility from Coherent.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facility to retrieve.
   * The retrieved facility (if any) is guaranteed to have *at least* as much data loaded as requested. Ignored if the
   * type of facility to retrieve is not `FacilityType.Airport`. Defaults to `0`.
   * @returns A Promise which will be fulfilled with the requested facility, or `null` if the facility could not be
   * retrieved.
   */
  private async getFacilityFromCoherent<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags = 0): Promise<FacilityTypeMap[T] | null> {
    const isMismatch = ICAO.getFacilityTypeFromValue(icao) !== type;

    let queue = FacilityLoader.requestQueue;
    let cache = FacilityLoader.facCache;
    if (isMismatch) {
      queue = FacilityLoader.mismatchRequestQueue;
      cache = FacilityLoader.typeMismatchFacCache;
    }

    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const uid = ICAO.getUid(icao);
    const cachedFac = cache.get(uid);
    if (cachedFac !== undefined) {
      // If the requested facility is an airport and a cached facility exists, then check if it is missing any of the
      // requested loaded data. If so, then request a new facility from Coherent that includes the requested loaded
      // data AND all the data loaded into the currently cached facility. In all other cases, return the cached
      // facility.
      if (type === FacilityType.Airport && !BitFlags.isAll((cachedFac as AirportFacility).loadedDataFlags, airportDataFlags)) {
        airportDataFlags |= (cachedFac as AirportFacility).loadedDataFlags;
      } else {
        return cachedFac as FacilityTypeMap[T];
      }
    }

    const currentTime = Date.now();

    const request = queue.get(uid);

    // If there is an existing request and the current timestamp is less than the request timestamp (can only happen if
    // the operating system clock was changed), then reset the request timestamp to the current timestamp.
    if (request && currentTime < request.timeStamp) {
      request.timeStamp = currentTime;
    }

    // If there is no existing request for the facility, OR if the existing request has been pending for at least
    // (10 seconds if ICAO validity has not yet been confirmed, or 60 seconds if ICAO validity has been confirmed),
    // then dispatch a new request. If we are replacing an existing request, then time out the existing request with
    // a null result.
    if (request === undefined || currentTime - request.timeStamp > (request.isIcaoConfirmedValid ? 60000 : 10000)) {
      if (request !== undefined) {
        console.warn(`FacilityLoader: facility request for ${ICAO.tryValueToStringV2(icao)} has timed out.`);
        request.resolve(null);
      }

      return this.dispatchCoherentFacilityRequest(queue, undefined, type, icao, airportDataFlags);
    } else if (type === FacilityType.Airport) {
      airportDataFlags ??= 0;
      if (!BitFlags.isAll(request.airportDataFlags, airportDataFlags)) {
        return this.dispatchCoherentFacilityRequest(queue, request, type, icao, airportDataFlags | request.airportDataFlags);
      }
    }

    return request.promise as Promise<FacilityTypeMap[T] | null>;
  }

  /**
   * Dispatches a Coherent facility load request.
   * @param queue The facility request queue in which to insert the request once it has been dispatched.
   * @param existingRequest An existing facility load request that the new request will replace. If defined, then the
   * existing request's Promise will be fulfilled in addition to the new request's Promise when the new request is
   * finished.
   * @param type The type of facility to load.
   * @param icao The ICAO of the facility to load.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facility to retrieve.
   * The retrieved facility (if any) is guaranteed to have *at least* as much data loaded as requested. Ignored if the
   * type of facility to retrieve is not `FacilityType.Airport`. Defaults to `0`.
   * @returns A Promise which will be fulfilled with the requested facility, or `null` if the facility could not be
   * retrieved.
   */
  private dispatchCoherentFacilityRequest<T extends FacilityType>(
    queue: Map<string, FacilityRequest>,
    existingRequest: FacilityRequest | undefined,
    type: T,
    icao: IcaoValue,
    airportDataFlags = 0
  ): Promise<FacilityTypeMap[T] | null> {
    const uid = ICAO.getUid(icao);

    const isAirport = type === FacilityType.Airport;

    const request = { isIcaoConfirmedValid: false, timeStamp: Date.now(), airportDataFlags } as FacilityRequest;

    request.promise = new Promise<FacilityTypeMap[T] | null>((resolution) => {
      if (existingRequest) {
        request.resolve = (facility: Facility | null) => {
          existingRequest.resolve(facility);
          resolution(facility as FacilityTypeMap[T]);
        };
      } else {
        request.resolve = resolution as (facility: Facility | null) => void;
      }

      const coherentCallPromise = isAirport
        ? Coherent.call(FacilityLoader.coherentLoadFacilityCalls[type], icao, airportDataFlags ?? AirportFacilityDataFlags.All)
        : Coherent.call(FacilityLoader.coherentLoadFacilityCalls[type], icao);

      coherentCallPromise.then((isValid: boolean) => {
        if (isValid) {
          if (queue.get(uid) === request) {
            request.isIcaoConfirmedValid = true;
          }
        } else {
          console.warn(`FacilityLoader: facility ${ICAO.tryValueToStringV2(icao)} could not be found.`);
          request.resolve(null);
          queue.delete(uid);
        }
      });
    });

    queue.set(uid, request);

    return request.promise as Promise<FacilityTypeMap[T] | null>;
  }

  /** @inheritDoc */
  public async tryGetAirway(airwayName: string, airwayType: number, icao: IcaoValue): Promise<AirwayData | null> {
    return this._tryGetAirway(airwayName, airwayType, icao);
  }

  /** @inheritDoc */
  public async getAirway(airwayName: string, airwayType: number, icao: IcaoValue): Promise<AirwayData>;
  /** @inheritDoc */
  public async getAirway(airwayName: string, airwayType: number, icao: string): Promise<AirwayData>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public async getAirway(airwayName: string, airwayType: number, icao: IcaoValue | string): Promise<AirwayData> {
    if (typeof icao === 'string') {
      icao = ICAO.stringV1ToValue(icao);
    }

    const airway = await this._tryGetAirway(airwayName, airwayType, icao);
    if (airway) {
      return airway;
    }

    throw new Error(`FacilityLoader: airway ${airwayName} could not be found on waypoint ${ICAO.tryValueToStringV2(icao)}.`);
  }

  /**
   * Attempts to retrieve data for an airway.
   * @param airwayName The airway name.
   * @param airwayType The airway type.
   * @param icao The ICAO value of one intersection in the airway.
   * @returns The retrieved airway data, or `null` if data could not be retrieved.
   */
  private async _tryGetAirway(airwayName: string, airwayType: number, icao: IcaoValue): Promise<AirwayData | null> {
    if (FacilityLoader.airwayCache.has(airwayName)) {
      const cachedAirway = FacilityLoader.airwayCache.get(airwayName);
      const match = cachedAirway?.waypoints.find((w) => ICAO.valueEquals(w.icaoStruct, icao));
      if (match !== undefined) {
        return cachedAirway!;
      }
    }

    const fac = await this.getFacility(FacilityType.Intersection, icao);
    const route = fac.routes.find((r) => r.name === airwayName);
    if (route !== undefined) {
      const airwayBuilder = new AirwayBuilder(fac, route, this);
      const status = await airwayBuilder.startBuild();
      if (status === AirwayStatus.COMPLETE) {
        const waypoints = airwayBuilder.waypoints;
        if (waypoints !== null) {
          const airway = new AirwayObject(airwayName, airwayType);
          airway.waypoints = waypoints;
          FacilityLoader.addToAirwayCache(airway);
          return airway;
        }
      }
    }

    return null;
  }

  /** @inheritDoc */
  public async startNearestSearchSessionWithIcaoStructs<T extends FacilitySearchType>(type: T): Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.Struct>[T]> {
    switch (type) {
      case FacilitySearchType.User:
      case FacilitySearchType.Visual:
        return this.startRepoNearestSearchSession(
          type,
          NearestIcaoSearchSessionDataType.Struct
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.Struct>[T]>;
      case FacilitySearchType.AllExceptVisual:
        return this.startCoherentNearestSearchSession(
          FacilitySearchType.All,
          NearestIcaoSearchSessionDataType.Struct
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.Struct>[T]>;
      default:
        return this.startCoherentNearestSearchSession(
          type,
          NearestIcaoSearchSessionDataType.Struct
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.Struct>[T]>;
    }
  }

  /** @inheritDoc */
  public async startNearestSearchSession<T extends FacilitySearchType>(type: T): Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.StringV1>[T]> {
    switch (type) {
      case FacilitySearchType.User:
      case FacilitySearchType.Visual:
        return this.startRepoNearestSearchSession(
          type,
          NearestIcaoSearchSessionDataType.StringV1
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.StringV1>[T]>;
      case FacilitySearchType.AllExceptVisual:
        return this.startCoherentNearestSearchSession(
          FacilitySearchType.All,
          NearestIcaoSearchSessionDataType.StringV1
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.StringV1>[T]>;
      default:
        return this.startCoherentNearestSearchSession(
          type,
          NearestIcaoSearchSessionDataType.StringV1
        ) as unknown as Promise<NearestSessionTypeMap<NearestIcaoSearchSessionDataType.StringV1>[T]>;
    }
  }

  /**
   * Starts a sim-side nearest facilities search session through Coherent.
   * @param type The type of facilities for which to search.
   * @param icaoDataType The data type of the ICAOs provided by the new session. Ignored if the search session does not
   * provide ICAOs.
   * @returns A Promise which will be fulfilled with the new nearest search session.
   */
  private async startCoherentNearestSearchSession<T extends CoherentSearchType, IcaoDataType extends NearestIcaoSearchSessionDataType>(
    type: T,
    icaoDataType: IcaoDataType
  ): Promise<NearestSearchSessionTypeMap<IcaoDataType>[T]> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const sessionId = await Coherent.call(
      icaoDataType === NearestIcaoSearchSessionDataType.Struct ? 'START_NEAREST_SEARCH_SESSION_WITH_STRUCT' : 'START_NEAREST_SEARCH_SESSION',
      type
    );
    let session: NearestSearchSessionTypeMap<IcaoDataType>[CoherentSearchType];

    switch (type) {
      case FacilitySearchType.Airport:
        session = new NearestAirportSearchSession(sessionId, icaoDataType);
        break;
      case FacilitySearchType.Intersection:
        session = new NearestIntersectionSearchSession(sessionId, icaoDataType);
        break;
      case FacilitySearchType.Vor:
        session = new NearestVorSearchSession(sessionId, icaoDataType);
        break;
      case FacilitySearchType.Boundary:
        session = new NearestBoundarySearchSession(sessionId);
        break;
      default:
        session = new CoherentIcaoNearestSearchSession(sessionId, icaoDataType);
        break;
    }

    FacilityLoader.searchSessions.set(sessionId, session);
    return session as NearestSearchSessionTypeMap<IcaoDataType>[T];
  }

  /**
   * Starts a repository facilities search session.
   * @param type The type of facilities for which to search.
   * @param icaoDataType The data type of the ICAOs provided by the new session.
   * @returns A Promise which will be fulfilled with the new nearest search session.
   * @throws Error if the search type is not supported.
   */
  private startRepoNearestSearchSession<T extends RepoSearchType, IcaoDataType extends NearestIcaoSearchSessionDataType>(
    type: T,
    icaoDataType: IcaoDataType
  ): NearestSessionTypeMap<IcaoDataType>[T] {
    // Session ID doesn't really matter for these, so in order to not conflict with IDs from Coherent, we will set
    // them all to negative numbers
    const sessionId = FacilityLoader.repoSearchSessionId--;

    switch (type) {
      case FacilitySearchType.User:
        return new NearestRepoFacilitySearchSession(
          this.facilityRepo,
          sessionId,
          FacilityType.USR,
          icaoDataType
        ) as NearestSessionTypeMap<IcaoDataType>[T];
      case FacilitySearchType.Visual:
        return new NearestRepoFacilitySearchSession(
          this.facilityRepo,
          sessionId,
          FacilityType.VIS,
          icaoDataType
        ) as NearestSessionTypeMap<IcaoDataType>[T];
      default:
        throw new Error();
    }
  }

  /** @inheritDoc */
  public async getMetar(airport: AirportFacility): Promise<Metar | undefined>;
  /** @inheritDoc */
  public async getMetar(ident: string): Promise<Metar | undefined>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public async getMetar(arg: string | AirportFacility): Promise<Metar | undefined> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const ident = typeof arg === 'string' ? arg : arg.icaoStruct.ident;
    const metar = await Coherent.call('GET_METAR_BY_IDENT', ident);
    return FacilityLoader.cleanMetar(metar);
  }

  /** @inheritDoc */
  public async searchMetar(lat: number, lon: number): Promise<Metar | undefined> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const metar = await Coherent.call('GET_METAR_BY_LATLON', lat, lon);
    return FacilityLoader.cleanMetar(metar);
  }

  /**
   * Cleans up a raw METAR object.
   * @param raw A raw METAR object.
   * @returns A cleaned version of the raw METAR object, or undefined if the raw METAR is empty.
   */
  private static cleanMetar(raw: any): Metar | undefined {
    if (raw.icao === '') {
      return undefined;
    }

    raw.windSpeed < 0 && delete raw.windSpeed;
    raw.maxWindDir < 0 && delete raw.maxWindDir;
    raw.minWindDir < 0 && delete raw.minWindDir;
    raw.windDir < 0 && delete raw.windDir;
    raw.gust < 0 && delete raw.gust;
    raw.cavok ??= false;
    raw.vis === null && delete raw.vis;
    raw.vertVis === null && delete raw.vertVis;
    raw.temp === -2147483648 && delete raw.temp;
    raw.dew === -2147483648 && delete raw.dew;
    raw.altimeterA < 0 && delete raw.altimeterA;
    raw.altimeterQ < 0 && delete raw.altimeterQ;
    raw.slp < 0 && delete raw.slp;

    return raw;
  }

  /** @inheritDoc */
  public async getTaf(airport: AirportFacility): Promise<Taf | undefined>;
  /** @inheritDoc */
  public async getTaf(ident: string): Promise<Taf | undefined>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public async getTaf(arg: string | AirportFacility): Promise<Taf | undefined> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const ident = typeof arg === 'string' ? arg : arg.icaoStruct.ident;
    const taf = await Coherent.call('GET_TAF_BY_IDENT', ident);
    return FacilityLoader.cleanTaf(taf);
  }

  /** @inheritDoc */
  public async searchTaf(lat: number, lon: number): Promise<Taf | undefined> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    const taf = await Coherent.call('GET_TAF_BY_LATLON', lat, lon);
    return FacilityLoader.cleanTaf(taf);
  }

  /**
   * Cleans up a raw TAF object.
   * @param raw A raw TAF object.
   * @returns A cleaned version of the raw TAF object, or undefined if the raw TAF is empty.
   */
  private static cleanTaf(raw: any): Taf | undefined {
    if (raw.icao === '') {
      return undefined;
    }

    for (const group of raw.conditionChangeGroups) {
      group.windSpeed < 0 && delete group.windSpeed;
      group.windDir < 0 && delete group.windDir;
      group.gust < 0 && delete group.gust;
      group.vis === null && delete group.vis;
      group.vertVis === null && delete group.vertVis;
    }

    raw.windSpeed < 0 && delete raw.windSpeed;
    raw.maxWindDir < 0 && delete raw.maxWindDir;
    raw.minWindDir < 0 && delete raw.minWindDir;
    raw.windDir < 0 && delete raw.windDir;
    raw.gust < 0 && delete raw.gust;
    raw.cavok ??= false;
    raw.vis === null && delete raw.vis;
    raw.vertVis === null && delete raw.vertVis;
    raw.altimeterA < 0 && delete raw.altimeterA;
    raw.altimeterQ < 0 && delete raw.altimeterQ;
    raw.slp < 0 && delete raw.slp;

    return raw;
  }

  /** @inheritDoc */
  public async searchByIdentWithIcaoStructs(filter: FacilitySearchType, ident: string, maxItems = 40): Promise<IcaoValue[]> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    let results: IcaoValue[];
    if (filter !== FacilitySearchType.User && filter !== FacilitySearchType.Visual) {
      const coherentFilter = filter === FacilitySearchType.AllExceptVisual ? FacilitySearchType.All : filter;
      results = await Coherent.call('SEARCH_BY_IDENT_WITH_STRUCT', ident, coherentFilter, maxItems) as IcaoValue[];
    } else {
      results = [];
    }

    const facRepositorySearchTypes = FacilityLoader.facRepositorySearchTypes[filter];
    if (facRepositorySearchTypes) {
      this.facilityRepo.forEach(fac => {
        const facIdent = fac.icaoStruct.ident;

        if (facIdent === ident) {
          results.unshift(fac.icaoStruct);
        } else if (facIdent.startsWith(ident)) {
          results.push(fac.icaoStruct);
        }
      }, facRepositorySearchTypes);
    }

    return results;
  }

  /** @inheritDoc */
  public async searchByIdent(filter: FacilitySearchType, ident: string, maxItems = 40): Promise<string[]> {
    if (!FacilityLoader.isInitialized) {
      await this.awaitInitialization();
    }

    let results: string[];
    if (filter !== FacilitySearchType.User && filter !== FacilitySearchType.Visual) {
      const coherentFilter = filter === FacilitySearchType.AllExceptVisual ? FacilitySearchType.All : filter;
      results = await Coherent.call('SEARCH_BY_IDENT', ident, coherentFilter, maxItems) as Array<string>;
    } else {
      results = [];
    }

    const facRepositorySearchTypes = FacilityLoader.facRepositorySearchTypes[filter];
    if (facRepositorySearchTypes) {
      this.facilityRepo.forEach(fac => {
        const facIdent = ICAO.getIdent(fac.icao);

        if (facIdent === ident) {
          results.unshift(fac.icao);
        } else if (facIdent.startsWith(ident)) {
          results.push(fac.icao);
        }
      }, facRepositorySearchTypes);
    }

    return results;
  }

  /** @inheritDoc */
  public async findNearestFacilitiesByIdent<T extends FacilitySearchTypeLatLon>(
    filter: T,
    ident: string,
    lat: number,
    lon: number,
    maxItems = 40
  ): Promise<SearchTypeMap[T][]> {

    const results = await this.searchByIdentWithIcaoStructs(filter, ident, maxItems);

    if (!results) {
      return [];
    }

    const promises = [] as Promise<SearchTypeMap[T]>[];

    for (let i = 0; i < results.length; i++) {
      const icao = results[i];
      if (icao.ident === ident) {
        const facType = ICAO.getFacilityTypeFromValue(icao);
        promises.push(this.getFacility(facType, icao) as Promise<SearchTypeMap[T]>);
      }
    }

    const foundFacilities = await Promise.all(promises);

    if (foundFacilities.length > 1) {
      foundFacilities.sort((a, b) => GeoPoint.distance(lat, lon, a.lat, a.lon) - GeoPoint.distance(lat, lon, b.lat, b.lon));
      return foundFacilities;
    } else if (foundFacilities.length === 1) {
      return foundFacilities;
    } else {
      return [];
    }
  }

  /**
   * A callback called when a facility is received from the simulator.
   * @param facility The received facility.
   */
  private static onFacilityReceived(facility: Facility): void {
    const isMismatch = (facility as any)['__Type'] === 'JS_FacilityIntersection' && facility.icaoStruct.type !== IcaoType.Waypoint;
    const queue = isMismatch ? FacilityLoader.mismatchRequestQueue : FacilityLoader.requestQueue;

    const uid = ICAO.getUid(facility.icaoStruct);
    const request = queue.get(uid);
    if (request !== undefined) {
      // If the received facility is an airport and it does not have all the loaded data required by the request, then
      // ignore the facility.
      if (FacilityUtils.isFacilityType(facility, FacilityType.Airport) && !BitFlags.isAll(facility.loadedDataFlags, request.airportDataFlags)) {
        return;
      }

      request.resolve(facility);
      FacilityLoader.addToFacilityCache(facility, isMismatch);
      queue.delete(uid);
    }
  }

  /**
   * A callback called when a search completes.
   * @param results The results of the search.
   */
  private static onNearestSearchCompleted(results: NearestSearchResults<any, any>): void {
    const session = FacilityLoader.searchSessions.get(results.sessionId);
    if (session instanceof CoherentNearestSearchSession) {
      session.onSearchCompleted(results);
    }
  }

  /**
   * Adds a facility to the cache.
   * @param fac The facility to add.
   * @param isTypeMismatch Whether to add the facility to the type mismatch cache.
   */
  private static addToFacilityCache(fac: Facility, isTypeMismatch: boolean): void {
    const cache = isTypeMismatch ? FacilityLoader.typeMismatchFacCache : FacilityLoader.facCache;
    cache.set(ICAO.getUid(fac.icaoStruct), fac);
    if (cache.size > FacilityLoader.MAX_FACILITY_CACHE_ITEMS) {
      cache.delete(cache.keys().next().value!);
    }
  }

  /**
   * Adds an airway to the airway cache.
   * @param airway The airway to add.
   */
  private static addToAirwayCache(airway: AirwayObject): void {
    FacilityLoader.airwayCache.set(airway.name, airway);
    if (FacilityLoader.airwayCache.size > FacilityLoader.MAX_AIRWAY_CACHE_ITEMS) {
      FacilityLoader.airwayCache.delete(FacilityLoader.airwayCache.keys().next().value!);
    }
  }

  /**
   * Gets the AIRAC cycles associated with the facility database.
   * @returns an object containing the previous, current, and next cycles.
   * If an error occurs and the MSFS facility cycle cannot be determined, the effective cycle for the current date is used instead.
   */
  public static getDatabaseCycles(): FacilityDatabaseCycles {
    if (FacilityLoader.databaseCycleCache === undefined) {
      const facilitiesRange = SimVar.GetGameVarValue('FLIGHT NAVDATA DATE RANGE', SimVarValueType.String);
      let current = AiracUtils.parseFacilitiesCycle(facilitiesRange);
      if (current === undefined) {
        console.error('FacilityLoader: Could not get facility database AIRAC cycle! Falling back to current cycle.');
        // fall back to current cycle!
        current = AiracUtils.getCurrentCycle(new Date());
      }

      const previous = AiracUtils.getOffsetCycle(current, -1);
      const next = AiracUtils.getOffsetCycle(current, 1);

      FacilityLoader.databaseCycleCache = {
        previous,
        current,
        next,
      };
    }

    return FacilityLoader.databaseCycleCache;
  }
}

/**
 * A session for searching for nearest facilities through Coherent.
 */
abstract class CoherentNearestSearchSession<TAdded, TRemoved> implements NearestSearchSession<TAdded, TRemoved> {

  private readonly searchRequestResolves = new Map<number, SearchRequestResolve<TAdded, TRemoved>>();
  private readonly searchResultQueue: NearestSearchResults<TAdded, TRemoved>[] = [];

  private isDequeueActive = false;

  /**
   * Creates an instance of a CoherentNearestSearchSession.
   * @param sessionId The ID of the session.
   */
  public constructor(protected readonly sessionId: number) { }

  /** @inheritDoc */
  public searchNearest(lat: number, lon: number, radius: number, maxItems: number): Promise<NearestSearchResults<TAdded, TRemoved>> {

    const promise = new Promise<NearestSearchResults<TAdded, TRemoved>>((resolve) => {
      Coherent.call('SEARCH_NEAREST', this.sessionId, lat, lon, radius, maxItems)
        .then((searchId: number) => {
          this.searchRequestResolves.set(searchId, resolve);
          this.dequeueResults();
        });
    });

    return promise;
  }

  /**
   * A callback called by the facility loader when a nearest search has completed.
   * @param results The search results.
   */
  public onSearchCompleted(results: NearestSearchResults<TAdded, TRemoved>): void {
    this.searchResultQueue.push(results);
    this.dequeueResults();
  }

  /**
   * Dequeues this session's received search results. If a Promise has been created for the first result in the queue,
   * then the result is dequeued and the Promise is resolved. This process repeats until the first result in the queue
   * does not have a created Promise or the queue is empty.
   */
  private dequeueResults(): void {
    // Note: we must ensure that Promises are resolved in the same order as that in which the search results are
    // received. This is because search results are returned as "diffs" of the current result relative to the result
    // of the previous search. Search results may be received before a Promise can be created for them. We cannot
    // simply cache results, wait for the Promise to be created, then immediately resolve the Promise. Promises are
    // created in the order in which their associated searches were requested, which is not guaranteed to be the same
    // order in which the results are returned (this is due to the asynchronous nature of the searches inside the sim).
    // Therefore, we need to dequeue the search results in the following manner to ensure Promises are resolved in the
    // correct order.

    if (this.isDequeueActive) {
      return;
    }

    this.isDequeueActive = true;

    while (this.searchResultQueue.length > 0) {
      const queueHead = this.searchResultQueue[0];
      const requestResolve = this.searchRequestResolves.get(queueHead.searchId);
      if (requestResolve) {
        this.searchResultQueue.shift();
        this.searchRequestResolves.delete(queueHead.searchId);
        requestResolve(queueHead);
      } else {
        break;
      }
    }

    this.isDequeueActive = false;
  }
}

/**
 * A session for searching for nearest facilities through Coherent that provides ICAOs as results.
 */
class CoherentIcaoNearestSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends CoherentNearestSearchSession<NearestIcaoSearchSessionDataTypeMap[IcaoDataType], NearestIcaoSearchSessionDataTypeMap[IcaoDataType]>
  implements NearestIcaoSearchSession<IcaoDataType> {

  /**
   * Creates an instance of a CoherentIcaoNearestSearchSession.
   * @param sessionId The ID of the session.
   * @param icaoDataType The data type of the ICAOs provided by this session.
   */
  public constructor(sessionId: number, public readonly icaoDataType: IcaoDataType) {
    super(sessionId);
  }
}

/**
 * A session for searching for nearest airports.
 */
export class NearestAirportSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends CoherentIcaoNearestSearchSession<IcaoDataType>
  implements NearestAirportFilteredSearchSession<IcaoDataType> {

  /**
   * Default filters for the nearest airports search session.
   */
  public static readonly Defaults = {
    ShowClosed: false,
    ClassMask: BitFlags.union(
      BitFlags.createFlag(AirportClass.HardSurface),
      BitFlags.createFlag(AirportClass.SoftSurface),
      BitFlags.createFlag(AirportClass.AllWater),
      BitFlags.createFlag(AirportClass.HeliportOnly),
      BitFlags.createFlag(AirportClass.Private),
    ),
    SurfaceTypeMask: 2147483647,
    ApproachTypeMask: 2147483647,
    MinimumRunwayLength: 0,
    ToweredMask: 3
  };

  /**
   * Sets the filter for the airport nearest search.
   * @param showClosed Whether or not to show closed airports.
   * @param classMask A bitmask to determine which JS airport classes to show.
   */
  public setAirportFilter(showClosed: boolean, classMask: number): void {
    Coherent.call('SET_NEAREST_AIRPORT_FILTER', this.sessionId, showClosed ? 1 : 0, classMask);
  }

  /**
   * Sets the extended airport filters for the airport nearest search.
   * @param surfaceTypeMask A bitmask of allowable runway surface types.
   * @param approachTypeMask A bitmask of allowable approach types.
   * @param toweredMask A bitmask of untowered (1) or towered (2) bits.
   * @param minRunwayLength The minimum allowable runway length, in meters.
   */
  public setExtendedAirportFilters(surfaceTypeMask: number, approachTypeMask: number, toweredMask: number, minRunwayLength: number): void {
    Coherent.call('SET_NEAREST_EXTENDED_AIRPORT_FILTERS', this.sessionId, surfaceTypeMask, approachTypeMask, toweredMask, minRunwayLength);
  }
}


/**
 * A session for searching for nearest intersections.
 */
export class NearestIntersectionSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends CoherentIcaoNearestSearchSession<IcaoDataType>
  implements NearestIntersectionFilteredSearchSession<IcaoDataType> {

  /**
   * Default filters for the nearest intersections search session.
   */
  public static readonly Defaults = {
    TypeMask: BitFlags.union(
      BitFlags.createFlag(IntersectionType.Named),
      BitFlags.createFlag(IntersectionType.Unnamed),
      BitFlags.createFlag(IntersectionType.Offroute),
      BitFlags.createFlag(IntersectionType.IAF),
      BitFlags.createFlag(IntersectionType.FAF)
    )
  };

  /**
   * Sets the filter for the intersection nearest search.
   * @param typeMask A bitmask to determine which JS intersection types to show.
   * @param showTerminalWaypoints Whether or not to show terminal waypoints. Defaults to true.
   */
  public setIntersectionFilter(typeMask: number, showTerminalWaypoints = true): void {
    Coherent.call('SET_NEAREST_INTERSECTION_FILTER', this.sessionId, typeMask, showTerminalWaypoints ? 1 : 0);
  }
}

/**
 * A session for searching for nearest VORs.
 */
export class NearestVorSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends CoherentIcaoNearestSearchSession<IcaoDataType>
  implements NearestVorFilteredSearchSession<IcaoDataType> {

  /**
   * Default filters for the nearest VORs search session.
   */
  public static readonly Defaults = {
    ClassMask: BitFlags.union(
      BitFlags.createFlag(VorClass.Terminal),
      BitFlags.createFlag(VorClass.HighAlt),
      BitFlags.createFlag(VorClass.LowAlt)
    ),
    TypeMask: BitFlags.union(
      BitFlags.createFlag(VorType.VOR),
      BitFlags.createFlag(VorType.DME),
      BitFlags.createFlag(VorType.VORDME),
      BitFlags.createFlag(VorType.VORTAC),
      BitFlags.createFlag(VorType.TACAN)
    )
  };


  /**
   * Sets the filter for the VOR nearest search.
   * @param classMask A bitmask to determine which JS VOR classes to show.
   * @param typeMask A bitmask to determine which JS VOR types to show.
   */
  public setVorFilter(classMask: number, typeMask: number): void {
    Coherent.call('SET_NEAREST_VOR_FILTER', this.sessionId, classMask, typeMask);
  }
}

/**
 * A session for searching for nearest airspace boundaries.
 */
export class NearestBoundarySearchSession
  extends CoherentNearestSearchSession<BoundaryFacility, number>
  implements NearestBoundaryFilteredSearchSession {

  /**
   * Sets the filter for the boundary nearest search.
   * @param classMask A bitmask to determine which boundary classes to show.
   */
  public setBoundaryFilter(classMask: number): void {
    Coherent.call('SET_NEAREST_BOUNDARY_FILTER', this.sessionId, classMask);
  }
}

/**
 * A session for searching for nearest facilities that uses the facility repository.
 */
export class NearestRepoFacilitySearchSession<F extends FacilityRepositorySearchableTypes, IcaoDataType extends NearestIcaoSearchSessionDataType>
  implements NearestCustomFilteredSearchSession<FacilityTypeMap[F], IcaoDataType> {

  private filter: GeoKdTreeSearchFilter<FacilityTypeMap[F]> | undefined = undefined;

  private readonly cachedResults = new Map<string, NearestIcaoSearchSessionDataTypeMap[IcaoDataType]>();

  private searchId = 0;

  /**
   * Creates an instance of a NearestRepoFacilitySearchSession.
   * @param repo The facility repository in which to search.
   * @param sessionId The ID of this session.
   * @param facilityType The type of facility for which this session searches.
   * @param icaoDataType The data type of the ICAOs provided by this session.
   */
  public constructor(
    private readonly repo: FacilityRepository,
    private readonly sessionId: number,
    private readonly facilityType: F,
    public readonly icaoDataType: IcaoDataType
  ) { }

  /** @inheritDoc */
  public searchNearest(
    lat: number,
    lon: number,
    radius: number,
    maxItems: number
  ): Promise<NearestSearchResults<NearestIcaoSearchSessionDataTypeMap[IcaoDataType], NearestIcaoSearchSessionDataTypeMap[IcaoDataType]>> {
    const radiusGAR = UnitType.METER.convertTo(radius, UnitType.GA_RADIAN);

    const results = this.repo.search(this.facilityType, lat, lon, radiusGAR, maxItems, [], this.filter as GeoKdTreeSearchFilter<Facility> | undefined);

    const added: (NearestIcaoSearchSessionDataTypeMap[IcaoDataType])[] = [];

    if (this.icaoDataType === NearestIcaoSearchSessionDataType.Struct) {
      for (let i = 0; i < results.length; i++) {
        const icao = results[i].icaoStruct;
        const uid = ICAO.getUid(icao);
        if (this.cachedResults.has(uid)) {
          this.cachedResults.delete(uid);
        } else {
          added.push(icao as NearestIcaoSearchSessionDataTypeMap[IcaoDataType]);
        }
      }
    } else {
      for (let i = 0; i < results.length; i++) {
        const icao = results[i].icao;
        if (icao === '') {
          continue;
        }

        if (this.cachedResults.has(icao)) {
          this.cachedResults.delete(icao);
        } else {
          added.push(icao as NearestIcaoSearchSessionDataTypeMap[IcaoDataType]);
        }
      }
    }

    const removed = Array.from(this.cachedResults.values());
    this.cachedResults.clear();

    if (this.icaoDataType === NearestIcaoSearchSessionDataType.Struct) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        this.cachedResults.set(ICAO.getUid(result.icaoStruct), result.icaoStruct as NearestIcaoSearchSessionDataTypeMap[IcaoDataType]);
      }
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.icao === '') {
          continue;
        }

        this.cachedResults.set(result.icao, result.icao as NearestIcaoSearchSessionDataTypeMap[IcaoDataType]);
      }
    }

    return Promise.resolve({
      sessionId: this.sessionId,
      searchId: this.searchId++,
      added,
      removed
    });
  }

  /**
   * Sets the filter for this search session.
   * @param filter A function to filter the search results.
   */
  public setFacilityFilter(filter?: GeoKdTreeSearchFilter<FacilityTypeMap[F]>): void {
    this.filter = filter;
  }
}

/**
 * WT Airway Status Enum
 */
enum AirwayStatus {
  /**
   * @readonly
   * @property {number} INCOMPLETE - indicates waypoints have not been loaded yet.
   */
  INCOMPLETE = 0,
  /**
   * @readonly
   * @property {number} COMPLETE - indicates all waypoints have been successfully loaded.
   */
  COMPLETE = 1,
  /**
   * @readonly
   * @property {number} PARTIAL - indicates some, but not all, waypoints have been successfully loaded.
   */
  PARTIAL = 2
}


/**
 * The Airway Builder.
 */
class AirwayBuilder {
  private _waypointsArray: IntersectionFacility[] = [];
  private _hasStarted = false;
  private _isDone = false;

  /** Creates an instance of the AirwayBuilder
   * @param _initialWaypoint is the initial intersection facility
   * @param _initialData is the intersection route to build from
   * @param facilityLoader is an instance of the facility loader
   */
  public constructor(private _initialWaypoint: IntersectionFacility, private _initialData: AirwaySegment, private facilityLoader: FacilityLoader) {
  }

  /**
   * Get whether this builder has started loading waypoints
   * @returns whether this builder has started
   */
  public get hasStarted(): boolean {
    return this._hasStarted;
  }

  /**
   * Get whether this builder is done loading waypoints
   * @returns whether this builder is done loading waypoints
   */
  public get isDone(): boolean {
    return this._isDone;
  }

  /**
   * Get the airway waypoints
   * @returns the airway waypoints, or null
   */
  public get waypoints(): IntersectionFacility[] | null {
    return this._waypointsArray;
  }

  /** Steps through the airway waypoints
   * @param stepForward is the direction to step; true = forward, false = backward
   * @param arrayInsertFunc is the arrayInsertFunc
   */
  private async _step(stepForward: boolean, arrayInsertFunc: (wpt: IntersectionFacility) => void): Promise<void> {
    let isDone = false;
    let current: AirwaySegment = this._initialData;
    while (!isDone && current) {
      const nextIcao = stepForward ? current.nextIcaoStruct : current.prevIcaoStruct;
      if (
        ICAO.isValueFacility(nextIcao)
        && this._waypointsArray !== null
        && !this._waypointsArray.find(waypoint => ICAO.valueEquals(waypoint.icaoStruct, nextIcao))
      ) {
        const fac = await this.facilityLoader.getFacility(FacilityType.Intersection, nextIcao);
        arrayInsertFunc(fac);
        const next = fac.routes.find((route: AirwaySegment) => route.name === current.name);
        if (next !== undefined) {
          current = next;
        } else {
          isDone = true;
        }
      } else {
        isDone = true;
      }
    }
  }

  /** Steps Forward through the airway waypoints
   * @returns the step forward function
   */
  private async _stepForward(): Promise<void> {
    if (this._waypointsArray !== null) {
      return this._step(true, this._waypointsArray.push.bind(this._waypointsArray));
    }
  }

  /** Steps Backward through the airway waypoints
   * @returns the step backward function
   */
  private async _stepBackward(): Promise<void> {
    if (this._waypointsArray !== null) {
      return this._step(false, this._waypointsArray.unshift.bind(this._waypointsArray));
    }
  }

  /**
   * Begins loading waypoints for this builder's parent airway.
   * @returns a Promise to return a status code corresponding to Airway.Status when this builder has
   * finished loading waypoints.
   */
  public startBuild(): Promise<AirwayStatus> {
    if (this.hasStarted) {
      return Promise.reject(new Error('Airway builder has already started building.'));
    }
    return new Promise(resolve => {
      this._hasStarted = true;
      if (this._waypointsArray !== null) {
        this._waypointsArray.push(this._initialWaypoint);
        Promise.all([
          this._stepForward(),
          this._stepBackward()
        ]).then(() => {
          this._isDone = true;
          resolve(AirwayStatus.COMPLETE);
        }).catch(() => {
          this._isDone = true;
          resolve(AirwayStatus.PARTIAL);
        });
      }
    });
  }
}
