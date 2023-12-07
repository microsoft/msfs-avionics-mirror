import { Subject } from '../sub/Subject';
import { AutopilotDriverOptions } from './AutopilotDriver';
import { PlaneDirector } from './directors/PlaneDirector';
import { NavToNavManager } from './managers/NavToNavManager';
import { VNavManager } from './managers/VNavManager';

export enum APVerticalModes {
  NONE,
  PITCH,
  VS,
  FLC,
  ALT,
  PATH,
  GP,
  GS,
  CAP,
  TO,
  GA,
  FPA,
  FLARE,
  LEVEL
}

export enum APLateralModes {
  NONE,
  ROLL,
  LEVEL,
  GPSS,
  HEADING,
  VOR,
  LOC,
  BC,
  ROLLOUT,
  NAV,
  TO,
  GA,
  HEADING_HOLD,
  TRACK,
  TRACK_HOLD,
  FMS_LOC,
  TO_LOC,
}

export enum APAltitudeModes {
  NONE,
  ALTS,
  ALTV
}

/**
 * An object containing values pertinent to autopilot operation.
 */
export type APValues = {
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
  readonly lateralActive: Subject<APLateralModes>;

  /** The Active Vertical Mode */
  readonly verticalActive: Subject<APVerticalModes>;

  /** The Armed Lateral Mode */
  readonly lateralArmed: Subject<APLateralModes>;

  /** The Armed Vertical Mode */
  readonly verticalArmed: Subject<APVerticalModes>;

  /** The AP Approach Mode is on */
  readonly apApproachModeOn: Subject<boolean>;

  /** Returns whether nav to nav says that LOC can be armed. */
  navToNavLocArm?: () => boolean;
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
  createNavToNavManager?(apValues: APValues): NavToNavManager | undefined;

  /**
   * Creates the autopilot's variable bank manager.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's variable bank manager.
   */
  createVariableBankManager?(apValues: APValues): Record<any, any> | undefined;

  /**
   * Creates the autopilot's VNAV Path mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VNAV Path mode director.
   */
  createVNavPathDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's heading mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director.
   */
  createHeadingDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's heading hold (level off and then capture heading)
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading hold director.
   */
  createHeadingHoldDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's track mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director.
   */
  createTrackDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's track hold (level off and then capture track)
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading hold director.
   */
  createTrackHoldDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's roll mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director.
   */
  createRollDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's wings level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's wings level mode director.
   */
  createWingLevelerDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's pitch level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch level mode director.
   */
  createPitchLevelerDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's GPS LNAV mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's GPS LNAV mode director.
   */
  createGpssDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's VOR mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VOR mode director.
   */
  createVorDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's LOC mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's LOC mode director.
   */
  createLocDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's back-course mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's back-course mode director.
   */
  createBcDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's ROLLOUT mode director.
   * @returns The autopilot's ROLLOUT mode director.
   */
  createRolloutDirector?(): PlaneDirector | undefined;

  /**
   * Creates the autopilot's pitch mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch mode director.
   */
  createPitchDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's vertical speed mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's vertical speed mode director.
   */
  createVsDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's flight path angle mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight path angle mode director.
   */
  createFpaDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's flight level change mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight level change mode director.
   */
  createFlcDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's altitude hold mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude hold mode director.
   */
  createAltHoldDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's altitude capture mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude capture mode director.
   */
  createAltCapDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's GPS glidepath mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's GPS glidepath mode director.
   */
  createGpDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's ILS glideslope mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's ILS glideslope mode director.
   */
  createGsDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the auto land FLARE mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's FLARE mode director.
   */
  createFlareDirector?(): PlaneDirector | undefined;

  /**
   * Creates the autopilot's vertical takeoff mode director (or combined vertical takeoff/go-around mode director).
   * @returns The autopilot's vertical takeoff mode director.
   */
  createToVerticalDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's vertical go-around mode director.
   * @returns The autopilot's vertical go-around mode director.
   */
  createGaVerticalDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's lateral takeoff mode director (or combined lateral takeoff/go-around mode director).
   * @returns The autopilot's lateral takeoff mode director.
   */
  createToLateralDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's lateral go-around mode director.
   * @returns The autopilot's lateral go-around mode director.
   */
  createGaLateralDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's FMC LOC-style mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's FMS LOC mode director.
   */
  createFmsLocLateralDirector?(apValues: APValues): PlaneDirector | undefined;

  /**
   * Creates the autopilot's takeoff LOC mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's takeoff LOC mode director.
   */
  createTakeoffLocLateralDirector?(apValues: APValues): PlaneDirector | undefined;

  /** The autopilot's default lateral mode. */
  defaultLateralMode: APLateralModes | (() => APLateralModes);

  /** The autopilot's default vertical mode. */
  defaultVerticalMode: APVerticalModes | (() => APVerticalModes);

  /**
   * The default maximum bank angle the autopilot may command in degrees.
   * If not defined, then the maximum bank angle will be sourced from the AUTOPILOT MAX BANK SimVar
   **/
  defaultMaxBankAngle?: number;

  /** The altitude hold slot index to use. Defaults to 1 */
  altitudeHoldSlotIndex?: 1 | 2 | 3;

  /** The default altitude hold value set during init, defaults to 0 */
  altitudeHoldDefaultAltitude?: number;

  /** The heading hold slot index to use. Defaults to 1 */
  headingHoldSlotIndex?: 1 | 2 | 3;

  /**
   * Whether to only allow disarming (not deactivating) LNAV when receiving the `AP_NAV1_HOLD_OFF` event
   */
  onlyDisarmLnavOnOffEvent?: boolean;

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
   * When true, will initialize the state manager when the flight plan is next synced.
   * This is a work around to delay initialization of autopilot,
   * and you may not need it if you handle initialization of the ap state manager in your code.
   * Defaults to true.
   */
  readonly initializeStateManagerOnFirstFlightPlanSync?: boolean;

  /**
   * Options for the Autopilot Driver
   */
  readonly autopilotDriverOptions?: Readonly<AutopilotDriverOptions>;
}