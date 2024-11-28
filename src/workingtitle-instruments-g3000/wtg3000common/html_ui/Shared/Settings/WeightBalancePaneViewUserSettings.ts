import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { WeightBalancePaneViewHalfMode, WeightBalancePaneViewMode } from '../Components/WeightBalancePane/WeightBalancePaneViewTypes';

/**
 * Weight and balance pane user settings.
 */
export type WeightBalancePaneViewUserSettingTypes = {
  /** Whether a display pane is visible. */
  weightBalancePaneHalfMode: WeightBalancePaneViewHalfMode;
};

/**
 * All true weight and balance pane user settings.
 */
export type WeightBalancePaneViewAllUserSettingTypes = {
  [Name in keyof WeightBalancePaneViewUserSettingTypes as `${Name}_${DisplayPaneIndex}`]: WeightBalancePaneViewUserSettingTypes[Name];
};

/**
 * Utility class for retrieving weight and balance pane setting managers.
 */
export class WeightBalancePaneViewUserSettings {
  private static masterInstance?: UserSettingManager<WeightBalancePaneViewAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<WeightBalancePaneViewUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true weight and balance pane settings.
   * @param bus The event bus.
   * @returns A manager for all true weight and balance pane settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<WeightBalancePaneViewAllUserSettingTypes> {
    return WeightBalancePaneViewUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...WeightBalancePaneViewUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...WeightBalancePaneViewUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...WeightBalancePaneViewUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...WeightBalancePaneViewUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd)
    ]);
  }

  /**
   * Retrieves a manager for aliased weight and balance pane settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased weight and balance pane settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: DisplayPaneIndex): UserSettingManager<WeightBalancePaneViewUserSettingTypes> {
    return WeightBalancePaneViewUserSettings.displayPaneInstances[index] ??= WeightBalancePaneViewUserSettings.getMasterManager(bus).mapTo(
      WeightBalancePaneViewUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Gets the default values for a full set of aliased weight and balance pane settings.
   * @returns The default values for a full set of aliased weight and balance pane settings.
   */
  private static getDefaultValues(): WeightBalancePaneViewUserSettingTypes {
    return {
      'weightBalancePaneHalfMode': WeightBalancePaneViewMode.Graph
    };
  }

  /**
   * Gets an array of definitions for true weight and balance pane settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true weight and balance pane settings for the specified GDU.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<WeightBalancePaneViewAllUserSettingTypes[keyof WeightBalancePaneViewAllUserSettingTypes]>[] {
    const values = WeightBalancePaneViewUserSettings.getDefaultValues();
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
  private static getDisplayPaneAliasMap(
    index: DisplayPaneIndex
  ): UserSettingMap<WeightBalancePaneViewUserSettingTypes, WeightBalancePaneViewAllUserSettingTypes> {
    const defaultValues = WeightBalancePaneViewUserSettings.getDefaultValues();

    const map: UserSettingMap<WeightBalancePaneViewUserSettingTypes, WeightBalancePaneViewAllUserSettingTypes> = {};

    for (const name in defaultValues) {
      map[name as keyof WeightBalancePaneViewUserSettingTypes] = `${name as keyof WeightBalancePaneViewUserSettingTypes}_${index}`;
    }

    return map;
  }
}
