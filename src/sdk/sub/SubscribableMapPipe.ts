import { HandlerSubscription } from './HandlerSubscription';
import { MutableSubscribableMap, SubscribableMap, SubscribableMapEventType, SubscribableMapHandler } from './SubscribableMap';

/**
 * A pipe from an input subscribable map to an output mutable subscribable map. Each key-value pair
 * added/changed/removed notification received by the pipe is used to add/change/remove key-value pairs in the output
 * map.
 */
export class SubscribableMapPipe<K, V, HandlerType extends (map: ReadonlyMap<K, V>, type: SubscribableMapEventType, key: K, value: V, ...args: any[]) => void>
  extends HandlerSubscription<HandlerType> {

  /**
   * Constructor.
   * @param from The input subscribable map.
   * @param to The output mutable subscribable map.
   * @param onDestroy A function which is called when this subscription is destroyed.
   */
  constructor(from: SubscribableMap<K, V>, to: MutableSubscribableMap<K, V>, onDestroy: (sub: SubscribableMapPipe<K, V, HandlerType>) => void) {
    const handler: SubscribableMapHandler<K, V> = (map, type, key, value): void => {
      if (type === SubscribableMapEventType.Deleted) {
        to.delete(key);
      } else {
        to.setValue(key, value);
      }
    };

    const initialNotifyFunc = (): void => {
      const fromMap = from.get();

      for (const key of to.get().keys()) {
        if (!fromMap.has(key)) {
          to.delete(key);
        }
      }

      for (const [key, value] of fromMap) {
        to.setValue(key, value);
      }
    };

    super(handler as HandlerType, initialNotifyFunc, onDestroy);
  }
}