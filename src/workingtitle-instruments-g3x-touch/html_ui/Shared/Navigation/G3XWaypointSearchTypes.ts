import { FacilitySearchType, FacilityWaypoint, IntersectionFacility, NdbFacility, UserFacility, VorFacility } from '@microsoft/msfs-sdk';

import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

/**
 * Supported facility search types for use in a G3X waypoint search.
 */
export type G3XWaypointSearchType =
  FacilitySearchType.Airport |
  FacilitySearchType.Intersection |
  FacilitySearchType.Vor |
  FacilitySearchType.Ndb |
  FacilitySearchType.User |
  FacilitySearchType.AllExceptVisual;

/**
 * A map from G3X waypoint search types to waypoint types.
 */
export type G3XWaypointSearchTypeMap = {
  /** Airports. */
  [FacilitySearchType.Airport]: AirportWaypoint;

  /** VORs. */
  [FacilitySearchType.Vor]: FacilityWaypoint<VorFacility>;

  /** NDBs. */
  [FacilitySearchType.Ndb]: FacilityWaypoint<NdbFacility>;

  /** Intersections. */
  [FacilitySearchType.Intersection]: FacilityWaypoint<IntersectionFacility>;

  /** User waypoints. */
  [FacilitySearchType.User]: FacilityWaypoint<UserFacility>;

  /** All waypoints. */
  [FacilitySearchType.AllExceptVisual]: FacilityWaypoint;
};