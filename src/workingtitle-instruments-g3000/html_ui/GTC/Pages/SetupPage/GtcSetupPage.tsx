import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcSetupPage.css';

/**
 * A GTC setup page.
 */
export class GtcSetupPage extends GtcView {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Setup');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='setup-page'>
        <div class='setup-page-row'>
          <GtcImgTouchButton
            label='Avionics<br>Settings'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_avionics_settings.png`}
            onPressed={(): void => { this.props.gtcService.changePageTo(GtcViewKeys.AvionicsSettings); }}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='Avionics<br>Status'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_system_status.png`}
            isEnabled={false}
            class='gtc-directory-button'
          />
          <GtcImgTouchButton
            label='SiriusXM Info'
            isEnabled={false}
            class='gtc-directory-button setup-page-sirius-button'
          />
        </div>
        <div class='setup-page-row'>
          <GtcImgTouchButton
            label='Database<br>Status'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_database.png`}
            isEnabled={false}
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
