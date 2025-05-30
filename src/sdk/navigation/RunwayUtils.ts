import { GeoPoint } from '../geo/GeoPoint';
import { NavMath } from '../geo/NavMath';
import { UnitType } from '../math/NumberUnit';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import {
  AirportFacility, AirportRunway, ApproachProcedure, FacilityFrequency, OneWayRunway, RunwayFacility, RunwayIdentifier,
  RunwayLightingType, RunwaySurfaceType
} from './Facilities';
import { IcaoType, IcaoValue } from './Icao';
import { ICAO } from './IcaoUtils';

export enum RunwaySurfaceCategory {
  Unknown = 1 << 0,
  Hard = 1 << 1,
  Soft = 1 << 2,
  Water = 1 << 3
}

/**
 * Methods for working with Runways and Runway Designations.
 */
export class RunwayUtils {
  private static readonly RUNWAY_NUMBER_STRINGS = [
    '', // NONE
    ...ArrayUtils.create(36, index => `${index + 1}`.padStart(2, '0')), // 01-36
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ];

  private static readonly RUNWAY_DESIGNATOR_LETTERS = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: '',
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 'L',
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 'R',
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 'C',
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 'W',
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 'A',
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 'B',
  };

  private static readonly SURFACES_HARD = [
    RunwaySurfaceType.Asphalt,
    RunwaySurfaceType.Bituminous,
    RunwaySurfaceType.Brick,
    RunwaySurfaceType.Concrete,
    RunwaySurfaceType.Ice,
    RunwaySurfaceType.Macadam,
    RunwaySurfaceType.Paint,
    RunwaySurfaceType.Planks,
    RunwaySurfaceType.SteelMats,
    RunwaySurfaceType.Tarmac,
    RunwaySurfaceType.Urban,
  ];

  private static readonly SURFACES_SOFT = [
    RunwaySurfaceType.Coral,
    RunwaySurfaceType.Dirt,
    RunwaySurfaceType.Forest,
    RunwaySurfaceType.Grass,
    RunwaySurfaceType.GrassBumpy,
    RunwaySurfaceType.Gravel,
    RunwaySurfaceType.HardTurf,
    RunwaySurfaceType.LongGrass,
    RunwaySurfaceType.OilTreated,
    RunwaySurfaceType.Sand,
    RunwaySurfaceType.Shale,
    RunwaySurfaceType.ShortGrass,
    RunwaySurfaceType.Snow,
    RunwaySurfaceType.WrightFlyerTrack
  ];

  private static readonly SURFACES_WATER = [
    RunwaySurfaceType.WaterFSX,
    RunwaySurfaceType.Lake,
    RunwaySurfaceType.Ocean,
    RunwaySurfaceType.Pond,
    RunwaySurfaceType.River,
    RunwaySurfaceType.WasteWater,
    RunwaySurfaceType.Water
  ];

  protected static tempGeoPoint = new GeoPoint(0, 0);

  /**
   * Creates an empty runway identifier.
   * @returns An empty runway identifier.
   */
  public static emptyIdentifier(): RunwayIdentifier {
    return {
      __Type: 'JS_RunwayIdentifier',
      number: '',
      designator: ''
    };
  }

  /**
   * Sets a runway identifier to be empty.
   * @param ident The identifier to set.
   * @returns The specified identifier, after it has been set to be empty.
   */
  public static toEmptyIdentifier(ident: RunwayIdentifier): RunwayIdentifier {
    ident.number = '';
    ident.designator = '';
    return ident;
  }

  /**
   * Gets the runway identifier that describes a {@link OneWayRunway}.
   * @param runway The runway for which to get an identifier.
   * @param out The object to which to write the results. If not defined, then a new identifier object will be
   * created.
   * @returns The runway identifier that describes the specified runway.
   */
  public static getIdentifierFromOneWayRunway(runway: OneWayRunway, out = RunwayUtils.emptyIdentifier()): RunwayIdentifier {
    out.number = RunwayUtils.getNumberString(runway.direction);
    out.designator = RunwayUtils.getDesignatorLetter(runway.runwayDesignator);
    return out;
  }

  /**
   * Gets the standard string representation for a runway number.
   * @param runwayNumber A runway number.
   * @returns The standard string representation for the specified runway number.
   */
  public static getNumberString(runwayNumber: number): string {
    return RunwayUtils.RUNWAY_NUMBER_STRINGS[runwayNumber] ?? '';
  }

  /**
   * Gets the letter for a runway designator.
   * @param designator A runway designator.
   * @param lowerCase Whether the letter should be lower case. False by default.
   * @returns The letter for the specified runway designator.
   */
  public static getDesignatorLetter(designator: RunwayDesignator, lowerCase = false): string {
    const letter = RunwayUtils.RUNWAY_DESIGNATOR_LETTERS[designator];
    return lowerCase
      ? letter.toLowerCase()
      : letter;
  }

  /**
   * Creates an empty one-way runway.
   * @returns an empty one-way runway.
   */
  public static createEmptyOneWayRunway(): OneWayRunway {
    return {
      parentRunwayIndex: -1,
      designation: '',
      direction: 36,
      runwayDesignator: RunwayDesignator.RUNWAY_DESIGNATOR_NONE,
      course: 0,
      elevation: 0,
      elevationEnd: 0,
      gradient: 0,
      latitude: 0,
      longitude: 0,
      length: 0,
      width: 0,
      startThresholdLength: 0,
      endThresholdLength: 0,
      surface: RunwaySurfaceType.Concrete,
      lighting: RunwayLightingType.Unknown
    };
  }

  /**
   * Utility method to return all of the one-way runways from a single airport facility
   * @param airport is the Airport Facility to evaluate
   * @returns all of the one-way runways in the airport facility, sorted.
   */
  public static getOneWayRunwaysFromAirport(airport: AirportFacility): OneWayRunway[] {
    const runways: OneWayRunway[] = [];
    airport.runways.map((r, i) => RunwayUtils.getOneWayRunways(r, i)).forEach(d => {
      runways.push(d[0]);
      runways.push(d[1]);
    });
    runways.sort(RunwayUtils.sortRunways);
    return runways;
  }

  /**
   * Utility method to return two one-way runways from a single runway facility
   * @param runway is the AirportRunway object to evaluate
   * @param index is the index of the AirportRunway in the Facility
   * @returns splitRunways array of OneWayRunway objects
   */
  public static getOneWayRunways(runway: AirportRunway, index: number): OneWayRunway[] {
    const splitRunways: OneWayRunway[] = [];
    const designations: string[] = runway.designation.split('-');
    for (let i = 0; i < designations.length; i++) {
      const runwayNumber = parseInt(designations[i]);

      let designator = RunwayDesignator.RUNWAY_DESIGNATOR_NONE;
      let course = 0;
      let thresholdDistanceFromCenter = 0;
      let thresholdElevation = 0;
      let endThresholdElevation = 0;
      let ilsFrequency;
      let startThresholdLength = 0, endThresholdLength = 0;
      if (i === 0) {
        designator = runway.designatorCharPrimary;
        course = runway.direction;
        thresholdDistanceFromCenter = (runway.length / 2) - runway.primaryThresholdLength;
        thresholdElevation = runway.primaryElevation;
        endThresholdElevation = runway.secondaryElevation;
        ilsFrequency = runway.primaryILSFrequency.freqMHz === 0 ? undefined : runway.primaryILSFrequency;
        startThresholdLength = runway.primaryThresholdLength;
        endThresholdLength = runway.secondaryThresholdLength;
      } else if (i === 1) {
        designator = runway.designatorCharSecondary;
        course = NavMath.normalizeHeading(runway.direction + 180);
        thresholdDistanceFromCenter = (runway.length / 2) - runway.secondaryThresholdLength;
        thresholdElevation = runway.secondaryElevation;
        endThresholdElevation = runway.primaryElevation;
        ilsFrequency = runway.secondaryILSFrequency.freqMHz === 0 ? undefined : runway.secondaryILSFrequency;
        startThresholdLength = runway.secondaryThresholdLength;
        endThresholdLength = runway.primaryThresholdLength;
      }
      const designation = RunwayUtils.getRunwayNameString(runwayNumber, designator);

      const coordinates = RunwayUtils.tempGeoPoint
        .set(runway.latitude, runway.longitude)
        .offset(course - 180, UnitType.METER.convertTo(thresholdDistanceFromCenter, UnitType.GA_RADIAN));

      splitRunways.push({
        parentRunwayIndex: index,
        designation,
        direction: runwayNumber,
        runwayDesignator: designator,
        course,
        elevation: thresholdElevation,
        elevationEnd: endThresholdElevation,
        gradient: (endThresholdElevation - thresholdElevation) / (runway.length - startThresholdLength - endThresholdLength) * 100,
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        ilsFrequency,
        length: runway.length,
        width: runway.width,
        startThresholdLength,
        endThresholdLength,
        surface: runway.surface,
        lighting: runway.lighting
      });
    }
    return splitRunways;
  }

  /**
   * Gets a name for a paired runway. Names are formatted as dash-separated pairs of directional (one-way) runway
   * designations, with optional leading zero padding of the runway numbers. If the specified runway is not paired,
   * then the name will be the designation of the primary runway only.
   * @param runway A paired runway.
   * @param padded Whether the runway numbers should be padded with leading zeroes. Defaults to `true`.
   * @returns The name for the specified paired runway.
   */
  public static getRunwayPairNameString(runway: AirportRunway, padded = true): string {
    const pad = padded ? 2 : 0;
    const dashIndex = runway.designation.search('-');

    const primary = `${(dashIndex < 0 ? runway.designation : runway.designation.substring(0, dashIndex)).padStart(pad, '0')}${RunwayUtils.getDesignatorLetter(runway.designatorCharPrimary)}`;
    const secondary = dashIndex < 0 ? '' : `-${runway.designation.substring(dashIndex + 1).padStart(pad, '0')}${RunwayUtils.getDesignatorLetter(runway.designatorCharSecondary)}`;

    return primary + secondary;
  }

  /**
   * Utility method to return the runway name from the number and designator (L/R/C/W)
   * @param runwayNumber is the integer part of a runway name (18, 26, 27, etc)
   * @param designator is the RunwayDesignator enum for the runway
   * @param padded Whether single-char runways should be 0-padded. Defaults to `true`.
   * @param prefix A prefix to put before the runway name. Defaults to `''`.
   * @returns the runway name string
   */
  public static getRunwayNameString(runwayNumber: number, designator: RunwayDesignator, padded = true, prefix = ''): string {
    let numberText = `${runwayNumber}`;
    if (padded) {
      numberText = numberText.padStart(2, '0');
    }

    return prefix + numberText + RunwayUtils.getDesignatorLetter(designator);
  }

  /**
   * Gets the primary runway number for a paired runway.
   * @param runway A paired runway.
   * @returns The primary runway number for the specified runway.
   */
  public static getRunwayNumberPrimary(runway: AirportRunway): number {
    const dashIndex = runway.designation.search('-');
    if (dashIndex < 0) {
      return parseInt(runway.designation);
    } else {
      return parseInt(runway.designation.substring(0, dashIndex));
    }
  }

  /**
   * Gets the secondary runway number for a paired runway.
   * @param runway A paired runway.
   * @returns The secondary runway number for the specified runway, or `undefined` if the runway has no secondary
   * runway.
   */
  public static getRunwayNumberSecondary(runway: AirportRunway): number | undefined {
    const dashIndex = runway.designation.search('-');
    if (dashIndex < 0) {
      return undefined;
    } else {
      return parseInt(runway.designation.substring(dashIndex + 1));
    }
  }

  /**
   * Gets a one-way runway from an airport that matches a runway designation by number and designator.
   * @param airport The airport facility in which to search for the match.
   * @param runwayNumber A runway number to match.
   * @param runwayDesignator A runway designator to match.
   * @returns The one-way runway which matches the designation, or undefined if no match could be found.
   */
  public static matchOneWayRunway(airport: AirportFacility, runwayNumber: number, runwayDesignator: RunwayDesignator): OneWayRunway | undefined {
    const length = airport.runways.length;
    for (let r = 0; r < length; r++) {
      const runway = airport.runways[r];
      const designation = runway.designation;
      const primaryRunwayNumber = parseInt(designation.split('-')[0]);
      const secondaryRunwayNumber = parseInt(designation.split('-')[1]);
      if (primaryRunwayNumber === runwayNumber && runway.designatorCharPrimary === runwayDesignator) {
        const oneWayRunways = RunwayUtils.getOneWayRunways(runway, r);
        return oneWayRunways[0];
      } else if (secondaryRunwayNumber === runwayNumber && runway.designatorCharSecondary === runwayDesignator) {
        const oneWayRunways = RunwayUtils.getOneWayRunways(runway, r);
        return oneWayRunways[1];
      }
    }
    return undefined;
  }

  /**
   * Gets a one-way runway from an airport that matches a runway designation string.
   * @param airport The airport facility in which to search for the match.
   * @param designation A runway designation.
   * @returns The one-way runway which matches the designation, or undefined if no match could be found.
   */
  public static matchOneWayRunwayFromDesignation(airport: AirportFacility, designation: string): OneWayRunway | undefined {
    const length = airport.runways.length;
    for (let i = 0; i < length; i++) {
      const match = RunwayUtils.getOneWayRunways(airport.runways[i], i).find((r) => {
        return (r.designation === designation);
      });
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  /**
   * Gets a one-way runway from an airport that matches a runway ident.
   * @param airport The airport facility in which to search for the match.
   * @param ident A runway ident.
   * @returns The one-way runway which matches the ident, or undefined if no match could be found.
   */
  public static matchOneWayRunwayFromIdent(airport: AirportFacility, ident: string): OneWayRunway | undefined {
    return RunwayUtils.matchOneWayRunwayFromDesignation(airport, ident.substr(2).trim());
  }

  /**
   * Utility method to return the procedures for a given runway.
   * @param procedures The procedures for the airport.
   * @param runway The given runway to find procedures for.
   * @returns A list of approach procedures for the given runway.
   */
  public static getProceduresForRunway(procedures: readonly ApproachProcedure[], runway: AirportRunway): Array<ApproachProcedure> {
    const oneways = new Array<string>();

    // TODO Make the designation splitting logic a common routine too.
    const designations: string[] = runway.designation.split('-');
    for (let i = 0; i < designations.length; i++) {
      const runwayNumber = parseInt(designations[i]);
      let runwayName: string;
      if (i === 0) {
        runwayName = RunwayUtils.getRunwayNameString(runwayNumber, runway.designatorCharPrimary, false, '');
      } else {
        runwayName = RunwayUtils.getRunwayNameString(runwayNumber, runway.designatorCharSecondary, false, '');
      }
      oneways.push(runwayName);
    }

    const found = new Array<ApproachProcedure>();
    for (const procedure of procedures) {
      if (oneways.includes(procedure.runway.trim())) {
        found.push(procedure);
      } else if (procedure.runwayNumber === 0) {
        found.push(procedure);
      }
    }
    return found;
  }

  /**
   * Gets the localizer frequency for a runway.
   * @param airport The airport to which the query runway belongs.
   * @param runway The query runway.
   * @returns The localizer frequency for the query runway, or undefined if one could not be found.
   */
  public static getLocFrequency(airport: AirportFacility, runway: OneWayRunway): FacilityFrequency | undefined;
  /**
   * Gets the localizer frequency for a runway.
   * @param airport The airport to which the query runway belongs.
   * @param runwayDesignation The designation of the query runway.
   * @returns The localizer frequency for the query runway, or undefined if one could not be found.
   */
  public static getLocFrequency(airport: AirportFacility, runwayDesignation: string): FacilityFrequency | undefined;
  /**
   * Gets the localizer frequency for a runway.
   * @param airport The airport to which the query runway belongs.
   * @param runwayNumber The number of the query runway.
   * @param runwayDesignator The designator of the query runway.
   * @returns The localizer frequency for the query runway, or undefined if one could not be found.
   */
  public static getLocFrequency(airport: AirportFacility, runwayNumber: number, runwayDesignator: RunwayDesignator): FacilityFrequency | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getLocFrequency(airport: AirportFacility, arg1: OneWayRunway | string | number, arg2?: RunwayDesignator): FacilityFrequency | undefined {
    let runway;
    if (typeof arg1 === 'string') {
      const matchedRunway = RunwayUtils.matchOneWayRunwayFromDesignation(airport, arg1);
      if (!matchedRunway) {
        return undefined;
      }
      runway = matchedRunway;
    } else if (typeof arg1 === 'number') {
      const matchedRunway = RunwayUtils.matchOneWayRunway(airport, arg1, arg2 as RunwayDesignator);
      if (!matchedRunway) {
        return undefined;
      }
      runway = matchedRunway;
    } else {
      runway = arg1;
    }

    const runwayDesignation = runway.designation;

    if (runway.ilsFrequency) {
      return runway.ilsFrequency;
    }

    for (let i = 0; i < airport.frequencies.length; i++) {
      // Note: drop the leading zero in the runway designation for the search because some third-party sceneries
      // format the frequency names without the leading zero.
      const match = airport.frequencies[i].name.search(runwayDesignation.replace(/^0/, ''));
      if (match > -1) {
        return airport.frequencies[i];
      }
    }
    return undefined;
  }

  /**
   * Gets the back course frequency for a runway.
   * @param airport The airport to which the query runway belongs.
   * @param runwayNumber The number of the query runway.
   * @param runwayDesignator The designator of the query runway.
   * @returns The bc frequency for the query runway, or undefined if one could not be found.
   */
  public static getBcFrequency(airport: AirportFacility, runwayNumber: number, runwayDesignator: RunwayDesignator): FacilityFrequency | undefined {

    const matchedRunway = RunwayUtils.getOppositeOneWayRunway(airport, runwayNumber, runwayDesignator);

    if (!matchedRunway) {
      return undefined;
    }

    return RunwayUtils.getLocFrequency(airport, matchedRunway);
  }

  /**
   * Get the opposite one way runway from a runway number and designator.
   * @param airport The airport to which the query runway belongs.
   * @param runwayNumber The number of the query runway.
   * @param runwayDesignator The designator of the query runway.
   * @returns The opposite one way runway for the query runway, or undefined if one could not be found.
   */
  public static getOppositeOneWayRunway(airport: AirportFacility, runwayNumber: number, runwayDesignator: RunwayDesignator): OneWayRunway | undefined {

    const oppositeRunwayNumber = Math.round(NavMath.normalizeHeading(10 * (runwayNumber + 18)) / 10);
    let oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_NONE;

    switch (runwayDesignator) {
      case RunwayDesignator.RUNWAY_DESIGNATOR_LEFT:
        oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT;
        break;
      case RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT:
        oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_LEFT;
        break;
      default:
        oppositeRunwayDesignator = runwayDesignator;
        break;
    }
    return RunwayUtils.matchOneWayRunway(airport, oppositeRunwayNumber, oppositeRunwayDesignator);
  }

  /**
   * A comparer for sorting runways by number, and then by L, C, and R.
   * @param r1 The first runway to compare.
   * @param r2 The second runway to compare.
   * @returns -1 if the first is before, 0 if equal, 1 if the first is after.
   */
  public static sortRunways(r1: OneWayRunway, r2: OneWayRunway): number {
    if (r1.direction === r2.direction) {
      let v1 = 0;
      if (r1.designation.indexOf('L') != -1) {
        v1 = 1;
      } else if (r1.designation.indexOf('C') != -1) {
        v1 = 2;
      } else if (r1.designation.indexOf('R') != -1) {
        v1 = 3;
      }
      let v2 = 0;
      if (r2.designation.indexOf('L') != -1) {
        v2 = 1;
      } else if (r2.designation.indexOf('C') != -1) {
        v2 = 2;
      } else if (r2.designation.indexOf('R') != -1) {
        v2 = 3;
      }
      return v1 - v2;
    }
    return r1.direction - r2.direction;
  }

  /**
   * Gets the ICAO value for the runway facility associated with a one-way runway.
   * @param airport The runway's parent airport, or the ICAO value of the airport.
   * @param runway A one-way runway.
   * @returns The ICAO value for the runway facility associated with the specified one-way runway.
   */
  public static getRunwayFacilityIcaoValue(
    airport: AirportFacility | IcaoValue,
    runway: OneWayRunway
  ): IcaoValue {
    const airportIcao = (airport as any).__Type === 'JS_ICAO'
      ? airport as IcaoValue
      : (airport as AirportFacility).icaoStruct;

    return ICAO.value(IcaoType.Runway, '', airportIcao.ident, `RW${runway.designation}`);
  }

  /**
   * Gets the ICAO string for the runway facility associated with a one-way runway.
   * @param airport The runway's parent airport, or the ICAO of the airport.
   * @param runway A one-way runway.
   * @returns the ICAO string for the runway facility associated with the one-way runway.
   * @deprecated Please use {@link RunwayUtils.getRunwayFacilityIcaoValue | getRunwayFacilityIcaoValue()} instead.
   */
  public static getRunwayFacilityIcao(airport: AirportFacility | string, runway: OneWayRunway): string {
    const icao = typeof airport === 'string' ? airport : airport.icao;
    return `R  ${icao.substring(7, 11)}RW${runway.designation.padEnd(3, ' ')}`;
  }

  /**
   * Creates a runway waypoint facility from a runway.
   * @param airport The runway's parent airport.
   * @param runway A one-way runway.
   * @returns A runway waypoint facility corresponding to the runway.
   */
  public static createRunwayFacility(airport: AirportFacility, runway: OneWayRunway): RunwayFacility {
    const icao = RunwayUtils.getRunwayFacilityIcao(airport, runway);
    return {
      icao,
      icaoStruct: ICAO.stringV1ToValue(icao),
      name: `Runway ${runway.designation}`,
      region: airport.region,
      city: airport.city,
      lat: runway.latitude,
      lon: runway.longitude,
      runway
    };
  }

  /**
   * Gets an alpha code from a runway number.
   * @param number is the runway number.
   * @returns a letter.
   */
  public static getRunwayCode(number: number): string {
    const n = Math.round(number);
    return String.fromCharCode(48 + n + (n > 9 ? 7 : 0));
  }

  /**
   * Gets the runway surface category from a runway or runway surface type.
   * @param runway A runway or runway surface type.
   * @returns The surface category of the specified runway or runway surface type.
   */
  public static getSurfaceCategory(runway: AirportRunway | OneWayRunway | RunwaySurfaceType): RunwaySurfaceCategory {
    const surface = typeof runway === 'object' ? runway.surface : runway;

    if (this.SURFACES_HARD.includes(surface)) {
      return RunwaySurfaceCategory.Hard;
    } else if (this.SURFACES_SOFT.includes(surface)) {
      return RunwaySurfaceCategory.Soft;
    } else if (this.SURFACES_WATER.includes(surface)) {
      return RunwaySurfaceCategory.Water;
    } else {
      return RunwaySurfaceCategory.Unknown;
    }
  }
}
