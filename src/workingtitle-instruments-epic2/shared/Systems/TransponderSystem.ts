import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, SystemPowerKey } from '@microsoft/msfs-sdk';

/**
 * Events fired by the xpdr system.
 */
export interface XpdrSystemEvents {
  /** An event fired when the AHRS system state changes. */
  [xpdr_state: `xpdr_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * The XPDR system.
 */
export class XpdrSystem extends BasicAvionicsSystem<XpdrSystemEvents> {
  protected initializationTime = 2000;

  /**
   * Creates an instance of the XpdrSystem.
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
    super(index, bus, `xpdr_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }
}
