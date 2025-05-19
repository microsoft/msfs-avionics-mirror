import { GpwsVisualAlertType } from './GpwsAlertController';
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
  gpws_steep_approach_mode: boolean;

  /** The currently active visual alert */
  gpws_visual_alert: GpwsVisualAlertType | null;
}

/** Events used for controlling the GPWS */
export interface GpwsControlEvents {
  /** Whether the terrain inhibit should be active */
  terrain_inhibit_active: boolean;

  /** Whether the glideslope inhibit should be active */
  gs_inhibit_active: boolean;

  /** Whether the flap override should be active */
  flap_override_active: boolean;
}