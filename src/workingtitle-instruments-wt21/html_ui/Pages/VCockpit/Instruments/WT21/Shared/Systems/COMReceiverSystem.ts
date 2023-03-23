import { EventBus, BasicAvionicsSystem, AvionicsSystemStateEvent } from '@microsoft/msfs-sdk';

/**
 * The COMReceiver system.
 */
export class COMReceiverSystem extends BasicAvionicsSystem<COMReceiverSystemEvents> {
  protected initializationTime = 5000;

  /**
   * Creates an instance of the COMReceiverSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'com_state');
    this.connectToPower('elec_av1_bus');
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface COMReceiverSystemEvents {
  /** An event fired when the COMReceiver system state changes. */
  'com_state': AvionicsSystemStateEvent;
}