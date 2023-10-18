/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AdcEvents, ConsumerSubject, ElectricalEvents, EventBus, KeyEventManager, MappedSubject, Subscription, Wait } from '@microsoft/msfs-sdk';
import { WeatherRadarOperatingMode, WeatherRadarScanMode } from '@microsoft/msfs-garminsdk';
import { DisplayPaneUtils, WeatherRadarEvents, WeatherRadarUserSettings } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager which controls automatic functions of the weather radar.
 */
export class WeatherRadarManager {
  private readonly publisher = this.bus.getPublisher<WeatherRadarEvents>();

  private keyEventManager?: KeyEventManager;

  private readonly settingManager = WeatherRadarUserSettings.getMasterManager(this.bus);

  private readonly isActiveSetting = this.settingManager.getSetting('wxrActive');

  private readonly operatingModeSettings = DisplayPaneUtils.CONTROLLABLE_INDEXES.map(index => {
    return this.settingManager.getSetting(`wxrOperatingMode_${index}`);
  });

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  private isAutoStandbyArmed = false;

  private readonly isScanActive = MappedSubject.create(
    state => {
      if (state[0]) {
        for (let i = 1; i < state.length; i++) {
          if (state[i] !== WeatherRadarOperatingMode.Standby) {
            return true;
          }
        }
      }

      return false;
    },
    this.isActiveSetting,
    ...this.operatingModeSettings
  ).pause();
  private readonly isScanActiveCircuitSwitchOn?: ConsumerSubject<boolean>;
  private scanActiveDebounceOpId = 0;

  private isAlive = true;
  private isInit = false;

  private readonly operatingModeSubs: Subscription[] = [];
  private readonly calibratedGainSubs: Subscription[] = [];

  private activeSub?: Subscription;

  /**
   * Creates a new instance of WeatherRadarManager.
   * @param bus The event bus.
   * @param scanActiveCircuitIndex The index of the electrical circuit to switch on when the radar is actively
   * scanning. If not defined, then no circuit will be switched on when the radar is actively scanning.
   * @param scanActiveProcedureIndex The index of the `system.cfg` electrical procedure to use the change the active
   * radar scan circuit switch state. The electrical procedure should be configured to set the circuit switch state
   * to OFF. If not defined, then no circuit will be switched on when the radar is actively scanning.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly scanActiveCircuitIndex?: number,
    private readonly scanActiveProcedureIndex?: number
  ) {
    if (scanActiveCircuitIndex !== undefined && scanActiveProcedureIndex !== undefined) {
      KeyEventManager.getManager(bus).then(manager => {
        this.keyEventManager = manager;
        if (this.isInit) {
          this.initActiveScanCircuitLogic();
        }
      });

      this.isScanActiveCircuitSwitchOn = ConsumerSubject.create<boolean>(null, false);
    }
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
        for (const setting of this.operatingModeSettings) {
          setting.value = WeatherRadarOperatingMode.Standby;
        }
      }
    }, true);

    for (const index of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
      // When operating mode enters standby -> revert scan mode to horizontal.
      const scanModeSetting = this.settingManager.getSetting(`wxrScanMode_${index}`);
      this.operatingModeSubs.push(this.settingManager.getSetting(`wxrOperatingMode_${index}`).sub(mode => {
        if (mode === WeatherRadarOperatingMode.Standby) {
          scanModeSetting.value = WeatherRadarScanMode.Horizontal;
        }
      }, true));

      // When calibrated gain setting is enabled, set gain to 0 dBZ.
      const gainSetting = this.settingManager.getSetting(`wxrGain_${index}`);
      this.calibratedGainSubs.push(this.settingManager.getSetting(`wxrCalibratedGain_${index}`).sub(calibrated => {
        if (calibrated) {
          gainSetting.value = 0;
        }
      }, true));
    }

    // Revert operating mode to standby on landing.
    this.isOnGround.sub(isOnGround => {
      if (isOnGround && this.isAutoStandbyArmed) {
        this.isAutoStandbyArmed = false;
        for (const setting of this.operatingModeSettings) {
          setting.value = WeatherRadarOperatingMode.Standby;
        }
      } else if (!isOnGround) {
        this.isAutoStandbyArmed = true;
      }
    }, true);

    if (this.isScanActiveCircuitSwitchOn) {
      // There is an electrical circuit tied to active radar scanning, so we will initialize the circuit logic if the
      // key event manager is ready. The 'wx_radar_is_scan_active' topic will be bound to whether the circuit switch is
      // on. Because the weather radar avionics system will enter the failed state if the circuit is unpowered and the
      // 'wx_radar_is_scan_active' topic is true, this will prevent the system from transiently entering the failed
      // state before the circuit has a chance to be switched on.

      if (this.keyEventManager !== undefined) {
        this.initActiveScanCircuitLogic();
      }
    } else {
      // There is no electrical circuit tied to active radar scanning. The 'wx_radar_is_scan_active' will be bound
      // directly to the active scan state.

      this.isScanActive.resume().sub(this.publishScanActive.bind(this), true);
    }
  }

  /**
   * Initializes the logic for switching the active radar scan circuit on and off.
   */
  private initActiveScanCircuitLogic(): void {
    this.isScanActive.resume().sub(this.setScanActiveCircuitSwitch.bind(this), true);
    this.isScanActiveCircuitSwitchOn!.setConsumer(this.bus.getSubscriber<ElectricalEvents>().on(`elec_circuit_switch_on_${this.scanActiveCircuitIndex!}`));
    this.isScanActiveCircuitSwitchOn!.sub(this.onScanActiveCircuitSwitchChanged.bind(this), true);
  }

  /**
   * Sets the state of the active radar scan circuit switch.
   * @param on Whether to set the circuit switch to the ON state.
   */
  private setScanActiveCircuitSwitch(on: boolean): void {
    this.keyEventManager!.triggerKey('ELECTRICAL_EXECUTE_PROCEDURE', true, this.scanActiveProcedureIndex!, on ? 1 : 0);
  }

  /**
   * Responds to when the state of the active radar scan circuit switch changes.
   * @param on Whether the active radar scan circuit switch is ON.
   */
  private async onScanActiveCircuitSwitchChanged(on: boolean): Promise<void> {
    const opId = ++this.scanActiveDebounceOpId;

    if (on) {
      // It takes up to two frames for the power state of the circuit to update properly after the switch is turned on.
      await Wait.awaitFrames(2);
      if (opId === this.scanActiveDebounceOpId) {
        this.publishScanActive(true);
      }
    } else {
      this.publishScanActive(false);
    }
  }

  /**
   * Publishes the active radar scan state.
   * @param isActive The state to publish.
   */
  private publishScanActive(isActive: boolean): void {
    this.publisher.pub('wx_radar_is_scan_active', isActive, true, true);
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer control the weather radar.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();

    this.isScanActive?.destroy();
    this.isScanActiveCircuitSwitchOn?.destroy();

    this.activeSub?.destroy();
    for (const sub of this.operatingModeSubs) {
      sub.destroy();
    }
    for (const sub of this.calibratedGainSubs) {
      sub.destroy();
    }
  }
}