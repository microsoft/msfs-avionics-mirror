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
 * Events related to Garmin VNAV data.
 */
export interface VNavDataEvents extends BaseVNavDataEvents {
  /** The current VNAV cruise altitude, in feet. */
  vnav_cruise_altitude: number;

  /** The current VNAV flight phase. */
  vnav_flight_phase: GarminVNavFlightPhase;

  /** The current VNAV tracking phase. */
  vnav_tracking_phase: GarminVNavTrackingPhase;

  /** The global index of the leg that contains the active VNAV constraint. */
  vnav_active_constraint_global_leg_index: number;
}