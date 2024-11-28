import { DataInterface, FmcRenderTemplate, PageLinkField, SwitchLabel } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';
import { WT21NavigationUserSettings } from '@microsoft/msfs-wt21-shared';

/**
 * Perf Menu page
 */
export class PerfMenuPage extends WT21FmcPage {

  private readonly navUserSettings = WT21NavigationUserSettings.getManager(this.bus);

  private readonly perfInitLink = PageLinkField.createLink(this, '<PERF INIT', '/perf-init');
  private readonly vnavSetupLink = PageLinkField.createLink(this, '<VNAV SETUP', '/vnav-setup');

  private readonly fuelMgmtLink = PageLinkField.createLink(this, 'FUEL MGMT>', '/fuel-mgmt');
  private readonly fltLogLink = PageLinkField.createLink(this, 'FLT LOG>', '/flt-log');

  private readonly advisoryVnavSetting = this.navUserSettings.getSetting('advisoryVnavEnabled');
  private readonly mappedAdvisoryVnavSetting = this.advisoryVnavSetting.map(v => v === true ? 0 : 1);
  private readonly advisoryVnavSwitch = new SwitchLabel(this, {
    optionStrings: ['ENABLE', 'DISABLE'],
    activeStyle: 'green',
  }).bindSource(new DataInterface(this.mappedAdvisoryVnavSetting, (v: number) => { this.advisoryVnavSetting.value = v === 0; }));

  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'PERF MENU[blue]'],
        ['', ''],
        [this.perfInitLink, this.fuelMgmtLink],
        ['', ''],
        [this.vnavSetupLink, this.fltLogLink],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        [' ADVISORY VNAV[blue]', ''],
        [this.advisoryVnavSwitch, ''],
        ['', ''],
        ['', ''],
        // [' VNAV PLAN SPD[blue]', ''],
        // ['         ---KT[disabled]', '']
      ],
    ];
  }
}
