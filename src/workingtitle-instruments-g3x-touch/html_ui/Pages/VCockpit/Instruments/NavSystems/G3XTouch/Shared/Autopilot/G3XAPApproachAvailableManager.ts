import { ControlEvents, EventBus, Publisher, Subscription } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { G3XFplSourceDataProvider } from '../FlightPlan/G3XFplSourceDataProvider';

/**
 * A manager that automatically publishes the approach active state of the current flight plan source to the
 * `approach_available` event bus topic.
 */
export class G3XAPApproachAvailableManager {
  private readonly publisher: Publisher<ControlEvents>;

  private isAlive = true;
  private isInit = false;

  private fmsSub?: Subscription;
  private approachActiveSub?: Subscription;

  /**
   * Creates a new instance of G3XAPApproachAvailableManager.
   * @param bus The event bus.
   * @param fplSourceDataProvider A provider of flight plan source data.
   */
  public constructor(bus: EventBus, private readonly fplSourceDataProvider: G3XFplSourceDataProvider) {
    this.publisher = bus.getPublisher<ControlEvents>();
  }

  /**
   * Initializes this manager. Once initialized, the manager will automatically publish the approach active state of
   * the current flight plan source to the `approach_available` event bus topic.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('G3XAPApproachAvailableManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.fmsSub = this.fplSourceDataProvider.fms.sub(this.onFmsChanged.bind(this), true);
  }

  /**
   * Responds to when the FMS associated with the current flight plan source changes.
   * @param fms The new FMS associated with the current flight plan source.
   */
  private onFmsChanged(fms: Fms): void {
    this.approachActiveSub?.destroy();

    this.approachActiveSub = fms.onEvent('fms_flight_phase').handle(flightPhase => {
      this.publisher.pub('approach_available', flightPhase.isApproachActive, true, true);
    });
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer automatically publish data.
   */
  public destroy(): void {
    this.isAlive = false;

    this.fmsSub?.destroy();
    this.approachActiveSub?.destroy();
  }
}
