
import { FmsUtils } from '@microsoft/msfs-garminsdk';
import {
  AirportFacility,
  ApproachProcedure,
  ArrivalProcedure,
  DepartureProcedure,
  FacilityFrequency,
  FacilityFrequencyType,
  FlightPlan,
  FlightPlanLeg,
  GeoCircle, GeoPoint, ICAO, LegType, OneWayRunway
} from '@microsoft/msfs-sdk';

/**
 * Utility Methods for the GNS FMS.
 */
export class GnsFmsUtils {
  private static readonly vec3Cache = [new Float64Array(3)];
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
  private static readonly facilityFrequencyPriorityMap = new Map<FacilityFrequencyType, number>([
    [FacilityFrequencyType.ATIS, 1],
    [FacilityFrequencyType.AWOS, 2],
    [FacilityFrequencyType.ASOS, 3],
    [FacilityFrequencyType.Clearance, 4],
    [FacilityFrequencyType.Ground, 5],
    [FacilityFrequencyType.GCO, 6],
    [FacilityFrequencyType.Tower, 7],
    [FacilityFrequencyType.CTAF, 8],
    [FacilityFrequencyType.CPT, 9],
    [FacilityFrequencyType.Unicom, 10],
    [FacilityFrequencyType.Multicom, 11],
    [FacilityFrequencyType.Departure, 12],
    [FacilityFrequencyType.Approach, 13],
    [FacilityFrequencyType.Center, 14],
    [FacilityFrequencyType.FSS, 15],
    [FacilityFrequencyType.None, 16],
  ]);

  /**
   * Tower/CTAF frequency types, ordered by priority
   */
  public static readonly towerOrCtafFrequencyTypes: readonly FacilityFrequencyType[] = [
    FacilityFrequencyType.Tower,
    FacilityFrequencyType.Unicom,
    FacilityFrequencyType.Multicom,
  ];

  /**
   * Tower/CTAF frequency type short names
   */
  public static readonly towerOrCtafFrequencyShortName = new Map<FacilityFrequencyType, string>([
    [FacilityFrequencyType.Tower, 'twr'],
    [FacilityFrequencyType.Unicom, 'uni'],
    [FacilityFrequencyType.Multicom, 'mul'],
  ]);

  /**
   * Gets the display string for the GNS from the airportPrivateType enum in the Airport Facility.
   * @param facility The Airport Facility.
   * @returns The display string.
   */
  public static getAirportPrivateTypeString(facility: AirportFacility | undefined): string {
    if (facility === undefined) {
      return '';
    } else {
      switch (facility.airportPrivateType) {
        case 1:
          return 'Public';
        case 2:
          return 'Military';
        case 3:
          return 'Private';
        default:
          return 'Uknown';
      }
    }
  }

  /**
   * Gets the display string for the GNS from the ExtendedApproachType.
   * @param facility The Airport Facility.
   * @param threeLetter Whether to give a three letter approach type string.
   * @returns The display string.
   */
  public static getBestApproachTypeString(facility: AirportFacility | undefined, threeLetter = false): string {
    if (facility === undefined) {
      return '';
    }
    switch (FmsUtils.getBestApproachType(facility)) {
      case ApproachType.APPROACH_TYPE_ILS:
        return 'ILS';
      case ApproachType.APPROACH_TYPE_LDA:
        return 'LDA';
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        return 'LOC';
      case ApproachType.APPROACH_TYPE_RNAV:
      case ApproachType.APPROACH_TYPE_GPS:
        return threeLetter ? 'RNV' : 'RNAV';
      case ApproachType.APPROACH_TYPE_VOR:
      case ApproachType.APPROACH_TYPE_VORDME:
        return 'VOR';
      case ApproachType.APPROACH_TYPE_NDB:
      case ApproachType.APPROACH_TYPE_NDBDME:
        return 'NBD';
    }
    return 'VFR';
  }


  /**
   * gets the facility frequency type string
   * @param freq the facility frequency
   * @param short whether to return the abbreviated version of the string, e.g. for NEAREST pages.
   * Only applicable for MULTICOM, UNICOM and TOWER.
   * @returns a string of the frequency type
   */
  public static getFacilityFrequencyType(freq: FacilityFrequency, short = false): string {
    switch (freq.type) {
      case 1:
        return 'ATIS';
      case 2:
        return short ? 'mul' : 'Multicom';
      case 3:
        return short ? 'uni' : 'Unicom';
      case 4:
        return 'CTAF';
      case 5:
        return 'Ground';
      case 6:
        return short ? 'twr' : 'Tower';
      case 7:
        return 'Clearance';
      case 8:
        return 'Approach';
      case 9:
        return 'Departure';
      case 10:
        return 'Center';
      case 11:
        return 'FSS';
      case 12:
        return 'AWOS';
      case 13:
        return 'ASOS';
      case 14:
        return 'CPT';
      case 15:
        return 'GCO';
    }
    return freq.name;
  }

  /**
   * Orders facility frequencies per the real GNS unit.
   * @param a The first facility frequency.
   * @param b The second facility frequency.
   * @returns The comparison order number.
   */
  public static orderFacilityFrequencies(a: FacilityFrequency, b: FacilityFrequency): number {
    const priorityA = GnsFmsUtils.facilityFrequencyPriorityMap.has(a.type) ? GnsFmsUtils.facilityFrequencyPriorityMap.get(a.type) : 100;
    const priorityB = GnsFmsUtils.facilityFrequencyPriorityMap.has(b.type) ? GnsFmsUtils.facilityFrequencyPriorityMap.get(b.type) : 100;

    if (priorityA && priorityB && priorityA < priorityB) {
      return -1;
    }

    if (priorityA && priorityB && priorityA > priorityB) {
      return 1;
    }

    return 0;
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
    //parts.subtype && (name += `${parts.subtype}`);
    parts.suffix && (name += `${parts.runway ? ' ' : '–'}${parts.suffix}`);
    parts.runway && (name += ` ${parts.runway}`);
    //parts.flags && (name += ` ${parts.flags}`);
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
    let name = `- ${ICAO.getIdent(airport.icao)}-`;

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
   * Gets the name of a departure procedure as a string.
   * @param airport The airport to which the departure belongs.
   * @param departure A departure procedure definition.
   * @param transitionIndex The index of the departure enroute transition.
   * @param runway The runway of the departure, if any.
   * @returns The name of the departure procedure.
   */
  public static getDepartureNameAsString(airport: AirportFacility, departure: DepartureProcedure, transitionIndex: number, runway: OneWayRunway | undefined): string {
    let name = `- ${ICAO.getIdent(airport.icao)}-`;

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
   * Checks the validity of a Flight Plan leg for the GNS and returns a leg to be inserted
   * into a procedure, or undefined if no leg should be inserted.
   * @param leg The FlightPlanLeg
   * @returns A leg to be inserted into a procedure, or undefined if no leg should be inserted.
   */
  public static gnsProcedureLegValid(leg: FlightPlanLeg): FlightPlanLeg | undefined {
    switch (leg.type) {
      case LegType.VD:
      case LegType.VR:
      case LegType.VI:
      case LegType.CI:
        return FlightPlan.createLeg({ type: LegType.ThruDiscontinuity });
      case LegType.RF:
        return {
          type: LegType.TF,
          fixIcao: leg.fixIcao,
          flyOver: leg.flyOver,
          distanceMinutes: leg.distanceMinutes,
          trueDegrees: leg.trueDegrees,
          turnDirection: leg.turnDirection,
          originIcao: leg.originIcao,
          arcCenterFixIcao: leg.arcCenterFixIcao,
          theta: leg.theta,
          rho: leg.rho,
          course: leg.course,
          distance: leg.distance,
          speedRestriction: leg.speedRestriction,
          altDesc: leg.altDesc,
          altitude1: leg.altitude1,
          altitude2: leg.altitude2,
          lat: leg.lat,
          lon: leg.lon,
          fixTypeFlags: leg.fixTypeFlags,
          verticalAngle: leg.verticalAngle,
        };
      default:
        return leg;
    }
  }

  /**
   * Gets the valid approaches for the GNS.
   * @param facility The Facility to get approaches from.
   * @returns an array of GNS-valid approaches.
   */
  public static getValidApproaches(facility: AirportFacility): GnsApproachMap[] {
    const procedures: GnsApproachMap[] = [];
    if (facility.approaches.length > 0) {
      for (let i = 0; i < facility.approaches.length; i++) {
        const approach: Readonly<ApproachProcedure> = facility.approaches[i];
        if (!(approach.approachType === ApproachType.APPROACH_TYPE_RNAV && approach.rnavTypeFlags === 0 && approach.runwayNumber !== 0)) {
          procedures.push({ index: i, approachProcedure: approach });
        }
      }
    }
    return procedures;
  }

}

/**
 * An object containing an approach procedure and it's index in the array of approaches in the Facility.
 */
export type GnsApproachMap = {
  /** The index of the approach in the array of approaches in the Facility. */
  index: number;
  /** The Approach Procedure. */
  approachProcedure: ApproachProcedure;
}