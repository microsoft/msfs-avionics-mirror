import { Consumer } from '../data';
import { MutableSubscribable, Subscribable } from '../sub';

/**
 * A structure representing a source of named data that can be modified
 */
export class DataInterface<T, U = T> {

  /**
   * Constructs a new `DataInterface`
   *
   * @param input  an input for data
   * @param modify a callback when the data needs to be modified
   */
  constructor(
    public readonly input: Subscribable<T> | Consumer<T>,
    public modify: (value: U) => void,
  ) {
  }

  /**
   * Creates a {@link DataInterface} from a {@link MutableSubscribable}
   * @param sub the {@link MutableSubscribable} to bind to
   * @returns the {@link DataInterface}
   */
  public static fromMutSubscribable<T, U = T>(sub: MutableSubscribable<T, U>): DataInterface<T, U> {
    return new DataInterface(sub, (value) => sub.set(value));
  }

  /**
   * Creates a {@link DataInterface} from a {@link Consumer}
   * @param consumer the {@link Consumer} to bind to (get)
   * @param modifier the modifier to use when the value is modified (set)
   * @returns the {@link DataInterface}
   */
  public static fromConsumer<T, U = T>(consumer: Consumer<T>, modifier: (value: U) => void): DataInterface<T, U> {
    return new DataInterface(consumer, (value) => modifier(value));
  }
}
