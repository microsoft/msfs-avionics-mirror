import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * A description of a procedure to display in a procedure preview pane.
 */
export type NavigationMapPaneFlightPlanFocusData = {
  /** The index of the focused flight plan, or `-1` if no flight plan is focused. */
  readonly planIndex: number;

  /** The index of the first focused flight plan leg, inclusive. */
  readonly globalLegIndexStart: number;

  /** The index of the last focused flight plan leg, exclusive. */
  readonly globalLegIndexEnd: number;

  /** The index of the segment associated with the focus, or `-1` if there is no associated segment. */
  readonly segmentIndex: number;

  /** The global index of the leg associated with the focus, or `-1` if there is no associated leg. */
  readonly globalLegIndex: number;
};

/** Data used to udpate the flight plan text inset from a GTC. */
export interface FlightPlanTextUpdateData {
  /** The segment index for the top row, or -1 if releasing control. */
  topRowSegmentIndex: number;
  /** The segment leg index for the top row, or -1 if top row is not a leg. */
  topRowSegmentLegIndex: number;
  /** The segment index for the selected row, or -1 if no selection. */
  selectedSegmentIndex: number;
  /** The segment leg index for the selected row, or -1 if selected row is not a leg. */
  selectedSegmentLegIndex: number;
  /** The segment indexes of the collapsed segments, or undefined. */
  collapsedSegmentIndexes: number[] | undefined;
}

/**
 * Events which can be sent to navigation map display pane views.
 */
export interface NavigationMapPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /** Sets the flight plan focus. */
  display_pane_nav_map_fpl_focus_set: NavigationMapPaneFlightPlanFocusData;
  /** Updates the flight plan text inset. */
  display_pane_nav_map_text_inset_update: FlightPlanTextUpdateData;
}