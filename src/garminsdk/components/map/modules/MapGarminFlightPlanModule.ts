import { Subject, Subscribable } from '@microsoft/msfs-sdk';

import { MapFlightPathPlanRenderer } from '../flightplan/MapFlightPathPlanRenderer';
import { MapFlightPlanDataProvider } from '../flightplan/MapFlightPlanDataProvider';
import { MapWaypointRenderer } from '../MapWaypointRenderer';
import { MapFlightPlanWaypointRecordManager } from '../flightplan/MapFlightPlanWaypointRecordManager';

/**
 * An entry describing a flight plan to display on a map.
 */
export type MapGarminFlightPlanEntry = {
  /** The ID of this entry. */
  id: string;

  /** Whether to show this entry's flight plan. */
  show: Subject<boolean>;

  /** A data provider for this entry's flight plan. */
  dataProvider: MapFlightPlanDataProvider;

  /** Whether this entry's flight plan should be drawn in its entirety instead of only from the active lateral leg. */
  drawEntirePlan: Subscribable<boolean>;

  /** The waypoint renderer to use to draw waypoints for this entry's flight plan. */
  waypointRenderer: MapWaypointRenderer;

  /** The waypoint record manager to use to manage the waypoints to draw for this entry's flight plan. */
  waypointRecordManager: MapFlightPlanWaypointRecordManager;

  /** The flight path renderer to use to draw this entry's flight plan. */
  pathRenderer: MapFlightPathPlanRenderer;
};

/**
 * A module describing the display of flight plans.
 */
export class MapGarminFlightPlanModule {
  /** Entries describing the display of flight plans. */
  public readonly entries: readonly Readonly<MapGarminFlightPlanEntry>[];

  /**
   * Creates a new instance of MapGarminFlightPlanModule.
   * @param entries The entries to include in the module.
   */
  public constructor(entries: Iterable<Readonly<MapGarminFlightPlanEntry>>) {
    this.entries = Array.from(entries);
  }
}