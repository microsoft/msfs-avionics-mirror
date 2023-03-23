import { AdcEvents, EventBus, GNSSEvents, LNavEvents, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { WT21LNavDataEvents } from '../../FMC/Autopilot/WT21LNavDataEvents';

/**
 * Handles display bindings for the waypoint alert flashing functionality
 * on the WT21.
 */
export class WaypointAlerter {
  private readonly displayed = Subject.create(false);

  private isFlashing = false;
  private previousTime = 0;

  private currentDistance = Number.POSITIVE_INFINITY;
  private anticipationDistance = 0;
  private isTracking = false;
  private currentGroundSpeed = 0;
  private isOnGround = false;
  private nominalLegIndex = 0;

  /**
   * Whether or not the current flashable display elements should
   * be displayed or not.
   * @returns A subject to subscribe to the current display state.
   */
  public get isDisplayed(): Subscribable<boolean> {
    return this.displayed;
  }

  /**
   * Creates an instance of the WaypointAlerter.
   * @param bus The instance of the event bus to use.
   */
  constructor(private readonly bus: EventBus) {
    const sub = bus.getSubscriber<AdcEvents & GNSSEvents & LNavEvents & WT21LNavDataEvents>();
    sub.on('lnavdata_waypoint_distance').whenChanged().handle(d => { this.currentDistance = d; this.handleChanged(); });
    sub.on('lnav_vector_anticipation_distance').whenChanged().handle(d => { this.anticipationDistance = d; });
    sub.on('lnav_is_tracking').whenChanged().handle(t => { this.isTracking = t; this.handleChanged(); });
    sub.on('ground_speed').whenChanged().handle(s => { this.currentGroundSpeed = s; this.handleChanged(); });
    sub.on('on_ground').whenChanged().handle(s => { this.isOnGround = s; this.handleChanged(); });
    sub.on('lnavdata_nominal_leg_index').handle(s => { this.nominalLegIndex = s; this.handleChanged(); });
  }

  /**
   * Handles when the time to turn changes.
   */
  private handleChanged(): void {
    const ttg = ((this.currentDistance - this.anticipationDistance) / this.currentGroundSpeed) * 3600;
    const isFlashing = !this.isOnGround && (this.nominalLegIndex > 0) && this.isTracking && isFinite(ttg) && ttg <= 5;

    if (isFlashing !== this.isFlashing) {
      this.isFlashing = isFlashing;
      this.previousTime = 0;
      this.displayed.set(true);

      if (isFlashing) {
        requestAnimationFrame(this.animateFlash);
      }
    }
  }

  /**
   * Animates the waypoint alert flash.
   * @param timestamp The timestamp of the frame.
   */
  private animateFlash = (timestamp: number): void => {
    if (this.previousTime === 0) {
      this.previousTime = timestamp;
    }

    const deltaTime = timestamp - this.previousTime;
    if (deltaTime >= 500) {
      this.displayed.set(!this.displayed.get());
      this.previousTime = timestamp - (deltaTime % 500);
    }

    if (this.isFlashing) {
      requestAnimationFrame(this.animateFlash);
    }
  };
}