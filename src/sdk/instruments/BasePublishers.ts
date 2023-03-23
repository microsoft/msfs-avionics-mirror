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
   * Whether the simvar is indexed. Indexes are positive integers. If the simvar is indexed, then the indexed simvars -
   * with the index replacing the `#index#` macro in the simvar name - will published to topics suffixed with
   * `_[index]`. The index-1 version of the simvar will be published to the unsuffixed topic in addition to the topic
   * suffixed with index 1.
   */
  indexed?: boolean;
};

/**
 * An entry for a fully resolved sim var publisher topic.
 */
type ResolvedSimVarPublisherEntry<T> = Omit<SimVarPublisherEntry<T>, 'indexed'>;

/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
export class SimVarPublisher<E extends Record<string, any>> extends BasePublisher<E> {
  protected static readonly INDEXED_REGEX = /(.*)_([1-9]\d*)$/;

  protected readonly resolvedSimVars = new Map<keyof E & string, ResolvedSimVarPublisherEntry<any>>();

  protected readonly indexedSimVars = new Map<keyof E & string, SimVarPublisherEntry<any>>();

  protected readonly subscribed = new Set<keyof E & string>();

  /**
   * Create a SimVarPublisher
   * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
   * @param bus The EventBus to use for publishing.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(
    simVarMap: Map<keyof E & string, SimVarPublisherEntry<any>>,
    bus: EventBus,
    pacer?: PublishPacer<E>
  ) {
    super(bus, pacer);

    for (const [topic, entry] of simVarMap) {
      if (entry.indexed) {
        this.indexedSimVars.set(topic, entry);
        this.resolveIndexedSimVar(topic, entry); // resolve indexed topic to its non-suffixed form
      } else {
        this.resolvedSimVars.set(topic, entry);
      }
    }

    const handleSubscribedTopic = (topic: string): void => {
      if (this.resolvedSimVars.has(topic)) {
        // If topic matches an already resolved topic -> start publishing.
        this.onTopicSubscribed(topic);
      } else {
        // Check if topic matches indexed topic.
        this.tryMatchIndexedSubscribedTopic(topic);
      }
    };

    // Iterate over each subscribed topic on the bus to see if it matches any of our topics. If so, start publishing.
    this.bus.forEachSubscribedTopic(handleSubscribedTopic);

    // Listen to first-time topic subscriptions. If any of them match our topics, start publishing.
    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(handleSubscribedTopic);
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

    if (!SimVarPublisher.INDEXED_REGEX.test(topic)) { // Don't generate an array if we don't have to.
      return;
    }

    const match = topic.match(SimVarPublisher.INDEXED_REGEX) as RegExpMatchArray;
    const [, matchedTopic, index] = match;
    const entry = this.indexedSimVars.get(matchedTopic);
    if (entry) {
      this.onTopicSubscribed(this.resolveIndexedSimVar(matchedTopic, entry, parseInt(index)));
    }
  }

  /**
   * Resolves an indexed topic with an index, generating a version of the topic which is mapped to an indexed simvar.
   * The resolved indexed topic can then be published.
   * @param topic The topic to resolve.
   * @param entry The entry of the topic to resolve.
   * @param index The index with which to resolve the topic. If not defined, the topic will resolve to itself (without
   * a suffix) and will be mapped the index-1 version of its simvar.
   * @returns The resolved indexed topic.
   */
  protected resolveIndexedSimVar(topic: keyof E & string, entry: SimVarPublisherEntry<any>, index?: number): string {
    const resolvedTopic = index === undefined ? topic : `${topic}_${index}`;

    if (this.resolvedSimVars.has(resolvedTopic)) {
      return resolvedTopic;
    }

    this.resolvedSimVars.set(resolvedTopic, { name: entry.name.replace('#index#', `${index ?? 1}`), type: entry.type, map: entry.map });

    return resolvedTopic;
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
    const entry = this.resolvedSimVars.get(topic);
    if (entry === undefined) {
      return undefined;
    }

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

