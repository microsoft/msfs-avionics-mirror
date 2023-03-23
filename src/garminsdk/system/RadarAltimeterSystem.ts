import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, EventBusMetaEvents, Subscription, SystemPowerKey } from '@microsoft/msfs-sdk';

/**
 * Events fired by the radar altimeter system.
 */
export interface RadarAltimeterSystemEvents {
  /** An event fired when the radar altimeter system state changes. */
  [radaralt_state: `radaralt_state_${number}`]: AvionicsSystemStateEvent;

  /** The radar altitude, in feet, or `NaN` if there is no valid radar altitude. */
  [radaralt_radio_alt: `radaralt_radio_alt_${number}`]: number;
}

/**
 * A Garmin GRA 55(00) radar altimeter system.
 */
export class RadarAltimeterSystem extends BasicAvionicsSystem<RadarAltimeterSystemEvents> {
  private radioAltSub?: Subscription;

  /**
   * Creates an instance of a radar altimeter system.
   * @param index The index of the radar altimeter.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement
  ) {
    super(index, bus, `radaralt_state_${index}` as const);

    const radioAltTopic = `radaralt_radio_alt_${this.index}`;

    if (this.bus.getTopicSubscriberCount(radioAltTopic) > 0) {
      this.onRadioAltTopicSubscribed();
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic === radioAltTopic) {
        this.onRadioAltTopicSubscribed();
      }
    });

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }

  /**
   * Responds to when someone first subscribes to this system's radar altitude data topic on the event bus.
   */
  private onRadioAltTopicSubscribed(): void {
    const topic = `radaralt_radio_alt_${this.index}` as const;
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.radioAltSub = this.bus.getSubscriber<AdcEvents>().on('radio_alt').handle(val => {
      this.publisher.pub(topic, val);
    }, paused);
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      this.radioAltSub?.pause();
    } else {
      this.radioAltSub?.resume(true);
    }
  }
}