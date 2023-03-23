/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ConsumerSubject, EventBus, LNavEvents, MappedSubject, NavSourceType, VNavDataEvents, VNavEvents } from '@microsoft/msfs-sdk';
import { LNavDataEvents } from '@microsoft/msfs-garminsdk';
import { NavSource } from './NavSource';
import { AbstractNavBase } from '../NavBase';

/** Represents a GPS/FMS source, subscribes to the custom FMS LVars. */
export class GpsSource<NameType extends string> extends AbstractNavBase implements NavSource<NameType> {
  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly lnavIdent: ConsumerSubject<string>;
  private readonly lnavBrgMag: ConsumerSubject<number>;
  private readonly lnavDis: ConsumerSubject<number>;
  private readonly lnavDtkMag: ConsumerSubject<number>;
  private readonly lnavXtk: ConsumerSubject<number>;
  private readonly lnavCdiScale: ConsumerSubject<number>;

  private readonly gpAvailable: ConsumerSubject<boolean>;
  private readonly gpDeviation: ConsumerSubject<number>;
  private readonly gpScale: ConsumerSubject<number>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param name The name of this source.
   * @param index The index of this source.
   */
  public constructor(bus: EventBus, public readonly name: NameType, public readonly index: number) {
    super();

    const lnav = bus.getSubscriber<LNavEvents & LNavDataEvents>();
    this.lnavIsTracking = ConsumerSubject.create(lnav.on('lnav_is_tracking'), false);
    this.lnavIdent = ConsumerSubject.create(lnav.on('lnavdata_waypoint_ident'), '').pause();
    this.lnavBrgMag = ConsumerSubject.create(lnav.on('lnavdata_waypoint_bearing_mag'), 0).pause();
    this.lnavDis = ConsumerSubject.create(lnav.on('lnavdata_waypoint_distance'), 0).pause();
    this.lnavDtkMag = ConsumerSubject.create(lnav.on('lnavdata_dtk_mag'), 0).pause();
    this.lnavXtk = ConsumerSubject.create(lnav.on('lnavdata_xtk'), 0).pause();
    this.lnavCdiScale = ConsumerSubject.create(lnav.on('lnavdata_cdi_scale'), 0);

    this.lnavCdiScale.pipe(this.lateralDeviationScale);
    lnav.on('lnavdata_cdi_scale_label').handle(cdiScale => { this.lateralDeviationScalingMode.set(cdiScale); });

    const lateralDeviation = MappedSubject.create(
      ([xtk, scale]): number | null => {
        return scale !== 0 ? -xtk / scale : null;
      },
      this.lnavXtk,
      this.lnavCdiScale
    ).pause();

    const identPipe = this.lnavIdent.pipe(this.ident, true);
    const bearingPipe = this.lnavBrgMag.pipe(this.bearing, true);
    const distancePipe = this.lnavDis.pipe(this.distance, true);
    const dtkPipe = this.lnavDtkMag.pipe(this.course, true);
    const lateralDeviationPipe = lateralDeviation.pipe(this.lateralDeviation, true);

    this.lnavIsTracking.sub(isTracking => {
      if (isTracking) {
        this.lnavIdent.resume();
        this.lnavBrgMag.resume();
        this.lnavDis.resume();
        this.lnavDtkMag.resume();
        this.lnavXtk.resume();
        lateralDeviation.resume();

        identPipe.resume(true);
        bearingPipe.resume(true);
        distancePipe.resume(true);
        dtkPipe.resume(true);
        lateralDeviationPipe.resume(true);

        this.signalStrength.set(1);
      } else {
        this.signalStrength.set(0);

        this.lnavIdent.pause();
        this.lnavBrgMag.pause();
        this.lnavDis.pause();
        this.lnavDtkMag.pause();
        this.lnavXtk.pause();
        lateralDeviation.pause();

        identPipe.pause();
        bearingPipe.pause();
        distancePipe.pause();
        dtkPipe.pause();
        lateralDeviationPipe.pause();

        this.ident.set(null);
        this.bearing.set(null);
        this.distance.set(null);
        this.course.set(null);
        this.lateralDeviation.set(null);
      }
    }, true);

    const vnav = bus.getSubscriber<VNavEvents & VNavDataEvents>();
    this.gpAvailable = ConsumerSubject.create(vnav.on('gp_available'), false);
    this.gpDeviation = ConsumerSubject.create(vnav.on('gp_vertical_deviation'), 0);
    this.gpScale = ConsumerSubject.create(vnav.on('gp_gsi_scaling'), 0);

    this.gpScale.pipe(this.verticalDeviationScale, scale => scale <= 0 ? null : scale);

    const verticalDeviation = MappedSubject.create(
      ([gpDeviation, scale]): number | null => {
        return scale !== 0 ? gpDeviation / scale : null;
      },
      this.gpDeviation,
      this.gpScale
    ).pause();

    const verticalDeviationPipe = verticalDeviation.pipe(this.verticalDeviation, true);

    this.gpAvailable.sub(isGpAvailable => {
      if (isGpAvailable) {
        verticalDeviation.resume();
        verticalDeviationPipe.resume(true);
      } else {
        verticalDeviation.pause();
        verticalDeviationPipe.pause();
        this.verticalDeviation.set(null);
      }
    }, true);
  }

  /** @inheritdoc */
  public getType(): NavSourceType.Gps {
    return NavSourceType.Gps;
  }
}