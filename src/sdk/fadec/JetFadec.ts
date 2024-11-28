import { ConsumerSubject, ConsumerValue, EventBus, IndexedEventType, SimVarValueType } from '../data';
import { ClockEvents } from '../instruments/Clock';
import { MathUtils } from '../math/MathUtils';
import { FadecEvents } from './FadecEvents';

/**
 * A control mode used by a jet FADEC.
 */
export interface JetFadecMode {
  /** The name of this mode. */
  readonly name: string;

  /**
   * Checks whether the FADEC should enter this mode for a specified engine.
   * @param index The index of the engine.
   * @param throttleLeverPos The virtual position of the throttle lever, in the range of -1 to +1.
   * @param throttle The current engine throttle setting, in the range of -1 to +1.
   * @param thrust The current net thrust delivered by the engine, in pounds.
   * @param n1 The current N1 value of the engine, in percent.
   * @param n1Corrected The current corrected N1 value of the engine, in percent.
   * @returns Whether the FADEC should enter this mode for the specified engine.
   */
  accept(index: number, throttleLeverPos: number, throttle: number, thrust: number, n1: number, n1Corrected: number): boolean;

  /**
   * Computes the desired engine throttle setting.
   * @param index The index of the engine.
   * @param throttleLeverPos The virtual position of the throttle lever, in the range of -1 to +1.
   * @param throttle The current engine throttle setting, in the range of -1 to +1.
   * @param thrust The current net thrust delivered by the engine, in pounds.
   * @param n1 The current N1 value of the engine, in percent.
   * @param n1Corrected The current corrected N1 value of the engine, in percent.
   * @param dt The elapsed time since the last FADEC update, in milliseconds.
   * @returns The desired engine throttle setting, in the range of -1 to +1.
   */
  computeDesiredThrottle(index: number, throttleLeverPos: number, throttle: number, thrust: number, n1: number, n1Corrected: number, dt: number): number;

  /**
   * Gets the visible position of the throttle lever for a specified engine.
   * @param index The index of the engine.
   * @param throttleLeverPos The virtual position of the throttle lever, in the range of -1 to +1.
   * @returns The visible position of the throttle lever, in the range of -1 to +1.
   */
  getVisibleThrottlePos(index: number, throttleLeverPos: number): number;
}

/**
 * Information for a throttle controlled by a jet FADEC.
 */
export type JetFadecThrottleInfo = {
  /** The index of the engine controlled by the throttle. */
  index: number;

  /** The event bus topic that emits the throttle's virtual lever position. */
  leverPosTopic: string;

  /** The name of the SimVar controlling the throttle's visible lever position. */
  visiblePosSimVar: string;
};

/**
 * The state of an engine controlled by a jet FADEC.
 */
export type JetFadecEngineState = {
  /** The current engine throttle lever position, in the range of -1 to +1. */
  throttleLeverPos: number;

  /** The current engine throttle setting, in the range of -1 to +1. */
  throttle: number;

  /** The current net thrust delivered by the engine, in pounds. */
  thrust: number;

  /** The current N1 value of the engine, in percent. */
  n1: number;

  /** The current corrected N1 value of the engine, in percent. */
  n1Corrected: number;
}

/**
 * Information for a throttle controlled by a jet FADEC, for internal use.
 */
export type JetFadecThrottleInfoInternal = JetFadecThrottleInfo & {
  /** The name of the throttle's associated engine throttle SimVar. */
  throttleSimVar: string;

  /** The name of the throttle's associated engine thrust SimVar. */
  thrustSimVar: string;

  /** The name of the throttle's associated uncorrected N1 SimVar. */
  n1SimVar: string;

  /** The name of the throttle's associated corrected N1 SimVar. */
  correctedN1SimVar: string;

  /** The event bus topic for the throttle's associated FADEC mode. */
  fadecModeTopic: IndexedEventType<'fadec_mode'>;
};

/**
 * A FADEC for turbojets. Controls engine throttle based on throttle lever position and other inputs.
 */
export class JetFadec {
  // This is pulled from the native sim code. Commonly used when correcting N1.
  protected static readonly MSFS_STANDARD_SEA_LEVEL_TEMP_RANKINE = 518.69;

  protected readonly publisher = this.bus.getPublisher<FadecEvents>();

  protected readonly throttleInfos: readonly JetFadecThrottleInfoInternal[];

  protected readonly throttleLeverPositionValues: readonly ConsumerValue<number>[];

  private readonly updateHandler = this.update.bind(this);
  private readonly realTimeSub = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('realTime'), 0);
  private updateTimer: NodeJS.Timeout | null = null;
  private lastUpdateTime = 0;

  protected readonly engineStates: Record<number, JetFadecEngineState>;

  protected readonly lastModes: (JetFadecMode | null)[];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param modes The modes supported by this FADEC, ordered from highest to lowest priority.
   * @param throttleInfos An array containing information pertaining to the throttles controlled by this FADEC. The
   * order of modes in the array determines their priority during mode selection. On every update cycle, the FADEC
   * iterates through the modes array in order, calling `accept()` on each mode until a value of `true` is returned.
   * Therefore, modes positioned earlier in the array have a higher priority for selection.
   * @param desiredThrottleMin The min value to limit the desiredThrottle by. Defaults to -100.
   * @param desiredThrottleMax The max value to limit the desiredThrottle by. Defaults to 100.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly modes: readonly JetFadecMode[],
    throttleInfos: readonly JetFadecThrottleInfo[],
    protected readonly desiredThrottleMin = -100,
    protected readonly desiredThrottleMax = 100,
  ) {
    this.throttleInfos = throttleInfos.map(info => {
      return {
        ...info,
        throttleSimVar: `GENERAL ENG THROTTLE LEVER POSITION:${info.index}`,
        thrustSimVar: `TURB ENG JET THRUST:${info.index}`,
        n1SimVar: `TURB ENG N1:${info.index}`,
        correctedN1SimVar: `TURB ENG CORRECTED N1:${info.index}`,
        fadecModeTopic: `fadec_mode_${info.index}`
      };
    });
    this.lastModes = this.throttleInfos.map(() => null);

    const sub = this.bus.getSubscriber<any>();

    this.throttleLeverPositionValues = throttleInfos.map(info => {
      return ConsumerValue.create(sub.on(info.leverPosTopic), 0);
    });

    this.engineStates = {};
    for (const throttle of throttleInfos) {
      this.engineStates[throttle.index] = {
        throttleLeverPos: 0,
        throttle: 0,
        thrust: 0,
        n1: 0,
        n1Corrected: 0
      };
    }
  }

  /**
   * Turns this FADEC on. If this FADEC is already running, then it will be turned off before turning on again with
   * the specified frequency.
   * @param frequency The frequency, in hertz, at which this FADEC will update.
   */
  public start(frequency: number): void {
    this.stop();

    this.publisher.pub('fadec_active', true, true, true);

    this.updateTimer = setInterval(this.updateHandler, 1000 / frequency);
  }

  /**
   * Turns this FADEC off.
   */
  public stop(): void {
    if (this.updateTimer === null) {
      return;
    }

    clearInterval(this.updateTimer);
    this.updateTimer = null;

    for (let i = 0; i < this.throttleInfos.length; i++) {
      this.setMode(i, null);
    }

    this.publisher.pub('fadec_active', false, true, true);
  }

  /**
   * Updates this FADEC.
   */
  private update(): void {
    const realTime = Date.now();

    // Check if the current time has diverged from the event bus value by more than 1 second.
    // If it has, we are probably paused in the menu and should skip the update.
    if (realTime - this.realTimeSub.get() >= 1000) {
      return;
    }

    const dt = realTime - this.lastUpdateTime;

    this.onUpdate(dt);

    this.lastUpdateTime = realTime;
  }

  /**
   * A method called when this FADEC is updated.
   * @param dt The elapsed real time, in milliseconds, since the last update.
   */
  protected onUpdate(dt: number): void {
    this.updateEngineStates();
    this.updateThrottles(dt);
  }

  /**
   * Updates the states for this FADEC's engines.
   */
  protected updateEngineStates(): void {
    for (let i = 0; i < this.throttleInfos.length; i++) {
      const info = this.throttleInfos[i];
      const state = this.engineStates[info.index];

      state.throttleLeverPos = this.throttleLeverPositionValues[i].get();
      state.throttle = SimVar.GetSimVarValue(info.throttleSimVar, SimVarValueType.Percent) / 100;
      state.thrust = SimVar.GetSimVarValue(info.thrustSimVar, SimVarValueType.Pounds);
      state.n1 = SimVar.GetSimVarValue(info.n1SimVar, SimVarValueType.Percent);
      state.n1Corrected = SimVar.GetSimVarValue(info.correctedN1SimVar, SimVarValueType.Percent);
    }
  }

  /**
   * Updates this FADEC's engine throttles.
   * @param dt The elapsed real time, in milliseconds, since the last update.
   */
  protected updateThrottles(dt: number): void {
    for (let i = 0; i < this.throttleInfos.length; i++) {
      this.updateThrottle(i, dt);
    }
  }

  /**
   * Updates a throttle.
   * @param index The index of the throttle in this FADEC's throttle list.
   * @param dt The elapsed time, in milliseconds, since the last update.
   */
  protected updateThrottle(index: number, dt: number): void {
    const info = this.throttleInfos[index];
    const { throttleLeverPos, throttle, thrust, n1, n1Corrected } = this.engineStates[info.index];

    // These values are expected to be changed in the for loop below
    let desiredThrottle = throttleLeverPos;
    let visibleThrottlePos = throttleLeverPos;

    for (let i = 0; i < this.modes.length; i++) {
      const mode = this.modes[i];

      if (mode.accept(info.index, throttleLeverPos, throttle, thrust, n1, n1Corrected)) {
        this.setMode(index, mode);
        desiredThrottle = mode.computeDesiredThrottle(info.index, throttleLeverPos, throttle, thrust, n1, n1Corrected, dt);
        visibleThrottlePos = mode.getVisibleThrottlePos(info.index, throttleLeverPos);
        break;
      }
    }

    const clampedThrottle = MathUtils.clamp(desiredThrottle * 100, this.desiredThrottleMin, this.desiredThrottleMax);
    const clampedVisibleThrottlePos = MathUtils.clamp(visibleThrottlePos, -1, 1);

    if (isFinite(clampedThrottle)) {
      SimVar.SetSimVarValue(info.throttleSimVar, SimVarValueType.Percent, clampedThrottle);
    }

    if (isFinite(clampedVisibleThrottlePos)) {
      SimVar.SetSimVarValue(info.visiblePosSimVar, SimVarValueType.Number, clampedVisibleThrottlePos);
    }
  }

  /**
   * Sets a FADEC mode for a throttle.
   * @param index The index of the throttle in this FADEC's throttle list.
   * @param mode The mode to set.
   */
  protected setMode(index: number, mode: JetFadecMode | null): void {
    if (mode === this.lastModes[index]) {
      return;
    }

    this.lastModes[index] = mode;
    this.publisher.pub(this.throttleInfos[index].fadecModeTopic, mode?.name ?? '', true, true);
  }
}