/**
 * An entry in a checklist pane state's selected checklist branch stack.
 */
export type ChecklistPaneStateBranchStackEntry = {
  /** The index of the selected checklist branch. */
  branchIndex: number;

  /** The index of the item  */
  returnItemIndex: number;
};

/**
 * Events describing state changes for checklist pane views keyed by base topic names.
 */
export interface BaseChecklistPaneStateEvents {
  /** The index of the selected checklist group. */
  checklist_pane_selected_group_index: number;

  /** The index of the selected checklist in its group. */
  checklist_pane_selected_list_index: number;

  /** The selected checklist branch stack. */
  checklist_pane_selected_branch_stack: readonly Readonly<ChecklistPaneStateBranchStackEntry>[];

  /** The index of the selected checklist item in its checklist or checklist branch. */
  checklist_pane_selected_item_index: number;
}

/**
 * Events describing state changes for an indexed checklist pane view keyed by indexed topic names.
 */
export type IndexedChecklistPaneStateEvents<Index extends number> = {
  [P in keyof BaseChecklistPaneStateEvents as `${P}_${Index}`]: BaseChecklistPaneStateEvents[P];
};

/**
 * All events describing state changes for checklist pane views.
 */
export type ChecklistPaneStateEvents = IndexedChecklistPaneStateEvents<number>;
