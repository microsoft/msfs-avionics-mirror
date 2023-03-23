import { AbstractWaypoint, AirportFacility, GeoPoint, GeoPointInterface, GeoPointSubject, OneWayRunway, RunwayUtils, Subscribable, UnitType } from '@microsoft/msfs-sdk';

/**
 * A waypoint for a map runway label.
 */
export class MapRunwayLabelWaypoint extends AbstractWaypoint {
  private static readonly TYPE = 'RunwayLabel';

  private readonly _uid: string;
  private readonly _location: Subscribable<GeoPointInterface>;

  /**
   * Constructor.
   * @param airport The parent airport of the runway associated with this waypoint.
   * @param runway The runway associated with this waypoint.
   */
  constructor(airport: AirportFacility, public readonly runway: OneWayRunway) {
    super();

    this._uid = MapRunwayLabelWaypoint.getUid(airport, runway);
    this._location = GeoPointSubject.create(
      new GeoPoint(runway.latitude, runway.longitude).offset(runway.course, UnitType.METER.convertTo(-runway.startThresholdLength, UnitType.GA_RADIAN))
    );
  }

  /** @inheritdoc */
  public get type(): string {
    return MapRunwayLabelWaypoint.TYPE;
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
  public static getUid(airport: AirportFacility, runway: OneWayRunway): string {
    return `${RunwayUtils.getRunwayFacilityIcao(airport, runway)} LABEL`;
  }
}