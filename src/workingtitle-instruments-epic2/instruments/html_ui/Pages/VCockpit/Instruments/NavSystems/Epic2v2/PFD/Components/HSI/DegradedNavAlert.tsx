import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, LNavDataEvents, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { FmsPositionSystemEvents } from '@microsoft/msfs-epic2-shared';

import './DegradedNavAlert.css';

/** Props for {@link DegradedNavAlert}. */
export interface DegradedNavAlertProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus,
}

/** DegradedNavAlert. */
export class DegradedNavAlert extends DisplayComponent<DegradedNavAlertProps> {
  private readonly epu = ConsumerSubject.create(this.props.bus.getSubscriber<FmsPositionSystemEvents>().on('fms_pos_epu_1'), 0);
  private readonly rnp = ConsumerSubject.create(this.props.bus.getSubscriber<LNavDataEvents>().on('lnavdata_cdi_scale'), 0);

  private readonly isHidden = MappedSubject.create(([epu, rnp]) => epu < rnp, this.epu, this.rnp);

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div class={{ 'degraded-nav-alert': true, 'hidden': this.isHidden }}>
        DGRD
      </div>
    );
  }
}
