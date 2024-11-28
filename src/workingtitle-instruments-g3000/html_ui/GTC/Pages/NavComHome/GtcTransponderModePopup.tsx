import { GtcView } from '../../GtcService/GtcView';
import { FSComponent, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';
import { TrafficUserSettings } from '@microsoft/msfs-garminsdk';
import { XpdrTcasSettingsGroup } from '../../Components/Xpdr/XpdrTcasSettingsGroup';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';

import './GtcTransponderModePopup.css';

/**
 * A GTC Transponder Mode popup.
 */
export class GtcTransponderModePopup extends GtcView {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Transponder');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-nav-com-popup transponder-mode-popup'>
        <XpdrTcasSettingsGroup
          bus={this.props.gtcService.bus}
          trafficSettingManager={TrafficUserSettings.getManager(this.bus)}
          longAltReportingLabel={true}
        />
        <GtcValueTouchButton
          class='active-xpdr-button'
          label='Active'
          state={Subject.create('XPDR1')}
          isEnabled={false}
        />
        <GtcValueTouchButton
          class='flight-id-button'
          label='Flight ID'
          state={Subject.create(SimVar.GetSimVarValue('ATC ID', SimVarValueType.String))}
          isEnabled={false}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}