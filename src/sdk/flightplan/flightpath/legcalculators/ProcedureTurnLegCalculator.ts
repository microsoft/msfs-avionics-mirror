import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { FlightPlanLeg, LegType } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { DirectToJoinGreatCircleAtPointVectorBuilder } from '../vectorbuilders/DirectToJoinGreatCircleToPointVectorBuilder';
import { ProcedureTurnVectorBuilder } from '../vectorbuilders/ProcedureTurnVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for procedure turn legs.
 */
export class ProcedureTurnLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(3, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of ProcedureTurnLegCalculator.
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
    leg.calculated!.courseMagVar = this.getMagVarFromIcao(leg.leg.originIcaoStruct) ?? 0;
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

    const originPos = this.getPositionFromIcao(leg.leg.fixIcaoStruct, this.geoPointCache[0]);

    if (!originPos) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }


    const nextLeg: LegDefinition | undefined = legs[calculateIndex + 1];

    if (!nextLeg) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    const nextLegTerminatorPos = this.getTerminatorPosition(nextLeg.leg, this.geoPointCache[1]);
    const inboundCourse = this.predictLegFinalTrueCourse(nextLeg.leg);

    if (!nextLegTerminatorPos || inboundCourse === undefined) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    const outboundCourse = MathUtils.normalizeAngleDeg(inboundCourse + 180);
    const turnInitialCourse = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);

    // If the initial turn does not deviate enough from the outbound course, then we can't calculate a proper procedure
    // turn.
    if (MathUtils.angularDistanceDeg(outboundCourse, turnInitialCourse, 0) < 5) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const outboundPath = this.geoCircleCache[0].setAsGreatCircle(originPos, outboundCourse);

    if ((state.isDiscontinuity && !options.calculateDiscontinuityVectors) || !state.currentPosition.isValid()) {
      // We are starting in a discontinuity or the current flight path position is not defined. We will set the
      // current position to the origin fix and the current course to the outbound course.
      state.currentPosition.set(originPos);
      state.currentCourse = outboundCourse;
    } else {
      // We need to build an initial path to the leg origin if the current flight path position is not at the origin.
      const needBuildInitialPath = !state.currentPosition.equals(originPos);

      if (
        needBuildInitialPath
        || (state.isDiscontinuity && options.calculateDiscontinuityVectors)
      ) {
        if (needBuildInitialPath) {
          const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None)
            | (state.isFallback && state.currentCourse !== undefined ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None);

          const startPath = state.currentCourse !== undefined
            ? this.geoCircleCache[1].setAsGreatCircle(state.currentPosition, state.currentCourse)
            : undefined;

          vectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
            vectors, vectorIndex,
            state.currentPosition, startPath,
            originPos, outboundPath,
            state.getDesiredTurnRadius(calculateIndex),
            undefined,
            flags, true
          );
        }

        state.currentPosition.set(originPos);
        state.currentCourse = outboundCourse;
      }
    }

    // We must intercept the next leg at least 1 nautical mile from the terminator position.
    const inboundPathEndpoint = nextLegTerminatorPos.offset(outboundCourse, UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN));
    const inboundPath = this.geoCircleCache[1].setAsGreatCircle(inboundPathEndpoint, inboundCourse);

    const desiredTurnDirection = FlightPathUtils.getLegDesiredTurnDirection(leg.leg);

    vectorIndex += this.procTurnVectorBuilder.build(
      vectors, vectorIndex,
      originPos, outboundPath,
      inboundPathEndpoint, inboundPath,
      turnInitialCourse,
      state.getDesiredCourseReversalTurnRadius(calculateIndex), desiredTurnDirection,
      outboundCourse, inboundCourse
    );

    vectors.length = vectorIndex;

    // The procedure turn vector builder is guaranteed to add at least one vector.
    const lastVector = vectors[vectorIndex - 1];

    state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

    state.isDiscontinuity = false;
    state.isFallback = false;
  }

  /**
   * Predicts the final true course of a leg at its terminator fix, in degrees.
   * @param leg A flight plan leg.
   * @returns The predicted final true course of a leg at its terminator fix, in degrees, or `undefined` if the course
   * could not be determined.
   */
  private predictLegFinalTrueCourse(leg: Readonly<FlightPlanLeg>): number | undefined {
    switch (leg.type) {
      case LegType.IF:
      case LegType.CF:
        return this.getLegTrueCourse(leg);
      default:
        return undefined;
    }
  }
}
