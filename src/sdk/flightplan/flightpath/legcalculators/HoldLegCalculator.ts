import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { BitFlags } from '../../../math/BitFlags';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { LegTurnDirection, LegType } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToJoinGreatCircleAtPointVectorBuilder } from '../vectorbuilders/DirectToJoinGreatCircleToPointVectorBuilder';
import { JoinGreatCircleToPointVectorBuilder } from '../vectorbuilders/JoinGreatCircleToPointVectorBuilder';
import { ProcedureTurnVectorBuilder } from '../vectorbuilders/ProcedureTurnVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for hold legs.
 */
export class HoldLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(5, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(5, () => new GeoCircle(Vec3Math.create(), 0));
  private readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly joinGreatCircleToPointVectorBuilder = new JoinGreatCircleToPointVectorBuilder();
  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of HoldLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: FlightPathCalculatorFacilityCache) {
    super(facilityCache, true);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    const leg = legs[calculateIndex];
    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[0], leg.leg.fixIcaoStruct);
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
    const calcs = leg.calculated!;
    const vectors = calcs.flightPath;
    const ingress = calcs.ingress;

    const holdPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[0], leg.leg.fixIcaoStruct);

    if (!holdPos) {
      vectors.length = 0;
      ingress.length = 0;
      calcs.ingressJoinIndex = -1;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0, ingressVectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const oppositeCourse = MathUtils.normalizeAngleDeg(course + 180);

    const inboundPath = this.geoCircleCache[0].setAsGreatCircle(holdPos, course);

    const desiredTurnRadius = state.getDesiredHoldTurnRadius(calculateIndex);

    if (
      state.isDiscontinuity
      && options.calculateDiscontinuityVectors
      && state.currentPosition.isValid()
    ) {
      // If we are starting in a discontinuity and we are configured to calculate discontinuity vectors, then we will
      // build a path to the hold position and insert it into the ingress vectors.

      if (!state.currentPosition.equals(holdPos)) {
        const startPath = state.currentCourse !== undefined
          ? this.geoCircleCache[1].setAsGreatCircle(state.currentPosition, state.currentCourse)
          : undefined;

        ingressVectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
          ingress, ingressVectorIndex,
          state.currentPosition, startPath,
          holdPos, inboundPath,
          desiredTurnRadius,
          undefined,
          FlightPathVectorFlags.Discontinuity, true
        );
      }

      state.currentPosition.set(holdPos);
      state.currentCourse = course;
    } else {
      if (state.isDiscontinuity || !state.currentPosition.isValid()) {
        // We are starting in a discontinuity or the current flight path position is not defined. We will set the
        // current position to the hold fix and the current course to the hold (inbound) course.
        state.currentPosition.set(holdPos);
        state.currentCourse = course;
      } else {
        if (!state.currentPosition.equals(holdPos)) {
          // We are not starting in a discontinuity and the current flight path position is not at the hold fix. We
          // will build a great-circle path from the current position to the hold fix and insert it into the ingress
          // vectors.

          ingressVectorIndex += this.circleVectorBuilder.buildGreatCircle(
            ingress, ingressVectorIndex,
            state.currentPosition, holdPos,
            state.currentCourse
          );

          if (ingressVectorIndex > 0) {
            state.currentCourse = FlightPathUtils.getVectorFinalCourse(ingress[ingressVectorIndex - 1]);
          } else {
            state.currentCourse = undefined;
          }
        }

        state.currentPosition.set(holdPos);
      }
    }

    // If the current flight path course is not defined, then set it to the hold (inbound) course.
    state.currentCourse ??= course;

    let distanceRad = leg.leg.distanceMinutes
      ? UnitType.NMILE.convertTo(leg.leg.distance * (state.planeSpeed.asUnit(UnitType.KNOT) / 60), UnitType.GA_RADIAN)
      : UnitType.METER.convertTo(leg.leg.distance, UnitType.GA_RADIAN);

    const turnDirection = leg.leg.turnDirection === LegTurnDirection.Right ? 'right' : 'left';
    const turnDirectionSign = turnDirection === 'left' ? -1 : 1;
    const turnRadiusMeters = Math.max(desiredTurnRadius, 100); // Enforce an arbitrary minimum turn radius.
    const turnRadiusRad = UnitType.METER.convertTo(turnRadiusMeters, UnitType.GA_RADIAN);

    // Position the turn from the inbound leg to the outbound leg such that it is tangent to the inbound path at the
    // hold position.

    const holdPosVec = holdPos.toCartesian(this.vec3Cache[0]);
    const outboundTurnCenter = this.geoCircleCache[1].setAsGreatCircle(inboundPath.center, holdPosVec)
      .offsetDistanceAlong(holdPosVec, turnRadiusRad * turnDirectionSign, this.vec3Cache[1], Math.PI);
    const outboundTurnCircle = FlightPathUtils.getTurnCircle(outboundTurnCenter, turnRadiusRad, turnDirection, this.geoCircleCache[1]);

    let inboundStartVec!: Float64Array;
    let inboundTurnCircle!: GeoCircle;

    let outboundPath!: GeoCircle;

    let outboundStartVec!: Float64Array;
    let outboundEndVec!: Float64Array;

    let needCalcCoincidentTurns = true;

    if (MathUtils.angularDistance(distanceRad, 0, 0) > GeoMath.ANGULAR_TOLERANCE) {
      // If the leg distance is not a multiple of 2 * pi great-arc radians, then the turn from the outbound leg to
      // the inbound leg (inbound turn) and the turn from the inbound leg to the outbound leg (outbound turn) do not
      // lie on the same circle. In this case, we calculate the start of the inbound leg based on the leg distance,
      // and we position the inbound turn such that it is tangent to the inbound path at the start of the inbound
      // leg. Next, we calculate the outbound path by finding the great-circle path that is tangent to both the
      // inbound and outbound turns and is not the inbound path.

      inboundStartVec = inboundPath.offsetDistanceAlong(holdPosVec, -distanceRad, this.vec3Cache[2], Math.PI);
      const inboundTurnCenter = this.geoCircleCache[2].setAsGreatCircle(inboundPath.center, inboundStartVec)
        .offsetDistanceAlong(inboundStartVec, turnRadiusRad * turnDirectionSign, this.vec3Cache[3], Math.PI);
      inboundTurnCircle = FlightPathUtils.getTurnCircle(inboundTurnCenter, turnRadiusRad, turnDirection, this.geoCircleCache[2]);

      const outboundPathCandidates = this.intersectionCache;
      const candidateCount = this.geoCircleCache[3].set(outboundTurnCircle.center, Math.abs(MathUtils.HALF_PI - turnRadiusRad))
        .intersection(this.geoCircleCache[4].set(inboundTurnCircle.center, Math.abs(MathUtils.HALF_PI - turnRadiusRad)), outboundPathCandidates);

      // There should always be two candidates based on how we have constructed the circles. If there aren't, then we
      // will fall back to a zero-distance hold.
      if (candidateCount === 2) {
        outboundPath = this.geoCircleCache[3].set(outboundPathCandidates[0], MathUtils.HALF_PI);

        outboundEndVec = outboundPath.closest(inboundTurnCenter, this.vec3Cache[4]);
        outboundStartVec = outboundPath.closest(outboundTurnCenter, this.vec3Cache[3]);

        needCalcCoincidentTurns = false;
      } else {
        distanceRad = 0;
      }
    }

    if (needCalcCoincidentTurns) {
      // If we are here, then we need to handle the case where the turn from the outbound leg to the inbound leg and
      // the turn from the inbound leg to the outbound leg lie on the same circle. This happens when the leg distance
      // is a multiple of 2 * pi great-arc radians.

      inboundStartVec = holdPosVec;
      inboundTurnCircle = outboundTurnCircle;

      outboundStartVec = outboundTurnCircle.offsetAngleAlong(holdPosVec, Math.PI, this.vec3Cache[3], Math.PI);
      outboundEndVec = outboundStartVec;

      outboundPath = this.geoCircleCache[3].set(
        Vec3Math.cross(
          outboundStartVec,
          Vec3Math.cross(
            outboundTurnCircle.center,
            outboundStartVec,
            this.vec3Cache[2]
          ),
          this.vec3Cache[2]
        ),
        MathUtils.HALF_PI
      );
    }

    // Handle hold entry

    const normalizedEntryCourse = MathUtils.normalizeAngleDeg(state.currentCourse - course, -180); // -180 to +180
    const directionalEntryCourse = normalizedEntryCourse * turnDirectionSign;

    const isDirectEntry = directionalEntryCourse >= -70 && directionalEntryCourse <= 135;
    const skipRacetrack = leg.leg.type === LegType.HF && !isDirectEntry;

    if (isDirectEntry) {
      // ---- DIRECT ENTRY ----

      if (directionalEntryCourse > 0) {
        // The entry course is toward the outbound leg, so we just intercept the outbound leg directly, bypassing
        // the turn from the inbound to outbound leg.

        ingressVectorIndex += this.joinGreatCircleToPointVectorBuilder.build(
          ingress, ingressVectorIndex,
          state.currentPosition, this.geoCircleCache[4].setAsGreatCircle(state.currentPosition, state.currentCourse),
          outboundEndVec, outboundPath,
          turnDirection, turnRadiusMeters,
          false, true,
          undefined,
          FlightPathVectorFlags.HoldDirectEntry
        );

        calcs.ingressJoinIndex = 1;
      } else if (BitFlags.isAny(ingress[0]?.flags ?? 0, FlightPathVectorFlags.AnticipatedTurn)) {
        // Don't erase turn anticipation for direct entries
        ingressVectorIndex = ingress.length;
      }
    } else if (directionalEntryCourse > 110) {
      // ---- TEARDROP ENTRY ----

      if (directionalEntryCourse > 135) {
        // We need to make initial turn to get to a 45-degree outbound leg.

        const outboundCourse = course + 135 * turnDirectionSign;
        const numTurnVectorsAdded = this.circleVectorBuilder.buildTurnToCourse(
          ingress, ingressVectorIndex,
          holdPosVec,
          turnRadiusMeters, turnDirection === 'left' ? 'right' : 'left',
          state.currentCourse, outboundCourse,
          FlightPathVectorFlags.HoldTeardropEntry | FlightPathVectorFlags.TurnToCourse
        );

        if (numTurnVectorsAdded > 0) {
          ingressVectorIndex += numTurnVectorsAdded;
          const turnVector = ingress[ingressVectorIndex - 1];
          state.currentPosition.set(turnVector.endLat, turnVector.endLon);
          state.currentCourse = FlightPathUtils.getVectorFinalCourse(turnVector);
        }
      }

      ingressVectorIndex += this.joinGreatCircleToPointVectorBuilder.build(
        ingress, ingressVectorIndex,
        state.currentPosition, this.geoCircleCache[4].setAsGreatCircle(state.currentPosition, state.currentCourse),
        holdPos, inboundPath,
        turnDirection, turnRadiusMeters,
        true, true,
        undefined,
        FlightPathVectorFlags.HoldTeardropEntry
      );

      if (skipRacetrack) {
        // If we skip the racetrack, then remove the part of the hold entry that is coincident with the inbound leg.

        const lastEntryVector = ingress[ingressVectorIndex - 1];
        if (lastEntryVector && FlightPathUtils.isVectorGreatCircle(lastEntryVector) && holdPos.equals(lastEntryVector.endLat, lastEntryVector.endLon)) {
          if (UnitType.METER.convertTo(lastEntryVector.distance, UnitType.GA_RADIAN) > distanceRad + GeoMath.ANGULAR_TOLERANCE) {
            const lastEntryVectorEnd = holdPos.offset(course + 180, distanceRad, this.geoPointCache[1]);
            lastEntryVector.endLat = lastEntryVectorEnd.lat;
            lastEntryVector.endLon = lastEntryVectorEnd.lon;
            lastEntryVector.distance -= UnitType.GA_RADIAN.convertTo(distanceRad, UnitType.METER);
          } else {
            ingressVectorIndex--;
          }
        }
      }

      calcs.ingressJoinIndex = 0;
    } else if (directionalEntryCourse < -70) {
      // ---- PARALLEL ENTRY ----

      // TODO: anticipate the turn onto the parallel course so that we don't overshoot the inbound path.

      const numTurnVectorsAdded = this.circleVectorBuilder.buildTurnToCourse(
        ingress, ingressVectorIndex,
        holdPosVec,
        turnRadiusMeters, turnDirection === 'left' ? 'right' : 'left',
        state.currentCourse, oppositeCourse,
        FlightPathVectorFlags.HoldParallelEntry | FlightPathVectorFlags.TurnToCourse
      );

      if (numTurnVectorsAdded > 0) {
        ingressVectorIndex += numTurnVectorsAdded;
        const turnVector = ingress[ingressVectorIndex - 1];
        state.currentPosition.set(turnVector.endLat, turnVector.endLon);
        state.currentCourse = FlightPathUtils.getVectorFinalCourse(turnVector);
      }

      ingressVectorIndex += this.procTurnVectorBuilder.build(
        ingress, ingressVectorIndex,
        state.currentPosition, this.geoCircleCache[4].setAsGreatCircle(state.currentPosition, state.currentCourse),
        holdPos, inboundPath,
        course + 135 * turnDirectionSign,
        turnRadiusMeters, turnDirection === 'left' ? 'right' : 'left',
        state.currentCourse, course,
        FlightPathVectorFlags.HoldParallelEntry
      );

      calcs.ingressJoinIndex = 0;
    }

    ingress.length = ingressVectorIndex;
    if (ingress.length === 0) {
      calcs.ingressJoinIndex = -1;
    }

    if (!skipRacetrack) {
      // Turn from inbound course to outbound course.
      vectorIndex += this.circleVectorBuilder.build(
        vectors, vectorIndex,
        outboundTurnCircle,
        holdPosVec, outboundStartVec,
        FlightPathVectorFlags.TurnToCourse
      );

      // Outbound leg.
      vectorIndex += this.circleVectorBuilder.build(
        vectors, vectorIndex,
        outboundPath,
        outboundStartVec, outboundEndVec,
        FlightPathVectorFlags.HoldOutboundLeg
      );

      // Turn from outbound course to inbound course.
      vectorIndex += this.circleVectorBuilder.build(
        vectors, vectorIndex,
        inboundTurnCircle,
        outboundEndVec, inboundStartVec,
        FlightPathVectorFlags.TurnToCourse
      );
    }

    // Inbound leg.
    vectorIndex += this.circleVectorBuilder.build(
      vectors, vectorIndex,
      inboundPath,
      inboundStartVec, holdPosVec,
      FlightPathVectorFlags.HoldInboundLeg
    );

    vectors.length = vectorIndex;

    state.currentPosition.set(holdPos);
    state.currentCourse = course;

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}
