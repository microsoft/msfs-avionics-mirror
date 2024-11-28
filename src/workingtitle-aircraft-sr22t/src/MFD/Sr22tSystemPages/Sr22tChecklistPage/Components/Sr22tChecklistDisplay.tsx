import { ArraySubject, EventBus, FocusPosition, FSComponent, MathUtils, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { G1000ControlList, G1000UiControl, G1000UiControlProps } from '@microsoft/msfs-wtg1000';

import {
  Sr22tChecklistEvents, Sr22tChecklistItem, Sr22tChecklistItemReadonly, Sr22tChecklistItemState,
  Sr22tChecklistItemType, Sr22tChecklistPageFocusableItemType, Sr22tChecklistReadonly, Sr22tChecklistRepository,
} from '../../../../Shared/ChecklistSystem';
import { Sr22tChecklistItemDisplay } from './Sr22tChecklistItemDisplay';
import { Sr22tChecklistCategorySelectionControl, Sr22tChecklistSelectionControl } from './Sr22tChecklistSelectionUiControl';
import { NextChecklistControl } from './Sr22tChecklistNextButton';

import './Sr22tChecklistDisplay.css';

/** Component props for the {@link Sr22tChecklistDisplay} component */
export interface Sr22tChecklistDisplayProps extends G1000UiControlProps {
  /** The event bus */
  bus: EventBus;
  /** The checklist repository */
  repo: Sr22tChecklistRepository;
  /** The checklist to display. */
  checklist: Subscribable<Sr22tChecklistReadonly>;
  /** Whether the checklist is completed. */
  isChecklistCompleted: Subscribable<boolean>;
  /** The focused item type. */
  focusedItemType: Subject<Sr22tChecklistPageFocusableItemType>;
  /** Function to open checklist popups. */
  openChecklistPopup: (type: 'category' | 'checklist') => void;
}

/** A display component for the SR22T checklist. */
export class Sr22tChecklistDisplay extends G1000UiControl<Sr22tChecklistDisplayProps> {
  private readonly scrollContainer = FSComponent.createRef<HTMLDivElement>();
  protected readonly checklistItemListRef = FSComponent.createRef<G1000ControlList<Sr22tChecklistItemReadonly>>();

  private items = ArraySubject.create<Sr22tChecklistItemReadonly>([]);

  private previousIndex = 0;
  private ensureIndexInView: ((index: number, pinDirection: 'none' | 'top' | 'bottom') => void) | undefined;

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.checklist.sub(checklist => {
      this.items.set([...checklist.items]);
      this.previousIndex = 0;
      this.checklistItemListRef.instance.focus(FocusPosition.MostRecent);
    }, true);

    this.ensureIndexInView = this.checklistItemListRef.instance.ensureIndexInView.bind(this.checklistItemListRef.instance);
    this.checklistItemListRef.instance.ensureIndexInView = this.replaceEnsureIndexInView.bind(this);
  }

  /**
   * Toggle the completed status of the item.
   * @param item The item to toggle the completed status of.
   * @returns Whether the required action was successful.
   */
  private toggleItemCompletedStatus(item: Sr22tChecklistItemReadonly): boolean {
    if (item && item.type === Sr22tChecklistItemType.Checkbox) {
      const checklist = this.props.checklist.get();
      const itemIndex = checklist.items.indexOf(item);
      // Scroll forward if we're completing the item, don't scroll if we're resetting the item to incomplete
      if (item.state.get() === Sr22tChecklistItemState.Incomplete) {
        this.scroll('forward');
      }
      if (itemIndex >= 0) {
        this.props.bus.getPublisher<Sr22tChecklistEvents>()
          .pub('sr22t_checklist_event', {
            type: 'item_changed',
            checklistName: checklist.name,
            itemIndex: itemIndex,
            itemState: item.state.get() === Sr22tChecklistItemState.Completed ? Sr22tChecklistItemState.Incomplete : Sr22tChecklistItemState.Completed,
          });
        return true;
      }
    } else if (item && item.type === Sr22tChecklistItemType.Text) {
      this.scroll('forward');
      return true;
    }
    return false;
  }

  /**
   * Sets the item to incomplete.
   * @param item The item to set to incomplete.
   */
  private setItemIncomplete(item: Sr22tChecklistItemReadonly): void {
    if (item && item.type === Sr22tChecklistItemType.Checkbox && item.state.get() === Sr22tChecklistItemState.Completed) {
      const checklist = this.props.checklist.get();
      const itemIndex = checklist.items.indexOf(item);
      if (itemIndex >= 0) {
        this.props.bus.getPublisher<Sr22tChecklistEvents>()
          .pub('sr22t_checklist_event', {
            type: 'item_changed',
            checklistName: checklist.name,
            itemIndex: itemIndex,
            itemState: Sr22tChecklistItemState.Incomplete,
          });
      }
    }
  }

  /**
   * Dispatches as event to go to the next checklist.
   * @returns Whether the required action was successful.
   */
  private goToNextChecklist(): boolean {
    this.props.bus.getPublisher<Sr22tChecklistEvents>()
      .pub('sr22t_checklist_event', {
        type: 'next_checklist',
        checklistName: this.props.checklist.get().name,
        category: this.props.checklist.get().category,
      });
    return true;
  }

  /**
   * Renders the checklist items.
   * @param item The checklist item.
   * @returns The checklist items VNode.
   */
  private renderChecklistItem(item: Sr22tChecklistItem): VNode {
    return (
      <Sr22tChecklistItemDisplay
        item={item}
        innerKnobScroll
        onRegistered={(control): void => control.setDisabled(item.type === Sr22tChecklistItemType.Section)}
        toggleItemCompleted={this.toggleItemCompletedStatus.bind(this)}
        setItemIncomplete={this.setItemIncomplete.bind(this)}
        focusedItemType={this.props.focusedItemType}
      />
    );
  }

  /**
   * A function to override the stock G1000ControlList.ensureIndexInView function to scroll the checklist display with an offset.
   * @param index The index to ensure is in view.
   * @param pinDirection The direction to pin the item to.
   */
  public replaceEnsureIndexInView(index: number, pinDirection: 'none' | 'top' | 'bottom' = 'none'): void {
    let offsetIndex;
    // if the new index is equal to the previous index,
    // we shouldn't offset the scroll as we aren't actively scrolling
    // (probably freshly loaded checklist)
    if (index === this.previousIndex) {
      offsetIndex = index;
    } else if (index < this.previousIndex) {
      offsetIndex = index - 3;
    } else {
      offsetIndex = index + 5;
    }
    offsetIndex = MathUtils.clamp(offsetIndex, 0, this.items.length - 1);
    this.ensureIndexInView && this.ensureIndexInView(offsetIndex, pinDirection);
    this.previousIndex = index;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="sr22t-checklist-page-container">
        <div class="checklist-selection-container">
          <Sr22tChecklistCategorySelectionControl repo={this.props.repo} openChecklistPopup={this.props.openChecklistPopup} focusedItemType={this.props.focusedItemType} />
          <Sr22tChecklistSelectionControl repo={this.props.repo} openChecklistPopup={this.props.openChecklistPopup} focusedItemType={this.props.focusedItemType} />
        </div>
        <div class="checklist-container">
          <div class="sr22t-checklist-display-container">
            <div class="sr22t-checklist-display" ref={this.scrollContainer}>
              <G1000ControlList
                class="sr22t-checklist-display-list"
                innerKnobScroll
                ref={this.checklistItemListRef}
                data={this.items}
                renderItem={this.renderChecklistItem.bind(this)}
                hideScrollbar={false}
              />
            </div>
            <div class={{ 'sr22t-checklist-completed-label': true, 'hidden': this.props.isChecklistCompleted.map(v => !v) }}>
              * Checklist Finished *
            </div>
            <NextChecklistControl
              onEnter={this.goToNextChecklist.bind(this)}
              isLast={this.props.checklist.map(v => v.isLastChecklist)}
              onFocused={() => this.props.focusedItemType.set(Sr22tChecklistPageFocusableItemType.NextChecklist)} />
          </div>
        </div>
      </div>
    );
  }
}
