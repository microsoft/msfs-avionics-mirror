import {
  FSComponent, MappedSubject, MathUtils, RadioType, SimVarValueType, Subject, SubscribableMapFunctions, Subscription,
  VNode
} from '@microsoft/msfs-sdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XFailureBox } from '../../../Shared/Components/Common/G3XFailureBox';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiTouchSlider } from '../../../Shared/Components/TouchSlider/UiTouchSlider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XRadiosDataProvider } from '../../../Shared/Radio/G3XRadiosDataProvider';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';

import './MfdRadioVolumePopup.css';

/**
 * Component props for the {@link MfdRadioVolumePopup}
 */
export interface MfdVolumeRadioPopupProps extends UiViewProps {
  /** A configuration object that defines options for radios. */
  radiosConfig: RadiosConfig;

  /** A provider of radio data. */
  radiosDataProvider: G3XRadiosDataProvider;
}

/**
 * An MFD popup that allows the user to adjust radio volume.
 */
export class MfdRadioVolumePopup extends AbstractUiView<MfdVolumeRadioPopupProps> {
  private thisNode?: VNode;

  private volumeSetKeyEvent: string | null = null;

  private readonly label = Subject.create('');

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
          [UiKnobId.SingleOuter, 'Large Step'],
          [UiKnobId.SingleInner, 'Small Step'],
          [UiKnobId.LeftOuter, 'Large Step'],
          [UiKnobId.LeftInner, 'Small Step'],
          [UiKnobId.RightOuter, 'Large Step'],
          [UiKnobId.RightInner, 'Small Step'],
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
      throw new Error(`MfdRadioVolumePopup::request(): ${radioType} radio index ${radioIndex} is not supported`);
    }

    if (radioType === RadioType.Com) {
      this.volumeSetKeyEvent = `K:${radioType}${dataProvider.simIndex}_VOLUME_SET`;

      this.label.set(this.props.radiosConfig.comDefinitions.length === 1 ? 'COM Radio Volume' : `COM ${radioIndex} Volume`);
    } else {
      this.volumeSetKeyEvent = `K:${radioType}${dataProvider.simIndex}_VOLUME_SET_EX1`;

      this.label.set(this.props.radiosConfig.navDefinitions.length === 1 ? 'NAV Radio Volume' : `NAV ${radioIndex} Volume`);
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
    if (this.volumeSetKeyEvent === null) {
      return false;
    }

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
      <div class='mfd-radio-volume-popup ui-view-panel'>
        <div class='mfd-radio-volume-popup-title'>
          {this.label}
        </div>
        <div class='mfd-radio-volume-popup-controls'>
          <UiImgTouchButton
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_minus.png`}
            isEnabled={MappedSubject.create(
              ([isPowered, volume]) => isPowered && volume > 0,
              this.isRadioPowered,
              this.volume
            )}
            onPressed={this.changeVolume.bind(this, -1)}
            class='mfd-radio-volume-popup-button'
          />
          <UiTouchSlider
            bus={this.props.uiService.bus}
            orientation='to-right'
            state={this.volume.map(val => (val / 100))}
            isVisible={this.isRadioPowered}
            onValueChanged={this.onSliderValueChanged.bind(this)}
            inset={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='mfd-radio-volume-popup-slider-occlude'>
                <path d='M 0 0 v 1 l 1 -1 z' />
              </svg>
            }
            focusOnDrag
            lockFocusOnDrag
            inhibitOnDrag
            changeValueOnDrag
            class='mfd-radio-volume-popup-slider'
          >
            <div class='mfd-radio-volume-popup-slider-label'>{this.volume.map(val => `${val.toFixed()}%`)}</div>
          </UiTouchSlider>
          <G3XFailureBox
            show={this.isNotRadioPowered}
            label='VOL'
            class='mfd-radio-volume-popup-slider-failure-box'
          />
          <UiImgTouchButton
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_plus.png`}
            isEnabled={MappedSubject.create(
              ([isPowered, volume]) => isPowered && volume < 100,
              this.isRadioPowered,
              this.volume
            )}
            onPressed={this.changeVolume.bind(this, 1)}
            class='mfd-radio-volume-popup-button'
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
