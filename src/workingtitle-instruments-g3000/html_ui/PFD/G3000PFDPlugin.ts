/* eslint-disable @typescript-eslint/no-unused-vars */

import { AvionicsPlugin, CasSystem, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';

import {
  DisplayPaneIndex, DisplayPaneViewFactory, FlightPlanStore, G3000NavIndicators, G3000Plugin, G3000PluginBinder,
  PfdIndex, WeightBalancePaneViewModule
} from '@microsoft/msfs-wtg3000-common';

import { AfcsStatusBoxPluginOptions } from './Components/Fma/AfcsStatusBoxPluginOptions';
import { PfdConfig } from './Config';

/**
 * A plugin binder for G3000 PFD plugins.
 */
export interface G3000PfdPluginBinder extends G3000PluginBinder {
  /** The instrument configuration. */
  instrumentConfig: PfdConfig;

  /** The collection of navigation indicators available on the instrument. */
  navIndicators: G3000NavIndicators;

  /** The flight plan store to access plan data. */
  flightPlanStore: FlightPlanStore;

  /** The CAS system. */
  casSystem: CasSystem;
}

/**
 * A G3000 PFD plugin.
 */
export interface G3000PfdPlugin extends G3000Plugin<G3000PfdPluginBinder> {
  /**
   * Registers display pane views.
   * @param viewFactory The factory with which to register views.
   */
  registerDisplayPaneViews(viewFactory: DisplayPaneViewFactory): void;

  /**
   * Registers softkey menus.
   * @param menuSystem The softkey menu system with which to register menus.
   * @param pfdIndex The index of the softkey menu system's parent PFD.
   */
  registerSoftkeyMenus(menuSystem: SoftKeyMenuSystem, pfdIndex: PfdIndex): void;

  /**
   * Renders components to the PFD instrument container.
   * @param pfdIndex The index of the instrument container's parent PFD.
   * @param displayPaneIndex The index of the instrument container's display pane.
   * @param isInSplitMode Whether the PFD is in split mode.
   * @param declutter Whether the PFD is decluttered.
   */
  renderToPfdInstruments(
    pfdIndex: PfdIndex,
    displayPaneIndex: DisplayPaneIndex.LeftPfdInstrument | DisplayPaneIndex.RightPfdInstrument,
    isInSplitMode: Subscribable<boolean>,
    declutter: Subscribable<boolean>
  ): VNode | null;

  /**
   * Gets options to pass to the PFD AFCS status box.
   * @returns Options to pass to the PFD AFCS status box.
   */
  getAfcsStatusBoxOptions?(): AfcsStatusBoxPluginOptions | undefined;

  /**
   * Gets a module to be used for customizing the weight and balance display pane. This method is only called if weight
   * and balance is configured via `panel.xml`.
   * @returns A weight and balance display pane module, or `undefined` to omit a module.
   */
  getWeightBalancePaneViewModule?(): WeightBalancePaneViewModule | undefined;
}

/**
 * An abstract implementation of {@link G3000PfdPlugin} that by default does nothing. Subclasses should override the
 * appropriate methods to provide desired functionality.
 */
export abstract class AbstractG3000PfdPlugin extends AvionicsPlugin<G3000PfdPluginBinder> implements G3000PfdPlugin {
  /** @inheritdoc */
  public onInstalled(): void {
    // noop
  }

  /** @inheritdoc */
  public onInit(): void {
    // noop
  }

  /** @inheritdoc */
  public registerDisplayPaneViews(viewFactory: DisplayPaneViewFactory): void {
    // noop
  }

  /** @inheritdoc */
  public registerSoftkeyMenus(menuSystem: SoftKeyMenuSystem, pfdIndex: PfdIndex): void {
    // noop
  }

  /** @inheritdoc */
  public renderToPfdInstruments(
    pfdIndex: PfdIndex,
    displayPaneIndex: DisplayPaneIndex.LeftPfdInstrument | DisplayPaneIndex.RightPfdInstrument,
    isInSplitMode: Subscribable<boolean>,
    declutter: Subscribable<boolean>
  ): VNode | null {
    return null;
  }

  /** @inheritDoc */
  public getWeightBalancePaneViewModule(): WeightBalancePaneViewModule | undefined {
    return undefined;
  }
}
