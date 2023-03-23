import { ComSpacing, EventBus, KeyEventManager, KeyEvents, SimVarValueType, Subscription, UserSettingManager, Wait } from '@microsoft/msfs-sdk';
import { ComRadioSpacingSettingMode, ComRadioUserSettingTypes } from '../settings/ComRadioUserSettings';

/**
 * A manager for COM radio channel spacing. Syncs COM radio spacing modes with the COM radio spacing user setting and
 * intercepts COM radio spacing toggle key events in order to have them toggle the value of the user setting instead.
 */
export class ComRadioSpacingManager {
  private keyEventManager?: KeyEventManager;

  private readonly spacingSetting = this.comRadioSettingManager.getSetting('comRadioSpacing');
  private readonly keys = Array.from({ length: this.comRadioCount }, (v, index) => `COM_${index + 1}_SPACING_MODE_SWITCH`);

  private isDebouncing = false;

  private isAlive = true;
  private isInit = false;

  private spacingSettingSub?: Subscription;
  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param comRadioSettingManager A manager for COM radio user settings.
   * @param comRadioCount The number of supported COM radios. Defaults to `2`.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly comRadioSettingManager: UserSettingManager<ComRadioUserSettingTypes>,
    private readonly comRadioCount: 0 | 1 | 2 | 3 = 2
  ) {
    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;

      if (this.isAlive && this.isInit) {
        this.doInit(manager);
      }
    });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically set the spacing mode of COM
   * radios based on the COM radio spacing user setting and intercept COM radio spacing toggle key events in order to
   * have them toggle the value of the user setting instead. If this manager is not yet ready to intercept key events
   * when this method is called, initialization will be suspended until the manager is ready to intercept key events.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('ComRadioSpacingManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (this.keyEventManager !== undefined) {
      this.doInit(this.keyEventManager);
    }
  }

  /**
   * Performs initialization of this manager.
   * @param keyEventManager A key event manager.
   */
  private async doInit(keyEventManager: KeyEventManager): Promise<void> {
    if (this.comRadioCount === 0) {
      return;
    }

    this.keys.forEach(key => keyEventManager.interceptKey(key, false));

    // Wait a short time to let any pending key events settle, then start syncing COM spacing to the spacing setting.

    await Wait.awaitDelay(250);

    this.spacingSettingSub = this.spacingSetting.sub(() => {
      if (this.isDebouncing) {
        return;
      }

      this.updateSpacing(keyEventManager);
    }, true);

    this.keyEventSub = this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(data => {
      if (this.keys.includes(data.key)) {
        this.spacingSetting.value = this.spacingSetting.value === ComRadioSpacingSettingMode.Spacing8_33Khz
          ? ComRadioSpacingSettingMode.Spacing25Khz
          : ComRadioSpacingSettingMode.Spacing8_33Khz;
      }
    });
  }

  /**
   * Updates the spacing mode of this manager's supported COM radios based on the COM radio spacing user setting.
   * @param keyEventManager A key event manager.
   */
  private async updateSpacing(keyEventManager: KeyEventManager): Promise<void> {
    this.isDebouncing = true;

    // Debounce two frames to ensure that the COM SPACING MODE simvar has been updated since the last time the SWITCH
    // key event was sent.
    await Wait.awaitDelay(0);
    await Wait.awaitDelay(0);

    if (!this.isAlive) {
      return;
    }

    const spacingMode = this.spacingSetting.value === ComRadioSpacingSettingMode.Spacing8_33Khz ? ComSpacing.Spacing833Khz : ComSpacing.Spacing25Khz;

    for (let i = 0; i < this.keys.length; i++) {
      if (SimVar.GetSimVarValue(`COM SPACING MODE:${i + 1}`, SimVarValueType.Number) !== spacingMode) {
        keyEventManager.triggerKey(this.keys[i], true);
      }
    }

    this.isDebouncing = false;
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.spacingSettingSub?.destroy();
    this.keyEventSub?.destroy();
  }
}