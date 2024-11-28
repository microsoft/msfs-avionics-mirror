import { GpwsOperatingMode } from './GpwsTypes';

/**
 * Events related to GPWS data.
 */
export interface GpwsEvents {
  /** The current GPWS operating mode. */
  gpws_operating_mode: GpwsOperatingMode;

  /** Whether GPWS has a valid position fix for the airplane. */
  gpws_is_pos_valid: boolean;

  /** The geometric altitude of the airplane, in feet. */
  gpws_geo_altitude: number;

  /** The geometric vertical speed of the airplane, in feet per minute. */
  gpws_geo_vertical_speed: number;

  /**
   * The geometric altitude (elevation) of the nearest runway to the airplane, in feet, or `null` if nearest runway
   * data are not available.
   */
  gpws_nearest_runway_altitude: number | null;

  /** Whether steep approach mode is active */
  gpws_steep_approach_mode: boolean
}
