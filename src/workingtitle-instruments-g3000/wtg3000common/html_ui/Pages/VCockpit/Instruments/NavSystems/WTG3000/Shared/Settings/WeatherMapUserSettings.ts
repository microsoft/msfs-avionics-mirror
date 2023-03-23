import {
  Consumer, DefaultUserSettingManager, EventBus, MappedUserSettingManager, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import {
  ConnextMapUserSettingTypes, MapUserSettingsUtils, MapUserSettingTypes, WeatherMapOrientationSettingMode,
  WeatherMapUserSettingsUtils, WeatherMapUserSettingTypes
} from '@microsoft/msfs-garminsdk';

import { ControllableDisplayPaneIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { MapUserSettings } from './MapUserSettings';

/**
 * True weather map settings for an indexed controllable display pane.
 */
export type WeatherMapDisplayPaneUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in keyof WeatherMapUserSettingTypes as `${Name}_${Index}`]: WeatherMapUserSettingTypes[Name];
};

/**
 * All true weather map settings.
 */
export type WeatherMapAllUserSettingTypes
  = WeatherMapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & WeatherMapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & WeatherMapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightMfd>
  & WeatherMapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfd>

/**
 * Utility class for retrieving G3000 weather map user setting managers.
 */
export class WeatherMapUserSettings {
  private static masterInstance?: UserSettingManager<WeatherMapAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<WeatherMapUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true weather map settings.
   * @param bus The event bus.
   * @returns A manager for all true weather map settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<WeatherMapAllUserSettingTypes> {
    return WeatherMapUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...WeatherMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...WeatherMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...WeatherMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...WeatherMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd)
    ]);
  }

  /**
   * Retrieves a manager for aliased weather map settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased weather map settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<WeatherMapUserSettingTypes> {
    return WeatherMapUserSettings.displayPaneInstances[index] ??= WeatherMapUserSettings.getMasterManager(bus).mapTo(
      WeatherMapUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Gets the default values for a full set of aliased weather map settings.
   * @returns The default values for a full set of aliased weather map settings.
   */
  public static getDefaultValues(): WeatherMapUserSettingTypes {
    return {
      ['weatherMapRangeIndex']: 11, // 2.5 NM/5 km
      ['weatherMapOrientation']: WeatherMapOrientationSettingMode.HeadingUp,
    };
  }

  /**
   * Gets an array of definitions for true map settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true map settings for the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<
    WeatherMapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>[keyof WeatherMapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>]
  >[] {
    const values = WeatherMapUserSettings.getDefaultValues();
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
  ): UserSettingMap<WeatherMapUserSettingTypes, WeatherMapDisplayPaneUserSettingTypes<Index>> {
    const map: UserSettingMap<WeatherMapUserSettingTypes, WeatherMapDisplayPaneUserSettingTypes<Index>> = {};

    for (const name of WeatherMapUserSettingsUtils.SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}

/**
 * Names of combined Connext weather map user settings that delegate to another user setting.
 */
export type ConnextMapDelegatedUserSettingNames = 'mapRangeIndex' | 'mapNexradShow' | 'mapNexradRangeIndex';

/**
 * Combined Connext weather map, weather map, and general map user settings.
 */
export type ConnextMapCombinedUserSettingTypes = MapUserSettingTypes & WeatherMapUserSettingTypes & ConnextMapUserSettingTypes;

/**
 * True Connext weather map settings for an indexed controllable display pane.
 */
export type ConnextMapDisplayPaneUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in keyof ConnextMapUserSettingTypes as `${Name}_${Index}`]: ConnextMapUserSettingTypes[Name];
};

/**
 * All true Connext weather map settings.
 */
export type ConnextMapAllUserSettingTypes
  = ConnextMapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & ConnextMapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & ConnextMapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightMfd>
  & ConnextMapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfd>

/**
 * Utility class for retrieving G3000 Connext weather map user setting managers.
 */
export class ConnextMapUserSettings {
  private static masterInstance?: UserSettingManager<ConnextMapAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<ConnextMapUserSettingTypes>[] = [];
  private static readonly displayPaneCombinedInstances: UserSettingManager<ConnextMapCombinedUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true Connext weather map settings.
   * @param bus The event bus.
   * @returns A manager for all true Connext weather map settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<ConnextMapAllUserSettingTypes> {
    return ConnextMapUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...ConnextMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...ConnextMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...ConnextMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...ConnextMapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd)
    ]);
  }

  /**
   * Retrieves a manager for aliased Connext weather map settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased Connext weather map settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<ConnextMapUserSettingTypes> {
    return ConnextMapUserSettings.displayPaneInstances[index] ??= ConnextMapUserSettings.getMasterManager(bus).mapTo(
      ConnextMapUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Retrieves a manager for aliased combined Connext weather map settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased combined Connext weather map settings for the specified display pane.
   */
  public static getDisplayPaneCombinedManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<ConnextMapCombinedUserSettingTypes> {
    return ConnextMapUserSettings.displayPaneCombinedInstances[index] ??= new ConnextMapCombinedSettingManager(
      MapUserSettings.getDisplayPaneManager(bus, index),
      WeatherMapUserSettings.getDisplayPaneManager(bus, index),
      ConnextMapUserSettings.getDisplayPaneManager(bus, index)
    ).mapTo(ConnextMapUserSettings.getCombinedAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased Connext weather map settings.
   * @returns The default values for a full set of aliased Connext weather map settings.
   */
  private static getDefaultValues(): ConnextMapUserSettingTypes {
    return {
      ['connextMapRadarOverlayShow']: true,
      ['connextMapRadarOverlayRangeIndex']: 27 // 1000 NM/2000 km
    };
  }

  /**
   * Gets an array of definitions for true map settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true map settings for the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<
    ConnextMapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>[keyof ConnextMapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>]
  >[] {
    const values = ConnextMapUserSettings.getDefaultValues();
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
  ): UserSettingMap<ConnextMapUserSettingTypes, ConnextMapDisplayPaneUserSettingTypes<Index>> {
    const map: UserSettingMap<ConnextMapUserSettingTypes, ConnextMapDisplayPaneUserSettingTypes<Index>> = {};

    for (const name of WeatherMapUserSettingsUtils.CONNEXT_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }

  /**
   * Gets a combined setting name alias mapping.
   * @returns A combined setting name alias mapping.
   */
  private static getCombinedAliasMap(): UserSettingMap<ConnextMapCombinedUserSettingTypes, ConnextMapCombinedUserSettingTypes> {
    const map: UserSettingMap<ConnextMapCombinedUserSettingTypes, ConnextMapCombinedUserSettingTypes> = {};

    for (const name in G3000WeatherMapUserSettingsUtils.CONNEXT_DELEGATE_MAP) {
      map[name as ConnextMapDelegatedUserSettingNames] = G3000WeatherMapUserSettingsUtils.CONNEXT_DELEGATE_MAP[name as ConnextMapDelegatedUserSettingNames];
    }

    return map;
  }
}

/**
 * A utility class for working with G3000 weather map user settings.
 */
export class G3000WeatherMapUserSettingsUtils {
  /** An array of all G3000 combined Connext weather map user setting names. */
  public static readonly CONNEXT_COMBINED_SETTING_NAMES: readonly (keyof ConnextMapCombinedUserSettingTypes)[] = [
    ...MapUserSettingsUtils.SETTING_NAMES,
    'weatherMapRangeIndex',
    'weatherMapOrientation',
    'connextMapRadarOverlayShow',
    'connextMapRadarOverlayRangeIndex'
  ];

  /** A mapping of delegated Connext weather map user settings to the user setting to which each is delegated. */
  public static readonly CONNEXT_DELEGATE_MAP: Record<ConnextMapDelegatedUserSettingNames, keyof ConnextMapCombinedUserSettingTypes> = {
    'mapRangeIndex': 'weatherMapRangeIndex',
    'mapNexradShow': 'connextMapRadarOverlayShow',
    'mapNexradRangeIndex': 'connextMapRadarOverlayRangeIndex',
  };
}

/**
 * A manager for combined Connext weather map, weather map, and general map user settings.
 */
class ConnextMapCombinedSettingManager implements UserSettingManager<ConnextMapCombinedUserSettingTypes> {
  /**
   * Constructor.
   * @param mapSettingManager A manager for the general map user settings used by this combined manager.
   * @param weatherMapSettingManager A manager for the weather map user settings used by this combined manager.
   * @param connextMapSettingManager A manager for the Connext weather map user settings used by this combined manager.
   */
  public constructor(
    private readonly mapSettingManager: UserSettingManager<MapUserSettingTypes>,
    private readonly weatherMapSettingManager: UserSettingManager<WeatherMapUserSettingTypes>,
    private readonly connextMapSettingManager: UserSettingManager<ConnextMapUserSettingTypes>
  ) {
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof ConnextMapCombinedUserSettingTypes ? UserSetting<ConnextMapCombinedUserSettingTypes[K]> : undefined {
    return this.mapSettingManager.tryGetSetting(name)
      ?? this.weatherMapSettingManager.tryGetSetting(name)
      ?? this.connextMapSettingManager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof ConnextMapCombinedUserSettingTypes & string>(name: K): UserSetting<NonNullable<ConnextMapCombinedUserSettingTypes[K]>> {
    const setting = this.tryGetSetting(name);
    if (!setting) {
      throw new Error(`ConnextMapCombinedSettingManager: Could not find setting with name ${name}`);
    }

    return setting as UserSetting<NonNullable<ConnextMapCombinedUserSettingTypes[K]>>;
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof ConnextMapCombinedUserSettingTypes & string>(name: K): Consumer<NonNullable<ConnextMapCombinedUserSettingTypes[K]>> {
    if (this.mapSettingManager.tryGetSetting(name)) {
      return this.mapSettingManager.whenSettingChanged(name as keyof MapUserSettingTypes) as Consumer<NonNullable<ConnextMapCombinedUserSettingTypes[K]>>;
    }
    if (this.weatherMapSettingManager.tryGetSetting(name)) {
      return this.weatherMapSettingManager.whenSettingChanged(name as keyof WeatherMapUserSettingTypes) as Consumer<NonNullable<ConnextMapCombinedUserSettingTypes[K]>>;
    }
    if (this.connextMapSettingManager.tryGetSetting(name)) {
      return this.connextMapSettingManager.whenSettingChanged(name as keyof ConnextMapUserSettingTypes) as Consumer<NonNullable<ConnextMapCombinedUserSettingTypes[K]>>;
    }

    throw new Error(`ConnextMapCombinedSettingManager: Could not find setting with name ${name}`);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return [
      ...this.mapSettingManager.getAllSettings(),
      ...this.weatherMapSettingManager.getAllSettings(),
      ...this.connextMapSettingManager.getAllSettings()
    ];
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, ConnextMapCombinedUserSettingTypes>): UserSettingManager<M & ConnextMapCombinedUserSettingTypes> {
    return new MappedUserSettingManager(this, map);
  }
}