import { APValues } from './APValues';
import { AutopilotDriverOptions } from './AutopilotDriver';
import { PlaneDirector } from './directors/PlaneDirector';
import { NavToNavManager2 } from './managers/NavToNavManager2';
import { VNavManager } from './managers/VNavManager';

/**
 * An entry describing an autopilot mode director.
 */
export type APConfigDirectorEntry = {
  /** The director mode. */
  mode: number;

  /** The director. */
  director: PlaneDirector;
}

/**
 * An autopilot configuration.
 */
export interface APConfig {

  /**
   * Creates the autopilot's VNAV Manager.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VNAV Manager.
   */
  createVNavManager?(apValues: APValues): VNavManager | undefined;

  /**
   * Creates the autopilot's nav-to-nav manager.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's nav-to-nav manager.
   */
  createNavToNavManager?(apValues: APValues): NavToNavManager2 | undefined;

  /**
   * Creates the autopilot's variable bank manager.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's variable bank manager.
   */
  createVariableBankManager?(apValues: APValues): Record<any, any> | undefined;

  /**
   * Creates the autopilot's lateral mode directors. Mode `APLateralModes.NONE` (0) is ignored.
   * @param apValues The autopilot's state values.
   * @returns An iterable of lateral mode directors to add to the autopilot.
   */
  createLateralDirectors?(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>>;

  /**
   * Creates the autopilot's vertical mode directors. Mode `APVerticalModes.NONE` (0) is ignored.
   * @param apValues The autopilot's state values.
   * @returns An iterable of vertical mode directors to add to the autopilot.
   */
  createVerticalDirectors?(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>>;

  /** The autopilot's default lateral mode. */
  defaultLateralMode: number | (() => number);

  /** The autopilot's default vertical mode. */
  defaultVerticalMode: number | (() => number);

  /**
   * The default maximum bank angle the autopilot may command in degrees.
   * If not defined, then the maximum bank angle will be sourced from the AUTOPILOT MAX BANK SimVar
   **/
  defaultMaxBankAngle?: number;

  /**
   * The default maximum nose up pitch angle the autopilot may command in degrees.
   * If not defined, then the maximum angle will be 15 degrees.
   **/
  defaultMaxNoseUpPitchAngle?: number;

  /**
   * The default maximum nose down pitch angle the autopilot may command in degrees.
   * If not defined, then the maximum angle will be 15 degrees.
   **/
  defaultMaxNoseDownPitchAngle?: number;

  /** The altitude hold slot index to use. Defaults to 1 */
  altitudeHoldSlotIndex?: 1 | 2 | 3;

  /** The heading hold slot index to use. Defaults to 1 */
  headingHoldSlotIndex?: 1 | 2 | 3;

  /** The ID of the CDI associated with the autopilot. Defaults to the empty string `''`. */
  readonly cdiId?: string;

  /**
   * Whether to only allow disarming (not deactivating) LNAV when receiving the `AP_NAV1_HOLD_OFF` event
   */
  onlyDisarmLnavOnOffEvent?: boolean;

  /** Whether to deactivate the autopilot when GA mode is armed in response to a TO/GA mode button press. Defaults to `true`. */
  readonly deactivateAutopilotOnGa?: boolean;

  /**
   * Whether to automatically engage the FD(s) with AP or mode button presses, defaults to true.
   * Lateral/Vertical press events will be ignored if this is false and neither AP nor FDs are engaged.
   */
  autoEngageFd?: boolean;

  /**
   * Whether to have independent flight directors that can be switched on/off separately. Defaults to false.
   */
  independentFds?: boolean;

  /**
   * Options for the Autopilot Driver
   */
  readonly autopilotDriverOptions?: Readonly<AutopilotDriverOptions>;

  /**
   * Whether to publish the active and armed autopilot modes as LVars. Defaults to false.
   */
  readonly publishAutopilotModesAsLVars?: boolean;
}
