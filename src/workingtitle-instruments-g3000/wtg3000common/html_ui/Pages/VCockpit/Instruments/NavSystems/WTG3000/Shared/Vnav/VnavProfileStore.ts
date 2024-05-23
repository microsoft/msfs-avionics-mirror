import {
  AdcEvents, AltitudeRestrictionType, APEvents, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, GNSSEvents, LegDefinition,
  MappedSubject, NumberUnitInterface, NumberUnitSubject, Subject, Subscribable, SubscribableUtils, Subscription, ToSubscribable,
  UnitFamily, UnitType, VerticalFlightPhase
} from '@microsoft/msfs-sdk';

import { GarminVNavEvents, GarminVNavTrackingPhase, VNavDataProvider } from '@microsoft/msfs-garminsdk';

import { FlightPlanLegData, FlightPlanStore } from '../FlightPlan';

/** A store for vnav profile data. */
export class VnavProfileStore {
  private readonly selectedAlt = ConsumerValue.create(null, 0).pause();

  private readonly _activeVnavWaypoint = Subject.create<LegDefinition | undefined>(undefined);
  private readonly _showCruiseAltitude = Subject.create(false);

  private readonly _vnavEnabled = ConsumerSubject.create(null, false).pause();
  private readonly _cruiseAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly _verticalSpeedTarget = NumberUnitSubject.create(UnitType.FPM.createNumber(NaN));
  private readonly _fpa = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly _fpaShowClimb = this._activeVnavWaypoint.map(activeWaypoint => {
    return activeWaypoint !== undefined && activeWaypoint.verticalData.phase === VerticalFlightPhase.Climb;
  }).pause();
  private readonly _verticalSpeedRequired = NumberUnitSubject.create(UnitType.FPM.createNumber(NaN));
  private readonly _timeToValue = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly _verticalDeviation = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly isPathEditable = Subject.create(false);
  private readonly _isPathEditButtonEnabled = MappedSubject.create(
    ([isEditable, fpa, leg]) => isEditable && fpa !== null && fpa > 0 && leg !== null,
    this.isPathEditable,
    this.vnavDataProvider.fpa,
    this.vnavDataProvider.activeConstraintLeg
  ).pause();

  private readonly _altDesc = Subject.create(AltitudeRestrictionType.Unused);
  private readonly _altitude1 = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly _altitude2 = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly _displayAltitude1AsFlightLevel = Subject.create(false);
  private readonly _displayAltitude2AsFlightLevel = Subject.create(false);
  private readonly _isAltitudeEdited = Subject.create(false);

  private readonly verticalDataPipes = [] as Subscription[];

  private readonly _isVnavDirectToButtonEnabled = Subject.create(false);
  private readonly _timeToLabel = Subject.create('');
  private readonly _timeToLabelExtended = this._timeToLabel.map(x => 'Time to\n' + x);

  private readonly updateSub = this.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(1000).handle(this.update.bind(this), true);

  /** Whether VNAV is enabled. */
  public readonly vnavEnabled = this._vnavEnabled as ToSubscribable<typeof this._vnavEnabled>;

  /** Whether the button(s) to edit the active descent path should be enabled. */
  public readonly isPathEditButtonEnabled = this._isPathEditButtonEnabled as ToSubscribable<typeof this._isPathEditButtonEnabled>;

  /** The active VNAV waypoint. */
  public readonly activeVnavWaypoint = this._activeVnavWaypoint as ToSubscribable<typeof this._activeVnavWaypoint>;

  /** Whether to show the VNAV cruise altitude in place of the active VNAV waypoint. */
  public readonly showCruiseAltitude = this._showCruiseAltitude as ToSubscribable<typeof this._showCruiseAltitude>;

  /** The current VNAV cruise altitude. */
  public readonly cruiseAltitude = this._cruiseAltitude as Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The vertical speed target for the active descent path, or `NaN` if there is no active descent path. */
  public readonly verticalSpeedTarget = this._verticalSpeedTarget as Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /**
   * The flight path angle for the active descent path, or `NaN` if there is no active descent path. Positive values
   * indicate a descending path.
   */
  public readonly fpa = this._fpa as ToSubscribable<typeof this._fpa>;

  /** Whether the active VNAV waypoint defines a CLIMB constraint. */
  public readonly fpaShowClimb = this._fpaShowClimb as ToSubscribable<typeof this._fpaShowClimb>;

  /** The vertical speed required to meet the active VNAV restriction, or `NaN` if there is no such speed. */
  public readonly verticalSpeedRequired = this._verticalSpeedRequired as Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /**
   * The vertical deviation from the active descent path, or `NaN` if there is no active descent path. Positive values
   * indicate deviation above the path.
   */
  public readonly verticalDeviation = this._verticalDeviation as Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The time remaining to TOD/BOD/TOC/BOC, or `NaN` if no such value exists. */
  public readonly timeToValue = this._timeToValue as ToSubscribable<typeof this._timeToValue>;

  /** The label for the time remaining field. */
  public readonly timeToLabel = this._timeToLabel as ToSubscribable<typeof this._timeToLabel>;

  /** The label for the time remaining field prefixed by `'Time to '`. */
  public readonly timeToLabelExtended = this._timeToLabelExtended as ToSubscribable<typeof this._timeToLabelExtended>;

  public readonly altDesc = this._altDesc as ToSubscribable<typeof this._altDesc>;
  public readonly altitude1 = this._altitude1 as ToSubscribable<typeof this._altitude1>;
  public readonly altitude2 = this._altitude2 as ToSubscribable<typeof this._altitude2>;
  public readonly displayAltitude1AsFlightLevel = this._displayAltitude1AsFlightLevel as ToSubscribable<typeof this._displayAltitude1AsFlightLevel>;
  public readonly displayAltitude2AsFlightLevel = this._displayAltitude2AsFlightLevel as ToSubscribable<typeof this._displayAltitude2AsFlightLevel>;
  public readonly isAltitudeEdited = this._isAltitudeEdited as ToSubscribable<typeof this._isAltitudeEdited>;
  public readonly isVnavDirectToButtonEnabled = this._isVnavDirectToButtonEnabled as ToSubscribable<typeof this._isVnavDirectToButtonEnabled>;

  private isPaused = true;

  private readonly pauseable = [
    this.selectedAlt,
    this._vnavEnabled,
    this._fpaShowClimb,
    this._isPathEditButtonEnabled
  ];

  private activeConstraintLegSub?: Subscription;
  private fpaPipe?: Subscription;

  /**
   * Creates a new vnav profile store.
   * @param bus The event bus.
   * @param store The flight plan store to use.
   * @param isAdvancedVnav Whether this is advanced vnav or not.
   * @param vnavDataProvider The vnav data provider.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly store: FlightPlanStore,
    private readonly isAdvancedVnav: boolean,
    private readonly vnavDataProvider: VNavDataProvider,
  ) {
    const sub = this.bus.getSubscriber<GNSSEvents & AdcEvents & GarminVNavEvents & APEvents>();

    this.selectedAlt.setConsumer(sub.on('ap_altitude_selected'));
    this._vnavEnabled.setConsumer(sub.on('vnav_is_enabled'));

    this.activeConstraintLegSub = this.vnavDataProvider.activeConstraintLeg.sub(this.updateActiveWaypoint.bind(this), false, true);

    this.fpaPipe = this.vnavDataProvider.fpa.pipe(this._fpa, fpa => fpa === null || fpa === 0 ? NaN : fpa, true);
  }

  /** Resumes the store's subscriptions. */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }

    this.activeConstraintLegSub?.resume(true);
    this.fpaPipe?.resume(true);

    this.updateSub.resume(true);
  }

  /** Pauses the store's subscriptions. */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.updateSub.pause();

    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }

    this.activeConstraintLegSub?.pause();
    this.fpaPipe?.pause();
  }

  /** Updates the store's values. */
  public update(): void {
    this.updateCruiseAltitude();
    this.updatePathEditState();
    this.updateVerticalDeviation();
    this.updateTimeFields();
    this.updateVsTarget();
    this.updateVsRequired();
    this.updateVnavDirectTo();
  }

  /**
   * Updates the VNAV cruise altitude.
   */
  private updateCruiseAltitude(): void {
    this._cruiseAltitude.set(this.vnavDataProvider.cruiseAltitude.get() ?? NaN);
  }

  /**
   * Sets whether to enable the FPA and vertical speed target edit buttons.
   */
  private updatePathEditState(): void {
    const vnavTrackingPhase = this.vnavDataProvider.vnavTrackingPhase.get();

    if (vnavTrackingPhase === GarminVNavTrackingPhase.None) {
      // If VNAV is not tracking, then there is no path to edit and cruise altitude should not be shown.
      this.isPathEditable.set(false);
      this._showCruiseAltitude.set(false);
      return;
    }

    const constraintLeg = this.vnavDataProvider.activeConstraintLeg.get();

    if (vnavTrackingPhase === GarminVNavTrackingPhase.Climb || vnavTrackingPhase === GarminVNavTrackingPhase.MissedApproach) {
      // If VNAV is tracking a climb, path editing is always disabled (there is no such thing as a climb path).
      // Cruise altitude is shown only when there is no active constraint and we are not in the missed approach.

      this.isPathEditable.set(false);
      this._showCruiseAltitude.set(this.isAdvancedVnav && constraintLeg === null && vnavTrackingPhase === GarminVNavTrackingPhase.Climb);
    } else {
      if (constraintLeg === null) {
        // If VNAV is tracking cruise or descent and there is no active waypoint, then path editing is always disabled
        // and cruise altitude is shown if in cruise.

        this.isPathEditable.set(false);
        this._showCruiseAltitude.set(this.isAdvancedVnav && vnavTrackingPhase === GarminVNavTrackingPhase.Cruise);
      } else {
        if (vnavTrackingPhase === GarminVNavTrackingPhase.Descent) {
          // If VNAV is tracking a descent, then path editing is always enabled and cruise altitude is never shown.

          this.isPathEditable.set(true);
          this._showCruiseAltitude.set(false);
        } else {
          // If VNAV is tracking cruise, then path editing is enabled if the selected altitude is more than 75 below
          // below the active VNAV constraint. Cruise altitude is shown if path editing is disabled.

          const selectedAlt = this.selectedAlt.get();

          const altitude = UnitType.METER.convertTo(
            constraintLeg.verticalData.altDesc === AltitudeRestrictionType.Between
              ? constraintLeg.verticalData.altitude2
              : constraintLeg.verticalData.altitude1,
            UnitType.FOOT
          );

          const isPathEditable = this.vnavDataProvider.isVNavDirectToActive.get() || selectedAlt < altitude - 75;

          this.isPathEditable.set(isPathEditable);
          this._showCruiseAltitude.set(this.isAdvancedVnav && !isPathEditable);
        }
      }
    }
  }

  /** Updates the vertical deviation field. */
  private updateVerticalDeviation(): void {
    const vDev = this.vnavDataProvider.verticalDeviation.get();

    if (vDev === null || Math.abs(vDev) > 10000) {
      this._verticalDeviation.set(NaN);
    } else {
      this._verticalDeviation.set(vDev);
    }
  }

  /** Updates the TOD/BOD/TOC/BOC fields. */
  private updateTimeFields(): void {
    let label = 'TOD';
    let time = NaN;

    if (this.vnavDataProvider.phase.get() === VerticalFlightPhase.Climb) {
      const timeToToc = this.vnavDataProvider.timeToToc.get();
      const timeToBoc = this.vnavDataProvider.timeToBoc.get();

      if (timeToToc !== null && timeToToc > 0) {
        label = 'TOC';
        time = timeToToc;
      } else if (timeToBoc !== null && timeToBoc >= 0) {
        label = 'BOC';
        time = timeToBoc;
      }
    } else {
      const timeToTod = this.vnavDataProvider.timeToTod.get();
      const timeToBod = this.vnavDataProvider.timeToBod.get();

      if (timeToTod !== null && timeToTod > 0) {
        time = timeToTod;
      } else if (timeToBod !== null && timeToBod >= 0) {
        label = 'BOD';
        time = timeToBod;
      }
    }

    this._timeToLabel.set(label);
    this._timeToValue.set(time);
  }

  /** Updates the vertical speed target field. */
  private updateVsTarget(): void {
    const vsTarget = this.vnavDataProvider.verticalSpeedTarget.get();

    if (vsTarget === null || vsTarget >= 0) {
      this._verticalSpeedTarget.set(NaN);
    } else {
      this._verticalSpeedTarget.set(vsTarget);
    }
  }

  /** Updates the vertical speed required field. */
  private updateVsRequired(): void {
    const vsr = this.vnavDataProvider.vsRequired.get();

    if (vsr === null) {
      this._verticalSpeedRequired.set(NaN);
    } else {
      this._verticalSpeedRequired.set(vsr);
    }
  }

  /**
   * Updates the target waypoint field.
   * @param leg The flight plan leg to which the active VNAV target altitude belongs, or `null` if there is no active
   * VNAV target altitude.
   */
  private updateActiveWaypoint(leg: LegDefinition | null): void {
    this.verticalDataPipes.forEach(pipe => pipe.destroy());

    const legData = leg ? this.store.legMap.get(leg) : undefined;

    if (leg === null || !legData) {
      this._activeVnavWaypoint.set(undefined);
      this._altDesc.set(AltitudeRestrictionType.Unused);
      this._altitude1.set(NaN);
      this._altitude2.set(NaN);
      this._displayAltitude1AsFlightLevel.set(false);
      this._displayAltitude2AsFlightLevel.set(false);
      this._isAltitudeEdited.set(false);
    } else {
      this._activeVnavWaypoint.set(leg);

      if (this.isAdvancedVnav) {
        this.verticalDataPipes.push(legData.altDesc.pipe(this._altDesc));
      } else {
        this._altDesc.set(AltitudeRestrictionType.Unused);
      }
      this.verticalDataPipes.push(legData.altitude1.pipe(this._altitude1));
      this.verticalDataPipes.push(legData.altitude2.pipe(this._altitude2));
      this.verticalDataPipes.push(legData.displayAltitude1AsFlightLevel.pipe(this._displayAltitude1AsFlightLevel));
      this.verticalDataPipes.push(legData.displayAltitude2AsFlightLevel.pipe(this._displayAltitude2AsFlightLevel));
      this.verticalDataPipes.push(legData.isAltitudeEdited.pipe(this._isAltitudeEdited));
    }
  }

  /** Updates the vnav direct to button. */
  private updateVnavDirectTo(): void {
    this._isVnavDirectToButtonEnabled.set(this.canVnavDirectTo());
  }

  /**
   * Determines whether a vnav direct to is available.
   * @returns whether a vnav direct to is available.
   */
  private canVnavDirectTo(): boolean {
    if (!this.store.fms.hasFlightPlan(this.store.planIndex)) { return false; }

    for (const legListItem of this.store.legItems()) {
      if (this.canVnavDirectToLeg(legListItem)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the vnav direct to legs.
   * @returns the vnav direct to legs.
   */
  public getVnavDirectToLegs(): readonly FlightPlanLegData[] {
    const legs = [] as FlightPlanLegData[];

    for (const legListItem of this.store.legItems()) {
      if (this.canVnavDirectToLeg(legListItem)) {
        legs.push(legListItem);
      }
    }

    return legs;
  }

  /**
   * Determines whether a vnav direct to this leg is allowed.
   * @param legListItem The leg lsit data.
   * @returns whether a vnav direct to this leg is allowed.
   */
  private canVnavDirectToLeg(legListItem: FlightPlanLegData): boolean {
    const altDesc = legListItem.leg.verticalData.altDesc;

    const isInFrontOfOrIsActiveLeg = !legListItem.isBehindActiveLeg.get();
    const isValidAltDesc = altDesc !== AltitudeRestrictionType.Unused && altDesc !== AltitudeRestrictionType.Between;
    const isValidPhase = legListItem.vnavPhase.get() !== VerticalFlightPhase.Climb;

    return isValidAltDesc && isInFrontOfOrIsActiveLeg && isValidPhase;
  }


  /** Cleans up. */
  public destroy(): void {
    this.verticalDataPipes.forEach(pipe => pipe.destroy());

    this.updateSub.destroy();

    this.selectedAlt.destroy();
    this._vnavEnabled.destroy();

    this._fpaShowClimb.destroy();
    this._isPathEditButtonEnabled.destroy();

    this.activeConstraintLegSub?.destroy();
    this.fpaPipe?.destroy();
  }
}