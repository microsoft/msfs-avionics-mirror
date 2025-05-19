import {
  ArraySubject, ChecklistActionableItemDef, ChecklistCompletableItem, ChecklistController, ChecklistGroup, ChecklistItemType, ChecklistList, ChecklistStateEvents,
  ChecklistStateProvider, EventBus, FocusPosition, FSComponent, MathUtils, ScrollDirection, Subject, Subscribable, SubscribableMapFunctions, Subscription,
  ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { WT21ChecklistSetDef, WT21UiControl, WT21UiControlList, WT21UiControlListProps, WT21UiControlProps } from '@microsoft/msfs-wt21-shared';

import { ChecklistViewBase, ChecklistViewBaseProps } from './ChecklistViewBase';
import { ChecklistViewService, ViewId } from './ChecklistViewService';

import './Checklist.css';

/**
 * The properties for a Checklist component.
 */
export interface ChecklistProps extends WT21UiControlProps {
  /** The event bus. */
  readonly bus: EventBus;

  /** The checklist definition */
  readonly checklistDef: WT21ChecklistSetDef;

  /** The checklist state provider */
  readonly checklistStateProvider: ChecklistStateProvider;
}

/**
 * The Checklist component.
 */
export class Checklist extends WT21UiControl<ChecklistProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly viewService: ChecklistViewService = new ChecklistViewService();
  private readonly checklistController = new ChecklistController(this.props.checklistStateProvider.index, this.props.bus);
  private readonly checklistIndexRef = FSComponent.createRef<ChecklistIndexView>();
  private readonly checklistPreambleRef = FSComponent.createRef<ChecklistPreambleView>();
  private readonly checklistMenuRef = FSComponent.createRef<ChecklistMenuView>();
  private readonly checklistDisplayRef = FSComponent.createRef<ChecklistDisplayView>();

  /**
   * Sets the visibility of the checklist.
   * @param visible Whether the checklist is visible.
   */
  public setVisibility(visible: boolean): void {
    this.rootRef.instance.classList.toggle('hidden', !visible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='checklist-container'>
        <ChecklistIndexView
          ref={this.checklistIndexRef}
          bus={this.props.bus}
          viewService={this.viewService}
          checklistStateProvider={this.props.checklistStateProvider}
          checklistController={this.checklistController}
        />
        <ChecklistPreambleView
          ref={this.checklistPreambleRef}
          viewService={this.viewService}
          checklistDef={this.props.checklistDef}
          checklistStateProvider={this.props.checklistStateProvider}
        />
        <ChecklistMenuView
          ref={this.checklistMenuRef}
          viewService={this.viewService}
          checklistStateProvider={this.props.checklistStateProvider}
        />
        <ChecklistDisplayView
          ref={this.checklistDisplayRef}
          viewService={this.viewService}
          checklistStateProvider={this.props.checklistStateProvider}
          checklistController={this.checklistController}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.registerViews();

    this.viewService.show(ViewId.ChecklistIndex);
  }

  /**
   * Registers the views with the view service.
   */
  private registerViews(): void {
    this.viewService.registerView(ViewId.ChecklistIndex, this.checklistIndexRef.instance);
    this.viewService.registerView(ViewId.NormalChecklistPreamble, this.checklistPreambleRef.instance);
    this.viewService.registerView(ViewId.ChecklistMenu, this.checklistMenuRef.instance);
    this.viewService.registerView(ViewId.ChecklistDisplay, this.checklistDisplayRef.instance);
  }
}

/**
 * The properties for a Checklist Index View.
 */
interface ChecklistIndexViewProps extends ChecklistViewBaseProps {
  /** The event bus. */
  readonly bus: EventBus;

  /** The checklist state provider. */
  readonly checklistStateProvider: ChecklistStateProvider;

  /** The checklist controller. */
  readonly checklistController: ChecklistController;
}

/**
 * The Checklist Index View.
 */
class ChecklistIndexView extends ChecklistViewBase<ChecklistIndexViewProps> {
  /**
   * Whether the RESET CHECKLIST COMPLETE HISTORY button should be hidden. It's shown when at least one checklist is started or completed.
   */
  private readonly hideResetButton = Subject.create(true);
  /** Keeps track of the number of completed items across all checklists for the purpose of showing and hiding the reset button. */
  private completedItemCount = 0;

  private static readonly MAX_CHECKLIST_MENU_ROWS = 6;

  /** @inheritdoc */
  public render(): VNode {
    const checklistMenuRows = this.props.checklistStateProvider.state.groups
      .slice(0, ChecklistIndexView.MAX_CHECKLIST_MENU_ROWS)
      .map((group, index) => (
        <SelectableChecklistRow onPressed={() => this.onMenuPressed(index)}>{group.name} MENU</SelectableChecklistRow>
      ));

    return (
      <div class={{
        'hidden': this.hidden,
      }}>
        <ChecklistRow centered>CHECKLIST INDEX</ChecklistRow>
        <ChecklistRow />
        {checklistMenuRows}
        <ChecklistRow disabled>CHECKLIST/PASS BRIEF CONFIG MENU</ChecklistRow>
        <SelectableChecklistRow
          class={{
            'hidden': this.hideResetButton,
          }}
          onPressed={this.onResetPressed.bind(this)}
          disabled={this.hideResetButton}
        >RESET CHECKLIST COMPLETE HISTORY</SelectableChecklistRow>
      </div>
    );
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    // Keep track of the number of completed items across all checklists to show/hide the reset button
    const providerIdx = this.props.checklistStateProvider.index;

    this.props.bus.getSubscriber<ChecklistStateEvents>().on(`checklist_state_item_completed_${providerIdx}`).handle(() => {
      this.completedItemCount += 1;

      if (this.completedItemCount === 1) {
        // At least one item has been completed, show the reset button
        this.hideResetButton.set(false);
      }
    });

    this.props.bus.getSubscriber<ChecklistStateEvents>().on(`checklist_state_item_reset_${providerIdx}`).handle(() => {
      this.completedItemCount -= 1;

      if (this.completedItemCount === 0) {
        // All items have been reset/unchecked, hide the reset button
        this.hideResetButton.set(true);
      }
    });
  }

  /** @inheritdoc */
  public onShow(): void {
    super.onShow();

    this.focus(FocusPosition.First);
  }

  /**
   * Handles one of the CHECKLIST MENU buttons being pressed.
   * @param index The index of the group that was pressed.
   */
  private onMenuPressed(index: number): void {
    this.props.viewService.setGroupIndex(index);

    if (this.props.viewService.preambleAcknowledged.get()) {
      this.props.viewService.show(ViewId.ChecklistMenu);
    } else {
      this.props.viewService.show(ViewId.NormalChecklistPreamble);
    }
  }

  /**
   * Handles the RESET CHECKLIST COMPLETE HISTORY button being pressed.
   */
  private onResetPressed(): void {
    this.props.checklistController.resetAll();

    // Reset the completed item count and hide the reset button
    this.completedItemCount = 0;
    this.hideResetButton.set(true);

    this.focus(FocusPosition.First);
  }
}

/**
 * The properties for a Checklist Preamble View.
 */
interface ChecklistPreambleViewProps extends ChecklistViewBaseProps {
  /** The checklist definition. */
  readonly checklistDef: WT21ChecklistSetDef;

  /** The checklist state provider. */
  readonly checklistStateProvider: ChecklistStateProvider;
}

/**
 * The Checklist Preamble View.
 */
class ChecklistPreambleView extends ChecklistViewBase<ChecklistPreambleViewProps> {
  private readonly currentGroupName = Subject.create<string>('');

  private static readonly DEFAULT_PREAMBLE = [
    'CHECKLIST  DB VER/DATE: 2/7/2011',
    'PASS BRIEF DB VER/DATE: 2/7/2011',
    'PREAMBLE: THESE CHECKLISTS ARE NOT',
    '   APPROVED. THE PLANE MUST BE OPERATED',
    '   ACCORDING TO THE PILOTS OPERATINGC',
    '   HANDBOOK AND AIRCRAFT FLIGHT MANUAL.',
    '   ELECTRONIC CHECKLISTS DO NOT INCLUDE',
    '   COCKPIT PREP AND AIRCRAFT OPTIONS.',
  ];
  private static readonly MAX_PREAMBLE_ROWS = 8;

  /** @inheritdoc */
  public onMfdEsc(): boolean {
    this.props.viewService.show(ViewId.ChecklistIndex);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    const preambleLines = this.props.checklistDef.preambleLines || ChecklistPreambleView.DEFAULT_PREAMBLE;

    return (
      <div class={{
        'hidden': this.hidden,
      }}>
        <ChecklistRow centered>{this.currentGroupName} MENU</ChecklistRow>
        {
          preambleLines
            .slice(0, ChecklistPreambleView.MAX_PREAMBLE_ROWS)
            .map((line) => (
              <ChecklistRow>{line}</ChecklistRow>
            ))
        }
        <SelectableChecklistRow onPressed={this.onAcknowledgePressed.bind(this)}>PRESS SELECT TO ACKNOWLEDGE</SelectableChecklistRow>
      </div>
    );
  }

  /** @inheritdoc */
  public onShow(): void {
    super.onShow();

    const groupIdx = this.props.viewService.currentGroupIndex.get();
    this.currentGroupName.set(this.props.checklistStateProvider.state.groups[groupIdx].name);

    this.focus(FocusPosition.First);
  }

  /**
   * Handles the acknowledge button being pressed.
   */
  private onAcknowledgePressed(): void {
    this.props.viewService.setPreambleAcknowledged(true);
    this.props.viewService.show(ViewId.ChecklistMenu);
  }
}

/**
 * A checklist list with its index.
 */
type ChecklistListWithIndex = ChecklistList & {
  /**
   * The index of the list within the group.
   */
  index: number;
};

/**
 * The properties for a Checklist Menu View.
 */
interface ChecklistMenuViewProps extends ChecklistViewBaseProps {
  /** The checklist state provider. */
  readonly checklistStateProvider: ChecklistStateProvider;
}

/**
 * The Checklist Menu View.
 */
class ChecklistMenuView extends ChecklistViewBase<ChecklistMenuViewProps> {
  private readonly listRef = FSComponent.createRef<PaginatedList<ChecklistListWithIndex>>();
  private readonly currentItems = ArraySubject.create<ChecklistListWithIndex>();
  private readonly currentPage = Subject.create(0);
  private readonly currentGroup = Subject.create<ChecklistGroup | undefined>(undefined);
  private readonly pageCount = this.currentGroup.map((group) => group && MathUtils.ceil(group.lists.length / ChecklistViewBase.ITEMS_PER_PAGE));
  private isNormalChecklist = false;

  /** @inheritdoc */
  public onMfdEsc(): boolean {
    this.props.viewService.show(ViewId.ChecklistIndex);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'hidden': this.hidden,
      }}>
        <ChecklistRow centered>{this.currentGroup.map((g) => g?.name)} MENU PG {this.currentPage.map((v) => v + 1)}/{this.pageCount}</ChecklistRow>
        <ChecklistRow />
        <PaginatedList
          ref={this.listRef}
          data={this.currentItems}
          itemsPerPage={ChecklistViewBase.ITEMS_PER_PAGE}
          itemSize={ChecklistViewBase.ROW_ITEM_HEIGHT_PX}
          renderItem={this.renderItem.bind(this)}
          onPageChanged={(page) => this.currentPage.set(page)}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public onShow(): void {
    super.onShow();

    const group = this.props.checklistStateProvider.state.groups[this.props.viewService.currentGroupIndex.get()];
    const lists = group.lists;

    this.currentGroup.set(group);

    this.isNormalChecklist = group.name === 'NORMAL CHECKLIST';

    // We need to store the index because the index renderItem receives is the index of the item within the page, not
    // the index of the item within the group.
    this.currentItems.set(lists.map((list, index) => ({
      ...list,
      index
    })));

    // Focus the first uncompleted checklist (if no checklists are uncompleted, focus the first checklist)
    const firstUncompletedListIdx = Math.max(0, lists.findIndex((list) => !list.isCompleted.get()));
    this.listRef.instance.scrollToIndex(firstUncompletedListIdx);
  }

  /**
   * Renders a checklist list item.
   * @param item The item to render.
   * @returns The rendered item.
   */
  private renderItem(item: ChecklistListWithIndex): VNode {
    if (this.isNormalChecklist) {
      const hideCompleteLabel = item.isCompleted.map(SubscribableMapFunctions.not());

      return (
        <SelectableChecklistRow class={{
          'checklist-row': true,
          'checklist-row-completed': item.isCompleted,
        }} onPressed={() => this.props.viewService.showChecklist(item.index)}>
          {item.name}
          <span class={{
            'hidden': hideCompleteLabel,
            'checklist-row-dots': true,
          }}>........................................</span>
          <span class={{
            'hidden': hideCompleteLabel,
          }}>COMPLETE</span>
        </SelectableChecklistRow>
      );
    } else {
      return (
        <SelectableChecklistRow class='checklist-row' onPressed={() => this.props.viewService.showChecklist(item.index)}>
          {item.name}
        </SelectableChecklistRow>
      );
    }
  }
}

/**
 * A checklist item with its index.
 */
type ChecklistItemWithIndex = ChecklistCompletableItem & {
  /**
   * The index of the item within the Checklist List.
   */
  index: number;
};

/**
 * A checklist entry.
 */
type ChecklistEntry = ChecklistItemWithIndex | {
  /** The name of the item. */
  name: string | Subscribable<string>;

  /** Whether the entry should be marked as completed. */
  isCompleted: Subscribable<boolean>;

  /** The callback to call when this entry is pressed. */
  onPress: () => void;
};

/**
 * The properties for a Checklist Display View.
 */
interface ChecklistDisplayViewProps extends ChecklistViewBaseProps {
  /** The checklist state provider. */
  readonly checklistStateProvider: ChecklistStateProvider;

  /** The checklist controller. */
  readonly checklistController: ChecklistController;
}

/**
 * The Checklist Display View.
 */
class ChecklistDisplayView extends ChecklistViewBase<ChecklistDisplayViewProps> {
  private readonly listRef = FSComponent.createRef<PaginatedList<ChecklistEntry>>();
  private readonly currentItems = ArraySubject.create<ChecklistEntry>();
  private readonly currentPage = Subject.create(0);
  private readonly pageCount = Subject.create(-1);
  private readonly currentGroup = Subject.create<ChecklistGroup | undefined>(undefined);
  private readonly currentChecklist = Subject.create<ChecklistList | undefined>(undefined);
  private isNormalChecklist = false;
  private autoAdvanceSub: Subscription | undefined = undefined;

  /** @inheritdoc */
  public onMfdEsc(): boolean {
    this.props.viewService.show(ViewId.ChecklistMenu);

    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'hidden': this.hidden,
      }}>
        <ChecklistRow centered>{this.currentGroup.map((c) => c?.name)} MENU PG {this.currentPage.map((v) => v + 1)}/{this.pageCount}</ChecklistRow>
        <ChecklistRow>{this.currentChecklist.map((c) => c?.name)}</ChecklistRow>
        <PaginatedList
          ref={this.listRef}
          data={this.currentItems}
          itemsPerPage={ChecklistViewBase.ITEMS_PER_PAGE}
          itemSize={ChecklistViewBase.ROW_ITEM_HEIGHT_PX}
          renderItem={this.renderItem.bind(this)}
          onPageChanged={(page) => this.currentPage.set(page)}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public onShow(): void {
    super.onShow();

    const currentGroup = this.props.checklistStateProvider.state.groups[this.props.viewService.currentGroupIndex.get()];
    const currentChecklist = currentGroup.lists[this.props.viewService.currentListIndex.get()];

    this.currentGroup.set(currentGroup);
    this.currentChecklist.set(currentChecklist);

    this.isNormalChecklist = currentGroup.name.toUpperCase().includes('NORMAL');

    // We need to store the index because the index renderItem receives is the index of the item within the page, not
    // the index of the item within the group.
    const items: ChecklistEntry[] = currentChecklist.items
      .filter((item) => item.type === ChecklistItemType.Actionable) // Only actionable items are supported (for now)
      .map((item, index) => ({
        ...(item as ChecklistCompletableItem),
        index,
      }));

    items.push(this.createChecklistEndEntry(currentGroup, currentChecklist));

    this.currentItems.set(items);

    // Focus the first uncompleted item (if no items are uncompleted, focus the first item)
    const firstUncompletedItemIdx = Math.max(0, items.findIndex((item) => !item.isCompleted.get()));
    this.listRef.instance.scrollToIndex(firstUncompletedItemIdx);

    this.pageCount.set(MathUtils.ceil(items.length / ChecklistViewBase.ITEMS_PER_PAGE));
  }

  /**
   * Renders a checklist item.
   * @param item The item to render.
   * @returns The rendered item.
   */
  private renderItem(item: ChecklistEntry): VNode {
    if ('type' in item) {
      const itemDef = item.def as ChecklistActionableItemDef;

      return (
        <SelectableChecklistRow class={{
          'checklist-row': true,
          'checklist-row-completed': item.isCompleted,
        }} onPressed={() => this.onItemPressed(item)}>
          <svg viewBox='1 0 7 12' class={{
            'checklist-item-check': true,
            'checklist-item-check-hidden': item.isCompleted.map(SubscribableMapFunctions.not()),
          }}>
            <path d='M 1 10 L 2 8 L 3 9 C 4 6 6 3 8 0 L 9 2 C 7 4 5 8 4 12 L 3 12 Z' />
          </svg>
          <span class='checklist-item-label'>{itemDef.labelText}</span>
          <span class='checklist-row-dots'>........................................</span>
          <span class='checklist-item-label'>{itemDef.actionText}</span>
        </SelectableChecklistRow>
      );
    } else {
      return (
        <SelectableChecklistRow class={{
          'checklist-row-completed': item.isCompleted,
        }} onPressed={item.onPress.bind(this)}>
          {item.name}
        </SelectableChecklistRow>
      );
    }
  }

  /**
   * Handles a checklist item being pressed.
   * @param item The item that was pressed.
   */
  private onItemPressed(item: ChecklistItemWithIndex): void {
    if (!item.isCompleted.get()) {
      // We need to sub here because `toggleItem` may not complete synchronously on MFD2 as the ChecklistManager lives on MFD1.
      this.autoAdvanceSub = item.isCompleted.sub(() => {
        this.autoAdvanceSub?.destroy();
        this.autoAdvanceSub = undefined;

        const items = this.currentItems.getArray();

        // If we completed the last item in the checklist, jump back to the first uncompleted item (if any)
        if (item.index === this.currentItems.length - 2) {
          const firstUncompletedItemIdx = items.findIndex((i) => !i.isCompleted.get());

          if (firstUncompletedItemIdx >= 0) {
            this.listRef.instance.scrollToIndex(firstUncompletedItemIdx);
            return;
          }
        }

        // If we completed all items on the current page, scroll to the next uncompleted item. If there are no uncompleted items left,
        // scroll to the checklist end button.
        const currentPage = this.currentPage.get();
        const currentPageItems = items.slice(ChecklistViewBase.ITEMS_PER_PAGE * currentPage, ChecklistViewBase.ITEMS_PER_PAGE * (currentPage + 1));
        const allItemsCompleted = currentPageItems.every((i) => i.isCompleted.get());
        if (allItemsCompleted) {
          const nextUncompletedItemIdx = items.findIndex((i) => 'type' in i && !i.isCompleted.get() && i.index > item.index);

          if (nextUncompletedItemIdx >= 0) {
            this.listRef.instance.scrollToIndex(nextUncompletedItemIdx);
          } else {
            this.listRef.instance.scrollToIndex(this.currentItems.length - 1);
          }

          return;
        }

        // Otherwise, just scroll to the next item.
        this.listRef.instance.scroll('forward');
      });
    }

    this.props.checklistController.toggleItem(this.props.viewService.currentGroupIndex.get(), this.props.viewService.currentListIndex.get(), -1, item.index);
  }

  /**
   * Creates the last button entry in the checklist.
   * @param group The checklist group.
   * @param checklist The checklist.
   * @returns The last button entry.
   */
  private createChecklistEndEntry(group: ChecklistGroup, checklist: ChecklistList): ChecklistEntry {
    const listIndex = this.props.viewService.currentListIndex.get();

    let name;
    if (this.isNormalChecklist && listIndex < group.lists.length - 1) {
      name = checklist.isCompleted.map((v) => v ? 'CHKLIST COMPLETE : NEXT NORMAL CHKLIST' : 'NEXT NORMAL CHKLIST');
    } else {
      name = 'RETURN TO CKLST MENU';
    }

    return {
      name,
      isCompleted: checklist.isCompleted,
      onPress: () => {
        if (listIndex === group.lists.length - 1 || !this.isNormalChecklist) {
          // Return to the checklist menu if this is the last list in the group or if this is not a normal checklist
          this.props.viewService.show(ViewId.ChecklistMenu);
        } else {
          this.props.viewService.showChecklist(this.props.viewService.currentListIndex.get() + 1);
        }
      },
    };
  }
}

/**
 * The properties for a Checklist Row component.
 */
interface ChecklistRowProps extends WT21UiControlProps {
  /**
   * Whether the contents of the row should be centered.
   */
  readonly centered?: boolean;

  /**
   * The CSS class(es) to add to the row container element.
   */
  readonly class?: string | ToggleableClassNameRecord;

  /**
   * A callback invoked when the PUSH SELECT knob is pushed with the current item selected.
   */
  readonly onPressed?: () => void;
}

/**
 * A checklist row component which can be focused and selected. When focused, the row is highlighted, when
 * selected (by pressing the PUSH SELECT knob), the `onPressed` callback is invoked.
 */
class SelectableChecklistRow<P extends ChecklistRowProps = ChecklistRowProps> extends WT21UiControl<P> {
  protected readonly el = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.props.onPressed) {
      this.props.onPressed();
      return true;
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    const classes: ToggleableClassNameRecord = {
      'checklist-row-container': true,
      'checklist-row-container-centered': this.props.centered || false,
      'checklist-row-disabled': this.props.disabled || false
    };

    if (typeof this.props.class === 'string') {
      classes[this.props.class] = true;
    } else {
      Object.assign(classes, this.props.class);
    }

    return (
      <div ref={this.el} class={classes}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * A checklist row component which is not interactable (can't be focused or selected).
 */
class ChecklistRow extends SelectableChecklistRow<ChecklistRowProps> {
  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.setDisabled(true);
  }
}

/**
 * The properties for a Paginated List component.
 */
interface PaginatedListProps<T> extends WT21UiControlListProps<T> {
  /**
   * The number of items to display per page.
   */
  itemsPerPage: number;

  /**
   * A callback invoked when the current page changes.
   */
  onPageChanged?: (page: number) => void;
}

/**
 * A list component that displays a paginated subset of items at a time and allows scrolling through the items. When the end of the current
 * page is reached, the next page is displayed.
 *
 * When the list's `props.data` is modified, the entire list is invalidated and the first page is displayed.
 *
 * @template T The type of the items in the list.
 */
class PaginatedList<T> extends WT21UiControlList<T, PaginatedListProps<T>> {
  private readonly currentPage = Subject.create(0);

  /** @inheritdoc */
  protected onScroll(direction: ScrollDirection): boolean {
    const currentIndex = this.getFocusedIndex();
    const currentPage = this.currentPage.get();
    const pageCount = MathUtils.ceil(this.props.data.length / this.props.itemsPerPage);

    if (direction === 'forward' && currentIndex + 1 === this.props.itemsPerPage && currentPage + 1 < pageCount) {
      this.showPage(currentPage + 1, FocusPosition.First);
      return true;
    } else if (direction === 'backward' && currentIndex === 0 && currentPage > 0) {
      this.showPage(currentPage - 1, FocusPosition.Last);
      return true;
    }

    return super.onScroll(direction);
  }

  /**
   * Scrolls to the page containing the given item and focuses is.
   * @param index The index of the list item to scroll to and focus.
   */
  public scrollToIndex(index: number): void {
    const targetPage = Math.floor(index / this.props.itemsPerPage);
    const itemIndex = index % this.props.itemsPerPage;

    if (targetPage !== this.currentPage.get()) {
      this.showPage(targetPage);
    }

    super.scrollToIndex(itemIndex);
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    this.props.numItems = this.props.itemsPerPage;

    if (this.props.onPageChanged) {
      this.currentPage.sub(this.props.onPageChanged);
    }

    this.props.data.sub(() => {
      // Reset the current page when the data changes and focus the first item
      this.currentPage.set(0);
      this.focus(FocusPosition.First);
    });

    super.onAfterRender(node);
  }

  /**
   * Shows a specific page of items.
   * @param page The page to show.
   * @param focusPosition The item position to focus on the shown page.
   */
  private showPage(page: number, focusPosition?: FocusPosition): void {
    this.onDataCleared();
    this.onDataAdded(0, this.props.data.getArray().slice(this.props.itemsPerPage * page, this.props.itemsPerPage * (page + 1)));

    if (focusPosition) {
      this.focus(focusPosition);
    }

    this.currentPage.set(page);
  }
}
