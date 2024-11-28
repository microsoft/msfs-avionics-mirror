import { BaseLNavDataEvents } from '@microsoft/msfs-sdk';

import { Epic2FlightArea } from '../Autopilot/Epic2FlightAreaComputer';

/**
 * Events related to Epic 2 LNAV data.
 */
export interface Epic2LNavDataEvents extends BaseLNavDataEvents {
  /** The global leg index of the flight plan leg that is nominally being tracked by LNAV. */
  lnavdata_nominal_leg_index: number;

  /** The current CDI scale label. */
  lnavdata_flight_area: Epic2FlightArea;

  /** The straight-line distance between the present position and the destination, in nautical miles. */
  lnavdata_destination_distance_direct: number;

  /** The flight plan distance to the final approach fix, in nautical miles. */
  lnavdata_distance_to_faf: number;

  /** The CDI scale, or RNP, in nautical miles. */
  lnavdata_cdi_scale: number;

  /** Whether the aircraft is currently holding */
  lnavdata_is_holding: boolean
}
