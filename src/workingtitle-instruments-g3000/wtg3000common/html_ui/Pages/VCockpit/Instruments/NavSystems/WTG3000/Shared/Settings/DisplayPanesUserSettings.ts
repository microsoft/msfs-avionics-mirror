import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { DisplayPaneControlGtcIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { DisplayPaneViewKeys } from '../Components/DisplayPanes/DisplayPaneViewKeys';

/** The index of the controlling GTC or -1 if nothing is controlling it. */
export type DisplayPaneController = -1 | DisplayPaneControlGtcIndex;

/** Generates the UserSettingDefinition type based on the settings object */
export type DisplayPaneSettings = {
  /** Whether a display pane is visible. */
  displayPaneVisible: boolean;

  /** The key of the view currently displayed by the display pane. */
  displayPaneView: string;

  /** The key of the display pane's designated view. */
  displayPaneDesignatedView: string;

  /** The key of the display pane's designated weather view. */
  displayPaneDesignatedWeatherView: string;

  /** The index of the GTC currently controlling the display pane, or `-1` if no GTC is controlling the pane. */
  displayPaneController: DisplayPaneController;

  /** Whether the view currently displayed by the display pane only supports half-size mode. */
  displayPaneHalfSizeOnly: boolean;

  /** Whether the map pointer is active for the display pane. */
  displayPaneMapPointerActive: boolean;
};

/** All possible display pane settings values. */
export type DisplayPaneSettingsValues = DisplayPaneSettings[keyof DisplayPaneSettings];

/**
 * True settings for display pane maps.
 */
export type DisplayPaneUserSettingTypes<Index extends DisplayPaneIndex> = {
  [Name in keyof DisplayPaneSettings as `${Name}_${Index}`]: DisplayPaneSettings[Name];
};

/**
 * All true display pane settings.
 */
export type DisplayPaneAllUserSettingTypes
  = DisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfdInstrument>
  & DisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & DisplayPaneUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & DisplayPaneUserSettingTypes<DisplayPaneIndex.RightMfd>
  & DisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfd>
  & DisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfdInstrument>;

/**
 * Utility class for retrieving G3000 display pane setting managers.
 */
export class DisplayPanesUserSettings {
  private static readonly ALIASED_SETTING_NAMES = [
    'displayPaneVisible',
    'displayPaneView',
    'displayPaneDesignatedView',
    'displayPaneDesignatedWeatherView',
    'displayPaneController',
    'displayPaneHalfSizeOnly',
    'displayPaneMapPointerActive'
  ] as (keyof DisplayPaneSettings)[];

  private static masterInstance?: UserSettingManager<DisplayPaneAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<DisplayPaneSettings>[] = [];

  /**
   * Retrieves a manager for all true map settings.
   * @param bus The event bus.
   * @returns A manager for all true map settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<DisplayPaneAllUserSettingTypes> {
    return DisplayPanesUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfdInstrument),
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd),
      ...DisplayPanesUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfdInstrument),
    ]);
  }

  /**
   * Retrieves a manager for aliased map settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased map settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: DisplayPaneIndex): UserSettingManager<DisplayPaneSettings> {
    return DisplayPanesUserSettings.displayPaneInstances[index] ??= DisplayPanesUserSettings.getMasterManager(bus).mapTo(
      DisplayPanesUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Gets an array of definitions for true map settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true map settings for the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<DisplayPaneSettingsValues>[] {
    let isVisible: boolean;
    let view: string;
    let designatedView: string;
    let designatedWeatherView: string;

    switch (index) {
      case DisplayPaneIndex.LeftPfdInstrument:
      case DisplayPaneIndex.RightPfdInstrument:
        isVisible = true;
        view = DisplayPaneViewKeys.PfdInstrument;
        designatedView = DisplayPaneViewKeys.PfdInstrument;
        designatedWeatherView = DisplayPaneViewKeys.WeatherMap;
        break;
      case DisplayPaneIndex.LeftPfd:
      case DisplayPaneIndex.RightPfd:
        isVisible = false;
        view = DisplayPaneViewKeys.NavigationMap;
        designatedView = DisplayPaneViewKeys.NavigationMap;
        designatedWeatherView = DisplayPaneViewKeys.WeatherMap;
        break;
      case DisplayPaneIndex.LeftMfd:
      case DisplayPaneIndex.RightMfd:
        isVisible = true;
        view = DisplayPaneViewKeys.NavigationMap;
        designatedView = DisplayPaneViewKeys.NavigationMap;
        designatedWeatherView = DisplayPaneViewKeys.WeatherMap;
        break;
    }

    return [
      {
        name: `displayPaneVisible_${index}`,
        defaultValue: isVisible
      },
      {
        name: `displayPaneView_${index}`,
        defaultValue: view
      },
      {
        name: `displayPaneDesignatedView_${index}`,
        defaultValue: designatedView
      },
      {
        name: `displayPaneDesignatedWeatherView_${index}`,
        defaultValue: designatedWeatherView
      },
      {
        name: `displayPaneController_${index}`,
        defaultValue: -1,
      },
      {
        name: `displayPaneHalfSizeOnly_${index}`,
        defaultValue: false,
      },
      {
        name: `displayPaneMapPointerActive_${index}`,
        defaultValue: false
      }
    ];
  }

  /**
   * Gets a setting name alias mapping for a display pane.
   * @param index The index of the display pane.
   * @returns A setting name alias mapping for the specified display pane.
   */
  private static getDisplayPaneAliasMap<Index extends DisplayPaneIndex>(
    index: Index
  ): UserSettingMap<DisplayPaneSettings, DisplayPaneUserSettingTypes<Index>> {
    const map: UserSettingMap<DisplayPaneSettings, DisplayPaneUserSettingTypes<Index>> = {};

    for (const name of DisplayPanesUserSettings.ALIASED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}
