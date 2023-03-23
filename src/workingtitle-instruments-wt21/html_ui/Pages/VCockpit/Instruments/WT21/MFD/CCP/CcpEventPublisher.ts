import { BasePublisher } from '@microsoft/msfs-sdk';

import { CcpEvent } from './CcpEvent';

// eslint-disable-next-line jsdoc/require-jsdoc
export interface CcpEventPublisherType {
    // eslint-disable-next-line jsdoc/require-jsdoc
    ccpEvent: CcpEvent,
}

// eslint-disable-next-line jsdoc/require-jsdoc
export class CcpEventPublisher extends BasePublisher<CcpEventPublisherType> {
    /**
     * Dispatches an `CcpEvent` to the event bus.
     * @param event The `CcpEvent` to dispatch.
     * @param sync Whether this event should be synced (optional, default false)
     */
    public dispatchHEvent(event: CcpEvent, sync = false): void {
        if (this.isCcpEvent(event)) {
            this.publish('ccpEvent', event, sync);
        }
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    private isCcpEvent(event: CcpEvent): event is CcpEvent {
        return event in CcpEvent;
    }
}
