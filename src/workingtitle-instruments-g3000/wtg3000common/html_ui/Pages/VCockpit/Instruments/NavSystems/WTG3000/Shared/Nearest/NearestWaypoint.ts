import { FacilityType, FacilityWaypoint, IntersectionFacility, NdbFacility, UserFacility, VorFacility } from '@microsoft/msfs-sdk';
import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

/**
 * Types of facilities associated with nearest waypoints.
 */
export type NearestWaypointFacilityType = Extract<
  FacilityType,
  FacilityType.Airport | FacilityType.VOR | FacilityType.NDB | FacilityType.Intersection | FacilityType.USR
>;

/**
 * A map from nearest facility types to waypoint types.
 */
export type NearestWaypointTypeMap = {
  /** Airports. */
  [FacilityType.Airport]: AirportWaypoint;

  /** VORs. */
  [FacilityType.VOR]: FacilityWaypoint<VorFacility>;

  /** NDBs. */
  [FacilityType.NDB]: FacilityWaypoint<NdbFacility>;

  /** Intersections. */
  [FacilityType.Intersection]: FacilityWaypoint<IntersectionFacility>;

  /** User waypoints. */
  [FacilityType.USR]: FacilityWaypoint<UserFacility>;
};