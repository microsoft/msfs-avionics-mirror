import { VNavDataEvents as BaseVNavDataEvents } from '@microsoft/msfs-sdk';

/**
 * Garmin VNAV flight phases.
 */
export enum GarminVNavFlightPhase {
  None = 'None',
  Climb = 'Climb',
  Cruise = 'Cruise',
  Descent = 'Descent'
}

/**
 * Garmin VNAV tracking phases.
 */
export enum GarminVNavTrackingPhase {
  None = 'None',
  Climb = 'Climb',
  Cruise = 'Cruise',
  Descent = 'Descent',
  MissedApproach = 'MissedApproach'
}

/**
 * Garmin VNAV track alert types.
 */
export enum GarminVNavTrackAlertType {
  TodOneMinute = 'TodOneMinute',
  BodOneMinute = 'BodOneMinute',
  TocOneMinute = 'TocOneMinute',
  BocOneMinute = 'BocOneMinute'
}

/**
 * Garmin VNAV-related data events keyed by base topic names.
 */
export interface BaseGarminVNavDataEvents extends BaseVNavDataEvents {
  /** The current VNAV cruise altitude, in feet. */
  vnav_cruise_altitude: number;

  /** The current VNAV flight phase. */
  vnav_flight_phase: GarminVNavFlightPhase;

  /** The current VNAV tracking phase. */
  vnav_tracking_phase: GarminVNavTrackingPhase;

  /** The global index of the leg that contains the active VNAV constraint. */
  vnav_active_constraint_global_leg_index: number;

  /** A VNAV track alert has been issued. */
  vnav_track_alert: GarminVNavTrackAlertType;
}

/**
 * Garmin VNAV-related data events keyed by indexed topic names.
 */
export type IndexedGarminVNavDataEvents<Index extends number = number> = {
  [P in keyof BaseGarminVNavDataEvents as `${P}_${Index}`]: BaseGarminVNavDataEvents[P];
};

/**
 * Events related to Garmin VNAV data.
 */
export interface GarminVNavDataEvents extends BaseGarminVNavDataEvents, IndexedGarminVNavDataEvents {
}

/**
 * Events related to Garmin VNAV data.
 * @deprecated
 */
export type VNavDataEvents = GarminVNavDataEvents;
