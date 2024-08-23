/**
 * A data object containing the results of a takeoff performance calculation.
 */
export interface TakeoffPerformanceCalculatorResults {
  /** The V1 speed. */
  v1: number,
  /** The Vr speed. */
  vr: number,
  /** The V2 speed. */
  v2: number,
  /** The takeoff length. */
  takeoffLength: number,
}

/**
 * A data object containing the results of an approach performance calculation.
 */
export interface ApproachPerformanceResults {
  /** The landing field length. */
  landingFieldLength: number,
  /** The vApp speed. */
  vApp: number,
  /** The vRef speed. */
  vRef: number,
}
