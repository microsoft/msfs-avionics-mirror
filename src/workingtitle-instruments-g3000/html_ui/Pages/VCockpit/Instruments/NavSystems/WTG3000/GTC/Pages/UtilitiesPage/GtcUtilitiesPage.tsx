import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { MinimumsDataProvider, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys } from '@microsoft/msfs-wtg3000-common';

import { GtcMinimumsTouchButton } from '../../Components/Minimums/GtcMinimumsTouchButton';
import { GtcDesignatedPaneButton } from '../../Components/TouchButton/GtcDesignatedPaneButton';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcUtilitiesMinimumsPopup } from './GtcUtilitiesMinimumsPopup';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcUtilitiesPage.css';

/**
 * Component props for GtcUtilitiesPage.
 */
export interface GtcUtilitiesPageProps extends GtcViewProps {
  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * GTC view keys for popups owned by the utilities page.
 */
enum GtcUtilitiesPagePopupKeys {
  Minimums = 'UtilitiesMinimums'
}

/**
 * A GTC utilities page.
 */
export class GtcUtilitiesPage extends GtcView<GtcUtilitiesPageProps> {
  private thisNode?: VNode;

  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;

  /**
   * Creates an instance of the GTC Utilities Page.
   * @param props The props for this page.
   */
  constructor(props: GtcUtilitiesPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('LongitudeSystemsPage: display pane index was not defined');
    }

    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.props.displayPaneIndex);
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Utilities');

    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcUtilitiesPagePopupKeys.Minimums, 'MFD', this.renderMinimumsPopup.bind(this), this.props.displayPaneIndex);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='utilities-page'>
        <div class='utilities-page-row'>
          <GtcImgTouchButton
            label='Weight and<br>Fuel'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_weight_fuel.png'
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.WeightAndFuel)}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Trip<br>Planning'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_trip_planning.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
        </div>
        <div class='utilities-page-row'>
          <GtcMinimumsTouchButton
            minimumsMode={this.props.minimumsDataProvider.mode}
            minimumsValue={this.props.minimumsDataProvider.minimums}
            displayUnit={UnitsUserSettings.getManager(this.bus).altitudeUnits}
            onPressed={() => { this.props.gtcService.openPopup(GtcUtilitiesPagePopupKeys.Minimums, 'normal', 'hide'); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Trip Stats'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_stats_small.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Timer'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_timers.png'
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Timer)}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Scheduled<br>Messages'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_scheduled_messages.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
        </div>
        <div class='utilities-page-row'>
          <GtcDesignatedPaneButton
            displayPaneSettingManager={this.displayPaneSettingManager}
            selectedPaneViewKeys={[DisplayPaneViewKeys.Gps1Status]}
            getPaneViewKeyToDesignate={() => DisplayPaneViewKeys.Gps1Status}
            label='GPS Status'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_gps_status_white.png'
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Initialization'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_status.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
        </div>
        <div class='utilities-page-row'>
          <GtcImgTouchButton
            label='Screen<br>Cleaning'
            imgSrc={`coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_screen_cleaning_${this.props.gtcService.orientation}.png`}
            isEnabled={false}
            class='gtc-directory-button utilities-page-screen-cleaning-button'
          />
          <GtcImgTouchButton
            label='Crew Profile'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_pilot.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Setup'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_aux.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.Setup); }}
            class='gtc-directory-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this page's minimums popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's minimums popup, as a VNode.
   */
  private renderMinimumsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcUtilitiesMinimumsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        minimumsDataProvider={this.props.minimumsDataProvider}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}