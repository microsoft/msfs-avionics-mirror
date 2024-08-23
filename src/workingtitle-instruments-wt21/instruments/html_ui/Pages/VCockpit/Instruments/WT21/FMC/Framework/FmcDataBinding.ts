import { Consumer, MutableSubscribable, Subscribable } from '@microsoft/msfs-sdk';

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
  }

  /**
   * Creates a {@link DataInterface} from a {@link MutableSubscribable}
   * @param sub the {@link MutableSubscribable} to bind to
   * @returns the {@link DataInterface}
   */
  public static fromMutSubscribable<T>(sub: MutableSubscribable<T>): DataInterface<T> {
    return new DataInterface(sub, (value) => sub.set(value));
  }
}
