import { AvionicsPlugin } from '@microsoft/msfs-sdk';

import { FlightPlanStore, G3000Plugin, G3000PluginBinder } from '@microsoft/msfs-wtg3000-common';

import { GtcConfig } from './Config/GtcConfig';
import { GtcService } from './GtcService';

/**
 * A plugin binder for G3000 GTC plugins.
 */
export interface G3000GtcPluginBinder extends G3000PluginBinder {
  /** The instrument configuration. */
  instrumentConfig: GtcConfig;

  /**
   * The flight plan store to access plan data. The store is only provided for GTCs that support the MFD control mode.
   */
  flightPlanStore?: FlightPlanStore;
}

/**
 * A G3000 GTC plugin.
 */
export interface G3000GtcPlugin extends G3000Plugin<G3000GtcPluginBinder> {
  /**
   * Registers GTC views.
   * @param gtcService The GTC service with which to register views.
   */
  registerGtcViews(gtcService: GtcService): void;
}

/**
 * An abstract implementation of {@link G3000GtcPlugin} that by default does nothing. Subclasses should override the
 * appropriate methods to provide desired functionality.
 */
export abstract class AbstractG3000GtcPlugin extends AvionicsPlugin<G3000GtcPluginBinder> implements G3000GtcPlugin {
  /** @inheritdoc */
  public onInstalled(): void {
    // noop
  }

  /** @inheritdoc */
  public onInit(): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public registerGtcViews(gtcService: GtcService): void {
    // noop
  }
}