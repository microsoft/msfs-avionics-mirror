import { ExtendedApproachType, RnavTypeFlags, VorFacility } from '@microsoft/msfs-sdk';

/**
 * The FMS POS state events.
 */
export interface FmsPosEvents {
  /** Indicating if FMS pos has been initialized */
  fms_pos_initialized: boolean,
  /** Indicating if the FMS pos is valid */
  fms_pos_valid: boolean,
}

/** FMS Approach Details */
export type ApproachDetails = {
  /** Whether an approach is loaded. */
  approachLoaded: boolean,
  /** The Approach Type */
  approachType: ExtendedApproachType,
  /** The Approach RNAV Type */
  approachRnavType: RnavTypeFlags,
  /** Whether the approach is active */
  approachIsActive: boolean,
  /** Whether the approach is circling */
  approachIsCircling: boolean,
  /** The reference navaid for the approach */
  referenceFacility: VorFacility | null,
}
