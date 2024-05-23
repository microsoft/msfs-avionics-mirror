import { EventBus, UserSetting, UserSettingManager, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import { DateTimeUserSettingTypes, TrafficUserSettingTypes } from '@microsoft/msfs-garminsdk';

import { DisplayAllUserSettingTypes } from './DisplayUserSettings';
import { FplCalculationUserSettingTypes } from './FplCalculationUserSettings';
import { PfdAllUserSettingTypes, PfdUserSettingTypes } from './PfdUserSettings';
import { G3XUnitsUserSettingTypes } from './G3XUnitsUserSettings';

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
   */
  public constructor(
    bus: EventBus,
    inputs: Readonly<G3XGlobalUserSettingSaveManagerSources>
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
        ...inputs.unitsSettingManager.getAllSettings(),
        ...inputs.pluginSettings
      ],
      bus
    );
  }
}
