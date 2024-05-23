import { AirportFacility, Subscribable } from '@microsoft/msfs-sdk';

import { G3XFmsFplLoadedApproachData } from './G3XFmsFplUserDataTypes';

/**
 * A store containing information about a flight plan.
 */
export interface FlightPlanStore {
  /** The name of the flight plan, or `null` if the plan does not have a name. */
  readonly name: Subscribable<string | null>;

  /** The flight plan's origin airport, or `null` if the flight plan does not have an origin. */
  readonly originAirport: Subscribable<AirportFacility | null>;

  /** The flight plan's destination airport, or `null` if the flight plan does not have a destination. */
  readonly destinationAirport: Subscribable<AirportFacility | null>;

  /**
   * Data describing the flight plan's loaded VFR approach, or `null` if the flight plan does not have a loaded VFR
   * approach or does not support VFR approaches.
   */
  readonly loadedVfrApproachData: Subscribable<Readonly<G3XFmsFplLoadedApproachData> | null>;

  /**
   * The activation status of the flight plan's loaded VFR approach.
   * 
   * * `none`: the approach is not active.
   * * `active`: the approach is active.
   * * `vtf`: the approach is active in vectors-to-final (VTF) form.
   * 
   * If the flight plan has no loaded VFR approach, then the status will be `none`.
   */
  readonly vfrApproachActiveStatus: Subscribable<'none' | 'active' | 'vtf'>;
}