import { UserSettingManager } from '@microsoft/msfs-sdk';
import { AltimeterUserSettingTypes, MultipleSoftKeyEnumController, SoftKeyBooleanController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';

/**
 * The altitude units softkey menu.
 */
export class AltitudeUnitsSoftKeyMenu extends SoftKeyMenu {
  private readonly altMetricController: SoftKeyBooleanController;
  private readonly baroUnitsController: MultipleSoftKeyEnumController<boolean>;

  /**
   * Creates an instance of the altitude units softkey menu.
   * @param menuSystem The softkey menu system.
   * @param altimeterSettingManager A manager for altimeter settings for this menu's PFD.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    altimeterSettingManager: UserSettingManager<AltimeterUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    let altMetricSoftKeyIndex, inHgSoftKeyIndex, hpaSoftKeyIndex, backSoftKeyIndex;

    if (isSplit) {
      altMetricSoftKeyIndex = 0;
      inHgSoftKeyIndex = 2;
      hpaSoftKeyIndex = 3;
      backSoftKeyIndex = 5;
    } else {
      altMetricSoftKeyIndex = 5;
      inHgSoftKeyIndex = 7;
      hpaSoftKeyIndex = 8;
      backSoftKeyIndex = 10;
    }

    this.addItem(backSoftKeyIndex, 'Back', () => { menuSystem.back(); });

    this.altMetricController = new SoftKeyBooleanController(this, altMetricSoftKeyIndex, 'Meters', altimeterSettingManager.getSetting('altMetric'));

    this.baroUnitsController = new MultipleSoftKeyEnumController(
      this,
      altimeterSettingManager.getSetting('altimeterBaroMetric'),
      [
        {
          index: inHgSoftKeyIndex,
          label: 'IN',
          value: false
        },
        {
          index: hpaSoftKeyIndex,
          label: 'HPA',
          value: true
        }
      ]
    );

    this.altMetricController.init();
    this.baroUnitsController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.altMetricController.destroy();
    this.baroUnitsController.destroy();

    super.destroy();
  }
}