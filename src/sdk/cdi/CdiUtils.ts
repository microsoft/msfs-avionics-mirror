import { NavSourceId } from '../instruments/NavProcessor';

/**
 * A utility class for working with CDIs.
 */
export class CdiUtils {
  /**
   * Gets the suffix for event bus topics associated with a given CDI index.
   * @param id The index for which to get the suffix.
   * @returns The suffix for event bus topics associated with the specified CDI index.
   */
  public static getEventBusTopicSuffix<ID extends string>(id: ID): ID extends '' ? '' : `_${ID}` {
    return (id === '' ? '' : `_${id}`) as ID extends '' ? '' : `_${ID}`;
  }

  /**
   * Checks whether two CDI navigation sources are equal.
   * @param a The first source to check.
   * @param b The second source to check.
   * @returns Whether the two specified CDI navigation sources are equal.
   */
  public static navSourceIdEquals(a: Readonly<NavSourceId>, b: Readonly<NavSourceId>): boolean {
    return a.type === b.type && a.index === b.index;
  }
}
