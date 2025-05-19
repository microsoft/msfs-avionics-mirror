/**
 * Base events related to barometric transition alerts.
 */
export interface BaseBaroTransitionAlertEvents {
  /** Whether the transition altitude alert is active. */
  baro_transition_alert_altitude_active: boolean;

  /** Whether the transition level alert is active. */
  baro_transition_alert_level_active: boolean;
}

/**
 * Events related barometric transition alerts with a specific ID.
 */
export type SuffixedBaroTransitionAlertEvents<Id extends string> = {
  [P in keyof BaseBaroTransitionAlertEvents as `${P}_${Id}`]: BaseBaroTransitionAlertEvents[P];
};

/**
 * Events related to barometric transition alerts.
 */
export type BaroTransitionAlertEvents = SuffixedBaroTransitionAlertEvents<string>;
