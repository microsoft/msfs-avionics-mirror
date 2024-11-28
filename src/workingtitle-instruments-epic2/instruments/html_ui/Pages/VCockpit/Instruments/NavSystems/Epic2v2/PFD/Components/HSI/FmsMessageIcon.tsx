import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { FmsMessageEvents } from '@microsoft/msfs-epic2-shared';

import './FmsMessageIcon.css';

/** Props for {@link FmsMessageIcon}. */
export interface FmsMessageIconProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus,
}

/** FmsMessageIcon. */
export class FmsMessageIcon extends DisplayComponent<FmsMessageIconProps> {
  private readonly fmsMessageCount = ConsumerSubject.create(this.props.bus.getSubscriber<FmsMessageEvents>().on('fms_message_count'), 0);

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div
        class={{
          'fms-message-icon': true,
          'hidden': this.fmsMessageCount.map(count => count === 0),
        }}
      >
        MSG
      </div>
    );
  }
}
