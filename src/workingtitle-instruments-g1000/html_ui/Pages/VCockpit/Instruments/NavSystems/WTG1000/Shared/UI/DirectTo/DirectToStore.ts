import { FacilityWaypoint, GeoPointInterface, Subject, Subscribable, Waypoint } from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

/** The store for the DTO view */
export class DirectToStore {
  public readonly waypointInfoStore: WaypointInfoStore;
  public readonly courseInputValue = Subject.create(0);
  public readonly course = Subject.create<number | undefined>(undefined);

  // eslint-disable-next-line jsdoc/require-returns
  /** A subject which provides this store's selected waypoint. */
  public get waypoint(): Subject<Waypoint | null> {
    return this.waypointInfoStore.waypoint;
  }

  private _matchedWaypoints: FacilityWaypoint[] = [];
  // eslint-disable-next-line jsdoc/require-returns
  /** An array of waypoints which have matched the input. */
  public get matchedWaypoints(): readonly FacilityWaypoint[] {
    return this._matchedWaypoints;
  }

  /**
   * Constructor.
   * @param planePos A subscribable which provides the current airplane position for this store.
   */
  constructor(public readonly planePos: Subscribable<GeoPointInterface>) {
    this.waypointInfoStore = new WaypointInfoStore(undefined, planePos);
  }

  /**
   * Set the list of matched waypoints.
   * @param waypoints An array of matched waypoints.
   */
  public setMatchedWaypoints(waypoints: readonly FacilityWaypoint[]): void {
    this._matchedWaypoints = [...waypoints];
  }
}