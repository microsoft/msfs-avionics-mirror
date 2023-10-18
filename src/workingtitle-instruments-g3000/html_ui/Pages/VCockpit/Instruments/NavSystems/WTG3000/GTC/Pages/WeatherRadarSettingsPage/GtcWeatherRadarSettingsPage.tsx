import {
  AdcEvents, ArrayUtils, ConsumerValue, FSComponent, MappedSubject, MappedSubscribable, MathUtils, Subject, Subscription,
  UserSetting, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { WeatherRadarOperatingMode, WeatherRadarScanMode, WeatherRadarUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, WeatherRadarDefinition, WeatherRadarEvents, WeatherRadarUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { ValueTouchButton } from '../../Components/TouchButton/ValueTouchButton';
import { GtcSliderThumbIcon } from '../../Components/TouchSlider/GtcSliderThumbIcon';
import { TouchSlider } from '../../Components/TouchSlider/TouchSlider';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcWeatherRadarSettingsPage.css';

/**
 * Component props for {@link GtcWeatherRadarSettingsPage}.
 */
export interface GtcWeatherRadarSettingsPageProps extends GtcViewProps {
  /** Configuration options for the weather radar. */
  weatherRadarConfig: WeatherRadarDefinition;
}

/**
 * A GTC weather radar settings page.
 */
export class GtcWeatherRadarSettingsPage extends GtcView<GtcWeatherRadarSettingsPageProps> {
  private thisNode?: VNode;

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly radarSettingManager: UserSettingManager<WeatherRadarUserSettingTypes>;
  private readonly gainSetting: UserSetting<number>;

  private readonly bearingTiltLineButtonState: MappedSubscribable<boolean>;
  private readonly bearingTiltLineButtonLabel: MappedSubscribable<string>;

  private readonly gainSettingMin = this.props.weatherRadarConfig.minGain;
  private readonly gainSettingMax = this.props.weatherRadarConfig.maxGain;
  private readonly gainSettingRange = this.gainSettingMax - this.gainSettingMin;
  private readonly gainSliderState = Subject.create(0);

  private readonly isGainSliderEnabled: MappedSubscribable<boolean>;

  private readonly isOnGround = ConsumerValue.create(null, false);
  private readonly isRadarScanActive = ConsumerValue.create(null, false);

  private gainSettingSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcWeatherRadarSettingsPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcWeatherRadarSettingsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.radarSettingManager = WeatherRadarUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.gainSetting = this.radarSettingManager.getSetting('wxrGain');

    this.bearingTiltLineButtonState = MappedSubject.create(
      ([scanMode, showBearing, showTilt]): boolean => {
        return scanMode === WeatherRadarScanMode.Horizontal ? showBearing : showTilt;
      },
      this.radarSettingManager.getSetting('wxrScanMode'),
      this.radarSettingManager.getSetting('wxrShowBearingLine'),
      this.radarSettingManager.getSetting('wxrShowTiltLine')
    );

    this.bearingTiltLineButtonLabel = this.radarSettingManager.getSetting('wxrScanMode').map(mode => {
      return mode === WeatherRadarScanMode.Horizontal ? 'Bearing Line' : 'Tilt Line';
    });

    this.isGainSliderEnabled = MappedSubject.create(
      ([isActive, calibratedGain]) => isActive && !calibratedGain,
      this.radarSettingManager.getSetting('wxrActive'),
      this.radarSettingManager.getSetting('wxrCalibratedGain')
    );
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Weather Radar Settings');

    const sub = this.bus.getSubscriber<AdcEvents & WeatherRadarEvents>();

    this.isOnGround.setConsumer(sub.on('on_ground'));
    this.isRadarScanActive.setConsumer(sub.on('wx_radar_is_scan_active'));

    this.gainSettingSub = this.gainSetting.sub(this.onGainSettingChanged.bind(this), true);
  }

  /**
   * Responds to when the user selects an operating mode.
   * @param value The selected operating mode.
   * @param setting The operating mode user setting.
   */
  private async onOperatingModeSelected(value: WeatherRadarOperatingMode, setting: UserSetting<WeatherRadarOperatingMode>): Promise<void> {
    if (value !== WeatherRadarOperatingMode.Standby && this.isOnGround.get() && !this.isRadarScanActive.get()) {
      const result = await GtcDialogs.openMessageDialog(
        this.props.gtcService,
        'CAUTION: Activating radar on ground. Read and follow all safety precautions.\nContinue activating radar?'
      );

      if (result) {
        setting.value = value;
      }
    } else {
      setting.value = value;
    }
  }

  /**
   * Responds to when the value of the gain user setting changes.
   * @param gain The new gain user setting value, in dBZ.
   */
  private onGainSettingChanged(gain: number): void {
    const sliderValue = MathUtils.clamp((Math.round(gain) - this.gainSettingMin) / this.gainSettingRange, 0, 1);
    this.gainSliderState.set(sliderValue);
  }

  /**
   * Responds to when the gain slider's value changes from user input.
   * @param value The new value.
   */
  private onGainSliderValueChanged(value: number): void {
    const gain = Math.round(value * this.gainSettingRange + this.gainSettingMin);
    this.gainSetting.value = gain;
  }

  /**
   * Increments the gain setting.
   * @param increment The increment to apply, in dBZ.
   */
  private incrementGain(increment: 1 | -1): void {
    this.gainSetting.value = MathUtils.clamp(this.gainSetting.value + increment, this.gainSettingMin, this.gainSettingMax);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='weather-radar-settings'>
        <div class='weather-radar-settings-upper'>
          <ToggleTouchButton
            state={this.radarSettingManager.getSetting('wxrActive')}
            label={'Radar On'}
          />
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            isEnabled={this.radarSettingManager.getSetting('wxrActive')}
            state={this.radarSettingManager.getSetting('wxrOperatingMode')}
            label={'Display Mode'}
            listDialogKey={GtcViewKeys.ListDialog1}
            listParams={{
              title: 'Weather Radar Display Mode',
              inputData: [
                {
                  value: WeatherRadarOperatingMode.Standby,
                  labelRenderer: () => 'Standby'
                },
                {
                  value: WeatherRadarOperatingMode.Weather,
                  labelRenderer: () => 'Weather'
                }
              ],
              selectedValue: this.radarSettingManager.getSetting('wxrOperatingMode')
            }}
            onSelected={this.onOperatingModeSelected.bind(this)}
          />
          <ValueTouchButton
            state={Subject.create('FULL')}
            label={'Sector Scan'}
            isEnabled={false}
          />
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            isEnabled={this.radarSettingManager.getSetting('wxrActive')}
            state={this.radarSettingManager.getSetting('wxrScanMode')}
            label={'Scan'}
            listDialogKey={GtcViewKeys.ListDialog1}
            listParams={{
              title: 'Weather Radar Scan Mode',
              inputData: [
                {
                  value: WeatherRadarScanMode.Horizontal,
                  labelRenderer: () => 'Horizontal'
                },
                {
                  value: WeatherRadarScanMode.Vertical,
                  labelRenderer: () => 'Vertical'
                }
              ],
              selectedValue: this.radarSettingManager.getSetting('wxrScanMode')
            }}
          />
        </div>
        <div class='weather-radar-settings-lower'>
          <ToggleTouchButton
            state={Subject.create(false)}
            label={'WX Watch'}
            isEnabled={false}
          />
          <ToggleTouchButton
            state={Subject.create(false)}
            label={'WX Alert'}
            isEnabled={false}
          />
          <ToggleTouchButton
            isEnabled={this.radarSettingManager.getSetting('wxrActive')}
            state={this.radarSettingManager.getSetting('wxrCalibratedGain')}
            label={'Calibrated<br>Gain'}
          />
          <ToggleTouchButton
            isEnabled={this.radarSettingManager.getSetting('wxrActive')}
            state={this.bearingTiltLineButtonState}
            label={this.bearingTiltLineButtonLabel}
            onPressed={(): void => {
              const setting = this.radarSettingManager.getSetting('wxrScanMode').value === WeatherRadarScanMode.Horizontal
                ? this.radarSettingManager.getSetting('wxrShowBearingLine')
                : this.radarSettingManager.getSetting('wxrShowTiltLine');

              setting.value = !setting.value;
            }}
          />
          <ToggleTouchButton
            state={Subject.create(false)}
            label={'Stabilizer'}
            isEnabled={false}
          />
          <ToggleTouchButton
            state={Subject.create(false)}
            label={'Altitude<br>Comp Tilt'}
            isEnabled={false}
          />
        </div>
        <div class='weather-radar-settings-gain'>
          <div class='weather-radar-settings-gain-title'>Gain</div>
          <TouchButton
            isEnabled={this.isGainSliderEnabled}
            onPressed={this.incrementGain.bind(this, 1)}
          >
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_volume_plus_up.png' />
          </TouchButton>
          <TouchSlider
            bus={this.bus}
            orientation='to-top'
            isEnabled={this.isGainSliderEnabled}
            state={this.gainSliderState}
            stops={ArrayUtils.create(this.gainSettingRange + 1, index => {
              return index / this.gainSettingRange;
            })}
            changeValueOnDrag
            onValueChanged={this.onGainSliderValueChanged.bind(this)}
            foreground={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='weather-radar-settings-gain-slider-gradient-occlude'>
                <path d='M 0 0 L 0 1 L 1 1 Z' />
              </svg>
            }
            inset={<div class='weather-radar-settings-gain-slider-calibrated-line' style={`top: ${this.gainSettingMax / this.gainSettingRange * 100}%;`} />}
            thumb={<GtcSliderThumbIcon sliderOrientation='vertical' />}
            class='weather-radar-settings-gain-slider'
          />
          <TouchButton
            isEnabled={this.isGainSliderEnabled}
            onPressed={this.incrementGain.bind(this, -1)}
          >
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_volume_minus_down.png' />
          </TouchButton>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.bearingTiltLineButtonState.destroy();
    this.bearingTiltLineButtonLabel.destroy();

    this.isGainSliderEnabled.destroy();

    this.isOnGround.destroy();
    this.isRadarScanActive.destroy();

    this.gainSettingSub?.destroy();

    super.destroy();
  }
}