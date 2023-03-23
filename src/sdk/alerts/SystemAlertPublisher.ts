import { AnnunciationType } from '../components';
import { BasePublisher } from '../instruments';

/** Events relating to the alert system. */
export interface SystemAlertEvents {
  /** An event to fire with an alert index when a new alert arrives. */
  alert_triggered: number;
  /** An event to fire with an alert index when an existing alert is cleared. */
  alert_cleared: number;
  /** An event to fire when a master acknowledge is executed. */
  master_acknowledge: AnnunciationType;
}

/**
 * A publisher for system alert messages.  This publisher works primarily with integers
 * that are indicies into an array of annunciation messages for the host instrument
 * as provided by the panel.xml configuration parser.
 * */
export class SystemAlertPublisher extends BasePublisher<SystemAlertEvents> {
  /**
   * Publish an alert event.
   * @param event The event from SystemAlertEvents.
   * @param value The value for the event.
   */
  public publishAlert<K extends keyof SystemAlertEvents>(event: K, value: SystemAlertEvents[K]): void {
    this.publish(event, value, true, false);
  }
}