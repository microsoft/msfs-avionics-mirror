import { VNavDataEvents } from '@microsoft/msfs-sdk';

/**
 * WT21 VNAV data events
 */
export interface WT21VNavDataEvents extends VNavDataEvents {
  /**
   * Global leg index on which the DES advisory sits. `-1` -> no DES advisory relevant
   */
  wt21vnav_des_advisory_global_leg_index: number;

  /**
   * Distance from end of route to DES advisory position, in meters. `-1` -> no DES advisory relevant
   */
  wt21vnav_des_advisory_distance: number;

  /**
   * Distance from end of leg to DES advisory on the leg at {@link wt21vnav_des_advisory_global_leg_index}, in meters.
   * `-1` -> no DES advisory relevant
   */
  wt21vnav_des_advisory_leg_distance: number;
}
