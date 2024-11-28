import { EventBus, FacilityLoader, FacilityRepository, FacilitySearchType, FlightPlan, GeoPoint, ICAO, SimVarValueType, UnitType } from '@microsoft/msfs-sdk';

import { LegModes } from '../../../Sr22tTripPlanningModes';

/** Contains latitude and longitude info
 */
export type coordinate = {
  /** latitude */
  lat: number,
  /** longitude */
  lon: number,
}

/** Determines if a leg of the flight plan has been flown yet.
 * @param flightPlan copy of the active flight plan
 * @param legIndex index of a leg
 * @returns true if leg has been flown, false if not
 */
export function legFlown(flightPlan: FlightPlan, legIndex: number): boolean {

  const activeLegIndex = flightPlan.activeLateralLeg;
  if (legIndex < activeLegIndex) {
    return true;
  } else {
    return false;
  }
}

/** Calculates the number of leg miles between the end of the start leg and the end of the end leg (nautical miles)
 * @param flightPlan copy of the active flight plan
 * @param startLegIndex index of the start leg
 * @param endLegIndex index of the end leg
 * @returns The number of leg miles between the end of the start leg
 * and the end of the end leg (nautical miles)
 */
export function totalLegMiles(flightPlan: FlightPlan, startLegIndex: number, endLegIndex: number): number {

  let legMiles = 0;

  for (let index = 0; index < endLegIndex - startLegIndex; index++) {
    const legMeters = flightPlan.tryGetLeg(startLegIndex + 1 + index)?.calculated?.distance;
    if (legMeters !== undefined) {
      legMiles += legMeters / 1852; // convert to NM
    }
  }

  return legMiles;
}

/** Calculates the total number of nautical miles for the given leg mode, selected leg, and present position
 * @param flightPlan copy of the active flight plan
 * @param legMode selected leg, remaining, or cumulative
 * @param selectedLeg index of the selected leg
 * @param actLegMilesRem number of remaining nautical miles for the active leg
 * @returns The total number of nautical miles for the given leg mode, selected leg, and present position
 */
export function getLegsDistance(flightPlan: FlightPlan, legMode: LegModes, selectedLeg: number, actLegMilesRem: number): number {

  if (flightPlan.length > 0) {
    let startLeg;
    let firstLegMiles = 0;

    if (legMode === LegModes.CUM) {
      startLeg = 1;
      const firstLegMeters = flightPlan.tryGetLeg(startLeg)?.calculated?.distance;
      firstLegMiles = firstLegMeters !== undefined ? firstLegMeters / 1852 : 0;
    } else {
      startLeg = flightPlan.activeLateralLeg;
      firstLegMiles = actLegMilesRem;
    }

    let endLeg;
    if (legMode === LegModes.LEG) {
      if (legFlown(flightPlan, selectedLeg) || flightPlan.tryGetLeg(selectedLeg) === null) {
        return -1;
      }
      endLeg = selectedLeg;
    } else {
      endLeg = flightPlan.length - 1;
    }

    const remainingLegMiles = totalLegMiles(flightPlan, startLeg, endLeg);
    return firstLegMiles !== undefined ? firstLegMiles + remainingLegMiles : -1;
  } else {
    return -1;  // returning -1 if undefined will cause the display to be dashed out
  }
}

/** Calculates the distance in NM between the two waypoints
 * @param fromCoord the start waypoint
 * @param toCoord the end waypoint
 * @returns the distance in NM between the two waypoints
 */
export function getWptsDistance(fromCoord: coordinate, toCoord: coordinate): number {
  const fromGeoPoint = new GeoPoint(fromCoord.lat, fromCoord.lon);
  const distance = UnitType.GA_RADIAN.convertTo(fromGeoPoint.distance(toCoord.lat, toCoord.lon), UnitType.NMILE);
  return distance > 0 ? distance : -1;  // returning -1 deactivates the data field
}

/** Calculates the track in degrees magnetic between the two waypoints
 * @param fromCoord the start waypoint
 * @param toCoord the end waypoint
 * @returns the track in degrees magnetic between the two waypoints
 */
export function getWptsTrack(fromCoord: coordinate, toCoord: coordinate): number {
  const fromGeoPoint = new GeoPoint(fromCoord.lat, fromCoord.lon);
  return fromGeoPoint.bearingTo(toCoord.lat, toCoord.lon);
}

/** Determines the coordinate of the waypoint (latitude, longitude)
 * @param bus the event bus
 * @param name ident of the waypoint
 * @returns the coordinate of the waypoint (latitude, longitude)
 */
export async function getWaypointCoord(bus: EventBus, name: string): Promise<coordinate> {
  if (name === 'P.POS') {
    return {
      lat: SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
      lon: SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree),
    };
  } else {
    const facilityLoader = new FacilityLoader(FacilityRepository.getRepository(bus));
    const matches = await facilityLoader.searchByIdent(FacilitySearchType.All, name, 1);
    const icao = matches[0];
    const facility = await facilityLoader.getFacility(ICAO.getFacilityType(icao), icao);
    return {
      lat: facility.lat,
      lon: facility.lon,
    };
  }
}

/** Calculates the Unix epoch time of a sunset or sunrise based on latitude, longitude, and Unix epoch
 * calculations based on: https://en.wikipedia.org/wiki/Sunrise_equation
 * @param riseOrSet determines if this method returns a sunrise or sunset date object
 * @param latitude latitude in degrees, North is positive, South is negative
 * @param longitude longitude in degrees, East is positive, West is negative
 * @param unixEpoch milliseconds since midnight, January 1st, 1970 UTC
 * @returns a date object for sunrise or sunset time based on latitude, longitude, and epoc time
 */
export function sunDate(riseOrSet: 'rise' | 'set', latitude: number, longitude: number, unixEpoch: number): Date {

  const jDate = (unixEpoch / 86400000) + 2440587.5;  // Julian date
  const nDay = Math.ceil(jDate - 2451545.0 + 0.0008);
  const jStar = nDay - (longitude / 360);
  const mDeg = (357.5291 + (0.98560028 * jStar)) % 360;  // degrees
  const mRad = mDeg * (Math.PI / 180);  // radians
  const C = (1.9148 * Math.sin(mRad)) + (0.02 * Math.sin(mRad)) + (0.0003 * Math.sin(3 * mRad));
  const lamdaDeg = (mDeg + C + 180 + 102.9372) % 360; // degrees
  const lamdaRad = lamdaDeg * (Math.PI / 180);  // radians
  const jTransit = 2451545.0 + jStar + (0.0053 * Math.sin(mRad)) - (0.0069 * Math.sin(2 * lamdaRad));
  const declinationRad = Math.asin(Math.sin(lamdaRad) * Math.sin(23.4397 * (Math.PI / 180))); // raadians
  const hourAngleRad = Math.acos((Math.sin(-0.833 * (Math.PI / 180)) - (Math.sin(latitude * (Math.PI / 180)) * Math.sin(declinationRad))) /
    (Math.cos(latitude * (Math.PI / 180)) * Math.cos(declinationRad))); // radians
  const hourAngleDeg = hourAngleRad * (180 / Math.PI);  // degrees

  const jRise = jTransit - (hourAngleDeg / 360);
  const jSet = jTransit + (hourAngleDeg / 360);

  let millisecondsOffset;
  if (riseOrSet === 'rise') {
    millisecondsOffset = (jRise - jDate) * 24 * 60 * 60 * 1000;
  } else {
    millisecondsOffset = (jSet - jDate) * 24 * 60 * 60 * 1000;
  }

  return new Date(unixEpoch + millisecondsOffset);
}
