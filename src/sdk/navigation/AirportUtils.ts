import { BitFlags, UnitType } from '../math';
import { AirportFacility, AirportRunway, FacilityType, FixTypeFlags, ICAO } from './Facilities';
import { RunwayUtils } from './RunwayUtils';

/**
 * Utility functions for working with airport data.
 */
export class AirportUtils {
  private static readonly REGION_CODES = new Set([
    'AG', 'AN', 'AY', 'BG', 'BI', 'BK', 'CY', 'DA', 'DB', 'DF', 'DG', 'DI', 'DN', 'DR', 'DT', 'DX', 'EB', 'ED', 'EE',
    'EF', 'EG', 'EH', 'EI', 'EK', 'EL', 'EN', 'EP', 'ES', 'ET', 'EV', 'EY', 'FA', 'FB', 'FC', 'FD', 'FE', 'FG', 'FH',
    'FI', 'FJ', 'FK', 'FL', 'FM', 'FN', 'FO', 'FP', 'FQ', 'FS', 'FT', 'FV', 'FW', 'FX', 'FY', 'FZ', 'GA', 'GB', 'GC',
    'GE', 'GF', 'GG', 'GL', 'GM', 'GO', 'GQ', 'GS', 'GU', 'GV', 'HA', 'HB', 'HD', 'HE', 'HH', 'HK', 'HL', 'HR', 'HS',
    'HT', 'HU', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ',
    'LK', 'LL', 'LM', 'LO', 'LP', 'LQ', 'LR', 'LS', 'LT', 'LU', 'LV', 'LW', 'LX', 'LY', 'LZ', 'MB', 'MD', 'MG', 'MH',
    'MK', 'MM', 'MN', 'MP', 'MR', 'MS', 'MT', 'MU', 'MW', 'MY', 'MZ', 'NC', 'NF', 'NG', 'NI', 'NL', 'NS', 'NT', 'NV',
    'NW', 'NZ', 'OA', 'OB', 'OE', 'OI', 'OJ', 'OK', 'OL', 'OM', 'OO', 'OP', 'OR', 'OS', 'OT', 'OY', 'PA', 'PG', 'PH',
    'PJ', 'PK', 'PL', 'PM', 'PO', 'PP', 'PT', 'PW', 'RC', 'RJ', 'RK', 'RO', 'RP', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG',
    'SI', 'SJ', 'SK', 'SL', 'SM', 'SO', 'SP', 'SS', 'SU', 'SV', 'SW', 'SY', 'TA', 'TB', 'TD', 'TF', 'TG', 'TI', 'TJ',
    'TK', 'TL', 'TN', 'TQ', 'TT', 'TU', 'TV', 'TX', 'UA', 'UB', 'UC', 'UD', 'UE', 'UG', 'UH', 'UI', 'UK', 'UL', 'UM',
    'UN', 'UO', 'UR', 'US', 'UT', 'UU', 'UW', 'VA', 'VC', 'VD', 'VE', 'VG', 'VH', 'VI', 'VL', 'VM', 'VN', 'VO', 'VR',
    'VT', 'VV', 'VY', 'WA', 'WB', 'WI', 'WM', 'WR', 'WS', 'YB', 'YM', 'ZB', 'ZG', 'ZH', 'ZK', 'ZL', 'ZM', 'ZP', 'ZS',
    'ZU', 'ZW', 'ZY'
  ]);

  private static readonly NUMERAL_REGEX = /\d/;

  /**
   * Attempts to get the region code of an airport.
   * @param facility The facility record for the airport.
   * @returns The region code of an airport, or `undefined` if one could not be found.
   */
  public static tryGetRegionCode(facility: AirportFacility): string | undefined {
    // Airports don't have region codes in their ICAO strings, so we will try a series of increasingly ugly hacks to
    // deduce the region code

    // First, we will look for any non-circling approach and see if we can find a runway fix and grab its region code,
    // which should always be the same code as the airport

    for (let i = 0; i < facility.approaches.length; i++) {
      const approach = facility.approaches[i];
      if (approach.runway.length === 0 || approach.finalLegs.length === 0) {
        continue;
      }

      const fixIcao = approach.finalLegs[approach.finalLegs.length - 1].fixIcao;

      if (ICAO.isFacility(fixIcao, FacilityType.RWY)) {
        const region = ICAO.getRegionCode(fixIcao);
        if (AirportUtils.REGION_CODES.has(region)) {
          return region;
        }
      }
    }

    // Next, we will grab region codes from final approach fixes. If they all match, then it's a good bet the airport
    // region code is the same.

    if (facility.approaches.length > 1) {
      let region: string | undefined = undefined;
      let regionCount = 0;

      for (let i = 0; i < facility.approaches.length; i++) {
        const approach = facility.approaches[i];

        for (let j = 0; j < approach.finalLegs.length; j++) {
          const leg = approach.finalLegs[j];
          if (leg.fixTypeFlags === FixTypeFlags.FAF && ICAO.isFacility(leg.fixIcao)) {
            const fafRegion = ICAO.getRegionCode(leg.fixIcao);
            if (AirportUtils.REGION_CODES.has(fafRegion)) {
              region ??= fafRegion;
              if (region !== fafRegion) {
                region = undefined;
              }
              regionCount++;
              break;
            }
          }
        }

        if (region === undefined && regionCount > 0) {
          break;
        }
      }

      if (region !== undefined && regionCount > 1) {
        return region;
      }
    }

    // Next, we will grab the first two letters of the airport ident if the ident is exactly four letters and does not
    // contain any numerals.

    const ident = ICAO.getIdent(facility.icao);
    if (ident.length === 4 && ident.search(AirportUtils.NUMERAL_REGEX) < 0) {
      const region = ident.substring(0, 2);
      if (AirportUtils.REGION_CODES.has(region)) {
        return region;
      }
    }

    // Finally, we will search every procedure (excluding enroute transitions) at the airport for terminal intersections.
    // The region codes of these intersections should be the same as that of the airport.

    // Departures
    for (let i = 0; i < facility.departures.length; i++) {
      const departure = facility.departures[i];
      for (let j = 0; j < departure.commonLegs.length; j++) {
        const leg = departure.commonLegs[j];
        if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
          const region = ICAO.getRegionCode(leg.fixIcao);
          if (AirportUtils.REGION_CODES.has(region)) {
            return region;
          }
        }
      }
      for (let j = 0; j < departure.runwayTransitions.length; j++) {
        const transition = departure.runwayTransitions[j];

        for (let k = 0; k < transition.legs.length; k++) {
          const leg = transition.legs[k];
          if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
            const region = ICAO.getRegionCode(leg.fixIcao);
            if (AirportUtils.REGION_CODES.has(region)) {
              return region;
            }
          }
        }
      }
    }

    // Arrivals
    for (let i = 0; i < facility.arrivals.length; i++) {
      const arrival = facility.arrivals[i];
      for (let j = 0; j < arrival.commonLegs.length; j++) {
        const leg = arrival.commonLegs[j];
        if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
          const region = ICAO.getRegionCode(leg.fixIcao);
          if (AirportUtils.REGION_CODES.has(region)) {
            return region;
          }
        }
      }
      for (let j = 0; j < arrival.runwayTransitions.length; j++) {
        const transition = arrival.runwayTransitions[j];

        for (let k = 0; k < transition.legs.length; k++) {
          const leg = transition.legs[k];
          if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
            const region = ICAO.getRegionCode(leg.fixIcao);
            if (AirportUtils.REGION_CODES.has(region)) {
              return region;
            }
          }
        }
      }
    }

    // Approaches
    for (let i = 0; i < facility.approaches.length; i++) {
      const approach = facility.approaches[i];
      for (let j = 0; j < approach.finalLegs.length; j++) {
        const leg = approach.finalLegs[j];
        if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
          const region = ICAO.getRegionCode(leg.fixIcao);
          if (AirportUtils.REGION_CODES.has(region)) {
            return region;
          }
        }
      }
      for (let j = 0; j < approach.transitions.length; j++) {
        const transition = approach.transitions[j];

        for (let k = 0; k < transition.legs.length; k++) {
          const leg = transition.legs[k];
          if (ICAO.isFacility(leg.fixIcao) && ICAO.getAssociatedAirportIdent(leg.fixIcao) === ident) {
            const region = ICAO.getRegionCode(leg.fixIcao);
            if (AirportUtils.REGION_CODES.has(region)) {
              return region;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Gets the elevation of an airport, in meters. The elevation is estimated as the average elevation of the airport's
   * runways. If the airport has no runways, an elevation cannot be estimated and `undefined` is returned instead.
   * @param facility The facility record for the airport.
   * @returns The elevation of the specified airport, in meters, or `undefined` if the elevation could not be
   * determined.
   */
  public static getElevation(facility: AirportFacility): number | undefined {
    if (facility.runways.length === 0) {
      return undefined;
    }

    return facility.runways.reduce((sum, runway) => sum + runway.elevation, 0) / facility.runways.length;
  }

  /**
   * Gets the longest runway of an airport.
   * @param facility The facility record for the airport.
   * @returns The longest runway as an AirportRunway, or null.
   */
  public static getLongestRunway(facility: AirportFacility): AirportRunway | null {
    let longestRunway: AirportRunway | null = null;
    for (const runway of facility.runways) {
      if (longestRunway === null || runway.length > longestRunway.length) {
        longestRunway = runway;
      }
    }
    return longestRunway;
  }

  /**
   * Get a list of runways at an airport matching specific criteria.
   * @param facility The facility record for the airport.
   * @param minLength The minimum length of the runway, in feet.
   * @param surfaceTypes An optional bitfield of RunwaySurfaceCategory values to allow.
   * @returns A list of matching runways.
   */
  public static getFilteredRunways(facility: AirportFacility, minLength: number, surfaceTypes?: number): AirportRunway[] {
    minLength = UnitType.METER.convertFrom(minLength, UnitType.FOOT);
    const result: AirportRunway[] = [];
    for (const runway of facility.runways) {
      if (runway.length >= minLength) {
        if (surfaceTypes === undefined ||
          BitFlags.isAny(RunwayUtils.getSurfaceCategory(runway), surfaceTypes)) {
          result.push(runway);
        }
      }
    }
    return result;
  }

  /**
   * Checks to see whether an airport has a runway matching specific criteria.   This is a
   * lighter version of getFilteredRunways that doesn't do any extra assignments.
   * @param facility The facility record for the airport.
   * @param minLength The minimum length of the runway, in feet.
   * @param surfaceTypes An optional bitfield of RunwaySurfaceCategory values to allow.
   * @returns A boolean if a matching runway exists.
   */
  public static hasMatchingRunway(facility: AirportFacility, minLength: number, surfaceTypes?: number): boolean {
    minLength = UnitType.METER.convertFrom(minLength, UnitType.FOOT);
    for (const runway of facility.runways) {
      if (runway.length >= minLength) {
        if (surfaceTypes === undefined ||
          BitFlags.isAny(RunwayUtils.getSurfaceCategory(runway), surfaceTypes)) {
          return true;
        }
      }
    }
    return false;
  }
}