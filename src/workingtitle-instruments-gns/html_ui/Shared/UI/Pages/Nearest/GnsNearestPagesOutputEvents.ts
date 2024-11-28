/**
 * Events emitted by the NEAREST page group
 */
export interface GnsNearestPagesOutputEvents {
  /**
   * Selects an airport FS ICAO for display on the WPT APT page
   */
  gns_nearest_pages_select_wpt_apt: string;

  /**
   * Selects an intersection FS ICAO for display on the WPT INT page
   */
  gns_nearest_pages_select_wpt_int: string;

  /**
   * Selects an NDB FS ICAO for display on the WPT NDB page
   */
  gns_nearest_pages_select_wpt_ndb: string;

  /**
   * Selects an VOR FS ICAO for display on the WPT VOR page
   */
  gns_nearest_pages_select_wpt_vor: string;

  /**
   * Selects a USR FS ICAO for display on the WPT VOR page
   */
  gns_nearest_pages_select_wpt_usr: string;
}