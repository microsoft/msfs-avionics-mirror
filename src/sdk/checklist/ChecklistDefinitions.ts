/**
 * A definition for a set of checklists.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * definition. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template S The metadata attached to the checklist set.
 * @template G The metadata attached to the checklist groups contained in the definition.
 * @template L The metadata attached to the checklist lists contained in the definition.
 * @template B The metadata attached to the checklist branches contained in the definition.
 */
export interface ChecklistSetDef<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, S = unknown, G = unknown, L = unknown, B = unknown> {
  /** Definitions for the checklist groups that belong to the set. */
  readonly groups: readonly ChecklistGroupDef<I, G, L, B>[];

  /** Metadata for the set. */
  readonly metadata: S;
}

/**
 * A definition for a checklist group.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * definition. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template G The metadata attached to the checklist group.
 * @template L The metadata attached to the checklist lists contained in the definition.
 * @template B The metadata attached to the checklist branches contained in the definition.
 */
export interface ChecklistGroupDef<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, G = unknown, L = unknown, B = unknown> {
  /** The name of the group. */
  readonly name: string;

  /** Definitions for the checklists that belong to the group. */
  readonly lists: readonly ChecklistListDef<I, L, B>[];

  /** Metadata for the group. */
  readonly metadata: G;
}

/**
 * A definition for a single checklist.
 * @template I A map from checklist item types to checklist item definitions used by the checklist. Defaults to
 * `BaseChecklistItemTypeDefMap`.
 * @template L The metadata attached to the checklist.
 * @template B The metadata attached to the checklist branches contained in the definition.
 */
export interface ChecklistListDef<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, L = unknown, B = unknown> {
  /** The unique ID of the checklist. */
  readonly uid?: string;

  /** The name of the checklist. */
  readonly name: string;

  /** Definitions for the checklist's items. */
  readonly items: readonly ChecklistItemDef<I>[];

  /** Definitions for the checklist branches that belong to the list. */
  readonly branches: readonly ChecklistBranchDef<I, B>[];

  /** Metadata for the checklist. */
  readonly metadata: L;
}

/**
 * A definition for a checklist branch.
 * @template I A map from checklist item types to checklist item definitions used by the checklist branch. Defaults to
 * `BaseChecklistItemTypeDefMap`.
 * @template B The metadata attached to the branch.
 */
export interface ChecklistBranchDef<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, B = unknown> {
  /** The unique ID of the branch. */
  readonly uid: string;

  /** The name of the branch. */
  readonly name: string;

  /** Definitions for the branch's items. */
  readonly items: readonly ChecklistItemDef<I>[];

  /** Metadata for the branch. */
  readonly metadata: B;
}

/**
 * A utility type that returns a union type of checklist item definitions for a given set of checklist item types.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type ChecklistItemDef<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = T extends ChecklistItemType ? I[T] : never;

/**
 * Checklist item types.
 */
export enum ChecklistItemType {
  Actionable = 'Actionable',
  Branch = 'Branch',
  Note = 'Note',
  Title = 'Title',
  Link = 'Link',
  Spacer = 'Spacer'
}

/**
 * A map from checklist item types to base checklist item definitions. All checklist item definition maps must satisfy
 * this base type.
 */
export type BaseChecklistItemTypeDefMap = {
  /** A type definition for an actionable item */
  [ChecklistItemType.Actionable]: CoreChecklistItemDef<ChecklistItemType.Actionable>;

  /** A type definition for a branch item */
  [ChecklistItemType.Branch]: BaseChecklistBranchItemDef;

  /** A type definition for a link item. */
  [ChecklistItemType.Link]: BaseChecklistLinkItemDef;

  /** A type definition for a note item */
  [ChecklistItemType.Note]: CoreChecklistItemDef<ChecklistItemType.Note>;

  /** A type definition for a title item */
  [ChecklistItemType.Title]: CoreChecklistItemDef<ChecklistItemType.Title>;

  /** A type definition for a spacer item. */
  [ChecklistItemType.Spacer]: CoreChecklistItemDef<ChecklistItemType.Spacer>;
};

/**
 * A core checklist item definition which only defines the item's type.
 * @template T The definition's checklist item type.
 */
export type CoreChecklistItemDef<T extends ChecklistItemType> = {
  /** The type of the item. */
  readonly type: T;
};

/**
 * Completion logic applied to branches linked to checklist branch items.
 */
export enum ChecklistBranchItemLogicType {
  /** The completion state of the linked branch has no effect on the completion state of the branch item. */
  None,

  /** The branch item is considered to be completed if the linked branch is completed. */
  Sufficient,

  /** The branch item is considered to be completed only if the linked branch is completed. */
  Necessary
}

/**
 * A base checklist branch item definition.
 */
export type BaseChecklistBranchItemDef = CoreChecklistItemDef<ChecklistItemType.Branch> & {
  /** The IDs of the branches linked to the item. */
  readonly branches: readonly string[];

  /**
   * The completion logic to apply to the branches linked to the item. For each index `i` in the array,
   * `branchLogic[i]` applies to the linked branch specified at `branches[i]`.
   */
  readonly branchLogic: readonly ChecklistBranchItemLogicType[];
};

/**
 * A base checklist link item definition.
 */
export type BaseChecklistLinkItemDef = CoreChecklistItemDef<ChecklistItemType.Link> & {
  /** The UID of the link's target. */
  readonly target: string;
};

/**
 * A map from checklist item types to checklist item definitions.
 */
export type ChecklistItemTypeDefMap = {
  /** A type definition for an actionable item. */
  [ChecklistItemType.Actionable]: ChecklistActionableItemDef;

  /** A type definition for a branch item. */
  [ChecklistItemType.Branch]: ChecklistBranchItemDef;

  /** A type definition for a link item. */
  [ChecklistItemType.Link]: ChecklistLinkItemDef;

  /** A type definition for a note item. */
  [ChecklistItemType.Note]: ChecklistNoteItemDef;

  /** A type definition for a title item. */
  [ChecklistItemType.Title]: ChecklistTitleItemDef;

  /** A type definition for a spacer item. */
  [ChecklistItemType.Spacer]: ChecklistSpacerItemDef;
};

/**
 * A definition for an actionable checklist item.
 */
export type ChecklistActionableItemDef = {
  /** The type of the item. */
  readonly type: ChecklistItemType.Actionable;

  /** The item's label text. */
  readonly labelText: string;

  /** The item's action text, or the empty string (`''`) if the item has no action text. */
  readonly actionText: string;
};

/**
 * A definition for a branch checklist item.
 */
export type ChecklistBranchItemDef = BaseChecklistBranchItemDef & {
  /** The item's text. */
  readonly text: string;
};

/**
 * A definition for a link checklist item.
 */
export type ChecklistLinkItemDef = BaseChecklistLinkItemDef & {
  /** The item's text. */
  readonly text?: string;
};

/**
 * A definition for a note checklist item.
 */
export type ChecklistNoteItemDef = {
  /** The type of the item. */
  readonly type: ChecklistItemType.Note;

  /** The item's text. */
  readonly text: string;
};

/**
 * A definition for a title checklist item.
 */
export type ChecklistTitleItemDef = {
  /** The type of the item. */
  readonly type: ChecklistItemType.Title;

  /** The item's text. */
  readonly text: string;
};

/**
 * A definition for a spacer checklist item.
 */
export type ChecklistSpacerItemDef = {
  /** The type of the item. */
  readonly type: ChecklistItemType.Spacer;

  /** The height of the item. */
  readonly height?: number;
};
