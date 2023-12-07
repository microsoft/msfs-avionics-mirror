import { APConfig } from '@microsoft/msfs-sdk';

/**
 * A Garmin Autopilot Configuration.
 */
export interface GarminAPConfigInterface extends APConfig {
  /**
   * Whether the autopilot should use mach number calculated from the impact pressure derived from indicated airspeed
   * and ambient pressure instead of the true mach number.
   */
  readonly useIndicatedMach: boolean;
}