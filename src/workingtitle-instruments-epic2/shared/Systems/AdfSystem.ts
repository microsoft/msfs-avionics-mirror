import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, SystemPowerKey } from '@microsoft/msfs-sdk';

/**
 * Events fired by the adf system.
 */
export interface AdfSystemEvents {
  /** An event fired when the AHRS system state changes. */
  [adf_state: `adf_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * The ADF system.
 */
export class AdfSystem extends BasicAvionicsSystem<AdfSystemEvents> {
  protected initializationTime = 2000;

  /**
   * Creates an instance of the AdfSystem.
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
    super(index, bus, `adf_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }
}
