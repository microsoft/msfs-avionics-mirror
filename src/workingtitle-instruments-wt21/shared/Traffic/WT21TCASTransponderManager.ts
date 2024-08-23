import { ControlEvents, EventBus, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

import { TcasOperatingModeSetting, TrafficUserSettings } from './TrafficUserSettings';

/**
 * Manages automatic setting of TCAS and transponder modes such that TCAS is set to standby if transponder mode is not
 * altitude reporting and transponder is set to altitude reporting if TCAS mode is not standby.
 */
export class WT21TCASTransponderManager {
  private readonly settings = TrafficUserSettings.getManager(this.bus);

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
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
    });

    sub.on('xpdr_mode_1').whenChanged().handle(mode => {
      if (mode !== XPDRMode.ALT) {
        this.settings.getSetting('trafficOperatingMode').value = TcasOperatingModeSetting.Standby;
      }
    });
  }
}