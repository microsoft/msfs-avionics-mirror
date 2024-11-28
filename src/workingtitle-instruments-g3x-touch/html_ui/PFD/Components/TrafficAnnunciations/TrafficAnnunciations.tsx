import { FSComponent, DisplayComponent, VNode, SetSubject, TcasEvents, DebounceTimer, EventBus } from '@microsoft/msfs-sdk';

import './TrafficAnnunciations.css';

/**
 * TrafficAnnunciations component props
 */
export interface TrafficAnnunciationsProps {
  /**
   * An instance of the EventBus.
   */
  bus: EventBus;
}

/**
 * TrafficAnnunciations component
 */
export class TrafficAnnunciations extends DisplayComponent<TrafficAnnunciationsProps> {

  private readonly trafficAnnunciationsClass = SetSubject.create(['traffic-annunciations', 'hidden']);
  private readonly annunciationsSub = this.props.bus.getSubscriber<TcasEvents>()
    .on('tcas_ta_intruder_count')
    .handle(this.onTcasTaIntruderCountChanged.bind(this));

  private readonly hideFlashingDebouncingTimer: DebounceTimer = new DebounceTimer();

  private taCount = 0;

  /**
   * A callback called when the TA intruder count changes.
   * @param taCount traffic annunciations intruder count.
   */
  private onTcasTaIntruderCountChanged(taCount: number): void {

    if (taCount > this.taCount) {
      this.trafficAnnunciationsClass.add('traffic-annunciation-flash');
      this.hideFlashingDebouncingTimer.schedule(this.stopFlashing.bind(this), 5000);
    }

    this.trafficAnnunciationsClass.toggle('hidden', taCount === 0);

    this.taCount = taCount;
  }

  /**
   * Stops the traffic annunciations flashing.
   */
  private stopFlashing(): void {
    this.trafficAnnunciationsClass.delete('traffic-annunciation-flash');
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.trafficAnnunciationsClass}>
        TRAFFIC
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.hideFlashingDebouncingTimer.clear();
    this.annunciationsSub.destroy();
  }
}