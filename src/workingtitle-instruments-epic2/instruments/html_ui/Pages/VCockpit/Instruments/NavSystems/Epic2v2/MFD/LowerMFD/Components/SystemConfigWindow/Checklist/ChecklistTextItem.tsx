import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { ChecklistItemBase, ChecklistItemBaseProps } from './ChecklistItemBase';

import './ChecklistTextItem.css';

/** The properties for the {@link ChecklistItem} component. */
interface ChecklistTextItemProps extends ChecklistItemBaseProps {
  /** The text to display */
  text: string;
}

/**
 * An Epic 2 checklist item
 */
export class ChecklistTextItem extends ChecklistItemBase<ChecklistTextItemProps> {
  public readonly textRows: string[] = ChecklistItemBase.splitStringToRows(this.props.text);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{ 'checklist-item': true, 'checklist-text-item': true, 'hidden': this.props.isHidden }}
        ref={this.baseRef}
      >
        <span class="checklist-item-text">
          {this.textRows.join('<br />')}
        </span>
      </div>
    );
  }
}
