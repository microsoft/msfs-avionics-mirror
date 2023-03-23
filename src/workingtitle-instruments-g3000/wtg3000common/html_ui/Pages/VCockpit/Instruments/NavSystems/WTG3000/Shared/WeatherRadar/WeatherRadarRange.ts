import { NumberUnitReadOnly, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

/**
 * Utility class for working with weather radar ranges.
 */
export class WeatherRadarRange {
  /** The range array for G3000 weather radar displays. */
  public static readonly RANGE_ARRAY: readonly NumberUnitReadOnly<UnitFamily.Distance>[] = [
    10,
    20,
    40,
    60,
    80,
    120,
    160,
    240,
    320
  ].map(range => UnitType.NMILE.createNumber(range).readonly);
}