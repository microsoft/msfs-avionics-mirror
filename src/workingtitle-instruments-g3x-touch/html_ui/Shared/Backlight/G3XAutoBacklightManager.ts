import { AmbientEvents, ClockEvents, ConsumerValue, EventBus, ExpSmoother, MathUtils, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';

import { G3XBacklightUtils } from './G3XBacklightUtils';

/**
 * Configuration options for {@link G3XAutoBacklightManager}.
 */
export type G3XAutoBacklightManagerOptions = {
  /** The input ambient light intensity, in lux, at which the manager outputs an automatic backlight level of 0. */
  minInputIntensity: number;

  /** The input ambient light intensity, in lux, at which the manager outputs an automatic backlight level of 1. */
  maxInputIntensity: number;

  /** The time constant, in milliseconds, with which the manager smooths input ambient light intensities. */
  timeConstant: number;

  /** The gamma value to use when mapping input light intensities to output backlight levels. */
  gamma: number;
};

/**
 * A manager for G3X Touch automatic backlight levels. The manager calculates automatic backlight levels based on the
 * ambient light intensity and publishes the values to the standard G3X automatic backlight level SimVar
 * (`L:1:WTG3X_Auto_Backlight`).
 */
export class G3XAutoBacklightManager {
  private readonly simVar: string;

  private readonly minInputIntensity: number;
  private readonly maxInputIntensity: number;

  private readonly inverseGamma: number;

  private readonly ambientLightIntensity = ConsumerValue.create(null, 0);
  private readonly ambientLightIntensitySmoother: ExpSmoother;

  private isAlive = true;
  private isAwake = false;

  private prevUpdateTime: number | undefined;
  private publishedLevel: number | undefined;

  private readonly updateSub: Subscription;

  /**
   * Creates a new instance of G3XAutoBacklightManager. The manager is initialized as asleep.
   * @param gduIndex The index of this manager's parent GDU.
   * @param bus The event bus.
   * @param options Options with which to configure the manager.
   */
  public constructor(gduIndex: number, bus: EventBus, options: Readonly<G3XAutoBacklightManagerOptions>) {
    this.simVar = G3XBacklightUtils.getAutoLevelSimVarName(gduIndex);

    this.minInputIntensity = Math.max(options.minInputIntensity, 0);
    this.maxInputIntensity = Math.max(this.minInputIntensity, options.maxInputIntensity);

    this.inverseGamma = options.gamma <= 0 ? 1 : 1 / options.gamma;

    this.ambientLightIntensitySmoother = new ExpSmoother(options.timeConstant, 0);

    const sub = bus.getSubscriber<ClockEvents & AmbientEvents>();

    this.ambientLightIntensity.setConsumer(sub.on('ambient_light_intensity'));

    this.updateSub = sub.on('activeSimDuration').handle(this.update.bind(this), true);
  }

  /**
   * Wakes this manager. When this manager is awake, it automatically calculates automatic backlight levels and
   * publishes the values to the standard G3X automatic backlight level SimVar (`L:1:WTG3X_Auto_Backlight`).
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

    this.updateSub.resume(true);
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
    this.prevUpdateTime = undefined;
    this.ambientLightIntensitySmoother.reset(0);

    this.updateSub.pause();
  }

  /**
   * Updates this manager.
   * @param activeSimDuration The total amount of simulated time at the current update, in milliseconds.
   */
  private update(activeSimDuration: number): void {
    const dt = this.prevUpdateTime === undefined ? 0 : Math.max(activeSimDuration - this.prevUpdateTime, 0);

    const smoothedLightIntensity = this.ambientLightIntensitySmoother.next(this.ambientLightIntensity.get(), dt);

    const outputLevel = MathUtils.round(
      Math.pow(
        MathUtils.lerp(smoothedLightIntensity, this.minInputIntensity, this.maxInputIntensity, 0, 1, true, true),
        this.inverseGamma
      ),
      0.001
    );
    this.publishLevel(outputLevel);

    this.prevUpdateTime = activeSimDuration;
  }

  /**
   * Publishes a value to the automatic backlight level SimVar.
   * @param level The value to publish.
   */
  private publishLevel(level: number): void {
    if (level !== this.publishedLevel) {
      SimVar.SetSimVarValue(this.simVar, SimVarValueType.Number, level);
      this.publishedLevel = level;
    }
  }

  /**
   * Destroys this manager. Once this manager is destroyed, it will no longer calculate or publish automatic backlight
   * levels, and cannot be awakened or put to sleep.
   */
  public destroy(): void {
    this.isAlive = false;

    this.ambientLightIntensity.destroy();
    this.updateSub.destroy();
  }
}
