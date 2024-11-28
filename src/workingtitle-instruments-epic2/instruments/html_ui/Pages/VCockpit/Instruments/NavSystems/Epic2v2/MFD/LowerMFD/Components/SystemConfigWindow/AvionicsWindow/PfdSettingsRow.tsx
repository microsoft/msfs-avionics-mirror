import { DisplayComponent, FSComponent, MutableSubscribable, Subscribable, SubscribableMapFunctions, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { TouchButton } from '@microsoft/msfs-epic2-shared';

import './PfdSettingsRow.css';

/** Props for a PFD settings row. */
export interface PfdSettingsRowProps<T> {
  /** Label for the row soft button. */
  label: string;
  /** The setting value. */
  selectedValue: MutableSubscribable<T>;
  /** The labels for each option. */
  valueLabels: [string, T][];
  /** Whether the row is disabled. Defaults to false. */
  isDisabled?: boolean | Subscribable<boolean>;
}

/** A PFD settings row. */
export class PfdSettingsRow<T> extends DisplayComponent<PfdSettingsRowProps<T>> {
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled ?? false, true) as Subscribable<boolean>;

  private readonly values = this.props.valueLabels.map((v) => v[1]);

  /** Handles button presses. */
  private onPressed(): void {
    const idx = this.values.indexOf(this.props.selectedValue.get());
    this.props.selectedValue.set(this.values[(idx + 1) % this.values.length]);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class='avionics-settings-row pfd-settings-row'>
      <TouchButton
        class="lsk-button"
        variant='base'
        isEnabled={this.isDisabled.map(SubscribableMapFunctions.not())}
        label={this.props.label}
        onPressed={this.onPressed.bind(this)}
      />
      {this.props.valueLabels.map(([label, value]) => {
        return <div class={{ 'option': true, 'selected-option': this.props.selectedValue.map((v) => v === value) }}>{label}</div>;
      })}
    </div>;
  }
}
