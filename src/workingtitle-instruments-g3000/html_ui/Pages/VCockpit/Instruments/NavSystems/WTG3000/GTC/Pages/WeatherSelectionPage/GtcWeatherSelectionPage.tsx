import { FSComponent, UserSetting, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys } from '@microsoft/msfs-wtg3000-common';

import { GtcDesignatedPaneButton } from '../../Components/TouchButton/GtcDesignatedPaneButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcWeatherSelectionPage.css';

/**
 * Component props for GtcWeatherSelectionPage.
 */
export interface GtcWeatherSelectionPageProps extends GtcViewProps {
  /** Whether the airplane has a weather radar. */
  hasWeatherRadar: boolean;
}

/**
 * A GTC weather selection page.
 */
export class GtcWeatherSelectionPage extends GtcView<GtcWeatherSelectionPageProps> {
  private thisNode?: VNode;

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;
  private readonly displayPaneSetting: UserSetting<string>;
  private readonly designatedPaneSetting: UserSetting<string>;
  private readonly designatedWeatherPaneSetting: UserSetting<string>;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcWeatherSelectionPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcWeatherSelectionPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
    this.displayPaneSetting = this.displayPaneSettingManager.getSetting('displayPaneView');
    this.designatedPaneSetting = this.displayPaneSettingManager.getSetting('displayPaneDesignatedView');
    this.designatedWeatherPaneSetting = this.displayPaneSettingManager.getSetting('displayPaneDesignatedWeatherView');
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Weather Selection');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='weather-selection'>
        <GtcDesignatedPaneButton
          displayPaneSettingManager={this.displayPaneSettingManager}
          selectedPaneViewKeys={[DisplayPaneViewKeys.WeatherMap]}
          label={'Connext\nWeather'}
          imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_gfds.png'
          selectedLabel={'Connext\nSettings'}
          selectedImgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_gfds_settings.png'
          onPressed={isSelected => {
            if (isSelected) {
              this.props.gtcService.changePageTo(GtcViewKeys.ConnextWeatherSettings);
            } else {
              this.designatedWeatherPaneSetting.value = DisplayPaneViewKeys.WeatherMap;
              this.designatedPaneSetting.value = DisplayPaneViewKeys.WeatherMap;
              this.displayPaneSetting.value = DisplayPaneViewKeys.WeatherMap;
            }
          }}
          class='gtc-directory-button'
        />
        {
          this.props.hasWeatherRadar && (
            <GtcDesignatedPaneButton
              displayPaneSettingManager={this.displayPaneSettingManager}
              selectedPaneViewKeys={[DisplayPaneViewKeys.WeatherRadar]}
              label={'WX RADAR'}
              imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_wx_radar.png'
              selectedLabel={'WX RADAR\nSettings'}
              selectedImgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_wx_radr_settings.png'
              onPressed={isSelected => {
                if (isSelected) {
                  this.props.gtcService.changePageTo(GtcViewKeys.WeatherRadarSettings);
                } else {
                  this.designatedWeatherPaneSetting.value = DisplayPaneViewKeys.WeatherRadar;
                  this.designatedPaneSetting.value = DisplayPaneViewKeys.WeatherRadar;
                  this.displayPaneSetting.value = DisplayPaneViewKeys.WeatherRadar;
                }
              }}
              class='gtc-directory-button'
            />
          )
        }
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}