import { Subscription, UserSettingManager } from '@microsoft/msfs-sdk';
import { SoftKeyBooleanController, SoftKeyMenu, SoftKeyMenuSystem, SynVisUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * The attitude overlays softkey menu.
 */
export class AttitudeOverlaysSoftKeyMenu extends SoftKeyMenu {

  private readonly svtEnabledController: SoftKeyBooleanController;
  private readonly headingLabelController: SoftKeyBooleanController;

  private readonly pathwaysController?: SoftKeyBooleanController;
  private readonly airportSignController?: SoftKeyBooleanController;

  private readonly subs: Subscription[] = [];

  /**
   * Creates an instance of the attitude overlays softkey menu.
   * @param menuSystem The softkey menu system.
   * @param svtSettingManager A manager for synthetic vision user settings.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    svtSettingManager: UserSettingManager<SynVisUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    const svtEnabledSetting = svtSettingManager.getSetting('svtEnabled');

    this.svtEnabledController = new SoftKeyBooleanController(this, 1, 'Synthetic\nTerrain', svtEnabledSetting);
    this.headingLabelController = new SoftKeyBooleanController(this, 2, 'Horizon\nHeading', svtSettingManager.getSetting('svtHeadingLabelShow'));

    this.svtEnabledController.init();
    const headingLabelItem = this.headingLabelController.init();

    this.subs.push(svtEnabledSetting.pipe(headingLabelItem.disabled, enabled => !enabled));

    if (isSplit) {
      const svtSettingsItem = this.addItem(0, 'SVT\nSettings', () => { menuSystem.pushMenu('svt-settings'); });

      this.subs.push(svtEnabledSetting.pipe(svtSettingsItem.disabled, enabled => !enabled));

      this.addItem(5, 'Back', () => { menuSystem.back(); });
    } else {
      this.pathwaysController = new SoftKeyBooleanController(this, 0, 'Pathways', svtSettingManager.getSetting('svtPathwaysShow'));
      this.airportSignController = new SoftKeyBooleanController(this, 3, 'Airport\nSigns', svtSettingManager.getSetting('svtAirportSignShow'));

      const pathwaysItem = this.pathwaysController.init();
      const airportSignItem = this.airportSignController.init();

      pathwaysItem.disabled.set(true);
      airportSignItem.disabled.set(true);

      //svtEnabledSetting.pipe(pathwaysItem.disabled, enabled => !enabled);
      //svtEnabledSetting.pipe(airportSignItem.disabled, enabled => !enabled);

      this.addItem(10, 'Back', () => { menuSystem.back(); });
    }
  }

  /** @inheritdoc */
  public destroy(): void {
    this.svtEnabledController.destroy();
    this.headingLabelController.destroy();
    this.pathwaysController?.destroy();
    this.airportSignController?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}