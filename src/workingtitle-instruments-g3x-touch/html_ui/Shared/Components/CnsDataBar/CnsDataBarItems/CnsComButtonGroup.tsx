import {
  ComSpacing, DebounceTimer, DisplayComponent, FSComponent, MappedSubject, RadioFrequencyFormatter, SimVarValueType,
  Subject, Subscribable, SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ComFrequencyDialog } from '../../../../MFD/Views/ComFrequencyDialog/ComFrequencyDialog';
import { G3XComRadioDataProvider } from '../../../Radio/G3XRadiosDataProvider';
import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { G3XFailureBox } from '../../Common/G3XFailureBox';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';

import './CnsComButtonGroup.css';

/**
 * Component props for {@link CnsComButtonGroup}.
 */
export interface CnsComButtonProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A provider of data for the button's radio. */
  radioDataProvider: G3XComRadioDataProvider;

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

  private readonly isNotRadioPowered = this.props.radioDataProvider.isPowered.map(SubscribableMapFunctions.not());

  private readonly activeFreqDisplay = MappedSubject.create(
    CnsComButtonGroup.FREQ_FORMATTER,
    this.props.radioDataProvider.activeFrequency,
    this.props.radioDataProvider.frequencySpacing
  );
  private readonly standbyFreqDisplay = MappedSubject.create(
    CnsComButtonGroup.FREQ_FORMATTER,
    this.props.radioDataProvider.standbyFrequency,
    this.props.radioDataProvider.frequencySpacing
  );

  private readonly volumeIndicatorVisible = Subject.create(false);
  private readonly volumeText = this.props.radioDataProvider.volume.map(volume => volume.toFixed()).pause();
  private readonly volumeIndicatorClippingStyle = this.props.radioDataProvider.volume.map(volume => {
    // Clip paths with zero area are disabled, so do not allow width to reach zero.
    const width = Math.max(volume, 0.01);
    return `polygon(0% 0%, ${width}% 0%, ${width}% 100%, 0% 100%)`;
  }).pause();
  private readonly volumeSub = this.props.radioDataProvider.volume.sub(this.onVolumeChanged.bind(this), false, true);

  private readonly volumeHideTimer = new DebounceTimer();
  private readonly hideVolumeIndicator = this.volumeIndicatorVisible.set.bind(this.volumeIndicatorVisible, false);
  private useVolumeIndicatorSub: Subscription | undefined;


  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.useVolumeIndicatorSub = this.props.useVolumeIndicator.sub((useVolumeIndicator) => {
      if (useVolumeIndicator) {
        this.volumeText.resume();
        this.volumeIndicatorClippingStyle.resume();
        this.volumeSub.resume();
      } else {
        this.volumeText.pause();
        this.volumeIndicatorClippingStyle.pause();
        this.volumeSub.pause();
        this.volumeHideTimer.clear();
      }
    }, true);
  }

  /**
   * Handles when the volume of this button's radio changes.
   */
  private onVolumeChanged(): void {
    this.volumeIndicatorVisible.set(true);
    this.volumeHideTimer.schedule(this.hideVolumeIndicator, 2000);
  }

  /**
   * Swaps the active and standby frequencies of this button's radio.
   */
  private swapFrequencies(): void {
    SimVar.SetSimVarValue(`K:COM${this.props.radioDataProvider.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
  }

  /**
   * Sets the standby frequency of this button's radio.
   * @param frequency The frequency to set, in hertz.
   */
  private setStandbyFrequency(frequency: number): void {
    SimVar.SetSimVarValue(
      `K:COM${this.props.radioDataProvider.simIndex === 1 ? '' : this.props.radioDataProvider.simIndex}_STBY_RADIO_SET_HZ`,
      SimVarValueType.Number,
      frequency
    );
  }

  /**
   * Responds to when the standby button is pressed.
   */
  private async onStandbyPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.ComFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const spacing = this.props.radioDataProvider.frequencySpacing.get();

      const result = await this.props.uiService
        .openMfdPopup<ComFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.ComFrequencyDialog, true, { popupType: 'slideout-top-full' })
        .ref.request({
          spacing,
          radioIndex: this.props.radioDataProvider.index,
          initialValue: this.props.radioDataProvider.standbyFrequency.get() * 1e6
        });

      if (!result.wasCancelled && spacing === this.props.radioDataProvider.frequencySpacing.get()) {
        this.setStandbyFrequency(result.payload.frequency);

        if (result.payload.transfer) {
          this.swapFrequencies();
        }
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return this.props.isMinimized ? (
      <div class='cns-com cns-com-minimized'>
        <UiTouchButton
          isVisible={this.props.radioDataProvider.isPowered}
          onPressed={this.onStandbyPressed.bind(this)}
          class='cns-button-com cns-button-com-minimized'
        >
          <div class={{
            'cns-button-com-content': true,
            'hidden': this.volumeIndicatorVisible
          }}>
            <div class='cns-button-com-title'>{`COM ${this.props.radioDataProvider.index}`}</div>
            <div class='cns-button-com-active-freq'>{this.activeFreqDisplay}</div>
            <div class='cns-button-com-standby-freq'>{this.standbyFreqDisplay}</div>
          </div>
          {this.renderVolumeIndicator()}
        </UiTouchButton>
        {this.renderFailureBox()}
      </div>
    ) : (
      <div class='cns-com'>
        <CombinedTouchButton
          orientation='row'
          class={{
            'cns-com-combined-button': true,
            'hidden': this.isNotRadioPowered
          }}
        >
          <UiTouchButton class='cns-button-com cns-button-com-active' onPressed={this.swapFrequencies.bind(this)}>
            <div class={{
              'cns-button-com-content': true,
              'hidden': this.volumeIndicatorVisible,
            }}>
              <div class='cns-button-com-title'>{`COM ${this.props.radioDataProvider.index}`}</div>
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
        {this.renderFailureBox()}
      </div>
    );
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
        <div class='cns-button-com-volume-title'>{`COM ${this.props.radioDataProvider.index}`}</div>
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
          class='cns-button-com-slider-foreground'
          style={{ '-webkit-clip-path': this.volumeIndicatorClippingStyle }}
        >
          <path d='m 0 1 l 1 0 l 0 -1 z' />
        </svg>
        <div class='cns-button-com-slider-value'>{this.volumeText}%</div>
        <div class='cns-button-com-slider-vol'>VOL</div>
        <div class='cns-button-com-slider-shadow'></div>
      </div>
    );
  }

  /**
   * Renders this button's failure box.
   * @returns This button's failure box, as a VNode.
   */
  private renderFailureBox(): VNode {
    return (
      <G3XFailureBox
        show={this.isNotRadioPowered}
        label={`COM ${this.props.radioDataProvider.index}`}
        class='cns-button-com-failure-box'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.isNotRadioPowered.destroy();
    this.activeFreqDisplay.destroy();
    this.standbyFreqDisplay.destroy();
    this.volumeText.destroy();
    this.volumeIndicatorClippingStyle.destroy();
    this.volumeSub.destroy();
    this.volumeHideTimer.clear();
    this.useVolumeIndicatorSub?.destroy();

    super.destroy();
  }
}
