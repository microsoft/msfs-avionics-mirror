import { ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { Epic2MinimumsEvents, MinimumsAlerterState } from './MinimumsAlertController';

import './MinimumsAlert.css';

/** The minimums alert props. */
export interface MinimumsAlertProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The minimums alert component. */
export class MinimumsAlert extends DisplayComponent<MinimumsAlertProps> {

  private readonly alertState = ConsumerSubject.create(this.props.bus.getSubscriber<Epic2MinimumsEvents>()
    .on('minimums_alerter_state'), MinimumsAlerterState.DISARMED);

  private readonly isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.declutter,
    this.alertState.map(state => state === 'DISARMED' || state === 'ARMED')
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      'border-box': true,
      'minimums-alert-container': true,
      'hidden': this.isHidden
    }}>
      <span class={{
        'minimums-alert-container-span': true,
        'hidden': this.alertState.map(state => state !== 'ALERT')
      }}>MIN</span>
    </div>;
  }
}
