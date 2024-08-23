import { DisplayField, FmcRenderTemplate, Formatter, MappedSubject, PageLinkField, UnitType } from '@microsoft/msfs-sdk';

import { ConvertableNumberAndUnitFormat, NumberAndUnitFormat, TimeFormatter } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/** A type for average speeds. */
type AverageSpeedsData = {
  /** The average true airspeed. */
  avgTas: number;
  /** The average ground speed. */
  avgGs: number;
}

/**
 * A formatter for average speeds display.
 */
class AverageSpeedsFormatter implements Formatter<AverageSpeedsData> {
  nullValueString = '---/---';

  /** @inheritdoc */
  format(value: AverageSpeedsData): string {
    return `${value.avgTas === -1 ? '---' : value.avgTas.toFixed(0).padStart(3, '0')}/${value.avgGs === -1 ? '---' : value.avgGs.toFixed(0).padStart(3, '0')}`;
  }
}

/**
 * Flight Log Page
 */
export class FlightLogPage extends WT21FmcPage {
  private readonly perfMenuLink = PageLinkField.createLink(this, 'PERF MENU>', '/perf-menu');

  protected readonly avgSpeedsData = MappedSubject.create(
    ([avgTas, avgGs]) => ({ avgTas, avgGs } as AverageSpeedsData),
    this.baseInstrument.flightLogger.avgTrueAirspeed,
    this.baseInstrument.flightLogger.avgGroundSpeed,
  );

  private readonly takeOffTimeField = new DisplayField(this, {
    formatter: TimeFormatter,
  }).bind(this.baseInstrument.flightLogger.takeoffTime.map<Date>((value) => new Date(value)));

  private readonly enrouteTimeField = new DisplayField(this, {
    formatter: TimeFormatter,
  }).bind(this.baseInstrument.flightLogger.enrouteTime.map<Date>((value) => new Date(value)));

  private readonly landingTimeField = new DisplayField(this, {
    formatter: TimeFormatter,
  }).bind(this.baseInstrument.flightLogger.landingTime.map<Date>((value) => new Date(value)));

  private readonly avgSpeedsField = new DisplayField(this, {
    formatter: new AverageSpeedsFormatter(),
  }).bind(this.avgSpeedsData);

  private readonly fuelUsedTotalField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: true }),
  }).bind(this.baseInstrument.flightLogger.fuelUsedTotal);

  private readonly airDistField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('NM', { padStart: 4, minValue: 0, maxValue: 10000, precision: 1, spaceBetween: true }),
  }).bind(this.baseInstrument.flightLogger.airDistance);

  private readonly groundDistField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('NM', { padStart: 4, minValue: 0, maxValue: 10000, precision: 1, spaceBetween: true }),
  }).bind(this.baseInstrument.flightLogger.groundDistance);

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'FLIGHT LOG[blue]'],
        [' TO[blue]', 'LDG [blue]', 'EN ROUTE[blue]'],
        [this.takeOffTimeField, this.landingTimeField, this.enrouteTimeField],
        [' FUEL USED[blue]', 'AVG TAS/GS [blue]'],
        [this.fuelUsedTotalField, this.avgSpeedsField],
        [' AIR DIST[blue]', 'GND DIST [blue]'],
        [this.airDistField, this.groundDistField],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        ['', this.perfMenuLink],
      ],
    ];
  }
}
