import { FmcRenderTemplate } from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * GNSS1 POS page
 */
export class GNSS1POSPage extends WT21FmcPage {
  /** @inheritDoc */
  public  render(): FmcRenderTemplate[] {
    return [
      [
        ['--:--[yellow]', '--/--/--[yellow]', 'GPS 1[blue]'],
        ['', ''],
        [' LATITUDE[s-text]', 'LONGITUDE[s-text]'],
        ['---°--.--[yellow]','----°--.--[yellow]'],
        ['',''],
        ['   TRACK ANGLE', '---°TRUE [yellow]'],
        ['  GROUND SPEED[s-text]', '-----[yellow]'],
        ['', ''],
        ['    RAIM LIMIT[s-text]', '-.-- NM [yellow]'],
        ['PROBABLE ERROR', '-.-- NM [yellow]'],
        [' GPS MODE: [s-text]', 'ACQUISITION[green]'],
        ['SATELLITES: ','0       [green]'],
      ],
    ];
  }
}
