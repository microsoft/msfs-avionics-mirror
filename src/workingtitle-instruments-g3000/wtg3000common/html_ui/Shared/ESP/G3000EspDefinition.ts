import { EspControlInputManagerOptions, EspModule } from '@microsoft/msfs-garminsdk';
import { Accessible } from '@microsoft/msfs-sdk';

/**
 * Configuration options for a `EspControlInputManager` instantiated by the G3000.
 */
export type G3000EspControlInputManagerOptions = EspControlInputManagerOptions & {
  /** Whether to omit handling the pitch control axis. Defaults to `false`. */
  omitPitchAxis?: boolean;

  /** Whether to omit handling the roll control axis. Defaults to `false`. */
  omitRollAxis?: boolean;
};

/**
 * A definition that describes how to create a G3000 electronic stability and protection (ESP) system.
 */
export type G3000EspDefinition = {
  /** The above ground height, in feet, at or above which ESP can become armed from a disarmed state. */
  readonly armAglThreshold: number;

  /** The above ground height, in feet, below which ESP becomes disarmed from an armed state. */
  readonly disarmAglThreshold: number;

  /** Whether ESP can become armed when AGL data is invalid. Defaults to `false`. */
  readonly canArmWhenAglInvalid?: boolean;

  /**
   * The minimum pitch angle, in degrees, at which ESP can become armed. Positive angles represent downward pitch.
   * Defaults to `-90`.
   */
  readonly armMinPitchLimit?: number;

  /**
   * The maximum pitch angle, in degrees, at which ESP can become armed. Positive angles represent downward pitch.
   * Defaults to `90`.
   */
  readonly armMaxPitchLimit?: number;

  /** The maximum roll angle magnitude, in degrees, at which ESP can become armed. Defaults to `90`. */
  readonly armRollLimit?: number;

  /**
   * The maximum force ESP is allowed to apply to the pitch control axis to move it in the pitch up direction. A force
   * of magnitude one is the amount of force required to deflect the control axis from the neutral position to maximum
   * deflection (on either side). Defaults to `1`.
   */
  readonly pitchAxisMaxForceUp?: number;

  /**
   * The maximum force ESP is allowed to apply to the pitch control axis to move it in the pitch down direction. A
   * force of magnitude one is the amount of force required to deflect the control axis from the neutral position to
   * maximum deflection (on either side). Defaults to `1`.
   */
  readonly pitchAxisMaxForceDown?: number;

  /**
   * The rate at which the system changes the force applied to the pitch control axis, in units of force per second.
   * Defaults to `0.1`.
   */
  readonly pitchAxisForceRate?: number;

  /**
   * The rate at which the system unloads force applied to the pitch control axis when it is not armed, in units of
   * force per second. Defaults to `1`.
   */
  readonly pitchAxisUnloadRate?: number;

  /**
   * The maximum force ESP is allowed to apply to the roll control axis. A force of magnitude one is the amount of
   * force required to deflect the control axis from the neutral position to maximum deflection (on either side).
   * Defaults to `1`.
   */
  readonly rollAxisMaxForce?: number;

  /**
   * The rate at which the system changes the force applied to the roll control axis, in units of force per second.
   * Defaults to `0.1`.
   */
  readonly rollAxisForceRate?: number;

  /**
   * The rate at which the system unloads force applied to the roll control axis when it is not armed, in units of
   * force per second. Defaults to `1`.
   */
  readonly rollAxisUnloadRate?: number;

  /**
   * The length of the window, in seconds, in which engagement time is tracked. Values less than or equal to zero will
   * cause engagement time to not be tracked. Defaults to `0`.
   */
  readonly engagementTimeWindow?: number;

  /**
   * Whether arming is inhibited due to external factors. If not defined, then arming is never inhibited due to
   * external factors.
   */
  readonly isArmingInhibited?: Accessible<boolean>;

  /** Whether to omit the control input manager. Defaults to `false`. */
  readonly omitControlInputManager?: boolean;

  /** Options with which to configure the control input manager. Ignored if `omitControlInputManager` is `true`. */
  readonly controlInputManagerOptions?: Readonly<G3000EspControlInputManagerOptions>;

  /** Factories used to create the modules to add to the ESP system. */
  readonly moduleFactories: readonly (() => EspModule)[];
};
