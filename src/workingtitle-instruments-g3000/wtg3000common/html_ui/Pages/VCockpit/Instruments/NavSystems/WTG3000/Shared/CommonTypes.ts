/**
 * Avionics type.
 */
export type AvionicsType = 'G3000' | 'G5000';

/**
 * Instrument type.
 */
export type InstrumentType = 'PFD' | 'MFD' | 'GTC';

/**
 * Valid PFD indexes.
 */
export type PfdIndex = 1 | 2;

/**
 * Valid GTC indexes.
 */
export type GtcIndex = 1 | 2 | 3 | 4;

/**
 * Valid orientations for a GTC. */
export type GtcOrientation = 'horizontal' | 'vertical';

/**
 * An option defining the control modes supported by a GTC.
 */
export type GtcControlSetup = 'all' | 'pfd' | 'mfd' | 'pfd-navcom';

/**
 * The ID of the G3000's flight planner.
 */
export type G3000FlightPlannerId = '';