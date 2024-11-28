import { DisplayField, FmcRenderTemplate, MappedSubject, Subject } from '@microsoft/msfs-sdk';

import { UnsFms } from '../../Fms';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduFormatters } from '../UnsCduIOUtils';
import { UnsFmcPage } from '../UnsFmcPage';

/** A UNS Software Version page */
export class UnsSoftwareVersionPage extends UnsFmcPage {
  protected pageTitle = 'S/W VERSION';

  private readonly ReturnPrompt = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  protected readonly TitleField = new DisplayField<readonly [boolean, number, number, string | null, boolean]>(this, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formatter: ([pposAccepted, _subPageIndex, _subPageCount, menuRoute, hasMessage]) => {
      const posMessage = pposAccepted ? '    ' : ' POS';
      const pageString = `${this.pageTitle}`.padEnd(13, ' ');
      const menuString = menuRoute !== null ? UnsChars.BoxedM : ' ';
      const messageString = hasMessage ? 'MSG' : '   ';

      return `${posMessage}[amber d-text] ${pageString}[cyan d-text] ${menuString}[white d-text]${messageString}[amber d-text]`;
    },
  }).bind(MappedSubject.create(this.fms.pposAccepted, this.displayedSubPageIndex, this.displayedSubPageCount, this.menuRoute, Subject.create(true)));

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        ['', ''],
        [''],
        [UnsCduFormatters.StringSpaceJoinSeperated('FMC[cyan s-text]', `${UnsFms.version}[d-text]`, 10), UnsCduFormatters.StringSpaceJoinSeperated('BSTRP[cyan s-text]', '11.0[d-text]', 10)],
        [UnsCduFormatters.StringSpaceJoinSeperated('CDU[cyan s-text]', '10.0Z[d-text]', 11), UnsCduFormatters.StringSpaceJoinSeperated('WAAS[cyan s-text]', '10.0[d-text]', 10)],
        [UnsCduFormatters.StringSpaceJoinSeperated('AUX[cyan s-text]', '1.1[d-text]', 10), ''],
        [UnsCduFormatters.StringSpaceJoinSeperated('ANA[cyan s-text]', '2.0[d-text]', 10)],
        ['', ''],
        [''],
        ['', this.ReturnPrompt],
      ],
    ];
  }
}
