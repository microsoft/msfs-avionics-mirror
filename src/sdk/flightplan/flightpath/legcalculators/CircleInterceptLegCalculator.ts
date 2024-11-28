import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { NavMath } from '../../../geo/NavMath';
import { BitFlags } from '../../../math/BitFlags';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { Facility } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags } from '../FlightPathVector';
import { CircleInterceptVectorBuilder } from '../vectorbuilders/CircleInterceptVectorBuilder';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToPointVectorBuilder } from '../vectorbuilders/DirectToPointVectorBuilder';
import { InterceptGreatCircleToPointVectorBuilder } from '../vectorbuilders/InterceptGreatCircleToPointVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Information describing an intercept course for a {@link CircleInterceptLegCalculator}.
 */
export type CircleInterceptLegInterceptCourseInfo = {
  /** The true intercept course, in degrees. */
  course: number;

  /**
   * The heading to fly for the intercept, in degrees, or `null` if the intercept is not to be flown with constant
   * heading.
   */
  heading: number | null;

  /** Whether the heading-to-fly is relative to true north instead of magnetic north. */
  isHeadingTrue: boolean;
};

/**
 * Information describing a path to intercept for a {@link CircleInterceptLegCalculator}.
 */
export type CircleInterceptLegPathToInterceptInfo = {
  /** The true intercept course, in degrees. */
  circle: GeoCircle;

  /**
   * The start of the path to intercept. If the path to intercept spans the entire GeoCircle along which it lies or if
   * the path to intercept is a semicircle that terminates at a defined end point, then this value is equal to
   * `[NaN, NaN, NaN]`.
   */
  start: Float64Array;

  /**
   * The end of the path to intercept. If the path to intercept spans the entire GeoCircle along which it lies or if
   * the path to intercept is a semicircle that begins at a defined start point, then this value is equal to
   * `[NaN, NaN, NaN]`.
   */
  end: Float64Array;
};

/**
 * Information describing a desired intersection between an intercept path and a path to intercept for a
 * {@link CircleInterceptLegCalculator}.
 */
export type CircleInterceptLegDesiredIntersectionInfo = {
  /**
   * Whether the starting point of the intercept path is located past the path to intercept as measured along the
   * intercept path.
   */
  isStartPastPathToIntercept: boolean;

  /**
   * The desired intersection point. If the intercept path does not intersect the intercept path, then this value is
   * equal to `[NaN, NaN, NaN]`.
   */
  desiredIntersection: Float64Array;
};

/**
 * Information describing a potential fallback path to intercept the path to intercept for a
 * {@link CircleInterceptLegCalculator}.
 */
export type CircleInterceptLegFallbackInterceptInfo = {
  /**
   * Whether the starting point of the intercept path is located past the path to intercept as measured along the
   * intercept path.
   */
  isStartPastPathToIntercept: boolean;

  /**
   * The point at which the fallback path intercepts the path to intercept. If a fallback path is not required, then
   * this value is equal to `[NaN, NaN, NaN]`.
   */
  fallbackInterceptPoint: Float64Array;
};

/**
 * Calculates flight path vectors for legs with great-circle paths that terminate when intercepting another geo circle.
 */
export abstract class CircleInterceptLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly __vec3Cache = ArrayUtils.create(10, () => Vec3Math.create());
  private readonly __geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly __geoCircleCache = ArrayUtils.create(7, () => new GeoCircle(Vec3Math.create(), 0));
  private readonly __intersectionCache = ArrayUtils.create(1, () => [Vec3Math.create(), Vec3Math.create()]);

  protected readonly circleVectorBuilder = new CircleVectorBuilder();
  protected readonly circleInterceptVectorBuilder = new CircleInterceptVectorBuilder();
  protected readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();
  protected readonly interceptGreatCircleToPointVectorBuilder = new InterceptGreatCircleToPointVectorBuilder();

  private readonly interceptCourseInfo: CircleInterceptLegInterceptCourseInfo = {
    course: 0,
    heading: null,
    isHeadingTrue: false
  };

  private readonly pathToInterceptInfo: CircleInterceptLegPathToInterceptInfo = {
    circle: new GeoCircle(Vec3Math.create(), 0),
    start: Vec3Math.create(NaN, NaN, NaN),
    end: Vec3Math.create(NaN, NaN, NaN)
  };

  private readonly desiredIntersectionInfo: CircleInterceptLegDesiredIntersectionInfo = {
    isStartPastPathToIntercept: false,
    desiredIntersection: Vec3Math.create(NaN, NaN, NaN)
  };

  private readonly fallbackInterceptInfo: CircleInterceptLegFallbackInterceptInfo = {
    isStartPastPathToIntercept: false,
    fallbackInterceptPoint: Vec3Math.create(NaN, NaN, NaN)
  };

  /**
   * Creates a new instance of CircleInterceptLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   * @param isHeadingLeg Whether this calculator calculates flight plan legs flown with constant heading.
   */
  public constructor(facilityCache: Map<string, Facility>, protected readonly isHeadingLeg: boolean) {
    super(facilityCache, !isHeadingLeg);
  }

  /** @inheritDoc */
  protected calculateVectors(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState
  ): void {
    const leg = legs[calculateIndex];
    const vectors = leg.calculated!.flightPath;

    if (state.isDiscontinuity || !state.currentPosition.isValid()) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    const interceptCourseInfo = this.getInterceptCourseInfo(legs, calculateIndex, activeLegIndex, state, this.interceptCourseInfo);
    const pathToInterceptInfo = this.getPathToInterceptInfo(legs, calculateIndex, activeLegIndex, state, this.pathToInterceptInfo);

    if (!interceptCourseInfo || !pathToInterceptInfo) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const isActiveLeg = calculateIndex === activeLegIndex;

    let startAtPlanePos = false;
    let retainOldVectors = false;

    if (isActiveLeg && interceptCourseInfo.heading !== null && state.planePosition.isValid()) {
      // If the leg to calculate is the active leg and a fly-heading leg and we know the airplane's current position,
      // then we should start the leg path at the airplane's current position. The exception to this is if non-fallback
      // vectors have been previously calculated and include an initial turn and the airplane's current position is
      // within a certain cross-track distance of the turn and before the end of the turn. In this case, we will
      // retain the previously calculated vectors.

      startAtPlanePos = true;

      if (vectors.length > 0) {
        const firstVector = vectors[0];
        if (!BitFlags.isAll(firstVector.flags, FlightPathVectorFlags.Fallback) && !FlightPathUtils.isVectorGreatCircle(firstVector)) {
          const firstVectorCircle = FlightPathUtils.setGeoCircleFromVector(firstVector, this.__geoCircleCache[0]);
          const planePosVec = state.planePosition.toCartesian(this.__vec3Cache[0]);
          const xtk = Math.abs(firstVectorCircle.distance(planePosVec));

          if (xtk < UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN)) {
            const alongVectorNormDistance = FlightPathUtils.getAlongArcNormalizedDistance(
              firstVectorCircle,
              this.__geoPointCache[0].set(firstVector.startLat, firstVector.startLon),
              this.__geoPointCache[1].set(firstVector.endLat, firstVector.endLon),
              planePosVec
            );
            if (alongVectorNormDistance < 1) {
              startAtPlanePos = false;
              retainOldVectors = true;
            }
          }
        }
      }

      if (startAtPlanePos) {
        state.currentPosition.set(state.planePosition);
        state.currentCourse = interceptCourseInfo.course;
      }
    }

    if (retainOldVectors) {
      // We need to ensure the flight path state is updated to reflect the end of the leg. Note that retainOldVectors
      // can only be true if the leg has at least one calculated vector.
      FlightPathUtils.getLegFinalPosition(leg.calculated!, state.currentPosition);
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(vectors[vectors.length - 1]);
      state.isDiscontinuity = false;
      state.isFallback = leg.calculated!.endsInFallback;
      return;
    }

    const pathToInterceptHasStart = Vec3Math.isFinite(pathToInterceptInfo.start);
    const pathTointerceptHasEnd = Vec3Math.isFinite(pathToInterceptInfo.end);

    const effectivePathToInterceptStartVec = pathToInterceptHasStart
      ? pathToInterceptInfo.start
      : pathTointerceptHasEnd
        ? pathToInterceptInfo.circle.offsetAngleAlong(pathToInterceptInfo.end, -Math.PI, this.__vec3Cache[0], Math.PI)
        : undefined;
    const effectivePathToInterceptEndVec = pathTointerceptHasEnd
      ? pathToInterceptInfo.end
      : pathToInterceptHasStart
        ? pathToInterceptInfo.circle.offsetAngleAlong(pathToInterceptInfo.start, Math.PI, this.__vec3Cache[1], Math.PI)
        : undefined;
    const effectivePathToInterceptAngularWidth = pathToInterceptHasStart && pathTointerceptHasEnd
      ? pathToInterceptInfo.circle.angleAlong(pathToInterceptInfo.start, pathToInterceptInfo.end, Math.PI)
      : effectivePathToInterceptStartVec
        ? Math.PI
        : MathUtils.TWO_PI;

    const initialVec = state.currentPosition.toCartesian(this.__vec3Cache[2]);
    const initialCourse = state.currentCourse ?? interceptCourseInfo.course;

    const initialPos = this.__geoPointCache[0].set(state.currentPosition);
    let startPath = this.__geoCircleCache[0].setAsGreatCircle(state.currentPosition, initialCourse);
    let interceptPathStartVec = initialVec;

    let fallbackCalcStartPos = initialPos;
    let fallbackCalcStartVec = initialVec;
    let fallbackCalcStartCourse = initialCourse;

    let needHandleDefaultCase = true;
    let needBuildInterceptVectors = true;
    let forceFallback = false;
    let useFallbackVectors = false;
    const fallbackInterceptInfo = this.fallbackInterceptInfo;

    // If the leg starts in a fallback state, we are not starting the leg at the airplane's current position, and there
    // is a leg before the one being calculated, then attempt to get the terminator position of the previous leg. If
    // successful, then calculate where a fallback intercept point would be located if the leg were to start at the
    // previous leg's terminator position and force a fallback path to be built to that point.
    if (state.isFallback && !startAtPlanePos && calculateIndex > 0) {
      const prevLeg = legs[calculateIndex - 1];
      const prevLegTerminatorPos = this.getTerminatorPosition(prevLeg.leg, this.__geoPointCache[1]);
      if (prevLegTerminatorPos) {
        fallbackCalcStartPos = prevLegTerminatorPos;
        fallbackCalcStartVec = fallbackCalcStartPos.toCartesian(this.__vec3Cache[3]);
        fallbackCalcStartCourse = this.getLegTrueCourse(prevLeg.leg) ?? interceptCourseInfo.course;
        forceFallback = true;
        useFallbackVectors = true;
      }
    }

    // ---- SPECIAL CASE A ----
    // The path to intercept is a great circle and the intercept course heads away from the path to intercept.
    if (pathToInterceptInfo.circle.isGreatCircle()) {
      const interceptPath = this.__geoCircleCache[1].setAsGreatCircle(fallbackCalcStartPos, interceptCourseInfo.course);
      const desiredIntersectionInfo = this.calculateDesiredIntersectionInfo(
        fallbackCalcStartVec, interceptPath,
        pathToInterceptInfo.circle,
        effectivePathToInterceptStartVec, effectivePathToInterceptEndVec, effectivePathToInterceptAngularWidth,
        this.desiredIntersectionInfo
      );

      if (desiredIntersectionInfo.isStartPastPathToIntercept) {
        let needHandleOvershootCase = true;
        let initialPath: GeoCircle;

        if (interceptCourseInfo.course !== fallbackCalcStartCourse) {
          initialPath = this.__geoCircleCache[2].setAsGreatCircle(fallbackCalcStartPos, fallbackCalcStartCourse);

          this.calculateFallbackInterceptInfo(
            fallbackCalcStartVec, initialPath,
            pathToInterceptInfo.circle,
            effectivePathToInterceptStartVec, effectivePathToInterceptEndVec, effectivePathToInterceptAngularWidth,
            forceFallback,
            fallbackInterceptInfo
          );

          needHandleOvershootCase = true;

          if (!fallbackInterceptInfo.isStartPastPathToIntercept) {
            // ---- SPECIAL CASE A.1 ----
            // The initial course is directed toward the path to intercept. In this case we will ignore the intercept
            // course and attempt to intercept the path to intercept along the initial course.

            useFallbackVectors = true;
            needHandleDefaultCase = true;
            needHandleOvershootCase = false;
          } else if (!forceFallback && !startAtPlanePos && MathUtils.angularDistanceDeg(initialCourse, interceptCourseInfo.course, 0) > 1) {
            // ---- SPECIAL CASE A.2 ----
            // The initial course is directed away from the path to intercept, we are not starting at the airplane's
            // current position, and there is an initial turn toward the intercept course. In this case we need to
            // check whether the initial turn toward the intercept course also turns toward the path to intercept.
            // Because both the initial and intercept courses are directed away from the path to intercept, the initial
            // turn will turn toward the path to intercept if and only if it passes through 180 degrees of arc or more.
            // This is equivalent to the turn direction not being the direction that results in the shortest turn from
            // the initial course to the intercept course.

            const turnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg);
            // Note that if the initial course and intercept course are antiparallel (180 degrees apart), then
            // FlightPathUtils_G::GetShortestTurnDirection() returns an undefined value, which is never equal to
            // turnDirection if turnDirection is defined.
            if (turnDirection !== undefined && turnDirection !== FlightPathUtils.getShortestTurnDirection(initialCourse, interceptCourseInfo.course)) {
              // The initial turn does turn toward the path to intercept. In this case, we can attempt to construct
              // a path that consists of the initial turn toward the path to intercept connected to a final turn in the
              // same direction as the initial turn that intercepts the path to intercept.

              needHandleOvershootCase = false;

              const turnDirectionSign = turnDirection === 'left' ? -1 : 1;
              const initialTurnStartRadial = this.__geoCircleCache[3].setAsGreatCircle(initialVec, initialPath.center);
              const turnRadiusRad = state.desiredTurnRadius.asUnit(UnitType.GA_RADIAN);
              const initialTurnCenterVec = initialTurnStartRadial.offsetDistanceAlong(
                initialVec,
                turnRadiusRad * -turnDirectionSign,
                this.__vec3Cache[4],
                Math.PI
              );
              const initialTurnCircle = FlightPathUtils.getTurnCircle(initialTurnCenterVec, turnRadiusRad, turnDirection, this.__geoCircleCache[3]);

              const initialTurnEndVec = initialTurnCircle.offsetAngleAlong(
                initialVec,
                MathUtils.angularDistanceDeg(initialCourse, interceptCourseInfo.course, turnDirectionSign) * Avionics.Utils.DEG2RAD,
                this.__vec3Cache[5],
                Math.PI
              );
              // The desired angle at which to intercept the path to intercept.
              const interceptAngleRad = Vec3Math.unitAngle(
                GeoCircle.getGreatCircleNormal(initialTurnEndVec, initialTurnCircle, this.__vec3Cache[6]),
                pathToInterceptInfo.circle.center
              );

              // The signed distance from the path to intercept to the center of the initial turn. Negative values
              // indicate that the turn center is encircled by the path to intercept's geo circle.
              const initialTurnCenterDistance = pathToInterceptInfo.circle.distance(initialTurnCenterVec);

              // The center of the initial turn projected onto the path to intercept.
              const initialTurnCenterProjected = pathToInterceptInfo.circle.closest(initialTurnCenterVec, this.__vec3Cache[6]);

              // Only proceed if the projection was successful. If it was not successful, then that means we are
              // either very far away from the path to intercept or the turn radius is unreasonably large. Either way,
              // we will bail out and fall through to the default case.
              if (Vec3Math.isFinite(initialTurnCenterProjected)) {

                // Calculate the position of a final turn that intercepts the path to intercept at exactly the
                // desired intercept angle. The center of this final turn lies along the great circle passing
                // through the center of the initial turn and initialTurnCenterProjected.

                // The signed distance from the path to intercept to the center of the final turn. Negative values
                // indicate that the turn center is encircled by the path to intercept's geo circle.
                const finalTurnCenterDistance = Math.asin(Math.sin(interceptAngleRad) * Math.sin(turnRadiusRad))
                  * (interceptAngleRad < MathUtils.HALF_PI ? turnDirectionSign : -turnDirectionSign);

                // The distance from the final turn center projected onto the path to intercept (which is equal to
                // initialTurnCenterProjected) to the intercept point along the path to intercept.
                const interceptOffset = Math.abs(Math.atan(Math.cos(interceptAngleRad) * Math.tan(turnRadiusRad)))
                  * (pathToInterceptInfo.circle.encircles(initialVec) ? -turnDirectionSign : turnDirectionSign);

                const signedTurnCenterDelta = -turnDirectionSign * (finalTurnCenterDistance - initialTurnCenterDistance);
                if (signedTurnCenterDelta > GeoMath.ANGULAR_TOLERANCE) {
                  // The initial and final turns are positioned such that a great-circle path is needed to connect the
                  // two. Therefore, we will calculate the connecting path.

                  const finalTurnCenterVec = this.__geoCircleCache[4].setAsGreatCircle(pathToInterceptInfo.circle.center, initialTurnCenterProjected)
                    .offsetDistanceAlong(initialTurnCenterProjected, finalTurnCenterDistance, this.__vec3Cache[7], Math.PI);
                  const finalTurnCircle = FlightPathUtils.getTurnCircle(finalTurnCenterVec, turnRadiusRad, turnDirection, this.__geoCircleCache[4]);

                  // The set of centers of great circles that are tangent to the initial turn.
                  const initialTurnTangentCenters = this.__geoCircleCache[5].set(initialTurnCircle.center, Math.abs(MathUtils.HALF_PI - initialTurnCircle.radius));
                  // The set of centers of great circles that are tangent to the final turn.
                  const finalTurnTangentCenters = this.__geoCircleCache[6].set(finalTurnCircle.center, Math.abs(MathUtils.HALF_PI - finalTurnCircle.radius));

                  const connectingPathCenterCandidates = this.__intersectionCache[0];
                  const connectingPathCenterCount = initialTurnTangentCenters.intersection(finalTurnTangentCenters, connectingPathCenterCandidates);

                  // There should always be two great circles tangent to two non-concentric small circles. If we can't
                  // find them both, then we will bail out and fall through to the default case.
                  if (connectingPathCenterCount === 2) {
                    const connectingPath = this.__geoCircleCache[5].set(connectingPathCenterCandidates[0], MathUtils.HALF_PI);
                    connectingPath.closest(initialTurnCenterVec, initialTurnEndVec);
                    const finalTurnStartVec = connectingPath.closest(finalTurnCenterVec, this.__vec3Cache[8]);
                    const interceptVec = pathToInterceptInfo.circle.offsetDistanceAlong(
                      initialTurnCenterProjected,
                      interceptOffset,
                      this.__vec3Cache[9],
                      Math.PI
                    );

                    // Build vectors for the initial turn, the connecting path, and the final turn.

                    if (Vec3Math.unitAngle(initialVec, initialTurnEndVec) > GeoMath.ANGULAR_TOLERANCE) {
                      vectorIndex += this.circleVectorBuilder.build(
                        vectors, vectorIndex,
                        initialTurnCircle,
                        initialVec, initialTurnEndVec,
                        FlightPathVectorFlags.TurnToCourse | FlightPathVectorFlags.Fallback,
                        interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
                      );
                    }

                    if (Vec3Math.unitAngle(initialTurnEndVec, finalTurnStartVec) > GeoMath.ANGULAR_TOLERANCE) {
                      vectorIndex += this.circleVectorBuilder.build(
                        vectors, vectorIndex,
                        connectingPath,
                        initialTurnEndVec, finalTurnStartVec,
                        FlightPathVectorFlags.Fallback,
                        interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
                      );
                    }

                    if (Vec3Math.unitAngle(finalTurnStartVec, interceptVec) > GeoMath.ANGULAR_TOLERANCE) {
                      vectorIndex += this.circleVectorBuilder.build(
                        vectors, vectorIndex,
                        finalTurnCircle,
                        finalTurnStartVec, interceptVec,
                        FlightPathVectorFlags.TurnToCourse | FlightPathVectorFlags.Fallback,
                        interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
                      );
                    }

                    needHandleDefaultCase = false;
                    needBuildInterceptVectors = false;
                  }
                } else if (signedTurnCenterDelta < -GeoMath.ANGULAR_TOLERANCE) {
                  // The initial turn is "past" the final turn (i.e. to go from initial turn -> final turn ->
                  // intercept, we would have to make a series of loops that together span greater than 360 degrees of
                  // arc). However, this case can also be handled by the DEFAULT CASE, so we will just fall through to
                  // that.
                } else {
                  // The initial and final turns are coincident. This means that we can intercept the path to intercept
                  // by staying on the initial turn.

                  const interceptVec = pathToInterceptInfo.circle.offsetDistanceAlong(
                    initialTurnCenterProjected,
                    interceptOffset,
                    this.__vec3Cache[7],
                    Math.PI
                  );

                  if (
                    effectivePathToInterceptAngularWidth === MathUtils.TWO_PI
                    || FlightPathUtils.isPointAlongArc(
                      pathToInterceptInfo.circle,
                      effectivePathToInterceptStartVec!,
                      effectivePathToInterceptAngularWidth,
                      interceptVec,
                      true
                    )
                  ) {
                    // The intercept point is within the bounds of the path to intercept. We will build the initial
                    // turn and end it at the intercept point.

                    vectorIndex += this.circleVectorBuilder.build(
                      vectors, vectorIndex,
                      initialTurnCircle,
                      initialVec, interceptVec,
                      FlightPathVectorFlags.TurnToCourse | FlightPathVectorFlags.Fallback,
                      interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
                    );

                    needHandleDefaultCase = false;
                    needBuildInterceptVectors = false;
                  } else {
                    // The intercept point is not within the bounds of the path to intercept. We will fall through to
                    // the DEFAULT CASE in order to let it calculate a fallback path.
                  }
                }
              }
            }
          }
        } else {
          initialPath = interceptPath;
        }

        if (needHandleOvershootCase) {
          // ---- SPECIAL CASE A.3 ----
          // Both the intercept course and the initial course are directed away from the path to intercept (assuming)
          // both start at the beginning of the leg) and the initial turn toward the intercept course either doesn't
          // exist or does not turn toward the path to intercept. In this case the beginning of the leg has effectively
          // "overshot" the path to intercept. Therefore, we will construct a fallback path that turns back toward the
          // path to intercept on a 45-degree intercept path.

          // First we need to figure out in which direction to intercept the path to intercept. There are two such
          // directions that produce a 45-degree intercept angle. We will choose the direction that is the closest to
          // the direction we would have intercepted the path to intercept along the desired intercept course had we
          // not "overshot" it.

          const interceptAngle = Vec3Math.dot(interceptPath.center, pathToInterceptInfo.circle.center) >= 0 ? 45 : 135;

          const flags = FlightPathVectorFlags.Fallback;
          const turnFlags = FlightPathVectorFlags.TurnToCourse | FlightPathVectorFlags.Fallback;

          const vectorCount = this.interceptGreatCircleToPointVectorBuilder.build(
            vectors, vectorIndex,
            fallbackCalcStartVec, initialPath,
            state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
            interceptAngle,
            undefined, pathToInterceptInfo.circle,
            undefined,
            turnFlags, flags, turnFlags,
            interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
          );

          if (vectorCount > 0) {
            vectorIndex += vectorCount;

            if (effectivePathToInterceptAngularWidth !== MathUtils.TWO_PI) {
              // If the path to intercept has a defined start and end, then check if the calculated intercept lies in
              // bounds. If not, then revert to a direct-to path from the beginning of the leg to the path to intercept
              // endpoint (start or end) that is closer to the calculated intercept.

              const lastVector = vectors[vectorIndex - 1];
              const interceptVec = GeoPoint.sphericalToCartesian(lastVector.endLat, lastVector.endLon, this.__vec3Cache[4]);
              const interceptAlongArcNormalizedDistance = FlightPathUtils.getAlongArcNormalizedDistance(
                pathToInterceptInfo.circle,
                effectivePathToInterceptStartVec!, effectivePathToInterceptEndVec!,
                interceptVec
              );

              let directToTarget: ReadonlyFloat64Array | undefined;
              if (interceptAlongArcNormalizedDistance < 0) {
                // The intercept point lies out of bounds, but closer to the start of the path to intercept than the end.
                directToTarget = effectivePathToInterceptStartVec;
              } else if (interceptAlongArcNormalizedDistance > 1) {
                // The intercept point lies out of bounds, but closer to the end of the path to intercept than the start.
                directToTarget = effectivePathToInterceptEndVec;
              }

              if (directToTarget) {
                vectorIndex -= vectorCount;
                vectorIndex += this.directToPointVectorBuilder.build(
                  vectors, vectorIndex,
                  fallbackCalcStartVec, initialPath,
                  directToTarget,
                  state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
                  FlightPathVectorFlags.Fallback, true, true,
                  interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
                );
              }
            }

            needHandleDefaultCase = false;
            needBuildInterceptVectors = false;
          }
        }
      }
    }

    // ---- DEFAULT CASE ----
    if (needHandleDefaultCase) {
      if (forceFallback) {
        // If a fallback path is being forced, then skip any initial turn and calculate the fallback intercept point
        // with the intercept path starting from the beginning of the leg.

        const interceptPath = this.__geoCircleCache[1].setAsGreatCircle(interceptPathStartVec, interceptCourseInfo.course);
        this.calculateFallbackInterceptInfo(
          initialVec, interceptPath,
          pathToInterceptInfo.circle,
          effectivePathToInterceptStartVec, effectivePathToInterceptEndVec, effectivePathToInterceptAngularWidth,
          true,
          fallbackInterceptInfo
        );
      } else {
        // If a fallback path is not being forced, then calculate an initial turn to the intercept course if necessary.

        let initialTurnVector: FlightPathVector | undefined;

        const includeInitialTurn = !startAtPlanePos && MathUtils.angularDistanceDeg(initialCourse, interceptCourseInfo.course, 0) > 1;
        if (includeInitialTurn) {
          const turnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg)
            ?? FlightPathUtils.getShortestTurnDirection(initialCourse, interceptCourseInfo.course) ?? 'right';

          vectorIndex += this.circleVectorBuilder.buildTurnToCourse(
            vectors, vectorIndex,
            state.currentPosition,
            state.desiredTurnRadius.asUnit(UnitType.METER), turnDirection,
            initialCourse, interceptCourseInfo.course,
            FlightPathVectorFlags.TurnToCourse,
            interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
          );

          if (vectorIndex > 0) {
            initialTurnVector = vectors[vectorIndex - 1];
            interceptPathStartVec = GeoPoint.sphericalToCartesian(initialTurnVector.endLat, initialTurnVector.endLon, this.__vec3Cache[4]);
          }
        }

        const interceptPath = this.__geoCircleCache[1].setAsGreatCircle(interceptPathStartVec, interceptCourseInfo.course);
        startPath = interceptPath;

        // Check if a fallback path is necessary when starting the intercept path from the end of the initial turn if
        // one exists or from the beginning of the leg if an initial turn was not calculated.

        this.calculateFallbackInterceptInfo(
          interceptPathStartVec, interceptPath,
          pathToInterceptInfo.circle,
          effectivePathToInterceptStartVec, effectivePathToInterceptEndVec, effectivePathToInterceptAngularWidth,
          false,
          fallbackInterceptInfo
        );

        if (initialTurnVector && fallbackInterceptInfo.isStartPastPathToIntercept) {
          // An initial turn exists and ends past the path to intercept. We need to check if the initial turn
          // intersects the path to intercept. If it does, then we can end the turn early at the intersection point and
          // thus avoid having to build a fallback path.

          const turnCircle = FlightPathUtils.setGeoCircleFromVector(initialTurnVector, this.__geoCircleCache[2]);

          const intersections = this.__intersectionCache[0];
          const intersectionCount = turnCircle.intersection(pathToInterceptInfo.circle, intersections);

          const startIndex = intersectionCount < 2
            || (pathToInterceptInfo.circle.radius > MathUtils.HALF_PI) === pathToInterceptInfo.circle.encircles(initialVec)
            ? 0 : 1;

          for (let i = 0; i < intersectionCount; i++) {
            const intersection = intersections[(startIndex + i) % 2];
            if (
              // Check whether the intersection is within the bounds of the turn vector...
              FlightPathUtils.isPointAlongArc(turnCircle, initialVec, interceptPathStartVec, intersection, true)
              // ... and whether the intersection is within the bounds of the path to intercept.
              && (
                !effectivePathToInterceptStartVec
                || FlightPathUtils.isPointAlongArc(
                  pathToInterceptInfo.circle,
                  effectivePathToInterceptStartVec,
                  effectivePathToInterceptAngularWidth,
                  intersection,
                  true
                )
              )
            ) {
              // End the turn early at the intersection (where the turn intersects the path to intercept).

              const distance = turnCircle.distanceAlong(initialVec, intersection, Math.PI, GeoMath.ANGULAR_TOLERANCE);
              if (distance > GeoMath.ANGULAR_TOLERANCE) {
                // The intersection is not coincident with the start of the turn. We will modify the turn vector to end
                // at the intersection.

                state.currentPosition.setFromCartesian(intersection);

                initialTurnVector.distance = UnitType.GA_RADIAN.convertTo(distance, UnitType.METER);
                initialTurnVector.endLat = state.currentPosition.lat;
                initialTurnVector.endLon = state.currentPosition.lon;

                state.currentCourse = FlightPathUtils.getVectorFinalCourse(initialTurnVector);
              } else {
                // The intersection is coincident with the start of the turn. In this case we will just discard the
                // entire turn vector. This also means the leg will end up with no calculated vectors.
                --vectorIndex;
              }

              vectors.length = vectorIndex;

              state.isDiscontinuity = false;
              state.isFallback = false;

              return;
            }
          }

          // The initial turn does not intersect the path to intercept -> calculate a fallback intercept without an
          // initial turn (i.e. change the intercept path to start at the start of the leg instead of the end of the
          // initial turn).

          vectorIndex = 0;

          interceptPathStartVec = initialVec;
          interceptPath.setAsGreatCircle(initialPos, interceptCourseInfo.course);
          startPath = this.__geoCircleCache[0];

          this.calculateFallbackInterceptInfo(
            interceptPathStartVec, interceptPath,
            pathToInterceptInfo.circle,
            effectivePathToInterceptStartVec, effectivePathToInterceptEndVec, effectivePathToInterceptAngularWidth,
            true,
            fallbackInterceptInfo
          );
        }
      }
    }

    if (needBuildInterceptVectors) {
      if (Vec3Math.isFinite(fallbackInterceptInfo.fallbackInterceptPoint)) {
        vectorIndex += this.directToPointVectorBuilder.build(
          vectors, vectorIndex,
          interceptPathStartVec, startPath,
          fallbackInterceptInfo.fallbackInterceptPoint,
          state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
          FlightPathVectorFlags.Fallback, true, true,
          interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
        );
      } else {
        vectorIndex += this.circleInterceptVectorBuilder.build(
          vectors, vectorIndex,
          interceptPathStartVec,
          interceptCourseInfo.course,
          pathToInterceptInfo.circle,
          useFallbackVectors ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.ConstantHeading,
          interceptCourseInfo.heading, interceptCourseInfo.isHeadingTrue
        );
      }
    }

    vectors.length = vectorIndex;

    if (vectorIndex > 0) {
      const lastVector = vectors[vectorIndex - 1];
      state.currentPosition.set(lastVector.endLat, lastVector.endLon);
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
    }

    state.isDiscontinuity = false;
    state.isFallback = false;
  }

  /**
   * Gets information describing the course to use to intercept the path to intercept for a flight plan leg to
   * calculate.
   * @param legs An array of legs containing the flight plan leg to calculate.
   * @param calculateIndex The index of the flight plan leg to calculate.
   * @param activeLegIndex The index of the active flight plan leg.
   * @param state The current flight path state.
   * @param out The object to which to write the result.
   * @returns Information describing the course to use to intercept the path to intercept for the specified flight plan
   * leg to calculate, or `undefined` if an intercept course could not be defined.
   */
  protected getInterceptCourseInfo(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    out: CircleInterceptLegInterceptCourseInfo
  ): CircleInterceptLegInterceptCourseInfo | undefined {
    const leg = legs[calculateIndex];

    let course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);

    if (this.isHeadingLeg) {
      const heading = course;
      if (state.planeWindSpeed.number > 0) {
        course = NavMath.headingToGroundTrack(
          heading,
          state.planeTrueAirspeed.asUnit(UnitType.KNOT),
          state.planeWindDirection,
          state.planeWindSpeed.asUnit(UnitType.KNOT)
        );
        if (isNaN(course)) {
          course = heading;
        }
      }

      out.heading = leg.leg.course;
      out.isHeadingTrue = leg.leg.trueDegrees;
    } else {
      out.heading = null;
      out.isHeadingTrue = false;
    }

    out.course = course;

    return out;
  }

  /**
   * Gets information describing the path to intercept for a flight plan leg to calculate.
   * @param legs An array of legs containing the flight plan leg to calculate.
   * @param calculateIndex The index of the flight plan leg to calculate.
   * @param activeLegIndex The index of the active flight plan leg.
   * @param state The current flight path state.
   * @param out The object to which to write the result.
   * @returns Information describing the path to intercept for the specified flight plan leg to calculate, or
   * `undefined` if a path to intercept could not be defined.
   */
  protected abstract getPathToInterceptInfo(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    out: CircleInterceptLegPathToInterceptInfo
  ): CircleInterceptLegPathToInterceptInfo | undefined;

  private readonly desiredIntersectionInfoCache = {
    intersection: ArrayUtils.create(1, () => [Vec3Math.create(), Vec3Math.create()]),
  };

  /**
   * Calculates information describing the desired intersection between a defined intercept path and a path to
   * intercept.
   * @param start The starting point of the intercept path.
   * @param interceptPath A GeoCircle that defines the intercept path. Must be a great circle.
   * @param pathToInterceptCircle A geo circle that defines the path to intercept.
   * @param pathToInterceptStart The start of the path to intercept along its defining GeoCircle, or `undefined` if the
   * path to intercept encompasses the entire circle.
   * @param pathToInterceptEnd The end of the path to intercept along its defining GeoCircle, or `undefined1 if the
   * path to intercept encompasses the entire circle.
   * @param pathToInterceptAngularWidth The angular width of the path to intercept along its defining GeoCircle, in
   * radians.
   * @param out The object to which to write the results.
   * @returns Information describing the desired intersection between a defined intercept path and a path to intercept.
   */
  protected calculateDesiredIntersectionInfo(
    start: ReadonlyFloat64Array,
    interceptPath: GeoCircle,
    pathToInterceptCircle: GeoCircle,
    pathToInterceptStart: ReadonlyFloat64Array | undefined,
    pathToInterceptEnd: ReadonlyFloat64Array | undefined,
    pathToInterceptAngularWidth: number,
    out: CircleInterceptLegDesiredIntersectionInfo
  ): CircleInterceptLegDesiredIntersectionInfo {
    // Determine if the starting point is past the path to intercept as measured along the intercept path.

    out.isStartPastPathToIntercept = false;
    Vec3Math.set(NaN, NaN, NaN, out.desiredIntersection);

    const intersections = this.desiredIntersectionInfoCache.intersection[0];
    const intersectionCount = interceptPath.intersection(pathToInterceptCircle, intersections);

    if (intersectionCount === 2) {
      // Define the next intersection as the intersection that is encountered first when travelling along the intercept
      // path from the starting point, and the previous intersection as the intersection that is encountered second. In
      // this way, the next intersection is "ahead" of the starting point and the previous intersection is "behind" the
      // starting point along the intercept path.

      const nextIntersectionIndex = pathToInterceptCircle.encircles(start) ? 0 : 1;
      const nextIntersection = intersections[nextIntersectionIndex];
      const prevIntersection = intersections[(nextIntersectionIndex + 1) % 2];

      // Define the desired intercept point as the one that requires the shortest distance to be travelled in order to
      // move from the starting point to the intercept point along the intercept path and path to intercept.

      if (pathToInterceptAngularWidth === MathUtils.TWO_PI && pathToInterceptCircle.isGreatCircle()) {
        out.isStartPastPathToIntercept = interceptPath.angleAlong(start, nextIntersection, Math.PI, GeoMath.ANGULAR_TOLERANCE) > MathUtils.HALF_PI + GeoMath.ANGULAR_TOLERANCE;
      } else {
        const prevIntersectionInitialPathOffset = interceptPath.angleAlong(prevIntersection, start, Math.PI);
        const nextIntersectionInitialPathOffset = interceptPath.angleAlong(start, nextIntersection, Math.PI);
        const prevIntersectionInitialPathDistance = Math.min(prevIntersectionInitialPathOffset, MathUtils.TWO_PI - prevIntersectionInitialPathOffset);
        const nextIntersectionInitialPathDistance = Math.min(nextIntersectionInitialPathOffset, MathUtils.TWO_PI - nextIntersectionInitialPathOffset);

        let prevIntersectionInterceptPathDistance = 0;
        let nextIntersectionInterceptPathDistance = 0;
        if (pathToInterceptStart && pathToInterceptEnd) {
          if (!FlightPathUtils.isPointAlongArc(pathToInterceptCircle, pathToInterceptStart, pathToInterceptAngularWidth, prevIntersection)) {
            const prevIntersectionInterceptPathStartOffset = pathToInterceptCircle.angleAlong(prevIntersection, pathToInterceptStart, Math.PI, GeoMath.ANGULAR_TOLERANCE);
            const prevIntersectionInterceptPathEndOffset = pathToInterceptCircle.angleAlong(prevIntersection, pathToInterceptEnd, Math.PI, GeoMath.ANGULAR_TOLERANCE);

            prevIntersectionInterceptPathDistance = Math.min(
              prevIntersectionInterceptPathStartOffset, MathUtils.TWO_PI - prevIntersectionInterceptPathStartOffset,
              prevIntersectionInterceptPathEndOffset, MathUtils.TWO_PI - prevIntersectionInterceptPathEndOffset,
            );
          }
          if (!FlightPathUtils.isPointAlongArc(pathToInterceptCircle, pathToInterceptStart, pathToInterceptAngularWidth, nextIntersection)) {
            const nextIntersectionInterceptPathStartOffset = pathToInterceptCircle.angleAlong(nextIntersection, pathToInterceptStart, Math.PI, GeoMath.ANGULAR_TOLERANCE);
            const nextIntersectionInterceptPathEndOffset = pathToInterceptCircle.angleAlong(nextIntersection, pathToInterceptEnd, Math.PI, GeoMath.ANGULAR_TOLERANCE);

            nextIntersectionInterceptPathDistance = Math.min(
              nextIntersectionInterceptPathStartOffset, MathUtils.TWO_PI - nextIntersectionInterceptPathStartOffset,
              nextIntersectionInterceptPathEndOffset, MathUtils.TWO_PI - nextIntersectionInterceptPathEndOffset,
            );
          }
        }

        const prevIntersectionTotalDistance = prevIntersectionInitialPathDistance + prevIntersectionInterceptPathDistance;
        const nextIntersectionTotalDistance = nextIntersectionInitialPathDistance + nextIntersectionInterceptPathDistance;

        // Only consider the starting position past the path to intercept if the path to intercept has a defined
        // start and end (i.e. is not a DME circle) OR the distance to one of the two intercept points is greater
        // than pi / 2 great-arc radians.
        if (
          (pathToInterceptStart && pathToInterceptEnd)
          || prevIntersectionTotalDistance > MathUtils.HALF_PI + GeoMath.ANGULAR_TOLERANCE
          || nextIntersectionTotalDistance > MathUtils.HALF_PI + GeoMath.ANGULAR_TOLERANCE
        ) {
          out.isStartPastPathToIntercept = prevIntersectionTotalDistance < nextIntersectionTotalDistance - GeoMath.ANGULAR_TOLERANCE;
        }
      }

      Vec3Math.copy(out.isStartPastPathToIntercept ? prevIntersection : nextIntersection, out.desiredIntersection);
    } else if (intersectionCount === 1) {
      const distanceToIntersection = interceptPath.angleAlong(start, intersections[0], Math.PI, GeoMath.ANGULAR_TOLERANCE);
      out.isStartPastPathToIntercept = distanceToIntersection < MathUtils.TWO_PI - GeoMath.ANGULAR_TOLERANCE
        && distanceToIntersection > Math.PI + GeoMath.ANGULAR_TOLERANCE;
      Vec3Math.copy(intersections[0], out.desiredIntersection);
    }

    return out;
  }

  private readonly fallbackInterceptCache = {
    vec3: ArrayUtils.create(1, () => Vec3Math.create())
  };

  private readonly fallbackDesiredIntersectionInfo: CircleInterceptLegDesiredIntersectionInfo = {
    isStartPastPathToIntercept: false,
    desiredIntersection: Vec3Math.create(NaN, NaN, NaN)
  };

  /**
   * Calculates information describing a potential fallback path that intercepts a path to intercept from a defined
   * starting point.
   * @param start The starting point of the intercept path.
   * @param interceptPath A GeoCircle that defines the intercept path. Must be a great circle.
   * @param pathToInterceptCircle A geo circle that defines the path to intercept.
   * @param pathToInterceptStart The start of the path to intercept along its defining GeoCircle, or `undefined` if the
   * path to intercept encompasses the entire circle.
   * @param pathToInterceptEnd The end of the path to intercept along its defining GeoCircle, or `undefined1 if the
   * path to intercept encompasses the entire circle.
   * @param pathToInterceptAngularWidth The angular width of the path to intercept along its defining GeoCircle, in
   * radians.
   * @param forceFallback Whether to force a fallback intercept point to be calculated even under conditions where it
   * is not otherwise required.
   * @param out The object to which to write the results.
   * @returns Information describing a potential fallback path that intercepts the specified path to intercept from the
   * defined starting point.
   */
  protected calculateFallbackInterceptInfo(
    start: ReadonlyFloat64Array,
    interceptPath: GeoCircle,
    pathToInterceptCircle: GeoCircle,
    pathToInterceptStart: ReadonlyFloat64Array | undefined,
    pathToInterceptEnd: ReadonlyFloat64Array | undefined,
    pathToInterceptAngularWidth: number,
    forceFallback: boolean,
    out: CircleInterceptLegFallbackInterceptInfo
  ): CircleInterceptLegFallbackInterceptInfo {
    // Check whether the starting point lies on the path to intercept. If so, there is no need for a fallback path
    // unless one is forced, in which case the point that the fallback intercept point is just the starting point.
    if (pathToInterceptCircle.includes(start)) {
      if (
        pathToInterceptAngularWidth === MathUtils.TWO_PI
        || FlightPathUtils.isPointAlongArc(pathToInterceptCircle, pathToInterceptStart!, pathToInterceptAngularWidth, start, true)
      ) {
        out.isStartPastPathToIntercept = false;
        if (forceFallback) {
          Vec3Math.copy(start, out.fallbackInterceptPoint);
        } else {
          Vec3Math.set(NaN, NaN, NaN, out.fallbackInterceptPoint);
        }
        return out;
      }
    }

    // Determine if the starting point is past the path to intercept as measured along the intercept path.

    const desiredIntersectionInfo = this.calculateDesiredIntersectionInfo(
      start, interceptPath,
      pathToInterceptCircle,
      pathToInterceptStart, pathToInterceptEnd, pathToInterceptAngularWidth,
      this.fallbackDesiredIntersectionInfo
    );

    let desiredInterceptPoint: ReadonlyFloat64Array;

    if (!Vec3Math.isFinite(desiredIntersectionInfo.desiredIntersection)) {
      // If the intercept path does not intersect the path to intercept at all, then define the desired intercept
      // point as the point on the path to intercept that is closest to the start point.
      desiredInterceptPoint = pathToInterceptCircle.closest(start, this.fallbackInterceptCache.vec3[0]);
    } else {
      // If the starting point is past the path to intercept and the latter is a great circle, then set the desired
      // intercept point to the point on the path to intercept that is closest to the start point. This prevents us
      // from choosing a desired intercept point that is unnecessarily far from the start point if the intercept
      // path intersects the path to intercept at a shallow angle.
      //
      // In all other cases, set the desired intercept point to one of the intersections between the intercept path
      // and the path to intercept.

      if (desiredIntersectionInfo.isStartPastPathToIntercept && pathToInterceptCircle.isGreatCircle()) {
        desiredInterceptPoint = pathToInterceptCircle.closest(start, this.fallbackInterceptCache.vec3[0]);
      } else {
        desiredInterceptPoint = desiredIntersectionInfo.desiredIntersection;
      }
    }

    out.isStartPastPathToIntercept = desiredIntersectionInfo.isStartPastPathToIntercept;

    if (
      (pathToInterceptStart === undefined || pathToInterceptEnd === undefined)
      || FlightPathUtils.isPointAlongArc(pathToInterceptCircle, pathToInterceptStart, pathToInterceptAngularWidth, desiredInterceptPoint, true)
    ) {
      // The desired intercept point is within the bounds of the path to intercept. Only handle the fallback if the
      // starting point is past the path to intercept or the intercept path does not intersect the path to intercept
      // or fallback is forced.
      if (
        forceFallback
        || desiredIntersectionInfo.isStartPastPathToIntercept
        || !Vec3Math.isFinite(desiredIntersectionInfo.desiredIntersection)
      ) {
        Vec3Math.copy(desiredInterceptPoint, out.fallbackInterceptPoint);
      } else {
        Vec3Math.set(NaN, NaN, NaN, out.fallbackInterceptPoint);
      }
    } else {
      // The desired intercept point is not within the bounds of the path to intercept. Set the fallback intercept
      // point to the start or end of the path to intercept, whichever is closer to the desired intercept point.

      const angularOffset = pathToInterceptCircle.angleAlong(pathToInterceptStart, desiredInterceptPoint, Math.PI);
      const distanceFromStart = Math.min(angularOffset, MathUtils.TWO_PI - angularOffset);
      const distanceFromEnd = MathUtils.angularDistance(pathToInterceptAngularWidth, angularOffset, 0);

      Vec3Math.copy(distanceFromStart <= distanceFromEnd ? pathToInterceptStart : pathToInterceptEnd, out.fallbackInterceptPoint);
    }

    return out;
  }
}
