import { Consumer, EventBus, EventSubscriber } from '@microsoft/msfs-sdk';

import { BaseTerrainSystemEvents, TerrainSystemEventSuffix, TerrainSystemEventsForId } from './TerrainSystemEvents';

/**
 * A utility class for working with Garmin terrain alerting systems.
 */
export class TerrainSystemUtils {
  /**
   * Gets the event bus topic suffix for a terrain system ID.
   * @param id The ID for which to get the suffix.
   * @returns The event bus topic suffix for the specified terrain system ID.
   */
  public static getIdSuffix<ID extends string>(id: ID): TerrainSystemEventSuffix<ID> {
    return (id === '' ? '' : `_${id}`) as TerrainSystemEventSuffix<ID>;
  }

  /**
   * Subscribes to one of the event bus topics related to a terrain system with a given ID.
   * @param id The ID of the terrain system.
   * @param bus The event bus to which to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onEvent<ID extends string, K extends keyof BaseTerrainSystemEvents>(
    id: ID,
    bus: EventBus,
    baseTopic: K
  ): Consumer<BaseTerrainSystemEvents[K]>;
  /**
   * Subscribes to one of the event bus topics related to a terrain system with a given ID.
   * @param id The ID of the terrain system.
   * @param subscriber The event subscriber to use to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onEvent<ID extends string, K extends keyof BaseTerrainSystemEvents>(
    id: ID,
    subscriber: EventSubscriber<TerrainSystemEventsForId<ID>>,
    baseTopic: K
  ): Consumer<BaseTerrainSystemEvents[K]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static onEvent<ID extends string, K extends keyof BaseTerrainSystemEvents>(
    id: ID,
    arg2: EventBus | EventSubscriber<TerrainSystemEventsForId<ID>>,
    baseTopic: K
  ): Consumer<BaseTerrainSystemEvents[K]> {
    return (arg2 instanceof EventBus ? arg2.getSubscriber<TerrainSystemEventsForId<ID>>() : arg2).on(
      `${baseTopic}${TerrainSystemUtils.getIdSuffix(id)}` as keyof TerrainSystemEventsForId<ID> & string
    ) as unknown as Consumer<BaseTerrainSystemEvents[K]>;
  }
}
