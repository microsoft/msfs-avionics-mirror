import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { Vec3Math } from '../../../math/VecMath';
import { Facility } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathState } from '../FlightPathState';
import { CircleInterceptLegCalculator, CircleInterceptLegPathToInterceptInfo } from './CircleInterceptLegCalculator';

/**
 * Calculates flight path vectors for legs that intercept a radial from a reference fix.
 */
export class RadialInterceptLegCalculator extends CircleInterceptLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));

  /**
   * Creates a new instance of RadialInterceptLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   * @param isHeadingLeg Whether the calculator calculates flight plan legs flown with constant heading.
   */
  public constructor(facilityCache: Map<string, Facility>, isHeadingLeg: boolean) {
    super(facilityCache, isHeadingLeg);
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
      if (this.isHeadingLeg && calculateIndex === activeLegIndex && state.planePosition.isValid()) {
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
  protected getPathToInterceptInfo(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    out: CircleInterceptLegPathToInterceptInfo
  ): CircleInterceptLegPathToInterceptInfo | undefined {
    const leg = legs[calculateIndex];
    const radialCenter = this.getPositionFromIcao(leg.leg.originIcao, this.geoPointCache[0]);
    if (radialCenter) {
      out.circle.setAsGreatCircle(radialCenter, MagVar.magneticToTrue(leg.leg.theta, leg.calculated!.courseMagVar));
      radialCenter.toCartesian(out.start);
      Vec3Math.set(NaN, NaN, NaN, out.end);
      return out;
    } else {
      return undefined;
    }
  }
}
