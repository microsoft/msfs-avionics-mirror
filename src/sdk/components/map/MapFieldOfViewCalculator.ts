import { LatLonInterface } from '../../geo/GeoInterfaces';
import { GeoPoint } from '../../geo/GeoPoint';
import { ReadonlyFloat64Array, Vec2Math, Vec3Math } from '../../math/VecMath';
import { MapProjection } from './MapProjection';

/**
 * A map range and target solution describing a field of view.
 */
export type MapFieldOfView = {
  /** The range of the field of view, in great-arc radians. */
  range: number;

  /** The target location of the field of view. */
  target: GeoPoint;
}

/**
 * Calculates map projection parameters for fields of view which encompass sets of geographic points.
 */
export class MapFieldOfViewCalculator {
  private static readonly DEFAULT_MAX_ITER = 20;
  private static readonly DEFAULT_RANGE_TOLERANCE = 0.01;

  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];
  private static readonly vec3Cache = [Vec3Math.create(), Vec3Math.create()];

  private readonly tempProjection = new MapProjection(100, 100);

  /**
   * Constructor.
   * @param maxIter The maximum number of iterations to perform when calculating fields of view. Defaults to
   * {@link MapFieldOfViewCalculator.DEFAULT_MAX_ITER}.
   * @param rangeTolerance The error tolerance of calculated field of view ranges, as a fraction of the ideal range for
   * each field of view. Defaults to {@link MapFieldOfViewCalculator.DEFAULT_RANGE_TOLERANCE}.
   */
  constructor(
    private readonly maxIter = MapFieldOfViewCalculator.DEFAULT_MAX_ITER,
    private readonly rangeTolerance = MapFieldOfViewCalculator.DEFAULT_RANGE_TOLERANCE
  ) {
  }

  /**
   * Calculates a map field of view, consisting of a range and target location, which encompasses a given set of
   * geographic points (the focus) with the smallest possible range. If there is only one point in the specified focus,
   * then the calculated range will be equal to 0. If the specified focus contains zero points or a field of view could
   * not be calculated, `NaN` will be written to the results.
   * @param mapProjection The projection of the map for which to calculate the field of view.
   * @param focus An array of points comprising the focus of the field of view.
   * @param margins The margins around the projected map boundaries to respect, as `[left, top, right, bottom]` in
   * pixels. The field of view will be calculated in order to avoid placing any points in the focus outside of the
   * margins.
   * @param out The object to which to write the results.
   * @returns The calculated field of view for the specified focus.
   */
  public calculateFov(
    mapProjection: MapProjection,
    focus: readonly LatLonInterface[],
    margins: ReadonlyFloat64Array,
    out: MapFieldOfView
  ): MapFieldOfView {
    out.range = NaN;
    out.target.set(NaN, NaN);

    if (focus.length === 0) {
      return out;
    }

    const projectedSize = mapProjection.getProjectedSize();

    const targetWidth = projectedSize[0] - margins[0] - margins[2];
    const targetHeight = projectedSize[1] - margins[1] - margins[3];

    if (targetWidth * targetHeight <= 0) {
      return out;
    }

    // Calculate mean point of the focus

    const mean = Vec3Math.set(0, 0, 0, MapFieldOfViewCalculator.vec3Cache[0]);
    for (let i = 0; i < focus.length; i++) {
      Vec3Math.add(mean, GeoPoint.sphericalToCartesian(focus[i], MapFieldOfViewCalculator.vec3Cache[1]), mean);
    }
    Vec3Math.multScalar(mean, 1 / focus.length, mean);

    // Initialize our working projection to use the same projected size, rotation, and range endpoints as the map
    // projection for which we are calculating the field of view.

    // Then, set the target offset of our working projection such that the target is projected to the middle of the
    // margin boundaries, and set the target to the mean focus point (this provides a rough estimate of the true center
    // of the focus when projected). Setting an initial target this way mitigates issues with anti-meridian wraparound.
    // Finally, use this projection to find the top-left and bottom-right corners of the projected focus, thus defining
    // the minimal axis-aligned bounding box of the projected focus.

    this.tempProjection.set({
      projectedSize: mapProjection.getProjectedSize(),
      rotation: mapProjection.getRotation(),
      target: MapFieldOfViewCalculator.geoPointCache[0].setFromCartesian(mean),
      targetProjectedOffset: Vec2Math.set(
        margins[0] + (targetWidth - projectedSize[0]) / 2,
        margins[1] + (targetHeight - projectedSize[1]) / 2,
        MapFieldOfViewCalculator.vec2Cache[0]
      ),
      rangeEndpoints: mapProjection.getRangeEndpoints(),
      range: mapProjection.getRange()
    });

    let minX: number | undefined;
    let minY: number | undefined;
    let maxX: number | undefined;
    let maxY: number | undefined;

    for (let i = 0; i < focus.length; i++) {
      const projected = this.tempProjection.project(focus[i], MapFieldOfViewCalculator.vec2Cache[0]);

      minX = Math.min(projected[0], minX ?? Infinity);
      minY = Math.min(projected[1], minY ?? Infinity);
      maxX = Math.max(projected[0], maxX ?? -Infinity);
      maxY = Math.max(projected[1], maxY ?? -Infinity);
    }

    if (minX === undefined || minY === undefined || maxX === undefined || maxY === undefined) {
      return out;
    }

    let focusWidth = maxX - minX;
    let focusHeight = maxY - minY;

    if (focusWidth === 0 && focusHeight === 0) {
      out.target.set(focus[0]);
      out.range = 0;
      return out;
    }

    // Fix the target of our working projection (which we have already defined to be projected to the middle of the
    // margin boundaries) to the center of the focus. Due to the properties of the Mercator projection, this point is
    // invariant (it is always projected to the same coordinates) for every possible map range when selecting a field
    // of view that maximizes the distance between the bounding box of the projected focus and the margin boundaries.
    // Therefore, we will maintain this invariant while iteratively searching for the smallest map range that places
    // the focus bounding box within the margin boundaries.

    this.tempProjection.invert(Vec2Math.set((minX + maxX) / 2, (minY + maxY) / 2, MapFieldOfViewCalculator.vec2Cache[0]), out.target);

    this.tempProjection.set({
      target: out.target
    });

    let widthRatio = focusWidth / targetWidth;
    let heightRatio = focusHeight / targetHeight;

    let constrainedRatio = Math.max(widthRatio, heightRatio);
    const range = out.range = this.tempProjection.getRange();

    const topLeft = this.tempProjection.invert(Vec2Math.set(minX, minY, MapFieldOfViewCalculator.vec2Cache[0]), MapFieldOfViewCalculator.geoPointCache[0]);
    const bottomRight = this.tempProjection.invert(Vec2Math.set(maxX, maxY, MapFieldOfViewCalculator.vec2Cache[0]), MapFieldOfViewCalculator.geoPointCache[1]);

    let iterCount = 0;
    const rangeParam = { range };
    let ratioError = Math.abs(constrainedRatio - 1);
    let deltaRatioError = this.rangeTolerance + 1;
    while (
      iterCount++ < this.maxIter
      && ratioError > this.rangeTolerance
      && deltaRatioError > this.rangeTolerance
    ) {
      rangeParam.range = out.range = this.tempProjection.getRange() * constrainedRatio;

      if (out.range <= GeoPoint.EQUALITY_TOLERANCE) {
        // if the estimated range is too small, iteratively solving for the range will be unreliable due to floating
        // point errors
        out.range = GeoPoint.EQUALITY_TOLERANCE;
        return out;
      }

      this.tempProjection.set(rangeParam);

      const topLeftProjected = this.tempProjection.project(topLeft, MapFieldOfViewCalculator.vec2Cache[0]);
      const bottomRightProjected = this.tempProjection.project(bottomRight, MapFieldOfViewCalculator.vec2Cache[1]);

      focusWidth = bottomRightProjected[0] - topLeftProjected[0];
      focusHeight = bottomRightProjected[1] - topLeftProjected[1];

      widthRatio = focusWidth / targetWidth;
      heightRatio = focusHeight / targetHeight;

      constrainedRatio = Math.max(widthRatio, heightRatio);

      const newRatioError = Math.abs(constrainedRatio - 1);
      deltaRatioError = Math.abs(newRatioError - ratioError);
      ratioError = newRatioError;
    }

    // Now that the appropriate field of view has been found using our working projection, back-calculate the map
    // target required to achieve this field of view in the map projection for which the field of view is being
    // calculated.

    this.tempProjection.invert(mapProjection.getTargetProjected(), out.target);

    return out;
  }
}