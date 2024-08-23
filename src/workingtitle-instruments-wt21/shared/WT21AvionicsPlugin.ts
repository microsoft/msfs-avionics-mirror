import { AvionicsPlugin, EventBus, FlightPlanner, InstrumentBackplane } from '@microsoft/msfs-sdk';

/** A plugin binder for WT21 plugins. */
export interface WT21PluginBinder {
  /** The system-wide event bus. */
  bus: EventBus;

  /** The backplane instance. */
  backplane: InstrumentBackplane;

  /** The flight planner */
  flightPlanner: FlightPlanner;

  /** Whether the instrument this plugin is being installed on is a primary instrument */
  isPrimaryInstrument: boolean;
}

/**
 * An avionics plugin for the WT21.
 */
export abstract class WT21AvionicsPlugin<B extends WT21PluginBinder = WT21PluginBinder> extends AvionicsPlugin<B> {
}
