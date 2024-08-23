import { ClockEvents, ComputedSubject, ConsumerSubject, EventBus, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { DcpEvent } from './DcpEvent';
import { DcpEvents } from './DcpEventPublisher';

// eslint-disable-next-line jsdoc/require-jsdoc
export type ElapsedTimeState = 'Off' | 'Started' | 'Stopped';

/** State for the ET timer in bottom left of PFD. */
export class ElapsedTime {
  public readonly elapsedTimeText = ComputedSubject.create(null as number | null, elapsedSecondsToString);
  public readonly elapsedTimeIsVisibile = Subject.create(false);
  private readonly currentTimestampMs: Subscribable<number>;
  private state: ElapsedTimeState = 'Off';
  private startTimestampMs = 0;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(private readonly bus: EventBus) {
    this.currentTimestampMs = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);

    this.bus.getSubscriber<DcpEvents>().on('dcpEvent')
      .handle(x => x === DcpEvent.DCP_ET && this.handleEtButtonPress());
  }

  public readonly handleEtButtonPress = (): void => {
    switch (this.state) {
      case 'Off': return this.start();
      case 'Started': return this.stop();
      case 'Stopped': return this.reset();
    }
  };

  private readonly start = (): void => {
    this.elapsedTimeText.set(0);
    this.elapsedTimeIsVisibile.set(true);
    this.startTimestampMs = this.currentTimestampMs.get();
    this.currentTimestampMs.sub(this.handleTick);
    this.state = 'Started';
  };

  private readonly stop = (): void => {
    this.currentTimestampMs.unsub(this.handleTick);
    this.state = 'Stopped';
  };

  private readonly reset = (): void => {
    this.elapsedTimeText.set(null);
    this.elapsedTimeIsVisibile.set(false);
    this.state = 'Off';
  };

  private readonly handleTick = (timestampMs: number): void => {
    this.elapsedTimeText.set(Math.floor((timestampMs - this.startTimestampMs) / 1000));
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
function elapsedSecondsToString(elapsedSeconds: number | null): string {
  if (elapsedSeconds === null) {
    return '';
  } else {
    const hours = Math.floor(elapsedSeconds / 3600);
    const leftoverSeconds = elapsedSeconds % 3600;
    const minutes = Math.floor(leftoverSeconds / 60);
    const seconds = elapsedSeconds % 60;
    if (hours < 1) {
      return `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`;
    } else if (hours < 10) {
      return `H${hours.toFixed(0)}:${minutes.toFixed(0).padStart(2, '0')}`;
    } else {
      return '--:--';
    }
  }
}
