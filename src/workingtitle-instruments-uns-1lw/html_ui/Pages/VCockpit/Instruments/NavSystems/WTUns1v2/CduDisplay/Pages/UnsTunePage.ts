import { FmcRenderTemplate } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';

/** A UNS Tune page */
export class UnsTunePage extends UnsFmcPage {
  protected pageTitle = '  TUNE';

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        ['', '', 'NOT AVAILABLE[d-text cyan]']
      ]
      // [
      //   ['', '', 'TUNE  1/1'],
      //   [''],
      //   ['←COM 1', 'COM 2→'],
      //   [''],
      //   ['←NAV 1', 'NAV 2→'],
      //   [''],
      //   ['←ADF 1', 'ADF 2→'],
      //   [''],
      //   ['←ATC', 'RCL→'],
      //   [''],
      //   ['←TAC', 'RTN→'],
      // ],
    ];
  }
}
