import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * A description of a waypoint to target in a waypoint information pane.
 */
export type WaypointInfoPaneSelectionData = {
  /** The ICAO of the selected waypoint, or the empty string if there is no selected waypoint. */
  readonly icao: string;

  /** The index of the selected runway, or `-1` if there is no selected runway. */
  readonly runwayIndex: number;

  /** Whether to reset the range of the map. */
  readonly resetRange: boolean;
};

/**
 * Events which can be sent to waypoint information display pane views.
 */
export interface WaypointInfoPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /** Sets the selected waypoint. */
  display_pane_waypoint_info_set: WaypointInfoPaneSelectionData;
}