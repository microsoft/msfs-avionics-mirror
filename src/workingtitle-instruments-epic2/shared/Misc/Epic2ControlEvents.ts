import { BasePublisher, EventBus } from '@microsoft/msfs-sdk';

/** Extension of generic ControlEvents to handle Epic2-specific events. */
export interface Epic2ControlEvents {
  /** Event indicating an active minimums alert */
  minimums_alert: boolean;

  /** Indicates whether there is an active radio minimums alert */
  radio_minimums_alert: boolean;
}

/** A control publisher that handles Epic2 events. */
export class Epic2ControlPublisher extends BasePublisher<Epic2ControlEvents> {
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
  public publishEvent<K extends keyof Epic2ControlEvents>(event: K, value: Epic2ControlEvents[K]): void {
    this.publish(event, value, true);
  }
}
