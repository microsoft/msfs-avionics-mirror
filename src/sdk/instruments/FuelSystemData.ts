/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * An interface that describes the possible Fuel System Parameter events
 */
export interface BaseFuelSystemEvents {

  /** The opening state of a fuel system valve, as a percent, with 0 as fully closed and 100 as fully open. */
  fuel_system_valve_open: number;
}

/**
 * Topics related to fuel system information that are indexed.
 */
type FuelSystemIndexedTopics = 'fuel_system_valve_open'

/**
 * Indexed events related to fuel system information.
 */
type FuelSystemIndexedEvents = {
  [P in keyof Pick<BaseFuelSystemEvents, FuelSystemIndexedTopics> as IndexedEventType<P>]: BaseFuelSystemEvents[P];
};

/**
 * Events related to fuel system computer information.
 */
export interface FuelSystemEvents extends BaseFuelSystemEvents, FuelSystemIndexedEvents {
}

/**
 * A publisher for fuel system information.
 */
export class FuelSystemSimVarPublisher extends SimVarPublisher<FuelSystemEvents> {

  /**
   * Create an FuelSystemSimvarPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<FuelSystemEvents> | undefined = undefined) {

    const simvars = new Map<keyof FuelSystemEvents, SimVarPublisherEntry<any>>([
      ['fuel_system_valve_open', { name: 'FUELSYSTEM VALVE OPEN:#index#', type: SimVarValueType.Percent, indexed: true }]

    ]);

    super(simvars, bus, pacer);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
