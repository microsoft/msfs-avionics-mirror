import { BaseLNavDataEvents } from '@microsoft/msfs-sdk';

/**
 * Valid CDI scale labels for the LVar scale enum.
 */
export enum CDIScaleLabel {
  Departure,
  Terminal,
  TerminalDeparture,
  TerminalArrival,
  Enroute,
  Oceanic,
  Approach,
  MissedApproach
}

/**
 * Events related to WT21 LNAV data.
 */
export interface WT21LNavDataEvents extends BaseLNavDataEvents {
  /** The global leg index of the flight plan leg that is nominally being tracked by LNAV. */
  lnavdata_nominal_leg_index: number;

  /** The current CDI scale label. */
  lnavdata_cdi_scale_label: CDIScaleLabel;

  /** The straight-line distance between the present position and the destination, in nautical miles. */
  lnavdata_destination_distance_direct: number;

  /** The flight plan distance to the final approach fix, in nautical miles. */
  lnavdata_distance_to_faf: number;
}
