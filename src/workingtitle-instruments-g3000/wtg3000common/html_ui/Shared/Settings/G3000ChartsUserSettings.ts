import {
  DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap
} from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';

/**
 * G3000 electronic charts display light modes.
 */
export enum G3000ChartsLightModeSettingMode {
  Day = 'Day',
  Night = 'Night',
  Auto = 'Auto',
}

/**
 * Aliased G3000 electronic charts user settings.
 */
export type G3000ChartsUserSettingTypes = {
  /** The unique ID (UID) of the preferred charts source. */
  chartsPreferredSource: string;

  /** The charts display light mode. */
  chartsLightMode: G3000ChartsLightModeSettingMode;

  /**
   * The screen backlight intensity threshold, in percent, at which to switch between day and night mode charts when
   * the charts display light mode is set to Auto.
   */
  chartsLightThreshold: number;
};

/**
 * Names of all indexed G3000 electronic charts user settings.
 */
type IndexedSettingNames = 'chartsLightMode' | 'chartsLightThreshold';

/**
 * Aliased indexed G3000 electronic charts user settings.
 */
type IndexedUserSettingTypes = Pick<G3000ChartsUserSettingTypes, IndexedSettingNames>;

/**
 * Aliased non-indexed G3000 electronic charts user settings.
 */
type NonIndexedUserSettingTypes = Omit<G3000ChartsUserSettingTypes, IndexedSettingNames>;

/**
 * True indexed G3000 electronic charts user settings for a display pane.
 */
export type G3000ChartsIndexedUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in keyof IndexedUserSettingTypes as `${Name}_${Index}`]: G3000ChartsUserSettingTypes[Name];
};

/**
 * All true G3000 electronic charts user settings.
 */
export type G3000ChartsAllUserSettingTypes = NonIndexedUserSettingTypes & G3000ChartsIndexedUserSettingTypes<ControllableDisplayPaneIndex>;

/**
 * A utility class for retrieving G3000 electronic charts setting managers.
 */
export class G3000ChartsUserSettings {
  private static readonly ALIASED_INDEXED_SETTING_NAMES: IndexedSettingNames[] = [
    'chartsLightMode',
    'chartsLightThreshold',
  ];

  private static masterInstance?: UserSettingManager<G3000ChartsAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<G3000ChartsUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true electronic charts settings.
   * @param bus The event bus.
   * @returns A manager for all true electronic charts settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<G3000ChartsAllUserSettingTypes> {
    return G3000ChartsUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...G3000ChartsUserSettings.getNonIndexedSettingDefs(),
      ...G3000ChartsUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...G3000ChartsUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...G3000ChartsUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...G3000ChartsUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd),
    ]);
  }

  /**
   * Retrieves a manager for aliased electronic charts settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased electronic charts settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<G3000ChartsUserSettingTypes> {
    return G3000ChartsUserSettings.displayPaneInstances[index] ??= G3000ChartsUserSettings.getMasterManager(bus).mapTo(
      G3000ChartsUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Gets an array of definitions for true non-indexed electronic charts settings.
   * @returns An array of definitions for true non-indexed electronic charts settings.
   */
  private static getNonIndexedSettingDefs(
  ): readonly UserSettingDefinition<G3000ChartsUserSettingTypes[keyof G3000ChartsUserSettingTypes]>[] {
    return [
      {
        name: 'chartsPreferredSource',
        defaultValue: ''
      },
    ];
  }

  /**
   * Gets an array of definitions for true electronic charts settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true electronic charts settings for the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: ControllableDisplayPaneIndex
  ): readonly UserSettingDefinition<G3000ChartsUserSettingTypes[keyof G3000ChartsUserSettingTypes]>[] {
    return [
      {
        name: `chartsLightMode_${index}`,
        defaultValue: G3000ChartsLightModeSettingMode.Day
      },
      {
        name: `chartsLightThreshold_${index}`,
        defaultValue: 50
      },
    ];
  }

  /**
   * Gets a setting name alias mapping for a display pane.
   * @param index The index of the display pane.
   * @returns A setting name alias mapping for the specified display pane.
   */
  private static getDisplayPaneAliasMap<Index extends ControllableDisplayPaneIndex>(
    index: Index
  ): UserSettingMap<G3000ChartsUserSettingTypes, G3000ChartsIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<G3000ChartsUserSettingTypes, G3000ChartsIndexedUserSettingTypes<Index>> = {};

    for (const name of G3000ChartsUserSettings.ALIASED_INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}` as const;
    }

    return map;
  }
}
