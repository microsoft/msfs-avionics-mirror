import { Adsb, Tcas } from 'msfssdk';

import { TrafficSystemType } from './TrafficSystemType';

/**
 * A Garmin traffic system.
 */
export interface TrafficSystem extends Tcas {
  /** The type of this traffic system. */
  readonly type: TrafficSystemType;

  /** The ADS-B system used by this traffic system, or `null` if this system does not support ADS-B. */
  readonly adsb: Adsb | null;
}