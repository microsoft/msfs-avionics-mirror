import { Subscribable } from '@microsoft/msfs-sdk';

import { EspModule, EspOperatingMode } from '@microsoft/msfs-garminsdk';

/**
 * An interface for a G3000 electronic stability and protection (ESP) system.
 */
export interface G3000EspInterface {
  /** This system's current operating mode. */
  readonly operatingMode: Subscribable<EspOperatingMode>;

  /**
   * The force applied to the pitch control axis by this system, scaled such that a force of magnitude one is the
   * amount of force required to deflect the control axis from the neutral position to maximum deflection (on either
   * side). Positive force deflects the control axis to command an increase in pitch angle (i.e. increase downward
   * pitch).
   */
  readonly pitchAxisForce: Subscribable<number>;

  /**
   * The force applied to the roll control axis by this system, scaled such that a force of magnitude one is the amount
   * of force required to deflect the control axis from the neutral position to maximum deflection (on either side).
   * Positive force deflects the control axis to command an increase in roll angle (i.e. increase leftward roll).
   */
  readonly rollAxisForce: Subscribable<number>;

  /**
   * The length of the window, in seconds, in which engagement time is tracked, or `0` if engagement time is not
   * tracked.
   */
  readonly engagementTimeWindow: number;

  /**
   * The amount of time this system spent engaged during the engagement time window, as a fraction of the window
   * length. If engagement time is not tracked, then this value is always equal to zero.
   */
  readonly engagementTimeFraction: Subscribable<number>;

  /**
   * Gets an array containing all modules that have been added to this system.
   * @returns An array containing all modules that have been added to this system.
   */
  getAllModules(): readonly EspModule[];

  /**
   * Gets a module with a given ID that has been added to this system.
   * @param id The ID of the module to get.
   * @returns The module added to this system that has the specified ID, or `undefined` if there is no such module.
   */
  getModule(id: string): EspModule | undefined;

  /**
   * Sets whether pilot action is preventing this system from being engaged.
   * @param interrupt Whether pilot action is preventing this system from being engaged.
   */
  setInterrupt(interrupt: boolean): void;

  /**
   * Sets whether this system has failed.
   * @param failed Whether this system has failed.
   */
  setFailed(failed: boolean): void;
}
