import { ComRadioIndex, ConsumerSubject, FSComponent, NavComEvents, NavRadioIndex, RadioType, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';
import { TouchSlider } from '@microsoft/msfs-garminsdk';

import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';

import './RadioVolumeShortcutPopup.css';

/**
 * Component props for the {@link RadioVolumeShortcutPopup}
 */
export interface RadioVolumeShortcutPopupProps extends UiViewProps {
  /**
   * radios config.
   */
  radiosConfig: RadiosConfig;
}

/**
 * A popup that allows the user to change the volume of a COM or NAV radio.
 */
export class RadioVolumeShortcutPopup extends AbstractUiView<RadioVolumeShortcutPopupProps> {

  private radioIndex: 1 | 2 = 1;
  private radioType: RadioType.Com | RadioType.Nav = RadioType.Com;
  private simRadioIndex: ComRadioIndex | NavRadioIndex = 1;
  private readonly squelchButtonClass = SetSubject.create(['pfd-radio-squelch-button']);
  private readonly popupClass = SetSubject.create(['radio-volume-shortcut-popup', 'ui-view-panel']);
  /**
   * Volume slider value.
   * range: 0 - 100
   */
  private readonly volume = ConsumerSubject.create(null, 0);
  private readonly label = Subject.create('');

  private thisNode?: VNode;

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class={this.popupClass}>
        <div class='radio-volume-shortcut-popup-title'>
          {this.label}
        </div>
        <div class='radio-volume-shortcut-popup-controls'>
          <TouchSlider
            bus={this.props.uiService.bus}
            orientation='to-right'
            state={this.volume.map(val => (val / 100))}
            isEnabled={true}
            onValueChanged={(changedValue): void => {
              const radio = `${this.radioType}${this.simRadioIndex}`;
              const event = this.radioType === RadioType.Nav ? '_VOLUME_SET_EX1' : '_VOLUME_SET';
              SimVar.SetSimVarValue(`K:${radio}${event}`, 'number', changedValue * 100);
            }}
            background={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='radio-volume-shortcut-popup-slider-background'>
                <path d='m 0 1 l 1 0 l 0 -1 z' />
              </svg>
            }
            foreground={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='radio-volume-shortcut-popup-slider-occlude'>
                <path d='m 0 0 l 0 1 l 1 -1 z' />
              </svg>
            }
            focusOnDrag
            lockFocusOnDrag
            inhibitOnDrag
            changeValueOnDrag
            class='radio-volume-shortcut-popup-slider'
          >
            <div class='radio-volume-shortcut-popup-slider-label'>{this.volume.map(val => `${val.toFixed()}%`)}</div>
            <div class='radio-volume-shortcut-popup-slider-vol-label'>VOL</div>
          </TouchSlider>
          <UiToggleTouchButton
            state={Subject.create(false)}
            label='Squelch'
            isEnabled={false}
            class={this.squelchButtonClass}
          />
        </div>
      </div>
    );
  }

  /**
   * Request the volume slider popup.
   * @param radioType type of radio
   * @param radioIndex - 1 or 2
   * @throws Error if simRadioIndex is not 1 or 2
   */
  public request(radioType: RadioType.Com | RadioType.Nav, radioIndex: 1 | 2): void {
    this.radioIndex = radioIndex;
    this.radioType = radioType;

    const definition = radioType === RadioType.Com
      ? this.props.radiosConfig.comDefinitions[this.radioIndex]
      : this.props.radiosConfig.navDefinitions[this.radioIndex];

    if (!definition) {
      throw new Error(`Radio definition not found for radio index: ${this.radioIndex}`);
    }

    this.simRadioIndex = definition.simIndex;

    switch (radioType) {
      case RadioType.Com:
        this.label.set(this.props.radiosConfig.comDefinitions.length === 1 ? 'COM Radio' : `COM ${radioIndex}`);
        break;
      case RadioType.Nav:
        this.label.set(this.props.radiosConfig.navDefinitions.length === 1 ? 'NAV Radio' : `NAV ${radioIndex}`);
        break;
    }

    if (this.simRadioIndex === 1 || this.simRadioIndex === 2) {
      this.volume.setConsumer(this.props.uiService.bus.getSubscriber<NavComEvents>().on(
        `${this.radioType === RadioType.Nav ? 'nav' : 'com'}_volume_${this.simRadioIndex}`
      )
      );
    } else {
      throw new Error(`Volume popup is not supported for radio index: ${this.simRadioIndex}`);
    }
    this.squelchButtonClass.set(radioType === RadioType.Com ? ['pfd-radio-squelch-button'] : ['hidden']);
    this.popupClass.add(radioType === RadioType.Com ? 'radio-volume-shortcut-popup-com' : 'radio-volume-shortcut-popup-nav');
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Volume'],
      [UiKnobId.SingleInner, 'Volume'],
      [UiKnobId.LeftOuter, 'Volume'],
      [UiKnobId.LeftInner, 'Volume'],
      [UiKnobId.RightOuter, 'Volume'],
      [UiKnobId.RightInner, 'Volume'],
    ]);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    const radio = `${this.radioType}${this.simRadioIndex}`;
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
        SimVar.SetSimVarValue(`K:${radio}_VOLUME_INC`, 'number', 0);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
        SimVar.SetSimVarValue(`K:${radio}_VOLUME_DEC`, 'number', 0);
        return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public onPause(): void {
    super.onPause();
    this.volume.pause();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();
    this.volume.resume();
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.volume.destroy();
    if (this.thisNode) {
      FSComponent.shallowDestroy(this.thisNode);
    }
  }
}