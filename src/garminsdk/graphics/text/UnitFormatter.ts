import { Unit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

/**
 * A utility class for creating Garmin unit formatters.
 *
 * Each unit formatter is a function which generates output strings from input measurement units.
 */
export class UnitFormatter {
  private static readonly UNIT_TEXT: Record<string, Record<string, string>> = {
    [UnitFamily.Distance]: {
      [UnitType.METER.name]: 'M',
      [UnitType.FOOT.name]: 'FT',
      [UnitType.KILOMETER.name]: 'KM',
      [UnitType.NMILE.name]: 'NM',
      [UnitType.MILE.name]: 'SM'
    },
    [UnitFamily.Angle]: {
      [UnitType.DEGREE.name]: '°',
      [UnitType.RADIAN.name]: 'rad'
    },
    [UnitFamily.Duration]: {
      [UnitType.SECOND.name]: 'SEC',
      [UnitType.MINUTE.name]: 'MIN',
      [UnitType.HOUR.name]: 'HR'
    },
    [UnitFamily.Weight]: {
      [UnitType.KILOGRAM.name]: 'KG',
      [UnitType.POUND.name]: 'LB',
      [UnitType.LITER_FUEL.name]: 'LT',
      [UnitType.GALLON_FUEL.name]: 'GAL',
      [UnitType.IMP_GALLON_FUEL.name]: 'IG'
    },
    [UnitFamily.Volume]: {
      [UnitType.LITER.name]: 'L',
      [UnitType.GALLON.name]: 'GAL'
    },
    [UnitFamily.Pressure]: {
      [UnitType.HPA.name]: 'HPA',
      [UnitType.IN_HG.name]: 'IN'
    },
    [UnitFamily.Temperature]: {
      [UnitType.CELSIUS.name]: '°C',
      [UnitType.FAHRENHEIT.name]: '°F'
    },
    [UnitFamily.TemperatureDelta]: {
      [UnitType.DELTA_CELSIUS.name]: '°C',
      [UnitType.DELTA_FAHRENHEIT.name]: '°F'
    },
    [UnitFamily.Speed]: {
      [UnitType.KNOT.name]: 'KT',
      [UnitType.KPH.name]: 'KH',
      [UnitType.MPM.name]: 'MPM',
      [UnitType.FPM.name]: 'FPM'
    },
    [UnitFamily.WeightFlux]: {
      [UnitType.KGH.name]: 'KG/HR',
      [UnitType.PPH.name]: 'LB/HR',
      [UnitType.LPH_FUEL.name]: 'LT/HR',
      [UnitType.GPH_FUEL.name]: 'GAL/HR',
      [UnitType.IGPH_FUEL.name]: 'IG/HR'
    }
  };

  private static UNIT_TEXT_LOWER?: Record<string, Record<string, string>>;
  private static UNIT_TEXT_UPPER?: Record<string, Record<string, string>>;

  /**
   * Creates a function which formats measurement units to strings representing their abbreviated names.
   * @param defaultString The string to output when the input unit cannot be formatted. Defaults to the empty string.
   * @param charCase The case to enforce on the output string. Defaults to `'normal'`.
   * @returns A function which formats measurement units to strings representing their abbreviated names.
   */
  public static create(defaultString = '', charCase: 'normal' | 'upper' | 'lower' = 'normal'): (unit: Unit<any>) => string {
    switch (charCase) {
      case 'upper':
        UnitFormatter.UNIT_TEXT_UPPER ??= UnitFormatter.createUpperCase();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return (unit: Unit<any>): string => UnitFormatter.UNIT_TEXT_UPPER![unit.family]?.[unit.name] ?? defaultString;
      case 'lower':
        UnitFormatter.UNIT_TEXT_LOWER ??= UnitFormatter.createLowerCase();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return (unit: Unit<any>): string => UnitFormatter.UNIT_TEXT_LOWER![unit.family]?.[unit.name] ?? defaultString;
      default:
        return (unit: Unit<any>): string => UnitFormatter.UNIT_TEXT[unit.family]?.[unit.name] ?? defaultString;
    }
  }

  /**
   * Creates a record of lowercase unit abbreviated names.
   * @returns A record of lowercase unit abbreviated names.
   */
  private static createLowerCase(): Record<string, Record<string, string>> {
    const lower: Record<string, Record<string, string>> = {};

    for (const family in UnitFormatter.UNIT_TEXT) {
      const familyText = UnitFormatter.UNIT_TEXT[family];
      lower[family] = {};
      for (const unit in familyText) {
        lower[family][unit] = familyText[unit].toLowerCase();
      }
    }

    return lower;
  }

  /**
   * Creates a record of uppercase unit abbreviated names.
   * @returns A record of uppercase unit abbreviated names.
   */
  private static createUpperCase(): Record<string, Record<string, string>> {
    const upper: Record<string, Record<string, string>> = {};

    for (const family in UnitFormatter.UNIT_TEXT) {
      const familyText = UnitFormatter.UNIT_TEXT[family];
      upper[family] = {};
      for (const unit in familyText) {
        upper[family][unit] = familyText[unit].toUpperCase();
      }
    }

    return upper;
  }
}