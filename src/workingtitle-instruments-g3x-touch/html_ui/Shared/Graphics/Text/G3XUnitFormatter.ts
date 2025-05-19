import { Unit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

import { G3XUnitType } from '../../Math/G3XUnitType';
import { G3XSpecialChar } from './G3XSpecialChar';

/**
 * A utility class for creating G3X Touch unit formatters.
 *
 * Each unit formatter is a function which generates output strings from input measurement units.
 */
export class G3XUnitFormatter {
  private static readonly UNIT_TEXT: Record<string, Record<string, string>> = {
    [UnitFamily.Distance]: {
      [UnitType.METER.name]: G3XSpecialChar.Meter,
      [UnitType.FOOT.name]: G3XSpecialChar.Foot,
      [UnitType.KILOMETER.name]: G3XSpecialChar.Kilometer,
      [UnitType.NMILE.name]: G3XSpecialChar.NauticalMile,
      [UnitType.MILE.name]: G3XSpecialChar.StatuteMile
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
      [UnitType.KILOGRAM.name]: G3XSpecialChar.Kilogram,
      [UnitType.POUND.name]: G3XSpecialChar.Pound,
      [UnitType.LITER_FUEL.name]: 'L',
      [UnitType.GALLON_FUEL.name]: G3XSpecialChar.Gallon,
      [UnitType.IMP_GALLON_FUEL.name]: 'IG',
      [UnitType.LITER_JET_A_FUEL.name]: 'L',
      [UnitType.GALLON_JET_A_FUEL.name]: G3XSpecialChar.Gallon,
      [UnitType.IMP_GALLON_JET_A_FUEL.name]: 'IG',
      [UnitType.LITER_100LL_FUEL.name]: 'L',
      [UnitType.GALLON_100LL_FUEL.name]: G3XSpecialChar.Gallon,
      [UnitType.IMP_GALLON_100LL_FUEL.name]: 'IG',
      [UnitType.LITER_AUTOGAS_FUEL.name]: 'L',
      [UnitType.GALLON_AUTOGAS_FUEL.name]: G3XSpecialChar.Gallon,
      [UnitType.IMP_GALLON_AUTOGAS_FUEL.name]: 'IG',
      [G3XUnitType.LITER_SIM_FUEL.name]: 'L',
      [G3XUnitType.GALLON_SIM_FUEL.name]: G3XSpecialChar.Gallon,
      [G3XUnitType.IMP_GALLON_SIM_FUEL.name]: 'IG',
    },
    [UnitFamily.Volume]: {
      [UnitType.LITER.name]: 'L',
      [UnitType.GALLON.name]: G3XSpecialChar.Gallon
    },
    [UnitFamily.Pressure]: {
      [UnitType.HPA.name]: G3XSpecialChar.Hectopascal,
      [UnitType.MB.name]: G3XSpecialChar.Millibar,
      [UnitType.IN_HG.name]: G3XSpecialChar.InHg,
    },
    [UnitFamily.Temperature]: {
      [UnitType.CELSIUS.name]: G3XSpecialChar.DegreeCelsius,
      [UnitType.FAHRENHEIT.name]: G3XSpecialChar.DegreeFahrenheit
    },
    [UnitFamily.TemperatureDelta]: {
      [UnitType.DELTA_CELSIUS.name]: G3XSpecialChar.DegreeCelsius,
      [UnitType.DELTA_FAHRENHEIT.name]: G3XSpecialChar.DegreeFahrenheit
    },
    [UnitFamily.Speed]: {
      [UnitType.KNOT.name]: G3XSpecialChar.Knot,
      [UnitType.KPH.name]: G3XSpecialChar.KilometerPerHour,
      [UnitType.MPM.name]: 'MPM',
      [UnitType.FPM.name]: G3XSpecialChar.FootPerMinute
    },
    [UnitFamily.WeightFlux]: {
      [UnitType.KGH.name]: G3XSpecialChar.KilogramPerHour,
      [UnitType.PPH.name]: G3XSpecialChar.PoundPerHour,
      [UnitType.LPH_FUEL.name]: G3XSpecialChar.LiterPerHour,
      [UnitType.GPH_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.IGPH_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.LPH_JET_A_FUEL.name]: G3XSpecialChar.LiterPerHour,
      [UnitType.GPH_JET_A_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.IGPH_JET_A_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.LPH_100LL_FUEL.name]: G3XSpecialChar.LiterPerHour,
      [UnitType.GPH_100LL_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.IGPH_100LL_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.LPH_AUTOGAS_FUEL.name]: G3XSpecialChar.LiterPerHour,
      [UnitType.GPH_AUTOGAS_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [UnitType.IGPH_AUTOGAS_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [G3XUnitType.LPH_SIM_FUEL.name]: G3XSpecialChar.LiterPerHour,
      [G3XUnitType.GPH_SIM_FUEL.name]: G3XSpecialChar.GallonPerHour,
      [G3XUnitType.IGPH_SIM_FUEL.name]: G3XSpecialChar.GallonPerHour,
    },
    [UnitFamily.DistancePerWeight]: {
      [UnitType.NMILE_PER_GALLON_FUEL.name]: G3XSpecialChar.NauticalMilePerGallon,
      [UnitType.MILE_PER_GALLON_FUEL.name]: G3XSpecialChar.StatuteMilePerGallon,
      [G3XUnitType.KM_PER_LITER_FUEL.name]: G3XSpecialChar.KilometerPerLiter,
      [UnitType.NMILE_PER_GALLON_JET_A_FUEL.name]: G3XSpecialChar.NauticalMilePerGallon,
      [UnitType.MILE_PER_GALLON_JET_A_FUEL.name]: G3XSpecialChar.StatuteMilePerGallon,
      [G3XUnitType.KM_PER_LITER_JET_A_FUEL.name]: G3XSpecialChar.KilometerPerLiter,
      [UnitType.NMILE_PER_GALLON_100LL_FUEL.name]: G3XSpecialChar.NauticalMilePerGallon,
      [UnitType.MILE_PER_GALLON_100LL_FUEL.name]: G3XSpecialChar.StatuteMilePerGallon,
      [G3XUnitType.KM_PER_LITER_100LL_FUEL.name]: G3XSpecialChar.KilometerPerLiter,
      [UnitType.NMILE_PER_GALLON_AUTOGAS_FUEL.name]: G3XSpecialChar.NauticalMilePerGallon,
      [UnitType.MILE_PER_GALLON_AUTOGAS_FUEL.name]: G3XSpecialChar.StatuteMilePerGallon,
      [G3XUnitType.KM_PER_LITER_AUTOGAS_FUEL.name]: G3XSpecialChar.KilometerPerLiter,
      [G3XUnitType.NMILE_PER_GALLON_SIM_FUEL.name]: G3XSpecialChar.NauticalMilePerGallon,
      [G3XUnitType.MILE_PER_GALLON_SIM_FUEL.name]: G3XSpecialChar.StatuteMilePerGallon,
      [G3XUnitType.KM_PER_LITER_SIM_FUEL.name]: G3XSpecialChar.KilometerPerLiter,
    },
    [UnitFamily.WeightPerDistance]: {
      [G3XUnitType.LITER_PER_100KM.name]: G3XSpecialChar.LiterPer100Km,
      [G3XUnitType.LITER_JET_A_FUEL_PER_100KM.name]: G3XSpecialChar.LiterPer100Km,
      [G3XUnitType.LITER_100LL_FUEL_PER_100KM.name]: G3XSpecialChar.LiterPer100Km,
      [G3XUnitType.LITER_AUTOGAS_FUEL_PER_100KM.name]: G3XSpecialChar.LiterPer100Km,
      [G3XUnitType.LITER_SIM_FUEL_PER_100KM.name]: G3XSpecialChar.LiterPer100Km,
    }
  };

  private static readonly BASIC_UNIT_TEXT: Partial<Record<string, Partial<Record<string, string>>>> = {
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
      [UnitType.IMP_GALLON_FUEL.name]: 'IG',
      [UnitType.LITER_JET_A_FUEL.name]: 'LT',
      [UnitType.GALLON_JET_A_FUEL.name]: 'GAL',
      [UnitType.IMP_GALLON_JET_A_FUEL.name]: 'IG',
      [UnitType.LITER_100LL_FUEL.name]: 'LT',
      [UnitType.GALLON_100LL_FUEL.name]: 'GAL',
      [UnitType.IMP_GALLON_100LL_FUEL.name]: 'IG',
      [UnitType.LITER_AUTOGAS_FUEL.name]: 'LT',
      [UnitType.GALLON_AUTOGAS_FUEL.name]: 'GAL',
      [UnitType.IMP_GALLON_AUTOGAS_FUEL.name]: 'IG',
      [G3XUnitType.LITER_SIM_FUEL.name]: 'LT',
      [G3XUnitType.GALLON_SIM_FUEL.name]: 'GAL',
      [G3XUnitType.IMP_GALLON_SIM_FUEL.name]: 'IG',
    },
    [UnitFamily.Volume]: {
      [UnitType.LITER.name]: 'L',
      [UnitType.GALLON.name]: 'GAL'
    },
    [UnitFamily.Pressure]: {
      [UnitType.HPA.name]: 'PA',
      [UnitType.MB.name]: 'MB',
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
      [UnitType.MPH.name]: 'MPH',
      [UnitType.KPH.name]: 'KPH',
      [UnitType.MPM.name]: 'MPM',
      [UnitType.FPM.name]: 'FPM'
    },
    [UnitFamily.WeightFlux]: {
      [UnitType.KGH.name]: 'KG/HR',
      [UnitType.PPH.name]: 'LB/HR',
      [UnitType.LPH_FUEL.name]: 'LT/HR',
      [UnitType.GPH_FUEL.name]: 'GAL/HR',
      [UnitType.IGPH_FUEL.name]: 'IG/HR',
      [UnitType.LPH_JET_A_FUEL.name]: 'LT/HR',
      [UnitType.GPH_JET_A_FUEL.name]: 'GAL/HR',
      [UnitType.IGPH_JET_A_FUEL.name]: 'IG/HR',
      [UnitType.LPH_100LL_FUEL.name]: 'LT/HR',
      [UnitType.GPH_100LL_FUEL.name]: 'GAL/HR',
      [UnitType.IGPH_100LL_FUEL.name]: 'IG/HR',
      [UnitType.LPH_AUTOGAS_FUEL.name]: 'LT/HR',
      [UnitType.GPH_AUTOGAS_FUEL.name]: 'GAL/HR',
      [UnitType.IGPH_AUTOGAS_FUEL.name]: 'IG/HR',
      [G3XUnitType.LPH_SIM_FUEL.name]: 'LT/HR',
      [G3XUnitType.GPH_SIM_FUEL.name]: 'GAL/HR',
      [G3XUnitType.IGPH_SIM_FUEL.name]: 'IG/HR',
    }
  };

  /**
   * Creates a function which formats measurement units to G3X-style strings representing their abbreviated names.
   * @param defaultString The string to output when the input unit cannot be formatted. Defaults to the empty string.
   * @returns A function which formats measurement units to G3X-style strings representing their abbreviated names.
   */
  public static create(defaultString = ''): (unit: Unit<any>) => string {
    return (unit: Unit<any>): string => G3XUnitFormatter.UNIT_TEXT[unit.family]?.[unit.name] ?? defaultString;
  }

  /**
   * Creates a function which formats measurement units to basic-style strings representing their abbreviated names.
   * @param defaultString The string to output when the input unit cannot be formatted. Defaults to the empty string.
   * @returns A function which formats measurement units to basic-style strings representing their abbreviated names.
   */
  public static createBasic(defaultString = ''): (unit: Unit<any>) => string {
    return (unit: Unit<any>): string => G3XUnitFormatter.BASIC_UNIT_TEXT[unit.family]?.[unit.name] ?? defaultString;
  }

  /**
   * Gets a mapping of unit family and name to G3X-style text used by G3XUnitFormatter to format units. The returned
   * object maps unit families to objects that map unit names within each family to formatted text.
   * @returns A mapping of unit family and name to G3X-style text used by G3XUnitFormatter to format units.
   */
  public static getUnitTextMap(): Readonly<Partial<Record<string, Readonly<Partial<Record<string, string>>>>>> {
    return G3XUnitFormatter.UNIT_TEXT;
  }

  /**
   * Gets a mapping of unit family and name to basic-style text used by G3XUnitFormatter to format units. The returned
   * object maps unit families to objects that map unit names within each family to formatted text.
   * @returns A mapping of unit family and name to basic-style text used by G3XUnitFormatter to format units.
   */
  public static getBasicUnitTextMap(): Readonly<Partial<Record<string, Readonly<Partial<Record<string, string>>>>>> {
    return G3XUnitFormatter.BASIC_UNIT_TEXT;
  }
}
