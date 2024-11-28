import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MultipleSoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { PfdSensorsUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The AHRS settings softkey menu.
 */
export class AhrsSettingsSoftKeyMenu extends SoftKeyMenu {
  private readonly sensorController: MultipleSoftKeyEnumController<number>;

  /**
   * Creates an instance of the AHRS settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param ahrsCount The number of AHRS systems supported. If greater than 8, only the first 8 systems will be
   * selectable.
   * @param sensorsSettingManager A manager for sensor settings for this menu's PFD.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  public constructor(
    menuSystem: SoftKeyMenuSystem,
    ahrsCount: number,
    sensorsSettingManager: UserSettingManager<PfdSensorsUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    this.addItem(isSplit ? 5 : 10, 'Back', () => { menuSystem.back(); });

    const indexOffset = isSplit ? -1 : 0;

    this.sensorController = new MultipleSoftKeyEnumController(
      this,
      sensorsSettingManager.getSetting('pfdAhrsIndex'),
      Array.from({ length: Math.min(ahrsCount, 8) }, (value, index) => {
        const adcIndex = index + 1;
        return {
          index: adcIndex + indexOffset,
          label: `AHRS ${adcIndex}`,
          value: adcIndex
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