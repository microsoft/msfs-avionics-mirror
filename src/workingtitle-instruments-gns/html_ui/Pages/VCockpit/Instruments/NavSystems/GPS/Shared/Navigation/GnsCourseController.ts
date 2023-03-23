import { LNavDataEvents } from '@microsoft/msfs-garminsdk';
import { ConsumerSubject, EventBus, LNavEvents, NavMath, NavProcSimVars, Publisher, Wait } from '@microsoft/msfs-sdk';
import { AlertMessage, AlertMessageEvents } from '../UI/Pages/Dialogs/AlertsSubject';

/**
 * A Course controller for the GNS.
 */
export class GnsCourseController {
  private readonly navObs: ConsumerSubject<number>;
  private readonly dtk: ConsumerSubject<number>;
  private opId = 0;
  private readonly publisher: Publisher<AlertMessageEvents>;
  private activeDtkMessage: number | null = null;


  /**
   * Creates an instance of a GnsCourseController.
   * @param bus An instance of the event bus.
   * @param navIndex index to the nav system
   */
  constructor(bus: EventBus, navIndex: number) {
    this.dtk = ConsumerSubject.create(bus.getSubscriber<LNavDataEvents>().on('lnavdata_dtk_mag'), 0);
    bus.getSubscriber<LNavEvents>().on('lnav_tracked_leg_index').whenChanged().handle(this.onTrackedLegChanged.bind(this));

    this.publisher = bus.getPublisher<AlertMessageEvents>();

    switch (navIndex) {
      case 2:
        //TODO: Is there a way to verify that there is a second CDI installed?
        this.navObs = ConsumerSubject.create(bus.getSubscriber<NavProcSimVars>().on('nav_obs_2'), 0);
        break;
      case 3:
        this.navObs = ConsumerSubject.create(bus.getSubscriber<NavProcSimVars>().on('nav_obs_3'), 0);
        break;
      default:
        this.navObs = ConsumerSubject.create(bus.getSubscriber<NavProcSimVars>().on('nav_obs_1'), 0);
    }

    this.navObs.sub(v => {
      if (this.activeDtkMessage !== null) {
        const dtk = this.dtk.get();
        if (Math.abs(NavMath.diffAngle(dtk, v)) < 5) {
          this.publisher.pub('alerts_remove', 'lnav-set-course', false, false);
          this.activeDtkMessage = null;
        }
      }
    });
  }


  /**
   * Handle method that runs everytime the leg is changed so the system can update.
   * @param legIndex the index of the leg that has been changed
   */
  private onTrackedLegChanged(legIndex: number): void {
    this.publisher.pub('alerts_remove', 'lnav-set-course', false, false);
    this.activeDtkMessage = null;
    if (legIndex > 0) {
      this.opId++;
      const opId = this.opId;

      Wait.awaitDelay(600000).then(() => {
        if (this.opId === opId) {


          const dtk = this.dtk.get();
          const navObs = this.navObs.get();

          if (Math.abs(NavMath.diffAngle(dtk, navObs)) > 5) {
            const message: AlertMessage = {
              key: 'lnav-set-course',
              persistent: true,
              message: 'Set course to ' + dtk.toFixed(0).padStart(3, '0') + '°'
            };
            this.activeDtkMessage = dtk;
            this.publisher.pub('alerts_push', message, false, false);
          }

        }
      });
    }
  }
}
