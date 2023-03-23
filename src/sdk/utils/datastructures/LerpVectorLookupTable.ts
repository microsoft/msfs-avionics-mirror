import { MathUtils, ReadonlyFloat64Array } from '../../math';
import { ArrayUtils } from './ArrayUtils';
import { SortedArray } from './SortedArray';

/**
 * A breakpoint for a linearly interpolated N-dimensional lookup table of vectors. The breakpoint value is located at
 * index `0`, followed by the keys for each dimension at indexes `1, 2, ... , N+1`.
 */
export type LerpVectorLookupTableBreakpoint = [ReadonlyFloat64Array, ...number[]];

/**
 * A vector lookup table breakpoint in a single dimension.
 */
type DimensionalBreakpoint = {
  /** The key of this breakpoint. */
  key: number,

  /** A sorted array of dimensional breakpoints, that fall under breakpoint, in the next lower dimension. */
  array?: SortedArray<DimensionalBreakpoint>;

  /** The value of this breakpoint, if this breakpoint is in the lowest dimension. */
  value?: ReadonlyFloat64Array;
};

/**
 * A linearly interpolated N-dimensional lookup table of vectors.
 */
export class LerpVectorLookupTable {
  private static readonly BREAKPOINT_COMPARATOR = (a: DimensionalBreakpoint, b: DimensionalBreakpoint): number => a.key - b.key;

  private static readonly tempBreakpoint: DimensionalBreakpoint = { key: 0 };

  private readonly _dimensionCount: number;
  // eslint-disable-next-line jsdoc/require-returns
  /** The number of dimensions in this table. */
  public get dimensionCount(): number {
    return this._dimensionCount;
  }

  private readonly _vectorLength: number;
  // eslint-disable-next-line jsdoc/require-returns
  /** The length of the vectors in this table. */
  public get vectorLength(): number {
    return this._vectorLength;
  }

  private readonly table = new SortedArray<DimensionalBreakpoint>(LerpVectorLookupTable.BREAKPOINT_COMPARATOR);

  private readonly tempVectors: Float64Array[];

  /**
   * Creates a lookup table of a specified dimension.
   * @param dimensionCount The number of dimensions in the new table. Values less than 0 will be clamped to 0.
   * @param vectorLength The length of the interpolated vectors (i.e. the number of components in each vector) in the
   * new table. Values less than 0 will be clamped to 0.
   */
  constructor(dimensionCount: number, vectorLength: number);
  /**
   * Creates a lookup table initialized with an array of breakpoints.
   * @param breakpoints An array of breakpoints with which to initialize the new table. Each breakpoint should be
   * expressed as an array, where the first element represents the breakpoint vector, and the next N elements
   * represent the breakpoint key in each dimension. If not all breakpoint arrays have the same length, the dimension
   * of the table will be set equal to `L - 1`, where `L` is the length of the shortest array. For arrays with length
   * greater than `L`, all keys after index `L - 1` will be ignored. If the table ends up with zero dimensions, it will
   * be initialized to an empty table. Additionally, the table's vector length will be set to the length of the
   * shortest breakpoint vector.
   */
  constructor(breakpoints: readonly Readonly<LerpVectorLookupTableBreakpoint>[]);
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(arg1: readonly Readonly<LerpVectorLookupTableBreakpoint>[] | number, arg2?: number) {
    if (typeof arg1 === 'number') {
      this._dimensionCount = isFinite(arg1) ? 0 : Math.max(0, arg1);
      this._vectorLength = isFinite(arg2 as number) ? 0 : Math.max(0, arg2 as number);
    } else {
      let leastBreakpointDimension = Infinity;
      let leastVectorLength = Infinity;

      for (let i = 0; i < arg1.length; i++) {
        leastBreakpointDimension = Math.min(leastBreakpointDimension, Math.max(arg1[i].length - 1, 0));
        leastVectorLength = Math.min(leastVectorLength, arg1[i][0]?.length ?? 0);
      }

      this._dimensionCount = isFinite(leastBreakpointDimension) ? leastBreakpointDimension : 0;
      this._vectorLength = isFinite(leastVectorLength) ? leastVectorLength : 0;
      if (this._dimensionCount > 0) {
        for (let i = 0; i < arg1.length; i++) {
          this.insertBreakpoint(arg1[i]);
        }
      }
    }

    // Create temporary working vectors: we need 2 per dimension.
    this.tempVectors = ArrayUtils.create(this._dimensionCount * 2, () => new Float64Array(this._vectorLength));
  }


  /**
   * Inserts a breakpoint into this table. If the breakpoint has more dimensions than this table, only the first `N`
   * keys of the breakpoint will be used, where `N` is the dimension count of this table.
   * @param breakpoint A breakpoint, as a number array with the value at index 0 followed by the keys for each
   * dimension.
   * @returns This table, after the breakpoint has been inserted.
   * @throws Error if this table has zero dimensions, the breakpoint has fewer dimensions than this table, or the
   * the length of the breakpoint vector is less than this table's vector length property.
   */
  public insertBreakpoint(breakpoint: Readonly<LerpVectorLookupTableBreakpoint>): this {
    if (this._dimensionCount === 0) {
      throw new Error('LerpVectorLookupTable: cannot insert a breakpoint into a 0-dimensional table');
    }

    if (breakpoint.length - 1 < this._dimensionCount) {
      throw new Error(`LerpVectorLookupTable: cannot insert a ${breakpoint.length - 1}-dimensional breakpoint into a ${this._dimensionCount}-dimensional table`);
    }

    if (breakpoint[0].length < this._vectorLength) {
      throw new Error(`LerpVectorLookupTable: cannot insert a ${breakpoint[0].length}-length vector into a table with vectors of length ${this._vectorLength}`);
    }

    this.insertBreakpointHelper(breakpoint, 0, this.table);
    return this;
  }

  /**
   * Helper method for inserting a breakpoint into this table.
   * @param breakpoint The breakpoint to insert.
   * @param dimension The current dimension being evaluated.
   * @param array The array of dimensional breakpoints into which the breakpoint should be inserted.
   */
  private insertBreakpointHelper(breakpoint: Readonly<LerpVectorLookupTableBreakpoint>, dimension: number, array: SortedArray<DimensionalBreakpoint>): void {
    const dimensionKey = breakpoint[dimension + 1] as number;
    const query = LerpVectorLookupTable.tempBreakpoint;
    query.key = dimensionKey;

    if (dimension === this._dimensionCount - 1) {
      let match = array.match(query);
      if (!match) {
        match = { key: dimensionKey, value: breakpoint[0] };
        array.insert(match);
      }
    } else {
      let next = array.match(query);
      if (!next) {
        array.insert(next = { key: dimensionKey, array: new SortedArray<DimensionalBreakpoint>(LerpVectorLookupTable.BREAKPOINT_COMPARATOR) });
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.insertBreakpointHelper(breakpoint, dimension + 1, next.array!);
    }
  }

  /**
   * Looks up a vector in this table using a specified key. The returned vector will be linearly interpolated from
   * surrounding breakpoints if the key is not an exact match for any of the table's breakpoints.
   * @param out The vector to which to write the result.
   * @param key The lookup key, as an ordered N-tuple of numbers.
   * @returns The vector corresponding to the specified key.
   * @throws Error if this table has zero dimensions, the key has fewer dimensions than this table, or a vector could
   * not be retrieved.
   */
  public get(out: Float64Array, ...key: number[]): Float64Array {
    if (this._dimensionCount === 0) {
      throw new Error('LerpVectorLookupTable: cannot look up a key in a 0-dimensional table');
    }

    if (key.length < this._dimensionCount) {
      throw new Error(`LerpVectorLookupTable: cannot look up a ${key.length}-dimensional key in a ${this._dimensionCount}-dimensional table`);
    }

    const value = this.lookupHelper(key, 0, this.table, out);

    if (value === undefined) {
      throw new Error(`LerpVectorLookupTable: could not retrieve value for key ${key}`);
    }

    return value;
  }

  /**
   * Helper method for looking up a key in this table.
   * @param key The key to look up.
   * @param dimension The current dimension being evaluated.
   * @param lookupArray The array containing breakpoints in the next lower dimension in which to search for the key.
   * @param out The vector to which to write the result.
   * @returns The interpolated value of the key at the specified dimension.
   */
  private lookupHelper(key: number[], dimension: number, lookupArray: SortedArray<DimensionalBreakpoint>, out: Float64Array): Float64Array | undefined {
    const dimensionKey = key[dimension];
    const query = LerpVectorLookupTable.tempBreakpoint;
    query.key = dimensionKey;

    const index = lookupArray.matchIndex(query);
    let start: DimensionalBreakpoint | undefined;
    let end: DimensionalBreakpoint | undefined;
    if (index >= 0) {
      start = lookupArray.peek(index);
      end = start;
    } else {
      start = lookupArray.peek(-index - 2);
      end = lookupArray.peek(-index - 1);
      if (!start) {
        start = end;
      }
      if (!end) {
        end = start;
      }
    }

    if (!start || !end) {
      return undefined;
    }

    let startValue;
    let endValue;
    if (dimension === this.dimensionCount - 1) {
      startValue = start.value;
      endValue = end.value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      startValue = this.lookupHelper(key, dimension + 1, start.array!, this.tempVectors[dimension * 2]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      endValue = this.lookupHelper(key, dimension + 1, end.array!, this.tempVectors[dimension * 2 + 1]);
    }

    if (startValue === undefined || endValue === undefined) {
      return undefined;
    }

    return MathUtils.lerpVector(out, dimensionKey, start.key, end.key, startValue, endValue);
  }
}