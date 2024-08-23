import { FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * GNSS Control page
 */
export class GNSSCTLPage extends WT21FmcPage {
  private readonly IndexLink = PageLinkField.createLink(this, '<INDEX', '/index');

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'FMS1 GNSS CONTROL[blue]'],
        ['', ''],
        ['<ENABLED> GNSS1[green]', 'STATUS>'],
        ['',''],
        ['<ENABLED> GNSS2[green]', 'STATUS>'],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '4/4 ENABLED [green]'],
        ['<NPA RAIM', 'SELECT SBAS>'],
        ['',''],
        [this.IndexLink, ''],
      ],
    ];
  }
}
