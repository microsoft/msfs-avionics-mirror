import {
  DebounceTimer, DisplayComponent, FSComponent, RadioFrequencyFormatter, SimVarValueType, Subject, Subscribable,
  SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { NavFrequencyDialog } from '../../../../MFD/Views/NavFrequencyDialog/NavFrequencyDialog';
import { G3XNavRadioDataProvider } from '../../../Radio/G3XRadiosDataProvider';
import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { G3XFailureBox } from '../../Common/G3XFailureBox';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';

import './CnsNavButtonGroup.css';

/**
 * Component props for {@link CnsNavButtonGroup}.
 */
export interface CnsNavButtonProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A provider of data for the button's radio. */
  radioDataProvider: G3XNavRadioDataProvider;

  /** Whether the button is minimized. */
  isMinimized: boolean;

  /** Whether to use the volume indicator. */
  useVolumeIndicator: Subscribable<boolean>;
}

/**
 * A CNS data bar button that allows the user to tune a NAV radio.
 */
export class CnsNavButtonGroup extends DisplayComponent<CnsNavButtonProps> {
  private static readonly FREQ_HZ_FORMATTER = RadioFrequencyFormatter.createNav();

  private static readonly FREQ_FORMATTER = (freqMhz: number): string => CnsNavButtonGroup.FREQ_HZ_FORMATTER(freqMhz * 1e6);

  private thisNode?: VNode;

  private readonly isNotRadioPowered = this.props.radioDataProvider.isPowered.map(SubscribableMapFunctions.not());

  private readonly activeFreqDisplay = this.props.radioDataProvider.activeFrequency.map(CnsNavButtonGroup.FREQ_FORMATTER);
  private readonly standbyFreqDisplay = this.props.radioDataProvider.standbyFrequency.map(CnsNavButtonGroup.FREQ_FORMATTER);

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
    SimVar.SetSimVarValue(`K:NAV${this.props.radioDataProvider.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
  }

  /**
   * Sets the standby frequency of this button's radio.
   * @param frequency The frequency to set, in hertz.
   */
  private setStandbyFrequency(frequency: number): void {
    SimVar.SetSimVarValue(`K:NAV${this.props.radioDataProvider.simIndex}_STBY_SET_HZ`, SimVarValueType.Number, frequency);
  }

  /**
   * Responds to when the standby button is pressed.
   */
  private async onStandbyPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.NavFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const result = await this.props.uiService
        .openMfdPopup<NavFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.NavFrequencyDialog, true, { popupType: 'slideout-top-full' })
        .ref.request({
          radioIndex: this.props.radioDataProvider.index,
          initialValue: this.props.radioDataProvider.standbyFrequency.get() * 1e6
        });

      if (!result.wasCancelled) {
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
      <div class='cns-nav cns-nav-minimized'>
        <UiTouchButton
          isVisible={this.props.radioDataProvider.isPowered}
          onPressed={this.onStandbyPressed.bind(this)}
          class='cns-button-nav cns-button-nav-minimized'
        >
          <div class={{
            'cns-button-nav-content': true,
            'hidden': this.volumeIndicatorVisible
          }}>
            <div class='cns-button-nav-title'>{`NAV ${this.props.radioDataProvider.index}`}</div>
            <div class='cns-button-nav-active-freq'>{this.activeFreqDisplay}</div>
            <div class='cns-button-nav-standby-freq'>{this.standbyFreqDisplay}</div>
          </div>
          {this.renderVolumeIndicator()}
        </UiTouchButton>
        {this.renderFailureBox()}
      </div>
    ) : (
      <div class='cns-nav'>
        <CombinedTouchButton
          orientation='row'
          class={{
            'cns-nav-combined-button': true,
            'hidden': this.isNotRadioPowered
          }}
        >
          <UiTouchButton class='cns-button-nav cns-button-nav-active' onPressed={this.swapFrequencies.bind(this)}>
            <div class={{
              'cns-button-nav-content': true,
              'hidden': this.volumeIndicatorVisible,
            }}>
              <div class='cns-button-nav-title'>{`NAV ${this.props.radioDataProvider.index}`}</div>
              <div class='cns-button-nav-freq'>{this.activeFreqDisplay}</div>
              <div class='cns-button-nav-name'>&nbsp;</div>
            </div>
            {this.renderVolumeIndicator()}
          </UiTouchButton>
          <UiTouchButton class='cns-button-nav cns-button-nav-standby' onPressed={this.onStandbyPressed.bind(this)}>
            <div class='cns-button-nav-title'>STBY</div>
            <div class='cns-button-nav-freq'>{this.standbyFreqDisplay}</div>
            <div class='cns-button-nav-name'>&nbsp;</div>
          </UiTouchButton>
        </CombinedTouchButton>
        {this.renderFailureBox()}
      </div>
    );
  }

  /**
   * Renders the volume indicator for the button .
   * @returns The rendered element.
   */
  private renderVolumeIndicator(): VNode {
    return <div class={{
      'cns-button-nav-content': true,
      'hidden': this.volumeIndicatorVisible.map(SubscribableMapFunctions.not())
    }}>
      <div class='cns-button-nav-volume-title'>{`NAV ${this.props.radioDataProvider.index}`}</div>
      <svg
        viewBox='0 0 1 1'
        preserveAspectRatio='none'
        class='cns-button-nav-slider-background'
      >
        <path d='m 0 1 l 1 0 l 0 -1 z' />
      </svg>
      <svg
        viewBox='0 0 1 1'
        preserveAspectRatio='none'
        class='cns-button-nav-slider-foreground'
        style={{ '-webkit-clip-path': this.volumeIndicatorClippingStyle }}
      >
        <path d='m 0 1 l 1 0 l 0 -1 z' />
      </svg>
      <div class='cns-button-nav-slider-value'>{this.volumeText}%</div>
      <div class='cns-button-nav-slider-vol'>VOL</div>
      <div class='cns-button-nav-slider-shadow'></div>
    </div>;
  }

  /**
   * Renders this button's failure box.
   * @returns This button's failure box, as a VNode.
   */
  private renderFailureBox(): VNode {
    return (
      <G3XFailureBox
        show={this.isNotRadioPowered}
        label={`NAV ${this.props.radioDataProvider.index}`}
        class='cns-button-nav-failure-box'
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
