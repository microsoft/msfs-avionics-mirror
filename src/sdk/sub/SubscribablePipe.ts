import { HandlerSubscription } from './HandlerSubscription';
import { MutableSubscribable, Subscribable } from './Subscribable';

/**
 * A pipe from an input subscribable to an output mutable subscribable. Each notification received by the pipe is used
 * to change the state of the output subscribable.
 */
export class SubscribablePipe<I, O, HandlerType extends (...args: any[]) => void> extends HandlerSubscription<HandlerType> {
  /**
   * Constructor.
   * @param from The input subscribable.
   * @param to The output mutable subscribable.
   * @param onDestroy A function which is called when this subscription is destroyed.
   */
  constructor(from: Subscribable<I>, to: MutableSubscribable<any, I>, onDestroy: (sub: SubscribablePipe<I, O, HandlerType>) => void);
  /**
   * Constructor.
   * @param from The input subscribable.
   * @param to The output mutable subscribable.
   * @param map A function which transforms this pipe's inputs.
   * @param onDestroy A function which is called when this subscription is destroyed.
   */
  constructor(from: Subscribable<I>, to: MutableSubscribable<any, O>, map: (fromVal: I, toVal: O) => O, onDestroy: (sub: SubscribablePipe<I, O, HandlerType>) => void);
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(
    from: Subscribable<I>,
    to: MutableSubscribable<any, I> | MutableSubscribable<any, O>,
    arg3: ((fromVal: I, toVal: O) => O) | ((sub: SubscribablePipe<I, O, HandlerType>) => void),
    arg4?: (sub: SubscribablePipe<I, O, HandlerType>) => void
  ) {
    let handler: (fromVal: I) => void;
    let onDestroy: (sub: SubscribablePipe<I, O, HandlerType>) => void;
    if (typeof arg4 === 'function') {
      handler = (fromVal: I): void => {
        (to as MutableSubscribable<any, O>).set((arg3 as (fromVal: I, toVal: O) => O)(fromVal, to.get()));
      };
      onDestroy = arg4;
    } else {
      handler = (fromVal: I): void => {
        (to as MutableSubscribable<any, I>).set(fromVal);
      };
      onDestroy = arg3 as (sub: SubscribablePipe<I, O, HandlerType>) => void;
    }

    super(handler as HandlerType, (sub) => { sub.handler(from.get()); }, onDestroy);
  }
}