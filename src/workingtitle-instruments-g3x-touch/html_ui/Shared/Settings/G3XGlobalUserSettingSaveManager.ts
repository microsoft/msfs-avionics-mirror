import {
  ArrayUtils, EventBus, UserSetting, UserSettingManager, UserSettingSaveManager, UserSettingSaveManagerSettingDef,
  UserSettingValue
} from '@microsoft/msfs-sdk';

import {
  DateTimeUserSettingTypes, TrafficUserSettingTypes, UnitsTemperatureSettingMode, UnitsWeightSettingMode
} from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { UnitsConfig } from '../AvionicsConfig/UnitsConfig';
import { G3XUnitsUtils } from '../Units/G3XUnitsUtils';
import { DisplayAllUserSettingTypes } from './DisplayUserSettings';
import { FplCalculationUserSettingTypes } from './FplCalculationUserSettings';
import { G3XChartsAllUserSettingTypes, G3XChartsColorModeSettingMode } from './G3XChartsUserSettings';
import { G3XUnitsBaroPressureSettingMode, G3XUnitsUserSettingTypes } from './G3XUnitsUserSettings';
import { PfdAllUserSettingTypes, PfdUserSettingTypes } from './PfdUserSettings';

/**
 * Sources of settings to be managed by {@link G3XGlobalUserSettingSaveManager}.
 */
export type G3XGlobalUserSettingSaveManagerSources = {
  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayAllUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAllUserSettingTypes>;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** A manager for traffic user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;

  /** A manager for flight plan calculation user settings. */
  fplCalcSettingManager: UserSettingManager<FplCalculationUserSettingTypes>;

  /** A manager for electronic charts user settings. */
  chartsSettingManager: UserSettingManager<G3XChartsAllUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UserSettingManager<G3XUnitsUserSettingTypes>;

  /** Additional settings to manage defined by plugins. */
  pluginSettings: Iterable<UserSetting<any>>;
};

/**
 * A manager for global G3X Touch user settings that are saved and persistent across flight sessions.
 */
export class G3XGlobalUserSettingSaveManager extends UserSettingSaveManager {
  private static readonly PFD_SETTINGS: (keyof PfdUserSettingTypes)[] = [
    'svtEnabled',
    'svtFpmShow',
    'pfdStandardRateTurnPointerShow',
    'windDisplayMode',
    'pfdInsetLeftKey',
    'pfdInsetRightKey',
    'pfdHsiOrientationMode',
    'pfdHsiShowUpperDeviationIndicator',
    'pfdKnobSplitScreenSideAction',
    'pfdKnobPressToToggleAction',
  ];

  private static readonly TRAFFIC_SETTINGS: (keyof TrafficUserSettingTypes)[] = [
    'trafficAltitudeMode',
    'trafficAltitudeRelative'
  ];

  /**
   * Creates a new instance of G3XGlobalUserSettingSaveManager.
   * @param bus The event bus.
   * @param inputs Sources of settings to be managed.
   * @param config The avionics configuration object.
   */
  public constructor(
    bus: EventBus,
    inputs: Readonly<G3XGlobalUserSettingSaveManagerSources>,
    config: AvionicsConfig
  ) {
    super(
      [
        ...inputs.displaySettingManager.getAllSettings(),
        ...inputs.pfdSettingManager.getAllSettings().filter(setting => {
          return G3XGlobalUserSettingSaveManager.PFD_SETTINGS.some(value => setting.definition.name.startsWith(value));
        }),
        ...inputs.dateTimeSettingManager.getAllSettings(),
        ...inputs.trafficSettingManager.getAllSettings().filter(setting => {
          return G3XGlobalUserSettingSaveManager.TRAFFIC_SETTINGS.some(value => setting.definition.name.startsWith(value));
        }),
        ...inputs.fplCalcSettingManager.getAllSettings(),
        ...G3XGlobalUserSettingSaveManager.getChartsSettingDefs(inputs.chartsSettingManager),
        ...G3XGlobalUserSettingSaveManager.getUnitsSettingDefs(inputs.unitsSettingManager, config.units),
        ...inputs.pluginSettings
      ],
      bus
    );
  }

  /**
   * Gets an array of definitions for electronic charts user settings to save.
   * @param manager A manager for electronic charts user settings.
   * @returns An array of definitions for electronic charts user settings to save.
   */
  private static getChartsSettingDefs(
    manager: UserSettingManager<G3XChartsAllUserSettingTypes>
  ): UserSettingSaveManagerSettingDef<UserSettingValue>[] {
    return manager.getAllSettings().map<UserSettingSaveManagerSettingDef<UserSettingValue> | undefined>(setting => {
      if (setting.definition.name.startsWith('chartsColorMode')) {
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => {
            switch (loadValue) {
              case G3XChartsColorModeSettingMode.Day:
              case G3XChartsColorModeSettingMode.Night:
              case G3XChartsColorModeSettingMode.Auto:
                return loadValue;
              default:
                return loadSetting.get();
            }
          },
        };
      } else {
        return { setting };
      }
    }).filter(def => !!def) as UserSettingSaveManagerSettingDef<UserSettingValue>[];
  }

  /**
   * Gets an array of definitions for units user settings to save.
   * @param manager A manager for units user settings.
   * @param unitsConfig A configuration object defining options for measurement units.
   * @returns An array of definitions for units user settings to save.
   */
  private static getUnitsSettingDefs(
    manager: UserSettingManager<G3XUnitsUserSettingTypes>,
    unitsConfig: UnitsConfig
  ): UserSettingSaveManagerSettingDef<UserSettingValue>[] {
    return manager.getAllSettings().map<UserSettingSaveManagerSettingDef<UserSettingValue> | undefined>(setting => {
      if (setting.definition.name.startsWith('unitsFuelEconomy')) {
        const fuelEconomySettingValues = G3XUnitsUtils.getFuelEconomyUnitsSettingModes(unitsConfig.fuelType);
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => ArrayUtils.includes(fuelEconomySettingValues, loadValue) ? loadValue : loadSetting.get(),
        };
      } else if (setting.definition.name.startsWith('unitsFuel')) {
        const fuelSettingValues = G3XUnitsUtils.getFuelUnitsSettingModes(unitsConfig.fuelType);
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => ArrayUtils.includes(fuelSettingValues, loadValue) ? loadValue : loadSetting.get(),
        };
      } else if (setting.definition.name.startsWith('unitsTemperature')) {
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => {
            switch (loadValue) {
              case UnitsTemperatureSettingMode.Fahrenheit:
              case UnitsTemperatureSettingMode.Celsius:
                return loadValue;
              default:
                return loadSetting.get();
            }
          },
        };
      } else if (setting.definition.name.startsWith('unitsBaroPressure')) {
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => {
            switch (loadValue) {
              case G3XUnitsBaroPressureSettingMode.InHg:
              case G3XUnitsBaroPressureSettingMode.Millibars:
              case G3XUnitsBaroPressureSettingMode.Hectopascals:
                return loadValue;
              default:
                return loadSetting.get();
            }
          },
        };
      } else if (setting.definition.name.startsWith('unitsWeight')) {
        return {
          setting,
          loadValidator: (loadValue, loadSetting) => {
            switch (loadValue) {
              case UnitsWeightSettingMode.Pounds:
              case UnitsWeightSettingMode.Kilograms:
                return loadValue;
              default:
                return loadSetting.get();
            }
          },
        };
      } else {
        return undefined;
      }
    }).filter(def => !!def) as UserSettingSaveManagerSettingDef<UserSettingValue>[];
  }
}
