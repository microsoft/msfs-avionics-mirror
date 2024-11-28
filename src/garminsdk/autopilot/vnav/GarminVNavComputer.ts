import {
  AdcEvents, AltitudeConstraintDetails, AltitudeRestrictionType, AltitudeSelectEvents, APEvents, APLateralModes, APVerticalModes, ArrayUtils,
  BaseVNavControlEvents, BaseVNavSimVarEvents, BitFlags, ClockEvents, ConsumerValue, EventBus, FlightPlan,
  FlightPlanner, FlightPlanSegmentType, GeoPoint, GNSSEvents, LegDefinitionFlags, LNavControlEvents, LNavDataEvents,
  LNavEvents, LNavUtils, MathUtils, NavMath, ObjectSubject, SimVarValueType, Subject, Subscribable, SubscribableUtils,
  TocBocDetails, UnitType, VerticalFlightPhase, VerticalFlightPlan, VNavAltCaptureType, VNavAvailability,
  VNavConstraint, VNavControlEvents, VNavLeg, VNavPathCalculator, VNavPathMode, VNavState, VNavUtils, VNavVars
} from '@microsoft/msfs-sdk';

import { FmsEvents } from '../../flightplan/FmsEvents';
import { BaseGarminVNavDataEvents, GarminVNavDataEvents, GarminVNavFlightPhase, GarminVNavTrackAlertType, GarminVNavTrackingPhase } from './GarminVNavDataEvents';
import { BaseGarminVNavEvents, GarminVNavEvents } from './GarminVNavEvents';
import { GarminTodBodDetails, GarminVNavComputerAPValues, GarminVNavGuidance, GarminVNavPathGuidance, GlidepathServiceLevel } from './GarminVNavTypes';
import { GarminVNavUtils } from './GarminVNavUtils';

/**
 * Configuration options for {@link GarminVNavComputer}.
 */
export interface GarminVNavComputerOptions {
  /** The index of the flight plan for which to provide vertical guidance. Defaults to `0`. */
  primaryPlanIndex?: number;

  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** Whether to enable advanced VNAV. Defaults to `false`. */
  enableAdvancedVNav?: boolean;
}

/**
 * VNAV-related data events used by {@link GarminVNavComputer}, keyed by base topic names.
 */
type UsedBaseVNavDataEvents = Pick<
  BaseGarminVNavDataEvents,
  'vnav_cruise_altitude' | 'vnav_flight_phase' | 'vnav_tracking_phase' | 'vnav_active_constraint_global_leg_index' | 'vnav_track_alert'
>;

/**
 * VNAV control events used by {@link GarminVNavComputer}, keyed by base topic names.
 */
type UsedBaseVNavControlEvents = Pick<BaseVNavControlEvents, 'vnav_set_state'>;

/**
 * A computer that calculates Garmin vertical navigation guidance for an active flight plan.
 */
export class GarminVNavComputer {
  /** The distance, in meters, from the first TOD in the flight plan the airplane must reach in order to enter descent phase. */
  private static readonly DESCENT_PHASE_TOD_DISTANCE = UnitType.NMILE.convertTo(10, UnitType.METER);
  /** The vertical distance, in feet, below the cruise altitude the airplane must reach in order to enter cruise phase. */
  private static readonly CRUISE_PHASE_ALTITUDE_THRESHOLD = 500;

  /**
   * The vertical distance, in meters, above the TOC altitude which defines the BOC suppression threshold. If the
   * airplane's indicated altitude is above this threshold, any existing BOC will be suppressed.
   */
  private static readonly BOC_SUPPRESS_ALTITUDE_THRESHOLD = UnitType.FOOT.convertTo(250, UnitType.METER);
  /**
   * The vertical distance, in meters, below the TOC altitude which defines the TOC suppression threshold. If the
   * airplane's indicated altitude is above this threshold, any existing TOC will be suppressed.
   */
  private static readonly TOC_SUPPRESS_ALTITUDE_THRESHOLD = UnitType.FOOT.convertTo(250, UnitType.METER);

  /**
   * The time to TOD threshold, in seconds, below which the descent path on which the TOD lies becomes the active
   * descent path and can be captured by VPATH.
   */
  private static readonly ACTIVE_PATH_TOD_TIME_THRESHOLD = 60;

  /**
   * The amount of hysteresis applied to the time to TOD threshold, in seconds, after a descent path has become active.
   */
  private static readonly ACTIVE_PATH_TOD_TIME_HYSTERESIS = 30;

  /**
   * The amount of time, in seconds, remaining to a vertical track change, at or below which a vertical track alert can
   * be issued.
   */
  private static readonly TRACK_ALERT_ISSUE_THRESHOLD = 60;

  /**
   * The amount of time, in seconds, remaining to a vertical track change, at or above which the corresponding vertical
   * track alert is re-armed.
   */
  private static readonly TRACK_ALERT_REARM_THRESHOLD = 90;

  private readonly publisher = this.bus.getPublisher<GarminVNavEvents & GarminVNavDataEvents>();

  private readonly simVarMap: Record<VNavVars, string>;
  private readonly vnavTopicMap: {
    [P in Exclude<keyof (BaseGarminVNavEvents & UsedBaseVNavDataEvents & UsedBaseVNavControlEvents), keyof BaseVNavSimVarEvents>]: P | `${P}_${number}`
  };

  private readonly lnavIndex: Subscribable<number>;
  private isLNavIndexValid = false;

  private readonly simRate = ConsumerValue.create(null, 1);
  private lastUpdateTime?: number;

  private isEnabled = true;
  private state = VNavState.Disabled;

  private isActive = false;

  private readonly pathMode = Subject.create<VNavPathMode>(VNavPathMode.None);

  private readonly planePos = new GeoPoint(0, 0);

  private currentAltitude = 0;
  private currentGpsAltitude = 0;
  private currentGroundSpeed = 0;
  private currentVS = 0;
  private trueTrack = 0;

  private readonly isAltSelectInitialized = ConsumerValue.create(null, true);
  private apSelectedAltitude = 0;
  private apSelectedVs = 0;
  private apLateralActiveMode: number = APLateralModes.NONE;
  private apVerticalActiveMode: number = APVerticalModes.NONE;
  private apVerticalArmedMode: number = APVerticalModes.NONE;

  private readonly isVNavUnavailable = Subject.create<boolean>(false);

  private isAwaitingAltCapture = false;
  private altitudeToCapture = 0;
  private isAltCaptured = false;
  private capturedAltitude = 0;

  private stagedIsClimbArmed = false;
  private isClimbArmed = false;
  private shouldActivateClimbMode = false;

  private stagedIsAwaitingPathRearm = false;
  private stagedPathRearmIndex = -1;
  private isAwaitingPathRearm = false;
  private pathRearmIndex = -1;

  private isPathActivationInhibited = false;
  private pathReactivationTimeRemaining = 0;
  private pathReactivationDeviationStage: 'armed' | 'deviated' | 'captured' = 'armed';

  private lastCapturedPathDesiredAltitude?: number;

  /** The highest VNAV constraint altitude that appears in the primary flight plan. */
  private highestConstraintAltitude = 0;
  /** The global index of the last leg in the last non-missed approach climb constraint in the primary flight plan. */
  private lastClimbConstraintLegIndex = -1;
  /** The global index of the last leg in the first descent constraint in the primary flight plan. */
  private firstDescentConstraintLegIndex = -1;

  private activePathConstraintIndex = -1;

  private readonly todBodDetails: GarminTodBodDetails = {
    todLegIndex: -1,
    bodLegIndex: -1,
    todLegDistance: 0,
    distanceFromTod: 0,
    distanceFromBod: 0,
    bodConstraintIndex: -1,
    todConstraintIndex: -1
  };

  private readonly tocBocDetails: TocBocDetails = {
    tocLegIndex: -1,
    bocLegIndex: -1,
    tocLegDistance: 0,
    distanceFromToc: 0,
    distanceFromBoc: 0,
    tocConstraintIndex: -1,
    tocAltitude: -1
  };

  private readonly todBodDetailsSubject = ObjectSubject.create<GarminTodBodDetails>(Object.assign({}, this.todBodDetails));
  private readonly tocBocDetailsSubject = ObjectSubject.create<TocBocDetails>(Object.assign({}, this.tocBocDetails));

  private readonly allTrackAlertTypes = Object.values(GarminVNavTrackAlertType);
  private readonly isTrackAlertArmed: Record<GarminVNavTrackAlertType, boolean> = {
    [GarminVNavTrackAlertType.TodOneMinute]: true,
    [GarminVNavTrackAlertType.BodOneMinute]: true,
    [GarminVNavTrackAlertType.TocOneMinute]: true,
    [GarminVNavTrackAlertType.BocOneMinute]: true,
  };

  // Subjects for each vnav var to be set
  private readonly vnavState = Subject.create<VNavState>(VNavState.Enabled_Inactive);
  private readonly pathAvailable = Subject.create<boolean>(false);
  private readonly currentConstraintLegIndex = Subject.create(-1);
  private readonly vnavActiveConstraintLegIndex = Subject.create(-1);
  private readonly targetAltitude = Subject.create<number | null>(null);
  private readonly fpa = Subject.create<number | null>(null);
  private readonly verticalDeviation = Subject.create<number | null>(null);
  private readonly requiredVS = Subject.create<number | null>(null);
  private readonly captureType = Subject.create<VNavAltCaptureType>(VNavAltCaptureType.None);
  private readonly cruiseAltitude = Subject.create(0);
  private readonly vnavFlightPhase = Subject.create(GarminVNavFlightPhase.None);
  private readonly vnavTrackingPhase = Subject.create(GarminVNavTrackingPhase.None);

  private readonly currentAltitudeConstraintDetailsWorking: AltitudeConstraintDetails = {
    type: AltitudeRestrictionType.Unused,
    altitude: 0
  };

  private readonly currentAltitudeConstraintDetails = Subject.create<Readonly<AltitudeConstraintDetails>>(
    { type: AltitudeRestrictionType.Unused, altitude: 0 },
    VNavUtils.altitudeConstraintDetailsEquals
  );

  // LNAV Consumer Subjects
  private readonly lnavLegIndex = ConsumerValue.create(null, 0);
  private readonly lnavLegDistanceAlong = ConsumerValue.create(null, 0);
  private readonly lnavXtk = ConsumerValue.create(null, 0);
  private readonly lnavDtk = ConsumerValue.create(null, 0);
  private readonly lnavDataCdiScale = ConsumerValue.create(null, 4);
  private readonly activateMaprState = ConsumerValue.create(null, false);

  private readonly noVNavTae = Subject.create<boolean>(false);
  private readonly noVNavXtk = Subject.create<boolean>(false);

  // PATH Error Subjects
  private readonly pathArmedError = Subject.create<boolean>(false);

  private readonly pathBelowAircraft = Subject.create<boolean>(false);
  private readonly noPathThisLeg = Subject.create<boolean>(false);
  private readonly noPathConditionDisco = Subject.create<boolean>(false);
  private readonly noPathVectors = Subject.create<boolean>(false);
  private readonly checkAltSel = Subject.create<boolean>(false);
  private readonly withinOneMinuteTod = Subject.create<boolean>(false);
  private readonly withinFiveSecondsTod = Subject.create<boolean>(false);
  private readonly checkFplnAlt = Subject.create<boolean>(false);

  private readonly primaryPlanIndex: number;
  private readonly enableAdvancedVNav: boolean;

  private readonly guidanceBuffer: GarminVNavGuidance[] = ArrayUtils.create(2, () => {
    return {
      state: VNavState.Disabled,
      isActive: false,
      pathMode: VNavPathMode.None,
      armedClimbMode: APVerticalModes.NONE,
      shouldActivateClimbMode: false,
      altitudeCaptureType: VNavAltCaptureType.None,
      shouldCaptureAltitude: false,
      altitudeToCapture: 0,
      approachHasGlidepath: false
    };
  });

  private readonly _guidance = Subject.create(
    this.guidanceBuffer[0],
    (a, b) => {
      return a.state === b.state
        && a.isActive === b.isActive
        && a.pathMode === b.pathMode
        && a.armedClimbMode === b.armedClimbMode
        && a.shouldActivateClimbMode === b.shouldActivateClimbMode
        && a.altitudeCaptureType === b.altitudeCaptureType
        && a.shouldCaptureAltitude === b.shouldCaptureAltitude
        && a.altitudeToCapture === b.altitudeToCapture;
    }
  );
  /** The VNAV guidance calculated by this computer. */
  public readonly guidance = this._guidance as Subscribable<Readonly<GarminVNavGuidance>>;

  private readonly pathGuidanceBuffer: GarminVNavPathGuidance[] = ArrayUtils.create(2, () => {
    return {
      isValid: false,
      fpa: 0,
      deviation: 0
    };
  });

  private readonly _pathGuidance = Subject.create(
    this.pathGuidanceBuffer[0],
    (a, b) => {
      if (!a.isValid && !b.isValid) {
        return true;
      }

      return a.isValid === b.isValid
        && a.fpa === b.fpa
        && a.deviation === b.deviation;
    }
  );
  /** The vertical path guidance calculated by this computer. */
  public readonly pathGuidance = this._pathGuidance as Subscribable<Readonly<GarminVNavPathGuidance>>;

  /**
   * Creates a new instance of GarminVNavComputer.
   * @param index The index of this computer.
   * @param bus The event bus.
   * @param flightPlanner The flight planner containing the flight plan for which this computer provides guidance.
   * @param calculator The VNAV path calculator providing the vertical flight path for which this computer provides
   * guidance.
   * @param apValues Autopilot values for the autopilot associated with this computer.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly calculator: VNavPathCalculator,
    private readonly apValues: Readonly<GarminVNavComputerAPValues>,
    options?: Partial<Readonly<GarminVNavComputerOptions>>
  ) {
    if (!VNavUtils.isValidVNavIndex(index)) {
      throw new Error(`GarminVNavComputer: invalid index (${index}) specified (must be a non-negative integer)`);
    }

    const simVarSuffix = this.index === 0 ? '' : `:${this.index}`;
    this.simVarMap = {} as Record<VNavVars, string>;
    for (const simVar of Object.values(VNavVars)) {
      this.simVarMap[simVar] = `${simVar}${simVarSuffix}`;
    }

    const eventBusTopicSuffix = VNavUtils.getEventBusTopicSuffix(this.index);
    this.vnavTopicMap = {
      // VNAV events
      'vnav_path_calculated': `vnav_path_calculated${eventBusTopicSuffix}`,
      'vnav_availability': `vnav_availability${eventBusTopicSuffix}`,
      'vnav_altitude_constraint_details': `vnav_altitude_constraint_details${eventBusTopicSuffix}`,
      'vnav_is_enabled': `vnav_is_enabled${eventBusTopicSuffix}`,

      // VNAV data events
      'vnav_cruise_altitude': `vnav_cruise_altitude${eventBusTopicSuffix}`,
      'vnav_flight_phase': `vnav_flight_phase${eventBusTopicSuffix}`,
      'vnav_tracking_phase': `vnav_tracking_phase${eventBusTopicSuffix}`,
      'vnav_active_constraint_global_leg_index': `vnav_active_constraint_global_leg_index${eventBusTopicSuffix}`,
      'vnav_track_alert': `vnav_track_alert${eventBusTopicSuffix}`,

      // VNAV control events
      'vnav_set_state': `vnav_set_state${eventBusTopicSuffix}`,
    };

    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);

    this.primaryPlanIndex = options?.primaryPlanIndex ?? 0;
    this.enableAdvancedVNav = options?.enableAdvancedVNav ?? false;

    const sub = this.bus.getSubscriber<
      LNavEvents & LNavDataEvents & LNavControlEvents & APEvents & AdcEvents & GNSSEvents & ClockEvents
      & VNavControlEvents & AltitudeSelectEvents & FmsEvents
    >();

    this.lnavIndex.sub(lnavIndex => {
      this.isLNavIndexValid = LNavUtils.isValidLNavIndex(lnavIndex);
      if (this.isLNavIndexValid) {
        const suffix = LNavUtils.getEventBusTopicSuffix(lnavIndex);
        this.lnavLegIndex.setConsumer(sub.on(`lnav_tracked_leg_index${suffix}`));
        this.lnavLegDistanceAlong.setConsumer(sub.on(`lnav_leg_distance_along${suffix}`));
        this.lnavXtk.setConsumer(sub.on(`lnav_xtk${suffix}`));
        this.lnavDtk.setConsumer(sub.on(`lnav_dtk${suffix}`));
        this.lnavDataCdiScale.setConsumer(sub.on(`lnavdata_cdi_scale${suffix}`));
        this.activateMaprState.setConsumer(sub.on(`activate_missed_approach${suffix}`));
      } else {
        this.lnavLegIndex.setConsumer(null);
        this.lnavLegDistanceAlong.setConsumer(null);
        this.lnavXtk.setConsumer(null);
        this.lnavDtk.setConsumer(null);
        this.lnavDataCdiScale.setConsumer(null);
        this.activateMaprState.setConsumer(null);
      }
    }, true);

    sub.on('indicated_alt').handle(alt => this.currentAltitude = alt);
    sub.on('vertical_speed').whenChangedBy(1).handle(vs => this.currentVS = vs);
    sub.on('track_deg_true').whenChangedBy(1).handle(trueTrack => this.trueTrack = trueTrack);

    this.simRate.setConsumer(sub.on('simRate'));

    sub.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
      this.currentGpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    });
    sub.on('ground_speed').handle(gs => this.currentGroundSpeed = gs);

    this.isAltSelectInitialized.setConsumer(sub.on('alt_select_is_initialized'));

    this.publisher.pub(this.vnavTopicMap['vnav_is_enabled'], this.isEnabled, true, true);
    sub.on(this.vnavTopicMap['vnav_set_state']).handle(this.setEnabled.bind(this));

    // Update the highest constraint altitude in the flight plan (excluding the missed approach)
    this.calculator.planBuilt.on((sender, planIndex) => {
      if (planIndex === this.primaryPlanIndex) {
        const verticalPlan = this.calculator.getVerticalFlightPlan(planIndex);
        const missedApproachStartIndex = verticalPlan.missedApproachStartIndex ?? Infinity;
        this.highestConstraintAltitude = verticalPlan.constraints.reduce((highestAlt, constraint) => {
          if (constraint.index >= missedApproachStartIndex) {
            return highestAlt;
          }

          return Math.max(
            highestAlt,
            isFinite(constraint.minAltitude) ? constraint.minAltitude : 0,
            isFinite(constraint.maxAltitude) ? constraint.maxAltitude : 0,
          );
        }, 0);
      }
    });

    // Update last climb/first descent constraint indexes
    this.calculator.vnavCalculated.on((sender, planIndex) => {
      const verticalPlan = this.calculator.getVerticalFlightPlan(planIndex);
      const missedApproachStartIndex = verticalPlan.missedApproachStartIndex ?? Infinity;
      const verticalPlanConstraints = verticalPlan.constraints;

      this.lastClimbConstraintLegIndex = -1;
      let lastClimbConstraintIndex = -1;
      for (let i = 0; i < verticalPlanConstraints.length; i++) {
        const constraint = verticalPlanConstraints[i];
        if (constraint.index < missedApproachStartIndex && constraint.type === 'climb') {
          this.lastClimbConstraintLegIndex = constraint.index;
          lastClimbConstraintIndex = i;
          break;
        }
      }

      this.firstDescentConstraintLegIndex = -1;
      for (let i = (lastClimbConstraintIndex < 0 ? verticalPlanConstraints.length : lastClimbConstraintIndex) - 1; i >= 0; i--) {
        const constraint = verticalPlanConstraints[i];
        if ((constraint.type === 'descent' || constraint.type === 'manual' || constraint.type === 'direct') && constraint.fpa > 0) {
          this.firstDescentConstraintLegIndex = constraint.index;
          break;
        }
      }
    });

    // Publish TOD/BOD and BOC/TOC details.
    this.todBodDetailsSubject.sub(this.publishTodBodDetails.bind(this), true);
    this.tocBocDetailsSubject.sub(this.publishBocTocDetails.bind(this), true);

    this.isVNavUnavailable.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_availability'], v ? VNavAvailability.InvalidLegs : VNavAvailability.Available, true, true);
    }, true);

    this.monitorVars();

    this.monitorMessages();

    this.setState(VNavState.Enabled_Inactive);
  }

  /**
   * Attempts to activate VNAV.
   */
  public tryActivate(): void {
    if (this.state !== VNavState.Enabled_Active) {
      if (this.enableAdvancedVNav || this.calculator.getFlightPhase(this.primaryPlanIndex) === VerticalFlightPhase.Descent) {
        this.state = VNavState.Enabled_Active;
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.VNAVState], SimVarValueType.Number, this.state);
        this.pathMode.set(VNavPathMode.None);
      }
    }
  }

  /**
   * Attempts to deactivate VNAV.
   */
  public tryDeactivate(): void {
    if (this.state === VNavState.Enabled_Active) {
      this.state = VNavState.Enabled_Inactive;
      SimVar.SetSimVarValue(this.simVarMap[VNavVars.VNAVState], SimVarValueType.Number, this.state);
      this.disarmPath();
      this.disarmClimb();
      this.cancelAltCap();
      this.isAltCaptured = false;
      this.isAwaitingPathRearm = false;
      this.pathRearmIndex = -1;
      this.clearAllMessages();
    }
  }

  /**
   * Sets whether VNAV is enabled.
   * @param enabled Whether VNAV is enabled.
   */
  private setEnabled(enabled: boolean): void {
    if (this.isEnabled === enabled) {
      return;
    }

    this.isEnabled = enabled;

    this.publisher.pub(this.vnavTopicMap['vnav_is_enabled'], enabled, true, true);
  }

  /**
   * Sets this computer's VNAV state.
   * @param vnavState The state to set.
   */
  private setState(vnavState: VNavState): void {
    if (vnavState !== this.state) {

      this.state = vnavState;

      switch (this.state) {
        case VNavState.Disabled:
          this.disarmPath();
          this.disarmClimb();
          this.cancelAltCap();
          this.isAltCaptured = false;
          this.isAwaitingPathRearm = false;
          this.pathRearmIndex = -1;
          this.clearAllMessages();
          break;
        case VNavState.Enabled_Active:
          this.tryActivate();
          break;
        case VNavState.Enabled_Inactive:
          this.tryDeactivate();
          break;
      }

      SimVar.SetSimVarValue(this.simVarMap[VNavVars.VNAVState], SimVarValueType.Number, this.state);
    }
  }

  /**
   * Applies the failed state to this computer's VNAV calculations.
   */
  private failVNav(): void {
    this.isActive = false;

    this.disarmPath();
    this.disarmClimb();
    this.resetVNavTrackingVars();
    this.resetTodBodVars();
    this.resetTocBocVars();
    this.resetTrackAlerts();

    this.activePathConstraintIndex = -1;
    this.isAwaitingPathRearm = false;
    this.pathRearmIndex = -1;
  }

  /**
   * Activates altitude capture mode.
   * @param altitude The altitude to capture, in feet.
   * @param flightPhase The vertical flight phase for which to arm a vertical mode once the altitude has been
   * captured, or `undefined` if no vertical mode should be armed. If the flight phase is `VerticalFlightPhase.Climb`,
   * then FLC will be armed. If the flight phase is `VerticalFlightPhase.Descent`, then PATH will be armed.
   * @param pathRearmIndex The global flight plan leg index at which PATH mode can be armed. Ignored if `flightPhase`
   * is not `VerticalFlightPhase.Descent`. Defaults to the index of the leg after the active flight plan leg at the
   * time the method is called.
   */
  private activateAltCap(altitude: number, flightPhase?: VerticalFlightPhase, pathRearmIndex?: number): void {
    this.isAwaitingAltCapture = true;
    this.altitudeToCapture = Math.round(altitude);
    if (flightPhase !== undefined) {
      switch (flightPhase) {
        case VerticalFlightPhase.Climb:
          this.stagedIsClimbArmed = true;
          break;
        case VerticalFlightPhase.Descent:
          this.stagedIsAwaitingPathRearm = true;
          this.stagedPathRearmIndex = pathRearmIndex ?? this.lnavLegIndex.get() + 1;
          break;
      }
    } else {
      this.stagedIsClimbArmed = false;
      this.stagedIsAwaitingPathRearm = false;
      this.stagedPathRearmIndex = -1;
    }
  }

  /**
   * Cancels altitude capture mode.
   */
  private cancelAltCap(): void {
    this.isAwaitingAltCapture = false;
    this.altitudeToCapture = 0;
    this.stagedIsAwaitingPathRearm = false;
    this.stagedPathRearmIndex = -1;
  }

  /**
   * Disarms climb (FLC) mode.
   */
  private disarmClimb(): void {
    this.stagedIsClimbArmed = false;
    this.isClimbArmed = false;
    this.shouldActivateClimbMode = false;
  }

  /**
   * Arms PATH mode.
   */
  private armPath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathArmed) {
      this.pathMode.set(VNavPathMode.PathArmed);
    }
    this.isAltCaptured = false;
    this.isAwaitingPathRearm = false;
    this.pathRearmIndex = -1;
  }

  /**
   * Activates PATH mode.
   */
  private activatePath(): void {
    if (this.pathMode.get() !== VNavPathMode.PathActive) {
      this.pathMode.set(VNavPathMode.PathActive);
    }
    this.resetPathReactivationInhibit();
    this.isAwaitingPathRearm = false;
    this.pathRearmIndex = -1;
  }

  /**
   * Deactivates and disarms PATH mode.
   */
  private disarmPath(): void {
    if (this.pathMode.get() !== VNavPathMode.None) {
      this.pathMode.set(VNavPathMode.None);
      this.isAltCaptured = false;
      this.checkAltSel.set(false);
      this.resetPathReactivationInhibit();
    }
  }

  /**
   * Resets this computer's PATH mode re-activation inhibit state.
   */
  private resetPathReactivationInhibit(): void {
    this.isPathActivationInhibited = false;
    this.pathReactivationTimeRemaining = 0;
    this.pathReactivationDeviationStage = 'armed';
  }

  /**
   * Updates this computer.
   */
  public update(): void {
    const realTime = Date.now();
    const dt = this.lastUpdateTime === undefined ? 0 : Math.max((realTime - this.lastUpdateTime) * this.simRate.get(), 0);
    this.lastUpdateTime = realTime;

    this.updateAPValues();

    // Update cruise altitude
    this.cruiseAltitude.set(MathUtils.round(Math.max(
      this.currentAltitude,
      this.isAltSelectInitialized.get() ? this.apSelectedAltitude : 0,
      this.highestConstraintAltitude
    ), 10));

    if (!this.isLNavIndexValid || !this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      this.failVNav();
      this.resetPathReactivationInhibit();
      this.resetVNavPhase();
      this.resetVNavConstraintVars();

      this.updateGuidance();
      this.updatePathGuidance();
      return;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
    const verticalPlan = this.calculator.getVerticalFlightPlan(this.primaryPlanIndex);

    const alongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const lateralLegIndex = this.lnavLegIndex.get();

    if (
      lateralPlan.length > 0
      && lateralLegIndex < lateralPlan.length
      && VNavUtils.verticalPlanHasLeg(verticalPlan, lateralLegIndex)
    ) {

      if (this.apVerticalActiveMode === APVerticalModes.GS || this.apVerticalActiveMode === APVerticalModes.GP) {
        this.failVNav();
        this.resetVNavPhase();
        this.resetVNavConstraintVars();
      } else {

        const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, lateralLegIndex);
        const currentConstraint = verticalPlan.constraints[currentConstraintIndex] as VNavConstraint | undefined;

        const firstDescentConstraintIndex = this.firstDescentConstraintLegIndex < 0
          ? -1
          : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, this.firstDescentConstraintLegIndex);

        const isInDeparture = lateralPlan.getSegment(lateralPlan.getSegmentIndex(lateralLegIndex)).segmentType === FlightPlanSegmentType.Departure;
        const isInMapr = this.activateMaprState.get() || BitFlags.isAll(lateralPlan.getLeg(lateralLegIndex).flags, LegDefinitionFlags.MissedApproach);

        if (this.currentGroundSpeed >= 30) {
          this.updateTrackErrorState();

          const trackError = this.noVNavTae.get() || this.noVNavXtk.get();

          // If altitude select is not initialized, then we need to disarm climb since FLC cannot be active without a
          // selected altitude.
          if (!this.isAltSelectInitialized.get()) {
            this.disarmClimb();
          }

          // If there is no active constraint (meaning we've passed the last constraint in the flight plan or there are no
          // constraints in the flight plan), then switch to FLC mode if it is armed.
          if (
            !currentConstraint
            && this.isClimbArmed
            && this.apSelectedAltitude > this.capturedAltitude
          ) {
            this.cancelAltCap();
            this.isAltCaptured = false;
            this.capturedAltitude = Number.POSITIVE_INFINITY;
            this.shouldActivateClimbMode = true;
          }

          if (!this.isEnabled || !currentConstraint) {
            this.isActive = false;
            !this.isEnabled && this.disarmClimb();
            this.disarmPath();
            this.resetVNavConstraintVars();
            this.resetVNavTrackingVars();
            this.resetTodBodVars();
            this.resetTocBocVars();
            this.resetTrackAlerts();
            this.activePathConstraintIndex = -1;
            this.isAwaitingPathRearm = false;
            this.pathRearmIndex = -1;

            // Need to handle phase logic if VNAV is not disabled
            if (this.isEnabled) {
              const hasClimbConstraint = this.lastClimbConstraintLegIndex >= 0;
              const hasDescentConstraint = this.firstDescentConstraintLegIndex >= 0;

              if (!hasClimbConstraint && !hasDescentConstraint) {
                // There are no constraints in the flight plan.
                this.resetVNavPhase();
              } else {
                if (isInDeparture) {
                  // We are in the departure (SID).
                  this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
                  this.vnavTrackingPhase.set(hasDescentConstraint ? GarminVNavTrackingPhase.Descent : GarminVNavTrackingPhase.Climb);
                } else if (hasDescentConstraint) {
                  // There is at least one descent constraint in the flight plan and we must be past it.
                  this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
                  this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Descent);
                } else {
                  // There are no descent constraints in the flight plan but at least one climb constraint and we must be past it.
                  if (this.currentAltitude >= this.cruiseAltitude.get() - GarminVNavComputer.CRUISE_PHASE_ALTITUDE_THRESHOLD) {
                    this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
                    this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Cruise);
                  } else {
                    this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
                    this.vnavTrackingPhase.set(isInMapr ? GarminVNavTrackingPhase.MissedApproach : GarminVNavTrackingPhase.Climb);
                  }
                }
              }
            } else {
              this.resetVNavPhase();
            }
          } else {
            const currentAltitudeMetric = UnitType.FOOT.convertTo(this.currentAltitude, UnitType.METER);
            const currentVSMetric = UnitType.FPM.convertTo(this.currentVS, UnitType.MPM);

            // Compute TOD/BOD and (if supported) TOC/BOC details.

            const todBodDetails = GarminVNavUtils.getTodBodDetails(
              verticalPlan, currentConstraintIndex, lateralLegIndex, alongLegDistance, currentAltitudeMetric, currentVSMetric, this.todBodDetails
            );

            // Update VNAV flight and tracking phases.

            const isPastTod = this.firstDescentConstraintLegIndex >= 0 && firstDescentConstraintIndex >= 0 // There is at least one descent constraint and...
              && (
                // ... we are past the first descent constraint...
                lateralLegIndex > this.firstDescentConstraintLegIndex
                // ... or we are within threshold distance of TOD
                || (todBodDetails.todLegIndex >= 0 && todBodDetails.distanceFromTod <= GarminVNavComputer.DESCENT_PHASE_TOD_DISTANCE)
                // ... or we are within threshold distance of the first descent constraint
                || (
                  GarminVNavUtils.getDistanceToConstraint(
                    verticalPlan,
                    firstDescentConstraintIndex,
                    lateralLegIndex,
                    alongLegDistance
                  ) <= GarminVNavComputer.DESCENT_PHASE_TOD_DISTANCE
                )
              );
            const isInCruise = lateralLegIndex > this.lastClimbConstraintLegIndex // We have sequenced all climb constraints and...
              // ... we are within threshold vertical distance of the cruise altitude
              && this.currentAltitude >= this.cruiseAltitude.get() - GarminVNavComputer.CRUISE_PHASE_ALTITUDE_THRESHOLD;

            // VNAV flight phase:
            // Climb: in departure segment or airplane has not yet sequenced all climb constraints (excluding the ones in
            //        the missed approach) or airplane is more than 500 feet below the cruise altitude.
            // Cruise: airplane is not in the departure segment and has sequenced all climb constraints (excluding the ones
            //         in the missed approach) and the airplane is higher than 500 feet below the cruise altitude.
            // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan.

            if (isInDeparture) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
            } else if (isPastTod) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
            } else if (isInCruise) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
            } else {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
            }

            // VNAV tracking phase (determines whether VNAV will track climb or descent):

            if (this.enableAdvancedVNav) {
              // Climb: airplane is not past 10 NM to go to the first TOD in the flight plan and has not sequenced all
              //        climb constraints or is lower than 500 feet below the cruise altitude.
              // Cruise: airplane has sequenced all climb constraints (excluding the ones in the missed approach) and the
              //         airplane is higher than 500 feet below the cruise altitude.
              // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan and is not in the missed
              //          approach.
              // Missed approach: airplane is in the missed approach.

              if (isInMapr) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.MissedApproach);
              } else if (isPastTod) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
              } else if (isInCruise) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
              } else {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Climb);
              }
            } else {
              // Cruise: default phase.
              // Descent: airplane is at or past 10 NM to go to the first TOD in the flight plan.

              if (isPastTod) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
              } else {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
              }
            }

            const vnavTrackingPhase = this.vnavTrackingPhase.get();
            const inClimb = vnavTrackingPhase === GarminVNavTrackingPhase.Climb || vnavTrackingPhase === GarminVNavTrackingPhase.MissedApproach;

            this.currentConstraintLegIndex.set(currentConstraint.index);

            // Find the constraint matching the current tracking phase that applies to the active flight plan leg.
            let currentPhaseConstraintIndex: number;
            if (isInMapr) {
              currentPhaseConstraintIndex = currentConstraint.type === 'missed'
                ? currentConstraintIndex
                : VNavUtils.getNextMaprConstraintIndex(verticalPlan, lateralLegIndex);
            } else if (inClimb) {
              currentPhaseConstraintIndex = currentConstraint.type === 'climb'
                ? currentConstraintIndex
                : VNavUtils.getNextClimbConstraintIndex(verticalPlan, lateralLegIndex);
            } else {
              currentPhaseConstraintIndex = currentConstraint.type !== 'climb' && currentConstraint.type !== 'missed'
                ? currentConstraintIndex
                : VNavUtils.getNextDescentConstraintIndex(verticalPlan, lateralLegIndex);
            }
            const currentPhaseConstraint = verticalPlan.constraints[currentPhaseConstraintIndex] as VNavConstraint | undefined;

            if (trackError) {
              // If one or more LNAV track error limits have been exceeded, reset all vertical tracking data but still
              // publish constraint data (current + active constraint and FPA).

              this.isActive = false;
              this.disarmClimb();
              this.disarmPath();
              this.resetVNavTrackingVars();
              this.resetTodBodVars();
              this.resetTocBocVars();
              this.resetTrackAlerts();

              if (inClimb) {
                // The active constraint is the current phase constraint.

                this.vnavActiveConstraintLegIndex.set(currentPhaseConstraint === undefined ? -1 : currentPhaseConstraint.index);
                this.fpa.set(null);
              } else {
                // The active constraint and FPA are based on the last known active path constraint, if one exists and does
                // not precede (in flight plan order) the current constraint (the constraint containing the active flight
                // plan leg). Otherwise, they are based on the current phase constraint.

                const activeConstraintIndex = this.activePathConstraintIndex < 0 || this.activePathConstraintIndex > currentConstraintIndex
                  ? currentPhaseConstraintIndex
                  : this.activePathConstraintIndex;

                const activeConstraint = verticalPlan.constraints[activeConstraintIndex] as VNavConstraint | undefined;
                if (activeConstraint) {
                  this.vnavActiveConstraintLegIndex.set(activeConstraint.index);
                  this.fpa.set(activeConstraint.fpa);
                } else {
                  this.vnavActiveConstraintLegIndex.set(-1);
                  this.fpa.set(null);
                }
              }
            } else {

              // If we are in the climb or missed approach tracking phases and advanced VNAV is supported, calculate
              // TOC/BOC details. Otherwise blank the TOC/BOC details.

              const tocBocDetails = this.tocBocDetails;
              if (inClimb && this.enableAdvancedVNav) {
                GarminVNavUtils.getTocBocDetails(
                  verticalPlan,
                  currentConstraintIndex,
                  lateralLegIndex, alongLegDistance,
                  this.currentGroundSpeed, currentAltitudeMetric, currentVSMetric,
                  isInMapr,
                  this.tocBocDetails
                );

                // If TOC and BOC are defined, check if the airplane's current altitude is above the BOC suppression threshold
                // and suppress the BOC as appropriate.
                if (
                  tocBocDetails.tocLegIndex >= 0
                  && tocBocDetails.bocLegIndex >= 0
                  && currentAltitudeMetric > tocBocDetails.tocAltitude + GarminVNavComputer.BOC_SUPPRESS_ALTITUDE_THRESHOLD
                ) {
                  tocBocDetails.bocLegIndex = -1;
                  tocBocDetails.distanceFromBoc = 0;
                }

                // If TOC is defined, check if the airplane's current altitude is above the TOC suppression threshold and
                // suppress the TOC as appropriate.
                if (
                  tocBocDetails.tocLegIndex >= 0
                  && currentAltitudeMetric >= tocBocDetails.tocAltitude - GarminVNavComputer.TOC_SUPPRESS_ALTITUDE_THRESHOLD
                ) {
                  tocBocDetails.tocLegIndex = -1;
                  tocBocDetails.distanceFromToc = 0;
                  tocBocDetails.tocLegDistance = 0;
                  tocBocDetails.tocConstraintIndex = -1;
                  tocBocDetails.tocAltitude = -1;
                }
              } else {
                GarminVNavUtils.getTocBocDetails(
                  verticalPlan,
                  -1,
                  lateralLegIndex, alongLegDistance,
                  this.currentGroundSpeed, currentAltitudeMetric, currentVSMetric,
                  isInMapr,
                  this.tocBocDetails
                );
              }

              // Publish TOD/BOD and TOC/BOC data.
              this.manageTodBodTocBocDetails(lateralLegIndex, todBodDetails, tocBocDetails);

              let activeConstraintIndex = -1;
              let activePathConstraintIndex = -1;
              let timeToTodSeconds: number | undefined;

              // If we are in a descent and have a valid TOD (i.e. there exists a valid descent path that is capturable by
              // V PATH), then we need to designate the active path constraint. If we are within 1 min of the TOD or past
              // the TOD, then the active path constraint is the constraint defining the descent path that the TOD lies on.
              // Otherwise, the active path constraint is the current constraint (the constraint containing the active
              // flight plan leg).
              if (!inClimb && todBodDetails.todConstraintIndex >= 0) {
                timeToTodSeconds = UnitType.METER.convertTo(todBodDetails.distanceFromTod, UnitType.NMILE) / this.currentGroundSpeed * 3600;

                if (currentConstraintIndex <= todBodDetails.todConstraintIndex) {
                  activePathConstraintIndex = currentConstraintIndex;
                } else {
                  const activePathTodTimeThreshold = GarminVNavComputer.ACTIVE_PATH_TOD_TIME_THRESHOLD
                    + (this.activePathConstraintIndex === todBodDetails.todConstraintIndex ? GarminVNavComputer.ACTIVE_PATH_TOD_TIME_HYSTERESIS : 0);

                  if (timeToTodSeconds <= activePathTodTimeThreshold) {
                    activePathConstraintIndex = todBodDetails.todConstraintIndex;
                  }
                }
              }

              this.activePathConstraintIndex = activePathConstraintIndex;

              // If we are tracking a climb or there is no active path constraint, the current phase constraint is the active
              // constraint; otherwise the active path constraint is the active constraint.
              if (inClimb || activePathConstraintIndex < 0) {
                if (currentPhaseConstraint) {
                  activeConstraintIndex = currentPhaseConstraintIndex;
                  this.vnavActiveConstraintLegIndex.set(currentPhaseConstraint.index);
                } else {
                  activeConstraintIndex = -1;
                  this.vnavActiveConstraintLegIndex.set(-1);
                }
              } else {
                activeConstraintIndex = activePathConstraintIndex;
                this.vnavActiveConstraintLegIndex.set(verticalPlan.constraints[activePathConstraintIndex].index);
              }

              if (activePathConstraintIndex >= 0) {
                this.disarmClimb();
              }

              this.isActive = this.state === VNavState.Enabled_Active;

              if (!inClimb && !this.isClimbArmed) {
                this.updateDescentTrackAlerts(todBodDetails);

                // If there is no active descent constraint, then VNAV remains inactive and PATH cannot be armed.
                if (activeConstraintIndex < 0) {
                  this.isActive = false;
                  this.disarmPath();
                }

                const activeConstraint = verticalPlan.constraints[activeConstraintIndex];
                this.fpa.set(activeConstraint === undefined ? null : activeConstraint.fpa);
                this.setCurrentConstraintDetails(verticalPlan, activeConstraintIndex, lateralLegIndex);
                this.pathAvailable.set(true);
                this.trackDescent(dt, verticalPlan, lateralPlan, todBodDetails, activeConstraintIndex, activePathConstraintIndex);
              } else if (this.enableAdvancedVNav && (inClimb || this.isClimbArmed)) {
                this.updateClimbTrackAlerts(tocBocDetails);

                this.disarmPath();

                this.fpa.set(null);
                this.setCurrentConstraintDetails(verticalPlan, activeConstraintIndex, lateralLegIndex);
                this.pathAvailable.set(false);
                this.lastCapturedPathDesiredAltitude = undefined;
                this.trackClimb(verticalPlan, lateralPlan, tocBocDetails, activeConstraintIndex);
              } else {
                this.resetTrackAlerts();

                this.disarmPath();
                this.fpa.set(null);
                this.resetVNavTrackingVars();
              }
            }
          }
        } else {
          // Ground speed is less than 30 knots. In this case we will fail VNAV, but still publish phase data and
          // current/active constraint data if VNAV is not disabled.

          this.failVNav();

          if (!this.isEnabled) {
            this.resetVNavPhase();
            this.resetVNavConstraintVars();
          } else {

            const isPastTod = this.firstDescentConstraintLegIndex >= 0 && firstDescentConstraintIndex >= 0 // There is at least one descent constraint and...
              && (
                // ... we are past the first descent constraint...
                lateralLegIndex > this.firstDescentConstraintLegIndex
                // ... or we are within threshold distance of the first descent constraint
                || (
                  GarminVNavUtils.getDistanceToConstraint(
                    verticalPlan,
                    firstDescentConstraintIndex,
                    lateralLegIndex,
                    alongLegDistance
                  ) <= GarminVNavComputer.DESCENT_PHASE_TOD_DISTANCE
                )
              );

            const isCurrentConstraintClimb = currentConstraint && (currentConstraint.type === 'climb' || currentConstraint.type === 'missed');

            // VNAV flight phase:
            // Climb: in departure segment or the current constraint is a climb constraint.
            // Cruise: airplane is not in the departure segment and the current constraint is not a climb constraint.
            // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan or is in the
            //          missed approach.

            if (isInDeparture) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
            } else if (isPastTod || isInMapr) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Descent);
            } else if (isCurrentConstraintClimb) {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Climb);
            } else {
              this.vnavFlightPhase.set(GarminVNavFlightPhase.Cruise);
            }

            // VNAV tracking phase:

            if (this.enableAdvancedVNav) {
              // Climb: airplane is not past 10 NM to go to the first descent constraint and the current constraint
              //        constraint is a climb constraint.
              // Cruise: airplane is not past 10 NM to go to the first descent constraint and the current constraint is a
              //         climb constraint.
              // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan and is not
              //          in the missed approach.
              // Missed approach: airplane is in the missed approach.

              if (isInMapr) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.MissedApproach);
              } else if (isPastTod) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
              } else if (isCurrentConstraintClimb) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Climb);
              } else {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
              }
            } else {
              // Cruise: default phase.
              // Descent: airplane is at or past 10 NM to go to the first descent constraint in the flight plan.

              if (isPastTod) {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Descent);
              } else {
                this.vnavTrackingPhase.set(GarminVNavTrackingPhase.Cruise);
              }
            }

            if (currentConstraint) {
              this.currentConstraintLegIndex.set(currentConstraint.index);
              // The active constraint is the current constraint unless we are not in the missed approach and the current
              // constraint is a missed approach constraint.
              this.vnavActiveConstraintLegIndex.set((!isInMapr && currentConstraint.type === 'missed') ? -1 : currentConstraint.index);
              this.fpa.set(isCurrentConstraintClimb ? null : currentConstraint.fpa);
            } else {
              this.resetVNavConstraintVars();
            }
          }
        }
      }
    } else {
      this.failVNav();
      this.resetVNavPhase();
      this.resetVNavConstraintVars();
    }

    this.updateGuidance();
    this.updatePathGuidance();

    // evaluate tod time remaining for annunciation
    const todDistanceNM = UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE);
    const timeRemainingSecs = UnitType.HOUR.convertTo(todDistanceNM / this.currentGroundSpeed, UnitType.SECOND);
    this.withinOneMinuteTod.set(this.todBodDetails.distanceFromTod > 100 && timeRemainingSecs <= 60
      && this.state === VNavState.Enabled_Active && this.pathMode.get() !== VNavPathMode.PathActive);
    this.withinFiveSecondsTod.set(this.withinOneMinuteTod.get() && timeRemainingSecs <= 10);
  }

  /**
   * Updates the autopilot values used by this computer.
   */
  private updateAPValues(): void {
    this.apSelectedAltitude = this.apValues.selectedAltitude.get();
    this.apSelectedVs = this.apValues.selectedVerticalSpeed.get();

    this.updateApLateralActiveMode(this.apValues.lateralActive.get());
    this.updateApVerticalActiveMode(this.apValues.verticalActive.get());
    this.updateApVerticalArmedMode(this.apValues.verticalArmed.get());
  }

  /**
   * Updates the autopilot's active lateral mode.
   * @param mode The active lateral mode.
   */
  private updateApLateralActiveMode(mode: number): void {
    if (mode === this.apLateralActiveMode) {
      return;
    }

    this.apLateralActiveMode = mode;

    if (mode === APLateralModes.LOC && this.pathMode.get() === VNavPathMode.PathArmed) {
      this.tryDeactivate();
    }
  }

  /**
   * Updates the autopilot's active vertical mode.
   * @param mode The active vertical mode.
   */
  private updateApVerticalActiveMode(mode: number): void {
    if (mode === this.apVerticalActiveMode) {
      return;
    }

    const oldMode = this.apVerticalActiveMode;

    this.apVerticalActiveMode = mode;

    if (this.isAwaitingAltCapture && (mode === APVerticalModes.CAP || mode === APVerticalModes.ALT)) {
      this.isAwaitingAltCapture = false;
      this.isAltCaptured = true;
      this.capturedAltitude = this.altitudeToCapture;

      this.isClimbArmed = this.stagedIsClimbArmed;
      this.isAwaitingPathRearm = this.stagedIsAwaitingPathRearm;
      this.pathRearmIndex = this.stagedPathRearmIndex;
    }

    if (this.isAwaitingPathRearm && mode !== APVerticalModes.ALT && mode !== APVerticalModes.CAP) {
      this.isAwaitingPathRearm = false;
      this.pathRearmIndex = -1;
    }

    if (mode === APVerticalModes.FLC) {
      this.isClimbArmed = false;
      this.shouldActivateClimbMode = false;
    }

    if (oldMode === APVerticalModes.PATH) {
      this.onPathDirectorDeactivated();
    }
  }

  /**
   * Updates the autopilot's armed vertical mode.
   * @param mode The armed vertical mode.
   */
  private updateApVerticalArmedMode(mode: number): void {
    if (mode === this.apVerticalArmedMode) {
      return;
    }

    const oldMode = this.apVerticalArmedMode;

    this.apVerticalArmedMode = mode;

    if (oldMode === APVerticalModes.PATH) {
      this.onPathDirectorDeactivated();
    }
  }

  /**
   * Responds to when the autopilot's PATH director is deactivated.
   */
  private onPathDirectorDeactivated(): void {
    if (this.apVerticalActiveMode === APVerticalModes.GP || this.apVerticalActiveMode === APVerticalModes.GS) {
      this.pathMode.set(VNavPathMode.None);
    } else if (this.pathMode.get() === VNavPathMode.PathActive || this.pathMode.get() === VNavPathMode.PathArmed) {
      this.pathMode.set(VNavPathMode.None);
      this.isAltCaptured = false;
      this.checkAltSel.set(false);

      if (
        this.apVerticalActiveMode === APVerticalModes.VS
        || this.apVerticalActiveMode === APVerticalModes.FLC
        || this.apVerticalActiveMode === APVerticalModes.ALT
      ) {
        // The only way we can go from PATH to VS/FLC/ALT is if the latter was manually selected by the user.
        // Therefore, we will inhibit PATH activation so that if PATH is re-armed, we don't immediately recapture the
        // path. Note that other modes can also be manually selected to override PATH (e.g. TO/GA), but PATH arming
        // is inhibited in those modes.
        this.isPathActivationInhibited = true;
        this.pathReactivationDeviationStage = 'armed';
        this.pathReactivationTimeRemaining = 10000;
      }
    }
  }

  /**
   * Updates the guidance provided by this computer.
   */
  private updateGuidance(): void {
    const guidanceBufferActiveIndex = this._guidance.get() === this.guidanceBuffer[0] ? 0 : 1;
    const guidance = this.guidanceBuffer[(guidanceBufferActiveIndex + 1) % 2];

    guidance.state = this.state;
    guidance.isActive = this.isActive;
    guidance.pathMode = this.pathMode.get();
    guidance.armedClimbMode = this.isClimbArmed ? APVerticalModes.FLC : APVerticalModes.NONE;
    guidance.shouldActivateClimbMode = this.shouldActivateClimbMode;
    guidance.altitudeCaptureType = this.captureType.get();
    guidance.shouldCaptureAltitude = this.isAwaitingAltCapture;
    guidance.altitudeToCapture = this.altitudeToCapture;

    this._guidance.set(guidance);
  }

  /**
   * Updates the vertical path guidance provided by this computer.
   */
  private updatePathGuidance(): void {
    const guidanceBufferActiveIndex = this._pathGuidance.get() === this.pathGuidanceBuffer[0] ? 0 : 1;
    const guidance = this.pathGuidanceBuffer[(guidanceBufferActiveIndex + 1) % 2];

    const fpa = this.fpa.get();
    const deviation = this.verticalDeviation.get();

    guidance.isValid = fpa !== null && deviation !== null;
    guidance.fpa = fpa ?? 0;
    guidance.deviation = deviation ?? 0;

    this._pathGuidance.set(guidance);
  }

  /**
   * Updates vertical track alerts for the climb phase.
   * @param tocBocDetails The computed TOC/BOC details.
   */
  private updateClimbTrackAlerts(tocBocDetails: TocBocDetails): void {
    this.isTrackAlertArmed[GarminVNavTrackAlertType.TodOneMinute] = true;
    this.isTrackAlertArmed[GarminVNavTrackAlertType.BodOneMinute] = true;

    let alertTypeToIssue: GarminVNavTrackAlertType.TocOneMinute | GarminVNavTrackAlertType.BocOneMinute | null = null;

    if (tocBocDetails.tocLegIndex >= 0 && tocBocDetails.distanceFromToc > 0) {
      const timeToTocSeconds = UnitType.METER.convertTo(tocBocDetails.distanceFromToc, UnitType.NMILE) / this.currentGroundSpeed * 3600;

      if (timeToTocSeconds >= GarminVNavComputer.TRACK_ALERT_REARM_THRESHOLD) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TocOneMinute] = true;
      } else if (timeToTocSeconds <= GarminVNavComputer.TRACK_ALERT_ISSUE_THRESHOLD && this.isTrackAlertArmed[GarminVNavTrackAlertType.TocOneMinute]) {
        alertTypeToIssue = GarminVNavTrackAlertType.TocOneMinute;
      }
    } else if (tocBocDetails.bocLegIndex >= 0 && tocBocDetails.distanceFromBoc >= 0) {
      const timeToBocSeconds = UnitType.METER.convertTo(tocBocDetails.distanceFromBoc, UnitType.NMILE) / this.currentGroundSpeed * 3600;

      if (timeToBocSeconds >= GarminVNavComputer.TRACK_ALERT_REARM_THRESHOLD) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BocOneMinute] = true;
      } else if (timeToBocSeconds <= GarminVNavComputer.TRACK_ALERT_ISSUE_THRESHOLD && this.isTrackAlertArmed[GarminVNavTrackAlertType.BocOneMinute]) {
        alertTypeToIssue = GarminVNavTrackAlertType.BocOneMinute;
      }
    }

    if (alertTypeToIssue !== null) {
      if (alertTypeToIssue === GarminVNavTrackAlertType.TocOneMinute) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TocOneMinute] = false;
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BocOneMinute] = true;
      } else {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BocOneMinute] = false;
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TocOneMinute] = true;
      }

      this.issueTrackAlert(alertTypeToIssue);
    }
  }

  /**
   * Updates vertical track alerts for the descent phase.
   * @param todBodDetails The computed TOD/BOD details.
   */
  private updateDescentTrackAlerts(todBodDetails: GarminTodBodDetails): void {
    this.isTrackAlertArmed[GarminVNavTrackAlertType.TocOneMinute] = true;
    this.isTrackAlertArmed[GarminVNavTrackAlertType.BocOneMinute] = true;

    let alertTypeToIssue: GarminVNavTrackAlertType.TodOneMinute | GarminVNavTrackAlertType.BodOneMinute | null = null;

    if (todBodDetails.todLegIndex >= 0 && todBodDetails.distanceFromTod > 0) {
      const timeToTodSeconds = UnitType.METER.convertTo(todBodDetails.distanceFromTod, UnitType.NMILE) / this.currentGroundSpeed * 3600;

      if (timeToTodSeconds >= GarminVNavComputer.TRACK_ALERT_REARM_THRESHOLD) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TodOneMinute] = true;
      } else if (timeToTodSeconds <= GarminVNavComputer.TRACK_ALERT_ISSUE_THRESHOLD && this.isTrackAlertArmed[GarminVNavTrackAlertType.TodOneMinute]) {
        alertTypeToIssue = GarminVNavTrackAlertType.TodOneMinute;
      }
    } else if (todBodDetails.bodLegIndex >= 0 && todBodDetails.distanceFromBod >= 0) {
      const timeToBodSeconds = UnitType.METER.convertTo(todBodDetails.distanceFromBod, UnitType.NMILE) / this.currentGroundSpeed * 3600;

      if (timeToBodSeconds >= GarminVNavComputer.TRACK_ALERT_REARM_THRESHOLD) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BodOneMinute] = true;
      } else if (timeToBodSeconds <= GarminVNavComputer.TRACK_ALERT_ISSUE_THRESHOLD && this.isTrackAlertArmed[GarminVNavTrackAlertType.BodOneMinute]) {
        alertTypeToIssue = GarminVNavTrackAlertType.BodOneMinute;
      }
    }

    if (alertTypeToIssue !== null) {
      if (alertTypeToIssue === GarminVNavTrackAlertType.TodOneMinute) {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TodOneMinute] = false;
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BodOneMinute] = true;
      } else {
        this.isTrackAlertArmed[GarminVNavTrackAlertType.BodOneMinute] = false;
        this.isTrackAlertArmed[GarminVNavTrackAlertType.TodOneMinute] = true;
      }

      this.issueTrackAlert(alertTypeToIssue);
    }
  }

  /**
   * Issues a vertical track alert.
   * @param type The type of alert to issue.
   */
  private issueTrackAlert(type: GarminVNavTrackAlertType): void {
    this.publisher.pub(this.vnavTopicMap['vnav_track_alert'], type, true, false);
  }

  /**
   * Updates vertical tracking for climb.
   * @param verticalPlan The vertical flight plan.
   * @param lateralPlan The lateral flight plan.
   * @param tocBocDetails The computed TOC/BOC details.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg, or `-1` if
   * there is no such constraint.
   */
  private trackClimb(
    verticalPlan: VerticalFlightPlan,
    lateralPlan: FlightPlan,
    tocBocDetails: TocBocDetails,
    activeConstraintIndex: number
  ): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    this.requiredVS.set(activeConstraintIndex < 0
      ? null
      : this.getClimbRequiredVs(verticalPlan, activeConstraintIndex, lateralLegIndex, currentAlongLegDistance)
    );

    const isMapr = BitFlags.isAll(lateralPlan.getLeg(lateralLegIndex).flags, LegDefinitionFlags.MissedApproach);

    const currentClimbConstraint = isMapr
      ? VNavUtils.getNextMaprTargetConstraint(verticalPlan, lateralLegIndex)
      : VNavUtils.getNextClimbTargetConstraint(verticalPlan, lateralLegIndex);
    const constraintAltitudeFeet = currentClimbConstraint !== undefined ? UnitType.METER.convertTo(currentClimbConstraint.maxAltitude, UnitType.FOOT)
      : Number.POSITIVE_INFINITY;

    this.targetAltitude.set(currentClimbConstraint !== undefined ? constraintAltitudeFeet : null);

    this.checkAltSel.set(
      this.isActive
      && currentClimbConstraint !== undefined
      && this.isClimbArmed
      && lateralLegIndex === currentClimbConstraint.index
      && UnitType.METER.convertTo(tocBocDetails.distanceFromBoc, UnitType.NMILE) / (this.currentGroundSpeed / 60) < 0.75
      && this.apSelectedAltitude <= this.capturedAltitude
    );

    // If VNAV is not active, we are done here since the rest of this method deals exclusively with AP mode change and
    // altitude capture logic.
    if (!this.isActive) {
      this.captureType.set(VNavAltCaptureType.None);
      return;
    }

    if (
      // NOTE: climb cannot be armed if selected altitude is not initialized.
      this.isClimbArmed
      && (currentClimbConstraint === undefined || Math.round(constraintAltitudeFeet) > this.capturedAltitude)
      && this.apSelectedAltitude > this.capturedAltitude
    ) {
      this.cancelAltCap();
      this.isAltCaptured = false;
      this.capturedAltitude = Number.POSITIVE_INFINITY;
      this.shouldActivateClimbMode = true;
      return;
    }

    if (currentClimbConstraint === undefined || this.isAltCaptured) {
      this.captureType.set(VNavAltCaptureType.None);
      return;
    }

    const isAltSelectInitialized = this.isAltSelectInitialized.get();

    let canArmAltV: boolean;

    const constraintAltitudeDelta = constraintAltitudeFeet - this.currentAltitude;
    const constraintAltitudeDeltaSign = Math.sign(constraintAltitudeDelta);
    switch (this.apVerticalActiveMode) {
      case APVerticalModes.PITCH:
      case APVerticalModes.TO:
      case APVerticalModes.GA:
        // ALTV can arm if current vertical speed is toward the constraint altitude.
        canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.currentVS) >= 0;
        break;
      case APVerticalModes.VS:
        // ALTV can arm if selected vertical speed is toward the constraint altitude.
        canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.apSelectedVs) >= 0;
        break;
      case APVerticalModes.FLC:
        // ALTV can arm if preselected altitude is toward the constraint altitude.
        canArmAltV = isAltSelectInitialized && constraintAltitudeDeltaSign * Math.sign(this.apSelectedAltitude - this.currentAltitude) >= 0;
        break;
      default:
        canArmAltV = false;
    }

    if (canArmAltV && isAltSelectInitialized) {
      // If ALTV can be armed, we need to make sure that we will not capture the preselected altitude first (if the
      // constraint and preselected altitudes are the same, preselected altitude takes precedence).

      const selectedAltitudeDelta = this.apSelectedAltitude - this.currentAltitude;
      if (constraintAltitudeDeltaSign < 0) {
        canArmAltV = selectedAltitudeDelta > 0 || selectedAltitudeDelta < constraintAltitudeDelta;
      } else if (constraintAltitudeDeltaSign > 0) {
        canArmAltV = selectedAltitudeDelta < 0 || selectedAltitudeDelta > constraintAltitudeDelta;
      }
    }

    if (canArmAltV) {
      this.captureType.set(VNavAltCaptureType.VNAV);

      const captureRange = Math.max(Math.abs(this.currentVS / 6), 50);

      if (Math.abs(constraintAltitudeDelta) <= captureRange) {
        this.activateAltCap(constraintAltitudeFeet, VerticalFlightPhase.Climb);
      } else {
        this.cancelAltCap();
      }
    } else {
      this.captureType.set(VNavAltCaptureType.None);
      this.cancelAltCap();
    }
  }

  /**
   * Gets the next altitude constraint to be sequenced that defines an altitude to be met for required vertical speed
   * calculations.
   * @param verticalPlan The vertical flight plan.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg.
   * @param globalLegIndex The index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the the
   * airplane's position, in meters.
   * @returns The next altitude constraint to be sequenced that defines an altitude to be met for required vertical
   * speed calculations, or `undefined` if there is no such constraint.
   */
  private getClimbRequiredVs(verticalPlan: VerticalFlightPlan, activeConstraintIndex: number, globalLegIndex: number, distanceAlongLeg: number): number | null {
    let constraintIndex = -1;

    // In climb phase, VSR is defined by the next climb constraint with a minimum altitude.
    for (let i = activeConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];
      if (constraint.type === 'climb' || constraint.type === 'missed') {
        if (constraint.minAltitude > Number.NEGATIVE_INFINITY) {
          constraintIndex = i;
          break;
        }
      } else {
        return null;
      }
    }

    if (constraintIndex < 0) {
      return null;
    }

    const constraint = verticalPlan.constraints[constraintIndex];
    const altitude = constraint.minAltitude;
    const distance = GarminVNavUtils.getDistanceToConstraint(verticalPlan, constraintIndex, globalLegIndex, distanceAlongLeg);

    const requiredVs = this.getRequiredVs(UnitType.METER.convertTo(distance, UnitType.NMILE), UnitType.METER.convertTo(altitude, UnitType.FOOT));
    if (requiredVs >= 100) {
      return requiredVs;
    } else {
      return null;
    }
  }

  /**
   * Updates vertical tracking for descent.
   * @param dt The elapsed simulation time since the last update cycle, in milliseconds.
   * @param verticalPlan The vertical flight Plan.
   * @param lateralPlan The lateral flight Plan.
   * @param todBodDetails The computed TOD/BOD details.
   * @param activeConstraintIndex The index of the VNAV constraint containing the active flight plan leg, or `-1` if
   * there is no such constraint.
   * @param activePathConstraintIndex The index of the constraint defining the active descent path, or `-1` if there is
   * no active descent path.
   */
  private trackDescent(
    dt: number,
    verticalPlan: VerticalFlightPlan,
    lateralPlan: FlightPlan,
    todBodDetails: GarminTodBodDetails,
    activeConstraintIndex: number,
    activePathConstraintIndex: number
  ): void {

    const lateralLegIndex = this.lnavLegIndex.get();
    const currentAlongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const currentConstraint = verticalPlan.constraints[activeConstraintIndex];
    const currentVerticalLeg = currentConstraint?.legs[currentConstraint.index - lateralLegIndex] as VNavLeg | undefined;
    let altitudeToCaptureInPath: number | null = null;
    let activePathConstraint: VNavConstraint | undefined;
    let verticalDeviation: number | null = null;
    let deviationFromAltitudeToCaptureInPath = Infinity;
    let distanceToActivePathConstraint = 0;

    if (activePathConstraintIndex < 0 || !currentConstraint) {
      this.targetAltitude.set(null);
      this.requiredVS.set(null);
      this.verticalDeviation.set(null);
      this.lastCapturedPathDesiredAltitude = undefined;

      if (this.pathMode.get() == VNavPathMode.PathActive) {
        this.disarmPath();
      }

      this.resetPathReactivationInhibit();

      if (this.isActive && currentConstraint) {
        this.updatePathArmState();
      }

      if (!currentConstraint) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }
    } else {
      activePathConstraint = verticalPlan.constraints[activePathConstraintIndex];
      distanceToActivePathConstraint = GarminVNavUtils.getDistanceToConstraint(
        verticalPlan,
        activePathConstraintIndex,
        lateralLegIndex,
        currentAlongLegDistance
      );

      const vnavTargetAltitude = verticalPlan.constraints[todBodDetails.bodConstraintIndex].targetAltitude;

      const vnavTargetAltitudeFeet = Math.round(UnitType.METER.convertTo(vnavTargetAltitude, UnitType.FOOT));

      this.requiredVS.set(this.getDescentRequiredVs(verticalPlan, activePathConstraintIndex, lateralLegIndex, currentAlongLegDistance));

      const pathFpa = activePathConstraint.fpa;

      const desiredAltitude = UnitType.METER.convertTo(
        GarminVNavUtils.getPathDesiredAltitude(verticalPlan, activePathConstraintIndex, distanceToActivePathConstraint),
        UnitType.FOOT
      );

      verticalDeviation = desiredAltitude - this.currentAltitude;

      if (this.isActive) {
        this.updatePathArmState();
      }

      // If path activation is inhibited, then check if the conditions for path reactivation have been met, and if so
      // remove the inhibit.
      if (this.isPathActivationInhibited) {
        this.pathReactivationTimeRemaining -= dt;

        switch (this.pathReactivationDeviationStage) {
          case 'armed':
            if (Math.abs(verticalDeviation) >= 250) {
              this.pathReactivationDeviationStage = 'deviated';
            }
            break;
          case 'deviated':
            if (Math.abs(verticalDeviation) <= 200) {
              this.pathReactivationDeviationStage = 'captured';
            }
            break;
        }

        if (this.pathReactivationTimeRemaining <= 0 && this.pathReactivationDeviationStage === 'captured') {
          this.resetPathReactivationInhibit();
        }
      }

      if (this.pathMode.get() === VNavPathMode.PathActive) {
        if (this.shouldDeactivatePath(desiredAltitude, verticalDeviation)) {
          this.verticalDeviation.set(verticalDeviation);
          this.disarmPath();
          this.lastCapturedPathDesiredAltitude = undefined;
          return;
        } else {
          this.lastCapturedPathDesiredAltitude = desiredAltitude;
        }
      } else {
        this.lastCapturedPathDesiredAltitude = undefined;
      }

      altitudeToCaptureInPath = this.apSelectedAltitude > this.currentAltitude
        ? vnavTargetAltitudeFeet
        : Math.max(vnavTargetAltitudeFeet, this.apSelectedAltitude);
      deviationFromAltitudeToCaptureInPath = this.currentAltitude - altitudeToCaptureInPath;

      this.isActive && this.canPathActivate(pathFpa, verticalDeviation, deviationFromAltitudeToCaptureInPath) && this.activatePath();
    }

    this.verticalDeviation.set(verticalDeviation);

    const pathActive = this.pathMode.get() == VNavPathMode.PathActive;

    const captureRange = Math.max(Math.abs(this.currentVS / 6), 50);

    if (pathActive) {
      // If PATH is active, then it is our responsibility to capture the next altitude, whether it is a VNAV constraint
      // altitude or a preselected altitude.

      // This should technically never happen since we disarm path above if there is no active path constraint.
      if (activePathConstraint === undefined || altitudeToCaptureInPath === null) {
        this.targetAltitude.set(null);
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      this.targetAltitude.set(altitudeToCaptureInPath);

      // VNAV should always be active if PATH is active, but just in case...
      if (!this.isActive) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      // NOTE: If PATH is active, then the selected altitude is guaranteed to be initialized.
      const altitudeToCaptureIsSelectedAltitude = this.apSelectedAltitude === altitudeToCaptureInPath;

      this.captureType.set(altitudeToCaptureIsSelectedAltitude ? VNavAltCaptureType.Selected : VNavAltCaptureType.VNAV);

      // If we are not yet within capture range of the target altitude, we are done and do not need to perform any
      // altitude capture operations.
      if (Math.abs(deviationFromAltitudeToCaptureInPath) > captureRange) {
        this.cancelAltCap();
        return;
      }

      const isPathEnd = activePathConstraint.isPathEnd;
      const nextLeg = !isPathEnd ? VNavUtils.getVerticalLegFromPlan(verticalPlan, activePathConstraint.index + 1) : undefined;

      // We will capture the altitude if...
      if (
        // ... we are capturing a selected altitude...
        altitudeToCaptureIsSelectedAltitude
        // ... or we are capturing the last altitude constraint in the vertical path...
        || nextLeg === undefined
        // ... or the next leg is a flat segment (i.e. the altitude constraint to capture is a BOD)...
        || nextLeg.fpa === 0
        // ... or the next leg is path-ineligible (this is functionally the same as if we were capturing the last
        // altitude constraint in the vertical path).
        || !nextLeg.isEligible
      ) {
        if (this.apVerticalActiveMode === APVerticalModes.PATH) {
          this.activateAltCap(
            altitudeToCaptureInPath,
            // Arm PATH after capturing the altitude unless we are at the end of the vertical path.
            !isPathEnd ? VerticalFlightPhase.Descent : undefined,
            // Wait to arm PATH until we sequence to the next leg unless we are capturing a selected altitude or the
            // current vertical leg does not end in a BOD.
            !altitudeToCaptureIsSelectedAltitude && currentVerticalLeg?.isBod ? lateralLegIndex + 1 : lateralLegIndex
          );
        }

        return;
      }

      // Now we know path is active, we are approaching a BOD and the next leg is valid and has a non-zero FPA.
      // If the TOD for the next leg is close to the BOD, we will skip altitude capture because we might fly past the
      // TOD by the time PATH rearms. If we skip capture, then PATH will stay active and pick up the deviation from
      // the next leg once the current leg is sequenced. The new deviation should be small and is guaranteed to be such
      // that the airplane is under the path, so the PATH director should have no problem re-establishing.

      const nextLegTodDistance = VNavUtils.distanceForAltitude(nextLeg.fpa, UnitType.FOOT.convertTo(altitudeToCaptureInPath, UnitType.METER) - nextLeg.altitude);
      const distanceToNextTod = distanceToActivePathConstraint + nextLeg.distance - nextLegTodDistance;

      if (distanceToNextTod > 1900) {
        this.activateAltCap(altitudeToCaptureInPath, VerticalFlightPhase.Descent);
      }
    } else {
      // If we are in a non-PATH vertical mode, ALTV should capture the minimum altitude of the current constraint
      // (VNAV ineligible legs and discontinuities don't matter here since we aren't tracking a path).

      const isAltSelectInitialized = this.isAltSelectInitialized.get();

      let canArmAltV: boolean;

      const constraintAltitudeFeet = Math.round(UnitType.METER.convertTo(currentConstraint.minAltitude, UnitType.FOOT));
      const constraintAltitudeDelta = constraintAltitudeFeet - this.currentAltitude;
      const constraintAltitudeDeltaSign = Math.sign(constraintAltitudeDelta);

      switch (this.apVerticalActiveMode) {
        case APVerticalModes.PITCH:
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          // ALTV can arm if current vertical speed is toward the constraint altitude.
          canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.currentVS) >= 0;
          break;
        case APVerticalModes.VS:
          // ALTV can arm if selected vertical speed is toward the constraint altitude.
          canArmAltV = constraintAltitudeDeltaSign * Math.sign(this.apSelectedVs) >= 0;
          break;
        case APVerticalModes.FLC:
          // ALTV can arm if preselected altitude is toward the constraint altitude.
          canArmAltV = isAltSelectInitialized && constraintAltitudeDeltaSign * Math.sign(this.apSelectedAltitude - this.currentAltitude) >= 0;
          break;
        default:
          canArmAltV = false;
      }

      if (canArmAltV && isAltSelectInitialized) {
        // If ALTV can be armed, we need to make sure that we will not capture the preselected altitude first (if the
        // constraint and preselected altitudes are the same, preselected altitude takes precedence).

        const selectedAltitudeDelta = this.apSelectedAltitude - this.currentAltitude;
        if (constraintAltitudeDeltaSign < 0) {
          canArmAltV = selectedAltitudeDelta > 0 || selectedAltitudeDelta < constraintAltitudeDelta;
        } else if (constraintAltitudeDeltaSign > 0) {
          canArmAltV = selectedAltitudeDelta < 0 || selectedAltitudeDelta > constraintAltitudeDelta;
        }
      }

      this.targetAltitude.set(canArmAltV ? constraintAltitudeFeet : null);

      // If VNAV is not active, we are done here since everything that comes after deals exclusively with altitude capture.
      if (!this.isActive) {
        this.captureType.set(VNavAltCaptureType.None);
        return;
      }

      if (canArmAltV) {
        this.captureType.set(VNavAltCaptureType.VNAV);

        if (Math.abs(constraintAltitudeDelta) <= captureRange) {
          this.activateAltCap(
            constraintAltitudeFeet,
            activePathConstraint?.isPathEnd ? VerticalFlightPhase.Descent : undefined,
            currentVerticalLeg?.isBod ? lateralLegIndex + 1 : lateralLegIndex
          );
        } else {
          this.cancelAltCap();
        }
      } else {
        this.captureType.set(VNavAltCaptureType.None);
        this.cancelAltCap();
      }
    }
  }

  /**
   * Gets the next altitude constraint to be sequenced that defines an altitude to be met for required vertical speed
   * calculations.
   * @param verticalPlan The vertical flight plan.
   * @param pathConstraintIndex The current vertical flight phase.
   * @param globalLegIndex The index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the the
   * airplane's position, in meters.
   * @returns The next altitude constraint to be sequenced that defines an altitude to be met for required vertical
   * speed calculations, or `undefined` if there is no such constraint.
   */
  private getDescentRequiredVs(verticalPlan: VerticalFlightPlan, pathConstraintIndex: number, globalLegIndex: number, distanceAlongLeg: number): number | null {
    let constraintIndex = -1;

    // In descent phase, VSR is defined by the next descent constraint that has a maximum altitude or that ends in a
    // level-off or FPA change (or the last descent constraint, which is treated as a level-off).
    for (let i = pathConstraintIndex; i >= 0; i--) {
      const constraint = verticalPlan.constraints[i];
      const nextConstraint = verticalPlan.constraints[i - 1];
      if ((constraint.type === 'descent' || constraint.type === 'direct' || constraint.type === 'manual')) {
        if (
          constraint.maxAltitude < Number.POSITIVE_INFINITY
          || (constraint.targetAltitude > 0 && (
            constraint.isTarget
            || (nextConstraint === undefined || (nextConstraint.type !== 'descent' && nextConstraint.type !== 'manual'))
            || nextConstraint.fpa !== constraint.fpa
          ))
        ) {
          constraintIndex = i;
          break;
        }
      } else {
        return null;
      }
    }

    if (constraintIndex < 0) {
      return null;
    }

    const constraint = verticalPlan.constraints[constraintIndex];
    const altitude = constraint.maxAltitude < Number.POSITIVE_INFINITY ? constraint.maxAltitude : constraint.targetAltitude;
    const distance = GarminVNavUtils.getDistanceToConstraint(verticalPlan, constraintIndex, globalLegIndex, distanceAlongLeg);

    const requiredVs = this.getRequiredVs(UnitType.METER.convertTo(distance, UnitType.NMILE), UnitType.METER.convertTo(altitude, UnitType.FOOT));
    if (requiredVs <= -100) {
      return requiredVs;
    } else {
      return null;
    }
  }

  /**
   * Checks whether the VNav Path can arm.
   * @returns Whether Path can arm.
   */
  private canPathArm(): boolean {
    return this.apVerticalActiveMode !== APVerticalModes.CAP
      && this.apVerticalActiveMode !== APVerticalModes.TO
      && this.apVerticalActiveMode !== APVerticalModes.GA
      && !this.isAwaitingPathRearm
      && this.isAltSelectInitialized.get()
      && this.apSelectedAltitude + 75 < this.currentAltitude;
  }

  /**
   * Checks whether V PATH can be activated from an armed state.
   * @param pathFpa The flight path angle of the active descent path, in degrees.
   * @param verticalDeviation The vertical deviation from the active descent path, in feet.
   * @param deviationFromTarget The deviation from the target altitude of the descent path, in feet.
   * @returns Whether V PATH can be activated from an armed state.
   */
  private canPathActivate(pathFpa: number, verticalDeviation: number, deviationFromTarget: number): boolean {
    return !this.isPathActivationInhibited
      && this.pathMode.get() === VNavPathMode.PathArmed
      && !this.isAltCaptured
      && pathFpa !== 0
      && !this.noVNavTae.get()
      && !this.noVNavXtk.get()
      && verticalDeviation <= VNavUtils.getPathErrorDistance(this.currentGroundSpeed)
      && verticalDeviation >= -15
      && deviationFromTarget > 75;
  }

  /**
   * Arms PATH if it is not already armed and can be armed, and disarms PATH if it is already armed and current
   * conditions do not allow it to be armed.
   */
  private updatePathArmState(): void {
    const currentPathMode = this.pathMode.get();

    // Checks if PATH is waiting to be re-armed and the conditions for re-arm have been met, and if so clears the
    // awaiting re-arm state so that PATH can be armed again.
    if (this.isAwaitingPathRearm && this.lnavLegIndex.get() >= this.pathRearmIndex && this.apVerticalArmedMode !== APVerticalModes.ALT) {
      this.isAwaitingPathRearm = false;
      this.pathRearmIndex = -1;
    }

    const canPathArm = this.canPathArm();
    if (currentPathMode === VNavPathMode.None) {
      if (canPathArm) {
        this.armPath();
      } else {
        // TODO: Check if Garmin even has a check alt sel message.
        // Enable check alt sel message if preselector is not at least 75 feet below current altitude, we have not
        // yet reached TOD, and we are within 45 seconds of TOD.
        this.checkAltSel.set(
          this.apSelectedAltitude + 75 >= this.currentAltitude
          && this.todBodDetails.distanceFromTod > 0
          && UnitType.METER.convertTo(this.todBodDetails.distanceFromTod, UnitType.NMILE) / (this.currentGroundSpeed / 60) < 0.75
        );
      }
    } else if (currentPathMode === VNavPathMode.PathArmed && !canPathArm) {
      this.disarmPath();
    }
  }

  /**
   * Updates this manager's track error states - whether LNAV track angle error or cross-track error have exceeded
   * the allowed limits for VNAV to provide vertical tracking.
   */
  private updateTrackErrorState(): void {
    // NO_VNAV_TAE: Track angle error exceeds an acceptable threshold

    this.noVNavTae.set(this.isTaeOutsideLimits());

    // NO_VNAV_XTK: Cross track deviation exceeds an acceptable threshold

    this.noVNavXtk.set(this.isXtkOutsideLimits());
  }

  /**
   * Checks whether PATH mode should be deactivated.
   * @param desiredAltitude The current desired altitude, in feet, at the airplane's current position along the
   * vertical path.
   * @param verticalDeviation The current vertical deviation, in feet, of the vertical path from the airplane. Positive
   * values indicate the path lies above the airplane.
   * @returns Whether PATH mode should be deactivated.
   */
  private shouldDeactivatePath(desiredAltitude: number, verticalDeviation: number): boolean {
    // Check if track angle error or cross-track error are out of limits.
    if (this.noVNavTae.get() || this.noVNavXtk.get()) {
      return true;
    }

    // Check if the vertical path has shifted by more than 200 feet vertically since the last update and the current
    // vertical deviation is greater than 200 feet.
    if (
      this.lastCapturedPathDesiredAltitude !== undefined
      && Math.abs(desiredAltitude - this.lastCapturedPathDesiredAltitude) > 200
      && Math.abs(verticalDeviation) > 200
    ) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether the XTK is out of limits for vnav.
   * @returns if the XTK is out of limits.
   */
  private isXtkOutsideLimits(): boolean {
    return Math.abs(this.lnavXtk.get()) > this.lnavDataCdiScale.get();
  }

  /**
   * Chekcs if the TAE is out of limits for vnav.
   * @returns if TAE is out of limits.
   */
  private isTaeOutsideLimits(): boolean {
    const tae = Math.abs(NavMath.diffAngle(this.lnavDtk.get(), this.trueTrack));
    const taeErrorLimit = 75;

    return tae > taeErrorLimit;
  }

  /**
   * Method to reset all error messages.
   */
  private clearAllMessages(): void {
    this.pathBelowAircraft.set(false);
    this.checkAltSel.set(false);

    this.noVNavTae.set(false);
    this.noVNavXtk.set(false);
    this.noPathThisLeg.set(false);
    this.noPathConditionDisco.set(false);
    this.noPathVectors.set(false);
    this.checkFplnAlt.set(false);
  }

  /**
   * Method to monitor message state.
   */
  private monitorMessages(): void {
    // init messages
    this.clearAllMessages();

    // monitor messages
    // this.withinOneMinuteTod.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.TOD, undefined, () => this.withinFiveSecondsTod.get());
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.TOD);
    //   }
    // });

    // this.pathBelowAircraft.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.PATH_BELOW_AC);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.PATH_BELOW_AC);
    //   }
    // });

    // this.noPathTae.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_TAE);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_TAE);
    //   }
    // });

    // this.noPathXtk.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_XTK);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_XTK);
    //   }
    // });

    // this.noPathThisLeg.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_THIS_LEG);
    //   }
    // });

    // this.noPathPilotCmd.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD);
    //   }
    // });

    // this.noPathConditionDisco.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   } else if (!this.noPathConditionPlanChanged.get()) {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   }
    // });

    // this.noPathConditionPlanChanged.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   } else if (!this.noPathConditionDisco.get()) {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_CONDITION);
    //   }
    // });

    // this.noPathVectors.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.NO_VPATH_VECTORS);
    //   }
    // });

    // this.checkAltSel.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.CHK_ALT_SEL);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.CHK_ALT_SEL);
    //   }
    // });

    // this.checkFplnAlt.sub(v => {
    //   if (v) {
    //     this.messageService.post(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
    //   } else {
    //     this.messageService.clear(FMS_MESSAGE_ID.CHECK_FPLN_ALT);
    //   }
    // });

  }

  /**
   * Method to monitor VNavVars.
   */
  private monitorVars(): void {
    // init vnav vars
    this.initVars();

    this.pathMode.sub(mode => {
      SimVar.SetSimVarValue(this.simVarMap[VNavVars.PathMode], SimVarValueType.Number, mode);
      if (mode === VNavPathMode.PathArmed || mode === VNavPathMode.PathActive) {
        this.checkAltSel.set(false);
      }
    });
    this.vnavState.sub(state => SimVar.SetSimVarValue(this.simVarMap[VNavVars.VNAVState], SimVarValueType.Number, state));
    this.pathAvailable.sub(v => SimVar.SetSimVarValue(this.simVarMap[VNavVars.PathAvailable], SimVarValueType.Bool, v));
    this.currentConstraintLegIndex.sub(index => SimVar.SetSimVarValue(this.simVarMap[VNavVars.CurrentConstraintLegIndex], SimVarValueType.Number, index));
    this.targetAltitude.sub(alt => SimVar.SetSimVarValue(this.simVarMap[VNavVars.TargetAltitude], SimVarValueType.Feet, alt ?? -1));
    this.fpa.sub(fpa => SimVar.SetSimVarValue(this.simVarMap[VNavVars.FPA], SimVarValueType.Degree, fpa ?? 0));
    this.verticalDeviation.sub(dev => SimVar.SetSimVarValue(this.simVarMap[VNavVars.VerticalDeviation], SimVarValueType.Feet, dev ?? Number.MAX_SAFE_INTEGER));
    this.requiredVS.sub(vs => SimVar.SetSimVarValue(this.simVarMap[VNavVars.RequiredVS], SimVarValueType.FPM, vs ?? 0));
    this.captureType.sub(type => SimVar.SetSimVarValue(this.simVarMap[VNavVars.CaptureType], SimVarValueType.Number, type));
    this.currentAltitudeConstraintDetails.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_altitude_constraint_details'], v, true, true);
    }, true);
    this.cruiseAltitude.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_cruise_altitude'], v, true, true);
    }, true);
    this.vnavFlightPhase.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_flight_phase'], v, true, true);
    }, true);
    this.vnavTrackingPhase.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_tracking_phase'], v, true, true);
    }, true);
    this.vnavActiveConstraintLegIndex.sub(v => {
      this.publisher.pub(this.vnavTopicMap['vnav_active_constraint_global_leg_index'], v, true, true);
    }, true);
  }

  /**
   * Method to reset VNAV Vars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.VNAVState], SimVarValueType.Number, VNavState.Enabled_Inactive);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.PathMode], SimVarValueType.Number, VNavPathMode.None);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.PathAvailable], SimVarValueType.Bool, false);

    SimVar.SetSimVarValue(this.simVarMap[VNavVars.CurrentConstraintLegIndex], SimVarValueType.Number, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.CurrentConstraintAltitude], SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.NextConstraintAltitude], SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.TargetAltitude], SimVarValueType.Feet, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.FPA], SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.VerticalDeviation], SimVarValueType.Feet, Number.MAX_SAFE_INTEGER);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.RequiredVS], SimVarValueType.FPM, 0);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.CaptureType], SimVarValueType.Number, VNavAltCaptureType.None);

    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPServiceLevel], SimVarValueType.Number, GlidepathServiceLevel.None);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPVerticalDeviation], SimVarValueType.Feet, -1001);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPDistance], SimVarValueType.Meters, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPFpa], SimVarValueType.Degree, 0);
  }

  /**
   * Resets the VNAV constraint simvars.
   */
  private resetVNavConstraintVars(): void {
    this.currentConstraintLegIndex.set(-1);
    this.vnavActiveConstraintLegIndex.set(-1);
    this.fpa.set(null);
  }

  /**
   * Resets the VNAV flight and tracking phases.
   */
  private resetVNavPhase(): void {
    this.vnavFlightPhase.set(GarminVNavFlightPhase.None);
    this.vnavTrackingPhase.set(GarminVNavTrackingPhase.None);
  }

  /**
   * Resets the VNAV tracking simvars.
   */
  private resetVNavTrackingVars(): void {
    this.pathAvailable.set(false);
    this.currentAltitudeConstraintDetails.set({ type: AltitudeRestrictionType.Unused, altitude: 0 });
    this.targetAltitude.set(null);
    this.verticalDeviation.set(null);
    this.requiredVS.set(null);
    this.captureType.set(VNavAltCaptureType.None);

    this.lastCapturedPathDesiredAltitude = undefined;
  }

  /**
   * Resets the TOD/BOD simvars.
   */
  private resetTodBodVars(): void {
    this.todBodDetailsSubject.set('bodLegIndex', -1);
    this.todBodDetailsSubject.set('todLegIndex', -1);
    this.todBodDetailsSubject.set('todLegDistance', 0);
    this.todBodDetailsSubject.set('distanceFromBod', 0);
    this.todBodDetailsSubject.set('distanceFromTod', 0);
  }

  /**
   * Resets the TOC/BOC simvars.
   */
  private resetTocBocVars(): void {
    this.tocBocDetailsSubject.set('bocLegIndex', -1);
    this.tocBocDetailsSubject.set('tocLegIndex', -1);
    this.tocBocDetailsSubject.set('tocLegDistance', 0);
    this.tocBocDetailsSubject.set('distanceFromBoc', 0);
    this.tocBocDetailsSubject.set('distanceFromToc', 0);
  }

  /**
   * Resets vertical track alert state.
   */
  private resetTrackAlerts(): void {
    for (let i = 0; i < this.allTrackAlertTypes.length; i++) {
      this.isTrackAlertArmed[this.allTrackAlertTypes[i]] = true;
    }
  }

  /**
   * Manages the TOD/BOD and BOC/TOC details simvars.
   * @param activeLateralLegIndex The index of the active lateral flight plan leg.
   * @param todBodDetails The computed TOD/BOD details.
   * @param bocTocDetails The computed BOC/TOC details.
   */
  private manageTodBodTocBocDetails(activeLateralLegIndex: number, todBodDetails: GarminTodBodDetails, bocTocDetails: TocBocDetails): void {
    // TODO: Support missed approach

    if (activeLateralLegIndex > this.lastClimbConstraintLegIndex) {
      this.todBodDetailsSubject.set('bodLegIndex', todBodDetails.bodLegIndex);
      this.todBodDetailsSubject.set('todLegIndex', todBodDetails.todLegIndex);
      this.todBodDetailsSubject.set('todLegDistance', todBodDetails.todLegDistance);
      this.todBodDetailsSubject.set('distanceFromBod', todBodDetails.distanceFromBod);
      this.todBodDetailsSubject.set('distanceFromTod', todBodDetails.distanceFromTod);

      this.resetTocBocVars();
    } else {
      this.resetTodBodVars();

      this.tocBocDetailsSubject.set('bocLegIndex', bocTocDetails.bocLegIndex);
      this.tocBocDetailsSubject.set('tocLegIndex', bocTocDetails.tocLegIndex);
      this.tocBocDetailsSubject.set('tocLegDistance', bocTocDetails.tocLegDistance);
      this.tocBocDetailsSubject.set('distanceFromBoc', bocTocDetails.distanceFromBoc);
      this.tocBocDetailsSubject.set('distanceFromToc', bocTocDetails.distanceFromToc);
    }
  }

  /**
   * Sets the current constraint details.
   * @param verticalPlan The vertical plan.
   * @param constraintIndex The index of the current constraint.
   * @param activeLegIndex The global index of the active flight plan leg.
   */
  private setCurrentConstraintDetails(verticalPlan: VerticalFlightPlan, constraintIndex: number, activeLegIndex: number): void {
    this.currentAltitudeConstraintDetailsWorking.type = AltitudeRestrictionType.Unused;
    this.currentAltitudeConstraintDetailsWorking.altitude = 0;

    const constraint = verticalPlan.constraints[constraintIndex];

    if (constraint !== undefined) {
      if (
        constraint.type !== 'climb' && constraint.type !== 'missed'
        && constraint.nextVnavEligibleLegIndex !== undefined
        && activeLegIndex < constraint.nextVnavEligibleLegIndex
      ) {
        const priorConstraint = verticalPlan.constraints[constraintIndex + 1];
        if (priorConstraint) {
          VNavUtils.getConstraintDetails(priorConstraint, this.currentAltitudeConstraintDetailsWorking);
        }
      } else {
        VNavUtils.getConstraintDetails(constraint, this.currentAltitudeConstraintDetailsWorking);
      }
    }

    if (!VNavUtils.altitudeConstraintDetailsEquals(this.currentAltitudeConstraintDetails.get(), this.currentAltitudeConstraintDetailsWorking)) {
      this.currentAltitudeConstraintDetails.set(Object.assign({}, this.currentAltitudeConstraintDetailsWorking));
    }
  }

  /**
   * Gets the required vertical speed to meet an altitude constraint.
   * @param distance The distance to the constraint, in nautical miles.
   * @param targetAltitude The target altitude for the constraint, in feet.
   * @param currentAltitude The current altitude, in feet. Defaults to the airplane's current indicated altitude.
   * @returns The required vertical speed, in feet per minute, to meet the altitude constraint.
   */
  private getRequiredVs(distance: number, targetAltitude: number, currentAltitude = this.currentAltitude): number {
    if (targetAltitude > 0) {
      return VNavUtils.getRequiredVs(distance, targetAltitude, currentAltitude, this.currentGroundSpeed);
    }
    return 0;
  }

  /**
   * Publishes TOD/BOD details to simvars.
   * @param details The TOD/BOD details object.
   * @param key The key to publish.
   * @param value The value to publish.
   */
  private publishTodBodDetails(details: GarminTodBodDetails, key: keyof GarminTodBodDetails, value: number): void {
    switch (key) {
      case 'bodLegIndex':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.BODLegIndex], SimVarValueType.Number, value);
        break;
      case 'todLegIndex':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TODLegIndex], SimVarValueType.Number, value);
        break;
      case 'todLegDistance':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TODDistanceInLeg], SimVarValueType.Meters, value);
        break;
      case 'distanceFromBod':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.BODDistance], SimVarValueType.Meters, value);
        break;
      case 'distanceFromTod':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TODDistance], SimVarValueType.Meters, value);
        break;
    }
  }

  /**
   * Publishes BOC/TOC details to simvars.
   * @param details The BOC/TOC details object.
   * @param key The key to publish.
   * @param value The value to publish.
   */
  private publishBocTocDetails(details: TocBocDetails, key: keyof TocBocDetails, value: number): void {
    switch (key) {
      case 'bocLegIndex':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.BOCLegIndex], SimVarValueType.Number, value);
        break;
      case 'tocLegIndex':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TOCLegIndex], SimVarValueType.Number, value);
        break;
      case 'tocLegDistance':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TOCDistanceInLeg], SimVarValueType.Meters, value);
        break;
      case 'distanceFromBoc':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.BOCDistance], SimVarValueType.Meters, value);
        break;
      case 'distanceFromToc':
        SimVar.SetSimVarValue(this.simVarMap[VNavVars.TOCDistance], SimVarValueType.Meters, value);
        break;
    }
  }
}