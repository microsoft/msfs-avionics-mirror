import { ConsumerSubject } from '../data/ConsumerSubject';
import { EventBus } from '../data/EventBus';
import { KeyEventManager } from '../data/KeyEventManager';
import { SimVarValueType } from '../data/SimVars';
import { ThrottleLeverManager } from '../fadec/ThrottleLeverManager';
import { VirtualThrottleLeverEvents } from '../fadec/VirtualThrottleLeverEvents';
import { ClockEvents } from '../instruments/Clock';
import { AeroMath } from '../math/AeroMath';
import { ExpSmoother } from '../math/ExpSmoother';
import { MathUtils } from '../math/MathUtils';
import { MultiExpSmoother } from '../math/MultiExpSmoother';
import { UnitType } from '../math/NumberUnit';
import { Accessible } from '../sub/Accessible';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { SubscribableUtils } from '../sub/SubscribableUtils';
import { Value } from '../sub/Value';
import { PidController } from '../utils/controllers/PidController';
import { AutothrottleEvents, AutothrottleTargetMode, AutothrottleThrottleIndex } from './Autothrottle';

/**
 * Information describing a throttle controlled by an autothrottle system.
 */
export type AutothrottleThrottleInfo = {
  /** The index of the engine controlled by the throttle. */
  index: AutothrottleThrottleIndex;

  /** Whether the throttle is a virtual throttle. */
  isVirtual: boolean;

  /** The idle position of the throttle, where `-1` is full reverse, `0` is neutral, and `1` is full forward. */
  idlePosition: number;

  /** The maximum thrust position of the throttle, where `-1` is full reverse, `0` is neutral, and `1` is full forward. */
  maxThrustPosition: number;
};

/**
 * PID controller parameters for an autothrottle.
 */
export type AutothrottlePidParams = {
  /** Proportional gain. */
  kP: number;

  /** Integral gain. */
  kI: number;

  /** Differential gain. */
  kD: number;

  /** Maximum output. */
  maxOut: number;

  /** Minimum output. */
  minOut: number;

  /** Maximum allowed integral term. Defaults to positive infinity. */
  maxI?: number;

  /** Minimum allowed integral term. Defaults to negative infinity. */
  minI?: number;
};

/**
 * A function which generates an acceleration target, in knots per second, from a given target airspeed error.
 * @param iasError The target airspeed error, in knots. Positive values indicate the target airspeed is greater than
 * the airplane's effective airspeed.
 * @param targetIas The target indicated airspeed, in knots.
 * @param effectiveIas The airplane's effective indicated airspeed, in knots. The effective airspeed value is reported
 * after smoothing and lookahead (if they are specified for airspeed data) have been applied.
 * @param effectiveAccel The airplane's effective acceleration, in knots per second. The effective acceleration value
 * is reported after smoothing (if it is specified for acceleration data) has been applied.
 * @param accelCorrection The acceleration, in knots per second, required for the airplane to maintain a constant
 * target airspeed error. For example, if `accelCorrection` is equal to 1 knot per second and the airplane's current
 * target airspeed error is zero, then the airplane must accelerate at 1 knot per second to maintain a target airspeed
 * error of zero.
 * @returns An acceleration to target, in knots per second, for the specified overspeed protection airspeed error.
 */
export type AutothrottleAccelTargetFunc = (
  iasError: number,
  targetIas: number,
  effectiveIas: number,
  effectiveAccel: number,
  accelCorrection: number
) => number;

/**
 * A function which transforms a power target correction calculated by a speed controller.
 * @param correction The raw power target correction.
 * @param iasError The target airspeed error, in knots. Positive values indicate the target airspeed is greater than
 * the airplane's effective airspeed.
 * @param targetIas The target indicated airspeed, in knots.
 * @param effectiveIas The airplane's effective indicated airspeed, in knots. The effective airspeed value is reported
 * after smoothing and lookahead (if they are specified for airspeed data) have been applied.
 * @returns The transformed power target correction.
 */
export type AutothrottlePowerCorrectionTransformer = (
  correction: number,
  iasError: number,
  targetIas: number,
  effectiveIas: number
) => number;

/**
 * Options for the autothrottle latch function.
 */
export type AutothrottleLatchOptions = {
  /**
   * The commanded throttle position adjustment speed, in units of normalized position per second, at or below which
   * will allow a throttle to become latched. A negative value will disable latching entirely. Defaults to `-1`.
   */
  latchThreshold?: number;

  /**
   * The consecutive amount of time, in seconds, that the conditions for latching a throttle must be met before the
   * throttle becomes latched. Defaults to `0`.
   */
  latchDebounce?: number;

  /**
   * The commanded throttle position adjustment speed, in units of normalized position per second, at or above which
   * will allow a throttle to become unlatched from a latched state. This value will be clamped to be greater than or
   * equal to `latchThreshold`. Defaults to `0`.
   */
  unlatchThreshold?: number;

  /**
   * The consecutive amount of time, in seconds, that the conditions for unlatching a throttle must be met before the
   * throttle becomes unlatched. Defaults to `0`.
   */
  unlatchDebounce?: number;
};

/**
 * Options used to initialize an autothrottle.
 */
export type AutothrottleOptions = {
  /**
   * Whether the autothrottle should use mach number calculated from the impact pressure derived from indicated
   * airspeed and ambient pressure instead of the true mach number. Defaults to `false`.
   */
  useIndicatedMach?: boolean;

  /**
   * The rate at which the autothrottle's servos moves throttle levers, in units of normalized position per second.
   * One normalized throttle position is equal to the distance traversed by the throttle from the idle position to
   * the max thrust position.
   */
  servoSpeed: number | Accessible<number>;

  /**
   * The smoothing time constant, in seconds, to use to smooth airspeed data. A value of zero is equivalent to no
   * smoothing.
   */
  speedSmoothingConstant: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth estimated airspeed velocity (i.e. acceleration) while
   * smoothing airspeed data. A value of zero is equivalent to no smoothing. If not defined, estimated airspeed
   * velocity will not be used to adjust smoothed airspeed data.
   */
  speedSmoothingVelocityConstant?: number;

  /**
   * The lookahead time, in seconds, to use for airspeed data. If less than or equal to zero, the autothrottle will
   * use the current (smoothed) airspeed. If greater than zero, the autothrottle will use the (smoothed) airspeed trend
   * projected into the future by amount of time equal to the lookahead.
   */
  speedLookahead: number | Subscribable<number>;

  /**
   * The smoothing time constant, in seconds, to use to smooth lookahead airspeed data. A value of zero is equivalent
   * to no smoothing. If not defined, defaults to the value of `speedSmoothingConstant`.
   */
  speedLookaheadSmoothingConstant?: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth estimated lookahead airspeed velocity (i.e.
   * acceleration) while smoothing lookahead airspeed data. A value of zero is equivalent to no smoothing. If not
   * defined, estimated lookahead airspeed velocity will not be used to adjust smoothed lookahead airspeed data.
   * Defaults to the value of `speedSmoothingVelocityConstant`.
   */
  speedLookaheadSmoothingVelocityConstant?: number;

  /**
   * A function which generates an acceleration target, in knots per second, from a given selected airspeed error. If
   * not defined, then the speed controller will directly target selected airspeed instead of acceleration.
   */
  selectedSpeedAccelTarget?: AutothrottleAccelTargetFunc;

  /**
   * A function which generates an acceleration target, in knots per second, from a given overspeed protection airspeed
   * error. Defaults to the function specified for `selectedSpeedAccelTarget`.
   */
  overspeedAccelTarget?: AutothrottleAccelTargetFunc;

  /**
   * A function which generates an acceleration target, in knots per second, from a given underspeed protection
   * airspeed error. Defaults to the function specified for `selectedSpeedAccelTarget`.
   */
  underspeedAccelTarget?: AutothrottleAccelTargetFunc;

  /**
   * The smoothing time constant, in seconds, to use to smooth observed acceleration used by the speed controller to
   * generate error terms when targeting acceleration. A value of zero is equivalent to no smoothing.
   */
  accelSmoothingConstant?: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth estimated acceleration velocity while smoothing observed
   * acceleration. A value of zero is equivalent to no smoothing. If not defined, estimated acceleration velocity will
   * not be used to adjust smoothed observed acceleration.
   */
  accelSmoothingVelocityConstant?: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth acceleration targets commanded by the speed controller.
   * A value of zero is equivalent to no smoothing. Defaults to `0`.
   */
  accelTargetSmoothingConstant?: number;

  /**
   * A function which transforms a power target correction calculated by the selected speed controller. If not defined,
   * then the identity transformation is used.
   */
  selectedSpeedPowerCorrectionTransformer?: AutothrottlePowerCorrectionTransformer;

  /**
   * A function which transforms a power target correction calculated by the overspeed protection speed controller.
   * Defaults to the function specified for `selectedSpeedPowerCorrectionTransformer`.
   */
  overspeedPowerCorrectionTransformer?: AutothrottlePowerCorrectionTransformer;

  /**
   * A function which transforms a power target correction calculated by the underspeed protection speed controller.
   * Defaults to the function specified for `selectedSpeedPowerCorrectionTransformer`.
   */
  underspeedPowerCorrectionTransformer?: AutothrottlePowerCorrectionTransformer;

  /**
   * The smoothing time constant, in seconds, to use to smooth engine power data. A value of zero is equivalent to no
   * smoothing.
   */
  powerSmoothingConstant: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth estimated power velocity while smoothing engine power
   * data. A value of zero is equivalent to no smoothing. If not defined, estimated power velocity will not be used to
   * adjust smoothed engine power data.
   */
  powerSmoothingVelocityConstant?: number;

  /**
   * The lookahead time, in seconds, to use for engine power data. If less than or equal to zero, the autothrottle will
   * use the current (smoothed) engine power. If greater than zero, the autothrottle will use the (smoothed) engine
   * power trend projected into the future by amount of time equal to the lookahead.
   */
  powerLookahead: number | Subscribable<number>;

  /**
   * The smoothing time constant, in seconds, to use to smooth lookahead engine power data. A value of zero is
   * equivalent to no smoothing. If not defined, defaults to the value of `powerSmoothingConstant`.
   */
  powerLookaheadSmoothingConstant?: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth estimated power velocity while smoothing lookahead
   * engine power data. A value of zero is equivalent to no smoothing. If not defined, estimated power velocity will
   * not be used to adjust smoothed lookahead engine power data. If not defined, defaults to the value of
   * `powerSmoothingVelocityConstant`.
   */
  powerLookaheadSmoothingVelocityConstant?: number;

  /**
   * Parameters for the target speed PID controller. The input of the PID is either indicated airspeed error (in knots)
   * if the speed controller is directly targeting airspeed or acceleration error (in knots per second) if the speed
   * controller is targeting acceleration. The output of the PID is an engine power adjustment.
   */
  speedTargetPid: AutothrottlePidParams;

  /**
   * Parameters for the target power PID controller. The input of the PID is engine power error. The output of the PID
   * is a throttle position adjustment speed, in units of normalized position per second.
   */
  powerTargetPid: AutothrottlePidParams;

  /**
   * The smoothing time constant, in seconds, to use to smooth power targets commanded by the speed controller. A value
   * of zero is equivalent to no smoothing.
   */
  powerTargetSmoothingConstant: number;

  /**
   * The smoothing time constant, in seconds, to use to smooth throttle position adjustment speeds commanded by the
   * power controllers. A value of zero is equivalent to no smoothing. Smoothing is not applied when throttle lever
   * position targeting is active (unless the targeted throttle position is overridden by speed or power protection).
   * Defaults to `0`.
   */
  throttleSpeedSmoothingConstant?: number;

  /**
   * Options for the latch function. A throttle can be latched if the commanded position adjustment speed for the
   * throttle remains less than a specified threshold for a period of time. The autothrottle will not move a latched
   * throttle. Once latched, the throttle is unlatched when the commanded position adjustment speed exceeds another
   * threshold. Latching is disabled when throttle lever position targeting is active (unless the targeted throttle
   * position is overridden by speed or power protection).
   */
  latchOptions?: Readonly<AutothrottleLatchOptions>;

  /**
   * The amount of hysteresis to apply to throttle position adjustment speeds commanded by the autothrottle's power
   * controller, in units of normalized position per second. The autothrottle will ignore position adjustment speed
   * commands of magnitude less than or equal to this value if it would reverse the direction of the most recent
   * command that was carried out.
   */
  hysteresis: number;

  /**
   * Parameters for the overspeed protection PID controller. Defaults to the same parameters as the target speed PID
   * controller.
   */
  overspeedPid?: AutothrottlePidParams;

  /**
   * Parameters for the underspeed protection PID controller. Defaults to the same parameters as the target speed PID
   * controller.
   */
  underspeedPid?: AutothrottlePidParams;

  /**
   * Parameters for the overpower protection PID controller. Defaults to the same parameters as the target power PID
   * controller.
   */
  overpowerPid?: AutothrottlePidParams;

  /**
   * The threshold, in knots per second, such that if the rate of change of the speed target exceeds the threshold, the
   * speed target PID controller will ignore any contribution to the derivative term from the changing speed target.
   * This threshold is meant to prevent instantaneous changes in the speed target from unduly influencing the PID
   * output. Defaults to infinity.
   */
  speedTargetChangeThreshold?: number;

  /**
   * The threshold, in knots per second, such that if the rate of change of the overspeed protection limit exceeds the
   * threshold, the overspeed protection PID controller will ignore any contribution to the derivative term from the
   * changing limit. This threshold is meant to prevent instantaneous changes in the overspeed protection limit from
   * unduly influencing the PID output. Defaults to infinity.
   */
  overspeedChangeThreshold?: number;

  /**
   * The threshold, in knots per second, such that if the rate of change of the underspeed protection limit exceeds the
   * threshold, the underspeed protection PID controller will ignore any contribution to the derivative term from the
   * changing limit. This threshold is meant to prevent instantaneous changes in the underspeed protection limit from
   * unduly influencing the PID output. Defaults to infinity.
   */
  underspeedChangeThreshold?: number;
};

/**
 * A command issued by an autothrottle speed controller.
 */
export type SpeedCommand = {
  /** The engine power commanded by the selected speed controller. */
  selectedSpeedPowerTarget: number | undefined;

  /** The engine power commanded by the overspeed protection controller. */
  overspeedProtPowerTarget: number | undefined;

  /** The engine power commanded by the underspeed protection controller. */
  underspeedProtPowerTarget: number | undefined;

  /** Whether the airplane is currently in overspeed. */
  isOverspeed: boolean;

  /** Whether the airplane is current in underspeed. */
  isUnderspeed: boolean;
};

/**
 * A command issued by an autothrottle power controller.
 */
export type PowerCommand = {
  /** The commanded throttle position adjustment speed. */
  speed: number | undefined;

  /** The commanded throttle position. */
  targetPos: number | undefined;

  /** Whether overspeed protection is engaged. */
  isOverspeedProtEngaged: boolean;

  /** Whether underspeed protection is engaged. */
  isUnderspeedProtEngaged: boolean;

  /** Whether overpower protection is engaged. */
  isOverpowerProtEngaged: boolean;
};

/**
 * A record of an autothrottle speed target.
 */
export class AutothrottleSpeedTargetRecord {
  /** The target indicated airspeed, in knots, or `null` if there is no targeted indicated airspeed. */
  public ias: number | null = null;

  /** The target mach number, or `null` if there is no targeted mach number. */
  public mach: number | null = null;

  /** The conversion factor from mach number to indicated airspeed (knots), or `null` if the factor is unavailable. */
  public machToKias: number | null = null;

  /**
   * Copies this record from another one.
   * @param other The record to copy from.
   */
  public copyFrom(other: AutothrottleSpeedTargetRecord): void {
    this.ias = other.ias;
    this.mach = other.mach;
    this.machToKias = other.machToKias;
  }

  /**
   * Resets this record. All properties will be set to `null`.
   */
  public reset(): void {
    this.ias = null;
    this.mach = null;
    this.machToKias = null;
  }
}

/** The current autothrottle envelope protection state used to determine when to publish an autothrottle command */
interface AtEnvelopeProtectionState {
  /** Whether overspeed protection is engaged. */
  isOverspeedProtEngaged: boolean;

  /** Whether underspeed protection is engaged. */
  isUnderspeedProtEngaged: boolean;
}

/**
 * An abstract implementation of an autothrottle system.
 *
 * The system contains a global speed controller and one power controller for each engine throttle. The speed
 * controller commands a synced engine power target for all throttles based on over/underspeed protection and the
 * selected speed target, if active. Each power controller commands a position for its individual throttle based on
 * overpower protection and power target, either from the speed controller or the selected power target, if active.
 */
export abstract class AbstractAutothrottle {
  protected static readonly ALL_THROTTLE_INDEXES = [1, 2, 3, 4] as const;

  protected readonly publisher = this.bus.getPublisher<AutothrottleEvents>();

  protected readonly useIndicatedMach: boolean;

  protected readonly airspeedIndex: Subscribable<number>;
  protected airspeedSimVar!: string;

  protected readonly throttles: AutothrottleThrottle[];

  protected readonly isOverspeedProtActive = Subject.create(false);
  protected readonly isUnderspeedProtActive = Subject.create(false);
  protected readonly isOverpowerProtActive = Subject.create(false);

  protected readonly targetMode = Subject.create(AutothrottleTargetMode.None);

  protected readonly selectedSpeedIsMach = Subject.create(false);
  protected readonly selectedIas = Subject.create(0);
  protected readonly selectedMach = Subject.create(0);
  protected readonly selectedPower = Subject.create(0);
  protected readonly selectedThrottlePos = Subject.create(0);

  protected readonly maxIas = Subject.create(0);
  protected readonly minIas = Subject.create(0);
  protected readonly maxMach = Subject.create(0);
  protected readonly minMach = Subject.create(0);
  protected readonly maxPower = Subject.create(0);

  protected readonly maxThrottlePos = Subject.create(1);
  protected readonly minThrottlePos = Subject.create(0);

  protected readonly machToKiasSmoother: ExpSmoother;

  protected readonly iasLookahead: Subscribable<number>;
  protected readonly iasSmoother: MultiExpSmoother;
  protected readonly lookaheadIasSmoother: MultiExpSmoother;
  protected lastIasLookahead: number;
  protected lastSmoothedIas: number | undefined = undefined;

  protected readonly shouldTargetAccel: boolean;

  protected readonly selectedSpeedAccelTargetFunc?: AutothrottleAccelTargetFunc;
  protected readonly overspeedAccelTargetFunc?: AutothrottleAccelTargetFunc;
  protected readonly underspeedAccelTargetFunc?: AutothrottleAccelTargetFunc;

  protected readonly accelSmoother?: MultiExpSmoother;

  protected readonly selectedSpeedAccelCorrectionSmoother?: MultiExpSmoother;
  protected readonly overspeedAccelCorrectionSmoother?: MultiExpSmoother;
  protected readonly underspeedAccelCorrectionSmoother?: MultiExpSmoother;

  protected readonly selectedSpeedAccelTargetSmoother?: ExpSmoother;
  protected readonly overspeedProtAccelTargetSmoother?: ExpSmoother;
  protected readonly underspeedProtAccelTargetSmoother?: ExpSmoother;

  protected readonly selectedSpeedPowerCorrectionTransformer: AutothrottlePowerCorrectionTransformer;
  protected readonly overspeedPowerCorrectionTransformer: AutothrottlePowerCorrectionTransformer;
  protected readonly underspeedPowerCorrectionTransformer: AutothrottlePowerCorrectionTransformer;

  protected readonly powerLookahead: Subscribable<number>;

  protected readonly selectedSpeedPid: PidController;
  protected readonly overspeedPid: PidController;
  protected readonly underspeedPid: PidController;
  protected readonly selectedPowerPids: Record<AutothrottleThrottleIndex, PidController>;
  protected readonly overpowerPids: Record<AutothrottleThrottleIndex, PidController>;

  protected readonly throttleSpeedSmoothers: Record<AutothrottleThrottleIndex, ExpSmoother>;

  protected readonly speedTargetChangeThreshold: number;
  protected readonly overspeedChangeThreshold: number;
  protected readonly underspeedChangeThreshold: number;

  protected readonly selectedSpeedTarget = new AutothrottleSpeedTargetRecord();
  protected readonly overspeedSpeedTarget = new AutothrottleSpeedTargetRecord();
  protected readonly underspeedSpeedTarget = new AutothrottleSpeedTargetRecord();

  protected readonly prevSelectedSpeedTarget = new AutothrottleSpeedTargetRecord();
  protected readonly prevOverspeedSpeedTarget = new AutothrottleSpeedTargetRecord();
  protected readonly prevUnderspeedSpeedTarget = new AutothrottleSpeedTargetRecord();

  protected readonly selectedSpeedPowerTargetSmoother: ExpSmoother;
  protected readonly overspeedProtPowerTargetSmoother: ExpSmoother;
  protected readonly underspeedProtPowerTargetSmoother: ExpSmoother;

  protected readonly latchOptions: Readonly<Required<AutothrottleLatchOptions>>;
  protected readonly latchRecord: Record<AutothrottleThrottleIndex, number>;

  protected readonly hysteresis: number;
  protected readonly hysteresisRecord: Record<AutothrottleThrottleIndex, number>;

  private readonly realTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('realTime'), 0);
  private updateTimer: NodeJS.Timeout | null = null;
  private lastUpdateTime = 0;
  private readonly updateHandler = this.update.bind(this);

  protected readonly speedCommand: SpeedCommand = {
    selectedSpeedPowerTarget: undefined,
    overspeedProtPowerTarget: undefined,
    underspeedProtPowerTarget: undefined,
    isOverspeed: false,
    isUnderspeed: false
  };
  protected readonly powerCommand: PowerCommand = {
    speed: undefined,
    targetPos: undefined,
    isOverspeedProtEngaged: false,
    isUnderspeedProtEngaged: false,
    isOverpowerProtEngaged: false
  };

  private readonly prevProtectionStates: AtEnvelopeProtectionState = {
    isOverspeedProtEngaged: false,
    isUnderspeedProtEngaged: false
  };

  protected isAlive = true;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param airspeedIndex The index of the sim airspeed indicator from which this autothrottle should source airspeed
   * data.
   * @param throttleInfos Information on the throttles controlled by this autothrottle. Each entry in the array should
   * describe a single unique throttle. Order does not matter.
   * @param options Options with which to initialize this autothrottle.
   * @param throttleLeverManager The throttle lever manager to use to request position changes for virtual throttle
   * levers. If not defined, position changes for virtual throttle levers will be requested using key events
   * (specifically the `THROTTLE[N]_SET` event).
   */
  public constructor(
    private readonly bus: EventBus,
    airspeedIndex: number | Subscribable<number>,
    throttleInfos: readonly Readonly<AutothrottleThrottleInfo>[],
    options: AutothrottleOptions,
    throttleLeverManager?: ThrottleLeverManager
  ) {
    this.useIndicatedMach = options.useIndicatedMach ?? false;

    this.airspeedIndex = SubscribableUtils.toSubscribable(airspeedIndex, true);
    this.airspeedIndex.sub(index => { this.airspeedSimVar = `AIRSPEED INDICATED:${index}`; }, true);

    this.powerLookahead = SubscribableUtils.toSubscribable(options.powerLookahead, true);
    this.throttles = throttleInfos.map(info => {
      return this.createThrottle(
        bus,
        info,
        options.servoSpeed,
        options.powerSmoothingConstant,
        options.powerSmoothingVelocityConstant,
        this.powerLookahead,
        options.powerLookaheadSmoothingConstant,
        options.powerLookaheadSmoothingVelocityConstant,
        throttleLeverManager
      );
    });

    this.machToKiasSmoother = new ExpSmoother(options.speedSmoothingConstant);

    this.iasLookahead = SubscribableUtils.toSubscribable(options.speedLookahead, true);
    this.iasSmoother = new MultiExpSmoother(options.speedSmoothingConstant, options.speedSmoothingVelocityConstant);
    this.lookaheadIasSmoother = new MultiExpSmoother(
      options.speedLookaheadSmoothingConstant ?? options.speedSmoothingConstant,
      options.speedLookaheadSmoothingVelocityConstant ?? options.speedSmoothingVelocityConstant
    );

    this.lastIasLookahead = this.iasLookahead.get();

    this.shouldTargetAccel = options.selectedSpeedAccelTarget !== undefined;
    this.selectedSpeedAccelTargetFunc = options.selectedSpeedAccelTarget;
    this.overspeedAccelTargetFunc = options.overspeedAccelTarget ?? options.selectedSpeedAccelTarget;
    this.underspeedAccelTargetFunc = options.underspeedAccelTarget ?? options.selectedSpeedAccelTarget;

    if (this.shouldTargetAccel) {
      const accelSmoothingConstant = options.accelSmoothingConstant ?? 0;

      this.accelSmoother = new MultiExpSmoother(accelSmoothingConstant, options.accelSmoothingVelocityConstant);

      this.selectedSpeedAccelCorrectionSmoother = new MultiExpSmoother(accelSmoothingConstant, options.accelSmoothingVelocityConstant);
      this.overspeedAccelCorrectionSmoother = new MultiExpSmoother(accelSmoothingConstant, options.accelSmoothingVelocityConstant);
      this.underspeedAccelCorrectionSmoother = new MultiExpSmoother(accelSmoothingConstant, options.accelSmoothingVelocityConstant);

      const accelTargetTau = options.accelTargetSmoothingConstant ?? 0;
      this.selectedSpeedAccelTargetSmoother = new ExpSmoother(accelTargetTau);
      this.overspeedProtAccelTargetSmoother = new ExpSmoother(accelTargetTau);
      this.underspeedProtAccelTargetSmoother = new ExpSmoother(accelTargetTau);
    }

    this.selectedSpeedPid = AbstractAutothrottle.createPidFromParams(options.speedTargetPid);
    this.overspeedPid = AbstractAutothrottle.createPidFromParams(options.overspeedPid ?? options.speedTargetPid);
    this.underspeedPid = AbstractAutothrottle.createPidFromParams(options.underspeedPid ?? options.speedTargetPid);

    this.selectedPowerPids = {} as Record<AutothrottleThrottleIndex, PidController>;
    this.overpowerPids = {} as Record<AutothrottleThrottleIndex, PidController>;

    this.throttleSpeedSmoothers = {} as Record<AutothrottleThrottleIndex, ExpSmoother>;

    this.speedTargetChangeThreshold = options.speedTargetChangeThreshold ?? Infinity;
    this.overspeedChangeThreshold = options.overspeedChangeThreshold ?? Infinity;
    this.underspeedChangeThreshold = options.underspeedChangeThreshold ?? Infinity;

    this.selectedSpeedPowerTargetSmoother = new ExpSmoother(options.powerTargetSmoothingConstant);
    this.overspeedProtPowerTargetSmoother = new ExpSmoother(options.powerTargetSmoothingConstant);
    this.underspeedProtPowerTargetSmoother = new ExpSmoother(options.powerTargetSmoothingConstant);

    this.selectedSpeedPowerCorrectionTransformer = options.selectedSpeedPowerCorrectionTransformer ?? AbstractAutothrottle.defaultPowerCorrectionTransformer;
    this.overspeedPowerCorrectionTransformer = options.overspeedPowerCorrectionTransformer ?? this.selectedSpeedPowerCorrectionTransformer;
    this.underspeedPowerCorrectionTransformer = options.underspeedPowerCorrectionTransformer ?? this.selectedSpeedPowerCorrectionTransformer;

    const latchOptions = {
      ...options.latchOptions
    };
    latchOptions.latchThreshold ??= -1;
    latchOptions.latchDebounce ??= 0;
    latchOptions.unlatchThreshold = Math.max(latchOptions.unlatchThreshold ?? 0, latchOptions.latchThreshold);
    latchOptions.unlatchDebounce ??= 0;
    this.latchOptions = latchOptions as Required<AutothrottleLatchOptions>;
    this.latchRecord = {} as Record<AutothrottleThrottleIndex, number>;

    this.hysteresis = Math.max(0, options.hysteresis);
    this.hysteresisRecord = {} as Record<AutothrottleThrottleIndex, number>;

    for (const index of AbstractAutothrottle.ALL_THROTTLE_INDEXES) {
      this.selectedPowerPids[index] = AbstractAutothrottle.createPidFromParams(options.powerTargetPid);
      this.overpowerPids[index] = AbstractAutothrottle.createPidFromParams(options.overpowerPid ?? options.powerTargetPid);

      this.throttleSpeedSmoothers[index] = new ExpSmoother(options.throttleSpeedSmoothingConstant ?? 0);

      this.latchRecord[index] = 0;
      this.hysteresisRecord[index] = 0;
    }

    // Publish data

    this.publisher.pub('at_master_is_active', false, true, true);

    this.isOverspeedProtActive.sub(val => this.publisher.pub('at_overspeed_prot_is_active', val, true, true), true);
    this.isUnderspeedProtActive.sub(val => this.publisher.pub('at_underspeed_prot_is_active', val, true, true), true);
    this.isOverpowerProtActive.sub(val => this.publisher.pub('at_overpower_prot_is_active', val, true, true), true);
    this.targetMode.sub(val => this.publisher.pub('at_target_mode', val, true, true), true);
    this.selectedIas.sub(val => this.publisher.pub('at_selected_ias', val, true, true), true);
    this.selectedMach.sub(val => this.publisher.pub('at_selected_mach', val, true, true), true);
    this.selectedSpeedIsMach.sub(val => this.publisher.pub('at_selected_speed_is_mach', val, true, true), true);
    this.selectedPower.sub(val => this.publisher.pub('at_selected_power', val, true, true), true);
    this.selectedThrottlePos.sub(val => this.publisher.pub('at_selected_throttle_pos', val, true, true), true);
    this.maxIas.sub(val => this.publisher.pub('at_max_ias', val, true, true), true);
    this.maxMach.sub(val => this.publisher.pub('at_max_mach', val, true, true), true);
    this.minIas.sub(val => this.publisher.pub('at_min_ias', val, true, true), true);
    this.minMach.sub(val => this.publisher.pub('at_min_mach', val, true, true), true);
    this.maxPower.sub(val => this.publisher.pub('at_max_power', val, true, true), true);
    this.maxThrottlePos.sub(val => this.publisher.pub('at_max_throttle_pos', val, true, true), true);
    this.minThrottlePos.sub(val => this.publisher.pub('at_min_throttle_pos', val, true, true), true);

    this.publisher.pub('at_overspeed_prot_is_engaged', false, true);
    this.publisher.pub('at_underspeed_prot_is_engaged', false, true);
  }

  /**
   * Creates a throttle controlled by this autothrottle system.
   * @param bus The event bus.
   * @param info Information describing the throttle to create.
   * @param servoSpeed The speed delivered by the servo controlling the throttle, in units of normalized position per
   * second.
   * @param powerSmoothingConstant The smoothing time constant, in seconds, to use to smooth engine power data.
   * @param powerSmoothingVelocityConstant The smoothing time constant, in seconds, to use to smooth estimated power
   * velocity while smoothing engine power data. A value of zero is equivalent to no smoothing. If not defined,
   * estimated power velocity will not be used to adjust smoothed engine power data.
   * @param powerLookahead The lookahead time, in seconds, to use for engine power data.
   * @param powerLookaheadSmoothingConstant The smoothing time constant, in seconds, to use to smooth lookahead engine
   * power data. If not defined, defaults to the value of {@linkcode powerSmoothingConstant}.
   * @param powerLookaheadSmoothingVelocityConstant The smoothing time constant, in seconds, to use to smooth estimated
   * power velocity while smoothing lookahead engine power data. A value of zero is equivalent to no smoothing. If not
   * defined, estimated power velocity will not be used to adjust smoothed lookahead engine power data. If not defined,
   * defaults to the value of {@linkcode powerSmoothingVelocityConstant}.
   * @param throttleLeverManager The throttle lever manager to use to request position changes for the throttle's
   * lever.
   * @returns A new throttle controlled by this autothrottle system.
   */
  protected abstract createThrottle(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number | Accessible<number>,
    powerSmoothingConstant: number,
    powerSmoothingVelocityConstant: number | undefined,
    powerLookahead: Subscribable<number>,
    powerLookaheadSmoothingConstant: number | undefined,
    powerLookaheadSmoothingVelocityConstant: number | undefined,
    throttleLeverManager: ThrottleLeverManager | undefined
  ): AutothrottleThrottle;

  /**
   * Sets whether this autothrottle's overspeed protection is active.
   * @param val Whether overspeed protection is active.
   */
  public setOverspeedProtActive(val: boolean): void {
    this.isOverspeedProtActive.set(val);
  }

  /**
   * Sets whether this autothrottle's underspeed protection is active.
   * @param val Whether underspeed protection is active.
   */
  public setUnderspeedProtActive(val: boolean): void {
    this.isUnderspeedProtActive.set(val);
  }

  /**
   * Sets whether this autothrottle's overpower protection is active.
   * @param val Whether overpower protection is active.
   */
  public setOverpowerProtActive(val: boolean): void {
    this.isOverpowerProtActive.set(val);
  }

  /**
   * Sets this autothrottle's target mode.
   * @param mode A target mode.
   */
  public setTargetMode(mode: AutothrottleTargetMode): void {
    this.targetMode.set(mode);
  }

  /**
   * Sets whether this autothrottle's selected speed target is a mach number.
   * @param val Whether the selected speed target is a mach number.
   */
  public setSelectedSpeedIsMach(val: boolean): void {
    this.selectedSpeedIsMach.set(val);
  }

  /**
   * Sets this autothrottle's selected indicated airspeed target, in knots.
   * @param ias An indicated airspeed, in knots.
   */
  public setSelectedIas(ias: number): void {
    this.selectedIas.set(ias);
  }

  /**
   * Sets this autothrottle's selected mach number target.
   * @param mach A mach number.
   */
  public setSelectedMach(mach: number): void {
    this.selectedMach.set(mach);
  }

  /**
   * Sets this autothrottle's selected engine power target.
   * @param power An engine power value.
   */
  public setSelectedPower(power: number): void {
    this.selectedPower.set(power);
  }

  /**
   * Sets this autothrottle's selected normalized throttle lever position target.
   * @param pos A normalized throttle lever position.
   */
  public setSelectedThrottlePos(pos: number): void {
    this.selectedThrottlePos.set(pos);
  }

  /**
   * Sets this autothrottle's maximum allowed indicated airspeed, in knots.
   * @param ias An indicated airspeed, in knots.
   */
  public setMaxIas(ias: number): void {
    this.maxIas.set(ias);
  }

  /**
   * Sets this autothrottle's minimum allowed indicated airspeed, in knots.
   * @param ias An indicated airspeed, in knots.
   */
  public setMinIas(ias: number): void {
    this.minIas.set(ias);
  }

  /**
   * Sets this autothrottle's maximum allowed mach number.
   * @param mach A mach number.
   */
  public setMaxMach(mach: number): void {
    this.maxMach.set(mach);
  }

  /**
   * Sets this autothrottle's minimum allowed mach number.
   * @param mach A mach number.
   */
  public setMinMach(mach: number): void {
    this.minMach.set(mach);
  }

  /**
   * Sets this autothrottle's maximum allowed engine power.
   * @param power An engine power value.
   */
  public setMaxPower(power: number): void {
    this.maxPower.set(power);
  }

  /**
   * Sets this autothrottle's maximum allowed normalized throttle lever position.
   * @param pos A normalized throttle lever position.
   */
  public setMaxThrottlePos(pos: number): void {
    this.maxThrottlePos.set(pos);
  }

  /**
   * Sets this autothrottle's minimum allowed normalized throttle lever position.
   * @param pos A normalized throttle lever position.
   */
  public setMinThrottlePos(pos: number): void {
    this.minThrottlePos.set(pos);
  }

  /**
   * Sets whether one of this autothrottle's throttle servos are active.
   * @param index The index of the throttle servo to activate/deactivate.
   * @param active Whether the servo should be activated.
   */
  public setServoActive(index: AutothrottleThrottleIndex, active: boolean): void {
    const throttle = this.throttles.find(query => query.index === index);
    if (throttle !== undefined) {
      throttle.isServoActive = active;
    }
  }

  /**
   * Turns this autothrottle on with a specified update frequency. If this autothrottle is already running, then it
   * will be turned off before turning on again with the specified frequency.
   * @param frequency The frequency, in hertz, at which this autothrottle will update.
   * @throws Error if this autothrottle has been destroyed.
   */
  public start(frequency: number): void {
    if (!this.isAlive) {
      throw new Error('AbstractAutothrottle: cannot start a dead autothrottle');
    }

    this.stop();

    this.publisher.pub('at_master_is_active', true, true, true);

    this.updateTimer = setInterval(this.updateHandler, 1000 / frequency);
  }

  /**
   * Turns this autothrottle off.
   * @throws Error if this autothrottle has been destroyed.
   */
  public stop(): void {
    if (!this.isAlive) {
      throw new Error('AbstractAutothrottle: cannot stop a dead autothrottle');
    }

    if (this.updateTimer === null) {
      return;
    }

    clearInterval(this.updateTimer);
    this.updateTimer = null;

    this.machToKiasSmoother.reset();

    this.iasSmoother.reset();
    this.lookaheadIasSmoother.reset();
    this.lastSmoothedIas = undefined;

    this.accelSmoother?.reset();
    this.selectedSpeedAccelCorrectionSmoother?.reset();
    this.overspeedAccelCorrectionSmoother?.reset();
    this.underspeedAccelCorrectionSmoother?.reset();

    this.selectedSpeedAccelTargetSmoother?.reset();
    this.overspeedProtAccelTargetSmoother?.reset();
    this.underspeedProtAccelTargetSmoother?.reset();

    this.selectedSpeedPid.reset();
    this.overspeedPid.reset();
    this.underspeedPid.reset();

    this.prevSelectedSpeedTarget.reset();
    this.prevOverspeedSpeedTarget.reset();
    this.prevUnderspeedSpeedTarget.reset();

    this.selectedSpeedPowerTargetSmoother.reset();
    this.overspeedProtPowerTargetSmoother.reset();
    this.underspeedProtPowerTargetSmoother.reset();

    for (let i = 0; i < this.throttles.length; i++) {
      this.throttles[i].resetPowerSmoothing();
    }

    for (const index of AbstractAutothrottle.ALL_THROTTLE_INDEXES) {
      this.selectedPowerPids[index].reset();
      this.overpowerPids[index].reset();
      this.throttleSpeedSmoothers[index].reset();
      this.latchRecord[index] = 0;
      this.hysteresisRecord[index] = 0;
    }

    this.publisher.pub('at_master_is_active', false, true, true);
  }

  /**
   * Updates this autothrottle.
   */
  protected update(): void {
    const realTime = Date.now();

    const dt = (realTime - this.lastUpdateTime) / 1000;

    this.lastUpdateTime = realTime;

    // This shouldn't really ever happen, but just in case...
    if (dt <= 0) {
      return;
    }

    // Check if the current time has diverged from the event bus value by more than 1 second.
    // If it has, we are probably paused in the menu and should skip the update.
    if (realTime - this.realTime.get() >= 1000) {
      return;
    }

    // Update power and position of all throttles
    for (let i = 0; i < this.throttles.length; i++) {
      this.throttles[i].update(dt);
    }

    const targetMode = this.targetMode.get();

    // Obtain power target (if any) commanded by the speed controller.
    const speedCommand = this.calculateSpeedTargetPower(dt, this.speedCommand);

    const isOverpowerProtActive = this.isOverpowerProtActive.get();
    const isPowerTargetActive = targetMode === AutothrottleTargetMode.Power;
    const isThrottlePosTargetActive = targetMode === AutothrottleTargetMode.ThrottlePos;

    const minThrottlePos = this.minThrottlePos.get();
    const maxThrottlePos = this.maxThrottlePos.get();

    let isUnderspeedProtEngaged = false;
    let isOverspeedProtEngaged = false;
    for (let i = 0; i < this.throttles.length; i++) {
      const throttle = this.throttles[i];

      if (throttle.isServoActive) {
        // Obtain throttle position adjustment commanded by the power controller.
        const powerCommand = this.calculatePowerTargetThrottlePos(
          throttle,
          speedCommand,
          isOverpowerProtActive,
          isPowerTargetActive,
          isThrottlePosTargetActive,
          dt,
          this.powerCommand
        );

        let targetPos = powerCommand.targetPos;
        let speed = powerCommand.speed;

        const isThrottlePosOob = throttle.normPosition < minThrottlePos || throttle.normPosition > maxThrottlePos;
        const isTargetPosOob = targetPos !== undefined && (targetPos < minThrottlePos || targetPos > maxThrottlePos);

        if (isTargetPosOob) {
          // If the commanded throttle lever position is out of bounds, clamp it to within bounds.

          targetPos = MathUtils.clamp(targetPos!, minThrottlePos, maxThrottlePos);
          speed = (targetPos - throttle.normPosition) / dt;
        } else if (isThrottlePosOob && targetPos === undefined) {
          // If there is no commanded throttle lever position but the current throttle lever position is out of
          // bounds, command the throttle lever to move back in bounds.

          targetPos = MathUtils.clamp(throttle.normPosition, minThrottlePos, maxThrottlePos);
          speed = (targetPos - throttle.normPosition) / dt;
        }

        if (targetPos !== undefined && speed !== undefined) {
          let shouldDriveThrottle = true;

          // Check throttle latch.
          if (
            (
              !isThrottlePosTargetActive
              || powerCommand.isOverpowerProtEngaged
              || powerCommand.isOverspeedProtEngaged
              || powerCommand.isUnderspeedProtEngaged
            )
            && powerCommand.speed !== undefined
            && this.latchOptions.latchThreshold >= 0
          ) {
            if (this.latchRecord[throttle.index] < this.latchOptions.latchDebounce) {
              // The throttle is not latched. Check if the throttle lever position is not out of bounds and the
              // difference between the position and the commanded position does not exceed the latch threshold. If so,
              // then increment the latch timer. Otherwise, reset the latch timer.

              if (!isThrottlePosOob && Math.abs(powerCommand.speed) <= this.latchOptions.latchThreshold) {
                this.latchRecord[throttle.index] = Math.min(this.latchRecord[throttle.index] + dt, this.latchOptions.latchDebounce);
              } else {
                this.latchRecord[throttle.index] = 0;
              }
            } else {
              // The throttle is latched. Check if the throttle lever position is out of bounds or if the difference
              // between the position and the commanded position has exceeded the unlatch threshold for the required
              // debounce delay. If so, then unlatch the throttle. Otherwise, prevent the throttle lever from moving.

              if (isThrottlePosOob) {
                this.latchRecord[throttle.index] = 0;
              } else if (Math.abs(powerCommand.speed) >= this.latchOptions.unlatchThreshold) {
                if ((this.latchRecord[throttle.index] += dt) >= this.latchOptions.latchDebounce + this.latchOptions.unlatchDebounce) {
                  this.latchRecord[throttle.index] = 0;
                } else {
                  shouldDriveThrottle = false;
                }
              } else {
                this.latchRecord[throttle.index] = this.latchOptions.latchDebounce;
                shouldDriveThrottle = false;
              }
            }
          }

          if (shouldDriveThrottle) {
            // Check hysteresis, unless the current throttle position is out of bounds, in which case we always want to
            // move the throttle back in bounds.
            const lastCommandedSpeed = this.hysteresisRecord[throttle.index];
            if (
              isThrottlePosOob
              || lastCommandedSpeed === 0
              || Math.sign(lastCommandedSpeed) === Math.sign(speed)
              || Math.abs(speed) > this.hysteresis
            ) {
              this.hysteresisRecord[throttle.index] = speed;
            } else {
              shouldDriveThrottle = false;
            }

            if (shouldDriveThrottle) {
              throttle.drive(targetPos, dt);
            }
          } else {
            this.hysteresisRecord[throttle.index] = 0;
          }
        } else {
          this.latchRecord[throttle.index] = 0;
          this.hysteresisRecord[throttle.index] = 0;
        }

        if (powerCommand.isOverspeedProtEngaged) {
          isOverspeedProtEngaged = true;
        } else if (powerCommand.isUnderspeedProtEngaged) {
          isUnderspeedProtEngaged = true;
        }
      } else {
        this.selectedPowerPids[throttle.index].reset();
        this.overpowerPids[throttle.index].reset();
        this.throttleSpeedSmoothers[throttle.index].reset();
        this.hysteresisRecord[throttle.index] = 0;
        this.latchRecord[throttle.index] = 0;
      }
    }

    if (isOverspeedProtEngaged !== this.prevProtectionStates.isOverspeedProtEngaged) {
      this.publisher.pub('at_overspeed_prot_is_engaged', isOverspeedProtEngaged, true);
      this.prevProtectionStates.isOverspeedProtEngaged = isOverspeedProtEngaged;
    }
    if (isUnderspeedProtEngaged !== this.prevProtectionStates.isUnderspeedProtEngaged) {
      this.publisher.pub('at_underspeed_prot_is_engaged', isUnderspeedProtEngaged, true);
      this.prevProtectionStates.isUnderspeedProtEngaged = isUnderspeedProtEngaged;
    }
  }

  /**
   * Calculates the engine power for all throttles commanded by this autothrottle's speed controller. The speed
   * controller incorporates the speed target and over-/under-speed protection if active.
   * @param dt The elapsed time since the last update.
   * @param out The object to which to write the results.
   * @returns The engine power for all throttles commanded by this autothrottle's speed controller.
   */
  protected calculateSpeedTargetPower(dt: number, out: SpeedCommand): SpeedCommand {
    out.selectedSpeedPowerTarget = undefined;
    out.overspeedProtPowerTarget = undefined;
    out.underspeedProtPowerTarget = undefined;
    out.isOverspeed = false;
    out.isUnderspeed = false;

    const pressure = SimVar.GetSimVarValue('AMBIENT PRESSURE', SimVarValueType.HPA);
    const ias = SimVar.GetSimVarValue(this.airspeedSimVar, SimVarValueType.Knots);

    let currentMachToKias: number;
    if (this.useIndicatedMach) {
      if (ias > 1) {
        const iasMps = UnitType.KNOT.convertTo(ias, UnitType.MPS);
        currentMachToKias = ias / AeroMath.casToMach(iasMps, pressure);
      } else {
        currentMachToKias = 1 / AeroMath.casToMach(1, pressure);
      }
    } else {
      const mach = SimVar.GetSimVarValue('AIRSPEED MACH', SimVarValueType.Mach);
      currentMachToKias = ias > 1 && mach > 0 ? ias / mach : 1 / AeroMath.casToMach(1, pressure);
    }

    const machToKias = this.machToKiasSmoother.next(isFinite(currentMachToKias) ? currentMachToKias : 1, dt);

    const lookahead = Math.max(0, this.iasLookahead.get());
    const smoothedIas = this.iasSmoother.next(ias, dt);

    if (lookahead !== this.lastIasLookahead) {
      this.lookaheadIasSmoother.reset();
      this.lastIasLookahead = lookahead;
    }

    let effectiveIas: number;

    const deltaIas = smoothedIas - (this.lastSmoothedIas === undefined ? smoothedIas : this.lastSmoothedIas);

    if (lookahead > 0 && this.lastSmoothedIas !== undefined) {
      // Somehow, NaN values can creep in here. So we will make sure if that happens we don't leave the system in an
      // unrecoverable state by resetting the smoother when the last smoothed value is NaN.
      const last = this.lookaheadIasSmoother.last();
      effectiveIas = last === null || isFinite(last)
        ? this.lookaheadIasSmoother.next(ias + deltaIas * lookahead / dt, dt)
        : this.lookaheadIasSmoother.reset(ias + deltaIas * lookahead / dt);
    } else {
      effectiveIas = smoothedIas;
    }

    this.lastSmoothedIas = smoothedIas;

    let prevEffectiveAccel: number | null = null;
    let effectiveAccel = 0;

    if (this.shouldTargetAccel) {
      prevEffectiveAccel = this.accelSmoother!.last();
      effectiveAccel = this.accelSmoother!.next(deltaIas / dt, dt);
    }

    const isTargetSpeed = this.targetMode.get() === AutothrottleTargetMode.Speed;
    const isOverspeedProtActive = this.isOverspeedProtActive.get();
    const isUnderspeedProtActive = this.isUnderspeedProtActive.get();

    let overspeedProtDelta: number | undefined;
    let underspeedProtDelta: number | undefined;
    let selectedSpeedDelta: number | undefined;

    if (isOverspeedProtActive) {
      this.overspeedSpeedTarget.ias = this.maxIas.get();
      this.overspeedSpeedTarget.mach = this.maxMach.get();
      this.overspeedSpeedTarget.machToKias = machToKias;

      if (this.shouldTargetAccel) {
        overspeedProtDelta = this.updateAccelTargetPid(
          this.overspeedPid,
          this.overspeedAccelTargetFunc!,
          this.overspeedAccelCorrectionSmoother!,
          this.overspeedProtAccelTargetSmoother!,
          this.overspeedPowerCorrectionTransformer,
          effectiveAccel,
          prevEffectiveAccel,
          effectiveIas,
          this.overspeedSpeedTarget,
          this.prevOverspeedSpeedTarget,
          false,
          dt,
          this.overspeedChangeThreshold
        );
      } else {
        overspeedProtDelta = this.updateSpeedTargetPid(
          this.overspeedPid,
          this.overspeedPowerCorrectionTransformer,
          effectiveIas,
          this.overspeedSpeedTarget,
          this.prevOverspeedSpeedTarget,
          false,
          dt,
          this.overspeedChangeThreshold
        );
      }

      out.isOverspeed = effectiveIas > Math.min(this.overspeedSpeedTarget.mach * machToKias, this.overspeedSpeedTarget.ias);
      this.prevOverspeedSpeedTarget.copyFrom(this.overspeedSpeedTarget);
    } else {
      this.overspeedPid.reset();
      this.overspeedAccelCorrectionSmoother?.reset();
      this.overspeedProtAccelTargetSmoother?.reset();
      this.prevOverspeedSpeedTarget.reset();
    }

    if (isUnderspeedProtActive) {
      this.underspeedSpeedTarget.ias = this.minIas.get();
      this.underspeedSpeedTarget.mach = this.minMach.get();
      this.underspeedSpeedTarget.machToKias = machToKias;

      if (this.shouldTargetAccel) {
        underspeedProtDelta = this.updateAccelTargetPid(
          this.underspeedPid,
          this.underspeedAccelTargetFunc!,
          this.underspeedAccelCorrectionSmoother!,
          this.underspeedProtAccelTargetSmoother!,
          this.underspeedPowerCorrectionTransformer,
          effectiveAccel,
          prevEffectiveAccel,
          effectiveIas,
          this.underspeedSpeedTarget,
          this.prevUnderspeedSpeedTarget,
          true,
          dt,
          this.underspeedChangeThreshold
        );
      } else {
        underspeedProtDelta = this.updateSpeedTargetPid(
          this.underspeedPid,
          this.underspeedPowerCorrectionTransformer,
          effectiveIas,
          this.underspeedSpeedTarget,
          this.prevUnderspeedSpeedTarget,
          true,
          dt,
          this.underspeedChangeThreshold
        );
      }

      out.isUnderspeed = effectiveIas < Math.max(this.underspeedSpeedTarget.mach * machToKias, this.underspeedSpeedTarget.ias);
      this.prevUnderspeedSpeedTarget.copyFrom(this.underspeedSpeedTarget);
    } else {
      this.underspeedPid.reset();
      this.underspeedAccelCorrectionSmoother?.reset();
      this.underspeedProtAccelTargetSmoother?.reset();
      this.underspeedSpeedTarget.reset();
    }

    if (isTargetSpeed) {
      // Targeting speed

      if (this.selectedSpeedIsMach.get()) {
        this.selectedSpeedTarget.ias = null;
        this.selectedSpeedTarget.mach = this.selectedMach.get();
      } else {
        this.selectedSpeedTarget.ias = this.selectedIas.get();
        this.selectedSpeedTarget.mach = null;
      }

      this.selectedSpeedTarget.machToKias = machToKias;

      if (this.shouldTargetAccel) {
        selectedSpeedDelta = this.updateAccelTargetPid(
          this.selectedSpeedPid,
          this.selectedSpeedAccelTargetFunc!,
          this.selectedSpeedAccelCorrectionSmoother!,
          this.selectedSpeedAccelTargetSmoother!,
          this.selectedSpeedPowerCorrectionTransformer,
          effectiveAccel,
          prevEffectiveAccel,
          effectiveIas,
          this.selectedSpeedTarget,
          this.prevSelectedSpeedTarget,
          false,
          dt,
          this.speedTargetChangeThreshold
        );
      } else {
        selectedSpeedDelta = this.updateSpeedTargetPid(
          this.selectedSpeedPid,
          this.selectedSpeedPowerCorrectionTransformer,
          effectiveIas,
          this.selectedSpeedTarget,
          this.prevSelectedSpeedTarget,
          false,
          dt,
          this.speedTargetChangeThreshold
        );
      }

      this.prevSelectedSpeedTarget.copyFrom(this.selectedSpeedTarget);
    } else {
      this.selectedSpeedPid.reset();
      this.selectedSpeedAccelCorrectionSmoother?.reset();
      this.selectedSpeedAccelTargetSmoother?.reset();
      this.prevSelectedSpeedTarget.reset();
    }

    let throttlePowerSum = 0;
    let throttlePowerCount = 0;
    for (let i = 0; i < this.throttles.length; i++) {
      const throttle = this.throttles[i];
      if (throttle.isServoActive) {
        throttlePowerSum += throttle.effectivePower;
        throttlePowerCount++;
      }
    }

    if (throttlePowerCount === 0) {
      this.overspeedProtPowerTargetSmoother.reset();
      this.underspeedProtPowerTargetSmoother.reset();
      this.selectedSpeedPowerTargetSmoother.reset();
      return out;
    }

    if (selectedSpeedDelta !== undefined) {
      out.selectedSpeedPowerTarget = this.selectedSpeedPowerTargetSmoother.next(throttlePowerSum / throttlePowerCount + selectedSpeedDelta, dt);
    } else {
      this.selectedSpeedPowerTargetSmoother.reset();
    }
    if (overspeedProtDelta !== undefined) {
      out.overspeedProtPowerTarget = this.overspeedProtPowerTargetSmoother.next(throttlePowerSum / throttlePowerCount + overspeedProtDelta, dt);
    } else {
      this.overspeedProtPowerTargetSmoother.reset();
    }
    if (underspeedProtDelta !== undefined) {
      out.underspeedProtPowerTarget = this.underspeedProtPowerTargetSmoother.next(throttlePowerSum / throttlePowerCount + underspeedProtDelta, dt);
    } else {
      this.underspeedProtPowerTargetSmoother.reset();
    }

    return out;
  }

  /**
   * Updates a speed PID controller when directly targeting airspeed.
   * @param pid The PID controller to update.
   * @param correctionTransformer A function which transforms the power target correction calculated by the speed PID
   * controller.
   * @param effectiveIas The airplane's current effective indicated airspeed, in knots.
   * @param currentSpeedTarget The current target speed.
   * @param prevSpeedTarget The target speed during the previous update.
   * @param useMaxSpeed If `true`, then the greater of the target indicated airspeed or target mach will be used if
   * both are defined. If `false`, then the lesser of the target indicated airspeed or target mach will be used if both
   * are defined.
   * @param dt The elapsed time since the last update, in seconds.
   * @param targetChangeThreshold The threshold, in knots per second, such that if the rate of change of the target
   * speed exceeds the threshold, the PID controller will ignore any contribution to the derivative term from the
   * changing target speed.
   * @returns The output of the speed PID controller.
   */
  private updateSpeedTargetPid(
    pid: PidController,
    correctionTransformer: AutothrottlePowerCorrectionTransformer,
    effectiveIas: number,
    currentSpeedTarget: AutothrottleSpeedTargetRecord,
    prevSpeedTarget: AutothrottleSpeedTargetRecord,
    useMaxSpeed: boolean,
    dt: number,
    targetChangeThreshold: number
  ): number {
    const targetSpeedFunc = useMaxSpeed ? Math.max : Math.min;
    const currentTargetIas = targetSpeedFunc(currentSpeedTarget.ias ?? Infinity, (currentSpeedTarget.mach ?? Infinity) * currentSpeedTarget.machToKias!);
    const error = currentTargetIas - effectiveIas;

    // Cancel out any derivative term contributed by changes in the target speed.
    const prevTargetIasAtCurrentUpdate = targetSpeedFunc(prevSpeedTarget.ias ?? Infinity, (prevSpeedTarget.mach ?? Infinity) * currentSpeedTarget.machToKias!);
    if (isFinite(prevTargetIasAtCurrentUpdate)) {
      const targetIasDelta = currentTargetIas - prevTargetIasAtCurrentUpdate;
      const lastError = pid.getPreviousError();
      if (lastError !== undefined && Math.abs(targetIasDelta / dt) >= targetChangeThreshold) {
        pid.getOutput(0, lastError + targetIasDelta);
      }
    }

    return correctionTransformer(pid.getOutput(dt, error), error, currentTargetIas, effectiveIas);
  }

  /**
   * Updates a speed PID controller when targeting acceleration.
   * @param pid The PID controller to update.
   * @param accelTargetFunc A function which generates an acceleration to target, in knots per second, for a given
   * airspeed error.
   * @param accelCorrectionSmoother The smoother to use to smooth the target acceleration correction.
   * @param accelTargetSmoother The smoother to use to smooth the target acceleration.
   * @param correctionTransformer A function which transforms the power target correction calculated by the speed PID
   * controller.
   * @param effectiveAccel The airplane's effective indicated acceleration, in knots per second.
   * @param prevEffectiveAccel The airplane's effective indicated acceleration during the previous update, in knots per
   * second.
   * @param effectiveIas The airplane's current effective indicated airspeed, in knots.
   * @param currentSpeedTarget The current target speed.
   * @param prevSpeedTarget The target speed during the previous update.
   * @param useMaxSpeed If `true`, then the greater of the target indicated airspeed or target mach will be used if
   * both are defined. If `false`, then the lesser of the target indicated airspeed or target mach will be used if both
   * are defined.
   * @param dt The elapsed time since the last update, in seconds.
   * @param targetChangeThreshold The threshold, in knots per second, such that if the rate of change of the target
   * speed exceeds the threshold, the PID controller will ignore any contribution to the derivative term from the
   * changing target speed.
   * @returns The output of the speed PID controller.
   */
  private updateAccelTargetPid(
    pid: PidController,
    accelTargetFunc: AutothrottleAccelTargetFunc,
    accelCorrectionSmoother: MultiExpSmoother,
    accelTargetSmoother: ExpSmoother,
    correctionTransformer: AutothrottlePowerCorrectionTransformer,
    effectiveAccel: number,
    prevEffectiveAccel: number | null,
    effectiveIas: number,
    currentSpeedTarget: AutothrottleSpeedTargetRecord,
    prevSpeedTarget: AutothrottleSpeedTargetRecord,
    useMaxSpeed: boolean,
    dt: number,
    targetChangeThreshold: number
  ): number {
    const targetSpeedFunc = useMaxSpeed ? Math.max : Math.min;
    const currentTargetIas = targetSpeedFunc(currentSpeedTarget.ias ?? Infinity, (currentSpeedTarget.mach ?? Infinity) * currentSpeedTarget.machToKias!);

    // Correct for any change in target IAS due to changing conditions (e.g. target IAS will increase or decrease with
    // static pressure if derived from a constant targeted mach).
    let accelCorrection = 0;
    if (prevSpeedTarget.machToKias !== null) {
      const currentTargetIasAtPrevUpdate = targetSpeedFunc(currentSpeedTarget.ias ?? Infinity, (currentSpeedTarget.mach ?? Infinity) * prevSpeedTarget.machToKias);
      accelCorrection = accelCorrectionSmoother.next((currentTargetIas - currentTargetIasAtPrevUpdate) / dt, dt);
    } else {
      accelCorrectionSmoother.reset();
    }

    const iasError = currentTargetIas - effectiveIas;
    const targetAccel = accelTargetSmoother.next(accelTargetFunc(iasError, currentTargetIas, effectiveIas, effectiveAccel, accelCorrection), dt);

    // Cancel out any derivative term contributed by changes in the target speed.
    if (prevEffectiveAccel !== null && pid.getPreviousError() !== undefined) {
      const prevTargetIasAtCurrentUpdate = targetSpeedFunc(prevSpeedTarget.ias ?? Infinity, (prevSpeedTarget.mach ?? Infinity) * currentSpeedTarget.machToKias!);
      if (isFinite(prevTargetIasAtCurrentUpdate)) {
        const targetIasDelta = currentTargetIas - prevTargetIasAtCurrentUpdate;
        if (Math.abs(targetIasDelta / dt) >= targetChangeThreshold) {
          pid.getOutput(0, targetAccel - prevEffectiveAccel);
        }
      }
    }

    const error = targetAccel - effectiveAccel;
    return correctionTransformer(pid.getOutput(dt, error), iasError, currentTargetIas, effectiveIas);
  }

  /**
   * Calculates the throttle position for a specific throttle commanded by this autothrottle's power controller. The
   * power controller incorporates the power target if active and overpower protection.
   * @param throttle The throttle for which to calculate commanded throttle position.
   * @param speedCommand The engine power commanded by this autothrottle's speed controller.
   * @param isOverpowerProtActive Whether overpower protection is active.
   * @param isPowerTargetActive Whether power target is active.
   * @param isThrottlePosTargetActive Whether throttle lever position target is active.
   * @param dt The elapsed time since the last update.
   * @param out The object to which to write the results.
   * @returns The throttle position for the specified throttle commanded by this autothrottle's power controller.
   */
  protected calculatePowerTargetThrottlePos(
    throttle: AutothrottleThrottle,
    speedCommand: SpeedCommand,
    isOverpowerProtActive: boolean,
    isPowerTargetActive: boolean,
    isThrottlePosTargetActive: boolean,
    dt: number,
    out: PowerCommand
  ): PowerCommand {
    out.speed = undefined;
    out.targetPos = undefined;
    out.isOverspeedProtEngaged = false;
    out.isUnderspeedProtEngaged = false;
    out.isOverpowerProtEngaged = false;

    const targetPid = this.selectedPowerPids[throttle.index];
    const overpowerPid = this.overpowerPids[throttle.index];

    const power = throttle.power;
    const effectivePower = throttle.effectivePower;

    let overpowerProtDelta: number | undefined;
    let isOverpower = false;

    if (isOverpowerProtActive) {
      const maxPower = this.maxPower.get();
      overpowerProtDelta = overpowerPid.getOutput(dt, maxPower - effectivePower);
      isOverpower = power > maxPower;
    } else {
      overpowerPid.reset();
    }

    let targetDelta: number | undefined;
    let delta: number | undefined;

    let isUsingOverspeedProtCommand = false;
    let isUsingUnderspeedProtCommand = false;
    let isUsingOverpowerProtCommand = false;

    let powerTarget: number | undefined;
    if (isPowerTargetActive) {
      powerTarget = this.selectedPower.get();
    } else {
      powerTarget = speedCommand.selectedSpeedPowerTarget;
    }

    let selectedThrottlePositionPowerTargetDelta: number | undefined;
    if (isThrottlePosTargetActive) {
      const selectedTarget = this.selectedThrottlePos.get();
      const servoSpeed = throttle.servoSpeed.get();
      selectedThrottlePositionPowerTargetDelta = MathUtils.clamp((selectedTarget - throttle.normPosition) / dt, -servoSpeed, servoSpeed);
    }

    if (powerTarget === undefined) {
      // The autothrottle is not targeting selected speed or selected power. Engage over/underspeed protection if the
      // airplane is currently over/underspeeding and the protection is attempting to reduce power (overspeed)
      // increase power (underspeed). If neither protection can be engaged in this way, then check if a selected
      // throttle position is being targeted. If so, then engage over/underspeed protection if either is active (with
      // arbitrary preference for overspeed protection). Selected throttle position will get a chance to "override" the
      // protection further down in this method.

      if (
        speedCommand.overspeedProtPowerTarget !== undefined
        && speedCommand.isOverspeed
        && speedCommand.overspeedProtPowerTarget < effectivePower
      ) {
        isUsingOverspeedProtCommand = true;
      } else if (
        speedCommand.underspeedProtPowerTarget !== undefined
        && speedCommand.isUnderspeed
        && speedCommand.underspeedProtPowerTarget > effectivePower
      ) {
        isUsingUnderspeedProtCommand = true;
      } else if (selectedThrottlePositionPowerTargetDelta !== undefined) {
        if (speedCommand.overspeedProtPowerTarget !== undefined) {
          isUsingOverspeedProtCommand = true;
        } else if (speedCommand.underspeedProtPowerTarget !== undefined) {
          isUsingUnderspeedProtCommand = true;
        }
      }

      if (isUsingOverspeedProtCommand) {
        powerTarget = speedCommand.overspeedProtPowerTarget;
      } else if (isUsingUnderspeedProtCommand) {
        powerTarget = speedCommand.underspeedProtPowerTarget;
      }
    } else {
      // The autothrottle is targeting a selected speed or selected power. Engage over/underspeed protection if the
      // protection is commanding a power target less than (overspeed) or greater than (underspeed) that commanded by
      // the selected speed or selected power controller.

      if (speedCommand.overspeedProtPowerTarget !== undefined && speedCommand.overspeedProtPowerTarget < powerTarget) {
        powerTarget = speedCommand.overspeedProtPowerTarget;
        isUsingOverspeedProtCommand = true;
      } else if (speedCommand.underspeedProtPowerTarget !== undefined && speedCommand.underspeedProtPowerTarget > powerTarget) {
        powerTarget = speedCommand.underspeedProtPowerTarget;
        isUsingUnderspeedProtCommand = true;
      }
    }

    if (powerTarget !== undefined) {
      // Targeting power
      targetDelta = targetPid.getOutput(dt, powerTarget - effectivePower);
    } else {
      targetPid.reset();
    }

    if (targetDelta === undefined) {
      // No power target is defined. Engage overpower protection if the airplane is currently in an overpower condition
      // and the protection is attempting to reduce power OR if a selected throttle position is being targeted.
      // Selected throttle position will get a chance to "override" the protection further down in this method.

      if (overpowerProtDelta !== undefined && (isThrottlePosTargetActive || (isOverpower && overpowerProtDelta < 0))) {
        delta = overpowerProtDelta;
        isUsingOverpowerProtCommand = true;
      }
    } else {
      // A power target is defined. Engage overpower protection if the protection is targeting a lower power than the
      // existing power target.

      if (overpowerProtDelta !== undefined && overpowerProtDelta < targetDelta) {
        delta = overpowerProtDelta;
        isUsingOverpowerProtCommand = true;
      } else {
        delta = targetDelta;
      }
    }

    if (delta !== undefined) {
      delta = this.throttleSpeedSmoothers[throttle.index].next(delta, dt);
    } else {
      this.throttleSpeedSmoothers[throttle.index].reset();
    }

    if (selectedThrottlePositionPowerTargetDelta !== undefined) {
      // Override the throttle adjustment commanded by the power controller with the adjustment commanded by the
      // selected throttle position if...
      if (
        // ... the power controller is not commanding any adjustment
        delta === undefined
        // ... OR overspeed or overpower protection is engaged but the adjustment required to move toward the selected
        // throttle position would reduce throttle *lower* than that commanded by the power controller
        || ((isUsingOverspeedProtCommand || isUsingOverpowerProtCommand) && selectedThrottlePositionPowerTargetDelta < delta)
        // ... OR underspeed protection is engaged but the adjustment required to move toward the selected throttle
        // position would increase throttle *higher* than that commanded by the power controller
        || (isUsingUnderspeedProtCommand && selectedThrottlePositionPowerTargetDelta > delta)
      ) {
        delta = selectedThrottlePositionPowerTargetDelta;
        isUsingOverspeedProtCommand = false;
        isUsingUnderspeedProtCommand = false;
        isUsingOverpowerProtCommand = false;
      }
    }

    if (delta === undefined) {
      return out;
    }

    out.speed = delta;
    out.targetPos = throttle.normPosition + delta * dt;
    out.isOverspeedProtEngaged = isUsingOverspeedProtCommand;
    out.isUnderspeedProtEngaged = isUsingUnderspeedProtCommand;
    out.isOverpowerProtEngaged = isUsingOverpowerProtCommand;

    return out;
  }

  /**
   * Destroys this autothrottle.
   */
  public destroy(): void {
    this.isAlive = false;

    this.stop();

    this.realTime.destroy();

    this.throttles.forEach(throttle => { throttle.destroy(); });
  }

  /**
   * Creates a PID controller using a given set of parameters.
   * @param params A set of PID parameters.
   * @returns A new PID controller created using the specified parameters.
   */
  protected static createPidFromParams(params: AutothrottlePidParams): PidController {
    return new PidController(params.kP, params.kI, params.kD, params.maxOut, params.minOut, params.maxI, params.minI);
  }

  /**
   * A default transformation function for power target corrections which returns the correction unchanged.
   * @param correction The raw power target correction.
   * @returns The transformed power target correction.
   */
  protected static defaultPowerCorrectionTransformer(correction: number): number {
    return correction;
  }
}

/**
 * A throttle controlled by an autothrottle system.
 */
export abstract class AutothrottleThrottle {
  private static readonly RAW_AXIS_MAX = 16384;

  /** The index of the engine controlled by the throttle. */
  public readonly index: AutothrottleThrottleIndex;

  /** The idle position of this throttle. */
  public readonly idlePosition: number;

  /** The maximum thrust position of this throttle. */
  public readonly maxThrustPosition: number;

  private _position = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /** The current position of this throttle. */
  public get position(): number {
    return this._position;
  }

  private readonly normRange: number;

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The position of this throttle, normalized such that `0` is the idle position and `1` is the maximum thrust
   * position.
   */
  public get normPosition(): number {
    return (this._position - this.idlePosition) / this.normRange;
  }

  private _power = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /** The power delivered by this throttle's engine. */
  public get power(): number {
    return this._power;
  }

  private _effectivePower = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /** The effective power delivered by this throttle's engine, after smoothing and lookahead have been applied. */
  public get effectivePower(): number {
    return this._effectivePower;
  }

  private readonly _isServoActive = Subject.create(false);
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether the autothrottle servo for this throttle is active. */
  public get isServoActive(): boolean {
    return this._isServoActive.get();
  }
  // eslint-disable-next-line jsdoc/require-jsdoc
  public set isServoActive(val: boolean) {
    this._isServoActive.set(val);
  }

  protected keyEventManager?: KeyEventManager;

  private readonly throttlePosSimVar?: string;
  private readonly virtualPos?: ConsumerSubject<number>;
  private readonly getPosition: () => number;

  private readonly throttleSetKVar: string;
  private readonly throttleLeverManager?: ThrottleLeverManager;

  private readonly powerSmoother: MultiExpSmoother;
  private readonly lookaheadPowerSmoother: MultiExpSmoother;
  private lastPowerLookahead = this.powerLookahead.get();
  private lastSmoothedPower: number | undefined = undefined;

  public readonly servoSpeed: Accessible<number>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param info Information describing this throttle.
   * @param servoSpeed The speed delivered by the servo controlling this throttle, in units of normalized position per
   * second.
   * @param powerSmoothingConstant The smoothing time constant, in seconds, to use to smooth engine power data.
   * @param powerSmoothingVelocityConstant The smoothing time constant, in seconds, to use to smooth estimated power
   * velocity while smoothing engine power data. A value of zero is equivalent to no smoothing. If not defined,
   * estimated power velocity will not be used to adjust smoothed engine power data.
   * @param powerLookahead The lookahead time, in seconds, to use for engine power data.
   * @param powerLookaheadSmoothingConstant The smoothing time constant, in seconds, to use to smooth lookahead engine
   * power data. If not defined, defaults to the value of {@linkcode powerSmoothingConstant}.
   * @param powerLookaheadSmoothingVelocityConstant The smoothing time constant, in seconds, to use to smooth estimated
   * power velocity while smoothing lookahead engine power data. A value of zero is equivalent to no smoothing. If not
   * defined, estimated power velocity will not be used to adjust smoothed lookahead engine power data. If not defined,
   * defaults to the value of {@linkcode powerSmoothingVelocityConstant}.
   * @param throttleLeverManager The throttle lever manager to use to request position changes for this throttle's
   * lever. If not defined, position changes for the lever will be requested using key events (specifically the
   * `THROTTLE[N]_SET` event).
   */
  public constructor(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number | Accessible<number>,
    powerSmoothingConstant: number,
    powerSmoothingVelocityConstant: number | undefined,
    private readonly powerLookahead: Subscribable<number>,
    powerLookaheadSmoothingConstant: number | undefined,
    powerLookaheadSmoothingVelocityConstant: number | undefined,
    throttleLeverManager?: ThrottleLeverManager
  ) {
    this.servoSpeed = typeof servoSpeed === 'number' ? Value.create(servoSpeed) : servoSpeed;

    this.initKeyManager(bus);

    ({ index: this.index, idlePosition: this.idlePosition, maxThrustPosition: this.maxThrustPosition } = info);

    if (info.isVirtual) {
      this.virtualPos = ConsumerSubject.create(bus.getSubscriber<VirtualThrottleLeverEvents>().on(`v_throttle_lever_pos_${this.index}`), 0),

        this.getPosition = (): number => {
          return this.virtualPos!.get();
        };
    } else {
      this.throttlePosSimVar = `GENERAL ENG THROTTLE LEVER POSITION:${this.index}`;

      this.getPosition = (): number => {
        return SimVar.GetSimVarValue(this.throttlePosSimVar!, SimVarValueType.Percent) / 100;
      };
    }

    this.normRange = this.maxThrustPosition - this.idlePosition;

    this.throttleSetKVar = `THROTTLE${this.index}_SET`;
    this.throttleLeverManager = info.isVirtual ? throttleLeverManager : undefined;

    const isServoActiveTopic = `at_servo_${this.index}_is_active` as const;
    this._isServoActive.sub(val => { bus.getPublisher<AutothrottleEvents>().pub(isServoActiveTopic, val, true, true); });

    this.powerSmoother = new MultiExpSmoother(powerSmoothingConstant, powerSmoothingVelocityConstant);
    this.lookaheadPowerSmoother = new MultiExpSmoother(
      powerLookaheadSmoothingConstant ?? powerSmoothingConstant,
      powerLookaheadSmoothingVelocityConstant ?? powerSmoothingVelocityConstant
    );
  }

  /**
   * Initializes the key event manager used by this throttle.
   * @param bus The event bus.
   */
  private async initKeyManager(bus: EventBus): Promise<void> {
    this.keyEventManager = await KeyEventManager.getManager(bus);
  }

  /**
   * Updates this throttle's current position and delivered power properties.
   * @param dt The elapsed time since the last update, in seconds.
   */
  public update(dt: number): void {
    this._position = this.getPosition();
    this._power = this.getPower();

    const lookahead = Math.max(0, this.powerLookahead.get());
    const smoothedPower = this.powerSmoother.next(this._power, dt);

    if (lookahead !== this.lastPowerLookahead) {
      this.lookaheadPowerSmoother.reset();
      this.lastPowerLookahead = lookahead;
    }

    if (lookahead > 0 && this.lastSmoothedPower !== undefined) {
      const delta = smoothedPower - this.lastSmoothedPower;
      this._effectivePower = this.lookaheadPowerSmoother.next(this._power + delta * lookahead / dt, dt);
    } else {
      this._effectivePower = smoothedPower;
    }

    this.lastSmoothedPower = smoothedPower;
  }

  /**
   * Gets the power delivered by this throttle's engine.
   * @returns The power delivered by this throttle's engine.
   */
  protected abstract getPower(): number;

  /**
   * Drives this throttle toward a target normalized position over a period of time.
   * @param targetNormPos The target normalized position. Will be clamped to the range `[0, 1]`.
   * @param dt The amount of time over which to drive the throttle, in seconds.
   */
  public drive(targetNormPos: number, dt: number): void {
    const current = this.normPosition;
    const delta = targetNormPos - current;

    if (delta === 0) {
      return;
    }

    const deltaSign = Math.sign(delta);
    const toDrive = Math.min(dt * this.servoSpeed.get(), (targetNormPos - current) * deltaSign) * deltaSign;
    const finalPos = this.idlePosition + (current + toDrive) * this.normRange;

    if (Math.abs(finalPos - this._position) < 0.5 / AutothrottleThrottle.RAW_AXIS_MAX) {
      return;
    }

    if (this.throttleLeverManager !== undefined) {
      this.throttleLeverManager.setThrottleLeverPosRaw(this.index, finalPos * AutothrottleThrottle.RAW_AXIS_MAX);
    } else {
      this.keyEventManager?.triggerKey(
        this.throttleSetKVar,
        false,
        Math.round(finalPos * AutothrottleThrottle.RAW_AXIS_MAX)
      );
    }
  }

  /**
   * Resets this throttle's power smoothing.
   */
  public resetPowerSmoothing(): void {
    this.powerSmoother.reset();
    this.lookaheadPowerSmoother.reset();
    this.lastSmoothedPower = undefined;
  }

  /**
   * Destroys this throttle.
   */
  public destroy(): void {
    this.virtualPos?.destroy();
  }
}
