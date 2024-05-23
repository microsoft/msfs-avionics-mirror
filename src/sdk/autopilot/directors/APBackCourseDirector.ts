import { CdiEvents } from '../../cdi/CdiEvents';
import { CdiUtils } from '../../cdi/CdiUtils';
import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { MagVar } from '../../geo/MagVar';
import { NavMath } from '../../geo/NavMath';
import { NavRadioEvents } from '../../instruments/APRadioNavInstrument';
import { GNSSEvents, GNSSPublisher } from '../../instruments/GNSS';
import { CdiDeviation, Localizer, NavSourceId, NavSourceType } from '../../instruments/NavProcessor';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Phases used by {@link APBackCourseDirector} when active and tracking a localizer signal.
 */
export enum APBackCourseDirectorPhase {
  Intercept = 'Intercept',
  Tracking = 'Tracking'
}

/**
 * Options which which to configure {@link APBackCourseDirector}'s default phase selection logic.
 *
 * The director switches from intercept phase to tracking phase only when **all** tracking phase conditions are met.
 * The director switches from tracking phase to intercept phase when **any** of the intercept phase conditions is met.
 *
 * When the director is activated from an armed state, it will default to intercept phase unless all tracking phase
 * conditions are met, in which case it will immediately enter tracking phase. The normal delay for entering tracking
 * phase is ignored in this situation.
 */
export type APBackCourseDirectorPhaseOptions = {
  /**
   * The minimum absolute value of the lateral deflection of the desired track relative to the plane, normalized from
   * `0` to `1`, required to enter intercept phase. Defaults to `0.25`.
   */
  interceptDeflection?: number;

  /**
   * The minimum absolute value of the cross-track error of the plane from the desired track, in nautical miles,
   * required to enter intercept phase. Defaults to `Infinity`.
   */
  interceptXtk?: number;

  /**
   * The minimum absolute value of the error between the course of the desired track and the airplane's actual ground
   * track, in degrees, required to enter intercept phase. Defaults to `5`.
   */
  interceptCourseError?: number;

  /**
   * The amount of time that the conditions for switching to intercept phase must be met, in milliseconds, before the
   * director switches from tracking phase to intercept phase. Defaults to `5000`.
   */
  interceptSwitchDelay?: number;

  /**
   * The maximum allowed absolute value of the lateral deflection of the desired track relative to the plane,
   * normalized from `0` to `1`, required to enter tracking phase. Defaults to `0.125`.
   */
  trackingDeflection?: number;

  /**
   * The maximum allowed absolute value of the cross-track error of the plane from the desired track, in nautical
   * miles, required to enter intercept phase. Defaults to `Infinity`.
   */
  trackingXtk?: number;

  /**
   * The maximum allowed absolute value of the error between the course of the desired track and the airplane's actual
   * ground track, in degrees, required to enter intercept phase. Defaults to `2`.
   */
  trackingCourseError?: number;

  /**
   * The amount of time that the conditions for switching to tracking phase must be met, in milliseconds, before the
   * director switches from intercept phase to tracking phase. Defaults to `5000`.
   */
  trackingSwitchDelay?: number;
};

/**
 * Calculates an intercept angle, in degrees, to capture the desired track from a localizer signal for
 * {@link APBackCourseDirector}.
 * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
 * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
 * Positive values indicate that the desired track is to the right of the plane.
 * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
 * that the plane is to the right of the track.
 * @param tas The true airspeed of the plane, in knots.
 * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
 */
export type APBackCourseDirectorInterceptFunc = (distanceToSource: number, deflection: number, xtk: number, tas: number) => number;

/**
 * Selects a phase for {@link APBackCourseDirector} to use while it is active and tracking a localizer signal.
 * @param currentPhase The current phase, or `undefined` if no phase has been selected since the last time the director
 * was activated.
 * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
 * Positive values indicate that the desired track is to the right of the plane.
 * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
 * that the plane is to the right of the track.
 * @param course The true course of the desired track, in degrees.
 * @param track The actual true ground track of the airplane, in degrees.
 * @returns The phase to use while tracking the navigation signal.
 */
export type APBackCourseDirectorPhaseSelectorFunc = (
  currentPhase: APBackCourseDirectorPhase | undefined,
  deflection: number,
  xtk: number,
  course: number,
  track: number
) => APBackCourseDirectorPhase;

/**
 * Options for {@link APBackCourseDirector}.
 */
export type APBackCourseDirectorOptions = {
  /**
   * The maximum bank angle, in degrees, supported by the director, or a function which returns it. If not defined,
   * the director will use the maximum bank angle defined by its parent autopilot (via `apValues`). Defaults to
   * `undefined`.
   */
  maxBankAngle?: number | (() => number) | undefined;

  /**
   * The maximum bank angle, in degrees, supported by the director during intercept phase, or a function which returns
   * it. If not defined, the director will use the maximum bank angle defined by `maxBankAngle`. Defaults to
   * `undefined`.
   */
  maxBankAngleIntercept?: number | (() => number) | undefined;

  /**
   * The maximum bank angle, in degrees, supported by the director during tracking phase, or a function which returns
   * it. If not defined, the director will use the maximum bank angle defined by `maxBankAngle`. Defaults to
   * `undefined`.
   */
  maxBankAngleTracking?: number | (() => number) | undefined;

  /**
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not defined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * The bank rate to enforce when the director commands changes in bank angle during intercept phase, in degrees per
   * second, or a function which returns it. If not defined, the bank rate defined by `bankRate` will be used.
   * Defaults to `undefined`.
   */
  bankRateIntercept?: number | (() => number) | undefined;

  /**
   * The bank rate to enforce when the director commands changes in bank angle during tracking phase, in degrees per
   * second, or a function which returns it. If not defined, the bank rate defined by `bankRate` will be used.
   * Defaults to `undefined`.
   */
  bankRateTracking?: number | (() => number) | undefined;

  /**
   * Options with which to configure the default phase selector logic. Ignored if the `phaseSelector` option is
   * specified.
   */
  phaseOptions?: Readonly<APBackCourseDirectorPhaseOptions>;

  /**
   * A function which selects the phase for the director to use when it is active and tracking a navigation signal.
   * If not defined, the director will use a default selector which can be configured using the `phaseOptions` option.
   */
  phaseSelector?: APBackCourseDirectorPhaseSelectorFunc;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: APBackCourseDirectorInterceptFunc;

  /**
   * A function used to translate DTK and XTK into a track intercept angle during intercept phase. If not defined, the
   * function defined by `lateralInterceptCurve` will be used instead. Defaults to `undefined`.
   */
  lateralInterceptCurveIntercept?: APBackCourseDirectorInterceptFunc | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle during tracking phase. If not defined, the
   * function defined by `lateralInterceptCurve` will be used instead. Defaults to `undefined`.
   */
  lateralInterceptCurveTracking?: APBackCourseDirectorInterceptFunc;

  /**
   * A function which computes a desired bank angle to command for a given track error during intercept phase. The
   * track error is the difference between the director's computed desired track and the airplane's actual ground track
   * in the range `[-180, 180)` degrees. A positive error indicates that the shortest turn direction from the actual
   * ground track toward the desired track is to the right. A positive bank angle indicates leftward bank. Defaults to
   * a linear function which scales the track error by `2.5` to derive the desired bank angle.
   */
  desiredBankIntercept?: ((trackError: number) => number) | undefined;

  /**
   * A function which computes a desired bank angle to command for a given track error during tracking phase. The
   * track error is the difference between the director's computed desired track and the airplane's actual ground track
   * in the range `[-180, 180)` degrees. A positive error indicates that the shortest turn direction from the actual
   * ground track toward the desired track is to the right. A positive bank angle indicates leftward bank. Defaults to
   * a linear function which scales the track error by `1.25` to derive the desired bank angle.
   */
  desiredBankTracking?: ((trackError: number) => number) | undefined;
};

/**
 * Parameters used by {@link APBackCourseDirector} to track a navigation signal during a specific phase.
 */
type PhaseParameters = {
  /** A function which returns the maximum bank angle, in degrees. */
  maxBankAngleFunc: () => number,

  /** A function which drives the commanded bank angle, in degrees. */
  driveBankFunc: (bank: number) => void,

  /** A function which returns a track intercept angle. */
  lateralInterceptCurveFunc: APBackCourseDirectorInterceptFunc;

  /** A function which returns the desired bank angle, in degrees, given a track error in degrees. */
  desiredBankFunc: (trackError: number) => number;
};

/**
 * A BackCourse autopilot director.
 */
export class APBackCourseDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public onDeactivate?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private readonly sub = this.bus.getSubscriber<GNSSEvents & NavRadioEvents & CdiEvents>();

  private readonly cdi = ConsumerValue.create<CdiDeviation>(null, { source: { index: 0, type: NavSourceType.Nav }, deviation: null });
  private readonly loc = ConsumerValue.create<Localizer>(null, { isValid: false, course: 0, source: { index: 0, type: NavSourceType.Nav } });
  private navSource: Readonly<NavSourceId> = { index: 0, type: NavSourceType.Nav };

  private deviationSimVar = 'NAV CDI:1';
  private radialErrorSimVar = 'NAV RADIAL ERROR:1';

  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly navLocation = new GeoPoint(NaN, NaN);
  private readonly navLocationSub = this.sub.on('nav_radio_active_nav_location').handle(lla => this.navLocation.set(lla.lat, lla.long));

  private phase: APBackCourseDirectorPhase | undefined = undefined;

  private readonly phaseOptions: Required<APBackCourseDirectorPhaseOptions>;
  private readonly phaseSelectorFunc: APBackCourseDirectorPhaseSelectorFunc;

  private readonly phaseParameters: Record<APBackCourseDirectorPhase, PhaseParameters>;

  /**
   * Creates a new instance of APBackCourseDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Partial<Readonly<APBackCourseDirectorOptions>>
  ) {
    this.state = DirectorState.Inactive;

    const interceptParams = {} as PhaseParameters;
    const trackingParams = {} as PhaseParameters;

    const maxBankAngleFunc = this.resolveMaxBankAngleOption(options?.maxBankAngle)
      ?? this.apValues.maxBankAngle.get.bind(this.apValues.maxBankAngle);
    interceptParams.maxBankAngleFunc = this.resolveMaxBankAngleOption(options?.maxBankAngleIntercept) ?? maxBankAngleFunc;
    trackingParams.maxBankAngleFunc = this.resolveMaxBankAngleOption(options?.maxBankAngleTracking) ?? maxBankAngleFunc;

    const driveBankFunc = this.resolveBankRateOption(options?.bankRate)
      ?? ((bank: number): void => {
        if (isFinite(bank) && this.driveBank) {
          this.driveBank(bank);
        }
      });
    interceptParams.driveBankFunc = this.resolveBankRateOption(options?.bankRateIntercept) ?? driveBankFunc;
    trackingParams.driveBankFunc = this.resolveBankRateOption(options?.bankRateTracking) ?? driveBankFunc;

    this.phaseOptions = { ...options?.phaseOptions } as Required<APBackCourseDirectorPhaseOptions>;
    this.phaseOptions.interceptDeflection ??= 0.25;
    this.phaseOptions.interceptXtk ??= Infinity;
    this.phaseOptions.interceptCourseError ??= 5;
    this.phaseOptions.interceptSwitchDelay ??= 5000;
    this.phaseOptions.trackingDeflection ??= 0.125;
    this.phaseOptions.trackingXtk ??= Infinity;
    this.phaseOptions.trackingCourseError ??= 2;
    this.phaseOptions.trackingSwitchDelay ??= 5000;

    this.phaseSelectorFunc = options?.phaseSelector ?? this.defaultSelectPhase.bind(this);

    const lateralInterceptCurveFunc = options?.lateralInterceptCurve ?? APBackCourseDirector.defaultLateralInterceptCurve;
    interceptParams.lateralInterceptCurveFunc = options?.lateralInterceptCurveIntercept ?? lateralInterceptCurveFunc;
    trackingParams.lateralInterceptCurveFunc = options?.lateralInterceptCurveTracking ?? lateralInterceptCurveFunc;

    interceptParams.desiredBankFunc = options?.desiredBankIntercept
      ?? ((trackError: number): number => -trackError * 2);
    trackingParams.desiredBankFunc = options?.desiredBankTracking
      ?? ((trackError: number): number => -trackError * 1.25);

    this.phaseParameters = {
      [APBackCourseDirectorPhase.Intercept]: interceptParams,
      [APBackCourseDirectorPhase.Tracking]: trackingParams
    };

    this.sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(apValues.cdiId)}`).handle(source => {
      this.navSource = source;

      if (source.type === NavSourceType.Nav) {
        this.deviationSimVar = `NAV CDI:${source.index}`;
        this.radialErrorSimVar = `NAV RADIAL ERROR:${source.index}`;
      }
    });

    this.cdi.setConsumer(this.sub.on('nav_radio_active_cdi_deviation'));
    this.loc.setConsumer(this.sub.on('nav_radio_active_localizer'));
    this.magVar.setConsumer(this.sub.on('nav_radio_active_magvar'));

    this.pauseSubs();
  }

  /**
   * Resolves a maximum bank angle option to a function which returns a maximum bank angle.
   * @param opt The option to resolve.
   * @returns A function which returns a maximum bank angle as defined by the specified option, or `undefined` if the
   * option is not defined.
   */
  private resolveMaxBankAngleOption(opt: number | (() => number) | undefined): (() => number) | undefined {
    switch (typeof opt) {
      case 'number':
        return () => opt;
      case 'function':
        return opt;
      default:
        return undefined;
    }
  }

  /**
   * Resolves a bank rate option to a function which drives the commanded bank angle.
   * @param opt The option to resolve.
   * @returns A function which drives the commanded bank angle in accordance with the specified bank rate option, or
   * `undefined` if the option is not defined.
   */
  private resolveBankRateOption(opt: number | (() => number) | undefined): ((bank: number) => void) | undefined {
    switch (typeof opt) {
      case 'number':
        return bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, opt * this.apValues.simRate.get());
          }
        };
      case 'function':
        return bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, opt() * this.apValues.simRate.get());
          }
        };
      default:
        return undefined;
    }
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.navLocationSub.resume(true);
    this.cdi.resume();
    this.loc.resume();
    this.magVar.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.navLocationSub.pause();
    this.cdi.pause();
    this.loc.pause();
    this.magVar.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    this.state = DirectorState.Active;
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    this.resumeSubs();
    if (this.state === DirectorState.Inactive && this.canArm()) {
      this.state = DirectorState.Armed;
      if (this.onArm !== undefined) {
        this.onArm();
      }
      SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
      SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', true);
      SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.phase = undefined;
    SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      if (!this.canArm()) {
        this.deactivate();
      } else if (this.canActivate()) {
        this.activate();
      }
    }
    if (this.state === DirectorState.Active) {
      if (!this.canRemainActive()) {
        this.deactivate();
      } else {
        this.trackSignal();
      }
    }
  }

  /**
   * Checks whether this director can be armed.
   * @returns Whether this director can be armed.
   */
  private canArm(): boolean {
    if (this.navSource.type !== NavSourceType.Nav) {
      return false;
    }

    const cdi = this.cdi.get();
    const loc = this.loc.get();

    return this.navSource.index == cdi.source.index && loc.isValid && this.navSource.index == loc.source.index;
  }

  /**
   * Checks whether this director can be activated from an armed state.
   * @returns Whether this director can be activated from an armed state.
   */
  private canActivate(): boolean {
    const cdi = this.cdi.get();
    const loc = this.loc.get();

    const typeIsCorrect = this.navSource.type === NavSourceType.Nav;
    const index = this.navSource.index;
    const indexIsCorrect = index == cdi.source.index && (loc.isValid && index == loc.source.index);

    if (typeIsCorrect && indexIsCorrect && cdi.deviation !== null && Math.abs(cdi.deviation) < 127) {
      const dtk = loc.isValid ? NavMath.normalizeHeading((loc.course * Avionics.Utils.RAD2DEG) + 180) : null;
      if (dtk === null || dtk === undefined) {
        return false;
      }
      const headingDiff = NavMath.diffAngle(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree), dtk);
      const isLoc = loc.isValid ?? false;
      const sensitivity = isLoc ? 1 : .6;
      if (Math.abs(cdi.deviation * sensitivity) < 127 && Math.abs(headingDiff) < 110) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks whether this director can remain active.
   * @returns Whether this director can remain active.
   */
  private canRemainActive(): boolean {
    if (this.navSource.type !== NavSourceType.Nav) {
      return false;
    }

    const cdi = this.cdi.get();

    if (cdi.deviation === null) {
      return false;
    }

    const loc = this.loc.get();

    return this.navSource.index === cdi.source.index && loc.isValid && this.navSource.index == loc.source.index;
  }

  /**
   * Tracks the active localizer signal received by this director.
   */
  private trackSignal(): void {
    const cdi = this.cdi.get();
    const loc = this.loc.get();

    const isLoc = loc.isValid ?? false;
    const hasValidDeviation = cdi.deviation !== null && Math.abs(cdi.deviation) < 127;

    if (!isLoc || (isLoc && !hasValidDeviation)) {
      this.deactivate();
      return;
    }

    if (cdi.deviation !== null) {
      const courseMag = isLoc ? NavMath.normalizeHeading((loc.course * Avionics.Utils.RAD2DEG) + 180) : null;
      if (courseMag === null || courseMag === undefined) {
        this.deactivate();
        return;
      }

      const distanceToSource = this.getNavDistance();
      const deflection = -SimVar.GetSimVarValue(this.deviationSimVar, SimVarValueType.Number) / 127;
      const radialError = SimVar.GetSimVarValue(this.radialErrorSimVar, SimVarValueType.Radians);
      const xtk = distanceToSource * Math.sin(radialError);
      const courseTrue = MagVar.magneticToTrue(courseMag, this.magVar.get());
      const trueTrack = GNSSPublisher.getInstantaneousTrack();

      this.phase = this.phaseSelectorFunc(this.phase, deflection, xtk, courseTrue, trueTrack);

      const phaseParams = this.phaseParameters[this.phase];

      const absInterceptAngle = phaseParams.lateralInterceptCurveFunc(
        distanceToSource,
        deflection,
        xtk,
        SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots)
      );

      const interceptAngle = xtk > 0 ? -absInterceptAngle : absInterceptAngle;
      const courseToSteer = NavMath.normalizeHeading(courseTrue + interceptAngle);
      const trackError = (MathUtils.diffAngleDeg(trueTrack, courseToSteer) + 180) % 360 - 180;

      const maxBankAngle = phaseParams.maxBankAngleFunc();
      const desiredBank = MathUtils.clamp(phaseParams.desiredBankFunc(trackError), -maxBankAngle, maxBankAngle);

      if (isFinite(desiredBank)) {
        phaseParams.driveBankFunc(desiredBank);
      }
    } else {
      this.deactivate();
    }
  }

  /**
   * Gets the lateral distance from PPOS to the nav signal.
   * @returns The distance value in nautical miles.
   */
  private getNavDistance(): number {
    if (!isNaN(this.navLocation.lat)) {
      return UnitType.GA_RADIAN.convertTo(this.navLocation.distance(
        SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
        SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
      ), UnitType.NMILE);
    } else {
      return 5;
    }
  }

  private lastPhaseUpdateTime: number | undefined = undefined;
  private phaseTransitionTimer = 0;

  /**
   * Selects a phase to use while this director is active and tracking a navigation signal using default logic.
   *
   * Phase selection is based on whether lateral deflection, cross-track error, and course error exceed certain
   * thresholds. Initial phase selection after director activation defaults to intercept phase if any of the values
   * exceed their thresholds and to tracking phase otherwise. Phase switching from intercept to tracking occurs when
   * all values do not exceed their thresholds for a certain consecutive amount of time. Phase switching from tracking
   * to intercept occurs when at least one value exceeds its threshold for a certain consecutive amount of time.
   * @param currentPhase The current phase, or `undefined` if no phase has been selected since the last time the
   * director was activated.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Positive values indicate that the desired track is to the right of the plane.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * that the plane is to the right of the track.
   * @param course The true course of the desired track, in degrees.
   * @param track The actual true ground track of the airplane, in degrees.
   * @returns The phase to use while tracking the navigation signal.
   */
  private defaultSelectPhase(
    currentPhase: APBackCourseDirectorPhase | undefined,
    deflection: number,
    xtk: number,
    course: number,
    track: number
  ): APBackCourseDirectorPhase {
    const time = Date.now();
    const dt = this.lastPhaseUpdateTime === undefined ? 0 : MathUtils.clamp(time - this.lastPhaseUpdateTime, 0, 1000) * this.apValues.simRate.get();
    this.lastPhaseUpdateTime = time;

    if (currentPhase === APBackCourseDirectorPhase.Tracking) {
      if (
        Math.abs(deflection) >= this.phaseOptions.interceptDeflection
        || Math.abs(xtk) >= this.phaseOptions.interceptXtk
        || MathUtils.diffAngleDeg(track, course, false) >= this.phaseOptions.interceptCourseError
      ) {
        if (this.phaseTransitionTimer <= 0) {
          this.phaseTransitionTimer = this.phaseOptions.trackingSwitchDelay;
          return APBackCourseDirectorPhase.Intercept;
        } else {
          this.phaseTransitionTimer -= dt;
        }
      } else {
        this.phaseTransitionTimer = this.phaseOptions.interceptSwitchDelay;
      }

      return APBackCourseDirectorPhase.Tracking;
    } else {
      if (currentPhase === undefined) {
        this.phaseTransitionTimer = 0;
      }

      if (
        Math.abs(deflection) <= this.phaseOptions.trackingDeflection
        && Math.abs(xtk) <= this.phaseOptions.trackingXtk
        && MathUtils.diffAngleDeg(track, course, false) <= this.phaseOptions.trackingCourseError
      ) {
        if (this.phaseTransitionTimer <= 0) {
          this.phaseTransitionTimer = this.phaseOptions.interceptSwitchDelay;
          return APBackCourseDirectorPhase.Tracking;
        } else {
          this.phaseTransitionTimer -= dt;
        }
      } else {
        this.phaseTransitionTimer = this.phaseOptions.trackingSwitchDelay;
      }

      return APBackCourseDirectorPhase.Intercept;
    }

  }

  /**
   * Calculates an intercept angle, in degrees, to capture the desired track from a navigation signal using default
   * logic tuned for slow GA airplanes.
   * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Positive values indicate that the desired track is to the right of the plane.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * that the plane is to the right of the track.
   * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
   */
  private static defaultLateralInterceptCurve(distanceToSource: number, deflection: number, xtk: number): number {
    let absInterceptAngle = Math.min(Math.pow(Math.abs(xtk) * 20, 1.35) + (Math.abs(xtk) * 50), 45);
    if (absInterceptAngle <= 2.5) {
      absInterceptAngle = NavMath.clamp(Math.abs(xtk * 150), 0, 2.5);
    }
    return absInterceptAngle;
  }
}