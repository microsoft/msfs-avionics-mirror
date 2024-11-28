import { ObsSuspModes } from '@microsoft/msfs-garminsdk';

/**
 * Events for OBS status specific to the GNS
 */
export interface GnsObsEvents {
  /**
   * OBS/SUSP mode
   */
  obs_susp_mode: ObsSuspModes,
}