import { TrafficOperatingModeSetting, TrafficUserSettings } from '../../../../Shared/Traffic/TrafficUserSettings';
import { MenuSystem } from '../../../../Shared/UI/Menus/MenuSystem';
import { MFDRootMenu } from '../../../../Shared/UI/Menus/MFD/MFDRootMenu';
import { MultipleSoftKeyUserSettingController, SoftKeyBooleanUserSettingController } from '../../../../Shared/UI/Menus/SoftKeyUserSettingControllers';

/**
 * The MFD traffic map page root softkey menu.
 */
export class MFDTrafficMapRootMenu extends MFDRootMenu {

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.menuSystem.bus);

  private readonly operatingModeController = new MultipleSoftKeyUserSettingController(
    this, this.trafficSettingManager, 'trafficOperatingMode',
    [
      { index: 4, label: 'TAS STBY', value: TrafficOperatingModeSetting.Standby },
      { index: 5, label: 'TAS OPER', value: TrafficOperatingModeSetting.Operating }
    ]
  );

  private readonly adsbEnabledController = new SoftKeyBooleanUserSettingController(
    this, 2, 'ADS-B', this.trafficSettingManager, 'trafficAdsbEnabled'
  );

  /** @inheritdoc */
  constructor(menuSystem: MenuSystem) {
    super(menuSystem);

    this.addItem(6, 'Test', undefined, false);

    this.addItem(9, 'Motion', () => { this.menuSystem.pushMenu('traffic-motion'); });
    this.addItem(10, 'ALT Mode', () => { this.menuSystem.pushMenu('traffic-alt'); });

    this.operatingModeController.init();
    this.adsbEnabledController.init();
  }
}
