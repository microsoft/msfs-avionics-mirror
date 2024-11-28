import { DisplayField, FmcRenderTemplate, Formatter, PageLinkField, Subject } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/** A formatter for wx request status */
class FplnRequestStatusFormat implements Formatter<boolean> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: boolean): string {
    return !value ? '' : 'REQ PENDING';
  }
}

/**
 * Route Menu page
 */
export class RouteMenuPage extends WT21FmcPage {
  public readonly isRequestPending = Subject.create(false);

  private readonly indexLink = PageLinkField.createLink(this, '<INDEX', '/index');
  private readonly pltRteListLink = PageLinkField.createLink(this, '<PILOT ROUTE LIST', '/index', true);
  private readonly diskRteListLink = PageLinkField.createLink(this, '<DISK ROUTE LIST', '/index', true);
  private readonly fplnWindLink = PageLinkField.createLink(this, '<FPLN WIND', '/index', true);
  private readonly fplnRequestStatusField = new DisplayField(this, {
    formatter: new FplnRequestStatusFormat(),
    style: '[green]',
  }).bind(this.isRequestPending);
  private readonly fplnLink = PageLinkField.createLink(this, 'FPLN>', '/route');


  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'ROUTE MENU[blue]'],
        ['', ''],
        [this.pltRteListLink, ''],
        ['', ''],
        [this.diskRteListLink, ''],
        [this.fplnRequestStatusField, ''],
        ['<FPLN RECALL[disabled]', ''],
        ['', ''],
        [this.fplnWindLink, ''],
        ['', ''],
        ['', ''],
        ['', ''],
        [this.indexLink, this.fplnLink],
      ],
    ];
  }
}


