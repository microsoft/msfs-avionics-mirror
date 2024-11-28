import { FmcRenderTemplate } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';

/** A UNS VnavPath page */
export class UnsVnavPathPage extends UnsFmcPage {
   protected pageTitle = ' VNAV PATH';

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        ['', '', 'NOT AVAILABLE[d-text cyan]']
      ]
      // [
      //   ['', '', 'VNAV PATH 1/2'],
      //   ['   TO[s-text] TOD 16.9[d-text]', 'TGT V/S'],
      //   ['FR[s-text] PPOS[d-text]', '-2200'],
      //   ['    42.6      -1247', `3.1${StringUtils.DEGREE}`],
      //   ['TO[s-text] CHUCK  -5 @FL230[d-text]'],
      //   ['              -2391', 'CNCL'],
      //   ['NX[s-text] BTG   -20 @18000[d-text]', 'VNV→'],
      //   ['              -4084'],
      //   ['   BTG       @ 4000'],
      //   ['                  0'],
      //   ['   -----     @-----', 'VTO→'],
      // ],
    ];
  }
}
