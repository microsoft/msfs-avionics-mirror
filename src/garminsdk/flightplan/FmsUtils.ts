/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  AdditionalApproachType, AirportFacility, AltitudeRestrictionType, ApproachProcedure,
  ArrivalProcedure, BitFlags, DepartureProcedure, ExtendedApproachType,
  FixTypeFlags, FlightPlan, FlightPlanLeg, FlightPlanSegmentType, GeoCircle, GeoPoint,
  ICAO, LegDefinition, LegDefinitionFlags, LegType, MagVar, NavMath, OneWayRunway,
  FacilityType, RnavTypeFlags, RunwayUtils, UnitType, SpeedRestrictionType, FlightPlanSegment, FlightPlanUtils, VNavUtils, ApproachUtils
} from '@microsoft/msfs-sdk';
import { ApproachDetails, FmsFlightPhase } from './Fms';

/**
 * Utility Methods for the FMS.
 */
export class FmsUtils {
  /** The number of flight plan legs between a direct-to target leg and its associated direct-to leg. */
  public static readonly DTO_LEG_OFFSET = 3;

  private static readonly vec3Cache = [new Float64Array(3)];
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  /**
   * Gets the departure segment from a flight plan.
   * @param plan A flight plan.
   * @returns The departure segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getDepartureSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    // There should only be one departure segment
    for (const segment of plan.segmentsOfType(FlightPlanSegmentType.Departure)) {
      return segment;
    }

    return undefined;
  }

  /**
   * Gets the arrival segment from a flight plan.
   * @param plan A flight plan.
   * @returns The arrival segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getArrivalSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    // There should only be one arrival segment
    for (const segment of plan.segmentsOfType(FlightPlanSegmentType.Arrival)) {
      return segment;
    }

    return undefined;
  }

  /**
   * Gets the approach segment from a flight plan.
   * @param plan A flight plan.
   * @returns The approach segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getApproachSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    // There should only be one approach segment
    for (const segment of plan.segmentsOfType(FlightPlanSegmentType.Approach)) {
      return segment;
    }

    return undefined;
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
      fixIcao: RunwayUtils.getRunwayFacilityIcao(airport, oneWayRunway),
      altitude1: oneWayRunway.elevation
    });
    return leg;
  }

  /**
   * Utility method to return a one-way runway leg from an approach runway leg definition
   * @param airport is the facility associated with the arrival
   * @param runwayIcao is the icao string for the runway waypoint in the final legs
   * @returns a leg object for the runway
   */
  public static buildRunwayLegForApproach(airport: AirportFacility, runwayIcao: string): FlightPlanLeg | undefined {
    for (let i = 0; i < airport.runways.length; i++) {
      const match = RunwayUtils.getOneWayRunways(airport.runways[i], i).find((r) => {
        return (r.designation == ICAO.getIdent(runwayIcao));
      });
      if (match) {
        const leg = FlightPlan.createLeg({
          lat: match.latitude,
          lon: match.longitude,
          type: LegType.TF,
          fixIcao: runwayIcao
        });
        return leg;
      }
    }
    return undefined;
  }

  /**
   * Utility method to return a visual approach for a runway.
   * @param airport is the airport facility for the visual approach.
   * @param runway is the runway to build the visual approach for.
   * @param finalLegDistance is the distance from the runway to place the faf leg in NM.
   * @param initialLegDistance is the distance from the final leg to place the iaf leg in NM.
   * @param name is the optional name for the approach.
   * @param finalLegIdent is the optional name for the faf leg.
   * @param initialLegIdent is the optional name for the iaf leg.
   * @returns an approach procedure.
   */
  public static buildVisualApproach(
    airport: AirportFacility,
    runway: OneWayRunway,
    finalLegDistance: number,
    initialLegDistance: number,
    name?: string,
    finalLegIdent?: string,
    initialLegIdent?: string
  ): ApproachProcedure {
    const runwayVec = GeoPoint.sphericalToCartesian(runway.latitude, runway.longitude, FmsUtils.vec3Cache[0]);
    const approachPath = FmsUtils.geoCircleCache[0].setAsGreatCircle(runwayVec, runway.course);

    const iafLatLon = approachPath.offsetDistanceAlong(
      runwayVec,
      UnitType.NMILE.convertTo(-(initialLegDistance + finalLegDistance), UnitType.GA_RADIAN),
      FmsUtils.geoPointCache[0]
    );

    const runwayCode = RunwayUtils.getRunwayCode(runway.direction);
    const runwayLetter = RunwayUtils.getDesignatorLetter(runway.runwayDesignator).padStart(1, ' ');
    initialLegIdent ??= 'STRGHT';

    const iafLeg = FlightPlan.createLeg({
      type: LegType.IF,
      fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}${initialLegIdent}`,
      lat: iafLatLon.lat,
      lon: iafLatLon.lon,
    });

    const fafLatLon = approachPath.offsetDistanceAlong(
      runwayVec,
      UnitType.NMILE.convertTo(-finalLegDistance, UnitType.GA_RADIAN),
      FmsUtils.geoPointCache[0]
    );
    finalLegIdent ??= ' FINAL';

    const fafLeg = FlightPlan.createLeg({
      type: LegType.CF,
      fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}${finalLegIdent}`,
      course: MagVar.trueToMagnetic(approachPath.bearingAt(fafLatLon), fafLatLon),
      fixTypeFlags: FixTypeFlags.FAF,
      lat: fafLatLon.lat,
      lon: fafLatLon.lon,
      altDesc: AltitudeRestrictionType.AtOrAbove,
      // We want to be slightly below the glidepath at the faf so that if the plane is following VNAV, it will be able
      // to capture the GP from below.
      altitude1: runway.elevation + 10 + VNavUtils.altitudeForDistance(3, UnitType.NMILE.convertTo(finalLegDistance, UnitType.METER)),
    });

    const runwayLeg = FmsUtils.buildRunwayLeg(airport, runway, false);
    runwayLeg.altitude1 += 15; //Runway leg altitude should be 50 feet above threshold
    runwayLeg.fixTypeFlags = FixTypeFlags.MAP;

    const finalLegs: FlightPlanLeg[] = [];
    finalLegs.push(iafLeg);
    finalLegs.push(fafLeg);
    finalLegs.push(runwayLeg);

    const missedLegLatLon = approachPath.offsetDistanceAlong(
      runwayVec,
      UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN),
      FmsUtils.geoPointCache[0]
    );

    const missedLeg = FlightPlan.createLeg({
      type: LegType.TF,
      fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}MANSEQ`,
      lat: missedLegLatLon.lat,
      lon: missedLegLatLon.lon,
    });

    const missedLegs: FlightPlanLeg[] = [];
    missedLegs.push(missedLeg);

    const proc: ApproachProcedure = {
      name: name ?? `Visual RW${runway.designation}`,
      runway: RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator, false),
      icaos: [],
      transitions: [{ name: 'STRAIGHT', legs: [] }],
      finalLegs: finalLegs,
      missedLegs: missedLegs,
      approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
      approachSuffix: '',
      runwayDesignator: runway.runwayDesignator,
      runwayNumber: runway.direction,
      rnavTypeFlags: RnavTypeFlags.None
    };
    return proc;
  }

  /**
   * Builds an empty approach procedure object for a visual approach. The empty object contains all descriptive data
   * for the approach but lacks flight plan leg information for the approach.
   * @param runway The runway to which the approach belongs.
   * @returns An empty approach procedure object for the specified approach.
   */
  public static buildEmptyVisualApproach(
    runway: OneWayRunway
  ): ApproachProcedure {
    return {
      name: `VISUAL RW${runway.designation}`,
      runway: RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator, false),
      icaos: [],
      transitions: [{ name: 'STRAIGHT', legs: [] }],
      finalLegs: [],
      missedLegs: [],
      approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
      approachSuffix: '',
      runwayDesignator: runway.runwayDesignator,
      runwayNumber: runway.direction,
      rnavTypeFlags: RnavTypeFlags.None
    };
  }

  /**
   * Gets the best RNAV minimum type available for a given approach.
   * @param query The approach to check, or its RNAV type flags.
   * @returns The best RNAV minimum type available for the specified approach.
   */
  public static getBestRnavType = ApproachUtils.getBestRnavType;

  private static readonly APPROACH_TYPE_QUALITY: Record<ExtendedApproachType, number> = {
    [ApproachType.APPROACH_TYPE_UNKNOWN]: 0,
    [AdditionalApproachType.APPROACH_TYPE_VISUAL]: 1,
    [ApproachType.APPROACH_TYPE_NDB]: 2,
    [ApproachType.APPROACH_TYPE_NDBDME]: 3,
    [ApproachType.APPROACH_TYPE_VOR]: 4,
    [ApproachType.APPROACH_TYPE_VORDME]: 5,
    [ApproachType.APPROACH_TYPE_GPS]: 6,
    [ApproachType.APPROACH_TYPE_RNAV]: 7,
    [ApproachType.APPROACH_TYPE_SDF]: 8,
    [ApproachType.APPROACH_TYPE_LDA]: 9,
    [ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE]: 10,
    [ApproachType.APPROACH_TYPE_LOCALIZER]: 11,
    [ApproachType.APPROACH_TYPE_ILS]: 12
  };

  /**
   * Gets the best approach type available at an airport.
   * @param airport An airport facility.
   * @param includeVisual Whether to include visual approaches. Defaults to `false`.
   * @param includeRnpAr Whether to include RNP AR approaches. Defaults to `false`.
   * @returns The best approach type available at the specified airport.
   */
  public static getBestApproachType(airport: AirportFacility, includeVisual = false, includeRnpAr = false): ExtendedApproachType {
    let best: ExtendedApproachType = (includeVisual && airport.runways.length > 0) ? AdditionalApproachType.APPROACH_TYPE_VISUAL : ApproachType.APPROACH_TYPE_UNKNOWN;

    for (let i = 0; i < airport.approaches.length; i++) {
      const approach = airport.approaches[i];
      const type = approach.approachType;
      if ((includeRnpAr || !FmsUtils.isApproachRnpAr(approach)) && FmsUtils.APPROACH_TYPE_QUALITY[type] > FmsUtils.APPROACH_TYPE_QUALITY[best]) {
        best = type;
      }
    }

    return best;
  }

  /**
   * Utility method to check whether an approach is authorized for GPS guidance.
   * @param approach The approach procedure
   * @returns True if GPS guidance is authorized, false otherwise.
   */
  public static isGpsApproach(approach: ApproachProcedure): boolean {
    switch (approach.approachType) {
      case ApproachType.APPROACH_TYPE_GPS:
      case ApproachType.APPROACH_TYPE_RNAV:
        return true;
    }
    return false;
  }

  /**
   * Utility method to check for an approach with a a tunable localizer.
   * @param approach The approach procedure
   * @returns True if a localizer needs to be tuned, otherwise false.
   */
  public static isLocalizerApproach(approach: ApproachProcedure): boolean {
    switch (approach.approachType) {
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
   * Gets an approach procedure from a flight plan. If the flight plan has an visual approach loaded, an empty
   * procedure object, containing descriptive data for the approach but lacking flight plan leg information, will be
   * returned.
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
          approach = FmsUtils.buildEmptyVisualApproach(runway);
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
   * Gets the final approach fix leg of a flight plan.
   * @param plan A flight plan.
   * @returns The final approach fix leg of a flight plan, or `undefined` if one could not be found.
   */
  public static getApproachFafLeg(plan: FlightPlan): LegDefinition | undefined {
    if (!FmsUtils.isApproachLoaded(plan)) {
      return undefined;
    }

    return FmsUtils.getApproachSegment(plan)?.legs
      .find(leg => BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF) && !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo));
  }

  /**
   * Checks whether a plan has a vectors-to-final approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has a vectors-to-final approach loaded.
   */
  public static isVtfApproachLoaded(plan: FlightPlan): boolean {
    return plan.procedureDetails.approachIndex >= 0 && plan.procedureDetails.approachTransitionIndex === -1;
  }

  /**
   * Gets the vectors-to-final faf leg of a flight plan.
   * @param plan A flight plan.
   * @returns The vectors-to-final faf leg of the flight plan, or `undefined` if one could not be found.
   */
  public static getApproachVtfLeg(plan: FlightPlan): LegDefinition | undefined {
    if (!FmsUtils.isApproachLoaded(plan) || plan.procedureDetails.approachTransitionIndex >= 0) {
      return undefined;
    }

    return FmsUtils.getApproachSegment(plan)?.legs
      .find(leg => BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf));
  }

  /**
   * Gets the name of a departure procedure as a string.
   * @param airport The airport to which the departure belongs.
   * @param departure A departure procedure definition.
   * @param transitionIndex The index of the departure enroute transition.
   * @param runway The runway of the departure, if any.
   * @returns The name of the departure procedure.
   */
  public static getDepartureNameAsString(airport: AirportFacility, departure: DepartureProcedure, transitionIndex: number, runway: OneWayRunway | undefined): string {
    let name = `${ICAO.getIdent(airport.icao)}–`;

    if (runway) {
      name += `RW${runway.designation}.`;
    }

    const transition = departure.enRouteTransitions[transitionIndex];
    if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
      name += `${departure.name}.${ICAO.getIdent(transition.legs[transition.legs.length - 1].fixIcao)}`;
    } else if (departure.commonLegs.length > 0) {
      name += `${departure.name}.${ICAO.getIdent(departure.commonLegs[departure.commonLegs.length - 1].fixIcao)}`;
    } else {
      name += `${departure.name}`;
    }

    return name;
  }

  /**
   * Gets the name of a arrival procedure as a string.
   * @param airport The airport to which the departure belongs.
   * @param arrival An arrival procedure definition.
   * @param transitionIndex The index of the arrival enroute transition.
   * @param runway The runway of the arrival, if any.
   * @returns The name of the arrival procedure.
   */
  public static getArrivalNameAsString(airport: AirportFacility, arrival: ArrivalProcedure, transitionIndex: number, runway: OneWayRunway | undefined): string {
    let name = `${ICAO.getIdent(airport.icao)}–`;

    const transition = arrival.enRouteTransitions[transitionIndex];
    if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
      name += `${ICAO.getIdent(transition.legs[0].fixIcao)}.${arrival?.name}`;
    } else if (arrival.commonLegs.length > 0) {
      name += `${ICAO.getIdent(arrival.commonLegs[0].fixIcao)}.${arrival?.name}`;
    } else {
      name += `${arrival?.name}`;
    }

    if (runway) {
      name += `.RW${runway.designation}`;
    }

    return name;
  }

  /**
   * Gets the transition name and creates a default transition when the procedure has no transitions.
   * @param procedure is the departure procedure.
   * @param transitionIndex is the index of the enroute transition in the procedure.
   * @param rwyTransitionIndex is the index of the runway transition in the procedure.
   * @returns The transition name string.
   */
  public static getDepartureEnrouteTransitionName(procedure: DepartureProcedure, transitionIndex: number, rwyTransitionIndex: number): string {
    if (transitionIndex == -1) {
      if (procedure.commonLegs.length > 0) {
        const legsLen = procedure.commonLegs.length;
        /** For Departures, default transition name should be last leg icao */
        return ICAO.getIdent(procedure.commonLegs[legsLen - 1].fixIcao);
      } else if (rwyTransitionIndex !== -1) {
        const rwyTrans = procedure.runwayTransitions[rwyTransitionIndex];
        const legsLen = rwyTrans.legs.length;
        /** For Departures, default transition name should be last leg icao */
        return ICAO.getIdent(rwyTrans.legs[legsLen - 1].fixIcao);
      } else {
        return '';
      }
    } else {
      const enrTrans = procedure.enRouteTransitions[transitionIndex];
      if (enrTrans.name.length > 0) {
        return enrTrans.name;
      } else {
        /** For Departures, default transition name should be last leg icao */
        const legsLen = enrTrans.legs.length;
        return ICAO.getIdent(enrTrans.legs[legsLen - 1].fixIcao);
      }
    }
  }

  /**
   * Gets the transition name and creates a default transition when the procedure has no transitions.
   * @param procedure is the arrival procedure.
   * @param transitionIndex is the index of the enroute transition in the procedure.
   * @param rwyTransitionIndex is the index of the runway transition in the procedure.
   * @returns The transition name string.
   */
  public static getArrivalEnrouteTransitionName(procedure: ArrivalProcedure, transitionIndex: number, rwyTransitionIndex: number): string {
    if (transitionIndex == -1) {
      if (procedure.commonLegs.length > 0) {
        /** For Arrivals, default transition name should be first leg icao */
        return ICAO.getIdent(procedure.commonLegs[0].fixIcao);
      } else if (rwyTransitionIndex !== -1) {
        const rwyTrans = procedure.runwayTransitions[rwyTransitionIndex];
        /** For Arrivals, default transition name should be first leg icao */
        return ICAO.getIdent(rwyTrans.legs[0].fixIcao);
      } else {
        return '';
      }
    } else {
      const enrTrans = procedure.enRouteTransitions[transitionIndex];
      if (enrTrans.name.length > 0) {
        return enrTrans.name;
      } else {
        /** For Arrivals, default transition name should be first leg icao */
        return ICAO.getIdent(enrTrans.legs[0].fixIcao);
      }
    }
  }

  /**
   * Checks whether an approach procedure is an RNP (AR) approach.
   * @param proc The approach procedure to check.
   * @returns Whether the approach procedure is an RNP (AR) approach.
   */
  public static isApproachRnpAr = ApproachUtils.isRnpAr;

  /**
   * Utility method to analyze an approach for its name components and
   * pack them into a custom type.
   * @param proc The approach procedure.
   * @returns The name as an ApproachNameParts
   */
  public static getApproachNameAsParts(proc: ApproachProcedure): ApproachNameParts {
    let type: string;
    let subtype: string | undefined;
    let rnavType: string | undefined;

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

    const approachIsCircling = !proc.runway ? true : false;

    if (proc.approachType === ApproachType.APPROACH_TYPE_RNAV) {
      subtype = 'GPS';

      switch (FmsUtils.getBestRnavType(proc.rnavTypeFlags)) {
        case RnavTypeFlags.LNAV:
          rnavType = approachIsCircling ? 'LNAV' : 'LNAV+V'; break;
        case RnavTypeFlags.LP:
          rnavType = approachIsCircling ? 'LP' : 'LP+V'; break;
        case RnavTypeFlags.LNAVVNAV:
          rnavType = 'LNAV/VNAV'; break;
        case RnavTypeFlags.LPV:
          rnavType = 'LPV'; break;
        case RnavTypeFlags.None: // If there are no defined RNAV minima, assume it is an RNP (AR) approach if it is not circling.
          if (!approachIsCircling) {
            subtype = 'RNP';
          }
          break;
      }
    }

    return {
      type: type,
      subtype: subtype,
      suffix: proc.approachSuffix ? proc.approachSuffix : undefined,
      runway: proc.runwayNumber === 0 ? undefined : RunwayUtils.getRunwayNameString(proc.runwayNumber, proc.runwayDesignator, true),
      flags: rnavType
    };
  }

  /**
   * Utility method that takes an approach and returns its name as a flat
   * string suitable for use in embedded text content.
   * @param approach The approach as an ApproaceProcedure
   * @returns The formatted name as a string.
   */
  public static getApproachNameAsString(approach: ApproachProcedure): string {
    const parts = FmsUtils.getApproachNameAsParts(approach);
    let name = parts.type;
    parts.subtype && (name += `${parts.subtype}`);
    parts.suffix && (name += `${parts.runway ? ' ' : '–'}${parts.suffix}`);
    parts.runway && (name += ` ${parts.runway}`);
    parts.flags && (name += ` ${parts.flags}`);
    return name;
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
   * Gets an array of approaches from an airport.
   * @param airport An airport.
   * @param includeVisual Whether to include visual approaches. Defaults to `true`.
   * @returns An array of approaches.
   */
  public static getApproaches(airport?: AirportFacility, includeVisual = true): ApproachListItem[] {
    if (airport !== undefined) {
      const ilsFound = new Set();
      for (const approach of airport.approaches) {
        if (approach.approachType == ApproachType.APPROACH_TYPE_ILS) {
          ilsFound.add(approach.runway);
        }
      }

      const approaches: ApproachListItem[] = [];
      airport.approaches.forEach((approach, index) => {
        if (approach.approachType !== ApproachType.APPROACH_TYPE_LOCALIZER || !ilsFound.has(approach.runway)) {
          approaches.push({
            approach,
            index,
            isVisualApproach: false
          });
        }
      });

      if (includeVisual) {
        this.getVisualApproaches(airport).forEach(va => {
          approaches.push({
            approach: va,
            index: -1,
            isVisualApproach: true
          });
        });
      }

      return approaches;
    }
    return [];
  }

  /**
   * Gets the visual approaches for the facility.
   * @param facility is the facility.
   * @returns The Approach Procedures.
   */
  public static getVisualApproaches(facility: AirportFacility): ApproachProcedure[] {
    const runways = RunwayUtils.getOneWayRunwaysFromAirport(facility);
    const approaches: ApproachProcedure[] = [];
    runways.forEach(r => {
      approaches.push({
        name: `VISUAL ${r.designation}`,
        runway: r.designation,
        icaos: [],
        transitions: [{ name: 'STRAIGHT', legs: [] }],
        finalLegs: [],
        missedLegs: [],
        approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
        approachSuffix: '',
        runwayDesignator: r.runwayDesignator,
        runwayNumber: r.direction,
        rnavTypeFlags: RnavTypeFlags.None
      });
    });
    return approaches;
  }

  /**
   * Creates an ApproachListItem from an ApproachProcedure and the approach index.
   * @param approach The approach procedure.
   * @param index The approach index.
   * @returns The created ApproachListItem.
   */
  public static createApproachListItem(approach: ApproachProcedure, index: number): ApproachListItem {
    if (approach.approachType === AdditionalApproachType.APPROACH_TYPE_VISUAL) {
      return {
        approach,
        index: -1,
        isVisualApproach: true,
      };
    } else {
      return {
        approach,
        index: index,
        isVisualApproach: false,
      };
    }
  }

  /**
   * Gets the transitions for the approach, adding suffixes, vectors transtion, and default approach if needed.
   * @param approachItem The approach procedure to get the transitions for.
   * @returns The transitions for the approach.
   */
  public static getApproachTransitions(approachItem?: ApproachListItem): TransitionListItem[] {
    const approach = approachItem?.approach;
    const transitions: TransitionListItem[] = [];

    if (approach) {
      for (let i = 0; i < approach.transitions.length; i++) {
        transitions.push({
          name: this.getApproachTransitionName(approach, i),
          transitionIndex: i
        });
      }

      transitions.unshift({ name: 'VECTORS', transitionIndex: -1 });

      // If approach has no transitions in the nav data, create a default one beginning at the start of finalLegs
      if (!approachItem.isVisualApproach && approach.transitions.length === 0 && approach.finalLegs.length > 0) {
        transitions.push({
          name: ICAO.getIdent(approach.finalLegs[0].fixIcao),
          transitionIndex: 0
        });
      }
    }

    return transitions;
  }

  /**
   * Creates an TransitionListItem from an ApproachProcedure and the transition index.
   * @param approach The approach procedure.
   * @param transitionIndex The approach transition index.
   * @returns The created TransitionListItem.
   */
  public static createApproachTransitionListItem(approach: ApproachProcedure, transitionIndex: number): TransitionListItem {
    return {
      name: this.getApproachTransitionName(approach, transitionIndex),
      transitionIndex,
    };
  }

  /**
   * Creates an TransitionListItem from an ApproachProcedure and the transition index.
   * @param approach The approach procedure.
   * @param transitionIndex The approach transition index.
   * @returns The created TransitionListItem.
   */
  public static getApproachTransitionName(approach: ApproachProcedure, transitionIndex: number): string {
    if (transitionIndex === -1) { return 'VECTORS'; }

    const transition = approach.transitions[transitionIndex];

    if (!transition) { return ICAO.getIdent(approach.finalLegs[0].fixIcao); }

    const firstLeg = transition.legs[0];
    const name = transition.name ?? (firstLeg ? ICAO.getIdent(firstLeg.fixIcao) : '');
    const suffix = BitFlags.isAll(firstLeg?.fixTypeFlags ?? 0, FixTypeFlags.IAF) ? ' iaf' : '';

    return name + suffix;
  }

  /**
   * Gets the global leg index from a segment and segment leg index, whether or not the leg exists.
   * @param lateralPlan The Lateral Flight Plan.
   * @param segmentIndex The Segment Index.
   * @param segmentLegIndex The Segment Leg Index.
   * @returns The global leg index.
   */
  public static getGlobalLegIndex(lateralPlan: FlightPlan, segmentIndex: number, segmentLegIndex: number): number {
    if (segmentIndex < lateralPlan.segmentCount) {
      const segment = lateralPlan.getSegment(segmentIndex);
      return segment.offset + segmentLegIndex;
    }
    return -1;
  }

  /**
   * Gets the indexes for a leg.
   * @param lateralPlan The Lateral Flight Plan.
   * @param leg The leg definition.
   * @returns The leg indexes, or undefined if not found.
   */
  public static getLegIndexes(lateralPlan: FlightPlan, leg: LegDefinition): LegIndexes | undefined {
    const globalLegIndex = lateralPlan.getLegIndexFromLeg(leg);

    if (globalLegIndex === -1) { return undefined; }

    const segmentIndex = lateralPlan.getSegmentIndex(globalLegIndex);

    const segmentLegIndex = lateralPlan.getSegmentLegIndex(globalLegIndex);

    return {
      globalLegIndex,
      segmentIndex,
      segmentLegIndex,
    };
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
      if (!BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)) {
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
      if (!BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)) {
        return index;
      }
      index--;
    }

    return -1;
  }

  /**
   * Gets the leg from which a specified flight plan leg originates for the purpose of displaying the flight plan
   * from-to arrow.
   * @param plan A flight plan.
   * @param globalLegIndex The global index of the leg for which to get the from leg.
   * @returns The leg from which the specified flight plan leg originates for the purpose of displaying the from -to
   * arrow.
   */
  public static getFromLegForArrowDisplay(plan: FlightPlan, globalLegIndex: number): LegDefinition | undefined;
  /**
   * Gets the leg from which a specified flight plan leg originates for the purpose of displaying the flight plan
   * from-to arrow.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment containing the leg for which to get the from leg.
   * @param segmentLegIndex The index of the leg for which to get the from leg in its segment.
   * @returns The leg from which the specified flight plan leg originates for the purpose of displaying the from -to
   * arrow.
   */
  public static getFromLegForArrowDisplay(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): LegDefinition | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getFromLegForArrowDisplay(plan: FlightPlan, arg2: number, arg3?: number): LegDefinition | undefined {
    const globalLegIndex = arg3 === undefined ? arg2 : (plan.tryGetSegment(arg2)?.offset ?? -1 - arg3) + arg3;
    const toLeg = plan.tryGetLeg(globalLegIndex);

    if (!toLeg) {
      return undefined;
    }

    if (BitFlags.isAll(toLeg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      return undefined;
    }

    let prevLeg = plan.tryGetLeg(globalLegIndex - 1);

    if (!prevLeg) {
      return undefined;
    }

    switch (toLeg.leg.type) {
      case LegType.CA:
      case LegType.VA:
      case LegType.VM:
      case LegType.VI:
      case LegType.VD:
      case LegType.VR:
        return undefined;
      case LegType.CF: {
        const showDirectArrow = !!prevLeg && (
          FlightPlanUtils.isDiscontinuityLeg(prevLeg.leg.type)
          || prevLeg.leg.type === LegType.FM
          || prevLeg.leg.type === LegType.VM
        );
        if (showDirectArrow) {
          return undefined;
        }
      }
    }

    for (prevLeg of plan.legs(true, globalLegIndex - 1)) {
      if (!BitFlags.isAny(prevLeg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)) {
        return prevLeg;
      }
    }

    return undefined;
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
        if (BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo)) {
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
   * Gets the string for the leg fix type for use in a sequence list.
   * @param leg The leg definition.
   * @param allowHdg If false, will not return 'hdg'. Defaults to true.
   * @returns The left padded suffix string or empty string.
   */
  public static getSequenceLegFixTypeSuffix(leg: LegDefinition, allowHdg = true): string {
    if (leg.leg.type === LegType.VM && allowHdg === true) {
      return ' hdg';
    }

    if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
      return ' faf';
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.IAF)) {
      return ' iaf';
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return ' map';
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAHP)) {
      return ' mahp';
    }

    return '';
  }

  /**
   * Checks for a course reversal in the procedure.
   * @param legs The legs in the procedure.
   * @param ppos The current aircraft present position.
   * @returns true if there is an optional course reversal.
   */
  public static checkForCourseReversal(legs: LegDefinition[], ppos: GeoPoint): boolean {
    if (legs && legs.length > 0) {
      const leg = legs[1];
      switch (leg.leg.type) {
        case LegType.HA:
        case LegType.HF:
        case LegType.HM: {
          if (leg.calculated && leg.calculated.endLat && leg.calculated.endLon) {
            if (Math.abs(NavMath.diffAngle(MagVar.trueToMagnetic(ppos.bearingTo(leg.calculated.endLat, leg.calculated.endLon), ppos.lat, ppos.lon), leg.leg.course)) > 90) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Gets and returns the ICAO of first airport fix from the flight plan legs.
   * @param plan The flight plan to use.
   * @returns The ICAO of first airport fix from the flight plan legs.
   */
  public static getFirstAirportFromPlan(plan: FlightPlan): string | undefined {
    return this.getAirportFromPlan(plan, false);
  }

  /**
   * Gets and returns the ICAO of last airport fix from the flight plan legs.
   * @param plan The flight plan to use.
   * @returns The ICAO of last airport fix from the flight plan legs.
   */
  public static getLastAirportFromPlan(plan: FlightPlan): string | undefined {
    return this.getAirportFromPlan(plan, true);
  }

  /**
   * Gets and returns the ICAO of first or last airport fix from the flight plan legs.
   * @param plan The flight plan to use.
   * @param reverse Whether to get the first or last airport.
   * @returns The ICAO of last airport fix from the flight plan legs.
   */
  public static getAirportFromPlan(plan: FlightPlan, reverse: boolean): string | undefined {
    for (const leg of plan.legs(reverse)) {
      if (ICAO.isFacility(leg.leg.fixIcao) && ICAO.getFacilityType(leg.leg.fixIcao) === FacilityType.Airport) {
        return leg.leg.fixIcao;
      }
    }
    return undefined;
  }

  /**
   * Checks whether a flight plan leg's altitude constraint should be editable.
   * @param plan The flight plan containing the leg to evaluate.
   * @param leg The flight plan leg to evaluate.
   * @param isAdvancedVNav Whether this is for advanced vnav mode or not.
   * @returns whether a leg's altitude constraint should be editable.
   */
  public static isAltitudeEditable(
    plan: FlightPlan,
    leg: LegDefinition,
    isAdvancedVNav: boolean
  ): boolean {
    if (!this.isAltitudeVisible(plan, leg, isAdvancedVNav)) {
      return false;
    }

    // TODO FAF is only editable if next leg is not the MAP, or if RNAV approach?
    // TODO If there are legs between FAF and MAP, the last one will not be editable?
    // TODO If not editable, it appears to not be designatable as well, meaning VNAV won't use it?
    // TODO I think we will just make FAF always editable, but anything between FAF and MAP should not be editable

    if (!isAdvancedVNav && BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.MAHP)) {
      return false;
    }

    // In simple mode, no missed approach constraints are editable
    if (!isAdvancedVNav && BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach)) {
      return false;
    }

    if (isAdvancedVNav) {
      switch (leg.leg.type) {
        case LegType.CA:
        case LegType.FA:
        case LegType.VA:
        case LegType.HA:
          return false;
        default:
          return true;
      }
    } else {
      switch (leg.leg.type) {
        case LegType.CA:
        case LegType.FA:
        case LegType.VA:
        case LegType.HA:
        case LegType.HF:
        case LegType.HM:
        case LegType.FM:
        case LegType.VM:
        case LegType.CI:
        case LegType.VI:
        case LegType.CR:
        case LegType.VR:
          return false;
        default:
          return true;
      }
    }
  }

  /**
   * Checks whether a leg's altitude constraint should be visible.
   * @param plan The flight plan containing the leg to evaluate.
   * @param leg The flight plan leg to evaluate.
   * @param isAdvancedVNav Whether this is for advanced vnav mode or not.
   * @param isEditable Whether the constraint is editable, leave undefined if we don't know yet.
   * @returns whether a leg's altitude constraint should be visible.
   */
  public static isAltitudeVisible(
    plan: FlightPlan,
    leg: LegDefinition,
    isAdvancedVNav: boolean,
    isEditable?: boolean
  ): boolean {
    const segment = plan.getSegmentFromLeg(leg);

    if (!segment) {
      return false;
    }

    if (isEditable === false && leg.leg.altDesc === AltitudeRestrictionType.Unused) {
      return false;
    }

    // Altitudes on discontniuity legs are never visible (these legs should never be displayed in the first place).
    if (FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)) {
      return false;
    }

    const segmentLegIndex = segment.legs.indexOf(leg);
    const globalLegIndex = segment.offset + segmentLegIndex;

    // The altitude constraint on the target leg of an on-route direct-to is always visible.
    if (plan.directToData.segmentIndex === segment.segmentIndex && plan.directToData.segmentLegIndex === segmentLegIndex) {
      return true;
    }

    // The altitude constraint on the VTF faf leg is always visible.
    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      return true;
    }

    // The altitude constraint on the map leg is never visible.
    if (BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return false;
    }

    if (globalLegIndex === 0) {
      // The altitude constraint on the first flight plan leg is never visible, unless it is the first approach leg.
      // Note that the iaf of VTF approaches won't be handled by this case; VTF approaches always start with a
      // discontinuity leg so the iaf is never the first leg in the flight plan.
      return segment.segmentType === FlightPlanSegmentType.Approach && segmentLegIndex === 0;
    } else {
      // Altitude constraints on legs immediately following discontinuities are not visible. This includes the iaf of
      // VTF approaches.
      const prevLeg = plan.getLeg(globalLegIndex - 1);
      if (FlightPlanUtils.isDiscontinuityLeg(prevLeg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(prevLeg.leg.type)) {
        return false;
      }
    }

    if (isAdvancedVNav) {
      switch (leg.leg.type) {
        case LegType.FM:
        case LegType.VM:
        case LegType.HM:
          return false;
        default:
          return true;
      }
    } else {
      switch (leg.leg.type) {
        case LegType.FM:
        case LegType.VM:
        case LegType.HM:
        case LegType.CI:
        case LegType.VI:
        case LegType.CR:
        case LegType.VR:
          return false;
        default:
          return true;
      }
    }
  }

  /**
   * Returns the speed restriction type to use based on the published speed and what segment it's in.
   * @param publishedSpeedRestriction The published speed.
   * @param segmentType The segment type.
   * @returns The speed restriction type to use.
   */
  public static getPublishedSpeedDescBasedOnSegment(publishedSpeedRestriction: number, segmentType: FlightPlanSegmentType): SpeedRestrictionType {
    return publishedSpeedRestriction > 0 ?
      segmentType === FlightPlanSegmentType.Departure
        ? SpeedRestrictionType.AtOrBelow
        : SpeedRestrictionType.At
      : SpeedRestrictionType.Unused;
  }

  /**
   * Determines whether an altitude should be displayed as a flight level.
   * @param altitudeMeters The altitude in meters.
   * @returns Whether an altitude should be displayed as a flight level.
   */
  public static displayAltitudeAsFlightLevel(altitudeMeters: number): boolean {
    // TODO If we ever get transition level info from the sim, or implement the advanced VNAV Profile page (G3000), change this
    return Math.round(UnitType.METER.convertTo(altitudeMeters, UnitType.FOOT)) >= 18000;
  }

  /**
   * Checks whether two FMS flight phase objects are equal.
   * @param a The first FMS flight phase object to compare.
   * @param b The second FMS flight phase object to compare.
   * @returns Whether the two FMS flight phase objects are equal.
   */
  public static flightPhaseEquals(a: Readonly<FmsFlightPhase>, b: Readonly<FmsFlightPhase>): boolean {
    return a.isApproachActive === b.isApproachActive && a.isPastFaf === b.isPastFaf && a.isInMissedApproach === b.isInMissedApproach;
  }

  /**
   * Checks whether two FMS approach details objects are equal.
   * @param a The first FMS approach details object to compare.
   * @param b The second FMS approach details object to compare.
   * @returns Whether the two FMS approach details objects are equal.
   */
  public static approachDetailsEquals(a: Readonly<ApproachDetails>, b: Readonly<ApproachDetails>): boolean {
    return a.isLoaded === b.isLoaded
      && a.type === b.type
      && a.isRnpAr === b.isRnpAr
      && a.bestRnavType === b.bestRnavType
      && a.rnavTypeFlags === b.rnavTypeFlags
      && a.isCircling === b.isCircling
      && a.isVtf === b.isVtf
      && a.referenceFacility?.icao === b.referenceFacility?.icao;
  }
}

/** Transition List Items for the Select Procedure Page */
export interface TransitionListItem {
  /** Transition Name */
  name: string;
  /** Source Transition Index from Facility Approach */
  transitionIndex: number;
  /**
   * The starting leg index from Facility Approach Transition for this offset transition
   * @deprecated No longer used by anything. Used to be used for a workaround that is no longer needed.
   */
  startIndex?: number;
}

/**
 * A type representing the three parts of an approach name.
 */
export type ApproachNameParts = {
  /** The approach type. */
  type: string;
  /** The approach subtype (eg, GPS) */
  subtype?: string;
  /** The approach suffix */
  suffix?: string;
  /** The runway identifier. */
  runway?: string;
  /** Additonal flags (eg, RNAV type) */
  flags?: string;
}

/**
 * An approach paired with its index in the facility info.
 */
export type ApproachListItem = {
  /** The approach procedure. */
  approach: ApproachProcedure;
  /** The index in the facility info the approach. */
  index: number;
  /** Whether the approach is a visual approach. */
  isVisualApproach: boolean;
}

/** Structure containing useful leg related indices. */
export interface LegIndexes {
  /** The index of the segment. */
  segmentIndex: number;
  /** The index of the leg in the segment. */
  segmentLegIndex: number;
  /** The index of the leg in the flight plan. */
  globalLegIndex: number;
}
