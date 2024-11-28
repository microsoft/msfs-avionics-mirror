/**
 * Events used to control checklists keyed by base topic names.
 */
export interface BaseChecklistControlEvents {
  /** Resets all checklists. */
  checklist_reset_all: void;

  /** Resets a checklist group. The event data is the index of the group to reset. */
  checklist_reset_group: number;

  /**
   * Resets a checklist. The event data is an ordered tuple of: the index of the checklist group containing the
   * checklist to reset, and the index of the checklist to reset within its group.
   */
  checklist_reset_list: readonly [groupIndex: number, listIndex: number];

  /**
   * Resets an actionable checklist item. The event data is an ordered tuple of: the index of the checklist group
   * containing the item to reset, the index of the checklist containing the item to reset within its group, and the
   * index of the item to reset within its checklist.
   */
  checklist_reset_item: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number];

  /**
   * Completes every actionable item in a checklist. The event data is an ordered tuple of: the index of the checklist
   * group containing the checklist to complete, and the index of the checklist to complete within its group.
   */
  checklist_complete_list: readonly [groupIndex: number, listIndex: number];

  /**
   * Completes an actionable checklist item. The event data is an ordered tuple of: the index of the checklist group
   * containing the item to complete, the index of the checklist containing the item to complete within its group, and
   * the index of the item to complete within its checklist.
   */
  checklist_complete_item: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number];

  /**
   * Toggles an actionable checklist item. The event data is an ordered tuple of: the index of the checklist group
   * containing the item to toggle, the index of the checklist containing the item to toggle within its group, and the
   * index of the item to toggle within its checklist.
   */
  checklist_toggle_item: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number];

  /**
   * Requests the full state of all checklists. The event data is an UUID that can be used to match responses to the
   * request. The response will be published to the `checklist_state_response` topic (with the same index as the one
   * used to send the request).
   */
  checklist_state_request: string;
}

/**
 * Events used to control an indexed checklist keyed by indexed topic names.
 */
export type IndexedChecklistControlEvents<Index extends number> = {
  [P in keyof BaseChecklistControlEvents as `${P}_${Index}`]: BaseChecklistControlEvents[P];
};

/**
 * All events used to control checklists.
 */
export type ChecklistControlEvents = IndexedChecklistControlEvents<number>;
