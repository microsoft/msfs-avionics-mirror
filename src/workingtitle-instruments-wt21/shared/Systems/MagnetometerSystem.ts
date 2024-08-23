import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus } from '@microsoft/msfs-sdk';

/**
 * The GMU44 magnetometer system.
 */
export class MagnetometerSystem extends BasicAvionicsSystem<MagnetometerSystemEvents> {
  protected initializationTime = 1000;

  /**
   * Creates an instance of the MagnetometerSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'magnetometer_state');
    this.connectToPower('elec_av1_bus');
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface MagnetometerSystemEvents {
  /** An event fired when the AHRS system state changes. */
  'magnetometer_state': AvionicsSystemStateEvent;
}