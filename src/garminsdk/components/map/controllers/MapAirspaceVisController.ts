import { MapAirspaceModule, MapIndexedRangeModule, MapSystemContext, MapSystemController, MapSystemKeys, Subject, UserSettingManager } from 'msfssdk';

import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { AirspaceShowType, GarminAirspaceShowTypes } from '../modules/MapAirspaceShowTypes';
import { MapDeclutterMode, MapDeclutterModule } from '../modules/MapDeclutterModule';
import { MapSymbolVisController } from './MapSymbolVisController';

/**
 * User settings controlling the visibility of map airspaces.
 */
export type MapAirspaceVisUserSettings = Pick<
  MapUserSettingTypes,
  'mapAirspaceClassBRangeIndex'
  | 'mapAirspaceClassBShow'
  | 'mapAirspaceClassCRangeIndex'
  | 'mapAirspaceClassCShow'
  | 'mapAirspaceClassDRangeIndex'
  | 'mapAirspaceClassDShow'
  | 'mapAirspaceMoaRangeIndex'
  | 'mapAirspaceMoaShow'
  | 'mapAirspaceRestrictedRangeIndex'
  | 'mapAirspaceRestrictedShow'
  | 'mapAirspaceOtherRangeIndex'
  | 'mapAirspaceOtherShow'
>;

/**
 * Modules required for MapAirspaceVisController.
 */
export interface MapAirspaceVisControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Airspace module. */
  [MapSystemKeys.Airspace]: MapAirspaceModule<GarminAirspaceShowTypes>;

  /** Declutter module. */
  [GarminMapKeys.Declutter]?: MapDeclutterModule;
}

/**
 * Controls the visibility of map airspace boundaries.
 */
export class MapAirspaceVisController extends MapSystemController<MapAirspaceVisControllerModules> {
  private readonly airspaceModule = this.context.model.getModule(MapSystemKeys.Airspace);

  private readonly controllers: MapSymbolVisController[] = [];

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling airspace visibility.
   */
  constructor(
    context: MapSystemContext<MapAirspaceVisControllerModules, any, any, any>,
    settingManager: UserSettingManager<Partial<MapAirspaceVisUserSettings>>
  ) {
    super(context);

    const classBShow = settingManager.tryGetSetting('mapAirspaceClassBShow');
    const classBRangeIndex = settingManager.tryGetSetting('mapAirspaceClassBRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (classBShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        classBShow,
        classBRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.ClassB]
      ));
    }

    const classCShow = settingManager.tryGetSetting('mapAirspaceClassCShow');
    const classCRangeIndex = settingManager.tryGetSetting('mapAirspaceClassCRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (classCShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        classCShow,
        classCRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.ClassC]
      ));
    }

    const classDShow = settingManager.tryGetSetting('mapAirspaceClassDShow');
    const classDRangeIndex = settingManager.tryGetSetting('mapAirspaceClassDRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (classDShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        classDShow,
        classDRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.ClassD]
      ));
    }

    const moaShow = settingManager.tryGetSetting('mapAirspaceMoaShow');
    const moaRangeIndex = settingManager.tryGetSetting('mapAirspaceMoaRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (moaShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        moaShow,
        moaRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.MOA]
      ));
    }

    const restrictedShow = settingManager.tryGetSetting('mapAirspaceRestrictedShow');
    const restrictedRangeIndex = settingManager.tryGetSetting('mapAirspaceRestrictedRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (restrictedShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        restrictedShow,
        restrictedRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.Restricted]
      ));
    }

    const otherShow = settingManager.tryGetSetting('mapAirspaceOtherShow');
    const otherRangeIndex = settingManager.tryGetSetting('mapAirspaceOtherRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (otherShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        otherShow,
        otherRangeIndex,
        MapDeclutterMode.Level3,
        this.airspaceModule.show[AirspaceShowType.Other]
      ));
    }
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.controllers.forEach(controller => { controller.onAfterMapRender(); });
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.controllers.forEach(controller => { controller.destroy(); });
  }
}