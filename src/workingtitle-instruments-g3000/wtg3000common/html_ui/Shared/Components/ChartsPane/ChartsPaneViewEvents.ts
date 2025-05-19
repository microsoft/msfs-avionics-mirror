import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * Events which can be sent to charts display pane views.
 */
export interface ChartsPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /**
   * Issues a command to the charts pane view to rotate its displayed chart. A value of `1` commands a clockwise
   * rotation, and a value of `-1` commands a counterclockwise rotation.
   */
  display_pane_charts_rotate: 1 | -1;

  /** Issues a command to the charts pane view to change the panning offset of the chart *without* overscroll. */
  display_pane_charts_change_pan: readonly [dx: number, dy: number];

  /** Issues a command to the charts pane view to change the panning offset of the chart *with* overscroll. */
  display_pane_charts_change_pan_with_overscroll: readonly [dx: number, dy: number];

  /** Issues a command to the charts pane view to set whether panning overscroll snap-back is inhibited. */
  display_pane_charts_set_overscroll_snapback_inhibit: boolean;

  /**
   * Issues a command to the charts pane view to rescale and reposition the displayed chart so that the width of the
   * chart fits exactly within the pane.
   */
  display_pane_charts_fit_width: void;
}
