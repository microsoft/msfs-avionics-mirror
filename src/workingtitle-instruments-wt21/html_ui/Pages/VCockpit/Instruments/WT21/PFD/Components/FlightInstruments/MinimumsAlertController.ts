import { AdcEvents, ConsumerSubject, EventBus, MinimumsEvents, MinimumsMode, SoundServerControlEvents, Subject } from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../../Shared/WT21ControlEvents';
import { RefsUserSettings } from '../../../Shared/Profiles/RefsUserSettings';

/** The state of the minimums controller  */
enum MinimumsAlerterState {
  DISABLED,
  ARMED,
  ALERTING
}

/**
 * Class to manage the minimums alerter on the PFD
 */
export class MinimumsAlertController {

  private readonly adcSub = this.bus.getSubscriber<AdcEvents>();
  private readonly alertPublisher = this.bus.getPublisher<WT21ControlEvents>();
  private readonly minsSubscriber = this.bus.getSubscriber<MinimumsEvents>();
  private readonly refSettings = RefsUserSettings.getManager(this.bus);

  private readonly alertValue = Subject.create(-9999);
  private readonly minimumsMode = ConsumerSubject.create(this.minsSubscriber.on('minimums_mode').whenChanged(), MinimumsMode.OFF);

  private readonly alerterState = Subject.create<MinimumsAlerterState>(MinimumsAlerterState.DISABLED);

  private readonly isOnGround = ConsumerSubject.create<boolean>(this.adcSub.on('on_ground').whenChanged(), true);
  private readonly planeAltitude = ConsumerSubject.create<number>(null, 0);

  /**
   * Ctor
   * @param bus the event bus
   */
  constructor(private readonly bus: EventBus) {
    this.planeAltitude.sub(this.updateAlterterState.bind(this));
    // TODO maybe use alt above ground for this with some buffer so it doesn't fire on bounces
    this.isOnGround.sub(this.onGroundUpdatedHandler.bind(this));

    this.minimumsMode.sub(this.minsModeUpdatedHandler.bind(this), true);
    this.refSettings.getSetting('baromins').sub(this.minsAltUpdatedHandler.bind(this));
    this.refSettings.getSetting('radiomins').sub(this.minsAltUpdatedHandler.bind(this));

    this.alerterState.sub(this.alerterStateChangedHandler.bind(this));
  }

  /**
   * Called when the alerter state is updated
   * @param state the new alerter state
   */
  private alerterStateChangedHandler(state: MinimumsAlerterState): void {
    this.alertPublisher.pub('minimums_alert', state === MinimumsAlerterState.ALERTING, false, true);
  }

  /**
   * Updates the state of the alerter
   */
  private updateAlterterState(): void {
    switch (this.alerterState.get()) {
      case MinimumsAlerterState.DISABLED:
        if (this.canArm()) {
          this.alerterState.set(MinimumsAlerterState.ARMED);
        }
        break;

      case MinimumsAlerterState.ARMED:
        if (this.planeAltitude.get() < this.alertValue.get()) {
          this.bus.getPublisher<SoundServerControlEvents>().pub('sound_server_play_sound', 'WT_aural_minimums', true, false);
          this.alerterState.set(MinimumsAlerterState.ALERTING);
        }
        break;
      case MinimumsAlerterState.ALERTING:
        // reset when we go above mins (with some buffer)
        if ((this.planeAltitude.get() - 20) >= this.alertValue.get()) {
          this.alerterState.set(MinimumsAlerterState.DISABLED);
        }
        break;
    }
  }

  /**
   * Called when the plane on ground status is updated
   * @param onGround the new plane on ground status
   */
  private onGroundUpdatedHandler(onGround: boolean): void {
    if (onGround) {
      this.alertValue.set(-9999);
      this.alerterState.set(MinimumsAlerterState.DISABLED);
    }
  }

  /**
   * Called when the minimums altitude is updated
   * @param minsAlt the new minimums altitude
   */
  private minsAltUpdatedHandler(minsAlt: number): void {
    this.alertValue.set(minsAlt);
    this.alerterState.set(MinimumsAlerterState.DISABLED);
  }

  /**
   * Called when the minimums mode is updated
   * @param mode the new minimums mode
   */
  private minsModeUpdatedHandler(mode: MinimumsMode): void {
    this.planeAltitude.pause();
    if (mode === MinimumsMode.BARO) {
      this.planeAltitude.setConsumer(this.adcSub.on('indicated_alt').whenChangedBy(1));
      this.alertValue.set(this.refSettings.getSetting('baromins').value);
    } else if (mode === MinimumsMode.RA) {
      this.planeAltitude.setConsumer(this.adcSub.on('radio_alt').whenChangedBy(1));
      this.alertValue.set(this.refSettings.getSetting('radiomins').value);
    } else {
      this.planeAltitude.setConsumer(null);
      this.alertValue.set(-9999);
    }
    this.alerterState.set(MinimumsAlerterState.DISABLED);
    this.planeAltitude.resume();
  }

  /**
   * Checks if the alerter can be armed
   * @returns true if the alerter can be armed
   */
  private canArm(): boolean {
    // not on ground, mins set, +50 ft above mins
    return (!this.isOnGround.get()
      && this.alertValue.get() > -9999
      && (this.planeAltitude.get() - 50) >= this.alertValue.get());
  }
}