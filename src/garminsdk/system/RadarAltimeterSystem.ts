import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, EventBusMetaEvents, Subject,
  Subscribable, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Events fired by the radar altimeter system.
 */
export interface RadarAltimeterSystemEvents {
  /** An event fired when the radar altimeter system state changes. */
  [radaralt_state: `radaralt_state_${number}`]: AvionicsSystemStateEvent;

  /** The radar altitude, in feet. */
  [radaralt_radio_alt: `radaralt_radio_alt_${number}`]: number;
}

/**
 * A Garmin radar altimeter system.
 */
export class RadarAltimeterSystem extends BasicAvionicsSystem<RadarAltimeterSystemEvents> {
  private radioAltSub?: Subscription;

  /**
   * Creates an instance of a radar altimeter system.
   * @param index The index of the radar altimeter.
   * @param bus An instance of the event bus.
   * @param powerSource The source from which to retrieve the system's power state. Can be an event bus topic defined
   * in {@link ElectricalEvents} with boolean-valued data, an XML logic element that evaluates to zero (false) or
   * non-zero (true) values, or a boolean-valued subscribable. If not defined, then the system will be considered
   * always powered on.
   */
  public constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement | Subscribable<boolean>
  ) {
    super(index, bus, `radaralt_state_${index}` as const);

    this.connectToPower(powerSource ?? Subject.create(true));

    const radioAltTopic = `radaralt_radio_alt_${this.index}`;

    if (this.bus.getTopicSubscriberCount(radioAltTopic) > 0) {
      this.onRadioAltTopicSubscribed();
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic === radioAltTopic) {
        this.onRadioAltTopicSubscribed();
      }
    });
  }

  /**
   * Responds to when someone first subscribes to this system's radar altitude data topic on the event bus.
   */
  private onRadioAltTopicSubscribed(): void {
    const topic = `radaralt_radio_alt_${this.index}` as const;
    const paused = this.state !== AvionicsSystemState.On;

    this.radioAltSub = this.bus.getSubscriber<AdcEvents>().on('radio_alt').handle(val => {
      this.publisher.pub(topic, val);
    }, paused);
  }

  /** @inheritDoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.On) {
      this.radioAltSub?.resume(true);
    } else {
      this.radioAltSub?.pause();
    }
  }
}
