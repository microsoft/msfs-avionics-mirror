import { AvionicsPlugin, CasSystem } from '@microsoft/msfs-sdk';

import { NavReferenceIndicators } from '@microsoft/msfs-garminsdk';

import { FlightPlanStore, G3000NavSourceName, G3000Plugin, G3000PluginBinder } from '@microsoft/msfs-wtg3000-common';

import { LabelBarPluginHandlers } from './Components/LabelBar/LabelBar';
import { GtcConfig } from './Config/GtcConfig';
import { G3000GtcViewContext } from './G3000GtcViewContext';
import { GtcInteractionEvent, GtcInteractionHandler } from './GtcService/GtcInteractionEvent';
import { GtcKnobStatePluginOverrides } from './GtcService/GtcKnobStates';
import { GtcService } from './GtcService/GtcService';

/**
 * A plugin binder for G3000 GTC plugins.
 */
export interface G3000GtcPluginBinder extends G3000PluginBinder {
  /** The instrument configuration. */
  instrumentConfig: GtcConfig;

  /** The collection of navigation indicators available on the instrument. */
  navIndicators: NavReferenceIndicators<G3000NavSourceName, 'activeSource'>;

  /** The GTC service. */
  gtcService: GtcService;

  /**
   * The flight plan store to access plan data. The store is only provided for GTCs that support the MFD control mode.
   */
  flightPlanStore?: FlightPlanStore;

  /**
   * The CAS system, or `undefined` if the base G3000 package did not create a CAS system instance for this GTC
   * instrument.
   */
  casSystem?: CasSystem;
}

/**
 * A G3000 GTC plugin.
 */
export interface G3000GtcPlugin extends G3000Plugin<G3000GtcPluginBinder>, GtcInteractionHandler {
  /**
   * Registers GTC views.
   * @param gtcService The GTC service with which to register views.
   * @param context A context containing references to items used to create the base G3000's GTC views.
   */
  registerGtcViews(gtcService: GtcService, context: Readonly<G3000GtcViewContext>): void;

  /**
   * Gets a set of GTC knob control state overrides. The knob control state overrides (if they are not `null`) will be
   * applied in place of the states defined by the base G3000 system _and_ any plugins that were loaded before this
   * one.
   * @param gtcService The GTC service.
   * @returns A set of GTC knob state overrides, or `null` if this plugin does not define any overrides.
   */
  getKnobStateOverrides(gtcService: GtcService): Readonly<GtcKnobStatePluginOverrides> | null;

  /**
   * Gets a set of GTC label bar handlers. The labels returned by the handlers (if they are not `null`) will be applied
   * in place of the labels defined by the base G3000 system _and_ any plugins that were loaded before this one.
   * @returns A set of GTC label bar handlers, or `null` if this plugin does not define any handlers.
   */
  getLabelBarHandlers(): Readonly<LabelBarPluginHandlers> | null;
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
  public registerGtcViews(gtcService: GtcService, context: Readonly<G3000GtcViewContext>): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getKnobStateOverrides(gtcService: GtcService): Readonly<GtcKnobStatePluginOverrides> | null {
    return null;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getLabelBarHandlers(): Readonly<LabelBarPluginHandlers> | null {
    return null;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return false;
  }
}