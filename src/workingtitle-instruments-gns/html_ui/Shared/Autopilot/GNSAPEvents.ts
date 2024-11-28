import { APLateralModes, APVerticalModes, NavRadioIndex } from '@microsoft/msfs-sdk';

/**
 * Events related to the GNS autopilot.
 */
export interface GNSAPEvents {
  /** The FMS flight phase approach is active flag of a GNS navigator, indexed by the navigator's NAV radio index. */
  [gns_ap_approach_active: `gns_ap_approach_active_${number}`]: boolean;

  /**
   * The index of the NAV radio that can be armed for a CDI source switch on a GNS navigator, indexed by the
   * navigator's NAV radio index.
   */
  [gns_ap_nav_to_nav_armable_nav_radio_index: `gns_ap_nav_to_nav_armable_nav_radio_index_${number}`]: NavRadioIndex | -1;

  /**
   * The autopilot lateral mode that can be armed prior to a CDI source switch on a GNS navigator, indexed by the
   * navigator's NAV radio index.
   */
  [gns_ap_nav_to_nav_armable_lateral_mode: `gns_ap_nav_to_nav_armable_lateral_mode_${number}`]: APLateralModes;

  /**
   * The autopilot vertical mode that can be armed prior to a CDI source switch on a GNS navigator, indexed by the
   * navigator's NAV radio index.
   */
  [gns_ap_nav_to_nav_armable_vertical_mode: `gns_ap_nav_to_nav_armable_vertical_mode_${number}`]: APVerticalModes;

  /**
   * Whether a GNS navigator is currently automatically switching its CDI source, indexed by the navigator's NAV radio
   * index.
   */
  [gns_ap_nav_to_nav_external_switch_in_progress: `gns_ap_nav_to_nav_external_switch_in_progress_${number}`]: boolean;
}
