import { FacilityWaypoint } from '@microsoft/msfs-sdk';

/**
 * Parameters describing the target of a Direct-To.
 */
export type DirectToTargetParams = {
  /** The target waypoint. */
  waypoint: FacilityWaypoint | null;

  /**
   * The user-defined magnetic course, in degrees. If not defined, then the Direct-To course will originate at the
   * airplane's current position with an initial turn.
   */
  course: number | undefined;
};
