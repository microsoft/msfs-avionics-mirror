import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, EventBusMetaEvents, Subscription } from '@microsoft/msfs-sdk';

/**
 * The RA system.
 */
export class RASystem extends BasicAvionicsSystem<RASystemEvents> {
  protected initializationTime = 7000;
  private radioAltSub?: Subscription;

  /**
   * Creates an instance of the RASystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'ra_state');

    const radioAltTopic = 'ra_radio_alt';

    if (this.bus.getTopicSubscriberCount(radioAltTopic) > 0) {
      this.onRadioAltTopicSubscribed();
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic === radioAltTopic) {
        this.onRadioAltTopicSubscribed();
      }
    });

    this.connectToPower('elec_av1_bus');
  }

  /**
   * Responds to when someone first subscribes to this system's radar altitude data topic on the event bus.
   */
  private onRadioAltTopicSubscribed(): void {
    const topic = 'ra_radio_alt';
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.radioAltSub = this.bus.getSubscriber<AdcEvents>().on('radio_alt').atFrequency(3).handle(val => {
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

/**
 * Events fired by the magnetometer system.
 */
export interface RASystemEvents {
  /** An event fired when the RA system state changes. */
  'ra_state': AvionicsSystemStateEvent;
  /** The radar altitude, in feet, or `NaN` if there is no valid radar altitude. */
  'ra_radio_alt': number;
}