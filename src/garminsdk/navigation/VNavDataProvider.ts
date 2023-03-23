import {
  AdcEvents, AltitudeConstraintDetails, AltitudeRestrictionType, ApproachGuidanceMode, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, GNSSEvents,
  LegDefinition, LNavEvents, NavEvents, NavSourceId, NavSourceType, RnavTypeFlags, Subject, Subscribable, SubscribableUtils,
  Subscription, UnitType, VerticalFlightPhase, VNavEvents, VNavPathCalculator, VNavPathMode, VNavState, VNavUtils
} from '@microsoft/msfs-sdk';
import { GarminVNavFlightPhase, GarminVNavTrackingPhase, VNavDataEvents } from '../autopilot/data/VNavDataEvents';
import { ApproachDetails, Fms, FmsEvents, FmsFlightPhase } from '../flightplan/Fms';
import { AdcSystemEvents } from '../system/AdcSystem';

/**
 * Valid types of VNAV target altitude restrictions.
 */
export type VNavTargetAltitudeRestrictionType = Exclude<AltitudeRestrictionType, AltitudeRestrictionType.Between | AltitudeRestrictionType.Unused>;

/**
 * A VNAV target altitude restriction.
 */
export type VNavTargetAltitudeRestriction = {
  /** The type of this restriction. */
  type: VNavTargetAltitudeRestrictionType;

  /** The altitude for this restriction, in feet. */
  altitude: number;
};

/**
 * A provider of VNAV data for various displays.
 */
export interface VNavDataProvider {
  /** The current VNAV phase. */
  readonly phase: Subscribable<VerticalFlightPhase | null>;

  /** The current VNAV flight phase. */
  readonly vnavFlightPhase: Subscribable<GarminVNavFlightPhase>;

  /** The current VNAV tracking phase. */
  readonly vnavTrackingPhase: Subscribable<GarminVNavTrackingPhase>;

  /** Whether VNAV direct-to is currently active. */
  readonly isVNavDirectToActive: Subscribable<boolean>;

  /** The current VNAV path mode. */
  readonly pathMode: Subscribable<VNavPathMode>;

  /** The current VNAV cruise altitude, in feet. */
  readonly cruiseAltitude: Subscribable<number | null>;

  /** The flight plan leg that defines the active VNAV constraint. */
  readonly activeConstraintLeg: Subscribable<LegDefinition | null>;

  /** The target VNAV altitude restriction. */
  readonly targetRestriction: Subscribable<VNavTargetAltitudeRestriction | null>;

  /** The desired flight path angle, in degrees, for the current VNAV leg. Positive angles represent descending paths. */
  readonly fpa: Subscribable<number | null>;

  /** The vertical speed target, in feet per minute, for the current VNAV leg. */
  readonly verticalSpeedTarget: Subscribable<number | null>;

  /** The vertical speed required, in feet per minute, to meet the active VNAV restriction. */
  readonly vsRequired: Subscribable<number | null>;

  /** The vertical deviation, in feet, from the VNAV path profile. Positive values indicate deviation above the profile. */
  readonly verticalDeviation: Subscribable<number | null>;

  /** The distance remaining to the next top of descent, in nautical miles. */
  readonly distanceToTod: Subscribable<number | null>;

  /** The time remaining to the next top of descent, in seconds. */
  readonly timeToTod: Subscribable<number | null>;

  /** The time remaining to the next bottom of descent, in seconds. */
  readonly timeToBod: Subscribable<number | null>;

  /** The time remaining to the next top of climb, in seconds. */
  readonly timeToToc: Subscribable<number | null>;

  /** The time remaining to the next bottom of climb, in seconds. */
  readonly timeToBoc: Subscribable<number | null>;
}

/**
 * A default implementation of {@link VNavDataProvider}.
 */
export class DefaultVNavDataProvider implements VNavDataProvider {
  /** The amount of time before reaching TOD/BOC when VNAV path tracking data becomes valid, in hours. */
  private static readonly PATH_TRACKING_LOOKAHEAD = 1 / 60;

  private readonly _phase = Subject.create<VerticalFlightPhase | null>(null);
  /** @inheritdoc */
  public readonly phase = this._phase as Subscribable<VerticalFlightPhase | null>;

  private readonly _vnavFlightPhase = Subject.create<GarminVNavFlightPhase>(GarminVNavFlightPhase.None);
  /** @inheritdoc */
  public readonly vnavFlightPhase = this._vnavFlightPhase as Subscribable<GarminVNavFlightPhase>;

  private readonly _vnavTrackingPhase = Subject.create<GarminVNavTrackingPhase>(GarminVNavTrackingPhase.None);
  /** @inheritdoc */
  public readonly vnavTrackingPhase = this._vnavTrackingPhase as Subscribable<GarminVNavTrackingPhase>;

  private readonly _isVNavDirectToActive = Subject.create(false);
  /** @inheritdoc */
  public readonly isVNavDirectToActive = this._isVNavDirectToActive as Subscribable<boolean>;

  private readonly _pathMode = Subject.create(VNavPathMode.None);
  /** @inheritdoc */
  public readonly pathMode = this._pathMode as Subscribable<VNavPathMode>;

  private readonly _cruiseAltitude = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly cruiseAltitude = this._cruiseAltitude as Subscribable<number | null>;

  private readonly _activeConstraintLeg = Subject.create<LegDefinition | null>(null);
  /** @inheritdoc */
  public readonly activeConstraintLeg = this._activeConstraintLeg as Subscribable<LegDefinition | null>;

  private readonly _targetAltitude = Subject.create<AltitudeConstraintDetails | null>(
    { type: AltitudeRestrictionType.Unused, altitude: 0 },
    (a, b) => (a === null && b === null) || (a !== null && b !== null && a.type === b.type && a.altitude === b.altitude),
  );

  private readonly _fpa = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly fpa = this._fpa as Subscribable<number | null>;

  private readonly _verticalSpeedTarget = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly verticalSpeedTarget = this._verticalSpeedTarget as Subscribable<number | null>;

  private readonly _vsRequired = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly vsRequired = this._vsRequired as Subscribable<number | null>;

  private readonly _verticalDeviation = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly verticalDeviation = this._verticalDeviation as Subscribable<number | null>;

  private readonly _distanceToTod = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly distanceToTod = this._distanceToTod as Subscribable<number | null>;

  private readonly _timeToTod = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly timeToTod = this._timeToTod as Subscribable<number | null>;

  private readonly _timeToBod = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly timeToBod = this._timeToBod as Subscribable<number | null>;

  private readonly _timeToToc = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly timeToToc = this._timeToToc as Subscribable<number | null>;

  private readonly _timeToBoc = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly timeToBoc = this._timeToBoc as Subscribable<number | null>;

  private readonly verticalPathCalc: VNavPathCalculator;

  private readonly indicatedAlt = ConsumerValue.create(null, 0);

  private readonly groundSpeed = ConsumerValue.create(null, 0);

  private readonly activeNavSource = ConsumerValue.create<NavSourceId>(null, { type: null, index: 1 });

  private readonly approachDetails = ConsumerValue.create<Readonly<ApproachDetails>>(null, {
    isLoaded: false,
    type: ApproachType.APPROACH_TYPE_UNKNOWN,
    isRnpAr: false,
    bestRnavType: RnavTypeFlags.None,
    rnavTypeFlags: RnavTypeFlags.None,
    isCircling: false,
    isVtf: false,
    referenceFacility: null
  });
  private readonly flightPhase = ConsumerValue.create<Readonly<FmsFlightPhase>>(null, {
    isApproachActive: false,
    isPastFaf: false,
    isInMissedApproach: false
  });

  private readonly vnavState = ConsumerSubject.create(null, VNavState.Disabled);
  private readonly vnavFlightPhaseSource = ConsumerValue.create(null, GarminVNavFlightPhase.None);
  private readonly vnavTrackingPhaseSource = ConsumerValue.create(null, GarminVNavTrackingPhase.None);
  private readonly vnavPathMode = ConsumerValue.create(null, VNavPathMode.None);
  private readonly vnavCruiseAltitude = ConsumerValue.create(null, 0);
  private readonly vnavActiveConstraintLegIndex = ConsumerValue.create(null, -1);
  private readonly vnavFpa = ConsumerValue.create(null, 0);
  private readonly vnavVsRequired = ConsumerValue.create(null, 0);
  private readonly vnavVerticalDeviation = ConsumerValue.create(null, 0);
  private readonly vnavTodIndex = ConsumerValue.create(null, -1);
  private readonly vnavTodDistance = ConsumerValue.create(null, 0);
  private readonly vnavBodIndex = ConsumerValue.create(null, -1);
  private readonly vnavBodDistance = ConsumerValue.create(null, 0);
  private readonly vnavTocIndex = ConsumerValue.create(null, -1);
  private readonly vnavTocDistance = ConsumerValue.create(null, 0);
  private readonly vnavBocIndex = ConsumerValue.create(null, -1);
  private readonly vnavBocDistance = ConsumerValue.create(null, 0);
  private readonly approachGuidanceMode = ConsumerValue.create(null, ApproachGuidanceMode.None);

  private readonly vnavConstraintDetails = ConsumerValue.create<AltitudeConstraintDetails>(
    null,
    { type: AltitudeRestrictionType.Unused, altitude: 0 }
  );

  /** @inheritdoc */
  public readonly targetRestriction = this._targetAltitude as Subscribable<VNavTargetAltitudeRestriction | null>;

  private readonly adcIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private clockSub?: Subscription;
  private vnavStateSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    adcIndex: number | Subscribable<number>
  ) {
    if (this.fms.verticalPathCalculator === undefined) {
      throw new Error('DefaultVNavDataProvider: cannot use an FMS instance with no VNAV path calculator');
    }

    this.verticalPathCalc = this.fms.verticalPathCalculator;

    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultVNavDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & AdcEvents & AdcSystemEvents & GNSSEvents & NavEvents & VNavEvents & VNavDataEvents & LNavEvents & FmsEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
    }, true);

    this.groundSpeed.setConsumer(sub.on('ground_speed'));

    this.activeNavSource.setConsumer(sub.on('cdi_select'));

    this.approachDetails.setConsumer(sub.on('fms_approach_details'));
    this.flightPhase.setConsumer(sub.on('fms_flight_phase'));

    this.vnavState.setConsumer(sub.on('vnav_state'));
    this.vnavFlightPhaseSource.setConsumer(sub.on('vnav_flight_phase'));
    this.vnavTrackingPhaseSource.setConsumer(sub.on('vnav_tracking_phase'));
    this.vnavPathMode.setConsumer(sub.on('vnav_path_mode'));
    this.vnavCruiseAltitude.setConsumer(sub.on('vnav_cruise_altitude'));
    this.vnavActiveConstraintLegIndex.setConsumer(sub.on('vnav_active_constraint_global_leg_index'));
    this.vnavFpa.setConsumer(sub.on('vnav_fpa'));
    this.vnavVsRequired.setConsumer(sub.on('vnav_required_vs'));
    this.vnavVerticalDeviation.setConsumer(sub.on('vnav_vertical_deviation'));
    this.vnavTodIndex.setConsumer(sub.on('vnav_tod_global_leg_index'));
    this.vnavTodDistance.setConsumer(sub.on('vnav_tod_distance'));
    this.vnavBodIndex.setConsumer(sub.on('vnav_bod_global_leg_index'));
    this.vnavBodDistance.setConsumer(sub.on('vnav_bod_distance'));
    this.vnavTocIndex.setConsumer(sub.on('vnav_toc_global_leg_index'));
    this.vnavTocDistance.setConsumer(sub.on('vnav_toc_distance'));
    this.vnavBocIndex.setConsumer(sub.on('vnav_boc_global_leg_index'));
    this.vnavBocDistance.setConsumer(sub.on('vnav_boc_distance'));
    this.approachGuidanceMode.setConsumer(sub.on('gp_approach_mode'));
    this.vnavConstraintDetails.setConsumer(sub.on('vnav_altitude_constraint_details'));

    const clockSub = this.clockSub = sub.on('realTime').handle(this.update.bind(this), true);

    this.vnavStateSub = this.vnavState.sub(state => {
      if (state === VNavState.Disabled) {
        this.indicatedAlt.pause();
        this.groundSpeed.pause();

        this.activeNavSource.pause();

        this.approachDetails.pause();

        this.vnavFlightPhaseSource.pause();
        this.vnavTrackingPhaseSource.pause();
        this.vnavPathMode.pause();
        this.vnavCruiseAltitude.pause();
        this.vnavActiveConstraintLegIndex.pause();
        this.vnavFpa.pause();
        this.vnavVsRequired.pause();
        this.vnavVerticalDeviation.pause();
        this.vnavTodIndex.pause();
        this.vnavTodDistance.pause();
        this.vnavBodIndex.pause();
        this.vnavBodDistance.pause();
        this.vnavTocIndex.pause();
        this.vnavTocDistance.pause();
        this.vnavBocIndex.pause();
        this.vnavBocDistance.pause();
        this.approachGuidanceMode.pause();

        this.vnavConstraintDetails.pause();

        clockSub.pause();

        this.clearData();
      } else {
        this.indicatedAlt.resume();
        this.groundSpeed.resume();

        this.activeNavSource.resume();

        this.approachDetails.resume();

        this.vnavFlightPhaseSource.resume();
        this.vnavTrackingPhaseSource.resume();
        this.vnavPathMode.resume();
        this.vnavCruiseAltitude.resume();
        this.vnavActiveConstraintLegIndex.resume();
        this.vnavFpa.resume();
        this.vnavVsRequired.resume();
        this.vnavVerticalDeviation.resume();
        this.vnavTodIndex.resume();
        this.vnavTodDistance.resume();
        this.vnavBodIndex.resume();
        this.vnavBodDistance.resume();
        this.vnavTocIndex.resume();
        this.vnavTocDistance.resume();
        this.vnavBocIndex.resume();
        this.vnavBocDistance.resume();
        this.approachGuidanceMode.resume();

        this.vnavConstraintDetails.resume();

        clockSub.resume(true);
      }
    }, true);

    if (paused) {
      this.pause();
    }
  }

  /**
   * Updates this provider's data.
   */
  private update(): void {
    // TODO: Support VNAV for off-route DTOs
    const plan = this.fms.hasPrimaryFlightPlan() ? this.fms.getPrimaryFlightPlan() : undefined;
    const verticalPlan = plan === undefined ? undefined : this.verticalPathCalc.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
    const vnavState = this.vnavState.get();
    const vnavTrackingPhase = this.vnavTrackingPhaseSource.get();

    if (plan === undefined || verticalPlan === undefined || vnavState === VNavState.Disabled || vnavTrackingPhase === GarminVNavTrackingPhase.None) {
      this.clearData();
      return;
    }

    const vnavActiveConstraintLegIndex = this.vnavActiveConstraintLegIndex.get();
    const activeConstraint = vnavActiveConstraintLegIndex < 0
      ? undefined
      : VNavUtils.getConstraintFromLegIndex(verticalPlan, vnavActiveConstraintLegIndex);

    const indicatedAlt = this.indicatedAlt.get();
    const groundSpeed = this.groundSpeed.get();

    const activeNavSource = this.activeNavSource.get();

    const vnavPathMode = this.vnavPathMode.get();
    const approachGuidanceMode = this.approachGuidanceMode.get();

    const isTrackingPhaseClimb = vnavTrackingPhase === GarminVNavTrackingPhase.Climb || vnavTrackingPhase === GarminVNavTrackingPhase.MissedApproach;
    const vnavTargetAltitude = this.vnavConstraintDetails.get();
    const vnavFpa = this.vnavFpa.get();
    const vnavConstraintLeg = plan.tryGetLeg(vnavActiveConstraintLegIndex);
    const vsr = this.vnavVsRequired.get();
    const todIndex = this.vnavTodIndex.get();
    const todDistance = UnitType.METER.convertTo(this.vnavTodDistance.get(), UnitType.NMILE);
    const bodDistance = UnitType.METER.convertTo(this.vnavBodDistance.get(), UnitType.NMILE);

    let showVsr = false;
    let showVDev = false;
    let showTargetAltitude = false;
    let showTime = false;

    if (groundSpeed >= 30) {
      showTime = true;

      if (vnavPathMode === VNavPathMode.PathActive) {
        showVsr = true;
        showVDev = true;
        showTargetAltitude = true;
      } else if (
        approachGuidanceMode !== ApproachGuidanceMode.GPActive
        && activeNavSource.type === NavSourceType.Gps
      ) {
        if (isTrackingPhaseClimb) {
          showTargetAltitude = vnavTargetAltitude.type !== AltitudeRestrictionType.Unused;
          showVsr = showTargetAltitude && activeConstraint !== undefined && isFinite(activeConstraint.minAltitude);
        } else {
          if (
            // VNAV target altitude is valid
            vnavTargetAltitude.type !== AltitudeRestrictionType.Unused
            // Not yet passed BOD
            && bodDistance > 0
            // TOD exists
            && todIndex >= 0
            // Within one minute of TOD
            && todDistance / groundSpeed < DefaultVNavDataProvider.PATH_TRACKING_LOOKAHEAD
            // Above 250 feet below the VNAV target altitude
            && indicatedAlt >= vnavTargetAltitude.altitude - 250
          ) {
            // negative FPA = downward
            const requiredFpa = VNavUtils.getFpaFromVerticalSpeed(vsr, groundSpeed);
            const isRequiredFpaValid = requiredFpa >= -this.verticalPathCalc.maxFlightPathAngle;

            showTargetAltitude = true;
            showVsr = isRequiredFpaValid;
            showVDev = isRequiredFpaValid;
          }
        }
      }
    }

    this._phase.set(activeConstraint === undefined
      ? null
      : activeConstraint.type === 'climb' || activeConstraint.type === 'missed' ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent
    );
    this._vnavFlightPhase.set(this.vnavFlightPhaseSource.get());
    this._vnavTrackingPhase.set(vnavTrackingPhase);
    this._isVNavDirectToActive.set(activeConstraint !== undefined && activeConstraint.type === 'direct');
    this._pathMode.set(vnavPathMode);
    this._cruiseAltitude.set(this.vnavCruiseAltitude.get());
    this._activeConstraintLeg.set(vnavConstraintLeg);

    this._fpa.set(vnavFpa);
    this._verticalSpeedTarget.set(groundSpeed < 30 ? null : VNavUtils.getVerticalSpeedFromFpa(-vnavFpa, groundSpeed));

    this._distanceToTod.set(isTrackingPhaseClimb || todIndex < 0 ? null : todDistance);

    if (showTime) {
      if (isTrackingPhaseClimb) {
        const tocIndex = this.vnavTocIndex.get();
        const tocDistance = UnitType.METER.convertTo(this.vnavTocDistance.get(), UnitType.NMILE);
        const bocIndex = this.vnavBocIndex.get();
        const bocDistance = UnitType.METER.convertTo(this.vnavBocDistance.get(), UnitType.NMILE);

        this._timeToBod.set(null);
        this._timeToTod.set(null);

        this._timeToToc.set(tocIndex < 0 ? null : UnitType.HOUR.convertTo(tocDistance / groundSpeed, UnitType.SECOND));
        this._timeToBoc.set(bocIndex < 0 ? null : UnitType.HOUR.convertTo(bocDistance / groundSpeed, UnitType.SECOND));
      } else {
        const bodIndex = this.vnavBodIndex.get();

        this._timeToBoc.set(null);
        this._timeToToc.set(null);

        this._timeToTod.set(todIndex < 0 ? null : UnitType.HOUR.convertTo(todDistance / groundSpeed, UnitType.SECOND));
        this._timeToBod.set(bodIndex < 0 ? null : UnitType.HOUR.convertTo(bodDistance / groundSpeed, UnitType.SECOND));
      }
    } else {
      this._timeToBod.set(null);
      this._timeToTod.set(null);
      this._timeToBoc.set(null);
      this._timeToToc.set(null);
    }

    this._vsRequired.set(showVsr && vsr !== 0 ? vsr : null);
    this._verticalDeviation.set(showVDev ? -this.vnavVerticalDeviation.get() : null);

    this._targetAltitude.set(showTargetAltitude ? vnavTargetAltitude : null);
  }

  /**
   * Clears this provider's data.
   */
  private clearData(): void {
    this._phase.set(null);
    this._vnavFlightPhase.set(GarminVNavFlightPhase.None);
    this._vnavTrackingPhase.set(GarminVNavTrackingPhase.None);
    this._isVNavDirectToActive.set(false);
    this._pathMode.set(VNavPathMode.None);
    this._cruiseAltitude.set(null);
    this._activeConstraintLeg.set(null);
    this._targetAltitude.set(null);
    this._fpa.set(null);
    this._distanceToTod.set(null);
    this._timeToBod.set(null);
    this._timeToTod.set(null);
    this._timeToBoc.set(null);
    this._timeToToc.set(null);
    this._vsRequired.set(null);
    this._verticalDeviation.set(null);
    this._verticalSpeedTarget.set(null);
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVNavDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = false;

    this.vnavStateSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVNavDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused || !this.isInit) {
      return;
    }

    this.indicatedAlt.pause();
    this.groundSpeed.pause();

    this.activeNavSource.pause();

    this.approachDetails.pause();

    this.vnavState.pause();
    this.vnavFlightPhaseSource.pause();
    this.vnavTrackingPhaseSource.pause();
    this.vnavPathMode.pause();
    this.vnavCruiseAltitude.pause();
    this.vnavActiveConstraintLegIndex.pause();
    this.vnavFpa.pause();
    this.vnavVsRequired.pause();
    this.vnavVerticalDeviation.pause();
    this.vnavTodIndex.pause();
    this.vnavTodDistance.pause();
    this.vnavBodIndex.pause();
    this.vnavBodDistance.pause();
    this.vnavTocIndex.pause();
    this.vnavTocDistance.pause();
    this.vnavBocIndex.pause();
    this.vnavBocDistance.pause();
    this.approachGuidanceMode.pause();

    this.clockSub?.pause();
    this.vnavStateSub?.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.indicatedAlt.destroy();
    this.groundSpeed.destroy();

    this.activeNavSource.destroy();

    this.approachDetails.destroy();

    this.vnavState.destroy();
    this.vnavFlightPhaseSource.destroy();
    this.vnavTrackingPhaseSource.destroy();
    this.vnavPathMode.destroy();
    this.vnavCruiseAltitude.destroy();
    this.vnavActiveConstraintLegIndex.destroy();
    this.vnavFpa.destroy();
    this.vnavVsRequired.destroy();
    this.vnavVerticalDeviation.destroy();
    this.vnavTodIndex.destroy();
    this.vnavTodDistance.destroy();
    this.vnavBodIndex.destroy();
    this.vnavBodDistance.destroy();
    this.vnavTocIndex.destroy();
    this.vnavTocDistance.destroy();
    this.vnavBocIndex.destroy();
    this.vnavBocDistance.destroy();
    this.approachGuidanceMode.destroy();

    this.adcIndexSub?.destroy();
    this.clockSub?.destroy();
    this.vnavStateSub?.destroy();
  }
}