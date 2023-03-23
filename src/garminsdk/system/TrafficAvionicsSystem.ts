import { AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, SystemPowerKey } from '@microsoft/msfs-sdk';
import { TrafficSystem } from '../traffic/TrafficSystem';

/**
 * Events fired by the traffic avionics system.
 */
export interface TrafficAvionicsSystemEvents {
  /** An event fired when the traffic avionics system state changes. */
  traffic_avionics_state: AvionicsSystemStateEvent;
}

/**
 * A Garmin traffic avionics system.
 */
export class TrafficAvionicsSystem<T extends TrafficSystem = TrafficSystem> extends BasicAvionicsSystem<TrafficAvionicsSystemEvents> {
  /**
   * Creates an instance of a traffic avionics system.
   * @param bus An instance of the event bus.
   * @param trafficSystem This system's traffic system.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   * @param initializationTime The time required for the system to initialize, in milliseconds. Defaults to 0.
   */
  constructor(
    bus: EventBus,
    public readonly trafficSystem: T,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
    initializationTime = 0
  ) {
    super(1, bus, 'traffic_avionics_state' as const);

    this.initializationTime = initializationTime;

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    this.trafficSystem.setPowered(currentState === AvionicsSystemState.On);
  }
}