import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { MagVar } from '../../geo/MagVar';
import { NavMath } from '../../geo/NavMath';
import { GNSSPublisher } from '../../instruments/GNSS';
import { NavComEvents } from '../../instruments/NavCom';
import { NavSourceId, NavSourceType } from '../../instruments/NavProcessor';
import { NavRadioIndex } from '../../instruments/RadioCommon';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Subject } from '../../sub/Subject';
import { APLateralModes } from '../APTypes';
import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Radio navigation data received by a {@link APNavDirector}.
 */
export type APNavDirectorNavData = {
  /** The CDI source of the data. An index of `0` indicates no data is received. */
  navSource: Readonly<NavSourceId>;

  /** The frequency on which the data was received, in megahertz, or `0` if no data is received. */
  frequency: number;

  /** The selected OBS course, in degrees, or `null` if there is no selected course. */
  obsCourse: number | null;

  /** The signal strength. */
  signal: number;

  /** Whether a lateral deviation signal is being received. */
  hasNav: boolean;

  /** Whether a localizer signal is being received. */
  hasLoc: boolean;

  /**
   * The magnetic course of the received localizer signal, in degrees. If a localizer signal is not being received,
   * then this value is `null`.
   */
  locCourse: number | null;

  /**
   * The lateral deviation, in the range `[-1, 1]`. Positive values indicate deviation of the airplane to the left of
   * course. If a lateral deviation signal is not being received, then this value is `null`.
   */
  deviation: number | null;
};

/**
 * Radio navigation data received by a {@link APNavDirector} at the moment of activation.
 */
export type APNavDirectorActivateNavData = {
  /** The CDI source of the data. */
  navSource: Readonly<NavSourceId>;

  /** The frequency on which the data was received, in megahertz. */
  frequency: number;

  /** The selected OBS course, or `null` if there is no selected course. */
  obsCourse: number | null;
};

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
   * A function that checks whether the director can be armed. If not defined, then default logic will be used.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  canArm?: (mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>) => boolean;

  /**
   * A function that checks whether the director can be activated from an armed state. If not defined, then default
   * logic will be used.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  canActivate?: (mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>) => boolean;

  /**
   * A function that checks whether the director can remain in the active state. If not defined, then default logic
   * will be used.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param isInZoneOfConfusion Whether the source of the radio navigation data is a VOR and the airplane's position
   * is close enough to the VOR to render lateral deviation values unreliable.
   * @param activateNavData The radio navigation data received by the director at the moment of activation.
   * @returns Whether the director can remain in the active state.
   */
  canRemainActive?: (
    mode: APLateralModes,
    apValues: APValues,
    navData: Readonly<APNavDirectorNavData>,
    isInZoneOfConfusion: boolean,
    activateNavData: Readonly<APNavDirectorActivateNavData>
  ) => boolean;

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
 * An autopilot director that provides lateral guidance by tracking a signal from a VOR or localizer radio navigation
 * aid.
 *
 * Requires that the navigation radio topics defined in {@link NavComEvents} be published to the event bus in order to
 * function properly.
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

  protected navSource: Readonly<NavSourceId> = {
    index: 0,
    type: NavSourceType.Nav,
  };

  private deviationSimVar = 'NAV CDI:1';
  protected radialErrorSimVar = 'NAV RADIAL ERROR:1';

  protected readonly navFrequency = ConsumerValue.create(null, 0);
  protected readonly navObs = ConsumerValue.create<number | null>(null, null);
  protected readonly navSignal = ConsumerValue.create(null, 0);
  protected readonly navHasNav = ConsumerValue.create(null, false);
  protected readonly navCdi = ConsumerValue.create<number | null>(null, null);
  protected readonly navHasLoc = ConsumerValue.create(null, false);
  protected readonly navLocCourse = ConsumerValue.create(null, 0);
  protected readonly navMagVar = ConsumerValue.create(null, 0);
  protected readonly navLla = ConsumerValue.create<LatLongAlt | null>(null, null);

  private readonly isNavLock = Subject.create<boolean>(false);

  private readonly navData = {
    navSource: { index: 0, type: NavSourceType.Nav } as NavSourceId,
    frequency: 0,
    obsCourse: null as number | null,
    signal: 0,
    hasNav: false as boolean,
    hasLoc: false as boolean,
    locCourse: null as number | null,
    deviation: null as number | null
  } satisfies APNavDirectorNavData;

  private readonly activateNavData = {
    navSource: { index: 0, type: NavSourceType.Nav } as NavSourceId,
    frequency: 0,
    obsCourse: null as number | null
  } satisfies APNavDirectorActivateNavData;

  private readonly canArm: (mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>) => boolean;
  private readonly canActivate: (mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>) => boolean;
  private readonly canRemainActive: (
    mode: APLateralModes,
    apValues: APValues,
    navData: Readonly<APNavDirectorNavData>,
    isInZoneOfConfusion: boolean,
    activateNavData: Readonly<APNavDirectorActivateNavData>
  ) => boolean;

  protected phase: APNavDirectorPhase | undefined = undefined;

  private readonly phaseOptions: Required<APNavDirectorPhaseOptions>;
  private readonly phaseSelectorFunc: APNavDirectorPhaseSelectorFunc;

  protected readonly phaseParameters: Record<APNavDirectorPhase, PhaseParameters>;

  private readonly disableArming: boolean;
  private readonly forceNavSource: NavRadioIndex | undefined;

  /**
   * Creates a new instance of APNavDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param mode The APLateralMode for this instance of the director.
   * @param options Options with which to configure the director.
   */
  public constructor(
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

    this.canArm = options?.canArm ?? APNavDirector.defaultCanArm;
    this.canActivate = options?.canActivate ?? APNavDirector.defaultCanActivate;
    this.canRemainActive = options?.canRemainActive ?? APNavDirector.defaultCanRemainActive;

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

    this.initCdiSourceSubs();
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

  /**
   * Initializes this director's subscription to the autopilot's CDI source. If this director is forced to use a
   * specific CDI source, then the autopilot's CDI source will be ignored.
   */
  protected initCdiSourceSubs(): void {
    if (this.forceNavSource !== undefined) {
      this.onCdiSourceChanged({
        index: this.forceNavSource,
        type: NavSourceType.Nav,
      });
    } else {
      this.navSource = {
        index: 0,
        type: NavSourceType.Nav,
      };

      this.apValues.cdiSource.sub(this.onCdiSourceChanged.bind(this), true);
    }
  }

  /**
   * Responds to when the CDI source used by this director changes.
   * @param source The new CDI source to use.
   */
  private onCdiSourceChanged(source: Readonly<NavSourceId>): void {
    Object.assign(this.navSource, source);

    if (source.type === NavSourceType.Nav && source.index >= 1 && source.index <= 4) {
      const index = source.index as NavRadioIndex;

      this.deviationSimVar = `NAV CDI:${index}`;
      this.radialErrorSimVar = `NAV RADIAL ERROR:${index}`;

      const sub = this.bus.getSubscriber<NavComEvents>();

      this.navFrequency.setConsumerWithDefault(sub.on(`nav_active_frequency_${index}`), 0);
      this.navObs.setConsumerWithDefault(sub.on(`nav_obs_${index}`), null);
      this.navSignal.setConsumerWithDefault(sub.on(`nav_signal_${index}`), 0);
      this.navHasNav.setConsumerWithDefault(sub.on(`nav_has_nav_${index}`), false);
      this.navCdi.setConsumerWithDefault(sub.on(`nav_cdi_${index}`), null);
      this.navHasLoc.setConsumerWithDefault(sub.on(`nav_localizer_${index}`), false);
      this.navLocCourse.setConsumerWithDefault(sub.on(`nav_localizer_crs_${index}`), 0);
      this.navMagVar.setConsumerWithDefault(sub.on(`nav_magvar_${index}`), 0);
      this.navLla.setConsumerWithDefault(sub.on(`nav_lla_${index}`), null);
    } else {
      this.navFrequency.reset(0);
      this.navObs.reset(null);
      this.navSignal.reset(0);
      this.navHasNav.reset(false);
      this.navCdi.reset(null);
      this.navHasLoc.reset(false);
      this.navLocCourse.reset(0);
      this.navMagVar.reset(0);
      this.navLla.reset(null);
    }
  }

  /**
   * Updates this director's radio navigation data.
   */
  protected updateNavData(): void {
    Object.assign(this.navData.navSource, this.navSource);
    this.navData.frequency = this.navFrequency.get();
    this.navData.signal = this.navSignal.get();
    this.navData.obsCourse = this.navObs.get();
    this.navData.hasNav = this.navHasNav.get();
    this.navData.hasLoc = this.navHasLoc.get();
    this.navData.locCourse = this.navData.hasLoc ? this.navLocCourse.get() * Avionics.Utils.RAD2DEG : null;
    this.navData.deviation = this.navData.signal > 0 && this.navData.hasNav ? this.navCdi.get() : null;
    if (this.navData.deviation !== null) {
      this.navData.deviation /= 127;
    }
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    this.setNavLock(true);
    this.state = DirectorState.Active;

    Object.assign(this.activateNavData.navSource, this.navSource);
    this.activateNavData.frequency = this.navFrequency.get();
    this.activateNavData.obsCourse = this.navObs.get();
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.updateNavData();
      if (this.canArm(this.mode, this.apValues, this.navData)) {
        this.state = DirectorState.Armed;
        if (this.onArm !== undefined) {
          this.onArm();
        }
        this.setNavLock(true);
      }
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.phase = undefined;
    this.setNavLock(false);
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
      this.updateNavData();
      if (!this.canArm(this.mode, this.apValues, this.navData)) {
        this.deactivate();
      } else if (this.disableArming || this.canActivate(this.mode, this.apValues, this.navData)) {
        this.activate();
      }
    }

    if (this.state === DirectorState.Active) {
      this.updateNavData();

      const distanceToSource = this.getNavDistance();
      const isInZoneOfConfusion = !this.navHasLoc.get() && this.isInZoneOfConfusion(distanceToSource);

      if (!this.canRemainActive(this.mode, this.apValues, this.navData, isInZoneOfConfusion, this.activateNavData)) {
        this.deactivate();
      } else {
        this.trackSignal(distanceToSource, isInZoneOfConfusion);
      }
    }
  }

  /**
   * Tracks the active navigation signal received by this director.
   * @param distanceToSource The distance to the source of the active navigation signal, in nautical miles.
   * @param isInZoneOfConfusion Whether the source of the active navigation signal is a VOR and the airplane's position
   * is close enough to the VOR to render lateral deviation values unreliable.
   */
  protected trackSignal(distanceToSource: number, isInZoneOfConfusion: boolean): void {
    const obsCourse = this.navObs.get();
    const isLoc = this.navHasLoc.get();
    const deviation = this.navSignal.get() > 0 ? this.navCdi.get() : null;

    if (isInZoneOfConfusion || deviation !== null) {
      const courseMag = isLoc ? this.navLocCourse.get() * Avionics.Utils.RAD2DEG : obsCourse;
      if (courseMag === null) {
        return;
      }

      const deflection = SimVar.GetSimVarValue(this.deviationSimVar, SimVarValueType.Number) / 127;
      const radialError = SimVar.GetSimVarValue(this.radialErrorSimVar, SimVarValueType.Radians);
      const xtk = isInZoneOfConfusion ? 0 : distanceToSource * Math.sin(-radialError);
      const courseTrue = MagVar.magneticToTrue(courseMag, -this.navMagVar.get());
      const trueTrack = GNSSPublisher.getInstantaneousTrack();

      this.phase = this.phaseSelectorFunc(this.phase, deflection, xtk, courseTrue, trueTrack, isLoc, isInZoneOfConfusion);

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
    }
  }

  /**
   * Gets the lateral distance from PPOS to the nav signal.
   * @returns The distance value in nautical miles.
   */
  protected getNavDistance(): number {
    const navLla = this.navLla.get();
    if (navLla !== null) {
      return UnitType.GA_RADIAN.convertTo(GeoPoint.distance(
        navLla.lat,
        navLla.long,
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
   * @returns Whether the airplane is in the zone of confusion.
   */
  private isInZoneOfConfusion(distanceToSource: number): boolean {
    return distanceToSource < 2;
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
   * A default function that checks whether the director can be armed.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  protected static defaultCanArm(mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>): boolean {
    const typeIsCorrect = navData.navSource.type === NavSourceType.Nav && navData.navSource.index !== 0;

    if (typeIsCorrect) {
      if (mode === APLateralModes.LOC) {
        return navData.hasLoc;
      } else if (mode === APLateralModes.VOR) {
        return !navData.hasLoc;
      }
    } else {
      if (apValues.navToNavArmableLateralMode && apValues.navToNavArmableLateralMode() === mode) {
        return true;
      }
    }

    return false;
  }

  /**
   * A default function that checks whether the director can be activated from an armed state.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  protected static defaultCanActivate(mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>): boolean {
    if (
      navData.navSource.type === NavSourceType.Nav
      && navData.navSource.index !== 0
      && navData.deviation !== null
      && Math.abs(navData.deviation) < 1
      && (navData.hasLoc || navData.obsCourse !== null)
    ) {
      const dtk = navData.hasLoc
        ? navData.locCourse
        : navData.obsCourse;
      if (dtk === null) {
        return false;
      }
      const headingDiff = NavMath.diffAngle(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree), dtk);
      const sensitivity = navData.hasLoc ? 1 : .6;
      if (Math.abs(navData.deviation * sensitivity) < 1 && Math.abs(headingDiff) < 110) {
        return true;
      }
    }

    return false;
  }

  /**
   * A default function that checks whether the director can remain in the active state.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param isInZoneOfConfusion Whether the source of the radio navigation data is a VOR and the airplane's position
   * is close enough to the VOR to render lateral deviation values unreliable.
   * @returns Whether the director can remain in the active state.
   */
  private static defaultCanRemainActive(
    mode: APLateralModes,
    apValues: APValues,
    navData: Readonly<APNavDirectorNavData>,
    isInZoneOfConfusion: boolean
  ): boolean {
    if (navData.navSource.type !== NavSourceType.Nav || navData.navSource.index === 0) {
      return false;
    }

    if (mode === APLateralModes.LOC) {
      return navData.hasLoc
        && navData.locCourse !== null
        && navData.deviation !== null
        && Math.abs(navData.deviation) < 1;
    } else if (mode === APLateralModes.VOR) {
      return !navData.hasLoc
        && navData.obsCourse !== null
        && (isInZoneOfConfusion || (navData.deviation !== null && Math.abs(navData.deviation) < 1));
    }

    return false;
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
