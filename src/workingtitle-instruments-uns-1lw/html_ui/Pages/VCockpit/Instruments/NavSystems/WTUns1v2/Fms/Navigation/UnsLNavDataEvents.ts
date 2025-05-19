import { BaseLNavDataEvents } from '@microsoft/msfs-sdk';

import { UnsFlightAreas } from '../UnsFlightAreas';

/**
 * Events derived from Epic 2 LNAV-related data sim vars.
 */
export interface BaseUnsLNavDataEvents extends Omit<BaseLNavDataEvents, 'lnavdata_waypoint_ident'> {
  /** The global leg index of the flight plan leg that is nominally being tracked by LNAV. */
  lnavdata_nominal_leg_index: number;

  /** The current CDI scale label. */
  lnavdata_flight_area: UnsFlightAreas;

  /** The straight-line distance between the present position and the destination, in nautical miles. */
  lnavdata_destination_distance_direct: number;

  /** The flight plan distance to the final approach fix, in nautical miles. */
  lnavdata_distance_to_faf: number;
}

/**
 * Events derived from LNAV SimVars keyed by indexed topic names.
 */
export type IndexedUnsLNavDataEvents<Index extends number = number> = {
  [P in keyof BaseUnsLNavDataEvents as `${P}_${Index}`]: BaseUnsLNavDataEvents[P];
};

/**
 * UNS-1 LNAV data events
 */
export type UnsLNavDataEvents = BaseUnsLNavDataEvents & IndexedUnsLNavDataEvents
