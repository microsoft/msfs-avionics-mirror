import { DisplayField, FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsChars } from '../UnsCduDisplay';


/** A UNS Data page */
export class UnsDataMaintenancePage extends UnsFmcPage {
  protected pageTitle = '  MAINT';

  private readonly SoftwareVersionLink = PageLinkField.createLink(this, '←S/W VERS', '/data/version');

  private readonly ReturnPrompt = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        ['←CONFIG[disabled]', ''],
        [''],
        ['←WAAS[disabled]', 'CLEAR LOG→[disabled]'],
        [''],
        ['←STATIC TEST[disabled]', ''],
        [''],
        ['←DYNAMIC TEST[disabled]', 'PERF VER→[disabled]'],
        [''],
        [this.SoftwareVersionLink, this.ReturnPrompt],
      ],
    ];
  }
}
