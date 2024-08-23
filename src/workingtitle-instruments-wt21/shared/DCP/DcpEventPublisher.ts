import { BasePublisher } from '@microsoft/msfs-sdk';

import { DcpEvent } from './DcpEvent';

// eslint-disable-next-line jsdoc/require-jsdoc
export interface DcpEvents {
  // eslint-disable-next-line jsdoc/require-jsdoc
  dcpEvent: DcpEvent,
}

// eslint-disable-next-line jsdoc/require-jsdoc
export class DcpEventPublisher extends BasePublisher<DcpEvents> {
  /**
   * Dispatches an `DcpEvent` to the event bus.
   * @param event The `DcpEvent` to dispatch.
   * @param sync Whether this event should be synced (optional, default false)
   */
  public dispatchHEvent(event: DcpEvent, sync = false): void {
    if (this.isDcpEvent(event)) {
      this.publish('dcpEvent', event, sync);
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isDcpEvent(event: DcpEvent): event is DcpEvent {
    return event in DcpEvent;
  }
}
