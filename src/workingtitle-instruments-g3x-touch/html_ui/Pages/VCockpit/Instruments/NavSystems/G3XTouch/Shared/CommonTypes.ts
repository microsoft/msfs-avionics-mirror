/**
 * G3X Touch instrument types.
 */
export type InstrumentType = 'PFD' | 'MFD';

/**
 * G3X Touch GDU formats.
 */
export type GduFormat = '460' | '470';

/**
 * The sides on which the PFD pane can be positioned in a GDU460 display.
 */
export type PfdPaneSide = 'left' | 'right';

/**
 * The possible EIS layouts in a GDU460 display.
 */
export enum EisLayouts {
  /** The EIS is not displayed. */
  None,

  /** The EIS is displayed on the left side. */
  Left,

  /** The EIS is displayed on the right side. */
  Right,
}

/**
 * The possible EIS sizes in a GDU460 display.
 */
export enum EisSizes {
  /** For single engine planes */
  Narrow = 'Narrow',
  /** For multi-engine planes or single-engine with detailed display */
  Wide = 'Wide',
}

/**
 * The ID of the G3X Touch's flight planner.
 */
export type G3XFlightPlannerId = 'g3x';

/**
 * The ID of the G3X Touch's CDI.
 */
export type G3XCdiId = 'g3x';

/**
 * Valid external navigator indexes.
 */
export type G3XExternalNavigatorIndex = 1 | 2;
