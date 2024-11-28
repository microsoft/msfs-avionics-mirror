import { EventBus, EventBusMetaEvents } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { BasePublisher, SimVarPublisher } from './BasePublishers';

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
   * A Javascript timestamp corresponding to the simulation world time. The timestamp uses the UNIX epoch
   * (00:00 UTC January 1, 1970) and has units of milliseconds.
   */
  simTime: number;

  /**
   * The total amount of simulated time, in milliseconds, that has elapsed since the beginning of the current
   * simulation session. This value does not change when the simulation is paused (e.g. when the in-game menu is open).
   * Note that active pause does not pause the simulation. Simulated time does scale with the simulation rate factor.
   */
  activeSimDuration: number;

  /**
   * A Javascript timestamp corresponding to the real-world (operating system) time, fired every sim frame instead of
   * on each Coherent animation frame. The timestamp uses the UNIX epoch (00:00 UTC January 1, 1970) and has units of
   * milliseconds.
   *
   * USE THIS EVENT SPARINGLY, as it will impact performance and ignores the user set glass cockpit refresh setting.
   */
  realTimeHiFreq: number;

  /**
   * A Javascript timestamp corresponding to the simulation time, fired every sim frame instead of on each Coherent
   * animation frame. The timestamp uses the UNIX epoch (00:00 UTC January 1, 1970) and has units of milliseconds.
   *
   * USE THIS EVENT SPARINGLY, as it will impact performance and ignores the user set glass cockpit refresh setting.
   */
  simTimeHiFreq: number;

  /**
   * The total amount of simulated time, in milliseconds, that has elapsed since the beginning of the current
   * simulation session, fired every sim frame instead of on each Coherent animation frame. This value does not change
   * when the simulation is paused (e.g. when the in-game menu is open). Note that active pause does not pause the
   * simulation. Simulated time does scale with the simulation rate factor.
   *
   * USE THIS EVENT SPARINGLY, as it will impact performance and ignores the user set glass cockpit refresh setting.
   */
  activeSimDurationHiFreq: number;

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

  private readonly registeredSimVarIds = {
    absoluteTime: SimVar.GetRegisteredId('E:ABSOLUTE TIME', SimVarValueType.Seconds, ''),
    simulationTime: SimVar.GetRegisteredId('E:SIMULATION TIME', SimVarValueType.Seconds, ''),
  };

  private needPublishRealTime = false;

  private readonly hiFreqTopicsToPublish = {
    realTime: false,
    simTime: false,
    activeSimDuration: false
  };

  private hiFreqInterval?: NodeJS.Timeout;

  /**
   * Creates a new instance of ClockPublisher.
   * @param bus The event bus.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<ClockEvents>) {
    super(bus, pacer);

    this.simVarPublisher = new SimVarPublisher<ClockEvents>([
      ['simTime', { name: 'E:ABSOLUTE TIME', type: SimVarValueType.Seconds, map: ClockPublisher.absoluteTimeToUNIXTime }],
      ['activeSimDuration', { name: 'E:SIMULATION TIME', type: SimVarValueType.Seconds, map: seconds => seconds * 1000 }],
      ['simRate', { name: 'E:SIMULATION RATE', type: SimVarValueType.Number }],
      ['zulu_sunrise', { name: 'E:ZULU SUNRISE TIME', type: SimVarValueType.Seconds }],
      ['zulu_sunset', { name: 'E:ZULU SUNSET TIME', type: SimVarValueType.Seconds }],
    ], bus, pacer);

    if (this.bus.getTopicSubscriberCount('realTime') > 0) {
      this.needPublishRealTime = true;
    }
    if (this.bus.getTopicSubscriberCount('realTimeHiFreq') > 0) {
      this.hiFreqTopicsToPublish.realTime = true;
    }
    if (this.bus.getTopicSubscriberCount('simTimeHiFreq') > 0) {
      this.hiFreqTopicsToPublish.simTime = true;
    }
    if (this.bus.getTopicSubscriberCount('activeSimDurationHiFreq') > 0) {
      this.hiFreqTopicsToPublish.activeSimDuration = true;
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(this.onTopicFirstSub.bind(this));
  }

  /**
   * Responds to when a topic is first subscribed to on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicFirstSub(topic: string): void {
    switch (topic) {
      case 'realTime':
        if (!this.needPublishRealTime) {
          this.needPublishRealTime = true;
          if (this.publishActive) {
            this.publish('realTime', Date.now());
          }
        }
        break;
      case 'realTimeHiFreq':
        if (!this.hiFreqTopicsToPublish.realTime) {
          this.hiFreqTopicsToPublish.realTime = true;
          if (this.publishActive) {
            this.publish('realTimeHiFreq', Date.now());
          }
        }
        break;
      case 'simTimeHiFreq':
        if (!this.hiFreqTopicsToPublish.simTime) {
          this.hiFreqTopicsToPublish.simTime = true;
          if (this.publishActive) {
            this.publish('simTimeHiFreq', ClockPublisher.absoluteTimeToUNIXTime(SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.absoluteTime)));
          }
        }
        break;
      case 'activeSimDurationHiFreq':
        if (!this.hiFreqTopicsToPublish.activeSimDuration) {
          this.hiFreqTopicsToPublish.activeSimDuration = true;
          if (this.publishActive) {
            this.publish('activeSimDurationHiFreq', SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.simulationTime) * 1000);
          }
        }
        break;
    }
  }

  /** @inheritdoc */
  public startPublish(): void {
    super.startPublish();

    this.simVarPublisher.startPublish();

    if (this.hiFreqInterval === undefined) {
      this.hiFreqInterval = setInterval(this.publishHiFreq.bind(this), 0);
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
   * Publishes the high-frequency topics.
   */
  private publishHiFreq(): void {
    if (this.hiFreqTopicsToPublish.realTime) {
      this.publish('realTimeHiFreq', Date.now());
    }

    if (this.hiFreqTopicsToPublish.simTime) {
      this.publish('simTimeHiFreq', ClockPublisher.absoluteTimeToUNIXTime(SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.absoluteTime)));
    }

    if (this.hiFreqTopicsToPublish.activeSimDuration) {
      this.publish('activeSimDurationHiFreq', SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.simulationTime) * 1000);
    }
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
