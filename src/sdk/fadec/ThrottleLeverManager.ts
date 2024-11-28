import { ConsumerValue } from '../data/ConsumerValue';
import { EventBus, IndexedEventType } from '../data/EventBus';
import { KeyEventData, KeyEventManager, KeyEvents } from '../data/KeyEventManager';
import { MathUtils } from '../math/MathUtils';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { VirtualThrottleLeverEvents } from './VirtualThrottleLeverEvents';

/**
 * A controller for virtual throttle lever position to be used by handlers of throttle key events.
 */
export interface ThrottleKeyEventHandlerController {
  /**
   * Gets the position of a throttle lever.
   * @param index The index of the throttle lever to get, from 1 to 4, inclusive.
   * @returns The throttle lever position, in the range -1 to +1.
   */
  getThrottleLeverPos(index: number): number;

  /**
   * Sets a raw throttle lever position.
   * @param rawPosition The raw position to set, in the range -16384 to +16384.
   * @param index The index of the throttle lever to set. If undefined, the positions of all throttle levers will be
   * set.
   * @param keyEvent The key event responsible for this change, or `undefined` if this change was not triggered by a
   * key event.
   */
  setRawThrottleLeverPosition(rawPosition: number, index?: number, keyEvent?: string): void;

  /**
   * Changes a raw throttle lever position.
   * @param delta The amount by which to change the raw lever position. The full lever range is expressed as -16384 to
   * +16384.
   * @param index The index of the throttle lever to change. If undefined, the positions of all throttle levers will be
   * changed.
   * @param keyEvent The key event responsible for this change, or `undefined` if this change was not triggered by a
   * key event.
   */
  changeRawThrottleLeverPosition(delta: number, index?: number, keyEvent?: string): void;
}

/**
 * Configuration options for {@link ThrottleLeverManager}.
 */
export type ThrottleLeverManagerOptions = {
  /**
   * The step by which to change throttle lever position in response to one of the increment/decrement events. The full
   * lever range is expressed as -1 to +1. If not defined, then `rawStep` is used instead to define the step.
   */
  step?: number;

  /**
   * The step by which to change throttle lever position in response to one of the small increment/decrement events.
   * The full lever range is expressed as -1 to +1. If not defined, then `rawStepSmall` is used instead to define the
   * small step.
   */
  stepSmall?: number;

  /**
   * The raw step by which to change throttle lever position in response to one of the increment/decrement events. The
   * full lever range is expressed as -16384 to +16384. Ignored if `step` is defined. Defaults to 256.
   */
  rawStep?: number;

  /**
   * The raw step by which to change throttle lever position in response to one of the small increment/decrement
   * events. The full lever range is expressed as -16384 to +16384. Ignored if `step` is defined. Defaults to 128.
   */
  rawStepSmall?: number;

  /**
   * A callback function which handles intercepted throttle key events. If not defined or if the function returns
   * `false`, then the intercepted key event will be handled using default logic that attempts to replicate how the
   * sim natively handles the key event.
   * @param keyEventData The key event data.
   * @param controller A controller for virtual throttle lever position.
   * @returns Whether the event was handled.
   */
  keyEventHandler?: (keyEventData: Readonly<KeyEventData>, controller: ThrottleKeyEventHandlerController) => boolean;

  /**
   * A callback function which handles requested changes to throttle lever position. If not defined, then all requested
   * changes to throttle lever position will be processed as-is.
   * @param index The index of the throttle lever.
   * @param currentPos The current throttle lever position, in the range `[-1, 1]`.
   * @param newPos The requested new throttle lever position, in the range `[-1, 1]`.
   * @param keyEvent The key event that triggered the requested change, or `undefined` if the change was not triggered
   * by a key event.
   * @returns The position to which the throttle lever should be set, in the range `[-1, 1]`.
   */
  throttleLeverHandler?: (index: number, currentPos: number, newPos: number, keyEvent?: string) => number;
};

/**
 * A virtual throttle lever.
 */
type VirtualThrottleLever = {
  /** The index of the lever. */
  index: number;

  /** The event bus topic for the lever's position. */
  topic: IndexedEventType<'v_throttle_lever_pos'>;

  /** The raw position of the lever, from -16384 to +16384. */
  rawPosition: number;
}

/**
 * A manager for virtual throttle levers. Intercepts key events that control engine throttle settings and uses them
 * to move virtual throttle levers instead. The positions of the virtual throttle levers are published on the event
 * bus.
 */
export class ThrottleLeverManager {
  private static readonly THROTTLE_COUNT = 4;

  private static readonly RAW_MAX = 16384;
  private static readonly DEFAULT_RAW_STEP = 256;
  private static readonly DEFAULT_RAW_STEP_SMALL = 128;

  private readonly publisher = this.bus.getPublisher<VirtualThrottleLeverEvents>();

  private keyEventManager?: KeyEventManager;

  private readonly rawStep: number;
  private readonly rawStepSmall: number;

  private readonly throttleLevers: VirtualThrottleLever[];

  private readonly keyEventHandlerController: ThrottleKeyEventHandlerController = {
    getThrottleLeverPos: this.getThrottleLeverPos.bind(this),
    setRawThrottleLeverPosition: this.setRawThrottleLeverPosition.bind(this),
    changeRawThrottleLeverPosition: this.changeRawThrottleLeverPosition.bind(this)
  };
  private readonly keyEventHandler?: (keyEventData: Readonly<KeyEventData>, controller: ThrottleKeyEventHandlerController) => boolean;

  private readonly throttleLeverHandler?: (index: number, currentPos: number, newPos: number, keyEvent?: string) => number;

  private readonly defaultKeyEventHandlers = new Map<string, (keyEventData: Readonly<KeyEventData>) => void>();

  private readonly initPromise: Promise<void>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param onInitCallback A callback function to be executed once this manager is initialized.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    onInitCallback?: () => void,
    options?: Readonly<ThrottleLeverManagerOptions>
  ) {
    this.rawStep = (options?.step !== undefined ? options.step * ThrottleLeverManager.RAW_MAX : options?.rawStep)
      ?? ThrottleLeverManager.DEFAULT_RAW_STEP;
    this.rawStepSmall = (options?.stepSmall !== undefined ? options.stepSmall * ThrottleLeverManager.RAW_MAX : options?.rawStepSmall)
      ?? ThrottleLeverManager.DEFAULT_RAW_STEP_SMALL;

    this.throttleLevers = ArrayUtils.create<VirtualThrottleLever>(ThrottleLeverManager.THROTTLE_COUNT, index => {
      return {
        index: index + 1,
        topic: `v_throttle_lever_pos_${index + 1}`,
        rawPosition: 0
      };
    });

    this.throttleLeverHandler = options?.throttleLeverHandler;
    this.keyEventHandler = options?.keyEventHandler;

    this.initPromise = this.init(onInitCallback);
  }

  /**
   * Initializes this manager. Once initialized, this manager will intercept all throttle key events to move virtual
   * throttle levers and publish the positions of the virtual throttle levers to the event bus.
   * @param onInitCallback A callback function to be executed once this manager is initialized.
   */
  private async init(onInitCallback?: () => void): Promise<void> {
    this.keyEventManager = await KeyEventManager.getManager(this.bus);

    const sub = this.bus.getSubscriber<VirtualThrottleLeverEvents & KeyEvents>();

    const virtualPositions = this.throttleLevers.map(lever => {
      return ConsumerValue.create(sub.on(lever.topic), NaN);
    });

    for (let i = 0; i < this.throttleLevers.length; i++) {
      // Initialize position to the pre-existing virtual lever position, if available. Otherwise, initialize to the
      // engine throttle lever position simvar.
      const lever = this.throttleLevers[i];
      const virtualPosition = virtualPositions[i].get();
      const initialPosition = isNaN(virtualPosition)
        ? MathUtils.clamp(SimVar.GetSimVarValue(`GENERAL ENG THROTTLE LEVER POSITION:${lever.index}`, 'Percent') / 100, 0, 1)
        : virtualPosition;

      virtualPositions[i].destroy();

      this.setRawThrottleLeverPosition(initialPosition * ThrottleLeverManager.RAW_MAX, i + 1);
    }

    // ---- SET EVENTS ----

    this.keyEventManager.interceptKey('AXIS_THROTTLE_SET', false);
    this.keyEventManager.interceptKey('AXIS_THROTTLE1_SET', false);
    this.keyEventManager.interceptKey('AXIS_THROTTLE2_SET', false);
    this.keyEventManager.interceptKey('AXIS_THROTTLE3_SET', false);
    this.keyEventManager.interceptKey('AXIS_THROTTLE4_SET', false);

    this.keyEventManager.interceptKey('THROTTLE_AXIS_SET_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_AXIS_SET_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_AXIS_SET_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_AXIS_SET_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_AXIS_SET_EX1', false);

    this.keyEventManager.interceptKey('THROTTLE_SET', false);
    this.keyEventManager.interceptKey('THROTTLE1_SET', false);
    this.keyEventManager.interceptKey('THROTTLE2_SET', false);
    this.keyEventManager.interceptKey('THROTTLE3_SET', false);
    this.keyEventManager.interceptKey('THROTTLE4_SET', false);

    this.keyEventManager.interceptKey('THROTTLE_FULL', false);
    this.keyEventManager.interceptKey('THROTTLE1_FULL', false);
    this.keyEventManager.interceptKey('THROTTLE2_FULL', false);
    this.keyEventManager.interceptKey('THROTTLE3_FULL', false);
    this.keyEventManager.interceptKey('THROTTLE4_FULL', false);
    this.keyEventManager.interceptKey('THROTTLE_FULL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_FULL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_FULL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_FULL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_FULL_EX1', false);

    this.keyEventManager.interceptKey('THROTTLE_CUT', false);
    this.keyEventManager.interceptKey('THROTTLE1_CUT', false);
    this.keyEventManager.interceptKey('THROTTLE2_CUT', false);
    this.keyEventManager.interceptKey('THROTTLE3_CUT', false);
    this.keyEventManager.interceptKey('THROTTLE4_CUT', false);
    this.keyEventManager.interceptKey('THROTTLE_CUT_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_CUT_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_CUT_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_CUT_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_CUT_EX1', false);

    this.keyEventManager.interceptKey('THROTTLE_10', false);
    this.keyEventManager.interceptKey('THROTTLE_20', false);
    this.keyEventManager.interceptKey('THROTTLE_30', false);
    this.keyEventManager.interceptKey('THROTTLE_40', false);
    this.keyEventManager.interceptKey('THROTTLE_50', false);
    this.keyEventManager.interceptKey('THROTTLE_60', false);
    this.keyEventManager.interceptKey('THROTTLE_70', false);
    this.keyEventManager.interceptKey('THROTTLE_80', false);
    this.keyEventManager.interceptKey('THROTTLE_90', false);

    this.keyEventManager.interceptKey('THROTTLE_DETENT_NEXT', false);
    this.keyEventManager.interceptKey('THROTTLE_DETENT_PREV', false);

    // ---- INC EVENTS ----

    this.keyEventManager.interceptKey('INCREASE_THROTTLE', false);
    this.keyEventManager.interceptKey('THROTTLE_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE_RANGE_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE1_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE2_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE3_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE4_INCR', false);
    this.keyEventManager.interceptKey('THROTTLE_INCREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_INCREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_INCREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_INCREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_INCREASE_EX1', false);

    this.keyEventManager.interceptKey('THROTTLE_INCR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE1_INCR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE2_INCR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE3_INCR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE4_INCR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE_INCREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_INCREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_INCREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_INCREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_INCREASE_SMALL_EX1', false);

    this.keyEventManager.interceptKey('AXIS_THROTTLE_PLUS', false);

    // ---- DEC EVENTS ----

    this.keyEventManager.interceptKey('DECREASE_THROTTLE', false);
    this.keyEventManager.interceptKey('THROTTLE_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE_RANGE_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE1_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE2_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE3_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE4_DECR', false);
    this.keyEventManager.interceptKey('THROTTLE_DECREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_DECREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_DECREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_DECREASE_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_DECREASE_EX1', false);

    this.keyEventManager.interceptKey('THROTTLE_DECR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE1_DECR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE2_DECR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE3_DECR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE4_DECR_SMALL', false);
    this.keyEventManager.interceptKey('THROTTLE_DECREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE1_DECREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE2_DECREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE3_DECREASE_SMALL_EX1', false);
    this.keyEventManager.interceptKey('THROTTLE4_DECREASE_SMALL_EX1', false);

    this.keyEventManager.interceptKey('AXIS_THROTTLE_MINUS', false);

    this.initDefaultKeyEventHandlers();

    sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

    onInitCallback && onInitCallback();
  }

  /**
   * Initializes this manager's default key event handlers.
   */
  private initDefaultKeyEventHandlers(): void {
    const axisSet = (index: number | undefined, data: Readonly<KeyEventData>): void => {
      if (data.value0 !== undefined) {
        this.setRawThrottleLeverPosition((data.value0 + ThrottleLeverManager.RAW_MAX) / 2, index, data.key);
      }
    };

    const set = (index: number | undefined, data: Readonly<KeyEventData>): void => {
      if (data.value0 !== undefined) {
        this.setRawThrottleLeverPosition(data.value0, index, data.key);
      }
    };

    const setConstant = (position: number, index: number | undefined, data: Readonly<KeyEventData>): void => {
      this.setRawThrottleLeverPosition(position, index, data.key);
    };

    const changeConstant = (delta: number, index: number | undefined, data: Readonly<KeyEventData>): void => {
      this.changeRawThrottleLeverPosition(delta, index, data.key);
    };

    const change = (direction: 1 | -1, index: number | undefined, data: Readonly<KeyEventData>): void => {
      if (data.value0 !== undefined) {
        this.changeRawThrottleLeverPosition(data.value0 * direction, index, data.key);
      }
    };

    const axisSetAll = axisSet.bind(this, undefined);
    this.defaultKeyEventHandlers.set('AXIS_THROTTLE_SET', axisSetAll);
    this.defaultKeyEventHandlers.set('THROTTLE_AXIS_SET_EX1', axisSetAll);

    this.defaultKeyEventHandlers.set('THROTTLE_SET', set.bind(this, undefined));

    const setFullAll = setConstant.bind(this, ThrottleLeverManager.RAW_MAX, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_FULL', setFullAll);
    this.defaultKeyEventHandlers.set('THROTTLE_FULL_EX1', setFullAll);

    const setZeroAll = setConstant.bind(this, 0, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_CUT', setZeroAll);
    this.defaultKeyEventHandlers.set('THROTTLE_CUT_EX1', setZeroAll);

    this.defaultKeyEventHandlers.set('THROTTLE_10', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.1, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_20', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.2, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_30', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.3, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_40', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.4, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_50', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.5, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_60', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.6, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_70', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.7, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_80', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.8, undefined));
    this.defaultKeyEventHandlers.set('THROTTLE_90', setConstant.bind(this, ThrottleLeverManager.RAW_MAX * 0.9, undefined));

    this.defaultKeyEventHandlers.set('THROTTLE_DETENT_NEXT', setFullAll);
    this.defaultKeyEventHandlers.set('THROTTLE_DETENT_PREV', setZeroAll);

    const incrAll = changeConstant.bind(this, this.rawStep, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_INCR', incrAll);
    this.defaultKeyEventHandlers.set('INCREASE_THROTTLE', incrAll);
    this.defaultKeyEventHandlers.set('THROTTLE_RANGE_INCR', incrAll);
    this.defaultKeyEventHandlers.set('THROTTLE_INCREASE_EX1', incrAll);

    const incrSmallAll = changeConstant.bind(this, this.rawStepSmall, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_INCR_SMALL', incrSmallAll);
    this.defaultKeyEventHandlers.set('THROTTLE_INCREASE_SMALL_EX1', incrSmallAll);

    this.defaultKeyEventHandlers.set('AXIS_THROTTLE_PLUS', change.bind(this, 1, undefined));

    const decrAll = changeConstant.bind(this, -this.rawStep, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_DECR', decrAll);
    this.defaultKeyEventHandlers.set('DECREASE_THROTTLE', decrAll);
    this.defaultKeyEventHandlers.set('THROTTLE_RANGE_DECR', decrAll);
    this.defaultKeyEventHandlers.set('THROTTLE_DECREASE_EX1', decrAll);

    const decrSmallAll = changeConstant.bind(this, -this.rawStepSmall, undefined);
    this.defaultKeyEventHandlers.set('THROTTLE_DECR_SMALL', decrSmallAll);
    this.defaultKeyEventHandlers.set('THROTTLE_DECREASE_SMALL_EX1', decrSmallAll);

    this.defaultKeyEventHandlers.set('AXIS_THROTTLE_MINUS', change.bind(this, -1, undefined));

    for (let i = 1; i <= 4; i++) {
      const axisSetSingle = axisSet.bind(this, i);
      this.defaultKeyEventHandlers.set(`AXIS_THROTTLE${i}_SET`, axisSetSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_AXIS_SET_EX1`, axisSetSingle);

      const setSingle = set.bind(this, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_SET`, setSingle);

      const setFullSingle = setConstant.bind(this, ThrottleLeverManager.RAW_MAX, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_FULL`, setFullSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_FULL_EX1`, setFullSingle);

      const setZeroSingle = setConstant.bind(this, 0, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_CUT`, setZeroSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_CUT_EX1`, setZeroSingle);

      const incrSingle = changeConstant.bind(this, this.rawStep, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_INCR`, incrSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_INCREASE_EX1`, incrSingle);

      const incrSmallSingle = changeConstant.bind(this, this.rawStepSmall, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_INCR_SMALL`, incrSmallSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_INCREASE_SMALL_EX1`, incrSmallSingle);

      const decrSingle = changeConstant.bind(this, -this.rawStep, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_DECR`, decrSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_DECREASE_EX1`, decrSingle);

      const decrSmallSingle = changeConstant.bind(this, -this.rawStepSmall, i);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_DECR_SMALL`, decrSmallSingle);
      this.defaultKeyEventHandlers.set(`THROTTLE${i}_DECREASE_SMALL_EX1`, decrSmallSingle);
    }
  }

  /**
   * Waits until this manager has been initialized.
   * @returns A Promise that is fulfilled when this manager has been initialized.
   */
  public awaitInit(): Promise<void> {
    return this.initPromise;
  }

  /**
   * Sets the position of a throttle lever.
   * @param index The index of the throttle lever to set, from 1 to 4, inclusive.
   * @param pos The position to set, in the range -1 to +1.
   * @returns The throttle lever position at the end of the operation, in the range -1 to +1.
   * @throws Error if `index` is out of bounds.
   */
  public setThrottleLeverPos(index: number, pos: number): number {
    return this.setThrottleLeverPosRaw(index, pos * ThrottleLeverManager.RAW_MAX) / ThrottleLeverManager.RAW_MAX;
  }

  /**
   * Gets the position of a throttle lever.
   * @param index The index of the throttle lever to get, from 1 to 4, inclusive.
   * @returns The throttle lever position, in the range -1 to +1.
   */
  public getThrottleLeverPos(index: number): number {
    return this.getThrottleLeverPosRaw(index) / ThrottleLeverManager.RAW_MAX;
  }

  /**
   * Changes the position of a throttle lever.
   * @param index The index of the throttle lever to change, from 1 to 4, inclusive.
   * @param delta The amount by which to change the lever position. The full lever range is expressed as -1 to +1.
   * @returns The throttle lever position at the end of the operation, in the range -1 to +1.
   * @throws Error if `index` is out of bounds.
   */
  public changeThrottleLeverPos(index: number, delta: number): number {
    return this.changeThrottleLeverPosRaw(index, delta * ThrottleLeverManager.RAW_MAX) / ThrottleLeverManager.RAW_MAX;
  }

  /**
   * Sets the raw position of a throttle lever.
   * @param index The index of the throttle lever to set, from 1 to 4, inclusive.
   * @param pos The raw position to set, in the range -16384 to +16384.
   * @returns The raw throttle lever position at the end of the operation, in the range -16384 to +16384.
   * @throws Error if `index` is out of bounds.
   */
  public setThrottleLeverPosRaw(index: number, pos: number): number {
    if (index < 1 || index > ThrottleLeverManager.THROTTLE_COUNT) {
      throw new Error(`ThrottleLeverManager: throttle index (${index}) out of bounds`);
    }

    this.setRawThrottleLeverPosition(pos, index);
    return this.throttleLevers[index - 1].rawPosition;
  }

  /**
   * Gets the raw position of a throttle lever.
   * @param index The index of the throttle lever to get, from 1 to 4, inclusive.
   * @returns The raw throttle lever position, in the range -16384 to +16384.
   * @throws Error if `index` is out of bounds.
   */
  public getThrottleLeverPosRaw(index: number): number {
    if (index < 1 || index > ThrottleLeverManager.THROTTLE_COUNT) {
      throw new Error(`ThrottleLeverManager: throttle index (${index}) out of bounds`);
    }

    return this.throttleLevers[index - 1].rawPosition;
  }

  /**
   * Changes the raw position of a throttle lever.
   * @param index The index of the throttle lever to change, from 1 to 4, inclusive.
   * @param delta The amount by which to change the raw lever position. The full lever range is expressed as -16384 to
   * +16384.
   * @returns The raw throttle lever position at the end of the operation, in the range -16384 to +16384.
   * @throws Error if `index` is out of bounds.
   */
  public changeThrottleLeverPosRaw(index: number, delta: number): number {
    if (index < 1 || index > ThrottleLeverManager.THROTTLE_COUNT) {
      throw new Error(`ThrottleLeverManager: throttle index (${index}) out of bounds`);
    }

    this.changeRawThrottleLeverPosition(delta, index);
    return this.throttleLevers[index - 1].rawPosition;
  }

  /**
   * Responds to key intercept events.
   * @param data The event data.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    const defaultHandler = this.defaultKeyEventHandlers.get(data.key);
    if (defaultHandler) {
      (this.keyEventHandler && this.keyEventHandler(data, this.keyEventHandlerController)) || defaultHandler(data);
    }
  }

  /**
   * Sets a raw throttle lever position.
   * @param rawPosition The raw position to set.
   * @param index The index of the throttle lever to set. If undefined, the positions of all throttle levers will be
   * set.
   * @param keyEvent The key event responsible for this change, or `undefined` if this change was not triggered by a
   * key event.
   */
  private setRawThrottleLeverPosition(rawPosition: number, index?: number, keyEvent?: string): void {
    rawPosition = MathUtils.clamp(Math.round(rawPosition), -ThrottleLeverManager.RAW_MAX, ThrottleLeverManager.RAW_MAX);

    const end = (index ?? ThrottleLeverManager.THROTTLE_COUNT) + 1;
    for (let i = index ?? 1; i < end; i++) {
      const lever = this.throttleLevers[i - 1];

      if (this.throttleLeverHandler) {
        rawPosition = MathUtils.clamp(
          Math.round(this.throttleLeverHandler(
            lever.index,
            lever.rawPosition / ThrottleLeverManager.RAW_MAX,
            rawPosition / ThrottleLeverManager.RAW_MAX,
            keyEvent
          ) * ThrottleLeverManager.RAW_MAX),
          -ThrottleLeverManager.RAW_MAX,
          ThrottleLeverManager.RAW_MAX
        );
      }

      if (rawPosition !== lever.rawPosition) {
        lever.rawPosition = rawPosition;
        this.publishThrottleLeverPosition(lever);
      }
    }
  }

  /**
   * Changes a raw throttle lever position.
   * @param delta The amount by which to change the raw lever position.
   * @param index The index of the throttle lever to change. If undefined, the positions of all throttle levers will be
   * changed.
   * @param keyEvent The key event responsible for this change, or `undefined` if this change was not triggered by a
   * key event.
   */
  private changeRawThrottleLeverPosition(delta: number, index?: number, keyEvent?: string): void {
    const end = (index ?? ThrottleLeverManager.THROTTLE_COUNT) + 1;
    for (let i = index ?? 1; i < end; i++) {
      this.setRawThrottleLeverPosition(this.throttleLevers[i - 1].rawPosition + delta, i, keyEvent);
    }
  }

  /**
   * Publishes a virtual throttle lever position to the event bus.
   * @param lever The lever whose position to publish.
   */
  private publishThrottleLeverPosition(lever: VirtualThrottleLever): void {
    this.publisher.pub(lever.topic, lever.rawPosition / ThrottleLeverManager.RAW_MAX, true, true);
  }
}
