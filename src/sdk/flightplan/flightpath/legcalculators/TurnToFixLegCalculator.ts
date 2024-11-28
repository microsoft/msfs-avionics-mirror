import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { Facility, FlightPlanLeg, LegTurnDirection } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToJoinGreatCircleAtPointVectorBuilder } from '../vectorbuilders/DirectToJoinGreatCircleToPointVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for legs that define a turn ending at a defined terminator fix.
 */
export abstract class TurnToFixLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(2, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of TurnToFixLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache, false);
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

    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[0], leg.leg.fixIcao);
    const turnCenter = this.getTurnCenter(leg.leg);

    if (!terminatorPos || !turnCenter) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    // Only build vectors if...
    if (
      // ... the current flight path position is defined...
      state.currentPosition.isValid()
      // ... and the leg is of non-zero length.
      && !state.currentPosition.equals(terminatorPos)
    ) {
      // If the leg starts in a discontinuity, then only build vectors if we are configured to calculate discontinuity
      // vectors.
      if (!state.isDiscontinuity || options.calculateDiscontinuityVectors) {
        const direction = leg.leg.turnDirection === LegTurnDirection.Left ? 'left' : 'right';

        if (state.isDiscontinuity || (state.isFallback && state.currentCourse !== undefined)) {
          // If we are starting in a discontinuity or a fallback state, then the start of the leg is not guaranteed to
          // lie anywhere near the leg's defined turn circle. Therefore, we will ignore the turn circle and build a
          // path that ends at the leg terminator in the same direction that the turn circle would cross the
          // terminator.

          const endVec = terminatorPos.toCartesian(this.vec3Cache[0]);

          const radial = this.geoCircleCache[0].setAsGreatCircle(turnCenter, endVec);
          if (radial.isValid()) {
            const startPath = state.currentCourse !== undefined
              ? this.geoCircleCache[1].setAsGreatCircle(state.currentPosition, state.currentCourse)
              : undefined;
            const endPath = radial.rotate(endVec, direction === 'left' ? -MathUtils.HALF_PI : MathUtils.HALF_PI, Math.PI);

            const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None)
              | (state.isFallback && state.currentCourse !== undefined ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None);

            vectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
              vectors, vectorIndex,
              state.currentPosition, startPath,
              endVec, endPath,
              state.desiredTurnRadius.asUnit(UnitType.METER),
              undefined,
              flags, true
            );
          } else {
            // The terminator is coincident with or antipodal to the turn center. In this case we can't calculate a
            // proper path.
          }
        } else {
          const radius = this.getTurnRadius(leg.leg, turnCenter);

          if (radius !== undefined && radius > GeoMath.ANGULAR_TOLERANCE) {
            const turnCircle = FlightPathUtils.getTurnCircle(turnCenter, radius, direction, this.geoCircleCache[0]);
            const startVec = turnCircle.closest(state.currentPosition, this.vec3Cache[0]);
            const endVec = turnCircle.closest(terminatorPos, this.vec3Cache[1]);

            if (Vec3Math.isFinite(startVec) && Vec3Math.isFinite(endVec)) {
              vectorIndex += this.circleVectorBuilder.build(vectors, vectorIndex, turnCircle, startVec, endVec, FlightPathVectorFlags.Arc);
              state.currentCourse = turnCircle.bearingAt(endVec);
            }
          }
        }
      }
    }

    vectors.length = vectorIndex;

    const hasInvalidStart = state.isDiscontinuity || !state.currentPosition.isValid();

    if (vectorIndex > 0) {
      const lastVector = vectors[vectorIndex - 1];
      state.currentPosition.set(lastVector.endLat, lastVector.endLon);
    } else {
      state.currentPosition.set(terminatorPos);
    }

    if (hasInvalidStart) {
      state.currentCourse = undefined;
    }

    state.isDiscontinuity = false;
    state.isFallback = false;
  }

  /**
   * Gets the center of the turn defined by a flight plan leg.
   * @param leg A flight plan leg.
   * @returns The center of the turn defined by the flight plan leg, or undefined if it could not be determined.
   */
  protected abstract getTurnCenter(leg: FlightPlanLeg): LatLonInterface | undefined;

  /**
   * Gets the radius of the turn defined by a flight plan leg.
   * @param leg A flight plan leg.
   * @param center The center of the turn.
   * @returns The radius of the turn defined by the flight plan leg, or undefined if it could not be determined.
   */
  protected abstract getTurnRadius(leg: FlightPlanLeg, center: LatLonInterface): number | undefined;
}

/**
 * Calculates flight path vectors for arc to fix legs.
 */
export class ArcToFixLegCalculator extends TurnToFixLegCalculator {
  private readonly afGeoPointCache = [new GeoPoint(0, 0)];

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    const leg = legs[calculateIndex];
    const terminatorPos = this.getTerminatorPosition(leg.leg, this.afGeoPointCache[0], leg.leg.fixIcao);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    leg.calculated!.courseMagVar = this.getLegMagVar(leg.leg, terminatorPos) ?? 0;
  }

  /** @inheritDoc */
  protected getTurnCenter(leg: FlightPlanLeg): LatLonInterface | undefined {
    return this.facilityCache.get(leg.originIcao);
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTurnRadius(leg: FlightPlanLeg, center: LatLonInterface): number | undefined {
    return UnitType.METER.convertTo(leg.rho, UnitType.GA_RADIAN);
  }
}

/**
 * Calculates flight path vectors for radius to fix legs.
 */
export class RadiusToFixLegCalculator extends TurnToFixLegCalculator {
  private readonly rfGeoPointCache = [new GeoPoint(0, 0)];

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    const leg = legs[calculateIndex];
    leg.calculated!.courseMagVar = this.getTerminatorMagVar(leg.leg) ?? 0;
  }

  /** @inheritDoc */
  protected getTurnCenter(leg: FlightPlanLeg): LatLonInterface | undefined {
    return this.facilityCache.get(leg.arcCenterFixIcao);
  }

  /** @inheritDoc */
  protected getTurnRadius(leg: FlightPlanLeg, center: LatLonInterface): number | undefined {
    return this.getPositionFromIcao(leg.fixIcao, this.rfGeoPointCache[0])?.distance(center);
  }
}
