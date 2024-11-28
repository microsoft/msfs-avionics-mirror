import { NavSourceId } from '../instruments/NavProcessor';
import { NavRadioIndex } from '../instruments/RadioCommon';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';

/**
 * An object containing values pertinent to autopilot operation.
 */
export interface APValues {
  /** The ID of the CDI associated with the autopilot. */
  readonly cdiId: string;

  /** The autopilot's current CDI source. */
  readonly cdiSource: Subscribable<Readonly<NavSourceId>>;

  /** The current simulation rate. */
  readonly simRate: Subject<number>;

  /** The selected altitude, in feet. */
  readonly selectedAltitude: Subject<number>;

  /** The selected vertical speed target, in feet per minute. */
  readonly selectedVerticalSpeed: Subject<number>;

  /** The selected flight path angle target, in degrees */
  readonly selectedFlightPathAngle: Subject<number>;

  /** The selected indicated airspeed target, in knots. */
  readonly selectedIas: Subject<number>;

  /** The selected mach target. */
  readonly selectedMach: Subject<number>;

  /** Whether the selected airspeed target is in mach. */
  readonly isSelectedSpeedInMach: Subject<boolean>;

  /** The selected pitch target, in degrees. */
  readonly selectedPitch: Subject<number>;

  /** The maximum bank setting ID. */
  readonly maxBankId: Subject<number>;

  /** The maximum Bank Angle the autopilot may command in absolute degrees. */
  readonly maxBankAngle: Subject<number>;

  /** The maximum nose up pitch angle the autopilot may command in degrees. */
  readonly maxNoseUpPitchAngle: Subject<number>;

  /** The maximum nose down pitch angle the autopilot may command in degrees. */
  readonly maxNoseDownPitchAngle: Subject<number>;

  /** The selected heading, in degrees. */
  readonly selectedHeading: Subject<number>;

  /** The captured altitude, in feet. */
  readonly capturedAltitude: Subject<number>;

  /** Approach is Activated in Flight Plan */
  readonly approachIsActive: Subject<boolean>;

  /** The activated approach has an LPV GP */
  readonly approachHasGP: Subject<boolean>;

  /** The Nav 1 Radio is tuned to an ILS with a GS signal */
  readonly nav1HasGs: Subject<boolean>;

  /** The Nav 2 Radio is tuned to an ILS with a GS signal */
  readonly nav2HasGs: Subject<boolean>;

  /** The Nav 3 Radio is tuned to an ILS with a GS signal */
  readonly nav3HasGs: Subject<boolean>;

  /** The Nav 4 Radio is tuned to an ILS with a GS signal */
  readonly nav4HasGs: Subject<boolean>;

  /** The Active Lateral Mode */
  readonly lateralActive: Subject<number>;

  /** The Active Vertical Mode */
  readonly verticalActive: Subject<number>;

  /** The Armed Lateral Mode */
  readonly lateralArmed: Subject<number>;

  /** The Armed Vertical Mode */
  readonly verticalArmed: Subject<number>;

  /** The AP Approach Mode is on */
  readonly apApproachModeOn: Subject<boolean>;

  /**
   * Gets the index of the NAV radio that can be armed for a CDI source switch by the nav-to-nav manager, or `-1` if a
   * CDI source switch cannot be armed.
   * @returns The index of the NAV radio that can be armed for a CDI source switch by the nav-to-nav manager, or `-1`
   * if a CDI source switch cannot be armed.
   */
  navToNavArmableNavRadioIndex?: () => NavRadioIndex | -1;

  /**
   * Gets the autopilot lateral mode that can be armed while waiting for the nav-to-nav manager to switch CDI source,
   * or `APLateralModes.NONE` if no modes can be armed.
   * @returns The autopilot lateral mode that can be armed while waiting for the nav-to-nav manager to switch CDI
   * source, or `APLateralModes.NONE` if no modes can be armed.
   */
  navToNavArmableLateralMode?: () => number;

  /**
   * Gets the autopilot vertical mode that can be armed while waiting for the nav-to-nav manager to switch CDI source,
   * or `APLateralModes.NONE` if no modes can be armed.
   * @returns The autopilot vertical mode that can be armed while waiting for the nav-to-nav manager to switch CDI
   * source, or `APLateralModes.NONE` if no modes can be armed.
   */
  navToNavArmableVerticalMode?: () => number;

  /**
   * Checks whether a CDI source switch initiated by the nav-to-nav manager is currently in progress.
   * @returns Whether a CDI source switch initiated by the nav-to-nav manager is currently in progress.
   */
  navToNavTransferInProgress?: () => boolean;
}
