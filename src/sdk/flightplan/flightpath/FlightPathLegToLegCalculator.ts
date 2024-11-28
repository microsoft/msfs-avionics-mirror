import { GeoCircle } from '../../geo/GeoCircle';
import { LatLonInterface } from '../../geo/GeoInterfaces';
import { GeoMath } from '../../geo/GeoMath';
import { GeoPoint } from '../../geo/GeoPoint';
import { BitFlags, MathUtils, ReadonlyFloat64Array, UnitType, Vec3Math } from '../../math';
import { LegType } from '../../navigation/Facilities';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';
import { LegCalculations, LegDefinition } from '../FlightPlanning';
import { FlightPathPlaneState } from './FlightPathState';
import { FlightPathUtils } from './FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from './FlightPathVector';
import { ProcedureTurnVectorBuilder } from './vectorbuilders/ProcedureTurnVectorBuilder';

/**
 * A calculator of lateral flight paths for transitions between adjacent flight plan legs.
 */
export class FlightPathLegToLegCalculator {
  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();

  /**
   * Calculates paths for transitions between adjacent flight plan legs.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param startIndex The index of the first leg for which to calculate transitions.
   * @param count The total number of legs for which to calculate transitions.
   * @param state The airplane state to use for calculations.
   */
  public calculate(
    legs: LegDefinition[],
    startIndex: number,
    count: number,
    state: FlightPathPlaneState
  ): void {
    const endIndex = startIndex + count;
    let currentIndex = startIndex;
    while (currentIndex < endIndex) {
      const fromLeg = legs[currentIndex] as LegDefinition | undefined;
      const toLeg = legs[currentIndex + 1] as LegDefinition | undefined;
      const fromLegCalc = fromLeg?.calculated;
      const toLegCalc = toLeg?.calculated;
      if (
        fromLegCalc
        && toLegCalc
        && !fromLegCalc.endsInDiscontinuity
      ) {
        const fromVector = fromLegCalc.flightPath[fromLegCalc.flightPath.length - 1] as FlightPathVector | undefined;
        const toVector = toLegCalc.flightPath[0] as FlightPathVector | undefined;
        if (
          fromVector && toVector
          && !BitFlags.isAny(fromVector.flags, FlightPathVectorFlags.Discontinuity)
          && !BitFlags.isAny(toVector.flags, FlightPathVectorFlags.Discontinuity)
          && FlightPathLegToLegCalculator.canCalculateTransition(fromLegCalc.egress)
          && FlightPathLegToLegCalculator.canCalculateTransition(toLegCalc.ingress)
        ) {
          // There are three types of leg-to-leg junctions we must handle:
          // 1) Junction between two great-circle vectors (tracks).
          // 2) Junction between a great-circle vector (track) and a small-circle vector (turn).
          // 3) Junction between two small-circle vectors (turns).

          const isFromVectorGreatCircle = FlightPathUtils.isVectorGreatCircle(fromVector);
          const isToVectorGreatCircle = FlightPathUtils.isVectorGreatCircle(toVector);

          if (isFromVectorGreatCircle && isToVectorGreatCircle) {
            currentIndex += this.calculateTrackTrackTransition(
              legs, currentIndex, currentIndex + 1, endIndex,
              state,
              fromVector, toVector,
              true
            );
            continue;
          } else if (isFromVectorGreatCircle) {
            currentIndex += this.calculateTrackTurnTransition(
              legs, currentIndex, currentIndex + 1, endIndex,
              state,
              fromVector, toVector, false
            );
            continue;
          } else if (isToVectorGreatCircle) {
            currentIndex += this.calculateTrackTurnTransition(
              legs, currentIndex, currentIndex + 1, endIndex,
              state,
              fromVector, toVector, true
            );
            continue;
          } else {
            // TODO: turn-turn case
          }
        }
      }

      if (fromLegCalc && fromLegCalc.egress.length > 0 && FlightPathLegToLegCalculator.canCalculateTransition(fromLegCalc.egress)) {
        fromLegCalc.egress.length = 0;
        fromLegCalc.egressJoinIndex = -1;
      }
      if (toLegCalc && toLegCalc.ingress.length > 0 && FlightPathLegToLegCalculator.canCalculateTransition(toLegCalc.ingress)) {
        toLegCalc.ingress.length = 0;
        toLegCalc.ingressJoinIndex = -1;
      }

      currentIndex++;
    }
  }

  /**
   * Sets an empty transition between two adjacent flight plan legs. This will erase all egress transition vectors from
   * the FROM leg and all ingress transition vectors from the TO leg.
   * @param fromLegCalc The flight path calculations for the transition's FROM leg.
   * @param toLegCalc The flight path calculations for the transition's TO leg.
   */
  private setEmptyTransition(fromLegCalc: LegCalculations, toLegCalc: LegCalculations): void {
    fromLegCalc.egress.length = 0;
    fromLegCalc.egressJoinIndex = -1;
    toLegCalc.ingress.length = 0;
    toLegCalc.ingressJoinIndex = -1;
  }

  private readonly setAnticipatedTurnCache = {
    geoCircle: ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0))
  };

  /**
   * Sets the transition between two adjacent flight plan legs to an anticipated turn.
   * @param fromLegCalc The flight path calculations for the transition's FROM leg.
   * @param toLegCalc The flight path calculations for the transition's TO leg.
   * @param turnRadius The radius of the turn, in great-arc radians.
   * @param turnDirection The direction of the turn.
   * @param turnCenter The center of the turn.
   * @param turnStart The start point of the turn.
   * @param turnMiddle The midpoint of the turn.
   * @param turnEnd The end point of the turn
   * @param setIngressEgressArrayLengths Whether to remove extra vectors from the ingress and egress vector arrays used
   * for the transition after the anticipated turn vectors have been added.
   */
  private setAnticipatedTurn(
    fromLegCalc: LegCalculations,
    toLegCalc: LegCalculations,
    turnRadius: number,
    turnDirection: VectorTurnDirection,
    turnCenter: ReadonlyFloat64Array | LatLonInterface,
    turnStart: ReadonlyFloat64Array | LatLonInterface,
    turnMiddle: ReadonlyFloat64Array | LatLonInterface,
    turnEnd: ReadonlyFloat64Array | LatLonInterface,
    setIngressEgressArrayLengths: boolean
  ): void {
    const turnCircle = FlightPathUtils.getTurnCircle(
      turnCenter,
      turnRadius, turnDirection,
      this.setAnticipatedTurnCache.geoCircle[0]
    );
    const flags = FlightPathVectorFlags.LegToLegTurn | FlightPathVectorFlags.AnticipatedTurn;

    this.setEgressVector(fromLegCalc, turnCircle, turnStart, turnMiddle, flags, setIngressEgressArrayLengths);
    this.setIngressVector(toLegCalc, turnCircle, turnMiddle, turnEnd, flags, setIngressEgressArrayLengths);
  }

  /**
   * Sets the egress transition of a flight plan leg to a single vector.
   * @param legCalc The flight path calculations for the transition's leg.
   * @param path A GeoCircle that defines the path of the vector.
   * @param start The start point of the vector.
   * @param end The end point of the vector.
   * @param flags The flags to set on the vector.
   * @param setEgressArrayLength Whether to remove extra vectors from the egress vector array after the vector has been
   * added.
   */
  private setEgressVector(
    legCalc: LegCalculations,
    path: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags: number,
    setEgressArrayLength: boolean
  ): void {
    const vector = legCalc.egress[0] ??= FlightPathUtils.createEmptyVector();

    if (setEgressArrayLength) {
      legCalc.egress.length = 1;
    }
    legCalc.egressJoinIndex = legCalc.flightPath.length - 1;

    const joinedVector = legCalc.flightPath[legCalc.egressJoinIndex];

    flags |= joinedVector.flags & FlightPathVectorFlags.Fallback;

    FlightPathUtils.setVectorFromCircle(
      vector,
      path,
      start, end,
      flags,
      joinedVector.heading,
      joinedVector.isHeadingTrue
    );
  }

  /**
   * Sets the ingress transition of a flight plan leg to a single vector.
   * @param legCalc The flight path calculations for the transition's leg.
   * @param path A GeoCircle that defines the path of the vector.
   * @param start The start point of the vector.
   * @param end The end point of the vector.
   * @param flags The flags to set on the vector.
   * @param setIngressArrayLength Whether to remove extra vectors from the ingress vector array after the vector has
   * been added.
   */
  private setIngressVector(
    legCalc: LegCalculations,
    path: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags: number,
    setIngressArrayLength: boolean
  ): void {
    const ingress = legCalc.ingress[0] ??= FlightPathUtils.createEmptyVector();

    if (setIngressArrayLength) {
      legCalc.ingress.length = 1;
    }
    legCalc.ingressJoinIndex = 0;

    const joinedVector = legCalc.flightPath[legCalc.ingressJoinIndex];

    flags |= joinedVector.flags & FlightPathVectorFlags.Fallback;

    FlightPathUtils.setVectorFromCircle(
      ingress,
      path,
      start, end,
      flags,
      joinedVector.heading,
      joinedVector.isHeadingTrue
    );
  }

  private readonly trackTrackCache = {
    vec3: ArrayUtils.create(3, () => Vec3Math.create()),
    geoPoint: ArrayUtils.create(4, () => new GeoPoint(0, 0)),
    geoCircle: ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0))
  };

  /**
   * Calculates a leg-to-leg transition between two great-circle ("track") vectors. In calculating the specified
   * transition, this method may also calculate a sequence of consecutive transitions following the specified
   * transition.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param fromIndex The index of the transition's FROM leg.
   * @param toIndex The index of the transition's TO leg.
   * @param endIndex The index of the flight plan leg at which to stop calculating transitions. The last transition to
   * be calculated will be between the this leg and the previous leg.
   * @param state The airplane state to use for calculations.
   * @param fromVector The last base flight path vector of the transition's FROM leg (the FROM vector).
   * @param toVector The first base flight path vector of the transition's TO leg (the TO vector).
   * @param isRestrictedByPrevTransition Whether the FROM leg's egress transition is restricted by the leg's ingress
   * transition.
   * @param previousTanTheta The tangent of the theta angle of the previous transition's anticipated turn. Theta is
   * defined as the (acute) angle between either the FROM vector or the TO vector's path and the great circle passing
   * through the point where the FROM and TO vectors meet and the center of the anticipated turn. If there is no
   * previous transition, the previous transition is not an anticipated turn, or the previous transition's FROM and
   * TO vectors are not both great-circle paths, then this value should be left undefined.
   * @returns The number of consecutive leg-to-leg transitions calculated by this method.
   */
  private calculateTrackTrackTransition(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    endIndex: number,
    state: FlightPathPlaneState,
    fromVector: FlightPathVector,
    toVector: FlightPathVector,
    isRestrictedByPrevTransition: boolean,
    previousTanTheta?: number,
  ): number {
    const fromLegCalc = legs[fromIndex].calculated!;
    const toLegCalc = legs[toIndex].calculated!;

    if (fromVector.distance <= GeoMath.ANGULAR_TOLERANCE || toVector.distance <= GeoMath.ANGULAR_TOLERANCE) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return 1;
    }

    const fromVectorEnd = this.trackTrackCache.geoPoint[0].set(fromVector.endLat, fromVector.endLon);
    const toVectorStart = this.trackTrackCache.geoPoint[1].set(toVector.startLat, toVector.startLon);

    // If the TO vector doesn't start where the FROM vector ends, then there can be no transition. We use a rather
    // large tolerance here (~60 meters) to accommodate imprecise nav data and floating point errors during base flight
    // path calculation.
    if (!fromVectorEnd.equals(toVectorStart, 1e-5)) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return 1;
    }

    const fromVectorPath = FlightPathUtils.setGeoCircleFromVector(fromVector, this.trackTrackCache.geoCircle[0]);
    const toVectorPath = FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTrackCache.geoCircle[1]);
    const trackAngleDiff = Vec3Math.unitAngle(fromVectorPath.center, toVectorPath.center) * Avionics.Utils.RAD2DEG;

    if (trackAngleDiff < 1) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return 1;
    } else if (trackAngleDiff > 175) {
      return this.computeTrackTrackCourseReversal(
        legs, fromIndex, toIndex, endIndex,
        state,
        fromVector, toVector
      );
    }

    return this.calculateTrackTrackAnticipatedTurn(
      legs, fromIndex, toIndex, endIndex,
      state,
      fromVector, toVector,
      isRestrictedByPrevTransition,
      previousTanTheta
    );
  }

  /**
   * Calculates a leg-to-leg course reversal transition between two great-circle ("track") vectors. In calculating the
   * specified transition, this method may also calculate a sequence of consecutive transitions following the specified
   * transition.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param fromIndex The index of the transition's FROM leg.
   * @param toIndex The index of the transition's TO leg.
   * @param endIndex The index of the flight plan leg at which to stop calculating transitions. The last transition to
   * be calculated will be between the this leg and the previous leg.
   * @param state The airplane state to use for calculations.
   * @param fromVector The last base flight path vector of the transition's FROM leg (the FROM vector).
   * @param toVector The first base flight path vector of the transition's TO leg (the TO vector).
   * @returns The number of consecutive leg-to-leg transitions calculated by this method.
   */
  private computeTrackTrackCourseReversal(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    endIndex: number,
    state: FlightPathPlaneState,
    fromVector: FlightPathVector,
    toVector: FlightPathVector
  ): number {
    let calculatedCount = 1;

    const fromLegCalc = legs[fromIndex].calculated!;
    const toLegCalc = legs[toIndex].calculated!;

    fromLegCalc.egress.length = 0;
    fromLegCalc.egressJoinIndex = -1;

    let toVectorStartVec: Float64Array | undefined;
    let toVectorPath: GeoCircle | undefined;

    // Allow the course reversal to "cut" into the TO vector. In other words, the course reversal is allowed to
    // intercept the TO leg in the middle of the leg.

    let courseReversalEndDistance = UnitType.METER.convertTo(toVector.distance, UnitType.GA_RADIAN);

    // If the TO leg only has one base flight path vector, then we need to make sure the course reversal doesn't cut
    // into the leg past the point where the egress joins the vector.
    if (toLegCalc.flightPath.length === 1) {
      let needCheckEgressJoin = true;

      // We need to check if the TO leg's egress transition is going to be recalculated with the current round of
      // calculations. Depending on if and how the transition is going to be recalculated, we may need not need to
      // check the egress vectors or we may need to pre-compute the egress transition.

      if (toIndex < endIndex) {
        const nextLegCalc = legs[toIndex + 1]?.calculated;
        if (nextLegCalc) {
          if (
            FlightPathLegToLegCalculator.canCalculateTransition(toLegCalc.egress)
            && FlightPathLegToLegCalculator.canCalculateTransition(nextLegCalc.ingress)
          ) {
            if (nextLegCalc.flightPath.length > 0) {
              const nextVector = nextLegCalc.flightPath[0];
              if (FlightPathUtils.isVectorGreatCircle(nextVector)) {
                // If the TO vector of the next leg-to-leg transition is a great circle, then we are
                // allowed to pre-compute the next transition.

                calculatedCount += this.calculateTrackTrackTransition(
                  legs, toIndex, toIndex + 1, endIndex,
                  state,
                  toVector, nextVector,
                  false
                );

                // We still need to check the egress here since we don't know where the egress joins until after it is
                // calculated.
              } else {
                // If the TO vector of the next leg-to-leg transition to share a vector with the current leg-toleg
                // transition is not a great circle, then we know that the distance from the start of the vector to
                // where the egress joins is guaranteed to be at least half the distance of the vector.

                courseReversalEndDistance = UnitType.METER.convertTo(toVector.distance / 2, UnitType.GA_RADIAN);
                needCheckEgressJoin = false;
              }
            } else {
              // If the next leg after the TO leg has no base flight path vectors, then the recalculation will erase
              // any egress vectors on the TO leg, so there is no need to check the egress vectors.
              needCheckEgressJoin = false;
            }
          }
        } else {
          // If there is no leg that has a calculated flight path after the TO leg and the TO leg's egress is
          // recalculated, then it is guaranteed to be erased, in which case there is no need to check the egress
          // vectors.
          if (FlightPathLegToLegCalculator.canCalculateTransition(toLegCalc.egress)) {
            needCheckEgressJoin = false;
          }
        }
      }

      if (needCheckEgressJoin && toLegCalc.egress.length > 0 && toLegCalc.egressJoinIndex === 0) {
        toVectorStartVec = GeoPoint.sphericalToCartesian(toVector.startLat, toVector.startLon, this.trackTrackCache.vec3[1]);
        toVectorPath = FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTrackCache.geoCircle[1]);

        const egressJoinDistance = toVectorPath.distanceAlong(
          toVectorStartVec,
          GeoPoint.sphericalToCartesian(toLegCalc.egress[0].startLat, toLegCalc.egress[0].startLon, this.trackTrackCache.vec3[2]),
          Math.PI
        );
        courseReversalEndDistance = egressJoinDistance > Math.PI + GeoMath.ANGULAR_TOLERANCE ? 0 : egressJoinDistance;
      }
    }

    const fromVectorEndVec = GeoPoint.sphericalToCartesian(fromVector.endLat, fromVector.endLon, this.trackTrackCache.vec3[0]);
    const fromVectorPath = FlightPathUtils.setGeoCircleFromVector(fromVector, this.trackTrackCache.geoCircle[0]);

    toVectorStartVec ??= GeoPoint.sphericalToCartesian(toVector.startLat, toVector.startLon, this.trackTrackCache.vec3[1]);
    toVectorPath ??= FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTrackCache.geoCircle[1]);

    const courseReversalEndVec = toVectorPath.offsetDistanceAlong(toVectorStartVec, courseReversalEndDistance, this.trackTrackCache.vec3[2], Math.PI);

    const fromVectorCourse = fromVectorPath.bearingAt(fromVectorEndVec, Math.PI);
    const toVectorCourse = toVectorPath.bearingAt(fromVectorEndVec, Math.PI);

    const turnDirection = MathUtils.angularDistanceDeg(fromVectorCourse, toVectorCourse, 1) > 180 ? 'left' : 'right';

    const vectorCount = this.procTurnVectorBuilder.build(
      toLegCalc.ingress, 0,
      fromVectorEndVec, fromVectorPath,
      courseReversalEndVec, toVectorPath,
      fromVectorCourse + (turnDirection === 'left' ? -45 : 45),
      state.desiredCourseReversalTurnRadius.asUnit(UnitType.METER), turnDirection,
      fromVectorCourse, toVectorCourse,
      FlightPathVectorFlags.LegToLegTurn | FlightPathVectorFlags.CourseReversal, true,
      toLegCalc.flightPath[0].heading, toLegCalc.flightPath[0].isHeadingTrue
    );

    toLegCalc.ingress.length = vectorCount;
    toLegCalc.ingressJoinIndex = 0;

    return calculatedCount;
  }

  /**
   * Calculates a leg-to-leg anticipated turn transition between two great-circle ("track") vectors. In calculating the
   * specified transition, this method may also calculate a sequence of consecutive transitions following the specified
   * transition.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param fromIndex The index of the transition's FROM leg.
   * @param toIndex The index of the transition's TO leg.
   * @param endIndex The index of the flight plan leg at which to stop calculating transitions. The last transition to
   * be calculated will be between the this leg and the previous leg.
   * @param state The airplane state to use for calculations.
   * @param fromVector The last base flight path vector of the transition's FROM leg (the FROM vector).
   * @param toVector The first base flight path vector of the transition's TO leg (the TO vector).
   * @param isRestrictedByPrevTransition Whether the FROM leg's egress transition is restricted by the leg's ingress
   * transition.
   * @param previousTanTheta The tangent of the theta angle of the previous transition's anticipated turn. Theta is
   * defined as the (acute) angle between either the FROM vector or the TO vector's path and the great circle passing
   * through the point where the FROM and TO vectors meet and the center of the anticipated turn. If there is no
   * previous transition, the previous transition is not an anticipated turn, or the previous transition's FROM and
   * TO vectors are not both great-circle paths, then this value should be left undefined.
   *
   * If this value is defined, `isRestrictedByPrevTransition` is true, and the current anticipated turn would infringe
   * on the previous anticipated turn, then the anticipated distance of the current turn will be adjusted to maximize
   * the radius of the smaller of the two turns assuming the current turn starts exactly where the previous turn ends.
   * @returns The number of consecutive leg-to-leg transitions calculated by this method.
   */
  private calculateTrackTrackAnticipatedTurn(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    endIndex: number,
    state: FlightPathPlaneState,
    fromVector: FlightPathVector,
    toVector: FlightPathVector,
    isRestrictedByPrevTransition: boolean,
    previousTanTheta?: number
  ): number {
    let calculatedCount = 1;

    const fromLegCalc = legs[fromIndex].calculated!;
    const toLegCalc = legs[toIndex].calculated!;

    const fromVectorEnd = this.trackTrackCache.geoPoint[0].set(fromVector.endLat, fromVector.endLon);

    // From this point on, to simplify calculations, we will assume that the FROM and TO paths intersect at the end
    // point of the FROM vector. (This may not actually be the case since the end point of the FROM vector and the
    // start point of the TO vector are allowed to be different within some tolerance. Accumulated floating point
    // errors can also lead to violations of this assumption.) Using this assumption, calculate the position of the
    // anticipated turn circle and the start, end, and midpoints of the turn.

    let fromVectorCourse = fromVectorEnd.bearingFrom(fromVector.startLat, fromVector.startLon);
    if (!isFinite(fromVectorCourse)) {
      const fromVectorPath = FlightPathUtils.setGeoCircleFromVector(fromVector, this.trackTrackCache.geoCircle[0]);
      fromVectorCourse = fromVectorPath.bearingAt(fromVectorEnd, Math.PI);
    }

    let toVectorCourse = fromVectorEnd.bearingTo(toVector.endLat, toVector.endLon);
    if (!isFinite(toVectorCourse)) {
      const toVectorPath = FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTrackCache.geoCircle[0]);
      toVectorCourse = toVectorPath.bearingAt(fromVectorEnd, Math.PI);
    }

    const courseAngleDiff = MathUtils.angularDistanceDeg(fromVectorCourse, toVectorCourse, 0);

    if (courseAngleDiff < 1) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return calculatedCount;
    }

    const theta = (180 - courseAngleDiff) / 2;
    const tanTheta = Math.tan(theta * Avionics.Utils.DEG2RAD);
    // D is defined as the distance along the FROM or TO vectors from the start or end of the anticipated turn to the
    // turn vertex (where the FROM and TO vectors meet). In other words, D is the along-track anticipated turn
    // distance.
    const desiredD = Math.asin(MathUtils.clamp(Math.tan(state.desiredTurnAnticipationTurnRadius.asUnit(UnitType.GA_RADIAN)) / tanTheta, -1, 1));

    let restrictedD = Infinity;
    if (isRestrictedByPrevTransition) {
      if (previousTanTheta === undefined) {
        // D is not restricted by a previous anticipated turn. Now we need to check if there is an ingress transition
        // on the FROM leg and if it shares a common flight path vector with the one involved in the anticipated turn
        // currently being calculated.

        if (fromLegCalc.ingress.length > 0 && fromLegCalc.ingressJoinIndex === fromLegCalc.flightPath.length - 1) {
          const fromVectorPath = FlightPathUtils.setGeoCircleFromVector(fromVector, this.trackTrackCache.geoCircle[0]);
          const lastIngressVector = fromLegCalc.ingress[fromLegCalc.ingress.length - 1];
          const ingressJoinDistance = fromVectorPath.distanceAlong(
            GeoPoint.sphericalToCartesian(lastIngressVector.endLat, lastIngressVector.endLon, this.trackTrackCache.vec3[0]),
            fromVectorEnd,
            Math.PI
          );

          restrictedD = ingressJoinDistance > Math.PI + GeoMath.ANGULAR_TOLERANCE ? 0 : ingressJoinDistance;
        }
      } else {
        // D is restricted by a previous anticipated turn. The values of D_current and D_previous are restricted such
        // that their sum cannot exceed the total length of their shared vector (the current FROM vector). Therefore,
        // we set the maximum value of D_current such that at D_current(max), the radius of the current anticipated
        // turn equals the radius of the previous turn. This will maximize the radius of the smaller of the current
        // anticipated turn and the previous anticipated turn.

        const tanThetaRatio = previousTanTheta / tanTheta;
        const totalD = UnitType.METER.convertTo(fromVector.distance, UnitType.GA_RADIAN);
        const cosTotalD = Math.cos(totalD);
        let prevTurnRestrictedD = Math.acos(
          MathUtils.clamp((tanThetaRatio * cosTotalD + 1) / Math.sqrt(tanThetaRatio * tanThetaRatio + 2 * tanThetaRatio * cosTotalD + 1), -1, 1)
        );
        if (prevTurnRestrictedD > totalD) {
          prevTurnRestrictedD = Math.PI - prevTurnRestrictedD;
        }
        restrictedD = prevTurnRestrictedD;
      }
    }

    // If the TO leg only has one base flight path vector, then we need to scan forward in the leg sequence to compute
    // any restrictions on D imposed by later transitions.
    if (toLegCalc.flightPath.length === 1) {
      let nextTransitionRestrictedD: number | undefined;

      // We need to check if the TO leg's egress transition is going to be recalculated with the current round of
      // calculations. Depending on if and how the transition is going to be recalculated, we may need not need to
      // check the egress vectors or we may need to pre-compute the egress transition.
      if (toIndex < endIndex && FlightPathLegToLegCalculator.canCalculateTransition(toLegCalc.egress)) {
        const nextLegCalc = legs[toIndex + 1]?.calculated;
        if (nextLegCalc && nextLegCalc.flightPath.length > 0 && FlightPathLegToLegCalculator.canCalculateTransition(nextLegCalc.ingress)) {
          const nextVector = nextLegCalc.flightPath[0];
          if (FlightPathUtils.isVectorGreatCircle(nextVector)) {
            // If the TO vector of the next leg-to-leg transition is a great circle, then we are allowed to pre-compute
            // the next transition.
            calculatedCount += this.calculateTrackTrackTransition(
              legs, toIndex, toIndex + 1, endIndex,
              state,
              toVector, nextVector,
              true,
              tanTheta
            );
          } else {
            // If the TO vector of the next leg-to-leg transition to share a vector with the current leg-to-leg
            // transition is not a great circle, then we know that the distance from the start of the vector to where
            // the egress joins is guaranteed to be at least half the distance of the vector.

            nextTransitionRestrictedD = UnitType.METER.convertTo(toVector.distance / 2, UnitType.GA_RADIAN);
          }
        }
      }

      // If we haven't defined a restriction on D from the next transition yet, then check if the TO leg has a
      // calculated egress. If it does, then set the restriction to the distance from the start of the TO vector to
      // where the egress joins the vector.
      if (nextTransitionRestrictedD === undefined) {
        if (toLegCalc.egress.length > 0 && toLegCalc.egressJoinIndex === 0) {
          const toVectorPath = FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTrackCache.geoCircle[0]);
          const egressJoinDistance = toVectorPath.distanceAlong(
            GeoPoint.sphericalToCartesian(toVector.startLat, toVector.startLon, this.trackTrackCache.vec3[0]),
            GeoPoint.sphericalToCartesian(toLegCalc.egress[0].startLat, toLegCalc.egress[0].startLon, this.trackTrackCache.vec3[1]),
            Math.PI
          );
          nextTransitionRestrictedD = egressJoinDistance > Math.PI + GeoMath.ANGULAR_TOLERANCE ? 0 : egressJoinDistance;
        } else {
          nextTransitionRestrictedD = Infinity;
        }
      }

      restrictedD = Math.min(restrictedD, nextTransitionRestrictedD);
    }

    const D = Math.min(
      desiredD,
      restrictedD,
      UnitType.METER.convertTo(fromVector.distance, UnitType.GA_RADIAN),
      UnitType.METER.convertTo(toVector.distance, UnitType.GA_RADIAN)
    );

    // The distance from the turn vertex to the center of the turn.
    const H = Math.atan(Math.tan(D) / Math.cos(theta * Avionics.Utils.DEG2RAD));
    const turnRadiusRad = desiredD === D
      ? state.desiredTurnAnticipationTurnRadius.asUnit(UnitType.GA_RADIAN)
      : Math.atan(Math.sin(D) * tanTheta);

    if (D <= GeoMath.ANGULAR_TOLERANCE || turnRadiusRad <= GeoMath.ANGULAR_TOLERANCE) {
      // Prevent zero-length turns.
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return calculatedCount;
    }

    // We need to reset the GeoPoint because the potential call to calculateTrackTrackTransition() above can overwrite
    // it.
    fromVectorEnd.set(fromVector.endLat, fromVector.endLon);

    const turnDirection = FlightPathUtils.getShortestTurnDirection(fromVectorCourse, toVectorCourse) ?? 'right';
    const turnBisectorBearing = toVectorCourse + theta * (turnDirection === 'left' ? -1 : 1);
    const turnCenterVec = fromVectorEnd.offset(turnBisectorBearing, H, this.trackTrackCache.geoPoint[1]).toCartesian(this.trackTrackCache.vec3[0]);

    const turnStart = fromVectorEnd.offset(fromVectorCourse, -D, this.trackTrackCache.geoPoint[1]);
    const turnMiddle = fromVectorEnd.offset(turnBisectorBearing, H - turnRadiusRad, this.trackTrackCache.geoPoint[2]);
    const turnEnd = fromVectorEnd.offset(toVectorCourse, D, this.trackTrackCache.geoPoint[3]);

    this.setAnticipatedTurn(
      fromLegCalc, toLegCalc,
      turnRadiusRad, turnDirection,
      turnCenterVec,
      turnStart, turnMiddle, turnEnd,
      true
    );

    return calculatedCount;
  }

  private readonly trackTurnCache = {
    vec3: ArrayUtils.create(10, () => Vec3Math.create()),
    geoPoint: ArrayUtils.create(2, () => new GeoPoint(0, 0)),
    geoCircle: ArrayUtils.create(5, () => new GeoCircle(Vec3Math.create(), 0)),
    intersection: ArrayUtils.create(1, () => [Vec3Math.create(), Vec3Math.create()]),
  };

  /**
   * Calculates a leg-to-leg transition between a great-circle ("track") vector and a small-circle ("turn") vector.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param fromIndex The index of the transition's FROM leg.
   * @param toIndex The index of the transition's TO leg.
   * @param endIndex The index of the flight plan leg at which to stop calculating transitions. The last transition to
   * be calculated will be between the this leg and the previous leg.
   * @param state The airplane state to use for calculations.
   * @param fromVector The last base flight path vector of the transition's FROM leg (the FROM vector).
   * @param toVector The first base flight path vector of the transition's TO leg (the TO vector).
   * @param isTurnFirst Whether the FROM vector is the turn vector.
   * @returns The number of consecutive leg-to-leg transitions calculated by this method.
   */
  private calculateTrackTurnTransition(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    endIndex: number,
    state: FlightPathPlaneState,
    fromVector: FlightPathVector,
    toVector: FlightPathVector,
    isTurnFirst: boolean
  ): number {
    const fromLeg = legs[fromIndex];
    const toLeg = legs[toIndex];

    const fromLegCalc = fromLeg.calculated!;
    const toLegCalc = toLeg.calculated!;

    if (fromVector.distance <= GeoMath.ANGULAR_TOLERANCE || toVector.distance <= GeoMath.ANGULAR_TOLERANCE) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return 1;
    }

    const fromVectorEnd = this.trackTurnCache.geoPoint[0].set(fromVector.endLat, fromVector.endLon);
    const toVectorStart = this.trackTurnCache.geoPoint[1].set(toVector.startLat, toVector.startLon);

    const areLegsContinuous = fromVectorEnd.equals(toVectorStart, 1e-5);

    if (!areLegsContinuous) {
      // The FROM leg does not end within ~60 meters of the start of the TO leg. We will set an empty transition
      // UNLESS either the FROM or TO leg is an AF or RF leg. These leg types often end up being somewhat discontinuous
      // with the preceding or proceeding leg, because the arcs can be slightly offset from the intended origin and/or
      // terminator fixes.

      let shouldQuit = true;

      if (
        fromLeg.leg.type === LegType.AF
        || fromLeg.leg.type === LegType.RF
        || toLeg.leg.type === LegType.AF
        || toLeg.leg.type === LegType.RF
      ) {
        shouldQuit = false;
      }

      if (shouldQuit) {
        this.setEmptyTransition(fromLegCalc, toLegCalc);
        return 1;
      }
    }

    const turnVector = isTurnFirst ? fromVector : toVector;

    const fromVectorPath = FlightPathUtils.setGeoCircleFromVector(fromVector, this.trackTurnCache.geoCircle[0]);
    const toVectorPath = FlightPathUtils.setGeoCircleFromVector(toVector, this.trackTurnCache.geoCircle[1]);

    const turnPath = isTurnFirst ? fromVectorPath : toVectorPath;
    const turnRadiusRad = FlightPathUtils.getTurnRadiusFromCircle(turnPath);

    const turnCircle = this.trackTurnCache.geoCircle[2].set(turnPath.center, turnPath.radius);
    if (turnCircle.radius > MathUtils.HALF_PI) {
      turnCircle.reverse();
    }
    const trackPath = isTurnFirst ? toVectorPath : fromVectorPath;

    // Calculate whether the turn intersects the track. If they don't (or if they are entirely coincident), then we
    // will immediately bail out.

    const intersections = this.trackTurnCache.intersection[0];
    const trackTurnIntersectionCount = turnCircle.intersection(trackPath, intersections);

    if (trackTurnIntersectionCount === 0) {
      this.setEmptyTransition(fromLegCalc, toLegCalc);
      return 1;
    }

    const fromVectorEndVec = fromVectorEnd.toCartesian(this.trackTurnCache.vec3[0]);
    const toVectorStartVec = toVectorStart.toCartesian(this.trackTurnCache.vec3[1]);

    const fromVectorHalfDistanceRad = UnitType.METER.convertTo(fromVector.distance / 2, UnitType.GA_RADIAN);
    const toVectorHalfDistanceRad = UnitType.METER.convertTo(toVector.distance / 2, UnitType.GA_RADIAN);

    const intersectionVec = this.trackTurnCache.vec3[2];
    let intersectionFromVectorEndOffset = 0;
    let intersectionToVectorStartOffset = 0;

    let isReversal = false;
    let isTransitionInsideTurn = false;
    let transitionTurnRadiusRad = 0;
    let transitionTurnDirection: VectorTurnDirection = 'right';
    let turnCircleOffsetSign: 1 | -1 = 1;
    let trackPathOffsetSign: 1 | -1 = 1;

    if (trackTurnIntersectionCount === 1) {
      // The turn circle and track path are tangent.

      if (areLegsContinuous) {
        // The FROM leg ends within ~60 meters of the start of the TO leg, so we will just proceed as if the FROM
        // vector ends at exactly at the start of the TO vector and both points are coincident with the
        // intersection between the FROM and TO vectors.

        Vec3Math.copy(fromVectorEndVec, intersectionVec);

        intersectionToVectorStartOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(toVectorPath, intersectionVec, toVectorStartVec);
      } else {
        // The FROM leg does not end within ~60 meters of the start of the TO leg. Therefore, we need to check
        // whether the intersection between the FROM and TO vectors is valid.

        Vec3Math.copy(intersections[0], intersectionVec);

        intersectionFromVectorEndOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, intersectionVec);
        intersectionToVectorStartOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(toVectorPath, intersectionVec, toVectorStartVec);

        if (!this.isTrackTurnIntersectionValid(
          intersectionVec,
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersectionFromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersectionToVectorStartOffset
        )) {
          this.setEmptyTransition(fromLegCalc, toLegCalc);
          return 1;
        }
      }

      // Whether the TO and FROM vectors are oriented in the same direction at the tangent point (i.e. whether their
      // paths are parallel).
      const isForward = Vec3Math.dot(GeoCircle.getGreatCircleNormal(intersectionVec, turnPath, this.trackTurnCache.vec3[3]), trackPath.center) >= 0;
      if (isForward) {
        // The FROM and TO vectors are parallel at the tangent point. In this case no anticipated turn is needed
        // between the FROM and TO vectors.
        transitionTurnRadiusRad = 0;
      } else {
        // The FROM and TO vectors are antiparallel at the tangent point. In this case the plane needs to make a
        // 180-degree turn. We will set the parameters of the turn to ensure that it begins after the end of the FROM
        // vector and ends before the start of the TO vector.

        isReversal = true;
        isTransitionInsideTurn = false;
        transitionTurnRadiusRad = state.desiredTurnAnticipationTurnRadius.asUnit(UnitType.GA_RADIAN);
        turnCircleOffsetSign = 1;
        trackPathOffsetSign = trackPath.encircles(turnCircle.center) ? -1 : 1;
      }
    } else {
      // The turn circle and track path are secant.

      let turnStartVec: Float64Array;
      let turnEndVec: Float64Array;

      if (areLegsContinuous) {
        // The FROM leg ends within ~60 meters of the start of the TO leg, so we will just proceed as if the FROM
        // vector ends at exactly at the start of the TO vector and both points are coincident with the intersection
        // between the FROM and TO vectors.

        Vec3Math.copy(fromVectorEndVec, intersectionVec);
        turnStartVec = GeoPoint.sphericalToCartesian(turnVector.startLat, turnVector.startLon, this.trackTurnCache.vec3[3]);
        turnEndVec = GeoPoint.sphericalToCartesian(turnVector.endLat, turnVector.endLon, this.trackTurnCache.vec3[4]);
      } else {
        // The FROM leg does not end within ~60 meters of the start of the TO leg. Therefore, we need to check whether
        // either of the intersections between the FROM and TO vectors is valid.

        const intersection0FromVectorEndOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, intersections[0]);
        const intersection0ToVectorStartOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(toVectorPath, intersections[0], toVectorStartVec);

        const intersection1FromVectorEndOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, intersections[1]);
        const intersection1ToVectorStartOffset = FlightPathLegToLegCalculator.getAlongCircleOffset(toVectorPath, intersections[1], toVectorStartVec);

        const isIntersection0Valid = this.isTrackTurnIntersectionValid(
          intersections[0],
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersection0FromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersection0ToVectorStartOffset
        );
        const isIntersection1Valid = this.isTrackTurnIntersectionValid(
          intersections[1],
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersection1FromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersection1ToVectorStartOffset
        );

        if (!isIntersection0Valid && !isIntersection1Valid) {
          this.setEmptyTransition(fromLegCalc, toLegCalc);
          return 1;
        }

        let intersectionIndex: 0 | 1;

        if (!isIntersection0Valid) {
          intersectionIndex = 1;
        } else if (!isIntersection1Valid) {
          intersectionIndex = 0;
        } else {
          // Both intersections are valid. We will bias toward intersections that lie after the end of the FROM vector
          // and before the start of the TO vector.

          if (intersection0FromVectorEndOffset + intersection0ToVectorStartOffset >= intersection1FromVectorEndOffset + intersection1ToVectorStartOffset) {
            intersectionIndex = 0;
          } else {
            intersectionIndex = 1;
          }
        }

        if (intersectionIndex === 0) {
          Vec3Math.copy(intersections[0], intersectionVec);
          intersectionFromVectorEndOffset = intersection0FromVectorEndOffset;
          intersectionToVectorStartOffset = intersection0ToVectorStartOffset;
        } else if (isIntersection1Valid) {
          Vec3Math.copy(intersections[1], intersectionVec);
          intersectionFromVectorEndOffset = intersection1FromVectorEndOffset;
          intersectionToVectorStartOffset = intersection1ToVectorStartOffset;
        }

        if (isTurnFirst) {
          turnStartVec = GeoPoint.sphericalToCartesian(turnVector.startLat, turnVector.startLon, this.trackTurnCache.vec3[3]);
          turnEndVec = intersectionVec;
        } else {
          turnStartVec = intersectionVec;
          turnEndVec = GeoPoint.sphericalToCartesian(turnVector.endLat, turnVector.endLon, this.trackTurnCache.vec3[4]);
        }
      }

      const turnDirection = FlightPathUtils.getTurnDirectionFromCircle(turnPath);
      const turnStartRadialNormal = GeoCircle.getGreatCircleNormal(turnCircle.center, turnStartVec, this.trackTurnCache.vec3[5]);
      const turnEndRadialNormal = GeoCircle.getGreatCircleNormal(turnCircle.center, turnEndVec, this.trackTurnCache.vec3[6]);

      const desiredTransitionTurnRadiusRad = state.desiredTurnAnticipationTurnRadius.asUnit(UnitType.GA_RADIAN);

      // The cosine of the angle between the track path and the great-circle path from the center of the turn to the
      // intersection point.
      const cosRadialCourseDiff = Vec3Math.dot(
        Vec3Math.normalize(
          Vec3Math.cross(turnCircle.center, intersectionVec, this.trackTurnCache.vec3[7]),
          this.trackTurnCache.vec3[7]
        ),
        trackPath.center
      );

      if (Math.abs(cosRadialCourseDiff) <= 0.0174524064372836 /* 89-91 deg */) {
        // The track path and the turn circle are nearly tangent. This means that the track path and turn circle are
        // nearly parallel or antiparallel at the intersection point.

        if (Vec3Math.dot(GeoCircle.getGreatCircleNormal(intersectionVec, turnPath, this.trackTurnCache.vec3[7]), trackPath.center) >= 0) {
          // The track path and the turn circle are nearly parallel. In this case no anticipated turn is needed.
          transitionTurnRadiusRad = 0;
        } else {
          // The track path and the turn circle are nearly antiparallel. In this case the plane needs to make a
          // 180-degree turn. We will set the parameters of the turn to ensure that it begins after the end of the FROM
          // vector and ends before the start of the TO vector.

          isReversal = true;
          isTransitionInsideTurn = false;
          transitionTurnRadiusRad = desiredTransitionTurnRadiusRad;
          turnCircleOffsetSign = 1;
          trackPathOffsetSign = trackPath.encircles(turnCircle.center) ? -1 : 1;
        }
      } else {
        transitionTurnDirection = FlightPathUtils.pathAngleDistance(fromVectorPath, toVectorPath, intersectionVec, 'left', Math.PI) <= Math.PI ? 'left' : 'right';
        isTransitionInsideTurn = isTurnFirst ? cosRadialCourseDiff < 0 : cosRadialCourseDiff > 0;

        // Now we must calculate the maximum allowed transition turn radius such that the transition turn does not
        // start or end beyond the limits of the FROM or TO vectors. Define the track limit as the point along the
        // track vector beyond which the transition cannot start or end. Define the turn limit as the point along the
        // turn vector beyond which the transition cannot start or end. We will first convert the track limit to a
        // pseudo-turn limit. The pseudo-turn limit is the point along the turn vector at which the transition turn
        // will start or end if the transition turn starts or ends at the track limit. We will then take the more
        // restrictive of the pseudo-turn limit and the actual turn limit. This maximally restrictive turn limit is
        // then used to calculate the transition turn radius that would result in a transition turn that has an
        // endpoint exactly at the limit.

        const transitionTurnVertexRadialNormal = GeoCircle.getGreatCircleNormal(turnCircle.center, intersectionVec, this.trackTurnCache.vec3[7]);

        // If the transition turn is inside the turn circle, then clamp the track limit distance to half the length of
        // the track path within the turn circle. This is done because the transition turn radius is maximized when the
        // transition turn starts or ends at the mid-point of the track path segment that lies within the turn circle.

        const maxTrackLimitDistance = isTransitionInsideTurn
          ? Math.atan(Math.abs(Vec3Math.dot(trackPath.center, transitionTurnVertexRadialNormal)) * Math.tan(turnRadiusRad))
          : Infinity;

        const trackLimitVec = this.trackTurnCache.vec3[8];
        if (isTurnFirst) {
          const trackLimitDistance = Math.min(toVectorHalfDistanceRad + intersectionToVectorStartOffset, maxTrackLimitDistance);
          toVectorPath.offsetDistanceAlong(intersectionVec, trackLimitDistance, trackLimitVec, Math.PI);
        } else {
          const trackLimitDistance = Math.min(fromVectorHalfDistanceRad + intersectionFromVectorEndOffset, maxTrackLimitDistance);
          fromVectorPath.offsetDistanceAlong(intersectionVec, -trackLimitDistance, trackLimitVec, Math.PI);
        }

        // The great circle that passes through the center of the turn and is perpendicular to the track.
        const trackPerpendicularDiameter = this.trackTurnCache.geoCircle[3].setAsGreatCircle(trackPath.center, turnCircle.center);
        trackPerpendicularDiameter.intersection(turnCircle, intersections);

        // Calculate the great circle that passes through the appropriate antipode and the track limit endpoint. The
        // intersection (that is NOT the antipode) of this great circle with the turn circle is the pseudo-turn limit.

        const intersectingPath = this.trackTurnCache.geoCircle[3].setAsGreatCircle(intersections[turnDirection === 'left' ? 0 : 1], trackLimitVec);
        const turnIntersectionCount = intersectingPath.intersection(turnCircle, intersections);

        let turnLimitAngularWidth = MathUtils.TWO_PI;
        if (turnIntersectionCount > 0) {
          turnLimitAngularWidth = Vec3Math.unitAngle(
            isTurnFirst ? turnEndRadialNormal : turnStartRadialNormal,
            GeoCircle.getGreatCircleNormal(turnCircle.center, intersections[0], this.trackTurnCache.vec3[8])
          );
        }

        // The angular width of the portion of the turn from the intersection to the mid-point of the turn vector.
        const turnMidPointAngularWidth = isTurnFirst
          ? fromVectorPath.angularWidth(fromVectorHalfDistanceRad + intersectionFromVectorEndOffset)
          : toVectorPath.angularWidth(toVectorHalfDistanceRad + intersectionToVectorStartOffset);

        turnLimitAngularWidth = Math.min(turnLimitAngularWidth, turnMidPointAngularWidth);

        let transitionTurnRadiusLimitRad = 0;
        if (turnLimitAngularWidth > 0) {
          const turnLimitPointVec = turnCircle.offsetAngleAlong(
            isTurnFirst ? turnEndVec : turnStartVec,
            turnLimitAngularWidth * ((turnDirection === 'left') === isTurnFirst ? -1 : 1),
            this.trackTurnCache.vec3[8],
            Math.PI
          );
          const turnLimitRadialPath = this.trackTurnCache.geoCircle[3].setAsGreatCircle(turnCircle.center, turnLimitPointVec);

          // The angle between the track path (directed away from the turn at the point of intersection) and the
          // radial from the turn center to the turn limit point.
          const theta = Math.acos(
            MathUtils.clamp(Vec3Math.dot(turnLimitRadialPath.center, trackPath.center), -1, 1)
            * (isTurnFirst == isTransitionInsideTurn ? -1 : 1)
          );

          if (theta >= MathUtils.HALF_PI) {
            if (isTransitionInsideTurn) {
              const D = Math.asin(
                Math.sin(Math.acos(Math.abs(MathUtils.clamp(Vec3Math.dot(trackPath.center, transitionTurnVertexRadialNormal), -1, 1))))
                * Math.sin(turnRadiusRad)
              );
              transitionTurnRadiusLimitRad = (turnRadiusRad - D) / 2;
            } else {
              transitionTurnRadiusLimitRad = Math.PI;
            }
          } else {
            // Find the intersection of the radial from the turn center to the turn limit point with the track path. We
            // choose the first intersection that is encountered when traveling along the radial, starting from the
            // turn limit point.
            const radialTrackIntersectionCount = turnLimitRadialPath.intersection(trackPath, intersections);
            if (radialTrackIntersectionCount === 2) {
              const thresholdNormal = GeoCircle.getGreatCircleNormal(turnLimitRadialPath.center, turnLimitPointVec, this.trackTurnCache.vec3[9]);
              const turnLimitRadialTrackIntersection = Vec3Math.dot(intersections[0], thresholdNormal) >= 0
                ? intersections[0]
                : intersections[1];

              // Cosine of the distance from the turn limit point to the intersection of the track path and the radial
              // connecting the turn center to the turn limit point.
              const cosD = MathUtils.clamp(Vec3Math.dot(turnLimitRadialTrackIntersection, turnLimitPointVec), -1, 1);
              const sinTheta = Math.sin(theta);
              const sign = isTransitionInsideTurn ? -1 : 1;
              const denominator = 1 + sign * sinTheta * cosD;
              if (denominator > 0) {
                const sinD = Math.sqrt(1 - cosD * cosD); // 0 <= D <= pi, so sin(D) must be non-negative.
                transitionTurnRadiusLimitRad = Math.atan((sinTheta * sinD) / denominator);
              } else {
                // This case technically should be impossible because it requires sin(theta) === 1, and we are guaranteed
                // that 0 <= theta < pi / 2, and therefore sin(theta) < 1. However, floating point error might invalidate
                // our assumptions, so we will still handle the case.
                transitionTurnRadiusLimitRad = MathUtils.HALF_PI;
              }
            } else {
              // If we are in this case, then the track path and the radial from the turn center to the turn limit
              // point are parallel or antiparallel. This means that the turn limit point lies on the track path.
              // Therefore, no transition turn of non-zero radius is possible.
              transitionTurnRadiusLimitRad = 0;
            }
          }
        }

        transitionTurnRadiusRad = Math.min(desiredTransitionTurnRadiusRad, transitionTurnRadiusLimitRad);

        turnCircleOffsetSign = isTransitionInsideTurn ? -1 : 1;
        trackPathOffsetSign = transitionTurnDirection === 'left' ? -1 : 1;
      }
    }

    return this.calculateTrackTurnAnticipatedTurn(
      legs, fromIndex, toIndex, endIndex,
      state,
      fromVector, toVector,
      isTurnFirst,
      fromVectorPath, toVectorPath,
      turnCircle, trackPath,
      intersectionVec,
      intersectionFromVectorEndOffset, intersectionToVectorStartOffset,
      isReversal,
      isTransitionInsideTurn,
      transitionTurnRadiusRad, transitionTurnDirection,
      turnCircleOffsetSign, trackPathOffsetSign
    );
  }

  private readonly trackTurnIntersectionValidCache = {
    vec3: ArrayUtils.create(2, () => Vec3Math.create())
  };

  /**
   * Checks if an intersection between an arc path and a track path is valid for computing turn anticipation between
   * arc and track vectors. The intersection is considered valid if and only if all the following conditions are true:
   * - The intersection is within one nautical mile of the end of the vector on which the turn begins.
   * - The intersection is within one nautical mile of the start of the vector on which the turn ends.
   * - The intersection is located after the mid-point of the vector on which the turn begins.
   * - The intersection is located before the mid-point of the vector on which the turn ends.
   * @param intersection The intersection to check.
   * @param fromVectorPath A geo circle defining the path of the vector on which the turn begins.
   * @param fromVectorEnd The end point of the vector on which the turn begins.
   * @param fromVectorHalfDistance Half of the distance covered by the vector on which the turn begins.
   * @param intersectionFromVectorEndOffset The along-vector offset distance, in great-arc radians, of the intersection
   * from the end point of the vector on which the turn begins. Positive offsets indicate the intersection is located
   * after the end point.
   * @param toVectorPath A geo circle defining the path of the vector on which the turn ends.
   * @param toVectorStart The start point of the vector on which the turn ends.
   * @param toVectorHalfDistance Half of the distance covered by the vector on which the turn ends.
   * @param intersectionToVectorStartOffset The along-vector offset distance, in great-arc radians, of the intersection
   * from the start point of the vector on which the turn ends. Positive offsets indicate the intersection is located
   * before the start point.
   * @returns Whether the specified intersection is valid for computing turn anticipation between arc and track
   * vectors.
   */
  private isTrackTurnIntersectionValid(
    intersection: ReadonlyFloat64Array,
    fromVectorPath: GeoCircle,
    fromVectorEnd: ReadonlyFloat64Array,
    fromVectorHalfDistance: number,
    intersectionFromVectorEndOffset: number,
    toVectorPath: GeoCircle,
    toVectorStart: ReadonlyFloat64Array,
    toVectorHalfDistance: number,
    intersectionToVectorStartOffset: number
  ): boolean {
    const fromVectorMidVec = fromVectorPath.offsetDistanceAlong(
      fromVectorEnd,
      -fromVectorHalfDistance,
      this.trackTurnIntersectionValidCache.vec3[0],
      Math.PI
    );
    const toVectorMidVec = toVectorPath.offsetDistanceAlong(
      toVectorStart,
      toVectorHalfDistance,
      this.trackTurnIntersectionValidCache.vec3[1],
      Math.PI
    );

    return (
      Math.abs(intersectionFromVectorEndOffset) <= 2.9e-4 // 2.9e-4 radians ~= 1 nautical mile
      && Math.abs(intersectionToVectorStartOffset) <= 2.9e-4
      && FlightPathUtils.isPointAlongArc(fromVectorPath, fromVectorMidVec, Math.PI, intersection)
      && !FlightPathUtils.isPointAlongArc(toVectorPath, toVectorMidVec, Math.PI, intersection)
    );
  }

  /**
   * Calculates a leg-to-leg anticipated turn transition between a great-circle ("track") vector and a small-circle
   * ("turn") vector.
   * @param legs An array containing the legs for which to calculate transitions.
   * @param fromIndex The index of the transition's FROM leg.
   * @param toIndex The index of the transition's TO leg.
   * @param endIndex The index of the flight plan leg at which to stop calculating transitions. The last transition to
   * be calculated will be between the this leg and the previous leg.
   * @param state The airplane state to use for calculations.
   * @param fromVector The last base flight path vector of the transition's FROM leg (the FROM vector).
   * @param toVector The first base flight path vector of the transition's TO leg (the TO vector).
   * @param isTurnFirst Whether the FROM vector is the turn vector.
   * @param fromVectorPath A GeoCircle that defines the path of the FROM vector.
   * @param toVectorPath A GeoCircle that defines the path of the TO vector.
   * @param turnCircle A GeoCircle whose center and radius equal the center and radius of the turn described by the
   * turn vector.
   * @param trackPath A GeoCircle that defines the path of the track vector.
   * @param intersection The intersection point between the GeoCircles defining the FROM and TO vector paths to use as
   * the effective point at which the FROM and TO vectors are joined.
   * @param intersectionFromVectorEndOffset The along-vector offset distance, in great-arc radians, of the intersection
   * from the end point of the FROM vector. Positive offsets indicate the intersection is located after the end point.
   * @param intersectionToVectorStartOffset The along-vector offset distance, in great-arc radians, of the intersection
   * from the start point of the TO vector. Positive offsets indicate the intersection is located before the start
   * point.
   * @param isReversal Whether the anticipated turn is a 180-degree turn.
   * @param isTransitionInsideTurn Whether the anticipated turn transition should be positioned inside the GeoCircle
   * that defines the turn vector.
   * @param transitionTurnRadius The radius of the anticipated turn, in great-arc radians.
   * @param transitionTurnDirection The direction of the anticipated turn.
   * @param turnCircleToTransitionTurnCenterOffsetSign The sign of the distance offset from the `turnCircle` GeoCircle
   * to the center of the anticipated turn (-1 or 1). A positive offset sign indicates that `turnCircle` does not
   * encircle the center of the anticipated turn.
   * @param trackPathToTransitionTurnCenterOffsetSign The sign of the distance offset from the `trackPath` GeoCircle
   * to the center of the anticipated turn (-1 or 1). A positive offset sign indicates that `trackPath` does not
   * encircle the center of the anticipated turn.
   * @returns The number of consecutive leg-to-leg transitions calculated by this method.
   */
  private calculateTrackTurnAnticipatedTurn(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    endIndex: number,
    state: FlightPathPlaneState,
    fromVector: FlightPathVector,
    toVector: FlightPathVector,
    isTurnFirst: boolean,
    fromVectorPath: GeoCircle,
    toVectorPath: GeoCircle,
    turnCircle: GeoCircle,
    trackPath: GeoCircle,
    intersection: ReadonlyFloat64Array,
    intersectionFromVectorEndOffset: number,
    intersectionToVectorStartOffset: number,
    isReversal: boolean,
    isTransitionInsideTurn: boolean,
    transitionTurnRadius: number,
    transitionTurnDirection: VectorTurnDirection,
    turnCircleToTransitionTurnCenterOffsetSign: 1 | -1,
    trackPathToTransitionTurnCenterOffsetSign: 1 | -1
  ): number {
    const fromLegCalc = legs[fromIndex].calculated!;
    const toLegCalc = legs[toIndex].calculated!;

    let transitionTurnStartVec: ReadonlyFloat64Array;
    let transitionTurnEndVec: ReadonlyFloat64Array;

    let transitionStartFromVectorEndOffset = 0;
    let transitionEndToVectorStartOffset = 0;

    let egressVectorCount = 0;
    let ingressVectorCount = 0;

    if (transitionTurnRadius <= GeoMath.ANGULAR_TOLERANCE) {
      transitionTurnStartVec = intersection;
      transitionTurnEndVec = intersection;

      transitionStartFromVectorEndOffset = intersectionFromVectorEndOffset;
      transitionEndToVectorStartOffset = intersectionToVectorStartOffset;
    } else {
      const turnCircleOffset = this.trackTurnCache.geoCircle[3].set(
        turnCircle.center,
        turnCircle.radius + transitionTurnRadius * turnCircleToTransitionTurnCenterOffsetSign
      );
      const trackPathOffset = this.trackTurnCache.geoCircle[4].set(
        trackPath.center,
        trackPath.radius + transitionTurnRadius * trackPathToTransitionTurnCenterOffsetSign
      );

      const intersections = this.trackTurnCache.intersection[0];
      const transitionTurnCenterCandidateCount = turnCircleOffset.intersection(trackPathOffset, intersections);

      if (transitionTurnCenterCandidateCount === 0) {
        this.setEmptyTransition(fromLegCalc, toLegCalc);
        return 1;
      }

      const transitionTurnCenterVec = transitionTurnCenterCandidateCount === 2
        && (
          isReversal
          || Vec3Math.unitAngle(intersection, intersections[0]) >= Vec3Math.unitAngle(intersection, intersections[1])
        ) ? intersections[1] : intersections[0];

      transitionTurnStartVec = (isTurnFirst ? turnCircle : trackPath).closest(transitionTurnCenterVec, this.trackTurnCache.vec3[3]);
      transitionTurnEndVec = (isTurnFirst ? trackPath : turnCircle).closest(transitionTurnCenterVec, this.trackTurnCache.vec3[4]);

      const transitionTurnCircle = FlightPathUtils.getTurnCircle(transitionTurnCenterVec, transitionTurnRadius, transitionTurnDirection, this.trackTurnCache.geoCircle[3]);
      const transitionTurnMiddleVec = transitionTurnCircle.offsetAngleAlong(
        transitionTurnStartVec,
        transitionTurnCircle.angleAlong(transitionTurnStartVec, transitionTurnEndVec, Math.PI, GeoMath.ANGULAR_TOLERANCE) / 2,
        this.trackTurnCache.vec3[5],
        Math.PI
      );

      this.setAnticipatedTurn(
        fromLegCalc, toLegCalc,
        transitionTurnRadius, transitionTurnDirection,
        transitionTurnCenterVec,
        transitionTurnStartVec,
        transitionTurnMiddleVec,
        transitionTurnEndVec,
        false
      );

      const intersectionTransitionStartOffset = MathUtils.normalizeAngle(
        fromVectorPath.angleAlong(transitionTurnStartVec, intersection, Math.PI),
        -Math.PI
      );
      const intersectionTransitionEndOffset = MathUtils.normalizeAngle(
        toVectorPath.angleAlong(intersection, transitionTurnEndVec, Math.PI),
        -Math.PI
      );

      transitionStartFromVectorEndOffset = intersectionTransitionStartOffset - intersectionFromVectorEndOffset;
      transitionEndToVectorStartOffset = intersectionTransitionEndOffset - intersectionToVectorStartOffset;

      egressVectorCount = 1;
      ingressVectorCount = 1;
    }

    if (Math.abs(transitionStartFromVectorEndOffset) > 1e-5) {
      // The transition does not begin within ~60 meters of the end of the FROM vector. If the transition begins
      // after the end of the FROM vector, then we need to extend the transition at the egress end so that it joins
      // the FROM vector. If the transition begins before the end of the FROM vector and there is no anticipated turn
      // vector in the egress, then we need to add a zero-length egress vector so that we can properly mark the
      // beginning of the transition.

      if (transitionStartFromVectorEndOffset < 0 || egressVectorCount === 0) {
        // Copy the first egress vector if it exists to the second egress vector.
        if (egressVectorCount > 0) {
          const movedVector = fromLegCalc.egress[1] ??= FlightPathUtils.createEmptyVector();
          Object.assign(movedVector, fromLegCalc.egress[0]);
        }

        const vectorEnd = this.trackTurnCache.geoPoint[0].setFromCartesian(transitionTurnStartVec);
        const vectorStart = transitionStartFromVectorEndOffset < 0
          ? this.trackTurnCache.geoPoint[1].set(fromVector.endLat, fromVector.endLon)
          : vectorEnd;

        const flags = FlightPathVectorFlags.LegToLegTurn
          | FlightPathVectorFlags.AnticipatedTurn
          | (fromVector.flags & FlightPathVectorFlags.Fallback);

        FlightPathUtils.setVectorFromCircle(
          fromLegCalc.egress[0] ??= FlightPathUtils.createEmptyVector(),
          fromVectorPath,
          vectorStart, vectorEnd,
          flags,
          fromVector.heading, fromVector.isHeadingTrue
        );

        fromLegCalc.egressJoinIndex = fromLegCalc.flightPath.length - 1;

        egressVectorCount += 1;
      }
    }

    if (Math.abs(transitionEndToVectorStartOffset) > 1e-5) {
      // The transition does not end within ~60 meters of the start of the TO vector. If the transition begins before
      // the start of the TO vector, then we need to extend the transition at the ingress end so that it joins the TO
      // TO vector. If the transition ends after the end of the TO vector and there is no anticipated turn vector in
      // the ingress, then we need to add a zero-length ingress vector so that we can properly mark the end of the
      // transition.

      if (transitionEndToVectorStartOffset < 0 || ingressVectorCount === 0) {
        const vectorStart = this.trackTurnCache.geoPoint[0].setFromCartesian(transitionTurnEndVec);
        const vectorEnd = transitionEndToVectorStartOffset < 0
          ? this.trackTurnCache.geoPoint[1].set(toVector.startLat, toVector.startLon)
          : vectorStart;

        const flags = FlightPathVectorFlags.LegToLegTurn
          | FlightPathVectorFlags.AnticipatedTurn
          | (toVector.flags & FlightPathVectorFlags.Fallback);

        FlightPathUtils.setVectorFromCircle(
          toLegCalc.ingress[ingressVectorCount] ??= FlightPathUtils.createEmptyVector(),
          toVectorPath,
          vectorStart, vectorEnd,
          flags,
          toVector.heading, toVector.isHeadingTrue
        );

        toLegCalc.ingressJoinIndex = 0;

        ingressVectorCount += 1;
      }
    }

    fromLegCalc.egress.length = egressVectorCount;
    if (egressVectorCount === 0) {
      fromLegCalc.egressJoinIndex = -1;
    }

    toLegCalc.ingress.length = ingressVectorCount;
    if (ingressVectorCount === 0) {
      toLegCalc.ingressJoinIndex = -1;
    }

    return 1;
  }

  /**
   * Checks whether the contents of a transition vector array can be replaced with calculated leg-to-leg transition
   * vectors.
   * @param transition The transition vector array to check.
   * @returns Whether the contents of the specified transition vector array can be replaced with calculated leg-to-leg
   * transition vectors.
   */
  private static canCalculateTransition(transition: FlightPathVector[]): boolean {
    return transition.length === 0 || BitFlags.isAll(transition[0].flags, FlightPathVectorFlags.LegToLegTurn);
  }

  /**
   * Gets the along-circle offset distance from a reference point to a query point, in great-arc radians. The offset
   * is signed, with positive values indicating offsets in the direction of the circle. The calculated offset has the
   * range `[-c / 2, c / 2)`, where `c` is the circumference of the circle.
   * @param circle The geo circle along which to measure the offset.
   * @param reference The reference point.
   * @param query The query point.
   * @param equalityTolerance The tolerance for considering the reference and query points to be equal, in great-arc
   * radians. If the absolute (direction-agnostic) along-circle distance between the reference and query points is less
   * than or equal to this value, then zero will be returned. Defaults to `0`.
   * @returns The along-circle offset distance from the specified reference point to the query point, in great-arc
   * radians.
   */
  private static getAlongCircleOffset(
    circle: GeoCircle,
    reference: LatLonInterface | ReadonlyFloat64Array,
    query: LatLonInterface | ReadonlyFloat64Array,
    equalityTolerance?: number
  ): number {
    return circle.arcLength(
      MathUtils.normalizeAngle(circle.angleAlong(reference, query, Math.PI, equalityTolerance), -Math.PI)
    );
  }
}