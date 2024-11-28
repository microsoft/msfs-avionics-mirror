import { ClockEvents, ComputedSubject, ConsumerSubject, DurationFormatter, EventBus, Subject, UnitType } from '@microsoft/msfs-sdk';

import { DcpEvent } from './DcpEvent';
import { DcpEvents } from './DcpEventPublisher';

/** The state of the elapsed timer */
export enum ElapsedTimeState {
  Off,
  Started,
  Stopped
}

/** State for the ET timer in bottom left of PFD. */
export class ElapsedTime {
  private static DURATION_FORMATTER = DurationFormatter.create('{mm}:{ss}', UnitType.SECOND, 1, '--:--');
  private static HR_DURATION_FORMATTER = DurationFormatter.create('H{h}:{mm}', UnitType.SECOND, 1, 'H-:--');

  public readonly elapsedTimeText = ComputedSubject.create<number, string>(NaN, ElapsedTime.getElapsedTimeString);
  public readonly elapsedTimeIsVisibile = Subject.create(false);

  private readonly currentTimestampMs = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').whenChangedBy(1000), 0);
  private readonly timerSub = this.currentTimestampMs.sub((v) => this.updateTimer(v), false, false);

  private state = ElapsedTimeState.Off;
  private startTimestampMs = 0;

  /** @inheritdoc */
  public constructor(private readonly bus: EventBus) {
    this.bus.getSubscriber<DcpEvents>().on('dcpEvent').handle(evt => evt === DcpEvent.DCP_ET && this.handleEtButtonPress());
  }

  /**
   * Handles the elapsed timer button being pressed
   * @returns void
   */
  private handleEtButtonPress(): void {
    switch (this.state) {
      case ElapsedTimeState.Off: return this.start();
      case ElapsedTimeState.Started: return this.stop();
      case ElapsedTimeState.Stopped: return this.reset();
    }
  }

  /**
   * Starts the timer
   */
  private start(): void {
    this.elapsedTimeText.set(0);
    this.elapsedTimeIsVisibile.set(true);

    this.startTimestampMs = this.currentTimestampMs.get();
    this.timerSub.resume();
    this.state = ElapsedTimeState.Started;
  }

  /**
   * Stops the timer
   */
  private stop(): void {
    this.timerSub.pause();
    this.state = ElapsedTimeState.Stopped;
  }

  /**
   * Resets the timer
   */
  private reset(): void {
    this.elapsedTimeText.set(NaN);
    this.elapsedTimeIsVisibile.set(false);
    this.state = ElapsedTimeState.Off;
  }

  /**
   * Updates the timer
   * @param currentTime The current simtime timestamp in ms
   */
  private updateTimer(currentTime: number): void {
    this.elapsedTimeText.set(Math.floor((currentTime - this.startTimestampMs) / 1000));
  }

  /**
   * Gets the elapsed time string
   * @param elapsedTime The elapsed time in milliseconds
   * @returns The elapsed time string
   */
  private static getElapsedTimeString(elapsedTime: number): string {
    return elapsedTime > 3_600_000 ? ElapsedTime.HR_DURATION_FORMATTER(elapsedTime) : ElapsedTime.DURATION_FORMATTER(elapsedTime);
  }
}
