import { WeatherRadarOperatingMode, WeatherRadarScanMode } from '@microsoft/msfs-garminsdk';
import { AdcEvents, ConsumerSubject, EventBus } from '@microsoft/msfs-sdk';
import { WeatherRadarUserSettings } from './WeatherRadarUserSettings';

/**
 * A controller which handles automatic functions of the weather radar.
 */
export class WeatherRadarController {

  private readonly settingManager = WeatherRadarUserSettings.getManager(this.bus);

  private readonly isActiveSetting = this.settingManager.getSetting('wxrActive');
  private readonly operatingModeSetting = this.settingManager.getSetting('wxrOperatingMode');
  private readonly scanModeSetting = this.settingManager.getSetting('wxrScanMode');

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  private isAutoStandbyArmed = false;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
    // When turning off the radar -> revert operating mode to standby.
    this.isActiveSetting.sub(isActive => {
      if (!isActive) {
        this.operatingModeSetting.value = WeatherRadarOperatingMode.Standby;
      }
    }, true);

    // When operating mode enters standby -> revert scan mode to horizontal.
    this.operatingModeSetting.sub(mode => {
      if (mode === WeatherRadarOperatingMode.Standby) {
        this.scanModeSetting.value = WeatherRadarScanMode.Horizontal;
      }
    }, true);

    // Revert operating mode to standby on landing.
    this.isOnGround.sub(isOnGround => {
      if (isOnGround && this.isAutoStandbyArmed) {
        this.isAutoStandbyArmed = false;
        this.operatingModeSetting.value = WeatherRadarOperatingMode.Standby;
      } else if (!isOnGround) {
        this.isAutoStandbyArmed = true;
      }
    }, true);
  }

  /**
   * Destroys this controller. Once destroyed, this controller will no longer control the weather radar.
   */
  public destroy(): void {
    this.isOnGround.destroy();
  }
}