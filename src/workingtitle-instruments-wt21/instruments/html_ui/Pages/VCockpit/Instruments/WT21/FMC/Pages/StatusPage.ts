import {
  ClockEvents, ComputedSubject, ConsumerSubject, DisplayField, FmcRenderTemplate, Formatter, PageLinkField, RawFormatter, Subject
} from '@microsoft/msfs-sdk';

import { TimeFormatter } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/** {@link Formatter} for displaying a date */
class StatusDateFormatter implements Formatter<Date>  {
  public static readonly MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  nullValueString = '------';

  /** @inheritDoc */
  format(value: Date): string {
    return `${value.getDate().toString().padStart(2, '0')}${StatusDateFormatter.MONTH_NAMES[value.getMonth()]}${value.getFullYear().toString().substr(2)}`;
  }
}

/** STATUS page */
export class StatusPage extends WT21FmcPage {
  private static readonly CLOCK_UPDATE_FREQUENCY = 1 / 2;
  private static readonly WT21_NAVDATA_REGEX = /([A-Z]{3})(\d{2})([A-Z]{3})(\d{2})\/(\d{2})/;

  private readonly navDbDate = ComputedSubject.create<string, string>(SimVar.GetGameVarValue('FLIGHT NAVDATA DATE RANGE', 'string'), (value) => {
    const matches = value.match(StatusPage.WT21_NAVDATA_REGEX);
    if (matches) {
      const [, fromMonth, fromDay, toMonth, toDay, year] = matches;
      return `${fromDay}${fromMonth}${year} ${toDay}${toMonth}${year}`;
    }
    return value;
  });

  private readonly indexPageLink = PageLinkField.createLink(this, '<INDEX', '/');
  private readonly posInitLink = PageLinkField.createLink(this, 'POS INIT>', '/pos-init');

  private readonly isNavDbValid = Subject.create<boolean>(true);

  private readonly SimTimeConsumer = ConsumerSubject.create<number>(
    this.bus
      .getSubscriber<ClockEvents>()
      .on('simTime')
      .atFrequency(StatusPage.CLOCK_UPDATE_FREQUENCY, true),
    Date.now()
  ).map<Date>((value) => new Date(value));


  private readonly ClockField = new DisplayField(this, {
    formatter: TimeFormatter,
  });

  private readonly DateField = new DisplayField(this, {
    formatter: new StatusDateFormatter(),
  });

  private readonly NavDbDateField = new DisplayField(this, {
    formatter: RawFormatter,
  });

  /** @inheritDoc */
  public init(): void {
    this.ClockField.bind(this.SimTimeConsumer);
    this.DateField.bind(this.SimTimeConsumer);
    this.NavDbDateField.bind(this.navDbDate);
    this.addBinding(this.isNavDbValid.sub((isValid) => {
      this.NavDbDateField.getOptions().style = isValid ? '' : '[yellow]';
      this.invalidate();
    }));
    this.addBinding(this.SimTimeConsumer.sub((value: Date) => {
      const navDbDate = this.getDatesFromNavDbString(this.navDbDate.getRaw());
      const datenow = new Date(value).setHours(0, 0, 0, 0);
      this.isNavDbValid.set((datenow >= navDbDate[0].getTime()) && (datenow <= navDbDate[1].getTime()));
    }));
  }

  /**
   * Get date objects from nav data string
   * @param navDbString The nav data string.
   * @returns An array of From and To date.
   */
  private getDatesFromNavDbString(navDbString: string): Date[] {
    const matches = navDbString.match(StatusPage.WT21_NAVDATA_REGEX);
    const getMonth = (month: string): number => {
      return (StatusDateFormatter.MONTH_NAMES.indexOf(month));
    };

    if (matches) {
      const [, fromMonth, fromDay, toMonth, toDay, year] = matches;
      const yearStr = parseInt(`20${year}`);
      return [new Date(yearStr, getMonth(fromMonth), parseInt(fromDay)), new Date(yearStr, getMonth(toMonth), parseInt(toDay))];
    }
    const now = new Date();

    return [now, now];
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): FmcRenderTemplate[] {
    return [
      [
        ['', '1/2[blue]', 'STATUS[blue]'],
        [' NAV DATA[blue]'],
        ['WORLD'],
        [' ACTIVE DATA BASE[blue]'],
        [this.NavDbDateField],
        [' SEC DATA BASE[blue]'],
        ['------- -------'],
        [' UTC[blue]', 'DATE[blue] '],
        [this.ClockField, this.DateField],
        [' PROGRAM[blue]'],
        ['SCID 832-0883-000'],
        ['', '', '------------------------[blue]'],
        [this.indexPageLink, this.posInitLink],
      ],
    ];
  }
}
