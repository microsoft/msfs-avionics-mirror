import { ControllableDisplayPaneIndex } from '@microsoft/msfs-wtg3000-common';

/**
 * Options defining the display pane views to select and designate at initial system power-on for a controllable
 * display pane.
 */
export type DisplayPanePowerOnViewKeysOptions = {
  /**
   * The key of the display pane view to select and designate at initial system power-on, or a function that returns
   * the key. Defaults to the following based on the display pane:
   * * `DisplayPaneIndex.LeftPfd`: `DisplayPaneViewKeys.NavigationMap`
   * * `DisplayPaneIndex.LeftMfd`: `DisplayPaneViewKeys.NavigationMap`
   * * `DisplayPaneIndex.RightMfd`: `DisplayPaneViewKeys.TrafficMap`
   * * `DisplayPaneIndex.RightPfd`: `DisplayPaneViewKeys.NavigationMap`
   */
  displayKey?: string | (() => string);

  /**
   * The key of the display pane view to set as the designated weather pane view at initial system power-on, or a
   * function that returns the key. If the value is `null` instead of a key, then the existing designated weather pane
   * view will be retained at system power-on. Defaults to `null`.
   */
  designatedWeatherKey?: string | null | (() => string | null);
};

/**
 * Configuration options for display pane logic on initial system power-on.
 */
export type DisplayPanePowerOnOptions = {
  /**
   * The keys of the display pane views to select and designate at initial system power-on for each controllable
   * display pane. If not defined, then a set of default views will be selected and designated.
   */
  powerOnViewKeys?: Readonly<Partial<Record<ControllableDisplayPaneIndex, Readonly<DisplayPanePowerOnViewKeysOptions>>>>;
};
