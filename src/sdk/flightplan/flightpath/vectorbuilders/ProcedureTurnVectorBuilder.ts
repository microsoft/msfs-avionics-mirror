import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';

/**
 * Builds vectors representing procedure turn paths.
 */
export class ProcedureTurnVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(4, () => Vec3Math.create());
  private static readonly geoPointCache = ArrayUtils.create(10, () => new GeoPoint(0, 0));
  private static readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));
  private static readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Builds a sequence of vectors representing a procedure turn from a defined starting point and initial course to a
   * defined end point and final course. A procedure turn begins with a variable-length leg from the start point along
   * the initial course followed by an initial turn to intercept the outbound leg of the procedure turn, then a
   * variable-length outbound leg, a 180-degree turn, a variable-length inbound leg, and finally a turn to intercept
   * the final course at the end point. If a full set of vectors cannot be computed given the restraints imposed by the
   * path geometry and the desired turn radius, parts of the turn beginning with the inbound leg of the procedure turn
   * may be altered or omitted entirely.
   * @param vectors The flight path vector sequence to which to add the vectors.
   * @param index The index in the sequence at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle.
   * @param end The end point.
   * @param endPath A GeoCircle that defines the final course. Must be a great circle.
   * @param outboundCourse The true course, in degrees, of the outbound leg of the turn.
   * @param desiredTurnRadius The desired turn radius, in meters.
   * @param desiredTurnDirection The desired turn direction.
   * @param initialCourse The initial course. If not defined, it will be calculated from `startPath` and `start`.
   * @param finalCourse The final course. If not defined, it will be calculated from `endPath` and `end`.
   * @param flags The flags to set on all built vectors. Defaults to the `CourseReversal` flag.
   * @param includeTurnToCourseFlag Whether to include the `TurnToCourse` flag on the turn vectors. Defaults to `true`.
   * @param heading The heading-to-fly to assign to all built vectors, in degrees, or `null` if no heading is to be
   * assigned. Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to built vectors is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   * @throws Error if either the start or end path is not a great circle.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle,
    end: ReadonlyFloat64Array | LatLonInterface,
    endPath: GeoCircle,
    outboundCourse: number,
    desiredTurnRadius: number,
    desiredTurnDirection?: VectorTurnDirection,
    initialCourse?: number,
    finalCourse?: number,
    flags = FlightPathVectorFlags.CourseReversal,
    includeTurnToCourseFlag = true,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (!startPath.isGreatCircle() || !endPath.isGreatCircle()) {
      throw new Error('ProcedureTurnVectorBuilder::build(): start or end path is not a great circle');
    }

    let vectorIndex = index;

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, ProcedureTurnVectorBuilder.vec3Cache[0]);
    }
    if (!(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, ProcedureTurnVectorBuilder.vec3Cache[1]);
    }

    initialCourse ??= startPath.bearingAt(start, Math.PI);
    finalCourse ??= endPath.bearingAt(end, Math.PI);

    // We need to calculate two parameters:
    // (1) The distance to stay on the leg on the initial course.
    // (2) The distance to stay on the outbound leg.
    // We ideally would like to choose these parameters such that the 180-degree turn after the outbound leg ends at a
    // location where it can immediately make another turn to intercept the final course (i.e. reduce the distance of
    // the inbound leg to 0). However, this may not be possible since we are constrained by the fact that the two
    // distance parameters cannot be negative. To simplify the math, we will do an approximate calculation based on a
    // pseudo-Euclidean geometry instead of spherical geometry. The error of the approximation is proportional to how
    // much the angle between the initial and final courses deviate from 180 degrees; if they are exactly antiparallel
    // then the error is zero.

    const startPoint = ProcedureTurnVectorBuilder.geoPointCache[0].setFromCartesian(start);

    const initialTurnDirection = FlightPathUtils.getShortestTurnDirection(initialCourse, outboundCourse) ?? 'right';
    const initialTurnDirectionSign = initialTurnDirection === 'left' ? -1 : 1;

    const startPathEndPointDistance = startPath.distance(end);
    const isInitialTurnTowardEndPath = (startPathEndPointDistance <= GeoMath.ANGULAR_TOLERANCE) === (initialTurnDirection === 'left');

    const deltaOutbound = Math.abs(MathUtils.angularDistanceDeg(initialCourse, outboundCourse, 0)) * Avionics.Utils.DEG2RAD;
    const thetaOutbound = (Math.PI - deltaOutbound) / 2;
    const desiredTurnRadiusRad = UnitType.METER.convertTo(desiredTurnRadius, UnitType.GA_RADIAN);

    // If there is a desired turn direction, honor it. Otherwise choose the direction that results in the shortest path
    // to intercept the next leg.
    const turnDirection = desiredTurnDirection
      ?? (((initialTurnDirection === 'left') === deltaOutbound < Math.PI) ? 'right' : 'left');
    const turnDirectionSign = turnDirection === 'left' ? -1 : 1;

    const endPointToStartPathXTrackDistance = Math.abs(startPathEndPointDistance);

    let desiredAlongTurnOutboundPathDistance = Math.abs(deltaOutbound - Math.PI / 2) > 1e-10
      ? Math.asin(MathUtils.clamp(Math.tan(2 * desiredTurnRadiusRad) / Math.tan(deltaOutbound), -1, 1)) * (turnDirection === initialTurnDirection ? -1 : 1)
      : 0;
    desiredAlongTurnOutboundPathDistance += Math.asin(MathUtils.clamp(Math.sin(endPointToStartPathXTrackDistance) / Math.sin(deltaOutbound), -1, 1))
      * (isInitialTurnTowardEndPath ? 1 : -1);
    const alongTurnOutboundPathDistance = Math.max(0, desiredAlongTurnOutboundPathDistance);

    let desiredAlongStartPathDistance = MathUtils.normalizeAngle(startPath.distanceAlong(start, end, Math.PI), -Math.PI);
    desiredAlongStartPathDistance -= desiredAlongTurnOutboundPathDistance === 0
      ? 0
      : Math.atan(Math.cos(deltaOutbound) * Math.tan(desiredAlongTurnOutboundPathDistance));
    desiredAlongStartPathDistance += Math.asin(MathUtils.clamp(Math.sin(deltaOutbound) * Math.sin(2 * desiredTurnRadiusRad), -1, 1))
      * (turnDirection === initialTurnDirection ? 1 : -1);
    const alongStartPathDistance = Math.max(0, desiredAlongStartPathDistance);

    const initialTurnStartPoint = alongStartPathDistance > 0
      ? startPath.offsetDistanceAlong(start, alongStartPathDistance, ProcedureTurnVectorBuilder.geoPointCache[1])
      : startPoint;

    const initialTurnCenterPoint = initialTurnStartPoint.offset(initialCourse + 90 * initialTurnDirectionSign, desiredTurnRadiusRad, ProcedureTurnVectorBuilder.geoPointCache[2]);
    const initialTurnHalfAngularWidth = Math.acos(Math.sin(thetaOutbound) * Math.cos(desiredTurnRadiusRad)) * Avionics.Utils.RAD2DEG;
    const initialTurnStartBearing = initialTurnCenterPoint.bearingTo(initialTurnStartPoint);
    const initialTurnEndBearing = MathUtils.normalizeAngleDeg(initialTurnStartBearing + initialTurnHalfAngularWidth * 2 * initialTurnDirectionSign);
    const initialTurnEndPoint = initialTurnCenterPoint.offset(initialTurnEndBearing, desiredTurnRadiusRad, ProcedureTurnVectorBuilder.geoPointCache[3]);

    const turnStartPoint = alongTurnOutboundPathDistance > 0
      ? initialTurnEndPoint.offset(outboundCourse, alongTurnOutboundPathDistance, ProcedureTurnVectorBuilder.geoPointCache[4])
      : initialTurnEndPoint;

    const turnCenterPoint = turnStartPoint.offset(outboundCourse + 90 * turnDirectionSign, desiredTurnRadiusRad, ProcedureTurnVectorBuilder.geoPointCache[5]);
    const turnStartBearing = turnCenterPoint.bearingTo(turnStartPoint);
    let turnEndBearing = (turnStartBearing + 180) % 360;
    const turnEndPoint = turnCenterPoint.offset(turnEndBearing, desiredTurnRadiusRad, ProcedureTurnVectorBuilder.geoPointCache[6]);
    const turnEndVec = turnEndPoint.toCartesian(ProcedureTurnVectorBuilder.vec3Cache[2]);

    let finalTurnDirection: VectorTurnDirection | undefined;
    let finalTurnRadius: number | undefined;
    let finalTurnStartPoint: GeoPoint | undefined;
    let finalTurnCenterPoint: GeoPoint | undefined;
    let finalTurnEndPoint: GeoPoint | undefined;
    let endPoint: GeoPoint | undefined;

    if (endPath.encircles(turnEndVec) === (initialTurnDirection === 'left')) {
      // The end of the 180-degree turn from the outbound leg to the inbound leg lies beyond the final course due to
      // approximation error, so we need to end the turn early.

      const turnCircle = ProcedureTurnVectorBuilder.geoCircleCache[0].set(turnCenterPoint, desiredTurnRadiusRad);
      const intersections = ProcedureTurnVectorBuilder.intersectionCache;
      const numIntersections = turnCircle.intersection(endPath, intersections);
      if (numIntersections === 0) {
        // The final course path is completely outside of the turn, which can only happen if there is a major deviation
        // from the pseudo-Euclidean approximation. There is no easy way to recover from this state, so we will just
        // bail out and connect the end of the inbound leg to the end point with a great-circle path.
        endPoint = ProcedureTurnVectorBuilder.geoPointCache[7].setFromCartesian(end);
      } else {
        if (numIntersections === 2) {
          // Choose the intersection that gives the smallest angle between the end of the turn and the final course path.

          const headingAdjustment = MathUtils.HALF_PI * turnDirectionSign;
          const angleDiff_0 = MathUtils.angularDistance(
            Vec3Math.unitAngle(
              GeoCircle.getGreatCircleNormal(turnCenterPoint, intersections[0], ProcedureTurnVectorBuilder.vec3Cache[3]),
              endPath.center
            ) + headingAdjustment,
            0,
            0
          );
          const angleDiff_1 = MathUtils.angularDistance(
            Vec3Math.unitAngle(
              GeoCircle.getGreatCircleNormal(turnCenterPoint, intersections[1], ProcedureTurnVectorBuilder.vec3Cache[3]),
              endPath.center
            ) + headingAdjustment,
            0,
            0
          );
          turnEndPoint.setFromCartesian(intersections[angleDiff_0 < angleDiff_1 ? 0 : 1]);
        } else {
          turnEndPoint.setFromCartesian(intersections[0]);
        }

        turnEndBearing = turnCenterPoint.bearingTo(turnEndPoint);
      }
    } else {
      const turnFinalCourse = MathUtils.normalizeAngleDeg(outboundCourse + 180);
      const turnInboundPath = ProcedureTurnVectorBuilder.geoCircleCache[0].setAsGreatCircle(turnEndPoint, turnFinalCourse);

      const intersections = ProcedureTurnVectorBuilder.intersectionCache;
      const numIntersections = turnInboundPath.intersection(endPath, intersections);

      // Only move forward if the end of the turn does not lie on the final course path.
      const endPathTurnEndDistance = endPath.distance(turnEndVec);
      if (numIntersections !== 0 && Math.abs(endPathTurnEndDistance) > GeoMath.ANGULAR_TOLERANCE) {
        const intersection = intersections[(numIntersections === 1 || endPathTurnEndDistance <= GeoMath.ANGULAR_TOLERANCE) ? 0 : 1];
        // Only move forward if the intersection lies before the endpoint, otherwise we will just end the leg at the
        // end of the 180-degree turn.
        if (
          Vec3Math.dot(
            GeoCircle.getGreatCircleNormal(intersection, end, ProcedureTurnVectorBuilder.vec3Cache[3]),
            endPath.center
          ) > 0
        ) {
          // Because we used an approximation to place the procedure turn, the inbound leg may not allow for a
          // turn of the desired radius to perfectly intercept the final path. Therefore, we need to explicitly
          // calculate the maximum allowed turn radius for this final turn and adjust the turn radius as needed.
          // Note that if the initial and final paths are antiparallel, these calculations are not strictly
          // necessary, but we will carry them out in all cases to account for floating point errors that may
          // have accumulated during previous calculations.

          const deltaInbound = Vec3Math.unitAngle(endPath.center, turnInboundPath.center);
          const thetaInbound = (Math.PI - deltaInbound) / 2;
          const tanThetaInbound = Math.tan(thetaInbound);

          const desiredFinalTurnAlongTrackDistance = Math.asin(MathUtils.clamp(Math.tan(desiredTurnRadiusRad) / tanThetaInbound, -1, 1));
          const finalTurnAlongTrackDistance = Math.min(
            desiredFinalTurnAlongTrackDistance,
            Vec3Math.unitAngle(intersection, turnEndVec),
            Vec3Math.unitAngle(intersection, end)
          );
          const finalTurnRadiusRad = finalTurnAlongTrackDistance === desiredFinalTurnAlongTrackDistance
            ? desiredTurnRadiusRad
            : Math.atan(Math.sin(finalTurnAlongTrackDistance) * tanThetaInbound);

          finalTurnDirection = FlightPathUtils.getShortestTurnDirection(turnFinalCourse, finalCourse) ?? 'right';
          finalTurnRadius = UnitType.GA_RADIAN.convertTo(finalTurnRadiusRad, UnitType.METER);

          finalTurnStartPoint = turnInboundPath.offsetDistanceAlong(intersection, -finalTurnAlongTrackDistance, ProcedureTurnVectorBuilder.geoPointCache[7], Math.PI);
          finalTurnCenterPoint = finalTurnStartPoint.offset(turnFinalCourse + (finalTurnDirection === 'left' ? -90 : 90), finalTurnRadiusRad, ProcedureTurnVectorBuilder.geoPointCache[8]);
          finalTurnEndPoint = endPath.offsetDistanceAlong(intersection, finalTurnAlongTrackDistance, ProcedureTurnVectorBuilder.geoPointCache[9], Math.PI);
        }
      }
    }

    // Set vectors.

    const turnFlags = flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : 0);

    // Start point to start of turn onto outbound leg.
    if (initialTurnStartPoint !== startPoint) {
      vectorIndex += this.circleVectorBuilder.buildGreatCircle(
        vectors, vectorIndex,
        startPoint, initialTurnStartPoint,
        initialCourse,
        flags,
        heading, isHeadingTrue
      );
    }

    // Turn onto outbound leg.
    vectorIndex += this.circleVectorBuilder.buildTurn(
      vectors, vectorIndex,
      desiredTurnRadius, initialTurnDirection,
      initialTurnCenterPoint, initialTurnStartPoint, initialTurnEndPoint,
      turnFlags,
      heading, isHeadingTrue
    );

    // Outbound leg.
    if (turnStartPoint !== initialTurnEndPoint) {
      vectorIndex += this.circleVectorBuilder.buildGreatCircle(
        vectors, vectorIndex,
        initialTurnEndPoint, turnStartPoint,
        outboundCourse,
        flags,
        heading, isHeadingTrue
      );
    }

    // 180-degree turn from outbound leg to inbound leg.
    vectorIndex += this.circleVectorBuilder.buildTurn(
      vectors, vectorIndex,
      desiredTurnRadius, turnDirection,
      turnCenterPoint, turnStartPoint, turnEndPoint,
      turnFlags,
      heading, isHeadingTrue
    );

    if (finalTurnCenterPoint) {
      // At this point we are guaranteed that finalTurnStartPoint, finalTurnEndPoint, and finalTurnDirection are all defined.

      // Inbound leg.
      if (!finalTurnStartPoint!.equals(turnEndPoint)) {
        vectorIndex += this.circleVectorBuilder.buildGreatCircle(
          vectors, vectorIndex,
          turnEndPoint, finalTurnStartPoint!,
          outboundCourse + 180,
          flags,
          heading, isHeadingTrue
        );
      }

      // Turn onto final course.
      vectorIndex += this.circleVectorBuilder.buildTurn(
        vectors, vectorIndex,
        finalTurnRadius!, finalTurnDirection!,
        finalTurnCenterPoint, finalTurnStartPoint!, finalTurnEndPoint!,
        turnFlags,
        heading, isHeadingTrue
      );
    } else {
      if (endPoint) {
        vectorIndex += this.circleVectorBuilder.buildGreatCircle(
          vectors, vectorIndex,
          turnEndPoint, endPoint,
          -finalCourse,
          flags,
          heading, isHeadingTrue
        );
      }
    }

    return vectorIndex - index;
  }
}
