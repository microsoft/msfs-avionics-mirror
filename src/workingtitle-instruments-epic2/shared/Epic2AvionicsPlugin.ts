import { AvionicsPlugin, EventBus, InstrumentBackplane } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';

/** A plugin binder for Epic2 plugins. */
export interface Epic2PluginBinder {
  /** The system-wide event bus. */
  bus: EventBus;

  /** The backplane instance. */
  backplane: InstrumentBackplane;

  /** The avionics configuration. */
  config: AvionicsConfig;
}

/**
 * An avionics plugin for the Epic2.
 */
export abstract class Epic2AvionicsPlugin<B extends Epic2PluginBinder = Epic2PluginBinder> extends AvionicsPlugin<B> {
}
