import { ArrayUtils, ChecklistBranch, ChecklistGroup, ChecklistItemType, ChecklistList, EventBus, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { GarminChecklistItem, GarminChecklistItemTypeDefMap } from '@microsoft/msfs-garminsdk';

import { G3000ChecklistStateProvider } from '../../Checklist/G3000ChecklistStateProvider';
import { DisplayPaneIndex } from '../DisplayPanes/DisplayPaneTypes';
import { ChecklistPaneStateBranchStackEntry, ChecklistPaneStateEvents } from './ChecklistPaneStateEvents';

/**
 * Type definitions for checklist items that can be selected.
 */
type SelectableChecklistItemDef = GarminChecklistItem<ChecklistItemType.Actionable | ChecklistItemType.Branch | ChecklistItemType.Link | ChecklistItemType.Note>;

/**
 * A manager for the state of a checklist pane view. The manager tracks the view's selected checklist group, checklist,
 * and checklist item and publishes the information to the event bus topics defined in `ChecklistPaneStateEvents`. The
 * view's selections can be changed through the manager using either the event bus topics defined in
 * `ChecklistPaneStateControlEvents` or the methods defined on the manager itself.
 */
export class ChecklistPaneStateManager {
  private readonly publisher = this.bus.getPublisher<ChecklistPaneStateEvents>();

  private readonly _selectedGroupIndex = Subject.create(-1);
  public readonly selectedGroupIndex = this._selectedGroupIndex as Subscribable<number>;

  private readonly _selectedGroup = Subject.create<ChecklistGroup<GarminChecklistItemTypeDefMap> | null>(null);
  public readonly selectedGroup = this._selectedGroup as Subscribable<ChecklistGroup<GarminChecklistItemTypeDefMap> | null>;

  private readonly _selectedListIndex = Subject.create(-1);
  public readonly selectedListIndex = this._selectedListIndex as Subscribable<number>;

  private readonly _selectedList = Subject.create<ChecklistList<GarminChecklistItemTypeDefMap> | null>(null);
  public readonly selectedList = this._selectedList as Subscribable<ChecklistList<GarminChecklistItemTypeDefMap> | null>;

  private readonly _selectedBranchStack = Subject.create<readonly Readonly<ChecklistPaneStateBranchStackEntry>[]>([]);
  public readonly selectedBranchStack = this._selectedBranchStack as Subscribable<readonly Readonly<ChecklistPaneStateBranchStackEntry>[]>;

  public readonly selectedBranchIndex = this._selectedBranchStack.map(stack => ArrayUtils.peekLast(stack)?.branchIndex ?? -1);

  private readonly _selectedBranch = Subject.create<ChecklistBranch<GarminChecklistItemTypeDefMap> | null>(null);
  public readonly selectedBranch = this._selectedBranch as Subscribable<ChecklistBranch<GarminChecklistItemTypeDefMap> | null>;

  private readonly _selectedItemIndex = Subject.create(-1);
  public readonly selectedItemIndex = this._selectedItemIndex as Subscribable<number>;

  private readonly _selectedItem = Subject.create<SelectableChecklistItemDef | null>(null);
  public readonly selectedItem = this._selectedItem as Subscribable<SelectableChecklistItemDef | null>;

  /**
   * Creates a new instance of ChecklistPaneStateManager.
   * @param displayPaneIndex The index of the parent display pane of the manager's view.
   * @param bus The event bus.
   * @param checklistStateProvider A provider of checklist state.
   */
  public constructor(
    private readonly displayPaneIndex: DisplayPaneIndex,
    private readonly bus: EventBus,
    private readonly checklistStateProvider: G3000ChecklistStateProvider
  ) {
    this.publisher.pub(`checklist_pane_selected_group_index_${this.displayPaneIndex}`, -1, true, true);
    this.publisher.pub(`checklist_pane_selected_list_index_${this.displayPaneIndex}`, -1, true, true);
    this.publisher.pub(`checklist_pane_selected_branch_stack_${this.displayPaneIndex}`, [], true, true);
    this.publisher.pub(`checklist_pane_selected_item_index_${this.displayPaneIndex}`, -1, true, true);
  }

  /**
   * Deselects zero or more selections tracked by this manager.
   * @param item Whether to deselect the currently selected checklist item.
   * @param branch Whether to deselect the currently selected checklist branch. Defaults to `false`.
   * @param list Whether to deselect the currently selected checklist. Defaults to `false`.
   * @param group Whether to deselect the currently selected checklist group. Defaults to `false`.
   */
  public deselect(item: boolean, branch = false, list = false, group = false): void {
    if (!item) {
      return;
    }

    this._selectedItemIndex.set(-1);
    this._selectedItem.set(null);
    this.publisher.pub(`checklist_pane_selected_item_index_${this.displayPaneIndex}`, -1, true, true);

    if (!branch) {
      return;
    }

    this._selectedBranchStack.set([]);
    this._selectedBranch.set(null);
    this.publisher.pub(`checklist_pane_selected_branch_stack_${this.displayPaneIndex}`, [], true, true);

    if (!list) {
      return;
    }

    this._selectedListIndex.set(-1);
    this._selectedList.set(null);
    this.publisher.pub(`checklist_pane_selected_list_index_${this.displayPaneIndex}`, -1, true, true);

    if (!group) {
      return;
    }

    this._selectedGroupIndex.set(-1);
    this._selectedGroup.set(null);
    this.publisher.pub(`checklist_pane_selected_group_index_${this.displayPaneIndex}`, -1, true, true);
  }

  /**
   * Selects a checklist group.
   * @param groupIndex The index of the group to select.
   * @param listIndex The index of the checklist to select after the group is selected. If not defined, then the first
   * checklist in the group will be selected, if one exists. Ignored if a group is not selected.
   * @param branchIndex The index of the checklist branch to select, or `-1` to select the base checklist.
   * @param returnItemIndex The index of the checklist item to select when returning from the branch to select to the
   * previously selected branch or base checklist. Ignored if no checklist or the base checklist is selected.
   * @param itemIndex The index of the checklist item to select after the group's checklist is selected. If not
   * defined, then the first selectable item in the checklist will be selected, if one exists. Ignored if a checklist
   * is not selected.
   */
  public selectGroup(groupIndex: number, listIndex?: number, branchIndex?: number, returnItemIndex?: number, itemIndex?: number): void {
    const group = this.checklistStateProvider.state.groups[groupIndex];

    if (!group) {
      this.deselect(true, true, true, true);
      return;
    }

    if (groupIndex !== this._selectedGroupIndex.get()) {
      this.deselect(true, true, true);

      this._selectedGroupIndex.set(groupIndex);
      this._selectedGroup.set(group);
      this.publisher.pub(`checklist_pane_selected_group_index_${this.displayPaneIndex}`, groupIndex, true, true);
    }

    this.selectList(listIndex ?? 0, branchIndex ?? -1, returnItemIndex, itemIndex);
  }

  /**
   * Selects a checklist in the currently selected group. This method does nothing if there is no currently selected
   * group.
   * @param listIndex The index of the checklist to select.
   * @param branchIndex The index of the checklist branch to select, or `-1` to select the base checklist.
   * @param returnItemIndex The index of the checklist item to select when returning from the branch to select to the
   * previously selected branch or base checklist. Ignored if no checklist or the base checklist is selected.
   * @param itemIndex The index of the checklist item to select after the checklist is selected. If not defined, then
   * the first selectable item in the checklist will be selected, if one exists. Ignored if a checklist is not
   * selected.
   */
  public selectList(listIndex: number, branchIndex: number, returnItemIndex?: number, itemIndex?: number): void {
    const group = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()];

    if (!group) {
      return;
    }

    const list = group.lists[listIndex];

    if (!list) {
      this.deselect(true, true, true);
      return;
    }

    if (listIndex !== this._selectedListIndex.get()) {
      this.deselect(true, true);

      this._selectedListIndex.set(listIndex);
      this._selectedList.set(list);
      this.publisher.pub(`checklist_pane_selected_list_index_${this.displayPaneIndex}`, listIndex, true, true);
    }

    this.selectBranch(branchIndex, returnItemIndex, itemIndex);
  }

  /**
   * Selects a checklist branch in the currently selected checklist. This method does nothing if there is no currently
   * selected checklist.
   * @param branchIndex The index of the checklist branch to select, or `-1` to select the base checklist. If the base
   * checklist is selected, then all entries in the selected checklist branch stack will be popped.
   * @param returnItemIndex The index of the checklist item to select when returning from the branch to select to the
   * previously selected branch or base checklist. Ignored if the base checklist is selected.
   * @param itemIndex The index of the checklist item to select after the checklist branch is selected. If not defined,
   * then the first selectable item in the branch will be selected, if one exists.
   */
  public selectBranch(branchIndex: number, returnItemIndex?: number, itemIndex?: number): void {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return;
    }

    if (branchIndex >= list.branches.length) {
      return;
    }

    const branch = list.branches[branchIndex];
    const items = branch?.items ?? list.items;
    const oldStack = this._selectedBranchStack.get();

    if (branch) {
      this.deselect(true);

      this._selectedBranchStack.set([...oldStack, { branchIndex, returnItemIndex: returnItemIndex ?? -1 }]);
      this._selectedBranch.set(branch);
      this.publisher.pub(`checklist_pane_selected_branch_stack_${this.displayPaneIndex}`, Array.from(this._selectedBranchStack.get()), true, true);
    } else {
      if (oldStack.length > 0) {
        this.deselect(true);

        this._selectedBranchStack.set([]);
        this._selectedBranch.set(null);
        this.publisher.pub(`checklist_pane_selected_branch_stack_${this.displayPaneIndex}`, [], true, true);
      }
    }

    if (itemIndex === undefined) {
      itemIndex = items.findIndex(ChecklistPaneStateManager.isItemSelectable);
    }

    this.selectItem(itemIndex);
  }

  /**
   * Returns to the previous branch in the selected checklist branch stack. This method does nothing if there is no currently
   * selected checklist or if the base checklist is selected.
   */
  public prevBranch(): void {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return;
    }

    const selectedBranchStack = this._selectedBranchStack.get();

    if (selectedBranchStack.length === 0) {
      return;
    }

    this.deselect(true);

    let itemIndex = ArrayUtils.last(selectedBranchStack).returnItemIndex;

    this._selectedBranchStack.set(selectedBranchStack.slice(0, selectedBranchStack.length - 1));
    const branchIndex = ArrayUtils.peekLast(this._selectedBranchStack.get())?.branchIndex;
    this._selectedBranch.set(list.branches[branchIndex ?? -1] ?? null);
    this.publisher.pub(`checklist_pane_selected_branch_stack_${this.displayPaneIndex}`, Array.from(this._selectedBranchStack.get()), true, true);

    const items = branchIndex === undefined ? list.items : list.branches[branchIndex]?.items;

    if (!items) {
      return;
    }

    if (itemIndex < 0) {
      itemIndex = items.findIndex(ChecklistPaneStateManager.isItemSelectable);
    }

    this.selectItem(itemIndex);
  }

  /**
   * Selects an item in the currently selected checklist. This method does nothing if there is no currently selected
   * checklist.
   * @param itemIndex The index of the item to select. If the item at the specified index is not selectable, then the
   * current item selection will be retained.
   */
  public selectItem(itemIndex: number): void {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return;
    }

    const branchIndex = this.selectedBranchIndex.get();

    if (branchIndex >= list.branches.length) {
      return;
    }

    const branch = list.branches[branchIndex];
    const item = branch ? branch.items[itemIndex] : list.items[itemIndex];

    if (!item) {
      this.deselect(true);
      return;
    }

    if (!ChecklistPaneStateManager.isItemSelectable(item)) {
      return;
    }

    if (itemIndex !== this._selectedItemIndex.get()) {
      this._selectedItemIndex.set(itemIndex);
      this._selectedItem.set(item);
      this.publisher.pub(`checklist_pane_selected_item_index_${this.displayPaneIndex}`, itemIndex, true, true);
    }
  }

  /**
   * Selects the first selectable checklist item in the currently selected checklist branch. This method does nothing
   * if there is no currently selected checklist or if there are no selectable items in the currently selected branch.
   * @returns Whether a checklist item was successfully selected.
   */
  public selectFirstItem(): boolean {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return false;
    }

    const branchIndex = this.selectedBranchIndex.get();

    if (branchIndex >= list.branches.length) {
      return false;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;

    const itemIndex = items.findIndex(ChecklistPaneStateManager.isItemSelectable);
    if (itemIndex >= 0) {
      this.selectItem(itemIndex);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Selects the next selectable checklist item in the currently selected checklist branch. If there is no currently
   * selected item, then the first selectable item in the branch will be selected. This method does nothing if there is
   * no currently selected checklist or if there are no selectable items after the currently selected item.
   * @returns Whether a new checklist item was successfully selected.
   */
  public selectNextItem(): boolean {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return false;
    }

    const branchIndex = this.selectedBranchIndex.get();

    if (branchIndex >= list.branches.length) {
      return false;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;

    const currentItemIndex = this._selectedItemIndex.get();

    for (let i = currentItemIndex + 1; i < items.length; i++) {
      const item = items[i];
      if (ChecklistPaneStateManager.isItemSelectable(item)) {
        this.selectItem(i);
        return true;
      }
    }

    return false;
  }

  /**
   * Selects the previous selectable checklist item in the currently selected checklist branch. If there is no currently
   * selected item, then the last selectable item in the branch will be selected. This method does nothing if there is
   * no currently selected checklist or if there are no selectable items before the currently selected item.
   * @returns Whether a new checklist item was successfully selected.
   */
  public selectPrevItem(): boolean {
    const list = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()]?.lists[this._selectedListIndex.get()];

    if (!list) {
      return false;
    }

    const branchIndex = this.selectedBranchIndex.get();

    if (branchIndex >= list.branches.length) {
      return false;
    }

    const branch = list.branches[branchIndex];
    const items = branch ? branch.items : list.items;

    const currentItemIndex = this._selectedItemIndex.get();

    for (let i = (currentItemIndex < 0 ? items.length : currentItemIndex) - 1; i >= 0; i--) {
      const item = items[i];
      if (ChecklistPaneStateManager.isItemSelectable(item)) {
        this.selectItem(i);
        return true;
      }
    }

    return false;
  }

  /**
   * Selects the next checklist in the currently selected checklist group. If there is no currently selected checklist,
   * then the first checklist in the group will be selected. This method does nothing if there is no currently selected
   * group or if there are no checklists after the currently selected checklist.
   * @returns Whether a new checklist was successfully selected.
   */
  public selectNextList(): boolean {
    const group = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()];

    if (!group) {
      return false;
    }

    const nextListIndex = this._selectedListIndex.get() + 1;

    if (nextListIndex < group.lists.length) {
      this.selectList(nextListIndex, -1);
      return true;
    }

    return false;
  }

  /**
   * Selects the previous checklist in the currently selected checklist group. If there is no currently selected
   * checklist, then the last checklist in the group will be selected. This method does nothing if there is no
   * currently selected group or if there are no checklists before the currently selected checklist.
   * @returns Whether a new checklist was successfully selected.
   */
  public selectPrevList(): boolean {
    const group = this.checklistStateProvider.state.groups[this._selectedGroupIndex.get()];

    if (!group) {
      return false;
    }

    const currentListIndex = this._selectedListIndex.get();
    const prevListIndex = (currentListIndex < 0 ? group.lists.length : currentListIndex) - 1;

    if (prevListIndex >= 0) {
      this.selectList(prevListIndex, -1);
      return true;
    }

    return false;
  }

  /**
   * Selects the next checklist group. If there is no currently selected group, then the first group will be selected.
   * This method does nothing if there are no groups after the currently selected group.
   * @returns Whether a new checklist group was successfully selected.
   */
  public selectNextGroup(): boolean {
    const nextGroupIndex = this._selectedGroupIndex.get() + 1;

    if (nextGroupIndex < this.checklistStateProvider.state.groups.length) {
      this.selectGroup(nextGroupIndex);
      return true;
    }

    return false;
  }

  /**
   * Selects the previous checklist group. If there is no currently selected group, then the last group will be
   * selected. This method does nothing if there are no groups before the currently selected group.
   * @returns Whether a new checklist group was successfully selected.
   */
  public selectPrevGroup(): boolean {
    const currentGroupIndex = this._selectedGroupIndex.get();
    const prevGroupIndex = (currentGroupIndex < 0 ? this.checklistStateProvider.state.groups.length : currentGroupIndex) - 1;

    if (prevGroupIndex >= 0) {
      this.selectGroup(prevGroupIndex);
      return true;
    }

    return false;
  }

  /**
   * Checks whether a checklist item is selectable.
   * @param item The item to check.
   * @returns Whether the specified checklist item is selectable.
   */
  private static isItemSelectable(item: GarminChecklistItem): item is SelectableChecklistItemDef {
    return item.type === ChecklistItemType.Actionable
      || item.type === ChecklistItemType.Branch
      || item.type === ChecklistItemType.Link
      || item.type === ChecklistItemType.Note;
  }
}
