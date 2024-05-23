import { BacklightLevelController, EventBus, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';

import { G3XBacklightUtils } from './G3XBacklightUtils';

/**
 * A manager for G3X Touch automatic backlight levels. The manager calculates automatic backlight levels based on the
 * angle of the sun in the sky and publishes the values to the standard G3X automatic backlight level SimVar
 * (`L:WTG3X_Auto_Backlight`).
 */
export class G3XAutoBacklightManager {
  private readonly simVar = G3XBacklightUtils.getAutoLevelSimVarName();

  private readonly autoBacklight: BacklightLevelController;

  private readonly intensitySub: Subscription;

  private isAlive = true;
  private isAwake = false;

  /**
   * Creates a new instance of G3XAutoBacklightManager. The manager is initialized as asleep.
   * @param bus The event bus.
   */
  public constructor(bus: EventBus) {
    this.autoBacklight = new BacklightLevelController(bus, false, 0, 1);

    this.intensitySub = this.autoBacklight.intensity.sub(this.publishLevel.bind(this), false, true);
  }

  /**
   * Wakes this manager. When this manager is awake, it automatically calculates automatic backlight levels and
   * publishes the values to the standard G3X automatic backlight level SimVar (`L:WTG3X_Auto_Backlight`).
   * @throws Error if this manager has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('G3XAutoBacklightManager: cannot wake a dead manager');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.autoBacklight.setPaused(false);
    this.intensitySub.resume(true);
  }

  /**
   * Puts this manager to sleep. When this manager is asleep, it stops calculating and publishing automatic backlight
   * levels.
   * @throws Error if this manager has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('G3XAutoBacklightManager: cannot sleep a dead manager');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.autoBacklight.setPaused(true);
    this.intensitySub.pause();
  }

  /**
   * Publishes a value to the automatic backlight level SimVar.
   * @param level The value to publish.
   */
  private publishLevel(level: number): void {
    SimVar.SetSimVarValue(this.simVar, SimVarValueType.Number, level);
  }

  /**
   * Destroys this manager. Once this manager is destroyed, it will no longer calculate or publish automatic backlight
   * levels, and cannot be awakened or put to sleep.
   */
  public destroy(): void {
    this.isAlive = false;

    this.autoBacklight.setPaused(true);
    this.intensitySub.destroy();
  }
}
