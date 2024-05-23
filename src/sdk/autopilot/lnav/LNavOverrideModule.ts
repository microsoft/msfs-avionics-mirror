import { LNavAircraftState, LNavState, LNavSteerCommand } from './LNavTypes';

/**
 * A module that can optionally override an LNAV computer's default tracking behavior.
 */
export interface LNavOverrideModule {
  /**
   * Gets this module's generated steering command.
   * @returns This module's generated steering command.
   */
  getSteerCommand(): Readonly<LNavSteerCommand>;

  /**
   * Checks whether this module is active.
   * @returns Whether this module is active.
   */
  isActive(): boolean;

  /**
   * Checks whether this module can be activated.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   */
  canActivate(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>): boolean;

  /**
   * Activates this module. When this module is activated, it is responsible for generating steering commands and
   * publishing LNAV data to the event bus.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   */
  activate(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>): void;

  /**
   * Deactivates this module. When this module is deactivated, it is no longer responsible for generating steering
   * commands or publishing LNAV data to the event bus.
   * @param lnavState The current LNAV state.
   */
  deactivate(lnavState: LNavState): void;

  /**
   * Updates this module.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   */
  update(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>): void;
}