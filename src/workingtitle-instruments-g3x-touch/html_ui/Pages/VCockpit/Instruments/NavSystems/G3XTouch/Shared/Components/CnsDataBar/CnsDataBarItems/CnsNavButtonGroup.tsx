import {
  NavRadioIndex, ConsumerSubject, DisplayComponent, FSComponent, NavComEvents, VNode,
  RadioFrequencyFormatter, SimVarValueType, Subject, Subscribable, Subscription, DebounceTimer
} from '@microsoft/msfs-sdk';

import { NavFrequencyDialog } from '../../../../MFD/Views/NavFrequencyDialog/NavFrequencyDialog';
import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';
import { RadiosConfig } from '../../../AvionicsConfig';

import './CnsNavButtonGroup.css';

/**
 * Component props for {@link CnsNavButtonGroup}.
 */
export interface CnsNavButtonProps {
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
 * A CNS data bar button that allows the user to tune a NAV radio.
 */
export class CnsNavButtonGroup extends DisplayComponent<CnsNavButtonProps> {
  private static readonly FREQ_HZ_FORMATTER = RadioFrequencyFormatter.createNav();

  private static readonly FREQ_FORMATTER = (freqMhz: number): string => CnsNavButtonGroup.FREQ_HZ_FORMATTER(freqMhz * 1e6);

  private thisNode?: VNode;

  private readonly activeFreq = ConsumerSubject.create(null, NaN);
  private readonly activeFreqDisplay = this.activeFreq.map(CnsNavButtonGroup.FREQ_FORMATTER);

  private readonly standbyFreq = ConsumerSubject.create(null, NaN);
  private readonly standbyFreqDisplay = this.standbyFreq.map(CnsNavButtonGroup.FREQ_FORMATTER);

  private readonly volume = ConsumerSubject.create(null, 0);
  private readonly volumeSub = this.volume.sub(this.volumeHandler.bind(this), false, true);
  private readonly volumeIndicatorClippingStyle = this.volume.map((volume) => `-webkit-clip-path: polygon(0% 0%, ${volume}% 0%, ${volume}% 100%, 0% 100%);`);
  private readonly volumeIndicatorVisible = Subject.create(false);
  private readonly hideVolumeIndicator = this.volumeIndicatorVisible.set.bind(this.volumeIndicatorVisible, false);

  private readonly volumeHideTimer = new DebounceTimer();
  private useVolumeIndicatorSub: Subscription | undefined;

  private simIndex: NavRadioIndex = 1;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const definition = this.props.radiosConfig.navDefinitions[this.props.radioIndex];

    if (!definition) {
      throw new Error(`No NAV definition found for radio index ${this.props.radioIndex}`);
    }

    this.simIndex = definition.simIndex;

    const sub = this.props.uiService.bus.getSubscriber<NavComEvents>();
    this.activeFreq.setConsumer(sub.on(`nav_active_frequency_${this.simIndex}`));
    this.standbyFreq.setConsumer(sub.on(`nav_standby_frequency_${this.simIndex}`));
    this.volume.setConsumer(sub.on(`nav_volume_${this.simIndex}`));

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
    SimVar.SetSimVarValue(`K:NAV${this.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
  }

  /**
   * Sets the standby frequency of this button's radio.
   * @param frequency The frequency to set, in hertz.
   */
  private setStandbyFrequency(frequency: number): void {
    SimVar.SetSimVarValue(`K:NAV${this.simIndex}_STBY_SET_HZ`, SimVarValueType.Number, frequency);
  }

  /**
   * Responds to when the standby button is pressed.
   */
  private async onStandbyPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.NavFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const result = await this.props.uiService
        .openMfdPopup<NavFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.NavFrequencyDialog, true, { popupType: 'slideout-top-full' })
        .ref.request({
          radioIndex: this.props.radioIndex,
          initialValue: this.standbyFreq.get() * 1e6
        });

      if (!result.wasCancelled) {
        this.setStandbyFrequency(result.payload.frequency);

        if (result.payload.transfer) {
          this.swapFrequencies();
        }
      }
    }
  }

  /**
   * Renders the volume indicator for the button .
   * @returns The rendered element.
   */
  private renderVolumeIndicator(): VNode {
    return <div class={{
      'cns-button-nav-content': true,
      'hidden': this.volumeIndicatorVisible.map(value => !value)
    }}>
      <div class='cns-button-nav-volume-title'>{`NAV ${this.props.radioIndex}`}</div>
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
        class='cns-button-nav-slider-occlude'
        style={this.volumeIndicatorClippingStyle}
      >
        <path d='m 0 1 l 1 0 l 0 -1 z' />
      </svg>
      <div class='cns-button-nav-slider-value'>{this.volume.map(volume => volume.toFixed())}%</div>
      <div class='cns-button-nav-slider-vol'>VOL</div>
      <div class='cns-button-nav-slider-shadow'></div>
    </div>;
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return this.props.isMinimized ? (
      <div class='cns-nav cns-nav-minimized'>
        <UiTouchButton class='cns-button-nav cns-button-nav-minimized' onPressed={this.onStandbyPressed.bind(this)}>
          <div class={{
            'cns-button-nav-content': true,
            'hidden': this.volumeIndicatorVisible
          }}>
            <div class='cns-button-nav-title'>{`NAV ${this.props.radioIndex}`}</div>
            <div class='cns-button-nav-active-freq'>{this.activeFreqDisplay}</div>
            <div class='cns-button-nav-standby-freq'>{this.standbyFreqDisplay}</div>
          </div>
          {this.renderVolumeIndicator()}
        </UiTouchButton>
      </div>
    ) : (
      <div class='cns-nav'>
        <CombinedTouchButton orientation='row' class='cns-nav-combined-button'>
          <UiTouchButton class='cns-button-nav cns-button-nav-active' onPressed={this.swapFrequencies.bind(this)}>
            <div class={{
              'cns-button-nav-content': true,
              'hidden': this.volumeIndicatorVisible,
            }}>
              <div class='cns-button-nav-title'>{`NAV ${this.props.radioIndex}`}</div>
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
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.activeFreq.destroy();
    this.standbyFreq.destroy();
    this.volume.destroy();
    this.volumeHideTimer.clear();
    this.useVolumeIndicatorSub?.destroy();

    super.destroy();
  }
}
