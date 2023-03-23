import { ICAO, UserFacility } from '@microsoft/msfs-sdk';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * PILOT WPT LIST page
 */
export class PilotWptListPage extends FmcPage {
  private readonly DataBaseLink = PageLinkField.createLink(this, '<DATA BASE', '/database');
  private readonly ReturnLink = PageLinkField.createLink(this, 'RETURN>', '/database');

  private shownFacilities: UserFacility[] = [];

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    const userFacilities = this.fms.getUserFacilities();

    this.shownFacilities = userFacilities;

    const numPages = Math.ceil(userFacilities.length / 4);

    const pages = [];

    for (let i = 0; i < numPages; i++) {
      const start = i * 4;

      pages.push(
        [
          ['', this.PagingIndicator, 'PILOT WPT LISt[blue]'],
          [''],
          [ICAO.getIdent(userFacilities[start + 0]?.icao ?? '')],
          [''],
          [ICAO.getIdent(userFacilities[start + 1]?.icao ?? '')],
          [''],
          [ICAO.getIdent(userFacilities[start + 2]?.icao ?? '')],
          [''],
          [ICAO.getIdent(userFacilities[start + 3]?.icao ?? '')],
          ['', 'WPT TRANSFER[disabled] '],
          ['', 'FROM XSIDE>[disabled]'],
          ['', '', '------------------------[blue]'],
          [this.DataBaseLink, this.ReturnLink],
        ]
      );
    }

    if (numPages === 0) {
      pages.push(
        [
          ['', this.PagingIndicator, 'PILOT WPT LISt[blue]'],
          [''],
          [''],
          [''],
          [''],
          [''],
          [''],
          [''],
          [''],
          ['', 'WPT TRANSFER[disabled] '],
          ['', 'FROM XSIDE>[disabled]'],
          ['', '', '------------------------[blue]'],
          [this.DataBaseLink, this.ReturnLink],
        ]
      );
    }

    return pages;
  }

  /** @inheritDoc */
  async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean | string> {
    const start = (this.router.currentSubpageIndex.get() - 1) * 4;

    let icao;
    switch (event) {
      case FmcSelectKeysEvent.LSK_1:
        icao = this.shownFacilities?.[start + 0]?.icao;
        break;
      case FmcSelectKeysEvent.LSK_2:
        icao = this.shownFacilities?.[start + 1]?.icao;
        break;
      case FmcSelectKeysEvent.LSK_3:
        icao = this.shownFacilities?.[start + 2]?.icao;
        break;
      case FmcSelectKeysEvent.LSK_4: {
        icao = this.shownFacilities?.[start + 3]?.icao;
        break;
      }
    }

    if (icao) {
      return ICAO.getIdent(icao);
    }

    return false;
  }
}
