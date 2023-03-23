import { ConsumerSubject } from '../data/ConsumerSubject';
import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { Instrument } from './Backplane';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';
import { ClockEvents } from './Clock';

/**
 * Flight timer modes.
 */
export enum FlightTimerMode {
  CountingDown,
  CountingUp
}

/**
 * Events related to flight timers.
 */
export type FlightTimerEvents = {
  /** Active timer mode. */
  [timer_mode: IndexedEventType<'timer_mode'>]: FlightTimerMode;

  /** Whether a timer is running. */
  [timer_is_running: IndexedEventType<'timer_is_running'>]: boolean;

  /** Initial timer value, in milliseconds. */
  [timer_initial_value_ms: IndexedEventType<'timer_initial_value_ms'>]: number;

  /** Current timer value, in milliseconds. */
  [timer_value_ms: IndexedEventType<'timer_value_ms'>]: number;
};

/**
 * Events used to control flight timers.
 */
export type FlightTimerControlEvents = {
  /** Sets the active timer mode. */
  [timer_set_mode: IndexedEventType<'timer_set_mode'>]: FlightTimerMode;

  /** Sets the initial timer value, in milliseconds. */
  [timer_set_initial_value: IndexedEventType<'timer_set_initial_value'>]: number;

  /** Sets the current timer value, in milliseconds. */
  [timer_set_value: IndexedEventType<'timer_set_value'>]: number;

  /** Starts the timer. */
  [timer_start: IndexedEventType<'timer_start'>]: void;

  /** Stops the timer. */
  [timer_stop: IndexedEventType<'timer_stop'>]: void;

  /** Resets the current timer value to the initial value. */
  [timer_reset: IndexedEventType<'timer_reset'>]: void;
};

/**
 * A publisher for flight timer information.
 */
export class FlightTimerPublisher extends SimVarPublisher<FlightTimerEvents> {
  /**
   * Constructor.
   * @param bus The event bus.
   * @param timerCount The number of supported timers.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, timerCount: number, pacer?: PublishPacer<FlightTimerEvents>) {
    const simVars = new Map<keyof FlightTimerEvents, SimVarPublisherEntry<any>>();

    const baseSimVars = [
      ['timer_mode', { name: 'L:WTFltTimer_Mode', type: SimVarValueType.Number }],
      ['timer_is_running', { name: 'L:WTFltTimer_Running', type: SimVarValueType.Bool }],
      ['timer_initial_value_ms', { name: 'L:WTFltTimer_Initial_Value', type: SimVarValueType.Number }],
      ['timer_value_ms', { name: 'L:WTFltTimer_Value', type: SimVarValueType.Number }]
    ] as const;

    timerCount = Math.max(timerCount, 0);
    for (let i = 1; i <= timerCount; i++) {
      for (const [topic, simvar] of baseSimVars) {
        simVars.set(
          `${topic}_${i}`,
          {
            name: `${simvar.name}:${i}`,
            type: simvar.type
          }
        );
      }
    }

    super(simVars, bus, pacer);
  }
}

/**
 * An instrument which manages zero or more flight timers. Requires the topics defined in {@link ClockEvents} to be
 * actively published to the event bus in order to function properly. All timers operate using simulation time and are
 * updated every instrument update cycle with up to millisecond precision.
 */
export class FlightTimerInstrument implements Instrument {
  private readonly timerCount: number;
  private readonly timers: Record<number, FlightTimer> = {};

  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0).pause();
  private lastUpdateSimTime = this.simTime.get();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param timerCount The number of supported timers.
   */
  public constructor(private readonly bus: EventBus, timerCount: number) {
    this.timerCount = Math.max(timerCount, 0);

    for (let i = 1; i <= this.timerCount; i++) {
      this.timers[i] = new FlightTimer(bus, i);
    }
  }

  /** @inheritdoc */
  public init(): void {
    this.simTime.resume();
    this.lastUpdateSimTime = this.simTime.get();

    for (let i = 1; i <= this.timerCount; i++) {
      this.timers[i].init(this.lastUpdateSimTime);
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const currentSimTime = this.simTime.get();

    for (let i = 1; i <= this.timerCount; i++) {
      this.timers[i].update(currentSimTime);
    }

    this.lastUpdateSimTime = currentSimTime;
  }
}

/**
 * A flight timer.
 */
class FlightTimer {
  private readonly simVars = {
    mode: `L:WTFltTimer_Mode:${this.index}`,
    isRunning: `L:WTFltTimer_Running:${this.index}`,
    referenceTime: `L:WTFltTimer_Reference_Time:${this.index}`,
    referenceValue: `L:WTFltTimer_Reference_Value:${this.index}`,
    initialValue: `L:WTFltTimer_Initial_Value:${this.index}`,
    currentValue: `L:WTFltTimer_Value:${this.index}`
  } as const;

  private simTime = 0;

  private mode = FlightTimerMode.CountingDown;
  private isRunning = false;
  private referenceTime = 0;
  private referenceValue = 0;
  private initialValue = 0;
  private currentValue = 0;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param index The index of this timer.
   */
  public constructor(private readonly bus: EventBus, private readonly index: number) {
  }

  /**
   * Initializes this timer. Once this timer is initialized, it will respond to timer control events.
   * @param time The current sim time, as a UNIX timestamp in milliseconds.
   */
  public init(time: number): void {
    this.simTime = time;

    // Initialize state from simvars
    this.mode = SimVar.GetSimVarValue(this.simVars.mode, SimVarValueType.Number);
    this.isRunning = !!SimVar.GetSimVarValue(this.simVars.isRunning, SimVarValueType.Bool);
    this.referenceTime = SimVar.GetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number);
    this.referenceValue = SimVar.GetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number);
    this.initialValue = SimVar.GetSimVarValue(this.simVars.initialValue, SimVarValueType.Number);
    this.currentValue = SimVar.GetSimVarValue(this.simVars.currentValue, SimVarValueType.Number);

    // Subscribe to control events

    const sub = this.bus.getSubscriber<FlightTimerControlEvents>();

    sub.on(`timer_set_mode_${this.index}`).handle(mode => {
      this.mode = mode;
      this.referenceTime = this.simTime;
      this.referenceValue = this.currentValue;

      SimVar.SetSimVarValue(this.simVars.mode, SimVarValueType.Number, mode);
      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
    });

    sub.on(`timer_set_initial_value_${this.index}`).handle(value => {
      this.initialValue = value;

      SimVar.SetSimVarValue(this.simVars.initialValue, SimVarValueType.Number, this.initialValue);
    });

    sub.on(`timer_set_value_${this.index}`).handle(value => {
      this.referenceTime = this.simTime;
      this.referenceValue = value;
      this.currentValue = value;

      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
    });

    sub.on(`timer_start_${this.index}`).handle(() => {
      if (this.isRunning) {
        return;
      }

      this.isRunning = true;
      this.referenceTime = this.simTime;
      this.referenceValue = this.currentValue;

      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
      SimVar.SetSimVarValue(this.simVars.isRunning, SimVarValueType.Bool, 1);
    });

    sub.on(`timer_stop_${this.index}`).handle(() => {
      if (!this.isRunning) {
        return;
      }

      this.isRunning = false;

      SimVar.SetSimVarValue(this.simVars.isRunning, SimVarValueType.Bool, 0);
    });

    sub.on(`timer_reset_${this.index}`).handle(() => {
      this.referenceTime = this.simTime;
      this.referenceValue = this.initialValue;
      this.currentValue = this.initialValue;

      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
      SimVar.SetSimVarValue(this.simVars.currentValue, SimVarValueType.Number, this.currentValue);
    });
  }

  /**
   * Updates this timer's current value.
   * @param time The current sim time, as a UNIX timestamp in milliseconds.
   */
  public update(time: number): void {
    this.simTime = time;

    if (!this.isRunning) {
      return;
    }

    const modeSign = this.mode === FlightTimerMode.CountingDown ? -1 : 1;

    const value = this.referenceValue + (time - this.referenceTime) * modeSign;

    this.currentValue = value;
    SimVar.SetSimVarValue(this.simVars.currentValue, SimVarValueType.Number, value);
  }
}