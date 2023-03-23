import { Subject, Waypoint } from '@microsoft/msfs-sdk';

/**
 * A module which defines a highlighted waypoint.
 */
export class MapWaypointHighlightModule {
  /** The highlighted waypoint. */
  public readonly waypoint = Subject.create<Waypoint | null>(null);
}