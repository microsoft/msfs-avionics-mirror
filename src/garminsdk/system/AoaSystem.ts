import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BasicAvionicsSystem, EventBus,
  EventBusMetaEvents, Subject, Subscribable, SubscribableUtils, Subscription, SystemPowerKey
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
};

/**
 * Events fired by the AoA system.
 */
export interface AoaSystemEvents extends AoaDataEvents {
  /** An event fired when the AoA system state changes. */
  [aoa_state: `aoa_state_${number}`]: AvionicsSystemStateEvent;

  /** An event fired when the data state of an AoA system changes. */
  [aoa_data_valid: `aoa_data_valid_${number}`]: boolean;
}

/**
 * Configuration options for {@link AoaSystem}.
 */
export type AoaSystemOptions = {
  /**
   * The airplane's critical (stall) angle of attack, in degrees. If not defined, then the system will use the value
   * reported by the sim.
   */
  stallAoa?: number | Subscribable<number>;

  /**
   * The airplane's zero-lift angle of attack, in degrees. If not defined, then the system will use the value reported
   * by the sim.
   */
  zeroLiftAoa?: number | Subscribable<number>;
};

/**
 * A Garmin angle of attack computer system.
 */
export class AoaSystem extends BasicAvionicsSystem<AoaSystemEvents> {
  protected initializationTime = 15000;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents>();

  private readonly dataSubs: Subscription[] = [];

  private readonly customStallAoa?: Subscribable<number>;
  private readonly customZeroLiftAoa?: Subscribable<number>;

  private aoa?: number;
  private stallAoa?: number;
  private zeroLiftAoa?: number;

  private isAoaSubbed = false;
  private isStallAoaSubbed = false;
  private isZeroLiftAoaSubbed = false;

  private isDataValid = true;

  private readonly aoaDataValidTopic = `aoa_data_valid_${this.index}` as const;
  private readonly normAoaTopic = `aoa_norm_aoa_${this.index}` as const;

  /**
   * Creates an instance of an angle of attack computer system.
   * @param index The index of the AoA computer.
   * @param bus An instance of the event bus.
   * @param powerSource The source from which to retrieve the system's power state. Can be an event bus topic defined
   * in {@link ElectricalEvents} with boolean-valued data, an XML logic element that evaluates to zero (false) or
   * non-zero (true) values, or a boolean-valued subscribable. If not defined, then the system will be considered
   * always powered on.
   * @param options Options with which to configure the system.
   */
  public constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement | Subscribable<boolean>,
    options?: Readonly<AoaSystemOptions>
  ) {
    super(index, bus, `aoa_state_${index}` as const);

    if (options) {
      this.customStallAoa = options.stallAoa ? SubscribableUtils.toSubscribable(options.stallAoa, true) : undefined;
      this.customZeroLiftAoa = options.zeroLiftAoa ? SubscribableUtils.toSubscribable(options.zeroLiftAoa, true) : undefined;
    }

    this.publisher.pub(this.aoaDataValidTopic, this.isDataValid, false, true);

    this.connectToPower(powerSource ?? Subject.create(true));

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
      `aoa_norm_aoa_${this.index}`
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
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof AoaDataEvents): void {
    const paused = this._state !== AvionicsSystemState.On;

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
      const handler = (val: number): void => {
        if (!isFinite(val)) {
          val = 0;
        }

        this.stallAoa = val;
        this.publisher.pub(pubTopic, val, false, true);
      };

      this.dataSubs.push(
        this.customStallAoa?.sub(handler, true, paused)
        ?? this.dataSourceSubscriber.on('stall_aoa').handle(handler, paused)
      );
    }
    if (shouldSubZeroLiftAoa && !this.isZeroLiftAoaSubbed) {
      this.isZeroLiftAoaSubbed = true;

      const pubTopic = `aoa_zero_lift_aoa_${this.index}` as const;
      const handler = (val: number): void => {
        if (!isFinite(val)) {
          val = 0;
        }

        this.zeroLiftAoa = val;
        this.publisher.pub(pubTopic, val, false, true);
      };

      this.dataSubs.push(
        this.customZeroLiftAoa?.sub(handler, true, paused)
        ?? this.dataSourceSubscriber.on('zero_lift_aoa').handle(handler, paused)
      );
    }
  }

  /** @inheritDoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    const isDataValid = currentState === AvionicsSystemState.On;

    if (isDataValid) {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }
    } else {
      for (const sub of this.dataSubs) {
        sub.pause();
      }
    }

    if (isDataValid !== this.isDataValid) {
      this.isDataValid = isDataValid;
      this.publisher.pub(this.aoaDataValidTopic, this.isDataValid, false, true);
    }
  }

  /** @inheritDoc */
  public onUpdate(): void {
    super.onUpdate();

    if (
      this._state !== AvionicsSystemState.On
      || this.aoa === undefined
      || this.stallAoa === undefined
      || this.zeroLiftAoa === undefined
    ) {
      return;
    }

    const normAoa = (this.aoa - this.zeroLiftAoa) / (this.stallAoa - this.zeroLiftAoa);

    this.publisher.pub(this.normAoaTopic, isFinite(normAoa) ? normAoa : 0, false, true);
  }
}
