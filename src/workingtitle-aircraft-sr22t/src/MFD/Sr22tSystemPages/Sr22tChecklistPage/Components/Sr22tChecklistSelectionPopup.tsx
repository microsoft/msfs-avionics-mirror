import { ArraySubject, FocusPosition, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G1000ControlList, G1000UiControl } from '@microsoft/msfs-wtg1000';
import { Sr22tChecklistBasePopup } from './Sr22tChecklistBasePopup';
import { Sr22tChecklistCategory, Sr22tChecklistNames, Sr22tChecklistReadonly } from '../../../../Shared/ChecklistSystem';

import './Sr22tChecklistSelectionPopup.css';

/** A popup for selecting a checklist. */
export class Sr22tChecklistSelectionPopup extends Sr22tChecklistBasePopup<Sr22tChecklistNames, Sr22tChecklistReadonly> {
  private readonly chklListRef = FSComponent.createRef<G1000ControlList<Sr22tChecklistNames>>();
  private readonly checklists = ArraySubject.create([] as Sr22tChecklistNames[]);

  /** @inheritDoc */
  protected onViewOpened(): void {
    super.onViewOpened();
    this.setScrollEnabled(true);
    this.chklListRef.instance.focus(FocusPosition.First);
  }

  /** @inheritDoc */
  protected onInputDataSet(input: Sr22tChecklistReadonly | undefined): void {
    const checklistsInCategory = this.props.repo.getChecklistsByCategory(input?.category || Sr22tChecklistCategory.Normal);
    this.checklists.set(checklistsInCategory.map(c => c.name));
    const indexOfCurrentChecklist = this.checklists.getArray().findIndex(c => c === input?.name);
    this.chklListRef.instance.scrollToIndex(indexOfCurrentChecklist >= 0 ? indexOfCurrentChecklist : 0);
    this.viewContainerRef.instance.classList.toggle('limited-height', checklistsInCategory.length > 10);
  }

  /**
   * Renders a category selection item.
   * @param item The category selection item to render.
   * @returns The rendered category selection item.
   */
  private renderChklListItem(item: Sr22tChecklistNames): VNode {
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
   * Called when a checklist is selected.
   * @returns whether the required action was successful.
   */
  private onChecklistSelected(): boolean {
    this.accept(this.checklists.getArray()[this.chklListRef.instance.getSelectedIndex()]);
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="popout-dialog checklist-selection-popup" ref={this.viewContainerRef}>
        <G1000UiControl innerKnobScroll ref={this.controlRef}>
          <div class="sr22t-checklist-selection-container" ref={this.scrollContainer}>
            <G1000ControlList
              class="sr22t-checklist-selection-list"
              innerKnobScroll
              ref={this.chklListRef}
              data={this.checklists}
              renderItem={this.renderChklListItem.bind(this)}
              onEnter={this.onChecklistSelected.bind(this)}
              hideScrollbar={false}
            />
          </div>
        </G1000UiControl>
      </div>
    );
  }
}
