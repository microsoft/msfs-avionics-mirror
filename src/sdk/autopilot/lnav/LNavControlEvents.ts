/**
 * Events used to control LNAV keyed by base topic names.
 */
export interface BaseLNavControlEvents {
  /** Sets whether automatic sequencing of flight plan legs by LNAV is suspended. */
  suspend_sequencing: boolean;

  /** Sets whether LNAV should automatically inhibit the next attempt to sequence to the next flight plan leg. */
  lnav_inhibit_next_sequence: boolean;

  /** Whether LNAV can freely sequence into the missed approach. */
  activate_missed_approach: boolean;
}

/**
 * Events used to control LNAV keyed by indexed topic names.
 */
export type IndexedLNavControlEvents<Index extends number = number> = {
  [P in keyof BaseLNavControlEvents as `${P}_${Index}`]: BaseLNavControlEvents[P];
};

/**
 * Events used to control LNAV.
 */
export type LNavControlEvents = BaseLNavControlEvents & IndexedLNavControlEvents;