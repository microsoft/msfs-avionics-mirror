import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MapDeclutterSettingMode, MapUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { MapUserSettings, SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';

/**
 * The SR22T Softkey Root Menu.
 */
export class Sr22tMfdRootMenu extends SoftKeyMenu {
  private static readonly DECLUTTER_TEXT = {
    [MapDeclutterSettingMode.All]: 'Detail All',
    [MapDeclutterSettingMode.Level3]: 'Detail-1',
    [MapDeclutterSettingMode.Level2]: 'Detail-2',
    [MapDeclutterSettingMode.Level1]: 'Detail-3',
  };

  private readonly mapSettings: UserSettingManager<MapUserSettingTypes>;

  /**
   * Creates an instance of the SR22T root softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private viewService: ViewService) {
    super(menuSystem);

    this.mapSettings = MapUserSettings.getMfdManager(this.menuSystem.bus);

    this.addItem(0, 'Engine', this.onEngineKeyPressed.bind(this));
    this.addItem(2, 'Map Opt', () => this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.MapOptions));
    this.addItem(9, 'Detail', this.cycleMapDeclutterLevel.bind(this));
    this.addItem(11, 'Checklist', this.onChecklistKeyPressed.bind(this));

    // for charts and checklist plugin compatibility, use the existing menu items if they exist

    const existingChartsItem = this.menuSystem.getMenu(Sr22tMfdSoftkeyMenuTypes.Root)?.getItem(10);
    if (existingChartsItem) {
      this.addItem(
        10,
        'Charts',
        existingChartsItem.handler,
        existingChartsItem.value?.get(),
        existingChartsItem.disabled?.get());
    } else {
      this.addItem(10, 'Charts', () => { }, undefined, true);
    }

    this.initSettings();
  }

  /**
   * Sets the map model to use for these options.
   */
  private initSettings(): void {
    this.mapSettings
      .whenSettingChanged('mapDeclutter')
      .handle(v => this.getItem(9).label.set(Sr22tMfdRootMenu.DECLUTTER_TEXT[v]));
  }

  /** Opens Engine page if not opened yet, returns to map page if opened */
  private onEngineKeyPressed(): void {
    this.viewService.open('Sr22tEnginePage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Engine);
  }

  /** Opens checklist page */
  private onChecklistKeyPressed(): void {
    this.viewService.open('Sr22tChecklistPage');
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.Checklist);
  }

  /**
   * Cycles Map declutter levels. The levels are inverted from the default G1000 declutter levels.
   * Detail All (No Declutter): All map features visible
   * Detail-1: Declutters land data
   * Detail-2: Declutters land and SUA data
   * Detail-3: Removes everything except the active flight plan
   **/
  private cycleMapDeclutterLevel(): void {
    const setting = this.mapSettings.getSetting('mapDeclutter');
    switch (setting.get()) {
      case MapDeclutterSettingMode.All:
        setting.set(MapDeclutterSettingMode.Level3);
        break;
      case MapDeclutterSettingMode.Level3:
        setting.set(MapDeclutterSettingMode.Level2);
        break;
      case MapDeclutterSettingMode.Level2:
        setting.set(MapDeclutterSettingMode.Level1);
        break;
      case MapDeclutterSettingMode.Level1:
        setting.set(MapDeclutterSettingMode.All);
        break;
      default:
        setting.set(MapDeclutterSettingMode.All);
    }
  }
}
