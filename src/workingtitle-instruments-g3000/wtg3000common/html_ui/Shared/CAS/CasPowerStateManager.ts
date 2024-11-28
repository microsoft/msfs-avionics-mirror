import { CasEvents, DebounceTimer, EventBus, GameStateProvider, SimVarValueType, Wait } from '@microsoft/msfs-sdk';
import { AvionicsStatusEvents, AvionicsStatusGlobalPowerEvent } from '../AvionicsStatus/AvionicsStatusEvents';

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

  /**
   * Initializes this manager. Once initialized, this manager will automatically control CAS alert acknowledgement
   * state in response to changes in avionics power.
   */
  public init(): void {
    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.loading || state === GameState.ingame, true)
      .then(() => { this.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power').handle(this.onGlobalPowerChanged.bind(this)); });
  }

  /**
   * Responds to changes in the avionics global power state.
   * @param event The event describing the change in the avionics global power state.
   */
  private onGlobalPowerChanged(event: Readonly<AvionicsStatusGlobalPowerEvent>): void {
    if (event.previous === true && event.current === false) {
      // Avionics global power off.

      // Clear master caution/warning on power off.
      this.casAckDebounceTimer.clear();
      SimVar.SetSimVarValue('K:MASTER_CAUTION_ACKNOWLEDGE', SimVarValueType.Number, 0);
      SimVar.SetSimVarValue('K:MASTER_WARNING_ACKNOWLEDGE', SimVarValueType.Number, 0);
      this.casPublisher.pub('cas_set_initial_acknowledge', true, true, false);

    } else if (event.current === true) {
      // Avionics global power on.

      this.casAckDebounceTimer.schedule(() => {
        this.casPublisher.pub('cas_set_initial_acknowledge', false, true, false);
      }, CasPowerStateManager.POWER_ON_CAS_ACKNOWLEDGE_DELAY);
    }
  }
}