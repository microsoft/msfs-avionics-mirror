import { LegDefinition } from '../../flightplan/FlightPlanning';

/**
 * The state of a given plane director.
 */
export enum DirectorState {
  /** The plane director is not currently armed or active. */
  Inactive = 'Inactive',

  /** The plane director is currently armed. */
  Armed = 'Armed',

  /** The plane director is currently active. */
  Active = 'Active'
}

/**
 * An autopilot plane director guidance mode.
 */
export interface PlaneDirector {

  /**
   * Activates the guidance mode.
   */
  activate(): void;

  /**
   * Arms the guidance mode.
   */
  arm(): void;

  /**
   * Deactivates the guidance mode.
   */
  deactivate(): void;

  /**
   * Updates the guidance mode control loops.
   */
  update(): void;

  /**
   * A callback called when a mode signals it should
   * be activated.
   */
  onActivate?: () => void;

  /**
   * A callback called when a mode signals it should
   * be armed.
   */
  onArm?: () => void;

  /**
   * A callback called when a mode signals it should
   * be deactivated.
   */
  onDeactivate?: () => void;

  /**
   * A callback called to set an exact AP bank target.
   * @param bank The bank in degrees (positive = right, negative = left).
   */
  setBank?: (bank: number) => void;

  /**
   * A function used to drive the autopilot commanded bank angle toward a desired value.
   * @param bank The desired bank angle, in degrees. Positive values indicate left bank.
   * @param rate The rate at which to drive the commanded bank angle, in degrees per second. If not defined, a default
   * rate will be used.
   */
  driveBank?: (bank: number, rate?: number) => void;

  /**
   * A callback called to set an exact AP pitch target.
   * @param pitch The pitch in degrees (positive = down, negative = up).
   */
  setPitch?: (pitch: number) => void;

  /**
   * A function used to drive the autopilot commanded pitch angle toward a desired value while optionally correcting
   * for angle of attack and vertical wind.
   * @param pitch The desired pitch angle, in degrees. Positive values indicate downward pitch.
   * @param adjustForAoa Whether to adjust the commanded pitch angle for angle of attack. If `true`, the provided pitch
   * angle is treated as a desired flight path angle and a new commanded pitch angle will be calculated to produce the
   * desired FPA given the airplane's current angle of attack. This correction can be used in conjunction with the
   * vertical wind correction. Defaults to `false`.
   * @param adjustForVerticalWind Whether to adjust the commanded pitch angle for vertical wind velocity. If `true`,
   * the provided pitch angle is treated as a desired flight path angle and a new commanded pitch angle will be
   * calculated to produce the desired FPA given the current vertical wind component. This correction can be used in
   * conjunction with the angle of attack correction. Defaults to `false`.
   * @param rate The rate at which to drive the commanded pitch angle, in degrees per second. If not defined, a default
   * rate will be used.
   */
  drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean, rate?: number) => void;

  /** The current director state. */
  state: DirectorState;
}

/**
 * A director that handles OBS Lateral Navigation.
 * @deprecated
 */
export interface ObsDirector extends PlaneDirector {
  /** Whether or not OBS mode is active. */
  readonly obsActive: boolean;

  /**
   * Sets the flight plan leg whose terminator defines this director's OBS fix.
   * @param index The global leg index of the leg.
   * @param leg The leg to track.
   */
  setLeg(index: number, leg: LegDefinition | null): void;

  /** Whether or not OBS mode can be activated currently. */
  canActivate(): boolean;

  /** Starts tracking the OBS course. */
  startTracking(): void;

  /** Stops tracking the OBS course. */
  stopTracking(): void;
}

/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * A plane director that provides no behavior.
 */
export class EmptyDirector implements PlaneDirector {
  /** No-op. */
  public activate(): void { }

  /** No-op. */
  public deactivate(): void { }

  /** No-op. */
  public update(): void { }

  /** No-op. */
  public onActivate = (): void => { };

  /** No-op */
  public onArm = (): void => { };

  /** No-op. */
  public arm(): void { }
  public state = DirectorState.Inactive;

  /** An instance of the empty plane director. */
  public static instance = new EmptyDirector();
}
