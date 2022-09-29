import { Adsb, AdsbOperatingMode } from 'msfssdk';

import { TrafficUserSettings } from '../settings/TrafficUserSettings';

/**
 * A Garmin ADS-B system.
 */
export class GarminAdsb extends Adsb {
  private readonly adsbEnabledSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficAdsbEnabled');

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.adsbEnabledSetting.sub(isEnabled => {
      // TODO: Support surface mode
      this.operatingMode.set(isEnabled ? AdsbOperatingMode.Airborne : AdsbOperatingMode.Standby);
    }, true);
  }
}