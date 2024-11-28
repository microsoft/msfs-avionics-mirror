import { FacilityType, FacilityTypeIcaoMap } from './Facilities';
import { IcaoType, IcaoValue } from './Icao';

/**
 * An ICAO value with a cached unique ID string.
 */
interface IcaoValueWithUid extends IcaoValue {
  /** The cached unique ID string generated for this ICAO. */
  __cachedUid?: string;
}

/**
 * A utility class for working with ICAO values.
 */
export class ICAO {

  /** An empty ICAO string (V1). */
  public static readonly EMPTY_V1 = '            ';

  /** An empty ICAO string (V2). */
  public static readonly EMPTY_V2 = '                   ';

  /**
   * An empty ICAO string (V1).
   * @deprecated Please use `ICAO.EMPTY_V1` instead.
   */
  public static readonly emptyIcao = ICAO.EMPTY_V1;

  private static readonly EMPTY_ICAO_VALUE = ICAO.value('', '', '', '');

  /**
   * Checks whether a query is an ICAO value object.
   * @param query A query.
   * @returns Whether the specified query is an ICAO value object.
   */
  public static isValue(query: unknown): query is IcaoValue {
    return typeof query === 'object' && query !== null && (query as any).__Type === 'JS_ICAO';
  }

  /**
   * Creates a new ICAO value.
   * @param type The ICAO's facility type.
   * @param region The ICAO's region code.
   * @param airport The ICAO's associated airport ident.
   * @param ident The ICAO's ident.
   * @returns A new ICAO value with the specified properties.
   */
  public static value(type: string, region: string, airport: string, ident: string): IcaoValue {
    return {
      __Type: 'JS_ICAO',
      type,
      region,
      airport,
      ident,
    };
  }

  /**
   * Gets an empty ICAO value.
   * @returns An empty ICAO value.
   */
  public static emptyValue(): IcaoValue {
    return ICAO.EMPTY_ICAO_VALUE;
  }

  /**
   * Checks whether an ICAO value is empty.
   * @param value The value to check.
   * @returns Whether the specified ICAO value is empty.
   */
  public static isValueEmpty(value: IcaoValue): boolean {
    return value.type === ''
      && value.region === ''
      && value.airport === ''
      && value.ident === '';
  }

  /**
   * Copies an ICAO value.
   * @param value The value to copy.
   * @returns A new copy of the specified ICAO value.
   */
  public static copyValue(value: IcaoValue): IcaoValue {
    return Object.assign({}, value);
  }

  /**
   * Converts an ICAO string (V1) to an ICAO value.
   * @param icao The ICAO string (V1) to convert.
   * @returns The ICAO value converted from the specified string (V1).
   */
  public static stringV1ToValue(icao: string): IcaoValue {
    return ICAO.value(
      icao.substring(0, 1).trim(),
      icao.substring(1, 3).trim(),
      icao.substring(3, 7).trim(),
      ICAO.getIdentFromStringV1(icao)
    );
  }

  /**
   * Converts an ICAO string (V2) to an ICAO value.
   * @param icao The ICAO string (V2) to convert.
   * @returns The ICAO value converted from the specified string (V2).
   */
  public static stringV2ToValue(icao: string): IcaoValue {
    return ICAO.value(
      icao.substring(0, 1).trim(),
      icao.substring(1, 3).trim(),
      icao.substring(3, 11).trim(),
      ICAO.getIdentFromStringV2(icao)
    );
  }

  /**
   * Converts an ICAO value to an ICAO string (V1).
   * @param icao The ICAO value to convert.
   * @returns The ICAO string (V1) converted from the specified value.
   * @throws Error if the ICAO value is malformed or cannot be converted to a string (V1).
   */
  public static valueToStringV1(icao: IcaoValue): string {
    if (ICAO.isValueEmpty(icao)) {
      return ICAO.EMPTY_V1;
    }

    if (icao.type.length > 1) {
      throw new Error(`ICAO: cannot convert IcaoValue to V1 string - invalid type '${icao.type}'`);
    }

    if (icao.region.length > 2) {
      throw new Error(`ICAO: cannot convert IcaoValue to V1 string - invalid region '${icao.region}'`);
    }

    if (icao.airport.length > 4) {
      throw new Error(`ICAO: cannot convert IcaoValue to V1 string - invalid airport '${icao.airport}'`);
    }

    // Always drop the region from airport ICAOs for V1 strings to replicate sim behavior.
    return `${icao.type}${icao.type === IcaoType.Airport ? '  ' : icao.region.padEnd(2, ' ')}${icao.airport.padEnd(4, ' ')}${icao.ident.padEnd(5, ' ')}`;
  }

  /**
   * Attempts to convert an ICAO value to an ICAO string (V1).
   * @param icao The ICAO value to convert.
   * @returns The ICAO string (V1) converted from the specified value, or the empty ICAO string (V1) if the ICAO value
   * is malformed or cannot be converted to a string (V1).
   */
  public static tryValueToStringV1(icao: IcaoValue): string {
    if (
      ICAO.isValueEmpty(icao)
      || icao.type.length > 1
      || icao.region.length > 2
      || icao.airport.length > 4
    ) {
      return ICAO.EMPTY_V1;
    }

    // Always drop the region from airport ICAOs for V1 strings to replicate sim behavior.
    return `${icao.type}${icao.type === IcaoType.Airport ? '  ' : icao.region.padEnd(2, ' ')}${icao.airport.padEnd(4, ' ')}${icao.ident.padEnd(5, ' ')}`;
  }

  /**
   * Converts an ICAO value to an ICAO string (V2).
   * @param icao The ICAO value to convert.
   * @returns The ICAO string (V2) converted from the specified value.
   * @throws Error if the ICAO value is malformed or cannot be converted to a string (V2).
   */
  public static valueToStringV2(icao: IcaoValue): string {
    if (ICAO.isValueEmpty(icao)) {
      return ICAO.EMPTY_V2;
    }

    if (icao.type.length > 1) {
      throw new Error(`ICAO: cannot convert IcaoValue to V2 string - invalid type '${icao.type}'`);
    }

    if (icao.region.length > 2) {
      throw new Error(`ICAO: cannot convert IcaoValue to V2 string - invalid region '${icao.region}'`);
    }

    if (icao.airport.length > 8) {
      throw new Error(`ICAO: cannot convert IcaoValue to V2 string - invalid airport '${icao.airport}'`);
    }

    return `${icao.type}${icao.region.padEnd(2, ' ')}${icao.airport.padEnd(8, ' ')}${icao.ident.padEnd(8, ' ')}`;
  }

  /**
   * Attempts to convert an ICAO value to an ICAO string (V2).
   * @param icao The ICAO value to convert.
   * @returns The ICAO string (V2) converted from the specified value, or the empty ICAO string (V2) if the ICAO value
   * is malformed or cannot be converted to a string (V2).
   */
  public static tryValueToStringV2(icao: IcaoValue): string {
    if (
      ICAO.isValueEmpty(icao)
      || icao.type.length > 1
      || icao.region.length > 2
      || icao.airport.length > 8
    ) {
      return ICAO.EMPTY_V2;
    }

    return `${icao.type}${icao.region.padEnd(2, ' ')}${icao.airport.padEnd(8, ' ')}${icao.ident.padEnd(8, ' ')}`;
  }

  /**
   * Checks whether two ICAO values are equal.
   * @param a The first value.
   * @param b The second value.
   * @returns Whether the two specified ICAO values are equal.
   */
  public static valueEquals(a: IcaoValue, b: IcaoValue): boolean {
    return a.type === b.type
      // Airport ICAOs with different region codes are still considered equal.
      && (a.type === IcaoType.Airport || a.region === b.region)
      && a.airport === b.airport
      && a.ident === b.ident;
  }

  /**
   * Gets the region code defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The region code defined by the specified ICAO string (V1).
   */
  public static getRegionCodeFromStringV1(icao: string): string {
    return icao.substring(1, 3).trim();
  }

  /**
   * Gets the region code defined by an ICAO string (V2).
   * @param icao An ICAO string (V2).
   * @returns The region code defined by the specified ICAO string (V2).
   */
  public static getRegionCodeFromStringV2(icao: string): string {
    return icao.substring(1, 3).trim();
  }

  /**
   * Gets the region code defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The region code defined by the specified ICAO string (V1).
   * @deprecated Please use `ICAO.getRegionCodeFromStringV1()` instead.
   */
  public static getRegionCode = ICAO.getRegionCodeFromStringV1;

  /**
   * Gets the ident of the associated airport defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The ident of the associated airport defined by the specified ICAO string (V1).
   */
  public static getAirportIdentFromStringV1(icao: string): string {
    return icao.substring(3, 7).trim();
  }

  /**
   * Gets the ident of the associated airport defined by an ICAO string (V2).
   * @param icao An ICAO string (V2).
   * @returns The ident of the associated airport defined by the specified ICAO string (V2).
   */
  public static getAirportIdentFromStringV2(icao: string): string {
    return icao.substring(3, 11).trim();
  }

  /**
   * Gets the ident of the associated airport defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The ident of the associated airport defined by the specified ICAO string (V1).
   * @deprecated Please use `ICAO.getAirportIdentFromStringV1()` instead.
   */
  public static getAssociatedAirportIdent = ICAO.getAirportIdentFromStringV1;

  /**
   * Gets the ident string defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The ident string defined by the specified ICAO string (V1).
   */
  public static getIdentFromStringV1(icao: string): string {
    return icao.substring(7).trim();
  }

  /**
   * Gets the ident string defined by an ICAO string (V2).
   * @param icao An ICAO string (V2).
   * @returns The ident string defined by the specified ICAO string (V2).
   */
  public static getIdentFromStringV2(icao: string): string {
    return icao.substring(11).trim();
  }

  /**
   * Gets the ident string defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The ident string defined by the specified ICAO string (V1).
   * @deprecated Please use `ICAO.getIdentFromStringV1()` instead.
   */
  public static getIdent = ICAO.getIdentFromStringV1;

  /**
   * Checks whether an ICAO facility type string defines a valid facility type.
   * @param icaoType The ICAO facility type string to check.
   * @returns Whether the specified ICAO facility type string defines a valid facility type.
   */
  public static isIcaoTypeFacility(icaoType: string): icaoType is FacilityTypeIcaoMap[FacilityType];
  /**
   * Checks whether an ICAO facility type string defines a given facility type.
   * @param icaoType The ICAO facility type string to check.
   * @param facilityType The facility type to check against.
   * @returns Whether the specified ICAO facility type string defines a facility of the specified type.
   */
  public static isIcaoTypeFacility<T extends FacilityType>(icaoType: string, facilityType: T): icaoType is FacilityTypeIcaoMap[T];
  /**
   * Checks whether an ICAO facility type string defines a valid facility type (optionally of a specific type).
   * @param icaoType The ICAO facility type string to check.
   * @param facilityType The facility type to check against. If not defined, then this method will return `true` as
   * long as the ICAO facility type string defines any valid facility type.
   * @returns Whether the specified ICAO facility type string defines a facility of the specified type.
   */
  public static isIcaoTypeFacility(icaoType: string, facilityType?: FacilityType): icaoType is FacilityTypeIcaoMap[FacilityType];
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isIcaoTypeFacility(icaoType: string, facilityType?: FacilityType): boolean {
    switch (icaoType) {
      case 'A':
        return facilityType === undefined || facilityType === FacilityType.Airport;
      case 'W':
        return facilityType === undefined || facilityType === FacilityType.Intersection;
      case 'V':
        return facilityType === undefined || facilityType === FacilityType.VOR;
      case 'N':
        return facilityType === undefined || facilityType === FacilityType.NDB;
      case 'U':
        return facilityType === undefined || facilityType === FacilityType.USR;
      case 'R':
        return facilityType === undefined || facilityType === FacilityType.RWY;
      case 'S':
        return facilityType === undefined || facilityType === FacilityType.VIS;
      default:
        return false;
    }
  }

  /**
   * Checks whether an ICAO value defines a valid facility type (optionally of a specific type).
   * @param icao The ICAO value to check.
   * @param facilityType The facility type to check against. If not defined, then this method will return `true` as
   * long as the ICAO value defines any valid facility type.
   * @returns Whether the specified ICAO value defines a facility of the specified type.
   */
  public static isValueFacility(icao: IcaoValue, facilityType?: FacilityType): boolean {
    return ICAO.isIcaoTypeFacility(icao.type, facilityType);
  }

  /**
   * Checks whether an ICAO string (V1) defines a valid facility type (optionally of a specific type).
   * @param icao The ICAO string (V1) to check.
   * @param facilityType The facility type to check against. If not defined, then this method will return `true` as
   * long as the ICAO string defines any valid facility type.
   * @returns Whether the specified ICAO string (V1) defines a facility of the specified type.
   */
  public static isStringV1Facility(icao: string, facilityType?: FacilityType): boolean {
    return ICAO.isIcaoTypeFacility(icao[0], facilityType);
  }

  /**
   * Checks whether an ICAO string (V2) defines a valid facility type (optionally of a specific type).
   * @param icao The ICAO string (V2) to check.
   * @param facilityType The facility type to check against. If not defined, then this method will return `true` as
   * long as the ICAO string defines any valid facility type.
   * @returns Whether the specified ICAO string (V2) defines a facility of the specified type.
   */
  public static isStringV2Facility(icao: string, facilityType?: FacilityType): boolean {
    return ICAO.isIcaoTypeFacility(icao[0], facilityType);
  }

  /**
   * Checks whether an ICAO string (V1 or V2) defines a valid facility type (optionally of a specific type).
   * @param icao The ICAO string to check.
   * @param facilityType The facility type to check against. If not defined, then this method will return `true` as
   * long as the ICAO value defines any valid facility type.
   * @returns Whether the specified ICAO string defines a facility of the specified type.
   * @deprecated Please use `ICAO.isStringV1Facility()` instead.
   */
  public static isFacility = ICAO.isStringV1Facility;

  /**
   * Gets the facility type defined by an ICAO facility type string.
   * @param icaoType An ICAO facility type string.
   * @returns The facility type defined by the specified ICAO facility type string.
   * @throws Error if the ICAO facility type string does not define a valid facility type.
   */
  public static getFacilityTypeFromIcaoType(icaoType: string): FacilityType {
    switch (icaoType) {
      case 'A':
        return FacilityType.Airport;
      case 'W':
        return FacilityType.Intersection;
      case 'V':
        return FacilityType.VOR;
      case 'N':
        return FacilityType.NDB;
      case 'U':
        return FacilityType.USR;
      case 'R':
        return FacilityType.RWY;
      case 'S':
        return FacilityType.VIS;
      default:
        throw new Error(`ICAO: cannot convert ICAO type to facility type - unknown ICAO type: ${icaoType}`);
    }
  }

  /**
   * Gets the facility type defined by an ICAO value.
   * @param icao An ICAO value.
   * @returns The facility type defined by the specified ICAO value.
   * @throws Error if the ICAO value does not define a valid facility type.
   */
  public static getFacilityTypeFromValue(icao: IcaoValue): FacilityType {
    return ICAO.getFacilityTypeFromIcaoType(icao.type);
  }

  /**
   * Gets the facility type defined by an ICAO string (V1).
   * @param icao An ICAO string (V1).
   * @returns The facility type defined by the specified ICAO string (V1).
   * @throws Error if the ICAO string does not define a valid facility type.
   */
  public static getFacilityTypeFromStringV1(icao: string): FacilityType {
    return ICAO.getFacilityTypeFromIcaoType(icao[0]);
  }

  /**
   * Gets the facility type defined by an ICAO string (V2).
   * @param icao An ICAO string (V2).
   * @returns The facility type defined by the specified ICAO string (V2).
   * @throws Error if the ICAO string does not define a valid facility type.
   */
  public static getFacilityTypeFromStringV2(icao: string): FacilityType {
    return ICAO.getFacilityTypeFromIcaoType(icao[0]);
  }

  /**
   * Gets the facility type defined by an ICAO string (V1 or V2).
   * @param icao An ICAO string.
   * @returns The facility type defined by the specified ICAO string.
   * @throws Error if the ICAO string does not define a valid facility type.
   * @deprecated Please use `ICAO.getFacilityTypeFromStringV1()` instead.
   */
  public static getFacilityType = ICAO.getFacilityTypeFromStringV1;

  /**
   * Gets a unique ID string for an ICAO value. For any two ICAO values, their unique ID strings are equal if and only
   * if the ICAO values are equal to each other.
   * @param icao The value for which to get a unique ID.
   * @returns A unique ID string for the specified ICAO value.
   */
  public static getUid(icao: IcaoValue): string {
    let uid = (icao as IcaoValueWithUid).__cachedUid;
    if (uid !== undefined) {
      return uid;
    }

    if (ICAO.isValueEmpty(icao)) {
      uid = '';
    } else {
      // Drop the region from airport ICAOs because airport ICAOs with and without region codes are considered equal.
      uid = `${icao.type}\n${icao.type === IcaoType.Airport ? '' : icao.region}\n${icao.airport}\n${icao.ident}`;
    }

    (icao as IcaoValueWithUid).__cachedUid = uid;

    return uid;
  }
}
