import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, SystemPowerKey } from 'msfssdk';

/**
 * Events fired by the magnetometer system.
 */
export interface MagnetometerSystemEvents {
  /** An event fired when the AHRS system state changes. */
  [magnetometer_state: `magnetometer_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * The GMU44 magnetometer system.
 */
export class MagnetometerSystem extends BasicAvionicsSystem<MagnetometerSystemEvents> {
  protected initializationTime = 5000;

  /**
   * Creates an instance of the MagnetometerSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    public readonly index: number,
    protected readonly bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement
  ) {
    super(index, bus, `magnetometer_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }
}