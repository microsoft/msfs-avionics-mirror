import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { G1000UiControl, G1000UiControlProps } from '@microsoft/msfs-wtg1000';

import { Sr22tChecklistItemReadonly, Sr22tChecklistItemState, Sr22tChecklistItemType, Sr22tChecklistPageFocusableItemType } from '../../../../Shared/ChecklistSystem';

/** Component props for the {@link Sr22tChecklistItemDisplay} component */
export interface Sr22tChecklistItemDisplayProps extends G1000UiControlProps {
  /** The checklist item to display. */
  item: Sr22tChecklistItemReadonly
  /** A function to toggle the completed status of the item. */
  toggleItemCompleted: (item: Sr22tChecklistItemReadonly) => boolean;
  /** A function to set the item to incomplete. */
  setItemIncomplete: (item: Sr22tChecklistItemReadonly) => void;
  /** The focused item type. */
  focusedItemType: Subject<Sr22tChecklistPageFocusableItemType>;
}

/** A display component for a SR22T checklist item. */
export class Sr22tChecklistItemDisplay extends G1000UiControl<Sr22tChecklistItemDisplayProps> {
  private readonly itemRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.props.item.state.sub(state => {
      if (this.isFocused && this.props.item.type === Sr22tChecklistItemType.Checkbox) {
        this.props.focusedItemType.set(state === Sr22tChecklistItemState.Completed ?
          Sr22tChecklistPageFocusableItemType.CheckboxChecked :
          Sr22tChecklistPageFocusableItemType.CheckboxUnchecked);
      }
    }, true);
  }

  /** @inheritDoc */
  onEnter(): boolean {
    return this.props.toggleItemCompleted(this.props.item);
  }

  /** @inheritDoc */
  onClr(): boolean {
    this.props.setItemIncomplete(this.props.item);
    return true;
  }

  /** @inheritDoc */
  protected onFocused(): void {
    this.itemRef.instance.classList.add('checklist-focus');
    this.props.focusedItemType.set(
      this.props.item.type === Sr22tChecklistItemType.Checkbox ?
        this.props.item.state.get() === Sr22tChecklistItemState.Completed ?
          Sr22tChecklistPageFocusableItemType.CheckboxChecked :
          Sr22tChecklistPageFocusableItemType.CheckboxUnchecked :
        Sr22tChecklistPageFocusableItemType.Text
    );
  }

  /** @inheritDoc */
  protected onBlurred(): void {
    this.itemRef.instance.classList.remove('checklist-focus');
  }

  /**
   * Renders the checklist item based on its type.
   * @returns The checklist item VNode.
   */
  private renderItem(): VNode {
    switch (this.props.item.type) {
      case Sr22tChecklistItemType.Checkbox:
        return this.renderCheckboxItem(this.props.item.level || 1);
      case Sr22tChecklistItemType.Text:
        return this.renderTextItem();
      case Sr22tChecklistItemType.Section:
        return this.renderSectionTitleItem();
    }
  }

  /**
   * Renders a checkbox item.
   * @param level The level of nesting of the checkbox item.
   * @returns The checkbox item VNode.
   */
  private renderCheckboxItem(level: number): VNode {
    const titleSplit = (this.props.item.title || '').split('\n');
    const actionSplit = this.props.item.action && this.props.item.action.split('\n');

    return (
      <div class={{
        'sr22t-checklist-checkbox': true ,
        'level-2': level === 2,
        'level-3': level === 3,
        'completed': this.props.item.state.map(v => v === Sr22tChecklistItemState.Completed)
      }}>
        <svg width="32px" height="32px" viewBox="0 0 32 32">
          <path class="sr22t-checklist-checkbox-border" d="M 8.5 23.5 L 8.5 8.5 L 23.5 8.5" stroke="#CECECE" stroke-width="1" fill="none"/>
          <path class="sr22t-checklist-checkbox-border" d="M 23.5 8.5 L 23.5 24 M 23.5 23.5 L 8.5 23.5" stroke="#8B8B8B" stroke-width="1" fill="none"/>
          <path class="sr22t-checklist-checkbox-mark" d="M 9 15 L 15 22 L 23 12" stroke="#00FF00" stroke-width="3" fill="none"/>
        </svg>
        <div class="sr22t-checklist-checkbox-first-line">
          <div class="sr22t-checklist-checkbox-title">{titleSplit[0]}</div>
          <div class={{
            'sr22t-checklist-checkbox-spacer': true,
            'hidden': !this.props.item.action
          }}>
            <div>......................................................................</div>
          </div>
          <div class={{
            'sr22t-checklist-checkbox-action': true,
            'hidden': !this.props.item.action
          }}>{actionSplit && actionSplit[0]}</div>
        </div>
        <div class={{
          'sr22t-checklist-checkbox-second-line': true,
          'hidden': !titleSplit[1] && !(actionSplit && actionSplit[1])
        }}>
          <div class="sr22t-checklist-checkbox-title">{titleSplit[1]}</div>
          <div class={{
            'sr22t-checklist-checkbox-action': true,
            'hidden': !(actionSplit && actionSplit[1])
          }}>{actionSplit && actionSplit[1]}</div>
        </div>
      </div>
    );
  }

  /**
   * Renders a text item.
   * @returns The text item VNode.
   */
  private renderTextItem(): VNode {
    if (this.props.item.textNode) {
      return this.props.item.textNode();
    }
    return <></>;
  }

  /**
   * Renders a section title item.
   * @returns The section title item VNode.
   */
  private renderSectionTitleItem(): VNode {
    return <div class="sr22t-checklist-section-title">{this.props.item.title}</div>;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{
        'sr22t-checklist-item-display': true,
        'extended-margin-below': !!this.props.item.extendedMarginBelow
      }} ref={this.itemRef}>{this.renderItem()}</div>
    );
  }
}
