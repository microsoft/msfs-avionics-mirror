import { GeoCircle } from '../geo/GeoCircle';
import { GeoPoint } from '../geo/GeoPoint';
import { MagVar } from '../geo/MagVar';
import { UnitType } from '../math/NumberUnit';
import { Vec3Math } from '../math/VecMath';
import { Facility, FacilityType, FacilityTypeMap, IntersectionFacility, UserFacility, UserFacilityType } from './Facilities';
import { IcaoValue } from './Icao';
import { ICAO } from './IcaoUtils';

/**
 * Utility functions for working with facilities.
 */
export class FacilityUtils {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(Vec3Math.create(), 0), new GeoCircle(Vec3Math.create(), 0)];
  private static readonly intersectionCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];

  /**
   * Checks whether a facility is of a given type.
   * @param facility The facility to check.
   * @param type The facility type to check against.
   * @returns Whether the facility is of the specified type.
   */
  public static isFacilityType<T extends FacilityType>(facility: Facility, type: T): facility is FacilityTypeMap[T] {
    // Need to check for the intersection version of VOR/NDB facilities - these facilities have identical ICAOs
    // to their VOR/NDB counterparts, so we need to manually check the __Type property on the facility object.
    if ((facility as any)['__Type'] === 'JS_FacilityIntersection') {
      return type === FacilityType.Intersection;
    }

    return ICAO.isFacility(facility.icao, type);
  }

  /**
   * Gets the magnetic variation at a facility, in degrees. If the facility is a VOR, the magnetic variation defined
   * by the VOR is returned. For all other facilities, the modeled magnetic variation at the location of the facility
   * is returned.
   * @param facility A facility.
   * @returns The magnetic variation at the specified facility, in degrees.
   */
  public static getMagVar(facility: Facility): number {
    if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
      return -facility.magneticVariation; // VOR facility magvar is positive west instead of the standard positive east
    } else {
      return MagVar.get(facility.lat, facility.lon);
    }
  }

  /**
   * Gets latitude/longitude coordinates corresponding to a radial and distance from a reference facility.
   * @param reference The reference facility.
   * @param radial The magnetic radial, in degrees.
   * @param distance The distance, in nautical miles.
   * @param out The GeoPoint object to which to write the result.
   * @returns The latitude/longitude coordinates corresponding to the specified radial and distance from the reference
   * facility.
   */
  public static getLatLonFromRadialDistance(reference: Facility, radial: number, distance: number, out: GeoPoint): GeoPoint {
    return FacilityUtils.geoPointCache[0].set(reference).offset(
      MagVar.magneticToTrue(radial, FacilityUtils.getMagVar(reference)),
      UnitType.NMILE.convertTo(distance, UnitType.GA_RADIAN),
      out
    );
  }

  /**
   * Gets latitude/longitude coordinates corresponding to the intersection of two facility radials.
   * @param reference1 The first reference facility.
   * @param radial1 The first magnetic radial, in degrees.
   * @param reference2 The second reference facility.
   * @param radial2 The second magnetic radial, in degrees.
   * @param out The GeoPoint object to which to write the result.
   * @returns The latitude/longitude coordinates corresponding to the intersection of the two specified radials. If
   * the specified radials do not intersect at a unique point, `NaN` is written to both `lat` and `lon`.
   */
  public static getLatLonFromRadialRadial(reference1: Facility, radial1: number, reference2: Facility, radial2: number, out: GeoPoint): GeoPoint {
    const magVar1 = FacilityUtils.getMagVar(reference1);
    const magVar2 = FacilityUtils.getMagVar(reference2);

    const radialCircle1 = FacilityUtils.geoCircleCache[0].setAsGreatCircle(reference1, MagVar.magneticToTrue(radial1, magVar1));
    const radialCircle2 = FacilityUtils.geoCircleCache[1].setAsGreatCircle(reference2, MagVar.magneticToTrue(radial2, magVar2));

    const radial1IncludesRef2 = radialCircle1.includes(reference2);
    const radial2IncludesRef1 = radialCircle2.includes(reference1);

    if (radial1IncludesRef2 && radial2IncludesRef1) {
      // Radials are parallel or antiparallel, and therefore do not have a unique intersection point.
      return out.set(NaN, NaN);
    } else if (radial1IncludesRef2) {
      // Reference 2 lies along the great circle of radial 1. The intersection point therefore is either reference 2
      // or its antipode. One of the two lies on the radial, and the other lies on the anti-radial.

      return radialCircle1.angleAlong(reference1, reference2, Math.PI) < Math.PI ? out.set(reference2) : out.set(reference2).antipode();
    } else if (radial2IncludesRef1) {
      // Reference 1 lies along the great circle of radial 2. The intersection point therefore is either reference 1
      // or its antipode. One of the two lies on the radial, and the other lies on the anti-radial.

      return radialCircle2.angleAlong(reference2, reference1, Math.PI) < Math.PI ? out.set(reference1) : out.set(reference1).antipode();
    }

    // Radials, unlike great circles, do not circumscribe the globe. Therefore, we choose the order of the intersection
    // operation carefully to ensure that the first solution (if it exists) is the "correct" intersection.
    const numIntersections = radialCircle1.encircles(reference2)
      ? radialCircle2.intersectionGeoPoint(radialCircle1, FacilityUtils.intersectionCache)
      : radialCircle1.intersectionGeoPoint(radialCircle2, FacilityUtils.intersectionCache);

    if (numIntersections === 0) {
      return out.set(NaN, NaN);
    }

    return out.set(FacilityUtils.intersectionCache[0]);
  }
}

/**
 * Utility functions for working with intersection facilities.
 */
export class IntersectionFacilityUtils {
  private static readonly TERMINAL_REGEX = /^...[a-zA-Z\d]/;

  /**
   * Checks whether an intersection ICAO belongs to a terminal intersection.
   * @param icao The ICAO to check.
   * @returns Whether the specified intersection ICAO belongs to a terminal intersection.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   */
  public static isTerminal(icao: IcaoValue): boolean;
  /**
   * Checks whether an intersection ICAO belongs to a terminal intersection.
   * @param icao The ICAO to check.
   * @returns Whether the specified intersection ICAO belongs to a terminal intersection.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   * @deprecated Please use the signature that takes an `IcaoValue` instead.
   */
  public static isTerminal(icao: string): boolean;
  /**
   * Checks whether an intersection facility is a terminal intersection.
   * @param facility The intersection facility to check.
   * @returns Whether the specified intersection facility is a terminal intersection.
   * @throws Error if the specified facility is not an intersection.
   */
  public static isTerminal(facility: IntersectionFacility): boolean;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isTerminal(arg: IcaoValue | string | IntersectionFacility): boolean {
    const icao = typeof arg === 'string'
      ? ICAO.stringV1ToValue(arg)
      : ICAO.isValue(arg) ? arg : arg.icaoStruct;

    if (!ICAO.isValueFacility(icao, FacilityType.Intersection)) {
      throw new Error(`Facility with ICAO ${ICAO.tryValueToStringV2(icao)} is not an intersection`);
    }

    return icao.airport.length > 0;
  }

  /**
   * Gets the non-terminal version of an intersection ICAO value. If the ICAO is already a non-terminal intersection
   * ICAO, then an identical ICAO will be returned.
   * @param icao An intersection ICAO.
   * @returns The non-terminal version of the specified intersection ICAO.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   */
  public static getNonTerminalIcaoValue(icao: IcaoValue): IcaoValue {
    if (!ICAO.isValueFacility(icao, FacilityType.Intersection)) {
      throw new Error(`Facility with ICAO ${ICAO.tryValueToStringV2(icao)} is not an intersection`);
    }

    if (icao.airport.length > 0) {
      return ICAO.value(icao.type, icao.region, '', icao.ident);
    } else {
      return icao;
    }
  }

  /**
   * Gets the non-terminal version of an intersection ICAO string (V1). If the ICAO is already a non-terminal
   * intersection ICAO, then an identical ICAO will be returned.
   * @param icao An intersection ICAO.
   * @returns The non-terminal version of the specified intersection ICAO.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   * @deprecated Please use `getNonTerminalIcaoValue()` instead.
   */
  public static getNonTerminalICAO(icao: string): string {
    if (!ICAO.isFacility(icao, FacilityType.Intersection)) {
      throw new Error(`Facility with ICAO ${icao} is not an intersection`);
    }

    return IntersectionFacilityUtils.TERMINAL_REGEX.test(icao) ? `${icao.substring(0, 3)}    ${icao.substring(7)}` : icao;
  }

  private static readonly filterDuplicatesSet = new Set<string>();

  /**
   * Gets an ICAO string from itself.
   * @param icao An ICAO string.
   * @returns The specified ICAO string.
   */
  private static getIcaoIdentity(icao: IcaoValue): IcaoValue {
    return icao;
  }

  /**
   * Gets an ICAO string from a facility.
   * @param facility A facility.
   * @returns The specified facility's ICAO string.
   */
  private static getIcaoFacility(facility: Facility): IcaoValue {
    return facility.icaoStruct;
  }

  /**
   * Filters an array of ICAOs such that the filtered array does not contain any duplicate terminal/non-terminal
   * intersection pairs. All non-intersection ICAOs are guaranteed to be retained in the filtered array.
   * @param icaos The array to filter.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no duplicate terminal/non-terminal intersection pairs.
   */
  public static filterDuplicates(icaos: readonly IcaoValue[], retainTerminal?: boolean): IcaoValue[];
  /**
   * Filters an array of facilities such that the filtered array does not contain any duplicate terminal/non-terminal
   * intersection pairs. All non-intersection facilities are guaranteed to be retained in the filtered array.
   * @param facilities The array to filter.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no duplicate terminal/non-terminal intersection pairs.
   */
  public static filterDuplicates(facilities: readonly Facility[], retainTerminal?: boolean): Facility[];
  /**
   * Filters an array of arbitrary elements such that the filtered array does not contain any elements that are mapped
   * to duplicate terminal/non-terminal intersection pairs. All elements that are not mapped to intersections are
   * guaranteed to be retained in the filtered array.
   * @param array The array to filter.
   * @param getIcao A function which maps array elements to ICAOs.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no elements that are mapped to duplicate terminal/non-terminal
   * intersection pairs.
   */
  public static filterDuplicates<T>(array: readonly T[], getIcao: (element: T) => IcaoValue, retainTerminal?: boolean): T[];
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static filterDuplicates(array: readonly any[], arg2?: boolean | ((element: any) => IcaoValue), arg3?: boolean): any[] {
    if (array.length === 0) {
      return [];
    }

    let getIcao: (element: any) => IcaoValue;
    let retainTerminal: boolean;

    if (typeof arg2 === 'function') {
      getIcao = arg2;
      retainTerminal = arg3 ?? false;
    } else {
      retainTerminal = arg2 ?? false;
      if (ICAO.isValue(array[0])) {
        getIcao = IntersectionFacilityUtils.getIcaoIdentity;
      } else {
        getIcao = IntersectionFacilityUtils.getIcaoFacility;
      }
    }

    // Build the set of ICAOs to filter.
    IntersectionFacilityUtils.filterDuplicatesSet.clear();
    for (let i = 0; i < array.length; i++) {
      const icao = getIcao(array[i]);
      if (ICAO.isValueFacility(icao, FacilityType.Intersection) && IntersectionFacilityUtils.isTerminal(icao) === retainTerminal) {
        IntersectionFacilityUtils.filterDuplicatesSet.add(ICAO.getUid(IntersectionFacilityUtils.getNonTerminalIcaoValue(icao)));
      }
    }

    // If there are no ICAOs to filter, then just return a copy of the original array.
    if (IntersectionFacilityUtils.filterDuplicatesSet.size === 0) {
      return array.slice();
    }

    const filtered = array.filter(icao => {
      return IntersectionFacilityUtils.filterDuplicatesHelper(icao, getIcao, retainTerminal, IntersectionFacilityUtils.filterDuplicatesSet);
    });

    IntersectionFacilityUtils.filterDuplicatesSet.clear();

    return filtered;
  }

  /**
   * Checks whether an element should be filtered out from an array such that the filtered array does not contain any
   * elements that are mapped to duplicate terminal/non-terminal intersection pairs.
   * @param element The element to check.
   * @param getIcao A function which maps elements to ICAOs.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array.
   * @param nonTerminalIcaosToFilter A set of non-terminal ICAOs to filter out of the array.
   * @returns Whether the specified element should be filtered out from an array such that the filtered array does not
   * contain any elements that are mapped to duplicate terminal/non-terminal intersection pairs.
   */
  private static filterDuplicatesHelper<T>(element: T, getIcao: (element: T) => IcaoValue, retainTerminal: boolean, nonTerminalIcaosToFilter: ReadonlySet<string>): boolean {
    const icao = getIcao(element);

    if (!ICAO.isValueFacility(icao, FacilityType.Intersection)) {
      return true;
    }

    const isTerminal = IntersectionFacilityUtils.isTerminal(icao);

    if (isTerminal === retainTerminal) {
      return true;
    }

    if (isTerminal) {
      return !nonTerminalIcaosToFilter.has(ICAO.getUid(IntersectionFacilityUtils.getNonTerminalIcaoValue(icao)));
    } else {
      return !nonTerminalIcaosToFilter.has(ICAO.getUid(icao));
    }
  }
}

/**
 * Utility functions for working with user facilities.
 */
export class UserFacilityUtils {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  /**
   * Creates a user facility from latitude/longitude coordinates.
   * @param icao The ICAO string of the new facility.
   * @param lat The latitude of the new facility.
   * @param lon The longitude of the new facility.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility.
   */
  public static createFromLatLon(icao: string, lat: number, lon: number, isTemporary = false, name?: string): UserFacility {
    const fac: UserFacility = {
      icao,
      icaoStruct: ICAO.stringV1ToValue(icao),
      name: name ?? '',
      lat,
      lon,
      userFacilityType: UserFacilityType.LAT_LONG,
      isTemporary,
      region: '',
      city: '',
    };
    return fac;
  }

  /**
   * Creates a user facility from a radial and distance relative to a reference facility.
   * @param icao The ICAO string of the new facility.
   * @param reference The reference facility.
   * @param radial The magnetic radial, in degrees, of the reference facility on which the new facility lies.
   * @param distance The distance, in nautical miles, from the reference facility.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility.
   */
  public static createFromRadialDistance(icao: string, reference: Facility, radial: number, distance: number, isTemporary = false, name?: string): UserFacility {
    const location = FacilityUtils.getLatLonFromRadialDistance(reference, radial, distance, UserFacilityUtils.geoPointCache[0]);

    return {
      icao,
      icaoStruct: ICAO.stringV1ToValue(icao),
      name: name ?? '',
      lat: location.lat,
      lon: location.lon,
      userFacilityType: UserFacilityType.RADIAL_DISTANCE,
      isTemporary,
      region: '',
      city: '',
      reference1IcaoStruct: ICAO.copyValue(reference.icaoStruct),
      reference1Icao: reference.icao,
      reference1Radial: radial,
      reference1MagVar: FacilityUtils.getMagVar(reference),
      reference1Distance: distance
    };
  }

  /**
   * Creates a user facility from a radial and distance relative to a reference facility.
   * @param icao The ICAO string of the new facility.
   * @param reference1 The first reference facility.
   * @param radial1 The magnetic radial, in degrees, of the first reference facility on which the new facility lies.
   * @param reference2 The second reference facility.
   * @param radial2 The magnetic radial, in degrees, of the second reference facility on which the new facility lies.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility, or `undefined` if the specified radials do not intersect at a unique point.
   */
  public static createFromRadialRadial(
    icao: string,
    reference1: Facility,
    radial1: number,
    reference2: Facility,
    radial2: number,
    isTemporary = false,
    name?: string
  ): UserFacility | undefined {
    const location = FacilityUtils.getLatLonFromRadialRadial(reference1, radial1, reference2, radial2, UserFacilityUtils.geoPointCache[0]);

    if (isNaN(location.lat) || isNaN(location.lon)) {
      return undefined;
    }

    return {
      icao,
      icaoStruct: ICAO.stringV1ToValue(icao),
      name: name ?? '',
      lat: location.lat,
      lon: location.lon,
      userFacilityType: UserFacilityType.RADIAL_RADIAL,
      isTemporary,
      region: '',
      city: '',
      reference1IcaoStruct: ICAO.copyValue(reference1.icaoStruct),
      reference1Icao: reference1.icao,
      reference1Radial: radial1,
      reference1MagVar: FacilityUtils.getMagVar(reference1),
      reference2IcaoStruct: ICAO.copyValue(reference2.icaoStruct),
      reference2Icao: reference2.icao,
      reference2Radial: radial2,
      reference2MagVar: FacilityUtils.getMagVar(reference2)
    };
  }
}

/**
 * Utilities to deal with TACAN facilities.
 */
export class TacanUtils {

  /**
   * Converts a VOR frequency to a TACAN channel.
   * @param frequency The frequency of the VOR.
   * @returns The TACAN channel.
   */
  public static frequencyToChannel(frequency: number): string {
    const uFrequency = frequency * 10;
    let res = 0;

    if (uFrequency <= 1122) {
      //108.0 to 112.25
      res = (uFrequency - 1063) % 256; //Protect against overflow
    } else if (uFrequency <= 1179) {
      res = (uFrequency - 1053) % 256;
    } else if (uFrequency < 1333) {
      return '';
    } else if (uFrequency <= 1342) {
      res = (uFrequency - 1273) % 256;
    } else {
      res = (uFrequency - 1343) % 256;
    }

    const letter = (Math.round(frequency * 100) % 10) === 0 ? 'X' : 'Y';
    return res.toFixed(0) + letter;
  }
}
