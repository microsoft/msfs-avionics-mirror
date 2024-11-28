import { AnnunciationType, CasAlertTransporter, CasRegistrationManager, ConsumerSubject, EventBus } from '@microsoft/msfs-sdk';

import { Sr22tCapsCrewAlertIDs } from './Sr22tCapsCrewAlertIDs';
import { Sr22tCapsEvents } from './Sr22tCapsEvents';
import { Sr22tCapsState } from './Sr22tCapsTypes';

/**
 * Manages Cirrus SR22T CAPS CAS and aural alerts.
 */
export class Sr22tCapsCrewAlerts {

  private readonly casRegistrationManager = new CasRegistrationManager(this.bus);

  /**
   * Creates an instance of Sr22tCapsCrewAlerts.
   * @param bus The event bus to use with this instance.
   */
  public constructor(private readonly bus: EventBus) {
    this.casRegistrationManager.register({
      uuid: Sr22tCapsCrewAlertIDs.CapsActivated,
      message: 'CAPS ACTIVATED'
    });

    this.initAlerts();
  }

  /**
   * Initalizes this manager's alerts.
   */
  private initAlerts(): void {
    // ---- CAS alerts ----

    const sub = this.bus.getSubscriber<Sr22tCapsEvents>();

    CasAlertTransporter.create(this.bus, Sr22tCapsCrewAlertIDs.CapsActivated, AnnunciationType.Warning)
      .bind(ConsumerSubject.create(sub.on('sr22t_caps_state'), Sr22tCapsState.Idle), state => state !== Sr22tCapsState.Idle);
  }
}
