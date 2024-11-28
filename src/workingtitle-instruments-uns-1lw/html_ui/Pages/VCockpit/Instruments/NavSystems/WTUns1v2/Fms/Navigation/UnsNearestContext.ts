import { ClockEvents, EventBus, Facility, FacilityLoader, GeoPoint, GNSSEvents, NearestContext, Subject, Wait } from '@microsoft/msfs-sdk';

/**
 * Events used for the nearest context
 */
export interface UnsNearestContextEvents {
  /** The reference position used for the UNS search */
  uns_search_reference_position: Facility | undefined
}

/**
 * A wrapper for NearestContext to allow for the dynamic setting of the reference position
 */
export class UnsNearestContext {
  public readonly referencePosition = Subject.create(new GeoPoint(0, 0));
  private gpsPositionPipe = this.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1 / 3)
    .handle((pos) => this.referencePosition.set(new GeoPoint(pos.lat, pos.long)));

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly facLoader: FacilityLoader) {}

  /** Initializes the nearest context */
  public init(): void {
    this.facLoader.awaitInitialization().then(async () => {
      await Wait.awaitCondition(() => Math.abs(this.referencePosition.get().lat) > Number.EPSILON && Math.abs(this.referencePosition.get().lon) > Number.EPSILON);

      NearestContext.initialize(this.facLoader, this.bus, this.referencePosition);

      NearestContext.getInstance().maxAirports = 70;
      NearestContext.getInstance().airportRadius = 300;
      NearestContext.getInstance().maxNdbs = 70;
      NearestContext.getInstance().ndbRadius = 300;
      NearestContext.getInstance().maxIntersections = 70;
      NearestContext.getInstance().intersectionRadius = 300;
      NearestContext.getInstance().maxVors = 70;
      NearestContext.getInstance().vorRadius = 300;

      this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1 / 3)
        .handle(() => NearestContext.getInstance().update());
      this.handleEvents();
    });
  }

  /**
   * Handles the nearest context position
   */
  private handleEvents(): void {
    this.bus.getSubscriber<UnsNearestContextEvents>().on('uns_search_reference_position')
      .handle((facility) => {
        if (facility) {
          this.gpsPositionPipe?.pause();
          this.referencePosition.set(new GeoPoint(facility.lat, facility.lon));
          NearestContext.getInstance().update();
        } else {
          this.gpsPositionPipe.resume();
        }
      });
  }
}
