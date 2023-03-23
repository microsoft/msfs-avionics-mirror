import { MapSystemBuilder, MapSystemKeys, ReadonlyFloat64Array, Subscribable, Vec2Math } from '@microsoft/msfs-sdk';

import {
  NextGenConnextMapBuilder, NextGenConnextMapOptions, NextGenHsiMapBuilder, NextGenHsiMapOptions, NextGenNavMapBuilder, NextGenNavMapOptions,
  NextGenNearestMapBuilder, NextGenNearestMapOptions, NextGenProcMapBuilder, NextGenProcMapOptions, NextGenTrafficMapOptions,
  NextGenWaypointMapBuilder, NextGenWaypointMapOptions, TrafficMapBuilder
} from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '../../G3000FilePaths';
import { IauUserSettingManager } from '../../Settings/IauUserSettings';
import { DisplayPaneIndex } from '../DisplayPanes/DisplayPaneTypes';
import { MapDataIntegrityController, MapDataIntegrityControllerModules } from './Controllers/MapDataIntegrityController';
import { G3000MapRunwayDesignationImageCache } from './G3000MapRunwayDesignationImageCache';
import { MapConfig } from './MapConfig';
import { MapWaypointIconImageCache } from './MapWaypointIconImageCache';

import '../Common/NumberUnitDisplay.css';
import '../Common/LatLonDisplay.css';
import './Layers/MapCrosshairLayer.css';
import './Layers/MapDeadReckoningLayer.css';
import './Layers/MapPointerInfoLayer.css';
import './Layers/MapPointerLayer.css';
import './Indicators/MapBannerIndicator.css';
import './Indicators/MapDetailIndicator.css';
import './Indicators/MapNoGpsIndicator.css';
import './Indicators/MapOrientationIndicator.css';
import './Indicators/MapRelativeTerrainStatusIndicator.css';
import './Indicators/MapTerrainScaleIndicator.css';
import './Indicators/MapTrafficFailedIndicator.css';
import './Indicators/MapTrafficOffScaleIndicator.css';
import './Indicators/MapTrafficRelativeTerrainStatusIndicatorContainer.css';
import './Indicators/MapTrafficStatusIndicator.css';
import './Indicators/TrafficMapAdsbModeIndicator.css';
import './Indicators/TrafficMapAdsbOffBannerIndicator.css';
import './Indicators/TrafficMapAltitudeModeIndicator.css';
import './Indicators/TrafficMapFailedBannerIndicator.css';
import './Indicators/TrafficMapOperatingModeIndicator.css';
import './Indicators/TrafficMapStandbyBannerIndicator.css';
import './Map.css';
import './MapRangeDisplay.css';

/**
 * Options for the map's own airplane icon.
 */
export type MapOwnAirplaneIconOptions = {
  /** The size of the icon. */
  airplaneIconSize: number;

  /** The URI of the icon's image asset. */
  airplaneIconSrc: string;

  /** The anchor point of the icon. */
  airplaneIconAnchor: ReadonlyFloat64Array;

  /** The URI of the no-heading icon's image asset. */
  noHeadingAirplaneIconSrc?: string;

  /** The anchor point of the no-heading icon. */
  noHeadingAirplaneIconAnchor?: ReadonlyFloat64Array;
}

/**
 * Options to define from where a map sources its data.
 */
export type MapDataSourceOptions = {
  /** The index of the IAU (integrated avionics unit) from which the map sources its data. Defaults to `1`. */
  iauIndex?: number | Subscribable<number>;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;
};

/**
 * A G3000 map builder.
 */
export class MapBuilder {
  /**
   * Configures a map builder to generate a G3000 navigation map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If flight plan focus is supported, the module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added
   * to the map model and can be used to control the focus.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static navMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenNavMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'runwayDesignationImageCache' | 'noGpsBannerText'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenNavMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      runwayDesignationImageCache: G3000MapRunwayDesignationImageCache.getCache(),
      noGpsBannerText: 'NO FMS POSITION'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 NXi HSI map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static hsiMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenHsiMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'runwayDesignationImageCache'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenHsiMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      runwayDesignationImageCache: G3000MapRunwayDesignationImageCache.getCache()
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 waypoint map. The map is locked to a North Up orientation, targets
   * a highlighted waypoint, and follows the player airplane when there is no highlighted waypoint.
   *
   * The module `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule` is added to the map model and can be
   * used to control the highlighted waypoint.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the waypoint map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static waypointMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenWaypointMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'runwayDesignationImageCache' | 'noGpsBannerText'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenWaypointMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      runwayDesignationImageCache: G3000MapRunwayDesignationImageCache.getCache(),
      noGpsBannerText: 'NO FMS POSITION'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 nearest waypoint map.
   *
   * The module `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule` is added to the map model and can be
   * used to control the highlighted waypoint.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static nearestMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenNearestMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'runwayDesignationImageCache' | 'noGpsBannerText'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenNearestMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      runwayDesignationImageCache: G3000MapRunwayDesignationImageCache.getCache(),
      noGpsBannerText: 'NO FMS POSITION'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 procedure map. The map displays a flight plan procedure (departure,
   * arrival, approach) and its transitions, and is always focused on the displayed procedure. The map is also locked
   * to a North Up orientation.
   *
   * The module `[GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule` is added to the map model and can be
   * used to control the displayed procedure.
   *
   * The module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added to the map model and can be used
   * to control the procedure focus.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static procMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenProcMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'noGpsBannerText'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenProcMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      noGpsBannerText: 'NO FMS POSITION'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 Garmin traffic map. The map consists of an optional active flight
   * plan layer, an optional traffic range ring layer, a traffic intruder layer, an airplane icon layer, and an
   * optional mini-compass layer. The map is centered on the player airplane and is locked in Heading Up orientation.
   *
   * The controller `[GarminMapKeys.TrafficRange]: TrafficMapRangeController` is added to the map context and can be
   * used to control the range of the traffic map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static trafficMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenTrafficMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(TrafficMapBuilder.buildNextGen, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3000 Connext weather map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static connextMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: Omit<NextGenConnextMapOptions, 'waypointIconImageCache' | 'waypointStyleFontType' | 'runwayDesignationImageCache' | 'noGpsBannerText'> & MapDataSourceOptions
  ): MapBuilder {
    mapBuilder.with(NextGenConnextMapBuilder.build, {
      ...options,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'DejaVu',
      runwayDesignationImageCache: G3000MapRunwayDesignationImageCache.getCache(),
      noGpsBannerText: 'NO FMS POSITION'
    });

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.iauIndex ?? 1, options.iauSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Gets a set of standard options for the map's own airplane icon.
   * @param config The map configuration object defining the path to the own airplane icon's image asset.
   * @param includeNoHeadingIcon Whether to include the no-heading icon. Defaults to `true`.
   * @returns A set of standard options for the map's own airplane icon.
   */
  public static ownAirplaneIconOptions(config: MapConfig, includeNoHeadingIcon = true): MapOwnAirplaneIconOptions {
    const options: MapOwnAirplaneIconOptions = {
      airplaneIconSize: 35,
      airplaneIconSrc: config.ownAirplaneIconSrc,
      airplaneIconAnchor: Vec2Math.create(0.5, 0)
    };

    if (includeNoHeadingIcon) {
      options.noHeadingAirplaneIconSrc = `${G3000FilePaths.ASSETS_PATH}/Images/Map/airplane_nohdg.svg`;
      options.noHeadingAirplaneIconAnchor = Vec2Math.create(0.5, 0.5);
    }

    return options;
  }

  /**
   * Gets the URI for the mini-compass icon's image asset.
   * @returns The URI for the mini-compass icon's image asset.
   */
  public static miniCompassIconSrc(): string {
    return `${G3000FilePaths.ASSETS_PATH}/Images/Map/map_mini_compass.png`;
  }

  /**
   * Gets the URI for the relative terrain mode indicator icon's image asset.
   * @returns The URI for the relative terrain mode indicator icon's image asset.
   */
  public static relativeTerrainIconSrc(): string {
    return `${G3000FilePaths.ASSETS_PATH}/Images/Map/map_icon_relative_terrain.png`;
  }

  /**
   * Gets the index of the IAU (integrated avionics unit) used by a map on a specific display pane.
   * @param displayPaneIndex The index of the display pane on which the map appears.
   * @returns The index of the IAU (integrated avionics unit) used by a map on the specified display pane.
   */
  public static getIauIndexForDisplayPane(displayPaneIndex: DisplayPaneIndex): 1 | 2 {
    switch (displayPaneIndex) {
      case DisplayPaneIndex.RightPfd:
      case DisplayPaneIndex.RightPfdInstrument:
        return 2;
      default:
        return 1;
    }
  }
}