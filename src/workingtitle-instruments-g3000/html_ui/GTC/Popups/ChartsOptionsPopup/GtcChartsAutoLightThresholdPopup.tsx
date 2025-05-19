import {
  ArrayUtils, ConsumerSubject, CssTransformBuilder, CssTransformSubject, FSComponent, MappedSubscribable, MathUtils,
  Subscription, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneIndex, G3000BacklightEvents, G3000ChartsUserSettings, G3000FilePaths
} from '@microsoft/msfs-wtg3000-common';

import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcSliderThumbIcon } from '../../Components/TouchSlider/GtcSliderThumbIcon';
import { TouchSlider } from '../../Components/TouchSlider/TouchSlider';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcChartsAutoLightThresholdPopup.css';

/**
 * A GTC popup that allows the user to change the auto light mode threshold used for electronic charts.
 */
export class GtcChartsAutoLightThresholdPopup extends GtcView {
  private thisNode?: VNode;

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  private readonly thresholdSetting: UserSetting<number>;
  private readonly thresholdFraction: MappedSubscribable<number>;
  private readonly thresholdValueText: MappedSubscribable<string>;

  private readonly backlightLevel = ConsumerSubject.create(null, 0).pause();

  private readonly backlightIndicatorCssTransform = CssTransformSubject.create(
    CssTransformBuilder.translate3d('%', 'px', 'px')
  );

  private readonly subscriptions: Subscription[] = [
    this.backlightLevel
  ];

  /**
   * Creates a new instance of GtcChartsAutoLightThresholdPopupProps.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcViewProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcChartsAutoLightThresholdPopupProps: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;

    this.thresholdSetting = G3000ChartsUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex)
      .getSetting('chartsLightThreshold');

    this.thresholdFraction = this.thresholdSetting.map(threshold => threshold * 0.01).pause();
    this.thresholdValueText = this.thresholdSetting.map(threshold => `${threshold.toFixed(0)}%`).pause();

    this.subscriptions.push(
      this.thresholdFraction,
      this.thresholdValueText
    );
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Auto Light Mode Threshold');

    let backlightLevelTopic: keyof G3000BacklightEvents;
    switch (this.displayPaneIndex) {
      case DisplayPaneIndex.LeftPfd:
        backlightLevelTopic = 'g3000_backlight_pfd_1';
        break;
      case DisplayPaneIndex.RightPfd:
        backlightLevelTopic = 'g3000_backlight_pfd_2';
        break;
      default:
        backlightLevelTopic = 'g3000_backlight_mfd_1';
        break;
    }

    this.backlightLevel.setConsumer(this.props.gtcService.bus.getSubscriber<G3000BacklightEvents>().on(backlightLevelTopic));

    this.backlightLevel.sub(this.onBacklightLevelChanged.bind(this), true);
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /**
   * Responds to when the backlight level of the parent GDU of this popup's controlled display pane changes.
   * @param backlightLevel The new backlight level, in the range `[0, 1]`.
   */
  private onBacklightLevelChanged(backlightLevel: number): void {
    this.backlightIndicatorCssTransform.transform.set(MathUtils.clamp(backlightLevel * 100, 0, 100), 0, 0, 0.1);
    this.backlightIndicatorCssTransform.resolve();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='charts-auto-light-threshold-popup gtc-popup-panel'>
        <div class='charts-auto-light-threshold-popup-header'>
          <span class='charts-auto-light-threshold-popup-header-title'>Threshold Level: </span>
          <span class='charts-auto-light-threshold-popup-header-value'>
            {this.thresholdValueText}
          </span>
        </div>
        <div class='charts-auto-light-threshold-popup-main'>
          <GtcImgTouchButton
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_minus_left.png`}
            onPressed={(): void => {
              this.thresholdSetting.set(Math.max(0, Math.ceil(this.thresholdSetting.get()) - 1));
            }}
            class='charts-auto-light-threshold-popup-inc-button'
          />
          <TouchSlider
            bus={this.props.gtcService.bus}
            orientation='to-right'
            state={this.thresholdFraction}
            stops={ArrayUtils.range(101, 0, 0.01)}
            changeValueOnDrag
            lockFocusOnDrag
            onValueChanged={value => { this.thresholdSetting.set(value * 100); }}
            thumb={<GtcSliderThumbIcon sliderOrientation='horizontal' />}
            background={
              <img
                src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/thres_slider_day.png`}
                class='charts-auto-light-threshold-popup-slider-background-img'
              />
            }
            foreground={
              <img
                src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/thres_slider_night.png`}
                class='charts-auto-light-threshold-popup-slider-foreground-img'
              />
            }
            inset={
              <div
                class='charts-auto-light-threshold-popup-slider-backlight-indicator-translate'
                style={{
                  'position': 'absolute',
                  'transform': this.backlightIndicatorCssTransform,
                }}
              >
                <div
                  class='charts-auto-light-threshold-popup-slider-backlight-indicator'
                  style={{
                    'position': 'absolute',
                    'left': '0px',
                    'transform': 'translateX(-50%)',
                  }}
                >
                  <svg
                    viewBox='0 0 10 10'
                    class='charts-auto-light-threshold-popup-slider-backlight-indicator-pointer'
                  >
                    <path d='M 5 0 L 0 10 L 10 10 z' />
                  </svg>
                  <div class='charts-auto-light-threshold-popup-slider-backlight-indicator-text'>
                    Current {
                      this.displayPaneIndex === DisplayPaneIndex.LeftPfd ? 'PFD1'
                        : this.displayPaneIndex === DisplayPaneIndex.RightPfd ? 'PFD2'
                          : 'MFD'
                    }
                    <br />
                    Backlight Level
                    <br />
                    {this.backlightLevel.map(level => `${(level * 100).toFixed(0)}%`)}
                  </div>
                </div>
              </div>
            }
            class='charts-auto-light-threshold-popup-slider'
          />
          <GtcImgTouchButton
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_plus_right.png`}
            onPressed={(): void => {
              this.thresholdSetting.set(Math.min(100, Math.floor(this.thresholdSetting.get()) + 1));
            }}
            class='charts-auto-light-threshold-popup-inc-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
