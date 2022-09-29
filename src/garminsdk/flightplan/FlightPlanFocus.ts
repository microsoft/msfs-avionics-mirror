import { LatLonInterface, LegDefinition } from 'msfssdk';

/**
 * A flight plan focus.
 */
export type FlightPlanFocus = readonly LegDefinition[] | LatLonInterface | null;