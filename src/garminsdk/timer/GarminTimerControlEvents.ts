import { FlightTimerEventSuffix, FlightTimerMode } from '@microsoft/msfs-sdk';

/**
 * Non-indexed events used to control Garmin timers.
 */
export type BaseNonIndexedGarminTimerControlEvents = {
  /** Resets the flight timer. */
  garmin_flt_timer_reset: void;
};

/**
 * Indexed events used to control Garmin timers, keyed by base topic names.
 */
export type BaseIndexedGarminTimerControlEvents = {
  /** Sets the active mode for a generic timer. */
  garmin_gen_timer_set_mode: FlightTimerMode;

  /** Sets the initial and current values, in milliseconds, for a generic timer. Stops the timer if it is running. */
  garmin_gen_timer_set_value: number;

  /** Starts a generic timer. */
  garmin_gen_timer_start: void;

  /** Stops a generic timer. */
  garmin_gen_timer_stop: void;

  /** Resets a generic timer value to its initial value. Stops the timer if it is running. */
  garmin_gen_timer_reset: void;
};

/**
 * Events related to flight timers with a specific ID.
 */
export type GarminTimerControlEventsForId<ID extends string>
  = {
    [P in keyof BaseNonIndexedGarminTimerControlEvents as `${P}${FlightTimerEventSuffix<ID>}`]: BaseNonIndexedGarminTimerControlEvents[P];
  } & {
    [P in keyof BaseIndexedGarminTimerControlEvents as `${P}${FlightTimerEventSuffix<ID>}_${number}`]: BaseIndexedGarminTimerControlEvents[P];
  };

/**
 * All events used to control Garmin timers.
 */
export type GarminTimerControlEvents = GarminTimerControlEventsForId<''> & GarminTimerControlEventsForId<string>;