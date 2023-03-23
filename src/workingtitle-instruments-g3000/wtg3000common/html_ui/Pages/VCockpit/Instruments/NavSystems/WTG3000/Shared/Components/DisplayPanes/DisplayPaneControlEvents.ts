import { PfdIndex } from '../../CommonTypes';
import { ControllableDisplayPaneIndex, DisplayPaneControlGtcIndex } from './DisplayPaneTypes';
import { DisplayPaneViewEvent, DisplayPaneViewEventTypes } from './DisplayPaneViewEvents';

/** Events for controlling the display panes. */
export interface DisplayPaneControlEvents<T extends DisplayPaneViewEventTypes = DisplayPaneViewEventTypes> {
  /** Selects a display pane for the left GTC, or -1 for no selection. */
  gtc_1_display_pane_select: ControllableDisplayPaneIndex | -1;

  /** Selects a display pane for the right GTC, or -1 for no selection. */
  gtc_2_display_pane_select: ControllableDisplayPaneIndex | -1;

  /** Selects the next display pane to the left, if possible, for the given GTC. */
  change_display_pane_select_left: DisplayPaneControlGtcIndex;

  /** Selects the next display pane to the right, if possible, for the given GTC. */
  change_display_pane_select_right: DisplayPaneControlGtcIndex;

  /**
   * Toggles PFD split mode. The data for the event determines which PFD is changed.
   */
  toggle_pfd_split: PfdIndex;

  /**
   * Toggles MFD split mode. When changing from half to full mode, the data for the event determines which MFD display
   * pane will be displayed in full mode (left for left GTC, right for right GTC).
   */
  toggle_mfd_split: DisplayPaneControlGtcIndex;

  /** An event targeting the active view in a specific display pane. */
  display_pane_view_event: DisplayPaneViewEvent<T, keyof T & string>,
}