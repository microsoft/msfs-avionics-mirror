/**
 * An index for a throttle controlled by an autothrottle system.
 */
export type AutothrottleThrottleIndex = 1 | 2 | 3 | 4;

/**
 * Autothrottle target modes.
 */
export enum AutothrottleTargetMode {
  /** No target. */
  None = 'None',

  /** Autothrottle targets a specific airspeed. */
  Speed = 'Speed',

  /** Autothrottle targets a specific engine power setting. */
  Power = 'Power',

  /** Autothrottle targets a specific throttle lever position. */
  ThrottlePos = 'ThrottlePos'
}

/**
 * Autothrottle-related events.
 */
export interface AutothrottleEvents {
  /** Whether the autothrottle is active. */
  at_master_is_active: boolean;

  /** Whether the autothrottle's overspeed protection is active. */
  at_overspeed_prot_is_active: boolean;

  /** Whether the autothrottle's underspeed protection is active. */
  at_underspeed_prot_is_active: boolean;

  /** Whether the autothrottle's overpower protection is active. */
  at_overpower_prot_is_active: boolean;

  /** Autothrottle target mode. */
  at_target_mode: AutothrottleTargetMode;

  /** Autothrottle selected indicated airspeed, in knots. */
  at_selected_ias: number;

  /** Autothrottle selected mach number. */
  at_selected_mach: number;

  /** Whether autothrottle is targeting selected mach number instead of indicated airspeed. */
  at_selected_speed_is_mach: boolean;

  /** Autothrottle selected engine power. */
  at_selected_power: number;

  /** Autothrottle selected normalized throttle lever position. */
  at_selected_throttle_pos: number;

  /** The maximum indicated airspeed, in knots, allowed by the autothrottle. */
  at_max_ias: number;

  /** The maximum mach number allowed by the autothrottle. */
  at_max_mach: number;

  /** The minimum indicated airspeed, in knots, allowed by the autothrottle. */
  at_min_ias: number;

  /** The minimum mach number allowed by the autothrottle. */
  at_min_mach: number;

  /** The maximum engine power allowed by the autothrottle. */
  at_max_power: number;

  /** The maximum normalized throttle lever position allowed by the autothrottle. */
  at_max_throttle_pos: number;

  /** The minimum normalized throttle lever position allowed by the autothrottle. */
  at_min_throttle_pos: number;

  /** Whether the autothrottle servo for engine throttle 1 is active. */
  at_servo_1_is_active: boolean;

  /** Whether the autothrottle servo for engine throttle 2 is active. */
  at_servo_2_is_active: boolean;

  /** Whether the autothrottle servo for engine throttle 3 is active. */
  at_servo_3_is_active: boolean;

  /** Whether the autothrottle servo for engine throttle 4 is active. */
  at_servo_4_is_active: boolean;
}