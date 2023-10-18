import {
  AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus, FSComponent, MappedSubject, MathUtils, ReadonlyFloat64Array,
  Subject, Subscription, UnitType, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { WeatherRadar, WeatherRadarAvionicsSystemEvents, WeatherRadarOperatingMode, WeatherRadarUtils } from '@microsoft/msfs-garminsdk';

import { WeatherRadarDefinition } from '../../AvionicsConfig/SensorsConfig';
import { WeatherRadarUserSettings } from '../../Settings/WeatherRadarUserSettings';
import { WeatherRadarEvents } from '../../WeatherRadar/WeatherRadarEvents';
import { WeatherRadarRange } from '../../WeatherRadar/WeatherRadarRange';
import { ControllableDisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';

import './WeatherRadarPaneView.css';

/**
 * Component props for WeatherRadarPaneView.
 */
export interface WeatherRadarPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** Configuration options for the weather radar. */
  config: WeatherRadarDefinition;
}

/**
 * A display pane view which displays a weather radar.
 */
export class WeatherRadarPaneView extends DisplayPaneView<WeatherRadarPaneViewProps> {
  private static readonly HORIZ_SCAN_PADDING: Record<DisplayPaneSizeMode.Full | DisplayPaneSizeMode.Half, ReadonlyFloat64Array> = {
    [DisplayPaneSizeMode.Full]: VecNMath.create(4, 25, 40, 25, 90),
    [DisplayPaneSizeMode.Half]: VecNMath.create(4, 25, 40, 25, 295),
  };
  private static readonly VERT_SCAN_PADDING: Record<DisplayPaneSizeMode.Full | DisplayPaneSizeMode.Half, ReadonlyFloat64Array> = {
    [DisplayPaneSizeMode.Full]: VecNMath.create(4, 20, 40, 175, 185),
    [DisplayPaneSizeMode.Half]: VecNMath.create(4, 10, 40, 175, 185),
  };

  private static readonly OPERATING_MODE_TEXT = {
    [WeatherRadarOperatingMode.Standby]: 'Standby',
    [WeatherRadarOperatingMode.Weather]: 'Weather'
  };

  private readonly radarRef = FSComponent.createRef<WeatherRadar>();

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));
  private readonly horizontalScanPadding = Subject.create(WeatherRadarPaneView.HORIZ_SCAN_PADDING[DisplayPaneSizeMode.Full]);
  private readonly verticalScanPadding = Subject.create(WeatherRadarPaneView.VERT_SCAN_PADDING[DisplayPaneSizeMode.Full]);

  private readonly operatingMode = Subject.create(WeatherRadarOperatingMode.Standby);
  private readonly isDataFailed = Subject.create(false);

  private readonly weatherRadarSettingManager = WeatherRadarUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);
  private readonly rangeSetting = this.weatherRadarSettingManager.getSetting('wxrRangeIndex');
  private readonly gainSetting = this.weatherRadarSettingManager.getSetting('wxrGain');

  private readonly range = this.rangeSetting.map(index => {
    return WeatherRadarRange.RANGE_ARRAY[index] ?? WeatherRadarRange.RANGE_ARRAY[0];
  });

  private readonly gain = Subject.create(0);

  private readonly modeIndicatorText = Subject.create('');

  private readonly scaleHidden = Subject.create(false);

  private readonly gainText = MappedSubject.create(
    ([calibrated, gain]) => {
      if (calibrated) {
        return 'Calibrated';
      } else {
        return gain.toFixed(1);
      }
    },
    this.weatherRadarSettingManager.getSetting('wxrCalibratedGain'),
    this.gain
  ).pause();

  private readonly bannerHidden = Subject.create(false);
  private readonly bannerText = Subject.create('');

  private readonly systemState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly isScanActive = ConsumerSubject.create(null, false);

  private readonly modeState = MappedSubject.create(
    this.systemState,
    this.isScanActive,
    this.weatherRadarSettingManager.getSetting('wxrActive'),
    this.weatherRadarSettingManager.getSetting('wxrOperatingMode')
  ).pause();

  private gainPipe?: Subscription;

  /** @inheritdoc */
  public override onAfterRender(): void {
    this._title.set('Weather Radar');

    this.radarRef.instance.sleep();

    const sub = this.props.bus.getSubscriber<WeatherRadarAvionicsSystemEvents & WeatherRadarEvents>();

    this.systemState.setConsumer(sub.on('wx_radar_state'));
    this.isScanActive.setConsumer(sub.on('wx_radar_is_scan_active'));

    this.modeState.sub(([systemState, isScanActive, activeSetting, operatingModeSetting]) => {
      let bannerText: string | undefined;
      let showScale = false;

      if (systemState === undefined || !activeSetting) {
        this.operatingMode.set(WeatherRadarOperatingMode.Standby);
        this.isDataFailed.set(false);

        this.modeIndicatorText.set('Off');
        bannerText = 'OFF';
      } else if (systemState.current === AvionicsSystemState.Failed || systemState.current === AvionicsSystemState.Off) {
        this.operatingMode.set(operatingModeSetting);
        this.isDataFailed.set(true);

        this.modeIndicatorText.set('Fail');
        bannerText = 'RADAR FAIL';
      } else if (systemState.current === AvionicsSystemState.Initializing || !isScanActive) {
        this.operatingMode.set(WeatherRadarOperatingMode.Standby);
        this.isDataFailed.set(false);

        this.modeIndicatorText.set(WeatherRadarPaneView.OPERATING_MODE_TEXT[WeatherRadarOperatingMode.Standby]);
        bannerText = 'STANDBY';
      } else {
        this.operatingMode.set(operatingModeSetting);
        this.isDataFailed.set(false);

        this.modeIndicatorText.set(WeatherRadarPaneView.OPERATING_MODE_TEXT[operatingModeSetting]);

        switch (operatingModeSetting) {
          case WeatherRadarOperatingMode.Standby:
            bannerText = 'STANDBY';
            break;
          case WeatherRadarOperatingMode.Weather:
            showScale = true;
            break;
        }
      }

      this.scaleHidden.set(!showScale);

      if (bannerText === undefined) {
        this.bannerHidden.set(true);
      } else {
        this.bannerHidden.set(false);
        this.bannerText.set(bannerText);
      }
    }, true);

    this.gainPipe = this.gainSetting.pipe(this.gain, gain => MathUtils.clamp(Math.round(gain), this.props.config.minGain, this.props.config.maxGain));
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
    this.radarRef.instance.wake();
    this.modeState.resume();
    this.gainText.resume();
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.radarRef.instance.sleep();
    this.modeState.pause();
    this.gainText.pause();
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
  }

  /**
   * Updates the size of the weather radar display.
   * @param size The size of this view's parent pane.
   * @param width The width of the weather radar, in pixels.
   * @param height The height of the weather radar, in pixels.
   */
  private updateSize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.size.set(width, height);
    if (size !== DisplayPaneSizeMode.Hidden) {
      this.horizontalScanPadding.set(WeatherRadarPaneView.HORIZ_SCAN_PADDING[size]);
      this.verticalScanPadding.set(WeatherRadarPaneView.VERT_SCAN_PADDING[size]);
    }
  }

  /** @inheritdoc */
  public override onUpdate(): void {
    this.radarRef.instance.update();
  }

  /** @inheritdoc */
  public override onEvent(event: DisplayPaneViewEvent): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.changeRangeIndex(1);
        return;
      case 'display_pane_map_range_dec':
        this.changeRangeIndex(-1);
        return;
    }
  }

  /**
   * Changes this pane's weather radar range index setting.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: 1 | -1): void {
    const currentIndex = this.rangeSetting.value;
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, WeatherRadarRange.RANGE_ARRAY.length - 1);

    this.rangeSetting.value = newIndex;
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <div class={{ 'weather-radar-pane': true, 'weather-radar-pane-failed': this.isDataFailed }}>
        <svg>
          <defs>
            <linearGradient id='weather-radar-reference-line-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
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
          bingId={`pane_map_${this.props.index}`}
          bus={this.props.bus}
          operatingMode={this.operatingMode}
          scanMode={this.weatherRadarSettingManager.getSetting('wxrScanMode')}
          horizontalScanAngularWidth={this.props.config.horizontalScanWidth}
          verticalScanAngularWidth={60}
          range={this.range}
          rangeUnit={UnitType.NMILE}
          size={this.size}
          showBearingLine={this.weatherRadarSettingManager.getSetting('wxrShowBearingLine')}
          showTiltLine={this.weatherRadarSettingManager.getSetting('wxrShowTiltLine')}
          colors={this.props.config.supportExtendedColors ? WeatherRadarUtils.extendedColors() : WeatherRadarUtils.standardColors()}
          gain={this.gain}
          isDataFailed={this.isDataFailed}
          horizontalScanPadding={this.horizontalScanPadding}
          verticalScanPadding={this.verticalScanPadding}
          verticalRangeLineExtend={30}
        >
          <div class='weather-radar-indicator weather-radar-indicator-mode'>{this.modeIndicatorText}</div>
          {this.renderColorScale()}
          {this.renderInfoBox()}
          <div class={{ 'weather-radar-banner': true, 'hidden': this.bannerHidden }}>{this.bannerText}</div>
        </WeatherRadar>
      </div>
    );
  }

  /**
   * Renders this pane's color scale.
   * @returns This pane's color scale, as a VNode.
   */
  private renderColorScale(): VNode {
    return (
      <div class={{ 'weather-radar-indicator': true, 'weather-radar-indicator-scale': true, 'hidden': this.scaleHidden }}>
        <div class='weather-radar-indicator-scale-title'>Scale</div>
        {this.props.config.supportExtendedColors ? this.renderExtendedColors() : this.renderStandardColors()}
      </div>
    );
  }

  /**
   * Renders this pane's information box.
   * @returns This pane's information box, as a VNode.
   */
  private renderInfoBox(): VNode {
    return (
      <div class='weather-radar-indicator weather-radar-indicator-info'>
        <div class='weather-radar-indicator-info-row'>
          <div class='weather-radar-indicator-info-title'>Tilt</div>
          <div class='weather-radar-indicator-info-value'>UP 0.00°</div>
        </div>
        <div class='weather-radar-indicator-info-row'>
          <div class='weather-radar-indicator-info-title'>BRG</div>
          <div class='weather-radar-indicator-info-value'>L 0°</div>
        </div>
        <div class='weather-radar-indicator-info-row'>
          <div class='weather-radar-indicator-info-title'>Gain</div>
          <div class='weather-radar-indicator-info-value'>{this.gainText}</div>
        </div>
      </div>
    );
  }

  /**
   * Renders the standard 3-color scale bar and labels.
   * @returns The standard 3-color scale bar and labels, as a VNode.
   */
  private renderStandardColors(): VNode {
    return (
      <div class='weather-radar-indicator-scale-main weather-radar-indicator-scale-main-standard'>
        <div class='weather-radar-indicator-scale-standard-row'>
          <div class='weather-radar-indicator-scale-color' style='background: #ff0000;'></div>
          <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-heavy'>Heavy</div>
        </div>
        <div class='weather-radar-indicator-scale-standard-row'>
          <div class='weather-radar-indicator-scale-color' style='background: #ffff00;'></div>
        </div>
        <div class='weather-radar-indicator-scale-standard-row'>
          <div class='weather-radar-indicator-scale-color' style='background: #00ff00;'></div>
          <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-light'>Light</div>
        </div>
        <div class='weather-radar-indicator-scale-standard-row'>
          <div class='weather-radar-indicator-scale-color' style='background: #000000;'></div>
        </div>
      </div>
    );
  }

  /**
   * Renders the extended 16-color scale bar and labels.
   * @returns The extended 16-color scale bar and labels, as a VNode.
   */
  private renderExtendedColors(): VNode {
    return (
      <div class='weather-radar-indicator-scale-main weather-radar-indicator-scale-main-extended'>
        <div class='weather-radar-indicator-scale-extended-bar'>
          <div class='weather-radar-indicator-scale-color' style='background: #870087;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #b228c3;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #dd50ff;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #960000;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #b90000;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #dc0000;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #ff0000;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #e59200;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #eeb600;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #f6db00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #ffff00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #307a00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #249b00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #18bd00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #0cde00;'></div>
          <div class='weather-radar-indicator-scale-color' style='background: #00ff00;'></div>
          <div class='weather-radar-indicator-scale-color weather-radar-indicator-scale-color-black' style='background: #000000;'></div>
        </div>
        <div class='weather-radar-indicator-scale-extended-label-container'>
          <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-heavy'>Heavy</div>
          <div class='weather-radar-indicator-scale-label weather-radar-indicator-scale-label-light'>Light</div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.radarRef.getOrDefault()?.destroy();

    this.systemState.destroy();
    this.isScanActive.destroy();

    this.modeState.destroy();
    this.gainText.destroy();

    this.gainPipe?.destroy();

    super.destroy();
  }
}