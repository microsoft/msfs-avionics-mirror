import { FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { CheckBox, SectionOutline } from '@microsoft/msfs-epic2-shared';

import { ChecklistItemBase, ChecklistItemBaseProps } from './ChecklistItemBase';

import './ChecklistLinkItem.css';

/** The properties for the {@link ChecklistItem} component. */
interface ChecklistLinkItemProps extends ChecklistItemBaseProps {
  /** Whether the checklist has been completed */
  isCompleted: Subscribable<boolean>;

  /** The label text */
  labelText: string;

  /** Class text */
  class?: string;

  /** Function to run on click */
  onClick: () => void
}

/**
 * An Epic 2 checklist item
 */
export class ChecklistLinkItem extends ChecklistItemBase<ChecklistLinkItemProps> {
  private readonly checkboxRef = FSComponent.createRef<CheckBox>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();
  private readonly isOutlineHidden = Subject.create(true);

  public readonly textRows: string[] = ChecklistItemBase.splitStringToRows(this.props.labelText);

  /** @inheritdoc */
  public onAfterRender(): void {
    const outlineRef = this.outlineRef.instance;
    const checkboxInstance = this.checkboxRef.instance;
    outlineRef.outlineActive.sub((v) => this.isOutlineHidden.set(!v));
    outlineRef.outlineElement.instance.addEventListener('click', () => this.props.onClick());

    const checkboxContainer = checkboxInstance.checkBoxContainerElement.instance;
    checkboxContainer.addEventListener('mouseover', () => outlineRef.forceOutline(true));
    checkboxContainer.addEventListener('mouseout', () => outlineRef.forceOutline(false));
    checkboxContainer.addEventListener('click', () => this.props.onClick());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{ 'checklist-item': true, 'checklist-action-item': true, 'hidden': this.props.isHidden, 'checklist-item-completed': this.props.isCompleted, [this.props.class ?? '']: true }}
        ref={this.baseRef}
      >
        <div class="checklist-checkbox-container">
          <svg class={{ 'checklist-selected-indicator': true, 'hidden': this.isOutlineHidden }} xmlns="http://www.w3.org/2000/svg" width="23" height="29" viewBox="0 0 23 29" fill="none">
            <path d="M 16 5 H 1 V 25 H 16 V 28 L 22 15 L 16 2 V 5 Z" class="selection-outline" stroke-width="1.5" />
          </svg>
          <CheckBox isEnabled={false} ref={this.checkboxRef} isChecked={this.props.isCompleted} />
        </div>
        <SectionOutline ref={this.outlineRef} bus={this.props.bus}>
          <span class="checklist-item-text">
            {this.textRows.join('<br />')}
          </span>
        </SectionOutline>
      </div >
    );
  }
}
