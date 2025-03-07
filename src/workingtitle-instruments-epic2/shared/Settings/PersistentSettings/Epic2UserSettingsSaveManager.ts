import { EventBus, UserSettingManager, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import { CockpitUserSettings, RefsSettings } from '../CockpitUserSettings';
import { MfdAliasedUserSettingTypes } from '../MfdUserSettings';
import { NavComAllUserSettingTypes, NavComUserSettingManager } from '../NavComUserSettings';
import { PfdAliasedUserSettingTypes, PfdUserSettingManager } from '../PfdUserSettings';
import { UnitsUserSettings } from '../UnitsUserSettings';

/**
 * A manager for Epic2 user settings that are saved and persistent across flight sessions.
 */
export class Epic2UserSettingSaveManager extends UserSettingSaveManager {
  private static readonly COCKPIT_USER_SETTINGS: (keyof RefsSettings)[] = [
    'captureKeyboardInput'
  ];

  private static readonly MFD_USER_SETTINGS: (keyof MfdAliasedUserSettingTypes)[] = [
    'terminalAirspacesEnabled',
    'specialAirspacesEnabled',
    'constraintsEnabled',
    'boundariesEnabled',
    'majorRoadwaysEnabled',
    'minorRoadwaysEnabled',
    'citiesEnabled',
    'railwaysEnabled',
    'vfrRefPointsEnabled',
    'terrainEnabled',
    'saTerrainEnabled',
    'basicOperatingWeightLbs',
    'passengerWeightLbs',
    'cruiseSpeedKts',
    'cruiseSpeedMach'
  ];

  private static readonly NAV_COM_USER_SETTINGS: (keyof NavComAllUserSettingTypes)[] = [
    'vfrCode'
  ];

  private static readonly PFD_USER_SETTINGS: (keyof PfdAliasedUserSettingTypes)[] = [
    'windFormat',
    'headingFormat',
    'flightDirectorMode',
    'thrustDirectorEnabled',
    'fpsEnabled',
    'popupKeyboardEnabled',
    'popupKeyboardLayout',
    'hsiDisplayFormat',
    'hsiRange',
    'baroCorrectionUnit',
    'baroSynchEnabled'
  ];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param mfdUserSettings The mfd user settings
   * @param navComUserSettings The nav/com user settings
   * @param pfdUserSettings The PFD user settings
   */
  public constructor(
    bus: EventBus,
    mfdUserSettings: UserSettingManager<MfdAliasedUserSettingTypes>,
    navComUserSettings: NavComUserSettingManager,
    pfdUserSettings: PfdUserSettingManager,
  ) {
    super(
      [
        ...CockpitUserSettings.getManager(bus).getAllSettings().filter((setting => {
          return Epic2UserSettingSaveManager.COCKPIT_USER_SETTINGS.some(value => setting.definition.name.startsWith(value));
        })),
        ...mfdUserSettings.getAllSettings().filter((setting => {
          return Epic2UserSettingSaveManager.MFD_USER_SETTINGS.some(value => setting.definition.name.startsWith(value));
        })),
        ...navComUserSettings.getAllSettings().filter((setting => {
          return Epic2UserSettingSaveManager.NAV_COM_USER_SETTINGS.some(value => setting.definition.name.startsWith(value));
        })),
        ...pfdUserSettings.getAllSettings().filter((setting => {
          return Epic2UserSettingSaveManager.PFD_USER_SETTINGS.some(value => setting.definition.name.startsWith(value));
        })),
        ...UnitsUserSettings.getManager(bus).getAllSettings()
      ],
      bus
    );
  }
}
