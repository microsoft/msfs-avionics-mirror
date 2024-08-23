import {
  DataInterface, DisplayField, FmcRenderTemplate, Formatter, MappedSubject, PageLinkField, TextInputField, UnitType, Validator
} from '@microsoft/msfs-sdk';

import { WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import { AltitudeInputFormat, ConvertableNumberAndUnitFormat, SimpleStringFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 *
 */
export type PassengerDataEntry = {
  /**
   * Number of passengers
   */
  count: number | null,

  /**
   * Average weight of each passenger
   */
  averageWeight: number | null,
}

/**
 *
 */
export class PassengerDataFormat implements Validator<PassengerDataEntry>, Formatter<PassengerDataEntry> {
  nullValueString = ' -/---[d-text]LB[s-text]';

  /** @inheritDoc */
  parse(input: string): PassengerDataEntry | null {
    const REGEX = /^(\d+)(\/(\d+))?$/;

    const match = REGEX[Symbol.match](input);

    if (!match) {
      return null;
    }

    const paxCount = match[1];
    const paxAverageWeight = match[3];

    const paxCountInt = parseInt(paxCount);
    let paxAverageWeightInt = paxAverageWeight ? parseInt(paxAverageWeight) : null;

    if (paxAverageWeightInt !== null) {
      if (WT21UnitsUtils.getIsMetric()) {
        paxAverageWeightInt = UnitType.KILOGRAM.convertTo(paxAverageWeightInt, UnitType.POUND);
      }
    }

    return {
      count: paxCountInt,
      averageWeight: paxAverageWeightInt,
    };
  }

  /** @inheritDoc */
  format(value: PassengerDataEntry): string {
    // eslint-disable-next-line prefer-const
    let { count, averageWeight } = value;
    let unitStr = WT21UnitsUtils.getUnitString(UnitType.POUND);
    if (averageWeight !== null) {
      if (WT21UnitsUtils.getIsMetric()) {
        averageWeight = UnitType.POUND.convertTo(averageWeight, UnitType.KILOGRAM);
        unitStr = WT21UnitsUtils.getUnitString(UnitType.KILOGRAM);
      }
    }

    return count !== null ? `${count.toString().padStart(2, ' ')}/${averageWeight?.toFixed(0)}[d-text]${unitStr}[s-text]` : this.nullValueString;
  }
}

/**
 * Format for basic operating weight
 */
class BowFormat extends ConvertableNumberAndUnitFormat {
  /** @inheritDoc */
  format(value: number): string {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const unitStr = WT21UnitsUtils.getUnitString(isMetric ? this.metricUnit : this.imperialUnit);
    if (isMetric) {
      value = this.imperialUnit.convertTo(value, this.metricUnit);
    }

    return `(${value.toFixed(this.options.precision).padStart(this.options.padStart, ' ')})${this.options.spaceBetween ? ' ' : ''}[d-text]${unitStr}[s-text]`;
  }
}

/**
 * Perf Init page
 */
export class PerfInitPage extends WT21FmcPage {

  private readonly Header = new DisplayField<boolean>(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(inMod: boolean): string {
        return ` ${inMod ? 'MOD' : 'ACT'} PERF INIT[blue]`;
      },
    },
  }).bind(this.fms.planInMod);

  private readonly vnavSetupLink = PageLinkField.createLink(this, 'VNAV SETUP>', '/vnav-setup');

  // TODO this is quite ugly
  private readonly PaxData = new DataInterface<PassengerDataEntry>(
    MappedSubject.create(
      ([count, averageWeight, manualZfw, manualGw]) => {
        if (manualZfw || manualGw) {
          return {
            count: null,
            averageWeight: null,
          } as PassengerDataEntry;
        }

        return ({
          count,
          averageWeight,
        } as PassengerDataEntry);
      },
      this.fms.performancePlanProxy.paxNumber,
      this.fms.performancePlanProxy.averagePassengerWeight,
      this.fms.performancePlanProxy.manualZfw,
      this.fms.performancePlanProxy.manualGw,
    ),
    ({ count, averageWeight }) => {
      if (count !== null) {
        this.fms.performancePlanProxy.paxNumber.set(count);
      }
      if (averageWeight !== null) {
        this.fms.performancePlanProxy.averagePassengerWeight.set(averageWeight);
      } else {
        this.fms.performancePlanProxy.averagePassengerWeight.set(170);
      }
    }
  );

  /**
   * Modifiable data source that shows dashes if the manually entered BOW is cancelled by a manual ZFW or GW entry
   *
   * @private
   */
  private readonly ModifiableCargoWeightData = new DataInterface(
    this.fms.basePerformanceManager.cargoWeight,
    (value) => this.fms.performancePlanProxy.cargoWeight.set(value),
  );

  /**
   * Modifiable data source that displays the ZFW and allows modifying the manually entered ZFW
   *
   * @private
   */
  private readonly ModifiableZfwData = new DataInterface(
    this.fms.basePerformanceManager.zfw,
    (value) => this.fms.performancePlanProxy.manualZfw.set(value),
  );

  /**
   * Modifiable data source that displays the GW and allows modifying the manually entered GW
   *
   * @private
   */
  private readonly ModifiableGWData = new DataInterface(
    this.fms.basePerformanceManager.gw,
    (value) => this.fms.performancePlanProxy.manualGw.set(value),
  );

  private readonly BowField = new DisplayField<number | null>(this, {
    formatter: new BowFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 5, spaceBetween: false }),
  }).bind(this.fms.performancePlanProxy.basicOperatingWeight);

  private readonly CrzAltField = new TextInputField<number | null>(this, {
    formatter: new AltitudeInputFormat(),
  }).bind(this.fms.performancePlanProxy.cruiseAltitude);

  private readonly PaxDataField = new TextInputField(this, {
    formatter: new PassengerDataFormat(),
    onDelete: async (): Promise<string | boolean> => { this.fms.performancePlanProxy.paxNumber.set(0); return true; },
  }).bindSource(this.PaxData);

  private readonly CargoWeightField = new TextInputField<number | null>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4 }),
    prefix: ' ',
    onDelete: async (): Promise<string | boolean> => { this.fms.performancePlanProxy.cargoWeight.set(0); return true; },
  }).bindSource(this.ModifiableCargoWeightData);

  private readonly ZfwField = new TextInputField<number | null>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 5 }, '', (v) => {
      return v > 12_500 ? 'yellow' : 'white';
    }),
  }).bindSource(this.ModifiableZfwData);

  private readonly FuelField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4 }),
    prefix: ' ',
  }).bind(this.fms.basePerformanceManager.sensedFuelWeight);

  private readonly GwtField = new TextInputField<number | null>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4 }),

  }).bindSource(this.ModifiableGWData);

  private readonly cancelModField = new DisplayField(this, {
    formatter: new SimpleStringFormat('<CANCEL MOD'),
    onSelected: async (): Promise<string | boolean> => {
      this.fms.cancelMod();
      return true;
    },
  });

  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.Header, '', ''],
        [' BOW[blue]', 'CRZ ALT[blue] '],
        [this.BowField, this.CrzAltField],
        [' PASS/WT[blue]', ''],
        [this.PaxDataField, ''],
        [' CARGO[blue]', '= ZFW [blue]'],
        [this.CargoWeightField, this.ZfwField],
        [' SENSED FUEL[blue]', '= GWT [blue]'],
        [this.FuelField, this.GwtField],
        ['', '', '------------------------[blue]'],
        ['', ''],
        ['', ''],
        [this.fms.planInMod.get() ? this.cancelModField : '', this.vnavSetupLink],
      ],
    ];
  }
}
