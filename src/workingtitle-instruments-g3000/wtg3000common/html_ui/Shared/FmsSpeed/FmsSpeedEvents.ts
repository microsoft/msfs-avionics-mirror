import { FmsSpeedTargetSource } from './FmsSpeedTypes';

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
   * The current active FMS target indicated airspeed, in knots. This value may differ from the FMS-computed value if
   * a user override is in place. A negative value indicates there is no active target indicated airspeed.
   */
  fms_speed_active_target_ias: number;

  /**
   * The current active FMS target mach number. This value may differ from the FMS-computed value if a user override is
   * in place. A negative value indicates there is no active target mach number.
   */
  fms_speed_active_target_mach: number;

  /** Whether the current active FMS target speed is a mach number. */
  fms_speed_active_target_is_mach: boolean;
}