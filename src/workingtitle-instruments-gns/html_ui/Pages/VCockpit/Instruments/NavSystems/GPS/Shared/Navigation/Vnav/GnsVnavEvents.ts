import { GnsVnavRefMode } from './GnsVnavSettings';

/**
 * A selectable leg entry
 */
export interface GnsVnavRefLegOption {
  /** Leg index */
  index: number,

  /** Leg ident */
  ident: string,
}

/**
 * A possible status message
 */
export enum GnsVnavStatusType {
  None,
  BeginDescentIn,
  DescendToTarget,
}

/**
 * Events for GNS VNAV
 */
export interface GnsVnavEvents {
  /**
   * Whether VNAV has sufficient input data
   */
  gnsvnav_has_input_data: boolean,

  /**
   * Whether AGL ("Above Wpt") target altitude mode can be used due to the current settings
   */
  gnsvnav_agl_available: boolean,

  /**
   * The ref mode being forced due to the current settings, or undefined if not applicable
   */
  gnsvnav_forced_ref_mode: GnsVnavRefMode | null,

  /**
   * The legs available to select as the VNAV ref
   */
  gnsvnav_available_ref_legs: GnsVnavRefLegOption[],

  /**
   * Vertical Speed Required
   *
   * If equal to `Number.MAX_SAFE_INTEGER`, then VSR is invalid
   */
  gnsvnav_vsr: number,

  /**
   * VNAV status message to be shown on the VNAV page
   *
   * If equal to `undefined`, then no status message
   */
  gnsvnav_status: [GnsVnavStatusType, number],
}
