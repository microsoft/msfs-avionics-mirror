import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, Subject } from '@microsoft/msfs-sdk';

import { TransponderDefinition } from '../Config';

/**
 * The Transponder system.
 */
export class TransponderSystem extends BasicAvionicsSystem<TransponderSystemEvents> {
  protected initializationTime = 6000;

  /**
   * Creates an instance of the TransponderSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   * @param def The transponder system definition
   */
  constructor(public readonly index: number, protected readonly bus: EventBus, private readonly def: TransponderDefinition) {
    super(index, bus, 'transponder_state');
    this.connectToPower(def.electricity ?? Subject.create(true));
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface TransponderSystemEvents {
  /** An event fired when the TDR system state changes. */
  'transponder_state': AvionicsSystemStateEvent;
}
