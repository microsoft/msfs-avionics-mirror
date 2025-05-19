import { BasePublisher } from '../instruments/BasePublishers';

/**
 * Data describing an H event.
 */
export type HEventData = {
  /** The name of the H event. */
  readonly name: string;

  /** The arguments passed to the H event. */
  readonly args: readonly string[];
};

/**
 * Events related to H events.
 */
export interface HEvent {
  /** An H event was received. The value of the topic is the name of the H event. */
  hEvent: string;

  /** An H event was received. The value of the topic is the name of the H event. */
  hEvent_with_args: HEventData;
}

/**
 * A publisher for publishing H events on the bus.
 */
export class HEventPublisher extends BasePublisher<HEvent> {
  /**
   * Dispatches an H event to the event bus. If the H event has arguments, then it will be published to the event bus
   * under the `hEvent_with_args` topic. If the H event does not have any arguments, then it will be published to the
   * event bus under the `hEvent` topic.
   * @param hEvent The name and arguments of the H event to dispatch. The name of the H event should be the first
   * element of the array, followed by any arguments passed to the H event.
   * @param sync Whether this event should be synced to other instruments. Defaults to `false`.
   */
  public dispatchHEvent(hEvent: readonly string[], sync?: boolean): void;
  /**
   * Dispatches an H event without arguments to the event bus. The H event will be published under the `hEvent` topic.
   * @param hEvent The name of the H event to dispatch.
   * @param sync Whether this event should be synced to other instruments. Defaults to `false`.
   * @deprecated Please use the overload that takes an array of H event arguments instead.
   */
  public dispatchHEvent(hEvent: string, sync?: boolean): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public dispatchHEvent(hEvent: string | readonly string[], sync = false): void {
    let name: string;
    let args: string[] | undefined;

    if (typeof hEvent === 'string') {
      name = hEvent;
    } else {
      if (hEvent.length === 0) {
        return;
      }

      name = hEvent[0];
      if (hEvent.length > 1) {
        args = hEvent.slice(1);
      }
    }

    if (args) {
      this.publish('hEvent_with_args', { name, args }, sync, false);
    } else {
      this.publish('hEvent', name, sync, false);
    }
  }
}
