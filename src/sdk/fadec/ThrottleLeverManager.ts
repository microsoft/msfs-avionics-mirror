import { ConsumerValue, EventBus, IndexedEventType, KeyEventData, KeyEventManager, KeyEvents } from '../data';
import { MathUtils } from '../math/MathUtils';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';

/**
 * Virtual throttle lever events.
 */
export interface VirtualThrottleLeverEvents {
  /** The position of an indexed virtual throttle lever. Ranges from -1 to +1. */
  [v_throttle_lever_pos: IndexedEventType<'v_throttle_lever_pos'>]: number;
}

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
  private static readonly RAW_STEP = 256;

  private readonly publisher = this.bus.getPublisher<VirtualThrottleLeverEvents>();

  private keyEventManager?: KeyEventManager;

  private readonly throttleLevers = ArrayUtils.create<VirtualThrottleLever>(ThrottleLeverManager.THROTTLE_COUNT, index => {
    return {
      index: index + 1,
      topic: `v_throttle_lever_pos_${index + 1}`,
      rawPosition: 0
    };
  });

  /**
   * Constructor.
   * @param bus The event bus.
   * @param onInitCallback A callback function to be executed once this manager is initialized.
   * @param throttleLeverHandler A callback function which handles requested changes to throttle lever position. The
   * function should take three arguments: the index of the throttle lever, the current lever position (-1 to +1), and
   * the requested new lever position (-1 to +1), and return the position the lever should be set to. If not defined,
   * all requested changes to throttle lever position will be processed as-is.
   */
  constructor(
    private readonly bus: EventBus,
    onInitCallback?: () => void,
    private readonly throttleLeverHandler?: (index: number, currentPos: number, newPos: number, keyEvent: string | undefined) => number
  ) {
    const sub = bus.getSubscriber<VirtualThrottleLeverEvents & KeyEvents>();

    const virtualPositions = this.throttleLevers.map(lever => {
      return ConsumerValue.create(sub.on(lever.topic), NaN);
    });

    KeyEventManager.getManager(bus).then(manager => {
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

      this.keyEventManager = manager;

      manager.interceptKey('AXIS_THROTTLE_SET', false);
      manager.interceptKey('AXIS_THROTTLE1_SET', false);
      manager.interceptKey('AXIS_THROTTLE2_SET', false);
      manager.interceptKey('AXIS_THROTTLE3_SET', false);
      manager.interceptKey('AXIS_THROTTLE4_SET', false);

      manager.interceptKey('THROTTLE_AXIS_SET_EX1', false);
      manager.interceptKey('THROTTLE1_AXIS_SET_EX1', false);
      manager.interceptKey('THROTTLE2_AXIS_SET_EX1', false);
      manager.interceptKey('THROTTLE3_AXIS_SET_EX1', false);
      manager.interceptKey('THROTTLE4_AXIS_SET_EX1', false);

      manager.interceptKey('THROTTLE_SET', false);
      manager.interceptKey('THROTTLE1_SET', false);
      manager.interceptKey('THROTTLE2_SET', false);
      manager.interceptKey('THROTTLE3_SET', false);
      manager.interceptKey('THROTTLE4_SET', false);

      manager.interceptKey('THROTTLE_FULL', false);
      manager.interceptKey('THROTTLE1_FULL', false);
      manager.interceptKey('THROTTLE2_FULL', false);
      manager.interceptKey('THROTTLE3_FULL', false);
      manager.interceptKey('THROTTLE4_FULL', false);

      manager.interceptKey('THROTTLE_INCR', false);
      manager.interceptKey('THROTTLE1_INCR', false);
      manager.interceptKey('THROTTLE2_INCR', false);
      manager.interceptKey('THROTTLE3_INCR', false);
      manager.interceptKey('THROTTLE4_INCR', false);

      manager.interceptKey('THROTTLE_DECR', false);
      manager.interceptKey('THROTTLE1_DECR', false);
      manager.interceptKey('THROTTLE2_DECR', false);
      manager.interceptKey('THROTTLE3_DECR', false);
      manager.interceptKey('THROTTLE4_DECR', false);

      manager.interceptKey('THROTTLE_CUT', false);
      manager.interceptKey('THROTTLE1_CUT', false);
      manager.interceptKey('THROTTLE2_CUT', false);
      manager.interceptKey('THROTTLE3_CUT', false);
      manager.interceptKey('THROTTLE4_CUT', false);

      manager.interceptKey('INCREASE_THROTTLE', false);
      manager.interceptKey('DECREASE_THROTTLE', false);

      manager.interceptKey('THROTTLE_10', false);
      manager.interceptKey('THROTTLE_20', false);
      manager.interceptKey('THROTTLE_30', false);
      manager.interceptKey('THROTTLE_40', false);
      manager.interceptKey('THROTTLE_50', false);
      manager.interceptKey('THROTTLE_60', false);
      manager.interceptKey('THROTTLE_70', false);
      manager.interceptKey('THROTTLE_80', false);
      manager.interceptKey('THROTTLE_90', false);

      sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

      onInitCallback && onInitCallback();
    });
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
   * @param data.key The key that was intercepted.
   * @param data.value0 The value of the intercepted key event.
   */
  private onKeyIntercepted({ key, value0 }: KeyEventData): void {
    switch (key) {
      case 'AXIS_THROTTLE_SET':
      case 'THROTTLE_AXIS_SET_EX1':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition((value0 + ThrottleLeverManager.RAW_MAX) / 2, undefined, key);
        }
        break;
      case 'AXIS_THROTTLE1_SET':
      case 'THROTTLE1_AXIS_SET_EX1':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition((value0 + ThrottleLeverManager.RAW_MAX) / 2, 1, key);
        }
        break;
      case 'AXIS_THROTTLE2_SET':
      case 'THROTTLE2_AXIS_SET_EX1':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition((value0 + ThrottleLeverManager.RAW_MAX) / 2, 2, key);
        }
        break;
      case 'AXIS_THROTTLE3_SET':
      case 'THROTTLE3_AXIS_SET_EX1':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition((value0 + ThrottleLeverManager.RAW_MAX) / 2, 3, key);
        }
        break;
      case 'AXIS_THROTTLE4_SET':
      case 'THROTTLE4_AXIS_SET_EX1':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition((value0 + ThrottleLeverManager.RAW_MAX) / 2, 4, key);
        }
        break;
      case 'THROTTLE_SET':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition(value0, undefined, key);
        }
        break;
      case 'THROTTLE1_SET':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition(value0, 1, key);
        }
        break;
      case 'THROTTLE2_SET':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition(value0, 2, key);
        }
        break;
      case 'THROTTLE3_SET':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition(value0, 3, key);
        }
        break;
      case 'THROTTLE4_SET':
        if (value0 !== undefined) {
          this.setRawThrottleLeverPosition(value0, 4, key);
        }
        break;
      case 'THROTTLE_FULL':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX, undefined, key);
        break;
      case 'THROTTLE1_FULL':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX, 1, key);
        break;
      case 'THROTTLE2_FULL':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX, 2, key);
        break;
      case 'THROTTLE3_FULL':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX, 3, key);
        break;
      case 'THROTTLE4_FULL':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX, 4, key);
        break;
      case 'THROTTLE_CUT':
        this.setRawThrottleLeverPosition(0, undefined, key);
        break;
      case 'THROTTLE1_CUT':
        this.setRawThrottleLeverPosition(0, 1, key);
        break;
      case 'THROTTLE2_CUT':
        this.setRawThrottleLeverPosition(0, 2, key);
        break;
      case 'THROTTLE3_CUT':
        this.setRawThrottleLeverPosition(0, 3, key);
        break;
      case 'THROTTLE4_CUT':
        this.setRawThrottleLeverPosition(0, 4, key);
        break;
      case 'THROTTLE_INCR':
      case 'INCREASE_THROTTLE':
        this.changeRawThrottleLeverPosition(ThrottleLeverManager.RAW_STEP, undefined, key);
        break;
      case 'THROTTLE1_INCR':
        this.changeRawThrottleLeverPosition(ThrottleLeverManager.RAW_STEP, 1, key);
        break;
      case 'THROTTLE2_INCR':
        this.changeRawThrottleLeverPosition(ThrottleLeverManager.RAW_STEP, 2, key);
        break;
      case 'THROTTLE3_INCR':
        this.changeRawThrottleLeverPosition(ThrottleLeverManager.RAW_STEP, 3, key);
        break;
      case 'THROTTLE4_INCR':
        this.changeRawThrottleLeverPosition(ThrottleLeverManager.RAW_STEP, 4, key);
        break;
      case 'THROTTLE_DECR':
      case 'DECREASE_THROTTLE':
        this.changeRawThrottleLeverPosition(-ThrottleLeverManager.RAW_STEP, undefined, key);
        break;
      case 'THROTTLE1_DECR':
        this.changeRawThrottleLeverPosition(-ThrottleLeverManager.RAW_STEP, 1, key);
        break;
      case 'THROTTLE2_DECR':
        this.changeRawThrottleLeverPosition(-ThrottleLeverManager.RAW_STEP, 2, key);
        break;
      case 'THROTTLE3_DECR':
        this.changeRawThrottleLeverPosition(-ThrottleLeverManager.RAW_STEP, 3, key);
        break;
      case 'THROTTLE4_DECR':
        this.changeRawThrottleLeverPosition(-ThrottleLeverManager.RAW_STEP, 4, key);
        break;
      case 'THROTTLE_10':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.1, undefined, key);
        break;
      case 'THROTTLE_20':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.2, undefined, key);
        break;
      case 'THROTTLE_30':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.3, undefined, key);
        break;
      case 'THROTTLE_40':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.4, undefined, key);
        break;
      case 'THROTTLE_50':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.5, undefined, key);
        break;
      case 'THROTTLE_60':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.6, undefined, key);
        break;
      case 'THROTTLE_70':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.7, undefined, key);
        break;
      case 'THROTTLE_80':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.8, undefined, key);
        break;
      case 'THROTTLE_90':
        this.setRawThrottleLeverPosition(ThrottleLeverManager.RAW_MAX * 0.9, undefined, key);
        break;
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