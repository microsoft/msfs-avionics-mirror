import { FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * DATABASE Page
 */
export class DatabasePage extends WT21FmcPage {
  private readonly WptListLink = PageLinkField.createLink(this, 'WPT LIST>', '/pilot-wpt-list');
  private readonly IndexLink = PageLinkField.createLink(this, '<INDEX', '/index');
  private readonly DefineWptLink = PageLinkField.createLink(this, 'DEFINE WPT>', '/define-pilot-wpt');

  /** @inheritDoc */
  public  render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'DATA BASE[blue]'],
        [' IDENT[blue]', ''],
        ['□□□□□', ''],
        [' LOCATION'],
        [''],
        [''],
        [''],
        [''],
        [''],
        ['---------PILOT---------[blue]'],
        ['',               this.WptListLink],
        [''],
        [this.IndexLink, this.DefineWptLink],
      ]
    ];
  }
}
