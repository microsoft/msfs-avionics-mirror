import { UserSettingManager } from '@microsoft/msfs-sdk';
import { MapDeclutterSettingMode, MapTerrainSettingMode, MapUserSettingTypes, SoftKeyBooleanController, SoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import { SoftKeyWeatherOverlayController } from './SoftKeyWeatherOverlayController';

/**
 * The map overlays 1 softkey menu.
 */
export class MapOverlays1SoftKeyMenu extends SoftKeyMenu {

  private readonly terrainController: SoftKeyEnumController<MapTerrainSettingMode>;
  private readonly weatherController: SoftKeyWeatherOverlayController;

  /**
   * Creates an instance of the map overlays 1 softkey menu.
   * @param menuSystem The softkey menu system.
   * @param mapSettingManager A manager for map settings for the inset/HSI maps on this menu's PFD.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    mapSettingManager: UserSettingManager<MapUserSettingTypes>
  ) {
    super(menuSystem);

    this.addItem(1, 'Data Link\nSettings', () => { this.menuSystem.pushMenu('data-link-settings-split'); });
    this.addItem(3, 'SiriusXM\nLightning');
    this.addItem(4, 'More', () => { this.menuSystem.pushMenu('map-overlays-2'); });
    this.addItem(5, 'Back', () => { this.menuSystem.back(); });

    this.terrainController = new SoftKeyEnumController(
      this, 0, 'Terrain',
      mapSettingManager.getSetting('mapTerrainMode'),
      value => {
        switch (value) {
          case MapTerrainSettingMode.Absolute:
            return 'Absolute';
          case MapTerrainSettingMode.Relative:
            return 'Relative';
          case MapTerrainSettingMode.None:
            return 'Off';
          default:
            return '';
        }
      },
      currentValue => {
        switch (currentValue) {
          case MapTerrainSettingMode.Absolute:
            return MapTerrainSettingMode.Relative;
          case MapTerrainSettingMode.Relative:
            return MapTerrainSettingMode.None;
          default:
            return MapTerrainSettingMode.Absolute;
        }
      }
    );

    this.weatherController = new SoftKeyWeatherOverlayController(this, 2, 'WX Overlay', mapSettingManager);

    this.terrainController.init();
    this.weatherController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.terrainController.destroy();
    this.weatherController.destroy();

    super.destroy();
  }
}

/**
 * The map overlays 2 softkey menu.
 */
export class MapOverlays2SoftKeyMenu extends SoftKeyMenu {

  private readonly declutterController: SoftKeyEnumController<MapDeclutterSettingMode>;
  private readonly trafficController: SoftKeyBooleanController;

  /**
   * Creates an instance of the map overlays 2 softkey menu.
   * @param menuSystem The softkey menu system.
   * @param mapSettingManager A manager for map settings for the inset/HSI maps on this menu's PFD.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    mapSettingManager: UserSettingManager<MapUserSettingTypes>
  ) {
    super(menuSystem);

    this.addItem(0, 'METAR');
    this.addItem(2, 'Weather\nLegend');
    this.addItem(5, 'Back', () => { this.menuSystem.back(); });

    this.declutterController = new SoftKeyEnumController(
      this, 1, 'Detail',
      mapSettingManager.getSetting('mapDeclutter'),
      value => {
        switch (value) {
          case MapDeclutterSettingMode.All:
            return 'All';
          case MapDeclutterSettingMode.Level3:
            return 'DCLTR 1';
          case MapDeclutterSettingMode.Level2:
            return 'DCLTR 2';
          case MapDeclutterSettingMode.Level1:
            return 'Least';
          default:
            return '';
        }
      },
      currentValue => {
        switch (currentValue) {
          case MapDeclutterSettingMode.All:
            return MapDeclutterSettingMode.Level3;
          case MapDeclutterSettingMode.Level3:
            return MapDeclutterSettingMode.Level2;
          case MapDeclutterSettingMode.Level2:
            return MapDeclutterSettingMode.Level1;
          default:
            return MapDeclutterSettingMode.All;
        }
      }
    );

    this.trafficController = new SoftKeyBooleanController(
      this, 3, 'Traffic',
      mapSettingManager.getSetting('mapTrafficShow')
    );

    this.declutterController.init();
    this.trafficController.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.declutterController.destroy();
    this.trafficController.destroy();

    super.destroy();
  }
}