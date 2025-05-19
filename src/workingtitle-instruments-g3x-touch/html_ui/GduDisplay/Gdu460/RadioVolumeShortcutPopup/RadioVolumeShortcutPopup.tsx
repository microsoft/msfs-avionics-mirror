import {
  FSComponent, MathUtils, RadioType, SetSubject, SimVarValueType, Subject, SubscribableMapFunctions, Subscription,
  VNode
} from '@microsoft/msfs-sdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchSlider } from '../../../Shared/Components/TouchSlider/UiTouchSlider';
import { G3XRadiosDataProvider } from '../../../Shared/Radio/G3XRadiosDataProvider';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { G3XFailureBox } from '../../../Shared/Components/Common/G3XFailureBox';

import './RadioVolumeShortcutPopup.css';

/**
 * Component props for the {@link RadioVolumeShortcutPopup}
 */
export interface RadioVolumeShortcutPopupProps extends UiViewProps {
  /** A configuration object that defines options for radios. */
  radiosConfig: RadiosConfig;

  /** A provider of radio data. */
  radiosDataProvider: G3XRadiosDataProvider;
}

/**
 * A popup that allows the user to change the volume of a COM or NAV radio.
 */
export class RadioVolumeShortcutPopup extends AbstractUiView<RadioVolumeShortcutPopupProps> {
  private thisNode?: VNode;

  private volumeSetKeyEvent: string | null = null;

  private readonly rootCssClass = SetSubject.create(['radio-volume-shortcut-popup', 'ui-view-panel']);

  private readonly label = Subject.create('');

  private readonly isSquelchButtonVisible = Subject.create(false);

  private readonly isRadioPowered = Subject.create(false);
  private readonly isNotRadioPowered = this.isRadioPowered.map(SubscribableMapFunctions.not());
  private readonly volume = Subject.create(0);
  private readonly radioPipes: Subscription[] = [];

  private isResumed = false;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.isRadioPowered.sub(isPowered => {
      if (isPowered) {
        this._knobLabelState.set([
          [UiKnobId.SingleOuter, 'Volume'],
          [UiKnobId.SingleInner, 'Volume'],
          [UiKnobId.LeftOuter, 'Volume'],
          [UiKnobId.LeftInner, 'Volume'],
          [UiKnobId.RightOuter, 'Volume'],
          [UiKnobId.RightInner, 'Volume'],
        ]);
      } else {
        this._knobLabelState.clear();
      }
    }, true);
  }

  /**
   * Requests this popup to bind its controls to a specific radio.
   * @param radioType The type of radio to bind.
   * @param radioIndex The G3X Touch-assigned index of the radio to bind.
   * @throws Error if the requested radio is not supported.
   */
  public request(radioType: RadioType.Com | RadioType.Nav, radioIndex: 1 | 2): void {
    const dataProvider = radioType === RadioType.Com
      ? this.props.radiosDataProvider.comRadioDataProviders[radioIndex]
      : this.props.radiosDataProvider.navRadioDataProviders[radioIndex];

    if (!dataProvider) {
      throw new Error(`RadioVolumeShortcutPopup::request(): ${radioType} radio index ${radioIndex} is not supported`);
    }

    if (radioType === RadioType.Com) {
      this.volumeSetKeyEvent = `K:${radioType}${dataProvider.simIndex}_VOLUME_SET`;

      this.label.set(this.props.radiosConfig.comDefinitions.length === 1 ? 'COM Radio' : `COM ${radioIndex}`);
      this.isSquelchButtonVisible.set(true);
      this.rootCssClass.add('radio-volume-shortcut-popup-com');
      this.rootCssClass.delete('radio-volume-shortcut-popup-nav');
    } else {
      this.volumeSetKeyEvent = `K:${radioType}${dataProvider.simIndex}_VOLUME_SET_EX1`;

      this.label.set(this.props.radiosConfig.navDefinitions.length === 1 ? 'NAV Radio' : `NAV ${radioIndex}`);
      this.isSquelchButtonVisible.set(false);
      this.rootCssClass.add('radio-volume-shortcut-popup-nav');
      this.rootCssClass.delete('radio-volume-shortcut-popup-com');
    }

    for (const pipe of this.radioPipes) {
      pipe.destroy();
    }
    this.radioPipes.length = 0;

    this.radioPipes.push(
      dataProvider.isPowered.pipe(this.isRadioPowered, !this.isResumed),
      dataProvider.volume.pipe(this.volume, !this.isResumed)
    );
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;

    for (const pipe of this.radioPipes) {
      pipe.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;

    for (const pipe of this.radioPipes) {
      pipe.pause();
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    for (const pipe of this.radioPipes) {
      pipe.destroy();
    }
    this.radioPipes.length = 0;

    this.volumeSetKeyEvent = null;
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.changeVolume(1);
        return true;
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.changeVolume(10);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.changeVolume(-1);
        return true;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.changeVolume(-10);
        return true;
    }

    return false;
  }

  /**
   * Changes the volume of this popup's bound radio.
   * @param delta The amount to change the volume, as a percent.
   */
  private changeVolume(delta: number): void {
    if (this.volumeSetKeyEvent === null || this.isNotRadioPowered.get()) {
      return;
    }

    SimVar.SetSimVarValue(this.volumeSetKeyEvent, SimVarValueType.Number, MathUtils.clamp(this.volume.get() + delta, 0, 100));
  }

  /**
   * Responds to when this popup's slider value changes.
   * @param value The new slider value.
   */
  private onSliderValueChanged(value: number): void {
    if (this.volumeSetKeyEvent === null || this.isNotRadioPowered.get()) {
      return;
    }

    SimVar.SetSimVarValue(this.volumeSetKeyEvent, SimVarValueType.Number, value * 100);
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class={this.rootCssClass}>
        <div class='radio-volume-shortcut-popup-title'>
          {this.label}
        </div>
        <div class='radio-volume-shortcut-popup-controls'>
          <UiTouchSlider
            bus={this.props.uiService.bus}
            orientation='to-right'
            state={this.volume.map(val => (val / 100))}
            isVisible={this.isRadioPowered}
            onValueChanged={this.onSliderValueChanged.bind(this)}
            inset={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='radio-volume-shortcut-popup-slider-occlude'>
                <path d='M 0 0 v 1 l 1 -1 z' />
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
          </UiTouchSlider>
          <G3XFailureBox
            show={this.isNotRadioPowered}
            label='VOL'
            class='radio-volume-shortcut-popup-slider-failure-box'
          />
          <UiToggleTouchButton
            state={Subject.create(false)}
            label='Squelch'
            isVisible={this.isSquelchButtonVisible}
            isEnabled={false}
            class='radio-volume-shortcut-squelch-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const pipe of this.radioPipes) {
      pipe.destroy();
    }

    if (this.thisNode) {
      FSComponent.shallowDestroy(this.thisNode);
    }

    super.destroy();
  }
}
