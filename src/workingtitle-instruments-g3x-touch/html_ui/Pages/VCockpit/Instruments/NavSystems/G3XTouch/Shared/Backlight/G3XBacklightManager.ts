import {
  ClockEvents, ConsumerSubject, EventBus, MappedSubject, MathUtils, SimVarValueType, Subject, Subscribable,
  Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import { BacklightControlSettingMode, BacklightUserSettingTypes } from '../Settings/BacklightUserSettings';
import { BacklightConfig } from './BacklightConfig';
import { G3XBacklightEvents } from './G3XBacklightEvents';
import { G3XBacklightUtils } from './G3XBacklightUtils';

/**
 * A manager for G3X Touch backlight levels. The manager calculates backlight levels for a single GDU based on the
 * user-selected backlight mode and publishes the values to a standard G3X backlight level SimVar
 * (`L:WTG3X_Screen_Backlight:[index]` where `[index]` is the GDU index).
 */
export class G3XBacklightManager {
  private readonly screenBacklightSimVar = G3XBacklightUtils.getScreenLevelSimVarName(this.gduIndex);

  private readonly autoBacklightLevel = ConsumerSubject.create(null, 1);

  private readonly lightBusLevelLogic?: CompositeLogicXMLElement;
  private readonly lightBusInputLevel?: Subject<number>;
  private readonly lightBusOutputLevel?: Subscribable<number>;

  private readonly screenBacklightLevel = Subject.create(1);

  private readonly manualBacklightPipe: Subscription;
  private readonly autoBacklightPipe: Subscription;
  private readonly lightBusPipe?: Subscription;

  private readonly settingModeSub: Subscription;
  private readonly updateLightBusSub?: Subscription;

  private isAlive = true;
  private isAwake = false;

  /**
   * Creates a new instance of G3XBacklightManager. The manager is initialized as asleep.
   * @param gduIndex The index of this manager's parent GDU.
   * @param bus The event bus.
   * @param settingManager A manager for backlight user settings.
   * @param config The backlight configuration object.
   */
  public constructor(
    private readonly gduIndex: number,
    bus: EventBus,
    settingManager: UserSettingManager<BacklightUserSettingTypes>,
    config: BacklightConfig
  ) {
    const sub = bus.getSubscriber<ClockEvents & G3XBacklightEvents>();

    this.autoBacklightLevel.setConsumer(sub.on('g3x_backlight_auto_level'));

    const [autoMin, autoMax] = config.photoCell.brightnessRange;

    if (config.lightBus) {
      this.lightBusLevelLogic = config.lightBus.level;
      this.lightBusInputLevel = Subject.create(0);

      const offThreshold = config.lightBus.offThreshold;
      if (offThreshold > 0) {
        this.lightBusOutputLevel = MappedSubject.create(
          ([input, autoLevel]) => {
            return input >= offThreshold ? input : MathUtils.lerp(autoLevel, 0, 1, autoMin, autoMax);
          },
          this.lightBusInputLevel,
          this.autoBacklightLevel
        );
      } else {
        this.lightBusOutputLevel = this.lightBusInputLevel;
      }
    }

    this.manualBacklightPipe = settingManager.getSetting('displayBacklightManualLevel').pipe(this.screenBacklightLevel, true);
    this.autoBacklightPipe = this.autoBacklightLevel.pipe(this.screenBacklightLevel, level => MathUtils.lerp(level, 0, 1, autoMin, autoMax), true);
    this.lightBusPipe = this.lightBusOutputLevel?.pipe(this.screenBacklightLevel, true);

    this.screenBacklightLevel.sub(this.publishScreenBacklightLevel.bind(this), true);

    this.settingModeSub = settingManager.getSetting('displayBacklightMode').sub(this.onSettingModeChanged.bind(this), false, true);
    this.updateLightBusSub = this.lightBusLevelLogic ? sub.on('realTime').handle(this.updateLightBus.bind(this), true) : undefined;
  }

  /**
   * Wakes this manager. When this manager is awake, it publishes backlight levels for its GDU to the appropriate
   * SimVar (`L:WTG3X_Screen_Backlight:[index]` where `[index]` is the GDU index).
   * @throws Error if this manager has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('G3XBacklightManager: cannot wake a dead manager');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.autoBacklightLevel.resume();

    this.settingModeSub.resume(true);
  }

  /**
   * Puts this manager to sleep. When this manager is asleep, it stops publishing backlight levels.
   * @throws Error if this manager has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('G3XBacklightManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.autoBacklightLevel.pause();

    this.settingModeSub.pause();
    this.manualBacklightPipe.pause();
    this.autoBacklightPipe.pause();
    this.updateLightBusSub?.pause();
  }

  /**
   * Responds to when the backlight setting mode changes.
   * @param settingMode The new backlight setting mode.
   */
  private onSettingModeChanged(settingMode: BacklightControlSettingMode): void {
    this.manualBacklightPipe.pause();
    this.autoBacklightPipe.pause();
    this.updateLightBusSub?.pause();
    this.lightBusPipe?.pause();

    switch (settingMode) {
      case BacklightControlSettingMode.LightBus:
        if (this.updateLightBusSub && this.lightBusPipe) {
          this.updateLightBusSub.resume(true);
          this.lightBusPipe.resume(true);
        } else {
          this.screenBacklightLevel.set(1);
        }
        break;
      case BacklightControlSettingMode.PhotoCell:
        this.autoBacklightPipe.resume(true);
        break;
      default:
        this.manualBacklightPipe.resume(true);
    }
  }

  /**
   * Updates this manager's backlight level from the light bus.
   */
  private updateLightBus(): void {
    const lightBusLevel = MathUtils.clamp(this.lightBusLevelLogic!.getValueAsNumber(), 0, 1);
    this.lightBusInputLevel!.set(lightBusLevel);
  }

  /**
   * Publishes a value to this manager's screen backlight level SimVar.
   * @param level The value to publish.
   */
  private publishScreenBacklightLevel(level: number): void {
    SimVar.SetSimVarValue(this.screenBacklightSimVar, SimVarValueType.Number, level);
  }

  /**
   * Destroys this manager. Once this manager is destroyed, it will no longer publish backlight levels, and cannot be
   * awakened or put to sleep.
   */
  public destroy(): void {
    this.isAlive = false;

    this.autoBacklightLevel.destroy();
    this.settingModeSub.destroy();
    this.manualBacklightPipe.destroy();
    this.autoBacklightPipe.destroy();
    this.updateLightBusSub?.destroy();
  }
}
