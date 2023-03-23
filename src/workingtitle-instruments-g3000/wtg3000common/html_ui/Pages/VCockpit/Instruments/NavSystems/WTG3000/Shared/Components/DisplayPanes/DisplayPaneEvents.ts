import { ControllableDisplayPaneIndex } from './DisplayPaneTypes';

/** Events fired when a display pane changes. */
export interface DisplayPaneEvents {
  /**
   * Fires when the selected pane for the left GTC changes.
   * Contains the index of the newly selected pane, or -1 if no pane is selected.
   */
  left_gtc_selected_display_pane: ControllableDisplayPaneIndex | -1;

  /**
   * Fires when the selected pane for the right GTC changes.
   * Contains the index of the newly selected pane, or -1 if no pane is selected.
   */
  right_gtc_selected_display_pane: ControllableDisplayPaneIndex | -1;
}