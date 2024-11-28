import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BasicAvionicsSystem, EventBus, EventBusMetaEvents, SimVarPublisher, SimVarValueType,
  Subject, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Topics for bus events from which AoA data is sourced.
 */
type AoaDataSourceTopics = 'aoa' | 'stall_aoa' | 'zero_lift_aoa';

/**
 * Data events published by the AoA system.
 */
type AoaDataEvents = {
  [P in keyof Pick<BaseAdcEvents, AoaDataSourceTopics> as `aoa_${P}_${number}`]: BaseAdcEvents[P];
} & {
  /** Normalized angle of attack. A value of `0` is equal to zero-lift AoA, and a value of `1` is equal to stall AoA. */
  [aoa_norm_aoa: `aoa_norm_aoa_${number}`]: number;

  /** Load factor. */
  [aoa_load_factor: `aoa_load_factor_${number}`]: number;

  /** Whether the AOA data from this sensor is valid. */
  [aoa_data_valid: `aoa_data_valid_${number}`]: boolean;
};

/**
 * Events fired by the AoA system.
 */
export interface AoaSystemEvents extends AoaDataEvents {
  /** An event fired when the AoA system state changes. */
  [aoa_state: `aoa_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * An angle of attack computer system.
 */
export class AoaSystem extends BasicAvionicsSystem<AoaSystemEvents> {
  protected initializationTime = 5000;

  private readonly simVarPublisher = new SimVarPublisher(
    new Map([
      [`aoa_load_factor_${this.index}`, { name: 'SEMIBODY LOADFACTOR Y', type: SimVarValueType.Number }]
    ]),
    this.bus
  );

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents>();

  private readonly dataSubs: Subscription[] = [];

  private aoa?: number;
  private stallAoa?: number;
  private zeroLiftAoa?: number;

  private isAoaSubbed = false;
  private isStallAoaSubbed = false;
  private isZeroLiftAoaSubbed = false;
  private isDataValidSubbed = false;

  private readonly normAoaTopic = `aoa_norm_aoa_${this.index}` as const;

  private readonly isAoaDataValid = Subject.create(true);

  /**
   * Creates an instance of an angle of attack computer system.
   * @param index The index of the AoA computer.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `aoa_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing angle of attack data on the event bus.
   */
  private startDataPublish(): void {
    const topics = [
      `aoa_aoa_${this.index}`,
      `aoa_stall_aoa_${this.index}`,
      `aoa_zero_lift_aoa_${this.index}`,
      `aoa_norm_aoa_${this.index}`,
      `aoa_data_valid_${this.index}`,
    ] as const;

    for (const topic of topics) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topics.includes(topic as any)) {
        this.onTopicSubscribed(topic as keyof AoaDataEvents);
      }
    });

    this.simVarPublisher.startPublish();
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof AoaDataEvents): void {
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    let shouldSubAoa = false;
    let shouldSubStallAoa = false;
    let shouldSubZeroLiftAoa = false;

    switch (topic) {
      case `aoa_aoa_${this.index}`:
        shouldSubAoa = true;
        break;
      case `aoa_stall_aoa_${this.index}`:
        shouldSubStallAoa = true;
        break;
      case `aoa_zero_lift_aoa_${this.index}`:
        shouldSubZeroLiftAoa = true;
        break;
      case `aoa_norm_aoa_${this.index}`:
        shouldSubAoa = true;
        shouldSubStallAoa = true;
        shouldSubZeroLiftAoa = true;
        break;
      case `aoa_data_valid_${this.index}`:
        this.onDataValidSubscribed();
        return;
    }

    if (shouldSubAoa && !this.isAoaSubbed) {
      this.isAoaSubbed = true;

      const pubTopic = `aoa_aoa_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('aoa').handle(val => {
        this.aoa = val;
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
    if (shouldSubStallAoa && !this.isStallAoaSubbed) {
      this.isStallAoaSubbed = true;

      const pubTopic = `aoa_stall_aoa_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('stall_aoa').handle(val => {
        this.stallAoa = val;
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
    if (shouldSubZeroLiftAoa && !this.isZeroLiftAoaSubbed) {
      this.isZeroLiftAoaSubbed = true;

      const pubTopic = `aoa_zero_lift_aoa_${this.index}` as const;
      this.dataSubs.push(this.dataSourceSubscriber.on('zero_lift_aoa').handle(val => {
        this.zeroLiftAoa = val;
        this.publisher.pub(pubTopic, val, false, true);
      }, paused));
    }
  }

  /** Handles subscriptions to the data valid topic. */
  private onDataValidSubscribed(): void {
    if (this.isDataValidSubbed) {
      return;
    }
    this.isDataValidSubbed = true;

    const pubTopic = `aoa_data_valid_${this.index}` as const;
    this.dataSubs.push(this.isAoaDataValid.sub((v) => this.publisher.pub(pubTopic, v, false, true), true));
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

    this.isAoaDataValid.set(currentState === AvionicsSystemState.On);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    if (
      this._state === AvionicsSystemState.Failed
      || this._state === AvionicsSystemState.Off
      || this.aoa === undefined
      || this.stallAoa === undefined
      || this.zeroLiftAoa === undefined
    ) {
      return;
    }

    this.publisher.pub(this.normAoaTopic, (this.aoa - this.zeroLiftAoa) / (this.stallAoa - this.zeroLiftAoa), false, true);

    this.simVarPublisher.onUpdate();
  }
}
