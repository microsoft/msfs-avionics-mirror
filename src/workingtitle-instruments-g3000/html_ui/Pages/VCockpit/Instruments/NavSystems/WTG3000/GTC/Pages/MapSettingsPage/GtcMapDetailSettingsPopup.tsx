import { FSComponent, Subject, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { MapDeclutterSettingMode } from '@microsoft/msfs-garminsdk';
import { G3000MapUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcSliderThumbIcon } from '../../Components/TouchSlider/GtcSliderThumbIcon';
import { TouchSlider } from '../../Components/TouchSlider/TouchSlider';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcMapDetailSettingsPopup.css';

/**
 * Component props for GtcMapDetailSettingsPopup.
 */
export interface GtcMapDetailSettingsPopupProps extends GtcViewProps {
  /** A manager for map user settings used to retrieve the popup's displayed setting values. */
  mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;

  /**
   * A function which writes selected setting values. If not defined, selected values will be written to settings
   * retrieved from `mapReadSettingManager`.
   */
  writeToSetting?: <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>) => void;
}

/**
 * A GTC map detail settings popup.
 */
export class GtcMapDetailSettingsPopup extends GtcView<GtcMapDetailSettingsPopupProps> {
  private readonly incButtonRef = FSComponent.createRef<TouchButton>();
  private readonly decButtonRef = FSComponent.createRef<TouchButton>();
  private readonly sliderRef = FSComponent.createRef<TouchSlider<Subject<number>>>();

  private readonly setting = this.props.mapReadSettingManager.getSetting('mapDeclutter');

  private readonly sliderState = Subject.create(0);

  private readonly sliderStops: Record<MapDeclutterSettingMode, number> = {
    [MapDeclutterSettingMode.All]: 1,
    [MapDeclutterSettingMode.Level3]: 2 / 3,
    [MapDeclutterSettingMode.Level2]: 1 / 3,
    [MapDeclutterSettingMode.Level1]: 0
  };

  private settingToSliderPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Map Detail Settings');

    this.settingToSliderPipe = this.setting.pipe(this.sliderState, mode => this.sliderStops[mode]);

    this.sliderState.sub(value => {
      let modeToWrite: MapDeclutterSettingMode | undefined = undefined;

      for (const mode in this.sliderStops) {
        if (this.sliderStops[mode as MapDeclutterSettingMode] === value) {
          modeToWrite = mode as MapDeclutterSettingMode;
          break;
        }
      }

      if (modeToWrite !== this.setting.value && modeToWrite !== undefined) {
        this.writeToSetting(modeToWrite);
      }
    });
  }

  /**
   * Writes a value to the map declutter setting.
   * @param value The value to write.
   */
  private writeToSetting(value: MapDeclutterSettingMode): void {
    if (this.props.writeToSetting === undefined) {
      this.setting.value = value;
    } else {
      this.props.writeToSetting('mapDeclutter', value);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-settings-popup map-detail-settings'>
        <TouchButton
          ref={this.incButtonRef}
          onPressed={(): void => {
            switch (this.setting.value) {
              case MapDeclutterSettingMode.Level1:
                this.writeToSetting(MapDeclutterSettingMode.Level2);
                break;
              case MapDeclutterSettingMode.Level2:
                this.writeToSetting(MapDeclutterSettingMode.Level3);
                break;
              case MapDeclutterSettingMode.Level3:
                this.writeToSetting(MapDeclutterSettingMode.All);
                break;
            }
          }}
          class='map-detail-settings-button'
        >
          <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_volume_plus_up.png' />
        </TouchButton>
        <TouchSlider
          ref={this.sliderRef}
          bus={this.bus}
          orientation='to-top'
          state={this.sliderState}
          stops={Object.values(this.sliderStops)}
          foreground={
            <>
              <div class='map-detail-settings-slider-gradient-stop-container'>
                <div class='map-detail-settings-slider-gradient-stop' />
                <div class='map-detail-settings-slider-gradient-stop' />
              </div>
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='map-detail-settings-slider-gradient-occlude'>
                <path d='M 0 0 L 0 1 L 1 1 Z' />
              </svg>
            </>
          }
          thumb={<GtcSliderThumbIcon sliderOrientation='vertical' />}
          snapAnimationSpeed={0.25}
          lockFocusOnDrag
          dragLockFocusThresholdPx={this.props.gtcService.orientation === 'horizontal' ? 10 : 5}
          class='map-detail-settings-slider'
        >
          <div class='map-detail-settings-slider-most'>Most</div>
          <div class='map-detail-settings-slider-least'>Least</div>
        </TouchSlider>
        <TouchButton
          ref={this.decButtonRef}
          onPressed={(): void => {
            switch (this.setting.value) {
              case MapDeclutterSettingMode.All:
                this.writeToSetting(MapDeclutterSettingMode.Level3);
                break;
              case MapDeclutterSettingMode.Level3:
                this.writeToSetting(MapDeclutterSettingMode.Level2);
                break;
              case MapDeclutterSettingMode.Level2:
                this.writeToSetting(MapDeclutterSettingMode.Level1);
                break;
            }
          }}
          class='map-detail-settings-button'
        >
          <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_volume_minus_down.png' />
        </TouchButton>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.incButtonRef.getOrDefault()?.destroy();
    this.decButtonRef.getOrDefault()?.destroy();
    this.sliderRef.getOrDefault()?.destroy();

    this.settingToSliderPipe?.destroy();

    super.destroy();
  }
}