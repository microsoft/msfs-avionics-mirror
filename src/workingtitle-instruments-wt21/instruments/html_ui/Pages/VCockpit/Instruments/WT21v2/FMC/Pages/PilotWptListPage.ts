import { FmcRenderTemplate, ICAO, LineSelectKeyEvent, PageLinkField, UserFacility } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * PILOT WPT LIST page
 */
export class PilotWptListPage extends WT21FmcPage {
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
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    const start = (this.screen.currentSubpageIndex.get() - 1) * 4;

    if (event.col !== 0) {
      return false;
    }

    let icao;
    switch (event.row) {
      case (1 * 2):
        icao = this.shownFacilities?.[start + 0]?.icao;
        break;
      case (2 * 2):
        icao = this.shownFacilities?.[start + 1]?.icao;
        break;
      case (3 * 2):
        icao = this.shownFacilities?.[start + 2]?.icao;
        break;
      case (4 * 2): {
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
