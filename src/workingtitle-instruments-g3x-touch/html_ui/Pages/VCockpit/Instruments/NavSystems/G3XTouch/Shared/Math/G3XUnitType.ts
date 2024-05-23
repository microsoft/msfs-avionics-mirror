import { CompoundUnit, SimpleUnit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

/**
 * Predefined unit types.
 */
export class G3XUnitType {
  /** One kilometer per weight equivalent of one liter of fuel. */
  public static readonly KM_PER_LITER_FUEL = new CompoundUnit(UnitFamily.DistancePerWeight, [UnitType.KILOMETER], [UnitType.LITER_FUEL]);
  /** One liter of fuel per weight equivalent of 100 kilometers. */
  public static readonly LITER_PER_100KM = new CompoundUnit(UnitFamily.WeightPerDistance, [UnitType.LITER_FUEL], [new SimpleUnit(UnitFamily.Distance, '100km', 1e5)]);
}