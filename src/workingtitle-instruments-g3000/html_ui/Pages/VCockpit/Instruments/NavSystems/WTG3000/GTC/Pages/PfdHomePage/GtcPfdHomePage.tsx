import { ControlEvents, DisplayComponent, FSComponent, MappedSubject, Subject, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { ObsSuspDataProvider, ObsSuspModes } from '@microsoft/msfs-garminsdk';
import { CASControlEvents, G3000NavIndicator, NavSourceFormatter, PfdBearingPointerSource, PfdUserSettings, RadiosConfig } from '@microsoft/msfs-wtg3000-common';

import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { ValueTouchButton } from '../../Components/TouchButton/ValueTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcPfdTrafficMapButton } from './GtcPfdTrafficMapButton';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcPfdHomePage.css';

/**
 * Component props for GtcPfdHomePage.
 */
export interface GtcPfdHomePageProps extends GtcViewProps {
  /** The radios configuration object. */
  radiosConfig: RadiosConfig;

  /** The indicator for the active nav source. */
  activeNavIndicator: G3000NavIndicator;

  /** A provider of OBS/SUSP data. */
  obsSuspDataProvider: ObsSuspDataProvider;
}

/**
 * A GTC PFD home page.
 */
export class GtcPfdHomePage extends GtcView<GtcPfdHomePageProps> {
  private readonly controlPublisher = this.props.gtcService.bus.getPublisher<ControlEvents>();
  private readonly casControlPublisher = this.props.gtcService.bus.getPublisher<CASControlEvents>();
  private readonly casSub = this.props.gtcService.bus.getSubscriber<CASControlEvents>();

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex);

  private readonly activeNavValue = MappedSubject.create(
    NavSourceFormatter.createForIndicator(
      'FMS',
      false,
      this.props.radiosConfig.dmeCount > 1,
      this.props.radiosConfig.adfCount > 1,
      true
    ).bind(undefined, this.props.activeNavIndicator),
    this.props.activeNavIndicator.source,
    this.props.activeNavIndicator.isLocalizer
  );

  private readonly isObsSuspButtonEnabled = MappedSubject.create(
    ([obsMode, isObsAvailable]): boolean => {
      return obsMode !== ObsSuspModes.NONE || isObsAvailable;
    },
    this.props.obsSuspDataProvider.mode,
    this.props.obsSuspDataProvider.isObsAvailable
  );
  private readonly obsSuspButtonState = this.props.obsSuspDataProvider.mode.map(mode => mode !== ObsSuspModes.NONE);
  private readonly obsSuspButtonLabel = this.props.obsSuspDataProvider.mode.map(mode => mode === ObsSuspModes.SUSP ? 'SUSP' : 'OBS');

  private thisNode?: VNode;

  private readonly casUpEnabled = Subject.create(false);
  private readonly casDownEnabled = Subject.create(false);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.casSub.on(`cas_scroll_up_enable_${this.props.gtcService.pfdControlIndex}`).handle(v => this.casUpEnabled.set(v));
    this.casSub.on(`cas_scroll_down_enable_${this.props.gtcService.pfdControlIndex}`).handle(v => this.casDownEnabled.set(v));

    this._title.set('PFD Home');
  }

  /** @inheritdoc */
  public render(): VNode {
    const bearingPointerValueRender = NavSourceFormatter.createForBearingPointerSetting('FMS', false, this.props.radiosConfig.dmeCount > 1, this.props.radiosConfig.adfCount > 1);

    const bearingPointerPressHandler = (button: ValueTouchButton<UserSetting<PfdBearingPointerSource>>, setting: UserSetting<PfdBearingPointerSource>): void => {
      switch (setting.value) {
        case PfdBearingPointerSource.Nav1:
          setting.value = PfdBearingPointerSource.Nav2;
          break;
        case PfdBearingPointerSource.Nav2:
          setting.value = PfdBearingPointerSource.Fms1;
          break;
        case PfdBearingPointerSource.Fms1:
        case PfdBearingPointerSource.Fms2:
          setting.value = this.props.radiosConfig.adfCount > 0 ? PfdBearingPointerSource.Adf1 : PfdBearingPointerSource.None;
          break;
        case PfdBearingPointerSource.Adf1:
          setting.value = this.props.radiosConfig.adfCount > 1 ? PfdBearingPointerSource.Adf2 : PfdBearingPointerSource.None;
          break;
        case PfdBearingPointerSource.Adf2:
          setting.value = PfdBearingPointerSource.None;
          break;
        default:
          setting.value = PfdBearingPointerSource.Nav1;
      }
    };

    return (
      <div class="pfd-home">
        <div class="pfd-home-row pfd-home-top-row">
          <div class="pfd-home-top-row-column">
            <ValueTouchButton
              state={this.activeNavValue}
              label='Nav Source'
              onPressed={() => { this.controlPublisher.pub('cdi_src_switch', true, true, false); }}
              class="pfd-home-button pfd-home-active-nav-button"
            />
            <ValueTouchButton
              state={this.pfdSettingManager.getSetting('pfdBearingPointer1Source')}
              label="Bearing 1"
              renderValue={bearingPointerValueRender}
              onPressed={bearingPointerPressHandler}
              class="pfd-home-button pfd-home-bearing-ptr-button"
            >
              <svg viewBox="-10 -10 160 70" class="pfd-home-bearing-ptr-button-arrow">
                <path d="M 0 25 L 140 25 M 45 50 L 20 25 L 45 0" class="pfd-home-bearing-ptr-button-arrow-outline" />
                <path d="M 0 25 L 140 25 M 45 50 L 20 25 L 45 0" class="pfd-home-bearing-ptr-button-arrow-stroke" />
              </svg>
            </ValueTouchButton>
          </div>
          <div class="pfd-home-top-row-column">
            <ToggleTouchButton
              state={this.obsSuspButtonState}
              label={this.obsSuspButtonLabel}
              isEnabled={this.isObsSuspButtonEnabled}
              onPressed={() => {
                const obsMode = this.props.obsSuspDataProvider.mode.get();

                const isObsModeActive = obsMode === ObsSuspModes.OBS;

                if (obsMode === ObsSuspModes.SUSP) {
                  this.controlPublisher.pub('suspend_sequencing', false, true);
                } else if (isObsModeActive || this.props.obsSuspDataProvider.isObsAvailable.get()) {
                  SimVar.SetSimVarValue(`K:GPS_OBS_${isObsModeActive ? 'OFF' : 'ON'}`, 'number', 0);
                  if (isObsModeActive) {
                    this.controlPublisher.pub('suspend_sequencing', false, true);
                  }
                }
              }}
              class="pfd-home-button pfd-home-obs-susp-button"
            >
              <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_obs.png" />
            </ToggleTouchButton>
            <ValueTouchButton
              state={this.pfdSettingManager.getSetting('pfdBearingPointer2Source')}
              label="Bearing 2"
              renderValue={bearingPointerValueRender}
              onPressed={bearingPointerPressHandler}
              class="pfd-home-button pfd-home-bearing-ptr-button"
            >
              <svg viewBox="-10 -10 160 70" class="pfd-home-bearing-ptr-button-arrow">
                <path d="M 140 25 L 120 25 M 95 50 L 120 25 L 95 0 L 107.5 12.5 L 20 12.5 L 20 37.5 L 107.5 37.5 L 95 50 M 20 25 L 0 25" class="pfd-home-bearing-ptr-button-arrow-outline" />
                <path d="M 140 25 L 120 25 M 95 50 L 120 25 L 95 0 L 107.5 12.5 L 20 12.5 L 20 37.5 L 107.5 37.5 L 95 50 M 20 25 L 0 25" class="pfd-home-bearing-ptr-button-arrow-stroke" />
              </svg>
            </ValueTouchButton>
          </div>
          <div class="pfd-home-top-row-column pfd-home-cas">
            <div class="pfd-home-cas-title">Scroll CAS</div>
            <ImgTouchButton
              label="Up"
              imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_up.png"
              isEnabled={this.casUpEnabled}
              onPressed={() => {
                this.casControlPublisher.pub(`cas_scroll_up_${this.props.gtcService.pfdControlIndex}`, true, true);
              }}
              class="pfd-home-cas-button pfd-home-cas-button-up"
            />
            <div class="pfd-home-cas-button-divider" />
            <ImgTouchButton
              label="Down"
              imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_down.png"
              isEnabled={this.casDownEnabled}
              onPressed={() => {
                this.casControlPublisher.pub(`cas_scroll_down_${this.props.gtcService.pfdControlIndex}`, true, true);
              }}
              class="pfd-home-cas-button pfd-home-cas-button-down"
            />
          </div>
        </div>
        <div class="pfd-home-row">
          <ImgTouchButton
            label="Speed Bugs"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_speed_bug.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.SpeedBugs)}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Timers"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_timers.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Timer)}
            class="gtc-directory-button pfd-home-img-offset-button"
          />
          <ImgTouchButton
            label="Minimums"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_minimums.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.Minimums)}
            class="gtc-directory-button pfd-home-img-offset-button"
          />
          {
            this.props.gtcService.isHorizontal && (
              <GtcPfdTrafficMapButton
                pfdMapLayoutSettingManager={this.pfdSettingManager}
                pfdDisplayPaneSettingManager={this.props.gtcService.pfdPaneSettings}
                class='pfd-home-button'
              />
            )
          }
        </div>
        <div class="pfd-home-row">
          <ImgTouchButton
            label="PFD Map<br>Settings"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_inset_map_settings.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.PfdMapSettings)}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="Sensors"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_sensors.png"
            isEnabled={false}
            class="gtc-directory-button"
          />
          <ImgTouchButton
            label="PFD<br>Settings"
            imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_pfd_settings.png"
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.PfdSettings)}
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
        } else {
          return false;
        }
      });
    }

    this.activeNavValue.destroy();

    this.isObsSuspButtonEnabled.destroy();
    this.obsSuspButtonState.destroy();
    this.obsSuspButtonLabel.destroy();

    super.destroy();
  }
}