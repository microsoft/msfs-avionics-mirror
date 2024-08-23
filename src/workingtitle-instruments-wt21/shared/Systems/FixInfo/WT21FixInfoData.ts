// Fix Info Data Structures

import { Facility, GeoPoint, GeoPointInterface } from '@microsoft/msfs-sdk';

/** Fix Info Calculated Data for the CDU */
export interface WT21FixInfoCalculatedData {
  /** Identifier of the fix, or null if this page is unused */
  fixIdent: string | null,
  /** Bearing (magnetic or true degrees depending on ref) */
  fixBearing: number | null,
  /** Distance (NM) from the fix to the plane */
  fixDistance: number | null,
  /**
   * Bearing/distance/eta/dtg/alt predictions
   * There will be {@link WT21FixInfoOptions.numberOfBearingDistances} tuples.
   */
  bearingDistancePredictions: BearingDistPredictions[],
  /**
   * Bearing/distance/eta/dtg/alt predictions for lat/lon crossings.
   * There will be {@link WT21FixInfoOptions.numberOfLatLonCrossings} tuples.
   */
  latitudeLongitudePredictions: LatLonPredictions[],
  /** Have we attempted to find an abeam point? reset to false when the abeam point cannot be found, or is passed by the aircraft */
  abeamCalculated: boolean,
  /** Abeam intersection bearing/distance/eta/dtg/alt predictions */
  abeamPredictions: BearingDistPredictions,
  /** Predicted distance in metres to the eta or altitude, or null if no prediction */
  etaAltitudePrediction: number | null,
}

/**
 * Fix Info Time/Altitude Markers for Display on ND.
 * When the prediction is for an altitude, {@link altitude} will be non-null,
 * or when it is for an ETA, {@link estimatedTimeOfArrival} will be non-null.
 */
export interface WT21FixInfoMarker {
  /** Geographical location of the marker */
  location: GeoPoint,
  /** Altitude in feet if this is an altitude prediction, else null */
  altitude: number | null,
  /** ETA as a JS timestamp in milliseconds if this is a time prediction, else null */
  estimatedTimeOfArrival: number | null,
}

/** Fix Info Waypoint for Display on ND */
export interface WT21FixInfoWaypoint {
  /** The identifier to show alongside the waypoint */
  fixIdent: string,
  /** ICAO of the fix */
  fixIcao: string,
  /** Location of the waypoint */
  location: GeoPointInterface,
  /** Radii of the dashed circles around the waypoint in meters */
  circleRadii: number[],
  /** Bearings for dashed radial lines from the waypoint in degrees true */
  bearings: number[],
  /** Abeam intersection points */
  abeamIntersections: GeoPointInterface[],
  /** Flight path intersection points */
  intersections: GeoPointInterface[],
  /** Magnetic variation/station declination for calculating the bearing labels */
  magVar: number,
}

// ---- interal structures below ----

/**
 * Fix Info data that is synced across the bus in flight plan user data.
 * The abeam and bearing/distance data belongs to the fix, and is erased if the fix is cleared or replace.
 * The predicated time or altitude data belongs only to the page.
 * **For fix info internal use only!**
 */
export interface WT21FixInfoFlightPlanData {
  /**
   * The reference fix for the page.
   * Can be airport, navaid, waypoint, pilot waypoint, lat/lon, P/B/D, PB/PB, along track waypoint/airway intersection,
   * or reporting point from route.
   */
  fixIcao: string | null,
  /** Up to {@link WT21FixInfoOptions.numberOfBearingDistances} bearings entered, [bearing in degrees true, distance in metres] */
  bearingDistances: ([number | null, number | null])[],
  /** Up to {@link WT21FixInfoOptions.numberOfLatLonCrossings} lat or lon crossings entered, [latitude degrees, longitude degrees] */
  latitudeLongitudes: ([number | null, number | null])[],
  /** Time to predict distance for as a JS timestamp (ms since unix epoch), mutually exclusive with predictedAltitude */
  predictedTime: number | null,
  /** Time to predict distance for in metres MSL, mutually exclusive with predictedTime */
  predictedAltitude: number | null,
  /** Whether the abeam point should be calculated for this fix info */
  calculateAbeamPoint: boolean,
}

/**
 * An intersection from an origin point to the flight plan.
 * This data is saved when the intersection is calculated.
 * It is only re-calculated if the flight plan changes.
 * **For fix info internal use only!**
 */
export interface FlightPlanIntersection {
  /** Flight Plan Leg on which the intersection exists */
  flightPlanLeg: number | null,
  /** Distance along the flight plan leg */
  distanceAlongLeg: number | null,
  /** Intersection latitude, or null */
  point: GeoPoint,
}

/**
 * Container for data that we store/cache locally, but don't sync through the flightplan.
 * **For fix info internal use only!**
 */
export interface WT21FixInfoData extends WT21FixInfoFlightPlanData {
  /** The reference fix for the page. */
  fix: Facility | null,
  /** Ident of the fix */
  fixIdent: string | null,
  /** Location of the fix in spherical coordinates */
  fixLocationSpherical: GeoPoint,
  /** Location of the fix in cartesian coordinates */
  fixLocationCartesian: Float64Array,
  /** magnetic variation/station declination for the fix */
  fixMagVar: number,
  /** The calculated bearing/distance intersection data */
  bearingDistanceIntersections: FlightPlanIntersection[],
  /** The calculated latitude/longitude crossing intersection data */
  latitudeLongitudeIntersections: FlightPlanIntersection[],
  /** The calculated abeam intersection data */
  abeamIntersection: FlightPlanIntersection,
  /** The point predicted to reach the ETA/Altitude */
  etaAltitudePoint: GeoPoint,
}

/** Bearing/Distance prediction container */
export interface BearingDistPredictions {
  /** Bearing in degrees, true or magnetic depending on selected reference */
  bearing: number | null,
  /** Distance in metres */
  distance: number | null,
  /** Estimated time of arrival as a JS timestamp (ms since unix epoch) */
  eta: number | null,
  /** Distance to go in nautical miles */
  dtg: number | null,
  /** Altitude in metres */
  altitude: number | null,
  /** Remaining fuel in pounds */
  fuelOnBoard: number | null,
}

/** Latitude/Longitude crossing prediction container. */
export interface LatLonPredictions {
  /** Latitude of the crossing in degrees. */
  latitude: number | null,
  /** Longitude of the crossing in degrees. */
  longitude: number | null,
  /** Estimated time of arrival as a JS timestamp (ms since unix epoch) */
  eta: number | null,
  /** Distance to go in nautical miles */
  dtg: number | null,
  /** Altitude in metres */
  altitude: number | null,
  /** Remaining fuel in pounds */
  fuelOnBoard: number | null,
}
