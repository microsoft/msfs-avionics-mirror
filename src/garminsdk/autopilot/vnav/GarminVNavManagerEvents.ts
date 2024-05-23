/**
 * Events published by Garmin VNAV managers.
 */
export interface GarminVNavManagerEvents {
  /** The VNAV manager was activated. */
  vnav_manager_activated: void;

  /** The VNAV manager was deactivated. */
  vnav_manager_deactivated: void;
}