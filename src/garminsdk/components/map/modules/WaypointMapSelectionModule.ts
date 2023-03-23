import { AirportRunway, Subject, Waypoint } from '@microsoft/msfs-sdk';

/**
 * A module which defines selected waypoint information for waypoint information maps.
 */
export class WaypointMapSelectionModule {
  /** The selected waypoint. */
  public readonly waypoint = Subject.create<Waypoint | null>(null);

  /** The selected airport runway. */
  public readonly runway = Subject.create<AirportRunway | null>(null);
}