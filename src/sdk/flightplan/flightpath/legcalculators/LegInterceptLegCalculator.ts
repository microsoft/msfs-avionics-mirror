import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { LegType } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { CircleInterceptLegCalculator, CircleInterceptLegPathToInterceptInfo } from './CircleInterceptLegCalculator';

/**
 * Calculates flight path vectors for legs that intercept the next flight plan leg.
 */
export class LegInterceptLegCalculator extends CircleInterceptLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));

  /**
   * Creates a new instance of LegInterceptLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   * @param isHeadingLeg Whether the calculator calculates flight plan legs flown with constant heading.
   */
  public constructor(facilityCache: FlightPathCalculatorFacilityCache, isHeadingLeg: boolean) {
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

    let magVar = this.getMagVarFromIcao(leg.leg.originIcaoStruct);

    if (magVar === undefined && calculateIndex + 1 < legs.length) {
      const nextLeg = legs[calculateIndex + 1];
      switch (nextLeg.leg.type) {
        case LegType.AF:
        case LegType.CF:
        case LegType.RF: {
          const terminatorPos = this.getTerminatorPosition(nextLeg.leg, this.geoPointCache[0], nextLeg.leg.fixIcaoStruct);
          if (terminatorPos) {
            magVar = this.getLegMagVar(nextLeg.leg, terminatorPos);
          }
          break;
        }

        case LegType.FC:
        case LegType.FM: {
          const originPos = this.getPositionFromIcao(nextLeg.leg.fixIcaoStruct, this.geoPointCache[0]);
          if (originPos) {
            magVar = this.getLegMagVar(nextLeg.leg, originPos);
          }
          break;
        }
      }
    }

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
    const nextLeg = legs[calculateIndex + 1];

    if (!nextLeg) {
      return undefined;
    }

    switch (nextLeg.leg.type) {
      case LegType.AF: {
        const center = this.getPositionFromIcao(nextLeg.leg.originIcaoStruct, this.geoPointCache[0]);
        const end = this.getTerminatorPosition(nextLeg.leg, this.geoPointCache[1], nextLeg.leg.fixIcaoStruct);
        if (center && end && UnitType.METER.convertTo(nextLeg.leg.rho, UnitType.GA_RADIAN) > GeoMath.ANGULAR_TOLERANCE) {
          FlightPathUtils.getTurnCircle(
            center,
            UnitType.METER.convertTo(nextLeg.leg.rho, UnitType.GA_RADIAN),
            FlightPathUtils.getLegDesiredTurnDirection(nextLeg.leg) ?? 'right',
            out.circle
          );
          Vec3Math.set(NaN, NaN, NaN, out.start);
          out.circle.closest(end.toCartesian(out.end), out.end);
          return out;
        }
        break;
      }

      case LegType.CF: {
        const terminatorPos = this.getTerminatorPosition(nextLeg.leg, this.geoPointCache[0], nextLeg.leg.fixIcaoStruct);
        const course = this.getLegTrueCourse(nextLeg.leg);
        if (terminatorPos && course !== undefined) {
          out.circle.setAsGreatCircle(terminatorPos, course);
          Vec3Math.set(NaN, NaN, NaN, out.start);
          terminatorPos.toCartesian(out.end);
          return out;
        }
        break;
      }

      case LegType.FC: {
        const originPos = this.getPositionFromIcao(nextLeg.leg.fixIcaoStruct, this.geoPointCache[0]);
        const course = this.getLegTrueCourse(nextLeg.leg);
        if (originPos && course !== undefined && UnitType.METER.convertTo(nextLeg.leg.distance, UnitType.GA_RADIAN) > GeoMath.ANGULAR_TOLERANCE) {
          out.circle.setAsGreatCircle(originPos, course);
          originPos.toCartesian(out.start);
          out.circle.offsetDistanceAlong(out.start, UnitType.METER.convertTo(nextLeg.leg.distance, UnitType.GA_RADIAN), out.end, Math.PI);
          return out;
        }
        break;
      }

      case LegType.FM: {
        const originPos = this.getPositionFromIcao(nextLeg.leg.fixIcaoStruct, this.geoPointCache[0]);
        const course = this.getLegTrueCourse(nextLeg.leg);
        if (originPos && course !== undefined) {
          out.circle.setAsGreatCircle(originPos, course);
          originPos.toCartesian(out.start);
          Vec3Math.set(NaN, NaN, NaN, out.end);
          return out;
        }
        break;
      }

      case LegType.RF: {
        const center = this.getPositionFromIcao(nextLeg.leg.arcCenterFixIcaoStruct, this.geoPointCache[0]);
        const end = this.getTerminatorPosition(nextLeg.leg, this.geoPointCache[1], nextLeg.leg.fixIcaoStruct);
        if (center && end) {
          const radius = center.distance(end);
          if (radius > GeoMath.ANGULAR_TOLERANCE) {
            FlightPathUtils.getTurnCircle(
              center,
              radius,
              FlightPathUtils.getLegDesiredTurnDirection(nextLeg.leg) ?? 'right',
              out.circle
            );
            Vec3Math.set(NaN, NaN, NaN, out.start);
            end.toCartesian(out.end);
            return out;
          }
        }
        break;
      }
    }

    return undefined;
  }
}
