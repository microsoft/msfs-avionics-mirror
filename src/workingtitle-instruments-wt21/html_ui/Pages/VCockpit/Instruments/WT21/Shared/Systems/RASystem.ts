import { EventBus, BasicAvionicsSystem, AvionicsSystemStateEvent } from '@microsoft/msfs-sdk';

/**
 * The RA system.
 */
export class RASystem extends BasicAvionicsSystem<RASystemEvents> {
  protected initializationTime = 7000;

  /**
   * Creates an instance of the RASystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'ra_state');
    this.connectToPower('elec_av1_bus');
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface RASystemEvents {
  /** An event fired when the RA system state changes. */
  'ra_state': AvionicsSystemStateEvent;
}