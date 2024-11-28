import { EventBus, PublishPacer, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * SimVar names for Garmin autopilot data.
 */
export enum GarminAPVars {
  /** Whether the autopilot NAV mode is on. */
  NavModeOn = 'L:WTAP_Garmin_Nav_Mode_On',

  /** Whether the autopilot approach mode is on. */
  ApproachModeOn = 'L:WTAP_Garmin_Approach_Mode_On',
}

/**
 * Garmin autopilot events derived from SimVars.
 */
export interface GarminAPSimVarEvents {
  /** Whether the autopilot NAV mode is on. */
  ap_garmin_nav_mode_on: boolean;

  /** Whether the autopilot approach mode is on. */
  ap_garmin_approach_mode_on: boolean;
}

/**
 * Events related to Garmin autopilots.
 */
export type GarminAPEvents = GarminAPSimVarEvents;

/**
 * A publisher for Garmin autopilot events derived from SimVars.
 */
export class GarminAPSimVarPublisher extends SimVarPublisher<GarminAPSimVarEvents> {
  /**
   * Creates a new instance of GarminAPSimVarPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the pace of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<GarminAPSimVarEvents>) {
    super([
      ['ap_garmin_nav_mode_on', { name: GarminAPVars.NavModeOn, type: SimVarValueType.Bool }],
      ['ap_garmin_approach_mode_on', { name: GarminAPVars.ApproachModeOn, type: SimVarValueType.Bool }],
    ], bus, pacer);
  }
}
