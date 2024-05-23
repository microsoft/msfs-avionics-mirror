import { CdiEvents } from '../cdi/CdiEvents';
import { CdiUtils } from '../cdi/CdiUtils';
import { EventBus, IndexedEvents, Publisher } from '../data/EventBus';
import { NavMath } from '../geo/NavMath';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { Instrument } from './Backplane';
import { NavComEvents } from './NavCom';
import { CdiDeviation, Glideslope, Localizer, NavSourceId, NavSourceType, ObsSetting } from './NavProcessor';
import { NavRadioIndex } from './RadioCommon';

/**
 * Radio data for autopilot navigation.
 */
interface APNavRadioData {
  /** The location of the tuned glideslope. */
  gsLocation: LatLongAlt;

  /** The location of the tuned navaid. */
  navLocation: LatLongAlt;

  /** The radio localizer. */
  localizer: Localizer;

  /** The radio glideslope. */
  glideslope: Glideslope;

  /** The CDI deviation. */
  cdi: CdiDeviation;

  /** The OBS setting. */
  obs: ObsSetting;

  /** The radial error, in degrees. */
  radialError: number;

  /** The magnetic variation, in degrees. */
  magVar: number;
}

/**
 * Event roots for an indexed nav radio.
 */
type NavRadioIndexedEventsRoot = {
  /** Course deviation data for a nav radio. */
  nav_radio_cdi: CdiDeviation;

  /** Selected course data for a nav radio. */
  nav_radio_obs: ObsSetting;

  /**
   * The difference, in degrees, between the course from the airplane to a nav radio's tuned station and the radio's
   * reference course. The radio's reference course is the selected course if the tuned station is a VOR or the
   * localizer course if the tuned station is a localizer. Positive values indicate the airplane is to the left of the
   * reference course.
   */
  nav_radio_radial_error: number;

  /** Localizer data for a nav radio. */
  nav_radio_localizer: Localizer;

  /** Glideslope data for a nav radio. */
  nav_radio_glideslope: Glideslope;

  /** The location of a nav radio's tuned VOR station. */
  nav_radio_nav_location: LatLongAlt;

  /** The location of a nav radio's tuned glideslope antenna. */
  nav_radio_gs_location: LatLongAlt;

  /** The calibrated magnetic variation, in degrees, of a nav radio's tuned station. */
  nav_radio_magvar: number;
};

/**
 * Events related to the active navigation radio.
 */
export interface NavRadioEvents extends IndexedEvents<NavRadioIndexedEventsRoot, NavRadioIndex> {
  /** Course deviation data for the active nav radio. */
  nav_radio_active_cdi_deviation: CdiDeviation;

  /** Selected course data for the active nav radio. */
  nav_radio_active_obs_setting: ObsSetting;

  /**
   * The difference, in degrees, between the course from the airplane to the active nav radio's tuned station and the
   * radio's reference course. The radio's reference course is the selected course if the tuned station is a VOR or the
   * localizer course if the tuned station is a localizer. Positive values indicate the airplane is to the left of the
   * reference course.
   */
  nav_radio_active_radial_error: number;

  /** Localizer data for the active nav radio. */
  nav_radio_active_localizer: Localizer;

  /** Glideslope data for the active nav radio. */
  nav_radio_active_glideslope: Glideslope;

  /** The location of the active nav radio's tuned VOR station. */
  nav_radio_active_nav_location: LatLongAlt;

  /** The location of the active nav radio's tuned glideslope antenna. */
  nav_radio_active_gs_location: LatLongAlt;

  /** The calibrated magnetic variation, in degrees, of the active nav radio's tuned station. */
  nav_radio_active_magvar: number;
}

/**
 * An instrument that gathers localizer and glideslope information for use by
 * the AP systems.
 *
 * Requires that the topics defined in {@link NavComEvents} are published to the event bus.
 */
export class APRadioNavInstrument implements Instrument {

  private readonly navRadioData = ArrayUtils.create<APNavRadioData>(5, index => {
    index = Math.max(1, index);

    return {
      gsLocation: new LatLongAlt(0, 0),
      navLocation: new LatLongAlt(0, 0),
      glideslope: this.createEmptyGlideslope({ index, type: NavSourceType.Nav }),
      localizer: this.createEmptyLocalizer({ index, type: NavSourceType.Nav }),
      cdi: this.createEmptyCdi({ index, type: NavSourceType.Nav }),
      obs: this.createEmptyObs({ index, type: NavSourceType.Nav }),
      radialError: 0,
      magVar: 0
    };
  });

  private readonly publisher: Publisher<NavRadioEvents>;
  private currentCdiNavSourceIndex = 1;

  /**
   * Creates an instance of the APRadioNavInstrument.
   * @param bus The event bus to use with this instance.
   * @param cdiId The ID of the CDI from which this instrument sources navigation source data. Defaults to the empty
   * string (`''`).
   */
  constructor(private readonly bus: EventBus, private readonly cdiId = '') {
    this.publisher = bus.getPublisher<NavRadioEvents>();
  }

  /** @inheritdoc */
  public init(): void {
    const navComSubscriber = this.bus.getSubscriber<NavComEvents>();

    for (let i = 1 as NavRadioIndex; i < 5; i++) {
      navComSubscriber.on(`nav_glideslope_${i}`).whenChanged().handle(this.setGlideslopeValue.bind(this, i, 'isValid' as keyof Glideslope));
      navComSubscriber.on(`nav_gs_lla_${i}`).handle(this.setGlideslopePosition.bind(this, i));
      navComSubscriber.on(`nav_gs_error_${i}`).whenChanged().handle(this.setGlideslopeValue.bind(this, i, 'deviation' as keyof Glideslope));
      navComSubscriber.on(`nav_raw_gs_${i}`).whenChanged().handle(this.setGlideslopeValue.bind(this, i, 'gsAngle' as keyof Glideslope));
      navComSubscriber.on(`nav_localizer_${i}`).whenChanged().handle(this.setLocalizerValue.bind(this, i, 'isValid' as keyof Localizer));
      navComSubscriber.on(`nav_localizer_crs_${i}`).whenChanged().handle(this.setLocalizerValue.bind(this, i, 'course' as keyof Localizer));
      navComSubscriber.on(`nav_cdi_${i}`).whenChanged().handle(this.setCDIValue.bind(this, i, 'deviation' as keyof CdiDeviation));
      navComSubscriber.on(`nav_has_nav_${i}`).whenChanged().handle(hasNav => !hasNav && this.setCDIValue(i, 'deviation', null));
      navComSubscriber.on(`nav_obs_${i}`).whenChanged().handle(this.setOBSValue.bind(this, i, 'heading' as keyof ObsSetting));
      navComSubscriber.on(`nav_lla_${i}`).handle(this.setNavPosition.bind(this, i));
      navComSubscriber.on(`nav_radial_error_${i}`).whenChanged().handle(this.setRadialError.bind(this, i));
      navComSubscriber.on(`nav_magvar_${i}`).whenChanged().handle(this.setMagVar.bind(this, i));
    }

    const navEvents = this.bus.getSubscriber<CdiEvents>();
    navEvents.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.cdiId)}`).handle(source => {
      const oldIndex = this.currentCdiNavSourceIndex;
      this.currentCdiNavSourceIndex = source.type === NavSourceType.Nav ? source.index : 0;

      if (oldIndex !== this.currentCdiNavSourceIndex) {
        const data = this.navRadioData[this.currentCdiNavSourceIndex];

        this.publisher.pub('nav_radio_active_gs_location', data.gsLocation);
        this.publisher.pub('nav_radio_active_nav_location', data.navLocation);
        this.publisher.pub('nav_radio_active_glideslope', data.glideslope);
        this.publisher.pub('nav_radio_active_localizer', data.localizer);
        this.publisher.pub('nav_radio_active_cdi_deviation', data.cdi);
        this.publisher.pub('nav_radio_active_obs_setting', data.obs);
        this.publisher.pub('nav_radio_active_radial_error', data.radialError);
        this.publisher.pub('nav_radio_active_magvar', data.magVar);
      }
    });
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /**
   * Sets a value in a nav radio glideslope.
   * @param index The index of the nav radio.
   * @param field The field to set.
   * @param value The value to set the field to.
   */
  private setGlideslopeValue<T extends keyof Glideslope>(index: number, field: T, value: Glideslope[T]): void {
    this.navRadioData[index].glideslope[field] = value;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_glideslope', this.navRadioData[index].glideslope);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_glideslope_1', this.navRadioData[index].glideslope);
        break;
      case 2:
        this.publisher.pub('nav_radio_glideslope_2', this.navRadioData[index].glideslope);
        break;
      case 3:
        this.publisher.pub('nav_radio_glideslope_3', this.navRadioData[index].glideslope);
        break;
      case 4:
        this.publisher.pub('nav_radio_glideslope_4', this.navRadioData[index].glideslope);
        break;
    }
  }

  /**
   * Sends the current glideslope's LLA position.
   * @param index The index of the nav radio.
   * @param lla The LLA to send.
   */
  private setGlideslopePosition(index: number, lla: LatLongAlt): void {
    this.navRadioData[index].gsLocation = lla;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_gs_location', lla);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_gs_location_1', this.navRadioData[index].gsLocation);
        break;
      case 2:
        this.publisher.pub('nav_radio_gs_location_2', this.navRadioData[index].gsLocation);
        break;
      case 3:
        this.publisher.pub('nav_radio_gs_location_3', this.navRadioData[index].gsLocation);
        break;
      case 4:
        this.publisher.pub('nav_radio_gs_location_4', this.navRadioData[index].gsLocation);
        break;
    }
  }

  /**
   * Sends the current nav's LLA position.
   * @param index The index of the nav radio.
   * @param lla The LLA to send.
   */
  private setNavPosition(index: number, lla: LatLongAlt): void {
    this.navRadioData[index].navLocation = lla;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_nav_location', lla);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_nav_location_1', this.navRadioData[index].navLocation);
        break;
      case 2:
        this.publisher.pub('nav_radio_nav_location_2', this.navRadioData[index].navLocation);
        break;
      case 3:
        this.publisher.pub('nav_radio_nav_location_3', this.navRadioData[index].navLocation);
        break;
      case 4:
        this.publisher.pub('nav_radio_nav_location_4', this.navRadioData[index].navLocation);
        break;
    }
  }

  /**
   * Sets a value in a nav radio localizer.
   * @param index The index of the nav radio.
   * @param field The field to set.
   * @param value The value to set the field to.
   */
  private setLocalizerValue<T extends keyof Localizer>(index: number, field: T, value: Localizer[T]): void {
    this.navRadioData[index].localizer[field] = value;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_localizer', this.navRadioData[index].localizer);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_localizer_1', this.navRadioData[index].localizer);
        break;
      case 2:
        this.publisher.pub('nav_radio_localizer_2', this.navRadioData[index].localizer);
        break;
      case 3:
        this.publisher.pub('nav_radio_localizer_3', this.navRadioData[index].localizer);
        break;
      case 4:
        this.publisher.pub('nav_radio_localizer_4', this.navRadioData[index].localizer);
        break;
    }
  }

  /**
   * Sets a value in a nav radio localizer.
   * @param index The index of the nav radio.
   * @param field The field to set.
   * @param value The value to set the field to.
   */
  private setCDIValue<T extends keyof CdiDeviation>(index: number, field: T, value: CdiDeviation[T]): void {
    this.navRadioData[index].cdi[field] = value;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_cdi_deviation', this.navRadioData[index].cdi);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_cdi_1', this.navRadioData[index].cdi);
        break;
      case 2:
        this.publisher.pub('nav_radio_cdi_2', this.navRadioData[index].cdi);
        break;
      case 3:
        this.publisher.pub('nav_radio_cdi_3', this.navRadioData[index].cdi);
        break;
      case 4:
        this.publisher.pub('nav_radio_cdi_4', this.navRadioData[index].cdi);
        break;
    }
  }

  /**
   * Sets a value in a nav radio localizer.
   * @param index The index of the nav radio.
   * @param field The field to set.
   * @param value The value to set the field to.
   */
  private setOBSValue<T extends keyof ObsSetting>(index: number, field: T, value: ObsSetting[T]): void {
    this.navRadioData[index].obs[field] = value;

    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_obs_setting', this.navRadioData[index].obs);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_obs_1', this.navRadioData[index].obs);
        break;
      case 2:
        this.publisher.pub('nav_radio_obs_2', this.navRadioData[index].obs);
        break;
      case 3:
        this.publisher.pub('nav_radio_obs_3', this.navRadioData[index].obs);
        break;
      case 4:
        this.publisher.pub('nav_radio_obs_4', this.navRadioData[index].obs);
        break;
    }
  }

  /**
   * Sets the radial error of a nav radio signal source.
   * @param index The index of the nav radio.
   * @param radialError The radial error to set.
   */
  private setRadialError(index: number, radialError: number): void {
    this.navRadioData[index].radialError = radialError;
    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_radial_error', radialError);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_radial_error_1', this.navRadioData[index].radialError);
        break;
      case 2:
        this.publisher.pub('nav_radio_radial_error_2', this.navRadioData[index].radialError);
        break;
      case 3:
        this.publisher.pub('nav_radio_radial_error_3', this.navRadioData[index].radialError);
        break;
      case 4:
        this.publisher.pub('nav_radio_radial_error_4', this.navRadioData[index].radialError);
        break;
    }
  }

  /**
   * Sets the magnetic variation of a nav radio signal source.
   * @param index The index of the nav radio.
   * @param magVar The magvar to set.
   */
  private setMagVar(index: number, magVar: number): void {
    magVar = NavMath.normalizeHeading(-magVar + 180) % 360 - 180;

    this.navRadioData[index].magVar = magVar;
    if (this.currentCdiNavSourceIndex === index) {
      this.publisher.pub('nav_radio_active_magvar', magVar);
    }

    switch (index) {
      case 1:
        this.publisher.pub('nav_radio_magvar_1', this.navRadioData[index].magVar);
        break;
      case 2:
        this.publisher.pub('nav_radio_magvar_2', this.navRadioData[index].magVar);
        break;
      case 3:
        this.publisher.pub('nav_radio_magvar_3', this.navRadioData[index].magVar);
        break;
      case 4:
        this.publisher.pub('nav_radio_magvar_4', this.navRadioData[index].magVar);
        break;
    }
  }

  /**
   * Creates an empty localizer data.
   * @param id The nav source ID.
   * @returns New empty localizer data.
   */
  private createEmptyLocalizer(id: NavSourceId): Localizer {
    return {
      isValid: false,
      course: 0,
      source: id
    };
  }

  /**
   * Creates an empty glideslope data.
   * @param id The nav source ID.
   * @returns New empty glideslope data.
   */
  private createEmptyGlideslope(id: NavSourceId): Glideslope {
    return {
      isValid: false,
      gsAngle: 0,
      deviation: 0,
      source: id
    };
  }

  /**
   * Creates an empty CDI data.
   * @param id The nav source ID.
   * @returns New empty CDI data.
   */
  private createEmptyCdi(id: NavSourceId): CdiDeviation {
    return {
      deviation: 0,
      source: id
    };
  }

  /**
   * Creates an empty OBS data.
   * @param id The nav source ID.
   * @returns New empty OBS data.
   */
  private createEmptyObs(id: NavSourceId): ObsSetting {
    return {
      heading: 0,
      source: id
    };
  }
}