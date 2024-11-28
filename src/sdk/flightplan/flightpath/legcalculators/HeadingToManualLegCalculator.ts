import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { NavMath } from '../../../geo/NavMath';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { Facility } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for heading to manual termination legs.
 */
export class HeadingToManualLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(1, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Creates a new instance of HeadingToManualLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache, false);
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
    const vectors = legs[calculateIndex].calculated!.flightPath;

    const heading = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const isHeadingTrue = leg.leg.trueDegrees;
    const distance = UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN);

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
      state.isDiscontinuity = true;
      state.isFallback = false;
      return;
    }

    if (!state.currentPosition.isValid() || state.isDiscontinuity) {
      vectors.length = 0;

      // There is a discontinuity at the end of VM legs.
      state.isDiscontinuity = true;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    if (!startAtPlanePos) {
      // If we are not starting the path at the plane position, then calculate an initial turn toward the desired
      // course.

      if (state.currentCourse !== undefined && MathUtils.angularDistanceDeg(state.currentCourse, course, 0) > 5) {
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
        }
      }
    }

    vectorIndex += this.circleVectorBuilder.buildGreatCircle(
      vectors, vectorIndex,
      state.currentPosition, course,
      distance,
      FlightPathVectorFlags.ConstantHeading,
      heading, isHeadingTrue
    );

    vectors.length = vectorIndex;

    // NOTE: there is guaranteed to be at least one vector that was built.
    const lastVector = vectors[vectorIndex - 1];
    state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

    // There is a discontinuity at the end of VM legs.
    state.isDiscontinuity = true;
    state.isFallback = false;
  }
}
