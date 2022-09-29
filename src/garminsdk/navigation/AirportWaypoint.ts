import { AirportFacility, AirportRunway, EventBus, FacilityWaypoint, UnitType } from 'msfssdk';

/**
 * Airport size.
 */
export enum AirportSize {
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small'
}

/**
 * A waypoint associated with an airport.
 */
export class AirportWaypoint<T extends AirportFacility = AirportFacility> extends FacilityWaypoint<T> {
  /** The longest runway at the airport associated with this waypoint, or null if the airport has no runways. */
  public readonly longestRunway: AirportRunway | null;

  /** The size of the airport associated with this waypoint. */
  public readonly size: AirportSize;

  /**
   * Constructor.
   * @param airport The airport associated with this waypoint.
   * @param bus The event bus.
   */
  constructor(airport: T, bus: EventBus) {
    super(airport, bus);

    this.longestRunway = AirportWaypoint.getLongestRunway(airport);
    this.size = AirportWaypoint.getAirportSize(airport, this.longestRunway);
  }

  /**
   * Gets the longest runway at an airport.
   * @param airport An airport.
   * @returns the longest runway at an airport, or null if the airport has no runways.
   */
  private static getLongestRunway(airport: AirportFacility): AirportRunway | null {
    if (airport.runways.length === 0) {
      return null;
    }

    return airport.runways.reduce((a, b) => a.length > b.length ? a : b);
  }

  /**
   * Gets the size of an airport.
   * @param airport An airport.
   * @param longestRunway The longest runway at the airport.
   * @returns the size of the airport.
   */
  private static getAirportSize(airport: AirportFacility, longestRunway: AirportRunway | null): AirportSize {
    if (!longestRunway) {
      return AirportSize.Small;
    }

    const longestRwyLengthFeet = UnitType.METER.convertTo(longestRunway.length, UnitType.FOOT) as number;
    return longestRwyLengthFeet >= 8100 ? AirportSize.Large
      : (longestRwyLengthFeet >= 5000 || airport.towered) ? AirportSize.Medium
        : AirportSize.Small;
  }
}