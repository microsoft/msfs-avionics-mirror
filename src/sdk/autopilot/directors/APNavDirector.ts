import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { MagVar } from '../../geo/MagVar';
import { NavMath } from '../../geo/NavMath';
import { NavRadioEvents } from '../../instruments/APRadioNavInstrument';
import { GNSSEvents, GNSSPublisher } from '../../instruments/GNSS';
import { CdiDeviation, Localizer, NavEvents, NavSourceId, NavSourceType, ObsSetting } from '../../instruments/NavProcessor';
import { NavRadioIndex } from '../../instruments/RadioCommon';
import { UnitType } from '../../math/NumberUnit';
import { Subject } from '../../sub/Subject';
import { Subscription } from '../../sub/Subscription';
import { APLateralModes, APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Calculates an intercept angle, in degrees, to capture the desired track from a navigation signal for
 * {@link APNavDirector}.
 * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
 * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
 * Positive values indicate that the desired track is to the right of the plane.
 * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
 * that the plane is to the right of the track.
 * @param tas The true airspeed of the plane, in knots.
 * @param isLoc Whether the source of the navigation signal is a localizer. Defaults to `false`.
 * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
 */
export type APNavDirectorInterceptFunc = (distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc: boolean) => number;

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
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not undefined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: APNavDirectorInterceptFunc;

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

  private readonly sub = this.bus.getSubscriber<GNSSEvents & NavRadioEvents & NavEvents>();

  private readonly obs = ConsumerValue.create<ObsSetting>(null, { heading: 0, source: { index: 0, type: NavSourceType.Nav } });
  private readonly cdi = ConsumerValue.create<CdiDeviation>(null, { source: { index: 0, type: NavSourceType.Nav }, deviation: null });
  private readonly loc = ConsumerValue.create<Localizer>(null, { isValid: false, course: 0, source: { index: 0, type: NavSourceType.Nav } });
  private navSource: NavSourceId;

  private deviationSimVar = 'NAV CDI:1';
  private radialErrorSimVar = 'NAV RADIAL ERROR:1';

  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly navLocation = new GeoPoint(NaN, NaN);
  private readonly navLocationSub: Subscription;

  private isNavLock = Subject.create<boolean>(false);

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;
  private readonly lateralInterceptCurve?: APNavDirectorInterceptFunc;

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

    const maxBankAngleOpt = options?.maxBankAngle ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxBankAngleFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxBankAngleFunc = maxBankAngleOpt;
        break;
      default:
        this.maxBankAngleFunc = this.apValues.maxBankAngle.get.bind(this.apValues.maxBankAngle);
    }

    const bankRateOpt = options?.bankRate;
    switch (typeof bankRateOpt) {
      case 'number':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt * this.apValues.simRate.get());
          }
        };
        break;
      case 'function':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt() * this.apValues.simRate.get());
          }
        };
        break;
      default:
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank);
          }
        };
    }

    this.lateralInterceptCurve = options?.lateralInterceptCurve;
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

      this.sub.on('cdi_select').handle(source => {
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
        const desiredBank = this.desiredBank();
        if (isFinite(desiredBank)) {
          this.driveBankFunc(desiredBank);
        }
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
    if (this.mode === APLateralModes.LOC && this.apValues.navToNavLocArm && this.apValues.navToNavLocArm()) {
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
   * Gets a desired bank from the nav input data.
   * @returns The desired bank angle.
   */
  private desiredBank(): number {
    const cdi = this.cdi.get();
    const loc = this.loc.get();
    const obs = this.obs.get();

    const isLoc = loc.isValid ?? false;
    const hasValidDeviation = cdi.deviation !== null && Math.abs(cdi.deviation) < 127;
    const hasValidObs = obs.heading !== null;
    let zoneOfConfusion = false;

    if (isLoc && !hasValidDeviation) {
      this.deactivate();
      return NaN;
    }

    const distanceToSource = this.getNavDistance();

    if (!isLoc && (!hasValidDeviation || !hasValidObs)) {
      if (!this.isInZoneOfConfusion(distanceToSource, cdi.deviation)) {
        this.deactivate();
        return NaN;
      } else {
        zoneOfConfusion = true;
      }
    }

    if (zoneOfConfusion || cdi.deviation !== null) {
      const courseMag = isLoc ? loc.course * Avionics.Utils.RAD2DEG : obs.heading;
      if (courseMag === null || courseMag === undefined) {
        this.deactivate();
        return NaN;
      }

      const radialError = SimVar.GetSimVarValue(this.radialErrorSimVar, SimVarValueType.Radians);
      const xtk = zoneOfConfusion ? 0 : distanceToSource * Math.sin(-radialError);

      let absInterceptAngle = 0;
      if (this.lateralInterceptCurve !== undefined) {
        absInterceptAngle = this.lateralInterceptCurve(
          distanceToSource,
          SimVar.GetSimVarValue(this.deviationSimVar, SimVarValueType.Number) / 127,
          xtk,
          SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots),
          isLoc
        );
      } else {
        absInterceptAngle = Math.min(Math.pow(Math.abs(xtk) * 20, 1.35) + (Math.abs(xtk) * 50), 45);
        if (absInterceptAngle <= 2.5) {
          absInterceptAngle = NavMath.clamp(Math.abs(xtk * 150), 0, 2.5);
        }
      }

      const interceptAngle = xtk > 0 ? -absInterceptAngle : absInterceptAngle;
      const desiredTrack = NavMath.normalizeHeading(MagVar.magneticToTrue(courseMag, this.magVar.get()) + interceptAngle);

      const trueTrack = GNSSPublisher.getInstantaneousTrack();
      const turnDirection = NavMath.getTurnDirection(trueTrack, desiredTrack);
      const trackDiff = Math.abs(NavMath.diffAngle(trueTrack, desiredTrack));

      let baseBank = Math.min(1.25 * trackDiff, this.maxBankAngleFunc());
      baseBank *= (turnDirection === 'left' ? 1 : -1);

      return baseBank;
    }

    this.deactivate();
    return NaN;
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
}