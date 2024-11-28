/**
 * Garmin ESP operating modes.
 */
export enum EspOperatingMode {
  /** The system is off. */
  Off = 'Off',

  /**
   * The system is on, but arming is inhibited due to autopilot engagement, violation of an arming limit, or other
   * external factors.
   */
  Disarmed = 'Disarmed',

  /** The system is on and can apply force to controls as necessary. */
  Armed = 'Armed',

  /** The system is on and armed but is prevented from being able to apply force to controls due to pilot action. */
  Interrupted = 'Interrupted',

  /** The system has failed. */
  Failed = 'Failed'
}

/**
 * Data provided by Garmin ESP systems to modules.
 */
export type EspData = {
  /** The current real (operating system) time, as a Javascript timestamp. */
  realTime: number;

  /** The current sim time, as a Javascript timestamp. */
  simTime: number;

  /** The current simulation rate factor. */
  simRate: number;

  /** Whether ESP arming is inhibited. */
  isArmingInhibited: boolean;

  /** Whether the airplane is on the ground. */
  isOnGround: boolean;

  /** Whether the autopilot is on. */
  isApOn: boolean;

  /** Whether ESP has valid attitude data. */
  isAttitudeValid: boolean;

  /** The airplane's pitch angle, in degrees. Positive values indicate downward pitch. */
  pitch: number;

  /**
   * The rate of change of the airplane's pitch angle, in degrees per second. Positive values indicate that the
   * airplane is pitching down.
   */
  pitchRate: number;

  /** The airplane's roll angle, in degrees. Positive values indicate leftward roll. */
  roll: number;

  /**
   * The rate of change of the airplane's roll angle, in degrees per second. Positive values indicate that the airplane
   * is rolling to the left.
   */
  rollRate: number;

  /** Whether ESP has valid indicated airspeed and mach data. */
  isAirspeedValid: boolean;

  /** The airplane's indicated airspeed, in knots. */
  ias: number;

  /** The airplane's mach number. */
  mach: number;

  /** Whether ESP has valid true airspeed data. */
  isTasValid: boolean;

  /** The airplane's true airspeed, in knots. */
  tas: number;

  /** Whether ESP has valid angle of attack data. */
  isAoaValid: boolean;

  /** The airplane's angle of attack, in degrees. */
  aoa: number;

  /** The airplane's stall (critical) angle of attack, in degrees. */
  stallAoa: number;

  /** The airplane's zero-lift angle of attack, in degrees. */
  zeroLiftAoa: number;

  /** Whether ESP has valid above ground height data. */
  isAglValid: boolean;

  /** The airplane's above ground height, in feet. */
  agl: number;
};

/**
 * A controller for forces applied to control axes by a Garmin ESP system.
 */
export interface EspForceController {
  /**
   * Applies a force to the pitch control axis.
   * @param force The force to apply. A force of magnitude one is the amount of force required to deflect the control
   * axis from the neutral position to maximum deflection (on either side). Positive force deflects the control axis
   * to command an increase in pitch angle (i.e. increase downward pitch).
   */
  applyPitchForce(force: number): void;

  /**
   * Applies a force to the roll control axis.
   * @param force The force to apply. A force of magnitude one is the amount of force required to deflect the control
   * axis from the neutral position to maximum deflection (on either side). Positive force deflects the control axis
   * to command an increase in roll angle (i.e. increase leftward roll).
   */
  applyRollForce(force: number): void;
}
