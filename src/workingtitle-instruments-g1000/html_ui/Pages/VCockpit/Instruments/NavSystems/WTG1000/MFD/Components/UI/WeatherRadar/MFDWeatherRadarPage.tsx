import {
  ClockEvents,
  CombinedSubject,
  EventBus,
  FSComponent,
  MathUtils,
  SetSubject,
  Subject,
  Subscription,
  UnitType,
  Vec2Math,
  VecNMath,
  VNode
} from 'msfssdk';

import { WeatherRadar, WeatherRadarOperatingMode } from 'garminsdk';

import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';
import { WeatherRadarRange } from '../../../../Shared/WeatherRadar/WeatherRadarRange';
import { WeatherRadarUserSettings } from '../../../../Shared/WeatherRadar/WeatherRadarUserSettings';

import './MFDWeatherRadarPage.css';

/**
 * Component props for MFDWeatherRadarPage.
 */
export interface MFDWeatherRadarPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
}

/**
 * The MFD weather radar page.
 */
export class MFDWeatherRadarPage extends MFDUiPage<MFDWeatherRadarPageProps> {
  private static readonly UPDATE_FREQ = 30; // Hz

  private static readonly OPERATING_MODE_TEXT = {
    [WeatherRadarOperatingMode.Standby]: 'Standby',
    [WeatherRadarOperatingMode.Weather]: 'Weather'
  };

  private readonly radarRef = FSComponent.createRef<WeatherRadar>();

  private readonly rootCssClass = SetSubject.create(['mfd-page', 'mfd-page-weather-radar']);
  private readonly modeIndicatorCssClass = SetSubject.create(['weather-radar-indicator', 'weather-radar-indicator-mode']);
  private readonly scaleIndicatorCssClass = SetSubject.create(['weather-radar-indicator', 'weather-radar-indicator-scale']);
  private readonly bannerCssClass = SetSubject.create(['weather-radar-standby']);

  private readonly weatherRadarSettingManager = WeatherRadarUserSettings.getManager(this.props.bus);
  private readonly rangeSetting = this.weatherRadarSettingManager.getSetting('wxrRangeIndex');

  private readonly range = this.rangeSetting.map(index => {
    return WeatherRadarRange.RANGE_ARRAY[index] ?? WeatherRadarRange.RANGE_ARRAY[0];
  });

  private readonly modeIndicatorText = Subject.create('');
  private readonly bannerText = Subject.create('');

  private readonly modeState = CombinedSubject.create(
    this.weatherRadarSettingManager.getSetting('wxrActive'),
    this.weatherRadarSettingManager.getSetting('wxrOperatingMode')
  );

  private clockSub?: Subscription;

  /** @inheritdoc */
  constructor(props: MFDWeatherRadarPageProps) {
    super(props);

    this._title.set('Map – Weather Radar');
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.radarRef.instance.sleep();

    this.clockSub = this.props.bus.getSubscriber<ClockEvents>()
      .on('realTime')
      .atFrequency(MFDWeatherRadarPage.UPDATE_FREQ)
      .handle(() => { this.radarRef.instance.update(); }, true);

    this.modeState.pause();
    this.modeState.sub(([isActive, operatingMode]) => {
      let bannerText: string | undefined;
      let showScale = false;

      if (isActive) {
        this.modeIndicatorText.set(MFDWeatherRadarPage.OPERATING_MODE_TEXT[operatingMode]);

        switch (operatingMode) {
          case WeatherRadarOperatingMode.Standby:
            bannerText = 'STANDBY';
            break;
          case WeatherRadarOperatingMode.Weather:
            showScale = true;
            break;
        }
      } else {
        this.modeIndicatorText.set('Off');
        bannerText = 'OFF';
      }

      if (showScale) {
        this.scaleIndicatorCssClass.delete('hide-element');
      } else {
        this.scaleIndicatorCssClass.add('hide-element');
      }

      if (bannerText === undefined) {
        this.bannerCssClass.add('hide-element');
      } else {
        this.bannerCssClass.delete('hide-element');
        this.bannerText.set(bannerText);
      }
    }, true);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.RANGE_DEC:
        this.changeRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeRangeIndex(1);
        return true;
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Changes the MFD weather radar range index setting.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: 1 | -1): void {
    const currentIndex = this.rangeSetting.value;
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, WeatherRadarRange.RANGE_ARRAY.length - 1);

    this.rangeSetting.value = newIndex;
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('wxr-root');

    this.radarRef.instance.wake();
    this.clockSub?.resume(true);
    this.modeState.resume();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();

    this.radarRef.instance.sleep();
    this.clockSub?.pause();
    this.modeState.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class={this.rootCssClass}>
        <svg>
          <defs>
            <linearGradient id='mfd-page-weather-radar-reference-line-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stop-color='cyan' stop-opacity='0' />
              <stop offset='25%' stop-color='cyan' stop-opacity='0.25' />
              <stop offset='50%' stop-color='cyan' stop-opacity='1' />
              <stop offset='75%' stop-color='cyan' stop-opacity='0.25' />
              <stop offset='100%' stop-color='cyan' stop-opacity='0' />
            </linearGradient>
          </defs>
        </svg>
        <WeatherRadar
          ref={this.radarRef}
          bus={this.props.bus}
          bingId='mfd-page-map'
          operatingMode={this.weatherRadarSettingManager.getSetting('wxrOperatingMode')}
          scanMode={this.weatherRadarSettingManager.getSetting('wxrScanMode')}
          horizontalScanAngularWidth={MathUtils.HALF_PI}
          verticalScanAngularWidth={Math.PI / 3}
          range={this.range}
          rangeUnit={UnitType.NMILE}
          isDataFailed={Subject.create(false)}
          showBearingLine={this.weatherRadarSettingManager.getSetting('wxrShowBearingLine')}
          showTiltLine={this.weatherRadarSettingManager.getSetting('wxrShowTiltLine')}
          size={Vec2Math.create(876, 678)}
          horizontalScanPadding={VecNMath.create(4, 10, 60, 10, 60)}
          verticalScanPadding={VecNMath.create(4, 10, 60, 250, 100)}
          verticalRangeLineExtend={30}
        >
          <div class={this.modeIndicatorCssClass}>{this.modeIndicatorText}</div>
          <div class={this.scaleIndicatorCssClass}>
            <div class='weather-radar-indicator-scale-title'>Scale</div>
            <div class='weather-radar-indicator-scale-rows'>
              <div class='weather-radar-indicator-scale-row'>
                <div class='weather-radar-indicator-scale-bar weather-radar-indicator-scale-heavy'></div>
                <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-heavy'>Heavy</div>
              </div>
              <div class='weather-radar-indicator-scale-row'>
                <div class='weather-radar-indicator-scale-bar weather-radar-indicator-scale-medium'></div>
              </div>
              <div class='weather-radar-indicator-scale-row'>
                <div class='weather-radar-indicator-scale-bar weather-radar-indicator-scale-light'></div>
                <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-light'>Light</div>
              </div>
              <div class='weather-radar-indicator-scale-row'>
                <div class='weather-radar-indicator-scale-bar weather-radar-indicator-scale-black'></div>
              </div>
            </div>
          </div>
          <div class={this.bannerCssClass}>{this.bannerText}</div>
        </WeatherRadar>
      </div>
    );
  }
}
