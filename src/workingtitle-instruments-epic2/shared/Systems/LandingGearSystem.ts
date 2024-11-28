import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ControlSurfacesEvents, EventBus, EventBusMetaEvents, Subject, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Topics for bus events from which landing gear data is sourced.
 */
type ControlSurfacesDataSourceTopics = 'gear_position_0' | 'gear_position_1' | 'gear_position_2' | 'gear_is_on_ground_1' | 'gear_is_on_ground_2' | 'gear_handle_position';

/**
 * Data events published by the landing gear indication system.
 */
type ControlSurfacesDataEvents = {
  [P in keyof Pick<ControlSurfacesEvents, ControlSurfacesDataSourceTopics> as `ldg_indication_${P}_${number}`]: ControlSurfacesEvents[P];
};

/**
 * Events fired by the landing gear indication system.
 */
export interface LandingGearSystemEvents extends ControlSurfacesDataEvents {
  /** An event fired when the landing gear indication system state changes. */
  [ldg_indication_state: `ldg_indication_state_${number}`]: AvionicsSystemStateEvent;
  [ldg_indication_valid: `ldg_indication_valid_${number}`]: boolean;
}

/**
 * A landing gear indication system.
 */
export class LandingGearSystem extends BasicAvionicsSystem<LandingGearSystemEvents> {
  protected initializationTime = 5000;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<ControlSurfacesEvents>();

  private readonly dataSubs: Subscription[] = [];

  private readonly ldgIndicationValidTopic = `ldg_indication_valid_${this.index}` as const;

  private isDataValidSubbed = false;

  private readonly dataSourceTopicMap: Record<keyof ControlSurfacesDataEvents, ControlSurfacesDataSourceTopics> = {
    [`ldg_indication_gear_position_0_${this.index}`]: 'gear_position_0',
    [`ldg_indication_gear_position_1_${this.index}`]: 'gear_position_1',
    [`ldg_indication_gear_position_2_${this.index}`]: 'gear_position_2',

    [`ldg_indication_gear_is_on_ground_1_${this.index}`]: 'gear_is_on_ground_1',
    [`ldg_indication_gear_is_on_ground_2_${this.index}`]: 'gear_is_on_ground_2',

    [`ldg_indication_gear_handle_position_${this.index}`]: 'gear_handle_position',
  } as const;

  private readonly isLdgDataValid = Subject.create(true);

  /**
   * Creates an instance of a landing gear indication ystem.
   * @param index The index of the landing gear indication computer.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `ldg_indication_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing landing gear data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.dataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof ControlSurfacesDataEvents);
      } else if (topic === this.ldgIndicationValidTopic) {
        this.onDataValidSubscribed();
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.dataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof ControlSurfacesDataEvents);
      } else if (topic === this.ldgIndicationValidTopic) {
        this.onDataValidSubscribed();
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof ControlSurfacesDataEvents): void {
    const paused = this.state !== undefined && this.state !== AvionicsSystemState.On;

    this.dataSubs.push(this.dataSourceSubscriber.on(this.dataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val, false, true);
    }, paused));
  }

  /** Handles subscriptions to the data valid topic. */
  private onDataValidSubscribed(): void {
    if (this.isDataValidSubbed) {
      return;
    }
    this.isDataValidSubbed = true;

    this.dataSubs.push(this.isLdgDataValid.sub((v) => this.publisher.pub(this.ldgIndicationValidTopic, v, false, true), true));
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      for (const sub of this.dataSubs) {
        sub.pause();
      }
    } else {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }
    }

    this.isLdgDataValid.set(currentState === AvionicsSystemState.On);
  }
}
