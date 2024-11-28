import {
  APEvents, ConsumerSubject, ConsumerValue, DebounceTimer, EventBus, GameStateProvider, GNSSEvents, KeyEventManager, MappedSubject, Subject, Wait
} from '@microsoft/msfs-sdk';

/**
 *
 */
export class Sr22tYawDamperSystem {
  private static readonly YD_ENGAGE_ALT = 200;

  private readonly gpsAlt = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('above_ground_height').atFrequency(2), 0);
  private readonly apOn = ConsumerSubject.create(this.bus.getSubscriber<APEvents>().on('ap_master_status'), false);
  private readonly ydState = ConsumerValue.create(this.bus.getSubscriber<APEvents>().on('ap_yd_status'), false);

  private readonly ydOn = Subject.create(false);
  private readonly autoYdOn = Subject.create(false);

  private readonly stateChangeDebounce = new DebounceTimer();

  /**
   * Creates an instance of the Sr22tYawDamperSystem.
   * @param bus The event bus to use with this instance.
   */
  constructor(private readonly bus: EventBus) {
    KeyEventManager.getManager(bus).then(km => {
      this.ydOn.sub(on => {
        on ? km.triggerKey('YAW_DAMPER_ON', true) : km.triggerKey('YAW_DAMPER_OFF', true);
      }, true);
      this.autoYdOn.sub(on => this.stateChangeDebounce.schedule(() => this.ydOn.set(on), 1000), true);

      MappedSubject.create(([apOn, alt]) => this.onAltChanged(apOn, alt), this.apOn, this.gpsAlt);

      Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame).then(() => this.ydOn.set(this.ydState.get()));
    });
  }

  /**
   * Handles when the altitude changes.
   * @param apOn Whether or not the autopilot is on.
   * @param alt The current gps above ground alt.
   */
  private onAltChanged(apOn: boolean, alt: number): void {
    if (apOn) {
      this.ydOn.set(true);
      return;
    }

    if (alt > (Sr22tYawDamperSystem.YD_ENGAGE_ALT) && !this.autoYdOn.get()) {
      this.autoYdOn.set(true);
    } else if (alt < (Sr22tYawDamperSystem.YD_ENGAGE_ALT) && this.autoYdOn.get()) {
      this.autoYdOn.set(false);
    }
  }
}