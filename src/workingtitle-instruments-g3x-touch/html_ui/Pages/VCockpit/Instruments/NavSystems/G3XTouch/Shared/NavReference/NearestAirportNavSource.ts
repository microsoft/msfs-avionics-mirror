import {
  AirportFacility, ConsumerSubject, ConsumerValue, EventBus, FacilityType, GNSSEvents, GeoPoint, GeoPointInterface,
  GeoPointSubject, ICAO, MagVar, MappedSubject, NavSourceType, Subject, Subscribable, SubscribableUtils, UnitType
} from '@microsoft/msfs-sdk';

import { AbstractNavReferenceBase, FmsPositionMode, FmsPositionSystemEvents, NavReferenceSource } from '@microsoft/msfs-garminsdk';

import { G3XNearestContext } from '../Nearest/G3XNearestContext';

/**
 * A `NavReferenceSource` that tracks the nearest airport to the airplane and provides information on the airport's
 * ident, location, bearing, and distance.
 */
export class NearestAirportNavSource<NameType extends string> extends AbstractNavReferenceBase implements NavReferenceSource<NameType> {
  private readonly fmsPosIndex: Subscribable<number>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);
  private readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));
  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly airportSource = Subject.create<AirportFacility | null>(
    null,
    (a, b) => (!a && !b) || (!!a && !!b && a.icao === b.icao)
  );
  private readonly airport = MappedSubject.create(
    ([fmsPosMode, airport]) => fmsPosMode === FmsPositionMode.None ? null : airport,
    this.fmsPosMode,
    this.airportSource
  );
  private readonly airportPos = new GeoPoint(0, 0);

  private readonly pposSub = this.ppos.sub(this.onPposChanged.bind(this), false, true);

  /**
   * Creates a new instance of NearestAirportNavSource.
   * @param bus The event bus.
   * @param name The name of this source.
   * @param index The index of this source.
   * @param fmsPosIndex The index of the 
   */
  public constructor(
    bus: EventBus,
    public readonly name: NameType,
    public readonly index: number,
    fmsPosIndex: number | Subscribable<number>
  ) {
    super();

    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    const sub = bus.getSubscriber<GNSSEvents & FmsPositionSystemEvents>();

    this.fmsPosIndex.sub(fmsPosIndexVal => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${fmsPosIndexVal}`));
      sub.on(`fms_pos_gps-position_${fmsPosIndexVal}`).handle(lla => { this.ppos.set(lla.lat, lla.long); });
    }, true);

    this.magVar.setConsumer(sub.on('magvar'));

    this.airport.sub(this.onAirportChanged.bind(this), true);

    this.initNearestAirportUpdates();
  }

  /**
   * Initializes nearest airport updates.
   */
  private async initNearestAirportUpdates(): Promise<void> {
    const context = await G3XNearestContext.getInstance();

    context.updateEvent.on(() => {
      this.airportSource.set(context.getNearest(FacilityType.Airport) ?? null);
    });
  }

  /** @inheritDoc */
  public getType(): NavSourceType.Gps {
    return NavSourceType.Gps;
  }

  /**
   * Responds to when the nearest airport changes.
   * @param airport The new nearest airport facility.
   */
  private onAirportChanged(airport: AirportFacility | null): void {
    this.pposSub.pause();

    if (airport === null) {
      this.signalStrength.set(0);
      this.ident.set(null);
      this.location.set(null);
      this.distance.set(null);
      this.bearing.set(null);
    } else {
      this.ident.set(ICAO.getIdent(airport.icao));
      this.location.set(airport);
      this.airportPos.set(airport);

      this.pposSub.resume(true);

      this.signalStrength.set(1);
    }
  }

  /**
   * Responds to when the airplane's position changes.
   * @param ppos The airplane's new position.
   */
  private onPposChanged(ppos: GeoPointInterface): void {
    this.distance.set(UnitType.GA_RADIAN.convertTo(ppos.distance(this.airportPos), UnitType.NMILE));

    const bearing = ppos.bearingTo(this.airportPos);

    this.bearing.set(isNaN(bearing) ? 0 : MagVar.trueToMagnetic(bearing, this.magVar.get()));
  }
}