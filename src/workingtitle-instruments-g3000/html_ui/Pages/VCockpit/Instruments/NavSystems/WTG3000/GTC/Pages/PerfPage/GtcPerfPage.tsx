import { FSComponent, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';
import { PerformanceConfig, ToldUserSettings } from '@microsoft/msfs-wtg3000-common';
import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcPerfPage.css';


/**
 * Component props for GtcPerfPage.
 */
export interface GtcPerfPageProps extends GtcViewProps {
  /** A performance calculation config object. */
  perfConfig: PerformanceConfig;

  /** Whether to include the Flap Speeds button. */
  includeFlapSpeeds: boolean;
}

/**
 * A GTC PERF page.
 */
export class GtcPerfPage extends GtcView<GtcPerfPageProps> {
  private thisNode?: VNode;

  private readonly rootCssClass = SetSubject.create(['perf-page']);

  private readonly toldDatabaseText = Subject.create('');

  private readonly isToldEnabled = Subject.create(false);

  private toldDatabaseSub?: Subscription;
  private toldEnabledPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('PERF');

    if (this.props.perfConfig.isToldSupported) {
      const toldSettingManager = ToldUserSettings.getManager(this.bus);

      this.toldDatabaseSub = toldSettingManager.getSetting('toldDatabaseVersion').sub(version => {
        if (version === '') {
          this.toldDatabaseText.set('TOLD Table Invalid');
          this.rootCssClass.add('perf-page-told-invalid');
        } else {
          this.toldDatabaseText.set(`${version} (TOLD)`);
          this.rootCssClass.delete('perf-page-told-invalid');
        }
      }, true);

      this.toldEnabledPipe = toldSettingManager.getSetting('toldEnabled').pipe(this.isToldEnabled);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        {this.props.perfConfig.isToldSupported && (
          <div class='perf-page-database gtc-panel'>
            <div class='perf-page-database-airframe'>{this.props.perfConfig.airframe}</div>
            {this.props.perfConfig.isToldSupported && (
              <div class='perf-page-database-told'>{this.toldDatabaseText}</div>
            )}
          </div>
        )}
        <div class='perf-page-buttons'>
          {this.props.perfConfig.isToldSupported && (
            <>
              <ImgTouchButton
                label='Takeoff<br>Data'
                imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_takeoff.png'
                isEnabled={this.isToldEnabled}
                onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.TakeoffData); }}
                class='gtc-directory-button'
              />
              <ImgTouchButton
                label='Landing<br>Data'
                imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_landing.png'
                isEnabled={this.isToldEnabled}
                onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.LandingData); }}
                class='gtc-directory-button'
              />
            </>
          )}
          <ImgTouchButton
            label='Speed Bugs'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_speed_bug.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.SpeedBugs); }}
            class='gtc-directory-button'
          />
          <ImgTouchButton
            label='Weight and<br>Fuel'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_weight_fuel.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.WeightAndFuel); }}
            class='gtc-directory-button'
          />
          {this.props.includeFlapSpeeds && (
            <ImgTouchButton
              label='Flap Speeds'
              imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_flap_speeds.png'
              onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.FlapSpeeds); }}
              class='gtc-directory-button'
            />
          )}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.toldDatabaseSub?.destroy();
    this.toldEnabledPipe?.destroy();

    super.destroy();
  }
}