import { FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/** Index Page */
export class IndexPage extends WT21FmcPage {

  // left side
  private readonly mcduMenuLink = PageLinkField.createLink(this, '<MCDU MENU', '/mcdu-menu', true);
  private readonly dataLinkLink = PageLinkField.createLink(this, '<DATALINK', '/datalink-menu', false);
  private readonly statusLink = PageLinkField.createLink(this, '<STATUS', '/status');
  private readonly posInitLink = PageLinkField.createLink(this, '<POS INIT', '/pos-init');
  private readonly vorDmeCtlLink = PageLinkField.createLink(this, '<VORDME CTL', '/vor-dme-ctl', true);
  private readonly gnssCtlLink = PageLinkField.createLink(this, '<GNSS CTL', '/gnss-ctl', true);

  // right side
  private readonly gnss1PosLink = PageLinkField.createLink(this, 'GNSS1 POS>', '/gnss1-pos', true);
  private readonly frequencyLink = PageLinkField.createLink(this, 'FREQUENCY>', '/freq');
  private readonly fixLink = PageLinkField.createLink(this, 'FIX>', '/fix');
  private readonly holdLink = PageLinkField.createLink(this, 'HOLD>', '/hold-list');
  private readonly progLink = PageLinkField.createLink(this, 'PROG>', '/prog');
  private readonly secFplnLink = PageLinkField.createLink(this, 'SEC FPLN>', '/sec-fpln', true);

  // page 2 left side
  private readonly fmsCtlLink = PageLinkField.createLink(this, '<FMS CTL', '/fms-ctl', true);

  // page 2 right side
  private readonly routeMenuLink = PageLinkField.createLink(this, 'ROUTE MENU>', '/route-menu');
  private readonly databaseLink = PageLinkField.createLink(this, 'DATA BASE>', '/database');
  private readonly diskOpsLink = PageLinkField.createLink(this, 'DB DISK OPS>', '/db-disk-ops', true);
  private readonly defaultsLink = PageLinkField.createLink(this, 'DEFAULTS>', '/defaults');
  private readonly arrDataLink = PageLinkField.createLink(this, 'ARR DATA>', '/arr-data', true);
  // private readonly tempCompLink = PageLinkField.createLink(this, 'TEMP COMP>', '/temp-comp', true);
  private readonly userSetLink = PageLinkField.createLink(this, 'SETTINGS>', '/user-set');

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '1/2 [blue]', 'INDEX[blue]'],
        ['', ''],
        [this.dataLinkLink, this.frequencyLink],
        ['', ''],
        [this.statusLink, this.fixLink],
        ['', ''],
        [this.posInitLink, this.holdLink],
        [' FMS1', ''],
        [this.vorDmeCtlLink, this.progLink],
        [' FMS1', ''],
        [this.gnssCtlLink, this.secFplnLink],
        ['', ''],
        [this.fmsCtlLink, this.routeMenuLink],
        ['', ''],
      ],
      [
        ['', '2/2 [blue]', 'INDEX[blue]'],
        ['', ''],
        ['', this.databaseLink],
        ['', ''],
        ['', this.diskOpsLink],
        ['', ''],
        ['', this.defaultsLink],
        ['', ''],
        ['', this.arrDataLink],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', this.userSetLink],
        ['', ''],
      ],
    ];
  }
}
