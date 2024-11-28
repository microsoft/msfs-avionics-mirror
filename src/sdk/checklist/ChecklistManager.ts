import { EventBus } from '../data/EventBus';
import { Subscription } from '../sub/Subscription';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { ChecklistControlEvents } from './ChecklistControlEvents';
import { ChecklistSetDef, ChecklistItemType, ChecklistItemDef } from './ChecklistDefinitions';
import { BaseChecklistStateEvents, ChecklistStateEvents } from './ChecklistStateEvents';

/**
 * A manager for a set of checklists. The manager tracks the state of all actionable items in the checklist set.
 * The manager can respond to requests to change the state of its checklist set made through the event bus via the
 * topics defined in `ChecklistControlEvents` or through direct calls to methods on the manager itself. When the
 * state of its checklist set changes, the manager will publish data to the appropriate topics defined in
 * `ChecklistStateEvents` to describe the changes that occurred.
 */
export class ChecklistManager {
  private readonly publisher = this.bus.getPublisher<ChecklistStateEvents>();

  private readonly eventTopicMap: {
    [Topic in keyof BaseChecklistStateEvents]: `${Topic}_${number}`;
  };

  private readonly state: (boolean | undefined)[][][][];

  private isAlive = true;
  private isAwake = false;

  private readonly subscriptions: Subscription[] = [];
  private readonly controlSubscriptions: Subscription[] = [];

  /**
   * Creates a new instance of ChecklistManager. The new manager is initialized as asleep.
   * @param index The index of this manager's checklist set.
   * @param bus The event bus.
   * @param checklistDef The definition for this manager's checklist set.
   */
  public constructor(
    private readonly index: number,
    private readonly bus: EventBus,
    checklistDef: ChecklistSetDef,
  ) {
    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`ChecklistManager: invalid index ${index} (must be a positive integer)`);
    }

    this.eventTopicMap = {
      'checklist_state_all_reset': `checklist_state_all_reset_${index}`,
      'checklist_state_group_reset': `checklist_state_group_reset_${index}`,
      'checklist_state_list_reset': `checklist_state_list_reset_${index}`,
      'checklist_state_item_reset': `checklist_state_item_reset_${index}`,
      'checklist_state_list_completed': `checklist_state_list_completed_${index}`,
      'checklist_state_item_completed': `checklist_state_item_completed_${index}`,
      'checklist_state_response': `checklist_state_response_${index}`,
    };

    this.state = this.initState(checklistDef);

    const sub = this.bus.getSubscriber<ChecklistControlEvents>();

    this.controlSubscriptions.push(
      sub.on(`checklist_reset_all_${index}`).handle(this.resetAll.bind(this), true),
      sub.on(`checklist_reset_group_${index}`).handle(this.resetGroup.bind(this), true),
      sub.on(`checklist_reset_list_${index}`).handle(([groupIndex, listIndex]) => { this.resetList(groupIndex, listIndex); }, true),
      sub.on(`checklist_reset_item_${index}`).handle(([groupIndex, listIndex, branchIndex, itemIndex]) => { this.toggleItem(groupIndex, listIndex, branchIndex, itemIndex, false); }, true),
      sub.on(`checklist_complete_list_${index}`).handle(([groupIndex, listIndex]) => { this.completeList(groupIndex, listIndex); }, true),
      sub.on(`checklist_complete_item_${index}`).handle(([groupIndex, listIndex, branchIndex, itemIndex]) => { this.toggleItem(groupIndex, listIndex, branchIndex, itemIndex, true); }, true),
      sub.on(`checklist_toggle_item_${index}`).handle(([groupIndex, listIndex, branchIndex, itemIndex]) => { this.toggleItem(groupIndex, listIndex, branchIndex, itemIndex); }, true)
    );

    this.subscriptions.push(
      ...this.controlSubscriptions,

      sub.on(`checklist_state_request_${index}`).handle(this.onStateRequest.bind(this))
    );
  }

  /**
   * Initializes the state of this manager's checklist set.
   * @param checklistDef The definition for the checklist set.
   * @returns The initialized state of this manager's checklist set.
   */
  private initState(checklistDef: ChecklistSetDef): (boolean | undefined)[][][][] {
    const state: (boolean | undefined)[][][][] = [];

    for (const groupDef of checklistDef.groups) {
      const groupState: (boolean | undefined)[][][] = [];

      for (const listDef of groupDef.lists) {
        const listState: (boolean | undefined)[][] = [];

        // base list
        listState.push(this.initBranchState(listDef.items));

        // branches
        for (let i = 0; i < listDef.branches.length; i++) {
          listState.push(this.initBranchState(listDef.branches[i].items));
        }

        groupState.push(listState);
      }

      state.push(groupState);
    }

    return state;
  }

  /**
   * Initializes the state of a checklist branch.
   * @param items The definitions for the items in the branch.
   * @returns The initialized state of the checklist branch with the specified items.
   */
  private initBranchState(items: readonly ChecklistItemDef[]): (boolean | undefined)[] {
    const state: (boolean | undefined)[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type === ChecklistItemType.Actionable || items[i].type === ChecklistItemType.Branch) {
        state[i] = false;
      }
    }

    return state;
  }

  /**
   * Wakes this manager. When awake, this manager will respond to commands to change the state of its checklist set.
   * @throws Error if this manager has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot wake a dead manager');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    for (const sub of this.controlSubscriptions) {
      sub.resume();
    }
  }

  /**
   * Puts this manager to sleep. When asleep, this manager will not respond to commands to change the state of its
   * checklist set. Sleeping managers still respond to checklist state requests.
   * @throws Error if this manager has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    for (const sub of this.controlSubscriptions) {
      sub.pause();
    }
  }

  /**
   * Resets all checklists in this manager's checklist set. Has no effect if this manager is asleep.
   * @throws Error if this manager has been destroyed.
   */
  public resetAll(): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    for (let groupIndex = 0; groupIndex < this.state.length; groupIndex++) {
      const groupState = this.state[groupIndex];
      for (let listIndex = 0; listIndex < groupState.length; listIndex++) {
        const listState = groupState[listIndex];
        for (let branchIndex = 0; branchIndex < listState.length; branchIndex++) {
          const branchState = listState[branchIndex];
          for (let itemIndex = 0; itemIndex < branchState.length; itemIndex++) {
            if (branchState[itemIndex] === true) {
              branchState[itemIndex] = false;
            }
          }
        }
      }
    }

    this.publisher.pub(this.eventTopicMap['checklist_state_all_reset'], undefined, true, false);
  }

  /**
   * Resets all checklists in a single checklist group. Has no effect if this manager is asleep.
   * @param groupIndex The index of the group to reset.
   * @throws Error if this manager has been destroyed.
   */
  public resetGroup(groupIndex: number): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    const groupState = this.state[groupIndex];

    if (!groupState) {
      return;
    }

    for (let listIndex = 0; listIndex < groupState.length; listIndex++) {
      const listState = groupState[listIndex];
      for (let branchIndex = 0; branchIndex < listState.length; branchIndex++) {
        const branchState = listState[branchIndex];
        for (let itemIndex = 0; itemIndex < branchState.length; itemIndex++) {
          if (branchState[itemIndex] === true) {
            branchState[itemIndex] = false;
          }
        }
      }
    }

    this.publisher.pub(this.eventTopicMap['checklist_state_group_reset'], groupIndex, true, false);
  }

  /**
   * Resets all actionable items in a single checklist. Has no effect if this manager is asleep.
   * @param groupIndex The index of the checklist group containing the checklist to reset.
   * @param listIndex The index of the checklist to reset within its group.
   * @throws Error if this manager has been destroyed.
   */
  public resetList(groupIndex: number, listIndex: number): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    const listState = this.state[groupIndex]?.[listIndex];

    if (!listState) {
      return;
    }

    for (let branchIndex = 0; branchIndex < listState.length; branchIndex++) {
      const branchState = listState[branchIndex];
      for (let itemIndex = 0; itemIndex < branchState.length; itemIndex++) {
        if (branchState[itemIndex] === true) {
          branchState[itemIndex] = false;
        }
      }
    }

    this.publisher.pub(this.eventTopicMap['checklist_state_list_reset'], [groupIndex, listIndex], true, false);
  }

  /**
   * Completes all actionable items in a single checklist. Has no effect if this manager is asleep.
   * @param groupIndex The index of the checklist group containing the checklist to complete.
   * @param listIndex The index of the checklist to complete within its group.
   * @throws Error if this manager has been destroyed.
   */
  public completeList(groupIndex: number, listIndex: number): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    const listState = this.state[groupIndex]?.[listIndex];

    if (!listState) {
      return;
    }

    for (let branchIndex = 0; branchIndex < listState.length; branchIndex++) {
      const branchState = listState[branchIndex];
      for (let itemIndex = 0; itemIndex < branchState.length; itemIndex++) {
        if (branchState[itemIndex] === false) {
          branchState[itemIndex] = true;
        }
      }
    }

    this.publisher.pub(this.eventTopicMap['checklist_state_list_completed'], [groupIndex, listIndex], true, false);
  }

  /**
   * Toggles whether an actionable item is completed. Has no effect if this manager is asleep.
   * @param groupIndex The index of the checklist group containing the item to toggle.
   * @param listIndex The index of the checklist containing the item to toggle within its group.
   * @param branchIndex The index of the branch containing the item to toggle within its list, or `-1` if the item is
   * not contained in a branch.
   * @param itemIndex The index of the item to toggle within its checklist.
   * @param force The state to force onto the item. If `true`, then the item will be completed. If `false`, then the
   * item will be reset. If `undefined`, then the item will be toggled to the opposite of its current state.
   * @throws Error if this manager has been destroyed.
   */
  public toggleItem(groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number, force?: boolean): void {
    if (!this.isAlive) {
      throw new Error('ChecklistManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    branchIndex = branchIndex < 0 ? -1 : branchIndex;

    const branchState = this.state[groupIndex]?.[listIndex]?.[branchIndex + 1];

    if (!branchState) {
      return;
    }

    const toggledState = this.tryToggleItemCompleted(branchState, itemIndex, force);
    if (toggledState !== undefined) {
      this.publisher.pub(
        this.eventTopicMap[toggledState ? 'checklist_state_item_completed' : 'checklist_state_item_reset'],
        [groupIndex, listIndex, branchIndex, itemIndex],
        true,
        false
      );
    }
  }

  /**
   * Attempts to toggle whether an actionable item is completed.
   * @param branchState The state array of the checklist containing the item to toggle.
   * @param itemIndex The index of the item to toggle within its checklist.
   * @param force The state to force onto the item. If `true`, then the item will be completed. If `false`, then the
   * item will be reset. If `undefined`, then the item will be toggled to the opposite of its current state.
   * @returns The state of the item after the operation is complete: `true` indicates the item was completed, `false`
   * indicates the item was reset, and `undefined` indicates that the state of the item could not be toggled (either
   * because the item does not exist or because it is not an actionable item).
   */
  private tryToggleItemCompleted(branchState: (boolean | undefined)[], itemIndex: number, force?: boolean): boolean | undefined {
    const currentState = branchState[itemIndex];
    if (currentState !== undefined && (force === undefined || currentState !== force)) {
      branchState[itemIndex] = force ?? !currentState;
      return branchState[itemIndex];
    } else {
      return undefined;
    }
  }

  /**
   * Responds to when a state request is received.
   * @param uuid The UUID of the state request.
   */
  private onStateRequest(uuid: string): void {
    const state: (((number[] | null)[] | null)[] | null)[] = ArrayUtils.create(this.state.length, () => null);

    for (let groupIndex = 0; groupIndex < this.state.length; groupIndex++) {
      const groupState = this.state[groupIndex];
      for (let listIndex = 0; listIndex < groupState.length; listIndex++) {
        const listState = groupState[listIndex];
        for (let branchIndex = 0; branchIndex < listState.length; branchIndex++) {
          const branchState = listState[branchIndex];
          for (let itemIndex = 0; itemIndex < branchState.length; itemIndex++) {
            if (branchState[itemIndex] === true) {
              const groupArray = state[groupIndex] ??= ArrayUtils.create(groupState.length, () => null);
              const listArray = groupArray[listIndex] ??= ArrayUtils.create(listState.length, () => null);
              const branchArray = listArray[branchIndex] ??= [];
              branchArray.push(itemIndex);
            }
          }
        }
      }
    }

    this.publisher.pub(this.eventTopicMap['checklist_state_response'], { uuid, state }, true, false);
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer track the state of its checklist set, will no
   * longer respond to commands to change the state, and will no longer respond to state requests.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
