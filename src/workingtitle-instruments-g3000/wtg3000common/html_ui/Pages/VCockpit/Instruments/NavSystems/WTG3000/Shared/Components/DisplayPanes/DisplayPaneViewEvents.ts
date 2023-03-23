import { DisplayPaneIndex } from './DisplayPaneTypes';

/**
 * Common events which can be sent to display pane views.
 */
export interface DisplayPaneViewEventTypes {
  /** Increments the map range. */
  display_pane_map_range_inc: void;

  /** Decrements the map range. */
  display_pane_map_range_dec: void;

  /** Activates/deactivates the map pointer. */
  display_pane_map_pointer_active_set: boolean;

  /** Toggles the map pointer. */
  display_pane_map_pointer_active_toggle: void;

  /** Moves the map pointer by `[x, y]` pixels. */
  display_pane_map_pointer_move: [number, number];
}

/** An event targeting the active view in a specific display pane. */
export interface DisplayPaneViewEvent<T extends DisplayPaneViewEventTypes = DisplayPaneViewEventTypes, P extends keyof T & string = keyof T & string> {
  /** Which display pane this event is for. */
  displayPaneIndex: DisplayPaneIndex,
  /** The event type.*/
  eventType: P,
  /** The event data. */
  eventData: T[P],
}