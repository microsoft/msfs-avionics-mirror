import { ArrayUtils, DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { TrafficAltitudeModeSetting, TrafficMotionVectorModeSetting, TrafficOperatingModeSetting, TrafficUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * Aliased names of G3X Touch traffic user settings with non-suffixed names.
 */
type NonSuffixedTrafficUserSettingNames = 'trafficOperatingMode' | 'trafficAdsbEnabled';

/**
 * Aliased G3X Touch traffic user settings with non-suffixed names.
 */
type NonSuffixedTrafficUserSettingTypes = Pick<TrafficUserSettingTypes, NonSuffixedTrafficUserSettingNames>

/**
 * Aliased G3X Touch traffic user settings with G3X-suffixed names.
 */
type SuffixedTrafficUserSettingTypes = Omit<TrafficUserSettingTypes, NonSuffixedTrafficUserSettingNames>;

/**
 * True G3X Touch traffic user settings.
 */
export type G3XTrafficTrueUserSettingTypes = NonSuffixedTrafficUserSettingTypes & {
  [P in keyof SuffixedTrafficUserSettingTypes as `${P}_g3x`]: SuffixedTrafficUserSettingTypes[P];
};

/**
 * Utility class for retrieving G3X Touch traffic user setting managers.
 */
export class G3XTrafficUserSettings {
  private static readonly NON_SUFFIXED_NAMES: NonSuffixedTrafficUserSettingNames[] = [
    'trafficOperatingMode',
    'trafficAdsbEnabled'
  ];

  private static INSTANCE: UserSettingManager<TrafficUserSettingTypes> | undefined;

  /**
   * Gets an instance of the traffic user settings manager.
   * @param bus The event bus.
   * @returns An instance of the traffic user settings manager.
   */
  public static getManager(bus: EventBus): UserSettingManager<TrafficUserSettingTypes> {
    return G3XTrafficUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      G3XTrafficUserSettings.getSettingDefs()
    ).mapTo(G3XTrafficUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased traffic user settings.
   * @returns The default values for a full set of aliased traffic user settings.
   */
  private static getDefaultValues(): TrafficUserSettingTypes {
    return {
      ['trafficOperatingMode']: TrafficOperatingModeSetting.Standby,
      ['trafficAdsbEnabled']: true,
      ['trafficAltitudeMode']: TrafficAltitudeModeSetting.Unrestricted,
      ['trafficAltitudeRelative']: true,
      ['trafficMotionVectorMode']: TrafficMotionVectorModeSetting.Off,
      ['trafficMotionVectorLookahead']: 60
    };
  }

  /**
   * Gets an array of definitions for true traffic user settings.
   * @returns An array of definitions for true traffic user settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<TrafficUserSettingTypes[keyof TrafficUserSettingTypes]>[] {
    const values = G3XTrafficUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: ArrayUtils.includes(G3XTrafficUserSettings.NON_SUFFIXED_NAMES, name) ? name : `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true traffic settings.
   * @returns A setting name alias mapping from aliased to true traffic settings.
   */
  private static getAliasMap(): UserSettingMap<TrafficUserSettingTypes, G3XTrafficTrueUserSettingTypes> {
    const map: UserSettingMap<TrafficUserSettingTypes, G3XTrafficTrueUserSettingTypes> = {};

    for (const name of Object.keys(G3XTrafficUserSettings.getDefaultValues()) as (keyof TrafficUserSettingTypes)[]) {
      if (!ArrayUtils.includes(G3XTrafficUserSettings.NON_SUFFIXED_NAMES, name)) {
        map[name] = `${name}_g3x`;
      }
    }

    return map;
  }
}
