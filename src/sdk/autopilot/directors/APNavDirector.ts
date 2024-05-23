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
import { CdiDeviation, Localizer, NavSourceId, NavSourceType, ObsSetting } from '../../instruments/NavProcessor';
import { NavRadioIndex } from '../../instruments/RadioCommon';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Subject } from '../../sub/Subject';
import { Subscription } from '../../sub/Subscription';
import { APLateralModes, APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Phases used by {@link APNavDirector} when active and tracking a navigation signal.
 */
export enum APNavDirectorPhase {
  Intercept = 'Intercept',
  Tracking = 'Tracking'
}

/**
 * Options which which to configure {@link APNavDirector}'s default phase selection logic.
 *
 * The director switches from intercept phase to tracking phase only when **all** tracking phase conditions are met.
 * The director switches from tracking phase to intercept phase when **any** of the intercept phase conditions is met.
 *
 * When the director is activated from an armed state, it will default to intercept phase unless all tracking phase
 * conditions are met, in which case it will immediately enter tracking phase. The normal delay for entering tracking
 * phase is ignored in this situation.
 */
export type APNavDirectorPhaseOptions = {
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
 * Calculates an intercept angle, in degrees, to capture the desired track from a navigation signal for
 * {@link APNavDirector}.
 * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
 * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
 * Positive values indicate that the desired track is to the right of the plane.
 * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
 * that the plane is to the right of the track.
 * @param tas The true airspeed of the plane, in knots.
 * @param isLoc Whether the source of the navigation signal is a localizer.
 * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
 */
export type APNavDirectorInterceptFunc = (distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc: boolean) => number;

/**
 * Selects a phase for {@link APNavDirector} to use while it is active and tracking a navigation signal.
 * @param currentPhase The current phase, or `undefined` if no phase has been selected since the last time the director
 * was activated.
 * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
 * Positive values indicate that the desired track is to the right of the plane.
 * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
 * that the plane is to the right of the track.
 * @param course The true course of the desired track, in degrees.
 * @param track The actual true ground track of the airplane, in degrees.
 * @param isLoc Whether the source of the tracked navigation signal is a localizer.
 * @param isInZoneOfConfusion Whether the source of the tracked navigation signal is a VOR and the airplane's position
 * is close enough to the VOR to render lateral deflection values unreliable.
 * @returns The phase to use while tracking the navigation signal.
 */
export type APNavDirectorPhaseSelectorFunc = (
  currentPhase: APNavDirectorPhase | undefined,
  deflection: number,
  xtk: number,
  course: number,
  track: number,
  isLoc: boolean,
  isInZoneOfConfusion: boolean,
) => APNavDirectorPhase;

/**
 * Options for {@link APNavDirector}.
 */
export type APNavDirectorOptions = {
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
  phaseOptions?: Readonly<APNavDirectorPhaseOptions>;

  /**
   * A function which selects the phase for the director to use when it is active and tracking a navigation signal.
   * If not defined, the director will use a default selector which can be configured using the `phaseOptions` option.
   */
  phaseSelector?: APNavDirectorPhaseSelectorFunc;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: APNavDirectorInterceptFunc;

  /**
   * A function used to translate DTK and XTK into a track intercept angle during intercept phase. If not defined, the
   * function defined by `lateralInterceptCurve` will be used instead. Defaults to `undefined`.
   */
  lateralInterceptCurveIntercept?: APNavDirectorInterceptFunc | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle during tracking phase. If not defined, the
   * function defined by `lateralInterceptCurve` will be used instead. Defaults to `undefined`.
   */
  lateralInterceptCurveTracking?: APNavDirectorInterceptFunc;

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

  /**
   * Whether to disable arming on the director. If `true`, the director will always skip the arming phase and instead
   * immediately activate itself when requested. Defaults to `false`.
   */
  disableArming?: boolean;

  /**
   * Force the director to always use a certain NAV/CDI source
   */
  forceNavSource?: NavRadioIndex;
};

/**
 * Parameters used by {@link APNavDirector} to track a navigation signal during a specific phase.
 */
type PhaseParameters = {
  /** A function which returns the maximum bank angle, in degrees. */
  maxBankAngleFunc: () => number,

  /** A function which drives the commanded bank angle, in degrees. */
  driveBankFunc: (bank: number) => void,

  /** A function which returns a track intercept angle. */
  lateralInterceptCurveFunc: APNavDirectorInterceptFunc;

  /** A function which returns the desired bank angle, in degrees, given a track error in degrees. */
  desiredBankFunc: (trackError: number) => number;
};

/**
 * A Nav/Loc autopilot director.
 */
export class APNavDirector implements PlaneDirector {
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

  private readonly obs = ConsumerValue.create<ObsSetting>(null, { heading: 0, source: { index: 0, type: NavSourceType.Nav } });
  private readonly cdi = ConsumerValue.create<CdiDeviation>(null, { source: { index: 0, type: NavSourceType.Nav }, deviation: null });
  private readonly loc = ConsumerValue.create<Localizer>(null, { isValid: false, course: 0, source: { index: 0, type: NavSourceType.Nav } });
  private navSource: Readonly<NavSourceId>;

  private deviationSimVar = 'NAV CDI:1';
  private radialErrorSimVar = 'NAV RADIAL ERROR:1';

  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly navLocation = new GeoPoint(NaN, NaN);
  private readonly navLocationSub: Subscription;

  private readonly isNavLock = Subject.create<boolean>(false);

  private phase: APNavDirectorPhase | undefined = undefined;

  private readonly phaseOptions: Required<APNavDirectorPhaseOptions>;
  private readonly phaseSelectorFunc: APNavDirectorPhaseSelectorFunc;

  private readonly phaseParameters: Record<APNavDirectorPhase, PhaseParameters>;

  private readonly disableArming: boolean;
  private readonly forceNavSource: NavRadioIndex | undefined;

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param mode The APLateralMode for this instance of the director.
   * @param options Options to configure the new director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    private readonly mode: APLateralModes,
    options?: Readonly<APNavDirectorOptions>
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

    this.phaseOptions = { ...options?.phaseOptions } as Required<APNavDirectorPhaseOptions>;
    this.phaseOptions.interceptDeflection ??= 0.25;
    this.phaseOptions.interceptXtk ??= Infinity;
    this.phaseOptions.interceptCourseError ??= 5;
    this.phaseOptions.interceptSwitchDelay ??= 5000;
    this.phaseOptions.trackingDeflection ??= 0.125;
    this.phaseOptions.trackingXtk ??= Infinity;
    this.phaseOptions.trackingCourseError ??= 2;
    this.phaseOptions.trackingSwitchDelay ??= 5000;

    this.phaseSelectorFunc = options?.phaseSelector ?? this.defaultSelectPhase.bind(this);

    const lateralInterceptCurveFunc = options?.lateralInterceptCurve ?? APNavDirector.defaultLateralInterceptCurve;
    interceptParams.lateralInterceptCurveFunc = options?.lateralInterceptCurveIntercept ?? lateralInterceptCurveFunc;
    trackingParams.lateralInterceptCurveFunc = options?.lateralInterceptCurveTracking ?? lateralInterceptCurveFunc;

    interceptParams.desiredBankFunc = options?.desiredBankIntercept
      ?? ((trackError: number): number => -trackError * 2);
    trackingParams.desiredBankFunc = options?.desiredBankTracking
      ?? ((trackError: number): number => -trackError * 1.25);

    this.phaseParameters = {
      [APNavDirectorPhase.Intercept]: interceptParams,
      [APNavDirectorPhase.Tracking]: trackingParams
    };

    this.disableArming = options?.disableArming ?? false;
    this.forceNavSource = options?.forceNavSource;

    this.isNavLock.sub((newState: boolean) => {
      if (SimVar.GetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool') !== newState) {
        SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', newState);
      }
    });

    if (this.forceNavSource !== undefined) {
      this.navSource = {
        index: this.forceNavSource,
        type: NavSourceType.Nav,
      };

      this.obs.setConsumer(this.sub.on(`nav_radio_obs_${this.forceNavSource}`));
      this.cdi.setConsumer(this.sub.on(`nav_radio_cdi_${this.forceNavSource}`));
      this.loc.setConsumer(this.sub.on(`nav_radio_localizer_${this.forceNavSource}`));
      this.magVar.setConsumer(this.sub.on(`nav_radio_magvar_${this.forceNavSource}`));
      this.navLocationSub = this.sub.on(`nav_radio_nav_location_${this.forceNavSource}`).handle(lla => this.navLocation.set(lla.lat, lla.long));

      this.deviationSimVar = `NAV CDI:${this.forceNavSource}`;
      this.radialErrorSimVar = `NAV RADIAL ERROR:${this.forceNavSource}`;
    } else {
      this.navSource = {
        index: 0,
        type: NavSourceType.Nav,
      };

      this.sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(apValues.cdiId)}`).handle(source => {
        this.navSource = source;

        if (source.type === NavSourceType.Nav) {
          this.deviationSimVar = `NAV CDI:${source.index}`;
          this.radialErrorSimVar = `NAV RADIAL ERROR:${source.index}`;
        }
      });

      this.obs.setConsumer(this.sub.on('nav_radio_active_obs_setting'));
      this.cdi.setConsumer(this.sub.on('nav_radio_active_cdi_deviation'));
      this.loc.setConsumer(this.sub.on('nav_radio_active_localizer'));
      this.magVar.setConsumer(this.sub.on('nav_radio_active_magvar'));
      this.navLocationSub = this.sub.on('nav_radio_active_nav_location').handle(lla => this.navLocation.set(lla.lat, lla.long));
    }

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
    this.obs.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.navLocationSub.pause();
    this.cdi.pause();
    this.loc.pause();
    this.magVar.pause();
    this.obs.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    this.setNavLock(true);
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
      this.setNavLock(true);
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.phase = undefined;
    this.setNavLock(false);
    this.pauseSubs();
  }

  /**
   * Sets the NAV1 Lock state.
   * @param newState The new state of the NAV1 lock.
   */
  public setNavLock(newState: boolean): void {
    this.isNavLock.set(newState);
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      if (!this.canArm()) {
        this.deactivate();
      } else if (this.disableArming || this.canActivate()) {
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
    const cdi = this.cdi.get();
    const loc = this.loc.get();
    const obs = this.obs.get();

    const typeIsCorrect = this.navSource.type === NavSourceType.Nav;

    if (this.mode === APLateralModes.LOC && typeIsCorrect) {
      if (this.navSource.index === cdi.source.index && loc.isValid && this.navSource.index === loc.source.index) {
        return true;
      }
    }
    if (this.mode === APLateralModes.VOR && typeIsCorrect) {
      if (this.navSource.index === cdi.source.index && !loc.isValid && this.navSource.index === obs.source.index) {
        return true;
      }
    }
    if (this.apValues.navToNavArmableLateralMode && this.apValues.navToNavArmableLateralMode() === this.mode) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether this director can be activated from an armed state.
   * @returns Whether this director can be activated from an armed state.
   */
  private canActivate(): boolean {
    const cdi = this.cdi.get();
    const loc = this.loc.get();
    const obs = this.obs.get();

    const typeIsCorrect = this.navSource.type === NavSourceType.Nav;
    const index = this.navSource.index;
    const indexIsCorrect = index == cdi.source.index
      && ((loc.isValid && index == loc.source.index) || (!loc.isValid && index == obs.source.index));
    if (typeIsCorrect && indexIsCorrect && cdi.deviation !== null && Math.abs(cdi.deviation) < 127 && (loc.isValid || obs.heading !== null)) {
      const dtk = loc.isValid ? loc.course * Avionics.Utils.RAD2DEG : obs.heading;
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
    const loc = this.loc.get();

    if (this.mode === APLateralModes.LOC) {
      if (this.navSource.index === cdi.source.index && loc.isValid && this.navSource.index == loc.source.index) {
        return true;
      }
    } else if (this.mode === APLateralModes.VOR) {
      if (this.navSource.index === cdi.source.index && !loc.isValid && this.navSource.index == this.obs.get().source.index) {
        return true;
      }
    }

    return false;
  }

  /**
   * Tracks the active navigation signal received by this director.
   */
  private trackSignal(): void {
    const cdi = this.cdi.get();
    const loc = this.loc.get();
    const obs = this.obs.get();

    const isLoc = loc.isValid ?? false;
    const hasValidDeviation = cdi.deviation !== null && Math.abs(cdi.deviation) < 127;
    const hasValidObs = obs.heading !== null;
    let zoneOfConfusion = false;

    if (isLoc && !hasValidDeviation) {
      this.deactivate();
      return;
    }

    const distanceToSource = this.getNavDistance();

    if (!isLoc && (!hasValidDeviation || !hasValidObs)) {
      if (!this.isInZoneOfConfusion(distanceToSource, cdi.deviation)) {
        this.deactivate();
        return;
      } else {
        zoneOfConfusion = true;
      }
    }

    if (zoneOfConfusion || cdi.deviation !== null) {
      const courseMag = isLoc ? loc.course * Avionics.Utils.RAD2DEG : obs.heading;
      if (courseMag === null || courseMag === undefined) {
        this.deactivate();
        return;
      }

      const deflection = SimVar.GetSimVarValue(this.deviationSimVar, SimVarValueType.Number) / 127;
      const radialError = SimVar.GetSimVarValue(this.radialErrorSimVar, SimVarValueType.Radians);
      const xtk = zoneOfConfusion ? 0 : distanceToSource * Math.sin(-radialError);
      const courseTrue = MagVar.magneticToTrue(courseMag, this.magVar.get());
      const trueTrack = GNSSPublisher.getInstantaneousTrack();

      this.phase = this.phaseSelectorFunc(this.phase, deflection, xtk, courseTrue, trueTrack, isLoc, zoneOfConfusion);

      const phaseParams = this.phaseParameters[this.phase];

      const absInterceptAngle = phaseParams.lateralInterceptCurveFunc(
        distanceToSource,
        deflection,
        xtk,
        SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots),
        isLoc
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

  /**
   * Checks whether the airplane is in the zone of confusion.
   * @param distanceToSource The distance from the airplane to the tuned station, in nautical miles.
   * @param deviation The course deviation reported by the tuned station, or `null` if deviation is not available.
   * @returns Whether the airplane is in the zone of confusion.
   */
  private isInZoneOfConfusion(distanceToSource: number, deviation: number | null): boolean {
    return distanceToSource < 2 && deviation !== null;
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
   * @param isLoc Whether the source of the tracked navigation signal is a localizer.
   * @param isInZoneOfConfusion Whether the source of the tracked navigation signal is a VOR and the airplane's
   * position is close enough to the VOR to render lateral deflection values unreliable.
   * @returns The phase to use while tracking the navigation signal.
   */
  private defaultSelectPhase(
    currentPhase: APNavDirectorPhase | undefined,
    deflection: number,
    xtk: number,
    course: number,
    track: number,
    isLoc: boolean,
    isInZoneOfConfusion: boolean
  ): APNavDirectorPhase {
    const time = Date.now();
    const dt = this.lastPhaseUpdateTime === undefined ? 0 : MathUtils.clamp(time - this.lastPhaseUpdateTime, 0, 1000) * this.apValues.simRate.get();
    this.lastPhaseUpdateTime = time;

    if (currentPhase === APNavDirectorPhase.Tracking) {
      if (
        (!isInZoneOfConfusion && Math.abs(deflection) >= this.phaseOptions.interceptDeflection)
        || Math.abs(xtk) >= this.phaseOptions.interceptXtk
        || MathUtils.diffAngleDeg(track, course, false) >= this.phaseOptions.interceptCourseError
      ) {
        if (this.phaseTransitionTimer <= 0) {
          this.phaseTransitionTimer = this.phaseOptions.trackingSwitchDelay;
          return APNavDirectorPhase.Intercept;
        } else {
          this.phaseTransitionTimer -= dt;
        }
      } else {
        this.phaseTransitionTimer = this.phaseOptions.interceptSwitchDelay;
      }

      return APNavDirectorPhase.Tracking;
    } else {
      if (currentPhase === undefined) {
        this.phaseTransitionTimer = 0;
      }

      if (
        (!isInZoneOfConfusion && Math.abs(deflection) <= this.phaseOptions.trackingDeflection)
        && Math.abs(xtk) <= this.phaseOptions.trackingXtk
        && MathUtils.diffAngleDeg(track, course, false) <= this.phaseOptions.trackingCourseError
      ) {
        if (this.phaseTransitionTimer <= 0) {
          this.phaseTransitionTimer = this.phaseOptions.interceptSwitchDelay;
          return APNavDirectorPhase.Tracking;
        } else {
          this.phaseTransitionTimer -= dt;
        }
      } else {
        this.phaseTransitionTimer = this.phaseOptions.trackingSwitchDelay;
      }

      return APNavDirectorPhase.Intercept;
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