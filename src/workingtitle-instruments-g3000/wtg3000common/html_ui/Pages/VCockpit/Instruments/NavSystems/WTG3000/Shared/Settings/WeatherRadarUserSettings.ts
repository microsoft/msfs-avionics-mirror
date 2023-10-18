import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';
import { WeatherRadarOperatingMode, WeatherRadarScanMode, WeatherRadarUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';

/**
 * Aliased names of weather radar settings that are display pane-specific.
 */
type WeatherRadarIndexedUserSettingNames = Exclude<keyof WeatherRadarUserSettingTypes, 'wxrActive'>;

/**
 * True display pane-specific weather radar settings.
 */
export type WeatherRadarDisplayPaneUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in WeatherRadarIndexedUserSettingNames as `${Name}_${Index}`]: WeatherRadarUserSettingTypes[Name];
};

/**
 * All true weather radar settings.
 */
export type WeatherRadarAllUserSettingTypes
  = Pick<WeatherRadarUserSettingTypes, 'wxrActive'>
  & WeatherRadarDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & WeatherRadarDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & WeatherRadarDisplayPaneUserSettingTypes<DisplayPaneIndex.RightMfd>
  & WeatherRadarDisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfd>;

/**
 * Utility class for retrieving G3000 weather radar user setting managers.
 */
export class WeatherRadarUserSettings {
  private static readonly INDEXED_SETTING_NAMES = [
    'wxrOperatingMode',
    'wxrScanMode',
    'wxrRangeIndex',
    'wxrShowBearingLine',
    'wxrShowTiltLine',
    'wxrCalibratedGain',
    'wxrGain'
  ] as readonly WeatherRadarIndexedUserSettingNames[];

  private static masterInstance?: UserSettingManager<WeatherRadarAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<WeatherRadarUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true weather radar settings.
   * @param bus The event bus.
   * @returns A manager for all true weather radar settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<WeatherRadarAllUserSettingTypes> {
    return WeatherRadarUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      { name: 'wxrActive', defaultValue: false },
      ...WeatherRadarUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...WeatherRadarUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...WeatherRadarUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...WeatherRadarUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd)
    ]);
  }

  /**
   * Retrieves a manager for aliased weather radar settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased weather radar settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<WeatherRadarUserSettingTypes> {
    return WeatherRadarUserSettings.displayPaneInstances[index] ??= WeatherRadarUserSettings.getMasterManager(bus).mapTo(
      WeatherRadarUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Gets the default values for a full set of aliased display pane-specific weather radar settings.
   * @returns The default values for a full set of aliased display pane-specific weather radar settings.
   */
  private static getDisplayPaneDefaultValues(): Pick<WeatherRadarUserSettingTypes, WeatherRadarIndexedUserSettingNames> {
    return {
      ['wxrOperatingMode']: WeatherRadarOperatingMode.Standby,
      ['wxrScanMode']: WeatherRadarScanMode.Horizontal,
      ['wxrRangeIndex']: 1, // 20 NM
      ['wxrShowBearingLine']: false,
      ['wxrShowTiltLine']: false,
      ['wxrCalibratedGain']: true,
      ['wxrGain']: 0
    };
  }

  /**
   * Gets an array of definitions for true weather radar settings specific to a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true weather radar settings specific to the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<
    WeatherRadarDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>[keyof WeatherRadarDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>]
  >[] {
    const values = WeatherRadarUserSettings.getDisplayPaneDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping for a display pane.
   * @param index The index of the display pane.
   * @returns A setting name alias mapping for the specified display pane.
   */
  private static getDisplayPaneAliasMap<Index extends ControllableDisplayPaneIndex>(
    index: Index
  ): UserSettingMap<WeatherRadarUserSettingTypes, WeatherRadarDisplayPaneUserSettingTypes<Index>> {
    const map: UserSettingMap<WeatherRadarUserSettingTypes, WeatherRadarDisplayPaneUserSettingTypes<Index>> = {};

    for (const name of WeatherRadarUserSettings.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}