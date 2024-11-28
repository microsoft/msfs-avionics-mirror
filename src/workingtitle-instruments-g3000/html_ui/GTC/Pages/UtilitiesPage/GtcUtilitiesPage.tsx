import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { MinimumsDataProvider, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys,
  G3000FilePaths
} from '@microsoft/msfs-wtg3000-common';

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
  /** The general avionics configuration object. */
  config: AvionicsConfig;

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
    const renderWeightButton
      = !this.props.config.vnav.advanced
      && !this.props.config.performance.isSurfaceWatchSupported
      && !this.props.config.performance.isToldSupported;

    return (
      <div class='utilities-page'>
        <div class='utilities-page-row'>
          {renderWeightButton && (
            <GtcImgTouchButton
              label={this.props.config.performance.isWeightBalanceSupported ? 'Weight and\nBalance' : 'Weight and\nFuel'}
              imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/${this.props.config.performance.isWeightBalanceSupported ? 'icon_weight_balance' : 'icon_weight_fuel'}.png`}
              onPressed={(): void => {
                this.props.gtcService.changePageTo(
                  this.props.config.performance.isWeightBalanceSupported
                    ? GtcViewKeys.WeightAndBalance
                    : GtcViewKeys.WeightAndFuel
                );
              }}
              class='gtc-directory-button'
            />
          )}
          <GtcImgTouchButton
            label='Trip<br>Planning'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_trip_planning.png`}
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
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_stats_small.png`}
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Timer'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_timers.png`}
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Timer)}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Scheduled<br>Messages'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_scheduled_messages.png`}
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
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_gps_status_white.png`}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Initialization'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_status.png`}
            isEnabled={this.props.gtcService.initializationDataProvider.isEnabled}
            onPressed={() => { this.props.gtcService.changePageTo(GtcViewKeys.Initialization); }}
            class='gtc-directory-button'
          />
        </div>
        <div class='utilities-page-row'>
          <GtcImgTouchButton
            label='Screen<br>Cleaning'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_screen_cleaning_${this.props.gtcService.orientation}.png`}
            isEnabled={false}
            class='gtc-directory-button utilities-page-screen-cleaning-button'
          />
          <GtcImgTouchButton
            label='Crew Profile'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pilot.png`}
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Setup'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_aux.png`}
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
