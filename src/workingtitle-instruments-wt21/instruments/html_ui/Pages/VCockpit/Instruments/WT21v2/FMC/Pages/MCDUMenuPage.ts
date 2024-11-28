import { FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * MCDU Menu page
 */
export class MCDUMenuPage extends WT21FmcPage {
  private readonly Fms1Link = PageLinkField.createLink(this, '<FMS 1', '/index');

  private readonly Gps1PosLink = PageLinkField.createLink(this, 'GPS 1 POS>', '/gnss1-pos');

  /** @inheritDoc */
  public  render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'MCDU MENU[blue]'],
        ['', ''],
        [this.Fms1Link, this.Gps1PosLink],
        ['', ''],
        ['<DL', ''],
        ['', ''],
        ['<DBU', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
    ];
  }
}
