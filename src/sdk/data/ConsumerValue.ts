import { Accessible } from '../sub/Accessible';
import { Subscription } from '../sub/Subscription';
import { Consumer } from './Consumer';

/**
 * A read-only {@link ConsumerValue}.
 */
export type ReadonlyConsumerValue<T> = Pick<ConsumerValue<T>, 'get' | 'isAlive' | 'isPaused'>;

/**
 * Captures the state of a value from a consumer.
 */
export class ConsumerValue<T> implements Accessible<T>, Subscription {
  /** @inheritDoc */
  public readonly canInitialNotify = true;

  private readonly consumerHandler = (v: T): void => { this.value = v; };

  private value: T;
  private sub?: Subscription;

  private _isAlive = true;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether this object is alive. While alive, this object will update its value from its event consumer unless it
   * is paused. Once dead, this object will no longer update its value and cannot be resumed again.
   */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  private _isPaused = false;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether event consumption is currently paused. While paused, this object's value will not update.
   */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Creates an instance of a ConsumerValue.
   * @param consumer The consumer to track.
   * @param initialValue The initial value.
   */
  private constructor(consumer: Consumer<T> | null, initialValue: T) {
    this.value = initialValue;
    this.sub = consumer?.handle(this.consumerHandler);
  }

  /** @inheritDoc */
  public get(): T {
    return this.value;
  }

  /**
   * Sets the consumer from which this object derives its value. If the consumer is null, this object's value will
   * not be updated until a non-null consumer is set.
   * @param consumer An event consumer.
   * @returns This object, after its consumer has been set.
   */
  public setConsumer(consumer: Consumer<T> | null): this {
    if (!this._isAlive) {
      return this;
    }

    this.sub?.destroy();
    this.sub = consumer?.handle(this.consumerHandler, this._isPaused);

    return this;
  }

  /**
   * Pauses consuming events for this object. Once paused, this object's value will not be updated.
   * @returns This object, after it has been paused.
   */
  public pause(): this {
    if (this._isPaused) {
      return this;
    }

    this.sub?.pause();
    this._isPaused = true;

    return this;
  }

  /**
   * Resumes consuming events for this object. Once resumed, this object's value will be updated from consumed
   * events.
   *
   * Any `initialNotify` argument passed to this method is ignored. This object is always immediately notified of its
   * event consumer's value when resumed.
   * @returns This object, after it has been resumed.
   */
  public resume(): this {
    if (!this._isPaused) {
      return this;
    }

    this._isPaused = false;
    this.sub?.resume(true);

    return this;
  }

  /**
   * Destroys this object. Once destroyed, it will no longer consume events to update its value.
   */
  public destroy(): void {
    this._isAlive = false;
    this.sub?.destroy();
  }

  /**
   * Creates a new ConsumerValue.
   * @param consumer The consumer to track.
   * @param initialValue The initial value.
   * @returns The created ConsumerValue.
   */
  public static create<T>(consumer: Consumer<T> | null, initialValue: T): ConsumerValue<T> {
    return new ConsumerValue<T>(consumer, initialValue);
  }
}