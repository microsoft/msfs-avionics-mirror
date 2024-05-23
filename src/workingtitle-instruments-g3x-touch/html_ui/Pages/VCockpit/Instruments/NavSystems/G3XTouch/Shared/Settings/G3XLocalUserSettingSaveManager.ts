import { EventBus, UserSetting, UserSettingManager, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import { BacklightUserSettingTypes } from './BacklightUserSettings';
import { CnsDataBarUserSettingTypes } from './CnsDataBarUserSettings';
import { FplDisplayUserSettingTypes } from './FplDisplayUserSettings';
import { G3XMapTrueUserSettingTypes, G3XMapUserSettingTypes } from './MapUserSettings';

/**
 * Sources of settings to be managed by {@link G3XLocalUserSettingSaveManager}.
 */
export type G3XLocalUserSettingSaveManagerSources = {
  /** A manager for backlight user settings. */
  backlightSettingManager: UserSettingManager<BacklightUserSettingTypes>;

  /** A manager for CNS data bar user settings. */
  cnsDataBarSettingManager: UserSettingManager<CnsDataBarUserSettingTypes>;

  /** A manager for map user settings. */
  mapSettingManager: UserSettingManager<G3XMapTrueUserSettingTypes>;

  /** A manager for flight plan display user settings. */
  fplDisplaySettingManager: UserSettingManager<FplDisplayUserSettingTypes>;

  /** Additional settings to manage defined by plugins. */
  pluginSettings: Iterable<UserSetting<any>>;
};

/**
 * A manager for instrument-local G3X Touch user settings that are saved and persistent across flight sessions.
 */
export class G3XLocalUserSettingSaveManager extends UserSettingSaveManager {
  private static readonly BACKLIGHT_SETTINGS: (keyof BacklightUserSettingTypes)[] = [
    'displayBacklightMode'
  ];

  private static readonly MAP_EXCLUDED_SETTINGS: (keyof G3XMapUserSettingTypes)[] = [
    'mapRangeIndex',
    'mapAutoNorthUpActive',
    'mapTerrainRangeIndex',
    'mapTerrainScaleShow',
    'mapNexradRangeIndex',
    'mapAirportLargeShow',
    'mapAirportMediumShow',
    'mapAirportSmallShow',
    'mapVorShow',
    'mapNdbShow',
    'mapIntersectionShow',
    'mapUserWaypointShow',
    'mapAirspaceClassBShow',
    'mapAirspaceClassCShow',
    'mapAirspaceClassDShow',
    'mapAirspaceRestrictedShow',
    'mapAirspaceMoaShow',
    'mapAirspaceOtherShow',
  ];

  /**
   * Creates a new instance of G3XLocalUserSettingSaveManager.
   * @param bus The event bus.
   * @param sources Sources of settings to be managed.
   */
  public constructor(
    bus: EventBus,
    sources: Readonly<G3XLocalUserSettingSaveManagerSources>
  ) {
    super(
      [
        ...sources.backlightSettingManager.getAllSettings().filter(setting => {
          return G3XLocalUserSettingSaveManager.BACKLIGHT_SETTINGS.some(value => setting.definition.name.startsWith(value));
        }),
        ...sources.cnsDataBarSettingManager.getAllSettings(),
        ...sources.mapSettingManager.getAllSettings().filter(setting => {
          return !G3XLocalUserSettingSaveManager.MAP_EXCLUDED_SETTINGS.some(value => setting.definition.name.startsWith(value));
        }),
        ...sources.fplDisplaySettingManager.getAllSettings(),
        ...sources.pluginSettings
      ],
      bus
    );
  }
}
