import { NavDataFieldType } from '../../navdatafield/NavDataFieldType';

/**
 * A type of data field supported by the navigation status box.
 */
export type NavStatusBoxFieldType
  = NavDataFieldType.BearingToWaypoint
  | NavDataFieldType.DistanceToWaypoint
  | NavDataFieldType.TimeToWaypoint;