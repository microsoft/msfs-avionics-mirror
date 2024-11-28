import { CasEvents, DebounceTimer, EventBus, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * A manager of CAS alert acknowledgement state in response to avionics power.
 */
export class CasPowerStateManager {
  /** The delay, in milliseconds, after avionics power on before newly activated CAS alerts appear as unacknowledged. */
  private static readonly POWER_ON_CAS_ACKNOWLEDGE_DELAY = 2000;

  private readonly casPublisher = this.bus.getPublisher<CasEvents>();

  private readonly casAckDebounceTimer = new DebounceTimer();

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  // TODO: use global avionics power state when infrastructure is available

  // /**
  //  * Initializes this manager. Once initialized, this manager will automatically control CAS alert acknowledgement
  //  * state in response to changes in avionics power.
  //  */
  // public init(): void {
  //   Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.loading, true)
  //     .then(() => { this.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power')
  //      .handle(this.onGlobalPowerChanged.bind(this)); });
  // }

  // /**
  //  * Responds to changes in the avionics global power state.
  //  * @param event The event describing the change in the avionics global power state.
  //  */
  // private onGlobalPowerChanged(event: Readonly<AvionicsStatusGlobalPowerEvent>): void {
  /**
   * Responds to changes in the avionics power state.
   * @param current The current power state.
   * @param previous The previous power state.
   */
  public onPowerChanged(current: boolean, previous: boolean | undefined): void {
    if (previous === true && current === false) {
      // Avionics global power off.

      // Clear master caution/warning on power off.
      this.casAckDebounceTimer.clear();
      SimVar.SetSimVarValue('K:MASTER_CAUTION_ACKNOWLEDGE', SimVarValueType.Number, 0);
      SimVar.SetSimVarValue('K:MASTER_WARNING_ACKNOWLEDGE', SimVarValueType.Number, 0);
      this.casPublisher.pub('cas_set_initial_acknowledge', true, true, false);

    } else if (current === true) {
      // Avionics global power on.

      this.casAckDebounceTimer.schedule(() => {
        this.casPublisher.pub('cas_set_initial_acknowledge', false, true, false);
      }, CasPowerStateManager.POWER_ON_CAS_ACKNOWLEDGE_DELAY);
    }
  }
}
