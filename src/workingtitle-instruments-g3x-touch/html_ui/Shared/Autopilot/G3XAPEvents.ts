import { APLateralModes, APVerticalModes, NavRadioIndex } from '@microsoft/msfs-sdk';

import { G3XExternalNavigatorIndex } from '../CommonTypes';

/**
 * Events related to autopilot nav-to-nav guidance from G3X external navigators, keyed by base topic names.
 */
export interface BaseG3XAPNavToNavEvents {
  /**
   * The index of the NAV radio that can be armed for a CDI source switch on an external navigator, or `-1` if CDI
   * source switch cannot be armed.
   */
  g3x_external_nav_to_nav_armable_nav_radio_index: NavRadioIndex | -1;

  /**
   * The autopilot lateral mode that can be armed prior to a CDI source switch on an external navigator, or
   * `APLateralModes.NONE` if no mode can be armed.
   */
  g3x_external_nav_to_nav_armable_lateral_mode: APLateralModes;

  /**
   * The autopilot vertical mode that can be armed prior to a CDI source switch on an external navigator, or
   * `APVerticalModes.NONE` if no mode can be armed.
   */
  g3x_external_nav_to_nav_armable_vertical_mode: APVerticalModes;

  /** Whether a CDI source switch is currently allowed for an an external navigator. */
  g3x_external_nav_to_nav_can_switch: boolean;

  /** Whether an external navigator is currently automatically switching its CDI source. */
  g3x_external_nav_to_nav_external_switch_in_progress: boolean;
}

/**
 * Events related to autopilot nav-to-nav guidance from an indexed G3X external navigators, keyed by indexed topic names.
 */
export type IndexedG3XAPNavToNavEvents<Index extends G3XExternalNavigatorIndex = G3XExternalNavigatorIndex> = {
  [P in keyof BaseG3XAPNavToNavEvents as `${P}_${Index}`]: BaseG3XAPNavToNavEvents[P];
}

/**
 * All events related to the G3X autopilot.
 */
export type G3XAPEvents = IndexedG3XAPNavToNavEvents<G3XExternalNavigatorIndex>;
