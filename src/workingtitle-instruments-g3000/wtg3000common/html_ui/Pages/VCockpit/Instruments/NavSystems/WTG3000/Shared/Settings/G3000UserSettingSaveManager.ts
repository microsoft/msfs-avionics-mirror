import { ArrayUtils, EventBus, UserSetting, UserSettingSaveManager } from '@microsoft/msfs-sdk';
import { DateTimeUserSettings, NearestAirportUserSettings, TrafficUserSettings, TrafficUserSettingTypes, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { DisplayPanesUserSettings, DisplayPaneUserSettingTypes } from './DisplayPanesUserSettings';
import { MapSettingSyncUserSettings } from './MapSettingSyncUserSettings';
import { MapUserSettings } from './MapUserSettings';
import { MfdNavDataBarUserSettings } from './MfdNavDataBarUserSettings';
import { PfdAliasedUserSettingTypes, PfdUserSettings } from './PfdUserSettings';
import { ConnextMapUserSettings, WeatherMapUserSettings } from './WeatherMapUserSettings';
import { WeightFuelUserSettings, WeightFuelUserSettingTypes } from './WeightFuelUserSettings';
import { FmsSpeedUserSettingManager, FmsSpeedUserSettingTypes } from './FmsSpeedUserSettings';
import { ToldUserSettings, ToldUserSettingTypes } from './ToldUserSettings';
import { AuralAlertUserSettings } from './AuralAlertSettings';
import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { TouchdownCalloutUserSettings } from './TouchdownCalloutSettings';

/**
 * A manager for G3000 user settings that are saved and persistent across flight sessions.
 */
export class G3000UserSettingSaveManager extends UserSettingSaveManager {
  private static readonly PFD_SETTINGS: (keyof PfdAliasedUserSettingTypes)[] = [
    'flightDirectorFormat',
    'aoaDisplayMode',
    'windDisplayMode',
    'pfdMapLayout',
    'altMetric',
    'altimeterBaroMetric',
    'svtEnabled',
    'svtDisabledFpmShow',
    'svtHeadingLabelShow',
    // ---- The following settings are not currently used. ----
    // 'svtAirportSignShow',
    // 'svtPathwaysShow',
    // 'svtTrafficShow'
  ];

  private static readonly TRAFFIC_SETTINGS: (keyof TrafficUserSettingTypes)[] = [
    'trafficAltitudeMode',
    'trafficAltitudeRelative',
    'trafficMotionVectorMode',
    'trafficMotionVectorLookahead'
  ];

  private static readonly WEIGHT_FUEL_SETTINGS: (keyof WeightFuelUserSettingTypes)[] = [
    'weightFuelBasicEmpty',
    'weightFuelCrewStores',
    'weightFuelNumberPax',
    'weightFuelAvgPax',
    'weightFuelReserves',
    'weightFuelEstHoldingTime'
  ];

  private static readonly DISPLAY_PANE_SETTINGS: (keyof DisplayPaneUserSettingTypes<DisplayPaneIndex>)[] = [
    `displayPaneVisible_${DisplayPaneIndex.LeftPfd}`,
    `displayPaneVisible_${DisplayPaneIndex.RightPfd}`
  ];

  private static readonly FMS_SPEED_EXCLUDE_SETTINGS: (keyof FmsSpeedUserSettingTypes)[] = [
    'fmsSpeedUserTargetIas',
    'fmsSpeedUserTargetMach',
    'fmsSpeedUserTargetIsMach'
  ];

  private static readonly TOLD_SETTINGS: (keyof ToldUserSettingTypes)[] = [
    'toldTakeoffFlapsIndexDefault',
    'toldTakeoffRollingDefault',
    'toldLandingFlapsIndexDefault',
    'toldLandingFactorDefault'
  ];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param config A configuration object defining avionics options.
   * @param pluginSettings Additional settings to manage defined by plugins.
   * @param fmsSpeedSettingManager A setting manager for FMS speed user settings, or `undefined` if FMS speed is not
   * supported.
   */
  public constructor(
    bus: EventBus,
    config: AvionicsConfig,
    pluginSettings: Iterable<UserSetting<any>>,
    fmsSpeedSettingManager: FmsSpeedUserSettingManager | undefined,
  ) {
    super(
      [
        ...PfdUserSettings.getMasterManager(bus).getAllSettings().filter(setting => {
          return G3000UserSettingSaveManager.PFD_SETTINGS.some(value => setting.definition.name.startsWith(value));
        }),
        ...MapUserSettings.getMasterManager(bus).getAllSettings().filter(setting => {
          return !setting.definition.name.startsWith('mapGroundNorthUpActive');
        }),
        ...MapSettingSyncUserSettings.getManager(bus).getAllSettings(),
        ...WeatherMapUserSettings.getMasterManager(bus).getAllSettings(),
        ...ConnextMapUserSettings.getMasterManager(bus).getAllSettings(),
        ...TrafficUserSettings.getManager(bus).getAllSettings().filter(setting => {
          return ArrayUtils.includes(G3000UserSettingSaveManager.TRAFFIC_SETTINGS, setting.definition.name);
        }),
        ...MfdNavDataBarUserSettings.getManager(bus).getAllSettings(),
        ...DateTimeUserSettings.getManager(bus).getAllSettings(),
        ...NearestAirportUserSettings.getManager(bus).getAllSettings(),
        ...UnitsUserSettings.getManager(bus).getAllSettings(),
        ...WeightFuelUserSettings.getManager(bus).getAllSettings().filter(setting => {
          return ArrayUtils.includes(G3000UserSettingSaveManager.WEIGHT_FUEL_SETTINGS, setting.definition.name);
        }),
        ...DisplayPanesUserSettings.getMasterManager(bus).getAllSettings().filter(setting => {
          return ArrayUtils.includes(G3000UserSettingSaveManager.DISPLAY_PANE_SETTINGS, setting.definition.name);
        }),
        ...(fmsSpeedSettingManager?.getAllSettings().filter(setting => {
          return !ArrayUtils.includes(G3000UserSettingSaveManager.FMS_SPEED_EXCLUDE_SETTINGS, setting.definition.name);
        }) ?? []),
        ...(
          config.performance.isToldSupported
            ? ToldUserSettings.getManager(bus).getAllSettings().filter(setting => {
              return ArrayUtils.includes(G3000UserSettingSaveManager.TOLD_SETTINGS, setting.definition.name);
            })
            : []
        ),
        ...(
          config.auralAlerts.supportedVoices === 'both'
            ? [AuralAlertUserSettings.getManager(bus).getSetting('auralAlertVoice')]
            : []
        ),
        ...(
          config.terrain.touchdownCallouts?.isUserConfigurable
            ? [
              TouchdownCalloutUserSettings.getManager(bus).getSetting('touchdownCalloutMasterEnabled'),
              ...Object.values(config.terrain.touchdownCallouts.options).filter(options => options.userConfigurable).map(options => {
                return TouchdownCalloutUserSettings.getManager(bus).getEnabledSetting(options.altitude);
              })
            ]
            : []
        ),
        ...pluginSettings
      ],
      bus
    );
  }
}