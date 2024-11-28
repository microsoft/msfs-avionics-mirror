import { EventBus, KeyEventData, KeyEventManager, KeyEvents, MappedSubject, MathUtils, SimVarValueType, Subject, Subscribable } from '@microsoft/msfs-sdk';

/**
 * Data describing control axis forces applied by ESP used by {@link EspControlInputManager}.
 */
export type EspControlInputManagerForceData = {
  /**
   * The force applied to the pitch control axis, scaled such that a force of magnitude one is the amount of force
   * required to deflect the control axis from the neutral position to maximum deflection (on either side). Positive
   * force deflects the control axis to command an increase in pitch angle (i.e. increase downward pitch). If not
   * defined, then the force applied is taken to be zero.
   */
  readonly pitchAxisForce?: Subscribable<number>;

  /**
   * The force applied to the roll control axis, scaled such that a force of magnitude one is the amount of force
   * required to deflect the control axis from the neutral position to maximum deflection (on either side). Positive
   * force deflects the control axis to command an increase in roll angle (i.e. increase leftward roll). If not
   * defined, then the force applied is taken to be zero.
   */
  readonly rollAxisForce?: Subscribable<number>;
};

/**
 * Control axis increment logic options for a {@link EspControlInputManager}.
 */
export type EspControlInputManagerAxisIncrOptions = {
  /**
   * The base amount to increment the input control axis in response to incrementing/decrementing key events, scaled
   * such that `1` equals the amount of travel from the neutral position to maximum deflection (on either side).
   * Defaults to `0.03136` for the pitch axis or `0.06272` for the roll axis.
   */
  baseIncr?: number;

  /**
   * The true airspeed, in knots, at which the input control axis increment is reduced to one half its original value.
   * A value of less than or equal to zero prevents any adjustment of the increment based on true airspeed. Defaults to
   * `0`.
   */
  oneHalfTas?: number;

  /**
   * The true airspeed, in knots, at which the input control axis increment is reduced to one eighth its original
   * value. Will be clamped to be greater than `oneHalfTas`. Defaults to `0`.
   */
  oneEighthTas?: number;

  /**
   * The maximum amount of time, in milliseconds, allowed between two consecutive incrementing/decrementing key events
   * while the associated key is considered to be held down. Defaults to `200`.
   */
  keyReleaseThreshold?: number;

  /**
   * A function that computes a scaling factor to apply to the input control axis increment based on how long the
   * triggering key event's associated key has been held down.
   * @param heldTime The amount of time that the key has been held down, in milliseconds.
   * @returns The scaling factor to apply to the input control axis increment given the specified amount of time the
   * key has been held down.
   */
  keyTimingFactor?: (heldTime: number) => number;

  /**
   * The scaling factor to apply to the input control axis increment when the input control axis position is near the
   * neutral position and the triggering key event's associated key is not considered held down. Defaults to `4`.
   */
  neutralFactor?: number;

  /**
   * The tolerance to use when determing if the input control axis position is near neutral, scaled such that `1`
   * equals the amount of travel from the neutral position to maximum deflection (on either side). Defaults to `0.001`.
   */
  neutralEpsilon?: number;
};

/**
 * Configuration options for {@link EspControlInputManager}.
 */
export type EspControlInputManagerOptions = {
  /** Options for pitch axis increment logic. */
  pitchAxisIncrOptions?: Readonly<EspControlInputManagerAxisIncrOptions>;

  /** Options for roll axis increment logic. */
  rollAxisIncrOptions?: Readonly<EspControlInputManagerAxisIncrOptions>;
};

/**
 * Key timing data.
 */
type KeyTimingData = {
  /**
   * The time at which the most recent key event associated with the key was triggered, as a Javascript timestamp, or
   * `undefined` if the key event has never been triggered.
   */
  lastEventTime: number | undefined;

  /** The amount of time that the key has been held down, in milliseconds, since the last time it was pressed. */
  heldTime: number;
};

/**
 * A manager that adjusts pitch and roll control inputs in response to forces applied by a Garmin ESP system.
 */
export class EspControlInputManager {
  private static readonly AXIS_LIMIT = 16384;

  private keyEventManager?: KeyEventManager;

  private readonly keyEventManagerPromise: Promise<void>;

  private isInit = false;

  private readonly elevatorAxisInput = Subject.create(0);
  private readonly elevatorAxisOutput?: Subscribable<number>;
  private readonly elevatorAxisIncrOptions?: Required<EspControlInputManagerAxisIncrOptions>;

  private readonly aileronAxisInput = Subject.create(0);
  private readonly aileronAxisOutput?: Subscribable<number>;
  private readonly aileronAxisIncrOptions?: Required<EspControlInputManagerAxisIncrOptions>;

  private readonly keyTiming = new Map<string, KeyTimingData>();

  /**
   * Creates a new instance of EspControlInputManager. Once created, the manager must be initialized in order for it to
   * adjust control inputs.
   * @param bus The event bus.
   * @param forceData Data describing control axis forces applied by ESP.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    forceData: EspControlInputManagerForceData,
    options?: Readonly<EspControlInputManagerOptions>
  ) {
    this.keyEventManagerPromise = this.retrieveKeyEventManager();

    if (forceData.pitchAxisForce) {
      this.elevatorAxisOutput = MappedSubject.create(
        EspControlInputManager.mapControlAxis,
        this.elevatorAxisInput,
        forceData.pitchAxisForce
      );

      this.elevatorAxisIncrOptions = { ...options?.pitchAxisIncrOptions } as Required<EspControlInputManagerAxisIncrOptions>;
      this.elevatorAxisIncrOptions.baseIncr ??= 0.64 * 0.049;
      this.elevatorAxisIncrOptions.oneHalfTas ??= 0;
      this.elevatorAxisIncrOptions.oneEighthTas ??= 0;
      this.elevatorAxisIncrOptions.keyReleaseThreshold ??= 200;
      this.elevatorAxisIncrOptions.keyTimingFactor ??= EspControlInputManager.defaultKeyTimingFactor;
      this.elevatorAxisIncrOptions.neutralFactor ??= 4;
      this.elevatorAxisIncrOptions.neutralEpsilon ??= 0.001;
    }
    if (forceData.rollAxisForce) {
      this.aileronAxisOutput = MappedSubject.create(
        EspControlInputManager.mapControlAxis,
        this.aileronAxisInput,
        forceData.rollAxisForce
      );

      this.aileronAxisIncrOptions = { ...options?.rollAxisIncrOptions } as Required<EspControlInputManagerAxisIncrOptions>;
      this.aileronAxisIncrOptions.baseIncr ??= 0.64 * 0.098;
      this.aileronAxisIncrOptions.oneHalfTas ??= 0;
      this.aileronAxisIncrOptions.oneEighthTas ??= 0;
      this.aileronAxisIncrOptions.keyReleaseThreshold ??= 200;
      this.aileronAxisIncrOptions.keyTimingFactor ??= EspControlInputManager.defaultKeyTimingFactor;
      this.aileronAxisIncrOptions.neutralFactor ??= 4;
      this.aileronAxisIncrOptions.neutralEpsilon ??= 0.001;
    }
  }

  /**
   * Retrieves a key event manager.
   * @returns A Promise that is fulfilled when the key event manager has been retrieved.
   */
  private retrieveKeyEventManager(): Promise<void> {
    return KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
    });
  }

  /**
   * Initializes this manager. Once initialized, the manager will automatically adjust pitch and roll control inputs
   * in response to forces applied by ESP.
   */
  public async init(): Promise<void> {
    await this.keyEventManagerPromise;

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (this.elevatorAxisOutput) {
      this.keyEventManager!.interceptKey('AXIS_ELEVATOR_SET', false);
      this.keyEventManager!.interceptKey('ELEVATOR_SET', false);
      this.keyEventManager!.interceptKey('ELEVATOR_DOWN', false);
      this.keyEventManager!.interceptKey('ELEV_DOWN', false);
      this.keyEventManager!.interceptKey('ELEVATOR_UP', false);
      this.keyEventManager!.interceptKey('ELEV_UP', false);

      this.elevatorAxisInput.set(SimVar.GetSimVarValue('ELEVATOR POSITION', SimVarValueType.Position16k));

      this.elevatorAxisOutput.sub(this.onControlAxisOutputChanged.bind(this, 'ELEVATOR_SET'), true);
    }

    if (this.aileronAxisOutput) {
      this.keyEventManager!.interceptKey('AXIS_AILERONS_SET', false);
      this.keyEventManager!.interceptKey('AILERON_SET', false);
      this.keyEventManager!.interceptKey('AILERONS_LEFT', false);
      this.keyEventManager!.interceptKey('AILERON_LEFT', false);
      this.keyEventManager!.interceptKey('AILERONS_RIGHT', false);
      this.keyEventManager!.interceptKey('AILERON_RIGHT', false);
      this.keyEventManager!.interceptKey('CENTER_AILER_RUDDER', false);

      this.aileronAxisInput.set(SimVar.GetSimVarValue('AILERON POSITION', SimVarValueType.Position16k));

      this.aileronAxisOutput.sub(this.onControlAxisOutputChanged.bind(this, 'AILERON_SET'), true);
    }

    if (this.elevatorAxisOutput || this.aileronAxisOutput) {
      this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
    }
  }

  /**
   * Responds to when a control axis output changes.
   * @param keyEvent The key event to trigger to set the position of the output's control axis.
   * @param output The new control axis output.
   */
  private onControlAxisOutputChanged(keyEvent: string, output: number): void {
    // The values for the SET events are NEGATED by the sim.
    this.keyEventManager!.triggerKey(keyEvent, true, -output);
  }

  /**
   * Responds to when a key event is intercepted.
   * @param data Data describing the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      // Elevators
      case 'ELEVATOR_SET':
      case 'AXIS_ELEVATOR_SET':
        if (this.elevatorAxisOutput && data.value0 !== undefined) {
          // The values for the SET events are NEGATED by the sim.
          this.setControlAxisInput(this.elevatorAxisInput, -data.value0);
        }
        break;
      case 'ELEVATOR_DOWN':
      case 'ELEV_DOWN':
        if (this.elevatorAxisOutput) {
          this.changeControlAxisInput(this.elevatorAxisInput, this.elevatorAxisIncrOptions!, data.key, -1);
        }
        break;
      case 'ELEVATOR_UP':
      case 'ELEV_UP':
        if (this.elevatorAxisOutput) {
          this.changeControlAxisInput(this.elevatorAxisInput, this.elevatorAxisIncrOptions!, data.key, 1);
        }
        break;

      // Ailerons
      case 'AILERON_SET':
      case 'AXIS_AILERONS_SET':
        if (this.aileronAxisOutput && data.value0 !== undefined) {
          // The values for the SET events are NEGATED by the sim.
          this.setControlAxisInput(this.aileronAxisInput, -data.value0);
        }
        break;
      case 'AILERONS_LEFT':
      case 'AILERON_LEFT':
        if (this.aileronAxisOutput) {
          this.changeControlAxisInput(this.aileronAxisInput, this.aileronAxisIncrOptions!, data.key, -1);
        }
        break;
      case 'AILERONS_RIGHT':
      case 'AILERON_RIGHT':
        if (this.aileronAxisOutput) {
          this.changeControlAxisInput(this.aileronAxisInput, this.aileronAxisIncrOptions!, data.key, 1);
        }
        break;
      case 'CENTER_AILER_RUDDER':
        if (this.aileronAxisOutput) {
          this.setControlAxisInput(this.aileronAxisInput, 0);
          this.keyEventManager!.triggerKey('RUDDER_SET', false, 0);
        }
        break;
    }
  }

  /**
   * Sets a control axis input.
   * @param input The input to set.
   * @param value The value to set.
   */
  private setControlAxisInput(input: Subject<number>, value: number): void {
    input.set(MathUtils.clamp(value, -EspControlInputManager.AXIS_LIMIT, EspControlInputManager.AXIS_LIMIT));
  }

  /**
   * Changes a control axis input.
   * @param input The input to change.
   * @param incrOptions Increment options for the input's control axis.
   * @param keyEvent The key event that is the source of the change.
   * @param direction The direction in which to change the input.
   */
  private changeControlAxisInput(
    input: Subject<number>,
    incrOptions: Readonly<Required<EspControlInputManagerAxisIncrOptions>>,
    keyEvent: string,
    direction: 1 | -1
  ): void {
    let keyTimingData = this.keyTiming.get(keyEvent);
    if (!keyTimingData) {
      keyTimingData = { lastEventTime: undefined, heldTime: 0 };
      this.keyTiming.set(keyEvent, keyTimingData);
    }

    const time = Date.now();

    if (keyTimingData.lastEventTime !== undefined && time < keyTimingData.lastEventTime) {
      keyTimingData.lastEventTime = undefined;
    }

    if (keyTimingData.lastEventTime !== undefined && time - keyTimingData.lastEventTime <= incrOptions.keyReleaseThreshold) {
      keyTimingData.heldTime += time - keyTimingData.lastEventTime;
    } else {
      keyTimingData.heldTime = 0;
    }

    keyTimingData.lastEventTime = time;

    const currentInput = input.get();

    // The following TAS response code is duplicated from the sim's yoke input handling code.
    let tasResponse = 1;
    if (incrOptions.oneHalfTas > 0) {
      const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots);
      if (tas < incrOptions.oneHalfTas) {
        tasResponse = 1 - 0.5 * tas / incrOptions.oneHalfTas;
      } else if (incrOptions.oneHalfTas < incrOptions.oneEighthTas && tas < incrOptions.oneEighthTas) {
        tasResponse = 0.5 - 0.375 * (tas - incrOptions.oneHalfTas) / (incrOptions.oneEighthTas - incrOptions.oneHalfTas);
      } else {
        tasResponse = 0.125;
      }
    }

    const timingResponse = incrOptions.keyTimingFactor(keyTimingData.heldTime);

    const neutralResponse = keyTimingData.heldTime === 0 && Math.abs(currentInput / EspControlInputManager.AXIS_LIMIT) <= incrOptions.neutralEpsilon
      ? incrOptions.neutralFactor
      : 1;

    const incr = incrOptions.baseIncr * tasResponse * timingResponse * neutralResponse * EspControlInputManager.AXIS_LIMIT;
    this.setControlAxisInput(input, currentInput + direction * incr);
  }

  /**
   * Maps a control axis input and ESP force to an output value.
   * @param param0 The input state to map.
   * @param param0."0" The control axis input.
   * @param param0."1" The ESP force applied to the control axis.
   * @returns The control axis output mapped from the specified input state.
   */
  private static mapControlAxis([input, force]: readonly [number, number]): number {
    const zeroInputPos = -force * EspControlInputManager.AXIS_LIMIT;
    const limit = input < 0 ? -EspControlInputManager.AXIS_LIMIT : EspControlInputManager.AXIS_LIMIT;
    return MathUtils.round(MathUtils.lerp(input, 0, limit, zeroInputPos, limit, true, true));
  }

  /**
   * Uses default logic to compute a scaling factor to apply to the input control axis increment based on how long the
   * triggering key event's associated key has been held down. The returned scaling factor is equal to `4` if the key
   * has been held for at least 1 second, `2` if the key has been held for at least 0.5 seconds, and `1` otherwise.
   * @param heldTime The amount of time that the key has been held down, in milliseconds.
   * @returns The scaling factor to apply to the input control axis increment given the specified amount of time the
   * key has been held down.
   */
  private static defaultKeyTimingFactor(heldTime: number): number {
    // The following is duplicated from the sim's yoke input handling code.
    return heldTime < 500
      ? 1
      : heldTime < 1000 ? 2 : 4;
  }
}
