/// <reference types="@microsoft/msfs-types/js/simvar" />

import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { NavComEvents } from '../../instruments/NavCom';
import { NavSourceId, NavSourceType } from '../../instruments/NavProcessor';
import { NavRadioIndex } from '../../instruments/RadioCommon';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { APLateralModes, APVerticalModes } from '../APTypes';
import { APValues } from '../APValues';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { VNavVars } from '../vnav/VNavEvents';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Radio navigation data received by a {@link APGSDirector}.
 */
export type APGSDirectorNavData = {
  /** The CDI source of the data. An index of `0` indicates no data is received. */
  navSource: Readonly<NavSourceId>;

  /** The frequency on which the data is received, in megahertz, or `0` if no data is received. */
  frequency: number;

  /** The signal strength. */
  signal: number;

  /** Whether a glideslope signal is being received. */
  hasGs: boolean;

  /**
   * The angle of the received glideslope signal, in degrees. Positive values indicate a descending path. If a
   * glideslope signal is not being received, then this value is `null`.
   */
  gsAngle: number | null;

  /**
   * The glideslope angle error, in degrees, defined as the difference between the angle from the glideslope antenna to
   * the airplane and the glideslope angle. Positive values indicate deviation of the airplane above the glideslope. If
   * a glideslope signal is not being received, then this value is `null`.
   */
  gsAngleError: number | null;
};

/**
 * Radio navigation data received by a {@link APGSDirector} at the moment of activation.
 */
export type APGSDirectorActivateNavData = {
  /** The CDI source of the data. */
  navSource: Readonly<NavSourceId>;

  /** The frequency on which the data was received, in megahertz. */
  frequency: number;
};

/**
 * A function which calculates a desired angle closure rate, in degrees per second, to track a glideslope. The angle
 * closure rate is the rate of reduction of glideslope angle error. Positive values reduce glideslope angle error while
 * negative values increase glideslope angle error.
 * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
 * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
 * above the glideslope.
 * @param gsAngle The glideslope angle, in degrees.
 * @param currentAngleRate The current rate of change of glideslope angle error, in degrees per second.
 * @param distance The lateral distance from the airplane to the glideslope antenna, in meters.
 * @param height The height of the airplane above the glideslope antenna, in meters.
 * @param groundSpeed The airplane's current ground speed, in meters per second.
 * @param vs The airplane's current vertical speed, in meters per second.
 * @returns The desired angle closure rate, in degrees per second, toward the glideslope.
 */
export type APGSDirectorAngleClosureRateFunc = (
  gsAngleError: number,
  gsAngle: number,
  currentAngleRate: number,
  distance: number,
  height: number,
  groundSpeed: number,
  vs: number
) => number;

/**
 * A function which calculates a desired vertical speed to target, in feet per minute, to track a glideslope.
 * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
 * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
 * above the glideslope.
 * @param gsAngle The glideslope angle, in degrees.
 * @param currentAngleRate The current rate of change of glideslope angle error, in degrees per second.
 * @param distance The lateral distance from the airplane to the glideslope antenna, in meters.
 * @param height The height of the airplane above the glideslope antenna, in meters.
 * @param groundSpeed The airplane's current ground speed, in meters per second.
 * @param vs The airplane's current vertical speed, in meters per second.
 * @returns The desired vertical speed to target, in feet per minute.
 */
export type APGSDirectorVsTargetFunc = (
  gsAngleError: number,
  gsAngle: number,
  currentAngleRate: number,
  distance: number,
  height: number,
  groundSpeed: number,
  vs: number
) => number;

/**
 * Options for {@link APGSDirector}.
 */
export type APGSDirectorOptions = {
  /**
   * The index of the nav radio to force the director to use. If not defined, the director will use the nav radio
   * specified by the active autopilot navigation source.
   */
  forceNavSource?: NavRadioIndex;

  /**
   * A function that checks whether the director can be armed. If not defined, then default logic will be used.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  canArm?: (apValues: APValues, navData: Readonly<APGSDirectorNavData>) => boolean;

  /**
   * A function that checks whether the director can be activated from an armed state. If not defined, then default
   * logic will be used.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  canActivate?: (apValues: APValues, navData: Readonly<APGSDirectorNavData>) => boolean;

  /**
   * A function that checks whether the director can remain in the active state. If not defined, then default logic
   * will be used.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param activateNavData The radio navigation data received by the director at the moment of activation.
   * @returns Whether the director can remain in the active state.
   */
  canRemainActive?: (apValues: APValues, navData: Readonly<APGSDirectorNavData>, activateNavData: Readonly<APGSDirectorActivateNavData>) => boolean;

  /**
   * A function which returns the desired angle closure rate to track a glideslope. The angle closure rate is the rate
   * of reduction of glideslope angle error. If not defined, the director will use a default angle closure rate curve.
   * The output of this function will be overridden by the `vsTarget` function if the latter is defined.
   */
  angleClosureRate?: APGSDirectorAngleClosureRateFunc;

  /**
   * A function which returns the desired vertical speed target to track a glideslope. If defined, the output of this
   * function will override that of the `angleClosureRate` function.
   */
  vsTarget?: APGSDirectorVsTargetFunc;

  /** The minimum vertical speed the director can target, in feet per minute. Defaults to `-3000`. */
  minVs?: number;

  /** The maximum vertical speed the director can target, in feet per minute. Defaults to `0`. */
  maxVs?: number;
};

/**
 * An autopilot director that provides vertical guidance by tracking a glideslope signal from a radio navigation aid.
 *
 * Requires that the navigation radio topics defined in {@link NavComEvents} be published to the event bus in order to
 * function properly.
 */
export class APGSDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private navSource: Readonly<NavSourceId> = {
    index: 0,
    type: NavSourceType.Nav,
  };

  private readonly navFrequency = ConsumerValue.create(null, 0);
  private readonly navSignal = ConsumerValue.create(null, 0);
  private readonly navHasGs = ConsumerValue.create(null, false);
  private readonly navGsAngle = ConsumerValue.create(null, 0);
  private readonly navGsError = ConsumerValue.create<number | null>(null, null);
  private readonly navLla = ConsumerValue.create<LatLongAlt | null>(null, null);

  private readonly forceNavSource: NavRadioIndex | undefined;

  private readonly navData = {
    navSource: { index: 0, type: NavSourceType.Nav } as NavSourceId,
    frequency: 0,
    signal: 0,
    hasGs: false as boolean,
    gsAngle: null as number | null,
    gsAngleError: null as number | null
  } satisfies APGSDirectorNavData;

  private readonly activateNavData = {
    navSource: { index: 0, type: NavSourceType.Nav } as NavSourceId,
    frequency: 0
  } satisfies APGSDirectorActivateNavData;

  private readonly canArm: (apValues: APValues, navData: Readonly<APGSDirectorNavData>) => boolean;
  private readonly canActivate: (apValues: APValues, navData: Readonly<APGSDirectorNavData>) => boolean;
  private readonly canRemainActive: (apValues: APValues, navData: Readonly<APGSDirectorNavData>, activateNavData: Readonly<APGSDirectorActivateNavData>) => boolean;

  private readonly angleClosureRateFunc: APGSDirectorAngleClosureRateFunc;
  private readonly vsTargetFunc?: APGSDirectorVsTargetFunc;

  private readonly minVs: number;
  private readonly maxVs: number;

  /**
   * Creates a new instance of APGSDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options with which to configure the director.
   */
  public constructor(private readonly bus: EventBus, private readonly apValues: APValues, options?: Readonly<APGSDirectorOptions>) {
    this.state = DirectorState.Inactive;

    this.forceNavSource = options?.forceNavSource;

    this.canArm = options?.canArm ?? APGSDirector.defaultCanArm;
    this.canActivate = options?.canActivate ?? APGSDirector.defaultCanActivate;
    this.canRemainActive = options?.canRemainActive ?? APGSDirector.defaultCanRemainActive;

    this.angleClosureRateFunc = options?.angleClosureRate ?? APGSDirector.defaultAngleClosureRate;
    this.vsTargetFunc = options?.vsTarget;

    const vsUnit = this.vsTargetFunc ? UnitType.FPM : UnitType.MPS;
    this.minVs = UnitType.FPM.convertTo(options?.minVs ?? -3000, vsUnit);
    this.maxVs = UnitType.FPM.convertTo(options?.maxVs ?? 0, vsUnit);

    this.initCdiSourceSubs();
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

      const sub = this.bus.getSubscriber<NavComEvents>();

      this.navFrequency.setConsumerWithDefault(sub.on(`nav_active_frequency_${index}`), 0);
      this.navSignal.setConsumerWithDefault(sub.on(`nav_signal_${index}`), 0);
      this.navHasGs.setConsumerWithDefault(sub.on(`nav_glideslope_${index}`), false);
      this.navGsAngle.setConsumerWithDefault(sub.on(`nav_raw_gs_${index}`), 0);
      this.navGsError.setConsumerWithDefault(sub.on(`nav_gs_error_${index}`), 0);
      this.navLla.setConsumerWithDefault(sub.on(`nav_lla_${index}`), null);
    } else {
      this.navFrequency.reset(0);
      this.navSignal.reset(0);
      this.navHasGs.reset(false);
      this.navGsAngle.reset(0);
      this.navGsError.reset(null);
      this.navLla.reset(null);
    }
  }

  /**
   * Updates this director's radio navigation data.
   */
  private updateNavData(): void {
    Object.assign(this.navData.navSource, this.navSource);
    this.navData.frequency = this.navFrequency.get();
    this.navData.signal = this.navSignal.get();
    this.navData.hasGs = this.navHasGs.get();
    this.navData.gsAngle = this.navData.hasGs ? this.navGsAngle.get() : null;
    this.navData.gsAngleError = this.navData.signal > 0 && this.navData.hasGs ? this.navGsError.get() : null;
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GSActive);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);

    Object.assign(this.activateNavData.navSource, this.navSource);
    this.activateNavData.frequency = this.navFrequency.get();
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.updateNavData();
      if (this.canArm(this.apValues, this.navData)) {
        this.state = DirectorState.Armed;
        SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GSArmed);
        if (this.onArm !== undefined) {
          this.onArm();
        }
        SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', true);
        SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
        SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
      }
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.None);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      this.updateNavData();
      if (this.canActivate(this.apValues, this.navData)) {
        this.activate();
      }
      if (!this.canArm(this.apValues, this.navData)) {
        this.deactivate();
      }
    }
    if (this.state === DirectorState.Active) {
      this.updateNavData();
      if (!this.canRemainActive(this.apValues, this.navData, this.activateNavData)) {
        this.deactivate();
      }
      this.trackGlideslope();
    }
  }

  /**
   * Tracks the Glideslope.
   */
  private trackGlideslope(): void {
    const gsError = this.navHasGs.get() && this.navSignal.get() > 0 ? this.navGsError.get() : null;
    const navLla = this.navLla.get();
    if (gsError !== null && navLla !== null) {
      const gsAngle = this.navGsAngle.get();
      const distanceM = UnitType.GA_RADIAN.convertTo(
        GeoPoint.distance(
          navLla.lat,
          navLla.long,
          SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
          SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
        ),
        UnitType.METER
      );

      // We want the height of the plane above the glideslope antenna, which we can calculate from distance,
      // glideslope angle, and glideslope error.
      const heightM = distanceM * Math.tan((gsAngle + gsError) * Avionics.Utils.DEG2RAD);
      const groundSpeedMps = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.MetersPerSecond);
      const vsMps = SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.MetersPerSecond);

      const hypotSq = distanceM * distanceM + heightM * heightM;
      const heightTimesGs = heightM * groundSpeedMps;

      const currentAngleRate = (vsMps * distanceM + heightTimesGs) / hypotSq;

      let targetVs: number;
      let unit: string;

      if (this.vsTargetFunc) {
        targetVs = this.vsTargetFunc(gsError, gsAngle, currentAngleRate, distanceM, heightM, groundSpeedMps, vsMps);
        unit = SimVarValueType.FPM;
      } else {
        const desiredClosureRate = this.angleClosureRateFunc(gsError, gsAngle, currentAngleRate, distanceM, heightM, groundSpeedMps, vsMps);
        const desiredAngleRate = Math.sign(gsError) * -1 * desiredClosureRate;

        targetVs = (Avionics.Utils.DEG2RAD * desiredAngleRate * hypotSq - heightTimesGs) / distanceM;
        unit = SimVarValueType.MetersPerSecond;
      }

      targetVs = MathUtils.clamp(targetVs, this.minVs, this.maxVs);

      const pitchForVerticalSpeed = Math.asin(MathUtils.clamp(targetVs / SimVar.GetSimVarValue('AIRSPEED TRUE', unit), -1, 1)) * Avionics.Utils.RAD2DEG;
      const targetPitch = MathUtils.clamp(pitchForVerticalSpeed, -8, 3);

      this.drivePitch && this.drivePitch(-targetPitch, true, true);
    }
  }

  /**
   * A default function that checks whether the director can be armed.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  private static defaultCanArm(apValues: APValues, navData: Readonly<APGSDirectorNavData>): boolean {
    return (apValues.navToNavArmableVerticalMode && apValues.navToNavArmableVerticalMode() === APVerticalModes.GS)
      || navData.hasGs;
  }

  /**
   * A default function that checks whether the director can be activated from an armed state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  private static defaultCanActivate(apValues: APValues, navData: Readonly<APGSDirectorNavData>): boolean {
    return apValues.lateralActive.get() === APLateralModes.LOC
      && navData.gsAngleError !== null
      && Math.abs(navData.gsAngleError) <= 0.1;
  }

  /**
   * A default function that checks whether the director can remain in the active state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can remain in the active state.
   */
  private static defaultCanRemainActive(apValues: APValues, navData: Readonly<APGSDirectorNavData>): boolean {
    return apValues.lateralActive.get() === APLateralModes.LOC && navData.gsAngleError !== null;
  }

  /**
   * A default function which calculates a desired angle closure rate, in degrees per second, to track a glideslope. The angle
   * closure rate is the rate of reduction of glideslope angle error. Positive values reduce glideslope angle error while
   * negative values increase glideslope angle error.
   * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
   * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
   * above the glideslope.
   * @returns The desired angle closure rate, in degrees per second, toward the glideslope.
   */
  private static defaultAngleClosureRate(gsAngleError: number): number {
    // We will target 0.1 degrees per second by default at full-scale deviation, decreasing linearly down to 0 at no
    // deviation. This is equivalent to a constant time-to-intercept of 7 seconds at full-scale deviation or less.
    return MathUtils.lerp(Math.abs(gsAngleError), 0, 0.7, 0, 0.1, true, true);
  }
}