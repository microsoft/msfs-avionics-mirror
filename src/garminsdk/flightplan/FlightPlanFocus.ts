import { LatLonInterface, LegDefinition } from '@microsoft/msfs-sdk';

/**
 * A flight plan focus.
 */
export type FlightPlanFocus = readonly LegDefinition[] | LatLonInterface | null;