import { BasePublisher, EventBus } from '@microsoft/msfs-sdk';

import { ApproachDetails } from './UnsFmsTypes';


/** Extension of generic ControlEvents to handle Boeing-specific events. */
export interface UnsFmsEvents {

  //   /** Approach deatils for the active flight plan. Sent on EXEC. Note that the approachIsActive field is not kept in sync. */
  // active_approach_details_set: ApproachDetails;

  /** Approach Details Set. Note: This reflects the last approach mod, **not** the active flight plan state. */
  epic2_fms_approach_details_set: ApproachDetails;

  /** Whether or not an approach is available for guidance. */
  epic2_fms_approach_available: boolean;

  // /** Event indicating an active minimums alert */
  // minimums_alert: boolean;

  // /** Indicates whether there is an active radio minimums alert */
  // radio_minimums_alert: boolean;

  // /** Event for updating the altitude alert state */
  // altitude_alert: AltAlertState;

  // /** Event indicating current lateral source */
  // lateral_nav_source: NavigationSource;

  // /** Event indicating current vertical source */
  // vertical_nav_source: NavigationSource;

  // /** Approach frequency does not match the tuned frequency */
  // approach_frequency_mismatch: boolean;

  // /** Approach course does not match the tuned course */
  // approach_course_mismatch: boolean;

  // /** Approach frequency was manually tuned on the CDU in MHz (null when cleared/deleted) */
  // approach_frequency_manually_tuned: number | null;

  // /** Approach frequency tuning mode set */
  // approach_tuning_mode: ApproachTuningMode,

  // /** Whether approach tuning is inhibited (while landing or HUD TO/GA) */
  // approach_tuning_inhibited: boolean,

  // /** Manually set vor frequency for left side */
  // set_manual_vor_freq_left: number | null,

  // /** Manually set vor frequency for right side */
  // set_manual_vor_freq_right: number | null,

  // /** VOR tuning mode for left receiver */
  // vor_tuning_mode_left: VorTuningMode,

  // /** VOR tuning mode for right receiver */
  // vor_tuning_mode_right: VorTuningMode,

  // /** current autoland capability */
  // autoland_capability: AutolandCapability,

  // /** Glideslope is selected (use IAN G/P instead when de-selected) */
  // boeing_glideslope_selected: boolean,

  // /** An FMS LOC approach is selected in the active plan */
  // boeing_fms_loc_approach_selected: boolean,

  // /** QFE is selected for the approach in the active plan */
  // boeing_qfe_approach_selected: boolean,

  // /** HUD takeoff runway, or null if deselected */
  // boeing_hud_takeoff_runway_set: OneWayRunway | null,

  // /**
  //  * Opens the MCP speed window, setting the speed target in KCAS, or current speed if undefined,
  //  * with automatic cas/mach selection in both cases.
  //  */
  // mcp_speed_open: number | null,

  // /** Closes the MCP speed window. */
  // mcp_speed_close: unknown,
}

/** A control publisher that handles WT21 events too. */
export class Epic2FmsEventsPublisher extends BasePublisher<UnsFmsEvents> {
  /**
   * Create a ControlPublisher.
   * @param bus The EventBus to publish to.
   */
  public constructor(bus: EventBus) {
    super(bus);
  }

  /**
   * Publish a control event.
   * @param event The event from ControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof UnsFmsEvents>(event: K, value: UnsFmsEvents[K]): void {
    this.publish(event, value, true);
  }
}
