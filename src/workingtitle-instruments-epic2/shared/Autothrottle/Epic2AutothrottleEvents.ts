/**
 * Events related to the Epic2 autothrottle.
 */
export interface Epic2AutothrottleEvents {
  /** The status of the autothrottle. */
  epic2_at_status: Epic2AutothrottleStatus;

  /** The name of the armed autothrottle mode. */
  epic2_at_mode_armed: string;

  /** The name of the active autothrottle mode. */
  epic2_at_mode_active: string;

  /** The active target indicated airspeed, in knots. A negative value indicates there is no active target IAS. */
  epic2_at_target_cas: number;

  /** The active target mach number. A negative value indicates there is no active target mach number. */
  epic2_at_target_mach: number;

  /** Autothrottle data to display on the PFD FMA (ACFS status box). */
  epic2_at_fma_data: Readonly<Epic2AutothrottleFmaData>;

  /** Whether the autothrottle is in a failed state. */
  epic2_at_failed: boolean;

  /** Whether the deactivation warning is active (10 seconds for normal disconnect, continuous for abnormal). */
  epic2_at_deactivate_warning: boolean;

  /** The thrust director target thrust in range [0, 1], or null when the thrust director is disabled. */
  epic2_at_target_throttle_speed: number | null;

  /** The commanded thrust in range [0, 1], or null when invalid. */
  epic2_at_commanded_thrust: number | null;
}

/**
 * Statuses for a Epic2 autothrottle.
 */
export enum Epic2AutothrottleStatus {
  Off = 'Off',
  Disconnected = 'Disconnected',
  Armed = 'Armed',
  On = 'On'
}

/**
 * Autothrottle data to display on the PFD FMA (AFCS status box).
 */
export type Epic2AutothrottleFmaData = {
  /** The status of the autothrottle. */
  status: Epic2AutothrottleStatus;

  /** The name of the active autothrottle mode. */
  activeMode: string;

  /** The active target indicated airspeed to display, in knots, or `null` if there is no such value. */
  targetIas: number | null;

  /** The active target mach number to display, or `null` if there is no such value. */
  targetMach: number | null;
};

/**
 * Epic2 autothrottle system modes.
 */
export enum Epic2AutothrottleModes {
  /** Null mode. */
  NONE = '',

  /** Autothrottle servos are disabled to allow throttle to be held in place during takeoff and climb while below 400 feet AGL. */
  HOLD = 'HOLD',

  /** Autothrottle targets takeoff thrust. */
  TO = 'TO',

  /** Autothrottle targets CLB thrust. */
  CLIMB = 'CLIMB',

  // TODO remove
  /** Autothrottle targets idle thrust. */
  DESC = 'DESC',

  /** Autothrottle targets a set airspeed. */
  SPD = 'SPD',

  /** Automatic overspeed protection mode. */
  MAX_SPD = 'MAX SPD',

  /** Automatic underspeed protection mode. */
  MIN_SPD = 'MIN SPD',
}
