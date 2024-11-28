import { FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { CheckBox, SectionOutline } from '@microsoft/msfs-epic2-shared';

import { ChecklistItemBase, ChecklistItemBaseProps } from './ChecklistItemBase';

import './ChecklistActionItem.css';

/** The properties for the {@link ChecklistItem} component. */
interface ChecklistActionItemProps extends ChecklistItemBaseProps {
  /** The label text */
  labelText: string;

  /** The action text */
  actionText: string;

  /** Has the item been completed? */
  isCompleted: Subscribable<boolean>;

  /** On click */
  onClick: () => void
}

/**
 * An Epic 2 checklist item
 */
export class ChecklistActionItem extends ChecklistItemBase<ChecklistActionItemProps> {
  private readonly checkboxRef = FSComponent.createRef<CheckBox>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();
  private readonly isOutlineHidden = Subject.create(true);

  public readonly textRows: string[] = this.getTextToDisplay();

  /**
   * Merges the label and action text into one single string array
   * @returns A merged string array
   */
  private getTextToDisplay(): string[] {
    const newRows = [] as string[];
    const labelTextSplit = ChecklistItemBase.splitStringToRows(this.props.labelText);
    const actionTextSplit = ChecklistItemBase.splitStringToRows(this.props.actionText);

    const lastLabelRow = labelTextSplit.pop() ?? '';
    const firstActionRow = actionTextSplit.shift() ?? '';

    newRows.push(...labelTextSplit);

    // We want to put the last label and first action rows on same row, but only if when combined they are 15 characters long
    // This gives room to insert 3 decimal seperator characters
    if (lastLabelRow.length + firstActionRow.length <= (ChecklistItemBase.MAX_CHARACTERS_PER_ROW - 3)) {
      const numSeperators = Math.max(3, ChecklistItemBase.MAX_CHARACTERS_PER_ROW - lastLabelRow.length - firstActionRow.length);
      newRows.push(`${lastLabelRow}${('.').repeat(numSeperators)}${firstActionRow}`);
    } else {
      newRows.push(
        lastLabelRow.padEnd(ChecklistItemBase.MAX_CHARACTERS_PER_ROW, '.'),
        firstActionRow.padStart(ChecklistItemBase.MAX_CHARACTERS_PER_ROW, '.')
      );
    }

    newRows.push(...actionTextSplit.map((str) => str.padStart(ChecklistItemBase.MAX_CHARACTERS_PER_ROW, ' ').replace(' ', '&nbsp;')));

    return newRows;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const outlineRef = this.outlineRef.instance;
    const checkboxInstance = this.checkboxRef.instance;
    outlineRef.outlineActive.sub((v) => this.isOutlineHidden.set(!v));

    const checkboxContainer = checkboxInstance.checkBoxContainerElement.instance;
    checkboxContainer.addEventListener('mouseover', () => outlineRef.forceOutline(true));
    checkboxContainer.addEventListener('mouseout', () => outlineRef.forceOutline(false));

    outlineRef.outlineElement.instance.addEventListener('click', () => this.props.onClick());
    checkboxContainer.addEventListener('click', () => this.props.onClick());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{ 'checklist-item': true, 'checklist-action-item': true, 'hidden': this.props.isHidden, 'checklist-item-completed': this.props.isCompleted }}
        ref={this.baseRef}
      >
        <div class="checklist-checkbox-container">
          <svg class={{ 'checklist-selected-indicator': true, 'hidden': this.isOutlineHidden }} xmlns="http://www.w3.org/2000/svg" width="23" height="29" viewBox="0 0 23 29" fill="none">
            <path d="M 16 5 H 1 V 25 H 16 V 28 L 22 15 L 16 2 V 5 Z" class="selection-outline" stroke-width="1.5" />
          </svg>
          <CheckBox ref={this.checkboxRef} isChecked={this.props.isCompleted} isEnabled={false} />
        </div>
        <SectionOutline ref={this.outlineRef} bus={this.props.bus}>
          <span class="checklist-item-text">
            {this.textRows.join('<br />')}
          </span>
        </SectionOutline>
      </div>
    );
  }
}
