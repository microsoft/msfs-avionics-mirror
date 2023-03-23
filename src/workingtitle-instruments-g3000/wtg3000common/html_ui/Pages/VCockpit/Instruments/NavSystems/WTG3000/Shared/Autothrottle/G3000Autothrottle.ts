/**
 * Statuses for a G3000 autothrottle.
 */
export enum G3000AutothrottleStatus {
  Off = 'Off',
  Disconnected = 'Disconnected',
  Armed = 'Armed',
  On = 'On'
}

/**
 * Autothrottle data to display on the PFD FMA (AFCS status box).
 */
export type G3000AutothrottleFmaData = {
  /** The status of the autothrottle. */
  status: G3000AutothrottleStatus;

  /** The name of the armed autothrottle mode. */
  armedMode: string;

  /** The name of the active autothrottle mode. */
  activeMode: string;

  /** Whether the active autothrottle mode is a failure mode. */
  isActiveModeFail: boolean;

  /** The active target indicated airspeed to display, in knots, or `null` if there is no such value. */
  targetIas: number | null;

  /** The active target mach number to display, or `null` if there is no such value. */
  targetMach: number | null;
};

/**
 * Events related to a G3000 autothrottle.
 */
export interface G3000AutothrottleEvents {
  /** The status of the autothrottle. */
  g3000_at_status: G3000AutothrottleStatus;

  /** The name of the armed autothrottle mode. */
  g3000_at_mode_armed: string;

  /** The name of the active autothrottle mode. */
  g3000_at_mode_active: string;

  /** The active target indicated airspeed, in knots. A negative value indicates there is no active target IAS. */
  g3000_at_target_ias: number;

  /** The active target mach number. A negative value indicates there is no active target mach number. */
  g3000_at_target_mach: number;

  /** Autothrottle data to display on the PFD FMA (ACFS status box). */
  g3000_at_fma_data: Readonly<G3000AutothrottleFmaData>;
}