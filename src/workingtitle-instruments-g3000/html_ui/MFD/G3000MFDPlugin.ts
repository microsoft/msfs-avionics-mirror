import { AvionicsPlugin, CasSystem, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { EspDataProvider, NavReferenceIndicators } from '@microsoft/msfs-garminsdk';

import {
  DisplayPaneViewFactory, FlightPlanStore, G3000EspDefinition, G3000NavSourceName, G3000Plugin, G3000PluginBinder, InitializationProcess,
  ToldModule, WeightBalancePaneViewModule
} from '@microsoft/msfs-wtg3000-common';

import { G3000AutopilotPluginOptions } from './Autopilot/G3000AutopilotPluginOptions';
import { StartupScreenPrebuiltRow, StartupScreenRowFactory } from './Components/Startup/StartupScreenRow';
import { MfdConfig } from './Config/MfdConfig';
import { DisplayPanePowerOnOptions } from './DisplayPanes/DisplayPanePowerOnOptions';
import { G3000EspInterface } from './ESP/G3000EspInterface';

/**
 * A plugin binder for G3000 MFD plugins.
 */
export interface G3000MfdPluginBinder extends G3000PluginBinder {
  /** The instrument configuration. */
  instrumentConfig: MfdConfig;

  /** The collection of navigation indicators available on the instrument. */
  navIndicators: NavReferenceIndicators<G3000NavSourceName, 'activeSource'>;

  /** The flight plan store to access plan data. */
  flightPlanStore: FlightPlanStore;

  /** The CAS system. */
  casSystem: CasSystem;
}

/**
 * A G3000 MFD plugin.
 */
export interface G3000MfdPlugin extends G3000Plugin<G3000MfdPluginBinder> {
  /**
   * Renders the EIS.
   * @returns The EIS, as a VNode, or `null` if no EIS is to be rendered.
   */
  renderEis(): VNode | null;

  /**
   * Registers display pane views.
   * @param viewFactory The factory with which to register views.
   */
  registerDisplayPaneViews(viewFactory: DisplayPaneViewFactory): void;

  /**
   * Gets settings whose values should be saved across flight sessions.
   * @returns An iterable of settings whose values should be saved across flight sessions.
   */
  getPersistentSettings(): Iterable<UserSetting<any>>;

  /**
   * Gets options with which to configure display pane logic on initial system power-on.
   * @returns Configuration options for display pane logic on initial system power-on, or `undefined` to use default
   * options if no other plugin specifies its own set of options.
   */
  getDisplayPanePowerOnOptions?(): Readonly<DisplayPanePowerOnOptions> | undefined;

  /**
   * Gets the data rows to render on the right side of the MFD startup screen. Each row is defined by either a function
   * which returns an object describing the row to render, or a pre-built row key. Up to eleven rows can be rendered.
   * This method is ignored if the system is not configured to support the startup screen.
   * @returns An array of rows to render on the right side of the MFD startup screen. The rows will be rendered from
   * top to bottom in the order in which they appear in the array. If not defined, a default set of rows will be
   * rendered.
   */
  getStartupScreenRows(): readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[] | undefined;

  /**
   * Gets options to pass to the autopilot.
   * @returns Options to pass to the autopilot.
   */
  getAutopilotOptions?(): G3000AutopilotPluginOptions | undefined;

  /**
   * Gets a definition to be used for creating an electronic stability and protection (ESP) system.
   * @returns A definition to be used for creating an electronic stability and protection (ESP) system, or `undefined`
   * to omit a definition but still allow an ESP system to be created if a definition is specified by another plugin.
   */
  getEspDefinition?(): G3000EspDefinition | undefined;

  /**
   * A method that is called when an electronic stability and protection (ESP) system is created.
   * @param esp The ESP system.
   * @param dataProvider The data provider for the ESP system.
   */
  onEspCreated?(esp: G3000EspInterface, dataProvider: EspDataProvider): void;

  /**
   * Gets the initialization process to be used by the G3000.
   * @returns A initialization process to be used by the G3000, `null` to specify that no initialization process should
   * be used, or `undefined` to omit a specification but still allow an initialization process to be used if one was
   * specified by another plugin.
   */
  getInitializationProcess?(): InitializationProcess | null | undefined;

  /**
   * Gets a module to be used for customizing the weight and balance display pane. This method is only called if weight
   * and balance is configured via `panel.xml`.
   * @returns A weight and balance display pane module, or `undefined` to omit a module.
   */
  getWeightBalancePaneViewModule?(): WeightBalancePaneViewModule | undefined;

  /**
   * Gets a module to be used for calculating takeoff and landing performance values. This method is only called if
   * TOLD calculations are configured via panel.xml. If TOLD calculations are configured but a module is not provided
   * by this method, then TOLD calculations will be disabled.
   * @returns A TOLD module, or `undefined` if no TOLD module is to be used.
   */
  getToldModule(): ToldModule | undefined;
}

/**
 * An abstract implementation of {@link G3000MfdPlugin} that by default does nothing. Subclasses should override the
 * appropriate methods to provide desired functionality.
 */
export abstract class AbstractG3000MfdPlugin extends AvionicsPlugin<G3000MfdPluginBinder> implements G3000MfdPlugin {
  /** @inheritDoc */
  public onInstalled(): void {
    // noop
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public renderEis(): VNode | null {
    return null;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public registerDisplayPaneViews(viewFactory: DisplayPaneViewFactory): void {
    // noop
  }

  /** @inheritDoc */
  public getEspDefinition(): G3000EspDefinition | undefined {
    return undefined;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onEspCreated(esp: G3000EspInterface, dataProvider: EspDataProvider): void {
    return undefined;
  }

  /** @inheritDoc */
  public getWeightBalancePaneViewModule(): WeightBalancePaneViewModule | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getToldModule(): ToldModule | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getPersistentSettings(): Iterable<UserSetting<any>> {
    return [];
  }

  /** @inheritDoc */
  public getDisplayPanePowerOnOptions(): Readonly<DisplayPanePowerOnOptions> | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getStartupScreenRows(): readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[] | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getInitializationProcess(): InitializationProcess | undefined {
    return undefined;
  }
}
