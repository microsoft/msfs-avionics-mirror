import { ConsumerSubject, ControlEvents, EventBus, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

import { NavComUserSettingManager, TcasOperatingModeSetting, TrafficUserSettings } from '../Settings';

/** Events for interacting with the transponder */
export interface Epic2TransponderEvents {
  /** Sets the transponder default VFR code */
  'epic2_xpdr_set_vfr_code': number
  /** Sets the transponder current code */
  'epic2_xpdr_set_code': number
  /** Toggles between the VFR code and the last active code */
  'epic2_xpdr_toggle_vfr_code': boolean
  /** Toggles between the last transponder mode */
  'epic2_xpdr_toggle_modes': unknown
}

/**
 * Class responsible for acting as the transponder.
 * It also manages automatic setting of TCAS and transponder modes such that TCAS is set to standby if transponder mode is not
 * altitude reporting and transponder is set to altitude reporting if TCAS mode is not standby.
 */
export class Epic2TransponderManager {
  private readonly settings = TrafficUserSettings.getManager(this.bus);
  public readonly xpdrCode = ConsumerSubject.create(this.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_code_1'), 0);
  private readonly vfrCode = this.navComSettingsManager.getSetting('vfrCode');

  private isVfrCodeSelected = this.xpdrCode.get() === this.vfrCode.get();
  private lastCode = Number(this.vfrCode.get().toString(8));

  private lastXpdrMode = this.settings.getSetting('trafficOperatingMode').get();
  private alternativeMode = this.settings.getSetting('trafficAlternativeMode');


  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly navComSettingsManager: NavComUserSettingManager) {
    const sub = this.bus.getSubscriber<Epic2TransponderEvents & ControlEvents>();

    sub.on('epic2_xpdr_set_vfr_code').handle((code) => this.vfrCode.set(code));
    sub.on('epic2_xpdr_set_code').handle((code) => this.setCode(code));
    sub.on('epic2_xpdr_toggle_vfr_code').handle(() => this.toggleVfrCode());
    sub.on('epic2_xpdr_toggle_modes').handle(() => this.settings.getSetting('trafficOperatingMode').set(this.alternativeMode.get()));

    this.alternativeMode.set(this.lastXpdrMode === TcasOperatingModeSetting.Standby ? TcasOperatingModeSetting.TA_RA : TcasOperatingModeSetting.Standby);
  }

  /**
   * Toggles between the VFR code and the last code set
   */
  private toggleVfrCode(): void {
    const currentXpdrCode = this.xpdrCode.get();
    const vfrCode = Number(this.vfrCode.get().toString(8));

    if (this.isVfrCodeSelected === true) {
      this.setCode(this.lastCode);
      this.lastCode = vfrCode;
    } else {
      this.lastCode = currentXpdrCode;
      this.setCode(vfrCode);
      this.isVfrCodeSelected = true;
    }
  }

  /**
   * Sets the transponder code
   * @param code The transponder code to set
   */
  private setCode(code: number): void {
    this.bus.getPublisher<ControlEvents>().pub('publish_xpdr_code_1', code, true);
    this.isVfrCodeSelected = false;
  }

  /**
   * Initializes this manager. Once initialized, the manager will automatically set transponder mode to altitude
   * reporting if TCAS is set to any mode other than standby, and set TCAS mode to standby if transponder is set to
   * any mode other than altitude reporting.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<XPDRSimVarEvents>();
    const pub = this.bus.getPublisher<ControlEvents>();

    this.settings.whenSettingChanged('trafficOperatingMode').handle(mode => {
      switch (mode) {
        case TcasOperatingModeSetting.TAOnly:
        case TcasOperatingModeSetting.TA_RA:
          pub.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false);
          break;
        case TcasOperatingModeSetting.Standby:
          pub.pub('publish_xpdr_mode_1', XPDRMode.STBY, true, false);
          break;
      }

      // If mode is changed to STBY, set the alternative to previous active mode; otherwise set alternative to STBY
      this.alternativeMode.set(mode === TcasOperatingModeSetting.On ? this.lastXpdrMode : TcasOperatingModeSetting.On);
      this.lastXpdrMode = mode;
    });

    sub.on('xpdr_mode_1').whenChanged().handle(mode => {
      if (mode !== XPDRMode.ALT) {
        this.settings.getSetting('trafficOperatingMode').value = TcasOperatingModeSetting.Standby;
      }
    });
  }
}
