import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MultipleSoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { PfdIndex, PfdSensorsUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The ADC settings softkey menu.
 */
export class AdcSettingsSoftKeyMenu extends SoftKeyMenu {
  private readonly sensorController: MultipleSoftKeyEnumController<number>;

  /**
   * Creates an instance of the ADC settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param pfdIndex The index of the menu's parent PFD.
   * @param adcCount The number of ADC systems supported. Only the first 4 systems will be selectable.
   * @param sensorsSettingManager A manager for sensor settings for this menu's PFD.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  public constructor(
    menuSystem: SoftKeyMenuSystem,
    pfdIndex: PfdIndex,
    adcCount: number,
    sensorsSettingManager: UserSettingManager<PfdSensorsUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    this.addItem(isSplit ? 5 : 10, 'Back', () => { menuSystem.back(); });

    const indexOffset = isSplit ? -1 : 0;
    const adcIndexOffset = (pfdIndex - 1) * adcCount;

    this.sensorController = new MultipleSoftKeyEnumController(
      this,
      sensorsSettingManager.getSetting('pfdAdcIndex'),
      Array.from({ length: Math.min(adcCount, 4) }, (value, index) => {
        const nominalAdcIndex = index + 1;
        return {
          index: nominalAdcIndex + indexOffset,
          label: `ADC ${nominalAdcIndex}`,
          value: nominalAdcIndex + adcIndexOffset
        };
      })
    );

    this.sensorController.init();
  }

  /** @inheritDoc */
  public destroy(): void {
    this.sensorController.destroy();

    super.destroy();
  }
}