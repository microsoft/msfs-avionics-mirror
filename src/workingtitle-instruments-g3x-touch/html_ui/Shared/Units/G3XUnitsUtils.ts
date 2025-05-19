import { UnitsFuelSettingMode } from '@microsoft/msfs-garminsdk';

import { G3XUnitsFuelType } from '../AvionicsConfig/UnitsConfig';
import { G3XUnitsFuelEconomySettingMode } from '../Settings/G3XUnitsUserSettings';

/**
 * A utility class for working with G3X Touch measurement units.
 */
export class G3XUnitsUtils {
  /**
   * Gets an array of supported fuel units setting modes for a given fuel type.
   * @param fuelType The fuel type for which to get the supported setting modes.
   * @returns An array of supported fuel units setting modes for the specified fuel type. The default mode is
   * guaranteed to be the first element in the array.
   */
  public static getFuelUnitsSettingModes(fuelType: G3XUnitsFuelType): UnitsFuelSettingMode[] {
    switch (fuelType) {
      case G3XUnitsFuelType.JetA:
        return [
          UnitsFuelSettingMode.GallonsJetA,
          UnitsFuelSettingMode.LitersJetA,
          UnitsFuelSettingMode.Pounds,
          UnitsFuelSettingMode.Kilograms,
        ];
      case G3XUnitsFuelType.OneHundredLL:
        return [
          UnitsFuelSettingMode.Gallons100LL,
          UnitsFuelSettingMode.Liters100LL,
          UnitsFuelSettingMode.Pounds,
          UnitsFuelSettingMode.Kilograms,
        ];
      case G3XUnitsFuelType.Autogas:
        return [
          UnitsFuelSettingMode.GallonsAutogas,
          UnitsFuelSettingMode.LitersAutogas,
          UnitsFuelSettingMode.Pounds,
          UnitsFuelSettingMode.Kilograms,
        ];
      case G3XUnitsFuelType.Sim:
      default: {
        return [
          UnitsFuelSettingMode.GallonsSim,
          UnitsFuelSettingMode.LitersSim,
          UnitsFuelSettingMode.Pounds,
          UnitsFuelSettingMode.Kilograms,
        ];
      }
    }
  }

  /**
   * Gets an array of supported fuel economy units setting modes for a given fuel type.
   * @param fuelType The fuel type for which to get the supported setting modes.
   * @returns An array of supported fuel economy units setting modes for the specified fuel type. The default mode is
   * guaranteed to be the first element in the array.
   */
  public static getFuelEconomyUnitsSettingModes(fuelType: G3XUnitsFuelType): G3XUnitsFuelEconomySettingMode[] {
    switch (fuelType) {
      case G3XUnitsFuelType.JetA:
        return [
          G3XUnitsFuelEconomySettingMode.NauticalJetA,
          G3XUnitsFuelEconomySettingMode.StatuteJetA,
          G3XUnitsFuelEconomySettingMode.MetricKmPerLJetA,
          G3XUnitsFuelEconomySettingMode.MetricLPer100KmJetA,
        ];
      case G3XUnitsFuelType.OneHundredLL:
        return [
          G3XUnitsFuelEconomySettingMode.Nautical100LL,
          G3XUnitsFuelEconomySettingMode.Statute100LL,
          G3XUnitsFuelEconomySettingMode.MetricKmPerL100LL,
          G3XUnitsFuelEconomySettingMode.MetricLPer100Km100LL,
        ];
      case G3XUnitsFuelType.Autogas:
        return [
          G3XUnitsFuelEconomySettingMode.NauticalAutogas,
          G3XUnitsFuelEconomySettingMode.StatuteAutogas,
          G3XUnitsFuelEconomySettingMode.MetricKmPerLAutogas,
          G3XUnitsFuelEconomySettingMode.MetricLPer100KmAutogas,
        ];
      case G3XUnitsFuelType.Sim:
      default:
        return [
          G3XUnitsFuelEconomySettingMode.NauticalSim,
          G3XUnitsFuelEconomySettingMode.StatuteSim,
          G3XUnitsFuelEconomySettingMode.MetricKmPerLSim,
          G3XUnitsFuelEconomySettingMode.MetricLPer100KmSim,
        ];
    }
  }
}
