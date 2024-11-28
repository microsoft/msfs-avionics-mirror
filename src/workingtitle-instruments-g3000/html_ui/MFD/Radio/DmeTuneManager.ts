import { ConsumerSubject, EventBus, NavComSimVars, SimVarValueType, Subscription, UserSettingManager } from '@microsoft/msfs-sdk';
import { DmeTuneSettingMode, DmeUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * A manager for DME radio tuning. Binds the active frequency of the DME radios to those of the nav radios according
 * to the selected DME tune mode.
 */
export class DmeTuneManager {
  private readonly dmeTuneSettings = [
    this.dmeSettingManager.getSetting('dme1TuneMode'),
    this.dmeSettingManager.getSetting('dme2TuneMode')
  ];

  private readonly dmeSourceFreqs = [
    ConsumerSubject.create(null, 108),
    ConsumerSubject.create(null, 108)
  ];

  private readonly settingSubs: Subscription[] = [];

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param dmeSettingManager A manager for DME user settings.
   * @param dmeRadioCount The number of supported DME radios.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly dmeSettingManager: UserSettingManager<DmeUserSettingTypes>,
    private readonly dmeRadioCount: 0 | 1 | 2
  ) {
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically set the active frequency of
   * the DME radios according to the selected DME tune mode.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('DmeTuneManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (this.dmeRadioCount === 0) {
      return;
    }

    const sub = this.bus.getSubscriber<NavComSimVars>();

    for (let i = 0; i < this.dmeRadioCount; i++) {
      const sourceFreq = this.dmeSourceFreqs[i];

      sourceFreq.sub(freq => {
        SimVar.SetSimVarValue(`K:NAV${i + 3}_RADIO_SET_HZ`, SimVarValueType.Number, freq * 1e6);
      }, true);

      this.settingSubs.push(this.dmeTuneSettings[i].sub(mode => {
        switch (mode) {
          case DmeTuneSettingMode.Nav1:
            sourceFreq.setConsumer(sub.on('nav_active_frequency_1')).resume();
            break;
          case DmeTuneSettingMode.Nav2:
            sourceFreq.setConsumer(sub.on('nav_active_frequency_2')).resume();
            break;
          case DmeTuneSettingMode.Hold:
            sourceFreq.pause();
            break;
          default:
            sourceFreq.setConsumer(null);
        }
      }, true));
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.dmeSourceFreqs.forEach(sub => { sub.destroy(); });
    this.settingSubs.forEach(sub => { sub.destroy(); });
  }
}