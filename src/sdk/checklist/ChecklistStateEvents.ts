/**
 * Data sent in response to a checklist state request.
 */
export type ChecklistStateResponseData = {
  /** The UUID of the request to which the response was made. */
  uuid: string;

  /**
   * A description of the current state of all checklists at the time the response was sent.
   *
   * Each element of the state array represents the state of a checklist group, indexed by group index. If the group
   * state is `null`, then every actionable item in every checklist in the group is not completed. Otherwise, the group
   * state is an array of the states of the checklists in the group, indexed by checklist index. If the checklist state
   * is `null`, then every actionable item in the checklist is not completed. Otherwise, the checklist state is an
   * array of the indexes of every actionable item in the checklist that is completed.
   */
  state: readonly (readonly (readonly (readonly number[] | null)[] | null)[] | null)[];
};

/**
 * Events describing state changes for checklists keyed by base topic names.
 */
export interface BaseChecklistStateEvents {
  /** All checklists in all groups were reset. */
  checklist_state_all_reset: void;

  /** All checklists in a group were reset. The event data is index of the group that was reset. */
  checklist_state_group_reset: number;

  /**
   * A checklist was reset. The event data is an ordered tuple of: the index of the checklist group containing the
   * reset checklist, and the index of the reset checklist within its group.
   */
  checklist_state_list_reset: readonly [groupIndex: number, listIndex: number];

  /**
   * An actionable checklist item was reset. The event data is an ordered tuple of: the index of the checklist group
   * containing the reset item, the index of the checklist containing the reset item within its group, and the index of
   * the reset item within its checklist.
   */
  checklist_state_item_reset: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number];

  /**
   * Every actionable item in a checklist was completed. The event data is an ordered tuple of: the index of the
   * checklist group containing the completed checklist, and the index of the completed checklist within its group.
   */
  checklist_state_list_completed: readonly [groupIndex: number, listIndex: number];

  /**
   * An actionable checklist item was completed. The event data is an ordered tuple of: the index of the checklist
   * group containing the completed item, the index of the checklist containing the completed item within its group,
   * and the index of the completed item within its checklist.
   */
  checklist_state_item_completed: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number];

  /**
   * A response to a checklist state request. The event data contains the requested state data and the UUID of the
   * request to which the response was made.
   */
  checklist_state_response: Readonly<ChecklistStateResponseData>;
}

/**
 * Events describing state changes for an indexed checklist keyed by indexed topic names.
 */
export type IndexedChecklistStateEvents<Index extends number> = {
  [P in keyof BaseChecklistStateEvents as `${P}_${Index}`]: BaseChecklistStateEvents[P];
};

/**
 * All events describing state changes for checklists.
 */
export type ChecklistStateEvents = IndexedChecklistStateEvents<number>;
