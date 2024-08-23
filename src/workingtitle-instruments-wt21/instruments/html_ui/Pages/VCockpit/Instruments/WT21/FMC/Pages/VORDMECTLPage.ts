import { FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * VORDME Control page
 */
export class VORDMECTLPage extends WT21FmcPage {
  private readonly IndexLink = PageLinkField.createLink(this, '<INDEX', '/index');

  /** @inheritDoc */
  public  render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'FMS1 VOR/DME CONTROL[blue]'],
        ['', ''],
        ['---', '---'],
        ['', '','NAVAID INHIBIT[blue]'],
        ['---', '---'],
        ['', ''],
        ['---', '---'],
        ['', ''],
        ['---', '---'],
        [' VOR USAGE[blue]', 'DME USAGE [blue]'],
        ['YES/[white s-text]NO[green d-text]', 'YES/[green d-text]NO[white s-text]'],
        ['','','------------------------[blue]'],
        [this.IndexLink,''],
      ],
    ];
  }
}
