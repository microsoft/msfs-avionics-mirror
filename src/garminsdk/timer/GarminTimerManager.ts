import {
  ConsumerSubject, EventBus, FlightTimerControlEvents, FlightTimerEventsForId, FlightTimerMode, FlightTimerUtils,
  MappedSubject, MathUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { GarminTimerControlEvents } from './GarminTimerControlEvents';

/**
 * Configuration options for {@link GarminTimerManager}.
 */
export type GarminTimerManagerOptions = {
  /** The ID of the managed timers. Defaults to the empty ID (`''`). */
  id?: string;

  /** The number of supported generic timers. */
  genericTimerCount: number;
};

/**
 * A manager of timers for Garmin avionics. Manages one flight timer and an arbitrary number of generic timers.
 */
export class GarminTimerManager {
  /** The index of the flight timer. */
  public static readonly FLIGHT_TIMER_INDEX = 1;
  /** The index of the first generic timer. */
  public static readonly GENERIC_TIMER_INDEX = 2;

  /** The maximum value of a generic timer, in milliseconds, exclusive. */
  public static readonly MAX_GENERIC_TIMER_VALUE = UnitType.HOUR.convertTo(24, UnitType.MILLISECOND);

  private readonly id: string;

  private readonly genericTimerCount: number;
  private readonly genericTimers: Record<number, GenericTimer<string>> = {};

  private isAlive = true;
  private isInit = false;

  private readonly controlSubs: Subscription[] = [];

  /**
   * Creates a new instance of GarminTimerManager.
   * @param bus The event bus.
   * @param options The number of supported generic timers.
   */
  public constructor(bus: EventBus, options: Readonly<GarminTimerManagerOptions>);
  /**
   * Creates a new instance of GarminTimerManager.
   * @param bus The event bus.
   * @param genericTimerCount The number of supported generic timers.
   */
  public constructor(bus: EventBus, genericTimerCount: number);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(private readonly bus: EventBus, arg2: Readonly<GarminTimerManagerOptions> | number) {
    if (typeof arg2 === 'number') {
      this.id = '';
      this.genericTimerCount = Math.max(arg2, 0);
    } else {
      this.id = arg2.id ?? '';
      this.genericTimerCount = Math.max(arg2.genericTimerCount, 0);
    }

    for (let i = 1; i <= this.genericTimerCount; i++) {
      this.genericTimers[i] = new GenericTimer(bus, this.id, i);
    }
  }

  /**
   * Initializes this manager.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('GarminTimerManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // TODO: Support the flight timer.

    for (let i = 1; i <= this.genericTimerCount; i++) {
      this.genericTimers[i].init();
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    for (let i = 1; i <= this.genericTimerCount; i++) {
      this.genericTimers[i].destroy();
    }

    this.controlSubs.forEach(sub => { sub.destroy(); });
  }
}

/**
 * A Garmin generic timer. Supports counting up and down from an initial value within the range 00:00:00 to 23:59:59.
 * If a timer reaches 0 when counting down, its initial value is set to 00:00:00 and it will begin counting up from
 * that value. If a timer reaches 23:59:59 when counting up, its initial value is set to 00:00:00 and
 * it will begin counting up from that value.
 */
class GenericTimer<ID extends string> {
  private static readonly MAX_VALUE = UnitType.HOUR.convertTo(24, UnitType.MILLISECOND);

  private readonly idSuffix = FlightTimerUtils.getIdSuffix(this.id);
  private readonly timerIndex = this.index + GarminTimerManager.GENERIC_TIMER_INDEX - 1;

  private readonly publisher = this.bus.getPublisher<FlightTimerControlEvents>();

  private readonly controlEventTopics = {
    setMode: `timer_set_mode${this.idSuffix}_${this.timerIndex}`,
    setInitialValue: `timer_set_initial_value${this.idSuffix}_${this.timerIndex}`,
    setValue: `timer_set_value${this.idSuffix}_${this.timerIndex}`,
    start: `timer_start${this.idSuffix}_${this.timerIndex}`,
    stop: `timer_stop${this.idSuffix}_${this.timerIndex}`,
    reset: `timer_reset${this.idSuffix}_${this.timerIndex}`
  } as const;

  private readonly isRunning = ConsumerSubject.create(null, false);
  private readonly mode = ConsumerSubject.create(null, FlightTimerMode.CountingDown);
  private readonly value = ConsumerSubject.create(null, 0);
  private readonly modeValueState = MappedSubject.create(this.mode, this.value);

  private readonly controlSubs: Subscription[] = [];

  /**
   * Creates a new instance of GenericTimer.
   * @param bus The event bus.
   * @param id The ID of this timer.
   * @param index The index of this timer.
   */
  public constructor(
    private readonly bus: EventBus,
    public readonly id: ID,
    public readonly index: number
  ) {
  }

  /**
   * Initializes this timer. Once this timer is initialized, it will respond to timer control events and will
   * automatically handle when its current value counts down to below zero or counts up to above the maximum value.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<FlightTimerEventsForId<ID>>();

    this.isRunning.setConsumer(FlightTimerUtils.onEvent(this.id, this.timerIndex, sub, 'timer_is_running'));
    this.mode.setConsumer(FlightTimerUtils.onEvent(this.id, this.timerIndex, sub, 'timer_mode'));
    this.value.setConsumer(FlightTimerUtils.onEvent(this.id, this.timerIndex, sub, 'timer_value_ms'));

    const modeValueStateSub = this.modeValueState.sub(([mode, value]) => {

      if (value < 0) {
        // If timer value is negative and counting down, reset the initial value to 0 and set the timer to start
        // counting up from the time it reached 0, otherwise clamp the value to 0.

        if (mode === FlightTimerMode.CountingUp) {
          this.publisher.pub(this.controlEventTopics.setValue, 0, true, false);
        } else {
          this.publisher.pub(this.controlEventTopics.setInitialValue, 0, true, false);
          this.publisher.pub(this.controlEventTopics.setValue, -value, true, false);
          this.publisher.pub(this.controlEventTopics.setMode, FlightTimerMode.CountingUp, true, false);
        }
      } else if (value >= GenericTimer.MAX_VALUE && mode !== FlightTimerMode.CountingDown) {
        // If timer value is overflowing the maximum value, reset the initial and current values to 0 if timer is
        // counting up, otherwise clamp the value to below the maximum.

        if (mode === FlightTimerMode.CountingUp) {
          this.publisher.pub(this.controlEventTopics.setInitialValue, 0, true, false);
          this.publisher.pub(this.controlEventTopics.setValue, value - GenericTimer.MAX_VALUE, true, false);
        } else {
          this.publisher.pub(this.controlEventTopics.setValue, GenericTimer.MAX_VALUE - 1000, true, false);
        }
      }
    }, false, true);

    this.isRunning.sub(isRunning => {
      if (isRunning) {
        modeValueStateSub.resume(true);
      } else {
        modeValueStateSub.pause();
      }
    }, true);

    const controlSub = this.bus.getSubscriber<GarminTimerControlEvents>();

    this.controlSubs.push(controlSub.on(`garmin_gen_timer_set_mode${this.idSuffix}_${this.index}`).handle(mode => {
      this.publisher.pub(this.controlEventTopics.setMode, mode, true, false);
    }));

    this.controlSubs.push(controlSub.on(`garmin_gen_timer_set_value${this.idSuffix}_${this.index}`).handle(value => {
      value = MathUtils.clamp(value, 0, GenericTimer.MAX_VALUE - 1000);

      this.publisher.pub(this.controlEventTopics.stop, undefined, true, false);
      this.publisher.pub(this.controlEventTopics.setInitialValue, value, true, false);
      this.publisher.pub(this.controlEventTopics.reset, undefined, true, false);
    }));

    this.controlSubs.push(controlSub.on(`garmin_gen_timer_start${this.idSuffix}_${this.index}`).handle(() => {
      this.publisher.pub(this.controlEventTopics.start, undefined, true, false);
    }));

    this.controlSubs.push(controlSub.on(`garmin_gen_timer_stop${this.idSuffix}_${this.index}`).handle(() => {
      this.publisher.pub(this.controlEventTopics.stop, undefined, true, false);
    }));

    this.controlSubs.push(controlSub.on(`garmin_gen_timer_reset${this.idSuffix}_${this.index}`).handle(() => {
      this.publisher.pub(this.controlEventTopics.stop, undefined, true, false);
      this.publisher.pub(this.controlEventTopics.reset, undefined, true, false);
    }));
  }

  /**
   * Destroys this timer.
   */
  public destroy(): void {
    this.mode.destroy();
    this.value.destroy();
    this.controlSubs.forEach(sub => { sub.destroy(); });
  }
}