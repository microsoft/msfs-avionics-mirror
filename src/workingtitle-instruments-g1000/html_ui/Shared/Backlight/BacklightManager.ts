import { AmbientEvents, ClockEvents, ConsumerValue, EventBus, ExpSmoother, MathUtils, Subscription, UserSetting, UserSettingManager } from '@microsoft/msfs-sdk';

import {
  BacklightIntensitySettingName, BacklightMode, BacklightModeSettingName, BacklightUserSettings, BacklightUserSettingTypes
} from './BacklightUserSettings';

/**
 * Manages backlight levels for the PFD and MFD screens and softkeys.
 */
export class BacklightManager {
  // The following constants control the response of the backlight simvar to the set intensity level.
  private static readonly RESPONSE_MIN = 0.01; // minimum backlight response
  private static readonly RESPONSE_MAX = 2; // maximum backlight response
  private static readonly RESPONSE_FACTOR = 3; // the greater the factor, the steeper the response curve
  private static readonly RESPONSE_SCALE = (BacklightManager.RESPONSE_MAX - BacklightManager.RESPONSE_MIN) / (Math.exp(BacklightManager.RESPONSE_FACTOR) - 1);

  private static readonly INPUT_MIN_RANGE = 0.5;
  private static readonly INPUT_MAX_RANGE = 10000;

  private static readonly AUTO_MAX_INTENSITY = 100; // The maximum intensity applied by auto backlight.
  private static readonly AUTO_MIN_INTENSITY = 30; // The minimum intensity applied by auto backlight.

  private readonly settingManager: UserSettingManager<BacklightUserSettingTypes>;

  private readonly MODE_SETTING_NAME: BacklightModeSettingName;
  private readonly INTENSITY_SETTING_NAME: BacklightIntensitySettingName;
  private readonly LVAR_NAME: string;

  private readonly screenIntensitySetting: UserSetting<number>;

  private prevUpdateTime: number | undefined;

  private readonly ambientLightIntensity = ConsumerValue.create(null, 0);
  private readonly ambientLightIntensitySmoother: ExpSmoother;
  private readonly inverseGamma: number;

  private readonly updateSub: Subscription;

  /**
   * Constructor.
   * @param display The display to manage. Either the PFD or the MFD.
   * @param bus The event bus.
   */
  constructor(public readonly display: 'pfd' | 'mfd', bus: EventBus) {
    this.MODE_SETTING_NAME = `${this.display}ScreenBacklightMode`;
    this.INTENSITY_SETTING_NAME = `${this.display}ScreenBacklightIntensity`;
    this.LVAR_NAME = `L:AS1000_${this.display}_Brightness`;

    this.settingManager = BacklightUserSettings.getManager(bus);

    this.inverseGamma = 1 / 2.2; /* The inverse of the gamma value to use when mapping input light intensities to output backlight levels. */

    this.screenIntensitySetting = this.settingManager.getSetting(this.INTENSITY_SETTING_NAME);

    this.ambientLightIntensitySmoother = new ExpSmoother(2000, 0);

    const sub = bus.getSubscriber<ClockEvents & AmbientEvents>();

    this.ambientLightIntensity.setConsumer(sub.on('ambient_light_intensity'));

    this.updateSub = sub.on('activeSimDuration').handle(this.updateAutoBacklightIntensity.bind(this));
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically set backlight levels in response
   * to changes in their settings.
   */
  public init(): void {
    this.settingManager.whenSettingChanged(this.INTENSITY_SETTING_NAME).handle(this.onScreenIntensityChanged.bind(this, this.LVAR_NAME));
  }

  /**
   * A callback which is called when the screen intensity value changes.
   * @param simvar The simvar to adjust.
   * @param intensity The new intensity value.
   */
  private onScreenIntensityChanged(simvar: string, intensity: number): void {
    const level = BacklightManager.RESPONSE_MIN + (Math.exp(BacklightManager.RESPONSE_FACTOR * intensity / 100) - 1) * BacklightManager.RESPONSE_SCALE;
    SimVar.SetSimVarValue(simvar, 'number', level);
  }

  /**
   * Updates backlight intensity according to the auto setting algorithm.
   * @param activeSimDuration The total amount of simulated time at the current update, in milliseconds.
   */
  private updateAutoBacklightIntensity(activeSimDuration: number): void {
    const dt = this.prevUpdateTime === undefined ? 0 : Math.max(activeSimDuration - this.prevUpdateTime, 0);

    const smoothedLightIntensity = this.ambientLightIntensitySmoother.next(this.ambientLightIntensity.get(), dt);

    this.prevUpdateTime = activeSimDuration;

    if (this.settingManager.getSetting(this.MODE_SETTING_NAME).get() === BacklightMode.Auto) {
      const outputLevel = Math.pow(
        MathUtils.lerp(
          smoothedLightIntensity, BacklightManager.INPUT_MIN_RANGE, BacklightManager.INPUT_MAX_RANGE, 0, 1, true, true),
          this.inverseGamma
        );

      this.screenIntensitySetting.set(Math.round(MathUtils.lerp(outputLevel, 0, 1, BacklightManager.AUTO_MIN_INTENSITY, BacklightManager.AUTO_MAX_INTENSITY)));
    }
  }
}
