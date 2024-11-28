import { ApproachListItem } from '@microsoft/msfs-garminsdk';
import { AdditionalApproachType, AirportRunway, ApproachProcedure, ArrivalProcedure, DepartureProcedure, ExtendedApproachType, OneWayRunway } from '@microsoft/msfs-sdk';

/**
 * Utility methods for the G3000 FMS.
 */
export class G3000FmsUtils {
  private static readonly RUNWAY_DESIGNATOR_PRIORITIES: Record<RunwayDesignator, number> = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: 0,
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 1,
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 2,
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 3,
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 4,
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 5,
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 6,
  };

  private static readonly APPROACH_TYPE_PRIORITIES: Record<ExtendedApproachType, number> = {
    [ApproachType.APPROACH_TYPE_ILS]: 0,
    [ApproachType.APPROACH_TYPE_LOCALIZER]: 1,
    [ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE]: 2,
    [ApproachType.APPROACH_TYPE_LDA]: 3,
    [ApproachType.APPROACH_TYPE_SDF]: 4,
    [ApproachType.APPROACH_TYPE_RNAV]: 5,
    [ApproachType.APPROACH_TYPE_GPS]: 6,
    [ApproachType.APPROACH_TYPE_VORDME]: 7,
    [ApproachType.APPROACH_TYPE_VOR]: 8,
    [ApproachType.APPROACH_TYPE_NDBDME]: 9,
    [ApproachType.APPROACH_TYPE_NDB]: 10,
    [AdditionalApproachType.APPROACH_TYPE_VISUAL]: 11,
    [ApproachType.APPROACH_TYPE_UNKNOWN]: 12
  };

  /**
   * Gets the sorting order of two runways.
   * @param a The first runway to sort.
   * @param b The second runway to sort.
   * @returns A negative number if runway `a` comes before runway `b`, a positive number if runway `a` comes after
   * runway `b`, or zero if both orderings are equivalent.
   */
  public static sortRunway(a: AirportRunway, b: AirportRunway): number {
    const primaryNumberA = parseInt(a.designation.split('-')[0]);
    const primaryNumberB = parseInt(b.designation.split('-')[0]);

    if (primaryNumberA < primaryNumberB) {
      return -1;
    } else if (primaryNumberA > primaryNumberB) {
      return 1;
    }

    return G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[a.designatorCharPrimary] - G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[b.designatorCharPrimary];
  }

  /**
   * Gets the sorting order of two one-way runways.
   * @param a The first runway to sort.
   * @param b The second runway to sort.
   * @returns A negative number if runway `a` comes before runway `b`, a positive number if runway `a` comes after
   * runway `b`, or zero if both orderings are equivalent.
   */
  public static sortOneWayRunway(a: OneWayRunway, b: OneWayRunway): number {
    if (a.direction < b.direction) {
      return -1;
    } else if (a.direction > b.direction) {
      return 1;
    }

    return G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[a.runwayDesignator] - G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[b.runwayDesignator];
  }

  /**
   * Gets the sorting order of two departures.
   * @param a The first departure to sort.
   * @param b The second departure to sort.
   * @returns A negative number if departure `a` comes before departure `b`, a positive number if departure `a` comes
   * after departure `b`, or zero if both orderings are equivalent.
   */
  public static sortDeparture(a: DepartureProcedure, b: DepartureProcedure): number {
    return a.name.localeCompare(b.name);
  }

  /**
   * Gets the sorting order of two arrivals.
   * @param a The first arrival to sort.
   * @param b The second arrival to sort.
   * @returns A negative number if arrival `a` comes before arrival `b`, a positive number if arrival `a` comes after
   * arrival `b`, or zero if both orderings are equivalent.
   */
  public static sortArrival(a: ArrivalProcedure, b: ArrivalProcedure): number {
    return a.name.localeCompare(b.name);
  }

  /**
   * Gets the sorting order of two approaches.
   * @param a The first approach to sort.
   * @param b The second approach to sort.
   * @returns A negative number if approach `a` comes before approach `b`, a positive number if approach `a` comes
   * after approach `b`, or zero if both orderings are equivalent.
   */
  public static sortApproach(a: ApproachProcedure, b: ApproachProcedure): number {
    // sort first by approach type (ILS, LOC, RNAV, etc)
    let compare = G3000FmsUtils.APPROACH_TYPE_PRIORITIES[a.approachType] - G3000FmsUtils.APPROACH_TYPE_PRIORITIES[b.approachType];
    if (compare === 0) {
      // then sort by runway (circling approaches go last)
      compare = (a.runwayNumber === 0 ? 37 : a.runwayNumber) - (b.runwayNumber === 0 ? 37 : b.runwayNumber);
      if (compare === 0) {
        // then sort by L, C, R
        compare = G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[a.runwayDesignator] - G3000FmsUtils.RUNWAY_DESIGNATOR_PRIORITIES[b.runwayDesignator];
        if (compare === 0) {
          // finally sort by approach suffix
          compare = a.approachSuffix.localeCompare(b.approachSuffix);
        }
      }
    }

    return compare;
  }

  /**
   * Gets the sorting order of two approach items.
   * @param a The first approach item to sort.
   * @param b The second approach item to sort.
   * @returns A negative number if approach item `a` comes before approach item `b`, a positive number if approach
   * item `a` comes after approach item `b`, or zero if both orderings are equivalent.
   */
  public static sortApproachItem(a: ApproachListItem, b: ApproachListItem): number {
    return G3000FmsUtils.sortApproach(a.approach, b.approach);
  }
}