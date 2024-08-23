/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, NavComEvents, NavComSimVars, NavRadioIndex, NavSourceType, RadioUtils, Subject } from '@microsoft/msfs-sdk';

import { NavSourceBase } from './NavSourceBase';

/** Represents a NAV radio, subscribes to the NAV SimVars. */
export class NavRadioNavSource<T extends readonly string[]> extends NavSourceBase<T> {
  private readonly glideSlopeErrorDegrees = Subject.create(0);
  private readonly navLocalizerCrsRad = Subject.create(0);
  private readonly navCdi = Subject.create(0);
  private readonly navDme = Subject.create(0);
  private readonly navRadial = Subject.create(0);

  /** @inheritdoc */
  public constructor(bus: EventBus, name: T[number], index: NavRadioIndex) {
    super(bus, name, index);

    const navComSubscriber = this.bus.getSubscriber<NavComEvents>();
    navComSubscriber.on(`nav_dme_${index}`).whenChanged().handle(this.navDme.set.bind(this.navDme));
    navComSubscriber.on(`nav_has_dme_${index}`).whenChanged().handle(this.setters.get('hasDme')!);
    navComSubscriber.on(`nav_ident_${index}`).whenChanged().handle(this.setters.get('ident')!);
    navComSubscriber.on(`nav_localizer_${index}`).whenChanged().handle(this.setters.get('hasLocalizer')!);
    navComSubscriber.on(`nav_localizer_crs_${index}`).whenChanged().handle(this.navLocalizerCrsRad.set.bind(this.navLocalizerCrsRad));
    navComSubscriber.on(`nav_gs_error_${index}`).whenChanged().handle(this.glideSlopeErrorDegrees.set.bind(this.glideSlopeErrorDegrees));
    navComSubscriber.on(`nav_glideslope_${index}`).whenChanged().handle(this.setters.get('hasGlideSlope')!);
    navComSubscriber.on(`nav_obs_${index}`).whenChanged().handle(this.setters.get('course')!);
    navComSubscriber.on(`nav_radial_${index}`).whenChanged().handle(this.navRadial.set.bind(this.navRadial));
    navComSubscriber.on(`nav_cdi_${index}`).whenChanged().handle(this.navCdi.set.bind(this.navCdi));
    navComSubscriber.on(`nav_has_nav_${index}`).whenChanged().handle(this.setters.get('hasNav')!);
    navComSubscriber.on(`nav_to_from_${index}`).whenChanged().handle(this.setters.get('toFrom')!);

    const navComSimVarsSubscriber = this.bus.getSubscriber<NavComSimVars>();
    navComSimVarsSubscriber.on(`nav_active_frequency_${index}`).whenChanged().handle(this.setters.get('activeFrequency')!);

    this.hasDme.sub(this.updateDistance);
    this.navDme.sub(this.updateDistance);

    this.hasLocalizer.sub(this.updateIsLocalizer);
    this.activeFrequency.sub(this.updateIsLocalizer);

    this.hasLocalizer.sub(this.updateLocalizerCourse);
    this.navLocalizerCrsRad.sub(this.updateLocalizerCourse);

    this.localizerCourse.sub(this.trySlewObs);
    this.isLocalizer.sub(this.trySlewObs);

    this.hasGlideSlope.sub(this.updateVerticalDeviation);
    this.glideSlopeErrorDegrees.sub(this.updateVerticalDeviation);

    this.navRadial.sub(this.updateBearing);
    this.hasNav.sub(this.updateBearing);

    this.navCdi.sub(this.updateLateralDeviation);
    this.hasNav.sub(this.updateLateralDeviation);
  }

  /** @inheritdoc */
  public getType(): NavSourceType {
    return NavSourceType.Nav;
  }

  private readonly updateDistance = (): void => {
    this.distance.set(this.hasDme.get() ? this.navDme.get() : null);
  };

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

  /** The user may change the course manually after slewing, this is fine.
   * It won't affect guidance or the deviation indicators. */
  private readonly trySlewObs = (): void => {
    const course = this.localizerCourse.get();
    if (this.hasLocalizer.get() && course !== null) {
      SimVar.SetSimVarValue(`K:VOR${this.index}_SET`, 'number', Math.round(course));
    }
  };

  private readonly updateVerticalDeviation = (): void => {
    this.verticalDeviation.set(this.getVerticalDeviation());
  };

  /**
   * Calculates the vertical deviation for the glide slope indicator.
   * @returns Deviation is in degrees, and standard glideslope is 1.4 degrees thick,
   * so the vdev indicator will max out when 0.7 degrees off the GS.
   * */
  private getVerticalDeviation(): number | null {
    if (!this.hasGlideSlope.get()) {
      return null;
    } else {
      return this.glideSlopeErrorDegrees.get() / 0.7;
    }
  }

  private readonly updateBearing = (): void => {
    if (!this.hasNav.get()) {
      this.bearing.set(null);
    } else {
      const radialDegrees = this.navRadial.get();
      const bearing = (radialDegrees + 180) % 360;
      this.bearing.set(bearing);
    }
  };

  private readonly updateLateralDeviation = (): void => {
    this.lateralDeviation.set(this.getLateralDeviation());
  };

  /**
   * Calculates the lateral deviation for the CDI indicator.
   * @returns Deviation is in degrees, and standard glideslope is 1.4 degrees thick,
   * so the vdev indicator will max out when 0.7 degrees off the GS
   * */
  private getLateralDeviation(): number | null {
    if (!this.hasNav.get()) {
      return null;
    } else {
      // The NAV CDI simvar holds the deviation as a range from -127 to 127
      return this.navCdi.get() / 127;
    }
  }
}
