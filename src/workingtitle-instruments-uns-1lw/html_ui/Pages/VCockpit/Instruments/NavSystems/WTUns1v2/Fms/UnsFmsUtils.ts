import {
  AdditionalApproachType, AirportFacility, AirwayData, AltitudeRestrictionType, ApproachProcedure, ApproachUtils, BitFlags, DmsFormatter,
  ExtendedApproachType, Facility, FacilityFrequency, FacilityFrequencyType, FacilityLoader, FacilityRepository, FacilityType, FixTypeFlags, FlightPathUtils,
  FlightPlan, FlightPlanLeg, FlightPlanSegment, FlightPlanSegmentType, FlightPlanUtils, GeoCircle, GeoPoint, ICAO, IcaoType, IntersectionFacility, LegCalculations,
  LegDefinition, LegDefinitionFlags, LegTurnDirection, LegType, MagVar, NumberFormatter, OneWayRunway, RnavTypeFlags, RunwayUtils,
  SpeedRestrictionType, SpeedUnit, UnitType, UserFacilityUtils, VerticalData, VerticalFlightPhase, VNavConstraint, VNavLeg
} from '@microsoft/msfs-sdk';

import { UnsChars } from '../CduDisplay/UnsCduDisplay';
import { UnsExtraLegDefinitionFlags } from './UnsFmsTypes';

export enum UnsLegAnnotationFormat {
  Fpl,
  Nav,
  NavAppr,
  NavCompact,
  NavApprCompact,
}

/**
 * Utility Methods for the Epic 2 FMS.
 */
export class UnsFmsUtils {
  private static readonly vec3Cache = [new Float64Array(3)];
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  public static readonly DTO_LEG_OFFSET = 3;

  /**
   * Gets the active segment in the Lateral Flight Plan.
   * @param plan The Lateral Flight Plan.
   * @returns The Active Flight Plan Segment or undefined.
   */
  public static getActiveSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    if (plan.length > 0 && plan.activeLateralLeg >= 0 && plan.activeLateralLeg < plan.length) {
      return plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
    }
    return undefined;
  }

  /**
   * Checks whether a leg exists in a segment with the specified ICAO and, if so, returns the leg index of that leg.
   * @param segment The segment to check for the icao.
   * @param icao The ICAO to check for in the segment.
   * @returns The segment leg index of the leg with the matching icao, or -1.
   */
  public static findIcaoInSegment(segment: FlightPlanSegment, icao: string | undefined): number | undefined {
    if (icao !== undefined) {
      for (let l = 0; l < segment.legs.length; l++) {
        const leg = segment.legs[l];
        if (leg !== undefined && leg.leg !== undefined && leg.leg.fixIcao && leg.leg.fixIcao === icao) {
          return l;
        }
      }
    }
    return undefined;
  }

  /**
   * Checks if the specified leg is the first leg in the segment (accounting for discontinuities)
   * @param plan flight plan
   * @param segmentIndex the segment index
   * @param segmentLegIndex the segment leg index
   * @returns if the specified leg is the first leg in the segment
   */
  public static isFirstLegInSegment(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): boolean {
    const segment = plan.tryGetSegment(segmentIndex);

    if (segment) {
      let legIndex = 0;
      for (const leg of segment.legs) {
        if (!FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)) {
          return segmentLegIndex === legIndex;
        }
        legIndex++;
      }
    }

    return false;
  }

  /**
   * Utility method to return a one-way runway leg
   * @param airport The runway's parent airport.
   * @param oneWayRunway is the one wway runway object
   * @param isOriginRunway is a bool whether this is the origin or destination (origin = true, dest = false)
   * @returns a leg object for the runway
   */
  public static buildRunwayLeg(airport: AirportFacility, oneWayRunway: OneWayRunway, isOriginRunway: boolean): FlightPlanLeg {
    const leg = FlightPlan.createLeg({
      lat: oneWayRunway.latitude,
      lon: oneWayRunway.longitude,
      type: isOriginRunway ? LegType.IF : LegType.TF,
      fixIcaoStruct: RunwayUtils.getRunwayFacilityIcaoValue(airport, oneWayRunway),
      altitude1: isOriginRunway ? oneWayRunway.elevation : oneWayRunway.elevation + 15  //Arrival runway leg altitude should be 50 feet above threshold
    });
    return leg;
  }

  /**
   * Get a basic facility with only the properties of {@link Facility} from any facility.
   * @param facility The facility.
   * @returns A facility instance with only the basic subset of properties.
   */
  public static getBaseFacility(facility: Facility): Facility {
    return {
      icao: facility.icao,
      icaoStruct: ICAO.copyValue(facility.icaoStruct),
      name: facility.name,
      lat: facility.lat,
      lon: facility.lon,
      region: facility.region,
      city: facility.city,
    };
  }

  /**
   * Checks whether a leg with a given type being active should cause LNAV to be auto unsuspended
   * @param legType the leg type
   * @returns a boolean
   */
  public static canLegBeAutoUnsuspended(legType: LegType): boolean {
    switch (legType) {
      case LegType.HM:
      case LegType.FM:
      case LegType.VM:
      case LegType.Discontinuity:
      case LegType.ThruDiscontinuity:
        return false;
      default:
        return true;
    }
  }

  /**
   * Checks whether a leg should appear on the Direct To Page based on leg type.
   * @param leg The FlightPlanLeg to evaluate.
   * @returns whether or not the leg should appear on the Direct To page.
   */
  public static canLegBeSelectedOnDirectPage(leg: FlightPlanLeg): boolean {
    switch (leg.type) {
      case LegType.CA:
      case LegType.FA:
      case LegType.VA:
      case LegType.FM:
      case LegType.VM:
      case LegType.HA:
      case LegType.HM:
      case LegType.HF:
      case LegType.PI:
      case LegType.CI:
      case LegType.VI:
      case LegType.CR:
      case LegType.VR:
        return false;
      default:
        return true;
    }
  }

  /**
   * Checks whether a leg's altitude can be edited based on leg type.
   * @param leg The FlightPlanLeg to evaluate.
   * @returns whether or not the leg's altitude can be edited.
   */
  public static canLegAltitudeBeEdited(leg: FlightPlanLeg): boolean {
    switch (leg.type) {
      case LegType.CF:
      case LegType.FC:
      case LegType.FD:
      case LegType.TF:
      case LegType.PI:
      case LegType.AF:
      case LegType.DF:
      case LegType.IF:
      case LegType.RF:
        return true;
      default:
        return false;
    }
  }

  /**
   * Returns whether a leg is part of a direct to
   *
   * @param leg the leg definition
   *
   * @returns a boolean
   */
  public static isLegInDirectTo(leg: LegDefinition): boolean {
    return BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo);
  }

  /**
   * Returns whether a leg is part of a direct to and its target leg
   *
   * @param leg the leg definition
   *
   * @returns a boolean
   */
  public static isLegDirectToTarget(leg: LegDefinition): boolean {
    return BitFlags.isAll(leg.flags, UnsExtraLegDefinitionFlags.DirectToTarget);
  }

  /**
   * Utility method to return a visual approach for a runway.
   * @param facRepo is a facility repository in which to store the created faf leg facility
   * @param airport is the airport facility for the visual approach.
   * @param runway is the runway to build the visual approach for.
   * @param finalLegDistance is the distance from the runway to place the faf leg in NM.
   * @param finalLegVpa is the vertical path angle selected for the final approach, or undefined if not applicable.
   * @returns an approach procedure.
   */
  public static buildVisualApproach(
    facRepo: FacilityRepository,
    airport: AirportFacility,
    runway: OneWayRunway,
    finalLegDistance: number,
    finalLegVpa: number | undefined,
  ): ApproachProcedure {
    const runwayVec = GeoPoint.sphericalToCartesian(runway.latitude, runway.longitude, UnsFmsUtils.vec3Cache[0]);
    const approachPath = UnsFmsUtils.geoCircleCache[0].setAsGreatCircle(runwayVec, runway.course);

    const runwayCode = RunwayUtils.getRunwayCode(runway.direction);
    const runwayLetter = RunwayUtils.getDesignatorLetter(runway.runwayDesignator).padStart(1, ' ');

    const fafLatLon = approachPath.offsetDistanceAlong(
      runwayVec,
      UnitType.NMILE.convertTo(-finalLegDistance, UnitType.GA_RADIAN),
      UnsFmsUtils.geoPointCache[0]
    );

    const runwayIdent = RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator);

    const finalLegIdent = `${finalLegVpa !== undefined ? 'FA' : 'RX'}${runwayIdent}`;

    const icao = ICAO.value(IcaoType.VisualApproach, `${runwayCode}${runwayLetter}`, airport.icaoStruct.ident, finalLegIdent);

    // Add facility to facRepo
    const fafFacility = UserFacilityUtils.createFromLatLon(ICAO.valueToStringV1(icao), fafLatLon.lat, fafLatLon.lon);

    facRepo.add(fafFacility);

    const fafLeg = FlightPlan.createLeg({
      type: LegType.TF,
      fixIcaoStruct: icao,
      course: MagVar.trueToMagnetic(approachPath.bearingAt(fafLatLon), fafLatLon),
      fixTypeFlags: FixTypeFlags.FAF,
      lat: fafLatLon.lat,
      lon: fafLatLon.lon,
      altDesc: AltitudeRestrictionType.AtOrAbove,
      altitude1: runway.elevation + (Math.tan(UnitType.DEGREE.convertTo(finalLegVpa ?? 3, UnitType.RADIAN)) * UnitType.NMILE.convertTo(finalLegDistance, UnitType.METER)),
    });

    const runwayLeg = UnsFmsUtils.buildRunwayLeg(airport, runway, false);
    runwayLeg.verticalAngle = finalLegVpa !== undefined ? 360 - Math.abs(finalLegVpa) : 0;
    runwayLeg.fixTypeFlags = FixTypeFlags.MAP;

    const finalLegs: FlightPlanLeg[] = [];
    finalLegs.push(fafLeg);
    finalLegs.push(runwayLeg);

    return {
      name: `Visual RW${runway.designation}`,
      runway: runway.designation,
      icaos: [],
      transitions: [],
      finalLegs: finalLegs,
      missedLegs: [],
      approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
      approachSuffix: '',
      runwayDesignator: runway.runwayDesignator,
      runwayNumber: runway.direction,
      rnavTypeFlags: RnavTypeFlags.None,
      rnpAr: false,
      missedApproachRnpAr: false,
    };
  }

  /**
   * Utility method to return a single RnavTypeFlag from multiple possible flags.
   * @param rnavTypeFlags The input RnavTypeFlags.
   * @returns A single RnavTypeFlag
   */
  public static getBestRnavType = ApproachUtils.getBestRnavType;

  /**
   * Utility method to check whether an approach is authorized for GPS guidance.
   * @param approachType The approach type.
   * @returns True if GPS guidance is authorized, false otherwise.
   */
  public static isGpsApproach(approachType: ApproachType | ExtendedApproachType): boolean {
    switch (approachType) {
      case ApproachType.APPROACH_TYPE_GPS:
      case ApproachType.APPROACH_TYPE_RNAV:
        return true;
    }
    return false;
  }

  /**
   * Utility method to check for an approach with a a tunable localizer.
   * @param approachType The approach procedure type
   * @returns True if a localizer needs to be tuned, otherwise false.
   */
  public static isLocalizerApproach(approachType: ExtendedApproachType): boolean {
    switch (approachType) {
      case ApproachType.APPROACH_TYPE_ILS:
      case ApproachType.APPROACH_TYPE_LDA:
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
      case ApproachType.APPROACH_TYPE_SDF:
        return true;
    }
    return false;
  }

  /**
   * Gets an approach procedure from a flight plan.
   * @param plan A flight plan.
   * @param destination The detsination airport of the flight plan.
   * @returns The approach procedure from the flight plan, or undefined if the plan has no approach.
   */
  public static getApproachFromPlan(plan: FlightPlan, destination: AirportFacility): ApproachProcedure | undefined {
    let approach = destination.approaches[plan.procedureDetails.approachIndex];

    if (!approach) {
      const visualRwyDesignation = plan.getUserData<string>('visual_approach');
      if (visualRwyDesignation && plan.destinationAirport) {
        const runway = RunwayUtils.matchOneWayRunwayFromDesignation(destination, visualRwyDesignation);
        if (runway) {
          approach = {
            name: `VISUAL ${visualRwyDesignation}`,
            runway: runway.designation,
            icaos: [],
            transitions: [],
            finalLegs: [],
            missedLegs: [],
            approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
            approachSuffix: '',
            runwayDesignator: runway.runwayDesignator,
            runwayNumber: runway.direction,
            rnavTypeFlags: RnavTypeFlags.None,
            rnpAr: false,
            missedApproachRnpAr: false,
          };
        }
      }
    }

    return approach;
  }

  /**
   * Checks whether a flight plan has an approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has an approach loaded.
   */
  public static isApproachLoaded(plan: FlightPlan): boolean {
    return plan.procedureDetails.approachIndex >= 0 || (plan.getUserData('visual_approach') !== undefined && plan.destinationAirport !== undefined);
  }

  /**
   * Checks whether a plan has a vectors-to-final approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has a vectors-to-final approach loaded.
   */
  public static isVtfApproachLoaded(plan: FlightPlan): boolean {
    return !!UnsFmsUtils.getApproachVtfLeg(plan);
  }

  /**
   * Gets the vectors-to-final leg of a flight plan.
   * @param plan A flight plan.
   * @returns The vectors-to-final leg of the flight plan, or undefined if one could not be found.
   */
  public static getApproachVtfLeg(plan: FlightPlan): LegDefinition | undefined {
    if (!UnsFmsUtils.isApproachLoaded(plan) || plan.procedureDetails.approachTransitionIndex >= 0) {
      return undefined;
    }

    // There should only be one approach segment
    for (const approachSegment of plan.segmentsOfType(FlightPlanSegmentType.Approach)) {
      return approachSegment.legs.find(leg => BitFlags.isAll(leg.flags, WT21LegDefinitionFlags.VectorsToFinal) && BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF));
    }

    return undefined;
  }

  /**
   * Gets the procedure index and transition index from procedure details of the lateral plan based on segment type.
   * @param segmentType The segment type.
   * @param lateralPlan The lateral flight plan.
   * @returns an array of procedureIndex, transitionIndex.
   */
  public static getProcedureIndexAndTransitionIndexFromSegmentType(segmentType: FlightPlanSegmentType, lateralPlan: FlightPlan): number[] {
    switch (segmentType) {
      case FlightPlanSegmentType.Departure:
        return [lateralPlan.procedureDetails.departureIndex, lateralPlan.procedureDetails.departureTransitionIndex];
      case FlightPlanSegmentType.Arrival:
        return [lateralPlan.procedureDetails.arrivalIndex, lateralPlan.procedureDetails.arrivalTransitionIndex];
      case FlightPlanSegmentType.Approach:
        return [lateralPlan.procedureDetails.approachIndex, lateralPlan.procedureDetails.approachTransitionIndex];
    }
    return [-1, -1];
  }

  /**
   * Gets the name of a departure procedure as a string.
   * @param facility The Facility.
   * @param procedureIndex The procedure index.
   * @returns The name of the departure procedure.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDepartureNameAsString(facility: AirportFacility, procedureIndex: number): string {
    // let name = '';

    const departure = facility.departures[procedureIndex];

    // if (runway) {
    //   name += `RW${runway.designation}.`;
    // }

    // const transition = departure.enRouteTransitions[transitionIndex];
    // if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
    //   name += `${departure.name}.${ICAO.getIdent(transition.legs[transition.legs.length - 1].fixIcao)}`;
    // } else if (departure.commonLegs.length > 0) {
    //   name += `${departure.name}.${ICAO.getIdent(departure.commonLegs[departure.commonLegs.length - 1].fixIcao)}`;
    // } else {
    //   name += `${departure.name}`;
    // }

    return `${departure.name}`;
  }

  /**
   * Gets the name of a arrival procedure as a string.
   * @param facility The airport to which the arrival belongs.
   * @param procedureIndex An arrival procedure index.
   * @param transitionIndex The index of the arrival enroute transition.
   * @returns The name of the arrival procedure.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getArrivalNameAsString(facility: AirportFacility, procedureIndex: number, transitionIndex: number): string {

    const arrival = facility.arrivals[procedureIndex];

    // TODO We may need to add back the transition name

    const transition = arrival.enRouteTransitions[transitionIndex];
    if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
      return `${ICAO.getIdent(transition.legs[0].fixIcao)}.${arrival?.name}`;
    } else {
      return `${arrival?.name}`;
    }
    // else if (arrival.commonLegs.length > 0) {
    //   name += `${ICAO.getIdent(arrival.commonLegs[0].fixIcao)}.${arrival?.name}`;
    // }


    // if (runway) {
    //   name += `.RW${runway.designation}`;
    // }

    // return `${arrival?.name}`;
  }

  /**
   * Utility method to analyze an approach for its name components and
   * pack them into a custom type.
   * @param proc The approach procedure.
   * @param transitionIndex The transition index.
   * @returns The name as an ApproachNameParts
   */
  public static getApproachNameAsParts(proc: ApproachProcedure, transitionIndex: number): ApproachNameParts {
    let type: string;
    // let subtype: string | undefined;
    // let rnavType: string | undefined;

    switch (proc.approachType) {
      case ApproachType.APPROACH_TYPE_GPS:
        type = 'GPS'; break;
      case ApproachType.APPROACH_TYPE_VOR:
        type = 'VOR'; break;
      case ApproachType.APPROACH_TYPE_NDB:
        type = 'NDB'; break;
      case ApproachType.APPROACH_TYPE_ILS:
        type = 'ILS'; break;
      case ApproachType.APPROACH_TYPE_LOCALIZER:
        type = 'LOC'; break;
      case ApproachType.APPROACH_TYPE_SDF:
        type = 'SDF'; break;
      case ApproachType.APPROACH_TYPE_LDA:
        type = 'LDA'; break;
      case ApproachType.APPROACH_TYPE_VORDME:
        type = 'VOR/DME'; break;
      case ApproachType.APPROACH_TYPE_NDBDME:
        type = 'NDB/DME'; break;
      case ApproachType.APPROACH_TYPE_RNAV:
        type = 'RNAV';
        break;
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        type = 'LOC BC'; break;
      case AdditionalApproachType.APPROACH_TYPE_VISUAL:
        type = 'VISUAL'; break;
      default:
        type = '???'; break;
    }

    const transition = transitionIndex > -1 && proc.transitions.length > 0 ? proc.transitions[transitionIndex].name
      : transitionIndex === 0 && proc.transitions.length === 0 && proc.finalLegs.length > 0 ? ICAO.getIdent(proc.finalLegs[0].fixIcao)
        : 'VECTORS';

    return {
      type: type,
      suffix: proc.approachSuffix ? proc.approachSuffix : undefined,
      runway: proc.runwayNumber === 0 ? undefined : RunwayUtils.getRunwayNameString(proc.runwayNumber, proc.runwayDesignator, true),
      transition: transition
    };
  }

  /**
   * Utility method that gets an approach and returns its name as a flat
   * string suitable for use in embedded text content.
   * @param approach the approach
   * @returns The formatted name as a string.
   */
  public static getApproachNameAsString(approach: ApproachProcedure): string {
    let type;
    switch (approach.approachType) {
      case ApproachType.APPROACH_TYPE_GPS: type = 'GPS'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_VOR: type = 'VOR'; break;
      case ApproachType.APPROACH_TYPE_NDB: type = 'NDB'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_ILS: type = 'ILS'; break;
      case ApproachType.APPROACH_TYPE_LOCALIZER: type = 'LOC'; break;
      case ApproachType.APPROACH_TYPE_SDF: type = 'SDF'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_LDA: type = 'SDF'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_VORDME: type = 'VOR/D'; break;
      case ApproachType.APPROACH_TYPE_NDBDME: type = 'NDB/D'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_RNAV: type = 'RNV'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE: type = 'LOC/B'; break; // TODO confirm
      case ApproachType.APPROACH_TYPE_UNKNOWN: type = 'UNK'; break;
      case AdditionalApproachType.APPROACH_TYPE_VISUAL: type = 'VFR'; break;
    }

    let displayName = type;

    if (approach.approachSuffix !== '') {
      displayName += ` ${approach.approachSuffix}`;
    }

    if (Number.isFinite(approach.runwayDesignator) && Number.isFinite(approach.runwayDesignator)) {
      displayName += ` ${RunwayUtils.getRunwayNameString(approach.runwayNumber, approach.runwayDesignator)}`;
    }

    return displayName;
  }

  /**
   * Get the name of an approach in the format used on the EFIS
   * @param facility An airport facility
   * @param procedureIndex Index of the desired approach
   * @returns formatted approach name ready for EFIS display
   */
  public static getApproachNameAsEfisString(facility: AirportFacility, procedureIndex: number): string;
  /**
   * Get the name of an approach in the format used on the EFIS
   * @param approach The desired approach procedure
   * @returns formatted approach name ready for EFIS display
   */
  public static getApproachNameAsEfisString(approach: ApproachProcedure): string;
  /**
   * Get the name of an approach in the format used on the EFIS
   * @param facilityOrApproach Either an airport facility (if combined with a procedure as the second arg) or an approach procedure
   * @param procedureIndex Index of the desired approach if the first arg is an airport facility
   * @returns formatted approach name ready for EFIS display
   */
  public static getApproachNameAsEfisString(facilityOrApproach: AirportFacility | ApproachProcedure, procedureIndex?: number): string {
    const approach = 'airportPrivateType' in facilityOrApproach ? facilityOrApproach.approaches[procedureIndex ?? -1] : facilityOrApproach;
    if (!approach) {
      return '???';
    }

    const parts = UnsFmsUtils.getApproachNameAsParts(approach, -1);
    if (parts.runway) {
      return `${parts.type}${parts.suffix ?? ''} ${parts.runway}`;
    } else {
      return `${parts.type}${parts.suffix ?? ''}`;
    }
  }

  /**
   * Checks whether an approach has a primary NAV frequency based on its type. Only approaches of the following types
   * have primary NAV frequencies: ILS, LOC (BC), LDA, SDF, VOR(DME).
   * @param approach The approach to check.
   * @returns Whether the specified approach has a primary NAV frequency based on its type.
   */
  public static approachHasNavFrequency(approach: ApproachProcedure): boolean {
    switch (approach.approachType) {
      case ApproachType.APPROACH_TYPE_ILS:
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
      case ApproachType.APPROACH_TYPE_LDA:
      case ApproachType.APPROACH_TYPE_SDF:
      case ApproachType.APPROACH_TYPE_VOR:
      case ApproachType.APPROACH_TYPE_VORDME:
        return true;
      default:
        return false;
    }
  }

  /**
   * Gets the nominal leg from which a specified flight plan leg originates. The nominal from leg excludes any legs
   * which are part of a direct to or vectors-to-final sequence.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment containing the leg for which to get the from leg.
   * @param segmentLegIndex The index of the leg for which to get the from leg in its segment.
   * @returns The nominal leg from which the specified flight plan leg originates.
   */
  public static getNominalFromLeg(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): LegDefinition | undefined {
    let leg = plan.getPrevLeg(segmentIndex, segmentLegIndex);

    if (!leg) {
      return undefined;
    }

    for (leg of plan.legs(true, plan.getLegIndexFromLeg(leg))) {
      if (!BitFlags.isAny(leg.flags, WT21LegDefinitionFlags.DirectTo | WT21LegDefinitionFlags.VectorsToFinal)) {
        return leg;
      }
    }

    return undefined;
  }

  /**
   * Gets the global leg index of the nominal leg from which a specified flight plan leg originates. The nominal from
   * leg excludes any legs which are part of a direct to or vectors-to-final sequence.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment containing the leg for which to get the from leg.
   * @param segmentLegIndex The index of the leg for which to get the from leg in its segment.
   * @returns The nominal leg from which the specified flight plan leg originates.
   */
  public static getNominalFromLegIndex(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): number {
    let leg = plan.getPrevLeg(segmentIndex, segmentLegIndex);

    if (!leg) {
      return -1;
    }

    let index = plan.getLegIndexFromLeg(leg);
    for (leg of plan.legs(true, index)) {
      if (!BitFlags.isAny(leg.flags, WT21LegDefinitionFlags.DirectTo | WT21LegDefinitionFlags.VectorsToFinal)) {
        return index;
      }
      index--;
    }

    return -1;
  }

  /** Copied from the CJ4 mod
   * @param value The scratchpad value.
   * @param verticalData The existing leg vertical data.
   * @returns False if invalid entry. */
  public static parseConstraintInput(value: string, verticalData: VerticalData): boolean | undefined {
    let re = /(\.?\d*)\/(F?|FL?)(-?\d+)([AB]?)(F?|FL?)(-?\d+)?([AB]?)/;
    // 1 = speed
    // 2 = F/FL
    // 3 = ALT
    // 4 = A/B
    // 5 = F/FL
    // 6 = ALT
    // 7 = A/B
    let match = value.match(re);
    if (!match) {
      // no match, input without speed?
      // eslint-disable-next-line no-useless-escape
      re = /()(F?|FL?)([\.-]?\d+)([AB]?)(F?|FL?)(-?\d+)?([AB]?)/;
      match = value.match(re);
      if (!match) {
        return false;
      }
      // if 0 <= alt < 500 and no FL it's a speed, if negative it's an altitude
      if (match[2] === '' && match[3] !== '' && isFinite(match[3] as any)) {
        const speed = Number(match[3]);
        if (speed >= 0 && speed < 500) {
          match[1] = speed as any;
          match[3] = '';
        }
      }
    }

    // speed
    if (match[1] !== '') {
      const speed = Number(match[1]);
      if (isFinite(speed) && speed >= 100 && speed < 500) {
        verticalData.speed = speed;
        verticalData.speedUnit = SpeedUnit.IAS;
        verticalData.speedDesc = SpeedRestrictionType.AtOrBelow;
      } else if (isFinite(speed) && speed >= 0.10 && speed <= 0.99) {
        verticalData.speed = speed;
        verticalData.speedUnit = SpeedUnit.MACH;
        verticalData.speedDesc = SpeedRestrictionType.AtOrBelow;
      } else {
        return false;
      }
    }

    // alt 1
    if (match[3] !== '') {
      const fl = match[2];
      let alt = Number(match[3]);
      if (isFinite(alt)) {
        const multi = (fl === 'F' || fl === 'FL') ? 100 : 1;
        alt *= multi;
        if (alt >= -1300 && alt <= 65000) {
          verticalData.altitude1 = UnitType.FOOT.convertTo(alt, UnitType.METER);
          // alt desc
          if (match[4] !== '') {
            verticalData.altDesc = (match[4] === 'A') ? AltitudeRestrictionType.AtOrAbove : AltitudeRestrictionType.AtOrBelow;
          } else {
            verticalData.altDesc = AltitudeRestrictionType.At;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    // alt 2
    if (match[6] !== '' && match[6] !== undefined) {
      const fl = match[5];
      let alt = Number(match[6]);
      if (isFinite(alt)) {
        const multi = (fl === 'F' || fl === 'FL') ? 100 : 1;
        alt *= multi;
        if (alt >= -1300 && alt <= 65000) {
          verticalData.altitude2 = UnitType.FOOT.convertTo(alt, UnitType.METER);
          // alt desc
          if (match[7] !== '') {
            verticalData.altitude2 = verticalData.altitude1;
            verticalData.altitude1 = UnitType.FOOT.convertTo(alt, UnitType.METER);
            verticalData.altDesc = AltitudeRestrictionType.Between;
          } else {
            verticalData.altDesc = AltitudeRestrictionType.At;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Method to get the FMS FPA display data for a leg from a VNavConstraint and VNavLeg.
   * @param vnavLeg The VNav Leg from the vertical flight plan that cooresponds to this leg index.
   * @param vnavConstraint The VNav Constraint from the Vertical Flight Plan that cooresponds to this leg index.
   * @param phase The vertical flight phase of this leg.
   * @returns A string to display on the FMC.
   */
  public static getFpaDisplayForLegs(vnavLeg: VNavLeg, vnavConstraint?: VNavConstraint, phase?: VerticalFlightPhase): string {
    let display;

    if (vnavLeg.invalidConstraintAltitude !== undefined) {
      display = `${phase === VerticalFlightPhase.Climb ? '↑' : '↓'}[s-text yellow]`;
    } else if (vnavConstraint?.type === 'climb' || vnavConstraint?.type === 'missed') {
      display = '↑[s-text green]';
    } else if (vnavConstraint !== undefined) {
      display = vnavLeg.fpa.toPrecision(2) + '°     ↓[s-text green]';
    } else {
      display = '';
    }

    return display;
  }

  /**
   * Method to get the FMS constraint display data from a verticalData object.
   * @param verticalData The Vertical Data object for the leg.
   * @param transitionAltitude The transition altitude that applies to the constraint.
   * @param constraintInvalid If the constraint is invalid.
   * @param isRunway If the constraint is a runway.
   * @returns A string to display on the FMC.
   */
  public static getConstraintDisplayForLegs(
    verticalData: VerticalData,
    transitionAltitude = 18000,
    constraintInvalid?: boolean,
    isRunway?: boolean
  ): string {
    let display;

    if (verticalData.speed && verticalData.speed > 0) {
      if (verticalData.speedUnit === SpeedUnit.MACH) {
        display = (verticalData.speed.toFixed(2).substring(1).padStart(3, ' ') + '/');
      } else {
        display = (verticalData.speed.toFixed(0).padStart(3, ' ') + '/');
      }
    } else {
      display = '---/';
    }

    // Makes sure that the left side, including the / is always green, in case the right side needs to be yellow
    display += '[green]';

    if (isRunway) {
      display += 'RWY '.padStart(6, ' ');
    } else {
      switch (verticalData.altDesc) {
        case AltitudeRestrictionType.At:
          display += UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude);
          display += ' ';
          break;
        case AltitudeRestrictionType.AtOrAbove:
          display += UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude) + 'A';
          break;
        case AltitudeRestrictionType.AtOrBelow:
          display += UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude) + 'B';
          break;
        case AltitudeRestrictionType.Between:
          display += (UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude2, transitionAltitude) + 'A'
            + UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude) + 'B').replace(/ /g, '');
          break;
        case AltitudeRestrictionType.Unused:
          display += '----- ';
      }
    }

    // Flight plan altitude constraints that exceed the
    // Cruise Altitude (CRZ ALT) specified by the crew
    // on the PERF INIT page show in yellow on the
    // ACT/MOD LEGS page
    // let crzAlt = performancePlanData.cruiseAltitude.get();
    let crzAlt = null; // TODO uns-1: figure where this comes from
    crzAlt = crzAlt == null ? null : crzAlt;
    let exceedsCrzAlt = false;

    if ([AltitudeRestrictionType.At, AltitudeRestrictionType.AtOrAbove].includes(verticalData.altDesc)) {
      if (crzAlt && UnitType.METER.convertTo(verticalData.altitude1, UnitType.FOOT) > crzAlt) {
        exceedsCrzAlt = true;
      }
    } else if (verticalData.altDesc === AltitudeRestrictionType.Between) {
      // We only care about the above portion, which in this case is altitude2
      if (crzAlt && UnitType.METER.convertTo(verticalData.altitude2, UnitType.FOOT) > crzAlt) {
        exceedsCrzAlt = true;
      }
    }

    if (exceedsCrzAlt || constraintInvalid) {
      display += '[yellow]';
    } else {
      display += '[green]';
    }

    return display;
  }

  /**
   * Method to get the FMS constraint display data from a verticalData object
   * @param verticalData is the Vertical Data object for the leg
   * @param transitionAltitude is the transition altitude that applies to the constraint
   * @returns A string to display on the FMC
   */
  public static getConstraintDisplayForDirectPage(verticalData: VerticalData, transitionAltitude = 18000): string {
    let display;

    switch (verticalData.altDesc) {
      case AltitudeRestrictionType.At:
        display = UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude);
        break;
      case AltitudeRestrictionType.AtOrAbove:
        display = UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude);
        break;
      case AltitudeRestrictionType.AtOrBelow:
        display = UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude1, transitionAltitude);
        break;
      case AltitudeRestrictionType.Between:
        display = UnsFmsUtils.parseAltitudeForDisplay(verticalData.altitude2, transitionAltitude);
        break;
      case AltitudeRestrictionType.Unused:
        display = '-----';
    }

    return display + '>[green]';
  }

  /**
   * Gets an altitude for display with padding, Flight Level Handling
   * @param altitudeMeters the altitude IN METERS to evaluate
   * @param transitionAltitudeFeet the transition altitude IN FEET to evaluate
   * @returns A display string
   */
  public static parseAltitudeForDisplay(altitudeMeters: number, transitionAltitudeFeet: number): string {
    const altitudeFeet = Math.round(UnitType.METER.convertTo(altitudeMeters, UnitType.FOOT));
    transitionAltitudeFeet = Math.round(transitionAltitudeFeet);
    if (altitudeFeet >= transitionAltitudeFeet) {
      return 'FL' + (altitudeFeet / 100).toFixed(0).padStart(3, '0');
    }
    return altitudeFeet.toFixed(0).padStart(5, ' ');
  }

  /**
   * Gets the direct to magnetic course from the leg vectors.
   * @param leg The Leg Definition
   * @returns the magnetic course.
   */
  public static getDirectToCourse(leg: LegDefinition): number {
    let course = 360;
    if (leg.leg.type === LegType.DF && leg.calculated !== undefined) {
      const vector = leg.calculated.flightPath[leg.calculated.flightPath.length - 1];
      if (vector !== undefined) {
        const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
        // If it is a great circle, then it's basically the "straight" part of the path, so we want to get the bearing at the start,
        // otherwise it's the turn, so we want the bearing from the end of the turn.
        const point = circle.isGreatCircle()
          ? this.geoPointCache[0].set(vector.startLat, vector.startLon)
          : this.geoPointCache[0].set(vector.endLat, vector.endLon);
        course = circle.bearingAt(point, Math.PI);
        course = MagVar.trueToMagnetic(course, MagVar.get(point));
      }
    } else if (leg.leg.type === LegType.CF && leg.calculated !== undefined) {
      course = leg.leg.course;
    }
    return course;
  }

  /**
   * Checks for an airway at a leg and returns the airway or undefined
   * @param facLoader The facility loader.
   * @param icao The icao of the entry to check.
   * @param airwayName The airway to search for.
   * @returns The airway object or undefined
   */
  public static async isAirwayAtLeg(facLoader: FacilityLoader, icao: string, airwayName: string): Promise<AirwayData | undefined> {
    const facility = await facLoader.getFacility(FacilityType.Intersection, icao);
    if (facility) {
      const matchedRoute = facility.routes.find((r) => r.name === airwayName);
      if (matchedRoute) {
        const airway = await facLoader.getAirway(matchedRoute.name, matchedRoute.type, icao);
        return airway;
      }
    }
    return undefined;
  }

  /**
   * Checks for an airway exit at a given icao.
   * @param airway The Airway Object.
   * @param icao The icao of the entry to check.
   * @returns The Intersection Facility if the leg is a valid exit to the airway.
   */
  public static isLegValidAirwayExit(airway: AirwayData, icao: string): IntersectionFacility | undefined {
    return airway.waypoints.find((w) => w.icao === icao);
  }

  /**
   * Checks for an airway exit matching an input ident
   * @param airway The AirwayObject.
   * @param ident The Ident to search for.
   * @returns The Intersection Facility if the leg is a valid exit to the airway.
   */
  public static matchIdentToAirway(airway: AirwayData, ident: string): IntersectionFacility | undefined {
    return airway.waypoints.find((w) => ICAO.getIdent(w.icao) === ident);
  }

  /**
   * Builds leg names using default nomenclature.
   * @param leg The leg to build a name for.
   * @returns The name of the leg.
   */
  public static buildUnsLegName(leg: FlightPlanLeg): string {
    // Name for PPOS hold leg
    if (leg.fixIcao === ICAO.emptyIcao && FlightPlanUtils.isHoldLeg(leg.type)) {
      return 'PPOS';
    }

    let legDistanceNM;
    switch (leg.type) {
      case LegType.CA:
      case LegType.FA:
      case LegType.HA:
      case LegType.VA:
        return `(${UnitType.METER.convertTo(leg.altitude1, UnitType.FOOT).toFixed(0)}FT)`;
      case LegType.FM:
      case LegType.VM:
        return '(VECTOR)';
      case LegType.HM:
        return '(HOLD)';
      case LegType.FC:
        legDistanceNM = Math.round(UnitType.METER.convertTo(leg.distance, UnitType.NMILE));
        return `D${leg.course.toFixed(0).padStart(3, '0')}${String.fromCharCode(64 + Utils.Clamp(legDistanceNM, 1, 26))}`;
      case LegType.CD:
      case LegType.FD:
      case LegType.VD:
        legDistanceNM = UnitType.METER.convertTo(leg.distance, UnitType.NMILE);
        return `${ICAO.getIdent(leg.originIcao)}${legDistanceNM.toFixed(1)}`;
      case LegType.CR:
      case LegType.VR:
        return `(R-${leg.theta.toString().padStart(3, '0')})`;
      case LegType.CI:
      case LegType.VI:
      case LegType.PI:
        return '(INTCPT)';
      default:
        return ICAO.getIdent(leg.fixIcao) + (leg.flyOver ? '*' : '');
    }
  }

  private static legAnnotationLengthFormatter = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '   ' });

  /**
   * Builds leg annotations using default nomenclature
   *
   * @param leg the leg data
   * @param calculated the leg calculated data
   * @param prevLeg the previous leg data
   * @param format the format for which page the annotation is being created
   * @param dtg the distance to go on the leg, in nm
   * @returns the annotation
   */
  public static buildUnsLegAnnotation(
    leg: LegDefinition,
    calculated: LegCalculations | undefined,
    prevLeg: LegDefinition | undefined,
    format: UnsLegAnnotationFormat,
    dtg: number | null
  ): string {
    const formatDegrees = (course: number): string => `${course.toFixed(0).padStart(3, '0')}°`;

    let directionString = '';

    let doShowDistance = true;
    if (prevLeg && FlightPlanUtils.isDiscontinuityLeg(prevLeg.leg.type)) {
      directionString = ` ${'-'.repeat(9)}`;
    } else {
      let direction = ' ';
      switch (leg.leg.turnDirection) {
        case LegTurnDirection.Left: direction = UnsChars.ArrowLeft; break;
        case LegTurnDirection.Right: direction = UnsChars.ArrowRight; break;
      }

      const isDtoTarget = UnsFmsUtils.isLegDirectToTarget(leg);

      const isOnAnyNavFormat = format === UnsLegAnnotationFormat.Nav
        || format === UnsLegAnnotationFormat.NavAppr
        || format === UnsLegAnnotationFormat.NavCompact
        || format === UnsLegAnnotationFormat.NavApprCompact;

      let effectiveLegType = leg.leg.type;
      if (isDtoTarget && isOnAnyNavFormat) {
        // On the NAV page, we treat a direct to target DF leg as a TF leg
        effectiveLegType = LegType.TF;
      }

      switch (effectiveLegType) {
        case LegType.IF:
        case LegType.TF: {
          const course = calculated?.initialDtk;
          const courseString = course != null ? `${formatDegrees(course)}` : '';

          directionString = `${direction}${format === UnsLegAnnotationFormat.Fpl ? '   ' : ''}${courseString}`;
          break;
        }
        case LegType.AF:
        case LegType.RF: {
          let radius = '---';
          if (leg.leg.type === LegType.RF && calculated) {
            const vectorRadius = calculated.flightPath[0].radius;
            const vectorRadiusNormalised = leg.leg.turnDirection === LegTurnDirection.Left ? vectorRadius : Math.PI - vectorRadius;

            radius = UnitType.NMILE.convertFrom(vectorRadiusNormalised, UnitType.GA_RADIAN).toFixed(1);
          } else {
            radius = UnitType.NMILE.convertFrom(leg.leg.rho, UnitType.METER).toFixed(1);
          }

          directionString = `${direction}ARC${radius}`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
        case LegType.CA:
        case LegType.FA:
        case LegType.CF:
        case LegType.CD:
        case LegType.CI:
        case LegType.CR: {
          const course = leg.leg.course;

          directionString = `${direction}CRS${formatDegrees(course)}`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
        case LegType.DF: return `${direction}DIRECT`;
        case LegType.FC:
        case LegType.FM: {
          const course = leg.leg.course;
          const fixIdent = ICAO.getIdent(leg.leg.originIcao).substring(0, 5);

          const showFix = format === UnsLegAnnotationFormat.Nav;

          directionString = `${direction}CRS${formatDegrees(course)}${showFix ? ` ${fixIdent}` : ''}`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
        case LegType.FD: {
          const course = leg.leg.course;

          directionString = `${direction}${formatDegrees(course)}`;
          break;
        }
        case LegType.HA:
        case LegType.HF:
        case LegType.HM: {
          const course = leg.leg.course;

          const fixText = format === UnsLegAnnotationFormat.Nav ? ` ${ICAO.getIdent(leg.leg.fixIcao).substring(0, 5)}` : '';

          directionString = `${direction}HLD${formatDegrees(course)}${fixText}`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
        case LegType.PI: {
          // FIXME in the real unit, it seems PIs are separated into two legs

          directionString = `${direction}PR-TURN`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
        case LegType.VA:
        case LegType.VD:
        case LegType.VI:
        case LegType.VM:
        case LegType.VR: {
          const heading = leg.leg.course;

          directionString = `${direction}HDG${formatDegrees(heading)}`;
          doShowDistance = format === UnsLegAnnotationFormat.Fpl;
          break;
        }
      }
    }

    if (format === UnsLegAnnotationFormat.Fpl) {
      directionString = directionString.padStart(7, ' ');
    }
    directionString = directionString.padEnd(format === UnsLegAnnotationFormat.Fpl ? 10 : 6, ' ');

    let distanceString = '';
    if (doShowDistance && calculated && Number.isFinite(calculated.distance) && calculated.distance !== 0) {
      const distanceNM = dtg ?? UnitType.NMILE.convertFrom(calculated.distance, UnitType.METER);

      distanceString = `${this.legAnnotationLengthFormatter(distanceNM)}NM`.padStart(6, ' ');
    }

    return `${directionString}${distanceString}`;
  }

  /**
   * Reconciles a flight plan's Direct-To data with its internal leg structure. Scans the legs of the flight plan for
   * Direct-To legs and sets the segment index and segment leg index of the plan's Direct-To data to point to the leg
   * immediately preceding the first Direct-To leg found, or to -1 for both if the plan contains no Direct-To legs.
   * @param plan A flight plan.
   */
  public static reconcileDirectToData(plan: FlightPlan): void {
    // Scan flight plan for DTO legs
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      for (let j = 0; j < segment.legs.length; j++) {
        const leg = segment.legs[j];
        if (BitFlags.isAll(leg.flags, WT21LegDefinitionFlags.DirectTo)) {
          plan.directToData.segmentIndex = i;
          plan.directToData.segmentLegIndex = j - 1;
          return;
        }
      }
    }

    plan.directToData.segmentIndex = -1;
    plan.directToData.segmentLegIndex = -1;
  }

  /**
   * Removes all of a flight plan's Direct-To data, but from the DirectToData object and from any legs in the plan.
   * Scans the legs of the flight plan for Direct-To legs and removes them.
   * @param plan A flight plan.
   */
  public static removeAllDirectToData(plan: FlightPlan): void {

    // Scan flight plan for DTO legs
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      for (let j = 0; j < segment.legs.length; j++) {
        const leg = segment.legs[j];
        if (BitFlags.isAll(leg.flags, WT21LegDefinitionFlags.DirectTo)) {
          plan.removeLeg(i, j, true);
        }
      }
    }

    plan.setDirectToData(-1, true);
  }

  /**
   * Removes all of a flight plan's Displaced Active Legs,
   * which are flagged when a procedure is added and the active leg array is moved to enroute.
   * @param plan A flight plan.
   */
  public static removeDisplacedActiveLegs(plan: FlightPlan): void {

    // Scan flight plan for DTO legs
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      for (let j = 0; j < segment.legs.length; j++) {
        const leg = segment.legs[j];
        if (BitFlags.isAll(leg.flags, WT21LegDefinitionFlags.DisplacedActiveLeg)) {
          plan.removeLeg(i, j, true);
        }
      }
    }
  }

  /**
   * Removes fix type flags from legs being moved from an approach procedure to the enroute segment.
   * @param legs The FlightPlanLegs to remove fix type flags from.
   * @returns The array of FlightPlanLegs with the flags removed.
   */
  public static removeFixTypeFlags(legs: FlightPlanLeg[]): FlightPlanLeg[] {
    for (let i = 0; i < legs.length; i++) {
      legs[i].fixTypeFlags = 0;
    }
    return legs;
  }

  /**
   * Returns hold legs in the flight plan. Used to determine and show appropriate HOLD pages.
   *
   * @param plan     the flight plan in question
   * @param inMissed whether to only include missed approach holds
   *
   * @returns the result
   */
  public static getPlanHolds(plan: FlightPlan, inMissed = false): LegDefinition[] {
    const holdLegs: LegDefinition[] = [];

    for (const leg of plan.legs()) {
      const legSegment = plan.getSegmentFromLeg(leg)?.segmentType;

      if (!inMissed && legSegment === FlightPlanSegmentType.MissedApproach) {
        continue;
      }

      if (inMissed && legSegment !== FlightPlanSegmentType.MissedApproach) {
        continue;
      }

      if (FlightPlanUtils.isHoldLeg(leg.leg.type)) {
        holdLegs.push(leg);
      }
    }

    return holdLegs;
  }

  /**
   * Calculates time in seconds to fly a certain distance at a ground speed
   *
   * @param distance distance to fly
   * @param groundSpeed GS to predict with
   *
   * @returns time in number of seconds
   */
  public static estimateSecondsForDistance(distance: number, groundSpeed: number): number {
    return (distance / groundSpeed) * 3600;
  }

  /**
   * Calculates distance flown for a number of seconds at a ground speed
   *
   * @param seconds time flown in number of seconds
   * @param groundSpeed GS to predict with
   *
   * @returns distance in nautical miles
   */
  public static estimateDistanceForSeconds(seconds: number, groundSpeed: number): number {
    return (seconds / 3600) * groundSpeed;
  }

  /**
   * Returns the index of the end of approach (EOA) point in a flight plan, or -1 if none is present
   *
   * @param plan the flight plan
   *
   * @returns a number
   */
  public static getEndOfApproachPoint(plan: FlightPlan): number {
    let ret = -1;

    const approachSegments = plan.segmentsOfType(FlightPlanSegmentType.Approach);

    for (const approachSegment of approachSegments) {
      for (let i = 0; i < approachSegment.legs.length; i++) {
        const leg = approachSegment.legs[i];

        if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
          ret = approachSegment.offset + i;
          break;
        }
      }
      break;
    }

    return ret;
  }

  /**
   * Returns the index of the FAF point in a flight plan, or -1 if none is present
   * @param plan flight plan
   * @returns a number
   */
  public static getFinalApproachFixIndex(plan: FlightPlan): number {
    let ret = -1;
    const approachSegments = plan.segmentsOfType(FlightPlanSegmentType.Approach);

    for (const approachSegment of approachSegments) {
      ret = approachSegment.offset + approachSegment.legs.findIndex((leg) => BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF));
    }

    return ret;
  }

  /**
   * Returns the index of the last non-missed approach leg in the flight plan
   *
   * @param plan the plan to use for lookup
   *
   * @returns array of index and ident, or undefined if no approach segment
   */
  public static getLastNonMissedApproachLeg(plan: FlightPlan): number {
    if (plan.length === 0) {
      return -1;
    }

    let legIndex = plan.length - 1;

    while (BitFlags.isAll(plan.getLeg(legIndex).flags, LegDefinitionFlags.MissedApproach)) {
      legIndex--;
    }

    return legIndex;
  }

  /**
   * Returns the distance between the end of a leg before a discontinuity and the start of the leg after that discontinuity
   *
   * @param prevLeg the leg before the discontinuity
   * @param nextLeg the leg after the discontinuity
   *
   * @returns the great circle distance between the end of the previous leg and the start of the next leg, in metres
   */
  public static distanceBetweenDiscontinuedLegs(prevLeg: LegDefinition, nextLeg: LegDefinition): number {
    let distance;

    if (prevLeg && nextLeg && prevLeg.calculated?.endLat && prevLeg.calculated.endLon && nextLeg.calculated?.endLat && nextLeg.calculated.endLon) {
      const term = new GeoPoint(prevLeg.calculated.endLat, prevLeg.calculated.endLon);
      const start = new GeoPoint(nextLeg.calculated.endLat, nextLeg.calculated.endLon);

      distance = UnitType.GA_RADIAN.convertTo(term.distance(start), UnitType.METER);
    } else {
      distance = 0;
    }

    return distance;
  }

  /**
   * Formats a facility frequency's type for display on the FMC
   *
   * @param frequency  the frequency
   * @param noneString (optional) the string to return when the type is "None"
   *
   * @returns a string
   */
  public static formatFacilityFrequencyType(frequency: FacilityFrequency, noneString = 'UNKNOWN'): string {
    switch (frequency.type) {
      case FacilityFrequencyType.ASOS:
        return 'ASOS';
      case FacilityFrequencyType.ATIS:
        return 'ATIS';
      case FacilityFrequencyType.AWOS:
        return 'AWOS';
      case FacilityFrequencyType.Approach:
        return 'APR';
      case FacilityFrequencyType.CPT:
      case FacilityFrequencyType.Clearance:
        return 'CLEARANCE';
      case FacilityFrequencyType.CTAF:
        return 'CTAF';
      case FacilityFrequencyType.Center:
        return 'CTR';
      case FacilityFrequencyType.Departure:
        return 'DEP';
      case FacilityFrequencyType.FSS:
        return 'FSS';
      case FacilityFrequencyType.GCO:
        return 'GCO';
      case FacilityFrequencyType.Ground:
        return 'GND';
      case FacilityFrequencyType.Multicom:
        return 'MULTICOM';
      case FacilityFrequencyType.Tower:
        return 'TWR';
      case FacilityFrequencyType.Unicom:
        return 'UNICOM';
      default:
        return noneString;
    }
  }

  /**
   * Returns the distance from PPOS to the end of a leg, given a lateral plan and a global leg index
   * @param lateralPlan the lateral plan
   * @param globalLegIndex the global leg index
   * @param legDistanceRemaining The remaining distance to the end of the leg currently tracked by LNAV, in nautical
   * miles.
   * @returns the distance, in metres
   */
  public static getDistanceFromPposToLegEnd(lateralPlan: FlightPlan, globalLegIndex: number, legDistanceRemaining: number): number | undefined {
    const legDistanceRemainingMetres = UnitType.METER.convertFrom(legDistanceRemaining, UnitType.NMILE);

    const currentLeg = lateralPlan.getLeg(lateralPlan.activeLateralLeg);
    const targetLeg = lateralPlan.getLeg(globalLegIndex);

    if (currentLeg.calculated && targetLeg.calculated) {
      const cumulativeDistanceToCurrentLeg = currentLeg.calculated?.cumulativeDistanceWithTransitions;
      const cumulativeDistanceToTargetLeg = targetLeg.calculated?.cumulativeDistanceWithTransitions;

      const distanceBetweenLegs = cumulativeDistanceToTargetLeg - cumulativeDistanceToCurrentLeg;

      return legDistanceRemainingMetres + distanceBetweenLegs;
    }

    return undefined;
  }

  /**
   * Checks whether a leg in the primary flight plan is a valid direct to target.
   * @param lateralPlan The lateral flight plan.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns Whether the leg is a valid direct to target.
   * @throws Error if a leg could not be found at the specified location.
   */
  public static canDirectTo(lateralPlan: FlightPlan, segmentIndex: number, segmentLegIndex: number): boolean {

    if (!lateralPlan) {
      return false;
    }

    const leg = lateralPlan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg || leg.leg.fixIcao === '' || leg.leg.fixIcao === ICAO.emptyIcao) {
      return false;
    }

    switch (leg.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
        return true;
    }

    return false;
  }


  /**
   * Formats latitude and longitude coordinates for the UNS.
   * @param coordinate The value of the coordinate.
   * @param type Either latitude or longitude.
   * @param dmsFormatter An instance of a DmsFormatter.
   * @returns A UNS-formatted coordinate string.
   * */
  public static coordinateFormatter(coordinate: number, type: 'lat' | 'lon', dmsFormatter: DmsFormatter): string {
    const { direction, degrees, minutes } = type === 'lat' ?
      dmsFormatter.parseLat(coordinate) :
      dmsFormatter.parseLon(coordinate);
    const spacePadding = ' '.repeat(type === 'lat' ? 2 : 1);
    const degPadding = type === 'lat' ? 2 : 3;

    return `${direction}${spacePadding}${degrees.toFixed().padStart(degPadding, '0')} ${minutes.toFixed(2).padStart(5, '0')}`;
  }
}

/** Transition List Items for the Select Procedure Page */
export interface TransitionListItem {
  /** Transition Name */
  name: string;
  /** Source Transition Index from Facility Approach */
  transitionIndex: number;
  /** The starting leg index from Facility Approach Transition for this offset transition */
  startIndex?: number;
}

/**
 * A type representing the three parts of an approach name.
 */
export type ApproachNameParts = {
  /** The approach type. */
  type: string;
  /** The approach suffix */
  suffix?: string;
  /** The runway identifier. */
  runway?: string;
  /** Additonal flags (eg, RNAV type) */
  flags?: string;
  /** The approach transition name. */
  transition?: string;
}

/**
 * Bitflags describing a leg definition specific to the WT21.
 *
 * FIXME we need this to be refactored into entirely separate flags, either higher in the bitfield or on another property entirely
 */
export enum WT21LegDefinitionFlags {
  None = 0,
  DirectTo = 1 << 0,
  MissedApproach = 1 << 1,
  Obs = 1 << 2,
  VectorsToFinal = 1 << 3,

  /**
   * A leg that was part of the active leg pair in a procedure when the procedure was removed,and was subsequently
   * moved to another segment in the plan.
   */
  DisplacedActiveLeg = (1 << 29),

  ProcedureLeg = (1 << 30),

  /**
   * Applied to the target leg of a direct to
   */
  DirectToTarget = (1 << 31),
}
