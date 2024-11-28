import { ComRadioIndex, ConsumerSubject, FSComponent, NavComEvents, NavRadioIndex, RadioType, Subject, VNode } from '@microsoft/msfs-sdk';
import { TouchSlider } from '@microsoft/msfs-garminsdk';

import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { RadiosConfig } from '../../../Shared';

import './MfdRadioVolumePopup.css';

/**
 * Component props for the {@link MfdRadioVolumePopup}
 */
export interface MfdVolumeRadioPopupProps extends UiViewProps {
  /**
   * radios config.
   */
  radiosConfig: RadiosConfig;
}

/**
 * Volume slider popup view.
 */
export class MfdRadioVolumePopup extends AbstractUiView<MfdVolumeRadioPopupProps> {

  private radioIndex: 1 | 2 = 1;
  private radioType: RadioType.Com | RadioType.Nav = RadioType.Com;
  private simRadioIndex: ComRadioIndex | NavRadioIndex = 1;
  /**
   * Volume slider popup view.
   * range: 0 - 100
   */
  private readonly volume = ConsumerSubject.create(null, 0);
  private readonly label = Subject.create('');

  private thisNode?: VNode;

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class='mfd-radio-volume-popup ui-view-panel'>
        <div class='mfd-radio-volume-popup-title'>
          {this.label}
        </div>
        <div class='mfd-radio-volume-popup-controls'>
          <UiTouchButton
            class='mfd-radio-volume-popup-button'
            onPressed={this.decreaseVolume.bind(this)}
            isEnabled={this.volume.map(val => val > 0)}
          />
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
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='mfd-radio-volume-popup-slider-background'>
                <path d='m 0 1 l 1 0 l 0 -1 z' />
              </svg>
            }
            foreground={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='mfd-radio-volume-popup-slider-occlude'>
                <path d='m 0 0 l 0 1 l 1 -1 z' />
              </svg>
            }
            focusOnDrag
            lockFocusOnDrag
            inhibitOnDrag
            changeValueOnDrag
            class='mfd-radio-volume-popup-slider'
          >
            <div class='mfd-radio-volume-popup-slider-label'>{this.volume.map(val => `${val.toFixed()}%`)}</div>
          </TouchSlider>
          <UiTouchButton
            class='mfd-radio-volume-popup-button'
            onPressed={this.increaseVolume.bind(this)}
            isEnabled={this.volume.map(val => val < 100)}
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

  /**
   * increase volume
   */
  private increaseVolume(): void {
    const radio = `${this.radioType}${this.simRadioIndex}`;
    SimVar.SetSimVarValue(`K:${radio}_VOLUME_INC`, 'number', 0);
  }

  /**
   * decrease volume
   */
  private decreaseVolume(): void {
    const radio = `${this.radioType}${this.simRadioIndex}`;
    SimVar.SetSimVarValue(`K:${radio}_VOLUME_DEC`, 'number', 0);
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