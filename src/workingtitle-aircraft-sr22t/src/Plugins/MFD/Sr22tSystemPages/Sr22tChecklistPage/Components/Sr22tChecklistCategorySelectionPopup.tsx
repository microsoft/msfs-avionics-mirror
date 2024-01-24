import { ArraySubject, FocusPosition, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G1000ControlList, G1000UiControl } from '@microsoft/msfs-wtg1000';
import { Sr22tChecklistBasePopup } from './Sr22tChecklistBasePopup';
import { Sr22tChecklistCategory } from '../../../../Shared/ChecklistSystem';

import './Sr22tChecklistCategorySelectionPopup.css';

/** A popup for selecting a checklist. */
export class Sr22tChecklistCategorySelectionPopup extends Sr22tChecklistBasePopup<Sr22tChecklistCategory, Sr22tChecklistCategory> {
  private readonly categoryListRef = FSComponent.createRef<G1000ControlList<Sr22tChecklistCategory>>();
  private readonly categories = ArraySubject.create(Object.values(Sr22tChecklistCategory));

  /** @inheritDoc */
  protected onViewOpened(): void {
    super.onViewOpened();
    this.setScrollEnabled(true);
    this.categoryListRef.instance.focus(FocusPosition.First);
  }

  /** @inheritDoc */
  protected onInputDataSet(input: Sr22tChecklistCategory | undefined): void {
    super.onInputDataSet(input);
    this.categoryListRef.instance.scrollToIndex(this.categories.getArray().indexOf(this.inputData.get() || Sr22tChecklistCategory.Normal));
  }

  /**
   * Renders a category selection item.
   * @param item The category selection item to render.
   * @returns The rendered category selection item.
   */
  private renderCategoryItem(item: Sr22tChecklistCategory): VNode {
    const ref = FSComponent.createRef<HTMLDivElement>();
    return (
      <G1000UiControl
        onFocused={() => ref.instance.classList.add('highlight-select')}
        onBlurred={() => ref.instance.classList.remove('highlight-select')}
      >
        <div class="checklist-category-selection-item" ref={ref}>
          {item}
        </div>
      </G1000UiControl>
    );
  }

  /**
   * Called when a category is selected.
   * @returns whether the required action was successful.
   */
  private onCategorySelected(): boolean {
    this.accept(this.categories.getArray()[this.categoryListRef.instance.getSelectedIndex()]);
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="popout-dialog checklist-category-popup" ref={this.viewContainerRef}>
        <G1000UiControl innerKnobScroll ref={this.controlRef}>
          <div class="sr22t-checklist-category-selection-container" ref={this.scrollContainer}>
            <G1000ControlList
              class="sr22t-checklist-category-selection-list"
              innerKnobScroll
              ref={this.categoryListRef}
              data={this.categories}
              renderItem={this.renderCategoryItem.bind(this)}
              onEnter={this.onCategorySelected.bind(this)}
              hideScrollbar={false}
            />
          </div>
        </G1000UiControl>
      </div>
    );
  }
}
