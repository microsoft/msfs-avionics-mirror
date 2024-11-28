import { BasePublisher, EventBus } from '@microsoft/msfs-sdk';
import { GnsCdiMode } from './Instruments/CDINavSource';


/**
 * Interface for gns_cdi_mode event.
 */
export interface GNSCdiModeEvent {
  /** The Nav Index for the instrument sending the event. */
  navIndex: number;

  /** The GnsCdiMode for the instrument sending the event. */
  gnsCdiMode: GnsCdiMode;
}

/** GNS-specific control events */
export interface GNSEvents {
  /** Set the AP nav source to a given NavSourceID index. */
  set_ap_nav_source: number;

  /** Publishes the GnsCdiMode for the instrument across the bus. */
  gns_cdi_mode: GNSCdiModeEvent;
}

/** A control publisher that handles GNS-specific events. */
export class GNSEventPublisher extends BasePublisher<any> {
  /**
   * Create a ControlPublisher.
   * @param bus The EventBus to publish to.
   */
  public constructor(bus: EventBus) {
    super(bus);
  }

  /**
   * Publish a control event.
   * @param event The event from ControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof GNSEvents>(event: K, value: any[K]): void {
    this.publish(event, value, true);
  }
}
