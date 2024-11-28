import { Subscription, UserSettingManager } from '@microsoft/msfs-sdk';
import {
  MapDeclutterSettingMode, MapTerrainSettingMode, MapUserSettingTypes, SoftKeyBooleanController, SoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem
} from '@microsoft/msfs-garminsdk';
import { DisplayPaneControlEvents, DisplayPaneIndex, PfdIndex, PfdMapLayoutSettingMode, PfdMapLayoutUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { SoftKeyWeatherOverlayController } from './SoftKeyWeatherOverlayController';

/**
 * The PFD map settings softkey menu.
 */
export class PfdMapSettingsSoftKeyMenu extends SoftKeyMenu {

  private readonly declutterController?: SoftKeyEnumController<MapDeclutterSettingMode>;
  private readonly trafficController?: SoftKeyBooleanController;
  private readonly terrainController?: SoftKeyEnumController<MapTerrainSettingMode>;
  private readonly weatherController?: SoftKeyWeatherOverlayController;

  private readonly subs: Subscription[] = [];

  /**
   * Creates an instance of the PFD map settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param pfdIndex The index of the PFD instrument to which this menu belongs.
   * @param mapLayoutSettingManager A manager for map layout settings for this menu's PFD.
   * @param mapSettingManager A manager for map settings for the inset/HSI maps on this menu's PFD.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    private readonly pfdIndex: PfdIndex,
    mapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>,
    mapSettingManager: UserSettingManager<MapUserSettingTypes>,
    isSplit: boolean
  ) {
    super(menuSystem);

    if (isSplit) {
      this.buildSplitMode(mapLayoutSettingManager);
    } else {
      this.buildFullMode(mapLayoutSettingManager, mapSettingManager);
    }
  }

  /**
   * Builds a full-mode menu.
   * @param mapLayoutSettingManager A manager for map layout settings for this menu's PFD.
   * @param mapSettingManager A manager for map settings for the inset/HSI maps on this menu's PFD.
   */
  private buildFullMode(
    mapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>,
    mapSettingManager: UserSettingManager<MapUserSettingTypes>
  ): void {
    this.addItem(0, 'Map Layout', () => { this.menuSystem.pushMenu('map-layout'); });
    const dataLinkItem = this.addItem(6, 'Data Link\nSettings', () => { this.menuSystem.pushMenu('data-link-settings'); });
    this.addItem(8, 'Connext\nLightning');
    this.addItem(9, 'METAR');
    this.addItem(10, 'Back', () => { this.menuSystem.back(); });

    const mapLayoutSetting = mapLayoutSettingManager.getSetting('pfdMapLayout');

    (this.declutterController as SoftKeyEnumController<MapDeclutterSettingMode>) = new SoftKeyEnumController(
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

    (this.trafficController as SoftKeyBooleanController) = new SoftKeyBooleanController(
      this, 3, 'Traffic',
      mapSettingManager.getSetting('mapTrafficShow')
    );

    (this.terrainController as SoftKeyEnumController<MapTerrainSettingMode>) = new SoftKeyEnumController(
      this, 5, 'Terrain',
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

    (this.weatherController as SoftKeyWeatherOverlayController) = new SoftKeyWeatherOverlayController(this, 7, 'WX Overlay', mapSettingManager);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const declutterItem = this.declutterController!.init();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const trafficItem = this.trafficController!.init();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const terrainItem = this.terrainController!.init();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const weatherItem = this.weatherController!.init();

    this.subs.push(mapLayoutSetting.sub(mapLayout => {
      const disabled = mapLayout === PfdMapLayoutSettingMode.Off || mapLayout === PfdMapLayoutSettingMode.Traffic;

      declutterItem.disabled.set(disabled);
      trafficItem.disabled.set(disabled);
      terrainItem.disabled.set(disabled);
      weatherItem.disabled.set(disabled);
      dataLinkItem.disabled.set(disabled);
    }, true));
  }

  /**
   * Builds a split-mode menu.
   * @param mapLayoutSettingManager A manager for map layout settings for this menu's PFD.
   */
  private buildSplitMode(
    mapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>
  ): void {
    this.addItem(3, 'WX Radar\nControls');
    const mapOverlaysItem = this.addItem(4, 'Map\nOverlays', () => { this.menuSystem.pushMenu('map-overlays-1'); });
    this.addItem(5, 'Back', () => { this.menuSystem.back(); });

    const displayPaneIndex = this.pfdIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument;

    const mapLayoutSetting = mapLayoutSettingManager.getSetting('pfdMapLayout');

    const hsiItem = this.addItem(0, 'HSI Map', () => {
      if (mapLayoutSetting.value === PfdMapLayoutSettingMode.Hsi) {
        mapLayoutSetting.value = PfdMapLayoutSettingMode.Off;
      } else {
        mapLayoutSetting.value = PfdMapLayoutSettingMode.Hsi;
      }
    });

    this.subs.push(mapLayoutSetting.pipe(hsiItem.value, layout => layout === PfdMapLayoutSettingMode.Hsi));

    const mapRangeDecItem = this.addItem(1, 'Map\nRange -', () => {
      this.menuSystem.bus.getPublisher<DisplayPaneControlEvents>().pub('display_pane_view_event', {
        displayPaneIndex,
        eventType: 'display_pane_map_range_dec',
        eventData: undefined,
      }, true);
    });
    const mapRangeIncItem = this.addItem(2, 'Map\nRange +', () => {
      this.menuSystem.bus.getPublisher<DisplayPaneControlEvents>().pub('display_pane_view_event', {
        displayPaneIndex,
        eventType: 'display_pane_map_range_inc',
        eventData: undefined,
      }, true);
    });

    this.subs.push(mapLayoutSetting.sub(mapLayout => {
      const disabled = mapLayout !== PfdMapLayoutSettingMode.Hsi;

      mapOverlaysItem.disabled.set(disabled);
      mapRangeDecItem.disabled.set(disabled);
      mapRangeIncItem.disabled.set(disabled);
    }, true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.declutterController?.destroy();
    this.trafficController?.destroy();
    this.terrainController?.destroy();
    this.weatherController?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}