import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus } from '@microsoft/msfs-sdk';

/**
 * The TDR system.
 */
export class TDRSystem extends BasicAvionicsSystem<TDRSystemEvents> {
  protected initializationTime = 6000;

  /**
   * Creates an instance of the TDRSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'tdr_state');
    this.connectToPower('elec_av1_bus');
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface TDRSystemEvents {
  /** An event fired when the TDR system state changes. */
  'tdr_state': AvionicsSystemStateEvent;
}