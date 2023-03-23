import { FlightPlanLeg, LegType } from '../navigation/Facilities';
import { ArrayType, ArrayUtils } from '../utils/datastructures/ArrayUtils';

/**
 * Utility class for working with flight plans.
 */
export class FlightPlanUtils {
  /** Array of "to altitude" leg types. */
  private static readonly ALTITUDE_LEG_TYPES = [LegType.CA, LegType.FA, LegType.VA] as const;

  /** Array of "heading to" leg types. */
  private static readonly HEADING_LEG_TYPES = [LegType.VA, LegType.VD, LegType.VI, LegType.VM, LegType.VR] as const;

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
}