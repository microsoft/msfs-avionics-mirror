import { FacilitySearchType } from '@microsoft/msfs-sdk';

/** Supported {@link FacilitySearchType}s for use in a G3000 waypoint search. */
export type G3000WaypointSearchType =
  FacilitySearchType.Airport |
  FacilitySearchType.Intersection |
  FacilitySearchType.Vor |
  FacilitySearchType.Ndb |
  FacilitySearchType.User |
  FacilitySearchType.AllExceptVisual
  ;
