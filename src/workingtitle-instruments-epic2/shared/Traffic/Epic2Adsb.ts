import { Adsb, AdsbOperatingMode, ConsumerSubject } from '@microsoft/msfs-sdk';

import { AirGroundDataProviderEvents } from '../Instruments';
import { TrafficUserSettings } from '../Settings';

/**
 * An Epic2 ADS-B system.
 */
export class Epic2Adsb extends Adsb {
  private readonly adsbEnabledSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficAdsbEnabled');

  private readonly onGround = ConsumerSubject.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), true);

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.adsbEnabledSetting.sub(isEnabled => {
      const nonStbyMode = this.onGround.get() ? AdsbOperatingMode.Surface : AdsbOperatingMode.Airborne;
      this.operatingMode.set(isEnabled ? nonStbyMode : AdsbOperatingMode.Standby);
    }, true);

    this.onGround.sub((onGround) => {
      const isOperating = this.operatingMode.get() !== AdsbOperatingMode.Standby;

      if (isOperating) {
        this.operatingMode.set(onGround ? AdsbOperatingMode.Surface : AdsbOperatingMode.Airborne);
      }
    });
  }
}
