/** Weight and Fuel user settings. */
import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/** Weight and Fuel user settings. */
export type WeightFuelUserSettingTypes = {
  // ---- User-defined values ----

  /** The Basic Empty Weight setting, in pounds. A negative value represents an uninitialized state. */
  weightFuelBasicEmpty: number;

  /** The Crew & Stores setting, in pounds. */
  weightFuelCrewStores: number;

  /** The Number of Passengers setting. */
  weightFuelNumberPax: number;

  /** The Average Passenger Weight setting, in pounds. */
  weightFuelAvgPax: number;

  /** The Cargo weight setting, in pounds. */
  weightFuelCargo: number;

  /** The initial Fuel on Board setting, in pounds. A negative value represents an uninitialized state. */
  weightFuelInitialFob: number;

  /** The Taxi Fuel setting, in pounds. */
  weightFuelTaxi: number;

  /** The Fuel Reserves setting, in pounds. */
  weightFuelReserves: number;

  /** The Estimated Holding Time setting, in minutes. */
  weightFuelEstHoldingTime: number;
}

/** Utility class for retrieving weight and fuel user settings managers. */
export class WeightFuelUserSettings extends DefaultUserSettingManager<WeightFuelUserSettingTypes> {
  private static INSTANCE: DefaultUserSettingManager<WeightFuelUserSettingTypes> | undefined;

  /**
   * Gets an instance of the weight and fuel user settings manager.
   * @param bus The event bus.
   * @returns An instance of the weight and fuel user settings manager.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<WeightFuelUserSettingTypes> {
    return WeightFuelUserSettings.INSTANCE ??= new WeightFuelUserSettings(bus, [
      {
        name: 'weightFuelBasicEmpty',
        defaultValue: -1,
      },
      {
        name: 'weightFuelCrewStores',
        defaultValue: 0,
      },
      {
        name: 'weightFuelNumberPax',
        defaultValue: 0,
      },
      {
        name: 'weightFuelAvgPax',
        defaultValue: 0,
      },
      {
        name: 'weightFuelCargo',
        defaultValue: 0,
      },
      {
        name: 'weightFuelInitialFob',
        defaultValue: -1,
      },
      {
        name: 'weightFuelTaxi',
        defaultValue: 0,
      },
      {
        name: 'weightFuelReserves',
        defaultValue: 0,
      },
      {
        name: 'weightFuelEstHoldingTime',
        defaultValue: 0,
      },
    ]);
  }
}