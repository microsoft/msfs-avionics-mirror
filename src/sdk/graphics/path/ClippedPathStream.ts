import { MathUtils } from '../../math/MathUtils';
import { ReadonlyFloat64Array, Vec2Math, Vec3Math } from '../../math/VecMath';
import { Subscribable } from '../../sub/Subscribable';
import { Subscription } from '../../sub/Subscription';
import { AbstractTransformingPathStream, PathStream } from './PathStream';

/**
 * Bitflags describing the relative location of a point with respect to a rectangular bounding box.
 */
enum Outcode {
  Inside = 0,
  Left = 1 << 0,
  Top = 1 << 1,
  Right = 1 << 2,
  Bottom = 1 << 3
}

/**
 * An intersection between a circle and a bounding box.
 */
type CircleBoundsIntersection = {
  /** The coordinates of the intersection, as `[x, y]`. */
  point: Float64Array;

  /**
   * The radial of the circle, in radians, along which the intersection lies. A radial of zero is in the direction of
   * the positive x axis, with increasing radials proceeding clockwise.
   */
  radial: number;
};

/**
 * A path stream which performs clipping to an axis-aligned rectangular bounding box before sending the clipped path
 * to another stream. Clipping is only supported for path segments added via the `lineTo()` and `arc()` methods. Path
 * segments added via `bezierCurveTo()` and `quadraticCurveTo()` will be passed to the consumer stream unclipped.
 */
export class ClippedPathStream extends AbstractTransformingPathStream {
  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2)];
  private static readonly vec3Cache = [new Float64Array(3), new Float64Array(3)];

  private static readonly intersectionCache: CircleBoundsIntersection[] = Array.from({ length: 8 }, () => {
    return { point: new Float64Array(2), radial: Infinity };
  });

  private readonly boundsLines = [
    new Float64Array(3),
    new Float64Array(3),
    new Float64Array(3),
    new Float64Array(3)
  ];
  private isBoundingRectNonZero = false;

  private readonly firstPoint = new Float64Array([NaN, NaN]);
  private readonly prevPoint = new Float64Array([NaN, NaN]);
  private prevPointOutcode = 0;

  private readonly boundsSub: Subscription;

  /**
   * Constructor.
   * @param consumer The path stream that consumes this stream's transformed output.
   * @param bounds A subscribable which provides the clipping bounds for this stream, as `[left, top, right, bottom]`.
   * Whenever the clipping bounds change, the state of this stream will be reset, as if `beginPath()` were called.
   */
  constructor(consumer: PathStream, private readonly bounds: Subscribable<ReadonlyFloat64Array>) {
    super(consumer);

    this.boundsSub = bounds.sub(this.onBoundsChanged.bind(this), true);
  }

  /** @inheritdoc */
  public beginPath(): void {
    this.reset();
    this.consumer.beginPath();
  }

  /** @inheritdoc */
  public moveTo(x: number, y: number): void {
    if (!this.isBoundingRectNonZero) {
      return;
    }

    if (!(isFinite(x) && isFinite(y))) {
      return;
    }

    if (this.prevPoint[0] === x && this.prevPoint[1] === y) {
      return;
    }

    if (isNaN(this.firstPoint[0])) {
      Vec2Math.set(x, y, this.firstPoint);
    }

    Vec2Math.set(x, y, this.prevPoint);
    this.prevPointOutcode = this.getOutcode(x, y);
    if (this.prevPointOutcode === 0) {
      this.consumer.moveTo(x, y);
    }
  }

  /** @inheritdoc */
  public lineTo(x: number, y: number): void {
    if (!this.isBoundingRectNonZero) {
      return;
    }

    if (!(isFinite(x) && isFinite(y))) {
      return;
    }

    if (this.prevPoint[0] === x && this.prevPoint[1] === y) {
      return;
    }

    if (isNaN(this.prevPoint[0])) {
      this.moveTo(x, y);
      return;
    }

    const outcode = this.getOutcode(x, y);
    if ((this.prevPointOutcode | outcode) === 0) {
      // Both the previous point and current point are within bounds.
      this.consumer.lineTo(x, y);
    } else if ((this.prevPointOutcode & outcode) === 0) {
      // One or both of the previous point and current point are out of bounds, and the line connecting them may
      // cross through the bounding rect

      const bounds = this.bounds.get();
      const line = ClippedPathStream.getLineCoordinates(this.prevPoint[0], this.prevPoint[1], x, y, ClippedPathStream.vec3Cache[1]);

      let entryPoint, exitPoint;

      const outcodeOr = this.prevPointOutcode | outcode;
      if ((outcodeOr & ~(Outcode.Left | Outcode.Right)) === 0 || (outcodeOr & ~(Outcode.Top | Outcode.Bottom)) === 0) {
        // The connecting line does not cross zones diagonally -> no need to check if the intersection of the line and
        // boundary falls outside the bounds of the orthogonal axis.

        // find entry point
        for (let i = 0; i < 4; i++) {
          if (this.prevPointOutcode & (1 << i)) {
            entryPoint = ClippedPathStream.findLineLineIntersection(line, this.boundsLines[i], ClippedPathStream.vec2Cache[0]);
            break;
          }
        }

        // find exit point
        for (let i = 0; i < 4; i++) {
          if (outcode & (1 << i)) {
            exitPoint = ClippedPathStream.findLineLineIntersection(line, this.boundsLines[i], ClippedPathStream.vec2Cache[1]);
            break;
          }
        }
      } else {
        // The connecting line crosses zones diagonally -> we need to check if the intersection of the line and each
        // boundary falls outside the bounds of the orthogonal axis.

        // find entry point
        for (let i = 0; i < 4; i++) {
          if (this.prevPointOutcode & (1 << i)) {
            const boundsAxisIndex = (i + 1) % 2;
            const intersection = ClippedPathStream.findLineLineIntersection(line, this.boundsLines[i], ClippedPathStream.vec2Cache[0]);
            if (intersection && intersection[boundsAxisIndex] >= bounds[boundsAxisIndex] && intersection[boundsAxisIndex] <= bounds[boundsAxisIndex + 2]) {
              entryPoint = intersection;
              break;
            }
          }
        }

        // find exit point
        for (let i = 0; i < 4; i++) {
          if (outcode & (1 << i)) {
            const boundsAxisIndex = (i + 1) % 2;
            const intersection = ClippedPathStream.findLineLineIntersection(line, this.boundsLines[i], ClippedPathStream.vec2Cache[1]);
            if (intersection && intersection[boundsAxisIndex] >= bounds[boundsAxisIndex] && intersection[boundsAxisIndex] <= bounds[boundsAxisIndex + 2]) {
              exitPoint = intersection;
              break;
            }
          }
        }
      }

      if (entryPoint) {
        this.consumer.moveTo(entryPoint[0], entryPoint[1]);
      }

      if (exitPoint) {
        this.consumer.lineTo(exitPoint[0], exitPoint[1]);
      } else if (outcode === Outcode.Inside) {
        this.consumer.lineTo(x, y);
      }
    }

    Vec2Math.set(x, y, this.prevPoint);
    this.prevPointOutcode = outcode;
  }

  /** @inheritdoc */
  public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    if (!this.isBoundingRectNonZero) {
      return;
    }

    if (!(isFinite(x) && isFinite(y) && isFinite(cp1x) && isFinite(cp1y) && isFinite(cp2x) && isFinite(cp2y))) {
      return;
    }

    if (isNaN(this.prevPoint[0])) {
      this.moveTo(x, y);
      return;
    }

    if (this.prevPointOutcode !== Outcode.Inside) {
      this.consumer.moveTo(this.prevPoint[0], this.prevPoint[1]);
    }

    this.consumer.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);

    Vec2Math.set(x, y, this.prevPoint);
    this.prevPointOutcode = this.getOutcode(x, y);
  }

  /** @inheritdoc */
  public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    if (!this.isBoundingRectNonZero) {
      return;
    }

    if (!(isFinite(x) && isFinite(y) && isFinite(cpx) && isFinite(cpy))) {
      return;
    }

    if (isNaN(this.prevPoint[0])) {
      this.moveTo(x, y);
      return;
    }

    if (this.prevPointOutcode !== Outcode.Inside) {
      this.consumer.moveTo(this.prevPoint[0], this.prevPoint[1]);
    }

    this.consumer.quadraticCurveTo(cpx, cpy, x, y);

    Vec2Math.set(x, y, this.prevPoint);
    this.prevPointOutcode = this.getOutcode(x, y);
  }

  /** @inheritdoc */
  public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise = false): void {
    if (!this.isBoundingRectNonZero) {
      return;
    }

    if (!(isFinite(x) && isFinite(y) && isFinite(radius) && isFinite(startAngle) && isFinite(endAngle))) {
      return;
    }

    if (radius === 0 || startAngle === endAngle) {
      return;
    }

    const pi2 = 2 * Math.PI;
    const directionSign = counterClockwise ? -1 : 1;

    if (Math.sign(endAngle - startAngle) !== directionSign) {
      // Replicate behavior of canvas context arc() when the sign of the difference between start and end angles
      // doesn't match the counterClockwise flag.
      const angleDiff = ((counterClockwise ? startAngle - endAngle : endAngle - startAngle) % pi2 + pi2) % pi2;
      endAngle = startAngle + angleDiff * directionSign;
    }

    // Canvas context arc() clamps angular width to 2pi, so we will too.
    const angularWidth = Math.min(pi2, (endAngle - startAngle) * directionSign);
    endAngle = startAngle + angularWidth * directionSign;

    const bounds = this.bounds.get();
    const radiusSq = radius * radius;

    const startPoint = Vec2Math.add(
      Vec2Math.set(x, y, ClippedPathStream.vec2Cache[2]),
      Vec2Math.setFromPolar(radius, startAngle, ClippedPathStream.vec2Cache[0]),
      ClippedPathStream.vec2Cache[2]
    );
    const startPointOutcode = this.getOutcode(startPoint[0], startPoint[1]);

    const endPoint = Vec2Math.add(
      Vec2Math.set(x, y, ClippedPathStream.vec2Cache[3]),
      Vec2Math.setFromPolar(radius, endAngle, ClippedPathStream.vec2Cache[0]),
      ClippedPathStream.vec2Cache[3]
    );
    const endPointOutcode = this.getOutcode(endPoint[0], endPoint[1]);

    if (isNaN(this.prevPoint[0])) {
      this.moveTo(startPoint[0], startPoint[1]);
    } else if (!Vec2Math.equals(this.prevPoint, startPoint)) {
      this.lineTo(startPoint[0], startPoint[1]);
    }

    // Find all intersections of the arc circle with the clipping bounds; there can be up to 8 (two for each boundary
    // line).

    const intersections = ClippedPathStream.intersectionCache;
    let intersectionCount = 0;
    for (let i = 0; i < 4; i++) {
      const axisCoordIndex = i % 2;
      const crossAxisCoordIndex = (i + 1) % 2;
      const centerAxisCoord = i % 2 === 0 ? x : y;
      const centerCrossAxisCoord = i % 2 === 0 ? y : x;
      const deltaToBound = bounds[i] - centerAxisCoord;

      if (Math.abs(deltaToBound) < radius) {
        const radialOffsetSign = axisCoordIndex === 0 ? 1 : -1;

        const crossAxisBoundMin = bounds[crossAxisCoordIndex];
        const crossAxisBoundMax = bounds[crossAxisCoordIndex + 2];

        //const radialOffset = Math.acos(deltaToBound / radius);
        const crossAxisOffset = Math.sqrt(radiusSq - deltaToBound * deltaToBound);
        let intersectionRadialOffset;
        {
          const intersectionCrossAxisCoord = centerCrossAxisCoord + crossAxisOffset;
          if (intersectionCrossAxisCoord >= crossAxisBoundMin && intersectionCrossAxisCoord <= crossAxisBoundMax) {
            const intersection = intersections[intersectionCount];
            intersection.point[axisCoordIndex] = bounds[i];
            intersection.point[crossAxisCoordIndex] = intersectionCrossAxisCoord;
            const radial = axisCoordIndex * Math.PI / 2 + (intersectionRadialOffset ??= Math.acos(MathUtils.clamp(deltaToBound / radius, -1, 1))) * radialOffsetSign;
            intersection.radial = (radial + pi2) % pi2; // [0, 2 * pi)
            intersectionCount++;
          }
        }
        {
          const intersectionCrossAxisCoord = centerCrossAxisCoord - crossAxisOffset;
          if (intersectionCrossAxisCoord >= crossAxisBoundMin && intersectionCrossAxisCoord <= crossAxisBoundMax) {
            const intersection = intersections[intersectionCount];
            intersection.point[axisCoordIndex] = bounds[i];
            intersection.point[crossAxisCoordIndex] = intersectionCrossAxisCoord;
            const radial = axisCoordIndex * Math.PI / 2 - (intersectionRadialOffset ??= Math.acos(MathUtils.clamp(deltaToBound / radius, -1, 1))) * radialOffsetSign;
            intersection.radial = (radial + pi2) % pi2; // [0, 2 * pi)
            intersectionCount++;
          }
        }
      }
    }

    if (intersectionCount > 1) {
      // Set all unused intersection radials to infinity so they are guaranteed to be sorted last.
      for (let i = intersectionCount; i < intersections.length; i++) {
        intersections[i].radial = Infinity;
      }

      // Sort the intersections such that they are in clockwise order.
      intersections.sort(ClippedPathStream.compareCircleBoundsIntersections);
    }

    // Begin at the start radial, then in order (either clockwise or counterclockwise depending on the arc direction)
    // iterate through the intersection points. At each intersection, move to the point if we are currently out of
    // bounds or path an arc from the last visited radial to the point if we are inbounds. Every time we visit an
    // intersection we go from out of bounds to in bounds and vice versa. Stop when the radial to the intersection
    // is past the end radial of the arc.

    let isOutside = startPointOutcode !== Outcode.Inside;
    let prevRadial = startAngle;

    let intersectionStartIndex = -1;
    let minAngularDiff = Infinity;
    for (let i = 0; i < intersectionCount; i++) {
      const angularDiff = MathUtils.diffAngle(startAngle * directionSign, intersections[i].radial * directionSign);
      if (angularDiff < minAngularDiff) {
        intersectionStartIndex = i;
        minAngularDiff = angularDiff;
      }
    }

    if (intersectionStartIndex >= 0) {
      let angularWidthRemaining = angularWidth;
      for (let i = 0; i < intersectionCount; i++) {
        const index = (intersectionStartIndex + intersectionCount + i * directionSign) % intersectionCount;
        const intersection = intersections[index];
        const segmentAngularWidth = MathUtils.diffAngle(prevRadial * directionSign, intersection.radial * directionSign);
        if (segmentAngularWidth >= angularWidthRemaining) {
          angularWidthRemaining = 0;
          break;
        }

        const currentRadial = prevRadial + segmentAngularWidth * directionSign;

        if (isOutside) {
          this.consumer.moveTo(intersection.point[0], intersection.point[1]);
        } else {
          this.consumer.arc(x, y, radius, prevRadial, currentRadial, counterClockwise);
        }

        isOutside = !isOutside;
        prevRadial = currentRadial;
        angularWidthRemaining = (endAngle - prevRadial) * directionSign;
      }
    }

    if (!isOutside) {
      // If the last segment is not outside, then we will path an arc to the end radial.
      this.consumer.arc(x, y, radius, prevRadial, endAngle, counterClockwise);
    } else if (endPointOutcode === Outcode.Inside) {
      // If the last segment is outside but the endpoint is inside, then this means the endpoint is very close to the
      // clipping bounds and floating point error caused the discrepancy. In this case, we will not bother to draw an
      // arc because any such arc would be extremely short. Instead, we will move to the end point to ensure we leave
      // the consumer stream in the correct state for the next path command.
      this.consumer.moveTo(endPoint[0], endPoint[1]);
    }

    Vec2Math.copy(endPoint, this.prevPoint);
    this.prevPointOutcode = endPointOutcode;
  }

  /** @inheritdoc */
  public closePath(): void {
    if (!isNaN(this.firstPoint[0])) {
      this.lineTo(this.firstPoint[0], this.firstPoint[1]);
    }
  }

  /**
   * Resets the state of this stream.
   */
  private reset(): void {
    Vec2Math.set(NaN, NaN, this.firstPoint);
    Vec2Math.set(NaN, NaN, this.prevPoint);
    this.prevPointOutcode = 0;
  }

  /**
   * Gets the Cohen-Sutherland outcode for a point.
   * @param x The x-coordinate of the query point.
   * @param y The y-coordinate of the query point.
   * @returns The outcode for the point.
   */
  private getOutcode(x: number, y: number): number {
    const bounds = this.bounds.get();
    let code = 0;

    if (x < bounds[0]) {
      code |= Outcode.Left;
    } else if (x > bounds[2]) {
      code |= Outcode.Right;
    }

    if (y < bounds[1]) {
      code |= Outcode.Top;
    } else if (y > bounds[3]) {
      code |= Outcode.Bottom;
    }

    return code;
  }

  /**
   * Handles clipping bounds change events.
   */
  private onBoundsChanged(): void {
    const bounds = this.bounds.get();

    Vec3Math.set(1, 0, -bounds[0], this.boundsLines[0]);
    Vec3Math.set(0, 1, -bounds[1], this.boundsLines[1]);
    Vec3Math.set(1, 0, -bounds[2], this.boundsLines[2]);
    Vec3Math.set(0, 1, -bounds[3], this.boundsLines[3]);

    this.isBoundingRectNonZero = bounds[0] < bounds[2] && bounds[1] < bounds[3];

    this.beginPath();
  }

  /**
   * Destroys this stream.
   */
  public destroy(): void {
    this.boundsSub.destroy();
  }

  /**
   * Gets the line coordinate vector for a line passing through two points.
   * @param x1 The x-coordinate of the first point on the line.
   * @param y1 The y-coordinate of the first point on the line.
   * @param x2 The x-coordinate of the second point on the line.
   * @param y2 The y-coordinate of the second point on the line.
   * @param out A Float64Array object to which to write the result.
   * @returns The line coordinate vector of the line passing through the two points.
   */
  private static getLineCoordinates(x1: number, y1: number, x2: number, y2: number, out: Float64Array): Float64Array {
    const a = y1 - y2;
    const b = x2 - x1;
    const c = -(a * x1 + b * y1);
    return Vec3Math.set(a, b, c, out);
  }

  /**
   * Finds the intersection point between two lines in 2D Euclidean space.
   * @param line1 The line coordinate vector of the first line.
   * @param line2 The line coordinate vector of the second line.
   * @param out A Float64Array object to which to write the result.
   * @returns The intersection point of the two lines, or undefined if the two lines are parallel.
   */
  private static findLineLineIntersection(line1: Float64Array, line2: Float64Array, out: Float64Array): Float64Array | undefined {
    const cross = Vec3Math.cross(line1, line2, ClippedPathStream.vec3Cache[0]);
    const w = cross[2];
    if (w === 0) {
      return undefined;
    }

    return Vec2Math.set(cross[0] / w, cross[1] / w, out);
  }

  /**
   * Compares two circle-bounding box intersections and returns whether the first intersection's radial is less than,
   * greater than, or equal to the second's radial.
   * @param a The first intersection to compare.
   * @param b The second intersection to compare.
   * @returns A negative number if the first intersection's radial is less than the second, a positive number if the
   * first intersection's radial is greater than the second, or zero if both intersections' radials are equal.
   */
  private static compareCircleBoundsIntersections(a: CircleBoundsIntersection, b: CircleBoundsIntersection): number {
    return a.radial - b.radial;
  }
}