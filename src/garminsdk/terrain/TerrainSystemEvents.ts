import { TerrainSystemOperatingMode } from './TerrainSystemTypes';

/**
 * Events published by Garmin terrain alerting systems, keyed by base topic name.
 */
export type BaseTerrainSystemEvents = {
  /** The terrain system type. */
  terrainsys_type: string;

  /** The current terrain system operating mode. */
  terrainsys_operating_mode: TerrainSystemOperatingMode;

  /** The terrain system's active status flags. */
  terrainsys_status_flags: readonly string[];

  /** A status flag was added to the terrain system. */
  terrainsys_status_added: string;

  /** A status flag was removed from the terrain system. */
  terrainsys_status_removed: string;

  /** The terrain system's active inhibit flags. */
  terrainsys_inhibit_flags: readonly string[];

  /** An inhibit flag was added to the terrain system. */
  terrainsys_inhibit_added: string;

  /** An inhibit flag was removed from the terrain system. */
  terrainsys_inhibit_removed: string;

  /** The terrain system's triggered alerts. */
  terrainsys_triggered_alerts: readonly string[];

  /** An alert was triggered by the terrain system. */
  terrainsys_alert_triggered: string;

  /** An alert was untriggered by the terrain system. */
  terrainsys_alert_untriggered: string;

  /** The terrain system's inhibited alerts. */
  terrainsys_inhibited_alerts: readonly string[];

  /** An alert was inhibited by the terrain system. */
  terrainsys_alert_inhibited: string;

  /** An alert was uninhibited by the terrain system. */
  terrainsys_alert_uninhibited: string;

  /** The terrain system's active alerts. */
  terrainsys_active_alerts: readonly string[];

  /** An alert was activated by the terrain system. */
  terrainsys_alert_activated: string;

  /** An alert was deactivated by the terrain system. */
  terrainsys_alert_deactivated: string;

  /** The terrain system's current prioritized active alert. */
  terrainsys_prioritized_alert: string | null;
};

/**
 * Events used to control Garmin terrain alerting systems, keyed by base topic name.
 */
export type BaseTerrainSystemControlEvents = {
  /** Turns the terrain system on. */
  terrainsys_turn_on: void;

  /** Turns the terrain system off. */
  terrainsys_turn_off: void;

  /** Starts a test of the terrain system. */
  terrainsys_start_test: void;

  /** Adds an inhibit flag. */
  terrainsys_add_inhibit: string;

  /** Removes an inhibit flag. */
  terrainsys_remove_inhibit: string;

  /** Removes all inhibit flags. */
  terrainsys_remove_all_inhibits: void;
};

/**
 * The event bus topic suffix for a Garmin terrain alerting system with a specific ID.
 */
export type TerrainSystemEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events published by a Garmin terrain alerting system with a specific ID.
 */
export type TerrainSystemEventsForId<ID extends string> = {
  [P in keyof BaseTerrainSystemEvents as `${P}${TerrainSystemEventSuffix<ID>}`]: BaseTerrainSystemEvents[P];
};

/**
 * All possible events published by Garmin terrain alerting systems.
 */
export interface TerrainSystemEvents extends TerrainSystemEventsForId<''>, TerrainSystemEventsForId<string> {
}

/**
 * Events used to control a Garmin terrain alerting system with a specific ID.
 */
export type TerrainSystemControlEventsForId<ID extends string> = {
  [P in keyof BaseTerrainSystemControlEvents as `${P}${TerrainSystemEventSuffix<ID>}`]: BaseTerrainSystemControlEvents[P];
};

/**
 * All possible events used to control Garmin terrain alerting systems.
 */
export interface TerrainSystemControlEvents extends TerrainSystemControlEventsForId<''>, TerrainSystemControlEventsForId<string> {
}
