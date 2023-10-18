/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ConsumerSubject, EventBus, GeoPoint, MappedSubject, NavComEvents, NavRadioIndex, NavSourceType, RadioUtils, Subject, Subscription } from '@microsoft/msfs-sdk';

import { AbstractNavReferenceBase } from '../NavReferenceBase';
import { NavReferenceSource } from './NavReferenceSource';

/**
 * A {@link NavReferenceSource} which derives its data from a NAV radio signal.
 */
export class NavRadioNavSource<NameType extends string> extends AbstractNavReferenceBase implements NavReferenceSource<NameType> {
  private readonly hasSignal = this.signalStrength.map(signalStrength => signalStrength !== null && signalStrength > 0);

  private readonly glideSlopeErrorDegrees = Subject.create(0);
  private readonly navLocalizerCrsRad = Subject.create(0);
  private readonly navCdi = Subject.create(0);
  private readonly navRadial = Subject.create(0);

  private readonly dmePipe: Subscription;
  private readonly bearingPipe: Subscription;

  private readonly vorLla: ConsumerSubject<LatLongAlt>;
  private readonly dmeLla: ConsumerSubject<LatLongAlt>;

  /**
   * Creates a new instance of NavRadioNavSource.
   * @param bus The event bus.
   * @param name The name of this source.
   * @param index The index of this source.
   */
  public constructor(bus: EventBus, public readonly name: NameType, public readonly index: NavRadioIndex) {
    super();

    const navComSubscriber = bus.getSubscriber<NavComEvents>();
    navComSubscriber.on(`nav_signal_${index}`).handle(val => { this.signalStrength.set(val); });
    navComSubscriber.on(`nav_has_dme_${index}`).handle(val => { this.hasDme.set(val); });
    navComSubscriber.on(`nav_has_nav_${index}`).handle(val => { this.hasNav.set(val); });
    navComSubscriber.on(`nav_ident_${index}`).handle(val => { this.ident.set(val); });
    navComSubscriber.on(`nav_localizer_${index}`).handle(val => { this.hasLocalizer.set(val); });
    navComSubscriber.on(`nav_localizer_crs_${index}`).handle(val => { this.navLocalizerCrsRad.set(val); });
    navComSubscriber.on(`nav_gs_error_${index}`).handle(val => { this.glideSlopeErrorDegrees.set(val); });
    navComSubscriber.on(`nav_glideslope_${index}`).handle(val => { this.hasGlideSlope.set(val); });
    navComSubscriber.on(`nav_obs_${index}`).handle(val => { this.course.set(val); });
    navComSubscriber.on(`nav_cdi_${index}`).handle(val => { this.navCdi.set(val); });
    navComSubscriber.on(`nav_to_from_${index}`).handle(val => { this.toFrom.set(val); });
    navComSubscriber.on(`nav_active_frequency_${index}`).handle(val => { this.activeFrequency.set(val); });

    this.dmePipe = navComSubscriber.on(`nav_dme_${index}`).handle(val => { this.distance.set(val); }, true);
    this.bearingPipe = navComSubscriber.on(`nav_radial_${index}`).handle(val => { this.bearing.set((val + 180) % 360); }, true);

    this.vorLla = ConsumerSubject.create(navComSubscriber.on(`nav_lla_${index}`), new LatLongAlt(0, 0), (a, b) => {
      return a.lat === b.lat && a.long === b.long;
    }).pause();
    this.dmeLla = ConsumerSubject.create(navComSubscriber.on(`nav_dme_lla_${index}`), new LatLongAlt(0, 0), (a, b) => {
      return a.lat === b.lat && a.long === b.long;
    }).pause();

    const tempLocation = new GeoPoint(0, 0);

    // Pretty sure there is no VOR at {0 N, 0 E}, so we can safely assume if we ever get that data from the sim there
    // is no valid tuned station.

    const vorLlaPipe = this.vorLla.pipe(this.location, lla => {
      if (lla.lat === 0 && lla.long === 0) {
        return null;
      } else {
        return tempLocation.set(lla.lat, lla.long);
      }
    }, true);
    const dmeLlaPipe = this.dmeLla.pipe(this.location, lla => {
      if (lla.lat === 0 && lla.long === 0) {
        return null;
      } else {
        return tempLocation.set(lla.lat, lla.long);
      }
    }, true);

    const locationState = MappedSubject.create(
      this.hasLocalizer,
      this.hasNav,
      this.hasDme
    );

    locationState.sub(([hasLoc, hasNav, hasDme]) => {
      if (hasLoc || hasNav) {
        this.dmeLla.pause();
        dmeLlaPipe.pause();

        this.vorLla.resume();
        vorLlaPipe.resume(true);
      } else if (hasDme) {
        this.vorLla.pause();
        vorLlaPipe.pause();

        this.dmeLla.resume();
        dmeLlaPipe.resume(true);
      } else {
        this.vorLla.pause();
        vorLlaPipe.pause();
        this.dmeLla.pause();
        dmeLlaPipe.pause();

        this.location.set(null);
      }
    }, true);

    // Distance
    MappedSubject.create(
      this.hasDme,
      this.hasSignal
    ).sub(([hasDme, hasSignal]) => {
      if (hasDme !== null && hasDme && hasSignal) {
        this.dmePipe.resume(true);
      } else {
        this.dmePipe.pause();
        this.distance.set(null);
      }
    }, true);

    // Bearing
    MappedSubject.create(
      this.hasNav,
      this.hasSignal
    ).sub(([hasNav, hasSignal]) => {
      if (hasNav !== null && hasNav && hasSignal) {
        this.bearingPipe.resume(true);
      } else {
        this.bearingPipe.pause();
        this.bearing.set(null);
      }
    }, true);

    this.hasLocalizer.sub(this.updateIsLocalizer);
    this.activeFrequency.sub(this.updateIsLocalizer);

    this.hasLocalizer.sub(this.updateLocalizerCourse);
    this.navLocalizerCrsRad.sub(this.updateLocalizerCourse);

    this.hasGlideSlope.sub(this.updateVerticalDeviation);
    this.glideSlopeErrorDegrees.sub(this.updateVerticalDeviation);

    this.navCdi.sub(this.updateLateralDeviation);
    this.hasNav.sub(this.updateLateralDeviation);
  }

  /** @inheritdoc */
  public getType(): NavSourceType {
    return NavSourceType.Nav;
  }

  private readonly updateIsLocalizer = (): void => {
    const navHasLocalizer = this.hasLocalizer.get();
    const _isLocalizerFrequency = RadioUtils.isLocalizerFrequency(this.activeFrequency.get() ?? 0);
    this.isLocalizer.set(navHasLocalizer || _isLocalizerFrequency);
  };

  private readonly updateLocalizerCourse = (): void => {
    this.localizerCourse.set(
      this.hasLocalizer.get()
        ? this.navLocalizerCrsRad.get() * Avionics.Utils.RAD2DEG
        : null
    );
  };

  private readonly updateVerticalDeviation = (): void => {
    this.verticalDeviation.set(this.getVerticalDeviation());
  };

  /** @returns Deviation is in degrees, and standard glideslope is 1.4 degrees thick,
   * so the vdev indicator will max out when 0.7 degrees off the GS */
  private getVerticalDeviation(): number | null {
    if (!this.hasGlideSlope.get()) {
      return null;
    } else {
      return -this.glideSlopeErrorDegrees.get() / 0.7;
    }
  }

  private readonly updateLateralDeviation = (): void => {
    this.lateralDeviation.set(this.getLateralDeviation());
  };

  /** @returns Deviation is in degrees, and standard glideslope is 1.4 degrees thick,
   * so the vdev indicator will max out when 0.7 degrees off the GS */
  private getLateralDeviation(): number | null {
    if (!this.hasNav.get()) {
      return null;
    } else {
      // The NAV CDI simvar holds the deviation as a range from -127 to 127
      return this.navCdi.get() / 127;
    }
  }
}