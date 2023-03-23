import { DisplayComponent, FSComponent, UserSetting, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys } from '@microsoft/msfs-wtg3000-common';

import { GtcDesignatedPaneButton } from '../../Components/TouchButton/GtcDesignatedPaneButton';
import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcMfdHomePage.css';

/**
 * Component props for GtcMfdHomePage.
 */
export interface GtcMfdHomePageProps extends GtcViewProps {
  /**
   * Whether the PERF page is supported. If `true`, a button to open the PERF page will be added to the bottom row. If
   * `false`, a button to open the Speed Bugs page will be added instead.
   */
  supportPerfPage: boolean;
}

/**
 * A GTC MFD home page.
 */
export class GtcMfdHomePage extends GtcView<GtcMfdHomePageProps> {
  private thisNode?: VNode;

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;
  private readonly designatedWeatherPaneKey: UserSetting<string>;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcMfdHomePageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcMfdHomePage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
    this.designatedWeatherPaneKey = this.displayPaneSettingManager.getSetting('displayPaneDesignatedWeatherView');
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('MFD Home');
  }

  /** @inheritdoc */
  render(): VNode {
    return (
      <div class="mfd-home">
        <div class="mfd-home-row">
          <GtcDesignatedPaneButton
            displayPaneSettingManager={this.displayPaneSettingManager}
            selectedPaneViewKeys={[DisplayPaneViewKeys.NavigationMap]}
            getPaneViewKeyToDesignate={() => DisplayPaneViewKeys.NavigationMap}
            label='Map'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_map.png'
            selectedLabel={'Map\nSettings'}
            selectedImgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_map_settings.png'
            onPressedSelected={() => { this.props.gtcService.changePageTo(GtcViewKeys.MapSettings); }}
            class='gtc-directory-button'
          />
          <GtcDesignatedPaneButton
            displayPaneSettingManager={this.displayPaneSettingManager}
            selectedPaneViewKeys={[DisplayPaneViewKeys.TrafficMap]}
            getPaneViewKeyToDesignate={() => DisplayPaneViewKeys.TrafficMap}
            label='Traffic'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_traffic.png'
            selectedLabel={'Traffic\nSettings'}
            selectedImgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_traffic_settings.png'
            onPressedSelected={() => { this.props.gtcService.changePageTo(GtcViewKeys.TrafficSettings); }}
            class='gtc-directory-button'
          />
          <GtcDesignatedPaneButton
            displayPaneSettingManager={this.displayPaneSettingManager}
            selectedPaneViewKeys={[DisplayPaneViewKeys.WeatherMap, DisplayPaneViewKeys.WeatherRadar]}
            getPaneViewKeyToDesignate={() => this.designatedWeatherPaneKey.value}
            label='Weather'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_weather.png'
            selectedLabel={'Weather\nSelection'}
            selectedImgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_weather_settings.png'
            onPressedSelected={() => { this.props.gtcService.changePageTo(GtcViewKeys.WeatherSelection); }}
            class='gtc-directory-button'
          />
          <ImgTouchButton
            label="TAWS"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_terrain.png"
            isEnabled={false}
            class="gtc-directory-button"
          />
        </div>
        <div class="mfd-home-row">
          <ImgTouchButton
            label="Direct To"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_direct_to.png"
            onPressed={() => this.props.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo).ref.setWaypoint({})}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Flight Plan"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_fplan.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.FlightPlan)}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="PROC"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_procedures.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Procedures)}
            class="gtc-directory-button mfd-home-img-offset-button"
          />
          <ImgTouchButton
            label="Charts"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_charts.png"
            isEnabled={false}
            class="gtc-directory-button"
          />
        </div>
        <div class="mfd-home-row">
          <ImgTouchButton
            label="Aircraft<br>Systems"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_systems_prop.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.AircraftSystems)}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Music"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_music.png"
            isEnabled={false}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Utilities"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_utilities.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Utilities)}
            class="gtc-directory-button mfd-home-img-offset-button"
          />
        </div>
        <div class="mfd-home-row">
          {
            this.props.supportPerfPage
              ? (
                <ImgTouchButton
                  label="PERF"
                  imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_performance.png"
                  onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Perf)}
                  class="gtc-directory-button"
                />
              ) : (
                <ImgTouchButton
                  label="Speed Bugs"
                  imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_speed_bug.png"
                  onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.SpeedBugs)}
                  class="gtc-directory-button"
                />
              )
          }
          <ImgTouchButton
            label="Waypoint<br>Info"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_waypoint_info.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.WaypointInfo)}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Nearest"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_nearest.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Nearest)}
            class="gtc-directory-button"
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.thisNode !== undefined) {
      FSComponent.visitNodes(this.thisNode, node => {
        if (node !== this.thisNode && node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });
    }

    super.destroy();
  }
}