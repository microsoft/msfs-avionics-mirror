import {
  ArraySubject, ArrayUtils, ChecklistBranchItemLogicType, ChecklistController, ChecklistItemType, DebounceTimer,
  EventBus, FSComponent, MappedSubject, Subject, SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GarminChecklistItem, GarminChecklistLinkItemType } from '@microsoft/msfs-garminsdk';

import { AvionicsStatusEvents, AvionicsStatusGlobalPowerEvent } from '../../AvionicsStatus/AvionicsStatusEvents';
import { G3000ChecklistSetDef } from '../../Checklist/G3000ChecklistDefinition';
import { G3000ChecklistStateProvider } from '../../Checklist/G3000ChecklistStateProvider';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { ChecklistPaneStateManager } from './ChecklistPaneStateManager';
import { ChecklistPaneViewEventTypes } from './ChecklistPaneViewEvents';
import { ChecklistPaneViewItem, ChecklistPaneViewItemList } from './ChecklistPaneViewItemList';

import './ChecklistPaneView.css';

/**
 * Component props for {@link ChecklistPaneView}.
 */
export interface ChecklistPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The definition for the set of checklists displayed by the pane. */
  checklistDef: G3000ChecklistSetDef;

  /** A provider of checklist state. */
  checklistStateProvider: G3000ChecklistStateProvider;
}

/**
 * A display pane view which displays checklists.
 */
export class ChecklistPaneView extends DisplayPaneView<ChecklistPaneViewProps, DisplayPaneViewEvent<ChecklistPaneViewEventTypes>> {
  private static readonly NEXT_CHECKLIST_HIGHLIGHT_DURATION = 5000;

  private readonly checklistController = new ChecklistController(this.props.checklistStateProvider.index, this.props.bus);
  private readonly stateManager = new ChecklistPaneStateManager(this.props.index, this.props.bus, this.props.checklistStateProvider);

  private readonly headerGroupText = this.stateManager.selectedGroup.map(group => group ? group.name : '');
  private readonly headerListText = this.stateManager.selectedList.map(list => list ? list.name : '');
  private readonly headerBranchText = this.stateManager.selectedBranch.map(branch => branch ? `––> ${branch.name}` : '');

  private readonly itemListRef = FSComponent.createRef<ChecklistPaneViewItemList>();
  private readonly itemListData = ArraySubject.create<GarminChecklistItem>();
  private readonly itemListSelectedIndex = Subject.create(-1);

  private needRefreshListStyling = false;

  private readonly isChecklistNotFinished = Subject.create(false);

  private readonly footerRightText = Subject.create('');
  private readonly isFooterRightDisabled = Subject.create(true);
  private readonly isFooterRightSelected = Subject.create(false);
  private readonly isFooterRightHighlighted = Subject.create(false);
  private readonly footerRightHighlightDebounce = new DebounceTimer();
  private readonly removeFooterRightHighlight = this.isFooterRightHighlighted.set.bind(this.isFooterRightHighlighted, false);

  private checklistFinishedPipe?: Subscription;
  private autoAdvanceSub?: Subscription;
  private powerSub?: Subscription;

  private readonly listItemSubs: Subscription[] = [];
  private readonly pauseableSubs: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Checklist');

    this.stateManager.selectedItemIndex.sub(this.onSelectedItemIndexChanged.bind(this), true);

    this.listItemSubs.push(
      this.stateManager.selectedList.sub(this.onSelectedBranchStackChanged.bind(this), false, true),
      this.stateManager.selectedBranchStack.sub(this.onSelectedBranchStackChanged.bind(this), false, true)
    );

    this.pauseableSubs.push(
      MappedSubject.create(
        ([selectedItemIndex, isFooterNextChecklistSelected]) => isFooterNextChecklistSelected ? Number.MAX_SAFE_INTEGER : selectedItemIndex,
        this.stateManager.selectedItemIndex,
        this.isFooterRightSelected
      ).pipe(this.itemListSelectedIndex, true),

      this.isFooterRightSelected.sub(this.onFooterRightSelectedChanged.bind(this), true)
    );

    this.powerSub = this.props.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power')
      .handle(this.onAvionicsGlobalPowerChanged.bind(this));
  }

  /** @inheritDoc */
  public onResume(): void {
    // If there is at least one checklist group, attempt to ensure that a group, list, and item, are all selected.
    if (this.props.checklistStateProvider.state.groups.length > 0) {
      const selectedGroupIndex = this.stateManager.selectedGroupIndex.get();

      if (selectedGroupIndex < 0) {
        // If no group is selected, then select the default group and list.
        this.stateManager.selectGroup(this.props.checklistDef.metadata.defaultGroupIndex, this.props.checklistDef.metadata.defaultListIndex);
      } else {
        // If a group is selected, then do the following:
        // - Select the first list in the group if a list is not selected and keep the existing selection otherwise.
        // - Select the first item in the list if an item is not selected and the next checklist prompt is not selected
        //   and keep the existing selection otherwise.

        if (this.stateManager.selectedListIndex.get() < 0) {
          this.stateManager.selectList(0, -1);
        } else {
          if (this.stateManager.selectedItemIndex.get() < 0 && !this.isFooterRightSelected.get()) {
            this.stateManager.selectFirstItem();
          }
        }
      }
    }

    // If a checklist item is not selected, then ensure that the right footer prompt is selected.
    if (this.stateManager.selectedItemIndex.get() < 0) {
      this.isFooterRightSelected.set(true);
    }

    this.onSelectedBranchStackChanged();

    for (const sub of this.listItemSubs) {
      sub.resume();
    }
    for (const sub of this.pauseableSubs) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.listItemSubs) {
      sub.pause();
    }
    for (const sub of this.pauseableSubs) {
      sub.pause();
    }

    this.checklistFinishedPipe?.destroy();
    this.checklistFinishedPipe = undefined;

    this.itemListData.clear();
    this.itemListSelectedIndex.set(-1);
  }

  /** @inheritDoc */
  public onResize(): void {
    this.needRefreshListStyling = true;
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (this.needRefreshListStyling) {
      this.itemListRef.instance.refreshStyling();
      this.needRefreshListStyling = false;
    }
  }

  /** @inheritDoc */
  public onEvent(event: DisplayPaneViewEvent<ChecklistPaneViewEventTypes>): void {
    switch (event.eventType) {
      case 'display_pane_checklist_prev':
        this.selectPrev();
        break;
      case 'display_pane_checklist_next':
        this.selectNext();
        break;
      case 'display_pane_checklist_push':
        this.pushSelected();
        break;
      case 'display_pane_checklist_select_list':
        this.selectList(...event.eventData as readonly [number, number], -1);
        break;
    }
  }

  /**
   * Selects the previous element in the pane.
   */
  private selectPrev(): void {
    this.autoAdvanceSub?.destroy();
    this.autoAdvanceSub = undefined;

    this.stateManager.selectPrevItem();
  }

  /**
   * Selects the next element in the pane.
   */
  private selectNext(): void {
    this.autoAdvanceSub?.destroy();
    this.autoAdvanceSub = undefined;

    if (!this.isFooterRightSelected.get()) {
      const didSelectItem = this.stateManager.selectNextItem();
      if (!didSelectItem) {
        this.stateManager.deselect(true);
        this.isFooterRightSelected.set(true);
      }
    }
  }

  /**
   * Selects the next element in the pane after the currently selected branch item, skipping all branch item link items
   * whose parent branch item is the currently selected item. If the currently selected item is not a branch item, then
   * this method does nothing.
   */
  private selectNextSkipBranchItemLink(): void {
    this.autoAdvanceSub?.destroy();
    this.autoAdvanceSub = undefined;

    if (this.isFooterRightSelected.get()) {
      return;
    }

    const selectedItem = this.stateManager.selectedItem.get();

    if (!selectedItem || selectedItem.type !== ChecklistItemType.Branch) {
      return;
    }

    const itemsContainer = this.stateManager.selectedBranch.get() ?? this.stateManager.selectedList.get();
    if (!itemsContainer) {
      return;
    }

    let itemToSelectIndex = this.stateManager.selectedItemIndex.get() + 1;
    for (; itemToSelectIndex < itemsContainer.items.length; itemToSelectIndex++) {
      const item = itemsContainer.items[itemToSelectIndex];
      if (
        item.type === ChecklistItemType.Link
        && item.def.linkType === GarminChecklistLinkItemType.BranchItem
        && item.def.branchItem === selectedItem.def.uid
      ) {
        continue;
      }

      break;
    }

    if (itemToSelectIndex < itemsContainer.items.length) {
      this.stateManager.selectItem(itemToSelectIndex);
    } else {
      this.stateManager.deselect(true);
      this.isFooterRightSelected.set(true);
    }
  }

  /**
   * Handles a push event on the currently selected element in the pane.
   */
  private pushSelected(): void {
    if (this.isFooterRightSelected.get()) {
      const branchStack = this.stateManager.selectedBranchStack.get();
      if (branchStack.length > 0) {
        this.goBackToPreviousBranch();
      } else {
        this.stateManager.selectNextList();
      }
    } else {
      const selectedItemIndex = this.stateManager.selectedItemIndex.get();
      const item = this.stateManager.selectedItem.get();

      if (selectedItemIndex < 0 || !item) {
        return;
      }

      switch (item.type) {
        case ChecklistItemType.Actionable:
          this.toggleItem(selectedItemIndex, item);
          break;
        case ChecklistItemType.Branch:
          this.pushBranchItem(selectedItemIndex, item);
          break;
        case ChecklistItemType.Link:
          this.followLink(selectedItemIndex, item);
          break;
        default:
          this.selectNext();
      }
    }
  }

  /**
   * Returns to the previous branch (or base checklist) in the selected branch stack. If the selected item after
   * returning to the previous branch is a branch item link item whose target branch is completed, then the selection
   * will be advanced to the next element in the pane.
   */
  private goBackToPreviousBranch(): void {
    const currentBranchStackEntry = ArrayUtils.peekLast(this.stateManager.selectedBranchStack.get());

    if (!currentBranchStackEntry) {
      return;
    }

    this.stateManager.prevBranch();

    const list = this.stateManager.selectedList.get();

    if (!list) {
      return;
    }

    const selectedItem = this.stateManager.selectedItem.get();

    if (selectedItem && selectedItem.type === ChecklistItemType.Link && selectedItem.def.linkType === GarminChecklistLinkItemType.BranchItem) {
      for (let i = 0; i < list.branches.length; i++) {
        const branch = list.branches[i];
        if (branch.uid === selectedItem.def.target && branch.isCompleted.get()) {
          this.selectNext();
          return;
        }
      }
    }
  }

  /**
   * Handles a push event on a selected branch item.
   * @param itemIndex The index of the selected branch item.
   * @param item The selected branch item.
   */
  private pushBranchItem(itemIndex: number, item: GarminChecklistItem<ChecklistItemType.Branch>): void {
    const renderedItem = this.itemListRef.instance.getRenderedItem(itemIndex);
    if (renderedItem instanceof ChecklistPaneViewItem && renderedItem.item === item && renderedItem.isToggleable()) {
      let allowToggle = true;
      if (item.isOverridden.get()) {
        // If the branch item is overridden, check if it would be considered not completed without the override. If so,
        // then allow the override state to be toggled. Otherwise, advance the selection.

        let isSufficientCompleted = false;
        let isNecessaryCompleted: boolean | undefined = undefined;
        for (let i = 0; !(isSufficientCompleted || !!isNecessaryCompleted) && i < item.def.branchLogic.length; i++) {
          switch (item.def.branchLogic[i]) {
            case ChecklistBranchItemLogicType.Sufficient:
              isSufficientCompleted ||= item.isBranchCompleted[i].get();
              break;
            case ChecklistBranchItemLogicType.Necessary:
              isNecessaryCompleted ??= true;
              isNecessaryCompleted &&= item.isBranchCompleted[i].get();
              break;
          }
        }

        allowToggle = !(isSufficientCompleted || !!isNecessaryCompleted);
      }

      if (allowToggle) {
        this.toggleItem(itemIndex, item);
      } else {
        this.selectNextSkipBranchItemLink();
      }
    } else {
      this.selectNext();
    }
  }

  /**
   * Selects a checklist. If the checklist is already selected, then this method does nothing.
   * @param groupIndex The index of the group containing the checklist to select.
   * @param listIndex The index of the checklist to select in its group.
   * @param branchIndex The index of the checklist branch to select, or -1 to select the base checklist.
   * @param returnItemIndex The index of the checklist item to select when returning from the branch to select to the
   * previously selected branch or base checklist. Ignored if no checklist or the base checklist is selected.
   */
  private selectList(groupIndex: number, listIndex: number, branchIndex: number, returnItemIndex?: number): void {
    if (
      groupIndex !== this.stateManager.selectedGroupIndex.get()
      || listIndex !== this.stateManager.selectedListIndex.get()
      || branchIndex !== this.stateManager.selectedBranchIndex.get()
    ) {
      this.stateManager.selectGroup(groupIndex, listIndex, branchIndex, returnItemIndex);
    }
  }

  /**
   * Toggles the state of an actionable item in the currently selected checklist. If the item is completed, then the
   * next selectable checklist item, or the Go to Next Checklist prompt if there are no selectable checklist items
   * after the completed item, will be automatically selected.
   * @param itemIndex The index of the item to toggle in its checklist.
   * @param item The item to toggle.
   */
  private toggleItem(itemIndex: number, item: GarminChecklistItem<ChecklistItemType.Actionable | ChecklistItemType.Branch>): void {
    if (itemIndex < 0 || !item || (item.type !== ChecklistItemType.Actionable && item.type !== ChecklistItemType.Branch)) {
      return;
    }

    if (!item.isCompleted.get()) {
      this.autoAdvanceSub = item.isCompleted.sub(isCompleted => {
        this.autoAdvanceSub?.destroy();
        this.autoAdvanceSub = undefined;

        if (isCompleted && this.stateManager.selectedItem.get() === item) {
          if (item.type === ChecklistItemType.Branch) {
            this.selectNextSkipBranchItemLink();
          } else {
            this.selectNext();
          }
        }
      });
    }

    this.checklistController.toggleItem(
      this.stateManager.selectedGroupIndex.get(),
      this.stateManager.selectedListIndex.get(),
      this.stateManager.selectedBranchIndex.get(),
      itemIndex
    );
  }

  /**
   * Selects the checklist or branch linked by a link item. If the link target cannot be resolved, then this method
   * does nothing.
   * @param itemIndex The index of the link item to follow in its checklist.
   * @param item The link item to follow.
   */
  private followLink(itemIndex: number, item: GarminChecklistItem<ChecklistItemType.Link>): void {
    const renderedItem = this.itemListRef.instance.getRenderedItem(itemIndex);
    if (renderedItem instanceof ChecklistPaneViewItem && renderedItem.item === item) {
      const targetIndexes = renderedItem.getLinkTargetIndexes();
      if (targetIndexes) {
        const [groupIndex, listIndex, branchIndex] = targetIndexes;
        if (branchIndex < 0) {
          this.selectList(groupIndex, listIndex, -1);
        } else {
          if (groupIndex === this.stateManager.selectedGroupIndex.get() && listIndex === this.stateManager.selectedListIndex.get()) {
            this.selectList(groupIndex, listIndex, branchIndex, itemIndex);
          } else {
            this.selectList(groupIndex, listIndex, branchIndex);
          }
        }
      }
    }
  }

  /**
   * Responds to when this pane's selected checklist branch stack changes.
   */
  private onSelectedBranchStackChanged(): void {
    this.checklistFinishedPipe?.destroy();
    this.checklistFinishedPipe = undefined;

    const list = this.stateManager.selectedList.get();

    if (list === null) {
      this.itemListData.clear();
      this.footerRightText.set('Go to Next Checklist?');
      this.isFooterRightDisabled.set(true);
      return;
    }

    const stack = this.stateManager.selectedBranchStack.get();

    const selectedBranchIndex = ArrayUtils.peekLast(stack)?.branchIndex;
    const branch = selectedBranchIndex === undefined ? undefined : list.branches[selectedBranchIndex];
    const items = selectedBranchIndex === undefined ? list.items : branch?.items;
    const isCompleted = selectedBranchIndex === undefined ? list.isCompleted : branch?.isCompleted;

    const group = this.stateManager.selectedGroup.get();

    if (items) {
      this.itemListData.set(items);
    } else {
      this.itemListData.clear();
    }

    if (selectedBranchIndex === undefined) {
      this.footerRightText.set('Go to Next Checklist?');
      this.isFooterRightDisabled.set(group === null || group.lists.indexOf(list) >= group.lists.length - 1);
    } else {
      this.footerRightText.set('Back to Previous?');
      this.isFooterRightDisabled.set(false);
    }

    if (isCompleted) {
      this.checklistFinishedPipe = isCompleted.pipe(this.isChecklistNotFinished, SubscribableMapFunctions.not());
    } else {
      this.isChecklistNotFinished.set(false);
    }
  }

  /**
   * Responds to when the index of this pane's selected checklist item changes.
   * @param index The index of the new selected checklist item.
   */
  private onSelectedItemIndexChanged(index: number): void {
    if (index >= 0) {
      this.isFooterRightSelected.set(false);
    }
  }

  /**
   * Responds to when whether this pane's right footer prompt is selected changes.
   * @param isSelected Whether the right footer prompt is selected.
   */
  private onFooterRightSelectedChanged(isSelected: boolean): void {
    if (isSelected) {
      this.isFooterRightHighlighted.set(true);
      this.footerRightHighlightDebounce.schedule(this.removeFooterRightHighlight, ChecklistPaneView.NEXT_CHECKLIST_HIGHLIGHT_DURATION);
    } else {
      this.footerRightHighlightDebounce.clear();
      this.isFooterRightHighlighted.set(false);
    }
  }

  /**
   * Responds to when the avionics global power status changes.
   * @param event Event data describing the change in avionics global power status.
   */
  private onAvionicsGlobalPowerChanged(event: AvionicsStatusGlobalPowerEvent): void {
    if (event.current === false && event.previous === true) {
      this.stateManager.deselect(true, true, true, true);
    }
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class='checklist-pane'>
        <div class='checklist-pane-header-box'>
          <div class='checklist-pane-header-group'>
            {this.headerGroupText}
          </div>
          <div class='checklist-pane-header-list'>
            {this.headerListText}
          </div>
          <div class='checklist-pane-header-branch'>
            {this.headerBranchText}
          </div>
        </div>
        <div class='checklist-pane-item-list-box'>
          <ChecklistPaneViewItemList
            ref={this.itemListRef}
            checklistSet={this.props.checklistStateProvider.state}
            items={this.itemListData}
            selectedIndex={this.itemListSelectedIndex}
          />
          <div class='checklist-pane-footer'>
            <div
              class={{
                'checklist-pane-footer-completion': true,
                'checklist-pane-footer-completion-no': true,
                'hidden': MappedSubject.create(
                  ([isChecklistNotFinished, isNextChecklistSelected]) => !isChecklistNotFinished || !isNextChecklistSelected,
                  this.isChecklistNotFinished,
                  this.isFooterRightSelected
                )
              }}
            >
              * Checklist Not Finished *
            </div>
            <div
              class={{
                'checklist-pane-footer-completion': true,
                'checklist-pane-footer-completion-yes': true,
                'hidden': this.isChecklistNotFinished
              }}
            >
              * Checklist Finished *
            </div>
            <div
              class={{
                'checklist-pane-footer-right': true,
                'checklist-pane-footer-right-disabled': this.isFooterRightDisabled,
                'checklist-pane-footer-right-selected': this.isFooterRightSelected,
                'checklist-pane-footer-right-highlight': this.isFooterRightHighlighted
              }}
            >
              {this.footerRightText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.footerRightHighlightDebounce.clear();

    this.itemListRef.getOrDefault()?.destroy();

    this.checklistFinishedPipe?.destroy();
    this.autoAdvanceSub?.destroy();
    this.powerSub?.destroy();

    super.destroy();
  }
}
