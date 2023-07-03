import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { MagVar } from '../../geo/MagVar';
import { NavMath } from '../../geo/NavMath';
import { NavRadioEvents } from '../../instruments/APRadioNavInstrument';
import { GNSSEvents, GNSSPublisher } from '../../instruments/GNSS';
import { CdiDeviation, Localizer, NavEvents, NavSourceId, NavSourceType } from '../../instruments/NavProcessor';
import { UnitType } from '../../math/NumberUnit';
import { APValues } from '../APConfig';
import { APNavDirectorInterceptFunc } from './APNavDirector';
import { DirectorState, PlaneDirector } from './PlaneDirector';

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
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not undefined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: APNavDirectorInterceptFunc;
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

  private readonly sub = this.bus.getSubscriber<GNSSEvents & NavRadioEvents & NavEvents>();

  private readonly cdi = ConsumerValue.create<CdiDeviation>(null, { source: { index: 0, type: NavSourceType.Nav }, deviation: null });
  private readonly loc = ConsumerValue.create<Localizer>(null, { isValid: false, course: 0, source: { index: 0, type: NavSourceType.Nav } });
  private navSource: NavSourceId = { index: 0, type: NavSourceType.Nav };

  private deviationSimVar = 'NAV CDI:1';
  private radialErrorSimVar = 'NAV RADIAL ERROR:1';

  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly navLocation = new GeoPoint(NaN, NaN);
  private readonly navLocationSub = this.sub.on('nav_radio_active_nav_location').handle(lla => this.navLocation.set(lla.lat, lla.long));

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;
  private readonly lateralInterceptCurve?: APNavDirectorInterceptFunc;

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

    this.sub.on('cdi_select').handle(source => {
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
        this.driveBankFunc(this.desiredBank());
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
   * Gets a desired bank from the nav input data.
   * @returns The desired bank angle.
   */
  private desiredBank(): number {
    const cdi = this.cdi.get();
    const loc = this.loc.get();

    const isLoc = loc.isValid ?? false;
    const hasValidDeviation = cdi.deviation !== null && Math.abs(cdi.deviation) < 127;

    if (!isLoc || (isLoc && !hasValidDeviation)) {
      this.deactivate();
      return NaN;
    }

    if (cdi.deviation !== null) {
      const courseMag = isLoc ? NavMath.normalizeHeading((loc.course * Avionics.Utils.RAD2DEG) + 180) : null;
      if (courseMag === null || courseMag === undefined) {
        this.deactivate();
        return NaN;
      }

      const distanceToSource = this.getNavDistance();
      const radialError = SimVar.GetSimVarValue(this.radialErrorSimVar, SimVarValueType.Radians);
      const xtk = distanceToSource * Math.sin(radialError);

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
      const desiredTrack = NavMath.normalizeHeading(MagVar.magneticToTrue(courseMag, this.magVar.get() ?? 0) + interceptAngle);

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
}