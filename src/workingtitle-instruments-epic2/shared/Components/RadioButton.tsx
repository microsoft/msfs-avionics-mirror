import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import './RadioButton.css';

/** Props for the {@link RadioButton} component. */
interface RadioButtonProps<T> extends ComponentProps {
  /** The currently selected option. */
  selectedValue: MutableSubscribable<T>;
  /** The value of this option. */
  value: T;
  /** The label to show in the UI for this option. Defaults to no label. */
  label?: string | Subscribable<string>;
  /** The optional label suffix string if it has a different styling. */
  labelSuffix?: string;
  /** Whether to show the label on the left side rather than the right. Defaults to false. */
  leftLabel?: boolean;
  /** Whether the radio button is disabled, or a subscribable which provides it. Defaults to `false`. */
  isDisabled?: boolean | Subscribable<boolean>;
  /** Css class to apply to root element. */
  class?: string;
}

/** A radio button component. */
export class RadioButton<T> extends DisplayComponent<RadioButtonProps<T>> {
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled ?? false, true);

  private readonly isSelected = this.props.selectedValue.map((v) => v === this.props.value);

  private readonly radioContainerElement = FSComponent.createRef<HTMLElement>();

  /** Set the radio subject value to the selected label. */
  private setOption(): void {
    if (!this.isDisabled.get()) {
      this.props.selectedValue.set(this.props.value);
    }
  }

  private readonly setOptionHandler = this.setOption.bind(this);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.radioContainerElement.instance.addEventListener('click', this.setOptionHandler);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'radio-button-container': true,
          'radio-button-disabled': this.isDisabled,
        }}
        ref={this.radioContainerElement}
      >
        {this.props.leftLabel && this.props.label && <span class='radio-button-label'>{this.props.label}</span>}
        {this.props.leftLabel && this.props.labelSuffix && <span class='radio-button-label-suffix'>{` ${this.props.labelSuffix}`}</span>}
        <div class={{
          'radio-button-wrapper': true,
          'radio-button-wrapper-left-label': !!this.props.leftLabel,
        }}>
          <div class='radio-button'>
            <div class={{
              'radio-icon': true,
              'radio-icon-selected': this.isSelected,
            }}
            />
          </div>
        </div>
        {!this.props.leftLabel && this.props.label && <span class='radio-button-label'>{this.props.label}</span>}
        {!this.props.leftLabel && this.props.labelSuffix && <span class='radio-button-label-suffix'>{` ${this.props.labelSuffix}`}</span>}
      </div>
    );
  }

  /** @inheritdoc */
  public onDestroy(): void {
    this.radioContainerElement.instance.removeEventListener('click', this.setOptionHandler);
  }
}
