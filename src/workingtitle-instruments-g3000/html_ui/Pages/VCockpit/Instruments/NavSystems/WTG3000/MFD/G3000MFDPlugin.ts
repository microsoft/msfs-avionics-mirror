import { AvionicsPlugin, CasSystem, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { DisplayPaneViewFactory, FlightPlanStore, G3000Plugin, G3000PluginBinder, ToldModule } from '@microsoft/msfs-wtg3000-common';

import { StartupScreenPrebuiltRow, StartupScreenRowFactory } from './Components/Startup/StartupScreenRow';
import { MfdConfig } from './Config';

/**
 * A plugin binder for G3000 MFD plugins.
 */
export interface G3000MfdPluginBinder extends G3000PluginBinder {
  /** The instrument configuration. */
  instrumentConfig: MfdConfig;

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
   * Gets a module to be used for calculating takeoff and landing performance values. This method is only called if
   * TOLD calculations are configured via panel.xml. If TOLD calculations are configured but a module is not provided
   * by this method, then TOLD calculations will be disabled.
   * @returns A TOLD module, or `undefined` if no TOLD module is to be used.
   */
  getToldModule(): ToldModule | undefined;

  /**
   * Gets settings whose values should be saved across flight sessions.
   * @returns An iterable of settings whose values should be saved across flight sessions.
   */
  getPersistentSettings(): Iterable<UserSetting<any>>;

  /**
   * Gets the data rows to render on the right side of the MFD startup screen. Each row is defined by either a function
   * which returns an object describing the row to render, or a pre-built row key. Up to eleven rows can be rendered.
   * This method is ignored if the system is not configured to support the startup screen.
   * @returns An array of rows to render on the right side of the MFD startup screen. The rows will be rendered from
   * top to bottom in the order in which they appear in the array. If not defined, a default set of rows will be
   * rendered.
   */
  getStartupScreenRows(): readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[] | undefined
}

/**
 * An abstract implementation of {@link G3000MfdPlugin} that by default does nothing. Subclasses should override the
 * appropriate methods to provide desired functionality.
 */
export abstract class AbstractG3000MfdPlugin extends AvionicsPlugin<G3000MfdPluginBinder> implements G3000MfdPlugin {
  /** @inheritdoc */
  public onInstalled(): void {
    // noop
  }

  /** @inheritdoc */
  public onInit(): void {
    // noop
  }

  /** @inheritdoc */
  public renderEis(): VNode | null {
    return null;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public registerDisplayPaneViews(viewFactory: DisplayPaneViewFactory): void {
    // noop
  }

  /** @inheritdoc */
  public getToldModule(): ToldModule | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public getPersistentSettings(): Iterable<UserSetting<any>> {
    return [];
  }

  /** @inheritdoc */
  public getStartupScreenRows(): readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[] | undefined {
    return undefined;
  }
}