import { DisplayComponent, VNode, ComponentProps, Subscribable, FSComponent } from '@microsoft/msfs-sdk';
import { DetailPageOptionRow, DetailPageTextRow, DetailPageVNodeRow, RadioDetailSelectedValue } from './DetailPagesController';
import { RadioButton } from '@microsoft/msfs-epic2-shared';

/** The properties for the {@link DetailPageOption} component. */
interface OptionProps<T> extends ComponentProps {
  /** */
  label: string;
  /** */
  labelSuffix?: string;
  /** */
  value: T;
  /** */
  selectedValue: RadioDetailSelectedValue<T>;
}

/** A single option of a detail page's row. */
export class DetailPageOption<T> extends DisplayComponent<OptionProps<T>> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="radio-detail-option-wrapper">
        <RadioButton
          leftLabel
          label={this.props.label}
          labelSuffix={this.props.labelSuffix}
          value={this.props.value}
          selectedValue={this.props.selectedValue}
        />
      </div>
    );
  }
}

/** The AbstractDetailPage component. */
export interface AbstractDetailPage<T extends ComponentProps> extends DisplayComponent<T> {
  /**
   * Renders an option row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  renderOptionRow(row: DetailPageOptionRow, isSelected: Subscribable<boolean>): VNode;

  /**
   * Renders a text row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  renderTextRow(row: DetailPageTextRow, isSelected: Subscribable<boolean>): VNode;

  /**
   * Renders a text row.
   * @param row A DetailPageVNodeRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  renderVNodeRow(row: DetailPageVNodeRow, isSelected: Subscribable<boolean>): VNode;
}

