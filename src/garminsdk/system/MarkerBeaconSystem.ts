import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, EventBusMetaEvents, MarkerBeaconState,
  NavComEvents, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Events fired by the marker beacon system.
 */
export interface MarkerBeaconSystemEvents {
  /** An event fired when the marker beacon system state changes. */
  [marker_state: `marker_state_${number}`]: AvionicsSystemStateEvent;

  /** The marker beacon receiving state. */
  [marker_mkr_bcn_state: `marker_mkr_bcn_state_${number}`]: MarkerBeaconState;
}

/**
 * A Garmin marker beacon receiver system.
 */
export class MarkerBeaconSystem extends BasicAvionicsSystem<MarkerBeaconSystemEvents> {
  private beaconStateSub?: Subscription;

  /**
   * Creates an instance of a marker beacon system.
   * @param index The index of the marker beacon system.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement
  ) {
    super(index, bus, `marker_state_${index}` as const);

    const markerBeaconStateTopic = `marker_mkr_bcn_state_${this.index}`;

    if (this.bus.getTopicSubscriberCount(markerBeaconStateTopic) > 0) {
      this.onMarkerBeaconStateTopicSubscribed();
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic === markerBeaconStateTopic) {
        this.onMarkerBeaconStateTopicSubscribed();
      }
    });

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }

  /**
   * Responds to when someone first subscribes to this system's marker beacon state data topic on the event bus.
   */
  private onMarkerBeaconStateTopicSubscribed(): void {
    const topic = `marker_mkr_bcn_state_${this.index}` as const;
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.beaconStateSub = this.bus.getSubscriber<NavComEvents>().on('marker_beacon_state').handle(val => {
      this.publisher.pub(topic, val);
    }, paused);
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      this.beaconStateSub?.pause();
    } else {
      this.beaconStateSub?.resume(true);
    }
  }
}