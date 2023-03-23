import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MultipleSoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { IauUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The ADC settings softkey menu.
 */
export class AdcSettingsSoftKeyMenu extends SoftKeyMenu {
  private readonly sensorController: MultipleSoftKeyEnumController<number>;

  /**
   * Creates an instance of the ADC settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param adcCount The number of ADC systems supported. Only the first 4 systems will be selectable.
   * @param sensorsSettingManager A manager for sensor settings for this menu's PFD.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    adcCount: number,
    sensorsSettingManager: UserSettingManager<IauUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    this.addItem(isSplit ? 5 : 10, 'Back', () => { menuSystem.back(); });

    const indexOffset = isSplit ? -1 : 0;

    this.sensorController = new MultipleSoftKeyEnumController(
      this,
      sensorsSettingManager.getSetting('iauAdcIndex'),
      Array.from({ length: Math.min(adcCount, 4) }, (value, index) => {
        const adcIndex = index + 1;
        return {
          index: adcIndex + indexOffset,
          label: `ADC ${adcIndex}`,
          value: adcIndex
        };
      })
    );

    this.sensorController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.sensorController.destroy();

    super.destroy();
  }
}