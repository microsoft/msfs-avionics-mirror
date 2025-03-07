import {
  AiracCycleFormatter, ClockEvents, ConsumerSubject, DisplayField, FacilityLoader, FmcRenderTemplate, Formatter, PageLinkField, RawFormatter, Subject
} from '@microsoft/msfs-sdk';

import { TimeFormatter } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/** {@link Formatter} for displaying a date */
class StatusDateFormatter implements Formatter<Date> {
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
  private readonly databaseDatesFormatter = AiracCycleFormatter.create('{eff({dd}{MON}{YY})} {expMinus({dd}{MON}{YY})}');

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

    const databaseCycles = FacilityLoader.getDatabaseCycles();
    this.NavDbDateField.takeValue(this.databaseDatesFormatter(databaseCycles.current));
    this.addBinding(this.isNavDbValid.sub((isValid) => {
      this.NavDbDateField.getOptions().style = isValid ? '' : '[yellow]';
      this.invalidate();
    }));
    this.addBinding(this.SimTimeConsumer.sub((value: Date) => {
      const datenow = new Date(value).setHours(0, 0, 0, 0);
      this.isNavDbValid.set((datenow >= databaseCycles.current.effectiveTimestamp) && (datenow <= databaseCycles.current.expirationTimestamp));
    }));
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): FmcRenderTemplate[] {
    return [
      [
        ['', this.PagingIndicator, 'STATUS[blue]'],
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
