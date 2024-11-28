import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { Facility, LegTurnDirection, LegType } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToJoinGreatCircleAtPointVectorBuilder } from '../vectorbuilders/DirectToJoinGreatCircleToPointVectorBuilder';
import { DirectToPointVectorBuilder } from '../vectorbuilders/DirectToPointVectorBuilder';
import { JoinGreatCircleToPointVectorBuilder } from '../vectorbuilders/JoinGreatCircleToPointVectorBuilder';
import { ProcedureTurnVectorBuilder } from '../vectorbuilders/ProcedureTurnVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for course to fix legs.
 */
export class CourseToFixLegCalculator extends AbstractFlightPathLegCalculator {
  private static readonly FALLBACK_INELIGIBLE_LEG_TYPES = [
    LegType.AF,
    LegType.RF,
    LegType.PI
  ];

  private readonly vec3Cache = ArrayUtils.create(4, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(3, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(4, () => new GeoCircle(Vec3Math.create(), 0));
  private readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly joinGreatCircleToPointVectorBuilder = new JoinGreatCircleToPointVectorBuilder();
  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of CourseToFixLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache, true);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    const leg = legs[calculateIndex];
    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[0], leg.leg.fixIcao);
    leg.calculated!.courseMagVar = terminatorPos === undefined ? 0 : this.getLegMagVar(leg.leg, terminatorPos);
  }

  /** @inheritDoc */
  protected calculateVectors(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): void {
    const leg = legs[calculateIndex];
    const vectors = leg.calculated!.flightPath;

    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[1], leg.leg.fixIcao);

    if (!terminatorPos) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const minTurnRadius = state.desiredTurnRadius.asUnit(UnitType.METER);

    if (state.isFallback && !state.isDiscontinuity && state.currentPosition.isValid() && state.currentCourse !== undefined) {
      // We are in a fallback state -> create a direct path to the end point.

      vectorIndex += this.directToPointVectorBuilder.build(
        vectors, vectorIndex,
        state.currentPosition, state.currentCourse,
        terminatorPos,
        minTurnRadius, undefined,
        FlightPathVectorFlags.Fallback
      );

      state.isFallback = false;
    } else {
      state.isFallback = false;

      const prevLeg: LegDefinition | undefined = legs[calculateIndex - 1];

      const endCourse = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
      const endVec = terminatorPos.toCartesian(this.vec3Cache[1]);
      const endPath = this.geoCircleCache[0].setAsGreatCircle(terminatorPos, endCourse);

      if (state.isDiscontinuity || !state.currentPosition.isValid()) {
        // ---- CASE A ----
        // The leg begins in a discontinuity.
        // Create a great-circle vector with a start point arbitrarily placed 5 NM from the terminator fix.

        const startVec = endPath.offsetDistanceAlong(endVec, UnitType.NMILE.convertTo(-5, UnitType.GA_RADIAN), this.geoPointCache[2]);

        if (options.calculateDiscontinuityVectors && state.currentPosition.isValid()) {
          // We are configured to calculate discontinuity vectors. Build a path to the start point.

          const startPath = state.currentCourse !== undefined
            ? this.geoCircleCache[1].setAsGreatCircle(state.currentPosition, state.currentCourse)
            : undefined;

          vectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
            vectors, vectorIndex,
            state.currentPosition, startPath,
            startVec, endPath,
            state.desiredTurnRadius.asUnit(UnitType.METER),
            undefined,
            FlightPathVectorFlags.Discontinuity, true
          );
        }

        vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, startVec, terminatorPos);
      } else {
        const nextLeg: LegDefinition | undefined = legs[calculateIndex + 1];

        const startPoint = state.currentPosition;
        const currentCourse = state.currentCourse ?? startPoint.bearingTo(terminatorPos);

        const startVec = startPoint.toCartesian(this.vec3Cache[0]);
        const startPath = this.geoCircleCache[1].setAsGreatCircle(startPoint, currentCourse);
        const startToEndPath = this.geoCircleCache[3].setAsGreatCircle(startVec, endVec);
        const isStartEqualToEnd = startPoint.equals(terminatorPos);

        const pathAngleDiff = Vec3Math.unitAngle(startPath.center, endPath.center);

        // A great circle defining the threshold of the terminator fix - everything to the LEFT of (i.e. encircled by)
        // this great circle is past the terminator fix as projected along the end path.
        const threshold = this.geoCircleCache[2].setAsGreatCircle(endPath.center, endVec);
        const isStartPastThreshold = threshold.encircles(startVec, false);

        // 175 degrees
        const areStartEndPathsAntiParallel = pathAngleDiff >= 3.05432619 - GeoMath.ANGULAR_TOLERANCE;

        let isDone = false;

        if (!areStartEndPathsAntiParallel && isStartPastThreshold) {
          // ---- CASE B ----
          // The start and end paths are not antiparallel and the start point is past the terminator threshold.

          let shouldTryFallback = true;

          const desiredTurnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg);

          if (
            pathAngleDiff >= MathUtils.HALF_PI
            && (desiredTurnDirection === undefined || (desiredTurnDirection === 'left') === startPath.encircles(endVec))
          ) {
            // The start path is either heading toward the terminator threshold or is parallel to it and the desired
            // turn direction is not away from the end point. We now need to find the intersections between the start
            // and end paths. There should be two intersections since both paths are great circles and they are not
            // parallel or antiparallel.

            const intersections = this.intersectionCache;
            const solutionCount = startPath.intersection(endPath, intersections);

            if (solutionCount === 2) {
              // There are two general cases:
              //
              // 1. The end point lies past the intersection as measured along the end path.
              // 2. The end point lies before the intersection as measured along the end path.
              //
              // In case 1, we can use the default algorithm for joining the start and end paths. Therefore there is
              // nothing to do here; we just need to make sure the code falls through to Case E below.
              //
              // In case 2, we will try to join the start and end paths with a single constant radius turn. This will
              // generate a "loop" where the path follows the start path initially away from the end point and then
              // turns back onto the end path to head back to the end point. If that is not possible or the generated
              // path is too long, we will fall through to Case E.

              shouldTryFallback = false;

              // Choose the intersection closest to the start point.
              const intersection = Vec3Math.dot(intersections[0], startVec) > 0
                ? intersections[0]
                : intersections[1];

              const intersectionToEndDot = Vec3Math.dot(Vec3Math.cross(endPath.center, intersection, this.vec3Cache[2]), endVec);
              const isEndPastIntersection = intersectionToEndDot > GeoMath.ANGULAR_TOLERANCE;

              if (!isEndPastIntersection) {
                vectorIndex += this.joinGreatCircleToPointVectorBuilder.build(
                  vectors, vectorIndex,
                  startVec, startPath,
                  endVec, endPath,
                  desiredTurnDirection, minTurnRadius,
                  true, false, intersection
                );

                if (vectorIndex !== 0) {
                  // Find all the great-circle vectors in the path. These are all guaranteed to be parallel to either
                  // the start or end paths. If the total distance of all these vectors is greater than a maximum
                  // threshold, erase the vectors and let the code fall through to Case E, which will generate a
                  // shorter path.

                  let distance = 0;
                  for (let i = 0; i < vectorIndex; i++) {
                    const vector = vectors[i];
                    if (FlightPathUtils.isVectorGreatCircle(vector)) {
                      distance += vector.distance;
                    }
                  }

                  if (distance > 37040 /* 20 nautical miles */) {
                    vectorIndex = 0;
                  }
                }

                isDone = vectorIndex > 0;
              }
            }
          }

          if (
            shouldTryFallback
            && !leg.leg.flyOver
            && nextLeg
            && !CourseToFixLegCalculator.FALLBACK_INELIGIBLE_LEG_TYPES.includes(nextLeg.leg.type)
          ) {
            // The leg does not end in a fly-over fix and the next leg is eligible for fallback -> end the current leg
            // at the start point and set a fallback state.

            // NOTE: At this point, state.currentPosition is guaranteed to be defined, so we don't have to bother
            // with setting it.
            state.currentCourse ??= currentCourse;
            state.isFallback = true;
            isDone = true;
          }
        }

        if (!isDone) {
          if (areStartEndPathsAntiParallel) {
            // ---- CASE C ----
            // The start and end paths are antiparallel. We need to execute a procedure turn to do a 180.

            let desiredTurnDirection: VectorTurnDirection;
            switch (leg.leg.turnDirection) {
              // If the leg defines a turn direction, respect it.
              case LegTurnDirection.Left:
                desiredTurnDirection = 'left';
                break;
              case LegTurnDirection.Right:
                desiredTurnDirection = 'right';
                break;
              default: {
                const endDistanceFromStartPath = startPath.distance(endVec);
                if (Math.abs(endDistanceFromStartPath) <= GeoMath.ANGULAR_TOLERANCE) {
                  // If the end point lies on the start path, then we want to turn toward the end path after passing
                  // the end point along the start path (defaulting to a right turn if the start and end paths are
                  // exactly antiparallel).
                  const cross = Vec3Math.cross(startPath.center, endVec, this.vec3Cache[2]);
                  desiredTurnDirection = Vec3Math.dot(cross, endPath.center) > 0 ? 'left' : 'right';
                } else {
                  // If the end point does not lie on the start path, then we want to turn toward the end point from
                  // the start path.
                  desiredTurnDirection = endDistanceFromStartPath < 0 ? 'left' : 'right';
                }
              }
            }

            vectorIndex += this.procTurnVectorBuilder.build(
              vectors, vectorIndex,
              startVec, startPath,
              endVec, endPath,
              currentCourse + (desiredTurnDirection === 'left' ? -45 : 45),
              minTurnRadius, desiredTurnDirection,
              currentCourse, endCourse
            );

            // The procedure turn vector builder will only build vectors up to the point where the  procedure turn
            // intercepts the end path. So we need to check if we need to add a vector to connect the intercept point
            // to the end point.
            if (vectorIndex > 0) {
              const lastVector = vectors[vectorIndex - 1];
              const interceptVec = GeoPoint.sphericalToCartesian(lastVector.endLat, lastVector.endLon, this.vec3Cache[2]);
              const interceptToEndDistance = endPath.angleAlong(interceptVec, endVec, Math.PI);
              if (interceptToEndDistance > 1e-5 && interceptToEndDistance < Math.PI + GeoMath.ANGULAR_TOLERANCE) { // ~60 meter tolerance
                vectorIndex += this.circleVectorBuilder.buildGreatCircle(
                  vectors, vectorIndex,
                  this.geoPointCache[2].set(lastVector.endLat, lastVector.endLon), terminatorPos,
                  -endCourse
                );
              }
            }
          } else if (
            endPath.angleAlong(startVec, endVec, Math.PI, GeoMath.ANGULAR_TOLERANCE) < Math.PI + GeoMath.ANGULAR_TOLERANCE
            && (
              pathAngleDiff <= GeoMath.ANGULAR_TOLERANCE
              || (
                !isStartEqualToEnd
                && (
                  Vec3Math.dot(startToEndPath.center, endPath.center) >= 0.996194698 // 5 degrees
                  || (prevLeg?.calculated?.flightPath.length && endPath.includes(startVec, UnitType.METER.convertTo(10, UnitType.GA_RADIAN)))
                )
              )
            )
          ) {
            // ---- CASE D ----
            // The start and end paths are parallel, so we can just connect the start and end with a great-circle path.
            // Or the start point lies on the final course path (within a generous tolerance) and the previous leg has
            // at least one calculated vector. In this case we will simply create a track from the start to end and let
            // turn anticipation handle the initial turn into the final course.

            if (!isStartEqualToEnd) {
              vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, startPoint, terminatorPos, -endCourse);
            }
          } else {
            // ---- CASE E ----
            // The default case. We will attempt to join the start and end paths with a single constant-radius turn
            // toward the end point. If that is not possible, we will fall back to using two constant-radius turns. If
            // that is not possible, we will fall back to a direct path from the start point to the end point.

            const desiredTurnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg);

            vectorIndex += this.joinGreatCircleToPointVectorBuilder.build(
              vectors, vectorIndex,
              startVec, startPath,
              endVec, endPath,
              desiredTurnDirection, minTurnRadius
            );

            const lastVector = vectors[vectorIndex - 1] as FlightPathVector | undefined;

            if (
              lastVector !== undefined
              && !leg.leg.flyOver
              && nextLeg
              && !CourseToFixLegCalculator.FALLBACK_INELIGIBLE_LEG_TYPES.includes(nextLeg.leg.type)
            ) {
              const lastVectorEndVec = GeoPoint.sphericalToCartesian(lastVector.endLat, lastVector.endLon, this.vec3Cache[2]);
              const lastVectorEndPath = FlightPathUtils.getGreatCircleTangentToVector(lastVectorEndVec, lastVector, this.geoCircleCache[3]);
              const lastVectorCourseDiff = Vec3Math.unitAngle(lastVectorEndPath.center, endPath.center);

              if (lastVectorCourseDiff > 0.0174533 /* 1 degree */) {
                // We are allowed to use a fallback path which does not end at the defined terminator fix and a fallback
                // direct path was calculated. We need to determine if we should end the direct-to path early if it
                // crosses past the terminator threshold or remove it entirely and end the leg immediately at the start
                // point.

                const minTurnRadiusRad = UnitType.METER.convertTo(minTurnRadius, UnitType.GA_RADIAN);

                let useImmediateFallback = false;
                let startTurnCircle: GeoCircle | undefined;
                let startTurnEnd: Float64Array | undefined;

                // The direct path can consist of either a single turn vector, a single great-circle vector, or a
                // starting turn vector followed by a great-circle vector.

                if (FlightPathUtils.isVectorGreatCircle(lastVector)) {
                  if (vectorIndex < 2) {
                    // The direct path has a single great-circle vector. If the direct-to course differs from the end
                    // course by more than 90 degrees, then the entire direct-to path is past the terminator threshold.
                    // In that case we will end this leg at the start point and set a fallback state. If the direct
                    // path course is within 90 degrees of the end course, then the path must be entirely behind the
                    // threshold. In that case we will leave the path in place.
                    if (lastVectorCourseDiff > MathUtils.HALF_PI) {
                      useImmediateFallback = true;
                    }
                  } else {
                    // The direct path consists of a starting turn followed by a great-circle vector. If the course of
                    // the great-circle vector differs from the end course by more than 90 degrees, then we need to
                    // deal with the possibility that the direct path starts behind the terminator threshold and then
                    // crosses past the threshold. If the courses differ by 90 or degrees or less, then we will leave
                    // the direct path in place.

                    if (lastVectorCourseDiff > MathUtils.HALF_PI) {
                      if (isStartPastThreshold) {
                        // If the start point is past the terminator threshold, then the entire direct path is
                        // guaranteed to be past the terminator threshold. Therefore we will end this leg at the start
                        // point and set a fallback state.
                        useImmediateFallback = true;
                      } else {
                        // If the start point is not past the terminator threshold, then that means at some point the
                        // direct path (specifically the starting turn) must cross the threshold. Therefore we will
                        // trigger the evaluation code below to find out where we need to end the path early as it
                        // crosses the threshold.
                        const startTurnVector = vectors[vectorIndex - 2];
                        startTurnCircle = FlightPathUtils.setGeoCircleFromVector(startTurnVector, this.geoCircleCache[3]);
                        startTurnEnd = GeoPoint.sphericalToCartesian(startTurnVector.endLat, startTurnVector.endLon, this.vec3Cache[3]);
                      }
                    }
                  }
                } else {
                  // The direct path is a single turn vector.

                  if (isStartPastThreshold) {
                    // If the start point is past the terminator threshold, we will end this leg at the start point and
                    // set a fallback state.
                    useImmediateFallback = true;
                  } else {
                    // If the start point is behind the terminator threshold, then it is possible the turn crosses past
                    // the threshold before it ends. Therefore we will trigger the evaluation code below to find out if
                    // we need to end the path early as it crosses the threshold.

                    // If the direct course calculation produced only a single turn vector, it possibly reduced the radius
                    // of the starting turn below the minimum radius in order to build a valid path to the terminator.
                    // We always want the starting turn to respect the minimum turn radius, so we will define it ourselves.

                    startTurnCircle = FlightPathUtils.getTurnCircleStartingFromPath(
                      startVec, startPath,
                      minTurnRadiusRad, desiredTurnDirection ?? (startPath.encircles(endVec) ? 'left' : 'right'),
                      this.geoCircleCache[3]
                    );

                    // If the direct course turn radius was reduced, then the terminator fix lies inside the starting turn
                    // circle of minimum radius. Therefore, the turn technically never ends because there is no point on
                    // the turn circle that either includes the terminator fix or is tangent to a great-circle path which
                    // includes the terminator fix.

                    if (Math.min(lastVector.radius, Math.PI - lastVector.radius) >= minTurnRadiusRad - GeoMath.ANGULAR_TOLERANCE) {
                      startTurnEnd = GeoPoint.sphericalToCartesian(lastVector.endLat, lastVector.endLon, this.vec3Cache[3]);
                    }
                  }
                }

                if (startTurnCircle !== undefined) {
                  // Find the intersections of the direct path starting turn circle with the terminator threshold.
                  const intersections = this.intersectionCache;
                  const intersectionCount = threshold.intersection(startTurnCircle, intersections);

                  // If the starting turn is tangent to the threshold, then the entire turn must be behind the threshold
                  // because we are guaranteed that the start point is behind the threshold if we made it into this case.
                  // Therefore, we only care about starting turns that are secant to the threshold.
                  if (intersectionCount === 2) {
                    // Because the start point is guaranteed to be behind the threshold, the next intersection of the
                    // starting turn circle with the threshold will take the path past the threshold.

                    const thresholdCrossing = intersections[0];
                    const thresholdCrossingAngle = startTurnCircle.angleAlong(startVec, thresholdCrossing, Math.PI, GeoMath.ANGULAR_TOLERANCE);

                    if (
                      startTurnEnd === undefined
                      || startTurnCircle.angleAlong(startVec, startTurnEnd, Math.PI, GeoMath.ANGULAR_TOLERANCE) > thresholdCrossingAngle + GeoMath.ANGULAR_TOLERANCE
                    ) {
                      // The starting turn crosses the terminator threshold before the end of the turn (or the turn has
                      // no end) -> end the turn at the crossing point and set the fallback state.

                      vectorIndex = 0;

                      vectorIndex += this.circleVectorBuilder.build(
                        vectors, vectorIndex,
                        startTurnCircle,
                        startVec, thresholdCrossing,
                        FlightPathVectorFlags.TurnToCourse | FlightPathVectorFlags.Fallback
                      );

                      state.isFallback = true;
                    }
                  }
                }

                if (useImmediateFallback) {
                  vectorIndex = 0;

                  // NOTE: At this point, state.currentPosition is guaranteed to be defined, so we don't have to bother
                  // with setting it.
                  state.currentCourse ??= currentCourse;
                  state.isFallback = true;
                }
              }
            }
          }
        }
      }
    }

    vectors.length = vectorIndex;

    const lastVector = vectors[vectorIndex - 1];
    if (lastVector !== undefined) {
      state.currentPosition.set(lastVector.endLat, lastVector.endLon);
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
    }

    state.isDiscontinuity = false;
  }
}
