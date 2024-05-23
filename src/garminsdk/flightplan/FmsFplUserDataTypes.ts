/**
 * Garmin flight plan user data keys.
 */
export enum FmsFplUserDataKey {
  /** The name of the flight plan. */
  Name = 'name',

  /** Data describing the flight plan's loaded visual approach procedure. */
  VisualApproach = 'visual_approach_data',

  /**
   * The designation of the runway associated with the flight plan's loaded visual approach procedure.
   * @deprecated
   */
  VisualApproachRunway = 'visual_approach',

  /** Data describing the flight plan's loaded VFR approach procedure. */
  VfrApproach = 'vfr_approach_data',

  /** Whether the flight plan's loaded approach procedure skips an initial course reversal. */
  ApproachSkipCourseReversal = 'skipCourseReversal'
}

/**
 * Data describing a visual approach procedure that is loaded into a flight plan.
 */
export type FmsFplVisualApproachData = {
  /** The designation of the runway associated with the loaded visual approach procedure. */
  runwayDesignation: string;

  /** Whether the loaded approach is a vectors-to-final (VTF) approach. */
  isVtf: boolean;
};

/**
 * Data describing a VFR approach procedure that is loaded into a flight plan.
 */
export type FmsFplVfrApproachData = {
  /** The index of the published approach procedure on which the loaded VFR approach is based. */
  approachIndex: number;

  /** Whether the loaded approach is a vectors-to-final (VTF) approach. */
  isVtf: boolean;
};

/**
 * Mappings from Garmin flight plan user data keys to their data types.
 */
export type FmsFplUserDataTypeMap = {
  /** The name of the flight plan. */
  [FmsFplUserDataKey.Name]: string;

  /** Data describing the flight plan's loaded visual approach procedure. */
  [FmsFplUserDataKey.VisualApproach]: Readonly<FmsFplVisualApproachData>;

  /** The designation of the runway associated with the flight plan's loaded visual approach procedure. */
  [FmsFplUserDataKey.VisualApproachRunway]: string;

  /** Data describing the flight plan's loaded VFR approach procedure. */
  [FmsFplUserDataKey.VfrApproach]: Readonly<FmsFplVfrApproachData>;

  /** Whether the flight plan's loaded approach procedure skips an initial course reversal. */
  [FmsFplUserDataKey.ApproachSkipCourseReversal]: boolean;
};
