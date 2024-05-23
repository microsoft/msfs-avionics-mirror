import {
  AdcEvents, AdditionalApproachType, APEvents, ClockEvents, ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FacilityType,
  FlightPlannerEvents, FSComponent, GeoPoint, GNSSEvents, ICAO, LNavEvents, MappedSubject, MetarWindSpeedUnits, NavSourceType, SetSubject, Subject, Unit,
  UnitFamily, UnitType, VNavControlEvents, VNavDataEvents, VNavEvents, VNode
} from '@microsoft/msfs-sdk';

import { Fms, FmsEvents, GPDisplayMode, HsiSource, NavIndicatorController, NavSensitivity, VNavDisplayMode } from '@microsoft/msfs-garminsdk';

import './Sr22tStabilizedApproachComponent.css';

enum AnnunicationTypes {
  Baro,
  Crosswind,
  Flaps,
  Course,
  Tailwind,
  Glidepath,
  Glideslope,
}

enum AnnunicationPriority {
  None,
  Alert,
  Warning
}

/** Component props for {@link Sr22tStabilizedApproachComponent}. */
export interface Sr22tStabilizedApproachComponentProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight management system. */
  fms: Fms;

  /** An instance of the nav indicator controller. */
  navIndicatorController: NavIndicatorController;
}

/** Display component for the (un-) stabilized approach annuciations: */
export class Sr22tStabilizedApproachComponent extends DisplayComponent<Sr22tStabilizedApproachComponentProps> {

  private readonly annunicationTexts = ['BARO', 'CROSSWIND', 'FLAPS', 'COURSE', 'TAILWIND', 'GLIDEPATH', 'GLIDESLOPE'];

  // Flight state subjects:
  private readonly isApproachActive = Subject.create(false);
  private readonly isPastFaF = Subject.create(false);
  private readonly isMissedApproach = Subject.create(false);

  // Annunciation state subjects:
  private readonly baroAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly crossWindAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly flapsAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly courseAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly tailWindAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly glidepathAnnunciationPriority = Subject.create(AnnunicationPriority.None);
  private readonly glideslopeAnnunciationPriority = Subject.create(AnnunicationPriority.None);

  private readonly annunciationText = Subject.create('');
  private readonly rootCssClass = SetSubject.create(['stab-appr-annunciation']);

  private readonly sub = this.props.bus.getSubscriber<ControlSurfacesEvents & LNavEvents & VNavDataEvents & VNavControlEvents & VNavEvents & AdcEvents & GNSSEvents & ClockEvents &
    FlightPlannerEvents & APEvents & FmsEvents>();

  // Input data for the processing of the annunciations:
  private readonly isInstrumentApproach = ConsumerSubject
    .create(this.sub.on('fms_approach_details'), null)
    .map(approach => {
      return !!approach && approach.type !== ApproachType.APPROACH_TYPE_UNKNOWN && approach.type !== AdditionalApproachType.APPROACH_TYPE_VISUAL;
    });
  private readonly gpsPosition = ConsumerSubject.create(this.sub.on('gps-position').onlyAfter(1000), new LatLongAlt(0, 0, 0)); // meter!
  private readonly altitude = ConsumerSubject.create(this.sub.on('indicated_alt').whenChangedBy(3), 0);  // feet!
  private readonly altitudeAboveGround = ConsumerSubject.create(this.sub.on('above_ground_height').withPrecision(-1), 0);  // feet!
  private readonly flightPhase = ConsumerSubject.create(this.sub.on('fms_flight_phase'), null);
  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime').whenChangedBy(3000), null);
  private readonly flapsPos = ConsumerSubject.create(this.sub.on('flaps_handle_index'), 0);
  private readonly flapsDataSubject = MappedSubject.create(this.isPastFaF, this.flapsPos, this.altitudeAboveGround);
  private readonly gearOnGround = ConsumerSubject.create(this.sub.on('gear_is_on_ground'), false);

  private currentAnnunication = AnnunicationTypes.Baro;
  private currentPriority = AnnunicationPriority.None;

  /**
   * Constructor
   * @param props properties
   */
  constructor(props: Sr22tStabilizedApproachComponentProps) {
    super(props);

    // At first, ensure that the logic is disabled:
    this.pauseBusSubjects();

    // Update the flight phase subjects to track changing fms flight phases:
    this.flightPhase.sub(phase => {
      if (phase !== null) {
        this.isApproachActive.set(phase.isApproachActive);
        this.isPastFaF.set(phase.isPastFaf);
        this.isMissedApproach.set(phase.isInMissedApproach);
      }
    }, true);

    // Enable or disable the entire logic based on the fms flight phases:
    this.isApproachActive.sub(isActive => {
      if (isActive) {
        // Enter approach phase:
        this.resumeBusSubjects();
      } else {
        // Leave approach phase:
        this.pauseBusSubjects();
        this.clearAnnunciation();
      }
    });

    this.isMissedApproach.sub(isMissedApproach => {
      if (isMissedApproach) {
        // Leave approach phase:
        this.pauseBusSubjects();
        this.clearAnnunciation();
      }
    });

    // Time based processing (every 3 seconds):
    this.simTime.sub(this.updateTimeBasedStabilizedApproachAnnunciations.bind(this), false);  // Don't run at construction!

    this.crossWindAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Crosswind, prio);
    }, true);

    this.tailWindAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Tailwind, prio);
    }, true);

    this.glideslopeAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Glideslope, prio);
    }, true);

    this.glidepathAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Glidepath, prio);
    }, true);

    this.courseAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Course, prio);
    }, true);

    // Processing for the FLAPS annunciation:
    // Flaps 1 (=50%) and 2 (=100%) are considered as valid landing flaps positions
    // (pg. 505 in the CIRRUS PERSPECTIVE+ Pilot’s Guide, 190-02183-03 Rev. A):
    this.flapsDataSubject.sub(this.updateFlapsAnnunciations.bind(this), true);

    this.flapsAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Flaps, prio);
    }, true);

    // Processing for the BARO annunciation:
    MappedSubject.create(this.gpsPosition, this.altitudeAboveGround).sub(this.updateBaroAnnunciations.bind(this), false);

    this.baroAnnunciationPriority.sub(prio => {
      this.updateAnnunciationPriority(AnnunicationTypes.Baro, prio);
    }, true);

  }

  /**
   * Update the stabilized approach annunciations.
   */
  private updateTimeBasedStabilizedApproachAnnunciations(): void {
    const activeSource = this.props.navIndicatorController.navStates[this.props.navIndicatorController.activeSourceIndex];
    // the order of these updates doesn't matter (they can run simultaneously) and we don't want to fail fast on any of them:
    // Processing for the CROSSWIND or TAILWIND annunciations:
    void this.updateCrosswindTailwindAnnunciations();

    // Processing for the GLIDESLOPE or GLIDEPATH annunciations:
    void this.updateGlidepathAnnunciations(activeSource);

    // Processing for the COURSE annunciation:
    void this.updateCourseAnnunciations(activeSource);
  }

  /**
   * Update the baro annunciations.
   * @param root0 params array
   * @param root0."0" The current GPS position.
   * @param root0."1" The altitude above ground.
   */
  private updateBaroAnnunciations([latLongAlt, altAboveGround]: readonly [LatLongAlt, number]): void {
    const deltaAlt = Math.abs(UnitType.METER.convertTo(latLongAlt.alt, UnitType.FOOT) - this.altitude.get());
    // baro alerts shown only on instrument approaches
    const isInstrumentApproach = this.isInstrumentApproach.get();
    if (isInstrumentApproach && altAboveGround >= 200 && altAboveGround <= 900 && deltaAlt > 200) {
      this.baroAnnunciationPriority.set(AnnunicationPriority.Warning);
    } else if (isInstrumentApproach && altAboveGround >= 200 && altAboveGround <= 900 && deltaAlt > 150) {
      this.baroAnnunciationPriority.set(AnnunicationPriority.Alert);
    } else {
      this.baroAnnunciationPriority.set(AnnunicationPriority.None);
    }
  }

  /**
   * Update the flaps annunciations.
   * @param isPastFaF params array
   * @param isPastFaF."0" Whether the aircraft is past the final approach fix.
   * @param isPastFaF."1" The flaps position.
   * @param isPastFaF."2" The altitude above ground.
   */
  private updateFlapsAnnunciations([isPastFaF, flapsPos, altAboveGround]: readonly [boolean, number, number]): void {
    // flaps alerts shown below 900 feet AGL on instrument approaches, 600 feet AGL on visual approaches
    const upperAltLimit = this.isInstrumentApproach.get() ? 900 : 600;
    if (altAboveGround <= upperAltLimit && altAboveGround >= 200 && isPastFaF && (flapsPos < 0.9)) {
      this.flapsAnnunciationPriority.set(AnnunicationPriority.Alert);
    } else {
      this.flapsAnnunciationPriority.set(AnnunicationPriority.None);
    }
  }

  /**
   * Update the crosswind and tailwind stabilized approach annunciations.
   */
  private async updateCrosswindTailwindAnnunciations(): Promise<void> {
    const plan = this.props.fms.getPrimaryFlightPlan();
    const icao = plan.destinationAirport ?? '';
    if (ICAO.isFacility(icao) && ICAO.getFacilityType(icao) === FacilityType.Airport) {
      // Load the metar every time, it could change any time:
      const approachRwy = this.props.fms.getApproachRunway();
      if (approachRwy !== null) {
        const distanceToRunway = UnitType.GA_RADIAN.convertTo(GeoPoint.distance(
          this.gpsPosition.get().lat, this.gpsPosition.get().long, approachRwy.latitude, approachRwy.longitude), UnitType.NMILE);
        if (distanceToRunway < 20) {
          const destinationMetar = await this.props.fms.facLoader.getMetar(ICAO.getIdent(icao));
          if (destinationMetar !== undefined) {
            // The wind annunciations shall only be determined closer than 20nm to the destination:
            let windSpeedUnit: Unit<UnitFamily.Speed>;
            switch (destinationMetar.windSpeedUnits) {
              case MetarWindSpeedUnits.KilometerPerHour:
                windSpeedUnit = UnitType.KPH;
                break;
              case MetarWindSpeedUnits.MeterPerSecond:
                windSpeedUnit = UnitType.MPS;
                break;
              default:
                windSpeedUnit = UnitType.KNOT;
            }
            const windSpeedInKnots = windSpeedUnit.convertTo(destinationMetar.windSpeed, UnitType.KNOT);
            const altAboveGround = this.altitudeAboveGround.get();
            // crosswind and tailwind alerts shown below 900 feet AGL on instrument approaches, 600 feet AGL on visual approaches
            const altAboveGroundWithinLimits = altAboveGround >= 200 && altAboveGround <= (this.isInstrumentApproach.get() ? 900 : 600);

            const crossWind = windSpeedInKnots * (Math.sin((approachRwy.course * Math.PI / 180) - ((destinationMetar.windDir ?? 0) * Math.PI / 180)));
            const crossWindAnnunciationPriority = altAboveGroundWithinLimits && Math.abs(crossWind) > 20 ? AnnunicationPriority.Warning :
              altAboveGroundWithinLimits && Math.abs(crossWind) > 15 ? AnnunicationPriority.Alert : AnnunicationPriority.None;
            this.crossWindAnnunciationPriority.set(crossWindAnnunciationPriority);

            const headWind = windSpeedInKnots * (Math.cos((approachRwy.course * Math.PI / 180) - ((destinationMetar.windDir ?? 0) * Math.PI / 180)));
            const headWindAnnunciationPriority = altAboveGroundWithinLimits && headWind < -10 ? AnnunicationPriority.Warning :
              altAboveGroundWithinLimits && headWind < -8 ? AnnunicationPriority.Alert : AnnunicationPriority.None;
            this.tailWindAnnunciationPriority.set(headWindAnnunciationPriority);
          }
        }
      }
    }
  }

  /**
   * Update the glidepath or glideslope stabilized approach annunciations.
   * @param activeSource The active navigation source.
   */
  private async updateGlidepathAnnunciations(activeSource: HsiSource): Promise<void> {
    const vnavDisplayMode = this.props.navIndicatorController.vnavDisplayMode.get();
    const gpDisplayMode = this.props.navIndicatorController.gpDisplayMode.get();
    const vnavSource = this.props.navIndicatorController.navStates[2];

    let deviationScale = 1.0;
    if (this.props.navIndicatorController.activeSensitivity === NavSensitivity.ILS) {
      deviationScale = 0.7;
    }

    let deviation = 0;
    let targetSubject: Subject<AnnunicationPriority> | null = null;

    // Ensure that VNAV is no longer in control:
    if (vnavDisplayMode === VNavDisplayMode.NONE) {
      if (activeSource.source.type === NavSourceType.Nav && activeSource.hasGlideslope && activeSource.gsDeviation !== null) {
        deviation = Math.abs(100 * activeSource.gsDeviation / deviationScale);
        targetSubject = this.glideslopeAnnunciationPriority;
      } else if (gpDisplayMode !== GPDisplayMode.NONE) {
        deviation = Math.abs(100 * (vnavSource.gsDeviation ?? 0) / deviationScale);
        targetSubject = this.glidepathAnnunciationPriority;
      }
      if (this.isPastFaF.get() && deviation > 75 && !this.gearOnGround.get()) {
        targetSubject?.set(AnnunicationPriority.Alert);
      } else {
        targetSubject?.set(AnnunicationPriority.None);
      }
    }
  }

  /**
   * Update the course stabilized approach annunciations.
   * @param activeSource The active navigation source.
   */
  private async updateCourseAnnunciations(activeSource: HsiSource): Promise<void> {
    const toFrom = activeSource.toFrom;
    if (toFrom !== null) {
      const xtk = Math.abs((activeSource.deviation ?? 0) * 100);
      if (this.isPastFaF.get() && xtk > 75) {
        this.courseAnnunciationPriority.set(AnnunicationPriority.Alert);
      } else {
        this.courseAnnunciationPriority.set(AnnunicationPriority.None);
      }
    }
  }

  /** Resume all the consumer subjects which are listening to the event bus */
  private resumeBusSubjects(): void {
    this.gpsPosition.resume();
    this.altitude.resume();
    this.simTime.resume();
    this.flapsPos.resume();
    this.altitudeAboveGround.resume();
    this.isInstrumentApproach.resume();
  }

  /** Pause all the consumer subjects which are listening to the event bus */
  private pauseBusSubjects(): void {
    this.gpsPosition.pause();
    this.altitude.pause();
    this.simTime.pause();
    this.flapsPos.pause();
    this.altitudeAboveGround.pause();
    this.isInstrumentApproach.pause();
  }

  /**
   * Send updated annunciation data to the screen:
   * @param type Annunciation type
   * @param prio Annunciation priority
   */
  private updateAnnunciationPriority(type: AnnunicationTypes, prio: AnnunicationPriority): void {
    switch (prio) {
      case AnnunicationPriority.None:
        this.clearAnnunciation();
        break;
      case AnnunicationPriority.Alert:
        this.activateAnnunciation(type, AnnunicationPriority.Alert);
        break;
      case AnnunicationPriority.Warning:
        this.activateAnnunciation(type, AnnunicationPriority.Warning);
        break;
    }
  }

  /**
   * Activate an annunciation.
   * @param type Type of the annunciation
   * @param priority Priority of the annunciation
   */
  private activateAnnunciation(type: AnnunicationTypes, priority: AnnunicationPriority): void {
    // Clear current annunciation:
    this.clearAnnunciation();

    // Establish the new annunciation:
    if (priority !== AnnunicationPriority.None) {
      this.annunciationText.set(this.annunicationTexts[type]);
      this.rootCssClass.add(priority === AnnunicationPriority.Alert ? 'stab-appr-alert' : 'stab-appr-warning');
      this.rootCssClass.delete('hidden');
    }

    this.currentAnnunication = type;
    this.currentPriority = priority;
  }

  /**
   * Clear the active annunciation
   */
  private clearAnnunciation(): void {
    // Clear current annunciation:
    this.rootCssClass.add('hidden');
    this.rootCssClass.delete(this.currentPriority === AnnunicationPriority.Alert ? 'stab-appr-alert' : 'stab-appr-warning');
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div>
        <div class={this.rootCssClass}>{this.annunciationText}</div>
      </div >
    );
  }
}
