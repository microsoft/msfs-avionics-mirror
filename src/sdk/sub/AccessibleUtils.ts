import { Accessible, MutableAccessible } from './Accessible';
import { Value } from './Value';

/**
 * A utility class for working with Accessibles.
 */
export class AccessibleUtils {
  /**
   * Checks if a query is an accessible.
   * @param query A query.
   * @returns Whether the query is an accessible.
   */
  public static isAccessible<T = any>(query: unknown): query is Accessible<T> {
    if (typeof query === 'object' && query !== null) {
      return typeof (query as any)['get'] === 'function';
    } else {
      return false;
    }
  }

  /**
   * Checks if a query is a mutable accessible.
   * @param query A query.
   * @returns Whether the query is a mutable accessible.
   */
  public static isMutableAccessible<T = any, I = T>(query: unknown): query is MutableAccessible<T, I> {
    if (AccessibleUtils.isAccessible(query)) {
      return typeof (query as any)['set'] === 'function';
    } else {
      return false;
    }
  }

  /**
   * Converts a value to an accessible.
   *
   * If the `excludeAccessibles` argument is `true` and the value is already an accessible, then the value is returned
   * unchanged. Otherwise, a new accessible whose state is always equal to the value will be created and returned.
   * @param value The value to convert to an accessible.
   * @param excludeAccessibles Whether to return accessible values as-is instead of wrapping them in another
   * accessible.
   * @returns An accessible.
   */
  public static toAccessible<V, Exclude extends boolean>(
    value: V,
    excludeAccessibles: Exclude
  ): Exclude extends true ? (V extends Accessible<any> ? V : Accessible<V>) : Accessible<V> {
    if (excludeAccessibles && AccessibleUtils.isAccessible(value)) {
      return value as any;
    } else {
      return Value.create(value) as any;
    }
  }
}
