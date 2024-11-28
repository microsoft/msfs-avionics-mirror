import { GeoKdTreeSearchFilter } from '../utils';
import {
  AirportFacility, BoundaryFacility, Facility, FacilitySearchType, FacilityType, FacilityTypeMap, IntersectionFacility,
  NdbFacility, NearestSearchResults, UserFacility, VisualFacility, VorFacility
} from './Facilities';
import { Metar, Taf } from './FacilityWeather';
import { IcaoValue } from './Icao';

/**
 * Airway data object
 */
export interface AirwayData {
  /** Gets the name of the airway */
  readonly name: string;

  /** Gets the type of the airway */
  readonly type: number;

  /** The waypoints of this airway */
  waypoints: IntersectionFacility[];
}

/**
 * Facility search types for facilities with a defined latitude and longitude.
 */
export type FacilitySearchTypeLatLon =
  FacilitySearchType.All |
  FacilitySearchType.Airport |
  FacilitySearchType.Intersection |
  FacilitySearchType.Vor |
  FacilitySearchType.Ndb |
  FacilitySearchType.User |
  FacilitySearchType.Visual |
  FacilitySearchType.AllExceptVisual;

/**
 * A session for searching for nearest facilities.
 */
export interface NearestSearchSession<TAdded, TRemoved> {
  /**
   * Searches for nearest facilities from the specified point.
   * @param lat The latitude, in degrees.
   * @param lon The longitude, in degrees.
   * @param radius The radius around the point to search, in meters.
   * @param maxItems The maximum number of items.
   * @returns The nearest search results.
   */
  searchNearest(lat: number, lon: number, radius: number, maxItems: number): Promise<NearestSearchResults<TAdded, TRemoved>>;
}

/**
 * Types of ICAO data provided by nearest search sessions.
 */
export enum NearestIcaoSearchSessionDataType {
  Struct = 'Struct',
  StringV1 = 'StringV1',
}

/**
 * A map from nearest search session ICAO data types to their associated ICAO types.
 */
export type NearestIcaoSearchSessionDataTypeMap = {
  /** ICAO values. */
  [NearestIcaoSearchSessionDataType.Struct]: IcaoValue;

  /** ICAO strings (V1). */
  [NearestIcaoSearchSessionDataType.StringV1]: string;
}

/**
 * A session for searching for nearest facilities that provides ICAOs as results.
 */
export interface NearestIcaoSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends NearestSearchSession<NearestIcaoSearchSessionDataTypeMap[IcaoDataType], NearestIcaoSearchSessionDataTypeMap[IcaoDataType]> {

  /** The data type of the ICAOs provided by this session. */
  readonly icaoDataType: IcaoDataType;
}

/**
 * A nearest search session that can filter airports.
 */
export interface NearestAirportFilteredSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType> extends NearestIcaoSearchSession<IcaoDataType> {
  /**
   * Sets the filter for the airport nearest search.
   * @param showClosed Whether or not to show closed airports.
   * @param classMask A bitmask to determine which JS airport classes to show.
   */
  setAirportFilter(showClosed: boolean, classMask: number): void;

  /**
   * Sets the extended airport filters for the airport nearest search.
   * @param surfaceTypeMask A bitmask of allowable runway surface types.
   * @param approachTypeMask A bitmask of allowable approach types.
   * @param toweredMask A bitmask of untowered (1) or towered (2) bits.
   * @param minRunwayLength The minimum allowable runway length, in meters.
   */
  setExtendedAirportFilters(surfaceTypeMask: number, approachTypeMask: number, toweredMask: number, minRunwayLength: number): void;
}

/**
 * A nearest search session that can filter intersections
 */
export interface NearestIntersectionFilteredSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType> extends NearestIcaoSearchSession<IcaoDataType> {
  /**
   * Sets the filter for the intersection nearest search.
   * @param typeMask A bitmask to determine which JS intersection types to show.
   * @param showTerminalWaypoints Whether or not to show terminal waypoints. Defaults to true.
   */
  setIntersectionFilter(typeMask: number, showTerminalWaypoints?: boolean): void;
}

/**
 * A nearest search session that can filter VORs
 */
export interface NearestVorFilteredSearchSession<IcaoDataType extends NearestIcaoSearchSessionDataType> extends NearestIcaoSearchSession<IcaoDataType> {
  /**
   * Sets the filter for the VOR nearest search.
   * @param classMask A bitmask to determine which JS VOR classes to show.
   * @param typeMask A bitmask to determine which JS VOR types to show.
   */
  setVorFilter(classMask: number, typeMask: number): void;
}

/**
 * A nearest search session that can filter boundaries
 */
export interface NearestBoundaryFilteredSearchSession extends NearestSearchSession<BoundaryFacility, number> {
  /**
   * Sets the filter for the boundary nearest search.
   * @param classMask A bitmask to determine which boundary classes to show.
   */
  setBoundaryFilter(classMask: number): void;
}

/**
 * A nearest search session that can filter custom facilities.
 */
export interface NearestCustomFilteredSearchSession<F extends UserFacility | VisualFacility, IcaoDataType extends NearestIcaoSearchSessionDataType>
  extends NearestIcaoSearchSession<IcaoDataType> {

  /**
   * Sets the filter for this search session.
   * @param filter A function to filter the search results.
   */
  setFacilityFilter(filter?: GeoKdTreeSearchFilter<F>): void;
}


/**
 * A type map of search type to concrete search session type.
 */
export type NearestSearchSessionTypeMap<IcaoDataType extends NearestIcaoSearchSessionDataType> = {
  /** All facilities search session. */
  [FacilitySearchType.All]: NearestIcaoSearchSession<IcaoDataType>;

  /** Airport search session. */
  [FacilitySearchType.Airport]: NearestAirportFilteredSearchSession<IcaoDataType>;

  /** Intersection search session. */
  [FacilitySearchType.Intersection]: NearestIntersectionFilteredSearchSession<IcaoDataType>;

  /** VOR search session. */
  [FacilitySearchType.Vor]: NearestVorFilteredSearchSession<IcaoDataType>;

  /** NDB search session. */
  [FacilitySearchType.Ndb]: NearestIcaoSearchSession<IcaoDataType>;

  /** Boundary search session. */
  [FacilitySearchType.Boundary]: NearestBoundaryFilteredSearchSession;

  /** Nearest user facility search session. */
  [FacilitySearchType.User]: NearestCustomFilteredSearchSession<UserFacility, IcaoDataType>;

  /** Nearest visual facility search session. */
  [FacilitySearchType.Visual]: NearestCustomFilteredSearchSession<VisualFacility, IcaoDataType>;

  /** All facilities search session. */
  [FacilitySearchType.AllExceptVisual]: NearestIcaoSearchSession<IcaoDataType>;
}

/**
 * A type map of search type to facility type.
 */
export type SearchTypeMap = {
  /** All facilities. */
  [FacilitySearchType.All]: Facility;

  /** Airports. */
  [FacilitySearchType.Airport]: AirportFacility;

  /** Intersections. */
  [FacilitySearchType.Intersection]: IntersectionFacility;

  /** VORs. */
  [FacilitySearchType.Vor]: VorFacility;

  /** NDBs. */
  [FacilitySearchType.Ndb]: NdbFacility;

  /** Boundaries. */
  [FacilitySearchType.Boundary]: BoundaryFacility;

  /** User facilities. */
  [FacilitySearchType.User]: UserFacility;

  /** Visual facilities. */
  [FacilitySearchType.Visual]: VisualFacility;

  /** All facilities except visual facilities. */
  [FacilitySearchType.AllExceptVisual]: Facility;
}

/**
 * An interface for loading or searching through navigation data
 */
export interface FacilityClient {
  /**
   * Waits until this facility loader is initialized.
   * @returns A Promise which is fulfilled when this facility loader is initialized.
   */
  awaitInitialization(): Promise<void>;

  /**
   * Attempts to retrieve a facility.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facility to retrieve.
   * The retrieved airport facility (if any) is guaranteed to have *at least* as much loaded data as requested. Ignored
   * if `type` is not `FacilityType.Airport`. Defaults to `AirportFacilityDataFlags.All`.
   * @returns A Promise which will be fulfilled with the requested facility, or `null` if the facility could not be
   * retrieved.
   */
  tryGetFacility<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags?: number): Promise<FacilityTypeMap[T] | null>;

  /**
   * Retrieves a facility.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facility to retrieve.
   * The retrieved airport facility (if any) is guaranteed to have *at least* as much loaded data as requested. Ignored
   * if `type` is not `FacilityType.Airport`. Defaults to `AirportFacilityDataFlags.All`.
   * @returns A Promise which will be fulfilled with the requested facility, or rejected if the facility could not be
   * retrieved.
   */
  getFacility<T extends FacilityType>(type: T, icao: IcaoValue, airportDataFlags?: number): Promise<FacilityTypeMap[T]>;
  /**
   * Retrieves a facility.
   * @param type The type of facility to retrieve.
   * @param icao The ICAO of the facility to retrieve.
   * @returns A Promise which will be fulfilled with the requested facility, or rejected if the facility could not be
   * retrieved.
   * @deprecated Please use the signature that takes an `IcaoValue` instead.
   */
  getFacility<T extends FacilityType>(type: T, icao: string): Promise<FacilityTypeMap[T]>;

  /**
   * Retrieves a batch of facilities. The type of each facility to retrieve is inferred from the requested ICAO.
   * @param icaos The ICAO values of facilities to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facilities to retrieve.
   * The retrieved airport facilities are guaranteed to have *at least* as much loaded data as requested. Defaults to
   * `AirportFacilityDataFlags.All`.
   * @returns A Promise which will be fulfilled with an array of the requested facilities. Each position in the
   * facilities array will contain either the facility for the ICAO at the corresponding position in the ICAO array, or
   * `null` if a facility for that ICAO could not be retrieved.
   */
  getFacilities(icaos: readonly IcaoValue[], airportDataFlags?: number): Promise<(Facility | null)[]>;

  /**
   * Retrieves a batch of facilities of a given type.
   * @param type The type of facilities to retrieve.
   * @param icaos The ICAO values of facilities to retrieve.
   * @returns A Promise which will be fulfilled with an array of the requested facilities. Each position in the
   * facilities array will contain either the facility for the ICAO at the corresponding position in the ICAO array, or
   * `null` if a facility for that ICAO could not be retrieved.
   */
  getFacilitiesOfType<T extends FacilityType>(type: T, icaos: readonly IcaoValue[]): Promise<(FacilityTypeMap[T] | null)[]>;
  /**
   * Retrieves a batch of airport facilities.
   * @param type The type of facilities to retrieve.
   * @param icaos The ICAO values of facilities to retrieve.
   * @param airportDataFlags Bitflags describing the requested data to be loaded in the airport facilities to retrieve.
   * The retrieved airport facilities are guaranteed to have *at least* as much loaded data as requested. Defaults to
   * `AirportFacilityDataFlags.All`.
   * @returns A Promise which will be fulfilled with an array of the requested facilities. Each position in the
   * facilities array will contain either the facility for the ICAO at the corresponding position in the ICAO array, or
   * `null` if a facility for that ICAO could not be retrieved.
   */
  getFacilitiesOfType(type: AirportFacility, icaos: readonly IcaoValue[], airportDataFlags?: number): Promise<(AirportFacility | null)[]>;

  /**
   * Attempts to retrieve data for an airway.
   * @param airwayName The airway name.
   * @param airwayType The airway type.
   * @param icao The ICAO value of one intersection in the airway.
   * @returns The retrieved airway data, or `null` if data could not be retrieved.
   */
  tryGetAirway(airwayName: string, airwayType: number, icao: IcaoValue): Promise<AirwayData | null>;

  /**
   * Retrieves data for an airway.
   * @param airwayName The airway name.
   * @param airwayType The airway type.
   * @param icao The ICAO value of one intersection in the airway.
   * @returns The retrieved airway data.
   * @throws Error if the specified airway data could not be retrieved.
   */
  getAirway(airwayName: string, airwayType: number, icao: IcaoValue): Promise<AirwayData>;
  /**
   * Retrieves data for an airway.
   * @param airwayName The airway name.
   * @param airwayType The airway type.
   * @param icao The ICAO string (V1) of one intersection in the airway.
   * @returns The retrieved airway data.
   * @throws Error if the specified airway data could not be retrieved.
   * @deprecated Please use the signature that takes an `IcaoValue` instead.
   */
  getAirway(airwayName: string, airwayType: number, icao: string): Promise<AirwayData>;

  /**
   * Starts a nearest facilities search session. If the requested session type provides ICAOs as results, then the
   * ICAOs will be provided as `IcaoValue` objects.
   * @param type The type of facilities for which to search.
   * @returns A Promise which will be fulfilled with the new nearest search session.
   */
  startNearestSearchSessionWithIcaoStructs<T extends FacilitySearchType>(type: T): Promise<NearestSearchSessionTypeMap<NearestIcaoSearchSessionDataType.Struct>[T]>;

  /**
   * Starts a nearest facilities search session. If the requested session type provides ICAOs as results, then the
   * ICAOs will be provided as ICAO strings (V1).
   * @param type The type of facilities for which to search.
   * @returns A Promise which will be fulfilled with the new nearest search session.
   * @deprecated Please use `startNearestSearchSessionWithIcaoStructs()` instead.
   */
  startNearestSearchSession<T extends FacilitySearchType>(type: T): Promise<NearestSearchSessionTypeMap<NearestIcaoSearchSessionDataType.StringV1>[T]>;

  /**
   * Gets a METAR for an airport.
   * @param airport An airport.
   * @returns The METAR for the airport, or undefined if none could be obtained.
   */
  getMetar(airport: AirportFacility): Promise<Metar | undefined>;
  /**
   * Gets a METAR for an airport.
   * @param ident An airport ident.
   * @returns The METAR for the airport, or undefined if none could be obtained.
   */
  getMetar(ident: string): Promise<Metar | undefined>;

  /**
   * Searches for the METAR issued for the closest airport to a given location.
   * @param lat The latitude of the center of the search, in degrees.
   * @param lon The longitude of the center of the search, in degrees.
   * @returns The METAR issued for the closest airport to the given location, or undefined if none could be found.
   */
  searchMetar(lat: number, lon: number): Promise<Metar | undefined>;

  /**
   * Gets a TAF for an airport.
   * @param airport An airport.
   * @returns The TAF for the airport, or undefined if none could be obtained.
   */
  getTaf(airport: AirportFacility): Promise<Taf | undefined>;
  /**
   * Gets a TAF for an airport.
   * @param ident An airport ident.
   * @returns The TAF for the airport, or undefined if none could be obtained.
   */
  getTaf(ident: string): Promise<Taf | undefined>;

  /**
   * Searches for the TAF issued for the closest airport to a given location.
   * @param lat The latitude of the center of the search, in degrees.
   * @param lon The longitude of the center of the search, in degrees.
   * @returns The TAF issued for the closest airport to the given location, or undefined if none could be found.
   */
  searchTaf(lat: number, lon: number): Promise<Taf | undefined>;

  /**
   * Searches for ICAOs by their ident portion only.
   * @param filter The type of facility to filter by. Selecting ALL will search all facility type ICAOs.
   * @param ident The partial or complete ident to search for.
   * @param maxItems The maximum number of matches to return. Defaults to 40.
   * @returns An array of matched ICAOs. Exact matches are sorted before partial matches.
   */
  searchByIdentWithIcaoStructs(filter: FacilitySearchType, ident: string, maxItems: number): Promise<IcaoValue[]>;

  /**
   * Searches for ICAOs by their ident portion only.
   * @param filter The type of facility to filter by. Selecting ALL will search all facility type ICAOs.
   * @param ident The partial or complete ident to search for.
   * @param maxItems The maximum number of matches to return. Defaults to 40.
   * @returns An array of matched ICAOs. Exact matches are sorted before partial matches.
   * @deprecated Please use `searchByIdentWithIcaoStruct()` instead.
   */
  searchByIdent(filter: FacilitySearchType, ident: string, maxItems: number): Promise<string[]>;

  /**
   * Searches for facilities matching a given ident, and returns the matching facilities, with nearest at the beginning of the array.
   * @param filter The type of facility to filter by. Selecting ALL will search all facility type ICAOs, except for boundary facilities.
   * @param ident The exact ident to search for. (ex: DEN, KDEN, ITADO)
   * @param lat The latitude to find facilities nearest to.
   * @param lon The longitude to find facilities nearest to.
   * @param maxItems The maximum number of matches to return. Defaults to 40.
   * @returns An array of matching facilities, sorted by distance to the given lat/lon, with nearest at the beginning of the array.
   */
  findNearestFacilitiesByIdent<T extends FacilitySearchTypeLatLon>(
    filter: T,
    ident: string,
    lat: number,
    lon: number,
    maxItems: number,
  ): Promise<SearchTypeMap[T][]>;
}
