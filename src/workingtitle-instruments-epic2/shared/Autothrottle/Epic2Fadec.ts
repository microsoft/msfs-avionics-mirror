import { AutothrottleThrottleIndex, ThrottleLeverManager } from '@microsoft/msfs-sdk';

/**
 * FADEC modes for the Epic2.
 */
export enum Epic2FadecModes {
  /** Engine not running. */
  STOP = 'STOP',

  /** Engine start. */
  START = 'START',

  /** Takeoff thrust. */
  TO = 'TO',

  /** Takeoff thrust scale while on the ground. */
  GROUND = 'GROUND',

  /** CLB thrust scale. */
  CLBCRZ = 'CLB',

  /** Reverse thrust. */
  TR = 'T/R',

  /** Auto Thrust Reserve. */
  ATR = 'ATR',

  /** Default undefined state. */
  UNDEF = 'UNDEF'
}

/** Configuration for the Epic2 FADEC. */
export interface Epic2FadecConfig {
  /** The number of engines on this plane; defaults to 1. */
  numberOfEngines?: AutothrottleThrottleIndex,
}

/** Possible engine types. */
export enum Epic2EngineType {
  Turboprop,
  Jet,
}

/** An interface for all Epic2 FADECs. */
export interface Epic2Fadec {
  /**
   * The number of engines configured for this plane.
   * @returns the number of engines configured for this plane.
   */
  numberOfEngines: AutothrottleThrottleIndex;
  /**
   * The climb throttle detent position in the range [0, 1].
   */
  climbThrottlePosition: number;

  /**
   * The takeoff throttle detent position in the range [0, 1].
   */
  takeoffThrottlePosition: number;

  /**
   * The idle throttle detent position in the range [0, 1].
   */
  idleThrottlePosition: number;

  /** The type of engine on this plane. */
  engineType: Epic2EngineType;

  /**
   * A function which handles throttle lever input key events. The function takes in the index of the throttle, the
   * current and requested throttle lever positions (both in the range -1 to +1), and the name of the key event, and
   * should return the desired actual position to set (also in the range -1 to +1).
   */
  onThrottleLeverKeyEvent?: (index: AutothrottleThrottleIndex, currentPos: number, newPos: number, keyEvent: string) => number;

  /** The throttle lever manager. */
  throttleLeverManager: ThrottleLeverManager;
}
