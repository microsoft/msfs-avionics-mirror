import { Subscription } from './Subscription';

/**
 * A {@link Subscription} which executes a handler function every time it receives a notification.
 */
export class HandlerSubscription<HandlerType extends (...args: any[]) => void> implements Subscription {
  
  // Note: isAlive and isPaused used to be getters (to avoid mutation from consumers)
  //       but this has a non negligeable overhead in the publishers hotpath.
  //       So instead, the two properties are declared readonly, but will actually be mutated
  //       by this class ONLY, using casts.

  /** @inheritdoc */
  public readonly isAlive = true;

  /**
   * Whether this subscription is paused. Paused subscriptions do not receive notifications from their sources until
   * they are resumed.
   *
   * Note that `!isAlive` implies `isPaused` for `HandlerSubscription`
   * @override 
   */
  public readonly isPaused = false;

  /** @inheritdoc */
  public readonly canInitialNotify: boolean;

  /**
   * Constructor.
   * @param handler This subscription's handler. The handler will be called each time this subscription receives a
   * notification from its source.
   * @param initialNotifyFunc A function which sends initial notifications to this subscription. If not defined, this
   * subscription will not support initial notifications.
   * @param onDestroy A function which is called when this subscription is destroyed.
   */
  constructor(
    public readonly handler: HandlerType,
    private readonly initialNotifyFunc?: (sub: HandlerSubscription<HandlerType>) => void,
    private readonly onDestroy?: (sub: HandlerSubscription<HandlerType>) => void
  ) {
    this.canInitialNotify = initialNotifyFunc !== undefined;
  }

  /**
   * Sends an initial notification to this subscription.
   * @throws Error if this subscription is not alive.
   */
  public initialNotify(): void {
    if (!this.isAlive) {
      throw new Error('HandlerSubscription: cannot notify a dead Subscription.');
    }

    this.initialNotifyFunc && this.initialNotifyFunc(this);
  }

  /** @inheritdoc */
  public pause(): this {
    if (!this.isAlive) {
      throw new Error('Subscription: cannot pause a dead Subscription.');
    }

    (this.isPaused as boolean) = true; // See comment at definition for cast info

    return this;
  }

  /** @inheritdoc */
  public resume(initialNotify = false): this {
    if (!this.isAlive) {
      throw new Error('Subscription: cannot resume a dead Subscription.');
    }

    if (!this.isPaused) {
      return this;
    }

    (this.isPaused as boolean) = false; // See comment at definition for cast info

    if (initialNotify) {
      this.initialNotify();
    }

    return this;
  }

  /** @inheritdoc */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    (this.isAlive as boolean) = false; // See comment at definition for cast info
    // Note: We rely on dead subscriptions to be paused to avoid checking both
    (this.isPaused as boolean) = true; // See comment at definition for cast info

    this.onDestroy && this.onDestroy(this);
  }
}