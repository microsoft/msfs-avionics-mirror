/**
 * Gets the element type of an array.
 */
export type ArrayType<A extends ReadonlyArray<any>> = A extends ReadonlyArray<infer T> ? T : never;

/**
 * Flattens an array type to a depth of 1.
 */
export type FlattenArray<A extends ReadonlyArray<any>> = A extends ReadonlyArray<infer T> ? Array<T extends ReadonlyArray<infer T1> ? T1 : T> : never;

/**
 * Flattens an array type to a depth between 0 and 10, inclusive.
 */
export type FlattenArrayToDepth<A extends ReadonlyArray<any>, Depth extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>
  = Depth extends 0 ? A
  : Depth extends 1 ? FlattenArray<A>
  : Depth extends 2 ? FlattenArrayToDepth<FlattenArray<A>, 1>
  : Depth extends 3 ? FlattenArrayToDepth<FlattenArray<A>, 2>
  : Depth extends 4 ? FlattenArrayToDepth<FlattenArray<A>, 3>
  : Depth extends 5 ? FlattenArrayToDepth<FlattenArray<A>, 4>
  : Depth extends 6 ? FlattenArrayToDepth<FlattenArray<A>, 5>
  : Depth extends 7 ? FlattenArrayToDepth<FlattenArray<A>, 6>
  : Depth extends 8 ? FlattenArrayToDepth<FlattenArray<A>, 7>
  : Depth extends 9 ? FlattenArrayToDepth<FlattenArray<A>, 8>
  : Depth extends 10 ? FlattenArrayToDepth<FlattenArray<A>, 9>
  : never;

/**
 * Utility functions for working with arrays.
 */
export class ArrayUtils {
  private static readonly STRICT_EQUALS = (a: unknown, b: unknown): boolean => a === b;

  /**
   * Creates a new array with initialized values.
   * @param length The length of the new array.
   * @param init A function which generates initial values for the new array at each index.
   * @returns A new array of the specified length with initialized values.
   */
  public static create<T>(length: number, init: (index: number) => T): T[] {
    const newArray = [];

    for (let i = 0; i < length; i++) {
      newArray[i] = init(i);
    }

    return newArray;
  }

  /**
   * Creates a new array containing a sequence of evenly-spaced numbers.
   * @param length The length of the new array.
   * @param start The number contained at index 0 of the new array. Defaults to `0`.
   * @param increment The increment between each successive number in the new array. Defaults to `1`.
   * @returns A new array containing the specified sequence of evenly-spaced numbers.
   */
  public static range(length: number, start = 0, increment = 1): number[] {
    return ArrayUtils.fillRange([], length, 0, start, increment);
  }

  /**
   * Fills an existing array with a sequence of evenly-spaced numbers. The sequence is written to the array in a single
   * contiguous block of consecutive indexes.
   * @param array The array to fill.
   * @param length The length of the number sequence.
   * @param startIndex The index at which to start filling the array. Defaults to `0`.
   * @param start The first number in the sequence. Defaults to {@linkcode startIndex}.
   * @param increment The increment between each successive number in the new array. Defaults to `1`.
   * @returns The array, after it has been filled with the specified number sequence.
   */
  public static fillRange(array: number[], length: number, startIndex = 0, start = startIndex, increment = 1): number[] {
    for (let i = 0; i < length; i++) {
      array[startIndex + i] = start + i * increment;
    }
    return array;
  }

  /**
   * Gets the element at a specific index in an array.
   * @param array An array.
   * @param index The index to access. Negative indexes are supported and access elements starting from the end of the
   * array (`-1` accesses the last element, `-2` the second to last element, etc).
   * @returns The element at the specified index in the array.
   * @throws RangeError if the index is out of bounds.
   */
  public static at<T>(array: readonly T[], index: number): T {
    if (index < 0) {
      index += array.length;
    }

    if (index < 0 || index >= array.length) {
      throw new RangeError();
    }

    return array[index];
  }

  /**
   * Gets the element at a specific index in an array, or `undefined` if the index is out of bounds.
   * @param array An array.
   * @param index The index to access. Negative indexes are supported and access elements starting from the end of the
   * array (`-1` accesses the last element, `-2` the second to last element, etc).
   * @returns The element at the specified index in the array, or `undefined` if the index is out of bounds.
   */
  public static peekAt<T>(array: readonly T[], index: number): T | undefined {
    if (index < 0) {
      index += array.length;
    }

    return array[index];
  }

  /**
   * Gets the first element of an array.
   * @param array An array.
   * @returns The first element of the specified array.
   * @throws RangeError if the array is empty.
   */
  public static first<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new RangeError();
    }

    return array[0];
  }

  /**
   * Gets the first element of an array if it is not empty, or `undefined` otherwise.
   * @param array An array.
   * @returns The first element of an array if it is not empty, or `undefined` otherwise.
   */
  public static peekFirst<T>(array: readonly T[]): T | undefined {
    return array[0];
  }

  /**
   * Gets the last element of an array.
   * @param array An array.
   * @returns The last element of the specified array.
   * @throws RangeError if the array is empty.
   */
  public static last<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new RangeError();
    }

    return array[array.length - 1];
  }

  /**
   * Gets the last element of an array if it is not empty, or `undefined` otherwise.
   * @param array An array.
   * @returns The last element of an array if it is not empty, or `undefined` otherwise.
   */
  public static peekLast<T>(array: readonly T[]): T | undefined {
    return array[array.length - 1];
  }

  /**
   * Checks if a certain element is included in an array.
   * @param array An array.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for `searchElement`.
   * @returns Whether the search element is included in the specified array.
   */
  public static includes<T>(array: readonly T[], searchElement: any, fromIndex?: number): searchElement is T {
    return array.includes(searchElement as any, fromIndex);
  }

  /**
   * Checks if two arrays are equal to each other. This method considers two arrays `a` and `b` if their lengths are
   * equal and `a[i]` equals `b[i]` for every valid index `i`. All empty arrays are considered equal to one another.
   * @param a The first array.
   * @param b The second array.
   * @param equalsFunc The function to use to determine whether two array elements are equal to each other. Defaults
   * to a function which uses the strict equality operator (`===`).
   * @returns Whether the two specified arrays are equal.
   */
  public static equals<T1, T2>(a: readonly T1[], b: readonly T2[], equalsFunc: (a: T1, b: T2) => boolean = ArrayUtils.STRICT_EQUALS): boolean {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!equalsFunc(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a new array by mapping each element of an existing array using a mapping function, then flattening the
   * mapped elements to a maximum depth of one, leaving the original array intact.
   * @param array An array.
   * @param map A function which is called once on each element of the original array to map it to an arbitrary value.
   * @returns A new array which was created by mapping each element of the specified array, then flattening the mapped
   * elements to a maximum depth of one.
   */
  public static flatMap<O, A extends ReadonlyArray<any>>(array: A, map: (value: ArrayType<A>, index: number, array: A) => O): FlattenArray<O[]> {
    const out: any[] = [];

    for (let i = 0; i < array.length; i++) {
      const mapped = map(array[i], i, array);
      if (Array.isArray(mapped)) {
        for (let j = 0; j < mapped.length; j++) {
          out[out.length] = mapped[j];
        }
      } else {
        out[out.length] = mapped;
      }
    }

    return out;
  }

  /**
   * Creates a new array by flattening an existing array to a maixmum depth of one, leaving the original array intact.
   * The process of flattening replaces each element in the array that is itself an array with the sequence of elements
   * found in the sub-array, recursively up to the maximum depth.
   * @param array An array.
   * @returns A new array which was created by flattening the specified array to a maximum depth of one.
   */
  public static flat<A extends ReadonlyArray<any>>(array: A): FlattenArray<A>;
  /**
   * Creates a new array by flattening an existing array to a maximum depth, leaving the original array intact. The
   * process of flattening replaces each element in the array that is itself an array with the sequence of elements
   * found in the sub-array, recursively up to the maximum depth.
   * @param array An array.
   * @param depth The maximum depth to which to flatten. Values less than or equal to zero will result in no flattening
   * (in other words, a shallow copy of the original array will be returned). Defaults to `1`.
   * @returns A new array which was created by flattening the specified array to the specified maximum depth.
   */
  public static flat<A extends ReadonlyArray<any>, Depth extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | undefined>(
    array: A,
    depth: Depth
  ): FlattenArrayToDepth<A, Depth extends undefined ? 1 : Depth>;
  /**
   * Creates a new array by flattening an existing array to a maximum depth, leaving the original array intact. The
   * process of flattening replaces each element in the array that is itself an array with the sequence of elements
   * found in the sub-array, recursively up to the maximum depth.
   * @param array An array.
   * @param depth The maximum depth to which to flatten. Values less than or equal to zero will result in no flattening
   * (in other words, a shallow copy of the original array will be returned). Defaults to `1`.
   * @returns A new array which was created by flattening the specified array to the specified maximum depth.
   */
  public static flat<T = unknown>(array: readonly unknown[], depth?: number): T[];
  /**
   * Creates a new array by flattening an existing array to a maximum depth, leaving the original array intact. The
   * process of flattening replaces each element in the array that is itself an array with the sequence of elements
   * found in the sub-array, recursively up to the maximum depth.
   * @param array An array.
   * @param depth The maximum depth to which to flatten. Values less than or equal to zero will result in no flattening
   * (in other words, a shallow copy of the original array will be returned). Defaults to `1`.
   * @returns A new array which was created by flattening the specified array to the specified maximum depth.
   */
  public static flat<T = unknown>(array: readonly unknown[], depth = 1): T[] {
    const out: unknown[] = [];
    this.flatHelper(array, depth, 0, out);
    return out as T[];
  }

  /**
   * Recursively flattens an array and writes the flattened sequence of elements into another array.
   * @param array The array to flatten.
   * @param maxDepth The maximum depth to which to flatten.
   * @param depth The current flattening depth.
   * @param out The array to which to write the flattened sequence of elements.
   */
  private static flatHelper(array: readonly unknown[], maxDepth: number, depth: number, out: unknown[]): void {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (Array.isArray(element) && depth < maxDepth) {
        this.flatHelper(element, maxDepth, depth + 1, out);
      } else {
        out[out.length] = element;
      }
    }
  }

  /**
   * Performs a shallow copy of an array. After the operation is complete, the target array will have the same
   * length and the same elements in the same order as the source array.
   * @param source The array to copy.
   * @param target The array to copy into. If not defined, a new array will be created.
   * @returns The target array, after the source array has been copied into it.
   */
  public static shallowCopy<T>(source: readonly T[], target: T[] = []): T[] {
    target.length = source.length;
    for (let i = 0; i < source.length; i++) {
      target[i] = source[i];
    }

    return target;
  }

  /**
   * Performs a binary search on a sorted array to find the index of the first or last element in the array whose
   * sorting order is equal to a query element. If no such element in the array exists, `-(index + 1)` is returned,
   * where `index` is the index at which the query element would be found if it were contained in the sorted array.
   * @param array An array.
   * @param element The element to search for.
   * @param comparator A function which determines the sorting order of elements in the array. The function should
   * return a negative number if the first element is to be sorted before the second, a positive number if the first
   * element is to be sorted after the second, or zero if both elements are to be sorted equivalently.
   * @param first If `true`, this method will find the first (lowest) matching index if there are multiple matching
   * indexes, otherwise this method will find the last (highest) matching index. Defaults to `true`.
   * @returns The index of the first (if `first` is `true`) or last (if `first` is `false`) element in the specified
   * array whose sorting order is equal to the query element, or `-(index + 1)`, where `index` is the index at which
   * the query element would be found if it were contained in the sorted array, if no element in the array has a
   * sorting order equal to the query.
   */
  public static binarySearch<T>(array: readonly T[], element: T, comparator: (a: T, b: T) => number, first = true): number {
    let min = 0;
    let max = array.length;
    let index = Math.floor((min + max) / 2);

    while (min < max) {
      const compare = comparator(element, array[index]);
      if (compare < 0) {
        max = index;
      } else if (compare > 0) {
        min = index + 1;
      } else {
        const delta = first ? -1 : 1;
        while (index + delta >= 0 && index + delta < array.length && comparator(element, array[index + delta]) === 0) {
          index += delta;
        }
        return index;
      }
      index = Math.floor((min + max) / 2);
    }

    return -(index + 1);
  }

  /**
   * Gets the length of the longest string in the array.
   * @param array The array to search in.
   * @returns length of the longest string
   */
  public static getMaxStringLength(array: string[]): number {
    return array.reduce((accum, curr) => curr.length > accum ? curr.length : accum, 0);
  }
}