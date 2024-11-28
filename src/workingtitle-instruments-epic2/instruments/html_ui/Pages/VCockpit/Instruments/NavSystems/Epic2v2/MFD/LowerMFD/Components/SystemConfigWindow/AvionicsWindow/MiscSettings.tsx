import { FSComponent, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { CheckBox, PopupKeyboardLayout, RadioButton, TabContent, TouchButton } from '@microsoft/msfs-epic2-shared';

import './MiscSettings.css';
import { FcsSettingsProps } from './FcsSettings';

/** The Misc tab. */
export class MiscSettings extends TabContent<FcsSettingsProps> {
  private readonly popupKeyboardDisabled = this.props.pfdSettingsManager.getSetting('popupKeyboardEnabled').map(SubscribableMapFunctions.not());

  /** @inheritdoc */
  public onLineSelectKey(index: number): void {
    switch (index) {
      case 0: {
        const setting = this.props.pfdSettingsManager.getSetting('popupKeyboardEnabled');
        setting.set(!setting.get());
      }
        break;
      case 1: {
        if (this.props.pfdSettingsManager.getSetting('popupKeyboardEnabled').get()) {
          const setting = this.props.pfdSettingsManager.getSetting('popupKeyboardLayout');
          setting.set(setting.get() === PopupKeyboardLayout.Abc ? PopupKeyboardLayout.Qwerty : PopupKeyboardLayout.Abc);
        }
      }
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="misc-settings-window">
      <div class='avionics-settings-row'>
        <TouchButton
          class="lsk-button"
          variant='base'
          label='SEL'
          onPressed={this.onLineSelectKey.bind(this, 0)}
        />
        <div class='options'>
          <CheckBox label='Pop-Up Keyboard' isChecked={this.props.pfdSettingsManager.getSetting('popupKeyboardEnabled')} />
        </div>
      </div>
      <div class="empty-divider-line" />
      <div class='avionics-settings-row'>
        <TouchButton
          class="lsk-button"
          variant='base'
          label='SEL'
          onPressed={this.onLineSelectKey.bind(this, 1)}
          isEnabled={this.props.pfdSettingsManager.getSetting('popupKeyboardEnabled')}
        />
        <div class='options'>
          <RadioButton label='ABC' value={PopupKeyboardLayout.Abc} selectedValue={this.props.pfdSettingsManager.getSetting('popupKeyboardLayout')} isDisabled={this.popupKeyboardDisabled} />
          <RadioButton label='QWERTY' value={PopupKeyboardLayout.Qwerty} selectedValue={this.props.pfdSettingsManager.getSetting('popupKeyboardLayout')} isDisabled={this.popupKeyboardDisabled} />
        </div>
      </div>
      <div class="divider-line" />
      <div class='avionics-settings-row'>
        <TouchButton
          class="lsk-button"
          variant='base'
          label='SEL'
          isEnabled={false}
        />
        <div class='options'>
          <span>Crew Profile</span>
          <span class='active-profile'>Default</span>
        </div>
      </div>
      <div class="divider-line" />
    </div>;
  }
}
