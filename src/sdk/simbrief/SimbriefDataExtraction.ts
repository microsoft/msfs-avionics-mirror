import { GeoPoint, GeoPointInterface } from '../geo/GeoPoint';
import { AirportFacility, FacilitySearchType, FacilityType, ICAO, UserFacilityUtils } from '../navigation/Facilities';
import { AirwayObject, FacilityLoader } from '../navigation/FacilityLoader';
import { FacilityRepository } from '../navigation/FacilityRepository';
import { RunwayUtils } from '../navigation/RunwayUtils';
import { SimbriefAirport, SimbriefOfp } from './SimbriefTypes';

/** Extracted route waypoint */
export interface SimbriefEnrouteWaypoint {
  /** Type string */
  type: 'waypoint',

  /** Unique ICAO */
  icao: string,
}

/** Extracted route airway segment */
export interface SimbriefEnrouteAirway {
  /** Type string */
  type: 'airway',

  /** Airway object */
  airwayObject: AirwayObject,

  /** Entry fix unique icao */
  entryFixIcao: string,

  /** Exit fix unique icao */
  exitFixIcao: string,
}

/** Extracted simbrief route */
export interface SimbriefRoute {
  /** Origin airport facility */
  originAirport: AirportFacility,

  /** Origin runway index. -1 if not specified */
  originAirportRunwayIndex: number,

  /** Destination airport facility */
  destinationAirport: AirportFacility,

  /** Destination runway index. -1 if not specified */
  destinationAirportRunwayIndex: number,

  /** Alternate airport facility */
  alternateAirport?: AirportFacility,

  /** Alternate runway index. -1 if not specified */
  alternateAirportRunwayIndex?: number,

  /** Cruise level, in feet */
  cruiseLevel: number,

  /** Flight number including callsign */
  flightNumber?: string,

  /** Enroute data */
  enroute: (SimbriefEnrouteWaypoint | SimbriefEnrouteAirway)[],

  /** Whether the enroute data was completely loaded without errors */
  enrouteIsComplete: boolean,

  /** The OFP request ID. */
  ofpId: string,
}

/** Simbrief wind and temperature record */
export interface SimbriefWindTemperatureRecord {
  /** Altitude for this entry in feet. */
  altitude: number,

  /** Wind direction, in degrees true */
  direction: number,

  /** Wind speed, in knots */
  speed: number,

  /** Temperature, in degrees Celsius */
  temperature: number,
}

/** Simbrief cruise wind and temperature record. */
export interface SimbriefCruiseWindTemperatureRecord {
  /** Fix ICAO. */
  fixIcao: string,

  /** Wind records for the fix. */
  winds: SimbriefWindTemperatureRecord[],
}

/** Simbrief climb/descent wind and temperature record. */
export interface SimbriefClimbDescentWindTemperatureRecord {
  /** Expected altitude when crossing this point. */
  expectedAltitude: number,

  /** Cumulative distance from the start of the climb or descent. */
  cumulativeDistance: number,

  /** Wind records for the point. */
  winds: SimbriefWindTemperatureRecord[],
}

/**
 * Extracted simbrief wind data
 */
export interface SimbriefWind {
  /** Expected climb winds, in the order they appear in the plan. */
  climbWind: SimbriefClimbDescentWindTemperatureRecord[],

  /** Expected descent winds, in the order they appear in the plan. */
  descentWind: SimbriefClimbDescentWindTemperatureRecord[],

  /** Cruise wind data, for fixes with wind data available. */
  cruiseWind: SimbriefCruiseWindTemperatureRecord[],

  /** Cruise flight levels in feet, sorted from lowest to highest (not necessarily the order they occur in the flight). */
  cruiseLevels: number[],

  /** The origin field elevation in feet. */
  originElevation?: number,

  /** The destination field elevation in feet. */
  destinationElevation?: number,

  /** The OFP request ID. */
  ofpId: string,
}

/**
 * Simbrief data utilities
 */
export class SimbriefDataExtraction {
  private static geoPointCache = new GeoPoint(0, 0);
  /**
   * Extracts route data from a simbrief OFP using a facility loader
   *
   * @param ofp the simbrief ofp
   * @param facLoader the facility loader
   * @param facRepo the facility repository
   * @param latLongNaming a function that returns the user facility ICAO for a given lat/lon fix
   *
   * @returns extracted route data
   */
  public static async extractSimbriefRoute(
    ofp: SimbriefOfp,
    facLoader: FacilityLoader,
    facRepo: FacilityRepository,
    latLongNaming: (position: GeoPointInterface) => string,
  ): Promise<SimbriefRoute> {
    const originAirport = await this.getAirport(facLoader, ofp.origin.icao_code);
    const originAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(originAirport);
    const originAirportRunwayIndex = originAirportRunways.findIndex((it) => it.designation === ofp.origin.plan_rwy);

    const destinationAirport = await this.getAirport(facLoader, ofp.destination.icao_code);
    const destinationAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(destinationAirport);
    const destinationAirportRunwayIndex = destinationAirportRunways.findIndex((it) => it.designation === ofp.destination.plan_rwy);

    let alternateAirport;
    let alternateAirportRunwayIndex;
    if ('icao_code' in ofp.alternate) {
      alternateAirport = await this.getAirport(facLoader, ofp.alternate.icao_code);

      const alternateAirportRunways = RunwayUtils.getOneWayRunwaysFromAirport(alternateAirport);

      alternateAirportRunwayIndex = alternateAirportRunways.findIndex((it) => it.designation === (ofp.alternate as SimbriefAirport).plan_rwy);
    }

    const enroute = [] as (SimbriefEnrouteWaypoint | SimbriefEnrouteAirway)[];
    let enrouteIsComplete = true;

    let pendingAirway: AirwayObject | undefined;
    let pendingAirwayFirstFix: string | undefined;
    let pendingAirwayLastFix: string | undefined;

    let lastIcao: string | undefined;
    for (let i = 0; i < ofp.navlog.fix.length; i++) {
      const fix = ofp.navlog.fix[i];

      if (fix.ident === 'TOC' || fix.ident === 'TOD') {
        continue;
      }

      const fixInProcedure = fix.is_sid_star === '1'
        || (ofp.navlog.fix[i + 1]?.is_sid_star === '1' && fix.via_airway === ofp.navlog.fix[i + 1].via_airway);
      let fixOnAirway = !fixInProcedure && !fix.via_airway.startsWith('DCT') && !fix.via_airway.startsWith('NAT');

      // is this fix the enroute transition from sid?
      if (fixOnAirway && ofp.navlog.fix[i - 1]?.is_sid_star === '1' && fix.via_airway === ofp.navlog.fix[i - 1].via_airway) {
        fix.via_airway = 'DCT';
        fixOnAirway = false;
      }

      // Check if we are on a new airway and need to insert a pending one
      if ((fixOnAirway && pendingAirway && pendingAirway.name !== fix.via_airway) || (!fixOnAirway && pendingAirway)) {
        if (pendingAirwayFirstFix === undefined || pendingAirwayLastFix === undefined) {
          console.warn(`[SimbriefDataExtraction](extractSimbriefRoute) Pending airway invalid; entry=${pendingAirwayFirstFix}, exit=${pendingAirwayLastFix}`);
          enrouteIsComplete = false;
          continue;
        }

        enroute.push({ type: 'airway', airwayObject: pendingAirway, entryFixIcao: pendingAirwayFirstFix, exitFixIcao: pendingAirwayLastFix });

        pendingAirway = undefined;
        pendingAirwayFirstFix = undefined;
        pendingAirwayLastFix = undefined;
      }

      let icao: string | undefined;

      const lat = parseFloat(fix.pos_lat);
      const long = parseFloat(fix.pos_long);

      if (fix.type === 'ltlg') {
        SimbriefDataExtraction.geoPointCache.set(lat, long);
        const facility = UserFacilityUtils.createFromLatLon(latLongNaming(SimbriefDataExtraction.geoPointCache), lat, long);

        facRepo.add(facility);

        icao = facility.icao;
      } else {
        const searchResults = await facLoader.findNearestFacilitiesByIdent(FacilitySearchType.All, fix.ident, lat, long);

        if (searchResults.length === 0) {
          enrouteIsComplete = false;
          continue;
        }

        icao = searchResults[0].icao;
      }

      if (fixOnAirway) {
        const airwayIdent = fix.via_airway;

        // Start a new pending airway if there isn't already one
        if (!pendingAirway) {
          try {
            pendingAirway = await facLoader.getAirway(airwayIdent, 0, lastIcao ?? icao);
          } catch (e) {
            enrouteIsComplete = false;
            continue;
          }
          pendingAirwayFirstFix = lastIcao;
        }

        if (pendingAirway) {
          const isIcaoOnAirway = pendingAirway.waypoints.find((it) => it.icao === icao);
          if (!isIcaoOnAirway) {
            // we might have the wrong fix, so get the one with same ident from the airway
            icao = pendingAirway.waypoints.find((it) => ICAO.getIdent(it.icao) === ICAO.getIdent(icao ?? ''))?.icao;
          }
          pendingAirwayLastFix = icao;
        }

        lastIcao = icao;
        continue;
      }

      if (!fixInProcedure) {
        enroute.push({ type: 'waypoint', icao });
      }

      lastIcao = icao;
    }

    return {
      originAirport,
      originAirportRunwayIndex,
      destinationAirport,
      destinationAirportRunwayIndex,
      alternateAirport,
      alternateAirportRunwayIndex,
      cruiseLevel: parseInt(ofp.general.initial_altitude),
      flightNumber: (typeof ofp.general.icao_airline === 'string' && typeof ofp.general.flight_number === 'string')
        ? ofp.general.icao_airline.substring(0, 3) + ofp.general.flight_number
        : undefined,
      enroute,
      enrouteIsComplete,
      ofpId: ofp.params.request_id,
    };
  }

  /**
   * Extracts wind data from a simbrief OFP
   *
   * @param ofp the simbrief ofp
   * @param facLoader the facility loader
   * @param latLongNaming a function that returns the user facility ICAO for a given lat/lon fix
   * @returns extracted wind data
   */
  public static async extractSimBriefWind(
    ofp: SimbriefOfp,
    facLoader: FacilityLoader,
    latLongNaming: (position: GeoPointInterface) => string,
  ): Promise<SimbriefWind> {
    const cruiseWind: SimbriefCruiseWindTemperatureRecord[] = [];
    const climbWind: SimbriefClimbDescentWindTemperatureRecord[] = [];
    const descentWind: SimbriefClimbDescentWindTemperatureRecord[] = [];
    const cruiseLevels = new Set<number>();

    let climbDistance = 0;
    let descentDistance = 0;

    for (const fix of ofp.navlog.fix) {
      const winds: SimbriefWindTemperatureRecord[] = [];

      if (!fix.wind_data) {
        continue;
      }

      for (const level of fix.wind_data.level) {
        winds.push({ altitude: parseInt(level.altitude), direction: parseInt(level.wind_dir), speed: parseInt(level.wind_spd), temperature: parseInt(level.oat) });
      }

      if (winds.length < 1) {
        continue;
      }

      if (fix.stage === 'CLB' || fix.ident === 'TOC') {
        climbDistance += parseInt(fix.distance);
        climbWind.push({
          expectedAltitude: parseInt(fix.altitude_feet),
          cumulativeDistance: climbDistance,
          winds,
        });

      } else if (fix.stage === 'DSC' || fix.ident === 'TOD') {
        descentDistance += fix.ident === 'TOD' ? 0 : parseInt(fix.distance);
        descentWind.push({
          expectedAltitude: parseInt(fix.altitude_feet),
          cumulativeDistance: descentDistance,
          winds,
        });
      } else {
        cruiseLevels.add(parseInt(fix.altitude_feet));

        let fixIcao: string | undefined = undefined;

        if (fix.type === 'wpt') {
          const lat = parseFloat(fix.pos_lat);
          const long = parseFloat(fix.pos_long);

          const searchResults = await facLoader.findNearestFacilitiesByIdent(FacilitySearchType.All, fix.ident, lat, long);

          fixIcao = searchResults[0]?.icao;
        } else if (fix.type === 'ltlg') {
          const lat = parseFloat(fix.pos_lat);
          const long = parseFloat(fix.pos_long);

          SimbriefDataExtraction.geoPointCache.set(lat, long);
          fixIcao = latLongNaming(SimbriefDataExtraction.geoPointCache);
        } else {
          continue;
        }

        if (fixIcao) {
          cruiseWind.push({ fixIcao, winds });
        }
      }
    }

    return {
      climbWind,
      descentWind,
      cruiseWind,
      cruiseLevels: Array.from(cruiseLevels).sort(),
      originElevation: typeof ofp.origin?.elevation === 'number' ? parseInt(ofp.origin.elevation) : undefined,
      destinationElevation: typeof ofp.destination?.elevation === 'number' ? parseInt(ofp.destination.elevation) : undefined,
      ofpId: ofp.params.request_id,
    };
  }

  /**
   * Gets an airport from the {@link FacilityLoader} using an ident
   *
   * @param facLoader the facility loader
   * @param ident the airport ident
   *
   * @returns an airport facility
   */
  private static async getAirport(facLoader: FacilityLoader, ident: string): Promise<AirportFacility> {
    const searchResults = await facLoader.searchByIdent(FacilitySearchType.Airport, ident, 1);

    if (searchResults.length === 0) {
      throw new Error(`Could not find any airports with ident: ${ident}`);
    }

    return facLoader.getFacility(FacilityType.Airport, searchResults[0]);
  }
}