import { FSComponent, MappedSubject, MappedSubscribable, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { WeatherRadarOperatingMode, WeatherRadarScanMode, WeatherRadarUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, WeatherRadarUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { ValueTouchButton } from '../../Components/TouchButton/ValueTouchButton';
import { GtcSliderThumbIcon } from '../../Components/TouchSlider/GtcSliderThumbIcon';
import { TouchSlider } from '../../Components/TouchSlider/TouchSlider';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcWeatherRadarSettingsPage.css';

/**
 * A GTC weather radar settings page.
 */
export class GtcWeatherRadarSettingsPage extends GtcView {
  private thisNode?: VNode;

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly radarSettingManager: UserSettingManager<WeatherRadarUserSettingTypes>;

  private readonly bearingTiltLineButtonState: MappedSubscribable<boolean>;
  private readonly bearingTiltLineButtonLabel: MappedSubscribable<string>;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcViewProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcWeatherRadarSettingsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.radarSettingManager = WeatherRadarUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

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
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Weather Radar Settings');
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
            state={Subject.create(true)}
            label={'Calibrated<br>Gain'}
            isEnabled={false}
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
          <TouchButton isEnabled={false}>
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_volume_plus_up.png' />
          </TouchButton>
          <TouchSlider
            bus={this.bus}
            orientation='to-top'
            state={Subject.create(0.5)}
            isEnabled={false}
            foreground={
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='weather-radar-settings-gain-slider-gradient-occlude'>
                <path d='M 0 0 L 0 1 L 1 1 Z' />
              </svg>
            }
            thumb={<GtcSliderThumbIcon sliderOrientation='vertical' />}
            class='weather-radar-settings-gain-slider'
          />
          <TouchButton isEnabled={false}>
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

    super.destroy();
  }
}