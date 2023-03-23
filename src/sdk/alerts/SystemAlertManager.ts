import { Annunciation, AnnunciationType } from '../components';
import { CompositeLogicXMLHost, EventBus, GameStateProvider, KeyEventData, KeyEventManager, KeyEvents, Publisher } from '../data';
import { SoundServerControlEvents } from '../utils/sound/SoundServer';
import { SystemAlertEvents } from './SystemAlertPublisher';

/** An alert can be either new or acknowledged. */
enum AlertState {
  /** A newly arrived, unackowledged alert message. */
  New = 0,
  /** An alert message that has been acknowledged. */
  Acked = 1
}

/** A type that bundles together an active annunciation and its state. */
type AnnunciationData = {
  /** The index of the annunciation in the annuncaitions array. */
  index: number,
  /** The state of the alert. */
  state: AlertState,
}

/** A CAS alert manager. */
export class SystemAlertManager {
  private bus: EventBus;
  private logicHost: CompositeLogicXMLHost;
  private soundPublisher: Publisher<SoundServerControlEvents>;
  private alertPublisher: Publisher<SystemAlertEvents>;
  private warningSoundId: string;
  private cautionSoundId: string;

  private initialized = false;
  private annunciations: Annunciation[];
  private activeAnns: Array<AnnunciationData> = [];

  /**
   * Create a SystemAlertManager instance.
   * @param bus The event bus
   * @param annunciations An array of the system annunciations to monitor
   * @param logicHost An actively updated composite logic host.
   * @param warningSoundId The identifier of the warning sound, if other than default
   * @param cautionSoundId The identifier of the caution sound, if other than default
   */
  public constructor(bus: EventBus,
    annunciations: Annunciation[],
    logicHost: CompositeLogicXMLHost,
    warningSoundId = 'tone_warning',
    cautionSoundId = 'tone_caution') {
    this.bus = bus;
    this.logicHost = logicHost;
    this.soundPublisher = this.bus.getPublisher<SoundServerControlEvents>();
    this.alertPublisher = this.bus.getPublisher<SystemAlertEvents>();
    this.warningSoundId = warningSoundId;
    this.cautionSoundId = cautionSoundId;
    this.annunciations = annunciations;

    KeyEventManager.getManager(this.bus).then(manager => {
      manager.interceptKey('MASTER_CAUTION_ACKNOWLEDGE', true);
      manager.interceptKey('MASTER_WARNING_ACKNOWLEDGE', true);
    });

    this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(
      (keyData: KeyEventData) => {
        switch (keyData.key) {
          case 'MASTER_CAUTION_ACKNOWLEDGE':
            this.handleAcknowledgement(AnnunciationType.Caution); break;
          case 'MASTER_WARNING_ACKNOWLEDGE':
            this.handleAcknowledgement(AnnunciationType.Warning); break;
        }
      }
    );

    for (let i = 0; i < this.annunciations.length; i++) {
      const ann = this.annunciations[i];
      this.logicHost.addLogicAsNumber(ann.condition, (v: number): void => {
        if (v == 1) {
          this.handleAnnunciationActive(i);
        } else {
          this.handleAnnunciationInactive(i);
        }
      }, 0);
    }

    const gameStateSub = GameStateProvider.get().sub(state => {
      if (state === GameState.ingame) {
        // Reading game states does not seem to be sufficient to keep from getting alarms
        // based on things that are active when the system is initialized, so we'll just
        // set a brief timeout here to take care of that.
        setTimeout(() => {
          this.initialized = true;
          this.alertPublisher.pub('master_acknowledge', AnnunciationType.Caution, true, false);
          this.alertPublisher.pub('master_acknowledge', AnnunciationType.Warning, true, false);
        }, 5000);
        gameStateSub.destroy();
      }
    }, false, true);
    gameStateSub.resume(true);

    this.setMasterStatus(AnnunciationType.Caution, false);
    this.setMasterStatus(AnnunciationType.Warning, false);
  }

  /**
   * Set both sets of simvars relevant to a master caution or warning status.
   * @param type The type of the status to set
   * @param active Whether or not the status is active
   */
  private setMasterStatus(type: AnnunciationType, active: boolean): void {
    switch (type) {
      case AnnunciationType.Caution:
        SimVar.SetSimVarValue('K:MASTER_CAUTION_SET', 'bool', active);
        SimVar.SetSimVarValue('L:Generic_Master_Caution_Active', 'bool', active);
        break;
      case AnnunciationType.Warning:
        SimVar.SetSimVarValue('K:MASTER_WARNING_SET', 'bool', active);
        SimVar.SetSimVarValue('L:Generic_Master_Warning_Active', 'bool', active);
        break;
    }
  }

  /**
   * Handle an annunciation going active.
   * @param idx The index of the annunciations array for the annunciation.
   */
  protected handleAnnunciationActive(idx: number): void {
    const type = this.annunciations[idx].type;
    if ((!this.checkForActiveType(type)) && this.initialized) {
      this.setMasterStatus(type, true);
      if (type == AnnunciationType.Caution) {
        this.soundPublisher.pub('sound_server_play_sound', this.cautionSoundId, true, false);
      } else if (type == AnnunciationType.Warning) {
        this.soundPublisher.pub('sound_server_start_sound', this.warningSoundId, true, false);
      }
    }

    this.addOrUpdateAnnunciation(idx);
  }

  /**
   * Handle an annunciation going inactive.
   * @param idx The index of the annunciations array for the annunciation.
   */
  protected handleAnnunciationInactive(idx: number): void {
    const type = this.annunciations[idx].type;
    this.removeAnnunciation(idx);

    if (!this.checkForActiveType(type) && this.initialized) {
      this.setMasterStatus(this.annunciations[idx].type, false);
      if (type == AnnunciationType.Warning) {
        this.soundPublisher.pub('sound_server_stop_sound', this.warningSoundId, true, false);
      }
    }
  }

  /**
   * Handle a master warning or caution acknowledgement.
   * @param type The type of alert to acknowledge.
   */
  protected handleAcknowledgement(type: AnnunciationType): void {
    let updated = false;
    this.setMasterStatus(type, false);
    this.alertPublisher.pub('master_acknowledge', type, true, false);
    for (let i = 0; i < this.activeAnns.length; i++) {
      if (this.annunciations[this.activeAnns[i].index].type === type) {
        this.activeAnns[i].state = AlertState.Acked;
        updated = true;
      }
    }

    if (updated) {
      // If the acknowledgement was for warnings, stop playing the warning tone.
      if (type == AnnunciationType.Warning) {
        this.soundPublisher.pub('sound_server_stop_sound', this.warningSoundId, true, false);
      }
    }
  }

  /**
   * See if there is still an active, unacked annunciation of the given type.
   * @param type The annunciation type to check for.
   * @returns True if there is an active, unacked annunciation of the given type, false otherwise.
   */
  protected checkForActiveType(type: AnnunciationType): boolean {
    for (let i = 0; i < this.activeAnns.length; i++) {
      if (this.annunciations[this.activeAnns[i].index].type === type && this.activeAnns[i].state === AlertState.New) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add an annunciation to the active list if it's new, or update it if already there.
   * @param idx The index of the annunciations array for the annunciation.
   * @returns The index of the added or updated annunciation in the active list.
   */
  protected addOrUpdateAnnunciation(idx: number): number {
    // Any message that comes in before we're initialized is considered acknowledged.
    const adjustedState = this.initialized ? AlertState.New : AlertState.Acked;
    this.alertPublisher.pub('alert_triggered', idx, true, false);

    for (let i = 0; i < this.activeAnns.length; i++) {
      if (this.activeAnns[i].index === idx) {
        this.activeAnns[i].state = adjustedState;
        return i;
      }
    }

    this.activeAnns.push({
      index: idx,
      state: adjustedState,
    });
    return this.activeAnns.length - 1;
  }

  /**
   * Remove an annunciation from the active list if present.
   * @param idx The index of the annunciations array for the annunciation.
   * @returns True if the annunciation was removed, false otherwise.
   */
  protected removeAnnunciation(idx: number): boolean {
    for (let i = 0; i < this.activeAnns.length; i++) {
      if (this.activeAnns[i].index === idx) {
        this.activeAnns.splice(i, 1);
        this.alertPublisher.pub('alert_cleared', idx, true, false);
        return true;
      }
    }
    return false;
  }
}