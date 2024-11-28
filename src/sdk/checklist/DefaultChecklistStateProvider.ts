import { EventBus } from '../data/EventBus';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { Subscription } from '../sub/Subscription';
import { UUID } from '../utils/uuid';
import { ChecklistControlEvents } from './ChecklistControlEvents';
import {
  BaseChecklistItemTypeDefMap, ChecklistBranchDef, ChecklistBranchItemLogicType, ChecklistItemDef, ChecklistItemType,
  ChecklistListDef, ChecklistSetDef
} from './ChecklistDefinitions';
import {
  ChecklistBranch, ChecklistGroup, ChecklistItemBase, ChecklistCompletableItem, ChecklistBranchItem,
  ChecklistList, ChecklistSet
} from './ChecklistState';
import { ChecklistStateEvents, ChecklistStateResponseData } from './ChecklistStateEvents';
import { ChecklistStateProvider } from './ChecklistStateProvider';

/**
 * A state of a checklist list for use internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistListInternal<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, L = unknown, B = unknown>
  = Omit<ChecklistList<I, L, B>, 'items' | 'branches' | 'isCompleted'> & {
    /** The items of the checklist. */
    readonly items: readonly ChecklistItemInternal<I>[];

    /** The branches that belong to the checklist. */
    readonly branches: readonly ChecklistBranchInternal<I, B>[];

    /**
     * Branch dependents for the checklist. For each index `i` in the array, `array[i]` is an array of the indexes of
     * all branches that depend on branch `i`, or `null` if no branches depend on branch `i`.
     */
    readonly branchDependents: readonly (number[] | null)[];

    /**
     * Whether the checklist is completed. A checklist is completed if and only if none of its actionable or branch items
     * are not completed. If a checklist has no actionable or branch items, then it is always considered completed.
     */
    readonly isCompleted: Subject<boolean>;
  };

/**
 * A state of a checklist branch for use internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistBranchInternal<I extends BaseChecklistItemTypeDefMap, B> = Omit<ChecklistBranch<I, B>, 'items' | 'isCompleted'> & {
  /** The items of the branch. */
  readonly items: readonly ChecklistItemInternal<I>[];

  /**
   * Whether the branch is completed. A branch is completed if and only if none of its actionable or branch items are
   * not completed. If a branch has no actionable or branch items, then it is always considered completed.
   */
  readonly isCompleted: Subject<boolean>;
};

/**
 * A utility type that returns a union type of checklist items for a given set of checklist item types for use
 * internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistItemInternal<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = T extends ChecklistItemType ? ChecklistItemTypeMapInternal<I>[T] : never;

/**
 * A map from checklist item types to checklist items for use internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistItemTypeMapInternal<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap> = {
  [Type in ChecklistItemType]: Type extends ChecklistItemType.Actionable ? ChecklistCompletableItemInternal<I, Type>
  : Type extends ChecklistItemType.Branch ? ChecklistBranchItemInternal<I>
  : ChecklistItemBase<I, Type>;
};

/**
 * A checklist item with a completion state for use internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistCompletableItemInternal<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, T extends ChecklistItemType = ChecklistItemType>
  = ChecklistCompletableItem<I, T> & {
    /** Whether this item has been completed. */
    readonly isCompleted: Subject<boolean>;
  }

/**
 * A checklist branch item for use internally by {@link DefaultChecklistStateProvider}.
 */
type ChecklistBranchItemInternal<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap>
  = ChecklistBranchItem<I> & {
    /**
     * The indexes of the branches linked to the item. For each index `i` in the array, `branchIndexes[i]` is the index
     * of the linked linked branch specified at `def.branches[i]`.
     */
    readonly branchIndexes: number[];

    /** Whether this item has been completed. */
    readonly isCompleted: Subject<boolean>;

    /** Whether this item has been completed. */
    readonly isOverridden: Subject<boolean>;

    /**
     * Whether this item's linked branches have been completed. For each index `i` in the array, `isBranchCompleted[i]`
     * provides the completion state of `def.branches[i]`.
     */
    readonly isBranchCompleted: Subscribable<boolean>[];
  }

/**
 * A default implementation of {@link ChecklistStateProvider}.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * provider's checklist set. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template S The metadata attached to the provider's checklist set.
 * @template G The metadata attached to the checklist groups contained in the provider's checklist set.
 * @template L The metadata attached to the checklist lists contained in the provider's checklist set.
 * @template B The metadata attached to the checklist branches contained in the provider's checklist set.
 */
export class DefaultChecklistStateProvider<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, S = unknown, G = unknown, L = unknown, B = unknown>
  implements ChecklistStateProvider<I, S, G, L, B> {

  private readonly _state;
  public readonly state: ChecklistSet<I, S, G, L, B>;

  private lastStateRequestUuid: string | undefined = undefined;

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of DefaultChecklistStateProvider. The provider is created in an uninitialized state and
   * must be initialized by calling `init()` before it can update its data.
   * @param index The index of this provider's checklist set.
   * @param bus The event bus.
   * @param checklistSetDef The definition for this provider's checklist set.
   */
  public constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    checklistSetDef: ChecklistSetDef<I, S, G, L, B>
  ) {
    this._state = {
      groups: checklistSetDef.groups.map(groupDef => {
        return {
          name: groupDef.name,
          lists: groupDef.lists.map(DefaultChecklistStateProvider.parseList),
          metadata: groupDef.metadata
        } satisfies ChecklistGroup<I, G, L>;
      }),
      metadata: checklistSetDef.metadata
    } satisfies ChecklistSet<I, S, G, L>;
    this.state = this._state;
  }

  /**
   * Parses a checklist list state from a definition.
   * @param listDef The definition to parse.
   * @returns A checklist list state for the specified definition.
   */
  private static parseList<I extends BaseChecklistItemTypeDefMap, L, B>(listDef: ChecklistListDef<I, L, B>): ChecklistListInternal<I, L, B> {
    const list: ChecklistListInternal<I, L, B> = {
      uid: listDef.uid,
      name: listDef.name,
      items: listDef.items.map(DefaultChecklistStateProvider.parseItem),
      branches: listDef.branches.map(DefaultChecklistStateProvider.parseBranch),
      branchDependents: DefaultChecklistStateProvider.parseListBranchDependencies(listDef),
      metadata: listDef.metadata,
      isCompleted: Subject.create(false)
    };

    DefaultChecklistStateProvider.resolveBranchItems(list, -1);
    for (let branchIndex = 0; branchIndex < list.branches.length; branchIndex++) {
      DefaultChecklistStateProvider.resolveBranchItems(list, branchIndex);
    }

    return list;
  }

  /**
   * Parses branch dependencies from a checklist list definition.
   * @param listDef The definition to parse.
   * @returns Branch dependencies for the specified definition. For each index `i` in the array, `array[i]` is an array
   * of the indexes of all branches that depend on branch `i`, or `null` if no branches depend on branch `i`.
   * @throws Error if a circular dependency is found.
   */
  private static parseListBranchDependencies(listDef: ChecklistListDef): (number[] | null)[] {
    const dependencies: (number[] | null)[] = [];

    DefaultChecklistStateProvider.parseBranchDependencies(listDef, -1, dependencies);
    for (let branchIndex = 0; branchIndex < listDef.branches.length; branchIndex++) {
      DefaultChecklistStateProvider.parseBranchDependencies(listDef, branchIndex, dependencies);
    }

    // Check for circular dependencies.
    let foundCircularDependencies = false;
    const done = new Set<number>();
    for (let i = 0; i < dependencies.length; i++) {
      const result = DefaultChecklistStateProvider.findCircularDependencies(listDef, dependencies, i, done, new Set());
      foundCircularDependencies ||= result;
    }

    if (foundCircularDependencies) {
      throw new Error('DefaultChecklistStateProvider: found circular branch dependencies');
    }

    return dependencies;
  }

  /**
   * Parses the dependencies of a checklist branch from a checklist list definition and writes the results to a
   * dependencies array.
   * @param listDef The definition to parse.
   * @param branchIndex The index of the branch for which to parse dependencies, or `-1` to parse dependencies for the
   * base checklist list.
   * @param dependencies The dependencies array to which to write the results. For each index `i` in the array,
   * `array[i]` is an array of the indexes of all branches that depend on branch `i`, or `null` if no branches depend
   * on branch `i`.
   */
  private static parseBranchDependencies(listDef: ChecklistListDef, branchIndex: number, dependencies: (number[] | null)[]): void {
    const items = listDef.branches[branchIndex]?.items ?? listDef.items;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      if (item.type === ChecklistItemType.Branch) {
        for (let i = 0; i < item.branches.length; i++) {
          const dependencyBranchIndex = listDef.branches.findIndex(branchDef => branchDef.uid === item.branches[i]);
          if (listDef.branches[dependencyBranchIndex]) {
            const branchDependencies = dependencies[dependencyBranchIndex] ??= [];
            if (!branchDependencies.includes(branchIndex)) {
              branchDependencies.push(branchIndex);
            }
          }
        }
      }
    }
  }

  /**
   * Checks whether the dependency tree of a checklist branch includes one or more circular dependencies.
   * @param listDef The definition of the checklist list containing the branch to check.
   * @param dependencies The branch dependencies array for the checklist. For each index `i` in the array, `array[i]`
   * is an array of the indexes of all branches that depend on branch `i`, or `null` if no branches depend on branch
   * `i`.
   * @param index The index of the branch to check.
   * @param done A set of the indexes of all branches whose dependency trees have already been checked.
   * @param seen A set of the indexes of all branches that have already been visited in the current dependency chain.
   * @returns Whether a circular dependency was found.
   */
  private static findCircularDependencies(listDef: ChecklistListDef, dependencies: (number[] | null)[], index: number, done: Set<number>, seen: Set<number>): boolean {
    if (done.has(index)) {
      return false;
    }

    if (seen.has(index)) {
      console.warn(`DefaultChecklistStateProvider: circular branch dependency found in list ${listDef.name}, dependency chain (branch indexes): ${Array.from(seen).join(' -> ')}`);
      done.add(index);
      return true;
    }

    seen.add(index);

    let found = false;

    const branchDependencies = dependencies[index];
    if (branchDependencies) {
      for (let i = 0; i < branchDependencies.length; i++) {
        const result = DefaultChecklistStateProvider.findCircularDependencies(listDef, dependencies, branchDependencies[i], done, new Set(seen));
        found ||= result;
      }
    }

    done.add(index);

    return found;
  }

  /**
   * Resolves the index and completion state references of the linked branches for all branch items in a checklist
   * branch.
   * @param list The checklist containing the branch items to resolve.
   * @param branchIndex The index of the branch containing the branch items to resolve, or `-1` to resolve items in the
   * base checklist.
   */
  private static resolveBranchItems(list: ChecklistListInternal, branchIndex: number): void {
    const items = list.branches[branchIndex]?.items ?? list.items;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      if (item.type === ChecklistItemType.Branch) {
        for (let i = 0; i < item.def.branches.length; i++) {
          const linkedBranchIndex = list.branches.findIndex(branch => branch.uid === item.def.branches[i]);
          const linkedBranch = list.branches[linkedBranchIndex];
          if (linkedBranch) {
            item.branchIndexes[i] = linkedBranchIndex;
            item.isBranchCompleted[i] = linkedBranch.isCompleted;
          } else {
            item.branchIndexes[i] = -1;
            item.isBranchCompleted[i] = Subject.create(false);
          }
        }
      }
    }
  }

  /**
   * Parses a checklist branch state from a definition.
   * @param branchDef The definition to parse.
   * @returns A checklist branch state for the specified definition.
   */
  private static parseBranch<I extends BaseChecklistItemTypeDefMap, B>(branchDef: ChecklistBranchDef<I, B>): ChecklistBranchInternal<I, B> {
    return {
      uid: branchDef.uid,
      name: branchDef.name,
      items: branchDef.items.map(DefaultChecklistStateProvider.parseItem),
      metadata: branchDef.metadata,
      isCompleted: Subject.create(false)
    };
  }

  /**
   * Parses a checklist item from a definition.
   * @param itemDef The definition to parse.
   * @returns A checklist item for the specified definition.
   */
  private static parseItem<I extends BaseChecklistItemTypeDefMap>(itemDef: ChecklistItemDef<I>): ChecklistItemInternal<I> {
    switch (itemDef.type) {
      case ChecklistItemType.Actionable:
        return {
          type: itemDef.type,
          def: itemDef,
          isCompleted: Subject.create(false)
        };
      case ChecklistItemType.Branch:
        return {
          type: itemDef.type,
          def: itemDef,
          branchIndexes: [],
          isCompleted: Subject.create(false),
          isOverridden: Subject.create(false),
          isBranchCompleted: []
        };
      default:
        return {
          type: itemDef.type,
          def: itemDef
        } as ChecklistItemBase<I, Exclude<ChecklistItemType, ChecklistItemType.Actionable | ChecklistItemType.Branch>>;
    }
  }

  /**
   * Initializes this provider. Once initialized, this provider will continuously update its data until paused or
   * destroyed.
   * @param paused Whether to initialize this provider as paused. Defaults to `false`.
   * @throws Error if this provider has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultChecklistStateProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ChecklistStateEvents>();

    this.subscriptions.push(
      sub.on(`checklist_state_all_reset_${this.index}`).handle(this.onAllReset.bind(this)),
      sub.on(`checklist_state_group_reset_${this.index}`).handle(this.onGroupReset.bind(this)),
      sub.on(`checklist_state_list_reset_${this.index}`).handle(this.onListCompletedSet.bind(this, false)),
      sub.on(`checklist_state_list_completed_${this.index}`).handle(this.onListCompletedSet.bind(this, true)),
      sub.on(`checklist_state_item_reset_${this.index}`).handle(this.onItemCompletedSet.bind(this, false)),
      sub.on(`checklist_state_item_completed_${this.index}`).handle(this.onItemCompletedSet.bind(this, true)),
      sub.on(`checklist_state_response_${this.index}`).handle(this.onStateResponse.bind(this))
    );

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this provider. Once resumed, this provider will continuously update its data until paused or destroyed.
   * @throws Error if this provider has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultChecklistStateProvider: cannot resume a dead provider');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this.bus.getPublisher<ChecklistControlEvents>().pub(
      `checklist_state_request_${this.index}`,
      this.lastStateRequestUuid = UUID.GenerateUuid(),
      true,
      false
    );

    for (const sub of this.subscriptions) {
      sub.resume();
    }
  }

  /**
   * Pauses this provider. Once paused, this provider will not update its data until it is resumed.
   * @throws Error if this provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultChecklistStateProvider: cannot pause a dead provider');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /**
   * Responds to when all checklist groups have been reset.
   */
  private onAllReset(): void {
    for (let groupIndex = 0; groupIndex < this._state.groups.length; groupIndex++) {
      this.onGroupReset(groupIndex);
    }
  }

  /**
   * Responds to when a single checklist group has been reset.
   * @param groupIndex The index of the reset group.
   */
  private onGroupReset(groupIndex: number): void {
    const group = this._state.groups[groupIndex];

    if (!group) {
      return;
    }

    const indexes: [number, number] = [groupIndex, -1];

    for (let listIndex = 0; listIndex < group.lists.length; listIndex++) {
      indexes[1] = listIndex;
      this.onListCompletedSet(false, indexes);
    }
  }

  /**
   * Responds to when all actionable items in a single checklist have been reset or completed.
   * @param completed Whether items were completed.
   * @param data The indexes of the affected checklist, as an ordered tuple of: the index of the checklist group
   * containing the checklist, and the index of the checklist within its group.
   */
  private onListCompletedSet(completed: boolean, data: readonly [groupIndex: number, listIndex: number]): void {
    const list = this._state.groups[data[0]]?.lists[data[1]];

    if (!list) {
      return;
    }

    // First, set the completion state of every actionable item and override state of every branch item in the list and
    // all branches.

    for (let itemIndex = 0; itemIndex < list.items.length; itemIndex++) {
      const item = list.items[itemIndex];
      switch (item.type) {
        case ChecklistItemType.Actionable:
          item.isCompleted.set(completed);
          break;
        case ChecklistItemType.Branch:
          item.isOverridden.set(completed);
          break;
      }
    }

    for (let branchIndex = 0; branchIndex < list.branches.length; branchIndex++) {
      const branch = list.branches[branchIndex];
      for (let itemIndex = 0; itemIndex < branch.items.length; itemIndex++) {
        const item = branch.items[itemIndex];
        switch (item.type) {
          case ChecklistItemType.Actionable:
            item.isCompleted.set(completed);
            break;
          case ChecklistItemType.Branch:
            item.isOverridden.set(completed);
            break;
        }
      }
    }

    // Next, update the completion state of the list and all of its branches.

    const done = new Set<number>();
    this.updateBranchCompletionStateDown(list, -1, done);
    for (let i = 0; i < list.branches.length; i++) {
      this.updateBranchCompletionStateDown(list, i, done);
    }
  }

  /**
   * Responds to when an actionable item has been reset or completed or when a branch item has been reset or
   * overridden.
   * @param completed Whether the item was completed/overridden.
   * @param data The indexes of the affected item, as an ordered tuple of: the index of the checklist group containing
   * the item, the index of the checklist containing the item within its group, the index of the branch containing the
   * item within its checklist (or `-1` if the item is in the base checklist), and the index of the item within its
   * checklist or branch.
   */
  private onItemCompletedSet(completed: boolean, data: readonly [groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number]): void {
    const [groupIndex, listIndex, branchIndex, itemIndex] = data;

    const list = this._state.groups[groupIndex]?.lists[listIndex];

    if (!list) {
      return;
    }

    if (branchIndex >= list.branches.length) {
      return;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;
    const item = items[itemIndex];

    if (!item) {
      return;
    }

    const isCompletedSubject = branch ? branch.isCompleted : list.isCompleted;

    let isItemCompleted: boolean | undefined = undefined;

    if (item.type === ChecklistItemType.Actionable) {
      if (item.isCompleted.get() !== completed) {
        item.isCompleted.set(completed);
        isItemCompleted = completed;
      }
    } else if (item.type === ChecklistItemType.Branch) {
      item.isOverridden.set(completed);
      if (completed) {
        if (!item.isCompleted.get()) {
          item.isCompleted.set(completed);
          isItemCompleted = true;
        }
      } else {
        const isItemCompletedNew = this.isBranchItemCompleted(item);
        if (isItemCompletedNew !== item.isCompleted.get()) {
          item.isCompleted.set(isItemCompletedNew);
          isItemCompleted = isItemCompletedNew;
        }
      }
    }

    // If the item completion state did not change as a result of the operation, then we are done.
    if (isItemCompleted === undefined) {
      return;
    }

    const wasCompleted = isCompletedSubject.get();
    if (isItemCompleted) {
      // If the item completion state changed to true, then check if no items in the parent list/branch are
      // uncompleted. If so, then the parent list/branch is completed.

      let isCompleted = true;
      for (let i = 0; isCompleted && i < items.length; i++) {
        const iteratedItem = items[i];
        switch (iteratedItem.type) {
          case ChecklistItemType.Actionable:
          case ChecklistItemType.Branch:
            if (!iteratedItem.isCompleted.get()) {
              isCompleted = false;
            }
            break;
        }
      }
      isCompletedSubject.set(isCompleted);
    } else {
      // If the item completion state changed to false, then the parent list/branch completion state must be changed
      // to false.
      isCompletedSubject.set(false);
    }

    // If a branch changed completion state, then we need to walk back up the dependency chain and update the
    // completion state of all branches that depend on the one that was changed.
    if (branch && isCompletedSubject.get() !== wasCompleted) {
      const dependents = this.enumerateDependents(list, branchIndex);
      for (let i = 0; i < dependents.length; i++) {
        this.updateBranchCompletionStateFlat(list, dependents[i]);
      }
    }
  }

  /**
   * Responds to when a checklist state response is received.
   * @param data The response data.
   */
  private onStateResponse(data: ChecklistStateResponseData): void {
    if (data.uuid !== this.lastStateRequestUuid) {
      return;
    }

    this.lastStateRequestUuid = undefined;

    for (let groupIndex = 0; groupIndex < this._state.groups.length; groupIndex++) {
      const groupState = data.state[groupIndex];
      const group = this._state.groups[groupIndex];
      for (let listIndex = 0; listIndex < group.lists.length; listIndex++) {
        const listState = groupState ? groupState[listIndex] : null;
        const list = group.lists[listIndex];

        // base list
        this.setBranchStateFromResponse(list.items, listState?.[0] ?? null);

        // branches
        for (let branchIndex = 0; branchIndex < list.branches.length; branchIndex++) {
          this.setBranchStateFromResponse(list.branches[branchIndex].items, listState?.[branchIndex + 1] ?? null);
        }

        // Update the completion state for the list and all of its branches.
        const done = new Set<number>();
        this.updateBranchCompletionStateDown(list, -1, done);
        for (let i = 0; i < list.branches.length; i++) {
          this.updateBranchCompletionStateDown(list, i, done);
        }
      }
    }
  }

  /**
   * Sets the completion states of actionable items and override states of branch items in a checklist branch to match
   * the data in a checklist state response.
   * @param items The items in the checklist branch to set.
   * @param responseBranchState The branch state in the checklist state response.
   */
  private setBranchStateFromResponse(items: readonly ChecklistItemInternal<I>[], responseBranchState: readonly number[] | null): void {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      switch (item.type) {
        case ChecklistItemType.Actionable: {
          const isCompleted = responseBranchState !== null && responseBranchState.includes(itemIndex);
          item.isCompleted.set(isCompleted);
          break;
        }
        case ChecklistItemType.Branch: {
          const isOverridden = responseBranchState !== null && responseBranchState.includes(itemIndex);
          item.isOverridden.set(isOverridden);
          break;
        }
      }
    }
  }

  /**
   * Updates the completion state of a checklist branch. This method will recursively update the completion state of
   * any dependencies of the branch that are required to compute the branch's completion state.
   * @param list The checklist list containing the branch to update.
   * @param branchIndex The index of the branch to update, or `-1` to update the base list.
   * @param done A set of the indexes of all branches whose completion states have already been updated.
   */
  private updateBranchCompletionStateDown(list: ChecklistListInternal<I, L, B>, branchIndex: number, done: Set<number>): void {
    if (branchIndex >= list.branches.length) {
      return;
    }

    branchIndex = Math.max(branchIndex, -1);

    if (done.has(branchIndex)) {
      return;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;
    const isCompletedSubject = branch ? branch.isCompleted : list.isCompleted;

    let result = true;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];

      switch (item.type) {
        case ChecklistItemType.Actionable:
          if (!item.isCompleted.get()) {
            result = false;
          }
          break;
        case ChecklistItemType.Branch:
          if (item.isOverridden.get()) {
            item.isCompleted.set(true);
          } else {
            let sufficientItemCompleted = false;
            let necessaryItemsCompleted: boolean | undefined = undefined;

            for (let i = 0; !(sufficientItemCompleted || !!necessaryItemsCompleted) && i < item.def.branches.length; i++) {
              const dependencyBranch = list.branches[item.branchIndexes[i]];
              const dependencyBranchLogic = item.def.branchLogic[i] ?? ChecklistBranchItemLogicType.None;
              if (dependencyBranch && dependencyBranchLogic !== ChecklistBranchItemLogicType.None) {
                this.updateBranchCompletionStateDown(list, item.branchIndexes[i], done);
                if (dependencyBranchLogic === ChecklistBranchItemLogicType.Sufficient) {
                  sufficientItemCompleted ||= dependencyBranch.isCompleted.get();
                } else {
                  necessaryItemsCompleted ??= true;
                  necessaryItemsCompleted &&= dependencyBranch.isCompleted.get();
                }
              }
            }

            item.isCompleted.set(sufficientItemCompleted || !!necessaryItemsCompleted);
          }

          if (!item.isCompleted.get()) {
            result = false;
          }

          break;
      }
    }

    isCompletedSubject.set(result);

    done.add(branchIndex);
  }

  /**
   * Updates the completion state of a checklist branch. This method only updates the specified branch and will not
   * update the completion state of any dependents or dependencies of the branch.
   * @param list The checklist list containing the branch to update.
   * @param branchIndex The index of the branch to update, or `-1` to update the base list.
   */
  private updateBranchCompletionStateFlat(list: ChecklistListInternal<I, L, B>, branchIndex: number): void {
    if (branchIndex >= list.branches.length) {
      return;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;
    const isCompletedSubject = branch ? branch.isCompleted : list.isCompleted;

    let result = true;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];

      switch (item.type) {
        case ChecklistItemType.Actionable:
          if (!item.isCompleted.get()) {
            result = false;
          }
          break;
        case ChecklistItemType.Branch:
          if (item.isOverridden.get()) {
            item.isCompleted.set(true);
          } else {
            item.isCompleted.set(this.isBranchItemCompleted(item));
          }

          if (!item.isCompleted.get()) {
            result = false;
          }
          break;
      }
    }

    isCompletedSubject.set(result);
  }

  /**
   * Enumerates all of the dependent branches of a checklist branch.
   * @param list The checklist list containing the branch for which to enumerate dependents.
   * @param branchIndex The index of the branch for which to enumerate dependents.
   * @returns An array containing the indexes of all of the dependent branches of the specified checklist branch. An
   * index of `-1` indicates the base checklist. Any given index is guaranteed to appear in the array at most once. The
   * indexes are ordered such that for any two branches A and B, if A is a dependent of B, then A's index will appear
   * after B's index.
   */
  private enumerateDependents(list: ChecklistListInternal<I, L, B>, branchIndex: number): number[] {
    const dependents: number[] = [];

    const branchDependents = list.branchDependents[branchIndex];
    if (!branchDependents) {
      return [];
    }

    // Traverse the dependents graph in breadth-first order, adding to the dependents array as we go. If we end up
    // traversing a branch that was previously traversed, then move the entry for the branch in the array to the end
    // instead of skipping it. Note that we are guaranteed to not have any cycles in the graph (no circular
    // dependencies), so moving previously traversed branches to the end of the array cannot result in an infinite
    // loop.

    for (let i = 0; i < branchDependents.length; i++) {
      const currentBranchIndex = branchDependents[i];
      if (currentBranchIndex < 0 || list.branches[currentBranchIndex]) {
        dependents.push(currentBranchIndex);
      }
    }

    let currentIndex = 0;
    while (currentIndex < dependents.length) {
      const currentBranchIndex = dependents[currentIndex];
      const currentBranch = list.branches[currentBranchIndex];

      // If currentBranch is undefined, then currentBranchIndex must be -1 (we don't allow positive invalid indexes to
      // be added to the array). Since -1 indicates the base checklist and the base checklist cannot have any
      // dependents, we will only search for dependents when currentBranch is defined.
      if (currentBranch) {
        const currentBranchDependents = list.branchDependents[currentBranchIndex];
        if (currentBranchDependents) {
          for (let i = 0; i < currentBranchDependents.length; i++) {
            const dependentIndex = currentBranchDependents[i];
            if (dependentIndex < 0 || list.branches[dependentIndex]) {
              const indexOf = dependents.indexOf(dependentIndex);
              if (indexOf >= 0) {
                dependents.splice(indexOf, 1);
                if (indexOf <= currentIndex) {
                  --currentIndex;
                }
              }
              dependents.push(dependentIndex);
            }
          }
        }
      }
      ++currentIndex;
    }

    return dependents;
  }

  /**
   * Checks whether a branch item is completed.
   * @param item The item to check.
   * @returns Whether the specified branch item is completed.
   */
  private isBranchItemCompleted(item: ChecklistItemInternal<I, ChecklistItemType.Branch>): boolean {
    if (item.isOverridden.get()) {
      return true;
    } else {
      let sufficientItemCompleted = false;
      let necessaryItemsCompleted: boolean | undefined = undefined;

      for (let i = 0; !(sufficientItemCompleted || !!necessaryItemsCompleted) && i < item.isBranchCompleted.length; i++) {
        const dependencyBranchLogic = item.def.branchLogic[i] ?? ChecklistBranchItemLogicType.None;
        if (dependencyBranchLogic !== ChecklistBranchItemLogicType.None) {
          if (dependencyBranchLogic === ChecklistBranchItemLogicType.Sufficient) {
            sufficientItemCompleted ||= item.isBranchCompleted[i].get();
          } else {
            necessaryItemsCompleted ??= true;
            necessaryItemsCompleted &&= item.isBranchCompleted[i].get();
          }
        }
      }

      return sufficientItemCompleted || !!necessaryItemsCompleted;
    }
  }

  /**
   * Destroys this provider. Once destroyed, this provider will no longer update its provided data, and can no longer
   * be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
