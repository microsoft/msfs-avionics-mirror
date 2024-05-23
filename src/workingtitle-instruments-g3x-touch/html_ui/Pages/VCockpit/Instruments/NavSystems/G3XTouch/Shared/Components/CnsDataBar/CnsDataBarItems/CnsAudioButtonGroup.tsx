import { ComRadioIndex, ComRadioTuneEvents, DisplayComponent, FSComponent, SetSubject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { UiService } from '../../../UiSystem/UiService';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';
import { UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { G3XRadioUtils } from '../../../Radio/G3XRadioUtils';
import { RadiosConfig } from '../../../AvionicsConfig/RadiosConfig';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';

import './CnsAudioButtonGroup.css';

/** Props for {@link CnsAudioButtonGroup} */
export interface CnsAudioButtonGroupProps {
  /** The ui service */
  uiService: UiService,
  /** The button type */
  type: 'audio-only' | 'minimized' | 'normal'
  /** The shape of the selection indicator */
  shape: 'square' | 'triangle';
  /** The radios config */
  radiosConfig: RadiosConfig;
}

/**
 * CNS data bar button for a transponder
 */
export class CnsAudioButtonGroup extends DisplayComponent<CnsAudioButtonGroupProps> {

  private readonly comButtonClasses = SetSubject.create(['cns-com-button']);
  private readonly micButtonClasses = SetSubject.create(['cns-mic-button']);

  private readonly subscriptions: Subscription[] = [];

  private readonly g3xIndexToSimIndex = this.props.radiosConfig.comDefinitions.reduce((acc, comDefinition) => {
    acc[comDefinition.index] = comDefinition.simIndex;
    return acc;
  }, {} as Record<1 | 2, ComRadioIndex>);

  private thisNode?: VNode;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
    if (this.g3xIndexToSimIndex[1] !== undefined && this.g3xIndexToSimIndex[2] !== undefined) {
      const sub = this.props.uiService.bus.getSubscriber<ComRadioTuneEvents>();
      this.subscriptions.push(
        sub.on(`com_receive_${this.g3xIndexToSimIndex[1]}`).handle((value) => {
          this.comButtonClasses.toggle('is-using-1', value);
        }),
        sub.on(`com_receive_${this.g3xIndexToSimIndex[2]}`).handle((value) => {
          this.comButtonClasses.toggle('is-using-2', value);
        }),
        sub.on(`com_transmit_${this.g3xIndexToSimIndex[1]}`).handle((value) => {
          this.micButtonClasses.toggle('is-using-1', value);
        }),
        sub.on(`com_transmit_${this.g3xIndexToSimIndex[2]}`).handle((value) => {
          this.micButtonClasses.toggle('is-using-2', value);
        })
      );
    }
  }

  /** Opens the audio view */
  private openAudioView(): void {
    if (!this.props.uiService.closeMfdPopup((popup) => popup.key === UiViewKeys.AudioPopup)) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.AudioPopup, false);
    }
  }

  /** On mic pressed handler */
  private onMicPressed(): void {
    const isCom1MicSelected = this.micButtonClasses.has('is-using-1');
    if (isCom1MicSelected) {
      G3XRadioUtils.setTransmittingComIndex(this.g3xIndexToSimIndex[2]);
      if (!this.comButtonClasses.has('is-using-2')) {
        G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[1], false);
      }
      G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[2], true);
    } else {
      G3XRadioUtils.setTransmittingComIndex(this.g3xIndexToSimIndex[1]);
      if (!this.comButtonClasses.has('is-using-1')) {
        G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[2], false);
      }
      G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[1], true);
    }
  }

  /** On com pressed handler */
  private onComPressed(): void {

    const com1Selected = this.comButtonClasses.has('is-using-1');
    const com2Selected = this.comButtonClasses.has('is-using-2');

    const mic1Selected = this.micButtonClasses.has('is-using-1');
    const mic2Selected = this.micButtonClasses.has('is-using-2');

    if (mic1Selected) {
      G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[2], !com2Selected);
    } else if (mic2Selected) {
      G3XRadioUtils.setComRadioReceiveState(this.g3xIndexToSimIndex[1], !com1Selected);
    }
  }

  /**
   * Gets the normal indicator left
   * @returns The indicator left
   */
  private getNormalIndicatorLeft(): VNode {
    if (this.props.shape === 'triangle') {
      return (
        <>
          <svg height='28' width='26' class='cns-audio-button-indicator-left'>
            <polygon points='0,14 26,0 26,28' />
          </svg>
          <div class='cns-audio-button-indicator-left-label cns-audio-button-triangle'>1</div>
        </>
      );
    } else {
      return (
        <>
          <svg height='28' width='26' class='cns-audio-button-indicator-left'>
            <rect x='0' y='1' width='26' height='26' rx='3' />
          </svg>
          <div class='cns-audio-button-indicator-left-label  cns-audio-button-square'>1</div>
        </>
      );
    }
  }

  /**
   * Gets the normal indicator right
   * @returns The indicator right
   */
  private getNormalIndicatorRight(): VNode {
    if (this.props.shape === 'triangle') {
      return (
        <>
          <svg height='28' width='26' class='cns-audio-button-indicator-right'>
            <polygon points='0,0 0,28 26,14' />
          </svg>
          <div class='cns-audio-button-indicator-right-label cns-audio-button-triangle'>2</div>
        </>
      );
    } else {
      return (
        <>
          <svg height='28' width='26' class='cns-audio-button-indicator-right'>
            <rect x='0' y='1' width='26' height='26' rx='3' />
          </svg>
          <div class='cns-audio-button-indicator-right-label cns-audio-button-square'>2</div>
        </>
      );
    }
  }

  /**
   * Gets the minimized indicator left
   * @returns The indicator left
   */
  private getMinimizedIndicatorLeft(): VNode {
    if (this.props.shape === 'triangle') {
      return (
        <>
          <svg height='24' width='18' class='cns-audio-button-indicator-left'>
            <polygon points='0,12 18,0 18,24' />
          </svg>
          <div class='cns-audio-button-indicator-left-label cns-audio-button-triangle'>1</div>
        </>
      );
    } else {
      return (
        <>
          <svg height='25' width='18' class='cns-audio-button-indicator-left'>
            <rect x='0' y='1' width='18' height='24' rx='4' />
          </svg>
          <div class='cns-audio-button-indicator-left-label cns-audio-button-square'>1</div>
        </>
      );
    }
  }

  /**
   * Gets the minimized indicator right
   * @returns The indicator right
   */
  private getMinimizedIndicatorRight(): VNode {
    if (this.props.shape === 'triangle') {
      return (
        <>
          <svg height='24' width='18' class='cns-audio-button-indicator-right'>
            <polygon points='0,0 0,24 18,12' />
          </svg>
          <div class='cns-audio-button-indicator-right-label cns-audio-button-triangle'>2</div>
        </>
      );
    } else {
      return (
        <>
          <svg height='25' width='18' class='cns-audio-button-indicator-right'>
            <rect x='0' y='1' width='18' height='24' rx='4' />
          </svg>
          <div class='cns-audio-button-indicator-right-label cns-audio-button-square'>2</div>
        </>
      );
    }
  }

  /** @inheritDoc */
  public render(): VNode | null {
    // there are no definition under the index[0] so we need to check if array length is 2 or 3
    const type = (this.g3xIndexToSimIndex[1] === undefined || this.g3xIndexToSimIndex[2] === undefined) ? 'audio-only' : this.props.type;
    switch (type) {
      case 'normal':
        return (
          <CombinedTouchButton
            orientation='row'
            class='cns-audio cns-audio-normal'
          >
            <UiTouchButton
              class='cns-audio-button'
              label={'Audio'}
              onPressed={this.openAudioView.bind(this)}
            />
            <UiTouchButton
              class={this.micButtonClasses}
              onPressed={this.onMicPressed.bind(this)}
            >
              <div class='cns-mic-title'>MIC</div>
              {this.getNormalIndicatorLeft()}
              {this.getNormalIndicatorRight()}
            </UiTouchButton>
            <UiTouchButton
              class={this.comButtonClasses}
              onPressed={this.onComPressed.bind(this)}
            >
              <div class='cns-com-title'>COM</div>
              {this.getNormalIndicatorLeft()}
              {this.getNormalIndicatorRight()}
            </UiTouchButton>
          </CombinedTouchButton>
        );
      case 'minimized':
        return (
          <UiTouchButton
            class='cns-audio cns-audio-minimized'
            onPressed={this.openAudioView.bind(this)}
          >
            <div class={this.micButtonClasses}>
              <div class='cns-mic-title'>MIC</div>
              {this.getMinimizedIndicatorLeft()}
              {this.getMinimizedIndicatorRight()}
            </div>
            <div class='cns-audio-vertical-divider' />
            <div class={this.comButtonClasses}>
              <div class='cns-com-title'>COM</div>
              {this.getMinimizedIndicatorLeft()}
              {this.getMinimizedIndicatorRight()}
            </div>
          </UiTouchButton>
        );
      case 'audio-only':
        return (
          <UiTouchButton
            class='cns-audio cns-audio-only'
            onPressed={this.openAudioView.bind(this)}
            label={'Audio'}
          />
        );
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.subscriptions.forEach((sub) => sub.destroy());
    if (this.thisNode) {
      FSComponent.shallowDestroy(this.thisNode);
    }
  }
}
