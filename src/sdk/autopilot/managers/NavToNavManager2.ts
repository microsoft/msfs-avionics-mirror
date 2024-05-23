import { NavRadioIndex } from '../../instruments/RadioCommon';
import { APLateralModes, APVerticalModes } from '../APConfig';

/**
 * A manager that handles CDI source switching to a NAV radio source for an autopilot.
 */
export interface NavToNavManager2 {
  /** Flags this object as a NavToNavManager2. */
  readonly isNavToNavManager2: true;

  /**
   * A callback function that is called when this manager has completed a CDI source switch.
   * @param activateLateralMode The autopilot lateral mode that can be activated as a result of the CDI source switch.
   * @param activateVerticalMode The autopilot vertical mode that can be activated as a result of the CDI source
   * switch.
   */
  onTransferred?: (activateLateralMode: APLateralModes, activateVerticalMode: APVerticalModes) => void;

  /**
   * Gets the index of the NAV radio that can be armed for a CDI source switch by this manager, or `-1` if a CDI source
   * switch cannot be armed.
   * @returns The index of the NAV radio that can be armed for a CDI source switch by this manager, or `-1` if a CDI
   * source switch cannot be armed.
   */
  getArmableNavRadioIndex(): NavRadioIndex | -1;

  /**
   * Gets the autopilot lateral mode that can be armed while waiting for this manager to switch CDI source, or
   * `APLateralModes.NONE` if no modes can be armed.
   * @returns The autopilot lateral mode that can be armed while waiting for this manager to switch CDI source, or
   * `APLateralModes.NONE` if no modes can be armed.
   */
  getArmableLateralMode(): APLateralModes;

  /**
   * Gets the autopilot vertical mode that can be armed while waiting for this manager to switch CDI source, or
   * `APVerticalModes.NONE` if no modes can be armed.
   * @returns The autopilot vertical mode that can be armed while waiting for this manager to switch CDI source, or
   * `APVerticalModes.NONE` if no modes can be armed.
   */
  getArmableVerticalMode(): APVerticalModes;

  /**
   * Checks whether a CDI source switch initiated by this manager is currently in progress.
   * @returns Whether a CDI source switch initiated by this manager is currently in progress.
   */
  isTransferInProgress(): boolean;

  /**
   * A method that is called on every autopilot update cycle before the autopilot directors are updated.
   */
  onBeforeUpdate(): void;

  /**
   * A method that is called on every autopilot update cycle after the autopilot directors are updated.
   */
  onAfterUpdate(): void;
}
