import { FmcPageLifecyclePolicy, FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { FmcCmuCommons } from '../Datalink/FmcCmuCommons';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * DataLink Menu page
 */
export class DataLinkMenuPage extends WT21FmcPage {
  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  private readonly indexLink = PageLinkField.createLink(this, '<RETURN', '/index');
  private readonly weatherLink = PageLinkField.createLink(this, '<WEATHER', '/dl-weather');
  private readonly vhfProgField = FmcCmuCommons.createVhfProgField(this);
  private readonly clockField = FmcCmuCommons.createClockField(this, this.bus);
  private readonly termWxLink = FmcCmuCommons.createTermWxLink(this);

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['DL  DATALINK[blue]', '1/1 [blue]'],
        ['', ''],
        ['<RCVD MSGS[disabled]', 'ATS LOG>[disabled]'],
        ['', ''],
        ['<SEND MSGS[disabled]', 'DEPART CLX>[disabled]'],
        ['', ''],
        [this.weatherLink, 'OCEANIC CLX>[disabled]'],
        ['', ''],
        ['<TWIP[disabled]', ''],
        ['', ''],
        ['<ATIS[disabled]', ''],
        ['', '', this.vhfProgField],
        [this.indexLink, this.termWxLink, this.clockField],
      ],
    ];
  }
}
