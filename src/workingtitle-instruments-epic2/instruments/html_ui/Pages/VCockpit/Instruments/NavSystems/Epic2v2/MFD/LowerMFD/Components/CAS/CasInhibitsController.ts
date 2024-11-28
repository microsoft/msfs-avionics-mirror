import { CasEvents, EventBus } from '@microsoft/msfs-sdk';
import { DefaultCasInhibitStateDataProvider, InhibitState, InhibitStates } from '@microsoft/msfs-epic2-shared';

/**
 * Handles the common inhibit conditions on Epic 2.
 */
export class CasInhibitsController {
  private readonly casPublisher = this.bus.getPublisher<CasEvents>();
  private previousInhibitState: InhibitStates | null = null;

  /**
   * Creates an instance of the CasInhibitsController.
   * @param bus The event bus to use with this instance.
   * @param casInhibitStateProvider the CAS inhibit state data provider
   * */
  constructor(
    private readonly bus: EventBus,
    private readonly casInhibitStateProvider: DefaultCasInhibitStateDataProvider,
  ) {
    casInhibitStateProvider.state.sub((state) => {
      if (state === this.previousInhibitState) {
        // Nothing has changed, keep the same inhibit state.
        return;
      }
      // Only one inhibit can be active, deactivate the previous one.
      this.previousInhibitState && this.casPublisher.pub('cas_deactivate_inhibit_state', this.previousInhibitState, true, false);

      if (state === InhibitState.None) {
        return;
      }

      this.casPublisher.pub('cas_activate_inhibit_state', state, true, false);

      // Store for future data emissions from getInhibitState
      this.previousInhibitState = state;
    }, true);
  }

  /**
   * Initializes this controller.
   */
  public init(): void {
    this.casInhibitStateProvider.init();
  }
}
