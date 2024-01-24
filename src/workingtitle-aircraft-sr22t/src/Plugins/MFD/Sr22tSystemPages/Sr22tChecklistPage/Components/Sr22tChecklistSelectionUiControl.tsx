import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { G1000UiControl, G1000UiControlProps } from '@microsoft/msfs-wtg1000';
import { Sr22tChecklistPageFocusableItemType, Sr22tChecklistRepository } from '../../../../Shared/ChecklistSystem';

import './Sr22tChecklistSelection.css';

/** Component props for the {@link Sr22tChecklistSelectionUiControl} component */
export interface Sr22tChecklistSelectionProps extends G1000UiControlProps {
  /** The checklist repository */
  repo: Sr22tChecklistRepository;
  /** The focused item type. */
  focusedItemType: Subject<Sr22tChecklistPageFocusableItemType>;
  /** Function to open checklist popups. */
  openChecklistPopup: (type: 'category' | 'checklist') => void;
}

/** A base component for the checklist/category selection. */
class Sr22tChecklistSelectionUiControl extends G1000UiControl<Sr22tChecklistSelectionProps> {
  protected readonly ref = FSComponent.createRef<HTMLSpanElement>();

  /**
   * Adds the highlight to the item and sets the currently focused item type.
   */
  public onFocused(): void {
    this.ref.instance.classList.add('highlight-select');
    this.props.focusedItemType.set(Sr22tChecklistPageFocusableItemType.SelectionList);
  }

  /**
   * Removed the highlight from the item.
   */
  public onBlurred(): void {
    this.ref.instance.classList.remove('highlight-select');
  }

    /** @inheritDoc */
  public render(): VNode {
    return <div ref={this.ref}></div>;
  }
}

/** A component which displays the selected category, and opens the category selection popup. */
export class Sr22tChecklistCategorySelectionControl extends Sr22tChecklistSelectionUiControl {
  /** @inheritDoc */
  onEnter(): boolean {
    this.props.openChecklistPopup('category');
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="checklist-category">
        <span ref={this.ref}>{this.props.repo.activeChecklist.map(v => v.category)}</span>
      </div>
    );
  }
}

/** A component which displays the selected checklist, and opens the checklist selection popup. */
export class Sr22tChecklistSelectionControl extends Sr22tChecklistSelectionUiControl {
  /** @inheritDoc */
  onEnter(): boolean {
    this.props.openChecklistPopup('checklist');
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="checklist-title">
        <span ref={this.ref}>{this.props.repo.activeChecklistName}</span>
      </div>
    );
  }
}
