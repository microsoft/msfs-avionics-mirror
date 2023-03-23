import { MathUtils } from '../../math/MathUtils';
import { LerpLookupTable } from '../datastructures';

/**
 * A utility class for creating easing functions. All generated easing functions are based on their CSS counterparts.
 */
export class Easing {

  /**
   * Creates a linear easing function.
   * @returns A linear easing function.
   */
  public static linear(): (progress: number) => number {
    return (x: number) => MathUtils.clamp(x, 0, 1);
  }

  /**
   * Creates a quadratic easing function.
   * @param end The end to which to apply easing.
   * @returns A quadratic easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static quad(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x;
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) * (1 - x);
      case 'both':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x);
      default:
        throw new Error(`Easing.quad(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a cubic easing function.
   * @param end The end to which to apply easing.
   * @returns A cubic easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static cubic(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x;
      case 'out':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else {
            const compl = 1 - x;
            return 1 - compl * compl * compl;
          }
        };
      case 'both':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else if (x < 0.5) {
            return 4 * x * x * x;
          } else {
            const compl = 1 - x;
            return 1 - 4 * compl * compl * compl;
          }
        };
      default:
        throw new Error(`Easing.cubic(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a quartic easing function.
   * @param end The end to which to apply easing.
   * @returns A quartic easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static quart(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * x;
      case 'out':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else {
            const compl = 1 - x;
            return 1 - compl * compl * compl * compl;
          }
        };
      case 'both':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else if (x < 0.5) {
            return 8 * x * x * x * x;
          } else {
            const compl = 1 - x;
            return 1 - 8 * compl * compl * compl * compl;
          }
        };
      default:
        throw new Error(`Easing.quart(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a quintic easing function.
   * @param end The end to which to apply easing.
   * @returns A quintic easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static quint(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * x * x;
      case 'out':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else {
            const compl = 1 - x;
            return 1 - compl * compl * compl * compl * compl;
          }
        };
      case 'both':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else if (x < 0.5) {
            return 16 * x * x * x * x * x;
          } else {
            const compl = 1 - x;
            return 1 - 16 * compl * compl * compl * compl * compl;
          }
        };
      default:
        throw new Error(`Easing.quint(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a polynomial easing function.
   * @param order The order of the polynomial.
   * @param end The end to which to apply easing.
   * @returns A polynomial easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static polynomial(order: number, end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(x, order);
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, order);
      case 'both':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 0.5 * Math.pow(2 * x, order) : 1 - 0.5 * Math.pow(2 * (1 - x), order);
      default:
        throw new Error(`Easing.polynomial(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a sinusoid easing function.
   * @param end The end to which to apply easing.
   * @returns A sinusoid easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static sin(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.cos(x * MathUtils.HALF_PI);
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : Math.sin(x * MathUtils.HALF_PI);
      case 'both':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : (1 - Math.cos(x * Math.PI)) * 0.5;
      default:
        throw new Error(`Easing.sin(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a circular easing function.
   * @param end The end to which to apply easing.
   * @returns A circular easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static circ(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.sqrt(1 - x * x);
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : Math.sqrt(1 - (x - 1) * (x - 1));
      case 'both':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? (1 - Math.sqrt(1 - 4 * x * x)) * 0.5 : (Math.sqrt(1 - 4 * (1 - x) * (1 - x)) + 1) * 0.5;
      default:
        throw new Error(`Easing.circ(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates an exponential easing function.
   * @param end The end to which to apply easing.
   * @returns An exponential easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static exp(end: 'in' | 'out' | 'both'): (progress: number) => number {
    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, 10 * (x - 1));
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
      case 'both':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 0.5 * Math.pow(2, 20 * (x - 0.5)) : 1 - 0.5 * Math.pow(2, 20 * (0.5 - x));
      default:
        throw new Error(`Easing.exp(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a back easing function.
   * @param end The end to which to apply easing.
   * @returns A back easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static back(end: 'in' | 'out' | 'both'): (progress: number) => number {
    const c1 = 2.70158;
    const c2 = 1.70158;

    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : c1 * x * x * x - c2 * x * x;
      case 'out':
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else {
            const compl = 1 - x;
            return 1 - compl * compl * compl + c2 * compl * compl;
          }
        };
      case 'both': {
        const c3 = c2 * 1.525;
        const c4 = c3 + 1;

        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else if (x < 0.5) {
            return 2 * (x * x * (2 * c4 * x - c3));
          } else {
            const compl = 1 - x;
            return 1 - 2 * compl * compl * (2 * c4 * compl - c3);
          }
        };
      }
      default:
        throw new Error(`Easing.back(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates an elastic easing function.
   * @param end The end to which to apply easing.
   * @returns An elastic easing function.
   * @throws Error if `end` is not one of `'in' | 'out' | 'both'`.
   */
  public static elastic(end: 'in' | 'out' | 'both'): (progress: number) => number {
    const c1 = MathUtils.TWO_PI / 3;

    switch (end) {
      case 'in':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : c1 * Math.pow(2, 10 * (x - 1)) * Math.sin(10.75 - 10 * x);
      case 'out':
        return (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - c1 * Math.pow(2, -10 * x) * Math.sin(0.75 - 10 * x);
      case 'both': {
        const c2 = c1 * c1;
        return (x: number) => {
          if (x <= 0) {
            return 0;
          } else if (x >= 1) {
            return 1;
          } else if (x < 0.5) {
            return 0.5 * Math.pow(2, 20 * (x - 0.5)) * Math.sin(c2 * (11.125 - 20 * x));
          } else {
            return 1 - 0.5 * Math.pow(2, 20 * (0.5 - x)) * Math.sin(c2 * (11.125 - 20 * x));
          }
        };
      }
      default:
        throw new Error(`Easing.elastic(): unrecognized end option '${end}'. Expected 'in' | 'out' | 'both'.`);
    }
  }

  /**
   * Creates a cubic bezier easing function. The function follows a cubic bezier curve with the endpoints fixed at
   * `(0, 0)` and `(1, 1)`.
   * 
   * The function can optionally use a precomputed lookup table. Using a lookup table may increase performance and/or
   * precision of the created function at the cost of some precomputation time and memory needed to store the lookup
   * table.
   * @param c1x The x-coordinate of the first control point. Will be clamped to the range `[0, 1]`.
   * @param c1y The y-coordinate of the first control point.
   * @param c2x The x-coordinate of the second control point. Will be clamped to the range `[0, 1]`.
   * @param c2y The y-coordinate of the second control point.
   * @param precompute Whether to precompute a lookup table. Defaults to `false`.
   * @param minXResolution The minimum resolution of the function along the x-axis. Defaults to `0.1` if `precompute`
   * is `true`, or `1e-4` if `precompute` is `false`.
   * @param epsilon The threshold of acceptable linear interpolation error used during precomputation. Ignored if
   * `precompute` is false. Defaults to `1e-4`.
   * @param maxDepth The maximum allowed recursive depth of precomputation. The number of additional lookup table
   * breakpoints generated is bounded from above by `2 ^ (maxDepth) - 1`. Ignored if `precompute` is false. Defaults
   * to `10`.
   * @returns A cubic bezier easing function.
   */
  public static bezier(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    precompute = false,
    minXResolution?: number,
    epsilon = 1e-3,
    maxDepth = 10,
  ): (progress: number) => number {
    c1x = MathUtils.clamp(c1x, 0, 1);
    c2x = MathUtils.clamp(c2x, 0, 1);

    if (precompute) {
      const minXRes = minXResolution ?? 0.1;

      const lookup = new LerpLookupTable(1);

      lookup.insertBreakpoint([0, 0]);
      lookup.insertBreakpoint([1, 1]);

      if (maxDepth > 0) {
        Easing.precomputeBezier(c1x, c1y, c2x, c2y, lookup, minXRes, epsilon, maxDepth, 0, 0, 0, 1, 1, 1, 1);
      }

      return (x: number): number => {
        return x <= 0 ? 0 : x >= 1 ? 1 : lookup.get(x);
      };
    } else {
      const minXRes = Math.max(minXResolution ?? 1e-4, 1e-6);

      return (x: number): number => {
        if (x <= 0) {
          return 0;
        } else if (x >= 1) {
          return 1;
        }

        // Find t for x.

        let t0 = 0, t1 = 1;
        let tquery = (t0 + t1) / 2;
        let xquery = Easing.easingBezierFunc(tquery, c1x, c2x);

        while (Math.abs(x - xquery) > minXRes) {
          if (x - xquery < 0) {
            t1 = tquery;
          } else {
            t0 = tquery;
          }

          tquery = (t0 + t1) / 2;
          xquery = Easing.easingBezierFunc(tquery, c1x, c2x);
        }

        // Calculate y for t.

        return Easing.easingBezierFunc(tquery, c1y, c2y);
      };
    }
  }

  /**
   * Precomputes lookup table breakpoints for a cubic bezier easing function.
   * @param c1x The x-coordinate of the first control point.
   * @param c1y The y-coordinate of the first control point.
   * @param c2x The x-coordinate of the second control point.
   * @param c2y The y-coordinate of the second control point.
   * @param lookup A lookup table to which to add breakpoints.
   * @param minXRes The desired minimum resolution along the x-axis.
   * @param epsilon The maximum acceptable linear interpolation error. Recursion will continue if the interpolated y
   * value differs from the exact y value by more than this amount.
   * @param maxDepth The maximum allowed recursion depth.
   * @param t0 The distance value at the current left endpoint.
   * @param x0 The x value at the current left endpoint.
   * @param y0 The y value at the current left endpoint.
   * @param t1 The distance value at the current right endpoint.
   * @param x1 The x value at the current right endpoint.
   * @param y1 The y value at the current right endpoint.
   * @param depth The current recursion depth.
   */
  private static precomputeBezier(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    lookup: LerpLookupTable,
    minXRes: number,
    epsilon: number,
    maxDepth: number,
    t0: number,
    x0: number,
    y0: number,
    t1: number,
    x1: number,
    y1: number,
    depth: number
  ): void {
    const tmid = (t0 + t1) / 2;
    const xdelta = x1 - x0;
    const xmid = Easing.easingBezierFunc(tmid, c1x, c2x);
    const ymid = Easing.easingBezierFunc(tmid, c1y, c2y);
    const ylerp = MathUtils.lerp(xmid, x0, x1, y0, y1);

    let shouldContinue = false;

    shouldContinue = xdelta > minXRes || Math.abs(ylerp - ymid) > epsilon;

    if (shouldContinue) {
      lookup.insertBreakpoint([ymid, xmid]);

      if (depth < maxDepth) {
        Easing.precomputeBezier(c1x, c1y, c2x, c2y, lookup, minXRes, epsilon, maxDepth, t0, x0, y0, tmid, xmid, ymid, depth + 1);
        Easing.precomputeBezier(c1x, c1y, c2x, c2y, lookup, minXRes, epsilon, maxDepth, tmid, xmid, ymid, t1, x1, y1, depth + 1);
      }
    }
  }

  /**
   * Computes a coordinate value along a bezier curve with P0 fixed at `(0, 0)` and P3 fixed at `(1, 1)`.
   * @param t The distance along the curve normalized to `[0, 1]`.
   * @param c1 The coordinate of the first control point.
   * @param c2 The coordinate of the second control point.
   * @returns The coordinate value along the specified bezier curve at the specified distance.
   */
  private static easingBezierFunc(t: number, c1: number, c2: number): number {
    return 3 * (1 - t) * (1 - t) * t * c1 + 3 * (1 - t) * t * t * c2 + t * t * t;
  }

  /**
   * Converts an easing function to one which supports arbitrary start and stop endpoints.
   * @param ease An easing function.
   * @returns A new easing function which generates the same shape as the specified function while supporting arbitrary
   * start and stop endpoints.
   */
  public static withEndpointParams(ease: (progress: number) => number): (start: number, stop: number, progress: number) => number {
    return (start: number, stop: number, progress: number): number => {
      return start + (stop - start) * ease(progress);
    };
  }

  /**
   * Converts an easing function to one which uses specific start and stop endpoints.
   * @param ease An easing function.
   * @param start The start endpoint.
   * @param stop The stop endpoint.
   * @returns A new easing function which generates the same shape as the specified function while using the specified
   * start and stop endpoints.
   */
  public static withEndpoints(ease: (progress: number) => number, start: number, stop: number): (progress: number) => number {
    const delta = stop - start;

    return (progress: number): number => {
      return start + delta * ease(progress);
    };
  }
}