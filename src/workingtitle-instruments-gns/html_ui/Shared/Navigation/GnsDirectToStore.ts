import {
  FacilityWaypoint, GeoPointSubject, NumberUnitSubject, Subject, Subscribable,
  UnitType, Waypoint
} from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

/** The store for the DTO view */
export class GnsDirectToStore {
  public readonly waypointInfoStore: WaypointInfoStore;
  public readonly courseInputValue = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));
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

  // eslint-disable-next-line jsdoc/require-returns
  /** An array of icaos which have matched the input */
  public get matchedIcaos(): readonly string[] {
    return this.matchedWaypoints.map((it) => it.facility.get().icao);
  }

  /**
   * Constructor.
   *
   * @param waypoint A subscribable which provides the preview waypoint
   * @param planePos A subscribable which provides the current airplane position for this store.
   */
  constructor(
    waypoint: Subscribable<Waypoint | null>,
    public readonly planePos: GeoPointSubject
  ) {
    this.waypointInfoStore = new WaypointInfoStore(waypoint, planePos);
  }

  /**
   * Set the list of matched waypoints.
   * @param waypoints An array of matched waypoints.
   */
  public setMatchedWaypoints(waypoints: readonly FacilityWaypoint[]): void {
    this._matchedWaypoints = [...waypoints];
  }
}