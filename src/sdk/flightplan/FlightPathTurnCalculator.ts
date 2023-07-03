import { GeoCircle, GeoPoint, LatLonInterface, NavMath } from '../geo';
import { BitFlags, MathUtils, ReadonlyFloat64Array, UnitType, Vec3Math } from '../math';
import { LegType } from '../navigation/Facilities';
import { FlightPathUtils } from './FlightPathUtils';
import { ProcedureTurnBuilder } from './FlightPathVectorBuilder';
import { FlightPlanUtils } from './FlightPlanUtils';
import { CircleVector, FlightPathVectorFlags, LegCalculations, LegDefinition, VectorTurnDirection } from './FlightPlanning';

/**
 * A flight path calculator for turns between legs.
 */
export class FlightPathTurnCalculator {
  private static readonly vector3Cache = [
    new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3),
    new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3),
  ];
  private static readonly geoPointCache = [
    new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0),
    new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)
  ];
  private static readonly geoCircleCache = [
    new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)
  ];
  private static readonly intersectionVecArrayCache = [new Float64Array(3), new Float64Array(3)];
  private static readonly intersectionGeoPointArrayCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];

  private readonly procTurnBuilder = new ProcedureTurnBuilder();

  /**
   * Computes leg to leg turns for a given sequence of legs. Turns will only be calculated between legs with defined
   * flight path vectors and no pre-existing egress/ingress transition (unless it is a leg-to-leg turn) at the junction
   * of the turn.
   * @param legs A sequence of legs.
   * @param startIndex The index of the first leg for which to compute turns.
   * @param count The total number of legs for which to compute turns.
   * @param desiredTurnRadius The desired general turn radius, in meters.
   * @param desiredCourseReversalTurnRadius The desired course reversal turn radius, in meters.
   * @param desiredTurnAnticipationTurnRadius The desired turn anticipation turn radius, in meters.
   */
  public computeTurns(
    legs: LegDefinition[],
    startIndex: number,
    count: number,
    desiredTurnRadius: number,
    desiredCourseReversalTurnRadius: number,
    desiredTurnAnticipationTurnRadius: number
  ): void {
    const end = startIndex + count;
    let currentIndex = startIndex;
    while (currentIndex < end) {
      const fromLeg = legs[currentIndex] as LegDefinition | undefined;
      const toLeg = legs[currentIndex + 1] as LegDefinition | undefined;
      const fromLegCalc = fromLeg?.calculated;
      const toLegCalc = toLeg?.calculated;
      if (
        fromLegCalc
        && toLegCalc
        && !FlightPlanUtils.isManualDiscontinuityLeg(fromLeg.leg.type)
        && !FlightPlanUtils.isDiscontinuityLeg(fromLeg.leg.type)
        && !FlightPlanUtils.isDiscontinuityLeg(toLeg.leg.type)
      ) {
        const fromVector = fromLegCalc.flightPath[fromLegCalc.flightPath.length - 1];
        const toVector = toLegCalc.flightPath[0];
        if (
          fromVector && toVector
          && (fromLegCalc.egress.length === 0 || BitFlags.isAll(fromLegCalc.egress[0].flags, FlightPathVectorFlags.LegToLegTurn))
          && (toLegCalc.ingress.length === 0 || BitFlags.isAll(toLegCalc.ingress[0].flags, FlightPathVectorFlags.LegToLegTurn))
        ) {
          if (fromVector.radius === Math.PI / 2 && toVector.radius === Math.PI / 2) {
            currentIndex = this.computeTrackTrackTurn(
              legs, currentIndex, currentIndex + 1,
              fromVector, toVector,
              desiredTurnAnticipationTurnRadius, desiredCourseReversalTurnRadius,
              true
            );
            continue;
          } else if (toVector.radius === Math.PI / 2) {
            currentIndex = this.computeArcTrackTurn(legs, currentIndex, currentIndex + 1, fromVector, toVector, true, desiredTurnAnticipationTurnRadius);
            continue;
          } else if (fromVector.radius === Math.PI / 2) {
            currentIndex = this.computeArcTrackTurn(legs, currentIndex, currentIndex + 1, toVector, fromVector, false, desiredTurnAnticipationTurnRadius);
            continue;
          }
        }
      }

      if (fromLegCalc && BitFlags.isAll(fromLegCalc.egress[0]?.flags ?? 0, FlightPathVectorFlags.LegToLegTurn)) {
        fromLegCalc.egress.length = 0;
        fromLegCalc.egressJoinIndex = -1;
      }
      if (toLegCalc && BitFlags.isAll(toLegCalc.ingress[0]?.flags ?? 0, FlightPathVectorFlags.LegToLegTurn)) {
        toLegCalc.ingress.length = 0;
        toLegCalc.ingressJoinIndex = -1;
      }

      currentIndex++;
    }
  }

  /**
   * Calculates a leg-to-leg turn between two track vectors.
   * @param legs The sequence of legs to which the turn belongs.
   * @param fromIndex The index of the leg on which the turn begins.
   * @param toIndex The index of the leg on which the turn ends.
   * @param fromTrack The track vector on which the turn begins.
   * @param toTrack The track vector on which the turn ends.
   * @param desiredTurnAnticipationTurnRadius The desired turn anticipation turn radius, in meters.
   * @param desiredCourseReversalTurnRadius The desired course reversal turn radius, in meters.
   * @param isRestrictedByPrevTurn Whether turn anticipation is restricted by the previous leg-to-leg turn. If `true`,
   * turn anticipation will be restricted so that the turn does not overlap the previous turn if they share a common
   * flight path vector.
   * @param previousTanTheta The tangent of the theta value of the previous turn. Theta is defined as the (acute)
   * angle between either `fromTrack` or `toTrack` and the great circle passing through the turn vertex (where the two
   * tracks meet) and the center of the turn. If this value is defined and `isRestrictedByPrevTurn` is `true`, the
   * anticipation of both turns will be adjusted if necessary such that the turns do not overlap if they share a common
   * flight path vector. If the value is undefined, the anticipation of the current turn will be restricted by the
   * previous turn, if necessary, without changing the anticipation of the previous turn.
   * @returns The index of the last leg in the sequence for which a turn ending on that leg was computed.
   */
  private computeTrackTrackTurn(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    fromTrack: CircleVector,
    toTrack: CircleVector,
    desiredTurnAnticipationTurnRadius: number,
    desiredCourseReversalTurnRadius: number,
    isRestrictedByPrevTurn: boolean,
    previousTanTheta?: number,
  ): number {
    let lastComputedIndex = toIndex;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fromLegCalc = legs[fromIndex].calculated!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toLegCalc = legs[toIndex].calculated!;

    const turnVertexPoint = FlightPathTurnCalculator.geoPointCache[0].set(fromTrack.endLat, fromTrack.endLon);
    const fromTrackBearing = turnVertexPoint.bearingFrom(fromTrack.startLat, fromTrack.startLon);
    const toTrackBearing = turnVertexPoint.bearingTo(toTrack.endLat, toTrack.endLon);
    const trackAngleDiff = Math.abs(NavMath.diffAngle(fromTrackBearing, toTrackBearing));

    if (
      trackAngleDiff < 1
      || fromTrack.distance === 0
      || toTrack.distance === 0
      || !turnVertexPoint.equals(toTrack.startLat, toTrack.startLon, 1e-5)
    ) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return lastComputedIndex;
    }

    if (trackAngleDiff > 175) {
      return this.computeTrackTrackCourseReversal(
        legs, fromIndex, toIndex,
        fromTrack, toTrack,
        fromTrackBearing, toTrackBearing,
        desiredTurnAnticipationTurnRadius, desiredCourseReversalTurnRadius
      );
    }

    const theta = (180 - trackAngleDiff) / 2;
    const tanTheta = Math.tan(theta * Avionics.Utils.DEG2RAD);
    // D is defined as the distance from the start/end of the turn to the turn vertex along the from- and to- tracks
    // (i.e. the anticipation).
    const desiredD = Math.asin(Math.tan(UnitType.METER.convertTo(desiredTurnAnticipationTurnRadius, UnitType.GA_RADIAN)) / tanTheta);

    let restrictedD = Infinity;
    if (isRestrictedByPrevTurn) {
      if (previousTanTheta === undefined) {
        // Check to see if there is a ingress transition on the from leg and if it shares a common flight path vector
        // with the one involved in the turn currently being calculated.
        if (fromLegCalc.ingress.length > 0 && fromLegCalc.ingressJoinIndex === fromLegCalc.flightPath.length - 1) {
          const lastIngressVector = fromLegCalc.ingress[fromLegCalc.ingress.length - 1];
          restrictedD = turnVertexPoint.distance(lastIngressVector.endLat, lastIngressVector.endLon);
        }
      } else {
        // D is restricted by a previous turn. The values of D_current and D_previous are restricted such that their sum
        // cannot exceed the total length of their shared vector (the from- vector for this turn). Therefore, we set the
        // maximum value of D_current such that at D_current(max), the radius of this turn equals the radius of the
        // previous turn. This will maximize min(radius_current, radius_prev).
        const tanThetaRatio = previousTanTheta / tanTheta;
        const totalD = UnitType.METER.convertTo(fromTrack.distance, UnitType.GA_RADIAN);
        const cosTotalD = Math.cos(totalD);
        let prevTurnRestrictedD = Math.acos((tanThetaRatio * cosTotalD + 1) / Math.sqrt(tanThetaRatio * tanThetaRatio + 2 * tanThetaRatio * cosTotalD + 1));
        if (prevTurnRestrictedD > totalD) {
          prevTurnRestrictedD = Math.PI - prevTurnRestrictedD;
        }
        restrictedD = prevTurnRestrictedD;
      }
    }

    // We need to scan forward in the leg sequence to compute any restrictions on D imposed by later turns.
    if (toLegCalc.flightPath.length === 1 && (toLegCalc.egress.length === 0 || BitFlags.isAll(toLegCalc.egress[0].flags, FlightPathVectorFlags.LegToLegTurn))) {
      const nextLegCalc = legs[toIndex + 1]?.calculated;
      const nextVector = nextLegCalc?.flightPath[0];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (nextVector && (nextLegCalc!.ingress.length === 0 || BitFlags.isAll(nextLegCalc!.ingress[0].flags, FlightPathVectorFlags.LegToLegTurn))) {
        let nextTurnRestrictedD: number;
        if (!FlightPathUtils.isVectorGreatCircle(nextVector)) {
          nextTurnRestrictedD = UnitType.METER.convertTo(toTrack.distance / 2, UnitType.GA_RADIAN);
        } else {
          // if the next turn to share a vector with this turn is to a track vector, we need to recursively compute
          // future turns since the next turn may be restricted by the turn after that, etc.
          lastComputedIndex = this.computeTrackTrackTurn(
            legs, toIndex, toIndex + 1,
            toTrack, nextVector,
            desiredTurnAnticipationTurnRadius, desiredCourseReversalTurnRadius,
            true,
            tanTheta
          );
          turnVertexPoint.set(fromTrack.endLat, fromTrack.endLon);
          const nextTurnEgress = toLegCalc.egress[0];
          nextTurnRestrictedD = nextTurnEgress ? turnVertexPoint.distance(nextTurnEgress.startLat, nextTurnEgress.startLon) : Infinity;
        }
        restrictedD = Math.min(restrictedD, nextTurnRestrictedD);
      }
    }

    const D = Math.min(
      desiredD,
      restrictedD,
      UnitType.METER.convertTo(fromTrack.distance, UnitType.GA_RADIAN),
      UnitType.METER.convertTo(toTrack.distance, UnitType.GA_RADIAN)
    );

    // distance from the turn vertex to the center of the turn
    const H = Math.atan(Math.tan(D) / Math.cos(theta * Avionics.Utils.DEG2RAD));
    const turnRadiusRad = desiredD === D
      ? UnitType.METER.convertTo(desiredTurnAnticipationTurnRadius, UnitType.GA_RADIAN)
      : Math.atan(Math.sin(D) * tanTheta);

    if (D <= GeoPoint.EQUALITY_TOLERANCE || turnRadiusRad <= GeoPoint.EQUALITY_TOLERANCE) {
      // prevent zero-length turns
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return lastComputedIndex;
    }

    const turnDirection = NavMath.getTurnDirection(fromTrackBearing, toTrackBearing);
    const turnBisectorBearing = toTrackBearing + theta * (turnDirection === 'left' ? -1 : 1);
    const turnCenter = turnVertexPoint.offset(turnBisectorBearing, H, FlightPathTurnCalculator.geoPointCache[1]);

    const fromTrackPath = FlightPathTurnCalculator.geoCircleCache[0].setAsGreatCircle(turnVertexPoint, fromTrackBearing);
    const toTrackPath = FlightPathTurnCalculator.geoCircleCache[1].setAsGreatCircle(turnVertexPoint, toTrackBearing);

    const turnStart = fromTrackPath.closest(turnCenter, FlightPathTurnCalculator.geoPointCache[2]);
    const turnMiddle = turnVertexPoint.offset(turnBisectorBearing, H - turnRadiusRad, FlightPathTurnCalculator.geoPointCache[3]);
    const turnEnd = toTrackPath.closest(turnCenter, FlightPathTurnCalculator.geoPointCache[4]);

    this.setAnticipatedTurn(
      fromLegCalc, toLegCalc,
      turnDirection, UnitType.GA_RADIAN.convertTo(turnRadiusRad, UnitType.METER),
      turnCenter, turnStart, turnMiddle, turnEnd
    );

    return lastComputedIndex;
  }

  /**
   * Computes a leg-to-leg course reversal.
   * @param legs The sequence of legs to which the turn belongs.
   * @param fromIndex The index of the leg on which the turn begins.
   * @param toIndex The index of the leg on which the turn ends.
   * @param fromTrack The track vector on which the turn begins.
   * @param toTrack The track vector on which the turn ends.
   * @param fromTrackBearing The true course bearing of the track vector on which the turn begins, at the end of the vector.
   * @param toTrackBearing The true course bearing of the track vector on which the turn ends, at the beginning of the vector.
   * @param desiredTurnAnticipationTurnRadius The desired turn anticipation turn radius, in meters.
   * @param desiredCourseReversalTurnRadius The desired course reversal turn radius, in meters.
   * @returns The index of the last leg in the sequence for which a turn ending on that leg was computed.
   */
  private computeTrackTrackCourseReversal(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    fromTrack: CircleVector,
    toTrack: CircleVector,
    fromTrackBearing: number,
    toTrackBearing: number,
    desiredTurnAnticipationTurnRadius: number,
    desiredCourseReversalTurnRadius: number,
  ): number {
    let lastComputedIndex = toIndex;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fromLegCalc = legs[fromIndex].calculated!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toLegCalc = legs[toIndex].calculated!;

    const turnVertexPoint = FlightPathTurnCalculator.geoPointCache[0].set(fromTrack.endLat, fromTrack.endLon);

    fromLegCalc.egress.length = 0;
    fromLegCalc.egressJoinIndex = -1;

    // Let the course reversal "cut"

    let courseReversalEndDistance = UnitType.METER.convertTo(toLegCalc.flightPath[0].distance, UnitType.GA_RADIAN);
    if (toLegCalc.flightPath.length === 1 && (toLegCalc.egress.length === 0 || BitFlags.isAll(toLegCalc.egress[0].flags, FlightPathVectorFlags.LegToLegTurn))) {
      const nextLegCalc = legs[toIndex + 1]?.calculated;
      const nextVector = nextLegCalc?.flightPath[0];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (nextVector && (nextLegCalc!.ingress.length === 0 || BitFlags.isAll(nextLegCalc!.ingress[0].flags, FlightPathVectorFlags.LegToLegTurn))) {
        if (!FlightPathUtils.isVectorGreatCircle(nextVector)) {
          courseReversalEndDistance = UnitType.METER.convertTo(toTrack.distance / 2, UnitType.GA_RADIAN);
        } else {
          // if the next turn to share a vector with this turn is to a track vector, we need to recursively compute
          // future turns since the next turn may be restricted by the turn after that, etc.
          lastComputedIndex = this.computeTrackTrackTurn(
            legs, toIndex, toIndex + 1,
            toTrack, nextVector,
            desiredTurnAnticipationTurnRadius, desiredCourseReversalTurnRadius,
            false
          );
          turnVertexPoint.set(fromTrack.endLat, fromTrack.endLon);
          const nextTurnEgress = toLegCalc.egress[0];
          courseReversalEndDistance = nextTurnEgress ? turnVertexPoint.distance(nextTurnEgress.startLat, nextTurnEgress.startLon) : courseReversalEndDistance;
        }
      }
    }

    const fromTrackPath = FlightPathTurnCalculator.geoCircleCache[0].setAsGreatCircle(turnVertexPoint, fromTrackBearing);
    const toTrackPath = FlightPathTurnCalculator.geoCircleCache[1].setAsGreatCircle(turnVertexPoint, toTrackBearing);

    const courseReversalEnd = toTrackPath.offsetDistanceAlong(turnVertexPoint, courseReversalEndDistance, FlightPathTurnCalculator.vector3Cache[0]);
    const turnDirection = NavMath.diffAngle(toTrackBearing, fromTrackBearing) < 0 ? 'left' : 'right';

    const length = this.procTurnBuilder.build(
      toLegCalc.ingress, 0,
      turnVertexPoint, fromTrackPath,
      courseReversalEnd, toTrackPath,
      fromTrackBearing + 45 * (turnDirection === 'left' ? -1 : 1), desiredCourseReversalTurnRadius, turnDirection,
      fromTrackBearing, toTrackBearing,
      FlightPathVectorFlags.LegToLegTurn | FlightPathVectorFlags.CourseReversal
    );
    toLegCalc.ingress.length = length;
    toLegCalc.ingressJoinIndex = 0;

    return lastComputedIndex;
  }

  /**
   * Calculates a leg to leg turn between an arc vector and a track vector.
   * @param legs The sequence of legs to which the turn belongs.
   * @param fromIndex The index of the leg on which the turn begins.
   * @param toIndex The index of the leg on which the turn ends.
   * @param arc The arc vector.
   * @param track The track vector.
   * @param isArcFirst Whether the arc vector precedes the track vector (i.e. whether the arc vector is the vector on
   * which the turn begins).
   * @param desiredTurnRadius The desired turn radius, in meters.
   * @returns the index of the last leg in the sequence for which a turn ending on that leg was computed.
   */
  private computeArcTrackTurn(
    legs: LegDefinition[],
    fromIndex: number,
    toIndex: number,
    arc: CircleVector,
    track: CircleVector,
    isArcFirst: boolean,
    desiredTurnRadius: number
  ): number {
    const fromLeg = legs[fromIndex];
    const toLeg = legs[toIndex];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fromLegCalc = fromLeg.calculated!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toLegCalc = toLeg.calculated!;

    if (arc.distance === 0 || track.distance === 0) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return toIndex;
    }

    /*
     * Theory: find the center of the turn circle. Since the turn circle is tangent to both the arc circle and the
     * great circle defined by the track path, it follows that the center of the turn circle lies at a distance equal
     * to the turn radius from both the arc circle and great circle. Therefore, we can find the center by applying a
     * radial offset equal to +/-[turn radius] to both the arc circle and great circle (the sign of the offset depends
     * on the direction of the arc and track path) and solving for the points of intersection between the offset
     * circles.
     */

    const fromVector = isArcFirst ? arc : track;
    const toVector = isArcFirst ? track : arc;

    const fromVectorEndPoint = FlightPathTurnCalculator.geoPointCache[0].set(fromVector.endLat, fromVector.endLon);
    const toVectorStartPoint = FlightPathTurnCalculator.geoPointCache[1].set(toVector.startLat, toVector.startLon);

    const areLegsContinuous = fromVectorEndPoint.equals(toVectorStartPoint, 1e-5);

    if (!areLegsContinuous) {
      // The from-leg does not end within ~60 meters of the start of the to-leg.

      let shouldQuit = true;

      // Either the from- or to- leg is an AF or RF leg. These legs often end up discontinuous with the preceding or
      // proceeding leg due to the arcs being slightly offset from the intended origin and/or terminator fixes.
      if (
        fromLeg.leg.type === LegType.AF
        || fromLeg.leg.type === LegType.RF
        || toLeg.leg.type === LegType.AF
        || toLeg.leg.type === LegType.RF
      ) {
        shouldQuit = false;
      }

      if (shouldQuit) {
        return toIndex;
      }
    }

    const fromVectorEndBearing = FlightPathUtils.getVectorFinalCourse(fromVector);
    const toVectorStartBearing = FlightPathUtils.getVectorInitialCourse(toVector);
    const vectorBearingDiff = Math.abs(NavMath.diffAngle(fromVectorEndBearing, toVectorStartBearing));
    if (vectorBearingDiff < 1) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return toIndex;
    }

    // Define the circles

    const arcPath = FlightPathUtils.setGeoCircleFromVector(arc, FlightPathTurnCalculator.geoCircleCache[0]);
    const arcCenter = FlightPathUtils.getTurnCenterFromCircle(arcPath, FlightPathTurnCalculator.geoPointCache[2]);
    const arcRadiusRad = FlightPathUtils.getTurnRadiusFromCircle(arcPath);
    const arcDirection = FlightPathUtils.getTurnDirectionFromCircle(arcPath);

    const arcCircle = FlightPathTurnCalculator.geoCircleCache[1].set(arcCenter, arcRadiusRad);
    const trackPath = FlightPathUtils.setGeoCircleFromVector(track, FlightPathTurnCalculator.geoCircleCache[2]);
    const trackPathNormalPoint = FlightPathTurnCalculator.geoPointCache[3].setFromCartesian(trackPath.center);

    const fromVectorPath = isArcFirst ? arcPath : trackPath;
    const toVectorPath = isArcFirst ? trackPath : arcPath;

    // calculate whether the arc intersects the track; if they don't (or if they are entirely coincident), something
    // has gone wrong!
    const arcTrackIntersections = FlightPathTurnCalculator.intersectionVecArrayCache;
    const arcTrackIntersectionCount = arcCircle.intersection(trackPath, arcTrackIntersections);
    if (arcTrackIntersectionCount === 0 || isNaN(arcTrackIntersectionCount)) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return toIndex;
    }

    const fromVectorEndVec = fromVectorEndPoint.toCartesian(FlightPathTurnCalculator.vector3Cache[0]);
    const toVectorStartVec = toVectorStartPoint.toCartesian(FlightPathTurnCalculator.vector3Cache[1]);

    const fromVectorHalfDistanceRad = UnitType.METER.convertTo(fromVector.distance / 2, UnitType.GA_RADIAN);
    const toVectorHalfDistanceRad = UnitType.METER.convertTo(toVector.distance / 2, UnitType.GA_RADIAN);

    const intersectionPoint = FlightPathTurnCalculator.geoPointCache[4];
    const intersectionVec = FlightPathTurnCalculator.vector3Cache[2];
    let intersectionFromVectorEndOffset = 0;
    let intersectionToVectorStartOffset = 0;

    const turnDirection = NavMath.getTurnDirection(fromVectorEndBearing, toVectorStartBearing);
    let isInside: boolean;
    let turnRadiusRad: number;
    let arcCircleOffsetSign: 1 | -1;
    let trackPathOffsetSign: 1 | -1;
    if (arcTrackIntersectionCount === 1) {
      // The arc circle and track path are tangent.

      if (areLegsContinuous) {
        Vec3Math.copy(fromVectorEndVec, intersectionVec);
      } else {
        // The from-leg does not end within ~60 meters of the start of the to-leg.

        Vec3Math.copy(arcTrackIntersections[0], intersectionVec);

        intersectionFromVectorEndOffset = FlightPathTurnCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, intersectionVec);
        intersectionToVectorStartOffset = FlightPathTurnCalculator.getAlongCircleOffset(toVectorPath, intersectionVec, toVectorStartVec);

        if (!this.isArcTrackIntersectionValid(
          intersectionVec,
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersectionFromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersectionToVectorStartOffset
        )) {
          this.setEmptyTurn(fromLegCalc, toLegCalc);
          return toIndex;
        }
      }

      const isForward = Math.abs(NavMath.diffAngle(fromVectorEndBearing, toVectorStartBearing)) < 90;
      if (isForward) {
        if (intersectionFromVectorEndOffset === 0 && intersectionToVectorStartOffset === 0) {
          this.setEmptyTurn(fromLegCalc, toLegCalc);
        } else {
          if (intersectionFromVectorEndOffset !== 0) {
            // The intersection is not coincident with the end of the from-vector. The egress path will start 1
            // nautical mile before the intersection point or at the end of the from-vector, whichever comes
            // earlier (without going past the mid-point of the from-vector) and follow the from-vector path.
            if (fromVectorHalfDistanceRad + intersectionFromVectorEndOffset <= 1e-5) {
              // The intersection is at the mid-point of the from-vector.
              this.setAnticipatedTurnEgress(fromLegCalc, fromVectorPath, intersectionVec, intersectionVec);
            } else {
              const egressStartVec = fromVectorPath.offsetDistanceAlong(
                intersectionVec,
                -Math.min(
                  0.00029,
                  Math.max(0, intersectionFromVectorEndOffset),
                  fromVectorHalfDistanceRad + intersectionFromVectorEndOffset
                ),
                FlightPathTurnCalculator.vector3Cache[3],
                Math.PI
              );
              this.setAnticipatedTurnEgress(fromLegCalc, fromVectorPath, egressStartVec, intersectionVec);
            }
          }

          if (intersectionToVectorStartOffset !== 0) {
            // The intersection is not coincident with the start of the to-vector. The ingress path will end 1
            // nautical mile after the intersection point or at the start of the to-vector, whichever comes
            // later (without going past the mid-point of the to-vector) and follow the to-vector path.
            if (toVectorHalfDistanceRad + intersectionToVectorStartOffset <= 1e-5) {
              // The intersection is at the mid-point of the to-vector.
              this.setAnticipatedTurnIngress(toLegCalc, toVectorPath, intersectionVec, intersectionVec);
            } else {
              const ingressEndVec = toVectorPath.offsetDistanceAlong(
                intersectionVec,
                Math.min(
                  0.00029,
                  Math.max(0, intersectionToVectorStartOffset),
                  toVectorHalfDistanceRad + intersectionToVectorStartOffset
                ),
                FlightPathTurnCalculator.vector3Cache[3],
                Math.PI
              );
              this.setAnticipatedTurnIngress(toLegCalc, toVectorPath, intersectionVec, ingressEndVec);
            }
          }
        }

        return toIndex;
      } else {
        intersectionPoint.setFromCartesian(intersectionVec);

        // in this case, the plane effectively needs to make a 180...
        isInside = false;
        turnRadiusRad = UnitType.METER.convertTo(desiredTurnRadius, UnitType.GA_RADIAN);
        arcCircleOffsetSign = 1;
        trackPathOffsetSign = trackPath.encircles(arcCenter) ? -1 : 1;
      }
    } else {
      // The arc circle and track path are secant.

      let arcStartVec: Float64Array;
      let arcEndVec: Float64Array;

      let fromVectorIntersectionBearing: number;
      let toVectorIntersectionBearing: number;

      if (areLegsContinuous) {
        intersectionPoint.set(fromVectorEndPoint);
        Vec3Math.copy(fromVectorEndVec, intersectionVec);

        arcStartVec = GeoPoint.sphericalToCartesian(arc.startLat, arc.startLon, FlightPathTurnCalculator.vector3Cache[3]);
        arcEndVec = GeoPoint.sphericalToCartesian(arc.endLat, arc.endLon, FlightPathTurnCalculator.vector3Cache[4]);

        fromVectorIntersectionBearing = fromVectorEndBearing;
        toVectorIntersectionBearing = toVectorStartBearing;
      } else {
        const intersection0FromVectorEndOffset = FlightPathTurnCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, arcTrackIntersections[0]);
        const intersection0ToVectorStartOffset = FlightPathTurnCalculator.getAlongCircleOffset(toVectorPath, arcTrackIntersections[0], toVectorStartVec);

        const intersection1FromVectorEndOffset = FlightPathTurnCalculator.getAlongCircleOffset(fromVectorPath, fromVectorEndVec, arcTrackIntersections[1]);
        const intersection1ToVectorStartOffset = FlightPathTurnCalculator.getAlongCircleOffset(toVectorPath, arcTrackIntersections[1], toVectorStartVec);

        const isIntersection0Valid = this.isArcTrackIntersectionValid(
          arcTrackIntersections[0],
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersection0FromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersection0ToVectorStartOffset
        );
        const isIntersection1Valid = this.isArcTrackIntersectionValid(
          arcTrackIntersections[1],
          fromVectorPath, fromVectorEndVec, fromVectorHalfDistanceRad, intersection1FromVectorEndOffset,
          toVectorPath, toVectorStartVec, toVectorHalfDistanceRad, intersection1ToVectorStartOffset
        );

        if (!isIntersection0Valid && !isIntersection1Valid) {
          this.setEmptyTurn(fromLegCalc, toLegCalc);
          return toIndex;
        }

        let intersectionIndex: 0 | 1;

        if (!isIntersection0Valid) {
          intersectionIndex = 1;
        } else if (!isIntersection1Valid) {
          intersectionIndex = 0;
        } else {
          // Both intersections are valid. We will bias toward intersections that lie after the end of the from-vector
          // and before the start of the to-vector.

          if (intersection0FromVectorEndOffset + intersection0ToVectorStartOffset >= intersection1FromVectorEndOffset + intersection1ToVectorStartOffset) {
            intersectionIndex = 0;
          } else {
            intersectionIndex = 1;
          }
        }

        if (intersectionIndex === 0) {
          Vec3Math.copy(arcTrackIntersections[0], intersectionVec);
          intersectionFromVectorEndOffset = intersection0FromVectorEndOffset;
          intersectionToVectorStartOffset = intersection0ToVectorStartOffset;
        } else if (isIntersection1Valid) {
          Vec3Math.copy(arcTrackIntersections[1], intersectionVec);
          intersectionFromVectorEndOffset = intersection1FromVectorEndOffset;
          intersectionToVectorStartOffset = intersection1ToVectorStartOffset;
        }

        intersectionPoint.setFromCartesian(intersectionVec);

        if (isArcFirst) {
          arcStartVec = GeoPoint.sphericalToCartesian(arc.startLat, arc.startLon, FlightPathTurnCalculator.vector3Cache[3]);
          arcEndVec = intersectionVec;
        } else {
          arcStartVec = intersectionVec;
          arcEndVec = GeoPoint.sphericalToCartesian(arc.endLat, arc.endLon, FlightPathTurnCalculator.vector3Cache[4]);
        }

        fromVectorIntersectionBearing = fromVectorPath.bearingAt(intersectionVec, Math.PI);
        toVectorIntersectionBearing = toVectorPath.bearingAt(intersectionVec, Math.PI);
      }

      const arcStartRadial = arcCircle.bearingAt(arcStartVec, Math.PI) + 90;
      const arcEndRadial = arcCircle.bearingAt(arcEndVec, Math.PI) + 90;

      const desiredTurnRadiusRad = UnitType.METER.convertTo(desiredTurnRadius, UnitType.GA_RADIAN);

      isInside = isArcFirst
        ? Math.abs(NavMath.diffAngle(intersectionPoint.bearingFrom(arcCenter), toVectorIntersectionBearing)) >= 90
        : Math.abs(NavMath.diffAngle(intersectionPoint.bearingFrom(arcCenter), fromVectorIntersectionBearing)) < 90;

      /**
       * Now we must calculate the maximum allowed turn radius such that the turn does not start or end beyond the
       * limits of the arc or track. First, we convert the track limit to a pseudo-arc limit, then take the more
       * restrictive of the pseudo-arc limit and the actual arc limit. This maximally restrictive arc limit is then
       * used to compute the turn radius that would result in a turn which has an endpoint exactly at the limit.
       */

      const turnVertexRadialNormal = GeoCircle.getGreatCircleNormal(arcCenter, intersectionVec, FlightPathTurnCalculator.vector3Cache[5]);
      // If the turn is inside the arc, then clamp track limit distance to half the length of the track path within the
      // arc, since that is the point at which turn radius is maximized.
      const maxTrackLimitDistance = isInside
        ? Math.atan(Math.abs(Vec3Math.dot(trackPath.center, turnVertexRadialNormal)) * Math.tan(arcRadiusRad))
        : Infinity;
      const trackLimitPoint = FlightPathTurnCalculator.geoPointCache[5];
      if (isArcFirst) {
        const trackLimitDistance = Math.min(toVectorHalfDistanceRad + intersectionToVectorStartOffset, maxTrackLimitDistance);
        intersectionPoint.offset(toVectorStartBearing, trackLimitDistance, trackLimitPoint);
      } else {
        const trackLimitDistance = Math.min(fromVectorHalfDistanceRad + intersectionFromVectorEndOffset, maxTrackLimitDistance);
        intersectionPoint.offset(fromVectorEndBearing + 180, trackLimitDistance, trackLimitPoint);
      }
      // the great circle which passes through the center of the arc and is perpendicular to the track
      const trackPerpendicularDiameter = FlightPathTurnCalculator.geoCircleCache[3].setAsGreatCircle(trackPath.center, arcCircle.center);
      const antipodes = FlightPathTurnCalculator.intersectionVecArrayCache;
      trackPerpendicularDiameter.intersection(arcCircle, antipodes);

      // Compute the great circle which passes through the appropriate antipode and the track limit endpoint. The
      // intersection of this great circle with the arc that is NOT the antipode is the pseudo-arc limit endpoint.
      const intersectingPath = FlightPathTurnCalculator.geoCircleCache[4].setAsGreatCircle(arcDirection === 'left' ? antipodes[0] : antipodes[1], trackLimitPoint);
      const arcIntersections = FlightPathTurnCalculator.intersectionGeoPointArrayCache;
      const numArcIntersections = intersectingPath.intersectionGeoPoint(arcCircle, arcIntersections);

      let arcLimitAngularWidth = Infinity;
      if (numArcIntersections > 0) {
        const pseudoArcLimitPoint = arcIntersections[0];
        const pseudoArcLimitPointAngle = arcCenter.bearingTo(pseudoArcLimitPoint);
        arcLimitAngularWidth = Math.abs(NavMath.diffAngle((isArcFirst ? arcEndRadial : arcStartRadial), pseudoArcLimitPointAngle));
      }

      let arcTurnRadiusLimit = 0;
      // the angular width of the portion of the arc path from the intersection to the mid-point of the arc vector
      const arcMidPointAngularWidth = Avionics.Utils.RAD2DEG * (isArcFirst
        ? fromVectorPath.angularWidth(fromVectorHalfDistanceRad + intersectionFromVectorEndOffset)
        : toVectorPath.angularWidth(toVectorHalfDistanceRad + intersectionToVectorStartOffset));
      arcLimitAngularWidth = Math.min(arcLimitAngularWidth, arcMidPointAngularWidth);
      if (arcLimitAngularWidth > 0) {
        const arcLimitPointAngle = (isArcFirst ? arcEndRadial : arcStartRadial) + arcLimitAngularWidth * ((arcDirection === 'left') === isArcFirst ? 1 : -1);
        const arcLimitPoint = arcCenter.offset(arcLimitPointAngle, arcRadiusRad, FlightPathTurnCalculator.geoPointCache[5]);
        const arcLimitRadialPath = FlightPathTurnCalculator.geoCircleCache[3].setAsGreatCircle(arcCenter, arcLimitPoint);
        // the angle between the radial to the arc endpoint and the track path (directed away from the arc at the point of intersection)
        const theta = Math.acos(Vec3Math.dot(arcLimitRadialPath.center, trackPath.center) * (isArcFirst === isInside ? -1 : 1));
        if (theta >= Math.PI / 2) {
          if (isInside) {
            const d = Math.asin(Math.sin(Math.acos(Math.abs(Vec3Math.dot(trackPath.center, turnVertexRadialNormal)))) * Math.sin(arcRadiusRad));
            arcTurnRadiusLimit = (arcRadiusRad - d) / 2;
          } else {
            arcTurnRadiusLimit = Infinity;
          }
        } else {
          const arcLimitRadialTrackIntersections = FlightPathTurnCalculator.intersectionVecArrayCache;
          arcLimitRadialPath.intersection(trackPath, arcLimitRadialTrackIntersections);
          const arcLimitPointVec = arcLimitPoint.toCartesian(FlightPathTurnCalculator.vector3Cache[5]);
          const thresholdNormal = Vec3Math.normalize(
            Vec3Math.cross(arcLimitRadialPath.center, arcLimitPointVec, FlightPathTurnCalculator.vector3Cache[6]),
            FlightPathTurnCalculator.vector3Cache[6]
          );
          const arcLimitRadialTrackIntersection =
            arcLimitRadialTrackIntersections[Vec3Math.dot(arcLimitRadialTrackIntersections[0], thresholdNormal) >= 0 ? 0 : 1];

          // cosine of the distance from the arc endpoint to the intersection of the radial to the arc endpoint and the track path
          const cosD = Vec3Math.dot(arcLimitRadialTrackIntersection, arcLimitPointVec);
          const sinTheta = Math.sin(theta);
          const sign = isInside ? -1 : 1;
          arcTurnRadiusLimit = Math.acos((1 + sinTheta * cosD * sign) / Math.sqrt(1 + 2 * sinTheta * cosD * sign + sinTheta * sinTheta));
        }
      }

      turnRadiusRad = Math.min(desiredTurnRadiusRad, arcTurnRadiusLimit);

      arcCircleOffsetSign = isInside ? -1 : 1;
      trackPathOffsetSign = turnDirection === 'left' ? -1 : 1;
    }

    if (turnRadiusRad <= GeoPoint.EQUALITY_TOLERANCE) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return toIndex;
    }

    const arcCircleOffset = FlightPathTurnCalculator.geoCircleCache[3].set(arcCircle.center, arcCircle.radius + turnRadiusRad * arcCircleOffsetSign);
    const trackPathOffset = FlightPathTurnCalculator.geoCircleCache[4].set(trackPath.center, trackPath.radius + turnRadiusRad * trackPathOffsetSign);

    const intersections = FlightPathTurnCalculator.intersectionGeoPointArrayCache;
    const intersectionCount = arcCircleOffset.intersectionGeoPoint(trackPathOffset, FlightPathTurnCalculator.intersectionGeoPointArrayCache);
    if (intersectionCount === 0) {
      this.setEmptyTurn(fromLegCalc, toLegCalc);
      return toIndex;
    }

    let turnCenter;
    if (intersectionCount === 2) {
      if (arcTrackIntersectionCount === 1 || intersectionPoint.distance(intersections[0]) >= intersectionPoint.distance(intersections[1])) {
        turnCenter = intersections[1];
      } else {
        turnCenter = intersections[0];
      }
    } else {
      turnCenter = intersections[0];
    }

    const arcTangentBearing = (turnCenter.bearingTo(arcCenter) + (arcCircleOffsetSign === 1 ? 0 : 180)) % 360;
    const trackTangentBearing = (turnCenter.bearingTo(trackPathNormalPoint) + (trackPathOffsetSign === 1 ? 0 : 180)) % 360;

    const turnStartBearing = isArcFirst ? arcTangentBearing : trackTangentBearing;
    const turnEndBearing = isArcFirst ? trackTangentBearing : arcTangentBearing;

    let turnAngularDelta = turnEndBearing - turnStartBearing;
    if (turnDirection === 'right' && turnEndBearing <= turnStartBearing) {
      turnAngularDelta += 360;
    } else if (turnDirection === 'left' && turnEndBearing >= turnStartBearing) {
      turnAngularDelta -= 360;
    }
    const turnMiddleBearing = ((turnStartBearing + turnAngularDelta / 2) + 360) % 360;

    const turnStart = turnCenter.offset(turnStartBearing, turnRadiusRad, FlightPathTurnCalculator.geoPointCache[0]);
    const turnEnd = turnCenter.offset(turnEndBearing, turnRadiusRad, FlightPathTurnCalculator.geoPointCache[1]);
    const turnMiddle = turnCenter.offset(turnMiddleBearing, turnRadiusRad, FlightPathTurnCalculator.geoPointCache[2]);

    const turnRadiusMeters = UnitType.GA_RADIAN.convertTo(turnRadiusRad, UnitType.METER);

    this.setAnticipatedTurn(
      fromLegCalc, toLegCalc,
      turnDirection, turnRadiusMeters,
      turnCenter, turnStart, turnMiddle, turnEnd,
      areLegsContinuous
    );

    // If the from- and to- legs are not continuous, then we need to check if we need to extend the turn anticipation
    // path beyond the turn vector to join the from- and to- vectors. If the legs are continuous, we don't need to
    // check because the turn vector is guaranteed to begin before the end of the from-vector and end after the start
    // of the to-vector.
    if (!areLegsContinuous) {
      const intersectionTurnStartOffset = FlightPathTurnCalculator.getAlongCircleOffset(fromVectorPath, turnStart, intersectionVec);
      const intersectionTurnEndOffset = FlightPathTurnCalculator.getAlongCircleOffset(toVectorPath, intersectionVec, turnEnd);

      if (intersectionTurnStartOffset > intersectionFromVectorEndOffset + 1e-5) {
        // The turn begins after the end of the from-vector. We need to join the turn vector to the end of the
        // from-vector.

        Object.assign(fromLegCalc.egress[1] ??= FlightPathUtils.createEmptyCircleVector(), fromLegCalc.egress[0]);

        FlightPathUtils.setCircleVector(
          fromLegCalc.egress[0],
          fromVectorPath,
          fromVectorEndPoint,
          turnStart,
          fromLegCalc.egress[0].flags
        );

        fromLegCalc.egress.length = 2;
      } else {
        fromLegCalc.egress.length = 1;
      }

      if (intersectionTurnEndOffset < intersectionToVectorStartOffset - 1e-5) {
        // The turn ends before the start of the to-vector. We need to join the turn vector to the start of the
        // to-vector.

        toLegCalc.ingress[1] ??= FlightPathUtils.createEmptyCircleVector();

        FlightPathUtils.setCircleVector(
          toLegCalc.ingress[1],
          toVectorPath,
          turnEnd,
          toVectorStartPoint,
          toLegCalc.ingress[0].flags
        );

        toLegCalc.ingress.length = 2;
      } else {
        toLegCalc.ingress.length = 1;
      }
    }

    return toIndex;
  }

  private static readonly isArcTrackIntersectionValidCache = {
    vec3: [Vec3Math.create(), Vec3Math.create()]
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
  private isArcTrackIntersectionValid(
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
      FlightPathTurnCalculator.isArcTrackIntersectionValidCache.vec3[0],
      Math.PI
    );
    const toVectorMidVec = toVectorPath.offsetDistanceAlong(
      toVectorStart,
      toVectorHalfDistance,
      FlightPathTurnCalculator.isArcTrackIntersectionValidCache.vec3[1],
      Math.PI
    );

    return (
      Math.abs(intersectionFromVectorEndOffset) <= 2.9e-4
      && Math.abs(intersectionToVectorStartOffset) <= 2.9e-4
      && FlightPathUtils.isPointAlongArc(fromVectorPath, fromVectorMidVec, Math.PI, intersection)
      && !FlightPathUtils.isPointAlongArc(toVectorPath, toVectorMidVec, Math.PI, intersection)
    );
  }

  /**
   * Removes all ingress and egress flight path vectors from a pair of legs at their junction.
   * @param fromLegCalc The calculations for the leg on which the turn begins.
   * @param toLegCalc The calculations for the leg on which the turn ends.
   */
  private setEmptyTurn(fromLegCalc: LegCalculations, toLegCalc: LegCalculations): void {
    fromLegCalc.egress.length = 0;
    fromLegCalc.egressJoinIndex = -1;
    toLegCalc.ingress.length = 0;
    toLegCalc.ingressJoinIndex = -1;
  }

  private static readonly setAnticipatedTurnCache = {
    geoPoint: [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)],
    geoCircle: [new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)]
  };

  /**
   * Adds flight path vectors to a pair of legs for an anticipated leg to leg turn.
   * @param fromLegCalc The calculations for the leg on which the turn begins.
   * @param toLegCalc The calculations for the leg on which the turn ends.
   * @param direction The direction of the turn.
   * @param radius The radius of the turn, in meters.
   * @param center The location of the center of the turn.
   * @param start The location of the start of the turn.
   * @param middle The location of the midpoint of the turn.
   * @param end The location of the end of the turn.
   * @param setIngressEgressArrayLengths Whether to set the ingress and egress vector array lengths to 1. Defaults to
   * `true`.
   */
  private setAnticipatedTurn(
    fromLegCalc: LegCalculations,
    toLegCalc: LegCalculations,
    direction: VectorTurnDirection,
    radius: number,
    center: ReadonlyFloat64Array | LatLonInterface,
    start: ReadonlyFloat64Array | LatLonInterface,
    middle: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    setIngressEgressArrayLengths = true
  ): void {
    const circle = FlightPathUtils.getTurnCircle(
      center, UnitType.METER.convertTo(radius, UnitType.GA_RADIAN), direction,
      FlightPathTurnCalculator.setAnticipatedTurnCache.geoCircle[0]
    );

    this.setAnticipatedTurnEgress(fromLegCalc, circle, start, middle, setIngressEgressArrayLengths);
    this.setAnticipatedTurnIngress(toLegCalc, circle, middle, end, setIngressEgressArrayLengths);
  }

  /**
   * Adds an egress flight path vector to a leg for an anticipated leg to leg turn.
   * @param legCalc The calculations for the leg on which the turn begins.
   * @param circle The geo circle describing the turn path.
   * @param start The location of the start of the turn.
   * @param end The location of the end of the egress portion of the turn.
   * @param setEgressArrayLength Whether to set the egress vector array length to 1. Defaults to `true`.
   */
  private setAnticipatedTurnEgress(
    legCalc: LegCalculations,
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    setEgressArrayLength = true
  ): void {
    const egress = legCalc.egress[0] ??= FlightPathUtils.createEmptyCircleVector();

    if (setEgressArrayLength) {
      legCalc.egress.length = 1;
    }
    legCalc.egressJoinIndex = legCalc.flightPath.length - 1;

    const egressFlags
      = FlightPathVectorFlags.LegToLegTurn
      | FlightPathVectorFlags.AnticipatedTurn
      | (legCalc.flightPath[legCalc.egressJoinIndex].flags & FlightPathVectorFlags.Fallback);

    FlightPathUtils.setCircleVector(egress, circle, start, end, egressFlags);
  }

  /**
   * Adds an ingress flight path vector to a leg for an anticipated leg to leg turn.
   * @param legCalc The calculations for the leg on which the turn ends.
   * @param circle The geo circle describing the turn path.
   * @param start The location of the start of the ingress portion of the turn.
   * @param end The location of the end of the turn.
   * @param setIngressArrayLength Whether to set the ingress vector array length to 1. Defaults to `true`.
   */
  private setAnticipatedTurnIngress(
    legCalc: LegCalculations,
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    setIngressArrayLength = true
  ): void {
    const ingress = legCalc.ingress[0] ??= FlightPathUtils.createEmptyCircleVector();

    if (setIngressArrayLength) {
      legCalc.ingress.length = 1;
    }

    legCalc.ingressJoinIndex = 0;

    const ingressFlags
      = FlightPathVectorFlags.LegToLegTurn
      | FlightPathVectorFlags.AnticipatedTurn
      | (legCalc.flightPath[legCalc.ingressJoinIndex].flags & FlightPathVectorFlags.Fallback);

    FlightPathUtils.setCircleVector(ingress, circle, start, end, ingressFlags);
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
    const circumference = circle.arcLength(MathUtils.TWO_PI);
    const halfCircumference = circumference / 2;

    return (circle.distanceAlong(reference, query, Math.PI, equalityTolerance) + halfCircumference) % circumference - halfCircumference;
  }
}