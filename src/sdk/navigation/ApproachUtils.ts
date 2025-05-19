import { BitFlags } from '../math/BitFlags';
import { DeepReadonly } from '../utils/types/UtilityTypes';
import {
  AdditionalApproachType, AirportFacility, ApproachIdentifier, ApproachProcedure, ApproachTypeName,
  ExtendedApproachType, FacilityFrequency, FacilityType, FixTypeFlags, FlightPlanLeg, NdbFacility, RnavTypeFlags,
  VorFacility, VorType
} from './Facilities';
import { FacilityLoader } from './FacilityLoader';
import { ICAO } from './IcaoUtils';
import { RunwayUtils } from './RunwayUtils';

/**
 * A utility class for working with approach procedures.
 */
export class ApproachUtils {

  /**
   * Converts an approach type name to its corresponding approach type.
   * @param name The name to convert.
   * @returns The approach type corresponding to the specified name.
   */
  public static nameToType(name: string): ExtendedApproachType {
    switch (name) {
      case ApproachTypeName.Gps: return ApproachType.APPROACH_TYPE_GPS;
      case ApproachTypeName.Vor: return ApproachType.APPROACH_TYPE_VOR;
      case ApproachTypeName.Ndb: return ApproachType.APPROACH_TYPE_NDB;
      case ApproachTypeName.Ils: return ApproachType.APPROACH_TYPE_ILS;
      case ApproachTypeName.Loc: return ApproachType.APPROACH_TYPE_LOCALIZER;
      case ApproachTypeName.Sdf: return ApproachType.APPROACH_TYPE_SDF;
      case ApproachTypeName.Lda: return ApproachType.APPROACH_TYPE_LDA;
      case ApproachTypeName.VorDme: return ApproachType.APPROACH_TYPE_VORDME;
      case ApproachTypeName.NdbDme: return ApproachType.APPROACH_TYPE_NDBDME;
      case ApproachTypeName.Rnav: return ApproachType.APPROACH_TYPE_RNAV;
      case ApproachTypeName.LocBackcourse: return ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE;
      case ApproachTypeName.GeneratedVisual: return AdditionalApproachType.APPROACH_TYPE_VISUAL;
      default:
        return ApproachType.APPROACH_TYPE_UNKNOWN;
    }
  }

  /**
   * Converts an approach type to its corresponding approach type name.
   * @param type The type to convert.
   * @returns The approach type name corresponding to the specified type.
   */
  public static typeToName(type: ExtendedApproachType): string {
    switch (type) {
      case ApproachType.APPROACH_TYPE_GPS: return ApproachTypeName.Gps;
      case ApproachType.APPROACH_TYPE_VOR: return ApproachTypeName.Vor;
      case ApproachType.APPROACH_TYPE_NDB: return ApproachTypeName.Ndb;
      case ApproachType.APPROACH_TYPE_ILS: return ApproachTypeName.Ils;
      case ApproachType.APPROACH_TYPE_LOCALIZER: return ApproachTypeName.Loc;
      case ApproachType.APPROACH_TYPE_SDF: return ApproachTypeName.Sdf;
      case ApproachType.APPROACH_TYPE_LDA: return ApproachTypeName.Lda;
      case ApproachType.APPROACH_TYPE_VORDME: return ApproachTypeName.VorDme;
      case ApproachType.APPROACH_TYPE_NDBDME: return ApproachTypeName.NdbDme;
      case ApproachType.APPROACH_TYPE_RNAV: return ApproachTypeName.Rnav;
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE: return ApproachTypeName.LocBackcourse;
      case AdditionalApproachType.APPROACH_TYPE_VISUAL: return ApproachTypeName.GeneratedVisual;
      default:
        return ApproachTypeName.Undefined;
    }
  }

  /**
   * Creates an empty approach identifier.
   * @returns An empty approach identifier.
   */
  public static emptyIdentifier(): ApproachIdentifier {
    return {
      __Type: 'JS_ApproachIdentifier',
      type: ApproachTypeName.Undefined,
      runway: RunwayUtils.emptyIdentifier(),
      suffix: ''
    };
  }

  /**
   * Sets an approach identifier to be empty.
   * @param ident The identifier to set.
   * @returns The specified identifier, after it has been set to be empty.
   */
  public static toEmptyIdentifier(ident: ApproachIdentifier): ApproachIdentifier {
    ident.type = ApproachTypeName.Undefined;
    RunwayUtils.toEmptyIdentifier(ident.runway);
    ident.suffix = '';
    return ident;
  }

  /**
   * Gets the identifier corresponding to an approach procedure.
   * @param approach The approach procedure for which to get an identifier.
   * @param out The object to which to write the result. If not defined, then a new identifier object will be created.
   * @returns The identifier corresponding to the specified approach procedure.
   */
  public static getIdentifier(approach: ApproachProcedure, out = ApproachUtils.emptyIdentifier()): ApproachIdentifier {
    out.type = ApproachUtils.typeToName(approach.approachType);
    out.runway.number = RunwayUtils.getNumberString(approach.runwayNumber);
    out.runway.designator = RunwayUtils.getDesignatorLetter(approach.runwayDesignator);
    out.suffix = approach.approachSuffix;
    return out;
  }

  /**
   * Checks whether two approach identifiers are equal.
   * @param a The first identifier.
   * @param b The second identifier.
   * @returns Whether the two specified approach identifiers are equal.
   */
  public static identifierEquals(a: DeepReadonly<ApproachIdentifier>, b: DeepReadonly<ApproachIdentifier>): boolean {
    return a.type === b.type
      && a.runway.number === b.runway.number
      && a.runway.designator === b.runway.designator
      && a.suffix === b.suffix;
  }

  /**
   * Gets the best RNAV minimum type available for a given approach.
   * @param query The approach to check, or its RNAV type flags.
   * @returns The best RNAV minimum type available for the specified approach.
   */
  public static getBestRnavType(query: ApproachProcedure | RnavTypeFlags): RnavTypeFlags {
    const rnavTypeFlags = typeof query === 'number' ? query : query.rnavTypeFlags;

    if (rnavTypeFlags & RnavTypeFlags.LPV) {
      return RnavTypeFlags.LPV;
    }
    if (rnavTypeFlags & RnavTypeFlags.LNAVVNAV) {
      return RnavTypeFlags.LNAVVNAV;
    }
    if (rnavTypeFlags & RnavTypeFlags.LP) {
      return RnavTypeFlags.LP;
    }
    if (rnavTypeFlags & RnavTypeFlags.LNAV) {
      return RnavTypeFlags.LNAV;
    }
    return RnavTypeFlags.None;
  }

  /**
   * Checks whether an approach procedure is an RNP (AR) approach.
   * @param approach The approach procedure to check.
   * @returns Whether the approach procedure is an RNP (AR) approach.
   */
  public static isRnpAr(approach: ApproachProcedure): boolean {
    return approach.rnpAr || approach.missedApproachRnpAr;
  }

  /**
   * Gets an approach frequency from its parent airport facility record.
   * @param facility The approach's parent airport facility.
   * @param approach The approach for which to get a frequency.
   * @returns The frequency of the specified approach, or `undefined` if one could not be found.
   */
  public static getFrequencyFromAirport(facility: AirportFacility, approach: ApproachProcedure): FacilityFrequency | undefined;
  /**
   * Gets an approach frequency from its parent airport facility record.
   * @param facility The approach's parent airport facility.
   * @param approachIndex The index of the approach for which to get a frequency.
   * @returns The frequency of the specified approach, or `undefined` if one could not be found.
   */
  public static getFrequencyFromAirport(facility: AirportFacility, approachIndex: number): FacilityFrequency | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getFrequencyFromAirport(facility: AirportFacility, approach: ApproachProcedure | number): FacilityFrequency | undefined {
    if (typeof approach === 'number') {
      approach = facility.approaches[approach];
    }

    if (approach) {
      switch (approach.approachType) {
        case ApproachType.APPROACH_TYPE_ILS:
        case ApproachType.APPROACH_TYPE_LOCALIZER:
        case ApproachType.APPROACH_TYPE_LDA:
        case ApproachType.APPROACH_TYPE_SDF:
          return RunwayUtils.getLocFrequency(facility, approach.runwayNumber, approach.runwayDesignator);
        case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
          return RunwayUtils.getBcFrequency(facility, approach.runwayNumber, approach.runwayDesignator);
      }
    }

    return undefined;
  }

  /**
   * Gets the origin facility ICAO for the FAF leg of an approach.
   * The facility type is **not** checked against the approach type to ensure it is valid,
   * in contrast to {@link getReferenceFacility} which does perform these checks.
   * @param approach The approach for which to get a reference facility.
   * @returns The ICAO of the origin facility for the FAF leg of the specified approach,
   * or `undefined` if one could not be found.
   */
  public static getFafOriginIcao(approach: ApproachProcedure): string | undefined {
    const finalLegs = approach.finalLegs;

    // Find the faf
    let fafLeg: FlightPlanLeg | undefined = undefined;
    for (let i = 0; i < finalLegs.length; i++) {
      const leg = finalLegs[i];
      if (BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.FAF)) {
        fafLeg = leg;
        break;
      }
    }

    if (!fafLeg || fafLeg.originIcao === ICAO.emptyIcao) {
      return undefined;
    }

    return fafLeg.originIcao;
  }

  /**
   * Gets the reference facility for an approach. Only ILS, LOC (BC), LDA, SDF, VOR(DME), and NDB(DME) approaches can
   * have reference facilities.
   * @param approach The approach for which to get a reference facility.
   * @param facLoader The facility loader.
   * @returns A Promise which is fulfilled with the reference facility for the specified approach, or `undefined` if
   * one could not be found.
   */
  public static async getReferenceFacility(approach: ApproachProcedure, facLoader: FacilityLoader): Promise<VorFacility | NdbFacility | undefined> {
    let facilityType: FacilityType;
    let isLoc = false;

    switch (approach.approachType) {
      case ApproachType.APPROACH_TYPE_ILS:
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
      case ApproachType.APPROACH_TYPE_LDA:
      case ApproachType.APPROACH_TYPE_SDF:
        isLoc = true;
      // eslint-disable-next-line no-fallthrough
      case ApproachType.APPROACH_TYPE_VOR:
      case ApproachType.APPROACH_TYPE_VORDME:
        facilityType = FacilityType.VOR;
        break;
      case ApproachType.APPROACH_TYPE_NDB:
      case ApproachType.APPROACH_TYPE_NDBDME:
        facilityType = FacilityType.NDB;
        break;
      default:
        return undefined;
    }

    const originIcao = ApproachUtils.getFafOriginIcao(approach);

    if (!originIcao || !ICAO.isFacility(originIcao, facilityType)) {
      return undefined;
    }

    try {
      const facility = await facLoader.getFacility(facilityType, originIcao);
      if (isLoc && (facility as VorFacility).type !== VorType.ILS) {
        return undefined;
      } else {
        return facility;
      }
    } catch {
      return undefined;
    }
  }
}
