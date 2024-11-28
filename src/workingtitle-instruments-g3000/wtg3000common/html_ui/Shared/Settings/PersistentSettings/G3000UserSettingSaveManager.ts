import { ArrayUtils, EventBus, UserSetting, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import {
  DateTimeUserSettings, NearestAirportUserSettings, TrafficUserSettings, TrafficUserSettingTypes, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from '../../AvionicsConfig/AvionicsConfig';
import { DisplayPaneIndex } from '../../Components/DisplayPanes/DisplayPaneTypes';
import { AuralAlertUserSettings } from '../AuralAlertSettings';
import { DisplayPanesUserSettings } from '../DisplayPanesUserSettings';
import { FmsSpeedUserSettingManager, FmsSpeedUserSettingTypes } from '../FmsSpeedUserSettings';
import { MapSettingSyncUserSettings } from '../MapSettingSyncUserSettings';
import { MapUserSettings } from '../MapUserSettings';
import { MfdNavDataBarUserSettings } from '../MfdNavDataBarUserSettings';
import { PfdAliasedUserSettingTypes, PfdUserSettings } from '../PfdUserSettings';
import { ToldUserSettings, ToldUserSettingTypes } from '../ToldUserSettings';
import { TouchdownCalloutUserSettings } from '../TouchdownCalloutSettings';
import { ConnextMapUserSettings, WeatherMapUserSettings } from '../WeatherMapUserSettings';
import { WeightBalanceUserSettingManager } from '../WeightBalanceUserSettings';
import { WeightFuelUserSettings, WeightFuelUserSettingTypes } from '../WeightFuelUserSettings';

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

  private static readonly WEIGHT_FUEL_NO_BALANCE_SETTINGS: (keyof WeightFuelUserSettingTypes)[] = [
    'weightFuelBasicEmpty',
    'weightFuelCrewStores',
    'weightFuelNumberPax',
    'weightFuelAvgPax',
    'weightFuelReserves',
    'weightFuelEstHoldingTime'
  ];

  private static readonly WEIGHT_FUEL_BALANCE_SETTINGS: (keyof WeightFuelUserSettingTypes)[] = [
    'weightFuelReserves',
    'weightFuelEstHoldingTime'
  ];

  private static readonly FMS_SPEED_EXCLUDE_SETTINGS: (keyof FmsSpeedUserSettingTypes)[] = [
    'fmsSpeedUserTargetIas',
    'fmsSpeedUserTargetMach',
    'fmsSpeedUserTargetIsMach'
  ];

  private static readonly WEIGHT_BALANCE_SETTINGS = [
    'weightBalanceLoadStationEmptyWeight',
    'weightBalanceLoadStationEmptyArm',
    'weightBalanceLoadStationLoadArm',
    'weightBalanceLoadStationEnabled'
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
   * @param weightBalanceSettingManager A setting manager for weight and balance user setting, or `undefined` if weight
   * and balance is not supported.
   */
  public constructor(
    bus: EventBus,
    config: AvionicsConfig,
    pluginSettings: Iterable<UserSetting<any>>,
    fmsSpeedSettingManager: FmsSpeedUserSettingManager | undefined,
    weightBalanceSettingManager: WeightBalanceUserSettingManager | undefined
  ) {
    // Don't persist the right PFD's split mode setting if the right PFD is not supported.
    const displayPaneSettings = config.gduDefs.pfdCount === 1
      ? [`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`]
      : [`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`, `displayPaneVisible_${DisplayPaneIndex.RightPfd}`];

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
        ...(
          config.performance.isWeightBalanceSupported
            ? WeightFuelUserSettings.getManager(bus).getAllSettings().filter(setting => {
              return ArrayUtils.includes(G3000UserSettingSaveManager.WEIGHT_FUEL_BALANCE_SETTINGS, setting.definition.name);
            })
            : WeightFuelUserSettings.getManager(bus).getAllSettings().filter(setting => {
              return ArrayUtils.includes(G3000UserSettingSaveManager.WEIGHT_FUEL_NO_BALANCE_SETTINGS, setting.definition.name);
            })
        ),
        ...DisplayPanesUserSettings.getMasterManager(bus).getAllSettings().filter(setting => {
          return ArrayUtils.includes(displayPaneSettings, setting.definition.name);
        }),
        ...(fmsSpeedSettingManager?.getAllSettings().filter(setting => {
          return !ArrayUtils.includes(G3000UserSettingSaveManager.FMS_SPEED_EXCLUDE_SETTINGS, setting.definition.name);
        }) ?? []),
        ...(weightBalanceSettingManager?.getAllSettings().filter(setting => {
          for (const settingToSaveName of G3000UserSettingSaveManager.WEIGHT_BALANCE_SETTINGS) {
            if (setting.definition.name.startsWith(settingToSaveName)) {
              return true;
            }
          }
          return false;
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
