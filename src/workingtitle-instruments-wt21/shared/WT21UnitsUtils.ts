import { Unit, UnitType } from '@microsoft/msfs-sdk';

/**
 *
 */
export class WT21UnitsUtils {

  public static UNIT_STRINGS: Map<Unit<any>, string> = new Map<Unit<any>, string>([
    [UnitType.KILOGRAM, 'KG'],
    [UnitType.POUND, 'LB'],
    [UnitType.METER, 'M'],
    [UnitType.FOOT, 'FT'],
    [UnitType.IN_HG, 'IN'],
    [UnitType.HPA, 'HPA'],
    [UnitType.PPH, 'PPH'],
    [UnitType.KGH, 'KGH'],
  ]);

  /**
   * Returns a boolean indicating if the sim is in metric mode.
   * @returns true if sim is in metric mode, false otherwise.
   */
  public static getIsMetric(): boolean {
    return (SimVar.GetGameVarValue('GAME UNIT IS METRIC', 'number') as number) === 1;
  }

  /**
   * Gets the string (used for display) for a given unit in the WT21.
   * @param unit The unit to get the string for.
   * @returns The unit string for display.
   */
  public static getUnitString(unit: Unit<any>): string {
    return WT21UnitsUtils.UNIT_STRINGS.get(unit) ?? '';
  }
}