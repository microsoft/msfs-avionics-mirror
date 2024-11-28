import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
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
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { InterceptGreatCircleToPointVectorBuilder } from '../vectorbuilders/InterceptGreatCircleToPointVectorBuilder';
import { ProcedureTurnVectorBuilder } from '../vectorbuilders/ProcedureTurnVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for legs that terminate at a target altitude.
 */
export abstract class AltitudeLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly __vec3Cache = ArrayUtils.create(2, () => Vec3Math.create());
  private readonly __geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));
  private readonly __geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  protected readonly circleVectorBuilder = new CircleVectorBuilder();
  protected readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  protected readonly interceptGreatCircleToPointVectorBuilder = new InterceptGreatCircleToPointVectorBuilder();

  /**
   * Creates a new instance of AltitudeLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache, false);
  }

  /**
   * Builds a flight path vector representing the path the airplane must fly to climb to the target altitude of a
   * flight plan leg.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param leg The flight plan leg for which the vector is to be built.
   * @param isActiveLeg Whether the vector is to be built for the active flight plan leg.
   * @param state The current flight path state.
   * @param path A GeoCircle that defines the path of the vector to build.
   * @param start The start point of the vector to build.
   * @param flags The flags to set on the vector.
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  protected buildDistanceToAltitudeVector(
    vectors: FlightPathVector[],
    index: number,
    leg: LegDefinition,
    isActiveLeg: boolean,
    state: FlightPathState,
    path: GeoCircle,
    start: ReadonlyFloat64Array,
    flags: number,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    const deltaAltitude = Math.max(UnitType.METER.convertTo(leg.leg.altitude1, UnitType.FOOT) - state.planeAltitude.asUnit(UnitType.FOOT), 0);
    const distanceToClimb = UnitType.NMILE.convertTo(
      deltaAltitude / state.planeClimbRate.asUnit(UnitType.FPM) / 60 * state.planeSpeed.asUnit(UnitType.KNOT),
      UnitType.GA_RADIAN
    );

    const climbStartVec = isActiveLeg && state.planePosition.isValid() ? path.closest(state.planePosition, this.__vec3Cache[0]) : start;
    const originToClimbStartDistance = MathUtils.normalizeAngle(path.distanceAlong(start, climbStartVec, Math.PI, GeoMath.ANGULAR_TOLERANCE), -Math.PI);

    // TODO: make minimum distance configurable
    const minDistance = isActiveLeg
      ? UnitType.FOOT.convertTo(100, UnitType.GA_RADIAN)
      : UnitType.NMILE.convertTo(0.1, UnitType.GA_RADIAN);
    const offsetDistance = Math.max(originToClimbStartDistance + distanceToClimb, minDistance);
    const endVec = path.offsetDistanceAlong(start, offsetDistance, this.__vec3Cache[0], Math.PI);

    return this.circleVectorBuilder.build(
      vectors, index,
      path,
      start, endVec,
      flags,
      heading, isHeadingTrue
    );
  }

  /**
   * Builds a sequence of flight path vectors representing a path that intercepts a desired great-circle path. The
   * intercept path begins at the flight path state's current position and course. If an intercept path can be
   * calculated, then it is guaranteed to end at or past a specified origin point along the path to intercept. If an
   * intercept path cannot be calculated, then vectors will be built that represent a constant-radius turn toward the
   * path to intercept's initial course.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param isActiveLeg Whether the vectors are to be built for the active flight plan leg.
   * @param state The current flight path state. If an intercept is successfully calculated, then the state's fallback
   * flag will be set to false. If an intercept could not be calculated, then the fallback flag will not be changed.
   * @param pathToInterceptCourse The initial true course of the path to intercept, in degrees.
   * @param path A GeoCircle that defines the path to intercept. If an intercept cannot be calculated, then the circle
   * will be changed to the great-circle that defines the course along which the last calculated fallback vector ends.
   * @param origin The origin point of the path to intercept. The point will be changed, if necessary, to the point at
   * which the built vectors actually intercept the path if the vectors intercept the path past the original origin
   * point (as measured along the path to intercept).
   * @returns The number of vectors that were built and added to the array.
   */
  protected buildFallbackVectorsToInterceptPath(
    vectors: FlightPathVector[],
    index: number,
    isActiveLeg: boolean,
    state: FlightPathState,
    pathToInterceptCourse: number,
    path: GeoCircle,
    origin: Float64Array
  ): number {
    let vectorIndex = index;

    const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None)
      | (state.isFallback && state.currentCourse !== undefined ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None);

    if (isActiveLeg && vectors.length > 0 && BitFlags.isAll(vectors[0].flags, FlightPathVectorFlags.Fallback)) {
      // If this is the active leg and fallback vectors have already been calculated, then preserve the previously
      // calculated vectors except for the last one, which is guaranteed to be a great-circle vector along the final
      // path that is supposed to cover the distance required to climb to the target altitude.

      vectorIndex = vectors.length - 1;

      const prevVector = vectors[vectorIndex - 1];
      state.currentPosition.set(prevVector.endLat, prevVector.endLon);
      state.currentCourse = pathToInterceptCourse;

      if (BitFlags.isAll(vectors[vectorIndex].flags, FlightPathVectorFlags.Fallback)) {
        state.currentPosition.toCartesian(origin);
        path.setAsGreatCircle(state.currentPosition, pathToInterceptCourse);
      }
    } else {
      // If the current course is not defined, then set it to the course from the current position to the leg origin.
      if (state.currentCourse === undefined) {
        state.currentCourse = state.currentPosition.bearingTo(this.__geoPointCache[0].setFromCartesian(origin));

        // If the current position is coincident with or antipodal to the leg origin, then set the current course to
        // the leg course.
        if (isNaN(state.currentCourse)) {
          state.currentCourse = path.bearingAt(origin);
        }
      }

      const initialPath = this.__geoCircleCache[0].setAsGreatCircle(state.currentPosition, state.currentCourse);

      const initialFinalPathAngle = Vec3Math.unitAngle(initialPath.center, path.center);
      if (initialFinalPathAngle >= Math.PI - GeoMath.ANGULAR_TOLERANCE) {
        // If the initial path and the final path are antiparallel, then we will path a procedure turn to do a 180.

        vectorIndex += this.procTurnVectorBuilder.build(
          vectors, vectorIndex,
          state.currentPosition, initialPath,
          origin, path,
          state.currentCourse + 45,
          state.desiredCourseReversalTurnRadius.asUnit(UnitType.METER), undefined,
          state.currentCourse, pathToInterceptCourse,
          flags | FlightPathVectorFlags.CourseReversal, true
        );
      } else if (initialFinalPathAngle > GeoMath.ANGULAR_TOLERANCE) {
        const interceptFlags = flags | FlightPathVectorFlags.InterceptCourse;
        const turnFlags = interceptFlags | FlightPathVectorFlags.TurnToCourse;

        vectorIndex += this.interceptGreatCircleToPointVectorBuilder.build(
          vectors, vectorIndex,
          state.currentPosition, initialPath,
          state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
          45,
          path.offsetAngleAlong(origin, MathUtils.HALF_PI, this.__vec3Cache[0], Math.PI), path,
          state.desiredTurnRadius.asUnit(UnitType.METER),
          turnFlags, interceptFlags, turnFlags
        );
      }

      let isOnFinalPath = false;
      if (initialFinalPathAngle <= GeoMath.ANGULAR_TOLERANCE) {
        // We were already on the final path at the start of the leg.
        isOnFinalPath = true;
      } else if (vectorIndex > 0) {
        const lastVector = vectors[vectorIndex - 1];
        state.currentPosition.set(lastVector.endLat, lastVector.endLon);
        state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

        // To check if we are on the final path, first confirm that the last vector ends on the final path. Then,
        // confirm that the great circle tangent to the last vector where the vector ends is parallel to the final
        // path.
        const lastVectorEndVec = state.currentPosition.toCartesian(this.__vec3Cache[0]);
        if (path.includes(lastVectorEndVec)) {
          const tangentCircleNormal = Vec3Math.normalize(
            Vec3Math.cross(
              Vec3Math.cross(
                lastVectorEndVec,
                Vec3Math.set(lastVector.centerX, lastVector.centerY, lastVector.centerZ, this.__vec3Cache[1]),
                this.__vec3Cache[1]
              ),
              lastVectorEndVec,
              this.__vec3Cache[1]
            ),
            this.__vec3Cache[1]
          );

          // Angular difference <= 1e-6 radians
          isOnFinalPath = Vec3Math.dot(tangentCircleNormal, path.center) >= 0.9999999999995;
        }
      }

      if (isOnFinalPath) {
        // If we are on the final path, then check if we are behind the origin position. If we are, then we need to
        // ensure we travel along the final path to the origin.

        const startVec = state.currentPosition.toCartesian(this.__vec3Cache[0]);
        const distanceToOrigin = path.distanceAlong(startVec, origin, Math.PI, GeoMath.ANGULAR_TOLERANCE);

        if (distanceToOrigin < Math.PI) {
          if (distanceToOrigin > 0) {
            vectorIndex += this.circleVectorBuilder.build(
              vectors, vectorIndex,
              path,
              startVec, origin
            );
          }
        } else {
          Vec3Math.copy(startVec, origin);
        }

        state.isFallback = false;
      } else {
        // If we are not on the final path, then we will just turn toward the prescribed course and fly for the desired
        // distance along that course.

        if (MathUtils.angularDistanceDeg(state.currentCourse, pathToInterceptCourse, 0) > 1) {
          vectorIndex += this.circleVectorBuilder.buildTurnToCourse(
            vectors, vectorIndex,
            state.currentPosition,
            state.desiredTurnRadius.asUnit(UnitType.METER),
            FlightPathUtils.getShortestTurnDirection(state.currentCourse, pathToInterceptCourse) ?? 'right',
            state.currentCourse, pathToInterceptCourse,
            FlightPathVectorFlags.Fallback | FlightPathVectorFlags.TurnToCourse
          );

          if (vectorIndex > 0) {
            const lastVector = vectors[vectorIndex - 1];
            state.currentPosition.set(lastVector.endLat, lastVector.endLon);
          }

          state.currentCourse = pathToInterceptCourse;
        }

        state.currentPosition.toCartesian(origin);
        path.setAsGreatCircle(state.currentPosition, pathToInterceptCourse);
      }
    }

    return vectorIndex - index;
  }
}

/**
 * Calculates flight path vectors for course to altitude legs.
 */
export class CourseToAltitudeLegCalculator extends AltitudeLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(1, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  /**
   * Creates a new instance of CourseToAltitudeLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState
  ): void {
    const leg = legs[calculateIndex];

    let magVar = this.getMagVarFromIcao(leg.leg.originIcao);
    if (magVar === undefined && !state.isDiscontinuity && state.currentPosition.isValid()) {
      magVar = MagVar.get(state.currentPosition);
    }

    leg.calculated!.courseMagVar = magVar ?? 0;
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

    // TODO: not sure if course-to... legs are allowed to have floating origins based on current airplane position.
    // Currently this calculator does not allow floating origins based on airplane position (the leg must begin at and
    // be continuous with the end of the previous leg).

    if (state.isDiscontinuity || !state.currentPosition.isValid()) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    const isActiveLeg = calculateIndex === activeLegIndex;

    let vectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);

    const finalPath = this.geoCircleCache[0];
    const originVec = this.vec3Cache[0];

    let didCalculateFallback = false;

    // If the leg begins in a fallback state, then attempt to get the intended terminator position of the previous leg
    // and build a path to intercept the desired course from the intended terminator position.
    if (state.isFallback && state.currentCourse !== undefined && calculateIndex > 0) {
      const prevLegTerminatorPos = this.getTerminatorPosition(legs[calculateIndex - 1].leg, this.geoPointCache[0]);
      if (prevLegTerminatorPos) {
        finalPath.setAsGreatCircle(prevLegTerminatorPos, course);
        prevLegTerminatorPos.toCartesian(originVec);

        vectorIndex += this.buildFallbackVectorsToInterceptPath(
          vectors, vectorIndex,
          isActiveLeg,
          state,
          course,
          finalPath, originVec
        );

        didCalculateFallback = true;
      }
    }

    if (!didCalculateFallback) {
      // If we didn't calculate a fallback path, then calculate an initial turn toward the desired course. The reason
      // we don't need to do this when a fallback path is calculated is because the fallback path is guaranteed to
      // end on the desired course.

      if (state.currentCourse !== undefined && MathUtils.angularDistanceDeg(state.currentCourse, course, 0) > 1) {
        const turnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg)
          ?? FlightPathUtils.getShortestTurnDirection(state.currentCourse, course) ?? 'right';

        vectorIndex += this.circleVectorBuilder.buildTurnToCourse(
          vectors, vectorIndex,
          state.currentPosition,
          state.desiredTurnRadius.asUnit(UnitType.METER), turnDirection,
          state.currentCourse, course,
          FlightPathVectorFlags.TurnToCourse
        );

        if (vectorIndex > 0) {
          const lastVector = vectors[vectorIndex - 1];
          state.currentPosition.set(lastVector.endLat, lastVector.endLon);
          state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
        }
      }

      finalPath.setAsGreatCircle(state.currentPosition, course);
      state.currentPosition.toCartesian(originVec);
    }

    vectorIndex += this.buildDistanceToAltitudeVector(
      vectors, vectorIndex,
      leg, isActiveLeg,
      state,
      finalPath, originVec,
      state.isFallback ? FlightPathVectorFlags.Fallback : 0
    );

    vectors.length = vectorIndex;

    // NOTE: the vector array cannot be empty because buildDistanceToAltitudeVector() always builds one vector.
    const lastVector = vectors[vectorIndex - 1];
    state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}

/**
 * Calculates flight path vectors for fix to altitude legs.
 */
export class FixToAltitudeLegCalculator extends AltitudeLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(1, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  /**
   * Creates a new instance of FixToAltitudeLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    const leg = legs[calculateIndex];
    const originPos = this.getPositionFromIcao(leg.leg.fixIcao, this.geoPointCache[0]);
    leg.calculated!.courseMagVar = originPos === undefined ? 0 : this.getLegMagVar(leg.leg, originPos);
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

    const originPos = this.getPositionFromIcao(leg.leg.fixIcao, this.geoPointCache[0]);

    if (!originPos) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    const isActiveLeg = calculateIndex === activeLegIndex;

    let vectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);

    const finalPath = this.geoCircleCache[0].setAsGreatCircle(originPos, course);
    const originVec = originPos.toCartesian(this.vec3Cache[0]);

    // If the leg begins in a discontinuity and we are configured to calculate discontinuity vectors or if the leg
    // begins in a fallback state, then build a path to intercept the desired course. Otherwise, start the leg from the
    // defined origin.
    if (
      state.currentPosition.isValid()
      && (!state.isDiscontinuity || options.calculateDiscontinuityVectors)
      && (state.isDiscontinuity || (state.isFallback && state.currentCourse !== undefined))
    ) {
      vectorIndex += this.buildFallbackVectorsToInterceptPath(
        vectors, vectorIndex,
        isActiveLeg,
        state,
        course,
        finalPath, originVec
      );
    } else {
      state.currentPosition.set(originPos);
      state.currentCourse = course;
    }

    vectorIndex += this.buildDistanceToAltitudeVector(
      vectors, vectorIndex,
      leg, isActiveLeg,
      state,
      finalPath, originVec,
      state.isFallback ? FlightPathVectorFlags.Fallback : 0
    );

    vectors.length = vectorIndex;

    // NOTE: the vector array cannot be empty because buildDistanceToAltitudeVector() always builds one vector.
    const lastVector = vectors[vectorIndex - 1];
    state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}

/**
 * Calculates flight path vectors for heading to altitude legs.
 */
export class HeadingToAltitudeLegCalculator extends AltitudeLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(1, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  /**
   * Creates a new instance of HeadingToAltitudeLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState
  ): void {
    const leg = legs[calculateIndex];

    let magVar = this.getMagVarFromIcao(leg.leg.originIcao);
    if (magVar === undefined) {
      let position: LatLonInterface | undefined;
      if (calculateIndex === activeLegIndex && state.planePosition.isValid()) {
        position = state.planePosition;
      } else if (!state.isDiscontinuity && state.currentPosition.isValid()) {
        position = state.currentPosition;
      }

      if (position) {
        magVar = MagVar.get(position);
      }
    }

    leg.calculated!.courseMagVar = magVar ?? 0;
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

    const heading = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const isHeadingTrue = leg.leg.trueDegrees;

    let course = heading;
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

    let startAtPlanePos = false;
    let retainOldVectors = false;

    const isActiveLeg = calculateIndex === activeLegIndex;
    if (isActiveLeg && state.planePosition.isValid()) {
      // If the leg to calculate is the active leg and we know the airplane's current position, then we should start
      // the leg path at the airplane's current position. The exception to this is if vectors have been previously
      // calculated and include an initial turn and the airplane's current position puts it within a certain
      // cross-track distance of the turn and before the end of the turn. In this case, we will retain the previously
      // calculated vectors.

      startAtPlanePos = true;

      if (vectors.length > 0) {
        const firstVector = vectors[0];
        if (!FlightPathUtils.isVectorGreatCircle(firstVector)) {
          const firstVectorCircle = FlightPathUtils.setGeoCircleFromVector(firstVector, this.geoCircleCache[0]);
          const planePosVec = state.planePosition.toCartesian(this.vec3Cache[0]);
          const xtk = Math.abs(firstVectorCircle.distance(planePosVec));

          if (xtk < UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN)) {
            const alongVectorNormDistance = FlightPathUtils.getAlongArcNormalizedDistance(
              firstVectorCircle,
              this.geoPointCache[0].set(firstVector.startLat, firstVector.startLon),
              this.geoPointCache[1].set(firstVector.endLat, firstVector.endLon),
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
        state.currentCourse = course;
      }
    }

    if (retainOldVectors) {
      // We need to ensure the flight path state is updated to reflect the end of the leg. Note that retainOldVectors
      // can only be true if the leg has at least one calculated vector.
      FlightPathUtils.getLegFinalPosition(leg.calculated!, state.currentPosition);
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(vectors[vectors.length - 1]);
      state.isDiscontinuity = false;
      state.isFallback = false;
      return;
    }

    if (!state.currentPosition.isValid() || state.isDiscontinuity) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    if (!startAtPlanePos) {
      // If we are not starting the path at the plane position, then calculate an initial turn toward the desired
      // course.

      if (state.currentCourse !== undefined && MathUtils.angularDistanceDeg(state.currentCourse, course, 0) > 1) {
        const turnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg)
          ?? FlightPathUtils.getShortestTurnDirection(state.currentCourse, course) ?? 'right';

        vectorIndex += this.circleVectorBuilder.buildTurnToCourse(
          vectors, vectorIndex,
          state.currentPosition,
          state.desiredTurnRadius.asUnit(UnitType.METER), turnDirection,
          state.currentCourse, course,
          FlightPathVectorFlags.TurnToCourse,
          heading, isHeadingTrue
        );

        if (vectorIndex > 0) {
          const lastVector = vectors[vectorIndex - 1];
          state.currentPosition.set(lastVector.endLat, lastVector.endLon);
          state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
        }
      }
    }

    const originVec = state.currentPosition.toCartesian(this.vec3Cache[0]);
    const finalPath = this.geoCircleCache[0].setAsGreatCircle(state.currentPosition, course);

    vectorIndex += this.buildDistanceToAltitudeVector(
      vectors, vectorIndex,
      leg, isActiveLeg,
      state,
      finalPath, originVec,
      FlightPathVectorFlags.ConstantHeading,
      heading, isHeadingTrue
    );

    vectors.length = vectorIndex;

    // NOTE: the vector array cannot be empty because buildDistanceToAltitudeVector() always builds one vector.
    const lastVector = vectors[vectorIndex - 1];
    state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}
