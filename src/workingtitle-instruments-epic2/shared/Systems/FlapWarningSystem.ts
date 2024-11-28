import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ControlSurfacesEvents, EventBus, EventBusMetaEvents, MappedSubject, Subject, Subscription,
  SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Topics for bus events from which flap warning data is sourced.
 */
type ControlSurfacesDataSourceTopics = 'flaps_handle_index' | 'flaps_left_angle' | 'flaps_right_angle';

/**
 * Data events published by the flap warning system.
 */
type ControlSurfacesDataEvents = {
  [P in keyof Pick<ControlSurfacesEvents, ControlSurfacesDataSourceTopics> as `flap_warn_${P}_${number}`]: ControlSurfacesEvents[P];
};

/**
 * Events fired by the flap warning system.
 */
export interface FlapWarningSystemEvents extends ControlSurfacesDataEvents {
  /** An event fired when the flap warning system state changes. */
  [flap_warn_state: `flap_warn_state_${number}`]: AvionicsSystemStateEvent;
  [flap_warn_valid: `flap_warn_valid_${number}`]: boolean;
  [flap_warn_in_takeoff_position: `flap_warn_in_takeoff_position_${number}`]: boolean;
}

/**
 * A flap warning system.
 */
export class FlapWarningSystem extends BasicAvionicsSystem<FlapWarningSystemEvents> {
  protected initializationTime = 5000;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<ControlSurfacesEvents>();

  private readonly dataSubs: Subscription[] = [];

  private readonly flapWarningValidTopic = `flap_warn_valid_${this.index}` as const;

  private isDataValidSubbed = false;
  private isHandleIndexSubbed = false;
  private isLeftAngleSubbed = false;
  private isRightAngleSubbed = false;
  private isTakeoffPositionSubbed = false;

  private readonly dataSourceTopicMap: Record<keyof ControlSurfacesDataEvents, ControlSurfacesDataSourceTopics> = {
    [`flap_warn_flaps_handle_index_${this.index}`]: 'flaps_handle_index',
    [`flap_warn_flaps_left_angle_${this.index}`]: 'flaps_left_angle',
    [`flap_warn_flaps_right_angle_${this.index}`]: 'flaps_right_angle',
  } as const;

  private readonly publishTopics = new Set([
    ...Object.keys(this.dataSourceTopicMap),
    `flap_warn_valid_${this.index}`,
    `flap_warn_in_takeoff_position_${this.index}`
  ]);

  private readonly isFlapDataValid = Subject.create(true);
  private readonly leftAngle = Subject.create(0);
  private readonly rightAngle = Subject.create(0);
  private readonly isInTakeoffPosition = MappedSubject.create(
    (inputs) => this.minTakeoffPosition !== undefined && this.maxTakeoffPosition !== undefined
      ? inputs.every((v) => v >= (this.minTakeoffPosition as number) && v <= (this.maxTakeoffPosition as number))
      : false,
    this.leftAngle,
    this.rightAngle,
  );

  /**
   * Creates an instance of a flap warning system.
   * @param index The index of the flap warning system.
   * @param bus An instance of the event bus.
   * @param minTakeoffPosition The minimum valid takeoff position in degrees.
   * @param maxTakeoffPosition The maximum valid takeoff position in degrees.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    private readonly minTakeoffPosition?: number,
    private readonly maxTakeoffPosition?: number,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `flap_warn_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing flap warning data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of this.publishTopics) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof ControlSurfacesDataEvents);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (this.publishTopics.has(topic)) {
        this.onTopicSubscribed(topic as keyof ControlSurfacesDataEvents);
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof ControlSurfacesDataEvents): void {
    const paused = this.state !== undefined && this.state !== AvionicsSystemState.On;

    let shouldSubLeftAngle = false;
    let shouldSubRightAngle = false;
    let shouldSubHandleIndex = false;
    let shouldSubTakeoffPosition = false;

    switch (topic) {
      case `flap_warn_flaps_handle_index_${this.index}`:
        shouldSubHandleIndex = true;
        break;
      case `flap_warn_flaps_left_angle_${this.index}`:
        shouldSubLeftAngle = true;
        break;
      case `flap_warn_flaps_right_angle_${this.index}`:
        shouldSubRightAngle = true;
        break;
      case `flap_warn_in_takeoff_position_${this.index}`:
        shouldSubLeftAngle = true;
        shouldSubRightAngle = true;
        shouldSubTakeoffPosition = true;
        break;
      case `flap_warn_valid_${this.index}`:
        this.onDataValidSubscribed();
        return;
    }

    if (shouldSubHandleIndex && !this.isHandleIndexSubbed) {
      this.isHandleIndexSubbed = true;

      const pubTopic = `flap_warn_flaps_handle_index_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('flaps_handle_index').handle(val => {
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
    if (shouldSubLeftAngle && !this.isLeftAngleSubbed) {
      this.isLeftAngleSubbed = true;

      const pubTopic = `flap_warn_flaps_left_angle_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('flaps_left_angle').handle(val => {
        this.leftAngle.set(val);
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
    if (shouldSubRightAngle && !this.isRightAngleSubbed) {
      this.isRightAngleSubbed = true;

      const pubTopic = `flap_warn_flaps_right_angle_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('flaps_right_angle').handle(val => {
        this.rightAngle.set(val);
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
    if (shouldSubTakeoffPosition && !this.isTakeoffPositionSubbed) {
      this.isTakeoffPositionSubbed = true;

      const pubTopic = `flap_warn_in_takeoff_position_${this.index}` as const;
      this.dataSubs.push(this.isInTakeoffPosition.sub(val => {
        this.publisher.pub(pubTopic, val, false, true);
      }, true, paused));
    }
  }

  /** Handles subscriptions to the data valid topic. */
  private onDataValidSubscribed(): void {
    if (this.isDataValidSubbed) {
      return;
    }
    this.isDataValidSubbed = true;

    this.dataSubs.push(this.isFlapDataValid.sub((v) => this.publisher.pub(this.flapWarningValidTopic, v, false, true), true));
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

    this.isFlapDataValid.set(currentState === AvionicsSystemState.On);
  }
}
