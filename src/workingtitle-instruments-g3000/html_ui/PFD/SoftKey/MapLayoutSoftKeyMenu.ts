import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MultipleSoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { PfdMapLayoutSettingMode, PfdMapLayoutUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

/**
 * The map layout softkey menu.
 */
export class MapLayoutSoftKeyMenu extends SoftKeyMenu {
  private readonly layoutController: MultipleSoftKeyEnumController<PfdMapLayoutSettingMode>;

  /**
   * Creates an instance of the map layout softkey menu.
   * @param menuSystem The softkey menu system.
   * @param mapLayoutSettingManager A manager for map layout settings for this menu's PFD.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    mapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>
  ) {
    super(menuSystem);

    this.addItem(10, 'Back', () => { menuSystem.back(); });

    this.layoutController = new MultipleSoftKeyEnumController(
      this,
      mapLayoutSettingManager.getSetting('pfdMapLayout'),
      [
        {
          index: 0,
          label: 'Map Off',
          value: PfdMapLayoutSettingMode.Off
        },
        {
          index: 1,
          label: 'Inset Map',
          value: PfdMapLayoutSettingMode.Inset
        },
        {
          index: 2,
          label: 'HSI Map',
          value: PfdMapLayoutSettingMode.Hsi
        },
      ]
    );

    this.layoutController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.layoutController.destroy();

    super.destroy();
  }
}