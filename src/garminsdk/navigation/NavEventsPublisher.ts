import { EventBus, EventRepublisher, NavComEvents, NavEvents } from '@microsoft/msfs-sdk';

/**
 * Publishes select {@link NavEvents} topics in lieu of NavProcessor.
 */
export class NavEventsPublisher {
  private readonly republisher = new EventRepublisher<NavComEvents, NavEvents>(this.bus);

  private _isPublishing = false;

  /**
   * Creates an instance of NavEventPublisher.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Start publishing.
   */
  public startPublish(): void {
    if (this._isPublishing) {
      return;
    }

    this._isPublishing = true;

    this.republisher.startRepublish('gps_obs_active_simvar', 'gps_obs_active', false, true);
    this.republisher.startRepublish('gps_obs_value_simvar', 'gps_obs_value', false, true);
    this.republisher.startRepublish('marker_beacon_state', 'mkr_bcn_state', false, true);
  }

  /**
   * Stop publishing.
   */
  public stopPublish(): void {
    if (!this._isPublishing) {
      return;
    }

    this._isPublishing = false;

    this.republisher.clearRepublishes();
  }

  /**
   * A callback called when this publisher receives an update cycle.
   */
  public onUpdate(): void {
    return;
  }
}