import { MapIndexedRangeModule, MapSystemContext, MapSystemController, MapSystemKeys, Subject, UserSettingManager } from '@microsoft/msfs-sdk';

import { AirportSize } from '../../../navigation/AirportWaypoint';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapDeclutterMode, MapDeclutterModule } from '../modules/MapDeclutterModule';
import { MapWaypointsModule } from '../modules/MapWaypointsModule';
import { MapSymbolVisController } from './MapSymbolVisController';

/**
 * User settings controlling the visibility of map waypoints.
 */
export type MapWaypointVisUserSettings = Pick<
  MapUserSettingTypes,
  'mapAirportLargeRangeIndex'
  | 'mapAirportLargeShow'
  | 'mapAirportMediumRangeIndex'
  | 'mapAirportMediumShow'
  | 'mapAirportSmallRangeIndex'
  | 'mapAirportSmallShow'
  | 'mapIntersectionRangeIndex'
  | 'mapIntersectionShow'
  | 'mapNdbRangeIndex'
  | 'mapNdbShow'
  | 'mapVorRangeIndex'
  | 'mapVorShow'
  | 'mapUserWaypointRangeIndex'
  | 'mapUserWaypointShow'
>;

/**
 * Modules required by MapWaypointsVisController.
 */
export interface MapWaypointsVisControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Range module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointsModule;

  /** Declutter module. */
  [GarminMapKeys.Declutter]?: MapDeclutterModule;
}

/**
 * Configuration options for {@link MapWaypointsVisController}.
 */
export type MapWaypointsVisControllerOptions = {
  /**
   * The highest global declutter mode, inclusive, at which large airports should remain visible. Defaults to
   * {@link MapDeclutterMode.Level2}.
   */
  airportLargeMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which medium airports should remain visible. Defaults to
   * {@link MapDeclutterMode.Level2}.
   */
  airportMediumMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which small airports should remain visible. Defaults to
   * {@link MapDeclutterMode.Level2}.
   */
  airportSmallMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which VORs should remain visible. Defaults to
   * {@link MapDeclutterMode.Level3}.
   */
  vorMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which NDBs should remain visible. Defaults to
   * {@link MapDeclutterMode.Level3}.
   */
  ndbMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which intersections should remain visible. Defaults to
   * {@link MapDeclutterMode.Level3}.
   */
  intMaxDeclutterMode?: MapDeclutterMode;

  /**
   * The highest global declutter mode, inclusive, at which user waypoints should remain visible. Defaults to
   * {@link MapDeclutterMode.Level3}.
   */
  userMaxDeclutterMode?: MapDeclutterMode;
};

/**
 * Controls the visibility of map waypoint symbols.
 */
export class MapWaypointsVisController extends MapSystemController<MapWaypointsVisControllerModules> {
  private readonly waypointsModule = this.context.model.getModule(MapSystemKeys.NearestWaypoints);

  private readonly controllers: MapSymbolVisController[] = [];

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling waypoint visibility.
   * @param options Options with which to configure the controller.
   */
  constructor(
    context: MapSystemContext<MapWaypointsVisControllerModules, any, any, any>,
    settingManager: UserSettingManager<Partial<MapWaypointVisUserSettings>>,
    options?: Readonly<MapWaypointsVisControllerOptions>
  ) {
    super(context);

    const airportLargeShow = settingManager.tryGetSetting('mapAirportLargeShow');
    const airportLargeRangeIndex = settingManager.tryGetSetting('mapAirportLargeRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (airportLargeShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        airportLargeShow,
        airportLargeRangeIndex,
        options?.airportLargeMaxDeclutterMode ?? MapDeclutterMode.Level2,
        this.waypointsModule.airportShow[AirportSize.Large]
      ));
    }

    const airportMediumShow = settingManager.tryGetSetting('mapAirportMediumShow');
    const airportMediumRangeIndex = settingManager.tryGetSetting('mapAirportMediumRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (airportMediumShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        airportMediumShow,
        airportMediumRangeIndex,
        options?.airportMediumMaxDeclutterMode ?? MapDeclutterMode.Level2,
        this.waypointsModule.airportShow[AirportSize.Medium]
      ));
    }

    const airportSmallShow = settingManager.tryGetSetting('mapAirportSmallShow');
    const airportSmallRangeIndex = settingManager.tryGetSetting('mapAirportSmallRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (airportSmallShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        airportSmallShow,
        airportSmallRangeIndex,
        options?.airportSmallMaxDeclutterMode ?? MapDeclutterMode.Level2,
        this.waypointsModule.airportShow[AirportSize.Small]
      ));
    }

    const vorShow = settingManager.tryGetSetting('mapVorShow');
    const vorRangeIndex = settingManager.tryGetSetting('mapVorRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (vorShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        vorShow,
        vorRangeIndex,
        options?.vorMaxDeclutterMode ?? MapDeclutterMode.Level3,
        this.waypointsModule.vorShow
      ));
    }

    const ndbShow = settingManager.tryGetSetting('mapNdbShow');
    const ndbRangeIndex = settingManager.tryGetSetting('mapNdbRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (ndbShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        ndbShow,
        ndbRangeIndex,
        options?.ndbMaxDeclutterMode ?? MapDeclutterMode.Level3,
        this.waypointsModule.ndbShow
      ));
    }

    const intersectionShow = settingManager.tryGetSetting('mapIntersectionShow');
    const intersectionRangeIndex = settingManager.tryGetSetting('mapIntersectionRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (intersectionShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        intersectionShow,
        intersectionRangeIndex,
        options?.intMaxDeclutterMode ?? MapDeclutterMode.Level3,
        this.waypointsModule.intShow
      ));
    }

    const userShow = settingManager.tryGetSetting('mapUserWaypointShow');
    const userRangeIndex = settingManager.tryGetSetting('mapUserWaypointRangeIndex') ?? Subject.create(Number.MAX_SAFE_INTEGER);
    if (userShow) {
      this.controllers.push(new MapSymbolVisController(
        context,
        userShow,
        userRangeIndex,
        options?.userMaxDeclutterMode ?? MapDeclutterMode.Level3,
        this.waypointsModule.userShow
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