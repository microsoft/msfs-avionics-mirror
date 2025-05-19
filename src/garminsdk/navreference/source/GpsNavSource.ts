/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ConsumerSubject, EventBus, LNavEvents, LNavUtils, MappedSubject, NavSourceType, Subject, Subscribable,
  SubscribableUtils, VNavDataEvents, VNavEvents, VNavUtils, VorToFrom
} from '@microsoft/msfs-sdk';

import { CDIScaleLabel, LNavDataEvents } from '../../navigation/LNavDataEvents';
import { AbstractNavReferenceBase } from '../NavReferenceBase';
import { NavReferenceSource } from './NavReferenceSource';

/**
 * Configuration options for {@link GpsNavSource}.
 */
export type GpsNavSourceOptions = {
  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;
};

/**
 * A {@link NavReferenceSource} which derives its data from LNAV.
 */
export class GpsNavSource<NameType extends string> extends AbstractNavReferenceBase implements NavReferenceSource<NameType> {
  private readonly lnavIndex: Subscribable<number>;
  private readonly vnavIndex: Subscribable<number>;

  private readonly lnavIsTracking = Subject.create(false);

  private readonly lnavIsTrackingSource = ConsumerSubject.create(null, false);
  private readonly lnavIdent = ConsumerSubject.create(null, '').pause();
  private readonly lnavBrgMag = ConsumerSubject.create(null, 0).pause();
  private readonly lnavDis = ConsumerSubject.create(null, 0).pause();
  private readonly lnavDtkMag = ConsumerSubject.create(null, 0).pause();
  private readonly lnavXtk = ConsumerSubject.create(null, 0).pause();
  private readonly lnavIsSteerHeading = ConsumerSubject.create(null, false).pause();
  private readonly lnavToFrom = ConsumerSubject.create(null, VorToFrom.OFF).pause();
  private readonly lnavCdiScaleLabel = ConsumerSubject.create(null, CDIScaleLabel.Enroute);
  private readonly lnavCdiScale = ConsumerSubject.create(null, 0);

  private readonly gpAvailable = ConsumerSubject.create(null, false);
  private readonly gpDeviation = ConsumerSubject.create(null, 0);
  private readonly gpScale = ConsumerSubject.create(null, 0);

  /**
   * Creates a new instance of GpsNavSource.
   * @param bus The event bus.
   * @param name The name of this source.
   * @param index The index of this source.
   * @param options Options with which to configure the source.
   */
  public constructor(
    bus: EventBus,
    public readonly name: NameType,
    public readonly index: number,
    options?: Readonly<GpsNavSourceOptions>
  ) {
    super();

    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);
    this.vnavIndex = SubscribableUtils.toSubscribable(options?.vnavIndex ?? 0, true);

    const lnav = bus.getSubscriber<LNavEvents & LNavDataEvents>();

    const lnavIsTrackingPipe = this.lnavIsTrackingSource.pipe(this.lnavIsTracking, true);
    const cdiScaleLabelPipe = this.lnavCdiScaleLabel.pipe(this.lateralDeviationScalingMode, true);
    const cdiScalePipe = this.lnavCdiScale.pipe(this.lateralDeviationScale, true);

    const lateralDeviation = MappedSubject.create(
      ([isSteerHeading, xtk, scale]): number | null => {
        return !isSteerHeading && scale !== 0 ? -xtk / scale : null;
      },
      this.lnavIsSteerHeading,
      this.lnavXtk,
      this.lnavCdiScale
    ).pause();

    const identPipe = this.lnavIdent.pipe(this.ident, true);
    const bearingPipe = this.lnavBrgMag.pipe(this.bearing, true);
    const distancePipe = this.lnavDis.pipe(this.distance, true);
    const dtkPipe = this.lnavDtkMag.pipe(this.course, true);
    const isSteerHeadingPipe = this.lnavIsSteerHeading.pipe(this.isCourseHeading, true);
    const lateralDeviationPipe = lateralDeviation.pipe(this.lateralDeviation, true);
    const toFromPipe = this.lnavToFrom.pipe(this.toFrom, true);

    this.lnavIsTracking.sub(isTracking => {
      if (isTracking) {
        this.lnavIdent.resume();
        this.lnavBrgMag.resume();
        this.lnavDis.resume();
        this.lnavDtkMag.resume();
        this.lnavXtk.resume();
        this.lnavIsSteerHeading.resume();
        lateralDeviation.resume();
        this.lnavToFrom.resume();

        identPipe.resume(true);
        bearingPipe.resume(true);
        distancePipe.resume(true);
        dtkPipe.resume(true);
        isSteerHeadingPipe.resume(true);
        lateralDeviationPipe.resume(true);
        toFromPipe.resume(true);

        this.signalStrength.set(1);
      } else {
        this.signalStrength.set(0);

        this.lnavIdent.pause();
        this.lnavBrgMag.pause();
        this.lnavDis.pause();
        this.lnavDtkMag.pause();
        this.lnavXtk.pause();
        this.lnavIsSteerHeading.pause();
        lateralDeviation.pause();
        this.lnavToFrom.pause();

        identPipe.pause();
        bearingPipe.pause();
        distancePipe.pause();
        dtkPipe.pause();
        isSteerHeadingPipe.pause();
        lateralDeviationPipe.pause();
        toFromPipe.pause();

        this.ident.set(null);
        this.bearing.set(null);
        this.distance.set(null);
        this.course.set(null);
        this.isCourseHeading.set(null);
        this.lateralDeviation.set(null);
        this.toFrom.set(null);
      }
    }, true);

    this.lnavIndex.sub(lnavIndex => {
      if (LNavUtils.isValidLNavIndex(index)) {
        const suffix = LNavUtils.getEventBusTopicSuffix(lnavIndex);

        this.lnavIsTrackingSource.setConsumer(lnav.on(`lnav_is_tracking${suffix}`));
        this.lnavIdent.setConsumer(lnav.on(`lnavdata_waypoint_ident${suffix}`));
        this.lnavBrgMag.setConsumer(lnav.on(`lnavdata_waypoint_bearing_mag${suffix}`));
        this.lnavDis.setConsumer(lnav.on(`lnavdata_waypoint_distance${suffix}`));
        this.lnavDtkMag.setConsumer(lnav.on(`lnavdata_dtk_mag${suffix}`));
        this.lnavXtk.setConsumer(lnav.on(`lnavdata_xtk${suffix}`));
        this.lnavIsSteerHeading.setConsumer(lnav.on(`lnavdata_is_steer_heading${suffix}`));
        this.lnavToFrom.setConsumer(lnav.on(`lnavdata_tofrom${suffix}`));
        this.lnavCdiScaleLabel.setConsumer(lnav.on(`lnavdata_cdi_scale_label${suffix}`));
        this.lnavCdiScale.setConsumer(lnav.on(`lnavdata_cdi_scale${suffix}`));

        cdiScaleLabelPipe.resume(true);
        cdiScalePipe.resume(true);
        lnavIsTrackingPipe.resume(true);
      } else {
        cdiScaleLabelPipe.pause();
        cdiScalePipe.pause();
        lnavIsTrackingPipe.pause();

        this.lnavIsTrackingSource.setConsumer(null);
        this.lnavIdent.setConsumer(null);
        this.lnavBrgMag.setConsumer(null);
        this.lnavDis.setConsumer(null);
        this.lnavDtkMag.setConsumer(null);
        this.lnavXtk.setConsumer(null);
        this.lnavIsSteerHeading.setConsumer(null);
        this.lnavToFrom.setConsumer(null);
        this.lnavCdiScaleLabel.setConsumer(null);
        this.lnavCdiScale.setConsumer(null);

        this.lnavIsTracking.set(false);
        this.signalStrength.set(0);
        this.lateralDeviationScalingMode.set(null);
        this.lateralDeviationScale.set(null);
      }
    }, true);

    const vnav = bus.getSubscriber<VNavEvents & VNavDataEvents>();

    const gpScalePipe = this.gpScale.pipe(this.verticalDeviationScale, scale => scale <= 0 ? null : scale, true);

    const verticalDeviation = MappedSubject.create(
      ([gpDeviation, scale]): number | null => {
        return scale !== 0 ? gpDeviation / scale : null;
      },
      this.gpDeviation,
      this.gpScale
    ).pause();

    const verticalDeviationPipe = verticalDeviation.pipe(this.verticalDeviation, true);

    const gpAvailableSub = this.gpAvailable.sub(isGpAvailable => {
      if (isGpAvailable) {
        verticalDeviation.resume();
        verticalDeviationPipe.resume(true);
      } else {
        verticalDeviation.pause();
        verticalDeviationPipe.pause();
        this.verticalDeviation.set(null);
      }
    }, false, true);

    this.vnavIndex.sub(vnavIndex => {
      if (VNavUtils.isValidVNavIndex(index)) {
        const suffix = VNavUtils.getEventBusTopicSuffix(vnavIndex);

        this.gpAvailable.setConsumer(vnav.on(`gp_available${suffix}`));
        this.gpDeviation.setConsumer(vnav.on(`gp_vertical_deviation${suffix}`));
        this.gpScale.setConsumer(vnav.on(`gp_gsi_scaling${suffix}`));

        gpScalePipe.resume(true);
        gpAvailableSub.resume(true);
      } else {
        gpScalePipe.pause();
        gpAvailableSub.pause();
        verticalDeviation.pause();
        verticalDeviationPipe.pause();

        this.gpAvailable.setConsumer(null);
        this.gpDeviation.setConsumer(null);
        this.gpScale.setConsumer(null);

        this.verticalDeviation.set(null);
        this.verticalDeviationScale.set(null);
      }
    }, true);
  }

  /** @inheritdoc */
  public getType(): NavSourceType.Gps {
    return NavSourceType.Gps;
  }
}