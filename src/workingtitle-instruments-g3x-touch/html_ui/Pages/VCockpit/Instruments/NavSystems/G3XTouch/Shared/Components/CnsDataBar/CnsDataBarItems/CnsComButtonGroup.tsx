import {
  ComRadioIndex, ComSpacing, ConsumerSubject, DebounceTimer, DisplayComponent, FSComponent, MappedSubject,
  NavComEvents, RadioFrequencyFormatter, SimVarValueType, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ComFrequencyDialog } from '../../../../MFD/Views/ComFrequencyDialog/ComFrequencyDialog';
import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';
import { RadiosConfig } from '../../../AvionicsConfig';

import './CnsComButtonGroup.css';

/**
 * Component props for {@link CnsComButtonGroup}.
 */
export interface CnsComButtonProps {
  /** The index of the button's radio. */
  radioIndex: 1 | 2;

  /** The radios config */
  radiosConfig: RadiosConfig;

  /** The UI service instance. */
  uiService: UiService;

  /** Whether the button is minimized. */
  isMinimized: boolean;

  /** Whether to use the volume indicator. */
  useVolumeIndicator: Subscribable<boolean>;
}

/**
 * A CNS data bar button that allows the user to tune a COM radio.
 */
export class CnsComButtonGroup extends DisplayComponent<CnsComButtonProps> {
  private static readonly FREQ_25_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz);
  private static readonly FREQ_833_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz);

  private static readonly FREQ_FORMATTER = ([freq, spacing]: readonly [number, ComSpacing]): string => {
    return spacing === ComSpacing.Spacing833Khz
      ? CnsComButtonGroup.FREQ_833_FORMATTER(freq * 1e6)
      : CnsComButtonGroup.FREQ_25_FORMATTER(freq * 1e6);
  };

  private thisNode?: VNode;

  private readonly comSpacing = ConsumerSubject.create(null, ComSpacing.Spacing25Khz);

  private readonly activeFreq = ConsumerSubject.create(null, NaN);
  private readonly activeFreqDisplay = MappedSubject.create(CnsComButtonGroup.FREQ_FORMATTER, this.activeFreq, this.comSpacing);

  private readonly standbyFreq = ConsumerSubject.create(null, NaN);
  private readonly standbyFreqDisplay = MappedSubject.create(CnsComButtonGroup.FREQ_FORMATTER, this.standbyFreq, this.comSpacing);

  private readonly volume = ConsumerSubject.create(null, 0);
  private readonly volumeSub = this.volume.sub(this.volumeHandler.bind(this), false, true);
  private readonly volumeIndicatorClippingStyle = this.volume.map((volume) => `-webkit-clip-path: polygon(0% 0%, ${volume}% 0%, ${volume}% 100%, 0% 100%);`);
  private readonly volumeIndicatorVisible = Subject.create(false);
  private readonly hideVolumeIndicator = this.volumeIndicatorVisible.set.bind(this.volumeIndicatorVisible, false);

  private readonly volumeHideTimer = new DebounceTimer();
  private useVolumeIndicatorSub: Subscription | undefined;

  private simIndex: ComRadioIndex = 1;


  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const definition = this.props.radiosConfig.comDefinitions[this.props.radioIndex];

    if (!definition) {
      throw new Error(`No COM definition found for radio index ${this.props.radioIndex}`);
    }

    this.simIndex = definition.simIndex;


    const sub = this.props.uiService.bus.getSubscriber<NavComEvents>();
    this.comSpacing.setConsumer(sub.on(`com_spacing_mode_${this.simIndex}`));
    this.activeFreq.setConsumer(sub.on(`com_active_frequency_${this.simIndex}`));
    this.standbyFreq.setConsumer(sub.on(`com_standby_frequency_${this.simIndex}`));
    this.volume.setConsumer(sub.on(`com_volume_${this.simIndex}`));

    this.useVolumeIndicatorSub = this.props.useVolumeIndicator.sub((useVolumeIndicator) => {
      if (useVolumeIndicator) {
        this.volume.resume();
        this.volumeSub.resume();
      } else {
        this.volume.pause();
        this.volumeSub.pause();
      }
    }, true);
  }

  /**
   * Handles when the volume changes.
   */
  private volumeHandler(): void {
    this.volumeIndicatorVisible.set(true);
    this.volumeHideTimer.schedule(this.hideVolumeIndicator, 2000);
  }

  /**
   * Swaps the active and standby frequencies of this button's radio.
   */
  private swapFrequencies(): void {
    SimVar.SetSimVarValue(`K:COM${this.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
  }

  /**
   * Sets the standby frequency of this button's radio.
   * @param frequency The frequency to set, in hertz.
   */
  private setStandbyFrequency(frequency: number): void {
    SimVar.SetSimVarValue(`K:COM${this.simIndex === 1 ? '' : this.simIndex}_STBY_RADIO_SET_HZ`, SimVarValueType.Number, frequency);
  }

  /**
   * Responds to when the standby button is pressed.
   */
  private async onStandbyPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.ComFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const spacing = this.comSpacing.get();

      const result = await this.props.uiService
        .openMfdPopup<ComFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.ComFrequencyDialog, true, { popupType: 'slideout-top-full' })
        .ref.request({
          spacing,
          radioIndex: this.props.radioIndex,
          initialValue: this.standbyFreq.get() * 1e6
        });

      if (!result.wasCancelled && spacing === this.comSpacing.get()) {
        this.setStandbyFrequency(result.payload.frequency);

        if (result.payload.transfer) {
          this.swapFrequencies();
        }
      }
    }
  }

  /**
   * Renders the volume indicator for the button.
   * @returns The rendered element.
   */
  private renderVolumeIndicator(): VNode {
    return (
      <div class={{
        'cns-button-com-content': true,
        'hidden': this.volumeIndicatorVisible.map(value => !value)
      }}>
        <div class='cns-button-com-volume-title'>{`COM ${this.props.radioIndex}`}</div>
        <svg
          viewBox='0 0 1 1'
          preserveAspectRatio='none'
          class='cns-button-com-slider-background'
        >
          <path d='m 0 1 l 1 0 l 0 -1 z' />
        </svg>
        <svg
          viewBox='0 0 1 1'
          preserveAspectRatio='none'
          class='cns-button-com-slider-occlude'
          style={this.volumeIndicatorClippingStyle}
        >
          <path d='m 0 1 l 1 0 l 0 -1 z' />
        </svg>
        <div class='cns-button-com-slider-value'>{this.volume.map(volume => volume.toFixed() + '%')}</div>
        <div class='cns-button-com-slider-vol'>VOL</div>
        <div class='cns-button-com-slider-shadow'></div>
      </div>
    );
  }

  /** @inheritDoc */
  render(): VNode | null {
    return this.props.isMinimized ? (
      <div class='cns-com cns-com-minimized'>
        <UiTouchButton class='cns-button-com cns-button-com-minimized' onPressed={this.onStandbyPressed.bind(this)}>
          <div class={{
            'cns-button-com-content': true,
            'hidden': this.volumeIndicatorVisible
          }}>
            <div class='cns-button-com-title'>{`COM ${this.props.radioIndex}`}</div>
            <div class='cns-button-com-active-freq'>{this.activeFreqDisplay}</div>
            <div class='cns-button-com-standby-freq'>{this.standbyFreqDisplay}</div>
          </div>
          {this.renderVolumeIndicator()}
        </UiTouchButton>
      </div>
    ) : (
      <div class='cns-com'>
        <CombinedTouchButton orientation='row' class='cns-com-combined-button'>
          <UiTouchButton class='cns-button-com cns-button-com-active' onPressed={this.swapFrequencies.bind(this)}>
            <div class={{
              'cns-button-com-content': true,
              'hidden': this.volumeIndicatorVisible,
            }}>
              <div class='cns-button-com-title'>{`COM ${this.props.radioIndex}`}</div>
              <div class='cns-button-com-freq'>{this.activeFreqDisplay}</div>
              <div class='cns-button-com-name'>&nbsp;</div>
            </div>
            {this.renderVolumeIndicator()}
          </UiTouchButton>
          <UiTouchButton class='cns-button-com cns-button-com-standby' onPressed={this.onStandbyPressed.bind(this)}>
            <div class='cns-button-com-title'>STBY</div>
            <div class='cns-button-com-freq'>{this.standbyFreqDisplay}</div>
            <div class='cns-button-com-name'>&nbsp;</div>
          </UiTouchButton>
        </CombinedTouchButton>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.comSpacing.destroy();
    this.activeFreq.destroy();
    this.standbyFreq.destroy();
    this.volume.destroy();
    this.volumeHideTimer.clear();
    this.useVolumeIndicatorSub?.destroy();

    super.destroy();
  }
}
