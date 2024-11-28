/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ConsumerSubject, EventBus, NavComEvents, NavComSimVars, NavRadioIndex, NavSourceType, RadioUtils, Subject } from '@microsoft/msfs-sdk';

import { Epic2DmeStateEvents } from '../../Misc';
import { NavSourceBase } from './NavSourceBase';

/** Nav radio index. NAV3 and 4 are used for DME 1 and 2 so are not available as NAV sources. */
export type Epic2NavRadioIndex = 1 | 2;

/** Represents a NAV radio, subscribes to the NAV SimVars. */
export class NavRadioNavSource<T extends readonly string[]> extends NavSourceBase<T> {
  private readonly navComSubscriber = this.bus.getSubscriber<NavComEvents>();
  private readonly glideSlopeErrorDegrees = Subject.create(0);
  private readonly navLocalizerCrsRad = Subject.create(0);
  private readonly navCdi = Subject.create(0);
  private readonly navDme = Subject.create(0);
  private readonly navRadial = Subject.create(0);
  private readonly navIdent = Subject.create('');

  private readonly pairedDme = ConsumerSubject.create<1 | 2 | null>(null, null);
  private readonly dmeHasDme = ConsumerSubject.create(null, false);
  private readonly dmeDistance = ConsumerSubject.create(null, -1);

  private dmeHasDmeSub = this.dmeHasDme.sub((v) => this.setters.get('hasDme')?.setter(v), false, true);
  private dmeDistancePipe = this.dmeDistance.pipe(this.navDme, true);

  /** @inheritdoc */
  public constructor(bus: EventBus, name: T[number], index: Epic2NavRadioIndex) {
    super(bus, name, index);

    this.navComSubscriber.on(`nav_signal_${index}`).whenChanged().handle(this.signalStrength.set.bind(this.signalStrength));
    this.navComSubscriber.on(`nav_ident_${index}`).whenChanged().handle(this.navIdent.set.bind(this.navIdent));
    this.navComSubscriber.on(`nav_localizer_${index}`).whenChanged().handle(this.setters.get('hasLocalizer')!.setter);
    this.navComSubscriber.on(`nav_localizer_crs_${index}`).whenChanged().handle(this.navLocalizerCrsRad.set.bind(this.navLocalizerCrsRad));
    this.navComSubscriber.on(`nav_gs_error_${index}`).whenChanged().handle(this.glideSlopeErrorDegrees.set.bind(this.glideSlopeErrorDegrees));
    this.navComSubscriber.on(`nav_glideslope_${index}`).whenChanged().handle(this.setters.get('hasGlideSlope')!.setter);
    this.navComSubscriber.on(`nav_obs_${index}`).whenChanged().handle(this.setters.get('course')!.setter);
    this.navComSubscriber.on(`nav_radial_${index}`).whenChanged().handle(this.navRadial.set.bind(this.navRadial));
    this.navComSubscriber.on(`nav_cdi_${index}`).whenChanged().handle(this.navCdi.set.bind(this.navCdi));
    this.navComSubscriber.on(`nav_has_nav_${index}`).whenChanged().handle(this.setters.get('hasNav')!.setter);
    this.navComSubscriber.on(`nav_to_from_${index}`).whenChanged().handle(this.setters.get('toFrom')!.setter);

    const navComSimVarsSubscriber = this.bus.getSubscriber<NavComSimVars>();
    navComSimVarsSubscriber.on(`nav_active_frequency_${index}`).whenChanged().handle(this.setters.get('activeFrequency')!.setter);

    this.navIdent.sub(this.updateIdent);
    this.signalStrength.sub(this.updateIdent);

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

    const dmeEventSubscriber = this.bus.getSubscriber<Epic2DmeStateEvents>();
    this.pairedDme.setConsumer(dmeEventSubscriber.on(`epic2_nav${index}_dme_association`));
    dmeEventSubscriber.on(`epic2_nav${index}_dme_hold`).handle(this.setters.get('isDmeHoldActive')!.setter);

    this.pairedDme.sub((v) => {
      if (v === null) {
        this.dmeDistancePipe.pause();
        this.dmeHasDmeSub.pause();
        this.dmeHasDme.setConsumer(null);
        this.dmeDistance.setConsumer(null);
        this.hasDme.set(false);
        this.navDme.set(-1);
      } else {
        const dmeNavIndex = v + 2 as NavRadioIndex;
        this.dmeDistance.setConsumer(this.navComSubscriber.on(`nav_dme_${dmeNavIndex}`));
        this.dmeHasDme.setConsumer(this.navComSubscriber.on(`nav_has_dme_${dmeNavIndex}`));
        this.dmeDistancePipe.resume(true);
        this.dmeHasDmeSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public getType(): NavSourceType {
    return NavSourceType.Nav;
  }

  private readonly updateIdent = (): void => {
    // MSFS returns the ident of distant stations that cannot be received, so we need to check the signal strength
    const signalStrength = this.signalStrength.get();
    this.ident.set(signalStrength !== null && signalStrength > 0 && this.navIdent.get() !== '' ? this.navIdent.get() : null);
  };

  private readonly updateDistance = (): void => {
    const dmeDist = this.hasDme.get() ? this.navDme.get() : -1;
    this.distance.set(dmeDist > 0 ? dmeDist : null);
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
