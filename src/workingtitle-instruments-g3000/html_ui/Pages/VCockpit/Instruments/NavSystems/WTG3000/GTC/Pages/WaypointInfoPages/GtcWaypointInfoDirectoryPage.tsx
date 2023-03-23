import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcUserWaypointDialog } from '../../Dialog/GtcUserWaypointDialog';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcAirportInfoPage } from './GtcAirportInfoPage';
import { GtcIntersectionInfoPage } from './GtcIntersectionInfoPage';
import { GtcNdbInfoPage } from './GtcNdbInfoPage';
import { GtcUserWaypointInfoPage } from './GtcUserWaypointInfoPage';
import { GtcVorInfoPage } from './GtcVorInfoPage';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcWaypointInfoDirectoryPage.css';

/**
 * A GTC waypoint info directory page.
 */
export class GtcWaypointInfoDirectoryPage extends GtcView {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Waypoint Info');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wpt-info-directory-page'>
        <div class='wpt-info-directory-page-row'>
          <GtcImgTouchButton
            label='Airport'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_airport.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcAirportInfoPage>(GtcViewKeys.AirportInfo).ref.initSelection(); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='INT'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_intersection.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcIntersectionInfoPage>(GtcViewKeys.IntersectionInfo).ref.initSelection(); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='VOR'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_vor.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcVorInfoPage>(GtcViewKeys.VorInfo).ref.initSelection(); }}
            class='gtc-directory-button'
          />
        </div>
        <div class='wpt-info-directory-page-row'>
          <GtcImgTouchButton
            label='NDB'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_ndb.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcNdbInfoPage>(GtcViewKeys.NdbInfo).ref.initSelection(); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='User<br>Waypoint'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_user.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcUserWaypointInfoPage>(GtcViewKeys.UserWaypointInfo).ref.initSelection(); }}
            class='gtc-directory-button'
          />
        </div>
        <div class='wpt-info-directory-page-row'>
          <GtcImgTouchButton
            label='Create<br>Waypoint'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_new_user.png'
            onPressed={(): void => { this.props.gtcService.changePageTo<GtcUserWaypointDialog>(GtcViewKeys.UserWaypointDialog).ref.request({}); }}
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