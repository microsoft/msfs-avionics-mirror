import { Consumer } from '../data/Consumer';
import { ConsumerSubject } from '../data/ConsumerSubject';
import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { EventSubscriber } from '../data/EventSubscriber';
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
 * The event topic suffix for a flight timer with a specific ID.
 */
export type FlightTimerEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events related to flight timers.
 */
export type BaseFlightTimerEvents = {
  /** Active timer mode. */
  timer_mode: FlightTimerMode;

  /** Whether a timer is running. */
  timer_is_running: boolean;

  /** Initial timer value, in milliseconds. */
  timer_initial_value_ms: number;

  /** Current timer value, in milliseconds. */
  timer_value_ms: number;
};

/**
 * Events related to flight timers with a specific ID, keyed by base topic names.
 */
export type BaseFlightTimerEventsForId<ID extends string> = {
  [P in keyof BaseFlightTimerEvents as `${P}${FlightTimerEventSuffix<ID>}`]: BaseFlightTimerEvents[P];
};

/**
 * Events related to flight timers with a specific ID, keyed by indexed topic names.
 */
export type FlightTimerEventsForId<ID extends string> = {
  [P in keyof BaseFlightTimerEvents as `${P}${FlightTimerEventSuffix<ID>}_${number}`]: BaseFlightTimerEvents[P];
};

/**
 * All possible events related to flight timers.
 */
export type FlightTimerEvents = FlightTimerEventsForId<''> & FlightTimerEventsForId<string>;

/**
 * Events used to control flight timers.
 */
export type BaseFlightTimerControlEvents = {
  /** Sets the active timer mode. */
  timer_set_mode: FlightTimerMode;

  /** Sets the initial timer value, in milliseconds. */
  timer_set_initial_value: number;

  /** Sets the current timer value, in milliseconds. */
  timer_set_value: number;

  /** Starts the timer. */
  timer_start: void;

  /** Stops the timer. */
  timer_stop: void;

  /** Resets the current timer value to the initial value. */
  timer_reset: void;
};

/**
 * Events used to control flight timers with a specific ID, keyed by base topic names.
 */
export type BaseFlightTimerControlEventsForId<ID extends string> = {
  [P in keyof BaseFlightTimerControlEvents as `${P}${FlightTimerEventSuffix<ID>}`]: BaseFlightTimerControlEvents[P];
};

/**
 * Events used to control flight timers with a specific ID, keyed by indexed topic names.
 */
export type FlightTimerControlEventsForId<ID extends string> = {
  [P in keyof BaseFlightTimerControlEvents as `${P}${FlightTimerEventSuffix<ID>}_${number}`]: BaseFlightTimerControlEvents[P];
};

/**
 * All possible events used to control flight timers.
 */
export type FlightTimerControlEvents = FlightTimerControlEventsForId<''> & FlightTimerControlEventsForId<string>;

/**
 * A utility class for working with flight timers.
 */
export class FlightTimerUtils {
  /**
   * Gets the event bus topic suffix for a flight timer ID.
   * @param id The ID for which to get the suffix.
   * @returns The event bus topic suffix for the specified flight timer ID.
   */
  public static getIdSuffix<ID extends string>(id: ID): FlightTimerEventSuffix<ID> {
    return (id === '' ? '' : `_${id}`) as FlightTimerEventSuffix<ID>;
  }

  /**
   * Subscribes to one of the event bus topics related to a flight timer with a given ID.
   * @param id The ID of the timer.
   * @param index The index of the timer.
   * @param bus The event bus to which to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onEvent<ID extends string, K extends keyof BaseFlightTimerEvents>(
    id: ID,
    index: number,
    bus: EventBus,
    baseTopic: K
  ): Consumer<BaseFlightTimerEvents[K]>;
  /**
   * Subscribes to one of the event bus topics related to a flight timer with a given ID.
   * @param id The ID of the timer.
   * @param index The index of the timer.
   * @param subscriber The event subscriber to use to subscribe.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public static onEvent<ID extends string, K extends keyof BaseFlightTimerEvents>(
    id: ID,
    index: number,
    subscriber: EventSubscriber<FlightTimerEventsForId<ID>>,
    baseTopic: K
  ): Consumer<BaseFlightTimerEvents[K]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static onEvent<ID extends string, K extends keyof BaseFlightTimerEvents>(
    id: ID,
    index: number,
    arg2: EventBus | EventSubscriber<FlightTimerEventsForId<ID>>,
    baseTopic: K
  ): Consumer<BaseFlightTimerEvents[K]> {
    return (arg2 instanceof EventBus ? arg2.getSubscriber<FlightTimerEventsForId<ID>>() : arg2).on(
      `${baseTopic}${FlightTimerUtils.getIdSuffix(id)}_${index}` as keyof FlightTimerEventsForId<ID> & string
    ) as unknown as Consumer<BaseFlightTimerEvents[K]>;
  }
}

/**
 * A controller for a set of flight timers.
 */
export class FlightTimerController<ID extends string> {
  private readonly publisher = this.bus.getPublisher<FlightTimerControlEvents>();

  private readonly topicMap: {
    [P in keyof BaseFlightTimerControlEvents]: `${P}${FlightTimerEventSuffix<ID>}`;
  };

  /**
   * Creates a new instance of FlightTimerController.
   * @param bus The event bus.
   * @param id The ID of the timers controlled by this controller.
   */
  public constructor(private readonly bus: EventBus, public readonly id: ID) {
    const suffix = FlightTimerUtils.getIdSuffix(id);
    this.topicMap = {
      'timer_set_mode': `timer_set_mode${suffix}`,
      'timer_set_initial_value': `timer_set_initial_value${suffix}`,
      'timer_set_value': `timer_set_value${suffix}`,
      'timer_start': `timer_start${suffix}`,
      'timer_stop': `timer_stop${suffix}`,
      'timer_reset': `timer_reset${suffix}`
    };
  }

  /**
   * Sets the active counting mode for a timer.
   * @param index The index of the timer.
   * @param mode The mode to set.
   */
  public setMode(index: number, mode: FlightTimerMode): void {
    this.publisher.pub(`${this.topicMap['timer_set_mode']}_${index}`, mode, true, false);
  }

  /**
   * Sets the initial value for a timer.
   * @param index The index of the timer.
   * @param initialValue The initial value to set, in milliseconds.
   */
  public setInitialValue(index: number, initialValue: number): void {
    this.publisher.pub(`${this.topicMap['timer_set_initial_value']}_${index}`, initialValue, true, false);
  }

  /**
   * Sets the current value for a timer.
   * @param index The index of the timer.
   * @param value The value to set, in milliseconds.
   */
  public setValue(index: number, value: number): void {
    this.publisher.pub(`${this.topicMap['timer_set_value']}_${index}`, value, true, false);
  }

  /**
   * Starts a timer.
   * @param index The index of the timer.
   */
  public start(index: number): void {
    this.publisher.pub(`${this.topicMap['timer_start']}_${index}`, undefined, true, false);
  }

  /**
   * Stops a timer.
   * @param index The index of the timer.
   */
  public stop(index: number): void {
    this.publisher.pub(`${this.topicMap['timer_stop']}_${index}`, undefined, true, false);
  }

  /**
   * Resets a timer to its initial value.
   * @param index The index of the timer.
   */
  public reset(index: number): void {
    this.publisher.pub(`${this.topicMap['timer_reset']}_${index}`, undefined, true, false);
  }
}

/**
 * Configuration options for {@link FlightTimerPublisher}.
 */
export type FlightTimerPublisherOptions = {
  /** The ID of the timers for which to publish data. Defaults to the empty ID (`''`). */
  id?: string;
};

/**
 * A publisher for flight timer information.
 */
export class FlightTimerPublisher<ID extends string = any> extends SimVarPublisher<FlightTimerEventsForId<ID>, BaseFlightTimerEventsForId<ID>> {
  /**
   * Creates a new instance of FlightTimerPublisher.
   * @param bus The event bus.
   * @param options Options with which to configure the publisher.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, options?: Readonly<FlightTimerPublisherOptions>, pacer?: PublishPacer<FlightTimerEventsForId<ID>>);
  /**
   * Creates a new instance of FlightTimerPublisher that publishes data for timers with the empty ID (`''`).
   * @param bus The event bus.
   * @param timerCount This argument is ignored.
   * @param pacer An optional pacer to use to control the rate of publishing.
   * @deprecated Please use the overload of the constructor that accepts an options object.
   */
  public constructor(bus: EventBus, timerCount: number, pacer?: PublishPacer<FlightTimerEventsForId<ID>>);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(bus: EventBus, arg2?: Readonly<FlightTimerPublisherOptions> | number, pacer?: PublishPacer<FlightTimerEventsForId<ID>>) {
    const id = (typeof arg2 === 'number' ? '' : (arg2?.id ?? '')) as ID;

    const suffix = FlightTimerUtils.getIdSuffix(id);

    const entries: [keyof BaseFlightTimerEventsForId<ID>, SimVarPublisherEntry<any>][] = [
      [`timer_mode${suffix}`, { name: `L:WTFltTimer_Mode${suffix}:#index#`, type: SimVarValueType.Number, indexed: true, defaultIndex: null }],
      [`timer_is_running${suffix}`, { name: `L:WTFltTimer_Running${suffix}:#index#`, type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      [`timer_initial_value_ms${suffix}`, { name: `L:WTFltTimer_Initial_Value${suffix}:#index#`, type: SimVarValueType.Number, indexed: true, defaultIndex: null }],
      [`timer_value_ms${suffix}`, { name: `L:WTFltTimer_Value${suffix}:#index#`, type: SimVarValueType.Number, indexed: true, defaultIndex: null }]
    ];

    super(entries, bus, pacer);
  }
}

/**
 * Configuration options for {@link FlightTimerInstrument}.
 */
export type FlightTimerInstrumentOptions = {
  /** The ID to assign to the timers. Defaults to the empty ID (`''`). */
  id?: string;

  /** The number of supported timers. */
  count: number;
};

/**
 * An instrument which manages zero or more flight timers. Requires the topics defined in {@link ClockEvents} to be
 * actively published to the event bus in order to function properly. All timers operate using simulation time and are
 * updated every instrument update cycle with up to millisecond precision.
 */
export class FlightTimerInstrument implements Instrument {
  private readonly id: string;

  private readonly timerCount: number;
  private readonly timers: Record<number, FlightTimer<string>> = {};

  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0).pause();
  private lastUpdateSimTime = this.simTime.get();

  /**
   * Creates a new instance of FlightTimerInstrument.
   * @param bus The event bus.
   * @param options Options with which to configure the instrument.
   */
  public constructor(bus: EventBus, options: Readonly<FlightTimerInstrumentOptions>);
  /**
   * Creates a new instance of FlightTimerInstrument that manages timers with the empty ID (`''`).
   * @param bus The event bus.
   * @param timerCount The number of supported timers.
   */
  public constructor(bus: EventBus, timerCount: number);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(private readonly bus: EventBus, arg2: Readonly<FlightTimerInstrumentOptions> | number) {
    if (typeof arg2 === 'number') {
      this.id = '';
      this.timerCount = Math.max(arg2, 0);
    } else {
      this.id = arg2.id ?? '';
      this.timerCount = Math.max(arg2.count, 0);
    }

    for (let i = 1; i <= this.timerCount; i++) {
      this.timers[i] = new FlightTimer(bus, this.id, i);
    }
  }

  /** @inheritDoc */
  public init(): void {
    this.simTime.resume();
    this.lastUpdateSimTime = this.simTime.get();

    for (let i = 1; i <= this.timerCount; i++) {
      this.timers[i].init(this.lastUpdateSimTime);
    }
  }

  /** @inheritDoc */
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
class FlightTimer<ID extends string> {
  private readonly idSuffix = FlightTimerUtils.getIdSuffix(this.id);

  private readonly simVars = {
    mode: `L:WTFltTimer_Mode${this.idSuffix}:${this.index}`,
    isRunning: `L:WTFltTimer_Running${this.idSuffix}:${this.index}`,
    referenceTime: `L:WTFltTimer_Reference_Time${this.idSuffix}:${this.index}`,
    referenceValue: `L:WTFltTimer_Reference_Value${this.idSuffix}:${this.index}`,
    initialValue: `L:WTFltTimer_Initial_Value${this.idSuffix}:${this.index}`,
    currentValue: `L:WTFltTimer_Value${this.idSuffix}:${this.index}`
  } as const;

  private simTime = 0;

  private mode = FlightTimerMode.CountingDown;
  private isRunning = false;
  private referenceTime = 0;
  private referenceValue = 0;
  private initialValue = 0;
  private currentValue = 0;

  /**
   * Creates a new instance of FlightTimer.
   * @param bus The event bus.
   * @param id The ID of this timer.
   * @param index The index of this timer.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly id: ID,
    private readonly index: number
  ) {
  }

  /**
   * Initializes this timer. Once this timer is initialized, it will respond to timer control events.
   * @param time The current sim time, as a UNIX timestamp in milliseconds.
   */
  public init(time: number): void {
    this.simTime = time;

    // Initialize state from SimVars
    this.mode = SimVar.GetSimVarValue(this.simVars.mode, SimVarValueType.Number);
    this.isRunning = !!SimVar.GetSimVarValue(this.simVars.isRunning, SimVarValueType.Bool);
    this.referenceTime = SimVar.GetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number);
    this.referenceValue = SimVar.GetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number);
    this.initialValue = SimVar.GetSimVarValue(this.simVars.initialValue, SimVarValueType.Number);
    this.currentValue = SimVar.GetSimVarValue(this.simVars.currentValue, SimVarValueType.Number);

    // Subscribe to control events

    const sub = this.bus.getSubscriber<FlightTimerControlEvents>();

    sub.on(`timer_set_mode${this.idSuffix}_${this.index}`).handle(mode => {
      this.mode = mode;
      this.referenceTime = this.simTime;
      this.referenceValue = this.currentValue;

      SimVar.SetSimVarValue(this.simVars.mode, SimVarValueType.Number, mode);
      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
    });

    sub.on(`timer_set_initial_value${this.idSuffix}_${this.index}`).handle(value => {
      this.initialValue = value;

      SimVar.SetSimVarValue(this.simVars.initialValue, SimVarValueType.Number, this.initialValue);
    });

    sub.on(`timer_set_value${this.idSuffix}_${this.index}`).handle(value => {
      this.referenceTime = this.simTime;
      this.referenceValue = value;
      this.currentValue = value;

      SimVar.SetSimVarValue(this.simVars.referenceTime, SimVarValueType.Number, this.referenceTime);
      SimVar.SetSimVarValue(this.simVars.referenceValue, SimVarValueType.Number, this.referenceValue);
    });

    sub.on(`timer_start${this.idSuffix}_${this.index}`).handle(() => {
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

    sub.on(`timer_stop${this.idSuffix}_${this.index}`).handle(() => {
      if (!this.isRunning) {
        return;
      }

      this.isRunning = false;

      SimVar.SetSimVarValue(this.simVars.isRunning, SimVarValueType.Bool, 0);
    });

    sub.on(`timer_reset${this.idSuffix}_${this.index}`).handle(() => {
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