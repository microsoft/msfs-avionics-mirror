import { Subscribable } from '../sub/Subscribable';
import { BaseChecklistItemTypeDefMap, ChecklistItemDef, ChecklistItemType } from './ChecklistDefinitions';

/**
 * A state of a set of checklists.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * set. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template S The metadata attached to the checklist set.
 * @template G The metadata attached to the checklist groups contained in the set.
 * @template L The metadata attached to the checklist lists contained in the set.
 * @template B The metadata attached to the checklist branches contained in the set.
 */
export interface ChecklistSet<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, S = unknown, G = unknown, L = unknown, B = unknown> {
  /** The groups that belong to the set. */
  readonly groups: readonly ChecklistGroup<I, G, L, B>[];

  /** Metadata for the set. */
  readonly metadata: S;
}

/**
 * A state of a checklist group.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * group. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template G The metadata attached to the checklist group.
 * @template L The metadata attached to the checklist lists contained in the group.
 * @template B The metadata attached to the checklist branches contained in the group.
 */
export interface ChecklistGroup<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, G = unknown, L = unknown, B = unknown> {
  /** The name of the group. */
  readonly name: string;

  /** The checklists that belong to the group. */
  readonly lists: readonly ChecklistList<I, L, B>[];

  /** Metadata for the group. */
  readonly metadata: G;
}

/**
 * A state of a single checklist.
 * @template I A map from checklist item types to checklist item definitions used by the checklist. Defaults to
 * `BaseChecklistItemTypeDefMap`.
 * @template L The metadata attached to the checklist.
 * @template B The metadata attached to the checklist branches contained in the list.
 */
export interface ChecklistList<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, L = unknown, B = unknown> {
  /** The unique ID of the list. */
  readonly uid?: string;

  /** The name of the checklist. */
  readonly name: string;

  /** The items of the checklist. */
  readonly items: readonly ChecklistItem<I>[];

  /** The branches that belong to the checklist. */
  readonly branches: readonly ChecklistBranch<I, B>[];

  /** Metadata for the checklist. */
  readonly metadata: L;

  /**
   * Whether the checklist is completed. A checklist is completed if and only if none of its actionable or branch items
   * are not completed. If a checklist has no actionable or branch items, then it is always considered completed.
   */
  readonly isCompleted: Subscribable<boolean>;
}

/**
 * A state of a checklist branch.
 * @template I A map from checklist item types to checklist item definitions used by the checklist branch. Defaults to
 * `BaseChecklistItemTypeDefMap`.
 * @template B The metadata attached to the branch.
 */
export interface ChecklistBranch<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, B = unknown> {
  /** The unique ID of the branch. */
  readonly uid: string;

  /** The name of the branch. */
  readonly name: string;

  /** The items of the branch. */
  readonly items: readonly ChecklistItem<I>[];

  /** Metadata for the branch. */
  readonly metadata: B;

  /**
   * Whether the branch is completed. A branch is completed if and only if none of its actionable or branch items are
   * not completed. If a branch has no actionable or branch items, then it is always considered completed.
   */
  readonly isCompleted: Subscribable<boolean>;
}

/**
 * A utility type that returns a union type of checklist items for a given set of checklist item types.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type ChecklistItem<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = T extends ChecklistItemType ? ChecklistItemTypeMap<I>[T] : never;

/**
 * A map from checklist item types to checklist items.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 */
export type ChecklistItemTypeMap<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap> = {
  [Type in ChecklistItemType]: Type extends ChecklistItemType.Actionable ? ChecklistCompletableItem<I, Type>
  : Type extends ChecklistItemType.Branch ? ChecklistBranchItem<I>
  : ChecklistItemBase<I, Type>;
};

/**
 * A base checklist item.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type ChecklistItemBase<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = T extends ChecklistItemType ? {
    /** The type of this item. */
    readonly type: T;

    /** The definition for this item. */
    readonly def: ChecklistItemDef<I, T>;
  } : never;

/**
 * A checklist item with a completion state.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type ChecklistCompletableItem<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = ChecklistItemBase<I, T> & {
    /** Whether this item has been completed. */
    readonly isCompleted: Subscribable<boolean>;
  };

/**
 * A checklist branch item.
 * @template I A map from checklist item types to checklist item definitions. Defaults to `BaseChecklistItemTypeDefMap`.
 */
export type ChecklistBranchItem<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap>
  = ChecklistCompletableItem<I, ChecklistItemType.Branch> & {
    /** Whether this item's completion state has been overridden. */
    readonly isOverridden: Subscribable<boolean>;

    /**
     * Whether this item's linked branches have been completed. For each index `i` in the array, `isBranchCompleted[i]`
     * provides the completion state of `def.branch[i]`.
     */
    readonly isBranchCompleted: readonly Subscribable<boolean>[];
  };
