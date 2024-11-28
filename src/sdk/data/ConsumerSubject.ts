import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { Subscription } from '../sub/Subscription';
import { Consumer } from './Consumer';

/**
 * A subscribable subject which derives its value from an event consumer.
 */
export class ConsumerSubject<T> extends AbstractSubscribable<T> implements Subscription {
  /** @inheritDoc */
  public readonly canInitialNotify = true;

  private readonly consumerHandler = this.onEventConsumed.bind(this);

  private value: T;
  private isValueConsumed = false;
  private consumerSub?: Subscription;

  private needSetDefaultValue = false;
  private defaultValue?: T;

  private _isAlive = true;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether this subject is alive. While alive, this subject will update its value from its event consumer unless it
   * is paused. Once dead, this subject will no longer update its value and cannot be resumed again.
   */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  private _isPaused = false;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether event consumption is currently paused for this subject. While paused, this subject's value will not
   * update.
   */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Constructor.
   * @param consumer The event consumer from which this subject obtains its value. If null, this subject's value will
   * not be updated until its consumer is set to a non-null value.
   * @param initialVal This subject's initial value.
   * @param equalityFunc The function this subject uses check for equality between values.
   * @param mutateFunc The function this subject uses to change its value. If not defined, variable assignment is used
   * instead.
   */
  private constructor(
    consumer: Consumer<T> | null,
    initialVal: T,
    private readonly equalityFunc: (a: T, b: T) => boolean,
    private readonly mutateFunc?: (oldVal: T, newVal: T) => void,
  ) {
    super();

    this.value = initialVal;
    this.consumerSub = consumer?.handle(this.consumerHandler);
  }

  /**
   * Creates a new instance of ConsumerSubject.
   * @param consumer The consumer from which the new subject obtains its value. If null, the new subject's value will
   * not be updated until the subject's consumer is set to a non-null value.
   * @param initialVal The new subject's initial value.
   * @param equalityFunc The function to use to check for equality between values. Defaults to the strict equality
   * comparison (`===`).
   */
  public static create<T>(
    consumer: Consumer<T> | null,
    initialVal: T,
    equalityFunc?: (a: T, b: T) => boolean
  ): ConsumerSubject<T>;
  /**
   * Creates a new instance of ConsumerSubject.
   * @param consumer The consumer from which the new subject obtains its value. If null, the new subject's value will
   * not be updated until the subject's consumer is set to a non-null value.
   * @param initialVal The new subject's initial value.
   * @param equalityFunc The function to use to check for equality between values.
   * @param mutateFunc The function to use to change the new subject's value.
   */
  public static create<T>(
    consumer: Consumer<T> | null,
    initialVal: T,
    equalityFunc: (a: T, b: T) => boolean,
    mutateFunc: (oldVal: T, newVal: T) => void
  ): ConsumerSubject<T>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create<T>(
    consumer: Consumer<T> | null,
    initialVal: T,
    equalityFunc?: (a: T, b: T) => boolean,
    mutateFunc?: (oldVal: T, newVal: T) => void
  ): ConsumerSubject<T> {
    return new ConsumerSubject(consumer, initialVal, equalityFunc ?? AbstractSubscribable.DEFAULT_EQUALITY_FUNC, mutateFunc);
  }

  /**
   * Sets this subject's value and notifies subscribers if the value changed.
   * @param value The value to set.
   */
  private setValue(value: T): void {
    if (!this.equalityFunc(this.value, value)) {
      if (this.mutateFunc) {
        this.mutateFunc(this.value, value);
      } else {
        this.value = value;
      }
      this.notify();
    }
  }

  /**
   * Consumes an event.
   * @param value The value of the event.
   */
  private onEventConsumed(value: T): void {
    this.isValueConsumed = true;

    if (this.needSetDefaultValue) {
      this.needSetDefaultValue = false;
      delete this.defaultValue;
    }

    this.setValue(value);
  }

  /** @inheritDoc */
  public get(): T {
    return this.value;
  }

  /**
   * Sets the consumer from which this subject derives its value. If the consumer is null, this subject's value will
   * not be updated until a non-null consumer is set.
   * @param consumer An event consumer.
   * @returns This subject, after its consumer has been set.
   */
  public setConsumer(consumer: Consumer<T> | null): this {
    if (!this._isAlive) {
      return this;
    }

    this.needSetDefaultValue = false;
    delete this.defaultValue;

    this.consumerSub?.destroy();
    this.consumerSub = consumer?.handle(this.consumerHandler, this._isPaused);

    return this;
  }

  /**
   * Sets the consumer from which this subject derives its value and designates a default value to set if an event is
   * not immediately consumed from the new consumer when this subject is resumed. If the consumer is null, then this
   * subject's value will be set to the default value.
   * @param consumer An event consumer.
   * @param defaultVal The default value to set if the new consumer is null or if an event is not immediately consumed
   * from the new consumer when this subject is resumed.
   * @returns This subject, after its consumer has been set.
   */
  public setConsumerWithDefault(consumer: Consumer<T> | null, defaultVal: T): this {
    if (!this._isAlive) {
      return this;
    }

    this.defaultValue = defaultVal;
    this.needSetDefaultValue = true;

    this.consumerSub?.destroy();
    this.consumerSub = consumer?.handle(this.consumerHandler, this._isPaused);

    if (!this._isPaused && this.needSetDefaultValue) {
      const defaultValue = this.defaultValue;

      this.needSetDefaultValue = false;
      delete this.defaultValue;

      this.setValue(defaultValue);
    }

    return this;
  }

  /**
   * Resets this subject to an initial value and optionally sets a new consumer from which this subject will derive its
   * value. If the consumer is null, then this subject's value will not be updated until a non-null consumer is set.
   * 
   * The reset is treated as an atomic operation. If a non-null consumer is set and a consumed value immediately
   * replaces the initial value, then subscribers to this subject will only be notified of the change to the consumed
   * value instead of to both the change to the initial value and then to the consumed value.
   * @param initialVal The initial value to which to reset this subject.
   * @param consumer An event consumer. Defaults to `null`.
   * @returns This subject, after it has been reset.
   */
  public reset(initialVal: T, consumer: Consumer<T> | null = null): this {
    if (!this._isAlive) {
      return this;
    }

    this.isValueConsumed = false;
    this.needSetDefaultValue = false;
    delete this.defaultValue;

    this.consumerSub?.destroy();
    this.consumerSub = consumer?.handle(this.consumerHandler, this._isPaused);

    if (!this.isValueConsumed) {
      this.setValue(initialVal);
    }

    return this;
  }

  /**
   * Pauses consuming events for this subject. Once paused, this subject's value will not be updated.
   * @returns This subject, after it has been paused.
   */
  public pause(): this {
    if (this._isPaused) {
      return this;
    }

    this.consumerSub?.pause();
    this._isPaused = true;

    return this;
  }

  /**
   * Resumes consuming events for this subject. Once resumed, this subject's value will be updated from consumed
   * events. When this subject is resumed, it immediately updates its value from its event consumer, if one exists.
   *
   * Any `initialNotify` argument passed to this method is ignored. This subject is always immediately notified of its
   * event consumer's value when resumed.
   * @returns This subject, after it has been resumed.
   */
  public resume(): this {
    if (!this._isPaused) {
      return this;
    }

    this._isPaused = false;
    this.consumerSub?.resume(true);

    if (this.needSetDefaultValue) {
      const defaultValue = this.defaultValue as T;

      this.needSetDefaultValue = false;
      delete this.defaultValue;

      this.setValue(defaultValue);
    }

    return this;
  }

  /**
   * Destroys this subject. Once destroyed, it will no longer consume events to update its value.
   */
  public destroy(): void {
    this._isAlive = false;
    this.consumerSub?.destroy();
  }
}