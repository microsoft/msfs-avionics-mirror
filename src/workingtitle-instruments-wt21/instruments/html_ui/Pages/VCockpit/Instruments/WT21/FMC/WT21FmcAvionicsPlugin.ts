import { FmcScreenPluginContext } from '@microsoft/msfs-sdk';

import { WT21AvionicsPlugin, WT21PluginBinder } from '@microsoft/msfs-wt21-shared';

import { WT21FmcEvents } from './WT21FmcEvents';
import { WT21FmcPage } from './WT21FmcPage';
import { WT21Fms } from './FlightPlan';

/** A plugin binder for Epic2 PFD plugins. */
export interface WT21FmcPluginBinder extends WT21PluginBinder {
  /** The FMS */
  fms: WT21Fms;
}

/**
 * A WT21 FMC plugin.
 */
export abstract class WT21FmcAvionicsPlugin extends WT21AvionicsPlugin<WT21FmcPluginBinder> {
  /**
   * Method that is called with a {@link FmcScreenPluginContext}, letting the plugin register extensions to the FMC screen
   *
   * @param context the FMC screen plugin context
   */
  registerFmcExtensions?(context: FmcScreenPluginContext<WT21FmcPage, WT21FmcEvents>): void;
}
