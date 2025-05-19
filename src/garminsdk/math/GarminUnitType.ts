import { CompoundableUnit, CompoundUnit, SimVarValueType, Unit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

/**
 * Predefined unit types for Garmin avionics.
 */
export class GarminUnitType {
  /**
   * The standard name for a weight unit equivalent to one liter of fuel with the density given by the
   * `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly LITER_SIM_FUEL_NAME = 'liter sim fuel';
  /**
   * The standard name for a weight unit equivalent to one gallon of fuel with the density given by the
   * `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly GALLON_SIM_FUEL_NAME = 'gallon sim fuel';
  /**
   * The standard name for a weight unit equivalent to one imperial gallon of fuel with the density given by the
   * `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly IMP_GALLON_SIM_FUEL_NAME = 'imperial gallon sim fuel';

  /**
   * The standard name for a weight flux unit equivalent to one liter of fuel per hour with the density given by the
   * `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly LPH_SIM_FUEL_NAME = 'liter sim fuel per hour';
  /**
   * The standard name for a weight flux unit equivalent to one gallon of fuel per hour with the density given by the
   * `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly GPH_SIM_FUEL_NAME = 'gallon sim fuel per hour';
  /**
   * The standard name for a weight flux unit equivalent to one imperial gallon of fuel per hour with the density given
   * by the `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static readonly IGPH_SIM_FUEL_NAME = 'imperial gallon sim fuel per hour';

  /**
   * Creates a set of weight units that are equivalent to one liter, gallon, and imperial gallon of fuel with the
   * density given by the `FUEL WEIGHT PER GALLON` SimVar.
   * @returns An array containing a set of weight units that are equivalent to one liter, gallon, and imperial gallon
   * of fuel with the density given by the `FUEL WEIGHT PER GALLON` SimVar.
   */
  public static createSimFuelWeightUnits(): [
    liter: CompoundableUnit<UnitFamily.Weight>,
    gallon: CompoundableUnit<UnitFamily.Weight>,
    imperialGallon: CompoundableUnit<UnitFamily.Weight>,
  ] {
    return UnitType.createFuelWeightUnit(
      SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', SimVarValueType.Pounds),
      {
        volumeUnit: UnitType.LITER,
        name: GarminUnitType.LITER_SIM_FUEL_NAME,
      },
      {
        volumeUnit: UnitType.GALLON,
        name: GarminUnitType.GALLON_SIM_FUEL_NAME,
      },
      {
        volumeUnit: UnitType.IMP_GALLON,
        name: GarminUnitType.IMP_GALLON_SIM_FUEL_NAME,
      }
    ) as [CompoundableUnit<UnitFamily.Weight>, CompoundableUnit<UnitFamily.Weight>, CompoundableUnit<UnitFamily.Weight>];
  }

  /**
   * Creates a set of weight flux units that are equivalent to one liter, gallon, and imperial gallon of fuel per hour.
   * @param weightUnits An array containing the set of weight units that define the equivalent of one liter, gallon,
   * and imperial gallon of fuel.
   * @returns An array containing a set of weight flux units that are equivalent to one liter, gallon, and imperial
   * gallon of fuel per hour using the specified fuel weight units.
   */
  public static createFuelFlowUnits(
    weightUnits: readonly [
      liter: CompoundableUnit<UnitFamily.Weight>,
      gallon: CompoundableUnit<UnitFamily.Weight>,
      imperialGallon: CompoundableUnit<UnitFamily.Weight>,
    ]
  ): [
      liter: Unit<UnitFamily.WeightFlux>,
      gallon: Unit<UnitFamily.WeightFlux>,
      imperialGallon: Unit<UnitFamily.WeightFlux>,
    ] {
    return [
      new CompoundUnit(UnitFamily.WeightFlux, [weightUnits[0]], [UnitType.HOUR], GarminUnitType.LPH_SIM_FUEL_NAME),
      new CompoundUnit(UnitFamily.WeightFlux, [weightUnits[1]], [UnitType.HOUR], GarminUnitType.GPH_SIM_FUEL_NAME),
      new CompoundUnit(UnitFamily.WeightFlux, [weightUnits[2]], [UnitType.HOUR], GarminUnitType.IGPH_SIM_FUEL_NAME),
    ];
  }
}
