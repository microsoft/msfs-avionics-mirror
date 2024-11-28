import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MultipleSoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { WindDisplaySettingMode, WindDisplayUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The wind softkey menu.
 */
export class WindSoftKeyMenu extends SoftKeyMenu {
  private readonly windController: MultipleSoftKeyEnumController<WindDisplaySettingMode>;

  /**
   * Creates an instance of the wind softkey menu.
   * @param menuSystem The softkey menu system.
   * @param windDisplaySettingManager A manager for wind display user settings.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    windDisplaySettingManager: UserSettingManager<WindDisplayUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    this.addItem(isSplit ? 5 : 10, 'Back', () => { menuSystem.back(); });

    const indexOffset = isSplit ? 0 : 2;
    const offIndexOffset = isSplit ? 0 : 1;

    this.windController = new MultipleSoftKeyEnumController(
      this,
      windDisplaySettingManager.getSetting('windDisplayMode'),
      [
        {
          index: indexOffset,
          label: 'Option 1',
          value: WindDisplaySettingMode.Option1
        },
        {
          index: indexOffset + 1,
          label: 'Option 2',
          value: WindDisplaySettingMode.Option2
        },
        {
          index: indexOffset + 2,
          label: 'Option 3',
          value: WindDisplaySettingMode.Option3
        },
        {
          index: offIndexOffset + 4,
          label: 'Off',
          value: WindDisplaySettingMode.Off
        }
      ]
    );

    this.windController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.windController.destroy();

    super.destroy();
  }
}