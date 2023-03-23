import { PageLinkField } from '../Framework/Components/PageLinkField';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * DATABASE Page
 */
export class DatabasePage extends FmcPage {

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
