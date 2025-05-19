import { CompoundUnit, SimpleUnit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

import { GarminUnitType } from '@microsoft/msfs-garminsdk';

/**
 * Predefined unit types for the G3X Touch.
 */
export class G3XUnitType {
  private static readonly SIM_FUEL_WEIGHT_UNITS = GarminUnitType.createSimFuelWeightUnits();
  private static readonly SIM_FUEL_FLOW_UNITS = GarminUnitType.createFuelFlowUnits(G3XUnitType.SIM_FUEL_WEIGHT_UNITS);

  /** Weight equivalent of one liter of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly LITER_SIM_FUEL = G3XUnitType.SIM_FUEL_WEIGHT_UNITS[0];
  /** Weight equivalent of one gallon of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly GALLON_SIM_FUEL = G3XUnitType.SIM_FUEL_WEIGHT_UNITS[1];
  /** Weight equivalent of one imperial gallon of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly IMP_GALLON_SIM_FUEL = G3XUnitType.SIM_FUEL_WEIGHT_UNITS[2];

  /** Weight equivalent of one liter of fuel per hour with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly LPH_SIM_FUEL = G3XUnitType.SIM_FUEL_FLOW_UNITS[0];
  /** Weight equivalent of one gallon of fuel per hour with density given by the `FUEL WEIGHT PER GALLON` SimVar per hour. */
  public static readonly GPH_SIM_FUEL = G3XUnitType.SIM_FUEL_FLOW_UNITS[1];
  /** Weight equivalent of one imperial gallon of fuel per hour with density given by the `FUEL WEIGHT PER GALLON` SimVar per hour. */
  public static readonly IGPH_SIM_FUEL = G3XUnitType.SIM_FUEL_FLOW_UNITS[2];

  /** One nautical mile per weight equivalent of one gallon of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly NMILE_PER_GALLON_SIM_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.NMILE], [G3XUnitType.GALLON_SIM_FUEL]);

  /** One statute mile per weight equivalent of one gallon of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly MILE_PER_GALLON_SIM_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.MILE], [G3XUnitType.GALLON_SIM_FUEL]);

  /** One kilometer per weight equivalent of one liter of fuel. */
  public static readonly KM_PER_LITER_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [UnitType.LITER_FUEL]);
  /** One kilometer per weight equivalent of one liter of Jet-A fuel. */
  public static readonly KM_PER_LITER_JET_A_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [UnitType.LITER_JET_A_FUEL]);
  /** One kilometer per weight equivalent of one liter of 100LL fuel. */
  public static readonly KM_PER_LITER_100LL_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [UnitType.LITER_100LL_FUEL]);
  /** One kilometer per weight equivalent of one liter of autogas fuel. */
  public static readonly KM_PER_LITER_AUTOGAS_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [UnitType.LITER_AUTOGAS_FUEL]);
  /** One kilometer per weight equivalent of one liter of fuel with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly KM_PER_LITER_SIM_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [G3XUnitType.LITER_SIM_FUEL]);

  private static readonly HUNDRED_KM = new SimpleUnit(UnitFamily.Distance, '100km', 1e5);

  /** One weight equivalent of one liter of fuel per 100 kilometers. */
  public static readonly LITER_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [UnitType.LITER_FUEL], [G3XUnitType.HUNDRED_KM]);
  /** One weight equivalent of one liter of Jet-A fuel per 100 kilometers. */
  public static readonly LITER_JET_A_FUEL_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [UnitType.LITER_JET_A_FUEL], [G3XUnitType.HUNDRED_KM]);
  /** One weight equivalent of one liter of 100LL fuel per 100 kilometers. */
  public static readonly LITER_100LL_FUEL_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [UnitType.LITER_100LL_FUEL], [G3XUnitType.HUNDRED_KM]);
  /** One weight equivalent of one liter of autogas fuel per 100 kilometers. */
  public static readonly LITER_AUTOGAS_FUEL_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [UnitType.LITER_AUTOGAS_FUEL], [G3XUnitType.HUNDRED_KM]);
  /** One weight equivalent of one liter of fuel per 100 kilometers with density given by the `FUEL WEIGHT PER GALLON` SimVar. */
  public static readonly LITER_SIM_FUEL_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [G3XUnitType.LITER_SIM_FUEL], [G3XUnitType.HUNDRED_KM]);
}
