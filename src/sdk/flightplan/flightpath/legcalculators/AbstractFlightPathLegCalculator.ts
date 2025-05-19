import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { UnitType } from '../../../math/NumberUnit';
import { FacilityType, FlightPlanLeg, LegType, VorFacility } from '../../../navigation/Facilities';
import { FacilityUtils } from '../../../navigation/FacilityUtils';
import { IcaoValue } from '../../../navigation/Icao';
import { ICAO } from '../../../navigation/IcaoUtils';
import { LegCalculations, LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathLegCalculationOptions, FlightPathLegCalculator } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';

/**
 * An abstract implementation of {@link FlightPathLegCalculator}.
 */
export abstract class AbstractFlightPathLegCalculator implements FlightPathLegCalculator {
  private static readonly __geoPointCache = [new GeoPoint(0, 0)];

  /**
   * Creates a new instance of AbstractFlightPathLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   * @param canSkipWhenActive Whether this calculator can skip leg calculations when the leg to calculate is the active
   * flight plan leg.
   */
  public constructor(
    protected readonly facilityCache: FlightPathCalculatorFacilityCache,
    protected readonly canSkipWhenActive: boolean
  ) {
  }

  /**
   * Gets a geographical position from an ICAO value.
   * @param icao An ICAO value.
   * @param out A GeoPoint object to which to write the result.
   * @returns The geographical position corresponding to the ICAO string, or undefined if one could not be obtained.
   */
  protected getPositionFromIcao(icao: IcaoValue, out: GeoPoint): GeoPoint | undefined {
    const facility = this.facilityCache.getFacility(icao);
    return facility ? out.set(facility) : undefined;
  }

  /**
   * Gets the magnetic variation, in degrees, at a facility. If the facility is a VOR and it has a nominal database
   * magnetic variation, then that value will be returned. Otherwise, the model magnetic variation at the facility's
   * position will be returned.
   * @param icao The ICAO value of the facility.
   * @returns The magnetic variation, in degrees, at the specified facility, or `undefined` if the specified facility
   * could not be retrieved.
   */
  protected getMagVarFromIcao(icao: IcaoValue): number | undefined {
    const facility = this.facilityCache.getFacility(icao);

    if (facility) {
      if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
        return -facility.magneticVariation;
      }

      // Fall back to getting the model magvar at the facility if we couldn't get a magvar from a VOR.
      return MagVar.get(facility);
    }

    return undefined;
  }

  /**
   * Gets the geographic position for a flight plan leg terminator.
   * @param leg A flight plan leg.
   * @param out A GeoPoint object to which to write the result.
   * @param icao The ICAO value of the leg's terminator fix. If not defined, then the terminator fix will be retrieved
   * from the flight plan leg, if necessary.
   * @returns The position of the leg terminator, or `undefined` if it could not be determined.
   */
  protected getTerminatorPosition(leg: FlightPlanLeg, out: GeoPoint, icao?: IcaoValue): GeoPoint | undefined {
    if (leg.lat !== undefined && leg.lon !== undefined) {
      return out.set(leg.lat, leg.lon);
    } else {
      if (icao == undefined) {
        switch (leg.type) {
          case LegType.AF:
          case LegType.CF:
          case LegType.DF:
          case LegType.HA:
          case LegType.HF:
          case LegType.HM:
          case LegType.IF:
          case LegType.RF:
          case LegType.TF:
            return this.getPositionFromIcao(leg.fixIcaoStruct, out);
          case LegType.FC: {
            const origin = this.getPositionFromIcao(leg.fixIcaoStruct, out);
            if (origin) {
              const course = leg.trueDegrees
                ? leg.course
                : MagVar.magneticToTrue(leg.course, this.getMagVarFromIcao(leg.fixIcaoStruct) ?? MagVar.get(origin));

              return origin.offset(course, UnitType.METER.convertTo(leg.distance, UnitType.GA_RADIAN));
            }
          }
        }

        return undefined;
      } else {
        return this.getPositionFromIcao(icao, out);
      }
    }
  }

  /**
   * Gets the magnetic variation, in degrees, at a flight plan leg's terminator fix. If the fix is a VOR and it has a
   * nominal database magnetic variation, then that value will be returned. Otherwise, the model magnetic variation at
   * the fix's position will be returned.
   * @param leg A flight plan leg.
   * @returns The magnetic variation, in degrees, at the specified flight plan leg's terminator fix, or `undefined` if
   * the magnetic variation could not be determined.
   */
  protected getTerminatorMagVar(leg: FlightPlanLeg): number | undefined {
    if (leg.lat !== undefined && leg.lon !== undefined) {
      return MagVar.get(leg.lat, leg.lon);
    } else {
      return this.getMagVarFromIcao(leg.fixIcaoStruct);
    }
  }

  /**
   * Gets the magnetic variation, in degrees, to use when calculating a flight plan leg's course. If the leg defines
   * an origin or fix VOR facility, then the database magnetic variation defined for the VOR is used (the origin
   * facility takes priority).
   * @param leg A flight plan leg.
   * @returns The magnetic variation, in degrees, to use when calculating the specified flight plan leg's course, or
   * `undefined` if the leg does not define an origin or fix VOR facility.
   */
  protected getLegMagVar(leg: FlightPlanLeg): number | undefined;
  /**
   * Gets the magnetic variation, in degrees, to use when calculating a flight plan leg's course. If the leg defines
   * an origin or fix VOR facility, then the database magnetic variation defined for the VOR is used (the origin
   * facility takes priority). Otherwise, the model magnetic variation for the specified point is used.
   * @param leg A flight plan leg.
   * @param defaultPoint The location from which to get magnetic variation if an origin or fix VOR is not found.
   * @returns The magnetic variation, in degrees, to use when calculating the specified flight plan leg's course.
   */
  protected getLegMagVar(leg: FlightPlanLeg, defaultPoint: LatLonInterface): number;
  /**
   * Gets the magnetic variation, in degrees, to use when calculating a flight plan leg's course. If the leg defines
   * an origin or fix VOR facility, then the database magnetic variation defined for the VOR is used (the origin
   * facility takes priority). Otherwise, the model magnetic variation for the specified point, if defined, is used.
   * @param leg A flight plan leg.
   * @param defaultPoint The location from which to get magnetic variation if an origin or fix VOR is not found.
   * @returns The magnetic variation, in degrees, to use when calculating the specified flight plan leg's course, or
   * `undefined` if the leg does not define an origin or fix VOR facility and a default point was not provided.
   */
  protected getLegMagVar(leg: FlightPlanLeg, defaultPoint?: LatLonInterface): number | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  protected getLegMagVar(leg: FlightPlanLeg, defaultPoint?: LatLonInterface): number | undefined {
    const facIcao = ICAO.isValueFacility(leg.originIcaoStruct, FacilityType.VOR) ? leg.originIcaoStruct
      : ICAO.isValueFacility(leg.fixIcaoStruct, FacilityType.VOR) ? leg.fixIcaoStruct
        : undefined;

    const facility = facIcao !== undefined ? this.facilityCache.getFacility(facIcao) as VorFacility | undefined : undefined;

    return facility
      // The sign of magnetic variation on VOR facilities is the opposite of the standard east = positive convention.
      ? -facility.magneticVariation
      : defaultPoint ? MagVar.get(defaultPoint) : undefined;
  }

  /**
   * Gets the true course, in degrees, for a flight plan leg. If the leg defines an origin or fix VOR facility, then
   * the magnetic variation defined at the VOR is used to adjust magnetic course. Otherwise the computed magnetic
   * variation for the specified point is used.
   * @param leg A flight plan leg.
   * @returns The true course, in degrees, for the flight plan leg.
   */
  protected getLegTrueCourse(leg: FlightPlanLeg): number | undefined {
    switch (leg.type) {
      case LegType.CF:
      case LegType.HF:
      case LegType.HM:
      case LegType.HA: {
        const terminatorPos = this.getTerminatorPosition(leg, AbstractFlightPathLegCalculator.__geoPointCache[0], leg.fixIcaoStruct);
        if (terminatorPos) {
          return leg.trueDegrees ? leg.course : MagVar.magneticToTrue(leg.course, this.getLegMagVar(leg, terminatorPos));
        }
        break;
      }

      case LegType.FA:
      case LegType.FC:
      case LegType.FD:
      case LegType.FM: {
        const originPos = this.getPositionFromIcao(leg.fixIcaoStruct, AbstractFlightPathLegCalculator.__geoPointCache[0]);
        if (originPos) {
          return leg.trueDegrees ? leg.course : MagVar.magneticToTrue(leg.course, this.getLegMagVar(leg, originPos));
        }
        break;
      }

      case LegType.CA:
      case LegType.CR:
      case LegType.CI:
      case LegType.VA:
      case LegType.VD:
      case LegType.VI:
      case LegType.VM:
      case LegType.VR:
        return leg.trueDegrees ? leg.course : MagVar.magneticToTrue(leg.course, this.getMagVarFromIcao(leg.originIcaoStruct) ?? 0);

      case LegType.IF:
        // If the leg is an IF for a runway fix, then use runway heading as the course.
        if (ICAO.isValueFacility(leg.fixIcaoStruct, FacilityType.RWY)) {
          const facility = this.facilityCache.getFacility(leg.fixIcaoStruct);
          if (facility && FacilityUtils.isFacilityType(facility, FacilityType.RWY)) {
            return facility.runway.course;
          }
        }
    }

    return undefined;
  }

  /** @inheritDoc */
  public calculate(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): LegCalculations {
    const calcs = legs[calculateIndex].calculated ??= {
      courseMagVar: 0,
      startLat: undefined,
      startLon: undefined,
      endLat: undefined,
      endLon: undefined,
      distance: 0,
      distanceWithTransitions: 0,
      initialDtk: undefined,
      cumulativeDistance: 0,
      cumulativeDistanceWithTransitions: 0,
      flightPath: [],
      ingress: [],
      ingressJoinIndex: -1,
      ingressToEgress: [],
      egressJoinIndex: -1,
      egress: [],
      endsInDiscontinuity: false,
      endsInFallback: false
    };

    const vectors = calcs.flightPath;
    if (this.canSkipWhenActive && activeLegIndex === calculateIndex && this.shouldSkipWhenActive(legs, calculateIndex, activeLegIndex, state, options)) {

      // If we are skipping calculating the path, then we need to udpate the flight path state using the existing leg
      // calculations before returning.

      FlightPathUtils.getLegFinalPosition(calcs, state.currentPosition);
      state.currentCourse = FlightPathUtils.getLegFinalCourse(calcs) ?? state.currentCourse;
      state.isDiscontinuity = calcs.endsInDiscontinuity;
      state.isFallback = calcs.endsInFallback;
      return calcs;
    }

    try {
      this.calculateMagVar(legs, calculateIndex, activeLegIndex, state, options);
      this.calculateVectors(legs, calculateIndex, activeLegIndex, state, options);

      calcs.endsInDiscontinuity = state.isDiscontinuity;
      calcs.endsInFallback = state.isFallback;
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        console.error(e.stack);
      }

      vectors.length = 0;
      calcs.ingress.length = 0;
      calcs.ingressJoinIndex = 0;
      calcs.egress.length = 0;
      calcs.egressJoinIndex = -1;
      calcs.ingressToEgress.length = 0;
      calcs.endsInDiscontinuity = true;
      calcs.endsInFallback = false;

      state.currentPosition.set(NaN, NaN);
      state.currentCourse = undefined;
      state.isDiscontinuity = true;
      state.isFallback = false;
    }

    // Update the start and end lat/lon and initialDtk fields of the leg calculations from the calculated vectors.
    if (vectors.length > 0) {
      const startVector = vectors[0];
      const endVector = vectors[vectors.length - 1];

      calcs.startLat = startVector.startLat;
      calcs.startLon = startVector.startLon;

      calcs.endLat = endVector.endLat;
      calcs.endLon = endVector.endLon;

      const trueDtk = FlightPathUtils.getVectorInitialCourse(startVector);
      if (!isNaN(trueDtk)) {
        calcs.initialDtk = MagVar.trueToMagnetic(trueDtk, calcs.courseMagVar);
      }
    } else {
      calcs.startLat = undefined;
      calcs.startLon = undefined;

      if (state.currentPosition.isValid()) {
        calcs.endLat = state.currentPosition.lat;
        calcs.endLon = state.currentPosition.lon;
      } else {
        calcs.endLat = undefined;
        calcs.endLon = undefined;
      }

      calcs.initialDtk = undefined;
    }

    return calcs;
  }

  /**
   * Checks whether vector calculations should be skipped when the leg to calculate is the active leg.
   * @param legs A sequence of flight plan legs.
   * @param calculateIndex The index of the leg to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param state The current flight path state.
   * @param options Options to use for the leg calculations.
   * @returns Whether to skip vector calculations.
   */
  protected shouldSkipWhenActive(
    legs: LegDefinition[],
    calculateIndex: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activeLegIndex: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: FlightPathState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: Readonly<FlightPathLegCalculationOptions>
  ): boolean {
    return legs[calculateIndex].calculated!.flightPath.length > 0;
  }

  /**
   * Calculates the magnetic variation for a flight plan leg.
   * @param legs A sequence of flight plan legs.
   * @param calculateIndex The index of the leg to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param state The current flight path state.
   * @param options Options to use for the leg calculations.
   * @returns The number of vectors added to the sequence.
   */
  protected abstract calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): void;

  /**
   * Calculates flight path vectors for a flight plan leg.
   * @param legs A sequence of flight plan legs.
   * @param calculateIndex The index of the leg to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param state The current flight path state.
   * @param options Options to use for the leg calculations.
   * @returns The number of vectors added to the sequence.
   */
  protected abstract calculateVectors(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): void;

  /**
   * Calculates the ingress to egress vectors for a flight plan leg and adds them to a leg calculation.
   * @param legCalc The calculations for a flight plan leg.
   */
  protected resolveIngressToEgress(legCalc: LegCalculations): void {
    FlightPathUtils.resolveIngressToEgress(legCalc);
  }
}
