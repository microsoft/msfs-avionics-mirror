import { AdcEvents, ConsumerSubject, EventBus, Subscription } from '@microsoft/msfs-sdk';
import { WeatherRadarOperatingMode, WeatherRadarScanMode } from '@microsoft/msfs-garminsdk';
import { DisplayPaneUtils, WeatherRadarUserSettings } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager which controls automatic functions of the weather radar.
 */
export class WeatherRadarManager {
  private readonly settingManager = WeatherRadarUserSettings.getMasterManager(this.bus);

  private readonly isActiveSetting = this.settingManager.getSetting('wxrActive');

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  private isAutoStandbyArmed = false;

  private isAlive = true;
  private isInit = false;

  private readonly operatingModeSubs: Subscription[] = [];

  private activeSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will control automatic functions of the weather
   * radar until destroyed.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('WeatherRadarManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // When turning off the radar -> revert all operating modes to standby.
    this.isActiveSetting.sub(isActive => {
      if (!isActive) {
        for (const index of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
          this.settingManager.getSetting(`wxrOperatingMode_${index}`).value = WeatherRadarOperatingMode.Standby;
        }
      }
    }, true);

    // When operating mode enters standby -> revert scan mode to horizontal.
    for (const index of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
      const scanModeSetting = this.settingManager.getSetting(`wxrScanMode_${index}`);
      this.operatingModeSubs.push(this.settingManager.getSetting(`wxrOperatingMode_${index}`).sub(mode => {
        if (mode === WeatherRadarOperatingMode.Standby) {
          scanModeSetting.value = WeatherRadarScanMode.Horizontal;
        }
      }, true));
    }

    // Revert operating mode to standby on landing.
    this.isOnGround.sub(isOnGround => {
      if (isOnGround && this.isAutoStandbyArmed) {
        this.isAutoStandbyArmed = false;
        for (const index of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
          this.settingManager.getSetting(`wxrOperatingMode_${index}`).value = WeatherRadarOperatingMode.Standby;
        }
      } else if (!isOnGround) {
        this.isAutoStandbyArmed = true;
      }
    }, true);
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer control the weather radar.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();
    this.activeSub?.destroy();
    this.operatingModeSubs.forEach(sub => { sub.destroy(); });
  }
}