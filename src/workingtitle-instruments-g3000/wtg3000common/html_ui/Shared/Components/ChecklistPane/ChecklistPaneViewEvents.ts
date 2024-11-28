import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * Events which can be sent to navigation map display pane views.
 */
export interface ChecklistPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /** Issues a select previous command to the checklist pane view. */
  display_pane_checklist_prev: void;

  /** Issues a select next command to the checklist pane view. */
  display_pane_checklist_next: void;

  /** Issues a push command to the checklist pane view. */
  display_pane_checklist_push: void;

  /**
   * Issues a command to select a checklist. The event data is an ordered tuple of: the index of the checklist group
   * containing the checklist to select, and the index of the checklist to select within its group.
   */
  display_pane_checklist_select_list: readonly [groupIndex: number, listIndex: number];
}
