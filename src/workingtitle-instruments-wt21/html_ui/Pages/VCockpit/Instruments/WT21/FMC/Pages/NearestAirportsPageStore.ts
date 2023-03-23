import { AirportFacility, ArraySubject, ConsumerSubject, EngineEvents, EventBus, GNSSEvents, OneWayRunway } from '@microsoft/msfs-sdk';

/**
 * Data for a nearest airport entry.
 */
export type NearestAirportData = {
  /** The airport facility. */
  airport: AirportFacility;

  /** The longest runway at the airport. */
  runway: OneWayRunway | null;

  /** The magnetic bearing to the airport. */
  bearing: number;

  /** The distance to the airport, in nautical miles. */
  distance: number;

  /** The estimated time enroute to the airport, in minutes. */
  ete: number;

  /** The estimated fuel remaining over the airport, in pounds. */
  fod: number;
};

/**
 * A data store for the nearest airports page.
 */
export class NearestAirportsPageStore {
  /** An array subject containing data on the airports to be displayed. */
  public readonly displayedAirports = ArraySubject.create<NearestAirportData>([]);

  /** The present position of the aircraft. */
  public readonly ppos = ConsumerSubject.create(this.eventBus.getSubscriber<GNSSEvents>().on('gps-position'), new LatLongAlt());

  /** The current true ground track of the aircraft. */
  public readonly course = ConsumerSubject.create(this.eventBus.getSubscriber<GNSSEvents>().on('track_deg_true'), 0);

  /** The current ground speed of the aircraft, in knots. */
  public readonly groundSpeed = ConsumerSubject.create(this.eventBus.getSubscriber<GNSSEvents>().on('ground_speed'), 0);

  /** The current total fuel flow of the aircraft, in gallons per hour. */
  public readonly fuelFlow = ConsumerSubject.create(this.eventBus.getSubscriber<EngineEvents>().on('fuel_flow_total'), 0);

  /** The current fuel on board the aircraft, in gallons. */
  public readonly fob = ConsumerSubject.create(this.eventBus.getSubscriber<EngineEvents>().on('fuel_total'), 0);

  /**
   * Constructor.
   * @param eventBus The event bus.
   */
  constructor(
    private readonly eventBus: EventBus
  ) {
  }

  /**
   * Destroys this store.
   */
  public destroy(): void {
    this.ppos.destroy();
    this.course.destroy();
    this.groundSpeed.destroy();
    this.fuelFlow.destroy();
    this.fob.destroy();
  }
}