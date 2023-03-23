import { Consumer } from '../data';
import { MutableSubscribable, SubEvent, Subscribable, Subscription } from '../sub';

/**
 * For a given T, if it extends U | null, U, otherwise T
 */
export type NeverNull<T> = T extends (infer U | null) ? U : T

/**
 * A structure representing a source of named data that can be modified
 */
export class DataInterface<T, U = T> {

  /**
   * Constructs a new `ModifiableDataSource`
   *
   * @param input  an input for data
   * @param modify a callback when the data needs to be modified
   */
  constructor(
    public readonly input: Subscribable<T> | Consumer<T>,
    public modify: (value: U) => void,
  ) {
    // super(input);
  }

  /** Creates a new DataInterface with a new modifier
   * @deprecated
   * @param modify the new modifier
   * @returns the new DataInterface
   */
  public modifiable<V = T>(modify: (value: V) => void): DataInterface<T, V> {
    return new DataInterface<T, V>(this.input, modify);
  }

  /**
   * Creates a {@link DataInterface} from a {@link MutableSubscribable}
   * @param sub the {@link MutableSubscribable} to bind to
   * @returns the {@link DataInterface}
   */
  public static fromMutSubscribable<T>(sub: MutableSubscribable<T>): DataInterface<T> {
    return new DataInterface(sub, (value) => sub.set(value));
  }

  /**
   * Creates a {@link DataInterface} from a {@link Consumer}
   * @param consumer the {@link Consumer} to bind to (get)
   * @param modifier the modifier to use when the value is modified (set)
   * @returns the {@link DataInterface}
   */
  public static fromConsumer<T>(consumer: Consumer<T>, modifier: (value: T) => void): DataInterface<T> {
    return new DataInterface(consumer, (value) => modifier(value));
  }

}

/**
 * Class that manages a handler for a subscribable.
 *
 * The {@link pause} method is used to uncouple the handler when the binding must be disposed of
 */
export class Binding<T> implements Subscription {
  protected readonly sub: Subscription;

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this binding is paused. */
  public get isPaused(): boolean {
    return this.sub.isPaused;
  }

  /** @inheritDoc */
  public get isAlive(): boolean {
    return this.sub.isAlive;
  }

  canInitialNotify = false;

  /**
   * Constructs a `Binding`
   *
   * @param input   a {@link DataSource} for the binding
   * @param valueHandler a handler for when the value changes from the `DataSource`
   * */
  constructor(
    protected input: Subscribable<T> | Consumer<T>,
    protected valueHandler: (value: T) => any,
  ) {
    if ('isConsumer' in this.input) {
      this.sub = this.input.handle((data: T) => this.valueHandler(data));
    } else {
      this.canInitialNotify = true;
      this.sub = this.input.sub((data: T) => this.valueHandler(data), this.canInitialNotify, true);
    }
  }

  // /**
  //  * @param value
  //  */
  // private proxyValueHandler(value: T): void {
  //   this.valueHandler(this, value);
  // }

  /**
   * Stops the binding and cancels the handler.
   * @returns This binding, after it has been paused.
   */
  public pause(): this {
    this.sub.pause();
    return this;
  }

  /**
   * Restarts the binding and re-instates the handler.
   * @returns This binding, after it has been resumed.
   */
  public resume(): this {
    this.sub.resume(true);
    return this;
  }

  /**
   * Destroys this binding.
   */
  public destroy(): void {
    this.sub.destroy();
  }
}

/**
 * A binding between a data source, a new value handler and a source of changes to make to that value
 */
export class TwoWayBinding<T, U = T> extends Binding<T>{

  protected readonly editSub: Subscription;

  /**
   * Constructs a new `TwoWayBinding`
   *
   * @param dataSource   a {@link DataInterface} for the binding
   * @param valueHandler a handler for when the value changes from the `DataSource`
   * @param valueEditor  a consumer for receiving new values to set using the source
   */
  constructor(
    dataSource: DataInterface<T, U>,
    protected override valueHandler: (value: T) => void,
    protected valueEditor: Consumer<U> | Subscribable<U> | SubEvent<any, U>,
  ) {
    super(dataSource.input, valueHandler);

    if ('isConsumer' in this.valueEditor) {
      this.editSub = this.valueEditor.handle(dataSource.modify, true);
    } else if (this.valueEditor instanceof SubEvent) {
      this.editSub = this.valueEditor.on((sender, data) => dataSource.modify(data));
    } else {
      this.editSub = this.valueEditor.sub(dataSource.modify, false, true);
    }
  }

  /** @inheritDoc */
  public pause(): this {
    super.pause();

    this.editSub.pause();

    return this;
  }

  /** @inheritDoc */
  public resume(): this {
    super.resume();

    this.editSub.resume();

    return this;
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.editSub.destroy();
  }
}
