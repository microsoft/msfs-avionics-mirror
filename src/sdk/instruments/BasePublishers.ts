import { EventBus, EventBusMetaEvents, MockEventTypes, Publisher } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarDefinition, SimVarValueType } from '../data/SimVars';

/**
 * A basic event-bus publisher.
 */
export class BasePublisher<E extends Record<string, any>> {

  protected readonly bus: EventBus;
  protected readonly publisher: Publisher<E>;
  protected publishActive: boolean;
  protected readonly pacer: PublishPacer<E> | undefined;

  /**
   * Creates an instance of BasePublisher.
   * @param bus The common event bus.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer: PublishPacer<E> | undefined = undefined) {
    this.bus = bus;
    this.publisher = this.bus.getPublisher<E>();
    this.publishActive = false;
    this.pacer = pacer;
  }

  /**
   * Start publishing.
   */
  public startPublish(): void {
    this.publishActive = true;
  }

  /**
   * Stop publishing.
   */
  public stopPublish(): void {
    this.publishActive = false;
  }

  /**
   * Tells whether or not the publisher is currently active.
   * @returns True if the publisher is active, false otherwise.
   */
  public isPublishing(): boolean {
    return this.publishActive;
  }

  /**
   * A callback called when the publisher receives an update cycle.
   */
  public onUpdate(): void {
    return;
  }

  /**
   * Publish a message if publishing is acpive
   * @param topic The topic key to publish to.
   * @param data The data type for chosen topic.
   * @param sync Whether or not the event should be synced to other instruments. Defaults to `false`.
   * @param isCached Whether or not the event should be cached. Defaults to `true`.
   */
  protected publish<K extends keyof E>(topic: K, data: E[K], sync = false, isCached = true): void {
    if (this.publishActive && (!this.pacer || this.pacer.canPublish(topic, data))) {
      this.publisher.pub(topic, data, sync, isCached);
    }
  }
}

/**
 * A publisher that sends a constant stream of random numbers.
 */
export class RandomNumberPublisher extends BasePublisher<MockEventTypes> {
  /**
   * Start publishing random numbers.
   */
  public startPublish(): void {
    super.startPublish();
    this.publishRandomNumbers();
  }

  /**
   * Async thread that publishes random numbers
   * @param ms - Milliseconds to sleep between publishes
   */
  private async publishRandomNumbers(ms = 1000): Promise<any> {
    while (this.isPublishing()) {
      const newVal = Math.floor(Math.random() * ms);
      this.publish('randomNumber', newVal, true);
      await new Promise(r => setTimeout(r, ms));
    }
  }
}

/**
 * An entry for a sim var publisher topic.
 */
export type SimVarPublisherEntry<T> = SimVarDefinition & {
  /**
   * A function which maps the raw simvar value to the value to be published to the event bus. If not defined, the
   * raw simvar value will be published to the bus as-is.
   */
  map?: (value: any) => T;

  /**
   * Whether the simvar is indexed. Indexes are non-negative integers. To declare an indexed simvar, this value must be
   * either (1) an iterable of valid indexes, or (2) `true` (in which case all non-negative indexes are considered
   * valid). If the simvar is indexed, then the indexed simvars - with the index replacing the `#index#` macro in the
   * simvar name - will published to topics suffixed with `_[index]`. If `defaultIndex` is not null, then that simvar
   * index will also be published to the unsuffixed topic. Defaults to `false`.
   */
  indexed?: boolean | Iterable<number>;

  /**
   * The default simvar index to publish to the unsuffixed topic, or `null` if the unsuffixed topic should not be
   * published. Ignored if the simvar is not indexed. Defaults to `1`.
   */
  defaultIndex?: number | null;
};

/**
 * An entry describing an indexed sim var publisher topic.
 */
type IndexedSimVarPublisherEntry<T> = Omit<SimVarPublisherEntry<T>, 'indexed'> & {
  /** The valid indexes for the topic, or `undefined` if all non-negative integer indexes are valid. */
  indexes: Set<number> | undefined;
};

/**
 * An entry describing a fully resolved sim var publisher topic.
 */
type ResolvedSimVarPublisherEntry<T> = Omit<SimVarPublisherEntry<T>, 'indexed' | 'defaultIndex'> & {
  /**
   * An additional unsuffixed topic to which to publish the entry's simvar value. Should only be defined for indexed
   * simvar topics that have been resolved to the topic's default index.
   */
  unsuffixedTopic?: string;
};

/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
export class SimVarPublisher<Events extends Record<string, any>, IndexedEventRoots extends Record<string, any> = Events> extends BasePublisher<Events> {
  protected static readonly INDEXED_REGEX = /(.*)_(0|[1-9]\d*)$/;

  protected readonly resolvedSimVars = new Map<keyof Events & string, ResolvedSimVarPublisherEntry<any>>();

  protected readonly indexedSimVars = new Map<keyof IndexedEventRoots & string, IndexedSimVarPublisherEntry<any>>();

  protected readonly subscribed = new Set<keyof Events & string>();

  /**
   * Creates a new instance of SimVarPublisher.
   * @param entries Entries describing the SimVars to publish.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(
    entries: Iterable<readonly [keyof (Events & IndexedEventRoots) & string, SimVarPublisherEntry<any>]>,
    bus: EventBus,
    pacer?: PublishPacer<Events>
  ) {
    super(bus, pacer);

    for (const [topic, entry] of entries) {
      if (entry.indexed) {
        this.indexedSimVars.set(topic, {
          name: entry.name,
          type: entry.type,
          map: entry.map,
          indexes: entry.indexed === true ? undefined : new Set(entry.indexed),
          defaultIndex: entry.defaultIndex,
        });
      } else {
        this.resolvedSimVars.set(topic, { ...entry });
      }
    }

    const handleSubscribedTopic = this.handleSubscribedTopic.bind(this);

    // Iterate over each subscribed topic on the bus to see if it matches any of our topics. If so, start publishing.
    this.bus.forEachSubscribedTopic(handleSubscribedTopic);

    // Listen to first-time topic subscriptions. If any of them match our topics, start publishing.
    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(handleSubscribedTopic);
  }

  /**
   * Handles when an event bus topic is subscribed to for the first time.
   * @param topic The subscribed topic.
   */
  protected handleSubscribedTopic(topic: string): void {
    if (this.resolvedSimVars.has(topic)) {
      // If topic matches an already resolved topic -> start publishing.
      this.onTopicSubscribed(topic);
    } else {
      // Check if topic matches indexed topic.
      this.tryMatchIndexedSubscribedTopic(topic);
    }
  }

  /**
   * Checks if a subscribed topic matches one of this publisher's indexed topics, and if so resolves and starts
   * publishing the indexed topic.
   * @param topic The subscribed topic to check.
   */
  protected tryMatchIndexedSubscribedTopic(topic: string): void {
    if (this.indexedSimVars.size === 0) {
      return;
    }

    let entry = this.indexedSimVars.get(topic);
    if (entry) {
      // The subscribed topic matches an unsuffixed topic -> check if the unsuffixed topic should be published and if
      // so, resolve the default index.
      if (entry.defaultIndex !== null) {
        const resolved = this.resolveIndexedSimVar(topic, entry, entry.defaultIndex ?? 1);
        if (resolved !== undefined) {
          this.onTopicSubscribed(resolved);
        }
      }
      return;
    }

    if (!SimVarPublisher.INDEXED_REGEX.test(topic)) { // Don't generate an array if we don't have to.
      return;
    }

    const match = topic.match(SimVarPublisher.INDEXED_REGEX) as RegExpMatchArray;
    const [, matchedTopic, index] = match;
    entry = this.indexedSimVars.get(matchedTopic);
    if (entry) {
      const resolved = this.resolveIndexedSimVar(matchedTopic, entry, parseInt(index));
      if (resolved !== undefined) {
        this.onTopicSubscribed(resolved);
      }
    }
  }

  /**
   * Attempts to resolve an indexed topic with an index, generating a version of the topic which is mapped to an
   * indexed simvar. The resolved indexed topic can then be published.
   * @param topic The topic to resolve.
   * @param entry The entry of the topic to resolve.
   * @param index The index with which to resolve the topic. If not defined, the topic will resolve to itself (without
   * a suffix) and will be mapped the index-1 version of its simvar.
   * @returns The resolved indexed topic, or `undefined` if the topic could not be resolved with the specified index.
   */
  protected resolveIndexedSimVar(topic: keyof IndexedEventRoots & string, entry: IndexedSimVarPublisherEntry<any>, index: number): string | undefined {
    index ??= 1;
    const resolvedTopic = `${topic}_${index}`;

    if (this.resolvedSimVars.has(resolvedTopic)) {
      return resolvedTopic;
    }

    const defaultIndex = entry.defaultIndex === undefined ? 1 : entry.defaultIndex;

    // Ensure that the index we are trying to resolve is a valid index for the topic.
    if (entry.indexes !== undefined && !entry.indexes.has(index)) {
      return undefined;
    }

    this.resolvedSimVars.set(resolvedTopic, {
      name: entry.name.replace('#index#', `${index ?? 1}`),
      type: entry.type,
      map: entry.map,
      unsuffixedTopic: defaultIndex === index ? topic : undefined
    });

    return resolvedTopic;
  }

  /**
   * Responds to when one of this publisher's topics is subscribed to for the first time.
   * @param topic The topic that was subscribed to.
   */
  protected onTopicSubscribed(topic: keyof Events & string): void {
    if (this.subscribed.has(topic)) {
      return;
    }

    this.subscribed.add(topic);

    // Immediately publish the current value if publishing is active.
    if (this.publishActive) {
      this.publishTopic(topic);
    }
  }

  /**
   * NOOP - For backwards compatibility.
   * @deprecated
   * @param data Key of the event type in the simVarMap
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public subscribe(data: keyof Events): void {
    return;
  }

  /**
   * NOOP - For backwards compatibility.
   * @deprecated
   * @param data Key of the event type in the simVarMap
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unsubscribe(data: keyof Events): void {
    return;
  }

  /**
   * Publish all subscribed data points to the bus.
   */
  public onUpdate(): void {
    for (const topic of this.subscribed.values()) {
      this.publishTopic(topic);
    }
  }

  /**
   * Publishes data to the event bus for a topic.
   * @param topic The topic to publish.
   */
  protected publishTopic(topic: keyof Events & string): void {
    const entry = this.resolvedSimVars.get(topic);
    if (entry !== undefined) {
      const value = this.getValueFromEntry(entry);
      this.publish(topic, value);

      // Check if we need to publish the same value to the unsuffixed version of the topic.
      if (entry.unsuffixedTopic) {
        this.publish(entry.unsuffixedTopic, value);
      }
    }
  }

  /**
   * Gets the current value for a topic.
   * @param topic A topic.
   * @returns The current value for the specified topic.
   */
  protected getValue<K extends keyof Events & string>(topic: K): Events[K] | undefined {
    const entry = this.resolvedSimVars.get(topic);
    if (entry === undefined) {
      return undefined;
    }

    return this.getValueFromEntry(entry);
  }

  /**
   * Gets the current value for a resolved topic entry.
   * @param entry An entry for a resolved topic.
   * @returns The current value for the specified entry.
   */
  protected getValueFromEntry<T>(entry: ResolvedSimVarPublisherEntry<T>): T {
    return entry.map === undefined
      ? this.getSimVarValue(entry)
      : entry.map(this.getSimVarValue(entry));
  }

  /**
   * Gets the value of the SimVar
   * @param entry The SimVar definition entry
   * @returns The value of the SimVar
   */
  private getSimVarValue(entry: ResolvedSimVarPublisherEntry<any>): any {
    const svValue = SimVar.GetSimVarValue(entry.name, entry.type);
    if (entry.type === SimVarValueType.Bool) {
      return svValue === 1;
    }
    return svValue;
  }
}


/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
export class GameVarPublisher<E extends Record<string, any>> extends BasePublisher<E> {
  protected readonly simvars: Map<keyof E & string, SimVarPublisherEntry<any>>;
  protected readonly subscribed: Set<keyof E & string>;

  /**
   * Create a SimVarPublisher
   * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
   * @param bus The EventBus to use for publishing.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(
    simVarMap: Map<keyof E & string, SimVarDefinition>,
    bus: EventBus,
    pacer?: PublishPacer<E>
  ) {
    super(bus, pacer);

    this.simvars = simVarMap;
    this.subscribed = new Set();

    // Start polling all simvars for which there are existing subscriptions.
    for (const topic of this.simvars.keys()) {
      if (bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic);
      }
    }

    bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(
      (topic: string) => {
        if (this.simvars.has(topic as any)) {
          this.onTopicSubscribed(topic as keyof E & string);
        }
      });
  }

  /**
   * Responds to when one of this publisher's topics is subscribed to for the first time.
   * @param topic The topic that was subscribed to.
   */
  protected onTopicSubscribed(topic: keyof E & string): void {
    if (this.subscribed.has(topic)) {
      return;
    }

    this.subscribed.add(topic);

    // Immediately publish the current value if publishing is active.
    if (this.publishActive) {
      this.publishTopic(topic);
    }
  }

  /**
   * NOOP - For backwards compatibility.
   * @deprecated
   * @param data Key of the event type in the simVarMap
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public subscribe(data: keyof E): void {
    return;
  }

  /**
   * NOOP - For backwards compatibility.
   * @deprecated
   * @param data Key of the event type in the simVarMap
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unsubscribe(data: keyof E): void {
    return;
  }

  /**
   * Publish all subscribed data points to the bus.
   */
  public onUpdate(): void {
    for (const topic of this.subscribed.values()) {
      this.publishTopic(topic);
    }
  }

  /**
   * Publishes data to the event bus for a topic.
   * @param topic The topic to publish.
   */
  protected publishTopic(topic: keyof E & string): void {
    const value = this.getValue(topic);
    if (value !== undefined) {
      this.publish(topic, value);
    }
  }

  /**
   * Gets the current value for a topic.
   * @param topic A topic.
   * @returns The current value for the specified topic.
   */
  protected getValue<K extends keyof E & string>(topic: K): E[K] | undefined {
    const entry = this.simvars.get(topic);
    if (entry === undefined) {
      return undefined;
    }

    return entry.map === undefined
      ? this.getGameVarValue(entry)
      : entry.map(this.getGameVarValue(entry));
  }

  /**
   * Gets the value of the SimVar
   * @param entry The SimVar definition entry
   * @returns The value of the SimVar
   */
  private getGameVarValue(entry: SimVarPublisherEntry<any>): any {
    const svValue = SimVar.GetGameVarValue(entry.name, entry.type);
    if (entry.type === SimVarValueType.Bool) {
      return svValue === 1;
    }
    return svValue;
  }
}

