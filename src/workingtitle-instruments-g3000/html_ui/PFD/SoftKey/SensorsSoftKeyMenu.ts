import { SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';

/**
 * The sensors softkey menu.
 */
export class SensorsSoftKeyMenu extends SoftKeyMenu {

  /**
   * Creates an instance of the sensors softkey menu.
   * @param menuSystem The softkey menu system.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(menuSystem: SoftKeyMenuSystem, isSplit: boolean) {
    super(menuSystem);

    if (isSplit) {
      this.addItem(0, 'ADC\nSettings', () => { menuSystem.pushMenu('adc-settings-split'); });
      this.addItem(2, 'AHRS\nSettings', () => { menuSystem.pushMenu('ahrs-settings-split'); });
      this.addItem(5, 'Back', () => { menuSystem.back(); });
    } else {
      this.addItem(1, 'ADC\nSettings', () => { menuSystem.pushMenu('adc-settings'); });
      this.addItem(4, 'AHRS\nSettings', () => { menuSystem.pushMenu('ahrs-settings'); });
      this.addItem(10, 'Back', () => { menuSystem.back(); });
    }
  }
}