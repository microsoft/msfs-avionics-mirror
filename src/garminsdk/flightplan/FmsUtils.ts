/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AdditionalApproachType, AirportFacility, AltitudeRestrictionType, ApproachProcedure, ApproachUtils, ArrivalProcedure,
  BitFlags, Consumer, DepartureProcedure, EventBus, EventSubscriber, ExtendedApproachType, FacilityType, FixTypeFlags,
  FlightPathUtils, FlightPathVectorFlags, FlightPlan, FlightPlanLeg, FlightPlanSegment, FlightPlanSegmentType,
  FlightPlanUtils, GeoCircle, GeoPoint, ICAO, IcaoType, IcaoValue, LegCalculations, LegDefinition, LegDefinitionFlags,
  LegType, MagVar, NavMath, OneWayRunway, RnavTypeFlags, RunwayUtils, SpeedRestrictionType, UnitType, VNavUtils
} from '@microsoft/msfs-sdk';

import { BaseFmsEvents, FmsEventsForId } from './FmsEvents';
import {
  ApproachDetails, FmsFlightPhase, GarminAdditionalApproachType, GarminApproachProcedure, GarminVfrApproachProcedure
} from './FmsTypes';
import { FmsFplUserDataKey, FmsFplVfrApproachData, FmsFplVisualApproachData } from './FmsFplUserDataTypes';

/**
 * Utility Methods for the FMS.
 */
export class FmsUtils {
  /** The index of the primary flight plan. */
  public static readonly PRIMARY_PLAN_INDEX = 0;

  /** The index of the off-route direct-to flight plan. */
  public static readonly DTO_RANDOM_PLAN_INDEX = 1;

  /** The index of the procedure preview flight plan. */
  public static readonly PROC_PREVIEW_PLAN_INDEX = 2;

  /** The number of flight plan legs between a direct-to target leg and its associated direct-to leg. */
  public static readonly DTO_LEG_OFFSET = 3;

  private static readonly vec3Cache = [new Float64Array(3)];
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  /**
   * Subscribes to one of the event bus topics published by an FMS with a given ID.
   * @param id The ID of the FMS.
   * @param bus The event bus to which to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onFmsEvent<ID extends string, K extends keyof BaseFmsEvents>(id: ID, bus: EventBus, baseTopic: K): Consumer<BaseFmsEvents[K]>;
  /**
   * Subscribes to one of the event bus topics published by an FMS with a given ID.
   * @param id The ID of the FMS.
   * @param subscriber The event subscriber to use to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onFmsEvent<ID extends string, K extends keyof BaseFmsEvents>(id: ID, subscriber: EventSubscriber<FmsEventsForId<ID>>, baseTopic: K): Consumer<BaseFmsEvents[K]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static onFmsEvent<ID extends string, K extends keyof BaseFmsEvents>(
    id: ID,
    arg2: EventBus | EventSubscriber<FmsEventsForId<ID>>,
    baseTopic: K
  ): Consumer<BaseFmsEvents[K]> {
    return (arg2 instanceof EventBus ? arg2.getSubscriber<FmsEventsForId<ID>>() : arg2).on(
      `${baseTopic}${id === '' ? '' : `_${id}`}` as keyof FmsEventsForId<ID>
    ) as unknown as Consumer<BaseFmsEvents[K]>;
  }

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
   * Gets the first enroute segment from a flight plan.
   * @param plan A flight plan.
   * @returns The first enroute segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getFirstEnrouteSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    const segmentCount = plan.segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const segment = plan.tryGetSegment(i);
      if (segment && segment.segmentType === FlightPlanSegmentType.Enroute) {
        return segment;
      }
    }

    return undefined;
  }

  /**
   * Gets the last enroute segment from a flight plan.
   * @param plan A flight plan.
   * @returns The last enroute segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getLastEnrouteSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    const segmentCount = plan.segmentCount;
    for (let i = segmentCount - 1; i >= 0; i--) {
      const segment = plan.tryGetSegment(i);
      if (segment && segment.segmentType === FlightPlanSegmentType.Enroute) {
        return segment;
      }
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
   * Gets the destination segment from a flight plan.
   * @param plan A flight plan.
   * @returns The destination segment in the specified flight plan, or `undefined` if one does not exist.
   */
  public static getDestinationSegment(plan: FlightPlan): FlightPlanSegment | undefined {
    // There should only be one destination segment
    for (const segment of plan.segmentsOfType(FlightPlanSegmentType.Destination)) {
      return segment;
    }

    return undefined;
  }

  /**
   * Builds a flight plan leg to a runway fix.
   * @param airport The runway's parent airport or its ICAO.
   * @param runway The runway associated with the runway fix.
   * @param isInitialFix Whether to create the flight plan leg as an initial fix (IF) leg instead of a track-to-fix
   * (TF) leg.
   * @returns A flight plan leg to the specified runway fix.
   */
  public static buildRunwayLeg(airport: AirportFacility | IcaoValue, runway: OneWayRunway, isInitialFix: boolean): FlightPlanLeg {
    const runwayIcao = RunwayUtils.getRunwayFacilityIcaoValue(airport, runway);

    const leg = FlightPlan.createLeg({
      lat: runway.latitude,
      lon: runway.longitude,
      type: isInitialFix ? LegType.IF : LegType.TF,
      fixIcaoStruct: runwayIcao,
      altitude1: runway.elevation
    });

    return leg;
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
    const runwayLetter = RunwayUtils.getDesignatorLetter(runway.runwayDesignator).padStart(1, '-');
    initialLegIdent ??= 'STRGHT';

    const iafFixIcao = ICAO.value(IcaoType.VisualApproach, `${runwayCode}${runwayLetter}`, airport.icaoStruct.ident, initialLegIdent);
    const iafLeg = FlightPlan.createLeg({
      type: LegType.IF,
      fixIcaoStruct: iafFixIcao,
      lat: iafLatLon.lat,
      lon: iafLatLon.lon,
    });

    const fafLatLon = approachPath.offsetDistanceAlong(
      runwayVec,
      UnitType.NMILE.convertTo(-finalLegDistance, UnitType.GA_RADIAN),
      FmsUtils.geoPointCache[0]
    );
    finalLegIdent ??= 'FINAL';

    const fafFixIcao = ICAO.value(IcaoType.VisualApproach, `${runwayCode}${runwayLetter}`, airport.icaoStruct.ident, finalLegIdent);
    const fafLeg = FlightPlan.createLeg({
      type: LegType.CF,
      fixIcaoStruct: fafFixIcao,
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

    const missedFixIcao = ICAO.value(IcaoType.VisualApproach, `${runwayCode}${runwayLetter}`, airport.icaoStruct.ident, 'MANSEQ');
    const missedLeg = FlightPlan.createLeg({
      type: LegType.TF,
      fixIcaoStruct: missedFixIcao,
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
      rnavTypeFlags: RnavTypeFlags.None,
      rnpAr: false,
      missedApproachRnpAr: false,
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
      rnavTypeFlags: RnavTypeFlags.None,
      rnpAr: false,
      missedApproachRnpAr: false,
    };
  }

  /**
   * Creates a VFR approach object based on a published approach.
   * @param airport The airport facility containing the published approach on which the VFR approach is based.
   * @param approachIndex The index of the published approach on which the VFR approach is based.
   * @returns A new VFR approach object based on the specified published approach, or `undefined` if a VFR approach
   * could not be generated.
   */
  public static buildVfrApproach(
    airport: AirportFacility,
    approachIndex: number
  ): GarminVfrApproachProcedure | undefined {
    const approach = airport.approaches[approachIndex] as ApproachProcedure | undefined;

    if (!approach) {
      return undefined;
    }

    let didFindFaf = false;
    const publishedFinalLegs = approach.finalLegs;
    const finalLegs: FlightPlanLeg[] = [];
    for (let i = 0; i < publishedFinalLegs.length; i++) {
      // VFR approaches begin at the faf, so skip all legs until we find the faf.

      if (!didFindFaf && BitFlags.isAll(publishedFinalLegs[i].fixTypeFlags, FixTypeFlags.FAF)) {
        didFindFaf = true;
      }

      if (!didFindFaf) {
        continue;
      }

      const publishedLeg = publishedFinalLegs[i];

      if (BitFlags.isAll(publishedLeg.fixTypeFlags, FixTypeFlags.FAF)) {
        switch (publishedLeg.type) {
          case LegType.IF:
          case LegType.TF:
          case LegType.CF:
          case LegType.DF:
          case LegType.AF:
          case LegType.RF: {
            const insertLeg = FlightPlan.createLeg(publishedLeg);
            insertLeg.type = LegType.IF;
            finalLegs.push(insertLeg);
            break;
          }
          default:
            // If we can't convert the faf to an IF leg, then bail immediately since a non-VTF VFR approach must
            // begin with an IF leg at the faf.
            return undefined;
        }
      } else {
        finalLegs.push(FlightPlan.createLeg(publishedLeg));
      }

      // VFR approaches end at the map, so skip all legs after the map.
      if (BitFlags.isAll(publishedLeg.fixTypeFlags, FixTypeFlags.MAP)) {
        break;
      }
    }

    // VFR approaches must contain at least two legs: the faf and the map.
    if (finalLegs.length < 2) {
      return undefined;
    }

    // Ensure the last leg has the map flag.
    const lastLeg = finalLegs[finalLegs.length - 1];
    lastLeg.fixTypeFlags |= FixTypeFlags.MAP;

    const proc: GarminApproachProcedure = {
      name: approach.name,
      runway: approach.runway,
      icaos: [],
      transitions: [],
      finalLegs,
      missedLegs: [],
      approachType: GarminAdditionalApproachType.APPROACH_TYPE_VFR,
      approachSuffix: approach.approachSuffix,
      runwayDesignator: approach.runwayDesignator,
      runwayNumber: approach.runwayNumber,
      rnavTypeFlags: RnavTypeFlags.None,
      rnpAr: false,
      missedApproachRnpAr: false,
      parentApproachInfo: {
        approachType: approach.approachType,
        rnavTypeFlags: approach.rnavTypeFlags
      }
    };

    return proc;
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
   * @param destination The destination airport of the flight plan.
   * @returns The approach procedure from the flight plan, or undefined if the plan has no approach.
   */
  public static getApproachFromPlan(plan: FlightPlan, destination: AirportFacility): GarminApproachProcedure | undefined {
    if (destination.approaches[plan.procedureDetails.approachIndex]) {
      return destination.approaches[plan.procedureDetails.approachIndex];
    }

    const visualApproachData = plan.getUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach);
    if (visualApproachData && plan.destinationAirport) {
      const runway = RunwayUtils.matchOneWayRunwayFromDesignation(destination, visualApproachData.runwayDesignation);
      if (runway) {
        return FmsUtils.buildEmptyVisualApproach(runway);
      }
    }

    const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);
    if (vfrApproachData && plan.destinationAirport) {
      return FmsUtils.buildVfrApproach(destination, vfrApproachData.approachIndex);
    }

    return undefined;
  }

  /**
   * Checks whether a flight plan has an approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has an approach loaded.
   */
  public static isApproachLoaded(plan: FlightPlan): boolean {
    return FmsUtils.isPublishedApproachLoaded(plan)
      || FmsUtils.isVisualApproachLoaded(plan)
      || FmsUtils.isVfrApproachLoaded(plan);
  }

  /**
   * Checks whether a flight plan has an approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has an approach loaded.
   */
  public static isPublishedApproachLoaded(plan: FlightPlan): boolean {
    return plan.procedureDetails.approachIndex >= 0;
  }

  /**
   * Checks whether a flight plan has an approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has an approach loaded.
   */
  public static isVisualApproachLoaded(plan: FlightPlan): boolean {
    return plan.destinationAirport !== undefined
      && plan.getUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach) !== undefined;
  }

  /**
   * Checks whether a flight plan has an approach loaded.
   * @param plan A flight plan.
   * @returns Whether the flight plan has an approach loaded.
   */
  public static isVfrApproachLoaded(plan: FlightPlan): boolean {
    return plan.destinationAirport !== undefined
      && plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach) !== undefined;
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
    return (plan.procedureDetails.approachIndex >= 0 && plan.procedureDetails.approachTransitionIndex === -1)
      || (plan.getUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach)?.isVtf ?? false)
      || (plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach)?.isVtf ?? false);
  }

  /**
   * Gets the vectors-to-final faf leg of a flight plan.
   * @param plan A flight plan.
   * @returns The vectors-to-final faf leg of the flight plan, or `undefined` if one could not be found.
   */
  public static getApproachVtfLeg(plan: FlightPlan): LegDefinition | undefined {
    if (!FmsUtils.isVtfApproachLoaded(plan)) {
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
  public static getApproachNameAsParts(proc: GarminApproachProcedure): ApproachNameParts {
    let type: string;
    let subtype: string | undefined;
    let rnavType: string | undefined;

    let approachType: ExtendedApproachType;
    let rnavTypeFlags: number;
    if (proc.approachType === GarminAdditionalApproachType.APPROACH_TYPE_VFR) {
      approachType = proc.parentApproachInfo.approachType;
      rnavTypeFlags = proc.parentApproachInfo.rnavTypeFlags;
    } else {
      approachType = proc.approachType;
      rnavTypeFlags = proc.rnavTypeFlags;
    }

    switch (approachType) {
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
        type = 'RNAV'; break;
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        type = 'LOC BC'; break;
      case AdditionalApproachType.APPROACH_TYPE_VISUAL:
        type = 'VISUAL'; break;
      default:
        type = '???'; break;
    }

    const approachIsCircling = !proc.runway ? true : false;

    if (approachType === ApproachType.APPROACH_TYPE_RNAV) {
      subtype = 'GPS';

      switch (FmsUtils.getBestRnavType(rnavTypeFlags)) {
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
  public static getApproachNameAsString(approach: GarminApproachProcedure): string {
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
   * Gets an array of approach list items from an airport.
   * @param airport An airport.
   * @param includeVisual Whether to include visual approaches. Defaults to `true`.
   * @returns An array of approach list items for the specified airport.
   */
  public static getApproaches(airport?: AirportFacility, includeVisual = true): ApproachListItem[] {
    if (airport === undefined) {
      return [];
    }

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
      FmsUtils.getVisualApproaches(airport).forEach(va => {
        approaches.push({
          approach: va,
          index: -1,
          isVisualApproach: true
        });
      });
    }

    return approaches;
  }

  /**
   * Gets an array of approach list items from an airport.
   * @param airport An airport.
   * @returns An array of approach list items for the specified airport.
   */
  public static getVfrApproaches(airport?: AirportFacility): VfrApproachListItem[] {
    if (airport === undefined) {
      return [];
    }

    const approaches: VfrApproachListItem[] = [];

    for (let index = 0; index < airport.approaches.length; index++) {
      const approach = FmsUtils.buildVfrApproach(airport, index);
      if (approach) {
        approaches.push({
          approach,
          index
        });
      }
    }

    return approaches;
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
        rnavTypeFlags: RnavTypeFlags.None,
        rnpAr: false,
        missedApproachRnpAr: false,
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
   * Gets the nominal desired track for a flight plan leg, as `[dtk, magVar]` where `dtk` is the true desired track and
   * `magVar` is the magnetic variation used to convert between true and magnetic desired tracks, both in degrees. If a
   * nominal desired track could not be obtained, then the value of `dtk` will be equal to `NaN`.
   * @param leg The leg for which to get the nominal desired track.
   * @param out The array to which to write the results.
   * @returns The nominal desired track for the specified flight plan leg, as `[dtk, magVar]` where `dtk` is the true
   * desired track and `magVar` is the magnetic variation used to convert between true and magnetic desired tracks,
   * both in degrees.
   */
  public static getNominalLegDtk(leg: LegDefinition, out: Float64Array): Float64Array {
    out[0] = NaN;
    out[1] = 0;

    const legCalc = leg.calculated;

    if (!legCalc) {
      return out;
    }

    // Fallback resolution paths are equivalent to DF legs.
    if (
      !legCalc.endsInFallback
      && BitFlags.isAll(legCalc.flightPath[0]?.flags ?? 0, FlightPathVectorFlags.Fallback | FlightPathVectorFlags.Direct)
    ) {
      return FmsUtils.getNominalLegDtkForEndCourse(legCalc, out);
    }

    switch (leg.leg.type) {
      case LegType.FA:
      case LegType.CA:
      case LegType.VA:
      case LegType.FM:
      case LegType.VM:
      case LegType.DF:
      case LegType.CD:
      case LegType.VD:
      case LegType.CR:
      case LegType.VR:
      case LegType.CI:
      case LegType.VI:
        return FmsUtils.getNominalLegDtkForEndCourse(legCalc, out);
      case LegType.HM:
      case LegType.HF:
      case LegType.HA:
        // The nominal DTK for hold legs is the inbound course.
        if (legCalc.flightPath.length > 0) {
          // The last base flight path vector for hold legs should always be the inbound leg.
          const vector = legCalc.flightPath[legCalc.flightPath.length - 1];
          out[0] = FlightPathUtils.getVectorFinalCourse(vector);
          out[1] = legCalc.courseMagVar;
        }
        break;
      default: {
        // For all other leg types, the nominal DTK is the DTK at the beginning of the leg.
        const vector = legCalc.flightPath[0];
        if (vector) {
          out[0] = FlightPathUtils.getVectorInitialCourse(vector);
          out[1] = legCalc.courseMagVar;
        }
      }
    }

    return out;
  }

  /**
   * Gets the nominal desired track from a flight plan leg's last flight path vector, as `[dtk, magVar]` where `dtk` is
   * the true desired track and `magVar` is the magnetic variation used to convert between true and magnetic desired
   * tracks, both in degrees. If the last flight path vector is a great-circle vector, then the nominal desired track
   * is equal to the vector's initial course. Otherwise, the nominal desired track is equal to the vector's final
   * course. If no flight path vectors exist, then the output array is returned unchanged.
   * @param legCalc The calculations for the flight plan leg for which to get the desired track.
   * @param out The array to which to write the results.
   * @returns The nominal desired track from the specified flight plan leg's last flight path vector, as
   * `[dtk, magVar]` where `dtk` is the true desired track and `magVar` is the magnetic variation used to convert
   * between true and magnetic desired tracks, both in degrees.
   */
  private static getNominalLegDtkForEndCourse(legCalc: LegCalculations, out: Float64Array): Float64Array {
    const vector = legCalc.flightPath[legCalc.flightPath.length - 1];

    if (!vector) {
      return out;
    }

    if (FlightPathUtils.isVectorGreatCircle(vector)) {
      out[0] = FlightPathUtils.getVectorInitialCourse(vector);
    } else {
      out[0] = FlightPathUtils.getVectorFinalCourse(vector);
    }

    out[1] = legCalc.courseMagVar;

    return out;
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
  public static getFirstAirportFromPlan(plan: FlightPlan): IcaoValue | undefined {
    return this.getAirportFromPlan(plan, false);
  }

  /**
   * Gets and returns the ICAO of last airport fix from the flight plan legs.
   * @param plan The flight plan to use.
   * @returns The ICAO of last airport fix from the flight plan legs.
   */
  public static getLastAirportFromPlan(plan: FlightPlan): IcaoValue | undefined {
    return this.getAirportFromPlan(plan, true);
  }

  /**
   * Gets and returns the ICAO of first or last airport fix from the flight plan legs.
   * @param plan The flight plan to use.
   * @param reverse Whether to get the first or last airport.
   * @returns The ICAO of last airport fix from the flight plan legs.
   */
  public static getAirportFromPlan(plan: FlightPlan, reverse: boolean): IcaoValue | undefined {
    for (const leg of plan.legs(reverse)) {
      if (ICAO.isValueFacility(leg.leg.fixIcaoStruct, FacilityType.Airport)) {
        return leg.leg.fixIcaoStruct;
      }
    }
    return undefined;
  }

  /**
   * Determines if a flight plan leg's altitude constraint is considered to be edited. If the leg does not have a
   * designated altitude constraint, `false` will be returned.
   * @param leg A flight plan leg.
   * @param isAdvancedVNav Whether advanced VNAV is supported.
   * @returns Whether the specified flight plan leg's altitude constraint is considered to be edited.
   */
  public static isLegAltitudeEdited(leg: LegDefinition, isAdvancedVNav: boolean): boolean {
    const publishedAltDesc = leg.leg.altDesc;
    const constraintAltDesc = leg.verticalData.altDesc;

    if (constraintAltDesc === AltitudeRestrictionType.Unused) {
      return false;
    }

    const altitude1Feet = Math.round(UnitType.METER.convertTo(leg.verticalData.altitude1, UnitType.FOOT));
    const altitude2Feet = Math.round(UnitType.METER.convertTo(leg.verticalData.altitude2, UnitType.FOOT));
    const altitude1FeetPublished = Math.round(UnitType.METER.convertTo(leg.leg.altitude1, UnitType.FOOT));
    const altitude2FeetPublished = Math.round(UnitType.METER.convertTo(leg.leg.altitude2, UnitType.FOOT));

    if (isAdvancedVNav) {
      return constraintAltDesc !== publishedAltDesc
        || altitude1Feet !== altitude1FeetPublished
        || altitude2Feet !== altitude2FeetPublished;
    } else {
      if (publishedAltDesc === AltitudeRestrictionType.Unused) {
        return true;
      }

      // In simple mode, the auto-designated altitude is derived from altitude2 for between constraints and from
      // altitude1 for all other constraints.
      if (publishedAltDesc === AltitudeRestrictionType.Between) {
        return altitude1Feet !== altitude2FeetPublished;
      } else {
        return altitude1Feet !== altitude1FeetPublished;
      }
    }
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
   * @deprecated Speed restriction types should be taken directly from published flight plan procedure legs.
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
   * Creates a new empty, default flight phase object.
   * @returns A new empty, default flight phase object.
   */
  public static createEmptyFlightPhase(): FmsFlightPhase {
    return {
      isApproachActive: false,
      isToFaf: false,
      isPastFaf: false,
      isInMissedApproach: false
    };
  }

  /**
   * Checks whether two FMS flight phase objects are equal.
   * @param a The first FMS flight phase object to compare.
   * @param b The second FMS flight phase object to compare.
   * @returns Whether the two FMS flight phase objects are equal.
   */
  public static flightPhaseEquals(a: Readonly<FmsFlightPhase>, b: Readonly<FmsFlightPhase>): boolean {
    return a.isApproachActive === b.isApproachActive
      && a.isToFaf === b.isToFaf
      && a.isPastFaf === b.isPastFaf
      && a.isInMissedApproach === b.isInMissedApproach;
  }

  /**
   * Creates a new empty, default approach details object.
   * @returns A new empty, default approach details object.
   */
  public static createEmptyApproachDetails(): ApproachDetails {
    return {
      isLoaded: false,
      type: ApproachType.APPROACH_TYPE_UNKNOWN,
      isRnpAr: false,
      bestRnavType: RnavTypeFlags.None,
      rnavTypeFlags: RnavTypeFlags.None,
      isCircling: false,
      isVtf: false,
      referenceFacility: null,
      runway: null
    };
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
      && a.referenceFacility?.icao === b.referenceFacility?.icao
      && a.runway?.designation === b.runway?.designation;
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
};

/**
 * An approach procedure paired with its index in its parent airport facility.
 */
export type ApproachListItem = {
  /** The approach procedure. */
  approach: ApproachProcedure;
  /** The index of the approach in its parent airport facility. */
  index: number;
  /** Whether the approach is a visual approach. */
  isVisualApproach: boolean;
};

/**
 * A VFR approach procedure paired with the index of the published approach on which it is based.
 */
export type VfrApproachListItem = {
  /** The VFR approach procedure. */
  approach: GarminVfrApproachProcedure;
  /** The index of the published approach on which the VFR approach is based. */
  index: number;
};

/** Structure containing useful leg related indices. */
export interface LegIndexes {
  /** The index of the segment. */
  segmentIndex: number;
  /** The index of the leg in the segment. */
  segmentLegIndex: number;
  /** The index of the leg in the flight plan. */
  globalLegIndex: number;
}
