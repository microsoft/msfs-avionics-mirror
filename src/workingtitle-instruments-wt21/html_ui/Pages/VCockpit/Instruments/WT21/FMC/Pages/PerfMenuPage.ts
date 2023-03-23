import { FmcUserSettings } from '../FmcUserSettings';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { SwitchLabel } from '../Framework/Components/SwitchLabel';
import { DataInterface } from '../Framework/FmcDataBinding';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * Perf Menu page
 */
export class PerfMenuPage extends FmcPage {

  private readonly fmcSettings = FmcUserSettings.getManager(this.eventBus);

  private readonly perfInitLink = PageLinkField.createLink(this, '<PERF INIT', '/perf-init');
  private readonly vnavSetupLink = PageLinkField.createLink(this, '<VNAV SETUP', '/vnav-setup');
  private readonly takeoffRefLink = PageLinkField.createLink(this, '<TAKEOFF', '/takeoff-ref');

  private readonly fuelMgmtLink = PageLinkField.createLink(this, 'FUEL MGMT>', '/fuel-mgmt');
  private readonly fltLogLink = PageLinkField.createLink(this, 'FLT LOG>', '/flt-log');
  private readonly approachRefLink = PageLinkField.createLink(this, 'APPROACH>', '/appr-ref');

  private readonly advisoryVnavSetting = this.fmcSettings.getSetting('advisoryVnavEnabled');
  private readonly mappedAdvisoryVnavSetting = this.advisoryVnavSetting.map(v => v === true ? 0 : 1);
  private readonly advisoryVnavSwitch = new SwitchLabel(this, {
    optionStrings: ['ENABLE', 'DISABLE'],
    activeStyle: 'green'
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
        [this.takeoffRefLink, this.approachRefLink],
        ['', ''],
        ['', ''],
        [' ADVISORY VNAV[blue]', ''],
        [this.advisoryVnavSwitch, ''],
        ['', ''],
        ['', '']
        // [' VNAV PLAN SPD[blue]', ''],
        // ['         ---KT[disabled]', '']
      ]
    ];
  }
}
