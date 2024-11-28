import { ConsumerSubject, EventBus, MappedSubject, NavComSimVars, SimVarValueType, UserSettingManager } from '@microsoft/msfs-sdk';
import { NavRadioMonitorUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager for NAV radio audio monitoring. Automatically syncs the monitoring user settings with the sim's NAV sound
 * state.
 */
export class NavRadioMonitorManager {

  private readonly entries = [
    {
      navSound: ConsumerSubject.create(null, false),
      monitorSelectedSetting: this.monitorSettingManager.getSetting('navRadioMonitorSelected1'),
      identEnabledSetting: this.monitorSettingManager.getSetting('navRadioMonitorIdentEnabled1'),
      settingState: MappedSubject.create(
        ([selected, identEnabled]): boolean => selected && identEnabled,
        this.monitorSettingManager.getSetting('navRadioMonitorSelected1'),
        this.monitorSettingManager.getSetting('navRadioMonitorIdentEnabled1')
      ),
      simVar: 'K:RADIO_VOR1_IDENT_SET'
    },
    {
      navSound: ConsumerSubject.create(null, false),
      monitorSelectedSetting: this.monitorSettingManager.getSetting('navRadioMonitorSelected2'),
      identEnabledSetting: this.monitorSettingManager.getSetting('navRadioMonitorIdentEnabled2'),
      settingState: MappedSubject.create(
        ([selected, identEnabled]): boolean => selected && identEnabled,
        this.monitorSettingManager.getSetting('navRadioMonitorSelected2'),
        this.monitorSettingManager.getSetting('navRadioMonitorIdentEnabled2')
      ),
      simVar: 'K:RADIO_VOR2_IDENT_SET'
    }
  ];

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param monitorSettingManager A manager for NAV radio audio monitoring user settings.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly monitorSettingManager: UserSettingManager<NavRadioMonitorUserSettingTypes>
  ) {
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically sync the monitoring user
   * settings with the sim's NAV sound state.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('NavRadioMonitorManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<NavComSimVars>();

    for (let i = 0; i < 2; i++) {
      const entry = this.entries[i];

      entry.navSound.setConsumer(sub.on(`nav_sound_${i + 1 as 1 | 2}`));

      // Ensure that the IDENT enabled setting is appropriate for the current nav sound state.
      entry.navSound.sub(hasSound => {
        if (hasSound) {
          entry.monitorSelectedSetting.value = true;
          entry.identEnabledSetting.value = true;
        } else {
          if (entry.monitorSelectedSetting.value && entry.identEnabledSetting.value) {
            entry.monitorSelectedSetting.value = false;
          }
        }
      }, true);

      // Respond to changes in the settings by setting the nav sound state.
      entry.settingState.sub(hasSound => {
        SimVar.SetSimVarValue(entry.simVar, SimVarValueType.Number, hasSound ? 1 : 0);
      }, true);
    }
  }

  /**
   * Resets this manager's monitoring user settings to their default values (monitoring OFF and ident OFF). Has no
   * effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('NavRadioMonitorManager: cannot initialize a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    for (let i = 0; i < 2; i++) {
      const entry = this.entries[i];

      entry.monitorSelectedSetting.resetToDefault();
      entry.identEnabledSetting.resetToDefault();
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.entries.forEach(entry => {
      entry.navSound.destroy();
      entry.settingState.destroy();
    });
  }
}