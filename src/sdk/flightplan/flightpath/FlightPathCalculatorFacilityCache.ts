import { Facility } from '../../navigation/Facilities';
import { IcaoValue } from '../../navigation/Icao';

/**
 * A cache of facilities for use in flight path calculations.
 */
export interface FlightPathCalculatorFacilityCache {
  /**
   * Gets a facility from its ICAO.
   * @param icao The ICAO value of the facility to get.
   * @returns The requested facility, or `undefined` if the facility is not present in this cache.
   */
  getFacility(icao: IcaoValue): Facility | undefined;
}
