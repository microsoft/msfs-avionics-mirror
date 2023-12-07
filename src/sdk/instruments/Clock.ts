import { EventBus, EventBusMetaEvents } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { BasePublisher, SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events related to the clock.
 */
export interface ClockEvents {
  /**
   * A Javascript timestamp corresponding to the real-world (operating system) time. The timestamp uses the UNIX epoch
   * (00:00 UTC January 1, 1970) and has units of milliseconds.
   */
  realTime: number;

  /**
   * A Javascript timestamp corresponding to the simulation time. The timestamp uses the UNIX epoch
   * (00:00 UTC January 1, 1970) and has units of milliseconds.
   */
  simTime: number;

  /**
   * A Javascript timestamp corresponding to the simulation time, fired every sim frame instead of on each Coherent
   * animation frame. The timestamp uses the UNIX epoch (00:00 UTC January 1, 1970) and has units of milliseconds.
   *
   * USE THIS EVENT SPARINGLY, as it will impact performance and ignores the user set glass cockpit refresh setting.
   */
  simTimeHiFreq: number;

  /** The simulation rate factor. */
  simRate: number;

  /** The seconds since midnight (zulu time) until sunrise at the aircraft's location. */
  zulu_sunrise: number;

  /** The seconds since midnight (zulu time) until sunset at the aircraft's location. */
  zulu_sunset: number;
}

/**
 * A publisher of clock events.
 */
export class ClockPublisher extends BasePublisher<ClockEvents> {
  private readonly simVarPublisher: SimVarPublisher<ClockEvents>;

  private needPublishRealTime = false;

  private hiFreqInterval?: NodeJS.Timer;

  /**
   * Creates a new instance of ClockPublisher.
   * @param bus The event bus.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<ClockEvents>) {
    super(bus, pacer);

    this.simVarPublisher = new SimVarPublisher(new Map<keyof ClockEvents, SimVarPublisherEntry<any>>([
      ['simTime', { name: 'E:ABSOLUTE TIME', type: SimVarValueType.Seconds, map: ClockPublisher.absoluteTimeToUNIXTime }],
      ['simRate', { name: 'E:SIMULATION RATE', type: SimVarValueType.Number }],
      ['zulu_sunrise', { name: 'E:ZULU SUNRISE TIME', type: SimVarValueType.Seconds }],
      ['zulu_sunset', { name: 'E:ZULU SUNSET TIME', type: SimVarValueType.Seconds }],
    ]), bus, pacer);

    if (this.bus.getTopicSubscriberCount('realTime') > 0) {
      this.needPublishRealTime = true;
    } else {
      const sub = this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
        if (topic === 'realTime') {
          this.needPublishRealTime = true;
          sub.destroy();
        }
      }, true);
      sub.resume();
    }
  }

  /** @inheritdoc */
  public startPublish(): void {
    super.startPublish();

    this.simVarPublisher.startPublish();

    if (this.hiFreqInterval === undefined) {
      this.hiFreqInterval = setInterval(() => this.publish('simTimeHiFreq', ClockPublisher.absoluteTimeToUNIXTime(SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds'))), 0);
    }
  }

  /** @inheritdoc */
  public stopPublish(): void {
    super.stopPublish();

    this.simVarPublisher.stopPublish();

    if (this.hiFreqInterval !== undefined) {
      clearInterval(this.hiFreqInterval);
      this.hiFreqInterval = undefined;
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (this.needPublishRealTime) {
      this.publish('realTime', Date.now());
    }

    this.simVarPublisher.onUpdate();
  }

  /**
   * Converts the sim's absolute time to a UNIX timestamp. The sim's absolute time value is equivalent to a .NET
   * DateTime.Ticks value (epoch = 00:00:00 01 Jan 0001).
   * @param absoluteTime an absolute time value, in units of seconds.
   * @returns the UNIX timestamp corresponding to the absolute time value.
   */
  private static absoluteTimeToUNIXTime(absoluteTime: number): number {
    return (absoluteTime - 62135596800) * 1000;
  }
}

/**
 * A clock which keeps track of real-world and sim time.
 */
export class Clock {
  private publisher: ClockPublisher;

  /**
   * Constructor.
   * @param bus The event bus to use to publish events from this clock.
   */
  constructor(bus: EventBus) {
    this.publisher = new ClockPublisher(bus);
  }

  /**
   * Initializes this clock.
   */
  public init(): void {
    this.publisher.startPublish();
  }

  /**
   * Updates this clock.
   */
  public onUpdate(): void {
    this.publisher.onUpdate();
  }
}
