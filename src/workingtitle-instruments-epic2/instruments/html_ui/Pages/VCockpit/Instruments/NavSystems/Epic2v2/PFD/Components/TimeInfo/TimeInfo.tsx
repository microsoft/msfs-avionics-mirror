import {
  ClockEvents, ComponentProps, ComputedSubject, ConsumerSubject, DateTimeFormatter, DebounceTimer, DisplayComponent, EventBus, FSComponent, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { Epic2PfdControlEvents } from '@microsoft/msfs-epic2-shared';

import './TimeInfo.css';

// eslint-disable-next-line jsdoc/require-jsdoc
export type ElapsedTimeState = 'Off' | 'Zero' | 'Started' | 'Stopped';

/**
 * Component props for TimeInfo.
 */
export interface TimeInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * An Epic2 PFD time information display. Displays the value of the elapsed timer and the current time.
 */
export class TimeInfo extends DisplayComponent<TimeInfoProps> {
  private readonly sub = this.props.bus.getSubscriber<ClockEvents>();

  private readonly simTimeRef = FSComponent.createRef<HTMLDivElement>();

  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime').withPrecision(-3), 0);
  private readonly utcTimeDisplay = this.simTime.map(DateTimeFormatter.create('{HH}:{mm}'));

  public readonly elapsedTimeText = ComputedSubject.create(null as number | null, this.elapsedSecondsToString);
  public readonly elapsedTimeIsVisible = Subject.create(false);
  private readonly currentTimestampMs = ConsumerSubject.create(this.sub.on('simTime'), 0);
  private state: ElapsedTimeState = 'Off';
  private startTimestampMs = 0;

  private readonly elapsedTimeOffDelay = new DebounceTimer();

  private currentTimestampMsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.currentTimestampMsSub = this.currentTimestampMs.sub(this.handleTick, false, true);

    this.props.bus.getSubscriber<Epic2PfdControlEvents>().on('pfd_control_timer_push').handle(this.handleEtButtonPress.bind(this));
  }

  public readonly handleEtButtonPress = (): void => {
    switch (this.state) {
      case 'Off': return this.zero();
      case 'Zero': return this.start();
      case 'Started': return this.stop();
      case 'Stopped': return this.reset();
    }
  };

  private readonly zero = (): void => {
    this.elapsedTimeText.set(0);
    this.elapsedTimeIsVisible.set(true);
    this.state = 'Zero';
  };

  private readonly start = (): void => {
    this.elapsedTimeOffDelay.clear();
    this.elapsedTimeText.set(0);
    this.elapsedTimeIsVisible.set(true);
    this.startTimestampMs = this.currentTimestampMs.get();
    this.currentTimestampMsSub!.resume();
    this.state = 'Started';
  };

  private readonly stop = (): void => {
    this.currentTimestampMsSub!.pause();
    this.state = 'Stopped';
  };

  private readonly reset = (): void => {
    this.zero();
    this.elapsedTimeOffDelay.schedule(() => {
      this.elapsedTimeText.set(null);
      this.elapsedTimeIsVisible.set(false);
      this.state = 'Off';
    }, 30000);
  };

  private readonly handleTick = (timestampMs: number): void => {
    this.elapsedTimeText.set(Math.floor((timestampMs - this.startTimestampMs) / 1000));
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private elapsedSecondsToString(elapsedSeconds: number | null): string {
    if (elapsedSeconds === null) {
      return '';
    } else {
      const hours = Math.floor(elapsedSeconds / 3600);
      const leftoverSeconds = elapsedSeconds % 3600;
      const minutes = Math.floor(leftoverSeconds / 60);
      const seconds = elapsedSeconds % 60;
      if (hours < 1) {
        return `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`;
      } else if (hours < 24) {
        return `H ${hours.toFixed(0)}:${minutes.toFixed(0).padStart(2, '0')}`;
      } else {
        return '--:--';
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="time-info">
        <div class='time-row time' ref={this.simTimeRef}>
          <div class='time-value'>{this.utcTimeDisplay}<span class='z-suffix'>Z</span></div>
        </div>
        <div class='time-row timer'>
          <div class='time-value'>{this.elapsedTimeText}<span class={{ 'et-suffix': true, 'visible': this.elapsedTimeIsVisible }}>ET</span></div>
        </div>
      </div>
    );
  }

}
