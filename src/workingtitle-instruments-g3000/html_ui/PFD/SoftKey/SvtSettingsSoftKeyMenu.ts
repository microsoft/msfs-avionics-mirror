import { UserSettingManager } from '@microsoft/msfs-sdk';
import { SoftKeyBooleanController, SoftKeyMenu, SoftKeyMenuSystem, SynVisUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * The SVT settings softkey menu.
 */
export class SvtSettingsSoftKeyMenu extends SoftKeyMenu {

  private readonly pathwaysController: SoftKeyBooleanController;
  private readonly airportSignController: SoftKeyBooleanController;

  /**
   * Creates an instance of the SVT settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param svtSettingManager A manager for synthetic vision user settings.
   */
  constructor(menuSystem: SoftKeyMenuSystem, svtSettingManager: UserSettingManager<SynVisUserSettingTypes>) {
    super(menuSystem);

    //const svtEnabledSetting = svtSettingManager.getSetting('svtEnabled');

    this.pathwaysController = new SoftKeyBooleanController(this, 0, 'Pathways', svtSettingManager.getSetting('svtPathwaysShow'));
    this.airportSignController = new SoftKeyBooleanController(this, 1, 'Airport\nSigns', svtSettingManager.getSetting('svtAirportSignShow'));

    const pathwaysItem = this.pathwaysController.init();
    const airportSignItem = this.airportSignController.init();

    pathwaysItem.disabled.set(true);
    airportSignItem.disabled.set(true);

    //svtEnabledSetting.pipe(pathwaysItem.disabled, enabled => !enabled);
    //svtEnabledSetting.pipe(airportSignItem.disabled, enabled => !enabled);

    this.addItem(5, 'Back', () => { menuSystem.back(); });
  }

  /** @inheritdoc */
  public destroy(): void {
    this.pathwaysController.destroy();
    this.airportSignController.destroy();

    super.destroy();
  }
}