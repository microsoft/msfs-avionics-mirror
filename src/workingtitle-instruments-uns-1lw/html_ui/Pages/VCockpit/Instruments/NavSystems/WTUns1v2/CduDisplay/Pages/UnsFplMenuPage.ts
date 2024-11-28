import { FmcRenderTemplate, PageLinkField, Subject } from '@microsoft/msfs-sdk';

import { UnsFlightPlans } from '../../Fms';
import { UnsDisplayField } from '../Components/UnsDisplayField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsFmcPage } from '../UnsFmcPage';

/**
 * FPL MENU page
 */
export class UnsFplMenuPage extends UnsFmcPage {
  private readonly DepartLink = PageLinkField.createLink(this, `${UnsChars.ArrowLeft}DEPART`, '/depart');

  private readonly ArriveLink = PageLinkField.createLink(this, `ARRIVE${UnsChars.ArrowRight}`, '/arrive');

  private readonly ReturnLink = PageLinkField.createLink(this, `RETURN${UnsChars.ArrowRight}`, '/fpl');

  private readonly DeletePlanLink = new UnsDisplayField(this, {
    formatter: ([, isHighlighted]) => `${UnsChars.ArrowLeft}DELETE FPL[${isHighlighted ? 'r-white' : 'white'}]`,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.DeletePlanLink);
      return true;
    },
    onEnterPressed: async () => {
      this.fms.emptyFlightPlan(UnsFlightPlans.Active);
      return true;
    },
  }).bindWrappedData(Subject.create(undefined));

  protected pageTitle = ' FPL MENU';

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        [`${UnsChars.ArrowLeft}COMPRESSED[disabled]`, `STORE FPL${UnsChars.ArrowRight}[disabled]`],
        [''],
        [`${UnsChars.ArrowLeft}CLEARANCE[disabled]`],
        [''],
        [`${UnsChars.ArrowLeft}PPOS TO WPT[disabled]`, `RAIM PRED${UnsChars.ArrowRight}[disabled]`],
        [''],
        [this.DepartLink, this.ArriveLink],
        [''],
        [this.DeletePlanLink, this.ReturnLink],
      ]
    ];
  }
}
