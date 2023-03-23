import { CombinedSubject, ConsumerSubject, EventBus, FlightTimerControlEvents, FlightTimerEvents, FlightTimerMode, MathUtils, Subscription, UnitType } from '@microsoft/msfs-sdk';

/**
 * Events used to control Garmin timers.
 */
export type GarminTimerControlEvents = {
  /** Resets the flight timer. */
  garmin_flt_timer_reset: void;

  /** Sets the active mode for a generic timer. */
  [garmin_gen_timer_set_mode: `garmin_gen_timer_set_mode_${number}`]: FlightTimerMode;

  /** Sets the initial and current values, in milliseconds, for a generic timer. Stops the timer if it is running. */
  [garmin_gen_timer_set_value: `garmin_gen_timer_set_value_${number}`]: number;

  /** Starts a generic timer. */
  [garmin_gen_timer_start: `garmin_gen_timer_start_${number}`]: void;

  /** Stops a generic timer. */
  [garmin_gen_timer_stop: `garmin_gen_timer_stop_${number}`]: void;

  /** Resets a generic timer value to its initial value. Stops the timer if it is running. */
  [garmin_gen_timer_reset: `garmin_gen_timer_reset_${number}`]: void;
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

  private readonly genericTimerCount: number;
  private readonly genericTimers: Record<number, GenericTimer> = {};

  private isAlive = true;
  private isInit = false;

  private readonly controlSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param genericTimerCount The number of generic timers supported.
   */
  public constructor(private readonly bus: EventBus, genericTimerCount: number) {
    this.genericTimerCount = Math.max(genericTimerCount, 0);

    for (let i = 1; i <= this.genericTimerCount; i++) {
      this.genericTimers[i] = new GenericTimer(bus, i);
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
class GenericTimer {
  private static readonly MAX_VALUE = UnitType.HOUR.convertTo(24, UnitType.MILLISECOND);

  private readonly timerIndex = this.index + GarminTimerManager.GENERIC_TIMER_INDEX - 1;

  private readonly publisher = this.bus.getPublisher<FlightTimerControlEvents>();

  private readonly controlEventTopics = {
    setMode: `timer_set_mode_${this.timerIndex}`,
    setInitialValue: `timer_set_initial_value_${this.timerIndex}`,
    setValue: `timer_set_value_${this.timerIndex}`,
    start: `timer_start_${this.timerIndex}`,
    stop: `timer_stop_${this.timerIndex}`,
    reset: `timer_reset_${this.timerIndex}`
  } as const;

  private readonly isRunning = ConsumerSubject.create(null, false);
  private readonly mode = ConsumerSubject.create(null, FlightTimerMode.CountingDown);
  private readonly value = ConsumerSubject.create(null, 0);
  private readonly modeValueState = CombinedSubject.create(this.mode, this.value);

  private readonly controlSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param index The index of this timer.
   */
  public constructor(private readonly bus: EventBus, public readonly index: number) {
  }

  /**
   * Initializes this timer. Once this timer is initialized, it will respond to timer control events and will
   * automatically handle when its current value counts down to below zero or counts up to above the maximum value.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<FlightTimerEvents & GarminTimerControlEvents>();

    this.isRunning.setConsumer(sub.on(`timer_is_running_${this.timerIndex}`));
    this.mode.setConsumer(sub.on(`timer_mode_${this.timerIndex}`));
    this.value.setConsumer(sub.on(`timer_value_ms_${this.timerIndex}`));

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

    this.controlSubs.push(sub.on(`garmin_gen_timer_set_mode_${this.index}`).handle(mode => {
      this.publisher.pub(this.controlEventTopics.setMode, mode, true, false);
    }));

    this.controlSubs.push(sub.on(`garmin_gen_timer_set_value_${this.index}`).handle(value => {
      value = MathUtils.clamp(value, 0, GenericTimer.MAX_VALUE - 1000);

      this.publisher.pub(this.controlEventTopics.stop, undefined, true, false);
      this.publisher.pub(this.controlEventTopics.setInitialValue, value, true, false);
      this.publisher.pub(this.controlEventTopics.reset, undefined, true, false);
    }));

    this.controlSubs.push(sub.on(`garmin_gen_timer_start_${this.index}`).handle(() => {
      this.publisher.pub(this.controlEventTopics.start, undefined, true, false);
    }));

    this.controlSubs.push(sub.on(`garmin_gen_timer_stop_${this.index}`).handle(() => {
      this.publisher.pub(this.controlEventTopics.stop, undefined, true, false);
    }));

    this.controlSubs.push(sub.on(`garmin_gen_timer_reset_${this.index}`).handle(() => {
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