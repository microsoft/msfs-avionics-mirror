import { Subscription } from '../sub';
import { EventBus, EventBusMetaEvents } from './EventBus';

/**
 * Filters an event type record to only those topics that are associated with a given data type.
 */
type EventTopicDataTypeFilter<Events, DataType> = {
  [Topic in keyof Events as Events[Topic] extends DataType ? Topic : never]: Events[Topic]
};

/**
 * Republishes event bus topics.
 */
export class EventRepublisher<SourceEvents, TargetEvents> {
  private readonly metaEvents = this.bus.getSubscriber<EventBusMetaEvents>();
  private readonly sourceSubscriber = this.bus.getSubscriber<SourceEvents>();
  private readonly publisher = this.bus.getPublisher<TargetEvents>();

  private readonly republishes = new Map<number, Subscription>();

  private republishId = 0;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Starts republishing data from a source topic to a target topic. Republishing will begin as soon as the target
   * topic has at least one subscriber, or immediately if the target topic data is synced across instruments.
   * @param sourceTopic The source topic.
   * @param targetTopic The target topic.
   * @param sync Whether the target topic should be synced across instruments.
   * @param cache Whether the target topic data should be cached.
   * @returns A unique ID associated with the republish.
   */
  public startRepublish<
    Source extends keyof SourceEvents & string,
    Target extends keyof EventTopicDataTypeFilter<TargetEvents, SourceEvents[Source]>
  >(
    sourceTopic: Source,
    targetTopic: Target,
    sync: boolean,
    cache: boolean
  ): number;
  /**
   * Starts republishing data from a source topic to a target topic after the data has been transformed by a mapping
   * function. Republishing will begin as soon as the target topic has at least one subscriber, or immediately if the
   * target topic data is synced across instruments.
   * @param sourceTopic The source topic.
   * @param targetTopic The target topic.
   * @param sync Whether the target topic should be synced across instruments.
   * @param cache Whether the target topic data should be cached.
   * @param map A mapping function to use to transform the source data.
   * @returns A unique ID associated with the republish.
   */
  public startRepublish<
    Source extends keyof SourceEvents & string,
    Target extends keyof TargetEvents & string
  >(
    sourceTopic: Source,
    targetTopic: Target,
    sync: boolean,
    cache: boolean,
    map: (sourceData: SourceEvents[Source]) => TargetEvents[Target]
  ): number
  // eslint-disable-next-line jsdoc/require-jsdoc
  public startRepublish<
    Source extends keyof SourceEvents & string,
    Target extends keyof TargetEvents & string
  >(
    sourceTopic: Source,
    targetTopic: Target,
    sync: boolean,
    cache: boolean,
    map?: (sourceData: SourceEvents[Source]) => TargetEvents[Target]
  ): number {
    const id = this.republishId++;

    if (sync || this.bus.getTopicSubscriberCount(targetTopic) > 0) {
      this.registerRepublish(id, sourceTopic, targetTopic, sync, cache, map);
    } else {
      const topicSub = this.metaEvents.on('event_bus_topic_first_sub').handle(topic => {
        if (topic === targetTopic) {
          topicSub.destroy();
          this.registerRepublish(id, sourceTopic, targetTopic, sync, cache, map);
        }
      }, true);

      this.republishes.set(id, topicSub);

      topicSub.resume();
    }

    return id;
  }

  /**
   * Stops a republish handled by this publisher.
   * @param id The unique ID associated with the republish to stop.
   * @returns Whether the requested republish was stopped.
   */
  public stopRepublish(id: number): boolean {
    const republish = this.republishes.get(id);

    if (republish === undefined) {
      return false;
    }

    this.republishes.delete(id);
    republish.destroy();

    return true;
  }

  /**
   * Clears all republishes from this publisher.
   */
  public clearRepublishes(): void {
    for (const republish of this.republishes.values()) {
      republish.destroy();
    }

    this.republishes.clear();
  }

  /**
   * Registers a republish.
   * @param id A unique ID to associate with the republish.
   * @param sourceTopic The source topic.
   * @param targetTopic The target topic.
   * @param sync Whether the target topic should be synced across instruments.
   * @param cache Whether the target topic data should be cached.
   * @param map A mapping function to use to transform the source data.
   */
  private registerRepublish<
    Source extends keyof SourceEvents & string, Target extends keyof TargetEvents & string
  >(
    id: number,
    sourceTopic: Source,
    targetTopic: Target,
    sync: boolean,
    cache: boolean,
    map?: (sourceData: SourceEvents[Source]) => TargetEvents[Target]
  ): void {
    const handler = map === undefined
      ? (sourceData: SourceEvents[Source]): void => { this.publisher.pub(targetTopic, sourceData as unknown as TargetEvents[Target], sync, cache); }
      : (sourceData: SourceEvents[Source]): void => { this.publisher.pub(targetTopic, map(sourceData), sync, cache); };

    const republish = this.sourceSubscriber.on(sourceTopic).handle(handler, true);
    this.republishes.set(id, republish);

    republish.resume(true);
  }
}