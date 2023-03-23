import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcNearestDirectoryPage.css';

/**
 * A GTC nearest directory page.
 */
export class GtcNearestDirectoryPage extends GtcView {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Nearest');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nearest-directory-page'>
        <div class='nearest-directory-page-row'>
          <GtcImgTouchButton
            label='Airport'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_airport.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestAirport); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='INT'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_intersection.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestIntersection); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='VOR'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_vor.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestVor); }}
            class='gtc-directory-button'
          />
        </div>
        <div class='nearest-directory-page-row'>
          <GtcImgTouchButton
            label='NDB'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_ndb.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestNdb); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='User'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_user.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestUserWaypoint); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Airspace'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_airspace.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
        </div>
        <div class='nearest-directory-page-row'>
          <GtcImgTouchButton
            label='ARTCC'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_artcc.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='FSS'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_fss_freq.png'
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Weather'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_weather_freq.png'
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.NearestWeather); }}
            class='gtc-directory-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}