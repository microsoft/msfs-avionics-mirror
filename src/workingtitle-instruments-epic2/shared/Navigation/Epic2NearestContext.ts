import { ClockEvents, EventBus, FacilityLoader, GeoPoint, GNSSEvents, NearestContext, Subject, SubscribableUtils, Wait } from '@microsoft/msfs-sdk';

/**
 * A wrapper for NearestContext.
 */
export class Epic2NearestContext {
  public readonly referencePosition = Subject.create(new GeoPoint(NaN, NaN), SubscribableUtils.NEVER_EQUALITY);
  private readonly gpsPositionPipe = this.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1 / 3)
    .handle((pos) => this.referencePosition.set(this.referencePosition.get().set(pos.lat, pos.long)));

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly facLoader: FacilityLoader) { }

  /** Initializes the nearest context */
  public init(): void {
    this.facLoader.awaitInitialization().then(async () => {
      await Wait.awaitCondition(() => !isNaN(this.referencePosition.get().lat) && !isNaN(this.referencePosition.get().lon));

      NearestContext.initialize(this.facLoader, this.bus, this.referencePosition);

      NearestContext.getInstance().maxAirports = 50;
      NearestContext.getInstance().airportRadius = 100;
      NearestContext.getInstance().maxNdbs = 0;
      NearestContext.getInstance().ndbRadius = 0;
      NearestContext.getInstance().maxIntersections = 0;
      NearestContext.getInstance().intersectionRadius = 0;
      NearestContext.getInstance().maxVors = 50;
      NearestContext.getInstance().vorRadius = 220;

      this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1 / 3)
        .handle(() => NearestContext.getInstance().update());
    });
  }
}
