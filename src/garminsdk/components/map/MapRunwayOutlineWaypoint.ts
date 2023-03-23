import {
  AbstractWaypoint, AirportFacility, AirportRunway, GeoPoint, GeoPointInterface, GeoPointSubject, RunwayUtils, Subscribable
} from '@microsoft/msfs-sdk';

/**
 * A waypoint for a map runway outline.
 */
export class MapRunwayOutlineWaypoint extends AbstractWaypoint {
  private static readonly TYPE = 'RunwayOutline';

  private readonly _uid: string;
  private readonly _location = GeoPointSubject.create(new GeoPoint(this.runway.latitude, this.runway.longitude));

  /** The surface category of this waypoint's associated runway. */
  public readonly surfaceCategory = RunwayUtils.getSurfaceCategory(this.runway);

  /** The primary runway number of this waypoint's associated runway. */
  public readonly primaryNumber = RunwayUtils.getRunwayNumberPrimary(this.runway);

  /** The secondary runway number of this waypoint's associated runway, or `undefined` if there is no secondary runway. */
  public readonly secondaryNumber = RunwayUtils.getRunwayNumberSecondary(this.runway);

  /**
   * Constructor.
   * @param airport The parent airport of the runway associated with this waypoint.
   * @param runway The runway associated with this waypoint.
   */
  constructor(airport: AirportFacility, public readonly runway: AirportRunway) {
    super();

    this._uid = MapRunwayOutlineWaypoint.getUid(airport, runway);
  }

  /** @inheritdoc */
  public get type(): string {
    return MapRunwayOutlineWaypoint.TYPE;
  }

  /** @inheritdoc */
  public get uid(): string {
    return this._uid;
  }

  /** @inheritdoc */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /**
   * Gets the unique ID for a MapRunwayLabelWaypoint associated with a given airport and runway.
   * @param airport The parent airport of the runway associated with the waypoint.
   * @param runway The runway associated with the waypoint.
   * @returns The unique ID for the waypoint associated with the specified airport and runway.
   */
  public static getUid(airport: AirportFacility, runway: AirportRunway): string {
    const runwayName = RunwayUtils.getRunwayPairNameString(runway);

    return `${airport.icao} RW${runwayName} OUTLINE`;
  }
}