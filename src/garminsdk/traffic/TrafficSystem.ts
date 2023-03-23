import { Adsb, Tcas } from '@microsoft/msfs-sdk';

import { TrafficSystemType } from './TrafficSystemType';

/**
 * A Garmin traffic system.
 */
export interface TrafficSystem extends Tcas {
  /** The type of this traffic system. */
  readonly type: TrafficSystemType;

  /** The ADS-B system used by this traffic system, or `null` if this system does not support ADS-B. */
  readonly adsb: Adsb | null;

  /**
   * Checks whether this traffic system is powered.
   * @returns Whether this traffic system is powered.
   */
  isPowered(): boolean;

  /**
   * Sets whether this traffic system is powered.
   * @param isPowered Whether the system is powered.
   */
  setPowered(isPowered: boolean): void;
}