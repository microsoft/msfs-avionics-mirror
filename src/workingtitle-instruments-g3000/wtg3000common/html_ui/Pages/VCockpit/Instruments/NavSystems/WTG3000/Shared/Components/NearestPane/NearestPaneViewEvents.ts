import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * Types of selections for a nearest pane.
 */
export enum NearestPaneSelectionType {
  Airport = 'Airport',
  Intersection = 'Intersection',
  Vor = 'Vor',
  Ndb = 'Ndb',
  User = 'User',
  Weather = 'Weather'
}

/**
 * A description of a waypoint to target in a nearest pane.
 */
export type NearestPaneSelectionData = {
  /** The type of selection. */
  readonly type: NearestPaneSelectionType;

  /** The ICAO of the selected waypoint, or the empty string if there is no selected waypoint. */
  readonly icao: string;

  /** Whether to reset the range of the map. */
  readonly resetRange: boolean;
};

/**
 * Events which can be sent to nearest display pane views.
 */
export interface NearestPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /** Sets the selected waypoint. */
  display_pane_nearest_set: NearestPaneSelectionData;
}