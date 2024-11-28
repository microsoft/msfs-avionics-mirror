import { DisplayComponent, FSComponent, MutableSubscribable, Subscribable, SubscribableMapFunctions, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { RadioButton, TouchButton } from '@microsoft/msfs-epic2-shared';

import './FcsSettingsRow.css';

/** Props for a FCS settings row. */
export interface FcsSettingsRowProps<T> {
  /** Label for the row soft button. */
  label: string;
  /** The setting value. */
  selectedValue: MutableSubscribable<T>;
  /** The labels for each option. */
  valueLabels: [string, T][];
  /** Whether the row is disabled. Defaults to false. */
  isDisabled?: boolean | Subscribable<boolean>;
}

/** A FCS settings row. */
export class FcsSettingsRow<T> extends DisplayComponent<FcsSettingsRowProps<T>> {
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled ?? false, true) as Subscribable<boolean>;

  private readonly values = this.props.valueLabels.map((v) => v[1]);

  /** Handles button presses. */
  private onPressed(): void {
    const idx = this.values.indexOf(this.props.selectedValue.get());
    this.props.selectedValue.set(this.values[(idx + 1) % this.values.length]);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class='avionics-settings-row fcs-settings-row'>
      <TouchButton
        class="lsk-button"
        variant='base'
        isEnabled={this.isDisabled.map(SubscribableMapFunctions.not())}
        label={this.props.label}
        onPressed={this.onPressed.bind(this)}
      />
      <div class='options'>
        {this.props.valueLabels.map(([label, value]) => {
          return <RadioButton leftLabel label={label} value={value} selectedValue={this.props.selectedValue} isDisabled={this.props.isDisabled} />;
        })}
      </div>
    </div>;
  }
}
