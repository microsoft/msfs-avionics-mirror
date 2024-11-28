import { BasePublisher, EventBus } from '@microsoft/msfs-sdk';

import { ApproachDetails, Epic2VerticalFlightPhase, FmsSpeedTargetSource, LandingFieldInfo } from './Epic2FmsTypes';

/** Extension of generic ControlEvents to handle Boeing-specific events. */
export interface Epic2FmsEvents {

  //   /** Approach deatils for the autopilot flight plan. Sent on EXEC. Note that the approachIsautopilot field is not kept in sync. */
  // autopilot_approach_details_set: ApproachDetails;

  /** Approach Details Set. Note: This reflects the last approach mod, **not** the autopilot flight plan state. */
  epic2_fms_approach_details_set: ApproachDetails;

  /** Whether or not an approach is available for guidance. */
  epic2_fms_approach_available: boolean;

  /** Whether or not an approach is available for guidance. */
  epic2_fms_landing_field_info: LandingFieldInfo;

  /** Whether or not the VTA alert is autopilot */
  epic2_fms_vertical_track_alert: boolean

  /** The current vertical flight phase */
  epic2_fms_vertical_flight_phase: Epic2VerticalFlightPhase

  /** Event signifying that the end of the flight plan has been reached */
  epic2_fms_end_of_plan_reached: boolean

  // /** Event indicating an autopilot minimums alert */
  // minimums_alert: boolean;

  // /** Indicates whether there is an autopilot radio minimums alert */
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

  // /** An FMS LOC approach is selected in the autopilot plan */
  // boeing_fms_loc_approach_selected: boolean,

  // /** QFE is selected for the approach in the autopilot plan */
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

/**
 * Events related to FMS-computed speed targets.
 */
export interface FmsSpeedEvents {
  /** The name of the performance schedule used by the FMS to compute the current target speed. */
  fms_speed_computed_schedule: string;

  /** The current FMS-computed maximum airspeed, in knots. */
  fms_speed_computed_max_ias: number;

  /** The current FMS-computed maximum mach number. */
  fms_speed_computed_max_mach: number;

  /** Whether the current FMS-computed maximum speed is a mach number. */
  fms_speed_computed_max_is_mach: boolean;

  /** The source of the current FMS-computed maximum speed. */
  fms_speed_computed_max_source: FmsSpeedTargetSource;

  /**
   * The current FMS-computed target indicated airspeed, in knots. A negative value indicates the FMS was unable to
   * compute a speed.
   */
  fms_speed_computed_target_ias: number;

  /** The current FMS-computed target mach number. A negative value indicates the FMS was unable to compute a speed. */
  fms_speed_computed_target_mach: number;

  /** Whether the current FMS-computed target speed is a mach number. */
  fms_speed_computed_target_is_mach: boolean;

  /** The source of the current FMS-computed target speed. */
  fms_speed_computed_target_source: FmsSpeedTargetSource;

  /**
   * The current autopilot FMS target indicated airspeed, in knots. This value may differ from the FMS-computed value if
   * a user override is in place. A negative value indicates there is no autopilot target indicated airspeed.
   */
  fms_speed_autopilot_target_ias: number;

  /**
   * The current autopilot FMS target mach number. This value may differ from the FMS-computed value if a user override is
   * in place. A negative value indicates there is no autopilot target mach number.
   */
  fms_speed_autopilot_target_mach: number;

  /** Whether the current autopilot FMS target speed is a mach number. */
  fms_speed_autopilot_target_is_mach: boolean;
}

/** A control publisher that handles WT21 events too. */
export class Epic2FmsEventsPublisher extends BasePublisher<Epic2FmsEvents> {
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
  public publishEvent<K extends keyof Epic2FmsEvents>(event: K, value: Epic2FmsEvents[K]): void {
    this.publish(event, value, true);
  }
}
