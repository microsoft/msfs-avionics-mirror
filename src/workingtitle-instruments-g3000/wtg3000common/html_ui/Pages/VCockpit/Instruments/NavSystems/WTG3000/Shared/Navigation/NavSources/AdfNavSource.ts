import { AdfRadioIndex, AhrsEvents, ConsumerSubject, EventBus, GeoPoint, MappedSubject, NavComEvents, NavComSimVars, NavMath, NavSourceType } from '@microsoft/msfs-sdk';
import { AbstractNavBase } from '../NavBase';
import { NavSource } from './NavSource';

/** Represents an ADF radio, subscribes to the ADF SimVars. */
export class AdfRadioSource<NameType extends string> extends AbstractNavBase implements NavSource<NameType> {
  private readonly signal: ConsumerSubject<number>;
  private readonly relativeBearing: ConsumerSubject<number>;
  private readonly heading: ConsumerSubject<number>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param name The name of this source.
   * @param index The index of this source.
   */
  public constructor(bus: EventBus, public readonly name: NameType, public readonly index: AdfRadioIndex) {
    super();

    const navComSubscriber = bus.getSubscriber<NavComEvents>();
    this.signal = ConsumerSubject.create(navComSubscriber.on(`adf_signal_${index}`), 0);
    this.relativeBearing = ConsumerSubject.create(navComSubscriber.on(`adf_bearing_${index}`), 0);

    const tempLocation = new GeoPoint(0, 0);

    // Pretty sure there is no NDB at {0 N, 0 E}, so we can safely assume if we ever get that data from the sim there
    // is no valid tuned station.
    navComSubscriber.on(`adf_lla_${index}`).handle(val => {
      if (val.lat === 0 && val.long === 0) {
        this.location.set(null);
      } else {
        this.location.set(tempLocation.set(val.lat, val.long));
      }
    });

    const ahrs = bus.getSubscriber<AhrsEvents>();
    this.heading = ConsumerSubject.create(ahrs.on('hdg_deg'), 0);

    const navComSimVarsSubscriber = bus.getSubscriber<NavComSimVars>();
    navComSimVarsSubscriber.on(`adf_active_frequency_${index}`).handle(val => { this.activeFrequency.set(val); });

    const bearing = MappedSubject.create(
      ([relativeBearing, heading]): number => {
        return NavMath.normalizeHeading(relativeBearing + heading);
      },
      this.relativeBearing,
      this.heading
    ).pause();

    this.signal.pipe(this.signalStrength);
    const bearingPipe = bearing.pipe(this.bearing, true);

    this.signal.sub(signal => {
      if (signal > 0) {
        bearing.resume();
        bearingPipe.resume(true);
      } else {
        bearing.pause();
        bearingPipe.pause();

        this.bearing.set(null);
      }
    }, true);
  }

  /** @inheritdoc */
  public getType(): NavSourceType.Adf {
    return NavSourceType.Adf;
  }
}