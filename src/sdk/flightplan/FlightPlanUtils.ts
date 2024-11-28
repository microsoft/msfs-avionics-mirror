import { FacilityType, FlightPlanLeg, LegType } from '../navigation/Facilities';
import { IcaoValue } from '../navigation/Icao';
import { ICAO } from '../navigation/IcaoUtils';
import { ArrayType, ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { FlightPlanLegIndexes } from './FlightPlanning';

/**
 * Utility class for working with flight plans.
 */
export class FlightPlanUtils {
  /** Array of "to altitude" leg types. */
  private static readonly ALTITUDE_LEG_TYPES = [LegType.CA, LegType.FA, LegType.VA] as const;

  /** Array of "heading to" leg types. */
  private static readonly HEADING_LEG_TYPES = [LegType.VA, LegType.VD, LegType.VI, LegType.VM, LegType.VR] as const;

  /** Array of "to radial" leg types. */
  private static readonly TO_RADIAL_LEG_TYPES = [LegType.CR, LegType.VR] as const;

  /** Array of "hold" leg types. */
  private static readonly HOLD_LEG_TYPES = [LegType.HA, LegType.HF, LegType.HM] as const;

  /** Array of manual termination leg types that end in a discontinuity. */
  private static readonly MANUAL_DISCO_LEG_TYPES = [LegType.FM, LegType.VM] as const;

  /** Array of discontinuity leg types. */
  private static readonly DISCO_LEG_TYPES = [LegType.Discontinuity, LegType.ThruDiscontinuity] as const;

  /**
   * Checks if a leg type is an "to altitude" leg type.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a "to altitude" leg type.
   */
  public static isAltitudeLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.ALTITUDE_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.ALTITUDE_LEG_TYPES, legType);
  }

  /**
   * Checks if a leg type is a "heading to" leg type.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a "heading to" leg type.
   */
  public static isHeadingToLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.HEADING_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.HEADING_LEG_TYPES, legType);
  }

  /**
   * Checks if a leg type is a "to radial" leg type.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a "to radial" leg type.
   */
  public static isToRadialLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.TO_RADIAL_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.TO_RADIAL_LEG_TYPES, legType);
  }

  /**
   * Checks if a leg type is a "hold" leg type.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a "hold" leg type.
   */
  public static isHoldLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.HOLD_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.HOLD_LEG_TYPES, legType);
  }

  /**
   * Checks if a leg type is a manual termination leg type that ends in a discontinuity.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a manual termination leg type that ends in a discontinuity.
   */
  public static isManualDiscontinuityLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.MANUAL_DISCO_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.MANUAL_DISCO_LEG_TYPES, legType);
  }

  /**
   * Checks if a leg type is a discontinuity leg type.
   * @param legType The leg type to check.
   * @returns Whether the leg type is a discontinuity leg type.
   */
  public static isDiscontinuityLeg(legType: LegType): legType is ArrayType<typeof FlightPlanUtils.DISCO_LEG_TYPES> {
    return ArrayUtils.includes(FlightPlanUtils.DISCO_LEG_TYPES, legType);
  }

  /**
   * Gets the ICAO of the facility defining the terminator of a flight plan leg.
   * @param leg A flight plan leg.
   * @returns The ICAO of the facility defining the terminator of the specified flight plan leg, or `undefined` if
   * the leg's terminator is not defined by a facility.
   */
  public static getTerminatorIcao(leg: FlightPlanLeg): string | undefined {
    switch (leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HA:
      case LegType.HF:
      case LegType.HM:
        return leg.fixIcao;
      default:
        return undefined;
    }
  }

  /**
   * Creates a new {@link FlightPlanLegIndexes} object with all indexes set to `-1`.
   * @returns A new `FlightPlanLegIndexes` object with all indexes set to `-1`.
   */
  public static emptyLegIndexes(): FlightPlanLegIndexes {
    return { segmentIndex: -1, segmentLegIndex: -1 };
  }

  /**
   * Converts all runway ICAO references in a flight plan leg to the runway ICAO format used by the MSFS avionics
   * SDK.
   * @param leg The flight plan leg to change.
   * @returns The specified flight plan leg, after all of its runway ICAO references have been changed to the format
   * used by the MSFS avionics SDK.
   */
  public static convertLegRunwayIcaosToSdkFormat(leg: FlightPlanLeg): FlightPlanLeg {
    if (ICAO.isValueFacility(leg.fixIcaoStruct, FacilityType.RWY)) {
      const convertedIcao = ICAO.value(leg.fixIcaoStruct.type, '', leg.fixIcaoStruct.airport, leg.fixIcaoStruct.ident);
      leg.fixIcaoStruct = convertedIcao;
      leg.fixIcao = ICAO.tryValueToStringV1(convertedIcao);
    }

    if (ICAO.isValueFacility(leg.originIcaoStruct, FacilityType.RWY)) {
      const convertedIcao = ICAO.value(leg.originIcaoStruct.type, '', leg.originIcaoStruct.airport, leg.originIcaoStruct.ident);
      leg.originIcao = ICAO.tryValueToStringV1(convertedIcao);
    }

    if (ICAO.isValueFacility(leg.arcCenterFixIcaoStruct, FacilityType.RWY)) {
      const convertedIcao = ICAO.value(leg.arcCenterFixIcaoStruct.type, '', leg.arcCenterFixIcaoStruct.airport, leg.arcCenterFixIcaoStruct.ident);
      leg.arcCenterFixIcao = ICAO.tryValueToStringV1(convertedIcao);
    }

    return leg;
  }

  /**
   * Sets an ICAO property on a {@link FlightPlanLeg}, ensuring that both the associated value and string (V1)
   * properties stay in sync.
   * @param leg The flight plan leg to change.
   * @param prop The property to set.
   * @param icao The ICAO value to set on the property.
   * @returns The specified flight plan leg, after it has been changed.
   */
  public static setLegIcao(
    leg: FlightPlanLeg,
    prop: keyof Pick<FlightPlanLeg, 'fixIcaoStruct' | 'originIcaoStruct' | 'arcCenterFixIcaoStruct'>,
    icao: IcaoValue
  ): FlightPlanLeg {
    switch (prop) {
      case 'fixIcaoStruct':
        leg.fixIcaoStruct = icao;
        leg.fixIcao = ICAO.valueToStringV1(icao);
        break;
      case 'originIcaoStruct':
        leg.originIcaoStruct = icao;
        leg.originIcao = ICAO.valueToStringV1(icao);
        break;
      case 'arcCenterFixIcaoStruct':
        leg.arcCenterFixIcaoStruct = icao;
        leg.arcCenterFixIcao = ICAO.valueToStringV1(icao);
        break;
    }

    return leg;
  }
}
