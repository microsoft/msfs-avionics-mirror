import { UserSettingManager } from '@microsoft/msfs-sdk';
import { SoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { AoaIndicatorDisplaySettingMode, AoaIndicatorUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The other PFD settings softkey menu.
 */
export class OtherPfdSettingsSoftKeyMenu extends SoftKeyMenu {

  private readonly aoaController: SoftKeyEnumController<AoaIndicatorDisplaySettingMode>;

  /**
   * Creates an instance of the other PFD settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param aoaSettingManager A manager for angle of attack indicator settings.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    aoaSettingManager: UserSettingManager<AoaIndicatorUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    let backSoftKeyIndex;

    if (isSplit) {
      backSoftKeyIndex = 5;

      this.addItem(0, 'Wind', () => { menuSystem.pushMenu('wind-split'); });
      this.addItem(2, 'Altitude\nUnits', () => { menuSystem.pushMenu('altitude-units-split'); });
      this.addItem(4, 'Sensors', () => { menuSystem.pushMenu('sensors-split'); });
    } else {
      backSoftKeyIndex = 10;

      this.addItem(0, 'Wind', () => { menuSystem.pushMenu('wind'); });
      this.addItem(2, 'Altitude\nUnits', () => { menuSystem.pushMenu('altitude-units'); });
    }

    this.addItem(backSoftKeyIndex, 'Back', () => { menuSystem.back(); });

    this.aoaController = new SoftKeyEnumController(
      this,
      1,
      'AoA',
      aoaSettingManager.getSetting('aoaDisplayMode'),
      value => {
        switch (value) {
          case AoaIndicatorDisplaySettingMode.Auto:
            return 'Auto';
          case AoaIndicatorDisplaySettingMode.On:
            return 'On';
          case AoaIndicatorDisplaySettingMode.Off:
            return 'Off';
          default:
            return '';
        }
      },
      currentValue => {
        switch (currentValue) {
          case AoaIndicatorDisplaySettingMode.Auto:
            return AoaIndicatorDisplaySettingMode.On;
          case AoaIndicatorDisplaySettingMode.On:
            return AoaIndicatorDisplaySettingMode.Off;
          default:
            return AoaIndicatorDisplaySettingMode.Auto;
        }
      }
    );

    this.aoaController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.aoaController.destroy();

    super.destroy();
  }
}