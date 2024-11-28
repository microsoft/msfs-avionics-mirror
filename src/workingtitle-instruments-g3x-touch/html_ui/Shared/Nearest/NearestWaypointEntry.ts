import { Subscribable, Waypoint } from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

/**
 * A data item describing a nearest waypoint.
 */
export interface NearestWaypointEntry<W extends Waypoint> {
  /** This data item's waypoint. */
  readonly waypoint: W;

  /** An info store for this data item's waypoint. */
  readonly store: WaypointInfoStore;

  /** The bearing from the airplane to this data item's waypoint, in degrees, relative to the current airplane heading. */
  readonly relativeBearing: Subscribable<number>;

  /** Destroys this data item. */
  destroy(): void;
}