import { AirportFacility, AirportRunway, BasicFacilityWaypoint, EventBus, UnitType } from '@microsoft/msfs-sdk';

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
export class AirportWaypoint extends BasicFacilityWaypoint<AirportFacility> {
  /** The longest runway at the airport associated with this waypoint, or null if the airport has no runways. */
  public readonly longestRunway: AirportRunway | null;

  /** The size of the airport associated with this waypoint. */
  public readonly size: AirportSize;

  /**
   * Creates a new instance of AirportWaypoint.
   * @param airport The airport associated with this waypoint.
   * @param bus The event bus.
   */
  public constructor(airport: AirportFacility, bus: EventBus) {
    super(airport, bus);

    this.longestRunway = AirportWaypoint.getLongestRunway(airport);
    this.size = AirportWaypoint.getAirportSize(airport, this.longestRunway);
  }

  /**
   * Gets the longest runway at an airport.
   * @param airport An airport.
   * @returns The longest runway at the specified airport, or `null` if the airport has no runways.
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
   * @returns The size of the airport.
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